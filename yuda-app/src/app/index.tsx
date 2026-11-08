import { Outfit_400Regular, useFonts } from '@expo-google-fonts/outfit'
import { Button, Text, View } from 'react-native'
import { useAuthStore } from '@/stores/useAuthStore'

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({ Outfit_400Regular })
  const logout = useAuthStore((state) => state.logout)
  const userName = useAuthStore((state) => state.userName)

  return (
    <View className="flex-1 items-center justify-center bg-yuda-bg">
      <Text
        className="text-2xl text-yuda-text"
        style={{ fontFamily: fontsLoaded ? 'Outfit_400Regular' : undefined }}>
        Halo, {userName || 'Yuda'}!
      </Text>
      <Button title="Logout" onPress={logout} />
    </View>
  )
}