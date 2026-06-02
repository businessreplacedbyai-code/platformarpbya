import Link from "next/link";
import { CTAFinal } from "@/components/home/CTAFinal";
import { ArrowUpRight } from "lucide-react";
import { posts } from "@/lib/posts";

export const metadata = {
  title: "Blog AI — ghiduri, studii de caz și noutăți din AI",
  description:
    "Articole, ghiduri practice și studii de caz despre cum agenții AI transformă afacerile din România. Învață cum să automatizezi procese reale, pas cu pas.",
  alternates: { canonical: "https://www.replacedbyai.ro/blog" },
  openGraph: {
    title: "Blog AI | ReplacedByAI",
    description: "Studii de caz și ghiduri despre automatizarea afacerilor cu AI în România.",
    url: "https://www.replacedbyai.ro/blog",
    type: "website" as const,
    images: [{ url: "https://www.replacedbyai.ro/opengraph-image", width: 1200, height: 630 }],
  },
};

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
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="px-6 py-7 group flex items-start justify-between gap-6 hover:bg-[var(--bg-3)]/40 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] eyebrow px-2 py-0.5 rounded-full bg-[var(--bg-3)] border border-[var(--border)]">
                    {p.category}
                  </span>
                  <span className="text-[12px] text-[var(--ink-3)]">{p.date}</span>
                  <span className="text-[12px] text-[var(--ink-4)]">·</span>
                  <span className="text-[12px] text-[var(--ink-3)]">{p.readingTime} citire</span>
                </div>
                <h2 className="h-display-sm text-xl md:text-2xl mb-2">{p.title}</h2>
                <p className="text-[var(--ink-2)] text-[14.5px]">{p.excerpt}</p>
              </div>
              <ArrowUpRight
                size={18}
                className="text-[var(--ink-4)] group-hover:text-[var(--ink)] mt-1 shrink-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      </section>

      <CTAFinal />
    </>
  );
}
