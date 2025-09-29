import { execSync } from 'node:child_process';

const checks = [
  { cmd: `rg -n "process\\.env\\.NEXT_PUBLIC_SUPABASE_" apps/web/src/app/api || true`, msg: 'NEXT_PUBLIC_* usado en API server' },
  { cmd: `rg -n "create(Server)?Client\\(" apps/web/src | rg -v "lib/supabase/(server|ssr)\\.ts" || true`, msg: 'createClient en top-level fuera de factory' },
  { cmd: `rg -n "export const runtime = 'edge'" apps/web/src/app/api || true`, msg: "runtime='edge' en API que podría usar service role" },
];

let failed = false;
for (const { cmd, msg } of checks) {
  const out = execSync(cmd, { encoding: 'utf8' });
  if (out.trim()) {
    console.error('❌', msg, '\n', out);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('✅ Anti-patrones: limpio');
