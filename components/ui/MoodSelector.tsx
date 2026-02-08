import { Pressable, Text, View } from 'react-native';
import { Smile, SmilePlus, Meh, Frown, Angry } from 'lucide-react-native';

const moods = [
  { key: 'great', label: 'Great', icon: Smile, color: '#22ff73' },
  { key: 'good', label: 'Good', icon: SmilePlus, color: '#b39aff' },
  { key: 'okay', label: 'Okay', icon: Meh, color: '#38bdf8' },
  { key: 'low', label: 'Low', icon: Frown, color: '#F97316' },
  { key: 'bad', label: 'Bad', icon: Angry, color: '#ff6b6b' },
] as const;

type MoodSelectorProps = {
  selected?: string;
  onSelect?: (mood: string) => void;
};

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <View className="flex-row justify-between">
      {moods.map((mood) => {
        const isSelected = selected === mood.key;
        const IconComponent = mood.icon;
        return (
          <Pressable key={mood.key} className="items-center gap-1" onPress={() => onSelect?.(mood.key)}>
            <View
              className="h-12 w-12 items-center justify-center rounded-full border bg-[#14121aB3]"
              style={[
                { borderColor: isSelected ? mood.color : '#FFFFFF14' },
                isSelected ? { shadowColor: mood.color, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } } : {},
              ]}
            >
              <IconComponent size={22} color={isSelected ? mood.color : '#6b6b7b'} />
            </View>
            <Text className="font-jetbrains text-[9px] text-[#827a89]">{mood.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
