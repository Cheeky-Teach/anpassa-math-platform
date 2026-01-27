import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/views/Dashboard';
import { PracticeView } from './components/views/PracticeView';
import { AboutModal } from './components/modals/AboutModal';
import { LgrModal } from './components/modals/LgrModal';

function App() {
  // --- Global State ---
  const [view, setView] = useState('dashboard');
  const [lang, setLang] = useState('sv');
  
  // Practice State
  const [activeGenerator, setActiveGenerator] = useState(null);
  const [activeLevel, setActiveLevel] = useState(1);
  
  // Stats (Session)
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  // Modals
  const [aboutOpen, setAboutOpen] = useState(false);
  const [lgrOpen, setLgrOpen] = useState(false);
  
  // Timer State
  const [timerSettings, setTimerSettings] = useState({ duration: 0, remaining: 0, isActive: false });

  // --- Timer Logic ---
  useEffect(() => {
    let interval = null;
    if (timerSettings.isActive && timerSettings.remaining > 0 && view === 'practice') {
        interval = setInterval(() => {
            setTimerSettings(prev => {
                if (prev.remaining <= 1) return { ...prev, remaining: 0, isActive: false };
                return { ...prev, remaining: prev.remaining - 1 };
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerSettings.isActive, view, timerSettings.remaining]);

  const toggleTimer = (minutes) => {
    const seconds = minutes * 60;
    setTimerSettings({ duration: seconds, remaining: seconds, isActive: minutes > 0 });
  };

  const resetTimer = () => {
    setTimerSettings({ duration: 0, remaining: 0, isActive: false });
  };

  // --- Navigation Handlers ---
  const handleStartPractice = (generatorId, level) => {
    setActiveGenerator(generatorId);
    setActiveLevel(level);
    setView('practice');
    setStreak(0); // Reset streak on new session
    if (timerSettings.duration > 0) {
        setTimerSettings(prev => ({...prev, isActive: true}));
    }
    window.scrollTo(0, 0);
  };

  const handleBackToDashboard = () => {
    setActiveGenerator(null);
    setView('dashboard');
    setTimerSettings(prev => ({...prev, isActive: false}));
  };

  const toggleLang = () => setLang(prev => prev === 'sv' ? 'en' : 'sv');

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- GLOBAL STICKY HEADER --- */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo Area */}
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-primary-700 tracking-tight cursor-pointer" onClick={handleBackToDashboard}>
                    Anpassa
                </h1>
                
                {/* Timer Display (if active & on dashboard) */}
                {view === 'dashboard' && timerSettings.remaining > 0 && (
                    <div className="hidden sm:flex bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold items-center gap-2 border border-orange-200">
                        <span>⏸ Paused</span>
                        <span className="font-mono text-sm">
                            {Math.floor(timerSettings.remaining / 60)}:{(timerSettings.remaining % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
                <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-primary-200">
                    ✅ {totalCorrect}
                </div>
                <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-yellow-200">
                    🔥 {streak}
                </div>
                
                {/* About Button */}
                <button onClick={() => setAboutOpen(true)} className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-1 px-4 text-xs rounded-full shadow-sm transition-transform transform active:scale-95">
                   {lang === 'sv' ? 'Om' : 'About'}
                </button>
            </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1">
        {view === 'dashboard' && (
          <Dashboard 
            onStartPractice={handleStartPractice} 
            lang={lang}
            timerSettings={timerSettings}
            toggleTimer={toggleTimer}
            resetTimer={resetTimer}
            onLgrOpen={() => setLgrOpen(true)}
            toggleLang={toggleLang}
          />
        )}

        {view === 'practice' && activeGenerator && (
          <PracticeView 
            generatorId={activeGenerator} 
            initialLevel={activeLevel}
            onBack={handleBackToDashboard} 
            lang={lang}
            streak={streak}
            setStreak={setStreak}
            setTotalCorrect={setTotalCorrect}
          />
        )}
      </main>

      {/* --- MODALS --- */}
      <AboutModal visible={aboutOpen} onClose={() => setAboutOpen(false)} lang={lang} />
      <LgrModal visible={lgrOpen} onClose={() => setLgrOpen(false)} />

    </div>
  );
}

export default App;