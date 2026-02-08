import { View } from 'react-native';

type WaterDotsProps = {
  filled: number;
  total: number;
};

export function WaterDots({ filled, total }: WaterDotsProps) {
  return (
    <View className="flex-row items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-[10px] w-[10px] rounded-full ${i < filled ? 'bg-[#38bdf8]' : 'bg-[#FFFFFF14]'}`}
        />
      ))}
    </View>
  );
}
