import { useState } from 'react';

interface CreatorLoginPageProps {
  onSignIn: () => void;
  onStart: () => void;
  onViewDemo?: () => void;
}

const BENEFITS = [
  'Start earning 30% revenue share from day one',
  'Grow to 35% at 1,000 views, 40% at 5,000 views',
  'Real-time earnings dashboard',
  'Upload, edit, and manage your films',
  'Monthly payouts direct to your account',
  'Creator community & dedicated support',
];

const STATS = [
  { label: 'Starting revenue share', value: '30%' },
  { label: 'Pro tier revenue share', value: '40%' },
  { label: 'Minimum payout', value: '$25' },
  { label: 'Payout schedule', value: 'Monthly' },
];

export default function CreatorLoginPage({ onSignIn, onStart, onViewDemo }: CreatorLoginPageProps) {
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Creator sign-in only. The admin shortcut that used to live here (admin
    // credentials typed into this form granted the Super Admin dashboard) was a
    // second copy of the credentials in the public bundle — admins sign in at
    // /superadmin, which authenticates server-side.
    onSignIn();
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-10">
      <div className="w-full max-w-5xl rounded-[2rem] overflow-hidden border border-slate-200/70 shadow-2xl lg:grid lg:grid-cols-2">

        {/* ── Left: Login Form ─────────────────────────────────────────────── */}
        <div className="bg-white px-8 py-12 sm:px-12 space-y-7">

          {/* Header */}
          <div>
            <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-purple mb-4">
              Creator Portal
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Sign in to your creator account</h1>
            <p className="mt-2 text-sm text-slate-500">Manage your films, track earnings, and grow your audience.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="creator@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Password</label>
                <button type="button" className="text-xs text-brand-purple hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-brand-purple"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-brand-purple py-3.5 text-sm font-semibold text-white transition hover:bg-brand-indigo"
            >
              Sign in to Creator Portal →
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or continue with</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* New creator CTA */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-5 space-y-3 text-center">
            <p className="text-sm font-semibold text-slate-700">New to YouMakeTV?</p>
            <p className="text-xs text-slate-500">Join a growing community of AI film creators on YouMakeTV.</p>
            <button
              type="button"
              onClick={onStart}
              className="rounded-full border border-brand-purple/40 px-5 py-2 text-sm font-semibold text-brand-purple transition hover:bg-brand-purple/10"
            >
              Start Creator Onboarding →
            </button>
          </div>
        </div>

        {/* ── Right: Benefits Panel ─────────────────────────────────────────── */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-950 px-10 py-12 text-white">

          {/* Top */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-3">
                Why creators choose us
              </p>
              <h2 className="text-xl font-bold text-white leading-snug">
                Your films. Your revenue.<br />Your dashboard.
              </h2>
            </div>

            {/* Benefits list */}
            <ul className="space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-slate-300">
                  <svg
                    className="h-5 w-5 text-brand-cyan flex-none mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>

            <div className="h-px bg-white/10" />

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 space-y-1"
                >
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: trust + demo */}
          <div className="space-y-4 mt-8">
            <div className="h-px bg-white/10" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Creators retain full IP ownership. Revenue share is based on your original film price.
            </p>
            {onViewDemo && (
              <button
                type="button"
                onClick={onViewDemo}
                className="text-xs text-brand-cyan hover:text-white transition underline underline-offset-4"
              >
                View full dashboard demo →
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
