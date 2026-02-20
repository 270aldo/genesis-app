import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Camera,
  Mic,
  ImageIcon,
  Dumbbell,
  Search,
  Watch,
  ArrowUp,
} from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticLight, hapticSelection } from '../../utils/haptics';

type ChatInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sendDisabled: boolean;
  onOpenWorkout?: () => void;
};

const ICON_SIZE = 18;
const ICON_COLOR = 'rgba(255, 255, 255, 0.5)';
const ICON_BUTTON_SIZE = 36;

type ToolAction = {
  key: string;
  icon: React.ElementType;
  onPress: (router: ReturnType<typeof useRouter>, extras?: { onOpenWorkout?: () => void }) => void;
};

const TOOL_ACTIONS: ToolAction[] = [
  {
    key: 'camera',
    icon: Camera,
    onPress: (router) => router.push('/(modals)/camera-scanner'),
  },
  {
    key: 'mic',
    icon: Mic,
    onPress: (router) => router.push('/(modals)/voice-call'),
  },
  {
    key: 'image',
    icon: ImageIcon,
    onPress: () => hapticSelection(),
  },
  {
    key: 'dumbbell',
    icon: Dumbbell,
    onPress: (_router, extras) => extras?.onOpenWorkout?.() ?? hapticSelection(),
  },
  {
    key: 'search',
    icon: Search,
    onPress: () => hapticSelection(),
  },
  {
    key: 'watch',
    icon: Watch,
    onPress: () => hapticSelection(),
  },
];

export function ChatInput({ value, onChangeText, onSend, sendDisabled, onOpenWorkout }: ChatInputProps) {
  const router = useRouter();

  return (
    <View>
      {/* Tool icons row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 12, paddingVertical: 6 }}
      >
        {TOOL_ACTIONS.map(({ key, icon: Icon, onPress }) => (
          <Pressable
            key={key}
            onPress={() => {
              hapticLight();
              onPress(router, { onOpenWorkout });
            }}
            style={({ pressed }) => ({
              width: ICON_BUTTON_SIZE,
              height: ICON_BUTTON_SIZE,
              borderRadius: ICON_BUTTON_SIZE / 2,
              backgroundColor: pressed
                ? 'rgba(109, 0, 255, 0.12)'
                : 'rgba(255, 255, 255, 0.04)',
              alignItems: 'center',
              justifyContent: 'center',
            })}
            accessibilityRole="button"
            accessibilityLabel={key}
          >
            <Icon size={ICON_SIZE} color={ICON_COLOR} />
          </Pressable>
        ))}
      </ScrollView>

      {/* Text input row */}
      <View
        style={{
          backgroundColor: GENESIS_COLORS.surfaceCard,
          borderWidth: 1,
          borderColor: GENESIS_COLORS.borderSubtle,
          borderRadius: 24,
          padding: 6,
          flexDirection: 'row',
          gap: 6,
          alignItems: 'flex-end',
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Escribele a GENESIS..."
          placeholderTextColor={GENESIS_COLORS.textMuted}
          multiline
          style={{
            flex: 1,
            color: GENESIS_COLORS.textPrimary,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            fontFamily: 'Inter',
            fontSize: 14,
            maxHeight: 100,
          }}
        />

        <View style={{ opacity: sendDisabled ? 0.4 : 1 }}>
          <Pressable
            disabled={sendDisabled}
            onPress={() => {
              hapticLight();
              onSend();
            }}
            accessibilityRole="button"
            accessibilityLabel="Enviar mensaje"
          >
            <LinearGradient
              colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowUp size={20} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
