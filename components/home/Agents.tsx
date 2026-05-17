"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { agents } from "@/lib/agents";

export function Agents() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="agenti" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <p className="eyebrow mb-4">Catalogul de agenți</p>
            <h2 className="h-display text-4xl md:text-5xl max-w-2xl">
              Echipa ta artificială, <br />
              <span className="gradient-text">gata de muncă.</span>
            </h2>
          </div>
          <Link
            href="/agenti"
            className="text-[14px] text-[var(--ink-2)] hover:text-[var(--ink)] flex items-center gap-1 group whitespace-nowrap"
          >
            Vezi toți agenții
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {agents.slice(0, 12).map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={a.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.035 }}
              >
                <Link
                  href={`/agenti/${a.slug}`}
                  className="card-hover group block rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-5"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-9 h-9 rounded-lg bg-[var(--bg-3)] flex items-center justify-center text-[var(--ink-1)] group-hover:bg-[var(--ink)] group-hover:text-[var(--bg-2)] transition-all">
                      <Icon size={16} />
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                  </div>
                  <div className="h-display-sm text-base mb-1">{a.name}</div>
                  <div className="text-[11.5px] text-[var(--ink-3)]">{a.role}</div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
