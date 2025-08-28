import Link from "next/link";
import styles from "./donate.module.css";

export const metadata = { title: "Donate – Gospel AI" };

export default function DonatePage() {
  return (
    <div className={styles.page}>
      {/* Local (scoped) navbar just for the donate route */}
      <header className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            {/* Put /public/logo.png in your project root */}
            <img src="/assets/logo.png" alt="Gospel AI logo" />
            <span>Gospel AI</span>
          </Link>

          <nav className={styles.navLinks} aria-label="Primary">
            <Link href="/">Home</Link>
            <Link href="/chat">Chat</Link>
            <Link href="/donate" className={styles.active}>Donate</Link>
            <Link href="/login">Login</Link>
          </nav>
        </div>
      </header>

      {/* Hero / donate pitch */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>FaithChat AI</h1>
          <p>
            FaithChat AI’s mission is to help people deepen their relationship with God every day.
            We aim to encourage and challenge you to seek God with clear, Bible-based answers
            (NKJV only) and Spurgeon insights when helpful.
          </p>
          {/* TODO: point this to your real checkout URL (Stripe/Donorbox/etc.) */}
          <a href="/donate" className={styles.btnPrimary}>Give here</a>
        </div>

        <div className={styles.heroImage}>
          {/* Put /public/donate-illustration.png */}
          <img src="/assests/donate-illustration.png" alt="Group reading the Bible" />
        </div>
      </section>
    </div>
  );
}