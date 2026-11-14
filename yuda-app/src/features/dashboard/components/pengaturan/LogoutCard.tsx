import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface LogoutCardProps {
    scale?: number;
    email?: string | null;
    onLogout: () => void;
}

export function LogoutCard({
    scale = 1,
    email,
    onLogout,
}: LogoutCardProps) {
    const s = scale;
    const btnScale = useSharedValue(1);

    const handlePressIn = () => {
        btnScale.value = withTiming(0.98, { duration: 80 });
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
                className="bg-white"
                style={{
                    borderRadius: 20 * s,
                    padding: 16 * s,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    elevation: 2,
                }}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                        <Text
                            className="font-outfit-extrabold text-[#1c241e]"
                            style={{ fontSize: 16 * s }}
                        >
                            Sesi Akun
                        </Text>
                        <Text
                            className="font-outfit-medium text-[#495a4f]"
                            style={{
                                fontSize: 12 * s,
                                marginTop: 3 * s,
                            }}
                            numberOfLines={1}
                        >
                            {email ? email : 'Tersambung di perangkat ini'}
                        </Text>
                    </View>

                    <Pressable
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onPress={onLogout}
                    >
                        <Animated.View
                            className="flex-row items-center bg-[#fdf2f2]"
                            style={[
                                {
                                    paddingHorizontal: 14 * s,
                                    paddingVertical: 9 * s,
                                    borderRadius: 12 * s,
                                    borderWidth: 1,
                                    borderColor: '#fad2d2',
                                },
                                animatedBtnStyle,
                            ]}
                        >
                            <Ionicons
                                name="log-out-outline"
                                size={15 * s}
                                color="#c53030"
                                style={{ marginRight: 6 * s }}
                            />
                            <Text
                                className="font-outfit-bold text-[#c53030]"
                                style={{ fontSize: 12.5 * s }}
                            >
                                Keluar
                            </Text>
                        </Animated.View>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
