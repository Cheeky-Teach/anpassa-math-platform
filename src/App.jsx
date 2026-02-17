import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { BarChart3 } from 'lucide-react';

// Views
import Dashboard from './components/views/Dashboard';
import PracticeView from './components/views/PracticeView';
import DoNowConfig from './components/views/DoNowConfig'; 
import DoNowGrid from './components/views/DoNowGrid';
import AuthView from './components/views/AuthView';
import QuestionStudio from './components/views/QuestionStudio'; 
import PrintView from './components/views/PrintView';

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
    // --- AUTH & NAV STATE ---
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [view, setView] = useState('dashboard');
    const [lang, setLang] = useState('sv');
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState(0);

    // --- GAMEPLAY STATE ---
    const [question, setQuestion] = useState(null);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [streak, setStreak] = useState(0);
    const [totalCorrect, setTotalCorrect] = useState(0);
    const [revealedClues, setRevealedClues] = useState([]);
    const [isSolutionRevealed, setIsSolutionRevealed] = useState(false);
    const [usedHelp, setUsedHelp] = useState(false);

    // Live room state
    const [activeRoom, setActiveRoom] = useState(null); 
    const [studentAlias, setStudentAlias] = useState(''); 

    // --- SESSION STATS ---
    const [sessionStats, setSessionStats] = useState({ attempted: 0, correctNoHelp: 0, correctHelp: 0, incorrect: 0, skipped: 0, maxStreak: 0 });
    const [granularStats, setGranularStats] = useState({});
    const [history, setHistory] = useState([]);
    const [levelUpAvailable, setLevelUpAvailable] = useState(false);
    
    // --- MODALS ---
    const [aboutOpen, setAboutOpen] = useState(false);
    const [statsOpen, setStatsOpen] = useState(false);
    const [timeUpOpen, setTimeUpOpen] = useState(false);
    const [lgrOpen, setLgrOpen] = useState(false);
    const [contentOpen, setContentOpen] = useState(false); 
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

    // --- STUDIO & PRINT STATE ---
    const [assignments, setAssignments] = useState([]); 
    const [doNowQuestions, setDoNowQuestions] = useState([]);
    const [doNowConfig, setDoNowConfig] = useState([]); 
    const [savedPacket, setSavedPacket] = useState([]); 
    const [sheetTitle, setSheetTitle] = useState(""); 
    const [studioMode, setStudioMode] = useState(null); 
    const [includeAnswerKey, setIncludeAnswerKey] = useState(true); // NEW
    const [answerKeyStyle, setAnswerKeyStyle] = useState('compact'); // 'compact' or 'detailed'

    // --- TIMER STATE ---
    const [timerSettings, setTimerSettings] = useState({ duration: 0, remaining: 0, isActive: false });

    const ui = UI_TEXT[lang];

    // --- NAVIGATION ---
    useEffect(() => {
        window.history.replaceState({ view: 'dashboard' }, '');
        const handlePopState = (event) => setView(event.state?.view || 'dashboard');
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (destination) => {
        if (destination !== view) {
            window.history.pushState({ view: destination }, '');
            setView(destination);
        }
    };

    // --- AUTH HELPERS ---
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
        supabase.auth.getSession().then(({ data: { session: initSession } }) => {
            if (mounted && initSession) {
                setSession(initSession);
                getOrCreateProfile(initSession.user).then(p => { if (mounted) { setProfile(p); setLoadingProfile(false); } });
            } else { setLoadingProfile(false); }
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!mounted) return;
            setSession(currentSession);
            if (currentSession) {
                const userProfile = await getOrCreateProfile(currentSession.user);
                if (mounted) { setProfile(userProfile); setLoadingProfile(false); if (view === 'auth') setView('dashboard'); }
            } else { setProfile(null); setLoadingProfile(false); }
        });
        return () => { mounted = false; subscription.unsubscribe(); };
    }, []);

    const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); setProfile(null); navigate('dashboard'); };

    // --- GAMEPLAY HANDLERS ---
    const fetchQuestion = async (t, l, lg, force) => {
        if (!force && (showStreakModal || levelUpAvailable || timeUpOpen)) return;
        setLoading(true); setFeedback(null); setInput(''); setRevealedClues([]); setUsedHelp(false); setIsSolutionRevealed(false); setLevelUpAvailable(false);
        try {
            const res = await fetch(`/api/question?topic=${t}&level=${l}&lang=${lg}${force ? `&force=true&t=${Date.now()}` : ''}`);
            const data = await res.json();
            setQuestion(data);
        } catch (e) { setQuestion(null); } finally { setLoading(false); }
    };

    const startPractice = () => { if (topic && level) { setStreak(0); navigate('practice'); if (timerSettings.duration > 0) setTimerSettings(prev => ({ ...prev, isActive: true })); fetchQuestion(topic, level, lang); } };
    const quitPractice = () => { setStreak(0); navigate('dashboard'); setQuestion(null); };

    // --- STUDIO HANDLERS ---
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
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleWorksheetGenerate = (packet) => {
        if (!packet || packet.length === 0) return;
        setSavedPacket(packet); 
        navigate('print'); 
    };

    const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

    // --- RENDER LOGIC ---
    if (loadingProfile) return <div className="h-screen flex items-center justify-center bg-white"><div className="animate-pulse text-indigo-600 font-black uppercase text-2xl">Laddar...</div></div>;
    
    if (view === 'donow_grid') return <DoNowGrid questions={doNowQuestions} ui={ui} lang={lang} onBack={() => navigate('question_studio')} onClose={() => navigate('dashboard')} onRefreshAll={() => handleDoNowGenerate(doNowConfig, null)} />;
    
    if (view === 'print') return (
        <PrintView 
            packet={savedPacket} 
            title={sheetTitle} 
            lang={lang} 
            onBack={() => navigate('question_studio')} 
            includeAnswerKey={includeAnswerKey}
            answerKeyStyle={answerKeyStyle}
        />
    );

    if (view === 'question_studio') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                    <h1 className="text-xl font-black text-indigo-600 tracking-tighter cursor-pointer" onClick={() => navigate('dashboard')}>Anpassa Studio</h1>
                    <button onClick={() => navigate('dashboard')} className="text-sm font-bold text-slate-400 hover:text-slate-600 uppercase">Stäng Studio</button>
                </header>
                <QuestionStudio 
                    onDoNowGenerate={handleDoNowGenerate} 
                    onWorksheetGenerate={handleWorksheetGenerate}
                    ui={ui} lang={lang} 
                    initialPacket={savedPacket} setInitialPacket={setSavedPacket}
                    sheetTitle={sheetTitle} setSheetTitle={setSheetTitle}
                    studioMode={studioMode} setStudioMode={setStudioMode}
                    includeAnswerKey={includeAnswerKey} setIncludeAnswerKey={setIncludeAnswerKey}
                    answerKeyStyle={answerKeyStyle} setAnswerKeyStyle={setAnswerKeyStyle}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <AboutModal visible={aboutOpen} onClose={() => setAboutOpen(false)} ui={ui} /><LgrModal visible={lgrOpen} onClose={() => setLgrOpen(false)} ui={ui} /><ContentModal visible={contentOpen} onClose={() => setContentOpen(false)} /> 
            <StatsModal visible={statsOpen} stats={sessionStats} granularStats={granularStats} lang={lang} ui={ui} onClose={() => setStatsOpen(false)} title={ui.stats_title} />
            <StreakModal visible={showStreakModal} onClose={() => setShowStreakModal(false)} streak={streak} ui={ui} />
            
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-black text-indigo-600 tracking-tighter cursor-pointer" onClick={quitPractice}>Anpassa</h1>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setLang(prev => prev === 'sv' ? 'en' : 'sv')} className="text-2xl hover:scale-110 transition-transform">{lang === 'sv' ? '🇸🇪' : '🇬🇧'}</button>
                        <button onClick={() => setStatsOpen(true)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-full"><BarChart3 size={20} /></button>
                        {session ? <button onClick={handleLogout} className="text-xs font-bold text-slate-400 uppercase">Logga ut</button> : <button className="text-xs font-bold text-slate-300 uppercase">Logga in</button>}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col">
                <Dashboard
                    lang={lang} selectedTopic={topic} selectedLevel={level} userRole={DEVELOPER_MODE ? 'teacher' : (profile?.role || 'student')} assignments={assignments} 
                    onSelect={(t, l) => { setTopic(t); setLevel(l); }} onStart={startPractice} timerSettings={timerSettings} toggleTimer={(m) => setTimerSettings({duration: m*60, remaining: m*60, isActive: m > 0})} resetTimer={() => setTimerSettings({duration:0, remaining:0, isActive:false})} ui={ui} 
                    onLgrOpen={() => setLgrOpen(true)} onContentOpen={() => setContentOpen(true)} onAboutOpen={() => setAboutOpen(true)}
                    onStatsOpen={() => setStatsOpen(true)} onStudioOpen={() => navigate('question_studio')} onDoNowOpen={() => navigate('donow_config')} 
                />
            </div>
        </div>
    );
}

export default App;