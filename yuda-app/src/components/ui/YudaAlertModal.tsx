import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'calendar' | 'logout';

const yudaAlertHalf = require('@/assets/images/yuda/yuda-alert-half.png');
const yudaTenang = require('@/assets/images/yuda/yuda-tenang.png');
const yudaCemas = require('@/assets/images/yuda/yuda-cemas.png');

interface YudaAlertModalProps {
    visible: boolean;
    type?: AlertType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    scale?: number;
}

export function YudaAlertModal({
    visible,
    type = 'info',
    title,
    message,
    confirmText = 'Mengerti',
    cancelText = 'Batal',
    onConfirm,
    onCancel,
    scale = 1,
}: YudaAlertModalProps) {
    const s = scale;

    const getConfig = () => {
        switch (type) {
            case 'logout':
                return {
                    yudaImage: yudaCemas,
                    badgeBg: '#fef2f2',
                    badgeBorder: '#fee2e2',
                    iconName: 'log-out-outline' as const,
                    iconColor: '#c53030',
                    confirmBg: '#c53030',
                    confirmTextColor: '#ffffff',
                };
            case 'calendar':
                return {
                    yudaImage: yudaTenang,
                    badgeBg: '#e8f3ec',
                    badgeBorder: '#cce3d4',
                    iconName: 'calendar' as const,
                    iconColor: '#275c43',
                    confirmBg: '#275c43',
                    confirmTextColor: '#ffffff',
                };
            case 'success':
                return {
                    yudaImage: yudaTenang,
                    badgeBg: '#e8f3ec',
                    badgeBorder: '#cce3d4',
                    iconName: 'checkmark-circle' as const,
                    iconColor: '#275c43',
                    confirmBg: '#275c43',
                    confirmTextColor: '#ffffff',
                };
            case 'error':
                return {
                    yudaImage: yudaAlertHalf,
                    badgeBg: '#fee2e2',
                    badgeBorder: '#fecaca',
                    iconName: 'alert-circle' as const,
                    iconColor: '#c53030',
                    confirmBg: '#c53030',
                    confirmTextColor: '#ffffff',
                };
            case 'warning':
                return {
                    yudaImage: yudaAlertHalf,
                    badgeBg: '#fef3c7',
                    badgeBorder: '#fde68a',
                    iconName: 'warning' as const,
                    iconColor: '#b45309',
                    confirmBg: '#275c43',
                    confirmTextColor: '#ffffff',
                };
            case 'confirm':
            case 'info':
            default:
                return {
                    yudaImage: yudaAlertHalf,
                    badgeBg: '#e8f3ec',
                    badgeBorder: '#cce3d4',
                    iconName: 'sparkles' as const,
                    iconColor: '#275c43',
                    confirmBg: '#275c43',
                    confirmTextColor: '#ffffff',
                };
        }
    };

    const cfg = getConfig();
    const isConfirmType = type === 'confirm' || type === 'logout' || Boolean(onCancel);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel || onConfirm}
        >
            <View
                className="flex-1 items-center justify-center"
                style={{
                    backgroundColor: 'rgba(28, 36, 30, 0.55)',
                    paddingHorizontal: 22 * s,
                }}
            >
                {/* Outer Sage Border Container matching Yuda Cards */}
                <View
                    className="w-full bg-[rgba(206,206,206,0.45)]"
                    style={{
                        borderRadius: 28 * s,
                        padding: 8 * s,
                        maxWidth: 370,
                    }}
                >
                    <Pressable
                        className="w-full bg-white relative overflow-hidden"
                        style={{
                            borderRadius: 22 * s,
                            padding: 20 * s,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 8,
                        }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header dengan Maskot Karakter Yuda & Badge Icon */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View
                                className="flex-row items-center"
                                style={{
                                    backgroundColor: cfg.badgeBg,
                                    paddingHorizontal: 12 * s,
                                    paddingVertical: 6 * s,
                                    borderRadius: 12 * s,
                                    borderWidth: 1,
                                    borderColor: cfg.badgeBorder,
                                }}
                            >
                                <Ionicons
                                    name={cfg.iconName}
                                    size={15 * s}
                                    color={cfg.iconColor}
                                    style={{ marginRight: 6 * s }}
                                />
                                <Text
                                    className="font-outfit-bold"
                                    style={{
                                        fontSize: 12.5 * s,
                                        color: cfg.iconColor,
                                    }}
                                >
                                    {type === 'logout'
                                        ? 'Keluar Akun'
                                        : type === 'calendar'
                                        ? 'Google Calendar'
                                        : 'Yuda'}
                                </Text>
                            </View>

                            {/* Maskot Avatar Mini Yuda */}
                            <View
                                className="items-center justify-center overflow-hidden bg-[#e8efe9]"
                                style={{
                                    width: 44 * s,
                                    height: 44 * s,
                                    borderRadius: 22 * s,
                                    borderWidth: 2,
                                    borderColor: '#ffffff',
                                }}
                            >
                                <Image
                                    source={cfg.yudaImage}
                                    style={{
                                        width: 38 * s,
                                        height: 38 * s,
                                    }}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>

                        {/* Judul Pop-Up */}
                        <Text
                            className="font-outfit-extrabold text-[#1c241e]"
                            style={{
                                fontSize: 18 * s,
                                lineHeight: 24 * s,
                                marginBottom: 6 * s,
                            }}
                        >
                            {title}
                        </Text>

                        {/* Pesan Pop-Up */}
                        <Text
                            className="font-outfit-medium text-[#495a4f]"
                            style={{
                                fontSize: 13.5 * s,
                                lineHeight: 19 * s,
                                marginBottom: 22 * s,
                            }}
                        >
                            {message}
                        </Text>

                        {/* Tombol Aksi */}
                        <View className="flex-row items-center justify-end">
                            {isConfirmType && (
                                <TouchableOpacity
                                    onPress={onCancel}
                                    activeOpacity={0.7}
                                    className="bg-[#f0f4f1] items-center justify-center"
                                    style={{
                                        paddingVertical: 11 * s,
                                        paddingHorizontal: 18 * s,
                                        marginRight: 10 * s,
                                        borderRadius: 14 * s,
                                    }}
                                >
                                    <Text
                                        className="font-outfit-bold text-[#55685d]"
                                        style={{ fontSize: 13.5 * s }}
                                    >
                                        {cancelText}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={onConfirm}
                                activeOpacity={0.85}
                                className="items-center justify-center"
                                style={{
                                    backgroundColor: cfg.confirmBg,
                                    paddingVertical: 11 * s,
                                    paddingHorizontal: 22 * s,
                                    borderRadius: 14 * s,
                                    shadowColor: cfg.confirmBg,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}
                            >
                                <Text
                                    className="font-outfit-bold"
                                    style={{
                                        fontSize: 13.5 * s,
                                        color: cfg.confirmTextColor,
                                    }}
                                >
                                    {confirmText}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
