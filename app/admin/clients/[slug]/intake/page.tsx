import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function IntakeViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await prisma.client.findUnique({
    where: { slug },
    include: { intake: { include: { uploads: true } } },
  });
  if (!client) notFound();

  const intake = client.intake;

  return (
    <AdminShell>
      <Link
        href={`/admin/clients/${client.slug}`}
        className="inline-flex items-center gap-1 text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] mb-6"
      >
        <ArrowLeft size={14} /> Înapoi la client
      </Link>

      <header className="mb-8">
        <p className="eyebrow mb-2">Intake</p>
        <h1 className="h-display text-3xl">{client.businessName}</h1>
        {client.intakeSubmittedAt && (
          <p className="text-[var(--ink-3)] text-[14px] mt-1">
            Trimis{" "}
            {new Date(client.intakeSubmittedAt).toLocaleString("ro-RO", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </header>

      {!intake ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-10 text-center">
          <p className="text-[14px] text-[var(--ink-3)]">
            Clientul nu a completat încă formularul.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <Section title="1. Business">
            <Row label="CUI" value={intake.cui} />
            <Row label="Adresă" value={intake.address} />
            <Row label="Website" value={intake.website} />
            <Row label="Culori brand" value={intake.brandColors} />
            <Row label="Ton vocal" value={intake.toneOfVoice} />
          </Section>

          <Section title="2. Operațional">
            <Row label="Program" value={intake.workingHours} />
            <Row label="Locații" value={intake.locations} />
            <Row label="Servicii" value={intake.services} multiline />
            <Row label="Nu oferim" value={intake.notOffered} multiline />
          </Section>

          <Section title="3. Comunicare">
            <Row label="Telefon" value={intake.mainPhone} />
            <Row label="Email" value={intake.contactEmail} />
            <Row label="WhatsApp" value={intake.whatsappActive ? "Da" : "Nu"} />
            <Row label="Calendar" value={intake.calendarSystem} />
            <Row label="CRM" value={intake.crmSystem} />
          </Section>

          <Section title="4. Integrări">
            <Row label="Google Workspace" value={intake.hasGoogleWorkspace ? "Da" : "Nu"} />
            <Row label="Meta Business" value={intake.hasMetaBusiness ? "Da" : "Nu"} />
            <Row label="POS / ERP" value={intake.hasPosErp ? "Da" : "Nu"} />
            <Row label="Stripe" value={intake.hasStripe ? "Da" : "Nu"} />
          </Section>

          <Section title="5. Date sensibile">
            <Row label="EU data only" value={intake.euDataOnly ? "Da" : "Nu"} />
            <Row label="Date medicale" value={intake.hasMedicalData ? "Da" : "Nu"} />
            <Row label="Domeniu reglementat" value={intake.regulatedDomain} />
          </Section>

          <Section title="6. FAQ">
            <Row label="FAQ" value={intake.faqText} multiline />
          </Section>

          <Section title="7. Contacte cheie">
            <Row label="Tester" value={intake.testerName} />
            <Row label="Telefon tester" value={intake.testerPhone} />
            <Row label="Email tester" value={intake.testerEmail} />
            <Row label="Backup decident" value={intake.backupDecisionMaker} />
            <Row label="Do not disturb" value={intake.doNotDisturb} />
          </Section>
        </div>
      )}
    </AdminShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)]">
      <div className="px-5 py-3 border-b border-[var(--border)]">
        <h2 className="text-[13px] font-medium">{title}</h2>
      </div>
      <div className="p-5 space-y-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string | null | undefined;
  multiline?: boolean;
}) {
  return (
    <div className={`flex ${multiline ? "flex-col" : "items-baseline"} gap-2 text-[14px] py-1`}>
      <span className="w-40 text-[12px] eyebrow text-[var(--ink-3)] shrink-0">{label}</span>
      <span className={`flex-1 ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {value || <span className="text-[var(--ink-3)]">—</span>}
      </span>
    </div>
  );
}
