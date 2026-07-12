import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  /** Current image URL (shown as preview) */
  value?: string;
  /** Called with the new public URL after a successful upload */
  onChange: (url: string) => void;
  /** Storage path prefix, e.g. "products" or "dealers" */
  folder: "products" | "dealers";
  /** Optional label shown inside the dropzone */
  label?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, folder, label = "Upload image", className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("vendor-images")
        .upload(filename, file, { upsert: false, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("vendor-images").getPublicUrl(filename);
      const url = data.publicUrl;

      setPreview(url);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    setPreview(undefined);
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-brand hover:bg-brand/5",
        uploading && "pointer-events-none opacity-60",
        className,
      )}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {preview ? (
        <>
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full rounded-xl object-cover"
          />
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="size-3" />
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 p-6 text-center">
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-brand" />
          ) : (
            <div className="grid size-10 place-items-center rounded-xl bg-secondary">
              <Upload className="size-5 text-muted-foreground" />
            </div>
          )}
          <p className="text-xs font-semibold text-muted-foreground">
            {uploading ? "Uploading…" : label}
          </p>
          {!uploading && (
            <p className="text-[10px] text-muted-foreground">Click or drag & drop · Max 5 MB</p>
          )}
        </div>
      )}
    </div>
  );
}
