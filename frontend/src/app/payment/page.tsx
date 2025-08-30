"use client";

import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import "./payment.css";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function AmountChips({
  amount,
  onPick,
}: {
  amount: number;
  onPick: (n: number) => void;
}) {
  const presets = [5, 10, 20, 50];
  return (
    <div className="chips" role="group" aria-label="Quick amounts">
      {presets.map((v) => (
        <button
          key={v}
          type="button"
          data-amount={v}
          className={`chip ${amount === v ? "active" : ""}`}
          onClick={() => onPick(v)}
        >
          €{v}
        </button>
      ))}
    </div>
  );
}

function CheckoutForm({
  clientSecret,
  amount,
}: {
  clientSecret: string;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coverFees, setCoverFees] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMsg("");

    // Optional: you can adjust the amount on your server if `coverFees` is true.
    // This UI toggle is just informative for now.

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
        receipt_email: email || undefined,
        payment_method_data: {
          billing_details: {
            name: name || undefined,
            email: email || undefined,
          },
        },
      },
    });

    if (error) setMsg(error.message ?? "Something went wrong.");
    setLoading(false);
  }

  return (
    <form className="pay-form" onSubmit={onSubmit} noValidate>
      <div className="row two">
        <div>
          <label className="label" htmlFor="donorName">
            Name on card
          </label>
          <input
            id="donorName"
            className="input"
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="donorEmail">
            Email
          </label>
          <input
            id="donorEmail"
            className="input"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="row">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      <label className="cover">
        <input
          type="checkbox"
          checked={coverFees}
          onChange={(e) => setCoverFees(e.target.checked)}
        />
        <span>Cover card fees (help us receive the full amount)</span>
      </label>

      <button className="btn btn-primary" disabled={!stripe || loading}>
        {loading ? "Processing…" : `Donate €${amount}`}
      </button>

      {msg && (
        <p id="msg" className="msg" role="alert">
          {msg}
        </p>
      )}
    </form>
  );
}

export default function PaymentPage() {
  const [amount, setAmount] = useState(20);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [errorPI, setErrorPI] = useState<string | null>(null);
  const [loadingPI, setLoadingPI] = useState(false);
  const [freq, setFreq] = useState<"once" | "monthly">("once");

  // Initialize/refresh the PaymentIntent when amount changes
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadingPI(true);
        setErrorPI(null);

        const res = await fetch("/api/donate/create-intent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ amount_eur: amount, frequency: freq }),
        });

        if (!res.ok) {
          throw new Error((await res.text()) || `HTTP ${res.status}`);
        }

        const data = (await res.json()) as { clientSecret: string };
        if (!cancelled) setClientSecret(data.clientSecret);
      } catch (err: any) {
        if (!cancelled)
          setErrorPI(err?.message || "Could not initialize checkout.");
      } finally {
        if (!cancelled) setLoadingPI(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [amount, freq]);

  // Stripe Elements options (only when we have a clientSecret)
  const elementsOptions: StripeElementsOptions | undefined = useMemo(() => {
    if (!clientSecret) return undefined;
    return { clientSecret, appearance: { theme: "night" } };
  }, [clientSecret]);

  // Handle chips + custom amount input
  const onPick = (n: number) => setAmount(n);
  const onCustomAmount = (v: string) => {
    const val = Number(String(v).replace(",", "."));
    if (!Number.isNaN(val)) setAmount(Math.max(1, Math.floor(val)));
  };

  return (
    <div className="pay-scope">
      <main className="donate">
        <div className="fc-container grid">
          {/* Intro */}
          <section className="intro">
            <h1>Support the mission</h1>
            <p className="lede">
              Give securely with Apple/Google Pay or card. Your gift helps us
              serve clear, Bible-based answers (NKJV only) and Christ-centred
              resources to more people.
            </p>

            {/* Amount + frequency selectors */}
            <div className="row">
              <label className="label">Amount</label>
              <AmountChips amount={amount} onPick={onPick} />
              <div className="amount-wrap">
                <span className="currency">€</span>
                <input
                  id="amount"
                  inputMode="decimal"
                  placeholder="Custom amount"
                  aria-label="Custom amount in euros"
                  value={amount}
                  onChange={(e) => onCustomAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <span className="label">Frequency</span>
              <div className="seg" role="tablist" aria-label="Donation frequency">
                <input
                  type="radio"
                  id="once"
                  name="freq"
                  value="once"
                  checked={freq === "once"}
                  onChange={() => setFreq("once")}
                />
                <label htmlFor="once">One-time</label>

                <input
                  type="radio"
                  id="monthly"
                  name="freq"
                  value="monthly"
                  checked={freq === "monthly"}
                  onChange={() => setFreq("monthly")}
                />
                <label htmlFor="monthly">Monthly</label>
              </div>
            </div>
          </section>

          {/* Payment card */}
          <section className="pay-card" aria-label="Donation form">
            {loadingPI && <p className="msg">Preparing checkout…</p>}
            {errorPI && (
              <p className="msg" role="alert">
                {errorPI}
              </p>
            )}

            {elementsOptions && clientSecret && (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <CheckoutForm clientSecret={clientSecret} amount={amount} />
              </Elements>
            )}
          </section>
        </div>

        <p className="site-note">
          Built with ❤️ · NKJV Scripture references only · Spurgeon quotes when
          helpful
        </p>
      </main>
    </div>
  );
}
