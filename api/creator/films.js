import { methodGuard, requireSupabase, setServiceHeaders, pgrest, readJsonBody, SUPABASE_URL, SERVICE_KEY } from '../_lib/service.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function safeUrl(value) {
  if (!value) return null;
  const url = new URL(String(value));
  if (url.protocol !== 'https:' || url.username || url.password || url.href.length > 2000) throw Error('Use a valid HTTPS media URL.');
  return url.href;
}
function clean(film, user) {
  const text = (key, max = 300) => String(film[key] || '').trim().slice(0, max);
  const title = text('title'), description = text('description', 4000);
  if (!title || description.length < 10) throw Error('Add a title and a description of at least 10 characters.');
  const price = Number(film.price ?? 0);
  if (!Number.isFinite(price) || price < 0 || price > 10000) throw Error('Invalid price.');
  return { title, description, subtitle: text('subtitle'), genre: text('genre'), duration: text('duration'), creator_name: String(user.user_metadata.studio_name || user.user_metadata.full_name || 'Creator').slice(0, 200), price,
    cover_url: safeUrl(film.thumbnail), trailer_url: safeUrl(film.trailerUrl), film_url: safeUrl(film.filmUrl), rating: text('rating'), language: text('language'), tools: Array.isArray(film.tools) ? film.tools.slice(0, 30).map(t => String(t).slice(0, 100)) : [] };
}
export function creatorFilm(row, privateRow) {
  return { id: String(row.id), title: row.title, subtitle: row.subtitle || '', description: row.description || '', genre: row.genre || '', category: row.genre || '', duration: row.duration || '', creator: row.creator_name || '', price: Number(row.price || 0), thumbnail: row.cover_url || '', status: row.status,
    views: row.views || 0, trailerViews: row.trailer_views || 0, paidWatches: 0, freeWatches: 0, rating: row.rating || '', language: row.language || '', tools: row.tools || [], trailerUrl: row.trailer_url || undefined, filmUrl: privateRow?.film_url || undefined, uploadDate: row.created_at, updatedDate: row.updated_at };
}
export default async function handler(req, res) {
  setServiceHeaders(res);
  if (!methodGuard(req, res, ['GET', 'POST', 'PATCH', 'DELETE']) || !requireSupabase(res)) return;
  const bearer = req.headers.authorization;
  if (typeof bearer !== 'string' || !bearer.startsWith('Bearer ') || bearer.length > 8192) return res.status(401).json({ error: 'Please sign in.' });
  try {
    const verified = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SERVICE_KEY, Authorization: bearer }, signal: AbortSignal.timeout(7000) });
    if (!verified.ok) return res.status(401).json({ error: 'Please sign in again.' });
    const user = await verified.json();
    if (!user.id || user.user_metadata?.account_type !== 'creator') return res.status(403).json({ error: 'A creator account is required.' });
    const owner = encodeURIComponent(user.id);
    if (req.method === 'GET') {
      const ownership = await pgrest(`/creator_movie_owners?owner_user_id=eq.${owner}&select=movie_id,film_url&limit=1000`);
      if (!ownership.ok) throw Error('Your films could not be loaded.');
      if (!ownership.data.length) return res.status(200).json({ films: [] });
      const movies = await pgrest(`/movies?id=in.(${ownership.data.map(r => r.movie_id).join(',')})&select=*&order=created_at.desc&limit=1000`);
      if (!movies.ok) throw Error('Your films could not be loaded.');
      return res.status(200).json({ films: movies.data.map(r => creatorFilm(r, ownership.data.find(p => p.movie_id === r.id))) });
    }
    const body = readJsonBody(req);
    if (!body || typeof body !== 'object' || JSON.stringify(body).length > 15000) return res.status(400).json({ error: 'Invalid submission.' });
    let id;
    if (req.method === 'POST') {
      if (!uuid.test(body.requestId || '')) return res.status(400).json({ error: 'Invalid request ID.' });
      let film;
      try { film = clean(body.film || {}, user); } catch (e) { return res.status(400).json({ error: e.message }); }
      const made = await pgrest('/rpc/create_creator_draft', { method: 'POST', body: JSON.stringify({ owner_id: user.id, request_id_input: body.requestId, film }) });
      if (!made.ok) throw Error('The film draft could not be saved. Please retry.');
      id = made.data;
    } else {
      id = Number(body.id);
      if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid film.' });
      const ownership = await pgrest(`/creator_movie_owners?movie_id=eq.${id}&owner_user_id=eq.${owner}&select=movie_id,film_url`);
      if (!ownership.ok) throw Error('The film could not be loaded.');
      if (!ownership.data.length) return res.status(404).json({ error: 'Film not found.' });
      if (req.method === 'DELETE') {
        const removed = await pgrest(`/movies?id=eq.${id}`, { method: 'DELETE' });
        if (!removed.ok) throw Error('The film could not be deleted.');
        return res.status(200).json({ ok: true });
      }
      const current = await pgrest(`/movies?id=eq.${id}&select=*`);
      if (!current.ok || !current.data[0]) throw Error('The film could not be loaded.');
      const original = creatorFilm(current.data[0], ownership.data[0]);
      let film;
      try { film = clean({ ...original, ...body.changes }, user); } catch (e) { return res.status(400).json({ error: e.message }); }
      const nextStatus = body.changes?.status === 'Pending Review' ? 'Pending Review' : current.data[0].status === 'Approved' ? 'Pending Review' : current.data[0].status;
      if (nextStatus === 'Pending Review' && !film.film_url) return res.status(400).json({ error: 'Add the full film URL before submitting for review.' });
      const media = await pgrest(`/creator_movie_owners?movie_id=eq.${id}&owner_user_id=eq.${owner}`, { method: 'PATCH', body: JSON.stringify({ film_url: film.film_url }) });
      if (!media.ok) throw Error('The film could not be saved.');
      delete film.film_url;
      const updated = await pgrest(`/movies?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ ...film, status: nextStatus, visible: false, updated_at: new Date().toISOString() }) });
      if (!updated.ok) throw Error('The film could not be saved.');
    }
    const [rows, privateRows] = await Promise.all([pgrest(`/movies?id=eq.${id}&select=*`), pgrest(`/creator_movie_owners?movie_id=eq.${id}&owner_user_id=eq.${owner}&select=film_url`)]);
    if (!rows.ok || !privateRows.ok || !rows.data[0]) throw Error('The saved film could not be loaded. Please retry.');
    return res.status(req.method === 'POST' ? 201 : 200).json({ film: creatorFilm(rows.data[0], privateRows.data[0]) });
  } catch (error) {
    return res.status(503).json({ error: error instanceof Error ? error.message : 'Film service unavailable. Please retry.' });
  }
}
