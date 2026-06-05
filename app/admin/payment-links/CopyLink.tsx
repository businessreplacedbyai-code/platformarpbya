"use client";
import { useState } from "react";
import { Copy, Check, MessageCircle } from "lucide-react";

export function CopyLink({ url, description }: { url: string; description: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const waText = encodeURIComponent(
    `Bună ziua! Linkul de plată pentru ${description}:\n\n${url}\n\nFactura iese automat după plată.`
  );

  return (
    <>
      <button
        onClick={copy}
        title="Copiază linkul"
        className="p-1.5 rounded-lg hover:bg-[var(--bg-3)] text-[var(--ink-2)] transition-colors"
      >
        {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
      </button>
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Trimite pe WhatsApp"
        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
      >
        <MessageCircle size={13} />
      </a>
    </>
  );
}
