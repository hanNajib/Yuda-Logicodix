import { GoogleSignin } from '@react-native-google-signin/google-signin';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export async function getGoogleCalendarAccessToken(): Promise<string | null> {
    try {
        const tokens = await GoogleSignin.getTokens();
        return tokens.accessToken || null;
    } catch (error) {
        console.warn('[GoogleCalendar] Gagal mengambil tokens:', error);
        return null;
    }
}

export interface GoogleCalendarEventInput {
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    time?: string | null; // HH:mm
}

export interface GoogleCalendarEvent {
    id: string;
    summary: string;
    start: {
        dateTime?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
    };
}

/**
 * Buat event baru di Google Calendar milik pengguna
 */
export async function createGoogleCalendarEvent(
    event: GoogleCalendarEventInput
): Promise<string | null> {
    const accessToken = await getGoogleCalendarAccessToken();
    if (!accessToken) {
        return null;
    }

    try {
        let startBody: any;
        let endBody: any;

        if (event.time) {
            const [hours, minutes] = event.time.split(':');
            const startDt = new Date(`${event.date}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`);
            const endDt = new Date(startDt.getTime() + 60 * 60 * 1000); // durasi default 1 jam

            startBody = { dateTime: startDt.toISOString() };
            endBody = { dateTime: endDt.toISOString() };
        } else {
            startBody = { date: event.date };
            endBody = { date: event.date };
        }

        const response = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                summary: event.title,
                description: event.description || 'Dibuat via Yuda App',
                start: startBody,
                end: endBody,
            }),
        });

        if (!response.ok) {
            const errJson = await response.json().catch(() => null);
            console.warn('[GoogleCalendar] Error create event:', errJson);
            return null;
        }

        const result = await response.json();
        return result.id || null;
    } catch (e) {
        console.warn('[GoogleCalendar] Exception createGoogleCalendarEvent:', e);
        return null;
    }
}

/**
 * Ambil daftar event Google Calendar untuk tanggal tertentu (memperhatikan lokal timezone)
 */
export async function fetchGoogleCalendarEvents(
    dateStr: string // YYYY-MM-DD
): Promise<GoogleCalendarEvent[]> {
    const accessToken = await getGoogleCalendarAccessToken();
    if (!accessToken) {
        return [];
    }

    try {
        // Rentang waktu dari awal hari hingga akhir hari lokal
        const startOfDay = new Date(`${dateStr}T00:00:00`);
        const endOfDay = new Date(`${dateStr}T23:59:59`);

        const timeMin = startOfDay.toISOString();
        const timeMax = endOfDay.toISOString();

        const url = `${CALENDAR_API_BASE}/calendars/primary/events?timeMin=${encodeURIComponent(
            timeMin
        )}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errJson = await response.json().catch(() => null);
            console.warn('[GoogleCalendar] Gagal fetch events:', errJson);
            return [];
        }

        const result = await response.json();
        const items = (result.items || []) as GoogleCalendarEvent[];

        // Filter event yang relevan untuk tanggal ini (baik event spesifik jam maupun all-day)
        return items.filter((item) => {
            if (item.start?.date) {
                // All-day event (format: "YYYY-MM-DD")
                return item.start.date === dateStr;
            }
            if (item.start?.dateTime) {
                const itemDate = new Date(item.start.dateTime);
                const y = itemDate.getFullYear();
                const m = String(itemDate.getMonth() + 1).padStart(2, '0');
                const d = String(itemDate.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}` === dateStr;
            }
            return true;
        });
    } catch (e) {
        console.warn('[GoogleCalendar] Exception fetchGoogleCalendarEvents:', e);
        return [];
    }
}
