package com.mieayamproject.yuda.pip

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
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
import android.graphics.Shader
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat

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

        const val EXTRA_USER_NAME = "extra_user_name"
        const val EXTRA_TARGET_PACKAGE = "extra_target_package"
        const val EXTRA_TEST_MODE = "extra_test_mode"
        const val EXTRA_INTERVAL_SECONDS = "extra_interval_seconds"
        const val EXTRA_CURRENT_APP = "extra_current_app"
        const val EXTRA_IS_REELS = "extra_is_reels"
        const val EXTRA_ACCUMULATED_MS = "extra_accumulated_ms"
        const val EXTRA_IS_TIMER_RUNNING = "extra_is_timer_running"

        private const val NOTIFICATION_ID = 9911

        var isRunning = false
            private set
    }

    private var windowManager: WindowManager? = null
    private var overlayView: FrameLayout? = null
    private var timerBubbleView: FrameLayout? = null

    private var userName: String = "Gathan"
    private var targetPackage: String = "com.instagram.android"
    private var testMode: Boolean = true
    private var intervalSeconds: Int = 30

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

                val secondsElapsed = (accumulatedMs / 1000L).toInt()
                val remaining = Math.max(0, intervalSeconds - (secondsElapsed % intervalSeconds))
                remainingSeconds = remaining

                val appLabel = getAppShortLabel(currentForegroundPackage)
                if (isTimerRunning) {
                    updateTimerBubbleText("🔥 $appLabel Reels: ${remaining}s")
                } else {
                    updateTimerBubbleText("⏸️ Yuda: ${remaining}s (Idle / Diam)")
                }

                if (remaining <= 0 && secondsElapsed > 0 && !isPeeking && !isFullModal) {
                    triggerPeekingYuda()
                }
                return START_STICKY
            }
            ACTION_TEST_TRIGGER -> {
                triggerPeekingYuda()
                return START_STICKY
            }
        }

        userName = intent.getStringExtra(EXTRA_USER_NAME) ?: "Gathan"
        targetPackage = intent.getStringExtra(EXTRA_TARGET_PACKAGE) ?: "com.instagram.android"
        testMode = intent.getBooleanExtra(EXTRA_TEST_MODE, true)
        intervalSeconds = intent.getIntExtra(EXTRA_INTERVAL_SECONDS, 30)

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
                    isTargetAppInForeground = topApp.contains("instagram") ||
                        topApp.contains("musically") ||
                        topApp.contains("youtube")
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
            lower.contains("instagram") -> "IG"
            lower.contains("tiktok") || lower.contains("musically") || lower.contains("trill") -> "TikTok"
            lower.contains("youtube") -> "Shorts"
            lower.contains("facebook") || lower.contains("katana") -> "FB"
            else -> "Video"
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
        updateTimerBubbleText("⏳ Yuda: ${remainingSeconds}s")

        val run = object : Runnable {
            override fun run() {
                val now = SystemClock.elapsedRealtime()

                val isActivelyScrolling = (now - lastScrollTime < 6000L) && isTargetAppInForeground && isCurrentlyInReels

                val shouldCount = if (YudaAccessibilityService.isServiceConnected) {
                    isActivelyScrolling
                } else {
                    isTargetAppInForeground
                }

                val appLabel = getAppShortLabel(currentForegroundPackage)

                if (shouldCount) {
                    remainingSeconds--
                    val tag = if (isCurrentlyInReels) "🔥 $appLabel Reels" else "🔥 $appLabel"
                    updateTimerBubbleText("$tag: ${remainingSeconds}s")

                    if (remainingSeconds <= 0) {
                        triggerPeekingYuda()
                        remainingSeconds = intervalSeconds
                    }
                } else {
                    val statusDesc = if (!YudaAccessibilityService.isServiceConnected) {
                        "Aktifkan Aksesibilitas"
                    } else if (isTargetAppInForeground) {
                        if (isCurrentlyInReels) "Reels Diam" else "Bukan Reels"
                    } else {
                        "Standby"
                    }
                    updateTimerBubbleText("⏸️ Yuda: ${remainingSeconds}s ($statusDesc)")
                }

                handler.postDelayed(this, 1000L)
            }
        }
        timerRunnable = run
        handler.postDelayed(run, 1000L)
    }

    private fun triggerPeekingYuda() {
        if (overlayView != null) return

        val wm = windowManager ?: return

        val root = FrameLayout(this)

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
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
            x = 0
            y = 0
        }

        val peekCapybara = ImageView(this).apply {
            val bmp = loadHandHalfBitmap()
            setImageBitmap(bmp)
            val size = dpToPx(86)
            layoutParams = FrameLayout.LayoutParams(size, size).apply {
                gravity = Gravity.TOP or Gravity.START
                leftMargin = dpToPx(18)
                topMargin = 0
            }
        }
        root.addView(peekCapybara)

        try {
            wm.addView(root, params)
            overlayView = root
            isPeeking = true

            peekCapybara.translationY = -dpToPx(90).toFloat()
            peekCapybara.animate()
                .translationY(0f)
                .setDuration(600)
                .setInterpolator(OvershootInterpolator(1.2f))
                .start()

            val rockAnim = ObjectAnimator.ofFloat(peekCapybara, "rotation", -6f, 6f).apply {
                duration = 850
                repeatMode = ValueAnimator.REVERSE
                repeatCount = ValueAnimator.INFINITE
            }
            rockAnim.start()

            handler.postDelayed({
                if (isPeeking && overlayView === root) {
                    transitionToFullModal(root, params, peekCapybara)
                }
            }, 3200L)

        } catch (e: Exception) {
            Log.e(TAG, "Gagal triggerPeekingYuda: ${e.message}")
        }
    }

    private fun transitionToFullModal(
        root: FrameLayout,
        params: WindowManager.LayoutParams,
        peekCapybara: ImageView
    ) {
        val wm = windowManager ?: return

        params.height = WindowManager.LayoutParams.MATCH_PARENT
        params.flags = WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        try {
            wm.updateViewLayout(root, params)
        } catch (e: Exception) {
            Log.e(TAG, "Gagal update layout modal: ${e.message}")
            return
        }

        peekCapybara.animate().alpha(0f).setDuration(200).start()

        val fullAlertView = createFullAlertView()
        fullAlertView.alpha = 0f
        root.addView(fullAlertView)

        fullAlertView.animate()
            .alpha(1f)
            .setDuration(350)
            .setInterpolator(DecelerateInterpolator())
            .start()

        isPeeking = false
        isFullModal = true
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

        val titleTv = TextView(this).apply {
            text = "Halo $userName, Kamu\nSudah Scrolling\nSelama 15 Menit"
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

        container.setOnClickListener {
            dismissOverlay()
        }

        return container
    }

    private fun dismissOverlay() {
        val view = overlayView ?: return
        overlayView = null
        isPeeking = false
        isFullModal = false

        view.animate()
            .alpha(0f)
            .setDuration(240)
            .withEndAction {
                try {
                    windowManager?.removeView(view)
                } catch (_: Exception) {
                }
            }
            .start()
    }

    private fun loadHandHalfBitmap(): Bitmap {
        return try {
            assets.open("images/yuda/yuda-hand-half.png").use { BitmapFactory.decodeStream(it) }
        } catch (_: Exception) {
            try {
                assets.open("yuda-hand-half.png").use { BitmapFactory.decodeStream(it) }
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

        overlayView?.let {
            try {
                windowManager?.removeView(it)
            } catch (_: Exception) {
            }
            overlayView = null
        }
    }
}