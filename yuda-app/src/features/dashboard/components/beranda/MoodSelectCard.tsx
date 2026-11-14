import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated as RNAnimated,
    Image,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
    CukupTauCardMessage,
    fetchCukupTauMessage,
} from '@/features/overlay/services/cukupTauService';

const iconTenang = require('@/assets/images/yuda/yuda-tenang.png');
const iconCemas = require('@/assets/images/yuda/yuda-cemas.png');
const iconBosan = require('@/assets/images/yuda/yuda-bosan.png');
const iconLelah = require('@/assets/images/yuda/yuda-lelah.png');

const yudaHalfBodySource = require('@/assets/images/yuda/yudahalfbody.png');
const yudaHandHalfSource = require('@/assets/images/yuda/yuda-hand-half.png');
const yudaTanganKebalikSource = require('@/assets/images/yuda/yuda-tangan-kebalik.png');

const MOOD_ITEMS = [
    { id: 'tenang', label: 'Tenang', icon: iconTenang },
    { id: 'cemas', label: 'Cemas', icon: iconCemas },
    { id: 'bosan', label: 'Bosan', icon: iconBosan },
    { id: 'lelah', label: 'Lelah', icon: iconLelah },
];

interface MoodSelectCardProps {
    userName: string;
    scale?: number;
    initialEmotion?: string | null;
    onEmotionChange?: (emotion: string) => void;
}

export function MoodSelectCard({
    userName,
    scale = 1,
    initialEmotion,
    onEmotionChange,
}: MoodSelectCardProps) {
    const s = scale;
    const [selectedMood, setSelectedMood] = useState<string | null>(initialEmotion || null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const [resultMessage, setResultMessage] = useState<CukupTauCardMessage | null>(null);

    const [isPeeking, setIsPeeking] = useState(false);
    const peekAnim = useRef(new RNAnimated.Value(-180)).current;

    const getTodayIso = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    // Load emosi & pesan tersimpan dari SecureStore jika hari ini sudah check-in
    React.useEffect(() => {
        const loadTodayCheckin = async () => {
            try {
                const todayIso = getTodayIso();
                const savedDate = await SecureStore.getItemAsync('mood_checkin_date');
                if (savedDate === todayIso) {
                    const savedMood = await SecureStore.getItemAsync('mood_checkin_emotion');
                    const savedMsgJson = await SecureStore.getItemAsync('mood_checkin_message');
                    if (savedMood) {
                        setSelectedMood(savedMood);
                    }
                    if (savedMsgJson) {
                        try {
                            setResultMessage(JSON.parse(savedMsgJson));
                        } catch {
                            // ignore
                        }
                    } else if (savedMood) {
                        fetchCukupTauMessage(savedMood, 'jam_rawan').then((data) => {
                            if (data) setResultMessage(data);
                        });
                    }
                } else if (initialEmotion) {
                    setSelectedMood(initialEmotion);
                    fetchCukupTauMessage(initialEmotion, 'jam_rawan').then((data) => {
                        if (data) setResultMessage(data);
                    });
                }
            } catch (err) {
                console.warn('[MoodSelectCard] Gagal memuat checkin hari ini:', err);
            }
        };

        loadTodayCheckin();
    }, [initialEmotion]);

    const handleSelectMood = async (moodId: string) => {
        const todayIso = getTodayIso();
        setSelectedMood(moodId);
        onEmotionChange?.(moodId);

        // Simpan langsung ke SecureStore bahwa hari ini sudah check in
        try {
            await SecureStore.setItemAsync('mood_checkin_date', todayIso);
            await SecureStore.setItemAsync('mood_checkin_emotion', moodId);
        } catch (_e) {
            // ignore
        }

        // 1. Tampilkan animasi Yuda ngintip persis seperti jeda overlay (yuda-tangan-kebalik)
        setIsPeeking(true);
        peekAnim.setValue(-180);

        RNAnimated.timing(peekAnim, {
            toValue: -45 * s,
            duration: 350,
            useNativeDriver: true,
        }).start();

        // 2. Fetch data kartu cukup tau
        setIsLoadingMessage(true);
        fetchCukupTauMessage(moodId, 'jam_rawan').then((data) => {
            setResultMessage(data);
            setIsLoadingMessage(false);
            if (data) {
                SecureStore.setItemAsync('mood_checkin_message', JSON.stringify(data)).catch(() => {});
            }
        });

        // 3. Transisi cepat dari ngintip ke pop up modal kartu
        setTimeout(() => {
            setIsPeeking(false);
            setModalVisible(true);
        }, 950);
    };

    const activeMoodItem = MOOD_ITEMS.find((m) => m.id === selectedMood);

    return (
        <>
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
                {/* Jika sudah check in / ada result message, ubah tampilan card */}
                {selectedMood && resultMessage ? (
                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={() => setModalVisible(true)}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 pr-2">
                                <Text
                                    className="font-outfit-extrabold text-[#1c241e]"
                                    style={{ fontSize: 20 * s }}
                                >
                                    Halo {userName}
                                </Text>
                                <Text
                                    className="font-outfit-bold text-[#275c43]"
                                    style={{
                                        fontSize: 13.5 * s,
                                        marginTop: 2 * s,
                                    }}
                                >
                                    Hari ini kamu merasa {activeMoodItem?.label || selectedMood}
                                </Text>
                            </View>

                            {activeMoodItem && (
                                <Image
                                    source={activeMoodItem.icon}
                                    style={{
                                        width: 44 * s,
                                        height: 44 * s,
                                    }}
                                    resizeMode="contain"
                                />
                            )}
                        </View>

                        <Text
                            className="font-outfit-medium text-[#495a4f]"
                            style={{
                                fontSize: 12.5 * s,
                                lineHeight: 17 * s,
                                marginTop: 8 * s,
                            }}
                            numberOfLines={2}
                        >
                            {resultMessage.message}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    /* Default: Pilih Emosi */
                    <View>
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
                                        onPress={() => handleSelectMood(item.id)}
                                        className="flex-1 items-center justify-center"
                                    >
                                        <Image
                                            source={item.icon}
                                            resizeMode="contain"
                                            style={{
                                                width: 52 * s,
                                                height: 52 * s,
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
                )}
            </View>

            {/* Modal Pop-up Kartu Hasil Cukup Tau */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    className="flex-1 items-center justify-center bg-[rgba(0,0,0,0.65)] px-6"
                    onPress={() => setModalVisible(false)}
                >
                    <Pressable
                        style={{
                            width: '100%',
                            maxWidth: 340 * s,
                            alignItems: 'center',
                        }}
                        onPress={() => setModalVisible(false)}
                    >
                        {/* Karakter Yuda mengintip di atas kartu */}
                        <View
                            pointerEvents="none"
                            style={{
                                position: 'absolute',
                                bottom: '100%',
                                width: 245 * s,
                                height: Math.round(245 * s / 1.22),
                                zIndex: 1,
                            }}
                        >
                            <Image
                                source={yudaHalfBodySource}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Kotak Kartu Cukup Tau */}
                        <View
                            style={{
                                width: '100%',
                                minHeight: 380 * s,
                                backgroundColor: '#F7F5EE',
                                borderRadius: 26 * s,
                                paddingTop: 32 * s,
                                paddingBottom: 22 * s,
                                paddingHorizontal: 20 * s,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.25,
                                shadowRadius: 20,
                                elevation: 12,
                                zIndex: 2,
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            {/* Tangan Yuda mencengkeram tepi kartu */}
                            <View
                                pointerEvents="none"
                                style={{
                                    position: 'absolute',
                                    top: -Math.round((245 * s * 0.9 / 4.8) * 0.5),
                                    width: 245 * s * 0.9,
                                    height: Math.round(245 * s * 0.9 / 4.8),
                                    alignSelf: 'center',
                                    zIndex: 5,
                                }}
                            >
                                <Image
                                    source={yudaHandHalfSource}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="contain"
                                />
                            </View>

                            {isLoadingMessage ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 * s }}>
                                    <ActivityIndicator size="large" color="#2B6247" />
                                    <Text
                                        className="font-outfit-medium text-[#495a4f]"
                                        style={{ marginTop: 14 * s, fontSize: 13 * s }}
                                    >
                                        Yuda sedang menyiapkan pesan untukmu...
                                    </Text>
                                </View>
                            ) : (
                                <View
                                    style={{
                                        width: '100%',
                                        flex: 1,
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <View style={{ width: '100%', alignItems: 'center', paddingTop: 4 * s }}>
                                        <Text
                                            style={{
                                                fontSize: 21 * s,
                                                fontWeight: '800',
                                                color: '#1A1F1B',
                                                textAlign: 'center',
                                                lineHeight: 27 * s,
                                            }}
                                        >
                                            {resultMessage?.header ||
                                                `Kamu Merasa ${selectedMood ? selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1) : 'Lelah'}\nHari Ini Ya?`}
                                        </Text>

                                        <Text
                                            style={{
                                                fontSize: 13.5 * s,
                                                fontWeight: '500',
                                                color: '#2B362E',
                                                textAlign: 'center',
                                                marginTop: 18 * s,
                                                marginBottom: 16 * s,
                                                lineHeight: 21 * s,
                                                paddingHorizontal: 4 * s,
                                            }}
                                        >
                                            {resultMessage?.message ||
                                                'Yuk, berhenti sejenak. Kamu juga perlu waktu untuk dirimu sendiri.\nNggak perlu terus mengikuti semua informasi. Beri pikiranmu ruang untuk beristirahat. Kamu nggak harus mengetahui semuanya hari ini.'}
                                        </Text>
                                    </View>

                                    {/* Kotak Tips Mini */}
                                    <View
                                        style={{
                                            width: '100%',
                                            flexDirection: 'row',
                                            backgroundColor: '#F8EED7',
                                            borderRadius: 16 * s,
                                            paddingVertical: 12 * s,
                                            paddingHorizontal: 12 * s,
                                            alignItems: 'center',
                                            marginTop: 12 * s,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 40 * s,
                                                height: 40 * s,
                                                borderRadius: 12 * s,
                                                backgroundColor: '#F5B938',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 10 * s,
                                            }}
                                        >
                                            <Ionicons name="bulb" size={22 * s} color="#FFFFFF" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    fontSize: 12 * s,
                                                    fontWeight: '800',
                                                    color: '#3A2E19',
                                                }}
                                            >
                                                Tips Kecil Untukmu
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: 11 * s,
                                                    fontWeight: '500',
                                                    color: '#5E4E32',
                                                    lineHeight: 15.5 * s,
                                                    marginTop: 2 * s,
                                                }}
                                            >
                                                {resultMessage?.tips ||
                                                    'Letakkan ponselmu, tarik napas perlahan, dan alihkan perhatian ke lingkungan sekitarmu.'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Modal Animasi Yuda Ngintip Cepat Sebelum Pop Up */}
            <Modal visible={isPeeking} transparent={true} animationType="none">
                <View
                    pointerEvents="none"
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.25)',
                    }}
                >
                    <RNAnimated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 18 * s,
                            width: 132 * s,
                            height: 182 * s,
                            transform: [{ translateY: peekAnim }],
                            zIndex: 999,
                        }}
                    >
                        <Image
                            source={yudaTanganKebalikSource}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            resizeMode="contain"
                        />
                    </RNAnimated.View>
                </View>
            </Modal>
        </>
    );
}