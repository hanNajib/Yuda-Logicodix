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
    intervalMinutes: number;

    hydrateAuth: () => Promise<void>;
    setAuthSession: (token: string, user: AuthUser) => Promise<void>;
    completeOnboarding: () => Promise<void>;
    logout: () => Promise<void>;

    setCompletedOnboarding: (status: boolean) => void;
    setUserToken: (token: string | null) => void;
    setUserName: (name: string | null) => Promise<void>;
    setSelectedTargetPackages: (packages: string[]) => Promise<void>;
    setIntervalMinutes: (minutes: number) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isHydrated: false,
    hasCompletedOnboarding: false,
    userToken: null,
    user: null,
    userName: null,
    selectedTargetPackages: DEFAULT_TARGET_PACKAGES,
    intervalMinutes: 15,

    hydrateAuth: async () => {
        try {
            const [token, userJson, onboarding, savedName, savedPackagesJson, savedInterval] = await Promise.all([
                SecureStore.getItemAsync(TOKEN_KEY),
                SecureStore.getItemAsync(USER_KEY),
                SecureStore.getItemAsync(ONBOARDING_KEY),
                SecureStore.getItemAsync(USER_NAME_KEY),
                SecureStore.getItemAsync(TARGET_PACKAGES_KEY),
                SecureStore.getItemAsync(INTERVAL_MINUTES_KEY),
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

            set({
                userToken: token || null,
                user: parsedUser,
                userName: savedName || parsedUser?.name || null,
                selectedTargetPackages: packages,
                intervalMinutes: intervalVal,
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
}));
