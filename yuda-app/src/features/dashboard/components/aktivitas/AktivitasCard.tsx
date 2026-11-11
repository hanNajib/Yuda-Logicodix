import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

export interface TaskItem {
    id: string;
    title: string;
    time: string;
    isCompleted: boolean;
}

interface AktivitasCardProps {
    scale?: number;
    initialTasks?: TaskItem[];
    onPressAdd?: () => void;
    onPressEdit?: (task: TaskItem) => void;
}

const DEFAULT_TASKS: TaskItem[] = [
    {
        id: '1',
        title: 'Makanin kucing',
        time: '13.00',
        isCompleted: true,
    },
    {
        id: '2',
        title: 'Maki-maki pemerintah',
        time: '15.00',
        isCompleted: false,
    },
    {
        id: '3',
        title: 'Gila kamu, kamu yang gila',
        time: '21.00',
        isCompleted: false,
    },
];

function TaskRow({
    item,
    onToggle,
    onLongPress,
    onEdit,
    onDelete,
    menuVisible,
    s = 1,
}: {
    item: TaskItem;
    onToggle: () => void;
    onLongPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
    menuVisible: boolean;
    s?: number;
}) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withTiming(0.97, { duration: 80 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, {
            duration: 200,
            dampingRatio: 0.8,
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View
            className="relative"
            style={{
                marginBottom: 10 * s,
                zIndex: menuVisible ? 30 : 1,
                elevation: menuVisible ? 20 : 0,
            }}
        >
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onToggle}
                onLongPress={onLongPress}
                delayLongPress={350}
            >
                <Animated.View
                    className="flex-row items-center bg-white"
                    style={[
                        {
                            borderRadius: 20 * s,
                            paddingVertical: 14 * s,
                            paddingHorizontal: 16 * s,
                        },
                        animatedStyle,
                    ]}
                >
                    <View
                        className="items-center justify-center border-2 border-[#275c43]"
                        style={{
                            width: 26 * s,
                            height: 26 * s,
                            borderRadius: 8 * s,
                            backgroundColor: item.isCompleted
                                ? '#275c43'
                                : '#ffffff',
                        }}
                    >
                        {item.isCompleted && (
                            <Ionicons
                                name="checkmark"
                                size={17 * s}
                                color="#ffffff"
                            />
                        )}
                    </View>

                    <Text
                        className="flex-1 font-outfit-bold"
                        style={{
                            fontSize: 14.5 * s,
                            marginLeft: 14 * s,
                            textDecorationLine: item.isCompleted
                                ? 'line-through'
                                : 'none',
                            color: item.isCompleted
                                ? '#5e6e63'
                                : '#1c241e',
                        }}
                    >
                        {item.title}
                    </Text>

                    <Text
                        className="font-outfit-bold text-[#275c43]"
                        style={{ fontSize: 13 * s }}
                    >
                        {item.time}
                    </Text>
                </Animated.View>
            </Pressable>

            {menuVisible && (
                <View
                    className="absolute border border-[#edf0eb] bg-white"
                    style={{
                        right: 10 * s,
                        bottom: '100%',
                        marginBottom: 8 * s,
                        width: 140 * s,
                        padding: 4 * s,
                        borderRadius: 14 * s,
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 4,
                        },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 30,
                        zIndex: 30,
                    }}
                >
                    <Pressable onPress={onEdit}>
                        {({ pressed }) => (
                            <View
                                className="w-full flex-row items-center"
                                style={{
                                    height: 38 * s,
                                    paddingHorizontal: 10 * s,
                                    borderRadius: 9 * s,
                                    backgroundColor: pressed
                                        ? '#edf2ed'
                                        : '#ffffff',
                                }}
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={18 * s}
                                    color="#275c43"
                                />

                                <Text
                                    className="font-outfit-bold text-[#275c43]"
                                    style={{
                                        fontSize: 13 * s,
                                        marginLeft: 10 * s,
                                    }}
                                >
                                    Edit
                                </Text>
                            </View>
                        )}
                    </Pressable>

                    <View className="mx-1 my-[2px] h-px bg-[#edf0eb]" />

                    <Pressable onPress={onDelete}>
                        {({ pressed }) => (
                            <View
                                className="w-full flex-row items-center"
                                style={{
                                    height: 38 * s,
                                    paddingHorizontal: 10 * s,
                                    borderRadius: 9 * s,
                                    backgroundColor: pressed
                                        ? '#fff0ef'
                                        : '#ffffff',
                                }}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={18 * s}
                                    color="#d9534f"
                                />

                                <Text
                                    className="font-outfit-bold text-[#d9534f]"
                                    style={{
                                        fontSize: 13 * s,
                                        marginLeft: 10 * s,
                                    }}
                                >
                                    Hapus
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </View>
            )}
        </View>
    );
}

export function AktivitasCard({
    scale = 1,
    initialTasks = DEFAULT_TASKS,
    onPressAdd,
    onPressEdit,
}: AktivitasCardProps) {
    const s = scale;

    const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const completedCount = tasks.filter(
        (t) => t.isCompleted
    ).length;

    const totalCount = tasks.length;

    const progressRatio = totalCount > 0
        ? completedCount / totalCount
        : 0;

    const progressWidth = useSharedValue(progressRatio);
    const btnScale = useSharedValue(1);

    useEffect(() => {
        progressWidth.value = withSpring(progressRatio, {
            duration: 400,
            dampingRatio: 0.8,
        });
    }, [progressRatio]);

    const barFillStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value * 100}%`,
    }));

    const animatedBtnStyle = useAnimatedStyle(() => ({
        transform: [{ scale: btnScale.value }],
    }));

    const handleToggle = (id: string) => {
        if (selectedTaskId) {
            setSelectedTaskId(null);
            return;
        }

        setTasks((prev) =>
            prev.map((t) =>
                t.id === id
                    ? { ...t, isCompleted: !t.isCompleted }
                    : t
            )
        );
    };

    const handleDelete = (id: string) => {
        setTasks((prev) =>
            prev.filter((t) => t.id !== id)
        );

        setSelectedTaskId(null);
    };

    const handleEdit = (task: TaskItem) => {
        setSelectedTaskId(null);
        onPressEdit?.(task);
    };

    const handleLongPress = (id: string) => {
        setSelectedTaskId(id);
    };

    const handleDismissMenu = () => {
        setSelectedTaskId(null);
    };

    const handleAddPressIn = () => {
        btnScale.value = withTiming(0.9, {
            duration: 80,
        });
    };

    const handleAddPressOut = () => {
        btnScale.value = withSpring(1, {
            duration: 200,
            dampingRatio: 0.75,
        });
    };

    return (
        <View
            className="relative bg-[#cecece]"
            style={{
                borderRadius: 24 * s,
                padding: 12 * s,
                backgroundColor: 'rgba(206, 206, 206, 0.4)',
            }}
        >
            <View
                className="flex-row items-center"
                style={{ marginBottom: 10 * s }}
            >
                <View
                    className="flex-1 justify-center bg-[#275c43]"
                    style={{
                        borderRadius: 20 * s,
                        padding: 16 * s,
                        marginRight: 5 * s,
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.06,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    <Text
                        className="font-outfit-extrabold text-white"
                        style={{ fontSize: 38 * s }}
                    >
                        {totalCount}
                    </Text>

                    <Text
                        className="mt-1 font-outfit-bold text-white"
                        style={{ fontSize: 13.5 * s }}
                    >
                        Aktivitas Hari Ini
                    </Text>
                </View>

                <View
                    className="flex-1 justify-center bg-white"
                    style={{
                        borderRadius: 20 * s,
                        padding: 16 * s,
                        marginLeft: 5 * s,
                    }}
                >
                    <Text
                        className="font-outfit-extrabold text-[#1f2923]"
                        style={{ fontSize: 38 * s }}
                    >
                        {completedCount}
                    </Text>

                    <Text
                        className="mt-1 font-outfit-bold text-[#1f2923]"
                        style={{ fontSize: 13.5 * s }}
                    >
                        Aktivitas Selesai
                    </Text>
                </View>
            </View>

            <View
                className="mb-[10px] flex-row items-center justify-between bg-white"
                style={{
                    borderRadius: 20 * s,
                    padding: 16 * s,
                    marginBottom: 10 * s,
                }}
            >
                <View
                    className="flex-1"
                    style={{ paddingRight: 12 * s }}
                >
                    <Text
                        className="font-outfit-extrabold text-[#1f2923]"
                        style={{ fontSize: 16 * s }}
                    >
                        Tambah Aktivitas
                    </Text>

                    <Text
                        className="mt-1 font-outfit-medium text-[#495a4f]"
                        style={{
                            fontSize: 12.5 * s,
                            lineHeight: 17 * s,
                        }}
                    >
                        Saat kamu doomscroll, Yuda akan mengirim jeda buat ngingetin kamu.
                    </Text>
                </View>

                <Pressable
                    onPressIn={handleAddPressIn}
                    onPressOut={handleAddPressOut}
                    onPress={onPressAdd}
                >
                    <Animated.View
                        className="items-center justify-center bg-[#275c43]"
                        style={[
                            {
                                width: 50 * s,
                                height: 50 * s,
                                borderRadius: 14 * s,
                            },
                            animatedBtnStyle,
                        ]}
                    >
                        <Ionicons
                            name="add"
                            size={28 * s}
                            color="#ffffff"
                        />
                    </Animated.View>
                </Pressable>
            </View>

            <View className="flex-row items-center justify-between">
                <View
                    className="flex-row items-center bg-white"
                    style={{
                        paddingHorizontal: 12 * s,
                        paddingVertical: 6 * s,
                        borderRadius: 12 * s,
                    }}
                >
                    <Ionicons
                        name="checkbox-outline"
                        size={15 * s}
                        color="#275c43"
                        style={{ marginRight: 6 * s }}
                    />

                    <Text
                        className="font-outfit-bold text-[#275c43]"
                        style={{ fontSize: 13 * s }}
                    >
                        List Pekerjaan Hari Ini
                    </Text>
                </View>

                <Text
                    className="font-outfit-extrabold text-[#275c43]"
                    style={{ fontSize: 14 * s }}
                >
                    Selesai {completedCount}/{totalCount}
                </Text>
            </View>

            <View
                className="overflow-hidden bg-[#275c43]"
                style={{
                    height: 10 * s,
                    borderRadius: 5 * s,
                    marginTop: 12 * s,
                    marginBottom: 16 * s,
                    backgroundColor: 'rgba(39, 92, 67, 0.2)',
                }}
            >
                <Animated.View
                    className="h-full flex-row items-center justify-end bg-[#275c43]"
                    style={[
                        {
                            borderRadius: 5 * s,
                            paddingRight: 2,
                        },
                        barFillStyle,
                    ]}
                >
                    <View
                        className="bg-[#d8ebe0]"
                        style={{
                            width: 7 * s,
                            height: 7 * s,
                            borderRadius: 3.5 * s,
                        }}
                    />
                </Animated.View>
            </View>

            <View>
                {tasks.map((task) => (
                    <TaskRow
                        key={task.id}
                        item={task}
                        s={s}
                        menuVisible={selectedTaskId === task.id}
                        onToggle={() => handleToggle(task.id)}
                        onLongPress={() => handleLongPress(task.id)}
                        onEdit={() => handleEdit(task)}
                        onDelete={() => handleDelete(task.id)}
                    />
                ))}
            </View>

        </View>
    );
}
