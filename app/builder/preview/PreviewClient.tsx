"use client";
import { useEffect, useState } from "react";
import { SiteTemplate } from "@/components/builder/SiteTemplate";
import type { SiteConfig } from "@/components/builder/types";

export function PreviewClient() {
  const [cfg, setCfg] = useState<SiteConfig | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rbai_builder_site");
      if (raw) setCfg(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!cfg) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", fontFamily: "system-ui", color: "#888" }}>
        Niciun site de previzualizat. Întoarce-te în Builder și apasă „Vezi site-ul live”.
      </div>
    );
  }
  return <SiteTemplate config={cfg} />;
}
