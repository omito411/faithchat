/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Derive just the ORIGIN (scheme+host+port) from API_BASE_URL
    const BACKEND_ORIGIN = process.env.API_BASE_URL
      ? new URL(process.env.API_BASE_URL).origin
      : "";

    const STRIPE_JS = "https://js.stripe.com";
    const STRIPE_API = "https://api.stripe.com";
    const STRIPE_HOOKS = "https://hooks.stripe.com";
    const STRIPE_WILDCARD = "https://*.stripe.com";

    // Build connect-src allowing your backend + Stripe
    const connectSrc = [
      "'self'",
      STRIPE_JS,
      STRIPE_API,
      STRIPE_HOOKS,
      STRIPE_WILDCARD,
      BACKEND_ORIGIN,            // ← your FastAPI origin (e.g. https://fc-api.up.railway.app)
      // Add any others you call from the browser here (e.g. Supabase, Sentry, etc.)
      // "https://<your-supabase-project>.supabase.co",
    ].filter(Boolean).join(" ");

    // Keep this a single line
    const csp = [
      "default-src 'self'",
      `script-src 'self' ${STRIPE_JS}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      `frame-src ${STRIPE_JS} ${STRIPE_HOOKS}`,
      `connect-src ${connectSrc}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // optional hardening:
      // "frame-ancestors 'self'",
      // "upgrade-insecure-requests"
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default nextConfig;