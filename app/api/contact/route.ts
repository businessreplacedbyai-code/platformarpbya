import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail, newLeadAdminEmail, leadConfirmationEmail } from "@/lib/mail";
import { getClientIp, rateLimit, hashIp } from "@/lib/rate-limit";
import {
  lookupCUI,
  isValidRomanianPhone,
  normalizeRomanianPhone,
  normalizeCUI,
} from "@/lib/anaf";
import { scoreLead } from "@/lib/lead-scoring";

export const runtime = "nodejs";

const schema = z.object({
  // Step 1
  name: z.string().min(2).max(120),
  business: z.string().min(2).max(160),
  phone: z.string().min(9).max(30),
  email: z.string().email().max(160),
  // Step 2
  cui: z.string().optional(),
  sector: z
    .enum(["horeca", "retail", "medical", "beauty", "imobiliare", "servicii", "altul"])
    .optional(),
  employees: z.enum(["1", "2-5", "6-20", "21-50", "50+"]).optional(),
  city: z.string().max(120).optional(),
  website: z.string().max(200).optional(),
  // Step 3
  monthlyBudget: z.enum(["<500", "500-1500", "1500-3000", "3000+"]).optional(),
  urgency: z.enum(["asap", "1-3luni", "3-6luni", "exploring"]).optional(),
  painPoints: z.array(z.string()).max(20).optional(),
  agentsWanted: z.array(z.string()).max(20).optional(),
  message: z.string().max(2000).optional(),
  // UTM
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  referrer: z.string().max(500).optional(),
  // Honeypot (must be empty)
  website_url: z.string().max(0).optional(),
});

const ADMIN_NOTIFY = process.env.ADMIN_NOTIFY_EMAIL || "contact@replacedbyai.ro";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Prea multe cereri. Reîncearcă într-un minut." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Date invalide",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Honeypot
    if (data.website_url && data.website_url.length > 0) {
      return NextResponse.json({ success: true }); // soft-fail bot
    }

    if (!isValidRomanianPhone(data.phone)) {
      return NextResponse.json(
        { success: false, error: "Număr de telefon românesc invalid" },
        { status: 400 }
      );
    }
    const phoneE164 = normalizeRomanianPhone(data.phone);

    // ANAF lookup
    let cuiNorm: string | undefined;
    let cuiValid = false;
    let anafName: string | undefined;
    let vatPayer = false;
    let anafInactive = false;
    if (data.cui) {
      cuiNorm = normalizeCUI(data.cui);
      if (cuiNorm) {
        const anaf = await lookupCUI(cuiNorm);
        cuiValid = anaf.valid;
        anafName = anaf.name;
        vatPayer = !!anaf.vatPayer;
        anafInactive = !!anaf.inactive;
      }
    }

    const { score, reasons } = scoreLead({
      cuiValid,
      vatPayer,
      inactiveAnaf: anafInactive,
      sector: data.sector,
      employees: data.employees,
      monthlyBudget: data.monthlyBudget,
      urgency: data.urgency,
      agentsWanted: data.agentsWanted,
      hasWebsite: !!data.website,
      hasMessage: !!data.message && data.message.length > 10,
    });

    const ipHash = await hashIp(ip);
    const ua = req.headers.get("user-agent")?.slice(0, 300);

    let leadId: string | undefined;
    try {
      const lead = await prisma.lead.create({
        data: {
          name: data.name.trim(),
          business: (anafName || data.business).trim(),
          phone: phoneE164,
          email: data.email.toLowerCase().trim(),
          message: data.message?.trim() || null,
          source: "contact_form",
          cui: cuiNorm || null,
          cuiValid,
          cuiVerifiedAt: cuiNorm ? new Date() : null,
          sector: data.sector,
          employees: data.employees,
          monthlyBudget: data.monthlyBudget,
          urgency: data.urgency,
          painPoints: data.painPoints?.length ? JSON.stringify(data.painPoints) : null,
          agentsWanted: data.agentsWanted?.length
            ? JSON.stringify(data.agentsWanted)
            : null,
          city: data.city,
          website: data.website,
          score,
          scoreReason: reasons.join("; "),
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          referrer: data.referrer,
          ipHash,
          userAgent: ua,
        },
      });
      leadId = lead.id;
    } catch (dbErr) {
      console.error("Lead save failed:", dbErr);
    }

    // Notificare admin
    sendEmail({
      to: ADMIN_NOTIFY,
      subject: `${score >= 65 ? "🔥 HOT" : score >= 35 ? "⚡" : "📝"} Lead — ${data.business} (${score}/100)`,
      html: newLeadAdminEmail({
        name: data.name,
        business: anafName || data.business,
        phone: phoneE164,
        email: data.email,
        message: data.message,
      }),
    }).catch((e) => console.error("notify email failed", e));

    // Confirmare automată pentru persoana care a completat formularul
    sendEmail({
      to: data.email,
      subject: "Am primit cererea ta — ReplacedByAI",
      html: leadConfirmationEmail(data.name, anafName || data.business),
    }).catch((e) => console.error("lead confirmation email failed", e));

    return NextResponse.json({ success: true, leadId, score });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Eroare server" }, { status: 500 });
  }
}
