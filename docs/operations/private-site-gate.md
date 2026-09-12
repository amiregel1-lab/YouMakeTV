# Temporary private-site gate

The root Vercel routing middleware requires HTTP Basic authentication on every
path before serving pages, static assets, prerendered HTML or API responses.
The existing application/admin authentication remains separate.

Configure `SITE_GATE_USERNAME` and `SITE_GATE_PASSWORD` as server-side Vercel
environment variables for Production, then deploy to Production. Preview
environment changes require separate authorization. Never use the
`VITE_` prefix or put real credentials in source control. Missing configuration
returns 503; invalid/missing authentication returns 401. Accepted authentication
continues routing with private/no-store and noindex headers. Gate credentials
are stripped before forwarding the request to application handlers.

Use HTTPS. Browsers display their native sign-in prompt and remember credentials
for that browser session. Close the private browsing session to clear that login.
The Vite development server does not execute Vercel routing middleware.

Verify the production custom domains and Vercel aliases after each deployment:
unauthenticated and incorrect credentials must fail on `/`, a deep link, an
actual JavaScript asset, `/sitemap.xml`, and an API route; correct credentials
must return the existing site. Run `node --test scripts/site-gate.test.mjs` for
the local access-control checks.

This gate covers this deployment. Previously deployed immutable URLs and public
Supabase/media URLs require their own access controls; cached copies already
downloaded cannot be recalled. Do not claim those resources were made private
without separately verifying them.

To reopen the site, remove this middleware in a deliberate reviewed deployment
and remove the two environment variables afterward. Do not delete the variables
first: that intentionally leaves the site unavailable rather than public.
