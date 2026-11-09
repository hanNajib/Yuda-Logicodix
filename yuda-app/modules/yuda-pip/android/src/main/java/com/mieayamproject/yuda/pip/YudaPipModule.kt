package com.mieayamproject.yuda.pip

import android.app.ActivityManager
import android.app.AppOpsManager
import android.app.PictureInPictureParams
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

class YudaPipModule : Module() {

    private val TAG = "YudaPipModule"
    private val ICON_SIZE = 96

    private val handler = Handler(Looper.getMainLooper())
    private var watcher: Runnable? = null

    // Cache icon (packageName -> data URI) supaya tidak render ulang tiap dipanggil
    private val iconCache = LruCache<String, String>(300)

    // Xiaomi / Redmi / POCO (cukup dihitung sekali)
    private val isXiaomi: Boolean by lazy {
        val m = Build.MANUFACTURER.lowercase()
        val b = Build.BRAND.lowercase()
        listOf("xiaomi", "redmi", "poco").any { m.contains(it) || b.contains(it) }
    }

    // =========================================================
    // CONTEXT
    // =========================================================

    private fun ctx(): Context? = appContext.reactContext ?: appContext.currentActivity

    // =========================================================
    // ICON
    // =========================================================

    private fun drawableToBase64(drawable: android.graphics.drawable.Drawable): String? {
        return try {
            // Gambar langsung ke bitmap kecil (tidak membuat bitmap besar dulu)
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

    // =========================================================
    // BACKGROUND / BATTERY CHECK
    // =========================================================

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

    /**
     * Xiaomi: cukup cek background activity (opsi "No restrictions" di PowerKeeper
     * tidak selalu masuk whitelist battery-optimization AOSP).
     * Lainnya: harus masuk whitelist battery-optimization DAN tidak dibatasi background.
     */
    private fun isBatteryGranted(): Boolean =
        if (isXiaomi) isBackgroundAllowed() else isIgnoringBatteryOpt() && isBackgroundAllowed()

    private fun isGranted(type: String): Boolean {
        val c = ctx() ?: return false
        return when (type) {
            "overlay" -> Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(c)
            "battery", "background" -> isBatteryGranted()
            "notification" -> NotificationManagerCompat.from(c).areNotificationsEnabled()
            else -> false
        }
    }

    // =========================================================
    // WATCHER
    // =========================================================

    private fun stopWatching() {
        watcher?.let { handler.removeCallbacks(it) }
        watcher = null
    }

    /**
     * Mengembalikan app ke layar penuh (keluar dari PiP).
     *
     * Tiap strategi dibungkus try sendiri: sebelumnya moveTaskToFront ada di try yang sama
     * dengan startActivity, jadi kalau moveTaskToFront melempar SecurityException
     * (izin REORDER_TASKS belum ada di manifest), startActivity tidak pernah dijalankan.
     * Kalau setelah dicoba app masih PiP, diulang beberapa kali.
     */
    private fun returnToFront(attempt: Int = 0) {
        val activity = appContext.currentActivity
        if (activity == null) {
            Log.w(TAG, "returnToFront: currentActivity null")
            return
        }

        handler.post {
            // 1) AppTask.moveToFront: tidak butuh izin REORDER_TASKS
            try {
                val am = activity.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
                am?.appTasks?.firstOrNull()?.moveToFront()
            } catch (e: Exception) {
                Log.w(TAG, "appTask.moveToFront gagal: ${e.message}")
            }

            // 2) moveTaskToFront: butuh REORDER_TASKS di manifest
            try {
                val am = activity.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
                am?.moveTaskToFront(activity.taskId, ActivityManager.MOVE_TASK_NO_USER_ACTION)
            } catch (e: Exception) {
                Log.w(TAG, "moveTaskToFront gagal: ${e.message}")
            }

            // 3) startActivity ke activity yang sama -> ini yang memperbesar PiP jadi layar penuh
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

            // 4) Cadangan: launch intent app (NEW_TASK dari application context)
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

        // Kalau masih PiP, ulangi (maks 3x) -- transisi dari halaman pengaturan kadang butuh waktu
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

    /**
     * Membuka halaman/dialog izin.
     *
     * usePip = true  -> masuk mode PiP dulu (floating panduan), lalu buka halaman pengaturan.
     * usePip = false -> langsung buka dialog sistem tanpa PiP (cukup untuk izin yang
     *                   hanya butuh dialog "Izinkan/Tolak").
     */
    private fun launchSettingWithPip(
        type: String,
        intents: List<Intent>,
        usePip: Boolean = true
    ) {
        val activity = appContext.currentActivity ?: return
        activity.runOnUiThread {
            val app = activity.applicationContext

            if (usePip &&
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
                activity.packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)
            ) {
                try {
                    val params = PictureInPictureParams.Builder()
                        .setAspectRatio(Rational(16, 9))
                        .build()
                    activity.setPictureInPictureParams(params)
                    val entered = activity.enterPictureInPictureMode(params)
                    Log.d(TAG, "enterPiP result: $entered")
                } catch (e: Exception) {
                    Log.e(TAG, "enterPiP gagal: ${e.message}")
                }
            }

            handler.postDelayed({
                for (intent in intents) {
                    try {
                        if (usePip) {
                            intent.addFlags(
                                Intent.FLAG_ACTIVITY_NEW_TASK or
                                    Intent.FLAG_ACTIVITY_NO_HISTORY or
                                    Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
                            )
                        }
                        // Mode dialog: tanpa NEW_TASK supaya dialog tampil di atas app, bukan pindah task
                        activity.startActivity(intent)
                        return@postDelayed
                    } catch (e: Exception) {
                        try {
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            app.startActivity(intent)
                            return@postDelayed
                        } catch (e2: Exception) {
                            Log.w(TAG, "Intent gagal (${intent.action}): ${e2.message}")
                        }
                    }
                }
            }, if (usePip) 300L else 0L)

            startWatching(type)
        }
    }

    private fun appDetailsIntent(pkg: String) =
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$pkg"))

    // =========================================================
    // MODULE
    // =========================================================

    override fun definition() = ModuleDefinition {

        Name("YudaPip")

        Events("onPermissionGranted")

        OnDestroy {
            stopWatching()
            iconCache.evictAll()
        }

        Function("stopWatching") { stopWatching() }

        // ── PiP ──

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

        // ── STATUS IZIN ──

        Function("canDrawOverlays") { isGranted("overlay") }

        // Nama dipertahankan untuk kompatibilitas JS
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

        // Overlay: selalu butuh halaman pengaturan -> pakai PiP
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

        // Baterai: PiP hanya kalau memang harus ke halaman pengaturan
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
                    // Belum masuk whitelist -> dialog langsung; sudah masuk -> cek pembatasan di detail app
                    if (!isIgnoringBatteryOpt()) {
                        add(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:$pkg")))
                        add(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
                    }
                    add(appDetailsIntent(pkg))
                }
            }

            // Dialog sistem cukup untuk non-Xiaomi yang belum whitelist -> tanpa PiP.
            // Selain itu (Xiaomi / perlu cek pembatasan di detail app) -> pakai PiP.
            val needsSettingsPage = isXiaomi || isIgnoringBatteryOpt()
            launchSettingWithPip("battery", intents, usePip = needsSettingsPage)
            true
        }

        // Notifikasi: hanya dipanggil sebagai fallback (sudah "jangan tanya lagi" / Android < 13)
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

        // ── APLIKASI TERINSTALL ──
        // AsyncFunction: jalan di background thread, tidak memblokir JS thread.
        // includeIcons default true (kompatibel dengan versi lama); icon di-cache.

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
    }
}