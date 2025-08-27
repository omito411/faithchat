"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import "./navbar.css";

export default function NavBar() {
  const toggleId = "navToggle";
  const { token, signOut } = useAuth();

  const closeNav = () => {
    const cb = document.getElementById(toggleId) as HTMLInputElement | null;
    if (cb) cb.checked = false;
  };

  const handleSignOut = async (e?: React.MouseEvent<HTMLAnchorElement>) => {
    e?.preventDefault();
    closeNav();
    await signOut();
  };

  return (
    <header className="fc-navbar" data-global="header">
      <div className="fc-container fc-nav-inner">
        <Link className="fc-brand" href="/" onClick={closeNav}>
          <svg className="fc-brand-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <path d="M24 4c11.046 0 20 7.835 20 17.5S35.046 39 24 39c-1.51 0-2.973-.148-4.365-.43L9.2 43.3a1.4 1.4 0 0 1-1.945-1.534l1.76-7.73C6.29 30.96 4 26.61 4 21.5 4 11.835 12.954 4 24 4z" />
            <rect x="22" y="13" width="4" height="16" rx="1" />
            <rect x="16" y="19" width="16" height="4" rx="1" />
          </svg>
          <span className="fc-brand-text">Gospel AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="fc-nav-links" aria-label="Main">
          <Link href="/" onClick={closeNav}>Home</Link>
          <Link href="/chat" onClick={closeNav}>Chat</Link>
          <Link href="/donate" onClick={closeNav}>Donate</Link>

          {token ? (
            // Render as <a> to inherit the same link styling as "Login"
            <a href="#" onClick={handleSignOut}>Sign out</a>
          ) : (
            <Link href="/login" onClick={closeNav}>Login</Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <input id={toggleId} type="checkbox" className="fc-nav-toggle" aria-label="Toggle navigation" />
        <label htmlFor={toggleId} className="fc-hamburger" aria-hidden="true">
          <span></span><span></span><span></span>
        </label>

        {/* Mobile drawer */}
        <nav className="fc-nav-drawer" aria-label="Mobile">
          <Link href="/" onClick={closeNav}>Home</Link>
          <Link href="/chat" onClick={closeNav}>Chat</Link>
          <Link href="/donate" onClick={closeNav}>Donate</Link>

          {token ? (
            <a href="#" onClick={handleSignOut}>Sign out</a>
          ) : (
            <Link href="/login" onClick={closeNav}>Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
