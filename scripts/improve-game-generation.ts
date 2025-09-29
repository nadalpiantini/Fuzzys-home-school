#!/usr/bin/env tsx

/**
 * Script para mejorar la generación de juegos educativos
 * Evita inconsistencias entre títulos y contenido
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GameValidation {
  title: string;
  subject: string;
  grade: string;
  content: any;
  isValid: boolean;
  issues: string[];
}

class GameValidator {
  private subjectKeywords: Record<string, string[]> = {
    'ciencias': ['genética', 'digestivo', 'respiratorio', 'circulatorio', 'nervioso', 'óseo', 'muscular'],
    'matemáticas': ['suma', 'resta', 'multiplicación', 'división', 'fracciones', 'decimales', 'geometría'],
    'historia': ['independencia', 'colonización', 'revolución', 'guerra', 'paz', 'cultura', 'tradición'],
    'español': ['gramática', 'vocabulario', 'lectura', 'escritura', 'sílabas', 'palabras', 'textos']
  };

  private gradeTopics: Record<string, Record<number, string[]>> = {
    'ciencias': {
      3: ['plantas y animales', 'el cuerpo humano', 'estaciones del año'],
      4: ['energía', 'células', 'clasificación de seres vivos'],
      5: ['reproducción', 'genética básica', 'evolución', 'sistema digestivo'],
      6: ['química básica', 'física', 'biología molecular'],
      7: ['reacciones químicas', 'ondas', 'genética'],
      8: ['átomos y moléculas', 'electricidad', 'ecología']
    },
    'matemáticas': {
      3: ['multiplicación', 'fracciones simples', 'perímetro y área'],
      4: ['división', 'decimales', 'geometría'],
      5: ['fracciones', 'porcentajes', 'álgebra básica'],
      6: ['números negativos', 'ecuaciones', 'estadística']
    },
    'historia': {
      4: ['República Dominicana', 'héroes nacionales', 'cultura taína'],
      5: ['América precolombina', 'conquista española', 'sociedad colonial'],
      6: ['independencia de América Latina', 'revoluciones', 'siglo XIX']
    },
    'español': {
      3: ['gramática básica', 'verbos', 'redacción simple'],
      4: ['sustantivos y adjetivos', 'pronombres', 'textos narrativos'],
      5: ['tiempos verbales', 'géneros literarios', 'redacción']
    }
  };

  validateGame(game: any): GameValidation {
    const issues: string[] = [];
    let isValid = true;

    // Validar título vs contenido
    if (this.hasTitleContentMismatch(game)) {
      issues.push('El título no coincide con el contenido del juego');
      isValid = false;
    }

    // Validar coherencia temática
    if (!this.isThematicallyCoherent(game)) {
      issues.push('El contenido no es coherente con la materia y grado');
      isValid = false;
    }

    // Validar nivel de dificultad apropiado
    if (!this.isDifficultyAppropriate(game)) {
      issues.push('La dificultad no es apropiada para el grado');
      isValid = false;
    }

    return {
      title: game.title,
      subject: game.subject,
      grade: game.grade,
      content: game.content,
      isValid,
      issues
    };
  }

  private hasTitleContentMismatch(game: any): boolean {
    const title = game.title.toLowerCase();
    const content = JSON.stringify(game.content).toLowerCase();
    
    // Verificar si el título menciona un tema pero el contenido habla de otro
    const subjectKeywords = this.subjectKeywords[game.subject] || [];
    
    for (const keyword of subjectKeywords) {
      if (title.includes(keyword) && !content.includes(keyword)) {
        return true;
      }
    }

    return false;
  }

  private isThematicallyCoherent(game: any): boolean {
    const grade = parseInt(game.grade);
    const subject = game.subject.toLowerCase();
    const content = JSON.stringify(game.content).toLowerCase();
    
    const expectedTopics = this.gradeTopics[subject]?.[grade] || [];
    
    // Verificar que al menos un tema esperado esté presente en el contenido
    return expectedTopics.some(topic => 
      content.includes(topic.toLowerCase()) || 
      game.title.toLowerCase().includes(topic.toLowerCase())
    );
  }

  private isDifficultyAppropriate(game: any): boolean {
    const grade = parseInt(game.grade);
    const difficulty = game.content?.difficulty || 'medium';
    
    // Mapear dificultad a rangos de grado
    const difficultyRanges = {
      'easy': [1, 4],
      'medium': [3, 8],
      'hard': [6, 12]
    };
    
    const [minGrade, maxGrade] = difficultyRanges[difficulty] || [1, 12];
    return grade >= minGrade && grade <= maxGrade;
  }
}

class GameOrganizer {
  private validator = new GameValidator();

  async organizeGames(): Promise<void> {
    console.log('🎮 Organizando juegos educativos...');

    // Obtener todos los juegos
    const { data: games, error } = await supabase
      .from('games_pool')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo juegos:', error);
      return;
    }

    console.log(`📊 Encontrados ${games?.length || 0} juegos`);

    // Validar cada juego
    const validations = games?.map(game => this.validator.validateGame(game)) || [];
    
    // Separar juegos válidos e inválidos
    const validGames = validations.filter(v => v.isValid);
    const invalidGames = validations.filter(v => !v.isValid);

    console.log(`✅ Juegos válidos: ${validGames.length}`);
    console.log(`❌ Juegos con problemas: ${invalidGames.length}`);

    // Mostrar problemas encontrados
    if (invalidGames.length > 0) {
      console.log('\n🔍 Problemas encontrados:');
      invalidGames.forEach(game => {
        console.log(`- ${game.title} (${game.subject}, grado ${game.grade}):`);
        game.issues.forEach(issue => console.log(`  • ${issue}`));
      });
    }

    // Organizar por materia y grado
    this.organizeBySubjectAndGrade(validGames);
  }

  private organizeBySubjectAndGrade(games: GameValidation[]): void {
    const organized = games.reduce((acc, game) => {
      const key = `${game.subject}-${game.grade}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(game);
      return acc;
    }, {} as Record<string, GameValidation[]>);

    console.log('\n📚 Juegos organizados por materia y grado:');
    Object.entries(organized).forEach(([key, games]) => {
      const [subject, grade] = key.split('-');
      console.log(`\n${subject.toUpperCase()} - Grado ${grade}:`);
      games.forEach(game => {
        console.log(`  • ${game.title}`);
      });
    });
  }

  async generateCorrectedGames(): Promise<void> {
    console.log('🔧 Generando juegos corregidos...');

    const correctedGames = [
      {
        title: 'Identifica: genética básica',
        subject: 'ciencias',
        grade: '5',
        content: {
          type: 'hotspot',
          title: 'Identifica: genética básica',
          description: 'Haz clic en las áreas correctas de la imagen para aprender sobre conceptos clave de genética',
          imageUrl: '/images/genetics-diagram.png',
          hotspots: [
            {
              id: 'dna',
              x: 30,
              y: 25,
              width: 20,
              height: 15,
              label: 'ADN',
              explanation: 'El ADN contiene toda la información genética de un organismo',
              correct: true
            },
            {
              id: 'gene',
              x: 50,
              y: 40,
              width: 15,
              height: 10,
              label: 'Gen',
              explanation: 'Un gen es una unidad de herencia que determina una característica',
              correct: true
            }
          ],
          metadata: {
            subject: 'ciencias',
            grade: 5,
            estimatedTime: '3-5 minutos',
            learningObjectives: [
              'Identificar conceptos básicos de genética',
              'Comprender la estructura del ADN',
              'Reconocer genes y cromosomas'
            ]
          },
          theme: 'genetica_basica',
          difficulty: 'medium'
        }
      },
      {
        title: 'Identifica: sistema digestivo',
        subject: 'ciencias',
        grade: '5',
        content: {
          type: 'hotspot',
          title: 'Identifica: sistema digestivo',
          description: 'Haz clic en las áreas correctas de la imagen para aprender sobre las partes del sistema digestivo',
          imageUrl: '/images/digestive-system.png',
          hotspots: [
            {
              id: 'mouth',
              x: 25,
              y: 30,
              width: 15,
              height: 12,
              label: 'Boca',
              explanation: 'La boca es donde comienza la digestión con la masticación',
              correct: true
            },
            {
              id: 'stomach',
              x: 55,
              y: 40,
              width: 20,
              height: 15,
              label: 'Estómago',
              explanation: 'El estómago mezcla la comida con ácidos para digerirla',
              correct: true
            }
          ],
          metadata: {
            subject: 'ciencias',
            grade: 5,
            estimatedTime: '3-5 minutos',
            learningObjectives: [
              'Identificar las partes del sistema digestivo',
              'Comprender la función de cada órgano',
              'Entender el proceso de digestión'
            ]
          },
          theme: 'sistema_digestivo',
          difficulty: 'medium'
        }
      }
    ];

    // Insertar juegos corregidos
    for (const game of correctedGames) {
      const { error } = await supabase
        .from('games_pool')
        .insert({
          title: game.title,
          subject: game.subject,
          grade: game.grade,
          content: game.content,
          status: 'ready',
          source: 'ai',
          ready_at: new Date().toISOString()
        });

      if (error) {
        console.error(`Error insertando ${game.title}:`, error);
      } else {
        console.log(`✅ Insertado: ${game.title}`);
      }
    }
  }
}

async function main() {
  const organizer = new GameOrganizer();
  
  try {
    await organizer.organizeGames();
    await organizer.generateCorrectedGames();
    console.log('\n🎉 Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  }
}

if (require.main === module) {
  main();
}

export { GameValidator, GameOrganizer };
