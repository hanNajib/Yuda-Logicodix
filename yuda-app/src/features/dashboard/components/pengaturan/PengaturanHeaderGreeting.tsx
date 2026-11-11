
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditButtonLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface PengaturanHeaderGreetingProps {
    userName?: string;
    userEmail?: string;
    avatarUrl?: string | null;
    scale?: number;
    onEditProfile: () => void;
    onEditProfileLayout?: (layout: EditButtonLayout) => void;
}

export function PengaturanHeaderGreeting({
    userName = 'Gathan',
    userEmail = 'gathanfairuz23@gmail.com',
    avatarUrl,
    scale = 1,
    onEditProfile,
    onEditProfileLayout,
}: PengaturanHeaderGreetingProps) {
    const s = scale;
    const avatarSize = 98 * s;

    const editButtonRef = useRef<TouchableOpacity>(null);

    const handleEditButtonLayout = () => {
        requestAnimationFrame(() => {
            editButtonRef.current?.measureInWindow(
                (x, y, width, height) => {
                    onEditProfileLayout?.({
                        x,
                        y,
                        width,
                        height,
                    });
                }
            );
        });
    };

    return (
        <View
            className="flex-row items-center overflow-hidden bg-[#F6F3EC]"
            style={{
                borderRadius: 24 * s,
                paddingLeft: 14 * s,
                paddingRight: 14 * s,
                paddingTop: 16 * s,
                paddingBottom: 14.5 * s,
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View
                className="items-center justify-center overflow-hidden"
                style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                }}
            >
                {avatarUrl ? (
                    <Image
                        source={{ uri: avatarUrl }}
                        className="h-full w-full"
                        style={{
                            borderRadius: avatarSize / 2,
                        }}
                        resizeMode="cover"
                    />
                ) : (
                    <View
                        className="h-full w-full items-center justify-center overflow-hidden bg-[#b91c1c]"
                        style={{
                            borderRadius: avatarSize / 2,
                        }}
                    >
                        <Ionicons
                            name="person"
                            size={44 * s}
                            color="#ffffff"
                        />
                    </View>
                )}
            </View>

            <View
                className="flex-1 items-start justify-center"
                style={{
                    marginLeft: 9 * s,
                }}
            >
                <View
                    className="self-stretch border-[1.5px] border-[rgba(255,255,255,0.8)] bg-[rgba(230,237,230,0.75)]"
                    style={{
                        borderRadius: 16 * s,
                        paddingHorizontal: 16 * s,
                        paddingVertical: 12 * s,
                        shadowColor: '#2e6b4e',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.06,
                        shadowRadius: 4,
                    }}
                >
                    <Text
                        className="font-outfit-extrabold text-[#2e6b4e]"
                        style={{
                            fontSize: 32 * s,
                            lineHeight: 38 * s,
                        }}
                        numberOfLines={1}
                    >
                        {userName}
                    </Text>

                    <Text
                        className="mt-[6px] font-outfit-semibold text-[#495a4f]"
                        style={{
                            fontSize: 12 * s,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {userEmail}
                    </Text>
                </View>

                <TouchableOpacity
                    ref={editButtonRef}
                    className="flex-row items-center"
                    style={{
                        marginTop: 8 * s,
                        marginLeft: 4 * s,
                    }}
                    onLayout={handleEditButtonLayout}
                    onPress={onEditProfile}
                    pointerEvents="none"
                    activeOpacity={0.7}
                >
                    <Text
                        className="font-outfit-bold text-[#2e6b4e]"
                        style={{
                            fontSize: 12.5 * s,
                        }}
                    >
                        Edit Profil Kamu
                    </Text>

                    <Ionicons
                        name="chevron-forward"
                        size={13 * s}
                        color="#2e6b4e"
                        style={{
                            marginLeft: 2 * s,
                        }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}
