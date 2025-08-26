"use client";

import Link from "next/link";
import Image from "next/image";
import "./home.css";

export default function Home() {
  return (
    <div className="home-app">
      {/* HERO WRAPPER */}
      <section className="home-hero-wrap">
        <div className="container">
          <div className="home-hero">
            {/* LEFT: Text content */}
            <div className="home-hero-content">
              <h1>
                Ask—learn—grow in God’s <span className="home-nowrap">Word.</span>
              </h1>
              <p className="home-lede">
                Bible‑first answers (NKJV) with clear, pastoral explanations — plus
                Spurgeon quotes when helpful. Ask anything about faith, life, or the Bible.
              </p>
              <div className="home-actions">
                <Link href="/chat" className="home-btn home-btn-primary">Open Chat</Link>
                <Link href="/donate" className="home-btn home-btn-ghost">Donate</Link>
              </div>
            </div>

            {/* RIGHT: Figure */}
            <div className="home-hero-figure">
              <Image
                src="/assets/hero-man2.png"
                alt="Person reading the Bible"
                width={430}
                height={620}
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
