// src/components/whiteboard/tools/geometry/FractionShapesTool.jsx
import React from 'react';
import { 
    Play, Hash, Plus, Minus, GripHorizontal, 
    RotateCcw, Type, Split, Layers, Sparkles
} from 'lucide-react';

const PALETTE = [
    '#3b82f6', // Classic Blue
    '#10b981', // Emerald Green
    '#f59e0b', // Amber Orange
    '#ef4444', // Coral Red
    '#8b5cf6', // Violet Purple
    '#ec4899'  // Pink
];

export const FractionShapesTool = {
    type: 'fraction_shapes',
    hasOptions: true,

    createDefault: (id, color = '#3b82f6', type = 'frac_rect') => ({
        id,
        type,
        x: 550,
        y: 260,
        width: type.includes('rect') ? 380 : 260,
        height: type.includes('rect') ? 140 : 260,
        divisions: 4,
        subDivisions: 1, // Horizontal rows for area-model multiplication
        sliceColors: {},
        activeColor: color,
        showLabel: true,
        showBrackets: false, // Division measurement brackets
        labelFormat: 'fraction', // 'fraction' | 'percent' | 'decimal' | 'equation'
        labelScale: 'medium',    // 'small' | 'medium' | 'large'
        stroke: '#0f172a',
        strokeWidth: 3,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv', t }) => {
        const numDivisions = Math.max(1, Number(el.divisions) || 1);
        const subDivisions = Math.max(1, Number(el.subDivisions) || 1);
        const activeColor = el.activeColor || '#3b82f6';
        const isRect = el.type.includes('rect');

        const updateDivisions = (delta) => setElements(prev => prev.map(o => {
            if (o.id !== el.id) return o;
            const nextDivs = Math.max(1, Math.min(32, (Number(o.divisions) || 1) + delta));
            return {
                ...o,
                divisions: nextDivs,
                sliceColors: {}
            };
        }));

        const updateSubDivisions = (delta) => setElements(prev => prev.map(o => {
            if (o.id !== el.id) return o;
            const nextSub = Math.max(1, Math.min(12, (Number(o.subDivisions) || 1) + delta));
            return {
                ...o,
                subDivisions: nextSub,
                sliceColors: {}
            };
        }));

        const toggleLabelFormat = () => {
            const sequence = ['fraction', 'equation', 'percent', 'decimal'];
            const next = sequence[(sequence.indexOf(el.labelFormat || 'fraction') + 1) % sequence.length];
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, labelFormat: next } : o));
        };

        const toggleLabelScale = () => {
            const scales = ['small', 'medium', 'large'];
            const next = scales[(scales.indexOf(el.labelScale || 'medium') + 1) % scales.length];
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, labelScale: next } : o));
        };

        const toggleBrackets = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, showBrackets: !o.showBrackets } : o));
        };

        const resetFills = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, sliceColors: {} } : o));
        };

        const spinSpinner = () => {
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                arrowRotation: (o.arrowRotation || 0) + 1440 + Math.random() * 360
            } : o));
        };

        return (
            <div 
                className="flex items-center gap-2.5 font-sans font-bold text-sm select-none !text-slate-900" 
                style={{ color: '#0f172a' }}
            >
                {/* 1. Partition Stepper (Columns / Slices) */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button 
                        type="button"
                        onClick={() => updateDivisions(-1)} 
                        disabled={numDivisions <= 1}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                    >
                        <Minus size={15} strokeWidth={3} />
                    </button>

                    <span className="text-xs font-black px-2 min-w-[60px] text-center text-slate-800">
                        {numDivisions} {lang === 'sv' ? "Delar" : "Parts"}
                    </span>

                    <button 
                        type="button"
                        onClick={() => updateDivisions(1)} 
                        disabled={numDivisions >= 32}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                    >
                        <Plus size={15} strokeWidth={3} />
                    </button>
                </div>

                {/* 2. Multiplication Grid / Area Model Splitter (Rectangles only) */}
                {isRect && (
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-500 pl-1">
                            {lang === 'sv' ? "Rader:" : "Rows:"}
                        </span>
                        <button 
                            type="button"
                            onClick={() => updateSubDivisions(-1)} 
                            disabled={subDivisions <= 1}
                            className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-lg transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                        >
                            <Minus size={13} strokeWidth={3} />
                        </button>
                        <span className="text-xs font-black px-1 min-w-[20px] text-center text-indigo-600">
                            {subDivisions}
                        </span>
                        <button 
                            type="button"
                            onClick={() => updateSubDivisions(1)} 
                            disabled={subDivisions >= 8}
                            className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-lg transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                        >
                            <Plus size={13} strokeWidth={3} />
                        </button>
                    </div>
                )}

                {/* 3. Color Palette Selector */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    {PALETTE.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setElements(prev => prev.map(o => o.id === el.id ? { ...o, activeColor: c } : o))}
                            className={`w-6 h-6 rounded-lg transition-transform active:scale-90 ${activeColor === c ? 'ring-2 ring-slate-800 scale-110 shadow-xs' : 'opacity-80 hover:opacity-100'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                <div className="w-px h-6 bg-slate-200 mx-0.5" />

                {/* 4. Display Format Toggle */}
                <button 
                    type="button"
                    onClick={toggleLabelFormat}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                    title={lang === 'sv' ? "Växla visningsläge" : "Toggle display format"}
                >
                    <Hash size={15} className="text-indigo-600" />
                    <span>
                        {el.labelFormat === 'percent' ? '100%' : 
                         el.labelFormat === 'decimal' ? (lang === 'sv' ? '0,00' : '0.00') : 
                         el.labelFormat === 'equation' ? (lang === 'sv' ? 'Summa' : 'Sum') : 
                         (lang === 'sv' ? 'Bråk' : 'Frac')}
                    </span>
                </button>

                {/* 5. Division Measurement Bracket Toggle (Rectangles only) */}
                {isRect && (
                    <button 
                        type="button"
                        onClick={toggleBrackets}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                            el.showBrackets 
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                        title={lang === 'sv' ? "Visa divisionsmått / delar" : "Show division measurement"}
                    >
                        <Layers size={14} />
                        <span>{lang === 'sv' ? "Mått" : "Units"}</span>
                    </button>
                )}

                {/* 6. Text Size Scaling Toggle */}
                <button 
                    type="button"
                    onClick={toggleLabelScale}
                    className="flex items-center gap-1 px-3 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                    title={lang === 'sv' ? "Textstorlek" : "Text size"}
                >
                    <Type size={14} className="text-slate-600" />
                    <span className="uppercase">{el.labelScale === 'large' ? 'L' : el.labelScale === 'small' ? 'S' : 'M'}</span>
                </button>

                {/* 7. Clear Fills */}
                <button 
                    type="button"
                    onClick={resetFills}
                    className="p-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-xs active:scale-95"
                    title={lang === 'sv' ? "Töm fält" : "Clear fills"}
                >
                    <RotateCcw size={15} />
                </button>

                {/* 8. Spinner Button */}
                {el.type === 'spinner' && (
                    <button 
                        type="button"
                        onClick={spinSpinner} 
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl px-4 py-2 font-black text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer ml-1"
                    >
                        <Play size={15} fill="white" />
                        <span>{lang === 'sv' ? "Snurra" : "Spin"}</span>
                    </button>
                )}
            </div>
        );
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { 
            lang = 'sv',
            showUI, 
            renderHandles, 
            setElements, 
            setSelectedId, 
            setInteractionMode, 
            setIsDrawing, 
            setDragOffset, 
            getCoordinates,
            isDrawing = false 
        } = options;

        if (!el) return null;

        const w = Number(el.width) || 260;
        const h = Number(el.height) || 260;
        const r = w / 2;
        const cx = r;
        const cy = r;

        const numDivisions = Math.max(1, Number(el.divisions) || 1);
        const subDivisions = Math.max(1, Number(el.subDivisions) || 1);
        const totalUnits = numDivisions * subDivisions;
        const currentColor = el.activeColor || '#3b82f6';
        
        const fills = [];
        const borders = [];

        // Handle Click on Individual Slices / Cells
        const handleSliceClick = (e, key) => {
            e.stopPropagation();
            if (isDrawing || !setElements) return;

            setElements(prev => prev.map(o => {
                if (o.id !== el.id) return o;
                const nextColors = { ...(o.sliceColors || {}) };
                if (nextColors[key] === currentColor) {
                    delete nextColors[key];
                } else {
                    nextColors[key] = currentColor;
                }
                return { ...o, sliceColors: nextColors };
            }));
        };

        // Construct Shapes & Slices (Area Grid for Rectangles)
        if (el.type.includes('rect')) {
            const colWidth = w / numDivisions;
            const rowHeight = h / subDivisions;

            for (let c = 0; c < numDivisions; c++) {
                for (let rIdx = 0; rIdx < subDivisions; rIdx++) {
                    const key = `${c}_${rIdx}`;
                    const sliceColor = el.sliceColors?.[key] || 'transparent';

                    fills.push(
                        <rect 
                            key={`fill_${key}`} 
                            x={c * colWidth} 
                            y={rIdx * rowHeight} 
                            width={colWidth} 
                            height={rowHeight} 
                            fill={sliceColor} 
                            className="cursor-pointer interactive-slice"
                            style={{ pointerEvents: 'auto' }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => handleSliceClick(e, key)}
                        />
                    );
                }

                // Vertical column borders
                if (c > 0) {
                    borders.push(
                        <line 
                            key={`v_border_${c}`} 
                            x1={c * colWidth} 
                            y1={0} 
                            x2={c * colWidth} 
                            y2={h} 
                            stroke="#0f172a" 
                            strokeWidth={2.5} 
                            className="pointer-events-none" 
                        />
                    );
                }
            }

            // Horizontal sub-division borders (Multiplication rows)
            for (let rIdx = 1; rIdx < subDivisions; rIdx++) {
                borders.push(
                    <line 
                        key={`h_border_${rIdx}`} 
                        x1={0} 
                        y1={rIdx * rowHeight} 
                        x2={w} 
                        y2={rIdx * rowHeight} 
                        stroke="#0f172a" 
                        strokeWidth={2} 
                        strokeDasharray={subDivisions > 1 ? "4 4" : undefined}
                        className="pointer-events-none" 
                    />
                );
            }
        } else {
            // Circle & Spinner Math
            for (let i = 0; i < numDivisions; i++) {
                const sliceColor = el.sliceColors?.[i] || 'transparent';

                if (numDivisions === 1) {
                    fills.push(
                        <circle 
                            key="fill_0" 
                            cx={cx} 
                            cy={cy} 
                            r={r} 
                            fill={sliceColor}
                            className="cursor-pointer interactive-slice"
                            style={{ pointerEvents: 'auto' }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => handleSliceClick(e, i)}
                        />
                    );
                } else {
                    const angle = 360 / numDivisions;
                    const startAngle = i * angle - 90;
                    const endAngle = (i + 1) * angle - 90;

                    const x1 = cx + r * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = cy + r * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = cx + r * Math.cos((Math.PI * endAngle) / 180);
                    const y2 = cy + r * Math.sin((Math.PI * endAngle) / 180);

                    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;

                    fills.push(
                        <path 
                            key={`fill_${i}`} 
                            d={d} 
                            fill={sliceColor} 
                            className="cursor-pointer interactive-slice"
                            style={{ pointerEvents: 'auto' }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => handleSliceClick(e, i)}
                        />
                    );
                    borders.push(
                        <line 
                            key={`border_${i}`} 
                            x1={cx} 
                            y1={cy} 
                            x2={x1} 
                            y2={y1} 
                            stroke="#0f172a" 
                            strokeWidth={2.5} 
                            className="pointer-events-none" 
                        />
                    );
                }
            }
        }

        // Numerical Computation & Color Breakdown (For Addition/Subtraction)
        const filledEntries = Object.entries(el.sliceColors || {});
        const filledCount = filledEntries.length;
        const decVal = filledCount / totalUnits;

        // Group slices by color to show addition decomposition: e.g. 2/6 (blue) + 3/6 (amber)
        const colorCounts = {};
        filledEntries.forEach(([_, col]) => {
            colorCounts[col] = (colorCounts[col] || 0) + 1;
        });
        const colorGroups = Object.entries(colorCounts);

        // 🟢 Swedish vs English Decimal Formatting
        const formatDecimal = (val) => {
            const formatted = val.toFixed(2);
            return lang === 'sv' ? formatted.replace('.', ',') : formatted;
        };

        // Dynamic Font Scaling relative to width + manual scale modifier
        const baseSizeMultiplier = el.labelScale === 'large' ? 0.18 : el.labelScale === 'small' ? 0.10 : 0.13;
        const dynamicFontSize = Math.max(14, Math.min(38, Math.round(w * baseSizeMultiplier)));

        // 🟢 FIX 1: Move badge position to top-right to prevent collision with drag handle
        const badgeX = el.type.includes('rect') ? w - 8 : w - 8;
        const badgeY = -18;

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y})`} 
                className="select-none"
            >
                {/* 1. Tactile Tray Drag Handle Bar (Centered) */}
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
                        x={el.type.includes('rect') ? w / 2 - 40 : cx - 40} 
                        y={-28} 
                        width={80} 
                        height={22} 
                        rx={10} 
                        fill="#f8fafc" 
                        stroke="#cbd5e1" 
                        strokeWidth={1.5}
                        className="group-hover:stroke-indigo-400 group-hover:fill-indigo-50/50 transition-colors shadow-xs" 
                    />
                    <GripHorizontal 
                        size={14} 
                        className="text-slate-400 group-hover:text-indigo-500 transition-colors" 
                        x={el.type.includes('rect') ? w / 2 - 7 : cx - 7} 
                        y={-24} 
                    />
                </g>

                {/* 2. Physical Extrusion Shadow Base */}
                {el.type.includes('rect') ? (
                    <rect x={0} y={6} width={w} height={h} rx={18} fill="#94a3b8" fillOpacity="0.25" className="pointer-events-none" />
                ) : (
                    <circle cx={cx} cy={cy + 6} r={r} fill="#94a3b8" fillOpacity="0.25" className="pointer-events-none" />
                )}

                {/* 3. Outer White Physical Acrylic Base */}
                {el.type.includes('rect') ? (
                    <rect x={0} y={0} width={w} height={h} rx={18} fill="#ffffff" stroke="#0f172a" strokeWidth={el.strokeWidth || 3} className="pointer-events-none" />
                ) : (
                    <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke="#0f172a" strokeWidth={el.strokeWidth || 3} className="pointer-events-none" />
                )}

                {/* 4. Clickable Colored Slices */}
                <g className="cursor-pointer">
                    {fills}
                </g>

                {/* 5. Clean Division Boundaries */}
                <g className="pointer-events-none">
                    {borders}
                </g>

                {/* 6. Outer High-Contrast Stroke */}
                {el.type.includes('rect') ? (
                    <rect x={0} y={0} width={w} height={h} rx={18} fill="none" stroke="#0f172a" strokeWidth={el.strokeWidth || 3} className="pointer-events-none" />
                ) : (
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0f172a" strokeWidth={el.strokeWidth || 3} className="pointer-events-none" />
                )}

                {/* 7. Measurement Brackets (For Division / Unit Counting) */}
                {el.type.includes('rect') && el.showBrackets && (
                    <g transform={`translate(0, ${h + 10})`} className="pointer-events-none">
                        {Array.from({ length: numDivisions }).map((_, bIdx) => {
                            const segW = w / numDivisions;
                            const bx = bIdx * segW;
                            return (
                                <g key={bIdx}>
                                    <path 
                                        d={`M ${bx + 2} 0 L ${bx + 2} 8 L ${bx + segW / 2} 14 L ${bx + segW - 2} 8 L ${bx + segW - 2} 0`} 
                                        fill="none" 
                                        stroke="#475569" 
                                        strokeWidth={1.5} 
                                    />
                                    <text 
                                        x={bx + segW / 2} 
                                        y={26} 
                                        textAnchor="middle" 
                                        dominantBaseline="central" 
                                        fontSize="11" 
                                        fontWeight="900" 
                                        fill="#475569"
                                    >
                                        1/{totalUnits}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                )}

                {/* 8. Spinner Arrow */}
                {el.type === 'spinner' && (
                    <g 
                        className="pointer-events-none" 
                        style={{ 
                            transform: `rotate(${el.arrowRotation || 0}deg)`, 
                            transition: 'transform 3s cubic-bezier(0.1, 0, 0.1, 1)', 
                            transformOrigin: `${cx}px ${cy}px` 
                        }}
                    >
                        <line x1={cx} y1={cy} x2={cx} y2={cy - r + 18} stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
                        <path d={`M ${cx - 14} ${cy - r + 30} L ${cx} ${cy - r + 8} L ${cx + 14} ${cy - r + 30} Z`} fill="#0f172a" />
                        <circle cx={cx} cy={cy} r={10} fill="#0f172a" />
                        <circle cx={cx} cy={cy} r={4} fill="#ffffff" />
                    </g>
                )}

                {/* 9. Floating Fraction / Equation Value Capsule (Top-Right, collision-free) */}
                {el.showLabel !== false && (
                    <foreignObject 
                        x={badgeX - 160} 
                        y={badgeY - 24} 
                        width={180} 
                        height={50} 
                        className="pointer-events-none overflow-visible select-none"
                    >
                        <div className="flex justify-end items-center w-full h-full">
                            <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-slate-200/90 shadow-lg flex items-center gap-2">
                                {el.labelFormat === 'percent' ? (
                                    <span style={{ fontSize: `${dynamicFontSize}px` }} className="font-black text-slate-900 leading-none">
                                        {Math.round(decVal * 100)}%
                                    </span>
                                ) : el.labelFormat === 'decimal' ? (
                                    <span style={{ fontSize: `${dynamicFontSize}px` }} className="font-black text-slate-900 leading-none">
                                        {formatDecimal(decVal)}
                                    </span>
                                ) : el.labelFormat === 'equation' && colorGroups.length > 1 ? (
                                /* 🟢 Scaled Addition Decomposition: 2/6 + 3/6 = 5/6 */
                                <div 
                                    className="flex items-center gap-2 font-black"
                                    style={{ fontSize: `${Math.round(dynamicFontSize * 0.85)}px` }}
                                >
                                    {colorGroups.map(([c, count], gIdx) => (
                                        <React.Fragment key={c}>
                                            {gIdx > 0 && <span className="text-slate-400 font-bold">+</span>}
                                            <div className="flex flex-col items-center leading-none" style={{ color: c }}>
                                                <span>{count}</span>
                                                <span 
                                                    className="w-full bg-current my-0.5 rounded-full" 
                                                    style={{ height: `${Math.max(1.5, Math.round(dynamicFontSize * 0.08))}px` }} 
                                                />
                                                <span>{totalUnits}</span>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <span className="text-slate-400 font-bold">=</span>
                                    <div className="flex flex-col items-center leading-none text-slate-900">
                                        <span>{filledCount}</span>
                                        <span 
                                            className="w-full bg-slate-900 my-0.5 rounded-full" 
                                            style={{ height: `${Math.max(1.5, Math.round(dynamicFontSize * 0.08))}px` }} 
                                        />
                                        <span>{totalUnits}</span>
                                    </div>
                                </div>
                            ) : (
                                    /* Stacked Fraction Representation */
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex flex-col items-center justify-center font-black leading-none">
                                            <span style={{ fontSize: `${dynamicFontSize}px`, color: filledCount > 0 ? currentColor : '#0f172a' }}>
                                                {filledCount}
                                            </span>
                                            <span className="w-full h-[2.5px] bg-slate-900 rounded-full my-0.5" />
                                            <span style={{ fontSize: `${dynamicFontSize}px` }} className="text-slate-900">
                                                {totalUnits}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </foreignObject>
                )}

                {/* 10. Standard Whiteboard Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, r)}
                    </g>
                )}
            </g>
        );
    }
};

export default FractionShapesTool;