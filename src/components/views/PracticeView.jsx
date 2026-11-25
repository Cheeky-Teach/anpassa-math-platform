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
    HelpCircle, MinusCircle, ChevronRight, ChevronDown,
    Lock, Play, ArrowRight, ArrowLeft, Flame
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
    lang, uiState, activeBucket, isDetourActive, onLevelSelect, LEVEL_DESCRIPTIONS
}) {
    const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);

    const categoryContext = useMemo(() => {
        const catKey = Object.keys(CATEGORIES).find(key =>
            CATEGORIES[key].topics.some(t => t.id === uiState.topic)
        );
        const category = CATEGORIES[catKey] || CATEGORIES.arithmetic;
        const topicData = category.topics.find(t => t.id === uiState.topic);
        return {
            color: category.color || 'emerald',
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
        <div className="space-y-2.5 mb-3.5 xl:mb-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-0.5">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
                        <span className="text-[var(--brand-text)] font-semibold">
                            {categoryContext.categoryLabel}
                        </span>
                        <span className="opacity-50">·</span>
                        <span className="truncate">{categoryContext.topicLabel}</span>
                    </div>

                    {isCuratedUnit ? (
                        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] tracking-tight truncate mt-0.5">
                            <span className="font-mono">{lang === 'sv' ? `Nivå ${uiState.level}` : `Level ${uiState.level}`}</span>
                            {currentLevelDesc ? ` — ${currentLevelDesc}` : ''}
                        </h2>
                    ) : (
                        <div className="relative inline-block mt-1">
                            <button
                                type="button"
                                onClick={() => setIsLevelMenuOpen(!isLevelMenuOpen)}
                                className="group inline-flex items-center gap-2.5 text-left text-lg sm:text-xl font-bold text-[var(--text-main)] hover:text-[var(--role-primary-text)] transition-colors cursor-pointer"
                                title={lang === 'sv' ? 'Klicka för att byta nivå' : 'Click to change level'}
                            >
                                <span className="px-2.5 py-0.5 rounded-md bg-[var(--role-primary-soft)] border border-[var(--brand-border)] text-[var(--role-primary-text)] font-mono text-xs sm:text-sm font-bold shrink-0">
                                    {lang === 'sv' ? `Nivå ${uiState.level}` : `Lvl ${uiState.level}`}
                                </span>
                                {currentLevelDesc && (
                                    <span className="truncate">{currentLevelDesc}</span>
                                )}
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[var(--bg-surface)] group-hover:bg-[var(--role-primary-soft)] text-[var(--text-muted)] group-hover:text-[var(--role-primary-text)] transition-colors shrink-0">
                                    <ChevronDown size={14} className={`transition-transform ${isLevelMenuOpen ? 'rotate-180' : ''}`} />
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
                                            className="absolute left-0 top-full mt-2 z-30 w-80 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-xl max-h-80 overflow-y-auto custom-scrollbar divide-y divide-[var(--border-subtle)]"
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
                                                        className={`w-full text-left px-3.5 py-2.5 transition-colors cursor-pointer flex items-center justify-between gap-2.5 ${
                                                            isSelected ? 'bg-[var(--brand-bg)]' : 'hover:bg-[var(--bg-surface)]'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold shrink-0 ${
                                                                isSelected
                                                                    ? 'bg-[var(--brand-solid)] text-white'
                                                                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                                                            }`}>
                                                                {lang === 'sv' ? `Nivå ${lvl}` : `Lvl ${lvl}`}
                                                            </span>
                                                            <span className="text-xs font-semibold text-[var(--text-main)] truncate">
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

                {!isCuratedUnit && (
                    <div className="inline-flex items-center bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-1 gap-1 shrink-0 self-start sm:self-auto">
                        <button
                            type="button"
                            disabled={uiState.level <= 1}
                            onClick={() => onLevelSelect(uiState.level - 1)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                            title={lang === 'sv' ? 'Byt till en enklare nivå' : 'Switch to easier level'}
                        >
                            <ArrowLeft size={13} />
                            <span>{lang === 'sv' ? 'För svårt?' : 'Too hard?'}</span>
                        </button>

                        <div className="w-px h-4 bg-[var(--border-main)]" />

                        <button
                            type="button"
                            disabled={uiState.level >= availableLevels.length}
                            onClick={() => onLevelSelect(uiState.level + 1)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                            title={lang === 'sv' ? 'Byt till en svårare nivå' : 'Switch to harder level'}
                        >
                            <span>{lang === 'sv' ? 'För lätt?' : 'Too easy?'}</span>
                            <ArrowRight size={13} />
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isDetourActive && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="callout callout-warning flex items-center gap-2.5 text-xs font-semibold"
                    >
                        <Zap className="text-amber-600 dark:text-amber-400 shrink-0" size={16} />
                        <span>
                            {lang === 'sv' ? 'Uppvärmning för att stärka grunderna.' : 'Warm-up practice to reinforce fundamentals.'}
                        </span>
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
        <aside className="practice-sidebar">
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl divide-y divide-[var(--border-subtle)] overflow-hidden">

                {/* 1. Timer (if active) */}
                {timerSettings.isActive && (
                    <div className={`px-5 py-4 flex items-center justify-between ${
                        timerSettings.remaining < 60
                            ? 'bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                            : 'text-[var(--text-main)]'
                    }`}>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            <Clock size={15} className={timerSettings.remaining < 60 ? 'animate-pulse text-rose-600 dark:text-rose-400' : 'text-[var(--text-muted)]'} />
                            <span>{lang === 'sv' ? 'Tid kvar' : 'Time left'}</span>
                        </div>
                        <span className="text-base font-bold font-mono">
                            {formatTime(timerSettings.remaining)}
                        </span>
                    </div>
                )}

                {/* 2. Word Problems Inline Switch */}
                <div className={`px-5 py-4 flex items-center justify-between gap-3 ${!isCurrentLevelWordProblemReady ? 'opacity-50' : ''}`}>
                    <div className="min-w-0">
                        <span className="text-xs font-semibold text-[var(--text-main)] block truncate">
                            {lang === 'sv' ? 'Problemlösning' : 'Word Problems'}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] block truncate mt-0.5">
                            {isCurrentLevelWordProblemReady
                                ? (lang === 'sv' ? 'Träna med textuppgifter' : 'Practice with word context')
                                : (lang === 'sv' ? 'Ej tillgängligt på denna nivå' : 'Not available on this level')}
                        </span>
                    </div>

                    {isCurrentLevelWordProblemReady ? (
                        <button
                            type="button"
                            role="switch"
                            aria-checked={useWordProblems}
                            onClick={() => onToggleWordProblems(!useWordProblems)}
                            className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                                useWordProblems ? 'bg-[var(--brand-solid)]' : 'bg-[var(--border-strong)]'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-2xs transition-transform ${
                                useWordProblems ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                        </button>
                    ) : (
                        <Lock size={14} className="text-[var(--text-muted)] shrink-0" />
                    )}
                </div>

                {/* 3. Clues / Hints */}
                <div className="px-5 py-4 space-y-2.5">
                    <h3 className="text-xs font-semibold text-[var(--text-muted)]">
                        {cluesLabel}
                    </h3>
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

                {/* 4. Session Metrics & Quiet Streak */}
                <div className="px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-[var(--text-muted)]">
                            {lang === 'sv' ? 'Session' : 'Session'}
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-mono">
                            {total > 0 && (
                                <span className="text-[var(--text-muted)] font-semibold">
                                    {total} {ui.stats_attempted || 'st'}
                                </span>
                            )}
                            <span className={`inline-flex items-center gap-1 font-bold ${
                                streak > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--text-muted)]'
                            }`}>
                                <Flame size={13} className={streak > 0 ? 'fill-current' : ''} />
                                {streak}
                            </span>
                        </div>
                    </div>

                    <div className="w-full h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden flex">
                        {stats.correct > 0 && <div style={{ width: `${getPct(stats.correct)}%` }} className="bg-emerald-600 h-full transition-all duration-500" title={ui.stat_correct} />}
                        {stats.help > 0 && <div style={{ width: `${getPct(stats.help)}%` }} className="bg-amber-500 h-full transition-all duration-500" title={ui.stat_help} />}
                        {stats.wrong > 0 && <div style={{ width: `${getPct(stats.wrong)}%` }} className="bg-rose-500 h-full transition-all duration-500" title={ui.stat_wrong} />}
                        {stats.skipped > 0 && <div style={{ width: `${getPct(stats.skipped)}%` }} className="bg-[var(--border-strong)] h-full transition-all duration-500" title={ui.stat_skip} />}
                    </div>

                    {/* Collapsible History */}
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                            className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                        >
                            <span>{historyLabel}</span>
                            {isHistoryExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {isHistoryExpanded && (
                            <div className="space-y-1.5 pt-2 max-h-52 overflow-y-auto no-scrollbar">
                                {uiState.history.length === 0 ? (
                                    <p className="text-xs text-[var(--text-muted)] py-1">
                                        {lang === 'sv' ? 'Inga svar ännu.' : 'No answers yet.'}
                                    </p>
                                ) : (
                                    uiState.history.map((entry, idx) => {
                                        const isCorrect = entry.correct;
                                        const usedHelp = entry.clueUsed || entry.solutionUsed;
                                        const isSkipped = entry.skipped;

                                        let iconClass = 'text-rose-500';
                                        let Icon = XCircle;
                                        if (isSkipped) { iconClass = 'text-[var(--text-muted)]'; Icon = MinusCircle; }
                                        else if (isCorrect && !usedHelp) { iconClass = 'text-emerald-600 dark:text-emerald-400'; Icon = CheckCircle2; }
                                        else if (isCorrect && usedHelp) { iconClass = 'text-amber-500'; Icon = HelpCircle; }

                                        return (
                                            <div key={idx} className="flex items-center justify-between gap-2.5 bg-[var(--bg-surface)]/70 px-3 py-2 rounded-xl">
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-medium text-[var(--text-main)] font-serif truncate">
                                                        <MathText text={entry.text} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Lv {entry.level}</span>
                                                    <Icon size={13} className={iconClass} />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
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
        return { color: category.color || 'emerald' };
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
        if (feedback === 'correct') return ui.btnNext || 'Nästa →';
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
        <div className={`theme-${theme.color} layout-wrapper font-sans relative z-10 animate-in fade-in pb-10 !pt-3 xl:!pt-5`}>

            {/* Curated Unit Step Completion Modal */}
            <AnimatePresence>
                {isCuratedUnit && levelUpAvailable && (
                    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl"
                        >
                            <div className="w-14 h-14 bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trophy size={28} />
                            </div>

                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                                {activeBucket.name}
                            </span>
                            <h3 className="text-xl font-bold tracking-tight text-[var(--text-main)] mb-2">
                                {lang === 'sv' ? 'Moment klart!' : 'Step Complete!'}
                            </h3>
                            <p className="text-xs text-[var(--text-muted)] mb-6 leading-relaxed">
                                {lang === 'sv'
                                    ? `Du har klarat Nivå ${uiState.level}. Fortsätt direkt till nästa steg i din planering.`
                                    : `You have cleared Level ${uiState.level}. Continue straight to the next step in your unit.`}
                            </p>

                            <div className="flex flex-col gap-2">
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
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>
                                        {nextStepAfterCurrent
                                            ? (lang === 'sv' ? 'Nästa steg i planeringen →' : 'Next Step in Unit →')
                                            : (lang === 'sv' ? 'Slutför enheten →' : 'Finish Unit →')}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLevelUpAvailable(false);
                                        actions.retry(true);
                                    }}
                                    className="w-full py-2.5 bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium text-xs transition-colors cursor-pointer"
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
                        initial={{ opacity: 0, y: -16, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -10, x: '-50%' }}
                        className="fixed top-20 left-1/2 z-[70] w-full max-w-md px-4"
                    >
                        <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3.5 bg-[var(--bg-card)] ${toast.type === 'success' ? 'border-emerald-500' : 'border-amber-500'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                                {toast.type === 'success' ? <Trophy size={20} /> : <Zap size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-[var(--text-main)] leading-snug">{toast.title}</h4>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">{toast.message}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`${isCuratedUnit ? 'max-w-[1440px]' : 'max-w-[1120px]'} mx-auto w-full px-4 sm:px-6 pt-0`}>
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* COLLAPSIBLE CURATED UNIT ROADMAP RAIL (Left) */}
                    {isCuratedUnit && (
                        <UnitRoadmapRail
                            activeBucket={activeBucket}
                            parts={unitParts}
                            completedStepIds={completedStepIds}
                            activeStepId={activeUnitStep?.id}
                            onSelectStep={handleSelectUnitStepFromRail}
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
                                                <span className="px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-xs font-semibold shrink-0">
                                                    {lang === 'sv' ? 'Genomgång' : 'Walkthrough'}
                                                </span>
                                                <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)] truncate">
                                                    {activeInstructionStep.sheetTitle}
                                                </h2>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAdvanceToNextUnitStep(activeInstructionStep.id)}
                                                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    {lang === 'sv' ? 'Hoppa över' : 'Skip'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        markStepCompleteLocal(activeInstructionStep.id);
                                                        handleAdvanceToNextUnitStep(activeInstructionStep.id);
                                                    }}
                                                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                                        canGoNextSlide
                                                            ? 'bg-[var(--bg-surface)] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                    }`}
                                                >
                                                    <span>{lang === 'sv' ? 'Klar & gå vidare →' : 'Done & Continue →'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Compact Inline Slide Stage */}
                                        <div className="w-full h-[clamp(340px,56vh,480px)]">
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

                                        {/* Bottom Slide Pagination Bar (Multi-slide walkthroughs) */}
                                        {totalWalkthroughSlides > 1 && (
                                            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3">
                                                <button
                                                    type="button"
                                                    disabled={!canGoPrevSlide}
                                                    onClick={() => setActiveInstructionSlideIdx(i => Math.max(0, i - 1))}
                                                    className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] disabled:opacity-35 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                                >
                                                    <ChevronLeft size={15} />
                                                    <span>{lang === 'sv' ? 'Föregående sida' : 'Previous slide'}</span>
                                                </button>

                                                <div className="flex items-center gap-2">
                                                    <div className="hidden sm:flex items-center gap-1.5">
                                                        {walkthroughSlides.map((_, sIdx) => (
                                                            <button
                                                                key={sIdx}
                                                                type="button"
                                                                onClick={() => setActiveInstructionSlideIdx(sIdx)}
                                                                className={`h-2 rounded-full transition-all cursor-pointer ${
                                                                    sIdx === activeInstructionSlideIdx
                                                                        ? 'w-6 bg-sky-600'
                                                                        : 'w-2 bg-[var(--border-strong)] hover:opacity-80'
                                                                }`}
                                                                title={`${lang === 'sv' ? 'Sida' : 'Slide'} ${sIdx + 1}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-mono font-semibold text-[var(--text-muted)] px-1.5">
                                                        {activeInstructionSlideIdx + 1} / {totalWalkthroughSlides}
                                                    </span>
                                                </div>

                                                {canGoNextSlide ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveInstructionSlideIdx(i => Math.min(totalWalkthroughSlides - 1, i + 1))}
                                                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                                    >
                                                        <span>{lang === 'sv' ? 'Nästa sida' : 'Next slide'}</span>
                                                        <ChevronRight size={15} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            markStepCompleteLocal(activeInstructionStep.id);
                                                            handleAdvanceToNextUnitStep(activeInstructionStep.id);
                                                        }}
                                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                                    >
                                                        <span>{lang === 'sv' ? 'Klar & gå vidare' : 'Done & Continue'}</span>
                                                        <ChevronRight size={15} />
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
                                    <main className={`bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 sm:p-6 xl:p-9 ${shake ? 'animate-shake' : ''} flex flex-col relative`}>
                                        {loading ? (
                                            <div className="py-32 text-center flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-[3px] border-t-transparent text-[var(--brand-text)] rounded-full animate-spin border-current" />
                                                <span className="text-xs font-medium text-[var(--text-muted)]">
                                                    {lang === 'sv' ? 'Laddar uppgift...' : 'Loading question...'}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col min-h-[300px] xl:min-h-[380px] justify-between gap-4 xl:gap-6">
                                                {/* Quiet top-right example link */}
                                                <div className="relative">
                                                    <AnimatePresence>
                                                        {showExampleBanner && !loading && !feedback && (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                className="flex justify-end mb-2"
                                                            >
                                                                <div className="inline-flex items-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setShowExampleBanner(false);
                                                                            onCoachClick();
                                                                        }}
                                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                                                                    >
                                                                        <Play size={11} fill="currentColor" />
                                                                        <span>{lang === 'sv' ? 'Se exempel' : 'See example'}</span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowExampleBanner(false)}
                                                                        className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer text-xs px-1"
                                                                        title={lang === 'sv' ? 'Stäng' : 'Close'}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <QuestionPromptCard
                                                        question={question}
                                                        lang={lang}
                                                        isWordProblem={useWordProblems}
                                                    />
                                                </div>

                                                {/* Shared Response Box + Calm Secondary Actions */}
                                                <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 pt-2">
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

                                                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={onHintClick}
                                                            disabled={!question?.clues || revealedClues.length >= question?.clues.length}
                                                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                                        >
                                                            <Zap size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                                            <span>{ui.btnHint || (lang === 'sv' ? 'Ledtråd' : 'Hint')}</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={onCoachClick}
                                                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                                                            title={lang === 'sv' ? 'Starta steg-för-steg-guide' : 'Start interactive step guide'}
                                                        >
                                                            <HelpCircle size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
                                                            <span>{lang === 'sv' ? 'Hjälp' : 'Help'}</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={onSkipClick}
                                                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                                                        >
                                                            <span>{lang === 'sv' ? 'Hoppa över' : 'Skip'}</span>
                                                            <ChevronRight size={14} className="shrink-0" />
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