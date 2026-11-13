import { create } from 'zustand';
import { QuestionnaireApiResponse, QuizAnswers } from '../types/quiz';

interface QuizResultState {
    analysisResult: QuestionnaireApiResponse | null;
    rawAnswers: QuizAnswers | null;
    setAnalysisResult: (result: QuestionnaireApiResponse | null) => void;
    setRawAnswers: (answers: QuizAnswers | null) => void;
}

export const useQuizResultStore = create<QuizResultState>((set) => ({
    analysisResult: null,
    rawAnswers: null,
    setAnalysisResult: (result) => set({ analysisResult: result }),
    setRawAnswers: (answers) => set({ rawAnswers: answers }),
}));

