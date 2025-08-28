"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import "./navbar.css";

export default function NavBar() {
  const pathname = usePathname();
  const { token, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // lock body scroll when menu is open
  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  // close menu when resizing to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 760) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname?.startsWith(href);

  return (
    <header className="fc-navbar">
      <div className="fc-container fc-nav-inner">
        {/* Brand */}
        <Link className="fc-brand" href="/">
          <img className="fc-brand-logo" src="/assets/faithchat-logo.png" alt="FaithChat AI logo" />
          <span className="fc-brand-text">FaithChat AI</span>
        </Link>

        {/* Burger */}
        <button
          className="fc-burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="fc-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>

        {/* Links */}
        <nav
          id="fc-nav"
          className={`fc-links${open ? " open" : ""}`}
          aria-label="Primary"
          onClick={() => setOpen(false)} // close on any link click
        >
          <Link href="/" className={isActive("/") ? "active" : ""}>Home</Link>
          <Link href="/chat" className={isActive("/chat") ? "active" : ""}>Chat</Link>
          <Link href="/donate" className={isActive("/donate") ? "active" : ""}>Donate</Link>

          {token ? (
            // same style as Login; rendered as link for consistent look
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); signOut(); }}
            >
              Sign out
            </a>
          ) : (
            <Link href="/login" className={isActive("/login") ? "active" : ""}>Login</Link>
          )}
        </nav>
      </div>

      {/* Mobile scrim */}
      {open && <div className="fc-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
    </header>
  );
}
