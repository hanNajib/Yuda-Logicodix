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
    const peekAnim = useRef(new RNAnimated.Value(-120)).current;

    React.useEffect(() => {
        if (initialEmotion) {
            setSelectedMood(initialEmotion);
        }
    }, [initialEmotion]);

    const handleSelectMood = async (moodId: string) => {
        setSelectedMood(moodId);
        onEmotionChange?.(moodId);

        // 1. Tampilkan animasi Yuda ngintip sebentar secara cepat
        setIsPeeking(true);
        peekAnim.setValue(-120);

        RNAnimated.timing(peekAnim, {
            toValue: -15,
            duration: 280,
            useNativeDriver: true,
        }).start();

        // 2. Fetch data kartu cukup tau
        setIsLoadingMessage(true);
        fetchCukupTauMessage(moodId, 'jam_rawan').then((data) => {
            setResultMessage(data);
            setIsLoadingMessage(false);
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
                    <View>
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

                        {/* Tombol Lihat Pesan Refleksi & Ubah Emosi */}
                        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-[#f0f3f1]">
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setModalVisible(true)}
                                className="flex-row items-center"
                            >
                                <Ionicons name="sparkles" size={14 * s} color="#275c43" style={{ marginRight: 5 * s }} />
                                <Text
                                    className="font-outfit-bold text-[#275c43]"
                                    style={{ fontSize: 12 * s }}
                                >
                                    Lihat Refleksi & Tips
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    setResultMessage(null);
                                }}
                            >
                                <Text
                                    className="font-outfit-medium text-[#7c8b81]"
                                    style={{ fontSize: 12 * s }}
                                >
                                    Ubah Emosi
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
                    className="flex-1 items-center justify-center bg-[rgba(0,0,0,0.65)] px-5"
                    onPress={() => setModalVisible(false)}
                >
                    <Pressable
                        style={{
                            width: '100%',
                            maxWidth: 350 * s,
                            alignItems: 'center',
                        }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Karakter Yuda mengintip di atas kartu */}
                        <View
                            pointerEvents="none"
                            style={{
                                position: 'absolute',
                                bottom: '100%',
                                width: 240 * s,
                                height: 180 * s,
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
                                minHeight: 330 * s,
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
                            }}
                        >
                            {/* Tangan Yuda mencengkeram tepi kartu */}
                            <View
                                pointerEvents="none"
                                style={{
                                    position: 'absolute',
                                    top: -18 * s,
                                    width: 210 * s,
                                    height: 44 * s,
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
                                <View style={{ paddingVertical: 40 * s, alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color="#2B6247" />
                                    <Text
                                        className="font-outfit-medium text-[#495a4f]"
                                        style={{ marginTop: 12 * s, fontSize: 13 * s }}
                                    >
                                        Yuda sedang menyiapkan pesan untukmu...
                                    </Text>
                                </View>
                            ) : (
                                <View style={{ width: '100%', alignItems: 'center' }}>
                                    <Text
                                        style={{
                                            fontSize: 20 * s,
                                            fontWeight: '800',
                                            color: '#1A1F1B',
                                            textAlign: 'center',
                                            lineHeight: 26 * s,
                                        }}
                                    >
                                        {resultMessage?.header ||
                                            `Kamu Merasa ${selectedMood ? selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1) : 'Lelah'} Hari Ini Ya?`}
                                    </Text>

                                    <Text
                                        style={{
                                            fontSize: 12 * s,
                                            fontWeight: '500',
                                            color: '#3B453E',
                                            textAlign: 'center',
                                            marginTop: 10 * s,
                                            marginBottom: 14 * s,
                                            lineHeight: 18 * s,
                                        }}
                                    >
                                        {resultMessage?.message ||
                                            'Yuk, berhenti sejenak. Kamu juga perlu waktu untuk dirimu sendiri. Nggak perlu terus mengikuti semua informasi. Beri pikiranmu ruang untuk beristirahat.'}
                                    </Text>

                                    {/* Kotak Tips Mini */}
                                    <View
                                        style={{
                                            width: '100%',
                                            flexDirection: 'row',
                                            backgroundColor: '#F8EED7',
                                            borderRadius: 14 * s,
                                            padding: 12 * s,
                                            alignItems: 'center',
                                            marginBottom: 16 * s,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 36 * s,
                                                height: 36 * s,
                                                borderRadius: 12 * s,
                                                backgroundColor: '#F5B938',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 10 * s,
                                            }}
                                        >
                                            <Ionicons name="bulb" size={20 * s} color="#FFFFFF" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    fontSize: 11.5 * s,
                                                    fontWeight: '800',
                                                    color: '#3A2E19',
                                                }}
                                            >
                                                Tips Kecil Untukmu
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: 10.5 * s,
                                                    fontWeight: '500',
                                                    color: '#5E4E32',
                                                    lineHeight: 14.5 * s,
                                                    marginTop: 2 * s,
                                                }}
                                            >
                                                {resultMessage?.tips ||
                                                    'Letakkan ponselmu, tarik nafas perlahan, dan alihkan perhatian ke lingkungan sekitarmu.'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Tombol Tutup / Selesai */}
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => setModalVisible(false)}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#2B6247',
                                            borderRadius: 14 * s,
                                            paddingVertical: 12 * s,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 14 * s,
                                                fontWeight: '700',
                                                color: '#FFFFFF',
                                            }}
                                        >
                                            Mengerti
                                        </Text>
                                    </TouchableOpacity>
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
                            left: 20 * s,
                            width: 140 * s,
                            height: 120 * s,
                            transform: [{ translateY: peekAnim }],
                            zIndex: 999,
                        }}
                    >
                        <Image
                            source={yudaHandHalfSource}
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