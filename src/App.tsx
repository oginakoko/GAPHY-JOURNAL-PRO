import { useState, useEffect, Suspense, lazy, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useLocalStorage from './hooks/useLocalStorage';
import { AppState } from './types';
import Auth from './components/Auth';
import Layout from './components/Layout';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import TradeArchives from './pages/TradeArchives';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';

// Lazy loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Statistics = lazy(() => import('./pages/Statistics'));
const Journal = lazy(() => import('./pages/Journal'));
const News = lazy(() => import('./pages/News'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const LifeJournal = lazy(() => import('./pages/LifeJournal'));

const DEFAULT_APP_STATE: AppState = {
  lastVisitedPage: '/',
  settings: {
    theme: 'dark',
    currency: 'USD',
    timezone: 'UTC',
    notifications: true
  }
};

function LoadingFallback() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <div className="animate-pulse space-y-4 w-full max-w-2xl">
        <div className="h-8 bg-[#252525] rounded w-1/3 animate-shimmer"></div>
        <div className="h-32 bg-[#252525] rounded animate-shimmer"></div>
        <div className="h-24 bg-[#252525] rounded animate-shimmer"></div>
      </div>
    </motion.div>
  );
}

interface PageTransitionProps {
  children: ReactNode;
}

function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [appState, setAppState] = useLocalStorage<AppState>('appState', DEFAULT_APP_STATE);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (appState.lastVisitedPage !== location.pathname) {
      setAppState((prev: AppState) => ({
        ...prev,
        lastVisitedPage: location.pathname
      }));
    }
  }, [location.pathname, appState.lastVisitedPage, setAppState]);

  useEffect(() => {
    if (location.pathname === '/' && appState.lastVisitedPage !== '/') {
      navigate(appState.lastVisitedPage);
    }
  }, [location.pathname, appState.lastVisitedPage, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Auth onAuthenticated={(session) => setSession(session)} />;
  }

  return (
    <Layout onLogout={handleLogout}>
      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route index element={
              <ErrorBoundary 
                fallback={({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) => (
                  <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load dashboard" />
                )}
              >
                <PageTransition><Dashboard /></PageTransition>
              </ErrorBoundary>
            } />
            <Route path="dashboard" element={
              <ErrorBoundary 
                fallback={({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) => (
                  <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load dashboard" />
                )}
              >
                <PageTransition><Dashboard /></PageTransition>
              </ErrorBoundary>
            } />
            <Route path="journal" element={
              <ErrorBoundary 
                fallback={({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) => (
                  <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load journal" />
                )}
              >
                <PageTransition><Journal /></PageTransition>
              </ErrorBoundary>
            } />
            <Route path="journal/new" element={
              <ErrorBoundary 
                fallback={({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) => (
                  <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load new trade form" />
                )}
              >
                <PageTransition><Journal isNewTrade={true} /></PageTransition>
              </ErrorBoundary>
            } />
            <Route path="statistics" element={
              <ErrorBoundary 
                fallback={({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) => (
                  <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load statistics" />
                )}
              >
                <PageTransition><Statistics /></PageTransition>
              </ErrorBoundary>
            } />
            <Route path="life-journal" element={
              <ErrorBoundary 
                fallback={({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) => (
                  <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load life journal" />
                )}
              >
                <PageTransition><LifeJournal /></PageTransition>
              </ErrorBoundary>
            } />
            <Route path="settings" element={
              <ErrorBoundary 
                fallback={({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) => (
                  <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load settings" />
                )}
              >
                <PageTransition><SettingsPage /></PageTransition>
              </ErrorBoundary>
            } />
            <Route path="trades" element={
              <ErrorBoundary 
                fallback={({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) => (
                  <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load trade archives" />
                )}
              >
                <PageTransition><TradeArchives /></PageTransition>
              </ErrorBoundary>
            } />
            <Route path="news" element={
              <ErrorBoundary 
                fallback={({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) => (
                  <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load news" />
                )}
              >
                <PageTransition><News /></PageTransition>
              </ErrorBoundary>
            } />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;