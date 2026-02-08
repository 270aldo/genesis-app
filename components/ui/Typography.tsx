import { Text, type TextProps } from 'react-native';
import { theme } from '../../constants/theme';

type Variant = 'h1' | 'h2' | 'body';

type TypographyProps = TextProps & {
  variant?: Variant;
};

const styles: Record<Variant, { fontSize: number; fontWeight: TextProps['style'] extends infer _ ? '700' | '500' : never }> = {
  h1: { fontSize: 28, fontWeight: '700' },
  h2: { fontSize: 22, fontWeight: '700' },
  body: { fontSize: 13, fontWeight: '500' },
};

export function Typography({ variant = 'body', style, ...props }: TypographyProps) {
  return <Text {...props} style={[{ color: theme.colors.textPrimary, ...styles[variant] }, style]} />;
}
