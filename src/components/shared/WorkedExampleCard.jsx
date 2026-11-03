// src/components/shared/WorkedExampleCard.jsx
import React from 'react';
import { Sparkles } from 'lucide-react';
import MathDisplay from './MathDisplay';
import VisualRenderer from '../visuals/VisualRenderer';
import { compileAnchoredStory } from '../../core/utils/storyCompiler';

export default function WorkedExampleCard({ 
    item, 
    lang = 'sv', 
    isPrintMode = false 
}) {
    if (!item) return null;

    const rd = item.resolvedData?.renderData || item.resolvedData;
    const hasVisual = !!(rd && (
        rd.graph || rd.geometry || rd.pattern || rd.volume || 
        rd.marbles || rd.spinner || rd.freqTable || rd.percentGrid || 
        rd.scale || rd.similarity || rd.tree
    ));

    const rawClues = item.clues || item.resolvedData?.clues || [];
    const clues = rawClues.map(c => {
        if (typeof c === 'object' && c !== null) {
            return {
                text: c[lang] || c.text || '',
                latex: c.latex || null
            };
        }
        return { text: String(c), latex: null };
    });

    const labelBadge = lang === 'sv' ? "Exempel" : "Example";

    return (
        <div className="whiteboard-protect w-full rounded-xl border border-amber-300 bg-amber-50/25 p-2.5 sm:p-3 text-slate-900 break-inside-avoid select-none relative overflow-hidden m-0">
            
            {/* COMPACT SLIM HEADER */}
            <div className="flex items-center gap-2 border-b border-amber-200/60 pb-1.5 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <span>{labelBadge}</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900/80 truncate">
                    {item.name}
                </span>
            </div>

            {/* HIGH-DENSITY 2-COLUMN GRID */}
            <div className="grid grid-cols-12 gap-3 items-center">
                
                {/* LEFT: Task prompt + tight visual */}
                <div className={`col-span-12 md:col-span-5 flex flex-col justify-center ${hasVisual ? 'space-y-1' : ''}`}>
                    <div className="text-[11px] font-bold leading-tight text-slate-900">
                        <MathDisplay content={compileAnchoredStory(item, lang) || rd?.description || item.name} />
                    </div>

                    {rd?.latex && !rd?.geometry && (
                        <div className="py-0.5 text-center font-serif text-sm text-slate-950 font-bold">
                            <MathDisplay content={`$$${rd.latex}$$`} />
                        </div>
                    )}

                    {hasVisual && (
                        <div className="w-full flex items-center justify-center scale-75 origin-center -my-2 overflow-hidden [&_svg]:max-h-[90px] [&_svg]:w-auto [&_canvas]:max-h-[90px] [&_canvas]:w-auto">
                            <VisualRenderer data={rd} isWordProblem={false} />
                        </div>
                    )}
                </div>

                {/* RIGHT: Compact Step Rows (Clean Minimalist Divider Rows) */}
                <div className="col-span-12 md:col-span-7 border-t md:border-t-0 md:border-l border-amber-200/60 md:pl-3 space-y-1">
                    {clues.map((step, idx) => (
                        <div 
                            key={`step-${idx}`} 
                            className="flex items-baseline justify-between gap-2 py-0.5 border-b border-amber-100/60 last:border-0"
                        >
                            <div className="flex items-baseline gap-1.5 min-w-0 pr-1">
                                <span className="font-mono font-black text-[9px] text-amber-800 shrink-0">
                                    {idx + 1}.
                                </span>
                                <span className="text-[10px] font-semibold text-slate-800 leading-tight">
                                    <MathDisplay content={step.text} />
                                </span>
                            </div>

                            {step.latex && (
                                <div className="shrink-0 font-serif text-[11px] font-bold text-slate-950 bg-white/80 px-1.5 py-0.2 rounded border border-amber-200/50">
                                    <MathDisplay content={`$$${step.latex}$$`} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}