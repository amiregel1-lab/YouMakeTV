import { AdminSession, CreatorProfile, ViewerAccount } from '../types';

const VIEWER_KEY = 'youmake_viewer';
const CREATOR_KEY = 'youmake_creator';

export function loadViewer(): ViewerAccount | null {
  try {
    const raw = localStorage.getItem(VIEWER_KEY);
    return raw ? (JSON.parse(raw) as ViewerAccount) : null;
  } catch {
    return null;
  }
}

export function saveViewer(viewer: ViewerAccount | null) {
  try {
    if (viewer) {
      localStorage.setItem(VIEWER_KEY, JSON.stringify(viewer));
    } else {
      localStorage.removeItem(VIEWER_KEY);
    }
  } catch {
    // ignore storage errors in prototype
  }
}

export function loadCreator(): CreatorProfile | null {
  try {
    const raw = localStorage.getItem(CREATOR_KEY);
    return raw ? (JSON.parse(raw) as CreatorProfile) : null;
  } catch {
    return null;
  }
}

export function saveCreator(creator: CreatorProfile | null) {
  try {
    if (creator) {
      localStorage.setItem(CREATOR_KEY, JSON.stringify(creator));
    } else {
      localStorage.removeItem(CREATOR_KEY);
    }
  } catch {
    // ignore storage errors in prototype
  }
}

// ── Admin session ─────────────────────────────────────────────────────────
// Holds the server-issued token from /api/admin/login. It is a cache, not an
// authorisation: the dashboard revalidates it against /api/admin/verify on
// every mount, so editing this entry by hand grants no access.
const ADMIN_KEY = 'youmake_admin';

export function loadAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    // Sessions written before server-side auth (no token) are unusable.
    if (!parsed || typeof parsed.token !== 'string' || !parsed.token) return null;
    return parsed as AdminSession;
  } catch {
    return null;
  }
}

export function saveAdminSession(session: AdminSession) {
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(ADMIN_KEY);
  } catch {
    // ignore
  }
}

// ── Media overrides ───────────────────────────────────────────────────────
// Stores admin-uploaded cover photos (base64) and trailer URLs keyed by film title.
// Cover photos persist across sessions; trailer blob URLs are session-only.
const MEDIA_OVERRIDES_KEY = 'youmake_media_overrides';

export type MediaOverride = { thumbnail?: string; trailerUrl?: string };
export type MediaOverrides = Record<string, MediaOverride>;

export function loadMediaOverrides(): MediaOverrides {
  try {
    const raw = localStorage.getItem(MEDIA_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as MediaOverrides) : {};
  } catch {
    return {};
  }
}

export function saveMediaOverride(title: string, patch: Partial<MediaOverride>) {
  try {
    const overrides = loadMediaOverrides();
    overrides[title] = { ...overrides[title], ...patch };
    localStorage.setItem(MEDIA_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // ignore storage errors in prototype
  }
}
