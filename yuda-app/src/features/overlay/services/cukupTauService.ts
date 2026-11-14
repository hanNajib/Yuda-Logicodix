import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/services/apiClient';

const KEY_LAST_JAM_RAWAN_DATE = 'cukup_tau_last_jam_rawan_date';
const KEY_LAST_LONG_SCROLL_TIME = 'cukup_tau_last_long_scroll_time';
const KEY_PAUSE_COUNT_SESSION = 'cukup_tau_pause_count_session';

const ONE_HOUR_MS = 60 * 60 * 1000;

export interface CukupTauDecision {
    shouldShow: boolean;
    reason: 'jam_rawan' | 'scroll_terlalu_lama' | null;
}

export interface CukupTauCardMessage {
    id: number;
    emotion: string;
    trigger_condition: string;
    tone_style: string;
    header: string;
    message: string;
    tips: string;
    micro_habit?: {
        type: string;
        instruction: string;
    };
}

function getTodayIsoString(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Cek apakah saat ini berada di slot jam rawan user
 */
function isCurrentHourInSlot(slotKey: string): boolean {
    const hour = new Date().getHours();
    const slotRanges: Record<string, [number, number]> = {
        slot_00_02: [0, 2],
        slot_02_04: [2, 4],
        slot_04_06: [4, 6],
        slot_06_08: [6, 8],
        slot_08_10: [8, 10],
        slot_10_12: [10, 12],
        slot_12_14: [12, 14],
        slot_14_16: [14, 16],
        slot_16_18: [16, 18],
        slot_18_20: [18, 20],
        slot_20_22: [20, 22],
        slot_22_00: [22, 24],
    };

    const range = slotRanges[slotKey];
    if (!range) return false;
    return hour >= range[0] && hour < range[1];
}

/**
 * Evaluasi apakah kartu cukup tau harus muncul:
 * 1. Jam rawan: Hanya sekali dalam sehari
 * 2. Scroll terlalu lama: jeda ke-4 (atau kelipatannya), dengan cooldown minimal 1 jam
 */
export async function evaluateCukupTauTrigger(
    nativePauseCount: number = 0
): Promise<CukupTauDecision> {
    const now = Date.now();
    const todayIso = getTodayIsoString();

    try {
        // Ambil data matriks harian & riwayat untuk jam rawan
        const matrixRes = await apiClient.get('/api/intervention/matrix/daily', {
            params: { date: todayIso },
        });
        const matrixData = matrixRes.data?.data;
        const slots = matrixData?.slots || {};

        // Cari slot jam rawan dengan pemakaian tertinggi
        let peakSlot = 'slot_20_22';
        let maxMinutes = -1;
        for (const [k, v] of Object.entries(slots)) {
            const mins = Number(v) || 0;
            if (mins > maxMinutes) {
                maxMinutes = mins;
                peakSlot = k;
            }
        }

        const isJamRawan = isCurrentHourInSlot(peakSlot);

        // 1. Cek Jam Rawan (1 kali sehari)
        if (isJamRawan) {
            const lastJamRawanDate = await SecureStore.getItemAsync(KEY_LAST_JAM_RAWAN_DATE);
            if (lastJamRawanDate !== todayIso) {
                return {
                    shouldShow: true,
                    reason: 'jam_rawan',
                };
            }
        }

        // 2. Cek Scroll Terlalu Lama (Jeda ke-4 dst, cooldown 1 jam)
        // Hitung akumulasi jeda sesi
        let currentSessionCount = nativePauseCount;
        if (currentSessionCount <= 0) {
            const storedCountStr = await SecureStore.getItemAsync(KEY_PAUSE_COUNT_SESSION);
            currentSessionCount = storedCountStr ? parseInt(storedCountStr, 10) + 1 : 1;
            await SecureStore.setItemAsync(KEY_PAUSE_COUNT_SESSION, currentSessionCount.toString());
        }

        const lastLongScrollTimeStr = await SecureStore.getItemAsync(KEY_LAST_LONG_SCROLL_TIME);
        const lastLongScrollTime = lastLongScrollTimeStr ? parseInt(lastLongScrollTimeStr, 10) : 0;
        const isOneHourPassed = now - lastLongScrollTime >= ONE_HOUR_MS;

        // Jeda ke-4 (atau kelipatan 4 / sudah jeda >= 4 dan sudah lewat 1 jam)
        if (currentSessionCount >= 4 && isOneHourPassed) {
            return {
                shouldShow: true,
                reason: 'scroll_terlalu_lama',
            };
        }
    } catch (e) {
        console.warn('[evaluateCukupTauTrigger] Gagal evaluasi trigger:', e);
    }

    return {
        shouldShow: false,
        reason: null,
    };
}

/**
 * Catat bahwa kartu cukup tau telah ditampilkan
 */
export async function markCukupTauShown(reason: 'jam_rawan' | 'scroll_terlalu_lama') {
    const now = Date.now();
    const todayIso = getTodayIsoString();

    try {
        if (reason === 'jam_rawan') {
            await SecureStore.setItemAsync(KEY_LAST_JAM_RAWAN_DATE, todayIso);
        } else {
            await SecureStore.setItemAsync(KEY_LAST_LONG_SCROLL_TIME, now.toString());
        }
    } catch (e) {
        console.warn('[markCukupTauShown] Gagal simpan tanda tampil:', e);
    }
}

/**
 * Ambil pesan personalisasi kartu cukup tau dari backend
 */
export async function fetchCukupTauMessage(
    emotion: string,
    triggerCondition: 'jam_rawan' | 'scroll_terlalu_lama'
): Promise<CukupTauCardMessage> {
    try {
        const res = await apiClient.get('/api/intervention/random-message', {
            params: {
                emotion,
                trigger_condition: triggerCondition,
            },
        });
        if (res.data?.data) {
            return res.data.data;
        }
    } catch (e) {
        console.warn('[fetchCukupTauMessage] Gagal ambil pesan:', e);
    }

    // Fallback jika offline
    return {
        id: 0,
        emotion,
        trigger_condition: triggerCondition,
        tone_style: 'lembut',
        header: `Kamu Merasa ${emotion.charAt(0).toUpperCase() + emotion.slice(1)} Hari Ini Ya?`,
        message:
            'Yuk, berhenti sejenak. Kamu juga perlu waktu untuk dirimu sendiri. Nggak perlu terus mengikuti semua informasi. Beri pikiranmu ruang untuk beristirahat.',
        tips: 'Letakkan ponselmu, tarik nafas perlahan, dan alihkan perhatian ke lingkungan sekitarmu.',
        micro_habit: {
            type: 'nafas',
            instruction: 'Tarik nafas perlahan selama beberapa detik.',
        },
    };
}

/**
 * Update emosi user ke metrik harian hari ini
 */
export async function updateDailyMatrixEmotion(emotion: string): Promise<boolean> {
    const todayIso = getTodayIsoString();
    try {
        await apiClient.post('/api/intervention/matrix', {
            log_date: todayIso,
            emotion,
        });
        return true;
    } catch (e) {
        console.warn('[updateDailyMatrixEmotion] Gagal update emosi metrik:', e);
        return false;
    }
}
