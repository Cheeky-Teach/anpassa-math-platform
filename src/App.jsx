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
        attempted: 0,
        correctNoHelp: 0,
        correctHelp: 0,
        incorrect: 0,
        skipped: 0,
        maxStreak: 0
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

    // --- 7. TIMER STATE ---
    const [timerSettings, setTimerSettings] = useState({ duration: 0, remaining: 0, isActive: false });

    const ui = UI_TEXT[lang];

    // --- EFFECT: AUTH & PROFILE LISTENER ---
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log("Initial Session Check:", session?.user?.email || "No session");
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else setLoadingProfile(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("Auth Event:", _event, session?.user?.email || "No session");
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else {
                setProfile(null);
                setLoadingProfile(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        if (!userId) return;
        console.log("Fetching profile for:", userId);
        
        // 1. Try to get existing profile
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.warn("Profile fetch issue:", error.message);
            
            // PGRST116 means row not found - common for first-time social login
            if (error.code === 'PGRST116') {
                console.log("Profile not found in DB, attempting creation...");
                
                const { data: authData } = await supabase.auth.getUser();
                const user = authData?.user;

                // FIX: Check if user object exists before accessing metadata
                if (!user) {
                    console.error("User not found in Auth system during profile creation.");
                    setLoadingProfile(false);
                    return;
                }
                
                const userRole = user.user_metadata?.role || 'student';
                const fullName = user.user_metadata?.full_name || user.email.split('@')[0];

                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert([{ 
                        id: userId, 
                        full_name: fullName, 
                        role: userRole,
                        alias: userRole === 'student' ? `User-${Math.floor(Math.random() * 10000)}` : null
                    }])
                    .select()
                    .single();
                
                if (insertError) {
                    console.error("Error creating profile row:", insertError.message);
                } else if (newProfile) {
                    console.log("Profile created successfully:", newProfile);
                    setProfile(newProfile);
                }
            }
        } else if (data) {
            console.log("Profile loaded from DB:", data);
            setProfile(data);
        }
        setLoadingProfile(false);
    };

    const handleLogout = async () => {
        await supabase.signOut();
        setView('dashboard');
        setStreak(0);
        setProfile(null);
    };

    // --- DATA PERSISTENCE: RECORD PROGRESS ---
    const recordProgress = async (isCorrect, metadata) => {
        if (!session?.user || !metadata) return;
        const helpUsed = revealedClues.length > 0 || isSolutionRevealed;

        const { error } = await supabase.from('student_progress').insert({
            student_id: session.user.id,
            topic_id: topic,
            variation_key: metadata.variation_key || 'unknown',
            is_correct: isCorrect,
            help_used: helpUsed,
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

    const toggleTimer = (minutes) => {
        const seconds = minutes * 60;
        setTimerSettings({ duration: seconds, remaining: seconds, isActive: minutes > 0 });
    };

    const resetTimer = () => {
        setTimerSettings({ duration: 0, remaining: 0, isActive: false });
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (streak > sessionStats.maxStreak) {
            setSessionStats(prev => ({ ...prev, maxStreak: streak }));
        }
    }, [streak]);

    // --- GAMEPLAY HANDLERS ---
    const fetchQuestion = async (t = topic, l = level, lg = lang, force = false) => {
        if (!force && (showStreakModal || levelUpAvailable || timeUpOpen)) return;
        if (!t || !l) return;
        
        setLoading(true);
        setFeedback(null);
        setInput('');
        setRevealedClues([]);
        setUsedHelp(false);
        setIsSolutionRevealed(false);
        setLevelUpAvailable(false);
        
        try {
            const timestamp = new Date().getTime();
            const res = await fetch(`/api/question?topic=${t}&level=${l}&lang=${lg}${force ? `&force=true&t=${timestamp}` : ''}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setQuestion(data);
        } catch (e) {
            console.error(e);
            setQuestion(null);
        } finally {
            setLoading(false);
        }
    };

    const startPractice = () => {
        if (topic && level) {
            setStreak(0);
            setView('practice');
            if (timerSettings.duration > 0) {
                setTimerSettings(prev => ({ ...prev, isActive: true }));
            }
            fetchQuestion(topic, level, lang);
        }
    };

    const quitPractice = () => {
        setStreak(0);
        setView('dashboard');
        setQuestion(null);
    };

    const handleHint = () => {
        if (question?.clues) {
            setUsedHelp(true);
            const currentLen = revealedClues.length;
            if (currentLen < question.clues.length) {
                setRevealedClues([...revealedClues, question.clues[currentLen]]);
            }
        }
    };

    const handleSolution = () => {
        if (question?.clues) {
            setUsedHelp(true);
            setRevealedClues(question.clues);
            if (!isSolutionRevealed) {
                updateStats('incorrect');
                updateGranularStats(topic, level, 'incorrect');
            }
            setIsSolutionRevealed(true);
            setStreak(0);
        }
    };

    const updateStats = (type) => {
        setSessionStats(prev => ({
            ...prev,
            attempted: prev.attempted + 1,
            [type]: prev[type] + 1
        }));
    };

    const updateGranularStats = (topicId, levelId, resultType) => {
        setGranularStats(prev => {
            const topicData = prev[topicId] || {};
            const levelData = topicData[levelId] || { skipped: 0, incorrect: 0, correctHelp: 0, correctNoHelp: 0 };
            return {
                ...prev,
                [topicId]: {
                    ...topicData,
                    [levelId]: {
                        ...levelData,
                        [resultType]: (levelData[resultType] || 0) + 1
                    }
                }
            };
        });
    };

    const handleSkip = () => {
        setStreak(0);
        updateStats('skipped');
        updateGranularStats(topic, level, 'skipped');
        fetchQuestion(topic, level, lang);
    };

    const handleChangeLevel = (delta) => { 
        const newLevel = level + delta; 
        const max = Object.keys(LEVEL_DESCRIPTIONS[topic] || {}).length; 
        if (newLevel >= 1 && newLevel <= max) { 
            setLevel(newLevel); 
            fetchQuestion(topic, newLevel, lang, true); 
        } 
    };

    const handleSubmit = async (e, directInput) => {
        e.preventDefault();
        if (showStreakModal || timeUpOpen) return;
        if (feedback === 'correct') return;
        
        let finalInput = directInput !== undefined ? directInput : input;
        if (!question || !finalInput) return;

        const isStatsLocked = isSolutionRevealed;
        const helpUsed = revealedClues.length > 0 || isSolutionRevealed;

        try {
            const res = await fetch('/api/answer', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    answer: finalInput, 
                    token: question.token, 
                    streak: streak, 
                    level: level, 
                    topic: topic, 
                    usedHelp: helpUsed, 
                    solutionUsed: isSolutionRevealed, 
                    attempts: question.attempts 
                }) 
            });
            const result = await res.json();
            
            await recordProgress(result.correct, question.metadata);

            if (result.correct) {
                if (!isStatsLocked) {
                    setHistory(prev => [{ topic, level, correct: true, text: question.renderData.latex || question.renderData.description, clueUsed: helpUsed, time: Date.now() }, ...prev]);
                    setStreak(result.newStreak);
                    updateStats(helpUsed ? 'correctHelp' : 'correctNoHelp');
                    updateGranularStats(topic, level, helpUsed ? 'correctHelp' : 'correctNoHelp');
                    setTotalCorrect(prev => prev + 1);

                    if ([15, 20, 30, 40, 50].includes(result.newStreak)) {
                        setShowStreakModal(true);
                    } else if (result.levelUp) {
                        setLevelUpAvailable(true);
                    } else {
                        setTimeout(() => fetchQuestion(topic, level, lang), 1500);
                    }
                }
                setFeedback('correct');
            } else {
                question.attempts = (question.attempts || 0) + 1;
                if (question.attempts >= 2) {
                    if (!isStatsLocked) {
                        setHistory(prev => [{ topic, level, correct: false, text: question.renderData.latex || question.renderData.description, clueUsed: true, time: Date.now() }, ...prev]);
                    }
                    handleSolution(); 
                } else {
                    handleHint();
                }
                setFeedback('incorrect');
                setStreak(0);
            }
        } catch (e) { console.error(e); }
    };

    const handleDoNowGenerate = async (selected) => {
        if (selected.length === 0) return;
        setDoNowConfig(selected);
        setLoading(true);
        const requests = [];
        for (let i = 0; i < 6; i++) {
            const selection = selected[i % selected.length];
            requests.push({ topic: selection.topic, level: selection.level, lang });
        }
        try {
            const res = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests })
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setDoNowQuestions(data);
                setView('donow_grid');
            }
        } catch (e) { console.error("Do Now Error:", e); } finally { setLoading(false); }
    };

    // --- RENDER ---
    if (session && loadingProfile) {
        return <div className="h-screen flex items-center justify-center bg-white text-indigo-600 font-black animate-pulse uppercase tracking-tighter text-2xl">Anpassa...</div>;
    }

    if (!session) {
        return <AuthView ui={ui} lang={lang} onGuestMode={() => {}} />;
    }

    // View Switcher logic for Studio and legacy Do Now
    if (view === 'donow_config') {
        return <div className="min-h-screen bg-gray-50"><DoNowConfig ui={ui} lang={lang} onBack={() => setView('dashboard')} onGenerate={handleDoNowGenerate} /></div>;
    }
    if (view === 'donow_grid') {
        return <DoNowGrid questions={doNowQuestions} ui={ui} onBack={() => setView('dashboard')} lang={lang} onRefreshAll={() => handleDoNowGenerate(doNowConfig)} onRefreshOne={(i, t, l) => {}} />;
    }
    if (view === 'question_studio') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-black text-indigo-600 tracking-tighter cursor-pointer" onClick={() => setView('dashboard')}>Anpassa Studio</h1>
                    <button onClick={() => setView('dashboard')} className="text-sm font-bold text-slate-400 hover:text-slate-600 uppercase">Stäng Studio</button>
                </header>
                <QuestionStudio />
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
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">✅ {totalCorrect}</div>
                        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">🔥 {streak}</div>
                        <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase ml-2">Logga ut</button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col">
                {view === 'dashboard' ? (
                    <Dashboard
                        lang={lang} 
                        selectedTopic={topic} 
                        selectedLevel={level} 
                        userRole={profile?.role} 
                        assignments={assignments} 
                        onSelect={(t, l) => { setTopic(t); setLevel(l); }} 
                        onStart={startPractice} 
                        timerSettings={timerSettings} 
                        toggleTimer={toggleTimer} 
                        resetTimer={resetTimer} 
                        ui={ui} 
                        onLgrOpen={() => setLgrOpen(true)} 
                        onContentOpen={() => setContentOpen(true)} 
                        onAboutOpen={() => setAboutOpen(true)}
                        onStatsOpen={() => setStatsOpen(true)}
                        onStudioOpen={() => setView('question_studio')}
                        onDoNowOpen={() => setView('donow_config')} 
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