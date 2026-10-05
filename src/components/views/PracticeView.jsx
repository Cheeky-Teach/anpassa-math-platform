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
import PreferencesToggle from '../ui/PreferencesToggle';

// 🟢 CRITICAL: Import the universal theme
import '../../styles/theme.css'; 

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

    // Grabs the color string (e.g., 'emerald', 'indigo') which maps to our CSS theme classes
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
        // 🟢 1. Added !pt-4 to override any hidden padding inside layout-wrapper
        <div className={`theme-${theme.color} layout-wrapper font-sans relative z-10 animate-in fade-in pb-10 !pt-4`}>
            
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
                    <div className={`p-4 rounded-[var(--radius-card)] shadow-xl border-2 flex items-center gap-4 bg-[var(--bg-card)] ${toast.type === 'success' ? 'border-emerald-500' : 'border-amber-500'}`}>
                        <div className={`w-12 h-12 rounded-[var(--radius-btn)] flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {toast.type === 'success' ? <Trophy size={24}/> : <Zap size={24}/>}
                        </div>
                        <div>
                            <h4 className="font-black uppercase tracking-tight text-[var(--text-main)] leading-none">{toast.title}</h4>
                            <p className="text-xs font-bold text-[var(--text-muted)] mt-1">{toast.message}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 🟢 2. Reduced top padding to pt-0 to bring content flush with the header */}
            <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 pt-0">
                <div className="layout-twocol">
                    <div className="layout-main">
                        {/* LEVEL PILLS */}
                        <div className="bg-[var(--bg-card)] rounded-[var(--radius-card)] shadow-sm border border-[var(--border-main)] p-1.5 flex items-center overflow-x-auto no-scrollbar snap-x relative z-20 mb-2">
                            <div ref={scrollContainerRef} className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1 px-1">
                                {Object.entries(LEVEL_DESCRIPTIONS[uiState.topic] || {}).map(([lvl, desc]) => {
                                    const lNum = parseInt(lvl);
                                    const isActive = uiState.level === lNum;
                                    return (
                                        <button
                                            key={lvl}
                                            onClick={() => !isActive && handleChangeLevel(lNum - uiState.level)}
                                            className={`snap-center shrink-0 min-w-[120px] p-2 rounded-[var(--radius-btn)] border transition-all flex flex-col items-center gap-0.5
                                                ${isActive 
                                                    ? `active-pill bg-[var(--brand-solid)] border-transparent text-white shadow-md scale-105` 
                                                    : `bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] shadow-sm`
                                                }`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-tighter">Lvl {lNum}</span>
                                            <span className={`text-[9px] font-bold uppercase truncate w-full text-center px-1 ${isActive ? 'text-white/90' : 'text-[var(--text-muted)]'}`}>
                                                {desc[lang]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* MAIN PRACTICE CARD */}
                        {/* 🟢 REPLACED PADDING/ROUNDING STRINGS WITH .card CLASS */}
                        <main className={`card p-0 ${shake ? 'animate-shake' : ''} flex flex-col`}>
                            {loading ? (
                                <div className="py-32 text-center flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-4 border-t-transparent text-[var(--brand-text)] rounded-full animate-spin border-current"></div>
                                    <span className="text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Laddar...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col min-h-[350px]">
                                    
                                    {/* TOP SECTION: VISUAL & EQUATION (Whiteboard Protected) */}
                                    <div className="w-full min-h-[180px] sm:min-h-[240px] p-4 sm:p-6 xl:p-8 whiteboard-protect flex flex-col justify-center items-center border-b border-slate-200 relative overflow-hidden">
                                        <WordProblemVisualGuard 
                                            isActive={!!question?.metadata?.isWordProblemApplied || useWordProblems} 
                                            lang={lang}
                                            questionKey={question?.variationKey || question?.metadata?.variation_key || question?.metadata?.variationKey} 
                                            alwaysShow={!!question?.renderData?.graph || question?.renderData?.geometry?.type === 'frequency_table' || !!question?.renderData?.frequencyTable}
                                        >
                                            <div className="w-full min-h-[120px] flex flex-col justify-center items-center gap-4">
                                                <div className="w-full max-w-[400px] flex justify-center items-center mx-auto overflow-visible empty:hidden">
                                                    <VisualRenderer 
                                                        data={question?.renderData} 
                                                        isWordProblem={!!question?.metadata?.isWordProblemApplied || useWordProblems} 
                                                    />
                                                </div>

                                                {question?.renderData?.latex && !useWordProblems && !question?.metadata?.isWordProblemApplied && (
                                                    <div className="text-3xl xl:text-4xl font-serif text-[var(--primary-color)] flex justify-center items-center text-center px-4">
                                                        <MathText text={`$$${question.renderData.latex}$$`} />
                                                    </div>
                                                )}
                                            </div>
                                        </WordProblemVisualGuard>
                                        
                                        <div className="absolute top-6 left-8 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[var(--brand-solid)] animate-pulse"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">Du kan det här!</span>
                                        </div>
                                    </div>

                                    {/* BOTTOM SECTION: DESCRIPTION, INPUT & ACTIONS */}
                                    <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center bg-[var(--bg-card)] relative">
                                        <div className="mb-6 text-center max-w-2xl mx-auto">
                                            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] leading-snug">
                                                <MathText text={descriptionText} />
                                            </h2>
                                        </div>
                                        
                                        {/* Action Row Split */}
                                        <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-4 lg:gap-6 items-center md:items-stretch justify-center">
                                            
                                            {/* INPUT AREA (Left) */}
                                            <div className="w-full max-w-sm shrink-0 flex flex-col justify-end">
                                                {question?.renderData?.answerType === 'multiple_choice' ? (
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {(question?.renderData?.options || []).map((choiceItem, idx) => {
                                                            const choiceLabel = typeof choiceItem === 'object' ? choiceItem.label : choiceItem;
                                                            const choiceValue = typeof choiceItem === 'object' ? choiceItem.value : choiceItem;
                                                            
                                                            const isSelected = choiceValue === input;
                                                            const isCorrect = feedback === 'correct' && isSelected;
                                                            const isIncorrect = feedback === 'incorrect' && isSelected;
                                                            
                                                            return (
                                                                // 🟢 REPLACED WITH .btn-3d
                                                                <button 
                                                                    key={idx} 
                                                                    onClick={() => handleChoiceClick(choiceValue)} 
                                                                    className={`btn-3d w-full text-left flex items-center gap-3
                                                                        ${isCorrect ? 'is-correct' : isIncorrect ? 'is-wrong' : ''}
                                                                        ${isSelected && !isCorrect && !isIncorrect ? 'bg-[var(--brand-bg)] border-[var(--brand-text)]' : ''}`} 
                                                                    disabled={feedback === 'correct'}
                                                                >
                                                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-inner shrink-0
                                                                        ${(isCorrect || isIncorrect) ? 'bg-white/20 text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-main)]'}`}>
                                                                        {String.fromCharCode(65 + idx)}
                                                                    </span>
                                                                    <MathText text={choiceLabel} />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <form onSubmit={(e) => { e.preventDefault(); if (feedback !== 'correct') handleSubmit(e, input); else actions.retry(true); }} className="space-y-4 flex flex-col h-full justify-end">
                                                        <div className="relative group">
                                                            {/* 🟢 Custom Input Wrappers */}
                                                            {question?.renderData?.answerType === 'mixed_fraction' ? (
                                                                <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner">
                                                                    <FractionInput value={input} onChange={setInput} allowMixed={true} autoFocus={true} />
                                                                </div>
                                                            ) : question?.renderData?.answerType === 'fraction' ? (
                                                                <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner">
                                                                    <FractionInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} allowMixed={false} autoFocus={false} />
                                                                </div>
                                                            ) : question?.renderData?.answerType === 'structured_power' ? (
                                                                <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner">
                                                                    <ExponentInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} autoFocus={true} />
                                                                </div>
                                                            ) : question?.renderData?.answerType === 'structured_scientific' ? (
                                                                <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner">
                                                                    <ScientificInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} autoFocus={true} />
                                                                </div>
                                                            ) : (
                                                                <input 
                                                                    ref={inputRef} 
                                                                    type="text" 
                                                                    value={input} 
                                                                    onChange={handleInputChange} 
                                                                    autoComplete="off"
                                                                    className={`w-full p-4 text-center text-2xl font-black border-[3px] rounded-[var(--radius-btn)] outline-none shadow-inner transition-all
                                                                        ${feedback === 'incorrect' ? 'border-rose-500 bg-rose-50 text-rose-700' : 
                                                                          feedback === 'correct' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                                                                          'border-[var(--border-main)] bg-[var(--bg-surface)] focus:border-[var(--brand-text)] focus:bg-[var(--bg-card)] text-[var(--text-main)]'}`} 
                                                                    placeholder="?" 
                                                                    disabled={feedback === 'correct'} 
                                                                />
                                                            )}
                                                            
                                                            {feedback === 'correct' && <div className="absolute -right-3 -top-3 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--bg-card)] animate-bounce"><CheckCircle2 size={16}/></div>}
                                                            {feedback === 'incorrect' && <div className="absolute -right-3 -top-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--bg-card)]"><XCircle size={16}/></div>}
                                                        </div>

                                                        {/* 🟢 REPLACED WITH .btn-3d and specific background injects for Primary Button */}
                                                        <button 
                                                            type="submit" 
                                                            className={`btn-3d w-full justify-center text-lg uppercase tracking-wider
                                                                ${feedback === 'correct' ? 'is-correct' : 
                                                                  feedback === 'incorrect' ? 'is-wrong' : 
                                                                  'bg-[var(--brand-solid)] text-white border-[var(--brand-text)] hover:opacity-90'}`}
                                                        >
                                                            {getSubmitLabel()}
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                            
                                            {/* SECONDARY ACTIONS (Right Side) */}
                                            <div className="w-full md:w-40 flex flex-row md:flex-col gap-3 justify-center shrink-0 mt-2 md:mt-0">
                                                <button 
                                                    onClick={handleHint} 
                                                    disabled={!question?.clues || revealedClues.length >= question?.clues.length} 
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-[var(--radius-btn)] bg-[var(--bg-card)] text-amber-500 border border-amber-200 disabled:opacity-30 hover:bg-amber-50 transition-all shadow-sm cursor-pointer"
                                                >
                                                    <Zap size={16}/> <span className="hidden sm:inline-block">{ui.btnHint}</span>
                                                </button>

                                                <button
                                                    onClick={openCoach}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-[var(--radius-btn)] font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer shadow-md border-b-[3px] border-purple-800 active:translate-y-1 active:border-b-0"
                                                    title={lang === 'sv' ? "Starta tavel-repris och få hjälp" : "Start interactive step guide"}
                                                >
                                                    <HelpCircle size={16} />
                                                    <span className="hidden sm:inline-block">{lang === 'sv' ? "Hjälp!" : "Help!"}</span>
                                                </button>

                                                <button 
                                                    onClick={handleSkip} 
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-[var(--radius-btn)] bg-[var(--bg-card)] text-indigo-400 border border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm cursor-pointer"
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

                    {/* --- RIGHT COLUMN: SIDEBAR --- */}
                    <aside className="layout-sidebar">
                        
                        {/* TIMER INTEGRATION */}
                        {timerSettings.isActive && (
                            <div className={`card p-4 flex items-center justify-between transition-colors ${timerSettings.remaining < 60 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-main)]'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-[var(--radius-btn)] flex items-center justify-center text-white shadow-md ${timerSettings.remaining < 60 ? 'bg-rose-500 animate-pulse' : 'bg-[var(--text-main)]'}`}>
                                        <Clock size={20} />
                                    </div>
                                    <span className="font-black uppercase tracking-widest text-xs">{lang === 'sv' ? "Tid kvar" : "Time left"}</span>
                                </div>
                                <span className="text-2xl font-black font-mono tracking-tighter">{formatTime(timerSettings.remaining)}</span>
                            </div>
                        )}
        
                        {/* WORD PROBLEM COACHING BANNER */}
                        <div className={`card p-4 relative overflow-hidden transition-all duration-300 ${
                            !question?.metadata?.levelSupportsWordProblems 
                                ? 'bg-[var(--bg-surface)] opacity-80' 
                                : 'bg-[var(--bg-card)]'
                        }`}>
                            <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                                !question?.metadata?.levelSupportsWordProblems 
                                    ? 'bg-[var(--border-strong)]' 
                                    : useWordProblems ? 'bg-emerald-500' : 'bg-[var(--brand-solid)]'
                            }`}></div>

                            {!question?.metadata?.levelSupportsWordProblems ? (
                                <button disabled className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-[var(--radius-btn)] border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-muted)] cursor-not-allowed">
                                    <Lock size={14} />
                                    {lang === 'sv' ? `Text-uppgifter ej tillgängliga` : `Word problems not available`}
                                </button>
                            ) : useWordProblems ? (
                                <button onClick={() => setUseWordProblems(false)} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-[var(--radius-btn)] transition-all active:scale-95 border-2 bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer">
                                    <CheckCircle2 size={14} />
                                    {lang === 'sv' ? 'Problemlösning: På' : 'Word Problems: Active'}
                                </button>
                            ) : (
                                <button onClick={() => setUseWordProblems(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-[var(--radius-btn)] transition-all active:scale-95 border-2 bg-[var(--bg-card)] text-[var(--brand-text)] border-[var(--brand-border)] hover:bg-[var(--brand-bg)] cursor-pointer">
                                    <HelpCircle size={14} />
                                    {lang === 'sv' ? 'Aktivera problemlösning' : 'Try Word Problems'}
                                </button>
                            )}
                        </div>
                        
                        {/* CLUE PANEL */}
                        <div className="card p-4 flex-1 min-h-[140px] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--brand-solid)] opacity-20"></div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-[var(--brand-bg)] flex items-center justify-center text-[var(--brand-text)]"><Zap size={14}/></div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">{cluesLabel}</h3>
                            </div>
                            <div className="scale-95 origin-top-left w-[105%]">
                                <CluePanel revealedClues={revealedClues} question={question} ui={ui} isSolutionRevealed={isSolutionRevealed} lang={lang} />
                            </div>
                        </div>
                        
                        {/* INTEGRATED SESSION STATS & HISTORY PANEL */}
                        <div className="card p-4 flex flex-col relative overflow-hidden transition-all duration-500">
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-[var(--brand-bg)] flex items-center justify-center text-[var(--brand-text)] shadow-inner">
                                        <BarChart3 size={14}/>
                                    </div>
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">
                                        {lang === 'sv' ? "Session-statistik" : "Session Stats"}
                                    </h3>
                                </div>
                                {total > 0 && (
                                    <span className="text-[9px] font-black text-[var(--brand-text)] bg-[var(--brand-bg)] px-2 py-1 rounded-lg border border-[var(--brand-border)]">
                                        {total} {ui.stats_attempted}
                                    </span>
                                )}
                            </div>

                            {/* 1. SEGMENTED PROGRESS BAR */}
                            <div className="w-full h-3 bg-[var(--bg-surface)] rounded-full overflow-hidden flex mb-4 border border-[var(--border-subtle)] shadow-inner">
                                {stats.correct > 0 && <div style={{ width: `${getPct(stats.correct)}%` }} className="bg-emerald-500 h-full transition-all duration-1000" title={ui.stat_correct} />}
                                {stats.help > 0 && <div style={{ width: `${getPct(stats.help)}%` }} className="bg-amber-400 h-full transition-all duration-1000" title={ui.stat_help} />}
                                {stats.wrong > 0 && <div style={{ width: `${getPct(stats.wrong)}%` }} className="bg-rose-500 h-full transition-all duration-1000" title={ui.stat_wrong} />}
                                {stats.skipped > 0 && <div style={{ width: `${getPct(stats.skipped)}%` }} className="bg-slate-400 h-full transition-all duration-1000" title={ui.stat_skip} />}
                            </div>
                            
                            {/* STREAK BANNER */}
                            <div className="bg-gradient-to-r from-orange-400 to-rose-400 p-3 rounded-[var(--radius-btn)] mb-4 flex justify-between items-center text-white shadow-md border border-orange-300">
                                <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'sv' ? "Streak" : "Current Streak"}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xl font-black leading-none">{streak}</span>
                                    <span className="text-lg">🔥</span>
                                </div>
                            </div>

                            {/* 2. MAJOR STATS GRID */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-emerald-50/50 p-3 rounded-[var(--radius-btn)] border border-emerald-100/50">
                                    <span className="block text-[9px] font-black text-emerald-600 uppercase tracking-tighter mb-1">{ui.stat_correct}</span>
                                    <span className="text-xl font-black text-emerald-700 leading-none">{stats.correct}</span>
                                </div>
                                <div className="bg-amber-50/50 p-3 rounded-[var(--radius-btn)] border border-amber-100/50">
                                    <span className="block text-[9px] font-black text-amber-600 uppercase tracking-tighter mb-1">{ui.stat_help}</span>
                                    <span className="text-xl font-black text-amber-700 leading-none">{stats.help}</span>
                                </div>
                                <div className="bg-rose-50/50 p-3 rounded-[var(--radius-btn)] border border-rose-100/50">
                                    <span className="block text-[9px] font-black text-rose-600 uppercase tracking-tighter mb-1">{ui.stat_wrong}</span>
                                    <span className="text-xl font-black text-rose-700 leading-none">{stats.wrong}</span>
                                </div>
                                <div className="bg-[var(--bg-surface)] p-3 rounded-[var(--radius-btn)] border border-[var(--border-subtle)]">
                                    <span className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tighter mb-1">{ui.stat_skip}</span>
                                    <span className="text-xl font-black text-[var(--text-main)] opacity-70 leading-none">{stats.skipped}</span>
                                </div>
                            </div>

                            {/* 3. EXPANDABLE HISTORY LIST */}
                            <div className={`flex flex-col transition-all duration-500 overflow-hidden ${isHistoryExpanded ? 'flex-1' : 'h-[36px]'}`}>
                                <button 
                                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                                    className="w-full flex items-center justify-between p-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] rounded-[var(--radius-btn)] transition-all border border-[var(--border-main)] group mb-2 shrink-0 cursor-pointer text-[var(--text-main)]"
                                >
                                    <div className="flex items-center gap-2 pl-1">
                                        <Clock size={14} className="text-[var(--text-muted)]" />
                                        <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">{historyLabel}</span>
                                    </div>
                                    {isHistoryExpanded ? <ChevronDown size={14} className="text-[var(--text-muted)]" /> : <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />}
                                </button>

                                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 pr-1 max-h-60">
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
                                            <div key={idx} className="flex items-center gap-2.5 bg-[var(--bg-card)] p-2.5 rounded-[var(--radius-btn)] border border-[var(--border-main)] transition-all shadow-sm">
                                                <div className={`w-1 h-6 rounded-full ${statusColor} shrink-0`}></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Lv {entry.level}</span>
                                                        <Icon size={10} className={statusColor.replace('bg-', 'text-')}/>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-[var(--text-main)] font-serif leading-tight">
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