import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="timer" />
      <Stack.Screen name="set-timer" />
      <Stack.Screen name="select-apps" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="quiz-intro" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="quiz-result-insight" />
      <Stack.Screen name="quiz-result-activities" />
      <Stack.Screen name="quiz-result-profile" />
      <Stack.Screen name="commitment" />
    </Stack>
  );
}

