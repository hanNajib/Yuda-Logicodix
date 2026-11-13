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
    reminderMinutes?: number;
    pauseType?: PauseType;
    pauseStage?: number;
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
    reminderMinutes = 15,
    pauseType = 'biasa',
    pauseStage = 1,
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
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            YudaPip.dismissActiveAlert('dismiss');
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
                reminderMinutes={reminderMinutes}
                pauseType={pauseType}
                pauseStage={normalizeStageLevel(pauseStage)}
                breathDurationSeconds={breathDurationSeconds}
                actionType={actionType}
                screenWidth={resolvedWidth}
                screenHeight={resolvedHeight}
                onDismiss={handleDismiss}
            />
        </View>
    );
}
