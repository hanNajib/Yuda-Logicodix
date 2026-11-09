import { useAuthStore } from "@/stores/useAuthStore";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../../global.css";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { isHydrated, hasCompletedOnboarding, userToken, hydrateAuth } = useAuthStore();

  useEffect(() => {
    async function prepareApp() {
      try {
        await hydrateAuth();
      } catch (e) {
        console.warn("Gagal inisialisasi sesi autentikasi:", e);
      } finally {
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    prepareApp();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const isCallback = segments[0] === "auth" && segments[1] === "callback";
    if (isCallback) return;

    const inAuthGroup = (segments[0] as string) === "auth";
    const inOnboarding = (segments[0] as string) === "onboarding";

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
      if (inAuthGroup || inOnboarding) {
        router.replace("/" as any);
      }
    }
  }, [isHydrated, hasCompletedOnboarding, userToken, segments]);

  if (!isHydrated) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="auth/callback" />
      </Stack>
    </>
  );
}
