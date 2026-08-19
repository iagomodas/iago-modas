import React from "react";

type Props = { name: string; photoUrl?: string | null };

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "CL";
}

export function CustomerOrderAvatar({ name, photoUrl }: Props) {
  if (photoUrl) return <img src={photoUrl} alt={`Foto de ${name}`} className="h-10 w-10 shrink-0 rounded-full border border-[#82ffc5]/30 bg-black/30 object-cover" />;
  return <div aria-label={`Cliente ${name} sem foto de perfil`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[.07] text-xs font-bold text-[#82ffc5]">{initials(name)}</div>;
}
