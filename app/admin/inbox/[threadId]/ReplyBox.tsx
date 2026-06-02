"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { replyToThread } from "../actions";

export function ReplyBox({ threadId }: { threadId: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);

    const fd = new FormData();
    fd.set("body", body);

    startTransition(async () => {
      const result = await replyToThread(threadId, fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSent(true);
        setBody("");
        router.refresh();
        setTimeout(() => setSent(false), 3000);
      }
    });
  }

  // Ctrl/Cmd+Enter to send
  function onKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={onKeyDown}
        rows={6}
        placeholder="Scrie răspunsul tău… (Ctrl+Enter trimite)"
        required
        className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20 resize-none"
      />
      {error && (
        <p className="text-[12px] text-red-600 mt-2">{error}</p>
      )}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[11.5px] text-[var(--ink-3)]">
          Trimis ca contact@replacedbyai.ro
        </span>
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px] disabled:opacity-50 hover:-translate-y-0.5 transition-all"
        >
          {pending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : sent ? (
            "✓ Trimis!"
          ) : (
            <>
              <Send size={13} /> Trimite răspuns
            </>
          )}
        </button>
      </div>
    </form>
  );
}
