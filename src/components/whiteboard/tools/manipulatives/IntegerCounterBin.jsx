// src/components/whiteboard/tools/manipulatives/IntegerCounterBin.jsx
import React, { useMemo, useCallback } from 'react';
import IntegerCounterTool from './IntegerCounterTool';
import { Sparkles, Trash2 } from 'lucide-react';

export default function IntegerCounterBin({ onSpawn, elements = [], setElements = () => {}, lang = 'sv' }) {
    
    const { posCount, negCount, netValue } = useMemo(() => {
        let pos = 0;
        let neg = 0;
        if (Array.isArray(elements)) {
            elements.forEach(el => {
                if (el.type === 'integer_counter') {
                    if (Number(el.value) > 0) pos++;
                    else neg++;
                }
            });
        }
        return { posCount: pos, negCount: neg, netValue: pos - neg };
    }, [elements]);

    const handleSpawnGroup = (count, value) => {
        const baseOffset = Math.floor(Math.random() * 40);
        const startX = 620 + baseOffset;
        const startY = 300 + baseOffset;

        for (let i = 0; i < count; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            onSpawn('integer_counter', { 
                value,
                x: startX + col * 76,
                y: startY + row * 76
            });
        }
    };

    const handleSpawnZeroPairs = (pairsCount = 1) => {
        const baseOffset = Math.floor(Math.random() * 40);
        const startX = 640 + baseOffset;
        const startY = 300 + baseOffset;

        for (let i = 0; i < pairsCount; i++) {
            const px = startX + i * 84;
            onSpawn('integer_counter', { value: 1, x: px, y: startY });
            onSpawn('integer_counter', { value: -1, x: px, y: startY + 80 });
        }
    };

    const clearAllCounters = () => {
        setElements(prev => prev.filter(el => el.type !== 'integer_counter'));
    };

    const handleSnapAll = useCallback(() => {
        setElements(prev => {
            const positives = prev.filter(el => el.type === 'integer_counter' && Number(el.value) > 0);
            const negatives = prev.filter(el => el.type === 'integer_counter' && Number(el.value) < 0);
            const others = prev.filter(el => el.type !== 'integer_counter');

            if (positives.length === 0 && negatives.length === 0) return prev;

            const pairCount = Math.min(positives.length, negatives.length);
            const anchorX = 540;
            const anchorY = 280;
            const colGap = 76;     // Horizontal spacing between pairs
            const pairRowGap = 66; // Snug vertical contact between +1 and -1 (64px diameter + 2px)
            const maxCols = 8;

            const updatedCounters = [];

            // 1. Place matched zero pairs snugly together
            for (let i = 0; i < pairCount; i++) {
                const col = i % maxCols;
                const row = Math.floor(i / maxCols);
                const px = anchorX + col * colGap;
                const py = anchorY + row * 156;

                const pos = positives[i];
                const neg = negatives[i];

                updatedCounters.push({
                    ...pos,
                    x: px,
                    y: py,
                    pairedWithId: neg.id
                });
                updatedCounters.push({
                    ...neg,
                    x: px,
                    y: py + pairRowGap,
                    pairedWithId: pos.id
                });
            }

            // 2. Line up any leftover unpaired counters neatly to the right
            const leftovers = [
                ...positives.slice(pairCount),
                ...negatives.slice(pairCount)
            ];

            leftovers.forEach((item, idx) => {
                const slot = pairCount + idx;
                const col = slot % maxCols;
                const row = Math.floor(slot / maxCols);
                updatedCounters.push({
                    ...item,
                    x: anchorX + col * colGap,
                    y: anchorY + row * 156,
                    pairedWithId: null
                });
            });

            return [...others, ...updatedCounters];
        });
    }, [setElements]);

    const handleClearZeroPairs = useCallback(() => {
        setElements(prev => {
            const toRemove = new Set();
            prev.forEach(el => {
                if (el.type === 'integer_counter' && el.pairedWithId) {
                    toRemove.add(el.id);
                    const partner = prev.find(p => p.id === el.pairedWithId);
                    if (partner) toRemove.add(partner.id);
                }
            });
            return prev.filter(el => !toRemove.has(el.id));
        });
    }, [setElements]);

    return (
        <div className="flex flex-col gap-2.5 w-full font-sans select-none" data-whiteboard-interactive="true">
            {/* Compact Live Net Value Card */}
            <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        {lang === 'sv' ? "Värde på tavlan" : "Net Value"}
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {lang === 'sv' ? "SUMMA:" : "NET:"}
                        </span>
                        <span className={`text-base font-black font-mono leading-none ${netValue > 0 ? 'text-sky-400' : netValue < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                            {netValue > 0 ? `+${netValue}` : netValue}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex items-center justify-center bg-sky-500/20 text-sky-400 py-1 px-2 rounded-lg border border-sky-500/30 text-xs font-black font-mono">
                        +{posCount}
                    </div>
                    <div className="flex items-center justify-center bg-rose-500/20 text-rose-400 py-1 px-2 rounded-lg border border-rose-500/30 text-xs font-black font-mono">
                        −{negCount}
                    </div>
                </div>
            </div>

            {/* Spawn Section Header */}
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 pt-0.5 px-0.5">
                {lang === 'sv' ? "Lägg till markörer" : "Add Counters"}
            </span>

            {/* Vertical-Stacked 1-by-1 Spawner */}
            <div className="grid grid-cols-2 gap-1.5">
                <button
                    type="button"
                    onClick={() => onSpawn('integer_counter', { value: 1 })}
                    className="p-2.5 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 group"
                >
                    <div className="w-7 h-7 rounded-full bg-sky-600 border-2 border-sky-700 flex items-center justify-center text-white font-black text-base shadow-2xs group-hover:scale-105 transition-transform">
                        +
                    </div>
                    <span className="text-[11px] font-black text-slate-800 leading-none">
                        {lang === 'sv' ? "+1 Blå" : "+1 Blue"}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => onSpawn('integer_counter', { value: -1 })}
                    className="p-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 group"
                >
                    <div className="w-7 h-7 rounded-full bg-rose-600 border-2 border-rose-700 flex items-center justify-center text-white font-black text-xl shadow-2xs group-hover:scale-105 transition-transform">
                        −
                    </div>
                    <span className="text-[11px] font-black text-slate-800 leading-none">
                        {lang === 'sv' ? "−1 Röd" : "−1 Red"}
                    </span>
                </button>
            </div>

            {/* Group Spawning (+5, -5, Zero Pair) */}
            <div className="grid grid-cols-3 gap-1.5">
                <button
                    type="button"
                    onClick={() => handleSpawnGroup(5, 1)}
                    className="py-2 px-1 bg-white hover:bg-sky-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title={lang === 'sv' ? "Lägg till 5 positiva" : "Add 5 positive"}
                >
                    <span className="text-xs font-black text-sky-600 leading-none">+5</span>
                    <span className="text-[9px] font-bold text-slate-400">{lang === 'sv' ? "Blåa" : "Blue"}</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleSpawnGroup(5, -1)}
                    className="py-2 px-1 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title={lang === 'sv' ? "Lägg till 5 negativa" : "Add 5 negative"}
                >
                    <span className="text-xs font-black text-rose-600 leading-none">−5</span>
                    <span className="text-[9px] font-bold text-slate-400">{lang === 'sv' ? "Röda" : "Red"}</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleSpawnZeroPairs(1)}
                    className="py-2 px-1 bg-white hover:bg-amber-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title={lang === 'sv' ? "Lägg till ett nollpar (+1 och -1)" : "Add a zero pair (+1 and -1)"}
                >
                    <Sparkles size={13} className="text-amber-500" />
                    <span className="text-[9px] font-black text-slate-700 leading-none">{lang === 'sv' ? "Nollpar" : "Pair"}</span>
                </button>
            </div>

            {/* Full-Width Stacked Actions */}
            {posCount + negCount > 0 && (
                <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-0.5">
                        {lang === 'sv' ? "Åtgärder" : "Actions"}
                    </span>

                    <button
                        type="button"
                        onClick={handleSnapAll}
                        className="w-full py-2 px-2.5 bg-white hover:bg-sky-50 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 text-[11px] font-bold text-slate-700"
                    >
                        <Sparkles size={13} className="text-sky-500 shrink-0" />
                        <span>{lang === 'sv' ? "Snapa ihop nollpar" : "Snap zero pairs"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleClearZeroPairs}
                        className="w-full py-2 px-2.5 bg-white hover:bg-amber-50 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 text-[11px] font-bold text-slate-700"
                    >
                        <Trash2 size={13} className="text-amber-500 shrink-0" />
                        <span>{lang === 'sv' ? "Rensa nollpar" : "Clear zero pairs"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={clearAllCounters}
                        className="w-full py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <Trash2 size={13} className="shrink-0" />
                        <span>{lang === 'sv' ? "Rensa alla markörer" : "Clear all counters"}</span>
                    </button>
                </div>
            )}
        </div>
    );
}