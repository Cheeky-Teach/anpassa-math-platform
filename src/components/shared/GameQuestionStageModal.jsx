// src/components/activities/shared/GameQuestionStageModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, Check, AlertCircle, HelpCircle, Eye, EyeOff, 
    RefreshCcw, ChevronRight, Award, Sparkles,
    Type, Calculator, Image as ImageIcon, Users, 
    Clock, CheckCircle2, XCircle, CheckSquare, Shield,
    ArrowDownAZ, ListOrdered, Shuffle, ChevronDown
} from 'lucide-react';
import VisualRenderer from '../visuals/VisualRenderer.jsx';
import MathDisplay from './MathDisplay.jsx';

// 🟢 Safe parse helper with fallback for missing/null strings
const parseTeamId = (alias) => {
    if (!alias || typeof alias !== 'string') {
        return { teamId: null, displayName: 'Anonym' };
    }
    const match = alias.match(/^\[(team_\d+)\]\s*(.*)$/);
    return {
        teamId: match ? match[1] : null,
        displayName: match && match[2] ? match[2] : alias
    };
};

export default function GameQuestionStageModal({
    isOpen,
    onClose,
    onFinishAndClear = null,
    question = null,
    points = 100,
    teams = [],
    activeTeamId = null,
    onAwardPoints = null,
    onRegenerate = null,
    lang = 'sv',
    allowHints = true,
    showPointsAwarding = true,
    isLive = false,
    liveResponses = []
}) {
    if (!isOpen || !question) return null;

    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
    const [revealedCluesCount, setRevealedCluesCount] = useState(0);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Privacy & Display States
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [hideAnswers, setHideAnswers] = useState(true);
    const [sortMode, setSortMode] = useState('latest');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

    // Local element visibility overrides
    const [showTextOverride, setShowTextOverride] = useState(true);
    const [showLatexOverride, setShowLatexOverride] = useState(null);
    const [showVisualOverride, setShowVisualOverride] = useState(true);

    const questionKey = question?.id || question?.slotId || question?.regenVersion;

    useEffect(() => {
        setSelectedOptionIndex(null);
        setRevealedCluesCount(0);
        setIsAnswerRevealed(false);
        setShowTextOverride(true);
        setShowLatexOverride(null);
        setShowVisualOverride(true);
    }, [isOpen, questionKey]);

    const renderData = question?.renderData || question?.resolvedData?.renderData || {};
    const clues = question?.clues || question?.resolvedData?.clues || [];
    const options = renderData?.options || [];
    const hasOptions = Array.isArray(options) && options.length > 0;
    const cleanAnswer = question?.answer || renderData?.answer || null;

    const isWordProblem = Boolean(
        question?.wordProblem || 
        renderData?.isWordProblemApplied || 
        question?.resolvedData?.renderData?.isWordProblemApplied ||
        question?.resolvedData?.metadata?.isWordProblemApplied
    );

    const effectiveShowText = question?.showText !== false && showTextOverride;
    const effectiveShowLatex = showLatexOverride !== null 
        ? showLatexOverride 
        : (question?.showLatex !== false && !isWordProblem);
    const effectiveShowVisual = question?.showVisual !== false && showVisualOverride;

    const hasVisualElement = Boolean(
        renderData?.geometry || renderData?.graph || renderData?.pattern || renderData?.marbles
    );

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

    const sortedResponses = useMemo(() => {
        const safeList = Array.isArray(liveResponses) ? [...liveResponses] : [];
        if (sortMode === 'az') {
            return safeList.sort((a, b) => {
                const nameA = parseTeamId(a?.student_alias).displayName || '';
                const nameB = parseTeamId(b?.student_alias).displayName || '';
                return nameA.localeCompare(nameB, lang);
            });
        }
        if (sortMode === 'team') {
            return safeList.sort((a, b) => {
                const teamA = parseTeamId(a?.student_alias).teamId || '';
                const teamB = parseTeamId(b?.student_alias).teamId || '';
                return teamA.localeCompare(teamB);
            });
        }
        return safeList;
    }, [liveResponses, sortMode, lang]);

    return (
        <div className="fixed inset-0 z-[600] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 select-none">
            {/* Modal Container: Always 95vw or max-w-7xl so it uses the projector screen fully */}
            <div className={`relative w-full flex flex-col bg-slate-900 border-2 border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden ${
                isLive ? 'max-w-7xl h-[92vh]' : 'max-w-5xl max-h-[92vh]'
            }`}>
                
                {/* 1. Header Bar */}
                <div className="flex flex-wrap items-center justify-between px-6 sm:px-8 py-3.5 border-b border-slate-800 bg-slate-950/70 gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-1.5">
                            <Sparkles size={14} />
                            {points} {lang === 'sv' ? "poäng" : "points"}
                        </span>

                        {isWordProblem && (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                                {lang === 'sv' ? "Problemlösning" : "Word Problem"}
                            </span>
                        )}

                        {question?.topicId && (
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:inline">
                                • {String(question.topicId).replace(/_/g, ' ')} (Nivå {question.level || 1})
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Visibility Toggles */}
                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
                            {renderData?.description && (
                                <button
                                    type="button"
                                    onClick={() => setShowTextOverride(!effectiveShowText)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                                        effectiveShowText 
                                            ? 'bg-indigo-600 text-white shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-300 line-through'
                                    }`}
                                >
                                    <Type size={11} /> {lang === 'sv' ? "Text" : "Text"}
                                </button>
                            )}

                            {renderData?.latex && (
                                <button
                                    type="button"
                                    onClick={() => setShowLatexOverride(!effectiveShowLatex)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                                        effectiveShowLatex 
                                            ? 'bg-emerald-600 text-white shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-300 line-through'
                                    }`}
                                >
                                    <Calculator size={11} /> {lang === 'sv' ? "Formel" : "Equation"}
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
                                >
                                    <ImageIcon size={11} /> {lang === 'sv' ? "Figur" : "Diagram"}
                                </button>
                            )}
                        </div>

                        {onRegenerate && (
                            <button
                                type="button"
                                onClick={handleRegenerate}
                                disabled={isRegenerating}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
                                title={lang === 'sv' ? "Slumpa nya siffror" : "Roll new numbers"}
                            >
                                <RefreshCcw size={13} className={isRegenerating ? "animate-spin text-amber-400" : ""} />
                                <span className="hidden lg:inline">{lang === 'sv' ? "Slumpa nya siffror" : "Roll new numbers"}</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 border border-slate-700 transition-all cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* 2. Main Body: flex-row with min-w-0 on question area and fixed width on live rail */}
                <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col lg:flex-row">
                    
                    {/* Left: 🟢 Primary Question Area (takes all remaining width, min-w-0 prevents collapsing) */}
                    <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-6 sm:p-10 flex flex-col items-center justify-start">
                        <div className="whiteboard-protect bg-white text-slate-900 rounded-3xl p-6 sm:p-12 w-full max-w-4xl shadow-xl border border-slate-200 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                            
                            {/* Diagram or Visual Geometry Component */}
                            {effectiveShowVisual && hasVisualElement && (
                                <div className="w-full flex justify-center mb-6 drop-shadow-xs scale-105 origin-center py-2">
                                    <VisualRenderer 
                                        data={renderData} 
                                        isWordProblem={isWordProblem} 
                                    />
                                </div>
                            )}

                            {/* Text Description */}
                            {effectiveShowText && renderData?.description ? (
                                <div className="text-xl sm:text-3xl font-bold text-center text-slate-900 leading-relaxed max-w-3xl mb-4">
                                    <MathDisplay content={renderData.description} />
                                </div>
                            ) : null}

                            {/* LaTeX / Equation Formula Display */}
                            {(effectiveShowLatex || (!renderData?.description && !effectiveShowVisual)) && renderData?.latex && (
                                <div className="my-4 px-8 py-5 rounded-2xl bg-indigo-50/50 border-2 border-indigo-100 text-3xl sm:text-5xl font-serif text-slate-900 text-center shadow-inner tracking-wide w-full">
                                    <MathDisplay content={`$$${renderData.latex}$$`} />
                                </div>
                            )}

                            {/* Multiple Choice Answer Grid */}
                            {hasOptions && (
                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
                                    {options.map((opt, idx) => {
                                        const optLabel = typeof opt === 'object' ? opt?.label : opt;
                                        const letter = ['A', 'B', 'C', 'D', 'E', 'F'][idx];
                                        const isSelected = selectedOptionIndex === idx;

                                        return (
                                            <button
                                                type="button"
                                                key={idx}
                                                onClick={() => setSelectedOptionIndex(idx)}
                                                className={`p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all cursor-pointer font-bold text-lg ${
                                                    isSelected 
                                                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-md ring-2 ring-indigo-500/20' 
                                                        : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white text-slate-800'
                                                }`}
                                            >
                                                <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shrink-0 transition-colors ${
                                                    isSelected ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-indigo-600'
                                                }`}>
                                                    {letter}
                                                </span>
                                                <div className="flex-1 overflow-hidden">
                                                    <MathDisplay content={String(optLabel || '')} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Hints Drawer */}
                        {allowHints && clues.length > 0 && (
                            <div className="w-full max-w-4xl mt-6 flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRevealedCluesCount(prev => Math.min(clues.length, prev + 1))}
                                    disabled={revealedCluesCount >= clues.length}
                                    className="self-start px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-30 cursor-pointer"
                                >
                                    <HelpCircle size={15} />
                                    {lang === 'sv' ? "Ledtråd" : "Hint"} ({revealedCluesCount}/{clues.length})
                                </button>

                                {clues.slice(0, revealedCluesCount).map((clue, cIdx) => (
                                    <div key={cIdx} className="p-4 rounded-2xl bg-slate-800/90 border border-amber-500/30 text-slate-200 text-sm font-semibold flex items-start gap-3 animate-in fade-in">
                                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                            {cIdx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <div>{typeof clue === 'object' ? clue[lang] || clue.text : clue}</div>
                                            {typeof clue === 'object' && clue.latex && (
                                                <div className="mt-1 text-amber-300 font-serif text-base">
                                                    <MathDisplay content={`$$${clue.latex}$$`} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: 🟢 Fixed-Width Live Responses Feed Sidebar */}
                    {isLive && (
                        <div className="w-full lg:w-96 bg-slate-950/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col shrink-0">
                            
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 gap-2">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-indigo-400" />
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                                        {lang === 'sv' ? "Svar" : "Answers"} ({sortedResponses.length})
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsAnonymous(!isAnonymous)}
                                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                            isAnonymous 
                                                ? 'bg-indigo-600 text-white border-indigo-500' 
                                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                        }`}
                                        title={lang === 'sv' ? "Anonymisera elever" : "Anonymize students"}
                                    >
                                        <Shield size={13} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setHideAnswers(!hideAnswers)}
                                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                            hideAnswers 
                                                ? 'bg-indigo-600 text-white border-indigo-500' 
                                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                        }`}
                                        title={lang === 'sv' ? "Dölj svar & rättning" : "Hide answers & correctness"}
                                    >
                                        {hideAnswers ? <EyeOff size={13} /> : <Eye size={13} />}
                                    </button>

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                                            className="p-1.5 px-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                                        >
                                            {sortMode === 'az' ? <ArrowDownAZ size={13} /> : sortMode === 'team' ? <Users size={13} /> : <ListOrdered size={13} />}
                                            <ChevronDown size={10} className="opacity-60" />
                                        </button>

                                        {isSortMenuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)} />
                                                <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setSortMode('latest'); setIsSortMenuOpen(false); }}
                                                        className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase transition-colors ${
                                                            sortMode === 'latest' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300 hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        {lang === 'sv' ? "Senaste först" : "Latest first"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setSortMode('az'); setIsSortMenuOpen(false); }}
                                                        className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase transition-colors ${
                                                            sortMode === 'az' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300 hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        {lang === 'sv' ? "Namn (A-Ö)" : "Name (A-Z)"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setSortMode('team'); setIsSortMenuOpen(false); }}
                                                        className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase transition-colors ${
                                                            sortMode === 'team' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300 hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        {lang === 'sv' ? "Sortera per lag" : "Sort by team"}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 max-h-[40vh] lg:max-h-none">
                                {sortedResponses.length === 0 ? (
                                    <div className="h-full py-16 flex flex-col items-center justify-center text-center text-slate-600 gap-2">
                                        <Clock size={24} className="opacity-40 animate-pulse" />
                                        <p className="text-xs font-bold uppercase tracking-wider">
                                            {lang === 'sv' ? "Väntar på elevsvar..." : "Waiting for answers..."}
                                        </p>
                                    </div>
                                ) : (
                                    sortedResponses.map((r, i) => {
                                        const { teamId, displayName } = parseTeamId(r?.student_alias);
                                        const team = teams.find(t => t.id === teamId);
                                        const maskedName = isAnonymous ? `${lang === 'sv' ? "Elev" : "Student"} ${i + 1}` : displayName;

                                        return (
                                            <div 
                                                key={r?.id || i}
                                                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                                                    hideAnswers 
                                                        ? 'bg-slate-900 border-slate-800 text-slate-300' 
                                                        : r?.is_correct 
                                                            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300' 
                                                            : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                                                }`}
                                            >
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        {team && (
                                                            <span 
                                                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                                                style={{ backgroundColor: team.color }} 
                                                            />
                                                        )}
                                                        <span className="text-xs font-black text-white truncate max-w-[130px]">
                                                            {maskedName}
                                                        </span>
                                                        {team && !isAnonymous && (
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                                ({team.name})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-mono font-bold truncate text-slate-200">
                                                        {hideAnswers ? "••••••" : r?.answer}
                                                    </span>
                                                </div>

                                                <div className="shrink-0 flex items-center gap-1">
                                                    {!hideAnswers && (
                                                        r?.is_correct ? (
                                                            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                                                <CheckCircle2 size={16} />
                                                                <span>+{points}p</span>
                                                            </div>
                                                        ) : (
                                                            <XCircle size={16} className="text-rose-400" />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Footer Bar */}
                <div className="px-6 sm:px-8 py-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer ${
                                isAnswerRevealed 
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                        >
                            {isAnswerRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                            {isAnswerRevealed ? (lang === 'sv' ? "Dölj svar" : "Hide answer") : (lang === 'sv' ? "Visa facit" : "Show answer")}
                        </button>

                        {isAnswerRevealed && cleanAnswer && (
                            <div className="px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-serif font-black text-lg animate-in fade-in zoom-in-95 flex items-center gap-2">
                                <Check size={16} className="text-emerald-400" />
                                <MathDisplay content={`$${String(cleanAnswer).replace(/\$/g, '')}$`} />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            {lang === 'sv' ? "Avbryt (Lämna öppen)" : "Cancel (Keep open)"}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {showPointsAwarding && teams.length > 0 && onAwardPoints && (
                            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                                {teams.map(team => (
                                    <button
                                        type="button"
                                        key={team.id}
                                        onClick={() => onAwardPoints(team.id, points)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-black uppercase text-white flex items-center gap-1.5 transition-transform active:scale-95 shadow-md cursor-pointer hover:brightness-110"
                                        style={{ backgroundColor: team.color || '#4f46e5' }}
                                    >
                                        <Award size={13} />
                                        <span>+{points}p {team.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {onFinishAndClear && (
                            <button
                                type="button"
                                onClick={onFinishAndClear}
                                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                            >
                                <CheckSquare size={15} />
                                <span>{lang === 'sv' ? "Klar (Töm bricka)" : "Done (Clear tile)"}</span>
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}