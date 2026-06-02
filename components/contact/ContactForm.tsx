"use client";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Check, AlertCircle } from "lucide-react";

type FormData = {
  name: string;
  business: string;
  phone: string;
  email: string;
  message?: string;
};

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-10 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <Check size={22} />
        </div>
        <h3 className="h-display-sm text-2xl">Cererea ta a fost trimisă.</h3>
        <p className="text-[var(--ink-3)]">
          Te contactăm în cel mai scurt timp posibil în zilele lucrătoare.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-7 md:p-9 space-y-5"
    >
      <Field
        label="Nume complet"
        error={errors.name?.message}
        register={register("name", { required: "Numele este obligatoriu", minLength: { value: 2, message: "Minim 2 caractere" } })}
      />
      <Field
        label="Numele afacerii"
        error={errors.business?.message}
        register={register("business", { required: "Câmp obligatoriu", minLength: { value: 2, message: "Minim 2 caractere" } })}
      />
      <Field
        label="Telefon"
        type="tel"
        error={errors.phone?.message}
        register={register("phone", { required: "Câmp obligatoriu", minLength: { value: 10, message: "Telefon invalid" } })}
      />
      <Field
        label="Email"
        type="email"
        error={errors.email?.message}
        register={register("email", { required: "Câmp obligatoriu", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email invalid" } })}
      />

      <div>
        <label className="block text-[12px] font-medium text-[var(--ink-2)] mb-1.5">
          Mesaj <span className="text-[var(--ink-4)]">(opțional)</span>
        </label>
        <textarea
          rows={4}
          {...register("message")}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[14px] text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none focus:ring-4 focus:ring-[var(--ink)]/5 transition-all resize-none"
          placeholder="Spune-ne despre afacerea ta și ce ai vrea să automatizezi."
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          A apărut o eroare. Încearcă din nou sau scrie-ne la hello@replacedbyai.ro.
        </div>
      )}

      <Button type="submit" variant="primary" arrow>
        {isSubmitting ? "Se trimite..." : "Trimite cererea"}
      </Button>

      <p className="text-[12px] text-[var(--ink-3)]">
        Prin trimitere, accepți să fii contactat în legătură cu cererea ta.
      </p>
    </form>
  );
}

function Field({
  label,
  type = "text",
  register,
  error,
}: {
  label: string;
  type?: string;
  register: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[var(--ink-2)] mb-1.5">
        {label}
      </label>
      <input
        type={type}
        {...register}
        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[14px] text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none focus:ring-4 focus:ring-[var(--ink)]/5 transition-all"
      />
      {error && (
        <p className="mt-1.5 text-[12px] text-red-600 flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}
