package com.mieayamproject.yuda.pip

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.util.ArrayDeque

class YudaAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "YudaAccessibility"

        var isServiceConnected = false
            private set

        const val INSTAGRAM_PACKAGE = "com.instagram.android"
        const val TIKTOK_PACKAGE = "com.zhiliaoapp.musically"
        const val TIKTOK_PACKAGE_ID = "com.ss.android.ugc.trill"
        const val YOUTUBE_PACKAGE = "com.google.android.youtube"
        const val FACEBOOK_PACKAGE = "com.facebook.katana"
        const val FACEBOOK_LITE_PACKAGE = "com.facebook.lite"
        const val THREADS_PACKAGE = "com.instagram.barcelona"
        const val TWITTER_PACKAGE = "com.twitter.android"
        const val TWITTER_LITE_PACKAGE = "com.twitter.android.lite"

        var currentForegroundPackage: String? = null
            private set
        var isTargetAppActive: Boolean = false
            private set
        var isCurrentScreenReels: Boolean = false
            private set
    }

    private val handler = Handler(Looper.getMainLooper())
    private val idleHandler = Handler(Looper.getMainLooper())

    private var reelsSessionStartTime = 0L
    private var accumulatedReelsDurationMs = 0L
    private var isReelsTimerRunning = false

    private var lastScrollOrActivityTime = 0L
    private val IDLE_TIMEOUT_MS = 5 * 60 * 1000L

    private val idleCheckRunnable = object : Runnable {
        override fun run() {
            if (isReelsTimerRunning && isCurrentScreenReels) {
                val currentTime = System.currentTimeMillis()
                if (currentTime - lastScrollOrActivityTime > IDLE_TIMEOUT_MS) {
                    pauseReelsTimer("Pengguna idle / tidak aktif scrolling")
                } else {
                    idleHandler.postDelayed(this, 2500L)
                }
            }
        }
    }

    private val timerTicker = object : Runnable {
        override fun run() {
            if (isReelsTimerRunning && isCurrentScreenReels) {
                checkAndResetIfNewDay()
                val now = System.currentTimeMillis()
                val sessionDuration = now - reelsSessionStartTime
                val totalMs = accumulatedReelsDurationMs + sessionDuration

                sendTimerUpdateToOverlay(
                    currentForegroundPackage ?: "",
                    isReels = true,
                    totalMs = totalMs,
                    isRunning = true
                )

                handler.postDelayed(this, 1000L)
            }
        }
    }

    private fun getTodayDateString(): String {
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US)
        return sdf.format(java.util.Date())
    }

    private fun checkAndResetIfNewDay() {
        try {
            val prefs = getSharedPreferences("yuda_overlay_prefs", Context.MODE_PRIVATE)
            val savedDate = prefs.getString("last_accumulated_date", "") ?: ""
            val today = getTodayDateString()

            if (savedDate.isNotEmpty() && savedDate != today) {
                // Berganti hari -> reset total akumulasi
                accumulatedReelsDurationMs = 0L
                reelsSessionStartTime = System.currentTimeMillis()
                prefs.edit()
                    .putString("last_accumulated_date", today)
                    .putLong("total_reels_duration_ms", 0L)
                    .apply()
                Log.d(TAG, "Berganti tanggal ($savedDate -> $today): reset total akumulasi ke 0")
            } else if (savedDate.isEmpty()) {
                prefs.edit().putString("last_accumulated_date", today).apply()
            }
        } catch (e: Exception) {
            Log.w(TAG, "checkAndResetIfNewDay error: ${e.message}")
        }
    }

    private var isReceiverRegistered = false
    private val screenReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == Intent.ACTION_SCREEN_OFF) {
                stopAndSaveReelsTimer()
            }
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        isServiceConnected = true

        try {
            val filter = IntentFilter(Intent.ACTION_SCREEN_OFF)
            registerReceiver(screenReceiver, filter)
            isReceiverRegistered = true
        } catch (e: Exception) {
            Log.w(TAG, "Gagal register screenReceiver: ${e.message}")
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        val pkgName = event.packageName?.toString() ?: return

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                currentForegroundPackage = pkgName
                checkForegroundApp(pkgName, event)
            }
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                if (isTargetPackage(pkgName)) {
                    val inReels = isReelsOrShortsContext(pkgName, event)
                    if (inReels != isCurrentScreenReels) {
                        isCurrentScreenReels = inReels

                        if (inReels) {
                            startReelsTimer(System.currentTimeMillis())
                        } else {
                            stopAndSaveReelsTimer()
                        }
                    } else if (inReels && isCommentsOrShareSheetOpen()) {
                        pauseReelsTimer("Membuka komentar/sheet")
                    }
                }
            }
            AccessibilityEvent.TYPE_VIEW_SCROLLED -> {
                if (isTargetPackage(pkgName)) {
                    val inReels = isReelsOrShortsContext(pkgName, event)
                    isCurrentScreenReels = inReels

                    if (inReels) {
                        val now = System.currentTimeMillis()
                        lastScrollOrActivityTime = now

                        if (!isReelsTimerRunning) {
                            resumeReelsTimer(now)
                        } else {
                            idleHandler.removeCallbacks(idleCheckRunnable)
                            idleHandler.postDelayed(idleCheckRunnable, IDLE_TIMEOUT_MS)
                        }

                        notifyScrollDetected(pkgName, isReels = true)
                    }
                }
            }
        }
    }

    private fun getSavedAccumulatedMs(): Long {
        return try {
            val prefs = getSharedPreferences("yuda_overlay_prefs", Context.MODE_PRIVATE)
            prefs.getLong("total_reels_duration_ms", 0L)
        } catch (_: Exception) {
            0L
        }
    }

    private fun startReelsTimer(now: Long) {
        if (!isReelsTimerRunning) {
            checkAndResetIfNewDay()
            accumulatedReelsDurationMs = getSavedAccumulatedMs()
            reelsSessionStartTime = now
            lastScrollOrActivityTime = now
            isReelsTimerRunning = true

            idleHandler.removeCallbacks(idleCheckRunnable)
            idleHandler.postDelayed(idleCheckRunnable, IDLE_TIMEOUT_MS)

            handler.removeCallbacks(timerTicker)
            handler.post(timerTicker)
        }
    }

    private fun resumeReelsTimer(now: Long) {
        if (!isReelsTimerRunning) {
            checkAndResetIfNewDay()
            accumulatedReelsDurationMs = getSavedAccumulatedMs()
            reelsSessionStartTime = now
            lastScrollOrActivityTime = now
            isReelsTimerRunning = true

            idleHandler.removeCallbacks(idleCheckRunnable)
            idleHandler.postDelayed(idleCheckRunnable, IDLE_TIMEOUT_MS)

            handler.removeCallbacks(timerTicker)
            handler.post(timerTicker)
        }
    }

    private fun pauseReelsTimer(reason: String) {
        if (isReelsTimerRunning) {
            val now = System.currentTimeMillis()
            val sessionDuration = (now - reelsSessionStartTime).coerceAtLeast(0L)
            accumulatedReelsDurationMs += sessionDuration
            saveReelsDurationToStorage(accumulatedReelsDurationMs)

            isReelsTimerRunning = false
            idleHandler.removeCallbacks(idleCheckRunnable)
            handler.removeCallbacks(timerTicker)

            sendTimerUpdateToOverlay(
                currentForegroundPackage ?: "",
                isReels = isCurrentScreenReels,
                totalMs = accumulatedReelsDurationMs,
                isRunning = false
            )
        }
    }

    private fun stopAndSaveReelsTimer() {
        pauseReelsTimer("Keluar dari feed Reels / pindah aplikasi")
        isReelsTimerRunning = false
        idleHandler.removeCallbacks(idleCheckRunnable)
        handler.removeCallbacks(timerTicker)
    }

    private fun saveReelsDurationToStorage(totalMs: Long) {
        try {
            checkAndResetIfNewDay()
            val prefs = getSharedPreferences("yuda_overlay_prefs", Context.MODE_PRIVATE)
            prefs.edit().putLong("total_reels_duration_ms", totalMs).apply()
        } catch (e: Exception) {
            Log.w(TAG, "Gagal menyimpan durasi: ${e.message}")
        }
    }

    private fun checkForegroundApp(pkgName: String, event: AccessibilityEvent?) {
        val target = isTargetPackage(pkgName)
        val inReels = if (target) isReelsOrShortsContext(pkgName, event) else false

        if (target != isTargetAppActive || inReels != isCurrentScreenReels) {
            isTargetAppActive = target
            isCurrentScreenReels = inReels

            if (target && inReels) {
                startReelsTimer(System.currentTimeMillis())
            } else {
                stopAndSaveReelsTimer()
            }

            if (!YudaOverlayService.isRunning) return

            sendToOverlay(
                if (target) YudaOverlayService.ACTION_APP_FOREGROUND
                else YudaOverlayService.ACTION_APP_BACKGROUND,
                pkgName,
                inReels
            )
        }
    }

    private fun isTargetPackage(pkgName: String): Boolean {
        val targets = YudaPipModule.getTargetPackages(this)
        val lowerPkg = pkgName.lowercase()
        return targets.any { target ->
            val lowerTarget = target.lowercase()
            lowerPkg == lowerTarget ||
                (lowerTarget.contains("instagram") && lowerPkg.contains("instagram")) ||
                (lowerTarget.contains("tiktok") && (lowerPkg.contains("musically") || lowerPkg.contains("trill") || lowerPkg.contains("tiktok"))) ||
                (lowerTarget.contains("facebook") && (lowerPkg.contains("katana") || lowerPkg.contains("facebook"))) ||
                (lowerTarget.contains("youtube") && lowerPkg.contains("youtube")) ||
                (lowerTarget.contains("barcelona") && lowerPkg.contains("barcelona")) ||
                (lowerTarget.contains("twitter") && lowerPkg.contains("twitter"))
        }
    }

    private fun isReelsOrShortsContext(pkgName: String, event: AccessibilityEvent?): Boolean {
        val pkg = pkgName.lowercase()

        // TikTok dan Threads didesain murni sebagai feed scrolling video / timeline berpotensi doomscroll
        if (pkg.contains("musically") || pkg.contains("trill") || pkg.contains("tiktok") || pkg.contains("barcelona")) {
            return true
        }

        val eventTexts = buildList {
            event?.text?.forEach { add(it.toString().lowercase()) }
            event?.contentDescription?.let { add(it.toString().lowercase()) }
            event?.className?.let { add(it.toString().lowercase()) }
        }

        for (t in eventTexts) {
            if (t.contains("reel") || t.contains("short") || t.contains("clip") || t.contains("fb_shorts") || t.contains("timeline") || t.contains("explore") || t.contains("fyp") || t.contains("for you")) {
                return true
            }
        }

        try {
            val root = rootInActiveWindow ?: return isProbableReelsScroll(pkg, event)
            var found = false
            var inspected = 0
            val queue = ArrayDeque<AccessibilityNodeInfo>()
            queue.add(root)

            while (queue.isNotEmpty() && inspected < 30) {
                val node = queue.removeFirst()
                inspected++

                val text = node.text?.toString()?.lowercase() ?: ""
                val desc = node.contentDescription?.toString()?.lowercase() ?: ""
                val resId = node.viewIdResourceName?.lowercase() ?: ""

                if (pkg.contains("instagram")) {
                    if (resId.contains("clips") || resId.contains("reel") || resId.contains("feed") ||
                        text == "reels" || desc.contains("reels") || desc.contains("audio reels") ||
                        desc.contains("explore") || text.contains("explore") || desc.contains("beranda")) {
                        found = true
                        break
                    }
                } else if (pkg.contains("youtube")) {
                    if (resId.contains("shorts") || resId.contains("reel") ||
                        text.contains("shorts") || desc.contains("shorts")) {
                        found = true
                        break
                    }
                } else if (pkg.contains("facebook") || pkg.contains("katana")) {
                    if (resId.contains("fb_shorts") || resId.contains("reel") || resId.contains("feed") ||
                        text.contains("reels") || desc.contains("reels") || desc.contains("kabar beranda")) {
                        found = true
                        break
                    }
                } else if (pkg.contains("twitter")) {
                    if (resId.contains("timeline") || resId.contains("tweet") || resId.contains("explore") ||
                        desc.contains("timeline") || text.contains("for you") || text.contains("untuk anda")) {
                        found = true
                        break
                    }
                }

                for (i in 0 until node.childCount) {
                    node.getChild(i)?.let { queue.add(it) }
                }
            }
            if (found) return true
        } catch (_: Exception) {
        }

        return isProbableReelsScroll(pkg, event)
    }

    private fun isCommentsOrShareSheetOpen(): Boolean {
        return try {
            val root = rootInActiveWindow ?: return false
            var count = 0
            val queue = ArrayDeque<AccessibilityNodeInfo>()
            queue.add(root)
            while (queue.isNotEmpty() && count < 25) {
                val node = queue.removeFirst()
                count++
                val text = node.text?.toString()?.lowercase() ?: ""
                val desc = node.contentDescription?.toString()?.lowercase() ?: ""
                val resId = node.viewIdResourceName?.lowercase() ?: ""

                if (resId.contains("comment") || resId.contains("share_sheet") ||
                    desc.contains("comment") || text == "komentar" || text == "comments") {
                    return true
                }
                for (i in 0 until node.childCount) {
                    node.getChild(i)?.let { queue.add(it) }
                }
            }
            false
        } catch (_: Exception) {
            false
        }
    }

    private fun isProbableReelsScroll(pkg: String, event: AccessibilityEvent?): Boolean {
        val cls = event?.className?.toString()?.lowercase() ?: ""
        return cls.contains("viewpager") || cls.contains("rebound")
    }

    private fun notifyScrollDetected(pkgName: String, isReels: Boolean) {
        if (!YudaOverlayService.isRunning) return
        sendToOverlay(YudaOverlayService.ACTION_SCROLL_TICK, pkgName, isReels)
    }

    private fun sendTimerUpdateToOverlay(pkgName: String, isReels: Boolean, totalMs: Long, isRunning: Boolean) {
        if (!YudaOverlayService.isRunning) return
        val intent = Intent(this, YudaOverlayService::class.java).apply {
            action = YudaOverlayService.ACTION_REELS_TIMER_UPDATE
            putExtra(YudaOverlayService.EXTRA_CURRENT_APP, pkgName)
            putExtra(YudaOverlayService.EXTRA_IS_REELS, isReels)
            putExtra(YudaOverlayService.EXTRA_ACCUMULATED_MS, totalMs)
            putExtra(YudaOverlayService.EXTRA_IS_TIMER_RUNNING, isRunning)
        }
        try {
            startService(intent)
        } catch (e: Exception) {
            Log.w(TAG, "sendTimerUpdateToOverlay gagal: ${e.message}")
        }
    }

    private fun sendToOverlay(action: String, pkgName: String, isReels: Boolean = false) {
        val intent = Intent(this, YudaOverlayService::class.java).apply {
            this.action = action
            putExtra(YudaOverlayService.EXTRA_CURRENT_APP, pkgName)
            putExtra(YudaOverlayService.EXTRA_IS_REELS, isReels)
        }
        try {
            startService(intent)
        } catch (e: Exception) {
            Log.w(TAG, "startService gagal: ${e.message}")
        }
    }

    override fun onInterrupt() {
        isServiceConnected = false
        stopAndSaveReelsTimer()
    }

    override fun onDestroy() {
        super.onDestroy()
        isServiceConnected = false
        stopAndSaveReelsTimer()

        if (isReceiverRegistered) {
            try {
                unregisterReceiver(screenReceiver)
            } catch (_: Exception) {
            }
            isReceiverRegistered = false
        }

        handler.removeCallbacksAndMessages(null)
        idleHandler.removeCallbacksAndMessages(null)
    }
}
