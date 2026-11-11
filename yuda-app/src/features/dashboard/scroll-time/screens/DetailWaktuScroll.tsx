import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';

interface DetailWaktuScrollProps {
    scale?: number;
}

interface CalendarDay {
    dayNumber: number;
    isCurrentMonth: boolean;
    statusDot?: 'green' | 'yellow' | 'red';
}

interface AppUsageItem {
    id: string;
    name: 'Instagram' | 'TikTok' | string;
    usageTime: string;
    percentage: number;
}

const DAYS_HEADER = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const CALENDAR_ROWS: CalendarDay[][] = [
    [
        { dayNumber: 28, isCurrentMonth: false },
        { dayNumber: 1, isCurrentMonth: true },
        { dayNumber: 2, isCurrentMonth: true },
        { dayNumber: 3, isCurrentMonth: true },
        { dayNumber: 4, isCurrentMonth: true },
        { dayNumber: 5, isCurrentMonth: true },
        { dayNumber: 6, isCurrentMonth: true },
    ],
    [
        { dayNumber: 7, isCurrentMonth: true },
        { dayNumber: 8, isCurrentMonth: true },
        { dayNumber: 9, isCurrentMonth: true, statusDot: 'yellow' },
        { dayNumber: 10, isCurrentMonth: true, statusDot: 'green' },
        { dayNumber: 11, isCurrentMonth: true, statusDot: 'red' },
        { dayNumber: 12, isCurrentMonth: true, statusDot: 'green' },
        { dayNumber: 13, isCurrentMonth: true },
    ],
    [
        { dayNumber: 14, isCurrentMonth: true },
        { dayNumber: 15, isCurrentMonth: true, statusDot: 'green' },
        { dayNumber: 16, isCurrentMonth: true },
        { dayNumber: 17, isCurrentMonth: true },
        { dayNumber: 18, isCurrentMonth: true, statusDot: 'yellow' },
        { dayNumber: 19, isCurrentMonth: true },
        { dayNumber: 20, isCurrentMonth: true },
    ],
    [
        { dayNumber: 21, isCurrentMonth: true },
        { dayNumber: 22, isCurrentMonth: true },
        { dayNumber: 23, isCurrentMonth: true },
        { dayNumber: 24, isCurrentMonth: true, statusDot: 'green' },
        { dayNumber: 25, isCurrentMonth: true },
        { dayNumber: 26, isCurrentMonth: true },
        { dayNumber: 27, isCurrentMonth: true },
    ],
    [
        { dayNumber: 28, isCurrentMonth: true },
        { dayNumber: 29, isCurrentMonth: true },
        { dayNumber: 30, isCurrentMonth: true },
        { dayNumber: 31, isCurrentMonth: true },
        { dayNumber: 1, isCurrentMonth: false },
        { dayNumber: 2, isCurrentMonth: false },
        { dayNumber: 3, isCurrentMonth: false },
    ],
];

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

function CalendarMiniCard({
    scale = 1,
    selectedDate,
    onSelectDate,
}: {
    scale?: number;
    selectedDate: number;
    onSelectDate: (date: number) => void;
}) {
    const s = scale;
    const circleSize = 32 * s;

    const getDotColor = (type?: 'green' | 'yellow' | 'red') => {
        if (type === 'green') return '#275c43';
        if (type === 'yellow') return '#f5b838';
        if (type === 'red') return '#e85a4f';
        return 'transparent';
    };

    const handleDatePress = (item: CalendarDay) => {
        if (!item.isCurrentMonth) return;
        onSelectDate(item.dayNumber);
    };

    return (
        <View
            className="bg-white"
            style={{
                borderRadius: 20 * s,
                padding: 18 * s,
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 2,
            }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Text
                        className="font-outfit-extrabold text-[#275c43]"
                        style={{ fontSize: 16 * s }}
                    >
                        {selectedDate} Mar, 2025
                    </Text>

                    <View
                        style={{
                            paddingHorizontal: 10 * s,
                            paddingVertical: 4 * s,
                            borderRadius: 10 * s,
                            marginLeft: 8 * s,
                            backgroundColor: 'rgba(230, 237, 230, 0.75)',
                        }}
                    >
                        <Text
                            className="font-outfit-bold text-[#275c43]"
                            style={{ fontSize: 11.5 * s }}
                        >
                            Rabu
                        </Text>
                    </View>
                </View>

                <View
                    className="flex-row items-center"
                    style={{
                        paddingHorizontal: 10 * s,
                        paddingVertical: 5 * s,
                        borderRadius: 12 * s,
                        backgroundColor: 'rgba(230, 237, 230, 0.75)',
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={0.7}
                        hitSlop={{
                            top: 8,
                            bottom: 8,
                            left: 8,
                            right: 8,
                        }}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={13 * s}
                            color="#275c43"
                        />
                    </TouchableOpacity>

                    <Text
                        className="font-outfit-bold text-[#275c43]"
                        style={{
                            fontSize: 12 * s,
                            marginHorizontal: 8 * s,
                        }}
                    >
                        Maret
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        hitSlop={{
                            top: 8,
                            bottom: 8,
                            left: 8,
                            right: 8,
                        }}
                    >
                        <Ionicons
                            name="chevron-forward"
                            size={13 * s}
                            color="#275c43"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View
                className="flex-row items-center justify-between"
                style={{
                    marginTop: 16 * s,
                    marginBottom: 8 * s,
                }}
            >
                {DAYS_HEADER.map((dayName) => (
                    <View
                        key={dayName}
                        className="flex-1 items-center justify-center"
                    >
                        <Text
                            className="font-outfit-bold text-[#292d35]"
                            style={{ fontSize: 12 * s }}
                        >
                            {dayName}
                        </Text>
                    </View>
                ))}
            </View>

            {CALENDAR_ROWS.map((row, rowIndex) => (
                <View
                    key={rowIndex}
                    className="flex-row items-center justify-between"
                    style={{ marginVertical: 3 * s }}
                >
                    {row.map((dayItem, dayIndex) => {
                        const isSelected =
                            dayItem.isCurrentMonth &&
                            dayItem.dayNumber === selectedDate;

                        return (
                            <Pressable
                                key={dayIndex}
                                className="flex-1 items-center justify-center"
                                onPress={() => handleDatePress(dayItem)}
                            >
                                <View
                                    className="items-center justify-center self-center overflow-hidden"
                                    style={{
                                        width: circleSize,
                                        height: circleSize,
                                        borderRadius: circleSize / 2,
                                        backgroundColor: isSelected
                                            ? '#275c43'
                                            : 'transparent',
                                    }}
                                >
                                    <Text
                                        className="text-center"
                                        style={{
                                            fontSize: 13 * s,
                                            color: isSelected
                                                ? '#ffffff'
                                                : !dayItem.isCurrentMonth
                                                    ? '#a8b8ac'
                                                    : '#1c241e',
                                            fontFamily:
                                                isSelected || dayItem.isCurrentMonth
                                                    ? 'Outfit_700Bold'
                                                    : 'Outfit_500Medium',
                                        }}
                                    >
                                        {dayItem.dayNumber}
                                    </Text>
                                </View>

                                {dayItem.statusDot ? (
                                    <View
                                        style={{
                                            backgroundColor: isSelected
                                                ? '#275c43'
                                                : getDotColor(dayItem.statusDot),
                                            width: 4 * s,
                                            height: 4 * s,
                                            borderRadius: 2 * s,
                                            marginTop: 2 * s,
                                        }}
                                    />
                                ) : (
                                    <View style={{ height: 6 * s }} />
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

function ScrollTimeChartCard({
    scale = 1,
    hours = 3,
    minutes = 15,
}: {
    scale?: number;
    hours?: number;
    minutes?: number;
}) {
    const s = scale;
    const chartWidth = 300 * s;
    const chartHeight = 105 * s;

    const points = [
        { x: 0, y: chartHeight * 0.42 },
        { x: chartWidth * 0.2, y: chartHeight * 0.8 },
        { x: chartWidth * 0.4, y: chartHeight * 0.2 },
        { x: chartWidth * 0.6, y: chartHeight * 0.7 },
        { x: chartWidth * 0.8, y: chartHeight * 0.62 },
        { x: chartWidth, y: chartHeight * 0.05 },
    ];

    const chartLine = points
        .map((point, index) => {
            return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
        })
        .join(' ');

    const chartArea = `${chartLine} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    return (
        <View
            className="bg-white"
            style={{
                borderRadius: 18 * s,
                padding: 12 * s,
            }}
        >
            <Text
                className="font-outfit-extrabold text-[#292d35]"
                style={{
                    fontSize: 18 * s,
                    marginBottom: 6 * s,
                }}
            >
                Detail Waktu Scroll
            </Text>

            <View
                className="overflow-hidden bg-[#e6ede6]/75"
                style={{
                    borderRadius: 12 * s,
                    paddingTop: 8 * s,
                }}
            >
                <View
                    className="flex-row items-baseline"
                    style={{
                        paddingHorizontal: 14 * s,
                        marginBottom: 2 * s,
                    }}
                >
                    <Text
                        className="font-outfit-extrabold text-[#2e6b4e]"
                        style={{ fontSize: 48 * s }}
                    >
                        {hours}
                    </Text>

                    <Text
                        className="font-outfit-extrabold text-[#292d35]"
                        style={{
                            fontSize: 19 * s,
                            marginLeft: 5 * s,
                            marginRight: 12 * s,
                        }}
                    >
                        Jam
                    </Text>

                    <Text
                        className="font-outfit-extrabold text-[#2e6b4e]"
                        style={{ fontSize: 48 * s }}
                    >
                        {minutes}
                    </Text>

                    <Text
                        className="font-outfit-extrabold text-[#292d35]"
                        style={{
                            fontSize: 19 * s,
                            marginLeft: 5 * s,
                        }}
                    >
                        Menit
                    </Text>
                </View>

                <Svg
                    width="100%"
                    height={chartHeight}
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                >
                    <Defs>
                        <LinearGradient
                            id="scrollTimeAreaGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <Stop
                                offset="0"
                                stopColor="#2e6b4e"
                                stopOpacity="0.28"
                            />
                            <Stop
                                offset="1"
                                stopColor="#2e6b4e"
                                stopOpacity="0.02"
                            />
                        </LinearGradient>
                    </Defs>

                    <Path
                        d={chartArea}
                        fill="url(#scrollTimeAreaGradient)"
                    />

                    <Path
                        d={chartLine}
                        stroke="#2e6b4e"
                        strokeWidth={2 * s}
                        fill="none"
                    />

                    {points.map((point, index) => (
                        <Circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r={3.5 * s}
                            fill="#ffffff"
                            stroke="#2e6b4e"
                            strokeWidth={1.5 * s}
                        />
                    ))}
                </Svg>
            </View>
        </View>
    );
}

function ScrollTimeSummaryCards({
    scale = 1,
    pauseCount = 3,
    comparison = '-45m',
}: {
    scale?: number;
    pauseCount?: number;
    comparison?: string;
}) {
    const s = scale;

    return (
        <View
            className="flex-row items-stretch"
            style={{
                gap: 6 * s,
                marginTop: 12 * s,
            }}
        >
            <View
                className="flex-1 justify-center bg-[#2e6b4e]"
                style={{
                    minHeight: 96 * s,
                    borderRadius: 16 * s,
                    padding: 14 * s,
                }}
            >
                <Text
                    className="font-outfit-extrabold text-white"
                    style={{ fontSize: 40 * s }}
                >
                    {pauseCount}
                </Text>

                <Text
                    className="font-outfit-bold text-white"
                    style={{
                        fontSize: 13 * s,
                        marginTop: 1 * s,
                    }}
                >
                    Jeda Didapatkan
                </Text>
            </View>

            <View
                className="flex-1 justify-center bg-white"
                style={{
                    minHeight: 96 * s,
                    borderRadius: 16 * s,
                    padding: 14 * s,
                }}
            >
                <Text
                    className="font-outfit-extrabold text-[#292d35]"
                    style={{ fontSize: 40 * s }}
                >
                    {comparison}
                </Text>

                <Text
                    className="font-outfit-bold text-[#292d35]"
                    style={{
                        fontSize: 12 * s,
                        marginTop: 1 * s,
                    }}
                >
                    Dari Hari Sebelumnya
                </Text>
            </View>
        </View>
    );
}

function InstagramIcon({ size = 46 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
                <RadialGradient
                    id="scrollInstagramGradient"
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
                fill="url(#scrollInstagramGradient)"
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

function TikTokIcon({ size = 46 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center bg-[#e9eeeb]"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.25,
            }}
        >
            <Svg
                width={size * 0.65}
                height={size * 0.65}
                viewBox="0 0 24 24"
                fill="none"
            >
                <Path
                    d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.888 2.863 2.895 2.895 0 0 1-2.89-2.894 2.895 2.895 0 0 1 2.89-2.893c.338 0 .66.06.96.17V9.45a6.34 6.34 0 0 0-.96-.073A6.335 6.335 0 0 0 3 15.71a6.335 6.335 0 0 0 6.346 6.335 6.336 6.336 0 0 0 6.335-6.335V9.167a8.214 8.214 0 0 0 4.908 1.602V7.324a4.814 4.814 0 0 1-1-.638z"
                    fill="#292d35"
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
    const strokeDashoffset =
        circumference - (circumference * percentage) / 100;

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
                        className="font-outfit-extrabold text-[#275c43]"
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

function AppUsageSection({
    scale = 1,
    apps = DEFAULT_APPS,
}: {
    scale?: number;
    apps?: AppUsageItem[];
}) {
    const s = scale;

    return (
        <View
            className="bg-[#cecece]/40"
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
                    className="font-outfit-bold text-[#292d35]"
                    style={{ fontSize: 13 * s }}
                >
                    Pemakaian Aplikasi
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
                            paddingHorizontal: 12 * s,
                        }}
                    >
                        <View
                            className="items-center justify-center bg-[#e6ede6]/75"
                            style={{
                                width: 72 * s,
                                height: 72 * s,
                                borderRadius: 12 * s,
                                marginRight: 14 * s,
                            }}
                        >
                            {app.name === 'Instagram' ? (
                                <InstagramIcon size={46 * s} />
                            ) : (
                                <TikTokIcon size={46 * s} />
                            )}
                        </View>

                        <View className="flex-1">
                            <Text
                                className="font-outfit-extrabold text-[#292d35]"
                                style={{ fontSize: 17 * s }}
                            >
                                {app.name}
                            </Text>

                            <Text
                                className="font-outfit-medium text-[#292d35]"
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

export default function DetailWaktuScroll({
    scale = 1,
}: DetailWaktuScrollProps) {
    const router = useRouter();
    const s = scale;

    const [selectedDate, setSelectedDate] = useState(10);

    return (
        <View className="flex-1 bg-[#f6f3ec]">
            {/* HEADER FIXED */}
            <View
                className="flex-row items-center"
                style={{
                    paddingHorizontal: 24 * s,
                    paddingTop: 50 * s,
                    paddingBottom: 18 * s,
                }}
            >
                <TouchableOpacity
                    className="items-center justify-center bg-[#f6f3ec]"
                    style={{
                        width: 50 * s,
                        height: 50 * s,
                        borderRadius: 25 * s,
                        marginRight: 22 * s,
                        shadowColor: '#000000',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.12,
                        shadowRadius: 3,
                        elevation: 3,
                    }}
                    activeOpacity={0.7}
                    onPress={() => router.back()}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24 * s}
                        color="#292d35"
                    />
                </TouchableOpacity>

                <Text
                    className="font-outfit-extrabold text-[#292d35]"
                    style={{ fontSize: 19 * s }}
                >
                    Detail Waktu Scroll
                </Text>
            </View>

            {/* SCROLLABLE CONTENT */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 16 * s,
                    paddingBottom: 32 * s,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* KALENDER */}
                <CalendarMiniCard
                    scale={s}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                />

                {/* DETAIL WAKTU SCROLL */}
                <View
                    className="bg-[#cecece]/40"
                    style={{
                        borderRadius: 22 * s,
                        padding: 12 * s,
                        marginTop: 14 * s,
                    }}
                >
                    <ScrollTimeChartCard
                        scale={s}
                        hours={3}
                        minutes={15}
                    />

                    <ScrollTimeSummaryCards
                        scale={s}
                        pauseCount={3}
                        comparison="-45m"
                    />
                </View>

                {/* PEMAKAIAN APLIKASI */}
                <View style={{ marginTop: 14 * s }}>
                    <AppUsageSection
                        scale={s}
                        apps={DEFAULT_APPS}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
