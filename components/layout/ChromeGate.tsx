"use client";

import { usePathname } from "next/navigation";

const HIDDEN_PREFIXES = ["/admin", "/portal", "/intake", "/builder"];
const HIDDEN_EXACT = ["/login", "/register"];

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (HIDDEN_EXACT.includes(path)) return null;
  if (HIDDEN_PREFIXES.some((p) => path.startsWith(p))) return null;
  return <>{children}</>;
}
