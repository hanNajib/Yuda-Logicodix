import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
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

interface AppDoomscrollItem {
    id: string;
    name: string;
    isActive: boolean;
}

interface PengaturanDasarCardProps {
    scale?: number;
    hours?: number;
    minutes?: number;
    onEditInterval?: () => void;
    onManageMoreApps?: () => void;
    onConfigureApp?: (appId: string) => void;
    onToggleApp?: (appId: string, isActive: boolean) => void;
    initialApps?: AppDoomscrollItem[];
}

const DEFAULT_APPS: AppDoomscrollItem[] = [
    { id: 'ig', name: 'Instagram', isActive: true },
    { id: 'tiktok', name: 'TikTok', isActive: true },
    { id: 'fb', name: 'Facebook', isActive: true },
    { id: 'yt', name: 'YouTube', isActive: true },
];

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
            className="items-center justify-center"
            style={{
                width: size,
                height: size,
            }}
        >
            <Svg
                width={size * 0.85}
                height={size * 0.85}
                viewBox="0 0 24 24"
                fill="none"
            >
                <Path
                    d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.888 2.863 2.895 2.895 0 0 1-2.89-2.894 2.895 2.895 0 0 1 2.89-2.893c.338 0 .66.06.96.17V9.45a6.34 6.34 0 0 0-.96-.073A6.335 6.335 0 0 0 3 15.71a6.335 6.335 0 0 0 6.346 6.335 6.336 6.336 0 0 0 6.335-6.335V9.167a8.214 8.214 0 0 0 4.908 1.602V7.324a4.814 4.814 0 0 1-1-.638z"
                    fill="#1c241e"
                />
            </Svg>
        </View>
    );
}

function FacebookLogo({ size = 34 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center"
            style={{
                width: size,
                height: size,
            }}
        >
            <Ionicons
                name="logo-facebook"
                size={size}
                color="#1877f2"
            />
        </View>
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

export function PengaturanDasarCard({
    scale = 1,
    hours = 0,
    minutes = 15,
    onEditInterval,
    onManageMoreApps,
    onConfigureApp,
    onToggleApp,
    initialApps = DEFAULT_APPS,
}: PengaturanDasarCardProps) {
    const s = scale;

    const [apps, setApps] = useState<AppDoomscrollItem[]>(initialApps);

    const toggleApp = (id: string) => {
        setApps((prev) =>
            prev.map((app) => {
                if (app.id !== id) return app;

                const newActive = !app.isActive;

                onToggleApp?.(id, newActive);

                return {
                    ...app,
                    isActive: newActive,
                };
            })
        );
    };

    const renderLogo = (name: string) => {
        switch (name) {
            case 'Instagram':
                return <InstagramLogo size={34 * s} />;

            case 'TikTok':
                return <TikTokLogo size={34 * s} />;

            case 'Facebook':
                return <FacebookLogo size={34 * s} />;

            case 'YouTube':
                return <YouTubeLogo size={34 * s} />;

            default:
                return (
                    <Ionicons
                        name="apps-outline"
                        size={30 * s}
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
                    marginBottom: 10 * s,
                }}
            >
                <View className="flex-row items-center justify-between">
                    <Text
                        className="flex-shrink font-outfit-extrabold text-[#1c241e]"
                        style={{
                            fontSize: 16 * s,
                        }}
                    >
                        Jeda Scrolling
                    </Text>

                    <TouchableOpacity
                        className="flex-row flex-shrink-0 items-center justify-center bg-[#275c43]"
                        style={{
                            borderRadius: 20 * s,
                            paddingHorizontal: 14 * s,
                            paddingVertical: 7 * s,
                        }}
                        onPress={onEditInterval}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="create-outline"
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
                            Edit Waktu Jeda
                        </Text>
                    </TouchableOpacity>
                </View>

                <View
                    className="mt-3 bg-[#E6EDE6]/65"
                    style={{
                        borderRadius: 16 * s,
                        padding: 14 * s,
                    }}
                >
                    <View className="flex-row items-baseline">
                        <Text
                            className="font-outfit-extrabold text-[#275c43]"
                            style={{
                                fontSize: 62 * s,
                            }}
                        >
                            {hours}
                        </Text>

                        <Text
                            className="mr-3 font-outfit-extrabold text-[#1c241e]"
                            style={{
                                fontSize: 21 * s,
                            }}
                        >
                            Jam
                        </Text>

                        <Text
                            className="font-outfit-extrabold text-[#275c43]"
                            style={{
                                fontSize: 62 * s,
                            }}
                        >
                            {minutes}
                        </Text>

                        <Text
                            className="font-outfit-extrabold text-[#1c241e]"
                            style={{
                                fontSize: 21 * s,
                            }}
                        >
                            Menit
                        </Text>
                    </View>

                    <Text
                        className="font-outfit-semibold text-[#3d4d42]"
                        style={{
                            fontSize: 12 * s,
                            marginTop: 0,
                        }}
                    >
                        Saat doomscroll kamu akan dijeda setiap{' '}
                        {minutes} menit.
                    </Text>
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
                        Aplikasi Doomscroll
                    </Text>

                    <TouchableOpacity
                        className="flex-row flex-shrink-0 items-center justify-center bg-[#275c43]"
                        style={{
                            borderRadius: 20 * s,
                            paddingHorizontal: 14 * s,
                            paddingVertical: 7 * s,
                        }}
                        onPress={onManageMoreApps}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="apps-outline"
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
                            Aplikasi Lainnya
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 12 * s }}>
                    {apps.map((item, index) => (
                        <View
                            key={item.id}
                            className="flex-row items-center bg-[#E6EDE6]/65"
                            style={{
                                borderRadius: 15 * s,
                                paddingVertical: 10 * s,
                                paddingHorizontal: 12 * s,
                                marginBottom:
                                    index === apps.length - 1
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
                                {renderLogo(item.name)}
                            </View>

                            <Text
                                className="flex-1 font-outfit-extrabold text-[#1c241e]"
                                style={{
                                    fontSize: 15.5 * s,
                                }}
                                numberOfLines={1}
                            >
                                {item.name}
                            </Text>

                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    style={{
                                        padding: 5 * s,
                                        marginRight: 5 * s,
                                    }}
                                    onPress={() =>
                                        onConfigureApp?.(item.id)
                                    }
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name="options-outline"
                                        size={23 * s}
                                        color="#275c43"
                                    />
                                </TouchableOpacity>

                                <Pressable
                                    className="items-center justify-center border-2 border-[#275c43]"
                                    style={{
                                        width: 35 * s,
                                        height: 35 * s,
                                        borderRadius: 9 * s,
                                        backgroundColor: item.isActive
                                            ? '#275c43'
                                            : '#ffffff',
                                    }}
                                    onPress={() => toggleApp(item.id)}
                                >
                                    {item.isActive && (
                                        <Ionicons
                                            name="checkmark"
                                            size={20 * s}
                                            color="#ffffff"
                                        />
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}
