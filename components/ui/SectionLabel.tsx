import { Text, View, type ViewStyle } from 'react-native';

type SectionLabelProps = {
  title: string;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function SectionLabel({ title, children, style }: SectionLabelProps) {
  return (
    <View className="gap-3" style={style}>
      <Text className="font-jetbrains-medium text-[11px] uppercase tracking-[1.5px]" style={{ color: 'rgba(192, 192, 192, 0.60)' }}>
        {title}
      </Text>
      {children}
    </View>
  );
}
