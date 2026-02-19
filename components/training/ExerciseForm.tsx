import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check, ChevronDown, ChevronUp, Minus, Plus, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GENESIS_COLORS } from '../../constants/colors';
import { getExerciseImage } from '../../utils/exerciseImages';
import type { Exercise, ExerciseSet } from '../../types';

type ExerciseFormProps = {
  exercises: Exercise[];
  currentExerciseIndex?: number;
  onToggle: (id: string) => void;
  onLogSet?: (exerciseId: string, setNumber: number, data: { actualReps: number; actualWeight: number; rpe?: number }) => void;
  onSkipSet?: (exerciseId: string, setNumber: number) => void;
  onAddSet?: (exerciseId: string) => void;
  previousData?: Record<string, { weight: number; reps: number }[]>;
  phaseColor?: string;
  prSetNumbers?: Record<string, number[]>;
};

function SetRow({
  exerciseSet,
  exerciseId,
  onLog,
  onSkip,
  previousWeight,
  previousReps,
  phaseColor,
  isPR,
}: {
  exerciseSet: ExerciseSet;
  exerciseId: string;
  onLog?: (exerciseId: string, setNumber: number, data: { actualReps: number; actualWeight: number; rpe?: number }) => void;
  onSkip?: (exerciseId: string, setNumber: number) => void;
  previousWeight?: number;
  previousReps?: number;
  phaseColor: string;
  isPR: boolean;
}) {
  const [weight, setWeight] = useState(exerciseSet.targetWeight);
  const [reps, setReps] = useState(exerciseSet.targetReps);
  const swipeableRef = useRef<Swipeable>(null);

  // Feedback animations (only used for pending sets, but hooks must be called unconditionally)
  const checkScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);

  const flashStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(0, 245, 170, ${flashOpacity.value * 0.2})`,
  }));

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  if (exerciseSet.completed) {
    const displayWeight = exerciseSet.actualWeight ?? exerciseSet.targetWeight;
    const displayReps = exerciseSet.actualReps ?? exerciseSet.targetReps;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingVertical: 6,
          paddingHorizontal: 4,
          backgroundColor: GENESIS_COLORS.success + '10',
          borderRadius: 8,
        }}
      >
        {/* Set number circle — green */}
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: GENESIS_COLORS.success + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: GENESIS_COLORS.success,
              fontSize: 11,
              fontFamily: 'JetBrainsMonoBold',
            }}
          >
            {exerciseSet.setNumber}
          </Text>
        </View>

        {/* Completed text */}
        <Text
          style={{
            flex: 1,
            color: GENESIS_COLORS.success,
            fontSize: 13,
            fontFamily: 'JetBrainsMonoMedium',
          }}
        >
          {displayWeight}kg {'\u00D7'} {displayReps} {'\u2713'}
        </Text>

        {/* PR badge */}
        {isPR && (
          <View
            style={{
              backgroundColor: '#FFD700' + '20',
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                color: '#FFD700',
                fontFamily: 'JetBrainsMonoBold',
                fontSize: 10,
              }}
            >
              PR
            </Text>
          </View>
        )}

        {/* Green check icon */}
        <Check size={16} color={GENESIS_COLORS.success} />
      </View>
    );
  }

  // Unified log handler: triggers animations then calls onLog
  const handleLog = () => {
    checkScale.value = withSequence(
      withSpring(1.3, { damping: 6 }),
      withSpring(1),
    );
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 300 }),
    );
    onLog?.(exerciseId, exerciseSet.setNumber, {
      actualWeight: weight,
      actualReps: reps,
    });
  };

  // Swipe actions: LEFT side revealed on swipe-right = LOG (green)
  const renderLeftActions = () => (
    <View
      style={{
        backgroundColor: GENESIS_COLORS.success + '20',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 10,
        marginVertical: 2,
      }}
    >
      <Check size={20} color={GENESIS_COLORS.success} />
      <Text
        style={{
          color: GENESIS_COLORS.success,
          fontSize: 9,
          fontFamily: 'JetBrainsMonoSemiBold',
          marginTop: 2,
        }}
      >
        LOG
      </Text>
    </View>
  );

  // RIGHT side revealed on swipe-left = SKIP (red)
  const renderRightActions = () => (
    <View
      style={{
        backgroundColor: '#FF6B6B20',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 10,
        marginVertical: 2,
      }}
    >
      <X size={20} color="#FF6B6B" />
      <Text
        style={{
          color: '#FF6B6B',
          fontSize: 9,
          fontFamily: 'JetBrainsMonoSemiBold',
          marginTop: 2,
        }}
      >
        SKIP
      </Text>
    </View>
  );

  const handleSwipeableOpen = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      // User swiped right — complete the set
      handleLog();
    } else {
      // User swiped left — skip the set
      onSkip?.(exerciseId, exerciseSet.setNumber);
    }
    swipeableRef.current?.close();
  };

  // Pending set row: [SET#] [PREV] [-KG+] [-REPS+] [CHECK]
  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeableOpen}
      overshootLeft={false}
      overshootRight={false}
    >
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 4,
            borderRadius: 8,
          },
          flashStyle,
        ]}
      >
        {/* SET# circle */}
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: phaseColor + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 11,
              fontFamily: 'JetBrainsMonoBold',
            }}
          >
            {exerciseSet.setNumber}
          </Text>
        </View>

        {/* PREV column */}
        <View style={{ width: 52, alignItems: 'center' }}>
          <Text
            style={{
              color: GENESIS_COLORS.textTertiary,
              fontSize: 11,
              fontFamily: 'JetBrainsMonoMedium',
            }}
          >
            {previousWeight != null && previousReps != null
              ? `${previousWeight}\u00D7${previousReps}`
              : '\u2014'}
          </Text>
        </View>

        {/* KG stepper */}
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          <Pressable
            onPress={() => setWeight((prev) => Math.max(0, prev - 2.5))}
            style={{
              width: 44,
              height: 36,
              backgroundColor: phaseColor + '15',
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Minus size={14} color={phaseColor} />
          </Pressable>
          <View style={{ minWidth: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontFamily: 'JetBrainsMonoBold',
                textAlign: 'center',
              }}
            >
              {weight % 1 === 0 ? weight : weight.toFixed(1)}
            </Text>
          </View>
          <Pressable
            onPress={() => setWeight((prev) => prev + 2.5)}
            style={{
              width: 44,
              height: 36,
              backgroundColor: phaseColor + '15',
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={14} color={phaseColor} />
          </Pressable>
        </View>

        {/* REPS stepper */}
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          <Pressable
            onPress={() => setReps((prev) => Math.max(0, prev - 1))}
            style={{
              width: 44,
              height: 36,
              backgroundColor: phaseColor + '15',
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Minus size={14} color={phaseColor} />
          </Pressable>
          <View style={{ minWidth: 30, alignItems: 'center', justifyContent: 'center' }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontFamily: 'JetBrainsMonoBold',
                textAlign: 'center',
              }}
            >
              {reps}
            </Text>
          </View>
          <Pressable
            onPress={() => setReps((prev) => prev + 1)}
            style={{
              width: 44,
              height: 36,
              backgroundColor: phaseColor + '15',
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={14} color={phaseColor} />
          </Pressable>
        </View>

        {/* CHECK button with scale animation */}
        <Animated.View style={checkAnimStyle}>
          <Pressable
            onPress={handleLog}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: GENESIS_COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={16} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Swipeable>
  );
}

function calculateVolume(exercise: Exercise): number {
  return (exercise.exerciseSets ?? [])
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + (s.actualWeight ?? s.targetWeight) * (s.actualReps ?? s.targetReps), 0);
}

export function ExerciseForm({
  exercises,
  currentExerciseIndex = 0,
  onToggle,
  onLogSet,
  onSkipSet,
  onAddSet,
  previousData,
  phaseColor = GENESIS_COLORS.primary,
  prSetNumbers,
}: ExerciseFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // If exerciseSets exist, use enhanced mode
  const hasSetData = exercises.some((ex) => ex.exerciseSets && ex.exerciseSets.length > 0);

  if (!hasSetData) {
    // Simple mode fallback — Genesis design
    return (
      <View style={{ gap: 8 }}>
        {exercises.map((exercise) => (
          <Pressable
            key={exercise.id}
            onPress={() => onToggle(exercise.id)}
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: exercise.completed
                ? GENESIS_COLORS.success + '44'
                : GENESIS_COLORS.borderSubtle,
              padding: 14,
              backgroundColor: '#000000',
              gap: 4,
            }}
          >
            <Text
              style={{
                color: GENESIS_COLORS.textPrimary,
                fontFamily: 'InterBold',
                fontSize: 14,
              }}
            >
              {exercise.name}
            </Text>
            <Text
              style={{
                color: GENESIS_COLORS.textSecondary,
                fontFamily: 'JetBrainsMonoMedium',
                fontSize: 12,
              }}
            >
              {exercise.sets}x{exercise.reps} @ {exercise.weight}{exercise.unit}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      {exercises.map((exercise, index) => {
        const isActive = index === currentExerciseIndex;
        const isCompleted = exercise.completed;
        const isUpcoming = index > currentExerciseIndex && !isCompleted;
        const isExpanded = expandedId === exercise.id || isActive;
        const volume = calculateVolume(exercise);
        const completedSets = (exercise.exerciseSets ?? []).filter((s) => s.completed).length;
        const totalSets = exercise.exerciseSets?.length ?? exercise.sets;
        const exercisePrevData = previousData?.[exercise.id];
        const exercisePRSets = prSetNumbers?.[exercise.id] ?? [];

        return (
          <Pressable
            key={exercise.id}
            onPress={() => {
              if (isActive) return;
              setExpandedId(expandedId === exercise.id ? null : exercise.id);
            }}
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: isActive
                ? GENESIS_COLORS.primary
                : isCompleted
                  ? GENESIS_COLORS.success + '44'
                  : GENESIS_COLORS.borderSubtle,
              padding: 14,
              backgroundColor: '#000000',
              gap: 8,
              opacity: isUpcoming ? 0.5 : 1,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Image
                source={{ uri: getExerciseImage(exercise.name) }}
                style={{ width: 36, height: 36, borderRadius: 8 }}
                contentFit="cover"
              />
              <View style={{ flex: 1, gap: 2, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {isCompleted && <Check size={14} color={GENESIS_COLORS.success} />}
                  <Text
                    style={{
                      color: GENESIS_COLORS.textPrimary,
                      fontFamily: 'InterBold',
                      fontSize: 14,
                    }}
                  >
                    {exercise.name}
                  </Text>
                </View>
                <Text
                  style={{
                    color: GENESIS_COLORS.textSecondary,
                    fontSize: 12,
                    fontFamily: 'JetBrainsMonoMedium',
                  }}
                >
                  {completedSets}/{totalSets} sets
                  {isCompleted && volume > 0
                    ? ` \u00B7 ${volume.toLocaleString()}kg vol`
                    : ` \u00B7 ${exercise.weight}${exercise.unit}`}
                </Text>
              </View>
              {!isActive &&
                (isExpanded ? (
                  <ChevronUp size={16} color={GENESIS_COLORS.textTertiary} />
                ) : (
                  <ChevronDown size={16} color={GENESIS_COLORS.textTertiary} />
                ))}
            </View>

            {/* Expanded set rows */}
            {isExpanded && (
              <View
                style={{
                  gap: 4,
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: GENESIS_COLORS.borderSubtle,
                }}
              >
                {/* Column headers */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 2,
                    paddingHorizontal: 0,
                  }}
                >
                  <View style={{ width: 24, alignItems: 'center' }}>
                    <Text style={columnHeaderStyle}>SET</Text>
                  </View>
                  <View style={{ width: 52, alignItems: 'center' }}>
                    <Text style={columnHeaderStyle}>PREV</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={columnHeaderStyle}>KG</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={columnHeaderStyle}>REPS</Text>
                  </View>
                  <View style={{ width: 36, alignItems: 'center' }}>
                    <Text style={columnHeaderStyle}>LOG</Text>
                  </View>
                </View>

                {/* Set rows */}
                {(exercise.exerciseSets ?? []).map((exerciseSet) => {
                  const prevIndex = exerciseSet.setNumber - 1;
                  const prev = exercisePrevData?.[prevIndex];
                  const isPR = exercisePRSets.includes(exerciseSet.setNumber);

                  return (
                    <SetRow
                      key={exerciseSet.setNumber}
                      exerciseSet={exerciseSet}
                      exerciseId={exercise.id}
                      onLog={onLogSet}
                      onSkip={onSkipSet}
                      previousWeight={prev?.weight}
                      previousReps={prev?.reps}
                      phaseColor={phaseColor}
                      isPR={isPR}
                    />
                  );
                })}

                {/* "+ Agregar set" button */}
                {onAddSet && (
                  <Pressable
                    onPress={() => onAddSet(exercise.id)}
                    style={{
                      flexDirection: 'row',
                      gap: 6,
                      alignItems: 'center',
                      paddingVertical: 8,
                    }}
                  >
                    <Plus size={14} color={phaseColor} />
                    <Text
                      style={{
                        color: phaseColor,
                        fontSize: 12,
                        fontFamily: 'JetBrainsMonoSemiBold',
                      }}
                    >
                      Agregar set
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const columnHeaderStyle = {
  color: GENESIS_COLORS.textMuted,
  fontSize: 9,
  fontFamily: 'JetBrainsMonoSemiBold',
  letterSpacing: 1,
} as const;
