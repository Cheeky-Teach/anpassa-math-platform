// src/components/whiteboard/tools/widgets/PracticeClockTool.jsx
import React from 'react';
import { GripHorizontal, Eye, EyeOff, Cog, Plus, RotateCcw } from 'lucide-react';

// Generates authentic conversational time phrases in Swedish and English
const getSpokenTime = (hours, minutes, lang = 'sv') => {
    const h12 = hours % 12 || 12;
    const nextH12 = (h12 % 12) + 1;

    const svNumbers = [
        '', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 
        'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'
    ];
    const enNumbers = [
        '', 'one', 'two', 'three', 'four', 'five', 'six', 
        'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'
    ];

    const curNameSv = svNumbers[h12];
    const nextNameSv = svNumbers[nextH12];
    const curNameEn = enNumbers[h12];
    const nextNameEn = enNumbers[nextH12];

    if (lang === 'sv') {
        if (minutes === 0) return `Klockan är ${curNameSv}`;
        if (minutes === 5) return `Fem över ${curNameSv}`;
        if (minutes === 10) return `Tio över ${curNameSv}`;
        if (minutes === 15) return `Kvart över ${curNameSv}`;
        if (minutes === 20) return `Tjugo över ${curNameSv}`;
        if (minutes === 25) return `Fem i halv ${nextNameSv}`;
        if (minutes === 30) return `Halv ${nextNameSv}`;
        if (minutes === 35) return `Fem över halv ${nextNameSv}`;
        if (minutes === 40) return `Tjugo i ${nextNameSv}`;
        if (minutes === 45) return `Kvart i ${nextNameSv}`;
        if (minutes === 50) return `Tio i ${nextNameSv}`;
        if (minutes === 55) return `Fem i ${nextNameSv}`;
        return `${minutes} minuter över ${curNameSv}`;
    }

    // English
    if (minutes === 0) return `${curNameEn} o'clock`;
    if (minutes === 15) return `Quarter past ${curNameEn}`;
    if (minutes === 30) return `Half past ${curNameEn}`;
    if (minutes === 45) return `Quarter to ${nextNameEn}`;
    if (minutes < 30) return `${minutes} past ${curNameEn}`;
    return `${60 - minutes} to ${nextNameEn}`;
};

export const PracticeClockTool = {
    type: 'clock',
    hasOptions: true,

    createDefault: (id, color = '#4f46e5') => ({
        id,
        type: 'clock',
        x: 600,
        y: 260,
        width: 320,
        height: 320,
        hour: 10,
        minute: 10,
        isGeared: true,          // When true, minute dragging advances hour hand
        showMinuteTicks: true,   // Outer 05, 10, 15... 60 numbers
        showDigital: true,       // Shows digital/spoken time pill
        hideAnswer: false,       // For guessing exercises
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv', t }) => {
        const isGeared = el.isGeared !== false;
        const showMinuteTicks = el.showMinuteTicks !== false;
        const hideAnswer = Boolean(el.hideAnswer);

        const addMinutes = (delta) => {
            setElements(prev => prev.map(o => {
                if (o.id !== el.id) return o;
                const totalMins = (Number(o.hour) || 12) * 60 + (Number(o.minute) || 0) + delta;
                const positiveMins = (totalMins % 720 + 720) % 720;
                const nextHour = Math.floor(positiveMins / 60) || 12;
                const nextMinute = positiveMins % 60;
                return { ...o, hour: nextHour, minute: nextMinute };
            }));
        };

        const toggleGeared = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, isGeared: !isGeared } : o));
        };

        const toggleMinuteTicks = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, showMinuteTicks: !showMinuteTicks } : o));
        };

        const toggleHideAnswer = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, hideAnswer: !hideAnswer } : o));
        };

        const resetToNoon = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, hour: 12, minute: 0 } : o));
        };

        return (
            <div 
                className="flex items-center gap-2 font-sans font-bold text-sm select-none !text-slate-900" 
                style={{ color: '#0f172a' }}
            >
                {/* 1. Reset */}
                <button
                    type="button"
                    onClick={resetToNoon}
                    className="p-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
                    title={lang === 'sv' ? "Nollställ till 12:00" : "Reset to 12:00"}
                >
                    <RotateCcw size={14} />
                </button>

                {/* 2. Geared Mode Toggle */}
                <button
                    type="button"
                    onClick={toggleGeared}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        isGeared
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={lang === 'sv' ? "Kuggväxel: Timmvisaren följer minutvisaren" : "Geared: Hour hand tracks minutes"}
                >
                    <Cog size={14} className={isGeared ? "animate-spin-slow" : ""} />
                    <span>{lang === 'sv' ? "Kuggväxel" : "Geared"}</span>
                </button>

                {/* 3. 5-Minute Ring Toggle */}
                <button
                    type="button"
                    onClick={toggleMinuteTicks}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        showMinuteTicks
                            ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={lang === 'sv' ? "Visa/dölj minutsiffror (5, 10, 15...)" : "Show/hide minute numerals"}
                >
                    <span>:05</span>
                    <span>{lang === 'sv' ? "Minuter" : "Minutes"}</span>
                </button>

                <div className="w-px h-6 bg-slate-200 mx-0.5" />

                {/* 4. Peek / Hide Answer for Student Practice */}
                <button
                    type="button"
                    onClick={toggleHideAnswer}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        hideAnswer
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={lang === 'sv' ? "Dölj digital klocka för övning" : "Hide digital time for practice"}
                >
                    {hideAnswer ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{hideAnswer ? (lang === 'sv' ? "Dold" : "Hidden") : (lang === 'sv' ? "Facit" : "Reveal")}</span>
                </button>

                {/* 5. Stepper Increment Chips */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                        type="button"
                        onClick={() => addMinutes(5)}
                        className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                    >
                        +5m
                    </button>
                    <button
                        type="button"
                        onClick={() => addMinutes(15)}
                        className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                    >
                        +15m
                    </button>
                    <button
                        type="button"
                        onClick={() => addMinutes(30)}
                        className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                    >
                        +30m
                    </button>
                </div>
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
            getCoordinates = null
        } = options;

        if (!el) return null;

        const w = Number(el.width) || 320;
        const r = w / 2;
        const cx = r;
        const cy = r;

        const isGeared = el.isGeared !== false;
        const showMinuteTicks = el.showMinuteTicks !== false;
        const hideAnswer = Boolean(el.hideAnswer);

        // Normalize time state
        const currentH = Number(el.hour) || 12;
        const currentM = Number(el.minute) || 0;

        // Visual hand rotation angles
        const minRotation = currentM * 6;
        const hrRotation = isGeared 
            ? ((currentH % 12) * 30 + currentM * 0.5) 
            : ((currentH % 12) * 30);

        const timeDigits = `${currentH}:${currentM.toString().padStart(2, '0')}`;
        const spokenPhrase = getSpokenTime(currentH, currentM, lang);

        // REM-scaling metrics
        const hourNumSize = Math.max(14, Math.round(r * 0.17));
        const minNumSize = Math.max(8, Math.round(r * 0.08));
        const hourColor = '#3730a3'; // Indigo-800 for hour elements
        const minColor = '#0284c7';  // Sky-600 for minute elements

        // Draggable Minute Hand Handle
        const handleMinPointerDown = (e) => {
            e.stopPropagation();
            if (setSelectedId) setSelectedId(el.id);

            const onPointerMove = (ev) => {
                if (!getCoordinates || !setElements) return;
                const coords = getCoordinates(ev, false);
                const dx = coords.x - (el.x + r);
                const dy = coords.y - (el.y + r);
                let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                if (deg < 0) deg += 360;

                // Snap to nearest minute (6 deg increments)
                let mins = Math.round(deg / 6) % 60;

                setElements(prev => prev.map(o => {
                    if (o.id !== el.id) return o;
                    if (!isGeared) {
                        return { ...o, minute: mins };
                    }
                    // In geared mode, crossing 12 advances/retards hour
                    let prevM = Number(o.minute) || 0;
                    let curH = Number(o.hour) || 12;

                    if (prevM > 45 && mins < 15) {
                        curH = (curH % 12) + 1;
                    } else if (prevM < 15 && mins > 45) {
                        curH = curH - 1 < 1 ? 12 : curH - 1;
                    }
                    return { ...o, minute: mins, hour: curH };
                }));
            };

            const onPointerUp = () => {
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
            };

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        };

        // Draggable Hour Hand Handle
        const handleHourPointerDown = (e) => {
            e.stopPropagation();
            if (setSelectedId) setSelectedId(el.id);

            const onPointerMove = (ev) => {
                if (!getCoordinates || !setElements) return;
                const coords = getCoordinates(ev, false);
                const dx = coords.x - (el.x + r);
                const dy = coords.y - (el.y + r);
                let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                if (deg < 0) deg += 360;

                let hr = Math.round(deg / 30);
                if (hr === 0) hr = 12;

                setElements(prev => prev.map(o => o.id === el.id ? { ...o, hour: hr } : o));
            };

            const onPointerUp = () => {
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
            };

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        };

        // Hand tip positions for grab bulbs
        const hrHandLen = r * 0.52;
        const minHandLen = r * 0.74;

        const hrTipX = cx + hrHandLen * Math.sin((hrRotation * Math.PI) / 180);
        const hrTipY = cy - hrHandLen * Math.cos((hrRotation * Math.PI) / 180);

        const minTipX = cx + minHandLen * Math.sin((minRotation * Math.PI) / 180);
        const minTipY = cy - minHandLen * Math.cos((minRotation * Math.PI) / 180);

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

                {/* 2. Extrusion Base Shadow */}
                <circle cx={cx} cy={cy + 8} r={r} fill="#0f172a" fillOpacity="0.16" className="pointer-events-none" />

                {/* 3. Physical White Acrylic Dial Body */}
                <circle 
                    cx={cx} 
                    cy={cy} 
                    r={r} 
                    fill="#ffffff" 
                    stroke="#0f172a" 
                    strokeWidth={Math.max(3, r * 0.05)} 
                    filter="drop-shadow(0 10px 25px rgba(15, 23, 42, 0.12))"
                    className="pointer-events-none" 
                />

                {/* 4. Quarter-Hour Colored Quadrants (Subtle pedagogical guide) */}
                <circle cx={cx} cy={cy} r={r * 0.94} fill="none" stroke="#f8fafc" strokeWidth={r * 0.05} className="pointer-events-none" />

                {/* 5. Minute Ticks & Outer 5-Minute Numbers */}
                <g className="pointer-events-none">
                    {Array.from({ length: 60 }).map((_, i) => {
                        const a = i * 6 * (Math.PI / 180);
                        const isMajor = i % 5 === 0;
                        const tickLen = isMajor ? r * 0.09 : r * 0.045;
                        const outerR = r * 0.94;

                        return (
                            <line 
                                key={`tick-${i}`}
                                x1={cx + (outerR - tickLen) * Math.sin(a)}
                                y1={cy - (outerR - tickLen) * Math.cos(a)}
                                x2={cx + outerR * Math.sin(a)}
                                y2={cy - outerR * Math.cos(a)}
                                stroke={isMajor ? minColor : '#cbd5e1'}
                                strokeWidth={isMajor ? 2.5 : 1.2}
                                strokeLinecap="round"
                            />
                        );
                    })}

                    {/* Outer 5-Minute Numbers (:00, :05, :10...) */}
                    {showMinuteTicks && Array.from({ length: 12 }).map((_, i) => {
                        const mins = i * 5;
                        const a = i * 30 * (Math.PI / 180);
                        const dist = r * 0.86;
                        return (
                            <text
                                key={`min-num-${i}`}
                                x={cx + dist * Math.sin(a)}
                                y={cy - dist * Math.cos(a)}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={minNumSize}
                                fontWeight="900"
                                fill={minColor}
                                fontFamily="system-ui, sans-serif"
                            >
                                {mins.toString().padStart(2, '0')}
                            </text>
                        );
                    })}

                    {/* Inner 1-12 Hour Numbers */}
                    {Array.from({ length: 12 }).map((_, i) => {
                        const hr = i === 0 ? 12 : i;
                        const a = i * 30 * (Math.PI / 180);
                        const dist = r * (showMinuteTicks ? 0.68 : 0.74);

                        return (
                            <text
                                key={`hr-num-${i}`}
                                x={cx + dist * Math.sin(a)}
                                y={cy - dist * Math.cos(a)}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={hourNumSize}
                                fontWeight="900"
                                fill={hourColor}
                                fontFamily="system-ui, -apple-system, sans-serif"
                            >
                                {hr}
                            </text>
                        );
                    })}
                </g>

                {/* 6. Hour Hand (Deep Indigo) */}
                <g className="pointer-events-none">
                    <line 
                        x1={cx} 
                        y1={cy} 
                        x2={hrTipX} 
                        y2={hrTipY} 
                        stroke={hourColor} 
                        strokeWidth={Math.max(6, r * 0.065)} 
                        strokeLinecap="round" 
                    />
                </g>

                {/* Interactive Hour Grab Bulb */}
                <g 
                    transform={`translate(${hrTipX}, ${hrTipY})`} 
                    className="cursor-grab active:cursor-grabbing group pointer-events-auto"
                    onPointerDown={handleHourPointerDown}
                >
                    <circle cx={0} cy={0} r={14} fill={hourColor} fillOpacity="0.2" className="group-hover:scale-125 transition-transform" />
                    <circle cx={0} cy={0} r={7.5} fill="#ffffff" stroke={hourColor} strokeWidth={3} className="shadow-md" />
                </g>

                {/* 7. Minute Hand (Sky Blue) */}
                <g className="pointer-events-none">
                    <line 
                        x1={cx} 
                        y1={cy} 
                        x2={minTipX} 
                        y2={minTipY} 
                        stroke={minColor} 
                        strokeWidth={Math.max(4, r * 0.045)} 
                        strokeLinecap="round" 
                    />
                </g>

                {/* Interactive Minute Grab Bulb */}
                <g 
                    transform={`translate(${minTipX}, ${minTipY})`} 
                    className="cursor-grab active:cursor-grabbing group pointer-events-auto"
                    onPointerDown={handleMinPointerDown}
                >
                    <circle cx={0} cy={0} r={16} fill={minColor} fillOpacity="0.25" className="group-hover:scale-125 transition-transform" />
                    <circle cx={0} cy={0} r={8.5} fill="#ffffff" stroke={minColor} strokeWidth={3} className="shadow-md" />
                </g>

                {/* Center Pivot Rivet */}
                <circle cx={cx} cy={cy} r={r * 0.045} fill="#0f172a" className="pointer-events-none" />
                <circle cx={cx} cy={cy} r={r * 0.02} fill="#ffffff" className="pointer-events-none" />

                {/* 8. Synchronized Floating Digital & Spoken Time Pill */}
                {el.showDigital !== false && (
                    <foreignObject 
                        x={cx - 110} 
                        y={cy + r + 14} 
                        width={220} 
                        height={64} 
                        className="pointer-events-auto overflow-visible select-none"
                    >
                        <div className="w-full flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border-2 border-slate-200/90 shadow-lg px-4 py-1.5 rounded-2xl w-max">
                                {/* Digital Readout */}
                                <span 
                                    style={{ fontSize: 'clamp(1rem, 0.9rem + 0.4vw, 1.35rem)' }} 
                                    className="font-mono font-black text-slate-900 tracking-tight"
                                >
                                    {hideAnswer ? '?? : ??' : timeDigits}
                                </span>
                            </div>

                            {/* Spoken Language Vernacular Badge */}
                            {!hideAnswer && (
                                <span 
                                    style={{ fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.95rem)' }} 
                                    className="font-bold text-slate-600 mt-1.5 bg-slate-100/90 border border-slate-200/80 px-2.5 py-0.5 rounded-lg shadow-2xs whitespace-nowrap text-center"
                                >
                                    {spokenPhrase}
                                </span>
                            )}
                        </div>
                    </foreignObject>
                )}

                {/* 9. Standard Whiteboard Selection Handles (Rotation disabled) */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, r, { canRotate: false })}
                    </g>
                )}
            </g>
        );
    }
};

export default PracticeClockTool;