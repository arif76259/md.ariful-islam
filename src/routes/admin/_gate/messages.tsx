import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/_gate/messages")({
  component: MessagesAdmin,
});

function MessagesAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["contact_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const markRead = useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const { error } = await supabase.from("contact_messages").update({ is_read }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact_messages"] }),
    onError: () => toast.error("Could not update the message"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Message deleted");
      qc.invalidateQueries({ queryKey: ["contact_messages"] });
    },
    onError: () => toast.error("Could not delete the message"),
  });

  const items = data ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Messages</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Messages people send from the contact form on your website.
      </p>

      {isLoading && <p className="mt-10 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && items.length === 0 && (
        <p className="mt-10 text-sm text-muted-foreground">No messages yet.</p>
      )}

      <div className="mt-8 grid gap-4">
        {items.map((m) => (
          <article
            key={m.id}
            className={`rounded-2xl border p-6 ${
              m.is_read ? "border-border bg-surface-2/40" : "border-[color:var(--accent)]/40 bg-surface-2/70"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="label-mono rounded-full border border-border px-3 py-1 text-muted-foreground">
                {m.purpose}
              </span>
              <p className="text-sm font-medium">{m.name}</p>
              <a
                href={`mailto:${m.email}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {m.email}
              </a>
              <span className="label-mono ml-auto text-muted-foreground">
                {new Date(m.created_at).toLocaleString()}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {m.message}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={`mailto:${m.email}`}>
                  <Mail className="h-3.5 w-3.5" /> Reply
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => markRead.mutate({ id: m.id, is_read: !m.is_read })}
              >
                {m.is_read ? "Mark unread" : "Mark read"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (confirm("Delete this message?")) remove.mutate(m.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
