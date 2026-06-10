"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Non-blocking conversational UI. Guides only; no irreversible actions.
 * Enable via NEXT_PUBLIC_AI_CHAT_ENABLED=true.
 * Rollback: set env to false; remove from AILayers.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = message.trim();
    if (!text || loading) return;
    setMessage("");
    setReplies((r) => [...r, `You: ${text}`]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, pathname: pathname ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      const reply = data?.reply ?? "I can only guide you — try the navigation or buttons to perform actions.";
      setReplies((r) => [...r, `Coach: ${reply}`]);
    } catch {
      setReplies((r) => [...r, "Coach: I couldn't connect. Please try again."]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        aria-label="Open assistant"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex w-[320px] flex-col rounded-xl border bg-card shadow-lg"
          role="dialog"
          aria-label="Assistant"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold">Cricket IQ Assistant</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close"
              className="h-8 w-8"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-64 overflow-y-auto p-3 space-y-2">
            {replies.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Ask where to add players, log performance, or find sessions. I can only guide — use the app to perform actions.
              </p>
            )}
            {replies.map((line, i) => (
              <p key={i} className="text-sm break-words">
                {line}
              </p>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex gap-2 border-t p-3">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              disabled={loading}
            />
            <Button type="submit" size="sm" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
