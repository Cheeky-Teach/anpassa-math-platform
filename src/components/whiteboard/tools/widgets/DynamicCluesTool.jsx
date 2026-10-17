// src/components/whiteboard/tools/widgets/DynamicCluesTool.jsx
import React from 'react';
import { List, Layers, ChevronLeft, ChevronRight } from 'lucide-react';

export const DynamicCluesTool = {
    type: 'dynamicClues',
    hasOptions: true,

    createDefault: (id, color) => ({
        id,
        type: 'dynamicClues',
        x: 600,
        y: 200,
        width: 480,
        height: 380,
        progress: 0,
        fontSize: 24,
        clueLayout: 'list',
        showText: true,
        showLatex: true,
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements }) => (
        <>
            <div className="flex items-center gap-1">
                <button onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, fontSize: Math.max(12, (o.fontSize || 24) - 2) } : o))} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-black text-[10px]">A-</button>
                <span className="text-[10px] font-black w-6 text-center">{el.fontSize || 24}px</span>
                <button onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, fontSize: Math.min(72, (o.fontSize || 24) + 2) } : o))} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-black text-[10px]">A+</button>
            </div>

            <div className="flex items-center gap-1">
                <button onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, clueLayout: 'list' } : o))} className={`px-2 py-1 rounded text-[10px] font-black transition-colors ${el.clueLayout !== 'paging' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`} title="List View"><List size={12} /></button>
                <button onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, clueLayout: 'paging' } : o))} className={`px-2 py-1 rounded text-[10px] font-black transition-colors ${el.clueLayout === 'paging' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`} title="Paging View"><Layers size={12} /></button>
            </div>

            <div className="w-px h-4 bg-slate-300 mx-1" />
            <div className="flex items-center gap-1">
                <button onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, showText: o.showText === false } : o))} className={`px-2 py-1 rounded text-[10px] font-black transition-colors ${el.showText !== false ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>TEXT</button>
                <button onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, showLatex: o.showLatex === false } : o))} className={`px-2 py-1 rounded text-[10px] font-black transition-colors ${el.showLatex !== false ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>LATEX</button>
            </div>
        </>
    ),

    render: ({ el, lang, livePacket, MathDisplay, transform, isSelected, showUI, renderHandles, setElements, setSelectedId }) => {
        const q = livePacket.find(p => p.id === el.questionId);
        const clues = q?.clues || q?.resolvedData?.clues || [];
        const progress = el.progress || 0;

        return (
            <React.Fragment key={el.id}>
                <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                    <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="white" fillOpacity="0.95" stroke={isSelected ? "#3b82f6" : "#e2e8f0"} strokeWidth={isSelected ? 3 : 2} rx="14" />
                    
                    <foreignObject x={el.x} y={el.y} width={el.width} height={el.height}>
                        <div className="w-full h-full flex flex-col pointer-events-auto">
                            <div className="w-full h-8 flex items-center justify-center shrink-0 opacity-40 hover:opacity-100 transition-opacity cursor-move" style={{ touchAction: 'none' }}>
                                <div className="w-12 h-1.5 bg-slate-400 rounded-full pointer-events-none" />
                            </div>

                            <div 
                                className="flex-1 px-4 pb-4 overflow-y-auto custom-scrollbar cursor-text"
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(el.id);
                                }} 
                            >
                                {clues.length === 0 ? (
                                    <div className="text-slate-400 italic font-bold text-center mt-4 text-sm">
                                        {lang === 'sv' ? "Inga steg tillgängliga" : "No steps available"}
                                    </div>
                                ) : progress === 0 ? (
                                    <div className="text-slate-400 italic font-bold text-center mt-10 text-sm">
                                        {lang === 'sv' ? "Använd pilarna nedan för att visa stegen." : "Use the arrows below to reveal steps."}
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {(el.clueLayout === 'paging' ? (progress > 0 ? [clues[progress - 1]] : []) : clues.slice(0, progress)).map((clue, arrayIdx) => {
                                            const idx = el.clueLayout === 'paging' ? progress - 1 : arrayIdx;
                                            const text = typeof clue === 'object' ? clue[lang] || clue.text : clue;
                                            const latex = typeof clue === 'object' ? clue.latex : null;
                                            const fSize = el.fontSize || 24;

                                            return (
                                                <div key={idx} className="pb-3 mb-3 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0 animate-in fade-in slide-in-from-top-2">
                                                    <div className="font-black text-indigo-500 uppercase tracking-widest mb-1 opacity-70" style={{ fontSize: `${Math.max(10, fSize * 0.5)}px` }}>
                                                        {lang === 'sv' ? 'Steg' : 'Step'} {idx + 1}
                                                    </div>
                                                    {el.showText !== false && text && (
                                                        <div className="font-bold text-slate-700 leading-relaxed" style={{ fontSize: `${fSize}px` }}>
                                                            {MathDisplay ? <MathDisplay content={text} /> : text}
                                                        </div>
                                                    )}
                                                    {el.showLatex !== false && latex && (
                                                        <div className="mt-2 text-center text-indigo-600 font-serif bg-indigo-50/50 py-2 rounded-lg border border-indigo-100" style={{ fontSize: `${fSize * 1.2}px` }}>
                                                            {MathDisplay ? <MathDisplay content={`$$${latex}$$`} /> : latex}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div 
                                className="h-10 bg-slate-50 border-t border-slate-200 flex items-center justify-between px-3 shrink-0 rounded-b-[14px]"
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(el.id);
                                }} 
                            >
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setElements(p => p.map(o => o.id === el.id ? { ...o, progress: Math.max(0, progress - 1) } : o)); }} 
                                    className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors cursor-pointer"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-[11px] font-black text-slate-500 tracking-widest select-none">{progress} / {clues.length}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setElements(p => p.map(o => o.id === el.id ? { ...o, progress: Math.min(clues.length, progress + 1) } : o)); }} 
                                    className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors cursor-pointer"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </foreignObject>
                </g>
                {showUI && renderHandles(el)}
            </React.Fragment>
        );
    }
};