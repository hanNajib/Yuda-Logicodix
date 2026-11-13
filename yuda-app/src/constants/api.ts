export const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8000";

export const API_ENDPOINTS = {
    googleNative: `${API_BASE_URL}/api/auth/google/native`,
    googleRedirect: `${API_BASE_URL}/auth/google/redirect`,
    googleExchange: `${API_BASE_URL}/api/auth/google/exchange`,
    profile: `${API_BASE_URL}/api/user/profile`,
    aiQuestionnaire: `${API_BASE_URL}/api/ai/questionnaire`,
    aiQuestionnaireGuest: `${API_BASE_URL}/api/questionnaire/analyze`,
    interventionSettings: `${API_BASE_URL}/api/intervention/settings`,
    interventionMatrix: `${API_BASE_URL}/api/intervention/matrix`,
};

export const GOOGLE_AUTH_CONFIG = {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "",
};
