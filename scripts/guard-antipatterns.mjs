import { execSync } from "node:child_process";
const checks = [
  { cmd:`grep -r "process\\.env\\.NEXT_PUBLIC_SUPABASE_" apps/web/src/app/api || true`, msg:"NEXT_PUBLIC_* usado en API server" },
  { cmd:`grep -r "createClient.*supabase" apps/web/src | grep -v "lib/supabase/" | grep -v "trpc" || true`, msg:"createClient de Supabase en top-level fuera de factory" },
  { cmd:`grep -r "export const runtime = 'edge'" apps/web/src/app/api || true`, msg:"runtime='edge' en API con posibles roles" }
];
let fail=false;
for (const {cmd,msg} of checks){const out=execSync(cmd,{encoding:"utf8"});if(out.trim()){console.error("❌",msg,"\n",out);fail=true;}}
if(fail) process.exit(1);
console.log("✅ Anti-patrones limpio");