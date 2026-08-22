import { Button } from "@/components/ui/button";
import { cropImageFile } from "@/lib/imageCrop";
import { Check, Move, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type ImageCropDialogProps = {
  file: File | null;
  aspectRatio: number;
  title: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void | Promise<void>;
};

type PointerPosition = { x: number; y: number };
type DragStart = PointerPosition & { focusX: number; focusY: number };
type PinchStart = PointerPosition & {
  distance: number;
  zoom: number;
  focusX: number;
  focusY: number;
};

const clamp = (value: number, min = -1, max = 1) => Math.min(Math.max(value, min), max);
const distanceBetween = (first: PointerPosition, second: PointerPosition) =>
  Math.hypot(second.x - first.x, second.y - first.y);
const centerBetween = (first: PointerPosition, second: PointerPosition) => ({
  x: (first.x + second.x) / 2,
  y: (first.y + second.y) / 2,
});

export function ImageCropDialog({ file, aspectRatio, title, open, onCancel, onConfirm }: ImageCropDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [focusX, setFocusX] = useState(0);
  const [focusY, setFocusY] = useState(0);
  const [saving, setSaving] = useState(false);
  const activePointers = useRef(new Map<number, PointerPosition>());
  const dragStart = useRef<DragStart | null>(null);
  const pinchStart = useRef<PinchStart | null>(null);

  useEffect(() => {
    activePointers.current.clear();
    dragStart.current = null;
    pinchStart.current = null;
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

  const startPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = { x: event.clientX, y: event.clientY };
    activePointers.current.set(event.pointerId, pointer);
    event.currentTarget.setPointerCapture(event.pointerId);
    const pointers = Array.from(activePointers.current.values());
    if (pointers.length === 1) {
      dragStart.current = { ...pointer, focusX, focusY };
      pinchStart.current = null;
      return;
    }
    const [first, second] = pointers;
    const center = centerBetween(first, second);
    pinchStart.current = {
      ...center,
      distance: Math.max(distanceBetween(first, second), 1),
      zoom,
      focusX,
      focusY,
    };
    dragStart.current = null;
  };

  const moveImage = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointers.current.has(event.pointerId)) return;
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pointers = Array.from(activePointers.current.values());
    const rect = event.currentTarget.getBoundingClientRect();

    if (pointers.length >= 2 && pinchStart.current) {
      const [first, second] = pointers;
      const center = centerBetween(first, second);
      const nextZoom = clamp(
        pinchStart.current.zoom * distanceBetween(first, second) / pinchStart.current.distance,
        1,
        3,
      );
      const sensitivity = Math.max(nextZoom - 1, 0.2);
      setZoom(nextZoom);
      setFocusX(clamp(pinchStart.current.focusX - (center.x - pinchStart.current.x) / rect.width / sensitivity));
      setFocusY(clamp(pinchStart.current.focusY - (center.y - pinchStart.current.y) / rect.height / sensitivity));
      return;
    }

    const start = dragStart.current;
    if (!start || zoom === 1) return;
    const sensitivity = Math.max(zoom - 1, 0.2);
    setFocusX(clamp(start.focusX - (event.clientX - start.x) / rect.width / sensitivity));
    setFocusY(clamp(start.focusY - (event.clientY - start.y) / rect.height / sensitivity));
  };

  const endPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    activePointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const remaining = Array.from(activePointers.current.values());
    if (!remaining.length) {
      dragStart.current = null;
      pinchStart.current = null;
      return;
    }
    if (remaining.length === 1) {
      dragStart.current = { ...remaining[0], focusX, focusY };
      pinchStart.current = null;
    }
  };

  const adjustZoom = (amount: number) => {
    setZoom(current => clamp(Number((current + amount).toFixed(2)), 1, 3));
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const amount = clamp(-event.deltaY / 500, -0.25, 0.25);
    if (amount) adjustZoom(amount);
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
          <div><p className="eyebrow">AJUSTAR IMAGEM</p><h2 id="crop-title" className="mt-1 text-xl font-black text-white">{title}</h2><p className="mt-2 text-sm leading-5 text-white/60">Arraste para reposicionar. Use pinça no celular ou a roda do mouse e os botões de zoom no computador.</p></div>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} disabled={saving} aria-label="Cancelar ajuste"><X size={18} /></Button>
        </div>
        <div
          className="relative mt-5 w-full touch-none overflow-hidden rounded-2xl border border-white/15 bg-black"
          style={{ aspectRatio, maxHeight: "52vh" }}
          onPointerDown={startPointer}
          onPointerMove={moveImage}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onWheel={handleWheel}
        >
          <img src={previewUrl} alt="Prévia do enquadramento" className="h-full w-full select-none object-cover transition-transform duration-100" draggable={false} style={{ objectPosition: `${50 + focusX * 50}% ${50 + focusY * 50}%`, transform: `scale(${zoom})`, transformOrigin: "center" }} />
          <div className="pointer-events-none absolute inset-0 border-[1.5px] border-[#82ffc5]/90" />
          <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white/90"><Move size={14} /> Arraste para ajustar</div>
        </div>
        <div className="mt-5 flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" onClick={() => adjustZoom(-0.1)} disabled={saving || zoom <= 1} aria-label="Diminuir zoom"><ZoomOut size={16} /></Button>
          <input aria-label="Zoom da imagem" type="range" min="1" max="3" step="0.05" value={zoom} onChange={event => setZoom(Number(event.target.value))} className="w-full accent-[#82ffc5]" />
          <Button type="button" variant="outline" size="icon" onClick={() => adjustZoom(0.1)} disabled={saving || zoom >= 3} aria-label="Aumentar zoom"><ZoomIn size={16} /></Button>
          <span className="w-12 text-right text-xs font-bold text-white/70">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Button type="button" variant="ghost" onClick={reset} disabled={saving} className="text-white/70"><RotateCcw className="mr-2" size={16} />REDEFINIR</Button><div className="flex gap-2"><Button type="button" variant="outline" onClick={onCancel} disabled={saving}>CANCELAR</Button><Button type="button" onClick={() => void confirm()} disabled={saving} className="bg-[#82ffc5] text-black hover:bg-white"><Check className="mr-2" size={16} />{saving ? "PREPARANDO..." : "USAR ESTA FOTO"}</Button></div></div>
      </section>
    </div>
  );
}
