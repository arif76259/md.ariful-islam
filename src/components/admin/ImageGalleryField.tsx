import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uploadMedia, validateImage } from "@/lib/cms";

export function ImageGalleryField({
  value,
  onChange,
  label = "Photo gallery",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files);
    const invalid = selected.map(validateImage).find(Boolean);
    if (invalid) {
      toast.error(invalid);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setBusy(true);
    try {
      const uploaded = await Promise.all(selected.map(uploadMedia));
      onChange([...value, ...uploaded.map((item) => item.url)]);
      toast.success(`${uploaded.length} ${uploaded.length === 1 ? "photo" : "photos"} added`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload photos
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Add photo links"
            title="Add photo links"
            onClick={() => onChange([...value, ""])}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-muted-foreground">No gallery photos added.</p>
      ) : (
        <div className="space-y-3">
          {value.map((url, index) => (
            <div key={`${index}-${url}`} className="flex items-start gap-3">
              {url ? (
                <img
                  src={url}
                  alt={`Gallery photo ${index + 1}`}
                  className="aspect-video w-24 rounded-md border border-border object-cover"
                />
              ) : (
                <div className="grid aspect-video w-24 place-items-center rounded-md border border-dashed border-border text-muted-foreground">
                  <Plus className="h-4 w-4" />
                </div>
              )}
              <Textarea
                rows={2}
                aria-label={`Photo ${index + 1} link`}
                placeholder="Photo URL (or upload above)"
                value={url}
                onChange={(event) =>
                  onChange(value.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))
                }
                className="min-h-16 flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Remove photo ${index + 1}`}
                onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Upload several photos or add image links. Max 10 MB each.</p>
    </div>
  );
}