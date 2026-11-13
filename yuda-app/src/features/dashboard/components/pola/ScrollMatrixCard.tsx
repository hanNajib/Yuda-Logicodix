import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { useScrollMatrixStore } from '../../stores/useScrollMatrixStore';
import { useScrollMatrixQuery } from '../../hooks/useScrollMatrixQuery';

const yudaRamenSource = require('@/assets/images/yuda/yuda-makan.png');

interface ScrollMatrixCardProps {
    scale?: number;
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
] as const;

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function getMinuteColor(minutes: number): string {
    if (minutes <= 0) return '#ffffff';
    if (minutes <= 15) return '#275c43';
    if (minutes <= 30) return '#4d8a63';
    if (minutes <= 50) return '#f5b838';
    if (minutes <= 80) return '#fca5a5';
    if (minutes <= 100) return '#e85a4f';
    return '#b91c1c';
}

function getDailyColor(totalMinutes: number): string {
    if (totalMinutes <= 0) return '#ffffff';
    if (totalMinutes <= 45) return '#275c43';
    if (totalMinutes <= 90) return '#4d8a63';
    if (totalMinutes <= 150) return '#f5b838';
    if (totalMinutes <= 240) return '#fca5a5';
    if (totalMinutes <= 360) return '#e85a4f';
    return '#b91c1c';
}

function getCurrentWeekDates(): { day: string; dateStr: string }[] {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;

    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);

    return DAY_LABELS.map((dayLabel, index) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + index);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return {
            day: dayLabel,
            dateStr: `${yyyy}-${mm}-${dd}`,
        };
    });
}

function getCalendarMonthMatrix(monthlyMap: Record<string, number>): { dateStr: string; minutes: number }[][] {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const mondayOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const totalCells = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
    const weeks: { dateStr: string; minutes: number }[][] = [];

    for (let i = 0; i < totalCells; i += 7) {
        const week: { dateStr: string; minutes: number }[] = [];

        for (let j = 0; j < 7; j++) {
            const dateNum = i + j - mondayOffset + 1;

            if (dateNum < 1 || dateNum > daysInMonth) {
                week.push({ dateStr: '', minutes: -1 });
            } else {
                const mm = String(month + 1).padStart(2, '0');
                const dd = String(dateNum).padStart(2, '0');
                const dateStr = `${year}-${mm}-${dd}`;
                const minutes = monthlyMap[dateStr] ?? 0;
                week.push({ dateStr, minutes });
            }
        }

        weeks.push(week);
    }

    return weeks;
}

export function ScrollMatrixCard({ scale = 1 }: ScrollMatrixCardProps) {
    const s = scale;
    const { filter, setFilter } = useScrollMatrixStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const range = filter === 'Minggu Ini' ? 'week' : 'month';
    const { data: matrixItems = [], isLoading } = useScrollMatrixQuery(range);

    const isWeekly = filter === 'Minggu Ini';
    const weekDays = useMemo(() => getCurrentWeekDates(), []);

    const todayStr = useMemo(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    const weeklyDataMap = useMemo(() => {
        const map: Record<string, any> = {};
        if (isWeekly && Array.isArray(matrixItems)) {
            for (const item of matrixItems) {
                if (item.log_date) {
                    const dateKey = item.log_date.split('T')[0];
                    map[dateKey] = item;
                }
            }
        }
        return map;
    }, [isWeekly, matrixItems]);

    const monthlyDataMap = useMemo(() => {
        const map: Record<string, number> = {};
        if (!isWeekly && Array.isArray(matrixItems)) {
            for (const item of matrixItems) {
                if (item.log_date) {
                    const dateKey = item.log_date.split('T')[0];
                    map[dateKey] = item.total_screen_time_minutes || 0;
                }
            }
        }
        return map;
    }, [isWeekly, matrixItems]);

    const calendarWeeks = useMemo(() => getCalendarMonthMatrix(monthlyDataMap), [monthlyDataMap]);

    const handleSelectFilter = (value: 'Minggu Ini' | 'Bulan Ini') => {
        setFilter(value);
        setIsDropdownOpen(false);
    };

    const habitInsight = useMemo(() => {
        let nightMinutes = 0;
        let dayMinutes = 0;

        if (isWeekly) {
            for (const item of Object.values(weeklyDataMap)) {
                nightMinutes += (item.slot_20_22 || 0) + (item.slot_22_00 || 0) + (item.slot_00_02 || 0);
                dayMinutes += (item.slot_08_10 || 0) + (item.slot_10_12 || 0) + (item.slot_12_14 || 0) + (item.slot_14_16 || 0);
            }
        }

        if (nightMinutes > dayMinutes && nightMinutes > 30) {
            return 'Kamu lebih sering scrolling di malam hari ya, yuk coba taruh handphone kamu sejenak menjelang tidur.';
        }
        return 'Pola scrolling kamu terpantau stabil. Tetap jaga jeda aktivitasmu agar mata dan pikiran tetap segar!';
    }, [isWeekly, weeklyDataMap]);

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
                <View className="flex-1">
                    <Text
                        className="font-outfit-extrabold text-[#1c241e]"
                        style={{ fontSize: 20 * s }}
                    >
                        Matriks Pola Scrolling
                    </Text>

                    <Text
                        className="font-outfit-medium text-[#2b362e]"
                        style={{
                            fontSize: 12.5 * s,
                            marginTop: 2 * s,
                        }}
                    >
                        Peta kebiasaan scroll kamu.
                    </Text>
                </View>

                <View className="relative z-20">
                    <TouchableOpacity
                        className="flex-row items-center border border-[#cfdad1] bg-white"
                        style={{
                            paddingHorizontal: 10 * s,
                            paddingVertical: 5 * s,
                            borderRadius: 12 * s,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <Text
                            className="font-outfit-bold text-[#275c43]"
                            style={{ fontSize: 11.5 * s }}
                        >
                            {filter}
                        </Text>

                        <Ionicons
                            name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                            size={12 * s}
                            color="#275c43"
                            style={{ marginLeft: 4 * s }}
                        />
                    </TouchableOpacity>

                    {isDropdownOpen && (
                        <View
                            className="absolute right-0 top-full z-30 border border-[#dce5dc] bg-white"
                            style={{
                                width: 125 * s,
                                marginTop: 6 * s,
                                borderRadius: 12 * s,
                                padding: 5 * s,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 5,
                            }}
                        >
                            {(['Minggu Ini', 'Bulan Ini'] as const).map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    className="flex-row items-center justify-between"
                                    style={{
                                        paddingHorizontal: 9 * s,
                                        paddingVertical: 9 * s,
                                        borderRadius: 8 * s,
                                        backgroundColor:
                                            filter === option ? '#edf3ed' : 'transparent',
                                    }}
                                    activeOpacity={0.7}
                                    onPress={() => handleSelectFilter(option)}
                                >
                                    <Text
                                        className="font-outfit-semibold text-[#275c43]"
                                        style={{ fontSize: 11.5 * s }}
                                    >
                                        {option}
                                    </Text>

                                    {filter === option && (
                                        <Ionicons
                                            name="checkmark"
                                            size={13 * s}
                                            color="#275c43"
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            <View
                className="bg-[#e6ede6]"
                style={{
                    borderRadius: 16 * s,
                    padding: 12 * s,
                    marginTop: 14 * s,
                    backgroundColor: 'rgba(230, 237, 230, 0.75)',
                    minHeight: 180 * s,
                    justifyContent: 'center',
                }}
            >
                {isLoading && (
                    <View style={{ position: 'absolute', alignSelf: 'center', zIndex: 10 }}>
                        <ActivityIndicator size="small" color="#275c43" />
                    </View>
                )}

                {isWeekly ? (
                    <>
                        <View
                            className="flex-row items-center"
                            style={{ marginBottom: 6 * s }}
                        >
                            <View style={{ width: 28 * s }} />

                            <View className="flex-1 flex-row justify-between px-[2px]">
                                <Text className="font-outfit-bold text-[#275c43]" style={{ fontSize: 9.5 * s }}>00:00</Text>
                                <Text className="font-outfit-bold text-[#275c43]" style={{ fontSize: 9.5 * s }}>06:00</Text>
                                <Text className="font-outfit-bold text-[#275c43]" style={{ fontSize: 9.5 * s }}>12:00</Text>
                                <Text className="font-outfit-bold text-[#275c43]" style={{ fontSize: 9.5 * s }}>18:00</Text>
                                <Text className="font-outfit-bold text-[#275c43]" style={{ fontSize: 9.5 * s }}>23:59</Text>
                            </View>
                        </View>

                        {weekDays.map(({ day, dateStr }) => {
                            const rowData = weeklyDataMap[dateStr];
                            const isToday = dateStr === todayStr;

                            return (
                                <View
                                    key={day}
                                    className="flex-row items-center"
                                    style={{
                                        marginVertical: 3 * s,
                                    }}
                                >
                                    <View style={{ width: 28 * s, flexDirection: 'row', alignItems: 'center' }}>
                                        <View
                                            style={{
                                                width: 4 * s,
                                                height: 4 * s,
                                                borderRadius: 2 * s,
                                                backgroundColor: isToday ? '#275c43' : 'transparent',
                                                marginRight: 3 * s,
                                            }}
                                        />
                                        <Text
                                            className="font-outfit-bold text-[#275c43]"
                                            style={{
                                                fontSize: 10.5 * s,
                                                color: '#275c43',
                                            }}
                                        >
                                            {day}
                                        </Text>
                                    </View>

                                    <View className="flex-1 flex-row items-center">
                                        {SLOT_KEYS.map((slotKey) => {
                                            const minutes = (rowData && rowData[slotKey]) ? rowData[slotKey]! : 0;
                                            const tileColor = getMinuteColor(minutes);

                                            return (
                                                <View
                                                    key={slotKey}
                                                    style={{
                                                        flex: 1,
                                                        height: 14 * s,
                                                        borderRadius: 4 * s,
                                                        marginHorizontal: 1.5 * s,
                                                        backgroundColor: tileColor,
                                                    }}
                                                />
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })}
                    </>
                ) : (
                    <>
                        <View
                            className="flex-row items-center"
                            style={{ marginBottom: 6 * s }}
                        >
                            {DAY_LABELS.map((day) => (
                                <View
                                    key={day}
                                    className="flex-1 items-center"
                                >
                                    <Text
                                        className="font-outfit-bold text-[#275c43]"
                                        style={{ fontSize: 9.5 * s }}
                                    >
                                        {day}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <View
                            style={{
                                height: 140 * s,
                                justifyContent: 'space-between',
                            }}
                        >
                            {calendarWeeks.map((week, weekIndex) => (
                                <View
                                    key={weekIndex}
                                    className="flex-row items-center"
                                    style={{
                                        flex: 1,
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    {week.map((cell, dayIndex) => {
                                        const isOutOfMonth = cell.minutes < 0;
                                        const isToday = cell.dateStr === todayStr;
                                        const bgColor = isOutOfMonth ? 'transparent' : getDailyColor(cell.minutes);

                                        return (
                                            <View
                                                key={dayIndex}
                                                className="flex-1 items-center justify-center"
                                            >
                                                <View
                                                    style={{
                                                        width: '78%',
                                                        height: 18 * s,
                                                        borderRadius: 4.5 * s,
                                                        backgroundColor: bgColor,
                                                        borderWidth: isToday ? 1.5 : 0,
                                                        borderColor: isToday ? '#1f4e38' : 'transparent',
                                                        shadowColor: isToday ? '#000' : 'transparent',
                                                        shadowOffset: { width: 0, height: 1 },
                                                        shadowOpacity: isToday ? 0.2 : 0,
                                                        shadowRadius: 2,
                                                        elevation: isToday ? 2 : 0,
                                                    }}
                                                />
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </View>

            <View
                className="flex-row items-end overflow-hidden bg-[#f6ebd0]"
                style={{
                    borderRadius: 16 * s,
                    paddingLeft: 12 * s,
                    paddingRight: 14 * s,
                    paddingTop: 12 * s,
                    paddingBottom: 0,
                    marginTop: 14 * s,
                }}
            >
                <View
                    className="items-center justify-end"
                    style={{
                        width: 68 * s,
                        height: 68 * s,
                        marginRight: 10 * s,
                    }}
                >
                    <Image
                        source={yudaRamenSource}
                        className="h-full w-full"
                        style={{
                            transform: [{ translateY: 4 * s }],
                        }}
                        resizeMode="contain"
                    />
                </View>

                <View
                    className="flex-1"
                    style={{ paddingBottom: 12 * s }}
                >
                    <Text
                        className="font-outfit-extrabold text-[#2b2313]"
                        style={{ fontSize: 16 * s }}
                    >
                        Dari Data di Matriks
                    </Text>

                    <Text
                        className="font-outfit-medium text-[#5e5038]"
                        style={{
                            fontSize: 12 * s,
                            lineHeight: 16 * s,
                            marginTop: 2 * s,
                        }}
                    >
                        {habitInsight}
                    </Text>
                </View>
            </View>
        </View>
    );
}
