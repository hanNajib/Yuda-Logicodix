import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import {
    PauseActionType,
    PauseAlertStage,
    PauseBiasaStageLevel,
    PauseDismissReason,
    PauseTaskItem,
    PauseType,
} from '../types';
import { PauseBiasaFlow } from './PauseBiasaFlow';

export type {
    PauseActionType,
    PauseAlertStage,
    PauseBiasaStageLevel,
    PauseDismissReason,
    PauseTaskItem,
    PauseType,
};

export interface YudaPauseAlertFlowProps {
    userName?: string;
    durationMinutes?: number;
    durationSeconds?: number;
    totalElapsedSeconds?: number;
    reminderMinutes?: number;
    pauseType?: PauseType;
    pauseStage?: PauseBiasaStageLevel;
    breathDurationSeconds?: number;
    actionType?: PauseActionType;
    initialStage?: PauseAlertStage;
    tasks?: PauseTaskItem[];
    screenWidth?: number;
    screenHeight?: number;
    onDismiss: (reason: PauseDismissReason) => void;
    onComplete?: () => void;
    onRest?: () => void;
    onContinueScroll?: () => void;
}

export function YudaPauseAlertFlow({
    userName = 'Gathan',
    durationMinutes = 15,
    durationSeconds = 0,
    totalElapsedSeconds,
    reminderMinutes = 15,
    pauseType = 'biasa',
    pauseStage = 1,
    breathDurationSeconds = 30,
    actionType,
    initialStage,
    tasks,
    screenWidth,
    screenHeight,
    onDismiss,
    onComplete,
    onRest,
    onContinueScroll,
}: YudaPauseAlertFlowProps) {
    const windowDims = useWindowDimensions();
    const [layoutDims, setLayoutDims] = useState<{ width: number; height: number } | null>(null);
    const W = screenWidth ?? layoutDims?.width ?? windowDims.width;
    const H = screenHeight ?? layoutDims?.height ?? windowDims.height;

    return (
        <View
            style={
                screenWidth && screenHeight
                    ? { width: screenWidth, height: screenHeight }
                    : styles.root
            }
            onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                if (width > 0 && height > 0) {
                    setLayoutDims({ width, height });
                }
            }}
        >
            {pauseType === 'biasa' ? (
                <PauseBiasaFlow
                    userName={userName}
                    durationMinutes={durationMinutes}
                    durationSeconds={durationSeconds}
                    totalElapsedSeconds={totalElapsedSeconds}
                    reminderMinutes={reminderMinutes}
                    pauseStage={pauseStage}
                    breathDurationSeconds={breathDurationSeconds}
                    actionType={actionType}
                    initialStage={initialStage}
                    tasks={tasks}
                    width={W}
                    height={H}
                    onDismiss={onDismiss}
                    onComplete={onComplete}
                    onRest={onRest}
                    onContinueScroll={onContinueScroll}
                />
            ) : (
                <PauseBiasaFlow
                    userName={userName}
                    durationMinutes={durationMinutes}
                    durationSeconds={durationSeconds}
                    totalElapsedSeconds={totalElapsedSeconds}
                    reminderMinutes={reminderMinutes}
                    pauseStage={pauseStage}
                    breathDurationSeconds={breathDurationSeconds}
                    actionType={actionType}
                    initialStage={initialStage}
                    tasks={tasks}
                    width={W}
                    height={H}
                    onDismiss={onDismiss}
                    onComplete={onComplete}
                    onRest={onRest}
                    onContinueScroll={onContinueScroll}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        ...StyleSheet.absoluteFillObject,
    },
});
