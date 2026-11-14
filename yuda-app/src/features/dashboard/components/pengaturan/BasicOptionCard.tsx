import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Modal,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Svg, {
    Circle,
    Defs,
    Path,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';
import { DOOMSCROLL_APPS, DoomscrollAppDefinition } from '@/constants/apps';
import { useAuthStore } from '@/stores/useAuthStore';
import YudaPip from '@/modules/yuda-pip';

const yudaKebalikSource = require('@/assets/images/yuda/yuda-terbalik-tangan.png');

interface PengaturanDasarCardProps {
    scale?: number;
    minutes?: number;
    onEditInterval?: () => void;
}

function InstagramLogo({ size = 34 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
                <RadialGradient
                    id="igSettingsGrad"
                    cx="25%"
                    cy="105%"
                    r="125%"
                    gradientUnits="userSpaceOnUse"
                >
                    <Stop offset="0%" stopColor="#fdf497" />
                    <Stop offset="5%" stopColor="#fdf497" />
                    <Stop offset="45%" stopColor="#fd5949" />
                    <Stop offset="60%" stopColor="#d6249f" />
                    <Stop offset="90%" stopColor="#285AEB" />
                </RadialGradient>
            </Defs>

            <Rect
                x="6"
                y="6"
                width="88"
                height="88"
                rx="22"
                fill="url(#igSettingsGrad)"
            />

            <Rect
                x="22"
                y="22"
                width="56"
                height="56"
                rx="16"
                stroke="#ffffff"
                strokeWidth="7"
                fill="none"
            />

            <Circle
                cx="50"
                cy="50"
                r="14"
                stroke="#ffffff"
                strokeWidth="7"
                fill="none"
            />

            <Circle cx="66" cy="34" r="4.5" fill="#ffffff" />
        </Svg>
    );
}

function TikTokLogo({ size = 34 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center bg-[#111827]"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.22,
            }}
        >
            <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.888 2.863 2.895 2.895 0 0 1-2.89-2.894 2.895 2.895 0 0 1 2.89-2.893c.338 0 .66.06.96.17V9.45a6.34 6.34 0 0 0-.96-.073A6.335 6.335 0 0 0 3 15.71a6.335 6.335 0 0 0 6.346 6.335 6.336 6.336 0 0 0 6.335-6.335V9.167a8.214 8.214 0 0 0 4.908 1.602V7.324a4.814 4.814 0 0 1-1-.638z"
                    fill="#ffffff"
                />
            </Svg>
        </View>
    );
}

function FacebookLogo({ size = 34 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="50" fill="#1877f2" />
            <Path
                d="M62 52.8h-8.8V85H40V52.8H34V42.2h6V35c0-8.2 5-12.8 12.4-12.8 3.6 0 7.3.6 7.3.6v8h-4.2c-4.1 0-5.5 2.6-5.5 5.2v6.2h9.2l-1.2 10.6z"
                fill="#ffffff"
            />
        </Svg>
    );
}

function YouTubeLogo({ size = 34 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center"
            style={{
                width: size,
                height: size,
            }}
        >
            <Ionicons
                name="logo-youtube"
                size={size}
                color="#ff0000"
            />
        </View>
    );
}

function ThreadsLogo({ size = 34 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center bg-[#111827]"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.22,
            }}
        >
            <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.923 11.22c-.12 2.24-1.464 3.633-3.805 3.633-2.616 0-4.148-1.854-4.148-4.636 0-3.088 1.77-4.808 4.316-4.808 2.378 0 3.738 1.488 3.864 3.493h-1.637c-.11-1.16-.867-1.922-2.227-1.922-1.644 0-2.627 1.156-2.627 3.237 0 2.012.983 3.064 2.457 3.064 1.474 0 2.148-.823 2.258-2.061H12v-1.554h3.923v1.554z"
                    fill="#ffffff"
                />
            </Svg>
        </View>
    );
}

function XLogo({ size = 34 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center bg-[#111827]"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.22,
            }}
        >
            <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                    fill="#ffffff"
                />
            </Svg>
        </View>
    );
}

export function PengaturanDasarCard({
    scale = 1,
    minutes = 15,
    onEditInterval,
}: PengaturanDasarCardProps) {
    const s = scale;
    const {
        selectedTargetPackages,
        appDetectionModes,
        setSelectedTargetPackages,
        setAppDetectionMode,
    } = useAuthStore();

    const [appIcons, setAppIcons] = useState<Record<string, string>>({});
    const [activeConfigApp, setActiveConfigApp] = useState<DoomscrollAppDefinition | null>(null);

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

        return () => {
            isMounted = false;
        };
    }, []);

    const toggleApp = async (app: DoomscrollAppDefinition) => {
        const isCurrentlyActive = app.packages.some((pkg) => selectedTargetPackages.includes(pkg));

        let updatedPackages: string[];
        if (isCurrentlyActive) {
            updatedPackages = selectedTargetPackages.filter((pkg) => !app.packages.includes(pkg));
        } else {
            updatedPackages = Array.from(new Set([...selectedTargetPackages, ...app.packages]));
        }

        await setSelectedTargetPackages(updatedPackages);
    };

    const handleSelectDetectionMode = async (mode: 'all' | 'trigger_only') => {
        if (!activeConfigApp) return;

        const appId = activeConfigApp.id;
        await setAppDetectionMode(appId, mode);
        setActiveConfigApp(null);
    };

    const renderLogo = (id: string, iconSize = 34 * s) => {
        const uri = appIcons[id];
        if (uri) {
            return (
                <Image
                    source={{ uri }}
                    style={{
                        width: iconSize,
                        height: iconSize,
                        borderRadius: iconSize * 0.22,
                    }}
                    resizeMode="cover"
                />
            );
        }

        switch (id) {
            case 'instagram':
                return <InstagramLogo size={iconSize} />;
            case 'tiktok':
                return <TikTokLogo size={iconSize} />;
            case 'facebook':
                return <FacebookLogo size={iconSize} />;
            case 'youtube':
                return <YouTubeLogo size={iconSize} />;
            case 'threads':
                return <ThreadsLogo size={iconSize} />;
            case 'twitter':
                return <XLogo size={iconSize} />;
            default:
                return (
                    <Ionicons
                        name="apps-outline"
                        size={iconSize * 0.85}
                        color="#275c43"
                    />
                );
        }
    };

    return (
        <View
            className="relative bg-[rgba(206,206,206,0.4)]"
            style={{
                borderRadius: 24 * s,
                padding: 12 * s,
            }}
        >
            <View
                className="flex-row items-center self-start bg-white"
                style={{
                    paddingHorizontal: 14 * s,
                    paddingVertical: 6 * s,
                    borderRadius: 20 * s,
                    marginBottom: 10 * s,
                }}
            >
                <Ionicons
                    name="settings-sharp"
                    size={15 * s}
                    color="#275c43"
                    style={{
                        marginRight: 7 * s,
                    }}
                />

                <Text
                    className="font-outfit-bold text-[#1c241e]"
                    style={{
                        fontSize: 13 * s,
                    }}
                >
                    Opsi Dasar Yuda
                </Text>
            </View>

            <View
                className="mb-[10px] bg-white"
                style={{
                    borderRadius: 20 * s,
                    padding: 16 * s,
                }}
            >
                <View className="flex-row items-center justify-between">
                    <Text
                        className="font-outfit-extrabold text-[#1c241e]"
                        style={{
                            fontSize: 16 * s,
                        }}
                    >
                        Waktu Jeda Doomscroll
                    </Text>

                    <TouchableOpacity
                        className="flex-row items-center justify-center bg-[#275c43]"
                        style={{
                            borderRadius: 20 * s,
                            paddingHorizontal: 14 * s,
                            paddingVertical: 7 * s,
                        }}
                        onPress={onEditInterval}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="time-outline"
                            size={15 * s}
                            color="#ffffff"
                            style={{
                                marginRight: 5 * s,
                            }}
                        />

                        <Text
                            className="font-outfit-bold text-white"
                            style={{
                                fontSize: 12 * s,
                            }}
                        >
                            Atur Jeda
                        </Text>
                    </TouchableOpacity>
                </View>

                <View
                    className="mt-3 bg-[#E6EDE6]/65 flex-row items-center justify-between"
                    style={{
                        borderRadius: 16 * s,
                        paddingTop: 14 * s,
                        paddingBottom: 14 * s,
                        paddingLeft: 18 * s,
                        paddingRight: 84 * s,
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: 100 * s,
                    }}
                >
                    <View className="flex-1 pr-1 z-10">
                        <View className="flex-row items-baseline">
                            <Text
                                className="font-outfit-extrabold text-[#275c43]"
                                style={{
                                    fontSize: 64 * s,
                                    lineHeight: 70 * s,
                                }}
                            >
                                {minutes}
                            </Text>

                            <Text
                                className="ml-2 font-outfit-extrabold text-[#1c241e]"
                                style={{
                                    fontSize: 22 * s,
                                }}
                            >
                                Menit
                            </Text>
                        </View>

                        <Text
                            className="font-outfit-semibold text-[#3d4d42]"
                            style={{
                                fontSize: 12 * s,
                                marginTop: 4 * s,
                            }}
                        >
                            Saat doomscroll kamu akan dijeda setiap {minutes} menit.
                        </Text>
                    </View>

                    <Image
                        source={yudaKebalikSource}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 8 * s,
                            width: 90 * s,
                            height: 90 * s,
                        }}
                        resizeMode="contain"
                    />
                </View>
            </View>

            <View
                className="bg-white"
                style={{
                    borderRadius: 20 * s,
                    padding: 16 * s,
                }}
            >
                <View className="flex-row items-center justify-between">
                    <Text
                        className="flex-shrink font-outfit-extrabold text-[#1c241e]"
                        style={{
                            fontSize: 16 * s,
                        }}
                    >
                        Aplikasi Doomscroll (6 Aplikasi)
                    </Text>
                </View>

                <View style={{ marginTop: 12 * s }}>
                    {DOOMSCROLL_APPS.map((item, index) => {
                        const isActive = item.packages.some((pkg) => selectedTargetPackages.includes(pkg));
                        const currentMode = appDetectionModes[item.id] || 'trigger_only';

                        return (
                            <View
                                key={item.id}
                                className="flex-row items-center bg-[#E6EDE6]/65"
                                style={{
                                    borderRadius: 15 * s,
                                    paddingVertical: 10 * s,
                                    paddingHorizontal: 12 * s,
                                    marginBottom:
                                        index === DOOMSCROLL_APPS.length - 1
                                            ? 0
                                            : 8 * s,
                                }}
                            >
                                <View
                                    className="mr-3 items-center justify-center"
                                    style={{
                                        width: 34 * s,
                                        height: 34 * s,
                                    }}
                                >
                                    {renderLogo(item.id, 34 * s)}
                                </View>

                                <View className="flex-1 pr-2">
                                    <Text
                                        className="font-outfit-extrabold text-[#1c241e]"
                                        style={{
                                            fontSize: 15.5 * s,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {item.name}
                                    </Text>
                                    <Text
                                        className="font-outfit-medium text-[#5c6e61]"
                                        style={{
                                            fontSize: 11 * s,
                                            marginTop: 1 * s,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {currentMode === 'all'
                                            ? 'Mode: Deteksi Keseluruhan'
                                            : `Mode: ${item.triggerFeatureName}`}
                                    </Text>
                                </View>

                                <View className="flex-row items-center">
                                    {/* Tombol Pengaturan Mode Deteksi */}
                                    <TouchableOpacity
                                        style={{
                                            padding: 6 * s,
                                            marginRight: 6 * s,
                                            borderRadius: 8 * s,
                                            backgroundColor: '#ffffff',
                                        }}
                                        onPress={() => setActiveConfigApp(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name="options-outline"
                                            size={20 * s}
                                            color="#275c43"
                                        />
                                    </TouchableOpacity>

                                    {/* Checkbox Centang / Uncentang */}
                                    <Pressable
                                        className="items-center justify-center border-2 border-[#275c43]"
                                        style={{
                                            width: 35 * s,
                                            height: 35 * s,
                                            borderRadius: 9 * s,
                                            backgroundColor: isActive
                                                ? '#275c43'
                                                : '#ffffff',
                                        }}
                                        onPress={() => toggleApp(item)}
                                    >
                                        {isActive && (
                                            <Ionicons
                                                name="checkmark"
                                                size={20 * s}
                                                color="#ffffff"
                                            />
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })}
                </View>
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
                                {activeConfigApp && renderLogo(activeConfigApp.id, 32 * s)}
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
