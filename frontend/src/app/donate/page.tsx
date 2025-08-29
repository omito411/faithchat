// app/donate/page.tsx
import "./donate.css";

export const metadata = { title: "Donate • Gospel AI" };

export default function DonatePage() {
  return (
    <main className="donate">
      <section className="hero">
        <div className="fc-container hero-grid">
          <div className="hero-copy">
            <h1>Gospel AI</h1>
            <p>
              Gospel AI’s mission is to help people deepen their relationship with God every day.
              We give clear, Bible-based answers (KJV only) with Spurgeon insights.
            </p>
            <a
              className="btn btn-primary"
              href="https://your-giving-link.example" // replace with real link
              target="_blank"
              rel="noopener noreferrer"
            >
              Give here
            </a>
          </div>

          <div className="hero-art">
            <img
              src="/assets/donate-illustration.png"
              alt="Small group discussing Scripture with an open Bible"
            />
          </div>
        </div>
      </section>

      <footer className="fc-footer">
        <div className="fc-container">
          © {new Date().getFullYear()} Gospel AI • Built to help people grow in faith.
        </div>
      </footer>
    </main>
  );
}
