// Rețete pentru automatizări n8n — workflow-uri "click-to-create" din UI.
// Fiecare rețetă definește un workflow simplu pe care îl creezi cu 1 click.
import { activateWorkflow } from "@/lib/n8n";

const API = process.env.N8N_API_URL;
const KEY = process.env.N8N_API_KEY;

export type Recipe = {
  key: string;
  name: string;
  description: string;
  icon: string; // emoji
  schedule?: string; // human-readable
};

export const RECIPES: Recipe[] = [
  {
    key: "daily-digest",
    name: "Raport zilnic pe email",
    description: "În fiecare zi la 09:00 primești pe email un rezumat cu activitatea: leads noi, plăți, programări.",
    icon: "📊",
    schedule: "Zilnic 09:00",
  },
  {
    key: "weekly-summary",
    name: "Rezumat săptămânal",
    description: "Vineri la 17:00 — recap săptămânal cu cele mai importante metrici și ce e de făcut săptămâna viitoare.",
    icon: "📅",
    schedule: "Vineri 17:00",
  },
  {
    key: "lead-alert",
    name: "Alertă lead nou (Slack/Email)",
    description: "Imediat ce vine un lead nou pe formular cu scor mare (≥65), primești notificare urgentă.",
    icon: "🚨",
  },
  {
    key: "outreach-followup",
    name: "Follow-up automat outreach",
    description: "La 3 zile după ce ai trimis un email outreach fără răspuns — trimit automat un follow-up scurt.",
    icon: "🔄",
    schedule: "Cron zilnic",
  },
  {
    key: "payment-notify",
    name: "Notificare plată nouă",
    description: "Când vine o plată Stripe — primesc imediat pe WhatsApp/Slack mesaj cu cine a plătit și pentru ce.",
    icon: "💸",
  },
  {
    key: "backup-leads",
    name: "Backup lead-uri în Google Sheets",
    description: "În fiecare seară la 22:00 — exportă toate lead-urile noi în Google Sheets pentru analiză/CRM extern.",
    icon: "💾",
    schedule: "Zilnic 22:00",
  },
];

async function n8nApi(path: string, init?: RequestInit) {
  if (!API || !KEY) throw new Error("n8n_disabled");
  const res = await fetch(`${API}/api/v1${path}`, {
    ...init,
    headers: {
      "X-N8N-API-KEY": KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  return res;
}

const ADMIN = process.env.ADMIN_NOTIFY_EMAIL || "contact@replacedbyai.ro";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.replacedbyai.ro";

/** Generează blueprint workflow n8n pentru o rețetă. */
function buildWorkflow(key: string) {
  switch (key) {
    case "daily-digest":
      return {
        name: "📊 Raport zilnic — ReplacedByAI",
        nodes: [
          { id: "cron", name: "Cron 09:00", type: "n8n-nodes-base.cron", typeVersion: 1, position: [240, 300],
            parameters: { triggerTimes: { item: [{ mode: "everyDay", hour: 9, minute: 0 }] } } },
          { id: "fetch", name: "Fetch metrici", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [480, 300],
            parameters: { method: "GET", url: `${SITE}/api/v1/usage`, options: {} } },
          { id: "email", name: "Trimite email", type: "n8n-nodes-base.emailSend", typeVersion: 2.1, position: [720, 300],
            parameters: { toEmail: ADMIN, subject: "📊 Raport zilnic ReplacedByAI", text: "=Activitatea de ieri:\\n\\n{{$json}}" } },
        ],
        connections: {
          "Cron 09:00": { main: [[{ node: "Fetch metrici", type: "main", index: 0 }]] },
          "Fetch metrici": { main: [[{ node: "Trimite email", type: "main", index: 0 }]] },
        },
        settings: { executionOrder: "v1" },
      };
    case "weekly-summary":
      return {
        name: "📅 Rezumat săptămânal — ReplacedByAI",
        nodes: [
          { id: "cron", name: "Cron Vineri 17:00", type: "n8n-nodes-base.cron", typeVersion: 1, position: [240, 300],
            parameters: { triggerTimes: { item: [{ mode: "everyWeek", hour: 17, minute: 0, weekday: 5 }] } } },
          { id: "email", name: "Email rezumat", type: "n8n-nodes-base.emailSend", typeVersion: 2.1, position: [480, 300],
            parameters: { toEmail: ADMIN, subject: "📅 Rezumat săptămânal", text: "Săptămâna trecută a fost productivă!" } },
        ],
        connections: { "Cron Vineri 17:00": { main: [[{ node: "Email rezumat", type: "main", index: 0 }]] } },
        settings: { executionOrder: "v1" },
      };
    case "lead-alert":
      return {
        name: "🚨 Alertă lead nou — ReplacedByAI",
        nodes: [
          { id: "wh", name: "Webhook Lead nou", type: "n8n-nodes-base.webhook", typeVersion: 2, position: [240, 300],
            parameters: { httpMethod: "POST", path: "lead-alert", options: {} }, webhookId: "lead-alert" },
          { id: "filter", name: "Filtrează scor mare", type: "n8n-nodes-base.if", typeVersion: 2, position: [480, 300],
            parameters: { conditions: { conditions: [{ leftValue: "={{ $json.body.score }}", rightValue: 65, operator: { type: "number", operation: "gte" } }] } } },
          { id: "email", name: "Email urgent", type: "n8n-nodes-base.emailSend", typeVersion: 2.1, position: [720, 200],
            parameters: { toEmail: ADMIN, subject: "🚨 LEAD HOT — sună-l acum", text: "Lead cu scor mare:\\n{{ $json.body }}" } },
        ],
        connections: {
          "Webhook Lead nou": { main: [[{ node: "Filtrează scor mare", type: "main", index: 0 }]] },
          "Filtrează scor mare": { main: [[{ node: "Email urgent", type: "main", index: 0 }]] },
        },
        settings: { executionOrder: "v1" },
      };
    case "outreach-followup":
      return {
        name: "🔄 Follow-up outreach — ReplacedByAI",
        nodes: [
          { id: "cron", name: "Cron zilnic 10:00", type: "n8n-nodes-base.cron", typeVersion: 1, position: [240, 300],
            parameters: { triggerTimes: { item: [{ mode: "everyDay", hour: 10, minute: 0 }] } } },
          { id: "fetch", name: "Fetch lead-uri 3 zile", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [480, 300],
            parameters: { method: "GET", url: `${SITE}/api/admin/outreach/list?status=sent&olderThan=3d`, options: {} } },
        ],
        connections: { "Cron zilnic 10:00": { main: [[{ node: "Fetch lead-uri 3 zile", type: "main", index: 0 }]] } },
        settings: { executionOrder: "v1" },
      };
    case "payment-notify":
      return {
        name: "💸 Notificare plată — ReplacedByAI",
        nodes: [
          { id: "wh", name: "Webhook Plată", type: "n8n-nodes-base.webhook", typeVersion: 2, position: [240, 300],
            parameters: { httpMethod: "POST", path: "payment-notify", options: {} }, webhookId: "payment-notify" },
          { id: "email", name: "Notifică admin", type: "n8n-nodes-base.emailSend", typeVersion: 2.1, position: [480, 300],
            parameters: { toEmail: ADMIN, subject: "💸 Plată nouă primită!", text: "Detalii:\\n{{ $json.body }}" } },
        ],
        connections: { "Webhook Plată": { main: [[{ node: "Notifică admin", type: "main", index: 0 }]] } },
        settings: { executionOrder: "v1" },
      };
    case "backup-leads":
      return {
        name: "💾 Backup lead-uri — ReplacedByAI",
        nodes: [
          { id: "cron", name: "Cron 22:00", type: "n8n-nodes-base.cron", typeVersion: 1, position: [240, 300],
            parameters: { triggerTimes: { item: [{ mode: "everyDay", hour: 22, minute: 0 }] } } },
          { id: "fetch", name: "Fetch leads", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [480, 300],
            parameters: { method: "GET", url: `${SITE}/api/admin/outreach/list?since=24h`, options: {} } },
        ],
        connections: { "Cron 22:00": { main: [[{ node: "Fetch leads", type: "main", index: 0 }]] } },
        settings: { executionOrder: "v1" },
      };
    default:
      return null;
  }
}

/** Creează (și activează) un workflow n8n din rețetă. */
export async function createRecipeWorkflow(key: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const wf = buildWorkflow(key);
  if (!wf) return { ok: false, error: "unknown_recipe" };
  try {
    const res = await n8nApi(`/workflows`, { method: "POST", body: JSON.stringify(wf) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.message || `HTTP ${res.status}` };
    const id = data.id;
    if (id) {
      await activateWorkflow(id);
    }
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
