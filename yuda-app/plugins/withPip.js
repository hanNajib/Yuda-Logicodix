const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = (config) =>
  withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application[0];
    const main = app.activity.find((a) => a.$['android:name'] === '.MainActivity');

    main.$['android:supportsPictureInPicture'] = 'true';

    const needed = ['screenSize', 'smallestScreenSize', 'screenLayout', 'orientation'];
    const current = (main.$['android:configChanges'] || '').split('|').filter(Boolean);
    main.$['android:configChanges'] = [...new Set([...current, ...needed])].join('|');

    return cfg;
  });