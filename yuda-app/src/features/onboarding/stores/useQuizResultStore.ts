import { create } from 'zustand';
import { QuestionnaireApiResponse } from '../types/quiz';

interface QuizResultState {
    analysisResult: QuestionnaireApiResponse | null;
    setAnalysisResult: (result: QuestionnaireApiResponse | null) => void;
}

export const useQuizResultStore = create<QuizResultState>((set) => ({
    analysisResult: null,
    setAnalysisResult: (result) => set({ analysisResult: result }),
}));

