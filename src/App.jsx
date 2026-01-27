import React, { useState, useEffect } from 'react';
// Views - Named Imports
import { Dashboard } from './components/views/Dashboard';
import { PracticeView } from './components/views/PracticeView';
import { DoNowConfig } from './components/views/DoNowConfig';
import { DoNowGrid } from './components/views/DoNowGrid';
// Modals - Named Imports (Fixing the build error here)
import { StatsModal } from './components/modals/StatsModal';
import { AboutModal } from './components/modals/AboutModal';
// Utils
import { UI_STRINGS } from './core/utils/i18n'; 

// Counters Component for the Header
const StatsCounter = ({ icon, value, colorClass, title, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${colorClass} transition-all duration-200 cursor-pointer hover:bg-opacity-80 active:scale-95`}
    title={title}
  >
    <span className="text-lg select-none">{icon}</span>
    <span className={`font-bold text-sm sm:text-base ${colorClass.split(' ')[1]}`.replace('border-', 'text-')}>
      {value}
    </span>
  </div>
);

const App = () => {
  // --- Global State ---
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [doNowConfig, setDoNowConfig] = useState(null);
  const [lang, setLang] = useState('sv'); // Default language
  
  // Modal State
  const [showStats, setShowStats] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  // Persisted User Stats
  const [stats, setStats] = useState({
    totalCorrect: 0,
    streak: 0,
    history: []
  });

  // Load stats on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('anpassa_stats');
      if (saved) {
        setStats(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load stats", e);
    }
  }, []);

  // Save stats on change
  useEffect(() => {
    localStorage.setItem('anpassa_stats', JSON.stringify(stats));
  }, [stats]);

  // --- Handlers ---
  const handleStartPractice = (topic) => {
    setSelectedTopic(topic);
    setCurrentView('practice');
    window.scrollTo(0, 0);
  };

  const handleStartDoNow = (config) => {
    setDoNowConfig(config);
    setCurrentView('donow_grid');
    window.scrollTo(0, 0);
  };

  const handleCorrectAnswer = (topicId) => {
    setStats(prev => ({
      ...prev,
      totalCorrect: prev.totalCorrect + 1,
      streak: prev.streak + 1,
      history: [...prev.history, { date: new Date().toISOString(), result: 'correct', topic: topicId }]
    }));
  };

  const handleIncorrectAnswer = () => {
    setStats(prev => ({
      ...prev,
      streak: 0
    }));
  };

  const handleHome = () => {
    setCurrentView('dashboard');
    setSelectedTopic(null);
  };

  const UI = UI_STRINGS[lang];

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm px-4 py-3">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          
          {/* Logo / Home */}
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={handleHome}
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:bg-indigo-700 transition-colors">
              A
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block group-hover:text-indigo-700 transition-colors">
              Anpassa
            </h1>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <StatsCounter 
              icon="🔥" 
              value={stats.streak} 
              colorClass="bg-orange-50 border-orange-100 text-orange-600"
              title={UI.streak}
              onClick={() => setShowStats(true)}
            />
            
            <StatsCounter 
              icon="✅" 
              value={stats.totalCorrect} 
              colorClass="bg-emerald-50 border-emerald-100 text-emerald-600"
              title={UI.score}
              onClick={() => setShowStats(true)}
            />

            {/* Language Toggle */}
             <button 
              onClick={() => setLang(l => l === 'sv' ? 'en' : 'sv')}
              className="px-2 py-1 text-xs font-bold bg-slate-100 text-slate-500 rounded border border-slate-200 hover:bg-slate-200 transition-colors"
              title="Switch Language"
            >
              {lang.toUpperCase()}
            </button>

            {/* Menu / About */}
            <button 
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Menu"
              onClick={() => setShowAbout(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'dashboard' && (
          <Dashboard 
            onSelectPractice={handleStartPractice}
            onConfigDoNow={() => {
              setCurrentView('donow_config');
              window.scrollTo(0, 0);
            }}
            lang={lang}
          />
        )}

        {currentView === 'practice' && selectedTopic && (
          <PracticeView 
            topic={selectedTopic}
            onCorrect={handleCorrectAnswer}
            onIncorrect={handleIncorrectAnswer}
            onBack={handleHome}
            lang={lang}
          />
        )}

        {currentView === 'donow_config' && (
          <DoNowConfig 
            onStart={handleStartDoNow} 
            onBack={handleHome}
            lang={lang}
          />
        )}

        {currentView === 'donow_grid' && doNowConfig && (
          <DoNowGrid 
            config={doNowConfig}
            onComplete={handleHome}
            lang={lang}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Anpassa Learning.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <button onClick={() => setShowAbout(true)} className="hover:text-slate-600">Om Anpassa</button>
          </div>
        </div>
      </footer>

      {/* --- Modals --- */}
      {showStats && (
        <StatsModal 
          isOpen={showStats}
          onClose={() => setShowStats(false)} 
          stats={stats}
          lang={lang}
        />
      )}
      
      {showAbout && (
        <AboutModal 
          isOpen={showAbout}
          onClose={() => setShowAbout(false)}
          lang={lang}
        />
      )}

    </div>
  );
};

export default App;