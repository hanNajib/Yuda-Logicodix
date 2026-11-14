import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
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

import { BottomNavBar, DashboardTab } from '../components/BottomNavBar';
import { AktivitasHeaderGreeting } from '../components/aktivitas/AktivitasHeaderGreeting';
import { CalendarMiniCard } from '../components/aktivitas/CalendarMiniCard';
import { AktivitasCard } from '../components/aktivitas/AktivitasCard';

const SAGE_BG = '#bccdc0';
const SHEET_BG = '#F6F3EC';
const REF_W = 420;

interface AktivitasScreenProps {
    onTabChange?: (tab: DashboardTab) => void;
}

export default function AktivitasScreen({
    onTabChange,
}: AktivitasScreenProps) {

    const insets = useSafeAreaInsets();
    const { width: W } = useWindowDimensions();
    const s = Math.min(W / REF_W, 1.15);

    const [activeTab, setActiveTab] = useState<DashboardTab>('tasks');
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    });

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

    const handleTabPress = (tab: DashboardTab) => {
        setActiveTab(tab);
        onTabChange?.(tab);
    };

    if (!fontsLoaded) return null;

    return (
        <View className="flex-1 bg-[#F6F3EC]">
            <StatusBar style="dark" />

            <View
                className="absolute top-0 left-0 right-0 z-[1] bg-[#bccdc0] px-4"
                style={{
                    paddingTop: topGreetingPadding,
                    height: topGreetingPadding + headerFixedSpacer + 30 * s,
                }}
            >
                <AktivitasHeaderGreeting scale={s} />
            </View>

            <Animated.View
                className="absolute top-0 left-0 right-0 z-[5] bg-[#F6F3EC]"
                style={[
                    { height: insets.top + 8 * s },
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
                    paddingBottom: Math.max(insets.bottom, 20) + 110 * s,
                }}
            >
                <View
                    style={{
                        height: topGreetingPadding + headerFixedSpacer,
                    }}
                />

                <Animated.View
                    className="flex-1 bg-[#F6F3EC]"
                    style={[
                        { paddingHorizontal: 16 },
                        animatedSheetStyle,
                    ]}
                >
                    <CalendarMiniCard
                        scale={s}
                        selectedDate={selectedDate}
                        onSelectDate={(dateIso) => setSelectedDate(dateIso)}
                    />

                    <View style={{ height: 14 * s }} />

                    <AktivitasCard
                        scale={s}
                        selectedDate={selectedDate}
                    />
                </Animated.View>
            </Animated.ScrollView>

            <View className="absolute bottom-0 left-0 right-0 z-[10] elevation-[10]">
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
