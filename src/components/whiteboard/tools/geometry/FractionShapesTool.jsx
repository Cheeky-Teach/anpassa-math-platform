// src/components/whiteboard/tools/geometry/FractionShapesTool.jsx
import React from 'react';
import { Play, Hash, Plus, Minus } from 'lucide-react';

export const FractionShapesTool = {
    type: 'fraction_shapes',
    hasOptions: true,

    createDefault: (id, color = '#06b6d4', type = 'frac_rect') => ({
        id,
        type,
        x: 600,
        y: 300,
        width: type.includes('rect') ? 360 : 240,
        height: type.includes('rect') ? 140 : 240,
        divisions: 4,
        sliceColors: {},
        showLabel: true,
        stroke: color,
        strokeWidth: 3,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, t }) => {
        const updateDivisions = (delta) => setElements(prev => prev.map(o => 
            o.id === el.id ? { 
                ...o, 
                divisions: Math.max(1, (Number(o.divisions) || 1) + delta), 
                sliceColors: {} 
            } : o
        ));

        const spinSpinner = () => setElements(prev => prev.map(o => 
            o.id === el.id ? { 
                ...o, 
                arrowRotation: (o.arrowRotation || 0) + 1440 + Math.random() * 360 
            } : o
        ));

        return (
            <div 
                className="flex items-center gap-2 font-sans font-bold text-xs select-none !text-slate-900"
                style={{ color: '#0f172a' }}
            >
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button 
                        type="button"
                        onClick={() => updateDivisions(-1)} 
                        disabled={(el.divisions || 1) <= 1}
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-lg transition-colors cursor-pointer border border-slate-200"
                    >
                        <Minus size={13} strokeWidth={3} />
                    </button>

                    <span className="text-xs font-black px-1.5 min-w-[50px] text-center text-slate-800">
                        {el.divisions || 1} {t?.parts || "Delar"}
                    </span>

                    <button 
                        type="button"
                        onClick={() => updateDivisions(1)} 
                        disabled={(el.divisions || 1) >= 24}
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-lg transition-colors cursor-pointer border border-slate-200"
                    >
                        <Plus size={13} strokeWidth={3} />
                    </button>
                </div>

                <button 
                    type="button"
                    onClick={() => setElements(prev => prev.map(i => i.id === el.id ? { ...i, showLabel: !i.showLabel } : i))} 
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        el.showLabel 
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <Hash size={14} />
                    <span>Bråk</span>
                </button>

                {el.type === 'spinner' && (
                    <button 
                        type="button"
                        onClick={spinSpinner} 
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl px-3 py-1.5 font-black text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer ml-1"
                    >
                        <Play size={13} fill="white" />
                        <span>Snurra</span>
                    </button>
                )}
            </div>
        );
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { color = '#06b6d4', showUI = false, renderHandles = null, setElements = null } = options;

        if (!el) return null;

        const w = Number(el.width) || 240;
        const h = Number(el.height) || 240;
        const r = w / 2;
        const cx = r;
        const cy = r;

        const fills = [];
        const borderL = [];
        const numDivisions = Math.max(1, Number(el.divisions) || 1);

        let pointerDownPos = null;

        const handleSlicePointerDown = (e) => {
            // Stop the canvas from interpreting this as a drag attempt
            e.stopPropagation();
            if (options.setSelectedId) options.setSelectedId(el.id);
            pointerDownPos = { x: e.clientX, y: e.clientY };
        };

        const handleSlicePointerUp = (e, idx) => {
            if (!pointerDownPos) return;
            const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
            pointerDownPos = null;
            
            if (dist < 5 && setElements) {
                e.stopPropagation();
                setElements(prev => prev.map(o => {
                    if (o.id !== el.id) return o;
                    const sliceColors = { ...(o.sliceColors || {}) };
                    if (sliceColors[idx] === color) {
                        delete sliceColors[idx];
                    } else {
                        sliceColors[idx] = color;
                    }
                    return { ...o, sliceColors };
                }));
            }
        };

        for (let i = 0; i < numDivisions; i++) {
            const secCol = el.sliceColors?.[i] || 'transparent';
            
            if (el.type.includes('rect')) {
                const sw = w / numDivisions;
                fills.push(
                    <rect 
                        key={`fill_${i}`} 
                        x={i * sw} y={0} width={sw} height={h} fill={secCol} 
                        className="cursor-pointer" 
                        onPointerDown={handleSlicePointerDown}
                        onPointerUp={(e) => handleSlicePointerUp(e, i)}
                    />
                );
                if (i > 0) {
                    borderL.push(<line key={`line_${i}`} x1={i * sw} y1={0} x2={i * sw} y2={h} stroke="#0f172a" strokeWidth="2.5" className="pointer-events-none"/>);
                }
            } else if (el.type.includes('circle') || el.type === 'spinner') {
                if (numDivisions === 1) {
                    fills.push(
                        <circle
                            key={`fill_0`} cx={cx} cy={cy} r={r}
                            fill={el.type === 'spinner' && secCol === 'transparent' ? 'white' : secCol}
                            className="cursor-pointer"
                            onPointerDown={handleSlicePointerDown}
                            onPointerUp={(e) => handleSlicePointerUp(e, 0)}
                        />
                    );
                } else {
                    const a = 360 / numDivisions;
                    const sA = i * a - 90;
                    const eA = (i + 1) * a - 90;

                    const x1 = cx + r * Math.cos(Math.PI * sA / 180);
                    const y1 = cy + r * Math.sin(Math.PI * sA / 180);
                    const x2 = cx + r * Math.cos(Math.PI * eA / 180);
                    const y2 = cy + r * Math.sin(Math.PI * eA / 180);

                    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${a > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;

                    fills.push(
                        <path 
                            key={`fill_${i}`} d={d} 
                            fill={el.type === 'spinner' && secCol === 'transparent' ? 'white' : secCol} 
                            className="cursor-pointer" 
                            onPointerDown={handleSlicePointerDown}
                            onPointerUp={(e) => handleSlicePointerUp(e, i)}
                        />
                    );
                    borderL.push(<line key={`line_${i}`} x1={cx} y1={cy} x2={x1} y2={y1} stroke="#0f172a" strokeWidth="2.5" className="pointer-events-none"/>);
                }
            }
        }

        const visualStrokeWidth = Number(el.strokeWidth) || 3;

        return (
            <g key={el.id} data-id={el.id} transform={`translate(${el.x}, ${el.y})`} className="pointer-events-auto select-none">
                
                {/* Visual Base Shape Solid Background */}
                {el.type.includes('rect') ? (
                    <rect x={0} y={0} width={w} height={h} fill="white" stroke="#0f172a" strokeWidth={visualStrokeWidth} rx={8} className="pointer-events-none" />
                ) : (
                    <circle cx={cx} cy={cy} r={r} fill="white" stroke="#0f172a" strokeWidth={visualStrokeWidth} className="pointer-events-none" />
                )}

                {/* Interactive Slices */}
                {fills}
                {borderL}

                {/* Visible Boundary Stroke */}
                {el.type.includes('rect') ? (
                    <rect x={0} y={0} width={w} height={h} fill="none" stroke="#0f172a" strokeWidth={visualStrokeWidth} rx={8} className="pointer-events-none" />
                ) : (
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0f172a" strokeWidth={visualStrokeWidth} className="pointer-events-none" />
                )}

                {el.type === 'spinner' && (
                    <g style={{ transform: `rotate(${el.arrowRotation || 0}deg)`, transition: 'transform 3s cubic-bezier(0.1, 0, 0.1, 1)', transformOrigin: `${cx}px ${cy}px` }}>
                        <line x1={cx} y1={cy} x2={cx} y2={cy - r + 16} stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
                        <path d={`M ${cx - 12} ${cy - r + 26} L ${cx} ${cy - r + 6} L ${cx + 12} ${cy - r + 26} Z`} fill="#0f172a" />
                        <circle cx={cx} cy={cy} r={9} fill="#0f172a" />
                    </g>
                )}

                {el.showLabel && (
                    <text 
                        x={el.type.includes('rect') ? w / 2 : cx} 
                        y={el.type.includes('rect') ? -14 : -16} 
                        textAnchor="middle" dominantBaseline="auto" fontSize="22" fontWeight="900" fill="#0f172a" fontFamily="system-ui, sans-serif" className="select-none pointer-events-none"
                    >
                        {Object.keys(el.sliceColors || {}).length} / {el.divisions || 1}
                    </text>
                )}

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