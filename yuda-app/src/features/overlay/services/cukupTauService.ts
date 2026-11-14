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
        // 1. Prioritaskan Evaluasi Scroll Terlalu Lama (Lokal & Cepat)
        let currentSessionCount = nativePauseCount;
        if (currentSessionCount <= 0) {
            const storedCountStr = await SecureStore.getItemAsync(KEY_PAUSE_COUNT_SESSION);
            currentSessionCount = storedCountStr ? parseInt(storedCountStr, 10) + 1 : 1;
            await SecureStore.setItemAsync(KEY_PAUSE_COUNT_SESSION, currentSessionCount.toString());
        }
        const lastLongScrollTimeStr = await SecureStore.getItemAsync(KEY_LAST_LONG_SCROLL_TIME);
        const lastLongScrollTime = lastLongScrollTimeStr ? parseInt(lastLongScrollTimeStr, 10) : 0;
        
        // Di mode DEV, bypass cooldown 1 jam untuk testing
        const isOneHourPassed = __DEV__ ? true : (now - lastLongScrollTime >= ONE_HOUR_MS);
        if (currentSessionCount >= 4 && isOneHourPassed) {
            return {
                shouldShow: true,
                reason: 'scroll_terlalu_lama',
            };
        }
        // 2. Evaluasi Jam Rawan (API Terisolasi)
        try {
            const matrixRes = await apiClient.get('/api/intervention/matrix/daily', {
                params: { date: todayIso },
            });
            const slots = matrixRes.data?.data?.slots || {};
            let peakSlot = 'slot_20_22';
            let maxMinutes = -1;
            for (const [k, v] of Object.entries(slots)) {
                const mins = Number(v) || 0;
                if (mins > maxMinutes) {
                    maxMinutes = mins;
                    peakSlot = k;
                }
            }
            if (isCurrentHourInSlot(peakSlot)) {
                const lastJamRawanDate = await SecureStore.getItemAsync(KEY_LAST_JAM_RAWAN_DATE);
                if (lastJamRawanDate !== todayIso) {
                    return {
                        shouldShow: true,
                        reason: 'jam_rawan',
                    };
                }
            }
        } catch (apiErr) {
            console.warn('[evaluateCukupTauTrigger] Gagal cek jam rawan API:', apiErr);
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
    triggerCondition: 'jam_rawan' | 'scroll_terlalu_lama' | 'checkin_dashboard',
    toneStyle?: string
): Promise<CukupTauCardMessage> {
    try {
        const params: Record<string, string> = {
            emotion,
            trigger_condition: triggerCondition,
        };
        if (toneStyle) {
            params.tone_style = toneStyle;
        }

        const res = await apiClient.get('/api/intervention/random-message', {
            params,
        });
        if (res.data?.data) {
            return res.data.data;
        }
    } catch (e) {
        console.warn('[fetchCukupTauMessage] Gagal ambil pesan:', e);
    }

    // Fallback jika offline (panjang pesan di atas 200 karakter untuk refleksi mendalam)
    const emotionTitle = emotion.charAt(0).toUpperCase() + emotion.slice(1);
    const fallbackMessages: Record<string, { header: string; message: string; tips: string; habitType: string; habitDesc: string }> = {
        tenang: {
            header: 'Pertahankan Ketenangan Hatimu',
            message:
                'Senang melihatmu merasa tenang hari ini. Di tengah derasnya arus informasi di media sosial, menjaga ketenangan batin adalah sebuah pencapaian yang sangat berharga. Teruslah hadir secara utuh, nikmati setiap detik tanpa harus tergesa-gesa menyerap semua hal di luar sana.',
            tips: 'Simpan ponselmu sejenak, nikmati momen hening ini dan rasakan kedamaian di sekitarmu.',
            habitType: 'nafas',
            habitDesc: 'Tarik nafas perlahan selama beberapa detik dan hembuskan dengan tenang.',
        },
        cemas: {
            header: 'Tarik Nafas, Kamu Sedang Baik-Baik Saja',
            message:
                'Wajar jika sesekali rasa cemas itu datang, terutama saat kita terus melihat pencapaian orang lain di linimasa. Ingatlah bahwa kamu tidak sedang tertinggal dalam perlombaan apapun. Perjalananmu memiliki waktunya sendiri, jadi berhentilah membandingkan diri dan kembalilah ke napasmu saat ini.',
            tips: 'Jauhkan layar, pejamkan matamu, dan katakan pada diri sendiri bahwa kamu sudah berjuang dengan sangat baik.',
            habitType: 'nafas',
            habitDesc: 'Tarik nafas 4 detik, tahan 4 detik, lalu hembuskan perlahan 4 detik.',
        },
        bosan: {
            header: 'Bosan Itu Tanda Pikiranmu Butuh Ruang',
            message:
                'Rasa bosan sering kali memancing jari kita untuk terus menggulir layar tanpa henti. Namun ketahuilah, rasa bosan sebenarnya adalah kesempatan emas bagi otakmu untuk beristirahat dan memunculkan ide-ide kreatif baru. Kamu tidak harus selalu mengisi setiap detik kosong dengan konten digital.',
            tips: 'Letakkan ponsel, regangkan tubuhmu atau tataplah pemandangan di luar ruangan sejenak.',
            habitType: 'peregangan',
            habitDesc: 'Lemaskan pundak dan rentangkan tanganmu ke atas secara perlahan.',
        },
        lelah: {
            header: 'Lelah Itu Valid, Tubuhmu Butuh Rehat',
            message:
                'Yuk berhenti sejenak. Kamu telah melewati banyak hal hari ini dan energimu berhak untuk dipulihkan. Terus menerus menatap layar justru akan membuat matamu semakin penat dan pikiran semakin bising. Beri izin pada dirimu sendiri untuk benar-benar beristirahat tanpa rasa bersalah.',
            tips: 'Letakkan ponselmu jauh dari jangkauan, minumlah air putih hangat, dan pejamkan matamu beberapa saat.',
            habitType: 'minum',
            habitDesc: 'Ambil segelas air putih hangat dan teguk perlahan untuk menyegarkan tubuh.',
        },
    };

    const selectedFallback = fallbackMessages[emotion.toLowerCase()] || fallbackMessages.lelah;

    return {
        id: 0,
        emotion,
        trigger_condition: triggerCondition,
        tone_style: toneStyle || 'lembut',
        header: selectedFallback.header,
        message: selectedFallback.message,
        tips: selectedFallback.tips,
        micro_habit: {
            type: selectedFallback.habitType,
            instruction: selectedFallback.habitDesc,
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
