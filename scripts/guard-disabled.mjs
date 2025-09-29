// scripts/guard-disabled.mjs
import fs from "fs";
import path from "path";

const root = process.cwd();
const apiDir = path.join(root, "apps/web/src/app/api");

function checkDisabled(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name === "disabled") {
        console.error(`🚫 ERROR: Carpeta prohibida detectada: ${fullPath}`);
        process.exit(1);
      }
      checkDisabled(fullPath);
    }
  }
}

console.log("🧩 Verificando que no existan carpetas 'disabled'...");
checkDisabled(apiDir);
console.log("✅ Limpio: No existen carpetas 'disabled'.");