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
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false); 
    const retryRef = useRef(actions.retry);

    const { isOpen: isCoachOpen, openCoach, closeCoach, coachProps } = useMyCoach(question, lang);

    const cluesLabel = ui.hintsTitle || (lang === 'sv' ? "Ledtrådar" : "Hints");
    const historyLabel = ui.historyTitle || (lang === 'sv' ? "Historik" : "History");

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

    const total = uiState.history.length;
    const stats = {
        skipped: uiState.history.filter(h => h.skipped).length,
        wrong: uiState.history.filter(h => !h.correct && !h.skipped).length,
        help: uiState.history.filter(h => h.correct && (h.clueUsed || h.solutionUsed)).length,
        correct: uiState.history.filter(h => h.correct && !h.clueUsed && !h.solutionUsed).length
    };
    
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

    useEffect(() => {
        if (!question?.metadata?.levelSupportsWordProblems) {
            setUseWordProblems(false);
        }
    }, [question?.variationKey, question?.metadata?.levelSupportsWordProblems]);

    const descriptionText = typeof question?.renderData?.description === 'object' ? question.renderData.description[lang] : question?.renderData?.description;
    
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
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 py-6 fade-in min-h-screen pb-10 relative z-10 font-sans">
            
            <LevelUpModal 
                visible={levelUpAvailable} 
                lang={lang} 
                supportsWordProblems={question?.metadata?.levelSupportsWordProblems && !useWordProblems}
                onNext={() => { handleChangeLevel(1); setLevelUpAvailable(false); setUseWordProblems(false);}} 
                onStay={() => { setLevelUpAvailable(false); actions.retry(true); }} 
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

            {/* HEADER */}
            {/* 🟢 FIXED: Reduced bottom margin from mb-6 to mb-4 */}
            <header className="flex justify-between items-center mb-4 px-2">
                <button onClick={actions.goBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-black text-xs uppercase tracking-widest transition-all group">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 group-hover:shadow-md"><ChevronLeft size={16}/></div>
                    <span className="hidden sm:inline-block">{ui.backBtn || "Tillbaka"}</span>
                </button>

                <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${activeTheme.text} opacity-60`}>
                        {theme.categoryLabel}
                    </span>
                    {/* 🟢 FIXED: Changed text-xl to text-lg to thin out the title */}
                    <h1 className="text-lg font-black uppercase tracking-tighter text-slate-900 italic leading-none">
                        {theme.topicLabel}
                    </h1>
                </div>

                <div className="w-24"></div> 
            </header>

            {/* COMMAND CENTER LAYOUT - Triggering xl:flex-row for standard laptop protection */}
            <div className="flex flex-col xl:flex-row gap-6 items-start relative z-10">
                
                {/* --- LEFT COLUMN: MAIN WORKSPACE (70%) --- */}
                <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
                    
                    {/* LEVEL PILLS */}
                    <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 p-1.5 flex items-center overflow-x-auto no-scrollbar snap-x sticky top-2 z-20">
                        <div ref={scrollContainerRef} className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1 px-1">
                            {Object.entries(LEVEL_DESCRIPTIONS[uiState.topic] || {}).map(([lvl, desc]) => {
                                const lNum = parseInt(lvl);
                                const isActive = uiState.level === lNum;
                                return (
                                    <button
                                        key={lvl}
                                        onClick={() => !isActive && handleChangeLevel(lNum - uiState.level)}
                                        className={`snap-center shrink-0 min-w-[120px] p-2 rounded-xl border transition-all flex flex-col items-center gap-0.5
                                            ${isActive 
                                                ? `active-pill ${activeTheme.accent} border-transparent text-white shadow-md scale-105` 
                                                : `bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-200 shadow-sm`
                                            }`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Lvl {lNum}</span>
                                        <span className={`text-[9px] font-bold uppercase truncate w-full text-center px-1 ${isActive ? 'text-white/90' : 'text-slate-500'}`}>
                                            {desc[lang]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* MAIN PRACTICE CARD (Centered Theater Layout) */}
                    <main className={`w-full bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 ${shake ? 'animate-shake' : ''} flex flex-col`}>
                        {loading ? (
                            <div className="py-32 text-center flex flex-col items-center gap-4">
                                <div className={`w-10 h-10 border-4 border-t-transparent ${activeTheme.text} rounded-full animate-spin border-current`}></div>
                                <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Laddar...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col min-h-[350px]">
                                
                                {/* TOP SECTION: VISUAL & EQUATION */}
                                <div className="w-full min-h-[180px] sm:min-h-[240px] p-4 sm:p-6 xl:p-8 bg-slate-50/50 flex flex-col justify-center items-center border-b border-slate-100 relative overflow-hidden">
                                    <WordProblemVisualGuard 
                                        isActive={!!question?.metadata?.isWordProblemApplied || useWordProblems} 
                                        lang={lang}
                                        questionKey={question?.variationKey || question?.metadata?.variation_key || question?.metadata?.variationKey} 
                                        alwaysShow={!!question?.renderData?.graph || question?.renderData?.geometry?.type === 'frequency_table' || !!question?.renderData?.frequencyTable}
                                    >
                                        {/* 🟢 FIXED: Added min-h-[120px] here so the guard placeholder has guaranteed vertical breathing room */}
                                        <div className="w-full min-h-[120px] flex flex-col justify-center items-center gap-4">
                                            
                                            <div className="w-full max-w-[400px] flex justify-center items-center mx-auto overflow-visible empty:hidden">
                                                <VisualRenderer 
                                                    data={question?.renderData} 
                                                    isWordProblem={!!question?.metadata?.isWordProblemApplied || useWordProblems} 
                                                />
                                            </div>

                                            {question?.renderData?.latex && !useWordProblems && !question?.metadata?.isWordProblemApplied && (
                                                <div className="text-3xl xl:text-4xl font-serif text-indigo-600 flex justify-center items-center text-center px-4">
                                                    <MathText text={`$$${question.renderData.latex}$$`} />
                                                </div>
                                            )}

                                        </div>
                                    </WordProblemVisualGuard>
                                    
                                    <div className="absolute top-6 left-8 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${activeTheme.accent} animate-pulse`}></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Du kan det här!</span>
                                    </div>
                                </div>

                                {/* BOTTOM SECTION: DESCRIPTION, INPUT & ACTIONS */}
                                {/* 🟢 FIXED: Reduced padding from p-6 xl:p-12 to p-4 sm:p-6 */}
                                <div className="w-full p-4 sm:p-6 flex flex-col justify-center bg-white relative">
                                    {/* 🟢 FIXED: Reduced mb-8 to mb-4 */}
                                    <div className="mb-4 text-center max-w-2xl mx-auto">
                                        {/* 🟢 FIXED: Reduced text size from text-xl/2xl to text-lg/xl */}
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
                                            <MathText text={descriptionText} />
                                        </h2>
                                    </div>
                                    
                                    {/* Action Row Split: Input vs Utilities */}
                                    {/* 🟢 FIXED: Reduced gap from gap-6 lg:gap-8 to gap-4 lg:gap-6 */}
                                    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-4 lg:gap-6 items-center md:items-stretch justify-center">
                                        
                                        {/* INPUT AREA (Left) */}
                                        <div className="w-full max-w-sm shrink-0 flex flex-col justify-end">
                                            {question?.renderData?.answerType === 'multiple_choice' ? (
                                                <div className="grid grid-cols-1 gap-2.5">
                                                    {(question?.renderData?.options || []).map((choiceItem, idx) => {
                                                        // 🟢 NEW: Dynamically support both plain strings and { label, value } objects
                                                        const choiceLabel = typeof choiceItem === 'object' ? choiceItem.label : choiceItem;
                                                        const choiceValue = typeof choiceItem === 'object' ? choiceItem.value : choiceItem;
                                                        
                                                        const isSelected = choiceValue === input;
                                                        const isCorrect = feedback === 'correct' && isSelected;
                                                        const isIncorrect = feedback === 'incorrect' && isSelected;
                                                        return (
                                                            <button 
                                                                key={idx} 
                                                                onClick={() => handleChoiceClick(choiceValue)} 
                                                                className={`p-3 rounded-xl font-bold text-sm transition-all border-b-[3px] text-left flex items-center gap-3 active:translate-y-0.5 active:border-b-0
                                                                    ${isCorrect ? 'bg-emerald-500 border-emerald-700 text-white shadow-md' : 
                                                                      isIncorrect ? 'bg-rose-500 border-rose-700 text-white animate-shake' : 
                                                                      'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-indigo-400 hover:shadow-md'}`} 
                                                                disabled={feedback === 'correct'}
                                                            >
                                                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-inner
                                                                    ${(isCorrect || isIncorrect) ? 'bg-white/20 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                                                    {String.fromCharCode(65 + idx)}
                                                                </span>
                                                                <MathText text={choiceLabel} />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <form onSubmit={(e) => { e.preventDefault(); if (feedback !== 'correct') handleSubmit(e, input); else actions.retry(true); }} className="space-y-3 flex flex-col h-full justify-end">
                                                    <div className="relative group">
                                                        {/* 🟢 FIXED: Reduced vertical padding (py-3) on custom inputs */}
                                                        {question?.renderData?.answerType === 'mixed_fraction' ? (
                                                            <div className="flex justify-center py-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 shadow-inner">
                                                                <FractionInput value={input} onChange={setInput} allowMixed={true} autoFocus={true} />
                                                            </div>
                                                        ) : question?.renderData?.answerType === 'fraction' ? (
                                                            <div className="flex justify-center py-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 shadow-inner">
                                                                <FractionInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} allowMixed={false} autoFocus={false} />
                                                            </div>
                                                        ) : question?.renderData?.answerType === 'structured_power' ? (
                                                            <div className="flex justify-center py-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 shadow-inner">
                                                                <ExponentInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} autoFocus={true} />
                                                            </div>
                                                        ) : question?.renderData?.answerType === 'structured_scientific' ? (
                                                            <div className="flex justify-center py-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 shadow-inner">
                                                                <ScientificInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} autoFocus={true} />
                                                            </div>
                                                        ) : (
                                                            // 🟢 FIXED: Reduced padding (p-3), text size (text-2xl), and border thickness (border-[3px])
                                                            <input 
                                                                ref={inputRef} 
                                                                type="text" 
                                                                value={input} 
                                                                onChange={handleInputChange} 
                                                                autoComplete="off"
                                                                className={`w-full p-3 text-center text-2xl font-black border-[3px] rounded-xl outline-none shadow-inner transition-all
                                                                    ${feedback === 'incorrect' ? 'border-rose-500 bg-rose-50 text-rose-700' : 
                                                                      feedback === 'correct' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                                                                      'border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white'}`} 
                                                                placeholder="?" 
                                                                disabled={feedback === 'correct'} 
                                                            />
                                                        )}
                                                        
                                                        {feedback === 'correct' && <div className="absolute -right-3 -top-3 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce"><CheckCircle2 size={16}/></div>}
                                                        {feedback === 'incorrect' && <div className="absolute -right-3 -top-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"><XCircle size={16}/></div>}
                                                    </div>
                                                    {/* 🟢 FIXED: Reduced padding (py-3) and text size (text-lg) on Submit button */}
                                                    <button type="submit" className={`w-full py-3 rounded-xl font-black text-lg text-white transition-all border-b-[3px] shadow-lg active:translate-y-1 active:border-b-0
                                                        ${feedback === 'correct' ? 'bg-emerald-500 border-emerald-700 hover:bg-emerald-400' : 
                                                          feedback === 'incorrect' ? 'bg-rose-600 border-rose-800 hover:bg-rose-500' : 
                                                          'bg-indigo-600 border-indigo-800 hover:bg-indigo-500'}`}>
                                                        {getSubmitLabel()}
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                        
                                        {/* SECONDARY ACTIONS (Right Side) */}
                                        <div className="w-full md:w-40 flex flex-row md:flex-col gap-3 justify-center shrink-0 mt-2 md:mt-0">
                                            {/* 🟢 FIXED: Reduced padding (py-2.5) and text size (text-[11px]) on action buttons */}
                                            <button 
                                                onClick={handleHint} 
                                                disabled={!question?.clues || revealedClues.length >= question?.clues.length} 
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-lg bg-white text-amber-500 border-2 border-amber-100 disabled:opacity-30 hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm cursor-pointer"
                                            >
                                                <Zap size={16}/> <span className="hidden sm:inline-block">{ui.btnHint}</span>
                                            </button>

                                            <button
                                                onClick={openCoach}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer shadow-md border-b-[3px] border-purple-800 active:translate-y-1 active:border-b-0"
                                                title={lang === 'sv' ? "Starta tavel-repris och få hjälp" : "Start interactive step guide"}
                                            >
                                                <HelpCircle size={16} />
                                                <span className="hidden sm:inline-block">{lang === 'sv' ? "Hjälp!" : "Help!"}</span>
                                            </button>

                                            <button 
                                                onClick={handleSkip} 
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-lg bg-white text-indigo-400 border-2 border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm cursor-pointer"
                                            >
                                                <span className="hidden sm:inline-block">Hoppa över</span> <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* --- RIGHT COLUMN: SIDEBAR (30%) --- */}
                {/* Changed to xl:w-[340px] for Breakpoint Protection */}
                <aside className="w-full xl:w-[340px] shrink-0 flex flex-col gap-6">
                    
                    {/* TIMER INTEGRATION */}
                    {timerSettings.isActive && (
                        <div className={`p-5 rounded-[2rem] border-2 shadow-sm flex items-center justify-between transition-colors ${timerSettings.remaining < 60 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${timerSettings.remaining < 60 ? 'bg-rose-500 animate-pulse' : 'bg-slate-800'}`}>
                                    <Clock size={24} />
                                </div>
                                <span className="font-black uppercase tracking-widest text-xs">{lang === 'sv' ? "Tid kvar" : "Time left"}</span>
                            </div>
                            <span className="text-3xl font-black font-mono tracking-tighter">{formatTime(timerSettings.remaining)}</span>
                        </div>
                    )}
    
                    {/* WORD PROBLEM COACHING BANNER */}
                    <div className={`rounded-[2rem] p-5 shadow-lg border relative overflow-hidden transition-all duration-300 ${
                        !question?.metadata?.levelSupportsWordProblems 
                            ? 'bg-slate-50/60 border-slate-200/60 shadow-sm' 
                            : 'bg-white border-slate-100 shadow-md'
                    }`}>
                        <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${
                            !question?.metadata?.levelSupportsWordProblems 
                                ? 'bg-slate-300' 
                                : useWordProblems ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}></div>

                        {!question?.metadata?.levelSupportsWordProblems ? (
                            <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl border-2 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70">
                                <Lock size={16} className="text-slate-400" />
                                {lang === 'sv' ? `Text-uppgifter ej tillgängliga` : `Word problems not available`}
                            </button>
                        ) : useWordProblems ? (
                            <button onClick={() => setUseWordProblems(false)} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 border-2 bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 cursor-pointer">
                                <CheckCircle2 size={16} />
                                {lang === 'sv' ? 'Problemlösning: På' : 'Word Problems: Active'}
                            </button>
                        ) : (
                            <button onClick={() => setUseWordProblems(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 border-2 bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50/50 hover:border-indigo-300 cursor-pointer">
                                <HelpCircle size={16} />
                                {lang === 'sv' ? 'Aktivera problemlösning' : 'Try Word Problems'}
                            </button>
                        )}
                    </div>
                    
                    {/* CLUE PANEL */}
                    <div className="bg-white rounded-[2rem] p-5 shadow-lg border border-slate-100 flex-1 min-h-[160px] relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${activeTheme.accent} opacity-20`}></div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`w-8 h-8 rounded-lg ${activeTheme.bg} flex items-center justify-center ${activeTheme.text}`}><Zap size={16}/></div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">{cluesLabel}</h3>
                        </div>
                        <div className="scale-95 origin-top-left w-[105%]">
                            <CluePanel revealedClues={revealedClues} question={question} ui={ui} isSolutionRevealed={isSolutionRevealed} lang={lang} />
                        </div>
                    </div>
                    
                    {/* INTEGRATED SESSION STATS & HISTORY PANEL */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-100 flex flex-col relative overflow-hidden transition-all duration-500">
                        <div className="flex items-center justify-between mb-5 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                                    <BarChart3 size={16}/>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">
                                    {lang === 'sv' ? "Session-statistik" : "Session Stats"}
                                </h3>
                            </div>
                            {total > 0 && (
                                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
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
                        <div className="bg-gradient-to-r from-orange-400 to-rose-400 p-4 rounded-2xl mb-5 flex justify-between items-center text-white shadow-md border border-orange-300">
                            <span className="text-xs font-black uppercase tracking-widest">{lang === 'sv' ? "Aktuell Streak" : "Current Streak"}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-2xl font-black leading-none">{streak}</span>
                                <span className="text-xl">🔥</span>
                            </div>
                        </div>

                        {/* 2. MAJOR STATS GRID */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                                <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-tighter mb-1">{ui.stat_correct}</span>
                                <span className="text-2xl font-black text-emerald-700 leading-none">{stats.correct}</span>
                            </div>
                            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                                <span className="block text-[10px] font-black text-amber-600 uppercase tracking-tighter mb-1">{ui.stat_help}</span>
                                <span className="text-2xl font-black text-amber-700 leading-none">{stats.help}</span>
                            </div>
                            <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50">
                                <span className="block text-[10px] font-black text-rose-600 uppercase tracking-tighter mb-1">{ui.stat_wrong}</span>
                                <span className="text-2xl font-black text-rose-700 leading-none">{stats.wrong}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{ui.stat_skip}</span>
                                <span className="text-2xl font-black text-slate-500 leading-none">{stats.skipped}</span>
                            </div>
                        </div>

                        {/* 3. EXPANDABLE HISTORY LIST */}
                        <div className={`flex flex-col transition-all duration-500 overflow-hidden ${isHistoryExpanded ? 'flex-1' : 'h-[52px]'}`}>
                            <button 
                                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 group mb-3 shrink-0 cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-slate-400" />
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{historyLabel}</span>
                                </div>
                                {isHistoryExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />}
                            </button>

                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 max-h-64">
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
                                        <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 transition-all shadow-sm">
                                            <div className={`w-1.5 h-8 rounded-full ${statusColor} shrink-0`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lv {entry.level}</span>
                                                    <Icon size={12} className={statusColor.replace('bg-', 'text-')}/>
                                                </div>
                                                <div className="text-xs font-bold text-slate-700 font-serif leading-tight">
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

            {/* DASHBOARD SVG WAVE BACKGROUND */}
            <div className="fixed bottom-0 left-0 w-full leading-[0] pointer-events-none z-[-1] overflow-hidden opacity-30">
                <svg className="relative block w-full h-[250px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,1.13V120H0Z" className="fill-emerald-100"></path>
                </svg>
            </div>

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