// scripts/print-api.mjs
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const src = "apps/web/src/app/api";
console.log("🧭 Local source API layout:", src);

if (!existsSync(src)) { 
  console.log("⚠️ No existe", src); 
  process.exit(0); 
}

execSync(`(command -v tree >/dev/null 2>&1 && tree -a -L 4 ${src}) || find ${src} -maxdepth 4 -print`, { stdio: "inherit" });
