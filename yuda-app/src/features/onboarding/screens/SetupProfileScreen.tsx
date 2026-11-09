import { Ionicons } from '@expo/vector-icons';
import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { updateProfileName } from '@/features/auth/services/authService';
import {
    Image,
    Keyboard,
    Pressable,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    useWindowDimensions,
    View,
} from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedKeyboard,
    useAnimatedStyle,
    useDerivedValue,
    useReducedMotion,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
    Circle,
    Defs,
    Path,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';
import { useAuthStore } from '@/stores/useAuthStore';

const BG = '#f5f3ec';
const REF_W = 420;

const headSource = require('../../../../assets/images/yuda/yudahalfbody.png');
const pawsSource = require('../../../../assets/images/yuda/yuda-hand-half.png');
const headAsset = Image.resolveAssetSource(headSource);
const pawsAsset = Image.resolveAssetSource(pawsSource);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

function FourPointStar({ s }: { s: number }) {
    const k = s * 0.16;
    const d =
        `M 0 ${-s} ` +
        `Q ${k} ${-k} ${s} 0 ` +
        `Q ${k} ${k} 0 ${s} ` +
        `Q ${-k} ${k} ${-s} 0 ` +
        `Q ${-k} ${-k} 0 ${-s} Z`;
    return <Path d={d} fill="#f5c642" />;
}

export default function SetupProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: W, height: H } = useWindowDimensions();
    const reducedMotion = useReducedMotion();

    const { user, userName, userToken, setUserName, completeOnboarding } = useAuthStore();
    const [name, setName] = useState(() => {
        if (user?.name || userName) return user.name || userName || '';

        return user?.full_name?.trim().split(/\s+/)[0]?.slice(0, 12) || '';
    });
    const inputRef = useRef<any>(null);
    const submitting = useRef(false);

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const s = Math.min(W / REF_W, 1.15);
    const cx = W / 2;
    const ringCy = H * 0.72;
    const rings = [H * 0.46, H * 0.32, H * 0.2];
    const cardTop = H * 0.58;

    const headRatio = headAsset?.width && headAsset?.height ? headAsset.height / headAsset.width : 0.65;
    const pawsRatio = pawsAsset?.width && pawsAsset?.height ? pawsAsset.height / pawsAsset.width : 0.21;
    const headW = Math.min(W * 0.78, 330 * s);
    const headH = headW * headRatio;
    const pawsW = headW * 0.98;
    const pawsH = pawsW * pawsRatio;

    const cardHeight = H - cardTop;
    const cardBottomPad = Math.max(insets.bottom, 20) + 16 * s;
    const btnHeight = 64 * s;
    const inputAreaBottom = (38 + 60 + 26) * s;
    const maxButtonTravel = Math.max(0, cardHeight - cardBottomPad - btnHeight - inputAreaBottom);

    const bgFade = useSharedValue(0);
    const titleY = useSharedValue(-24);
    const titleFade = useSharedValue(0);

    const cardY = useSharedValue(90);
    const cardFade = useSharedValue(0);

    const headY = useSharedValue(110);
    const headScale = useSharedValue(0.92);
    const headFade = useSharedValue(0);

    const pawsY = useSharedValue(40);
    const pawsScale = useSharedValue(0.5);
    const pawsFade = useSharedValue(0);

    const starScale = useSharedValue(0);
    const starTwinkle = useSharedValue(1);
    const breathY = useSharedValue(0);

    const btnScale = useSharedValue(1);
    const btnY = useSharedValue(0);
    const inputFocus = useSharedValue(0);
    const inputError = useSharedValue(0);
    const shakeX = useSharedValue(0);

    const keyboard = useAnimatedKeyboard();
    const keyboardLift = useDerivedValue(() => {
        return Math.max(keyboard.height.value - insets.bottom, 0);
    });

    const btnLift = useDerivedValue(() => {
        return Math.min(keyboardLift.value, maxButtonTravel);
    });

    const cardLift = useDerivedValue(() => {
        return Math.max(0, keyboardLift.value - btnLift.value);
    });

    useEffect(() => {
        if (!fontsLoaded) return;

        if (reducedMotion) {
            bgFade.value = 1;
            titleY.value = 0;
            titleFade.value = 1;
            cardY.value = 0;
            cardFade.value = 1;
            headY.value = 0;
            headScale.value = 1;
            headFade.value = 1;
            pawsY.value = 0;
            pawsScale.value = 1;
            pawsFade.value = 1;
            starScale.value = 1;
            return;
        }

        bgFade.value = 0;
        titleY.value = -24;
        titleFade.value = 0;
        cardY.value = 90;
        cardFade.value = 0;
        headY.value = 110;
        headScale.value = 0.92;
        headFade.value = 0;
        pawsY.value = 40;
        pawsScale.value = 0.5;
        pawsFade.value = 0;
        starScale.value = 0;

        bgFade.value = withTiming(1, { duration: 400 });
        titleY.value = withTiming(0, { duration: 420, easing: EASE_OUT });
        titleFade.value = withTiming(1, { duration: 350 });

        cardY.value = withDelay(60, withSpring(0, { duration: 450, dampingRatio: 0.82 }));
        cardFade.value = withDelay(60, withTiming(1, { duration: 300 }));

        headY.value = withDelay(150, withSpring(0, { duration: 520, dampingRatio: 0.74 }));
        headScale.value = withDelay(150, withSpring(1, { duration: 500, dampingRatio: 0.76 }));
        headFade.value = withDelay(150, withTiming(1, { duration: 250 }));

        pawsY.value = withDelay(250, withSpring(0, { duration: 440, dampingRatio: 0.72 }));
        pawsScale.value = withDelay(250, withSpring(1, { duration: 440, dampingRatio: 0.72 }));
        pawsFade.value = withDelay(250, withTiming(1, { duration: 200 }));

        starScale.value = withDelay(360, withSpring(1, { duration: 420, dampingRatio: 0.65 }));

        const idleTimer = setTimeout(() => {
            breathY.value = withRepeat(
                withSequence(
                    withTiming(-3.5, { duration: 1800, easing: EASE_IN_OUT }),
                    withTiming(0, { duration: 1800, easing: EASE_IN_OUT })
                ),
                -1,
                true
            );

            starTwinkle.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 1600, easing: EASE_IN_OUT }),
                    withTiming(0.92, { duration: 1600, easing: EASE_IN_OUT })
                ),
                -1,
                true
            );
        }, 750);

        return () => {
            clearTimeout(idleTimer);
            cancelAnimation(breathY);
            cancelAnimation(starTwinkle);
        };
    }, [fontsLoaded, reducedMotion]);

    useEffect(() => {
        if (fontsLoaded && user?.name?.trim()) {
            completeOnboarding()
                .then(() => router.replace('/'))
                .catch((error) => {
                    console.error('Gagal melewati setup profil:', error);
                });
        }
    }, [fontsLoaded, user?.name, completeOnboarding, router]);

    const bgStyle = useAnimatedStyle(() => ({
        opacity: bgFade.value,
    }));

    const titleStyle = useAnimatedStyle(() => {
        const kbFade = interpolate(cardLift.value, [0, 80], [1, 0.35], Extrapolation.CLAMP);
        const kbShift = interpolate(cardLift.value, [0, 80], [0, -14 * s], Extrapolation.CLAMP);
        return {
            opacity: titleFade.value * kbFade,
            transform: [{ translateY: titleY.value + kbShift }],
        };
    });

    const headStyle = useAnimatedStyle(() => ({
        opacity: headFade.value,
        transform: [
            { translateY: headY.value + breathY.value - cardLift.value },
            { scale: headScale.value },
        ],
    }));

    const pawsStyle = useAnimatedStyle(() => ({
        opacity: pawsFade.value,
        transform: [
            { translateY: pawsY.value + breathY.value },
            { scale: pawsScale.value },
        ],
    }));

    const cardStyle = useAnimatedStyle(() => ({
        opacity: cardFade.value,
        transform: [{ translateY: cardY.value - cardLift.value }],
    }));

    const star1Style = useAnimatedStyle(() => ({
        transform: [{ scale: starScale.value * starTwinkle.value }],
    }));

    const star2Style = useAnimatedStyle(() => ({
        transform: [{ scale: starScale.value * (1 / Math.max(starTwinkle.value, 0.5)) }],
    }));

    const inputContainerStyle = useAnimatedStyle(() => ({
        borderColor: inputError.value > 0 ? '#d64545' : inputFocus.value > 0 ? '#2e6b4e' : 'transparent',
        backgroundColor: inputError.value > 0 ? '#fbeef0' : inputFocus.value > 0 ? '#e1ebe2' : '#e6ece5',
        transform: [{ translateX: shakeX.value }],
    }));

    const errorTextStyle = useAnimatedStyle(() => ({
        opacity: inputError.value,
    }));

    const btnAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: btnY.value - btnLift.value },
            { scale: btnScale.value },
        ],
    }));

    const handleBtnPressIn = () => {
        btnScale.value = withTiming(0.96, { duration: 90, easing: EASE_OUT });
        btnY.value = withTiming(2.5, { duration: 90, easing: EASE_OUT });
    };

    const handleBtnPressOut = () => {
        btnScale.value = withSpring(1, { duration: 220, dampingRatio: 0.8 });
        btnY.value = withSpring(0, { duration: 220, dampingRatio: 0.8 });
    };

    const triggerError = () => {
        shakeX.value = withSequence(
            withTiming(-8, { duration: 45 }),
            withRepeat(withTiming(8, { duration: 75 }), 4, true),
            withTiming(0, { duration: 45 })
        );
        inputError.value = withTiming(1, { duration: 150 });
        inputRef.current?.focus();
    };

    const handleContinue = async () => {
        if (submitting.current) return;

        const trimmed = name.trim();
        if (!trimmed) {
            triggerError();
            return;
        }

        submitting.current = true;
        Keyboard.dismiss();
        try {
            if (!userToken) {
                throw new Error('Sesi login tidak ditemukan.');
            }

            await updateProfileName(userToken, trimmed);
            await setUserName(trimmed);
            await completeOnboarding();
            router.replace('/');
        } catch (error) {
            console.error('Gagal menyimpan nama panggilan:', error);
            submitting.current = false;
        }
    };

    if (!fontsLoaded) return null;

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="flex-1 bg-[#f5f3ec]">
                <StatusBar style="dark" />

                <Animated.View className="absolute inset-0" style={bgStyle} pointerEvents="none">
                    <Svg width={W} height={H} className="absolute inset-0">
                        <Defs>
                            <RadialGradient
                                id="glow"
                                cx={cx}
                                cy={H * 0.46}
                                rx={W * 0.85}
                                ry={H * 0.36}
                                gradientUnits="userSpaceOnUse"
                            >
                                <Stop offset="0" stopColor="#cce0d2" stopOpacity="0.8" />
                                <Stop offset="0.6" stopColor="#e1ece5" stopOpacity="0.45" />
                                <Stop offset="1" stopColor={BG} stopOpacity="0" />
                            </RadialGradient>
                        </Defs>

                        <Rect x={0} y={0} width={W} height={H} fill="url(#glow)" />

                        {rings.map((r, i) => (
                            <Circle
                                key={i}
                                cx={cx}
                                cy={ringCy}
                                r={r}
                                stroke="#b8c8ba"
                                strokeWidth={1.2 * s}
                                strokeDasharray={`${7 * s} ${7 * s}`}
                                fill="none"
                            />
                        ))}
                    </Svg>
                </Animated.View>

                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            left: W * 0.11 - 15 * s,
                            top: H * 0.36 - 15 * s,
                            width: 30 * s,
                            height: 30 * s,
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        star1Style,
                    ]}
                    pointerEvents="none"
                >
                    <Svg width={30 * s} height={30 * s} viewBox="-15 -15 30 30">
                        <FourPointStar s={14 * s} />
                    </Svg>
                </Animated.View>

                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            left: W * 0.92 - 13 * s,
                            top: H * 0.54 - 13 * s,
                            width: 26 * s,
                            height: 26 * s,
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        star2Style,
                    ]}
                    pointerEvents="none"
                >
                    <Svg width={26 * s} height={26 * s} viewBox="-15 -15 30 30">
                        <FourPointStar s={12 * s} />
                    </Svg>
                </Animated.View>

                {/* ── HEADER JUDUL ── */}
                <Animated.View
                    accessible
                    accessibilityRole="header"
                    className="items-center px-6"
                    style={[
                        { paddingTop: Math.max(insets.top, 24) + 48 * s },
                        titleStyle,
                    ]}
                >
                    <Text
                        className="text-center text-[#1f2923]"
                        style={[
                            { fontFamily: 'Outfit_800ExtraBold', fontSize: 33 * s, lineHeight: 42 * s },
                        ]}
                    >
                        Halo! Kamu mau{'\n'}aku panggil{'\n'}siapa?
                    </Text>
                </Animated.View>

                <Animated.Image
                    source={headSource}
                    style={[
                        {
                            position: 'absolute',
                            top: cardTop - headH + 18 * s,
                            left: (W - headW) / 2,
                            width: headW,
                            height: headH,
                            zIndex: 1,
                        },
                        headStyle,
                    ]}
                    resizeMode="contain"
                />

                <Animated.View
                    className="absolute bottom-0 left-0 right-0 z-[5] rounded-t-[32px] bg-[#fdfcf9]"
                    style={[
                        {
                            top: cardTop,
                            paddingHorizontal: 26 * s,
                            paddingBottom: cardBottomPad,
                            elevation: 6,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -3 },
                            shadowOpacity: 0.05,
                            shadowRadius: 10,
                        },
                        cardStyle,
                    ]}
                >
                    {/* Cakar Kapibara di bibir kartu */}
                    <Animated.Image
                        source={pawsSource}
                        style={[
                            {
                                position: 'absolute',
                                top: -pawsH * 0.46,
                                left: (W - pawsW) / 2,
                                width: pawsW,
                                height: pawsH,
                                zIndex: 10,
                            },
                            pawsStyle,
                        ]}
                        resizeMode="contain"
                    />

                    {/* Kotak Input Nama */}
                    <Animated.View
                        className="flex-row items-center px-4"
                        style={[
                            { height: 60 * s, borderRadius: 16 * s, marginTop: 38 * s, borderWidth: 1.5 },
                            inputContainerStyle,
                        ]}
                    >
                        <Ionicons
                            name="person-outline"
                            size={22 * s}
                            color="#3f5146"
                            style={{ marginRight: 12 * s }}
                        />
                        <TextInput
                            ref={inputRef}
                            className="flex-1 py-0 text-[#1f2923]"
                            style={[{ fontFamily: 'Outfit_700Bold', fontSize: 20 * s }]}
                            value={name}
                            onChangeText={(text) => {
                                setName(text.slice(0, 12));
                                if (inputError.value > 0) inputError.value = withTiming(0, { duration: 150 });
                            }}
                            placeholder="Yuda"
                            maxLength={12}
                            placeholderTextColor="#8c9c91"
                            selectionColor="#2e6b4e"
                            autoCapitalize="words"
                            autoCorrect={false}
                            returnKeyType="done"
                            onFocus={() => {
                                inputFocus.value = withTiming(1, { duration: 150 });
                            }}
                            onBlur={() => {
                                inputFocus.value = withTiming(0, { duration: 150 });
                            }}
                            onSubmitEditing={handleContinue}
                        />
                    </Animated.View>

                    <Animated.Text
                        className="ml-1 mt-1 text-[#d64545]"
                        style={[{ fontFamily: 'Outfit_600SemiBold', fontSize: 13 * s }, errorTextStyle]}
                    >
                        Isi dulu ya, biar aku tahu harus panggil kamu apa
                    </Animated.Text>

                    <View className="flex-1" />

                    <AnimatedPressable
                        className="items-center justify-center bg-[#2e6b4e] border-b-[#204d37]"
                        style={[
                            {
                                height: btnHeight,
                                borderRadius: 16 * s,
                                borderBottomWidth: 5 * s,
                            },
                            btnAnimatedStyle,
                        ]}
                        onPressIn={handleBtnPressIn}
                        onPressOut={handleBtnPressOut}
                        onPress={handleContinue}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel="Yuk Lanjut"
                    >
                        <Text
                            className="text-white"
                            style={[{ fontFamily: 'Outfit_700Bold', fontSize: 20 * s }]}
                        >
                            Yuk Lanjut
                        </Text>
                    </AnimatedPressable>
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    );
}
