import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { movies } from './data/movies';
import { demoCreatorProfile, demoViewerAccount } from './data/mockData';
import { CreatorFilm, CreatorProfile, ViewerAccount } from './types';
import { loadCreator, loadViewer, saveCreator, saveViewer } from './lib/storage';
import Navbar from './components/Navbar';
import ViewerHome from './components/ViewerHome';
import MovieDetailPage from './components/MovieDetailPage';
import SubscriptionPage from './components/SubscriptionPage';
import LoginPage from './components/LoginPage';
import AccountPage from './components/AccountPage';
import CreatorPortal from './components/CreatorPortal';
import CreatorOnboarding from './components/CreatorOnboarding';
import CreatorDashboard from './components/CreatorDashboard';
import CreatorsPage from './components/CreatorsPage';
import MockPaymentModal from './components/MockPaymentModal';

export default function App() {
  const [viewer, setViewer] = useState<ViewerAccount | null>(null);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [modal, setModal] = useState<{ type: 'transaction' | 'subscription' | 'trailer'; title: string; details: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setViewer(loadViewer());
    setCreator(loadCreator());
  }, []);

  useEffect(() => {
    saveViewer(viewer);
  }, [viewer]);

  useEffect(() => {
    saveCreator(creator);
  }, [creator]);

  const activeRoute = useMemo(() => {
    if (location.pathname.startsWith('/creators')) return 'creators';
    if (location.pathname.startsWith('/creator/dashboard')) return 'dashboard';
    if (location.pathname.startsWith('/creator/onboarding')) return 'onboarding';
    if (location.pathname.startsWith('/creator')) return 'creator';
    if (location.pathname.startsWith('/subscribe')) return 'subscribe';
    if (location.pathname.startsWith('/login')) return 'login';
    if (location.pathname.startsWith('/account')) return 'account';
    return 'home';
  }, [location.pathname]);

  const handleSignIn = (username: string, password: string) => {
    const premium = username.toLowerCase() === 'youmaketv' && password === '1234';
    setViewer({ username, premium });
  };

  const handleSignOut = () => {
    setViewer(null);
  };

  const handleSubscribe = () => {
    setViewer((current) => (current ? { ...current, premium: true } : demoViewerAccount));
    setModal({
      type: 'subscription',
      title: 'YouMake+ mock subscription activated',
      details: 'You are now a mock premium member in this prototype. Real subscription billing will be added later.',
    });
  };

  const handleCreateCreator = (profile: CreatorProfile) => {
    setCreator(profile);
    navigate('/creator/dashboard');
  };

  const handleDemoCreator = () => {
    setCreator(demoCreatorProfile);
    navigate('/creator/dashboard');
  };

  const handleAddFilm = (film: CreatorFilm) => {
    setCreator((current) => (current ? { ...current, films: [...current.films, film] } : current));
  };

  const handleDeleteFilm = (filmId: string) => {
    setCreator((current) => (current ? { ...current, films: current.films.filter((film) => film.id !== filmId) } : current));
  };

  const openTrailerModal = () => {
    setModal({
      type: 'trailer',
      title: 'Trailer experience coming soon',
      details: 'Trailer playback is a placeholder in this prototype. Real video streaming will be integrated later.',
    });
  };

  const openPurchaseModal = () => {
    setModal({
      type: 'transaction',
      title: 'Payment integration coming later',
      details: 'This prototype shows where payment processing will appear. No real transactions are processed.',
    });
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-950">
      <Navbar
        active={activeRoute}
        viewer={viewer}
        onRouteChange={(route) => {
          const routeMap: Record<string, string> = {
            home: '/',
            subscribe: '/subscribe',
            creator: '/creator',
            creators: '/creators',
            onboarding: '/creator/onboarding',
            dashboard: '/creator/dashboard',
            login: '/login',
            account: '/account',
          };
          navigate(routeMap[route]);
        }}
        onSignOut={handleSignOut}
      />

      <main className="mx-auto max-w-[1560px] px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-16">
        <Routes>
          <Route
            path="/"
            element={<ViewerHome movies={movies} viewer={viewer} onSelectMovie={(movieId) => navigate(`/movie/${movieId}`)} onWatchTrailer={openTrailerModal} />}
          />
          <Route
            path="/movie/:id"
            element={<MovieDetailPage viewer={viewer} onPurchase={openPurchaseModal} onSubscribe={() => navigate('/subscribe')} onWatchTrailer={openTrailerModal} />}
          />
          <Route path="/subscribe" element={<SubscriptionPage viewer={viewer} onSubscribe={handleSubscribe} />} />
          <Route path="/login" element={<LoginPage viewer={viewer} onSignIn={handleSignIn} />} />
          <Route path="/account" element={<AccountPage viewer={viewer} onSignOut={handleSignOut} />} />
          <Route path="/creators" element={<CreatorsPage />} />
          <Route path="/creator" element={<CreatorPortal onStart={() => navigate('/creator/onboarding')} onDashboard={() => navigate('/creator/dashboard')} />} />
          <Route path="/creator/onboarding" element={<CreatorOnboarding onComplete={handleCreateCreator} />} />
          <Route path="/creator/dashboard" element={<CreatorDashboard creator={creator} onAddFilm={handleAddFilm} onDeleteFilm={handleDeleteFilm} onStartOnboarding={() => navigate('/creator/onboarding')} onCreateDemo={handleDemoCreator} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {modal && <MockPaymentModal type={modal.type} title={modal.title} details={modal.details} onClose={() => setModal(null)} />}
    </div>
  );
}
