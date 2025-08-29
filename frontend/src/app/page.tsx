"use client";

import Link from "next/link";
import Image from "next/image";
import "./home.css";

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="home-scope">
      {/* HERO */}
      <main id="home" className="hero">
        <section className="hero-inner">
          <div>
            <h1 className="title">
              Ask—learn—grow in God's word. Ask anything about faith, life, or the Bible.
            </h1>

            <p className="sub">
              Bible‑first answers (KJV) with clear, biblical explanations.
            </p>

            <div className="hero-actions">
              <Link href="/chat" className="btn btn-primary btn-lg">Start Chatting</Link>
              <Link href="/donate" className="btn btn-outline btn-lg">Donate</Link>
            </div>

            <div className="chips">
              <span className="chip">Scripture citations</span>
              <span className="chip">Study-friendly</span>
              <span className="chip">focused</span>
            </div>
          </div>

          <div className="art" aria-hidden="true">
            <div className="starfield" />
            {/* Inline SVG Bible with glow */}
            <svg viewBox="0 0 760 520" width="92%" style={{ filter: "drop-shadow(0 26px 60px rgba(70,120,255,.35))" }}>
              {/* Rays */}
              <g opacity="0.42">
                <defs>
                  <radialGradient id="rg" cx="50%" cy="55%" r="60%">
                    <stop offset="0%" stopColor="#80A4FF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#80A4FF" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <ellipse cx="380" cy="220" rx="360" ry="240" fill="url(#rg)" />
              </g>

              {/* Shadow */}
              <ellipse cx="380" cy="430" rx="280" ry="46" fill="rgba(0,0,0,.55)" />

              {/* Cover */}
              <path d="M110,320 L350,160 L350,360 L120,380 Z" fill="#0b1636" />
              <path d="M650,320 L410,160 L410,360 L640,380 Z" fill="#0b1636" />

              {/* Pages */}
              <path d="M350,170 C300,180 220,210 120,320 L120,380 C230,370 305,370 350,360 Z" fill="#bad0ff" />
              <path d="M410,170 C460,180 540,210 640,320 L640,380 C530,370 455,370 410,360 Z" fill="#bad0ff" />

              {/* Page lines */}
              <g stroke="#9fc0ff" strokeOpacity="0.7" strokeWidth="3">
                <path d="M140 305 C230 280 300 280 345 300" />
                <path d="M135 330 C230 305 300 305 345 325" />
                <path d="M135 350 C230 328 300 328 345 345" />
                <path d="M625 305 C530 280 460 280 415 300" />
                <path d="M630 330 C535 305 465 305 420 325" />
                <path d="M630 350 C535 328 465 328 420 345" />
              </g>

              {/* Center spine */}
              <rect x="368" y="360" width="24" height="28" fill="#0e1428" rx="4" />

              {/* Glow on pages */}
              <defs>
                <radialGradient id="pageGlow" cx="50%" cy="40%" r="70%">
                  <stop offset="0%" stopColor="#cfe0ff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#8bb3ff" stopOpacity="0.05" />
                </radialGradient>
              </defs>
              <ellipse cx="380" cy="260" rx="220" ry="120" fill="url(#pageGlow)" opacity="0.7" />
            </svg>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="home-foot">
        © {year} Gospel AI. All rights reserved.
      </footer>
    </div>
  );
}
