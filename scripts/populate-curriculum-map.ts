/**
 * Script para poblar curriculum_nodes y curriculum_links desde los JSON existentes
 *
 * Uso:
 *   npx tsx scripts/populate-curriculum-map.ts
 *
 * Este script:
 * 1. Lee todos los curriculums desde src/curriculum/*.json
 * 2. Crea nodos en curriculum_nodes por cada capítulo
 * 3. Crea links lineales (secuencia principal)
 * 4. Opcionalmente crea links alternativos/refuerzo
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface CurriculumChapter {
  id: string;
  title: string;
  goals: string[];
  activities: any[];
  badge: string;
  badgeDescription: string;
}

interface Curriculum {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  estimatedDuration: string;
  chapters: CurriculumChapter[];
  finalBadge: string;
  prerequisites: string[];
  nextLevel?: string | null;
}

/**
 * Lee todos los archivos de curriculum
 */
function loadCurriculums(): Curriculum[] {
  const curriculumDir = path.join(process.cwd(), 'apps/web/src/curriculum');
  const curriculums: Curriculum[] = [];

  const subjects = ['math', 'literacy', 'science', 'history', 'art'];

  for (const subject of subjects) {
    const subjectDir = path.join(curriculumDir, subject);
    if (!fs.existsSync(subjectDir)) continue;

    const files = fs.readdirSync(subjectDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(subjectDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const curriculum = JSON.parse(content) as Curriculum;
      curriculums.push(curriculum);
    }
  }

  return curriculums;
}

/**
 * Infiere dificultad desde el curriculum ID
 */
function inferDifficulty(curriculumId: string): 'easy' | 'medium' | 'hard' {
  if (curriculumId.includes('level1')) return 'easy';
  if (curriculumId.includes('level2')) return 'medium';
  return 'hard';
}

/**
 * Crea nodos para un curriculum
 */
async function createNodesForCurriculum(curriculum: Curriculum) {
  console.log(`\n📚 Procesando: ${curriculum.title} (${curriculum.id})`);

  const nodes = curriculum.chapters.map((chapter, index) => ({
    curriculum_id: curriculum.id,
    chapter_id: chapter.id,
    title: chapter.title,
    order_index: index,
    difficulty: inferDifficulty(curriculum.id),
  }));

  // Insert nodes
  const { data: insertedNodes, error } = await supabase
    .from('curriculum_nodes')
    .upsert(nodes, { onConflict: 'chapter_id' })
    .select('id, chapter_id');

  if (error) {
    console.error(`   ❌ Error insertando nodos:`, error.message);
    return [];
  }

  console.log(`   ✅ ${insertedNodes.length} nodos creados/actualizados`);
  return insertedNodes;
}

/**
 * Crea links lineales (secuencia principal)
 */
async function createLinearLinks(nodes: { id: string; chapter_id: string }[]) {
  if (nodes.length < 2) return;

  const links = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    links.push({
      from_node: nodes[i].id,
      to_node: nodes[i + 1].id,
      condition: 'completed', // El anterior debe estar completado
      type: 'linear',
    });
  }

  const { error } = await supabase
    .from('curriculum_links')
    .upsert(links, { onConflict: 'from_node,to_node', ignoreDuplicates: true });

  if (error) {
    console.error(`   ❌ Error creando links lineales:`, error.message);
  } else {
    console.log(`   🔗 ${links.length} links lineales creados`);
  }
}

/**
 * Crea links alternativos (ejemplo: cada 3 capítulos un camino alterno)
 */
async function createAlternativeLinks(
  nodes: { id: string; chapter_id: string }[],
  curriculum: Curriculum
) {
  if (nodes.length < 4) return;

  const alternativeLinks = [];

  // Ejemplo: del capítulo 1 al 3 (saltando el 2)
  if (nodes.length >= 3) {
    alternativeLinks.push({
      from_node: nodes[0].id,
      to_node: nodes[2].id,
      condition: 'score>=80', // Solo si sacó >80% en el primero
      type: 'alternative',
    });
  }

  // Ejemplo: del capítulo 3 al 5 (saltando el 4)
  if (nodes.length >= 5) {
    alternativeLinks.push({
      from_node: nodes[2].id,
      to_node: nodes[4].id,
      condition: 'score>=80',
      type: 'alternative',
    });
  }

  if (alternativeLinks.length === 0) return;

  const { error } = await supabase
    .from('curriculum_links')
    .upsert(alternativeLinks, { onConflict: 'from_node,to_node', ignoreDuplicates: true });

  if (error) {
    console.error(`   ❌ Error creando links alternativos:`, error.message);
  } else {
    console.log(`   🔀 ${alternativeLinks.length} links alternativos creados`);
  }
}

/**
 * Crea links de refuerzo (volver a un tema anterior si score <70)
 */
async function createReinforcementLinks(
  nodes: { id: string; chapter_id: string }[],
  curriculum: Curriculum
) {
  if (nodes.length < 3) return;

  const reinforcementLinks = [];

  // Ejemplo: si fallas en capítulo 2, refuerza con capítulo 1
  for (let i = 1; i < nodes.length && i < 4; i++) {
    reinforcementLinks.push({
      from_node: nodes[i].id,
      to_node: nodes[i - 1].id,
      condition: 'score<70', // Solo si sacó <70%
      type: 'reinforcement',
    });
  }

  if (reinforcementLinks.length === 0) return;

  const { error } = await supabase
    .from('curriculum_links')
    .upsert(reinforcementLinks, { onConflict: 'from_node,to_node', ignoreDuplicates: true });

  if (error) {
    console.error(`   ❌ Error creando links de refuerzo:`, error.message);
  } else {
    console.log(`   🎯 ${reinforcementLinks.length} links de refuerzo creados`);
  }
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Poblando curriculum_nodes y curriculum_links...\n');

  const curriculums = loadCurriculums();
  console.log(`📦 ${curriculums.length} curriculums encontrados\n`);

  for (const curriculum of curriculums) {
    const nodes = await createNodesForCurriculum(curriculum);
    if (nodes.length > 0) {
      await createLinearLinks(nodes);
      await createAlternativeLinks(nodes, curriculum);
      await createReinforcementLinks(nodes, curriculum);
    }
  }

  console.log('\n✅ Población completada!');
  console.log('\n💡 Siguiente paso:');
  console.log('   - Visita /learn/map/student para ver el mapa');
  console.log('   - Ajusta los links alternativos/refuerzo según tu lógica');
}

main().catch(console.error);
