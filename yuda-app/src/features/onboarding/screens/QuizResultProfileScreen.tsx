import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
    Circle,
    Defs,
    Path,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuizResultStore } from '../stores/useQuizResultStore';

const yudaMakanSource = require('../../../../assets/images/yuda/yuda-makan.png');
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

function StarFourPoint({ x, y, size = 26 }: { x: number; y: number; size?: number }) {
    const half = size / 2;
    const curve = size * 0.14;
    const d =
        `M ${x} ${y - half} ` +
        `Q ${x + curve} ${y - curve} ${x + half} ${y} ` +
        `Q ${x + curve} ${y + curve} ${x} ${y + half} ` +
        `Q ${x - curve} ${y + curve} ${x - half} ${y} ` +
        `Q ${x - curve} ${y - curve} ${x} ${y - half} Z`;
    return <Path d={d} fill="#f5c642" />;
}

export default function QuizResultProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: W, height: H } = useWindowDimensions();
    const s = Math.min(W / 400, 1.15);
    const reducedMotion = useReducedMotion();

    const { completeOnboarding } = useAuthStore();
    const { analysisResult } = useQuizResultStore();

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const tipeData = useMemo(() => {
        const raw = analysisResult?.layar_3_tipe_doomscrolling;
        return {
            namaTipe: raw?.nama_tipe || 'Emotional Escaper',
            deskripsi:
                raw?.deskripsi_kecenderungan ||
                'Kamu cenderung membuka media sosial ketika merasa bosan atau lelah. Scrolling menjadi cara untuk mengalihkan perhatian sejenak dari perasaan tersebut.',
            afirmasi:
                raw?.afirmasi_jeda ||
                'Coba alihkan fokusmu ke aktivitas yang kamu sukai, meski hanya sebentar.',
        };
    }, [analysisResult]);

    const titleFade = useSharedValue(0);
    const titleY = useSharedValue(15);

    const charFade = useSharedValue(0);
    const charY = useSharedValue(18);

    const cardFade = useSharedValue(0);
    const cardY = useSharedValue(20);
    const cardScale = useSharedValue(0.96);

    const starOpacity = useSharedValue(0.7);
    const tapOpacity = useSharedValue(0.4);

    useEffect(() => {
        if (!fontsLoaded) return;

        if (reducedMotion) {
            titleFade.set(1);
            titleY.set(0);
            charFade.set(1);
            charY.set(0);
            cardFade.set(1);
            cardY.set(0);
            cardScale.set(1);
            tapOpacity.set(0.9);
            return;
        }

        titleFade.set(withTiming(1, { duration: 320, easing: EASE_OUT }));
        titleY.set(withSpring(0, { duration: 400, dampingRatio: 0.8 }));

        charFade.set(withDelay(90, withTiming(1, { duration: 340, easing: EASE_OUT })));
        charY.set(withDelay(90, withSpring(0, { duration: 420, dampingRatio: 0.8 })));

        cardFade.set(withDelay(180, withTiming(1, { duration: 340, easing: EASE_OUT })));
        cardY.set(withDelay(180, withSpring(0, { duration: 440, dampingRatio: 0.8 })));
        cardScale.set(withDelay(180, withSpring(1, { duration: 440, dampingRatio: 0.8 })));

        starOpacity.set(
            withDelay(
                300,
                withRepeat(
                    withSequence(
                        withTiming(1, { duration: 1100 }),
                        withTiming(0.45, { duration: 1100 })
                    ),
                    -1,
                    true
                )
            )
        );

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

    const animatedTitleStyle = useAnimatedStyle(() => ({
        opacity: titleFade.get(),
        transform: [{ translateY: titleY.get() }],
    }));

    const animatedCharStyle = useAnimatedStyle(() => ({
        opacity: charFade.get(),
        transform: [{ translateY: charY.get() }],
    }));

    const animatedCardStyle = useAnimatedStyle(() => ({
        opacity: cardFade.get(),
        transform: [{ translateY: cardY.get() }, { scale: cardScale.get() }],
    }));

    const animatedTapStyle = useAnimatedStyle(() => ({
        opacity: tapOpacity.get(),
    }));

    const handleFinish = async () => {
        await completeOnboarding();
        router.replace('/');
    };

    if (!fontsLoaded) return null;

    const charW = Math.min(W * 0.52, 210 * s);
    const charH = charW * 1.12;

    const cx = W / 2;
    const orbitCenterY = H * 0.55;
    const rings = [W * 0.52, W * 0.8, W * 1.08];

    return (
        <Pressable onPress={handleFinish} className="flex-1 bg-[#f5f1ea]">
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
                        cx={cx}
                        cy={H * 0.08}
                        rx={W * 0.85}
                        ry={H * 0.35}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0" stopColor="#fed7d7" stopOpacity="0.45" />
                        <Stop offset="0.65" stopColor="#faece8" stopOpacity="0.2" />
                        <Stop offset="1" stopColor="#f5f1ea" stopOpacity="0" />
                    </RadialGradient>

                    <RadialGradient
                        id="bottomSageGlow"
                        cx={cx}
                        cy={H * 0.76}
                        rx={W * 0.9}
                        ry={H * 0.42}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0" stopColor="#b6cbb9" stopOpacity="0.8" />
                        <Stop offset="0.65" stopColor="#d2dfd4" stopOpacity="0.45" />
                        <Stop offset="1" stopColor="#f5f1ea" stopOpacity="0" />
                    </RadialGradient>
                </Defs>

                <Rect x={0} y={0} width={W} height={H} fill="url(#topWarmGlow)" />
                <Rect x={0} y={0} width={W} height={H} fill="url(#bottomSageGlow)" />

                {rings.map((r, i) => (
                    <Circle
                        key={i}
                        cx={cx}
                        cy={orbitCenterY}
                        r={r}
                        stroke="#b8cbba"
                        strokeWidth={1.2 * s}
                        strokeDasharray={`${7 * s} ${7 * s}`}
                        fill="none"
                        opacity={0.65}
                    />
                ))}

                <StarFourPoint x={W * 0.18} y={H * 0.31} size={28 * s} />
                <StarFourPoint x={W * 0.86} y={H * 0.46} size={26 * s} />
            </Svg>

            <View
                className="flex-1 justify-between"
                style={{
                    paddingTop: Math.max(insets.top, 20) + 24 * s,
                    paddingBottom: Math.max(insets.bottom, 20) + 12 * s,
                    paddingHorizontal: 22 * s,
                }}
            >
                <Animated.View style={animatedTitleStyle} className="items-center px-3">
                    <Text
                        className="text-[#1f2923] text-center font-outfit-extrabold"
                        style={{
                            fontFamily: 'Outfit_800ExtraBold',
                            fontSize: 27 * s,
                            lineHeight: 35 * s,
                        }}
                    >
                        Yuk Kenali Juga Pola{'\n'}Doomscrolling Kamu
                    </Text>

                    <Text
                        className="text-[#4b5b4f] text-center font-outfit-semibold mt-2.5"
                        style={{
                            fontFamily: 'Outfit_600SemiBold',
                            fontSize: 13.5 * s,
                            lineHeight: 19 * s,
                        }}
                    >
                        Berdasarkan hasil kuisioner,{'\n'}kamu cenderung sebagai
                    </Text>
                </Animated.View>

                <View className="w-full items-center relative mt-2">
                    <Animated.View
                        style={[{ width: charW, height: charH, marginBottom: -18 * s, zIndex: 10 }, animatedCharStyle]}
                        className="items-center justify-center"
                    >
                        <Image
                            source={yudaMakanSource}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    <Animated.View
                        style={animatedCardStyle}
                        className="w-full bg-[#dbe4dd]/90"
                        style={{
                            borderRadius: 24 * s,
                            padding: 10 * s,
                            borderWidth: 1,
                            borderColor: '#cdd9cf',
                            zIndex: 1,
                        }}
                    >
                        <View
                            className="w-full bg-[#f8faf7] items-center"
                            style={{
                                borderRadius: 18 * s,
                                paddingHorizontal: 16 * s,
                                paddingTop: 18 * s,
                                paddingBottom: 16 * s,
                            }}
                        >
                            <View
                                className="w-full bg-[#e2ede4] items-center justify-center py-2.5 px-4 mb-4"
                                style={{
                                    borderRadius: 12 * s,
                                }}
                            >
                                <Text
                                    className="text-[#2e6b4e] font-outfit-bold text-center"
                                    style={{
                                        fontFamily: 'Outfit_700Bold',
                                        fontSize: 20 * s,
                                    }}
                                >
                                    {tipeData.namaTipe}
                                </Text>
                            </View>

                            <Text
                                className="text-[#3a493e] font-outfit-medium text-center mb-4 px-1"
                                style={{
                                    fontFamily: 'Outfit_500Medium',
                                    fontSize: 12.5 * s,
                                    lineHeight: 18 * s,
                                }}
                            >
                                {tipeData.deskripsi}
                            </Text>

                            <View
                                className="w-full bg-[#f3edd1] flex-row items-center p-3"
                                style={{
                                    borderRadius: 14 * s,
                                }}
                            >
                                <View
                                    className="items-center justify-center bg-[#f5b838] rounded-xl mr-3"
                                    style={{
                                        width: 38 * s,
                                        height: 38 * s,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="lightbulb-outline"
                                        size={22 * s}
                                        color="#ffffff"
                                    />
                                </View>

                                <View className="flex-1 pr-1">
                                    <Text
                                        className="text-[#222a24] font-outfit-bold"
                                        style={{
                                            fontFamily: 'Outfit_700Bold',
                                            fontSize: 12 * s,
                                            lineHeight: 16 * s,
                                        }}
                                    >
                                        Apa yang bisa membantumu?
                                    </Text>
                                    <Text
                                        className="text-[#4b554e] font-outfit-medium mt-0.5"
                                        style={{
                                            fontFamily: 'Outfit_500Medium',
                                            fontSize: 10.5 * s,
                                            lineHeight: 15 * s,
                                        }}
                                    >
                                        {tipeData.afirmasi}
                                    </Text>
                                </View>
                            </View>
                        </View>
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
