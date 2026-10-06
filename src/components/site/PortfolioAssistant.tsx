import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircleQuestion, Send, X, Loader2 } from "lucide-react";
import { askPortfolio } from "@/lib/portfolio-qa.functions";

type Turn = { role: "user" | "assistant"; content: string; error?: boolean };

const SUGGESTIONS = [
  "What is Ariful studying?",
  "Which events has he organized?",
  "Tell me about his projects",
  "What leadership roles does he hold?",
];

export function PortfolioAssistant() {
  const ask = useServerFn(askPortfolio);
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, busy]);
  useEffect(() => {
    if (open && !busy) inputRef.current?.focus();
  }, [open, busy]);

  async function send(text: string) {
    const q = text.trim().slice(0, 1000);
    if (!q || busy) return;
    const next = [...turns, { role: "user" as const, content: q }];
    setTurns(next);
    setInput("");
    setBusy(true);
    try {
      const history = next.filter((t) => !t.error).slice(-10).map(({ role, content }) => ({ role, content }));
      const res = await ask({ data: { messages: history } });
      setTurns((t) => [...t, res.ok ? { role: "assistant", content: res.answer } : { role: "assistant", content: res.error, error: true }]);
    } catch {
      setTurns((t) => [...t, { role: "assistant", content: "Something went wrong. Please try again.", error: true }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="glass fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-medium text-foreground shadow-lg transition hover:border-primary"
          aria-label="Ask about Ariful"
        >
          <MessageCircleQuestion className="h-4 w-4 text-primary" />
          Ask about Ariful
        </button>
      )}
      {open && (
        <div className="glass fixed bottom-5 right-5 z-50 flex h-[min(560px,80vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background/90 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="font-display text-sm font-semibold text-foreground">Portfolio Assistant</p>
              <p className="label-mono text-[10px] text-muted-foreground">Answers from published portfolio info</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {turns.length === 0 && (
              <div className="space-y-3">
                <p className="text-muted-foreground">Ask anything about Ariful's education, experience, events or projects.</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground hover:border-primary">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {turns.map((t, i) =>
              t.role === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">{t.content}</div>
              ) : (
                <div key={i} className={`max-w-[95%] whitespace-pre-wrap leading-relaxed ${t.error ? "text-destructive" : "text-foreground"}`}>{t.content}</div>
              ),
            )}
            {busy && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-end gap-2 border-t border-border p-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              maxLength={1000}
              placeholder="Type your question…"
              className="max-h-28 flex-1 resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="rounded-lg bg-primary p-2.5 text-primary-foreground disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
