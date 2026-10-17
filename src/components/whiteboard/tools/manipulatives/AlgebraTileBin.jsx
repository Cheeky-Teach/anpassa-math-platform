// src/components/whiteboard/tools/manipulatives/AlgebraTileBin.jsx
import React, { useState } from 'react';

export default function AlgebraTileBin({ onSpawn, lang = 'sv', showDivider = true }) {
    const [targetSide, setTargetSide] = useState('VL');

    const tiles = [
        // Positive group
        { kind: 'x2', sign: 1, label: '+x²', w: 'w-14 h-14', bg: 'bg-blue-100 border-blue-500 text-blue-700', desc: 'x²' },
        { kind: 'x', sign: 1, label: '+x', w: 'w-8 h-14', bg: 'bg-blue-50 border-blue-400 text-blue-600', desc: 'x' },
        { kind: '1', sign: 1, label: '+1', w: 'w-8 h-8', bg: 'bg-emerald-50 border-emerald-400 text-emerald-700', desc: '1' },
        
        // Negative group
        { kind: 'x2', sign: -1, label: '−x²', w: 'w-14 h-14', bg: 'bg-rose-100 border-rose-500 text-rose-700', desc: '−x²' },
        { kind: 'x', sign: -1, label: '−x', w: 'w-8 h-14', bg: 'bg-rose-50 border-rose-400 text-rose-600', desc: '−x' },
        { kind: '1', sign: -1, label: '−1', w: 'w-8 h-8', bg: 'bg-rose-50 border-rose-400 text-rose-700', desc: '−1' },
    ];

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Equation Side Switcher (VL vs HL) */}
            {showDivider && (
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                        {lang === 'sv' ? "Placera i led:" : "Target Side:"}
                    </span>
                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
                        <button
                            type="button"
                            onClick={() => setTargetSide('VL')}
                            className={`py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                targetSide === 'VL'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {lang === 'sv' ? "VL (Vänster)" : "Left (LHS)"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setTargetSide('HL')}
                            className={`py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                targetSide === 'HL'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {lang === 'sv' ? "HL (Höger)" : "Right (RHS)"}
                        </button>
                    </div>
                </div>
            )}

            {/* Tile Buttons Grid */}
            <div className="grid grid-cols-2 gap-3 items-end justify-items-center py-1">
                {tiles.map((t, idx) => (
                    <button
                        key={`${t.kind}_${t.sign}_${idx}`}
                        type="button"
                        onClick={() => onSpawn(t.kind, t.sign, targetSide)}
                        className="group flex flex-col items-center justify-end p-2 rounded-2xl hover:bg-slate-100/70 border border-transparent hover:border-slate-200 transition-all cursor-pointer active:scale-95 w-full"
                        title={lang === 'sv' ? `Lägg till ${t.label} i ${targetSide}` : `Add ${t.label}`}
                    >
                        <div className={`${t.w} ${t.bg} border-2 rounded-xl flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 group-hover:shadow-md transition-all`}>
                            {t.desc}
                        </div>
                        <span className="text-[11px] font-black text-slate-600 mt-1.5">
                            {t.label}
                        </span>
                    </button>
                ))}
            </div>

            <p className="text-[10px] text-center text-slate-400 font-medium">
                {lang === 'sv' ? "Klicka för att placera på tavlan" : "Click to place on board"}
            </p>
        </div>
    );
}