import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import "../../global.css"
import { StatusBar } from 'react-native';

export default function TabLayout() {
  return (
    <>
      <StatusBar barStyle='auto' />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='index' />
      </Stack>
    </>
  );
}
