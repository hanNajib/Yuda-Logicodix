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

        var instance: YudaAccessibilityService? = null
            private set

        fun forceResumeReelsSession() {
            instance?.let { s ->
                val now = System.currentTimeMillis()
                s.lastScrollOrActivityTime = now
                s.resumeReelsTimer(now)
            }
        }
    }

    private val handler = Handler(Looper.getMainLooper())
    private val idleHandler = Handler(Looper.getMainLooper())

    private var reelsSessionStartTime = 0L
    private var accumulatedReelsDurationMs = 0L
    private var isReelsTimerRunning = false

    private var lastScrollOrActivityTime = 0L
    private val IDLE_TIMEOUT_MS = 5 * 60 * 1000L // 5 menit tanpa scroll baru dianggap idle

    private val idleCheckRunnable = object : Runnable {
        override fun run() {
            if (isReelsTimerRunning && isCurrentScreenReels) {
                val currentTime = System.currentTimeMillis()
                if (currentTime - lastScrollOrActivityTime > IDLE_TIMEOUT_MS) {
                    pauseReelsTimer("Pengguna idle / tidak aktif scrolling")
                } else {
                    idleHandler.postDelayed(this, 1000L)
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
        instance = this
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

    fun resumeReelsTimer(now: Long) {
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
        } || lowerPkg.contains("barcelona") || lowerPkg.contains("twitter")
    }

    private fun isReelsOrShortsContext(pkgName: String, event: AccessibilityEvent?): Boolean {
        val pkg = pkgName.lowercase()

        // Cek mode deteksi untuk aplikasi ini: "all" (seluruhnya) atau "trigger_only" (hanya pemicu)
        val appId = when {
            pkg.contains("instagram") && !pkg.contains("barcelona") -> "instagram"
            pkg.contains("musically") || pkg.contains("trill") || pkg.contains("tiktok") -> "tiktok"
            pkg.contains("facebook") || pkg.contains("katana") -> "facebook"
            pkg.contains("youtube") -> "youtube"
            pkg.contains("barcelona") -> "threads"
            pkg.contains("twitter") -> "twitter"
            else -> ""
        }

        if (appId.isNotEmpty()) {
            val mode = YudaPipModule.getAppDetectionMode(this, appId)
            if (mode == "all") {
                return true
            }
        }

        // Mode trigger_only: Khusus Threads, TikTok, X (Twitter) secara default timeline/FYP adalah pemicu
        if (pkg.contains("musically") || pkg.contains("trill") || pkg.contains("tiktok") || 
            pkg.contains("barcelona") || pkg.contains("twitter")) {
            return true
        }

        val eventTexts = buildList {
            event?.text?.forEach { add(it.toString().lowercase()) }
            event?.contentDescription?.let { add(it.toString().lowercase()) }
            event?.className?.let { add(it.toString().lowercase()) }
        }

        for (t in eventTexts) {
            if (t.contains("reel") || t.contains("short") || t.contains("clip") || t.contains("fb_shorts") || t.contains("timeline") || t.contains("explore") || t.contains("fyp") || t.contains("for you") || t.contains("feed")) {
                return true
            }
        }

        // Jangan traverse rootInActiveWindow pada setiap event karena memicu lag parah (IPC bottleneck)
        return isProbableReelsScroll(pkg, event) || true
    }

    private fun isCommentsOrShareSheetOpen(): Boolean {
        return false
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
        if (instance === this) {
            instance = null
        }
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
