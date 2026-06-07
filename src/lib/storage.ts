import { CreatorProfile, ViewerAccount } from '../types';

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
