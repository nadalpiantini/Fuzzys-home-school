import { execSync } from 'node:child_process';

const out = execSync(`find apps/web/src -path "*/api/disabled/*" -type f || true`, {encoding:'utf8'});
if (out.trim()) {
  console.error('❌ Rutas bajo app/api/disabled detectadas. Muévelas a app/api/<ruta>/route.ts\n', out);
  process.exit(1);
}
console.log('✅ Sin rutas disabled');
