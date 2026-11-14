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
            <Pressable
                className="flex-1 items-center justify-center bg-[rgba(0,0,0,0.5)] px-6"
                onPress={onCancel || onConfirm}
            >
                <Pressable
                    className="w-full bg-white"
                    style={[
                        {
                            borderRadius: 24 * s,
                            padding: 20 * s,
                            maxWidth: 380,
                        },
                        {
                            shadowColor: '#000',
                            shadowOffset: {
                                width: 0,
                                height: 4,
                            },
                            shadowOpacity: 0.15,
                            shadowRadius: 12,
                            elevation: 8,
                        },
                    ]}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Judul Pop-Up */}
                    <Text
                        className="font-outfit-extrabold text-[#1f2923]"
                        style={{
                            fontSize: 18 * s,
                            lineHeight: 24 * s,
                        }}
                    >
                        {title}
                    </Text>

                    {/* Pesan Pop-Up */}
                    <Text
                        className="font-outfit-medium text-[#55685d]"
                        style={{
                            fontSize: 12.5 * s,
                            lineHeight: 18 * s,
                            marginTop: 6 * s,
                            marginBottom: 20 * s,
                        }}
                    >
                        {message}
                    </Text>

                    {/* Tombol Aksi */}
                    <View className="flex-row items-center gap-3">
                        {isConfirmType && (
                            <Pressable
                                onPress={onCancel}
                                className="flex-1 items-center justify-center bg-[#e6ede6]"
                                style={{
                                    borderRadius: 14 * s,
                                    paddingVertical: 12 * s,
                                }}
                            >
                                <Text
                                    className="font-outfit-bold text-[#495a4f]"
                                    style={{ fontSize: 14 * s }}
                                >
                                    {cancelText}
                                </Text>
                            </Pressable>
                        )}

                        <Pressable
                            onPress={onConfirm}
                            className="flex-1 items-center justify-center"
                            style={{
                                backgroundColor: type === 'logout' ? '#c53030' : '#2e6b4e',
                                borderRadius: 14 * s,
                                paddingVertical: 12 * s,
                            }}
                        >
                            <Text
                                className="font-outfit-bold text-white"
                                style={{ fontSize: 14 * s }}
                            >
                                {confirmText}
                            </Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
