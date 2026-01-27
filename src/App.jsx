import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/views/Dashboard';
import { PracticeView } from './components/views/PracticeView';
import { DoNowConfig } from './components/views/DoNowConfig';
import { DoNowGrid } from './components/views/DoNowGrid';
import { AboutModal } from './components/modals/AboutModal';
import { LgrModal } from './components/modals/LgrModal';
import { StatsModal } from './components/modals/StatsModal';
import { UI_TEXT } from './constants/localization';

function App() {
  // --- Global State ---
  const [view, setView] = useState('dashboard'); // 'dashboard', 'practice', 'donow_config', 'donow_grid'
  const [lang, setLang] = useState('sv');
  
  // Practice State
  const [activeGenerator, setActiveGenerator] = useState(null);
  const [activeLevel, setActiveLevel] = useState(1);
  
  // Do Now State
  const [doNowQuestions, setDoNowQuestions] = useState([]);
  
  // Stats (Session)
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [sessionStats, setSessionStats] = useState({
      attempted: 0,
      correctNoHelp: 0,
      correctHelp: 0,
      incorrect: 0,
      skipped: 0,
      maxStreak: 0
  });

  // Modals
  const [aboutOpen, setAboutOpen] = useState(false);
  const [lgrOpen, setLgrOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  
  // Timer State
  const [timerSettings, setTimerSettings] = useState({ duration: 0, remaining: 0, isActive: false });

  // --- Stats Logic ---
  const updateStats = (type) => {
      setSessionStats(prev => ({
          ...prev,
          attempted: type !== 'skipped' ? prev.attempted + 1 : prev.attempted, // Usually skipped counts as attempt, but legacy didn't increment 'attempted' for skips in same way. Let's increment for consistency.
          [type]: prev[type] + 1
      }));
      // Note: attempted is incremented for all types in this logic:
      if (type === 'skipped') {
           setSessionStats(prev => ({ ...prev, attempted: prev.attempted + 1 }));
      }
  };

  useEffect(() => {
      if (streak > sessionStats.maxStreak) {
          setSessionStats(prev => ({ ...prev, maxStreak: streak }));
      }
  }, [streak]);

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
    setStreak(0); 
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

  // --- Do Now Logic ---
  const handleDoNowGenerate = async (selectedConfig) => {
    if (selectedConfig.length === 0) return;
    const fullConfig = [];
    for (let i = 0; i < 6; i++) {
        fullConfig.push(selectedConfig[i % selectedConfig.length]);
    }

    try {
        const res = await fetch('/api/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ config: fullConfig, lang })
        });
        const data = await res.json();
        
        if (data.questions) {
            setDoNowQuestions(data.questions);
            setView('donow_grid');
        }
    } catch (err) {
        console.error("Do Now Generation Failed", err);
    }
  };

  const toggleLang = () => setLang(prev => prev === 'sv' ? 'en' : 'sv');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- GLOBAL STICKY HEADER --- */}
      {view !== 'donow_grid' && (
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-primary-700 tracking-tight cursor-pointer" onClick={handleBackToDashboard}>
                        Anpassa
                    </h1>
                    
                    {view === 'dashboard' && timerSettings.remaining > 0 && (
                        <div className="hidden sm:flex bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold items-center gap-2 border border-orange-200">
                            <span>⏸ Paused</span>
                            <span className="font-mono text-sm">
                                {Math.floor(timerSettings.remaining / 60)}:{(timerSettings.remaining % 60).toString().padStart(2, '0')}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {totalCorrect > 0 && (
                        <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-primary-200">
                            ✅ {totalCorrect}
                        </div>
                    )}
                    {streak > 0 && (
                        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-yellow-200">
                            🔥 {streak}
                        </div>
                    )}
                    
                    {/* Stats Button */}
                    <button 
                        onClick={() => setStatsOpen(true)} 
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors" 
                        title="Statistics"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </button>

                    <button onClick={() => setAboutOpen(true)} className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-1 px-4 text-xs rounded-full shadow-sm transition-transform transform active:scale-95">
                       {lang === 'sv' ? 'Om' : 'About'}
                    </button>
                </div>
            </div>
          </header>
      )}

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
            onDoNowOpen={() => setView('donow_config')}
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
            updateStats={updateStats}
          />
        )}

        {view === 'donow_config' && (
            <DoNowConfig 
                onBack={() => setView('dashboard')}
                onGenerate={handleDoNowGenerate}
                lang={lang}
            />
        )}

        {view === 'donow_grid' && (
            <DoNowGrid 
                questions={doNowQuestions}
                onBack={() => setView('donow_config')}
                lang={lang}
            />
        )}
      </main>

      {/* --- MODALS --- */}
      <StatsModal visible={statsOpen} stats={sessionStats} onClose={() => setStatsOpen(false)} lang={lang} />
      <AboutModal visible={aboutOpen} onClose={() => setAboutOpen(false)} lang={lang} />
      <LgrModal visible={lgrOpen} onClose={() => setLgrOpen(false)} />

    </div>
  );
}

export default App;