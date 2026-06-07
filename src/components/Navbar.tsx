import { ViewerAccount } from '../types';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  active: string;
  viewer?: ViewerAccount | null;
  onRouteChange: (route: 'home' | 'subscribe' | 'creator' | 'creators' | 'onboarding' | 'dashboard' | 'login' | 'account') => void;
  onSignOut: () => void;
}

export default function Navbar({ active, viewer, onRouteChange, onSignOut }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        <button className="flex items-center gap-3 text-left" onClick={() => onRouteChange('home')}>
          <BrandLogo />
        </button>

        <nav className="hidden items-center gap-8 lg:flex">
          <button
            onClick={() => onRouteChange('home')}
            className={`text-sm font-semibold transition ${active === 'home' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Movies
          </button>
          <button
            onClick={() => onRouteChange('subscribe')}
            className={`text-sm font-semibold transition ${active === 'subscribe' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900'}`}
          >
            YouMake+
          </button>
          <button
            onClick={() => onRouteChange('creators')}
            className={`text-sm font-semibold transition ${active === 'creators' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Creators
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {viewer?.premium && (
            <span className="hidden items-center gap-2 rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-purple sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-purple" />
              YouMake+
            </span>
          )}
          {viewer ? (
            <button
              onClick={() => onRouteChange('account')}
              className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 sm:inline-flex"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-white text-xs font-bold">
                {viewer.username.charAt(0).toUpperCase()}
              </span>
              {viewer.username}
            </button>
          ) : null}
          {viewer ? (
            <button
              onClick={onSignOut}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Sign out
            </button>
          ) : (
            <>
              <button
                onClick={() => onRouteChange('subscribe')}
                className="rounded-full bg-brand-purple px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-indigo"
              >
                Sign up
              </button>
              <button
                onClick={() => onRouteChange('login')}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
