import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const iconTenang = require('@/assets/images/yuda/yuda_xD.png');
const iconCemas = require('@/assets/images/yuda/yuda_xD.png');
const iconBosan = require('@/assets/images/yuda/yuda_xD.png');
const iconLelah = require('@/assets/images/yuda/yuda_xD.png');

const MOOD_ITEMS = [
    { id: 'tenang', label: 'Tenang', icon: iconTenang },
    { id: 'cemas', label: 'Cemas', icon: iconCemas },
    { id: 'bosan', label: 'Bosan', icon: iconBosan },
    { id: 'lelah', label: 'Lelah', icon: iconLelah },
];

interface MoodSelectCardProps {
    userName: string;
    scale?: number;
}

export function MoodSelectCard({
    userName,
    scale = 1,
}: MoodSelectCardProps) {
    const s = scale;
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

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
            <Text
                className="font-outfit-extrabold text-[#1c241e]"
                style={{ fontSize: 22 * s }}
            >
                Halo {userName}
            </Text>

            <Text
                className="font-outfit-semibold text-[#2b362e]"
                style={{
                    fontSize: 13 * s,
                    marginTop: 2 * s,
                }}
            >
                Apa yang lagi kamu alamin sekarang?
            </Text>

            <View
                className="flex-row items-center justify-between"
                style={{ marginTop: 20 * s }}
            >
                {MOOD_ITEMS.map((item) => {
                    const isSelected = selectedMood === item.id;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.8}
                            onPress={() => setSelectedMood(item.id)}
                            className="flex-1 items-center justify-center"
                        >
                            <Image
                                source={item.icon}
                                resizeMode="contain"
                                style={{
                                    width: 48 * s,
                                    height: 48 * s,
                                    marginBottom: 8 * s,
                                }}
                            />

                            <View
                                className="items-center justify-center"
                                style={{
                                    borderRadius: 14 * s,
                                    paddingVertical: 5 * s,
                                    paddingHorizontal: 10 * s,
                                    backgroundColor: isSelected
                                        ? '#275c43'
                                        : 'rgba(206, 206, 206, 0.4)',
                                }}
                            >
                                <Text
                                    className="font-outfit-bold text-center"
                                    style={{
                                        fontSize: 11 * s,
                                        color: isSelected
                                            ? '#ffffff'
                                            : '#275c43',
                                    }}
                                    numberOfLines={1}
                                >
                                    {item.label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}