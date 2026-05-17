import { Resend } from "resend";

const FROM = process.env.RESEND_FROM || "ReplacedByAI <hello@replacedbyai.ro>";
const REPLY_TO = process.env.RESEND_REPLY_TO || "hello@replacedbyai.ro";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://replacedbyai.ro";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const client = getClient();
  if (!client) {
    // Graceful no-op în dev fără API key
    console.warn("[mail] RESEND_API_KEY missing, email not sent:", args.subject);
    return { ok: false, error: "no_api_key" };
  }
  try {
    const { error } = await client.emails.send({
      from: FROM,
      to: args.to,
      replyTo: REPLY_TO,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
    if (error) return { ok: false, error: String(error.message || error) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

// --- Templates ---

function wrap(title: string, body: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="font-size:18px;font-weight:600;margin-bottom:32px;letter-spacing:-0.02em;">
      Replaced<span style="color:#888;">ByAI</span>
    </div>
    <h1 style="font-size:24px;margin:0 0 24px;letter-spacing:-0.02em;">${title}</h1>
    <div style="font-size:15px;line-height:1.6;color:#333;">${body}</div>
    <hr style="margin:40px 0 20px;border:none;border-top:1px solid #e7e5e4;" />
    <p style="font-size:12px;color:#888;margin:0;">
      ReplacedByAI SRL · Botoșani, România · <a href="${SITE_URL}" style="color:#888;">replacedbyai.ro</a>
    </p>
  </div>
</body></html>`;
}

export function passwordResetEmail(name: string | null, resetUrl: string) {
  return wrap(
    "Resetare parolă",
    `<p>Salut${name ? " " + name : ""},</p>
     <p>Cineva a cerut resetarea parolei pentru contul tău ReplacedByAI. Dă click pe butonul de mai jos ca să setezi o parolă nouă. Link-ul expiră în 60 de minute.</p>
     <p style="margin:28px 0;">
       <a href="${resetUrl}" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;display:inline-block;">
         Resetează parola
       </a>
     </p>
     <p style="color:#888;font-size:13px;">Dacă nu ai cerut tu această resetare, poți ignora email-ul.</p>`
  );
}

export function clientWelcomeEmail(name: string, slug: string, tempPassword: string) {
  return wrap(
    "Bine ai venit la ReplacedByAI",
    `<p>Salut ${name},</p>
     <p>Contul tău de client este activ. Iată datele de acces:</p>
     <p style="background:#f5f5f4;padding:16px;border-radius:10px;font-family:monospace;font-size:13px;">
       Portal: <a href="${SITE_URL}/login?type=client">${SITE_URL}/login</a><br/>
       Parolă temporară: <strong>${tempPassword}</strong>
     </p>
     <p>La prima logare îți vom cere să setezi o parolă nouă.</p>
     <p>Următorul pas: completează formularul de intake (link separat trimis de echipa noastră) — durează ~15 minute și pornește implementarea.</p>
     <p>Echipa ReplacedByAI</p>`
  );
}

export function newLeadAdminEmail(lead: { name: string; business: string; phone: string; email: string; message?: string | null }) {
  return wrap(
    "Lead nou pe site",
    `<p><strong>${lead.name}</strong> de la <strong>${lead.business}</strong> a completat formularul de contact.</p>
     <p style="background:#f5f5f4;padding:16px;border-radius:10px;font-size:14px;">
       📧 ${lead.email}<br/>
       📞 ${lead.phone}<br/>
       ${lead.message ? `💬 ${lead.message}` : ""}
     </p>
     <p style="margin-top:24px;">
       <a href="${SITE_URL}/admin/leads" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:13px;display:inline-block;">
         Deschide în admin
       </a>
     </p>`
  );
}

export function newPurchaseRequestAdminEmail(args: {
  clientName: string;
  businessName: string;
  agentSlug: string;
  message?: string | null;
}) {
  return wrap(
    "Cerere nouă agent",
    `<p><strong>${args.clientName}</strong> (${args.businessName}) a cerut implementarea agentului <strong>${args.agentSlug}</strong>.</p>
     ${args.message ? `<p style="background:#f5f5f4;padding:14px;border-radius:10px;font-size:14px;">${args.message}</p>` : ""}
     <p style="margin-top:24px;">
       <a href="${SITE_URL}/admin/requests" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:13px;display:inline-block;">
         Vezi cererea
       </a>
     </p>`
  );
}

export function statusChangeClientEmail(name: string, status: string) {
  const label: Record<string, string> = {
    onboarding: "Onboarding în curs",
    live: "Agenții tăi sunt live 🚀",
    paused: "Cont pus pe pauză",
    churned: "Cont închis",
  };
  return wrap(
    label[status] || "Status actualizat",
    `<p>Salut ${name},</p>
     <p>Statusul contului tău a fost actualizat la: <strong>${label[status] || status}</strong>.</p>
     <p style="margin-top:24px;">
       <a href="${SITE_URL}/portal" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:13px;display:inline-block;">
         Vezi în portal
       </a>
     </p>`
  );
}
