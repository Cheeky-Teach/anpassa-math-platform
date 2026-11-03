// src/components/shared/WorkedExampleCard.jsx
import React from 'react';
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
        <div className="whiteboard-protect worked-example-container w-full rounded-xl border-2 border-amber-400 bg-amber-50/20 p-2.5 sm:p-3 text-slate-900 break-inside-avoid select-none relative overflow-hidden m-0">
            
            {/* COMPACT SLIM HEADER */}
            <div className="flex items-center gap-2 border-b border-amber-300 pb-1 mb-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shrink-0">
                    {labelBadge}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 truncate">
                    {item.name}
                </span>
            </div>

            {/* UNCONDITIONAL 2-COLUMN GRID (Never stacks, matches print preview exactly) */}
            <div className="worked-example-grid flex flex-row items-stretch gap-3 w-full">
                
                {/* 🟢 LEFT COLUMN (38% width): Question, prompt, visual */}
                <div className="w-[38%] shrink-0 flex flex-col justify-between pr-2 border-r border-amber-200">
                    <div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-amber-900/60 mb-0.5">
                            {lang === 'sv' ? "Uppgift" : "Problem"}
                        </div>
                        <div className="text-[11px] font-bold leading-tight text-slate-900 mb-1.5">
                            <MathDisplay content={compileAnchoredStory(item, lang) || rd?.description || item.name} />
                        </div>

                        {rd?.latex && !rd?.geometry && (
                            <div className="py-1 px-2 rounded-lg bg-white/80 border border-amber-200/80 text-center font-serif text-sm font-bold text-slate-950 shadow-xs">
                                <MathDisplay content={`$$${rd.latex}$$`} />
                            </div>
                        )}
                    </div>

                    {hasVisual && (
                        <div className="w-full flex items-center justify-center scale-75 origin-center -my-2 overflow-hidden [&_svg]:max-h-[85px] [&_svg]:w-auto [&_canvas]:max-h-[85px] [&_canvas]:w-auto">
                            <VisualRenderer data={rd} isWordProblem={false} />
                        </div>
                    )}
                </div>

                {/* 🟢 RIGHT COLUMN (62% width): Strict Vertical Math Ladder */}
                <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-amber-900/60 pb-0.5 border-b border-amber-200/60">
                        <span>{lang === 'sv' ? "Steg / Förklaring" : "Steps / Explanation"}</span>
                        <span className="w-44 text-center">{lang === 'sv' ? "Lösning" : "Solution"}</span>
                    </div>

                    {clues.map((step, idx) => (
                        <div 
                            key={`step-${idx}`} 
                            className="flex items-center justify-between gap-2 py-0.5 border-b border-amber-100/70 last:border-0"
                        >
                            {/* Step Text Commentary */}
                            <div className="flex items-baseline gap-1 min-w-0 flex-1 pr-1">
                                <span className="font-mono font-black text-[9px] text-amber-900 shrink-0">
                                    {idx + 1}.
                                </span>
                                <span className="text-[10px] font-semibold text-slate-800 leading-tight">
                                    <MathDisplay content={step.text} />
                                </span>
                            </div>

                            {/* Vertically Aligned Math Ladder Column (Fixed Width & Centered) */}
                            <div className="w-44 shrink-0 flex items-center justify-center bg-white/90 border border-amber-200/70 rounded-md py-0.5 px-1.5 shadow-xs">
                                {step.latex ? (
                                    <div className="font-serif text-[11px] font-bold text-slate-950 text-center">
                                        <MathDisplay content={`$$${step.latex}$$`} />
                                    </div>
                                ) : (
                                    <span className="text-[9px] italic text-slate-400">
                                        {lang === 'sv' ? "Se text" : "See text"}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}