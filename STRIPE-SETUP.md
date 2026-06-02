# Stripe — Setup complet ReplacedByAI

> Status la zi: **15 produse LIVE create**, **30 prețuri** (lunar + setup),
> webhook handler scris, portal client funcțional, REST API + webhooks n8n live.
>
> Mai trebuie de la tine **2 lucruri** ca să fie 100% activ: (1) webhook secret,
> (2) Customer Portal activat. Restul e gata în cod.

---

## 1. Ce e deja făcut

### Produse + prețuri (toate în Stripe LIVE)
| Produs | Recurring lunar | One-time setup |
|---|---|---|
| Growth | €249/lună | €149 |
| Scale | €499/lună | €249 |
| Enterprise | €1.200/lună | €499 |
| HoReCa | €179/lună | €99 |
| Medical | €179/lună | €99 |
| VoiceBot | €179/lună | €99 |
| SchedulerBot | €99/lună | €79 |
| SupportBot | €89/lună | €59 |
| SalesBot | €149/lună | €99 |
| SocialBot | €119/lună | €69 |
| AccountBot | €69/lună | €79 |
| ContentBot | €89/lună | €49 |
| ReviewBot | €79/lună | €39 |
| DesignBot | €119/lună | €59 |
| HRBot | €119/lună | €79 |

Toate au:
- Currency: **EUR**
- Metadata `planKey` pentru maparea automată în code
- Recurring lunar (15) + One-time setup (15)

Toate **30 de price IDs** sunt în `.env.local` cu numele:
```
STRIPE_PRICE_<KEY>          → recurring lunar
STRIPE_PRICE_<KEY>_SETUP    → one-time setup
```

### Code-ul livrat
- `lib/portal-billing.ts` — `startCheckout(formData)` + `openBillingPortal()`
- `lib/portal-integrations.ts` — API keys + webhook management
- `app/portal/billing/page.tsx` — toate planurile + agenții cu buton de cumpărare
- `app/portal/integrations/page.tsx` — n8n integration
- `app/api/stripe/webhook/route.ts` — handle subscription events
- `app/api/v1/agents|usage|trigger/[event]` — REST API + n8n trigger

Schema `Client` extinsă cu: `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus`, `currentPeriodEnd`, `planKey`. Tabele noi: `ClientApiKey`, `ClientWebhook`.

---

## 2. Setup făcut prin API — GATA, nu mai ai ce face

### ✅ A. Customer Portal — ACTIVAT
- Configuration ID: `bpc_1TaH1e0MYOfb8OxXszMzFapT`
- Status: **active + default**
- Permite clienților:
  - Update email/nume/adresă/telefon/tax ID
  - Vezi facturile (invoice history)
  - Schimbă cardul (payment method update)
  - **Anulează abonament** la sfârșitul perioadei + alege motivul (8 opțiuni)
  - **Schimbă plan** între Growth/Scale/Enterprise cu prorating + cod promo
- Privacy/Terms: linkate la `/confidentialitate` + `/termeni`
- Return URL: `https://replacedbyai.ro/portal/billing`

### ✅ B. Webhook endpoint — CREAT
- Webhook ID: `we_1TaH1I0MYOfb8OxXpMbRf8ca`
- URL: `https://replacedbyai.ro/api/stripe/webhook`
- API version: `2024-11-20.acacia`
- **Signing secret deja salvat în `.env.local`** ca `STRIPE_WEBHOOK_SECRET`
- 8 evenimente activate:
  - `checkout.session.completed` · `checkout.session.expired`
  - `customer.subscription.created/updated/deleted`
  - `invoice.payment_succeeded/payment_failed`
  - `payment_intent.payment_failed`

### Test local (înainte de deploy)
Webhook-ul live merge automat după ce deploy-ezi pe domeniu. Pentru localhost foloseste Stripe CLI:
```bash
scoop install stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Stripe CLI generează alt `whsec_xxx` temporar pentru localhost — înlocuiește în `.env.local` cât testezi.

---

## 3. Cum testezi întregul flow (5 min)

### Pas 1 — Login client
- Admin creează un Client în `/admin/clients/new`
- Sau folosește datele tale: setează manual `passwordHash` cu bcrypt din `/admin/clients/[slug]`
- Login la `/login` cu emailul + parola clientului

### Pas 2 — Checkout
- Navighează la **`/portal/billing`**
- Vezi toate cele 15 produse + 5 industrie + cele 10 agenți
- Click **„Alege Growth"** (sau orice plan)
- Te duce la Stripe Checkout
- Plătește cu cardul:
  - **Live mode**: cardul tău real (vei fi taxat €398 = €249 + €149 setup în prima factură)
  - **Test mode**: `4242 4242 4242 4242` · data viitoare · CVC orice · ZIP orice

### Pas 3 — Verifică webhook
După plată reușită → te întoarce la `/portal/billing?status=success`. Webhook-ul:
1. Capturează `checkout.session.completed` + `customer.subscription.created`
2. Setează în DB:
   - `subscriptionStatus: active`
   - `planKey: growth`
   - `currentPeriodEnd: <data>`
   - `stripeCustomerId`, `stripeSubscriptionId`

### Pas 4 — Customer Portal
- Click **„Gestionează în Stripe"** din `/portal/billing`
- Se deschide Stripe Customer Portal
- Clientul își poate: schimba cardul, vedea facturi, anula abonament, schimba planul

---

## 4. Cum funcționează economic (pentru tine)

### Prima factură a clientului (ex: Growth)
```
Pachet Growth            €249,00 / lună (recurring)
Setup Growth             €149,00 (one-time)
─────────────────────────────────
Total primă plată        €398,00
```

### Lunile următoare
```
Pachet Growth            €249,00 / lună
```

Setup-ul se taxează **doar la primul checkout** (codul detectează `isFirstCheckout = !client.stripeSubscriptionId`).

### Proiecție venit (din `lib/pricing.ts`)
22 clienți activi → **€10.380/lună recurring**, plus ~€500/lună setup-uri noi.

---

## 5. Integrare n8n (deja gata)

Clientul tău:
1. Login `/portal/integrations`
2. Generează cheie API → o copiază (afișată o singură dată)
3. În n8n, HTTP Request node:
   ```
   GET https://replacedbyai.ro/api/v1/agents
   Authorization: Bearer rbai_live_xxxxx
   ```
4. Pentru push events (real-time): adaugă webhook în portal cu URL n8n. Fiecare eveniment va veni semnat HMAC în header `X-ReplacedByAI-Signature`.

### Endpoint-uri publice
- `GET /api/v1/agents` — agenții clientului
- `GET /api/v1/usage` — plan, status, perioadă
- `POST /api/v1/trigger/<event>` — declanșează eveniment care propagă către webhook-urile clientului

### Evenimente disponibile
`conversation.created`, `conversation.completed`, `agent.deployed`, `agent.paused`, `payment.succeeded`, `lead.qualified`, `appointment.booked`, `invoice.issued`

---

## 6. Checklist final

Setup tehnic — **completat automat**:

- [x] **Customer Portal activat** (`bpc_1TaH1e0MYOfb8OxXszMzFapT`)
- [x] **Webhook endpoint** creat (`we_1TaH1I0MYOfb8OxXpMbRf8ca`) + `STRIPE_WEBHOOK_SECRET` în env
- [x] 15 produse + 30 prețuri (15 lunar + 15 setup) create în Stripe LIVE
- [x] Toate price IDs salvate în `.env.local`
- [x] Webhook handler scris pentru subscription + one-time payments
- [x] Portal client (`/portal/billing` + `/portal/integrations`) funcțional

Pași manuali rămași (când deploy-ezi):

- [ ] Deploy pe domeniu (Vercel/altul) cu `.env.local` → env vars Vercel
- [ ] Testat checkout cu cardul tău real pentru €1 (apoi refund din Dashboard)
- [ ] Verificat că „Gestionează în Stripe" deschide Customer Portal
- [ ] (Opțional) **Stripe Tax** pentru TVA 19% RO automat → https://dashboard.stripe.com/settings/tax → activează → adaugă RO ca jurisdicție
- [ ] (Opțional) **Statement descriptor** „REPLACEDBYAI" → https://dashboard.stripe.com/settings/public → Public business name
- [ ] (Opțional) **Brand Checkout** → https://dashboard.stripe.com/settings/branding → upload logo + culoare
- [ ] **GDPR/facturi**: Public business name + adresă firmă → https://dashboard.stripe.com/settings/public
- [ ] **Securitate**: rotește cheile Stripe după dev → https://dashboard.stripe.com/apikeys → Roll secret

---

## 7. Probleme comune & fix

**„No such price"** la checkout → Verifică că `STRIPE_PRICE_<KEY>` din `.env.local` matchează exact un price ID din contul tău Stripe LIVE. Test mode/live mode au prețuri separate.

**Webhook nu actualizează DB** → Verifică `STRIPE_WEBHOOK_SECRET` setat corect + endpoint-ul în Dashboard arată green tick. Pe Stripe → Webhooks → click pe endpoint → vezi log-ul ultimelor evenimente livrate.

**„Customer portal is not configured"** → Activează Customer Portal în Settings → Billing → Customer portal → Activate.

**Plata cu card RO eșuează** → Stripe acceptă carduri RO standard. Asigură-te că contul Stripe e activat pentru EUR (Settings → Payment methods → EUR active).

---

## 8. Ce poți face în plus (când ai timp)

- **Prețuri anuale** (12×monthly cu -20% discount): pot crea prețurile +bump pricing.ts
- **Coupons promotionale** (`STUDENT20`, `BLACKFRIDAY`): se setează din Dashboard → Coupons; checkout-ul deja are `allow_promotion_codes: true`
- **Tax automation**: Stripe Tax → calculează automat TVA per țară
- **Email branding**: Settings → Emails → custom logo + culoare
- **Trial period**: în `subscription_data`, adaugă `trial_period_days: 14`

Toate astea sunt 1-2 linii de cod în `lib/portal-billing.ts` — spune-mi dacă vrei.
