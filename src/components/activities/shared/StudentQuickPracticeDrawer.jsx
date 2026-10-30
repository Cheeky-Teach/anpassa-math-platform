// src/components/activities/shared/StudentQuickPracticeDrawer.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, X, CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import MathDisplay from '../../shared/MathDisplay.jsx';
import VisualRenderer from '../../visuals/VisualRenderer.jsx';
import { generateDistractors } from '../../../lib/distractorGenerator.js';
import { extractDecodedAnswer } from '../../live/core/liveAnswerUtils.js';

export default function StudentQuickPracticeDrawer({
    isOpen = false,
    sessionTopics = [],
    lang = 'sv',
    onClose,
    onScoreContributed
}) {
    // ------------------------------------------------------------------------
    // I. BILINGUAL DICTIONARY
    // ------------------------------------------------------------------------
    const t = {
        sv: {
            title: "Snabbräknaren",
            subtitle: "Mental uppvärmning medan du väntar",
            loading: "Hämtar uppgift...",
            pause: "Pausa",
            solved_count: "lösta",
            points_chip: "+10p till Klassens Kraft",
            fallback_prompt: "Vad är värdet?"
        },
        en: {
            title: "Quick Practice",
            subtitle: "Mental warm-up while you wait",
            loading: "Loading problem...",
            pause: "Pause",
            solved_count: "solved",
            points_chip: "+10pts to Class Energy",
            fallback_prompt: "What is the value?"
        }
    }[lang] || {};

    // ------------------------------------------------------------------------
    // II. STATE MANAGEMENT
    // ------------------------------------------------------------------------
    const [practiceQueue, setPracticeQueue] = useState([]);
    const [currentProblem, setCurrentProblem] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [feedbackState, setFeedbackState] = useState(null); // null | 'correct' | 'incorrect'
    const [solvedCount, setSolvedCount] = useState(0);
    const [isFetchingBackground, setIsFetchingBackground] = useState(false);

    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // ------------------------------------------------------------------------
    // III. QUESTION FETCHING & NORMALIZATION ENGINE (Full Visual & LaTeX Support)
    // ------------------------------------------------------------------------
    const fetchSingleProblem = useCallback(async () => {
        const availableTopics = (sessionTopics && sessionTopics.length > 0)
            ? sessionTopics.filter(t => t && t !== 'custom' && t !== 'imported')
            : ['basic_arithmetic'];

        const targetTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)] || 'basic_arithmetic';
        const targetLevel = Math.random() > 0.5 ? 1 : 2;

        const url = `/api/question?topic=${encodeURIComponent(targetTopic)}&level=${targetLevel}&wordProblem=false&lang=${lang}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("API call failed");
            const data = await res.json();

            const rd = data.renderData || data.resolvedData?.renderData || data || {};
            const resolved = data.resolvedData || data;

            const correctAnswer = extractDecodedAnswer(resolved) || 
                                  extractDecodedAnswer(rd) || 
                                  data.answer || 
                                  rd.answer || 
                                  '';

            // Extract visual flags and data
            const hasVisual = Boolean(
                rd.geometry || rd.graph || rd.pattern || rd.marbles || rd.diagram || rd.visualType ||
                data.geometry || data.graph || data.pattern || data.marbles || data.diagram
            );

            // Extract LaTeX from any valid property
            const latexContent = rd.latex || data.latex || resolved.latex || null;

            // Generate or normalize options
            let options = (rd.options && rd.options.length >= 4)
                ? rd.options
                : generateDistractors({
                    correctAnswer,
                    topicId: targetTopic,
                    renderData: rd,
                    resolvedData: resolved,
                    raw: data
                });

            const normalizedOptions = options.slice(0, 4).map((opt, idx) => {
                const label = typeof opt === 'object' ? (opt.label || opt.text || '') : String(opt);
                const isCorrect = typeof opt === 'object' && opt.isCorrect !== undefined
                    ? opt.isCorrect
                    : String(label).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();

                return {
                    id: String.fromCharCode(65 + idx),
                    label,
                    isCorrect
                };
            });

            return {
                id: data.id || crypto.randomUUID(),
                topicId: targetTopic,
                level: targetLevel,
                prompt: rd.description || rd.prompt || data.description || t.fallback_prompt,
                latex: latexContent,
                hasVisual,
                renderData: rd,
                correctAnswer,
                options: normalizedOptions
            };
        } catch (err) {
            console.warn("[StudentQuickPracticeDrawer] Prefetch fallback:", err);
            return null;
        }
    }, [sessionTopics, lang, t.fallback_prompt]);

    // ------------------------------------------------------------------------
    // IV. BUFFER REFILL EFFECT
    // ------------------------------------------------------------------------
    useEffect(() => {
        if (!isOpen) return;

        if (!currentProblem) {
            if (practiceQueue.length > 0) {
                setCurrentProblem(practiceQueue[0]);
                setPracticeQueue(prev => prev.slice(1));
            } else if (!isFetchingBackground) {
                setIsFetchingBackground(true);
                fetchSingleProblem().then(prob => {
                    if (isMounted.current && prob) {
                        setCurrentProblem(prob);
                    }
                    if (isMounted.current) setIsFetchingBackground(false);
                });
            }
        }

        if (practiceQueue.length < 2 && !isFetchingBackground) {
            setIsFetchingBackground(true);
            fetchSingleProblem().then(prob => {
                if (isMounted.current && prob) {
                    setPracticeQueue(prev => [...prev, prob]);
                }
                if (isMounted.current) setIsFetchingBackground(false);
            });
        }
    }, [isOpen, currentProblem, practiceQueue.length, isFetchingBackground, fetchSingleProblem]);

    // ------------------------------------------------------------------------
    // V. INTERACTION & ADVANCEMENT
    // ------------------------------------------------------------------------
    const handleSelectOption = (opt) => {
        if (feedbackState !== null) return;

        setSelectedOption(opt.id);

        if (opt.isCorrect) {
            setFeedbackState('correct');
            setSolvedCount(prev => prev + 1);

            if (onScoreContributed) {
                onScoreContributed(10);
            }

            setTimeout(() => {
                if (!isMounted.current) return;
                advanceToNextProblem();
            }, 650);
        } else {
            setFeedbackState('incorrect');

            setTimeout(() => {
                if (!isMounted.current) return;
                advanceToNextProblem();
            }, 1100);
        }
    };

    const advanceToNextProblem = () => {
        setSelectedOption(null);
        setFeedbackState(null);

        if (practiceQueue.length > 0) {
            setCurrentProblem(practiceQueue[0]);
            setPracticeQueue(prev => prev.slice(1));
        } else {
            setCurrentProblem(null);
        }
    };

    // ------------------------------------------------------------------------
    // VI. RENDER
    // ------------------------------------------------------------------------
    return (
        <aside
            aria-label={t.title}
            className={`w-full max-w-xl mx-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl transition-all duration-300 ease-out flex flex-col overflow-hidden ${
                isOpen 
                    ? 'translate-y-0 opacity-100 pointer-events-auto' 
                    : 'translate-y-8 opacity-0 pointer-events-none'
            }`}
            style={{
                backgroundColor: 'var(--bg-card, #ffffff)',
                borderColor: 'var(--border-main, #e2e8f0)',
                color: 'var(--text-main, #0f172a)'
            }}
        >
            {/* Drawer Header */}
            <header 
                className="px-5 py-3 border-b flex items-center justify-between shrink-0"
                style={{
                    backgroundColor: 'var(--bg-surface, #f8fafc)',
                    borderColor: 'var(--border-main, #e2e8f0)'
                }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center">
                        <Zap size={14} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-inherit">
                            {t.title}
                        </h3>
                        <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted, #64748b)' }}>
                            {t.subtitle}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {solvedCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                            <Sparkles size={11} />
                            {solvedCount} {t.solved_count}
                        </span>
                    )}

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ color: 'var(--text-muted, #64748b)' }}
                            title={t.pause}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </header>

            {/* Problem Canvas Stage */}
            {/* Problem Canvas Stage */}
            <div className="p-5 flex flex-col justify-between min-h-[220px]">
                {currentProblem ? (
                    <div className={`space-y-3.5 animate-in fade-in duration-200 ${currentProblem.hasVisual ? 'grid grid-cols-1 sm:grid-cols-12 gap-4 items-center' : ''}`}>
                        
                        {/* Visual Geometry / Graph (Col span 5 if visual exists) */}
                        {currentProblem.hasVisual && (
                            <div className="sm:col-span-5 whiteboard-protect w-full flex items-center justify-center p-2 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs bg-white">
                                <div className="w-full aspect-square max-h-44 flex items-center justify-center">
                                    <VisualRenderer 
                                        data={currentProblem.renderData} 
                                        isWordProblem={false} 
                                    />
                                </div>
                            </div>
                        )}

                        {/* Prompt, LaTeX & Options Column (Col span 7 if visual exists, else full 12) */}
                        <div className={currentProblem.hasVisual ? 'sm:col-span-7 space-y-3' : 'space-y-3.5'}>
                            {/* Prompt Description */}
                            {currentProblem.prompt && (
                                <div className="text-s font-bold leading-relaxed" style={{ color: 'var(--text-muted, #64748b)' }}>
                                    <MathDisplay content={currentProblem.prompt} />
                                </div>
                            )}

                            {/* LaTeX Formula Box */}
                            {currentProblem.latex && (
                                <div 
                                    className="w-full text-center text-xl sm:text-2xl font-serif font-black py-2.5 px-3 rounded-2xl border shadow-inner"
                                    style={{
                                        backgroundColor: 'var(--bg-surface, #f8fafc)',
                                        borderColor: 'var(--border-main, #e2e8f0)',
                                        color: 'var(--brand-solid, #4f46e5)'
                                    }}
                                >
                                    <MathDisplay content={`$$${currentProblem.latex}$$`} />
                                </div>
                            )}

                            {/* 4 Tactile Single-Tap Choice Buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                {currentProblem.options.map((opt) => {
                                    const isChosen = selectedOption === opt.id;
                                    const showCorrect = feedbackState !== null && opt.isCorrect;
                                    const showWrong = feedbackState === 'incorrect' && isChosen;

                                    let buttonStyle = {
                                        backgroundColor: 'var(--bg-surface, #f8fafc)',
                                        borderColor: 'var(--border-main, #e2e8f0)',
                                        color: 'var(--text-main, #0f172a)'
                                    };

                                    let stateClasses = 'hover:border-indigo-400 active:scale-95';

                                    if (showCorrect) {
                                        stateClasses = 'bg-emerald-600 border-emerald-500 text-white shadow-md ring-2 ring-emerald-400/40';
                                        buttonStyle = {};
                                    } else if (showWrong) {
                                        stateClasses = 'bg-rose-600 border-rose-500 text-white shadow-md animate-shake';
                                        buttonStyle = {};
                                    }

                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            disabled={feedbackState !== null}
                                            onClick={() => handleSelectOption(opt)}
                                            className={`p-2.5 rounded-2xl border-2 font-bold text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer select-none ${stateClasses}`}
                                            style={!showCorrect && !showWrong ? buttonStyle : {}}
                                        >
                                            <div className="flex items-center gap-1.5 truncate">
                                                <span className={`w-4 h-4 rounded-md text-[9px] font-black flex items-center justify-center shrink-0 ${
                                                    showCorrect || showWrong ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10'
                                                }`}>
                                                    {opt.id}
                                                </span>
                                                <span className="truncate">
                                                    <MathDisplay content={String(opt.label)} />
                                                </span>
                                            </div>

                                            {showCorrect && <CheckCircle2 size={14} className="text-white shrink-0 ml-1" />}
                                            {showWrong && <XCircle size={14} className="text-white shrink-0 ml-1" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                ) : (
                    /* Loading buffer spinner */
                    <div className="py-12 flex flex-col items-center justify-center gap-2" style={{ color: 'var(--text-muted, #64748b)' }}>
                        <Loader2 size={24} className="animate-spin text-indigo-500" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {t.loading}
                        </span>
                    </div>
                )}

                {/* Footer Micro-Status */}
                <footer 
                    className="pt-3 mt-2 border-t flex items-center justify-between text-[10px] font-bold"
                    style={{ borderColor: 'var(--border-main, #e2e8f0)', color: 'var(--text-muted, #64748b)' }}
                >
                    <span>{t.points_chip}</span>
                    <span className="font-mono">
                        {currentProblem ? `${lang === 'sv' ? 'Nivå' : 'Level'} ${currentProblem.level}` : ''}
                    </span>
                </footer>
            </div>
        </aside>
    );
}