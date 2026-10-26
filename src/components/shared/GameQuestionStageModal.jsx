// src/components/activities/shared/GameQuestionStageModal.jsx
import React, { useState, useEffect } from 'react';
import { 
    X, Check, AlertCircle, HelpCircle, Eye, EyeOff, 
    RefreshCcw, ChevronRight, Award, Sparkles,
    Type, Calculator, Image as ImageIcon
} from 'lucide-react';
import VisualRenderer from '../visuals/VisualRenderer.jsx';
import MathDisplay from './MathDisplay.jsx';

export default function GameQuestionStageModal({
    isOpen,
    onClose,
    question,
    lang = 'sv',
    points = 100,
    teams = [],
    activeTeamId = null,
    onAwardPoints = null, // (teamId, points) => void
    onRegenerate = null,  // () => Promise<void>
    allowHints = true,
    showPointsAwarding = true
}) {
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
    const [revealedCluesCount, setRevealedCluesCount] = useState(0);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Local element visibility overrides (defaulting to question properties)
    const [showTextOverride, setShowTextOverride] = useState(true);
    const [showLatexOverride, setShowLatexOverride] = useState(null); // null = use default logic
    const [showVisualOverride, setShowVisualOverride] = useState(true);

    // Reset local modal state when a new question mounts or opens
    useEffect(() => {
        if (isOpen) {
            setSelectedOptionIndex(null);
            setRevealedCluesCount(0);
            setIsAnswerRevealed(false);
            setShowTextOverride(true);
            setShowLatexOverride(null);
            setShowVisualOverride(true);
        }
    }, [isOpen, question?.id, question?.slotId]);

    if (!isOpen || !question) return null;

    const renderData = question.renderData || question.resolvedData?.renderData || {};
    const clues = question.clues || question.resolvedData?.clues || [];
    const options = renderData.options || [];
    const hasOptions = Array.isArray(options) && options.length > 0;
    const cleanAnswer = question.answer || renderData.answer || null;

    // Detect if this question is a word problem
    const isWordProblem = Boolean(
        question.wordProblem || 
        renderData.isWordProblemApplied || 
        question.resolvedData?.renderData?.isWordProblemApplied ||
        question.resolvedData?.metadata?.isWordProblemApplied
    );

    // Element display rules:
    // When it's a word problem, suppress the raw LaTeX box by default unless explicitly toggled on
    const effectiveShowText = question.showText !== false && showTextOverride;
    const effectiveShowLatex = showLatexOverride !== null 
        ? showLatexOverride 
        : (question.showLatex !== false && !isWordProblem);
    const effectiveShowVisual = question.showVisual !== false && showVisualOverride;

    const hasVisualElement = Boolean(
        renderData.geometry || renderData.graph || renderData.pattern || renderData.marbles
    );

    const t = {
        sv: {
            points: "poäng",
            clues: "Ledtråd",
            reveal_answer: "Visa facit",
            hide_answer: "Dölj svar",
            award_team: "Ge poäng till:",
            regenerate: "Slumpa nya siffror",
            correct: "Rätt svar",
            close: "Stäng (Esc)",
            word_problem_tag: "Problemlösning",
            toggle_text: "Text",
            toggle_latex: "Formel",
            toggle_visual: "Figur"
        },
        en: {
            points: "points",
            clues: "Hint",
            reveal_answer: "Reveal Answer",
            hide_answer: "Hide Answer",
            award_team: "Award points to:",
            regenerate: "Roll new numbers",
            correct: "Correct Answer",
            close: "Close (Esc)",
            word_problem_tag: "Word Problem",
            toggle_text: "Text",
            toggle_latex: "Equation",
            toggle_visual: "Diagram"
        }
    }[lang];

    const handleRegenerate = async () => {
        if (!onRegenerate || isRegenerating) return;
        setIsRegenerating(true);
        try {
            await onRegenerate();
            setSelectedOptionIndex(null);
            setRevealedCluesCount(0);
            setIsAnswerRevealed(false);
        } catch (err) {
            console.error("Failed to re-roll question", err);
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[600] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200 select-none">
            
            {/* Main Stage Window */}
            <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden">
                
                {/* 1. Header Bar: Points, Element Toggles, Re-roll, Close */}
                <div className="flex flex-wrap items-center justify-between px-6 sm:px-8 py-3.5 border-b border-slate-800 bg-slate-950/70 gap-3">
                    <div className="flex items-center gap-3">
                        <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-1.5">
                            <Sparkles size={14} />
                            {points} {t.points}
                        </span>

                        {isWordProblem && (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                                {t.word_problem_tag}
                            </span>
                        )}

                        {question.topicId && (
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:inline">
                                • {question.topicId.replace(/_/g, ' ')} (Nivå {question.level || 1})
                            </span>
                        )}
                    </div>

                    {/* Quick Visibility Toggles & Actions */}
                    <div className="flex items-center gap-2">
                        {/* Quick Element Masking Toggles */}
                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
                            {renderData.description && (
                                <button
                                    type="button"
                                    onClick={() => setShowTextOverride(!effectiveShowText)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                                        effectiveShowText 
                                            ? 'bg-indigo-600 text-white shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-300 line-through'
                                    }`}
                                    title="Visa/dölj textbeskrivning"
                                >
                                    <Type size={11} /> {t.toggle_text}
                                </button>
                            )}

                            {renderData.latex && (
                                <button
                                    type="button"
                                    onClick={() => setShowLatexOverride(!effectiveShowLatex)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                                        effectiveShowLatex 
                                            ? 'bg-emerald-600 text-white shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-300 line-through'
                                    }`}
                                    title="Visa/dölj matematisk formel"
                                >
                                    <Calculator size={11} /> {t.toggle_latex}
                                </button>
                            )}

                            {hasVisualElement && (
                                <button
                                    type="button"
                                    onClick={() => setShowVisualOverride(!effectiveShowVisual)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                                        effectiveShowVisual 
                                            ? 'bg-amber-600 text-white shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-300 line-through'
                                    }`}
                                    title="Visa/dölj geometrisk figur"
                                >
                                    <ImageIcon size={11} /> {t.toggle_visual}
                                </button>
                            )}
                        </div>

                        {onRegenerate && (
                            <button
                                type="button"
                                onClick={handleRegenerate}
                                disabled={isRegenerating}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
                                title={t.regenerate}
                            >
                                <RefreshCcw size={13} className={isRegenerating ? "animate-spin text-amber-400" : ""} />
                                <span className="hidden lg:inline">{t.regenerate}</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 border border-slate-700 transition-all cursor-pointer"
                            title={t.close}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* 2. Scrollable Question Content (Shielded for contrast) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 flex flex-col items-center justify-center">
                    
                    <div className="whiteboard-protect bg-white text-slate-900 rounded-3xl p-8 sm:p-12 w-full max-w-4xl shadow-xl border border-slate-200 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* A. Diagram or Visual Geometry Component */}
                        {effectiveShowVisual && hasVisualElement && (
                            <div className="w-full flex justify-center mb-6 drop-shadow-xs scale-105 origin-center py-2">
                                <VisualRenderer 
                                    data={renderData} 
                                    isWordProblem={isWordProblem} 
                                />
                            </div>
                        )}

                        {/* B. Text Description */}
                        {effectiveShowText && renderData.description ? (
                            <div className="text-xl sm:text-2xl font-bold text-center text-slate-900 leading-relaxed max-w-3xl mb-4">
                                <MathDisplay content={renderData.description} />
                            </div>
                        ) : null}

                        {/* C. Primary LaTeX / Equation Formula Display */}
                        {/* 🟢 RENDER IF:
                            1. effectiveShowLatex is true, OR
                            2. effectiveShowText is missing (safety fallback so card is never empty)
                        */}
                        {(effectiveShowLatex || (!renderData.description && !effectiveShowVisual)) && renderData.latex && (
                            <div className="my-4 px-8 py-5 rounded-2xl bg-indigo-50/50 border-2 border-indigo-100 text-3xl sm:text-4xl font-serif text-slate-900 text-center shadow-inner tracking-wide">
                                <MathDisplay content={`$$${renderData.latex}$$`} />
                            </div>
                        )}

                        {/* D. Multiple Choice Answer Grid */}
                        {hasOptions && (
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl">
                                {options.map((opt, idx) => {
                                    const optLabel = typeof opt === 'object' ? opt.label : opt;
                                    const letter = ['A', 'B', 'C', 'D', 'E', 'F'][idx];
                                    const isSelected = selectedOptionIndex === idx;

                                    return (
                                        <button
                                            type="button"
                                            key={idx}
                                            onClick={() => setSelectedOptionIndex(idx)}
                                            className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer font-bold text-base
                                                ${isSelected 
                                                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-md ring-2 ring-indigo-500/20' 
                                                    : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white text-slate-800'
                                                }`}
                                        >
                                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors
                                                ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-indigo-600'}`}>
                                                {letter}
                                            </span>
                                            <div className="flex-1 overflow-hidden">
                                                <MathDisplay content={optLabel} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* E. Hints & Step-by-Step Scaffolding Drawer */}
                    {allowHints && clues.length > 0 && (
                        <div className="w-full max-w-4xl mt-6 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setRevealedCluesCount(prev => Math.min(clues.length, prev + 1))}
                                    disabled={revealedCluesCount >= clues.length}
                                    className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-30 cursor-pointer"
                                >
                                    <HelpCircle size={15} />
                                    {t.clues} ({revealedCluesCount}/{clues.length})
                                </button>
                            </div>

                            {clues.slice(0, revealedCluesCount).map((clue, cIdx) => {
                                const clueText = typeof clue === 'object' ? clue[lang] || clue.text : clue;
                                const clueLatex = typeof clue === 'object' ? clue.latex : null;

                                return (
                                    <div key={cIdx} className="p-4 rounded-2xl bg-slate-800/90 border border-amber-500/30 text-slate-200 text-sm font-semibold flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                            {cIdx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <div>{clueText}</div>
                                            {clueLatex && (
                                                <div className="mt-1 text-amber-300 font-serif text-base">
                                                    <MathDisplay content={`$$${clueLatex}$$`} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 3. Footer Bar: Award Points & Reveal Answer */}
                <div className="px-6 sm:px-8 py-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
                    
                    {/* Left: Reveal Solution Pill */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer
                                ${isAnswerRevealed 
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                }`}
                        >
                            {isAnswerRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                            {isAnswerRevealed ? t.hide_answer : t.reveal_answer}
                        </button>

                        {isAnswerRevealed && cleanAnswer && (
                            <div className="px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-serif font-black text-lg animate-in fade-in zoom-in-95 flex items-center gap-2">
                                <Check size={16} className="text-emerald-400" />
                                <MathDisplay content={`$${String(cleanAnswer).replace(/\$/g, '')}$`} />
                            </div>
                        )}
                    </div>

                    {/* Right: Team Point Awarding (Hot-Seat / Classroom Mode) */}
                    {showPointsAwarding && teams.length > 0 && onAwardPoints && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:inline">
                                {t.award_team}
                            </span>
                            <div className="flex gap-1.5 flex-wrap">
                                {teams.map(team => (
                                    <button
                                        type="button"
                                        key={team.id}
                                        onClick={() => {
                                            onAwardPoints(team.id, points);
                                            onClose();
                                        }}
                                        className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 transition-transform active:scale-95 shadow-md cursor-pointer hover:brightness-110"
                                        style={{ backgroundColor: team.color || '#4f46e5' }}
                                    >
                                        <Award size={14} />
                                        {team.name} (+{points})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}