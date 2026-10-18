// src/components/whiteboard/WhiteboardDrawer.jsx
import React from 'react';
import { X, Layers, Shapes, PieChart, LineChart } from 'lucide-react';
import AlgebraTileBin from './tools/manipulatives/AlgebraTileBin';

export default function WhiteboardDrawer({ 
    activeDrawer, 
    onClose, 
    onSpawn, 
    lang = 'sv',
    showDividingLine = true 
}) {
    if (!activeDrawer) return null;

    const titles = {
        algebra: { label: lang === 'sv' ? "Algebrabrickor" : "Algebra Tiles", icon: Layers, color: "text-indigo-600" },
        shapes: { label: lang === 'sv' ? "Figurer & 3D" : "Shapes & 3D", icon: Shapes, color: "text-emerald-600" },
        fractions: { label: lang === 'sv' ? "Bråk & Sannolikhet" : "Fractions & Chance", icon: PieChart, color: "text-amber-600" },
        data: { label: lang === 'sv' ? "Grafer & Verktyg" : "Data & Tools", icon: LineChart, color: "text-blue-600" }
    };

    const current = titles[activeDrawer] || titles.algebra;
    const Icon = current.icon;

    return (
        <aside 
            onPointerDown={(e) => e.stopPropagation()} 
            className="absolute right-6 top-20 z-[60] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl shadow-2xl p-4 flex flex-col select-none animate-in fade-in slide-in-from-right-4 duration-200 w-72 max-h-[calc(100vh-160px)]"
        >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                    <Icon size={18} className={current.color} />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                        {current.label}
                    </span>
                </div>
                <button 
                    type="button"
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title={lang === 'sv' ? "Stäng panel" : "Close panel"}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-3 min-h-0 custom-scrollbar">
                {/* 1. ALGEBRA */}
                {activeDrawer === 'algebra' && (
                    <AlgebraTileBin 
                        onSpawn={(kind, sign, side) => onSpawn('algebra_tile', { kind, sign, side })} 
                        lang={lang} 
                        showDivider={showDividingLine}
                    />
                )}

                {/* 2. SHAPES & 3D */}
                {activeDrawer === 'shapes' && (
                    <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">2D Figurer</span>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => onSpawn('rect')} className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 flex flex-col items-center gap-1.5 cursor-pointer">
                                <div className="w-7 h-7 border-2 border-emerald-600 rounded-sm" />
                                <span className="text-[10px] font-bold text-slate-600">Rektangel</span>
                            </button>
                            <button onClick={() => onSpawn('circle')} className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 flex flex-col items-center gap-1.5 cursor-pointer">
                                <div className="w-7 h-7 border-2 border-emerald-600 rounded-full" />
                                <span className="text-[10px] font-bold text-slate-600">Cirkel</span>
                            </button>
                            <button onClick={() => onSpawn('triangle')} className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 flex flex-col items-center gap-1.5 cursor-pointer">
                                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[22px] border-b-emerald-600" />
                                <span className="text-[10px] font-bold text-slate-600">Triangel</span>
                            </button>
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-100">3D Figurer</span>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'cube', label: 'Kub' },
                                { id: 'prism', label: 'Prisma' },
                                { id: 'triprism', label: 'Triang. Prisma' },
                                { id: 'pyramid', label: 'Pyramid' },
                                { id: 'house', label: 'Hus' },
                                { id: 'cylinder', label: 'Cylinder' },
                                { id: 'silo', label: 'Silo' },
                                { id: 'tube', label: 'Rör (Tube)' },
                                { id: 'cone', label: 'Kon' },
                                { id: 'icecream', label: 'Glasskon' },
                                { id: 'sphere', label: 'Klot' },
                                { id: 'hemi', label: 'Halvklot' }
                            ].map(sh => (
                                <button 
                                    key={sh.id} 
                                    onClick={() => onSpawn(`3d_${sh.id}`)} 
                                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-700 cursor-pointer text-center truncate"
                                    title={sh.label}
                                >
                                    {sh.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. FRACTIONS */}
                {activeDrawer === 'fractions' && (
                    <div className="flex flex-col gap-2.5">
                        <button 
                            onClick={() => onSpawn('frac_rect')} 
                            className="p-3 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-2xl flex items-center gap-3 transition-all cursor-pointer"
                        >
                            <div className="w-12 h-7 border-2 border-amber-500 rounded flex divide-x divide-amber-400 shrink-0">
                                <div className="flex-1 bg-amber-200" />
                                <div className="flex-1" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-bold text-slate-800">Bråkstav (Rektangel)</div>
                                <div className="text-[10px] text-slate-400">Justerbara delar</div>
                            </div>
                        </button>

                        <button 
                            onClick={() => onSpawn('frac_circle')} 
                            className="p-3 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-2xl flex items-center gap-3 transition-all cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center shrink-0">
                                <div className="w-full h-0.5 bg-amber-500" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-bold text-slate-800">Bråkcirkel</div>
                                <div className="text-[10px] text-slate-400">Tårtdiagram</div>
                            </div>
                        </button>

                        <button 
                            onClick={() => onSpawn('spinner')} 
                            className="p-3 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-2xl flex items-center gap-3 transition-all cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center relative shrink-0">
                                <div className="w-3.5 h-0.5 bg-rose-500 -rotate-45 origin-left" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-bold text-slate-800">Lyckohjul (Spinner)</div>
                                <div className="text-[10px] text-slate-400">Sannolikhet</div>
                            </div>
                        </button>
                    </div>
                )}

                {/* 4. DATA & TOOLS */}
                {activeDrawer === 'data' && (
                    <div className="grid grid-cols-2 gap-2.5">
                        <button onClick={() => onSpawn('coord')} className="p-3 rounded-2xl border border-slate-200 hover:bg-blue-50/50 flex flex-col items-center gap-1 cursor-pointer text-center">
                            <LineChart size={22} className="text-blue-600" />
                            <span className="text-[10px] font-bold text-slate-700">Koordinatsystem</span>
                        </button>
                        <button onClick={() => onSpawn('tchart')} className="p-3 rounded-2xl border border-slate-200 hover:bg-blue-50/50 flex flex-col items-center gap-1 cursor-pointer text-center">
                            <span className="text-base font-black text-blue-600">x | y</span>
                            <span className="text-[10px] font-bold text-slate-700">Värdetabell</span>
                        </button>
                        <button onClick={() => onSpawn('ruler')} className="p-3 rounded-2xl border border-slate-200 hover:bg-blue-50/50 flex flex-col items-center gap-1 cursor-pointer text-center">
                            <span className="text-base">📏</span>
                            <span className="text-[10px] font-bold text-slate-700">Tallinje</span>
                        </button>
                        <button onClick={() => onSpawn('protractor')} className="p-3 rounded-2xl border border-slate-200 hover:bg-blue-50/50 flex flex-col items-center gap-1 cursor-pointer text-center">
                            <span className="text-base">📐</span>
                            <span className="text-[10px] font-bold text-slate-700">Gradskiva</span>
                        </button>
                        <button onClick={() => onSpawn('dice')} className="p-3 rounded-2xl border border-slate-200 hover:bg-blue-50/50 flex flex-col items-center gap-1 cursor-pointer text-center">
                            <span className="text-base">🎲</span>
                            <span className="text-[10px] font-bold text-slate-700">Tärningar</span>
                        </button>
                        <button onClick={() => onSpawn('calculator')} className="p-3 rounded-2xl border border-slate-200 hover:bg-blue-50/50 flex flex-col items-center gap-1 cursor-pointer text-center">
                            <span className="text-base">🔢</span>
                            <span className="text-[10px] font-bold text-slate-700">Miniräknare</span>
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}