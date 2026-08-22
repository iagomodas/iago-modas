import { Button } from "@/components/ui/button";
import { ImageCropDialog } from "@/components/ImageCropDialog";
import { hasSupabaseConfiguration, supabase } from "@/lib/supabase";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import React, { useRef, useState } from "react";

type StorefrontImagePickerProps = {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  aspectRatio?: number;
  disabled?: boolean;
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function StorefrontImagePicker({
  label,
  description,
  value,
  onChange,
  aspectRatio = 1,
  disabled = false,
}: StorefrontImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const chooseImage = (file: File | undefined) => {
    if (!file) return;
    setError(null);

    const storageClient = supabase;
    if (!hasSupabaseConfiguration || !storageClient) {
      setError("O envio de imagem ainda não está disponível. Atualize a página e tente novamente.");
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_FILE_BYTES) {
      setError("Use uma imagem JPG, PNG ou WEBP de até 5 MB.");
      return;
    }

    setPendingFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (file: File) => {
    const storageClient = supabase;
    if (!storageClient) {
      setError("O envio de imagem ainda não está disponível. Atualize a página e tente novamente.");
      return;
    }
    setUploading(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const identifier = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const path = `storefront/${identifier}.${extension}`;
      const { error: uploadError } = await storageClient.storage
        .from("storefront-branding")
        .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data } = storageClient.storage.from("storefront-branding").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  };

  return (
    <div className="rounded-2xl border border-[#82ffc5]/20 bg-[#82ffc5]/[.04] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-1 text-xs leading-5 text-white/60">{description}</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={event => void chooseImage(event.target.files?.[0])}
        />
        <Button
          type="button"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#82ffc5] text-black hover:bg-white"
        >
          {uploading ? <Loader2 className="mr-2 animate-spin" size={16} /> : <ImagePlus className="mr-2" size={16} />}
          {uploading ? "ENVIANDO" : "ESCOLHER IMAGEM"}
        </Button>
      </div>
      {error && <p className="mt-3 rounded-lg border border-red-300/20 bg-red-300/[.08] px-3 py-2 text-sm text-red-100">{error}</p>}
      {value ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-3">
          <img src={value} alt={`${label} escolhida`} className="h-20 w-20 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white">Imagem escolhida</p>
            <p className="mt-1 text-xs text-white/50">Para trocar, basta escolher outra imagem.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label={`Remover ${label}`} disabled={disabled || uploading} onClick={() => onChange("")} className="text-red-200 hover:bg-red-300/15 hover:text-red-100">
            <Trash2 size={16} />
          </Button>
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-white/15 px-4 py-5 text-center text-sm text-white/50">Nenhuma imagem escolhida ainda.</p>
      )}
      <p className="mt-3 text-xs text-white/45">JPG, PNG ou WEBP, até 5 MB. Não é necessário copiar links ou URLs.</p>
      <ImageCropDialog open={Boolean(pendingFile)} file={pendingFile} aspectRatio={aspectRatio} title={`Enquadrar: ${label}`} onCancel={() => setPendingFile(null)} onConfirm={uploadImage} />
    </div>
  );
}
