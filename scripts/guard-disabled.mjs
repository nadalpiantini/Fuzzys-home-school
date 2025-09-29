import fs from "fs";
import path from "path";

const apiDir = path.join(process.cwd(), "apps/web/src/app/api");

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "disabled") {
        console.error(`🚫 Carpeta prohibida: ${p}`);
        process.exit(1);
      }
      walk(p);
    }
  }
}

console.log("🧩 Verificando 'disabled'...");
walk(apiDir);
console.log("✅ Sin 'disabled'");