import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import Svg, {
    Circle,
    Defs,
    Path,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';

interface AppUsageItem {
    id: string;
    name: 'Instagram' | 'TikTok' | string;
    usageTime: string;
    percentage: number;
    quotaLabel?: string;
}

interface AppUsageSectionProps {
    scale?: number;
    apps?: AppUsageItem[];
}

function InstagramIcon({ size = 44 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
                <RadialGradient
                    id="igPolaGrad"
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
                fill="url(#igPolaGrad)"
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

function TikTokIcon({ size = 44 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center bg-black"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.28,
            }}
        >
            <Svg
                width={size * 0.58}
                height={size * 0.58}
                viewBox="0 0 24 24"
                fill="none"
            >
                <Path
                    d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.888 2.863 2.895 2.895 0 0 1-2.89-2.894 2.895 2.895 0 0 1 2.89-2.893c.338 0 .66.06.96.17V9.45a6.34 6.34 0 0 0-.96-.073A6.335 6.335 0 0 0 3 15.71a6.335 6.335 0 0 0 6.346 6.335 6.336 6.336 0 0 0 6.335-6.335V9.167a8.214 8.214 0 0 0 4.908 1.602V7.324a4.814 4.814 0 0 1-1-.638z"
                    fill="#ffffff"
                />
            </Svg>
        </View>
    );
}

function DonutGauge({
    percentage = 25,
    size = 64,
    strokeWidth = 6.5,
}: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;

    return (
        <View
            className="items-center justify-center"
            style={{
                width: size,
                height: size,
            }}
        >
            <Svg
                width={size}
                height={size}
                style={{ transform: [{ rotate: '-90deg' }] }}
            >
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#d8e5db"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#275c43"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                />
            </Svg>

            <View className="absolute inset-0" pointerEvents="none">
                <View className="flex-1 items-center justify-center">
                    <Text
                        className="font-outfit-extrabold text-[#1c241e]"
                        style={{
                            fontSize: size * 0.24,
                            lineHeight: size * 0.27,
                        }}
                    >
                        {percentage}%
                    </Text>

                    <Text
                        className="font-outfit-semibold text-[#2b362e]"
                        style={{
                            fontSize: size * 0.16,
                            lineHeight: size * 0.18,
                            marginTop: -1,
                        }}
                    >
                        Kuota
                    </Text>
                </View>
            </View>
        </View>
    );
}

const DEFAULT_APPS: AppUsageItem[] = [
    {
        id: 'ig',
        name: 'Instagram',
        usageTime: '1 Jam, 2 Menit',
        percentage: 25,
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        usageTime: '1 Jam, 2 Menit',
        percentage: 25,
    },
];

export function AppUsageSection({
    scale = 1,
    apps = DEFAULT_APPS,
}: AppUsageSectionProps) {
    const s = scale;

    return (
        <View
            className="bg-[#CECECE]/40"
            style={{
                borderRadius: 24 * s,
                padding: 12 * s,
            }}
        >
            <View
                className="flex-row items-center self-start bg-white"
                style={{
                    paddingHorizontal: 12 * s,
                    paddingVertical: 6 * s,
                    borderRadius: 14 * s,
                    marginBottom: 10 * s,
                }}
            >
                <Ionicons
                    name="pie-chart-outline"
                    size={15 * s}
                    color="#275c43"
                    style={{ marginRight: 6 * s }}
                />

                <Text
                    className="font-outfit-bold text-[#275c43]"
                    style={{ fontSize: 13 * s }}
                >
                    Pemakaian Aplikasi Hari Ini
                </Text>
            </View>

            <View style={{ gap: 8 * s }}>
                {apps.map((app) => (
                    <View
                        key={app.id}
                        className="flex-row items-center bg-white"
                        style={{
                            borderRadius: 20 * s,
                            paddingVertical: 14 * s,
                            paddingHorizontal: 16 * s,
                        }}
                    >
                        <View style={{ marginRight: 14 * s }}>
                            {app.name === 'Instagram' ? (
                                <InstagramIcon size={46 * s} />
                            ) : (
                                <TikTokIcon size={46 * s} />
                            )}
                        </View>

                        <View className="flex-1">
                            <Text
                                className="font-outfit-extrabold text-[#1c241e]"
                                style={{ fontSize: 16 * s }}
                            >
                                {app.name}
                            </Text>

                            <Text
                                className="font-outfit-medium text-[#2b362e]"
                                style={{
                                    fontSize: 12.5 * s,
                                    marginTop: 2 * s,
                                }}
                            >
                                {app.usageTime}
                            </Text>
                        </View>

                        <DonutGauge
                            percentage={app.percentage}
                            size={64 * s}
                            strokeWidth={6.5 * s}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
}

