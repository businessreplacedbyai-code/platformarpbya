"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building2,
  Sparkles,
  Phone,
  Mail,
  User,
  MapPin,
  Globe,
  Zap,
  Clock,
} from "lucide-react";

type Step = 1 | 2 | 3;
type Sector = "horeca" | "retail" | "medical" | "beauty" | "imobiliare" | "servicii" | "altul";
type Employees = "1" | "2-5" | "6-20" | "21-50" | "50+";
type Budget = "<500" | "500-1500" | "1500-3000" | "3000+";
type Urgency = "asap" | "1-3luni" | "3-6luni" | "exploring";

type FormState = {
  // Step 1
  name: string;
  business: string;
  phone: string;
  email: string;
  // Step 2
  cui: string;
  sector: Sector | "";
  employees: Employees | "";
  city: string;
  website: string;
  // Step 3
  monthlyBudget: Budget | "";
  urgency: Urgency | "";
  painPoints: string[];
  agentsWanted: string[];
  message: string;
  // Honeypot
  website_url: string;
};

const SECTORS: { value: Sector; label: string; emoji: string }[] = [
  { value: "horeca", label: "HoReCa", emoji: "🍽️" },
  { value: "medical", label: "Medical / Stomato", emoji: "🩺" },
  { value: "beauty", label: "Beauty / Salon", emoji: "💅" },
  { value: "imobiliare", label: "Imobiliare", emoji: "🏠" },
  { value: "retail", label: "Retail / E-com", emoji: "🛍️" },
  { value: "servicii", label: "Servicii B2B", emoji: "💼" },
  { value: "altul", label: "Altceva", emoji: "✨" },
];

const EMPLOYEES: Employees[] = ["1", "2-5", "6-20", "21-50", "50+"];

const BUDGETS: { value: Budget; label: string }[] = [
  { value: "<500", label: "Sub 500€" },
  { value: "500-1500", label: "500 – 1.500€" },
  { value: "1500-3000", label: "1.500 – 3.000€" },
  { value: "3000+", label: "Peste 3.000€" },
];

const URGENCIES: { value: Urgency; label: string }[] = [
  { value: "asap", label: "Imediat (sub 2 săpt)" },
  { value: "1-3luni", label: "În 1–3 luni" },
  { value: "3-6luni", label: "În 3–6 luni" },
  { value: "exploring", label: "Doar explorez" },
];

const PAIN_POINTS = [
  "Pierdem clienți care sună după program",
  "Răspundem prea lent pe WhatsApp",
  "Programări duble / haos pe calendar",
  "Echipa pierde timp cu întrebări repetate",
  "Nu reușim să sunăm înapoi toate lead-urile",
  "Costuri mari cu personal call-center",
  "Lipsește un raport zilnic / săptămânal",
];

const AGENTS_OPTIONS = [
  { slug: "voicebot", label: "Voicebot apeluri" },
  { slug: "schedulerbot", label: "Programări automate" },
  { slug: "salesbot", label: "Calificare lead-uri" },
  { slug: "supportbot", label: "Suport clienți 24/7" },
  { slug: "wabot", label: "WhatsApp / Messenger" },
  { slug: "reviewbot", label: "Recenzii Google" },
  { slug: "reportbot", label: "Raportare zilnică" },
];

const initial: FormState = {
  name: "",
  business: "",
  phone: "",
  email: "",
  cui: "",
  sector: "",
  employees: "",
  city: "",
  website: "",
  monthlyBudget: "",
  urgency: "",
  painPoints: [],
  agentsWanted: [],
  message: "",
  website_url: "",
};

export function ContactFormPro() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  // ANAF lookup
  const [cuiState, setCuiState] = useState<{
    loading: boolean;
    valid?: boolean;
    name?: string;
    inactive?: boolean;
    vatPayer?: boolean;
  }>({ loading: false });

  // UTM capture
  const [utm, setUtm] = useState<{ source?: string; medium?: string; campaign?: string; referrer?: string }>({});
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setUtm({
      source: p.get("utm_source") || undefined,
      medium: p.get("utm_medium") || undefined,
      campaign: p.get("utm_campaign") || undefined,
      referrer: document.referrer || undefined,
    });
  }, []);

  // ANAF debounce lookup
  useEffect(() => {
    const cui = form.cui.replace(/\D/g, "");
    if (cui.length < 2) {
      setCuiState({ loading: false });
      return;
    }
    const t = setTimeout(async () => {
      setCuiState({ loading: true });
      try {
        const res = await fetch(`/api/anaf?cui=${cui}`);
        const json = await res.json();
        setCuiState({
          loading: false,
          valid: json.valid,
          name: json.name,
          inactive: json.inactive,
          vatPayer: json.vatPayer,
        });
        // Autofill business name dacă e gol
        if (json.valid && json.name && !form.business) {
          setForm((f) => ({ ...f, business: json.name }));
        }
      } catch {
        setCuiState({ loading: false });
      }
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.cui]);

  const errors = useMemo(() => validate(form, step), [form, step]);
  const canNext = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function toggle(list: "painPoints" | "agentsWanted", value: string) {
    setForm((f) => {
      const arr = f[list];
      return { ...f, [list]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  }

  async function submit() {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          utmSource: utm.source,
          utmMedium: utm.medium,
          utmCampaign: utm.campaign,
          referrer: utm.referrer,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error || "A apărut o eroare.");
        setStatus("error");
        return;
      }
      setScore(json.score ?? null);
      setStatus("success");
    } catch {
      setServerError("Conexiune eșuată. Verifică internetul și reîncearcă.");
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "success") {
    return <SuccessCard score={score} />;
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6 md:p-8">
      <Progress step={step} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 3) {
            if (canNext) setStep((step + 1) as Step);
          } else {
            if (canNext) submit();
          }
        }}
        className="space-y-5"
      >
        {/* Honeypot — invizibil utilizatorilor, dar botii îl completează */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={form.website_url}
          onChange={(e) => setField("website_url", e.target.value)}
          style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
        />

        {step === 1 && (
          <Step1 form={form} setField={setField} errors={errors} />
        )}
        {step === 2 && (
          <Step2
            form={form}
            setField={setField}
            cuiState={cuiState}
            errors={errors}
          />
        )}
        {step === 3 && (
          <Step3 form={form} setField={setField} toggle={toggle} />
        )}

        {serverError && (
          <div className="flex items-center gap-2 text-red-600 text-[13px] px-3 py-2 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle size={14} /> {serverError}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setStep(Math.max(1, step - 1) as Step)}
            disabled={step === 1 || submitting}
            className="text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] flex items-center gap-1 disabled:opacity-30"
          >
            <ArrowLeft size={14} /> Înapoi
          </button>

          {step < 3 ? (
            <Button type="submit" variant="primary" arrow disabled={!canNext}>
              Continuă
            </Button>
          ) : (
            <Button type="submit" variant="primary" arrow disabled={submitting}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Se trimite…
                </span>
              ) : (
                "Trimite cererea"
              )}
            </Button>
          )}
        </div>

        <p className="text-[11.5px] text-[var(--ink-3)] pt-1">
          Prin trimitere accepți să fii contactat și{" "}
          <a href="/confidentialitate" className="underline">
            politica de confidențialitate
          </a>
          . Datele sunt stocate în UE.
        </p>
      </form>
    </div>
  );
}

// ──────────────────────────────── STEPS ────────────────────────────────

function Step1({
  form,
  setField,
  errors,
}: {
  form: FormState;
  setField: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  errors: Record<string, string>;
}) {
  return (
    <>
      <Header
        title="Hai să facem cunoștință"
        sub="Cum te contactăm? Răspundem în max 4 ore lucrătoare."
      />
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          icon={User}
          label="Nume complet"
          value={form.name}
          onChange={(v) => setField("name", v)}
          error={errors.name}
          autoFocus
        />
        <Input
          icon={Building2}
          label="Numele afacerii"
          value={form.business}
          onChange={(v) => setField("business", v)}
          error={errors.business}
        />
        <Input
          icon={Phone}
          label="Telefon"
          type="tel"
          placeholder="07XX XXX XXX"
          value={form.phone}
          onChange={(v) => setField("phone", v)}
          error={errors.phone}
        />
        <Input
          icon={Mail}
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setField("email", v)}
          error={errors.email}
        />
      </div>
    </>
  );
}

function Step2({
  form,
  setField,
  cuiState,
  errors,
}: {
  form: FormState;
  setField: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  cuiState: {
    loading: boolean;
    valid?: boolean;
    name?: string;
    inactive?: boolean;
    vatPayer?: boolean;
  };
  errors: Record<string, string>;
}) {
  return (
    <>
      <Header
        title="Despre afacerea ta"
        sub="Ne ajută să-ți recomandăm soluția potrivită."
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Input
            icon={Building2}
            label="CUI / CIF (opțional)"
            placeholder="RO12345678"
            value={form.cui}
            onChange={(v) => setField("cui", v)}
            error={errors.cui}
            hint="Verificăm automat la ANAF"
          />
          <AnafBadge state={cuiState} />
        </div>
        <Input
          icon={MapPin}
          label="Oraș"
          placeholder="București, Cluj, …"
          value={form.city}
          onChange={(v) => setField("city", v)}
        />
      </div>

      <div>
        <Label>Sector de activitate</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SECTORS.map((s) => (
            <button
              type="button"
              key={s.value}
              onClick={() => setField("sector", s.value)}
              className={`px-3 py-2.5 rounded-xl border text-[13px] transition-all ${
                form.sector === s.value
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg-2)]"
                  : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--ink-3)]"
              }`}
            >
              <span className="mr-1">{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Câți oameni sunt în echipă?</Label>
        <div className="flex flex-wrap gap-2">
          {EMPLOYEES.map((e) => (
            <button
              type="button"
              key={e}
              onClick={() => setField("employees", e)}
              className={`px-4 py-2 rounded-full border text-[13px] transition-all ${
                form.employees === e
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg-2)]"
                  : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--ink-3)]"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <Input
        icon={Globe}
        label="Website (opțional)"
        placeholder="https://"
        value={form.website}
        onChange={(v) => setField("website", v)}
      />
    </>
  );
}

function Step3({
  form,
  setField,
  toggle,
}: {
  form: FormState;
  setField: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  toggle: (list: "painPoints" | "agentsWanted", value: string) => void;
}) {
  return (
    <>
      <Header
        title="Ce vrei să rezolvi?"
        sub="Cu cât ne spui mai multe, cu atât te ofertăm mai precis."
      />

      <div>
        <Label icon={Clock}>Cât de urgent?</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {URGENCIES.map((u) => (
            <button
              type="button"
              key={u.value}
              onClick={() => setField("urgency", u.value)}
              className={`px-3 py-2.5 rounded-xl border text-[13px] transition-all ${
                form.urgency === u.value
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg-2)]"
                  : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--ink-3)]"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Buget lunar estimat</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {BUDGETS.map((b) => (
            <button
              type="button"
              key={b.value}
              onClick={() => setField("monthlyBudget", b.value)}
              className={`px-3 py-2.5 rounded-xl border text-[13px] transition-all ${
                form.monthlyBudget === b.value
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg-2)]"
                  : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--ink-3)]"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label icon={Zap}>Care e durerea principală? (alege oricâte)</Label>
        <div className="grid md:grid-cols-2 gap-2">
          {PAIN_POINTS.map((p) => (
            <CheckChip
              key={p}
              active={form.painPoints.includes(p)}
              onClick={() => toggle("painPoints", p)}
              label={p}
            />
          ))}
        </div>
      </div>

      <div>
        <Label icon={Sparkles}>Ce agenți te interesează?</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {AGENTS_OPTIONS.map((a) => (
            <CheckChip
              key={a.slug}
              active={form.agentsWanted.includes(a.slug)}
              onClick={() => toggle("agentsWanted", a.slug)}
              label={a.label}
            />
          ))}
        </div>
      </div>

      <div>
        <Label>Mesaj (opțional)</Label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => setField("message", e.target.value)}
          maxLength={2000}
          placeholder="Spune-ne despre situația ta actuală…"
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[14px] resize-none focus:border-[var(--ink)] focus:outline-none focus:ring-4 focus:ring-[var(--ink)]/5 transition-all"
        />
      </div>
    </>
  );
}

// ──────────────────────────────── UI helpers ────────────────────────────────

function Progress({ step }: { step: Step }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-[11px] eyebrow text-[var(--ink-3)] mb-2">
        <span>Pas {step} din 3</span>
        <span>{Math.round((step / 3) * 100)}%</span>
      </div>
      <div className="h-1 bg-[var(--bg-3)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--ink)] transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-2">
      <h3 className="h-display-sm text-xl mb-1">{title}</h3>
      <p className="text-[13px] text-[var(--ink-3)]">{sub}</p>
    </div>
  );
}

function Label({ children, icon: Icon }: { children: React.ReactNode; icon?: typeof Building2 }) {
  return (
    <label className="block text-[12px] font-medium text-[var(--ink-2)] mb-2 flex items-center gap-1.5">
      {Icon && <Icon size={12} />} {children}
    </label>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  icon: Icon,
  hint,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  icon?: typeof Building2;
  hint?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <Label icon={Icon}>{label}</Label>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-[var(--bg)] border rounded-lg px-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-4 transition-all ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
            : "border-[var(--border)] focus:border-[var(--ink)] focus:ring-[var(--ink)]/5"
        }`}
      />
      {error ? (
        <p className="mt-1 text-[11.5px] text-red-600 flex items-center gap-1">
          <AlertCircle size={10} /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11.5px] text-[var(--ink-3)]">{hint}</p>
      ) : null}
    </div>
  );
}

function CheckChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-[13px] transition-all ${
        active
          ? "border-[var(--ink)] bg-[var(--ink)]/5"
          : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--ink-3)]"
      }`}
    >
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
          active ? "bg-[var(--ink)] border-[var(--ink)]" : "border-[var(--ink-3)]"
        }`}
      >
        {active && <Check size={11} className="text-[var(--bg-2)]" />}
      </span>
      <span>{label}</span>
    </button>
  );
}

function AnafBadge({
  state,
}: {
  state: { loading: boolean; valid?: boolean; name?: string; inactive?: boolean; vatPayer?: boolean };
}) {
  if (state.loading) {
    return (
      <p className="mt-1.5 text-[11.5px] text-[var(--ink-3)] flex items-center gap-1.5">
        <Loader2 size={11} className="animate-spin" /> Verific la ANAF…
      </p>
    );
  }
  if (state.valid === undefined) return null;
  if (!state.valid) {
    return (
      <p className="mt-1.5 text-[11.5px] text-amber-600 flex items-center gap-1.5">
        <AlertCircle size={11} /> CUI invalid sau format greșit
      </p>
    );
  }
  if (state.inactive) {
    return (
      <p className="mt-1.5 text-[11.5px] text-red-600 flex items-center gap-1.5">
        <AlertCircle size={11} /> Firmă inactivă fiscal la ANAF
      </p>
    );
  }
  return (
    <p className="mt-1.5 text-[11.5px] text-emerald-700 flex items-center gap-1.5">
      <Check size={11} /> {state.name || "Validat"} {state.vatPayer && "• plătitor TVA"}
    </p>
  );
}

function SuccessCard({ score }: { score: number | null }) {
  const band = score === null ? "" : score >= 65 ? "🔥" : score >= 35 ? "⚡" : "📝";
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-10 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
        <Check size={22} />
      </div>
      <h3 className="h-display-sm text-2xl">Mulțumim! Am primit cererea ta.</h3>
      <p className="text-[var(--ink-3)] max-w-md">
        Te contactăm în <strong>maximum 4 ore</strong> lucrătoare. Dacă e urgent, sună-ne la{" "}
        <a className="underline" href="tel:+40700000000">
          0700 000 000
        </a>
        .
      </p>
      {score !== null && score >= 65 && (
        <p className="text-[12px] text-emerald-700 mt-1">
          {band} Pe baza datelor, cererea ta a fost marcată ca prioritară. Te sunăm primii.
        </p>
      )}
      <div className="flex gap-2 mt-2">
        <a
          href="/"
          className="text-[13px] px-4 py-2 rounded-full border border-[var(--border)] hover:bg-[var(--bg-3)] flex items-center gap-1"
        >
          Înapoi acasă <ArrowRight size={12} />
        </a>
      </div>
    </div>
  );
}

// ──────────────────────────────── VALIDATION ────────────────────────────────

function validate(form: FormState, step: Step): Record<string, string> {
  const e: Record<string, string> = {};
  if (step >= 1) {
    if (!form.name || form.name.trim().length < 2) e.name = "Minim 2 caractere";
    if (!form.business || form.business.trim().length < 2) e.business = "Câmp obligatoriu";
    if (!form.phone) e.phone = "Câmp obligatoriu";
    else if (!/^(\+40|0040|0)?[237]\d{8}$/.test(form.phone.replace(/[\s().-]/g, "")))
      e.phone = "Telefon RO invalid (07XX XXX XXX)";
    if (!form.email) e.email = "Câmp obligatoriu";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalid";
  }
  return e;
}
