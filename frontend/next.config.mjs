/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      const BACKEND_ORIGIN = process.env.API_BASE_URL
        ? new URL(process.env.API_BASE_URL).origin
        : "";
  
      const STRIPE_JS = "https://js.stripe.com";
      const STRIPE_API = "https://api.stripe.com";
      const STRIPE_HOOKS = "https://hooks.stripe.com";
      const STRIPE_WILDCARD = "https://*.stripe.com";
  
      const connectSrc = [
        "'self'",
        STRIPE_JS,
        STRIPE_API,
        STRIPE_HOOKS,
        STRIPE_WILDCARD,
        BACKEND_ORIGIN,            // e.g. https://fc-api.yourdomain.tld
      ].filter(Boolean).join(" ");
  
      // keep as a single line
      const csp = [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline' ${STRIPE_JS}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob:",
        "font-src 'self' https://fonts.gstatic.com",
        `frame-src ${STRIPE_JS} ${STRIPE_HOOKS}`,
        `connect-src ${connectSrc}`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ");
  
      return [
        { source: "/:path*", headers: [{ key: "Content-Security-Policy", value: csp }] },
      ];
    },
  };
  
  export default nextConfig;