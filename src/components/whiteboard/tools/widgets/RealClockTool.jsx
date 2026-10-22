// src/components/whiteboard/tools/widgets/RealClockTool.jsx
import React from 'react';
import { GripHorizontal, Clock, Hash } from 'lucide-react';

export const RealClockTool = {
    type: 'realClock',
    hasOptions: true,

    createDefault: (id, color = '#3b82f6') => ({
        id,
        type: 'realClock',
        x: 600,
        y: 300,
        width: 280,
        height: 280,
        stroke: color,
        rotation: 0,
        opacity: 1,
        clockType: 'analog' // 'analog' | 'digital'
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv', t }) => {
        const isAnalog = el.clockType !== 'digital';

        const toggleClockType = () => {
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                clockType: isAnalog ? 'digital' : 'analog'
            } : o));
        };

        return (
            <div 
                className="flex items-center gap-2.5 font-sans font-bold text-sm select-none !text-slate-900" 
                style={{ color: '#0f172a' }}
            >
                <button
                    type="button"
                    onClick={toggleClockType}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 font-black text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-95"
                    title={lang === 'sv' ? "Växla mellan analog och digital klocka" : "Toggle analog and digital clock"}
                >
                    {isAnalog ? <Hash size={14} className="text-indigo-600" /> : <Clock size={14} className="text-indigo-600" />}
                    <span>{isAnalog ? (lang === 'sv' ? "Visa Digital" : "Show Digital") : (lang === 'sv' ? "Visa Analog" : "Show Analog")}</span>
                </button>
            </div>
        );
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { 
            lang = 'sv', 
            currentTime = new Date(),
            showUI = false, 
            renderHandles = null, 
            setSelectedId = null,
            setInteractionMode = null,
            setIsDrawing = null,
            setDragOffset = null,
            getCoordinates = null
        } = options;

        if (!el) return null;

        const w = Number(el.width) || 280;
        const r = w / 2;
        const cx = r;
        const cy = r;
        const isAnalog = el.clockType !== 'digital';

        const now = currentTime instanceof Date && !isNaN(currentTime) ? currentTime : new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();

        const secRot = s * 6;
        const minRot = m * 6 + s * 0.1;
        const hrRot = (h % 12) * 30 + m * 0.5;

        const timeString = now.toLocaleTimeString(lang === 'sv' ? 'sv-SE' : 'en-US', { 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });

        const fontFam = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y})`} 
                className="select-none"
            >
                {/* 1. Standardized Tactile Tray Drag Handle Bar */}
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
                        x={cx - 45} 
                        y={-28} 
                        width={90} 
                        height={24} 
                        rx={10} 
                        fill="#f8fafc" 
                        stroke="#cbd5e1" 
                        strokeWidth={1.5}
                        className="group-hover:stroke-indigo-400 group-hover:fill-indigo-50/50 transition-colors shadow-xs" 
                    />
                    <GripHorizontal size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" x={cx - 7} y={-23} />
                </g>

                {isAnalog ? (
                    /* ANALOG CLOCK DESIGN */
                    <g className="pointer-events-none">
                        {/* 3D Extruded Drop Shadow Base */}
                        <circle cx={cx} cy={cy + 6} r={r} fill="#0f172a" fillOpacity="0.18" />

                        {/* Physical Bezel & Dial Face */}
                        <circle 
                            cx={cx} 
                            cy={cy} 
                            r={r} 
                            fill="#ffffff" 
                            stroke="#0f172a" 
                            strokeWidth={Math.max(3, r * 0.05)} 
                            filter="drop-shadow(0 8px 24px rgba(15, 23, 42, 0.12))"
                        />
                        <circle cx={cx} cy={cy} r={r * 0.94} fill="none" stroke="#f1f5f9" strokeWidth={r * 0.04} />

                        {/* Minute Ticks */}
                        {Array.from({ length: 60 }).map((_, i) => {
                            if (i % 5 === 0) return null;
                            const angle = i * 6 * (Math.PI / 180);
                            const dist = r * 0.84;
                            return (
                                <circle 
                                    key={i} 
                                    cx={cx + dist * Math.sin(angle)} 
                                    cy={cy - dist * Math.cos(angle)} 
                                    r={Math.max(1.2, r * 0.012)} 
                                    fill="#94a3b8" 
                                />
                            );
                        })}

                        {/* Major Hour Markers & Numbers */}
                        {Array.from({ length: 12 }).map((_, i) => {
                            const hr = i === 0 ? 12 : i;
                            const angle = i * 30 * (Math.PI / 180);
                            const dist = r * 0.74;
                            const tickDist = r * 0.88;

                            return (
                                <React.Fragment key={`hr-group-${i}`}>
                                    {/* 5-minute Pill Hash */}
                                    <line
                                        x1={cx + tickDist * Math.sin(angle)}
                                        y1={cy - tickDist * Math.cos(angle)}
                                        x2={cx + (r * 0.83) * Math.sin(angle)}
                                        y2={cy - (r * 0.83) * Math.cos(angle)}
                                        stroke="#0f172a"
                                        strokeWidth={Math.max(2, r * 0.025)}
                                        strokeLinecap="round"
                                    />
                                    {/* Hour Number */}
                                    <text 
                                        x={cx + dist * Math.sin(angle)} 
                                        y={cy - dist * Math.cos(angle)} 
                                        textAnchor="middle" 
                                        dominantBaseline="central" 
                                        fontSize={r * 0.19} 
                                        fontWeight="900" 
                                        fill="#0f172a" 
                                        fontFamily={fontFam}
                                    >
                                        {hr}
                                    </text>
                                </React.Fragment>
                            );
                        })}

                        {/* Hour Hand */}
                        <g transform={`rotate(${hrRot}, ${cx}, ${cy})`}>
                            {/* Counter-weight shadow */}
                            <line x1={cx} y1={cy + r * 0.12} x2={cx} y2={cy - r * 0.48} stroke="#0f172a" strokeWidth={r * 0.065} strokeLinecap="round" />
                        </g>

                        {/* Minute Hand */}
                        <g transform={`rotate(${minRot}, ${cx}, ${cy})`}>
                            <line x1={cx} y1={cy + r * 0.15} x2={cx} y2={cy - r * 0.72} stroke="#3b82f6" strokeWidth={r * 0.045} strokeLinecap="round" />
                        </g>

                        {/* Second Hand & Center Pivot */}
                        <g transform={`rotate(${secRot}, ${cx}, ${cy})`}>
                            <line x1={cx} y1={cy + r * 0.2} x2={cx} y2={cy - r * 0.8} stroke="#ef4444" strokeWidth={r * 0.018} strokeLinecap="round" />
                            <circle cx={cx} cy={cy} r={r * 0.045} fill="#ef4444" />
                            <circle cx={cx} cy={cy} r={r * 0.02} fill="#ffffff" />
                        </g>
                    </g>
                ) : (
                    /* DIGITAL CLOCK DESIGN */
                    <g className="pointer-events-none">
                        {/* 3D Extruded Drop Shadow Base */}
                        <rect 
                            x={cx - r * 1.05} 
                            y={cy - r * 0.42 + 6} 
                            width={r * 2.1} 
                            height={r * 0.84} 
                            rx={24} 
                            fill="#0f172a" 
                            fillOpacity="0.25" 
                        />

                        {/* Dark Acrylic Chassis */}
                        <rect 
                            x={cx - r * 1.05} 
                            y={cy - r * 0.42} 
                            width={r * 2.1} 
                            height={r * 0.84} 
                            fill="#0f172a" 
                            rx={24} 
                            stroke="#334155" 
                            strokeWidth={3} 
                            filter="drop-shadow(0 10px 25px rgba(0,0,0,0.2))"
                        />

                        {/* Recessed Screen Interior */}
                        <rect 
                            x={cx - r * 0.95} 
                            y={cy - r * 0.32} 
                            width={r * 1.9} 
                            height={r * 0.64} 
                            fill="#020617" 
                            rx={16} 
                            stroke="#1e293b" 
                            strokeWidth={2}
                        />

                        {/* Digital LED Readout */}
                        <text 
                            x={cx} 
                            y={cy + 1} 
                            textAnchor="middle" 
                            dominantBaseline="central" 
                            fontSize={r * 0.34} 
                            fontWeight="900" 
                            fill="#10b981" 
                            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" 
                            style={{ letterSpacing: '0.04em' }}
                        >
                            {timeString}
                        </text>
                    </g>
                )}

                {/* 2. Standard Whiteboard Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, r)}
                    </g>
                )}
            </g>
        );
    }
};

export default RealClockTool;