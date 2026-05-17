"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { resetPassword, type ResetResult } from "../forgot/actions";

export function ResetForm({ token, type }: { token: string; type: string }) {
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    const result: ResetResult = await resetPassword(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="type" value={type} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-[13px] px-3 py-2">
          {error}
        </div>
      )}

      <label className="block">
        <span className="text-[12.5px] font-medium text-[var(--ink-2)] mb-1.5 block">Parolă nouă</span>
        <input
          type="password"
          name="password"
          minLength={8}
          required
          autoComplete="new-password"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14px] outline-none focus:border-[var(--ink-3)]"
        />
      </label>

      <label className="block">
        <span className="text-[12.5px] font-medium text-[var(--ink-2)] mb-1.5 block">Confirmă parola</span>
        <input
          type="password"
          name="passwordConfirm"
          minLength={8}
          required
          autoComplete="new-password"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14px] outline-none focus:border-[var(--ink-3)]"
        />
      </label>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-5 py-3 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[14px] font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60"
    >
      {pending ? "Se setează…" : "Setează parola"}
    </button>
  );
}
