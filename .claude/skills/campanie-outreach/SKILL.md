---
name: campanie-outreach
description: Generează secvențe complete de outreach B2B în română (email + WhatsApp + LinkedIn) pentru ReplacedByAI. Use când userul cere mesaje de prospectare, follow-up, secvențe de cold outreach, sau campanii de contactare pentru o industrie/oraș. Produce secvențe multi-touch cu framework psihologic, nu mesaje izolate.
---

# Skill: Campanie Outreach (ReplacedByAI)

Generezi secvențe de outreach care convertesc, pentru piața românească B2B locală.
Nu mesaje izolate — **secvențe complete de 5-7 touchpoint-uri** pe canale multiple.

## Principii non-negociabile

1. **NICIODATĂ "Da sau nu"** la final. CTA-ul e mereu soft: "Vă trimit un exemplu dacă vă interesează."
2. **Hook = întrebare specifică**, cu cifră dacă se poate. Niciodată generic ("cum merge afacerea?").
3. **O singură idee per mesaj.** Nu liste de feature-uri.
4. **Social proof concret**: "Lucrăm cu peste 40 de afaceri din România" — nu "suntem cei mai buni".
5. **Ton editorial, inteligent, ușor provocator.** Ca de la fondator la fondator, nu ca un call-center.
6. **Interzis**: "Sper că...", "Îmi permit să...", "Aștept un răspuns!", emoji în email, cifre inventate.
7. **Semnătură**: `ReplacedByAI | replacedbyai.ro`

## Framework: secvența de 5 touchpoint-uri (14 zile)

| # | Zi | Canal | Unghi psihologic | Obiectiv |
|---|----|----|----|----|
| T1 | 0 | Email SAU WhatsApp | Curiosity gap — întrebare despre o pierdere concretă | Deschidere |
| T2 | 2 | WhatsApp | Proof — exemplu/demo audio de 30s | Micro-angajament |
| T3 | 5 | Email | Social proof — caz concret dintr-o firmă similară | Încredere |
| T4 | 9 | WhatsApp | Loss aversion — ce pierd cât ezită | Urgență blândă |
| T5 | 14 | Email | Break-up — "închid dosarul, dar las ușa deschisă" | Reactivare (cel mai mare reply-rate) |

**Regula de aur**: dacă răspund la orice touchpoint → oprești secvența, treci la conversație 1:1.

## Unghiuri per industrie (alege în funcție de business)

- **HoReCa (restaurant/cafenea)**: apeluri pierdute seara/weekend = mese goale. Booking comision.
- **Medical/Beauty (clinică/salon/stomatolog)**: timp pierdut pe recepție + no-show-uri + pacienți care nu revin.
- **Servicii profesionale (avocat/contabil)**: lead-uri necalificate care fură timp + termene uitate.
- **Auto/retail/imobiliare**: programări greoaie + lead-uri care nu se convertesc.
- **Fără site**: invizibil pe Google = clienți care ajung la concurență. Ofertă: site + agent în 5-7 zile.

## Structura unui touchpoint

```
[HOOK: întrebare specifică cu cifră]

[PROBLEMĂ: 1 propoziție — ce se întâmplă concret când problema persistă]

[SOLUȚIE: 1 propoziție — ce facem, fără listă de feature-uri]
[+ social proof natural dacă se potrivește]

[CTA SOFT — niciodată "da sau nu"]

ReplacedByAI | replacedbyai.ro
```

## Cum execuți cererea

Când userul îți dă o industrie + oraș (sau o listă), generează:
1. **Secvența completă de 5 touchpoint-uri** (T1-T5), cu variante WITH-site și WITHOUT-site dacă e relevant.
2. **2 variante de subject line** per email (pentru A/B testing).
3. **Versiune WhatsApp scurtă** (max 4 propoziții, mai casual decât emailul).
4. **Nota de timing** (când se trimite fiecare).

Dacă userul cere "în masă" pentru multe industrii → generează un tabel-matrice cu hook-urile principale per industrie, apoi 1 secvență-model completă pe care o adaptează tool-ul din `/admin/outreach`.

## Legătură cu platforma

Secvențele generate aici alimentează `/admin/outreach`:
- Mesajele T1 sunt deja în `app/api/admin/outreach/enrich/route.ts` (templates) și `OutreachClient.tsx` (WhatsApp).
- Când îmbunătățești copy-ul, propune diff pentru acele fișiere ca să intre în producție.
- Follow-up-urile (T2-T5) se pot programa manual sau prin `CalendarEvent` (type: "follow-up").

## Benchmark-uri de performanță (țintă realistă RO)

- Email cold reply rate: **5-8%** (subject bun + hook specific)
- WhatsApp reply rate: **12-18%** (mult mai mare în RO — prioritizează-l)
- Conversație → demo: **40-50%**
- Demo → client: **25-35%**
- **Concluzie**: 1.500 touch-uri/lună → ~10 clienți noi/lună. Asta e motorul spre 40k.
