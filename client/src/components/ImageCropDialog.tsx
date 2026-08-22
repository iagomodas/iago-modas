import { Button } from "@/components/ui/button";
import { cropImageFile } from "@/lib/imageCrop";
import { Check, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
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
type PanBounds = { x: number; y: number };

const clamp = (value: number, min = -1, max = 1) => Math.min(Math.max(value, min), max);
const distanceBetween = (first: PointerPosition, second: PointerPosition) =>
  Math.hypot(second.x - first.x, second.y - first.y);
const centerBetween = (first: PointerPosition, second: PointerPosition) => ({
  x: (first.x + second.x) / 2,
  y: (first.y + second.y) / 2,
});

export function ImageCropDialog({ file, aspectRatio, title, open, onCancel, onConfirm }: ImageCropDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sourceAspect, setSourceAspect] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [focusX, setFocusX] = useState(0);
  const [focusY, setFocusY] = useState(0);
  const [saving, setSaving] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const activePointers = useRef(new Map<number, PointerPosition>());
  const dragStart = useRef<DragStart | null>(null);
  const pinchStart = useRef<PinchStart | null>(null);

  useEffect(() => {
    activePointers.current.clear();
    dragStart.current = null;
    pinchStart.current = null;
    setSourceAspect(null);
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

  const getPanBounds = (rect: DOMRect, currentZoom: number): PanBounds => {
    if (!sourceAspect || !aspectRatio) return { x: Math.max(rect.width / 2, 1), y: Math.max(rect.height / 2, 1) };
    const imageWidth = sourceAspect > aspectRatio
      ? rect.width * (sourceAspect / aspectRatio) * currentZoom
      : rect.width * currentZoom;
    const imageHeight = sourceAspect > aspectRatio
      ? rect.height * currentZoom
      : rect.height * (aspectRatio / sourceAspect) * currentZoom;
    return {
      x: Math.max((imageWidth - rect.width) / 2, 1),
      y: Math.max((imageHeight - rect.height) / 2, 1),
    };
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
      const bounds = getPanBounds(rect, nextZoom);
      setZoom(nextZoom);
      setFocusX(clamp(pinchStart.current.focusX - (center.x - pinchStart.current.x) / bounds.x));
      setFocusY(clamp(pinchStart.current.focusY - (center.y - pinchStart.current.y) / bounds.y));
      return;
    }

    const start = dragStart.current;
    if (!start) return;
    const bounds = getPanBounds(rect, zoom);
    setFocusX(clamp(start.focusX - (event.clientX - start.x) / bounds.x));
    setFocusY(clamp(start.focusY - (event.clientY - start.y) / bounds.y));
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
    const amount = clamp(-event.deltaY / 450, -0.2, 0.2);
    if (amount) adjustZoom(amount);
  };

  const handleDoubleClick = () => {
    setZoom(current => current > 1 ? 1 : 2);
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

  const imageWidthPercent = sourceAspect && sourceAspect > aspectRatio
    ? (sourceAspect / aspectRatio) * zoom * 100
    : zoom * 100;
  const imageHeightPercent = sourceAspect && sourceAspect > aspectRatio
    ? zoom * 100
    : sourceAspect
      ? (aspectRatio / sourceAspect) * zoom * 100
      : 100;
  const maxOffsetXPercent = Math.max((imageWidthPercent - 100) / 2, 0);
  const maxOffsetYPercent = Math.max((imageHeightPercent - 100) / 2, 0);

  return (
    <div className="fixed inset-0 z-[100] flex min-h-[100svh] items-center justify-center bg-black sm:p-4" role="dialog" aria-modal="true" aria-labelledby="crop-title">
      <section className="flex h-[100svh] w-full max-w-2xl flex-col overflow-hidden bg-[#0b0d10] sm:h-auto sm:max-h-[calc(100svh-2rem)] sm:rounded-3xl sm:border sm:border-white/15 sm:shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div><p className="eyebrow">AJUSTAR IMAGEM</p><h2 id="crop-title" className="mt-1 text-lg font-black text-white sm:text-xl">{title}</h2></div>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} disabled={saving} aria-label="Cancelar ajuste"><X size={19} /></Button>
        </header>
        <div className="flex min-h-0 flex-1 items-center justify-center bg-black py-4 sm:px-6 sm:py-6">
          <div
            ref={frameRef}
            className="relative w-full max-w-xl touch-none overflow-hidden bg-black sm:rounded-2xl sm:border sm:border-white/15"
            style={{ aspectRatio, maxHeight: "calc(100svh - 240px)" }}
            onPointerDown={startPointer}
            onPointerMove={moveImage}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
          >
            <img
              src={previewUrl}
              alt="Prévia do enquadramento"
              className="absolute max-w-none select-none"
              draggable={false}
              onLoad={event => {
                const image = event.currentTarget;
                if (image.naturalWidth && image.naturalHeight) setSourceAspect(image.naturalWidth / image.naturalHeight);
              }}
              style={{
                width: `${imageWidthPercent}%`,
                height: `${imageHeightPercent}%`,
                left: `calc(50% - ${focusX * maxOffsetXPercent}%)`,
                top: `calc(50% - ${focusY * maxOffsetYPercent}%)`,
                transform: "translate(-50%, -50%)",
              }}
            />
            <div className="pointer-events-none absolute inset-0 border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,.18)]" />
          </div>
        </div>
        <footer className="shrink-0 border-t border-white/10 bg-[#0b0d10] px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <p className="mb-3 text-center text-xs text-white/55">Arraste para mover · pinça no celular · roda do mouse ou duplo clique no computador</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" onClick={() => adjustZoom(-0.1)} disabled={saving || zoom <= 1} aria-label="Diminuir zoom"><ZoomOut size={16} /></Button>
            <input aria-label="Zoom da imagem" type="range" min="1" max="3" step="0.05" value={zoom} onChange={event => setZoom(Number(event.target.value))} className="w-full accent-[#82ffc5]" />
            <Button type="button" variant="outline" size="icon" onClick={() => adjustZoom(0.1)} disabled={saving || zoom >= 3} aria-label="Aumentar zoom"><ZoomIn size={16} /></Button>
            <span className="w-12 text-right text-xs font-bold text-white/70">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3"><Button type="button" variant="ghost" onClick={reset} disabled={saving} className="text-white/70"><RotateCcw className="mr-2" size={16} />REDEFINIR</Button><div className="flex gap-2"><Button type="button" variant="outline" onClick={onCancel} disabled={saving}>CANCELAR</Button><Button type="button" onClick={() => void confirm()} disabled={saving} className="bg-[#82ffc5] text-black hover:bg-white"><Check className="mr-2" size={16} />{saving ? "PREPARANDO..." : "USAR ESTA FOTO"}</Button></div></div>
        </footer>
      </section>
    </div>
  );
}
