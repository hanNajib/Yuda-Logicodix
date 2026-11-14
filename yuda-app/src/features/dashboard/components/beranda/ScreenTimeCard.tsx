import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';

interface ScreenTimeCardProps {
    scale?: number;
    hours?: number;
    minutes?: number;
    peakHour?: string;
    pausesCount?: number;
    topApp?: string;
    topAppKey?: string;
    topAppTime?: string;
    slots?: Record<string, number | undefined>;
    onViewMore?: () => void;
}

function InstagramBadge({ size = 52 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
                <RadialGradient
                    id="igGrad"
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
                x="5"
                y="5"
                width="90"
                height="90"
                rx="24"
                fill="url(#igGrad)"
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

            <Circle
                cx="66"
                cy="34"
                r="4.5"
                fill="#ffffff"
            />
        </Svg>
    );
}

function TikTokBadge({ size = 52 }: { size?: number }) {
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

function FacebookBadge({ size = 52 }: { size?: number }) {
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

function YouTubeBadge({ size = 52 }: { size?: number }) {
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

function ThreadsBadge({ size = 52 }: { size?: number }) {
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

function XBadge({ size = 52 }: { size?: number }) {
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

function RenderBadge({ appKey, size = 50 }: { appKey?: string; size?: number }) {
    const key = (appKey || 'instagram').toLowerCase();
    if (key.includes('tiktok')) return <TikTokBadge size={size} />;
    if (key.includes('facebook')) return <FacebookBadge size={size} />;
    if (key.includes('youtube')) return <YouTubeBadge size={size} />;
    if (key.includes('threads')) return <ThreadsBadge size={size} />;
    if (key.includes('x') || key.includes('twitter')) return <XBadge size={size} />;
    return <InstagramBadge size={size} />;
}

const SLOT_KEYS = [
    'slot_00_02',
    'slot_02_04',
    'slot_04_06',
    'slot_06_08',
    'slot_08_10',
    'slot_10_12',
    'slot_12_14',
    'slot_14_16',
    'slot_16_18',
    'slot_18_20',
    'slot_20_22',
    'slot_22_00',
];

export function ScreenTimeCard({
    scale = 1,
    hours = 0,
    minutes = 0,
    peakHour = '20:00',
    pausesCount = 0,
    topApp = 'Instagram',
    topAppKey = 'instagram',
    topAppTime = '0 Menit',
    slots = {},
    onViewMore,
}: ScreenTimeCardProps) {
    const s = scale;

    const chartW = 320 * s;
    const chartH = 110 * s;

    const slotValues = React.useMemo(() => {
        return SLOT_KEYS.map((k) => Math.max(0, slots[k] ?? 0));
    }, [slots]);

    const maxSlotValue = React.useMemo(() => {
        return Math.max(1, ...slotValues);
    }, [slotValues]);

    const hasSlotData = React.useMemo(() => slotValues.some((v) => v > 0), [slotValues]);

    const points = React.useMemo(() => {
        const stepX = chartW / (slotValues.length - 1);

        if (!hasSlotData) {
            return slotValues.map((_, idx) => ({
                x: idx * stepX,
                y: chartH * 0.9,
            }));
        }

        return slotValues.map((val, idx) => {
            const x = idx * stepX;
            const normalized = val / maxSlotValue;
            const y = chartH * 0.82 - normalized * (chartH * 0.65);
            return { x, y };
        });
    }, [slotValues, maxSlotValue, hasSlotData, chartW, chartH]);

    const pathLine = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');

    const pathArea = `${pathLine} L ${chartW} ${chartH} L 0 ${chartH} Z`;

    return (
        <View
            className="bg-[#CECECE]/40"
            style={{
                borderRadius: 24 * s,
                padding: 12 * s,
            }}
        >
            <View
                className="bg-white"
                style={{
                    borderRadius: 20 * s,
                    padding: 16 * s,
                    marginBottom: 10 * s,
                }}
            >
                <Text
                    className="mb-3 font-outfit-extrabold text-[#1f2923]"
                    style={{ fontSize: 18 * s }}
                >
                    Waktu Bebas Layar Hari Ini
                </Text>

                <View
                    className="bg-[#E6EDE6]/65"
                    style={{
                        borderRadius: 18 * s,
                        padding: 16 * s,
                    }}
                >
                    <View className="flex-row items-baseline">
                        <Text
                            className="font-outfit-extrabold text-[#275c43]"
                            style={{ fontSize: 46 * s }}
                        >
                            {hours}
                        </Text>

                        <Text
                            className="mr-3 font-outfit-extrabold text-[#1f2923]"
                            style={{ fontSize: 22 * s }}
                        >
                            {' '}Jam
                        </Text>

                        <Text
                            className="font-outfit-extrabold text-[#275c43]"
                            style={{ fontSize: 46 * s }}
                        >
                            {minutes}
                        </Text>

                        <Text
                            className="font-outfit-extrabold text-[#1f2923]"
                            style={{ fontSize: 22 * s }}
                        >
                            {' '}Menit
                        </Text>
                    </View>

                    <Text
                        className="font-outfit-semibold text-[#495a4f]"
                        style={{
                            fontSize: 12 * s,
                            marginTop: 0,
                        }}
                    >
                        Wah kamu mengalami kemajuan dari hari kemarin
                    </Text>
                </View>
            </View>

            <View
                className="flex-row"
                style={{ marginBottom: 10 * s }}
            >
                <View
                    className="flex-1 justify-between bg-[#275c43]"
                    style={{
                        borderRadius: 20 * s,
                        padding: 16 * s,
                        marginRight: 5 * s,
                    }}
                >
                    <Text
                        className="font-outfit-bold text-white"
                        style={{ fontSize: 14 * s }}
                    >
                        Jam Rawan
                    </Text>

                    <Text
                        className="my-1 font-outfit-extrabold text-white"
                        style={{ fontSize: 32 * s }}
                    >
                        {peakHour}
                    </Text>

                    <Text
                        className="font-outfit-medium text-[#d1e4d7]"
                        style={{
                            fontSize: 11 * s,
                            lineHeight: 15 * s,
                        }}
                    >
                        Kamu cenderung doomscroll di malam hari.
                    </Text>
                </View>

                <View
                    className="flex-1 justify-between bg-white"
                    style={{
                        borderRadius: 20 * s,
                        padding: 16 * s,
                        marginLeft: 5 * s,
                    }}
                >
                    <Text
                        className="font-outfit-bold text-[#1f2923]"
                        style={{ fontSize: 14 * s }}
                    >
                        Jeda Hari Ini
                    </Text>

                    <Text
                        className="my-1 font-outfit-extrabold text-[#1f2923]"
                        style={{ fontSize: 32 * s }}
                    >
                        {pausesCount}x
                    </Text>

                    <Text
                        className="font-outfit-medium text-[#495a4f]"
                        style={{
                            fontSize: 11 * s,
                            lineHeight: 15 * s,
                        }}
                    >
                        Kamu sudah mendapat {pausesCount} jeda hari ini.
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
                <View className="mb-3 flex-row items-center justify-between">
                    <Text
                        className="font-outfit-extrabold text-[#1f2923]"
                        style={{ fontSize: 16 * s }}
                    >
                        Jam Terbanyak Aplikasi
                    </Text>

                    <TouchableOpacity
                        className="flex-row items-center"
                        onPress={onViewMore}
                        activeOpacity={0.7}
                    >
                        <Text
                            className="font-outfit-semibold text-[#275c43]"
                            style={{ fontSize: 12 * s }}
                        >
                            Lihat Semua
                        </Text>

                        <Ionicons
                            name="chevron-forward"
                            size={13 * s}
                            color="#275c43"
                            style={{ marginLeft: 2 * s }}
                        />
                    </TouchableOpacity>
                </View>

                <View
                    className="bg-[#E6EDE6]/65"
                    style={{
                        borderRadius: 18 * s,
                        paddingTop: 16 * s,
                    }}
                >
                    <View style={{ height: chartH, overflow: 'hidden' }}>
                        {hasSlotData ? (
                            <Svg
                                width="100%"
                                height={chartH}
                                viewBox={`0 0 ${chartW} ${chartH}`}
                            >
                                <Defs>
                                    <LinearGradient
                                        id="chartGrad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <Stop
                                            offset="0"
                                            stopColor="#2e6b4e"
                                            stopOpacity="0.3"
                                        />

                                        <Stop
                                            offset="1"
                                            stopColor="#2e6b4e"
                                            stopOpacity="0.0"
                                        />
                                    </LinearGradient>
                                </Defs>

                                <Path
                                    d={pathArea}
                                    fill="url(#chartGrad)"
                                />

                                <Path
                                    d={pathLine}
                                    stroke="#2e6b4e"
                                    strokeWidth={2.4 * s}
                                    fill="none"
                                />

                                {points.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x}
                                        cy={point.y}
                                        r={4 * s}
                                        fill="#ffffff"
                                        stroke="#2e6b4e"
                                        strokeWidth={2 * s}
                                    />
                                ))}
                            </Svg>
                        ) : (
                            <View className="flex-1 items-center justify-center">
                                <Text
                                    className="font-outfit-medium text-[#7C828A]"
                                    style={{ fontSize: 12 * s }}
                                >
                                    Belum ada aktivitas scroll hari ini
                                </Text>
                            </View>
                        )}
                    </View>

                    <View
                        className="flex-row items-end justify-between"
                        style={{
                            marginTop: -20,
                            paddingVertical: 12 * s,
                            paddingHorizontal: 12 * s,
                        }}
                    >
                        <View>
                            <Text
                                className="font-outfit-extrabold text-[#1f2923]"
                                style={{ fontSize: 15 * s }}
                            >
                                {topApp}
                            </Text>

                            <Text
                                className="mt-0.5 font-outfit-semibold text-[#495a4f]"
                                style={{ fontSize: 11.5 * s }}
                            >
                                {topAppTime}
                            </Text>
                        </View>

                        <View style={{ marginTop: -14 * s }}>
                            <RenderBadge appKey={topAppKey} size={50 * s} />
                        </View>
                    </View>
                </View>

                <Text
                    className="mt-3 font-outfit-medium text-[#495a4f]"
                    style={{ fontSize: 12 * s }}
                >
                    Diakumulasi sejak pemakaian pertama Yuda.
                </Text>
            </View>
        </View>
    );
}
