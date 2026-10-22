// src/components/whiteboard/tools/analysis/DiceTool.jsx
import React from 'react';
import { Dices, RefreshCw, Plus, Minus, Lock, Unlock, Hash, CircleDot, Sigma, Palette, GripHorizontal } from 'lucide-react';

const DICE_COLORS = [
    { fill: '#ffffff', stroke: '#0f172a', text: '#0f172a', shadow: '#94a3b8' }, // White
    { fill: '#ef4444', stroke: '#991b1b', text: '#ffffff', shadow: '#7f1d1d' }, // Red
    { fill: '#3b82f6', stroke: '#1e40af', text: '#ffffff', shadow: '#1e3a8a' }, // Blue
    { fill: '#10b981', stroke: '#065f46', text: '#ffffff', shadow: '#064e3b' }, // Green
    { fill: '#f59e0b', stroke: '#92400e', text: '#ffffff', shadow: '#78350f' }, // Amber
    { fill: '#8b5cf6', stroke: '#5b21b6', text: '#ffffff', shadow: '#4c1d95' }  // Purple
];

export const rollDiceAnimation = (id, sides, setElements) => {
    let iterations = 0;
    const maxSides = parseInt(sides, 10) || 6;
    
    const interval = setInterval(() => {
        setElements(prev => prev.map(el => {
            if (el.id !== id) return el;
            const currentDice = Array.isArray(el.diceData) && el.diceData.length > 0 
                ? el.diceData 
                : [{ value: 1, locked: false, colorIndex: 0 }];

            const newDice = currentDice.map(d => {
                if (d.locked) return d;
                return {
                    ...d,
                    value: Math.floor(Math.random() * maxSides) + 1,
                    jitter: (Math.random() * 8 - 4).toFixed(1)
                };
            });
            return { ...el, diceData: newDice, isRolling: true };
        }));

        iterations++;
        if (iterations > 10) {
            clearInterval(interval);
            setElements(prev => prev.map(el => el.id === id ? { ...el, isRolling: false } : el));
        }
    }, 50);
};

export const DiceTool = {
    type: 'dice',
    hasOptions: true,

    createDefault: (id, color = '#10b981') => ({
        id,
        type: 'dice',
        x: 600,
        y: 300,
        width: 250,
        height: 250,
        sides: "6",
        displayMode: 'pips', // 'pips' | 'numbers'
        showSum: true,
        clickAction: 'lock', // 'lock' | 'color'
        diceData: [
            { value: 3, locked: false, colorIndex: 0, jitter: -2 },
            { value: 5, locked: false, colorIndex: 1, jitter: 3 }
        ],
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv', t }) => {
        const diceList = Array.isArray(el.diceData) && el.diceData.length > 0 ? el.diceData : [{ value: 1, locked: false, colorIndex: 0 }];
        const currentSides = el.sides || "6";

        const addDie = () => {
            if (diceList.length >= 6) return;
            const nextColorIdx = diceList.length % DICE_COLORS.length;
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                diceData: [...diceList, { 
                    value: Math.floor(Math.random() * (parseInt(currentSides, 10) || 6)) + 1, 
                    locked: false,
                    colorIndex: nextColorIdx,
                    jitter: (Math.random() * 6 - 3).toFixed(1)
                }]
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
                displayMode: s !== 6 ? 'numbers' : o.displayMode,
                diceData: (o.diceData || []).map(d => ({
                    ...d,
                    value: Math.min(d.value, s)
                }))
            } : o));
        };

        const toggleDisplayMode = () => {
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                displayMode: o.displayMode === 'pips' ? 'numbers' : 'pips'
            } : o));
        };

        const toggleSum = () => {
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                showSum: !o.showSum
            } : o));
        };

        const toggleClickAction = () => {
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                clickAction: o.clickAction === 'color' ? 'lock' : 'color'
            } : o));
        };

        const diceLabel = t?.dice || (lang === 'sv' ? "Tärningar" : "Dice");
        const sidesLabel = t?.sides || (lang === 'sv' ? "sidor" : "sides");
        const rollAllLabel = t?.rollAll || (lang === 'sv' ? "SLÅ ALLA" : "ROLL ALL");

        return (
            <div 
                className="flex items-center gap-3 font-sans font-bold text-sm select-none !text-slate-900"
                style={{ color: '#0f172a' }}
            >
                {/* 1. Dice Count Stepper */}
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button 
                        type="button"
                        onClick={removeDie} 
                        disabled={diceList.length <= 1}
                        className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                        title={lang === 'sv' ? "Ta bort tärning" : "Remove die"}
                    >
                        <Minus size={16} strokeWidth={3} />
                    </button>

                    <span className="text-sm font-black px-2 min-w-[70px] text-center text-slate-800">
                        {diceList.length} {diceLabel}
                    </span>

                    <button 
                        type="button"
                        onClick={addDie} 
                        disabled={diceList.length >= 6}
                        className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                        title={lang === 'sv' ? "Lägg till tärning" : "Add die"}
                    >
                        <Plus size={16} strokeWidth={3} />
                    </button>
                </div>

                {/* 2. Sidedness Dropdown */}
                <select 
                    className="bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2 text-sm font-black text-slate-800 outline-none cursor-pointer hover:bg-slate-200 transition-colors shadow-xs"
                    value={currentSides} 
                    onChange={e => changeSides(Number(e.target.value))}
                >
                    {[4, 6, 8, 10, 12, 20].map(s => (
                        <option key={s} value={s}>
                            D{s} ({s} {sidesLabel})
                        </option>
                    ))}
                </select>

                {/* 3. Click Action Mode: Lock vs Color */}
                <button
                    type="button"
                    onClick={toggleClickAction}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        el.clickAction === 'color'
                            ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={lang === 'sv' ? "Klickläge: Lås eller Ändra färg" : "Click action: Lock or Change color"}
                >
                    {el.clickAction === 'color' ? <Palette size={16} /> : <Lock size={16} />}
                    <span>{el.clickAction === 'color' ? (lang === 'sv' ? "Färgläge" : "Color Mode") : (lang === 'sv' ? "Låsläge" : "Lock Mode")}</span>
                </button>

                {/* 4. Pips vs Number Toggle */}
                {Number(currentSides) === 6 && (
                    <button 
                        type="button"
                        onClick={toggleDisplayMode}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                            el.displayMode === 'pips'
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {el.displayMode === 'pips' ? <CircleDot size={16} /> : <Hash size={16} />}
                        <span>{el.displayMode === 'pips' ? (lang === 'sv' ? "Prickar" : "Pips") : (lang === 'sv' ? "Siffror" : "Numbers")}</span>
                    </button>
                )}

                {/* 5. Total Sum Badge Toggle */}
                <button 
                    type="button"
                    onClick={toggleSum}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        el.showSum !== false
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <Sigma size={16} strokeWidth={2.5} />
                    <span>{lang === 'sv' ? "Summa" : "Sum"}</span>
                </button>

                <div className="w-px h-6 bg-slate-200 mx-1" />

                {/* 6. Roll Button */}
                <button 
                    type="button"
                    onClick={() => rollDiceAnimation(el.id, el.sides, setElements)} 
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl px-4 py-2 font-black text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                    <RefreshCw size={15} className={el.isRolling ? "animate-spin" : ""} />
                    <span>{rollAllLabel}</span>
                </button>
            </div>
        );
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { 
            lang = 'sv', 
            showUI = false, 
            renderHandles = null, 
            setElements = null, 
            setSelectedId = null, 
            setInteractionMode = null, 
            setIsDrawing = null, 
            setDragOffset = null, 
            getCoordinates = null,
            isDrawing = false
        } = options;

        if (!el) return null;

        const dice = Array.isArray(el.diceData) && el.diceData.length > 0 
            ? el.diceData 
            : [{ value: 1, locked: false, colorIndex: 0 }];

        const w = Number(el.width) || 250;
        const cols = Math.min(dice.length, Math.ceil(Math.sqrt(dice.length)));
        const cellSize = w / cols;
        const rows = Math.ceil(dice.length / cols);
        const actualGridHeight = rows * cellSize;

        const totalSum = dice.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
        const isD6 = (Number(el.sides) || 6) === 6;
        const usePips = isD6 && el.displayMode !== 'numbers';

        const handleDieClick = (e, index) => {
            e.stopPropagation();
            if (isDrawing || el.isRolling || !setElements) return;

            setElements(prev => prev.map(item => {
                if (item.id !== el.id) return item;
                const nextData = [...item.diceData];
                
                if (item.clickAction === 'color') {
                    const nextColor = ((nextData[index].colorIndex || 0) + 1) % DICE_COLORS.length;
                    nextData[index] = { ...nextData[index], colorIndex: nextColor };
                } else {
                    nextData[index] = { ...nextData[index], locked: !nextData[index].locked };
                }
                return { ...item, diceData: nextData };
            }));
        };

        const getPipPositions = (val) => {
            const m = 50, l = 28, r = 72, t = 28, b = 72;
            switch(val) {
                case 1: return [[m, m]];
                case 2: return [[l, t], [r, b]];
                case 3: return [[l, t], [m, m], [r, b]];
                case 4: return [[l, t], [r, t], [l, b], [r, b]];
                case 5: return [[l, t], [r, t], [m, m], [l, b], [r, b]];
                case 6: return [[l, t], [r, t], [l, m], [r, m], [l, b], [r, b]];
                default: return [];
            }
        };

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y})`}
                className="select-none"
            >
                {/* 1. Tactile Tray Drag Handle Bar */}
                <g 
                    className="cursor-move group"
                    style={{ pointerEvents: 'auto' }}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        if (setSelectedId) setSelectedId(el.id);
                        if (setInteractionMode) setInteractionMode('moving');
                        if (setIsDrawing) setIsDrawing(true);
                        
                        // 🟢 FIXED: Use transformed SVG coordinates to prevent mouse teleporting
                        if (getCoordinates && setDragOffset) {
                            const coords = getCoordinates(e, false);
                            setDragOffset(coords);
                        }
                    }}
                >
                    <rect 
                        x={0} 
                        y={-28} 
                        width={w} 
                        height={24} 
                        rx={10} 
                        fill="#f8fafc" 
                        stroke="#cbd5e1" 
                        strokeWidth={1.5}
                        className="group-hover:stroke-indigo-400 group-hover:fill-indigo-50/50 transition-colors shadow-xs" 
                    />
                    <GripHorizontal size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" x={w / 2 - 7} y={-23} />
                </g>

                {/* 2. Dice Cluster Grid */}
                {dice.map((d, i) => {
                    const colIdx = i % cols;
                    const rowIdx = Math.floor(i / cols);
                    const dx = colIdx * cellSize;
                    const dy = rowIdx * cellSize;
                    const dSize = cellSize * 0.86;
                    const inset = (cellSize - dSize) / 2;
                    const jitter = d.jitter || 0;
                    const pips = usePips ? getPipPositions(d.value) : [];
                    
                    const scheme = DICE_COLORS[d.colorIndex || 0] || DICE_COLORS[0];

                    return (
                        <g 
                            key={i} 
                            transform={`translate(${dx + inset}, ${dy + inset}) rotate(${jitter}, ${dSize / 2}, ${dSize / 2})`}
                            className="dice-die interactive-slice"
                        >
                            {/* 3D Drop Shadow / Extrusion */}
                            <rect 
                                x={0} 
                                y={dSize * 0.08} 
                                width={dSize} 
                                height={dSize} 
                                fill={scheme.shadow} 
                                rx={dSize * 0.26}
                                className="pointer-events-none"
                            />

                            {/* Die Body: The sole hit target */}
                            <rect 
                                x={0} 
                                y={0} 
                                width={dSize} 
                                height={dSize} 
                                fill={scheme.fill} 
                                stroke={d.locked ? '#f59e0b' : scheme.stroke} 
                                strokeWidth={d.locked ? Math.max(4, dSize * 0.07) : Math.max(2.5, dSize * 0.04)} 
                                rx={dSize * 0.26} 
                                filter="drop-shadow(0 4px 6px rgba(15, 23, 42, 0.12))"
                                className={`cursor-pointer dice-die interactive-slice ${el.isRolling && !d.locked ? "animate-pulse" : ""}`}
                                style={{ pointerEvents: 'auto' }}
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                }}
                                onClick={(e) => handleDieClick(e, i)}
                            />

                            {/* Top Highlight Specular */}
                            <rect 
                                x={dSize * 0.08} 
                                y={dSize * 0.06} 
                                width={dSize * 0.84} 
                                height={dSize * 0.18} 
                                fill="rgba(255, 255, 255, 0.45)" 
                                rx={dSize * 0.1} 
                                className="pointer-events-none"
                            />

                            {/* Pips or Numerals */}
                            {usePips && pips.length > 0 ? (
                                <g className="pointer-events-none">
                                    {pips.map(([px, py], pIdx) => (
                                        <circle 
                                            key={pIdx} 
                                            cx={(px / 100) * dSize} 
                                            cy={(py / 100) * dSize} 
                                            r={dSize * 0.09} 
                                            fill={scheme.text} 
                                        />
                                    ))}
                                </g>
                            ) : (
                                <text 
                                    x={dSize / 2} 
                                    y={dSize / 2 + 1} 
                                    textAnchor="middle" 
                                    dominantBaseline="central"
                                    fontSize={dSize * 0.46} 
                                    fontWeight="900" 
                                    fill={d.locked ? '#f59e0b' : scheme.text} 
                                    fontFamily="system-ui, -apple-system, sans-serif"
                                    className="select-none pointer-events-none"
                                >
                                    {d.value ?? 1}
                                </text>
                            )}

                            {/* Lock Badge */}
                            {d.locked && (
                                <g transform={`translate(${dSize - 22}, 2)`} className="pointer-events-none">
                                    <circle cx={10} cy={10} r={10} fill="#f59e0b" />
                                    <Lock size={11} color="white" strokeWidth={3} x={4.5} y={4.5} />
                                </g>
                            )}
                        </g>
                    );
                })}

                {/* 3. Floating Action Strip (Sum + Roll) */}
                <foreignObject 
                    x={0} 
                    y={actualGridHeight + 10} 
                    width={w} 
                    height={56} 
                    className="ui-ignore pointer-events-auto overflow-visible"
                >
                    <div className="flex items-center justify-center gap-2 w-full h-full" onPointerDown={e => e.stopPropagation()}>
                        {el.showSum !== false && (
                            <div 
                                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border-2 border-amber-500 text-amber-600 rounded-2xl font-black text-xs uppercase tracking-wider backdrop-blur-sm shadow-xs select-none"
                                title={lang === 'sv' ? "Totalsumma" : "Total sum"}
                            >
                                <span className="opacity-75 text-[10px]">Σ</span>
                                <span className="text-sm font-black">{totalSum}</span>
                            </div>
                        )}

                        <button 
                            type="button"
                            onClick={() => setElements && rollDiceAnimation(el.id, el.sides, setElements)} 
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-emerald-900/20 transition-all cursor-pointer flex items-center justify-center gap-2 border-b-2 border-emerald-800"
                        >
                            <Dices size={16} className={el.isRolling ? "animate-spin" : ""} /> 
                            <span>{lang === 'sv' ? "Slå" : "Roll"}</span>
                        </button>
                    </div>
                </foreignObject>

                {/* 4. Whiteboard Selection Handles */}
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