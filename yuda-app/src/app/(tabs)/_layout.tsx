// src/app/(tabs)/_layout.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    BottomNavBar,
    type DashboardTab,
} from '@/features/dashboard/components/BottomNavBar';

export default function TabsLayout() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const activeTab: DashboardTab =
        pathname === '/pola'
            ? 'stats'
            : pathname === '/tasks'
                ? 'tasks'
                : pathname === '/settings'
                    ? 'settings'
                    : 'home';

    const handleTabPress = (tab: DashboardTab) => {
        switch (tab) {
            case 'home':
                router.navigate('/');
                break;

            case 'stats':
                router.navigate('/pola');
                break;

            case 'tasks':
                router.navigate('/aktivitas');
                break;

            case 'settings':
                router.navigate('/pengaturan');
                break;
        }
    };

    return (
        <View style={styles.container}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'none',
                }}
            />

            <BottomNavBar
                activeTab={activeTab}
                onTabPress={handleTabPress}
                bottomInset={insets.bottom}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF9',
    },
});