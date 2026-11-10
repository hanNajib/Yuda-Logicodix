import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface TipsCardProps {
    scale?: number;
    title?: string;
    content?: string;
}

export function TipsCard({
    scale = 1,
    title = 'Tips Hari Ini',
    content = 'Coba alihkan fokusmu ke aktivitas yang kamu sukai, meski hanya sebentar.',
}: TipsCardProps) {
    const s = scale;

    return (
        <View
            className="flex-row items-center bg-[#f6ebd0]"
            style={{
                borderRadius: 20 * s,
                padding: 14 * s,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View
                className="items-center justify-center bg-[#f5b938]"
                style={{
                    width: 48 * s,
                    height: 48 * s,
                    borderRadius: 14 * s,
                    marginRight: 14 * s,
                }}
            >
                <Ionicons name="bulb" size={26 * s} color="#ffffff" />
            </View>

            <View className="flex-1">
                <Text
                    className="font-outfit-extrabold text-[#2b2313]"
                    style={{ fontSize: 14.5 * s }}
                >
                    {title}
                </Text>

                <Text
                    className="font-outfit-medium text-[#5e5038]"
                    style={{
                        fontSize: 12.5 * s,
                        lineHeight: 18 * s,
                        marginTop: 2 * s,
                    }}
                >
                    {content}
                </Text>
            </View>
        </View>
    );
}

