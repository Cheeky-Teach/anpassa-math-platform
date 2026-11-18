// src/components/views/PracticeView.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import MathText from '../ui/MathText';
import CluePanel from '../practice/CluePanel';
import UnitRoadmapRail from '../practice/UnitRoadmapRail';
import InlineCheckpointRunner from '../practice/InlineCheckpointRunner';
import QuestionPromptCard from '../shared/QuestionPromptCard';
import QuestionResponseBox from '../shared/QuestionResponseBox';
import { useMyCoach } from '../../hooks/useMyCoach';
import MyCoachModal from '../modals/MyCoachModal';
import LevelUpModal from '../modals/LevelUpModal';
import SlideViewerCore from '../shared/SlideViewerCore';
import { LEVEL_DESCRIPTIONS, CATEGORIES } from '../../constants/localization';
import {
    ChevronLeft, Trophy, Zap, Clock, CheckCircle2, XCircle,
    HelpCircle, MinusCircle, ChevronRight, BarChart3, ChevronDown,
    Lock, Play, Compass, ArrowRight, ArrowLeft
} from 'lucide-react';
import { isLevelWordProblemReady } from '../../constants/skillBuckets.js';
import { syncProgress } from '../../lib/progressSync';
import {
    normalizePartsPayload,
    getUnitProgressStorageKey,
    readCompletedStepIds,
    persistStepComplete,
    getNextUnitStep,
    checkIsStepCompleted
} from '../../core/utils/unitProgressUtils';


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
        || '';

    const isCuratedUnit = Boolean(activeBucket && activeBucket !== 'FREE_PLAY');

    return (
        <div className="space-y-3 mb-4">
            <div className="card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                        {isCuratedUnit ? (
                            <h2 className="text-base sm:text-lg font-black text-[var(--text-main)] truncate leading-snug">
                                {lang === 'sv' ? `Nivå ${uiState.level}` : `Level ${uiState.level}`} — {currentLevelDesc}
                            </h2>
                        ) : (
                            <div className="relative inline-block mt-0.5">
                                <button
                                    type="button"
                                    onClick={() => setIsLevelMenuOpen(!isLevelMenuOpen)}
                                    className="group mt-1 px-3.5 py-1.5 rounded-[var(--radius-btn)] bg-[var(--brand-bg)] hover:bg-[var(--brand-solid)] border border-[var(--brand-border)] hover:border-[var(--brand-solid)] text-[var(--brand-text)] hover:text-white transition-all flex items-center gap-2.5 cursor-pointer shadow-2xs text-left"
                                    title={lang === 'sv' ? 'Klicka för att byta nivå' : 'Click to change level'}
                                >
                                    <span className="font-black text-xs sm:text-sm uppercase tracking-tight">
                                        {lang === 'sv' ? `Nivå ${uiState.level}` : `Level ${uiState.level}`} — {currentLevelDesc}
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--brand-text)] group-hover:bg-white group-hover:text-[var(--brand-solid)] text-[10px] font-black uppercase tracking-wider shrink-0 transition-colors shadow-2xs">
                                        <span>{lang === 'sv' ? 'Byt nivå' : 'Change'}</span>
                                        <ChevronDown size={12} className={`transition-transform shrink-0 ${isLevelMenuOpen ? 'rotate-180' : ''}`} />
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {isLevelMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setIsLevelMenuOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 4 }}
                                                className="absolute left-0 top-full mt-2 z-30 w-80 bg-[var(--bg-card)] border-2 border-[var(--brand-solid)] rounded-[var(--radius-card)] shadow-2xl max-h-80 overflow-y-auto custom-scrollbar divide-y divide-[var(--border-main)]"
                                            >
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
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {isCuratedUnit ? (
                        <button
                            type="button"
                            onClick={onBackToRoadmap}
                            className="px-4 py-2 rounded-[var(--radius-btn)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                        >
                            <ChevronLeft size={15} />
                            <span>{lang === 'sv' ? 'Områdesöversikt' : 'Unit Overview'}</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={uiState.level <= 1}
                                onClick={() => onLevelSelect(uiState.level - 1)}
                                className="px-3.5 py-2 rounded-[var(--radius-btn)] bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                                title={lang === 'sv' ? 'Byt till en enklare nivå' : 'Switch to easier level'}
                            >
                                <ArrowLeft size={13} />
                                <span>{lang === 'sv' ? 'För svårt?' : 'Too hard?'}</span>
                            </button>

                            <button
                                type="button"
                                disabled={uiState.level >= availableLevels.length}
                                onClick={() => onLevelSelect(uiState.level + 1)}
                                className="px-3.5 py-2 rounded-[var(--radius-btn)] bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                                title={lang === 'sv' ? 'Byt till en svårare nivå' : 'Switch to harder level'}
                            >
                                <span>{lang === 'sv' ? 'För lätt?' : 'Too easy?'}</span>
                                <ArrowRight size={13} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isDetourActive && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 rounded-[var(--radius-card)] px-4 py-3 flex items-center justify-between gap-3 shadow-sm"
                    >
                        <div className="flex items-center gap-2.5 text-xs font-bold text-amber-950 dark:text-amber-100">
                            <Zap className="text-amber-600 fill-amber-600 animate-pulse shrink-0" size={18} />
                            <span>
                                {lang === 'sv' ? 'Uppvärmning (Detour) för att stärka grunderna.' : 'Warm-up practice to reinforce fundamentals.'}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
    const cluesLabel = ui.hintsTitle || (lang === 'sv' ? 'Ledtrådar' : 'Hints');
    const historyLabel = ui.historyTitle || (lang === 'sv' ? 'Historik' : 'History');

    const total = uiState.history.length;
    const stats = useMemo(() => ({
        skipped: uiState.history.filter(h => h.skipped).length,
        wrong: uiState.history.filter(h => !h.correct && !h.skipped).length,
        help: uiState.history.filter(h => h.correct && (h.clueUsed || h.solutionUsed)).length,
        correct: uiState.history.filter(h => h.correct && !h.clueUsed && !h.solutionUsed).length
    }), [uiState.history]);

    const getPct = (val) => (total > 0 ? (val / total) * 100 : 0);

    return (
        <aside className="practice-sidebar space-y-4">
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
                                {lang === 'sv' ? 'Tid kvar' : 'Time left'}
                            </span>
                        </div>
                        <span className="text-xl font-black font-mono tracking-tighter">
                            {formatTime(timerSettings.remaining)}
                        </span>
                    </div>
                )}

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
                            {lang === 'sv' ? 'Textuppgifter ej tillgängliga' : 'Word problems not available'}
                        </button>
                    ) : (
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-main)] block truncate">
                                    {lang === 'sv' ? 'Problemlösning' : 'Word Problems'}
                                </span>
                                <span className="text-[10px] font-semibold text-[var(--text-muted)] block truncate">
                                    {lang === 'sv' ? 'Träna med textkontext' : 'Practice with text context'}
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
                                {useWordProblems ? (lang === 'sv' ? 'Aktiv ✓' : 'Active ✓') : (lang === 'sv' ? 'Aktivera' : 'Enable')}
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

            <div className="card p-5 space-y-4 border border-[var(--border-main)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[var(--radius-btn)] bg-[var(--brand-bg)] flex items-center justify-center text-[var(--brand-text)] shadow-2xs">
                            <BarChart3 size={13} />
                        </div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">
                            {lang === 'sv' ? 'Session-statistik' : 'Session Stats'}
                        </h3>
                    </div>
                    {total > 0 && (
                        <span className="text-[10px] font-black text-[var(--brand-text)] bg-[var(--brand-bg)] px-2 py-0.5 rounded-md border border-[var(--brand-border)]">
                            {total} {ui.stats_attempted || 'st'}
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
                    <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'sv' ? 'Streak' : 'Streak'}</span>
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

                            let statusColor = 'bg-rose-500';
                            let Icon = XCircle;
                            if (isSkipped) { statusColor = 'bg-slate-300'; Icon = MinusCircle; }
                            else if (isCorrect && !usedHelp) { statusColor = 'bg-emerald-500'; Icon = CheckCircle2; }
                            else if (isCorrect && usedHelp) { statusColor = 'bg-amber-400'; Icon = HelpCircle; }

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
// MAIN EXPORT: PRACTICE VIEW (UNIFIED FREE PLAY + CURATED UNIT WORKSPACE)
// =========================================================================
const PracticeView = ({
    lang, ui, question, loading, feedback, input, setInput, streak,
    handleSubmit, handleHint, handleSolution, handleSkip,
    handleChangeLevel, revealedClues, uiState, actions,
    levelUpAvailable, setLevelUpAvailable, isSolutionRevealed,
    timerSettings, formatTime, toast, useWordProblems, setUseWordProblems,
    activeBucket, isDetourActive, onAdvanceUnitStep, onBackToRoadmap,
    profile = null,
    activeClass = null,
    activeUnitStepId = null,
    onSelectUnitStep = null
}) => {
    const [shake, setShake] = useState(false);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
    const [showExampleBanner, setShowExampleBanner] = useState(true);
    const [activeInstructionStep, setActiveInstructionStep] = useState(null);
    const [activeInstructionSlideIdx, setActiveInstructionSlideIdx] = useState(0);
    const retryRef = useRef(actions.retry);

    const { isOpen: isCoachOpen, openCoach, closeCoach, coachProps } = useMyCoach(question, lang);

    // Curated Unit State & Progress Sync
    const isCuratedUnit = Boolean(activeBucket && activeBucket !== 'FREE_PLAY');
    const unitParts = useMemo(
        () => (isCuratedUnit ? normalizePartsPayload(activeBucket.payload) : []),
        [isCuratedUnit, activeBucket]
    );
    const allUnitSteps = useMemo(() => unitParts.flatMap(p => p.steps || []), [unitParts]);

    const progressStorageKey = useMemo(
        () => getUnitProgressStorageKey(profile, activeBucket),
        [profile, activeBucket]
    );

    const [completedStepIds, setCompletedStepIds] = useState(() =>
        readCompletedStepIds(progressStorageKey)
    );

    useEffect(() => {
        setCompletedStepIds(readCompletedStepIds(progressStorageKey));
    }, [progressStorageKey, levelUpAvailable]);

    const markStepCompleteLocal = (stepId) => {
        if (!stepId) return;
        setCompletedStepIds(prev => persistStepComplete(progressStorageKey, stepId, prev));
    };

    // Resolve active unit step (explicit ID first, otherwise matching topic/level or first unfinished)
    const activeUnitStep = useMemo(() => {
        if (!isCuratedUnit) return null;
        if (activeUnitStepId) {
            const explicit = allUnitSteps.find(s => s.id === activeUnitStepId);
            if (explicit) return explicit;
        }
        const matchingPractice = allUnitSteps.find(s => {
            const sTopic = s.topic || s.topicId;
            return (s.type === 'practice' || !s.type) && sTopic === uiState.topic && Number(s.level) === Number(uiState.level);
        });
        if (matchingPractice) return matchingPractice;
        return allUnitSteps.find(s => !checkIsStepCompleted(s, completedStepIds)) || allUnitSteps[0] || null;
    }, [isCuratedUnit, activeUnitStepId, allUnitSteps, uiState.topic, uiState.level, completedStepIds]);

    const activeCheckpointStep = activeUnitStep?.type === 'test' ? activeUnitStep : null;

    // Open walkthrough slides inline in the center stage without leaving PracticeView
    const handleOpenWalkthrough = async (step) => {
        setActiveInstructionSlideIdx(step.slideIndex || 0);
        if (step.sheetId) {
            try {
                const teacherCode =
                    activeClass?.class_code ||
                    profile?.connected_code ||
                    profile?.class_code ||
                    activeBucket?.class_code ||
                    null;
                const { data: sheetPacket, error } = await supabase.rpc('get_student_presentation', {
                    p_sheet_id: step.sheetId,
                    p_teacher_code: teacherCode
                });
                if (error) throw error;
                if (sheetPacket) {
                    const slides = sheetPacket.slides || (step.slideData ? [step.slideData] : []);
                    const livePacket = sheetPacket.livePacket || sheetPacket.items || [];
                    setActiveInstructionStep({ ...step, slides, livePacket, slideIndex: step.slideIndex || 0 });
                    return;
                }
            } catch (err) {
                console.error('Failed to load walkthrough presentation:', err.message);
            }
        }
        setActiveInstructionStep(step);
    };

    const handleRegenerateWalkthroughQuestion = async (questionId) => {
        if (!activeInstructionStep?.livePacket) return;
        const targetQ = activeInstructionStep.livePacket.find(q => q.id === questionId);
        if (!targetQ) return;

        try {
            const topicId = targetQ.topic || targetQ.topicId;
            const lvl = Number(targetQ.level || 1);
            const res = await fetch(`/api/question?topic=${encodeURIComponent(topicId)}&level=${lvl}&lang=${lang}`);
            if (!res.ok) throw new Error('Failed to fetch new example');
            const fresh = await res.json();

            setActiveInstructionStep(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    livePacket: (prev.livePacket || []).map(item =>
                        item.id === questionId
                            ? {
                                  ...item,
                                  resolvedData: fresh.resolvedData || fresh,
                                  clues: fresh.clues || fresh.resolvedData?.clues || item.clues,
                                  regenVersion: (item.regenVersion || 0) + 1
                              }
                            : item
                    )
                };
            });
        } catch (err) {
            console.error('Failed to regenerate walkthrough example:', err);
        }
    };

    const handleSelectUnitStepFromRail = (step, part) => {
        if (!step) return;
        const stepType = step.type || (step.sheetId ? 'instruction' : 'practice');
        if (onSelectUnitStep) {
            onSelectUnitStep(step, part);
        }
        if (stepType === 'instruction') {
            handleOpenWalkthrough(step);
        } else {
            setActiveInstructionStep(null);
        }
    };

    const handleAdvanceToNextUnitStep = (fromStepId = activeUnitStep?.id) => {
        const nextStep = getNextUnitStep(allUnitSteps, fromStepId);
        if (!nextStep) {
            setActiveInstructionStep(null);
            if (onAdvanceUnitStep) onAdvanceUnitStep();
            return;
        }
        const ownerPart = unitParts.find(p => (p.steps || []).some(s => s.id === nextStep.id));
        handleSelectUnitStepFromRail(nextStep, ownerPart);
    };

    // Load walkthrough inline if landing directly on an instruction step
    useEffect(() => {
        if (activeUnitStep && (activeUnitStep.type === 'instruction' || activeUnitStep.sheetId)) {
            handleOpenWalkthrough(activeUnitStep);
        } else {
            setActiveInstructionStep(null);
        }
    }, [activeUnitStep?.id]);

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
        }
    }, [question, loading]);

    const isCurrentLevelWordProblemReady = isLevelWordProblemReady(uiState.topic, uiState.level);

    useEffect(() => {
        if (!isCurrentLevelWordProblemReady && useWordProblems) {
            setUseWordProblems(false);
        }
    }, [isCurrentLevelWordProblemReady, useWordProblems, setUseWordProblems]);

    const getSubmitLabel = () => {
        if (feedback === 'correct') return ui.btnNext || 'Nästa ➡';
        if (feedback === 'incorrect') return ui.tagWrong || 'Fel svar';
        return ui.btnCheck || 'Svara';
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

    const nextStepAfterCurrent = activeUnitStep ? getNextUnitStep(allUnitSteps, activeUnitStep.id) : null;

    return (
        <div className={`theme-${theme.color} layout-wrapper font-sans relative z-10 animate-in fade-in pb-10 !pt-4`}>

            {/* Curated Unit Step Completion Modal */}
            <AnimatePresence>
                {isCuratedUnit && levelUpAvailable && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[var(--bg-card)] border-2 border-emerald-500 rounded-[var(--radius-card)] p-6 sm:p-8 max-w-md w-full text-center shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-emerald-500 text-white rounded-[var(--radius-btn)] flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Trophy size={32} />
                            </div>

                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                                {activeBucket.name}
                            </span>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--text-main)] mb-2">
                                {lang === 'sv' ? 'Moment klart!' : 'Step Complete!'}
                            </h3>
                            <p className="text-xs font-bold text-[var(--text-muted)] mb-6 leading-relaxed">
                                {lang === 'sv'
                                    ? `Du har klarat Nivå ${uiState.level}. Bra jobbat! Fortsätt direkt till nästa steg i din planering.`
                                    : `You have cleared Level ${uiState.level}. Great job! Continue straight to the next step in your unit.`}
                            </p>

                            <div className="flex flex-col gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (activeUnitStep?.id) markStepCompleteLocal(activeUnitStep.id);
                                        setLevelUpAvailable(false);
                                        if (nextStepAfterCurrent) {
                                            handleAdvanceToNextUnitStep(activeUnitStep.id);
                                        } else if (onAdvanceUnitStep) {
                                            onAdvanceUnitStep();
                                        }
                                    }}
                                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-[var(--radius-btn)] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>
                                        {nextStepAfterCurrent
                                            ? (lang === 'sv' ? 'Nästa steg i planeringen ➡' : 'Next Step in Unit ➡')
                                            : (lang === 'sv' ? 'Slutför enheten ➡' : 'Finish Unit ➡')}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLevelUpAvailable(false);
                                        actions.retry(true);
                                    }}
                                    className="w-full py-2.5 bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    {lang === 'sv' ? 'Fortsätt öva denna nivå' : 'Keep practicing this level'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Free-Play Level Up Modal */}
            {!isCuratedUnit && (
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
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -10, x: '-50%' }}
                        className="fixed top-24 left-1/2 z-[70] w-full max-w-md px-4"
                    >
                        <div className={`p-4 rounded-[var(--radius-card)] shadow-xl border-2 flex items-center gap-4 bg-[var(--bg-card)] ${toast.type === 'success' ? 'border-emerald-500' : 'border-amber-500'}`}>
                            <div className={`w-12 h-12 rounded-[var(--radius-btn)] flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                {toast.type === 'success' ? <Trophy size={24} /> : <Zap size={24} />}
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-tight text-[var(--text-main)] leading-none">{toast.title}</h4>
                                <p className="text-xs font-bold text-[var(--text-muted)] mt-1">{toast.message}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-[1520px] mx-auto w-full px-4 sm:px-6 pt-0">
                <div className="flex flex-col lg:flex-row gap-5 items-start">

                    {/* COLLAPSIBLE CURATED UNIT ROADMAP RAIL (Left) */}
                    {isCuratedUnit && (
                        <UnitRoadmapRail
                            activeBucket={activeBucket}
                            parts={unitParts}
                            completedStepIds={completedStepIds}
                            activeStepId={activeUnitStep?.id}
                            onSelectStep={handleSelectUnitStepFromRail}
                            onBackToDashboard={onBackToRoadmap}
                            lang={lang}
                        />
                    )}

                    {/* CENTER & RIGHT PRACTICE WORKSPACE */}
                    <div className="flex-1 min-w-0 w-full">
                        {!activeCheckpointStep && !activeInstructionStep && (
                            <PracticeContextHeader
                                lang={lang}
                                uiState={uiState}
                                activeBucket={activeBucket}
                                isDetourActive={isDetourActive}
                                onLevelSelect={onLevelSelect}
                                onBackToRoadmap={onBackToRoadmap}
                                LEVEL_DESCRIPTIONS={LEVEL_DESCRIPTIONS}
                            />
                        )}
                        {activeInstructionStep ? (
                            (() => {
                                const walkthroughSlides = activeInstructionStep.slides || (activeInstructionStep.slideData ? [activeInstructionStep.slideData] : []);
                                const totalWalkthroughSlides = walkthroughSlides.length;
                                const canGoPrevSlide = activeInstructionSlideIdx > 0;
                                const canGoNextSlide = activeInstructionSlideIdx < totalWalkthroughSlides - 1;

                                return (
                                    <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 animate-in fade-in duration-150">
                                        {/* Clean Inline Walkthrough Header Bar */}
                                        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-bold uppercase tracking-wider shrink-0">
                                                    {lang === 'sv' ? 'Genomgång' : 'Walkthrough'}
                                                </span>
                                                <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-main)] truncate">
                                                    {activeInstructionStep.sheetTitle}
                                                </h2>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAdvanceToNextUnitStep(activeInstructionStep.id)}
                                                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-main)] text-xs font-bold transition-colors cursor-pointer"
                                                >
                                                    {lang === 'sv' ? 'Hoppa över' : 'Skip'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        markStepCompleteLocal(activeInstructionStep.id);
                                                        handleAdvanceToNextUnitStep(activeInstructionStep.id);
                                                    }}
                                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                                        canGoNextSlide
                                                            ? 'bg-[var(--bg-surface)] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                                    }`}
                                                >
                                                    <span>{lang === 'sv' ? 'Klar & gå vidare →' : 'Done & Continue →'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Compact Inline Slide Stage */}
                                        <div className="w-full h-[470px]">
                                            <SlideViewerCore
                                                slide={walkthroughSlides[activeInstructionSlideIdx]}
                                                livePacket={activeInstructionStep.livePacket || []}
                                                lang={lang}
                                                authorMode={false}
                                                compactMode={true}
                                                slideRendererProps={{
                                                    onRegenerate: handleRegenerateWalkthroughQuestion
                                                }}
                                            />
                                        </div>

                                        {/* Prominent Bottom Slide Pagination Bar (Multi-slide walkthroughs) */}
                                        {totalWalkthroughSlides > 1 && (
                                            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs">
                                                <button
                                                    type="button"
                                                    disabled={!canGoPrevSlide}
                                                    onClick={() => setActiveInstructionSlideIdx(i => Math.max(0, i - 1))}
                                                    className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] disabled:opacity-35 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                                                >
                                                    <ChevronLeft size={16} />
                                                    <span>{lang === 'sv' ? 'Föregående sida' : 'Previous slide'}</span>
                                                </button>

                                                <div className="flex items-center gap-2">
                                                    <div className="hidden sm:flex items-center gap-1.5">
                                                        {walkthroughSlides.map((_, sIdx) => (
                                                            <button
                                                                key={sIdx}
                                                                type="button"
                                                                onClick={() => setActiveInstructionSlideIdx(sIdx)}
                                                                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                                                                    sIdx === activeInstructionSlideIdx
                                                                        ? 'w-7 bg-sky-600'
                                                                        : 'w-2.5 bg-[var(--border-strong)] hover:opacity-80'
                                                                }`}
                                                                title={`${lang === 'sv' ? 'Sida' : 'Slide'} ${sIdx + 1}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-mono font-bold text-[var(--text-muted)] px-1.5">
                                                        {lang === 'sv' ? 'Sida' : 'Slide'} {activeInstructionSlideIdx + 1} / {totalWalkthroughSlides}
                                                    </span>
                                                </div>

                                                {canGoNextSlide ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveInstructionSlideIdx(i => Math.min(totalWalkthroughSlides - 1, i + 1))}
                                                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                                                    >
                                                        <span>{lang === 'sv' ? 'Nästa sida' : 'Next slide'}</span>
                                                        <ChevronRight size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            markStepCompleteLocal(activeInstructionStep.id);
                                                            handleAdvanceToNextUnitStep(activeInstructionStep.id);
                                                        }}
                                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                                                    >
                                                        <span>{lang === 'sv' ? 'Klar & gå vidare' : 'Done & Continue'}</span>
                                                        <ChevronRight size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()
                        ) : activeCheckpointStep ? (
                            <InlineCheckpointRunner
                                key={activeCheckpointStep.id}
                                step={activeCheckpointStep}
                                lang={lang}
                                onCompleteStep={(stepId) => markStepCompleteLocal(stepId)}
                                onAdvanceNextStep={() => handleAdvanceToNextUnitStep(activeCheckpointStep.id)}
                            />
                        ) : (
                            <div className="practice-twocol">
                                <div className="practice-main">
                                    <main className={`card p-6 sm:p-8 ${shake ? 'animate-shake' : ''} flex flex-col shadow-lg border border-[var(--border-main)] relative`}>
                                        {loading ? (
                                            <div className="py-32 text-center flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-t-transparent text-[var(--brand-text)] rounded-full animate-spin border-current" />
                                                <span className="text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Laddar...</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col min-h-[380px] justify-between">
                                                {/* Shared Question Prompt (Visual, Equation, Description) */}
                                                <div className="relative">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-[var(--brand-solid)] animate-pulse" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">
                                                                Du kan det här!
                                                            </span>
                                                        </div>

                                                        <AnimatePresence>
                                                            {showExampleBanner && !loading && !feedback && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.94, y: -4 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.94 }}
                                                                    className="flex items-center gap-2 bg-[var(--bg-card)] border border-indigo-500/50 rounded-full px-3 py-1 shadow-sm"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setShowExampleBanner(false);
                                                                            onCoachClick();
                                                                        }}
                                                                        className="flex items-center gap-1.5 text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:opacity-85 cursor-pointer"
                                                                    >
                                                                        <Play size={11} fill="currentColor" />
                                                                        <span>{lang === 'sv' ? 'Se exempel?' : 'See example?'}</span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowExampleBanner(false)}
                                                                        className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer text-xs font-bold px-1"
                                                                        title="Stäng"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    <QuestionPromptCard
                                                        question={question}
                                                        lang={lang}
                                                        isWordProblem={useWordProblems}
                                                    />
                                                </div>

                                                {/* Shared Response Box + Utility Actions */}
                                                <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 pt-2">
                                                    <QuestionResponseBox
                                                        question={question}
                                                        value={input}
                                                        onChange={setInput}
                                                        onSubmit={(val) => handleSubmit({ preventDefault: () => {} }, val)}
                                                        onAdvance={() => actions.retry(true)}
                                                        feedback={feedback}
                                                        lang={lang}
                                                        submitLabel={getSubmitLabel()}
                                                    />

                                                    <div className="flex items-center gap-3 pt-2">
                                                        <button
                                                            type="button"
                                                            onClick={onHintClick}
                                                            disabled={!question?.clues || revealedClues.length >= question?.clues.length}
                                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-[var(--radius-btn)] bg-[var(--bg-surface)] text-amber-600 dark:text-amber-400 border border-[var(--border-main)] disabled:opacity-30 hover:bg-[var(--bg-surface-hover)] transition-all shadow-2xs cursor-pointer"
                                                        >
                                                            <Zap size={15} /> <span>{ui.btnHint}</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={onCoachClick}
                                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-[var(--radius-btn)] font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer shadow-sm border-b-[3px] border-purple-800"
                                                            title={lang === 'sv' ? 'Starta tavel-repris och få hjälp' : 'Start interactive step guide'}
                                                        >
                                                            <HelpCircle size={15} />
                                                            <span>{lang === 'sv' ? 'Hjälp!' : 'Help!'}</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={onSkipClick}
                                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-[var(--radius-btn)] bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-main)] transition-all shadow-2xs cursor-pointer"
                                                        >
                                                            <span>{lang === 'sv' ? 'Hoppa över' : 'Skip'}</span> <ChevronRight size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </main>
                                </div>

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
                        )}
                    </div>
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