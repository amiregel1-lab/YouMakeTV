// Vercel serverless function — the catch-all 404.
//
// vercel.json used to rewrite EVERY unmatched path to index.html with HTTP 200,
// so an infinite URL space of typos, probes and dead links all answered "200 OK,
// here is the homepage". Search engines call that a soft 404 and it wastes crawl
// budget on pages that do not exist (a request for /llms.txt answered 200 with
// HTML before the file existed).
//
// Real routes never reach this function: the prerendered HTML files and the two
// dynamic rewrites (/movie/:id, /studio/:name) are matched by the filesystem
// first. Client-side navigation never touches the server at all, so in-app
// routing is unaffected — this only answers a direct request for a path that
// does not exist.

const PAGE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Page not found | YouMakeTV.ai</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <style>
      body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
             background: #f8fafc; color: #020617; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
      main { max-width: 32rem; padding: 2rem; text-align: center; }
      p.code { margin: 0 0 .5rem; font-size: .75rem; font-weight: 600; letter-spacing: .3em; text-transform: uppercase; color: #8b5cf6; }
      h1 { margin: 0 0 .75rem; font-size: 2.25rem; font-weight: 800; }
      p.lead { margin: 0 0 2rem; color: #64748b; line-height: 1.6; }
      a { display: inline-block; padding: .75rem 1.5rem; border-radius: 9999px; background: #8b5cf6;
          color: #fff; font-size: .875rem; font-weight: 600; text-decoration: none; }
      nav { margin-top: 1.5rem; font-size: .8125rem; color: #94a3b8; }
      nav a { background: none; color: #64748b; padding: 0 .35rem; text-decoration: underline; }
    </style>
  </head>
  <body>
    <main>
      <p class="code">404</p>
      <h1>Page not found</h1>
      <p class="lead">The page you're looking for doesn't exist or may have been moved.</p>
      <a href="/">Browse AI films</a>
      <nav>
        <a href="/studios">Studios</a>·<a href="/creators">Creators</a>·<a href="/subscribe">YouMake+</a>·<a href="/contact">Contact</a>
      </nav>
    </main>
  </body>
</html>
`;

export default function handler(_req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.status(404).send(PAGE);
}
