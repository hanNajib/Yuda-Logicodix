import { Outfit_400Regular, useFonts } from '@expo-google-fonts/outfit'
import { Text, View } from 'react-native'

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({ Outfit_400Regular })

  return (
    <View className="flex-1 items-center justify-center bg-yuda-bg">
      <Text
        className={`${fontsLoaded ? 'font-[Outfit_400Regular]' : ''} text-2xl text-yuda-text`}>
        Tes Yuda
      </Text>
    </View>
  )
}