"use client";
import Link from "next/link";
import { Globe, Phone, MessageCircle, Check, ArrowRight, Sparkles, CalendarDays } from "lucide-react";

export function StudioClient({ base = "/admin" }: { base?: string }) {
  // Demo: starea onboarding-ului (în producție vine din contul + planul userului)
  const plan = "Pro";
  const steps = [
    { label: "Creează-ți primul site", done: false, href: `${base}/builder` },
    { label: "Activează un agent", done: false, href: `${base}/activare` },
    { label: "Conectează canalele (WhatsApp, Calendar)", done: false, href: `${base}/activare` },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <p className="text-[12px] uppercase tracking-wider text-[var(--ink-3)] mb-1">Studio</p>
          <h1 className="h-display text-[2.2rem] leading-tight mb-1">Ce creăm azi? 👋</h1>
          <p className="text-[14.5px] text-[var(--ink-2)]">Site sau agent AI — în câteva minute, fără cod.</p>
        </div>
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium" style={{ background: "var(--bg-3)" }}>
          <Sparkles size={13} /> Planul tău: <b>{plan}</b>
        </span>
      </div>

      {/* Două acțiuni mari */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <BigCard
          href={`${base}/builder`}
          icon={Globe}
          title="Creează un site"
          desc="Alegi stilul, completezi, generezi poze + video AI. Live în 10 minute."
          cta="Deschide builder-ul"
          tint="#7C3AED"
        />
        <BigCard
          href={`${base}/activare`}
          icon={Phone}
          title="Activează un agent"
          desc="Agent vocal care răspunde la telefon 24/7. Integrare cu un cod, fără tehnician."
          cta="Activează agentul"
          tint="#0EA5E9"
        />
      </div>

      {/* Onboarding / progres */}
      <div className="rounded-2xl p-5 mb-8" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[14px] font-medium">Pașii tăi · {doneCount}/{steps.length}</div>
          <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-3)" }}>
            <div className="h-full" style={{ width: `${(doneCount / steps.length) * 100}%`, background: "#059669" }} />
          </div>
        </div>
        <div className="space-y-2">
          {steps.map((s) => (
            <Link key={s.label} href={s.href} className="flex items-center gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-[var(--bg-3)]">
              <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: s.done ? "#059669" : "var(--bg-3)", color: s.done ? "#fff" : "var(--ink-3)", border: s.done ? "none" : "1px solid var(--border)" }}>
                {s.done ? <Check size={13} /> : <span className="text-[11px]">○</span>}
              </span>
              <span className="flex-1 text-[14px]" style={{ color: s.done ? "var(--ink-3)" : "var(--ink-1)", textDecoration: s.done ? "line-through" : "none" }}>{s.label}</span>
              <ArrowRight size={15} className="text-[var(--ink-3)]" />
            </Link>
          ))}
        </div>
      </div>

      {/* Ce mai poți face */}
      <div className="text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-3">Conectează & extinde</div>
      <div className="grid sm:grid-cols-3 gap-3">
        <MiniCard icon={MessageCircle} title="WhatsApp" desc="Răspuns automat la mesaje" href={`${base}/activare`} />
        <MiniCard icon={CalendarDays} title="Google Calendar" desc="Programări automate" href={`${base}/activare`} />
        <MiniCard icon={MessageCircle} title="Instagram & Messenger" desc="DM-uri pe pilot automat" href={`${base}/activare`} />
      </div>

      <p className="text-[12.5px] text-[var(--ink-3)] mt-7">
        Totul dintr-un singur loc: creezi, activezi, conectezi. Fără cod, fără să aștepți pe nimeni.
      </p>
    </div>
  );
}

function BigCard({ href, icon: Icon, title, desc, cta, tint }: {
  href: string; icon: typeof Globe; title: string; desc: string; cta: string; tint: string;
}) {
  return (
    <Link href={href} className="group rounded-2xl p-6 transition-all hover:-translate-y-0.5"
      style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${tint}1a`, color: tint }}>
        <Icon size={22} />
      </div>
      <div className="text-[18px] font-semibold mb-1.5">{title}</div>
      <p className="text-[13.5px] text-[var(--ink-2)] leading-relaxed mb-5">{desc}</p>
      <span className="inline-flex items-center gap-1.5 text-[13.5px] font-medium" style={{ color: tint }}>
        {cta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function MiniCard({ icon: Icon, title, desc, href }: { icon: typeof Globe; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="rounded-xl p-4 flex items-start gap-3 transition-colors hover:bg-[var(--bg-3)]" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bg-3)" }}><Icon size={16} /></div>
      <div>
        <div className="text-[14px] font-medium">{title}</div>
        <div className="text-[12px] text-[var(--ink-3)] mt-0.5">{desc}</div>
      </div>
    </Link>
  );
}
