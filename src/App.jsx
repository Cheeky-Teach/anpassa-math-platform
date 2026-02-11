import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

// Views
import Dashboard from './components/views/Dashboard';
import PracticeView from './components/views/PracticeView';
import DoNowConfig from './components/views/DoNowConfig'; 
import DoNowGrid from './components/views/DoNowGrid';
import AuthView from './components/views/AuthView';
import QuestionStudio from './components/views/QuestionStudio'; 

// Modals
import AboutModal from './components/modals/AboutModal';
import LgrModal from './components/modals/LgrModal';
import StatsModal from './components/modals/StatsModal';
import StreakModal from './components/modals/StreakModal'; 
import ContentModal from './components/modals/ContentModal'; 
import MobileDrawer from './components/practice/MobileDrawer';

// Data & Constants
import { UI_TEXT, LEVEL_DESCRIPTIONS } from './constants/localization';

const DEVELOPER_MODE = true; 

function App() {
    // --- 1. AUTH & PROFILE STATE ---
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // --- 2. UI NAVIGATION STATE ---
    const [view, setView] = useState('dashboard');
    const [lang, setLang] = useState('sv');
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState(0);

    // --- 3. GAMEPLAY STATE ---
    const [question, setQuestion] = useState(null);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [streak, setStreak] = useState(0);
    const [totalCorrect, setTotalCorrect] = useState(0);
    const [revealedClues, setRevealedClues] = useState([]);
    const [isSolutionRevealed, setIsSolutionRevealed] = useState(false);
    const [usedHelp, setUsedHelp] = useState(false);

    // --- 4. SESSION STATS & HISTORY ---
    const [sessionStats, setSessionStats] = useState({
        attempted: 0, correctNoHelp: 0, correctHelp: 0, incorrect: 0, skipped: 0, maxStreak: 0
    });
    const [granularStats, setGranularStats] = useState({});
    const [history, setHistory] = useState([]);
    const [levelUpAvailable, setLevelUpAvailable] = useState(false);
    
    // --- 5. MODALS & UI STATE ---
    const [aboutOpen, setAboutOpen] = useState(false);
    const [statsOpen, setStatsOpen] = useState(false);
    const [timeUpOpen, setTimeUpOpen] = useState(false);
    const [lgrOpen, setLgrOpen] = useState(false);
    const [contentOpen, setContentOpen] = useState(false); 
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

    // --- 6. ASSIGNMENTS & STUDIO STATE ---
    const [assignments, setAssignments] = useState([]); 
    const [doNowQuestions, setDoNowQuestions] = useState([]);
    const [doNowConfig, setDoNowConfig] = useState([]); 
    const [savedPacket, setSavedPacket] = useState([]); 

    // --- 7. TIMER STATE ---
    const [timerSettings, setTimerSettings] = useState({ duration: 0, remaining: 0, isActive: false });

    const ui = UI_TEXT[lang];

    // --- 8. SMART NAVIGATION ---
    useEffect(() => {
        window.history.replaceState({ view: 'dashboard' }, '');
        const handlePopState = (event) => {
            const nextView = event.state?.view || 'dashboard';
            setView(nextView);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (destination) => {
        if (destination !== view) {
            window.history.pushState({ view: destination }, '');
            setView(destination);
        }
    };

    // --- HELPER: GET OR CREATE PROFILE ---
    const getOrCreateProfile = async (user) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data && !error) return data;
            if (error && error.code === 'PGRST116') {
                const { data: newProfile } = await supabase.from('profiles').insert([{ id: user.id, full_name: 'User', role: 'student' }]).select().single();
                return newProfile;
            }
            return null;
        } catch (e) { return null; }
    };

    useEffect(() => {
        let mounted = true;
        
        // Initial session check
        supabase.auth.getSession().then(({ data: { session: initSession } }) => {
            if (mounted) {
                if (initSession) {
                    setSession(initSession);
                    getOrCreateProfile(initSession.user).then(p => {
                        if (mounted) { setProfile(p); setLoadingProfile(false); }
                    });
                } else {
                    setLoadingProfile(false);
                }
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!mounted) return;
            setSession(currentSession);
            if (currentSession) {
                const userProfile = await getOrCreateProfile(currentSession.user);
                if (mounted) { 
                    setProfile(userProfile); 
                    setLoadingProfile(false);
                    if (view === 'auth') setView('dashboard'); // Auto-return to dashboard on login
                }
            } else {
                setProfile(null);
                setLoadingProfile(false);
            }
        });

        return () => { mounted = false; subscription.unsubscribe(); };
    }, []);

    const handleLogout = async () => { 
        await supabase.auth.signOut(); 
        setSession(null);
        setProfile(null);
        navigate('dashboard');
    };

    // --- GAMEPLAY HANDLERS ---
    const fetchQuestion = async (t, l, lg, force) => {
        if (!force && (showStreakModal || levelUpAvailable || timeUpOpen)) return;
        setLoading(true); setFeedback(null); setInput(''); setRevealedClues([]); setUsedHelp(false); setIsSolutionRevealed(false); setLevelUpAvailable(false);
        try {
            const res = await fetch(`/api/question?topic=${t}&level=${l}&lang=${lg}${force ? `&force=true&t=${Date.now()}` : ''}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setQuestion(data);
        } catch (e) { console.error(e); setQuestion(null); } finally { setLoading(false); }
    };

    const startPractice = () => {
        if (topic && level) { 
            setStreak(0); 
            navigate('practice');
            if (timerSettings.duration > 0) setTimerSettings(prev => ({ ...prev, isActive: true })); 
            fetchQuestion(topic, level, lang); 
        }
    };

    const quitPractice = () => { 
        setStreak(0); 
        navigate('dashboard');
        setQuestion(null); 
    };

    const handleHint = () => {
        if (question?.clues && revealedClues.length < question.clues.length) {
            setUsedHelp(true);
            const nextClue = question.clues[revealedClues.length];
            setRevealedClues(prev => [...prev, nextClue]);
        }
    };

    const handleSolution = () => {
        if (question?.clues) {
            setUsedHelp(true);
            setRevealedClues(question.clues);
            setIsSolutionRevealed(true);
            setStreak(0);
        }
    };

    const handleSkip = () => {
        setStreak(0);
        fetchQuestion(topic, level, lang, true);
    };

    const handleChangeLevel = (delta) => {
        const newLevel = level + delta;
        if (newLevel >= 1 && LEVEL_DESCRIPTIONS[topic]?.[newLevel]) {
            setLevel(newLevel);
            fetchQuestion(topic, newLevel, lang, true);
        }
    };

    const handleSubmit = async (e, directInput) => {
        if (e) e.preventDefault();
        if (feedback === 'correct') return;
        let finalInput = directInput !== undefined ? directInput : input;
        if (!question || !finalInput) return;
        const helpUsed = revealedClues.length > 0 || isSolutionRevealed;

        try {
            const res = await fetch('/api/answer', { 
                method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ answer: finalInput, token: question.token, streak, level, topic, usedHelp: helpUsed, solutionUsed: isSolutionRevealed, attempts: (question.attempts || 0) }) 
            });
            const result = await res.json();
            
            if (result.correct) {
                setHistory(prev => [{ topic, level, correct: true, text: question.renderData.latex || question.renderData.description, clueUsed: helpUsed, time: Date.now() }, ...prev]);
                setStreak(result.newStreak);
                setTotalCorrect(prev => prev + 1);
                if ([15, 20, 30, 40, 50].includes(result.newStreak)) setShowStreakModal(true);
                else if (result.levelUp) setLevelUpAvailable(true);
                else setTimeout(() => fetchQuestion(topic, level, lang), 1500);
                setFeedback('correct');
            } else {
                const currentAttempts = (question.attempts || 0) + 1;
                setQuestion({...question, attempts: currentAttempts});
                if (currentAttempts >= 2) { 
                    setHistory(prev => [{ topic, level, correct: false, text: question.renderData.latex || question.renderData.description, clueUsed: true, time: Date.now() }, ...prev]);
                    setUsedHelp(true); setRevealedClues(question.clues || []); setIsSolutionRevealed(true); setStreak(0);
                } else if (question.clues) {
                    setUsedHelp(true); setRevealedClues(prev => [...prev, question.clues[prev.length] || question.clues[0]]);
                }
                setFeedback('incorrect'); setStreak(0);
            }
        } catch (e) { console.error(e); }
    };

    const handleDoNowGenerate = async (selectedConfig, rawPacket) => {
        if (!selectedConfig || selectedConfig.length === 0) return;
        setDoNowConfig(selectedConfig);
        if (rawPacket) setSavedPacket(rawPacket); 
        setLoading(true);
        const requestsPayload = selectedConfig.map(s => ({ topic: s.topic, level: s.level, variation: s.variation, lang }));
        try {
            const res = await fetch('/api/batch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requests: requestsPayload }) });
            const data = await res.json();
            if (Array.isArray(data)) { setDoNowQuestions(data); navigate('donow_grid'); }
        } catch (e) { console.error("Do Now Error:", e); } 
        finally { setLoading(false); }
    };

    // --- TIMER HELPERS ---
    const toggleTimer = (minutes) => setTimerSettings({ duration: minutes * 60, remaining: minutes * 60, isActive: minutes > 0 });
    const resetTimer = () => setTimerSettings({ duration: 0, remaining: 0, isActive: false });
    const formatTimerTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // --- RENDER LOGIC ---
    if (loadingProfile) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="animate-pulse text-indigo-600 font-black uppercase tracking-tighter text-2xl">Laddar...</div>
        </div>
    );

    // View Routing
    if (view === 'auth') {
        return <AuthView ui={ui} lang={lang} onGuestMode={() => navigate('dashboard')} />;
    }

    if (view === 'donow_config') {
        return <div className="min-h-screen bg-gray-50"><DoNowConfig ui={ui} lang={lang} onBack={() => navigate('dashboard')} onGenerate={handleDoNowGenerate} /></div>;
    }
    if (view === 'donow_grid') {
        return <DoNowGrid questions={doNowQuestions} ui={ui} lang={lang} onBack={() => navigate('question_studio')} onClose={() => navigate('dashboard')} onRefreshAll={() => handleDoNowGenerate(doNowConfig, null)} />;
    }
    if (view === 'question_studio') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                    <h1 className="text-xl font-black text-indigo-600 tracking-tighter cursor-pointer" onClick={() => navigate('dashboard')}>Anpassa Studio</h1>
                    <button onClick={() => navigate('dashboard')} className="text-sm font-bold text-slate-400 hover:text-slate-600 uppercase">Stäng Studio</button>
                </header>
                <QuestionStudio onDoNowGenerate={handleDoNowGenerate} ui={ui} lang={lang} initialPacket={savedPacket} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <AboutModal visible={aboutOpen} onClose={() => setAboutOpen(false)} ui={ui} />
            <LgrModal visible={lgrOpen} onClose={() => setLgrOpen(false)} ui={ui} />
            <ContentModal visible={contentOpen} onClose={() => setContentOpen(false)} /> 
            <StatsModal visible={statsOpen} stats={sessionStats} granularStats={granularStats} lang={lang} ui={ui} onClose={() => setStatsOpen(false)} title={ui.stats_title} />
            <StatsModal visible={timeUpOpen} stats={sessionStats} granularStats={granularStats} lang={lang} ui={ui} onClose={() => setTimeUpOpen(false)} title={ui.stats_times_up} />
            <StreakModal visible={showStreakModal} onClose={() => setShowStreakModal(false)} streak={streak} ui={ui} />
            <MobileDrawer open={mobileHistoryOpen} onClose={() => setMobileHistoryOpen(false)} history={history} ui={ui} />

            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-black text-indigo-600 tracking-tighter cursor-pointer" onClick={quitPractice}>Anpassa</h1>
                        {view === 'dashboard' && timerSettings.remaining > 0 && (
                            <div className="hidden sm:flex bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold items-center gap-2 border border-orange-200">
                                <span>⏸ {ui.timer_paused}</span>
                                <span className="font-mono text-sm">{formatTimerTime(timerSettings.remaining)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setLang(prev => prev === 'sv' ? 'en' : 'sv')} className="text-2xl hover:scale-110 transition-transform mr-2" title="Switch Language">
                            {lang === 'sv' ? '🇸🇪' : '🇬🇧'}
                        </button>
                        
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">✅ {totalCorrect}</div>
                        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">🔥 {streak}</div>
                        
                        {session ? (
                            <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase ml-2 transition-colors">Logga ut</button>
                        ) : (
                            <button onClick={() => navigate('auth')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase ml-2 transition-colors">Logga in</button>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col">
                {view === 'dashboard' ? (
                    <Dashboard
                        lang={lang} selectedTopic={topic} selectedLevel={level} 
                        userRole={DEVELOPER_MODE ? 'teacher' : (profile?.role || 'student')} 
                        assignments={assignments} 
                        onSelect={(t, l) => { setTopic(t); setLevel(l); }} 
                        onStart={startPractice} ui={ui} 
                        timerSettings={timerSettings} toggleTimer={toggleTimer} resetTimer={resetTimer}
                        onLgrOpen={() => setLgrOpen(true)} onContentOpen={() => setContentOpen(true)} onAboutOpen={() => setAboutOpen(true)}
                        onStatsOpen={() => setStatsOpen(true)} onStudioOpen={() => navigate('question_studio')} onDoNowOpen={() => navigate('donow_config')} 
                    />
                ) : (
                    <PracticeView
                        lang={lang} ui={ui} question={question} loading={loading} feedback={feedback} streak={streak} input={input} setInput={setInput} 
                        handleSubmit={handleSubmit} handleHint={handleHint} handleSolution={handleSolution} handleSkip={handleSkip}
                        handleChangeLevel={handleChangeLevel} revealedClues={revealedClues} uiState={{ history, topic, level }} 
                        actions={{ retry: (force) => fetchQuestion(topic, level, lang, force), goBack: quitPractice }} 
                        levelUpAvailable={levelUpAvailable} setLevelUpAvailable={setLevelUpAvailable} isSolutionRevealed={isSolutionRevealed} 
                        timerSettings={timerSettings} formatTime={formatTimerTime} setMobileHistoryOpen={setMobileHistoryOpen}
                    />
                )}
            </div>
        </div>
    );
}

export default App;