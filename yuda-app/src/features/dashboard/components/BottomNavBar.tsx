import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

export type DashboardTab = 'home' | 'stats' | 'tasks' | 'settings';

interface BottomNavBarProps {
    activeTab: DashboardTab;
    onTabPress: (tab: DashboardTab) => void;
    bottomInset?: number;
    scale?: number;
}

interface NavItemProps {
    tabKey: DashboardTab;
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    isActive: boolean;
    onPress: () => void;
    s?: number;
}

const NavItem = React.memo(function NavItem({
    label,
    iconName,
    isActive,
    onPress,
    s = 1,
}: NavItemProps) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withTiming(0.9, {
            duration: 80,
        });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, {
            duration: 200,
            dampingRatio: 0.75,
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    if (isActive) {
        return (
            <Pressable
                className="flex-1 items-center justify-center"
                style={{ marginTop: -18 }}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                <Animated.View
                    className="items-center justify-center bg-white"
                    style={[
                        {
                            width: 50 * s,
                            height: 50 * s,
                            borderRadius: 25 * s,
                            shadowColor: '#000',
                            shadowOffset: {
                                width: 0,
                                height: 3,
                            },
                            shadowOpacity: 0.2,
                            shadowRadius: 5,
                            elevation: 6,
                        },
                        animatedStyle,
                    ]}
                >
                    <Ionicons
                        name={iconName}
                        size={24 * s}
                        color="#2e6b4e"
                    />
                </Animated.View>

                <Text
                    className="font-outfit-bold text-white"
                    style={{
                        fontSize: 11 * s,
                        marginTop: 2 * s,
                    }}
                >
                    {label}
                </Text>
            </Pressable>
        );
    }

    return (
        <Pressable
            className="flex-1 items-center justify-center py-1"
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <Animated.View
                className="items-center justify-center"
                style={animatedStyle}
            >
                <Ionicons
                    name={iconName}
                    size={26 * s}
                    color="#b2cbba"
                />
            </Animated.View>
        </Pressable>
    );
});

export function BottomNavBar({
    activeTab,
    onTabPress,
    bottomInset = 16,
    scale = 1,
}: BottomNavBarProps) {
    const s = scale;

    const handleHomePress = React.useCallback(() => {
        onTabPress('home');
    }, [onTabPress]);

    const handleStatsPress = React.useCallback(() => {
        onTabPress('stats');
    }, [onTabPress]);

    const handleTasksPress = React.useCallback(() => {
        onTabPress('tasks');
    }, [onTabPress]);

    const handleSettingsPress = React.useCallback(() => {
        onTabPress('settings');
    }, [onTabPress]);

    return (
        <View className="absolute bottom-0 left-0 right-0">
            <View
                className="flex-row items-center justify-around rounded-t-[28px] bg-[#2e6b4e]"
                style={{
                    paddingBottom: Math.max(bottomInset, 12) + 4 * s,
                    paddingTop: 10 * s,
                    paddingHorizontal: 20 * s,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -3,
                    },
                    shadowOpacity: 0.12,
                    shadowRadius: 10,
                    elevation: 8,
                }}
            >
                <NavItem
                    tabKey="home"
                    label="Beranda"
                    iconName="home-outline"
                    isActive={activeTab === 'home'}
                    onPress={handleHomePress}
                    s={s}
                />

                <NavItem
                    tabKey="stats"
                    label="Pola"
                    iconName="stats-chart"
                    isActive={activeTab === 'stats'}
                    onPress={handleStatsPress}
                    s={s}
                />

                <NavItem
                    tabKey="tasks"
                    label="Aktivitas"
                    iconName="checkbox-outline"
                    isActive={activeTab === 'tasks'}
                    onPress={handleTasksPress}
                    s={s}
                />

                <NavItem
                    tabKey="settings"
                    label="Pengaturan"
                    iconName="options-outline"
                    isActive={activeTab === 'settings'}
                    onPress={handleSettingsPress}
                    s={s}
                />
            </View>
        </View>
    );
}
