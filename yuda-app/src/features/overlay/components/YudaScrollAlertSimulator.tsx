import {
    Outfit_600SemiBold,
    Outfit_700Bold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { useEffect, useRef, useState } from 'react';
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
    withTiming,
} from 'react-native-reanimated';
import {
    PauseBiasaStageLevel,
    PauseDismissReason,
    PauseType,
    YudaPauseAlertFlow,
} from './YudaPauseAlertFlow';

const yudaPeekSource = require('../../../../assets/images/yuda/yuda-tangan-kebalik.png');

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

interface YudaScrollAlertSimulatorProps {
    visible: boolean;
    userName?: string;
    durationMinutes?: number;
    pauseType?: PauseType;
    breathDurationSeconds?: number;
    initialSeconds?: number;
    showTimerDisplay?: boolean;
    onDismiss?: () => void;
}

export function YudaScrollAlertSimulator({
    visible,
    userName = 'Gathan',
    durationMinutes = 15,
    pauseType = 'biasa',
    breathDurationSeconds = 30,
    initialSeconds = 30,
    showTimerDisplay = true,
    onDismiss,
}: YudaScrollAlertSimulatorProps) {
    const { width: W } = useWindowDimensions();
    const s = Math.min(W / 400, 1.15);
    const reducedMotion = useReducedMotion();

    const [fontsLoaded] = useFonts({
        Outfit_600SemiBold,
        Outfit_700Bold,
    });

    const peekAsset = typeof Image.resolveAssetSource === 'function' ? Image.resolveAssetSource(yudaPeekSource) : null;
    const peekAspectRatio = peekAsset?.width && peekAsset?.height ? peekAsset.width / peekAsset.height : 0.725;
    const peekWidth = 132 * s;
    const peekHeight = Math.round(peekWidth / peekAspectRatio);
    const visiblePeekY = -peekHeight * 0.25;
    const hiddenPeekY = -(peekHeight + 16 * s);

    const [countdown, setCountdown] = useState(initialSeconds);
    const [timerActive, setTimerActive] = useState(true);
    const [phase, setPhase] = useState<'idle' | 'peeking' | 'full'>('idle');
    const [pauseStage, setPauseStage] = useState<PauseBiasaStageLevel>(1);

    const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const peekY = useSharedValue(hiddenPeekY);

    useEffect(() => {
        return () => {
            if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
        };
    }, []);

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
        if (peekTimerRef.current) {
            clearTimeout(peekTimerRef.current);
            peekTimerRef.current = null;
        }
        setPhase('peeking');

        if (reducedMotion) {
            peekY.set(visiblePeekY);
        } else {
            peekY.set(hiddenPeekY);
            peekY.set(withTiming(visiblePeekY, { duration: 480, easing: EASE_OUT }));
        }

        peekTimerRef.current = setTimeout(() => {
            peekTimerRef.current = null;
            triggerFullAlert();
        }, 3200);
    };

    const triggerFullAlert = () => {
        if (peekTimerRef.current) {
            clearTimeout(peekTimerRef.current);
            peekTimerRef.current = null;
        }
        setPhase('full');
    };

    const handleDismiss = (reason: PauseDismissReason) => {
        if (peekTimerRef.current) {
            clearTimeout(peekTimerRef.current);
            peekTimerRef.current = null;
        }
        if (reason === 'continue') {
            setPauseStage((prev) => (prev < 2 ? 2 : 2));
        } else {
            setPauseStage(1);
        }
        peekY.set(hiddenPeekY);
        setPhase('idle');
        setCountdown(initialSeconds);
        onDismiss?.();
    };

    const animatedPeekStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: peekY.get() }],
    }));

    if (!visible || !fontsLoaded) return null;

    const activeElapsedMinutes = durationMinutes * pauseStage;

    return (
        <View pointerEvents="box-none" style={{ position: 'absolute', inset: 0, zIndex: 999, overflow: 'hidden' }}>
            {showTimerDisplay && phase !== 'full' && (
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
                            width: peekWidth,
                            height: peekHeight,
                            zIndex: 1000,
                        },
                        animatedPeekStyle,
                    ]}
                >
                    <Pressable onPress={triggerFullAlert} style={{ width: '100%', height: '100%' }}>
                        <Image
                            source={yudaPeekSource}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="contain"
                        />
                    </Pressable>
                </Animated.View>
            )}

            {phase === 'full' && (
                <View style={{ position: 'absolute', inset: 0, zIndex: 1001 }}>
                    <YudaPauseAlertFlow
                        userName={userName}
                        durationMinutes={activeElapsedMinutes}
                        reminderMinutes={durationMinutes}
                        pauseType={pauseType}
                        pauseStage={pauseStage}
                        breathDurationSeconds={breathDurationSeconds}
                        onDismiss={handleDismiss}
                    />
                </View>
            )}
        </View>
    );
}
