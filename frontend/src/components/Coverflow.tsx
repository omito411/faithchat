"use client";
import Image from "next/image";
import { useMemo, useState } from "react";

const IMAGES = [
  "/coverflow/serene-water-mirroring.jpg",
  "/coverflow/mountain-landscape.jpg",
  "/coverflow/ocean-sunset-golden-hour.jpg",
  "/coverflow/rolling-sand-dunes.jpg",
  "/coverflow/starry-night.jpg",
  "/coverflow/forest-path.jpg",
  "/coverflow/cascading-waterfall.jpg",
];

export default function Coverflow() {
  const [index, setIndex] = useState(3);

  const cards = useMemo(() => {
    const range = IMAGES.map((src, i) => {
      const offset = i - index;
      const z = -Math.abs(offset) * 60;
      const rotate = offset * 20;
      const translateX = offset * 60;
      return { src, key: i, style: { transform: `translateX(${translateX}px) translateZ(${z}px) rotateY(${rotate}deg)` }, dim: Math.abs(offset) > 0 };
    });
    return range;
  }, [index]);

  const next = () => setIndex((i) => Math.min(i + 1, IMAGES.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="coverflow px-2">
      <div className="coverflow-track">
        {cards.map(({ src, key, style, dim }) => (
          <div className={`coverflow-card ${dim ? "dim" : ""}`} style={style as any} key={key}>
            <Image src={src} alt="" fill sizes="280px" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3 justify-center">
        <button onClick={prev} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5">Prev</button>
        <button onClick={next} className="rounded-full bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400">Next</button>
      </div>
    </div>
  );
}
