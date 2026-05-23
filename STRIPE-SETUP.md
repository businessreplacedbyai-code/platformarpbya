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

## 2. Ce mai trebuie să faci tu (10 min)

### A. Activează Customer Portal (CRITIC — fără el butonul „Gestionează în Stripe" dă eroare)

1. **Stripe Dashboard** → **Settings** (jos stânga) → **Billing → Customer portal**
   👉 sau direct: https://dashboard.stripe.com/settings/billing/portal
2. Click **Activate test link** sau **Activate live** (dacă ești în Live mode)
3. Configurează:
   - ✅ **Customer information**: Allow customers to update name, email, billing address
   - ✅ **Invoice history**: Show
   - ✅ **Payment methods**: Allow update
   - ✅ **Subscriptions** → **Cancel subscriptions**: enabled (immediate cancellation)
   - ✅ **Subscriptions** → **Update subscriptions**: enabled, selectează produsele (Growth/Scale/Enterprise) ca opțiuni de upgrade/downgrade
4. **Save**

### B. Adaugă webhook endpoint (CRITIC — fără el `subscriptionStatus` nu se actualizează după plată)

#### Pentru producție (când e site-ul live pe domeniu)
1. **Stripe Dashboard** → **Developers → Webhooks** → **Add endpoint**
   👉 https://dashboard.stripe.com/webhooks
2. **Endpoint URL**: `https://replacedbyai.ro/api/stripe/webhook`
3. **Events to send** (bifează):
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Add endpoint** → copiază **Signing secret** (`whsec_...`)
5. Adaugă în `.env.local` (sau Vercel env vars în prod):
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
   ```

#### Pentru test local (înainte de deploy)
Instalează Stripe CLI: https://docs.stripe.com/stripe-cli
```bash
# Windows (scoop):
scoop install stripe

# Apoi:
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Stripe CLI îți va da în terminal un `whsec_xxx` temporar — pune-l în `.env.local`. Cât rulează `stripe listen`, evenimentele de test ajung la localhost.

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

Înainte să mergi public:

- [ ] **Customer Portal activat** în Stripe Dashboard (pas 2A)
- [ ] **Webhook endpoint** creat în Stripe Dashboard + `STRIPE_WEBHOOK_SECRET` în env (pas 2B)
- [ ] Testat checkout cu cardul tău real pentru €1 (apoi refund din Dashboard)
- [ ] Verificat că `subscriptionStatus` se setează `active` după plată
- [ ] Verificat că „Gestionează în Stripe" deschide Customer Portal
- [ ] (Opțional) Activează **Stripe Tax** pentru calcul automat TVA 19% RO
- [ ] (Opțional) Configurează **statement descriptor** (apare pe extrasul de card) → Settings → Public details → Statement descriptor: `REPLACEDBYAI`
- [ ] (Opțional) Brandare Checkout → Settings → Branding → adaugă logo
- [ ] **Securitate**: rotește cheile Stripe după dev (Dashboard → API Keys → Roll secret) fiindcă au trecut prin chat
- [ ] **GDPR**: în Stripe Dashboard → Settings → Public details — adaugă numele firmei + adresa pentru facturi

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
