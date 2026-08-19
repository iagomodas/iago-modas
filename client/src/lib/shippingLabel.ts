export type PostalAddress = {
  name: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  phone?: string;
};

export type ShippingLabelData = {
  orderNumber: string;
  recipient: PostalAddress;
  sender: PostalAddress;
};

const clean = (value: string) => value.trim();

export function formatPostalAddress(address: PostalAddress) {
  const streetLine = [clean(address.street), clean(address.number)].filter(Boolean).join(", ");
  const localityLine = [clean(address.neighborhood), [clean(address.city), clean(address.state)].filter(Boolean).join(" – ")].filter(Boolean).join(" · ");
  const lines = [clean(address.name), streetLine, clean(address.complement), localityLine, `CEP ${clean(address.cep)}`].filter(Boolean);

  if (clean(address.phone ?? "")) lines.push(`Telefone: ${clean(address.phone ?? "")}`);
  return lines;
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function addressMarkup(address: PostalAddress) {
  return formatPostalAddress(address).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

export function buildShippingLabelDocument(data: ShippingLabelData) {
  const orderReference = clean(data.orderNumber) ? `Pedido ${escapeHtml(clean(data.orderNumber))}` : "Etiqueta de postagem";

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${orderReference} — IAGO MODAS</title><style>@page{size:A5 portrait;margin:11mm}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#121212}.label{min-height:180mm;border:2px solid #121212;padding:12mm;display:flex;flex-direction:column;gap:10mm}.brand{font-size:12px;font-weight:800;letter-spacing:2px}.reference{font-size:12px;color:#444}.divider{border:0;border-top:1px solid #121212;width:100%;margin:0}.heading{font-size:11px;font-weight:800;letter-spacing:1.4px;margin:0 0 5mm}.address{font-size:18px;line-height:1.35}.address p{margin:0}.recipient{font-size:22px}.note{margin-top:auto;border-top:1px solid #121212;padding-top:6mm;font-size:10px;line-height:1.45;color:#333}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body><main class="label"><header><div class="brand">IAGO MODAS</div><div class="reference">${orderReference}</div></header><hr class="divider"><section><p class="heading">DESTINATÁRIO</p><div class="address recipient">${addressMarkup(data.recipient)}</div></section><hr class="divider"><section><p class="heading">REMETENTE</p><div class="address">${addressMarkup(data.sender)}</div></section><p class="note">Etiqueta de endereço para postagem manual. O código de rastreio é fornecido pelos Correios após a postagem.</p></main></body></html>`;
}
