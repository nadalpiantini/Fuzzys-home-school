import { describe, test, expect } from 'vitest';
import { buildSystemPrompt, buildWelcomeMessage } from './compose';
import { FUZZY_PROMPT_ES } from './prompt';

describe('Fuzzy Personality Tests', () => {
  test('Fuzzy mantiene gatillos de personalidad en español', () => {
    const prompt = buildSystemPrompt({ materia: 'matemáticas', idioma: 'es' });
    
    // Verificar expresiones clave de personalidad
    const personalityTriggers = [
      '¡Qué genial!',
      '¡Excelente!',
      '¡Vamos a por ello!',
      '¡Genial!',
      '¡Qué interesante!',
      '¡Vamos a aprender juntos!'
    ];
    
    for (const trigger of personalityTriggers) {
      expect(prompt).toContain(trigger);
    }
    
    // Verificar sección de personalidad
    expect(prompt).toContain('MI PERSONALIDAD');
    expect(prompt).toContain('súper entusiasta');
    expect(prompt).toContain('alegre');
    expect(prompt).toContain('energía positiva');
  });

  test('Fuzzy mantiene instrucciones de consistencia', () => {
    const prompt = buildSystemPrompt({ materia: 'ciencias', idioma: 'es' });
    
    expect(prompt).toContain('SIEMPRE mantén tu personalidad alegre y entusiasta');
    expect(prompt).toContain('Usa expresiones como');
  });

  test('Saludo de bienvenida mantiene personalidad', () => {
    const welcome = buildWelcomeMessage({ materia: 'matemáticas', idioma: 'es' });
    
    expect(welcome).toContain('¡Hola! Soy Fuzzy');
    expect(welcome).toContain('tu tutor personal');
    expect(welcome).toContain('¿En qué puedo ayudarte hoy?');
  });

  test('Prompt base contiene todas las características', () => {
    expect(FUZZY_PROMPT_ES).toContain('MI PERSONALIDAD');
    expect(FUZZY_PROMPT_ES).toContain('¡Qué genial!');
    expect(FUZZY_PROMPT_ES).toContain('¡Excelente!');
    expect(FUZZY_PROMPT_ES).toContain('¡Vamos a por ello!');
    expect(FUZZY_PROMPT_ES).toContain('SIEMPRE mantén tu personalidad');
  });

  test('Reemplazo de materia funciona correctamente', () => {
    const prompt = buildSystemPrompt({ materia: 'física', idioma: 'es' });
    expect(prompt).toContain('tu tutor personal de física');
  });

  test('Prompt en inglés mantiene personalidad', () => {
    const prompt = buildSystemPrompt({ materia: 'mathematics', idioma: 'en' });
    
    expect(prompt).toContain('Great!');
    expect(prompt).toContain('Excellent!');
    expect(prompt).toContain('Let\'s go for it!');
    expect(prompt).toContain('MY PERSONALITY');
    expect(prompt).toContain('super enthusiastic');
  });
});
