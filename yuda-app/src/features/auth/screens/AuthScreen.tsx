import {
    loginWithGoogleNative,
    signInWithNativeGoogle,
} from '@/features/auth/services/authService';
import { useAuthStore } from '@/stores/useAuthStore';
import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { GoogleIcon } from '../../../../assets/icons/GoogleIcon';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    ActivityIndicator,
    Alert,
    Image,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    Polygon,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';

const BG = '#f5f3ec';

const REF_W = 440;

function Sparkle({ x, y, s }: { x: number; y: number; s: number }) {
    const k = s * 0.1;
    const d =
        `M ${x} ${y - s} ` +
        `Q ${x + k} ${y - k} ${x + s} ${y} ` +
        `Q ${x + k} ${y + k} ${x} ${y + s} ` +
        `Q ${x - k} ${y + k} ${x - s} ${y} ` +
        `Q ${x - k} ${y - k} ${x} ${y - s} Z`;
    return <Path d={d} fill="#ffffff" />;
}

export default function AuthScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: W, height: H } = useWindowDimensions();
    const [isLoading, setIsLoading] = useState(false);
    const setAuthSession = useAuthStore((state) => state.setAuthSession);
    const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const s = W / REF_W;
    const cx = W / 2;

    const charW = W * 0.66;
    const charH = charW * 1.26;
    const charTop = H * 0.146;

    const RAYS = [
        { deg: -17, half: 0.11 },
        { deg: 0, half: 0.125 },
        { deg: 17, half: 0.11 },
    ];
    const rayOriginY = -H * 0.2;
    const rayLen = H * 0.95;
    const rays = RAYS.map(({ deg, half }) => {
        const a = (deg * Math.PI) / 180;
        const p = (ang: number) =>
            `${cx + Math.sin(ang) * rayLen},${rayOriginY + Math.cos(ang) * rayLen}`;
        return `${cx},${rayOriginY} ${p(a - half)} ${p(a + half)}`;
    });

    const ringCy = H * 0.8;
    const rings = [H * 0.53, H * 0.36, H * 0.25];

    const handleGoogleLogin = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);
            const nativeResult = await signInWithNativeGoogle();

            if (nativeResult.isCancelled || !nativeResult.idToken) return;

            const authData = await loginWithGoogleNative(nativeResult.idToken);
            console.log('================ SANCTUM AUTH TOKEN ================');
            console.log('Token:', authData.token);
            console.log('Bearer:', `Bearer ${authData.token}`);
            console.log('User:', authData.user);
            console.log('====================================================');

            await setAuthSession(authData.token, authData.user);
            if (authData.needs_profile_setup) {
                router.replace('/onboarding/profile');
            } else {
                await completeOnboarding();
                router.replace('/');
            }
        } catch (error) {
            console.error('Kesalahan login Google Native:', error);
            Alert.alert(
                'Gagal Masuk dengan Google',
                error instanceof Error
                    ? error.message
                    : 'Terjadi kesalahan saat memproses login Google.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#f5f3ec]">
            <StatusBar style="dark" />

            <Svg width={W} height={H} className="absolute inset-0" pointerEvents="none">
                <Defs>
                    <RadialGradient
                        id="glow"
                        cx={cx}
                        cy={H * 0.3}
                        rx={W * 0.85}
                        ry={H * 0.33}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0" stopColor="#bccdc0" stopOpacity="0.95" />
                        <Stop offset="0.55" stopColor="#c9d6cb" stopOpacity="0.6" />
                        <Stop offset="1" stopColor={BG} stopOpacity="0" />
                    </RadialGradient>
                    <LinearGradient
                        id="ray"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2={H * 0.62}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0" stopColor="#f8f7f0" stopOpacity="0.8" />
                        <Stop offset="0.55" stopColor="#f8f7f0" stopOpacity="0.45" />
                        <Stop offset="1" stopColor="#f8f7f0" stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                <Rect x={0} y={0} width={W} height={H * 0.62} fill="url(#glow)" />

                {rays.map((pts, i) => (
                    <Polygon key={i} points={pts} fill="url(#ray)" />
                ))}

                {rings.map((r, i) => (
                    <Circle
                        key={i}
                        cx={cx}
                        cy={ringCy}
                        r={r}
                        stroke="#b7c5b4"
                        strokeWidth={1.2 * s}
                        strokeDasharray={`${9 * s} ${9 * s}`}
                        fill="none"
                    />
                ))}

                <Sparkle x={W * 0.852} y={H * 0.243} s={21 * s} />
                <Sparkle x={W * 0.08} y={H * 0.382} s={14 * s} />
            </Svg>

            <Image
                source={require('../../../../assets/images/yuda/yuda_xD.png')}
                style={{
                    position: 'absolute',
                    top: charTop,
                    left: (W - charW) / 2,
                    width: charW,
                    height: charH,
                }}
                resizeMode="contain"
            />

            <View
                className="absolute bottom-0 left-0 right-0"
                style={{
                    paddingHorizontal: 25 * s,
                    paddingBottom: Math.max(insets.bottom, 0) + 30 * s,
                }}
            >
                <Text
                    className="text-center text-[#23252e]"
                    style={{
                        fontFamily: fontsLoaded ? 'Outfit_800ExtraBold' : undefined,
                        fontSize: 32 * s,
                        lineHeight: 41 * s,
                        marginBottom: 30 * s,
                    }}
                >
                    Buat akun untuk{'\n'}menyimpan progres{'\n'}kamu!
                </Text>

                <TouchableOpacity
                    className="flex-row items-center justify-center border-b-[#25563f] bg-[#2e6b4e]"
                    style={{
                        height: 66 * s,
                        borderRadius: 15 * s,
                        borderBottomWidth: 6 * s,
                        opacity: isLoading ? 0.75 : 1,
                    }}
                    onPress={handleGoogleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <ActivityIndicator color="#ffffff" />
                            <Text
                                className="ml-3 text-white"
                                style={{
                                    fontFamily: fontsLoaded ? 'Outfit_700Bold' : undefined,
                                    fontSize: 19 * s,
                                }}
                            >
                                Menghubungkan...
                            </Text>
                        </>
                    ) : (
                        <>
                            <View style={{ marginRight: 12 * s }}>
                                <GoogleIcon size={28 * s} />
                            </View>
                            <Text
                                className="text-white"
                                style={{
                                    fontFamily: fontsLoaded ? 'Outfit_700Bold' : undefined,
                                    fontSize: 19 * s,
                                }}
                            >
                                Lanjut dengan Google
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="items-center justify-center border-[#a3b499]"
                    style={{
                        height: 59 * s,
                        borderRadius: 15 * s,
                        borderWidth: 1.5 * s,
                        marginTop: 15 * s,
                        opacity: isLoading ? 0.6 : 1,
                    }}
                    onPress={() => router.replace('/onboarding/profile')}
                    disabled={isLoading}
                >
                    <Text
                        className="text-[#2e4938]"
                        style={{
                            fontFamily: fontsLoaded ? 'Outfit_700Bold' : undefined,
                            fontSize: 19 * s,
                        }}
                    >
                        Lewati dan Lanjut
                    </Text>
                </TouchableOpacity>

                <Text
                    className="text-center text-[#2f3038]"
                    style={{
                        fontFamily: fontsLoaded ? 'Outfit_500Medium' : undefined,
                        fontSize: 14.5 * s,
                        lineHeight: 18 * s,
                        marginTop: 27 * s,
                    }}
                >
                    Dengan lanjut, kamu menyatakan sudah{'\n'}membaca dan setuju dengan{'\n'}
                    <Text
                        className="text-[#23252e] underline"
                        style={{ fontFamily: fontsLoaded ? 'Outfit_500Medium' : undefined }}
                    >
                        Kebijakan Privasi
                    </Text>
                </Text>
            </View>
        </View>
    );
}
