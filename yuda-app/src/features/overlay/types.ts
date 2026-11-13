export type PauseType = 'biasa' | 'refleksi' | 'fokus';

export type PauseActionType = 'nafas' | 'minum' | 'peregangan' | 'tidur';

export type PauseBiasaStageLevel = 1 | 2 | 3;

export type PauseDismissReason = 'rest' | 'continue' | 'dismiss';

export type PauseAlertStage =
    | 'alert'
    | 'pauseIntro'
    | 'pauseAction'
    | 'missionSuccess'
    | 'taskReminder'
    | 'breakChoice'
    | 'continueConfirm';

export interface PauseTaskItem {
    id: string;
    title: string;
    time: string;
    isCompleted: boolean;
}

