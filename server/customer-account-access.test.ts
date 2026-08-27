import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const shell = readFileSync(resolve(process.cwd(), "client/src/components/StoreShell.tsx"), "utf8");
const profile = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerProfilePage.tsx"), "utf8");
const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/202608180004_customer_profile_photo.sql"), "utf8");
const photoHardeningMigration = readFileSync(resolve(process.cwd(), "supabase/migrations/202608270002_harden_profile_photo.sql"), "utf8");

describe("acesso e conta do cliente", () => {
  it("mostra um acesso de conta no cabeçalho sem usar automaticamente a foto do Google", () => {
    expect(shell).toContain("<AccountAccess />");
    expect(shell).toContain('aria-label="Entrar ou abrir minha conta"');
    expect(shell).toContain('aria-label="Abrir minha conta"');
    expect(shell).toContain('href="/perfil"');
    expect(shell).not.toContain("user_metadata.avatar_url");
  });

  it("limpa o estado da conta e sai imediatamente do perfil quando o cliente toca em Sair", () => {
    expect(shell).toContain('setAccount({ signedIn: false, displayName: "", photoUrl: null, role: null });');
    expect(shell).toContain('navigate("/", { replace: true });');
    expect(shell).toContain('await supabase.auth.signOut();');
  });

  it("direciona a única conta administradora ao painel do dono, sem exibir o perfil de cliente", () => {
    expect(profile).toContain('import { Link, useLocation } from "wouter";');
    expect(profile).toContain('const [, navigate] = useLocation();');
    expect(profile).toContain("delivery_state, role");
    expect(profile).toContain('if (profile?.role === "admin")');
    expect(profile).toContain('navigate("/admin", { replace: true });');
  });

  it("oferece edição de foto opcional, nome e endereço próprio do cliente", () => {
    expect(profile).toContain("Foto de perfil");
    expect(profile).toContain("A foto do Google não é usada automaticamente.");
    expect(profile).toContain("TROCAR FOTO");
    expect(profile).toContain("REMOVER");
    expect(profile).toContain('placeholder="Digite seu nome completo"');
    expect(profile).toContain("Dados de entrega");
  });

  it("aceita fotos reais de celular para otimização local somente nos formatos permitidos", () => {
    expect(profile).toContain('accept="image/jpeg,image/png,image/webp"');
    expect(profile).toContain("PROFILE_PHOTO_MAX_INPUT_BYTES");
    expect(profile).toContain("file.size > PROFILE_PHOTO_MAX_INPUT_BYTES");
    expect(profile).toContain("A foto é maior que 8 MB");
    expect(profile).toContain("optimizeProfilePhoto(file)");
    expect(profile).toContain('storage.from("customer-profile-photos").upload');
  });

  it("preserva a foto anterior e explica falhas de envio sem ocultar o erro", () => {
    expect(profile).toContain("const previousPhotoUrl = photoUrl");
    expect(profile).toContain("setPhotoUrl(previousPhotoUrl)");
    expect(profile).toContain("profilePhotoUploadError(uploadError.message)");
  });

  it("mostra uma prévia imediatamente e recupera a imagem privada sem cache antigo", () => {
    expect(profile).toContain("URL.createObjectURL(optimized.file)");
    expect(profile).toContain("Otimizando sua foto para enviar com qualidade e ocupar menos espaço");
    expect(profile).toContain("createPrivateProfilePhotoUrl(client, nextPath)");
    expect(profile).toContain("Foto de perfil atualizada e otimizada");
  });

  it("protege o armazenamento para que cada cliente administre somente a própria foto", () => {
    expect(migration).toContain("add column if not exists profile_photo_path text");
    expect(migration).toContain("customer profile photos: upload own");
    expect(migration).toContain("customer profile photos: update own");
    expect(migration).toContain("customer profile photos: delete own");
    expect(migration).toContain("update_own_profile_photo");
    expect(migration).toContain("auth.uid()::text");
  });

  it("mantém a foto privada e versiona a correção da função de caminho", () => {
    expect(photoHardeningMigration).toMatch(/customer-profile-photos[\s\S]*false/);
    expect(photoHardeningMigration).toContain('create policy "customer profile photos: update own v2"');
    expect(photoHardeningMigration).toContain("returns void");
    expect(photoHardeningMigration).toContain("where id = auth.uid()");
    expect(photoHardeningMigration).toContain('grant execute on function public.update_own_profile_photo(text) to authenticated');
    expect(photoHardeningMigration).not.toContain("storage.vector_indexes");
  });
});
