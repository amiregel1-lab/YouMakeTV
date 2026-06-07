import { ViewerAccount } from '../types';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  active: string;
  viewer?: ViewerAccount | null;
  onRouteChange: (route: 'home' | 'subscribe' | 'creator' | 'onboarding' | 'dashboard' | 'login' | 'account') => void;
  onSignOut: () => void;
}

export default function Navbar({ active, viewer, onRouteChange, onSignOut }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button className="flex items-center gap-3 text-left" onClick={() => onRouteChange('home')}>
          <BrandLogo />
        </button>

        <nav className="hidden items-center gap-6 lg:flex">
          <button onClick={() => onRouteChange('home')} className={`text-sm font-semibold transition ${active === 'home' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900'}`}>
            Browse
          </button>
          <button onClick={() => onRouteChange('subscribe')} className={`text-sm font-semibold transition ${active === 'subscribe' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900'}`}>
            YouMake+
          </button>
          <button onClick={() => onRouteChange('creator')} className={`text-sm font-semibold transition ${active === 'creator' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900'}`}>
            Creator
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {viewer ? (
            <button onClick={() => onRouteChange('account')} className="hidden items-center gap-3 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-cyan/10 sm:inline-flex">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-purple shadow-sm">{viewer.username.charAt(0).toUpperCase()}</span>
              <span>{viewer.premium ? 'YouMake+ member' : 'Viewer acct'}</span>
            </button>
          ) : null}
          {viewer ? (
            <button onClick={onSignOut} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Logout
            </button>
          ) : (
            <button onClick={() => onRouteChange('login')} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
