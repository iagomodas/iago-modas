import { getOAuthReturnUrl } from "@/lib/oauthReturn";
import { supabase } from "@/lib/supabase";
import { toMoney } from "@/lib/catalog";
import { Link } from "wouter";
import { CheckCircle2, ChevronLeft, Clock3, Loader2, LogIn, PackageCheck, ShoppingBag, Trash2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CustomerOrderItem = {
  id: number;
  product_name: string;
  size: string;
  unit_price_cents: number;
  quantity: number;
};

type CustomerOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  payment_method: string;
  payment_status: "pending" | "approved" | "rejected" | "cancelled";
  total_cents: number;
  created_at: string;
  delivery_mode: "local" | "city_delivery" | "correios" | null;
  delivery_city: string | null;
  delivery_state: string | null;
  delivery_neighborhood: string | null;
  delivery_number: string | null;
  delivery_complement: string | null;
  order_status: string | null;
  tracking_code: string | null;
  order_items: CustomerOrderItem[];
};

const orderQuery = "id, order_number, customer_name, payment_method, payment_status, total_cents, created_at, delivery_mode, delivery_city, delivery_state, delivery_neighborhood, delivery_number, delivery_complement, order_status, tracking_code, order_items(id, product_name, size, unit_price_cents, quantity)";

function statusFor(order: CustomerOrder) {
  if (order.payment_status === "cancelled" || order.order_status === "cancelled") return { label: "CANCELADO", className: "text-red-200", icon: XCircle };
  if (order.tracking_code || ["shipped", "posted", "delivered"].includes(order.order_status ?? "")) return { label: "ENVIADO", className: "text-[#82ffc5]", icon: PackageCheck };
  if (order.payment_status === "approved") return { label: "PAGAMENTO CONFIRMADO", className: "text-[#82ffc5]", icon: CheckCircle2 };
  if (order.payment_status === "rejected") return { label: "PAGAMENTO NÃO APROVADO", className: "text-red-200", icon: XCircle };
  return { label: "AGUARDANDO CONFIRMAÇÃO", className: "text-amber-200", icon: Clock3 };
}

function deliveryLabel(order: CustomerOrder) {
  if (order.delivery_mode === "correios") {
    return `Correios · ${order.delivery_city ?? ""}/${order.delivery_state ?? ""}`;
  }
  return order.delivery_mode === "city_delivery" ? "Entrega local" : "Retirada na loja";
}

function paymentLabel(paymentMethod: string) {
  if (paymentMethod === "pix") return "Pix";
  if (paymentMethod === "cash") return "Dinheiro";
  if (paymentMethod === "credit") return "Maquininha";
  if (paymentMethod === "mercado_pago") return "Mercado Pago";
  return paymentMethod;
}

function canCancel(order: CustomerOrder) {
  return order.payment_status !== "cancelled"
    && order.order_status !== "cancelled"
    && order.payment_status !== "approved"
    && !["shipped", "posted", "delivered"].includes(order.order_status ?? "");
}

export default function CustomerOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadOrders() {
    const client = supabase;
    if (!client) {
      setLoading(false);
      setError("A conta de cliente não está disponível agora.");
      return;
    }
    try {
      const { data: auth, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!auth.user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      setSignedIn(true);
      const { data, error: ordersError } = await client
        .from("orders")
        .select(orderQuery)
        .eq("customer_user_id", auth.user.id)
        .is("customer_hidden_at", null)
        .order("created_at", { ascending: false });
      if (ordersError) throw ordersError;
      setOrders((data ?? []) as unknown as CustomerOrder[]);
    } catch {
      setError("Não foi possível carregar seus pedidos agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function signIn() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: getOAuthReturnUrl("/pedidos") } });
  }

  async function cancelOrder(order: CustomerOrder) {
    if (!canCancel(order) || !supabase || cancellingId !== null) return;
    if (!window.confirm(`Tem certeza que deseja cancelar o pedido ${order.order_number}?`)) return;
    try {
      setCancellingId(order.id);
      const { error: cancelError } = await supabase.rpc("cancel_own_order" as never, { p_order_id: order.id } as never);
      if (cancelError) {
        setNotice(cancelError.message.includes("processamento") ? cancelError.message : "Não foi possível cancelar este pedido agora. Tente novamente.");
        return;
      }
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, payment_status: "cancelled", order_status: "cancelled" } : item));
      setNotice(`Pedido ${order.order_number} cancelado e mantido no seu histórico.`);
    } finally {
      setCancellingId(null);
    }
  }

  async function deleteCancelledOrder(order: CustomerOrder) {
    const isCancelled = order.payment_status === "cancelled" || order.order_status === "cancelled";
    if (!isCancelled || !supabase || deletingId !== null) return;
    if (!window.confirm(`Apagar o pedido cancelado ${order.order_number} do seu histórico? Essa ação não apaga o registro da loja.`)) return;
    try {
      setDeletingId(order.id);
      const { error: deleteError } = await supabase.rpc("delete_own_cancelled_order" as never, { p_order_id: order.id } as never);
      if (deleteError) {
        setNotice("Não foi possível apagar este pedido do seu histórico agora. Tente novamente.");
        return;
      }
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setNotice(`Pedido ${order.order_number} removido somente do seu histórico.`);
    } finally {
      setDeletingId(null);
    }
  }

  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  if (loading) return <main className="container py-16 text-white/60">Carregando seus pedidos…</main>;
  if (!signedIn) return <main className="container max-w-2xl py-10 md:py-16"><Link href="/" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-[#7affb9]"><ChevronLeft size={16} />Voltar para a loja</Link><section className="mt-6 rounded-3xl border border-white/10 bg-white/[.025] p-8 text-center"><LogIn size={35} className="mx-auto text-[#7affb9]" /><h1 className="mt-4 text-3xl font-black">MEUS PEDIDOS</h1><p className="mt-3 text-sm leading-6 text-white/60">Entre com Google para consultar os pedidos feitos pela sua conta.</p><button type="button" onClick={() => void signIn()} className="button-primary mt-7 w-full"><LogIn size={17} /> ENTRAR COM GOOGLE</button></section></main>;

  return <main className="container max-w-3xl py-10 md:py-16">
    <div className="flex flex-wrap items-center justify-between gap-4"><Link href="/" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-[#7affb9]"><ChevronLeft size={16} />Voltar para a loja</Link><Link href="/perfil" className="text-sm font-bold text-[#7affb9]">Editar meu cadastro</Link></div>
    <section className="mt-6"><p className="eyebrow">MINHA CONTA</p><h1 className="mt-2 text-3xl font-black">MEUS PEDIDOS</h1><p className="mt-3 text-sm leading-6 text-white/60">Aqui ficam os produtos dos pedidos que você confirmou no botão FINALIZAR PEDIDO. A sacola continua reservada apenas para compras em preparação.</p></section>
    {notice && <p role="status" className="mt-5 rounded-xl border border-[#82ffc5]/25 bg-[#82ffc5]/[.06] px-4 py-3 text-sm text-[#82ffc5]">{notice}</p>}
    {error && <p role="alert" className="mt-5 rounded-xl border border-red-300/25 bg-red-300/[.06] px-4 py-3 text-sm text-red-100">{error}</p>}
    {!hasOrders ? <section className="mt-7 rounded-3xl border border-white/10 bg-white/[.025] p-8 text-center"><ShoppingBag size={35} className="mx-auto text-[#7affb9]" /><h2 className="mt-4 text-xl font-bold">Você ainda não tem pedidos</h2><p className="mt-2 text-sm text-white/55">Quando você finalizar uma compra, ela aparecerá aqui.</p><Link href="/" className="button-primary mt-6 inline-flex">CONTINUAR COMPRANDO</Link></section> : <div className="mt-7 space-y-5">{orders.map((order) => { const status = statusFor(order); const StatusIcon = status.icon; return <article key={order.id} className="rounded-3xl border border-white/10 bg-white/[.025] p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[.16em] text-white/45">PEDIDO</p><h2 className="mt-1 text-lg font-black text-white">{order.order_number}</h2><p className="mt-1 text-xs text-white/45">{new Date(order.created_at).toLocaleString("pt-BR")} · {deliveryLabel(order)}</p></div><p className={`inline-flex items-center gap-2 text-xs font-black tracking-wide ${status.className}`}><StatusIcon size={16} />{status.label}</p></div><div className="mt-5 divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/15">{order.order_items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><div className="min-w-0"><p className="truncate font-semibold">{item.product_name}</p><p className="mt-1 text-xs text-white/45">Tamanho {item.size} · Quantidade {item.quantity}</p></div><strong className="shrink-0">{toMoney(item.unit_price_cents * item.quantity / 100)}</strong></div>)}</div><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div className="text-xs leading-5 text-white/50"><p>Pagamento: <strong className="text-white/75">{paymentLabel(order.payment_method)}</strong></p>{order.tracking_code && <p>Código de rastreio: <strong className="text-white/75">{order.tracking_code}</strong></p>}</div><div className="text-right"><p className="text-xs text-white/45">Total</p><p className="text-xl font-black text-[#82ffc5]">{toMoney(order.total_cents / 100)}</p></div></div>{canCancel(order) ? <button type="button" onClick={() => void cancelOrder(order)} disabled={cancellingId !== null || deletingId !== null} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-300/35 px-4 py-2.5 text-xs font-bold text-red-100 transition hover:bg-red-300/10 disabled:opacity-60">{cancellingId === order.id && <Loader2 size={15} className="animate-spin" />}CANCELAR PEDIDO</button> : (order.payment_status === "cancelled" || order.order_status === "cancelled") && <button type="button" onClick={() => void deleteCancelledOrder(order)} disabled={deletingId !== null} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-white/70 transition hover:bg-white/10 disabled:opacity-60">{deletingId === order.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}APAGAR DO MEU HISTÓRICO</button>}
</article>; })}</div>}
  </main>;
}
