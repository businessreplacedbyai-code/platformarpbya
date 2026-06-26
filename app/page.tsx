import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { Problem } from "@/components/home/Problem";
import { Services } from "@/components/home/Services";
import { FreeDemo } from "@/components/home/FreeDemo";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AudioDemo } from "@/components/home/AudioDemo";
import { VideoDemo } from "@/components/home/VideoDemo";
import { Agents } from "@/components/home/Agents";
import { ROICalculator } from "@/components/home/ROICalculator";
import { ContactCTA } from "@/components/home/ContactCTA";
import { FAQ } from "@/components/home/FAQ";
import { CTAFinal } from "@/components/home/CTAFinal";

const SITE_URL = "https://www.replacedbyai.ro";

export const metadata: Metadata = {
  title: "ReplacedByAI — Agenți AI pentru afaceri din România",
  description:
    "Instalăm agenți AI vocali care preiau apeluri, vând, programează și răspund clienților tăi 24/7. Audit și demo gratuit, fără obligații. Pentru afaceri din România.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "ReplacedByAI — Agenți AI pentru afaceri din România",
    description:
      "Instalăm agenți AI vocali care preiau apeluri, vând și programează 24/7. Audit și demo gratuit, fără obligații.",
    url: SITE_URL,
    siteName: "ReplacedByAI",
    locale: "ro_RO",
    type: "website",
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "ReplacedByAI — 15 agenți AI pentru afaceri din România" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReplacedByAI — Agenți AI pentru afaceri din România",
    description: "Agenți AI care preiau apeluri, vând, programează și facturează 24/7.",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Cât durează implementarea?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Instalăm agentul în ~5 zile lucrătoare de la audit. Tu nu faci nimic tehnic — ne ocupăm noi de configurare, voce și integrări.",
      },
    },
    {
      "@type": "Question",
      name: "Trebuie să schimb ceva în afacerea mea?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nu. Agenții se integrează în ce ai deja: telefonul existent, WhatsApp-ul business, Google Calendar, site-ul tău.",
      },
    },
    {
      "@type": "Question",
      name: "Ce se întâmplă dacă agentul nu știe să răspundă?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Escaladează automat la tine prin SMS sau email. Niciun client nu rămâne fără răspuns.",
      },
    },
    {
      "@type": "Question",
      name: "Pot testa înainte să plătesc?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Da. Începi cu un audit și un demo de agent gratuit, pe afacerea ta — vezi rezultatul înainte să plătești ceva.",
      },
    },
    {
      "@type": "Question",
      name: "Funcționează și pentru afaceri mici?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tocmai pentru ele am construit ReplacedByAI. Un restaurant cu 3 angajați beneficiază la fel ca un lanț cu 50 de locații.",
      },
    },
    {
      "@type": "Question",
      name: "Ce se întâmplă cu datele clienților mei?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Serverele sunt în Europa (GDPR compliant). Datele tale nu sunt folosite pentru antrenarea niciunui model AI.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Hero />
      <TrustStrip />
      <Problem />
      <Services />
      <FreeDemo />
      <HowItWorks />
      <AudioDemo />
      <VideoDemo />
      <Agents />
      <ROICalculator />
<ContactCTA />
      <FAQ />
      <CTAFinal />
    </>
  );
}
