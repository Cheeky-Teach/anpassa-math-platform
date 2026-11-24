// src/components/shared/SlideRenderer.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, RefreshCw } from 'lucide-react';
import MathDisplay from './MathDisplay';
import { compileAnchoredStory } from '../../core/utils/storyCompiler';
import VisualRenderer from '../visuals/VisualRenderer';
import MyCoachModal from '../modals/MyCoachModal';

export default function SlideRenderer({
    activeIds = [],
    livePacket = [],
    setLivePacket,
    lang = 'sv',
    sizeClasses,
    clueViewMode,
    currentFocusedQuestion,
    coachProps,
    onSpotlight,
    onRegenerate,
    setIsSaving,
    authorMode = true,
    compactMode = false,
    globalZoom = 1.0
}) {
    const [openAlignMenuId, setOpenAlignMenuId] = useState(null);

    return (
        <div className={`w-full h-full relative flex items-start select-none px-8 pointer-events-auto ${
            compactMode || !authorMode ? 'pt-[40px] pb-[36px]' : 'pt-[100px] pb-[90px]'
        }`}>
            <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full pointer-events-none">
                <foreignObject x="0" y="0" width="1920" height="1080" className="pointer-events-none">
                    {/* 🟢 Refined padding to prevent overlapping with top/bottom floating nav docks */}
                    <div className="w-full h-full relative flex items-start select-none pt-[100px] pb-[90px] px-8 pointer-events-auto">
                        
                        {clueViewMode === 'coach' ? (
                            <MyCoachModal
                                lang={lang}
                                inlineMode={true} 
                                question={currentFocusedQuestion} 
                                {...coachProps} 
                            />
                        ) : activeIds.length === 0 ? (
                            <div className="absolute top-8 left-8 flex items-center gap-2 text-[var(--text-muted)] bg-[var(--bg-card)] px-3.5 py-2 rounded-xl border border-[var(--border-strong)] pointer-events-none select-none z-0 shadow-2xs">
                                <ChevronLeft size={14} className="animate-pulse text-emerald-600 dark:text-emerald-400" />
                                <span className="font-bold uppercase tracking-wider text-[10px]">
                                    {lang === 'sv' ? "Välj uppgift för att presentera" : "Select question to present"}
                                </span>
                            </div>
                        ) : (
                            activeIds.map((id, index) => {
                                const q = livePacket.find(p => p.id === id);
                                if (!q) return null;
                                const rd = q.resolvedData?.renderData;
                                const masterIndex = livePacket.findIndex(p => p.id === id) + 1;

                                const alignClass = q.align === 'start' ? 'items-start' : q.align === 'end' ? 'items-end' : 'items-center';
                                const textAlignClass = q.align === 'start' ? 'text-left' : q.align === 'end' ? 'text-right' : 'text-center';
                                const visualAlignClass =
                                    q.align === 'start'
                                        ? 'justify-start origin-top-left'
                                        : q.align === 'end'
                                            ? 'justify-end origin-top-right'
                                            : 'justify-center origin-top';

                                return (
                                    <div 
                                        key={id} 
                                        className={`group flex flex-col flex-1 px-4 relative h-full ${alignClass} justify-start animate-in zoom-in-95 duration-150`}
                                    >
                                        {index > 0 && (
                                            <div className="absolute top-0 bottom-0 left-0 border-l-2 border-dashed border-[var(--border-strong)] -translate-x-1/2 pointer-events-none opacity-60" />
                                        )}

                                        {/* 1. THE FIXED UI CONTROLS (Only visible in authoring mode) */}
                                        {authorMode && (
                                            <div className={`flex flex-col mb-3 shrink-0 relative z-40 mt-1 items-${q.align === 'start' ? 'start' : q.align === 'end' ? 'end' : 'center'}`}>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenAlignMenuId(prev => prev === q.id ? null : q.id);
                                                        }}
                                                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-1.5 uppercase tracking-wider shadow-2xs transition-all active:scale-[0.98] cursor-pointer pointer-events-auto"
                                                        title={lang === 'sv' ? "Ändra justering och skala" : "Change alignment & scale"}
                                                    >
                                                        <span>{lang === 'sv' ? `Uppgift ${masterIndex}` : `Question ${masterIndex}`}</span>
                                                        <ChevronDown size={14} className={`transition-transform duration-150 ${openAlignMenuId === q.id ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); onRegenerate(q.id); }}
                                                        className="p-1.5 text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[var(--bg-surface)] rounded-xl transition-all active:scale-95 cursor-pointer pointer-events-auto border border-[var(--border-strong)] bg-[var(--bg-card)] shadow-2xs"
                                                        title={lang === 'sv' ? "Slå om tal / slumpa nya värden" : "Roll fresh question numbers"}
                                                    >
                                                        <RefreshCw size={15} className="transition-transform duration-300 hover:rotate-180" />
                                                    </button>
                                                </div>

                                                {openAlignMenuId === q.id && (
                                                    <div className="absolute top-full mt-2 animate-in fade-in slide-in-from-top-1 duration-150 flex flex-col bg-[var(--bg-card)] backdrop-blur-xs p-2 rounded-xl shadow-2xl border border-[var(--border-strong)] pointer-events-auto z-50 min-w-[180px]" onPointerDown={(e) => e.stopPropagation()}>
                                                        <div className="flex bg-[var(--bg-surface)] rounded-lg p-0.5 border border-[var(--border-main)] mb-2">
                                                            {['start', 'center', 'end'].map(align => (
                                                                <button 
                                                                    type="button"
                                                                    key={align} 
                                                                    onClick={() => {
                                                                        setLivePacket(prev => prev.map(p => p.id === q.id ? { ...p, align } : p));
                                                                        setIsSaving(false);
                                                                    }} 
                                                                    className={`flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                                                        q.align === align ? 'bg-emerald-600 text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                                                    }`}
                                                                >
                                                                    {align === 'start' ? (lang === 'sv' ? 'Vänster' : 'Left') : align === 'end' ? (lang === 'sv' ? 'Höger' : 'Right') : (lang === 'sv' ? 'Mitten' : 'Center')}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center justify-between px-1 py-1 border-t border-[var(--border-main)] pt-2 gap-2">
                                                            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">
                                                                {lang === 'sv' ? 'Skala' : 'Scale'}
                                                            </span>
                                                            <input 
                                                                type="range" min="0.5" max="2.5" step="0.05" value={q.scale || 1.0}
                                                                onChange={(e) => {
                                                                    setLivePacket(prev => prev.map(p => p.id === q.id ? { ...p, scale: parseFloat(e.target.value) } : p));
                                                                    setIsSaving(false);
                                                                }}
                                                                className="w-20 accent-emerald-600 cursor-ew-resize"
                                                            />
                                                            <span className="text-[10px] font-bold font-mono text-emerald-700 dark:text-emerald-400 w-8 text-right">
                                                                {Math.round((q.scale || 1.0) * 100)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* 2. THE SCALED CONTENT WRAPPER */}
                                        <div 
                                            className={`flex flex-col w-full ${alignClass} pointer-events-auto mt-2`}
                                            style={{ 
                                                transform: `scale(${(q.scale || 1.0) * globalZoom})`, 
                                                transformOrigin: q.align === 'start' ? 'top left' : q.align === 'end' ? 'top right' : 'top center',
                                                transition: 'transform 0.1s ease-out'
                                            }}
                                        >
                                            {q.showText !== false && (
                                                <div className={`font-bold text-[var(--text-main)] ${textAlignClass} leading-relaxed max-w-xl w-full shrink-0 break-words px-4 mb-3 ${sizeClasses.desc}`}>
                                                    <MathDisplay content={compileAnchoredStory(q, lang)} />
                                                </div>
                                            )}
                                            
                                            {q.showVisual !== false && rd && (
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); onSpotlight(rd); }}
                                                    className={`w-full max-w-xl px-4 flex ${visualAlignClass} transition-all duration-300 cursor-zoom-in hover:opacity-80 overflow-visible shrink-0 relative z-30 ${sizeClasses.visualClass}`}
                                                >
                                                    <VisualRenderer 
                                                        data={rd} 
                                                        isWordProblem={q.selectedStoryIndex !== null && q.selectedStoryIndex !== undefined} 
                                                    />
                                                </div>
                                            )}

                                            {/* MULTIPLE CHOICE OPTIONS */}
                                            {rd?.options && rd.options.length > 0 && (
                                                <div className="mt-4 grid grid-cols-2 gap-3 w-full max-w-xl px-4 pointer-events-none relative z-30 shrink-0">
                                                    {rd.options.map((opt, oIdx) => {
                                                        const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                                                        return (
                                                            <div key={oIdx} className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] shadow-2xs text-[var(--text-main)]">
                                                                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                                                                    {['A','B','C','D','E','F'][oIdx]}
                                                                </div>
                                                                <MathDisplay content={String(choiceLabel)} className={`font-semibold text-[var(--text-main)] ${sizeClasses.desc}`} />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {q.showLatex !== false && rd?.latex && !rd?.geometry && (
                                                <div className={`mt-5 py-3.5 px-5 bg-[var(--bg-card)] rounded-xl text-center font-serif text-[var(--text-main)] border border-[var(--border-strong)] shadow-inner w-full max-w-md shrink-0 ${sizeClasses.latex}`}>
                                                    <MathDisplay content={`$$${rd.latex}$$`} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) 
                        )}
                    </div>
                </foreignObject>
            </svg>
        </div>
    );
}