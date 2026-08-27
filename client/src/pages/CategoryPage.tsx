import ProductCard from "@/components/ProductCard";
import { categories, categorySlug } from "@/lib/catalog";
import { useCatalog } from "@/hooks/useCatalog";
import { Link, useRoute } from "wouter";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export default function CategoryPage() {
  const [, params] = useRoute("/categoria/:slug");
  const category = categories.find((item) => categorySlug(item) === params?.slug) || "Camisetas";
  const { products } = useCatalog();
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const categoryProducts = useMemo(
    () => products.filter((product) => product.category === category),
    [category, products],
  );
  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          categoryProducts
            .map((product) => product.brand?.trim())
            .filter((brand): brand is string => Boolean(brand)),
        ),
      ).sort((left, right) => left.localeCompare(right, "pt-BR")),
    [categoryProducts],
  );
  const filteredProducts = useMemo(
    () =>
      categoryProducts.filter(
        (product) => selectedBrand === "Todas" || product.brand === selectedBrand,
      ),
    [categoryProducts, selectedBrand],
  );

  return (
    <main className="container py-9 md:py-14">
      <div className="flex items-center gap-1.5 text-xs text-white/45">
        <Link href="/" className="hover:text-[#7affb9]">
          Início
        </Link>
        <ChevronRight size={14} />
        <span>{category}</span>
      </div>
      <div className="mt-8">
        <p className="eyebrow">IAGO MODAS</p>
        <h1 className="section-title mt-2">{category.toUpperCase()}</h1>
        <p className="mt-3 text-sm text-white/55">
          {filteredProducts.length} {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"} nesta categoria.
        </p>
      </div>
      {brands.length > 0 && (
        <section className="mt-7" aria-label={`Filtrar ${category} por marca`}>
          <p className="text-xs font-bold tracking-[.16em] text-white/50">ESCOLHA A MARCA</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={selectedBrand === "Todas"}
              onClick={() => setSelectedBrand("Todas")}
              className={`rounded-full border px-4 py-2 text-xs font-bold transition ${selectedBrand === "Todas" ? "border-[#82ffc5] bg-[#82ffc5] text-black" : "border-white/15 text-white/70 hover:border-[#82ffc5]/70 hover:text-white"}`}
            >
              TODAS AS MARCAS
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                type="button"
                aria-pressed={selectedBrand === brand}
                onClick={() => setSelectedBrand(brand)}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition ${selectedBrand === brand ? "border-[#82ffc5] bg-[#82ffc5] text-black" : "border-white/15 text-white/70 hover:border-[#82ffc5]/70 hover:text-white"}`}
              >
                {brand.toUpperCase()}
              </button>
            ))}
          </div>
        </section>
      )}
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <div className="py-20 text-center text-white/50">
          Nenhum produto corresponde à marca escolhida nesta categoria.
        </div>
      )}
    </main>
  );
}
