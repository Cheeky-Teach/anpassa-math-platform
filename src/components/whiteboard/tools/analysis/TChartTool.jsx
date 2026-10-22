// src/components/whiteboard/tools/analysis/TChartTool.jsx
import React from 'react';
import { BarChart3, LineChart, Plus, Minus, GripHorizontal, EyeOff } from 'lucide-react';

export const TChartTool = {
    type: 'tchart',
    hasOptions: true,

    createDefault: (id, color = '#2563eb') => ({
        id,
        type: 'tchart',
        x: 550,
        y: 220,
        width: 280,
        height: 420,
        stroke: color,
        headerX: 'x',
        headerY: 'y',
        graphType: 'none', // 'none' | 'line' | 'bar'
        axisStep: 2,
        rows: [
            { x: '1', y: '4' },
            { x: '2', y: '8' },
            { x: '3', y: '12' },
            { x: '4', y: '16' },
            { x: '5', y: '20' }
        ]
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv', t }) => {
        const rows = Array.isArray(el?.rows) ? el.rows : [];

        const toggleGraph = (type) => {
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                graphType: o.graphType === type ? 'none' : type,
                width: o.graphType === type ? 280 : 660 
            } : o));
        };

        const updateStep = (val) => {
            const step = Math.max(1, parseInt(val, 10) || 1);
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, axisStep: step } : o));
        };

        return (
            <div 
                className="flex items-center gap-3 font-sans font-bold text-sm select-none !text-slate-900" 
                style={{ color: '#0f172a' }}
            >
                {/* Row Add / Remove Stepper */}
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button
                        type="button"
                        onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, rows: rows.slice(0, -1) } : o))}
                        disabled={rows.length <= 1}
                        className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                        title={lang === 'sv' ? "Ta bort rad" : "Remove row"}
                    >
                        <Minus size={16} strokeWidth={3} />
                    </button>

                    <span className="text-sm font-black px-2 min-w-[65px] text-center text-slate-800">
                        {rows.length} {lang === 'sv' ? "Rader" : "Rows"}
                    </span>

                    <button
                        type="button"
                        onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, rows: [...rows, { x: '', y: '' }] } : o))}
                        disabled={rows.length >= 10}
                        className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                        title={lang === 'sv' ? "Lägg till rad" : "Add row"}
                    >
                        <Plus size={16} strokeWidth={3} />
                    </button>
                </div>

                <div className="w-px h-6 bg-slate-200 mx-0.5" />

                {/* Axis Step Input */}
                <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-2xl border border-slate-200">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                        {lang === 'sv' ? "Skala:" : "Step:"}
                    </span>
                    <input
                        type="number"
                        min="1"
                        max="50"
                        value={el.axisStep || 2}
                        onChange={(e) => updateStep(e.target.value)}
                        className="w-12 py-1 bg-white border border-slate-300 rounded-lg text-center font-black text-indigo-600 outline-none text-sm shadow-inner"
                    />
                </div>

                <div className="w-px h-6 bg-slate-200 mx-0.5" />

                {/* Graph Visualization Controls */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => toggleGraph('line')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all cursor-pointer text-xs uppercase tracking-wider font-black shadow-xs active:scale-95 ${
                            el.graphType === 'line' 
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <LineChart size={16} /> {lang === 'sv' ? "Linje" : "Line"}
                    </button>
                    <button
                        type="button"
                        onClick={() => toggleGraph('bar')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all cursor-pointer text-xs uppercase tracking-wider font-black shadow-xs active:scale-95 ${
                            el.graphType === 'bar' 
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <BarChart3 size={16} /> {lang === 'sv' ? "Stapel" : "Bar"}
                    </button>
                    {el.graphType && el.graphType !== 'none' && (
                        <button
                            type="button"
                            onClick={() => toggleGraph(el.graphType)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl border border-slate-200 transition-all cursor-pointer"
                            title={lang === 'sv' ? "Dölj graf" : "Hide graph"}
                        >
                            <EyeOff size={16} />
                        </button>
                    )}
                </div>
            </div>
        );
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { 
            showUI, 
            renderHandles, 
            setElements, 
            setSelectedId, 
            setInteractionMode, 
            setIsDrawing, 
            setDragOffset, 
            getCoordinates 
        } = options;

        if (!el) return null;

        const w = Number(el.width) || 280;
        const h = Number(el.height) || 420;
        const brandColor = el.stroke || '#2563eb';
        const rows = Array.isArray(el.rows) && el.rows.length > 0 ? el.rows : [{ x: '1', y: '2' }, { x: '2', y: '4' }];

        const hasGraph = el.graphType && el.graphType !== 'none';
        const tableWidth = hasGraph ? 270 : w;
        const headerHeight = 54;
        const rowHeight = Math.max(46, (h - headerHeight - 16) / (rows.length || 1));

        const handleHeaderChange = (key, val) => {
            if (!setElements) return;
            setElements(prev => prev.map(item => item.id === el.id ? { ...item, [key]: val } : item));
        };

        const handleCellChange = (rowIndex, colKey, val) => {
            if (!setElements) return;
            setElements(prev => prev.map(item => {
                if (item.id !== el.id) return item;
                const nextRows = [...item.rows];
                nextRows[rowIndex] = { ...nextRows[rowIndex], [colKey]: val };
                return { ...item, rows: nextRows };
            }));
        };

        const capturePointer = (e) => {
            e.stopPropagation();
            if (setSelectedId) setSelectedId(el.id);
        };

        // Graph Math Engine
        const xNumbers = rows.map(r => parseFloat(String(r.x).replace(',', '.'))).filter(n => !isNaN(n));
        const yNumbers = rows.map(r => parseFloat(String(r.y).replace(',', '.'))).filter(n => !isNaN(n));

        const isXNumeric = xNumbers.length > rows.length / 2;
        const isYNumeric = yNumbers.length > rows.length / 2;
        const isInverted = !isYNumeric && isXNumeric;

        const activeNumericVals = isInverted ? xNumbers : yNumbers;
        const rawMaxY = activeNumericVals.length > 0 ? Math.max(...activeNumericVals) : 10;
        const rawMinY = activeNumericVals.length > 0 ? Math.min(0, Math.min(...activeNumericVals)) : 0;
        
        const step = Math.max(1, Number(el.axisStep) || 2);
        const maxY = Math.ceil(rawMaxY / step) * step || step;
        const minY = Math.floor(rawMinY / step) * step;
        const numRange = (maxY - minY) || step;

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y})`} 
                className="select-none"
            >
                {/* 1. Tactile Tray Drag Handle Bar (Mirrors the Dice & Platform tools) */}
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
                        width={tableWidth} 
                        height={24} 
                        rx={10} 
                        fill="#f8fafc" 
                        stroke="#cbd5e1" 
                        strokeWidth={1.5}
                        className="group-hover:stroke-indigo-400 group-hover:fill-indigo-50/50 transition-colors shadow-xs" 
                    />
                    <GripHorizontal size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" x={tableWidth / 2 - 7} y={-23} />
                </g>

                {/* 2. Physical Card Body & Drop Shadow Base */}
                <rect 
                    x={0} 
                    y={6} 
                    width={w} 
                    height={h} 
                    rx={24} 
                    fill="#94a3b8" 
                    fillOpacity="0.25" 
                    className="pointer-events-none"
                />
                <rect 
                    x={0} 
                    y={0} 
                    width={w} 
                    height={h} 
                    rx={24} 
                    fill="#ffffff" 
                    stroke="#0f172a" 
                    strokeWidth={2.5} 
                    filter="drop-shadow(0 8px 20px rgba(15, 23, 42, 0.08))"
                    className="pointer-events-none"
                />

                {/* 3. The T-Chart Table View */}
                <g transform="translate(0, 0)">
                    {/* Header Strip Pill Background */}
                    <rect x={2} y={2} width={tableWidth - 4} height={headerHeight} rx={22} fill="#f8fafc" />
                    <line x1={0} y1={headerHeight} x2={tableWidth} y2={headerHeight} stroke="#0f172a" strokeWidth={2.5} />
                    <line x1={tableWidth / 2} y1={2} x2={tableWidth / 2} y2={h - 2} stroke="#0f172a" strokeWidth={2.5} />

                    {/* Column Headers Input Area */}
                    <foreignObject x={4} y={4} width={tableWidth - 8} height={headerHeight - 4} className="pointer-events-auto">
                        <div className="w-full h-full flex items-center font-sans">
                            <input
                                type="text"
                                value={el.headerX ?? 'x'}
                                onChange={(e) => handleHeaderChange('headerX', e.target.value)}
                                onPointerDown={capturePointer}
                                className="w-1/2 h-full text-center font-black text-xl italic bg-transparent outline-none text-slate-900 border-r-2 border-slate-200 placeholder-slate-400 focus:bg-indigo-50/60 rounded-l-2xl transition-colors cursor-text"
                            />
                            <input
                                type="text"
                                value={el.headerY ?? 'y'}
                                onChange={(e) => handleHeaderChange('headerY', e.target.value)}
                                onPointerDown={capturePointer}
                                className="w-1/2 h-full text-center font-black text-xl italic bg-transparent outline-none text-slate-900 placeholder-slate-400 focus:bg-indigo-50/60 rounded-r-2xl transition-colors cursor-text"
                            />
                        </div>
                    </foreignObject>

                    {/* Scrollable / Row Cells Container */}
                    <foreignObject x={4} y={headerHeight + 2} width={tableWidth - 8} height={h - headerHeight - 12} className="pointer-events-auto">
                        <div className="w-full h-full flex flex-col font-sans overflow-y-auto no-scrollbar py-1">
                            {rows.map((row, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex border-b border-slate-200/80 last:border-b-0 shrink-0 group" 
                                    style={{ height: `${rowHeight}px` }}
                                >
                                    <input
                                        type="text"
                                        value={row.x ?? ''}
                                        onChange={(e) => handleCellChange(idx, 'x', e.target.value)}
                                        onPointerDown={capturePointer}
                                        className="w-1/2 h-full text-center font-black text-lg bg-transparent outline-none text-slate-800 border-r border-slate-200/60 focus:bg-blue-50/60 focus:text-blue-700 transition-colors cursor-text"
                                    />
                                    <input
                                        type="text"
                                        value={row.y ?? ''}
                                        onChange={(e) => handleCellChange(idx, 'y', e.target.value)}
                                        onPointerDown={capturePointer}
                                        className="w-1/2 h-full text-center font-black text-lg bg-transparent outline-none text-slate-800 focus:bg-indigo-50/60 focus:text-indigo-700 transition-colors cursor-text"
                                    />
                                </div>
                            ))}
                        </div>
                    </foreignObject>
                </g>

                {/* 4. Co-located Dynamic Visualization Canvas */}
                {hasGraph && (
                    <g transform={`translate(${tableWidth + 24}, 18)`}>
                        {(() => {
                            const plotLeft = 65;
                            const plotBottom = 54;
                            const graphW = w - tableWidth - 48 - plotLeft;
                            const graphH = h - 36 - plotBottom;

                            const hTitle = el.headerX || 'X';
                            const vTitle = el.headerY || 'Y';

                            const ticks = [];
                            for (let v = minY; v <= maxY; v += step) {
                                ticks.push(v);
                            }

                            const categoryStep = graphW / (rows.length || 1);

                            return (
                                <g className="pointer-events-none">
                                    {/* Plotting Backdrop Frame */}
                                    <rect 
                                        x={plotLeft} 
                                        y={0} 
                                        width={graphW} 
                                        height={graphH} 
                                        rx={16} 
                                        fill="#f8fafc" 
                                        stroke="#cbd5e1" 
                                        strokeWidth={1.5} 
                                    />

                                    {/* Axis Title Labels */}
                                    <text 
                                        x={-(graphH / 2)} 
                                        y={20} 
                                        transform="rotate(-90)" 
                                        textAnchor="middle" 
                                        dominantBaseline="central" 
                                        fontSize="15" 
                                        fontWeight="900" 
                                        fill="#0f172a" 
                                        fontFamily="system-ui, sans-serif"
                                    >
                                        {isInverted ? hTitle : vTitle}
                                    </text>

                                    <text 
                                        x={plotLeft + graphW / 2} 
                                        y={graphH + plotBottom - 10} 
                                        textAnchor="middle" 
                                        dominantBaseline="central" 
                                        fontSize="15" 
                                        fontWeight="900" 
                                        fill="#0f172a" 
                                        fontFamily="system-ui, sans-serif"
                                    >
                                        {isInverted ? vTitle : hTitle}
                                    </text>

                                    {/* Horizontal Gridlines & Y-Axis Scale Markers */}
                                    {ticks.map((val, idx) => {
                                        const yPos = graphH * (1 - (val - minY) / numRange);
                                        if (isNaN(yPos) || yPos < 0 || yPos > graphH) return null;

                                        return (
                                            <g key={idx}>
                                                <line 
                                                    x1={plotLeft} 
                                                    y1={yPos} 
                                                    x2={plotLeft + graphW} 
                                                    y2={yPos} 
                                                    stroke="#e2e8f0" 
                                                    strokeWidth={1.5}
                                                    strokeDasharray="4 4" 
                                                />
                                                <text 
                                                    x={plotLeft - 10} 
                                                    y={yPos} 
                                                    textAnchor="end" 
                                                    dominantBaseline="central" 
                                                    fontSize="13" 
                                                    fill="#64748b" 
                                                    fontWeight="800"
                                                    fontFamily="system-ui, sans-serif"
                                                >
                                                    {val}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Bar Chart Visualization */}
                                    {el.graphType === 'bar' && rows.map((row, i) => {
                                        const valX = String(row.x ?? '');
                                        const valY = String(row.y ?? '');
                                        const num = isInverted ? parseFloat(valX.replace(',', '.')) : parseFloat(valY.replace(',', '.'));
                                        const label = isInverted ? valY : valX;

                                        if (isNaN(num)) return null;

                                        const xCenter = plotLeft + i * categoryStep + categoryStep / 2;
                                        const normalizedHeight = Math.max(0, ((num - minY) / numRange) * (graphH - 12));
                                        const yPos = graphH - normalizedHeight;
                                        const barW = Math.max(12, categoryStep * 0.65);

                                        if (isNaN(yPos) || isNaN(xCenter)) return null;

                                        return (
                                            <g key={i}>
                                                {/* 3D Drop Extrusion for the Bar */}
                                                <rect 
                                                    x={xCenter - barW / 2} 
                                                    y={yPos} 
                                                    width={barW} 
                                                    height={normalizedHeight} 
                                                    rx={6} 
                                                    fill={brandColor} 
                                                    fillOpacity={0.9} 
                                                    stroke="#0f172a" 
                                                    strokeWidth={2}
                                                />
                                                {/* Top Value Pill */}
                                                <g transform={`translate(${xCenter}, ${yPos - 12})`}>
                                                    <text 
                                                        x={0} 
                                                        y={0} 
                                                        textAnchor="middle" 
                                                        fontSize="12" 
                                                        fontWeight="900" 
                                                        fill="#0f172a"
                                                    >
                                                        {num}
                                                    </text>
                                                </g>
                                                {/* Category Label */}
                                                <text 
                                                    x={xCenter} 
                                                    y={graphH + 18} 
                                                    textAnchor="middle" 
                                                    dominantBaseline="central" 
                                                    fontSize="13" 
                                                    fontWeight="800" 
                                                    fill="#0f172a"
                                                >
                                                    {label.length > 7 ? `${label.substring(0, 6)}…` : label}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Line Chart Visualization */}
                                    {el.graphType === 'line' && (() => {
                                        const pts = [];
                                        const renderedNodes = [];

                                        rows.forEach((row, i) => {
                                            const valX = String(row.x ?? '');
                                            const valY = String(row.y ?? '');
                                            const num = isInverted ? parseFloat(valX.replace(',', '.')) : parseFloat(valY.replace(',', '.'));
                                            const label = isInverted ? valY : valX;

                                            if (isNaN(num)) return;

                                            const xCenter = plotLeft + i * categoryStep + categoryStep / 2;
                                            const normalizedHeight = Math.max(0, ((num - minY) / numRange) * (graphH - 12));
                                            const yPos = graphH - normalizedHeight;

                                            pts.push({ x: xCenter, y: yPos });

                                            renderedNodes.push(
                                                <g key={i}>
                                                    <circle cx={xCenter} cy={yPos} r={7} fill="#ffffff" stroke="#0f172a" strokeWidth={2.5} />
                                                    <circle cx={xCenter} cy={yPos} r={4} fill={brandColor} />
                                                    <text 
                                                        x={xCenter} 
                                                        y={yPos - 14} 
                                                        textAnchor="middle" 
                                                        fontSize="12" 
                                                        fontWeight="900" 
                                                        fill="#0f172a"
                                                    >
                                                        {num}
                                                    </text>
                                                    <text 
                                                        x={xCenter} 
                                                        y={graphH + 18} 
                                                        textAnchor="middle" 
                                                        dominantBaseline="central" 
                                                        fontSize="13" 
                                                        fontWeight="800" 
                                                        fill="#0f172a"
                                                    >
                                                        {label.length > 7 ? `${label.substring(0, 6)}…` : label}
                                                    </text>
                                                </g>
                                            );
                                        });

                                        if (pts.length < 2) return renderedNodes;

                                        const polylineStr = pts.map(p => `${p.x},${p.y}`).join(' ');
                                        const areaStr = `${pts[0].x},${graphH} ` + polylineStr + ` ${pts[pts.length - 1].x},${graphH}`;

                                        return (
                                            <g>
                                                {/* Translucent Area Under-Fill */}
                                                <polygon points={areaStr} fill={brandColor} fillOpacity={0.12} />
                                                {/* Main Line */}
                                                <polyline 
                                                    fill="none" 
                                                    stroke="#0f172a" 
                                                    strokeWidth={4.5} 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    points={polylineStr} 
                                                />
                                                <polyline 
                                                    fill="none" 
                                                    stroke={brandColor} 
                                                    strokeWidth={2.5} 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    points={polylineStr} 
                                                />
                                                {renderedNodes}
                                            </g>
                                        );
                                    })()}
                                </g>
                            );
                        })()}
                    </g>
                )}

                {/* 5. Standard Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el)}
                    </g>
                )}
            </g>
        );
    }
};

export default TChartTool;