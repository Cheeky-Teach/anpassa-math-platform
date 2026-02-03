import React, { useState, useEffect } from 'react';
import Dashboard from './components/views/Dashboard';
import PracticeView from './components/views/PracticeView';
import DoNowConfig from './components/views/DoNowConfig';
import DoNowGrid from './components/views/DoNowGrid';
import AboutModal from './components/modals/AboutModal';
import LgrModal from './components/modals/LgrModal';
import StatsModal from './components/modals/StatsModal';
import StreakModal from './components/modals/StreakModal'; 
import ContentModal from './components/modals/ContentModal'; 
import MobileDrawer from './components/practice/MobileDrawer';
import { UI_TEXT, CATEGORIES, LEVEL_DESCRIPTIONS } from './constants/localization';

function App() {
    const [view, setView] = useState('dashboard');
    const [lang, setLang] = useState('sv');
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState(0);

    const [question, setQuestion] = useState(null);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);

    // Session Stats
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
    
    const [granularStats, setGranularStats] = useState({});
    const [history, setHistory] = useState([]);
    const [revealedClues, setRevealedClues] = useState([]);
    const [levelUpAvailable, setLevelUpAvailable] = useState(false);
    
    // Modals State
    const [aboutOpen, setAboutOpen] = useState(false);
    const [statsOpen, setStatsOpen] = useState(false);
    const [timeUpOpen, setTimeUpOpen] = useState(false);
    const [lgrOpen, setLgrOpen] = useState(false);
    const [contentOpen, setContentOpen] = useState(false); 
    const [showStreakModal, setShowStreakModal] = useState(false);
    // REMOVED: showTotalModal state
    const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

    // Do Now State
    const [doNowQuestions, setDoNowQuestions] = useState([]);
    const [doNowConfig, setDoNowConfig] = useState([]); 

    const [usedHelp, setUsedHelp] = useState(false);
    const [isSolutionRevealed, setIsSolutionRevealed] = useState(false);

    // Timer State
    const [timerSettings, setTimerSettings] = useState({ duration: 0, remaining: 0, isActive: false });

    const ui = UI_TEXT[lang];

    // Timer Logic
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

    const fetchQuestion = async (t = topic, l = level, lg = lang, force = false) => {
        // Guard: Don't fetch if a blocking modal is open
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

    // --- DO NOW LOGIC ---
    const handleDoNowGenerate = async (selected) => {
        if (selected.length === 0) return;
        setDoNowConfig(selected);
        setLoading(true);
        
        const requests = [];
        const targetCount = Math.max(selected.length, 6);
        
        for (let i = 0; i < targetCount; i++) {
            const selection = selected[i % selected.length];
            requests.push({
                category: selection.topic,
                level: selection.level,
                lang: lang
            });
        }

        try {
            const res = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests })
            });
            const data = await res.json();
            
            if (data.results && Array.isArray(data.results)) {
                const validQuestions = data.results.filter(q => q !== null);
                setDoNowQuestions(validQuestions);
                setView('donow_grid');
            }
        } catch (e) {
            console.error("Do Now Generation Error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshAll = async () => {
        if (doNowConfig.length > 0) {
            await handleDoNowGenerate(doNowConfig);
        }
    };

    const handleRefreshOne = async (index, topic, level) => {
        try {
            const timestamp = new Date().getTime();
            const res = await fetch(`/api/question?category=${topic}&level=${level}&lang=${lang}&force=true&t=${timestamp}`);
            const newQuestion = await res.json();
            if (newQuestion.error) throw new Error(newQuestion.error);

            setDoNowQuestions(prev => {
                const copy = [...prev];
                copy[index] = newQuestion;
                return copy;
            });
        } catch (e) {
            console.error("Single refresh failed", e);
        }
    };

    // --- GAMEPLAY HANDLERS ---
    const handleSelection = (t, l) => { setTopic(t); setLevel(l); };

    const handleHint = () => {
        if (question?.clues) {
            setUsedHelp(true);
            const currentLen = revealedClues.length;
            if (currentLen < question.clues.length) {
                setRevealedClues([...revealedClues, question.clues[currentLen]]);
            }
        }
    };

    // UPDATED: Now registers as incorrect answer when clicked
    const handleSolution = () => {
        if (question?.clues) {
            setUsedHelp(true);
            setRevealedClues(question.clues);
            
            // STATS CHANGE: Register as incorrect if not already revealed/locked
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
        const descText = typeof question.renderData.description === 'object' ? question.renderData.description[lang] : question.renderData.description;
        const historyText = question.renderData.latex || descText;
        setHistory(prev => [{ topic, level, correct: false, skipped: true, text: historyText, clueUsed: revealedClues.length > 0 || isSolutionRevealed, time: Date.now() }, ...prev]);
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
        // Global Guard: If any blocking modal is open, ignore submission
        if (showStreakModal || timeUpOpen) return;
        if (feedback === 'correct') return;
        
        let finalInput = directInput !== undefined ? directInput : input;
        if (!question || !finalInput) return;

        // Capture lock state at moment of submission
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
            const descText = typeof question.renderData.description === 'object' ? question.renderData.description[lang] : question.renderData.description;
            const historyText = question.renderData.latex || descText;

            if (result.correct) {
                // LOCK CHECK: Only update stats if solution was NOT revealed
                if (!isStatsLocked) {
                    setHistory(prev => [{ topic, level, correct: true, text: historyText, clueUsed: helpUsed, time: Date.now() }, ...prev]);
                    setStreak(result.newStreak);
                    
                    if (!helpUsed) {
                        updateStats('correctNoHelp');
                        updateGranularStats(topic, level, 'correctNoHelp');
                    } else {
                        updateStats('correctHelp');
                        updateGranularStats(topic, level, 'correctHelp');
                    }

                    const newTotal = totalCorrect + 1;
                    setTotalCorrect(newTotal);

                    // --- MILESTONE LOGIC (No Total Modal) ---
                    const isStreakMilestone = [15, 20, 30, 40, 50].includes(result.newStreak);

                    if (isStreakMilestone) {
                        setShowStreakModal(true);
                        // Waiting for modal close.
                    } else if (result.levelUp) {
                        setLevelUpAvailable(true);
                        // Waiting for user choice in LevelUpModal.
                    } else {
                        // Standard flow: Auto-advance
                        setTimeout(() => {
                            // Using a boolean flag logic here is safer than checking state in timeout
                            fetchQuestion(topic, level, lang);
                        }, 1500);
                    }
                }
                setFeedback('correct');
            } else {
                // Incorrect Logic
                question.attempts = (question.attempts || 0) + 1;
                if (question.attempts >= 2) {
                    
                    // Add to history BEFORE calling handleSolution (which locks stats)
                    if (!isStatsLocked) {
                        setHistory(prev => [{
                            topic, level, correct: false, text: historyText, clueUsed: true, correctAnswer: result.correctAnswer || "See Solution", time: Date.now()
                        }, ...prev]);
                    }

                    // This will now trigger the stats update ('incorrect') and reveal the solution UI
                    handleSolution(); 
                    
                } else {
                    handleHint();
                }
                setFeedback('incorrect');
                setStreak(0);
            }
        } catch (e) { console.error(e); }
    };

    const toggleLang = () => setLang(prev => prev === 'sv' ? 'en' : 'sv');

    // RENDER LOGIC
    if (view === 'donow_config') {
        return <div className="min-h-screen bg-gray-50 font-sans"><DoNowConfig ui={ui} lang={lang} onBack={() => setView('dashboard')} onGenerate={handleDoNowGenerate} /></div>;
    }
    if (view === 'donow_grid') {
        return (
            <DoNowGrid 
                questions={doNowQuestions} 
                ui={ui} 
                onBack={() => setView('donow_config')} 
                lang={lang} 
                onRefreshAll={handleRefreshAll}
                onRefreshOne={handleRefreshOne}
            />
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <AboutModal visible={aboutOpen} onClose={() => setAboutOpen(false)} ui={ui} />
            <LgrModal visible={lgrOpen} onClose={() => setLgrOpen(false)} ui={ui} />
            <ContentModal visible={contentOpen} onClose={() => setContentOpen(false)} /> 
            
            <MobileDrawer open={mobileHistoryOpen} onClose={() => setMobileHistoryOpen(false)} history={history} ui={ui} />
            <StatsModal visible={statsOpen} stats={sessionStats} granularStats={granularStats} lang={lang} ui={ui} onClose={() => setStatsOpen(false)} title={ui.stats_title} />
            <StatsModal visible={timeUpOpen} stats={sessionStats} granularStats={granularStats} lang={lang} ui={ui} onClose={() => setTimeUpOpen(false)} title={ui.stats_times_up} />
            <StreakModal visible={showStreakModal} onClose={() => setShowStreakModal(false)} streak={streak} ui={ui} />

            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-primary-700 tracking-tight cursor-pointer" onClick={quitPractice}>Anpassa</h1>
                        {view === 'dashboard' && timerSettings.remaining > 0 && (
                            <div className="hidden sm:flex bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold items-center gap-2 border border-orange-200">
                                <span>⏸ {ui.timer_paused}</span>
                                <span className="font-mono text-sm">{formatTime(timerSettings.remaining)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-primary-200">✅ {totalCorrect}</div>
                        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-yellow-200">🔥 {streak}</div>
                        <button onClick={toggleLang} className="px-3 py-1 rounded-md text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-1.5" title={lang === 'sv' ? "Byt språk" : "Switch Language"}>
                            <span className="text-sm">{lang === 'sv' ? '🇸🇪' : '🇬🇧'}</span><span>{lang === 'sv' ? 'SE' : 'ENG'}</span>
                        </button>
                        <button onClick={() => setStatsOpen(true)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title={ui.stats_title}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        </button>
                        <button onClick={() => setAboutOpen(true)} className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-1 px-4 text-xs rounded-full shadow-sm transition-transform transform active:scale-95">{ui.aboutBtn}</button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col">
                {view === 'dashboard' ? (
                    <Dashboard
                        lang={lang} selectedTopic={topic} selectedLevel={level} onSelect={handleSelection} onStart={startPractice} timerSettings={timerSettings} toggleTimer={toggleTimer} resetTimer={resetTimer} ui={ui} 
                        onLgrOpen={() => setLgrOpen(true)} 
                        onContentOpen={() => setContentOpen(true)} 
                        onDoNowOpen={() => setView('donow_config')} 
                        toggleLang={toggleLang}
                    />
                ) : (
                    <PracticeView
                        lang={lang} 
                        ui={ui} 
                        question={question} 
                        loading={loading} 
                        feedback={feedback} 
                        streak={streak} 
                        input={input} 
                        setInput={setInput} 
                        handleSubmit={handleSubmit} 
                        handleHint={handleHint} 
                        handleSolution={handleSolution} 
                        handleSkip={handleSkip} 
                        handleChangeLevel={handleChangeLevel} 
                        revealedClues={revealedClues} 
                        uiState={{ history, topic, level }} 
                        actions={{ retry: (force) => fetchQuestion(topic, level, lang, force), goBack: quitPractice }} 
                        levelUpAvailable={levelUpAvailable} 
                        setLevelUpAvailable={setLevelUpAvailable} 
                        isSolutionRevealed={isSolutionRevealed} 
                        timerSettings={timerSettings} 
                        formatTime={formatTime} 
                        setMobileHistoryOpen={setMobileHistoryOpen}
                    />
                )}
            </div>
        </div>
    );
}

export default App;