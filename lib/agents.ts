import {
  Phone,
  Calendar,
  TrendingUp,
  Headphones,
  Share2,
  PenTool,
  Calculator,
  LineChart,
  Palette,
  Star,
  Users,
  Package,
  Target,
  GraduationCap,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export type Agent = {
  slug: string;
  name: string;
  role: string;
  icon: LucideIcon;
  short: string;
  description: string;
  setupFrom: number;
  monthlyFrom: number;
};

export const agents: Agent[] = [
  {
    slug: "voicebot",
    name: "VoiceBot",
    role: "Agent Vocal",
    icon: Phone,
    short: "Preia apeluri 24/7 cu voce AI realistă.",
    description:
      "Voce AI realistă care preia apeluri, ia comenzi și programează clienți. Răspunde la 100% dintre apeluri, fără pauze.",
    setupFrom: 99,
    monthlyFrom: 179,
  },
  {
    slug: "schedulerbot",
    name: "SchedulerBot",
    role: "Agent Programări",
    icon: Calendar,
    short: "Programări automate pe WhatsApp, web și telefon.",
    description:
      "Clientul programează când vrea, oriunde. Reminder-uri automate, no-show redus cu 70%.",
    setupFrom: 79,
    monthlyFrom: 99,
  },
  {
    slug: "salesbot",
    name: "SalesBot",
    role: "Agent Vânzări",
    icon: TrendingUp,
    short: "Califică lead-uri și urmărește pipeline-ul.",
    description:
      "Califică lead-uri, trimite oferte, urmărește pipeline-ul. Vânzătorul tău AI nu obosește niciodată.",
    setupFrom: 99,
    monthlyFrom: 149,
  },
  {
    slug: "supportbot",
    name: "SupportBot",
    role: "Suport Clienți 24/7",
    icon: Headphones,
    short: "Răspunsuri instant pe baza documentelor tale.",
    description:
      "Răspunde la întrebările clienților pe baza documentelor afacerii tale. Escaladează cazurile complexe la tine.",
    setupFrom: 59,
    monthlyFrom: 89,
  },
  {
    slug: "socialbot",
    name: "SocialBot",
    role: "Social Media",
    icon: Share2,
    short: "Calendar editorial și postare automată.",
    description:
      "Calendar editorial, generare conținut, postare automată pe toate platformele. Brandul tău activ zilnic.",
    setupFrom: 69,
    monthlyFrom: 119,
  },
  {
    slug: "contentbot",
    name: "ContentBot",
    role: "Editor & Copywriter",
    icon: PenTool,
    short: "Articole, e-mailuri și texte de vânzare.",
    description:
      "Generează articole de blog, newsletter-uri și landing pages. Copy adaptat brandului tău.",
    setupFrom: 49,
    monthlyFrom: 89,
  },
  {
    slug: "accountbot",
    name: "AccountBot",
    role: "Contabil AI",
    icon: Calculator,
    short: "Facturi automate, urmărire plăți restante.",
    description:
      "Facturi automate, urmărire plăți restante, rapoarte lunare. Contabilul tău AI nu uită niciodată o factură.",
    setupFrom: 79,
    monthlyFrom: 69,
  },
  {
    slug: "financebot",
    name: "FinanceBot",
    role: "Analist Financiar",
    icon: LineChart,
    short: "Dashboard-uri și prognoze cash-flow.",
    description:
      "Rapoarte financiare, analize de profitabilitate, prognoze de cash-flow în timp real.",
    setupFrom: 99,
    monthlyFrom: 129,
  },
  {
    slug: "designbot",
    name: "DesignBot",
    role: "Designer Grafic",
    icon: Palette,
    short: "Vizualuri pentru social, ads și site.",
    description:
      "Generează bannere, postări sociale și creative pentru reclame, păstrând identitatea brandului.",
    setupFrom: 59,
    monthlyFrom: 119,
  },
  {
    slug: "reviewbot",
    name: "ReviewBot",
    role: "Reputație Online",
    icon: Star,
    short: "Răspunde și monitorizează review-urile.",
    description:
      "Răspunde automat la review-uri Google, monitorizează menționările brandului și raportează tendințele.",
    setupFrom: 39,
    monthlyFrom: 79,
  },
  {
    slug: "hrbot",
    name: "HRBot",
    role: "Recrutor AI",
    icon: Users,
    short: "Screening CV-uri și interviuri inițiale.",
    description:
      "Filtrează aplicanți, susține interviuri inițiale și programează interviurile finale cu tine.",
    setupFrom: 79,
    monthlyFrom: 119,
  },
  {
    slug: "inventorybot",
    name: "InventoryBot",
    role: "Manager Stoc",
    icon: Package,
    short: "Stoc monitorizat și recomandări de comandă.",
    description:
      "Monitorizează stocul, anticipează rupturile și plasează automat comenzi de reaprovizionare.",
    setupFrom: 89,
    monthlyFrom: 109,
  },
  {
    slug: "leadbot",
    name: "LeadBot",
    role: "Generator Lead-uri",
    icon: Target,
    short: "Prospectează și califică lead-uri B2B.",
    description:
      "Caută prospecți relevanți, îi contactează prin e-mail/LinkedIn și îi califică înainte de transfer la vânzări.",
    setupFrom: 89,
    monthlyFrom: 109,
  },
  {
    slug: "trainingbot",
    name: "TrainingBot",
    role: "Trainer Intern",
    icon: GraduationCap,
    short: "Onboarding și training pentru echipă.",
    description:
      "Materiale de training personalizate, quiz-uri și asistent intern pentru angajații tăi noi.",
    setupFrom: 69,
    monthlyFrom: 99,
  },
  {
    slug: "advisorbot",
    name: "AdvisorBot",
    role: "Strateg Business",
    icon: Briefcase,
    short: "Analize și recomandări strategice.",
    description:
      "Analizează datele afacerii și sugerează decizii strategice bazate pe benchmark-uri din industria ta.",
    setupFrom: 99,
    monthlyFrom: 149,
  },
];

export const services = [
  {
    slug: "agent-vocal",
    title: "Agent Vocal AI",
    tagline: "Înlocuiește call center-ul tău cu o voce AI realistă.",
    description:
      "Voce AI realistă care preia apeluri, ia comenzi și programează. 24/7, zero greșeli.",
    icon: Phone,
  },
  {
    slug: "agent-programari",
    title: "Agent Programări",
    tagline: "WhatsApp + web + telefon. Clientul programează când vrea.",
    description:
      "Reminder-uri automate. No-show redus cu 70%. Programări 24/7 fără efort uman.",
    icon: Calendar,
  },
  {
    slug: "agent-vanzari",
    title: "Agent Vânzări & Leads",
    tagline: "Califică lead-uri, trimite oferte, urmărește pipeline-ul.",
    description:
      "Vânzătorul tău AI nu obosește și nu pierde oportunități. Funcționează în timp ce dormi.",
    icon: TrendingUp,
  },
  {
    slug: "agent-suport",
    title: "Agent Suport Clienți",
    tagline: "Răspunde la întrebările clienților 24/7.",
    description:
      "Pe baza documentelor afacerii tale. Escaladează cazurile complexe la tine.",
    icon: Headphones,
  },
  {
    slug: "agent-social",
    title: "Agent Social Media",
    tagline: "Calendar editorial, generare conținut, postare automată.",
    description:
      "Brandul tău activ zilnic pe toate platformele, fără efort din partea ta.",
    icon: Share2,
  },
  {
    slug: "agent-contabil",
    title: "Agent Contabil",
    tagline: "Facturi automate, urmărire plăți restante, rapoarte lunare.",
    description:
      "Contabilul tău AI nu uită niciodată o factură. Cash-flow vizibil în timp real.",
    icon: Calculator,
  },
];
