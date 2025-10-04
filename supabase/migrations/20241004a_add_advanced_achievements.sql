-- Migración: Agregar achievements para niveles avanzados
-- Ejecutar en Supabase SQL Editor

-- Agregar achievements para los nuevos niveles avanzados
INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Maestro de Sílabas Trabadas', 'Has dominado las sílabas trabadas bl, cl, fl, gl, pl', '🔤', 'literacy', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Maestro de Sílabas Trabadas');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Lector de Palabras Complejas', 'Puedes leer palabras de 3-4 sílabas con facilidad', '📚', 'literacy', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Lector de Palabras Complejas');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Comprendedor de Historias', 'Entiendes perfectamente las historias que lees', '📖', 'literacy', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Comprendedor de Historias');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Maestro del Vocabulario', 'Conoces muchos sinónimos y antónimos', '📝', 'literacy', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Maestro del Vocabulario');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Maestro de las Restas', 'Puedes restar números hasta 20 con facilidad', '➖', 'math', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Maestro de las Restas');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Contador hasta 20', 'Puedes contar y comparar números hasta 20', '🔢', 'math', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Contador hasta 20');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Resolvedor de Problemas', 'Resuelves problemas con suma y resta', '➕➖', 'math', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Resolvedor de Problemas');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Geómetra Avanzado', 'Conoces las figuras 3D: cubos, esferas y cilindros', '🔷', 'math', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Geómetra Avanzado');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Explorador de Estados', 'Entiendes los estados de la materia', '🧊', 'science', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Explorador de Estados');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Maestro de Fuerzas', 'Conoces las fuerzas de empujar y jalar', '⚡', 'science', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Maestro de Fuerzas');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Explorador de la Luz', 'Entiendes cómo funciona la luz y las sombras', '💡', 'science', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Explorador de la Luz');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Botánico Junior', 'Conoces las partes de las plantas', '🌱', 'science', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Botánico Junior');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Explorador de Hábitats', 'Conoces dónde viven diferentes animales', '🐾', 'science', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Explorador de Hábitats');

-- Agregar badges finales para los nuevos niveles
INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Maestro de Palabras Nivel 2', 'Has completado todos los retos de Palabras Mágicas', '🏆', 'literacy', 150, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Maestro de Palabras Nivel 2');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Explorador Matemático Nivel 3', 'Has explorado todo el Mundo Matemágico Nivel 3', '🏆', 'math', 150, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Explorador Matemático Nivel 3');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Científico Junior', 'Has completado tu primer laboratorio de ciencias', '🔬', 'science', 150, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Científico Junior');
