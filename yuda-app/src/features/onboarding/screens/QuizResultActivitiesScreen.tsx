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
    Circle,
    Defs,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';
import { useQuizResultStore } from '../stores/useQuizResultStore';

const yudaBukuSource = require('../../../../assets/images/yuda/yuda-buku.png');
const yudaNyanyiSource = require('../../../../assets/images/yuda/yuda-nyanyi.png');
const yudaFisikSource = require('../../../../assets/images/yuda/yuda-fisik.png');

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

const DEFAULT_ACTIVITIES = [
    {
        judul: 'Membaca Buku',
        deskripsi:
            'Dengan kecepatan baca sekitar 50–100 halaman per jam, kamu bisa menyelesaikan beberapa buku.',
    },
    {
        judul: 'Eksplorasi Hobi',
        deskripsi:
            '10 jam cukup untuk mencoba dasar-dasar menyanyi, bermain musik, memasak, atau fotografi.',
    },
    {
        judul: 'Aktivitas Fisik',
        deskripsi:
            'Dengan kecepatan berjalan sekitar 3–5 km/jam, secara matematis kamu bisa menempuh jarak 30-50 Km.',
    },
];

const ACTIVITY_IMAGES = [yudaBukuSource, yudaNyanyiSource, yudaFisikSource];

interface ActivityCardProps {
    index: number;
    title: string;
    description: string;
    imageSource: any;
    scale: number;
    reducedMotion: boolean | null;
}

function ActivityCard({
    index,
    title,
    description,
    imageSource,
    scale: s,
    reducedMotion,
}: ActivityCardProps) {
    const cardFade = useSharedValue(0);
    const cardY = useSharedValue(14);
    const cardScale = useSharedValue(0.96);

    useEffect(() => {
        if (reducedMotion) {
            cardFade.set(1);
            cardY.set(0);
            cardScale.set(1);
            return;
        }

        const delay = 140 + index * 70;
        cardFade.set(withDelay(delay, withTiming(1, { duration: 280, easing: EASE_OUT })));
        cardY.set(withDelay(delay, withSpring(0, { duration: 380, dampingRatio: 0.82 })));
        cardScale.set(withDelay(delay, withSpring(1, { duration: 380, dampingRatio: 0.82 })));
    }, [index, reducedMotion]);

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        opacity: cardFade.get(),
        transform: [{ translateY: cardY.get() }, { scale: cardScale.get() }],
    }));

    return (
        <Animated.View
            style={cardAnimatedStyle}
            className="w-full bg-[#f8faf7] flex-row items-center overflow-hidden"
            style={{
                borderRadius: 20 * s,
                paddingVertical: 14 * s,
                paddingHorizontal: 14 * s,
                borderWidth: 1,
                borderColor: '#e2ece4',
            }}
        >
            <View
                className="items-center justify-center mr-3.5"
                style={{
                    width: 82 * s,
                    height: 82 * s,
                }}
            >
                <Image
                    source={imageSource}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    resizeMode="contain"
                />
            </View>

            <View className="flex-1 justify-center pr-1">
                <Text
                    className="text-[#1f2923] font-outfit-bold"
                    style={{
                        fontFamily: 'Outfit_700Bold',
                        fontSize: 15.5 * s,
                        lineHeight: 20 * s,
                    }}
                >
                    {title}
                </Text>

                <Text
                    className="text-[#4b5b4f] font-outfit-medium mt-1"
                    style={{
                        fontFamily: 'Outfit_500Medium',
                        fontSize: 11.5 * s,
                        lineHeight: 16.5 * s,
                    }}
                >
                    {description}
                </Text>
            </View>
        </Animated.View>
    );
}

export default function QuizResultActivitiesScreen() {
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

    const activities = useMemo(() => {
        const raw = analysisResult?.layar_2_alternatif_aktivitas;
        if (Array.isArray(raw) && raw.length >= 3) {
            return raw.slice(0, 3);
        }
        return DEFAULT_ACTIVITIES;
    }, [analysisResult]);

    const titleFade = useSharedValue(0);
    const titleY = useSharedValue(15);

    const containerFade = useSharedValue(0);
    const containerY = useSharedValue(18);

    const tapOpacity = useSharedValue(0.4);

    useEffect(() => {
        if (!fontsLoaded) return;

        if (reducedMotion) {
            titleFade.set(1);
            titleY.set(0);
            containerFade.set(1);
            containerY.set(0);
            tapOpacity.set(0.9);
            return;
        }

        titleFade.set(withTiming(1, { duration: 320, easing: EASE_OUT }));
        titleY.set(withSpring(0, { duration: 400, dampingRatio: 0.8 }));

        containerFade.set(withDelay(80, withTiming(1, { duration: 340, easing: EASE_OUT })));
        containerY.set(withDelay(80, withSpring(0, { duration: 420, dampingRatio: 0.8 })));

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

    const animatedContainerStyle = useAnimatedStyle(() => ({
        opacity: containerFade.get(),
        transform: [{ translateY: containerY.get() }],
    }));

    const animatedTapStyle = useAnimatedStyle(() => ({
        opacity: tapOpacity.get(),
    }));

    const handleNext = () => {
        router.push('/onboarding/quiz-result-profile');
    };

    if (!fontsLoaded) return null;

    const cx = W / 2;
    const orbitCenterY = H * 0.54;
    const rings = [W * 0.52, W * 0.78, W * 1.05];

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
                        id="topRoseGlow"
                        cx={cx}
                        cy={H * 0.1}
                        rx={W * 0.85}
                        ry={H * 0.35}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0" stopColor="#fed7d7" stopOpacity="0.55" />
                        <Stop offset="0.65" stopColor="#faece8" stopOpacity="0.25" />
                        <Stop offset="1" stopColor="#f5f1ea" stopOpacity="0" />
                    </RadialGradient>

                    <RadialGradient
                        id="bottomSageGlow"
                        cx={cx}
                        cy={H * 0.74}
                        rx={W * 0.9}
                        ry={H * 0.4}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0" stopColor="#b6cbb9" stopOpacity="0.8" />
                        <Stop offset="0.65" stopColor="#d2dfd4" stopOpacity="0.45" />
                        <Stop offset="1" stopColor="#f5f1ea" stopOpacity="0" />
                    </RadialGradient>
                </Defs>

                <Rect x={0} y={0} width={W} height={H} fill="url(#topRoseGlow)" />
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
                        opacity={0.7}
                    />
                ))}
            </Svg>

            <View
                className="flex-1 justify-between"
                style={{
                    paddingTop: Math.max(insets.top, 20) + 24 * s,
                    paddingBottom: Math.max(insets.bottom, 20) + 12 * s,
                    paddingHorizontal: 22 * s,
                }}
            >
                <Animated.View style={animatedTitleStyle} className="items-center px-2">
                    <Text
                        className="text-[#1f2923] text-center font-outfit-extrabold"
                        style={{
                            fontFamily: 'Outfit_800ExtraBold',
                            fontSize: 27 * s,
                            lineHeight: 35 * s,
                        }}
                    >
                        Bayangin yang Bisa{'\n'}Kamu Lakukan{'\n'}Dengan Waktu{'\n'}Sebanyak Itu
                    </Text>
                </Animated.View>

                <Animated.View
                    style={animatedContainerStyle}
                    className="w-full bg-[#dbe4dd]/90"
                    style={{
                        borderRadius: 24 * s,
                        padding: 14 * s,
                        borderWidth: 1,
                        borderColor: '#cdd9cf',
                    }}
                >
                    <View className="gap-3">
                        {activities.map((item, idx) => (
                            <ActivityCard
                                key={idx}
                                index={idx}
                                title={item.judul}
                                description={item.deskripsi}
                                imageSource={ACTIVITY_IMAGES[idx] || yudaBukuSource}
                                scale={s}
                                reducedMotion={reducedMotion}
                            />
                        ))}
                    </View>
                </Animated.View>

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
