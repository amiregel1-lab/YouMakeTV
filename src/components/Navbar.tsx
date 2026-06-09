import { ViewerAccount } from '../types';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  active: string;
  viewer?: ViewerAccount | null;
  onRouteChange: (route: 'home' | 'subscribe' | 'creator' | 'creators' | 'studios' | 'onboarding' | 'dashboard' | 'login' | 'account' | 'creatorsLogin') => void;
  onSignOut: () => void;
}

function MobileTab({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition ${
        active ? 'text-brand-purple' : 'text-slate-400'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function Navbar({ active, viewer, onRouteChange, onSignOut }: NavbarProps) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1560px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          {/* Logo */}
          <button className="flex items-center gap-3 text-left" onClick={() => onRouteChange('home')} aria-label="YouMakeTV.ai — go to homepage">
            <BrandLogo />
          </button>

          {/* Desktop nav — Movies | YouMake+ | Studios | Creators */}
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
              onClick={() => onRouteChange('studios')}
              className={`text-sm font-semibold transition ${active === 'studios' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Studios
            </button>
            <button
              onClick={() => onRouteChange('creators')}
              className={`text-sm font-semibold transition ${active === 'creators' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Creators
            </button>
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-2">
            {viewer?.premium && (
              <span className="hidden items-center gap-2 rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-purple sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-purple" />
                YouMake+
              </span>
            )}

            {viewer ? (
              <>
                <button
                  onClick={() => onRouteChange('account')}
                  className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 lg:inline-flex"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-white text-xs font-bold">
                    {viewer.username.charAt(0).toUpperCase()}
                  </span>
                  {viewer.username}
                </button>
                <button
                  onClick={onSignOut}
                  className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 lg:inline-flex"
                >
                  Sign out
                </button>
                <button
                  onClick={() => onRouteChange('account')}
                  aria-label="Go to account"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white text-sm font-bold lg:hidden"
                >
                  {viewer.username.charAt(0).toUpperCase()}
                </button>
              </>
            ) : active === 'creators' ? (
              /* Creator-focused CTAs on the Creators (acquisition) page */
              <>
                <button
                  onClick={() => onRouteChange('onboarding')}
                  className="rounded-full bg-brand-purple px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-indigo"
                >
                  Become a Creator
                </button>
                <button
                  onClick={() => onRouteChange('creatorsLogin')}
                  className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 lg:inline-flex"
                >
                  Creator Login
                </button>
              </>
            ) : (
              /* Standard viewer CTAs everywhere else */
              <>
                <button
                  onClick={() => onRouteChange('subscribe')}
                  className="rounded-full bg-brand-purple px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-indigo"
                >
                  Sign up
                </button>
                <button
                  onClick={() => onRouteChange('login')}
                  className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 lg:inline-flex"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar — Movies | YouMake+ | Studios | Creators | Account */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-xl lg:hidden">
        <div className="flex items-stretch">
          <MobileTab
            label="Movies"
            active={active === 'home'}
            onClick={() => onRouteChange('home')}
            icon={
              <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            }
          />
          <MobileTab
            label="YouMake+"
            active={active === 'subscribe'}
            onClick={() => onRouteChange('subscribe')}
            icon={
              <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
          />
          <MobileTab
            label="Studios"
            active={active === 'studios'}
            onClick={() => onRouteChange('studios')}
            icon={
              <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            }
          />
          <MobileTab
            label="Creators"
            active={active === 'creators'}
            onClick={() => onRouteChange('creators')}
            icon={
              <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            }
          />
          <MobileTab
            label={viewer ? 'Account' : 'Sign in'}
            active={active === 'account' || active === 'login'}
            onClick={() => onRouteChange(viewer ? 'account' : 'login')}
            icon={
              <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        </div>
      </nav>
    </>
  );
}
