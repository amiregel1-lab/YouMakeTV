// Analytics integration points.
// Set the corresponding env vars in .env (see .env.example) to activate.
// This file is a no-op until IDs are configured — safe to ship as-is.

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;
const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

export function initAnalytics() {
  if (GA_ID) loadGA(GA_ID);
  if (GTM_ID) loadGTM(GTM_ID);
  if (META_PIXEL_ID) loadMetaPixel(META_PIXEL_ID);
}

function loadGA(id: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  // @ts-expect-error — gtag global injected at runtime
  window.dataLayer = window.dataLayer || [];
  // @ts-expect-error
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  // @ts-expect-error
  window.gtag('js', new Date());
  // @ts-expect-error
  window.gtag('config', id);
}

function loadGTM(id: string) {
  // @ts-expect-error
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',id);
}

function loadMetaPixel(id: string) {
  // @ts-expect-error
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  // @ts-expect-error
  window.fbq('init', id);
  // @ts-expect-error
  window.fbq('track', 'PageView');
}

export function trackPageView(path: string) {
  // @ts-expect-error
  if (typeof window.gtag === 'function') window.gtag('event', 'page_view', { page_path: path });
  // @ts-expect-error
  if (typeof window.fbq === 'function') window.fbq('track', 'PageView');
}
