// Website Builder — tipuri + preset-uri per tip de afacere.
export type Service = { name: string; desc: string; price?: string; img?: string };

export type SiteConfig = {
  name: string;
  type: string;        // cafenea | restaurant | salon | clinica | service | altul
  city: string;
  tagline: string;
  about: string;
  services: Service[];
  phone: string;
  email: string;
  address: string;
  paletteKey: string;  // cheie din PALETTES
  fontKey: string;     // serif | sans | display
  heroImage?: string;  // poster / fundal AI
  heroVideo?: string;  // video AI cu efect de scroll
  galleryImgs?: string[];
};

export const PALETTES: Record<string, { label: string; bg: string; ink: string; accent: string; accent2: string; soft: string }> = {
  espresso: { label: "Espresso (cald, auriu)", bg: "#0f0d0a", ink: "#f2ece0", accent: "#d8a73e", accent2: "#7a4b2b", soft: "#1b1712" },
  fresh:    { label: "Fresh (verde, curat)",   bg: "#0b1410", ink: "#eafff4", accent: "#2eb06b", accent2: "#0e6b45", soft: "#10201a" },
  rose:     { label: "Rose (beauty, roz)",     bg: "#160d12", ink: "#fceef4", accent: "#e85d8a", accent2: "#7a2447", soft: "#221319" },
  azure:    { label: "Azure (medical, blue)",  bg: "#0a1018", ink: "#eaf3ff", accent: "#3b9ae0", accent2: "#1a4f7a", soft: "#10202e" },
  mono:     { label: "Mono (modern, alb-negru)", bg: "#0a0a0a", ink: "#f5f5f4", accent: "#fafafa", accent2: "#737373", soft: "#171717" },
};

export const FONTS: Record<string, { label: string; display: string; body: string }> = {
  serif:   { label: "Editorial (serif)", display: "Georgia, 'Times New Roman', serif", body: "system-ui, sans-serif" },
  sans:    { label: "Modern (sans)",     display: "'Segoe UI', system-ui, sans-serif", body: "system-ui, sans-serif" },
  display: { label: "Statement (impact)", display: "Georgia, serif", body: "system-ui, sans-serif" },
};

export const TYPE_PRESETS: Record<string, Partial<SiteConfig> & { heroPrompt: string; servicePrompts: string[] }> = {
  cafenea: {
    paletteKey: "espresso", fontKey: "serif",
    tagline: "Cafea de specialitate, în inima orașului.",
    about: "Boabe alese, espresso turnat cu grijă și un loc în care îți place să rămâi.",
    services: [
      { name: "Espresso", desc: "Dublu shot, crema groasă.", price: "8 lei" },
      { name: "Cappuccino", desc: "Lapte catifelat, latte art.", price: "12 lei" },
      { name: "Frappe", desc: "Rece, cremos, de vară.", price: "16 lei" },
    ],
    heroPrompt: "close up espresso pouring into a cup, golden crema, warm moody light, cinematic, photorealistic, no text",
    servicePrompts: [
      "espresso shot in a cup, warm light, dark background, photorealistic",
      "cappuccino with latte art, top view, photorealistic",
      "iced coffee frappe with whipped cream, photorealistic",
    ],
  },
  restaurant: {
    paletteKey: "espresso", fontKey: "display",
    tagline: "Gusturi care te aduc înapoi.",
    about: "Bucătărie cu suflet, ingrediente proaspete și o atmosferă în care fiecare masă contează.",
    services: [
      { name: "Preparate la grătar", desc: "Carne fragedă, foc viu.", price: "—" },
      { name: "Paste de casă", desc: "Făcute în fiecare zi.", price: "—" },
      { name: "Deserturi", desc: "Dulce, exact cât trebuie.", price: "—" },
    ],
    heroPrompt: "gourmet plated dish on a dark table, steam, dramatic restaurant lighting, photorealistic, no text",
    servicePrompts: [
      "grilled meat dish plated elegantly, dark background, photorealistic",
      "homemade pasta dish, warm light, photorealistic",
      "elegant dessert plate, photorealistic",
    ],
  },
  salon: {
    paletteKey: "rose", fontKey: "serif",
    tagline: "Arăți bine, te simți bine.",
    about: "Stilișt cu experiență, produse premium și grijă pentru fiecare detaliu.",
    services: [
      { name: "Tuns & coafat", desc: "Stil personalizat.", price: "—" },
      { name: "Manichiură", desc: "Îngrijire completă.", price: "—" },
      { name: "Tratamente", desc: "Păr sănătos, strălucitor.", price: "—" },
    ],
    heroPrompt: "elegant beauty salon interior, soft pink light, modern, photorealistic, no text, no people",
    servicePrompts: [
      "hairstyling salon chair, soft light, photorealistic",
      "manicure close up, elegant, photorealistic",
      "hair treatment products, soft pink, photorealistic",
    ],
  },
  clinica: {
    paletteKey: "azure", fontKey: "sans",
    tagline: "Grijă pentru sănătatea ta.",
    about: "Echipă profesionistă, aparatură modernă și programări fără bătăi de cap.",
    services: [
      { name: "Consultații", desc: "Diagnostic atent.", price: "—" },
      { name: "Investigații", desc: "Rapide și precise.", price: "—" },
      { name: "Tratamente", desc: "Plan personalizat.", price: "—" },
    ],
    heroPrompt: "modern medical clinic interior, clean, blue light, photorealistic, no text, no people",
    servicePrompts: [
      "modern medical consultation room, clean, photorealistic",
      "medical equipment, blue light, photorealistic",
      "clean medical interior detail, photorealistic",
    ],
  },
  altul: {
    paletteKey: "mono", fontKey: "sans",
    tagline: "Afacerea ta, online, în câteva minute.",
    about: "O prezență online modernă care îți aduce clienți.",
    services: [
      { name: "Serviciul 1", desc: "Descriere scurtă.", price: "—" },
      { name: "Serviciul 2", desc: "Descriere scurtă.", price: "—" },
      { name: "Serviciul 3", desc: "Descriere scurtă.", price: "—" },
    ],
    heroPrompt: "abstract modern business background, soft gradient, photorealistic, no text",
    servicePrompts: [
      "modern abstract texture, photorealistic",
      "clean minimal background, photorealistic",
      "soft gradient surface, photorealistic",
    ],
  },
};
