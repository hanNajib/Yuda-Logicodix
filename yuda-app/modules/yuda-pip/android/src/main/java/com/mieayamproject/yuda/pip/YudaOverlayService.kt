package com.mieayamproject.yuda.pip

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PixelFormat
import android.graphics.Point
import android.graphics.Shader
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import android.util.TypedValue
import android.view.ContextThemeWrapper
import android.view.Gravity
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.facebook.react.ReactApplication
import com.facebook.react.common.LifecycleState
import com.facebook.react.interfaces.fabric.ReactSurface

class YudaOverlayService : Service() {

    companion object {
        private const val TAG = "YudaOverlayService"

        const val ACTION_START = "com.mieayamproject.yuda.pip.START_OVERLAY"
        const val ACTION_STOP = "com.mieayamproject.yuda.pip.STOP_OVERLAY"
        const val ACTION_TEST_TRIGGER = "com.mieayamproject.yuda.pip.TEST_TRIGGER"
        const val ACTION_APP_FOREGROUND = "com.mieayamproject.yuda.pip.APP_FOREGROUND"
        const val ACTION_APP_BACKGROUND = "com.mieayamproject.yuda.pip.APP_BACKGROUND"
        const val ACTION_SCROLL_TICK = "com.mieayamproject.yuda.pip.SCROLL_TICK"
        const val ACTION_REELS_TIMER_UPDATE = "com.mieayamproject.yuda.pip.REELS_TIMER_UPDATE"
        const val ACTION_DISMISS_ALERT = "com.mieayamproject.yuda.pip.DISMISS_ALERT"
        const val ACTION_UPDATE_INTERVAL = "com.mieayamproject.yuda.pip.UPDATE_INTERVAL"

        const val EXTRA_USER_NAME = "extra_user_name"
        const val EXTRA_TARGET_PACKAGE = "extra_target_package"
        const val EXTRA_TEST_MODE = "extra_test_mode"
        const val EXTRA_INTERVAL_SECONDS = "extra_interval_seconds"
        const val EXTRA_CURRENT_APP = "extra_current_app"
        const val EXTRA_IS_REELS = "extra_is_reels"
        const val EXTRA_ACCUMULATED_MS = "extra_accumulated_ms"
        const val EXTRA_IS_TIMER_RUNNING = "extra_is_timer_running"
        const val EXTRA_DISMISS_REASON = "extra_dismiss_reason"

        private const val NOTIFICATION_ID = 9911

        var isRunning = false
            private set
    }

    private var windowManager: WindowManager? = null
    private var overlayView: FrameLayout? = null
    private var pendingRemovalView: FrameLayout? = null
    private var fadingPeekView: FrameLayout? = null
    private var timerBubbleView: FrameLayout? = null
    private var activeSurface: ReactSurface? = null
    private var didResumeHostForOverlay = false

    private var userName: String = "Gathan"
    private var targetPackage: String = "com.instagram.android"
    private var testMode: Boolean = true
    private var intervalSeconds: Int = 30
    private var pauseStageLevel: Int = 1
    private var totalPauseCount: Int = 0
    private var lastAccessibilityTriggeredBucket: Int = 0
    private var lastAccessibilityUpdateAt: Long = 0L
    private var lastAccessibilityElapsedSeconds: Int = 0
    private var accessibilityOffsetSeconds: Int = 0

    private val handler = Handler(Looper.getMainLooper())
    private var remainingSeconds: Int = 30
    private var timerRunnable: Runnable? = null
    private var pollAppRunnable: Runnable? = null

    private var isPeeking = false
    private var isFullModal = false
    private var isTargetAppInForeground = false
    private var isCurrentlyInReels = false
    private var lastScrollTime = 0L
    private var currentForegroundPackage = "com.instagram.android"

    private var startFailed = false

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        if (!startForegroundServiceNotification()) {
            startFailed = true
            stopSelf()
            return
        }

        isRunning = true
        startPollingForegroundApp()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (startFailed) {
            stopSelf()
            return START_NOT_STICKY
        }

        val action = intent?.action ?: return START_STICKY

        when (action) {
            ACTION_STOP -> {
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_APP_FOREGROUND -> {
                isTargetAppInForeground = true
                currentForegroundPackage = intent.getStringExtra(EXTRA_CURRENT_APP) ?: currentForegroundPackage
                isCurrentlyInReels = intent.getBooleanExtra(EXTRA_IS_REELS, false)
                Log.d(TAG, "Target app in foreground: $currentForegroundPackage (inReels=$isCurrentlyInReels)")
                return START_STICKY
            }
            ACTION_APP_BACKGROUND -> {
                isTargetAppInForeground = false
                isCurrentlyInReels = false
                Log.d(TAG, "Target app in background")
                return START_STICKY
            }
            ACTION_SCROLL_TICK -> {
                isTargetAppInForeground = true
                isCurrentlyInReels = intent.getBooleanExtra(EXTRA_IS_REELS, true)
                currentForegroundPackage = intent.getStringExtra(EXTRA_CURRENT_APP) ?: currentForegroundPackage
                lastScrollTime = SystemClock.elapsedRealtime()
                Log.d(TAG, "Scroll tick di Reels: $currentForegroundPackage")
                return START_STICKY
            }
            ACTION_REELS_TIMER_UPDATE -> {
                isTargetAppInForeground = true
                isCurrentlyInReels = intent.getBooleanExtra(EXTRA_IS_REELS, true)
                currentForegroundPackage = intent.getStringExtra(EXTRA_CURRENT_APP) ?: currentForegroundPackage
                val accumulatedMs = intent.getLongExtra(EXTRA_ACCUMULATED_MS, 0L)
                val isTimerRunning = intent.getBooleanExtra(EXTRA_IS_TIMER_RUNNING, false)
                lastAccessibilityUpdateAt = SystemClock.elapsedRealtime()

                val safeInterval = intervalSeconds.coerceAtLeast(1)
                val rawSecondsElapsed = (accumulatedMs / 1000L).toInt()
                lastAccessibilityElapsedSeconds = rawSecondsElapsed
                
                val bucket = rawSecondsElapsed / safeInterval
                val remaining = if (rawSecondsElapsed > 0 && rawSecondsElapsed % safeInterval == 0) {
                    0
                } else {
                    safeInterval - (rawSecondsElapsed % safeInterval)
                }
                if (!isPeeking && !isFullModal) {
                    remainingSeconds = remaining
                }

                val appLabel = getAppShortLabel(currentForegroundPackage)
                val totalMins = rawSecondsElapsed / 60
                val totalSecs = rawSecondsElapsed % 60
                val timeStr = if (totalMins > 0) "${totalMins}m ${totalSecs}s" else "${totalSecs}s"

                if (isTimerRunning) {
                    val contextTag = if (isCurrentlyInReels) "Reels" else "Feed"
                    updateTimerBubbleText("🔥 $appLabel ($contextTag): $timeStr")
                } else {
                    updateTimerBubbleText("⏸️ $appLabel: $timeStr (Diam)")
                }

                if (bucket > lastAccessibilityTriggeredBucket && rawSecondsElapsed > 0 && !isPeeking && !isFullModal) {
                    lastAccessibilityTriggeredBucket = bucket
                    triggerPeekingYuda()
                }
                return START_STICKY
            }
            ACTION_TEST_TRIGGER -> {
                triggerPeekingYuda()
                return START_STICKY
            }
            ACTION_DISMISS_ALERT -> {
                val reason = intent.getStringExtra(EXTRA_DISMISS_REASON) ?: "dismiss"
                if (reason == "continue") {
                    if (pauseStageLevel < 2) {
                        pauseStageLevel++
                    }
                    lastScrollTime = SystemClock.elapsedRealtime()
                    lastAccessibilityUpdateAt = SystemClock.elapsedRealtime()
                    YudaAccessibilityService.forceResumeReelsSession()
                } else if (reason == "rest") {
                    pauseStageLevel = 1
                    try {
                        val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                            addCategory(Intent.CATEGORY_HOME)
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        startActivity(homeIntent)
                    } catch (e: Exception) {
                        Log.w(TAG, "Gagal mengarahkan ke Home Screen Android: ${e.message}")
                    }
                } else {
                    pauseStageLevel = 1
                }
                lastAccessibilityTriggeredBucket = lastAccessibilityElapsedSeconds / intervalSeconds.coerceAtLeast(1)
                remainingSeconds = intervalSeconds
                dismissOverlay()
                return START_STICKY
            }
            ACTION_UPDATE_INTERVAL -> {
                val newInterval = intent.getIntExtra(EXTRA_INTERVAL_SECONDS, 0)
                if (newInterval > 0) {
                    intervalSeconds = newInterval
                    lastAccessibilityTriggeredBucket = lastAccessibilityElapsedSeconds / intervalSeconds.coerceAtLeast(1)
                    remainingSeconds = intervalSeconds
                    Log.d(TAG, "Interval waktu jeda diperbarui menjadi: $intervalSeconds detik")
                }
                return START_STICKY
            }
        }

        userName = intent.getStringExtra(EXTRA_USER_NAME) ?: "Gathan"
        targetPackage = intent.getStringExtra(EXTRA_TARGET_PACKAGE) ?: "com.instagram.android"
        testMode = intent.getBooleanExtra(EXTRA_TEST_MODE, true)
        val prefInterval = YudaPipModule.getIntervalMinutes(this) * 60
        val requestedInterval = intent.getIntExtra(EXTRA_INTERVAL_SECONDS, 0)
        intervalSeconds = if (requestedInterval > 0) requestedInterval else prefInterval
        pauseStageLevel = 1
        lastAccessibilityTriggeredBucket = lastAccessibilityElapsedSeconds / intervalSeconds.coerceAtLeast(1)

        resetCountdown()
        showTimerBubble()

        return START_STICKY
    }

    private fun startForegroundServiceNotification(): Boolean {
        val channelId = "yuda_overlay_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Yuda Smart Screen Monitor",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notifikasi status pendamping scrolling Yuda"
                setShowBadge(false)
            }
            getSystemService(NotificationManager::class.java)?.createNotificationChannel(channel)
        }

        val iconRes = if (applicationInfo.icon != 0) applicationInfo.icon else android.R.drawable.ic_dialog_info

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Yuda Pendamping Scrolling")
            .setContentText("Aktif mendampingi saat kamu membuka Instagram Reels")
            .setSmallIcon(iconRes)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                try {
                    startForeground(
                        NOTIFICATION_ID,
                        notification,
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
                    )
                    true
                } catch (e: Exception) {
                    Log.w(TAG, "startForeground specialUse gagal, fallback ke default: ${e.message}")
                    startForeground(NOTIFICATION_ID, notification)
                    true
                }
            } else {
                startForeground(NOTIFICATION_ID, notification)
                true
            }
        } catch (e: Exception) {
            Log.e(TAG, "startForeground gagal total: ${e.message}")
            false
        }
    }

    private fun startPollingForegroundApp() {
        pollAppRunnable?.let { handler.removeCallbacks(it) }

        val runnable = object : Runnable {
            override fun run() {
                if (!YudaAccessibilityService.isServiceConnected) {
                    checkForegroundAppViaUsageStats()
                }
                handler.postDelayed(this, 1000L)
            }
        }
        pollAppRunnable = runnable
        handler.postDelayed(runnable, 1000L)
    }

    private fun checkForegroundAppViaUsageStats() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                val usm = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager ?: return
                val now = System.currentTimeMillis()
                val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, now - 10000, now)
                val topApp = stats?.maxByOrNull { it.lastTimeUsed }?.packageName

                if (topApp != null) {
                    val lower = topApp.lowercase()
                    isTargetAppInForeground = lower.contains("instagram") ||
                        lower.contains("musically") ||
                        lower.contains("youtube") ||
                        lower.contains("barcelona") ||
                        lower.contains("twitter") ||
                        lower.contains("facebook") ||
                        lower.contains("katana")
                }
            }
        } catch (_: Exception) {
        }
    }

    private fun showTimerBubble() {
        if (!testMode) {
            removeTimerBubble()
            return
        }

        if (timerBubbleView != null) return

        val wm = windowManager ?: return

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = dpToPx(16)
            y = dpToPx(90)
        }

        val bubbleBg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            setColor(Color.parseColor("#E6163826"))
            cornerRadius = dpToPx(20).toFloat()
            setStroke(dpToPx(1), Color.parseColor("#803E825F"))
        }

        val bubble = FrameLayout(this).apply {
            background = bubbleBg
            val padH = dpToPx(12)
            val padV = dpToPx(6)
            setPadding(padH, padV, padH, padV)
        }

        val tv = TextView(this).apply {
            id = View.generateViewId()
            text = "⏳ Yuda: ${remainingSeconds}s"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            setTypeface(Typeface.DEFAULT_BOLD)
        }

        bubble.addView(tv)

        bubble.setOnTouchListener(object : View.OnTouchListener {
            var initialX = 0
            var initialY = 0
            var initialTouchX = 0f
            var initialTouchY = 0f

            override fun onTouch(v: View?, event: MotionEvent?): Boolean {
                if (event == null) return false
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.x = initialX + (event.rawX - initialTouchX).toInt()
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        try {
                            wm.updateViewLayout(bubble, params)
                        } catch (_: Exception) {
                        }
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        val diffX = Math.abs(event.rawX - initialTouchX)
                        val diffY = Math.abs(event.rawY - initialTouchY)
                        if (diffX < 10 && diffY < 10) {
                            triggerPeekingYuda()
                        }
                        return true
                    }
                }
                return false
            }
        })

        try {
            wm.addView(bubble, params)
            timerBubbleView = bubble
        } catch (e: Exception) {
            Log.e(TAG, "Gagal add timer bubble: ${e.message}")
        }
    }

    private fun updateTimerBubbleText(customText: String) {
        val bubble = timerBubbleView ?: return
        val tv = bubble.getChildAt(0) as? TextView
        tv?.text = customText
    }

    private fun getAppShortLabel(pkg: String): String {
        val lower = pkg.lowercase()
        return when {
            lower.contains("barcelona") -> "Threads"
            lower.contains("twitter") -> "X (Twitter)"
            lower.contains("instagram") -> "Instagram"
            lower.contains("tiktok") || lower.contains("musically") || lower.contains("trill") -> "TikTok"
            lower.contains("youtube") -> "YouTube"
            lower.contains("facebook") || lower.contains("katana") -> "Facebook"
            else -> "Media Sosial"
        }
    }

    private fun removeTimerBubble() {
        timerBubbleView?.let {
            try {
                windowManager?.removeView(it)
            } catch (_: Exception) {
            }
            timerBubbleView = null
        }
    }

    private fun resetCountdown() {
        timerRunnable?.let { handler.removeCallbacks(it) }
        remainingSeconds = intervalSeconds
        updateTimerBubbleText("⏳ Yuda: Menyiapkan...")

        val run = object : Runnable {
            override fun run() {
                val now = SystemClock.elapsedRealtime()

                if (isPeeking || isFullModal) {
                    handler.postDelayed(this, 1000L)
                    return
                }

                val hasRecentAccessibilityTick = (now - lastAccessibilityUpdateAt) < 2500L
                val isActivelyScrolling = (now - lastScrollTime < 5 * 60 * 1000L) && isTargetAppInForeground && isCurrentlyInReels

                val shouldCount = if (YudaAccessibilityService.isServiceConnected) {
                    isActivelyScrolling && !hasRecentAccessibilityTick
                } else {
                    isTargetAppInForeground
                }

                val appLabel = getAppShortLabel(currentForegroundPackage)

                if (shouldCount) {
                    remainingSeconds--
                    lastAccessibilityElapsedSeconds++
                    val totalMins = lastAccessibilityElapsedSeconds / 60
                    val totalSecs = lastAccessibilityElapsedSeconds % 60
                    val timeStr = if (totalMins > 0) "${totalMins}m ${totalSecs}s" else "${totalSecs}s"
                    val tag = if (isCurrentlyInReels) "🔥 $appLabel (Reels)" else "🔥 $appLabel"
                    updateTimerBubbleText("$tag: $timeStr")

                    if (remainingSeconds <= 0) {
                        triggerPeekingYuda()
                        remainingSeconds = intervalSeconds
                    }
                } else if (!hasRecentAccessibilityTick) {
                    val statusDesc = if (!YudaAccessibilityService.isServiceConnected) {
                        "Nyalakan Aksesibilitas"
                    } else if (isTargetAppInForeground) {
                        if (isCurrentlyInReels) "Diam" else "Bukan Feed"
                    } else {
                        "Standby"
                    }
                    val totalMins = lastAccessibilityElapsedSeconds / 60
                    val totalSecs = lastAccessibilityElapsedSeconds % 60
                    val timeStr = if (totalMins > 0) "${totalMins}m ${totalSecs}s" else "${totalSecs}s"
                    val prefix = if (isTargetAppInForeground) "⏸️ $appLabel" else "⏸️ Standby"
                    updateTimerBubbleText("$prefix: $timeStr ($statusDesc)")
                }

                handler.postDelayed(this, 1000L)
            }
        }
        timerRunnable = run
        handler.postDelayed(run, 1000L)
    }

    private class OverlayContainerLayout(
        context: Context,
        private val onBackPress: () -> Boolean
    ) : FrameLayout(context) {
        override fun dispatchKeyEvent(event: KeyEvent): Boolean {
            if (event.keyCode == KeyEvent.KEYCODE_BACK) {
                if (event.action == KeyEvent.ACTION_DOWN) {
                    return true
                }
                if (event.action == KeyEvent.ACTION_UP) {
                    return onBackPress()
                }
            }
            return super.dispatchKeyEvent(event)
        }
    }

    private fun getRealScreenSize(): Pair<Int, Int> {
        val wm = windowManager ?: return Pair(
            resources.displayMetrics.widthPixels,
            resources.displayMetrics.heightPixels
        )
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val bounds = wm.currentWindowMetrics.bounds
            Pair(bounds.width(), bounds.height())
        } else {
            val pt = Point()
            @Suppress("DEPRECATION")
            wm.defaultDisplay.getRealSize(pt)
            Pair(pt.x, pt.y)
        }
    }

    private fun triggerPeekingYuda() {
        if (overlayView != null || pendingRemovalView != null || fadingPeekView != null) return

        totalPauseCount++

        val wm = windowManager ?: return

        val bmp = loadHandHalfBitmap()
        val targetWidth = dpToPx(132)
        val targetHeight = if (bmp.width > 0 && bmp.height > 0) {
            (targetWidth * (bmp.height.toFloat() / bmp.width.toFloat())).toInt()
        } else {
            dpToPx(182)
        }
        val sunkPx = (targetHeight * 0.25f).toInt()
        val visibleHeight = (targetHeight - sunkPx).coerceAtLeast(1)
        val leftMarginPx = dpToPx(18)

        val root = FrameLayout(this).apply {
            clipChildren = true
            clipToPadding = true
        }

        val params = WindowManager.LayoutParams(
            leftMarginPx + targetWidth,
            visibleHeight,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 0
            y = 0
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                layoutInDisplayCutoutMode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                } else {
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                }
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                fitInsetsTypes = 0
            }
        }

        val peekCapybara = ImageView(this).apply {
            setImageBitmap(bmp)
            scaleType = ImageView.ScaleType.FIT_CENTER
            layoutParams = FrameLayout.LayoutParams(targetWidth, targetHeight).apply {
                gravity = Gravity.TOP or Gravity.START
                leftMargin = leftMarginPx
                topMargin = 0
            }
        }
        root.addView(peekCapybara)

        peekCapybara.setOnClickListener {
            if (isPeeking && overlayView === root) {
                transitionToFullModal(root)
            }
        }

        try {
            wm.addView(root, params)
            overlayView = root
            isPeeking = true

            peekCapybara.translationY = -targetHeight.toFloat()
            peekCapybara.animate()
                .translationY(-sunkPx.toFloat())
                .setDuration(350)
                .setInterpolator(DecelerateInterpolator(1.5f))
                .start()

            handler.postDelayed({
                if (isPeeking && overlayView === root) {
                    transitionToFullModal(root)
                }
            }, 1200L)

        } catch (e: Exception) {
            Log.e(TAG, "Gagal triggerPeekingYuda: ${e.message}")
        }
    }

    private fun transitionToFullModal(peekRoot: FrameLayout) {
        val wm = windowManager ?: return
        if (overlayView !== peekRoot) return

        val (screenWidthPx, screenHeightPx) = getRealScreenSize()

        val fullRoot = OverlayContainerLayout(this) {
            // Intervensi modal tidak boleh di-dismiss dengan tombol back
            true
        }.apply {
            clipChildren = true
            clipToPadding = true
        }

        val fullParams = WindowManager.LayoutParams(
            screenWidthPx,
            screenHeightPx,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 0
            y = 0
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                layoutInDisplayCutoutMode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                } else {
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                }
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                fitInsetsTypes = 0
            }
        }

        val reactHost = (application as? ReactApplication)?.reactHost
        if (reactHost != null) {
            try {
                val themeResId = if (applicationInfo.theme != 0) {
                    applicationInfo.theme
                } else {
                    android.R.style.Theme_DeviceDefault_NoActionBar
                }
                val themedContext = ContextThemeWrapper(this, themeResId)
                val density = resources.displayMetrics.density.coerceAtLeast(1f)
                val reminderMinutes = (intervalSeconds / 60).coerceAtLeast(1)
                val safeElapsedSeconds = if (lastAccessibilityElapsedSeconds > 0) lastAccessibilityElapsedSeconds else intervalSeconds
                val elapsedMinutes = (safeElapsedSeconds / 60)
                val elapsedRemainingSeconds = (safeElapsedSeconds % 60)
                val currentHour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
                val isSleepTime = currentHour >= 22 || currentHour < 4
                val actionPool = if (isSleepTime) {
                    arrayOf("nafas", "minum", "peregangan", "tidur")
                } else {
                    arrayOf("nafas", "minum", "peregangan")
                }
                val chosenAction = actionPool[((System.currentTimeMillis() / 1000L) % actionPool.size).toInt()]

                val initialProps = Bundle().apply {
                    putString("userName", userName)
                    putInt("durationMinutes", elapsedMinutes)
                    putInt("durationSeconds", elapsedRemainingSeconds)
                    putInt("totalElapsedSeconds", safeElapsedSeconds)
                    putInt("reminderMinutes", reminderMinutes)
                    putString("pauseType", "biasa")
                    putInt("pauseStage", pauseStageLevel)
                    putInt("pauseCount", totalPauseCount)
                    putString("actionType", chosenAction)
                    val configuredPauseDuration = YudaPipModule.getPauseDurationSeconds(this@YudaOverlayService)
                    putInt("breathDurationSeconds", configuredPauseDuration.coerceAtLeast(15))
                    putDouble("screenWidth", (screenWidthPx / density).toDouble())
                    putDouble("screenHeight", (screenHeightPx / density).toDouble())
                }
                val surface = reactHost.createSurface(themedContext, "YudaAlertOverlay", initialProps)
                val surfaceView = surface.view
                if (surfaceView != null) {
                    if (reactHost.lifecycleState != LifecycleState.RESUMED) {
                        didResumeHostForOverlay = true
                        reactHost.onHostResume(null)
                    }
                    surfaceView.setBackgroundColor(Color.TRANSPARENT)
                    surfaceView.layoutParams = FrameLayout.LayoutParams(screenWidthPx, screenHeightPx)
                    fullRoot.addView(surfaceView)

                    wm.addView(fullRoot, fullParams)
                    overlayView = fullRoot
                    activeSurface = surface
                    surface.start()

                    fullRoot.isFocusableInTouchMode = true
                    fullRoot.requestFocus()

                    isPeeking = false
                    isFullModal = true

                    removePeekWindowAnimated(wm, peekRoot)
                    return
                }
            } catch (e: Exception) {
                Log.e(TAG, "Gagal mount ReactSurface overlay: ${e.message}")
                cleanupActiveSurface()
            }
        }

        val fullAlertView = createFullAlertView()
        fullAlertView.alpha = 0f
        fullAlertView.layoutParams = FrameLayout.LayoutParams(screenWidthPx, screenHeightPx)
        fullRoot.addView(fullAlertView)

        try {
            wm.addView(fullRoot, fullParams)
            overlayView = fullRoot
            fullRoot.isFocusableInTouchMode = true
            fullRoot.requestFocus()
            fullAlertView.animate()
                .alpha(1f)
                .setDuration(350)
                .setInterpolator(DecelerateInterpolator())
                .start()
            isPeeking = false
            isFullModal = true
            removePeekWindowAnimated(wm, peekRoot)
        } catch (e: Exception) {
            Log.e(TAG, "Gagal fallback add fullRoot: ${e.message}")
        }
    }

    private fun removePeekWindowAnimated(wm: WindowManager, peekRoot: FrameLayout) {
        fadingPeekView = peekRoot
        peekRoot.animate()
            .alpha(0f)
            .setDuration(180)
            .withEndAction {
                if (fadingPeekView === peekRoot) {
                    fadingPeekView = null
                }
                try {
                    wm.removeView(peekRoot)
                } catch (_: Exception) {
                }
            }
            .start()
    }

    private class SpotlightView(context: Context) : View(context) {
        private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        private val path = Path()

        override fun onDraw(canvas: Canvas) {
            super.onDraw(canvas)
            val w = width.toFloat()
            val h = height.toFloat()
            if (w <= 0f || h <= 0f) return

            val cx = w / 2f
            val originY = -h * 0.05f
            val reachY = h * 0.82f

            paint.shader = LinearGradient(
                cx, originY,
                cx, reachY,
                intArrayOf(
                    Color.argb(115, 255, 255, 255),
                    Color.argb(70, 255, 255, 255),
                    Color.argb(25, 255, 255, 255),
                    Color.argb(0, 255, 255, 255)
                ),
                floatArrayOf(0f, 0.32f, 0.75f, 1f),
                Shader.TileMode.CLAMP
            )

            val s = w / 400f

            path.reset()
            path.moveTo(cx - 24f * s, originY)
            path.lineTo(cx - 6f * s, originY)
            path.lineTo(w * 0.36f, reachY)
            path.lineTo(w * 0.08f, reachY)
            path.close()
            canvas.drawPath(path, paint)

            path.reset()
            path.moveTo(cx - 12f * s, originY)
            path.lineTo(cx + 12f * s, originY)
            path.lineTo(w * 0.64f, reachY)
            path.lineTo(w * 0.36f, reachY)
            path.close()
            canvas.drawPath(path, paint)

            path.reset()
            path.moveTo(cx + 6f * s, originY)
            path.lineTo(cx + 24f * s, originY)
            path.lineTo(w * 0.92f, reachY)
            path.lineTo(w * 0.64f, reachY)
            path.close()
            canvas.drawPath(path, paint)
        }
    }

    private fun createFullAlertView(): View {
        val container = FrameLayout(this).apply {
            setBackgroundColor(Color.parseColor("#A6000000"))
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }

        val spotlight = SpotlightView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }
        container.addView(spotlight)

        val contentBox = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                gravity = Gravity.CENTER
                leftMargin = dpToPx(20)
                rightMargin = dpToPx(20)
            }
        }

        val capyImg = ImageView(this).apply {
            val bmp = loadTandaSeruBitmap()
            setImageBitmap(bmp)
            val size = dpToPx(230)
            layoutParams = LinearLayout.LayoutParams(size, size).apply {
                bottomMargin = dpToPx(14)
            }
        }
        contentBox.addView(capyImg)

        val safeElapsedSeconds = if (lastAccessibilityElapsedSeconds > 0) lastAccessibilityElapsedSeconds else intervalSeconds
        val totalMins = safeElapsedSeconds / 60
        val totalSecs = safeElapsedSeconds % 60
        val durationFormatted = when {
            totalMins > 0 && totalSecs > 0 -> "$totalMins Menit $totalSecs Detik"
            totalMins > 0 -> "$totalMins Menit"
            else -> "$totalSecs Detik"
        }

        val titleTv = TextView(this).apply {
            text = "Halo $userName, Kamu\nSudah Scrolling\nSelama $durationFormatted"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 24f)
            setTypeface(Typeface.DEFAULT_BOLD)
            gravity = Gravity.CENTER
            setShadowLayer(8f, 0f, 2f, Color.parseColor("#B3000000"))
            setLineSpacing(dpToPx(4).toFloat(), 1f)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }
        contentBox.addView(titleTv)

        container.addView(contentBox)

        // Native fallback modal tidak dismiss saat background diklik
        // Pengguna harus memilih aksi intervensi

        return container
    }

    private fun cleanupActiveSurface() {
        activeSurface?.let { surface ->
            try {
                surface.stop()
            } catch (_: Exception) {
            }
            try {
                surface.detach()
            } catch (_: Exception) {
            }
            try {
                surface.clear()
            } catch (_: Exception) {
            }
        }
        activeSurface = null

        if (didResumeHostForOverlay) {
            didResumeHostForOverlay = false
            val reactHost = (application as? ReactApplication)?.reactHost
            if (reactHost != null &&
                reactHost.lifecycleState == LifecycleState.RESUMED &&
                reactHost.currentReactContext?.currentActivity == null
            ) {
                try {
                    reactHost.onHostPause()
                } catch (_: Exception) {
                }
            }
        }
    }

    private fun dismissOverlay() {
        val view = overlayView ?: return
        overlayView = null
        pendingRemovalView = view
        isPeeking = false
        isFullModal = false

        view.animate()
            .alpha(0f)
            .setDuration(200)
            .withEndAction {
                cleanupActiveSurface()
                if (pendingRemovalView === view) {
                    pendingRemovalView = null
                }
                try {
                    windowManager?.removeView(view)
                } catch (_: Exception) {
                }
            }
            .start()
    }

    private fun loadHandHalfBitmap(): Bitmap {
        return try {
            assets.open("images/yuda/yuda-tangan-kebalik.png").use { BitmapFactory.decodeStream(it) }
        } catch (_: Exception) {
            try {
                assets.open("yuda-tangan-kebalik.png").use { BitmapFactory.decodeStream(it) }
            } catch (_: Exception) {
                loadCapybaraBitmap()
            }
        } ?: loadCapybaraBitmap()
    }

    private fun loadTandaSeruBitmap(): Bitmap {
        return try {
            assets.open("images/yuda/yuda-tandaseru.png").use { BitmapFactory.decodeStream(it) }
        } catch (_: Exception) {
            try {
                assets.open("yuda-tandaseru.png").use { BitmapFactory.decodeStream(it) }
            } catch (_: Exception) {
                createDefaultCapybaraBitmap()
            }
        } ?: createDefaultCapybaraBitmap()
    }

    private fun loadCapybaraBitmap(): Bitmap {
        return try {
            assets.open("images/yuda/yuda-questioning.png").use { BitmapFactory.decodeStream(it) }
        } catch (_: Exception) {
            try {
                assets.open("yuda-questioning.png").use { BitmapFactory.decodeStream(it) }
            } catch (_: Exception) {
                createDefaultCapybaraBitmap()
            }
        } ?: createDefaultCapybaraBitmap()
    }

    private fun createDefaultCapybaraBitmap(): Bitmap {
        val size = dpToPx(100)
        val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bmp)

        val bodyPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#C39873")
            style = Paint.Style.FILL
        }
        val darkBrownPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#4A3728")
            style = Paint.Style.FILL
        }
        val bottleGreenPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#2E6B4E")
            style = Paint.Style.FILL
        }

        canvas.drawRoundRect(size * 0.42f, size * 0.05f, size * 0.58f, size * 0.28f, 6f, 6f, bottleGreenPaint)

        canvas.drawCircle(size * 0.22f, size * 0.32f, size * 0.12f, darkBrownPaint)
        canvas.drawCircle(size * 0.78f, size * 0.32f, size * 0.12f, darkBrownPaint)

        canvas.drawRoundRect(size * 0.15f, size * 0.25f, size * 0.85f, size * 0.88f, size * 0.25f, size * 0.25f, bodyPaint)

        canvas.drawRoundRect(size * 0.35f, size * 0.45f, size * 0.65f, size * 0.75f, size * 0.15f, size * 0.15f, darkBrownPaint)

        canvas.drawCircle(size * 0.28f, size * 0.48f, size * 0.045f, darkBrownPaint)
        canvas.drawCircle(size * 0.72f, size * 0.48f, size * 0.045f, darkBrownPaint)

        return bmp
    }

    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        handler.removeCallbacksAndMessages(null)
        timerRunnable = null
        pollAppRunnable = null
        removeTimerBubble()
        cleanupActiveSurface()

        overlayView?.let {
            try {
                windowManager?.removeView(it)
            } catch (_: Exception) {
            }
            overlayView = null
        }

        pendingRemovalView?.let {
            try {
                windowManager?.removeView(it)
            } catch (_: Exception) {
            }
            pendingRemovalView = null
        }

        fadingPeekView?.let {
            try {
                windowManager?.removeView(it)
            } catch (_: Exception) {
            }
            fadingPeekView = null
        }
    }
}