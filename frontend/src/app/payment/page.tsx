// app/payment/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function AmountPicker({
  amount,
  setAmount,
}: {
  amount: number;
  setAmount: (v: number) => void;
}) {
  const presets = [5, 10, 20, 50];
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {presets.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAmount(v)}
            className={`px-3 py-2 rounded-xl border ${
              amount === v ? "border-white" : "border-white/20"
            }`}
          >
            €{v}
          </button>
        ))}
      </div>
      <div>
        <label className="text-sm opacity-80">Custom amount (€)</label>
        <input
          type="number"
          min={1}
          step="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-1 w-full bg-transparent border border-white/20 rounded-xl px-3 py-2"
        />
      </div>
    </div>
  );
}

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (error) {
      // Display last error on the form (Stripe handles most UI)
      setMessage(error.message ?? "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Apple Pay (Safari), Google Pay (Chrome/Android), and Card appear automatically */}
      <PaymentElement options={{ layout: "tabs" }} />
      <button
        disabled={!stripe || loading}
        className="w-full rounded-xl py-3 font-semibold bg-neutral-900 text-white disabled:opacity-50"
      >
        {loading ? "Processing…" : "Donate"}
      </button>
      {message && (
        <p className="text-sm text-red-400" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}

export default function PaymentPage() {
  const [amount, setAmount] = useState(20);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingPI, setLoadingPI] = useState(false);
  const [errorPI, setErrorPI] = useState<string | null>(null);

  // Build typed Elements options (fixes TS: appearance.theme literal)
  const elementsOptions: StripeElementsOptions | undefined = useMemo(() => {
    if (!clientSecret) return undefined;
    return {
      clientSecret,
      appearance: { theme: "night" }, // literal type OK
    };
  }, [clientSecret]);

  useEffect(() => {
    let cancelled = false;
    const createIntent = async () => {
      try {
        setLoadingPI(true);
        setErrorPI(null);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/donate/create-intent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount_eur: amount }),
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data = (await res.json()) as { clientSecret: string };
        if (!cancelled) setClientSecret(data.clientSecret);
      } catch (err: any) {
        if (!cancelled)
          setErrorPI(
            err?.message || "Could not initialize payment. Please try again."
          );
      } finally {
        if (!cancelled) setLoadingPI(false);
      }
    };

    createIntent();
    return () => {
      cancelled = true;
    };
  }, [amount]);

  return (
    <div className="px-4 py-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Support the mission</h1>
      <p className="text-sm opacity-80 mb-6">
        Give securely with Apple/Google Pay or card.
      </p>

      <AmountPicker amount={amount} setAmount={setAmount} />
      <div className="h-6" />

      {loadingPI && <p className="opacity-70 text-sm">Preparing checkout…</p>}
      {errorPI && (
        <p className="text-sm text-red-400 mb-4" role="alert">
          {errorPI}
        </p>
      )}

      {elementsOptions && (
        <Elements stripe={stripePromise} options={elementsOptions}>
          <CheckoutForm clientSecret={clientSecret!} />
        </Elements>
      )}
    </div>
  );
}
