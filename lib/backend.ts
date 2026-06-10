// Single source of truth for the backend base URL.
// BACKEND_URL should be just the origin (e.g. http://localhost:8000), no path.
// Paths are appended in the BFF and SSR fetch helpers.
export function backendBaseUrl(): string {
  const raw = process.env.BACKEND_URL || 'http://localhost:8000';
  // Backwards-compat: if someone set BACKEND_URL=http://host/chat, strip trailing path
  return raw.replace(/\/(chat|mentors)\/?$/, '').replace(/\/$/, '');
}
