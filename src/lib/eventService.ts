// Client helper for the /api/track analytics endpoint.
// logEvent() is fire-and-forget and NEVER throws — tracking must not break the UI.
// getTodayEventCounts() powers the admin "Today" dashboard's real engagement counts.

export type EventType = 'trailer_play' | 'purchase' | 'signup' | 'subscription' | 'movie_view' | 'preferred_source_click';

import { loadAdminSession } from './storage';

const ENDPOINT = '/api/track';

export function logEvent(type: EventType, opts: { movieId?: number; title?: string } = {}): void {
  try {
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, movieId: opts.movieId, title: opts.title }),
      keepalive: true, // still sends if the click navigates away
    }).catch(() => {
      /* tracking is best-effort; ignore network/endpoint errors */
    });
  } catch {
    /* never throw from a tracking call */
  }
}

export interface TodayEventCounts {
  configured: boolean;
  counts: Partial<Record<EventType, number>>;
}

function startOfTodayIso(): string {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate()).toISOString();
}

/**
 * Admin-only. GET /api/track returns platform-wide engagement — signups,
 * purchases, subscriptions — so it is no longer public; the signed admin session
 * token opens it, exactly as it opens the catalog write endpoints.
 */
export async function getTodayEventCounts(): Promise<TodayEventCounts> {
  try {
    const session = loadAdminSession();
    if (!session?.token) return { configured: false, counts: {} };

    const res = await fetch(`${ENDPOINT}?since=${encodeURIComponent(startOfTodayIso())}`, {
      headers: { 'x-admin-token': session.token },
    });
    if (!res.ok) return { configured: false, counts: {} };
    const data = await res.json();
    return { configured: Boolean(data?.configured), counts: data?.counts ?? {} };
  } catch {
    return { configured: false, counts: {} };
  }
}
