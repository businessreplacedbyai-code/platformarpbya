"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ADS = [
  { src: "/ads/ad-statement.png", alt: "Lasă AI-ul să răspundă la telefon", w: 1080, h: 1080 },
  { src: "/ads/ad-editorial.png", alt: "Cine îți răspunde la 3:24 dimineața?", w: 1080, h: 1350 },
  { src: "/ads/ad-how-it-works.png", alt: "De la zero la agent activ — pas cu pas", w: 1080, h: 1920 },
];

export function AdsShowcase() {
  return (
    <section className="relative py-32 px-6 overflow-hidden" style={{ background: "var(--bg-2)" }}>
      {/* background blur blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
        <div className="absolute -bottom-32 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.28em] mb-6 border" style={{ color: "var(--ink-3)", borderColor: "var(--border)" }}>
            Comunicare autentică
          </span>
          <h2 className="h-display text-4xl md:text-5xl tracking-tight mb-4">
            Mesaje clare.<br />
            <span className="gradient-text">Fără jargon AI.</span>
          </h2>
          <p className="text-[16px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            Direct la subiect — exact ca tot ce facem.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
          {ADS.map((ad, i) => (
            <motion.div
              key={ad.src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)] transition-shadow duration-500 w-full md:w-auto"
            >
              <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" style={{ boxShadow: "inset 0 0 0 2px var(--accent)" }} />
              <Image
                src={ad.src}
                alt={ad.alt}
                width={ad.w}
                height={ad.h}
                className="block w-full md:w-[300px] lg:w-[340px] h-auto"
                sizes="(max-width: 768px) 100vw, 340px"
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link
            href="/preturi"
            className="inline-flex items-center gap-2 btn btn-secondary px-6 py-3 text-[14px]"
          >
            Vezi pachetele și prețurile
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
