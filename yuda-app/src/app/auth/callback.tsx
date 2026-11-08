import { exchangeGoogleCode } from "@/features/auth/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AuthCallbackScreen() {
    const { code } = useLocalSearchParams<{ code?: string }>();
    const router = useRouter();

    const setAuthSession = useAuthStore((state) => state.setAuthSession);
    const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

    const hasProcessed = useRef(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!code || hasProcessed.current) return;

        hasProcessed.current = true;

        async function authenticate() {
            try {
                const result = await exchangeGoogleCode(code!);

                await setAuthSession(result.token, result.user);
                await completeOnboarding();

                router.replace("/");
            } catch (err) {
                console.error("Google authentication error:", err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Terjadi kesalahan saat login."
                );
            }
        }

        authenticate();
    }, [code]);

    return (
        <View className="flex-1 items-center justify-center bg-white px-6">
            {error ? (
                <>
                    <Text className="text-lg font-bold text-red-600">
                        Login gagal
                    </Text>
                    <Text className="mt-2 text-center text-gray-500">
                        {error}
                    </Text>
                </>
            ) : (
                <>
                    <ActivityIndicator size="large" color="#2e6b4e" />
                    <Text className="mt-4 text-lg font-bold">
                        Mengautentikasi...
                    </Text>
                    <Text className="mt-2 text-gray-500">
                        Mohon tunggu sebentar.
                    </Text>
                </>
            )}
        </View>
    );
}
