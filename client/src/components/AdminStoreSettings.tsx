import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { StorefrontImagePicker } from "@/components/StorefrontImagePicker";
import { supabase } from "@/lib/supabase";
import { type StorefrontSaveSection, type StorefrontSettings } from "@/lib/storefront";
import { CreditCard, Loader2, MessageCircle, Rocket, Save, Truck } from "lucide-react";
import React, { type ReactNode, useEffect, useState } from "react";

type StorefrontField = keyof StorefrontSettings;

type Props = {
  draft: StorefrontSettings;
  onFieldChange: (key: StorefrontField, value: string | boolean) => void;
  onSave: (section: StorefrontSaveSection) => Promise<boolean>;
  saving: boolean;
  error: string | null;
  onRefresh?: () => Promise<void> | void;
};

export function AdminStoreSettings({ draft, onFieldChange, onSave, saving, error }: Props) {
  const changeWhatsAppNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    onFieldChange("whatsapp_number", number);
    onFieldChange("whatsapp_enabled", Boolean(number));
  };

  return (
    <>
      <section id="support" className="scroll-mt-24 rounded-3xl border border-[#82ffc5]/20 bg-[#82ffc5]/[.035] p-6 md:p-7">
        <SectionTitle icon={<MessageCircle size={19} />} eyebrow="ATENDIMENTO" title="Instagram e WhatsApp" description="Preencha os canais que quer mostrar e salve aqui mesmo. O botão fica logo abaixo, sem precisar procurar no fim da página." />
        <form onSubmit={(event) => { event.preventDefault(); void onSave("contact"); }} className="mt-6">
          <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 md:grid-cols-2">
            <SettingsField label="Usuário do Instagram"><input value={draft.instagram_handle} onChange={(event) => onFieldChange("instagram_handle", event.target.value.replace(/^@/, ""))} className="admin-input" placeholder="iagomodas9" /></SettingsField>
            <SettingsField label="Número do WhatsApp (DDD + número)"><input value={draft.whatsapp_number} onChange={(event) => changeWhatsAppNumber(event.target.value)} inputMode="tel" className="admin-input" placeholder="Ex.: 82999999999" /></SettingsField>
            <Toggle checked={draft.instagram_enabled} onChange={(checked) => onFieldChange("instagram_enabled", checked)} label="Exibir Instagram para clientes" />
            <Toggle checked={draft.whatsapp_enabled} onChange={(checked) => onFieldChange("whatsapp_enabled", checked)} label="Exibir WhatsApp para clientes" disabled={!draft.whatsapp_number} />
            <p className="md:col-span-2 text-xs leading-5 text-white/55">Use apenas números no WhatsApp. Ao informar o número, o WhatsApp fica ativo automaticamente. Para mostrar somente o WhatsApp, desmarque o Instagram antes de salvar. Você também pode deixar os dois ativos.</p>
          </div>
          <SaveButton saving={saving} label="SALVAR ATENDIMENTO" type="submit" />
          {error && <ErrorText message={error} />}
        </form>
      </section>

      <section id="payments-delivery" className="mt-8 scroll-mt-24 rounded-3xl border border-white/10 bg-white/[.035] p-6 md:p-7">
        <SectionTitle icon={<CreditCard size={19} />} eyebrow="PAGAMENTO E ENTREGA" title="Pix, cidade e opções de recebimento" description="A chave Pix e as informações de retirada ou entrega ficam reunidas nesta área. Salve logo abaixo ao terminar." />
        <form onSubmit={(event) => { event.preventDefault(); void onSave("delivery"); }} className="mt-6">
          <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 md:grid-cols-2">
            <SettingsField label="Chave Pix"><input value={draft.pix_key} onChange={(event) => onFieldChange("pix_key", event.target.value)} className="admin-input" placeholder="E-mail, CPF, telefone ou chave aleatória" /></SettingsField>
            <SettingsField label="Cidade para entrega ou retirada"><input value={draft.local_city} onChange={(event) => onFieldChange("local_city", event.target.value)} className="admin-input" /></SettingsField>
            <SettingsField label="UF da cidade"><input value={draft.local_state} onChange={(event) => onFieldChange("local_state", event.target.value.toUpperCase().slice(0, 2))} maxLength={2} className="admin-input" /></SettingsField>
            <SettingsField label="Texto da retirada local"><input value={draft.local_pickup_label} onChange={(event) => onFieldChange("local_pickup_label", event.target.value)} className="admin-input" /></SettingsField>
            <SettingsField label="Texto da entrega na cidade"><input value={draft.local_delivery_label} onChange={(event) => onFieldChange("local_delivery_label", event.target.value)} className="admin-input" /></SettingsField>
            <SettingsField label="Texto para pedidos de outra cidade"><input value={draft.outside_delivery_label} onChange={(event) => onFieldChange("outside_delivery_label", event.target.value)} className="admin-input" /></SettingsField>
            <SettingsField label="Aviso de frete para outra cidade" className="md:col-span-2"><textarea value={draft.outside_delivery_notice} onChange={(event) => onFieldChange("outside_delivery_notice", event.target.value)} className="admin-input min-h-20 py-2" /></SettingsField>
            <Toggle checked={draft.local_pickup_enabled} onChange={(checked) => onFieldChange("local_pickup_enabled", checked)} label="Permitir retirada local" />
            <Toggle checked={draft.local_delivery_enabled} onChange={(checked) => onFieldChange("local_delivery_enabled", checked)} label="Permitir entrega na cidade" />
          </div>
          <SaveButton saving={saving} label="SALVAR PIX E ENTREGA" type="submit" />
          {error && <ErrorText message={error} />}
        </form>
      </section>

      <section id="storefront" className="mt-8 scroll-mt-24 rounded-3xl border border-white/10 bg-white/[.035] p-6 md:p-7">
        <SectionTitle icon={<Save size={19} />} eyebrow="VITRINE PÚBLICA" title="Textos e aparência da loja" description="Abra somente a parte que quer mudar. Cada parte tem seu próprio botão de salvar." />
        <div className="mt-6">
          <Accordion type="single" collapsible defaultValue="home" className="rounded-2xl border border-white/10 bg-black/20 px-5">
            <SettingsGroup value="home" title="Página inicial" description="Logo, aviso, imagem, cores e seções principais.">
              <div className="grid gap-4 md:grid-cols-2">
                <StorefrontImagePicker label="Logo da loja" description="Escolha a logo na galeria. Não precisa copiar endereço de imagem." value={draft.logo_url ?? ""} onChange={(value) => onFieldChange("logo_url", value)} disabled={saving} />
                <StorefrontImagePicker label="Imagem principal" description="Escolha a foto de destaque da página inicial pela galeria." value={draft.hero_image_url ?? ""} onChange={(value) => onFieldChange("hero_image_url", value)} disabled={saving} />
                <SettingsField label="Aviso no topo" className="md:col-span-2"><textarea value={draft.announcement_text} onChange={(event) => onFieldChange("announcement_text", event.target.value)} className="admin-input min-h-20 py-2" /></SettingsField>
                <SettingsField label="Etiqueta acima do título"><input value={draft.hero_eyebrow} onChange={(event) => onFieldChange("hero_eyebrow", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Palavra em verde"><input value={draft.hero_accent} onChange={(event) => onFieldChange("hero_accent", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Título principal" className="md:col-span-2"><textarea value={draft.hero_title} onChange={(event) => onFieldChange("hero_title", event.target.value)} className="admin-input min-h-20 py-2" /></SettingsField>
                <SettingsField label="Texto principal" className="md:col-span-2"><textarea value={draft.hero_description} onChange={(event) => onFieldChange("hero_description", event.target.value)} className="admin-input min-h-20 py-2" /></SettingsField>
                <SettingsField label="Texto do botão principal"><input value={draft.hero_cta_label} onChange={(event) => onFieldChange("hero_cta_label", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Destino do botão"><input value={draft.hero_cta_path} onChange={(event) => onFieldChange("hero_cta_path", event.target.value)} className="admin-input" placeholder="/categoria/camisetas" /></SettingsField>
                <SettingsField label="Cor principal"><input type="color" value={draft.primary_color} onChange={(event) => onFieldChange("primary_color", event.target.value)} className="h-11 w-full cursor-pointer rounded-lg border border-white/10 bg-black/30 p-1" /></SettingsField>
                <SettingsField label="Cor de fundo"><input type="color" value={draft.background_color} onChange={(event) => onFieldChange("background_color", event.target.value)} className="h-11 w-full cursor-pointer rounded-lg border border-white/10 bg-black/30 p-1" /></SettingsField>
              </div>
              <VisibilityControls draft={draft} onFieldChange={onFieldChange} />
              <SaveButton saving={saving} label="SALVAR PÁGINA INICIAL" onClick={() => { void onSave("home"); }} />
            </SettingsGroup>

            <SettingsGroup value="catalog" title="Promoção, destaques e categorias" description="Textos que aparecem acima dos produtos da loja.">
              <div className="grid gap-4 md:grid-cols-2">
                <SettingsField label="Etiqueta da promoção"><input value={draft.promotion_eyebrow} onChange={(event) => onFieldChange("promotion_eyebrow", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Título da promoção"><input value={draft.promotion_title} onChange={(event) => onFieldChange("promotion_title", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Destaque da promoção"><input value={draft.promotion_accent} onChange={(event) => onFieldChange("promotion_accent", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Texto do botão da promoção"><input value={draft.promotion_cta_label} onChange={(event) => onFieldChange("promotion_cta_label", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Destino do botão da promoção"><input value={draft.promotion_cta_path} onChange={(event) => onFieldChange("promotion_cta_path", event.target.value)} className="admin-input" placeholder="/produto/nome-do-produto" /></SettingsField>
                <SettingsField label="Descrição da promoção" className="md:col-span-2"><textarea value={draft.promotion_description} onChange={(event) => onFieldChange("promotion_description", event.target.value)} className="admin-input min-h-20 py-2" /></SettingsField>
                <SettingsField label="Etiqueta dos destaques"><input value={draft.highlights_eyebrow} onChange={(event) => onFieldChange("highlights_eyebrow", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Título dos destaques"><input value={draft.highlights_title} onChange={(event) => onFieldChange("highlights_title", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Texto do botão dos destaques"><input value={draft.highlights_cta_label} onChange={(event) => onFieldChange("highlights_cta_label", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Destino do botão dos destaques"><input value={draft.highlights_cta_path} onChange={(event) => onFieldChange("highlights_cta_path", event.target.value)} className="admin-input" placeholder="/categoria/camisetas" /></SettingsField>
                <SettingsField label="Etiqueta das categorias"><input value={draft.categories_eyebrow} onChange={(event) => onFieldChange("categories_eyebrow", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Título das categorias"><input value={draft.categories_title} onChange={(event) => onFieldChange("categories_title", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Descrição dos destaques" className="md:col-span-2"><textarea value={draft.highlights_description} onChange={(event) => onFieldChange("highlights_description", event.target.value)} className="admin-input min-h-20 py-2" /></SettingsField>
                <SettingsField label="Descrição das categorias" className="md:col-span-2"><textarea value={draft.categories_description} onChange={(event) => onFieldChange("categories_description", event.target.value)} className="admin-input min-h-20 py-2" /></SettingsField>
              </div>
              <SaveButton saving={saving} label="SALVAR PROMOÇÃO E CATÁLOGO" onClick={() => { void onSave("catalog"); }} />
            </SettingsGroup>

            <SettingsGroup value="footer" title="Benefícios e rodapé" description="Textos de confiança, novidades e informações no final da loja.">
              <div className="grid gap-4 md:grid-cols-2">
                <SettingsField label="Benefício 1"><input value={draft.benefit_one_title} onChange={(event) => onFieldChange("benefit_one_title", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Texto do benefício 1"><input value={draft.benefit_one_caption} onChange={(event) => onFieldChange("benefit_one_caption", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Benefício 2"><input value={draft.benefit_two_title} onChange={(event) => onFieldChange("benefit_two_title", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Texto do benefício 2"><input value={draft.benefit_two_caption} onChange={(event) => onFieldChange("benefit_two_caption", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Benefício 3"><input value={draft.benefit_three_title} onChange={(event) => onFieldChange("benefit_three_title", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Texto do benefício 3"><input value={draft.benefit_three_caption} onChange={(event) => onFieldChange("benefit_three_caption", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Benefício 4"><input value={draft.benefit_four_title} onChange={(event) => onFieldChange("benefit_four_title", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Texto do benefício 4"><input value={draft.benefit_four_caption} onChange={(event) => onFieldChange("benefit_four_caption", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Descrição do rodapé" className="md:col-span-2"><textarea value={draft.footer_description} onChange={(event) => onFieldChange("footer_description", event.target.value)} className="admin-input min-h-20 py-2" /></SettingsField>
                <SettingsField label="Localização da loja (opcional)"><input value={draft.footer_location} onChange={(event) => onFieldChange("footer_location", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Horário de atendimento (opcional)"><input value={draft.footer_hours} onChange={(event) => onFieldChange("footer_hours", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Título de novidades"><input value={draft.newsletter_title} onChange={(event) => onFieldChange("newsletter_title", event.target.value)} className="admin-input" /></SettingsField>
                <SettingsField label="Texto de novidades"><input value={draft.newsletter_description} onChange={(event) => onFieldChange("newsletter_description", event.target.value)} className="admin-input" /></SettingsField>
              </div>
              <SaveButton saving={saving} label="SALVAR BENEFÍCIOS E RODAPÉ" onClick={() => { void onSave("footer"); }} />
            </SettingsGroup>
          </Accordion>
          {error && <ErrorText message={error} />}
        </div>
      </section>

    </>
  );
}

export function FutureCommerceSettings({ draft, onFieldChange, onSave, saving, error, onRefresh }: Props) {
  const [activationMessage, setActivationMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState({ mercadoPago: false, correios: false });
  const [connecting, setConnecting] = useState<"payment" | "shipping" | null>(null);
  const [credentials, setCredentials] = useState({ accessToken: "", webhookSecret: "", correiosToken: "" });
  const [futureFeedback, setFutureFeedback] = useState<{ target: "payment" | "shipping"; area: "connection" | "activation"; message: string } | null>(null);
  const paymentAutomatic = draft.future_payments_enabled && draft.future_webhook_enabled;
  const shippingAutomatic = draft.future_shipping_quotes_enabled;
  const currentModeSummary = [
    paymentAutomatic ? "Pagamento automático ativo." : "Modo manual atual: Pix manual e dinheiro local.",
    shippingAutomatic ? "Frete automático ativo." : "Frete combinado pelo atendimento.",
  ].join(" ");

  const showFutureFeedback = (target: "payment" | "shipping", area: "connection" | "activation", message: string) => {
    setFutureFeedback({ target, area, message });
    setActivationMessage(message);
  };

  const refreshConnectionStatus = async () => {
    if (!supabase) return;
    const { data, error: statusError } = await supabase.functions.invoke("future-commerce-credentials", { body: { action: "status" } });
    if (statusError || !data) return;
    setConnectionStatus({ mercadoPago: data.mercadoPago === true, correios: data.correios === true });
  };

  useEffect(() => { void refreshConnectionStatus(); }, []);

  const configureAutomatically = async (target: "payment" | "shipping") => {
    if (target === "payment" && (!credentials.accessToken.trim() || !credentials.webhookSecret.trim())) {
      showFutureFeedback("payment", "connection", "Preencha o token de acesso e a assinatura de notificações do Mercado Pago. Quando os dois campos estiverem completos, a loja valida e ativa automaticamente.");
      return;
    }
    if (target === "shipping" && !credentials.correiosToken.trim()) {
      showFutureFeedback("shipping", "connection", "Preencha o token oficial dos Correios. Quando os dados estiverem completos, a loja valida e ativa automaticamente.");
      return;
    }
    if (target === "shipping" && !/^\d{8}$/.test(draft.shipping_origin_postal_code)) {
      showFutureFeedback("shipping", "connection", "Informe o CEP de origem da loja com 8 números. Depois disso, a loja valida e ativa a cotação automaticamente.");
      return;
    }
    if (target === "shipping" && !/^[A-Za-z0-9]{2,20}$/.test(draft.future_correios_service_code)) {
      showFutureFeedback("shipping", "connection", "Informe o código de serviço do contrato dos Correios. Depois disso, a loja valida e ativa a cotação automaticamente.");
      return;
    }
    if (!supabase) {
      showFutureFeedback(target, "connection", "A conexão segura ainda não está disponível. A loja continua no fluxo manual.");
      return;
    }
    setConnecting(target);
    setFutureFeedback(null);
    setActivationMessage(null);
    try {
      const saved = await onSave("future");
      if (!saved) {
        showFutureFeedback(target, "connection", "Os dados não foram confirmados pelo banco. Confira a conexão e tente novamente. Nada foi ativado.");
        return;
      }
      const body = target === "payment"
        ? { action: "connect", target, accessToken: credentials.accessToken, webhookSecret: credentials.webhookSecret }
        : { action: "connect", target, bearerToken: credentials.correiosToken };
      const { data, error: invokeError } = await supabase.functions.invoke("future-commerce-credentials", { body });
      const result = data as { message?: string; error?: string } | null;
      if (invokeError || result?.error) throw new Error(result?.error || invokeError.message);
      setCredentials((current) => target === "payment" ? { ...current, accessToken: "", webhookSecret: "" } : { ...current, correiosToken: "" });
      const { data: activationData, error: activationError } = await supabase.functions.invoke("future-commerce-activation-v2", { body: { target, action: "activate" } });
      const activation = activationData as { active?: boolean; message?: string; missing?: string[]; error?: string } | null;
      if (activationError || activation?.error || !activation?.active) {
        const missing = activation?.missing?.length ? ` Falta: ${activation.missing.map(simpleRequirement).join(" e ")}.` : "";
        throw new Error(`${activation?.message ?? "A conta foi guardada, mas ainda não foi confirmada para ativação."}${missing}`);
      }
      showFutureFeedback(target, "connection", target === "payment"
        ? "Mercado Pago confirmado: o pagamento automático está ativo."
        : "Correios confirmados: a cotação automática está ativa.");
      await refreshConnectionStatus();
      await onRefresh?.();
    } catch (configurationError) {
      const message = await activationFailureMessage(configurationError, target);
      showFutureFeedback(target, "connection", target === "payment"
        ? `O Mercado Pago não foi ativado. ${message}`
        : `Os Correios não foram ativados. ${message}`);
    } finally {
      setConnecting(null);
    }
  };

  const configureAll = async () => {
    const hasPaymentData = Boolean(credentials.accessToken.trim() || credentials.webhookSecret.trim());
    const hasShippingData = Boolean(credentials.correiosToken.trim() || draft.shipping_origin_postal_code || draft.future_correios_service_code);
    if (!hasPaymentData && !hasShippingData) {
      setActivationMessage("Preencha as credenciais oficiais que deseja configurar e toque em salvar. O site valida e ativa automaticamente somente o serviço confirmado.");
      return;
    }
    if (hasPaymentData) await configureAutomatically("payment");
    if (hasShippingData) await configureAutomatically("shipping");
  };

  const returnToManualMode = async (target: "payment" | "shipping") => {
    if (!supabase) {
      showFutureFeedback(target, "connection", "A conexão segura ainda não está disponível. O modo manual continua ativo.");
      return;
    }
    setConnecting(target);
    setFutureFeedback(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("future-commerce-credentials", { body: { action: "remove", target } });
      const result = data as { message?: string; error?: string } | null;
      if (invokeError || result?.error) throw new Error(result?.error || invokeError.message);
      setCredentials((current) => target === "payment" ? { ...current, accessToken: "", webhookSecret: "" } : { ...current, correiosToken: "" });
      showFutureFeedback(target, "connection", result?.message ?? "Modo manual ativo novamente.");
      await refreshConnectionStatus();
      await onRefresh?.();
    } catch {
      showFutureFeedback(target, "connection", "Não foi possível voltar ao modo manual agora. A loja continua protegida; tente novamente.");
    } finally {
      setConnecting(null);
    }
  };

	return <section id="future" className="mt-8 scroll-mt-24 rounded-3xl border border-dashed border-[#82ffc5]/30 bg-[#82ffc5]/[.025] p-6 md:p-7">
	      <SectionTitle icon={<Rocket size={19} />} eyebrow="PREPARAÇÃO FUTURA" title="Configure uma vez. Depois funciona sozinho." description="Cole as informações oficiais abaixo e salve. O site confere tudo e ativa automaticamente o que estiver correto — sem programação e sem botão extra." />
	      <p className="mt-5 rounded-2xl border border-[#82ffc5]/20 bg-[#82ffc5]/[.05] px-4 py-3 text-sm leading-6 text-[#d9ffeb]"><strong>PRONTO PARA CONFIGURAR:</strong> esta área já está ligada dentro do site. Quando houver uma credencial oficial válida, ela é confirmada pelo servidor e o recurso correspondente passa a funcionar automaticamente.</p>
	      <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white/75"><strong>COMO A LOJA ESTÁ AGORA:</strong> {currentModeSummary}</p>
	      <form onSubmit={(event) => { event.preventDefault(); void configureAll(); }} className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <DirectSetupCard title="Mercado Pago" connected={connectionStatus.mercadoPago} active={draft.future_payments_enabled && draft.future_webhook_enabled} busy={connecting === "payment"} feedback={futureFeedback?.target === "payment" && futureFeedback.area === "connection" ? futureFeedback.message : null} onReturnToManual={() => { void returnToManualMode("payment"); }}>
            <SettingsField label="Token de acesso da conta oficial"><input type="password" autoComplete="off" spellCheck={false} value={credentials.accessToken} onChange={(event) => setCredentials((current) => ({ ...current, accessToken: event.target.value }))} className="admin-input" placeholder="Cole o token aqui" /></SettingsField>
            <SettingsField label="Assinatura de notificações"><input type="password" autoComplete="off" spellCheck={false} value={credentials.webhookSecret} onChange={(event) => setCredentials((current) => ({ ...current, webhookSecret: event.target.value }))} className="admin-input" placeholder="Cole a assinatura aqui" /></SettingsField>
          </DirectSetupCard>
          <DirectSetupCard title="Correios" connected={connectionStatus.correios} active={draft.future_shipping_quotes_enabled} busy={connecting === "shipping"} feedback={futureFeedback?.target === "shipping" && futureFeedback.area === "connection" ? futureFeedback.message : null} onReturnToManual={() => { void returnToManualMode("shipping"); }}>
            <SettingsField label="Token oficial da API dos Correios"><input type="password" autoComplete="off" spellCheck={false} value={credentials.correiosToken} onChange={(event) => setCredentials((current) => ({ ...current, correiosToken: event.target.value }))} className="admin-input" placeholder="Cole o token aqui" /></SettingsField>
            <p className="text-xs leading-5 text-white/55">Se os Correios renovarem o token, basta colar o novo token neste mesmo campo e salvar novamente.</p>
          </DirectSetupCard>
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs font-bold tracking-[.16em] text-[#82ffc5]">DADOS PARA CALCULAR O FRETE DOS CORREIOS</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <SettingsField label="CEP de origem da loja"><input value={draft.shipping_origin_postal_code} onChange={(event) => onFieldChange("shipping_origin_postal_code", event.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" className="admin-input" placeholder="Ex.: 57980000" /></SettingsField>
            <SettingsField label="Código de serviço dos Correios"><input value={draft.future_correios_service_code} onChange={(event) => onFieldChange("future_correios_service_code", event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20))} className="admin-input" placeholder="Informado no contrato" /></SettingsField>
          </div>
          <p className="mt-4 text-xs leading-5 text-white/55">O código de serviço vem no contrato dos Correios e não é senha. Ao salvar com a credencial oficial, a cotação é ativada automaticamente depois da confirmação segura. Para voltar ao frete combinado, remova a credencial dos Correios.</p>
        </div>
        <SaveButton saving={saving || connecting !== null} label="SALVAR CONFIGURAÇÃO E ATIVAR AUTOMATICAMENTE" type="submit" />
        </form>
        {activationMessage && <p role="status" className="mt-5 rounded-xl border border-[#82ffc5]/20 bg-black/20 px-4 py-3 text-sm leading-6 text-white/75">{activationMessage}</p>}
        {error && <ErrorText message={error} />}
        <details className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
          <summary className="cursor-pointer text-sm font-semibold text-white">Como usar quando as contas oficiais existirem</summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-white/60"><li>Crie a conta oficial do Mercado Pago ou contrate a solução dos Correios no nome do responsável.</li><li>Cole as credenciais no quadro correto. Depois de confirmadas, elas não ficam visíveis.</li><li>Para os Correios, informe o CEP de origem e o código de serviço que vier no contrato.</li><li>Toque uma vez em salvar. O checkout muda automaticamente depois da confirmação segura do servidor.</li></ol>
        </details>
      </section>;
}

function simpleRequirement(item: string): string {
  if (item.includes("MP_ACCESS_TOKEN") || item.includes("MP_WEBHOOK_SECRET")) return "as credenciais oficiais do Mercado Pago no ambiente seguro";
  if (item.includes("CORREIOS_BEARER_TOKEN")) return "a credencial oficial dos Correios no ambiente seguro";
  if (item.includes("SITE_URL")) return "a URL pública segura da loja no servidor";
  if (item.includes("CEP")) return "o CEP de origem da loja";
  if (item.includes("provedor")) return "o provedor correto no planejamento";
  return "um requisito oficial da integração";
}

async function activationFailureMessage(error: unknown, target: "payment" | "shipping"): Promise<string> {
  const integration = target === "payment" ? "o pagamento automático" : "o frete automático";
  const fallback = `O servidor manteve ${integration} desativado porque a conta oficial ainda não foi confirmada. A loja continua em Pix manual, dinheiro local e frete combinado.`;
  const context = typeof error === "object" && error !== null && "context" in error ? (error as { context?: unknown }).context : null;
  if (!(context instanceof Response)) return fallback;
  try {
    const payload = await context.clone().json() as { message?: unknown; missing?: unknown };
    const missing = Array.isArray(payload.missing)
      ? Array.from(new Set(payload.missing.filter((item): item is string => typeof item === "string").map(simpleRequirement)))
      : [];
    const requirementHint = missing.length ? ` Ainda falta configurar ${missing.join(" e ")}.` : "";
    const message = typeof payload.message === "string" && payload.message.trim()
      ? payload.message.trim()
      : `O servidor manteve ${integration} desativado.`;
    return `${message}${requirementHint} A loja continua em Pix manual, dinheiro local e frete combinado.`;
  } catch {
    return fallback;
  }
}

function SettingsGroup({ value, title, description, children }: { value: string; title: string; description: string; children: ReactNode }) {
  return <AccordionItem value={value} className="border-white/10"><AccordionTrigger className="py-5 no-underline hover:no-underline"><span><span className="block text-sm font-semibold text-white">{title}</span><span className="mt-1 block text-xs font-normal leading-5 text-white/50">{description}</span></span></AccordionTrigger><AccordionContent className="pb-6">{children}</AccordionContent></AccordionItem>;
}

function VisibilityControls({ draft, onFieldChange }: Pick<Props, "draft" | "onFieldChange">) {
  const controls = [["hero_visible", "Banner principal"], ["promotion_visible", "Promoção da semana"], ["highlights_visible", "Destaques"], ["benefits_visible", "Benefícios"], ["newsletter_visible", "Novidades"]] as const;
  return <div className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:grid-cols-2"><p className="text-xs font-bold tracking-[.16em] text-[#82ffc5] sm:col-span-2">SEÇÕES VISÍVEIS NA HOME</p>{controls.map(([key, label]) => <Toggle key={key} checked={draft[key]} onChange={(checked) => onFieldChange(key, checked)} label={label} />)}</div>;
}

function SaveButton({ saving, label, onClick, type = "button" }: { saving: boolean; label: string; onClick?: () => void; type?: "button" | "submit" }) {
  return <Button type={type} onClick={onClick} disabled={saving} className="mt-5 bg-[#82ffc5] text-black hover:bg-white">{saving ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Save className="mr-2" size={16} />}{label}</Button>;
}

function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (checked: boolean) => void; label: string; disabled?: boolean }) {
  return <label className="flex items-center gap-3 text-sm text-white/75"><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />{label}</label>;
}

function SettingsField({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`grid gap-1.5 text-sm text-white/70 ${className}`}><span>{label}</span>{children}</label>;
}

function SectionTitle({ icon, eyebrow, title, description }: { icon: ReactNode; eyebrow: string; title: string; description: string }) {
  return <div><div className="flex items-center gap-2 text-[#82ffc5]">{icon}<p className="text-xs font-bold tracking-[.18em]">{eyebrow}</p></div><h2 className="mt-2 font-display text-2xl text-white">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">{description}</p></div>;
}

function ErrorText({ message }: { message: string }) {
  return <p className="mt-5 rounded-xl border border-red-300/20 bg-red-300/[.06] px-4 py-3 text-sm text-red-100">{message}</p>;
}

function ReadinessCard({ active, icon, title, status, items }: { active: boolean; icon: ReactNode; title: string; status: string; items: string[] }) {
  return <article className="rounded-2xl border border-white/10 bg-black/20 p-5"><div className="flex items-center gap-3 text-[#82ffc5]"><span>{icon}</span><p className="text-sm font-semibold text-white">{title}</p></div><p className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${active ? "border-[#82ffc5]/20 bg-[#82ffc5]/[.07] text-[#a5ffd1]" : "border-amber-200/20 bg-amber-200/[.07] text-amber-100"}`}>{status}</p><ul className="mt-4 space-y-2 text-sm leading-5 text-white/60">{items.map((item) => <li key={item}>• {item}</li>)}</ul></article>;
}

function DirectSetupCard({ title, connected, active, busy, feedback, onReturnToManual, children }: { title: string; connected: boolean; active: boolean; busy: boolean; feedback: string | null; onReturnToManual: () => void; children: ReactNode }) {
  const label = active ? "INTEGRAÇÃO AUTOMÁTICA ATIVA" : "PREPARAÇÃO LIGADA — AGUARDANDO CREDENCIAIS";
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-5"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-white">{title}</p><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${active ? "border-[#82ffc5]/20 bg-[#82ffc5]/[.07] text-[#a5ffd1]" : "border-[#82ffc5]/20 bg-[#82ffc5]/[.04] text-[#b4ffda]"}`}>{label}</span></div><div className="mt-4 grid gap-3">{children}</div><p className="mt-4 text-xs leading-5 text-white/55">{connected ? "A credencial está guardada de forma criptografada e não aparece de novo nesta tela." : "Os dados serão enviados por conexão protegida, guardados de forma criptografada e nunca aparecerão de novo nesta tela."}</p>{active && <Button type="button" variant="outline" disabled={busy} onClick={onReturnToManual} className="mt-4 border-white/20 text-white hover:bg-white/10">{busy ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}VOLTAR AO MODO MANUAL</Button>}{feedback && <p role="status" className="mt-3 rounded-lg border border-amber-200/20 bg-amber-200/[.06] px-3 py-2 text-xs leading-5 text-amber-50">{feedback}</p>}</div>;
}
