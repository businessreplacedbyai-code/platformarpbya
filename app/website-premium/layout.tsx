import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site Web Premium pentru Afaceri | Web Development România",
  description:
    "Construim site-uri web profesionale în Next.js cu 3D nativ, scroll storytelling și design unic garantat. Performanță 100/100, SEO integrat. Web development pentru restaurante, cafenele, saloane și IMM-uri din România.",
  keywords: [
    "site web premium România",
    "web development România",
    "creare site web profesional",
    "site Next.js România",
    "dezvoltare web afaceri",
    "web design România",
    "site web restaurant",
    "site web cafenea",
    "site web salon",
    "agentie web development Romania",
    "creare website IMM",
  ],
  alternates: {
    canonical: "https://www.replacedbyai.ro/website-premium",
  },
  openGraph: {
    title: "Site Web Premium — Web Development pentru Afaceri | ReplacedByAI",
    description:
      "Site-uri web în Next.js cu 3D, animații și design unic. Performanță 100/100, SEO, mobile-first. Construite pentru afaceri din România.",
    url: "https://www.replacedbyai.ro/website-premium",
    type: "website",
  },
};

export default function WebsitePremiumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
