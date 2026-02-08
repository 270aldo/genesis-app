import { Pressable, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import { GlassCard, PillBadge } from '../ui';

type VideoCardProps = {
  title: string;
  duration: string;
  onOpen?: () => void;
};

export function VideoCard({ title, duration, onOpen }: VideoCardProps) {
  return (
    <GlassCard>
      <PillBadge label="Video" variant="primary" />
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>{title}</Text>
      <Text style={{ color: theme.colors.textSecondary }}>{duration}</Text>
      <Pressable
        onPress={onOpen}
        style={{
          marginTop: 6,
          borderRadius: theme.radius.button,
          paddingVertical: 10,
          alignItems: 'center',
          backgroundColor: `${theme.colors.primary}22`,
          borderColor: `${theme.colors.primary}66`,
          borderWidth: 1,
        }}
      >
        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Open Video</Text>
      </Pressable>
    </GlassCard>
  );
}
