import React, { useState, useRef, useEffect } from 'react';
import { 
    ChevronLeft, ChevronRight, BookOpen, Eye, List, Layers, RotateCcw, RefreshCw, Sparkles, CheckCircle2 
} from 'lucide-react';
import MathDisplay from './MathDisplay';
import VisualRenderer from '../visuals/VisualRenderer';
import { compileAnchoredStory } from '../../core/utils/storyCompiler';

export default function InstructionSlideCard({ 
    question, 
    lang = 'sv', 
    readOnly = false,
    onRegenerate = null
}) {
    // -1 = Nothing revealed yet (initial state, problem prompt only)
    const [revealedIndex, setRevealedIndex] = useState(-1);
    const [displayStyle, setDisplayStyle] = useState('accumulate'); 
    const [isCycling, setIsCycling] = useState(false);

    const mathStackEndRef = useRef(null);
    const textStackEndRef = useRef(null);

    // Reset step progress whenever the slide/question changes
    useEffect(() => {
        setRevealedIndex(-1);
    }, [question?.id, question?.regenVersion]);

    // Scroll newest step into view
    useEffect(() => {
        if (mathStackEndRef.current) {
            mathStackEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (textStackEndRef.current) {
            textStackEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [revealedIndex]);

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

    const promptPadding = hasVisual ? 'p-3 sm:p-4' : 'p-4 sm:p-5';
    const promptTextSize = hasVisual ? 'text-sm sm:text-base' : 'text-base sm:text-lg';

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

    const count = revealedIndex + 1;
    const dynamicMathSize = count <= 1 
        ? 'text-2xl sm:text-3xl' 
        : count === 2 
            ? 'text-xl sm:text-2xl' 
            : count === 3 
                ? 'text-lg sm:text-xl' 
                : 'text-base sm:text-lg';

    const dynamicTextSize = count <= 2 
        ? 'text-sm sm:text-base' 
        : 'text-xs sm:text-sm';

    const dynamicPadding = count <= 2 ? 'p-4' : 'p-2.5';

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
        <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-start select-none overflow-hidden font-sans bg-[#f9fbf7]">
            
            {/* Top Toolbar Strip */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0 mb-4">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shadow-sm border border-indigo-100">
                        <BookOpen size={16} />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                        {lang === 'sv' ? "Instruktion • Genomgång" : "Direct Instruction"}
                    </span>
                    {hasClues && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-white text-slate-500 border-slate-200">
                            {isStarted 
                                ? `${lang === 'sv' ? 'Steg' : 'Step'} ${revealedIndex + 1} / ${totalSteps}` 
                                : `${totalSteps} ${lang === 'sv' ? 'steg redo' : 'steps ready'}`}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Header Quick Regen */}
                    {onRegenerate && (
                        <button
                            type="button"
                            onClick={handleRegenClick}
                            disabled={isCycling}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                            title={lang === 'sv' ? "Generera ett nytt exempel med samma uppgiftstyp" : "Generate another example"}
                        >
                            <Sparkles size={12} className={isCycling ? "animate-spin" : "text-amber-500"} />
                            <span>{lang === 'sv' ? "Nytt exempel" : "New Example"}</span>
                        </button>
                    )}

                    {/* Display Style Toggle (List vs Single) */}
                    {hasClues && (
                        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 shadow-inner">
                            <button
                                type="button"
                                onClick={() => setDisplayStyle('accumulate')}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                                    displayStyle === 'accumulate' 
                                        ? 'bg-white text-indigo-600 shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                                title={lang === 'sv' ? "Bygg upp som en lista" : "Build up as list"}
                            >
                                <List size={12} />
                                <span className="hidden sm:inline">{lang === 'sv' ? "Samlad lista" : "List"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDisplayStyle('single')}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                                    displayStyle === 'single' 
                                        ? 'bg-white text-indigo-600 shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                                title={lang === 'sv' ? "Visa endast aktivt steg" : "Show active step only"}
                            >
                                <Layers size={12} />
                                <span className="hidden sm:inline">{lang === 'sv' ? "Stegvis" : "Step"}</span>
                            </button>
                        </div>
                    )}

                    {isStarted && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            title={lang === 'sv' ? "Dölj alla steg och starta om" : "Reset walkthrough"}
                        >
                            <RotateCcw size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Stage: Two Top-Aligned Columns */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 items-start overflow-hidden">
                
                {/* LEFT COLUMN: Problem Prompt & Math Steps */}
                <div className="h-full flex flex-col justify-start overflow-y-auto custom-scrollbar pr-2 border-r border-slate-200/60 space-y-4">
                    <div className={`bg-white rounded-2xl ${promptPadding} border border-slate-200 shadow-sm shrink-0 flex flex-col transition-all duration-300`}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                {lang === 'sv' ? "Uppgift" : "Problem"}
                            </span>
                            {hasVisual && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                                    {lang === 'sv' ? "Figur" : "Figure"}
                                </span>
                            )}
                        </div>

                        <div className={`${promptTextSize} font-bold text-slate-800 leading-snug`}>
                            <MathDisplay content={compileAnchoredStory(question, lang) || rd?.description || question.text} />
                        </div>

                        {rd?.latex && !rd?.geometry && (
                            <div className={`mt-2 ${hasVisual ? 'py-1.5 px-3 text-lg sm:text-xl' : 'py-2.5 px-4 text-xl sm:text-2xl'} bg-indigo-50/40 rounded-xl border border-indigo-100 text-center font-serif text-slate-900 shadow-xs transition-all`}>
                                <MathDisplay content={`$$${rd.latex}$$`} />
                            </div>
                        )}

                        {hasVisual && (
                            <div className="mt-2.5 w-full flex items-center justify-center bg-slate-50/60 rounded-xl border border-slate-100 p-2 overflow-hidden max-h-[180px] sm:max-h-[200px]">
                                <div className="w-full h-full flex items-center justify-center origin-center scale-90 sm:scale-95 [&_svg]:max-h-[160px] [&_svg]:w-auto [&_svg]:h-auto [&_canvas]:max-h-[160px] [&_canvas]:w-auto">
                                    <VisualRenderer data={rd} isWordProblem={false} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col justify-start space-y-2.5 min-h-[140px]">
                        {!isStarted ? (
                            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                                <Eye size={28} className="opacity-40 mb-2" />
                                <p className="text-xs font-bold uppercase tracking-wider">
                                    {lang === 'sv' ? "Klicka på 'Starta genomgång' för att visa stegen" : "Click 'Start walkthrough' to reveal solution steps"}
                                </p>
                            </div>
                        ) : (
                            clues
                                .slice(0, revealedIndex + 1)
                                .map((step, idx) => {
                                    const isActive = idx === revealedIndex;
                                    if (displayStyle === 'single' && !isActive) return null;
                                    if (!step.latex) return null;

                                    return (
                                        <div 
                                            key={`math-step-${idx}`}
                                            className={`rounded-2xl transition-all duration-300 font-serif text-center border ${dynamicPadding} ${
                                                isActive 
                                                    ? 'bg-white border-indigo-400 text-indigo-950 shadow-md ring-2 ring-indigo-100' 
                                                    : 'bg-slate-50/60 border-slate-200/80 text-slate-600 opacity-60 scale-[0.98]'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between text-[9px] font-sans font-black uppercase text-indigo-500 mb-1">
                                                <span>{lang === 'sv' ? `Steg ${idx + 1}` : `Step ${idx + 1}`}</span>
                                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                                            </div>
                                            <div className={dynamicMathSize}>
                                                <MathDisplay content={`$$${step.latex}$$`} />
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                        <div ref={mathStackEndRef} />
                    </div>
                </div>

                {/* RIGHT COLUMN: Explanatory Text Guidance & Controls */}
                <div className="h-full flex flex-col justify-between overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 py-1">
                        {!isStarted ? (
                            <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                                <p className="text-xs font-bold uppercase tracking-wider leading-relaxed max-w-xs">
                                    {lang === 'sv' 
                                        ? "Förklaringar och resonemang visas här i takt med att du stegar framåt." 
                                        : "Explanations and reasoning will appear here as you step forward."}
                                </p>
                            </div>
                        ) : (
                            <>
                                {clues
                                    .slice(0, revealedIndex + 1)
                                    .map((step, idx) => {
                                        const isActive = idx === revealedIndex;
                                        if (displayStyle === 'single' && !isActive) return null;

                                        return (
                                            <div 
                                                key={`text-step-${idx}`}
                                                className={`rounded-2xl transition-all duration-300 border ${dynamicPadding} ${
                                                    isActive
                                                        ? 'bg-white border-amber-300 border-l-6 border-l-amber-400 shadow-md'
                                                        : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-50 scale-[0.98]'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-amber-700' : 'text-slate-400'}`}>
                                                        {lang === 'sv' ? `Förklaring steg ${idx + 1}` : `Explanation step ${idx + 1}`}
                                                    </span>
                                                </div>
                                                
                                                <div className={`font-bold leading-relaxed text-slate-800 ${dynamicTextSize}`}>
                                                    <MathDisplay content={step.text} />
                                                </div>
                                            </div>
                                        );
                                    })}

                                {/* 🟢 NEW: End-of-Walkthrough Callout directly underneath the last clue */}
                                {isAtLastStep && onRegenerate && (
                                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center text-center gap-3">
                                        <div className="flex items-center gap-1.5 text-emerald-700 font-black text-xs uppercase tracking-wider">
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                            <span>{lang === 'sv' ? "Genomgång klar!" : "Walkthrough complete!"}</span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-600 leading-relaxed max-w-xs">
                                            {lang === 'sv' 
                                                ? "Vill du se samma metod med nya siffror och värden?" 
                                                : "Want to see the same method with new numbers and values?"}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleRegenClick}
                                            disabled={isCycling}
                                            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <RefreshCw size={14} className={isCycling ? "animate-spin" : ""} />
                                            <span>{lang === 'sv' ? "Slumpa nytt exempel" : "Try Another Example"}</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                        <div ref={textStackEndRef} />
                    </div>

                    {/* Action Footbar */}
                    <div className="pt-3 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3 mt-2">
                        {!isStarted ? (
                            <div className="w-full flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <Eye size={16} />
                                    <span>{lang === 'sv' ? "Starta genomgång (Steg 1)" : "Start Walkthrough (Step 1)"}</span>
                                </button>

                                {onRegenerate && (
                                    <button
                                        type="button"
                                        onClick={handleRegenClick}
                                        disabled={isCycling}
                                        className="px-4 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                                        title={lang === 'sv' ? "Slumpa fram ett nytt exempel med samma form" : "Generate another variation"}
                                    >
                                        <RefreshCw size={14} className={isCycling ? "animate-spin" : ""} />
                                        <span className="hidden sm:inline">{lang === 'sv' ? "Nytt exempel" : "New"}</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold active:scale-95"
                                >
                                    <ChevronLeft size={16} />
                                    <span>{lang === 'sv' ? "Föregående" : "Previous"}</span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {clues.map((_, dotIdx) => (
                                        <button
                                            key={dotIdx}
                                            type="button"
                                            onClick={() => setRevealedIndex(dotIdx)}
                                            className={`h-2 rounded-full transition-all ${
                                                dotIdx === revealedIndex 
                                                    ? 'w-6 bg-indigo-600' 
                                                    : dotIdx < revealedIndex 
                                                        ? 'w-2 bg-emerald-500' 
                                                        : 'w-2 bg-slate-200 hover:bg-slate-300'
                                            }`}
                                        />
                                    ))}
                                </div>

                                {/* 🟢 Dynamic Footbar: Shows 'Nytt exempel' when at last step, or 'Nästa steg' otherwise */}
                                {isAtLastStep && onRegenerate ? (
                                    <button
                                        type="button"
                                        onClick={handleRegenClick}
                                        disabled={isCycling}
                                        className="p-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-md active:scale-95 disabled:opacity-50"
                                    >
                                        <RefreshCw size={14} className={isCycling ? "animate-spin" : ""} />
                                        <span>{lang === 'sv' ? "Nytt exempel" : "New Example"}</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={revealedIndex >= totalSteps - 1}
                                        className="p-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95"
                                    >
                                        <span>{lang === 'sv' ? "Nästa steg" : "Next step"}</span>
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}