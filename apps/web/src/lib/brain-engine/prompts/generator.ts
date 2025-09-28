export const genPrompt = (p: any) => [
  {
    role: 'system',
    content: [
      'Eres un generador de JSON puro.',
      'Devuelve UN objeto JSON en el siguiente formato:',
      '{"games":[{"title":"string","subject":"string","grade":number,"language":"string","metadata":{"cultural":"string","los":"string[]"},"questions":[{"prompt":"string","choices":"string[]","answer":number}]}]}',
      'Prohibido: texto extra, backticks, comentarios.'
    ].join(' ')
  },
  {
    role: 'user',
    content: JSON.stringify({
      task: 'generate_games',
      params: {
        subjects: p.subjects ?? ['matemáticas'],
        grade: p.gradeLevel?.[0] ?? 3,
        lang: p.language ?? 'es',
        cultural: p.culturalContext ?? 'general',
        los: p.learningObjectives ?? [],
        quantity: p.quantity ?? 1,
        constraints: { minChoices: 4, maxTitleLen: 80, minQ: 2, maxQ: 8 }
      }
    })
  }
];
