import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { useEffect, useRef, useState } from 'react';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    Polygon,
    RadialGradient,
    Stop,
} from 'react-native-svg';
import {
    PauseActionType,
    PauseAlertStage,
    PauseBiasaStageLevel,
    PauseDismissReason,
    PauseTaskItem,
} from '../types';
import { CukupTauCard } from './CukupTauCard';
import {
    evaluateCukupTauTrigger,
    markCukupTauShown,
    fetchCukupTauMessage,
    CukupTauCardMessage,
} from '../services/cukupTauService';
import { fetchTasks } from '@/features/dashboard/services/taskService';

export interface PauseBiasaFlowProps {
    userName: string;
    durationMinutes: number;
    durationSeconds?: number;
    totalElapsedSeconds?: number;
    reminderMinutes: number;
    pauseStage: PauseBiasaStageLevel;
    pauseCount?: number;
    breathDurationSeconds: number;
    actionType?: PauseActionType;
    initialStage?: PauseAlertStage;
    tasks?: PauseTaskItem[];
    width: number;
    height: number;
    onDismiss: (reason: PauseDismissReason) => void;
    onComplete?: () => void;
    onRest?: () => void;
    onContinueScroll?: () => void;
}

const BIASA_STAGE_FLOWS: Record<PauseBiasaStageLevel, PauseAlertStage[]> = {
    1: ['alert', 'pauseIntro', 'pauseAction', 'missionSuccess', 'breakChoice'],
    2: ['alert', 'pauseIntro', 'pauseAction', 'missionSuccess', 'breakChoice'],
    3: ['alert', 'pauseIntro', 'pauseAction', 'missionSuccess', 'taskReminder', 'breakChoice'],
};

const yudaTandaSeruSource = require('@/assets/images/yuda/yuda-tandaseru.png');
const yudaHalfBodySource = require('@/assets/images/yuda/yudahalfbody.png');
const yudaHandHalfSource = require('@/assets/images/yuda/yuda-hand-half.png');
const yudaXdSource = require('@/assets/images/yuda/yuda_xD.png');
const yudaQuestioningSource = require('@/assets/images/yuda/yuda-questioning.png');

const yudaNafasSource = require('@/assets/images/yuda/yuda_nafas.png');
const yudaMinumSource = require('@/assets/images/yuda/yuda_minum.png');
const yudaPereganganSource = require('@/assets/images/yuda/yuda_peregangan.png');
const yudaTidurSource = require('@/assets/images/yuda/yuda_tidur.png');

interface ActionConfig {
    introActionTitle: string;
    introDesc: string;
    missionTitle: string;
    successMessage: string;
    actionImage: ImageSourcePropType;
    getGuideLabel: (remaining: number, total: number) => string;
}

function resolveActionType(providedType?: PauseActionType): PauseActionType {
    if (providedType) return providedType;

    const currentHour = new Date().getHours();
    // Khusus tidur hanya direntang jam 22 (10 malam) sampai jam 4 pagi
    const isSleepTime = currentHour >= 22 || currentHour < 4;

    const pool: PauseActionType[] = isSleepTime
        ? ['nafas', 'minum', 'peregangan', 'tidur']
        : ['nafas', 'minum', 'peregangan'];

    // Pilih bergantian secara acak/rotasi berdasarkan detik waktu saat ini
    const index = Math.floor(Date.now() / 1000) % pool.length;
    return pool[index];
}

const ACTION_CONFIGS: Record<PauseActionType, ActionConfig> = {
    nafas: {
        introActionTitle: 'Tarik Nafas',
        introDesc: 'agar pikiranmu tenang dan rileks',
        missionTitle: 'Misi Tarik Nafas',
        successMessage: 'Tarik nafas selesai',
        actionImage: yudaNafasSource,
        getGuideLabel: (remaining: number, total: number) => {
            if (remaining <= 0) return 'Selesai!';
            const elapsed = Math.max(0, total - remaining);
            const cyclePos = elapsed % 10;
            if (cyclePos < 4) return 'Tarik ......';
            if (cyclePos < 6) return 'Tahan ......';
            return 'Hembuskan ......';
        },
    },
    minum: {
        introActionTitle: 'Minum Air',
        introDesc: 'teguk air putih agar tubuhmu tetap segar',
        missionTitle: 'Misi Minum Air',
        successMessage: 'Minum air selesai',
        actionImage: yudaMinumSource,
        getGuideLabel: (remaining: number, total: number) => {
            if (remaining <= 0) return 'Tubuh kembali segar!';
            const elapsed = Math.max(0, total - remaining);
            if (elapsed < 10) return 'Ambil segelas air putih hangat ......';
            if (elapsed < 20) return 'Minum perlahan beberapa teguk ......';
            return 'Rasakan kesegarannya ......';
        },
    },
    peregangan: {
        introActionTitle: 'Peregangan',
        introDesc: 'lemaskan otot leher dan pundak yang kaku',
        missionTitle: 'Misi Peregangan Tubuh',
        successMessage: 'Peregangan selesai',
        actionImage: yudaPereganganSource,
        getGuideLabel: (remaining: number, total: number) => {
            if (remaining <= 0) return 'Ototmu sudah lebih santai!';
            const elapsed = Math.max(0, total - remaining);
            if (elapsed < 10) return 'Putar bahu ke belakang perlahan ......';
            if (elapsed < 20) return 'Miringkan leher ke kiri dan kanan ......';
            return 'Rentangkan tangan ke atas ......';
        },
    },
    tidur: {
        introActionTitle: 'Pejamkan Mata',
        introDesc: 'sudah larut malam, istirahatkan matamu',
        missionTitle: 'Misi Istirahat & Pejamkan Mata',
        successMessage: 'Istirahat sejenak selesai',
        actionImage: yudaTidurSource,
        getGuideLabel: (remaining: number, total: number) => {
            if (remaining <= 0) return 'Waktunya tidur nyenyak!';
            const elapsed = Math.max(0, total - remaining);
            if (elapsed < 10) return 'Jauhkan layar HP dari mata ......';
            if (elapsed < 20) return 'Pejamkan matamu perlahan ......';
            return 'Bernafas perlahan dan bersiap tidur ......';
        },
    },
};

const DEFAULT_REMINDER_TASKS: PauseTaskItem[] = [
    { id: '1', title: 'Makanin kucing', time: '13.00', isCompleted: true },
    { id: '2', title: 'Makanin kucing', time: '13.00', isCompleted: false },
    { id: '3', title: 'Makanin kucing', time: '13.00', isCompleted: false },
];

function resolveAspectRatio(source: ImageSourcePropType, fallback: number): number {
    const asset = typeof Image.resolveAssetSource === 'function' ? Image.resolveAssetSource(source) : null;
    if (asset?.width && asset?.height) {
        return asset.width / asset.height;
    }
    return fallback;
}

function getBreathGuide(remaining: number, total: number): { label: string; targetScale: number } {
    if (remaining <= 0) {
        return { label: 'Selesai!', targetScale: 1 };
    }
    const elapsed = Math.max(0, total - remaining);
    const cyclePos = elapsed % 10;
    if (cyclePos < 4) {
        return { label: 'Tarik ......', targetScale: 1.07 };
    }
    if (cyclePos < 6) {
        return { label: 'Tahan ......', targetScale: 1.07 };
    }
    return { label: 'Hembuskan ......', targetScale: 0.97 };
}

function getNextStage(current: PauseAlertStage, level: PauseBiasaStageLevel): PauseAlertStage | null {
    const sequence = BIASA_STAGE_FLOWS[level] ?? BIASA_STAGE_FLOWS[1];
    const idx = sequence.indexOf(current);
    if (idx >= 0 && idx + 1 < sequence.length) {
        return sequence[idx + 1];
    }
    return null;
}

export function PauseBiasaFlow({
    userName,
    durationMinutes,
    durationSeconds = 0,
    totalElapsedSeconds,
    reminderMinutes,
    pauseStage,
    pauseCount = 1,
    breathDurationSeconds,
    actionType: propActionType,
    initialStage,
    tasks = DEFAULT_REMINDER_TASKS,
    width: W,
    height: H,
    onDismiss,
    onComplete,
    onRest,
    onContinueScroll,
}: PauseBiasaFlowProps) {
    const s = Math.min(W / 400, 1.15);
    const reducedMotion = useReducedMotion();

    const [activeActionType, setActiveActionType] = useState<PauseActionType>(() => resolveActionType(propActionType));
    const actionConfig = ACTION_CONFIGS[activeActionType] ?? ACTION_CONFIGS.nafas;

    // Jika ada actionType yang diberikan secara eksplisit melalui props, sinkronkan ke activeActionType
    useEffect(() => {
        if (propActionType && (propActionType === 'nafas' || propActionType === 'minum' || propActionType === 'peregangan' || propActionType === 'tidur')) {
            setActiveActionType(propActionType);
        }
    }, [propActionType]);

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const stageSequence = BIASA_STAGE_FLOWS[pauseStage] ?? BIASA_STAGE_FLOWS[1];
    const startStage = initialStage && stageSequence.includes(initialStage)
        ? initialStage
        : stageSequence[0];

    const [stage, setStage] = useState<PauseAlertStage>(startStage);
    const [cukupTauDecision, setCukupTauDecision] = useState<{
        checked: boolean;
        shouldShow: boolean;
        reason: 'jam_rawan' | 'scroll_terlalu_lama' | null;
    }>({
        checked: false,
        shouldShow: pauseCount >= 4,
        reason: pauseCount >= 4 ? 'scroll_terlalu_lama' : null,
    });

    const [remainingSeconds, setRemainingSeconds] = useState(breathDurationSeconds);
    const [hasTrackWidth, setHasTrackWidth] = useState(false);
    const [liveTasks, setLiveTasks] = useState<PauseTaskItem[]>(tasks);
    const [upcomingTasks, setUpcomingTasks] = useState<PauseTaskItem[]>([]);
    const [interventionMsg, setInterventionMsg] = useState<CukupTauCardMessage | null>(null);

    useEffect(() => {
        let isMounted = true;
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const todayStr = `${y}-${m}-${d}`;

        fetchTasks(todayStr)
            .then((res) => {
                if (!isMounted) return;
                const fetched = (res.tasks || []).map((t) => ({
                    id: String(t.id),
                    title: t.title,
                    time: t.time || (t.scheduled_time ? t.scheduled_time.substring(0, 5) : ''),
                    isCompleted: t.isCompleted,
                }));

                if (fetched.length > 0) {
                    setLiveTasks(fetched);
                }

                // Filter task yang belum tercentang dan dalam waktu 30 menit ke depan (0 sampai +30 menit)
                const currentMinutesOfDay = now.getHours() * 60 + now.getMinutes();
                const filteredUpcoming = fetched.filter((t) => {
                    if (t.isCompleted) return false;
                    if (!t.time) return false;
                    const parts = t.time.replace('.', ':').split(':');
                    const taskH = parseInt(parts[0], 10);
                    const taskM = parseInt(parts[1], 10);
                    if (isNaN(taskH) || isNaN(taskM)) return false;

                    const taskMinutesOfDay = taskH * 60 + taskM;
                    const diff = taskMinutesOfDay - currentMinutesOfDay;
                    // Berada dalam rentang waktu 0 sampai 30 menit ke depan
                    return diff >= 0 && diff <= 30;
                });

                setUpcomingTasks(filteredUpcoming);
            })
            .catch((_err) => {
                // Gunakan tasks prop sebagai fallback jika gagal fetch
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const actionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const hasCompletedActionRef = useRef<boolean>(false);

    const trackWidthSV = useSharedValue(0);
    const contentScale = useSharedValue(reducedMotion ? 1 : 0.94);
    const cardScale = useSharedValue(1);
    const progressRatio = useSharedValue(0);
    const breathScale = useSharedValue(1);

    const font500 = fontsLoaded ? 'Outfit_500Medium' : undefined;
    const font600 = fontsLoaded ? 'Outfit_600SemiBold' : undefined;
    const font700 = fontsLoaded ? 'Outfit_700Bold' : undefined;
    const font800 = fontsLoaded ? 'Outfit_800ExtraBold' : undefined;

    const clearStageTimers = () => {
        if (stageTimerRef.current) {
            clearTimeout(stageTimerRef.current);
            stageTimerRef.current = null;
        }
        if (completeTimerRef.current) {
            clearTimeout(completeTimerRef.current);
            completeTimerRef.current = null;
        }
        if (actionIntervalRef.current) {
            clearInterval(actionIntervalRef.current);
            actionIntervalRef.current = null;
        }
    };

    const goToStage = (nextStage: PauseAlertStage) => {
        clearStageTimers();
        const isEnteringCard = stage === 'alert' && nextStage !== 'alert';
        setStage(nextStage);
        if (isEnteringCard && !reducedMotion) {
            cardScale.set(0.95);
            cardScale.set(withSpring(1, { duration: 360, dampingRatio: 0.8 }));
        }
    };

    useEffect(() => {
        // Evaluasi apakah kartu Cukup Tau harus muncul (jam rawan atau jeda ke-4 scroll lama)
        let isMounted = true;
        evaluateCukupTauTrigger(pauseCount).then((res) => {
            if (isMounted) {
                setCukupTauDecision({
                    checked: true,
                    shouldShow: res.shouldShow,
                    reason: res.reason,
                });
            }
        });
        return () => {
            isMounted = false;
        };
    }, [pauseCount]);

    useEffect(() => {
        // Ambil pesan personalisasi dari InterventionMessage untuk flow jeda
        let isMounted = true;
        const trigger = cukupTauDecision.reason || 'scroll_terlalu_lama';
        fetchCukupTauMessage('lelah', trigger).then((msg) => {
            if (isMounted && msg) {
                setInterventionMsg(msg);
                const habitType = msg.micro_habit?.type?.toLowerCase();
                // Hanya timpa activeActionType jika tidak ada actionType eksplisit dari props
                if (!propActionType && habitType && (habitType === 'nafas' || habitType === 'minum' || habitType === 'peregangan' || habitType === 'tidur')) {
                    setActiveActionType(habitType as PauseActionType);
                }
            }
        });
        return () => {
            isMounted = false;
        };
    }, [cukupTauDecision.reason, propActionType]);

    const advanceStage = (fromStage: PauseAlertStage) => {
        // Prioritas 1: Jika kartu Cukup Tau harus muncul setelah alert (atau pauseCount >= 4)
        const isCukupTau = cukupTauDecision.shouldShow || pauseCount >= 4;
        if (fromStage === 'alert' && isCukupTau && stage !== 'cukupTau') {
            goToStage('cukupTau');
            return;
        }

        // Prioritas 2: Setelah cukupTau selesai, lanjut ke misi jeda biasa (pauseIntro)
        if (fromStage === 'cukupTau') {
            goToStage('pauseIntro');
            return;
        }

        // Prioritas 3: Setelah misi jeda selesai (missionSuccess)
        // Cek apakah ada task yang belum tercentang dalam 30 menit ke depan
        if (fromStage === 'missionSuccess') {
            if (upcomingTasks.length > 0) {
                goToStage('taskReminder');
                return;
            }
            goToStage('breakChoice');
            return;
        }

        if (fromStage === 'taskReminder') {
            goToStage('breakChoice');
            return;
        }

        const next = getNextStage(fromStage, pauseStage);
        if (next) {
            goToStage(next);
        } else {
            onDismiss('dismiss');
        }
    };

    useEffect(() => {
        if (!reducedMotion) {
            contentScale.set(withSpring(1, { duration: 420, dampingRatio: 0.78 }));
        }
        return () => clearStageTimers();
    }, []);

    useEffect(() => {
        clearStageTimers();

        if (stage === 'alert') {
            stageTimerRef.current = setTimeout(() => {
                stageTimerRef.current = null;
                advanceStage('alert');
            }, 3000);
        } else if (stage === 'missionSuccess') {
            stageTimerRef.current = setTimeout(() => {
                stageTimerRef.current = null;
                advanceStage('missionSuccess');
            }, 2200);
        } else if (stage === 'taskReminder') {
            stageTimerRef.current = setTimeout(() => {
                stageTimerRef.current = null;
                advanceStage('taskReminder');
            }, 3200);
        } else if (stage === 'continueConfirm') {
            stageTimerRef.current = setTimeout(() => {
                stageTimerRef.current = null;
                onContinueScroll?.();
                onDismiss('continue');
            }, 2800);
        }

        return () => clearStageTimers();
    }, [stage, pauseStage]);

    const handleCompleteAction = () => {
        if (hasCompletedActionRef.current) return;
        hasCompletedActionRef.current = true;
        if (actionIntervalRef.current) {
            clearInterval(actionIntervalRef.current);
            actionIntervalRef.current = null;
        }
        progressRatio.set(1);
        setRemainingSeconds(0);
        onComplete?.();
        advanceStage('pauseAction');
    };

    useEffect(() => {
        if (stage !== 'pauseAction') return;

        hasCompletedActionRef.current = false;
        setRemainingSeconds(breathDurationSeconds);
        progressRatio.set(0);
        breathScale.set(reducedMotion ? 1 : 1.07);

        if (!reducedMotion) {
            progressRatio.set(
                withTiming(1, {
                    duration: breathDurationSeconds * 1000,
                    easing: Easing.linear,
                })
            );
        }

        const targetEndTime = Date.now() + breathDurationSeconds * 1000;

        actionIntervalRef.current = setInterval(() => {
            const now = Date.now();
            const diffMs = targetEndTime - now;
            const diffSec = Math.max(0, Math.ceil(diffMs / 1000));

            setRemainingSeconds(diffSec);

            if (diffSec <= 0) {
                if (actionIntervalRef.current) {
                    clearInterval(actionIntervalRef.current);
                    actionIntervalRef.current = null;
                }
                if (reducedMotion) {
                    progressRatio.set(1);
                }
                completeTimerRef.current = setTimeout(() => {
                    completeTimerRef.current = null;
                    handleCompleteAction();
                }, 400);
            }
        }, 500);

        return () => {
            if (actionIntervalRef.current) {
                clearInterval(actionIntervalRef.current);
                actionIntervalRef.current = null;
            }
            if (completeTimerRef.current) {
                clearTimeout(completeTimerRef.current);
                completeTimerRef.current = null;
            }
        };
    }, [stage, breathDurationSeconds]);

    useEffect(() => {
        if (stage !== 'pauseAction') return;
        const targetScale = activeActionType === 'nafas'
            ? getBreathGuide(remainingSeconds, breathDurationSeconds).targetScale
            : 1;
        if (reducedMotion) {
            breathScale.set(1);
            progressRatio.set(
                breathDurationSeconds > 0
                    ? (breathDurationSeconds - remainingSeconds) / breathDurationSeconds
                    : 1
            );
        } else {
            breathScale.set(withTiming(targetScale, { duration: 1400, easing: Easing.inOut(Easing.ease) }));
        }
    }, [remainingSeconds, stage, breathDurationSeconds, reducedMotion, activeActionType]);

    const animatedAlertStyle = useAnimatedStyle(() => ({
        transform: [{ scale: contentScale.get() }],
    }));

    const animatedCardWrapperStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.get() }],
    }));

    const thumbSize = 14 * s;
    const animatedFillStyle = useAnimatedStyle(() => ({
        width: progressRatio.get() * trackWidthSV.get(),
    }));

    const animatedThumbStyle = useAnimatedStyle(() => {
        const w = trackWidthSV.get();
        return {
            transform: [
                {
                    translateX: Math.max(
                        0,
                        Math.min(w - thumbSize, progressRatio.get() * w - thumbSize / 2)
                    ),
                },
            ],
        };
    });

    const animatedBreathStyle = useAnimatedStyle(() => ({
        transform: [{ scale: breathScale.get() }],
    }));

    const cx = W / 2;
    const originY = 0;
    const reachY = H * 0.8;

    const beamCenterPts = `${cx - 26 * s},${originY} ${cx + 26 * s},${originY} ${cx + 60 * s},${reachY} ${cx - 60 * s},${reachY}`;
    const beamLeftPts = `${cx - 86 * s},${originY} ${cx - 38 * s},${originY} ${cx - 108 * s},${reachY} ${cx - 205 * s},${reachY}`;
    const beamRightPts = `${cx + 38 * s},${originY} ${cx + 86 * s},${originY} ${cx + 205 * s},${reachY} ${cx + 108 * s},${reachY}`;

    const halfBodyRatio = resolveAspectRatio(yudaHalfBodySource, 1.22);
    const handHalfRatio = resolveAspectRatio(yudaHandHalfSource, 4.8);

    const cardWidth = Math.min(W - 48 * s, 340 * s);
    const cardMinHeight = Math.min(378 * s, H * 0.52);
    const halfBodyWidth = cardWidth * 0.74;
    const halfBodyHeight = Math.round(halfBodyWidth / halfBodyRatio);
    const handsWidth = halfBodyWidth * 0.90;
    const handsHeight = Math.round(handsWidth / handHalfRatio);

    const actionGuideLabel = actionConfig.getGuideLabel(remainingSeconds, breathDurationSeconds);

    const completedCount = liveTasks.filter((t) => t.isCompleted).length;
    const totalCount = liveTasks.length;
    const taskProgressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const displayReminderTasks = upcomingTasks.length > 0 ? upcomingTasks : liveTasks.filter((t) => !t.isCompleted);

    const isCardStage = stage !== 'alert' && stage !== 'cukupTau';
    const isBottomClippedStage = stage === 'pauseAction' || stage === 'continueConfirm';

    return (
        <View
            style={{
                width: W,
                height: H,
                backgroundColor: 'rgba(0,0,0,0.68)',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <View
                pointerEvents="none"
                style={{ position: 'absolute', top: 0, left: 0, width: W, height: H }}
            >
                <Svg width={W} height={H} style={{ width: W, height: H }}>
                    <Defs>
                        <LinearGradient id="spotlightBeamFlow" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
                            <Stop offset="0.25" stopColor="#ffffff" stopOpacity="0.35" />
                            <Stop offset="0.65" stopColor="#ffffff" stopOpacity="0.12" />
                            <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                        </LinearGradient>
                    </Defs>
                    <Polygon points={beamLeftPts} fill="url(#spotlightBeamFlow)" />
                    <Polygon points={beamCenterPts} fill="url(#spotlightBeamFlow)" />
                    <Polygon points={beamRightPts} fill="url(#spotlightBeamFlow)" />
                </Svg>
            </View>

            {stage === 'alert' && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => advanceStage('alert')}
                    style={{
                        width: W,
                        height: H,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                    }}
                >
                    <Animated.View style={[styles.alertContent, animatedAlertStyle]}>
                        <View
                            style={{
                                width: 230 * s,
                                height: 230 * s,
                                marginBottom: 14 * s,
                            }}
                        >
                            <Image
                                source={yudaTandaSeruSource}
                                style={styles.fullSize}
                                resizeMode="contain"
                            />
                        </View>

                        <Text
                            style={{
                                fontFamily: font800,
                                fontWeight: font800 ? undefined : '800',
                                fontSize: 24 * s,
                                lineHeight: 33 * s,
                                color: '#FFFFFF',
                                textAlign: 'center',
                                textShadowColor: 'rgba(0,0,0,0.7)',
                                textShadowOffset: { width: 0, height: 2 },
                                textShadowRadius: 8,
                            }}
                        >
                            Halo {userName}, Kamu{'\n'}Sudah Scrolling{'\n'}Selama{' '}
                            {totalElapsedSeconds !== undefined
                                ? (Math.floor(totalElapsedSeconds / 60) > 0
                                    ? `${Math.floor(totalElapsedSeconds / 60)} Menit ${totalElapsedSeconds % 60 > 0 ? `${totalElapsedSeconds % 60} Detik` : ''}`.trim()
                                    : `${totalElapsedSeconds} Detik`)
                                : (durationMinutes > 0
                                    ? (durationSeconds > 0
                                        ? `${durationMinutes} Menit ${durationSeconds} Detik`
                                        : `${durationMinutes} Menit`)
                                    : `${durationSeconds || 30} Detik`)}
                        </Text>
                    </Animated.View>
                </TouchableOpacity>
            )}

            {stage === 'cukupTau' && (
                <View
                    style={{
                        width: W,
                        height: H,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                    }}
                >
                    <Animated.View
                        style={[
                            {
                                width: cardWidth,
                                alignItems: 'center',
                            },
                            animatedCardWrapperStyle,
                        ]}
                    >
                        <CukupTauCard
                            userName={userName}
                            cardWidth={cardWidth}
                            scale={s}
                            triggerReason={cukupTauDecision.reason || 'scroll_terlalu_lama'}
                            onProceedToMission={(_emotion, messageData) => {
                                markCukupTauShown(cukupTauDecision.reason || 'scroll_terlalu_lama');
                                if (messageData) {
                                    setInterventionMsg(messageData);
                                    const habitType = messageData.micro_habit?.type?.toLowerCase();
                                    if (habitType && (habitType === 'nafas' || habitType === 'minum' || habitType === 'peregangan' || habitType === 'tidur')) {
                                        setActiveActionType(habitType as PauseActionType);
                                    }
                                }
                                // Lanjut ke intro misi jeda
                                advanceStage('cukupTau');
                            }}
                        />
                    </Animated.View>
                </View>
            )}

            {isCardStage && (
                <View
                    style={{
                        width: W,
                        height: H,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                    }}
                >
                    <Animated.View
                        style={[
                            {
                                width: cardWidth,
                                alignItems: 'center',
                            },
                            animatedCardWrapperStyle,
                        ]}
                    >
                        <View
                            pointerEvents="none"
                            style={{
                                position: 'absolute',
                                bottom: '100%',
                                width: halfBodyWidth,
                                height: halfBodyHeight,
                                marginBottom: 0,
                                zIndex: 1,
                            }}
                        >
                            <Image
                                source={yudaHalfBodySource}
                                style={styles.fullSize}
                                resizeMode="contain"
                            />
                        </View>

                        <View
                            style={{
                                width: cardWidth,
                                minHeight: cardMinHeight,
                                backgroundColor: '#F7F5EE',
                                borderRadius: 26 * s,
                                paddingTop: 32 * s,
                                paddingBottom: isBottomClippedStage ? 0 : 22 * s,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.25,
                                shadowRadius: 20,
                                elevation: 12,
                                zIndex: 2,
                                alignItems: 'center',
                                justifyContent: isBottomClippedStage ? 'space-between' : 'center',
                            }}
                        >
                            <View
                                pointerEvents="none"
                                style={{
                                    position: 'absolute',
                                    top: -Math.round(handsHeight * 0.5),
                                    width: handsWidth,
                                    height: handsHeight,
                                    alignSelf: 'center',
                                    zIndex: 5,
                                }}
                            >
                                <Image
                                    source={yudaHandHalfSource}
                                    style={styles.fullSize}
                                    resizeMode="contain"
                                />
                            </View>

                            {stage === 'pauseIntro' && (
                                <View style={{ width: '100%', paddingHorizontal: 22 * s, alignItems: 'center' }}>
                                    <Text
                                        style={{
                                            fontFamily: font800,
                                            fontWeight: font800 ? undefined : '800',
                                            fontSize: 22 * s,
                                            lineHeight: 28 * s,
                                            color: '#1A1F1B',
                                            textAlign: 'center',
                                        }}
                                    >
                                        Yuk Ambil Jeda{'\n'}Sejenak
                                    </Text>

                                    <Text
                                        style={{
                                            fontFamily: font500,
                                            fontWeight: font500 ? undefined : '500',
                                            fontSize: 12 * s,
                                            lineHeight: 17 * s,
                                            color: '#3F4942',
                                            textAlign: 'center',
                                            marginTop: 8 * s,
                                        }}
                                    >
                                        {interventionMsg?.micro_habit?.type?.toLowerCase() === activeActionType && interventionMsg.micro_habit.instruction ? (
                                            interventionMsg.micro_habit.instruction
                                        ) : (
                                            <>
                                                Mulai dengan hal sederhana seperti{'\n'}
                                                <Text
                                                    style={{
                                                        fontFamily: font800,
                                                        fontWeight: font800 ? undefined : '800',
                                                        color: '#1A1F1B',
                                                    }}
                                                >
                                                    {actionConfig.introActionTitle}
                                                </Text>{' '}
                                                {actionConfig.introDesc}
                                            </>
                                        )}
                                    </Text>

                                    <View
                                        style={{
                                            width: 170 * s,
                                            height: 158 * s,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginVertical: 12 * s,
                                        }}
                                    >
                                        <Svg width={170 * s} height={158 * s} style={StyleSheet.absoluteFill}>
                                            <Defs>
                                                <RadialGradient id="glowIntro" cx="50%" cy="50%" r="50%">
                                                    <Stop offset="0" stopColor="#8DB89D" stopOpacity="0.48" />
                                                    <Stop offset="0.58" stopColor="#8DB89D" stopOpacity="0.18" />
                                                    <Stop offset="1" stopColor="#8DB89D" stopOpacity="0" />
                                                </RadialGradient>
                                            </Defs>
                                            <Circle
                                                cx={85 * s}
                                                cy={79 * s}
                                                r={76 * s}
                                                fill="url(#glowIntro)"
                                            />
                                        </Svg>
                                        <Image
                                            source={actionConfig.actionImage}
                                            style={{ width: 136 * s, height: 136 * s }}
                                            resizeMode="contain"
                                        />
                                    </View>

                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => goToStage('pauseAction')}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#2B6247',
                                            borderRadius: 14 * s,
                                            paddingVertical: 14 * s,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontFamily: font700,
                                                fontWeight: font700 ? undefined : '700',
                                                fontSize: 15 * s,
                                                color: '#FFFFFF',
                                            }}
                                        >
                                            Mulai - {breathDurationSeconds} Detik
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {stage === 'pauseAction' && (
                                <View
                                    style={{
                                        width: '100%',
                                        flexGrow: 1,
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <View style={{ width: '100%', paddingHorizontal: 20 * s, alignItems: 'center' }}>
                                        <Text
                                            style={{
                                                fontFamily: font800,
                                                fontWeight: font800 ? undefined : '800',
                                                fontSize: 22 * s,
                                                lineHeight: 28 * s,
                                                color: '#1A1F1B',
                                                textAlign: 'center',
                                                marginBottom: 16 * s,
                                            }}
                                        >
                                            {actionConfig.missionTitle}
                                        </Text>

                                        <View
                                            style={{
                                                width: '100%',
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: 16 * s,
                                                borderWidth: 1,
                                                borderColor: '#E5E7E1',
                                                paddingTop: 12 * s,
                                                paddingBottom: 18 * s,
                                                paddingHorizontal: 14 * s,
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.05,
                                                shadowRadius: 6,
                                                elevation: 2,
                                            }}
                                        >
                                            <View style={styles.timerValueRow}>
                                                <Text
                                                    style={{
                                                        fontFamily: font800,
                                                        fontWeight: font800 ? undefined : '800',
                                                        fontSize: 38 * s,
                                                        lineHeight: 44 * s,
                                                        color: '#2B6247',
                                                    }}
                                                >
                                                    {remainingSeconds}
                                                </Text>
                                                <Text
                                                    style={{
                                                        fontFamily: font700,
                                                        fontWeight: font700 ? undefined : '700',
                                                        fontSize: 14 * s,
                                                        color: '#1A1F1B',
                                                        marginLeft: 4 * s,
                                                    }}
                                                >
                                                    Detik
                                                </Text>
                                            </View>

                                            <View
                                                onLayout={(e) => {
                                                    const w = e.nativeEvent.layout.width;
                                                    if (w > 0) {
                                                        trackWidthSV.set(w);
                                                        if (!hasTrackWidth) setHasTrackWidth(true);
                                                    }
                                                }}
                                                style={{
                                                    width: '100%',
                                                    height: 7 * s,
                                                    borderRadius: 3.5 * s,
                                                    backgroundColor: '#E2EAE4',
                                                    marginTop: 10 * s,
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Animated.View
                                                    style={[
                                                        {
                                                            height: 7 * s,
                                                            borderRadius: 3.5 * s,
                                                            backgroundColor: '#2B6247',
                                                        },
                                                        animatedFillStyle,
                                                    ]}
                                                />
                                                {hasTrackWidth && (
                                                    <Animated.View
                                                        style={[
                                                            {
                                                                position: 'absolute',
                                                                left: 0,
                                                                width: thumbSize,
                                                                height: thumbSize,
                                                                borderRadius: thumbSize / 2,
                                                                backgroundColor: '#FFFFFF',
                                                                borderWidth: 2.5 * s,
                                                                borderColor: '#2B6247',
                                                                shadowColor: '#000',
                                                                shadowOffset: { width: 0, height: 1 },
                                                                shadowOpacity: 0.18,
                                                                shadowRadius: 2,
                                                                elevation: 3,
                                                            },
                                                            animatedThumbStyle,
                                                        ]}
                                                    />
                                                )}
                                            </View>
                                        </View>

                                        <Text
                                            style={{
                                                fontFamily: font600,
                                                fontWeight: font600 ? undefined : '600',
                                                fontSize: 13 * s,
                                                color: '#1A1F1B',
                                                textAlign: 'center',
                                                marginTop: 18 * s,
                                            }}
                                        >
                                            {actionGuideLabel}
                                        </Text>
                                    </View>

                                    <View
                                        style={{
                                            width: '100%',
                                            height: 162 * s,
                                            borderBottomLeftRadius: 26 * s,
                                            borderBottomRightRadius: 26 * s,
                                            overflow: 'hidden',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            marginTop: 6 * s,
                                        }}
                                    >
                                        <Svg width={240 * s} height={162 * s} style={{ position: 'absolute', bottom: 0 }}>
                                            <Defs>
                                                <RadialGradient id="glowAction" cx="50%" cy="62%" r="50%">
                                                    <Stop offset="0" stopColor="#8DB89D" stopOpacity="0.52" />
                                                    <Stop offset="0.62" stopColor="#8DB89D" stopOpacity="0.18" />
                                                    <Stop offset="1" stopColor="#8DB89D" stopOpacity="0" />
                                                </RadialGradient>
                                            </Defs>
                                            <Circle
                                                cx={120 * s}
                                                cy={102 * s}
                                                r={98 * s}
                                                fill="url(#glowAction)"
                                            />
                                        </Svg>
                                        <Animated.View
                                            style={[
                                                {
                                                    width: 184 * s,
                                                    height: 184 * s,
                                                    marginBottom: -30 * s,
                                                },
                                                animatedBreathStyle,
                                            ]}
                                        >
                                            <Image
                                                source={actionConfig.actionImage}
                                                style={styles.fullSize}
                                                resizeMode="contain"
                                            />
                                        </Animated.View>
                                    </View>
                                </View>
                            )}

                            {stage === 'missionSuccess' && (
                                <TouchableOpacity
                                    activeOpacity={0.92}
                                    onPress={() => advanceStage('missionSuccess')}
                                    style={{
                                        width: '100%',
                                        paddingHorizontal: 22 * s,
                                        paddingVertical: 18 * s,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 120 * s,
                                            height: 120 * s,
                                            borderRadius: 60 * s,
                                            backgroundColor: '#2B6247',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 24 * s,
                                        }}
                                    >
                                        <Svg width={62 * s} height={62 * s} viewBox="0 0 24 24" fill="none">
                                            <Path
                                                d="M5 12.5L9.5 17L19 7.5"
                                                stroke="#FFFFFF"
                                                strokeWidth={3.2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </Svg>
                                    </View>

                                    <Text
                                        style={{
                                            fontFamily: font800,
                                            fontWeight: font800 ? undefined : '800',
                                            fontSize: 22 * s,
                                            lineHeight: 28 * s,
                                            color: '#1A1F1B',
                                            textAlign: 'center',
                                        }}
                                    >
                                        Misi Sukses
                                    </Text>

                                    <Text
                                        style={{
                                            fontFamily: font500,
                                            fontWeight: font500 ? undefined : '500',
                                            fontSize: 12.5 * s,
                                            lineHeight: 18 * s,
                                            color: '#454F48',
                                            textAlign: 'center',
                                            marginTop: 6 * s,
                                        }}
                                    >
                                        {actionConfig.introActionTitle} selama {breathDurationSeconds} detik
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {stage === 'taskReminder' && (
                                <TouchableOpacity
                                    activeOpacity={0.95}
                                    onPress={() => advanceStage('taskReminder')}
                                    style={{
                                        width: '100%',
                                        paddingHorizontal: 18 * s,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: font800,
                                            fontWeight: font800 ? undefined : '800',
                                            fontSize: 22 * s,
                                            lineHeight: 28 * s,
                                            color: '#1A1F1B',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {userName} Aku Mau{'\n'}Ngingetin
                                    </Text>

                                    <Text
                                        style={{
                                            fontFamily: font500,
                                            fontWeight: font500 ? undefined : '500',
                                            fontSize: 11.5 * s,
                                            lineHeight: 16 * s,
                                            color: '#454F48',
                                            textAlign: 'center',
                                            marginTop: 8 * s,
                                        }}
                                    >
                                        Kamu punya jadwal aktivitas dalam waktu{'\n'}dekat
                                    </Text>

                                    <View
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: 16 * s,
                                            borderWidth: 1,
                                            borderColor: '#E5E7E1',
                                            padding: 12 * s,
                                            marginTop: 14 * s,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: '#F2F4F0',
                                                    borderRadius: 8 * s,
                                                    paddingHorizontal: 8 * s,
                                                    paddingVertical: 4 * s,
                                                }}
                                            >
                                                <Svg width={11 * s} height={11 * s} viewBox="0 0 24 24" fill="none">
                                                    <Circle cx="12" cy="12" r="9" stroke="#2B6247" strokeWidth="2.2" />
                                                    <Path
                                                        d="M12 7.5V12L15 13.8"
                                                        stroke="#2B6247"
                                                        strokeWidth="2.2"
                                                        strokeLinecap="round"
                                                    />
                                                </Svg>
                                                <Text
                                                    style={{
                                                        fontFamily: font600,
                                                        fontWeight: font600 ? undefined : '600',
                                                        fontSize: 9.5 * s,
                                                        color: '#1A1F1B',
                                                        marginLeft: 4 * s,
                                                    }}
                                                >
                                                    List Pekerjaan Hari Ini
                                                </Text>
                                            </View>

                                            <Text
                                                style={{
                                                    fontFamily: font700,
                                                    fontWeight: font700 ? undefined : '700',
                                                    fontSize: 9.5 * s,
                                                    color: '#1A1F1B',
                                                }}
                                            >
                                                Selesai: {completedCount}/{totalCount}
                                            </Text>
                                        </View>

                                        <View
                                            style={{
                                                width: '100%',
                                                height: 6 * s,
                                                borderRadius: 3 * s,
                                                backgroundColor: '#E2EAE4',
                                                marginTop: 8 * s,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    width: `${taskProgressPct}%`,
                                                    height: '100%',
                                                    backgroundColor: '#2B6247',
                                                    borderRadius: 3 * s,
                                                }}
                                            />
                                        </View>

                                        <View style={{ width: '100%', marginTop: 10 * s, gap: 7 * s }}>
                                            {displayReminderTasks.slice(0, 3).map((task) => (
                                                <View
                                                    key={task.id}
                                                    style={{
                                                        width: '100%',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        backgroundColor: '#F8F9F7',
                                                        borderWidth: 1,
                                                        borderColor: '#ECEDE8',
                                                        borderRadius: 10 * s,
                                                        paddingVertical: 10 * s,
                                                        paddingHorizontal: 12 * s,
                                                    }}
                                                >
                                                    <Text
                                                        numberOfLines={1}
                                                        style={{
                                                            flex: 1,
                                                            fontFamily: font600,
                                                            fontWeight: font600 ? undefined : '600',
                                                            fontSize: 12 * s,
                                                            color: '#1A1F1B',
                                                            marginRight: 8 * s,
                                                        }}
                                                    >
                                                        {task.title}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            fontFamily: font600,
                                                            fontWeight: font600 ? undefined : '600',
                                                            fontSize: 11.5 * s,
                                                            color: '#637067',
                                                        }}
                                                    >
                                                        {task.time}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {stage === 'breakChoice' && (
                                <View style={{ width: '100%', paddingHorizontal: 20 * s, alignItems: 'center' }}>
                                    <Text
                                        style={{
                                            fontFamily: font800,
                                            fontWeight: font800 ? undefined : '800',
                                            fontSize: 22 * s,
                                            lineHeight: 28 * s,
                                            color: '#1A1F1B',
                                            textAlign: 'center',
                                        }}
                                    >
                                        Yuk Ambil Istirahat{'\n'}Sejenak
                                    </Text>

                                    <Text
                                        style={{
                                            fontFamily: font500,
                                            fontWeight: font500 ? undefined : '500',
                                            fontSize: 11.5 * s,
                                            lineHeight: 16 * s,
                                            color: '#454F48',
                                            textAlign: 'center',
                                            marginTop: 8 * s,
                                        }}
                                    >
                                        Taruh gadget kamu dan lakukan aktivitas{'\n'}produktif lainnya.
                                    </Text>

                                    <View
                                        style={{
                                            width: '100%',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginTop: 18 * s,
                                            marginBottom: 18 * s,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 82 * s,
                                                height: 82 * s,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Svg width={82 * s} height={82 * s} style={StyleSheet.absoluteFill}>
                                                <Defs>
                                                    <RadialGradient id="glowChoice" cx="50%" cy="50%" r="50%">
                                                        <Stop offset="0" stopColor="#8DB89D" stopOpacity="0.45" />
                                                        <Stop offset="1" stopColor="#8DB89D" stopOpacity="0" />
                                                    </RadialGradient>
                                                </Defs>
                                                <Circle cx={41 * s} cy={41 * s} r={40 * s} fill="url(#glowChoice)" />
                                            </Svg>
                                            <Image
                                                source={yudaQuestioningSource}
                                                style={{ width: 72 * s, height: 72 * s }}
                                                resizeMode="contain"
                                            />
                                        </View>

                                        <View style={{ flex: 1, marginLeft: 8 * s, justifyContent: 'center', position: 'relative' }}>
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    left: -5 * s,
                                                    width: 12 * s,
                                                    height: 12 * s,
                                                    backgroundColor: '#2B6247',
                                                    transform: [{ rotate: '45deg' }],
                                                }}
                                            />
                                            <View
                                                style={{
                                                    backgroundColor: '#2B6247',
                                                    borderRadius: 12 * s,
                                                    paddingVertical: 11 * s,
                                                    paddingHorizontal: 12 * s,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontFamily: font600,
                                                        fontWeight: font600 ? undefined : '600',
                                                        fontSize: 11 * s,
                                                        lineHeight: 15.5 * s,
                                                        color: '#FFFFFF',
                                                    }}
                                                >
                                                    {interventionMsg?.message ||
                                                        `${userName}, semua kendali ada di kamu. pilih berhenti atau lanjut scroll nih`}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ width: '100%', gap: 10 * s }}>
                                        <TouchableOpacity
                                            activeOpacity={0.85}
                                            onPress={() => {
                                                onRest?.();
                                                onDismiss('rest');
                                            }}
                                            style={{
                                                width: '100%',
                                                backgroundColor: '#2B6247',
                                                borderRadius: 12 * s,
                                                paddingVertical: 12 * s,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontFamily: font700,
                                                    fontWeight: font700 ? undefined : '700',
                                                    fontSize: 13.5 * s,
                                                    color: '#FFFFFF',
                                                }}
                                            >
                                                Istirahat Scroll
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={0.85}
                                            onPress={() => goToStage('continueConfirm')}
                                            style={{
                                                width: '100%',
                                                backgroundColor: '#FFFFFF',
                                                borderWidth: 1.5,
                                                borderColor: '#2B6247',
                                                borderRadius: 12 * s,
                                                paddingVertical: 12 * s,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontFamily: font700,
                                                    fontWeight: font700 ? undefined : '700',
                                                    fontSize: 13.5 * s,
                                                    color: '#1A1F1B',
                                                }}
                                            >
                                                Lanjut Scroll
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {stage === 'continueConfirm' && (
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={() => {
                                        onContinueScroll?.();
                                        onDismiss('continue');
                                    }}
                                    style={{
                                        width: '100%',
                                        flexGrow: 1,
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <View style={{ width: '100%', paddingHorizontal: 22 * s, alignItems: 'center' }}>
                                        <Text
                                            style={{
                                                fontFamily: font800,
                                                fontWeight: font800 ? undefined : '800',
                                                fontSize: 22 * s,
                                                lineHeight: 28 * s,
                                                color: '#1A1F1B',
                                                textAlign: 'center',
                                            }}
                                        >
                                            Wah Kamu Mau{'\n'}Lanjut Ya
                                        </Text>

                                        <Text
                                            style={{
                                                fontFamily: font500,
                                                fontWeight: font500 ? undefined : '500',
                                                fontSize: 12 * s,
                                                lineHeight: 17 * s,
                                                color: '#454F48',
                                                textAlign: 'center',
                                                marginTop: 10 * s,
                                            }}
                                        >
                                            Okey {userName}, aku akan ingetin kamu lagi dalam {reminderMinutes} menit kedepan. Jangan lupa waktu dan jangan lupa beristirahat ya
                                        </Text>
                                    </View>

                                    <View
                                        style={{
                                            width: '100%',
                                            height: 180 * s,
                                            borderBottomLeftRadius: 26 * s,
                                            borderBottomRightRadius: 26 * s,
                                            overflow: 'hidden',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            marginTop: 10 * s,
                                        }}
                                    >
                                        <Svg width={240 * s} height={180 * s} style={{ position: 'absolute', bottom: 0 }}>
                                            <Defs>
                                                <RadialGradient id="glowContinue" cx="50%" cy="62%" r="50%">
                                                    <Stop offset="0" stopColor="#8DB89D" stopOpacity="0.52" />
                                                    <Stop offset="0.62" stopColor="#8DB89D" stopOpacity="0.18" />
                                                    <Stop offset="1" stopColor="#8DB89D" stopOpacity="0" />
                                                </RadialGradient>
                                            </Defs>
                                            <Circle
                                                cx={120 * s}
                                                cy={114 * s}
                                                r={98 * s}
                                                fill="url(#glowContinue)"
                                            />
                                        </Svg>
                                        <Image
                                            source={yudaQuestioningSource}
                                            style={{
                                                width: 194 * s,
                                                height: 194 * s,
                                                marginBottom: -28 * s,
                                            }}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    alertContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    fullSize: {
        width: '100%',
        height: '100%',
    },
    timerValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
    },
});

