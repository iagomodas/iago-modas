import { heroImage } from "@/lib/inlineHeroAsset";

export type Category =
  | "Camisetas"
  | "Bermudas"
  | "Kits"
  | "Calças"
  | "Calçados"
  | "Esportivo"
  | "Perfumes"
  | "Acessórios";

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: Category;
  brand?: string;
  price: number;
  oldPrice?: number;
  badge?: "NOVO" | "LANÇAMENTO";
  sizes: string[];
  color: string;
  description: string;
  image: string;
  images?: string[];
};

export const categories: Category[] = [
  "Camisetas",
  "Bermudas",
  "Kits",
  "Calças",
  "Calçados",
  "Esportivo",
  "Perfumes",
  "Acessórios",
];

const productImage = heroImage;

export const products: Product[] = [
  { id: 1, slug: "camiseta-essentials-oversized", name: "Camiseta Essentials Oversized", category: "Camisetas", price: 89.9, oldPrice: 109.9, badge: "NOVO", sizes: ["P", "M", "G", "GG"], color: "#82ffc5", description: "Algodão encorpado, caimento oversized e acabamento premium para compor seus melhores looks.", image: productImage },
  { id: 2, slug: "camiseta-signature-preta", name: "Camiseta Signature Preta", category: "Camisetas", price: 79.9, sizes: ["P", "M", "G", "GG"], color: "#b1a5ff", description: "Modelagem reta, malha macia e visual minimalista para a rotina urbana.", image: productImage },
  { id: 3, slug: "bermuda-cargo-street", name: "Bermuda Cargo Street", category: "Bermudas", price: 119.9, oldPrice: 139.9, badge: "LANÇAMENTO", sizes: ["38", "40", "42", "44"], color: "#ffce73", description: "Bermuda cargo com bolsos funcionais, tecido resistente e ajuste confortável.", image: productImage },
  { id: 4, slug: "kit-urban-essential", name: "Kit Urban Essential", category: "Kits", price: 149.9, oldPrice: 189.8, badge: "NOVO", sizes: ["P", "M", "G", "GG"], color: "#ff8f92", description: "Kit com duas camisetas básicas em cores neutras, pensado para combinações sem esforço.", image: productImage },
  { id: 5, slug: "calca-cargo-relaxed", name: "Calça Cargo Relaxed", category: "Calças", price: 179.9, sizes: ["38", "40", "42", "44"], color: "#66b5ff", description: "Calça cargo de silhueta relaxed, com bolsos utilitários e acabamento sofisticado.", image: productImage },
  { id: 6, slug: "tenis-urban-court", name: "Tênis Urban Court", category: "Calçados", price: 229.9, oldPrice: 259.9, badge: "LANÇAMENTO", sizes: ["38", "39", "40", "41", "42"], color: "#e7e7e7", description: "Tênis casual com sola robusta e design limpo para acompanhar o ritmo da cidade.", image: productImage },
  { id: 7, slug: "conjunto-performance", name: "Conjunto Performance", category: "Esportivo", price: 159.9, sizes: ["P", "M", "G", "GG"], color: "#8ee9ff", description: "Conjunto esportivo leve e respirável, feito para mobilidade e conforto diário.", image: productImage },
  { id: 8, slug: "fragrancia-noir", name: "Fragrância Noir", category: "Perfumes", price: 129.9, badge: "NOVO", sizes: ["100 ml"], color: "#d5aa70", description: "Fragrância amadeirada de presença marcante, ideal para noites e ocasiões especiais.", image: productImage },
  { id: 9, slug: "bone-om-classic", name: "Boné OM Classic", category: "Acessórios", price: 69.9, sizes: ["Único"], color: "#ffffff", description: "Boné de aba curva com visual essencial e estrutura confortável para o dia a dia.", image: productImage },
  { id: 10, slug: "camiseta-chapter-one", name: "Camiseta Chapter One", category: "Camisetas", price: 99.9, badge: "LANÇAMENTO", sizes: ["P", "M", "G", "GG"], color: "#61ffc8", description: "Peça selecionada com gola reforçada, acabamento contemporâneo e toque macio.", image: productImage },
];

export const toMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const categorySlug = (category: string) =>
  category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
