import { supabase } from './supabase';
import type { CreatorFilm } from '../types';
export async function creatorFilmsRequest(method = 'GET', body?: unknown): Promise<{ films?: CreatorFilm[]; film?: CreatorFilm }> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Please sign in to save your films.');
  const response = await fetch('/api/creator/films', { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Your film could not be saved. Please retry.');
  return result;
}
