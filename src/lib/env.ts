const normalizeBaseUrl = (value?: string) => {
  if (!value) return '';
  return value.replace(/\/+$/, '');
};

const resolvedBackend =
  normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) ||
  normalizeBaseUrl(__BACKEND_URL__);

export const API_BASE_URL = resolvedBackend;

// Auth API - can be separate from main backend
export const AUTH_API_URL =
  normalizeBaseUrl(import.meta.env.VITE_AUTH_API_URL) ||
  (resolvedBackend ? `${resolvedBackend}/api/auth` : '');

// Database API - defaults to same origin (for Railway where server.js serves it)
// Set VITE_DB_API_URL if your /api/db is on a different host
export const DB_API_URL =
  normalizeBaseUrl(import.meta.env.VITE_DB_API_URL) || '';

export const AI_API_ENDPOINT =
  import.meta.env.VITE_AI_API_ENDPOINT?.trim() || __GENIUS_URL__;
export const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || '';

export const missingApiBase = !resolvedBackend;

