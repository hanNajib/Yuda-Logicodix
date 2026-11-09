import { useMemo, useState } from 'react';
import {
    buildQuestions,
    NO_OTHER_TIME_KEY,
} from '../constants/quizQuestions';
import { QuizAnswers, QuizQuestionConfig } from '../types/quiz';

const INITIAL_ANSWERS: QuizAnswers = {
    q1: '',
    q2: [],
    q3: [],
    q4: '',
    q5: '',
    q6: [],
    q7: [],
    q8: [],
    q9: '',
    q10: [],
};

export function useQuiz() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<QuizAnswers>(INITIAL_ANSWERS);

    const questions: QuizQuestionConfig[] = useMemo(() => {
        return buildQuestions(answers.q1);
    }, [answers.q1]);

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;
    const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

    const isCurrentValid = useMemo(() => {
        if (!currentQuestion) return false;
        const val = answers[currentQuestion.id];
        if (currentQuestion.optional) return true;
        if (currentQuestion.type === 'single') {
            return typeof val === 'string' && val.length > 0;
        }
        return Array.isArray(val) && val.length > 0;
    }, [currentQuestion, answers]);

    const selectOption = (optId: string) => {
        if (!currentQuestion) return;
        const qKey = currentQuestion.id;

        if (currentQuestion.type === 'single') {
            setAnswers((prev) => {
                const next = { ...prev, [qKey]: optId };
                if (qKey === 'q1' && prev.q2.includes(optId)) {
                    next.q2 = prev.q2.filter((id) => id !== optId);
                }
                return next;
            });
            return;
        }

        setAnswers((prev) => {
            const currentSelected = [...(prev[qKey] as string[])];

            if (optId === NO_OTHER_TIME_KEY) {
                if (currentSelected.includes(NO_OTHER_TIME_KEY)) {
                    return { ...prev, [qKey]: [] };
                }
                return { ...prev, [qKey]: [NO_OTHER_TIME_KEY] };
            }

            const cleanList = currentSelected.filter((id) => id !== NO_OTHER_TIME_KEY);
            const exists = cleanList.includes(optId);

            if (exists) {
                return { ...prev, [qKey]: cleanList.filter((id) => id !== optId) };
            }

            const max = currentQuestion.maxSelect ?? 99;
            if (cleanList.length >= max) {
                cleanList.shift();
            }
            cleanList.push(optId);

            return { ...prev, [qKey]: cleanList };
        });
    };

    const nextQuestion = () => {
        if (!isCurrentValid) return false;
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((prev) => prev + 1);
            return false;
        }
        return true;
    };

    const prevQuestion = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    return {
        currentIndex,
        totalQuestions,
        progressPercent,
        currentQuestion,
        answers,
        isCurrentValid,
        selectOption,
        nextQuestion,
        prevQuestion,
        setCurrentIndex,
    };
}

