import { Button } from "@/components/ui/button";
import { hasSupabaseConfiguration, supabase } from "@/lib/supabase";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";

type ProductMediaPickerProps = {
  mainImage: string;
  additionalImages: string;
  onChange: (mainImage: string, additionalImages: string) => void;
  disabled?: boolean;
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 6;

function normalizedImages(mainImage: string, additionalImages: string) {
  return [mainImage, ...additionalImages.split(/\r?\n/)]
    .map(url => url.trim())
    .filter(Boolean);
}

export function ProductMediaPicker({
  mainImage,
  additionalImages,
  onChange,
  disabled = false,
}: ProductMediaPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const images = useMemo(
    () => normalizedImages(mainImage, additionalImages),
    [mainImage, additionalImages]
  );

  const updateImages = (nextImages: string[]) =>
    onChange(nextImages[0] ?? "", nextImages.slice(1).join("\n"));

  const choosePhotos = async (files: FileList | null) => {
    const selected = Array.from(files ?? []);
    if (!selected.length) return;
    setError(null);

    if (!hasSupabaseConfiguration || !supabase) {
      setError(
        "O envio de fotos ainda não está disponível. Atualize a página e tente novamente."
      );
      return;
    }
    if (images.length + selected.length > MAX_IMAGES) {
      setError(`Escolha no máximo ${MAX_IMAGES} fotos por produto.`);
      return;
    }
    const invalid = selected.find(
      file =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > MAX_FILE_BYTES
    );
    if (invalid) {
      setError("Use imagens JPG, PNG ou WEBP de até 5 MB cada.");
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of selected) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const identifier =
          globalThis.crypto?.randomUUID?.() ??
          `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const path = `catalog/${identifier}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("product-gallery")
          .upload(path, file, {
            cacheControl: "31536000",
            contentType: file.type,
            upsert: false,
          });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from("product-gallery")
          .getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }
      updateImages([...images, ...uploadedUrls]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar as fotos. Tente novamente."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <section className="rounded-2xl border border-[#82ffc5]/20 bg-[#82ffc5]/[.04] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[.16em] text-[#82ffc5]">
            FOTOS DO PRODUTO
          </p>
          <p className="mt-1 text-sm text-white/65">
            Escolha as fotos da galeria. A primeira será a foto principal da
            loja.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={event => void choosePhotos(event.target.files)}
        />
        <Button
          type="button"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#82ffc5] text-black hover:bg-white"
        >
          {uploading ? (
            <Loader2 className="mr-2 animate-spin" size={16} />
          ) : (
            <ImagePlus className="mr-2" size={16} />
          )}
          {uploading ? "ENVIANDO FOTOS" : "ESCOLHER FOTOS"}
        </Button>
      </div>
      <p className="mt-3 text-xs text-white/45">
        JPG, PNG ou WEBP, até 5 MB cada. Você pode colocar até {MAX_IMAGES}{" "}
        fotos.
      </p>
      {error && (
        <p className="mt-3 rounded-lg border border-red-300/20 bg-red-300/[.08] px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      )}
      {images.length ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/30"
            >
              <img
                src={url}
                alt={
                  index === 0
                    ? "Foto principal escolhida"
                    : `Foto adicional ${index + 1}`
                }
                className="aspect-square w-full object-cover"
              />
              <p className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] font-bold tracking-wide text-white">
                {index === 0 ? "PRINCIPAL" : `FOTO ${index + 1}`}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remover foto ${index + 1}`}
                onClick={() =>
                  updateImages(
                    images.filter((_, itemIndex) => itemIndex !== index)
                  )
                }
                className="absolute bottom-1 right-1 h-8 w-8 bg-black/70 text-red-200 hover:bg-red-300/20 hover:text-red-100"
              >
                <Trash2 size={15} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-white/45">
          Nenhuma foto escolhida ainda.
        </div>
      )}
    </section>
  );
}
