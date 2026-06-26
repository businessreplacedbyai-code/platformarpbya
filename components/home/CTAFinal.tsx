import { Button } from "@/components/ui/Button";

export function CTAFinal() {
  return (
    <section className="relative px-6 py-32">
      <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg-2)] px-8 md:px-16 py-20 md:py-28 text-center">
        {/* Gradient highlights */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute top-0 left-1/3 w-[36rem] h-[36rem] bg-[radial-gradient(circle,rgba(212,175,55,0.22),transparent_60%)] blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[36rem] h-[36rem] bg-[radial-gradient(circle,rgba(232,207,131,0.14),transparent_60%)] blur-3xl" />
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur text-[12px] text-white/80 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            Audit + demo gratuit · fără obligații
          </span>
          <h2 className="h-display text-4xl md:text-6xl lg:text-7xl mb-8 leading-[0.95]">
            Gata să automatizezi
            <br />
            <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
              afacerea ta?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Îți instalăm un agent AI care preia apelurile și programările, 24/7.
            <span className="text-white"> Începe cu un audit și un demo gratuit.</span>
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/contact"
              className="btn btn-lg bg-white text-[var(--ink)] hover:bg-white/90 px-6 py-3 text-[15px] font-medium rounded-full transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)] inline-flex items-center gap-2"
            >
              Cere audit gratuit →
            </a>
            <a
              href="/preturi"
              className="btn px-6 py-3 text-[15px] rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
            >
              Vezi prețurile
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
