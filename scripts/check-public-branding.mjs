import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const roots = ["client/index.html", "client/src", "client/public", "dist/public"].map((entry) => resolve(entry));
const forbidden = /made\s+with\s+manus|made-with-manus/i;

function filesUnder(root) {
  if (!existsSync(root)) return [];
  if (statSync(root).isFile()) return [root];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => filesUnder(resolve(root, entry.name)));
}

const matches = roots.flatMap(filesUnder).filter((file) => forbidden.test(readFileSync(file, "utf8")));
if (matches.length > 0) {
  console.error(`Marca proibida encontrada em: ${matches.join(", ")}`);
  process.exit(1);
}
console.log("PUBLIC_BRANDING_CHECK_OK: nenhuma ocorrência de Made with Manus em client/ ou dist/public");
