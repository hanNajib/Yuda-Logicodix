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
    topAppTime?: string;
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

export function ScreenTimeCard({
    scale = 1,
    hours = 15,
    minutes = 45,
    peakHour = '20:00',
    pausesCount = 3,
    topApp = 'Instagram',
    topAppTime = '43 Jam 15 Menit',
    onViewMore,
}: ScreenTimeCardProps) {
    const s = scale;

    const chartW = 320 * s;
    const chartH = 110 * s;

    const points = [
        { x: 0, y: chartH * 0.65 },
        { x: chartW * 0.25, y: chartH * 0.82 },
        { x: chartW * 0.48, y: chartH * 0.22 },
        { x: chartW * 0.72, y: chartH * 0.75 },
        { x: chartW, y: chartH * 0.12 },
    ];

    const pathLine =
        `M ${points[0].x} ${points[0].y} ` +
        `L ${points[1].x} ${points[1].y} ` +
        `L ${points[2].x} ${points[2].y} ` +
        `L ${points[3].x} ${points[3].y} ` +
        `L ${points[4].x} ${points[4].y}`;

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
                    Waktu Bebas Layar
                </Text>

                <View
                    className="bg-[#E6EDE6]/65"
                    style={{
                        borderRadius: 16 * s,
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
                            <InstagramBadge size={50 * s} />
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