import { ContactFormPro } from "@/components/contact/ContactFormPro";
import { Mail, MapPin, Clock, LifeBuoy, MessageCircle, FileText } from "lucide-react";

export const metadata = {
  title: "Contact — vorbește cu echipa ReplacedByAI",
  description:
    "Scrie-ne sau completează formularul. Răspundem în cel mai scurt timp posibil în zilele lucrătoare. Analiză gratuită pentru afacerea ta.",
  alternates: { canonical: "https://www.replacedbyai.ro/contact" },
};

export default function ContactPage() {
  return (
    <main className="pt-40 pb-32 px-6 max-w-6xl mx-auto space-y-24">
      {/* Contact principal */}
      <section>
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <p className="eyebrow mb-4">Contact</p>
            <h1 className="h-display text-5xl md:text-6xl mb-6">
              Scrie-ne — <span className="gradient-text">răspundem cât mai repede.</span>
            </h1>
            <p className="text-lg text-[var(--ink-2)] mb-10 leading-relaxed">
              Completează formularul și îți trimitem o analiză gratuită a proceselor
              care pot fi automatizate în afacerea ta. Fără obligații.
            </p>

            <div className="space-y-3">
              <ContactRow icon={Mail} label="Email">
                <a
                  href="mailto:contact@replacedbyai.ro"
                  className="text-[var(--ink)] hover:underline"
                >
                  contact@replacedbyai.ro
                </a>
              </ContactRow>
              <ContactRow icon={MapPin} label="Birou">
                <span className="text-[var(--ink)]">România</span>
              </ContactRow>
              <ContactRow icon={Clock} label="Program echipă">
                <span className="text-[var(--ink)]">Luni–Vineri · 9:00–18:00</span>
              </ContactRow>
            </div>
          </div>

          <ContactFormPro />
        </div>
      </section>

      {/* Suport clienți */}
      <section className="border-t border-[var(--border)] pt-20">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Suport</p>
          <h2 className="h-display text-3xl md:text-4xl mb-4">
            Ești deja client? <span className="gradient-text">Te ajutăm rapid.</span>
          </h2>
          <p className="text-[var(--ink-2)] mb-10 leading-relaxed">
            Pentru probleme tehnice, modificări ale agenților sau întrebări despre abonament,
            scrie-ne direct la <a href="mailto:contact@replacedbyai.ro" className="text-[var(--ink)] underline">contact@replacedbyai.ro</a> cu
            subiectul „[SUPORT] + numele firmei tale" — prioritizăm cererile existente.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <SupportCard
            icon={MessageCircle}
            title="Probleme tehnice"
            description="Agent nefuncțional, erori de integrare, răspunsuri incorecte. Răspundem în cel mai scurt timp."
            action="contact@replacedbyai.ro"
            actionHref="mailto:contact@replacedbyai.ro?subject=[SUPORT] Problemă tehnică"
          />
          <SupportCard
            icon={FileText}
            title="Modificări & configurare"
            description="Vrei să actualizezi scriptul agentului, orarul de lucru sau integrările existente."
            action="contact@replacedbyai.ro"
            actionHref="mailto:contact@replacedbyai.ro?subject=[SUPORT] Modificare configurare"
          />
          <SupportCard
            icon={LifeBuoy}
            title="Abonament & facturare"
            description="Întrebări despre factură, upgrade plan, pauză sau anulare abonament."
            action="contact@replacedbyai.ro"
            actionHref="mailto:contact@replacedbyai.ro?subject=[SUPORT] Abonament"
          />
        </div>

        <div className="mt-10 p-5 rounded-2xl bg-[var(--bg-2)] border border-[var(--border)]">
          <p className="text-[13.5px] text-[var(--ink-2)]">
            <strong className="text-[var(--ink)]">SLA suport clienți activi:</strong> Probleme critice (agent oprit) — răspuns în <strong>2 ore</strong> lucrătoare.
            Modificări și alte solicitări — răspuns în <strong>24 ore</strong> lucrătoare.
          </p>
        </div>
      </section>
    </main>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-4">
      <div className="w-10 h-10 rounded-lg bg-[var(--bg-3)] flex items-center justify-center text-[var(--ink-1)] shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <div className="text-[11px] eyebrow mb-1">{label}</div>
        <div className="text-[14.5px]">{children}</div>
      </div>
    </div>
  );
}

function SupportCard({
  icon: Icon,
  title,
  description,
  action,
  actionHref,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  action: string;
  actionHref: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6 flex flex-col gap-4">
      <div className="w-10 h-10 rounded-xl bg-[var(--bg-3)] border border-[var(--border)] flex items-center justify-center text-[var(--ink-1)]">
        <Icon size={16} />
      </div>
      <div>
        <h3 className="font-semibold text-[var(--ink)] mb-1">{title}</h3>
        <p className="text-[13.5px] text-[var(--ink-2)] leading-relaxed">{description}</p>
      </div>
      <a
        href={actionHref}
        className="mt-auto text-[13px] text-[var(--ink)] underline underline-offset-2 hover:opacity-70 transition-opacity"
      >
        {action} →
      </a>
    </div>
  );
}
