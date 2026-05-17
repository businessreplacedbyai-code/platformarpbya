"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2 } from "lucide-react";

const SAMPLE = {
  scene: "Restaurant",
  title: "Rezervare masă vineri seara",
  audioSrc: "/audio/demo-restaurant.mp3",
  transcript: [
    { role: "client" as const, text: "Bună ziua, aș vrea o masă pentru vineri seara." },
    { role: "bot" as const, text: "Sigur, pentru câte persoane și la ce oră preferați?" },
    { role: "client" as const, text: "Patru persoane, pe la opt." },
    {
      role: "bot" as const,
      text: "Perfect — vineri, 20:00, masă pentru patru. Pot să confirm numele rezervării?",
    },
  ],
};

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function AudioDemo() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [audioMissing, setAudioMissing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setAudioMissing(true));
    }
  };

  return (
    <section id="audio-demo" className="py-24 md:py-32 px-6 border-t border-[var(--border)]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[12px] text-[var(--ink-2)] mb-5">
            <Volume2 size={12} className="text-[var(--accent)]" />
            Demo audio
          </div>
          <h2 className="h-display text-4xl md:text-5xl text-[var(--ink)] mb-4">
            Ascultă cum sună <span className="gradient-text">VoiceBot</span>.
          </h2>
          <p className="text-[var(--ink-2)] text-lg max-w-2xl mx-auto">
            Scenariu real — rezervare la restaurant. Voce naturală, fără pauze ciudate, fără robotism.
          </p>
        </motion.div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
          {/* Sample header */}
          <div className="px-7 md:px-10 pt-7 md:pt-8 pb-5 border-b border-[var(--border)]">
            <div className="text-[11px] eyebrow text-[var(--accent)] mb-1">{SAMPLE.scene}</div>
            <div className="text-[15px] md:text-base font-medium text-[var(--ink)]">
              {SAMPLE.title}
            </div>
          </div>

          {/* Player */}
          <div className="p-7 md:p-10">
            <div className="flex items-center gap-5 mb-8">
              <button
                onClick={togglePlay}
                className="shrink-0 w-14 h-14 rounded-full bg-[var(--ink)] text-[var(--bg-2)] flex items-center justify-center hover:scale-105 transition-transform"
                aria-label={playing ? "Pauză" : "Redă"}
              >
                {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[12px] text-[var(--ink-3)] tabular-nums">
                    {formatTime(current)}
                  </span>
                  <span className="text-[12px] text-[var(--ink-3)] tabular-nums">
                    {duration > 0 ? formatTime(duration) : "—:—"}
                  </span>
                </div>
                <Waveform playing={playing} progress={progress} />
                {audioMissing && (
                  <div className="mt-2 text-[11.5px] text-[var(--ink-3)]">
                    Mostra audio nu poate fi redată — citește transcrierea jos.
                  </div>
                )}
              </div>
            </div>

            {/* Transcript */}
            <div className="text-[12px] eyebrow mb-3">Transcriere</div>
            <ul className="space-y-2.5">
              {SAMPLE.transcript.map((line, i) => (
                <li
                  key={i}
                  className={`flex ${line.role === "bot" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${
                      line.role === "bot"
                        ? "bg-[var(--bg-3)] text-[var(--ink-1)] rounded-bl-sm"
                        : "bg-[var(--ink)] text-[var(--bg-2)] rounded-br-sm"
                    }`}
                  >
                    {line.text}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={SAMPLE.audioSrc}
          preload="metadata"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => {
            const a = e.currentTarget;
            setCurrent(a.currentTime);
            if (a.duration) setProgress((a.currentTime / a.duration) * 100);
          }}
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
            setCurrent(0);
          }}
          onError={() => setAudioMissing(true)}
        />
      </div>
    </section>
  );
}

const BAR_HEIGHTS: number[] = Array.from({ length: 56 }, (_, i) => {
  const baseHeight = 25 + Math.sin(i * 0.45) * 18 + Math.cos(i * 0.31) * 12;
  return Math.round(Math.max(8, Math.abs(baseHeight)) * 100) / 100;
});

function Waveform({ playing, progress }: { playing: boolean; progress: number }) {
  return (
    <div className="flex items-center gap-[2px] h-8 relative">
      {BAR_HEIGHTS.map((h, i) => {
        const filled = (i / BAR_HEIGHTS.length) * 100 <= progress;
        return (
          <span
            key={i}
            className={`flex-1 rounded-full transition-colors ${
              filled ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
            } ${playing ? "wave-bar" : ""}`}
            style={{
              height: `${h}%`,
              animationDelay: `${i * 30}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
