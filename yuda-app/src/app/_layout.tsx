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
import { useEffect } from "react";
import "../../global.css";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  const { isHydrated, hasCompletedOnboarding, userToken, hydrateAuth } = useAuthStore();

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
    if (!isHydrated || !fontsLoaded) return;

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
      // Jika sudah menyelesaikan onboarding, pastikan izin penting tetap aktif
      if (Platform.OS === 'android') {
        const canDraw = YudaPip.canDrawOverlays();
        const battery = YudaPip.isIgnoringBatteryOptimizations();
        const accessibility = YudaPip.isAccessibilityServiceEnabled();

        if (!canDraw || !battery || !accessibility) {
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
  }, [isHydrated, hasCompletedOnboarding, userToken, segments]);

  // Cek izin saat user kembali ke app dari Pengaturan Android
  useEffect(() => {
    if (!isHydrated || !hasCompletedOnboarding) return;

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && Platform.OS === 'android') {
        const canDraw = YudaPip.canDrawOverlays();
        const battery = YudaPip.isIgnoringBatteryOptimizations();
        const accessibility = YudaPip.isAccessibilityServiceEnabled();

        const inOnboarding = (segments[0] as string) === "onboarding";
        const isOnboardingPermissions = inOnboarding && (segments[1] as string) === "permissions";

        if (!canDraw || !battery || !accessibility) {
          if (!isOnboardingPermissions) {
            router.replace("/onboarding/permissions" as any);
          }
        }
      }
    });

    return () => sub.remove();
  }, [isHydrated, hasCompletedOnboarding, segments]);

  if (!isHydrated || !fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="auth/callback" />
      </Stack>
    </>
  );
}
