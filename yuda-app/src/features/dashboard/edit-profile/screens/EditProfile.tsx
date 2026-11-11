import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditProfileProps {
    scale?: number;
    userName?: string;
    fullName?: string;
    userEmail?: string;
    birthDate?: string;
    avatarUrl?: string | null;
    onSave?: (profile: {
        userName: string;
        fullName: string;
        userEmail: string;
        birthDate: string;
    }) => void;
    onChangePhoto?: () => void;
}

export default function EditProfile({
    scale = 1,
    userName = 'Gathan',
    fullName = 'Ifaruz Gathan Auditore da Firenze',
    userEmail = 'gathanfairuz23@gmail.com',
    birthDate = '23 Februari 2008',
    avatarUrl,
    onSave,
    onChangePhoto,
}: EditProfileProps) {
    const router = useRouter();
    const s = scale;

    const [name, setName] = useState(userName);
    const [fullNameValue, setFullNameValue] = useState(fullName);
    const [email, setEmail] = useState(userEmail);
    const [date, setDate] = useState(birthDate);

    const handleSave = () => {
        onSave?.({
            userName: name,
            fullName: fullNameValue,
            userEmail: email,
            birthDate: date,
        });
    };

    const renderInput = ({
        label,
        value,
        onChangeText,
        editable = true,
        icon,
    }: {
        label: string;
        value: string;
        onChangeText?: (text: string) => void;
        editable?: boolean;
        icon?: keyof typeof Ionicons.glyphMap;
    }) => (
        <View
            className="bg-white"
            style={{
                minHeight: 57 * s,
                borderRadius: 15 * s,
                paddingHorizontal: 14 * s,
                paddingVertical: 8 * s,
                marginBottom: 8 * s,
            }}
        >
            <Text
                className="font-outfit-medium text-[#275c43]"
                style={{
                    fontSize: 10.5 * s,
                    marginBottom: 1 * s,
                }}
            >
                {label}
            </Text>

            <View className="flex-row items-center">
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    editable={editable}
                    selectTextOnFocus={editable}
                    className="flex-1 font-outfit-bold text-[#292d35]"
                    style={{
                        padding: 0,
                        fontSize: 16 * s,
                        lineHeight: 21 * s,
                    }}
                    numberOfLines={1}
                />

                {icon && (
                    <Ionicons
                        name={icon}
                        size={23 * s}
                        color="#275c43"
                    />
                )}
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-[#f6f3ec]">
            {/* HEADER FIXED */}
            <View
                className="flex-row items-center"
                style={{
                    paddingHorizontal: 24 * s,
                    paddingTop: 50 * s,
                    paddingBottom: 18 * s,
                }}
            >
                <TouchableOpacity
                    className="items-center justify-center bg-[#f6f3ec]"
                    style={{
                        width: 50 * s,
                        height: 50 * s,
                        borderRadius: 25 * s,
                        marginRight: 22 * s,
                        shadowColor: '#000000',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.12,
                        shadowRadius: 3,
                        elevation: 3,
                    }}
                    activeOpacity={0.7}
                    onPress={() => router.back()}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24 * s}
                        color="#292d35"
                    />
                </TouchableOpacity>

                <Text
                    className="font-outfit-extrabold text-[#292d35]"
                    style={{
                        fontSize: 19 * s,
                    }}
                >
                    Edit Profil
                </Text>
            </View>

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* SCROLLABLE CONTENT */}
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingHorizontal: 16 * s,
                        paddingBottom: 24 * s,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* FOTO PROFIL */}
                    <View
                        className="items-center justify-center"
                        style={{
                            marginTop: 6 * s,
                            marginBottom: 36 * s,
                        }}
                    >
                        <View
                            className="items-center justify-center overflow-hidden bg-[#b91c1c]"
                            style={{
                                width: 130 * s,
                                height: 130 * s,
                                borderRadius: 65 * s,
                            }}
                        >
                            {avatarUrl ? (
                                <Image
                                    source={{ uri: avatarUrl }}
                                    className="h-full w-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <Ionicons
                                    name="person"
                                    size={65 * s}
                                    color="#ffffff"
                                />
                            )}
                        </View>

                        <TouchableOpacity
                            className="absolute items-center justify-center bg-[#2e6b4e]"
                            style={{
                                width: 40 * s,
                                height: 40 * s,
                                borderRadius: 20 * s,
                                right: '34%',
                                bottom: -1 * s,
                                borderWidth: 3 * s,
                                borderColor: '#f6f3ec',
                            }}
                            activeOpacity={0.8}
                            onPress={onChangePhoto}
                        >
                            <Ionicons
                                name="camera"
                                size={20 * s}
                                color="#ffffff"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* GREETING CARD */}
                    <View
                        className="overflow-hidden flex-row items-center bg-[#f6efcf]"
                        style={{
                            minHeight: 100 * s,
                            borderRadius: 14 * s,
                            paddingHorizontal: 12 * s,
                            paddingVertical: 9 * s,
                            marginBottom: 18 * s,
                            position: 'relative',
                        }}
                    >
                        <View
                            style={{
                                width: 75 * s,
                                height: 75 * s,
                                alignSelf: 'flex-end',
                                position: 'absolute',
                                left: 12 * s,
                                bottom: 0,
                            }}
                        >
                            <Image
                                source={require('@/assets/images/yuda/yuda-alert-half.png')}
                                resizeMode="contain"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                            />
                        </View>

                        <View
                            className="flex-1"
                            style={{
                                marginLeft: 82 * s,
                                paddingVertical: 5 * s,
                            }}
                        >
                            <Text
                                className="font-outfit-extrabold text-[#292d35]"
                                style={{
                                    fontSize: 16 * s,
                                }}
                            >
                                Halo {name || 'Gathan'}
                            </Text>

                            <Text
                                className="font-outfit-medium text-[#292d35]"
                                style={{
                                    fontSize: 10.5 * s,
                                    lineHeight: 14 * s,
                                    marginTop: 2 * s,
                                }}
                            >
                                Aku lihat kamu belum melengkapi data nih,
                                yuk lengkapi terlebih dahulu!
                            </Text>
                        </View>
                    </View>

                    {/* FORM PROFIL */}
                    <View
                        className="bg-[#cecece]/40"
                        style={{
                            borderRadius: 20 * s,
                            padding: 14 * s,
                        }}
                    >
                        {renderInput({
                            label: 'Nama Panggilan',
                            value: name,
                            onChangeText: setName,
                        })}

                        {renderInput({
                            label: 'Nama Lengkap',
                            value: fullNameValue,
                            onChangeText: setFullNameValue,
                        })}

                        {renderInput({
                            label: 'Email Terdaftar',
                            value: email,
                            editable: false,
                        })}

                        <View
                            className="bg-white"
                            style={{
                                minHeight: 57 * s,
                                borderRadius: 15 * s,
                                paddingHorizontal: 14 * s,
                                paddingVertical: 8 * s,
                            }}
                        >
                            <Text
                                className="font-outfit-medium text-[#275c43]"
                                style={{
                                    fontSize: 10.5 * s,
                                    marginBottom: 1 * s,
                                }}
                            >
                                Tanggal Lahir
                            </Text>

                            <View className="flex-row items-center">
                                <TextInput
                                    value={date}
                                    onChangeText={setDate}
                                    className="flex-1 font-outfit-bold text-[#292d35]"
                                    style={{
                                        padding: 0,
                                        fontSize: 16 * s,
                                        lineHeight: 21 * s,
                                    }}
                                />

                                <Ionicons
                                    name="calendar"
                                    size={23 * s}
                                    color="#275c43"
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* BUTTON SIMPAN FIXED */}
                <View
                    style={{
                        paddingHorizontal: 24 * s,
                        paddingTop: 10 * s,
                        paddingBottom: 30 * s,
                    }}
                >
                    <TouchableOpacity
                        className="items-center justify-center bg-[#2e6b4e]"
                        style={{
                            height: 60 * s,
                            borderRadius: 14 * s,
                            shadowColor: '#275c43',
                            shadowOffset: {
                                width: 0,
                                height: 5,
                            },
                            shadowOpacity: 0.35,
                            shadowRadius: 0,
                            elevation: 2,
                        }}
                        activeOpacity={0.88}
                        onPress={handleSave}
                    >
                        <Text
                            className="text-white"
                            style={{
                                fontFamily: 'Outfit_700Bold',
                                fontSize: 18 * s,
                            }}
                        >
                            Simpan Perubahan
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}