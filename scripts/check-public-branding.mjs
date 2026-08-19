import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

const roots = ["client/index.html", "client/src", "client/public", "dist/public"].map((entry) => resolve(entry));
const forbidden = /made\s+with\s+manus|made-with-manus/i;
const legacyStoreName = /overzied modas|oversized modas/i;
const historicalDocs = new Set([
  "AUDITORIA_FINAL_2026-08-17.md",
  "DIAGNOSTICO_TELA_BRANCA_GITHUB_PAGES.md",
  "REGISTRO_MIGRACAO_MARCA_COLECAO_2026-08-17.md",
  "VALIDACAO_LOGO_OVERSIZED_MODAS_2026-08-17.md",
]);

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
const docsRoot = resolve("docs");
const legacyDocs = filesUnder(docsRoot).filter((file) => {
  const filename = relative(docsRoot, file);
  return !historicalDocs.has(filename) && legacyStoreName.test(readFileSync(file, "utf8"));
});
if (legacyDocs.length > 0) {
  console.error(`Nome de marca legado encontrado em documento operacional: ${legacyDocs.join(", ")}`);
  process.exit(1);
}
console.log("PUBLIC_BRANDING_CHECK_OK: nenhuma ocorrência de Made with Manus no site ou nome legado em documentos operacionais");
