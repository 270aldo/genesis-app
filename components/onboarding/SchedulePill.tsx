import { Pressable, Text } from 'react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticSelection } from '../../utils/haptics';

interface SchedulePillProps {
  value: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function SchedulePill({ value, label, selected, onPress }: SchedulePillProps) {
  const handlePress = () => {
    hapticSelection();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: selected ? '#6D00FF' : 'transparent',
        borderColor: selected ? '#6D00FF' : GENESIS_COLORS.borderSubtle,
      }}
    >
      <Text
        style={{
          color: selected ? '#FFFFFF' : GENESIS_COLORS.textSecondary,
          fontSize: 14,
          fontFamily: selected ? 'InterBold' : 'Inter',
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
