-- Phase 6: Expand exercise catalogue to 50 total
-- Migration: 20260209000001_seed_exercises.sql
-- Adds ~34 exercises to complement the 16 already seeded in 20260208000001.

INSERT INTO exercises (id, name, category, muscle_groups, equipment, difficulty, instructions, cues)
VALUES
  -- ═══════════════ PUSH ═══════════════
  -- 17. Dips
  (gen_random_uuid(), 'Dips', 'compound',
   ARRAY['chest', 'triceps', 'front delts'], ARRAY['bodyweight'], 'intermediate', '',
   ARRAY['Inclínate ligeramente adelante para énfasis en pecho', 'Baja hasta que codos formen 90°', 'Empuja recto arriba sin bloquear']),

  -- 18. Close-Grip Bench Press
  (gen_random_uuid(), 'Close-Grip Bench Press', 'compound',
   ARRAY['triceps', 'chest', 'front delts'], ARRAY['barbell'], 'intermediate', '',
   ARRAY['Agarre al ancho de hombros o ligeramente menor', 'Codos pegados al cuerpo al bajar', 'Enfócate en extensión de tríceps arriba']),

  -- 19. Chest Press Machine
  (gen_random_uuid(), 'Chest Press Machine', 'compound',
   ARRAY['chest', 'triceps', 'front delts'], ARRAY['machine'], 'beginner', '',
   ARRAY['Ajusta el asiento para que agarres queden a la altura del pecho', 'Empuja sin bloquear codos', 'Controla la fase negativa']),

  -- 20. Arnold Press
  (gen_random_uuid(), 'Arnold Press', 'compound',
   ARRAY['shoulders', 'triceps', 'front delts'], ARRAY['dumbbell'], 'intermediate', '',
   ARRAY['Empieza con palmas mirando hacia ti', 'Rota mientras subes hasta palmas al frente', 'Movimiento fluido sin pausa']),

  -- 21. Cable Lateral Raise
  (gen_random_uuid(), 'Cable Lateral Raise', 'isolation',
   ARRAY['shoulders'], ARRAY['cable'], 'beginner', '',
   ARRAY['Polea baja, agarre cruzado por detrás', 'Sube hasta paralelo al piso', 'Tensión constante en todo el rango']),

  -- ═══════════════ PULL ═══════════════
  -- 22. Chin-ups
  (gen_random_uuid(), 'Chin-ups', 'compound',
   ARRAY['back', 'biceps'], ARRAY['bodyweight'], 'intermediate', '',
   ARRAY['Agarre supino al ancho de hombros', 'Jala hasta mentón sobre barra', 'Enfócate en apretar bíceps y dorsales', 'Extensión completa abajo']),

  -- 23. T-Bar Row
  (gen_random_uuid(), 'T-Bar Row', 'compound',
   ARRAY['back', 'biceps', 'rear delts'], ARRAY['barbell'], 'intermediate', '',
   ARRAY['Torso a 45 grados', 'Jala hacia el pecho bajo', 'Aprieta escápulas arriba', 'Mantén core apretado']),

  -- 24. Dumbbell Row
  (gen_random_uuid(), 'Dumbbell Row', 'compound',
   ARRAY['back', 'biceps', 'rear delts'], ARRAY['dumbbell'], 'beginner', '',
   ARRAY['Una rodilla y mano en banca', 'Jala hacia la cadera', 'Codo pasa la línea del torso', 'Baja controlado sin rotar']),

  -- 25. Cable Row
  (gen_random_uuid(), 'Cable Row', 'compound',
   ARRAY['back', 'biceps'], ARRAY['cable'], 'beginner', '',
   ARRAY['Siéntate erguido con pecho alto', 'Jala hacia el abdomen', 'Aprieta escápulas 1 segundo', 'Extensión completa sin redondear espalda']),

  -- 26. Face Pulls
  (gen_random_uuid(), 'Face Pulls', 'isolation',
   ARRAY['rear delts', 'traps', 'shoulders'], ARRAY['cable'], 'beginner', '',
   ARRAY['Polea a la altura de la cara', 'Jala hacia las orejas con codos altos', 'Rota externamente al final', 'Aprieta escápulas 2 segundos']),

  -- 27. Reverse Flyes
  (gen_random_uuid(), 'Reverse Flyes', 'isolation',
   ARRAY['rear delts', 'traps'], ARRAY['dumbbell'], 'beginner', '',
   ARRAY['Inclinado a 45 grados', 'Brazos ligeramente flexionados', 'Sube hasta paralelo al piso', 'Controla la bajada — no dejes caer']),

  -- ═══════════════ LEGS ═══════════════
  -- 28. Front Squat
  (gen_random_uuid(), 'Front Squat', 'compound',
   ARRAY['legs', 'glutes', 'core'], ARRAY['barbell'], 'advanced', '',
   ARRAY['Barra en deltoides frontales, codos altos', 'Torso lo más vertical posible', 'Baja profundo manteniendo codos arriba', 'Empuja con talones']),

  -- 29. Goblet Squat
  (gen_random_uuid(), 'Goblet Squat', 'compound',
   ARRAY['legs', 'glutes', 'core'], ARRAY['dumbbell'], 'beginner', '',
   ARRAY['Sostén mancuerna contra el pecho', 'Codos entre rodillas al bajar', 'Baja profundo con torso erguido', 'Excelente para aprender patrón de sentadilla']),

  -- 30. Bulgarian Split Squat
  (gen_random_uuid(), 'Bulgarian Split Squat', 'compound',
   ARRAY['legs', 'glutes'], ARRAY['dumbbell'], 'intermediate', '',
   ARRAY['Pie trasero en banca elevada', 'Baja hasta rodilla casi al piso', 'Torso vertical — no te inclines', 'Empuja con talón del pie delantero']),

  -- 31. Leg Curl
  (gen_random_uuid(), 'Leg Curl', 'isolation',
   ARRAY['hamstrings'], ARRAY['machine'], 'beginner', '',
   ARRAY['Ajusta rodilla al eje de la máquina', 'Sube controlado apretando isquios', 'Baja lento — 3 segundos mínimo', 'No levantes cadera del asiento']),

  -- 32. Leg Extension
  (gen_random_uuid(), 'Leg Extension', 'isolation',
   ARRAY['legs'], ARRAY['machine'], 'beginner', '',
   ARRAY['Ajusta respaldo para que rodilla quede al borde', 'Extiende completo arriba', 'Aprieta cuádriceps 1 segundo arriba', 'Baja controlado']),

  -- 33. Calf Raises
  (gen_random_uuid(), 'Calf Raises', 'isolation',
   ARRAY['legs'], ARRAY['machine'], 'beginner', '',
   ARRAY['Sube hasta punta máxima', 'Aprieta arriba 2 segundos', 'Baja estirando completamente', 'Usa rango completo siempre']),

  -- 34. Hip Thrust
  (gen_random_uuid(), 'Hip Thrust', 'compound',
   ARRAY['glutes', 'hamstrings'], ARRAY['barbell'], 'intermediate', '',
   ARRAY['Espalda alta apoyada en banca', 'Barra sobre la cadera con pad', 'Empuja cadera al techo apretando glúteos', 'Mentón al pecho arriba — no hiperextiendas']),

  -- 35. Walking Lunges
  (gen_random_uuid(), 'Walking Lunges', 'compound',
   ARRAY['legs', 'glutes', 'core'], ARRAY['dumbbell'], 'beginner', '',
   ARRAY['Pasos largos y controlados', 'Rodilla trasera casi toca el piso', 'Torso erguido', 'Empuja con talón para avanzar']),

  -- ═══════════════ CORE ═══════════════
  -- 36. Plank
  (gen_random_uuid(), 'Plank', 'isolation',
   ARRAY['core', 'shoulders'], ARRAY['bodyweight'], 'beginner', '',
   ARRAY['Cuerpo recto de cabeza a talones', 'Aprieta glúteos y abdomen', 'No dejes caer la cadera', 'Respira normal — no contengas']),

  -- 37. Hanging Leg Raises
  (gen_random_uuid(), 'Hanging Leg Raises', 'isolation',
   ARRAY['core'], ARRAY['bodyweight'], 'advanced', '',
   ARRAY['Cuelga con agarre firme', 'Sube piernas rectas hasta 90°', 'Controla la bajada — sin balanceo', 'Curva la pelvis para activar abdomen bajo']),

  -- 38. Cable Woodchops
  (gen_random_uuid(), 'Cable Woodchops', 'isolation',
   ARRAY['core', 'obliques'], ARRAY['cable'], 'intermediate', '',
   ARRAY['Polea alta, gira torso hacia abajo', 'Brazos extendidos — el movimiento viene del core', 'Controla el regreso', 'Pies firmes — no rotan']),

  -- 39. Ab Wheel
  (gen_random_uuid(), 'Ab Wheel', 'isolation',
   ARRAY['core'], ARRAY['bodyweight'], 'advanced', '',
   ARRAY['Empieza de rodillas', 'Extiende lento manteniendo core apretado', 'No dejes que la cadera caiga', 'Regresa contrayendo abdomen']),

  -- 40. Russian Twists
  (gen_random_uuid(), 'Russian Twists', 'isolation',
   ARRAY['core', 'obliques'], ARRAY['dumbbell'], 'beginner', '',
   ARRAY['Sentado con torso a 45 grados', 'Pies levantados del piso', 'Gira de lado a lado controlado', 'Toca el piso a cada lado con el peso']),

  -- 41. Dead Bug
  (gen_random_uuid(), 'Dead Bug', 'isolation',
   ARRAY['core'], ARRAY['bodyweight'], 'beginner', '',
   ARRAY['Acostado boca arriba, brazos al techo', 'Espalda baja pegada al piso siempre', 'Extiende brazo y pierna opuestos', 'Exhala al extender — mantén control']),

  -- ═══════════════ MOBILITY ═══════════════
  -- 42. Cat-Cow
  (gen_random_uuid(), 'Cat-Cow', 'mobility',
   ARRAY['core', 'back'], ARRAY['bodyweight'], 'beginner', '',
   ARRAY['En cuatro puntos', 'Inhala — arquea la espalda mirando arriba', 'Exhala — redondea la espalda mirando al ombligo', 'Movimiento lento y fluido']),

  -- 43. World''s Greatest Stretch
  (gen_random_uuid(), 'World''s Greatest Stretch', 'mobility',
   ARRAY['legs', 'core', 'shoulders'], ARRAY['bodyweight'], 'beginner', '',
   ARRAY['Zancada con mano al piso', 'Rota torso abriendo brazo al techo', 'Mantén 3 segundos cada posición', 'Alterna lados caminando']),

  -- 44. Hip 90/90
  (gen_random_uuid(), 'Hip 90/90', 'mobility',
   ARRAY['legs', 'glutes'], ARRAY['bodyweight'], 'beginner', '',
   ARRAY['Ambas piernas a 90 grados en el piso', 'Rota de un lado al otro', 'Mantén torso erguido', 'Siente el estiramiento en cadera profunda']),

  -- 45. Band Pull-Aparts
  (gen_random_uuid(), 'Band Pull-Aparts', 'mobility',
   ARRAY['rear delts', 'traps', 'shoulders'], ARRAY['band'], 'beginner', '',
   ARRAY['Brazos extendidos al frente', 'Jala la banda separando las manos', 'Aprieta escápulas al final', 'Regresa controlado']),

  -- 46. Foam Roll Sequence
  (gen_random_uuid(), 'Foam Roll Sequence', 'mobility',
   ARRAY['legs', 'back', 'glutes'], ARRAY['bodyweight'], 'beginner', '',
   ARRAY['30 segundos por grupo muscular', 'Rueda lento sobre puntos tensos', 'Pausa 10s en puntos dolorosos', 'Cuádriceps, isquios, IT band, dorsales']),

  -- ═══════════════ ADDITIONAL COMPOUNDS ═══════════════
  -- 47. Sumo Deadlift
  (gen_random_uuid(), 'Sumo Deadlift', 'compound',
   ARRAY['legs', 'glutes', 'back'], ARRAY['barbell'], 'intermediate', '',
   ARRAY['Pies anchos con puntas hacia afuera', 'Agarre entre las piernas', 'Empuja rodillas hacia afuera', 'Pecho arriba — extiende cadera al subir']),

  -- 48. Pendlay Row
  (gen_random_uuid(), 'Pendlay Row', 'compound',
   ARRAY['back', 'biceps', 'rear delts'], ARRAY['barbell'], 'intermediate', '',
   ARRAY['Barra desde el piso cada rep', 'Torso paralelo al piso', 'Jala explosivo hacia el pecho bajo', 'Baja con control hasta tocar piso']),

  -- 49. Dumbbell Shoulder Press
  (gen_random_uuid(), 'Dumbbell Shoulder Press', 'compound',
   ARRAY['shoulders', 'triceps'], ARRAY['dumbbell'], 'beginner', '',
   ARRAY['Sentado con respaldo a 90 grados', 'Sube mancuernas sin chocarlas arriba', 'Baja hasta codos a 90 grados', 'Core apretado durante todo el movimiento']),

  -- 50. Hammer Curl
  (gen_random_uuid(), 'Hammer Curl', 'isolation',
   ARRAY['arms', 'forearms'], ARRAY['dumbbell'], 'beginner', '',
   ARRAY['Agarre neutro — palmas mirándose', 'Sube sin balancear torso', 'Aprieta braquial arriba', 'Baja controlado 2 segundos']);
