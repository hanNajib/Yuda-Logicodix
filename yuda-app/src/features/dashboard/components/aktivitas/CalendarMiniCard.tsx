import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

interface CalendarMiniCardProps {
    scale?: number;
    selectedDate?: number;
    onSelectDate?: (date: number) => void;
}

interface CalendarDay {
    dayNumber: number;
    isCurrentMonth: boolean;
    statusDot?: 'green' | 'yellow' | 'red';
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

export function CalendarMiniCard({
    scale = 1,
    selectedDate: controlledDate = 10,
    onSelectDate,
}: CalendarMiniCardProps) {
    const s = scale;
    const [selectedDate, setSelectedDate] = useState<number>(controlledDate);

    const handleDatePress = (item: CalendarDay) => {
        if (!item.isCurrentMonth) return;

        setSelectedDate(item.dayNumber);
        onSelectDate?.(item.dayNumber);
    };

    const getDotColor = (type?: 'green' | 'yellow' | 'red') => {
        if (type === 'green') return '#275c43';
        if (type === 'yellow') return '#f5b838';
        if (type === 'red') return '#e85a4f';
        return 'transparent';
    };

    const circleSize = 32 * s;

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
                        className="font-outfit-extrabold text-[#1c241e]"
                        style={{ fontSize: 16 * s }}
                    >
                        {selectedDate} Mar, 2025
                    </Text>

                    <View
                        className="bg-[#e6ede6]"
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
                    className="flex-row items-center bg-[#e6ede6]"
                    style={{
                        paddingHorizontal: 10 * s,
                        paddingVertical: 5 * s,
                        borderRadius: 12 * s,
                        backgroundColor: 'rgba(230, 237, 230, 0.75)',
                    }}
                >
                    <TouchableOpacity
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
                            className="font-outfit-bold text-[#275c43]"
                            style={{ fontSize: 12 * s }}
                        >
                            {dayName}
                        </Text>
                    </View>
                ))}
            </View>

            {CALENDAR_ROWS.map((row, rIdx) => (
                <View
                    key={rIdx}
                    className="flex-row items-center justify-between"
                    style={{ marginVertical: 3 * s }}
                >
                    {row.map((dayItem, dIdx) => {
                        const isSelected =
                            dayItem.isCurrentMonth &&
                            dayItem.dayNumber === selectedDate;

                        return (
                            <Pressable
                                key={dIdx}
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
                                    <View
                                        style={{
                                            height: 6 * s,
                                        }}
                                    />
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}
