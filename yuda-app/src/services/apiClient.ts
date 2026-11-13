import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/stores/useAuthStore';

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
