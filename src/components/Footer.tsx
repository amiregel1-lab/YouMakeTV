import { useNavigate } from 'react-router-dom';
import { logEvent } from '../lib/eventService';

export default function Footer() {
  const navigate = useNavigate();

  const link = (label: string, to: string) => (
    <li key={label}>
      <button
        onClick={() => navigate(to)}
        className="text-sm text-slate-500 hover:text-slate-950 transition-colors text-left"
      >
        {label}
      </button>
    </li>
  );

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8 py-14">

        {/* 5-column grid */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">

          {/* Col 1: Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <p className="text-base font-bold text-slate-950 tracking-tight mb-2">YouMakeTV</p>
            <p className="text-sm text-slate-500 leading-6 max-w-[200px]">
              The home for AI-generated movies and creators.
            </p>
          </div>

          {/* Col 2: Browse */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-4">Browse</h4>
            <ul className="space-y-3">
              {link('Movies', '/')}
              {link('Creators', '/creators')}
              {link('YouMake+', '/subscribe')}
            </ul>
          </div>

          {/* Col 3: Creators */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-4">Creators</h4>
            <ul className="space-y-3">
              {link('Become a Creator', '/creator')}
              {link('Creator Sign In', '/creatorsLogin')}
              {link('Creator Agreement', '/creator-agreement')}
            </ul>
          </div>

          {/* Col 4: Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-4">Company</h4>
            <ul className="space-y-3">
              {link('About Us', '/about')}
              {link('Contact Us', '/contact')}
              {link('FAQ', '/creator')}
            </ul>
          </div>

          {/* Col 5: Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-4">Legal</h4>
            <ul className="space-y-3">
              {link('Terms of Service', '/terms')}
              {link('Privacy Policy', '/privacy')}
              {link('Copyright & DMCA Policy', '/copyright')}
              {link('Creator Agreement', '/terms#creator-agreement')}
            </ul>
          </div>
        </div>

        <aside className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6" aria-label="Add YouMakeTV as a preferred Google source">
          <div>
            <p className="text-sm font-bold text-slate-950">Follow YouMakeTV in Google</p>
            <p className="mt-1 text-sm text-slate-500">See more AI filmmaking, creator and platform updates from YouMakeTV.</p>
          </div>
          <a
            href="https://www.google.com/preferences/source?q=www.youmaketv.ai"
            className="mt-4 inline-flex min-h-11 flex-none items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:mt-0"
            rel="noopener noreferrer"
            onClick={() => logEvent('preferred_source_click', { title: 'site_footer' })}
            data-event="preferred_source_click"
            data-placement="site_footer"
          >
            Add as a preferred source
          </a>
        </aside>

        {/* Bottom row */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">© 2026 YouMakeTV.ai. All rights reserved.</p>
            <p className="text-xs text-slate-400">
              Creators retain ownership of their content. Distribution subject to platform terms.
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-none" />
            <span className="text-xs text-slate-400">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
