import { API_ENDPOINTS, GOOGLE_AUTH_CONFIG } from "@/constants/api";
import {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
} from "@react-native-google-signin/google-signin";

export interface AuthUser {
    id: number;
    full_name: string | null;
    name: string | null;
    email: string;
    avatar: string | null;
}

interface NativeAuthResponse {
    message: string;
    data: {
        token: string;
        needs_profile_setup?: boolean;
        user: AuthUser;
    };
}

let isGoogleConfigured = false;

export function configureGoogleSignIn() {
    console.log("=== GOOGLE SIGN-IN CONFIG ===");
    console.log("Web Client ID:", GOOGLE_AUTH_CONFIG.webClientId);
    console.log("Android Client ID:", GOOGLE_AUTH_CONFIG.androidClientId);

    if (!GOOGLE_AUTH_CONFIG.webClientId) {
        console.error("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID belum terpasang atau bernilai kosong.");
    }

    GoogleSignin.configure({
        webClientId: GOOGLE_AUTH_CONFIG.webClientId,
        offlineAccess: true,
    });

    isGoogleConfigured = true;
}

export interface NativeSignInResult {
    isCancelled: boolean;
    idToken: string | null;
    googleUser?: any;
}

export async function signInWithNativeGoogle(): Promise<NativeSignInResult> {
    configureGoogleSignIn();

    try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();

        if (response && (response as any).type === "cancelled") {
            return { isCancelled: true, idToken: null };
        }

        let idToken: string | null = null;
        let googleUser: any = null;

        if (isSuccessResponse(response)) {
            idToken = response.data.idToken;
            googleUser = response.data.user;
        } else if ((response as any)?.data?.idToken) {
            idToken = (response as any).data.idToken;
            googleUser = (response as any).data.user;
        } else if ((response as any)?.idToken) {
            idToken = (response as any).idToken;
            googleUser = (response as any).user;
        }

        if (!idToken) {
            throw new Error(
                "Tidak dapat memperoleh Google ID Token. Pastikan EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID sudah dikonfigurasi dengan benar."
            );
        }

        return {
            isCancelled: false,
            idToken,
            googleUser,
        };
    } catch (error: any) {
        console.error("RAW ERROR OBJECT:", JSON.stringify(error, null, 2));
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);

        if (isErrorWithCode(error)) {
            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    return { isCancelled: true, idToken: null };
                case statusCodes.IN_PROGRESS:
                    throw new Error("Proses login Google sedang berjalan.");
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    throw new Error("Google Play Services tidak tersedia atau perlu diperbarui.");
                default:
                    if (error.code === '10' || error.message?.includes('DEVELOPER_ERROR')) {
                        throw new Error(
                            "DEVELOPER_ERROR: SHA-1 Keystore di Google Cloud Console belum cocok dengan APK di HP, atau OAuth Consent Screen masih 'Testing' dan email belum dimasukkan ke Test Users."
                        );
                    }
                    throw new Error(error.message ?? "Terjadi kesalahan pada Google Sign-In.");
            }
        }

        throw error;
    }
}

export async function loginWithGoogleNative(idToken: string) {
    const response = await fetch(API_ENDPOINTS.googleNative, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id_token: idToken,
        }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
        const errorMessage =
            result?.message ||
            (response.status === 401
                ? "Token Google tidak valid atau ditolak oleh server."
                : `Gagal autentikasi dengan server (${response.status}).`);
        throw new Error(errorMessage);
    }

    const payload = result as NativeAuthResponse;

    if (!payload?.data?.token) {
        throw new Error("Respons server tidak menyertakan token autentikasi.");
    }

    return payload.data;
}

export async function updateProfileName(token: string, name: string) {
    const response = await fetch(API_ENDPOINTS.profile, {
        method: "PATCH",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            result?.message || `Gagal menyimpan nama (${response.status}).`
        );
    }

    return result?.data?.user as AuthUser;
}

export async function signOutNativeGoogle() {
    try {
        configureGoogleSignIn();
        await GoogleSignin.signOut();
    } catch (err) {
        console.warn("Gagal logout dari akun Google native:", err);
    }
}

export async function exchangeGoogleCode(code: string) {
    const response = await fetch(API_ENDPOINTS.googleExchange, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ?? "Gagal melakukan autentikasi."
        );
    }

    const data = result as NativeAuthResponse;

    return data.data;
}
