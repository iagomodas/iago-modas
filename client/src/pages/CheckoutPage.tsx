import { useStore } from "@/contexts/StoreContext";
import { toMoney } from "@/lib/catalog";
import { formatInstagramOrder, openInstagramApp } from "@/lib/instagramOrder";
import { ArrowLeft, Check, Clipboard, ExternalLink, Info, ShoppingBag } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { useMemo, useState } from "react";
import { Link } from "wouter";

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  textArea.remove();
  if (!copied) throw new Error("Não foi possível copiar o pedido");
}

export default function CheckoutPage() {
  const { cart, subtotal } = useStore();
  const [copyMessage, setCopyMessage] = useState("");
  const orderSummary = useMemo(() => formatInstagramOrder(cart, subtotal), [cart, subtotal]);

  async function copyOrder() {
    try {
      await copyText(orderSummary);
      setCopyMessage("Resumo copiado. No Instagram, toque no campo de mensagem, cole e envie.");
    } catch {
      setCopyMessage("Não foi possível copiar automaticamente. Selecione o resumo abaixo e copie antes de abrir o Instagram.");
    }
  }

  if (!cart.length) {
    return <main className="container flex min-h-[65vh] flex-col items-center justify-center py-12 text-center"><ShoppingBag size={35} className="text-[#7affb9]" /><h1 className="mt-4 text-2xl font-bold">Sua sacola está vazia</h1><p className="mt-2 text-sm text-white/55">Adicione produtos para montar seu pedido.</p><Link href="/" className="button-primary mt-6">CONTINUAR COMPRANDO</Link></main>;
  }

  return (
    <main className="container py-8 md:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-[#7affb9]"><ArrowLeft size={16} /> Voltar para a loja</Link>
      <div className="mt-8 grid gap-8 lg:grid-cols-[.92fr_1.08fr] lg:gap-12">
        <section className="rounded-[1.5rem] border border-white/10 bg-white/[.025] p-5 sm:p-7">
          <p className="eyebrow">FINALIZAÇÃO PELO INSTAGRAM</p>
          <h1 className="mt-2 text-3xl font-black">ENVIE SEU PEDIDO</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">A Overzied Modas confirma disponibilidade, frete e Pix diretamente no Instagram. Nenhum dado de cartão é solicitado neste site.</p>
          <div className="mt-8 space-y-3">
            <div className="flex gap-3 rounded-xl border border-[#7affb9]/20 bg-[#7affb9]/5 p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7affb9] text-sm font-black text-black">1</span><p className="pt-1 text-sm text-white/70">Confira o resumo do pedido ao lado.</p></div>
            <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[.025] p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-sm font-black">2</span><p className="pt-1 text-sm text-white/70">Use o botão abaixo. O resumo será copiado e a conversa da loja será aberta.</p></div>
            <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[.025] p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-sm font-black">3</span><p className="pt-1 text-sm text-white/70">No Instagram, cole a mensagem e toque em <strong className="text-white">Enviar</strong>.</p></div>
          </div>
          <button type="button" onClick={() => { void copyOrder(); openInstagramApp(); }} className="button-instagram mt-8 w-full"><FaInstagram aria-hidden="true" size={19} /> COPIAR PEDIDO E ABRIR INSTAGRAM <ExternalLink size={16} /></button>
          <button type="button" onClick={() => { void copyOrder(); }} className="button-secondary mt-3 w-full"><Clipboard size={16} /> COPIAR RESUMO SEM ABRIR O INSTAGRAM</button>
          {copyMessage && <p role="status" className="mt-4 flex gap-2 rounded-xl border border-white/10 bg-white/[.035] p-3 text-xs leading-5 text-white/65"><Check size={16} className="mt-0.5 shrink-0 text-[#7affb9]" />{copyMessage}</p>}
        </section>

        <aside className="h-fit rounded-[1.5rem] border border-white/10 bg-[#11161b] p-5 sm:p-7"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Resumo do pedido</h2><span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/60">{cart.length} item(ns)</span></div><div className="mt-5 divide-y divide-white/10">{cart.map((item) => <div key={`${item.id}-${item.size}`} className="flex gap-3 py-4 first:pt-0"><img src={item.image} alt="" className="h-16 w-14 rounded-lg object-cover object-right" /><div className="flex-1"><p className="text-sm font-semibold leading-5">{item.name}</p><p className="mt-1 text-xs text-white/45">Tam. {item.size} · Qtd. {item.quantity}</p></div><strong className="text-sm">{toMoney(item.price * item.quantity)}</strong></div>)}</div><div className="mt-5 border-t border-white/10 pt-5"><div className="flex justify-between text-sm text-white/55"><span>Subtotal dos produtos</span><span>{toMoney(subtotal)}</span></div><div className="mt-3 flex justify-between text-sm text-white/55"><span>Frete</span><span>A combinar</span></div><div className="mt-5 flex justify-between text-lg font-bold"><span>Total inicial</span><span>{toMoney(subtotal)}</span></div></div><div className="mt-6 flex items-start gap-2 rounded-xl bg-white/[.035] p-3 text-xs leading-5 text-white/50"><Info size={15} className="mt-0.5 shrink-0 text-[#7affb9]" />O valor do frete e os dados de Pix serão confirmados pela loja no Instagram.</div><div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4"><div className="flex items-center gap-2 text-xs font-bold tracking-[.08em] text-[#7affb9]"><FaInstagram size={15} /> MENSAGEM PRONTA</div><pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap font-sans text-xs leading-5 text-white/60">{orderSummary}</pre></div></aside>
      </div>
    </main>
  );
}
