"use client";

import { useState, useTransition } from "react";
import { Key, Webhook, Trash2, Plus, Copy, Check, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { createApiKey, revokeApiKey, addWebhook, deleteWebhook } from "../actions";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: Date | null;
  createdAt: Date;
};

type WebhookRow = {
  id: string;
  event: string;
  url: string;
  active: boolean;
  lastDeliveredAt: Date | null;
  lastStatus: number | null;
  createdAt: Date;
};

const EVENTS = [
  { value: "conversation.created", label: "Conversație nouă (apel / chat)" },
  { value: "payment.succeeded", label: "Plată reușită" },
  { value: "agent.deployed", label: "Agent activat" },
  { value: "agent.status_changed", label: "Status agent schimbat" },
];

const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://replacedbyai.ro";

export function IntegrationsClient({
  apiKeys,
  webhooks,
}: {
  apiKeys: ApiKey[];
  webhooks: WebhookRow[];
}) {
  // API Keys state
  const [keys, setKeys] = useState(apiKeys);
  const [hooks, setHooks] = useState(webhooks);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<{ raw: string; id: string } | null>(null);
  const [keyError, setKeyError] = useState("");
  const [copied, setCopied] = useState(false);

  // Webhook state
  const [whUrl, setWhUrl] = useState("");
  const [whEvent, setWhEvent] = useState(EVENTS[0].value);
  const [whError, setWhError] = useState("");
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);
  const [whSecretCopied, setWhSecretCopied] = useState(false);

  const [isPending, startTransition] = useTransition();

  function copyToClipboard(text: string, setCopiedFn: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedFn(true);
      setTimeout(() => setCopiedFn(false), 2000);
    });
  }

  function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    setKeyError("");
    startTransition(async () => {
      const res = await createApiKey(newKeyName);
      if (!res.ok) {
        setKeyError(res.error);
        return;
      }
      setRevealedKey({ raw: res.rawKey, id: res.keyId });
      setNewKeyName("");
    });
  }

  function handleRevokeKey(keyId: string) {
    startTransition(async () => {
      const res = await revokeApiKey(keyId);
      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== keyId));
        if (revealedKey?.id === keyId) setRevealedKey(null);
      }
    });
  }

  function handleAddWebhook(e: React.FormEvent) {
    e.preventDefault();
    setWhError("");
    startTransition(async () => {
      const res = await addWebhook(whUrl, whEvent);
      if (!res.ok) {
        setWhError(res.error ?? "Eroare necunoscută.");
        return;
      }
      setWhUrl("");
      setNewWebhookSecret(res.secret ?? null);
    });
  }

  function handleDeleteWebhook(id: string) {
    startTransition(async () => {
      const res = await deleteWebhook(id);
      if (res.ok) setHooks((prev) => prev.filter((h) => h.id !== id));
    });
  }

  return (
    <div className="max-w-[700px] space-y-10">
      <div>
        <h1 className="h-display text-3xl mb-1">Integrări</h1>
        <p className="text-[14px] text-[var(--ink-2)]">
          Conectează ReplacedByAI cu n8n, Make, Zapier sau orice aplicație custom.
        </p>
      </div>

      {/* ─── API KEYS ────────────────────────────────────── */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-[15px] font-medium flex items-center gap-2 mb-1">
          <Key size={15} /> Chei API
        </h2>
        <p className="text-[12.5px] text-[var(--ink-3)] mb-5">
          Folosește cheia în headerul{" "}
          <code className="font-mono bg-[var(--bg-3)] px-1 rounded text-[11px]">
            Authorization: Bearer rbai_…
          </code>{" "}
          când apelezi{" "}
          <code className="font-mono bg-[var(--bg-3)] px-1 rounded text-[11px]">
            {BASE_URL}/api/v1/agents
          </code>
          .
        </p>

        {/* Banner cheie nou creată */}
        {revealedKey && (
          <div
            className="mb-5 rounded-xl px-4 py-3"
            style={{ background: "#FFF7ED", border: "1px solid #F59E0B" }}
          >
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[12.5px] font-medium text-amber-800">
                Copiaz-o acum — nu o vom mai arăta niciodată.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-[12px] bg-white px-3 py-2 rounded-lg border border-amber-200 overflow-x-auto text-amber-900">
                {revealedKey.raw}
              </code>
              <button
                onClick={() => copyToClipboard(revealedKey.raw, setCopied)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors"
                style={{
                  background: copied ? "#D1FAE5" : "#FEF3C7",
                  color: copied ? "#065F46" : "#92400E",
                  border: `1px solid ${copied ? "#6EE7B7" : "#FCD34D"}`,
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copiat!" : "Copiază"}
              </button>
            </div>
            <button
              onClick={() => setRevealedKey(null)}
              className="mt-2 text-[11.5px] text-amber-700 underline underline-offset-2"
            >
              Am copiat-o, ascunde
            </button>
          </div>
        )}

        {/* Lista chei existente */}
        {keys.length > 0 && (
          <div className="mb-4 space-y-2">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: "var(--bg-3)", border: "1px solid var(--border)" }}
              >
                <div>
                  <p className="text-[13px] font-medium">{k.name}</p>
                  <p className="text-[11.5px] text-[var(--ink-3)] font-mono mt-0.5">
                    {k.prefix}…
                    {k.lastUsedAt && (
                      <span className="ml-2 not-italic">
                        · folosit {new Date(k.lastUsedAt).toLocaleDateString("ro-RO")}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleRevokeKey(k.id)}
                  disabled={isPending}
                  className="p-2 rounded-lg hover:bg-red-50 text-[var(--ink-3)] hover:text-red-600 transition-colors"
                  title="Revocă cheia"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Formular creare cheie */}
        {keys.length < 5 && (
          <form onSubmit={handleCreateKey} className="flex gap-2">
            <input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Nume cheie (ex: n8n prod)"
              required
              maxLength={60}
              className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
            />
            <button
              type="submit"
              disabled={isPending || !newKeyName.trim()}
              className="px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg)] text-[13px] font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Plus size={14} /> Cheie nouă
            </button>
          </form>
        )}
        {keyError && <p className="mt-2 text-[12px] text-red-600">{keyError}</p>}
        {keys.length >= 5 && (
          <p className="text-[12px] text-[var(--ink-3)] mt-2">Ai atins limita de 5 chei active.</p>
        )}
      </section>

      {/* ─── WEBHOOKS ────────────────────────────────────── */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-[15px] font-medium flex items-center gap-2 mb-1">
          <Webhook size={15} /> Webhooks outbound
        </h2>
        <p className="text-[12.5px] text-[var(--ink-3)] mb-5">
          Primești un POST cu payload JSON semnat HMAC-SHA256 când apare un eveniment. Compatibil cu
          n8n, Make.com, Zapier.
        </p>

        {/* Banner secret webhook nou */}
        {newWebhookSecret && (
          <div
            className="mb-5 rounded-xl px-4 py-3"
            style={{ background: "#FFF7ED", border: "1px solid #F59E0B" }}
          >
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[12.5px] font-medium text-amber-800">
                Secretul webhook — salvează-l acum pentru verificarea semnăturii.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-[12px] bg-white px-3 py-2 rounded-lg border border-amber-200 overflow-x-auto text-amber-900">
                {newWebhookSecret}
              </code>
              <button
                onClick={() => copyToClipboard(newWebhookSecret, setWhSecretCopied)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors"
                style={{
                  background: whSecretCopied ? "#D1FAE5" : "#FEF3C7",
                  color: whSecretCopied ? "#065F46" : "#92400E",
                  border: `1px solid ${whSecretCopied ? "#6EE7B7" : "#FCD34D"}`,
                }}
              >
                {whSecretCopied ? <Check size={13} /> : <Copy size={13} />}
                {whSecretCopied ? "Copiat!" : "Copiază"}
              </button>
            </div>
            <button
              onClick={() => {
                setNewWebhookSecret(null);
                window.location.reload();
              }}
              className="mt-2 text-[11.5px] text-amber-700 underline underline-offset-2"
            >
              Am salvat secretul, continuă
            </button>
          </div>
        )}

        {/* Lista webhook-uri */}
        {hooks.length > 0 && (
          <div className="mb-4 space-y-2">
            {hooks.map((h) => (
              <div
                key={h.id}
                className="flex items-start justify-between px-4 py-3 rounded-xl gap-3"
                style={{ background: "var(--bg-3)", border: "1px solid var(--border)" }}
              >
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-0.5">
                    {EVENTS.find((e) => e.value === h.event)?.label ?? h.event}
                  </p>
                  <p className="text-[12.5px] font-mono truncate text-[var(--ink-1)]">{h.url}</p>
                  {h.lastDeliveredAt && (
                    <p className="text-[11px] text-[var(--ink-3)] mt-0.5">
                      Ultima livrare: {new Date(h.lastDeliveredAt).toLocaleString("ro-RO")}
                      {h.lastStatus && (
                        <span
                          className="ml-1"
                          style={{ color: h.lastStatus < 300 ? "#059669" : "#DC2626" }}
                        >
                          ({h.lastStatus})
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteWebhook(h.id)}
                  disabled={isPending}
                  className="p-2 rounded-lg hover:bg-red-50 text-[var(--ink-3)] hover:text-red-600 transition-colors shrink-0"
                  title="Șterge webhook"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Formular adăugare webhook */}
        {hooks.length < 5 && !newWebhookSecret && (
          <form onSubmit={handleAddWebhook} className="space-y-2">
            <select
              value={whEvent}
              onChange={(e) => setWhEvent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
            >
              {EVENTS.map((ev) => (
                <option key={ev.value} value={ev.value}>
                  {ev.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                value={whUrl}
                onChange={(e) => setWhUrl(e.target.value)}
                placeholder="https://hook.n8n.io/…"
                type="url"
                required
                className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
              />
              <button
                type="submit"
                disabled={isPending || !whUrl.trim()}
                className="px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg)] text-[13px] font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Plus size={14} /> Adaugă
              </button>
            </div>
          </form>
        )}
        {whError && <p className="mt-2 text-[12px] text-red-600">{whError}</p>}
      </section>

      {/* ─── REFERINȚĂ API ───────────────────────────────── */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-[15px] font-medium mb-4">Referință rapidă API</h2>
        <div className="space-y-4">
          <ApiEndpoint
            method="GET"
            path="/api/v1/agents"
            desc="Lista agenților tăi activi."
          />
          <ApiEndpoint
            method="GET"
            path="/api/v1/usage"
            desc="Status abonament și contor utilizare."
          />
          <ApiEndpoint
            method="POST"
            path="/api/v1/trigger/[event]"
            desc="Declanșează un eveniment custom (trimite body JSON)."
          />
        </div>
        <p className="mt-5 text-[12px] text-[var(--ink-3)]">
          Toate request-urile cer header{" "}
          <code className="font-mono bg-[var(--bg-3)] px-1 rounded">
            Authorization: Bearer rbai_…
          </code>
          . Răspunsurile sunt JSON.
        </p>
      </section>
    </div>
  );
}

function ApiEndpoint({
  method,
  path,
  desc,
}: {
  method: string;
  path: string;
  desc: string;
}) {
  const methodColor =
    method === "GET" ? "#059669" : method === "POST" ? "#2563EB" : "#D97706";
  return (
    <div className="flex items-start gap-3">
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 shrink-0"
        style={{ background: `${methodColor}15`, color: methodColor }}
      >
        {method}
      </span>
      <div>
        <code className="text-[12.5px] font-mono text-[var(--ink-1)]">{path}</code>
        <p className="text-[12px] text-[var(--ink-3)] mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
