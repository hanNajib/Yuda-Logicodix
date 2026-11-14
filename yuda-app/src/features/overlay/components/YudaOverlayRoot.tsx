import { useEffect } from 'react';
import { BackHandler, Dimensions, View } from 'react-native';
import YudaPip from '@/modules/yuda-pip';
import {
    PauseActionType,
    PauseBiasaStageLevel,
    PauseDismissReason,
    PauseType,
    YudaPauseAlertFlow,
} from './YudaPauseAlertFlow';

export interface YudaOverlayRootProps {
    userName?: string;
    durationMinutes?: number;
    durationSeconds?: number;
    totalElapsedSeconds?: number;
    reminderMinutes?: number;
    pauseType?: PauseType;
    pauseStage?: number;
    pauseCount?: number;
    breathDurationSeconds?: number;
    actionType?: PauseActionType;
    screenWidth?: number;
    screenHeight?: number;
}

function normalizeStageLevel(stage?: number): PauseBiasaStageLevel {
    if (stage === 2) return 2;
    if (stage === 3) return 3;
    return 1;
}

export function YudaOverlayRoot({
    userName = 'Gathan',
    durationMinutes = 15,
    durationSeconds = 0,
    totalElapsedSeconds,
    reminderMinutes = 15,
    pauseType = 'biasa',
    pauseStage = 1,
    pauseCount = 1,
    breathDurationSeconds = 30,
    actionType,
    screenWidth,
    screenHeight,
}: YudaOverlayRootProps) {
    const screenDims = Dimensions.get('screen');
    const resolvedWidth = screenWidth && screenWidth > 0 ? screenWidth : screenDims.width;
    const resolvedHeight = screenHeight && screenHeight > 0 ? screenHeight : screenDims.height;

    const handleDismiss = (reason: PauseDismissReason) => {
        YudaPip.dismissActiveAlert(reason);
    };

    useEffect(() => {
        // Intervensi Yuda tidak dapat di-dismiss dengan tombol back Android
        // Pengguna harus menyelesaikan instruksi Yuda
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });
        return () => sub.remove();
    }, []);

    return (
        <View
            style={{
                width: resolvedWidth,
                height: resolvedHeight,
                backgroundColor: 'transparent',
            }}
        >
            <YudaPauseAlertFlow
                userName={userName}
                durationMinutes={durationMinutes}
                durationSeconds={durationSeconds}
                totalElapsedSeconds={totalElapsedSeconds}
                reminderMinutes={reminderMinutes}
                pauseType={pauseType}
                pauseStage={normalizeStageLevel(pauseStage)}
                pauseCount={pauseCount}
                breathDurationSeconds={breathDurationSeconds}
                actionType={actionType}
                screenWidth={resolvedWidth}
                screenHeight={resolvedHeight}
                onDismiss={handleDismiss}
            />
        </View>
    );
}
