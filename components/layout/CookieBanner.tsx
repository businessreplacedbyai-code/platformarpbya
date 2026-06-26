"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const KEY = "rbai_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[999] w-[calc(100vw-2rem)] max-w-xl"
        >
          <div className="glass rounded-2xl border border-[var(--border)] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[var(--ink-2)] leading-relaxed">
                Folosim cookies pentru a îmbunătăți experiența pe site.{" "}
                <Link href="/confidentialitate" className="text-[var(--accent)] hover:underline font-medium">
                  Politica de confidențialitate
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={decline}
                className="text-[13px] font-medium text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors px-3 py-1.5"
              >
                Refuz
              </button>
              <button
                onClick={accept}
                className="text-[13px] font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-1.5 rounded-full transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
