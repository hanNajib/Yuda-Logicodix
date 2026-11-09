import {
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/outfit';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';
import { QuizHeaderBanner } from '../components/QuizHeaderBanner';
import { QuizOptionCard } from '../components/QuizOptionCard';
import { QuizProgressHeader } from '../components/QuizProgressHeader';
import { useQuiz } from '../hooks/useQuiz';
import { submitQuestionnaireApi } from '../services/quizService';

export default function QuestionnaireScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: W } = useWindowDimensions();
    const s = Math.min(W / 400, 1.15);
    const reducedMotion = useReducedMotion();

    const { user, userName, userToken, completeOnboarding } = useAuthStore();
    const displayName = userName || user?.name || user?.full_name || 'Kamu';

    const [fontsLoaded] = useFonts({
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    const [submitting, setSubmitting] = useState(false);

    const {
        currentIndex,
        totalQuestions,
        progressPercent,
        currentQuestion,
        answers,
        isCurrentValid,
        selectOption,
        nextQuestion,
        prevQuestion,
    } = useQuiz();

    const contentFade = useSharedValue(1);
    const contentY = useSharedValue(0);

    const prevScale = useSharedValue(1);
    const nextScale = useSharedValue(1);

    useEffect(() => {
        if (reducedMotion) {
            contentFade.set(1);
            contentY.set(0);
            return;
        }

        contentFade.set(0);
        contentY.set(6);

        contentFade.set(withTiming(1, { duration: 220 }));
        contentY.set(withTiming(0, { duration: 220 }));
    }, [currentIndex, reducedMotion]);

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: contentFade.get(),
        transform: [{ translateY: contentY.get() }],
    }));

    const animatedPrevStyle = useAnimatedStyle(() => ({
        transform: [{ scale: prevScale.get() }],
    }));

    const animatedNextStyle = useAnimatedStyle(() => ({
        transform: [{ scale: nextScale.get() }],
    }));

    const handlePressNext = async () => {
        const isFinish = nextQuestion();
        if (isFinish) {
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            await submitQuestionnaireApi(answers, userToken);
            await completeOnboarding();
            router.replace('/');
        } catch (error) {
            console.error('Error submit questionnaire:', error);
            Alert.alert(
                'Selesai',
                'Jawaban kuis kamu tersimpan. Selamat datang di Yuda!',
                [
                    {
                        text: 'Lanjut',
                        onPress: async () => {
                            await completeOnboarding();
                            router.replace('/');
                        },
                    },
                ]
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!fontsLoaded || !currentQuestion) return null;

    const currentVal = answers[currentQuestion.id];

    return (
        <View className="flex-1 bg-[#f5f3ec]">
            <StatusBar style="dark" />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingTop: Math.max(insets.top, 16) + 8 * s,
                    paddingBottom: Math.max(insets.bottom, 20) + 16 * s,
                    paddingHorizontal: 20 * s,
                }}
                showsVerticalScrollIndicator={false}
            >
                <QuizHeaderBanner displayName={displayName} scale={s} />

                <View
                    className="w-full bg-[#e2e7e1]"
                    style={{
                        borderRadius: 22 * s,
                        padding: 18 * s,
                    }}
                >
                    <QuizProgressHeader
                        currentIndex={currentIndex}
                        totalCount={totalQuestions}
                        progressPercent={progressPercent}
                        scale={s}
                    />

                    <Animated.View style={animatedContentStyle}>
                        <Text
                            className="text-[#1f2923] font-outfit-extrabold leading-snug"
                            style={{
                                fontFamily: 'Outfit_800ExtraBold',
                                fontSize: 18 * s,
                                lineHeight: 24 * s,
                            }}
                        >
                            {currentQuestion.title}
                        </Text>

                        <Text
                            className="text-[#526356] font-outfit-medium mt-1 mb-4"
                            style={{
                                fontFamily: 'Outfit_500Medium',
                                fontSize: 12.5 * s,
                            }}
                        >
                            {currentQuestion.instruction}
                        </Text>

                        <View className="gap-2.5">
                            {currentQuestion.options.map((opt) => {
                                const isSelected =
                                    currentQuestion.type === 'single'
                                        ? currentVal === opt.id
                                        : Array.isArray(currentVal) && currentVal.includes(opt.id);

                                return (
                                    <QuizOptionCard
                                        key={opt.id}
                                        option={opt}
                                        isSelected={isSelected}
                                        scale={s}
                                        onSelect={selectOption}
                                    />
                                );
                            })}
                        </View>
                    </Animated.View>

                    <View className="flex-row items-center justify-between mt-6 pt-2">
                        {currentIndex > 0 ? (
                            <Animated.View style={animatedPrevStyle}>
                                <Pressable
                                    onPress={prevQuestion}
                                    onPressIn={() => !reducedMotion && prevScale.set(withTiming(0.95, { duration: 100 }))}
                                    onPressOut={() => !reducedMotion && prevScale.set(withTiming(1, { duration: 150 }))}
                                    className="flex-row items-center py-2 px-1"
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Text
                                        className="text-[#2e6b4e] font-outfit-bold"
                                        style={{
                                            fontFamily: 'Outfit_700Bold',
                                            fontSize: 14.5 * s,
                                        }}
                                    >
                                        ← Sebelumnya
                                    </Text>
                                </Pressable>
                            </Animated.View>
                        ) : (
                            <View />
                        )}

                        <Animated.View style={animatedNextStyle}>
                            <Pressable
                                onPress={handlePressNext}
                                onPressIn={() => !reducedMotion && nextScale.set(withTiming(0.95, { duration: 100 }))}
                                onPressOut={() => !reducedMotion && nextScale.set(withTiming(1, { duration: 150 }))}
                                disabled={!isCurrentValid || submitting}
                                className="flex-row items-center py-2 px-1"
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                style={{
                                    opacity: isCurrentValid && !submitting ? 1 : 0.45,
                                }}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#2e6b4e" />
                                ) : (
                                    <Text
                                        className="text-[#2e6b4e] font-outfit-bold"
                                        style={{
                                            fontFamily: 'Outfit_700Bold',
                                            fontSize: 14.5 * s,
                                        }}
                                    >
                                        {currentIndex === totalQuestions - 1 ? 'Selesai ✓' : 'Selanjutnya →'}
                                    </Text>
                                )}
                            </Pressable>
                        </Animated.View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
