"use client";
import { useState } from "react";
import { Phone, MessageCircle, Globe, CalendarDays, Check, Loader2, Sparkles } from "lucide-react";

const AI_NUMBER = "+40 31 630 0000"; // placeholder — se alocă real la activare (faza telefonie)
const OPERATORS = ["Orange", "Vodafone", "Digi", "Telekom", "Altul"];

function fwdCodes(when: "all" | "miss") {
  const n = AI_NUMBER.replace(/\s/g, "");
  if (when === "all") return [{ label: "Toate apelurile → agent", code: `**21*${n}#` }];
  return [
    { label: "Când nu răspunzi (după câteva sunete)", code: `**61*${n}#` },
    { label: "Când ești ocupat", code: `**67*${n}#` },
    { label: "Când ești indisponibil / închis", code: `**62*${n}#` },
  ];
}

export function ActivateClient() {
  const [voiceActive, setVoiceActive] = useState(false);
  const [mode, setMode] = useState<"new" | "forward">("new");
  const [operator, setOperator] = useState("Orange");
  const [when, setWhen] = useState<"all" | "miss">("miss");
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState("");
  const [copied, setCopied] = useState("");

  const [conn, setConn] = useState<Record<string, "off" | "loading" | "on">>({
    whatsapp: "off", instagram: "off", messenger: "off", web: "off", calendar: "off",
  });

  function connect(key: string) {
    setConn((c) => ({ ...c, [key]: "loading" }));
    setTimeout(() => setConn((c) => ({ ...c, [key]: "on" })), 1400);
  }

  function copy(code: string) {
    navigator.clipboard?.writeText(code).then(() => { setCopied(code); setTimeout(() => setCopied(""), 1500); });
  }

  function testCall() {
    setTesting(true); setTestMsg("");
    setTimeout(() => { setTesting(false); setTestMsg("✓ Agentul te-ar suna acum la numărul tău (demo). În producție: apel real de test."); }, 1600);
  }

  return (
    <div className="max-w-3xl">
      <p className="text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-1">Platformă · integrare ușoară</p>
      <h1 className="h-display text-3xl mb-1">Activează-ți agenții</h1>
      <p className="text-[14px] text-[var(--ink-2)] mb-7">Fără cod, fără tehnician. Conectezi cu un buton și testezi pe loc.</p>

      {/* ════ AGENT VOCAL ════ */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-3)" }}><Phone size={18} /></div>
            <div>
              <div className="text-[15px] font-medium">Agent vocal</div>
              <div className="text-[12.5px] text-[var(--ink-3)]">Răspunde la telefon, face rezervări, preia comenzi — 24/7.</div>
            </div>
          </div>
          <StatusBadge on={voiceActive} />
        </div>

        {/* alegere mod */}
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <ModeCard active={mode === "new"} onClick={() => setMode("new")} title="Număr AI nou" desc="Îți dăm un număr. Îl pui pe Google / poză profil. Zero setup." />
          <ModeCard active={mode === "forward"} onClick={() => setMode("forward")} title="Numărul meu existent" desc="Redirecționezi apelurile către agent cu un cod. 2 minute." />
        </div>

        {mode === "new" ? (
          <div className="rounded-xl p-4" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
            <div className="text-[12px] text-[var(--ink-3)] mb-1">Numărul tău AI</div>
            <div className="text-2xl font-semibold tracking-wide">{AI_NUMBER}</div>
            <div className="text-[12px] text-[var(--ink-3)] mt-1">Se alocă definitiv când apeși „Activează".</div>
          </div>
        ) : (
          <div className="rounded-xl p-4 space-y-4" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-1.5">Operatorul tău</div>
                <select value={operator} onChange={(e) => setOperator(e.target.value)} className="px-3 py-2 text-[13px] rounded-lg bg-[var(--bg-2)] border border-[var(--border)]">
                  {OPERATORS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-1.5">Când răspunde agentul</div>
                <div className="flex gap-1.5">
                  <Pill active={when === "miss"} onClick={() => setWhen("miss")}>Doar când nu răspund</Pill>
                  <Pill active={when === "all"} onClick={() => setWhen("all")}>Toate apelurile</Pill>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[12.5px] text-[var(--ink-2)]">Formează codul de pe telefonul cu acel număr (sau apasă „Activează"):</div>
              {fwdCodes(when).map((c) => (
                <div key={c.code} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
                  <div>
                    <div className="text-[11.5px] text-[var(--ink-3)]">{c.label}</div>
                    <div className="text-[16px] font-mono font-semibold tracking-wide">{c.code}</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <a href={`tel:${c.code.replace(/#/g, "%23")}`} className="px-3 py-1.5 rounded-lg text-[12px] font-medium" style={{ background: "var(--ink)", color: "var(--bg-2)" }}>Activează</a>
                    <button onClick={() => copy(c.code)} className="px-3 py-1.5 rounded-lg text-[12px] font-medium" style={{ border: "1px solid var(--border)", color: "var(--ink-2)" }}>{copied === c.code ? "✓ copiat" : "Copiază"}</button>
                  </div>
                </div>
              ))}
              <div className="text-[11.5px] text-[var(--ink-3)]">Anulare oricând: <span className="font-mono">##21#</span> / <span className="font-mono">##002#</span>.</div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 mt-4 flex-wrap">
          <button onClick={() => setVoiceActive(true)} disabled={voiceActive}
            className="px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 disabled:opacity-60"
            style={{ background: voiceActive ? "#059669" : "var(--ink)", color: voiceActive ? "#fff" : "var(--bg-2)" }}>
            {voiceActive ? <><Check size={15} /> Agent activ</> : <><Sparkles size={15} /> Activează agentul vocal</>}
          </button>
          <button onClick={testCall} disabled={testing}
            className="px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 disabled:opacity-60"
            style={{ border: "1px solid var(--border)", color: "var(--ink-2)" }}>
            {testing ? <Loader2 size={14} className="animate-spin" /> : <Phone size={14} />} Testează acum
          </button>
        </div>
        {testMsg && <p className="text-[12.5px] text-green-600 mt-2.5">{testMsg}</p>}
      </div>

      {/* ════ ALTE CANALE — pattern „1 buton" ════ */}
      <div className="text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-3">Alte canale · conectează cu un buton</div>
      <div className="grid sm:grid-cols-2 gap-3">
        <ChannelCard icon={MessageCircle} title="WhatsApp Business" desc="Răspunde la mesaje, preia comenzi." state={conn.whatsapp} onConnect={() => connect("whatsapp")} />
        <ChannelCard icon={MessageCircle} title="Instagram DM" desc="Răspunde automat la mesaje pe IG." state={conn.instagram} onConnect={() => connect("instagram")} />
        <ChannelCard icon={MessageCircle} title="Facebook Messenger" desc="Conversații automate pe pagina ta." state={conn.messenger} onConnect={() => connect("messenger")} />
        <ChannelCard icon={Globe} title="Chat pe site" desc="O linie de cod (sau automat pe site-urile făcute aici)." state={conn.web} onConnect={() => connect("web")} />
        <ChannelCard icon={CalendarDays} title="Google Calendar" desc="Programări scrise direct în calendarul tău." state={conn.calendar} onConnect={() => connect("calendar")} />
      </div>

      <p className="text-[12px] text-[var(--ink-3)] mt-6">
        Codurile de redirecționare sunt standard GSM (merg pe Orange/Vodafone/Digi/Telekom). Conectarea canalelor și numărul AI real se activează în faza de telefonie (Twilio) — aici e fluxul complet de integrare.
      </p>
    </div>
  );
}

function StatusBadge({ on }: { on: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium"
      style={{ background: on ? "#ECFDF5" : "var(--bg-3)", color: on ? "#059669" : "var(--ink-3)" }}>
      <span className="w-2 h-2 rounded-full" style={{ background: on ? "#059669" : "#9CA3AF" }} />
      {on ? "Activ" : "Inactiv"}
    </span>
  );
}

function ModeCard({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button onClick={onClick} className="text-left rounded-xl p-3.5 transition-all"
      style={{ background: active ? "var(--bg)" : "var(--bg)", border: `2px solid ${active ? "var(--ink)" : "var(--border)"}` }}>
      <div className="text-[14px] font-medium">{title}</div>
      <div className="text-[12.5px] text-[var(--ink-3)] mt-0.5 leading-relaxed">{desc}</div>
    </button>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all"
      style={{ background: active ? "var(--ink)" : "var(--bg-2)", color: active ? "var(--bg-2)" : "var(--ink-2)", border: `1px solid ${active ? "var(--ink)" : "var(--border)"}` }}>
      {children}
    </button>
  );
}

function ChannelCard({ icon: Icon, title, desc, state, onConnect }: {
  icon: typeof Phone; title: string; desc: string; state: "off" | "loading" | "on"; onConnect: () => void;
}) {
  return (
    <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bg-3)" }}><Icon size={16} /></div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium">{title}</div>
        <div className="text-[12px] text-[var(--ink-3)] mt-0.5 leading-relaxed">{desc}</div>
        <div className="mt-2.5">
          {state === "on" ? (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-green-600"><Check size={14} /> Conectat</span>
          ) : (
            <button onClick={onConnect} disabled={state === "loading"}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 disabled:opacity-60"
              style={{ background: "var(--ink)", color: "var(--bg-2)" }}>
              {state === "loading" ? <><Loader2 size={13} className="animate-spin" /> Se conectează…</> : "Conectează"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
