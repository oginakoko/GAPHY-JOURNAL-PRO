import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import TradeJournal from './pages/TradeJournal';
import LifeJournal from './pages/LifeJournal';
import Statistics from './pages/Statistics';
import './index.css';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse space-y-4 w-full max-w-2xl">
        <div className="h-8 bg-[#1A1A1A] rounded w-1/3 relative overflow-hidden">
          <div className="absolute inset-0 bg-shimmer-gradient bg-[length:200%_100%] animate-shimmer" />
        </div>
        <div className="h-32 bg-[#1A1A1A] rounded relative overflow-hidden">
          <div className="absolute inset-0 bg-shimmer-gradient bg-[length:200%_100%] animate-shimmer" />
        </div>
        <div className="h-24 bg-[#1A1A1A] rounded relative overflow-hidden">
          <div className="absolute inset-0 bg-shimmer-gradient bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
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

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-[#0D0D2B] text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            <Suspense fallback={<LoadingFallback />}>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
                  <Route path="/trade-journal" element={<PageTransition><TradeJournal /></PageTransition>} />
                  <Route path="/life-journal" element={<PageTransition><LifeJournal /></PageTransition>} />
                  <Route path="/statistics" element={<PageTransition><Statistics /></PageTransition>} />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;