import { Home, SearchX } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <main className="container grid min-h-[50vh] place-items-center py-16 md:py-24">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[.025] p-8 text-center md:p-12">
        <SearchX aria-hidden="true" className="mx-auto h-12 w-12 text-[#7affb9]" />
        <p className="eyebrow mt-6">ERRO 404</p>
        <h1 className="section-title mt-2">PÁGINA NÃO ENCONTRADA</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/60">O endereço acessado não existe ou não está mais disponível. Volte para a vitrine e continue navegando pela IAGO MODAS.</p>
        <Link href="/" className="button-primary mt-8"><Home aria-hidden="true" size={17} /> VOLTAR PARA A LOJA</Link>
      </section>
    </main>
  );
}
