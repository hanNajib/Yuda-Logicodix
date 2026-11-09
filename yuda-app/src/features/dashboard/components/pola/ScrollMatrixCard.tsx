import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const yudaRamenSource = require('@/assets/images/yuda/yuda-makan.png');

interface ScrollMatrixCardProps {
    scale?: number;
}

type TileType = 'empty' | 'green' | 'yellow' | 'red' | 'coral';

interface DayMatrixRow {
    day: string;
    tiles: TileType[];
}

const MATRIX_DATA: DayMatrixRow[] = [
    {
        day: 'Sen',
        tiles: ['red', 'empty', 'empty', 'green', 'green', 'yellow', 'empty', 'green', 'yellow', 'coral', 'coral'],
    },
    {
        day: 'Sel',
        tiles: ['coral', 'empty', 'empty', 'empty', 'green', 'green', 'yellow', 'empty', 'green', 'red', 'coral'],
    },
    {
        day: 'Rab',
        tiles: ['empty', 'empty', 'empty', 'empty', 'green', 'green', 'empty', 'empty', 'green', 'red', 'coral'],
    },
    {
        day: 'Kam',
        tiles: ['coral', 'empty', 'empty', 'empty', 'green', 'green', 'yellow', 'green', 'green', 'yellow', 'red'],
    },
    {
        day: 'Jum',
        tiles: ['coral', 'empty', 'empty', 'empty', 'green', 'green', 'yellow', 'empty', 'yellow', 'red', 'coral'],
    },
    {
        day: 'Sab',
        tiles: ['coral', 'empty', 'empty', 'empty', 'yellow', 'green', 'yellow', 'green', 'green', 'red', 'coral'],
    },
    {
        day: 'Min',
        tiles: ['yellow', 'empty', 'empty', 'empty', 'green', 'green', 'green', 'green', 'yellow', 'yellow', 'coral'],
    },
];

function getTileColor(type: TileType): string {
    switch (type) {
        case 'green':
            return '#275c43';
        case 'yellow':
            return '#f5b838';
        case 'red':
            return '#e85a4f';
        case 'coral':
            return '#fca5a5';
        case 'empty':
        default:
            return '#ffffff';
    }
}

export function ScrollMatrixCard({ scale = 1 }: ScrollMatrixCardProps) {
    const s = scale;
    const [filter] = useState('Minggu Ini');

    const charWidth = 68 * s;
    const charHeight = 68 * s;

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

                <TouchableOpacity
                    className="flex-row items-center border border-[#cfdad1] bg-white"
                    style={{
                        paddingHorizontal: 10 * s,
                        paddingVertical: 5 * s,
                        borderRadius: 12 * s,
                    }}
                    activeOpacity={0.8}
                >
                    <Text
                        className="font-outfit-bold text-[#275c43]"
                        style={{ fontSize: 11.5 * s }}
                    >
                        {filter}
                    </Text>

                    <Ionicons
                        name="chevron-down"
                        size={12 * s}
                        color="#275c43"
                        style={{ marginLeft: 4 * s }}
                    />
                </TouchableOpacity>
            </View>

            <View
                className="bg-[#e6ede6]"
                style={{
                    borderRadius: 16 * s,
                    padding: 12 * s,
                    marginTop: 14 * s,
                    backgroundColor: 'rgba(230, 237, 230, 0.75)',
                }}
            >
                <View
                    className="flex-row items-center"
                    style={{ marginBottom: 6 * s }}
                >
                    <View style={{ width: 28 * s }} />

                    <View className="flex-1 flex-row justify-between px-[2px]">
                        <Text
                            className="font-outfit-bold text-[#275c43]"
                            style={{ fontSize: 9.5 * s }}
                        >
                            00:00
                        </Text>

                        <Text
                            className="font-outfit-bold text-[#275c43]"
                            style={{ fontSize: 9.5 * s }}
                        >
                            06:00
                        </Text>

                        <Text
                            className="font-outfit-bold text-[#275c43]"
                            style={{ fontSize: 9.5 * s }}
                        >
                            12:00
                        </Text>

                        <Text
                            className="font-outfit-bold text-[#275c43]"
                            style={{ fontSize: 9.5 * s }}
                        >
                            18:00
                        </Text>

                        <Text
                            className="font-outfit-bold text-[#275c43]"
                            style={{ fontSize: 9.5 * s }}
                        >
                            23:00
                        </Text>
                    </View>
                </View>

                {MATRIX_DATA.map((row) => (
                    <View
                        key={row.day}
                        className="flex-row items-center"
                        style={{ marginVertical: 3 * s }}
                    >
                        <Text
                            className="font-outfit-bold text-[#275c43]"
                            style={{
                                width: 28 * s,
                                fontSize: 10.5 * s,
                            }}
                        >
                            {row.day}
                        </Text>

                        <View className="flex-1 flex-row items-center">
                            {row.tiles.map((tileType, idx) => (
                                <View
                                    key={idx}
                                    style={{
                                        flex: 1,
                                        height: 14 * s,
                                        borderRadius: 4 * s,
                                        marginHorizontal: 2 * s,
                                        backgroundColor: getTileColor(tileType),
                                    }}
                                />
                            ))}
                        </View>
                    </View>
                ))}
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
                        width: charWidth,
                        height: charHeight,
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
                        Kamu lebih sering scrolling di malam hari ya, yuk coba taruh handphone kamu sejenak.
                    </Text>
                </View>
            </View>
        </View>
    );
}
