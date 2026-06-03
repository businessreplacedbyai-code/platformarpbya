---
name: oferta-pricing
description: Construiește și optimizează oferte și prețuri pentru ReplacedByAI, cu calcul de impact asupra venitului (drumul spre 40k/lună). Use când userul cere oferte noi, recalibrare de prețuri, pachete, modele de venit, calcule de MRR/CAC/LTV, sau "cât trebuie să vând ca să ajung la X". Leagă fiecare ofertă de matematica de business.
---

# Skill: Ofertă & Pricing (ReplacedByAI)

Construiești oferte care sunt **accesibile pentru România dar profitabile pentru tine**,
și arăți mereu impactul în MRR. Sursa de adevăr a prețurilor: `lib/pricing.ts`.

## Prețuri actuale (EUR/lună + setup one-time)

| Pachet | Lunar | Setup | Pentru |
|---|---|---|---|
| Growth | €249 | €149 | Restaurante, saloane, clinici mici |
| Scale | €499 | €249 | Firme 10-50 angajați, B2B |
| Enterprise | €1.200 | €499 | Lanțuri, francize, clinici mari |
| HoReCa / Medical (industrie) | €179 | €99 | Entry pe nișă |
| Agenți individuali | €69-179 | €39-99 | Un singur serviciu |

## Principii de pricing

1. **Ancorare**: arată mereu ce cere concurența (€400-5.000) lângă prețul tău. Faci să pară ieftin.
2. **Value-based, nu cost-based**: prețul reflectă valoarea (un agent = cât 1/10 dintr-un salariu).
3. **3 opțiuni** (decoy effect): Scale e mereu "Recomandat" — majoritatea aleg mijlocul.
4. **Setup one-time = cash imediat** + filtrează clienții neserioși (skin in the game).
5. **Bundle math**: un pachet trebuie să coste MAI PUȚIN decât suma agenților individuali — altfel n-are sens.
6. **Risk-reversal**: garanție 30 zile + fără contract = elimină frica, crește conversia.

## Pârghii de venit (folosește-le în oferte)

- **Pilot plătit €99/30 zile** (înlocuiește trial-ul gratuit): aduce cash + califică + convertește la Growth.
- **Plată anuală cu 2 luni gratis**: crește cash-flow + reduce churn-ul dramatic.
- **Add-on-uri lunare**: agent extra €69-149, minute voce suplimentare, canale noi.
- **Servicii one-time**: site premium €299-1.500, audit AI €0 (lead magnet), training echipă.
- **Upsell programat**: Growth → Scale la 90 de zile (după ce văd rezultate).

## Modelul drumului spre 40k (recalculează la cerere)

### Milestone 1 — 40.000 RON/lună (~€8.000 MRR) · luna 3-4 · "nu are cum să dea greș"
```
10 × Growth (€249)      = €2.490
 6 × Scale (€499)       = €2.994
 1 × Enterprise (€1.200) = €1.200
12 × agent individual (avg €110) = €1.320
───────────────────────────────────
≈ €8.004/lună MRR ≈ 40.000 RON   (29 clienți activi)
+ setup nou ~€2.000/lună cash
```

### Milestone 2 — €40.000/lună MRR · luna 10-12 · "impact pe piață"
```
35 × Growth (€249)      = €8.715
30 × Scale (€499)       = €14.970
 8 × Enterprise (€1.200) = €9.600
25 × industrie (€179)   = €4.475
20 × agent individual (avg €110) = €2.200
───────────────────────────────────
≈ €39.960/lună MRR      (118 clienți activi)
+ setup nou ~€2.000-4.000/lună cash
+ proiecte site 2-4/lună × €500-1.500 = €2.000-4.000 cash
```

## Unit economics (verifică mereu)

- **CAC** (cost achiziție client): țintă < €60. Outreach e aproape gratis; ads sub €60/client.
- **LTV**: Growth €249 × ~8 luni retenție = ~€2.000. Scale ~€4.000. Enterprise ~€10.000+.
- **LTV:CAC** = minim 10:1 (sănătos). La noi, cu outreach, poate fi 30:1.
- **Churn țintă**: < 5%/lună. Plata anuală + rezultate vizibile = churn mic.
- **Gross margin**: AI agents au marjă 70-85% (cost = API + infra + suport). Foarte profitabil.

## Ce livrezi la fiecare cerere

- Dacă cere **ofertă nouă**: structura (nume, preț lunar, setup, ce include, pentru cine, ancoră concurență).
- Dacă cere **recalibrare**: tabel înainte/după + impact pe MRR + justificare.
- Dacă cere **"cât vând ca să ajung la X"**: model invers cu mix de clienți + funnel necesar.
- Dacă cere **modificare în cod**: propune diff pentru `lib/pricing.ts` + `app/preturi/page.tsx` + Stripe.

## Sincronizare cu Stripe (LIVE)

Orice preț nou trebuie creat în Stripe (produs + preț recurring + preț setup) și mapat în
`.env.local` ca `STRIPE_PRICE_<KEY>` / `STRIPE_PRICE_<KEY>_SETUP`, apoi în `lib/portal-billing.ts`.
Avem deja 15 produse × 2 prețuri LIVE. La schimbări, generează comenzile API Stripe sau pașii.

## Recomandare imediată de pricing (de aplicat când userul vrea)

1. **Scoate "14 zile gratuit la start"** din Growth (line 34 `lib/pricing.ts`) — userul a cerut deja eliminarea trial-urilor. Înlocuiește cu **"Pilot €99 / 30 zile"**.
2. **Adaugă opțiunea anuală** (2 luni gratis) pe toate pachetele — boost cash + retenție.
3. **Păstrează EUR** ca poziționare premium (nu coborî la RON pe site — ancorează valoare).
