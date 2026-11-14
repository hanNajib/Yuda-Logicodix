import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import YudaPip from "@/modules/yuda-pip";
import { AppState, PermissionsAndroid, Platform } from "react-native";
import {
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/outfit";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { syncScreenTimeIfDue } from "@/features/dashboard/services/screenTimeSyncService";
import { AppSplashScreen } from "@/components/ui/AppSplashScreen";
import { DEBUG_CONFIG } from "@/constants/debugConfig";
import "../../global.css";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [showSplash, setShowSplash] = useState(true);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [fontsLoaded] = useFonts({
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  const {
    isHydrated,
    hasCompletedOnboarding,
    userToken,
    userName,
    selectedTargetPackages,
    intervalMinutes,
    hydrateAuth,
  } = useAuthStore();

  useEffect(() => {
    async function prepareApp() {
      try {
        await hydrateAuth();
      } catch (e) {
        console.warn("Gagal inisialisasi sesi autentikasi:", e);
      } finally {
        if (fontsLoaded) {
          await SplashScreen.hideAsync().catch(() => {});
        }
      }
    }

    if (fontsLoaded) {
      prepareApp();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!isHydrated || !fontsLoaded || showSplash) return;

    const isCallback = segments[0] === "auth" && segments[1] === "callback";
    if (isCallback) return;

    const inAuthGroup = (segments[0] as string) === "auth";
    const inOnboarding = (segments[0] as string) === "onboarding";
    const isOnboardingPermissions = inOnboarding && (segments[1] as string) === "permissions";

    if (!hasCompletedOnboarding) {
      if (inOnboarding || inAuthGroup) {
        return;
      }
      if (userToken) {
        router.replace("/onboarding/profile" as any);
      } else {
        router.replace("/auth" as any);
      }
    } else {
      if (Platform.OS === 'android') {
        const canDraw = YudaPip.canDrawOverlays();
        const battery = YudaPip.isIgnoringBatteryOptimizations();
        const accessibility = YudaPip.isAccessibilityServiceEnabled();
        const usageStats = typeof YudaPip.hasUsageStatsPermission === 'function' ? YudaPip.hasUsageStatsPermission() : true;

        if (!canDraw || !battery || !accessibility || !usageStats) {
          if (!isOnboardingPermissions) {
            router.replace("/onboarding/permissions" as any);
          }
          return;
        }
      }

      if (inAuthGroup || (inOnboarding && !isOnboardingPermissions)) {
        router.replace("/" as any);
      }
    }
  }, [isHydrated, hasCompletedOnboarding, userToken, segments, fontsLoaded, showSplash]);

  useEffect(() => {
    if (!isHydrated || !hasCompletedOnboarding) return;

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && Platform.OS === 'android') {
        const canDraw = YudaPip.canDrawOverlays();
        const battery = YudaPip.isIgnoringBatteryOptimizations();
        const accessibility = YudaPip.isAccessibilityServiceEnabled();
        const usageStats = typeof YudaPip.hasUsageStatsPermission === 'function' ? YudaPip.hasUsageStatsPermission() : true;

        const inOnboarding = (segments[0] as string) === "onboarding";
        const isOnboardingPermissions = inOnboarding && (segments[1] as string) === "permissions";

        if (!canDraw || !battery || !accessibility || !usageStats) {
          if (!isOnboardingPermissions) {
            router.replace("/onboarding/permissions" as any);
          }
        } else {
          // Izin lengkap & app dibuka: Pastikan background monitor reels selalu aktif otomatis
          if (!YudaPip.isOverlayMonitorRunning()) {
            const currentInterval = intervalMinutes && intervalMinutes > 0 ? intervalMinutes : 15;
            const intervalSeconds = currentInterval * 60;
            const enableDebugBubble = DEBUG_CONFIG.ENABLE_DEBUG_OVERLAY_BUBBLE;
            YudaPip.startOverlayMonitor(userName || 'Yuda', selectedTargetPackages, enableDebugBubble, intervalSeconds);
          }

          // Trigger smart throttled sync (min 15 menit & cek perubahan data)
          syncScreenTimeIfDue({ reason: 'app_active' });
        }
      }
    });

    return () => sub.remove();
  }, [isHydrated, hasCompletedOnboarding, segments]);

  if (!isHydrated || !fontsLoaded) {
    return null;
  }

  if (showSplash) {
    return <AppSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="dashboard/detail-jam-aplikasi" />
        <Stack.Screen name="dashboard/detail-waktu-scroll" />
        <Stack.Screen name="dashboard/edit-profile" />
      </Stack>
    </QueryClientProvider>
  );
}
