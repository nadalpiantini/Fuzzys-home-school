import { createRequire } from 'module';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootPath = join(__dirname, '../../'); // sube de apps/web a root
const candidate = join(rootPath, 'scripts/verify-env.mjs');
if (existsSync(candidate)) {
  const req = createRequire(import.meta.url);
  await import('file://' + candidate);
} else {
  console.error('verify-env.mjs no encontrado en el root');
  process.exit(1);
}
