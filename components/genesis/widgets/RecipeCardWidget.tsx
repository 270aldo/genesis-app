import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChefHat, Clock, Users, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../ui/GlassCard';
import { GENESIS_COLORS } from '../../../constants/colors';
import { hapticLight, hapticNotificationSuccess } from '../../../utils/haptics';
import type { WidgetPayload } from '../../../types';

export function RecipeCardWidget({ widget }: { widget: WidgetPayload }) {
  const prepTime = (widget.data?.prepTime as string) ?? '';
  const servings = (widget.data?.servings as number) ?? 0;
  const ingredients = (widget.data?.ingredients as string[]) ?? [];
  const protein = (widget.data?.protein as number) ?? 0;
  const carbs = (widget.data?.carbs as number) ?? 0;
  const fat = (widget.data?.fat as number) ?? 0;
  const calories = (widget.data?.calories as number) ?? 0;

  const [logged, setLogged] = useState(false);

  const handleLog = useCallback(() => {
    hapticNotificationSuccess();
    setLogged(true);
    // In a real implementation this would persist via BFF/Supabase
  }, []);

  return (
    <GlassCard>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <ChefHat size={18} color={GENESIS_COLORS.primary} />
        <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 16, fontWeight: '700', flex: 1 }}>
          {widget.title ?? 'Receta'}
        </Text>
      </View>

      {/* Subtitle / description */}
      {widget.subtitle && (
        <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, marginBottom: 12, lineHeight: 18 }}>
          {widget.subtitle}
        </Text>
      )}

      {/* Meta: prep time + servings */}
      {(prepTime || servings > 0) && (
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 14 }}>
          {prepTime ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color={GENESIS_COLORS.textMuted} />
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12 }}>
                {prepTime}
              </Text>
            </View>
          ) : null}
          {servings > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Users size={14} color={GENESIS_COLORS.textMuted} />
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12 }}>
                {servings} {servings === 1 ? 'porcion' : 'porciones'}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Macro breakdown */}
      {(protein > 0 || carbs > 0 || fat > 0) && (
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 14,
            gap: 4,
          }}
        >
          {calories > 0 && (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 16, fontFamily: 'JetBrainsMonoBold' }}>
                {calories}
              </Text>
              <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 10, marginTop: 2 }}>kcal</Text>
            </View>
          )}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'JetBrainsMonoBold' }}>
              {protein}g
            </Text>
            <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 10, marginTop: 2 }}>Proteina</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: GENESIS_COLORS.success, fontSize: 16, fontFamily: 'JetBrainsMonoBold' }}>
              {carbs}g
            </Text>
            <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 10, marginTop: 2 }}>Carbos</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#F97316', fontSize: 16, fontFamily: 'JetBrainsMonoBold' }}>
              {fat}g
            </Text>
            <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 10, marginTop: 2 }}>Grasa</Text>
          </View>
        </View>
      )}

      {/* Ingredients list */}
      {ingredients.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              color: GENESIS_COLORS.textSecondary,
              fontSize: 11,
              fontFamily: 'JetBrainsMonoMedium',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Ingredientes
          </Text>
          {ingredients.map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 5,
                borderBottomWidth: i < ingredients.length - 1 ? 1 : 0,
                borderBottomColor: GENESIS_COLORS.borderSubtle,
              }}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: GENESIS_COLORS.primary,
                }}
              />
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, flex: 1 }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Log button */}
      {logged ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 12,
            backgroundColor: `${GENESIS_COLORS.success}15`,
            borderRadius: 12,
          }}
        >
          <Check size={16} color={GENESIS_COLORS.success} />
          <Text style={{ color: GENESIS_COLORS.success, fontSize: 14, fontWeight: '700' }}>
            Comida registrada
          </Text>
        </View>
      ) : (
        <Pressable onPress={handleLog}>
          <LinearGradient
            colors={[GENESIS_COLORS.primaryLight, GENESIS_COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
              Loggear esta comida
            </Text>
          </LinearGradient>
        </Pressable>
      )}

      {/* GENESIS badge */}
      <Text
        style={{
          color: GENESIS_COLORS.primary,
          fontSize: 9,
          fontFamily: 'JetBrainsMonoMedium',
          marginTop: 12,
          opacity: 0.7,
        }}
      >
        GENERATED BY GENESIS
      </Text>
    </GlassCard>
  );
}
