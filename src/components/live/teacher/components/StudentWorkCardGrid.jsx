// src/components/live/teacher/components/StudentWorkCardGrid.jsx
import React from 'react';
import { Star, Maximize2 } from 'lucide-react';
import SlideRenderer from '../../../shared/SlideRenderer';
import InteractiveCanvas from '../../../whiteboard/InteractiveCanvas';
import MathDisplay from '../../../shared/MathDisplay';

export default function StudentWorkCardGrid({
    engine,
    session,
    targetIndex,
    isSlideMode = false,
    onOpenSpotlight,
    lang = 'sv'
}) {
    const {
        livePacket,
        responses,
        starredStudents,
        toggleStar,
        isComparing,
        isAnonymous
    } = engine;

    const slides = session?.active_question_data?.slides || session?.slides || [];
    const currentSlide = slides[targetIndex];
    const globalZoom = session?.active_question_data?.settings?.globalZoom || 1.0;

    const displayResponses = React.useMemo(() => {
        if (!isSlideMode) {
            return responses.filter(r => 
                r.question_index === targetIndex && 
                (!isComparing || starredStudents.includes(r.student_alias))
            );
        }

        const currentSlideIds = currentSlide?.activeIds || [];
        const activePacketIndices = livePacket.reduce((acc, q, idx) => {
            if (currentSlideIds.includes(q.id)) acc.push(idx);
            return acc;
        }, []);

        const slideQIndices = activePacketIndices.length > 0 ? activePacketIndices : [targetIndex];

        return responses.filter(r => {
            const matchesSlide = slideQIndices.includes(r.question_index) || 
                (r.is_slide_submission && r.question_index === targetIndex);
            const matchesCompare = !isComparing || starredStudents.includes(r.student_alias);
            return matchesSlide && matchesCompare;
        });
    }, [responses, isSlideMode, currentSlide, targetIndex, livePacket, isComparing, starredStudents]);

    if (displayResponses.length === 0) {
        return (
            <div className="col-span-full py-16 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs italic">
                {lang === 'sv' 
                    ? "Inga elevsvar inskickade på denna slide än." 
                    : "No student work submitted for this slide yet."}
            </div>
        );
    }

    return (
        <div className={`grid gap-3.5 ${
            isComparing 
                ? (starredStudents.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3') 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
        }`}>
            {displayResponses.map((r, i) => {
                const hasCanvas = r.canvas_state && Array.isArray(r.canvas_state) && r.canvas_state.length > 0;
                const hasScratchpad = r.work_steps && Array.isArray(r.work_steps) && r.work_steps.length > 0;
                const targetQuestion = livePacket[r.question_index];
                const isFreeText = targetQuestion?.answerType === 'free_text';
                const isSlideCanvasOnly = r.answer === '[CANVAS_SUBMISSION]' || r.is_slide_submission || hasCanvas;
                const isStarred = starredStudents.includes(r.student_alias);

                return (
                    <div 
                        key={r.id || `${r.student_alias}_${i}`} 
                        className={`bg-[var(--bg-card)] p-3.5 rounded-2xl border shadow-sm flex flex-col relative group/card transition-all ${
                            isStarred 
                                ? 'border-amber-400 ring-2 ring-amber-400/30' 
                                : 'border-[var(--border-main)]'
                        }`}
                    >
                        {/* Star Toggle */}
                        <button 
                            type="button"
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                toggleStar(r.student_alias); 
                            }}
                            className={`absolute -top-2.5 -right-2.5 p-1.5 bg-[var(--bg-card)] rounded-full border border-[var(--border-main)] shadow-sm hover:scale-110 transition-all z-20 cursor-pointer ${
                                isStarred 
                                    ? 'border-amber-300 opacity-100' 
                                    : 'opacity-0 group-hover/card:opacity-100'
                            }`}
                        >
                            <Star 
                                size={14} 
                                className={isStarred ? 'fill-amber-400 text-amber-500' : 'text-[var(--text-muted)]'} 
                            />
                        </button>

                        {/* Header */}
                        <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-[var(--border-main)]">
                            <span className="font-bold text-xs text-[var(--text-main)] truncate max-w-[140px]">
                                {isAnonymous ? `Elev ${i + 1}` : r.student_alias}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                isSlideCanvasOnly
                                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30'
                                    : isFreeText 
                                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30' 
                                        : r.is_correct 
                                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30' 
                                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                            }`}>
                                {isSlideCanvasOnly 
                                    ? (lang === 'sv' ? "Tavla" : "Canvas") 
                                    : isFreeText 
                                        ? (lang === 'sv' ? "Text" : "Text") 
                                        : (r.answer === '[TIMEOUT]' ? 'TID' : r.answer)
                                }
                            </span>
                        </div>

                        {/* Whiteboard Canvas Preview */}
                        {hasCanvas && (
                            <div 
                                onClick={() => onOpenSpotlight && onOpenSpotlight(r)} 
                                className="w-full aspect-video relative bg-[#f9fbf7] border border-[var(--border-main)] rounded-xl overflow-hidden mb-2 cursor-zoom-in group/canvas shadow-inner"
                            >
                                <div className="absolute inset-0 pointer-events-none opacity-80">
                                    <SlideRenderer
                                        activeIds={currentSlide?.activeIds || []}
                                        livePacket={livePacket}
                                        lang={lang}
                                        authorMode={false}
                                        globalZoom={globalZoom}
                                        sizeClasses={{ 
                                            desc: 'text-[11px]', 
                                            latex: 'text-xs', 
                                            clue: 'text-[10px]', 
                                            headerText: 'text-xs', 
                                            visualClass: 'scale-75 max-h-[90px]' 
                                        }}
                                    />
                                </div>

                                <div className="absolute inset-0 pointer-events-none">
                                    <InteractiveCanvas
                                        elements={r.canvas_state}
                                        readOnly={true}
                                        toolbarMode="none"
                                        resolution={{ w: 1920, h: 1080 }}
                                    />
                                </div>

                                <div className="absolute inset-0 bg-slate-900/10 group-hover/canvas:bg-transparent transition-colors flex items-end justify-end p-2 pointer-events-none">
                                    <span className="p-1.5 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm">
                                        <Maximize2 size={12} />
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Free Text Answers */}
                        {isFreeText && (
                            <div className="p-2.5 bg-[var(--bg-surface)] rounded-xl text-xs font-medium text-[var(--text-main)] max-h-36 overflow-y-auto custom-scrollbar mb-2 leading-relaxed">
                                {r.answer}
                            </div>
                        )}

                        {/* Math Scratchpad Lines */}
                        {hasScratchpad && (
                            <div className="space-y-1 overflow-x-auto custom-scrollbar py-1 text-xs">
                                {r.work_steps.map((line, lineIdx) => (
                                    <div key={lineIdx} className="bg-[var(--bg-surface)] px-2 py-1 rounded text-[var(--text-main)] font-serif">
                                        <MathDisplay content={`$\\displaystyle ${line}$`} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Final Answer Fallback */}
                        {!hasCanvas && !hasScratchpad && !isFreeText && (
                            <div className="text-[10px] text-[var(--text-muted)] italic py-2 text-center">
                                {lang === 'sv' ? "Bara slutsvar inskickat" : "Only final answer submitted"}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}