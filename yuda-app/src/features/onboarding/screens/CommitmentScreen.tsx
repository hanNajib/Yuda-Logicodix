
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
    Defs,
    LinearGradient,
    Path,
    Polygon,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';
import { useAuthStore } from '@/stores/useAuthStore';

const BG = '#f5f3ec';
const REF_W = 420;

const yudaMakanSource = require('../../../../assets/images/yuda/yuda-makan.png');

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

function StarFourPoint({
    x,
    y,
    size = 24,
}: {
    x: number;
    y: number;
    size?: number;
}) {
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

export default function CommitmentScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { width: W, height: H } = useWindowDimensions();
    const reducedMotion = useReducedMotion();

    const { completeOnboarding } = useAuthStore();
    const completing = useRef(false);

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const s = Math.min(W / REF_W, 1.15);

    const charFade = useSharedValue(0);
    const charY = useSharedValue(20);
    const charScale = useSharedValue(0.94);

    const textFade = useSharedValue(0);
    const textY = useSharedValue(16);

    const btnFade = useSharedValue(0);
    const btnY = useSharedValue(0);
    const btnScale = useSharedValue(1);

    const starOpacity = useSharedValue(0.8);

    useEffect(() => {
        if (!fontsLoaded) return;

        if (reducedMotion) {
            charFade.value = 1;
            charY.value = 0;
            charScale.value = 1;

            textFade.value = 1;
            textY.value = 0;

            btnFade.value = 1;

            starOpacity.value = 0.8;

            return;
        }

        charFade.value = withTiming(1, {
            duration: 380,
            easing: EASE_OUT,
        });

        charY.value = withTiming(0, {
            duration: 450,
            easing: EASE_OUT,
        });

        charScale.value = withSpring(1, {
            duration: 480,
            dampingRatio: 0.8,
        });

        textFade.value = withDelay(
            120,
            withTiming(1, {
                duration: 360,
                easing: EASE_OUT,
            })
        );

        textY.value = withDelay(
            120,
            withSpring(0, {
                duration: 460,
                dampingRatio: 0.8,
            })
        );

        btnFade.value = withDelay(
            220,
            withTiming(1, {
                duration: 360,
                easing: EASE_OUT,
            })
        );

        const breathTimer = setTimeout(() => {
            charY.value = withRepeat(
                withSequence(
                    withTiming(-5, {
                        duration: 1300,
                        easing: Easing.inOut(Easing.quad),
                    }),
                    withTiming(0, {
                        duration: 1300,
                        easing: Easing.inOut(Easing.quad),
                    })
                ),
                -1,
                true
            );
        }, 500);

        starOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800 }),
                withTiming(0.5, { duration: 800 })
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
        transform: [
            { translateY: textY.value },
        ],
    }));

    const btnAnimatedStyle = useAnimatedStyle(() => ({
        opacity: btnFade.value,
        transform: [
            { translateY: btnY.value },
            { scale: btnScale.value },
        ],
    }));

    const starAnimatedStyle = useAnimatedStyle(() => ({
        opacity: starOpacity.value,
    }));

    const handleBtnPressIn = () => {
        if (reducedMotion) return;

        btnScale.value = withTiming(0.96, {
            duration: 90,
            easing: EASE_OUT,
        });

        btnY.value = withTiming(2.5, {
            duration: 90,
            easing: EASE_OUT,
        });
    };

    const handleBtnPressOut = () => {
        if (reducedMotion) return;

        btnScale.value = withSpring(1, {
            duration: 220,
            dampingRatio: 0.8,
        });

        btnY.value = withSpring(0, {
            duration: 220,
            dampingRatio: 0.8,
        });
    };

    const handleStartCommitment = async () => {
        if (completing.current) return;

        completing.current = true;

        try {
            await completeOnboarding();
            router.replace('/');
        } catch (error) {
            console.error('Gagal menyelesaikan onboarding:', error);
            completing.current = false;
        }
    };

    if (!fontsLoaded) return null;

    const charW = Math.min(W * 1.15, 300 * s);
    const charH = charW * 1.15;

    const cx = W / 2;
    const rayOriginY = -H * 0.15;
    const rayLen = H * 0.85;

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
        <View className="flex-1 bg-[#f5f3ec]">
            <StatusBar style="dark" />

            <Svg
                width={W}
                height={H}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
                pointerEvents="none"
            >
                <Defs>
                    <RadialGradient
                        id="stageGlow"
                        cx={cx}
                        cy={H * 0.38}
                        rx={W * 0.65}
                        ry={H * 0.28}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop
                            offset="0"
                            stopColor="#b6cbb9"
                            stopOpacity="0.8"
                        />

                        <Stop
                            offset="0.6"
                            stopColor="#cbd9cd"
                            stopOpacity="0.4"
                        />

                        <Stop
                            offset="1"
                            stopColor={BG}
                            stopOpacity="0"
                        />
                    </RadialGradient>

                    <LinearGradient
                        id="sunray"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <Stop
                            offset="0"
                            stopColor="#ffffff"
                            stopOpacity="0.75"
                        />

                        <Stop
                            offset="0.5"
                            stopColor="#ffffff"
                            stopOpacity="0.32"
                        />

                        <Stop
                            offset="1"
                            stopColor="#ffffff"
                            stopOpacity="0"
                        />
                    </LinearGradient>
                </Defs>

                <Rect
                    x={0}
                    y={0}
                    width={W}
                    height={H}
                    fill="url(#stageGlow)"
                />

                {rays.map((pts, i) => (
                    <Polygon
                        key={i}
                        points={pts}
                        fill="url(#sunray)"
                    />
                ))}
            </Svg>

            <Animated.View
                pointerEvents="none"
                style={[
                    {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    },
                    starAnimatedStyle,
                ]}
            >
                <Svg width={W} height={H}>
                    <StarFourPoint
                        x={W * 0.11}
                        y={H * 0.46}
                        size={28 * s}
                    />

                    <StarFourPoint
                        x={W * 0.79}
                        y={H * 0.15}
                        size={38 * s}
                    />

                    <StarFourPoint
                        x={W * 0.90}
                        y={H * 0.57}
                        size={30 * s}
                    />
                </Svg>
            </Animated.View>

            <View
                className="flex-1 justify-between"
                style={{
                    paddingTop: Math.max(insets.top, 24) + 24 * s,
                    paddingBottom: Math.max(insets.bottom, 20) + 12 * s,
                    paddingHorizontal: 22 * s,
                }}
            >
                <View className="flex-1 items-center justify-center">
                    <Animated.View
                        className="items-center justify-center"
                        style={[
                            {
                                width: charW,
                                height: charH,
                            },
                            charAnimatedStyle,
                        ]}
                    >
                        <Image
                            source={yudaMakanSource}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    </Animated.View>
                </View>

                <View className="w-full">
                    <Animated.View
                        className="items-center w-full px-2 mb-6"
                        style={textAnimatedStyle}
                    >
                        <Text
                            className="font-outfit-extrabold text-[#1f2923] text-center"
                            style={{
                                fontFamily: 'Outfit_800ExtraBold',
                                fontSize: 24 * s,
                                lineHeight: 32 * s,
                            }}
                        >
                            Kamu Punya Kendali{'\n'}
                            untuk Memilih
                        </Text>

                        <Text
                            className="font-outfit-medium text-[#4b584f] text-center mt-2.5 px-3"
                            style={{
                                fontFamily: 'Outfit_500Medium',
                                fontSize: 13 * s,
                                lineHeight: 18.5 * s,
                            }}
                        >
                            Mulailah dengan satu jeda kecil, satu{'\n'}
                            keputusan sadar, dan satu kebiasaan baru.
                        </Text>
                    </Animated.View>

                    <Animated.View
                        className="w-full"
                        style={btnAnimatedStyle}
                    >
                        <Pressable
                            className="w-full items-center justify-center bg-[#2e6b4e] border-b-[#204d37]"
                            style={{
                                height: 60 * s,
                                borderRadius: 16 * s,
                                borderBottomWidth: 5 * s,
                            }}
                            onPressIn={handleBtnPressIn}
                            onPressOut={handleBtnPressOut}
                            onPress={handleStartCommitment}
                            accessibilityRole="button"
                        >
                            <Text
                                className="font-outfit-bold text-white"
                                style={{
                                    fontFamily: 'Outfit_700Bold',
                                    fontSize: 18 * s,
                                }}
                            >
                                Mulai Perubahan
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
}
