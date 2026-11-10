import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface QuizProgressSegmentProps {
    isDoneOrCurrent: boolean;
}

function QuizProgressSegment({ isDoneOrCurrent }: QuizProgressSegmentProps) {
    const reducedMotion = useReducedMotion();
    const progressOpacity = useSharedValue(isDoneOrCurrent ? 1 : 0);

    useEffect(() => {
        if (reducedMotion) {
            progressOpacity.set(isDoneOrCurrent ? 1 : 0);
            return;
        }
        progressOpacity.set(withTiming(isDoneOrCurrent ? 1 : 0, { duration: 220 }));
    }, [isDoneOrCurrent, reducedMotion]);

    const activeStyle = useAnimatedStyle(() => ({
        opacity: progressOpacity.get(),
    }));

    return (
        <View className="flex-1 h-2 rounded-full bg-[#b6cbb9] overflow-hidden relative">
            <Animated.View
                style={[{ width: '100%', height: '100%', backgroundColor: '#447b5f' }, activeStyle]}
            />
        </View>
    );
}

interface QuizProgressHeaderProps {
    currentIndex: number;
    totalCount: number;
    progressPercent: number;
    scale: number;
}

export function QuizProgressHeader({
    currentIndex,
    totalCount,
    progressPercent,
    scale: s,
}: QuizProgressHeaderProps) {
    return (
        <>
            <View className="flex-row items-center justify-between mb-2">
                <Text
                    className="text-[#2e6b4e] font-outfit-bold tracking-wider"
                    style={{
                        fontFamily: 'Outfit_700Bold',
                        fontSize: 11.5 * s,
                    }}
                >
                    PERTANYAAN {currentIndex + 1} DARI {totalCount}
                </Text>
                <Text
                    className="text-[#526356] font-outfit-semibold"
                    style={{
                        fontFamily: 'Outfit_600SemiBold',
                        fontSize: 12 * s,
                    }}
                >
                    {progressPercent}% Selesai
                </Text>
            </View>

            <View className="flex-row items-center gap-1.5 mb-5">
                {Array.from({ length: totalCount }).map((_, idx) => (
                    <QuizProgressSegment
                        key={idx}
                        isDoneOrCurrent={idx <= currentIndex}
                    />
                ))}
            </View>
        </>
    );
}
