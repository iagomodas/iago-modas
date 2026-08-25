import ProductCard from "@/components/ProductCard";
import { useStore } from "@/contexts/StoreContext";
import { useCatalog } from "@/hooks/useCatalog";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";
import { categorySlug, toMoney } from "@/lib/catalog";
import { getInstagramDirectUrl, getWhatsAppChatUrl } from "@/lib/instagramOrder";
import { Link, useRoute } from "wouter";
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, ShieldCheck, ShoppingBag } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function ProductPage() {
  const [, params] = useRoute("/produto/:slug");
  const { products, isLoading } = useCatalog();
  const { settings } = useStorefrontSettings();
  const product = products.find((item) => item.slug === params?.slug);
  const gallery = product?.images?.length ? product.images : product ? [product.image] : [];
  const [size, setSize] = useState(product?.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const { addToCart } = useStore();
  const contactMessage = product
    ? `Olá, IAGO MODAS! Quero tirar uma dúvida sobre o produto ${product.name}.`
    : "Olá, IAGO MODAS! Quero tirar uma dúvida sobre um produto da loja.";
  const contactChannels = [
    settings.whatsapp_enabled && settings.whatsapp_number
      ? { id: "whatsapp", href: getWhatsAppChatUrl(settings.whatsapp_number, contactMessage), label: "FALAR NO WHATSAPP", Icon: FaWhatsapp, className: "button-whatsapp" }
      : null,
    settings.instagram_enabled
      ? { id: "instagram", href: getInstagramDirectUrl(settings.instagram_handle), label: "FALAR NO INSTAGRAM", Icon: FaInstagram, className: "button-instagram" }
      : null,
  ].filter((channel): channel is NonNullable<typeof channel> => channel !== null);

  useEffect(() => {
    if (!product) return;
    setActiveImage(0);
    setSize(product.sizes[0]);
  }, [product]);

  if (!product) {
    return (
      <main className="container py-20 text-center">
        <p className="eyebrow">CATÁLOGO</p>
        <h1 className="section-title mt-3">{isLoading ? "CARREGANDO PRODUTO" : "PRODUTO NÃO PUBLICADO"}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/55">{isLoading ? "Aguarde enquanto a loja carrega o catálogo." : "Este modelo não está disponível no catálogo da IAGO MODAS. Veja os produtos publicados ou fale com a loja pelos canais de atendimento ativos."}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="button-primary">VER CATÁLOGO</Link>
          {contactChannels.map((channel) => <a key={channel.id} href={channel.href} target="_blank" rel="noreferrer" className={channel.className}><channel.Icon size={18} />{channel.label}</a>)}
        </div>
      </main>
    );
  }

  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  const productMeta = [product.category, product.brand, product.collection].filter(Boolean).join(" / ");

  function addItems() {
    if (!product) return;
    for (let index = 0; index < quantity; index += 1) addToCart(product, size);
  }

  function moveImage(direction: number) {
    setActiveImage((current) => (current + direction + gallery.length) % gallery.length);
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 42) moveImage(distance < 0 ? 1 : -1);
    setTouchStartX(null);
  }

  return (
    <main className="container py-8 md:py-12">
      <div className="flex items-center gap-1.5 text-xs text-white/45"><Link href="/" className="hover:text-[#7affb9]">Início</Link><ChevronRight size={14} /><Link href={`/categoria/${categorySlug(product.category)}`} className="hover:text-[#7affb9]">{product.category}</Link><ChevronRight size={14} /><span className="max-w-36 truncate sm:max-w-none">{product.name}</span></div>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.04fr_.96fr] lg:gap-14">
        <div className="order-1 grid grid-cols-1 gap-3 sm:grid-cols-[72px_1fr] lg:order-1">
          <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col">
            {gallery.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} aria-label={`Ver foto ${index + 1} de ${gallery.length}`} className={`shrink-0 overflow-hidden rounded-xl border p-0.5 transition ${activeImage === index ? "border-[#7affb9]" : "border-white/10 opacity-55 hover:opacity-100"}`}><img src={image} alt={`${product.name} — foto ${index + 1}`} className="h-16 w-16 rounded-[9px] object-cover sm:h-auto sm:w-full sm:aspect-square" /></button>)}
          </div>
          <div className="order-1 relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#13191d]" onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)} onTouchEnd={handleTouchEnd}>
            <img src={gallery[activeImage]} alt={`${product.name} — foto ${activeImage + 1}`} className="aspect-square w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            {gallery.length > 1 && <><button type="button" onClick={() => moveImage(-1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur transition hover:bg-[#7affb9] hover:text-black"><ChevronLeft size={19} /></button><button type="button" onClick={() => moveImage(1)} aria-label="Próxima foto" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur transition hover:bg-[#7affb9] hover:text-black"><ChevronRight size={19} /></button></>}
            {discount && <span className="badge-discount">-{discount}%</span>}{product.badge && <span className="badge-new">{product.badge}</span>}
            {gallery.length > 1 && <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">{gallery.map((image, index) => <button key={`dot-${image}-${index}`} type="button" onClick={() => setActiveImage(index)} aria-label={`Selecionar foto ${index + 1}`} className={`h-1.5 rounded-full transition-all ${activeImage === index ? "w-6 bg-[#7affb9]" : "w-1.5 bg-white/55"}`} />)}</div>}
          </div>
        </div>
        <section className="order-2 lg:order-2 lg:pt-3">
          <p className="eyebrow text-[#7affb9]">IAGO MODAS / {productMeta.toUpperCase()}</p>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight md:text-[42px]">{product.name}</h1>
          <div className="mt-6 flex items-end gap-3">{product.oldPrice && <span className="text-base text-white/40 line-through">{toMoney(product.oldPrice)}</span>}<strong className="text-3xl text-white">{toMoney(product.price)}</strong></div>
          <p className="mt-2 text-sm text-white/50">Consulte condições de pagamento diretamente com a loja.</p>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/65">{product.description}</p>
          <div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.14em] text-white/65">Tamanho <span className="text-[#7affb9]">— {size}</span></p><div className="mt-3 flex flex-wrap gap-2">{product.sizes.map((option) => <button key={option} onClick={() => setSize(option)} className={`size-button detail-size ${size === option ? "selected" : ""}`}>{option}</button>)}</div></div>
          <div className="mt-7 flex flex-wrap gap-3"><div className="quantity-stepper h-12"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Diminuir quantidade"><Minus size={15} /></button><span>{quantity}</span><button onClick={() => setQuantity((value) => value + 1)} aria-label="Aumentar quantidade"><Plus size={15} /></button></div><button onClick={addItems} className="button-primary flex-1 sm:flex-none"><ShoppingBag size={17} /> ADICIONAR AO CARRINHO</button></div>
          {contactChannels.length > 0 && <div className="mt-3 flex flex-wrap gap-3">{contactChannels.map((channel) => <a key={channel.id} href={channel.href} target="_blank" rel="noreferrer" className={channel.className}><channel.Icon aria-hidden="true" size={19} />{channel.id === "whatsapp" ? " TIRAR DÚVIDA NO WHATSAPP" : " TIRAR DÚVIDA NO INSTAGRAM"}</a>)}</div>}
          <div className="mt-7 grid gap-3 border-t border-white/10 pt-6 text-sm text-white/60"><p className="flex items-center gap-2"><ShieldCheck size={17} className="text-[#7affb9]" /> Atendimento direto para confirmar pedido e entrega</p></div>
        </section>
      </div>
      {related.length > 0 && <section className="mt-20 border-t border-white/10 pt-12"><p className="eyebrow">VOCÊ TAMBÉM PODE GOSTAR</p><h2 className="section-title mt-2">MAIS DA COLEÇÃO</h2><div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </main>
  );
}
