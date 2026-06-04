import Link from "next/link";
import Image from "next/image";

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.34 18.34V10.5H5.67v7.84zM7 9.28a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1zm11.34 9.06v-4.3c0-2.3-1.23-3.37-2.88-3.37a2.48 2.48 0 0 0-2.25 1.24V10.5h-2.67c.04.76 0 7.84 0 7.84h2.67v-4.38a1.83 1.83 0 0 1 .08-.65 1.46 1.46 0 0 1 1.37-.98c.97 0 1.36.74 1.36 1.81v4.2z" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.16 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-32 bg-[var(--bg)] border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10">
          <div className="col-span-2 md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <Image src="/logo-mark.png" alt="" width={32} height={32} sizes="32px" className="rounded-md" />
              <span className="font-medium tracking-tight text-base">
                Replaced<span className="text-[var(--ink-3)]">ByAI</span>
              </span>
            </Link>
            <p className="text-[15px] text-[var(--ink-2)] max-w-sm leading-relaxed mb-6">
              Construim agenți AI care fac munca oamenilor din afacerea ta.
            </p>
            <div className="flex gap-2">
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors">
                <LinkedInIcon />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors">
                <InstagramIcon />
              </a>
              <a href="#" aria-label="X" className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors">
                <XIcon />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[13px] font-medium mb-4 text-[var(--ink)]">Produs</h4>
            <ul className="space-y-2.5 text-[14px] text-[var(--ink-3)]">
              <li><Link href="/servicii" className="hover:text-[var(--ink)] transition-colors">Servicii</Link></li>
              <li><Link href="/agenti" className="hover:text-[var(--ink)] transition-colors">Agenți AI</Link></li>
              <li><Link href="/agenti-ai" className="hover:text-[var(--ink)] transition-colors">Agenți AI pe orașe</Link></li>
              <li><Link href="/preturi" className="hover:text-[var(--ink)] transition-colors">Prețuri</Link></li>
              <li><Link href="/rezultate" className="hover:text-[var(--ink)] transition-colors">Rezultate</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[13px] font-medium mb-4 text-[var(--ink)]">Companie</h4>
            <ul className="space-y-2.5 text-[14px] text-[var(--ink-3)]">
              <li><Link href="/despre" className="hover:text-[var(--ink)] transition-colors">Despre</Link></li>
              <li><Link href="/blog" className="hover:text-[var(--ink)] transition-colors">Blog</Link></li>
              <li><Link href="/cariere" className="hover:text-[var(--ink)] transition-colors">Cariere</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--ink)] transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[13px] font-medium mb-4 text-[var(--ink)]">Contact</h4>
            <ul className="space-y-2.5 text-[14px] text-[var(--ink-3)]">
              <li><a href="mailto:contact@replacedbyai.ro" className="hover:text-[var(--ink)] transition-colors">contact@replacedbyai.ro</a></li>
              <li>România</li>
              <li>Luni–Vineri · 9:00–18:00</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-wrap justify-between items-center gap-4">
          <p className="text-[13px] text-[var(--ink-3)]">
            © {new Date().getFullYear()} ReplacedByAI · Toate drepturile rezervate
          </p>
          <div className="flex gap-6 text-[13px] text-[var(--ink-3)]">
            <Link href="/termeni" className="hover:text-[var(--ink)] transition-colors">Termeni</Link>
            <Link href="/confidentialitate" className="hover:text-[var(--ink)] transition-colors">Confidențialitate</Link>
            <Link href="/gdpr" className="hover:text-[var(--ink)] transition-colors">GDPR</Link>
          </div>
        </div>
      </div>

      {/* CTA strip */}
      <div className="border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[14px] text-[var(--ink-2)]">
            Gata să automatizezi? <span className="text-[var(--ink-3)]">Audit gratuit în 30 minute.</span>
          </p>
          <Link
            href="/contact"
            className="shrink-0 h-10 px-6 rounded-full text-[13px] font-medium flex items-center gap-2 border border-[var(--border)] hover:border-[var(--ink)] hover:text-[var(--ink)] text-[var(--ink-2)] transition-colors"
          >
            Programează acum →
          </Link>
        </div>
      </div>
    </footer>
  );
}
