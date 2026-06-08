import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ViewerAccount } from '../types';
import SEOHead from './SEOHead';

interface SubscriptionPageProps {
  viewer?: ViewerAccount | null;
  onSubscribe: () => void;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconPercent = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);
const IconInfinity = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z" /><path d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z" />
  </svg>
);
const IconX = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconRefresh = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const IconHeart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconStar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ── FAQ data ──────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Why would I subscribe to YouMake+?',
    a: 'If you watch more than a few movies per month, YouMake+ can easily pay for itself. Members receive 50% off every paid movie and unlimited free movie streaming, making it the most affordable way to explore the growing world of AI-generated entertainment.',
  },
  {
    q: 'How much can I save?',
    a: 'Most members recover the monthly subscription cost after only a few movie purchases. Every paid movie is discounted by 50%, and savings increase the more you watch.',
  },
  {
    q: 'Do creators still get paid if I use YouMake+?',
    a: 'Yes. Creator payouts are calculated using the original movie price, not the discounted member price. YouMake+ helps viewers save money while continuing to support creators and their work.',
  },
  {
    q: 'Can I watch movies without subscribing?',
    a: 'Yes. Anyone can browse and watch movies on YouMakeTV. Free users can watch one free movie per day and pay standard pricing for premium titles.',
  },
  {
    q: 'What do YouMake+ members get?',
    a: 'Members receive unlimited free movie streaming, 50% off all paid movies, access to member pricing, and future member-exclusive benefits as the platform grows.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. There are no long-term contracts or commitments. You can cancel your membership at any time with no penalties.',
  },
  {
    q: 'Are new movies included?',
    a: 'Yes. New AI-generated movies are added regularly and member benefits apply across the growing catalog.',
  },
  {
    q: 'What kinds of movies are available?',
    a: 'YouMakeTV features AI-generated films across multiple genres including science fiction, action, comedy, fantasy, horror, thriller, documentary, mystery, animation, and drama.',
  },
  {
    q: 'Will YouMake+ get additional benefits in the future?',
    a: 'Yes. As YouMakeTV grows, members may receive access to exclusive promotions, early releases, premium features, and other subscriber-only benefits.',
  },
  {
    q: 'Is YouMake+ worth it if I only watch a few movies?',
    a: 'Even occasional viewers can save money with YouMake+. Just a handful of discounted purchases can offset the cost of membership while unlocking unlimited free movie streaming.',
  },
];

// ── FAQ item ──────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-950">{q}</span>
        <span className="flex-none text-slate-400"><IconChevron open={open} /></span>
      </button>
      {open && <p className="pb-4 text-sm leading-7 text-slate-600">{a}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SubscriptionPage({ viewer, onSubscribe }: SubscriptionPageProps) {
  const isActive = viewer?.premium;

  const CtaButton = ({ label = 'Join YouMake+ For $4.99/Month', large = false }: { label?: string; large?: boolean }) => {
    if (isActive) {
      return (
        <div className="flex items-center justify-center gap-2 font-semibold text-brand-purple">
          <span>✓</span><span>You're already a YouMake+ member</span>
        </div>
      );
    }
    return (
      <button
        onClick={onSubscribe}
        className={`w-full rounded-full bg-brand-purple font-semibold text-white transition hover:bg-brand-indigo shadow-lg shadow-brand-purple/25 ${large ? 'px-8 py-5 text-base' : 'px-6 py-4 text-sm'}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-16">
      <SEOHead
        title="YouMake+ | Watch More. Spend Less."
        description="Get 50% off every paid AI movie and unlimited free streaming. YouMake+ pays for itself after just a few movies. $4.99/month, cancel anytime."
        canonical="/subscribe"
      />

      {/* ── 1. HERO ────────────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative overflow-hidden bg-brand-fade/40 px-8 py-16 text-center sm:px-14 sm:py-24">
          <div className="absolute inset-0 bg-brand-soft opacity-70" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-brand-purple/10 blur-3xl pointer-events-none" />
          <div className="relative space-y-6 max-w-2xl mx-auto">
            <span className="inline-flex rounded-full bg-brand-purple/10 border border-brand-purple/20 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple">
              YouMake+ membership
            </span>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-950 leading-[1.08]">
              Watch More.<br />Spend Less.
            </h1>
            <p className="text-lg leading-8 text-slate-600 max-w-xl mx-auto">
              Get 50% off every paid movie, unlimited free movie streaming, and exclusive member pricing across the entire YouMakeTV catalog.
            </p>
            <p className="text-sm text-slate-500 font-medium">
              For less than the cost of two movies per month, YouMake+ pays for itself.
            </p>
            <div className="pt-2 max-w-xs mx-auto">
              <CtaButton label="Join YouMake+ For $4.99/Month" large />
              <p className="mt-3 text-xs text-slate-400">No commitment · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. COMPARISON: WITHOUT vs WITH ────────────────────────────────── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-slate-950">Why upgrade?</h2>
          <p className="mt-2 text-slate-500">See exactly what changes when you become a member.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Without */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 sm:p-8 space-y-5">
            <div>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Without YouMake+</span>
              <p className="mt-3 text-xs text-slate-400">Free viewer</p>
            </div>
            <ul className="space-y-3.5">
              {[
                'Pay full price for every movie',
                'Watch only 1 free movie per day',
                'No member discounts',
                'No member benefits',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-500">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-400 mt-0.5">
                    <IconX />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* With */}
          <div className="rounded-[2rem] border-2 border-brand-purple/40 bg-gradient-to-br from-brand-purple/5 to-brand-cyan/5 p-7 sm:p-8 space-y-5 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="rounded-full bg-brand-purple px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Best value</span>
            </div>
            <div>
              <span className="inline-flex rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-purple">With YouMake+</span>
              <p className="mt-3 text-xs text-brand-purple/70">$4.99/month</p>
            </div>
            <ul className="space-y-3.5">
              {[
                '50% off every paid movie',
                'Unlimited free movie streaming',
                'Exclusive member pricing',
                'New AI films added regularly',
                'Membership pays for itself after only a few purchases',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-purple text-white mt-0.5 text-xs font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3. SAVINGS EXAMPLES ───────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-slate-950">Members Save More</h2>
          <p className="mt-2 text-slate-500">Real savings on real movies. See how fast YouMake+ pays for itself.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Single movie',     full: '$4.99', member: '$2.49', saved: '$2.50' },
            { label: 'Premium movie',    full: '$7.99', member: '$3.99', saved: '$4.00' },
            { label: '5 movies / month', full: '$24.95', member: '$12.45 + $4.99 membership', saved: '$7.51' },
          ].map((ex) => (
            <div key={ex.label} className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">{ex.label}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Full price</span>
                  <span className="font-semibold text-slate-400 line-through">{ex.full}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">Member price</span>
                  <span className="font-semibold text-brand-purple">{ex.member}</span>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">You save</span>
                <span className="text-lg font-bold text-emerald-600">{ex.saved}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. COMPARISON TABLE ───────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-slate-950">Free vs YouMake+</h2>
          <p className="mt-2 text-slate-500">A clear look at what each tier includes.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft overflow-hidden">
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100">
            <div className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Feature</div>
            <div className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 text-center">Free</div>
            <div className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-purple text-center">YouMake+</div>
          </div>
          {[
            { feature: 'Free movie streaming',     free: '1 per day',    plus: 'Unlimited' },
            { feature: 'Paid movie discount',       free: 'None',         plus: '50% off always' },
            { feature: 'Member pricing',            free: '✗',            plus: '✓' },
            { feature: 'New films included',        free: 'Free only',    plus: 'All new films' },
            { feature: 'Future member benefits',    free: '✗',            plus: '✓' },
            { feature: 'Cancel anytime',            free: '—',            plus: '✓' },
          ].map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-3 border-b border-slate-100 last:border-0 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
              <div className="px-5 py-3.5 text-sm text-slate-700 font-medium">{row.feature}</div>
              <div className="px-5 py-3.5 text-sm text-slate-400 text-center">{row.free}</div>
              <div className="px-5 py-3.5 text-sm font-semibold text-brand-purple text-center">{row.plus}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. FEATURES ───────────────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-slate-950">Everything Included With YouMake+</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <IconPercent />,  title: '50% Off Every Paid Movie',             desc: 'Every paid film in the catalog, every time. The discount never expires.',             iconBg: 'bg-brand-purple/10', iconColor: 'text-brand-purple' },
            { icon: <IconInfinity />, title: 'Unlimited Free Movie Streaming',        desc: 'Watch as many free movies as you want. No daily limits, ever.',                       iconBg: 'bg-brand-cyan/10',   iconColor: 'text-brand-cyan'   },
            { icon: <IconRefresh />,  title: 'Cancel Anytime',                        desc: 'No long-term contracts. Cancel in one click with no questions asked.',                 iconBg: 'bg-emerald-50',      iconColor: 'text-emerald-600'  },
            { icon: <IconStar />,     title: 'New AI Films Added Regularly',          desc: 'Creators upload fresh AI-generated content continuously. Your benefits apply to all.', iconBg: 'bg-amber-50',        iconColor: 'text-amber-600'    },
            { icon: <IconHeart />,    title: 'Support Independent AI Creators',       desc: 'Creators earn based on the full movie price even when you pay the member rate.',       iconBg: 'bg-brand-pink/10',   iconColor: 'text-brand-pink'   },
            { icon: <IconStar />,     title: 'Future Member Perks & Exclusives',      desc: 'Early access, exclusive releases, and member-only promotions as the platform grows.',  iconBg: 'bg-indigo-50',       iconColor: 'text-indigo-600'   },
          ].map((f) => (
            <div key={f.title} className="rounded-[1.75rem] border border-slate-200/70 bg-white shadow-soft p-6 flex gap-4">
              <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl ${f.iconBg} ${f.iconColor}`}>
                {f.icon}
              </span>
              <div>
                <h3 className="font-semibold text-slate-950 text-sm">{f.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <div className="mt-6 rounded-[1.5rem] border border-brand-purple/15 bg-brand-purple/5 px-6 py-4 flex items-start gap-3">
          <span className="text-brand-purple mt-0.5 flex-none text-base">ℹ</span>
          <p className="text-sm text-slate-600">
            <strong className="text-slate-800">Creators are paid based on the original movie price,</strong> even when YouMake+ discounts apply. Your membership supports creators at full value.
          </p>
        </div>
      </section>

      {/* ── 6. SOCIAL PROOF ───────────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-slate-950">Why Members Subscribe</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { quote: 'I saved more than the membership cost in my first week. Absolutely worth it.', name: 'Alex M.', tag: 'Sci-Fi fan' },
            { quote: 'I watch several AI films a month and YouMake+ pays for itself. The discounts are real.', name: 'Jordan L.', tag: 'Action & Thriller' },
            { quote: 'The unlimited free movies alone make it worth it. I didn\'t expect to use it this much.', name: 'Riley K.', tag: 'Horror & Animation' },
          ].map((t) => (
            <div key={t.name} className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-7 space-y-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-7 italic">"{t.quote}"</p>
              <div>
                <p className="text-sm font-semibold text-slate-950">{t.name}</p>
                <p className="text-xs text-slate-400">{t.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative overflow-hidden bg-brand-fade/40 px-8 py-16 text-center sm:px-14 sm:py-20">
          <div className="absolute inset-0 bg-brand-soft opacity-70" />
          <div className="relative max-w-xl mx-auto space-y-5">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Start Saving On Every Movie Today
            </h2>
            <p className="text-base text-slate-600 leading-7">
              Join YouMake+ and unlock unlimited free streaming plus 50% off every paid movie.
            </p>
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="w-full max-w-xs">
                <CtaButton label="Join YouMake+ For $4.99/Month" large />
              </div>
              <p className="text-xs text-slate-400">No commitment · Cancel anytime</p>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              Creators are paid based on the original movie price, even when YouMake+ discounts apply.
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ────────────────────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-slate-950">Frequently Asked Questions</h2>
          <p className="mt-2 text-slate-500">Everything you need to know about YouMake+.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft px-6 sm:px-10 py-2">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ── Footer links ───────────────────────────────────────────────────── */}
      <div className="space-y-2 text-center text-sm text-slate-500 pb-4">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-950 hover:text-brand-purple transition">
            Sign in
          </Link>
        </p>
        <p>
          Are you a creator?{' '}
          <Link to="/creator" className="font-semibold text-brand-purple hover:text-brand-indigo transition">
            Open creator portal →
          </Link>
        </p>
      </div>

    </div>
  );
}
