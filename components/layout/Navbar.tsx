"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Phone, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/servicii", label: "Servicii" },
  { href: "/agenti", label: "Agenți" },
  { href: "/website-premium", label: "Site-uri 3D" },
  { href: "/preturi", label: "Prețuri" },
  { href: "/comparatie", label: "Comparație" },
  { href: "/quiz", label: "Quiz" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const path = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 20));

  // Ascunde Navbar pe zonele autentificate / formulare dedicate
  if (
    path === "/login" ||
    path.startsWith("/admin") ||
    path.startsWith("/portal") ||
    path.startsWith("/intake")
  ) {
    return null;
  }

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-4"
      }`}
    >
      <div
        className={`max-w-6xl mx-auto px-4 lg:px-6 transition-all duration-300 ${
          scrolled ? "" : ""
        }`}
      >
        <div
          className={`flex items-center justify-between rounded-full px-4 lg:px-5 h-14 transition-all duration-300 ${
            scrolled
              ? "glass shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]"
              : "bg-transparent border border-transparent"
          }`}
        >
          <Link href="/" className="flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-mark.png"
              alt="ReplacedByAI"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="font-medium tracking-tight text-[15px] text-[var(--ink)]">
              Replaced<span className="text-[var(--ink-3)]">ByAI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 mx-auto">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-2.5 py-1.5 text-[13px] text-[var(--ink-2)] hover:text-[var(--ink)] rounded-full hover:bg-[var(--bg-3)] transition-all whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ink-1)] hover:text-[var(--ink)] px-2.5 py-1.5 rounded-full border border-[var(--border)] hover:bg-[var(--bg-3)] transition-all whitespace-nowrap"
            >
              <LogIn size={12} />
              Login
            </Link>
            <Button href="/contact" variant="primary" size="sm" arrow>
              Analiza gratuită
            </Button>
          </div>

          <button
            className="md:hidden text-[var(--ink)] p-1"
            onClick={() => setOpen(!open)}
            aria-label="Meniu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden mx-4 mt-2 rounded-2xl glass shadow-lg p-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-[var(--ink-1)] hover:bg-[var(--bg-3)] rounded-lg transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 space-y-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full px-3 py-2 text-[14px] rounded-lg border border-[var(--border)] hover:bg-[var(--bg-3)]"
            >
              <LogIn size={14} /> Login
            </Link>
            <Button href="/contact" variant="primary" arrow className="w-full justify-center">
              Analiza gratuită
            </Button>
          </div>
        </div>
      )}
    </motion.header>
  );
}
