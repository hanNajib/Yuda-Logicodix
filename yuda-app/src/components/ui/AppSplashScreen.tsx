import React, { useEffect } from 'react';
import { View, Image, Text, useWindowDimensions, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const yudaHomeSource = require('@/assets/images/yuda/yuda-home.png');

interface AppSplashScreenProps {
    onFinish: () => void;
}

export function AppSplashScreen({ onFinish }: AppSplashScreenProps) {
    const { width: W } = useWindowDimensions();
    const screenDims = Dimensions.get('screen');
    const scale = W / 420;

    const opacity = useSharedValue(0);
    const mascotScale = useSharedValue(0.7);
    const mascotTranslateY = useSharedValue(20);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(15);
    const containerOpacity = useSharedValue(1);

    useEffect(() => {
        // 1. Fade in & Bounce Yuda mascot
        opacity.value = withTiming(1, { duration: 350 });
        mascotScale.value = withSpring(1, {
            damping: 12,
            stiffness: 120,
        });
        mascotTranslateY.value = withSpring(0, {
            damping: 14,
            stiffness: 100,
        });

        // 2. Animate logo text
        textOpacity.value = withDelay(
            300,
            withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
        );
        textTranslateY.value = withDelay(
            300,
            withSpring(0, { damping: 14, stiffness: 100 })
        );

        // 3. Exit transition smoothly after a brief pause
        const timer = setTimeout(() => {
            containerOpacity.value = withTiming(
                0,
                { duration: 400, easing: Easing.inOut(Easing.ease) },
                (finished) => {
                    if (finished) {
                        runOnJS(onFinish)();
                    }
                }
            );
        }, 1300);

        return () => clearTimeout(timer);
    }, []);

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    const mascotAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: mascotScale.value },
            { translateY: mascotTranslateY.value },
        ],
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    width: screenDims.width,
                    height: screenDims.height,
                },
                containerAnimatedStyle,
            ]}
        >
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <View style={styles.centerContent}>
                <Animated.View style={[mascotAnimatedStyle, styles.mascotContainer]}>
                    <Image
                        source={yudaHomeSource}
                        style={{
                            width: 170 * scale,
                            height: 170 * scale,
                        }}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.View style={[textAnimatedStyle, styles.textContainer]}>
                    <Text
                        style={[
                            styles.brandTitle,
                            { fontSize: Math.round(36 * scale) },
                        ]}
                    >
                        Yuda
                    </Text>
                    <Text
                        style={[
                            styles.brandTagline,
                            { fontSize: Math.round(14 * scale) },
                        ]}
                    >
                        Teman mindful scrolling kamu
                    </Text>
                </Animated.View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#2F6B4F',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        elevation: 999,
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    mascotContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    brandTitle: {
        fontFamily: 'Outfit_800ExtraBold',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    brandTagline: {
        fontFamily: 'Outfit_500Medium',
        color: '#D8EFE3',
        marginTop: 4,
    },
});
