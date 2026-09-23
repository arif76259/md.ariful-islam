import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ImageField } from "./ImageField";
import { PageHeader } from "./AdminShell";

export type FieldType = "text" | "textarea" | "number" | "switch" | "list" | "image";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  max?: number;
  placeholder?: string;
  help?: string;
}

type Row = Record<string, unknown> & { id: string };

export function ResourceManager({
  table,
  queryKey,
  title,
  description,
  fields,
  defaults,
  titleKey,
  subtitleKey,
  filter,
}: {
  table: string;
  queryKey: string;
  title: string;
  description?: string | undefined;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  titleKey: string;
  subtitleKey?: string;
  filter?: (row: Row) => boolean;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [deleting, setDeleting] = useState<Row | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as never)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const rows = useMemo(() => (data ?? []).filter((r) => (filter ? filter(r) : true)), [data, filter]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

  const save = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editing) {
        const { error } = await supabase
          .from(table as never)
          .update(payload as never)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const nextOrder = (data ?? []).reduce(
          (m, r) => Math.max(m, Number(r["sort_order"] ?? 0)),
          0,
        );
        const { error } = await supabase
          .from(table as never)
          .insert({ ...payload, sort_order: nextOrder + 1 } as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      setEditing(null);
      setForm({});
      setOpen(false);
      toast.success("Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (row: Row) => {
      const { error } = await supabase.from(table as never).delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setDeleting(null);
      toast.success("Deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const move = useMutation({
    mutationFn: async ({ row, dir }: { row: Row; dir: -1 | 1 }) => {
      const index = rows.findIndex((r) => r.id === row.id);
      const other = rows[index + dir];
      if (!other) return;
      const a = Number(row["sort_order"] ?? 0);
      const b = Number(other["sort_order"] ?? 0);
      await supabase
        .from(table as never)
        .update({ sort_order: b } as never)
        .eq("id", row.id);
      await supabase
        .from(table as never)
        .update({ sort_order: a } as never)
        .eq("id", other.id);
    },
    onSuccess: invalidate,
  });

  const [open, setOpen] = useState(false);

  function openNew() {
    setEditing(null);
    setForm({ ...defaults });
    setOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    const next: Record<string, unknown> = {};
    fields.forEach((f) => (next[f.key] = row[f.key] ?? defaults[f.key]));
    setForm(next);
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    for (const f of fields) {
      const v = form[f.key];
      if (f.required && (v === undefined || v === null || String(v).trim() === "")) {
        toast.error(`${f.label} is required`);
        return;
      }
      if (f.max && typeof v === "string" && v.length > f.max) {
        toast.error(`${f.label} must be under ${f.max} characters`);
        return;
      }
    }
    save.mutate(form);
  }

  return (
    <>
      <PageHeader
        title={title}
        {...(description ? { description } : {})}
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Add entry
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nothing here yet. Add your first entry.
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((row, i) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface-2/50 p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{String(row[titleKey] ?? "Untitled")}</p>
                  {Boolean(row["featured"]) && (
                    <Star className="h-3.5 w-3.5 fill-current text-[color:var(--accent)]" />
                  )}
                </div>
                {subtitleKey && (
                  <p className="truncate text-sm text-muted-foreground">
                    {String(row[subtitleKey] ?? "")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={i === 0}
                  onClick={() => move.mutate({ row, dir: -1 })}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={i === rows.length - 1}
                  onClick={() => move.mutate({ row, dir: 1 })}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleting(row)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit entry" : "New entry"}</DialogTitle>
            <DialogDescription>Changes appear on the public site immediately.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-5">
            {fields.map((f) => (
              <FieldInput
                key={f.key}
                field={f}
                value={form[f.key]}
                onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))}
              />
            ))}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from the public site permanently.
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

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "switch") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border p-4">
        <div>
          <Label>{field.label}</Label>
          {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
        </div>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    );
  }

  if (field.type === "image") {
    return (
      <ImageField
        label={field.label}
        value={(value as string) ?? null}
        onChange={(v) => onChange(v)}
      />
    );
  }

  if (field.type === "list") {
    const list = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <Textarea
          rows={5}
          value={list.join("\n")}
          placeholder={field.placeholder ?? "One item per line"}
          onChange={(e) =>
            onChange(
              e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
        />
        <p className="text-xs text-muted-foreground">One item per line.</p>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <Textarea
          rows={5}
          maxLength={field.max}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      <Input
        type={field.type === "number" ? "number" : "text"}
        maxLength={field.max}
        value={(value as string | number) ?? ""}
        placeholder={field.placeholder}
        onChange={(e) =>
          onChange(field.type === "number" ? Number(e.target.value) : e.target.value)
        }
      />
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}
