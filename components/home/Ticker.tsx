const logos = [
  "Restaurantul Vero",
  "Clinica Dent Cluj",
  "AutoService Iași",
  "Bella Hair Studio",
  "Tech Solutions SRL",
  "FitZone Botoșani",
  "Pizza Roma",
  "Notariat Popescu",
];

export function Ticker() {
  return (
    <section className="relative py-16 border-y border-[var(--border)] bg-[var(--bg-2)]">
      <p className="text-center eyebrow mb-10 px-6">
        Aleasă de <span className="text-[var(--ink)] font-medium normal-case tracking-normal">200+</span> de afaceri din România
      </p>
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--bg-2)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--bg-2)] to-transparent z-10 pointer-events-none" />
        <div className="flex marquee w-max">
          {[...logos, ...logos].map((name, i) => (
            <div
              key={i}
              className="flex items-center px-10 whitespace-nowrap text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
            >
              <span className="text-base md:text-lg font-medium tracking-tight">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
