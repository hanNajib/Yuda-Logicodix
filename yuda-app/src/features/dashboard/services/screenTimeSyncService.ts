import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/services/apiClient';
import YudaPip from '@/modules/yuda-pip';

const LAST_SYNC_TIME_KEY = 'screen_time_last_sync_timestamp';
const LAST_SYNC_PAYLOAD_KEY = 'screen_time_last_sync_payload';
const MIN_SYNC_INTERVAL_MS = 15 * 60 * 1000; // Minimal jeda 15 menit

function getTodayIsoString(): string {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export interface SyncOptions {
    force?: boolean;
    reason?: 'app_active' | 'periodic' | 'manual' | 'intervention';
}

/**
 * Smart Opportunistic Sync:
 * Menyetor screen time dari Android OS ke backend secara hemat daya & hemat kuota:
 * 1. Di-throttle minimal 15 menit sekali (kecuali force=true).
 * 2. Cek apakah ada perubahan menit dibanding data sync sebelumnya.
 * 3. Upsert ke /api/intervention/matrix dan /api/screen-time/social.
 */
export async function syncScreenTimeIfDue(options: SyncOptions = {}): Promise<boolean> {
    const { force = false, reason = 'app_active' } = options;

    try {
        const now = Date.now();
        const todayIso = getTodayIsoString();

        // 1. Cek Throttle Jeda Waktu
        if (!force) {
            const lastSyncStr = await SecureStore.getItemAsync(LAST_SYNC_TIME_KEY);
            if (lastSyncStr) {
                const lastSync = parseInt(lastSyncStr, 10);
                if (now - lastSync < MIN_SYNC_INTERVAL_MS) {
                    // Masih dalam rentang 15 menit, lewati agar hemat request
                    return false;
                }
            }
        }

        // 2. Ambil statistik terbaru dari Android
        if (typeof YudaPip?.getAndroidUsageStats !== 'function') {
            return false;
        }

        const androidStats = await YudaPip.getAndroidUsageStats(7);
        if (!androidStats || !androidStats.has_permission) {
            return false;
        }

        const todayApps = androidStats.today_apps || {};
        const ranking = androidStats.ranking || [];
        const slots = androidStats.slots || {};

        // 3. Cek perubahan data (hindari request jika data sama persis)
        const currentPayloadSignature = JSON.stringify({
            date: todayIso,
            todayApps,
            total: androidStats.today_total_minutes,
        });

        if (!force) {
            const lastPayloadSignature = await SecureStore.getItemAsync(LAST_SYNC_PAYLOAD_KEY);
            if (lastPayloadSignature === currentPayloadSignature) {
                // Tidak ada pertambahan menit pemakaian, skip sync
                await SecureStore.setItemAsync(LAST_SYNC_TIME_KEY, now.toString());
                return false;
            }
        }

        // 4. Lakukan Upsert ke Backend
        const matrixPayload = {
            log_date: todayIso,
            slots,
            instagram: todayApps.instagram ?? 0,
            tiktok: todayApps.tiktok ?? 0,
            facebook: todayApps.facebook ?? 0,
            threads: todayApps.threads ?? 0,
            youtube: todayApps.youtube ?? 0,
            x: todayApps.x ?? 0,
        };

        const platformPayload: Record<string, number> = {};
        ranking.forEach((r: any) => {
            if (r?.key && typeof r?.minutes === 'number') {
                platformPayload[r.key] = r.minutes;
            }
        });

        // Jalankan paralel ke 2 endpoint
        await Promise.all([
            apiClient.post('/api/intervention/matrix', matrixPayload),
            apiClient.post('/api/screen-time/social', {
                ...platformPayload,
                mode: 'set',
            }),
        ]);

        // 5. Simpan jejak waktu & payload sync terakhir
        await Promise.all([
            SecureStore.setItemAsync(LAST_SYNC_TIME_KEY, now.toString()),
            SecureStore.setItemAsync(LAST_SYNC_PAYLOAD_KEY, currentPayloadSignature),
        ]);

        return true;
    } catch (error) {
        console.warn(`[syncScreenTimeIfDue] Gagal sinkronisasi (${reason}):`, error);
        return false;
    }
}

