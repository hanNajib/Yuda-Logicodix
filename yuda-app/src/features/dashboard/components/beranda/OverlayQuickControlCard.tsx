import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import YudaPip from '@/modules/yuda-pip';
import { useAuthStore } from '@/stores/useAuthStore';
import { DEBUG_CONFIG } from '@/constants/debugConfig';

interface OverlayQuickControlCardProps {
    scale?: number;
    userName?: string;
}

export function OverlayQuickControlCard({
    scale: s = 1,
    userName = 'Gathan',
}: OverlayQuickControlCardProps) {
    const { selectedTargetPackages, intervalMinutes } = useAuthStore();
    const [canDraw, setCanDraw] = useState(false);
    const [accessibilityOn, setAccessibilityOn] = useState(false);
    const [monitorRunning, setMonitorRunning] = useState(false);

    const refreshStatus = () => {
        setCanDraw(YudaPip.canDrawOverlays());
        setAccessibilityOn(YudaPip.isAccessibilityServiceEnabled());
        setMonitorRunning(YudaPip.isOverlayMonitorRunning());
    };

    useEffect(() => {
        refreshStatus();
        const interval = setInterval(refreshStatus, 2500);
        return () => clearInterval(interval);
    }, []);

    const handleToggleMonitor = () => {
        if (!canDraw) {
            YudaPip.requestOverlayWithPip();
            return;
        }

        if (monitorRunning) {
            YudaPip.stopOverlayMonitor();
            setMonitorRunning(false);
        } else {
            const currentInterval = intervalMinutes && intervalMinutes > 0 ? intervalMinutes : 15;
            const intervalSeconds = currentInterval * 60;
            const enableDebugBubble = DEBUG_CONFIG.ENABLE_DEBUG_OVERLAY_BUBBLE;
            const started = YudaPip.startOverlayMonitor(userName, selectedTargetPackages, enableDebugBubble, intervalSeconds);
            setMonitorRunning(started);
        }
    };

    const handleOpenAccessibility = () => {
        YudaPip.openAccessibilitySettings();
    };

    return (
        <View
            className="w-full bg-[#e8efe9] border border-[#c9d8cb]"
            style={{
                borderRadius: 20 * s,
                padding: 14 * s,
            }}
        >
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1 pr-2">
                    <View
                        className="items-center justify-center bg-[#2e6b4e] rounded-xl mr-2.5"
                        style={{ width: 36 * s, height: 36 * s }}
                    >
                        <MaterialCommunityIcons name="play-box-multiple" size={20 * s} color="#ffffff" />
                    </View>
                    <View className="flex-1">
                        <Text
                            className="font-outfit-bold text-[#1f2923]"
                            style={{ fontFamily: 'Outfit_700Bold', fontSize: 14 * s }}
                        >
                            Monitoring Reels & Shorts
                        </Text>
                        <Text
                            className="font-outfit-medium text-[#526356]"
                            style={{ fontFamily: 'Outfit_500Medium', fontSize: 11.5 * s }}
                        >
                            {monitorRunning ? `🟢 Aktif deteksi scroll (${intervalMinutes || 15} mnt)` : '⚪ Layanan mati'}
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={handleToggleMonitor}
                    className={`py-1.5 px-3 rounded-xl ${
                        monitorRunning ? 'bg-[#e02424]' : 'bg-[#2e6b4e]'
                    }`}
                >
                    <Text
                        className="text-white font-outfit-bold"
                        style={{ fontFamily: 'Outfit_700Bold', fontSize: 12 * s }}
                    >
                        {monitorRunning ? 'Matikan' : 'Aktifkan'}
                    </Text>
                </Pressable>
            </View>

            {/* Checklist Izin Android */}
            <View className="bg-white/80 rounded-xl p-2.5 gap-2">
                <Pressable
                    onPress={() => !canDraw && YudaPip.requestOverlayWithPip()}
                    className="flex-row items-center justify-between"
                >
                    <View className="flex-row items-center flex-1">
                        <MaterialCommunityIcons
                            name={canDraw ? 'check-circle' : 'alert-circle'}
                            size={18 * s}
                            color={canDraw ? '#2e6b4e' : '#e02424'}
                            style={{ marginRight: 6 * s }}
                        />
                        <Text
                            className="text-[#202923] font-outfit-semibold flex-1"
                            style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12 * s }}
                        >
                            Izin Tampil di Atas App Lain
                        </Text>
                    </View>
                    <Text
                        className={`font-outfit-bold text-[11px] ${
                            canDraw ? 'text-[#2e6b4e]' : 'text-[#e02424] underline'
                        }`}
                        style={{ fontFamily: 'Outfit_700Bold' }}
                    >
                        {canDraw ? 'Aktif' : 'Ketuk Izin'}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={handleOpenAccessibility}
                    className="flex-row items-center justify-between"
                >
                    <View className="flex-row items-center flex-1">
                        <MaterialCommunityIcons
                            name={accessibilityOn ? 'check-circle' : 'alert-circle'}
                            size={18 * s}
                            color={accessibilityOn ? '#2e6b4e' : '#f59e0b'}
                            style={{ marginRight: 6 * s }}
                        />
                        <Text
                            className="text-[#202923] font-outfit-semibold flex-1"
                            style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12 * s }}
                        >
                            Deteksi Aksesibilitas Reels
                        </Text>
                    </View>
                    <Text
                        className={`font-outfit-bold text-[11px] ${
                            accessibilityOn ? 'text-[#2e6b4e]' : 'text-[#d97706] underline'
                        }`}
                        style={{ fontFamily: 'Outfit_700Bold' }}
                    >
                        {accessibilityOn ? 'Aktif' : 'Buka Menu'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

