import React, { useState, useEffect, useRef, useMemo } from 'react';
import MathText from '../ui/MathText';
import VisualRenderer from '../visuals/VisualRenderer';
import CluePanel from '../practice/CluePanel';
import HistoryList from '../practice/HistoryList';
import { useMyCoach } from '../../hooks/useMyCoach';
import MyCoachModal from '../modals/MyCoachModal';
import LevelUpModal from '../modals/LevelUpModal';
import { LEVEL_DESCRIPTIONS, CATEGORIES } from '../../constants/localization'; 
import { SKILL_GRAPH } from '../../constants/skillGraph';
import { FractionInput, ScientificInput, ExponentInput } from '../ui/InputComponents';
import { ChevronLeft, Trophy, Zap, Clock, Info, CheckCircle2, XCircle, HelpCircle, MinusCircle, ChevronRight, BarChart3, ChevronDown, Lock, Play, Compass, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import WordProblemVisualGuard from '../ui/WordProblemVisualGuard';
import PreferencesToggle from '../ui/PreferencesToggle';
import { isLevelWordProblemReady } from '../../constants/skillBuckets.js';
import SmartMathInput from '../ui/SmartMathInput.jsx'
import { syncProgress } from '../../lib/progressSync';

// CRITICAL: Import the universal theme
import '../../styles/theme.css'; 

// =========================================================================
// INTERNAL SUB-COMPONENT: PRACTICE CONTEXT HEADER
// =========================================================================
function PracticeContextHeader({
    lang, uiState, activeBucket, isDetourActive, onLevelSelect, onBackToRoadmap,
    LEVEL_DESCRIPTIONS
}) {
    const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);

    const categoryContext = useMemo(() => {
        const catKey = Object.keys(CATEGORIES).find(key => 
            CATEGORIES[key].topics.some(t => t.id === uiState.topic)
        );
        const category = CATEGORIES[catKey] || CATEGORIES.arithmetic;
        const topicData = category.topics.find(t => t.id === uiState.topic);
        return {
            color: category.color || 'indigo',
            categoryLabel: category.label[lang] || category.label.sv,
            topicLabel: topicData?.label?.[lang] || topicData?.label?.sv || uiState.topic
        };
    }, [uiState.topic, lang]);

    const availableLevels = useMemo(() => {
        return Object.keys(LEVEL_DESCRIPTIONS[uiState.topic] || {})
            .map(Number)
            .sort((a, b) => a - b);
    }, [uiState.topic, LEVEL_DESCRIPTIONS]);

    const currentLevelDesc = LEVEL_DESCRIPTIONS[uiState.topic]?.[uiState.level]?.[lang] 
        || LEVEL_DESCRIPTIONS[uiState.topic]?.[uiState.level]?.sv 
        || "";

    return (
        <div className="space-y-3 mb-4">
            {/* Top Bar Context Header */}
            <div className="card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Left: Breadcrumb & Interactive Title Dropdown */}
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-[var(--radius-btn)] bg-[var(--brand-bg)] text-[var(--brand-text)] border border-[var(--brand-border)] flex items-center justify-center shrink-0 shadow-2xs">
                        <Compass size={20} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-text)]">
                                {categoryContext.categoryLabel}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">•</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                {categoryContext.topicLabel}
                            </span>
                        </div>

                        {/* Interactive Level Selector Title */}
                        {activeBucket && activeBucket !== 'FREE_PLAY' ? (
                            <h2 className="text-base sm:text-lg font-black text-[var(--text-main)] truncate leading-snug">
                                {lang === 'sv' ? `Nivå ${uiState.level}` : `Level ${uiState.level}`} — {currentLevelDesc}
                            </h2>
                        ) : (
                            <div className="relative inline-block mt-0.5">
                                <button
                                    type="button"
                                    onClick={() => setIsLevelMenuOpen(!isLevelMenuOpen)}
                                    className="group mt-1 px-3.5 py-1.5 rounded-[var(--radius-btn)] bg-[var(--brand-bg)] hover:bg-[var(--brand-solid)] border border-[var(--brand-border)] hover:border-[var(--brand-solid)] text-[var(--brand-text)] hover:text-white transition-all flex items-center gap-2.5 cursor-pointer shadow-2xs text-left"
                                    title={lang === 'sv' ? "Klicka för att byta nivå" : "Click to change level"}
                                >
                                    <span className="font-black text-xs sm:text-sm uppercase tracking-tight">
                                        {lang === 'sv' ? `Nivå ${uiState.level}` : `Level ${uiState.level}`} — {currentLevelDesc}
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--brand-text)] group-hover:bg-white group-hover:text-[var(--brand-solid)] text-[10px] font-black uppercase tracking-wider shrink-0 transition-colors shadow-2xs">
                                        <span>{lang === 'sv' ? "Byt nivå" : "Change"}</span>
                                        <ChevronDown size={12} className={`transition-transform shrink-0 ${isLevelMenuOpen ? 'rotate-180' : ''}`} />
                                    </span>
                                </button>

                                {/* Dropdown Level Menu */}
                                {isLevelMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-20" onClick={() => setIsLevelMenuOpen(false)} />
                                        <div className="absolute left-0 top-full mt-2 z-30 w-80 bg-[var(--bg-card)] border-2 border-[var(--brand-solid)] rounded-[var(--radius-card)] shadow-2xl max-h-80 overflow-y-auto custom-scrollbar divide-y divide-[var(--border-main)] animate-in fade-in slide-in-from-top-1 duration-150">
                                            {availableLevels.map(lvl => {
                                                const isSelected = uiState.level === lvl;
                                                const descObj = LEVEL_DESCRIPTIONS[uiState.topic]?.[lvl];
                                                const dText = typeof descObj === 'object' ? (descObj[lang] || descObj.sv) : descObj;

                                                return (
                                                    <button
                                                        key={lvl}
                                                        type="button"
                                                        onClick={() => {
                                                            onLevelSelect(lvl);
                                                            setIsLevelMenuOpen(false);
                                                        }}
                                                        className={`w-full text-left p-3 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                                                            isSelected ? 'bg-[var(--brand-bg)]' : 'hover:bg-[var(--bg-surface)]'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className={`px-2 py-0.5 rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-wider shrink-0 ${
                                                                isSelected ? 'bg-[var(--brand-solid)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)]'
                                                            }`}>
                                                                {lang === 'sv' ? `Nivå ${lvl}` : `Lvl ${lvl}`}
                                                            </span>
                                                            <span className="text-xs font-bold text-[var(--text-main)] truncate">
                                                                {dText}
                                                            </span>
                                                        </div>
                                                        {isSelected && <CheckCircle2 size={14} className="text-[var(--brand-text)] shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Goldilocks Buttons ("För svårt / För lätt") OR Curated Unit Roadmap Return */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {activeBucket && activeBucket !== 'FREE_PLAY' ? (
                        <button
                            type="button"
                            onClick={onBackToRoadmap}
                            className="px-4 py-2.5 rounded-[var(--radius-btn)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                        >
                            <ChevronLeft size={16} />
                            <span>{lang === 'sv' ? `Tillbaka till ${activeBucket.name}` : `Back to Roadmap`}</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={uiState.level <= 1}
                                onClick={() => onLevelSelect(uiState.level - 1)}
                                className="px-3.5 py-2 rounded-[var(--radius-btn)] bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                                title={lang === 'sv' ? "Byt till en enklare nivå" : "Switch to easier level"}
                            >
                                <ArrowLeft size={13} />
                                <span>{lang === 'sv' ? "För svårt?" : "Too hard?"}</span>
                            </button>

                            <button
                                type="button"
                                disabled={uiState.level >= availableLevels.length}
                                onClick={() => onLevelSelect(uiState.level + 1)}
                                className="px-3.5 py-2 rounded-[var(--radius-btn)] bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                                title={lang === 'sv' ? "Byt till en svårare nivå" : "Switch to harder level"}
                            >
                                <span>{lang === 'sv' ? "För lätt?" : "Too easy?"}</span>
                                <ArrowRight size={13} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Detour Banner */}
            {isDetourActive && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 rounded-[var(--radius-card)] px-4 py-3 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-amber-950 dark:text-amber-100">
                        <Zap className="text-amber-600 fill-amber-600 animate-pulse shrink-0" size={18} />
                        <span>
                            {lang === 'sv' ? "Uppvärmning (Detour) för att stärka grunderna." : "Warm-up practice to reinforce fundamentals."}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

// =========================================================================
// INTERNAL SUB-COMPONENT: PRACTICE STREAMLINED SIDEBAR
// =========================================================================
function PracticeSidebar({
    lang, ui, timerSettings, formatTime, isCurrentLevelWordProblemReady,
    useWordProblems, onToggleWordProblems, revealedClues, question,
    isSolutionRevealed, streak, uiState, isHistoryExpanded, setIsHistoryExpanded
}) {
    const cluesLabel = ui.hintsTitle || (lang === 'sv' ? "Ledtrådar" : "Hints");
    const historyLabel = ui.historyTitle || (lang === 'sv' ? "Historik" : "History");

    const total = uiState.history.length;
    const stats = useMemo(() => ({
        skipped: uiState.history.filter(h => h.skipped).length,
        wrong: uiState.history.filter(h => !h.correct && !h.skipped).length,
        help: uiState.history.filter(h => h.correct && (h.clueUsed || h.solutionUsed)).length,
        correct: uiState.history.filter(h => h.correct && !h.clueUsed && !h.solutionUsed).length
    }), [uiState.history]);

    const getPct = (val) => total > 0 ? (val / total) * 100 : 0;

    return (
        <aside className="layout-sidebar space-y-4">
            
            {/* CARD 1: SUPPORT & TOOLS */}
            <div className="card p-5 space-y-4 border border-[var(--border-main)]">
                {timerSettings.isActive && (
                    <div className={`p-3.5 rounded-[var(--radius-btn)] flex items-center justify-between transition-colors border ${
                        timerSettings.remaining < 60 
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-600 dark:text-rose-300' 
                            : 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-main)]'
                    }`}>
                        <div className="flex items-center gap-2.5">
                            <Clock size={18} className={timerSettings.remaining < 60 ? 'animate-pulse text-rose-500' : 'text-emerald-600'} />
                            <span className="font-black uppercase tracking-widest text-[11px]">
                                {lang === 'sv' ? "Tid kvar" : "Time left"}
                            </span>
                        </div>
                        <span className="text-xl font-black font-mono tracking-tighter">
                            {formatTime(timerSettings.remaining)}
                        </span>
                    </div>
                )}

                {/* WORD PROBLEM COACHING BANNER & TOGGLE */}
                <div className={`p-3.5 rounded-[var(--radius-card)] relative overflow-hidden transition-all duration-300 border ${
                    !isCurrentLevelWordProblemReady 
                        ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)] opacity-70' 
                        : useWordProblems 
                            ? 'bg-[var(--brand-bg)] border-[var(--brand-border)] text-[var(--brand-text)]' 
                            : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-main)]'
                }`}>
                    {!isCurrentLevelWordProblemReady ? (
                        <button disabled className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-[var(--radius-btn)] text-[var(--text-muted)] cursor-not-allowed">
                            <Lock size={14} />
                            {lang === 'sv' ? "Textuppgifter ej tillgängliga" : "Word problems not available"}
                        </button>
                    ) : (
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-main)] block truncate">
                                    {lang === 'sv' ? "Problemlösning" : "Word Problems"}
                                </span>
                                <span className="text-[10px] font-semibold text-[var(--text-muted)] block truncate">
                                    {lang === 'sv' ? "Träna med textkontext" : "Practice with text context"}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => onToggleWordProblems(!useWordProblems)}
                                className={`px-3 py-2 rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-2xs shrink-0 ${
                                    useWordProblems
                                        ? 'bg-[var(--brand-solid)] text-white'
                                        : 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]'
                                }`}
                            >
                                {useWordProblems ? (lang === 'sv' ? "Aktiv ✓" : "Active ✓") : (lang === 'sv' ? "Aktivera" : "Enable")}
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[var(--radius-btn)] bg-[var(--brand-bg)] flex items-center justify-center text-[var(--brand-text)] shrink-0">
                            <Zap size={13} />
                        </div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">
                            {cluesLabel}
                        </h3>
                    </div>
                    <div className="text-xs text-[var(--text-main)] [&_*]:text-[var(--text-main)]">
                        <CluePanel 
                            revealedClues={revealedClues} 
                            question={question} 
                            ui={ui} 
                            isSolutionRevealed={isSolutionRevealed} 
                            lang={lang} 
                        />
                    </div>
                </div>
            </div>

            {/* CARD 2: PROGRESS & HISTORY */}
            <div className="card p-5 space-y-4 border border-[var(--border-main)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[var(--radius-btn)] bg-[var(--brand-bg)] flex items-center justify-center text-[var(--brand-text)] shadow-2xs">
                            <BarChart3 size={13} />
                        </div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">
                            {lang === 'sv' ? "Session-statistik" : "Session Stats"}
                        </h3>
                    </div>
                    {total > 0 && (
                        <span className="text-[10px] font-black text-[var(--brand-text)] bg-[var(--brand-bg)] px-2 py-0.5 rounded-md border border-[var(--brand-border)]">
                            {total} {ui.stats_attempted || "st"}
                        </span>
                    )}
                </div>

                <div className="w-full h-2.5 bg-[var(--bg-surface)] rounded-full overflow-hidden flex border border-[var(--border-subtle)] shadow-inner">
                    {stats.correct > 0 && <div style={{ width: `${getPct(stats.correct)}%` }} className="bg-emerald-500 h-full transition-all duration-500" title={ui.stat_correct} />}
                    {stats.help > 0 && <div style={{ width: `${getPct(stats.help)}%` }} className="bg-amber-400 h-full transition-all duration-500" title={ui.stat_help} />}
                    {stats.wrong > 0 && <div style={{ width: `${getPct(stats.wrong)}%` }} className="bg-rose-500 h-full transition-all duration-500" title={ui.stat_wrong} />}
                    {stats.skipped > 0 && <div style={{ width: `${getPct(stats.skipped)}%` }} className="bg-slate-400 h-full transition-all duration-500" title={ui.stat_skip} />}
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-3 rounded-[var(--radius-btn)] flex justify-between items-center text-white shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'sv' ? "Streak" : "Streak"}</span>
                    <div className="flex items-center gap-1.5 font-black text-base">
                        <span>{streak}</span>
                        <span>🔥</span>
                    </div>
                </div>

                <div className={`flex flex-col transition-all duration-300 overflow-hidden ${isHistoryExpanded ? 'flex-1' : 'h-[36px]'}`}>
                    <button 
                        type="button"
                        onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                        className="w-full flex items-center justify-between p-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] rounded-[var(--radius-btn)] transition-all border border-[var(--border-main)] group cursor-pointer text-[var(--text-main)] shrink-0"
                    >
                        <div className="flex items-center gap-2">
                            <Clock size={13} className="text-[var(--text-muted)]" />
                            <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">{historyLabel}</span>
                        </div>
                        {isHistoryExpanded ? <ChevronDown size={14} className="text-[var(--text-muted)]" /> : <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />}
                    </button>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 pt-2 max-h-52">
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
                                <div key={idx} className="flex items-center gap-2.5 bg-[var(--bg-card)] p-2.5 rounded-[var(--radius-btn)] border border-[var(--border-main)] transition-all shadow-2xs">
                                    <div className={`w-1 h-5 rounded-full ${statusColor} shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Lv {entry.level}</span>
                                            <Icon size={11} className={statusColor.replace('bg-', 'text-')} />
                                        </div>
                                        <div className="text-xs font-bold text-[var(--text-main)] font-serif truncate">
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
    );
}

// =========================================================================
// MAIN EXPORT: PRACTICE VIEW
// =========================================================================
const PracticeView = ({ 
    lang, ui, question, loading, feedback, input, setInput, streak,
    handleSubmit, handleHint, handleSolution, handleSkip, 
    handleChangeLevel, revealedClues, uiState, actions, 
    levelUpAvailable, setLevelUpAvailable, isSolutionRevealed, 
    timerSettings, formatTime, toast, useWordProblems, setUseWordProblems,
    activeBucket, isDetourActive, onAdvanceUnitStep, onBackToRoadmap
}) => {
    const inputRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const [shake, setShake] = useState(false);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false); 
    const [showExampleBanner, setShowExampleBanner] = useState(true);
    const retryRef = useRef(actions.retry);

    const { isOpen: isCoachOpen, openCoach, closeCoach, coachProps } = useMyCoach(question, lang);

    const getCategoryContext = () => {
        const catKey = Object.keys(CATEGORIES).find(key => 
            CATEGORIES[key].topics.some(t => t.id === uiState.topic)
        );
        const category = CATEGORIES[catKey] || CATEGORIES.arithmetic;
        return { color: category.color || 'indigo' };
    };

    const theme = getCategoryContext();

    useEffect(() => {
        setShowExampleBanner(true);
    }, [uiState.topic, uiState.level]);

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

    const isCurrentLevelWordProblemReady = isLevelWordProblemReady(uiState.topic, uiState.level);

    useEffect(() => {
        if (!isCurrentLevelWordProblemReady && useWordProblems) {
            setUseWordProblems(false);
        }
    }, [isCurrentLevelWordProblemReady, useWordProblems]);

    const descriptionText = typeof question?.renderData?.description === 'object' 
        ? (question.renderData.description[lang] || question.renderData.description.sv) 
        : question?.renderData?.description;

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

    const onHintClick = () => {
        syncProgress('practice_hint_requested', {
            app_mode: 'practice',
            topic: uiState.topic,
            level: uiState.level,
            clues_revealed: (revealedClues?.length || 0) + 1,
            total_clues: question?.clues?.length || 0
        });
        handleHint();
    };

    const onCoachClick = () => {
        syncProgress('practice_coach_opened', {
            app_mode: 'practice',
            topic: uiState.topic,
            level: uiState.level,
            has_visual: !!question?.renderData?.graph || !!question?.renderData?.geometry
        });
        openCoach();
    };

    const onSkipClick = () => {
        syncProgress('practice_question_skipped', {
            app_mode: 'practice',
            topic: uiState.topic,
            level: uiState.level,
            used_clues: (revealedClues?.length || 0) > 0
        });
        handleSkip();
    };

    const onLevelSelect = (targetLevel) => {
        syncProgress('practice_level_changed', {
            app_mode: 'practice',
            topic: uiState.topic,
            from_level: uiState.level,
            to_level: targetLevel,
            change_type: targetLevel > uiState.level ? 'level_up' : 'level_down'
        });
        handleChangeLevel(targetLevel - uiState.level);
    };

    const onToggleWordProblems = (enabled) => {
        syncProgress('practice_word_problems_toggled', {
            app_mode: 'practice',
            topic: uiState.topic,
            level: uiState.level,
            enabled: enabled
        });
        setUseWordProblems(enabled);
    };

    return (
        <div className={`theme-${theme.color} layout-wrapper font-sans relative z-10 animate-in fade-in pb-10 !pt-4`}>
            
            {/* Unit Progression Modal */}
            {activeBucket && activeBucket !== 'FREE_PLAY' && levelUpAvailable ? (
                <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none">
                    <div className="bg-[var(--bg-card)] border-2 border-emerald-500 rounded-[var(--radius-card)] p-6 sm:p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-emerald-500 text-white rounded-[var(--radius-btn)] flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Trophy size={32} />
                        </div>
                        
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                            {activeBucket.name}
                        </span>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--text-main)] mb-2">
                            {lang === 'sv' ? "Moment klart!" : "Step Complete!"}
                        </h3>
                        <p className="text-xs font-bold text-[var(--text-muted)] mb-6 leading-relaxed">
                            {lang === 'sv' 
                                ? `Du har klarat Nivå ${uiState.level}. Bra jobbat! Dags för nästa steg i din planering.` 
                                : `You have cleared Level ${uiState.level}. Great job! Time for the next step in your sequence.`}
                        </p>

                        <div className="flex flex-col gap-2.5">
                            <button
                                type="button"
                                onClick={() => {
                                    setLevelUpAvailable(false);
                                    if (onAdvanceUnitStep) onAdvanceUnitStep();
                                }}
                                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-[var(--radius-btn)] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>{lang === 'sv' ? "Tillbaka till planeringen ➡" : "Back to Roadmap ➡"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setLevelUpAvailable(false);
                                    actions.retry(true);
                                }}
                                className="w-full py-2.5 bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                {lang === 'sv' ? "Fortsätt öva denna nivå" : "Keep practicing this level"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <LevelUpModal 
                    visible={levelUpAvailable} 
                    lang={lang} 
                    supportsWordProblems={isCurrentLevelWordProblemReady && !useWordProblems}
                    onNext={() => { onLevelSelect(uiState.level + 1); setLevelUpAvailable(false); setUseWordProblems(false); }} 
                    onStay={() => { setLevelUpAvailable(false); actions.retry(true); }} 
                    onWordProblems={() => { onToggleWordProblems(true); setLevelUpAvailable(false); }} 
                />
            )}

            {/* Mastery Toast Overlay */}
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

            <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 pt-0">
                
                {/* Practice Context Header Sub-Component */}
                <PracticeContextHeader 
                    lang={lang}
                    uiState={uiState}
                    activeBucket={activeBucket}
                    isDetourActive={isDetourActive}
                    onLevelSelect={onLevelSelect}
                    onBackToRoadmap={onBackToRoadmap}
                    LEVEL_DESCRIPTIONS={LEVEL_DESCRIPTIONS}
                />

                {/* "Would you like to see an example first?" Lifeline Banner */}
                {showExampleBanner && !loading && !feedback && (
                    <div className="mb-4 bg-[var(--bg-card)] border-2 border-indigo-500 rounded-[var(--radius-card)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-3 duration-300 shadow-md">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-[var(--radius-btn)] bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <HelpCircle size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-black text-[var(--text-main)] uppercase tracking-tight">
                                    {lang === 'sv' ? "Vill du se ett löst exempel först?" : "Would you like to see a solved example first?"}
                                </h4>
                                <p className="text-xs font-bold text-[var(--text-muted)] mt-0.5">
                                    {lang === 'sv' 
                                        ? "Starta Coach för en interaktiv genomgång innan du börjar lösa." 
                                        : "Open Coach for an interactive step-by-step walkthrough before you solve."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowExampleBanner(false);
                                    onCoachClick();
                                }}
                                className="px-4 py-2.5 rounded-[var(--radius-btn)] bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
                            >
                                <Play size={13} fill="currentColor" />
                                <span>{lang === 'sv' ? "Visa exempel" : "Show Example"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowExampleBanner(false)}
                                className="px-3 py-2.5 rounded-[var(--radius-btn)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[var(--border-strong)]"
                            >
                                {lang === 'sv' ? "Nej tack" : "Skip"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="layout-twocol">
                    <div className="layout-main">
                        {/* Main Practice Card */}
                        <main className={`card p-0 ${shake ? 'animate-shake' : ''} flex flex-col`}>
                            {loading ? (
                                <div className="py-32 text-center flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-4 border-t-transparent text-[var(--brand-text)] rounded-full animate-spin border-current" />
                                    <span className="text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Laddar...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col min-h-[350px]">
                                    
                                    {/* TOP SECTION: VISUAL & EQUATION */}
                                    <div className="w-full min-h-[180px] sm:min-h-[240px] p-4 sm:p-6 xl:p-8 whiteboard-protect flex flex-col justify-center items-center border-b border-[var(--border-main)] relative overflow-hidden">
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
                                                    <div className="text-3xl xl:text-4xl font-serif text-[var(--text-main)] flex justify-center items-center text-center px-4">
                                                        <MathText text={`$$${question.renderData.latex}$$`} />
                                                    </div>
                                                )}
                                            </div>
                                        </WordProblemVisualGuard>
                                        
                                        <div className="absolute top-6 left-8 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[var(--brand-solid)] animate-pulse" />
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
                                                                <button 
                                                                    key={idx} 
                                                                    type="button"
                                                                    onClick={() => handleChoiceClick(choiceValue)} 
                                                                    className={`btn-3d w-full text-left flex items-center gap-3 cursor-pointer
                                                                        ${isCorrect ? 'is-correct' : isIncorrect ? 'is-wrong' : ''}
                                                                        ${isSelected && !isCorrect && !isIncorrect ? 'bg-[var(--brand-bg)] border-[var(--brand-text)]' : ''}`} 
                                                                    disabled={feedback === 'correct'}
                                                                >
                                                                    <span className={`w-7 h-7 rounded-[var(--radius-btn)] flex items-center justify-center text-xs font-black shadow-inner shrink-0
                                                                        ${(isCorrect || isIncorrect) ? 'bg-white/25 text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-main)]'}`}>
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
                                                            {question?.renderData?.answerType === 'mixed_fraction' ? (
                                                                <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-main)] shadow-inner">
                                                                    <FractionInput value={input} onChange={setInput} allowMixed={true} autoFocus={true} />
                                                                </div>
                                                            ) : question?.renderData?.answerType === 'fraction' ? (
                                                                <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-main)] shadow-inner">
                                                                    <FractionInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} allowMixed={false} autoFocus={false} />
                                                                </div>
                                                            ) : question?.renderData?.answerType === 'structured_power' ? (
                                                                <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-main)] shadow-inner">
                                                                    <ExponentInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} autoFocus={true} />
                                                                </div>
                                                            ) : question?.renderData?.answerType === 'structured_scientific' ? (
                                                                <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-main)] shadow-inner">
                                                                    <ScientificInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} autoFocus={true} />
                                                                </div>
                                                            ) : (
                                                                <SmartMathInput 
                                                                    inputRef={inputRef}
                                                                    value={input}
                                                                    onChange={setInput}
                                                                    inputType={question?.renderData?.answerType}
                                                                    disabled={feedback === 'correct'}
                                                                    autoFocus={true}
                                                                    className={
                                                                        feedback === 'incorrect' ? '!border-rose-500 !bg-rose-50 !text-rose-700' :
                                                                        feedback === 'correct' ? '!border-emerald-500 !bg-emerald-50 !text-emerald-700' : ''
                                                                    }
                                                                />
                                                            )}
                                                            
                                                            {feedback === 'correct' && <div className="absolute -right-3 -top-3 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--bg-card)] animate-bounce"><CheckCircle2 size={16}/></div>}
                                                            {feedback === 'incorrect' && <div className="absolute -right-3 -top-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--bg-card)]"><XCircle size={16}/></div>}
                                                        </div>

                                                        <button 
                                                            type="submit" 
                                                            className={`btn-3d w-full justify-center text-lg uppercase tracking-wider cursor-pointer
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
                                                    type="button"
                                                    onClick={onHintClick} 
                                                    disabled={!question?.clues || revealedClues.length >= question?.clues.length} 
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-[var(--radius-btn)] bg-[var(--bg-card)] text-amber-500 border border-amber-200 disabled:opacity-30 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all shadow-2xs cursor-pointer"
                                                >
                                                    <Zap size={16} /> <span className="hidden sm:inline-block">{ui.btnHint}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={onCoachClick}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-[var(--radius-btn)] font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer shadow-sm border-b-[3px] border-purple-800 active:translate-y-1 active:border-b-0"
                                                    title={lang === 'sv' ? "Starta tavel-repris och få hjälp" : "Start interactive step guide"}
                                                >
                                                    <HelpCircle size={16} />
                                                    <span className="hidden sm:inline-block">{lang === 'sv' ? "Hjälp!" : "Help!"}</span>
                                                </button>

                                                <button 
                                                    type="button"
                                                    onClick={onSkipClick} 
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-[var(--radius-btn)] bg-[var(--bg-card)] text-indigo-400 border border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 transition-all shadow-2xs cursor-pointer"
                                                >
                                                    <span className="hidden sm:inline-block">{lang === 'sv' ? "Hoppa över!" : "Skip!"}</span> <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>

                    {/* Practice Sidebar Sub-Component */}
                    <PracticeSidebar 
                        lang={lang}
                        ui={ui}
                        timerSettings={timerSettings}
                        formatTime={formatTime}
                        isCurrentLevelWordProblemReady={isCurrentLevelWordProblemReady}
                        useWordProblems={useWordProblems}
                        onToggleWordProblems={onToggleWordProblems}
                        revealedClues={revealedClues}
                        question={question}
                        isSolutionRevealed={isSolutionRevealed}
                        streak={streak}
                        uiState={uiState}
                        isHistoryExpanded={isHistoryExpanded}
                        setIsHistoryExpanded={setIsHistoryExpanded}
                    />
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