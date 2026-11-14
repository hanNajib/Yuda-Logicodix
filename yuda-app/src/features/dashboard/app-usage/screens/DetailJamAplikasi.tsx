
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/stores/useAuthStore';
import YudaPip from '@/modules/yuda-pip';

interface DetailJamAplikasiProps {
    scale?: number;
}

const YUDA_IMAGE = require('@/assets/images/yuda/yuda-makan.png');

const SLOT_KEYS = [
    'slot_00_02',
    'slot_02_04',
    'slot_04_06',
    'slot_06_08',
    'slot_08_10',
    'slot_10_12',
    'slot_12_14',
    'slot_14_16',
    'slot_16_18',
    'slot_18_20',
    'slot_20_22',
    'slot_22_00',
];

function getTodayIsoString(): string {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function renderAppBadge(key: string, size: number = 44) {
    const k = key.toLowerCase();
    if (k === 'instagram') {
        return (
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <Defs>
                    <RadialGradient
                        id={`igGrad_${size}`}
                        cx="25%"
                        cy="105%"
                        r="125%"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0%" stopColor="#fdf497" />
                        <Stop offset="5%" stopColor="#fdf497" />
                        <Stop offset="45%" stopColor="#fd5949" />
                        <Stop offset="60%" stopColor="#d6249f" />
                        <Stop offset="90%" stopColor="#285AEB" />
                    </RadialGradient>
                </Defs>
                <Rect x="5" y="5" width="90" height="90" rx="24" fill={`url(#igGrad_${size})`} />
                <Rect x="22" y="22" width="56" height="56" rx="16" stroke="#ffffff" strokeWidth="7" fill="none" />
                <Circle cx="50" cy="50" r="14" stroke="#ffffff" strokeWidth="7" fill="none" />
                <Circle cx="66" cy="34" r="4.5" fill="#ffffff" />
            </Svg>
        );
    }
    if (k === 'tiktok') {
        return (
            <View
                className="items-center justify-center bg-black"
                style={{ width: size, height: size, borderRadius: size * 0.28 }}
            >
                <Svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.888 2.863 2.895 2.895 0 0 1-2.89-2.894 2.895 2.895 0 0 1 2.89-2.893c.338 0 .66.06.96.17V9.45a6.34 6.34 0 0 0-.96-.073A6.335 6.335 0 0 0 3 15.71a6.335 6.335 0 0 0 6.346 6.335 6.336 6.336 0 0 0 6.335-6.335V9.167a8.214 8.214 0 0 0 4.908 1.602V7.324a4.814 4.814 0 0 1-1-.638z"
                        fill="#ffffff"
                    />
                </Svg>
            </View>
        );
    }
    if (k === 'facebook') {
        return (
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="50" fill="#1877f2" />
                <Path
                    d="M62 52.8h-8.8V85H40V52.8H34V42.2h6V35c0-8.2 5-12.8 12.4-12.8 3.6 0 7.3.6 7.3.6v8h-4.2c-4.1 0-5.5 2.6-5.5 5.2v6.2h9.2l-1.2 10.6z"
                    fill="#ffffff"
                />
            </Svg>
        );
    }
    if (k === 'youtube') {
        return (
            <View
                className="items-center justify-center bg-white"
                style={{ width: size, height: size, borderRadius: size * 0.28 }}
            >
                <Ionicons name="logo-youtube" size={size * 0.85} color="#ff0000" />
            </View>
        );
    }
    if (k === 'threads') {
        return (
            <View
                className="items-center justify-center bg-[#111827]"
                style={{ width: size, height: size, borderRadius: size * 0.28 }}
            >
                <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.923 11.22c-.12 2.24-1.464 3.633-3.805 3.633-2.616 0-4.148-1.854-4.148-4.636 0-3.088 1.77-4.808 4.316-4.808 2.378 0 3.738 1.488 3.864 3.493h-1.637c-.11-1.16-.867-1.922-2.227-1.922-1.644 0-2.627 1.156-2.627 3.237 0 2.012.983 3.064 2.457 3.064 1.474 0 2.148-.823 2.258-2.061H12v-1.554h3.923v1.554z"
                        fill="#ffffff"
                    />
                </Svg>
            </View>
        );
    }
    // X / Twitter
    return (
        <View
            className="items-center justify-center bg-black"
            style={{ width: size, height: size, borderRadius: size * 0.28 }}
        >
            <Svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                    fill="#ffffff"
                />
            </Svg>
        </View>
    );
}

function formatMinutesToHoursText(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} Menit`;
    return `${h} Jam ${m} Menit`;
}

function formatMinutesShort(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return `${h}j ${m}m`;
}

export default function DetailJamAplikasi({
    scale = 1,
}: DetailJamAplikasiProps) {
    const router = useRouter();
    const s = scale;
    const { user, userName } = useAuthStore();
    const displayName = userName || user?.name || 'Gathan';

    // 1. Ambil data akumulasi media sosial (ranking & top app)
    const { data: socialData, isLoading: isSocialLoading } = useQuery({
        queryKey: ['socialScreenTime'],
        queryFn: async () => {
            const res = await apiClient.get('/api/screen-time/social');
            return res.data?.data;
        },
        staleTime: 60 * 1000,
    });

    const todayIso = useMemo(() => getTodayIsoString(), []);

    // 2. Ambil data matriks hari ini untuk 12 slot kurva grafik aplikasi utama
    const { data: todayMatrixData } = useQuery({
        queryKey: ['dailyScreenTimeMatrix', todayIso],
        queryFn: async () => {
            const res = await apiClient.get('/api/intervention/matrix/daily', {
                params: { date: todayIso },
            });
            return res.data?.data;
        },
        staleTime: 60 * 1000,
    });

    // 3. Ambil data matriks 7 hari terakhir (minggu ini)
    const { data: weekMatrixData } = useQuery({
        queryKey: ['weekScreenTimeMatrix'],
        queryFn: async () => {
            const res = await apiClient.get('/api/intervention/matrix', {
                params: { range: 'week' },
            });
            return res.data?.data;
        },
        staleTime: 60 * 1000,
    });

    // 4. Fallback langsung dari Android OS jika data DB belum ada sama sekali
    const { data: androidStats } = useQuery({
        queryKey: ['androidUsageStats'],
        queryFn: async () => {
            if (typeof YudaPip?.getAndroidUsageStats === 'function') {
                return await YudaPip.getAndroidUsageStats(7);
            }
            return null;
        },
        staleTime: 60 * 1000,
    });

    // Cek apakah data DB sudah ada
    const hasDbSocialData = useMemo(() => {
        const total = Number(socialData?.total_all_minutes ?? 0);
        return total > 0;
    }, [socialData]);

    const hasDbTodaySlots = useMemo(() => {
        if (!todayMatrixData?.slots) return false;
        return Object.values(todayMatrixData.slots).some((v) => Number(v) > 0);
    }, [todayMatrixData]);

    const hasDbWeekly = useMemo(() => {
        if (!Array.isArray(weekMatrixData) || weekMatrixData.length === 0) return false;
        return weekMatrixData.some((item) => Number(item?.total_screen_time_minutes ?? 0) > 0);
    }, [weekMatrixData]);

    // Format 7 hari (Sen s.d. Min): Mengambil data langsung dari Android OS
    const weeklyData = useMemo(() => {
        if (Array.isArray(androidStats?.weekly)) {
            return androidStats.weekly as Array<{
                day: string;
                value: number;
                minutes: number;
                slots?: Record<string, number>;
                ranking?: Array<{
                    rank: number;
                    key: string;
                    name: string;
                    minutes: number;
                    percentage: number;
                }>;
            }>;
        }

        const daysMap = [
            { day: 'Sen', dayOfWeek: 1 },
            { day: 'Sel', dayOfWeek: 2 },
            { day: 'Rab', dayOfWeek: 3 },
            { day: 'Kam', dayOfWeek: 4 },
            { day: 'Jum', dayOfWeek: 5 },
            { day: 'Sab', dayOfWeek: 6 },
            { day: 'Min', dayOfWeek: 0 },
        ];

        return daysMap.map((d) => ({
            day: d.day,
            value: 0,
            minutes: 0,
            ranking: [],
        }));
    }, [androidStats]);

    // Tentukan hari aktif default ke hari ini
    const todayDayName = useMemo(() => {
        const d = new Date().getDay();
        const map: Record<number, string> = {
            1: 'Sen',
            2: 'Sel',
            3: 'Rab',
            4: 'Kam',
            5: 'Jum',
            6: 'Sab',
            0: 'Min',
        };
        return map[d] || 'Sab';
    }, []);

    const [selectedDay, setSelectedDay] = useState(todayDayName);

    // Ambil data hari yang dipilih dari list weekly
    const selectedDayItem = useMemo(() => {
        return weeklyData.find((w) => w.day === selectedDay);
    }, [weeklyData, selectedDay]);

    // Format durasi penggunaan untuk hari yang dipilih
    const selectedDayUsageText = useMemo(() => {
        if (!selectedDayItem || selectedDayItem.minutes <= 0) return '0 Menit';
        return formatMinutesToHoursText(selectedDayItem.minutes);
    }, [selectedDayItem]);

    // Hitung max value untuk bar chart scale
    const maxWeeklyValue = useMemo(() => {
        const max = Math.max(...weeklyData.map((d) => d.value), 1);
        return Math.max(max, 8); // minimal skala 8 jam agar bar proporsional
    }, [weeklyData]);

    // Ranking list: Mengambil dari Android OS untuk hari yang dipilih
    const ranking = useMemo(() => {
        if (selectedDayItem?.ranking && selectedDayItem.ranking.length > 0) {
            const hasUsage = selectedDayItem.ranking.some((r) => r.minutes > 0);
            if (hasUsage) {
                return selectedDayItem.ranking;
            }
        }

        if (androidStats?.ranking) {
            return androidStats.ranking as Array<{
                rank: number;
                key: string;
                name: string;
                minutes: number;
                percentage: number;
            }>;
        }
        return [];
    }, [selectedDayItem, androidStats]);

    // Rank #1 (Top App untuk hari yang dipilih dari Android)
    const topRankApp = ranking.length > 0 ? ranking[0] : null;
    const topAppName = topRankApp ? topRankApp.name : 'Instagram';
    const topAppKey = topRankApp ? topRankApp.key : 'instagram';
    const topAppUsageText = topRankApp ? formatMinutesToHoursText(topRankApp.minutes) : '0 Menit';

    // Rank #2 s.d. #6 (Filter yang > 0 menit)
    const otherApps = useMemo(() => {
        if (ranking.length <= 1) return [];
        return ranking.slice(1).filter((app) => app.minutes > 0);
    }, [ranking]);

    const chartWidth = 320 * s;
    const chartHeight = 110 * s;

    // 12 Slot titik kurva: Mengambil dari data Android untuk hari yang dipilih
    const slotValues = useMemo(() => {
        if (selectedDayItem?.slots) {
            const slots = selectedDayItem.slots;
            return SLOT_KEYS.map((k) => Math.max(0, slots[k] ?? 0));
        }

        if (selectedDay === todayDayName && androidStats?.slots) {
            const slots = androidStats.slots;
            return SLOT_KEYS.map((k) => Math.max(0, slots[k] ?? 0));
        }

        return SLOT_KEYS.map(() => 0);
    }, [selectedDayItem, selectedDay, todayDayName, androidStats]);

    const maxSlotValue = useMemo(() => {
        return Math.max(1, ...slotValues);
    }, [slotValues]);

    const chartPoints = useMemo(() => {
        const stepX = chartWidth / (slotValues.length - 1);
        const hasData = slotValues.some((v) => v > 0);

        if (!hasData) {
            // Garis datar di dasar grafik jika belum ada data/0 menit
            return slotValues.map((_, idx) => ({
                x: idx * stepX,
                y: chartHeight * 0.9,
            }));
        }

        return slotValues.map((val, idx) => {
            const x = idx * stepX;
            const normalized = val / maxSlotValue;
            // Map to vertical height (padding 18% bottom & top)
            const y = chartHeight * 0.82 - normalized * (chartHeight * 0.65);
            return { x, y };
        });
    }, [slotValues, maxSlotValue, chartWidth, chartHeight]);

    const hasSlotData = useMemo(() => slotValues.some((v) => v > 0), [slotValues]);

    const chartLine = chartPoints
        .map((point, index) => {
            return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
        })
        .join(' ');

    const chartArea = `${chartLine} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    return (
        <View className="flex-1 bg-[#F6F3EC]">

            {/* HEADER FIXED */}
            <View
                className="flex-row items-center"
                style={{
                    paddingHorizontal: 16 * s,
                    paddingTop: 50 * s,
                    paddingBottom: 18 * s,
                }}
            >
                <TouchableOpacity
                    className="items-center justify-center bg-[#F6F3EC]"
                    style={{
                        width: 44 * s,
                        height: 44 * s,
                        borderRadius: 22 * s,
                        marginRight: 16 * s,
                        shadowColor: '#000000',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.12,
                        shadowRadius: 3,
                        elevation: 3,
                    }}
                    activeOpacity={0.7}
                    onPress={() => router.back()}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24 * s}
                        color="#292D35"
                    />
                </TouchableOpacity>

                <Text
                    className="font-outfit-extrabold text-[#292D35]"
                    style={{ fontSize: 18 * s }}
                >
                    Jam Terbanyak Aplikasi
                </Text>
            </View>

            {/* SCROLLABLE CONTENT */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 16 * s,
                    paddingBottom: 32 * s,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View
                    className="bg-[#CECECE]/40"
                    style={{
                        borderRadius: 20 * s,
                        padding: 10 * s,
                    }}
                >
                    <View
                        className="bg-white"
                        style={{
                            borderRadius: 17 * s,
                            padding: 10 * s,
                        }}
                    >
                        {/* GRAFIK APLIKASI UTAMA */}
                        <View
                            className="overflow-hidden bg-[#E6EDE6]/75"
                            style={{
                                borderRadius: 14 * s,
                                paddingTop: 12 * s,
                            }}
                        >
                            <View
                                style={{
                                    height: chartHeight,
                                    overflow: 'hidden',
                                }}
                            >
                                {hasSlotData ? (
                                    <Svg
                                        width="100%"
                                        height={chartHeight}
                                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                    >
                                        <Defs>
                                            <LinearGradient
                                                id="detailAppChartGradient"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <Stop
                                                    offset="0"
                                                    stopColor="#2E6B4E"
                                                    stopOpacity="0.3"
                                                />
                                                <Stop
                                                    offset="1"
                                                    stopColor="#2E6B4E"
                                                    stopOpacity="0"
                                                />
                                            </LinearGradient>
                                        </Defs>

                                        <Path
                                            d={chartArea}
                                            fill="url(#detailAppChartGradient)"
                                        />

                                        <Path
                                            d={chartLine}
                                            stroke="#2E6B4E"
                                            strokeWidth={2 * s}
                                            fill="none"
                                        />

                                        {chartPoints.map((point, index) => (
                                            <Circle
                                                key={index}
                                                cx={point.x}
                                                cy={point.y}
                                                r={3.5 * s}
                                                fill="#FFFFFF"
                                                stroke="#2E6B4E"
                                                strokeWidth={1.5 * s}
                                            />
                                        ))}
                                    </Svg>
                                ) : (
                                    <View className="flex-1 items-center justify-center">
                                        <Text
                                            className="font-outfit-medium text-[#7C828A]"
                                            style={{ fontSize: 12 * s }}
                                        >
                                            {selectedDay === todayDayName
                                                ? 'Belum ada aktivitas scroll hari ini'
                                                : `Belum ada aktivitas scroll hari ${selectedDay}`}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View
                                className="flex-row items-end justify-between"
                                style={{
                                    marginTop: -20 * s,
                                    paddingHorizontal: 12 * s,
                                    paddingVertical: 10 * s,
                                }}
                            >
                                <View className="flex-1">
                                    <Text
                                        className="font-outfit-extrabold text-[#275C43]"
                                        style={{ fontSize: 15 * s }}
                                    >
                                        {selectedDay === todayDayName ? topAppName : `${topAppName} (${selectedDay})`}
                                    </Text>

                                    <Text
                                        className="font-outfit-semibold text-[#275C43]"
                                        style={{ fontSize: 10.5 * s }}
                                    >
                                        {selectedDay === todayDayName ? topAppUsageText : selectedDayUsageText}
                                    </Text>
                                </View>

                                <View style={{ marginTop: -12 * s }}>
                                    {renderAppBadge(topAppKey, 58 * s)}
                                </View>
                            </View>
                        </View>

                        {/* KARTU PESAN YUDA */}
                        <View
                            className="flex-row items-end overflow-hidden bg-[#F6EFD0]"
                            style={{
                                borderRadius: 14 * s,
                                paddingLeft: 10 * s,
                                paddingRight: 12 * s,
                                paddingTop: 10 * s,
                                paddingBottom: 0,
                                marginTop: 10 * s,
                            }}
                        >
                            <View
                                className="items-center justify-end"
                                style={{
                                    width: 66 * s,
                                    height: 66 * s,
                                    marginRight: 10 * s,
                                }}
                            >
                                <Image
                                    source={YUDA_IMAGE}
                                    className="h-full w-full"
                                    style={{
                                        transform: [
                                            { translateY: 4 * s },
                                        ],
                                    }}
                                    resizeMode="contain"
                                />
                            </View>

                            <View
                                className="flex-1"
                                style={{ paddingBottom: 10 * s }}
                            >
                                <Text
                                    className="font-outfit-extrabold text-[#2B2313]"
                                    style={{ fontSize: 14 * s }}
                                >
                                    Halo, {displayName}
                                </Text>

                                <Text
                                    className="font-outfit-medium text-[#5E5038]"
                                    style={{
                                        fontSize: 10.5 * s,
                                        lineHeight: 14 * s,
                                        marginTop: 2 * s,
                                    }}
                                >
                                    {topAppName} menjadi aplikasi dengan waktu
                                    penggunaan terlama. Yuk, sisihkan waktu
                                    untuk aktivitas lain!
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* GRAFIK TREN 7 HARI */}
                    <View
                        className="bg-white"
                        style={{
                            borderRadius: 18 * s,
                            padding: 12 * s,
                            marginTop: 10 * s,
                        }}
                    >
                        <View className="mb-2 flex-row items-center">
                            <Ionicons
                                name="calendar"
                                size={17 * s}
                                color="#275C43"
                                style={{ marginRight: 6 * s }}
                            />

                            <Text
                                className="font-outfit-extrabold text-[#292D35]"
                                style={{ fontSize: 16 * s }}
                            >
                                Tren dalam 7 Hari
                            </Text>
                        </View>

                        {/* CARD SAGE: BATANG DAN NILAI JAM */}
                        <View
                            className="bg-[#E6EDE6]/75"
                            style={{
                                height: 112 * s,
                                borderRadius: 12 * s,
                                paddingHorizontal: 8 * s,
                                paddingTop: 8 * s,
                                overflow: 'hidden',
                            }}
                        >
                            <View
                                className="flex-1 flex-row items-end justify-between"
                                style={{ gap: 4 * s }}
                            >
                                {weeklyData.map((item) => {
                                    const isActive = selectedDay === item.day;
                                    const barHeight = item.value > 0
                                        ? Math.max((item.value / maxWeeklyValue) * (78 * s), 4 * s)
                                        : 0;

                                    return (
                                        <TouchableOpacity
                                            key={item.day}
                                            activeOpacity={0.75}
                                            onPress={() => setSelectedDay(item.day)}
                                            className="flex-1 items-center justify-end"
                                            style={{ height: '100%' }}
                                        >
                                            <View
                                                className="flex-1 items-center justify-end"
                                                style={{ width: '100%' }}
                                            >
                                                <View
                                                    style={{
                                                        height: 18 * s,
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end',
                                                        marginBottom: 4 * s,
                                                    }}
                                                >
                                                    {isActive && item.value > 0 && (
                                                        <Text
                                                            className="font-outfit-extrabold text-[#275C43]"
                                                            style={{ fontSize: 11 * s }}
                                                        >
                                                            {item.value.toFixed(1)}j
                                                        </Text>
                                                    )}
                                                </View>

                                                <View
                                                    style={{
                                                        width: '75%',
                                                        height: barHeight,
                                                        borderTopLeftRadius: 8 * s,
                                                        borderTopRightRadius: 8 * s,
                                                        backgroundColor: isActive
                                                            ? '#2E6B4E'
                                                            : '#88AA9A',
                                                    }}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* NAMA HARI DI LUAR CARD SAGE */}
                        <View
                            className="flex-row justify-between"
                            style={{
                                paddingHorizontal: 8 * s,
                                gap: 4 * s,
                                marginTop: 6 * s,
                            }}
                        >
                            {weeklyData.map((item) => {
                                const isActive = selectedDay === item.day;

                                return (
                                    <TouchableOpacity
                                        key={item.day}
                                        activeOpacity={0.75}
                                        onPress={() => setSelectedDay(item.day)}
                                        className="flex-1 items-center"
                                    >
                                        <Text
                                            className={`font-outfit-bold ${isActive
                                                    ? 'text-[#275C43]'
                                                    : 'text-[#292D35]'
                                                }`}
                                            style={{ fontSize: 9.5 * s }}
                                        >
                                            {item.day}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* APLIKASI LAINNYA */}
                <View
                    className="bg-[#CECECE]/40"
                    style={{
                        borderRadius: 20 * s,
                        padding: 10 * s,
                        marginTop: 14 * s,
                    }}
                >
                    <View
                        className="flex-row items-center self-start bg-white"
                        style={{
                            paddingHorizontal: 12 * s,
                            paddingVertical: 6 * s,
                            borderRadius: 14 * s,
                            marginBottom: 10 * s,
                        }}
                    >
                        <Ionicons
                            name="phone-portrait-outline"
                            size={15 * s}
                            color="#275C43"
                            style={{ marginRight: 6 * s }}
                        />

                        <Text
                            className="font-outfit-bold text-[#292D35]"
                            style={{ fontSize: 13 * s }}
                        >
                            {selectedDay === todayDayName
                                ? 'Aplikasi Lainnya'
                                : `Aplikasi Lainnya (${selectedDay})`}
                        </Text>
                    </View>

                    <View style={{ gap: 8 * s }}>
                        {isSocialLoading ? (
                            <View style={{ paddingVertical: 20 * s, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color="#275C43" />
                            </View>
                        ) : otherApps.length === 0 ? (
                            <View
                                className="items-center justify-center bg-white"
                                style={{
                                    borderRadius: 15 * s,
                                    paddingVertical: 18 * s,
                                    paddingHorizontal: 12 * s,
                                }}
                            >
                                <Text
                                    className="font-outfit-medium text-[#7C828A]"
                                    style={{ fontSize: 13 * s }}
                                >
                                    Belum ada pemakaian aplikasi lainnya
                                </Text>
                            </View>
                        ) : (
                            otherApps.map((app) => (
                                <View
                                    key={app.key}
                                    className="flex-row items-center bg-white"
                                    style={{
                                        borderRadius: 15 * s,
                                        paddingVertical: 7 * s,
                                        paddingHorizontal: 12 * s,
                                    }}
                                >
                                    <Text
                                        className="font-outfit-extrabold text-[#275C43]"
                                        style={{
                                            width: 39 * s,
                                            fontSize: 16 * s,
                                        }}
                                    >
                                        #{app.rank}
                                    </Text>

                                    <View style={{ marginRight: 14 * s }}>
                                        {renderAppBadge(app.key, 44 * s)}
                                    </View>

                                    <Text
                                        className="flex-1 font-outfit-extrabold text-[#292D35]"
                                        style={{ fontSize: 16 * s }}
                                        numberOfLines={1}
                                    >
                                        {app.name}
                                    </Text>

                                    <Text
                                        className="font-outfit-extrabold text-[#275C43]"
                                        style={{ fontSize: 13 * s }}
                                    >
                                        {formatMinutesShort(app.minutes)}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
