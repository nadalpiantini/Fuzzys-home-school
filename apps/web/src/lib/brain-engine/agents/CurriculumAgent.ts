export function curriculumAdjust(params: any) {
  const subjects = params.subjects ?? ['matemáticas'];
  const grade = (params.gradeLevel?.[0] ?? 3);
  const los = params.learningObjectives ?? [];

  // Heurística simple por grado y materia
  const defaults: Record<string, string[]> = {
    matemáticas: grade <= 3 ? ['sumas', 'restas', 'números'] : 
                 grade <= 6 ? ['fracciones', 'multiplicación', 'división'] :
                 ['álgebra', 'geometría', 'estadística'],
    ciencias: grade <= 3 ? ['plantas', 'animales', 'cuerpo humano'] :
              grade <= 6 ? ['sistema solar', 'ecosistemas', 'materia'] :
              ['física', 'química', 'biología'],
    lenguaje: grade <= 3 ? ['letras', 'palabras', 'oraciones'] :
              grade <= 6 ? ['comprensión lectora', 'sinónimos', 'antónimos'] :
              ['literatura', 'gramática', 'redacción'],
    sociales: grade <= 3 ? ['familia', 'comunidad', 'país'] :
              grade <= 6 ? ['historia dominicana', 'geografía', 'cultura'] :
              ['historia universal', 'geografía mundial', 'economía']
  };
  
  const primary = subjects[0] as string;
  const merged = Array.from(new Set([...(defaults[primary] ?? []), ...los]));
  
  return { 
    ...params, 
    learningObjectives: merged,
    // Añadir contexto cultural dominicano si no está especificado
    culturalContext: params.culturalContext ?? 'dominican'
  };
}
