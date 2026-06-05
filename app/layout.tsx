import type { Metadata } from "next";
import { Geist, DM_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChromeGate } from "@/components/layout/ChromeGate";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://www.replacedbyai.ro";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ReplacedByAI — Agenți AI pentru afaceri din România",
    template: "%s | ReplacedByAI",
  },
  description:
    "ReplacedByAI implementează agenți AI care preiau apeluri, vând, programează și răspund clienților 24/7. Plus site-uri premium, magazine online și platforme digitale custom pentru afaceri din România.",
  applicationName: "ReplacedByAI",
  authors: [{ name: "ReplacedByAI", url: SITE_URL }],
  creator: "ReplacedByAI",
  publisher: "ReplacedByAI",
  category: "Business",
  keywords: [
    "agenți AI România",
    "agenție AI România",
    "agent vocal AI",
    "automatizare afaceri",
    "AI pentru IMM",
    "chatbot România",
    "inteligență artificială afaceri",
    "VoiceBot AI",
    "agent AI vânzări",
    "agent AI programări",
    "ReplacedByAI",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: {
      "ro-RO": SITE_URL,
    },
  },
  openGraph: {
    title: "ReplacedByAI — Agenți AI pentru afaceri din România",
    description:
      "Agenți AI care preiau apeluri, vând, programează și răspund clienților 24/7. Înlocuiește joburile repetitive cu inteligență artificială.",
    url: SITE_URL,
    siteName: "ReplacedByAI",
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReplacedByAI — Agenți AI pentru afaceri din România",
    description:
      "Agenți AI care preiau apeluri, vând, programează și facturează 24/7.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: {
    // Adaugă codul când vei avea cont Google Search Console:
    // google: "ABCDEFG...",
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  name: "ReplacedByAI",
  alternateName: "Replaced By AI",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-mark.png`,
  image: `${SITE_URL}/opengraph-image`,
  description:
    "ReplacedByAI implementează agenți de inteligență artificială pentru afaceri din România. Agenți vocali, programări automate, vânzări și suport clienți 24/7.",
  email: "contact@replacedbyai.ro",
  address: {
    "@type": "PostalAddress",
    addressCountry: "RO",
  },
  areaServed: { "@type": "Country", name: "Romania" },
  knowsAbout: ["Artificial Intelligence", "AI Agents", "Business Automation", "Voice AI", "Chatbots"],
  sameAs: [
    "https://www.linkedin.com/company/replacedbyai",
    "https://www.facebook.com/replacedbyai",
    "https://www.instagram.com/replacedbyai",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ReplacedByAI",
  url: SITE_URL,
  inLanguage: "ro-RO",
  publisher: { "@type": "Organization", name: "ReplacedByAI" },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ro"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] overflow-x-hidden"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <ChromeGate><Footer /></ChromeGate>
      </body>
    </html>
  );
}
