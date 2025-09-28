export function difficultyAdjust(params: any, metrics?: {plays?: number; likes?: number}) {
  const mode = params.difficulty ?? 'adaptive';
  if (mode !== 'adaptive') return params;

  // Si hay engagement alto → sube dificultad; si bajo → baja
  const score = (metrics?.likes ?? 0) - Math.max(0, (metrics?.plays ?? 0) - (metrics?.likes ?? 0));
  const delta = score > 10 ? +1 : score < -10 ? -1 : 0;

  const grade = (params.gradeLevel?.[0] ?? 3) + delta;
  const adjustedGrade = Math.max(1, Math.min(12, grade));
  
  return { 
    ...params, 
    gradeLevel: [adjustedGrade],
    // Ajustar cantidad basado en dificultad
    quantity: adjustedGrade > 6 ? Math.min(params.quantity ?? 3, 4) : (params.quantity ?? 3)
  };
}
