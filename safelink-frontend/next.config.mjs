/**
 * Next.js configuration for the SafeLink frontend.
 *
 * Single-website experience: the browser only ever talks to this
 * Next.js origin (http://localhost:3001). API calls to the FastAPI
 * backend are proxied server-side through /api/*, so the backend
 * URL is never exposed in the UI and no cross-origin requests are
 * needed from the browser.
 *
 * The backend origin can be overridden with the BACKEND_ORIGIN
 * environment variable (server-side only, never sent to the browser).
 */
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "http://127.0.0.1:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
