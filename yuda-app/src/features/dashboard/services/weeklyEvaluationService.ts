import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/services/apiClient';
import YudaPip from '@/modules/yuda-pip';

const KEY_LAST_EVALUATED_WEEK = 'weekly_evaluation_last_week_key';

export interface WeeklyEvaluationResult {
    shouldPrompt: boolean;
    trend: 'improved' | 'worsened'; // improved = screen time turun, worsened = screen time naik
    title: string;
    message: string;
    currentInterval: number;
    currentPauseDuration: number;
    suggestedInterval: number;
    suggestedPauseDuration: number;
    weekKey: string;
}

/**
 * Mendapatkan ISO week string, e.g. "2026-W46"
 */
function getWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Format tanggal YYYY-MM-DD
 */
function formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Evaluasi progres mingguan untuk pop-up hari Senin / tiap minggu di Beranda.
 */
export async function evaluateWeeklyProgress(currentInterval: number, currentPauseDuration: number): Promise<WeeklyEvaluationResult | null> {
    try {
        const today = new Date();
        const currentWeekKey = getWeekKey(today);

        // Cek apakah user sudah menginstal aplikasi minimal 7 hari
        let installedAt = 0;
        if (typeof YudaPip?.getAndroidUsageStats === 'function') {
            try {
                const stats = await YudaPip.getAndroidUsageStats(1);
                if (stats?.installed_at) {
                    installedAt = Number(stats.installed_at);
                }
            } catch (_e) {
                // ignore
            }
        }

        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        if (installedAt > 0 && (today.getTime() - installedAt < sevenDaysMs)) {
            // Pengguna baru menginstal kurang dari 7 hari, belum saatnya evaluasi mingguan
            return null;
        }

        // Cek apakah minggu ini sudah pernah dievaluasi/ditampilkan
        const lastEvaluatedWeek = await SecureStore.getItemAsync(KEY_LAST_EVALUATED_WEEK);
        if (lastEvaluatedWeek === currentWeekKey) {
            return null;
        }

        // Ambil data 14 hari terakhir (7 hari minggu lalu vs 7 hari sebelumnya)
        // atau bandingkan minggu lalu (Senin-Minggu sebelumnya) dengan minggu sebelum-sebelumnya
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const fourteenDaysAgo = new Date(today);
        fourteenDaysAgo.setDate(today.getDate() - 14);

        // Ambil data matrix dari backend
        let prevWeekTotal = 0;
        let pastWeekTotal = 0;
        let hasData = false;

        try {
            const res = await apiClient.get('/api/intervention/matrix', {
                params: { range: 'month' },
            });
            const allData = res.data?.data || [];
            if (allData.length > 0) {
                hasData = true;
                const d14 = formatDate(fourteenDaysAgo);
                const d7 = formatDate(sevenDaysAgo);
                const dToday = formatDate(today);

                allData.forEach((item: any) => {
                    const lDate = item.log_date;
                    const mins = Number(item.total_screen_time_minutes || 0);
                    if (lDate >= d7 && lDate < dToday) {
                        pastWeekTotal += mins;
                    } else if (lDate >= d14 && lDate < d7) {
                        prevWeekTotal += mins;
                    }
                });
            }
        } catch (_err) {
            // fallback cek Android usage stats
        }

        if (!hasData && typeof YudaPip?.getAndroidUsageStats === 'function') {
            try {
                const stats = await YudaPip.getAndroidUsageStats(14);
                // Jika data ada dari native
                if (stats?.day_minutes && Array.isArray(stats.day_minutes)) {
                    const days = stats.day_minutes; // [idx0 .. idx13]
                    if (days.length >= 14) {
                        pastWeekTotal = days.slice(7, 14).reduce((a: number, b: number) => a + b, 0);
                        prevWeekTotal = days.slice(0, 7).reduce((a: number, b: number) => a + b, 0);
                        hasData = true;
                    }
                }
            } catch (_e) {
                // ignore
            }
        }

        // Jika tidak ada data perbandingan minggu sebelumnya (prevWeekTotal == 0) dan pastWeekTotal == 0,
        // berarti user belum memiliki data mingguan yang cukup
        if (prevWeekTotal === 0 && pastWeekTotal === 0) {
            return null;
        }

        // Tentukan apakah progres naik (screentime turun) atau progres turun (screentime naik)
        const isImproved = prevWeekTotal === 0 ? true : pastWeekTotal <= prevWeekTotal;

        // Aturan:
        // 1. Saat progres naik (screen time menurun):
        //    - Turunkan interval intervensi 1 menit (min 1 menit).
        //    - Turunkan durasi jeda 5 detik, tetapi mentok minimal di 30 detik (Math.max(30, currentPauseDuration - 5)).
        // 2. Saat progres turun (screen time meningkat / memburuk):
        //    - Turunkan interval scrolling 1 menit agar intervensi lebih sering (min 1 menit).
        //    - Tambah durasi jeda 5 detik agar istirahat lebih lama (maks 60 detik).
        const suggestedInterval = Math.max(1, currentInterval - 1);
        const suggestedPauseDuration = isImproved
            ? Math.max(30, currentPauseDuration - 5)
            : Math.min(60, currentPauseDuration + 5);

        if (isImproved) {
            const pauseMsg = suggestedPauseDuration === currentPauseDuration
                ? `durasi jeda tetap di batas minimum ${suggestedPauseDuration} detik`
                : `durasi jeda turun jadi ${suggestedPauseDuration} detik`;

            return {
                shouldPrompt: true,
                trend: 'improved',
                title: 'Hebat, Progresmu Naik Minggu Ini',
                message: `Waktu scrolling-mu minggu ini berhasil menurun. Mau sesuaikan interval scrolling jadi ${suggestedInterval} menit dan ${pauseMsg}?`,
                currentInterval,
                currentPauseDuration,
                suggestedInterval,
                suggestedPauseDuration,
                weekKey: currentWeekKey,
            };
        } else {
            return {
                shouldPrompt: true,
                trend: 'worsened',
                title: 'Evaluasi Mingguan Scrolling',
                message: `Waktu scrolling-mu minggu ini terpantau meningkat. Yuda menyarankan untuk menurunkan interval jadi ${suggestedInterval} menit dan menambah durasi jeda jadi ${suggestedPauseDuration} detik agar kamu lebih terbantu beristirahat.`,
                currentInterval,
                currentPauseDuration,
                suggestedInterval,
                suggestedPauseDuration,
                weekKey: currentWeekKey,
            };
        }
    } catch (e) {
        console.warn('[WeeklyEvaluation] Gagal mengevaluasi progres mingguan:', e);
        return null;
    }
}

export async function markWeeklyEvaluationPrompted(weekKey: string) {
    try {
        await SecureStore.setItemAsync(KEY_LAST_EVALUATED_WEEK, weekKey);
    } catch (_e) {
        // ignore
    }
}
