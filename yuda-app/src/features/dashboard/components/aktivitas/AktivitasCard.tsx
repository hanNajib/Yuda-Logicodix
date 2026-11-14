import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { YudaAlertModal, AlertType } from '@/components/ui/YudaAlertModal';
import {
    TaskItem,
    fetchTasks,
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    syncGoogleCalendarTasks,
} from '../../services/taskService';
import {
    createGoogleCalendarEvent,
    fetchGoogleCalendarEvents,
} from '../../services/googleCalendarService';

interface AktivitasCardProps {
    scale?: number;
    selectedDate?: string; // YYYY-MM-DD
    onTasksUpdated?: () => void;
}

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
                            backgroundColor: item.isCompleted ? '#275c43' : '#ffffff',
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
                                color: item.isCompleted ? '#5e6e63' : '#1c241e',
                            }}
                        >
                            {item.title}
                        </Text>
                        {item.google_calendar_event_id && (
                            <View className="mt-1 flex-row items-center">
                                <Ionicons name="calendar-outline" size={11 * s} color="#275c43" />
                                <Text
                                    className="ml-1 font-outfit-medium text-[#275c43]"
                                    style={{ fontSize: 10.5 * s }}
                                >
                                    Google Calendar
                                </Text>
                            </View>
                        )}
                    </View>

                    {item.time ? (
                        <Text
                            className="font-outfit-bold text-[#275c43]"
                            style={{ fontSize: 13 * s }}
                        >
                            {item.time}
                        </Text>
                    ) : null}
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
                        shadowOffset: { width: 0, height: 4 },
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
                                    backgroundColor: pressed ? '#edf2ed' : '#ffffff',
                                }}
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={18 * s}
                                    color="#275c43"
                                />
                                <Text
                                    className="font-outfit-bold text-[#275c43]"
                                    style={{ fontSize: 13 * s, marginLeft: 10 * s }}
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
                                    backgroundColor: pressed ? '#fff0ef' : '#ffffff',
                                }}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={18 * s}
                                    color="#d9534f"
                                />
                                <Text
                                    className="font-outfit-bold text-[#d9534f]"
                                    style={{ fontSize: 13 * s, marginLeft: 10 * s }}
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
    selectedDate: propDate,
    onTasksUpdated,
}: AktivitasCardProps) {
    const s = scale;

    const todayIso = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const targetDate = propDate || todayIso();

    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedTaskId, setSelectedTaskId] = useState<string | number | null>(null);

    // Modal Add / Edit
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | number | null>(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskHour, setTaskHour] = useState<number>(() => new Date().getHours());
    const [taskMinute, setTaskMinute] = useState<number>(0);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [hasTimeSet, setHasTimeSet] = useState(false);
    const [syncGCal, setSyncGCal] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncingGCal, setIsSyncingGCal] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        type?: AlertType;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm?: () => void;
        onCancel?: () => void;
    }>({
        visible: false,
        title: '',
        message: '',
    });

    const showAlert = (
        title: string,
        message: string,
        type: AlertType = 'info',
        onConfirm?: () => void,
        confirmText = 'Mengerti',
        onCancel?: () => void,
        cancelText = 'Batal'
    ) => {
        setAlertConfig({
            visible: true,
            type,
            title,
            message,
            confirmText,
            cancelText,
            onConfirm: () => {
                setAlertConfig((prev) => ({ ...prev, visible: false }));
                onConfirm?.();
            },
            onCancel: onCancel
                ? () => {
                      setAlertConfig((prev) => ({ ...prev, visible: false }));
                      onCancel();
                  }
                : undefined,
        });
    };

    // Load tasks from backend
    const loadTasks = async () => {
        setIsLoading(true);
        try {
            const res = await fetchTasks(targetDate);
            setTasks(res.tasks);
        } catch (e) {
            console.warn('[AktivitasCard] Gagal memuat tasks:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, [targetDate]);

    const completedCount = tasks.filter((t) => t.isCompleted).length;
    const totalCount = tasks.length;
    const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;

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

    const handleToggle = async (task: TaskItem) => {
        if (selectedTaskId) {
            setSelectedTaskId(null);
            return;
        }

        // Optimistic UI update
        setTasks((prev) =>
            prev.map((t) =>
                t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
            )
        );

        try {
            await toggleTaskComplete(task.id);
            onTasksUpdated?.();
        } catch (e) {
            console.warn('[AktivitasCard] Gagal toggle task:', e);
            // Rollback jika gagal
            loadTasks();
        }
    };

    const handleDelete = async (id: string | number) => {
        setSelectedTaskId(null);
        setTasks((prev) => prev.filter((t) => t.id !== id));
        try {
            await deleteTask(id);
            onTasksUpdated?.();
        } catch (e) {
            console.warn('[AktivitasCard] Gagal hapus task:', e);
            loadTasks();
        }
    };

    const parseTimeToHourMinute = (timeStr?: string | null) => {
        if (!timeStr) {
            const now = new Date();
            return { hour: now.getHours(), minute: 0, hasTime: false };
        }
        const parts = timeStr.replace('.', ':').split(':');
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        return {
            hour: !isNaN(h) && h >= 0 && h < 24 ? h : 12,
            minute: !isNaN(m) && m >= 0 && m < 60 ? m : 0,
            hasTime: true,
        };
    };

    const handleOpenAdd = () => {
        // Cek apakah tanggal yang dipilih adalah masa lalu (kemarin dsb)
        const todayStr = getTodayIsoString();
        if (targetDate < todayStr) {
            showAlert('Tidak Dapat Menambah', 'Aktivitas tidak dapat dibuat untuk tanggal di masa lalu.', 'warning');
            return;
        }

        setIsEditing(false);
        setEditingTaskId(null);
        setTaskTitle('');
        const parsed = parseTimeToHourMinute(null);
        setTaskHour(parsed.hour);
        setTaskMinute(parsed.minute);
        setHasTimeSet(false);
        setIsTimePickerOpen(false);
        setSyncGCal(true);
        setModalVisible(true);
    };

    const handleOpenEdit = (task: TaskItem) => {
        // Cek apakah task berasal dari tanggal di masa lalu
        const todayStr = getTodayIsoString();
        const taskDate = task.scheduled_date || targetDate;
        if (taskDate < todayStr) {
            showAlert('Tidak Dapat Mengubah', 'Aktivitas di masa lalu tidak dapat diubah.', 'warning');
            return;
        }

        setSelectedTaskId(null);
        setIsEditing(true);
        setEditingTaskId(task.id);
        setTaskTitle(task.title);
        const parsed = parseTimeToHourMinute(task.time);
        setTaskHour(parsed.hour);
        setTaskMinute(parsed.minute);
        setHasTimeSet(parsed.hasTime);
        setIsTimePickerOpen(false);
        setSyncGCal(Boolean(task.google_calendar_event_id));
        setModalVisible(true);
    };

    const formatHourMinute = (h: number, m: number) => {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const handleSaveTask = async () => {
        if (!taskTitle.trim()) {
            showAlert('Perhatian', 'Judul aktivitas tidak boleh kosong.', 'warning');
            return;
        }

        const todayStr = getTodayIsoString();
        if (targetDate < todayStr) {
            showAlert('Waktu Tidak Valid', 'Tanggal aktivitas tidak boleh di masa lalu.', 'warning');
            return;
        }

        const scheduledTimeStr = hasTimeSet ? formatHourMinute(taskHour, taskMinute) : null;

        // Jika tanggal adalah hari ini dan jam diset, pastikan tidak di masa lalu (misal 1 jam yang lalu)
        if (targetDate === todayStr && scheduledTimeStr) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            if (taskHour < currentHour || (taskHour === currentHour && taskMinute < currentMinute)) {
                showAlert('Waktu Tidak Valid', 'Jam yang kamu tentukan sudah terlewat di hari ini.', 'warning');
                return;
            }
        }

        setIsSaving(true);
        try {
            let googleEventId: string | null = null;

            if (syncGCal) {
                // Ekspor ke Google Calendar
                googleEventId = await createGoogleCalendarEvent({
                    title: taskTitle.trim(),
                    date: targetDate,
                    time: scheduledTimeStr,
                });
            }

            if (isEditing && editingTaskId) {
                await updateTask(editingTaskId, {
                    title: taskTitle.trim(),
                    scheduled_date: targetDate,
                    scheduled_time: scheduledTimeStr,
                    google_calendar_event_id: googleEventId,
                });
            } else {
                await createTask({
                    title: taskTitle.trim(),
                    scheduled_date: targetDate,
                    scheduled_time: scheduledTimeStr,
                    google_calendar_event_id: googleEventId,
                });
            }

            setModalVisible(false);
            await loadTasks();
            onTasksUpdated?.();
        } catch (e: any) {
            showAlert('Gagal Menyimpan', e?.message || 'Tidak dapat menyimpan aktivitas.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Sinkronkan event dari Google Calendar untuk tanggal terpilih
    const handleSyncGoogleCalendar = async () => {
        setIsSyncingGCal(true);
        try {
            const events = await fetchGoogleCalendarEvents(targetDate);
            if (events.length === 0) {
                showAlert(
                    'Agenda Tidak Ditemukan',
                    'Belum ada agenda pada tanggal ini di Google Calendar, atau izin akses Google Calendar belum disetujui.',
                    'calendar'
                );
                return;
            }

            const eventsToSync = events.map((ev) => {
                let timeStr: string | null = null;
                if (ev.start?.dateTime) {
                    const dt = new Date(ev.start.dateTime);
                    const hours = String(dt.getHours()).padStart(2, '0');
                    const mins = String(dt.getMinutes()).padStart(2, '0');
                    timeStr = `${hours}:${mins}`;
                }
                return {
                    title: ev.summary || 'Agenda Google Calendar',
                    scheduled_date: targetDate,
                    scheduled_time: timeStr,
                    google_calendar_event_id: ev.id,
                };
            });

            await syncGoogleCalendarTasks(eventsToSync);
            await loadTasks();
            onTasksUpdated?.();
            showAlert('Sukses Sinkronisasi', `${eventsToSync.length} agenda Google Calendar berhasil diimpor!`, 'success');
        } catch (e: any) {
            showAlert('Gagal Sinkronisasi', e?.message || 'Gagal sinkronisasi Google Calendar.', 'error');
        } finally {
            setIsSyncingGCal(false);
        }
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
                        shadowOffset: { width: 0, height: 2 },
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
                <View className="flex-1" style={{ paddingRight: 12 * s }}>
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
                    onPressIn={() => (btnScale.value = withTiming(0.9, { duration: 80 }))}
                    onPressOut={() => (btnScale.value = withSpring(1, { duration: 200, dampingRatio: 0.75 }))}
                    onPress={handleOpenAdd}
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
                        <Ionicons name="add" size={28 * s} color="#ffffff" />
                    </Animated.View>
                </Pressable>
            </View>

            {/* Tombol Sinkronisasi Google Calendar */}
            <TouchableOpacity
                onPress={handleSyncGoogleCalendar}
                disabled={isSyncingGCal}
                activeOpacity={0.8}
                className="mb-[12px] flex-row items-center justify-center bg-white"
                style={{
                    borderRadius: 16 * s,
                    paddingVertical: 10 * s,
                    paddingHorizontal: 14 * s,
                    borderWidth: 1,
                    borderColor: '#e0e6e1',
                }}
            >
                {isSyncingGCal ? (
                    <ActivityIndicator size="small" color="#275c43" style={{ marginRight: 8 * s }} />
                ) : (
                    <Ionicons name="logo-google" size={16 * s} color="#275c43" style={{ marginRight: 8 * s }} />
                )}
                <Text
                    className="font-outfit-bold text-[#275c43]"
                    style={{ fontSize: 13 * s }}
                >
                    {isSyncingGCal ? 'Menyinkronkan Kalender...' : 'Sinkronkan dari Google Calendar'}
                </Text>
            </TouchableOpacity>

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
                        List Pekerjaan ({targetDate})
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

            {isLoading ? (
                <View className="py-6 items-center justify-center">
                    <ActivityIndicator size="small" color="#275c43" />
                </View>
            ) : tasks.length === 0 ? (
                <View
                    className="items-center justify-center bg-white"
                    style={{
                        paddingVertical: 24 * s,
                        borderRadius: 18 * s,
                        marginBottom: 10 * s,
                    }}
                >
                    <Ionicons name="clipboard-outline" size={32 * s} color="#a8b8ac" />
                    <Text
                        className="mt-2 font-outfit-medium text-[#7a8c80]"
                        style={{ fontSize: 13 * s }}
                    >
                        Belum ada aktivitas di tanggal ini.
                    </Text>
                </View>
            ) : (
                <View>
                    {tasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            item={task}
                            s={s}
                            menuVisible={selectedTaskId === task.id}
                            onToggle={() => handleToggle(task)}
                            onLongPress={() => setSelectedTaskId(task.id)}
                            onEdit={() => handleOpenEdit(task)}
                            onDelete={() => handleDelete(task.id)}
                        />
                    ))}
                </View>
            )}

            {/* Modal Tambah / Edit Task */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View
                    className="flex-1 items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 20 }}
                >
                    <View
                        className="w-full bg-white"
                        style={{
                            borderRadius: 24 * s,
                            padding: 20 * s,
                            maxWidth: 380,
                        }}
                    >
                        <Text
                            className="font-outfit-extrabold text-[#1c241e]"
                            style={{ fontSize: 18 * s, marginBottom: 16 * s }}
                        >
                            {isEditing ? 'Edit Aktivitas' : 'Tambah Aktivitas Baru'}
                        </Text>

                        <Text
                            className="font-outfit-bold text-[#275c43]"
                            style={{ fontSize: 12.5 * s, marginBottom: 6 * s }}
                        >
                            Judul Aktivitas
                        </Text>
                        <TextInput
                            value={taskTitle}
                            onChangeText={setTaskTitle}
                            placeholder="Contoh: Belajar UTBK, Olahraga sore"
                            placeholderTextColor="#a0aca3"
                            className="bg-[#f5f8f5] font-outfit-medium text-[#1c241e]"
                            style={{
                                borderRadius: 14 * s,
                                paddingHorizontal: 14 * s,
                                paddingVertical: 10 * s,
                                fontSize: 14 * s,
                                marginBottom: 14 * s,
                                borderWidth: 1,
                                borderColor: '#e1eae2',
                            }}
                        />

                        <View className="flex-row items-center justify-between" style={{ marginBottom: 6 * s }}>
                            <Text
                                className="font-outfit-bold text-[#275c43]"
                                style={{ fontSize: 12.5 * s }}
                            >
                                Waktu / Jam (Opsional)
                            </Text>
                            {hasTimeSet && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setHasTimeSet(false);
                                        setIsTimePickerOpen(false);
                                    }}
                                >
                                    <Text
                                        className="font-outfit-semibold text-[#8b3a3a]"
                                        style={{ fontSize: 11.5 * s }}
                                    >
                                        Hapus Jam
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Trigger / Display Jam */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                if (!hasTimeSet) {
                                    setHasTimeSet(true);
                                }
                                setIsTimePickerOpen(!isTimePickerOpen);
                            }}
                            className="bg-[#f5f8f5] flex-row items-center justify-between"
                            style={{
                                borderRadius: 14 * s,
                                paddingHorizontal: 14 * s,
                                paddingVertical: 12 * s,
                                marginBottom: isTimePickerOpen ? 8 * s : 16 * s,
                                borderWidth: 1,
                                borderColor: isTimePickerOpen ? '#275c43' : '#e1eae2',
                            }}
                        >
                            <View className="flex-row items-center">
                                <Ionicons
                                    name="time-outline"
                                    size={18 * s}
                                    color={hasTimeSet ? '#275c43' : '#8a9b8f'}
                                    style={{ marginRight: 8 * s }}
                                />
                                <Text
                                    className="font-outfit-bold"
                                    style={{
                                        fontSize: 15 * s,
                                        color: hasTimeSet ? '#1c241e' : '#8a9b8f',
                                    }}
                                >
                                    {hasTimeSet ? formatHourMinute(taskHour, taskMinute) : 'Pilih Jam Aktivitas'}
                                </Text>
                            </View>

                            <Ionicons
                                name={isTimePickerOpen ? 'chevron-up' : 'chevron-down'}
                                size={18 * s}
                                color="#275c43"
                            />
                        </TouchableOpacity>

                        {/* Interactive Clock/Time Stepper */}
                        {isTimePickerOpen && (
                            <View
                                className="bg-[#eef3ef] items-center"
                                style={{
                                    borderRadius: 16 * s,
                                    paddingVertical: 14 * s,
                                    paddingHorizontal: 16 * s,
                                    marginBottom: 16 * s,
                                    borderWidth: 1,
                                    borderColor: '#d7e4d9',
                                }}
                            >
                                <View className="flex-row items-center justify-center">
                                    {/* Jam Control */}
                                    <View className="items-center">
                                        <Text
                                            className="font-outfit-semibold text-[#5c7062]"
                                            style={{ fontSize: 11 * s, marginBottom: 4 * s }}
                                        >
                                            Jam
                                        </Text>
                                        <View className="flex-row items-center">
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => {
                                                    setHasTimeSet(true);
                                                    setTaskHour((prev) => (prev - 1 + 24) % 24);
                                                }}
                                                style={{
                                                    width: 32 * s,
                                                    height: 32 * s,
                                                    borderRadius: 10 * s,
                                                    backgroundColor: '#ffffff',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderWidth: 1,
                                                    borderColor: '#ccd9cf',
                                                }}
                                            >
                                                <Ionicons name="remove" size={16 * s} color="#275c43" />
                                            </TouchableOpacity>

                                            <View
                                                style={{
                                                    width: 48 * s,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Text
                                                    className="font-outfit-extrabold text-[#275c43]"
                                                    style={{ fontSize: 24 * s }}
                                                >
                                                    {String(taskHour).padStart(2, '0')}
                                                </Text>
                                            </View>

                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => {
                                                    setHasTimeSet(true);
                                                    setTaskHour((prev) => (prev + 1) % 24);
                                                }}
                                                style={{
                                                    width: 32 * s,
                                                    height: 32 * s,
                                                    borderRadius: 10 * s,
                                                    backgroundColor: '#ffffff',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderWidth: 1,
                                                    borderColor: '#ccd9cf',
                                                }}
                                            >
                                                <Ionicons name="add" size={16 * s} color="#275c43" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Separator Titik Dua */}
                                    <Text
                                        className="font-outfit-extrabold text-[#275c43]"
                                        style={{
                                            fontSize: 22 * s,
                                            marginHorizontal: 12 * s,
                                            marginTop: 14 * s,
                                        }}
                                    >
                                        :
                                    </Text>

                                    {/* Menit Control */}
                                    <View className="items-center">
                                        <Text
                                            className="font-outfit-semibold text-[#5c7062]"
                                            style={{ fontSize: 11 * s, marginBottom: 4 * s }}
                                        >
                                            Menit
                                        </Text>
                                        <View className="flex-row items-center">
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => {
                                                    setHasTimeSet(true);
                                                    setTaskMinute((prev) => (prev - 5 + 60) % 60);
                                                }}
                                                style={{
                                                    width: 32 * s,
                                                    height: 32 * s,
                                                    borderRadius: 10 * s,
                                                    backgroundColor: '#ffffff',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderWidth: 1,
                                                    borderColor: '#ccd9cf',
                                                }}
                                            >
                                                <Ionicons name="remove" size={16 * s} color="#275c43" />
                                            </TouchableOpacity>

                                            <View
                                                style={{
                                                    width: 48 * s,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Text
                                                    className="font-outfit-extrabold text-[#275c43]"
                                                    style={{ fontSize: 24 * s }}
                                                >
                                                    {String(taskMinute).padStart(2, '0')}
                                                </Text>
                                            </View>

                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => {
                                                    setHasTimeSet(true);
                                                    setTaskMinute((prev) => (prev + 5) % 60);
                                                }}
                                                style={{
                                                    width: 32 * s,
                                                    height: 32 * s,
                                                    borderRadius: 10 * s,
                                                    backgroundColor: '#ffffff',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderWidth: 1,
                                                    borderColor: '#ccd9cf',
                                                }}
                                            >
                                                <Ionicons name="add" size={16 * s} color="#275c43" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Checkbox integrasi Google Calendar */}
                        <Pressable
                            onPress={() => setSyncGCal(!syncGCal)}
                            className="flex-row items-center"
                            style={{ marginBottom: 20 * s }}
                        >
                            <View
                                className="items-center justify-center border-2 border-[#275c43]"
                                style={{
                                    width: 22 * s,
                                    height: 22 * s,
                                    borderRadius: 6 * s,
                                    backgroundColor: syncGCal ? '#275c43' : '#ffffff',
                                    marginRight: 10 * s,
                                }}
                            >
                                {syncGCal && (
                                    <Ionicons name="checkmark" size={15 * s} color="#ffffff" />
                                )}
                            </View>
                            <Text
                                className="font-outfit-medium text-[#2d3a31]"
                                style={{ fontSize: 13 * s }}
                            >
                                Simpan juga ke Google Calendar
                            </Text>
                        </Pressable>

                        <View className="flex-row items-center justify-end">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={{
                                    paddingVertical: 10 * s,
                                    paddingHorizontal: 16 * s,
                                    marginRight: 8 * s,
                                }}
                            >
                                <Text
                                    className="font-outfit-bold text-[#728579]"
                                    style={{ fontSize: 14 * s }}
                                >
                                    Batal
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSaveTask}
                                disabled={isSaving}
                                className="bg-[#275c43] items-center justify-center"
                                style={{
                                    paddingVertical: 10 * s,
                                    paddingHorizontal: 20 * s,
                                    borderRadius: 14 * s,
                                }}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text
                                        className="font-outfit-bold text-white"
                                        style={{ fontSize: 14 * s }}
                                    >
                                        Simpan
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Custom Alert Modal Yuda */}
            <YudaAlertModal
                visible={alertConfig.visible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmText={alertConfig.confirmText}
                cancelText={alertConfig.cancelText}
                onConfirm={alertConfig.onConfirm || (() => setAlertConfig((prev) => ({ ...prev, visible: false })))}
                onCancel={alertConfig.onCancel}
                scale={s}
            />
        </View>
    );
}
