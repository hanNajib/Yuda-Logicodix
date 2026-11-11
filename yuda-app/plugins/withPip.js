const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = (config) =>
  withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application[0];
    const main = app.activity.find((a) => a.$['android:name'] === '.MainActivity');

    main.$['android:supportsPictureInPicture'] = 'true';

    const needed = ['screenSize', 'smallestScreenSize', 'screenLayout', 'orientation'];
    const current = (main.$['android:configChanges'] || '').split('|').filter(Boolean);
    main.$['android:configChanges'] = [...new Set([...current, ...needed])].join('|');

    const manifest = cfg.modResults.manifest;
    manifest['uses-permission'] = manifest['uses-permission'] || [];
    const permissionsToAdd = [
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_SPECIAL_USE',
    ];
    for (const p of permissionsToAdd) {
      if (!manifest['uses-permission'].some((item) => item.$['android:name'] === p)) {
        manifest['uses-permission'].push({ $: { 'android:name': p } });
      }
    }

    if (!app.service) {
      app.service = [];
    }

    const hasOverlayService = app.service.some(
      (s) => s.$['android:name'] === 'com.mieayamproject.yuda.pip.YudaOverlayService'
    );
    if (!hasOverlayService) {
      app.service.push({
        $: {
          'android:name': 'com.mieayamproject.yuda.pip.YudaOverlayService',
          'android:enabled': 'true',
          'android:exported': 'false',
          'android:foregroundServiceType': 'specialUse',
        },
        property: [
          {
            $: {
              'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
              'android:value': 'yuda_screen_time_reminder',
            },
          },
        ],
      });
    }

    const hasAccessibilityService = app.service.some(
      (s) => s.$['android:name'] === 'com.mieayamproject.yuda.pip.YudaAccessibilityService'
    );
    if (!hasAccessibilityService) {
      app.service.push({
        $: {
          'android:name': 'com.mieayamproject.yuda.pip.YudaAccessibilityService',
          'android:permission': 'android.permission.BIND_ACCESSIBILITY_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.accessibilityservice.AccessibilityService',
                },
              },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.accessibilityservice',
              'android:resource': '@xml/accessibility_service_config',
            },
          },
        ],
      });
    }

    return cfg;
  });
