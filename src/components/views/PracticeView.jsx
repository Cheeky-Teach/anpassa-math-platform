import React, { useState, useEffect, useRef } from 'react';
import MathText from '../ui/MathText';
import VisualRenderer from '../visuals/VisualRenderer';
import CluePanel from '../practice/CluePanel';
import HistoryList from '../practice/HistoryList';
import { useMyCoach } from '../../hooks/useMyCoach';
import MyCoachModal from '../modals/MyCoachModal';
import LevelUpModal from '../modals/LevelUpModal';
import { LEVEL_DESCRIPTIONS, CATEGORIES } from '../../constants/localization'; 
import { FractionInput, ScientificInput, ExponentInput } from '../ui/InputComponents';
import { ChevronLeft, Trophy, Zap, Clock, Info, CheckCircle2, XCircle, HelpCircle, MinusCircle, ChevronRight, BarChart3, ChevronDown, Lock } from 'lucide-react';
import WordProblemVisualGuard from '../ui/WordProblemVisualGuard';

const PracticeView = ({ 
    lang, ui, question, loading, feedback, input, setInput, streak,
    handleSubmit, handleHint, handleSolution, handleSkip, 
    handleChangeLevel, revealedClues, uiState, actions, 
    levelUpAvailable, setLevelUpAvailable, isSolutionRevealed, 
    timerSettings, formatTime, toast, useWordProblems, setUseWordProblems
}) => {
    const inputRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const [shake, setShake] = useState(false);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false); // NEW: Controls the history collapse
    const retryRef = useRef(actions.retry);

    // NEW: INITIALIZE THE MY COACH PLAYER ENGINE
    const { isOpen: isCoachOpen, openCoach, closeCoach, coachProps } = useMyCoach(question, lang);

    // --- 1. EARLY DEFINITIONS (Prevents ReferenceErrors) ---
    const cluesLabel = ui.hintsTitle || (lang === 'sv' ? "Ledtrådar" : "Hints");
    const historyLabel = ui.historyTitle || (lang === 'sv' ? "Historik" : "History");


    // --- 2. LOCALIZATION & THEME ENGINE ---
    const getCategoryContext = () => {
        const catKey = Object.keys(CATEGORIES).find(key => 
            CATEGORIES[key].topics.some(t => t.id === uiState.topic)
        );
        const category = CATEGORIES[catKey] || CATEGORIES.arithmetic;
        const topicData = category.topics.find(t => t.id === uiState.topic);
        
        return {
            color: category.color || 'indigo',
            categoryLabel: category.label[lang],
            topicLabel: topicData?.label[lang] || uiState.topic
        };
    };

    // --- 3. MASTERY BAR CALCULATION
    const total = uiState.history.length;
    const stats = {
        skipped: uiState.history.filter(h => h.skipped).length,
        wrong: uiState.history.filter(h => !h.correct && !h.skipped).length,
        help: uiState.history.filter(h => h.correct && (h.clueUsed || h.solutionUsed)).length,
        correct: uiState.history.filter(h => h.correct && !h.clueUsed && !h.solutionUsed).length
    };
    
    // Helper to calculate percentage width for the progress bar segments
    const getPct = (val) => total > 0 ? (val / total) * 100 : 0;

    const theme = getCategoryContext();
    const maxLevels = Object.keys(LEVEL_DESCRIPTIONS[uiState.topic] || {}).length;

    const colorMap = {
        pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', accent: 'bg-pink-500' },
        indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', accent: 'bg-indigo-500' },
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', accent: 'bg-emerald-500' },
        yellow: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', accent: 'bg-amber-500' }
    };

    const activeTheme = colorMap[theme.color] || colorMap.indigo;

    // --- 3. INPUT & FEEDBACK LOGIC ---
    const sanitizeMathInput = (val) => val.replace(/[^a-zA-Z0-9+\-*/:.,><=^()\s]/g, '');
    const handleInputChange = (e) => setInput(sanitizeMathInput(e.target.value));

    useEffect(() => { retryRef.current = actions.retry; }, [actions.retry]);

    useEffect(() => {
        if (feedback === 'correct' && isSolutionRevealed) {
            const timer = setTimeout(() => { retryRef.current(); }, 1500);
            return () => clearTimeout(timer);
        }
    }, [feedback, isSolutionRevealed]);

    useEffect(() => {
        if (feedback === 'incorrect') {
            setShake(true);
            setTimeout(() => setShake(false), 600);
        }
    }, [feedback]);

    useEffect(() => {
        if (question && !loading) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.innerWidth >= 768 && !feedback && !levelUpAvailable && inputRef.current) {
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        }
    }, [question, loading, feedback, levelUpAvailable]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const activeElem = scrollContainerRef.current.querySelector('.active-pill');
            if (activeElem) activeElem.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [uiState.level]);

    // Resets the word problem layout state instantly when switching between topics or unsupportive levels
    useEffect(() => {
    // If the freshly loaded question structure explicitly lacks word problem metadata,
    // immediately disarm the active toggle state to prevent layout masking bugs!
    if (!question?.metadata?.levelSupportsWordProblems) {
        setUseWordProblems(false);
    }
    }, [question?.variationKey, question?.metadata?.levelSupportsWordProblems]); // Triggers precisely when the item changes

    const descriptionText = typeof question?.renderData?.description === 'object' ? question.renderData.description[lang] : question?.renderData?.description;
    
    // Targeted check: Only targets patterns topics when word problems are active
    const isPatternWordProblem = 
        uiState?.topic === 'patterns' && 
        (!!useWordProblems || !!question?.metadata?.isWordProblemApplied || !!question?.renderData?.availableStories);

    const handleChoiceClick = (choice) => { 
        if (feedback === 'correct') return; 
        setInput(choice); 
        handleSubmit({ preventDefault: () => { } }, choice); 
    };

    const getSubmitLabel = () => {
        if (feedback === 'correct') return ui.btnNext || "Nästa ➡";
        if (feedback === 'incorrect') return ui.tagWrong || "Fel svar";
        return ui.btnCheck || "Svara";
    };

    return (
        <div className="max-w-6xl mx-auto w-full p-2 sm:p-4 fade-in min-h-screen pb-10 relative z-10 font-sans">
            
            <LevelUpModal 
                visible={levelUpAvailable} 
                lang={lang} 
                // Checks if word problems are supported but NOT yet turned on
                supportsWordProblems={question?.metadata?.levelSupportsWordProblems && !useWordProblems}
                onNext={() => { handleChangeLevel(1); setLevelUpAvailable(false); setUseWordProblems(false);}} 
                onStay={() => { setLevelUpAvailable(false); actions.retry(true); }} 
                // Toggles word problems on, which App.jsx detects to fetch a new question!
                onWordProblems={() => { setUseWordProblems(true); setLevelUpAvailable(false); }} 
            />

            {/* MASTERY TOAST OVERLAY */}
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] w-full max-w-md px-4 animate-in slide-in-from-top duration-500">
                    <div className={`p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-4 bg-white ${toast.type === 'success' ? 'border-emerald-500' : 'border-amber-500'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {toast.type === 'success' ? <Trophy size={24}/> : <Zap size={24}/>}
                        </div>
                        <div>
                            <h4 className="font-black uppercase tracking-tight text-slate-900 leading-none">{toast.title}</h4>
                            <p className="text-xs font-bold text-slate-500 mt-1">{toast.message}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER ANCHOR BAR */}
            <header className={`mb-1 ${activeTheme.bg} rounded-[2rem] shadow-sm border-2 ${activeTheme.border} p-1 sm:p-2 sticky top-2 z-20`}>
                <div className="flex justify-between items-center mb-2 px-2">
                    <button onClick={actions.goBack} className="flex items-center gap-2 text-slate-800 hover:text-slate-800 font-black text-[10px] uppercase tracking-widest transition-all group">
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-slate-100 group-hover:shadow-md"><ChevronLeft size={14}/></div>
                        {ui.backBtn}
                    </button>

                    <div className="flex flex-col items-center">
                        <span className={`text-[14px] font-black uppercase tracking-[0.2em] ${activeTheme.text} opacity-60`}>
                            {theme.categoryLabel}
                        </span>
                        <h1 className="text-m font-black uppercase tracking-tighter text-slate-900 italic leading-none">
                            {theme.topicLabel}
                        </h1>
                    </div>

                    <div className="w-20 flex justify-end">
                        {timerSettings.isActive && (
                            <div className={`font-mono text-[14px] font-white px-2 py-1 rounded-xl border-2 flex items-center gap-2 shadow-sm ${timerSettings.remaining < 60 ? 'bg-rose-500 text-white border-rose-400 animate-pulse' : 'bg-black text-slate-100 border-slate-100'}`}>
                                <Clock size={12}/> {formatTime(timerSettings.remaining)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative flex items-center bg-white/40 rounded-xl p-1 py-0 border border-black/5">
                    <div ref={scrollContainerRef} className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-0 px-1 snap-x">
                        {Object.entries(LEVEL_DESCRIPTIONS[uiState.topic] || {}).map(([lvl, desc]) => {
                            const lNum = parseInt(lvl);
                            const isActive = uiState.level === lNum;
                            return (
                                <button
                                    key={lvl}
                                    onClick={() => !isActive && handleChangeLevel(lNum - uiState.level)}
                                    className={`snap-center shrink-0 min-w-[110px] p-1 py-0 rounded-lg border-2 transition-all flex flex-col items-center gap-0
                                        ${isActive 
                                            ? `active-pill ${activeTheme.accent} border-black/10 text-white shadow-md translate-y-[-1px]` 
                                            : `bg-white border-transparent text-slate-600 hover:border-slate-200 shadow-sm`
                                        }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Lvl {lNum}</span>
                                    <span className={`text-[10px] font-bold uppercase truncate w-full text-center px-1 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                                        {desc[lang]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-4 items-start relative z-10">
                <main className={`flex-1 w-full bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 ${shake ? 'animate-shake' : ''}`}>
                    {loading ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className={`w-8 h-8 border-4 border-t-transparent ${activeTheme.text} rounded-full animate-spin border-current`}></div>
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Laddar...</span>
                        </div>
                    ) : (
                        <div className="p-1 sm:p-2 lg:p-2">

                            {/* VISUAL CONTAINER */}
                            <div className="mb-4 flex justify-center bg-slate-50/50 rounded-[2rem] p-4 min-h-[160px] h-[200px] sm:h-[350px] items-center border border-slate-100 shadow-inner relative overflow-hidden">
    
                            {/* 🟢 RESTORED VISUAL CONTAINER WITH STRICT BOUNDING BOXES */}
    
                                <WordProblemVisualGuard 
                                    isActive={!!question?.metadata?.isWordProblemApplied || useWordProblems} 
                                    lang={lang}
                                    questionKey={question?.variationKey || question?.metadata?.variation_key || question?.metadata?.variationKey} 
                                    // 🟢 FAILSAFE: Structural check looking directly for data features rather than text string matches
                                    alwaysShow={!!question?.renderData?.graph || question?.renderData?.geometry?.type === 'frequency_table' || !!question?.renderData?.frequencyTable}
                                >
                                    {/* 🟢 THE LOCK: Enforces a strict max-width of 300px so raw SVGs cannot explode in size */}
                                    <div className="w-full max-w-[300px] flex justify-center items-center mx-auto overflow-visible">
                                        <VisualRenderer 
                                            data={question?.renderData} 
                                            isWordProblem={!!question?.renderData?.isWordProblemApplied} 
                                        />
                                    </div>
                                </WordProblemVisualGuard>
                                
                                <div className="absolute top-3 left-6 flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${activeTheme.accent} animate-pulse`}></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Du kan det här!</span>
                                </div>

                            
                            <div className="absolute top-3 left-6 flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${activeTheme.accent} animate-pulse`}></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Du kan det här!</span>
                            </div>
                        </div>
                            
                            {/* DESCRIPTION TEXT */}
                            <div className="mb-4 text-center max-w-xl mx-auto">
                                <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-snug px-3">
                                    <MathText text={descriptionText} />
                                </h2>
                            </div>
                            
                            {/* ANSWER FIELD */}
                            <div className="max-w-md mx-auto">
                                {question.renderData.answerType === 'multiple_choice' ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {(question.renderData.options || []).map((choice, idx) => {
                                            const isSelected = choice === input;
                                            const isCorrect = feedback === 'correct' && isSelected;
                                            const isIncorrect = feedback === 'incorrect' && isSelected;
                                            return (
                                                <button 
                                                    key={idx} 
                                                    onClick={() => handleChoiceClick(choice)} 
                                                    className={`p-3 rounded-xl font-bold text-base transition-all border-b-4 text-left flex items-center gap-1 active:translate-y-0.5 active:border-b-0
                                                        ${isCorrect ? 'bg-emerald-500 border-emerald-700 text-white' : 
                                                          isIncorrect ? 'bg-rose-500 border-rose-700 text-white animate-shake' : 
                                                          'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-indigo-400'}`} 
                                                    disabled={feedback === 'correct'}
                                                >
                                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shadow-inner
                                                        ${(isCorrect || isIncorrect) ? 'bg-white/20 text-white' : 'bg-white text-slate-300 border border-slate-100'}`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <MathText text={choice} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <form onSubmit={(e) => { e.preventDefault(); if (feedback !== 'correct') handleSubmit(e, input); else actions.retry(true); }} className="space-y-3">
                                        <div className="relative group">
                                            {/* SUPPORTED INPUTS: Fraction, Power, Scientific, Text */}
                                            {question?.renderData?.answerType === 'mixed_fraction' ? (
                                                <div className="flex justify-center py-2 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                                    <div className="scale-90 transform origin-center">
                                                <FractionInput
                                                    value={input}
                                                    onChange={setInput}
                                                    allowMixed={true}
                                                    autoFocus={true}
                                                />
                                                    </div>
                                                </div>
                                            ) : question.renderData.answerType === 'fraction' ? (
                                                <div className="flex justify-center py-2 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                                    <div className="scale-90 transform origin-center">
                                                        <FractionInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} allowMixed={false} autoFocus={false} />
                                                    </div>
                                                </div>
                                            ) : question.renderData.answerType === 'structured_power' ? (
                                                <div className="flex justify-center py-2 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                                    <div className="scale-90 transform origin-center">
                                                        <ExponentInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} autoFocus={true} />
                                                    </div>
                                                </div>
                                            ) : question.renderData.answerType === 'structured_scientific' ? (
                                                <div className="flex justify-center py-2 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                                    <div className="scale-90 transform origin-center">
                                                        <ScientificInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} autoFocus={true} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <input 
                                                    ref={inputRef} 
                                                    type="text" 
                                                    value={input} 
                                                    onChange={handleInputChange} 
                                                    autoComplete="off"
                                                    className={`w-full p-3 text-center text-2xl font-black border-4 rounded-2xl outline-none shadow-sm transition-all
                                                        ${feedback === 'incorrect' ? 'border-rose-500 bg-rose-50 text-rose-700' : 
                                                          feedback === 'correct' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                                                          'border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white'}`} 
                                                    placeholder="?" 
                                                    disabled={feedback === 'correct'} 
                                                />
                                            )}
                                            
                                            {feedback === 'correct' && <div className="absolute -right-2 -top-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce"><CheckCircle2 size={16}/></div>}
                                            {feedback === 'incorrect' && <div className="absolute -right-2 -top-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"><XCircle size={16}/></div>}
                                        </div>
                                        <button type="submit" className={`w-full py-3 rounded-xl font-black text-lg text-white transition-all border-b-4 active:translate-y-0.5 active:border-b-0
                                            ${feedback === 'correct' ? 'bg-emerald-500 border-emerald-700' : 
                                              feedback === 'incorrect' ? 'bg-rose-600 border-rose-800' : 
                                              'bg-indigo-600 border-indigo-800 shadow-lg hover:scale-[1.01]'}`}>
                                            {getSubmitLabel()}
                                        </button>
                                    </form>
                                )}
                            </div>
                            

                            {/* CLUE SOLUTION SKIP BUTTONS */}
                            <div className="mt-6 flex gap-2 justify-center">
                                <button 
                                    onClick={handleHint} 
                                    disabled={!question.clues || revealedClues.length >= question.clues.length} 
                                    className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white text-amber-500 border-2 border-amber-100 disabled:opacity-30 transition-all shadow-sm"
                                >
                                    <Zap size={12}/> {ui.btnHint}
                                </button>

                                {/* 🟢 NEW: FULL-WIDTH PERSONAL COACH TRIGGER BUTTON */}
                                <button
                                    onClick={openCoach}
                                    className="flex items-center justify-center gap-4 py-3 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer shadow-md border-b-2 border-purple-800"
                                    title={lang === 'sv' ? "Starta tavel-repris och få hjälp" : "Start interactive step guide"}
                                >
                                    {lang === 'sv' ? "Hjälp!" : "Help!"}
                                </button>

                                <button 
                                    onClick={handleSkip} 
                                    className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white text-indigo-400 border-2 border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm"
                                >
                                    Hoppa över <ChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
    
                    {/* DYNAMIC WORD PROBLEM COACHING BANNER (REFACTORED FOR DECORATOR METADATA) */}
                    <div className={`rounded-[2rem] p-4 shadow-lg border relative overflow-hidden transition-all duration-300 ${
                        !question?.metadata?.levelSupportsWordProblems 
                            ? 'bg-slate-50/60 border-slate-200/60 shadow-sm' 
                            : 'bg-white border-slate-100 shadow-md'
                    }`}>
                        {/* Vertical Accent Theme Bars Added to match the layout aesthetic of the app */}
                        <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                            !question?.metadata?.levelSupportsWordProblems 
                                ? 'bg-slate-300' 
                                : useWordProblems ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}></div>

                        {!question?.metadata?.levelSupportsWordProblems ? (
                            /* 🔒 STATE 3: Unavailable / LOCKED at this level */
                            <button 
                                type="button"
                                disabled
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl border-2 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70"
                            >
                                <Lock size={14} className="text-slate-400" />
                                {lang === 'sv' ? `Problemlösning på Nivå ${uiState.level} ej tillgänglig` : `Word problems not available on Lvl ${uiState.level}`}
                            </button>
                        ) : useWordProblems ? (
                            /* 🎯 STATE 1: Available & Active / ON */
                            <button 
                                type="button"
                                onClick={() => setUseWordProblems(false)} 
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 border-2 bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 animate-in fade-in zoom-in-95 duration-200"
                            >
                                <CheckCircle2 size={14} />
                                {lang === 'sv' ? 'Problemlösning: På' : 'Word Problems: Active'}
                            </button>
                        ) : (
                            /* 🔓 STATE 2: Available & Inactive / OFF */
                            <button 
                                type="button"
                                onClick={() => setUseWordProblems(true)} 
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 border-2 bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50/50 hover:border-indigo-300 animate-in fade-in zoom-in-95 duration-200"
                            >
                                <HelpCircle size={14} />
                                {lang === 'sv' ? 'Aktivera problemlösning' : 'Try Word Problems'}
                            </button>
                        )}
                    </div>
                    {/* ================================================================= */}
                    
                    {/* CLUE PANEL */}
                    <div className="bg-white rounded-[2rem] p-4 shadow-lg border border-slate-100 flex-1 min-h-[140px] relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${activeTheme.accent} opacity-20`}></div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-6 h-6 rounded-lg ${activeTheme.bg} flex items-center justify-center ${activeTheme.text}`}><Zap size={12}/></div>
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">{cluesLabel}</h3>
                        </div>
                        <div className="scale-95 origin-top-left">
                            <CluePanel revealedClues={revealedClues} question={question} ui={ui} isSolutionRevealed={isSolutionRevealed} lang={lang} />
                        </div>
                    </div>
                    
                    {/* --- INTEGRATED SESSION STATS & HISTORY PANEL --- */}
                    <div className="bg-white rounded-[2rem] p-5 shadow-lg border border-slate-100 flex flex-col relative overflow-hidden transition-all duration-500">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                                    <BarChart3 size={12}/>
                                </div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">
                                    {lang === 'sv' ? "Session-statistik" : "Session Stats"}
                                </h3>
                            </div>
                            {total > 0 && (
                                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                    {total} {ui.stats_attempted}
                                </span>
                            )}
                        </div>

                        {/* 1. SEGMENTED PROGRESS BAR */}
                        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex mb-6 border border-slate-50 shadow-inner">
                            {stats.correct > 0 && <div style={{ width: `${getPct(stats.correct)}%` }} className="bg-emerald-500 h-full transition-all duration-1000" title={ui.stat_correct} />}
                            {stats.help > 0 && <div style={{ width: `${getPct(stats.help)}%` }} className="bg-amber-400 h-full transition-all duration-1000" title={ui.stat_help} />}
                            {stats.wrong > 0 && <div style={{ width: `${getPct(stats.wrong)}%` }} className="bg-rose-500 h-full transition-all duration-1000" title={ui.stat_wrong} />}
                            {stats.skipped > 0 && <div style={{ width: `${getPct(stats.skipped)}%` }} className="bg-slate-400 h-full transition-all duration-1000" title={ui.stat_skip} />}
                        </div>
                        
                        {/* STREAK BANNER */}
                        <div className="bg-gradient-to-r from-orange-400 to-rose-400 p-3 rounded-2xl mb-4 flex justify-between items-center text-white shadow-md border border-orange-300">
                            <span className="text-[11px] font-black uppercase tracking-widest">{lang === 'sv' ? "Aktuell Streak" : "Current Streak"}</span>
                            <div className="flex items-center gap-1">
                                <span className="text-xl font-black leading-none">{streak}</span>
                                <span className="text-lg">🔥</span>
                            </div>
                        </div>

                        {/* 2. MAJOR STATS GRID */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                                <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-tighter mb-1">{ui.stat_correct}</span>
                                <span className="text-lg font-black text-emerald-700 leading-none">{stats.correct}</span>
                            </div>
                            <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50">
                                <span className="block text-[10px] font-black text-amber-600 uppercase tracking-tighter mb-1">{ui.stat_help}</span>
                                <span className="text-lg font-black text-amber-700 leading-none">{stats.help}</span>
                            </div>
                            <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/50">
                                <span className="block text-[10px] font-black text-rose-600 uppercase tracking-tighter mb-1">{ui.stat_wrong}</span>
                                <span className="text-lg font-black text-rose-700 leading-none">{stats.wrong}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/50">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{ui.stat_skip}</span>
                                <span className="text-lg font-black text-slate-500 leading-none">{stats.skipped}</span>
                            </div>
                        </div>

                        {/* 3. EXPANDABLE HISTORY LIST */}
                        <div className={`flex flex-col transition-all duration-500 overflow-hidden ${isHistoryExpanded ? 'flex-1' : 'h-12'}`}>
                            <button 
                                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 group mb-2 shrink-0"
                            >
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-slate-400" />
                                    <span className="text-[10px] font-black uppercase text-slate-500">{historyLabel}</span>
                                </div>
                                {isHistoryExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />}
                            </button>

                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                                {uiState.history.map((entry, idx) => {
                                    const isCorrect = entry.correct;
                                    const usedHelp = entry.clueUsed || entry.solutionUsed;
                                    const isSkipped = entry.skipped;
                                    
                                    let statusColor = "bg-rose-500";
                                    let Icon = XCircle;
                                    if (isSkipped) { statusColor = "bg-slate-300"; Icon = MinusCircle; }
                                    else if (isCorrect && !usedHelp) { statusColor = "bg-emerald-500"; Icon = CheckCircle2; }
                                    else if (isCorrect && usedHelp) { statusColor = "bg-amber-400"; Icon = HelpCircle; }

                                    return (
                                        <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100 transition-all shadow-sm">
                                            <div className={`w-1 h-6 rounded-full ${statusColor} shrink-0`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Lv {entry.level}</span>
                                                    <Icon size={10} className={statusColor.replace('bg-', 'text-')}/>
                                                </div>
                                                <div className="text-[11px] font-bold text-slate-700 font-serif leading-tight">
                                                    <MathText text={entry.text} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* DASHBOARD SVG WAVE BACKGROUND - Fixed at absolute back */}
            <div className="fixed bottom-0 left-0 w-full leading-[0] pointer-events-none z-[-1] overflow-hidden opacity-30">
                <svg className="relative block w-full h-[250px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,1.13V120H0Z" className="fill-emerald-100"></path>
                </svg>
            </div>

            {/* 🟢 NEW: MY COACH INTERACTIVE WHITEBOARD REPLAY MODAL MOUNT */}
            {isCoachOpen && (
                <MyCoachModal 
                    lang={lang} 
                    onClose={closeCoach} 
                    question={question}
                    {...coachProps} 
                />
            )}
        </div>
    );
};

export default PracticeView;