// Human-friendly message for common network failures so the user knows the
// backend must be running locally.
export function friendlyError(msg) {
  const m = String(msg || "");
  if (/failed to fetch|networkerror|load failed|econnrefused|econnreset|connect/i.test(m)) {
    return "The backend API is unreachable. Start it with `cd backend && npm run dev`, then Retry.";
  }
  return m;
}