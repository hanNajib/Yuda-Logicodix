import { Image, Text, View } from 'react-native';

const yudaMakanSource = require('../../../../assets/images/yuda/yuda-makan.png');

interface QuizHeaderBannerProps {
    displayName: string;
    scale: number;
}

export function QuizHeaderBanner({ displayName, scale: s }: QuizHeaderBannerProps) {
    return (
        <View
            className="w-full bg-[#e2e7e1] flex-row items-center overflow-hidden mb-4"
            style={{
                borderRadius: 20 * s,
                paddingVertical: 14 * s,
                paddingHorizontal: 14 * s,
            }}
        >
            <Image
                source={yudaMakanSource}
                style={{
                    width: 105 * s,
                    height: 105 * s,
                }}
                resizeMode="contain"
            />

            <View className="flex-1 ml-3 pr-1 justify-center">
                <Text
                    className="text-[#1f2923] font-outfit-bold leading-tight"
                    style={{
                        fontFamily: 'Outfit_700Bold',
                        fontSize: 16 * s,
                        lineHeight: 22 * s,
                    }}
                >
                    Kuis ini membantu Yuda Untuk Mengenali Emosi kamu
                </Text>
                <Text
                    className="text-[#526356] font-outfit-medium mt-1.5"
                    style={{
                        fontFamily: 'Outfit_500Medium',
                        fontSize: 13 * s,
                    }}
                >
                    Jawab dengan jujur ya {displayName}
                </Text>
            </View>
        </View>
    );
}

