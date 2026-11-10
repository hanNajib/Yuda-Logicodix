import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';

const yudaHomeSource = require('@/assets/images/yuda/yuda-home.png');

interface HeaderGreetingProps {
    userName: string;
    scale?: number;
}

export function HeaderGreeting({
    userName,
    scale = 1,
}: HeaderGreetingProps) {
    const s = scale;
    const currentDate = new Date();
    const hour = currentDate.getHours();

    const greeting =
        hour >= 4 && hour < 11
            ? 'Pagi'
            : hour >= 11 && hour < 15
              ? 'Siang'
              : hour >= 15 && hour < 18
                ? 'Sore'
                : 'Malam';

    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(currentDate);

    return (
        <View
            className="flex-row items-end overflow-hidden bg-[#F6F3EC]"
            style={{
                borderRadius: 24 * s,
                paddingLeft: 10 * s,
                paddingRight: 14 * s,
                paddingTop: 16 * s,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View
                className="items-center justify-end"
                style={{
                    width: 125 * s,
                    height: 125 * s,
                }}
            >
                <Image
                    source={yudaHomeSource}
                    resizeMode="contain"
                    className="h-full w-full"
                    style={{
                        transform: [{ translateY: 10 * s }],
                    }}
                />
            </View>

            <View
                className="flex-1 items-start"
                style={{
                    marginLeft: 9 * s,
                    paddingBottom: 14 * s,
                }}
            >
                <View className="relative self-stretch">
                    <View
                        className="absolute z-10 h-0 w-0 border-y-transparent"
                        style={{
                            top: 40 * s,
                            left: -8 * s,
                            borderTopWidth: 6 * s,
                            borderBottomWidth: 6 * s,
                            borderRightWidth: 10 * s,
                            borderRightColor: 'rgba(230, 237, 230, 0.85)',
                        }}
                    />

                    <View
                        className="self-stretch border-[1.5px] border-white/80 bg-[#E6EDE6]/75"
                        style={{
                            borderRadius: 16 * s,
                            padding: 16 * s,
                            shadowColor: '#2e6b4e',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.06,
                            shadowRadius: 4,
                        }}
                    >
                        <Text
                            className="font-outfit-extrabold text-[#1f2923]"
                            style={{
                                fontSize: 22 * s,
                                lineHeight: 25 * s,
                            }}
                        >
                            {greeting},{' '}
                            <Text className="text-[#2e6b4e]">
                                {userName}
                            </Text>
                        </Text>

                        <Text
                            className="mt-0.5 font-outfit-medium text-[#495a4f]"
                            style={{
                                fontSize: 12 * s,
                            }}
                        >
                            Bagaimana kabarmu hari ini?
                        </Text>
                    </View>
                </View>

                <View
                    className="mt-2 flex-row items-center border-[1.5px] border-white/80 bg-[#E6EDE6]/75"
                    style={{
                        paddingHorizontal: 16 * s,
                        paddingVertical: 5 * s,
                        borderRadius: 24 * s,
                    }}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={13 * s}
                        color="#2e6b4e"
                        style={{ marginRight: 5 * s }}
                    />

                    <Text
                        className="font-outfit-bold text-[#2e6b4e]"
                        style={{
                            fontSize: 11.5 * s,
                        }}
                    >
                        {formattedDate}
                    </Text>
                </View>
            </View>
        </View>
    );
}