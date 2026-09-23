import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Loader2, Trash2, UploadCloud } from "lucide-react";
import { deleteMedia, queries, uploadMedia, validateImage, type MediaItem } from "@/lib/cms";
import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/_gate/media")({
  component: MediaAdmin,
});

function MediaAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(queries.media);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<MediaItem | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(
    () =>
      (data ?? []).filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase())),
    [data, search],
  );

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const problem = validateImage(file);
        if (problem) {
          toast.error(`${file.name}: ${problem}`);
          continue;
        }
        await uploadMedia(file);
      }
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Upload complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const remove = useMutation({
    mutationFn: (item: MediaItem) => deleteMedia(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      setDeleting(null);
      toast.success("File deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title="Media library"
        description="Profile photos, event pictures, project covers and gallery images."
        action={
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => upload(e.target.files)}
            />
            <Button onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              Upload
            </Button>
          </>
        }
      />

      <Input
        placeholder="Search files…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 max-w-sm"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No files yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-2xl border border-border bg-surface-2/50">
              <div className="aspect-video bg-black/40">
                <img src={m.url} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-3 p-4">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="label-mono text-muted-foreground">
                  {Math.max(1, Math.round((m.size_bytes ?? 0) / 1024))} KB
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(m.url);
                      toast.success("URL copied");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy URL
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleting(m)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              Any section still using it will lose its image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove.mutate(deleting)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
