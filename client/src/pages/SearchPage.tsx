import ProductCard from "@/components/ProductCard";
import { useCatalog } from "@/hooks/useCatalog";
import { useLocation } from "wouter";

export default function SearchPage() {
  const [location] = useLocation();
  const query = new URLSearchParams(location.split("?")[1] || "").get("q") || "";
  const normalizedQuery = query.toLocaleLowerCase("pt-BR");
  const { products } = useCatalog();
  const results = products.filter((product) => `${product.name} ${product.category}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
  return <main className="container py-10 md:py-14"><p className="eyebrow">RESULTADOS</p><h1 className="section-title mt-2">BUSCA</h1><p className="mt-4 text-sm text-white/55">{results.length} resultado(s) para <strong className="text-white">“{query}”</strong></p><div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">{results.map((product) => <ProductCard key={product.id} product={product} />)}</div>{!results.length && <p className="py-20 text-center text-white/50">Não encontramos produtos com esse termo. Tente buscar por uma categoria.</p>}</main>;
}
