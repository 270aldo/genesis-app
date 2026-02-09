import type { PropsWithChildren } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

type ImageCardProps = PropsWithChildren<{
  imageUrl: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  height?: number;
  onPress?: () => void;
  style?: ViewStyle;
  overlayColors?: [string, string, ...string[]];
}>;

const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export function ImageCard({
  imageUrl,
  title,
  subtitle,
  badge,
  badgeColor = '#6D00FF',
  height = 180,
  onPress,
  style,
  overlayColors = ['transparent', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.95)'] as [string, string, ...string[]],
  children,
}: ImageCardProps) {
  const content = (
    <>
      <Image
        source={{ uri: imageUrl }}
        placeholder={{ blurhash }}
        contentFit="cover"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        transition={300}
      />
      <LinearGradient
        colors={overlayColors}
        style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}
      >
        {badge && (
          <View
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: badgeColor + '30',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: badgeColor, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
              {badge}
            </Text>
          </View>
        )}
        {children || (
          <View style={{ gap: 4 }}>
            {title && (
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'InterBold' }}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={{ color: 'rgba(192, 192, 192, 0.60)', fontSize: 12, fontFamily: 'Inter' }}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </LinearGradient>
    </>
  );

  const containerStyle: ViewStyle = {
    borderRadius: 16,
    overflow: 'hidden' as const,
    height,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(style as object),
  };

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={containerStyle}>
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}
