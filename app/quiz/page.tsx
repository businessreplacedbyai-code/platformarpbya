import type { Metadata } from "next";
import { Quiz } from "./Quiz";

export const metadata: Metadata = {
  title: "Quiz — Care agent AI ți se potrivește?",
  description:
    "Răspunde la 5 întrebări scurte și află care dintre cei 15 agenți AI ReplacedByAI rezolvă cea mai mare problemă a afacerii tale.",
  alternates: { canonical: "https://www.replacedbyai.ro/quiz" },
};

export default function QuizPage() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12 max-w-2xl mx-auto">
          <p className="eyebrow mb-4">Quiz · 60 secunde</p>
          <h1 className="h-display text-5xl md:text-6xl text-[var(--ink)] mb-5 leading-[1.05]">
            Care agent AI <span className="gradient-text">ți se potrivește</span>?
          </h1>
          <p className="text-[var(--ink-2)] text-lg leading-relaxed">
            5 întrebări, recomandare personalizată. Fără email, fără capcane.
          </p>
        </header>

        <Quiz />
      </div>
    </div>
  );
}
