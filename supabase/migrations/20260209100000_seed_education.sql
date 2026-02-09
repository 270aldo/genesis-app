-- Seed education_content with 6 articles + add missing columns
-- Migration: 20260209100000_seed_education.sql

-- Add columns not present in original migration
ALTER TABLE education_content ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'micro_lesson';
ALTER TABLE education_content ADD COLUMN IF NOT EXISTS genesis_tip text;

-- Insert 6 articles with full body content
INSERT INTO education_content (title, subtitle, category, type, body_md, genesis_tip, image_url, difficulty, duration_min, phase_tags) VALUES

-- edu1: Tempo Training
(
  'Tempo Training: Por qué los segundos importan más que los kilos',
  'El secreto de la hipertrofia que casi nadie aplica',
  'training',
  'micro_lesson',
  E'El tempo training consiste en controlar la velocidad de cada fase del movimiento: excéntrica, pausa, concéntrica y pausa superior. Un tempo típico de hipertrofia es 3-1-2-0.\n\nLa fase excéntrica (bajada) es donde ocurre el mayor daño muscular, que es el estímulo principal para el crecimiento. Alargar esta fase a 3-4 segundos maximiza el tiempo bajo tensión sin necesidad de aumentar el peso.\n\nEstudios recientes muestran que el tiempo bajo tensión total de 40-60 segundos por serie es óptimo para hipertrofia. Con un tempo 3-1-2-0 y 10 reps, alcanzas 60 segundos perfectos.\n\nPara implementarlo: empieza con un 60-70% de tu peso habitual. Te sorprenderá lo difícil que se siente. Aumenta progresivamente manteniendo el tempo estricto.',
  'Prueba esto hoy: en tu próximo set de bench press, cuenta 3 segundos bajando y 2 subiendo. Compara cómo se siente vs tu tempo normal.',
  NULL,
  'beginner',
  4,
  ARRAY['hypertrophy']
),

-- edu2: Fundamentos de Periodización
(
  'Fundamentos de Periodización',
  'Cómo estructurar semanas para progresar sin estancarte',
  'training',
  'video_course',
  E'La periodización es la organización sistemática del entrenamiento en bloques con objetivos específicos. En GENESIS, usamos un modelo de periodización ondulante por bloques dentro de cada Season.\n\nCada Season de 12 semanas incluye fases de hipertrofia, fuerza, potencia y deload. Esta estructura permite desarrollar todas las cualidades físicas mientras previenes el sobreentrenamiento.\n\nLa fase de hipertrofia (semanas 1-4) se enfoca en volumen alto con cargas moderadas. La fase de fuerza (semanas 5-8) reduce volumen pero aumenta intensidad. La fase de potencia (semanas 9-11) trabaja velocidad y explosividad.\n\nLa semana de deload es estratégica: reduce volumen e intensidad para permitir la supercompensación. No es perder tiempo, es invertir en tu próximo ciclo de progreso.',
  'Tu Season actual está diseñado con periodización ondulante. Cada semana tiene un objetivo específico — confía en el proceso.',
  NULL,
  'intermediate',
  8,
  ARRAY['hypertrophy','strength','power','deload']
),

-- edu3: Protein Timing
(
  'Protein Timing: Lo que dice la evidencia actual',
  'Más allá de la ventana anabólica',
  'nutrition',
  'deep_dive',
  E'La "ventana anabólica" post-entrenamiento ha sido uno de los mitos más persistentes en nutrición deportiva. La evidencia actual muestra que es mucho más amplia de lo que se creía: 4-6 horas.\n\nLo que realmente importa es la distribución total de proteína a lo largo del día. Consumir 0.4-0.5g/kg en cada comida, distribuidas en 4-5 tomas, optimiza la síntesis proteica muscular.\n\nEl timing pre-entrenamiento es más importante que el post. Una comida rica en proteína 2-3 horas antes del entrenamiento asegura aminoácidos circulantes durante y después del ejercicio.\n\nPara maximizar resultados: 1.6-2.2g/kg/día de proteína total, distribuida uniformemente. No necesitas un shake inmediatamente después — tu comida post-entreno puede esperar 1-2 horas.',
  'Basado en tus comidas loggeadas, tu distribución de proteína podría mejorar en la mañana. Intenta agregar 10g más al desayuno.',
  NULL,
  'advanced',
  12,
  ARRAY['hypertrophy','strength']
),

-- edu4: Sleep como suplemento
(
  'GENESIS te explica: Por qué el sleep es tu mejor suplemento',
  'La ciencia del recovery nocturno',
  'recovery',
  'genesis_explains',
  E'Durante el sueño profundo (fase N3), tu cuerpo libera el 70% de la hormona de crecimiento diaria. Esta hormona es esencial para la reparación muscular, la síntesis de colágeno y la recuperación del sistema nervioso.\n\nLa privación de sueño reduce la síntesis proteica muscular hasta un 18% y aumenta el cortisol un 37%. Esto significa que dormir mal puede anular gran parte del trabajo que haces en el gym.\n\nPara optimizar tu sueño: mantén un horario consistente (±30 min), enfría tu habitación a 18-20°C, elimina luz azul 1 hora antes de dormir, y evita cafeína después de las 2pm.\n\nGENESIS monitorea tu sueño y ajusta automáticamente la intensidad de tus entrenamientos. Si detectamos sueño pobre consistente, activamos protocolos de recuperación antes de que afecte tu rendimiento.',
  'Tu promedio de sueño esta semana es bueno. Mantén tu rutina nocturna consistente para optimizar la fase N3 de sueño profundo.',
  NULL,
  'beginner',
  5,
  ARRAY['hypertrophy','strength','power','deload']
),

-- edu5: Progressive Overload
(
  'Progressive Overload: El único principio que importa',
  'Cómo aplicarlo correctamente sin lesionarte',
  'training',
  'micro_lesson',
  E'Progressive overload es el principio fundamental del entrenamiento: para seguir adaptándose, el cuerpo necesita estímulos progresivamente más desafiantes. Sin overload, no hay progreso.\n\nNo solo se trata de agregar peso. Puedes progresar aumentando reps, series, frecuencia, reduciendo descanso, mejorando rango de movimiento, o controlando mejor el tempo.\n\nLa clave es la consistencia en la progresión, no la magnitud. Añadir 1-2kg por semana en compuestos o 1-2 reps por serie es suficiente. Los micro-incrementos generan macro-resultados a largo plazo.\n\nGENESIS trackea tu progresión automáticamente y te sugiere cuándo y cómo aumentar. Si llevas 2 semanas sin progresión en un ejercicio, evaluamos si necesitas un ajuste de estrategia.',
  'Revisa tu historial de ejercicios — identifica dónde has progresado y dónde estás estancado. GENESIS puede ayudarte a ajustar.',
  NULL,
  'beginner',
  3,
  ARRAY['hypertrophy','strength']
),

-- edu6: Deload
(
  'Deload: No es debilidad, es estrategia',
  'Cuándo, cómo y por qué bajar el volumen',
  'recovery',
  'genesis_explains',
  E'El deload es una reducción planificada del volumen y/o intensidad del entrenamiento. Típicamente dura 1 semana y se programa cada 4-6 semanas de entrenamiento progresivo.\n\nDurante un entrenamiento intenso, acumulas fatiga que tu cuerpo no puede compensar completamente entre sesiones. El deload permite la supercompensación: tu cuerpo no solo se recupera, sino que se adapta por encima del nivel inicial.\n\nUn deload efectivo reduce el volumen un 40-50% manteniendo la intensidad al 60-70%. Esto mantiene el patrón de movimiento sin agregar estrés significativo. También es buen momento para trabajar movilidad y técnica.\n\nEn GENESIS, el deload está integrado en cada Season. No lo saltes. Los atletas que respetan los deloads progresan más rápido a largo plazo que los que entrenan sin parar.',
  'Estás en la fase correcta de tu Season. Aprovecha el deload para trabajar en movilidad y revisar tu técnica sin presión de peso.',
  NULL,
  'beginner',
  4,
  ARRAY['deload']
);
