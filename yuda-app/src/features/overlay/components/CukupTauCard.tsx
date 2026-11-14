import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import {
    CukupTauCardMessage,
    fetchCukupTauMessage,
    updateDailyMatrixEmotion,
} from '../services/cukupTauService';

const iconTenang = require('@/assets/images/yuda/yuda-tenang.png');
const iconCemas = require('@/assets/images/yuda/yuda-cemas.png');
const iconBosan = require('@/assets/images/yuda/yuda-bosan.png');
const iconLelah = require('@/assets/images/yuda/yuda-lelah.png');

const yudaHalfBodySource = require('@/assets/images/yuda/yudahalfbody.png');
const yudaHandHalfSource = require('@/assets/images/yuda/yuda-hand-half.png');

const EMOTIONS = [
    { id: 'tenang', label: 'Tenang', icon: iconTenang },
    { id: 'cemas', label: 'Cemas', icon: iconCemas },
    { id: 'bosan', label: 'Bosan', icon: iconBosan },
    { id: 'lelah', label: 'Lelah', icon: iconLelah },
];

interface CukupTauCardProps {
    userName?: string;
    cardWidth: number;
    scale?: number;
    triggerReason: 'jam_rawan' | 'scroll_terlalu_lama';
    toneStyle?: string;
    onProceedToMission: (selectedEmotion: string, messageData?: CukupTauCardMessage) => void;
}

export function CukupTauCard({
    userName = 'Gathan',
    cardWidth,
    scale = 1,
    triggerReason,
    toneStyle,
    onProceedToMission,
}: CukupTauCardProps) {
    const s = scale;
    const [step, setStep] = useState<'askEmotion' | 'reflection'>('askEmotion');
    const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const [messageData, setMessageData] = useState<CukupTauCardMessage | null>(null);

    const halfBodyWidth = cardWidth * 0.74;
    const halfBodyHeight = Math.round(halfBodyWidth / 1.22);
    const handsWidth = halfBodyWidth * 0.9;
    const handsHeight = Math.round(handsWidth / 4.8);

    const handleSelectEmotion = async (emotionId: string) => {
        setSelectedEmotion(emotionId);
        setIsLoadingMessage(true);

        // 1. Simpan/Update emosi ke metrik user di backend
        updateDailyMatrixEmotion(emotionId);

        // 2. Ambil pesan kartu cukup tau terpersonalisasi dari InterventionMessage
        const data = await fetchCukupTauMessage(emotionId, triggerReason, toneStyle);
        setMessageData(data);
        setIsLoadingMessage(false);
        setStep('reflection');
    };

    const subtitleText =
        triggerReason === 'jam_rawan'
            ? 'Dari data, kamu paling sering scrolling di jam sekarang. Apa yang lagi kamu alamin sekarang hingga kamu doomscrolling?'
            : 'Kamu sudah scrolling cukup lama nih. Apa yang lagi kamu alamin sekarang hingga terus scrolling?';

    return (
        <TouchableOpacity
            activeOpacity={step === 'reflection' ? 0.95 : 1}
            onPress={() => {
                if (step === 'reflection') {
                    onProceedToMission(selectedEmotion || 'lelah', messageData || undefined);
                }
            }}
            style={{ width: cardWidth, alignItems: 'center' }}
        >
            {/* Karakter Yuda di atas kartu (peek behind card) */}
            <View
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    bottom: '100%',
                    width: halfBodyWidth,
                    height: halfBodyHeight,
                    zIndex: 1,
                }}
            >
                <Image
                    source={yudaHalfBodySource}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                />
            </View>

            {/* Container Kartu Cukup Tau */}
            <View
                style={{
                    width: cardWidth,
                    minHeight: 390 * s,
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
                        top: -Math.round(handsHeight * 0.5),
                        width: handsWidth,
                        height: handsHeight,
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

                {step === 'askEmotion' ? (
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        {/* Judul Pertanyaan */}
                        <Text
                            style={{
                                fontSize: 21 * s,
                                fontWeight: '800',
                                color: '#1A1F1B',
                                textAlign: 'center',
                                lineHeight: 27 * s,
                            }}
                        >
                            {userName} Aku Mau{'\n'}Tanya
                        </Text>

                        {/* Deskripsi Alasan Berdasarkan Metrik / Waktu */}
                        <Text
                            style={{
                                fontSize: 12 * s,
                                fontWeight: '500',
                                color: '#454F48',
                                textAlign: 'center',
                                marginTop: 8 * s,
                                marginBottom: 18 * s,
                                lineHeight: 17 * s,
                            }}
                        >
                            {subtitleText}
                        </Text>

                        {/* 4 Pilihan Emosi Grid 2x2 */}
                        <View
                            style={{
                                width: '100%',
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                justifyContent: 'space-between',
                                gap: 10 * s,
                            }}
                        >
                            {EMOTIONS.map((item) => {
                                const isSelected = selectedEmotion === item.id;
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        activeOpacity={0.8}
                                        disabled={isLoadingMessage}
                                        onPress={() => handleSelectEmotion(item.id)}
                                        style={{
                                            width: '48%',
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: 14 * s,
                                            borderWidth: 1.5,
                                            borderColor: isSelected ? '#2B6247' : '#E8EAE6',
                                            paddingVertical: 10 * s,
                                            paddingHorizontal: 8 * s,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.04,
                                            shadowRadius: 4,
                                            elevation: 1,
                                        }}
                                    >
                                        <Image
                                            source={item.icon}
                                            style={{
                                                width: 52 * s,
                                                height: 52 * s,
                                                marginBottom: 6 * s,
                                            }}
                                            resizeMode="contain"
                                        />
                                        <View
                                            style={{
                                                paddingVertical: 4 * s,
                                                paddingHorizontal: 10 * s,
                                                borderRadius: 10 * s,
                                                backgroundColor: isSelected
                                                    ? '#2B6247'
                                                    : 'rgba(230, 235, 230, 0.6)',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 11 * s,
                                                    fontWeight: '700',
                                                    color: isSelected ? '#FFFFFF' : '#2B6247',
                                                }}
                                            >
                                                {item.label}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {isLoadingMessage && (
                            <View style={{ marginTop: 14 * s, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color="#2B6247" />
                            </View>
                        )}
                    </View>
                ) : (
                    /* Step 2: Pesan Refleksi & Tips Cukup Tau (Mengisi Penuh & Presisi) */
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
                                {messageData?.header || `Kamu Merasa Lelah\nHari Ini Ya?`}
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
                                {messageData?.message ||
                                    'Yuk, berhenti sejenak. Kamu juga perlu waktu untuk dirimu sendiri.\nNggak perlu terus mengikuti semua informasi. Beri pikiranmu ruang untuk beristirahat. Kamu nggak harus mengetahui semuanya hari ini.'}
                            </Text>
                        </View>

                        {/* Kotak Tips Mini di Bagian Bawah */}
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
                                    {messageData?.tips ||
                                        'Letakkan ponselmu, tarik napas perlahan, dan alihkan perhatian ke lingkungan sekitarmu.'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}
