"use client";
import { useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

// Video AI cu efect de scroll: scroll-ul derulează video-ul cadru cu cadru
// (setează currentTime în funcție de progres) — fără extragere de cadre / ffmpeg.
export function ScrollVideo({
  src,
  poster,
  overlay = 0.45,
  children,
}: {
  src?: string;
  poster?: string;
  overlay?: number;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const vid = videoRef.current;
    if (vid && !Number.isNaN(vid.duration) && vid.duration > 0) {
      vid.currentTime = Math.min(vid.duration, Math.max(0, v * vid.duration));
    }
  });

  return (
    <div ref={ref} className="relative" style={{ height: "300vh" }}>
      <div className="sticky top-0 overflow-hidden" style={{ height: "100vh" }}>
        {src ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: poster ? `url(${poster}) center/cover` : "#111" }}
          />
        )}
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlay})` }} />
        <div className="absolute inset-0 flex items-center justify-center px-6">{children}</div>
      </div>
    </div>
  );
}
