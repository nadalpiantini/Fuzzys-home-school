import { FUZZY_PROMPT_ES, FUZZY_PROMPT_EN } from "./prompt";

export interface TutorContext {
  materia: string;
  edad?: number;
  grado?: number;
  idioma?: 'es' | 'en';
  estiloAprendizaje?: string;
}

export function buildSystemPrompt(context: TutorContext): string {
  const { materia, idioma = 'es' } = context;
  
  const basePrompt = idioma === 'es' ? FUZZY_PROMPT_ES : FUZZY_PROMPT_EN;
  
  return basePrompt.replace("{{materia}}", materia || "clase");
}

export function buildWelcomeMessage(context: TutorContext): string {
  const { materia, idioma = 'es' } = context;
  
  if (idioma === 'es') {
    return `¡Hola! Soy Fuzzy, tu tutor personal de ${materia}. Estoy aquí para ayudarte a entender cualquier tema paso a paso. ¿En qué puedo ayudarte hoy?`;
  } else {
    return `Hello! I'm Fuzzy, your personal tutor for ${materia}. I'm here to help you understand any topic step by step. How can I help you today?`;
  }
}

export function buildErrorEncouragement(idioma: 'es' | 'en' = 'es'): string {
  if (idioma === 'es') {
    return `¡No te preocupes! Los errores son parte del aprendizaje. ¡Vamos a intentarlo de nuevo! ¿Qué te parece si probamos con un ejemplo más simple?`;
  } else {
    return `Don't worry! Mistakes are part of learning. Let's try again! What do you think if we try with a simpler example?`;
  }
}
