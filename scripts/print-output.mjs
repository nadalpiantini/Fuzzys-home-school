// scripts/print-output.mjs
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const out = "apps/web/.next/server/app/api";
console.log("🧪 Next build output API layout:", out);

if (!existsSync(out)) { 
  console.log("⚠️ No existe", out); 
  process.exit(0); 
}

execSync(`(command -v tree >/dev/null 2>&1 && tree -a -L 4 ${out}) || find ${out} -maxdepth 4 -print`, { stdio: "inherit" });
