package com.mieayamproject.yuda.pip

import android.app.ActivityManager
import android.app.AppOpsManager
import android.app.PictureInPictureParams
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.os.Process
import android.os.SystemClock
import android.provider.Settings
import android.util.Base64
import android.util.Log
import android.util.LruCache
import android.util.Rational
import androidx.core.app.NotificationManagerCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayOutputStream
import java.util.Calendar

class YudaPipModule : Module() {

    companion object {
        const val PREFS_NAME = "yuda_overlay_prefs"
        const val KEY_TARGET_PACKAGES = "target_packages"
        const val KEY_INTERVAL_MINUTES = "interval_minutes"
        const val KEY_PAUSE_DURATION_SECONDS = "pause_duration_seconds"
        const val KEY_APP_DETECTION_MODE_PREFIX = "app_detection_mode_" // "trigger_only" (default) or "all"
        const val DEFAULT_INTERVAL_MINUTES = 15
        const val DEFAULT_PAUSE_DURATION_SECONDS = 30
        const val KEY_APP_FIRST_INSTALLED_AT = "app_first_installed_at"

        fun getAppInstalledTime(context: Context): Long {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            var installedAt = prefs.getLong(KEY_APP_FIRST_INSTALLED_AT, 0L)
            if (installedAt == 0L) {
                try {
                    val pkgInfo = context.packageManager.getPackageInfo(context.packageName, 0)
                    installedAt = pkgInfo.firstInstallTime
                } catch (_: Exception) {
                    installedAt = System.currentTimeMillis()
                }
                prefs.edit().putLong(KEY_APP_FIRST_INSTALLED_AT, installedAt).apply()
            }
            return installedAt
        }

        val DEFAULT_TARGET_PACKAGES = setOf(
            "com.instagram.android",
            "com.zhiliaoapp.musically",
            "com.ss.android.ugc.trill",
            "com.facebook.katana",
            "com.facebook.lite",
            "com.google.android.youtube",
            "com.instagram.barcelona",
            "com.twitter.android",
            "com.twitter.android.lite"
        )

        fun getTargetPackages(context: Context): Set<String> {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val saved = prefs.getStringSet(KEY_TARGET_PACKAGES, null)
            return saved ?: DEFAULT_TARGET_PACKAGES
        }

        fun setTargetPackages(context: Context, packages: List<String>) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putStringSet(KEY_TARGET_PACKAGES, packages.toSet()).apply()
        }

        fun getAppDetectionMode(context: Context, appId: String): String {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return prefs.getString(KEY_APP_DETECTION_MODE_PREFIX + appId.lowercase(), "trigger_only") ?: "trigger_only"
        }

        fun setAppDetectionMode(context: Context, appId: String, mode: String) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(KEY_APP_DETECTION_MODE_PREFIX + appId.lowercase(), mode).apply()
        }

        fun getIntervalMinutes(context: Context): Int {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return prefs.getInt(KEY_INTERVAL_MINUTES, DEFAULT_INTERVAL_MINUTES)
        }

        fun setIntervalMinutes(context: Context, minutes: Int) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putInt(KEY_INTERVAL_MINUTES, minutes).apply()
        }

        fun getPauseDurationSeconds(context: Context): Int {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return prefs.getInt(KEY_PAUSE_DURATION_SECONDS, DEFAULT_PAUSE_DURATION_SECONDS)
        }

        fun setPauseDurationSeconds(context: Context, seconds: Int) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putInt(KEY_PAUSE_DURATION_SECONDS, seconds).apply()
        }
    }

    private val TAG = "YudaPipModule"
    private val ICON_SIZE = 96

    private val handler = Handler(Looper.getMainLooper())
    private var watcher: Runnable? = null

    private val iconCache = LruCache<String, String>(300)

    private val isXiaomi: Boolean by lazy {
        val m = Build.MANUFACTURER.lowercase()
        val b = Build.BRAND.lowercase()
        listOf("xiaomi", "redmi", "poco").any { m.contains(it) || b.contains(it) }
    }

    private fun ctx(): Context? = appContext.reactContext ?: appContext.currentActivity

    private fun drawableToBase64(drawable: android.graphics.drawable.Drawable): String? {
        return try {
            val bitmap = Bitmap.createBitmap(ICON_SIZE, ICON_SIZE, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, ICON_SIZE, ICON_SIZE)
            drawable.draw(canvas)

            val out = ByteArrayOutputStream(8 * 1024)
            bitmap.compress(Bitmap.CompressFormat.PNG, 90, out)
            bitmap.recycle()
            "data:image/png;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
        } catch (_: Exception) {
            null
        }
    }

    private fun iconFor(pm: PackageManager, pkg: String, loader: () -> android.graphics.drawable.Drawable?): String? {
        iconCache.get(pkg)?.let { return it }
        val encoded = try {
            loader()?.let { drawableToBase64(it) }
        } catch (_: Exception) {
            null
        }
        if (encoded != null) iconCache.put(pkg, encoded)
        return encoded
    }

    private fun isIgnoringBatteryOpt(): Boolean {
        val c = ctx() ?: return false
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return true
        return (c.getSystemService(Context.POWER_SERVICE) as? PowerManager)
            ?.isIgnoringBatteryOptimizations(c.packageName) ?: false
    }

    @Suppress("DEPRECATION")
    private fun isBackgroundAllowed(): Boolean {
        val c = ctx() ?: return false
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val am = c.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
                if (am.isBackgroundRestricted) return false
            }

            val appOps = c.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val uid = Process.myUid()
            val pkg = c.packageName

            val ops = buildList {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) add("android:run_in_background")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) add("android:run_any_in_background")
            }

            for (op in ops) {
                when (appOps.checkOpNoThrow(op, uid, pkg)) {
                    AppOpsManager.MODE_IGNORED,
                    AppOpsManager.MODE_ERRORED,
                    AppOpsManager.MODE_FOREGROUND -> {
                        Log.d(TAG, "$op restricted (${Build.MANUFACTURER} ${Build.MODEL})")
                        return false
                    }
                }
            }
            true
        } catch (e: Exception) {
            Log.e(TAG, "Background check failed: ${e.message}")
            false
        }
    }

    private fun isBatteryGranted(): Boolean =
        if (isXiaomi) isBackgroundAllowed() else isIgnoringBatteryOpt() && isBackgroundAllowed()

    private fun isUsageStatsGranted(): Boolean {
        val c = ctx() ?: return false
        val appOps = c.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager ?: return false
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                c.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                c.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun isGranted(type: String): Boolean {
        val c = ctx() ?: return false
        return when (type) {
            "overlay" -> Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(c)
            "battery", "background" -> isBatteryGranted()
            "notification" -> NotificationManagerCompat.from(c).areNotificationsEnabled()
            "accessibility" -> YudaAccessibilityService.isServiceConnected
            "usage_stats" -> isUsageStatsGranted()
            else -> false
        }
    }

    private fun stopWatching() {
        watcher?.let { handler.removeCallbacks(it) }
        watcher = null
    }

    private fun returnToFront(attempt: Int = 0) {
        val activity = appContext.currentActivity
        if (activity == null) {
            Log.w(TAG, "returnToFront: currentActivity null")
            return
        }

        handler.post {
            try {
                val am = activity.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
                am?.appTasks?.firstOrNull()?.moveToFront()
            } catch (e: Exception) {
                Log.w(TAG, "appTask.moveToFront gagal: ${e.message}")
            }

            try {
                val am = activity.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
                am?.moveTaskToFront(activity.taskId, ActivityManager.MOVE_TASK_NO_USER_ACTION)
            } catch (e: Exception) {
                Log.w(TAG, "moveTaskToFront gagal: ${e.message}")
            }

            try {
                val i = Intent(activity, activity.javaClass).apply {
                    addFlags(
                        Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or
                            Intent.FLAG_ACTIVITY_SINGLE_TOP or
                            Intent.FLAG_ACTIVITY_CLEAR_TOP
                    )
                }
                activity.startActivity(i)
            } catch (e: Exception) {
                Log.w(TAG, "startActivity(activity) gagal: ${e.message}")
            }

            try {
                activity.packageManager.getLaunchIntentForPackage(activity.packageName)?.let {
                    it.addFlags(
                        Intent.FLAG_ACTIVITY_NEW_TASK or
                            Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or
                            Intent.FLAG_ACTIVITY_SINGLE_TOP
                    )
                    activity.applicationContext.startActivity(it)
                }
            } catch (e: Exception) {
                Log.w(TAG, "launch intent gagal: ${e.message}")
            }
        }

        if (attempt < 3) {
            handler.postDelayed({
                val a = appContext.currentActivity
                if (a != null &&
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.N &&
                    a.isInPictureInPictureMode
                ) {
                    Log.d(TAG, "Masih PiP, ulangi returnToFront (${attempt + 1})")
                    returnToFront(attempt + 1)
                }
            }, 400L)
        }
    }

    private fun startWatching(type: String, timeoutMs: Long = 120_000L) {
        stopWatching()
        val startAt = SystemClock.elapsedRealtime()
        val r = object : Runnable {
            override fun run() {
                if (isGranted(type)) {
                    stopWatching()
                    returnToFront()
                    try {
                        sendEvent("onPermissionGranted", mapOf("type" to type))
                    } catch (e: Exception) {
                        Log.e(TAG, "Gagal kirim event: ${e.message}")
                    }
                    return
                }
                if (SystemClock.elapsedRealtime() - startAt > timeoutMs) {
                    stopWatching()
                    return
                }
                handler.postDelayed(this, 350)
            }
        }
        watcher = r
        handler.postDelayed(r, 500)
    }

    private fun launchSettingWithPip(
        type: String,
        intents: List<Intent>,
        usePip: Boolean = true
    ) {
        val activity = appContext.currentActivity ?: return
        activity.runOnUiThread {
            val app = activity.applicationContext

            fun openSettings() {
                for (intent in intents) {
                    try {
                        if (usePip) {
                            intent.addFlags(
                                Intent.FLAG_ACTIVITY_NEW_TASK or
                                    Intent.FLAG_ACTIVITY_NO_HISTORY or
                                    Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
                            )
                            app.startActivity(intent)
                        } else {
                            activity.startActivity(intent)
                        }
                        return
                    } catch (e: Exception) {
                        try {
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            activity.startActivity(intent)
                            return
                        } catch (e2: Exception) {
                            Log.w(TAG, "Intent gagal (${intent.action}): ${e2.message}")
                        }
                    }
                }
            }

            var pipRequested = false
            if (usePip &&
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
                activity.packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)
            ) {
                try {
                    val params = PictureInPictureParams.Builder()
                        .setAspectRatio(Rational(16, 9))
                        .build()
                    activity.setPictureInPictureParams(params)
                    pipRequested = activity.enterPictureInPictureMode(params)
                    Log.d(TAG, "enterPiP result: $pipRequested")
                } catch (e: Exception) {
                    Log.e(TAG, "enterPiP gagal: ${e.message}")
                }
            }

            if (pipRequested) {
                val startAt = SystemClock.elapsedRealtime()
                val poll = object : Runnable {
                    override fun run() {
                        val inPip = Build.VERSION.SDK_INT >= Build.VERSION_CODES.N &&
                            activity.isInPictureInPictureMode
                        if (inPip || SystemClock.elapsedRealtime() - startAt > 1500L) {
                            Log.d(TAG, "Buka pengaturan, inPip=$inPip")
                            handler.postDelayed({ openSettings() }, 250L)
                        } else {
                            handler.postDelayed(this, 50L)
                        }
                    }
                }
                handler.postDelayed(poll, 50L)
            } else {
                openSettings()
            }

            startWatching(type)
        }
    }

    private fun appDetailsIntent(pkg: String) =
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$pkg"))

    override fun definition() = ModuleDefinition {

        Name("YudaPip")

        Events("onPermissionGranted")

        OnDestroy {
            stopWatching()
            iconCache.evictAll()
        }

        Function("stopWatching") { stopWatching() }

        Function("isPipSupported") {
            val activity = appContext.currentActivity ?: return@Function false
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
                activity.packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)
        }

        Function("isInPipMode") {
            val activity = appContext.currentActivity ?: return@Function false
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && activity.isInPictureInPictureMode
        }

        Function("enterPip") { width: Int?, height: Int? ->
            val activity = appContext.currentActivity ?: return@Function false
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return@Function false

            activity.runOnUiThread {
                try {
                    val params = PictureInPictureParams.Builder()
                        .setAspectRatio(Rational(width ?: 16, height ?: 9))
                        .build()
                    activity.setPictureInPictureParams(params)
                    activity.enterPictureInPictureMode(params)
                } catch (e: Exception) {
                    Log.e(TAG, "Gagal enterPip: ${e.message}")
                }
            }
            true
        }

        Function("bringToFront") {
            returnToFront()
            true
        }

        Function("canDrawOverlays") { isGranted("overlay") }

        Function("isIgnoringBatteryOptimizations") { isGranted("battery") }

        Function("isBackgroundActivityAllowed") { isBackgroundAllowed() }

        Function("canReceiveNotifications") { isGranted("notification") }

        Function("isXiaomiDevice") { isXiaomi }

        // ── REQUEST IZIN ──

        Function("openAppDetails") {
            val activity = appContext.currentActivity ?: return@Function false
            try {
                activity.startActivity(
                    appDetailsIntent(activity.packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                )
                true
            } catch (_: Exception) {
                false
            }
        }

        Function("requestOverlayWithPip") {
            val activity = appContext.currentActivity ?: return@Function false
            val pkg = activity.packageName

            val intents = buildList {
                if (isXiaomi) {
                    add(Intent("miui.intent.action.APP_PERM_EDITOR").apply {
                        setClassName(
                            "com.miui.securitycenter",
                            "com.miui.permcenter.permissions.PermissionsEditorActivity"
                        )
                        putExtra("extra_pkgname", pkg)
                    })
                }
                add(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$pkg")))
                add(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION))
            }

            launchSettingWithPip("overlay", intents, usePip = true)
            true
        }

        Function("requestBatteryWithPip") {
            val activity = appContext.currentActivity ?: return@Function false
            val pkg = activity.packageName

            val intents = buildList {
                if (isXiaomi) {
                    add(Intent().apply {
                        setClassName(
                            "com.miui.powerkeeper",
                            "com.miui.powerkeeper.ui.HiddenAppsConfigActivity"
                        )
                        putExtra("package_name", pkg)
                        putExtra(
                            "package_label",
                            activity.applicationInfo.loadLabel(activity.packageManager)
                        )
                    })
                    add(Intent("miui.intent.action.OP_AUTO_START").addCategory(Intent.CATEGORY_DEFAULT))
                    add(appDetailsIntent(pkg))
                } else {
                    if (!isIgnoringBatteryOpt()) {
                        add(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:$pkg")))
                        add(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
                    }
                    add(appDetailsIntent(pkg))
                }
            }

            val needsSettingsPage = isXiaomi || isIgnoringBatteryOpt()
            launchSettingWithPip("battery", intents, usePip = needsSettingsPage)
            true
        }

        Function("requestNotificationWithPip") {
            val activity = appContext.currentActivity ?: return@Function false
            val pkg = activity.packageName

            val intents = buildList {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    add(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, pkg))
                }
                add(appDetailsIntent(pkg))
            }

            launchSettingWithPip("notification", intents, usePip = true)
            true
        }

        Function("requestAccessibilityWithPip") {
            val intents = listOf(
                Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            )
            launchSettingWithPip("accessibility", intents, usePip = true)
            true
        }

        Function("hasUsageStatsPermission") {
            isUsageStatsGranted()
        }

        Function("requestUsageStatsWithPip") {
            val activity = appContext.currentActivity ?: return@Function false
            val pkg = activity.packageName
            val intents = listOf(
                Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS, Uri.parse("package:$pkg")),
                Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            )
            launchSettingWithPip("usage_stats", intents, usePip = true)
            true
        }

        AsyncFunction("getInstalledApps") { includeIcons: Boolean? ->
            val context = ctx() ?: return@AsyncFunction emptyList<Map<String, String>>()
            val pm = context.packageManager
            val ourPackage = context.packageName
            val withIcons = includeIcons ?: true

            val mainIntent = Intent(Intent.ACTION_MAIN, null).addCategory(Intent.CATEGORY_LAUNCHER)

            val infos = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                pm.queryIntentActivities(mainIntent, PackageManager.ResolveInfoFlags.of(0L))
            } else {
                @Suppress("DEPRECATION")
                pm.queryIntentActivities(mainIntent, 0)
            }

            infos
                .asSequence()
                .filter { it.activityInfo.packageName != ourPackage }
                .distinctBy { it.activityInfo.packageName }
                .map { info ->
                    val pkg = info.activityInfo.packageName
                    val item = mutableMapOf(
                        "packageName" to pkg,
                        "appName" to info.loadLabel(pm).toString()
                    )
                    if (withIcons) {
                        iconFor(pm, pkg) { info.loadIcon(pm) }?.let { item["iconUri"] = it }
                    }
                    item as Map<String, String>
                }
                .sortedBy { it["appName"]?.lowercase() ?: "" }
                .toList()
        }

        AsyncFunction("getAppIcon") { packageName: String ->
            val context = ctx() ?: return@AsyncFunction null
            val pm = context.packageManager
            iconFor(pm, packageName) {
                try {
                    pm.getApplicationIcon(packageName)
                } catch (_: Exception) {
                    null
                }
            }
        }

        Function("isPackageInstalled") { packageName: String ->
            val pm = ctx()?.packageManager ?: return@Function false
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    pm.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(0L))
                } else {
                    @Suppress("DEPRECATION")
                    pm.getPackageInfo(packageName, 0)
                }
                true
            } catch (_: Exception) {
                false
            }
        }

        Function("setTargetPackages") { packages: List<String> ->
            val context = ctx() ?: return@Function false
            setTargetPackages(context, packages)
            true
        }

        Function("getTargetPackages") {
            val context = ctx() ?: return@Function DEFAULT_TARGET_PACKAGES.toList()
            getTargetPackages(context).toList()
        }

        Function("setAppDetectionMode") { appId: String, mode: String ->
            val context = ctx() ?: return@Function false
            setAppDetectionMode(context, appId, mode)
            true
        }

        Function("getAppDetectionMode") { appId: String ->
            val context = ctx() ?: return@Function "trigger_only"
            getAppDetectionMode(context, appId)
        }

        Function("setIntervalMinutes") { minutes: Int ->
            val context = ctx() ?: return@Function false
            setIntervalMinutes(context, minutes)
            if (YudaOverlayService.isRunning) {
                try {
                    val intent = Intent(context, YudaOverlayService::class.java).apply {
                        action = YudaOverlayService.ACTION_UPDATE_INTERVAL
                        putExtra(YudaOverlayService.EXTRA_INTERVAL_SECONDS, minutes * 60)
                    }
                    context.startService(intent)
                } catch (_: Exception) {
                }
            }
            true
        }

        Function("getIntervalMinutes") {
            val context = ctx() ?: return@Function DEFAULT_INTERVAL_MINUTES
            getIntervalMinutes(context)
        }

        Function("setPauseDurationSeconds") { seconds: Int ->
            val context = ctx() ?: return@Function false
            setPauseDurationSeconds(context, seconds)
            true
        }

        Function("getPauseDurationSeconds") {
            val context = ctx() ?: return@Function DEFAULT_PAUSE_DURATION_SECONDS
            getPauseDurationSeconds(context)
        }

        Function("startOverlayMonitor") { userName: String?, targetPackages: List<String>?, testMode: Boolean?, intervalSeconds: Int? ->
            val context = ctx() ?: return@Function false

            if (!isGranted("overlay")) {
                Log.w(TAG, "startOverlayMonitor dibatalkan: izin overlay belum diberikan")
                return@Function false
            }

            if (!targetPackages.isNullOrEmpty()) {
                setTargetPackages(context, targetPackages)
            }

            try {
                val intent = Intent(context, YudaOverlayService::class.java).apply {
                    action = YudaOverlayService.ACTION_START
                    putExtra(YudaOverlayService.EXTRA_USER_NAME, userName ?: "Gathan")
                    putExtra(YudaOverlayService.EXTRA_TEST_MODE, testMode ?: true)
                    putExtra(YudaOverlayService.EXTRA_INTERVAL_SECONDS, intervalSeconds ?: 30)
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
                true
            } catch (e: Throwable) {
                Log.e(TAG, "Gagal startOverlayMonitor: ${e.message}")
                false
            }
        }

        Function("stopOverlayMonitor") {
            val context = ctx() ?: return@Function false
            try {
                val intent = Intent(context, YudaOverlayService::class.java).apply {
                    action = YudaOverlayService.ACTION_STOP
                }
                context.startService(intent)
                true
            } catch (e: Exception) {
                false
            }
        }

        Function("isOverlayMonitorRunning") {
            YudaOverlayService.isRunning
        }

        Function("isAccessibilityServiceEnabled") {
            YudaAccessibilityService.isServiceConnected
        }

        Function("openAccessibilitySettings") {
            val context = ctx() ?: return@Function false
            try {
                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
                true
            } catch (e: Exception) {
                false
            }
        }

        Function("getTotalReelsDurationSeconds") {
            val context = ctx() ?: return@Function 0L
            val prefs = context.getSharedPreferences("yuda_overlay_prefs", Context.MODE_PRIVATE)
            val ms = prefs.getLong("total_reels_duration_ms", 0L)
            ms / 1000L
        }

        Function("dismissActiveAlert") { reason: String? ->
            val context = ctx() ?: return@Function false
            try {
                val intent = Intent(context, YudaOverlayService::class.java).apply {
                    action = YudaOverlayService.ACTION_DISMISS_ALERT
                    putExtra(YudaOverlayService.EXTRA_DISMISS_REASON, reason ?: "dismiss")
                }
                context.startService(intent)
                true
            } catch (_: Exception) {
                false
            }
        }

        /**
         * Mengambil statistik penggunaan aplikasi media sosial langsung dari UsageStatsManager Android.
         * Mengembalikan:
         * - weekly: List per hari (Senin s.d. Minggu) dengan total jam & menit
         * - today_slots: Map 12 slot 2-jam hari ini (slot_00_02 s.d. slot_22_00)
         * - today_total_minutes: Total menit hari ini
         * - ranking: List aplikasi teratas beserta menit penggunaan
         */
        AsyncFunction("getAndroidUsageStats") { daysBack: Int? ->
            val context = ctx() ?: return@AsyncFunction emptyMap<String, Any>()
            if (!isUsageStatsGranted()) {
                Log.w(TAG, "getAndroidUsageStats: Izin UsageStats belum diizinkan")
                return@AsyncFunction mapOf("has_permission" to false)
            }

            val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
                ?: return@AsyncFunction emptyMap<String, Any>()

            val days = daysBack ?: 7
            val now = System.currentTimeMillis()
            val installedAt = getAppInstalledTime(context)

            // Start date instalasi Yuda (pukul 00:00:00 di hari instalasi)
            val installCal = Calendar.getInstance().apply {
                timeInMillis = installedAt
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
            val installDayStart = installCal.timeInMillis

            val calendar = Calendar.getInstance()
            calendar.timeInMillis = now
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            calendar.set(Calendar.MILLISECOND, 0)
            val todayStart = calendar.timeInMillis

            // Start of week (Senin)
            val weekCalendar = Calendar.getInstance()
            weekCalendar.timeInMillis = todayStart
            var dayOfWeek = weekCalendar.get(Calendar.DAY_OF_WEEK) // 1=Sun, 2=Mon...
            val diffToMonday = if (dayOfWeek == Calendar.SUNDAY) -6 else Calendar.MONDAY - dayOfWeek
            weekCalendar.add(Calendar.DAY_OF_MONTH, diffToMonday)
            val weekStart = weekCalendar.timeInMillis

            val appPkgMap = mapOf(
                "com.instagram.android" to "instagram",
                "com.instagram.barcelona" to "threads",
                "com.zhiliaoapp.musically" to "tiktok",
                "com.ss.android.ugc.trill" to "tiktok",
                "com.facebook.katana" to "facebook",
                "com.facebook.lite" to "facebook",
                "com.google.android.youtube" to "youtube",
                "com.twitter.android" to "x",
                "com.twitter.android.lite" to "x"
            )

            val appNames = mapOf(
                "instagram" to "Instagram",
                "tiktok" to "TikTok",
                "facebook" to "Facebook",
                "youtube" to "YouTube",
                "threads" to "Threads",
                "x" to "X (Twitter)"
            )

            // 1. Hitung ranking total & tren mingguan
            val weeklyEvents = usm.queryEvents(weekStart, now)
            val event = UsageEvents.Event()

            val dayMinutesMap = mutableMapOf<Int, Long>() // Day of week (1=Mon ... 7=Sun) -> ms
            for (i in 1..7) dayMinutesMap[i] = 0L

            val appTotalMs = mutableMapOf<String, Long>()
            appNames.keys.forEach { appTotalMs[it] = 0L }

            val todaySlotsMs = IntArray(12) { 0 }
            var todayTotalMs = 0L

            // Map untuk menyimpan 12 slot per hari dalam minggu (1=Mon .. 7=Sun)
            val daySlotsMap = mutableMapOf<Int, IntArray>()
            // Map untuk menyimpan durasi per app per hari dalam minggu (1=Mon .. 7=Sun -> (appKey -> ms))
            val dayAppMsMap = mutableMapOf<Int, MutableMap<String, Long>>()
            for (i in 1..7) {
                daySlotsMap[i] = IntArray(12) { 0 }
                val appMap = mutableMapOf<String, Long>()
                appNames.keys.forEach { appMap[it] = 0L }
                dayAppMsMap[i] = appMap
            }

            var lastApp: String? = null
            var lastEventTime: Long = 0L

            while (weeklyEvents.hasNextEvent()) {
                weeklyEvents.getNextEvent(event)
                val targetKey = appPkgMap[event.packageName] ?: continue

                if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED ||
                    event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND
                ) {
                    lastApp = targetKey
                    lastEventTime = event.timeStamp
                } else if (
                    (event.eventType == UsageEvents.Event.ACTIVITY_PAUSED ||
                        event.eventType == UsageEvents.Event.MOVE_TO_BACKGROUND) &&
                    lastApp == targetKey && lastEventTime > 0
                ) {
                    val duration = (event.timeStamp - lastEventTime).coerceAtLeast(0L)

                    // Hanya akumulasikan jika terjadi SEJAK aplikasi Yuda diinstall
                    if (event.timeStamp >= installDayStart) {
                        appTotalMs[targetKey] = (appTotalMs[targetKey] ?: 0L) + duration
                    }

                    // Tambah ke hari dalam minggu (hanya jika hari tersebut >= hari install Yuda ATAU sudah lewat 1 minggu)
                    val isPastFirstWeek = (now - installDayStart) >= 7L * 24 * 3600 * 1000
                    val isAfterOrOnInstallDay = event.timeStamp >= installDayStart

                    val eventCal = Calendar.getInstance().apply { timeInMillis = event.timeStamp }
                    val dWeek = eventCal.get(Calendar.DAY_OF_WEEK)
                    val monIdx = if (dWeek == Calendar.SUNDAY) 7 else dWeek - 1 // 1=Mon .. 7=Sun

                    if (isPastFirstWeek || isAfterOrOnInstallDay) {
                        dayMinutesMap[monIdx] = (dayMinutesMap[monIdx] ?: 0L) + duration

                        val currentDayAppMap = dayAppMsMap[monIdx]
                        if (currentDayAppMap != null) {
                            currentDayAppMap[targetKey] = (currentDayAppMap[targetKey] ?: 0L) + duration
                        }

                        val hour = eventCal.get(Calendar.HOUR_OF_DAY)
                        val slotIdx = (hour / 2).coerceIn(0, 11)
                        val durMinutes = (duration / 60000L).toInt()

                        daySlotsMap[monIdx]?.let { slotsArr ->
                            slotsArr[slotIdx] += durMinutes
                        }
                    }

                    val durMinutes = (duration / 60000L).toInt()

                    // Tambah ke slot hari ini jika terjadi hari ini
                    if (event.timeStamp >= todayStart) {
                        todayTotalMs += duration
                        val hour = eventCal.get(Calendar.HOUR_OF_DAY)
                        val slotIdx = (hour / 2).coerceIn(0, 11)
                        todaySlotsMs[slotIdx] += durMinutes
                    }

                    lastApp = null
                    lastEventTime = 0L
                }
            }

            // Format Weekly Data (Sen s.d. Min)
            val slotNames = listOf(
                "slot_00_02", "slot_02_04", "slot_04_06", "slot_06_08",
                "slot_08_10", "slot_10_12", "slot_12_14", "slot_14_16",
                "slot_16_18", "slot_18_20", "slot_20_22", "slot_22_00"
            )

            val dayLabels = listOf("Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min")
            val weeklyList = dayLabels.mapIndexed { idx, label ->
                val dayNum = idx + 1
                val ms = dayMinutesMap[dayNum] ?: 0L
                val mins = (ms / 60000L).toInt()
                val hoursVal = Math.round((mins / 60.0) * 10) / 10.0

                val daySlotsArr = daySlotsMap[dayNum] ?: IntArray(12) { 0 }
                val daySlotsObj = mutableMapOf<String, Int>()
                slotNames.forEachIndexed { sIdx, sName ->
                    daySlotsObj[sName] = daySlotsArr[sIdx]
                }

                // Hitung ranking aplikasi spesifik di hari tersebut
                val dayAppMap = dayAppMsMap[dayNum] ?: emptyMap<String, Long>()
                val dayTotalMins = (dayAppMap.values.sum() / 60000L).toInt()
                val sortedDayApps = dayAppMap.entries
                    .map { (key, aMs) ->
                        val aMins = (aMs / 60000L).toInt()
                        Triple(key, appNames[key] ?: key, aMins)
                    }
                    .sortedByDescending { it.third }

                val dayRanking = sortedDayApps.mapIndexed { rIdx, (key, name, aMins) ->
                    val percentage = if (dayTotalMins > 0) Math.round((aMins.toDouble() / dayTotalMins) * 1000) / 10.0 else 0.0
                    mapOf(
                        "rank" to (rIdx + 1),
                        "key" to key,
                        "name" to name,
                        "minutes" to aMins,
                        "percentage" to percentage
                    )
                }

                mapOf(
                    "day" to label,
                    "minutes" to mins,
                    "value" to hoursVal,
                    "slots" to daySlotsObj,
                    "ranking" to dayRanking
                )
            }

            // Format 12 Slots Hari Ini
            val slotsMap = mutableMapOf<String, Int>()
            slotNames.forEachIndexed { idx, name ->
                slotsMap[name] = todaySlotsMs[idx]
            }

            // Format Ranking
            val totalAllMinutes = (appTotalMs.values.sum() / 60000L).toInt()
            val sortedApps = appTotalMs.entries
                .map { (key, ms) ->
                    val mins = (ms / 60000L).toInt()
                    Triple(key, appNames[key] ?: key, mins)
                }
                .sortedByDescending { it.third }

            val ranking = sortedApps.mapIndexed { index, (key, name, mins) ->
                val percentage = if (totalAllMinutes > 0) Math.round((mins.toDouble() / totalAllMinutes) * 1000) / 10.0 else 0.0
                mapOf(
                    "rank" to (index + 1),
                    "key" to key,
                    "name" to name,
                    "minutes" to mins,
                    "percentage" to percentage
                )
            }

            val topApp = ranking.firstOrNull() ?: mapOf(
                "rank" to 1,
                "key" to "instagram",
                "name" to "Instagram",
                "minutes" to 0,
                "percentage" to 0.0
            )

            // Durasi per app per hari ini (untuk disetor ke backend setiap hari)
            val todayAppsMinutes = mutableMapOf<String, Int>()
            appNames.keys.forEach { todayAppsMinutes[it] = 0 }

            val todayEvents = usm.queryEvents(todayStart, now)
            var tLastApp: String? = null
            var tLastEventTime: Long = 0L

            while (todayEvents.hasNextEvent()) {
                todayEvents.getNextEvent(event)
                val targetKey = appPkgMap[event.packageName] ?: continue

                if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED ||
                    event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND
                ) {
                    tLastApp = targetKey
                    tLastEventTime = event.timeStamp
                } else if (
                    (event.eventType == UsageEvents.Event.ACTIVITY_PAUSED ||
                        event.eventType == UsageEvents.Event.MOVE_TO_BACKGROUND) &&
                    tLastApp == targetKey && tLastEventTime > 0
                ) {
                    val duration = (event.timeStamp - tLastEventTime).coerceAtLeast(0L)
                    val m = (duration / 60000L).toInt()
                    todayAppsMinutes[targetKey] = (todayAppsMinutes[targetKey] ?: 0) + m
                    tLastApp = null
                    tLastEventTime = 0L
                }
            }

            mapOf(
                "has_permission" to true,
                "today_total_minutes" to (todayTotalMs / 60000L).toInt(),
                "today_apps" to todayAppsMinutes,
                "slots" to slotsMap,
                "weekly" to weeklyList,
                "ranking" to ranking,
                "top_app" to topApp,
                "total_all_minutes" to totalAllMinutes,
                "installed_at" to installedAt
            )
        }
    }
}