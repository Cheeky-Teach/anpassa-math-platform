import React, { useState, useRef, useEffect } from 'react';
import { 
    ChevronLeft, ChevronRight, BookOpen, Eye, List, Layers, 
    RotateCcw, RefreshCw, Sparkles, CheckCircle2, ChevronDown, ChevronUp 
} from 'lucide-react';
import MathDisplay from './MathDisplay';
import VisualRenderer from '../visuals/VisualRenderer';
import { compileAnchoredStory } from '../../core/utils/storyCompiler';
import { DEFAULT_THEME, PRESENTATION_THEMES } from '../../constants/presentationThemes';

export default function InstructionSlideCard({ 
    question, 
    lang = 'sv', 
    readOnly = false,
    theme = null,
    onRegenerate = null
}) {
    // -1 = Nothing revealed yet (initial state, problem prompt only)
    const [revealedIndex, setRevealedIndex] = useState(-1);
    const [displayStyle, setDisplayStyle] = useState('accumulate'); 
    const [isCycling, setIsCycling] = useState(false);

    // 🟢 LAYOUT SELECTOR: Change this key to test different layout styles!
    // Options: 'concept2_board' (Derivation Board) | 'concept1_ribbon' (Dual-Rail) | 'concept3_accordion' (Accordion)
    const [activeLayoutVariant, setActiveLayoutVariant] = useState('concept1_ribbon');

    // Safe Theme Ingestion
    const currentTheme = (typeof theme === 'string' ? PRESENTATION_THEMES[theme] : theme) 
        || PRESENTATION_THEMES[DEFAULT_THEME];

    // Reset step progress whenever the slide/question changes
    useEffect(() => {
        setRevealedIndex(-1);
    }, [question?.id, question?.regenVersion]);

    if (!question) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center select-none font-sans">
                <BookOpen size={48} className="text-slate-300 mb-3" />
                <p className="text-sm font-bold uppercase tracking-widest">
                    {lang === 'sv' ? "Ingen uppgift bunden till denna genomgång" : "No question bound to this instruction slide"}
                </p>
            </div>
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
        <div className={`w-full h-full p-4 sm:p-6 flex flex-col justify-start select-none overflow-hidden font-sans transition-colors duration-300 ${currentTheme.wrapperClass}`}>
            
            {/* 1. TOP TOOLBAR STRIP */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2.5 shrink-0 mb-3">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-black/5 dark:bg-white/10 rounded-lg shadow-xs">
                        <BookOpen size={15} className={currentTheme.accentText} />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider">
                        {lang === 'sv' ? "Instruktion • Genomgång" : "Direct Instruction"}
                    </span>
                    {hasClues && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 opacity-80">
                            {isStarted 
                                ? `${lang === 'sv' ? 'Steg' : 'Step'} ${revealedIndex + 1} / ${totalSteps}` 
                                : `${totalSteps} ${lang === 'sv' ? 'steg redo' : 'steps ready'}`}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Dev/Teacher Layout Switcher Pill */}
                    <div className="flex bg-black/5 dark:bg-white/10 p-0.5 rounded-xl border border-black/10 dark:border-white/10 text-[9px] font-black uppercase">
                        <button
                            type="button"
                            onClick={() => setActiveLayoutVariant('concept2_board')}
                            className={`px-2 py-1 rounded-lg transition-all ${activeLayoutVariant === 'concept2_board' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'opacity-50 hover:opacity-80'}`}
                            title="Koncept 2: Derivation Board (Matematik uppe, Förklaring nere)"
                        >
                            {lang === 'sv' ? "Tavla" : "Board"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveLayoutVariant('concept1_ribbon')}
                            className={`px-2 py-1 rounded-lg transition-all ${activeLayoutVariant === 'concept1_ribbon' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'opacity-50 hover:opacity-80'}`}
                            title="Koncept 1: Dual-Rail Ribbon (Sida vid sida per steg)"
                        >
                            {lang === 'sv' ? "Band" : "Ribbon"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveLayoutVariant('concept3_accordion')}
                            className={`px-2 py-1 rounded-lg transition-all ${activeLayoutVariant === 'concept3_accordion' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'opacity-50 hover:opacity-80'}`}
                            title="Koncept 3: Accordion (Expanderbara förklaringar)"
                        >
                            {lang === 'sv' ? "Dragspel" : "Fold"}
                        </button>
                    </div>

                    {/* Quick Regen Button */}
                    {onRegenerate && (
                        <button
                            type="button"
                            onClick={handleRegenClick}
                            disabled={isCycling}
                            className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                            <Sparkles size={12} className={isCycling ? "animate-spin" : "text-amber-500"} />
                            <span className="hidden sm:inline">{lang === 'sv' ? "Nytt exempel" : "New Example"}</span>
                        </button>
                    )}

                    {isStarted && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors cursor-pointer"
                            title={lang === 'sv' ? "Dölj alla steg och starta om" : "Reset walkthrough"}
                        >
                            <RotateCcw size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* 2. MAIN STAGE: 40% FIXED ANCHOR | 60% DYNAMIC WORKING STAGE */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 items-stretch overflow-hidden">
                
                {/* 🟢 COLUMN 1: THE ANCHOR (40% Width - cols 1-5) */}
                <div className="col-span-5 h-full flex flex-col justify-between overflow-y-auto custom-scrollbar pr-1">
                    <div className={`rounded-2xl p-4 border flex flex-col transition-all duration-300 ${currentTheme.cardBg}`}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-50">
                                {lang === 'sv' ? "Uppgift" : "Problem"}
                            </span>
                            {hasVisual && (
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 ${currentTheme.accentText}`}>
                                    {lang === 'sv' ? "Figur" : "Figure"}
                                </span>
                            )}
                        </div>

                        {/* Problem Text */}
                        <div className={`text-sm sm:text-base font-bold leading-snug mb-2 ${currentTheme.textMain}`}>
                            <MathDisplay content={compileAnchoredStory(question, lang) || rd?.description || question.text} />
                        </div>

                        {/* Multiple Choice Options if applicable */}
                        {rd?.options && rd.options.length > 0 && (
                            <div className="mt-1 mb-2 grid grid-cols-2 gap-1.5 w-full">
                                {rd.options.map((opt, oIdx) => {
                                    const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                                    return (
                                        <div key={oIdx} className="flex items-center gap-2 p-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                                            <span className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center shrink-0 ${currentTheme.accentText}`}>
                                                {['A','B','C','D','E','F'][oIdx]}
                                            </span>
                                            <MathDisplay content={String(choiceLabel)} className="font-bold text-xs" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Primary Math Expression */}
                        {rd?.latex && !rd?.geometry && (
                            <div className={`my-2 py-2 px-3 rounded-xl border ${currentTheme.cardSurface} ${currentTheme.mathText} text-center font-serif text-lg sm:text-xl shadow-xs`}>
                                <MathDisplay content={`$$${rd.latex}$$`} />
                            </div>
                        )}

                        {/* Large, Protected Geometry Visual Container */}
                        {hasVisual && (
                            <div className="mt-2 w-full flex-1 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 p-3 overflow-hidden min-h-[180px] max-h-[320px]">
                                <div className="w-full h-full flex items-center justify-center origin-center scale-95 [&_svg]:max-h-[220px] [&_svg]:w-auto [&_svg]:h-auto [&_canvas]:max-h-[220px] [&_canvas]:w-auto">
                                    <VisualRenderer data={rd} isWordProblem={false} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step Navigation Bar at base of Left Anchor */}
                    <div className="pt-3 shrink-0 flex items-center justify-between gap-2">
                        {!isStarted ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Eye size={15} />
                                <span>{lang === 'sv' ? "Starta genomgång" : "Start Walkthrough"}</span>
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="p-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold active:scale-95"
                                >
                                    <ChevronLeft size={16} />
                                    <span>{lang === 'sv' ? "Föregående" : "Prev"}</span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {clues.map((_, dotIdx) => (
                                        <button
                                            key={dotIdx}
                                            type="button"
                                            onClick={() => setRevealedIndex(dotIdx)}
                                            className={`h-2 rounded-full transition-all cursor-pointer ${
                                                dotIdx === revealedIndex 
                                                    ? 'w-6 bg-indigo-600' 
                                                    : dotIdx < revealedIndex 
                                                        ? 'w-2 bg-emerald-500' 
                                                        : 'w-2 bg-black/20 dark:bg-white/20 hover:opacity-100'
                                            }`}
                                        />
                                    ))}
                                </div>

                                {isAtLastStep && onRegenerate ? (
                                    <button
                                        type="button"
                                        onClick={handleRegenClick}
                                        disabled={isCycling}
                                        className="p-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-md active:scale-95 disabled:opacity-50"
                                    >
                                        <RefreshCw size={14} className={isCycling ? "animate-spin" : ""} />
                                        <span>{lang === 'sv' ? "Nytt" : "New"}</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={revealedIndex >= totalSteps - 1}
                                        className="p-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95"
                                    >
                                        <span>{lang === 'sv' ? "Nästa" : "Next"}</span>
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* 🟢 COLUMN 2: DYNAMIC STAGE (60% Width - cols 6-12) */}
                <div className="col-span-7 h-full flex flex-col justify-start overflow-hidden">
                    {!isStarted ? (
                        <div className="h-full border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center opacity-40">
                            <Eye size={36} className="mb-2" />
                            <p className="text-xs font-bold uppercase tracking-wider max-w-xs">
                                {lang === 'sv' 
                                    ? "Lösningssteg och förklaringar visas här när genomgången startar." 
                                    : "Solution steps and explanations will appear here."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {activeLayoutVariant === 'concept2_board' && (
                                <DerivationBoardLayout 
                                    clues={clues} 
                                    revealedIndex={revealedIndex}
                                    setRevealedIndex={setRevealedIndex}
                                    currentTheme={currentTheme}
                                    lang={lang}
                                />
                            )}

                            {activeLayoutVariant === 'concept1_ribbon' && (
                                <DualRailRibbonLayout 
                                    clues={clues} 
                                    revealedIndex={revealedIndex}
                                    currentTheme={currentTheme}
                                    lang={lang}
                                />
                            )}

                            {activeLayoutVariant === 'concept3_accordion' && (
                                <AccordionFocusLayout 
                                    clues={clues} 
                                    revealedIndex={revealedIndex}
                                    currentTheme={currentTheme}
                                    lang={lang}
                                />
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}

// ============================================================================
// 🟢 CONCEPT 2: DERIVATION BOARD (Continuous Math Blackboard + Active Insight)
// ============================================================================
function DerivationBoardLayout({ clues, revealedIndex, setRevealedIndex, currentTheme, lang }) {
    const activeClue = clues[revealedIndex] || clues[0];
    const stepsEndRef = useRef(null);

    useEffect(() => {
        stepsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [revealedIndex]);

    return (
        <div className="h-full flex flex-col justify-between gap-3 overflow-hidden">
            {/* Upper Zone: Math Derivation Blackboard */}
            <div className={`flex-1 rounded-2xl p-4 border overflow-y-auto custom-scrollbar flex flex-col space-y-2.5 ${currentTheme.cardBg}`}>
                <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10 mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${currentTheme.textMuted}`}>
                        {lang === 'sv' ? "Matematisk härledning" : "Mathematical Derivation"}
                    </span>
                    <span className={`text-[9px] font-bold ${currentTheme.textMuted}`}>
                        {revealedIndex + 1} / {clues.length}
                    </span>
                </div>

                {clues.slice(0, revealedIndex + 1).map((step, idx) => {
                    const isActive = idx === revealedIndex;
                    if (!step.latex) return null;

                    return (
                        <div
                            key={`derivation-${idx}`}
                            onClick={() => setRevealedIndex(idx)}
                            className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                                isActive 
                                    ? currentTheme.activeCardBg 
                                    : `${currentTheme.cardSurface} opacity-50 hover:opacity-85`
                            }`}
                        >
                            {/* Step Number Badge */}
                            <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                                isActive ? 'bg-current/20 font-black' : 'bg-black/10 dark:bg-white/10 opacity-70'
                            }`}>
                                {idx + 1}
                            </span>
                            
                            {/* 🟢 High-contrast Math Equation */}
                            <div className={`flex-1 text-center font-serif text-lg sm:text-xl ${
                                isActive ? currentTheme.activeMathText : currentTheme.mathText
                            }`}>
                                <MathDisplay content={`$$${step.latex}$$`} />
                            </div>

                            <span className={`w-5 text-right text-[10px] ${
                                isActive ? currentTheme.accentText : 'opacity-0'
                            }`}>
                                {isActive ? '◄' : ''}
                            </span>
                        </div>
                    );
                })}
                <div ref={stepsEndRef} />
            </div>

            {/* Lower Zone: Pedagogical Insight Deck (Theme-adapted text colors) */}
            <div className={`h-[140px] shrink-0 rounded-2xl p-4 border flex flex-col justify-between animate-in fade-in duration-200 shadow-sm ${currentTheme.insightBox}`}>
                <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${currentTheme.insightTitle}`}>
                        {lang === 'sv' ? `Förklaring till steg ${revealedIndex + 1}` : `Explanation for step ${revealedIndex + 1}`}
                    </span>
                    <span className="text-[9px] font-bold opacity-75">💡 Insight</span>
                </div>

                {/* Text explanation using currentTheme.activeText */}
                <div className={`flex-1 flex items-center my-1 text-xs sm:text-sm font-bold leading-relaxed overflow-y-auto custom-scrollbar ${currentTheme.activeText}`}>
                    <MathDisplay content={activeClue.text || (lang === 'sv' ? "Utför beräkningen ovan." : "Perform the calculation above.")} />
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// 🟢 CONCEPT 1: DUAL-RAIL RIBBON (Horizontal Row Pairing: Why + What)
// ============================================================================
function DualRailRibbonLayout({ clues, revealedIndex, currentTheme, lang }) {
    const listEndRef = useRef(null);

    useEffect(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [revealedIndex]);

    return (
        <div className="h-full overflow-y-auto custom-scrollbar space-y-3 pr-1">
            {clues.slice(0, revealedIndex + 1).map((step, idx) => {
                const isActive = idx === revealedIndex;

                return (
                    <div 
                        key={`ribbon-${idx}`}
                        className={`rounded-2xl border p-3.5 transition-all duration-200 flex flex-col sm:flex-row items-stretch gap-3 ${
                            isActive 
                                ? currentTheme.activeCardBg 
                                : `${currentTheme.cardSurface} opacity-50 hover:opacity-85`
                        }`}
                    >
                        {/* Step Marker */}
                        <div className="flex sm:flex-col items-center justify-between shrink-0 sm:border-r border-black/10 dark:border-white/10 sm:pr-3">
                            <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center ${
                                isActive ? 'bg-current/20 text-current' : 'bg-black/10 dark:bg-white/10 opacity-70'
                            }`}>
                                {idx + 1}
                            </span>
                        </div>

                        {/* Rail A: Text Commentary */}
                        <div className={`flex-1 flex items-center text-xs sm:text-sm font-bold leading-relaxed border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10 pb-2 sm:pb-0 sm:pr-3 ${
                            isActive ? currentTheme.activeText : currentTheme.textMain
                        }`}>
                            <MathDisplay content={step.text} />
                        </div>

                        {/* Rail B: Math Expression */}
                        <div className={`flex-1 flex items-center justify-center font-serif text-base sm:text-lg min-w-[140px] py-1 rounded-xl px-2 ${
                            isActive ? currentTheme.activeMathText : currentTheme.mathText
                        }`}>
                            {step.latex ? (
                                <MathDisplay content={`$$${step.latex}$$`} />
                            ) : (
                                <span className={`text-xs italic ${currentTheme.textMuted}`}>
                                    {lang === 'sv' ? "Se text" : "See text"}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={listEndRef} />
        </div>
    );
}

// ============================================================================
// 🟢 CONCEPT 3: ACCORDION FOCUS (Compact Math Pills with Collapsible Drawers)
// ============================================================================
function AccordionFocusLayout({ clues, revealedIndex, currentTheme, lang }) {
    const [openStepIndices, setOpenStepIndices] = useState([revealedIndex]);

    useEffect(() => {
        setOpenStepIndices([revealedIndex]);
    }, [revealedIndex]);

    const toggleOpen = (idx) => {
        setOpenStepIndices(prev => 
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {clues.slice(0, revealedIndex + 1).map((step, idx) => {
                const isOpen = openStepIndices.includes(idx);
                const isActive = idx === revealedIndex;

                return (
                    <div 
                        key={`accordion-${idx}`}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                            isActive 
                                ? currentTheme.activeCardBg 
                                : `${currentTheme.cardSurface} opacity-55 hover:opacity-85`
                        }`}
                    >
                        {/* Header Math Strip */}
                        <div 
                            onClick={() => toggleOpen(idx)}
                            className="p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                        >
                            <span className={`w-5 h-5 rounded-md font-black text-[10px] flex items-center justify-center shrink-0 ${
                                isActive ? 'bg-current/20 text-current' : 'bg-black/10 dark:bg-white/10 opacity-70'
                            }`}>
                                {idx + 1}
                            </span>

                            <div className={`flex-1 text-center font-serif text-base sm:text-lg truncate ${
                                isActive ? currentTheme.activeMathText : currentTheme.mathText
                            }`}>
                                {step.latex ? (
                                    <MathDisplay content={`$$${step.latex}$$`} />
                                ) : (
                                    <span className={`text-xs font-bold ${isActive ? currentTheme.activeText : currentTheme.textMain}`}>
                                        {step.text}
                                    </span>
                                )}
                            </div>

                            <button type="button" className="p-1 opacity-60 hover:opacity-100">
                                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>

                        {/* Collapsible Text Drawer */}
                        {isOpen && step.text && (
                            <div className={`px-4 py-3 border-t border-black/10 dark:border-white/10 text-xs sm:text-sm font-bold leading-relaxed border-l-4 border-l-amber-400 ${currentTheme.insightBox}`}>
                                <MathDisplay content={step.text} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}