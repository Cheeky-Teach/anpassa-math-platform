// src/components/whiteboard/tools/analysis/DiceTool.jsx
import React from 'react';
import { Dices, RefreshCw, Plus, Minus } from 'lucide-react';

export const rollDiceAnimation = (id, sides, setElements) => {
    let iterations = 0;
    const maxSides = parseInt(sides, 10) || 6;
    
    const interval = setInterval(() => {
        setElements(prev => prev.map(el => {
            if (el.id !== id) return el;
            const currentDice = Array.isArray(el.diceData) && el.diceData.length > 0 
                ? el.diceData 
                : [{ value: 1, color: '#ffffff' }];

            const newDice = currentDice.map(d => ({
                ...d,
                value: Math.floor(Math.random() * maxSides) + 1
            }));
            return { ...el, diceData: newDice, isRolling: true };
        }));

        iterations++;
        if (iterations > 10) {
            clearInterval(interval);
            setElements(prev => prev.map(el => el.id === id ? { ...el, isRolling: false } : el));
        }
    }, 55);
};

export const DiceTool = {
    type: 'dice',
    hasOptions: true,

    createDefault: (id, color = '#ef4444') => ({
        id,
        type: 'dice',
        x: 600,
        y: 300,
        width: 180,
        height: 180,
        sides: "6",
        diceData: [
            { value: Math.floor(Math.random() * 6) + 1, color: '#ffffff' },
            { value: Math.floor(Math.random() * 6) + 1, color: '#ffffff' }
        ],
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, t }) => {
        const diceList = Array.isArray(el.diceData) && el.diceData.length > 0 ? el.diceData : [{ value: 1, color: '#ffffff' }];
        const currentSides = el.sides || "6";

        const addDie = () => {
            if (diceList.length >= 6) return;
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                diceData: [...diceList, { value: Math.floor(Math.random() * (parseInt(currentSides, 10) || 6)) + 1, color: '#ffffff' }]
            } : o));
        };

        const removeDie = () => {
            if (diceList.length <= 1) return;
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                diceData: diceList.slice(0, -1)
            } : o));
        };

        const changeSides = (s) => {
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                sides: String(s),
                diceData: (o.diceData || []).map(d => ({
                    ...d,
                    value: Math.min(d.value, s)
                }))
            } : o));
        };

        return (
            <div 
                className="flex items-center gap-2.5 font-sans font-bold text-xs select-none !text-slate-900"
                style={{ color: '#0f172a' }}
            >
                {/* Dice Quantity Adjuster */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button 
                        type="button"
                        onClick={removeDie} 
                        disabled={diceList.length <= 1}
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-lg transition-colors cursor-pointer border border-slate-200"
                        title="Ta bort tärning"
                    >
                        <Minus size={13} strokeWidth={3} />
                    </button>

                    <span className="text-xs font-black px-1.5 min-w-[50px] text-center text-slate-800">
                        {diceList.length} {t?.dice || "Tärningar"}
                    </span>

                    <button 
                        type="button"
                        onClick={addDie} 
                        disabled={diceList.length >= 6}
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-lg transition-colors cursor-pointer border border-slate-200"
                        title="Lägg till tärning"
                    >
                        <Plus size={13} strokeWidth={3} />
                    </button>
                </div>

                {/* Sidedness Dropdown (D4, D6, D8, D10, D12, D20) */}
                <select 
                    className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-black text-slate-800 outline-none cursor-pointer hover:bg-slate-200 transition-colors"
                    value={currentSides} 
                    onChange={e => changeSides(e.target.value)}
                >
                    {[4, 6, 8, 10, 12, 20].map(s => (
                        <option key={s} value={String(s)}>
                            D{s} ({s} {t?.sides || "sidor"})
                        </option>
                    ))}
                </select>

                <div className="w-px h-5 bg-slate-200 mx-0.5" />

                {/* Roll All Header Button */}
                <button 
                    type="button"
                    onClick={() => rollDiceAnimation(el.id, el.sides, setElements)} 
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl px-3.5 py-1.5 font-black text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                >
                    <RefreshCw size={13} className={el.isRolling ? "animate-spin" : ""} />
                    <span>{t?.rollAll || "SLÅ ALLA"}</span>
                </button>
            </div>
        );
    },

    // 🟢 Dual-argument resolution: Tool.render(el, options) and Tool.render(options)
    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { lang = 'sv', showUI = false, renderHandles = null, setElements = null } = options;

        if (!el) return null;

        // Guaranteed fallback so dice are never invisible on spawn
        const dice = Array.isArray(el.diceData) && el.diceData.length > 0 
            ? el.diceData 
            : [{ value: 1, color: '#ffffff' }];

        const w = Number(el.width) || 180;
        const cols = Math.min(dice.length, Math.ceil(Math.sqrt(dice.length)));
        const cellSize = w / cols;
        const rows = Math.ceil(dice.length / cols);
        const actualGridHeight = rows * cellSize;

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y})`}
                className="pointer-events-auto cursor-move select-none"
                onDoubleClick={() => setElements && rollDiceAnimation(el.id, el.sides, setElements)}
            >
                {/* Transparent bounding background */}
                <rect x={0} y={0} width={w} height={actualGridHeight + 60} fill="transparent" />

                {/* Dice Grid Rendering */}
                {dice.map((d, i) => {
                    const colIdx = i % cols;
                    const rowIdx = Math.floor(i / cols);
                    const dx = colIdx * cellSize;
                    const dy = rowIdx * cellSize;
                    const dSize = cellSize * 0.86;
                    const inset = (cellSize - dSize) / 2;

                    return (
                        <g key={i} transform={`translate(${dx + inset}, ${dy + inset})`}>
                            {/* Die Body */}
                            <rect 
                                x={0} 
                                y={0} 
                                width={dSize} 
                                height={dSize} 
                                fill="#ffffff" 
                                stroke="#1e293b" 
                                strokeWidth={Math.max(2.5, dSize * 0.04)} 
                                rx={dSize * 0.22} 
                                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.12))"
                                className={el.isRolling ? "animate-pulse" : ""} 
                            />
                            
                            {/* Die Value */}
                            <text 
                                x={dSize / 2} 
                                y={dSize / 2 + 1} 
                                textAnchor="middle" 
                                dominantBaseline="central"
                                fontSize={dSize * 0.48} 
                                fontWeight="900" 
                                fill="#0f172a" 
                                fontFamily="system-ui, -apple-system, sans-serif"
                                className="select-none pointer-events-none"
                            >
                                {d.value ?? 1}
                            </text>
                        </g>
                    );
                })}

                {/* Floating "Slå" Action Button anchored directly beneath grid */}
                <foreignObject 
                    x={0} 
                    y={actualGridHeight + 10} 
                    width={w} 
                    height={50} 
                    className="ui-ignore pointer-events-auto overflow-visible"
                >
                    <div className="flex justify-center w-full h-full" onPointerDown={e => e.stopPropagation()}>
                        <button 
                            type="button"
                            onClick={() => setElements && rollDiceAnimation(el.id, el.sides, setElements)} 
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <Dices size={15} /> 
                            <span>{lang === 'sv' ? "Slå" : "Roll"}</span>
                        </button>
                    </div>
                </foreignObject>

                {/* Standard Whiteboard Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, w / 2)}
                    </g>
                )}
            </g>
        );
    }
};

export default DiceTool;