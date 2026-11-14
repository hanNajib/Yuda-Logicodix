import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useRef, useState } from 'react';
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

import {
    BottomNavBar,
    DashboardTab,
} from '../components/BottomNavBar';

import { AppUsageSection } from '../components/pola/AppUsageSection';
import { PolaHeaderGreeting } from '../components/pola/PolaHeaderGreeting';
import { ScrollMatrixCard } from '../components/pola/ScrollMatrixCard';
import { ScrollTimeHeroCard } from '../components/pola/ScrollTimeHeroCard';

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

interface PolaScreenProps {
    onTabChange?: (tab: DashboardTab) => void;
}

export default function PolaScreen({
    onTabChange,
}: PolaScreenProps) {
    const router = useRouter();

    const insets = useSafeAreaInsets();

    const { width: W } = useWindowDimensions();
    const s = Math.min(W / REF_W, 1.15);

    const { user, userName } = useAuthStore();
    const displayName = userName || user?.name || 'Gathan';

    const [activeTab, setActiveTab] = useState<DashboardTab>('stats');

    const todayIso = useMemo(() => getTodayIsoString(), []);

    const { data: todayMatrixData } = useQuery({
        queryKey: ['dailyScreenTimeMatrix', todayIso],
        queryFn: async () => {
            const res = await apiClient.get('/api/intervention/matrix/daily', {
                params: { date: todayIso },
            });
            return res.data?.data;
        },
    });

    const totalMinutes = todayMatrixData?.total_screen_time_minutes ?? 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const diffMinutes = todayMatrixData?.diff_minutes ?? 0;
    const interventionsTriggered = todayMatrixData?.interventions_triggered ?? 0;
    const slots = todayMatrixData?.slots ?? {};

    const todayAppUsages = useMemo(() => {
        if (!todayMatrixData?.app_usages) {
            return [];
        }
        return todayMatrixData.app_usages
            .filter((app: any) => (app.minutes ?? 0) > 0)
            .map((app: any) => {
                const hours = Math.floor(app.minutes / 60);
                const mins = app.minutes % 60;
                let usageTime = '0 Menit';
                if (hours > 0 && mins > 0) {
                    usageTime = `${hours} Jam, ${mins} Menit`;
                } else if (hours > 0) {
                    usageTime = `${hours} Jam`;
                } else if (mins > 0) {
                    usageTime = `${mins} Menit`;
                }

                return {
                    id: app.key,
                    name: app.name,
                    usageTime,
                    percentage: Math.round(app.percentage),
                };
            });
    }, [todayMatrixData?.app_usages]);

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const scrollRef = useRef<Animated.ScrollView>(null);

    const scrollY = useSharedValue(0);
    const isHeaderCovered = useSharedValue(false);

    const topGreetingPadding =
        Math.max(insets.top, 20) + 28 * s;

    const headerFixedSpacer = 165 * s;

    const snapDistance =
        topGreetingPadding + headerFixedSpacer - insets.top;

    const snapTo = (targetY: number) => {
        scrollRef.current?.scrollTo({
            y: targetY,
            animated: true,
        });
    };

    const handleScroll = (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => {
        const currentY = event.nativeEvent.contentOffset.y;

        if (
            !isHeaderCovered.value &&
            currentY > snapDistance + 5
        ) {
            scrollRef.current?.scrollTo({
                y: snapDistance,
                animated: false,
            });

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

            if (
                velocityY < -80 ||
                (currentY < snapDistance && velocityY <= 0)
            ) {
                isHeaderCovered.value = false;

                runOnJS(snapTo)(0);
            } else if (
                !isHeaderCovered.value &&
                currentY > 10 * s
            ) {
                isHeaderCovered.value = true;

                runOnJS(snapTo)(snapDistance);
            }
        },
    });

    const animatedStatusBarSafetyStyle =
        useAnimatedStyle(() => {
            const opacity = interpolate(
                scrollY.value,
                [
                    snapDistance - 15 * s,
                    snapDistance,
                ],
                [0, 1],
                Extrapolate.CLAMP
            );

            return {
                opacity,
            };
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
            [
                24 * s,
                insets.top + 24 * s,
            ],
            Extrapolate.CLAMP
        );

        return {
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            paddingTop,
        };
    });

    const handleTabPress = (tab: DashboardTab) => {
        setActiveTab(tab);
        onTabChange?.(tab);
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View className="flex-1 bg-[#F6F3EC]">
            <StatusBar style="dark" />

            <View
                className="absolute left-0 right-0 z-[1] bg-[#bccdc0] px-4"
                style={{
                    top: 0,
                    paddingTop: topGreetingPadding,
                    height:
                        topGreetingPadding +
                        headerFixedSpacer +
                        30 * s,
                }}
            >
                <PolaHeaderGreeting scale={s} />
            </View>

            <Animated.View
                className="absolute left-0 right-0 top-0 z-[5] bg-[#F6F3EC]"
                style={[
                    {
                        height: insets.top + 8 * s,
                    },
                    animatedStatusBarSafetyStyle,
                ]}
            />

            <Animated.ScrollView
                ref={scrollRef}
                className="z-[2] flex-1 bg-transparent"
                onScroll={scrollHandler}
                onScrollToTop={() => {}}
                onNativeScroll={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="fast"
                bounces={true}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom:
                        Math.max(insets.bottom, 20) +
                        110 * s,
                }}
            >
                <View
                    style={{
                        height:
                            topGreetingPadding +
                            headerFixedSpacer,
                    }}
                />

                <Animated.View
                    className="flex-1 bg-[#F6F3EC] px-4"
                    style={animatedSheetStyle}
                >
                    <ScrollTimeHeroCard
                        userName={displayName}
                        scale={s}
                        hours={hours}
                        minutes={minutes}
                        diffMinutes={diffMinutes}
                        interventionsTriggered={interventionsTriggered}
                        slots={slots}
                        onViewMore={() => router.push('/dashboard/detail-waktu-scroll')}
                    />

                    <View
                        style={{
                            height: 14 * s,
                        }}
                    />

                    <AppUsageSection
                        scale={s}
                        apps={todayAppUsages}
                    />

                    <View
                        style={{
                            height: 14 * s,
                        }}
                    />

                    <ScrollMatrixCard
                        scale={s}
                    />
                </Animated.View>
            </Animated.ScrollView>

            <View
                className="absolute bottom-0 left-0 right-0 z-[10]"
                style={{
                    elevation: 10,
                }}
            >
                <BottomNavBar
                    activeTab={activeTab}
                    onTabPress={handleTabPress}
                    bottomInset={insets.bottom}
                    scale={s}
                />
            </View>
        </View>
    );
}
