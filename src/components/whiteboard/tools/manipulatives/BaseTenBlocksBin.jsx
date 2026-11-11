// src/components/whiteboard/tools/manipulatives/BaseTenBlocksBin.jsx
import React, { useMemo, useCallback } from 'react';
import BaseTenBlocksTool from './BaseTenBlocksTool';
import { Sparkles, Trash2, Combine, Split } from 'lucide-react';

export default function BaseTenBlocksBin({ 
    onSpawn, 
    elements = [], 
    setElements = () => {}, 
    selectedIds = [],
    setSelectedIds = () => {},
    lang = 'sv' 
}) {
    
    // Live calculation of all blocks currently on the whiteboard
    const { onesCount, tensCount, hundredsCount } = useMemo(() => {
        let ones = 0;
        let tens = 0;
        let hundreds = 0;
        if (Array.isArray(elements)) {
            elements.forEach(el => {
                if (el.type === 'base_ten_block') {
                    if (el.blockType === 'ones') ones++;
                    else if (el.blockType === 'tens') tens++;
                    else if (el.blockType === 'hundreds') hundreds++;
                }
            });
        }
        return { onesCount: ones, tensCount: tens, hundredsCount: hundreds };
    }, [elements]);

    const handleSpawnGroup = (count, type) => {
        const baseOffset = Math.floor(Math.random() * 40);
        const startX = 640 + baseOffset;
        const startY = 300 + baseOffset;

        for (let i = 0; i < count; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            onSpawn('base_ten_block', { 
                blockType: type,
                x: startX + col * (type === 'ones' ? 52 : type === 'tens' ? 52 : 420),
                y: startY + row * (type === 'hundreds' ? 420 : 52)
            });
        }
    };

    const handleClearBlocks = () => {
        setElements(prev => prev.filter(el => el.type !== 'base_ten_block'));
        setSelectedIds([]);
    };

    const handleSnapAll = useCallback(() => {
        setElements(prev => {
            return prev.map(el => {
                if (el.type === 'base_ten_block') {
                    const snapped = BaseTenBlocksTool.snapAlgorithm(el, prev);
                    return { ...el, ...snapped };
                }
                return el;
            });
        });
    }, [setElements]);

    // Detect if the active canvas selection qualifies for a Merge or Split
    const smartAction = useMemo(() => {
        if (!selectedIds || selectedIds.length === 0) return null;

        // 1. Check for 10-block Merge (10 ones -> 1 ten, or 10 tens -> 1 hundred)
        const mergePlan = BaseTenBlocksTool.getValidMerge(selectedIds, elements);
        if (mergePlan) {
            return {
                mode: 'merge',
                label: mergePlan.targetType === 'tens'
                    ? (lang === 'sv' ? "Slå ihop till 10:a" : "Merge to Ten")
                    : (lang === 'sv' ? "Slå ihop till 100:a" : "Merge to Hundred"),
                execute: () => {
                    setElements(prev => [
                        ...prev.filter(el => !mergePlan.removeIds.includes(el.id)),
                        mergePlan.newBlock
                    ]);
                    setSelectedIds([mergePlan.newBlock.id]);
                }
            };
        }

        // 2. Check for Single-Block Split (1 ten -> 10 ones, or 1 hundred -> 10 tens)
        if (selectedIds.length === 1) {
            const splitPlan = BaseTenBlocksTool.getValidSplit(selectedIds[0], elements);
            if (splitPlan) {
                return {
                    mode: 'split',
                    label: splitPlan.targetType === 'ones'
                        ? (lang === 'sv' ? "Dela upp till 1:or" : "Split to Ones")
                        : (lang === 'sv' ? "Dela upp till 10:or" : "Split to Tens"),
                    execute: () => {
                        setElements(prev => [
                            ...prev.filter(el => !splitPlan.removeIds.includes(el.id)),
                            ...splitPlan.newBlocks
                        ]);
                        setSelectedIds(splitPlan.newBlocks.map(b => b.id));
                    }
                };
            }
        }

        return null;
    }, [selectedIds, elements, lang, setElements, setSelectedIds]);

    return (
        <div className="flex flex-col gap-3 w-full font-sans select-none" data-whiteboard-interactive="true">
            {/* Live Count Display Card */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-md flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {lang === 'sv' ? "Antal blocktyper:" : "Count of block types:"}
                </span>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-sky-500/20 text-sky-400 px-2 py-1 rounded-lg border border-sky-500/30 text-xs font-black">
                            <span>{onesCount} 1s</span>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2 py-1 rounded-lg border border-amber-500/30 text-xs font-black">
                            <span>{tensCount} 10s</span>
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/30 text-xs font-black">
                            <span>{hundredsCount} 100s</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">
                            {lang === 'sv' ? "TOTAL" : "TOTAL"}
                        </span>
                        <span className={`text-xl font-black font-mono leading-none ${onesCount + tensCount + hundredsCount > 0 ? 'text-white' : 'text-slate-600'}`}>
                            {onesCount + tensCount + hundredsCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Spawn Section Header */}
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 pt-1">
                {lang === 'sv' ? "Lägg till block" : "Add blocks"}
            </span>

            {/* Quick 1-by-1 Spawner */}
            <div className="grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => onSpawn('base_ten_block', { blockType: 'ones' })}
                    className="p-3 bg-white hover:bg-sky-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95 group"
                >
                    <div className="w-6 h-6 rounded bg-sky-600 border-2 border-sky-700 flex items-center justify-center text-white font-black text-xs">1</div>
                    <span className="text-[9px] font-bold text-slate-700">{lang === 'sv' ? "Ettal" : "Ones"}</span>
                </button>

                <button
                    type="button"
                    onClick={() => onSpawn('base_ten_block', { blockType: 'tens' })}
                    className="p-3 bg-white hover:bg-amber-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95 group"
                >
                    <div className="w-6 h-6 rounded bg-amber-600 border-2 border-amber-700 flex items-center justify-center text-white font-black text-xs">10</div>
                    <span className="text-[9px] font-bold text-slate-700">{lang === 'sv' ? "Tiotal" : "Tens"}</span>
                </button>

                <button
                    type="button"
                    onClick={() => onSpawn('base_ten_block', { blockType: 'hundreds' })}
                    className="p-3 bg-white hover:bg-emerald-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95 group"
                >
                    <div className="w-6 h-6 rounded bg-emerald-600 border-2 border-emerald-700 flex items-center justify-center text-white font-black text-xs">100</div>
                    <span className="text-[9px] font-bold text-slate-700">{lang === 'sv' ? "Hundratal" : "Hundreds"}</span>
                </button>
            </div>

            {/* Group Spawning */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => handleSpawnGroup(5, 'ones')}
                    className="p-2.5 bg-white hover:bg-sky-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                    <span className="text-xs font-black text-sky-600">+5 1s</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleSpawnGroup(5, 'tens')}
                    className="p-2.5 bg-white hover:bg-amber-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                    <span className="text-xs font-black text-amber-600">+5 10s</span>
                </button>
            </div>

            {/* Actions Section */}
            {onesCount + tensCount + hundredsCount > 0 && (
                <>
                    <button
                        type="button"
                        onClick={handleClearBlocks}
                        className="mt-1 p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <Trash2 size={13} />
                        <span>{lang === 'sv' ? "Rensa alla block" : "Clear all blocks"}</span>
                    </button>

                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 pt-2">
                        {lang === 'sv' ? "Smarta åtgärder" : "Smart Actions"}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                        {/* Snap Together Button */}
                        <button
                            type="button"
                            onClick={handleSnapAll}
                            className="p-2.5 bg-white hover:bg-sky-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                            title={lang === 'sv' ? "Snapa ihop block" : "Snap blocks together"}
                        >
                            <Sparkles size={14} className="text-sky-500" />
                            <span className="text-xs font-bold text-slate-700">{lang === 'sv' ? "Snapa ihop" : "Snap together"}</span>
                        </button>

                        {/* Context-Aware Dynamic Merge/Split Button */}
                        <button
                            type="button"
                            disabled={!smartAction}
                            onClick={() => smartAction?.execute()}
                            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer text-xs font-bold ${
                                !smartAction
                                    ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                                    : smartAction.mode === 'merge'
                                    ? 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white shadow-sm active:scale-95'
                                    : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-700 text-white shadow-sm active:scale-95'
                            }`}
                            title={smartAction?.label || (lang === 'sv' ? "Välj 10 block för att slå ihop eller 1 för att dela upp" : "Select 10 blocks to merge or 1 to split")}
                        >
                            {smartAction?.mode === 'merge' ? (
                                <Combine size={14} className="text-white" />
                            ) : smartAction?.mode === 'split' ? (
                                <Split size={14} className="text-white" />
                            ) : (
                                <Combine size={14} className="text-slate-400" />
                            )}
                            <span className="truncate">
                                {smartAction?.label || (lang === 'sv' ? "Slå ihop / Dela" : "Merge / Split")}
                            </span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}