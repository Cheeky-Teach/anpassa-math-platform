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
    
    // State to persist the Question Studio cart (packet)
    const [savedPacket, setSavedPacket] = useState([]); 

    // --- 7. TIMER STATE ---
    const [timerSettings, setTimerSettings] = useState({ duration: 0, remaining: 0, isActive: false });

    const ui = UI_TEXT[lang];

    // --- 8. SMART NAVIGATION (PREVENT ACCIDENTAL EXIT) ---
    useEffect(() => {
        // Initialize history state on mount
        window.history.replaceState({ view: 'dashboard' }, '');

        const handlePopState = (event) => {
            // When user hits browser back button, go to previous view state
            const nextView = event.state?.view || 'dashboard';
            setView(nextView);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Wrapper to update View AND Browser History
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
        const handleSession = async (currentSession) => {
            if (!mounted) return;
            if (currentSession) {
                setSession(currentSession);
                const userProfile = await getOrCreateProfile(currentSession.user);
                if (mounted) { setProfile(userProfile); setLoadingProfile(false); }
            } else {
                setSession(null); setProfile(null); setLoadingProfile(false); setView('dashboard');
            }
        };
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => handleSession(s));
        return () => { mounted = false; subscription.unsubscribe(); };
    }, []);

    const handleLogout = async () => { setLoadingProfile(true); await supabase.auth.signOut(); };

    // --- DATA PERSISTENCE ---
    const recordProgress = async (isCorrect, metadata) => {
        if (!session?.user || !metadata) return;
        const { error } = await supabase.from('student_progress').insert({
            student_id: session.user.id,
            topic_id: topic,
            variation_key: metadata.variation_key || 'unknown',
            is_correct: isCorrect,
            help_used: revealedClues.length > 0 || isSolutionRevealed,
        });
        if (error) console.error("Database persistence error:", error.message);
    };

    // --- TIMER LOGIC ---
    useEffect(() => {
        let interval = null;
        if (timerSettings.isActive && timerSettings.remaining > 0 && view === 'practice') {
            interval = setInterval(() => {
                setTimerSettings(prev => {
                    if (prev.remaining <= 1) {
                        clearInterval(interval);
                        setTimeUpOpen(true);
                        return { ...prev, remaining: 0, isActive: false };
                    }
                    return { ...prev, remaining: prev.remaining - 1 };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerSettings.isActive, view, timerSettings.remaining]);

    const toggleTimer = (minutes) => setTimerSettings({ duration: minutes * 60, remaining: minutes * 60, isActive: minutes > 0 });
    const resetTimer = () => setTimerSettings({ duration: 0, remaining: 0, isActive: false });
    const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

    useEffect(() => { if (streak > sessionStats.maxStreak) setSessionStats(prev => ({ ...prev, maxStreak: streak })); }, [streak]);

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
            navigate('practice'); // Use navigate for history
            if (timerSettings.duration > 0) setTimerSettings(prev => ({ ...prev, isActive: true })); 
            fetchQuestion(topic, level, lang); 
        }
    };

    const quitPractice = () => { 
        setStreak(0); 
        navigate('dashboard'); // Use navigate for history
        setQuestion(null); 
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
                body: JSON.stringify({ answer: finalInput, token: question.token, streak, level, topic, usedHelp: helpUsed, solutionUsed: isSolutionRevealed, attempts: question.attempts }) 
            });
            const result = await res.json();
            await recordProgress(result.correct, question.metadata);

            if (result.correct) {
                if (!isSolutionRevealed) {
                    setHistory(prev => [{ topic, level, correct: true, text: question.renderData.latex || question.renderData.description, clueUsed: helpUsed, time: Date.now() }, ...prev]);
                    setStreak(result.newStreak);
                    setTotalCorrect(prev => prev + 1);
                    if ([15, 20, 30, 40, 50].includes(result.newStreak)) setShowStreakModal(true);
                    else if (result.levelUp) setLevelUpAvailable(true);
                    else setTimeout(() => fetchQuestion(topic, level, lang), 1500);
                }
                setFeedback('correct');
            } else {
                setQuestion({...question, attempts: (question.attempts || 0) + 1});
                if ((question.attempts || 0) + 1 >= 2) { 
                    if (!isSolutionRevealed) setHistory(prev => [{ topic, level, correct: false, text: question.renderData.latex || question.renderData.description, clueUsed: true, time: Date.now() }, ...prev]);
                    setUsedHelp(true); setRevealedClues(question.clues || []); setIsSolutionRevealed(true); setStreak(0);
                } else if (question.clues) {
                    setUsedHelp(true); setRevealedClues([...revealedClues, question.clues[revealedClues.length] || question.clues[0]]);
                }
                setFeedback('incorrect'); setStreak(0);
            }
        } catch (e) { console.error(e); }
    };

    // --- DO NOW GENERATION ---
    const handleDoNowGenerate = async (selectedConfig, rawPacket) => {
        if (!selectedConfig || selectedConfig.length === 0) return;
        
        setDoNowConfig(selectedConfig);
        if (rawPacket) setSavedPacket(rawPacket); 
        
        setLoading(true);
        
        const requestsPayload = [];
        for (let i = 0; i < 6; i++) {
            const selection = selectedConfig[i % selectedConfig.length];
            requestsPayload.push({ topic: selection.topic, level: selection.level, variation: selection.variation, lang });
        }

        try {
            const res = await fetch('/api/batch', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requests: requestsPayload }) 
            });
            if (!res.ok) throw new Error(`Batch API Error: ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) { 
                setDoNowQuestions(data); 
                navigate('donow_grid'); // Use navigate for history
            }
        } catch (e) { console.error("Do Now Error:", e); } 
        finally { setLoading(false); }
    };

    // --- RENDER ---
    if (session && loadingProfile) return <div className="h-screen bg-white" />;
    if (!session) return <AuthView ui={ui} lang={lang} onGuestMode={() => {}} />;

    if (view === 'donow_config') {
        return <div className="min-h-screen bg-gray-50"><DoNowConfig ui={ui} lang={lang} onBack={() => navigate('dashboard')} onGenerate={handleDoNowGenerate} /></div>;
    }
    
    if (view === 'donow_grid') {
        return (
            <DoNowGrid 
                questions={doNowQuestions} 
                ui={ui} 
                lang={lang} 
                onBack={() => navigate('question_studio')} // Use navigate
                onClose={() => navigate('dashboard')}      // Use navigate
                onRefreshAll={() => handleDoNowGenerate(doNowConfig, null)} 
            />
        );
    }
    
    if (view === 'question_studio') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                    <h1 className="text-xl font-black text-indigo-600 tracking-tighter cursor-pointer" onClick={() => navigate('dashboard')}>Anpassa Studio</h1>
                    <button onClick={() => navigate('dashboard')} className="text-sm font-bold text-slate-400 hover:text-slate-600 uppercase">Stäng Studio</button>
                </header>
                <QuestionStudio 
                    onDoNowGenerate={handleDoNowGenerate} 
                    ui={ui}
                    lang={lang}
                    initialPacket={savedPacket} 
                />
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
                                <span className="font-mono text-sm">{formatTime(timerSettings.remaining)}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* --- RESTORED LANGUAGE TOGGLE & USER CONTROLS --- */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setLang(prev => prev === 'sv' ? 'en' : 'sv')}
                            className="text-2xl hover:scale-110 transition-transform mr-2"
                            title={lang === 'sv' ? "Byt till Engelska" : "Switch to Swedish"}
                        >
                            {lang === 'sv' ? '🇸🇪' : '🇬🇧'}
                        </button>

                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-emerald-200">✅ {totalCorrect}</div>
                        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-yellow-200">🔥 {streak}</div>
                        <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase ml-2 transition-colors">Logga ut</button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col">
                {view === 'dashboard' ? (
                    <Dashboard
                        lang={lang} selectedTopic={topic} selectedLevel={level} userRole={DEVELOPER_MODE ? 'teacher' : (profile?.role || 'student')} assignments={assignments} 
                        onSelect={(t, l) => { setTopic(t); setLevel(l); }} 
                        onStart={startPractice} 
                        timerSettings={timerSettings} toggleTimer={toggleTimer} resetTimer={resetTimer} ui={ui} 
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
                        timerSettings={timerSettings} formatTime={formatTime} setMobileHistoryOpen={setMobileHistoryOpen}
                    />
                )}
            </div>
        </div>
    );
}

export default App;