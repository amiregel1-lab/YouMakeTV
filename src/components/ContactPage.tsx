import { useState } from 'react';
import SEOHead from './SEOHead';
import { PAGE_SEO } from '../lib/seo';

type FormState = 'idle' | 'sending' | 'success' | 'error';

const SUBJECTS = ['General', 'Creator Support', 'Viewer Support', 'Copyright / DMCA', 'Press & Media', 'Partnerships'];

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];

const EMPTY_FORM = { name: '', email: '', phone: '', subject: 'General', message: '' };

// Where the lead came from — attached to the submission so the CRM keeps attribution.
function collectContext() {
  if (typeof window === 'undefined') return { page: '', referrer: '', utm: {} };
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  return { page: window.location.href, referrer: document.referrer || '', utm };
}

export default function ContactPage() {
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('sending');
    setErrorMsg('');

    // Read honeypot field directly from the form to avoid controlled-state
    const formEl = e.currentTarget;
    const honeypot = (formEl.elements.namedItem('_gotcha') as HTMLInputElement)?.value ?? '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...collectContext(), _gotcha: honeypot }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setState('error');
        setErrorMsg((data as { error?: string }).error ?? 'Something went wrong. Please try again.');
      } else {
        setState('success');
      }
    } catch {
      setState('error');
      setErrorMsg('Network error. Please check your connection and try again, or email info@youmaketv.ai directly.');
    }
  };

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20';

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <SEOHead {...PAGE_SEO['/contact']} />

      <div>
        <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple mb-4">
          Contact Us
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Get in touch</h1>
        <p className="mt-2 text-slate-500">
          We'd love to hear from you. Fill out the form and our team will respond within one business day.
        </p>
      </div>

      {state === 'success' ? (
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-10 text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl mx-auto">
            ✓
          </div>
          <h2 className="text-lg font-semibold text-slate-950">Message sent!</h2>
          <p className="text-sm text-slate-600">
            Thank you, <strong>{form.name}</strong>. We'll reply to <strong>{form.email}</strong> within one business day.
          </p>
          <button
            onClick={() => { setState('idle'); setForm(EMPTY_FORM); }}
            className="mt-2 text-sm font-semibold text-brand-purple hover:underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10 space-y-5"
        >
          {/* Honeypot — invisible to real users, bots fill it automatically */}
          <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
            <label htmlFor="_gotcha">Leave this empty</label>
            <input id="_gotcha" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
                Email address <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
                Phone <span className="normal-case tracking-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 555 000 0000"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className={inputClass}
              >
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="How can we help?"
              className={`${inputClass} resize-none`}
            />
          </div>

          {state === 'error' && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
              <span className="flex-none text-red-500 mt-0.5">✕</span>
              <p className="text-sm text-red-700 leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={state === 'sending'}
            className="w-full rounded-full bg-slate-950 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {state === 'sending' ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending…
              </>
            ) : (
              'Send Message →'
            )}
          </button>

          <p className="text-center text-xs text-slate-400">
            Protected by spam detection. We never share your email.
          </p>
        </form>
      )}

      {/* Direct contact info */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Creator Support', detail: 'info@youmaketv.ai', note: 'For onboarding, payouts, and film questions' },
          { label: 'Press & Media',   detail: 'info@youmaketv.ai', note: 'Interview requests and media inquiries' },
        ].map((c) => (
          <div key={c.label} className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{c.label}</p>
            <a
              href={`mailto:${c.detail}`}
              className="text-sm font-semibold text-brand-purple hover:underline"
            >
              {c.detail}
            </a>
            <p className="text-xs text-slate-500">{c.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
