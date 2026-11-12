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
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
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

const REF_W = 420;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

interface AppItem {
    id: string;
    name: string;
    type: 'tiktok' | 'instagram' | 'facebook' | 'youtube' | 'twitter' | 'reddit' | 'game' | 'browser' | 'other';
    iconColor?: string;
    packageName?: string;
    iconUri?: string;
    isCustom?: boolean;
    isInstalled?: boolean;
}

const DEFAULT_APPS: AppItem[] = [
    { id: 'tiktok', name: 'TikTok', type: 'tiktok', packageName: 'com.zhiliaoapp.musically' },
    { id: 'instagram', name: 'Instagram', type: 'instagram', packageName: 'com.instagram.android' },
    { id: 'facebook', name: 'FaceBook', type: 'facebook', packageName: 'com.facebook.katana' },
    { id: 'youtube', name: 'YouTube', type: 'youtube', packageName: 'com.google.android.youtube' },
    { id: 'threads', name: 'Threads', type: 'other', packageName: 'com.instagram.barcelona' },
    { id: 'twitter', name: 'X', type: 'twitter', packageName: 'com.twitter.android' },
];

function AppBrandIcon({ item, size = 38 }: { item: AppItem; size?: number }) {
    if (item.iconUri) {
        return (
            <Image
                source={{ uri: item.iconUri }}
                style={{ width: size, height: size, borderRadius: size * 0.22 }}
                resizeMode="cover"
            />
        );
    }

    if (item.type === 'tiktok') {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.888 2.863 2.895 2.895 0 0 1-2.89-2.894 2.895 2.895 0 0 1 2.89-2.893c.338 0 .66.06.96.17V9.45a6.34 6.34 0 0 0-.96-.073A6.335 6.335 0 0 0 3 15.71a6.335 6.335 0 0 0 6.346 6.335 6.336 6.336 0 0 0 6.335-6.335V9.167a8.214 8.214 0 0 0 4.908 1.602V7.324a4.814 4.814 0 0 1-1-.638z"
                    fill="#111827"
                />
            </Svg>
        );
    }

    if (item.type === 'instagram') {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="2" width="20" height="20" rx="5.5" stroke="#E1306C" strokeWidth="2.2" />
                <Circle cx="12" cy="12" r="4.2" stroke="#E1306C" strokeWidth="2.2" />
                <Circle cx="17.6" cy="6.4" r="1.2" fill="#E1306C" />
            </Svg>
        );
    }

    if (item.type === 'facebook') {
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

    if (item.type === 'youtube') {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="5" width="20" height="14" rx="4" fill="#FF0000" />
                <Path d="M10 8.5l5 3.5-5 3.5V8.5z" fill="#FFFFFF" />
            </Svg>
        );
    }

    if (item.type === 'twitter') {
        return <Ionicons name="logo-twitter" size={size} color="#1DA1F2" />;
    }

    if (item.type === 'reddit') {
        return <Ionicons name="logo-reddit" size={size} color="#FF4500" />;
    }

    if (item.type === 'game') {
        return <Ionicons name="game-controller" size={size} color="#6366f1" />;
    }

    if (item.type === 'browser') {
        return <Ionicons name="globe-outline" size={size} color="#0284c7" />;
    }

    return <Ionicons name="apps-outline" size={size * 0.85} color="#2e6b4e" />;
}

function AppGridCard({
    item,
    isSelected,
    onPress,
    s = 1,
}: {
    item: AppItem;
    isSelected: boolean;
    onPress: () => void;
    s?: number;
}) {
    const scale = useSharedValue(1);
    const disabled = item.isInstalled === false;

    const handlePressIn = () => {
        if (disabled) return;
        scale.value = withTiming(0.95, { duration: 90, easing: EASE_OUT });
    };

    const handlePressOut = () => {
        if (disabled) return;
        scale.value = withSpring(1, { duration: 250, dampingRatio: 0.75 });
    };

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            className={`w-[48.5%] items-center border-[1.5px] shadow-sm elevation-2 ${
                disabled
                    ? 'border-[#e2e8e3] bg-[#f0f3f1] opacity-55'
                    : isSelected
                    ? 'border-[#2e6b4e] bg-[#f4faf5]'
                    : 'border-[#e5e7eb] bg-white'
            }`}
            style={[
                { borderRadius: 16 * s, padding: 10 * s },
                cardAnimatedStyle,
            ]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
            <View
                className={`w-full items-center justify-center relative ${disabled ? 'bg-[#dce3de]' : 'bg-[#e7ede7]'}`}
                style={{ borderRadius: 12 * s, height: 76 * s }}
            >
                <AppBrandIcon item={item} size={36 * s} />

                {disabled ? (
                    <View
                        className="absolute top-2 right-2 items-center justify-center bg-[#a6b4aa]"
                        style={{ width: 22 * s, height: 22 * s, borderRadius: 6 * s }}
                    >
                        <Ionicons name="close" size={13 * s} color="#ffffff" />
                    </View>
                ) : (
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
                )}
            </View>

            <Text
                className={`text-center px-1 ${disabled ? 'text-[#87968c]' : 'text-[#1f2923]'}`}
                style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 13.5 * s, marginTop: 8 * s }}
                numberOfLines={1}
            >
                {item.name}
            </Text>

            {disabled && (
                <Text
                    className="text-center text-[#8e9d93] text-[10px]"
                    style={{ fontFamily: 'Outfit_500Medium', marginTop: 1 }}
                    numberOfLines={1}
                >
                    Belum Terinstall
                </Text>
            )}
        </AnimatedPressable>
    );
}

export default function SelectAppsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: W } = useWindowDimensions();
    const reducedMotion = useReducedMotion();

    const { user, userName, selectedTargetPackages, setSelectedTargetPackages } = useAuthStore();
    const displayName = userName || user?.name || 'Gathan';
    const initialLetter = (displayName[0] || 'G').toUpperCase();

    const [selectedIds, setSelectedIds] = useState<string[]>([
        'tiktok',
        'instagram',
        'facebook',
        'youtube',
    ]);
    const [installedApps, setInstalledApps] = useState<AppItem[]>([]);
    const [isLoadingApps, setIsLoadingApps] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [customAppName, setCustomAppName] = useState('');
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

        async function loadInstalled() {
            try {
                if (Platform.OS === 'android' && YudaPip.isNativeModuleAvailable()) {
                    const apps = await YudaPip.getInstalledApps(true);
                    if (!isMounted) return;

                    if (apps && apps.length > 0) {
                        const mapped: AppItem[] = apps.map((app) => {
                            const pkg = app.packageName.toLowerCase();
                            let type: AppItem['type'] = 'other';
                            if (pkg.includes('tiktok') || pkg.includes('musically')) type = 'tiktok';
                            else if (pkg.includes('instagram')) type = 'instagram';
                            else if (pkg.includes('facebook') || pkg.includes('katana')) type = 'facebook';
                            else if (pkg.includes('youtube')) type = 'youtube';
                            else if (pkg.includes('twitter')) type = 'twitter';
                            else if (pkg.includes('reddit')) type = 'reddit';
                            else if (pkg.includes('game') || pkg.includes('mobilelegends') || pkg.includes('pubg') || pkg.includes('freefire') || pkg.includes('roblox')) type = 'game';
                            else if (pkg.includes('chrome') || pkg.includes('browser')) type = 'browser';

                            return {
                                id: app.packageName,
                                name: app.appName,
                                type,
                                packageName: app.packageName,
                                iconUri: app.iconUri,
                                isInstalled: true,
                            };
                        });

                        setInstalledApps(mapped);

                        const installedPkgs = new Set(apps.map((x) => x.packageName.toLowerCase()));
                        const installedNames = apps.map((x) => x.appName.toLowerCase());

                        const isPkgInstalled = (pkgName?: string) => {
                            if (!pkgName) return false;
                            const p = pkgName.toLowerCase();
                            return installedPkgs.has(p) || Array.from(installedPkgs).some((x) => x.includes(p));
                        };

                        const isNameMatches = (name: string) => {
                            const n = name.toLowerCase();
                            return installedNames.some((x) => x.includes(n));
                        };

                        if (selectedTargetPackages && selectedTargetPackages.length > 0) {
                            const matchingIds: string[] = [];
                            DEFAULT_APPS.forEach((d) => {
                                if (d.packageName && selectedTargetPackages.includes(d.packageName)) {
                                    matchingIds.push(d.id);
                                }
                            });
                            selectedTargetPackages.forEach((pkg) => {
                                if (!DEFAULT_APPS.some((d) => d.packageName === pkg)) {
                                    matchingIds.push(pkg);
                                }
                            });
                            if (matchingIds.length > 0) {
                                setSelectedIds(Array.from(new Set(matchingIds)));
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn('Gagal membaca installed apps:', e);
            } finally {
                if (isMounted) setIsLoadingApps(false);
            }
        }

        loadInstalled();
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

    const defaultAppsWithStatus = useMemo(() => {
        const installedPkgSet = new Set(installedApps.map((x) => x.packageName?.toLowerCase() ?? ''));
        const installedNameList = installedApps.map((x) => x.name.toLowerCase());

        return DEFAULT_APPS.map((d) => {
            const p = d.packageName?.toLowerCase() ?? '';
            const matchingApp = installedApps.find(
                (x) => (x.packageName && x.packageName.toLowerCase().includes(p)) || x.name.toLowerCase() === d.name.toLowerCase()
            );

            const isInstalled = matchingApp
                ? true
                : installedPkgSet.has(p) || installedNameList.some((n) => n.includes(d.name.toLowerCase()));

            return {
                ...d,
                iconUri: matchingApp?.iconUri,
                isInstalled,
            };
        });
    }, [installedApps]);

    const displayMainApps = useMemo(() => {
        const extraSelected = installedApps.filter(
            (a) => selectedIds.includes(a.id) && !DEFAULT_APPS.some((d) => d.id === a.id || d.packageName === a.packageName)
        );
        return [...defaultAppsWithStatus, ...extraSelected];
    }, [defaultAppsWithStatus, installedApps, selectedIds]);

    const toggleApp = (id: string, isInstalled?: boolean) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((x) => x !== id);
            }
            return [...prev, id];
        });
    };

    const handleAddCustomApp = () => {
        const trimmed = customAppName.trim();
        if (!trimmed) return;

        const newId = `custom_${Date.now()}`;
        const newApp: AppItem = {
            id: newId,
            name: trimmed,
            type: 'other',
            isCustom: true,
            isInstalled: true,
        };

        setInstalledApps((prev) => [newApp, ...prev]);
        setSelectedIds((prev) => [...prev, newId]);
        setCustomAppName('');
    };

    const filteredInstalledApps = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return installedApps;
        return installedApps.filter((a) => a.name.toLowerCase().includes(q) || a.packageName?.toLowerCase().includes(q));
    }, [installedApps, searchQuery]);

    const handleContinue = () => {
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
            selectedIds.forEach((id) => {
                if (id === 'tiktok') {
                    packages.push('com.zhiliaoapp.musically', 'com.ss.android.ugc.trill');
                } else if (id === 'instagram') {
                    packages.push('com.instagram.android');
                } else if (id === 'facebook') {
                    packages.push('com.facebook.katana', 'com.facebook.lite');
                } else if (id === 'youtube') {
                    packages.push('com.google.android.youtube');
                } else if (id === 'threads') {
                    packages.push('com.instagram.barcelona');
                } else if (id === 'twitter') {
                    packages.push('com.twitter.android', 'com.twitter.android.lite');
                } else {
                    const found = installedApps.find((a) => a.id === id);
                    if (found?.packageName) {
                        packages.push(found.packageName);
                    } else if (id.includes('.')) {
                        packages.push(id);
                    }
                }
            });

            const uniquePackages = Array.from(new Set(packages));
            setSelectedTargetPackages(uniquePackages);
            YudaPip.setTargetPackages(uniquePackages);

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
                            Pilih jebakan digital yang sering bikin lupa waktu.
                        </Text>

                        <View
                            className="self-start bg-[#dce8de] rounded-xl"
                            style={{ marginTop: 10 * s, paddingHorizontal: 12 * s, paddingVertical: 4.5 * s }}
                        >
                            <Text
                                className="text-[#24593f]"
                                style={{ fontFamily: 'Outfit_700Bold', fontSize: 12 * s }}
                            >
                                {selectedIds.length} Aplikasi Dipilih
                            </Text>
                        </View>
                    </View>

                    <View
                        className="flex-row flex-wrap justify-between"
                        style={{ marginTop: 10 * s, rowGap: 10 }}
                    >
                        {displayMainApps.map((item) => {
                            const isSelected = selectedIds.includes(item.id);
                            return (
                                <AppGridCard
                                    key={item.id}
                                    item={item}
                                    isSelected={isSelected}
                                    onPress={() => toggleApp(item.id, item.isInstalled)}
                                    s={s}
                                />
                            );
                        })}
                    </View>

                    <TouchableOpacity
                        className="flex-row items-center justify-between bg-[#fbfbf9]"
                        style={[
                            { borderRadius: 16 * s, paddingHorizontal: 14 * s, paddingVertical: 12 * s, marginTop: 12 * s },
                        ]}
                        activeOpacity={0.85}
                        onPress={() => setIsModalOpen(true)}
                    >
                        <View className="flex-row items-center flex-1">
                            <View
                                className="items-center justify-center bg-[#e1ebe2]"
                                style={{ width: 38 * s, height: 38 * s, borderRadius: 10 * s }}
                            >
                                <Ionicons name="apps-outline" size={22 * s} color="#2e6b4e" />
                            </View>
                            <View style={{ marginLeft: 12 * s, flex: 1 }}>
                                <Text
                                    className="text-[#1f2923]"
                                    style={{ fontFamily: 'Outfit_800ExtraBold', fontSize: 14.5 * s }}
                                >
                                    Pilih Aplikasi Lainnya
                                </Text>
                                <Text
                                    className="text-[#6c7f73]"
                                    style={{ fontFamily: 'Outfit_500Medium', fontSize: 11.5 * s, marginTop: 1 }}
                                    numberOfLines={1}
                                >
                                    {isLoadingApps
                                        ? 'Sedang memuat aplikasi HP...'
                                        : installedApps.length > 0
                                        ? `${installedApps.length} aplikasi terinstall di HP`
                                        : 'Buka daftar aplikasi terinstall'}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={19 * s} color="#6d7f72" />
                    </TouchableOpacity>
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

            <Modal
                visible={isModalOpen}
                animationType="slide"
                transparent
                onRequestClose={() => setIsModalOpen(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View
                        className="bg-[#fbfbf9] rounded-t-[28px]"
                        style={{ height: '86%', paddingBottom: Math.max(insets.bottom, 20) }}
                    >
                        <View className="flex-row items-start justify-between px-5 pt-5 pb-3">
                            <View className="flex-1 pr-2.5">
                                <Text
                                    className="text-[#1f2923] text-[19px]"
                                    style={{ fontFamily: 'Outfit_800ExtraBold' }}
                                >
                                    Pilih Dari Aplikasi Terinstall
                                </Text>
                                <Text
                                    className="text-[#64748b] text-[12.5px] mt-0.5"
                                    style={{ fontFamily: 'Outfit_500Medium' }}
                                >
                                    {installedApps.length > 0
                                        ? `${installedApps.length} aplikasi terdeteksi di HP kamu`
                                        : 'Daftar semua aplikasi di HP kamu'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                className="w-[34px] h-[34px] rounded-full bg-[#edf2ee] items-center justify-center"
                                onPress={() => setIsModalOpen(false)}
                            >
                                <Ionicons name="close" size={22} color="#4b5563" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center bg-[#edf2ee] mx-5 rounded-xl px-3 h-11 mt-1">
                            <Ionicons name="search-outline" size={19} color="#6b7280" style={{ marginRight: 8 }} />
                            <TextInput
                                className="flex-1 text-[#1f2923] text-sm py-0"
                                style={{ fontFamily: 'Outfit_500Medium' }}
                                placeholder="Cari nama aplikasi..."
                                placeholderTextColor="#9ca3af"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCorrect={false}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={17} color="#9ca3af" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className="flex-row items-center mx-5 mt-2.5 mb-2 gap-2">
                            <TextInput
                                className="flex-1 bg-[#edf2ee] h-[42px] rounded-xl px-3 text-[#1f2923] text-[13.5px] py-0"
                                style={{ fontFamily: 'Outfit_500Medium' }}
                                placeholder="Ketik nama aplikasi lainnya..."
                                placeholderTextColor="#9ca3af"
                                value={customAppName}
                                onChangeText={setCustomAppName}
                            />
                            <TouchableOpacity
                                className={`h-[42px] px-3.5 rounded-xl flex-row items-center justify-center ${
                                    !customAppName.trim() ? 'bg-[#9ab3a3]' : 'bg-[#2e6b4e]'
                                }`}
                                disabled={!customAppName.trim()}
                                onPress={handleAddCustomApp}
                            >
                                <Ionicons name="add" size={18} color="#ffffff" style={{ marginRight: 4 }} />
                                <Text
                                    className="text-white text-[13px]"
                                    style={{ fontFamily: 'Outfit_700Bold' }}
                                >
                                    Tambah
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {isLoadingApps ? (
                            <View className="flex-1 items-center justify-center py-10">
                                <ActivityIndicator size="large" color="#2e6b4e" />
                                <Text
                                    className="text-[#64748b] text-sm mt-3"
                                    style={{ fontFamily: 'Outfit_500Medium' }}
                                >
                                    Membaca aplikasi terinstall...
                                </Text>
                            </View>
                        ) : filteredInstalledApps.length === 0 ? (
                            <View className="flex-1 items-center justify-center py-10 px-5">
                                <Ionicons name="search-outline" size={36} color="#9ca3af" />
                                <Text
                                    className="text-[#374151] text-base mt-2.5"
                                    style={{ fontFamily: 'Outfit_700Bold' }}
                                >
                                    Tidak ditemukan
                                </Text>
                                <Text
                                    className="text-[#6b7280] text-[13px] text-center mt-1"
                                    style={{ fontFamily: 'Outfit_500Medium' }}
                                >
                                    Tidak ada aplikasi terinstall yang cocok dengan pencarian
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredInstalledApps}
                                keyExtractor={(item) => item.id}
                                numColumns={2}
                                columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}
                                renderItem={({ item }) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    return (
                                        <AppGridCard
                                            item={item}
                                            isSelected={isSelected}
                                            onPress={() => toggleApp(item.id, item.isInstalled)}
                                            s={s}
                                        />
                                    );
                                }}
                            />
                        )}

                        <View className="px-5 pt-2.5">
                            <TouchableOpacity
                                className="bg-[#2e6b4e] h-[52px] rounded-[14px] items-center justify-center"
                                activeOpacity={0.88}
                                onPress={() => setIsModalOpen(false)}
                            >
                                <Text
                                    className="text-white text-base"
                                    style={{ fontFamily: 'Outfit_700Bold' }}
                                >
                                    Simpan Pilihan ({selectedIds.length})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
