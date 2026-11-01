// src/components/whiteboard/tools/manipulatives/IntegerCounterBin.jsx
import React, { useMemo } from 'react';
import { Plus, Minus, Sparkles, Trash2 } from 'lucide-react';

export default function IntegerCounterBin({ onSpawn, elements = [], setElements = () => {}, lang = 'sv' }) {
    
    // Live calculation of all counters currently on the whiteboard
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
            onSpawn(value, {
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
            onSpawn(1, { x: px, y: startY });
            onSpawn(-1, { x: px, y: startY + 80 });
        }
    };

    const clearAllCounters = () => {
        setElements(prev => prev.filter(el => el.type !== 'integer_counter'));
    };

    return (
        <div className="flex flex-col gap-3 w-full font-sans select-none" data-whiteboard-interactive="true">
            {/* Live Net Value Display Card */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-md flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {lang === 'sv' ? "Totalt värde på tavlan:" : "Total Net Value on Board:"}
                </span>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-sky-500/20 text-sky-400 px-2 py-1 rounded-lg border border-sky-500/30 text-xs font-black">
                            <span>+{posCount}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-rose-500/20 text-rose-400 px-2 py-1 rounded-lg border border-rose-500/30 text-xs font-black">
                            <span>−{negCount}</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">
                            {lang === 'sv' ? "SUMMA" : "NET"}
                        </span>
                        <span className={`text-xl font-black font-mono leading-none ${netValue > 0 ? 'text-sky-400' : netValue < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                            {netValue > 0 ? `+${netValue}` : netValue}
                        </span>
                    </div>
                </div>
            </div>

            {/* Spawn Section Header */}
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 pt-1">
                {lang === 'sv' ? "Lägg till räknemarkörer" : "Add Counters"}
            </span>

            {/* Quick 1-by-1 Spawner */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => onSpawn(1)}
                    className="p-3 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl flex items-center gap-2.5 transition-all shadow-xs cursor-pointer active:scale-95 group"
                >
                    <div className="w-8 h-8 rounded-full bg-sky-600 border-2 border-sky-700 flex items-center justify-center text-white font-black text-lg shadow-2xs group-hover:scale-105 transition-transform">
                        +
                    </div>
                    <div className="text-left">
                        <div className="text-xs font-black text-slate-800">+1 Blå</div>
                        <div className="text-[10px] text-slate-400">{lang === 'sv' ? "Positiv" : "Positive"}</div>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => onSpawn(-1)}
                    className="p-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-2xl flex items-center gap-2.5 transition-all shadow-xs cursor-pointer active:scale-95 group"
                >
                    <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-rose-700 flex items-center justify-center text-white font-black text-2xl shadow-2xs group-hover:scale-105 transition-transform">
                        −
                    </div>
                    <div className="text-left">
                        <div className="text-xs font-black text-slate-800">−1 Röd</div>
                        <div className="text-[10px] text-slate-400">{lang === 'sv' ? "Negativ" : "Negative"}</div>
                    </div>
                </button>
            </div>

            {/* Group Spawning (+5, -5, Zero Pair) */}
            <div className="grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => handleSpawnGroup(5, 1)}
                    className="p-2.5 bg-white hover:bg-sky-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title={lang === 'sv' ? "Lägg till 5 positiva" : "Add 5 positive"}
                >
                    <span className="text-xs font-black text-sky-600">+5</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{lang === 'sv' ? "Blåa" : "Blue"}</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleSpawnGroup(5, -1)}
                    className="p-2.5 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title={lang === 'sv' ? "Lägg till 5 negativa" : "Add 5 negative"}
                >
                    <span className="text-xs font-black text-rose-600">−5</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{lang === 'sv' ? "Röda" : "Red"}</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleSpawnZeroPairs(1)}
                    className="p-2.5 bg-white hover:bg-amber-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title={lang === 'sv' ? "Lägg till ett nollpar (+1 och -1)" : "Add a zero pair (+1 and -1)"}
                >
                    <Sparkles size={14} className="text-amber-500" />
                    <span className="text-[9px] font-black text-slate-700 uppercase">{lang === 'sv' ? "Nollpar" : "Pair"}</span>
                </button>
            </div>

            {/* Clear Counters Action */}
            {posCount + negCount > 0 && (
                <button
                    type="button"
                    onClick={clearAllCounters}
                    className="mt-1 p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                    <Trash2 size={13} />
                    <span>{lang === 'sv' ? "Rensa alla markörer" : "Clear all counters"}</span>
                </button>
            )}
        </div>
    );
}