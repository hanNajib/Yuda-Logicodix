import { AuthUser, signOutNativeGoogle } from '@/features/auth/services/authService';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import YudaPip from '@/modules/yuda-pip';

const TOKEN_KEY = 'user_token';
const USER_KEY = 'user_data';
const ONBOARDING_KEY = 'onboarding_completed';
const USER_NAME_KEY = 'user_name';
const TARGET_PACKAGES_KEY = 'selected_target_packages';
const INTERVAL_MINUTES_KEY = 'selected_interval_minutes';
const TONE_STYLE_KEY = 'intervention_tone_style';
const PAUSE_DURATION_KEY = 'intervention_pause_duration';
const DETECTION_MODES_KEY = 'app_detection_modes';

export const DEFAULT_TARGET_PACKAGES = [
    'com.instagram.android',
    'com.zhiliaoapp.musically',
    'com.ss.android.ugc.trill',
    'com.facebook.katana',
    'com.facebook.lite',
    'com.google.android.youtube',
    'com.instagram.barcelona',
    'com.twitter.android',
    'com.twitter.android.lite',
];

interface AuthState {
    isHydrated: boolean;
    hasCompletedOnboarding: boolean;
    userToken: string | null;
    user: AuthUser | null;
    userName: string | null;
    selectedTargetPackages: string[];
    appDetectionModes: Record<string, 'all' | 'trigger_only'>;
    intervalMinutes: number;
    toneStyle: string;
    pauseDuration: number;

    hydrateAuth: () => Promise<void>;
    setAuthSession: (token: string, user: AuthUser) => Promise<void>;
    completeOnboarding: () => Promise<void>;
    logout: () => Promise<void>;

    setCompletedOnboarding: (status: boolean) => void;
    setUserToken: (token: string | null) => void;
    setUserName: (name: string | null) => Promise<void>;
    setSelectedTargetPackages: (packages: string[]) => Promise<void>;
    setAppDetectionMode: (appId: string, mode: 'all' | 'trigger_only') => Promise<void>;
    setIntervalMinutes: (minutes: number) => Promise<void>;
    saveInterventionSettingsLocally: (settings: {
        tone_style?: string;
        scroll_interval_minutes?: number;
        current_pause_duration?: number;
    }) => Promise<void>;
    updateUserProfile: (profile: {
        name?: string | null;
        full_name?: string | null;
        birth_date?: string | null;
    }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isHydrated: false,
    hasCompletedOnboarding: false,
    userToken: null,
    user: null,
    userName: null,
    selectedTargetPackages: DEFAULT_TARGET_PACKAGES,
    appDetectionModes: {
        instagram: 'trigger_only',
        facebook: 'trigger_only',
        threads: 'trigger_only',
        youtube: 'trigger_only',
        twitter: 'trigger_only',
        tiktok: 'trigger_only',
    },
    intervalMinutes: 15,
    toneStyle: 'lembut',
    pauseDuration: 30,

    hydrateAuth: async () => {
        try {
            const [
                token,
                userJson,
                onboarding,
                savedName,
                savedPackagesJson,
                savedInterval,
                savedTone,
                savedDuration,
                savedModesJson,
            ] = await Promise.all([
                SecureStore.getItemAsync(TOKEN_KEY),
                SecureStore.getItemAsync(USER_KEY),
                SecureStore.getItemAsync(ONBOARDING_KEY),
                SecureStore.getItemAsync(USER_NAME_KEY),
                SecureStore.getItemAsync(TARGET_PACKAGES_KEY),
                SecureStore.getItemAsync(INTERVAL_MINUTES_KEY),
                SecureStore.getItemAsync(TONE_STYLE_KEY),
                SecureStore.getItemAsync(PAUSE_DURATION_KEY),
                SecureStore.getItemAsync(DETECTION_MODES_KEY),
            ]);

            let parsedUser: AuthUser | null = null;
            if (userJson) {
                try {
                    parsedUser = JSON.parse(userJson);
                } catch {
                    parsedUser = null;
                }
            }

            let packages: string[] = DEFAULT_TARGET_PACKAGES;
            if (savedPackagesJson) {
                try {
                    const parsed = JSON.parse(savedPackagesJson);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        packages = parsed;
                    }
                } catch {
                    packages = DEFAULT_TARGET_PACKAGES;
                }
            }

            if (typeof YudaPip.setTargetPackages === 'function') {
                YudaPip.setTargetPackages(packages);
            }

            let intervalVal = 15;
            if (savedInterval) {
                const parsedInt = parseInt(savedInterval, 10);
                if (!isNaN(parsedInt) && parsedInt > 0) {
                    intervalVal = parsedInt;
                }
            }
            if (typeof YudaPip.setIntervalMinutes === 'function') {
                YudaPip.setIntervalMinutes(intervalVal);
            }

            let toneVal = 'lembut';
            if (savedTone) {
                toneVal = savedTone;
            }

            let durationVal = 30;
            if (savedDuration) {
                const parsedDur = parseInt(savedDuration, 10);
                if (!isNaN(parsedDur) && parsedDur > 0) {
                    durationVal = parsedDur;
                }
            }

            let modesVal: Record<string, 'all' | 'trigger_only'> = {
                instagram: 'trigger_only',
                facebook: 'trigger_only',
                threads: 'trigger_only',
                youtube: 'trigger_only',
                twitter: 'trigger_only',
                tiktok: 'trigger_only',
            };
            if (savedModesJson) {
                try {
                    const parsed = JSON.parse(savedModesJson);
                    if (parsed && typeof parsed === 'object') {
                        modesVal = { ...modesVal, ...parsed };
                    }
                } catch {
                    // ignore
                }
            }

            if (typeof YudaPip.setAppDetectionMode === 'function') {
                Object.entries(modesVal).forEach(([appId, mode]) => {
                    YudaPip.setAppDetectionMode(appId, mode);
                });
            }

            set({
                userToken: token || null,
                user: parsedUser,
                userName: savedName || parsedUser?.name || null,
                selectedTargetPackages: packages,
                appDetectionModes: modesVal,
                intervalMinutes: intervalVal,
                toneStyle: toneVal,
                pauseDuration: durationVal,
                hasCompletedOnboarding: onboarding === 'true',
                isHydrated: true,
            });
        } catch (error) {
            console.error("Gagal melakukan hydration state autentikasi:", error);
            set({ isHydrated: true });
        }
    },

    setAuthSession: async (token: string, user: AuthUser) => {
        await Promise.all([
            SecureStore.setItemAsync(TOKEN_KEY, token),
            SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
            user.name ? SecureStore.setItemAsync(USER_NAME_KEY, user.name) : Promise.resolve(),
        ]);

        const currentTone = get().toneStyle || 'lembut';
        const currentInterval = get().intervalMinutes || 15;

        // Jika user baru login dan memiliki preferensi lokal, sinkronkan ke server dengan user_id
        if (token && user.id) {
            try {
                const { API_ENDPOINTS } = require('@/constants/api');
                fetch(API_ENDPOINTS.interventionSettings, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        scroll_interval_minutes: currentInterval,
                        tone_style: currentTone,
                    }),
                }).catch((err) => console.warn('Gagal background sync settings intervensi pasca login:', err));
            } catch (err) {
                // ignore
            }
        }

        set({
            userToken: token,
            user,
            userName: user.name,
        });
    },

    completeOnboarding: async () => {
        await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
        set({ hasCompletedOnboarding: true });
    },

    logout: async () => {
        try {
            await Promise.all([
                SecureStore.deleteItemAsync(TOKEN_KEY),
                SecureStore.deleteItemAsync(USER_KEY),
                SecureStore.deleteItemAsync(ONBOARDING_KEY),
                SecureStore.deleteItemAsync(USER_NAME_KEY),
            ]);

            await signOutNativeGoogle();
        } catch (err) {
            console.warn("Kesalahan saat membersihkan sesi:", err);
        }

        set({
            userToken: null,
            user: null,
            userName: null,
            hasCompletedOnboarding: false,
        });
    },

    setCompletedOnboarding: (status: boolean) => {
        SecureStore.setItemAsync(ONBOARDING_KEY, status ? 'true' : 'false').catch(() => {});
        set({ hasCompletedOnboarding: status });
    },

    setUserToken: (token: string | null) => {
        if (token) {
            SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {});
        } else {
            SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        }
        set({ userToken: token });
    },

    setUserName: async (name: string | null) => {
        try {
            if (name) {
                await SecureStore.setItemAsync(USER_NAME_KEY, name);
            } else {
                await SecureStore.deleteItemAsync(USER_NAME_KEY);
            }
        } catch (e) {
            console.warn("Gagal menyimpan nama user:", e);
        }

        const currentUser = get().user;
        if (currentUser && name) {
            const updatedUser = { ...currentUser, name };
            SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser)).catch(() => {});
            set({ userName: name, user: updatedUser });
        } else {
            set({ userName: name });
        }
    },

    setSelectedTargetPackages: async (packages: string[]) => {
        try {
            await SecureStore.setItemAsync(TARGET_PACKAGES_KEY, JSON.stringify(packages));
            if (typeof YudaPip.setTargetPackages === 'function') {
                YudaPip.setTargetPackages(packages);
            }
        } catch (e) {
            console.warn("Gagal menyimpan target packages:", e);
        }
        set({ selectedTargetPackages: packages });
    },

    setAppDetectionMode: async (appId: string, mode: 'all' | 'trigger_only') => {
        try {
            const currentModes = get().appDetectionModes;
            const updatedModes = {
                ...currentModes,
                [appId]: mode,
            };

            await SecureStore.setItemAsync(DETECTION_MODES_KEY, JSON.stringify(updatedModes));
            if (typeof YudaPip.setAppDetectionMode === 'function') {
                YudaPip.setAppDetectionMode(appId, mode);
            }

            set({ appDetectionModes: updatedModes });
        } catch (e) {
            console.warn("Gagal menyimpan app detection mode lokal:", e);
        }
    },

    setIntervalMinutes: async (minutes: number) => {
        try {
            await SecureStore.setItemAsync(INTERVAL_MINUTES_KEY, minutes.toString());
            if (typeof YudaPip.setIntervalMinutes === 'function') {
                YudaPip.setIntervalMinutes(minutes);
            }
        } catch (e) {
            console.warn("Gagal menyimpan interval jeda:", e);
        }
        set({ intervalMinutes: minutes });
    },

    saveInterventionSettingsLocally: async ({
        tone_style,
        scroll_interval_minutes,
        current_pause_duration,
    }) => {
        try {
            const promises: Promise<any>[] = [];
            const nextState: Partial<AuthState> = {};

            if (tone_style) {
                promises.push(SecureStore.setItemAsync(TONE_STYLE_KEY, tone_style));
                nextState.toneStyle = tone_style;
            }

            if (scroll_interval_minutes && scroll_interval_minutes > 0) {
                promises.push(SecureStore.setItemAsync(INTERVAL_MINUTES_KEY, scroll_interval_minutes.toString()));
                if (typeof YudaPip.setIntervalMinutes === 'function') {
                    YudaPip.setIntervalMinutes(scroll_interval_minutes);
                }
                nextState.intervalMinutes = scroll_interval_minutes;
            }

            if (current_pause_duration && current_pause_duration > 0) {
                promises.push(SecureStore.setItemAsync(PAUSE_DURATION_KEY, current_pause_duration.toString()));
                nextState.pauseDuration = current_pause_duration;
            }

            await Promise.all(promises);
            set(nextState as any);
        } catch (e) {
            console.warn("Gagal menyimpan preferensi intervensi lokal:", e);
        }
    },

    updateUserProfile: async (profile) => {
        try {
            const currentUser = get().user;
            const updatedUser: AuthUser = currentUser
                ? {
                      ...currentUser,
                      name: profile.name !== undefined ? profile.name : currentUser.name,
                      full_name: profile.full_name !== undefined ? profile.full_name : currentUser.full_name,
                      birth_date: profile.birth_date !== undefined ? profile.birth_date : currentUser.birth_date,
                  }
                : {
                      id: 0,
                      email: '',
                      avatar: null,
                      name: profile.name || null,
                      full_name: profile.full_name || null,
                      birth_date: profile.birth_date || null,
                  };

            const promises: Promise<any>[] = [
                SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser)),
            ];

            if (profile.name) {
                promises.push(SecureStore.setItemAsync(USER_NAME_KEY, profile.name));
            }

            await Promise.all(promises);

            set({
                user: updatedUser,
                userName: updatedUser.name,
            });
        } catch (e) {
            console.warn("Gagal memperbarui profil di storage lokal:", e);
        }
    },
}));
