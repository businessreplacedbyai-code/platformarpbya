"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="shrink-0 p-1.5 rounded-lg hover:bg-[var(--bg-3)] text-[var(--ink-2)]"
      aria-label="Copiază"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}
