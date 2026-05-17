"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/agents";

export function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="servicii"
      className="relative py-32 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <p className="eyebrow mb-4">Servicii</p>
            <h2 className="h-display text-4xl md:text-5xl max-w-2xl">
              Funcții pe care le <br />
              <span className="gradient-text">automatizăm complet.</span>
            </h2>
          </div>
          <Link
            href="/servicii"
            className="text-[14px] text-[var(--ink-2)] hover:text-[var(--ink)] flex items-center gap-1 group whitespace-nowrap"
          >
            Vezi toate serviciile
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  href={`/servicii/${s.slug}`}
                  className="card-hover group block h-full rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-7 min-h-[260px] flex flex-col"
                >
                  <div className="flex items-start justify-between mb-12">
                    <div className="w-11 h-11 rounded-xl bg-[var(--bg-3)] flex items-center justify-center text-[var(--ink-1)] group-hover:bg-[var(--ink)] group-hover:text-[var(--bg-2)] transition-all">
                      <Icon size={18} />
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="text-[var(--ink-4)] group-hover:text-[var(--ink)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                    />
                  </div>

                  <div className="mt-auto">
                    <h3 className="h-display-sm text-xl mb-2">{s.title}</h3>
                    <p className="text-[14.5px] text-[var(--ink-3)] leading-relaxed">
                      {s.tagline}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
