"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";

export function ContactCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-32 px-6 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-[radial-gradient(circle,rgba(167,139,250,0.10),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="eyebrow mb-4">Contact direct</p>
            <h2 className="h-display text-4xl md:text-5xl lg:text-6xl mb-6 leading-[1.05]">
              Scrie-ne și primești{" "}
              <span className="gradient-text">analiza gratuită.</span>
            </h2>
            <p className="text-lg text-[var(--ink-2)] leading-relaxed mb-8 max-w-xl">
              Completează formularul de contact și îți trimitem în cel mai scurt timp posibil
              o analiză a proceselor din afacerea ta care pot fi automatizate.
              Fără obligații, fără jargon.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[var(--ink)] text-[var(--bg-2)] text-[15px] font-medium hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] transition-all"
              >
                <MessageCircle size={16} />
                Trimite cererea
              </a>
              <a
                href="mailto:contact@replacedbyai.ro"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--bg-3)] transition-all text-[15px]"
              >
                <Mail size={16} />
                contact@replacedbyai.ro
              </a>
            </div>

            <p className="mt-5 text-[13px] text-[var(--ink-3)]">
              Răspuns rapid · Analiză gratuită · Fără obligații
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="grid gap-3"
          >
            <ContactCard
              icon={Mail}
              label="Email"
              value="contact@replacedbyai.ro"
              href="mailto:contact@replacedbyai.ro"
              hint="Răspundem în cel mai scurt timp posibil"
            />
            <ContactCard
              icon={MessageCircle}
              label="Formular contact"
              value="replacedbyai.ro/contact"
              href="/contact"
              hint="Analiză gratuită după trimitere"
            />
            <ContactCard
              icon={MapPin}
              label="Birou"
              value="România"
              hint="Luni–Vineri · 9:00–18:00"
            />
            <ContactCard
              icon={Clock}
              label="Timp răspuns"
              value="Cât mai repede"
              hint="În zilele lucrătoare"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  hint: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className="w-11 h-11 rounded-xl bg-[var(--bg-3)] flex items-center justify-center text-[var(--ink-1)] shrink-0 group-hover:bg-[var(--ink)] group-hover:text-[var(--bg-2)] transition-all">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="eyebrow mb-1">{label}</div>
        <div className="text-[15px] text-[var(--ink)] font-medium truncate">
          {value}
        </div>
        <div className="text-[12.5px] text-[var(--ink-3)] mt-0.5">{hint}</div>
      </div>
    </>
  );

  const classes =
    "card-hover group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5";

  if (href) {
    return (
      <a href={href} className={classes}>
        {inner}
      </a>
    );
  }
  return <div className={classes}>{inner}</div>;
}
