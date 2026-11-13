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
import { useEffect, useRef, useState } from 'react';
import {
    Image,
    Modal,
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
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useAuthStore } from '@/stores/useAuthStore';
import YudaPip from '../../../../modules/yuda-pip';
import { DOOMSCROLL_APPS, DoomscrollAppDefinition } from '@/constants/apps';

const REF_W = 420;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

function AppBrandIcon({
    id,
    iconUri,
    size = 38,
}: {
    id: string;
    iconUri?: string;
    size?: number;
}) {
    if (iconUri) {
        return (
            <Image
                source={{ uri: iconUri }}
                style={{ width: size, height: size, borderRadius: size * 0.22 }}
                resizeMode="cover"
            />
        );
    }

    if (id === 'tiktok') {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.888 2.863 2.895 2.895 0 0 1-2.89-2.894 2.895 2.895 0 0 1 2.89-2.893c.338 0 .66.06.96.17V9.45a6.34 6.34 0 0 0-.96-.073A6.335 6.335 0 0 0 3 15.71a6.335 6.335 0 0 0 6.346 6.335 6.336 6.336 0 0 0 6.335-6.335V9.167a8.214 8.214 0 0 0 4.908 1.602V7.324a4.814 4.814 0 0 1-1-.638z"
                    fill="#111827"
                />
            </Svg>
        );
    }

    if (id === 'instagram') {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="2" width="20" height="20" rx="5.5" stroke="#E1306C" strokeWidth="2.2" />
                <Circle cx="12" cy="12" r="4.2" stroke="#E1306C" strokeWidth="2.2" />
                <Circle cx="17.6" cy="6.4" r="1.2" fill="#E1306C" />
            </Svg>
        );
    }

    if (id === 'facebook') {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="11" fill="#1877F2" />
                <Path
                    d="M15.2 12.3h-2.1v7.6H10v-7.6H8.5V9.7H10V8.1c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.4h2.2l-.5 2.6z"
                    fill="#FFFFFF"
                />
            </Svg>
        );
    }

    if (id === 'youtube') {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="5" width="20" height="14" rx="4" fill="#FF0000" />
                <Path d="M10 8.5l5 3.5-5 3.5V8.5z" fill="#FFFFFF" />
            </Svg>
        );
    }

    if (id === 'twitter') {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                    fill="#111827"
                />
            </Svg>
        );
    }

    if (id === 'threads') {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.923 11.22c-.12 2.24-1.464 3.633-3.805 3.633-2.616 0-4.148-1.854-4.148-4.636 0-3.088 1.77-4.808 4.316-4.808 2.378 0 3.738 1.488 3.864 3.493h-1.637c-.11-1.16-.867-1.922-2.227-1.922-1.644 0-2.627 1.156-2.627 3.237 0 2.012.983 3.064 2.457 3.064 1.474 0 2.148-.823 2.258-2.061H12v-1.554h3.923v1.554z"
                    fill="#111827"
                />
            </Svg>
        );
    }

    return <Ionicons name="apps-outline" size={size * 0.85} color="#2e6b4e" />;
}

function AppGridCard({
    item,
    isSelected,
    mode,
    iconUri,
    onPress,
    onOpenSettings,
    s = 1,
}: {
    item: DoomscrollAppDefinition;
    isSelected: boolean;
    mode: 'all' | 'trigger_only';
    iconUri?: string;
    onPress: () => void;
    onOpenSettings: () => void;
    s?: number;
}) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withTiming(0.95, { duration: 90, easing: EASE_OUT });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { duration: 250, dampingRatio: 0.75 });
    };

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            className={`w-[48.5%] items-center border-[1.5px] shadow-sm elevation-2 ${
                isSelected
                    ? 'border-[#2e6b4e] bg-[#f4faf5]'
                    : 'border-[#e5e7eb] bg-white'
            }`}
            style={[
                { borderRadius: 16 * s, padding: 10 * s },
                cardAnimatedStyle,
            ]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
            <View
                className="w-full items-center justify-center relative bg-[#e7ede7]"
                style={{ borderRadius: 12 * s, height: 76 * s }}
            >
                <AppBrandIcon id={item.id} iconUri={iconUri} size={42 * s} />

                {/* Tombol Pengaturan Mode Deteksi */}
                <TouchableOpacity
                    className="absolute top-2 left-2 items-center justify-center bg-white/85 shadow-sm"
                    style={{ width: 24 * s, height: 24 * s, borderRadius: 7 * s }}
                    onPress={(e) => {
                        e.stopPropagation();
                        onOpenSettings();
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name="options-outline" size={15 * s} color="#275c43" />
                </TouchableOpacity>

                {/* Indikator Checkmark */}
                <View
                    className={`absolute top-2 right-2 items-center justify-center ${
                        isSelected ? 'bg-[#2e6b4e]' : 'bg-[#c5d1c8]'
                    }`}
                    style={{ width: 22 * s, height: 22 * s, borderRadius: 6 * s }}
                >
                    {isSelected && (
                        <Ionicons name="checkmark" size={14 * s} color="#ffffff" />
                    )}
                </View>
            </View>

            <Text
                className="text-center px-1 text-[#1f2923]"
                style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 13.5 * s, marginTop: 8 * s }}
                numberOfLines={1}
            >
                {item.name}
            </Text>

            <Text
                className="text-center text-[#526458]"
                style={{ fontFamily: 'Outfit_500Medium', fontSize: 10.5 * s, marginTop: 2 * s }}
                numberOfLines={1}
            >
                {mode === 'all' ? 'Deteksi Seluruh App' : `Fitur: ${item.triggerFeatureName}`}
            </Text>
        </AnimatedPressable>
    );
}

export default function SelectAppsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: W } = useWindowDimensions();
    const reducedMotion = useReducedMotion();

    const {
        user,
        userName,
        selectedTargetPackages,
        appDetectionModes,
        setSelectedTargetPackages,
        setAppDetectionMode,
    } = useAuthStore();
    const displayName = userName || user?.name || 'Gathan';
    const initialLetter = (displayName[0] || 'G').toUpperCase();

    const [selectedIds, setSelectedIds] = useState<string[]>([
        'instagram',
        'facebook',
        'threads',
        'youtube',
        'twitter',
        'tiktok',
    ]);

    const [appIcons, setAppIcons] = useState<Record<string, string>>({});
    const [activeConfigApp, setActiveConfigApp] = useState<DoomscrollAppDefinition | null>(null);

    const submitting = useRef(false);

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
    const progressCardFade = useSharedValue(0);
    const progressCardY = useSharedValue(20);
    const mainCardFade = useSharedValue(0);
    const mainCardY = useSharedValue(30);
    const btnScale = useSharedValue(1);
    const btnY = useSharedValue(0);
    const btnShakeX = useSharedValue(0);

    useEffect(() => {
        let isMounted = true;

        async function fetchNativeIcons() {
            if (Platform.OS === 'android' && YudaPip.isNativeModuleAvailable()) {
                const loadedIcons: Record<string, string> = {};
                for (const app of DOOMSCROLL_APPS) {
                    for (const pkg of app.packages) {
                        try {
                            const icon = await YudaPip.getAppIcon(pkg);
                            if (icon) {
                                loadedIcons[app.id] = icon;
                                break;
                            }
                        } catch {
                            // ignore
                        }
                    }
                }
                if (isMounted) {
                    setAppIcons(loadedIcons);
                }
            }
        }

        fetchNativeIcons();

        if (selectedTargetPackages && selectedTargetPackages.length > 0) {
            const active: string[] = [];
            DOOMSCROLL_APPS.forEach((app) => {
                const isSelected = app.packages.some((pkg) => selectedTargetPackages.includes(pkg));
                if (isSelected) {
                    active.push(app.id);
                }
            });
            if (active.length > 0) {
                setSelectedIds(active);
            }
        }

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!fontsLoaded) return;
        if (reducedMotion) {
            avatarFade.value = 1;
            avatarY.value = 0;
            titleFade.value = 1;
            titleY.value = 0;
            progressCardFade.value = 1;
            progressCardY.value = 0;
            mainCardFade.value = 1;
            mainCardY.value = 0;
            return;
        }

        avatarFade.value = withTiming(1, { duration: 400 });
        avatarY.value = withTiming(0, { duration: 450, easing: EASE_OUT });
        titleFade.value = withDelay(80, withTiming(1, { duration: 400 }));
        titleY.value = withDelay(80, withSpring(0, { duration: 480, dampingRatio: 0.8 }));
        progressCardFade.value = withDelay(160, withTiming(1, { duration: 350 }));
        progressCardY.value = withDelay(160, withSpring(0, { duration: 500, dampingRatio: 0.82 }));
        mainCardFade.value = withDelay(220, withTiming(1, { duration: 400 }));
        mainCardY.value = withDelay(220, withSpring(0, { duration: 520, dampingRatio: 0.82 }));
    }, [fontsLoaded, reducedMotion]);

    const avatarAnimatedStyle = useAnimatedStyle(() => ({
        opacity: avatarFade.value,
        transform: [{ translateY: avatarY.value }],
    }));

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: titleFade.value,
        transform: [{ translateY: titleY.value }],
    }));

    const progressCardAnimatedStyle = useAnimatedStyle(() => ({
        opacity: progressCardFade.value,
        transform: [{ translateY: progressCardY.value }],
    }));

    const mainCardAnimatedStyle = useAnimatedStyle(() => ({
        opacity: mainCardFade.value,
        transform: [{ translateY: mainCardY.value }],
    }));

    const btnAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: btnY.value },
            { scale: btnScale.value },
            { translateX: btnShakeX.value },
        ],
    }));

    const toggleApp = (id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((x) => x !== id);
            }
            return [...prev, id];
        });
    };

    const handleSelectDetectionMode = async (mode: 'all' | 'trigger_only') => {
        if (!activeConfigApp) return;

        const appId = activeConfigApp.id;
        await setAppDetectionMode(appId, mode);
        setActiveConfigApp(null);
    };

    const handleContinue = async () => {
        if (selectedIds.length === 0) {
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
            const packages: string[] = [];
            DOOMSCROLL_APPS.forEach((app) => {
                if (selectedIds.includes(app.id)) {
                    packages.push(...app.packages);
                }
            });

            const uniquePackages = Array.from(new Set(packages));
            await setSelectedTargetPackages(uniquePackages);

            router.push('/onboarding/welcome' as any);
        } finally {
            submitting.current = false;
        }
    };

    const handleBtnPressIn = () => {
        btnScale.value = withTiming(0.96, { duration: 90, easing: EASE_OUT });
        btnY.value = withTiming(2.5, { duration: 90, easing: EASE_OUT });
    };

    const handleBtnPressOut = () => {
        btnScale.value = withSpring(1, { duration: 220, dampingRatio: 0.8 });
        btnY.value = withSpring(0, { duration: 220, dampingRatio: 0.8 });
    };

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
                    paddingBottom: Math.max(insets.bottom, 20) + 96 * s,
                }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View className="items-center" style={avatarAnimatedStyle}>
                    <View
                        className="items-center justify-center bg-[#e2e7e1]"
                        style={{
                            width: avatarSize,
                            height: avatarSize,
                            borderRadius: avatarSize / 2,
                        }}
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
                        className="rounded-full bg-[#e6eae5]"
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

                <Animated.View className="items-center mt-[18px]" style={titleAnimatedStyle}>
                    <Text
                        className="text-center text-[#1f2923]"
                        style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 26 * s, lineHeight: 34 * s }}
                    >
                        Yuk Kenalan! Kendalikan{'\n'}Kendali Waktu &{'\n'}Pikiranmu
                    </Text>
                    <Text
                        className="text-center text-[#415247] px-4"
                        style={{ fontFamily: 'Outfit_500Medium', fontSize: 13.5 * s, lineHeight: 20 * s, marginTop: 10 * s }}
                    >
                        Detoks layar santai tanpa rasa bersalah. Ciptakan ruang bernapas di setiap ketukan jari.
                    </Text>
                </Animated.View>

                <Animated.View
                    className="bg-[#e5ece5]"
                    style={[
                        { borderRadius: 18 * s, padding: 14 * s, marginTop: 22 * s },
                        progressCardAnimatedStyle,
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
                                Langkah 2 dari 3: Pilih Aplikasi
                            </Text>
                        </View>
                        <Text
                            className="text-[#2e6b4e]"
                            style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 16 * s }}
                        >
                            66%
                        </Text>
                    </View>

                    <View
                        className="overflow-hidden bg-[#d0dbd2]"
                        style={{ height: 10 * s, borderRadius: 5 * s, marginTop: 10 * s }}
                    >
                        <View
                            className="h-full w-[66%] flex-row items-center justify-end bg-[#2e6b4e] pr-0.5"
                            style={{ borderRadius: 5 * s }}
                        >
                            <View
                                className="bg-[#d8ebe0]"
                                style={{ width: 7 * s, height: 7 * s, borderRadius: 3.5 * s }}
                            />
                        </View>
                    </View>
                </Animated.View>

                <Animated.View
                    className="bg-[#e5ece5]"
                    style={[
                        { borderRadius: 20 * s, padding: 12 * s, marginTop: 14 * s },
                        mainCardAnimatedStyle,
                    ]}
                >
                    <View
                        className="bg-[#fbfbf9]"
                        style={{ borderRadius: 14 * s, padding: 16 * s }}
                    >
                        <Text
                            className="text-[#1f2923]"
                            style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 16.5 * s }}
                        >
                            Aplikasi Pemicu Doomscrolling
                        </Text>
                        <Text
                            className="text-[#516457]"
                            style={{ fontFamily: 'Outfit_500Medium', fontSize: 13 * s, lineHeight: 18 * s, marginTop: 4 * s }}
                        >
                            Pilih aplikasi pemicu scroll yang ingin dipantau oleh YUDA.
                        </Text>

                        <View
                            className="self-start bg-[#dce8de] rounded-xl"
                            style={{ marginTop: 10 * s, paddingHorizontal: 12 * s, paddingVertical: 4.5 * s }}
                        >
                            <Text
                                className="text-[#24593f]"
                                style={{ fontFamily: 'Outfit_700Bold', fontSize: 12 * s }}
                            >
                                {selectedIds.length} dari 6 Aplikasi Dipilih
                            </Text>
                        </View>
                    </View>

                    <View
                        className="flex-row flex-wrap justify-between"
                        style={{ marginTop: 10 * s, rowGap: 10 }}
                    >
                        {DOOMSCROLL_APPS.map((item) => {
                            const isSelected = selectedIds.includes(item.id);
                            const mode = appDetectionModes[item.id] || 'trigger_only';
                            const iconUri = appIcons[item.id];

                            return (
                                <AppGridCard
                                    key={item.id}
                                    item={item}
                                    isSelected={isSelected}
                                    mode={mode}
                                    iconUri={iconUri}
                                    onPress={() => toggleApp(item.id)}
                                    onOpenSettings={() => setActiveConfigApp(item)}
                                    s={s}
                                />
                            );
                        })}
                    </View>
                </Animated.View>
            </ScrollView>

            <View
                className="absolute bottom-0 left-0 right-0 items-center bg-[#f5f3ec]"
                style={{
                    paddingHorizontal: 20 * s,
                    paddingBottom: Math.max(insets.bottom, 20) + 10 * s,
                }}
            >
                <AnimatedPressable
                    className={`w-full items-center justify-center ${
                        selectedIds.length > 0
                            ? 'bg-[#2e6b4e] border-b-[#204d37]'
                            : 'bg-[#a3b7aa] border-b-[#8a9e91] opacity-85'
                    }`}
                    style={[
                        {
                            height: 62 * s,
                            borderRadius: 16 * s,
                            borderBottomWidth: 5 * s,
                        },
                        btnAnimatedStyle,
                    ]}
                    onPressIn={selectedIds.length > 0 ? handleBtnPressIn : undefined}
                    onPressOut={selectedIds.length > 0 ? handleBtnPressOut : undefined}
                    onPress={handleContinue}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                >
                    <Text
                        className={selectedIds.length === 0 ? 'text-[#e2ede5]' : 'text-white'}
                        style={{ fontFamily: 'Outfit_700Bold', fontSize: 19 * s }}
                    >
                        Selanjutnya
                    </Text>
                </AnimatedPressable>

                {selectedIds.length === 0 && (
                    <Text
                        className="text-center text-[#657a6d] mt-1.5"
                        style={{ fontFamily: 'Outfit_500Medium', fontSize: 12 * s }}
                    >
                        Pilih minimal 1 aplikasi untuk didetoks
                    </Text>
                )}
            </View>

            {/* MODAL PENGATURAN MODE DETEKSI PER APLIKASI */}
            <Modal
                visible={!!activeConfigApp}
                animationType="fade"
                transparent
                onRequestClose={() => setActiveConfigApp(null)}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-center items-center"
                    style={{ paddingHorizontal: 20 * s }}
                    onPress={() => setActiveConfigApp(null)}
                >
                    <Pressable
                        className="w-full bg-[#f6f3ec] rounded-3xl"
                        style={{ padding: 20 * s, maxWidth: 380 * s }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className="flex-row items-center justify-between" style={{ marginBottom: 14 * s }}>
                            <View className="flex-row items-center flex-1">
                                {activeConfigApp && (
                                    <AppBrandIcon
                                        id={activeConfigApp.id}
                                        iconUri={appIcons[activeConfigApp.id]}
                                        size={32 * s}
                                    />
                                )}
                                <Text
                                    className="font-outfit-extrabold text-[#1f2923]"
                                    style={{ fontSize: 17 * s, marginLeft: 10 * s }}
                                >
                                    Mode Deteksi {activeConfigApp?.name}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setActiveConfigApp(null)}
                                style={{
                                    width: 32 * s,
                                    height: 32 * s,
                                    borderRadius: 16 * s,
                                    backgroundColor: '#e6ede6',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons name="close" size={18 * s} color="#275c43" />
                            </TouchableOpacity>
                        </View>

                        <Text
                            className="font-outfit-medium text-[#55685d]"
                            style={{ fontSize: 12.5 * s, marginBottom: 16 * s }}
                        >
                            Tentukan kapan YUDA akan menghitung durasi waktu dan memunculkan jeda intervensi pada {activeConfigApp?.name}:
                        </Text>

                        {/* Opsi 1: Hanya Fitur Pemicu Doomscroll */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleSelectDetectionMode('trigger_only')}
                            className={`p-3.5 rounded-2xl border-2 mb-3 ${
                                activeConfigApp &&
                                (appDetectionModes[activeConfigApp.id] || 'trigger_only') === 'trigger_only'
                                    ? 'border-[#2e6b4e] bg-[#eef5f0]'
                                    : 'border-gray-200 bg-white'
                            }`}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1 pr-2">
                                    <View
                                        className="w-8 h-8 rounded-full items-center justify-center bg-[#dce8de]"
                                        style={{ marginRight: 10 * s }}
                                    >
                                        <Ionicons name="flash-outline" size={17 * s} color="#2e6b4e" />
                                    </View>
                                    <View className="flex-1">
                                        <Text
                                            className="font-outfit-bold text-[#1f2923]"
                                            style={{ fontSize: 14 * s }}
                                        >
                                            Hanya Fitur Pemicu ({activeConfigApp?.triggerFeatureName})
                                        </Text>
                                        <Text
                                            className="font-outfit-medium text-[#64748b]"
                                            style={{ fontSize: 11 * s, marginTop: 2 * s }}
                                        >
                                            Hanya mendeteksi saat membuka Reels, Shorts, atau feed scroll cepat.
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                                        activeConfigApp &&
                                        (appDetectionModes[activeConfigApp.id] || 'trigger_only') === 'trigger_only'
                                            ? 'border-[#2e6b4e] bg-[#2e6b4e]'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    {activeConfigApp &&
                                        (appDetectionModes[activeConfigApp.id] || 'trigger_only') === 'trigger_only' && (
                                            <Ionicons name="checkmark" size={12 * s} color="#ffffff" />
                                        )}
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Opsi 2: Keseluruhan Aplikasi */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleSelectDetectionMode('all')}
                            className={`p-3.5 rounded-2xl border-2 ${
                                activeConfigApp && appDetectionModes[activeConfigApp.id] === 'all'
                                    ? 'border-[#2e6b4e] bg-[#eef5f0]'
                                    : 'border-gray-200 bg-white'
                            }`}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1 pr-2">
                                    <View
                                        className="w-8 h-8 rounded-full items-center justify-center bg-[#dce8de]"
                                        style={{ marginRight: 10 * s }}
                                    >
                                        <Ionicons name="scan-outline" size={17 * s} color="#2e6b4e" />
                                    </View>
                                    <View className="flex-1">
                                        <Text
                                            className="font-outfit-bold text-[#1f2923]"
                                            style={{ fontSize: 14 * s }}
                                        >
                                            Deteksi Secara Keseluruhan
                                        </Text>
                                        <Text
                                            className="font-outfit-medium text-[#64748b]"
                                            style={{ fontSize: 11 * s, marginTop: 2 * s }}
                                        >
                                            Mendeteksi sepanjang aplikasi sedang dibuka di layar HP.
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                                        activeConfigApp && appDetectionModes[activeConfigApp.id] === 'all'
                                            ? 'border-[#2e6b4e] bg-[#2e6b4e]'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    {activeConfigApp && appDetectionModes[activeConfigApp.id] === 'all' && (
                                        <Ionicons name="checkmark" size={12 * s} color="#ffffff" />
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
