import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
import { apiClient } from '@/services/apiClient';

interface DetailWaktuScrollProps {
    scale?: number;
}

interface CalendarDay {
    dayNumber: number;
    monthOffset: number; // -1: prev, 0: current, 1: next
    dateString: string;
    isCurrentMonth: boolean;
    statusDot?: 'green' | 'yellow' | 'red';
}

interface AppUsageItem {
    id: string;
    key: string;
    name: string;
    minutes: number;
    percentage: number;
}

interface DailyMatrixResponse {
    log_date: string;
    total_screen_time_minutes: number;
    prev_screen_time_minutes: number;
    diff_minutes: number;
    interventions_triggered: number;
    slots: {
        slot_00_02?: number;
        slot_02_04?: number;
        slot_04_06?: number;
        slot_06_08?: number;
        slot_08_10?: number;
        slot_10_12?: number;
        slot_12_14?: number;
        slot_14_16?: number;
        slot_16_18?: number;
        slot_18_20?: number;
        slot_20_22?: number;
        slot_22_00?: number;
        [key: string]: number | undefined;
    };
    app_usages: {
        key: string;
        name: string;
        minutes: number;
        percentage: number;
    }[];
}

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

const DAYS_HEADER = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

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

function formatMinutesToHoursMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0 && mins === 0) return '0 Menit';
    if (hours === 0) return `${mins} Menit`;
    if (mins === 0) return `${hours} Jam`;
    return `${hours} Jam, ${mins} Menit`;
}

function formatDateToIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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
            className="items-center justify-center bg-[#111827]"
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
                    fill="#ffffff"
                />
            </Svg>
        </View>
    );
}

function FacebookIcon({ size = 46 }: { size?: number }) {
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

function YouTubeIcon({ size = 46 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center bg-white"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.25,
            }}
        >
            <Ionicons
                name="logo-youtube"
                size={size * 0.9}
                color="#ff0000"
            />
        </View>
    );
}

function ThreadsIcon({ size = 46 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center bg-[#111827]"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.25,
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

function XIcon({ size = 46 }: { size?: number }) {
    return (
        <View
            className="items-center justify-center bg-[#111827]"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.25,
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

function RenderAppIcon({ appKey, size = 46 }: { appKey: string; size?: number }) {
    switch (appKey.toLowerCase()) {
        case 'instagram':
            return <InstagramIcon size={size} />;
        case 'tiktok':
            return <TikTokIcon size={size} />;
        case 'facebook':
            return <FacebookIcon size={size} />;
        case 'youtube':
            return <YouTubeIcon size={size} />;
        case 'threads':
            return <ThreadsIcon size={size} />;
        case 'x':
        case 'twitter':
            return <XIcon size={size} />;
        default:
            return <InstagramIcon size={size} />;
    }
}

function DonutGauge({
    percentage = 0,
    size = 64,
    strokeWidth = 6.5,
}: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
}) {
    const clampedPercentage = Math.min(100, Math.max(0, percentage));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
        circumference - (circumference * clampedPercentage) / 100;

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
                            fontSize: size * 0.22,
                            lineHeight: size * 0.25,
                        }}
                    >
                        {clampedPercentage}%
                    </Text>
                    <Text
                        className="font-outfit-semibold text-[#2b362e]"
                        style={{
                            fontSize: size * 0.15,
                            lineHeight: size * 0.17,
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

function CalendarMiniCard({
    scale = 1,
    currentMonthDate,
    selectedDate,
    onPrevMonth,
    onNextMonth,
    onSelectDate,
}: {
    scale?: number;
    currentMonthDate: Date;
    selectedDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onSelectDate: (date: Date) => void;
}) {
    const s = scale;
    const circleSize = 32 * s;

    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const calendarRows = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const cells: CalendarDay[] = [];

        // Previous month filler
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const d = new Date(year, month - 1, dayNum);
            cells.push({
                dayNumber: dayNum,
                monthOffset: -1,
                dateString: formatDateToIso(d),
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const curDate = new Date(year, month, d);
            cells.push({
                dayNumber: d,
                monthOffset: 0,
                dateString: formatDateToIso(curDate),
                isCurrentMonth: true,
            });
        }

        // Next month filler
        const totalRows = Math.ceil(cells.length / 7);
        const totalCellsNeeded = totalRows * 7;
        let nextDay = 1;
        while (cells.length < totalCellsNeeded) {
            const nextDate = new Date(year, month + 1, nextDay);
            cells.push({
                dayNumber: nextDay,
                monthOffset: 1,
                dateString: formatDateToIso(nextDate),
                isCurrentMonth: false,
            });
            nextDay++;
        }

        const rows: CalendarDay[][] = [];
        for (let r = 0; r < totalRows; r++) {
            rows.push(cells.slice(r * 7, (r + 1) * 7));
        }
        return rows;
    }, [year, month]);

    const selectedIso = formatDateToIso(selectedDate);
    const dayNameStr = DAY_NAMES[selectedDate.getDay()];
    const monthShortStr = MONTH_NAMES[selectedDate.getMonth()].slice(0, 3);

    return (
        <View
            className="bg-white"
            style={{
                borderRadius: 20 * s,
                padding: 18 * s,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
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
                        {selectedDate.getDate()} {monthShortStr}, {selectedDate.getFullYear()}
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
                            {dayNameStr}
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
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={onPrevMonth}
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
                        {MONTH_NAMES[month]}
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={onNextMonth}
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

            {calendarRows.map((row, rowIndex) => (
                <View
                    key={rowIndex}
                    className="flex-row items-center justify-between"
                    style={{ marginVertical: 3 * s }}
                >
                    {row.map((dayItem, dayIndex) => {
                        const isSelected = dayItem.dateString === selectedIso;

                        return (
                            <Pressable
                                key={dayIndex}
                                className="flex-1 items-center justify-center"
                                onPress={() => {
                                    const [y, m, d] = dayItem.dateString.split('-').map(Number);
                                    onSelectDate(new Date(y, m - 1, d));
                                }}
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
                                <View style={{ height: 6 * s }} />
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
    hours = 0,
    minutes = 0,
    slots = {},
}: {
    scale?: number;
    hours?: number;
    minutes?: number;
    slots?: Record<string, number | undefined>;
}) {
    const s = scale;
    const chartWidth = 320 * s;
    const chartHeight = 115 * s;

    const slotValues = useMemo(() => {
        return SLOT_KEYS.map((k) => Math.max(0, slots[k] ?? 0));
    }, [slots]);

    const maxVal = Math.max(1, ...slotValues);

    const points = useMemo(() => {
        const stepX = chartWidth / (slotValues.length - 1);
        return slotValues.map((val, idx) => {
            const x = idx * stepX;
            // 0 -> bottom (chartHeight * 0.9), maxVal -> top (chartHeight * 0.1)
            const normalized = val / maxVal;
            const y = chartHeight * 0.88 - normalized * (chartHeight * 0.72);
            return { x, y };
        });
    }, [slotValues, maxVal, chartWidth, chartHeight]);

    const chartLine = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
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
                        marginBottom: 4 * s,
                    }}
                >
                    <Text
                        className="font-outfit-extrabold text-[#2e6b4e]"
                        style={{ fontSize: 44 * s }}
                    >
                        {hours}
                    </Text>

                    <Text
                        className="font-outfit-extrabold text-[#292d35]"
                        style={{
                            fontSize: 18 * s,
                            marginLeft: 5 * s,
                            marginRight: 12 * s,
                        }}
                    >
                        Jam
                    </Text>

                    <Text
                        className="font-outfit-extrabold text-[#2e6b4e]"
                        style={{ fontSize: 44 * s }}
                    >
                        {minutes}
                    </Text>

                    <Text
                        className="font-outfit-extrabold text-[#292d35]"
                        style={{
                            fontSize: 18 * s,
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
                                stopOpacity="0.32"
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
                        strokeWidth={2.5 * s}
                        fill="none"
                    />

                    {points.map((point, index) => (
                        <Circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r={3 * s}
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
    pauseCount = 0,
    diffMinutes = 0,
}: {
    scale?: number;
    pauseCount?: number;
    diffMinutes?: number;
}) {
    const s = scale;

    const comparisonText = useMemo(() => {
        if (diffMinutes === 0) return '0m';
        const sign = diffMinutes > 0 ? '+' : '-';
        const absMin = Math.abs(diffMinutes);
        if (absMin < 60) return `${sign}${absMin}m`;
        const h = Math.floor(absMin / 60);
        const m = absMin % 60;
        return m === 0 ? `${sign}${h}j` : `${sign}${h}j ${m}m`;
    }, [diffMinutes]);

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
                    style={{ fontSize: 38 * s }}
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
                    style={{ fontSize: 38 * s }}
                >
                    {comparisonText}
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

function AppUsageSection({
    scale = 1,
    apps = [],
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
                {apps.length === 0 ? (
                    <View
                        className="items-center justify-center bg-white"
                        style={{
                            borderRadius: 18 * s,
                            paddingVertical: 24 * s,
                            paddingHorizontal: 16 * s,
                        }}
                    >
                        <Text
                            className="font-outfit-medium text-[#7a8a7e]"
                            style={{ fontSize: 13.5 * s }}
                        >
                            Belum ada pemakaian aplikasi pada tanggal ini.
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
                                <RenderAppIcon appKey={app.key} size={46 * s} />
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
                                    {formatMinutesToHoursMinutes(app.minutes)}
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

export default function DetailWaktuScroll({
    scale = 1,
}: DetailWaktuScrollProps) {
    const router = useRouter();
    const s = scale;

    const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
    const [viewDate, setViewDate] = useState<Date>(() => new Date());

    const selectedDateIso = formatDateToIso(selectedDate);

    const { data: dailyData, isLoading } = useQuery<DailyMatrixResponse>({
        queryKey: ['dailyScreenTimeMatrix', selectedDateIso],
        queryFn: async () => {
            const res = await apiClient.get('/api/intervention/matrix/daily', {
                params: { date: selectedDateIso },
            });
            return res.data?.data;
        },
    });

    const handlePrevMonth = () => {
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const totalMinutes = dailyData?.total_screen_time_minutes ?? 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const pauseCount = dailyData?.interventions_triggered ?? 0;
    const diffMinutes = dailyData?.diff_minutes ?? 0;
    const slots = dailyData?.slots ?? {};

    const appUsageList: AppUsageItem[] = useMemo(() => {
        if (!dailyData?.app_usages) {
            return [];
        }
        return dailyData.app_usages
            .filter((app) => (app.minutes ?? 0) > 0)
            .map((app) => ({
                id: app.key,
                key: app.key,
                name: app.name,
                minutes: app.minutes,
                percentage: Math.round(app.percentage),
            }));
    }, [dailyData?.app_usages]);

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
                        shadowOffset: { width: 0, height: 2 },
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

                {isLoading && (
                    <ActivityIndicator
                        size="small"
                        color="#275c43"
                        style={{ marginLeft: 12 * s }}
                    />
                )}
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
                    currentMonthDate={viewDate}
                    selectedDate={selectedDate}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    onSelectDate={(newDate) => {
                        setSelectedDate(newDate);
                        setViewDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
                    }}
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
                        hours={hours}
                        minutes={minutes}
                        slots={slots}
                    />

                    <ScrollTimeSummaryCards
                        scale={s}
                        pauseCount={pauseCount}
                        diffMinutes={diffMinutes}
                    />
                </View>

                {/* PEMAKAIAN APLIKASI */}
                <View style={{ marginTop: 14 * s }}>
                    <AppUsageSection
                        scale={s}
                        apps={appUsageList}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
