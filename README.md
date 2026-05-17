# ReplacedByAI.ro

Site oficial pentru cea mai mare agenție AI din România.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + CSS variables
- Framer Motion (animații)
- Three.js (particle hero)
- Lucide React (iconuri)
- React Hook Form + Zod (validare)
- Resend (email)

## Comenzi

```bash
cd replacedbyai-website
npm install
npm run dev      # dezvoltare → http://localhost:3000
npm run build    # build de producție
npm run start    # rulează build-ul
```

## Variabile de mediu

Creează `.env.local`:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```

Fără cheie, formularul de contact funcționează în mod „dev" (loghează în consolă).

## Structură

```
app/
├── page.tsx              ← Landing
├── servicii/             ← /servicii + /servicii/[slug]
├── agenti/               ← /agenti + /agenti/[slug]
├── rezultate/
├── despre/
├── contact/
├── blog/
└── api/contact/route.ts  ← Resend endpoint

components/
├── layout/   (Navbar, Footer)
├── home/     (Hero, Ticker, Problem, Services, HowItWorks, Results,
│             VideoDemo, Agents, FAQ, CTAFinal)
├── ui/       (Button, ScrollReveal, AnimatedNumber, ParticleHero)
└── contact/  (ContactForm)

lib/
└── agents.ts             ← date servicii + agenți
```

## Assets de adăugat în `public/`

- `demo.mp4` — video demo 60s (16:9). Fără el, secțiunea afișează un placeholder.
- `og-image.jpg` — 1200×630 pentru Open Graph.
- `favicon.ico` — deja prezent.

## Identitate vizuală

- Negru: `#0A0A0A` · Alb cald: `#F5F5F0` · Auriu: `#D4AF37`
- Fonturi: Geist (display), DM Sans (body)
- Borduri subtile (`#242424`), spațiere generoasă, animații lente
