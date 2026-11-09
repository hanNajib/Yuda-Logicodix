import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import {
    Image,
    Pressable,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
    Defs,
    Path,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';
import { useQuizResultStore } from '../stores/useQuizResultStore';

const yudaTandaSeruSource = require('../../../../assets/images/yuda/yuda-tandaseru.png');
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

function WarningTriangleIcon({ size = 78 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <Path
                d="M50 12 L90 82 A6 6 0 0 1 84.8 90 L15.2 90 A6 6 0 0 1 10 82 L50 12 Z"
                fill="#ff4d4f"
            />
            <Rect x="46.5" y="38" width="7" height="26" rx="3.5" fill="#ffffff" />
            <Path
                d="M50 75.5 A4.5 4.5 0 1 0 50 75.51 Z"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
            />
        </Svg>
    );
}

function formatHeadline(rawHeadline: string) {
    const timeMatch = rawHeadline.match(/(\d+(?:[–\-]\d+)?\s*(?:Jam|Menit))/i);
    if (!timeMatch || timeMatch.index === undefined) {
        return { before: rawHeadline, highlight: '', after: '' };
    }
    const idx = timeMatch.index;
    const highlight = timeMatch[0];
    const before = rawHeadline.slice(0, idx);
    const after = rawHeadline.slice(idx + highlight.length);
    return { before, highlight, after };
}

export default function QuizResultInsightScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: W, height: H } = useWindowDimensions();
    const s = Math.min(W / 400, 1.15);
    const reducedMotion = useReducedMotion();

    const { analysisResult } = useQuizResultStore();

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const headlineData = useMemo(() => {
        const text =
            analysisResult?.layar_1_insight_waktu?.headline ||
            'Kamu Menghabiskan 10 Jam Dalam Sehari?';
        return formatHeadline(text);
    }, [analysisResult]);

    const subteks =
        analysisResult?.layar_1_insight_waktu?.subteks ||
        'Wow itu waktu yang banyak untuk dihabiskan dengan scrolling';

    const iconFade = useSharedValue(0);
    const iconY = useSharedValue(16);
    const iconScale = useSharedValue(0.92);

    const titleFade = useSharedValue(0);
    const titleY = useSharedValue(14);

    const charFade = useSharedValue(0);
    const charY = useSharedValue(20);
    const charScale = useSharedValue(0.95);

    const tapOpacity = useSharedValue(0.4);

    useEffect(() => {
        if (!fontsLoaded) return;

        if (reducedMotion) {
            iconFade.set(1);
            iconY.set(0);
            iconScale.set(1);
            titleFade.set(1);
            titleY.set(0);
            charFade.set(1);
            charY.set(0);
            charScale.set(1);
            tapOpacity.set(0.9);
            return;
        }

        iconFade.set(withTiming(1, { duration: 320, easing: EASE_OUT }));
        iconY.set(withSpring(0, { duration: 380, dampingRatio: 0.8 }));
        iconScale.set(withSpring(1, { duration: 380, dampingRatio: 0.8 }));

        titleFade.set(withDelay(80, withTiming(1, { duration: 320, easing: EASE_OUT })));
        titleY.set(withDelay(80, withSpring(0, { duration: 400, dampingRatio: 0.8 })));

        charFade.set(withDelay(180, withTiming(1, { duration: 340, easing: EASE_OUT })));
        charY.set(withDelay(180, withSpring(0, { duration: 420, dampingRatio: 0.8 })));
        charScale.set(withDelay(180, withSpring(1, { duration: 420, dampingRatio: 0.8 })));

        tapOpacity.set(
            withDelay(
                350,
                withRepeat(
                    withSequence(
                        withTiming(0.95, { duration: 750 }),
                        withTiming(0.35, { duration: 750 })
                    ),
                    -1,
                    true
                )
            )
        );
    }, [fontsLoaded, reducedMotion]);

    const animatedIconStyle = useAnimatedStyle(() => ({
        opacity: iconFade.get(),
        transform: [{ translateY: iconY.get() }, { scale: iconScale.get() }],
    }));

    const animatedTitleStyle = useAnimatedStyle(() => ({
        opacity: titleFade.get(),
        transform: [{ translateY: titleY.get() }],
    }));

    const animatedCharStyle = useAnimatedStyle(() => ({
        opacity: charFade.get(),
        transform: [{ translateY: charY.get() }, { scale: charScale.get() }],
    }));

    const animatedTapStyle = useAnimatedStyle(() => ({
        opacity: tapOpacity.get(),
    }));

    const handleNext = () => {
        router.push('/onboarding/quiz-result-activities');
    };

    if (!fontsLoaded) return null;

    const charW = Math.min(W * 0.76, 320 * s);
    const charH = charW * 1.08;

    return (
        <Pressable onPress={handleNext} className="flex-1 bg-[#f5f1ea]">
            <StatusBar style="dark" />

            <Svg
                width={W}
                height={H}
                style={{ position: 'absolute', top: 0, left: 0 }}
                pointerEvents="none"
            >
                <Defs>
                    <RadialGradient
                        id="topWarmGlow"
                        cx={W / 2}
                        cy={H * 0.12}
                        rx={W * 0.85}
                        ry={H * 0.35}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0" stopColor="#ffb8b8" stopOpacity="0.8" />
                        <Stop offset="0.6" stopColor="#fed7d7" stopOpacity="0.4" />
                        <Stop offset="1" stopColor="#f5f1ea" stopOpacity="0" />
                    </RadialGradient>
                    <RadialGradient
                        id="bottomSageGlow"
                        cx={W / 2}
                        cy={H * 0.72}
                        rx={W * 0.85}
                        ry={H * 0.35}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0" stopColor="#c5d8c8" stopOpacity="0.7" />
                        <Stop offset="0.7" stopColor="#dee8e0" stopOpacity="0.35" />
                        <Stop offset="1" stopColor="#f5f1ea" stopOpacity="0" />
                    </RadialGradient>
                </Defs>

                <Rect x={0} y={0} width={W} height={H} fill="url(#topWarmGlow)" />
                <Rect x={0} y={0} width={W} height={H} fill="url(#bottomSageGlow)" />
            </Svg>

            <View
                className="flex-1 justify-between items-center"
                style={{
                    paddingTop: Math.max(insets.top, 20) + 24 * s,
                    paddingBottom: Math.max(insets.bottom, 20) + 12 * s,
                    paddingHorizontal: 26 * s,
                }}
            >
                <View className="items-center w-full">
                    <Animated.View style={animatedIconStyle} className="mb-4">
                        <WarningTriangleIcon size={78 * s} />
                    </Animated.View>

                    <Animated.View style={animatedTitleStyle} className="items-center w-full">
                        <Text
                            className="text-[#1f2923] text-center font-outfit-extrabold"
                            style={{
                                fontFamily: 'Outfit_800ExtraBold',
                                fontSize: 30 * s,
                                lineHeight: 38 * s,
                            }}
                        >
                            {headlineData.before}
                            {headlineData.highlight ? (
                                <Text
                                    className="text-[#e02424]"
                                    style={{
                                        fontFamily: 'Outfit_800ExtraBold',
                                        color: '#e02424',
                                    }}
                                >
                                    {headlineData.highlight}
                                </Text>
                            ) : null}
                            {headlineData.after}
                        </Text>

                        <Text
                            className="text-[#204d37] text-center font-outfit-medium underline mt-3 px-2"
                            style={{
                                fontFamily: 'Outfit_500Medium',
                                fontSize: 13.5 * s,
                                lineHeight: 20 * s,
                            }}
                        >
                            {subteks}
                        </Text>
                    </Animated.View>
                </View>

                <View className="flex-1 items-center justify-center w-full">
                    <Animated.View
                        style={[{ width: charW, height: charH }, animatedCharStyle]}
                        className="items-center justify-center"
                    >
                        <Image
                            source={yudaTandaSeruSource}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="contain"
                        />
                    </Animated.View>
                </View>

                <Animated.View style={animatedTapStyle} className="items-center pb-2">
                    <Text
                        className="text-[#55695a] font-outfit-semibold tracking-wide"
                        style={{
                            fontFamily: 'Outfit_600SemiBold',
                            fontSize: 13.5 * s,
                        }}
                    >
                        Tap Untuk Lanjut
                    </Text>
                </Animated.View>
            </View>
        </Pressable>
    );
}
