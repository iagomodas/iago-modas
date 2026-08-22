import { buildShippingLabelDocument, type PostalAddress, type ShippingLabelData } from "@/lib/shippingLabel";
import { FileText, Printer, ShieldCheck } from "lucide-react";
import React, { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

type EditableAddress = PostalAddress & { phone: string };

export const SHIPPING_LABEL_ORDER_EVENT = "iago-label-order-selected";

const blankAddress: EditableAddress = { name: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", cep: "", phone: "" };

const initialLabel: ShippingLabelData = {
  orderNumber: "",
  recipient: { ...blankAddress },
  sender: { ...blankAddress, name: "IAGO MODAS" },
};

function AddressFields({ title, address, onChange, recipient }: { title: string; address: EditableAddress; onChange: (field: keyof EditableAddress, value: string) => void; recipient?: boolean }) {
  return (
    <fieldset className="grid gap-4 rounded-2xl border border-white/10 bg-black/15 p-4">
      <legend className="px-2 text-xs font-bold tracking-[.14em] text-[#82ffc5]">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo"><input required value={address.name} onChange={(event) => onChange("name", event.target.value)} className="admin-input" autoComplete={recipient ? "shipping name" : "name"} /></Field>
        <Field label="Telefone (opcional)"><input value={address.phone} onChange={(event) => onChange("phone", event.target.value)} className="admin-input" inputMode="tel" autoComplete={recipient ? "shipping tel" : "tel"} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
        <Field label="Rua, avenida ou logradouro"><input required value={address.street} onChange={(event) => onChange("street", event.target.value)} className="admin-input" autoComplete={recipient ? "shipping address-line1" : "address-line1"} /></Field>
        <Field label="Número"><input required value={address.number} onChange={(event) => onChange("number", event.target.value)} className="admin-input" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Complemento (opcional)"><input value={address.complement} onChange={(event) => onChange("complement", event.target.value)} className="admin-input" autoComplete={recipient ? "shipping address-line2" : "address-line2"} /></Field>
        <Field label="Bairro"><input required value={address.neighborhood} onChange={(event) => onChange("neighborhood", event.target.value)} className="admin-input" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_88px_150px]">
        <Field label="Cidade"><input required value={address.city} onChange={(event) => onChange("city", event.target.value)} className="admin-input" autoComplete={recipient ? "shipping address-level2" : "address-level2"} /></Field>
        <Field label="UF"><input required value={address.state} onChange={(event) => onChange("state", event.target.value.toUpperCase().slice(0, 2))} className="admin-input uppercase" maxLength={2} autoComplete={recipient ? "shipping address-level1" : "address-level1"} /></Field>
        <Field label="CEP"><input required value={address.cep} onChange={(event) => onChange("cep", event.target.value)} className="admin-input" inputMode="numeric" autoComplete={recipient ? "shipping postal-code" : "postal-code"} placeholder="00000-000" /></Field>
      </div>
    </fieldset>
  );
}

export function ShippingLabelGenerator() {
  const [label, setLabel] = useState<ShippingLabelData>(initialLabel);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const loadSelectedOrder = () => {
      const raw = window.sessionStorage.getItem("oversized-label-order");
      if (!raw) return;
      try {
        const order = JSON.parse(raw) as Record<string, string | null>;
        if (order.delivery_mode && order.delivery_mode !== "correios") {
          setNotice("A etiqueta é somente para pedidos de fora da cidade enviados pelos Correios.");
          return;
        }
        setLabel((current) => ({
          ...current,
          orderNumber: order.order_number ?? "",
          recipient: {
            ...current.recipient,
            name: order.customer_name ?? "",
            street: order.address ?? "",
            number: order.delivery_number ?? "",
            complement: order.delivery_complement ?? "",
            neighborhood: order.delivery_neighborhood ?? "",
            city: order.delivery_city ?? "",
            state: order.delivery_state ?? "",
            cep: order.postal_code ?? "",
            phone: order.customer_phone ?? "",
          },
        }));
        setNotice("Dados do pedido carregados. Confira antes de imprimir.");
      } catch {
        window.sessionStorage.removeItem("oversized-label-order");
      }
    };

    loadSelectedOrder();
    window.addEventListener(SHIPPING_LABEL_ORDER_EVENT, loadSelectedOrder);
    return () => window.removeEventListener(SHIPPING_LABEL_ORDER_EVENT, loadSelectedOrder);
  }, []);

  const updateAddress = (role: "recipient" | "sender", field: keyof EditableAddress, value: string) => setLabel((current) => ({ ...current, [role]: { ...current[role], [field]: value } }));

  function printLabel(event: FormEvent) {
    event.preventDefault();
    const documentHtml = buildShippingLabelDocument(label);
    const documentBlob = new Blob([documentHtml], { type: "text/html;charset=utf-8" });
    const documentUrl = URL.createObjectURL(documentBlob);
    const safeOrderNumber = label.orderNumber.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "pedido";
    const downloadLink = document.createElement("a");
    downloadLink.href = documentUrl;
    downloadLink.download = `etiqueta-${safeOrderNumber}.html`;
    downloadLink.rel = "noopener";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    const printWindow = window.open(documentUrl, "_blank");
    if (!printWindow) {
      window.setTimeout(() => URL.revokeObjectURL(documentUrl), 60_000);
      setNotice("A etiqueta foi baixada. Abra o arquivo HTML baixado para imprimir; o navegador bloqueou a janela automática.");
      return;
    }

    printWindow.opener = null;
    printWindow.addEventListener("load", () => {
      printWindow.focus();
      window.setTimeout(() => printWindow.print(), 250);
    }, { once: true });
    window.setTimeout(() => URL.revokeObjectURL(documentUrl), 60_000);
    setNotice("Etiqueta baixada e aberta para impressão. Confira os dados antes de imprimir e colar na embalagem.");
  }

  return (
    <section id="labels" className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/[.035] p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#82ffc5]"><FileText size={19} /><p className="text-xs font-bold tracking-[.18em]">POSTAGEM MANUAL</p></div>
          <h2 className="mt-2 font-display text-2xl">Gerar etiqueta de endereço</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">Use somente para pedidos de fora da cidade enviados pelos Correios. A etiqueta será baixada e depois aberta para impressão.</p>
        </div>
        <div className="flex max-w-sm gap-2 rounded-xl border border-[#82ffc5]/15 bg-[#82ffc5]/[.05] p-3 text-xs leading-5 text-white/65"><ShieldCheck className="mt-0.5 shrink-0 text-[#82ffc5]" size={16} />Esta ferramenta não gera código de rastreio. O código oficial é entregue pelos Correios após a postagem.</div>
      </div>
      <form onSubmit={printLabel} className="mt-7 grid gap-5">
        <Field label="Número do pedido (opcional)"><input value={label.orderNumber} onChange={(event) => setLabel((current) => ({ ...current, orderNumber: event.target.value }))} className="admin-input max-w-sm" placeholder="Ex.: IM-2026-001" /></Field>
        <AddressFields title="DADOS DE QUEM VAI RECEBER" address={label.recipient as EditableAddress} onChange={(field, value) => updateAddress("recipient", field, value)} recipient />
        <AddressFields title="DADOS DE QUEM ESTÁ ENVIANDO" address={label.sender as EditableAddress} onChange={(field, value) => updateAddress("sender", field, value)} />
        <div className="flex flex-wrap items-center gap-4">
          <Button className="bg-[#82ffc5] text-black hover:bg-white"><Printer className="mr-2" size={16} />BAIXAR E IMPRIMIR ETIQUETA</Button>
          <p className="max-w-2xl text-xs leading-5 text-white/45">Depois de postar, guarde o comprovante e envie o código de rastreio ao cliente pelo canal de atendimento da loja.</p>
        </div>
        {notice && <p role="status" className="rounded-xl border border-[#82ffc5]/20 bg-[#82ffc5]/[.06] px-4 py-3 text-sm text-white/80">{notice}</p>}
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm text-white/70"><span>{label}</span>{children}</label>;
}
