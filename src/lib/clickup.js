/**
 * Client-side helpers for talking to the Vercel API routes that proxy
 * ClickUp. Never embeds the ClickUp token — that lives only in
 * Vercel's server-side env vars (CLICKUP_API_TOKEN).
 */

export async function fetchPrefill(clientId) {
  if (!clientId) return null;

  const res = await fetch(`/api/clickup-prefill?clientId=${encodeURIComponent(clientId)}`);
  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch { /* ignore */ }
    throw new Error(`Prefill failed (${res.status}): ${body.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Read clientId from the URL. Accepts both `?client_id=` and `?clientId=`
 * for forgiveness.
 */
export function readClientIdFromUrl() {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('client_id') || params.get('clientId') || '';
}
