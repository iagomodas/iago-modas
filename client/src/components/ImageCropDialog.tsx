import { Button } from "@/components/ui/button";
import { cropImageFile } from "@/lib/imageCrop";
import { Check, Move, RotateCcw, X, ZoomIn } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type ImageCropDialogProps = {
  file: File | null;
  aspectRatio: number;
  title: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void | Promise<void>;
};

const clamp = (value: number) => Math.min(Math.max(value, -1), 1);

export function ImageCropDialog({ file, aspectRatio, title, open, onCancel, onConfirm }: ImageCropDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [focusX, setFocusX] = useState(0);
  const [focusY, setFocusY] = useState(0);
  const [saving, setSaving] = useState(false);
  const dragStart = useRef<{ x: number; y: number; focusX: number; focusY: number } | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    setZoom(1);
    setFocusX(0);
    setFocusY(0);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  if (!open || !file || !previewUrl) return null;

  const reset = () => {
    setZoom(1);
    setFocusX(0);
    setFocusY(0);
  };

  const moveImage = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current || zoom === 1) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const sensitivity = Math.max(zoom - 1, 0.2);
    setFocusX(clamp(dragStart.current.focusX - (event.clientX - dragStart.current.x) / rect.width / sensitivity));
    setFocusY(clamp(dragStart.current.focusY - (event.clientY - dragStart.current.y) / rect.height / sensitivity));
  };

  const confirm = async () => {
    try {
      setSaving(true);
      const cropped = await cropImageFile(file, { aspectRatio, zoom, focusX, focusY });
      await onConfirm(cropped);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="crop-title">
      <section className="w-full max-w-xl rounded-3xl border border-white/15 bg-[#12171b] p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="eyebrow">AJUSTAR IMAGEM</p><h2 id="crop-title" className="mt-1 text-xl font-black text-white">{title}</h2><p className="mt-2 text-sm leading-5 text-white/60">A foto mantém a proporção correta. Use o zoom e arraste para definir o enquadramento.</p></div>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} disabled={saving} aria-label="Cancelar ajuste"><X size={18} /></Button>
        </div>
        <div
          className="relative mt-5 w-full touch-none overflow-hidden rounded-2xl border border-white/15 bg-black"
          style={{ aspectRatio, maxHeight: "52vh" }}
          onPointerDown={event => { dragStart.current = { x: event.clientX, y: event.clientY, focusX, focusY }; event.currentTarget.setPointerCapture(event.pointerId); }}
          onPointerMove={moveImage}
          onPointerUp={() => { dragStart.current = null; }}
          onPointerCancel={() => { dragStart.current = null; }}
        >
          <img src={previewUrl} alt="Prévia do enquadramento" className="h-full w-full select-none object-cover transition-transform duration-100" draggable={false} style={{ objectPosition: `${50 + focusX * 50}% ${50 + focusY * 50}%`, transform: `scale(${zoom})` }} />
          <div className="pointer-events-none absolute inset-0 border-[1.5px] border-[#82ffc5]/90" />
          <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white/90"><Move size={14} /> Arraste para ajustar</div>
        </div>
        <div className="mt-5 flex items-center gap-3"><ZoomIn size={17} className="text-[#82ffc5]" /><input aria-label="Zoom da imagem" type="range" min="1" max="3" step="0.05" value={zoom} onChange={event => setZoom(Number(event.target.value))} className="w-full accent-[#82ffc5]" /><span className="w-10 text-right text-xs font-bold text-white/70">{Math.round(zoom * 100)}%</span></div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Button type="button" variant="ghost" onClick={reset} disabled={saving} className="text-white/70"><RotateCcw className="mr-2" size={16} />REDEFINIR</Button><div className="flex gap-2"><Button type="button" variant="outline" onClick={onCancel} disabled={saving}>CANCELAR</Button><Button type="button" onClick={() => void confirm()} disabled={saving} className="bg-[#82ffc5] text-black hover:bg-white"><Check className="mr-2" size={16} />{saving ? "PREPARANDO..." : "USAR ESTA FOTO"}</Button></div></div>
      </section>
    </div>
  );
}
