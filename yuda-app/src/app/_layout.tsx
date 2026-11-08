import { Stack } from 'expo-router';
import "../../global.css"
import { StatusBar } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'auth',
};

export default function TabLayout() {
  return (
    <>
      <StatusBar barStyle='auto' />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='index' />
        <Stack.Screen name="auth" />
      </Stack>
    </>
  );
}
