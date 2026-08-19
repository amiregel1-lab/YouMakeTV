import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ViewerAccount } from '../types';
import SEOHead from './SEOHead';
import { PAGE_SEO } from '../lib/seo';

interface LoginPageProps {
  viewer?: ViewerAccount | null;
  onSignIn: (username: string, password: string) => void;
}

export default function LoginPage({ viewer, onSignIn }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const buttonLabel = useMemo(() => {
    if (viewer?.premium) return 'You are already signed in';
    if (viewer) return 'Continue as signed in user';
    return 'Sign in';
  }, [viewer]);

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
      <SEOHead {...PAGE_SEO['/login']} />
      <div className="relative rounded-[2.5rem] bg-brand-fade/40 p-8 sm:p-10">
        <div className="absolute inset-0 bg-brand-soft opacity-80" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple">
              Viewer account
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Sign in to YouMake+ access</h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              A seeded premium account exists at <span className="font-semibold text-slate-950">youmaketv</span> / <span className="font-semibold text-slate-950">1234</span>. Sign in to unlock premium pricing.
            </p>
            {viewer ? (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 text-slate-700">
                <p className="font-semibold">Signed in as {viewer.username}</p>
                <p className="mt-2">Premium status: {viewer.premium ? 'Active' : 'Standard viewer'}</p>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!username || !password) {
                setError('Enter both username and password.');
                return;
              }
              if (!ageConfirmed) {
                setError('Please confirm your age to continue.');
                return;
              }
              onSignIn(username.trim(), password.trim());
              navigate('/');
            }}
            className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="input-field mt-2"
                placeholder="youmaketv"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="input-field mt-2"
                placeholder="1234"
              />
            </div>
            {/* Age affirmation — the catalog includes R-rated films. */}
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(event) => setAgeConfirmed(event.target.checked)}
                className="mt-0.5 h-4 w-4 flex-none rounded border-slate-300 accent-brand-purple"
              />
              <span>
                I confirm I am 18 or older. Some films in the catalog are rated R.
              </span>
            </label>
            {error ? <p className="text-sm text-pink-600">{error}</p> : null}
            <button
              type="submit"
              disabled={!ageConfirmed}
              className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {buttonLabel}
            </button>
            <p className="text-sm text-slate-600">
              Don’t have a premium account? <Link to="/subscribe" className="font-semibold text-brand-purple hover:text-brand-indigo">Try YouMake+</Link> for instant savings.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
