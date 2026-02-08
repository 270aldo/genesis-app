import { Image, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import { GlassCard, PillBadge } from '../ui';

type ImageCardProps = {
  title: string;
  subtitle: string;
  imageUrl?: string;
};

export function ImageCard({ title, subtitle, imageUrl }: ImageCardProps) {
  return (
    <GlassCard>
      <View style={{ gap: 10 }}>
        <Image
          source={{ uri: imageUrl ?? 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800' }}
          style={{ width: '100%', height: 140, borderRadius: theme.radius.card }}
        />
        <PillBadge label="Visual Insight" variant="info" />
        <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{subtitle}</Text>
      </View>
    </GlassCard>
  );
}
