import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { useEffect, useState } from 'react';
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
import Svg, {
    Defs,
    LinearGradient,
    Polygon,
    Stop,
} from 'react-native-svg';

const yudaPeekSource = require('../../../../assets/images/yuda/yuda-hand-half.png');
const yudaTandaSeruSource = require('../../../../assets/images/yuda/yuda-tandaseru.png');

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

interface YudaScrollAlertSimulatorProps {
    visible: boolean;
    userName?: string;
    durationMinutes?: number;
    initialSeconds?: number;
    showTimerDisplay?: boolean;
    onDismiss?: () => void;
}

export function YudaScrollAlertSimulator({
    visible,
    userName = 'Gathan',
    durationMinutes = 15,
    initialSeconds = 30,
    showTimerDisplay = true,
    onDismiss,
}: YudaScrollAlertSimulatorProps) {
    const { width: W, height: H } = useWindowDimensions();
    const s = Math.min(W / 400, 1.15);
    const reducedMotion = useReducedMotion();

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const [countdown, setCountdown] = useState(initialSeconds);
    const [timerActive, setTimerActive] = useState(true);
    const [phase, setPhase] = useState<'idle' | 'peeking' | 'full'>('idle');

    const peekY = useSharedValue(-120 * s);
    const peekRotate = useSharedValue(-6);

    const backdropOpacity = useSharedValue(0);
    const spotlightOpacity = useSharedValue(0);
    const fullContentScale = useSharedValue(0.82);
    const fullContentY = useSharedValue(35 * s);

    useEffect(() => {
        if (!visible || !timerActive || phase !== 'idle') return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    triggerPeeking();
                    return initialSeconds;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [visible, timerActive, phase, initialSeconds]);

    const triggerPeeking = () => {
        setPhase('peeking');

        if (reducedMotion) {
            peekY.set(0);
            peekRotate.set(0);
        } else {
            peekY.set(withSpring(0, { duration: 600, dampingRatio: 0.68 }));
            peekRotate.set(
                withRepeat(
                    withSequence(
                        withTiming(6, { duration: 850 }),
                        withTiming(-6, { duration: 850 })
                    ),
                    -1,
                    true
                )
            );
        }

        setTimeout(() => {
            triggerFullAlert();
        }, 3200);
    };

    const triggerFullAlert = () => {
        setPhase('full');

        if (reducedMotion) {
            backdropOpacity.set(1);
            spotlightOpacity.set(1);
            fullContentScale.set(1);
            fullContentY.set(0);
            return;
        }

        backdropOpacity.set(withTiming(1, { duration: 320, easing: EASE_OUT }));
        spotlightOpacity.set(withDelay(80, withTiming(1, { duration: 380 })));
        fullContentScale.set(withDelay(100, withSpring(1, { duration: 520, dampingRatio: 0.74 })));
        fullContentY.set(withDelay(100, withSpring(0, { duration: 520, dampingRatio: 0.74 })));
    };

    const handleDismiss = () => {
        backdropOpacity.set(withTiming(0, { duration: 240, easing: EASE_OUT }));
        spotlightOpacity.set(withTiming(0, { duration: 200 }));
        fullContentScale.set(withTiming(0.85, { duration: 240 }));

        peekY.set(-120 * s);
        setTimeout(() => {
            setPhase('idle');
            setCountdown(initialSeconds);
            fullContentY.set(35 * s);
            onDismiss?.();
        }, 260);
    };

    const animatedPeekStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: peekY.get() }],
    }));

    const animatedCapyRockStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${peekRotate.get()}deg` }],
    }));

    const animatedBackdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.get(),
    }));

    const animatedSpotlightStyle = useAnimatedStyle(() => ({
        opacity: spotlightOpacity.get(),
    }));

    const animatedFullStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: fullContentY.get() }, { scale: fullContentScale.get() }],
    }));

    if (!visible || !fontsLoaded) return null;

    const cx = W / 2;
    const originY = -H * 0.05;
    const reachY = H * 0.82;

    const beamLeftPts = `${cx - 24 * s},${originY} ${cx - 6 * s},${originY} ${W * 0.36},${reachY} ${W * 0.08},${reachY}`;
    const beamCenterPts = `${cx - 12 * s},${originY} ${cx + 12 * s},${originY} ${W * 0.64},${reachY} ${W * 0.36},${reachY}`;
    const beamRightPts = `${cx + 6 * s},${originY} ${cx + 24 * s},${originY} ${W * 0.92},${reachY} ${W * 0.64},${reachY}`;

    return (
        <View pointerEvents="box-none" style={{ position: 'absolute', inset: 0, zIndex: 999 }}>
            {showTimerDisplay && (
                <View
                    className="absolute top-12 left-4 z-50 flex-row items-center bg-[#163826]/90 px-3 py-1.5 rounded-full border border-[#3e825f]/50 shadow-md"
                >
                    <Pressable
                        onPress={() => setTimerActive((prev) => !prev)}
                        className="flex-row items-center mr-2"
                    >
                        <View
                            className={`w-2.5 h-2.5 rounded-full mr-2 ${
                                timerActive ? 'bg-[#4ade80]' : 'bg-[#94a3b8]'
                            }`}
                        />
                        <Text className="text-white font-outfit-bold text-xs" style={{ fontFamily: 'Outfit_700Bold' }}>
                            {timerActive ? `Yuda: ${countdown}s` : 'Timer Paused'}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={triggerPeeking}
                        className="bg-[#2e6b4e] px-2 py-0.5 rounded-md"
                    >
                        <Text className="text-white font-outfit-semibold text-[10px]" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                            Tes Peek
                        </Text>
                    </Pressable>
                </View>
            )}

            {phase === 'peeking' && (
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            top: 0,
                            left: 18 * s,
                            width: 86 * s,
                            height: 86 * s,
                            zIndex: 1000,
                        },
                        animatedPeekStyle,
                    ]}
                >
                    <Pressable onPress={triggerFullAlert} style={{ width: '100%', height: '100%' }}>
                        <Animated.View style={[{ width: '100%', height: '100%' }, animatedCapyRockStyle]}>
                            <Image
                                source={yudaPeekSource}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            )}

            {phase === 'full' && (
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.65)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1001,
                        },
                        animatedBackdropStyle,
                    ]}
                >
                    <Animated.View
                        pointerEvents="none"
                        style={[{ position: 'absolute', inset: 0 }, animatedSpotlightStyle]}
                    >
                        <Svg width={W} height={H} className="absolute inset-0">
                            <Defs>
                                <LinearGradient id="spotlightBeam" x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0" stopColor="#ffffff" stopOpacity="0.45" />
                                    <Stop offset="0.32" stopColor="#ffffff" stopOpacity="0.28" />
                                    <Stop offset="0.75" stopColor="#ffffff" stopOpacity="0.08" />
                                    <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                                </LinearGradient>
                            </Defs>
                            <Polygon points={beamLeftPts} fill="url(#spotlightBeam)" />
                            <Polygon points={beamCenterPts} fill="url(#spotlightBeam)" />
                            <Polygon points={beamRightPts} fill="url(#spotlightBeam)" />
                        </Svg>
                    </Animated.View>

                    <Pressable
                        onPress={handleDismiss}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 20 * s,
                        }}
                    >
                        <Animated.View
                            style={[
                                {
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                },
                                animatedFullStyle,
                            ]}
                        >
                            <View
                                style={{
                                    width: 230 * s,
                                    height: 230 * s,
                                    marginBottom: 14 * s,
                                }}
                            >
                                <Image
                                    source={yudaTandaSeruSource}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="contain"
                                />
                            </View>

                            <Text
                                className="text-white text-center"
                                style={{
                                    fontFamily: 'Outfit_800ExtraBold',
                                    fontSize: 24 * s,
                                    lineHeight: 33 * s,
                                    textShadowColor: 'rgba(0,0,0,0.7)',
                                    textShadowOffset: { width: 0, height: 2 },
                                    textShadowRadius: 8,
                                }}
                            >
                                Halo {userName}, Kamu{'\n'}Sudah Scrolling{'\n'}Selama {durationMinutes} Menit
                            </Text>
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            )}
        </View>
    );
}
