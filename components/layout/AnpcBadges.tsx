import Link from "next/link";
import Image from "next/image";

// Badge-uri legale obligatorii (RO): SAL (ANPC) + SOL (platforma UE) + GDPR.
// SAL/SOL = imaginile oficiale ANPC (public/anpc-sal.png, anpc-sol.png, 200x54).
// GDPR = badge în același stil, link spre pagina /gdpr.

const ANPC_BLUE = "#00319C";

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ANPC_BLUE} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function AnpcBadges() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href="https://anpc.ro/ce-este-sal/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ANPC — Soluționarea Alternativă a Litigiilor"
        className="inline-block hover:opacity-80 transition-opacity"
      >
        <Image src="/anpc-sal.png" alt="ANPC — Soluționarea Alternativă a Litigiilor" width={200} height={54} className="rounded-md" />
      </a>

      <a
        href="https://ec.europa.eu/consumers/odr"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Soluționarea Online a Litigiilor (platforma UE)"
        className="inline-block hover:opacity-80 transition-opacity"
      >
        <Image src="/anpc-sol.png" alt="Soluționarea Online a Litigiilor" width={200} height={54} className="rounded-md" />
      </a>

      <Link
        href="/gdpr"
        aria-label="Protecția datelor (GDPR)"
        className="group flex items-center justify-between gap-2 rounded-md bg-white px-3 hover:opacity-90 transition-opacity"
        style={{ width: 200, height: 54, border: `2px solid ${ANPC_BLUE}` }}
      >
        <span className="flex items-center gap-2 min-w-0">
          <ShieldIcon />
          <span className="font-bold uppercase leading-[1.1] text-[9.5px]" style={{ color: ANPC_BLUE }}>
            Protecția datelor
            <br />
            GDPR
          </span>
        </span>
        <span className="shrink-0 text-[8px] font-bold uppercase tracking-wide text-white rounded px-1.5 py-1" style={{ background: ANPC_BLUE }}>
          Detalii
        </span>
      </Link>
    </div>
  );
}
