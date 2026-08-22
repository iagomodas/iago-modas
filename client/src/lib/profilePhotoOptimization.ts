export const PROFILE_PHOTO_MAX_INPUT_BYTES = 8 * 1024 * 1024;
export const PROFILE_PHOTO_TARGET_BYTES = 900 * 1024;
export const PROFILE_PHOTO_MAX_DIMENSION = 1280;

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export type OptimizedProfilePhoto = {
  file: File;
  originalBytes: number;
  optimizedBytes: number;
};

export function isAcceptedProfilePhoto(file: File) {
  return acceptedTypes.has(file.type);
}

export function getProfilePhotoDimensions(width: number, height: number, maxDimension = PROFILE_PHOTO_MAX_DIMENSION) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function formatProfilePhotoBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function loadImage(file: File) {
  return new Promise<{ image: HTMLImageElement; objectUrl: string }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, objectUrl });
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("image-load")); };
    image.src = objectUrl;
  });
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("image-encode")), "image/webp", quality);
  });
}

export async function optimizeProfilePhoto(file: File): Promise<OptimizedProfilePhoto> {
  const { image, objectUrl } = await loadImage(file);
  try {
    const dimensions = getProfilePhotoDimensions(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas-unavailable");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, dimensions.width, dimensions.height);

    let quality = 0.86;
    let blob = await canvasToWebp(canvas, quality);
    while (blob.size > PROFILE_PHOTO_TARGET_BYTES && quality > 0.54) {
      quality -= 0.08;
      blob = await canvasToWebp(canvas, quality);
    }
    if (blob.size > 2 * 1024 * 1024) throw new Error("image-too-large-after-optimization");

    return {
      file: new File([blob], "profile-photo.webp", { type: "image/webp" }),
      originalBytes: file.size,
      optimizedBytes: blob.size,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
