import { Text, View } from 'react-native';

type MacroCardProps = {
  label: string;
  value: number;
  unit: string;
  progress: number; // 0-100
  color: string;
};

export function MacroCard({ label, value, unit, progress, color }: MacroCardProps) {
  return (
    <View
      className="flex-1 gap-2 rounded-[16px] border border-[#FFFFFF14] bg-[#14121aB3] p-3"
      style={{ shadowColor: color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 }}
    >
      <Text className="font-jetbrains-medium text-[11px]" style={{ color }}>{label}</Text>
      <View className="flex-row items-baseline gap-1">
        <Text className="font-inter-bold text-[18px] text-white">{value}</Text>
        <Text className="font-inter text-[11px] text-[#827a89]">{unit}</Text>
      </View>
      <View className="h-[6px] w-full rounded-[6px] bg-[#FFFFFF14]">
        <View
          className="h-[6px] rounded-[6px]"
          style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}
