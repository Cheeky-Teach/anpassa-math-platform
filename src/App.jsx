import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { BarChart3, AlertCircle } from 'lucide-react';

// Views
import LandingView from './components/views/LandingView';
import Dashboard from './components/views/Dashboard';
import PracticeView from './components/views/PracticeView';
import AuthView from './components/views/AuthView';
import QuestionStudio from './components/views/QuestionStudio'; 
import PrintView from './components/views/PrintView';
import StudentLiveView from './components/views/StudentLiveView';
import TeacherLiveView from './components/views/TeacherLiveView'; 
import DoNowGrid from './components/views/DoNowGrid'; // Import the Grid view

// Modals
import AboutModal from './components/modals/AboutModal';
import LgrModal from './components/modals/LgrModal';
import StatsModal from './components/modals/StatsModal';
import StreakModal from './components/modals/StreakModal'; 
import ContentModal from './components/modals/ContentModal'; 

// Data & Constants
import { UI_TEXT, LEVEL_DESCRIPTIONS } from './constants/localization';

function App() {
    // --- 1. AUTH & PROFILE STATE ---
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [view, setView] = useState('landing'); 
    const [lang, setLang] = useState('sv');

    // --- 2. STUDENT & LIVE SESSION STATE ---
    const [studentMode, setStudentMode] = useState(null); 
    const [activeClass, setActiveClass] = useState(null); 
    const [activeRoom, setActiveRoom] = useState(null);
    const [studentAlias, setStudentAlias] = useState(localStorage.getItem('anpassa_alias') || '');

    // --- 3. GAMEPLAY STATE ---
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState(0);
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
    const [sessionStats, setSessionStats] = useState({ attempted: 0, correctNoHelp: 0, correctHelp: 0, incorrect: 0, skipped: 0, maxStreak: 0 });
    const [granularStats, setGranularStats] = useState({});
    const [history, setHistory] = useState([]);
    const [levelUpAvailable, setLevelUpAvailable] = useState(false);
    
    // --- 5. MODALS & UI STATE ---
    const [aboutOpen, setAboutOpen] = useState(false);
    const [statsOpen, setStatsOpen] = useState(false);
    const [lgrOpen, setLgrOpen] = useState(false);
    const [contentOpen, setContentOpen] = useState(false); 
    const [showStreakModal, setShowStreakModal] = useState(false);

    // --- 6. STUDIO & PRINT STATE ---
    const [savedPacket, setSavedPacket] = useState([]); 
    const [sheetTitle, setSheetTitle] = useState("");
    const [studioMode, setStudioMode] = useState(null);
    const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
    const [answerKeyStyle, setAnswerKeyStyle] = useState('compact');
    const [timerSettings, setTimerSettings] = useState({ duration: 0, remaining: 0, isActive: false });

    const ui = UI_TEXT[lang];

    // --- HELPERS ---
    const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

    const updateStats = (type) => {
        setSessionStats(prev => ({
            ...prev,
            attempted: type !== 'skipped' ? prev.attempted + 1 : prev.attempted,
            [type]: prev[type] + 1
        }));
        if (topic && level) {
            setGranularStats(prev => {
                const topicData = prev[topic] || {};
                const levelData = topicData[level] || { skipped: 0, incorrect: 0, correctHelp: 0, correctNoHelp: 0 };
                return { ...prev, [topic]: { ...topicData, [level]: { ...levelData, [type]: (levelData[type] || 0) + 1 } } };
            });
        }
    };

    // --- SUBSCRIPTION LOGIC ---
    const isPaid = profile?.subscription_status === 'active' || 
                  (profile?.subscription_status === 'trial' && new Date(profile.subscription_end_date) > new Date());
    const isTrialExpired = profile?.subscription_status === 'trial' && new Date(profile.subscription_end_date) <= new Date();

    // --- AUTH EFFECTS ---
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            if (s) fetchProfile(s.user.id);
            else setLoadingProfile(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            if (s) fetchProfile(s.user.id);
            else { setProfile(null); setView('landing'); }
        });
        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (uid) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
        setProfile(data);
        
        setView(currentView => {
            if (currentView === 'landing' || currentView === 'auth') {
                return 'dashboard';
            }
            return currentView; 
        });

        setLoadingProfile(false);
    };

    const navigate = (dest) => setView(dest);

    // --- HANDLERS ---
    const fetchQuestion = async (t, l, lg, force = false) => {
        if (!force && (showStreakModal || levelUpAvailable)) return;
        setLoading(true); setFeedback(null); setInput(''); setRevealedClues([]); setUsedHelp(false); setIsSolutionRevealed(false); setLevelUpAvailable(false);
        try {
            const res = await fetch(`/api/question?topic=${t}&level=${l}&lang=${lg}${force ? `&force=true&t=${Date.now()}` : ''}`);
            const data = await res.json();
            setQuestion(data);
        } catch (e) { setQuestion(null); } finally { setLoading(false); }
    };

    const startPractice = () => {
        if (topic && level) {
            setStreak(0); navigate('practice');
            if (timerSettings.duration > 0) setTimerSettings(prev => ({ ...prev, isActive: true, remaining: timerSettings.duration }));
            fetchQuestion(topic, level, lang); 
        }
    };

    const quitPractice = () => { setStreak(0); navigate('dashboard'); setQuestion(null); setTimerSettings(prev => ({ ...prev, isActive: false })); };

    const handleSubmit = async (e, directInput) => {
        if (e) e.preventDefault();
        if (feedback === 'correct') return;
        let finalInput = directInput !== undefined ? directInput : input;
        if (!question || !finalInput) return;
        const helpUsed = revealedClues.length > 0 || isSolutionRevealed;

        try {
            const res = await fetch('/api/answer', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    answer: finalInput, token: question.token, streak, level, topic, 
                    usedHelp: helpUsed, solutionUsed: isSolutionRevealed, attempts: (question.attempts || 0)
                }) 
            });
            const result = await res.json();
            if (result.correct) {
                if (!isSolutionRevealed) {
                    setHistory(prev => [{ topic, level, correct: true, text: question.renderData.latex || question.renderData.description, clueUsed: helpUsed, time: Date.now() }, ...prev]);
                    setStreak(result.newStreak); setTotalCorrect(prev => prev + 1);
                    updateStats(helpUsed ? 'correctHelp' : 'correctNoHelp');
                    if ([15, 25, 50].includes(result.newStreak)) setShowStreakModal(true);
                    else if (result.levelUp) setLevelUpAvailable(true); 
                    else setTimeout(() => fetchQuestion(topic, level, lang), 1500);
                }
                setFeedback('correct');
            } else {
                setQuestion({...question, attempts: (question.attempts || 0) + 1});
                updateStats('incorrect');
                if ((question.attempts || 0) + 1 >= 2) { 
                    setRevealedClues(question.clues || []); setIsSolutionRevealed(true); setStreak(0);
                }
                setFeedback('incorrect'); setStreak(0);
            }
        } catch (e) { console.error(e); }
    };

    // INTERACTIVE HANDLERS FOR PRACTICE VIEW
    const handleHint = () => {
        if (question?.clues && revealedClues.length < question.clues.length) {
            setRevealedClues(prev => [...prev, question.clues[prev.length]]);
            setUsedHelp(true);
        }
    };

    const handleSolution = () => {
        if (question?.clues) {
            setRevealedClues(question.clues);
            setIsSolutionRevealed(true);
            setUsedHelp(true);
        }
    };

    const handleSkip = () => {
        updateStats('skipped');
        fetchQuestion(topic, level, lang, true);
    };

    const handleChangeLevel = (delta) => {
        const newLvl = Math.max(1, Math.min(level + delta, 9));
        if (newLvl !== level) {
            setLevel(newLvl);
            fetchQuestion(topic, newLvl, lang);
        }
    };

    // --- TIMER LOGIC ---
    useEffect(() => {
        let interval;
        if (timerSettings.isActive && timerSettings.remaining > 0) {
            interval = setInterval(() => {
                setTimerSettings(prev => ({ ...prev, remaining: prev.remaining - 1 }));
            }, 1000);
        } else if (timerSettings.remaining === 0 && timerSettings.isActive) {
            setTimerSettings(prev => ({ ...prev, isActive: false }));
            alert(lang === 'sv' ? "Tiden är slut!" : "Time is up!");
        }
        return () => clearInterval(interval);
    }, [timerSettings.isActive, timerSettings.remaining]);


    // --- VIEW ORCHESTRATION ---
    if (loadingProfile) return <div className="h-screen flex items-center justify-center bg-white"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

    if (view === 'landing' && !session) return <LandingView lang={lang} onTeacherLogin={() => setView('auth')} onStudentJoin={(m) => { setStudentMode(m); setView('auth'); }} />;

    if (view === 'auth') {
        return (
            <AuthView 
                lang={lang} studentMode={studentMode} onBack={() => setView('landing')} 
                onSuccess={(data) => {
                    if (data.role === 'student') {
                        setActiveClass(data.class);
                        setProfile({ role: 'student', subscription_status: 'active' });
                        setView('dashboard');
                    } else if (data.role === 'live') {
                        setActiveRoom(data.room);
                        const name = prompt(lang === 'sv' ? "Vad heter du?" : "What is your name?");
                        if (name) { setStudentAlias(name); localStorage.setItem('anpassa_alias', name); setView('live_session'); } 
                        else { setView('landing'); }
                    }
                }}
            />
        );
    }

    if (view === 'live_session' && activeRoom) {
        return <StudentLiveView session={activeRoom} packet={activeRoom.active_question_data?.packet || []} lang={lang} studentAlias={studentAlias} onBack={quitPractice} />;
    }

    if (view === 'teacher_live' && activeRoom) {
        return (
            <TeacherLiveView 
                session={activeRoom} packet={savedPacket} lang={lang} 
                onEnd={async () => {
                    await supabase.from('rooms').update({ status: 'closed' }).eq('id', activeRoom.id);
                    setView('dashboard');
                }} 
            />
        );
    }

    // FIXED: Passed questions={savedPacket} to match DoNowGrid prop expectation
    if (view === 'do_now') {
        return <DoNowGrid questions={savedPacket} title={sheetTitle} lang={lang} onBack={() => setView('question_studio')} onClose={() => setView('dashboard')} onRefreshAll={() => {}} />;
    }

    if (view === 'print') return <PrintView packet={savedPacket} title={sheetTitle} lang={lang} onBack={() => setView('question_studio')} includeAnswerKey={includeAnswerKey} answerKeyStyle={answerKeyStyle} />;
    
    if (view === 'question_studio') {
        if (!isPaid) return (
            <div className="h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md bg-white p-10 rounded-[3rem] shadow-2xl text-center border-4 border-rose-100">
                    <AlertCircle size={48} className="mx-auto text-rose-500 mb-6" />
                    <h2 className="text-2xl font-black uppercase mb-4">{isTrialExpired ? "Testperioden är slut" : "Prenumeration krävs"}</h2>
                    <p className="text-slate-500 mb-8 font-medium">Lås upp Question Studio och Live Rooms för att skapa eget material.</p>
                    <button onClick={() => setView('dashboard')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">Tillbaka</button>
                </div>
            </div>
        );
        return (
            <QuestionStudio 
                ui={ui} lang={lang} initialPacket={savedPacket} setInitialPacket={setSavedPacket} sheetTitle={sheetTitle} setSheetTitle={setSheetTitle} 
                studioMode={studioMode} setStudioMode={setStudioMode}
                includeAnswerKey={includeAnswerKey} setIncludeAnswerKey={setIncludeAnswerKey}
                answerKeyStyle={answerKeyStyle} setAnswerKeyStyle={setAnswerKeyStyle}
                onClose={() => setView('dashboard')} // Fixed Close Button
                onWorksheetGenerate={(p) => { setSavedPacket(p); setView('print'); }} 
                onDoNowGenerate={(conf, pack, liveData) => {
                    if (liveData?.room) {
                        setActiveRoom(liveData.room);
                        setSavedPacket(liveData.packet);
                        setView('teacher_live');
                    } else if (pack) {
                        setSavedPacket(pack);
                        if (conf?.title) setSheetTitle(conf.title);
                        setView('do_now');
                    }
                }} 
            />
        );
    }

    // MAIN APP SHELL (DASHBOARD & PRACTICE)
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <AboutModal visible={aboutOpen} onClose={() => setAboutOpen(false)} ui={ui} />
            <LgrModal visible={lgrOpen} onClose={() => setLgrOpen(false)} ui={ui} />
            <ContentModal visible={contentOpen} onClose={() => setContentOpen(false)} /> 
            <StatsModal visible={statsOpen} stats={sessionStats} granularStats={granularStats} lang={lang} ui={ui} onClose={() => setStatsOpen(false)} title={ui.stats_title} />
            <StreakModal visible={showStreakModal} onClose={() => setShowStreakModal(false)} streak={streak} ui={ui} />
            
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-black text-indigo-600 tracking-tighter cursor-pointer uppercase italic" onClick={quitPractice}>ANPASSA</h1>
                        {view === 'dashboard' && timerSettings.remaining > 0 && (
                            <div className="hidden sm:flex bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold items-center gap-2 border border-orange-200">
                                <span>⏸ {ui.timer_paused}</span>
                                <span className="font-mono text-sm">{formatTime(timerSettings.remaining)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')} className="text-2xl hover:scale-110 transition-transform">{lang === 'sv' ? '🇸🇪' : '🇬🇧'}</button>
                        <button onClick={() => setStatsOpen(true)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-full transition-all"><BarChart3 size={20} /></button>
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-emerald-200">✅ {totalCorrect}</div>
                        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-yellow-200">🔥 {streak}</div>
                        {session && <button onClick={() => supabase.auth.signOut()} className="text-xs font-bold text-slate-400 uppercase hover:text-rose-500 transition-colors ml-2">Logga ut</button>}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col">
                {view === 'dashboard' ? (
                    <Dashboard
                        lang={lang} selectedTopic={topic} selectedLevel={level} userRole={profile?.role || 'teacher'} 
                        onSelect={(t, l) => { setTopic(t); setLevel(l); }} onStart={startPractice} ui={ui} 
                        onLgrOpen={() => setLgrOpen(true)} onContentOpen={() => setContentOpen(true)} onAboutOpen={() => setAboutOpen(true)}
                        onStudioOpen={() => setView('question_studio')} onStatsOpen={() => setStatsOpen(true)}
                        timerSettings={timerSettings} toggleTimer={(m) => setTimerSettings({duration: m*60, remaining: m*60, isActive: m > 0})} resetTimer={() => setTimerSettings({duration:0, remaining:0, isActive:false})}
                    />
                ) : (
                    <PracticeView
                        lang={lang} ui={ui} question={question} loading={loading} feedback={feedback} streak={streak} input={input} setInput={setInput} 
                        handleSubmit={handleSubmit} handleHint={handleHint} handleSolution={handleSolution} handleSkip={handleSkip}
                        handleChangeLevel={handleChangeLevel}
                        revealedClues={revealedClues} uiState={{ history, topic, level }} 
                        actions={{ retry: (f) => fetchQuestion(topic, level, lang, f), goBack: quitPractice }} 
                        isSolutionRevealed={isSolutionRevealed} timerSettings={timerSettings} formatTime={formatTime}
                    />
                )}
            </div>
        </div>
    );
}

export default App;