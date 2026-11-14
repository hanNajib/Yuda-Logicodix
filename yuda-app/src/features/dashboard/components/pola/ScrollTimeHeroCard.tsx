import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    Stop,
} from 'react-native-svg';

const yudaXdHalfSource = require('@/assets/images/yuda/yuda-xd-half.png');

interface ScrollTimeHeroCardProps {
    userName: string;
    scale?: number;
    hours?: number;
    minutes?: number;
    diffMinutes?: number;
    interventionsTriggered?: number;
    slots?: Record<string, number | undefined>;
    onViewMore?: () => void;
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

export function ScrollTimeHeroCard({
    userName,
    scale = 1,
    hours = 0,
    minutes = 0,
    diffMinutes = 0,
    interventionsTriggered = 0,
    slots = {},
    onViewMore,
}: ScrollTimeHeroCardProps) {
    const s = scale;

    const chartW = 300 * s;
    const chartH = 85 * s;

    const slotValues = useMemo(() => {
        return SLOT_KEYS.map((k) => Math.max(0, slots[k] ?? 0));
    }, [slots]);

    const maxVal = Math.max(1, ...slotValues);

    const points = useMemo(() => {
        const stepX = chartW / (slotValues.length - 1);
        return slotValues.map((val, idx) => {
            const x = idx * stepX;
            const normalized = val / maxVal;
            // Map to vertical height (padding 12% bottom & top)
            const y = chartH * 0.85 - normalized * (chartH * 0.7);
            return { x, y };
        });
    }, [slotValues, maxVal, chartW, chartH]);

    const pathLine = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');

    const pathArea = `${pathLine} L ${chartW} ${chartH} L 0 ${chartH} Z`;

    const charWidth = 105 * s;
    const charHeight = 105 * s;

    const comparisonText = useMemo(() => {
        if (diffMinutes === 0) return 'Sama dengan kemarin';
        const absMin = Math.abs(diffMinutes);
        let timeStr = `${absMin} menit`;
        if (absMin >= 60) {
            const h = Math.floor(absMin / 60);
            const m = absMin % 60;
            timeStr = m === 0 ? `${h} jam` : `${h} jam ${m} menit`;
        }
        return diffMinutes > 0
            ? `Bertambah ${timeStr} dibanding kemarin`
            : `Berkurang ${timeStr} dibanding kemarin`;
    }, [diffMinutes]);

    const jedaText = useMemo(() => {
        if (interventionsTriggered <= 0) return 'Belum ada jeda yang diambil hari ini';
        return `Kamu sudah mendapatkan ${interventionsTriggered} jeda hari ini`;
    }, [interventionsTriggered]);

    return (
        <View
            className="bg-[#CECECE]/40"
            style={{
                borderRadius: 24 * s,
                padding: 12 * s,
                paddingBottom: 0,
            }}
        >
            <View
                className="bg-white"
                style={{
                    borderRadius: 20 * s,
                    padding: 18 * s,
                    marginBottom: 12 * s,
                }}
            >
                <View className="flex-row items-center justify-between">
                    <Text
                        className="font-outfit-extrabold text-[#1c241e]"
                        style={{ fontSize: 18 * s }}
                    >
                        Waktu Scroll Hari Ini
                    </Text>

                    <TouchableOpacity
                        className="flex-row items-center"
                        onPress={onViewMore}
                        activeOpacity={0.7}
                    >
                        <Text
                            className="font-outfit-bold text-[#275c43]"
                            style={{ fontSize: 12 * s }}
                        >
                            Lihat Selengkapnya
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
                    className="overflow-hidden bg-[#e6ede6]/65"
                    style={{
                        borderRadius: 16 * s,
                        paddingTop: 14 * s,
                        marginTop: 12 * s,
                    }}
                >
                    <View
                        className="flex-row items-baseline"
                        style={{
                            paddingHorizontal: 16 * s,
                            marginBottom: 8 * s,
                        }}
                    >
                        <Text
                            className="font-outfit-extrabold text-[#275c43]"
                            style={{ fontSize: 46 * s }}
                        >
                            {hours}
                        </Text>

                        <Text
                            className="font-outfit-extrabold text-[#1c241e]"
                            style={{
                                fontSize: 20 * s,
                                marginRight: 12 * s,
                            }}
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
                            className="font-outfit-extrabold text-[#1c241e]"
                            style={{ fontSize: 20 * s }}
                        >
                            {' '}Menit
                        </Text>
                    </View>

                    <Svg
                        width="100%"
                        height={chartH}
                        viewBox={`0 0 ${chartW} ${chartH}`}
                    >
                        <Defs>
                            <LinearGradient
                                id="scrollGrad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <Stop
                                    offset="0"
                                    stopColor="#275c43"
                                    stopOpacity="0.25"
                                />
                                <Stop
                                    offset="1"
                                    stopColor="#275c43"
                                    stopOpacity="0.02"
                                />
                            </LinearGradient>
                        </Defs>

                        <Path d={pathArea} fill="url(#scrollGrad)" />

                        <Path
                            d={pathLine}
                            stroke="#275c43"
                            strokeWidth={2.4 * s}
                            fill="none"
                        />

                        {points.map((pt, i) => (
                            <Circle
                                key={i}
                                cx={pt.x}
                                cy={pt.y}
                                r={3.8 * s}
                                fill="#ffffff"
                                stroke="#275c43"
                                strokeWidth={1.8 * s}
                            />
                        ))}
                    </Svg>
                </View>
            </View>

            <View style={{ gap: 8 * s, marginBottom: 12 * s }}>
                <View
                    className="flex-row items-center bg-white"
                    style={{
                        borderRadius: 20 * s,
                        padding: 16 * s,
                    }}
                >
                    <View
                        className="items-center justify-center"
                        style={{ marginRight: 12 * s }}
                    >
                        <Ionicons
                            name="time-outline"
                            size={24 * s}
                            color="#275c43"
                        />
                    </View>

                    <View className="flex-1">
                        <Text
                            className="font-outfit-extrabold text-[#1c241e]"
                            style={{ fontSize: 15 * s }}
                        >
                            Jam Scroll
                        </Text>

                        <Text
                            className="font-outfit-medium text-[#2b362e]"
                            style={{
                                fontSize: 12 * s,
                                marginTop: 2 * s,
                            }}
                        >
                            {comparisonText}
                        </Text>
                    </View>
                </View>

                <View
                    className="flex-row items-center bg-white"
                    style={{
                        borderRadius: 20 * s,
                        padding: 16 * s,
                    }}
                >
                    <View
                        className="items-center justify-center"
                        style={{ marginRight: 12 * s }}
                    >
                        <Ionicons
                            name="layers-outline"
                            size={24 * s}
                            color="#275c43"
                        />
                    </View>

                    <View className="flex-1">
                        <Text
                            className="font-outfit-extrabold text-[#1c241e]"
                            style={{ fontSize: 15 * s }}
                        >
                            Jeda Didapatkan
                        </Text>

                        <Text
                            className="font-outfit-medium text-[#2b362e]"
                            style={{
                                fontSize: 12 * s,
                                marginTop: 2 * s,
                            }}
                        >
                            {jedaText}
                        </Text>
                    </View>
                </View>

                <View
                    className="flex-row items-center bg-white"
                    style={{
                        borderRadius: 20 * s,
                        padding: 16 * s,
                    }}
                >
                    <View
                        className="items-center justify-center"
                        style={{ marginRight: 12 * s }}
                    >
                        <Ionicons
                            name="happy-outline"
                            size={24 * s}
                            color="#275c43"
                        />
                    </View>

                    <View className="flex-1">
                        <Text
                            className="font-outfit-extrabold text-[#1c241e]"
                            style={{ fontSize: 15 * s }}
                        >
                            Perasaan Anda
                        </Text>

                        <Text
                            className="font-outfit-medium text-[#2b362e]"
                            style={{
                                fontSize: 12 * s,
                                marginTop: 2 * s,
                            }}
                        >
                            Kamu cenderung lebih senang setelah jeda
                        </Text>
                    </View>
                </View>
            </View>

            <View
                className="mt-1 flex-row items-end"
            >
                <View
                    className="items-center justify-end"
                    style={{
                        width: charWidth,
                        height: charHeight,
                    }}
                >
                    <Image
                        source={yudaXdHalfSource}
                        className="h-full w-full"
                        resizeMode="contain"
                    />
                </View>

                <View
                    className="relative flex-1"
                    style={{
                        marginLeft: 14 * s,
                        marginBottom: 12 * s,
                    }}
                >
                    <View
                        className="absolute z-[2] h-0 w-0 border-y-[6px] border-r-[8px] border-y-transparent border-r-[#275c43]"
                        style={{
                            left: -8,
                            top: 20 * s,
                        }}
                    />

                    <View
                        className="bg-[#275c43]"
                        style={{
                            borderRadius: 16 * s,
                            padding: 14 * s,
                        }}
                    >
                        <Text
                            className="font-outfit-bold text-white"
                            style={{
                                fontSize: 12.5 * s,
                                lineHeight: 18 * s,
                            }}
                        >
                            Tetap semangat {userName}, kamu sudah menunjukkan progress yang signifikan.
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
