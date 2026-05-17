import { Button } from "@/components/ui/Button";

export function CTAFinal() {
  return (
    <section className="relative px-6 py-32">
      <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg-2)] px-8 md:px-16 py-20 md:py-28 text-center">
        {/* Gradient highlights */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute top-0 left-1/3 w-[36rem] h-[36rem] bg-[radial-gradient(circle,rgba(167,139,250,0.25),transparent_60%)] blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[36rem] h-[36rem] bg-[radial-gradient(circle,rgba(244,114,182,0.18),transparent_60%)] blur-3xl" />
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur text-[12px] text-white/80 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            Răspundem în maximum 4 ore
          </span>
          <h2 className="h-display text-4xl md:text-6xl lg:text-7xl mb-8 leading-[0.95]">
            Vorbește acum cu
            <br />
            <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
              agentul nostru AI.
            </span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sună sau scrie-ne. Îți răspunde VoiceBot — agentul vocal AI — și îți face o
            <span className="text-white"> analiză gratuită în 4 minute.</span>
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/contact"
              className="btn btn-lg bg-white text-[var(--ink)] hover:bg-white/90 px-6 py-3 text-[15px] font-medium rounded-full transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)] inline-flex items-center gap-2"
            >
              Cere analiza gratuită →
            </a>
            <a
              href="mailto:hello@replacedbyai.ro"
              className="btn px-6 py-3 text-[15px] rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
            >
              Scrie-ne direct
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
