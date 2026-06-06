import { Resend } from "resend";

const FROM = process.env.RESEND_FROM || "ReplacedByAI <contact@replacedbyai.ro>";
const REPLY_TO = process.env.RESEND_REPLY_TO || "contact@replacedbyai.ro";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.replacedbyai.ro";

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
  replyTo?: string;
};

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  const client = getClient();
  if (!client) {
    console.warn("[mail] RESEND_API_KEY missing, email not sent:", args.subject);
    return { ok: false, error: "no_api_key" };
  }
  try {
    const { data, error } = await client.emails.send({
      from: FROM,
      to: args.to,
      replyTo: args.replyTo ?? REPLY_TO,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
    if (error) return { ok: false, error: String(error.message || error) };
    return { ok: true, id: data?.id };
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
      ReplacedByAI · România · <a href="${SITE_URL}" style="color:#888;">replacedbyai.ro</a>
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

export function replyToLeadEmail(name: string, subject: string, message: string) {
  return wrap(
    subject,
    `<p>Bună ziua${name ? ", " + name.split(" ")[0] : ""},</p>
     <div style="white-space:pre-wrap;">${message.replace(/\n/g, "<br/>")}</div>
     <p style="margin-top:24px;">Cu respect,<br/><strong>Echipa ReplacedByAI</strong></p>`
  );
}

// 1. Confirmare imediată pentru persoana care a completat formularul de contact
export function paymentLinkEmail(args: {
  customerName?: string | null;
  description: string;
  amount: number; // cents
  currency: string;
  url: string;
  mode: "payment" | "subscription";
}): { subject: string; html: string; text: string } {
  const amount = (args.amount / 100).toLocaleString("ro-RO", { minimumFractionDigits: 2 });
  const ccy = args.currency.toUpperCase();
  const subject = `Link de plată — ${args.description}`;
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <h2 style="margin:0 0 12px;font-weight:500">Bună ziua${args.customerName ? `, ${args.customerName}` : ""},</h2>
    <p style="margin:0 0 18px;line-height:1.6;font-size:15px;color:#333">Vă trimit linkul de plată pentru:</p>
    <div style="background:#F4EFE6;padding:18px 22px;border-radius:12px;margin:18px 0">
      <div style="font-size:15px;font-weight:500;margin-bottom:6px">${args.description}</div>
      <div style="font-size:28px;font-weight:600;color:#0A0807">${amount} ${ccy}${args.mode === "subscription" ? " <span style='font-size:14px;font-weight:400;opacity:0.6'>/lună</span>" : ""}</div>
    </div>
    <p style="margin:20px 0">
      <a href="${args.url}" style="display:inline-block;background:#0A0807;color:#F4EFE6;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:500;font-size:15px">Plătește în siguranță →</a>
    </p>
    <p style="font-size:13px;color:#666;line-height:1.6;margin-top:20px">După plată primiți automat factura legală pe email. Plata se face prin Stripe — datele cardului nu trec prin platformă.</p>
    <hr style="margin:30px 0 16px;border:none;border-top:1px solid #e5e5e5"/>
    <p style="font-size:11px;color:#999;margin:0">ReplacedByAI · Iași, România</p>
  </div></body></html>`;
  const text = `Link de plată pentru ${args.description}\nTotal: ${amount} ${ccy}\n${args.url}\n\nReplacedByAI`;
  return { subject, html, text };
}

export function invoiceEmail(args: {
  customerName?: string | null;
  series: string;
  number: string;
  amount: number; // cents
  currency: string;
  pdfUrl?: string | null;
  description?: string | null;
}): { subject: string; html: string; text: string } {
  const amount = (args.amount / 100).toLocaleString("ro-RO", { minimumFractionDigits: 2 });
  const ccy = args.currency.toUpperCase();
  const subject = `Factură ${args.series}-${args.number} — ReplacedByAI`;
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <h2 style="margin:0 0 12px;font-weight:500">Bună ziua${args.customerName ? `, ${args.customerName}` : ""},</h2>
    <p style="margin:0 0 18px;line-height:1.6;font-size:15px;color:#333">Vă transmitem factura emisă pentru plata efectuată${args.description ? ` (<strong>${args.description}</strong>)` : ""}:</p>
    <div style="background:#F4EFE6;padding:18px 22px;border-radius:12px;margin:18px 0">
      <div style="font-size:13px;color:#666;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Factură</div>
      <div style="font-size:24px;font-weight:500;color:#0A0807">${args.series}-${args.number}</div>
      <div style="font-size:18px;color:#666;margin-top:6px">Total: <strong style="color:#0A0807">${amount} ${ccy}</strong></div>
    </div>
    ${args.pdfUrl ? `<p style="margin:20px 0"><a href="${args.pdfUrl}" style="display:inline-block;background:#0A0807;color:#F4EFE6;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:500;font-size:15px">Descarcă factura (PDF) →</a></p>` : ""}
    <p style="font-size:13px;color:#666;line-height:1.6;margin-top:20px">Factura a fost trimisă automat și către sistemul ANAF (e-Factura).</p>
    <hr style="margin:30px 0 16px;border:none;border-top:1px solid #e5e5e5"/>
    <p style="font-size:11px;color:#999;margin:0">ReplacedByAI · CIF 54666360 · Iași, România</p>
  </div></body></html>`;
  const text = `Factură ${args.series}-${args.number}\nTotal: ${amount} ${ccy}\n${args.pdfUrl ?? ""}`;
  return { subject, html, text };
}

export function leadConfirmationEmail(name: string, business: string) {
  const firstName = name.split(" ")[0];
  return wrap(
    "Am primit cererea ta!",
    `<p>Salut ${firstName},</p>
     <p>Am primit cererea ta pentru <strong>${business}</strong> și o analizăm acum.</p>
     <p>Te contactăm în maxim <strong>4 ore</strong> (în zilele lucrătoare) pentru a stabili un apel de descoperire.</p>
     <p style="background:#f0fdf4;border-left:3px solid #22c55e;padding:14px 16px;border-radius:0 8px 8px 0;font-size:14px;">
       Între timp, poți vedea toți agenții noștri disponibili pe site →
     </p>
     <p style="margin-top:24px;">
       <a href="${SITE_URL}/agenti" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:13px;display:inline-block;">
         Explorează agenții →
       </a>
     </p>
     <p style="margin-top:24px;">Cu respect,<br/><strong>Echipa ReplacedByAI</strong></p>`
  );
}

// 2. Notificare admin când un client completează intake-ul
export function intakeCompletedAdminEmail(args: { clientName: string; businessName: string; slug: string }) {
  return wrap(
    "Intake completat — poți începe implementarea",
    `<p><strong>${args.clientName}</strong> de la <strong>${args.businessName}</strong> a completat formularul de onboarding.</p>
     <p>Toate informațiile sunt disponibile în panoul de admin. Poți trece la configurarea agenților.</p>
     <p style="margin-top:24px;">
       <a href="${SITE_URL}/admin/clients/${args.slug}" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:13px;display:inline-block;">
         Deschide profilul clientului →
       </a>
     </p>`
  );
}

// 3. Confirmare pentru client că intake-ul a fost primit
export function intakeConfirmationClientEmail(name: string) {
  const firstName = name.split(" ")[0];
  return wrap(
    "Am primit toate informațiile — pornim!",
    `<p>Salut ${firstName},</p>
     <p>Formularul tău de onboarding a fost primit cu succes. Echipa noastră are tot ce îi trebuie pentru a configura agenții tăi.</p>
     <p><strong>Ce urmează:</strong></p>
     <ul style="font-size:14px;line-height:2;">
       <li>Configurăm și personalizăm agenții în funcție de business-ul tău</li>
       <li>Te contactăm în 24-48h pentru a programa sesiunea de testare</li>
       <li>Go-live după aprobare finală</li>
     </ul>
     <p>Poți urmări progresul implementării în portalul tău:</p>
     <p style="margin-top:20px;">
       <a href="${SITE_URL}/portal/implementation" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:13px;display:inline-block;">
         Vezi implementarea →
       </a>
     </p>
     <p style="margin-top:24px;">Cu respect,<br/><strong>Echipa ReplacedByAI</strong></p>`
  );
}

// 4. Confirmare pentru client la cerere agent din portal
export function agentRequestConfirmationEmail(name: string, agentSlug: string) {
  const firstName = name.split(" ")[0];
  const agentLabel = agentSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return wrap(
    `Cerere primită — ${agentLabel}`,
    `<p>Salut ${firstName},</p>
     <p>Am primit cererea ta pentru implementarea agentului <strong>${agentLabel}</strong>.</p>
     <p>Echipa noastră o va analiza și te contactăm în <strong>24 de ore</strong> cu detalii despre implementare și costuri.</p>
     <p style="margin-top:20px;">
       <a href="${SITE_URL}/portal" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:13px;display:inline-block;">
         Înapoi la portal →
       </a>
     </p>
     <p style="margin-top:24px;">Cu respect,<br/><strong>Echipa ReplacedByAI</strong></p>`
  );
}

// 5. Notificare client că cererea de agent a fost aprobată sau respinsă
export function agentRequestUpdateEmail(name: string, agentSlug: string, status: "approved" | "rejected", adminNote?: string | null) {
  const firstName = name.split(" ")[0];
  const agentLabel = agentSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const approved = status === "approved";
  return wrap(
    approved ? `Cerere aprobată — ${agentLabel}` : `Cerere respinsă — ${agentLabel}`,
    `<p>Salut ${firstName},</p>
     ${approved
       ? `<p>Cererea ta pentru agentul <strong>${agentLabel}</strong> a fost <strong style="color:#16a34a;">aprobată</strong>. Echipa noastră începe implementarea.</p>`
       : `<p>Din păcate, cererea ta pentru agentul <strong>${agentLabel}</strong> nu poate fi procesată momentan.</p>`
     }
     ${adminNote ? `<p style="background:#f5f5f4;padding:14px;border-radius:10px;font-size:14px;"><strong>Notă:</strong> ${adminNote}</p>` : ""}
     <p style="margin-top:20px;">
       <a href="${SITE_URL}/portal" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:13px;display:inline-block;">
         Înapoi la portal →
       </a>
     </p>
     <p style="margin-top:24px;">Cu respect,<br/><strong>Echipa ReplacedByAI</strong></p>`
  );
}

// 6. Notificare client că agentul lui este live
export function agentLiveEmail(name: string, agentSlug: string) {
  const firstName = name.split(" ")[0];
  const agentLabel = agentSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return wrap(
    `${agentLabel} este live! 🚀`,
    `<p>Salut ${firstName},</p>
     <p>Agentul tău <strong>${agentLabel}</strong> este acum <strong style="color:#16a34a;">activ și funcțional</strong>.</p>
     <p>De acum înainte preia automat sarcinile pentru care a fost configurat — 24/7, fără pauze.</p>
     <p>Urmărește activitatea și performanța din portal:</p>
     <p style="margin-top:20px;">
       <a href="${SITE_URL}/portal/agents" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:13px;display:inline-block;">
         Vezi agenții tăi →
       </a>
     </p>
     <p style="margin-top:24px;">Cu respect,<br/><strong>Echipa ReplacedByAI</strong></p>`
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
