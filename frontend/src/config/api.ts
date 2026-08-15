// ============================================================
// Centralized API Configuration
// ============================================================

/**
 * Base URL for the backend API.
 * In development: Uses VITE_API_URL or defaults to relative path (handled by Vite proxy) / localhost:5000.
 * In production: Configured via environment variable VITE_API_URL (e.g. on Vercel/Netlify).
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
