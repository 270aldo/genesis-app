import { View } from 'react-native';
import { GENESIS_COLORS } from '../../constants/colors';

export function Divider() {
  return <View className="h-[1px]" style={{ backgroundColor: GENESIS_COLORS.borderSubtle }} />;
}
