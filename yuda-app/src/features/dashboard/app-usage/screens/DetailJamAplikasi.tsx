
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
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

interface DetailJamAplikasiProps {
    scale?: number;
}

interface AppItem {
    id: string;
    name: string;
    usageTime: string;
    rank: number;
    icon: 'tiktok' | 'facebook' | 'youtube';
}

const YUDA_IMAGE = require('@/assets/images/yuda/yuda-makan.png');

const OTHER_APPS: AppItem[] = [
    {
        id: 'tiktok',
        name: 'TikTok',
        usageTime: '30j 10m',
        rank: 2,
        icon: 'tiktok',
    },
    {
        id: 'facebook',
        name: 'Facebook',
        usageTime: '30j 10m',
        rank: 3,
        icon: 'facebook',
    },
    {
        id: 'youtube',
        name: 'YouTube',
        usageTime: '30j 10m',
        rank: 4,
        icon: 'youtube',
    },
];

const WEEKLY_DATA = [
    { day: 'Sen', value: 6.2 },
    { day: 'Sel', value: 5.4 },
    { day: 'Rab', value: 7.1 },
    { day: 'Kam', value: 7.1 },
    { day: 'Jum', value: 7.1 },
    { day: 'Sab', value: 8.3 },
    { day: 'Min', value: 7.1 },
];

export default function DetailJamAplikasi({
    scale = 1,
}: DetailJamAplikasiProps) {
    const router = useRouter();
    const s = scale;

    const [selectedDay, setSelectedDay] = useState('Sab');

    const chartWidth = 320 * s;
    const chartHeight = 110 * s;

    const chartPoints = [
        { x: 0, y: chartHeight * 0.52 },
        { x: chartWidth * 0.2, y: chartHeight * 0.92 },
        { x: chartWidth * 0.4, y: chartHeight * 0.3 },
        { x: chartWidth * 0.6, y: chartHeight * 0.82 },
        { x: chartWidth * 0.8, y: chartHeight * 0.7 },
        { x: chartWidth, y: chartHeight * 0.12 },
    ];

    const chartLine = chartPoints
        .map((point, index) => {
            return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
        })
        .join(' ');

    const chartArea = `${chartLine} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    return (
        <View className="flex-1 bg-[#F6F3EC]">

            {/* HEADER FIXED */}
            <View
                className="flex-row items-center"
                style={{
                    paddingHorizontal: 16 * s,
                    paddingTop: 50 * s,
                    paddingBottom: 18 * s,
                }}
            >
                <TouchableOpacity
                    className="items-center justify-center bg-[#F6F3EC]"
                    style={{
                        width: 44 * s,
                        height: 44 * s,
                        borderRadius: 22 * s,
                        marginRight: 16 * s,
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
                        color="#292D35"
                    />
                </TouchableOpacity>

                <Text
                    className="font-outfit-extrabold text-[#292D35]"
                    style={{ fontSize: 18 * s }}
                >
                    Jam Aplikasi Terbanyak
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
                <View
                    className="bg-[#CECECE]/40"
                    style={{
                        borderRadius: 20 * s,
                        padding: 10 * s,
                    }}
                >
                    <View
                        className="bg-white"
                        style={{
                            borderRadius: 17 * s,
                            padding: 10 * s,
                        }}
                    >
                        {/* GRAFIK APLIKASI UTAMA */}
                        <View
                            className="overflow-hidden bg-[#E6EDE6]/75"
                            style={{
                                borderRadius: 14 * s,
                                paddingTop: 12 * s,
                            }}
                        >
                            <View
                                style={{
                                    height: chartHeight,
                                    overflow: 'hidden',
                                }}
                            >
                                <Svg
                                    width="100%"
                                    height={chartHeight}
                                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                >
                                    <Defs>
                                        <LinearGradient
                                            id="detailAppChartGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <Stop
                                                offset="0"
                                                stopColor="#2E6B4E"
                                                stopOpacity="0.3"
                                            />
                                            <Stop
                                                offset="1"
                                                stopColor="#2E6B4E"
                                                stopOpacity="0"
                                            />
                                        </LinearGradient>
                                    </Defs>

                                    <Path
                                        d={chartArea}
                                        fill="url(#detailAppChartGradient)"
                                    />

                                    <Path
                                        d={chartLine}
                                        stroke="#2E6B4E"
                                        strokeWidth={2 * s}
                                        fill="none"
                                    />

                                    {chartPoints.map((point, index) => (
                                        <Circle
                                            key={index}
                                            cx={point.x}
                                            cy={point.y}
                                            r={3.5 * s}
                                            fill="#FFFFFF"
                                            stroke="#2E6B4E"
                                            strokeWidth={1.5 * s}
                                        />
                                    ))}
                                </Svg>
                            </View>

                            <View
                                className="flex-row items-end justify-between"
                                style={{
                                    marginTop: -20 * s,
                                    paddingHorizontal: 12 * s,
                                    paddingVertical: 10 * s,
                                }}
                            >
                                <View className="flex-1">
                                    <Text
                                        className="font-outfit-extrabold text-[#275C43]"
                                        style={{ fontSize: 15 * s }}
                                    >
                                        Instagram
                                    </Text>

                                    <Text
                                        className="font-outfit-semibold text-[#275C43]"
                                        style={{ fontSize: 10.5 * s }}
                                    >
                                        43 Jam 15 Menit
                                    </Text>
                                </View>

                                <View style={{ marginTop: -12 * s }}>
                                    <Svg
                                        width={58 * s}
                                        height={58 * s}
                                        viewBox="0 0 100 100"
                                    >
                                        <Defs>
                                            <RadialGradient
                                                id="detailInstagramGradient"
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
                                            fill="url(#detailInstagramGradient)"
                                        />

                                        <Rect
                                            x="22"
                                            y="22"
                                            width="56"
                                            height="56"
                                            rx="16"
                                            stroke="#FFFFFF"
                                            strokeWidth="7"
                                            fill="none"
                                        />

                                        <Circle
                                            cx="50"
                                            cy="50"
                                            r="14"
                                            stroke="#FFFFFF"
                                            strokeWidth="7"
                                            fill="none"
                                        />

                                        <Circle
                                            cx="66"
                                            cy="34"
                                            r="4.5"
                                            fill="#FFFFFF"
                                        />
                                    </Svg>
                                </View>
                            </View>
                        </View>

                        {/* KARTU PESAN YUDA */}
                        <View
                            className="flex-row items-end overflow-hidden bg-[#F6EFD0]"
                            style={{
                                borderRadius: 14 * s,
                                paddingLeft: 10 * s,
                                paddingRight: 12 * s,
                                paddingTop: 10 * s,
                                paddingBottom: 0,
                                marginTop: 10 * s,
                            }}
                        >
                            <View
                                className="items-center justify-end"
                                style={{
                                    width: 66 * s,
                                    height: 66 * s,
                                    marginRight: 10 * s,
                                }}
                            >
                                <Image
                                    source={YUDA_IMAGE}
                                    className="h-full w-full"
                                    style={{
                                        transform: [
                                            { translateY: 4 * s },
                                        ],
                                    }}
                                    resizeMode="contain"
                                />
                            </View>

                            <View
                                className="flex-1"
                                style={{ paddingBottom: 10 * s }}
                            >
                                <Text
                                    className="font-outfit-extrabold text-[#2B2313]"
                                    style={{ fontSize: 14 * s }}
                                >
                                    Halo, Gathan
                                </Text>

                                <Text
                                    className="font-outfit-medium text-[#5E5038]"
                                    style={{
                                        fontSize: 10.5 * s,
                                        lineHeight: 14 * s,
                                        marginTop: 2 * s,
                                    }}
                                >
                                    Instagram menjadi aplikasi dengan waktu
                                    penggunaan terlama. Yuk, sisihkan waktu
                                    untuk aktivitas lain!
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* GRAFIK TREN 7 HARI */}
                    <View
                        className="bg-white"
                        style={{
                            borderRadius: 18 * s,
                            padding: 12 * s,
                            marginTop: 10 * s,
                        }}
                    >
                        <View className="mb-2 flex-row items-center">
                            <Ionicons
                                name="calendar"
                                size={17 * s}
                                color="#275C43"
                                style={{ marginRight: 6 * s }}
                            />

                            <Text
                                className="font-outfit-extrabold text-[#292D35]"
                                style={{ fontSize: 16 * s }}
                            >
                                Tren dalam 7 Hari
                            </Text>
                        </View>

                        {/* CARD SAGE: BATANG DAN NILAI JAM */}
                        <View
                            className="bg-[#E6EDE6]/75"
                            style={{
                                height: 112 * s,
                                borderRadius: 12 * s,
                                paddingHorizontal: 8 * s,
                                paddingTop: 8 * s,
                                overflow: 'hidden',
                            }}
                        >
                            <View
                                className="flex-1 flex-row items-end justify-between"
                                style={{ gap: 4 * s }}
                            >
                                {WEEKLY_DATA.map((item) => {
                                    const isActive = selectedDay === item.day;
                                    const barHeight = (item.value / 9) * (82 * s);

                                    return (
                                        <TouchableOpacity
                                            key={item.day}
                                            activeOpacity={0.75}
                                            onPress={() => setSelectedDay(item.day)}
                                            className="flex-1 items-center justify-end"
                                            style={{ height: '100%' }}
                                        >
                                            <View
                                                className="flex-1 items-center justify-end"
                                                style={{ width: '100%' }}
                                            >
                                                <View
                                                    style={{
                                                        height: 18 * s,
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end',
                                                        marginBottom: 4 * s,
                                                    }}
                                                >
                                                    {isActive && (
                                                        <Text
                                                            className="font-outfit-extrabold text-[#275C43]"
                                                            style={{ fontSize: 11 * s }}
                                                        >
                                                            {item.value.toFixed(1)}j
                                                        </Text>
                                                    )}
                                                </View>

                                                <View
                                                    style={{
                                                        width: '75%',
                                                        height: barHeight,
                                                        borderTopLeftRadius: 8 * s,
                                                        borderTopRightRadius: 8 * s,
                                                        backgroundColor: isActive
                                                            ? '#2E6B4E'
                                                            : '#88AA9A',
                                                    }}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* NAMA HARI DI LUAR CARD SAGE */}
                        <View
                            className="flex-row justify-between"
                            style={{
                                paddingHorizontal: 8 * s,
                                gap: 4 * s,
                                marginTop: 6 * s,
                            }}
                        >
                            {WEEKLY_DATA.map((item) => {
                                const isActive = selectedDay === item.day;

                                return (
                                    <TouchableOpacity
                                        key={item.day}
                                        activeOpacity={0.75}
                                        onPress={() => setSelectedDay(item.day)}
                                        className="flex-1 items-center"
                                    >
                                        <Text
                                            className={`font-outfit-bold ${
                                                isActive
                                                    ? 'text-[#275C43]'
                                                    : 'text-[#292D35]'
                                            }`}
                                            style={{ fontSize: 9.5 * s }}
                                        >
                                            {item.day}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* APLIKASI LAINNYA */}
                <View
                    className="bg-[#CECECE]/40"
                    style={{
                        borderRadius: 20 * s,
                        padding: 10 * s,
                        marginTop: 14 * s,
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
                            name="phone-portrait-outline"
                            size={15 * s}
                            color="#275C43"
                            style={{ marginRight: 6 * s }}
                        />

                        <Text
                            className="font-outfit-bold text-[#292D35]"
                            style={{ fontSize: 13 * s }}
                        >
                            Aplikasi Lainnya
                        </Text>
                    </View>

                    <View style={{ gap: 8 * s }}>
                        {OTHER_APPS.map((app) => {
                            const iconConfig = {
                                tiktok: {
                                    name: 'logo-tiktok' as const,
                                    color: '#17191C',
                                    background: '#E9EEEB',
                                },
                                facebook: {
                                    name: 'logo-facebook' as const,
                                    color: '#FFFFFF',
                                    background: '#087DF1',
                                },
                                youtube: {
                                    name: 'logo-youtube' as const,
                                    color: '#FF0000',
                                    background: '#E9EEEB',
                                },
                            };

                            const icon = iconConfig[app.icon];

                            return (
                                <View
                                    key={app.id}
                                    className="flex-row items-center bg-white"
                                    style={{
                                        borderRadius: 15 * s,
                                        paddingVertical: 7 * s,
                                        paddingHorizontal: 12 * s,
                                    }}
                                >
                                    <Text
                                        className="font-outfit-extrabold text-[#275C43]"
                                        style={{
                                            width: 39 * s,
                                            fontSize: 16 * s,
                                        }}
                                    >
                                        #{app.rank}
                                    </Text>

                                    <View
                                        className="items-center justify-center"
                                        style={{
                                            width: 44 * s,
                                            height: 44 * s,
                                            borderRadius: 11 * s,
                                            backgroundColor: icon.background,
                                            marginRight: 14 * s,
                                        }}
                                    >
                                        <Ionicons
                                            name={icon.name}
                                            size={25 * s}
                                            color={icon.color}
                                        />
                                    </View>

                                    <Text
                                        className="flex-1 font-outfit-extrabold text-[#292D35]"
                                        style={{ fontSize: 16 * s }}
                                        numberOfLines={1}
                                    >
                                        {app.name}
                                    </Text>

                                    <Text
                                        className="font-outfit-extrabold text-[#275C43]"
                                        style={{ fontSize: 13 * s }}
                                    >
                                        {app.usageTime}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
