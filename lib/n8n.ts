// n8n — client pentru automatizare: activare workflows + trigger provisioning.
// Folosit la provisioning agenți (după plată) și de panoul admin.
import crypto from "crypto";

const API = process.env.N8N_API_URL;           // https://n8n.replacedbyai.ro
const KEY = process.env.N8N_API_KEY;
const WEBHOOK = process.env.N8N_WEBHOOK_BASE;   // https://n8n.replacedbyai.ro/webhook
const SECRET = process.env.N8N_PROVISION_SECRET ?? "";

export function n8nEnabled(): boolean {
  return !!(API && KEY);
}

// ─── Mapare agentSlug → workflow IDs n8n (din handover) ────────────────────
// Activarea e idempotentă; workflow-urile sunt multi-tenant (keyed pe client).
export const AGENT_WORKFLOWS: Record<string, string[]> = {
  voicebot: ["Nc8hoYHvrNaRk0eh", "AedfFy3FY8XCFcp0"], // VoiceBot existent (activ deja)
  schedulerbot: ["Lm4ikU37mGmbU2jZ", "hGIPdjQdSHTrWFtR", "z90m125qripp7Q2C"],
  salesbot: ["pFUxKOnoXUMQgkIE", "zsq6PuxUQGSZNTsN"],
  supportbot: ["xORVv69D4zeoJ05p", "pSYBGupf9glINCdE"],
  socialbot: ["KuNWQzHJHImXnKtC", "jjr9gjRYY0LwSfhA", "O1xJypalUbldUyKH"],
  contentbot: ["ZIQyO7BgLWxyGG1C"],
  accountbot: ["tGBu5UMr5Nck8cVf", "oY4Z4jZWLTaK4u8V", "ZqGCP7MBWLHEjuy4"],
  financebot: ["ztz3WvPYYIRiUviC", "Si8l01UOOuCNFysw"],
  designbot: ["cwc6ghkdNxttJssh"],
  reviewbot: ["Ajz9pVqWJtJ0zCRU", "n4raomhZw0wnKoln"],
  hrbot: ["jf07Q5FOr1AGD556"],
  inventorybot: ["WM4gvNSMjvHSkEvA"],
  leadbot: ["ii9Whv4JqwrKi2wH", "rMSwR7XOQ9rcWaXn"],
  trainingbot: ["rtCSIrtBAsZOYQi1", "Nhflz4PYUC1vqtOO"],
  advisorbot: ["YLQoGRxzbRIEDNdf"],
};

async function api(path: string, init?: RequestInit) {
  if (!API || !KEY) throw new Error("n8n_disabled");
  const res = await fetch(`${API}/api/v1${path}`, {
    ...init,
    headers: {
      "X-N8N-API-KEY": KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(12000),
  });
  return res;
}

/** Activează un workflow n8n după ID (idempotent). */
export async function activateWorkflow(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await api(`/workflows/${id}/activate`, { method: "POST" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Activează toate workflow-urile pentru un agent. */
export async function activateAgentWorkflows(agentSlug: string): Promise<{
  activated: string[];
  failed: { id: string; error: string }[];
}> {
  const ids = AGENT_WORKFLOWS[agentSlug] ?? [];
  const activated: string[] = [];
  const failed: { id: string; error: string }[] = [];
  for (const id of ids) {
    const r = await activateWorkflow(id);
    if (r.ok) activated.push(id);
    else failed.push({ id, error: r.error ?? "unknown" });
  }
  return { activated, failed };
}

/**
 * Trigger provisioning webhook în n8n (best-effort, semnat HMAC).
 * n8n primește {clientId, agentSlug, plan, business...} și face setup-ul per-client.
 */
export async function triggerProvision(payload: {
  event: string;
  clientId: string;
  clientSlug?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  plan?: string;
  agentSlug?: string;
  agents?: string[];
}): Promise<{ ok: boolean; error?: string }> {
  if (!WEBHOOK) return { ok: false, error: "no_webhook_base" };
  try {
    const body = JSON.stringify(payload);
    const sig = crypto.createHmac("sha256", SECRET).update(body).digest("hex");
    const res = await fetch(`${WEBHOOK}/provision-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ReplacedByAI-Signature": sig,
      },
      body,
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Verifică semnătura HMAC a unui callback de la n8n. */
export function verifyProvisionSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !SECRET) return false;
  const expected = crypto.createHmac("sha256", SECRET).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/** Listează workflow-urile (pentru panoul admin). */
export async function listWorkflows(): Promise<unknown> {
  try {
    const res = await api(`/workflows?limit=100`);
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return res.json();
  } catch (e) {
    return { error: String(e) };
  }
}
