import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import {
    TaskItem,
    fetchTasks,
    toggleTaskComplete,
} from '../../services/taskService';

interface TodoListProps {
    scale?: number;
    initialTasks?: TaskItem[];
}

interface TaskRowProps {
    item: TaskItem;
    onToggle: () => void;
    scale?: number;
}

function TaskRow({
    item,
    onToggle,
    scale = 1,
}: TaskRowProps) {
    const s = scale;
    const animationScale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: animationScale.value }],
    }));

    const handlePressIn = () => {
        animationScale.value = withTiming(0.97, { duration: 80 });
    };

    const handlePressOut = () => {
        animationScale.value = withSpring(1, {
            duration: 200,
            dampingRatio: 0.8,
        });
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onToggle}
            style={{ marginBottom: 10 * s }}
        >
            <Animated.View
                className="flex-row items-center bg-white"
                style={[
                    {
                        borderRadius: 16 * s,
                        paddingVertical: 14 * s,
                        paddingHorizontal: 16 * s,
                    },
                    animatedStyle,
                ]}
            >
                <View
                    className="items-center justify-center border-2"
                    style={{
                        width: 26 * s,
                        height: 26 * s,
                        borderRadius: 8 * s,
                        backgroundColor: item.isCompleted ? '#2e6b4e' : '#ffffff',
                        borderColor: item.isCompleted ? '#2e6b4e' : '#a8b8ac',
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

                <View className="flex-1" style={{ marginLeft: 14 * s }}>
                    <Text
                        className="font-outfit-bold"
                        style={{
                            fontSize: 14.5 * s,
                            textDecorationLine: item.isCompleted ? 'line-through' : 'none',
                            color: item.isCompleted ? '#55685d' : '#1f2923',
                        }}
                    >
                        {item.title}
                    </Text>
                    {item.google_calendar_event_id && (
                        <View className="mt-1 flex-row items-center">
                            <Ionicons name="calendar-outline" size={11 * s} color="#2e6b4e" />
                            <Text
                                className="ml-1 font-outfit-medium text-[#2e6b4e]"
                                style={{ fontSize: 10.5 * s }}
                            >
                                Google Calendar
                            </Text>
                        </View>
                    )}
                </View>

                {item.time ? (
                    <Text
                        className="font-outfit-bold text-[#2e6b4e]"
                        style={{ fontSize: 13 * s }}
                    >
                        {item.time}
                    </Text>
                ) : null}
            </Animated.View>
        </Pressable>
    );
}

export function ToDoListCard({
    scale = 1,
}: TodoListProps) {
    const s = scale;
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const todayIso = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const loadTodayTasks = async () => {
        try {
            const res = await fetchTasks(todayIso());
            setTasks(res.tasks);
        } catch (e) {
            console.warn('[ToDoListCard] Gagal memuat tasks hari ini:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTodayTasks();
    }, []);

    const completedCount = tasks.filter((task) => task.isCompleted).length;
    const totalCount = tasks.length;
    const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;

    const progressWidth = useSharedValue(progressRatio);

    useEffect(() => {
        progressWidth.value = withSpring(progressRatio, {
            duration: 400,
            dampingRatio: 0.8,
        });
    }, [progressRatio]);

    const barFillStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value * 100}%`,
    }));

    const handleToggle = async (id: string | number) => {
        // Optimistic UI update
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
            )
        );

        try {
            await toggleTaskComplete(id);
        } catch (e) {
            console.warn('[ToDoListCard] Gagal toggle complete:', e);
            loadTodayTasks();
        }
    };

    return (
        <View
            className="bg-[#CECECE]/40"
            style={{
                borderRadius: 24 * s,
                padding: 18 * s,
            }}
        >
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
                        color="#2e6b4e"
                        style={{ marginRight: 6 * s }}
                    />

                    <Text
                        className="font-outfit-bold text-[#2e6b4e]"
                        style={{ fontSize: 13 * s }}
                    >
                        List Pekerjaan Hari Ini
                    </Text>
                </View>

                <Text
                    className="font-outfit-extrabold text-[#2e6b4e]"
                    style={{ fontSize: 14 * s }}
                >
                    Selesai {completedCount}/{totalCount}
                </Text>
            </View>

            <View
                className="overflow-hidden bg-[#2f6b4f]/20"
                style={{
                    height: 10 * s,
                    borderRadius: 5 * s,
                    marginVertical: 14 * s,
                }}
            >
                <Animated.View
                    className="h-full flex-row items-center justify-end bg-[#2e6b4e]"
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

            {isLoading ? (
                <View className="py-4 items-center justify-center">
                    <ActivityIndicator size="small" color="#2e6b4e" />
                </View>
            ) : tasks.length === 0 ? (
                <View
                    className="items-center justify-center bg-white"
                    style={{
                        paddingVertical: 20 * s,
                        borderRadius: 16 * s,
                        marginTop: 4 * s,
                    }}
                >
                    <Ionicons name="checkmark-done-circle-outline" size={28 * s} color="#a8b8ac" />
                    <Text
                        className="mt-1 font-outfit-medium text-[#7a8c80]"
                        style={{ fontSize: 13 * s }}
                    >
                        Tidak ada aktivitas yang dijadwalkan hari ini.
                    </Text>
                </View>
            ) : (
                <View style={{ marginTop: 4 * s }}>
                    {tasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            item={task}
                            onToggle={() => handleToggle(task.id)}
                            scale={s}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}
