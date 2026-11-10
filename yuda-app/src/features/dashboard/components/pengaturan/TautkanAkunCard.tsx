import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const yudaQuestioningSource = require('../../../../../assets/images/yuda/yuda-alert-half.png');

interface TautkanAkunCardProps {
    scale?: number;
    onLinkGoogle?: () => void;
}

function GoogleColorIcon({ size = 22 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48">
            <Path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <Path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <Path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <Path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
        </Svg>
    );
}

export function TautkanAkunCard({
    scale = 1,
    onLinkGoogle,
}: TautkanAkunCardProps) {
    const s = scale;
    const btnScale = useSharedValue(1);

    const handlePressIn = () => {
        btnScale.value = withTiming(0.96, { duration: 80 });
    };

    const handlePressOut = () => {
        btnScale.value = withSpring(1, {
            duration: 200,
            dampingRatio: 0.8,
        });
    };

    const animatedBtnStyle = useAnimatedStyle(() => ({
        transform: [{ scale: btnScale.value }],
    }));

    return (
        <View
            className="bg-[rgba(206,206,206,0.4)]"
            style={{
                borderRadius: 24 * s,
                padding: 12 * s,
            }}
        >
            <View
                className="relative justify-center overflow-hidden bg-white"
                style={{
                    height: 148 * s,
                    borderRadius: 20 * s,
                }}
            >
                <View
                    className="absolute left-0 z-[1] items-center justify-end"
                    style={{
                        width: 145 * s,
                        height: 160 * s,
                        bottom: -8 * s,
                    }}
                >
                    <Image
                        source={yudaQuestioningSource}
                        className="absolute bottom-0"
                        style={{
                            left: 10,
                            width: 125 * s,
                            height: 140 * s,
                        }}
                        resizeMode="contain"
                    />
                </View>

                <View
                    className="z-[2] flex-1 justify-center"
                    style={{
                        marginLeft: 146 * s,
                        marginRight: 10 * s,
                    }}
                >
                    <Text
                        className="font-outfit-extrabold text-[#1c241e]"
                        style={{
                            fontSize: 16 * s,
                            lineHeight: 20 * s,
                        }}
                    >
                        Kamu Belum{'\n'}Menautkan Akun Kamu
                    </Text>

                    <Text
                        className="font-outfit-medium text-[#495a4f]"
                        style={{
                            fontSize: 12 * s,
                            lineHeight: 16 * s,
                            marginTop: 4 * s,
                        }}
                    >
                        Kamu mungkin akan kehilangan progress kamu saat ini,
                        yuk tautkan sekarang!
                    </Text>
                </View>
            </View>

            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onLinkGoogle}
                style={{
                    marginTop: 14 * s,
                }}
            >
                <Animated.View
                    className="flex-row items-center justify-center bg-[#275c43]"
                    style={[
                        {
                            height: 54 * s,
                            borderRadius: 16 * s,
                        },
                        animatedBtnStyle,
                    ]}
                >
                    <Text
                        className="font-outfit-bold text-white"
                        style={{
                            fontSize: 16 * s,
                            marginRight: 8 * s,
                        }}
                    >
                        Lanjut dengan Google
                    </Text>

                    <GoogleColorIcon size={22 * s} />
                </Animated.View>
            </Pressable>
        </View>
    );
}
