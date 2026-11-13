import { create } from 'zustand';

export interface ScreenTimeMatrixItem {
    id?: number;
    user_id?: number | null;
    guest_uuid?: string | null;
    log_date: string;
    slot_00_02?: number;
    slot_02_04?: number;
    slot_04_06?: number;
    slot_06_08?: number;
    slot_08_10?: number;
    slot_10_12?: number;
    slot_12_14?: number;
    slot_14_16?: number;
    slot_16_18?: number;
    slot_18_20?: number;
    slot_20_22?: number;
    slot_22_00?: number;
    total_screen_time_minutes: number;
    interventions_triggered?: number;
}

interface MatrixUIState {
    filter: 'Minggu Ini' | 'Bulan Ini';
    setFilter: (filter: 'Minggu Ini' | 'Bulan Ini') => void;
}

export const useScrollMatrixStore = create<MatrixUIState>((set) => ({
    filter: 'Minggu Ini',
    setFilter: (filter) => set({ filter }),
}));
