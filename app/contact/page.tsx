import { ContactFormPro } from "@/components/contact/ContactFormPro";
import { Mail, MapPin, Clock, Phone, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Contact — sună și vorbește cu agentul nostru AI",
  description:
    "Sună sau scrie-ne. La telefon răspunde VoiceBot, agentul nostru vocal AI, 24/7. Programare instant, analiză gratuită și recomandări concrete pentru afacerea ta.",
  alternates: { canonical: "https://replacedbyai.ro/contact" },
};

export default function ContactPage() {
  return (
    <section className="pt-40 pb-32 px-6 max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16">
        <div>
          <p className="eyebrow mb-4">Contact</p>
          <h1 className="h-display text-5xl md:text-6xl mb-6">
            Sună sau scrie — <span className="gradient-text">răspunde agentul AI.</span>
          </h1>
          <p className="text-lg text-[var(--ink-2)] mb-10 leading-relaxed">
            La telefon răspunde VoiceBot — propriul nostru agent vocal AI.
            Îți pune câteva întrebări, recomandă agenții potriviți și
            programează discuția cu echipa. Funcționează 24/7.
          </p>

          <a
            href="tel:+40700000000"
            className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[var(--ink)] text-[var(--bg-2)] text-[16px] font-medium hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] transition-all mb-8"
          >
            <Phone size={18} />
            <span>+40 700 000 000</span>
            <span className="text-[12px] opacity-70 ml-2">Apel gratuit · 24/7</span>
          </a>

          <div className="space-y-3">
            <ContactRow icon={Phone} label="Telefon (VoiceBot AI)">
              <a href="tel:+40700000000" className="text-[var(--ink)] hover:underline">
                +40 700 000 000
              </a>
            </ContactRow>
            <ContactRow icon={MessageCircle} label="WhatsApp">
              <a
                href="https://wa.me/40700000000"
                className="text-[var(--ink)] hover:underline"
              >
                +40 700 000 000
              </a>
            </ContactRow>
            <ContactRow icon={Mail} label="Email">
              <a
                href="mailto:hello@replacedbyai.ro"
                className="text-[var(--ink)] hover:underline"
              >
                hello@replacedbyai.ro
              </a>
            </ContactRow>
            <ContactRow icon={MapPin} label="Birou">
              <span className="text-[var(--ink)]">Botoșani, România</span>
            </ContactRow>
            <ContactRow icon={Clock} label="Program echipă umană">
              <span className="text-[var(--ink)]">Luni–Vineri · 9:00–18:00</span>
            </ContactRow>
          </div>
        </div>

        <ContactFormPro />
      </div>
    </section>
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
