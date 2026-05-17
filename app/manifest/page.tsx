import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manifest — De ce munca repetitivă nu mai are loc în 2026",
  description:
    "Un manifest pentru antreprenorii din România care simt că trebuie să clonezi oameni ca să crești. Despre munca pe care AI-ul ar fi trebuit să o ia deja.",
  alternates: { canonical: "https://replacedbyai.ro/manifest" },
  openGraph: {
    title: "Manifest ReplacedByAI",
    description: "Munca pe care AI-ul ar fi trebuit să o ia deja.",
    url: "https://replacedbyai.ro/manifest",
  },
};

export default function ManifestPage() {
  return (
    <article className="pt-32 pb-32 px-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-16">
          <p className="eyebrow mb-4">Manifest · 2026</p>
          <h1 className="h-display text-5xl md:text-7xl text-[var(--ink)] leading-[1.02] mb-7">
            Nu mai trebuie să <span className="gradient-text">cloni oameni</span> ca să crești.
          </h1>
          <p className="text-xl text-[var(--ink-2)] leading-relaxed">
            Un manifest pentru antreprenorii din România care au înțeles că viitorul muncii s-a
            întâmplat deja — doar că s-a întâmplat în altă parte.
          </p>
        </header>

        <div className="prose-manifest space-y-8 text-[17px] text-[var(--ink-1)] leading-[1.75]">
          <p>
            <span className="float-left h-display text-7xl leading-none pr-3 pt-1 text-[var(--ink)]">
              Î
            </span>
            n fiecare zi, în România, sună 4 milioane de telefoane care nu primesc răspuns. Sună la
            cabinete medicale după ora 18:00. Sună la magazine online sâmbătă seara. Sună la
            instalatori care nu pot răspunde pentru că sunt pe altă lucrare. Și de fiecare dată,
            cineva se hotărăște să meargă la concurență.
          </p>

          <p>
            Mai sunt și 2 milioane de programări care nu se confirmă. 800 de mii de facturi care
            întârzie. 50 de mii de antreprenori care lucrează 14 ore pe zi pentru că, dacă nu o fac
            ei, nu o face nimeni.
          </p>

          <p>
            Și soluția pe care ne-am obișnuit să o auzim e mereu aceeași:{" "}
            <em>„angajează mai mulți oameni."</em>
          </p>

          <h2 className="h-display text-3xl md:text-4xl text-[var(--ink)] pt-8 pb-2 leading-tight">
            Dar dacă problema nu mai e oamenii?
          </h2>

          <p>
            Adevărul, în 2026, e simplu: 70% din munca pe care o faci în firma ta este repetitivă.
            Programări. Confirmări. Răspunsuri la întrebări identice. Reminders. Trimitere de
            facturi. Generare de oferte din template. Răspuns la review-uri. Postare pe Facebook.
          </p>

          <p>
            Tot ce e repetitiv,{" "}
            <strong className="text-[var(--ink)]">azi un AI o face mai bine ca tine</strong>. Nu
            într-un viitor abstract. Acum. La 1 RON pe oră. Fără să obosească. Fără să greșească.
            Fără să își ceară concediu.
          </p>

          <h2 className="h-display text-3xl md:text-4xl text-[var(--ink)] pt-8 pb-2 leading-tight">
            Ce înseamnă „ReplacedByAI"?
          </h2>

          <p>
            <strong>Nu înseamnă să concediezi oameni.</strong> Înseamnă să eliberezi oamenii care
            îți rămân. Să dai vânzătorului tău cel mai bun timpul să închidă oferte mari, nu să
            răspundă la „aveți în stoc?". Să dai contabilei timp să te sfătuiască, nu să trimită
            facturi una câte una.
          </p>

          <p>
            Înseamnă că, în loc să cauți cu disperare al 6-lea angajat, îi dai celorlalți 5 un
            instrument cu care fac muncă de 15.
          </p>

          <h2 className="h-display text-3xl md:text-4xl text-[var(--ink)] pt-8 pb-2 leading-tight">
            De ce acum?
          </h2>

          <p>
            Pentru că tehnologia s-a maturizat. Vocile AI sunt indistinct de oameni reali. Modelele
            de limbaj înțeleg română nuanțată. Costurile au scăzut de 50× față de acum 2 ani.
            Setup-ul care în 2023 dura 6 luni, azi durează 48 de ore.
          </p>

          <p>
            Și pentru că primul lot de antreprenori din România care fac asta nu vor să anunțe.
            Următorii 12 luni se va decide cine câștigă mai mult timp și cine se uită cum
            concurența merge mai repede.
          </p>

          <h2 className="h-display text-3xl md:text-4xl text-[var(--ink)] pt-8 pb-2 leading-tight">
            Promisiunea noastră.
          </h2>

          <p>
            La ReplacedByAI nu vindem ceva ce „va exista cândva". Construim agenți AI pe care îi
            plătești{" "}
            <strong className="text-[var(--ink)]">doar dacă funcționează în afacerea ta</strong>.
            Garantăm 30 de zile. Setup în 48 de ore. Fără contracte lungi. Fără jargon.
          </p>

          <p>
            Dacă ai citit până aici, ai înțeles deja. Următorul pas e simplu: 30 de minute, audit
            gratuit, îți spunem ce ar trebui automatizat primul — chiar dacă alegi să nu lucrăm
            împreună.
          </p>

          <p className="text-[var(--ink-3)] italic pt-4">
            — Echipa ReplacedByAI
          </p>
        </div>

        <div className="mt-16 pt-10 border-t border-[var(--border)] flex flex-col sm:flex-row gap-3">
          <Link href="/contact" className="btn btn-primary px-6 py-3 text-[14px] flex-1 justify-center">
            Cere auditul de 30 minute
          </Link>
          <Link href="/quiz" className="btn btn-secondary px-6 py-3 text-[14px] flex-1 justify-center">
            Sau fă quiz-ul (60 sec)
          </Link>
        </div>
      </div>
    </article>
  );
}
