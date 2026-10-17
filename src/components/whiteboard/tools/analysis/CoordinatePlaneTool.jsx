// src/components/whiteboard/tools/analysis/CoordinatePlaneTool.jsx
import React from 'react';

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
        fontSize: 20,
        equations: ["y="],
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, lang, t }) => (
        <div className="flex flex-col gap-2 p-1">
            <div className="flex items-center gap-3">
                <span>{t.stepX}</span>
                <input type="text" className="w-10 border-b text-center outline-none" value={el.stepX || "1"} onChange={e => setElements(p => p.map(o => o.id === el.id ? { ...o, stepX: e.target.value } : o))} />
                <span>{t.stepY}</span>
                <input type="text" className="w-10 border-b text-center outline-none" value={el.stepY || "1"} onChange={e => setElements(p => p.map(o => o.id === el.id ? { ...o, stepY: e.target.value } : o))} />
                <button onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, isFirstQuadrant: !o.isFirstQuadrant } : o))} className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${el.isFirstQuadrant ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>{t.quad1}</button>
                <button 
                    onClick={() => setElements(p => p.map(o => {
                        if (o.id !== el.id) return o;
                        const list = Array.isArray(o.equations) ? o.equations : (o.equation ? [o.equation] : []);
                        return { ...o, equations: [...list, "y=x"] };
                    }))} 
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-md text-[10px] font-black uppercase transition-all cursor-pointer"
                >
                    + {lang === 'sv' ? 'Linje' : 'Line'}
                </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                {(Array.isArray(el.equations) ? el.equations : (el.equation ? [el.equation] : [])).map((eqStr, eqIdx) => {
                    const lineColor = LINE_COLORS[eqIdx % LINE_COLORS.length];
                    return (
                        <div key={eqIdx} className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lineColor }} />
                            <span className="text-[10px] text-slate-500 font-black lowercase">y =</span>
                            <input 
                                type="text" 
                                placeholder="2x + 1" 
                                className="w-16 border-b border-slate-300 outline-none text-center font-bold text-xs bg-transparent" 
                                value={eqStr.replace(/^y=/i, '')} 
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
                                onClick={() => setElements(p => p.map(o => {
                                    if (o.id !== el.id) return o;
                                    const list = (Array.isArray(o.equations) ? o.equations : [o.equation || '']).filter((_, i) => i !== eqIdx);
                                    return { ...o, equations: list };
                                }))}
                                className="text-slate-400 hover:text-rose-500 p-0.5 ml-0.5 cursor-pointer"
                                title={lang === 'sv' ? "Ta bort linje" : "Remove line"}
                            >
                                ×
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    ),

    render: (elOrOptions, maybeOptions) => {
        // Defensive argument resolution
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { transform = '', showUI = false, renderHandles = null } = options;

        if (!el) return null;

        const s = Number(el.gridSize) || 40;
        const w = Number(el.width) || 500;
        const h = Number(el.height) || 500;
        const posX = Number(el.x) || 0;
        const posY = Number(el.y) || 0;
        const fontSize = Number(el.fontSize) || 18;
        const stepX = parseFloat(el.stepX) || 1;
        const stepY = parseFloat(el.stepY) || 1;
        const localOX = el.isFirstQuadrant ? 0 : w / 2;
        const localOY = el.isFirstQuadrant ? h : h / 2;
        const lns = [];
        const lbs = [];
        const graphLines = getGraphLinesPoints(el);

        for (let i = -20; i <= 20; i++) {
            const lp = i * s;
            if (localOX + lp >= 0 && localOX + lp <= w) {
                lns.push(<line key={`v-${i}`} x1={localOX + lp} y1={0} x2={localOX + lp} y2={h} stroke="#cbd5e1" strokeWidth="1" />);
                if (el.showLabels && i !== 0) lbs.push(<text key={`tx-${i}`} x={localOX + lp} y={localOY + 25} textAnchor="middle" fontSize={fontSize} fontWeight="900" fill="black">{(i * stepX).toLocaleString()}</text>);
            }
            if (localOY - lp >= 0 && localOY - lp <= h) {
                lns.push(<line key={`h-${i}`} x1={0} y1={localOY - lp} x2={w} y2={localOY - lp} stroke="#cbd5e1" strokeWidth="1" />);
                if (el.showLabels && i !== 0) lbs.push(<text key={`ty-${i}`} x={localOX - 10} y={localOY - lp + 5} textAnchor="end" fontSize={fontSize} fontWeight="900" fill="black">{(i * stepY).toLocaleString()}</text>);
            }
        }

        return (
            <g key={el.id} data-id={el.id} transform={`translate(${posX}, ${posY}) ${transform.replace(/translate\([^)]+\)/, '')}`} className="pointer-events-auto cursor-move">
                <rect x={0} y={0} width={w} height={h} fill="white" fillOpacity="0.9" stroke="black" strokeWidth="1" />
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
                            strokeWidth="4" 
                            strokeLinecap="round"
                        />
                    ))}
                </svg>
                <line x1={0} y1={localOY} x2={w} y2={localOY} stroke="black" strokeWidth="3" />
                <line x1={localOX} y1={0} x2={localOX} y2={h} stroke="black" strokeWidth="3" />
                {lbs}<text x={localOX - 10} y={localOY + 25} fontSize={fontSize} fontWeight="900" fill="black">0</text>
                {showUI && renderHandles && (
                    <g transform={`translate(${-posX}, ${-posY})`}>{renderHandles(el)}</g>
                )}
            </g>
        );
    }
};

export default CoordinatePlaneTool;