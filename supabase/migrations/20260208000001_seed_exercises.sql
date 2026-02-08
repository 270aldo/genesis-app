-- Seed: initial exercise catalogue for GENESIS app
-- Migration: 20260208000001_seed_exercises.sql
-- Inserts 16 foundational exercises into the shared exercises table.

INSERT INTO exercises (id, name, category, muscle_groups, equipment, difficulty, instructions, cues)
VALUES
  -- 1. Bench Press
  (gen_random_uuid(), 'Bench Press', 'compound',
   ARRAY['chest', 'triceps', 'front delts'], ARRAY['barbell'], 'intermediate', '',
   ARRAY['Retrae escápulas antes de bajar', 'Baja la barra al pecho medio', 'Empuja en arco hacia atrás', 'No bloquees codos completamente arriba']),

  -- 2. Dumbbell Bench Press
  (gen_random_uuid(), 'Dumbbell Bench Press', 'compound',
   ARRAY['chest', 'triceps', 'front delts'], ARRAY['dumbbell'], 'beginner', '',
   ARRAY['Mayor rango de movimiento que barra', 'Baja hasta sentir estiramiento en pecho', 'Mantén muñecas neutras']),

  -- 3. Incline Bench Press
  (gen_random_uuid(), 'Incline Bench Press', 'compound',
   ARRAY['chest', 'front delts', 'triceps'], ARRAY['barbell'], 'intermediate', '',
   ARRAY['Banco a 30-45 grados', 'Baja al pecho superior', 'Enfócate en la contracción del pecho superior']),

  -- 4. Incline DB Press
  (gen_random_uuid(), 'Incline DB Press', 'compound',
   ARRAY['chest', 'front delts'], ARRAY['dumbbell'], 'beginner', '',
   ARRAY['30 grados de inclinación', 'Baja controlado 3 segundos', 'Junta las mancuernas arriba sin chocarlas']),

  -- 5. Cable Flyes
  (gen_random_uuid(), 'Cable Flyes', 'isolation',
   ARRAY['chest', 'front delts'], ARRAY['cable'], 'beginner', '',
   ARRAY['Ligera flexión de codos constante', 'Siente el estiramiento al abrir', 'Aprieta al centro como abrazando']),

  -- 6. Back Squat
  (gen_random_uuid(), 'Back Squat', 'compound',
   ARRAY['legs', 'glutes', 'core'], ARRAY['barbell'], 'intermediate', '',
   ARRAY['Pies al ancho de hombros', 'Baja hasta que cadera pase rodilla', 'Empuja con talones', 'Mantén pecho arriba y core tenso']),

  -- 7. Conventional Deadlift
  (gen_random_uuid(), 'Conventional Deadlift', 'compound',
   ARRAY['back', 'hamstrings', 'glutes', 'core'], ARRAY['barbell'], 'advanced', '',
   ARRAY['Barra pegada al cuerpo siempre', 'Empuja el piso con los pies', 'Bloquea cadera y rodilla al mismo tiempo', 'Espalda neutra — nunca redondear']),

  -- 8. Romanian Deadlift
  (gen_random_uuid(), 'Romanian Deadlift', 'compound',
   ARRAY['legs', 'hamstrings', 'glutes', 'lower back'], ARRAY['barbell'], 'intermediate', '',
   ARRAY['Rodillas semi-flexionadas fijas', 'Baja deslizando barra por los muslos', 'Siente estiramiento en isquios', 'No bajes más allá de media espinilla']),

  -- 9. Overhead Press
  (gen_random_uuid(), 'Overhead Press', 'compound',
   ARRAY['shoulders', 'triceps', 'core'], ARRAY['barbell'], 'intermediate', '',
   ARRAY['Empieza desde clavícula', 'Empuja recto hacia arriba', 'Mete la cabeza al pasar la barra', 'Core apretado — no arquees espalda']),

  -- 10. Lateral Raises
  (gen_random_uuid(), 'Lateral Raises', 'isolation',
   ARRAY['shoulders', 'traps'], ARRAY['dumbbell'], 'beginner', '',
   ARRAY['Sube hasta paralelo al piso', 'Ligera inclinación hacia adelante', 'Codos ligeramente flexionados', 'Controla la bajada — no dejes caer']),

  -- 11. Barbell Row
  (gen_random_uuid(), 'Barbell Row', 'compound',
   ARRAY['back', 'biceps', 'rear delts'], ARRAY['barbell'], 'intermediate', '',
   ARRAY['Torso a 45 grados', 'Jala hacia el ombligo', 'Aprieta escápulas arriba 1 segundo', 'No uses momentum del torso']),

  -- 12. Pull-ups
  (gen_random_uuid(), 'Pull-ups', 'compound',
   ARRAY['back', 'biceps', 'core'], ARRAY['bodyweight'], 'intermediate', '',
   ARRAY['Agarre prono al ancho de hombros', 'Jala codos hacia la cadera', 'Sube hasta mentón sobre barra', 'Baja controlado — extensión completa']),

  -- 13. Lat Pulldown
  (gen_random_uuid(), 'Lat Pulldown', 'compound',
   ARRAY['back', 'biceps'], ARRAY['cable'], 'beginner', '',
   ARRAY['Inclina torso ligeramente atrás', 'Jala al pecho superior', 'Aprieta escápulas abajo y atrás', 'Extensión completa arriba']),

  -- 14. Leg Press
  (gen_random_uuid(), 'Leg Press', 'compound',
   ARRAY['legs', 'glutes'], ARRAY['machine'], 'beginner', '',
   ARRAY['Pies al ancho de hombros en la plataforma', 'Baja hasta 90 grados de rodilla', 'No bloquees rodillas arriba', 'Mantén espalda baja pegada al respaldo']),

  -- 15. Barbell Curl
  (gen_random_uuid(), 'Barbell Curl', 'isolation',
   ARRAY['arms', 'forearms'], ARRAY['barbell'], 'beginner', '',
   ARRAY['Codos pegados al cuerpo', 'Sube sin balancear el torso', 'Aprieta bíceps arriba 1 segundo', 'Baja controlado']),

  -- 16. Tricep Pushdowns
  (gen_random_uuid(), 'Tricep Pushdowns', 'isolation',
   ARRAY['arms'], ARRAY['cable'], 'beginner', '',
   ARRAY['Codos fijos a los costados', 'Extiende completamente abajo', 'No dejes que el peso jale los brazos arriba rápido']);
