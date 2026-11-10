
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
import { useAuthStore } from '@/stores/useAuthStore';
import { BottomNavBar, DashboardTab } from '../components/BottomNavBar';
import { HeaderGreeting } from '../components/beranda/HeaderGreeting';
import { MoodSelectCard } from '../components/beranda/MoodSelectCard';
import { ScreenTimeCard } from '../components/beranda/ScreenTimeCard';
import { TipsCard } from '../components/beranda/TipsCard';
import { ToDoListCard } from '../components/beranda/ToDoListCard';

const SAGE_BG = '#bccdc0';
const SHEET_BG = '#F6F3EC';
const REF_W = 420;

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const { width: W } = useWindowDimensions();
    const s = Math.min(W / REF_W, 1.15);

    const { user, userName } = useAuthStore();
    const displayName = userName || user?.name || 'Gathan';

    const [activeTab, setActiveTab] = useState<DashboardTab>('home');

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
                    className="flex-1"
                    style={[
                        {
                            paddingHorizontal: 16,
                            backgroundColor: SHEET_BG,
                        },
                        animatedSheetStyle,
                    ]}
                >
                    <MoodSelectCard userName={displayName} scale={s} />

                    <View style={{ height: 14 * s }} />

                    <ScreenTimeCard
                        scale={s}
                        hours={15}
                        minutes={45}
                        peakHour="20:00"
                        pausesCount={3}
                        topApp="Instagram"
                        topAppTime="43 Jam 15 Menit"
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
