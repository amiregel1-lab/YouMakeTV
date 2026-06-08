import { useEffect, useMemo, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
import CreatorLoginPage from './components/CreatorLoginPage';
import Footer from './components/Footer';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import CopyrightPage from './components/CopyrightPage';
import CreatorAgreementPage from './components/CreatorAgreementPage';
import ScrollToTop from './components/ScrollToTop';
import SuperAdminLogin from './components/SuperAdminLogin';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import MockPaymentModal from './components/MockPaymentModal';
import NotFoundPage from './components/NotFoundPage';
import { initAnalytics, trackPageView } from './lib/analytics';

export default function App() {
  const [viewer, setViewer] = useState<ViewerAccount | null>(null);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [newCreatorSession, setNewCreatorSession] = useState(false);
  const [modal, setModal] = useState<{ type: 'transaction' | 'subscription' | 'trailer'; title: string; details: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setViewer(loadViewer());
    setCreator(loadCreator());
    initAnalytics();
  }, []);

  // CTRL+SHIFT+A → Super Admin login (hidden keyboard shortcut for demos)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigate('/superadmin');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    saveViewer(viewer);
  }, [viewer]);

  useEffect(() => {
    saveCreator(creator);
  }, [creator]);

  const activeRoute = useMemo(() => {
    if (location.pathname.startsWith('/creatorsLogin')) return 'creatorsLogin';
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
    setNewCreatorSession(true);
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

  // Super admin routes render standalone — no Navbar/Footer
  if (location.pathname.startsWith('/superadmin')) {
    return (
      <Routes>
        <Route path="/superadmin" element={<SuperAdminLogin />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/*" element={<SuperAdminLogin />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-950">
      <ScrollToTop />
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
            creatorsLogin: '/creatorsLogin',
          };
          navigate(routeMap[route]);
        }}
        onSignOut={handleSignOut}
      />

      <main id="main-content" className="mx-auto max-w-[1560px] px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-16">
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
          <Route path="/creator" element={<CreatorPortal onStart={() => navigate('/creator/onboarding')} onDashboard={() => navigate('/creator/dashboard')} onViewDemo={handleDemoCreator} onSignIn={() => navigate('/creatorsLogin')} />} />
          <Route path="/creatorsLogin" element={<CreatorLoginPage onSignIn={() => navigate('/creator/dashboard')} onStart={() => navigate('/creator/onboarding')} onViewDemo={handleDemoCreator} />} />
          <Route path="/creator/onboarding" element={<CreatorOnboarding onComplete={handleCreateCreator} />} />
          <Route path="/creator/dashboard" element={<CreatorDashboard creator={creator} onAddFilm={handleAddFilm} onDeleteFilm={handleDeleteFilm} onStartOnboarding={() => navigate('/creator/onboarding')} onCreateDemo={handleDemoCreator} showWelcome={newCreatorSession} onDismissWelcome={() => setNewCreatorSession(false)} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/copyright" element={<CopyrightPage />} />
          <Route path="/creator-agreement" element={<CreatorAgreementPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />

      {modal && <MockPaymentModal type={modal.type} title={modal.title} details={modal.details} onClose={() => setModal(null)} />}
    </div>
  );
}
