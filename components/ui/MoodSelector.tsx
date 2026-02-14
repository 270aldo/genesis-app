import { Pressable, Text, View } from 'react-native';
import { Smile, SmilePlus, Meh, Frown, Angry } from 'lucide-react-native';

const moods = [
  { key: 'great', label: 'Great', icon: Smile, color: '#00F5AA' },
  { key: 'good', label: 'Good', icon: SmilePlus, color: '#6D00FF' },
  { key: 'okay', label: 'Okay', icon: Meh, color: '#00D4FF' },
  { key: 'low', label: 'Low', icon: Frown, color: '#FFD93D' },
  { key: 'bad', label: 'Bad', icon: Angry, color: '#FF6B6B' },
] as const;

type MoodSelectorProps = {
  selected?: string;
  onSelect?: (mood: string) => void;
  disabled?: boolean;
};

export function MoodSelector({ selected, onSelect, disabled }: MoodSelectorProps) {
  return (
    <View className="flex-row justify-between" style={disabled ? { opacity: 0.5 } : undefined}>
      {moods.map((mood) => {
        const isSelected = selected === mood.key;
        const IconComponent = mood.icon;
        return (
          <Pressable key={mood.key} className="items-center gap-1" onPress={() => !disabled && onSelect?.(mood.key)} disabled={disabled}>
            <View
              className="h-14 w-14 items-center justify-center rounded-full border bg-[#0A0A0AD9]"
              style={[
                { borderColor: isSelected ? mood.color : '#FFFFFF14' },
                isSelected ? { shadowColor: mood.color, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } } : {},
              ]}
            >
              <IconComponent size={28} color={isSelected ? mood.color : 'rgba(255, 255, 255, 0.40)'} />
            </View>
            <Text className="font-jetbrains text-[9px]" style={{ color: 'rgba(192, 192, 192, 0.60)' }}>{mood.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
