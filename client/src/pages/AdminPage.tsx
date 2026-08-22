import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout, {
  type DashboardMenuItem,
} from "@/components/DashboardLayout";
import { AdminStoreSettings, FutureCommerceSettings } from "@/components/AdminStoreSettings";
import { AdminSalesOverview } from "@/components/AdminSalesOverview";
import { SHIPPING_LABEL_ORDER_EVENT, ShippingLabelGenerator } from "@/components/ShippingLabelGenerator";
import { ProductMediaPicker } from "@/components/ProductMediaPicker";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { startLogin } from "@/const";
import {
  useSupabaseOrders,
  useSupabaseProducts,
} from "@/hooks/useSupabaseAdmin";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";
import { categories, type Category, toMoney } from "@/lib/catalog";
import { storefrontDefaults, storefrontUpdateForSection, type StorefrontSaveSection, type StorefrontSettings } from "@/lib/storefront";
import { hasSupabaseConfiguration, supabase } from "@/lib/supabase";
import type { SupabaseOrder, SupabaseProduct } from "@/lib/supabaseTypes";
import { canPermanentlyDeleteOrder } from "@/lib/orderAdmin";
import {
  Boxes,
  Brush,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  Loader2,
  Megaphone,
  PackagePlus,
  Pencil,
  ReceiptText,
  Save,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "wouter";

type ProductForm = {
  name: string;
  slug: string;
  category: Category;
  brand: string;
  collection: string;
  description: string;
  price: string;
  compareAtPrice: string;
  sizes: string;
  imageUrl: string;
  imageUrls: string;
  badge: string;
  accentColor: string;
  stock: string;
  shippingWeightGrams: string;
  shippingLengthCm: string;
  shippingWidthCm: string;
  shippingHeightCm: string;
  isActive: boolean;
};
type StorefrontField = keyof StorefrontSettings;

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  category: "Camisetas",
  brand: "IAGO MODAS",
  collection: "",
  description: "",
  price: "",
  compareAtPrice: "",
  sizes: "P, M, G, GG",
  imageUrl: "",
  imageUrls: "",
  badge: "",
  accentColor: "#82ffc5",
  stock: "0",
  shippingWeightGrams: "0",
  shippingLengthCm: "0",
  shippingWidthCm: "0",
  shippingHeightCm: "0",
  isActive: true,
};
const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const asCents = (value: string) =>
  Math.round(Number(value.replace(".", "").replace(",", ".")) * 100);

const adminMenu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Visão geral", target: "overview" },
  { icon: Megaphone, label: "Atendimento", target: "support" },
  { icon: CreditCard, label: "Pix e entrega", target: "payments-delivery" },
  { icon: Brush, label: "Vitrine", target: "storefront" },
  { icon: Boxes, label: "Produtos", target: "products" },
  { icon: ReceiptText, label: "Pedidos", target: "orders" },
  { icon: FileText, label: "Etiquetas", target: "labels" },
  { icon: ShieldAlert, label: "Preparação futura", target: "future" },
];

const orderLabels: Record<SupabaseOrder["payment_status"], string> = {
  pending: "Aguardando confirmação",
  approved: "Confirmado",
  rejected: "Não aprovado",
  cancelled: "Cancelado",
};
const operationalStatuses = [
  "awaiting_freight",
  "freight_informed",
  "awaiting_pix",
  "paid",
  "ready_to_post",
  "shipped",
  "cancelled",
] as const;
type OperationalStatus = (typeof operationalStatuses)[number];
const operationalLabels: Record<OperationalStatus, string> = {
  awaiting_freight: "Frete a combinar pelo atendimento",
  freight_informed: "Frete informado",
  awaiting_pix: "Aguardando Pix",
  paid: "Pix confirmado",
  ready_to_post: "Pronto para postar",
  shipped: "Postado",
  cancelled: "Cancelado",
};

const isCancelledOrder = (order: SupabaseOrder) =>
  order.payment_status === "cancelled" || order.order_status === "cancelled";

function toForm(product: SupabaseProduct): ProductForm {
  return {
    name: product.name,
    slug: product.slug,
    category: product.category as Category,
    brand: product.brand ?? "IAGO MODAS",
    collection: product.collection ?? "",
    description: product.description,
    price: (product.price_cents / 100).toFixed(2).replace(".", ","),
    compareAtPrice: product.compare_at_price_cents
      ? (product.compare_at_price_cents / 100).toFixed(2).replace(".", ",")
      : "",
    sizes: Array.isArray(product.sizes)
      ? product.sizes.join(", ")
      : String(product.sizes ?? ""),
    imageUrl: product.image_url,
    imageUrls: Array.isArray(product.image_urls)
      ? product.image_urls.join("\n")
      : "",
    badge: product.badge ?? "",
    accentColor: product.accent_color,
    stock: String(product.stock),
    shippingWeightGrams: String(product.shipping_weight_grams ?? 0),
    shippingLengthCm: String(product.shipping_length_cm ?? 0),
    shippingWidthCm: String(product.shipping_width_cm ?? 0),
    shippingHeightCm: String(product.shipping_height_cm ?? 0),
    isActive: product.is_active,
  };
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#080909]" />;
  if (!hasSupabaseConfiguration) return <ConfigurationNotice />;
  if (!user) return <LoginNotice />;
  if (user.role !== "admin") return <AccessDenied />;
  return (
    <DashboardLayout brandLabel="IAGO MODAS" menuItems={adminMenu}>
      <AdminConsole />
    </DashboardLayout>
  );
}

function ConfigurationNotice() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080909] px-5 text-center text-white">
      <section className="max-w-lg rounded-3xl border border-white/10 bg-white/[.04] p-8">
        <Boxes className="mx-auto text-[#82ffc5]" size={38} />
        <p className="mt-5 text-xs font-bold tracking-[.2em] text-[#82ffc5]">
          PAINEL EM CONFIGURAÇÃO
        </p>
        <h1 className="mt-2 font-display text-3xl">
          Conecte o Supabase para administrar a loja
        </h1>
        <p className="mt-4 text-sm leading-6 text-white/60">
          Adicione a URL do projeto e a publishable key nas configurações
          seguras. Nunca use a chave service_role no navegador.
        </p>
        <Link href="/">
          <Button className="mt-7 bg-white text-black hover:bg-[#82ffc5]">
            VOLTAR PARA A LOJA
          </Button>
        </Link>
      </section>
    </main>
  );
}

function LoginNotice() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080909] px-5 text-center text-white">
      <section className="max-w-md rounded-3xl border border-white/10 bg-white/[.04] p-8">
        <ShieldAlert className="mx-auto text-[#82ffc5]" size={38} />
        <h1 className="mt-5 font-display text-3xl">Área administrativa</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Entre com a conta Google autorizada como administradora no Supabase.
        </p>
        <Button
          onClick={() => void startLogin()}
          className="mt-7 bg-[#82ffc5] text-black hover:bg-white"
        >
          ENTRAR COM GOOGLE
        </Button>
      </section>
    </main>
  );
}

function AccessDenied() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080909] px-5 text-center text-white">
      <section className="max-w-md rounded-3xl border border-red-300/20 bg-red-300/[.04] p-8">
        <ShieldAlert className="mx-auto text-red-300" size={38} />
        <h1 className="mt-5 font-display text-3xl">Acesso restrito</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Esta conta não possui a permissão de administrador da IAGO MODAS.
        </p>
        <Link href="/">
          <Button
            variant="outline"
            className="mt-7 border-white/20 text-white hover:bg-white/10"
          >
            VOLTAR PARA A LOJA
          </Button>
        </Link>
      </section>
    </main>
  );
}

function AdminConsole() {
  const catalog = useSupabaseProducts(true);
  const operations = useSupabaseOrders();
  const storefront = useStorefrontSettings();
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingStorefront, setSavingStorefront] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [storefrontDraft, setStorefrontDraft] =
    useState<StorefrontSettings>(storefrontDefaults);
  const stockCount = useMemo(
    () => catalog.products.reduce((total, product) => total + product.stock, 0),
    [catalog.products]
  );
  const knownBrands = useMemo(
    () =>
      Array.from(
        new Set(
          catalog.products
            .map(product => product.brand?.trim())
            .filter((brand): brand is string => Boolean(brand))
        )
      ).sort((left, right) => left.localeCompare(right, "pt-BR")),
    [catalog.products]
  );
  const activeOrders = useMemo(
    () => operations.orders.filter(order => !isCancelledOrder(order)),
    [operations.orders]
  );
  const cancelledOrders = useMemo(
    () => operations.orders.filter(isCancelledOrder),
    [operations.orders]
  );

  useEffect(() => {
      setStorefrontDraft({
        ...storefront.settings,
        future_payment_provider:
          storefront.settings.future_payment_provider === "manual"
            ? "mercado_pago"
            : storefront.settings.future_payment_provider,
        future_shipping_provider:
          storefront.settings.future_shipping_provider === "manual" || storefront.settings.future_shipping_provider === "melhor_envio"
            ? "correios"
            : storefront.settings.future_shipping_provider,
      });
  }, [storefront.settings]);
  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm(current => ({ ...current, [key]: value }));
  const setStorefrontField = (key: StorefrontField, value: string | boolean) =>
    setStorefrontDraft(
      current => ({ ...current, [key]: value }) as StorefrontSettings
    );
  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    if (!form.imageUrl.trim()) {
      setFeedback("Escolha pelo menos uma foto da galeria antes de cadastrar o produto.");
      return;
    }
    setSavingProduct(true);
    setFeedback(null);
    const product = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      category: form.category,
      brand: form.brand.trim() || "IAGO MODAS",
      collection: form.collection.trim() || null,
      description: form.description.trim(),
      price_cents: asCents(form.price),
      compare_at_price_cents: form.compareAtPrice
        ? asCents(form.compareAtPrice)
        : null,
      sizes: form.sizes
        .split(",")
        .map(size => size.trim())
        .filter(Boolean),
      image_url: form.imageUrl.trim(),
      image_urls: form.imageUrls
        .split("\n")
        .map(url => url.trim())
        .filter(Boolean),
      badge: form.badge.trim() || null,
      accent_color: form.accentColor.trim() || "#82ffc5",
      stock: Math.max(0, Number.parseInt(form.stock, 10) || 0),
      shipping_weight_grams: Math.min(
        50000,
        Math.max(0, Number.parseInt(form.shippingWeightGrams, 10) || 0)
      ),
      shipping_length_cm: Math.min(
        300,
        Math.max(0, Number(form.shippingLengthCm) || 0)
      ),
      shipping_width_cm: Math.min(
        300,
        Math.max(0, Number(form.shippingWidthCm) || 0)
      ),
      shipping_height_cm: Math.min(
        300,
        Math.max(0, Number(form.shippingHeightCm) || 0)
      ),
      is_active: form.isActive,
    };
    const { error } = editingId
      ? await supabase.from("products").update(product).eq("id", editingId)
      : await supabase.from("products").insert(product);
    if (error) setFeedback(error.message);
    else {
      setFeedback(
        editingId
          ? "Produto atualizado e visível na loja."
          : "Produto cadastrado e pronto para aparecer na loja."
      );
      reset();
      await catalog.refresh();
    }
    setSavingProduct(false);
  };

  const saveStorefront = async (section: StorefrontSaveSection) => {
    if (!supabase) return false;
    setSavingStorefront(true);
    setFeedback(null);
    const update = storefrontUpdateForSection(storefrontDraft, section);
    const { data, error } = await supabase
      .from("storefront_settings")
      .update(update)
      .eq("id", true)
      .select("id")
      .maybeSingle();
    if (error) {
      setFeedback(error.message);
      setSavingStorefront(false);
      return false;
    }
    if (!data) {
      setFeedback(
        "As configurações não foram gravadas. Confirme se você entrou com a conta administradora e tente novamente."
      );
      setSavingStorefront(false);
      return false;
    }
    setFeedback(
      "Alteração salva. A loja pública já receberá esta atualização."
    );
    await storefront.refresh();
    setSavingStorefront(false);
    return true;
  };

  const remove = async (product: SupabaseProduct) => {
    if (!supabase || !window.confirm(`Remover ${product.name}?`)) return;
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);
    setFeedback(error ? error.message : "Produto removido da loja.");
    await catalog.refresh();
  };

  const updateOrder = async (
    id: number,
    status: SupabaseOrder["payment_status"]
  ) => {
    if (!supabase) return;
    const update = status === "cancelled"
      ? { payment_status: status, order_status: "cancelled" }
      : { payment_status: status };
    const { error } = await supabase
      .from("orders")
      .update(update)
      .eq("id", id);
    setFeedback(error ? error.message : "Status do pedido atualizado.");
    await operations.refresh();
  };
  const updateOperationalStatus = async (
    id: number,
    status: OperationalStatus
  ) => {
    if (!supabase) return;
    const update = status === "cancelled"
      ? { order_status: status, payment_status: "cancelled" }
      : { order_status: status };
    const { error } = await supabase
      .from("orders")
      .update(update)
      .eq("id", id);
    setFeedback(
      error ? error.message : "Etapa operacional do pedido atualizada."
    );
    await operations.refresh();
  };
  const deleteCancelledOrder = async (order: SupabaseOrder) => {
    if (!supabase) return;
    if (!canPermanentlyDeleteOrder(order)) {
      setFeedback("Somente pedidos já cancelados podem ser apagados do histórico.");
      return;
    }

    setDeletingOrderId(order.id);
    setFeedback(null);
    const { error, count } = await supabase
      .from("orders")
      .delete({ count: "exact" })
      .eq("id", order.id)
      .or("payment_status.eq.cancelled,order_status.eq.cancelled");

    if (error) {
      setFeedback(error.message);
    } else if (count !== 1) {
      setFeedback(
        "O pedido não foi apagado porque não está mais cancelado ou sua conta não tem essa permissão.",
      );
    } else {
      setFeedback(`Pedido ${order.order_number} apagado definitivamente do histórico.`);
    }
    setDeletingOrderId(null);
    await operations.refresh();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10 text-white">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs font-bold tracking-[.2em] text-[#82ffc5]">
            IAGO MODAS
          </p>
          <h1 className="mt-2 font-display text-4xl">Controle da loja</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/55">
            Edite produtos, preços, estoque, pedidos, vitrine e etiquetas de
            postagem manual.
          </p>
        </div>
        <Link href="/">
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            VER LOJA
          </Button>
        </Link>
      </header>
      <AdminSalesOverview
        orders={operations.orders}
        loading={operations.loading}
      />
      {feedback && (
        <p className="rounded-xl border border-[#82ffc5]/20 bg-[#82ffc5]/[.06] px-4 py-3 text-sm text-white/80">
          {feedback}
        </p>
      )}
      <section id="overview" className="scroll-mt-24 space-y-4">
        <SectionHeading
          eyebrow="VISÃO GERAL"
          title="Resumo da operação"
          icon={<LayoutDashboard size={18} />}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Stat
            icon={<Boxes size={18} />}
            label="PRODUTOS"
            value={catalog.loading ? "—" : String(catalog.products.length)}
          />
          <Stat
            icon={<ClipboardList size={18} />}
            label="PEDIDOS AGUARDANDO"
            value={
              operations.loading
                ? "—"
                : String(
                    activeOrders.filter(
                      order => order.payment_status === "pending"
                    ).length
                  )
            }
          />
          <Stat
            icon={<PackagePlus size={18} />}
            label="PEÇAS EM ESTOQUE"
            value={catalog.loading ? "—" : String(stockCount)}
          />
        </div>
      </section>
      <AdminStoreSettings
        draft={storefrontDraft}
        onFieldChange={setStorefrontField}
        onSave={saveStorefront}
        saving={savingStorefront}
        error={storefront.error}
      />
      <section
        id="products"
        className="scroll-mt-24 grid gap-8 xl:grid-cols-[410px_1fr]"
      >
        <form
          onSubmit={submit}
          className="rounded-3xl border border-white/10 bg-white/[.035] p-6"
        >
          <SectionHeading
            eyebrow="CATÁLOGO"
            title={editingId ? "Editar produto" : "Novo produto"}
            icon={<PackagePlus size={18} />}
          />
          {editingId && (
            <Button
              type="button"
              onClick={reset}
              variant="ghost"
              className="mt-2 text-white hover:bg-white/10"
            >
              CANCELAR EDIÇÃO
            </Button>
          )}
          <div className="mt-6 grid gap-4">
            <Field label="Nome">
              <input
                required
                value={form.name}
                onChange={event => set("name", event.target.value)}
                className="admin-input"
              />
            </Field>
            <Field label="Categoria">
              <select
                value={form.category}
                onChange={event =>
                  set("category", event.target.value as Category)
                }
                className="admin-input"
              >
                {categories.map(category => (
                  <option className="bg-zinc-950" key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Marca da peça">
                <input
                  value={form.brand}
                  onChange={event => set("brand", event.target.value)}
                  className="admin-input"
                  placeholder="Digite ou escolha uma marca"
                  list="iago-known-brands"
                />
                <datalist id="iago-known-brands">
                  {knownBrands.map(brand => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
                <p className="mt-1 text-[11px] leading-4 text-white/45">
                  Escreva uma nova marca ou escolha uma já cadastrada. Ela aparecerá como filtro para os clientes.
                </p>
              </Field>
              <Field label="Modelo específico (opcional)">
                <input
                  value={form.collection}
                  onChange={event => set("collection", event.target.value)}
                  className="admin-input"
                  placeholder="Ex.: Oversized, Polo ou Estampada"
                />
                <p className="mt-1 text-[11px] leading-4 text-white/45">
                  O cliente poderá escolher este modelo ao entrar na categoria da peça.
                </p>
              </Field>
            </div>
            <Field label="Descrição">
              <textarea
                required
                value={form.description}
                onChange={event => set("description", event.target.value)}
                className="admin-input min-h-24 py-2"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço">
                <input
                  required
                  value={form.price}
                  onChange={event => set("price", event.target.value)}
                  inputMode="decimal"
                  className="admin-input"
                  placeholder="89,90"
                />
              </Field>
              <Field label="Preço anterior (opcional)">
                <input
                  value={form.compareAtPrice}
                  onChange={event => set("compareAtPrice", event.target.value)}
                  inputMode="decimal"
                  className="admin-input"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tamanhos">
                <input
                  required
                  value={form.sizes}
                  onChange={event => set("sizes", event.target.value)}
                  className="admin-input"
                />
              </Field>
              <Field label="Estoque">
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={event => set("stock", event.target.value)}
                  className="admin-input"
                />
              </Field>
            </div>
            <ProductMediaPicker
              mainImage={form.imageUrl}
              additionalImages={form.imageUrls}
              disabled={savingProduct}
              onChange={(mainImage, additionalImages) =>
                setForm(current => ({
                  ...current,
                  imageUrl: mainImage,
                  imageUrls: additionalImages,
                }))
              }
            />
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={event => set("isActive", event.target.checked)}
              />{" "}
              Produto visível na loja
            </label>
            <Button
              disabled={savingProduct}
              className="bg-[#82ffc5] text-black hover:bg-white"
            >
              {savingProduct && (
                <Loader2 className="mr-2 animate-spin" size={16} />
              )}
              {editingId ? "SALVAR ALTERAÇÕES" : "CADASTRAR PRODUTO"}
            </Button>
          </div>
        </form>
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="text-xs font-bold tracking-[.18em] text-[#82ffc5]">
              PRODUTOS CADASTRADOS
            </p>
            <h2 className="mt-1 font-display text-2xl">Catálogo visível</h2>
          </div>
          {catalog.error ? (
            <ErrorText message={catalog.error} />
          ) : (
            <div className="divide-y divide-white/10">
              {catalog.products.map(product => (
                <div
                  key={product.id}
                  className="flex flex-wrap items-center gap-4 px-6 py-4"
                >
                  <img
                    src={product.image_url}
                    alt=""
                    className="h-14 w-12 rounded-lg bg-black/30 object-cover"
                  />
                  <div className="min-w-40 flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="mt-1 text-xs text-white/45">
                      {product.category} · {product.brand || "Sem marca"} · {product.stock} em estoque ·{" "}
                      {product.is_active ? "Ativo" : "Oculto"}
                    </p>
                  </div>
                  <p className="text-sm">
                    {toMoney(product.price_cents / 100)}
                  </p>
                  <Button
                    type="button"
                    onClick={() => {
                      setForm(toForm(product));
                      setEditingId(product.id);
                      document
                        .getElementById("products")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void remove(product)}
                    variant="ghost"
                    size="icon"
                    className="text-red-300 hover:bg-red-300/10 hover:text-red-200"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              {!catalog.loading && catalog.products.length === 0 && (
                <Empty message="Nenhum produto cadastrado no Supabase." />
              )}
            </div>
          )}
        </section>
      </section>
      <section
        id="orders"
        className="scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <SectionHeading eyebrow="PEDIDOS" title="Pedidos em andamento" icon={<ClipboardList size={18} />} description="Consulte somente os pedidos ativos, combine o frete manualmente pelo atendimento, confirme o Pix, registre a postagem e carregue a etiqueta pronta para impressão. Pedidos cancelados ficam separados no histórico." />
          <span role="status" className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-[.14em] ${operations.realtimeStatus === "live" ? "border-[#82ffc5]/40 bg-[#82ffc5]/10 text-[#82ffc5]" : "border-white/15 text-white/50"}`}>
            {operations.realtimeStatus === "live" ? "● PEDIDOS AO VIVO" : operations.realtimeStatus === "connecting" ? "● CONECTANDO AO VIVO" : "● ATUALIZAÇÃO TEMPORARIAMENTE INDISPONÍVEL"}
          </span>
        </div>
        {operations.error ? (
          <ErrorText message={operations.error} />
        ) : (
          <div className="divide-y divide-white/10">
            {activeOrders.map(order => (
              <div
                key={order.id}
                className="flex flex-wrap items-center gap-x-5 gap-y-3 px-6 py-4 text-sm"
              >
                <div className="min-w-36">
                  <p className="font-medium">{order.order_number}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="min-w-40 flex-1">
                  <p className="text-white/80">{order.customer_name}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {order.delivery_mode === "correios"
                      ? `${order.address ?? ""}, ${order.delivery_number ?? ""} · ${order.delivery_city ?? ""}/${order.delivery_state ?? ""}`
                      : `${order.delivery_mode === "city_delivery" ? "Entrega" : "Retirada"} em ${storefront.settings.local_city} — combinar pelo atendimento`}
                  </p>
                </div>
                {order.delivery_mode === "correios" && <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 text-xs text-white hover:bg-white/10"
                  onClick={() => {
                    window.sessionStorage.setItem(
                      "oversized-label-order",
                      JSON.stringify(order)
                    );
                    window.dispatchEvent(new Event(SHIPPING_LABEL_ORDER_EVENT));
                    document
                      .getElementById("labels")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  ETIQUETA CORREIOS
                </Button>}
                <label className="grid gap-1 text-[10px] font-bold tracking-wide text-white/45">
                  PAGAMENTO
                  <select
                    value={order.payment_status}
                    onChange={event =>
                      void updateOrder(
                        order.id,
                        event.target.value as SupabaseOrder["payment_status"]
                      )
                    }
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-normal text-white outline-none"
                  >
                    <option value="pending">{orderLabels.pending}</option>
                    <option value="approved">{orderLabels.approved}</option>
                    <option value="rejected">{orderLabels.rejected}</option>
                    <option value="cancelled">{orderLabels.cancelled}</option>
                  </select>
                </label>
                <label className="grid gap-1 text-[10px] font-bold tracking-wide text-white/45">
                  OPERAÇÃO
                  <select
                    value={
                      (operationalStatuses.includes(
                        order.order_status as OperationalStatus
                      )
                        ? order.order_status
                        : "awaiting_freight") as OperationalStatus
                    }
                    onChange={event =>
                      void updateOperationalStatus(
                        order.id,
                        event.target.value as OperationalStatus
                      )
                    }
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-normal text-white outline-none"
                  >
                    {operationalStatuses.map(status => (
                      <option key={status} value={status}>
                        {operationalLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <p>{toMoney(order.total_cents / 100)}</p>
              </div>
            ))}
            {!operations.loading && activeOrders.length === 0 && (
              <Empty message="Não há pedido em andamento. Pedidos cancelados permanecem somente no histórico abaixo." />
            )}
          </div>
        )}
        {!operations.loading && cancelledOrders.length > 0 && (
          <div className="border-t border-red-300/15 bg-red-300/[.025] px-6 py-5">
            <p className="text-xs font-bold tracking-[.16em] text-red-200">
              PEDIDOS CANCELADOS — HISTÓRICO
            </p>
            <p className="mt-2 text-xs leading-5 text-white/50">
              Estes pedidos foram arquivados porque não foram concluídos. Eles não contam como venda, não aparecem entre os pedidos em andamento e não geram etiqueta de postagem.
            </p>
            <div className="mt-4 divide-y divide-red-300/10 rounded-2xl border border-red-300/15 bg-black/10">
              {cancelledOrders.map(order => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4 text-sm"
                >
                  <div className="min-w-36">
                    <p className="font-medium text-white/80">{order.order_number}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="min-w-40 flex-1">
                    <p className="text-white/65">{order.customer_name}</p>
                    <p className="mt-1 text-xs font-bold tracking-wide text-red-200">
                      CANCELADO — NÃO É VENDA ATIVA
                    </p>
                  </div>
                  <p className="text-white/50">{toMoney(order.total_cents / 100)}</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={deletingOrderId === order.id}
                        className="border-red-300/35 px-3 text-xs text-red-100 hover:bg-red-300/10 hover:text-red-50"
                      >
                        {deletingOrderId === order.id ? (
                          <Loader2 className="animate-spin" size={15} />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        APAGAR
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-red-300/30 bg-[#151010] text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apagar pedido cancelado?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/65">
                          O pedido {order.order_number} de {order.customer_name} será removido definitivamente do histórico. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                          MANTER HISTÓRICO
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={deletingOrderId === order.id}
                          onClick={() => void deleteCancelledOrder(order)}
                          className="bg-red-500 text-white hover:bg-red-400"
                        >
                          APAGAR DEFINITIVAMENTE
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <ShippingLabelGenerator />
      <FutureCommerceSettings
        draft={storefrontDraft}
        onFieldChange={setStorefrontField}
        onSave={saveStorefront}
        saving={savingStorefront}
        error={storefront.error}
        onRefresh={storefront.refresh}
      />
    </div>
  );
}

function StorefrontEditor({
  draft,
  onFieldChange,
  onImageChange,
  onSave,
  saving,
  error,
}: {
  draft: StorefrontSettings;
  onFieldChange: (key: StorefrontField, value: string | boolean) => void;
  onImageChange: (value: string | null) => void;
  onSave: (event: FormEvent) => void;
  saving: boolean;
  error: string | null;
}) {
  const groups: {
    title: string;
    fields: { key: StorefrontField; label: string; multiline?: boolean }[];
  }[] = [
    {
      title: "AVISO E DESTAQUE PRINCIPAL",
      fields: [
        { key: "announcement_text", label: "Aviso no topo", multiline: true },
        { key: "hero_eyebrow", label: "Etiqueta acima do título" },
        { key: "hero_title", label: "Título principal", multiline: true },
        { key: "hero_accent", label: "Palavra ou frase em verde" },
        { key: "hero_description", label: "Texto principal", multiline: true },
        { key: "hero_cta_label", label: "Texto do botão principal" },
        { key: "hero_cta_path", label: "Destino interno do botão" },
      ],
    },
    {
      title: "PROMOÇÃO DA SEMANA",
      fields: [
        { key: "promotion_eyebrow", label: "Etiqueta" },
        { key: "promotion_title", label: "Título" },
        { key: "promotion_accent", label: "Linha de destaque" },
        { key: "promotion_description", label: "Descrição", multiline: true },
        { key: "promotion_cta_label", label: "Texto do botão" },
        { key: "promotion_cta_path", label: "Destino interno do botão" },
      ],
    },
    {
      title: "COLEÇÃO E CATEGORIAS",
      fields: [
        { key: "highlights_eyebrow", label: "Etiqueta dos destaques" },
        { key: "highlights_title", label: "Título dos destaques" },
        {
          key: "highlights_description",
          label: "Descrição dos destaques",
          multiline: true,
        },
        { key: "highlights_cta_label", label: "Botão dos destaques" },
        { key: "highlights_cta_path", label: "Destino do botão dos destaques" },
        { key: "categories_eyebrow", label: "Etiqueta das categorias" },
        { key: "categories_title", label: "Título das categorias" },
        {
          key: "categories_description",
          label: "Descrição das categorias",
          multiline: true,
        },
      ],
    },
    {
      title: "BENEFÍCIOS",
      fields: [
        { key: "benefit_one_title", label: "Benefício 1 — título" },
        { key: "benefit_one_caption", label: "Benefício 1 — texto" },
        { key: "benefit_two_title", label: "Benefício 2 — título" },
        { key: "benefit_two_caption", label: "Benefício 2 — texto" },
        { key: "benefit_three_title", label: "Benefício 3 — título" },
        { key: "benefit_three_caption", label: "Benefício 3 — texto" },
        { key: "benefit_four_title", label: "Benefício 4 — título" },
        { key: "benefit_four_caption", label: "Benefício 4 — texto" },
      ],
    },
    {
      title: "NOVIDADES E RODAPÉ",
      fields: [
        { key: "newsletter_title", label: "Título de novidades" },
        {
          key: "newsletter_description",
          label: "Texto de novidades",
          multiline: true,
        },
        {
          key: "footer_description",
          label: "Descrição do rodapé",
          multiline: true,
        },
        {
          key: "footer_location",
          label: "Localização da loja (deixe vazio para ocultar)",
          multiline: true,
        },
        { key: "footer_hours", label: "Horário de atendimento" },
      ],
    },
    {
      title: "ATENDIMENTO, ENTREGA E PIX",
      fields: [
        { key: "local_city", label: "Cidade para entrega ou retirada local" },
        { key: "local_state", label: "UF da cidade local" },
        {
          key: "local_pickup_label",
          label: "Texto da opção de retirada local",
        },
        {
          key: "local_delivery_label",
          label: "Texto da opção de entrega na cidade",
        },
        {
          key: "outside_delivery_label",
          label: "Texto da opção para outra cidade",
        },
        {
          key: "outside_delivery_notice",
          label: "Aviso de frete para outra cidade",
          multiline: true,
        },
        { key: "pix_key", label: "Chave Pix ou instrução de pagamento" },
      ],
    },
  ];
  return (
    <form onSubmit={onSave} className="mt-7 grid gap-5">
      {groups.map(group => (
        <fieldset
          key={group.title}
          className="grid gap-4 rounded-2xl border border-white/10 p-5"
        >
          <legend className="px-2 text-xs font-bold tracking-[.16em] text-[#82ffc5]">
            {group.title}
          </legend>
          {group.title === "AVISO E DESTAQUE PRINCIPAL" && (
            <>
              <Field label="Logo da loja (URL opcional)">
                <input
                  type="url"
                  value={draft.logo_url ?? ""}
                  onChange={event =>
                    onFieldChange("logo_url", event.target.value.trim())
                  }
                  className="admin-input"
                  placeholder="https://.../logo.png"
                />
                <p className="-mt-2 text-xs leading-5 text-white/45">
                  Cole a URL da imagem da logo. Se ficar vazia, a logo padrão
                  continuará sendo usada.
                </p>
              </Field>
              <Field label="Imagem principal (URL opcional)">
                <input
                  type="url"
                  value={draft.hero_image_url ?? ""}
                  onChange={event =>
                    onImageChange(event.target.value.trim() || null)
                  }
                  className="admin-input"
                  placeholder="https://..."
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Cor principal">
                  <input
                    type="color"
                    value={draft.primary_color}
                    onChange={event =>
                      onFieldChange("primary_color", event.target.value)
                    }
                    className="h-11 w-full cursor-pointer rounded-lg border border-white/10 bg-black/30 p-1"
                  />
                </Field>
                <Field label="Cor de fundo">
                  <input
                    type="color"
                    value={draft.background_color}
                    onChange={event =>
                      onFieldChange("background_color", event.target.value)
                    }
                    className="h-11 w-full cursor-pointer rounded-lg border border-white/10 bg-black/30 p-1"
                  />
                </Field>
              </div>
              <div className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:grid-cols-2">
                <p className="text-xs font-bold tracking-[.16em] text-[#82ffc5] sm:col-span-2">
                  SEÇÕES VISÍVEIS NA HOME
                </p>
                {(
                  [
                    ["hero_visible", "Banner principal"],
                    ["promotion_visible", "Promoção da semana"],
                    ["highlights_visible", "Destaques"],
                    ["benefits_visible", "Benefícios"],
                    ["newsletter_visible", "Novidades"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 text-sm text-white/70"
                  >
                    <input
                      type="checkbox"
                      checked={draft[key]}
                      onChange={event =>
                        onFieldChange(key, event.target.checked)
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {group.fields.map(field => (
              <Field key={field.key} label={field.label}>
                {field.multiline ? (
                  <textarea
                    required={field.key !== "footer_location"}
                    value={String(draft[field.key] ?? "")}
                    onChange={event =>
                      onFieldChange(field.key, event.target.value)
                    }
                    className="admin-input min-h-20 py-2"
                  />
                ) : (
                  <input
                    required
                    value={String(draft[field.key] ?? "")}
                    onChange={event =>
                      onFieldChange(field.key, event.target.value)
                    }
                    className="admin-input"
                  />
                )}
              </Field>
            ))}
          </div>
        </fieldset>
      ))}
      {error && <ErrorText message={error} />}
      <div>
        <Button
          disabled={saving}
          className="bg-[#82ffc5] text-black hover:bg-white"
        >
          {saving ? (
            <Loader2 className="mr-2 animate-spin" size={16} />
          ) : (
            <Save className="mr-2" size={16} />
          )}
          SALVAR VITRINE
        </Button>
      </div>
    </form>
  );
}

function LocalDeliveryControls({
  draft,
  onFieldChange,
}: {
  draft: StorefrontSettings;
  onFieldChange: (key: StorefrontField, value: string | boolean) => void;
}) {
  return (
    <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:grid-cols-2">
      <p className="text-xs font-bold tracking-[.16em] text-[#82ffc5] sm:col-span-2">
        ATENDIMENTO E OPÇÕES LOCAIS
      </p>
      <Field label="Usuário do Instagram">
        <input
          value={draft.instagram_handle}
          onChange={event =>
            onFieldChange(
              "instagram_handle",
              event.target.value.replace(/^@/, "")
            )
          }
          className="admin-input"
          placeholder="iagomodas9"
        />
      </Field>
      <Field label="Número do WhatsApp (DDD + número)">
        <input
          value={draft.whatsapp_number}
          onChange={event =>
            onFieldChange(
              "whatsapp_number",
              event.target.value.replace(/\D/g, "")
            )
          }
          inputMode="tel"
          className="admin-input"
          placeholder="Ex.: 82999999999"
        />
      </Field>
      <label className="flex items-center gap-3 text-sm text-white/70">
        <input
          type="checkbox"
          checked={draft.instagram_enabled}
          onChange={event =>
            onFieldChange("instagram_enabled", event.target.checked)
          }
        />
        Exibir Instagram
      </label>
      <label className="flex items-center gap-3 text-sm text-white/70">
        <input
          type="checkbox"
          checked={draft.whatsapp_enabled}
          onChange={event =>
            onFieldChange("whatsapp_enabled", event.target.checked)
          }
          disabled={!draft.whatsapp_number}
        />
        Exibir WhatsApp
      </label>
      <label className="flex items-center gap-3 text-sm text-white/70">
        <input
          type="checkbox"
          checked={draft.local_pickup_enabled}
          onChange={event =>
            onFieldChange("local_pickup_enabled", event.target.checked)
          }
        />
        Permitir retirada local
      </label>
      <label className="flex items-center gap-3 text-sm text-white/70">
        <input
          type="checkbox"
          checked={draft.local_delivery_enabled}
          onChange={event =>
            onFieldChange("local_delivery_enabled", event.target.checked)
          }
        />
        Permitir entrega na cidade
      </label>
      <p className="text-xs leading-5 text-white/45 sm:col-span-2">
        Você pode manter Instagram e WhatsApp ativos ao mesmo tempo. Sem número,
        o WhatsApp fica oculto. Use “Salvar vitrine” abaixo para aplicar as
        alterações.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm text-white/70">
      <span>{label}</span>
      {children}
    </label>
  );
}
function SectionHeading({
  eyebrow,
  title,
  icon,
  description,
}: {
  eyebrow: string;
  title: string;
  icon: ReactNode;
  description?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[#82ffc5]">
        <span>{icon}</span>
        <p className="text-xs font-bold tracking-[.18em]">{eyebrow}</p>
      </div>
      <h2 className="mt-2 font-display text-2xl">{title}</h2>
      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
          {description}
        </p>
      )}
    </div>
  );
}
function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
      <div className="flex items-center gap-3 text-[#82ffc5]">
        {icon}
        <p className="text-xs font-bold tracking-[.16em]">{label}</p>
      </div>
      <p className="mt-4 font-display text-4xl">{value}</p>
    </div>
  );
}
function Empty({ message }: { message: string }) {
  return <p className="p-6 text-sm text-white/50">{message}</p>;
}
function ErrorText({ message }: { message: string }) {
  return (
    <div className="m-5 flex items-start gap-3 rounded-xl border border-red-300/20 bg-red-300/[.06] p-4 text-sm text-red-100">
      <ShieldAlert className="shrink-0" size={17} />
      {message}
    </div>
  );
}
