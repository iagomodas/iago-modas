import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const shell = readFileSync(resolve(process.cwd(), "client/src/components/StoreShell.tsx"), "utf8");
const profile = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerProfilePage.tsx"), "utf8");
const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/202608180004_customer_profile_photo.sql"), "utf8");

describe("acesso e conta do cliente", () => {
  it("mostra um acesso de conta no cabeçalho sem usar automaticamente a foto do Google", () => {
    expect(shell).toContain("<AccountAccess />");
    expect(shell).toContain('aria-label="Entrar ou abrir minha conta"');
    expect(shell).toContain('aria-label="Abrir minha conta"');
    expect(shell).toContain('href="/perfil"');
    expect(shell).not.toContain("user_metadata.avatar_url");
  });

  it("oferece edição de foto opcional, nome e endereço próprio do cliente", () => {
    expect(profile).toContain("Foto de perfil");
    expect(profile).toContain("A foto do Google não é usada automaticamente.");
    expect(profile).toContain("TROCAR FOTO");
    expect(profile).toContain("REMOVER");
    expect(profile).toContain('placeholder="Digite seu nome completo"');
    expect(profile).toContain("Dados de entrega");
  });

  it("aceita somente formatos de imagem permitidos e tamanho máximo de 3 MB", () => {
    expect(profile).toContain('accept="image/jpeg,image/png,image/webp"');
    expect(profile).toContain("file.size > 3 * 1024 * 1024");
    expect(profile).toContain('supabase.storage.from("customer-profile-photos").upload');
  });

  it("protege o armazenamento para que cada cliente administre somente a própria foto", () => {
    expect(migration).toContain("add column if not exists profile_photo_path text");
    expect(migration).toContain("customer profile photos: upload own");
    expect(migration).toContain("customer profile photos: update own");
    expect(migration).toContain("customer profile photos: delete own");
    expect(migration).toContain("update_own_profile_photo");
    expect(migration).toContain("auth.uid()::text");
  });
});
