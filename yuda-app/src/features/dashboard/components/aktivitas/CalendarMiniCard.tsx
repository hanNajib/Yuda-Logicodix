import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

interface CalendarMiniCardProps {
    scale?: number;
    selectedDate?: string; // Format 'YYYY-MM-DD'
    onSelectDate?: (dateIso: string) => void;
    taskDatesWithPending?: Set<string>;
    taskDatesWithCompleted?: Set<string>;
}

interface CalendarDay {
    dateIso: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    statusDot?: 'green' | 'yellow' | 'red';
}

const DAYS_HEADER = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function CalendarMiniCard({
    scale = 1,
    selectedDate: controlledDate,
    onSelectDate,
    taskDatesWithPending,
    taskDatesWithCompleted,
}: CalendarMiniCardProps) {
    const s = scale;

    const today = useMemo(() => new Date(), []);
    const [currentViewDate, setCurrentViewDate] = useState<Date>(() => {
        if (controlledDate) {
            const [y, m, d] = controlledDate.split('-').map(Number);
            return new Date(y, m - 1, d);
        }
        return new Date();
    });

    const activeSelectedIso = useMemo(() => {
        if (controlledDate) return controlledDate;
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }, [controlledDate, today]);

    const viewYear = currentViewDate.getFullYear();
    const viewMonth = currentViewDate.getMonth(); // 0-based

    // Generate kalender grid (minggu demi minggu)
    const calendarRows = useMemo(() => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Minggu
        const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const totalDaysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const days: CalendarDay[] = [];

        // Previous month days
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const dayNum = totalDaysInPrevMonth - i;
            const prevMonthDate = new Date(viewYear, viewMonth - 1, dayNum);
            const y = prevMonthDate.getFullYear();
            const m = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
            const d = String(dayNum).padStart(2, '0');
            days.push({
                dateIso: `${y}-${m}-${d}`,
                dayNumber: dayNum,
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let d = 1; d <= totalDaysInMonth; d++) {
            const m = String(viewMonth + 1).padStart(2, '0');
            const dayStr = String(d).padStart(2, '0');
            const iso = `${viewYear}-${m}-${dayStr}`;

            let statusDot: 'green' | 'yellow' | 'red' | undefined;
            if (taskDatesWithPending?.has(iso)) {
                statusDot = 'yellow';
            } else if (taskDatesWithCompleted?.has(iso)) {
                statusDot = 'green';
            }

            days.push({
                dateIso: iso,
                dayNumber: d,
                isCurrentMonth: true,
                statusDot,
            });
        }

        // Next month days until 35 or 42 cells
        const totalCells = days.length > 35 ? 42 : 35;
        const remaining = totalCells - days.length;
        for (let d = 1; d <= remaining; d++) {
            const nextMonthDate = new Date(viewYear, viewMonth + 1, d);
            const y = nextMonthDate.getFullYear();
            const m = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(d).padStart(2, '0');
            days.push({
                dateIso: `${y}-${m}-${dayStr}`,
                dayNumber: d,
                isCurrentMonth: false,
            });
        }

        // Chunk into rows of 7
        const rows: CalendarDay[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            rows.push(days.slice(i, i + 7));
        }
        return rows;
    }, [viewYear, viewMonth, taskDatesWithPending, taskDatesWithCompleted]);

    const handlePrevMonth = () => {
        setCurrentViewDate(new Date(viewYear, viewMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentViewDate(new Date(viewYear, viewMonth + 1, 1));
    };

    const handleDatePress = (item: CalendarDay) => {
        onSelectDate?.(item.dateIso);
        if (!item.isCurrentMonth) {
            const [y, m, d] = item.dateIso.split('-').map(Number);
            setCurrentViewDate(new Date(y, m - 1, 1));
        }
    };

    const selectedDateObj = useMemo(() => {
        const [y, m, d] = activeSelectedIso.split('-').map(Number);
        return new Date(y, m - 1, d);
    }, [activeSelectedIso]);

    const selectedDayName = DAY_NAMES[selectedDateObj.getDay()];
    const selectedDateDisplay = `${selectedDateObj.getDate()} ${MONTH_NAMES[selectedDateObj.getMonth()].substring(0, 3)}, ${selectedDateObj.getFullYear()}`;

    const circleSize = 32 * s;

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
                        className="font-outfit-extrabold text-[#1c241e]"
                        style={{ fontSize: 16 * s }}
                    >
                        {selectedDateDisplay}
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
                            {selectedDayName}
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
                        onPress={handlePrevMonth}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={14 * s}
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
                        {MONTH_NAMES[viewMonth]} {viewYear}
                    </Text>

                    <TouchableOpacity
                        onPress={handleNextMonth}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons
                            name="chevron-forward"
                            size={14 * s}
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

            {calendarRows.map((row, rIdx) => (
                <View
                    key={rIdx}
                    className="flex-row items-center justify-between"
                    style={{ marginVertical: 3 * s }}
                >
                    {row.map((dayItem, dIdx) => {
                        const isSelected = dayItem.dateIso === activeSelectedIso;

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
                                                : dayItem.statusDot === 'green'
                                                    ? '#275c43'
                                                    : '#f5b838',
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
