// src/components/whiteboard/tools/analysis/TChartTool.jsx
import React from 'react';
import { BarChart3, LineChart, Plus, Minus } from 'lucide-react';

export const TChartTool = {
    type: 't_chart',
    hasOptions: true,

    createDefault: (id, color = '#2563eb') => ({
        id,
        type: 't_chart',
        x: 600,
        y: 250,
        width: 260,
        height: 380,
        stroke: color,
        headerX: 'x',
        headerY: 'y',
        graphType: 'none', // 'none' | 'line' | 'bar'
        axisStep: 2, // 🟢 User-settable axis increment
        rows: [
            { x: '1', y: '4' },
            { x: '2', y: '8' },
            { x: '3', y: '12' },
            { x: '4', y: '16' },
            { x: '5', y: '20' }
        ]
    }),

    renderContextMenu: ({ el, setElements, lang, t }) => {
        const rows = Array.isArray(el?.rows) ? el.rows : [];

        const toggleGraph = (type) => {
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                graphType: o.graphType === type ? 'none' : type,
                width: o.graphType === type ? 260 : 620 // Expand for graph canvas
            } : o));
        };

        const updateStep = (val) => {
            const step = Math.max(1, parseInt(val, 10) || 1);
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, axisStep: step } : o));
        };

        return (
            <div 
                className="flex items-center gap-2.5 font-sans font-bold text-xs select-none !text-slate-900"
                style={{ color: '#0f172a' }}
            >
                {/* Row Add / Remove Buttons */}
                <button
                    type="button"
                    onClick={() => setElements(p => p.map(o => o.id === el.id ? { 
                        ...o, 
                        rows: [...rows, { x: '', y: '' }] 
                    } : o))}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                >
                    <Plus size={14} strokeWidth={3} /> Rad
                </button>
                <button
                    type="button"
                    onClick={() => setElements(p => p.map(o => o.id === el.id ? { 
                        ...o, 
                        rows: rows.slice(0, -1) 
                    } : o))}
                    disabled={rows.length <= 1}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-30 cursor-pointer"
                >
                    <Minus size={14} strokeWidth={3} /> Rad
                </button>

                <div className="w-px h-5 bg-slate-200 mx-0.5" />

                {/* Axis Increment Stepper */}
                <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-500">Steg:</span>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={el.axisStep || 2}
                        onChange={(e) => updateStep(e.target.value)}
                        className="w-10 bg-white border border-slate-300 rounded text-center font-black text-indigo-600 outline-none text-xs"
                    />
                </div>

                <div className="w-px h-5 bg-slate-200 mx-0.5" />

                {/* Graph Type Selectors */}
                <button
                    type="button"
                    onClick={() => toggleGraph('line')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        el.graphType === 'line' 
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={lang === 'sv' ? "Generera linjediagram" : "Plot Line Graph"}
                >
                    <LineChart size={14} /> Linje
                </button>
                <button
                    type="button"
                    onClick={() => toggleGraph('bar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        el.graphType === 'bar' 
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={lang === 'sv' ? "Generera stapeldiagram" : "Plot Bar Graph"}
                >
                    <BarChart3 size={14} /> Stapel
                </button>
            </div>
        );
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { showUI, renderHandles, setElements } = options;

        if (!el) return null;

        const w = Number(el.width) || 260;
        const h = Number(el.height) || 380;
        const strokeColor = el.stroke || '#2563eb';
        const rows = Array.isArray(el.rows) && el.rows.length > 0 
            ? el.rows 
            : [{ x: '1', y: '2' }, { x: '2', y: '4' }];

        const hasGraph = el.graphType && el.graphType !== 'none';
        const tableWidth = hasGraph ? 250 : w;
        const rowHeight = Math.max(42, (h - 56) / (rows.length || 1));

        // 1. Live Header Updater
        const handleHeaderChange = (key, val) => {
            if (!setElements) return;
            setElements(prev => prev.map(item => item.id === el.id ? { ...item, [key]: val } : item));
        };

        // 2. Cell Data Updater
        const handleCellChange = (rowIndex, colKey, val) => {
            if (!setElements) return;
            setElements(prev => prev.map(item => {
                if (item.id !== el.id) return item;
                const nextRows = [...item.rows];
                nextRows[rowIndex] = { ...nextRows[rowIndex], [colKey]: val };
                return { ...item, rows: nextRows };
            }));
        };

        // 3. Intelligent Orientation & Whole Number Range Parser
        const xNumbers = rows.map(r => parseFloat(String(r.x).replace(',', '.'))).filter(n => !isNaN(n));
        const yNumbers = rows.map(r => parseFloat(String(r.y).replace(',', '.'))).filter(n => !isNaN(n));

        const isXNumeric = xNumbers.length > rows.length / 2;
        const isYNumeric = yNumbers.length > rows.length / 2;
        const isInverted = !isYNumeric && isXNumeric;

        const activeNumericVals = isInverted ? xNumbers : yNumbers;
        const rawMaxY = activeNumericVals.length > 0 ? Math.max(...activeNumericVals) : 10;
        const rawMinY = activeNumericVals.length > 0 ? Math.min(0, Math.min(...activeNumericVals)) : 0;
        
        // Whole Number Axis Scaling based on user step
        const step = Number(el.axisStep) || 2;
        const maxY = Math.ceil(rawMaxY / step) * step || step;
        const minY = Math.floor(rawMinY / step) * step;
        const numRange = (maxY - minY) || step;

        return (
            <g key={el.id} data-id={el.id} transform={`translate(${el.x}, ${el.y})`} className="pointer-events-auto cursor-move select-none">
                {/* Outer Card Background */}
                <rect x={0} y={0} width={w} height={h} rx={16} fill="#ffffff" stroke="#cbd5e1" strokeWidth={2} filter="drop-shadow(0 6px 14px rgba(0,0,0,0.06))" />

                {/* ========================================================= */}
                {/* 1. TABLE SECTION                                          */}
                {/* ========================================================= */}
                <g transform="translate(0, 0)">
                    {/* Header Top Background */}
                    <rect x={0} y={0} width={tableWidth} height={52} rx={16} fill="#f1f5f9" />
                    <rect x={0} y={36} width={tableWidth} height={16} fill="#f1f5f9" />
                    <line x1={0} y1={52} x2={tableWidth} y2={52} stroke="#cbd5e1" strokeWidth={2} />
                    <line x1={tableWidth / 2} y1={0} x2={tableWidth / 2} y2={h} stroke="#cbd5e1" strokeWidth={2} />

                    {/* 🟢 LARGER EDITABLE HEADER TITLES */}
                    <foreignObject x={0} y={0} width={tableWidth} height={52}>
                        <div className="w-full h-full flex items-center font-sans">
                            <input
                                type="text"
                                value={el.headerX ?? 'x'}
                                onChange={(e) => handleHeaderChange('headerX', e.target.value)}
                                onPointerDown={(e) => e.stopPropagation()}
                                placeholder="X"
                                className="w-1/2 h-full text-center font-black text-xl bg-transparent outline-none text-slate-900 border-r border-slate-200 placeholder-slate-400 focus:bg-indigo-50/50"
                                title="Klicka för att döpa om X-kolumnen"
                            />
                            <input
                                type="text"
                                value={el.headerY ?? 'y'}
                                onChange={(e) => handleHeaderChange('headerY', e.target.value)}
                                onPointerDown={(e) => e.stopPropagation()}
                                placeholder="Y"
                                className="w-1/2 h-full text-center font-black text-xl bg-transparent outline-none text-slate-900 placeholder-slate-400 focus:bg-indigo-50/50"
                                title="Klicka för att döpa om Y-kolumnen"
                            />
                        </div>
                    </foreignObject>

                    {/* Table Data Rows with 2XL Font Sizing */}
                    <foreignObject x={0} y={52} width={tableWidth} height={h - 52}>
                        <div className="w-full h-full flex flex-col font-sans overflow-y-auto custom-scrollbar">
                            {rows.map((row, idx) => (
                                <div key={idx} className="flex border-b border-slate-200 shrink-0" style={{ height: `${rowHeight}px` }}>
                                    <input
                                        type="text"
                                        value={row.x ?? ''}
                                        onChange={(e) => handleCellChange(idx, 'x', e.target.value)}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        className="w-1/2 h-full text-center font-bold text-2xl bg-transparent outline-none text-slate-800 border-r border-slate-200 focus:bg-blue-50/50"
                                        placeholder="X"
                                    />
                                    <input
                                        type="text"
                                        value={row.y ?? ''}
                                        onChange={(e) => handleCellChange(idx, 'y', e.target.value)}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        className="w-1/2 h-full text-center font-bold text-2xl bg-transparent outline-none text-slate-800 focus:bg-blue-50/50"
                                        placeholder="Y"
                                    />
                                </div>
                            ))}
                        </div>
                    </foreignObject>
                </g>

                {/* ========================================================= */}
                {/* 2. LIVE GRAPH WITH LARGER LABELS & INCREMENT CONTROLS     */}
                {/* ========================================================= */}
                {hasGraph && (
                    <g transform={`translate(${tableWidth + 24}, 20)`}>
                        {(() => {
                            const plotAreaLeft = 52; // Room for larger Y-axis numbers & title
                            const plotAreaBottom = 48; // Room for X-axis labels & title
                            const graphW = w - tableWidth - 48 - plotAreaLeft;
                            const graphH = h - 40 - plotAreaBottom;

                            const hTitle = el.headerX || 'X';
                            const vTitle = el.headerY || 'Y';

                            // Generate whole number ticks based on axisStep
                            const ticks = [];
                            for (let v = minY; v <= maxY; v += step) {
                                ticks.push(v);
                            }

                            return (
                                <g>
                                    {/* Graph Canvas Box */}
                                    <rect 
                                        x={plotAreaLeft} 
                                        y={0} 
                                        width={graphW} 
                                        height={graphH} 
                                        rx={10} 
                                        fill="#f8fafc" 
                                        stroke="#cbd5e1" 
                                        strokeWidth={1.5}
                                    />

                                    {/* 🟢 LARGER VERTICAL AXIS TITLE (Rotated 90°) */}
                                    <text
                                        x={-(graphH / 2)}
                                        y={16}
                                        transform="rotate(-90)"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize="14"
                                        fontWeight="900"
                                        fill="#1e293b"
                                        fontFamily="system-ui, sans-serif"
                                        className="select-none pointer-events-none"
                                    >
                                        {isInverted ? hTitle : vTitle}
                                    </text>

                                    {/* 🟢 LARGER HORIZONTAL AXIS TITLE */}
                                    <text
                                        x={plotAreaLeft + graphW / 2}
                                        y={graphH + plotAreaBottom - 6}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize="14"
                                        fontWeight="900"
                                        fill="#1e293b"
                                        fontFamily="system-ui, sans-serif"
                                        className="select-none pointer-events-none"
                                    >
                                        {isInverted ? vTitle : hTitle}
                                    </text>

                                    {/* Y-Axis Gridlines & Scaled Number Ticks */}
                                    {ticks.map((val, idx) => {
                                        const yPos = graphH * (1 - (val - minY) / numRange);
                                        if (yPos < 0 || yPos > graphH) return null;

                                        return (
                                            <g key={idx}>
                                                <line 
                                                    x1={plotAreaLeft} 
                                                    y1={yPos} 
                                                    x2={plotAreaLeft + graphW} 
                                                    y2={yPos} 
                                                    stroke="#e2e8f0" 
                                                    strokeDasharray="4 4" 
                                                />
                                                <text 
                                                    x={plotAreaLeft - 10} 
                                                    y={yPos} 
                                                    textAnchor="end" 
                                                    dominantBaseline="central" 
                                                    fontSize="13" 
                                                    fill="#334155" 
                                                    fontWeight="800"
                                                >
                                                    {val}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* PLOT: DATA POINTS & LABELS */}
                                    {rows.map((row, i) => {
                                        const valX = String(row.x ?? '');
                                        const valY = String(row.y ?? '');
                                        const num = isInverted 
                                            ? parseFloat(valX.replace(',', '.')) 
                                            : parseFloat(valY.replace(',', '.'));

                                        const label = isInverted ? valY : valX;

                                        if (isNaN(num)) return null;

                                        const categoryStep = graphW / rows.length;
                                        const xCenter = plotAreaLeft + i * categoryStep + categoryStep / 2;
                                        const normalizedHeight = Math.max(0, ((num - minY) / numRange) * (graphH - 10));
                                        const yPos = graphH - normalizedHeight;

                                        return (
                                            <g key={i}>
                                                {/* BAR GRAPH PLOT */}
                                                {el.graphType === 'bar' && (
                                                    <g>
                                                        <rect
                                                            x={xCenter - (categoryStep * 0.7) / 2}
                                                            y={yPos}
                                                            width={Math.max(8, categoryStep * 0.7)}
                                                            height={normalizedHeight}
                                                            rx={4}
                                                            fill={strokeColor}
                                                            fillOpacity={0.85}
                                                        />
                                                        {/* Larger number tag on top of bar */}
                                                        <text
                                                            x={xCenter}
                                                            y={yPos - 10}
                                                            textAnchor="middle"
                                                            fontSize="13"
                                                            fontWeight="900"
                                                            fill={strokeColor}
                                                        >
                                                            {num}
                                                        </text>
                                                    </g>
                                                )}

                                                {/* LINE GRAPH POINT MARKERS */}
                                                {el.graphType === 'line' && (
                                                    <circle
                                                        cx={xCenter}
                                                        cy={yPos}
                                                        r={6}
                                                        fill="#ffffff"
                                                        stroke={strokeColor}
                                                        strokeWidth={3}
                                                    />
                                                )}

                                                {/* 🟢 LARGER X-AXIS CATEGORY LABELS */}
                                                <text
                                                    x={xCenter}
                                                    y={graphH + 18}
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                    fontSize="13"
                                                    fontWeight="800"
                                                    fill="#1e293b"
                                                    className="truncate"
                                                >
                                                    {label.length > 8 ? `${label.substring(0, 7)}…` : label}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* LINE GRAPH CONNECTING POLYLINE */}
                                    {el.graphType === 'line' && (
                                        (() => {
                                            const categoryStep = graphW / rows.length;
                                            const pts = rows.map((row, i) => {
                                                const num = isInverted 
                                                    ? parseFloat(String(row.x).replace(',', '.')) 
                                                    : parseFloat(String(row.y).replace(',', '.'));
                                                if (isNaN(num)) return null;

                                                const xCenter = plotAreaLeft + i * categoryStep + categoryStep / 2;
                                                const normalizedHeight = Math.max(0, ((num - minY) / numRange) * (graphH - 10));
                                                return `${xCenter},${graphH - normalizedHeight}`;
                                            }).filter(Boolean);

                                            if (pts.length < 2) return null;

                                            return (
                                                <polyline
                                                    fill="none"
                                                    stroke={strokeColor}
                                                    strokeWidth={3.5}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    points={pts.join(' ')}
                                                />
                                            );
                                        })()
                                    )}
                                </g>
                            );
                        })()}
                    </g>
                )}

                {/* Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>{renderHandles(el)}</g>
                )}
            </g>
        );
    }
};

export default TChartTool;