import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/services/apiClient';

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

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAYS_HEADER = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function parseDateString(dateStr?: string | null): Date {
    if (!dateStr) return new Date(2005, 0, 1);

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    const parts = dateStr.trim().split(' ');
    if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = MONTH_NAMES.findIndex(
            (month) => month.toLowerCase() === parts[1].toLowerCase()
        );
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && m !== -1 && !isNaN(y)) {
            return new Date(y, m, d);
        }
    }

    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date(2005, 0, 1) : parsed;
}

function formatDateDisplay(d: Date): string {
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
}

export default function EditProfile({
    scale,
    userName: initialUserName,
    fullName: initialFullName,
    userEmail: initialUserEmail,
    birthDate: initialBirthDate,
    avatarUrl: initialAvatarUrl,
    onSave,
    onChangePhoto,
}: EditProfileProps) {
    const router = useRouter();
    const { width: W } = useWindowDimensions();
    const s = scale ?? Math.min(W / 420, 1.15);

    const { user, userName, userToken, updateUserProfile } = useAuthStore();

    const [name, setName] = useState(
        initialUserName ?? (userName || user?.name || '')
    );
    const [fullNameValue, setFullNameValue] = useState(
        initialFullName ?? (user?.full_name || '')
    );
    const [email] = useState(
        initialUserEmail ?? (user?.email || 'Belum terdaftar')
    );

    const initialParsedDate = parseDateString(initialBirthDate ?? user?.birth_date);
    const [selectedDate, setSelectedDate] = useState<Date>(initialParsedDate);
    const [displayDateText, setDisplayDateText] = useState(
        initialBirthDate ?? (user?.birth_date ? formatDateDisplay(initialParsedDate) : '')
    );

    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [pickerYear, setPickerYear] = useState(initialParsedDate.getFullYear());
    const [pickerMonth, setPickerMonth] = useState(initialParsedDate.getMonth());
    const [tempSelectedDate, setTempSelectedDate] = useState(initialParsedDate);

    const [isSaving, setIsSaving] = useState(false);
    const avatar = initialAvatarUrl !== undefined ? initialAvatarUrl : user?.avatar;

    const openDatePicker = () => {
        const current = displayDateText ? parseDateString(displayDateText) : new Date(2005, 0, 1);
        setPickerYear(current.getFullYear());
        setPickerMonth(current.getMonth());
        setTempSelectedDate(current);
        setIsDatePickerVisible(true);
    };

    const handleConfirmDate = () => {
        setSelectedDate(tempSelectedDate);
        setDisplayDateText(formatDateDisplay(tempSelectedDate));
        setIsDatePickerVisible(false);
    };

    const handleSave = async () => {
        if (isSaving) return;

        const trimmedName = name.trim();
        const trimmedFullName = fullNameValue.trim();
        const formattedBirthDate = displayDateText.trim();

        if (!trimmedName) {
            Alert.alert('Perhatian', 'Nama panggilan tidak boleh kosong.');
            return;
        }

        setIsSaving(true);

        try {
            if (userToken) {
                const response = await apiClient.patch('/api/user/profile', {
                    name: trimmedName,
                    full_name: trimmedFullName || null,
                    birth_date: formattedBirthDate || null,
                });

                const updatedUser = response.data?.data?.user;
                await updateUserProfile({
                    name: updatedUser?.name ?? trimmedName,
                    full_name: updatedUser?.full_name ?? trimmedFullName,
                    birth_date: updatedUser?.birth_date ?? formattedBirthDate,
                });
            } else {
                await updateUserProfile({
                    name: trimmedName,
                    full_name: trimmedFullName || null,
                    birth_date: formattedBirthDate || null,
                });
            }

            onSave?.({
                userName: trimmedName,
                fullName: trimmedFullName,
                userEmail: email,
                birthDate: formattedBirthDate,
            });

            Alert.alert('Berhasil', 'Profil kamu berhasil diperbarui.', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error: any) {
            console.error('Gagal memperbarui profil:', error);
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                'Terjadi kesalahan saat menyimpan profil.';
            Alert.alert('Gagal', msg);
        } finally {
            setIsSaving(false);
        }
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

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfWeek = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const daysInCurrentMonth = getDaysInMonth(pickerYear, pickerMonth);
    const firstDayIndex = getFirstDayOfWeek(pickerYear, pickerMonth);
    const prevMonthDays = getDaysInMonth(
        pickerMonth === 0 ? pickerYear - 1 : pickerYear,
        pickerMonth === 0 ? 11 : pickerMonth - 1
    );

    const calendarCells: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const d = prevMonthDays - i;
        const prevMonth = pickerMonth === 0 ? 11 : pickerMonth - 1;
        const prevYear = pickerMonth === 0 ? pickerYear - 1 : pickerYear;
        calendarCells.push({
            day: d,
            isCurrentMonth: false,
            date: new Date(prevYear, prevMonth, d),
        });
    }

    for (let d = 1; d <= daysInCurrentMonth; d++) {
        calendarCells.push({
            day: d,
            isCurrentMonth: true,
            date: new Date(pickerYear, pickerMonth, d),
        });
    }

    const remainingSlots = (7 - (calendarCells.length % 7)) % 7;
    for (let d = 1; d <= remainingSlots; d++) {
        const nextMonth = pickerMonth === 11 ? 0 : pickerMonth + 1;
        const nextYear = pickerMonth === 11 ? pickerYear + 1 : pickerYear;
        calendarCells.push({
            day: d,
            isCurrentMonth: false,
            date: new Date(nextYear, nextMonth, d),
        });
    }

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
                            className="items-center justify-center overflow-hidden bg-[#275c43]"
                            style={{
                                width: 130 * s,
                                height: 130 * s,
                                borderRadius: 65 * s,
                            }}
                        >
                            {avatar ? (
                                <Image
                                    source={{ uri: avatar }}
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
                                Halo {name || 'Kamu'}
                            </Text>

                            <Text
                                className="font-outfit-medium text-[#292d35]"
                                style={{
                                    fontSize: 10.5 * s,
                                    lineHeight: 14 * s,
                                    marginTop: 2 * s,
                                }}
                            >
                                Perbarui data profilmu agar Yuda dapat menyapamu dengan lebih akrab!
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

                        {/* DATE PICKER INPUT BUTTON */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={openDatePicker}
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

                            <View className="flex-row items-center justify-between">
                                <Text
                                    className={`font-outfit-bold ${
                                        displayDateText ? 'text-[#292d35]' : 'text-gray-400'
                                    }`}
                                    style={{
                                        fontSize: 16 * s,
                                        lineHeight: 21 * s,
                                    }}
                                    numberOfLines={1}
                                >
                                    {displayDateText || 'Pilih tanggal lahir'}
                                </Text>

                                <Ionicons
                                    name="calendar"
                                    size={23 * s}
                                    color="#275c43"
                                />
                            </View>
                        </TouchableOpacity>
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
                            opacity: isSaving ? 0.7 : 1,
                        }}
                        disabled={isSaving}
                        activeOpacity={0.88}
                        onPress={handleSave}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <Text
                                className="text-white"
                                style={{
                                    fontFamily: 'Outfit_700Bold',
                                    fontSize: 18 * s,
                                }}
                            >
                                Simpan Perubahan
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* MODAL DATE PICKER */}
            <Modal
                visible={isDatePickerVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDatePickerVisible(false)}
            >
                <Pressable
                    className="flex-1 justify-center items-center bg-black/50"
                    style={{ paddingHorizontal: 20 * s }}
                    onPress={() => setIsDatePickerVisible(false)}
                >
                    <Pressable
                        className="w-full bg-[#f6f3ec] rounded-3xl"
                        style={{
                            padding: 20 * s,
                            maxWidth: 380 * s,
                        }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header Month / Year Navigation */}
                        <View className="flex-row items-center justify-between" style={{ marginBottom: 16 * s }}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (pickerMonth === 0) {
                                        setPickerMonth(11);
                                        setPickerYear((y) => y - 1);
                                    } else {
                                        setPickerMonth((m) => m - 1);
                                    }
                                }}
                                style={{
                                    padding: 8 * s,
                                    borderRadius: 12 * s,
                                    backgroundColor: '#e6ede6',
                                }}
                            >
                                <Ionicons name="chevron-back" size={20 * s} color="#275c43" />
                            </TouchableOpacity>

                            <View className="items-center">
                                <Text
                                    className="font-outfit-bold text-[#292d35]"
                                    style={{ fontSize: 17 * s }}
                                >
                                    {MONTH_NAMES[pickerMonth]} {pickerYear}
                                </Text>

                                <View className="flex-row items-center" style={{ marginTop: 2 * s }}>
                                    <TouchableOpacity
                                        onPress={() => setPickerYear((y) => y - 1)}
                                        style={{ marginHorizontal: 4 * s }}
                                    >
                                        <Text className="font-outfit-semibold text-[#275c43]" style={{ fontSize: 11 * s }}>
                                            -1 Thn
                                        </Text>
                                    </TouchableOpacity>
                                    <Text className="text-gray-400">•</Text>
                                    <TouchableOpacity
                                        onPress={() => setPickerYear((y) => y + 1)}
                                        style={{ marginHorizontal: 4 * s }}
                                    >
                                        <Text className="font-outfit-semibold text-[#275c43]" style={{ fontSize: 11 * s }}>
                                            +1 Thn
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    if (pickerMonth === 11) {
                                        setPickerMonth(0);
                                        setPickerYear((y) => y + 1);
                                    } else {
                                        setPickerMonth((m) => m + 1);
                                    }
                                }}
                                style={{
                                    padding: 8 * s,
                                    borderRadius: 12 * s,
                                    backgroundColor: '#e6ede6',
                                }}
                            >
                                <Ionicons name="chevron-forward" size={20 * s} color="#275c43" />
                            </TouchableOpacity>
                        </View>

                        {/* Days of Week Header */}
                        <View className="flex-row justify-between" style={{ marginBottom: 8 * s }}>
                            {DAYS_HEADER.map((day, idx) => (
                                <View key={idx} style={{ width: `${100 / 7}%`, alignItems: 'center' }}>
                                    <Text
                                        className="font-outfit-semibold text-[#7c887d]"
                                        style={{ fontSize: 12 * s }}
                                    >
                                        {day}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Calendar Grid */}
                        <View className="flex-row flex-wrap">
                            {calendarCells.map((cell, idx) => {
                                const isSelected =
                                    tempSelectedDate &&
                                    cell.date.getFullYear() === tempSelectedDate.getFullYear() &&
                                    cell.date.getMonth() === tempSelectedDate.getMonth() &&
                                    cell.date.getDate() === tempSelectedDate.getDate();

                                return (
                                    <View
                                        key={idx}
                                        style={{
                                            width: `${100 / 7}%`,
                                            paddingVertical: 3 * s,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => setTempSelectedDate(cell.date)}
                                            style={{
                                                width: 36 * s,
                                                height: 36 * s,
                                                borderRadius: 18 * s,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: isSelected
                                                    ? '#2e6b4e'
                                                    : 'transparent',
                                            }}
                                        >
                                            <Text
                                                className={`font-outfit-bold ${
                                                    isSelected
                                                        ? 'text-white'
                                                        : cell.isCurrentMonth
                                                        ? 'text-[#292d35]'
                                                        : 'text-gray-400'
                                                }`}
                                                style={{ fontSize: 14 * s }}
                                            >
                                                {cell.day}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Action Buttons */}
                        <View
                            className="flex-row items-center justify-end"
                            style={{ marginTop: 20 * s, gap: 10 * s }}
                        >
                            <TouchableOpacity
                                onPress={() => setIsDatePickerVisible(false)}
                                style={{
                                    paddingVertical: 10 * s,
                                    paddingHorizontal: 16 * s,
                                    borderRadius: 12 * s,
                                }}
                            >
                                <Text
                                    className="font-outfit-semibold text-[#55685d]"
                                    style={{ fontSize: 14 * s }}
                                >
                                    Batal
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleConfirmDate}
                                style={{
                                    backgroundColor: '#2e6b4e',
                                    paddingVertical: 10 * s,
                                    paddingHorizontal: 20 * s,
                                    borderRadius: 12 * s,
                                }}
                            >
                                <Text
                                    className="font-outfit-bold text-white"
                                    style={{ fontSize: 14 * s }}
                                >
                                    Pilih
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
