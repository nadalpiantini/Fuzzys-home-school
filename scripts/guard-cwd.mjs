import { cwd } from "node:process"; import { resolve } from "node:path";
const here = resolve(cwd()).replace(/\\/g,"/");
if (here.endsWith("/apps/web") || here.includes("/apps/web/")){
  console.error("❌ No ejecutes deploy desde apps/web. Ve al root.");
  process.exit(1);
}