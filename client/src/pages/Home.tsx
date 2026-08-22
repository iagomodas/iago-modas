import ProductCard from "@/components/ProductCard";
import { useCatalog } from "@/hooks/useCatalog";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";
import { heroImage } from "@/lib/inlineHeroAsset";
import { logoImage } from "@/lib/inlineLogoAsset";
import { getInstagramDirectUrl, getWhatsAppChatUrl } from "@/lib/instagramOrder";
import { resolveStorefrontImage, storefrontPath } from "@/lib/storefront";
import { categorySlug } from "@/lib/catalog";
import { ArrowRight, Box, Headphones, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Link } from "wouter";

export default function Home() {
  const { products: catalogProducts } = useCatalog();
  const { settings } = useStorefrontSettings();
  const [logoSrc, setLogoSrc] = useState(() => resolveStorefrontImage(settings.logo_url, logoImage));
  const highlights = catalogProducts.slice(0, 4);
  const [heroSrc, setHeroSrc] = useState(() => resolveStorefrontImage(settings.hero_image_url, heroImage));
  const heroLines = useMemo(() => settings.hero_title.split(/\r?\n/).filter(Boolean), [settings.hero_title]);
  const themeStyle = { "--store-primary": settings.primary_color, "--store-background": settings.background_color } as CSSProperties;
  const supportChannels = [
    settings.whatsapp_enabled && settings.whatsapp_number
      ? { id: "whatsapp", label: "FALAR NO WHATSAPP", ariaLabel: "Falar pelo WhatsApp", href: getWhatsAppChatUrl(settings.whatsapp_number), Icon: FaWhatsapp, buttonClassName: "button-whatsapp", floatClassName: "whatsapp-float" }
      : null,
    settings.instagram_enabled && settings.instagram_handle
      ? { id: "instagram", label: "FALAR NO INSTAGRAM", ariaLabel: "Falar pelo Instagram", href: getInstagramDirectUrl(settings.instagram_handle), Icon: FaInstagram, buttonClassName: "button-secondary", floatClassName: "instagram-float" }
      : null,
  ].filter((channel): channel is NonNullable<typeof channel> => channel !== null);
  const primarySupportChannel = supportChannels[0];
  const benefits = [
    { icon: primarySupportChannel?.Icon ?? MessageCircle, title: settings.benefit_one_title, caption: settings.benefit_one_caption },
    { icon: Box, title: settings.benefit_two_title, caption: settings.benefit_two_caption },
    { icon: Headphones, title: settings.benefit_three_title, caption: settings.benefit_three_caption },
    { icon: ShieldCheck, title: settings.benefit_four_title, caption: settings.benefit_four_caption },
  ];
  const hasPublishedDestination = (value: string) => {
    const path = storefrontPath(value);
    if (path === "/") return catalogProducts.length > 0;
    if (path.startsWith("/produto/")) return catalogProducts.some((product) => path === `/produto/${product.slug}`);
    if (path.startsWith("/categoria/")) return catalogProducts.some((product) => path === `/categoria/${categorySlug(product.category)}`);
    return false;
  };
  const heroCtaAvailable = hasPublishedDestination(settings.hero_cta_path);
  const promotionAvailable = hasPublishedDestination(settings.promotion_cta_path);
  const highlightsCtaAvailable = hasPublishedDestination(settings.highlights_cta_path);

  useEffect(() => {
    setHeroSrc(resolveStorefrontImage(settings.hero_image_url, heroImage));
  }, [settings.hero_image_url]);

  useEffect(() => {
    setLogoSrc(resolveStorefrontImage(settings.logo_url, logoImage));
  }, [settings.logo_url]);

  return (
    <main style={themeStyle} className="bg-[var(--store-background)]">
      {settings.hero_visible && <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="container grid min-h-[610px] items-center gap-8 py-14 lg:grid-cols-[.98fr_1.02fr] lg:py-16">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--store-primary)]/30 bg-[var(--store-primary)]/5 px-3 py-1.5 text-[10px] font-bold tracking-[.18em] text-[var(--store-primary)]">
              <Sparkles size={13} /> {settings.hero_eyebrow}
            </div>
            <h1 className="display-title mt-7">
              {heroLines.map((line, index) => (
                <span className={line.includes(settings.hero_accent) ? "text-[var(--store-primary)]" : undefined} key={`${line}-${index}`}>
                  {line}
                  {index < heroLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/65">{settings.hero_description}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#7affb9]/25 bg-[#7affb9]/[.07] px-3 py-2 text-xs font-semibold text-[#93ffc8]">
              <Box size={15} aria-hidden="true" /> ENVIAMOS PARA TODO O BRASIL
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {heroCtaAvailable && <Link href={storefrontPath(settings.hero_cta_path)} className="button-primary">
                {settings.hero_cta_label} <ArrowRight size={17} />
              </Link>}
              {supportChannels.map(({ id, label, href, Icon, buttonClassName }) => (
                <a key={id} className={buttonClassName} target="_blank" rel="noreferrer" href={href}>
                  <Icon aria-hidden="true" size={17} /> {label}
                </a>
              ))}
            </div>
            <div className="mt-10 flex items-center gap-4">
              <img src={logoSrc} onError={(event) => { if (event.currentTarget.src !== logoImage) setLogoSrc(logoImage); }} alt="Logo IAGO MODAS" className="h-12 w-12 rounded-full object-cover opacity-85" />
              <p className="border-l border-white/15 pl-4 text-xs leading-5 text-white/45">
                IAGO MODAS<br /><span className="text-white/70">MODA QUE REPRESENTA VOCÊ.</span>
              </p>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[600px] lg:mr-0">
            <div className="absolute -inset-12 rounded-full bg-[var(--store-primary)]/10 blur-[90px]" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#12171b] p-2 shadow-[0_25px_80px_rgba(0,0,0,.45)]">
              <img src={heroSrc} onError={() => setHeroSrc(heroImage)} alt="Modelo vestindo moda urbana IAGO MODAS" className="aspect-[4/4.6] w-full rounded-[1.55rem] object-cover object-right" />
              <div className="absolute bottom-8 left-8 rounded-xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur">
                <p className="text-[9px] font-bold tracking-[.2em] text-[var(--store-primary)]">CURADORIA IM</p>
                <p className="mt-1 text-sm font-semibold">Moda urbana premium</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_25%,rgba(59,255,160,.1),transparent_26%),linear-gradient(110deg,#0a0d10_0%,#0e1419_60%,#080a0c_100%)]" />
      </section>}

      {settings.benefits_visible && <section className="border-b border-white/10 bg-[var(--store-background)]">
        <div className="container grid divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, caption }) => (
            <div key={title} className="flex items-center gap-3 px-3 py-6 sm:px-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[.03] text-[var(--store-primary)]"><Icon size={17} /></span>
              <div><p className="text-sm font-semibold">{title}</p><p className="mt-0.5 text-xs text-white/45">{caption}</p></div>
            </div>
          ))}
        </div>
      </section>}

      {settings.promotion_visible && promotionAvailable && <section className="container py-16 md:py-24">
        <div className="offer-panel overflow-hidden rounded-[2rem] p-7 md:p-11">
          <div className="relative z-10 max-w-xl">
            <p className="eyebrow text-[var(--store-primary)]">{settings.promotion_eyebrow}</p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-tight sm:text-5xl">{settings.promotion_title}<br /><span className="text-white/55">{settings.promotion_accent}</span></h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/65">{settings.promotion_description}</p>
            <Link href={storefrontPath(settings.promotion_cta_path)} className="button-primary mt-7">{settings.promotion_cta_label} <ArrowRight size={17} /></Link>
          </div>
          <div className="absolute -bottom-24 -right-8 hidden h-80 w-80 rounded-full border-[38px] border-[var(--store-primary)]/15 lg:block" />
        </div>
      </section>}

      {settings.highlights_visible && highlights.length > 0 && <section className="container pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{settings.highlights_eyebrow}</p><h2 className="section-title mt-2">{settings.highlights_title}</h2></div>{highlightsCtaAvailable && <Link href={storefrontPath(settings.highlights_cta_path)} className="text-sm font-semibold text-[var(--store-primary)] transition hover:text-white">{settings.highlights_cta_label} <ArrowRight className="inline" size={15} /></Link>}</div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/52">{settings.highlights_description}</p>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">{highlights.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>}

      {settings.highlights_visible && highlights.length === 0 && <section className="container pb-16 pt-4 md:pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-white/[.025] p-7 md:p-10"><p className="eyebrow">CATÁLOGO</p><h2 className="section-title mt-2">NOVIDADES EM BREVE</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">A vitrine está sendo preparada com os próximos modelos. Fale com a loja para saber sobre disponibilidade e novidades.</p>{primarySupportChannel && <a href={primarySupportChannel.href} target="_blank" rel="noreferrer" className={`${primarySupportChannel.buttonClassName} mt-6`}><primarySupportChannel.Icon aria-hidden="true" size={17} /> {primarySupportChannel.label}</a>}</div>
      </section>}

      {settings.newsletter_visible && <section className="container py-16 md:py-24">
        <div className="grid items-center gap-8 rounded-[2rem] border border-white/10 bg-white/[.025] p-7 md:grid-cols-[1fr_auto] md:p-10"><div><p className="eyebrow">NOVIDADES</p><h2 className="section-title mt-2">{settings.newsletter_title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/55">{settings.newsletter_description}</p></div>{primarySupportChannel && <a href={primarySupportChannel.href} target="_blank" rel="noreferrer" className={`${primarySupportChannel.buttonClassName} justify-self-start md:justify-self-end`}><primarySupportChannel.Icon aria-hidden="true" size={17} /> {primarySupportChannel.label}</a>}</div>
      </section>}
      {primarySupportChannel && <a href={primarySupportChannel.href} target="_blank" rel="noreferrer" aria-label={primarySupportChannel.ariaLabel} className={primarySupportChannel.floatClassName}><primarySupportChannel.Icon aria-hidden="true" size={21} /><span>ATENDIMENTO</span></a>}
    </main>
  );
}
