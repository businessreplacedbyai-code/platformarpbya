"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

// Set NEXT_PUBLIC_DEMO_VIDEO_URL in .env.local to enable the demo player.
const DEMO_VIDEO_URL = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || "/replacedbyai-16x9.mp4";

export function VideoDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.5 });
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    if (DEMO_VIDEO_URL) setHasVideo(true);
  }, []);

  useEffect(() => {
    if (isInView && videoRef.current && !playing && hasVideo && !userPaused.current) {
      videoRef.current.play().catch(() => setHasVideo(false));
      setPlaying(true);
    }
  }, [isInView, playing, hasVideo]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      userPaused.current = true;
    } else {
      videoRef.current.play().catch(() => {});
      userPaused.current = false;
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100 || 0);
    }
  };

  return (
    <section ref={sectionRef} className="relative px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="eyebrow mb-4">Vezi în acțiune</p>
          <h2 className="h-display text-4xl md:text-5xl">
            Agentul tău AI care lucrează <br />
            <span className="gradient-text">24/7 în locul tău.</span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--ink)] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]"
        >
          <div className="relative aspect-video">
            {hasVideo && DEMO_VIDEO_URL && (
              <video
                ref={videoRef}
                src={DEMO_VIDEO_URL}
                muted={muted}
                loop
                playsInline
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onError={() => setHasVideo(false)}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {!hasVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.15),transparent_60%)]">
                <div className="text-center px-6">
                  <div className="h-display text-3xl md:text-5xl text-white mb-3">
                    Demo în pregătire
                  </div>
                  <p className="text-white/50 text-sm">
                    Setează <code className="text-white">NEXT_PUBLIC_DEMO_VIDEO_URL</code> pentru video live.
                  </p>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {hasVideo && (
              <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all"
                  aria-label={playing ? "Pauză" : "Play"}
                >
                  {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
                <div className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <button
                  onClick={() => setMuted(!muted)}
                  className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all"
                  aria-label={muted ? "Activează sunet" : "Mute"}
                >
                  {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
