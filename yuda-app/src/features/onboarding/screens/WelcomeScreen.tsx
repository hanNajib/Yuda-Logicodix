import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
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
    LinearGradient,
    Path,
    Polygon,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';

const BG = '#f5f3ec';
const REF_W = 420;
const yudaXdSource = require('../../../../assets/images/yuda/yuda_xD.png');
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

function StarFourPoint({ x, y, size = 24 }: { x: number; y: number; size?: number }) {
    const half = size / 2;
    const curve = size * 0.12;
    const d =
        `M ${x} ${y - half} ` +
        `Q ${x + curve} ${y - curve} ${x + half} ${y} ` +
        `Q ${x + curve} ${y + curve} ${x} ${y + half} ` +
        `Q ${x - curve} ${y + curve} ${x - half} ${y} ` +
        `Q ${x - curve} ${y - curve} ${x} ${y - half} Z`;
    return <Path d={d} fill="#f4c552" />;
}

export default function WelcomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: W, height: H } = useWindowDimensions();
    const reducedMotion = useReducedMotion();

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const s = Math.min(W / REF_W, 1.15);

    const charFade = useSharedValue(0);
    const charY = useSharedValue(24);
    const charScale = useSharedValue(0.92);

    const textFade = useSharedValue(0);
    const textY = useSharedValue(20);

    const tapOpacity = useSharedValue(0.4);
    const starOpacity = useSharedValue(0.8);

    useEffect(() => {
        if (!fontsLoaded) return;

        if (reducedMotion) {
            charFade.value = 1;
            charY.value = 0;
            charScale.value = 1;
            textFade.value = 1;
            textY.value = 0;
            tapOpacity.value = 0.9;
            return;
        }

        charFade.value = withTiming(1, { duration: 450 });
        charY.value = withTiming(0, { duration: 550, easing: EASE_OUT });
        charScale.value = withSpring(1, { duration: 600, dampingRatio: 0.75 });

        textFade.value = withDelay(180, withTiming(1, { duration: 450 }));
        textY.value = withDelay(180, withSpring(0, { duration: 550, dampingRatio: 0.8 }));

        const breathTimer = setTimeout(() => {
            charY.value = withRepeat(
                withSequence(
                    withTiming(-8, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
                    withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                true
            );
        }, 600);

        tapOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
                withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );

        starOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 700 }),
                withTiming(0.6, { duration: 700 })
            ),
            -1,
            true
        );

        return () => clearTimeout(breathTimer);
    }, [fontsLoaded, reducedMotion]);

    const charAnimatedStyle = useAnimatedStyle(() => ({
        opacity: charFade.value,
        transform: [
            { translateY: charY.value },
            { scale: charScale.value },
        ],
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        opacity: textFade.value,
        transform: [{ translateY: textY.value }],
    }));

    const tapAnimatedStyle = useAnimatedStyle(() => ({
        opacity: tapOpacity.value,
    }));

    const starAnimatedStyle = useAnimatedStyle(() => ({
        opacity: starOpacity.value,
    }));

    const handlePressScreen = () => {
        router.push('/onboarding/quiz-intro' as any);
    };

    if (!fontsLoaded) return null;

    const charW = Math.min(W * 0.68, 290 * s);
    const charH = charW * 1.22;
    const charTop = H * 0.13;

    const cx = W / 2;
    const rayOriginY = -H * 0.22;
    const rayLen = H * 0.98;
    const RAYS = [
        { deg: -16, half: 0.1 },
        { deg: 0, half: 0.12 },
        { deg: 16, half: 0.1 },
    ];
    const rays = RAYS.map(({ deg, half }) => {
        const a = (deg * Math.PI) / 180;
        const p = (ang: number) =>
            `${cx + Math.sin(ang) * rayLen},${rayOriginY + Math.cos(ang) * rayLen}`;
        return `${cx},${rayOriginY} ${p(a - half)} ${p(a + half)}`;
    });

    return (
        <Pressable className="flex-1 bg-[#f5f3ec]" onPress={handlePressScreen}>
            <StatusBar style="dark" />

            <Svg width={W} height={H} className="absolute inset-0" pointerEvents="none">
                <Defs>
                    <RadialGradient
                        id="topGlow"
                        cx={cx}
                        cy={H * 0.22}
                        rx={W * 0.85}
                        ry={H * 0.38}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0" stopColor="#b8ccbd" stopOpacity="0.9" />
                        <Stop offset="0.55" stopColor="#d1dfd4" stopOpacity="0.5" />
                        <Stop offset="1" stopColor={BG} stopOpacity="0" />
                    </RadialGradient>

                    <LinearGradient
                        id="rayGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2={H * 0.72}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
                        <Stop offset="0.5" stopColor="#ffffff" stopOpacity="0.4" />
                        <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                <Rect x={0} y={0} width={W} height={H} fill="url(#topGlow)" />

                {rays.map((pts, i) => (
                    <Polygon key={i} points={pts} fill="url(#rayGradient)" />
                ))}
            </Svg>

            <Animated.View className="absolute inset-0" style={starAnimatedStyle} pointerEvents="none">
                <Svg width={W} height={H} className="absolute inset-0">
                    <StarFourPoint x={W * 0.82} y={H * 0.16} size={34 * s} />
                    <StarFourPoint x={W * 0.08} y={H * 0.46} size={28 * s} />
                    <StarFourPoint x={W * 0.92} y={H * 0.57} size={26 * s} />
                </Svg>
            </Animated.View>

            <Animated.View
                className="absolute items-center justify-center"
                style={[
                    {
                        top: charTop,
                        left: (W - charW) / 2,
                        width: charW,
                        height: charH,
                    },
                    charAnimatedStyle,
                ]}
                pointerEvents="none"
            >
                <Image
                    source={yudaXdSource}
                    className="w-full h-full"
                    resizeMode="contain"
                />
            </Animated.View>

            <View
                className="absolute bottom-0 left-0 right-0 items-center"
                style={{
                    paddingHorizontal: 25 * s,
                    paddingBottom: Math.max(insets.bottom, 20) + 24 * s,
                }}
            >
                <Animated.View className="items-center px-4" style={textAnimatedStyle}>
                    <Text
                        className="text-center text-[#1f2923]"
                        style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 30 * s, lineHeight: 38 * s }}
                    >
                        Yeay! Selamat Datang{'\n'}di Yuda!
                    </Text>

                    <Text
                        className="text-center text-[#415247]"
                        style={{ fontFamily: 'Outfit_500Medium', fontSize: 14 * s, lineHeight: 21 * s, marginTop: 12 * s }}
                    >
                        Ayo mulai rubah habbit scroll kamu dengan{'\n'}bantuanku!
                    </Text>
                </Animated.View>

                <Animated.View
                    className="items-center py-3"
                    style={[{ marginTop: 28 * s }, tapAnimatedStyle]}
                >
                    <Text
                        className="text-center text-[#263b2f]"
                        style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 14 * s }}
                    >
                        Tap Untuk Lanjut
                    </Text>
                </Animated.View>
            </View>
        </Pressable>
    );
}
