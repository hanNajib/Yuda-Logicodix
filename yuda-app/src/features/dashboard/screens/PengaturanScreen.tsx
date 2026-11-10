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
    Alert,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    Text,
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
import { PengaturanHeaderGreeting } from '../components/pengaturan/PengaturanHeaderGreeting';
import { PengaturanDasarCard } from '../components/pengaturan/BasicOptionCard';
import { TautkanAkunCard } from '../components/pengaturan/TautkanAkunCard';

const SAGE_BG = '#bccdc0';
const SHEET_BG = '#F6F3EC';
const REF_W = 420;

interface PengaturanScreenProps {
    onTabChange?: (tab: DashboardTab) => void;
}

export default function PengaturanScreen({
    onTabChange,
}: PengaturanScreenProps) {
    const insets = useSafeAreaInsets();
    const { width: W } = useWindowDimensions();
    const s = Math.min(W / REF_W, 1.15);

    const { user, userName } = useAuthStore();

    const displayName = userName || user?.name || 'Gathan';
    const displayEmail = user?.email || 'gathanfairuz23@gmail.com';

    const [activeTab, setActiveTab] = useState<DashboardTab>('settings');

    const [intervalMinutes, setIntervalMinutes] = useState(15);
    const [isIntervalModalOpen, setIsIntervalModalOpen] = useState(false);

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
            } else if (
                !isHeaderCovered.value &&
                currentY > 10 * s
            ) {
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

    const handleGoogleAuth = () => {
        Alert.alert(
            'Tautkan Akun Google',
            'Fitur penautan akun Google akan menyinkronkan data progres dan konfigurasi kamu ke cloud.',
            [
                {
                    text: 'Oke',
                },
            ]
        );
    };

    if (!fontsLoaded) return null;

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
                <PengaturanHeaderGreeting
                    userName={displayName}
                    userEmail={displayEmail}
                    avatarUrl={user?.avatar}
                    scale={s}
                    onEditProfile={() =>
                        Alert.alert(
                            'Edit Profil',
                            'Halaman edit profil'
                        )
                    }
                />
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
                        Math.max(insets.bottom, 20) + 110 * s,
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
                    className="flex-1 bg-[#F6F3EC]"
                    style={[
                        {
                            paddingHorizontal: 16,
                        },
                        animatedSheetStyle,
                    ]}
                >
                    <PengaturanDasarCard />

                    <View
                        style={{
                            height: 14 * s,
                        }}
                    />

                    <TautkanAkunCard
                        scale={s}
                        onLinkGoogle={handleGoogleAuth}
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

            <Modal
                visible={isIntervalModalOpen}
                transparent
                animationType="fade"
                onRequestClose={() =>
                    setIsIntervalModalOpen(false)
                }
            >
                <Pressable
                    className="flex-1 items-center justify-center bg-[rgba(0,0,0,0.5)] px-6"
                    onPress={() =>
                        setIsIntervalModalOpen(false)
                    }
                >
                    <Pressable
                        className="w-full bg-white"
                        style={[
                            {
                                borderRadius: 24 * s,
                                padding: 20 * s,
                            },
                            {
                                shadowColor: '#000',
                                shadowOffset: {
                                    width: 0,
                                    height: 4,
                                },
                                shadowOpacity: 0.15,
                                shadowRadius: 12,
                                elevation: 8,
                            },
                        ]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text
                            className="font-outfit-extrabold text-[#1f2923]"
                            style={{
                                fontSize: 18 * s,
                            }}
                        >
                            Atur Waktu Jeda Scrolling
                        </Text>

                        <Text
                            className="font-outfit-medium text-[#55685d]"
                            style={{
                                fontSize: 12.5 * s,
                                marginTop: 4 * s,
                                marginBottom: 18 * s,
                            }}
                        >
                            Tentukan seberapa sering Yuda akan
                            mengingatkan saat doomscrolling.
                        </Text>

                        <View className="flex-row items-center justify-center">
                            <Pressable
                                className="h-12 w-12 items-center justify-center bg-[#e6ede6]"
                                style={{
                                    borderRadius: 14 * s,
                                }}
                                onPress={() =>
                                    setIntervalMinutes((prev) =>
                                        Math.max(5, prev - 5)
                                    )
                                }
                            >
                                <Text
                                    className="font-outfit-extrabold text-[#2e6b4e]"
                                    style={{
                                        fontSize: 22 * s,
                                    }}
                                >
                                    −
                                </Text>
                            </Pressable>

                            <View className="mx-6 items-center justify-center">
                                <Text
                                    className="font-outfit-extrabold text-[#2e6b4e]"
                                    style={{
                                        fontSize: 32 * s,
                                    }}
                                >
                                    {intervalMinutes}
                                </Text>

                                <Text
                                    className="font-outfit-semibold text-[#495a4f]"
                                    style={{
                                        fontSize: 14 * s,
                                    }}
                                >
                                    Menit
                                </Text>
                            </View>

                            <Pressable
                                className="h-12 w-12 items-center justify-center bg-[#e6ede6]"
                                style={{
                                    borderRadius: 14 * s,
                                }}
                                onPress={() =>
                                    setIntervalMinutes((prev) =>
                                        Math.min(120, prev + 5)
                                    )
                                }
                            >
                                <Text
                                    className="font-outfit-extrabold text-[#2e6b4e]"
                                    style={{
                                        fontSize: 22 * s,
                                    }}
                                >
                                    +
                                </Text>
                            </Pressable>
                        </View>

                        <Pressable
                            className="mt-0 items-center justify-center bg-[#2e6b4e]"
                            style={{
                                borderRadius: 14 * s,
                                paddingVertical: 12 * s,
                                marginTop: 22 * s,
                            }}
                            onPress={() =>
                                setIsIntervalModalOpen(false)
                            }
                        >
                            <Text
                                className="font-outfit-bold text-white"
                                style={{
                                    fontSize: 14.5 * s,
                                }}
                            >
                                Simpan Waktu Jeda
                            </Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
