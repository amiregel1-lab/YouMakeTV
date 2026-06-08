import { useNavigate } from 'react-router-dom';
import SEOHead from './SEOHead';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <SEOHead
        title="About | YouMakeTV.ai"
        description="YouMakeTV.ai is the world's first streaming platform built exclusively for AI-generated movies and the creators who make them."
        canonical="/about"
      />

      {/* Hero */}
      <div className="rounded-[2.5rem] overflow-hidden border border-slate-200/70 bg-white shadow-soft p-10 sm:p-14">
        <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple mb-6">
          About YouMakeTV
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 mb-5">
          The home for AI-generated movies and creators.
        </h1>
        <p className="text-lg leading-8 text-slate-600">
          YouMakeTV.ai is the world's first streaming platform built exclusively for
          AI-generated film. We connect audiences who love next-generation storytelling
          with the creators building it — one film at a time.
        </p>
      </div>

      {/* Mission */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10 space-y-4">
        <h2 className="text-2xl font-semibold text-slate-950">Our Mission</h2>
        <p className="text-slate-600 leading-7">
          We believe AI filmmaking is the next creative frontier. Tools like Veo, Runway,
          Kling, Sora, and Midjourney are putting cinematic-quality production in the hands
          of individual creators. YouMakeTV exists to give those creators an audience —
          and that audience a place to discover what's being made.
        </p>
        <p className="text-slate-600 leading-7">
          Our platform handles distribution, monetization, and analytics so creators can
          focus entirely on making films. Viewers get a curated, ever-growing catalog of
          AI-generated entertainment across every genre.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { value: '$842k+', label: 'Paid out to creators', accent: 'text-brand-purple' },
          { value: '10+ genres', label: 'Of AI-generated content', accent: 'text-brand-cyan' },
          { value: 'Up to 40%', label: 'Revenue share for creators', accent: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-7 text-center space-y-1">
            <p className={`text-3xl font-semibold ${s.accent}`}>{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-semibold text-slate-950">What We Stand For</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { title: 'Creator ownership', desc: 'Creators retain full intellectual property over everything they upload. We distribute — they own.' },
            { title: 'Fair revenue share', desc: 'We offer 30–40% revenue share, one of the highest in the industry for independent content creators.' },
            { title: 'AI-native by design', desc: 'Every feature on YouMakeTV is built around the realities of AI filmmaking — not adapted from legacy platforms.' },
            { title: 'Audience first', desc: 'Viewers get a clean, ad-light experience designed for discovery — not algorithmic manipulation.' },
          ].map((v) => (
            <div key={v.title} className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-950">{v.title}</h3>
              <p className="text-sm text-slate-500 leading-6">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 text-center space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Ready to get started?</h2>
        <p className="text-slate-500 text-sm">Browse the catalog or launch your creator studio today.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Browse Movies
          </button>
          <button
            onClick={() => navigate('/creator')}
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
          >
            Become a Creator
          </button>
        </div>
      </div>
    </div>
  );
}
