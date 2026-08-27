import { categorySlug, categories, toMoney } from "@/lib/catalog";
import { openInstagramApp, openWhatsAppChat } from "@/lib/instagramOrder";
import { useStore } from "@/contexts/StoreContext";
import { useCatalog } from "@/hooks/useCatalog";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";
import { resolveStorefrontImage, type StorefrontSettings } from "@/lib/storefront";
import { Link, useLocation } from "wouter";
import { ArrowRight, Banknote, ChevronDown, LogOut, MapPin, Minus, Plus, QrCode, Search, ShoppingBag, Trash2, Truck, UserRound, X } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { logoImage } from "@/lib/inlineLogoAsset";
import { createPrivateProfilePhotoUrl } from "@/lib/profilePhoto";
import { supabase } from "@/lib/supabase";
import { accountDestinationForRole, type AccountRole } from "@/lib/accountNavigation";
import { buildSearchHashLocation } from "@/lib/searchRouting";

type CustomerAccount = {
  signedIn: boolean;
  displayName: string;
  photoUrl: string | null;
  role: AccountRole;
};

export function StoreShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();
  const { cartCount, setCartOpen } = useStore();
  const { products } = useCatalog();
  const { settings } = useStorefrontSettings();
  const [logoSrc, setLogoSrc] = useState(() => resolveStorefrontImage(settings.logo_url, logoImage));
  const suggestions = useMemo(() => { const normalized = query.trim().toLocaleLowerCase("pt-BR"); return normalized ? products.filter((product) => `${product.name} ${product.category} ${product.brand ?? ""} ${product.description}`.toLocaleLowerCase("pt-BR").includes(normalized)).slice(0, 4) : []; }, [products, query]);
  function openSearchResults() {
    const target = query.trim();
    if (target) window.location.hash = buildSearchHashLocation(target);
    setSearchOpen(false);
  }
  function submitSearch(event: FormEvent) { event.preventDefault(); openSearchResults(); }
  function chooseSuggestion(slug: string) { setSearchOpen(false); navigate(`/produto/${slug}`); }
  useEffect(() => { setQuery(""); }, [searchOpen]);
  useEffect(() => { setLogoSrc(resolveStorefrontImage(settings.logo_url, logoImage)); }, [settings.logo_url]);

  return <div className="min-h-screen overflow-x-clip bg-[#0a0d10] text-white selection:bg-[#7affb9] selection:text-black"><div className="promo-bar" aria-label="Avisos de promoções"><div className="promo-track"><span>{settings.announcement_text}</span><b>◆</b><span>{settings.announcement_text}</span></div></div><header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0d10]/95 backdrop-blur-xl"><div className="container flex h-[76px] items-center justify-between gap-3"><Link href="/" className="flex shrink-0 items-center gap-2" aria-label="IAGO MODAS — início"><img src={logoSrc} onError={(event) => { if (event.currentTarget.src !== logoImage) setLogoSrc(logoImage); }} alt="Logo IM IAGO MODAS" className="h-11 w-11 rounded-full object-cover ring-1 ring-white/15" /><span className="whitespace-nowrap text-[10px] font-semibold tracking-[0.14em] sm:text-sm sm:tracking-[0.18em]">IAGO <span className="text-[#7affb9]">MODAS</span></span></Link><nav className="hidden items-center gap-5 lg:flex" aria-label="Categorias">{categories.map((category) => <Link key={category} href={`/categoria/${categorySlug(category)}`} className="text-[11px] font-semibold tracking-[0.1em] text-white/70 transition hover:text-[#7affb9]">{category.toUpperCase()}</Link>)}</nav><div className="flex items-center gap-1.5 sm:gap-2"><AccountAccess /><button onClick={() => setSearchOpen(true)} className="icon-button" aria-label="Buscar produtos"><Search size={19} /></button><button onClick={() => setCartOpen(true)} className="icon-button relative" aria-label={`Abrir carrinho com ${cartCount} itens`}><ShoppingBag size={19} />{cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#7affb9] px-1 text-[9px] font-black text-black">{cartCount}</span>}</button></div></div><div className="no-scrollbar flex gap-5 overflow-x-auto border-t border-white/5 px-4 py-2 lg:hidden">{categories.map((category) => <Link key={category} href={`/categoria/${categorySlug(category)}`} className="shrink-0 text-[10px] font-bold tracking-[0.1em] text-white/65">{category.toUpperCase()}</Link>)}</div></header>{searchOpen && <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-24 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Buscar produtos"><div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#151a1f] shadow-2xl"><form onSubmit={submitSearch} className="flex items-center gap-3 px-5"><Search className="text-[#7affb9]" size={21} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produtos..." className="h-16 flex-1 bg-transparent text-base outline-none placeholder:text-white/35" /><button type="button" onClick={() => setSearchOpen(false)} className="icon-button" aria-label="Fechar busca"><X size={19} /></button></form>{query.trim() && <div className="border-t border-white/10 p-2">{suggestions.length > 0 ? suggestions.map((product) => <button key={product.id} type="button" onClick={() => chooseSuggestion(product.slug)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-white/[0.06]"><img src={product.image} alt="" className="h-12 w-10 rounded-lg object-cover object-right" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{product.name}</span><span className="mt-1 block text-xs text-white/45">{product.category}</span></span><strong className="text-sm text-[#7affb9]">{toMoney(product.price)}</strong></button>) : <p className="px-3 py-5 text-sm leading-5 text-white/45">Nenhum produto encontrado para “{query}”.</p>}<button type="button" onClick={openSearchResults} className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#7affb9] transition hover:bg-white/[0.06]">Ver todos os resultados <ArrowRight size={16} /></button></div>}{!query.trim() && <div className="border-t border-white/10 px-5 py-3 text-xs text-white/45">Pesquise por nome, categoria ou estilo.</div>}</div></div>}{children}<CartDrawer settings={settings} /><Footer settings={settings} logoUrl={logoSrc} /></div>;
}

function AccountAccess() {
  const [account, setAccount] = useState<CustomerAccount>({ signedIn: false, displayName: "", photoUrl: null, role: null });
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;
    const loadAccount = async () => {
      const { data: { user } } = await client.auth.getUser();
      if (!active || !user) {
        if (active) setAccount({ signedIn: false, displayName: "", photoUrl: null, role: null });
        return;
      }
      const { data: profile } = await client.from("profiles").select("display_name, profile_photo_path, role").eq("id", user.id).maybeSingle();
      const photoUrl = await createPrivateProfilePhotoUrl(client, profile?.profile_photo_path);
      if (active) setAccount({ signedIn: true, displayName: profile?.display_name ?? "", photoUrl, role: profile?.role === "admin" ? "admin" : "customer" });
    };
    void loadAccount();
    const { data: { subscription } } = client.auth.onAuthStateChange(() => { void loadAccount(); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const initials = account.displayName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((item) => item[0]).join("").toUpperCase();
  const accountDestination = accountDestinationForRole(account.role);
  const accountLabel = account.role === "admin" ? "Painel administrativo" : "Minha conta";
  async function signOut() {
    if (!supabase) return;
    setOpen(false);
    await supabase.auth.signOut();
    setAccount({ signedIn: false, displayName: "", photoUrl: null, role: null });
    navigate("/", { replace: true });
  }

  if (!account.signedIn) return <Link href="/perfil" className="icon-button" aria-label="Entrar ou abrir minha conta"><UserRound size={19} /><span className="sr-only">Entrar / Minha conta</span></Link>;
  return <div className="relative"><button type="button" onClick={() => setOpen((value) => !value)} className="icon-button overflow-hidden" aria-label="Abrir minha conta" aria-expanded={open}>{account.photoUrl ? <img src={account.photoUrl} alt="" className="h-5 w-5 rounded-full object-cover" /> : initials ? <span className="text-[9px] font-black text-[#7affb9]">{initials}</span> : <UserRound size={19} />}</button>{open && <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-white/10 bg-[#151a1f] p-2 shadow-2xl"><p className="px-3 pb-2 pt-1 text-xs text-white/45">{account.displayName || accountLabel}</p><Link href={accountDestination} onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/[0.07] hover:text-[#7affb9]"><UserRound size={16} /> {accountLabel}</Link>{account.role !== "admin" && <Link href="/pedidos" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/[0.07] hover:text-[#7affb9]"><ShoppingBag size={16} /> Meus pedidos</Link>}<button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-white/65 transition hover:bg-white/[0.07] hover:text-red-300"><LogOut size={16} /> Sair</button></div>}</div>;
}

function CartDrawer({ settings }: { settings: StorefrontSettings }) {
  const { cart, isCartOpen, setCartOpen, updateQuantity, removeFromCart, subtotal } = useStore();
  const [, navigate] = useLocation();
  if (!isCartOpen) return null;
  const activeChannel = settings.whatsapp_enabled && settings.whatsapp_number ? "WhatsApp" : settings.instagram_enabled ? "Instagram" : "atendimento da loja";
  return <div className="fixed inset-0 z-50 bg-black/60" role="dialog" aria-modal="true" aria-label="Carrinho de compras" onMouseDown={() => setCartOpen(false)}><aside onMouseDown={(event) => event.stopPropagation()} className="ml-auto flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#11161b] shadow-2xl animate-in slide-in-from-right duration-300"><div className="flex items-center justify-between border-b border-white/10 px-6 py-5"><div><p className="eyebrow">SEUS ITENS</p><h2 className="mt-1 text-2xl font-bold">Sacola</h2></div><button onClick={() => setCartOpen(false)} className="icon-button" aria-label="Fechar carrinho"><X size={20} /></button></div>{cart.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><ShoppingBag size={32} className="mb-4 text-[#7affb9]" /><h3 className="text-lg font-bold">Sua sacola está vazia</h3><button onClick={() => setCartOpen(false)} className="button-primary mt-6">CONTINUAR COMPRANDO</button></div> : <><div className="flex-1 space-y-3 overflow-y-auto p-5">{cart.map((item) => <div key={`${item.id}-${item.size}`} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"><img src={item.image} alt="" className="h-20 w-16 rounded-lg object-cover object-right" /><div className="min-w-0 flex-1"><div className="flex gap-2"><p className="line-clamp-2 flex-1 text-sm font-semibold leading-5">{item.name}</p><button onClick={() => removeFromCart(item.id, item.size)} className="text-white/45 transition hover:text-red-300" aria-label={`Remover ${item.name}`}><Trash2 size={16} /></button></div><p className="mt-1 text-xs text-white/50">Tamanho: {item.size}</p><div className="mt-3 flex items-center justify-between"><div className="quantity-stepper"><button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} aria-label="Diminuir quantidade"><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} aria-label="Aumentar quantidade"><Plus size={13} /></button></div><p className="font-bold text-[#7affb9]">{toMoney(item.price * item.quantity)}</p></div></div></div>)}</div><div className="border-t border-white/10 p-5"><div className="mb-4 flex items-center justify-between"><span className="text-white/60">Subtotal</span><strong className="text-xl">{toMoney(subtotal)}</strong></div><p className="mb-4 text-xs leading-5 text-white/45">Frete e pagamento serão confirmados diretamente pelo {activeChannel}.</p><button onClick={() => { setCartOpen(false); navigate("/checkout"); }} className="button-primary w-full">FINALIZAR PEDIDO <ArrowRight size={17} /></button></div></>}</aside></div>;
}

function Footer({ settings, logoUrl }: { settings: StorefrontSettings; logoUrl: string }) {
  const acceptsLocalCash = settings.local_pickup_enabled || settings.local_delivery_enabled;
  return <footer className="border-t border-white/10 bg-[#080a0c]"><div className="container grid gap-10 py-12 md:grid-cols-2 xl:grid-cols-[1.1fr_.78fr_.9fr_.9fr]"><div><div className="flex items-center gap-3"><img src={logoUrl} onError={(event) => { if (event.currentTarget.src !== logoImage) event.currentTarget.src = logoImage; }} alt="Logo IM" className="h-11 w-11 rounded-full object-cover" /><div><p className="font-semibold tracking-[0.18em]">IAGO MODAS</p><p className="mt-1 text-xs text-white/45">Moda masculina com presença.</p></div></div><p className="mt-5 max-w-sm text-sm leading-6 text-white/55">{settings.footer_description}</p></div><div><p className="eyebrow">NAVEGUE</p><div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">{categories.slice(0, 6).map((category) => <Link key={category} href={`/categoria/${categorySlug(category)}`} className="text-sm text-white/60 transition hover:text-[#7affb9]">{category}</Link>)}</div></div><div><p className="eyebrow">PAGAMENTO E ENVIO</p><div className="mt-4 space-y-3 text-sm text-white/70"><p className="flex items-center gap-2"><QrCode size={17} className="text-[#7affb9]" /> Pix</p>{acceptsLocalCash && <p className="flex items-center gap-2"><Banknote size={17} className="text-[#7affb9]" /> Dinheiro local</p>}<p className="flex items-start gap-2 font-semibold text-[#a5ffd2]"><Truck size={17} className="mt-0.5 shrink-0" /> Envio para todo o Brasil</p></div></div><div><p className="eyebrow">ATENDIMENTO</p>{settings.instagram_enabled && <button type="button" onClick={() => openInstagramApp(settings.instagram_handle)} className="mt-4 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-[#7affb9]"><FaInstagram aria-hidden="true" size={17} /> Instagram @{settings.instagram_handle} <ChevronDown className="-rotate-90" size={15} /></button>}{settings.whatsapp_enabled && settings.whatsapp_number && <button type="button" onClick={() => openWhatsAppChat(settings.whatsapp_number)} className="mt-3 inline-flex items-center gap-2 text-sm text-[#25D366] transition hover:text-[#55e58e]"><FaWhatsapp aria-hidden="true" size={17} /> Falar no WhatsApp <ChevronDown className="-rotate-90" size={15} /></button>}{!settings.instagram_enabled && !(settings.whatsapp_enabled && settings.whatsapp_number) && <p className="mt-4 text-sm text-white/45">Atendimento temporariamente indisponível.</p>}{settings.footer_location && <p className="mt-4 flex items-start gap-2 whitespace-pre-line text-sm leading-6 text-white/45"><MapPin size={16} className="mt-1 shrink-0 text-[#7affb9]" />{settings.footer_location}</p>}{settings.footer_hours.trim() && <p className="mt-2 text-xs text-white/40">{settings.footer_hours}</p>}</div></div><div className="border-t border-white/10 py-5 text-center text-xs text-white/35">© {new Date().getFullYear()} IAGO MODAS. Todos os direitos reservados.</div></footer>;
}
