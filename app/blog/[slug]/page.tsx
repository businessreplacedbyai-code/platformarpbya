import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { posts, getPost } from "@/lib/posts";
import { CTAFinal } from "@/components/home/CTAFinal";
import type { Metadata } from "next";

const SITE_URL = "https://www.replacedbyai.ro";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Articol" };
  return {
    title: `${post.title} | ReplacedByAI Blog`,
    description: post.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.dateIso,
      authors: ["ReplacedByAI"],
      images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.dateIso,
    dateModified: post.dateIso,
    author: { "@type": "Organization", name: "ReplacedByAI", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "ReplacedByAI",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-mark.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
    image: `${SITE_URL}/opengraph-image`,
    url: `${SITE_URL}/blog/${post.slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <article className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] mb-10 transition-colors"
        >
          <ArrowLeft size={13} /> Blog
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] eyebrow px-2.5 py-1 rounded-full bg-[var(--bg-3)] border border-[var(--border)]">
              {post.category}
            </span>
            <span className="text-[12px] text-[var(--ink-3)]">{post.date}</span>
            <span className="text-[12px] text-[var(--ink-4)]">·</span>
            <span className="text-[12px] text-[var(--ink-3)]">{post.readingTime} citire</span>
          </div>
          <h1 className="h-display text-4xl md:text-5xl leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-lg text-[var(--ink-2)] leading-relaxed">{post.excerpt}</p>
        </header>

        <div
          className="prose-rbai"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <CTAFinal />
    </>
  );
}
