import { CTAFinal } from "@/components/home/CTAFinal";
import { ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Blog AI — ghiduri, studii de caz și noutăți din AI",
  description:
    "Articole, ghiduri practice și studii de caz despre cum agenții AI transformă afacerile din România. Învață cum să automatizezi procese reale, pas cu pas.",
  alternates: { canonical: "https://replacedbyai.ro/blog" },
};

const posts = [
  {
    slug: "agent-vocal-restaurant",
    title: "Cum am tăiat 40% din costul de call-center al unui restaurant",
    excerpt:
      "Studiu de caz: un restaurant cu 2 angajați la telefon a trecut la un agent vocal AI în 48h.",
    date: "Aprilie 2025",
  },
  {
    slug: "no-show-clinica",
    title: "No-show de la 28% la 8% într-o clinică stomatologică",
    excerpt:
      "Reminder-uri automate pe WhatsApp + reprogramări inteligente. Iată cifrele complete.",
    date: "Martie 2025",
  },
  {
    slug: "ai-pentru-imm",
    title:
      "De ce AI-ul este oportunitatea decadei pentru IMM-urile din România",
    excerpt:
      "Analiză: cum schimbă agenții AI peisajul afacerilor mici și medii.",
    date: "Februarie 2025",
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="pt-40 pb-16 px-6 max-w-5xl mx-auto">
        <p className="eyebrow mb-4">Blog</p>
        <h1 className="h-display text-5xl md:text-7xl mb-6">
          Articole pentru <span className="gradient-text">antreprenori</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--ink-2)] max-w-2xl">
          Cum funcționează AI-ul în afaceri reale din România.
        </p>
      </section>

      <section className="px-6 max-w-5xl mx-auto pb-32">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] divide-y divide-[var(--border)] overflow-hidden">
          {posts.map((p) => (
            <article
              key={p.slug}
              className="px-6 py-7 group cursor-pointer hover:bg-[var(--bg-3)]/40 transition-colors flex items-start justify-between gap-6"
            >
              <div className="flex-1">
                <div className="text-[12px] text-[var(--ink-3)] mb-2">{p.date}</div>
                <h2 className="h-display-sm text-xl md:text-2xl mb-2">{p.title}</h2>
                <p className="text-[var(--ink-2)] text-[14.5px]">{p.excerpt}</p>
              </div>
              <ArrowUpRight
                size={18}
                className="text-[var(--ink-4)] group-hover:text-[var(--ink)] mt-1 shrink-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm text-[var(--ink-3)]">
          Articole complete urmează în curând.
        </p>
      </section>

      <CTAFinal />
    </>
  );
}
