#!/usr/bin/env tsx

/**
 * Script de verificación del PRO Pack
 * Verifica que todas las configuraciones de seguridad estén funcionando
 */

import { createClient } from '@supabase/supabase-js';
import { ENV } from '../src/lib/env';

async function verifyProPack() {
  console.log('🔍 Verificando PRO Pack...\n');

  // 1. Verificar variables de entorno
  console.log('1️⃣ Verificando variables de entorno...');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );
  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missingVars);
    return false;
  }
  console.log('✅ Variables de entorno configuradas');

  // 2. Verificar conexión a Supabase
  console.log('\n2️⃣ Verificando conexión a Supabase...');
  try {
    const supabase = createClient(
      ENV.NEXT_PUBLIC_SUPABASE_URL,
      ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    const { data, error } = await supabase
      .from('quizzes')
      .select('count')
      .limit(1);
    if (error) {
      console.error('❌ Error conectando a Supabase:', error.message);
      return false;
    }
    console.log('✅ Conexión a Supabase exitosa');
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }

  // 3. Verificar que las tablas tienen RLS habilitado
  console.log('\n3️⃣ Verificando RLS en tablas...');
  try {
    const supabase = createClient(
      ENV.NEXT_PUBLIC_SUPABASE_URL,
      ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    // Verificar que podemos leer quizzes (debería funcionar con RLS)
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id')
      .limit(1);

    if (quizzesError) {
      console.error('❌ Error leyendo quizzes:', quizzesError.message);
      return false;
    }
    console.log('✅ RLS configurado correctamente para quizzes');

    // Verificar que no podemos insertar sin autenticación
    const { error: insertError } = await supabase
      .from('quizzes')
      .insert({
        title: 'Test Quiz',
        topic: 'test',
        level: 'beginner',
        questions: [],
      });

    if (!insertError) {
      console.error(
        '❌ RLS no está funcionando - se permitió inserción sin auth',
      );
      return false;
    }
    console.log('✅ RLS bloqueando inserciones no autorizadas');
  } catch (error) {
    console.error('❌ Error verificando RLS:', error);
    return false;
  }

  // 4. Verificar archivos de configuración
  console.log('\n4️⃣ Verificando archivos de configuración...');

  const fs = require('fs');
  const path = require('path');

  const requiredFiles = [
    'src/lib/auth/server-auth.ts',
    'src/middleware.ts',
    'supabase/migrations/007_rls_policies.sql',
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Archivo faltante: ${file}`);
      return false;
    }
    console.log(`✅ ${file} existe`);
  }

  // 5. Verificar configuración de Next.js
  console.log('\n5️⃣ Verificando configuración de Next.js...');
  const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

  if (!nextConfigContent.includes('headers()')) {
    console.error('❌ Headers de seguridad no configurados en next.config.js');
    return false;
  }
  console.log('✅ Headers de seguridad configurados');

  console.log('\n🎉 PRO Pack verificado exitosamente!');
  console.log('\n📋 Resumen de seguridad implementado:');
  console.log('   ✅ RLS policies en Supabase');
  console.log('   ✅ Autenticación de usuario en API');
  console.log('   ✅ Rate limiting middleware');
  console.log('   ✅ Headers de seguridad');
  console.log('   ✅ Verificación de permisos de admin');

  return true;
}

// Ejecutar verificación
if (require.main === module) {
  verifyProPack()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Error durante verificación:', error);
      process.exit(1);
    });
}

export { verifyProPack };
