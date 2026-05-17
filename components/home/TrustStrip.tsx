"use client";
import { motion } from "framer-motion";
import { Clock, ShieldCheck, Zap, Headphones } from "lucide-react";

const badges = [
  {
    icon: Clock,
    label: "Răspuns în 4h",
    sub: "în zilele lucrătoare",
  },
  {
    icon: Zap,
    label: "Setup în 48h",
    sub: "primul agent live",
  },
  {
    icon: ShieldCheck,
    label: "Garanție 30 zile",
    sub: "nu te potrivește? recuperezi banii",
  },
  {
    icon: Headphones,
    label: "Suport 7/7",
    sub: "tehnic & operațional",
  },
];

export function TrustStrip() {
  return (
    <section className="relative py-10 border-y border-[var(--border)] bg-[var(--bg-2)]/60">
      <div className="max-w-6xl mx-auto px-6">
        <motion.ul
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8"
        >
          {badges.map(({ icon: Icon, label, sub }) => (
            <li key={label} className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] flex items-center justify-center">
                <Icon size={16} className="text-[var(--ink-1)]" />
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-[var(--ink)] leading-tight">
                  {label}
                </div>
                <div className="text-[12px] text-[var(--ink-3)] mt-0.5 leading-snug">
                  {sub}
                </div>
              </div>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
