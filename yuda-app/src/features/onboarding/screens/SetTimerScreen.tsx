import { Ionicons } from '@expo/vector-icons';
import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';

const REF_W = 420;
const yudaHeadSource = require('../../../../assets/images/yuda/yudahalfbody.png');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export default function SetTimerScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: W } = useWindowDimensions();
    const reducedMotion = useReducedMotion();

    const { user, userName, intervalMinutes: savedInterval, setIntervalMinutes } = useAuthStore();
    const displayName = userName || user?.name || 'Gathan';
    const initialLetter = (displayName[0] || 'G').toUpperCase();

    const [durationMinutes, setDurationMinutes] = useState(savedInterval || 15);
    const submitting = useRef(false);

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const s = Math.min(W / REF_W, 1.15);

    const avatarFade = useSharedValue(0);
    const avatarY = useSharedValue(-20);
    const titleFade = useSharedValue(0);
    const titleY = useSharedValue(16);
    const progressCardFade = useSharedValue(0);
    const progressCardY = useSharedValue(20);
    const mainCardFade = useSharedValue(0);
    const mainCardY = useSharedValue(30);

    const btnScale = useSharedValue(1);
    const btnY = useSharedValue(0);
    const numScale = useSharedValue(1);
    const yudaBounceY = useSharedValue(0);

    useEffect(() => {
        if (!fontsLoaded) return;
        if (reducedMotion) {
            avatarFade.value = 1;
            avatarY.value = 0;
            titleFade.value = 1;
            titleY.value = 0;
            progressCardFade.value = 1;
            progressCardY.value = 0;
            mainCardFade.value = 1;
            mainCardY.value = 0;
            return;
        }

        avatarFade.value = withTiming(1, { duration: 400 });
        avatarY.value = withTiming(0, { duration: 450, easing: EASE_OUT });
        titleFade.value = withDelay(80, withTiming(1, { duration: 400 }));
        titleY.value = withDelay(80, withSpring(0, { duration: 480, dampingRatio: 0.8 }));
        progressCardFade.value = withDelay(160, withTiming(1, { duration: 350 }));
        progressCardY.value = withDelay(160, withSpring(0, { duration: 500, dampingRatio: 0.82 }));
        mainCardFade.value = withDelay(220, withTiming(1, { duration: 400 }));
        mainCardY.value = withDelay(220, withSpring(0, { duration: 520, dampingRatio: 0.82 }));
    }, [fontsLoaded, reducedMotion]);

    const avatarAnimatedStyle = useAnimatedStyle(() => ({
        opacity: avatarFade.value,
        transform: [{ translateY: avatarY.value }],
    }));

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: titleFade.value,
        transform: [{ translateY: titleY.value }],
    }));

    const progressCardAnimatedStyle = useAnimatedStyle(() => ({
        opacity: progressCardFade.value,
        transform: [{ translateY: progressCardY.value }],
    }));

    const mainCardAnimatedStyle = useAnimatedStyle(() => ({
        opacity: mainCardFade.value,
        transform: [{ translateY: mainCardY.value }],
    }));

    const btnAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: btnY.value },
            { scale: btnScale.value },
        ],
    }));

    const numAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: numScale.value }],
    }));

    const yudaAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: yudaBounceY.value }],
    }));

    const triggerChangeFeedback = () => {
        numScale.value = withSequence(
            withTiming(1.18, { duration: 100, easing: EASE_OUT }),
            withSpring(1, { duration: 250, dampingRatio: 0.7 })
        );

        yudaBounceY.value = withSequence(
            withTiming(-6, { duration: 110, easing: EASE_OUT }),
            withSpring(0, { duration: 280, dampingRatio: 0.72 })
        );
    };

    const handleDecrease = () => {
        if (durationMinutes > 15) {
            setDurationMinutes((prev) => Math.max(15, prev - 5));
            triggerChangeFeedback();
        }
    };

    const handleIncrease = () => {
        if (durationMinutes < 120) {
            setDurationMinutes((prev) => Math.min(120, prev + 5));
            triggerChangeFeedback();
        }
    };

    const handleStartJourney = () => {
        if (submitting.current) return;
        submitting.current = true;

        try {
            setIntervalMinutes(durationMinutes);
            router.push('/onboarding/select-apps' as any);
        } finally {
            submitting.current = false;
        }
    };

    const handleBtnPressIn = () => {
        btnScale.value = withTiming(0.96, { duration: 90, easing: EASE_OUT });
        btnY.value = withTiming(2.5, { duration: 90, easing: EASE_OUT });
    };

    const handleBtnPressOut = () => {
        btnScale.value = withSpring(1, { duration: 220, dampingRatio: 0.8 });
        btnY.value = withSpring(0, { duration: 220, dampingRatio: 0.8 });
    };

    if (!fontsLoaded) return null;

    const avatarSize = 104 * s;

    return (
        <View className="flex-1 bg-[#f5f3ec]">
            <StatusBar style="dark" />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: Math.max(insets.top, 24) + 16 * s,
                    paddingBottom: Math.max(insets.bottom, 20) + 96 * s,
                }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View className="items-center" style={avatarAnimatedStyle}>
                    <View
                        className="items-center justify-center bg-[#e2e7e1]"
                        style={{
                            width: avatarSize,
                            height: avatarSize,
                            borderRadius: avatarSize / 2,
                        }}
                    >
                        {user?.avatar ? (
                            <Image
                                source={{ uri: user.avatar }}
                                style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                            />
                        ) : (
                            <Text
                                className="text-[#2e6b4e]"
                                style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 52 * s }}
                            >
                                {initialLetter}
                            </Text>
                        )}
                    </View>

                    <View
                        className="rounded-full bg-[#e6eae5]"
                        style={{ paddingHorizontal: 22 * s, paddingVertical: 6 * s, marginTop: 12 * s }}
                    >
                        <Text
                            className="text-[#204d37]"
                            style={{ fontFamily: 'Outfit_700Bold', fontSize: 14 * s }}
                        >
                            Halo {displayName}
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View className="items-center mt-[18px]" style={titleAnimatedStyle}>
                    <Text
                        className="text-center text-[#1f2923]"
                        style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 26 * s, lineHeight: 34 * s }}
                    >
                        Yuk Kenalan! Kendalikan{'\n'}Kendali Waktu &{'\n'}Pikiranmu
                    </Text>
                    <Text
                        className="text-center text-[#415247] px-4"
                        style={{ fontFamily: 'Outfit_500Medium', fontSize: 13.5 * s, lineHeight: 20 * s, marginTop: 10 * s }}
                    >
                        Detoks layar santai tanpa rasa bersalah. Ciptakan ruang bernapas di setiap ketukan jari.
                    </Text>
                </Animated.View>

                <Animated.View
                    className="bg-[#e5ece5]"
                    style={[
                        { borderRadius: 18 * s, padding: 14 * s, marginTop: 22 * s },
                        progressCardAnimatedStyle,
                    ]}
                >
                    <View className="flex-row items-center justify-between">
                        <View
                            className="flex-row items-center bg-[#fbfbf9]"
                            style={{ paddingHorizontal: 10 * s, paddingVertical: 5 * s, borderRadius: 10 * s }}
                        >
                            <Ionicons name="flag" size={14 * s} color="#2e6b4e" style={{ marginRight: 6 * s }} />
                            <Text
                                className="text-[#204d37]"
                                style={{ fontFamily: 'Outfit_700Bold', fontSize: 12.5 * s }}
                            >
                                Langkah 3 dari 3: Jeda Menit
                            </Text>
                        </View>
                        <Text
                            className="text-[#2e6b4e]"
                            style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 16 * s }}
                        >
                            100%
                        </Text>
                    </View>

                    <View
                        className="overflow-hidden bg-[#d0dbd2]"
                        style={{ height: 10 * s, borderRadius: 5 * s, marginTop: 10 * s }}
                    >
                        <View
                            className="h-full w-full flex-row items-center justify-end bg-[#2e6b4e] pr-0.5"
                            style={{ borderRadius: 5 * s }}
                        >
                            <View
                                className="bg-[#d8ebe0]"
                                style={{ width: 7 * s, height: 7 * s, borderRadius: 3.5 * s }}
                            />
                        </View>
                    </View>
                </Animated.View>

                <Animated.View
                    className="bg-[#e5ece5]"
                    style={[
                        { borderRadius: 20 * s, padding: 12 * s, marginTop: 14 * s },
                        mainCardAnimatedStyle,
                    ]}
                >
                    <View
                        className="bg-[#fbfbf9]"
                        style={{ borderRadius: 16 * s, padding: 16 * s }}
                    >
                        <Text
                            className="text-[#1f2923]"
                            style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 16.5 * s }}
                        >
                            Jeda Setiap Scrolling
                        </Text>

                        <View
                            className="items-center justify-center bg-[#e2eae3]"
                            style={{ borderRadius: 14 * s, paddingVertical: 18 * s, marginTop: 12 * s }}
                        >
                            <View className="flex-row items-baseline">
                                <Animated.Text
                                    className="text-[#24593f]"
                                    style={[
                                        { fontFamily: 'Outfit_800ExtraBold', fontSize: 44 * s },
                                        numAnimatedStyle,
                                    ]}
                                >
                                    {durationMinutes}
                                </Animated.Text>
                                <Text
                                    className="text-[#1f2923]"
                                    style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 20 * s, marginLeft: 8 * s }}
                                >
                                    Menit / Sesi
                                </Text>
                            </View>

                            <Text
                                className="text-[#465b4e]"
                                style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12.5 * s, marginTop: 6 * s }}
                            >
                                {durationMinutes === 15 ? 'Waktu yang direkomendasikan' : 'Durasi jeda pilihanmu'}
                            </Text>
                        </View>

                        <View className="flex-row items-end justify-between px-2.5" style={{ marginTop: 18 * s }}>
                            <TouchableOpacity
                                className="items-center justify-center bg-[#f4c552] shadow-sm"
                                style={[
                                    { width: 56 * s, height: 52 * s, borderRadius: 14 * s, elevation: 2 },
                                    durationMinutes <= 15 && { opacity: 0.45 },
                                ]}
                                activeOpacity={0.82}
                                onPress={handleDecrease}
                                disabled={durationMinutes <= 15}
                            >
                                <View
                                    className="bg-[#262626]"
                                    style={{ width: 18 * s, height: 4.5 * s, borderRadius: 2.5 * s }}
                                />
                            </TouchableOpacity>

                            <Animated.View
                                className="items-center justify-end"
                                style={[{ width: 92 * s, height: 72 * s }, yudaAnimatedStyle]}
                            >
                                <Image
                                    source={yudaHeadSource}
                                    className="h-full w-full"
                                    resizeMode="contain"
                                />
                            </Animated.View>

                            <TouchableOpacity
                                className="items-center justify-center bg-[#2e6b4e] shadow-sm"
                                style={[
                                    { width: 56 * s, height: 52 * s, borderRadius: 14 * s, elevation: 2 },
                                    durationMinutes >= 120 && { opacity: 0.45 },
                                ]}
                                activeOpacity={0.82}
                                onPress={handleIncrease}
                                disabled={durationMinutes >= 120}
                            >
                                <Ionicons name="add" size={26 * s} color="#ffffff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            <View
                className="absolute bottom-0 left-0 right-0 items-center bg-[#f5f3ec]"
                style={{
                    paddingHorizontal: 20 * s,
                    paddingBottom: Math.max(insets.bottom, 20) + 10 * s,
                }}
            >
                <AnimatedPressable
                    className="w-full items-center justify-center bg-[#2e6b4e] border-b-[#204d37]"
                    style={[
                        {
                            height: 62 * s,
                            borderRadius: 16 * s,
                            borderBottomWidth: 5 * s,
                        },
                        btnAnimatedStyle,
                    ]}
                    onPressIn={handleBtnPressIn}
                    onPressOut={handleBtnPressOut}
                    onPress={handleStartJourney}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                >
                    <Text
                        className="text-white"
                        style={{ fontFamily: 'Outfit_700Bold', fontSize: 19 * s }}
                    >
                        Mulai Perjalanan Yuda
                    </Text>
                </AnimatedPressable>
            </View>
        </View>
    );
}
