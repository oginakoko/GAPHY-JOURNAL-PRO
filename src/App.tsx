import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Settings, Plus } from 'lucide-react';
import Statistics from './pages/Statistics';
import Journal from './pages/Journal';
import { default as SettingsPage } from './pages/Settings';
import useLocalStorage from './hooks/useLocalStorage';
import { AppState } from './types';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

function Header({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
        <div className="text-2xl font-bold">G</div>
        <div>
          <div className="text-sm font-semibold">GAPHY JOURNAL PRO</div>
        </div>
      </div>
      <nav className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
        <button onClick={() => navigate('/statistics')} className="hover:text-gray-300">
          Statistics
        </button>
        <button onClick={() => navigate('/journal')} className="hover:text-gray-300">
          Journal
        </button>
        <button onClick={() => navigate('/settings')} className="hover:text-gray-300">
          <Settings className="w-5 h-5" />
        </button>
        <button onClick={() => navigate('/journal/new')} className="bg-white text-black p-2 rounded-lg ml-auto sm:ml-0">
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white p-2 rounded-lg ml-auto sm:ml-0"
        >
          Logout
        </button>
      </nav>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [appState, setAppState] = useLocalStorage<AppState>('appState', {
    lastVisitedPage: '/',
    settings: {
      theme: 'dark',
      currency: 'USD',
      timezone: 'UTC',
      notifications: true
    }
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (appState.lastVisitedPage !== location.pathname) {
      setAppState((prev: AppState) => {
        if (prev.lastVisitedPage === location.pathname) {
          return prev;
        }
        return {
          ...prev,
          lastVisitedPage: location.pathname
        };
      });
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
    <div className="min-h-screen bg-[#141414] text-white p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <Header onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Journal />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/new" element={<Journal isNewTrade={true} />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
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