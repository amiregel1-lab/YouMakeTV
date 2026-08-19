// Build-time prerender + sitemap generator.
//
// Runs after `vite build`. For every known route it writes a real HTML file into
// dist/ containing the built SPA shell PLUS that route's own <title>, meta
// description, canonical, robots, Open Graph / Twitter tags and JSON-LD, and a
// <noscript> summary carrying the page's actual words.
//
// Why this exists
// ---------------
// The app is a client-rendered SPA. Googlebot eventually renders it, but social
// scrapers (Facebook, X, LinkedIn, WhatsApp, Slack) and AI crawlers (GPTBot,
// ClaudeBot, PerplexityBot, Google-Extended) do not run JavaScript — they saw an
// empty <div id="root"> on all ~110 routes, so every shared link previewed as
// the generic homepage and no answer engine could name a single film.
//
// The movie catalog is a static 100-row file, so the whole known route set can
// be enumerated at build time. That is deterministic and debuggable, unlike a
// headless-render plugin.
//
// Head tags are written with Helmet's own `data-rh="true"` marker. On first
// render react-helmet-async adopts anything carrying that attribute and replaces
// it, so the rendered page ends up with exactly ONE canonical/description/OG set
// — not the two that made Google ignore the canonicals entirely.
//
// Route metadata comes from src/lib/seo.ts, which the React components read too:
// one table, so the prerendered head and the rendered head cannot drift.

import { createServer } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

// ── Small helpers ───────────────────────────────────────────────────────────

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** `<` inside a JSON-LD block would let a crafted string close the script tag. */
const escapeJsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const meta = (kind, key, content) =>
  `<meta data-rh="true" ${kind}="${escapeHtml(key)}" content="${escapeHtml(content)}" />`;

// ── Head + body for one route ───────────────────────────────────────────────

function headFor(seo, { SITE_NAME, BASE_URL, DEFAULT_OG_IMAGE, TWITTER_HANDLE }) {
  const fullTitle = seo.title.includes(SITE_NAME) ? seo.title : `${seo.title} | ${SITE_NAME}`;
  const canonicalUrl = seo.canonical ? `${BASE_URL}${seo.canonical}` : BASE_URL;
  const ogImage = seo.ogImage ?? DEFAULT_OG_IMAGE;

  const tags = [
    `<title data-rh="true">${escapeHtml(fullTitle)}</title>`,
    meta('name', 'description', seo.description),
    `<link data-rh="true" rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    meta('name', 'robots', seo.noIndex ? 'noindex, nofollow' : 'index, follow'),
    meta('property', 'og:title', fullTitle),
    meta('property', 'og:description', seo.description),
    meta('property', 'og:image', ogImage),
    meta('property', 'og:url', canonicalUrl),
    meta('property', 'og:type', seo.ogType ?? 'website'),
    meta('property', 'og:site_name', SITE_NAME),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:site', TWITTER_HANDLE),
    meta('name', 'twitter:title', fullTitle),
    meta('name', 'twitter:description', seo.description),
    meta('name', 'twitter:image', ogImage),
  ];

  if (seo.structuredData) {
    const nodes = Array.isArray(seo.structuredData) ? seo.structuredData : [seo.structuredData];
    tags.push(
      `<script data-rh="true" type="application/ld+json">${escapeJsonLd(nodes)}</script>`
    );
  }

  return tags.join('\n    ');
}

/**
 * What a crawler that never runs JavaScript reads.
 *
 * Inside <noscript> deliberately: a browser with JS renders the real app and
 * never shows this, and a reader with JS off sees exactly what the crawler sees.
 * It is the page's own content, not a keyword block.
 */
function noscriptFor(seo, extra) {
  const h1 = escapeHtml(extra?.h1 ?? seo.title.split(' | ')[0]);
  const facts = (extra?.facts ?? [])
    .map(([label, value]) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`)
    .join('');
  const body = (extra?.paragraphs ?? [seo.description])
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');

  return [
    '<noscript>',
    '  <div id="no-js-summary">',
    `    <h1>${h1}</h1>`,
    `    ${body}`,
    facts ? `    <ul>${facts}</ul>` : '',
    '    <nav aria-label="Site">',
    '      <a href="/">Browse AI films</a> · <a href="/studios">Studios</a> · ',
    '      <a href="/creators">Become a creator</a> · <a href="/subscribe">YouMake+</a> · ',
    '      <a href="/about">About</a> · <a href="/contact">Contact</a>',
    '    </nav>',
    '  </div>',
    '</noscript>',
  ]
    .filter(Boolean)
    .join('\n');
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Vite's own SSR loader reads the TypeScript sources directly, so the script
  // shares one catalog and one SEO table with the app — no duplicated strings,
  // no extra build dependency.
  const server = await createServer({
    root: ROOT,
    logLevel: 'error',
    server: { middlewareMode: true },
    appType: 'custom',
  });

  let seoModule, movieModule, posterModule, studioModule;
  try {
    seoModule = await server.ssrLoadModule('/src/lib/seo.ts');
    movieModule = await server.ssrLoadModule('/src/data/movies.ts');
    posterModule = await server.ssrLoadModule('/src/lib/posters.ts');
    studioModule = await server.ssrLoadModule('/src/lib/studioUtils.ts');
  } finally {
    await server.close();
  }

  const { PAGE_SEO, movieSeo, studioSeo, BASE_URL, SITE_NAME, DEFAULT_OG_IMAGE, TWITTER_HANDLE } =
    seoModule;
  const { movies } = movieModule;
  const { getPosterUrl } = posterModule;
  const { formatNum } = studioModule;
  const constants = { SITE_NAME, BASE_URL, DEFAULT_OG_IMAGE, TWITTER_HANDLE };

  const built = await readFile(path.join(DIST, 'index.html'), 'utf8');
  if (!built.includes('</head>')) throw new Error('dist/index.html has no </head> — did vite build run?');

  // Idempotent: running the script twice without an intervening `vite build`
  // must not stack a second set of tags onto dist/index.html.
  const shell = built
    .replace(/[ \t]*<script data-rh="true"[\s\S]*?<\/script>\r?\n?/gi, '')
    .replace(/[ \t]*<(?:meta|link) data-rh="true"[^>]*>\r?\n?/gi, '')
    .replace(/[ \t]*<title data-rh="true">[\s\S]*?<\/title>\r?\n?/gi, '')
    .replace(/[ \t]*<noscript>[\s\S]*?<\/noscript>\r?\n?/gi, '');

  // The shell's <title> is the JS-off fallback. A document with two <title>
  // elements shows the FIRST one, so it has to go before the per-route title is
  // written in — otherwise every prerendered page would still be titled
  // "YouMakeTV.ai | Watch and Publish AI-Generated Movies".
  const routeShell = shell.replace(/[ \t]*<title>[\s\S]*?<\/title>\r?\n?/i, '');
  if (routeShell.includes('<title>')) throw new Error('prerender: the shell still carries a <title>');

  // ── Assemble the route list ───────────────────────────────────────────────

  const routes = [];

  for (const [routePath, seo] of Object.entries(PAGE_SEO)) {
    routes.push({ path: routePath, seo });
  }

  for (const movie of movies) {
    const seo = movieSeo(movie, getPosterUrl(movie));
    routes.push({
      path: `/movie/${movie.id}`,
      seo,
      lastmod: movie.updatedAt ?? movie.createdAt,
      noscript: {
        h1: `${movie.title} (${movie.releaseYear ?? ''})`.trim(),
        paragraphs: [movie.subtitle, movie.description].filter(Boolean),
        facts: [
          ['Studio', movie.creator],
          ['Genre', (movie.genres ?? [movie.genre]).join(', ')],
          ['Runtime', movie.duration],
          ['Rating', movie.rating],
          ['Language', movie.language],
          ['Release year', String(movie.releaseYear ?? '')],
          ['Price', movie.price === 0 ? 'Free to watch' : `$${movie.price.toFixed(2)} — 50% off for YouMake+ members`],
          ['Made with', (movie.tools ?? []).join(', ')],
        ].filter(([, value]) => value),
      },
    });
  }

  // Studios are derived from the catalog, exactly as StudiosPage derives them.
  const studios = new Map();
  for (const movie of movies) {
    const entry = studios.get(movie.creator) ?? { films: [], views: 0 };
    entry.films.push(movie);
    entry.views += movie.views ?? 0;
    studios.set(movie.creator, entry);
  }

  for (const [name, { films, views }] of studios) {
    const seo = studioSeo(name, films.length, formatNum(views));
    routes.push({
      path: `/studio/${name}`, // written decoded; the URL form is percent-encoded
      seo,
      noscript: {
        h1: name,
        paragraphs: [
          `${name} is an AI film studio publishing on ${SITE_NAME}.`,
          `${films.length} films · ${formatNum(views)} total views.`,
        ],
        facts: films.map((film) => [film.title, `${film.genre} · ${film.duration} · ${film.rating}`]),
      },
    });
  }

  // ── Write one HTML file per route ─────────────────────────────────────────
  //
  // `/about` → dist/about.html, served at /about by vercel.json's `cleanUrls`.
  // `/` stays dist/index.html.

  for (const route of routes) {
    const html = routeShell
      .replace('</head>', `  ${headFor(route.seo, constants)}\n  </head>`)
      .replace('</body>', `  ${noscriptFor(route.seo, route.noscript)}\n  </body>`);

    const file =
      route.path === '/' ? path.join(DIST, 'index.html') : path.join(DIST, `${route.path.slice(1)}.html`);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html, 'utf8');
  }

  // A neutral shell for the two dynamic families whose members may exist in the
  // live Supabase catalog but not in the build-time snapshot (a new movie, a new
  // studio). No canonical and no robots directive: Helmet writes the correct
  // ones a moment later, and a wrong canonical is worse than none.
  await writeFile(
    path.join(DIST, 'app-shell.html'),
    routeShell.replace(
      '</head>',
      `  <title>${escapeHtml(PAGE_SEO['/'].title)}</title>\n    ${meta(
        'name',
        'description',
        PAGE_SEO['/'].description
      )}\n  </head>`
    ),
    'utf8'
  );

  // ── sitemap.xml ───────────────────────────────────────────────────────────
  // Generated from the same catalog, so it can no longer drift from the routes
  // that actually exist. Private routes carry noIndex and are excluded.

  const today = new Date().toISOString().slice(0, 10);
  const priorityFor = (routePath) => {
    if (routePath === '/') return '1.0';
    if (routePath.startsWith('/movie/')) return '0.8';
    if (routePath.startsWith('/studio/')) return '0.6';
    return '0.7';
  };

  const seen = new Set();
  const entries = [];
  for (const route of routes) {
    if (route.seo.noIndex) continue;
    // Alias routes point their canonical elsewhere — list the canonical once.
    const canonical = route.seo.canonical ?? route.path;
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    const loc = `${BASE_URL}${canonical.startsWith('/') ? '' : '/'}${encodeURI(canonical).replace(/&/g, '&amp;')}`;
    const lastmod = route.lastmod ? String(route.lastmod).slice(0, 10) : today;
    entries.push(
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priorityFor(canonical)}</priority>\n  </url>`
    );
  }

  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${entries.join('\n')}\n` +
    '</urlset>\n';

  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');

  console.log(
    `prerender: ${routes.length} routes written (${movies.length} movies, ${studios.size} studios), sitemap: ${entries.length} URLs`
  );
}

main().catch((err) => {
  console.error('prerender failed:', err);
  process.exit(1);
});
