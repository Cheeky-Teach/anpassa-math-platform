// src/components/whiteboard/tools/analysis/CoordinatePlaneTool.jsx
import React from 'react';
import { Plus, Minus, GripHorizontal, Trash2, Type } from 'lucide-react';

const LINE_COLORS = ['#3b82f6', '#f59e0b', '#ec4899', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4'];

export const getGraphLinesPoints = (el) => {
    if (!el) return [];
    let rawEquations = [];
    if (Array.isArray(el.equations)) rawEquations = el.equations;
    else if (el.equation) rawEquations = [el.equation];

    if (rawEquations.length === 0) return [];

    const s = Number(el.gridSize) || 40;
    const w = Number(el.width) || 500;
    const h = Number(el.height) || 500;
    const stepX = parseFloat(el.stepX) || 1;
    const stepY = parseFloat(el.stepY) || 1;
    const localOX = el.isFirstQuadrant ? 0 : w / 2;
    const localOY = el.isFirstQuadrant ? h : h / 2;

    return rawEquations.map((rawEq, idx) => {
        if (!rawEq) return null;
        const cleanEq = rawEq.replace(/\s+/g, '').toLowerCase();
        const match = cleanEq.match(/y=([-+]?\d*\.?\d*)x?([-+]?\d*\.?\d*)?/);
        if (!match) return null;

        let m = match[1] === "" ? 1 : (match[1] === "-" ? -1 : parseFloat(match[1]));
        if (isNaN(m)) m = 0;
        const c = parseFloat(match[2] || 0);

        const logicXLeft = (-localOX / s) * stepX;
        const logicXRight = ((w - localOX) / s) * stepX;
        const logicYLeft = m * logicXLeft + c;
        const logicYRight = m * logicXRight + c;

        return {
            id: idx,
            color: LINE_COLORS[idx % LINE_COLORS.length],
            x1: 0,
            y1: localOY - (logicYLeft / stepY) * s,
            x2: w,
            y2: localOY - (logicYRight / stepY) * s
        };
    }).filter(Boolean);
};

export const CoordinatePlaneTool = {
    type: 'coord',
    hasOptions: true,

    createDefault: (id, color) => ({
        id,
        type: 'coord',
        x: 600,
        y: 200,
        width: 500,
        height: 500,
        stepX: "1",
        stepY: "1",
        gridSize: 40,
        isFirstQuadrant: false,
        showLabels: true,
        fontSize: 18,
        equations: ["y="],
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv', t }) => {
        const stepXLabel = t?.stepX || (lang === 'sv' ? "Steg X:" : "Step X:");
        const stepYLabel = t?.stepY || (lang === 'sv' ? "Steg Y:" : "Step Y:");
        const quad1Label = t?.quad1 || (lang === 'sv' ? "1:a Kvadr." : "1st Quad");
        const addLineLabel = lang === 'sv' ? "+ Linje" : "+ Line";
        const equations = Array.isArray(el.equations) ? el.equations : (el.equation ? [el.equation] : []);
        const currentFontSize = Number(el.fontSize) || 18;

        const updateFontSize = (delta) => {
            setElements(prev => prev.map(o => {
                if (o.id !== el.id) return o;
                const nextSize = Math.max(12, Math.min(34, (Number(o.fontSize) || 18) + delta));
                return { ...o, fontSize: nextSize };
            }));
        };

        const capturePointer = (e) => e.stopPropagation();

        return (
            <div 
                className="flex flex-col gap-2.5 font-sans font-bold text-sm select-none !text-slate-900" 
                style={{ color: '#0f172a' }}
            >
                {/* 1. Main Grid, Step, and Font Controls */}
                <div className="flex items-center gap-2.5">
                    {/* Stepper X */}
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200">
                        <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                            {stepXLabel}
                        </span>
                        <input 
                            type="text" 
                            className="w-10 py-0.5 bg-white border border-slate-300 rounded-lg text-center font-black text-indigo-600 outline-none text-xs shadow-inner" 
                            value={el.stepX || "1"} 
                            onPointerDown={capturePointer}
                            onChange={e => setElements(p => p.map(o => o.id === el.id ? { ...o, stepX: e.target.value } : o))} 
                        />
                    </div>

                    {/* Stepper Y */}
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200">
                        <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                            {stepYLabel}
                        </span>
                        <input 
                            type="text" 
                            className="w-10 py-0.5 bg-white border border-slate-300 rounded-lg text-center font-black text-indigo-600 outline-none text-xs shadow-inner" 
                            value={el.stepY || "1"} 
                            onPointerDown={capturePointer}
                            onChange={e => setElements(p => p.map(o => o.id === el.id ? { ...o, stepY: e.target.value } : o))} 
                        />
                    </div>

                    {/* 🟢 Font Size Stepper */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        <button
                            type="button"
                            onClick={() => updateFontSize(-2)}
                            disabled={currentFontSize <= 12}
                            className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95 text-xs font-black"
                            title={lang === 'sv' ? "Minska textstorlek" : "Decrease font size"}
                        >
                            A-
                        </button>
                        <span className="text-xs font-black px-1.5 min-w-[34px] text-center text-slate-800">
                            {currentFontSize}
                        </span>
                        <button
                            type="button"
                            onClick={() => updateFontSize(2)}
                            disabled={currentFontSize >= 34}
                            className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95 text-xs font-black"
                            title={lang === 'sv' ? "Öka textstorlek" : "Increase font size"}
                        >
                            A+
                        </button>
                    </div>

                    {/* Quadrant Mode Button */}
                    <button 
                        type="button"
                        onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, isFirstQuadrant: !o.isFirstQuadrant } : o))} 
                        className={`px-3 py-1.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                            el.isFirstQuadrant 
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {quad1Label}
                    </button>

                    {/* Add Line Action */}
                    <button 
                        type="button"
                        onClick={() => setElements(p => p.map(o => {
                            if (o.id !== el.id) return o;
                            const list = Array.isArray(o.equations) ? o.equations : (o.equation ? [o.equation] : []);
                            return { ...o, equations: [...list, "y=x"] };
                        }))} 
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl border border-indigo-200 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                        {addLineLabel}
                    </button>
                </div>

                {/* 2. Equation List Row */}
                {equations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        {equations.map((eqStr, eqIdx) => {
                            const lineColor = LINE_COLORS[eqIdx % LINE_COLORS.length];
                            return (
                                <div 
                                    key={eqIdx} 
                                    className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 shadow-xs"
                                >
                                    <span 
                                        className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                                        style={{ backgroundColor: lineColor }} 
                                    />
                                    <span className="text-xs text-slate-500 font-black lowercase">y =</span>
                                    <input 
                                        type="text" 
                                        placeholder="2x + 1" 
                                        className="w-20 border-b border-slate-300 outline-none text-center font-bold text-xs bg-transparent text-slate-800 focus:border-indigo-500" 
                                        value={eqStr.replace(/^y=/i, '')} 
                                        onPointerDown={capturePointer}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setElements(p => p.map(o => {
                                                if (o.id !== el.id) return o;
                                                const list = [...(Array.isArray(o.equations) ? o.equations : [o.equation || ''])];
                                                list[eqIdx] = val ? (val.startsWith('y=') ? val : `y=${val}`) : "";
                                                return { ...o, equations: list };
                                            }));
                                        }} 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setElements(p => p.map(o => {
                                            if (o.id !== el.id) return o;
                                            const list = (Array.isArray(o.equations) ? o.equations : [o.equation || '']).filter((_, i) => i !== eqIdx);
                                            return { ...o, equations: list };
                                        }))} 
                                        className="text-slate-400 hover:text-rose-500 p-1 ml-0.5 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                                        title={lang === 'sv' ? "Ta bort linje" : "Remove line"}
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { 
            transform = '', 
            showUI = false, 
            renderHandles = null,
            setSelectedId,
            setInteractionMode,
            setIsDrawing,
            setDragOffset,
            getCoordinates
        } = options;

        if (!el) return null;

        const s = Number(el.gridSize) || 40;
        const w = Number(el.width) || 500;
        const h = Number(el.height) || 500;
        const posX = Number(el.x) || 0;
        const posY = Number(el.y) || 0;
        const fontSize = Math.max(12, Math.min(34, Number(el.fontSize) || 18));
        const stepX = parseFloat(el.stepX) || 1;
        const stepY = parseFloat(el.stepY) || 1;
        const localOX = el.isFirstQuadrant ? 0 : w / 2;
        const localOY = el.isFirstQuadrant ? h : h / 2;
        const lns = [];
        const lbs = [];
        const graphLines = getGraphLinesPoints(el);

        // Dynamic padding offsets based on active font size to prevent axis collisions
        const yAxisOffset = Math.max(8, Math.round(fontSize * 0.45));
        const xAxisOffset = Math.max(18, Math.round(fontSize * 1.15));

        for (let i = -20; i <= 20; i++) {
            const lp = i * s;
            if (localOX + lp >= 0 && localOX + lp <= w) {
                lns.push(<line key={`v-${i}`} x1={localOX + lp} y1={0} x2={localOX + lp} y2={h} stroke="#e2e8f0" strokeWidth="1" />);
                if (el.showLabels && i !== 0) {
                    lbs.push(
                        <text 
                            key={`tx-${i}`} 
                            x={localOX + lp} 
                            y={localOY + xAxisOffset} 
                            textAnchor="middle" 
                            fontSize={fontSize} 
                            fontWeight="900" 
                            fill="#64748b"
                            fontFamily="system-ui, sans-serif"
                        >
                            {(i * stepX).toLocaleString()}
                        </text>
                    );
                }
            }
            if (localOY - lp >= 0 && localOY - lp <= h) {
                lns.push(<line key={`h-${i}`} x1={0} y1={localOY - lp} x2={w} y2={localOY - lp} stroke="#e2e8f0" strokeWidth="1" />);
                if (el.showLabels && i !== 0) {
                    lbs.push(
                        <text 
                            key={`ty-${i}`} 
                            x={localOX - yAxisOffset} 
                            y={localOY - lp + Math.round(fontSize * 0.32)} 
                            textAnchor="end" 
                            fontSize={fontSize} 
                            fontWeight="900" 
                            fill="#64748b"
                            fontFamily="system-ui, sans-serif"
                        >
                            {(i * stepY).toLocaleString()}
                        </text>
                    );
                }
            }
        }

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${posX}, ${posY}) ${transform.replace(/translate\([^)]+\)/, '')}`} 
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
                        if (getCoordinates && setDragOffset) {
                            setDragOffset(getCoordinates(e, false));
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

                {/* 2. Plane Surface Background */}
                <rect 
                    x={0} 
                    y={0} 
                    width={w} 
                    height={h} 
                    rx={12}
                    fill="#ffffff" 
                    stroke="#0f172a" 
                    strokeWidth={2} 
                    filter="drop-shadow(0 6px 16px rgba(15, 23, 42, 0.08))"
                    className="pointer-events-none"
                />

                {/* 3. Grid Lines & Plot Lines */}
                <svg width={w} height={h} style={{ overflow: 'hidden' }}>
                    {lns}
                    {graphLines.map(gl => (
                        <line 
                            key={gl.id} 
                            x1={gl.x1} 
                            y1={gl.y1} 
                            x2={gl.x2} 
                            y2={gl.y2} 
                            stroke={gl.color} 
                            strokeWidth="3.5" 
                            strokeLinecap="round"
                        />
                    ))}
                </svg>

                {/* 4. Main Axes */}
                <line x1={0} y1={localOY} x2={w} y2={localOY} stroke="#0f172a" strokeWidth={2.5} />
                <line x1={localOX} y1={0} x2={localOX} y2={h} stroke="#0f172a" strokeWidth={2.5} />

                {/* 5. Axis Labels & Origin */}
                {lbs}
                <text 
                    x={localOX - yAxisOffset} 
                    y={localOY + xAxisOffset} 
                    fontSize={fontSize} 
                    fontWeight="900" 
                    fill="#0f172a"
                    fontFamily="system-ui, sans-serif"
                    textAnchor="end"
                >
                    0
                </text>

                {/* 6. Standard Whiteboard Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-posX}, ${-posY})`}>
                        {renderHandles(el)}
                    </g>
                )}
            </g>
        );
    }
};

export default CoordinatePlaneTool;