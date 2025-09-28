#!/usr/bin/env node

/**
 * Script para ejecutar jobs de generación por demanda
 * Este script debe ejecutarse periódicamente (cada 5-10 minutos) para procesar
 * los jobs de generación que se crean cuando los usuarios completan juegos.
 */

const fetch = require('node-fetch');

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const DEMAND_JOBS_ENDPOINT = `${API_BASE_URL}/api/jobs/demand`;

async function runDemandGeneration() {
  console.log('🚀 Iniciando procesamiento de jobs de generación por demanda...');
  
  try {
    const response = await fetch(DEMAND_JOBS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Error en la respuesta:', data.error);
      process.exit(1);
    }

    console.log('✅ Procesamiento completado:');
    console.log(`   - Jobs procesados: ${data.processed_jobs?.length || 0}`);
    console.log(`   - Juegos generados: ${data.total_games_generated || 0}`);
    
    if (data.processed_jobs && data.processed_jobs.length > 0) {
      console.log('\n📊 Detalles de jobs procesados:');
      data.processed_jobs.forEach((job, index) => {
        console.log(`   ${index + 1}. Job ${job.job_id}:`);
        console.log(`      - Usuario: ${job.user_id}`);
        console.log(`      - Categoría: ${job.category}`);
        console.log(`      - Juegos generados: ${job.games_generated}`);
        if (job.error) {
          console.log(`      - Error: ${job.error}`);
        }
      });
    }

    if (data.games && data.games.length > 0) {
      console.log('\n🎮 Juegos generados:');
      data.games.forEach((game, index) => {
        console.log(`   ${index + 1}. ${game.title} (${game.subject} - ${game.grade})`);
      });
    }

    console.log('\n✨ Procesamiento de generación por demanda completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error ejecutando generación por demanda:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runDemandGeneration()
    .then(() => {
      console.log('🏁 Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { runDemandGeneration };
