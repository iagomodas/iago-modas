import { Product, toMoney } from "@/lib/catalog";
import { useStore } from "@/contexts/StoreContext";
import { openInstagramApp } from "@/lib/instagramOrder";
import { Link } from "wouter";
import { ShoppingBag } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[0]);
  const { addToCart } = useStore();
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  return <article className="product-card group"><Link href={`/produto/${product.slug}`} className="product-image-wrap"><img src={product.image} alt={product.name} className="product-image" style={{ filter: `hue-rotate(${product.id * 22}deg) saturate(${0.72 + product.id / 20})` }} /><div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" /><span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[9px] font-bold tracking-widest text-white/80 backdrop-blur">OM SELECTED</span>{discount && <span className="badge-discount">-{discount}%</span>}{product.badge && <span className="badge-new">{product.badge}</span>}</Link><div className="px-1 pb-1 pt-4"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#7affb9]">{product.category}</p><Link href={`/produto/${product.slug}`} className="mt-1.5 block min-h-11 text-[15px] font-semibold leading-5 transition group-hover:text-[#7affb9]">{product.name}</Link><div className="mt-2 flex items-end gap-2">{product.oldPrice && <span className="text-xs text-white/35 line-through">{toMoney(product.oldPrice)}</span>}<strong className="text-[17px]">{toMoney(product.price)}</strong></div><p className="mt-1 text-[11px] text-white/45">Condições confirmadas pelo Instagram</p><div className="mt-4 flex flex-wrap gap-1.5" aria-label="Selecionar tamanho">{product.sizes.map((option) => <button key={option} onClick={() => setSize(option)} className={`size-button ${size === option ? "selected" : ""}`}>{option}</button>)}</div><div className="mt-3 grid grid-cols-[1fr_auto] gap-2"><button onClick={() => addToCart(product, size)} className="add-button"><ShoppingBag size={14} /> CARRINHO</button><button type="button" onClick={openInstagramApp} className="instagram-button" aria-label={`Falar no Instagram sobre ${product.name}`}><FaInstagram aria-hidden="true" size={18} /></button></div></div></article>;
}
