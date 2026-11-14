import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    useWindowDimensions,
    View,
} from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/services/apiClient';
import { BottomNavBar, DashboardTab } from '../components/BottomNavBar';
import { HeaderGreeting } from '../components/beranda/HeaderGreeting';
import { MoodSelectCard } from '../components/beranda/MoodSelectCard';
import { ScreenTimeCard } from '../components/beranda/ScreenTimeCard';
import { TipsCard } from '../components/beranda/TipsCard';
import { ToDoListCard } from '../components/beranda/ToDoListCard';
import { OverlayQuickControlCard } from '../components/beranda/OverlayQuickControlCard';
import YudaPip from '@/modules/yuda-pip';
import { syncScreenTimeIfDue } from '../services/screenTimeSyncService';

const SAGE_BG = '#bccdc0';
const SHEET_BG = '#F6F3EC';
const REF_W = 420;

function getTodayIsoString(): string {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export default function HomeScreen() {
    const router = useRouter();

    const insets = useSafeAreaInsets();
    const { width: W } = useWindowDimensions();
    const s = Math.min(W / REF_W, 1.15);

    const { user, userName } = useAuthStore();
    const displayName = userName || user?.name || 'Gathan';

    const [activeTab, setActiveTab] = useState<DashboardTab>('home');

    const todayIso = useMemo(() => getTodayIsoString(), []);

    // 1. Data total kumulatif social screen time (sejak pertama pakai Yuda)
    const { data: socialData } = useQuery({
        queryKey: ['socialScreenTime'],
        queryFn: async () => {
            const res = await apiClient.get('/api/screen-time/social');
            return res.data?.data;
        },
        staleTime: 60 * 1000,
    });

    // 2. Data matriks harian hari ini untuk total screen time & peak hour & jeda hari ini
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

    // 3. Ambil data screen time dari Android OS (sejak install Yuda)
    const { data: androidStats, refetch: refetchAndroidStats } = useQuery({
        queryKey: ['androidUsageStats'],
        queryFn: async () => {
            if (typeof YudaPip?.getAndroidUsageStats === 'function') {
                return await YudaPip.getAndroidUsageStats(7);
            }
            return null;
        },
        staleTime: 60 * 1000,
    });

    // Otomatis upsert hemat daya & kuota (Smart Throttled Sync: min 15 menit & jika data berubah)
    useEffect(() => {
        syncScreenTimeIfDue({ reason: 'app_active' });
    }, [todayIso]);

    // Beranda: Utamakan 100% dari DB Yuda (user_social_screen_times & user_daily_screen_time_matrices)
    const topApp = socialData?.top_app?.name || androidStats?.top_app?.name || 'Instagram';
    const topAppKey = socialData?.top_app?.key || androidStats?.top_app?.key || 'instagram';
    const topAppMinutes = Number(socialData?.top_app?.minutes ?? androidStats?.top_app?.minutes ?? 0);
    const topAppHoursPart = Math.floor(topAppMinutes / 60);
    const topAppMinsPart = topAppMinutes % 60;
    const topAppTimeFormatted = `${topAppHoursPart} Jam ${topAppMinsPart} Menit`;

    // Kalkulasi Screen Time hari ini dari DB Yuda (fallback ke android jika baru pertama kali buka)
    const todayTotalMinutes = Number(todayMatrixData?.total_screen_time_minutes ?? androidStats?.today_total_minutes ?? 0);
    const screenTimeHours = Math.floor(todayTotalMinutes / 60);
    const screenTimeMinutes = todayTotalMinutes % 60;
    const pausesCount = Number(todayMatrixData?.interventions_triggered ?? 0);

    const activeSlots = todayMatrixData?.slots || androidStats?.slots;

    // Hitung peak hour (slot tertinggi hari ini)
    const peakHour = useMemo(() => {
        if (!activeSlots) return '20:00';
        const slots = activeSlots;
        let maxMinutes = -1;
        let maxSlotKey = 'slot_20_22';

        const slotTimeLabels: Record<string, string> = {
            slot_00_02: '00:00',
            slot_02_04: '02:00',
            slot_04_06: '04:00',
            slot_06_08: '06:00',
            slot_08_10: '08:00',
            slot_10_12: '10:00',
            slot_12_14: '12:00',
            slot_14_16: '14:00',
            slot_16_18: '16:00',
            slot_18_20: '18:00',
            slot_20_22: '20:00',
            slot_22_00: '22:00',
        };

        Object.entries(slots).forEach(([k, v]) => {
            const val = Number(v) || 0;
            if (val > maxMinutes) {
                maxMinutes = val;
                maxSlotKey = k;
            }
        });

        return slotTimeLabels[maxSlotKey] || '20:00';
    }, [activeSlots]);

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const scrollRef = useRef<Animated.ScrollView>(null);
    const scrollY = useSharedValue(0);
    const isHeaderCovered = useSharedValue(false);

    const topGreetingPadding = Math.max(insets.top, 20) + 28 * s;
    const headerFixedSpacer = 165 * s;
    const snapDistance = topGreetingPadding + headerFixedSpacer - insets.top;

    const snapTo = (targetY: number) => {
        scrollRef.current?.scrollTo({ y: targetY, animated: true });
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentY = event.nativeEvent.contentOffset.y;

        if (!isHeaderCovered.value && currentY > snapDistance + 5) {
            scrollRef.current?.scrollTo({ y: snapDistance, animated: false });
            isHeaderCovered.value = true;
        }
    };

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;

            if (scrollY.value >= snapDistance - 2) {
                isHeaderCovered.value = true;
            } else if (scrollY.value <= 2) {
                isHeaderCovered.value = false;
            }
        },
        onScrollEndDrag: (event) => {
            const currentY = event.contentOffset.y;
            const velocityY = event.velocity?.y || 0;

            if (velocityY < -80 || (currentY < snapDistance && velocityY <= 0)) {
                isHeaderCovered.value = false;
                runOnJS(snapTo)(0);
            } else if (!isHeaderCovered.value && currentY > 10 * s) {
                isHeaderCovered.value = true;
                runOnJS(snapTo)(snapDistance);
            }
        },
    });

    const animatedStatusBarSafetyStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [snapDistance - 15 * s, snapDistance],
            [0, 1],
            Extrapolate.CLAMP
        );

        return { opacity };
    });

    const animatedSheetStyle = useAnimatedStyle(() => {
        const borderRadius = interpolate(
            scrollY.value,
            [0, snapDistance],
            [32 * s, 0],
            Extrapolate.CLAMP
        );

        const paddingTop = interpolate(
            scrollY.value,
            [0, snapDistance],
            [24 * s, insets.top + 24 * s],
            Extrapolate.CLAMP
        );

        return {
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            paddingTop,
        };
    });

    if (!fontsLoaded) return null;

    return (
        <View className="flex-1" style={{ backgroundColor: SHEET_BG }}>
            <StatusBar style="dark" />

            <View
                className="absolute left-0 right-0 z-[1] px-4"
                style={{
                    top: 0,
                    paddingTop: topGreetingPadding,
                    height: topGreetingPadding + headerFixedSpacer + 30 * s,
                    backgroundColor: SAGE_BG,
                }}
            >
                <HeaderGreeting userName={displayName} scale={s} />
            </View>

            <Animated.View
                className="absolute left-0 right-0 z-[5]"
                style={[
                    {
                        top: 0,
                        height: insets.top + 8 * s,
                        backgroundColor: SHEET_BG,
                    },
                    animatedStatusBarSafetyStyle,
                ]}
            />

            <Animated.ScrollView
                ref={scrollRef}
                className="z-[2] flex-1 bg-transparent"
                onScroll={scrollHandler}
                onScrollToTop={() => { }}
                onNativeScroll={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="fast"
                bounces={true}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: Math.max(insets.bottom, 20) + 110 * s,
                }}
            >
                <View
                    style={{
                        height: topGreetingPadding + headerFixedSpacer,
                    }}
                />

                <Animated.View
                    className="flex-1"
                    style={[
                        {
                            paddingHorizontal: 16,
                            backgroundColor: SHEET_BG,
                        },
                        animatedSheetStyle,
                    ]}
                >
                    <MoodSelectCard
                        userName={displayName}
                        scale={s}
                        initialEmotion={todayMatrixData?.emotion}
                        onEmotionChange={async (newEmotion) => {
                            try {
                                await apiClient.post('/api/intervention/matrix', {
                                    log_date: todayIso,
                                    emotion: newEmotion,
                                });
                            } catch (e) {
                                console.warn('[BerandaScreen] Gagal update emosi metrik:', e);
                            }
                        }}
                    />

                    <View style={{ height: 14 * s }} />

                    <OverlayQuickControlCard scale={s} userName={displayName} />

                    <View style={{ height: 14 * s }} />

                    <ScreenTimeCard
                        scale={s}
                        hours={screenTimeHours}
                        minutes={screenTimeMinutes}
                        peakHour={peakHour}
                        pausesCount={pausesCount}
                        topApp={topApp}
                        topAppKey={topAppKey}
                        topAppTime={topAppTimeFormatted}
                        slots={activeSlots}
                        onViewMore={() => router.push('/dashboard/detail-jam-aplikasi')}
                    />

                    <View style={{ height: 14 * s }} />

                    <ToDoListCard scale={s} />

                    <View style={{ height: 14 * s }} />

                    <TipsCard scale={s} />
                </Animated.View>
            </Animated.ScrollView>

            <View className="absolute bottom-0 left-0 right-0 z-[10] elevation-10">
                <BottomNavBar
                    activeTab={activeTab}
                    onTabPress={(tab) => setActiveTab(tab)}
                    bottomInset={insets.bottom}
                    scale={s}
                />
            </View>
        </View>
    );
}
