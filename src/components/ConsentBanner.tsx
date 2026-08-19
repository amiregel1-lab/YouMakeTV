import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsConfigured, initAnalytics } from '../lib/analytics';

// Analytics consent.
//
// initAnalytics() used to run on first mount, injecting GA, GTM and the Meta
// Pixel from env IDs before anyone had been asked. That is an ePrivacy/GDPR
// problem the moment an ID is set for EU traffic, and it is a promise the
// Privacy Policy's cookie section could not keep.
//
// The banner is shown ONLY when an analytics ID is actually configured — with
// no IDs there is nothing to consent to, and a cookie banner that gates nothing
// is just noise. Decline means no tag is ever injected: the choice is checked
// before initAnalytics() is called, not after.

const CONSENT_KEY = 'youmake_analytics_consent';
type Choice = 'granted' | 'denied';

function readChoice(): Choice | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw === 'granted' || raw === 'denied' ? raw : null;
  } catch {
    return null;
  }
}

function writeChoice(choice: Choice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* a browser that refuses storage simply gets asked again next visit */
  }
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!analyticsConfigured()) return;
    const choice = readChoice();
    if (choice === 'granted') {
      initAnalytics();
      return;
    }
    if (choice === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (choice: Choice) => {
    writeChoice(choice);
    setVisible(false);
    if (choice === 'granted') initAnalytics();
  };

  return (
    <div
      role="dialog"
      aria-label="Analytics cookies"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur sm:flex-row sm:items-center">
        <p className="flex-1 text-sm leading-6 text-slate-600">
          We'd like to use analytics cookies to see which films people discover and where they get
          stuck. Nothing loads unless you say yes, and the site works exactly the same either way.{' '}
          <Link to="/privacy" className="font-semibold text-brand-purple hover:text-brand-indigo">
            Privacy Policy
          </Link>
        </p>
        <div className="flex flex-none gap-2">
          <button
            type="button"
            onClick={() => decide('denied')}
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => decide('granted')}
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Allow analytics
          </button>
        </div>
      </div>
    </div>
  );
}
