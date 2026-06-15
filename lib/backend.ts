// BACKEND_URL should be just the origin (e.g. http://localhost:8000), no path.
export function backendBaseUrl(): string {
  const raw = process.env.BACKEND_URL || 'http://localhost:8000';
  // Strip trailing path in case BACKEND_URL=http://host/chat was set.
  return raw.replace(/\/(chat|mentors)\/?$/, '').replace(/\/$/, '');
}
