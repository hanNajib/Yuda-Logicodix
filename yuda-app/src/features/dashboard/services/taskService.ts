import { apiClient } from '@/services/apiClient';

export interface TaskItem {
    id: string | number;
    title: string;
    time: string;
    scheduled_date?: string;
    scheduled_time?: string | null;
    isCompleted: boolean;
    google_calendar_event_id?: string | null;
}

export interface TaskSummary {
    total_today: number;
    completed_today: number;
}

export interface GetTasksResponse {
    summary: TaskSummary;
    tasks: TaskItem[];
}

export async function fetchTasks(date?: string): Promise<GetTasksResponse> {
    const params = date ? { date } : {};
    const response = await apiClient.get('/api/tasks', { params });
    
    const data = response.data?.data;
    const rawTasks = data?.tasks || [];
    
    const mappedTasks: TaskItem[] = rawTasks.map((t: any) => ({
        id: String(t.id),
        title: t.title,
        time: t.scheduled_time ? t.scheduled_time.substring(0, 5) : '',
        scheduled_date: t.scheduled_date,
        scheduled_time: t.scheduled_time,
        isCompleted: Boolean(t.is_completed),
        google_calendar_event_id: t.google_calendar_event_id || null,
    }));

    return {
        summary: data?.summary || { total_today: mappedTasks.length, completed_today: mappedTasks.filter(t => t.isCompleted).length },
        tasks: mappedTasks,
    };
}

export async function createTask(payload: {
    title: string;
    scheduled_date: string;
    scheduled_time?: string | null;
    sync_to_google_calendar?: boolean;
    google_calendar_event_id?: string | null;
}): Promise<TaskItem> {
    const response = await apiClient.post('/api/tasks', payload);
    const t = response.data?.data;
    return {
        id: String(t.id),
        title: t.title,
        time: t.scheduled_time ? t.scheduled_time.substring(0, 5) : '',
        scheduled_date: t.scheduled_date,
        scheduled_time: t.scheduled_time,
        isCompleted: Boolean(t.is_completed),
        google_calendar_event_id: t.google_calendar_event_id || null,
    };
}

export async function updateTask(
    id: string | number,
    payload: {
        title?: string;
        scheduled_date?: string;
        scheduled_time?: string | null;
        google_calendar_event_id?: string | null;
    }
): Promise<TaskItem> {
    const response = await apiClient.put(`/api/tasks/${id}`, payload);
    const t = response.data?.data;
    return {
        id: String(t.id),
        title: t.title,
        time: t.scheduled_time ? t.scheduled_time.substring(0, 5) : '',
        scheduled_date: t.scheduled_date,
        scheduled_time: t.scheduled_time,
        isCompleted: Boolean(t.is_completed),
        google_calendar_event_id: t.google_calendar_event_id || null,
    };
}

export async function toggleTaskComplete(id: string | number): Promise<TaskItem> {
    const response = await apiClient.patch(`/api/tasks/${id}/complete`);
    const t = response.data?.data;
    return {
        id: String(t.id),
        title: t.title,
        time: t.scheduled_time ? t.scheduled_time.substring(0, 5) : '',
        scheduled_date: t.scheduled_date,
        scheduled_time: t.scheduled_time,
        isCompleted: Boolean(t.is_completed),
        google_calendar_event_id: t.google_calendar_event_id || null,
    };
}

export async function deleteTask(id: string | number): Promise<boolean> {
    const response = await apiClient.delete(`/api/tasks/${id}`);
    return Boolean(response.data?.success);
}

export async function syncGoogleCalendarTasks(events: Array<{
    title: string;
    scheduled_date: string;
    scheduled_time?: string | null;
    google_calendar_event_id: string;
}>): Promise<TaskItem[]> {
    const response = await apiClient.post('/api/tasks/sync-google', { events });
    const tasks = response.data?.data?.tasks || [];
    return tasks.map((t: any) => ({
        id: String(t.id),
        title: t.title,
        time: t.scheduled_time ? t.scheduled_time.substring(0, 5) : '',
        scheduled_date: t.scheduled_date,
        scheduled_time: t.scheduled_time,
        isCompleted: Boolean(t.is_completed),
        google_calendar_event_id: t.google_calendar_event_id || null,
    }));
}

