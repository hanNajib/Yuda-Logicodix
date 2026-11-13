export interface DoomscrollAppDefinition {
    id: 'instagram' | 'facebook' | 'threads' | 'youtube' | 'twitter' | 'tiktok';
    name: string;
    packages: string[];
    triggerFeatureName: string;
}

export const DOOMSCROLL_APPS: DoomscrollAppDefinition[] = [
    {
        id: 'instagram',
        name: 'Instagram',
        packages: ['com.instagram.android'],
        triggerFeatureName: 'Reels & Explore',
    },
    {
        id: 'facebook',
        name: 'Facebook',
        packages: ['com.facebook.katana', 'com.facebook.lite'],
        triggerFeatureName: 'Shorts & Video Feed',
    },
    {
        id: 'threads',
        name: 'Threads',
        packages: ['com.instagram.barcelona'],
        triggerFeatureName: 'Timeline Feed',
    },
    {
        id: 'youtube',
        name: 'YouTube',
        packages: ['com.google.android.youtube'],
        triggerFeatureName: 'YouTube Shorts',
    },
    {
        id: 'twitter',
        name: 'X (Twitter)',
        packages: ['com.twitter.android', 'com.twitter.android.lite'],
        triggerFeatureName: 'For You Timeline',
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        packages: ['com.zhiliaoapp.musically', 'com.ss.android.ugc.trill'],
        triggerFeatureName: 'FYP Video Feed',
    },
];

export const ALL_DOOMSCROLL_PACKAGES = DOOMSCROLL_APPS.flatMap((a) => a.packages);

