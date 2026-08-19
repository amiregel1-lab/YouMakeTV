// Single source of truth for everything that ends up in a <head>.
//
// Two consumers read this file:
//   1. <SEOHead> at runtime (react-helmet-async), and
//   2. scripts/prerender.mjs at build time, which writes the same tags into the
//      static HTML so crawlers that never run JavaScript see them.
//
// Because both read the SAME table, the prerendered head and the rendered head
// agree. The prerendered tags carry Helmet's own `data-rh` marker, so Helmet
// adopts and replaces them on first render instead of leaving a second copy
// behind — which is what used to put two canonicals on every page.

import type { Movie } from '../types';

export const SITE_NAME = 'YouMakeTV.ai';

/**
 * The host the site actually serves. The apex 308s to www, so every canonical,
 * sitemap entry and JSON-LD url must name www or it names a redirect.
 */
export const BASE_URL = 'https://www.youmaketv.ai';

export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
export const TWITTER_HANDLE = '@YouMakeTV';

export interface PageSeo {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'video.movie' | 'article';
  noIndex?: boolean;
  structuredData?: object | object[];
}

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${BASE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/**
 * "1h 59m" → "PT1H59M". Returns undefined when nothing numeric can be read, so
 * a malformed runtime value drops the property instead of emitting invalid
 * ISO-8601 (the old code produced "PT1h 59M").
 */
export function isoDuration(duration?: string): string | undefined {
  if (!duration) return undefined;
  const hours = Number(duration.match(/(\d+)\s*h/i)?.[1] ?? 0);
  const minutes = Number(duration.match(/(\d+)\s*m/i)?.[1] ?? 0);
  if (!hours && !minutes) return undefined;
  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}`;
}

// ── Movie pages ─────────────────────────────────────────────────────────────

/**
 * Everything a movie page puts in its head, including the structured data.
 *
 * The Movie node carries a valid ISO duration, the film's content rating and an
 * offer at the real price; a trailer, when one exists, is described as a
 * VideoObject — the schema type that actually earns video rich results.
 */
export function movieSeo(movie: Movie, posterUrl: string): PageSeo {
  const url = `${BASE_URL}/movie/${movie.id}`;
  const duration = isoDuration(movie.duration);
  const poster = absoluteUrl(posterUrl);

  const movieNode: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.description,
    genre: movie.genres?.length ? movie.genres : movie.genre,
    image: poster,
    url,
    creator: { '@type': 'Organization', name: movie.creator },
    offers: {
      '@type': 'Offer',
      url,
      price: (movie.price ?? 0).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };
  if (duration) movieNode.duration = duration;
  if (movie.rating) movieNode.contentRating = movie.rating;
  if (movie.language) movieNode.inLanguage = movie.language;
  if (movie.releaseYear) movieNode.datePublished = String(movie.releaseYear);

  const nodes: object[] = [movieNode];

  if (movie.trailerUrl) {
    nodes.push({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${movie.title} — Official Trailer`,
      description: `Official trailer for ${movie.title}, an AI-generated ${movie.genre} film by ${movie.creator} on ${SITE_NAME}.`,
      thumbnailUrl: poster,
      uploadDate: movie.createdAt ?? `${movie.releaseYear ?? new Date().getFullYear()}-01-01`,
      contentUrl: absoluteUrl(movie.trailerUrl),
      embedUrl: url,
      ...(movie.rating ? { contentRating: movie.rating } : {}),
    });
  }

  return {
    title: `${movie.title} — ${movie.genre} AI Film`,
    description: movie.description.slice(0, 155),
    canonical: `/movie/${movie.id}`,
    ogImage: poster,
    ogType: 'video.movie',
    structuredData: nodes,
  };
}

// ── Studio pages ────────────────────────────────────────────────────────────

export function studioSeo(studioName: string, filmCount: number, viewsLabel: string): PageSeo {
  const path = `/studio/${encodeURIComponent(studioName)}`;
  return {
    title: `${studioName} | ${SITE_NAME}`,
    description: `Browse ${filmCount} films from ${studioName} on ${SITE_NAME}. ${viewsLabel} total views.`,
    canonical: path,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: studioName,
      description: `AI film studio on ${SITE_NAME}. ${filmCount} films, ${viewsLabel} total views.`,
      url: `${BASE_URL}${path}`,
    },
  };
}

// ── Static routes ───────────────────────────────────────────────────────────
//
// The page components read their own entry from this table, so what the
// prerenderer writes and what Helmet renders are literally the same strings.

const HOME_DESCRIPTION =
  "Watch, discover, and publish AI-generated movies. Browse original AI films, support creators, and build an audience on the world's AI-native movie platform.";

export const PAGE_SEO = {
  '/': {
    title: 'YouMakeTV.ai | Watch and Publish AI-Generated Movies',
    description: HOME_DESCRIPTION,
    canonical: '/',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: BASE_URL,
        description: "The world's AI-native movie platform for watching and publishing AI-generated films.",
        logo: `${BASE_URL}/favicon.svg`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: BASE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${BASE_URL}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  },
  '/creators': {
    title: 'Become a Creator | YouMakeTV.ai',
    description:
      'Publish AI-generated films and earn revenue from every paid view. 30–40% revenue share. Free to join. Monthly payouts.',
    canonical: '/creators',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Become a Creator — YouMakeTV.ai',
      description: 'Turn your AI films into income on YouMakeTV.ai.',
      url: `${BASE_URL}/creators`,
    },
  },
  '/studios': {
    title: 'AI Film Studios | YouMakeTV.ai',
    description:
      'Discover AI film studios building the next generation of entertainment. Browse studios, watch their films, and find your next favorite production house.',
    canonical: '/studios',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'AI Film Studios — YouMakeTV.ai',
      description: 'Discover AI film studios building the next generation of entertainment.',
      url: `${BASE_URL}/studios`,
    },
  },
  '/subscribe': {
    title: 'YouMake+ | Watch More. Spend Less.',
    description:
      'Get 50% off every paid AI movie and unlimited free streaming. YouMake+ pays for itself after just a few movies. $4.99/month, cancel anytime.',
    canonical: '/subscribe',
  },
  '/creator': {
    title: 'Creator Portal | YouMakeTV.ai',
    description:
      'Publish your AI films on YouMakeTV.ai — upload, track performance, and grow an audience. Creator accounts are free while the platform is in beta.',
    canonical: '/creator',
  },
  '/creator/portal': {
    title: 'Creator Portal | YouMakeTV.ai',
    description:
      'Publish your AI films on YouMakeTV.ai — upload, track performance, and grow an audience. Creator accounts are free while the platform is in beta.',
    // Same page as /creator — one canonical, not two.
    canonical: '/creator',
  },
  '/about': {
    title: 'About | YouMakeTV.ai',
    description:
      "YouMakeTV.ai is the world's first streaming platform built exclusively for AI-generated movies and the creators who make them.",
    canonical: '/about',
  },
  '/contact': {
    title: 'Contact | YouMakeTV.ai',
    description:
      'Get in touch with the YouMakeTV team for creator support, viewer questions, press inquiries, or partnerships.',
    canonical: '/contact',
  },
  '/terms': {
    title: 'Terms of Service | YouMakeTV.ai',
    description: 'Read the YouMakeTV.ai Terms of Service governing viewer and creator use of the platform.',
    canonical: '/terms',
  },
  '/privacy': {
    title: 'Privacy Policy | YouMakeTV.ai',
    description: 'How YouMakeTV.ai collects, uses, shares and protects information — and what is not collected.',
    canonical: '/privacy',
  },
  '/copyright': {
    title: 'Copyright & DMCA Policy | YouMakeTV.ai',
    description: 'YouMakeTV.ai copyright and DMCA takedown procedures for rights holders and creators.',
    canonical: '/copyright',
  },
  '/creator-agreement': {
    title: 'Creator Agreement | YouMakeTV.ai',
    description:
      'The YouMakeTV.ai Creator Agreement governing content uploads, revenue share, licensing, and creator responsibilities.',
    canonical: '/creator-agreement',
  },

  // ── Private / functional routes ───────────────────────────────────────────
  // Prerendered so a direct load answers 200 with a real head, but never
  // indexed and never listed in the sitemap.
  '/login': {
    title: 'Sign In',
    description: 'Sign in to your YouMakeTV.ai account to watch AI-generated films and manage your subscription.',
    canonical: '/login',
    noIndex: true,
  },
  '/account': {
    title: 'My Account',
    description: 'Manage your YouMakeTV.ai account, subscription, and preferences.',
    canonical: '/account',
    noIndex: true,
  },
  '/creatorsLogin': {
    title: 'Creator Sign In',
    description: 'Sign in to the YouMakeTV.ai creator workspace.',
    canonical: '/creatorsLogin',
    noIndex: true,
  },
  '/creator/onboarding': {
    title: 'Create a Creator Account',
    description: 'Set up your YouMakeTV.ai creator account and publish your first AI film.',
    canonical: '/creator/onboarding',
    noIndex: true,
  },
  '/creator/dashboard': {
    title: 'Creator Dashboard',
    description: 'Your YouMakeTV.ai creator workspace.',
    canonical: '/creator/dashboard',
    noIndex: true,
  },
  '/creator/demo': {
    title: 'Creator Demo Workspace',
    description: 'A demonstration of the YouMakeTV.ai creator workspace with sample data.',
    canonical: '/creator/demo',
    noIndex: true,
  },
  '/superadmin': {
    title: 'Super Admin',
    description: 'YouMakeTV.ai platform administration.',
    canonical: '/superadmin',
    noIndex: true,
  },
  '/superadmin/dashboard': {
    title: 'Super Admin Dashboard',
    description: 'YouMakeTV.ai platform administration.',
    canonical: '/superadmin/dashboard',
    noIndex: true,
  },
} satisfies Record<string, PageSeo>;

export type StaticRoute = keyof typeof PAGE_SEO;
