import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const workflowPath = resolve(root, ".github/workflows/supabase-weekly-check.yml");
const workflowSource = readFileSync(workflowPath, "utf8");

describe("verificação automática do catálogo Supabase", () => {
  it("executa diariamente e permite disparo manual", () => {
    expect(workflowSource).toContain('cron: "17 9 * * *"');
    expect(workflowSource).toContain("workflow_dispatch:");
  });

  it("consulta somente um campo público sem expor a chave privada", () => {
    expect(workflowSource).toContain("products?select=id&is_active=eq.true&limit=1");
    expect(workflowSource).toContain("VITE_SUPABASE_PUBLISHABLE_KEY");
    expect(workflowSource).not.toContain("service_role");
    expect(workflowSource).not.toContain("apikey: $SUPABASE_SERVICE_ROLE_KEY");
  });
});
