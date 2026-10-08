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
    authorMode = true, // If false, it hides the alignment pills for students/live presentations!
    globalZoom = 1.0
}) {
    const [openAlignMenuId, setOpenAlignMenuId] = useState(null);

    return (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full pointer-events-none">
                <foreignObject x="0" y="0" width="1920" height="1080" className="pointer-events-none">
                    <div className="w-full h-full relative flex items-start select-none pt-[80px] pb-[80px] pointer-events-auto">
                        
                        {clueViewMode === 'coach' ? (
                            <MyCoachModal
                                lang={lang}
                                inlineMode={true} 
                                question={currentFocusedQuestion} 
                                {...coachProps} 
                            />
                        ) : activeIds.length === 0 ? (
                            <div className="absolute top-5 left-5 flex items-center gap-2 text-slate-400/50 bg-white/50 px-3 py-1.5 rounded-lg border border-slate-200/50 pointer-events-none select-none z-0">
                                <ChevronLeft size={14} className="animate-pulse" />
                                <span className="font-black uppercase tracking-widest text-[9px]">
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

                                return (
                                    <div 
                                        key={id} 
                                        className={`group flex flex-col flex-1 px-8 relative h-full ${alignClass} justify-start animate-in zoom-in-95 duration-200`}
                                    >
                                        {index > 0 && (
                                            <div className="absolute top-0 bottom-0 left-0 border-l-4 border-dashed border-slate-400/80 -translate-x-1/2 pointer-events-none" />
                                        )}

                                        {/* 1. THE FIXED UI CONTROLS (Only visible in authoring mode) */}
                                        {authorMode && (
                                            <div className={`flex flex-col mb-3 shrink-0 relative z-40 mt-4 items-${q.align === 'start' ? 'start' : q.align === 'end' ? 'end' : 'center'}`}>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenAlignMenuId(prev => prev === q.id ? null : q.id);
                                                        }}
                                                        className="flex items-center gap-1.5 text-[14px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 rounded-md px-2.5 py-1 uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer pointer-events-auto"
                                                        title={lang === 'sv' ? "Ändra justering och skala" : "Change alignment & scale"}
                                                    >
                                                        {lang === 'sv' ? `Uppgift ${masterIndex}` : `Question ${masterIndex}`}
                                                        <ChevronDown size={16} className={`transition-transform duration-200 ${openAlignMenuId === q.id ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onRegenerate(q.id); }}
                                                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all active:scale-90 cursor-pointer pointer-events-auto ui-ignore"
                                                        title={lang === 'sv' ? "Slå om tal / slumpa nya värden" : "Roll fresh question numbers"}
                                                    >
                                                        <RefreshCw size={18} className="transition-transform duration-300 hover:rotate-180" />
                                                    </button>
                                                </div>

                                                {openAlignMenuId === q.id && (
                                                    <div className="absolute top-full mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200 flex flex-col bg-white/95 backdrop-blur-sm p-1.5 rounded-xl shadow-md border border-slate-200 pointer-events-auto z-50 min-w-[160px]" onPointerDown={(e) => e.stopPropagation()}>
                                                        <div className="flex bg-slate-100 rounded-lg p-0.5 mb-1.5">
                                                            {['start', 'center', 'end'].map(align => (
                                                                <button key={align} onClick={() => {
                                                                    setLivePacket(prev => prev.map(p => p.id === q.id ? { ...p, align } : p));
                                                                    setIsSaving(false);
                                                                }} className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${q.align === align ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200'}`}>
                                                                    {align === 'start' ? (lang === 'sv' ? 'Vänster' : 'Left') : align === 'end' ? (lang === 'sv' ? 'Höger' : 'Right') : (lang === 'sv' ? 'Mitten' : 'Center')}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center justify-between px-1 py-1 border-t border-slate-200 pt-2">
                                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                                                {lang === 'sv' ? 'Skala' : 'Scale'}
                                                            </span>
                                                            <input 
                                                                type="range" min="0.5" max="2.5" step="0.05" value={q.scale || 1.0}
                                                                onChange={(e) => {
                                                                    setLivePacket(prev => prev.map(p => p.id === q.id ? { ...p, scale: parseFloat(e.target.value) } : p));
                                                                    setIsSaving(false);
                                                                }}
                                                                className="w-20 accent-indigo-500 cursor-ew-resize"
                                                            />
                                                            <span className="text-[10px] font-black text-indigo-600 w-8 text-right">
                                                                {Math.round((q.scale || 1.0) * 100)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* 2. THE SCALED CONTENT WRAPPER */}
                                        <div 
                                            className={`flex flex-col w-full ${alignClass} pointer-events-auto mt-4`}
                                            style={{ 
                                                // 🟢 NEW: Multiply local scale by globalZoom
                                                transform: `scale(${(q.scale || 1.0) * globalZoom})`, 
                                                transformOrigin: q.align === 'start' ? 'top left' : q.align === 'end' ? 'top right' : 'top center',
                                                transition: 'transform 0.1s ease-out'
                                            }}
                                        >
                                            {q.showText !== false && (
                                                <div className={`font-bold text-slate-800 ${textAlignClass} leading-relaxed max-w-md w-full shrink-0 break-words px-4 mb-2 ${sizeClasses.desc}`}>
                                                    <MathDisplay content={compileAnchoredStory(q, lang)} />
                                                </div>
                                            )}
                                            
                                            {q.showVisual !== false && rd && (
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); onSpotlight(rd); }}
                                                    className={`flex justify-center origin-top transition-all duration-300 cursor-zoom-in hover:opacity-80 overflow-visible shrink-0 relative z-30 w-full max-w-md px-4 ${sizeClasses.visualClass}`}
                                                >
                                                    <VisualRenderer 
                                                        data={rd} 
                                                        isWordProblem={q.selectedStoryIndex !== null && q.selectedStoryIndex !== undefined} 
                                                    />
                                                </div>
                                            )}

                                            {rd?.options && rd.options.length > 0 && (
                                                <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-md px-4 shrink-0 relative z-30">
                                                    {rd.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-white shadow-sm ${sizeClasses.desc}`}>
                                                            <span className="font-black text-indigo-500">{['A','B','C','D','E','F'][oIdx]}</span>
                                                            <MathDisplay content={opt} className="font-bold text-slate-700" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {q.showLatex !== false && rd?.latex && !rd?.geometry && (
                                                <div className={`mt-6 py-4 bg-indigo-50/40 rounded-2xl text-center font-serif text-indigo-950 border border-indigo-100/60 shadow-inner w-full max-w-xs shrink-0 ${sizeClasses.latex}`}>
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