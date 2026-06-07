import { useNavigate } from 'react-router-dom';
import SEOHead from './SEOHead';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <>
      <SEOHead
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
        noIndex
      />
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-brand-purple">404</p>
        <h1 className="mb-3 text-5xl font-black text-slate-950">Page not found</h1>
        <p className="mb-8 max-w-sm text-base text-slate-500">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-indigo"
          >
            Browse Movies
          </button>
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Go Back
          </button>
        </div>
      </div>
    </>
  );
}
