import { API_ENDPOINTS } from '@/constants/api';
import { QuestionnaireApiResponse, QuizAnswers } from '../types/quiz';

export async function submitQuestionnaireApi(
    answers: QuizAnswers,
    token?: string | null
): Promise<QuestionnaireApiResponse> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const payload = {
        q1: answers.q1,
        q2: answers.q2.length > 0 ? answers.q2 : null,
        q3: answers.q3,
        q4: answers.q4,
        q5: answers.q5,
        q6: answers.q6,
        q7: answers.q7,
        q8: answers.q8,
        q9: answers.q9,
        q10: answers.q10,
        conversation_id: answers.conversation_id ?? null,
    };

    console.log("=== SUBMITTING QUESTIONNAIRE API ===");
    console.log("URL:", API_ENDPOINTS.aiQuestionnaire);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(API_ENDPOINTS.aiQuestionnaire, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API Questionnaire Error] Status: ${response.status}`, errorText);
        throw new Error(`Kuis API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log("=== AI QUESTIONNAIRE RESPONSE SUCCESS ===");
    console.log(JSON.stringify(data, null, 2));
    return data;
}

