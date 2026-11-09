import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
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
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';
import { useAuthStore } from '@/stores/useAuthStore';

const BG = '#f5f3ec';
const REF_W = 420;

const yudaQuestioningSource = require('../../../../assets/images/yuda/yuda-questioning.png');

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export default function QuizIntroScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: W, height: H } = useWindowDimensions();
    const reducedMotion = useReducedMotion();

    const { completeOnboarding } = useAuthStore();
    const submitting = useRef(false);

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const s = Math.min(W / REF_W, 1.15);

    const titleFade = useSharedValue(0);
    const titleY = useSharedValue(20);

    const charFade = useSharedValue(0);
    const charY = useSharedValue(30);
    const charRotate = useSharedValue(0);

    const btnScale = useSharedValue(1);
    const btnY = useSharedValue(0);
    const btnFade = useSharedValue(0);

    useEffect(() => {
        if (!fontsLoaded) return;

        if (reducedMotion) {
            titleFade.value = 1;
            titleY.value = 0;
            charFade.value = 1;
            charY.value = 0;
            btnFade.value = 1;
            return;
        }

        titleFade.value = withTiming(1, { duration: 420 });
        titleY.value = withSpring(0, { duration: 500, dampingRatio: 0.8 });

        charFade.value = withDelay(140, withTiming(1, { duration: 450 }));
        charY.value = withDelay(140, withSpring(0, { duration: 550, dampingRatio: 0.78 }));

        const rotateTimer = setTimeout(() => {
            charRotate.value = withRepeat(
                withSequence(
                    withTiming(-3, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
                    withTiming(3, { duration: 1400, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                true
            );
        }, 600);

        btnFade.value = withDelay(240, withTiming(1, { duration: 400 }));

        return () => clearTimeout(rotateTimer);
    }, [fontsLoaded, reducedMotion]);

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: titleFade.value,
        transform: [{ translateY: titleY.value }],
    }));

    const charAnimatedStyle = useAnimatedStyle(() => ({
        opacity: charFade.value,
        transform: [
            { translateY: charY.value },
            { rotate: `${charRotate.value}deg` },
        ],
    }));

    const btnAnimatedStyle = useAnimatedStyle(() => ({
        opacity: btnFade.value,
        transform: [
            { translateY: btnY.value },
            { scale: btnScale.value },
        ],
    }));

    const handleBtnPressIn = () => {
        btnScale.value = withTiming(0.96, { duration: 90, easing: EASE_OUT });
        btnY.value = withTiming(2.5, { duration: 90, easing: EASE_OUT });
    };

    const handleBtnPressOut = () => {
        btnScale.value = withSpring(1, { duration: 220, dampingRatio: 0.8 });
        btnY.value = withSpring(0, { duration: 220, dampingRatio: 0.8 });
    };

    const handleStartQuiz = async () => {
        if (submitting.current) return;
        submitting.current = true;

        try {
            await completeOnboarding();
            router.replace('/');
        } catch {
            submitting.current = false;
        }
    };

    if (!fontsLoaded) return null;

    const charW = Math.min(W * 0.76, 330 * s);
    const charH = charW * 1.08;

    const cx = W / 2;
    const orbitCenterY = H * 0.58;
    const rings = [W * 0.48, W * 0.72, W * 0.98];

    return (
        <View className="flex-1 bg-[#f5f3ec]">
            <StatusBar style="dark" />

            <Svg
                width={W}
                height={H}
                style={{ position: 'absolute', top: 0, left: 0 }}
                pointerEvents="none"
            >
                <Defs>
                    <RadialGradient
                        id="bottomSageGlow"
                        cx={cx}
                        cy={H * 0.68}
                        rx={W * 0.85}
                        ry={H * 0.42}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0" stopColor="#b6cbb9" stopOpacity="0.85" />
                        <Stop offset="0.65" stopColor="#d2dfd4" stopOpacity="0.45" />
                        <Stop offset="1" stopColor={BG} stopOpacity="0" />
                    </RadialGradient>
                </Defs>

                <Rect x={0} y={0} width={W} height={H} fill="url(#bottomSageGlow)" />

                {rings.map((r, i) => (
                    <Circle
                        key={i}
                        cx={cx}
                        cy={orbitCenterY}
                        r={r}
                        stroke="#abbfab"
                        strokeWidth={1.3 * s}
                        strokeDasharray={`${7 * s} ${7 * s}`}
                        fill="none"
                    />
                ))}
            </Svg>

            <View
                className="flex-1 justify-between"
                style={{
                    paddingTop: Math.max(insets.top, 24) + 24 * s,
                    paddingBottom: Math.max(insets.bottom, 20) + 12 * s,
                    paddingHorizontal: 22 * s,
                }}
            >
                <Animated.View className="items-center" style={titleAnimatedStyle}>
                    <Text
                        className="font-outfit-extrabold text-[#1f2923] text-center"
                        style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 27 * s, lineHeight: 36 * s }}
                    >
                        Tapi Sebelum Mulai,{'\n'}Yuk Bantu Yuda Buat{'\n'}Lebih Mengenali{'\n'}Kamu
                    </Text>

                    <Text
                        className="font-outfit-medium text-[#3d4f42] text-center px-3"
                        style={{ fontFamily: 'Outfit_500Medium', fontSize: 13.5 * s, lineHeight: 20 * s, marginTop: 12 * s }}
                    >
                        Jawab kuis yang dikasih Yuda sesuai dengan{'\n'}personal kamu ya!
                    </Text>
                </Animated.View>

                <View className="flex-1 items-center justify-center">
                    <Animated.View
                        className="items-center justify-center"
                        style={[{ width: charW, height: charH }, charAnimatedStyle]}
                    >
                        <Image
                            source={yudaQuestioningSource}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    </Animated.View>
                </View>

                <View className="w-full">
                    <Animated.View className="w-full" style={btnAnimatedStyle}>
                        <Pressable
                            className="w-full items-center justify-center bg-[#2e6b4e] border-b-[#204d37]"
                            style={{
                                height: 62 * s,
                                borderRadius: 16 * s,
                                borderBottomWidth: 5 * s,
                            }}
                            onPressIn={handleBtnPressIn}
                            onPressOut={handleBtnPressOut}
                            onPress={handleStartQuiz}
                            accessibilityRole="button"
                        >
                            <Text
                                className="font-outfit-bold text-white"
                                style={{ fontFamily: 'Outfit_700Bold', fontSize: 19 * s }}
                            >
                                Yuk Mulai
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
}
