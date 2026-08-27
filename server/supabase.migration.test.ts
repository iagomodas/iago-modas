import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202608150001_overzied_modas.sql"),
  "utf8",
);
const deliveryProfileMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202608180001_customer_delivery_profile.sql"),
  "utf8",
);
const profilePhotoHardeningMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202608190001_security_hardening_private_profile_photos.sql"),
  "utf8",
);
const checkoutHardeningMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202608190002_security_hardening_checkout_authorization.sql"),
  "utf8",
);
const futureCommerceMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202608190003_future_commerce_readiness.sql"),
  "utf8",
);
const futurePaymentTransitionMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202608190004_future_payment_transition_states.sql"),
  "utf8",
);
const profilePhotoHelper = readFileSync(
  resolve(process.cwd(), "client/src/lib/profilePhoto.ts"),
  "utf8",
);
const checkoutStockHardeningMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202608270001_security_hardening_checkout_stock.sql"),
  "utf8",
);
const publicStorageMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202608270003_version_public_storage_buckets.sql"),
  "utf8",
);
const postMigrationCleanupMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202608270005_post_migration_security_cleanup.sql"),
  "utf8",
);

describe("migração Supabase da Overzied Modas", () => {
  it("habilita RLS em todos os dados públicos da loja", () => {
    for (const table of ["profiles", "products", "storefront_settings", "orders", "order_items"]) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
    }
  });

  it("restringe alterações de catálogo e leitura de pedidos ao papel administrativo", () => {
    expect(migration).toMatch(/products: admin may insert[\s\S]*?with check \(\(select public\.is_admin\(\)\)\);/);
    expect(migration).toMatch(/products: admin may update[\s\S]*?using \(\(select public\.is_admin\(\)\)\)[\s\S]*?with check \(\(select public\.is_admin\(\)\)\);/);
    expect(migration).toMatch(/orders: admin may read and update[\s\S]*?using \(\(select public\.is_admin\(\)\)\)[\s\S]*?with check \(\(select public\.is_admin\(\)\)\);/);
    expect(migration).toMatch(/order items: admin may read[\s\S]*?using \(\(select public\.is_admin\(\)\)\);/);
    expect(migration).toMatch(/storefront settings: admin may update[\s\S]*?using \(\(select public\.is_admin\(\)\)\)[\s\S]*?with check \(\(select public\.is_admin\(\)\)\);/);
  });

  it("não concede ou referencia uma chave privada de serviço", () => {
    expect(migration).not.toMatch(/service_role|SUPABASE_SERVICE_ROLE|private key/i);
  });

  it("inclui os campos editáveis dos blocos restantes da página inicial", () => {
    [
      "highlights_title text not null",
      "categories_title text not null",
      "benefit_one_title text not null",
      "benefit_four_caption text not null",
    ].forEach((column) => expect(migration).toContain(column));
  });

  it("permite salvar apenas os dados de entrega do próprio cliente por função restrita", () => {
    ["delivery_phone", "delivery_postal_code", "delivery_street", "delivery_number", "delivery_district", "delivery_city", "delivery_state"].forEach((column) => expect(deliveryProfileMigration).toContain(`add column if not exists ${column} text`));
    expect(deliveryProfileMigration).toContain("create or replace function public.update_own_customer_profile");
    expect(deliveryProfileMigration).toContain("where id = auth.uid()");
    expect(deliveryProfileMigration).toContain("grant execute on function public.update_own_customer_profile");
    expect(deliveryProfileMigration).not.toMatch(/create policy[\s\S]*profiles[\s\S]*for update/i);
  });

  it("mantém fotos de perfil privadas e acessíveis somente ao dono ou administrador", () => {
    expect(profilePhotoHardeningMigration).toContain("set public = false");
    expect(profilePhotoHardeningMigration).toContain('create policy "customer profile photos: read own or admin"');
    expect(profilePhotoHardeningMigration).toContain("(select public.is_admin())");
    expect(profilePhotoHardeningMigration).toContain("revoke all on function public.update_own_profile_photo(text) from public");
    expect(profilePhotoHelper).toContain("createSignedUrl(profilePhotoPath, SIGNED_URL_TTL_SECONDS)");
    expect(profilePhotoHelper).not.toContain("getPublicUrl");
  });

  it("bloqueia pedidos anônimos, e-mails adulterados e formas de pagamento ainda não habilitadas", () => {
    expect(checkoutHardeningMigration).toContain("if auth.uid() is null then");
    expect(checkoutHardeningMigration).toContain("lower(trim(p_customer_email)) <> signed_in_email");
    expect(checkoutHardeningMigration).toContain("p_payment_method::text not in ('pix', 'cash')");
    expect(checkoutHardeningMigration).toContain("revoke all on function public.create_checkout_order");
    expect(checkoutHardeningMigration).toContain("to authenticated");
    expect(checkoutHardeningMigration).not.toMatch(/grant execute[\s\S]*create_checkout_order[\s\S]*to anon/i);
  });

  it("endurece checkout contra replay, payload abusivo e corrida de estoque", () => {
    expect(checkoutStockHardeningMigration).toContain("jsonb_array_length(p_items) > 30");
    expect(checkoutStockHardeningMigration).toContain("char_length(p_items::text) > 20000");
    expect(checkoutStockHardeningMigration).toContain("consume_checkout_submission_slot");
    expect(checkoutStockHardeningMigration).toContain("for update");
    expect(checkoutStockHardeningMigration).toContain("stock = stock - requested.quantity");
    expect(checkoutStockHardeningMigration).toContain("release_reserved_stock_on_order_terminal_status");
    expect(checkoutStockHardeningMigration).toContain("revoke all on function public.create_checkout_order");
    expect(checkoutStockHardeningMigration).toMatch(/grant execute on function public\.create_manual_delivery_order_once[\s\S]*to authenticated/);
  });

  it("versiona os buckets públicos e exige admin para suas mutações", () => {
    expect(publicStorageMigration).toContain("product-gallery");
    expect(publicStorageMigration).toContain("storefront-branding");
    expect(publicStorageMigration).toContain("select public.is_admin()");
    expect(publicStorageMigration).toContain("product gallery: public read");
  });

  it("fecha advisories sem quebrar uma instalação limpa", () => {
    expect(postMigrationCleanupMigration).toContain("to_regclass('public.future_integration_credentials')");
    expect(postMigrationCleanupMigration).toContain("revoke all on function public.handle_new_user() from public, anon, authenticated");
    expect(postMigrationCleanupMigration).toContain("revoke all on function public.rls_auto_enable() from public, anon, authenticated");
    expect(postMigrationCleanupMigration).toContain("create policy \"profiles: user or admin may read\"");
    expect(postMigrationCleanupMigration).toContain("create policy \"orders: customer or admin may read\"");
    expect(postMigrationCleanupMigration).toContain("create policy \"order items: customer or admin may read\"");
    expect(postMigrationCleanupMigration).toContain("alter function public.assign_iago_owner_admin() set search_path = pg_catalog, public");
    expect(postMigrationCleanupMigration).toContain("order_items_product_id_idx");
  });

  it("mantém a preparação de pagamento e frete futuros desativada por padrão", () => {
    expect(futureCommerceMigration).toContain("future_payments_enabled boolean not null default false");
    expect(futureCommerceMigration).toContain("future_shipping_quotes_enabled boolean not null default false");
    expect(futureCommerceMigration).toContain("shipping_origin_postal_code = '' or shipping_origin_postal_code ~ '^[0-9]{8}$'");
    ["shipping_weight_grams", "shipping_length_cm", "shipping_width_cm", "shipping_height_cm"].forEach((column) => expect(futureCommerceMigration).toContain(column));
    expect(futureCommerceMigration).toContain("payment_webhook_status text not null default 'not_configured'");
  });

  it("define estados explícitos para a futura confirmação de pagamento", () => {
    expect(futurePaymentTransitionMigration).toContain("payment_transition_state text not null default 'manual_pending'");
    ["manual_pending", "webhook_pending", "paid", "rejected"].forEach((state) => expect(futurePaymentTransitionMigration).toContain(`'${state}'`));
    expect(futurePaymentTransitionMigration).toContain("nenhuma cobrança ou webhook é ativado aqui");
  });
});
