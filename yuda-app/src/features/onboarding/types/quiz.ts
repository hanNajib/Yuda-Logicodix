export type QuestionKey =
    | 'q1'
    | 'q2'
    | 'q3'
    | 'q4'
    | 'q5'
    | 'q6'
    | 'q7'
    | 'q8'
    | 'q9'
    | 'q10';

export interface QuizOptionItem {
    id: string;
    badge: string;
    text: string;
}

export interface QuizQuestionConfig {
    id: QuestionKey;
    title: string;
    instruction: string;
    type: 'single' | 'multi';
    maxSelect?: number;
    optional?: boolean;
    options: QuizOptionItem[];
}

export interface QuizAnswers {
    q1: string;
    q2: string[];
    q3: string[];
    q4: string;
    q5: string;
    q6: string[];
    q7: string[];
    q8: string[];
    q9: string;
    q10: string[];
    conversation_id?: string | null;
}

export interface Screen1InsightWaktu {
    headline: string;
    subteks: string;
}

export interface Screen2AktivitasItem {
    judul: string;
    deskripsi: string;
}

export interface Screen3TipeDoomscrolling {
    nama_tipe: string;
    subtipe_note: string;
    deskripsi_kecenderungan: string;
    afirmasi_jeda: string;
    waktu_tayang: string;
}

export interface QuestionnaireApiResponse {
    layar_1_insight_waktu: Screen1InsightWaktu;
    layar_2_alternatif_aktivitas: Screen2AktivitasItem[];
    layar_3_tipe_doomscrolling: Screen3TipeDoomscrolling;
    jawaban: string;
    conversation_id?: string;
}

