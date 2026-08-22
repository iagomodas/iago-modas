export type CropSettings = {
  aspectRatio: number;
  zoom: number;
  focusX: number;
  focusY: number;
};

export type CropRect = { x: number; y: number; width: number; height: number };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function getCropRect(
  sourceWidth: number,
  sourceHeight: number,
  { aspectRatio, zoom, focusX, focusY }: CropSettings
): CropRect {
  const safeRatio = Math.max(aspectRatio, 0.1);
  const safeZoom = clamp(zoom, 1, 3);
  const sourceRatio = sourceWidth / sourceHeight;
  const baseWidth = sourceRatio > safeRatio ? sourceHeight * safeRatio : sourceWidth;
  const baseHeight = baseWidth / safeRatio;
  const width = baseWidth / safeZoom;
  const height = baseHeight / safeZoom;
  const maxOffsetX = (sourceWidth - width) / 2;
  const maxOffsetY = (sourceHeight - height) / 2;

  return {
    x: clamp(sourceWidth / 2 - width / 2 + clamp(focusX, -1, 1) * maxOffsetX, 0, sourceWidth - width),
    y: clamp(sourceHeight / 2 - height / 2 + clamp(focusY, -1, 1) * maxOffsetY, 0, sourceHeight - height),
    width,
    height,
  };
}

async function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível abrir esta imagem."));
    image.src = source;
  });
}

export async function cropImageFile(file: File, settings: CropSettings) {
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(sourceUrl);
    const rect = getCropRect(image.naturalWidth, image.naturalHeight, settings);
    const outputWidth = Math.max(320, Math.min(1800, Math.round(rect.width)));
    const outputHeight = Math.max(320, Math.min(1800, Math.round(outputWidth / settings.aspectRatio)));
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Seu navegador não conseguiu preparar a imagem.");
    context.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, outputWidth, outputHeight);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", 0.92));
    if (!blob) throw new Error("Não foi possível preparar a imagem.");
    const stem = file.name.replace(/\.[^.]+$/, "") || "imagem";
    return new File([blob], `${stem}-ajustada.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
