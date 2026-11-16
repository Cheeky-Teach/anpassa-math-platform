// src/components/shared/InstructionSlideCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, BookOpen, Eye, RefreshCw,
    RotateCcw, Sparkles, CheckCircle2, ChevronDown, ChevronUp 
} from 'lucide-react';
import MathDisplay from './MathDisplay';
import VisualRenderer from '../visuals/VisualRenderer';
import { compileAnchoredStory } from '../../core/utils/storyCompiler';
import { DEFAULT_THEME, PRESENTATION_THEMES } from '../../constants/presentationThemes';

// Scale presets controlling text and KaTeX font dimensions across all views
const SCALE_PRESETS = {
    normal: {
        label: '100%',
        promptText: 'text-xs sm:text-sm',
        promptLatex: 'text-base sm:text-lg',
        derivationMath: 'text-base sm:text-lg',
        insightText: 'text-xs',
        ribbonMath: 'text-sm sm:text-base',
        ribbonText: 'text-xs',
        accordionMath: 'text-sm sm:text-base',
        accordionText: 'text-xs'
    },
    large: {
        label: '125%',
        promptText: 'text-sm sm:text-base',
        promptLatex: 'text-lg sm:text-xl',
        derivationMath: 'text-lg sm:text-xl font-semibold',
        insightText: 'text-xs sm:text-sm font-medium',
        ribbonMath: 'text-base sm:text-lg font-semibold',
        ribbonText: 'text-xs sm:text-sm font-medium',
        accordionMath: 'text-base sm:text-lg font-semibold',
        accordionText: 'text-xs sm:text-sm font-medium'
    },
    xl: {
        label: '150%',
        promptText: 'text-base sm:text-lg',
        promptLatex: 'text-xl sm:text-2xl',
        derivationMath: 'text-xl sm:text-2xl font-bold',
        insightText: 'text-sm sm:text-base font-bold',
        ribbonMath: 'text-lg sm:text-xl font-bold',
        ribbonText: 'text-sm sm:text-base font-bold',
        accordionMath: 'text-lg sm:text-xl font-bold',
        accordionText: 'text-sm sm:text-base font-bold'
    }
};

export default function InstructionSlideCard({ 
    question, 
    lang = 'sv', 
    readOnly = false,
    theme = null,
    onRegenerate = null
}) {
    const [revealedIndex, setRevealedIndex] = useState(-1);
    const [isCycling, setIsCycling] = useState(false);

    const [activeLayoutVariant, setActiveLayoutVariant] = useState('concept1_ribbon');
    const [walkthroughScale, setWalkthroughScale] = useState('large');
    const currentScale = SCALE_PRESETS[walkthroughScale] || SCALE_PRESETS.normal;

    const currentTheme = (typeof theme === 'string' ? PRESENTATION_THEMES[theme] : theme) 
        || PRESENTATION_THEMES[DEFAULT_THEME];

    useEffect(() => {
        setRevealedIndex(-1);
    }, [question?.id, question?.regenVersion]);

    if (!question) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center text-[var(--text-muted)] p-8 text-center select-none font-sans"
            >
                <BookOpen size={40} className="text-[var(--text-muted)] opacity-50 mb-2.5" />
                <p className="text-xs font-bold uppercase tracking-wider">
                    {lang === 'sv' ? "Ingen uppgift bunden till denna genomgång" : "No question bound to this instruction slide"}
                </p>
            </motion.div>
        );
    }

    const rd = question.resolvedData?.renderData;
    const hasVisual = !!(rd && (rd.graph || rd.geometry || rd.pattern || rd.volume || rd.marbles || rd.spinner || rd.freqTable || rd.percentGrid || rd.scale || rd.similarity || rd.tree));

    const rawClues = question.clues || question.resolvedData?.clues || [];
    const clues = rawClues.map(c => {
        if (typeof c === 'object' && c !== null) {
            return {
                text: c[lang] || c.text || '',
                latex: c.latex || null
            };
        }
        return { text: String(c), latex: null };
    });

    const totalSteps = clues.length;
    const hasClues = totalSteps > 0;
    const isStarted = revealedIndex >= 0;
    const isAtLastStep = hasClues && revealedIndex === totalSteps - 1;

    const handleNext = () => {
        if (revealedIndex < totalSteps - 1) {
            setRevealedIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        setRevealedIndex(prev => Math.max(-1, prev - 1));
    };

    const handleReset = () => {
        setRevealedIndex(-1);
    };

    const handleRegenClick = async () => {
        if (!onRegenerate || isCycling) return;
        setIsCycling(true);
        try {
            await onRegenerate(question.id);
            setRevealedIndex(-1);
        } finally {
            setIsCycling(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="whiteboard-protect w-full h-full p-4 sm:p-5 pb-6 sm:pb-7 flex flex-col justify-start select-none overflow-hidden font-sans bg-[var(--bg-card)] text-[var(--text-main)]"
        >
            
            {/* 1. TOP TOOLBAR STRIP */}
            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-2.5 shrink-0 mb-3 bg-[var(--bg-surface)] px-3 -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 pt-3">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                        <BookOpen size={15} className="text-emerald-600 dark:text-emerald-400" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                        {lang === 'sv' ? "Instruktion • Genomgång" : "Direct Instruction"}
                    </span>
                    {hasClues && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-muted)] font-mono">
                            {isStarted 
                                ? `${lang === 'sv' ? 'Steg' : 'Step'} ${revealedIndex + 1} / ${totalSteps}` 
                                : `${totalSteps} ${lang === 'sv' ? 'steg redo' : 'steps ready'}`}
                        </span>
                    )}

                    {/* TOP-BAR STEP DOTS */}
                    {hasClues && isStarted && (
                        <div className="hidden sm:flex items-center gap-1 ml-2 bg-[var(--bg-card)] px-2 py-1 rounded-xl border border-[var(--border-strong)] shadow-2xs">
                            {clues.map((_, dotIdx) => (
                                <button
                                    key={dotIdx}
                                    type="button"
                                    onClick={() => setRevealedIndex(dotIdx)}
                                    className={`h-2 rounded-full transition-all cursor-pointer ${
                                        dotIdx === revealedIndex 
                                            ? 'w-6 bg-emerald-600' 
                                            : dotIdx < revealedIndex 
                                                ? 'w-2 bg-emerald-600/60' 
                                                : 'w-2 bg-[var(--border-strong)] hover:opacity-80'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* FONT & LATEX ZOOM CONTROLLER PILL */}
                <div className="flex items-center gap-2">
                    <div className="flex bg-[var(--bg-card)] p-0.5 rounded-xl border border-[var(--border-strong)] text-[12px] font-bold uppercase items-center shadow-2xs">
                        <button
                            type="button"
                            onClick={() => setWalkthroughScale('normal')}
                            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                                walkthroughScale === 'normal' 
                                    ? 'bg-emerald-600 text-white shadow-2xs font-bold' 
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                            title={lang === 'sv' ? "Standardstorlek (100%)" : "Standard size (100%)"}
                        >
                            A
                        </button>
                        <button
                            type="button"
                            onClick={() => setWalkthroughScale('large')}
                            className={`px-2 py-1 rounded-lg transition-all text-xs font-bold cursor-pointer ${
                                walkthroughScale === 'large' 
                                    ? 'bg-emerald-600 text-white shadow-2xs font-bold' 
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                            title={lang === 'sv' ? "Stor text (125%)" : "Large text (125%)"}
                        >
                            A+
                        </button>
                        <button
                            type="button"
                            onClick={() => setWalkthroughScale('xl')}
                            className={`px-2 py-1 rounded-lg transition-all text-xs font-bold cursor-pointer ${
                                walkthroughScale === 'xl' 
                                    ? 'bg-emerald-600 text-white shadow-2xs font-bold' 
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                            title={lang === 'sv' ? "Extra stor text för tavla (150%)" : "Extra large text for board (150%)"}
                        >
                            A++
                        </button>
                    </div>

                    {/* Quick Regen Button */}
                    {onRegenerate && (
                        <button
                            type="button"
                            onClick={handleRegenClick}
                            disabled={isCycling}
                            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
                        >
                            <Sparkles size={13} className={isCycling ? "animate-spin" : "text-emerald-600 dark:text-emerald-400"} />
                            <span className="hidden sm:inline">{lang === 'sv' ? "Nytt" : "New"}</span>
                        </button>
                    )}

                    {isStarted && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="p-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-strong)] transition-all cursor-pointer shadow-2xs"
                            title={lang === 'sv' ? "Dölj alla steg och starta om" : "Reset walkthrough"}
                        >
                            <RotateCcw size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* 2. MAIN STAGE */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 items-stretch overflow-hidden">
                
                {/* COLUMN 1: THE ANCHOR (40% Width - cols 1-5) */}
                <div className="col-span-5 h-full flex flex-col justify-between overflow-y-auto custom-scrollbar pr-1">
                    <div className="rounded-xl p-4 border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-2xs flex flex-col transition-all duration-150">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                {lang === 'sv' ? "Uppgift" : "Problem"}
                            </span>
                            {hasVisual && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] text-emerald-700 dark:text-emerald-300 font-mono">
                                    {lang === 'sv' ? "Figur" : "Figure"}
                                </span>
                            )}
                        </div>

                        {/* Problem Text with zoom scaling */}
                        <div className={`${currentScale.promptText} font-bold leading-relaxed mb-2 text-[var(--text-main)]`}>
                            <MathDisplay content={compileAnchoredStory(question, lang) || rd?.description || question.text} />
                        </div>

                        {/* Multiple Choice Options if applicable */}
                        {rd?.options && rd.options.length > 0 && (
                            <div className="mt-1 mb-2 grid grid-cols-2 gap-1.5 w-full">
                                {rd.options.map((opt, oIdx) => {
                                    const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                                    return (
                                        <div key={oIdx} className="flex items-center gap-2 p-1.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)]">
                                            <span className="w-5 h-5 rounded-lg text-[12px] font-bold font-mono flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                                {['A','B','C','D','E','F'][oIdx]}
                                            </span>
                                            <MathDisplay content={String(choiceLabel)} className="font-semibold text-xs text-[var(--text-main)]" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Primary Math Expression */}
                        {rd?.latex && !rd?.geometry && (
                            <div className="my-2 py-2 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-main)] text-center font-serif text-2xl shadow-inner">
                                <MathDisplay content={`$$${rd.latex}$$`} />
                            </div>
                        )}

                        {/* Geometry Visual Container */}
                        {hasVisual && (
                            <div className="mt-2 w-full flex-1 flex items-center justify-center bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-3 overflow-hidden min-h-[160px] max-h-[260px] shadow-2xs">
                                <div className="w-full h-full flex items-center justify-center origin-center scale-95">
                                    <VisualRenderer data={rd} isWordProblem={false} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* STEP NAVIGATION FOOTBAR */}
                    <div className="pt-3 pb-12 sm:pb-14 shrink-0 flex items-center justify-between gap-2 relative z-30 pointer-events-auto">
                        {!isStarted ? (
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-2 pointer-events-auto relative z-30"
                            >
                                <Eye size={15} />
                                <span>{lang === 'sv' ? "Starta genomgång" : "Start Walkthrough"}</span>
                            </motion.button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold active:scale-[0.98] shadow-2xs"
                                >
                                    <ChevronLeft size={16} />
                                    <span>{lang === 'sv' ? "Föregående" : "Prev"}</span>
                                </button>

                                <span className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-muted)]">
                                    {revealedIndex + 1} / {totalSteps}
                                </span>

                                {isAtLastStep && onRegenerate ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={handleRegenClick}
                                        disabled={isCycling}
                                        className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider shadow-2xs disabled:opacity-40"
                                    >
                                        <RefreshCw size={14} className={isCycling ? "animate-spin" : ""} />
                                        <span>{lang === 'sv' ? "Nytt" : "New"}</span>
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={handleNext}
                                        disabled={revealedIndex >= totalSteps - 1}
                                        className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                                    >
                                        <span>{lang === 'sv' ? "Nästa" : "Next"}</span>
                                        <ChevronRight size={16} />
                                    </motion.button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* COLUMN 2: DYNAMIC STAGE (60% Width - cols 6-12) */}
                <div className="col-span-7 h-full flex flex-col justify-start overflow-hidden pb-12 sm:pb-14">
                    {!isStarted ? (
                        <div className="h-full border border-dashed border-[var(--border-strong)] rounded-xl flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-surface)] text-[var(--text-muted)]">
                            <Eye size={32} className="mb-2 opacity-50" />
                            <p className="text-xs font-bold uppercase tracking-wider max-w-xs">
                                {lang === 'sv' 
                                    ? "Lösningssteg och förklaringar visas här när genomgången startar." 
                                    : "Solution steps and explanations will appear here."}
                            </p>
                        </div>
                    ) : (
                        <DualRailRibbonLayout 
                            clues={clues} 
                            revealedIndex={revealedIndex}
                            currentScale={currentScale}
                            lang={lang}
                        />
                    )}
                </div>

            </div>
        </motion.div>
    );
}

// ============================================================================
// DUAL-RAIL RIBBON (Clean, Solid Neutral Active State with Framer Motion)
// ============================================================================
function DualRailRibbonLayout({ clues, revealedIndex, currentScale, lang }) {
    const listEndRef = useRef(null);

    useEffect(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [revealedIndex]);

    return (
        <div className="h-full overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
            <AnimatePresence mode="popLayout">
                {clues.slice(0, revealedIndex + 1).map((step, idx) => {
                    const isActive = idx === revealedIndex;

                    return (
                        <motion.div 
                            key={`ribbon-${idx}`}
                            initial={{ opacity: 0, y: 14, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                            className={`rounded-xl transition-colors duration-150 flex flex-col sm:flex-row items-stretch gap-3 p-3.5 border ${
                                isActive 
                                    ? 'bg-[var(--bg-card)] border-[var(--text-main)] shadow-2xs ring-1 ring-[var(--text-main)]' 
                                    : 'bg-[var(--bg-card)] border-[var(--border-main)] opacity-70'
                            }`}
                        >
                            {/* Step Marker */}
                            <div className="flex sm:flex-col items-center justify-between shrink-0 sm:border-r border-[var(--border-main)] sm:pr-3">
                                <span className={`w-6 h-6 rounded-lg font-bold font-mono text-xs flex items-center justify-center ${
                                    isActive ? 'bg-[var(--text-main)] text-[var(--bg-card)] shadow-2xs' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-strong)]'
                                }`}>
                                    {idx + 1}
                                </span>
                            </div>

                            {/* Rail A: Text Commentary */}
                            <div className={`flex-1 flex items-center ${currentScale.ribbonText} font-semibold leading-relaxed border-b sm:border-b-0 sm:border-r border-[var(--border-main)] pb-2 sm:pb-0 sm:pr-3 text-[var(--text-main)]`}>
                                <MathDisplay content={step.text} />
                            </div>

                            {/* Rail B: Math Expression */}
                            <div className={`flex-1 flex items-center justify-center font-serif ${currentScale.ribbonMath} min-w-[140px] py-1.5 px-3 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] text-[var(--text-main)]`}>
                                {step.latex ? (
                                    <MathDisplay content={`$$${step.latex}$$`} />
                                ) : (
                                    <span className="text-xs font-semibold italic text-[var(--text-muted)]">
                                        {lang === 'sv' ? "Se text" : "See text"}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
            <div ref={listEndRef} />
        </div>
    );
}