import React from 'react';
import { Image, Text, View } from 'react-native';

const yudaPolaSource = require('@/assets/images/yuda/yuda-pola.png');

interface PolaHeaderGreetingProps {
    scale?: number;
}

export function PolaHeaderGreeting({ scale = 1 }: PolaHeaderGreetingProps) {
    const s = scale;

    const charWidth = 125 * s;
    const charHeight = 133 * s;
    const characterOffsetY = 10 * s;

    return (
        <View
            className="flex-row items-end overflow-hidden bg-[#F6F3EC]"
            style={{
                borderRadius: 24 * s,
                paddingLeft: 10 * s,
                paddingRight: 16 * s,
                paddingTop: 16 * s,
                paddingBottom: 0,
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View
                className="items-center justify-end"
                style={{
                    width: charWidth,
                    height: charHeight,
                    marginBottom: 0,
                    overflow: 'visible',
                }}
            >
                <Image
                    source={yudaPolaSource}
                    className="h-full w-full"
                    style={{
                        transform: [{ translateY: characterOffsetY }],
                    }}
                    resizeMode="contain"
                />
            </View>

            <View
                className="flex-1 justify-center"
                style={{
                    paddingBottom: 30 * s,
                    marginLeft: 10 * s,
                }}
            >
                <Text
                    className="font-outfit-extrabold text-[#1f2923]"
                    style={{
                        fontSize: 20 * s,
                        lineHeight: 23 * s,
                    }}
                >
                    Selamat Datang di{' '}
                    {'\n'}
                    Dasbor Pola
                </Text>

                <Text
                    className="font-outfit-medium text-[#495a4f]"
                    style={{
                        fontSize: 14 * s,
                        lineHeight: 16 * s,
                        marginTop: 6 * s,
                    }}
                >
                    Yuk pahami ritme scrollmu tanpa rasa menghakimi
                </Text>
            </View>
        </View>
    );
}

