import { queryOptions, useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { ScreenTimeMatrixItem } from '../stores/useScrollMatrixStore';

export interface MatrixResponse {
    status: string;
    range: 'week' | 'month';
    data: ScreenTimeMatrixItem[];
}

export const scrollMatrixKeys = {
    all: ['scroll-matrix'] as const,
    range: (range: 'week' | 'month') => [...scrollMatrixKeys.all, range] as const,
};

export const scrollMatrixOptions = (range: 'week' | 'month') =>
    queryOptions({
        queryKey: scrollMatrixKeys.range(range),
        queryFn: async ({ signal }) => {
            const response = await apiClient.get<MatrixResponse>('/api/intervention/matrix', {
                params: { range },
                signal,
            });
            return response.data?.data || [];
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });

export function useScrollMatrixQuery(range: 'week' | 'month') {
    return useQuery(scrollMatrixOptions(range));
}
