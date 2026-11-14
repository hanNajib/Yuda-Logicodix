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

export interface AppUsageItem {
    id: string;
    name: 'Instagram' | 'TikTok' | 'Facebook' | 'Threads' | 'YouTube' | 'X (Twitter)' | string;
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

function FacebookIcon({ size = 44 }: { size?: number }) {
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

function YouTubeIcon({ size = 44 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center bg-white"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.28,
            }}
        >
            <Ionicons
                name="logo-youtube"
                size={size * 0.85}
                color="#ff0000"
            />
        </View>
    );
}

function ThreadsIcon({ size = 44 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center bg-[#111827]"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.28,
            }}
        >
            <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.923 11.22c-.12 2.24-1.464 3.633-3.805 3.633-2.616 0-4.148-1.854-4.148-4.636 0-3.088 1.77-4.808 4.316-4.808 2.378 0 3.738 1.488 3.864 3.493h-1.637c-.11-1.16-.867-1.922-2.227-1.922-1.644 0-2.627 1.156-2.627 3.237 0 2.012.983 3.064 2.457 3.064 1.474 0 2.148-.823 2.258-2.061H12v-1.554h3.923v1.554z"
                    fill="#ffffff"
                />
            </Svg>
        </View>
    );
}

function XIcon({ size = 44 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center bg-[#111827]"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.28,
            }}
        >
            <Svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                    fill="#ffffff"
                />
            </Svg>
        </View>
    );
}

function RenderPolaAppIcon({ appName, size = 44 }: { appName: string; size?: number }) {
    const lower = appName.toLowerCase();
    if (lower.includes('instagram')) return <InstagramIcon size={size} />;
    if (lower.includes('tiktok')) return <TikTokIcon size={size} />;
    if (lower.includes('facebook')) return <FacebookIcon size={size} />;
    if (lower.includes('youtube')) return <YouTubeIcon size={size} />;
    if (lower.includes('threads')) return <ThreadsIcon size={size} />;
    if (lower.includes('x') || lower.includes('twitter')) return <XIcon size={size} />;
    return <InstagramIcon size={size} />;
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
    const clamped = Math.min(100, Math.max(0, percentage));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * clamped) / 100;

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
                        {clamped}%
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

export function AppUsageSection({
    scale = 1,
    apps = [],
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
                {apps.length === 0 ? (
                    <View
                        className="items-center justify-center bg-white"
                        style={{
                            borderRadius: 18 * s,
                            paddingVertical: 20 * s,
                            paddingHorizontal: 16 * s,
                        }}
                    >
                        <Text
                            className="font-outfit-medium text-[#7a8a7e]"
                            style={{ fontSize: 13 * s }}
                        >
                            Belum ada pemakaian aplikasi hari ini.
                        </Text>
                    </View>
                ) : (
                    apps.map((app) => (
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
                                <RenderPolaAppIcon appName={app.name} size={46 * s} />
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
                    ))
                )}
            </View>
        </View>
    );
}
