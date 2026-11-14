import axios from 'axios';
import * as Device from 'expo-device';
import { API_BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/stores/useAuthStore';

let cachedDeviceId: string | null = null;
function getDeviceGuestUuid(): string {
    if (cachedDeviceId) return cachedDeviceId;
    try {
        const id = Device.osBuildId || Device.modelName || 'device-id';
        cachedDeviceId = `guest-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
        return cachedDeviceId;
    } catch {
        // ignore
    }
    cachedDeviceId = 'guest-default';
    return cachedDeviceId;
}

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    timeout: 10000,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().userToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['X-Guest-UUID'] = getDeviceGuestUuid();
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('[ApiClient] Sesi autentikasi telah berakhir (401).');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
