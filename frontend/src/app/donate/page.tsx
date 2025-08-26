"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./donate.css";

export default function DonatePage() {
  // Add a route hook to <body> so CSS can reliably target this page
  useEffect(() => {
    document.body.classList.add("route-donate");
    return () => document.body.classList.remove("route-donate");
  }, []);

  return (
    <div className="app" id="donate-root">
      {/* App bar with only back button */}
      <header className="appbar">
        <button
          className="back"
          aria-label="Back"
          onClick={() => window.history.back()}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M15.5 19.5 8.5 12l7-7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back</span>
        </button>
        <div className="spacer" aria-hidden="true" />
      </header>

      {/* HERO */}
      <section className="hero" role="banner" aria-label="Giving">
        <div className="hero-top hero-with-figure">
          <div className="brand">FaithChat</div>
        </div>

        {/* curved divider */}
        <svg
          className="curve"
          viewBox="0 0 100 16"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,10 C20,18 80,2 100,10 L100,16 L0,16 Z" />
        </svg>

        {/* central card */}
        <div className="hero-card">
          <h2>We’re grateful you’re a part of our FaithChat Community.</h2>
          <p>
            We know that intimacy with God has the power to transform lives, and
            living generously is one way we can draw closer to Him. Imagine what
            could happen when we partner together to help people around the
            world seek God every day!
          </p>
          <div className="cta-row">
            <Link href="#" className="btn btn-ghost">
              About FaithChat
            </Link>
            <Link href="#" className="btn btn-light">
              Give now
            </Link>
          </div>
        </div>
      </section>

      <div className="bottom-spacer" aria-hidden="true" />

      {/* Bottom tabbar */}
      <nav className="tabbar" aria-label="Primary">
        <Link href="/" className="tab active">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          <span>Home</span>
        </Link>
        <a href="#" className="tab">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M4 4h7v16H4zM13 8h7v12h-7z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
          <span>Bible</span>
        </a>
        <a href="#" className="tab">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M5 6h14M5 12h14M5 18h9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span>Plans</span>
        </a>
        <a href="#" className="tab">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span>Discover</span>
        </a>
        <a href="#" className="tab">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <circle cx="5" cy="6" r="2" />
            <circle cx="5" cy="12" r="2" />
            <circle cx="5" cy="18" r="2" />
            <path
              d="M10 6h9M10 12h9M10 18h9"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <span>More</span>
        </a>
      </nav>
    </div>
  );
}
