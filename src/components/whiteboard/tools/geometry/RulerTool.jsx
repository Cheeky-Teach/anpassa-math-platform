// src/components/whiteboard/tools/geometry/RulerTool.jsx
import React from 'react';
import { Hash } from 'lucide-react';

export const RulerTool = {
    type: 'ruler',
    hasOptions: true,

    createDefault: (id, color = '#2563eb') => ({
        id,
        type: 'ruler',
        x: 400,
        y: 300,
        width: 800,
        height: 140,
        min: '0',
        max: '10',
        stepValue: 1,
        unitType: 'whole', // 'whole' | 'decimal' | 'fraction'
        denom: 4,
        showSubnotches: true,
        orientation: 'horizontal', // 'horizontal' | 'vertical'
        equation: '',
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, lang, t }) => {
        const update = (patch) => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, ...patch } : o));
        };

        const toggleOrientation = () => {
            const nextOr = el.orientation === 'vertical' ? 'horizontal' : 'vertical';
            setElements(prev => prev.map(o => {
                if (o.id !== el.id) return o;
                return {
                    ...o,
                    orientation: nextOr,
                    width: o.height || 140,
                    height: o.width || 800
                };
            }));
        };

        return (
            <div 
                className="flex flex-wrap gap-2.5 items-center font-sans font-bold text-xs select-none !text-slate-900"
                style={{ color: '#0f172a' }}
            >
                {/* Min / Max Inputs */}
                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-black uppercase text-slate-500">{t?.min || "Min"}:</span>
                    <input 
                        type="text" 
                        className="w-10 bg-white border border-slate-300 rounded px-1 text-center font-black text-slate-800 outline-none focus:border-indigo-500" 
                        value={el.min ?? '0'} 
                        onChange={e => update({ min: e.target.value })} 
                    />
                    <span className="text-[11px] font-black uppercase text-slate-500 ml-1">{t?.max || "Max"}:</span>
                    <input 
                        type="text" 
                        className="w-10 bg-white border border-slate-300 rounded px-1 text-center font-black text-slate-800 outline-none focus:border-indigo-500" 
                        value={el.max ?? '10'} 
                        onChange={e => update({ max: e.target.value })} 
                    />
                </div>

                {/* Calculation / Hop Visualizer (e.g., 3 + 4) */}
                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-black uppercase text-slate-500">{t?.calc || "Hopp"}:</span>
                    <input 
                        type="text" 
                        placeholder={t?.eg || "t.ex. 2+3"} 
                        className="w-20 bg-white border border-emerald-400 rounded px-1.5 text-center font-black text-emerald-700 outline-none placeholder-slate-400" 
                        value={el.equation || ''} 
                        onChange={e => update({ equation: e.target.value })} 
                    />
                </div>

                {/* Unit Type Dropdown */}
                <select 
                    className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-black text-slate-800 outline-none cursor-pointer hover:bg-slate-200 transition-colors"
                    value={el.unitType || 'whole'} 
                    onChange={e => update({ unitType: e.target.value })}
                >
                    <option value="whole">{t?.whole || "Heltal"}</option>
                    <option value="decimal">{t?.decimal || "Decimal"}</option>
                    <option value="fraction">{t?.fraction || "Bråk"}</option>
                </select>

                {/* Conditional Sub-settings for Fraction Denominator or Step Size */}
                {el.unitType === 'fraction' ? (
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-500">{lang === 'sv' ? 'Nämnare:' : 'Denom:'}</span>
                        <input 
                            type="number" 
                            min="1" 
                            max="64"
                            className="w-10 bg-white border border-slate-300 rounded text-center font-black text-indigo-600 outline-none" 
                            value={el.denom || 4} 
                            onChange={e => update({ denom: Math.max(1, parseInt(e.target.value) || 1) })} 
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-500">{lang === 'sv' ? 'Steg:' : 'Step:'}</span>
                        <input 
                            type="number" 
                            step="any" 
                            className="w-12 bg-white border border-slate-300 rounded text-center font-black text-indigo-600 outline-none" 
                            value={el.stepValue ?? 1} 
                            onChange={e => update({ stepValue: parseFloat(e.target.value) || 1 })} 
                        />
                    </div>
                )}

                {/* Toggle Subnotches */}
                <button 
                    type="button"
                    onClick={() => update({ showSubnotches: !el.showSubnotches })} 
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        el.showSubnotches 
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs' 
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                    title={lang === 'sv' ? "Visa delstreck" : "Toggle subnotches"}
                >
                    <Hash size={15} />
                </button>

                <div className="w-px h-5 bg-slate-200 mx-0.5" />

                {/* Toggle Orientation */}
                <button 
                    type="button"
                    onClick={toggleOrientation} 
                    className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black uppercase transition-all cursor-pointer"
                >
                    {el.orientation === 'vertical' ? (t?.vertical || "Vertikal") : (t?.horizontal || "Horisontell")}
                </button>
            </div>
        );
    },

    // 🟢 Dual-argument resolution: Tool.render(el, options) and Tool.render(options)
    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { showUI = false, renderHandles = null } = options;

        if (!el) return null;

        const isVertical = el.orientation === 'vertical';
        const w = Number(el.width) || (isVertical ? 140 : 800);
        const h = Number(el.height) || (isVertical ? 800 : 140);
        const strokeColor = el.stroke || '#2563eb';

        const minVal = parseFloat(el.min) || 0;
        const maxVal = parseFloat(el.max) || 10;
        const rng = maxVal - minVal;

        // Safety fallback: ensure a positive display range
        const safeRng = rng > 0 ? rng : 10;
        const pxU = isVertical ? h / safeRng : w / safeRng;

        // Calculate step size based on unitType
        let step = 1;
        if (el.unitType === 'fraction') {
            step = 1 / (Number(el.denom) || 4);
        } else if (el.unitType === 'decimal') {
            step = Number(el.stepValue) || 0.5;
        } else {
            step = Number(el.stepValue) || 1;
        }

        if (step <= 0 || isNaN(step)) step = 1;
        if (safeRng / step > 200) step = safeRng / 200; // Prevent loop freezing on large spans

        const ticks = [];

        // Main Notches and Labels
        for (let i = 0; i <= safeRng + 0.0001; i += step) {
            const val = minVal + i;
            
            if (isVertical) {
                const yp = h - (i * pxU);
                ticks.push(
                    <line key={`m-${i}`} x1={40} y1={yp} x2={75} y2={yp} stroke="#0f172a" strokeWidth="3" />
                );

                if (el.unitType === 'fraction') {
                    const den = Number(el.denom) || 4;
                    const num = Math.round(val * den);
                    if (num % den === 0) {
                        ticks.push(
                            <text key={`l-${i}`} x={30} y={yp} textAnchor="end" dominantBaseline="central" fontSize="18" fontWeight="900" fill="#0f172a">
                                {num / den}
                            </text>
                        );
                    } else {
                        ticks.push(
                            <g key={`l-${i}`} transform={`translate(20, ${yp})`}>
                                <text x="-5" y="-10" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="900" fill="#0f172a">{num}</text>
                                <line x1="-15" y1="-1" x2="5" y2="-1" stroke="#0f172a" strokeWidth="2" />
                                <text x="-5" y="10" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="900" fill="#0f172a">{den}</text>
                            </g>
                        );
                    }
                } else if (el.unitType === 'decimal') {
                    const decLabel = parseFloat(val.toFixed(3)).toString();
                    ticks.push(
                        <text key={`l-${i}`} x={30} y={yp} textAnchor="end" dominantBaseline="central" fontSize="18" fontWeight="900" fill="#0f172a">
                            {decLabel}
                        </text>
                    );
                } else {
                    ticks.push(
                        <text key={`l-${i}`} x={30} y={yp} textAnchor="end" dominantBaseline="central" fontSize="18" fontWeight="900" fill="#0f172a">
                            {Math.round(val * 100) / 100}
                        </text>
                    );
                }
            } else {
                const xp = i * pxU;
                ticks.push(
                    <line key={`m-${i}`} x1={xp} y1={35} x2={xp} y2={70} stroke="#0f172a" strokeWidth="3" />
                );

                if (el.unitType === 'fraction') {
                    const den = Number(el.denom) || 4;
                    const num = Math.round(val * den);
                    if (num % den === 0) {
                        ticks.push(
                            <text key={`l-${i}`} x={xp} y={96} textAnchor="middle" fontSize="18" fontWeight="900" fill="#0f172a">
                                {num / den}
                            </text>
                        );
                    } else {
                        ticks.push(
                            <g key={`l-${i}`} transform={`translate(${xp}, ${88})`}>
                                <text x="0" y="-10" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0f172a">{num}</text>
                                <line x1="-10" y1="-1" x2="10" y2="-1" stroke="#0f172a" strokeWidth="2" />
                                <text x="0" y="10" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0f172a">{den}</text>
                            </g>
                        );
                    }
                } else if (el.unitType === 'decimal') {
                    const decLabel = parseFloat(val.toFixed(3)).toString();
                    ticks.push(
                        <text key={`l-${i}`} x={xp} y={96} textAnchor="middle" fontSize="18" fontWeight="900" fill="#0f172a">
                            {decLabel}
                        </text>
                    );
                } else {
                    ticks.push(
                        <text key={`l-${i}`} x={xp} y={96} textAnchor="middle" fontSize="18" fontWeight="900" fill="#0f172a">
                            {Math.round(val * 100) / 100}
                        </text>
                    );
                }
            }
        }

        // Subnotches (Minor Subdivisions)
        if (el.showSubnotches && safeRng > 0) {
            const subStepSize = el.unitType === 'fraction' ? step / 2 : step / 10;
            if (safeRng / subStepSize <= 400) {
                for (let i = 0; i <= safeRng + 0.0001; i += subStepSize) {
                    const rMod = i % step;
                    if (rMod > 0.001 && Math.abs(rMod - step) > 0.001) {
                        if (isVertical) {
                            const yp = h - (i * pxU);
                            ticks.push(<line key={`s-${i}`} x1={48} y1={yp} x2={68} y2={yp} stroke="#64748b" strokeWidth="1.5" opacity="0.6" />);
                        } else {
                            const xp = i * pxU;
                            ticks.push(<line key={`s-${i}`} x1={xp} y1={42} x2={xp} y2={62} stroke="#64748b" strokeWidth="1.5" opacity="0.6" />);
                        }
                    }
                }
            }
        }

        // Math Hop Visualizer (e.g. 2 + 3 or 8 - 4)
        const hops = [];
        const match = typeof el.equation === 'string' ? el.equation.match(/(\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)/) : null;
        if (match && safeRng > 0) {
            const startVal = parseFloat(match[1]);
            const op = match[2];
            const count = parseFloat(match[3]);
            const dir = op === '+' ? 1 : -1;
            const intCount = Math.min(25, Math.max(1, Math.floor(count)));

            if (isVertical) {
                const startY = h - ((startVal - minVal) * pxU);
                const yDir = dir === 1 ? -1 : 1;
                const totalHeight = count * pxU;
                const singleHopPx = totalHeight / intCount;

                for (let j = 0; j < intCount; j++) {
                    const y1 = startY + (j * yDir * singleHopPx);
                    const y2 = y1 + (yDir * singleHopPx);
                    const midY = (y1 + y2) / 2;
                    hops.push(<path key={`hop-${j}`} d={`M ${55} ${y1} Q ${105} ${midY} ${55} ${y2}`} fill="none" stroke={strokeColor} strokeWidth="3" strokeDasharray="6 4" />);
                    if (j === intCount - 1) {
                        hops.push(<path key="arrow" d={`M ${45} ${y2 - 5 * yDir} L ${55} ${y2} L ${65} ${y2 - 5 * yDir}`} fill="none" stroke={strokeColor} strokeWidth="3" />);
                    }
                }
                const labelY = startY + (totalHeight / 2) * yDir;
                hops.push(
                    <g key="lbl">
                        <rect x={80} y={labelY - 14} width={48} height={28} fill="#ffffff" rx={6} stroke={strokeColor} strokeWidth={1.5} />
                        <text x={104} y={labelY} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="900" fill={strokeColor}>
                            {op}{count}
                        </text>
                    </g>
                );
            } else {
                const totalWidth = count * pxU;
                const startX = (startVal - minVal) * pxU;
                const singleHopPx = totalWidth / intCount;

                for (let j = 0; j < intCount; j++) {
                    const x1 = startX + (j * dir * singleHopPx);
                    const x2 = x1 + (dir * singleHopPx);
                    const midX = (x1 + x2) / 2;
                    hops.push(<path key={`hop-${j}`} d={`M ${x1} ${35} Q ${midX} ${-25} ${x2} ${35}`} fill="none" stroke={strokeColor} strokeWidth="3" strokeDasharray="6 4" />);
                    if (j === intCount - 1) {
                        hops.push(<path key="arrow" d={`M ${x2 - 6 * dir} ${25} L ${x2} ${35} L ${x2 - 6 * dir} ${45}`} fill="none" stroke={strokeColor} strokeWidth="3" />);
                    }
                }
                const labelX = startX + (totalWidth / 2) * dir;
                hops.push(
                    <g key="lbl">
                        <rect x={labelX - 24} y={-45} width={48} height={28} fill="#ffffff" rx={6} stroke={strokeColor} strokeWidth={1.5} />
                        <text x={labelX} y={-31} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="900" fill={strokeColor}>
                            {op}{count}
                        </text>
                    </g>
                );
            }
        }

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y})`} 
                className="pointer-events-auto cursor-move select-none"
            >
                {/* Transparent Hit Boundary */}
                <rect x={0} y={0} width={w} height={h} fill="transparent" />

                {/* Main Axis Line */}
                {isVertical ? (
                    <line x1={55} y1={0} x2={55} y2={h} stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
                ) : (
                    <line x1={0} y1={52} x2={w} y2={52} stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
                )}

                {/* Ticks, Subnotches, and Math Hops */}
                {ticks}
                {hops}

                {/* Handles & Floating Controls */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el)}
                    </g>
                )}
            </g>
        );
    }
};

export default RulerTool;