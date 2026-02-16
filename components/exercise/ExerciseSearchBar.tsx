import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticLight } from '../../utils/haptics';

interface ExerciseSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function ExerciseSearchBar({ value, onChangeText }: ExerciseSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: GENESIS_COLORS.surfaceGlass,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isFocused ? GENESIS_COLORS.primary : GENESIS_COLORS.borderSubtle,
        paddingHorizontal: 14,
        ...(isFocused
          ? {
              shadowColor: GENESIS_COLORS.primary,
              shadowOpacity: 0.3,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 0 },
              elevation: 6,
            }
          : {}),
      }}
    >
      <Search size={16} color={isFocused ? GENESIS_COLORS.primary : GENESIS_COLORS.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Buscar ejercicios..."
        placeholderTextColor={GENESIS_COLORS.textMuted}
        style={{
          flex: 1,
          color: '#FFFFFF',
          fontFamily: 'Inter',
          fontSize: 14,
          paddingVertical: 11,
        }}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => {
            hapticLight();
            onChangeText('');
          }}
          hitSlop={8}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: GENESIS_COLORS.borderSubtle,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={12} color={GENESIS_COLORS.textSecondary} />
          </View>
        </Pressable>
      )}
    </View>
  );
}
