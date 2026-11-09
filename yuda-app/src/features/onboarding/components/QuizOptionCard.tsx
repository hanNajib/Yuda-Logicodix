import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { QuizOptionItem } from '../types/quiz';

interface QuizOptionCardProps {
    option: QuizOptionItem;
    isSelected: boolean;
    scale: number;
    onSelect: (id: string) => void;
}

export function QuizOptionCard({
    option,
    isSelected,
    scale: s,
    onSelect,
}: QuizOptionCardProps) {
    const reducedMotion = useReducedMotion();
    const pressScale = useSharedValue(1);

    const handlePressIn = () => {
        if (!reducedMotion) {
            pressScale.set(withTiming(0.97, { duration: 110 }));
        }
    };

    const handlePressOut = () => {
        if (!reducedMotion) {
            pressScale.set(withSpring(1, { duration: 250, dampingRatio: 0.8 }));
        }
    };

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pressScale.get() }],
    }));

    return (
        <Animated.View style={animatedCardStyle} className="w-full">
            <Pressable
                onPress={() => onSelect(option.id)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="w-full bg-white flex-row items-center justify-between"
                style={{
                    borderRadius: 16 * s,
                    paddingVertical: 12 * s,
                    paddingHorizontal: 12 * s,
                    borderWidth: 1.5,
                    borderColor: isSelected ? '#2e6b4e' : 'transparent',
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
            >
                <View
                    className="items-center justify-center rounded-xl mr-3"
                    style={{
                        width: 38 * s,
                        height: 38 * s,
                        backgroundColor: isSelected ? '#d9e8dd' : '#edf2ee',
                    }}
                >
                    <Text
                        className="font-outfit-bold text-[#2e6b4e]"
                        style={{
                            fontFamily: 'Outfit_700Bold',
                            fontSize: 15 * s,
                        }}
                    >
                        {option.badge}
                    </Text>
                </View>

                <Text
                    className="flex-1 text-[#1f2923] font-outfit-semibold mr-2"
                    style={{
                        fontFamily: 'Outfit_600SemiBold',
                        fontSize: 13.5 * s,
                        lineHeight: 18 * s,
                    }}
                >
                    {option.text}
                </Text>

                <View
                    className="items-center justify-center rounded-full"
                    style={{
                        width: 24 * s,
                        height: 24 * s,
                        backgroundColor: isSelected ? '#2e6b4e' : '#e2e7e1',
                    }}
                >
                    {isSelected && (
                        <MaterialCommunityIcons
                            name="check"
                            size={15 * s}
                            color="#ffffff"
                        />
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
}
