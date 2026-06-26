"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerAction, type RegisterState } from "./actions";

function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {off ? (
        <>
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" x2="22" y1="2" y2="22" />
        </>
      ) : (
        <>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function pwStrength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[^A-Za-z0-9]/.test(pw) || (/[A-Z]/.test(pw) && /[0-9]/.test(pw))) s++;
  return Math.min(3, s);
}

const STRENGTH = [
  { label: "", color: "transparent" },
  { label: "Slabă", color: "#EF4444" },
  { label: "Medie", color: "#F59E0B" },
  { label: "Puternică", color: "#10B981" },
];

const inputBase =
  "w-full h-11 px-3.5 text-[14px] rounded-xl bg-[var(--bg-2)] border focus:outline-none focus:ring-1 transition-colors";
function inputCls(hasError?: boolean) {
  return `${inputBase} ${hasError ? "border-[#FCA5A5] focus:ring-[#EF4444]" : "border-[var(--border)] focus:ring-[var(--ink)]"}`;
}

export function RegisterForm({ plan }: { plan?: string }) {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(registerAction, {});
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fe = state.fieldErrors || {};
  const strength = pwStrength(pw);
  const match = confirm.length > 0 && confirm === pw;
  const mismatch = confirm.length > 0 && confirm !== pw;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {plan && <input type="hidden" name="plan" value={plan} />}

      {/* Numele afacerii */}
      <div>
        <label className="block text-[12.5px] text-[var(--ink-1)] mb-1.5">Numele afacerii</label>
        <input
          name="businessName"
          required
          defaultValue={state.values?.businessName}
          autoComplete="organization"
          placeholder="ex: Cafenea Central"
          className={inputCls(!!fe.businessName)}
        />
        {fe.businessName && <p className="mt-1 text-[12px] text-[#DC2626]">{fe.businessName}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-[12.5px] text-[var(--ink-1)] mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          required
          defaultValue={state.values?.email}
          autoComplete="email"
          placeholder="nume@firma.ro"
          className={inputCls(!!fe.email)}
        />
        {fe.email && <p className="mt-1 text-[12px] text-[#DC2626]">{fe.email}</p>}
      </div>

      {/* Parolă */}
      <div>
        <label className="block text-[12.5px] text-[var(--ink-1)] mb-1.5">Parolă</label>
        <div className="relative">
          <input
            name="password"
            type={showPw ? "text" : "password"}
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="new-password"
            placeholder="Minim 8 caractere"
            className={`${inputCls(!!fe.password)} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Ascunde parola" : "Arată parola"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)]"
          >
            <EyeIcon off={showPw} />
          </button>
        </div>

        {/* Indicator putere */}
        {pw.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{ background: i <= strength ? STRENGTH[strength].color : "var(--border)" }}
                />
              ))}
            </div>
            <span className="text-[11px] tabular-nums" style={{ color: STRENGTH[strength].color }}>
              {STRENGTH[strength].label}
            </span>
          </div>
        )}
        {fe.password && <p className="mt-1 text-[12px] text-[#DC2626]">{fe.password}</p>}
      </div>

      {/* Confirmă parola */}
      <div>
        <label className="block text-[12.5px] text-[var(--ink-1)] mb-1.5">Repetă parola</label>
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="Scrie parola din nou"
            className={`${inputCls(!!fe.confirmPassword || mismatch)} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Ascunde parola" : "Arată parola"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)]"
          >
            <EyeIcon off={showConfirm} />
          </button>
        </div>
        {match && <p className="mt-1 text-[12px] text-[#059669]">✓ Parolele coincid</p>}
        {mismatch && <p className="mt-1 text-[12px] text-[#DC2626]">Parolele nu coincid</p>}
        {!mismatch && fe.confirmPassword && <p className="mt-1 text-[12px] text-[#DC2626]">{fe.confirmPassword}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full h-11 rounded-xl text-[14px] font-medium bg-[var(--ink)] text-[var(--bg-2)] hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Se creează contul…" : "Creează cont gratuit"}
      </button>

      <p className="text-[11.5px] text-center text-[var(--ink-3)] leading-relaxed">
        Creând contul, accepți{" "}
        <Link href="/termeni" className="underline hover:text-[var(--ink)]">Termenii</Link> și{" "}
        <Link href="/confidentialitate" className="underline hover:text-[var(--ink)]">Confidențialitatea</Link>.
      </p>
    </form>
  );
}
