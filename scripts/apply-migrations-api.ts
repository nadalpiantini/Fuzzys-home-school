#!/usr/bin/env tsx

/**
 * Script para aplicar migraciones SQL directamente a Supabase
 * usando la API REST con service role key
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
const envPath = join(process.cwd(), 'apps/web/.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Error: Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function applyMigration(filename: string) {
  const migrationPath = join(process.cwd(), 'supabase/migrations', filename);
  const sql = readFileSync(migrationPath, 'utf-8');

  console.log(`\n🔄 Aplicando: ${filename}`);

  try {
    // Ejecutar SQL usando la función RPC de Supabase
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`❌ Error en ${filename}:`, error.message);
      return false;
    }

    console.log(`✅ ${filename} aplicada exitosamente`);
    return true;
  } catch (err: any) {
    console.error(`❌ Error ejecutando ${filename}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Aplicando migraciones a Supabase...\n');

  const migrations = [
    '20241004e_points_system.sql',
    '20241004f_adaptive_engine.sql',
    '20241004g_adaptive_sessions.sql'
  ];

  let success = true;

  for (const migration of migrations) {
    const result = await applyMigration(migration);
    if (!result) {
      success = false;
      break;
    }
  }

  if (success) {
    console.log('\n✅ Todas las migraciones aplicadas exitosamente!');
    console.log('\n📋 Sistema completo:');
    console.log('  ✓ Sistema de puntos avanzado');
    console.log('  ✓ Motor adaptativo de dificultad');
    console.log('  ✓ Sesiones adaptativas en tiempo real');
  } else {
    console.log('\n❌ Algunas migraciones fallaron');
    process.exit(1);
  }
}

main().catch(console.error);
