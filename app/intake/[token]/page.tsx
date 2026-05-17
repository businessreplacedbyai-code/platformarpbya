import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { submitIntake } from "./actions";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formular intake — ReplacedByAI",
  robots: { index: false, follow: false },
};

export default async function IntakePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const client = await prisma.client.findUnique({
    where: { intakeToken: token },
    include: { intake: true },
  });
  if (!client) notFound();

  if (client.intakeSubmittedAt) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <h1 className="h-display text-3xl mb-3">Mulțumim!</h1>
          <p className="text-[15px] text-[var(--ink-2)] mb-6">
            Formularul a fost deja completat. Echipa noastră a primit datele și revine cât de curând.
          </p>
          <Link href="/" className="text-[14px] text-[var(--ink)] hover:underline">
            ← Înapoi la site
          </Link>
        </div>
      </main>
    );
  }

  const i = client.intake;
  const bind = submitIntake.bind(null, token);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 md:mb-14">
          <p className="eyebrow mb-3">Intake · {client.businessName}</p>
          <h1 className="h-display text-3xl md:text-4xl mb-3">
            Câteva detalii ca să-ți construim agentul.
          </h1>
          <p className="text-[15px] text-[var(--ink-2)] leading-relaxed">
            Completează ce poți acum, restul vor fi clarificate în apelul de kickoff.
            Toate datele sunt salvate criptat și folosite doar pentru implementare.
          </p>
        </header>

        <form action={bind} className="space-y-10">
          <Section title="1. Business">
            <Field name="cui" label="CUI" defaultValue={i?.cui} />
            <Field name="address" label="Adresă sediu" defaultValue={i?.address} />
            <Field name="website" label="Website" defaultValue={i?.website} placeholder="https://" />
            <Field name="brandColors" label="Culori brand (HEX sau descriere)" defaultValue={i?.brandColors} />
            <Field name="toneOfVoice" label="Ton vocal preferat" placeholder="Profesional dar prietenos, formal, energic…" defaultValue={i?.toneOfVoice} />
          </Section>

          <Section title="2. Operațional">
            <Textarea name="workingHours" label="Program de lucru" placeholder="Luni–Vineri 09:00–18:00, Sâmbătă 10:00–14:00…" defaultValue={i?.workingHours} />
            <Textarea name="locations" label="Locații" placeholder="Adresă + telefon pe locație" defaultValue={i?.locations} />
            <Textarea name="services" label="Servicii (denumire, durată, preț)" rows={5} defaultValue={i?.services} />
            <Textarea name="notOffered" label="Ce NU oferim (ca să refuze elegant)" defaultValue={i?.notOffered} />
          </Section>

          <Section title="3. Comunicare">
            <Field name="mainPhone" label="Telefon principal business" defaultValue={i?.mainPhone} />
            <Field name="contactEmail" label="Email contact" type="email" defaultValue={i?.contactEmail} />
            <Checkbox name="whatsappActive" label="Avem deja WhatsApp Business activ" defaultChecked={i?.whatsappActive} />
            <Field name="calendarSystem" label="Sistem calendar" placeholder="Google Calendar, Outlook, Cal.com, niciunul…" defaultValue={i?.calendarSystem} />
            <Field name="crmSystem" label="CRM / sistem programări" placeholder="HubSpot, Notion, Excel, niciunul…" defaultValue={i?.crmSystem} />
          </Section>

          <Section title="4. Integrări disponibile">
            <Checkbox name="hasGoogleWorkspace" label="Google Workspace (Gmail / Calendar / Sheets)" defaultChecked={i?.hasGoogleWorkspace} />
            <Checkbox name="hasMetaBusiness" label="Meta Business (Facebook / Instagram / WhatsApp)" defaultChecked={i?.hasMetaBusiness} />
            <Checkbox name="hasPosErp" label="POS sau ERP (SmartCash, Oblio, Saga, alt sistem)" defaultChecked={i?.hasPosErp} />
            <Checkbox name="hasStripe" label="Stripe / procesator plăți online" defaultChecked={i?.hasStripe} />
          </Section>

          <Section title="5. Conformitate & date sensibile">
            <Checkbox name="euDataOnly" label="Toate datele trebuie să stea exclusiv în UE" defaultChecked={i?.euDataOnly} />
            <Checkbox name="hasMedicalData" label="Procesăm date medicale / fișe pacienți" defaultChecked={i?.hasMedicalData} />
            <Field name="regulatedDomain" label="Domeniu reglementat (medical, financiar, legal…)" defaultValue={i?.regulatedDomain} />
          </Section>

          <Section title="6. FAQ pentru agent">
            <Textarea
              name="faqText"
              label="Întrebări frecvente și răspunsurile lor"
              rows={8}
              placeholder="Q: Cât costă o consultație?&#10;A: 250 lei prima vizită, 180 lei recontrol.&#10;&#10;Q: Aveți parcare?&#10;A: Da, în spatele clădirii, 2h gratuit."
              defaultValue={i?.faqText}
            />
          </Section>

          <Section title="7. Contacte cheie">
            <Field name="testerName" label="Persoană tester (preia apeluri test)" defaultValue={i?.testerName} />
            <Field name="testerPhone" label="Telefon tester" defaultValue={i?.testerPhone} />
            <Field name="testerEmail" label="Email tester" type="email" defaultValue={i?.testerEmail} />
            <Field name="backupDecisionMaker" label="Decident backup (dacă nu te găsim)" defaultValue={i?.backupDecisionMaker} />
            <Field name="doNotDisturb" label="Cui NU trimitem niciodată notificări" defaultValue={i?.doNotDisturb} />
          </Section>

          <div className="sticky bottom-4 z-10 pt-4">
            <button
              type="submit"
              className="w-full md:w-auto px-7 py-3.5 rounded-2xl bg-[var(--ink)] text-[var(--bg-2)] text-[15px] font-medium hover:-translate-y-0.5 transition-all shadow-lg"
            >
              Trimite formularul
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6 md:p-8">
      <h2 className="h-display text-xl mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] eyebrow mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14.5px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
      />
    </label>
  );
}

function Textarea({
  name,
  label,
  rows = 3,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  rows?: number;
  placeholder?: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] eyebrow mb-1.5">{label}</span>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14.5px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20 resize-y"
      />
    </label>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={!!defaultChecked}
        className="w-4 h-4 rounded border-[var(--border)]"
      />
      <span className="text-[14.5px] text-[var(--ink-1)]">{label}</span>
    </label>
  );
}
