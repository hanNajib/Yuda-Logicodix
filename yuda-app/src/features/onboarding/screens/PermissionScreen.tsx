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
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    AppState,
    Image,
    Linking,
    PermissionsAndroid,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import Animated, {
    Easing,
    interpolateColor,
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
import { useAuthStore } from '@/stores/useAuthStore';
import YudaPip from '@/modules/yuda-pip';

const REF_W = 420;
const yudaHeadSource = require('../../../../assets/images/yuda/yudahalfbody.png');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

type WaitingFor = 'overlay' | 'battery' | 'notification' | null;

function CustomToggle({
    value,
    disabled = false,
    s = 1,
}: {
    value: boolean;
    disabled?: boolean;
    s?: number;
}) {
    const switchTrackW = 54 * s;
    const switchTrackH = 32 * s;
    const knobSize = 26 * s;
    const travel = switchTrackW - knobSize - 6 * s;

    const progress = useSharedValue(value ? 1 : 0);

    useEffect(() => {
        progress.value = withSpring(value ? 1 : 0, { duration: 250, dampingRatio: 0.78 });
    }, [value]);

    const trackStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            [disabled ? '#e2e8e3' : '#cfdad1', disabled ? '#7ea38c' : '#2e6b4e']
        ),
    }));

    const knobStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: progress.value * travel }],
    }));

    return (
        <Animated.View
            className="justify-center"
            style={[
                {
                    width: switchTrackW,
                    height: switchTrackH,
                    borderRadius: switchTrackH / 2,
                    padding: 3 * s,
                    opacity: disabled ? 0.6 : 1,
                },
                trackStyle,
            ]}
        >
            <Animated.View
                className="bg-white rounded-full shadow-sm"
                style={[
                    { width: knobSize, height: knobSize },
                    knobStyle,
                ]}
            />
        </Animated.View>
    );
}

type PipStep = { badge: string; step1: string; step2: string };

const PIP_STEPS: Record<NonNullable<WaitingFor>, PipStep> = {
    overlay: {
        badge: 'Langkah 1: Izin Layar',
        step1: 'Temukan & ketuk "Yuda"',
        step2: 'Aktifkan sakelar "Izinkan"',
    },
    battery: {
        badge: 'Langkah 2: Latar Belakang',
        step1: 'Cari "Yuda" di daftar',
        step2: 'Pilih opsi "Tidak Dibatasi"',
    },
    notification: {
        badge: 'Langkah 3: Notifikasi',
        step1: 'Ketuk menu "Notifikasi"',
        step2: 'Aktifkan sakelar izin',
    },
};

const PIP_DEFAULT: PipStep = {
    badge: 'Panduan Yuda',
    step1: 'Cari & buka aplikasi Yuda',
    step2: 'Aktifkan izin yang diminta',
};

function PipFloatingWidget({
    waitingFor,
    onMaximize,
}: {
    waitingFor: WaitingFor;
    onMaximize: () => void;
}) {
    const { width: W, height: H } = useWindowDimensions();

    const k = Math.max(0.7, Math.min(W / 260, H / 146, 1.4));
    const showFooter = H >= 110;

    const pulseScale = useSharedValue(1);

    useEffect(() => {
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.35, { duration: 600, easing: Easing.out(Easing.quad) }),
                withTiming(1, { duration: 600, easing: Easing.in(Easing.quad) })
            ),
            -1,
            true
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const current = waitingFor ? PIP_STEPS[waitingFor] : PIP_DEFAULT;

    const avatarBox = 40 * k;
    const avatarImg = 34 * k;

    return (
        <TouchableOpacity
            className="flex-1 bg-[#163826] border-[1.5px] border-[#3e825f]/50"
            style={{ padding: 8 * k }}
            activeOpacity={0.92}
            onPress={onMaximize}
        >
            <View className="flex-row items-center" style={{ minHeight: 20 * k }}>
                <Animated.View
                    className="rounded-full bg-[#4ade80]"
                    style={[
                        { width: 8 * k, height: 8 * k, marginRight: 6 * k },
                        pulseStyle,
                    ]}
                />
                <Text
                    className="flex-1 text-white"
                    style={{ fontFamily: 'Outfit_700Bold', fontSize: 11.5 * k }}
                    numberOfLines={1}
                >
                    {current.badge}
                </Text>
                <View
                    className="items-center justify-center bg-[#24543a] border border-[#3b7554] rounded-full"
                    style={{ width: 22 * k, height: 22 * k, marginLeft: 6 * k }}
                >
                    <Ionicons name="expand-outline" size={12 * k} color="#a3dbb9" />
                </View>
            </View>

            <View className="flex-1 flex-row items-center" style={{ paddingVertical: 4 * k }}>
                <View
                    className="rounded-full bg-[#24543a] border border-[#48996b] items-center justify-center overflow-hidden"
                    style={{ width: avatarBox, height: avatarBox, marginRight: 8 * k }}
                >
                    <Image
                        source={yudaHeadSource}
                        style={{ width: avatarImg, height: avatarImg }}
                        resizeMode="contain"
                    />
                </View>

                <View className="flex-1 justify-center">
                    <View className="flex-row items-start">
                        <Text
                            className="text-[#86bfa0]"
                            style={{ fontFamily: 'Outfit_700Bold', fontSize: 11.5 * k, marginRight: 4 * k }}
                        >
                            1.
                        </Text>
                        <Text
                            className="flex-1 text-[#d9ede1]"
                            style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 11.5 * k, lineHeight: 15 * k }}
                            numberOfLines={2}
                        >
                            {current.step1}
                        </Text>
                    </View>
                    <View className="flex-row items-start" style={{ marginTop: 3 * k }}>
                        <Text
                            className="text-[#4ade80]"
                            style={{ fontFamily: 'Outfit_700Bold', fontSize: 11.5 * k, marginRight: 4 * k }}
                        >
                            2.
                        </Text>
                        <Text
                            className="flex-1 text-[#4ade80]"
                            style={{ fontFamily: 'Outfit_700Bold', fontSize: 11.5 * k, lineHeight: 15 * k }}
                            numberOfLines={2}
                        >
                            {current.step2}
                        </Text>
                    </View>
                </View>
            </View>

            {showFooter && (
                <View className="border-t border-[#235037]" style={{ paddingTop: 4 * k }}>
                    <Text
                        className="text-[#86bfa0]"
                        style={{ fontFamily: 'Outfit_500Medium', fontSize: 9.5 * k }}
                        numberOfLines={1}
                    >
                        ✨ Otomatis kembali setelah izin aktif · ketuk untuk buka penuh
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

export default function PermissionsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: W, height: H } = useWindowDimensions();
    const reducedMotion = useReducedMotion();

    const [nativeInPip, setNativeInPip] = useState(() => YudaPip.isInPipMode());
    const isInPipMode = nativeInPip || H < 360 || W < 320;

    const { user, userName } = useAuthStore();
    const displayName = userName || user?.name || 'Gathan';
    const initialLetter = (displayName[0] || 'G').toUpperCase();

    const submitting = useRef(false);
    const waitingForRef = useRef<WaitingFor>(null);
    const [waitingFor, setWaitingFor] = useState<WaitingFor>(null);

    const [overlayGranted, setOverlayGranted] = useState(false);
    const [batteryGranted, setBatteryGranted] = useState(false);
    const [notifGranted, setNotifGranted] = useState(false);

    const batteryLocked = !overlayGranted;
    const notifLocked = !overlayGranted || !batteryGranted;
    const grantedCount = (overlayGranted ? 1 : 0) + (batteryGranted ? 1 : 0) + (notifGranted ? 1 : 0);
    const progressPercent = grantedCount === 0 ? 0 : grantedCount === 1 ? 33 : grantedCount === 2 ? 66 : 100;

    const allGranted = overlayGranted && batteryGranted && notifGranted;
    const nativeAvailable = YudaPip.isNativeModuleAvailable();
    const pipSupported = nativeAvailable && YudaPip.isPipSupported();

    const notifUsesDialog = Platform.OS === 'android' && Platform.Version >= 33;

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
    const cardFade = useSharedValue(0);
    const cardY = useSharedValue(20);
    const barFill = useSharedValue(0);
    const mainFade = useSharedValue(0);
    const mainY = useSharedValue(35);
    const lockedShakeX = useSharedValue(0);
    const btnScale = useSharedValue(1);
    const btnY = useSharedValue(0);
    const btnShakeX = useSharedValue(0);

    const readSystemPermissions = useCallback(async () => {
        if (Platform.OS !== 'android') {
            return;
        }

        const overlay = nativeAvailable ? YudaPip.canDrawOverlays() : false;
        const battery = nativeAvailable ? YudaPip.isIgnoringBatteryOptimizations() : false;
        let notif = false;
        if (Platform.Version >= 33) {
            try {
                notif = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
            } catch { }
        } else {
            notif = true;
        }

        setOverlayGranted(overlay);
        setBatteryGranted(battery);
        setNotifGranted(notif);

        return { overlay, battery, notif };
    }, [nativeAvailable]);

    useEffect(() => {
        readSystemPermissions();
        setNativeInPip(YudaPip.isInPipMode());
    }, [readSystemPermissions]);

    useEffect(() => {
        const subPip = YudaPip.addPipModeListener?.((event) => {
            setNativeInPip(event.isInPip);
        });

        const subGranted = YudaPip.addPermissionGrantedListener?.((event) => {
            readSystemPermissions();
            setNativeInPip(false);
            waitingForRef.current = null;
            setWaitingFor(null);
        });

        return () => {
            subPip?.remove?.();
            subGranted?.remove?.();
        };
    }, [readSystemPermissions]);

    useEffect(() => {
        const sub = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') {
                readSystemPermissions();
                setNativeInPip(YudaPip.isInPipMode());
            }
        });
        return () => sub.remove();
    }, [readSystemPermissions]);

    useEffect(() => {
        if (!isInPipMode) {
            waitingForRef.current = null;
            setWaitingFor(null);
            if (nativeAvailable) {
                YudaPip.stopWatching();
            }
        }
    }, [isInPipMode, nativeAvailable]);

    useEffect(() => {
        if (!fontsLoaded) return;

        if (reducedMotion) {
            avatarFade.value = 1;
            avatarY.value = 0;
            titleFade.value = 1;
            titleY.value = 0;
            cardFade.value = 1;
            cardY.value = 0;
            barFill.value = 0.33;
            mainFade.value = 1;
            mainY.value = 0;
            return;
        }

        avatarFade.value = withTiming(1, { duration: 350 });
        avatarY.value = withTiming(0, { duration: 420, easing: EASE_OUT });

        titleFade.value = withDelay(80, withTiming(1, { duration: 380 }));
        titleY.value = withDelay(80, withSpring(0, { duration: 450, dampingRatio: 0.8 }));

        cardFade.value = withDelay(140, withTiming(1, { duration: 380 }));
        cardY.value = withDelay(140, withSpring(0, { duration: 450, dampingRatio: 0.8 }));

        mainFade.value = withDelay(200, withTiming(1, { duration: 400 }));
        mainY.value = withDelay(200, withSpring(0, { duration: 500, dampingRatio: 0.8 }));
    }, [fontsLoaded, reducedMotion]);

    useEffect(() => {
        if (!fontsLoaded) return;
        const target = grantedCount === 0 ? 0.08 : grantedCount / 3;
        barFill.value = withSpring(target, { duration: 600, dampingRatio: 0.78 });
    }, [grantedCount, fontsLoaded]);

    const avatarStyle = useAnimatedStyle(() => ({
        opacity: avatarFade.value,
        transform: [{ translateY: avatarY.value }],
    }));

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleFade.value,
        transform: [{ translateY: titleY.value }],
    }));

    const cardStyle = useAnimatedStyle(() => ({
        opacity: cardFade.value,
        transform: [{ translateY: cardY.value }],
    }));

    const barStyle = useAnimatedStyle(() => ({
        width: `${barFill.value * 100}%`,
    }));

    const mainStyle = useAnimatedStyle(() => ({
        opacity: mainFade.value,
        transform: [{ translateY: mainY.value }],
    }));

    const lockedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: lockedShakeX.value }],
    }));

    const btnStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: btnY.value },
            { scale: btnScale.value },
            { translateX: btnShakeX.value },
        ],
    }));

    const handlePressOverlay = useCallback(async () => {
        if (overlayGranted) {
            if (Platform.OS === 'android') {
                try {
                    await Linking.sendIntent(
                        'android.settings.action.MANAGE_OVERLAY_PERMISSION',
                        [{ key: 'package', value: 'package:com.mieayamproject.yuda' }]
                    );
                } catch {
                    try {
                        await Linking.sendIntent('android.settings.action.MANAGE_OVERLAY_PERMISSION');
                    } catch {
                        await Linking.openSettings();
                    }
                }
            } else {
                setOverlayGranted(false);
            }
            return;
        }

        waitingForRef.current = 'overlay';
        setWaitingFor('overlay');

        if (Platform.OS !== 'android') {
            setOverlayGranted(true);
            return;
        }

        // Overlay selalu butuh halaman pengaturan -> floating tetap dipakai
        if (nativeAvailable) {
            YudaPip.requestOverlayWithPip();
        } else {
            try {
                await Linking.sendIntent(
                    'android.settings.action.MANAGE_OVERLAY_PERMISSION',
                    [{ key: 'package', value: 'package:com.mieayamproject.yuda' }]
                );
            } catch {
                try {
                    await Linking.sendIntent('android.settings.action.MANAGE_OVERLAY_PERMISSION');
                } catch {
                    await Linking.openSettings();
                }
            }
        }
    }, [overlayGranted, nativeAvailable, pipSupported]);

    const handlePressBattery = useCallback(async () => {
        if (batteryLocked) {
            lockedShakeX.value = withSequence(
                withTiming(-8, { duration: 45 }),
                withRepeat(withTiming(8, { duration: 75 }), 4, true),
                withTiming(0, { duration: 45 })
            );
            return;
        }
        if (batteryGranted) {
            if (Platform.OS === 'android') {
                try {
                    await Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
                } catch {
                    await Linking.openSettings();
                }
            } else {
                setBatteryGranted(false);
            }
            return;
        }

        waitingForRef.current = 'battery';
        setWaitingFor('battery');

        if (Platform.OS !== 'android') {
            setBatteryGranted(true);
            return;
        }

        // Native memutuskan sendiri: dialog sistem (tanpa floating) atau halaman pengaturan (floating)
        if (nativeAvailable) {
            YudaPip.requestBatteryWithPip();
        } else {
            try {
                await Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
            } catch {
                await Linking.openSettings();
            }
        }
    }, [batteryLocked, batteryGranted, nativeAvailable]);

    const handlePressNotif = useCallback(async () => {
        if (notifLocked) {
            lockedShakeX.value = withSequence(
                withTiming(-8, { duration: 45 }),
                withRepeat(withTiming(8, { duration: 75 }), 4, true),
                withTiming(0, { duration: 45 })
            );
            return;
        }
        if (notifGranted) {
            if (Platform.OS === 'android') {
                try {
                    if (Platform.Version >= 26) {
                        await Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
                            { key: 'android.provider.extra.APP_PACKAGE', value: 'com.mieayamproject.yuda' },
                        ]);
                    } else {
                        await Linking.openSettings();
                    }
                } catch {
                    await Linking.openSettings();
                }
            } else {
                setNotifGranted(false);
            }
            return;
        }

        if (Platform.OS !== 'android') {
            setNotifGranted(true);
            return;
        }

        // Android 13+: coba dialog runtime dulu (tanpa floating)
        if (Platform.Version >= 33) {
            try {
                const res = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                if (res === PermissionsAndroid.RESULTS.GRANTED) {
                    await readSystemPermissions();
                    return;
                }
                if (res === PermissionsAndroid.RESULTS.DENIED) {
                    // Masih boleh diminta lagi nanti, jangan buka pengaturan
                    return;
                }
                // NEVER_ASK_AGAIN -> dialog tidak muncul lagi, lanjut ke pengaturan
            } catch { }
        }

        // Fallback: harus lewat pengaturan -> pakai floating
        waitingForRef.current = 'notification';
        setWaitingFor('notification');

        if (nativeAvailable) {
            YudaPip.requestNotificationWithPip();
        } else {
            await Linking.openSettings();
        }
    }, [notifLocked, notifGranted, nativeAvailable, readSystemPermissions]);

    const handleBtnPressIn = () => {
        btnScale.value = withTiming(0.96, { duration: 90, easing: EASE_OUT });
        btnY.value = withTiming(2.5, { duration: 90, easing: EASE_OUT });
    };
    const handleBtnPressOut = () => {
        btnScale.value = withSpring(1, { duration: 220, dampingRatio: 0.8 });
        btnY.value = withSpring(0, { duration: 220, dampingRatio: 0.8 });
    };

    const handleContinue = async () => {
        if (!allGranted) {
            btnShakeX.value = withSequence(
                withTiming(-8, { duration: 45 }),
                withRepeat(withTiming(8, { duration: 75 }), 4, true),
                withTiming(0, { duration: 45 })
            );
            return;
        }
        if (submitting.current) return;
        submitting.current = true;
        try {
            router.push('/onboarding/timer');
        } finally {
            submitting.current = false;
        }
    };

    if (isInPipMode) {
        return (
            <PipFloatingWidget
                waitingFor={waitingFor}
                onMaximize={() => YudaPip.bringToFront()}
            />
        );
    }

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
                    paddingBottom: Math.max(insets.bottom, 20) + 90 * s,
                }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View className="items-center" style={avatarStyle}>
                    <View
                        className="bg-[#e2e7e1] items-center justify-center"
                        style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
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
                        className="bg-[#e6eae5] rounded-full"
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

                <Animated.View className="items-center mt-[18px]" style={titleStyle}>
                    <Text
                        className="text-[#1f2923] text-center"
                        style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 26 * s, lineHeight: 34 * s }}
                    >
                        Yuk Kenalan! Kendalikan{'\n'}Kendali Waktu &{'\n'}Pikiranmu
                    </Text>
                    <Text
                        className="text-[#415247] text-center px-4"
                        style={{ fontFamily: 'Outfit_500Medium', fontSize: 13.5 * s, lineHeight: 20 * s, marginTop: 10 * s }}
                    >
                        Detoks layar santai tanpa rasa bersalah. Ciptakan ruang bernapas di setiap ketukan jari.
                    </Text>
                </Animated.View>

                <Animated.View
                    className="bg-[#e5ece5]"
                    style={[
                        { borderRadius: 18 * s, padding: 14 * s, marginTop: 22 * s },
                        cardStyle,
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
                                Langkah 1 dari 3: Perizinan Aplikasi
                            </Text>
                        </View>
                        <Text
                            className="text-[#2e6b4e]"
                            style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 16 * s }}
                        >
                            {progressPercent}%
                        </Text>
                    </View>
                    <View
                        className="bg-[#d0dbd2] overflow-hidden"
                        style={{ height: 10 * s, borderRadius: 5 * s, marginTop: 10 * s }}
                    >
                        <Animated.View
                            className="h-full bg-[#2e6b4e] flex-row justify-end items-center pr-0.5"
                            style={[{ borderRadius: 5 * s }, barStyle]}
                        >
                            <View
                                className="bg-[#d8ebe0]"
                                style={{ width: 7 * s, height: 7 * s, borderRadius: 3.5 * s }}
                            />
                        </Animated.View>
                    </View>
                </Animated.View>

                <Animated.View
                    className="bg-[#e5ece5]"
                    style={[
                        { borderRadius: 20 * s, padding: 12 * s, marginTop: 14 * s },
                        mainStyle,
                    ]}
                >
                    <View
                        className="flex-row items-center bg-[#fbfbf9]"
                        style={{ borderRadius: 14 * s, padding: 10 * s }}
                    >
                        <View
                            className="justify-center items-center"
                            style={{ width: 62 * s, height: 56 * s }}
                        >
                            <Image source={yudaHeadSource} className="w-full h-full" resizeMode="contain" />
                        </View>
                        <View className="flex-1 pl-2.5">
                            <Text
                                className="text-[#1f2923]"
                                style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 13 * s, lineHeight: 18 * s }}
                            >
                                {!overlayGranted
                                    ? 'Langkah 1: Ketuk "Tampil di atas aplikasi" — Yuda akan melayang memandu kamu di pengaturan!'
                                    : !batteryGranted
                                        ? 'Keren! Lanjut ke Langkah 2 (Latar belakang) agar Yuda bisa tetap aktif memantau.'
                                        : !notifGranted
                                            ? 'Satu langkah lagi! Aktifkan Langkah 3 (Notifikasi) untuk pengingat santai.'
                                            : 'Yey! Semua izin lengkap. Kamu siap memulai detoks santai bersama Yuda!'}
                            </Text>
                        </View>
                    </View>

                    <PermissionRow
                        icon="layers-outline"
                        label="1. Tampil di atas aplikasi lain"
                        sublabel={
                            overlayGranted
                                ? 'Izin aktif ✓ (Ketuk untuk matikan)'
                                : 'Langkah 1: Ketuk → Yuda melayang & buka pengaturan'
                        }
                        granted={overlayGranted}
                        locked={false}
                        s={s}
                        onPress={handlePressOverlay}
                    />

                    <Animated.View style={lockedStyle}>
                        <PermissionRow
                            icon={batteryGranted ? 'battery-charging-outline' : 'lock-closed-outline'}
                            label="2. Berjalan di latar belakang"
                            sublabel={
                                batteryLocked
                                    ? 'Terkunci: Selesaikan izin ke-1 dahulu'
                                    : batteryGranted
                                        ? 'Izin aktif ✓ (Ketuk untuk matikan)'
                                        : 'Langkah 2: Ketuk → atur izin latar belakang'
                            }
                            granted={batteryGranted}
                            locked={batteryLocked}
                            s={s}
                            onPress={handlePressBattery}
                        />
                        <PermissionRow
                            icon={notifGranted ? 'notifications-outline' : 'lock-closed-outline'}
                            label="3. Mengirimkan notifikasi"
                            sublabel={
                                notifLocked
                                    ? !overlayGranted
                                        ? 'Terkunci: Selesaikan izin ke-1 dahulu'
                                        : 'Terkunci: Selesaikan izin ke-2 dahulu'
                                    : notifGranted
                                        ? 'Izin aktif ✓ (Ketuk untuk matikan)'
                                        : notifUsesDialog
                                            ? 'Langkah 3: Ketuk → izinkan lewat dialog'
                                            : 'Langkah 3: Ketuk → Yuda melayang & buka pengaturan'
                            }
                            granted={notifGranted}
                            locked={notifLocked}
                            s={s}
                            onPress={handlePressNotif}
                        />
                    </Animated.View>
                </Animated.View>
            </ScrollView>

            <View
                className="absolute left-0 right-0 bottom-0 bg-[#f5f3ec] items-center"
                style={{
                    paddingHorizontal: 20 * s,
                    paddingBottom: Math.max(insets.bottom, 20) + 10 * s,
                }}
            >
                <AnimatedPressable
                    className={`w-full items-center justify-center ${allGranted
                        ? 'bg-[#2e6b4e] border-b-[#204d37]'
                        : 'bg-[#a3b7aa] border-b-[#8a9e91] opacity-85'
                        }`}
                    style={[
                        { height: 62 * s, borderRadius: 16 * s, borderBottomWidth: 5 * s },
                        btnStyle,
                    ]}
                    onPressIn={allGranted ? handleBtnPressIn : undefined}
                    onPressOut={allGranted ? handleBtnPressOut : undefined}
                    onPress={handleContinue}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !allGranted }}
                >
                    <Text
                        className={allGranted ? 'text-white' : 'text-[#e2ede5]'}
                        style={{ fontFamily: 'Outfit_700Bold', fontSize: 19 * s }}
                    >
                        {allGranted ? 'Selanjutnya' : `Selesaikan Izin (${grantedCount}/3)`}
                    </Text>
                </AnimatedPressable>
                {!allGranted && (
                    <Text
                        className="text-[#657a6d] text-center mt-1.5"
                        style={{ fontFamily: 'Outfit_500Medium', fontSize: 12 * s }}
                    >
                        {!overlayGranted
                            ? 'Aktifkan izin ke-1 (Tampil di atas aplikasi) terlebih dahulu'
                            : !batteryGranted
                                ? 'Aktifkan izin ke-2 (Berjalan di latar belakang) terlebih dahulu'
                                : 'Aktifkan izin ke-3 (Mengirimkan notifikasi) untuk melanjutkan'}
                    </Text>
                )}
            </View>
        </View>
    );
}

function PermissionRow({
    icon,
    label,
    sublabel,
    granted,
    locked,
    s,
    onPress,
}: {
    icon: string;
    label: string;
    sublabel: string;
    granted: boolean;
    locked: boolean;
    s: number;
    onPress: () => void;
}) {
    return (
        <Pressable
            className={`flex-row items-center justify-between ${locked
                ? 'bg-[#f2f5f1] opacity-65'
                : !granted
                    ? 'bg-[#fbfbf9] border-[1.5px] border-[#2e6b4e]'
                    : 'bg-[#fbfbf9]'
                }`}
            style={{
                borderRadius: 14 * s,
                paddingHorizontal: 14 * s,
                paddingVertical: 12 * s,
                marginTop: 8 * s,
            }}
            onPress={onPress}
        >
            <View className="flex-row items-center flex-1 pr-2">
                <View
                    className={`items-center justify-center ${locked ? 'bg-[#e0e6e1]' : 'bg-[#e8efe9]'
                        }`}
                    style={{ width: 38 * s, height: 38 * s, borderRadius: 10 * s }}
                >
                    <Ionicons
                        name={icon as any}
                        size={20 * s}
                        color={locked ? '#8b9c90' : '#2e6b4e'}
                    />
                </View>
                <View className="flex-1" style={{ marginLeft: 12 * s }}>
                    <Text
                        className={locked ? 'text-[#768579]' : 'text-[#1f2923]'}
                        style={{ fontFamily: 'Outfit_700Bold', fontSize: 14.5 * s }}
                    >
                        {label}
                    </Text>
                    <Text
                        className={
                            granted || !locked
                                ? 'text-[#2e6b4e]'
                                : 'text-[#95a397]'
                        }
                        style={{
                            fontFamily: locked ? 'Outfit_500Medium' : 'Outfit_600SemiBold',
                            fontSize: 12 * s,
                            marginTop: 2,
                        }}
                    >
                        {sublabel}
                    </Text>
                </View>
            </View>
            <CustomToggle value={granted} disabled={locked} s={s} />
        </Pressable>
    );
}