import ProductCard from "@/components/ProductCard";
import { categories, categorySlug } from "@/lib/catalog";
import { useCatalog } from "@/hooks/useCatalog";
import { Link, useRoute } from "wouter";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

export default function CategoryPage() {
  const [, params] = useRoute("/categoria/:slug");
  const category = categories.find((item) => categorySlug(item) === params?.slug) || "Camisetas";
  const { products } = useCatalog();
  const filteredProducts = products.filter((product) => product.category === category);
  return <main className="container py-9 md:py-14"><div className="flex items-center gap-1.5 text-xs text-white/45"><Link href="/" className="hover:text-[#7affb9]">Início</Link><ChevronRight size={14} /><span>{category}</span></div><div className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">COLEÇÃO OVERZIED MODAS</p><h1 className="section-title mt-2">{category.toUpperCase()}</h1><p className="mt-3 text-sm text-white/55">{filteredProducts.length} {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"} nesta seleção.</p></div><button className="button-secondary text-xs"><SlidersHorizontal size={15} /> FILTRAR</button></div><div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>{filteredProducts.length === 0 && <div className="py-20 text-center text-white/50">Novos produtos desta categoria em breve.</div>}</main>;
}
