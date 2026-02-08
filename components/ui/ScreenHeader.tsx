import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
};

export function ScreenHeader({ title, subtitle, showBack = false }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center gap-3">
      {showBack && (
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#FFFFFF14]"
        >
          <ChevronLeft size={22} color="white" />
        </Pressable>
      )}
      <View className="flex-1 gap-1">
        <Text className="font-inter-bold text-[22px] text-white">{title}</Text>
        {subtitle && <Text className="font-inter text-[13px] text-[#827a89]">{subtitle}</Text>}
      </View>
    </View>
  );
}
