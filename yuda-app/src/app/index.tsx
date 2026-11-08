import { Outfit_400Regular, useFonts } from '@expo-google-fonts/outfit'
import { Text, View } from 'react-native'

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({ Outfit_400Regular })

  return (
    <View className="flex-1 items-center justify-center bg-yuda-bg">
      <Text
        className="text-2xl text-yuda-text"
        style={{ fontFamily: fontsLoaded ? 'Outfit_400Regular' : undefined }}>
        Tes Yudaa
      </Text>
    </View>
  )
}