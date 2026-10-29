// src/components/live/student/components/DynamicResponseInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Check, Send, Lock } from 'lucide-react';
import SmartMathInput from '../../../ui/SmartMathInput';

// Robust math renderer that forces color inheritance over global theme.css .math-content
// and ensures proper delimiters and bracketed exponents for KaTeX rendering
const MathLabel = ({ content, className = "" }) => {
    const containerRef = useRef(null);

    // 1. Bracket bare exponents (e.g. 10^5 -> 10^{5}, x^2 -> x^{2})
    let str = String(content || '').trim();
    str = str.replace(/\^([+-]?\w+)(?!\{)/g, '^{$1}');

    // 2. Ensure math syntax is properly enclosed in $...$
    const hasDelimiters = str.startsWith('$') && str.endsWith('$');
    const inner = hasDelimiters ? str.slice(1, -1).trim() : str;
    const hasMathSyntax = /\\cdot|\\frac|\^|_|\\times|\\div|[+\-=]/.test(inner);
    const displayContent = hasMathSyntax ? `$${inner}$` : str;

    useEffect(() => {
        if (!containerRef.current) return;
        
        // Set displayContent containing delimiters so KaTeX parses it
        containerRef.current.innerText = displayContent;

        if (window.renderMathInElement) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false,
                trust: true
            });
        }
    }, [displayContent]);

    return (
        <span 
            ref={containerRef} 
            className={`math-content font-bold ${className}`}
            style={{ color: 'inherit' }} // Overrides .math-content { color: var(--text-main); }
        />
    );
};

export default function DynamicResponseInput({
    question,
    activityMode = 'activity_four_corners',
    revealedPhase = 'commit',
    onSubmit,
    disabled = false,
    lang = 'sv',
    initialAnswer = ''
}) {
    const responseSpec = question?.responseSpec || {};
    const type = responseSpec.type || 'single_choice';
    const options = responseSpec.options || question?.renderData?.options || [];

    const [selectedChoice, setSelectedChoice] = useState(initialAnswer);
    const [textAnswer, setTextAnswer] = useState(initialAnswer);
    const [isCommitted, setIsCommitted] = useState(Boolean(initialAnswer));

    useEffect(() => {
        setSelectedChoice(initialAnswer || '');
        setTextAnswer(initialAnswer || '');
        setIsCommitted(Boolean(initialAnswer));
    }, [question?.id, question?.regenVersion, initialAnswer]);

    const handleCommit = (answerPayload) => {
        if (disabled || isCommitted) return;
        setIsCommitted(true);
        if (onSubmit) {
            onSubmit(answerPayload);
        }
    };

    // ─────────────────────────────────────────────────────────────
    // 1. FOUR CORNERS TACTILE VIEW (Theme-Adaptive & High-Contrast)
    // ─────────────────────────────────────────────────────────────
    if (activityMode === 'activity_four_corners' || (type === 'single_choice' && options.length === 4)) {
        
        // High-contrast palettes for both Light & Dark modes
        const CORNER_THEMES = {
            A: {
                idleBg: 'bg-indigo-50 border-indigo-300 text-indigo-950 dark:bg-indigo-950/70 dark:border-indigo-500/50 dark:text-indigo-100 hover:border-indigo-500 dark:hover:border-indigo-400',
                selectedBg: 'bg-indigo-600 border-indigo-700 text-white shadow-xl ring-4 ring-indigo-500/30 dark:ring-indigo-500/50',
                pill: 'bg-indigo-600 text-white',
                selectedPill: 'bg-white text-indigo-700 font-black'
            },
            B: {
                idleBg: 'bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/70 dark:border-emerald-500/50 dark:text-emerald-100 hover:border-emerald-500 dark:hover:border-emerald-400',
                selectedBg: 'bg-emerald-600 border-emerald-700 text-white shadow-xl ring-4 ring-emerald-500/30 dark:ring-emerald-500/50',
                pill: 'bg-emerald-600 text-white',
                selectedPill: 'bg-white text-emerald-700 font-black'
            },
            C: {
                idleBg: 'bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/70 dark:border-amber-500/50 dark:text-amber-100 hover:border-amber-500 dark:hover:border-amber-400',
                selectedBg: 'bg-amber-600 border-amber-700 text-white shadow-xl ring-4 ring-amber-500/30 dark:ring-amber-500/50',
                pill: 'bg-amber-600 text-white',
                selectedPill: 'bg-white text-amber-700 font-black'
            },
            D: {
                idleBg: 'bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/70 dark:border-rose-500/50 dark:text-rose-100 hover:border-rose-500 dark:hover:border-rose-400',
                selectedBg: 'bg-rose-600 border-rose-700 text-white shadow-xl ring-4 ring-rose-500/30 dark:ring-rose-500/50',
                pill: 'bg-rose-600 text-white',
                selectedPill: 'bg-white text-rose-700 font-black'
            }
        };

        return (
            <div className="w-full h-full flex flex-col justify-between p-2 gap-3 select-none">
                {/* 4 Quadrants Grid */}
                <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 min-h-[320px]">
                    {options.map((opt, idx) => {
                        const letter = ['A', 'B', 'C', 'D'][idx] || opt.id;
                        const isSelected = selectedChoice === letter;
                        const theme = CORNER_THEMES[letter] || CORNER_THEMES.A;

                        return (
                            <button
                                key={letter}
                                type="button"
                                disabled={disabled || isCommitted}
                                onClick={() => {
                                    setSelectedChoice(letter);
                                    handleCommit(letter);
                                }}
                                className={`relative rounded-3xl border-2 p-4 flex flex-col justify-between items-center text-center transition-all duration-200 cursor-pointer active:scale-95 disabled:cursor-default ${
                                    isSelected 
                                        ? theme.selectedBg 
                                        : theme.idleBg
                                } ${isCommitted && !isSelected ? 'opacity-35 grayscale-[50%]' : ''}`}
                            >
                                {/* Header Badge */}
                                <div className="w-full flex items-center justify-between">
                                    <span className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-md ${
                                        isSelected ? theme.selectedPill : theme.pill
                                    }`}>
                                        {letter}
                                    </span>
                                    {isSelected && (
                                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white">
                                            <Check size={14} /> {lang === 'sv' ? "Låst" : "Locked"}
                                        </div>
                                    )}
                                </div>

                                {/* Option Value / Math Formula with Forced Color Inheritance */}
                                <div 
                                    className="my-auto py-2 text-2xl sm:text-3xl font-black tracking-wide drop-shadow-xs"
                                    style={{ color: 'inherit' }}
                                >
                                    <MathLabel content={String(opt.label || opt)} />
                                </div>

                                {/* Corner Name Label */}
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: 'inherit' }}>
                                    {lang === 'sv' ? `Hörn ${letter}` : `Corner ${letter}`}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Permanent Lock-In Status Strip */}
                {isCommitted && (
                    <div 
                        className="rounded-2xl p-3.5 px-5 flex items-center justify-between shadow-xl border animate-in slide-in-from-bottom-2 duration-200"
                        style={{ 
                            backgroundColor: 'var(--bg-card, #ffffff)', 
                            borderColor: 'var(--border-main, #e2e8f0)',
                            color: 'var(--text-main, #0f172a)'
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Lock size={15} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    {lang === 'sv' ? "Svar inlämnat & låst" : "Answer submitted & locked"}
                                </span>
                                <span className="text-xs font-bold opacity-80">
                                    {lang === 'sv' ? `Du valde Hörn ${selectedChoice}` : `You picked Corner ${selectedChoice}`}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Fallback: Standard numeric
    return (
        <div 
            className="w-full flex flex-col gap-3 p-4 rounded-3xl border shadow-sm"
            style={{ 
                backgroundColor: 'var(--bg-card, #ffffff)', 
                borderColor: 'var(--border-main, #e2e8f0)',
                color: 'var(--text-main, #0f172a)'
            }}
        >
            <SmartMathInput
                value={textAnswer}
                onChange={setTextAnswer}
                disabled={disabled || isCommitted}
                placeholder={lang === 'sv' ? "Ditt svar..." : "Your answer..."}
            />

            <button
                type="button"
                disabled={disabled || isCommitted || !textAnswer}
                onClick={() => handleCommit(textAnswer)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
            >
                <Check size={16} /> {isCommitted ? (lang === 'sv' ? "Svar Låst" : "Locked In") : (lang === 'sv' ? "Lås In Svar" : "Lock In Answer")}
            </button>
        </div>
    );
}