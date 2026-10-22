// src/components/whiteboard/tools/widgets/TimerTool.jsx
import React from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, GripHorizontal, Timer, Clock } from 'lucide-react';

export const TimerTool = {
    type: 'timer',
    hasOptions: true,

    createDefault: (id, color = '#10b981') => ({
        id,
        type: 'timer',
        x: 600,
        y: 280,
        width: 320,
        height: 320,
        duration: 300,        // Default 5 minutes (in seconds)
        timeLeft: 300,
        isRunning: false,
        timerMode: 'timer',  // 'timer' | 'stopwatch'
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv', t }) => {
        const isRunning = Boolean(el.isRunning);
        const isStopwatch = el.timerMode === 'stopwatch';

        const togglePlay = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, isRunning: !o.isRunning } : o));
        };

        const resetTimer = () => {
            setElements(prev => prev.map(o => {
                if (o.id !== el.id) return o;
                return {
                    ...o,
                    isRunning: false,
                    timeLeft: isStopwatch ? 0 : (o.duration || 300)
                };
            }));
        };

        const adjustTime = (seconds) => {
            setElements(prev => prev.map(o => {
                if (o.id !== el.id) return o;
                if (isStopwatch) {
                    const nextTime = Math.max(0, (o.timeLeft || 0) + seconds);
                    return { ...o, timeLeft: nextTime };
                }
                const nextDuration = Math.max(10, (o.duration || 300) + seconds);
                const nextTime = Math.max(0, (o.timeLeft || 0) + seconds);
                return { ...o, duration: nextDuration, timeLeft: nextTime };
            }));
        };

        const toggleMode = () => {
            setElements(prev => prev.map(o => {
                if (o.id !== el.id) return o;
                const nextMode = isStopwatch ? 'timer' : 'stopwatch';
                return {
                    ...o,
                    timerMode: nextMode,
                    isRunning: false,
                    timeLeft: nextMode === 'stopwatch' ? 0 : (o.duration || 300)
                };
            }));
        };

        return (
            <div 
                className="flex items-center gap-2.5 font-sans font-bold text-sm select-none !text-slate-900" 
                style={{ color: '#0f172a' }}
            >
                {/* 1. Play / Pause Action */}
                <button
                    type="button"
                    onClick={togglePlay}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl border font-black text-xs uppercase tracking-wider text-white transition-all cursor-pointer shadow-sm active:scale-95 ${
                        isRunning 
                            ? 'bg-amber-500 hover:bg-amber-400 border-amber-600' 
                            : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-700'
                    }`}
                >
                    {isRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    <span>{isRunning ? (lang === 'sv' ? "Pausa" : "Pause") : (lang === 'sv' ? "Starta" : "Start")}</span>
                </button>

                {/* 2. Reset Button */}
                <button
                    type="button"
                    onClick={resetTimer}
                    className="p-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
                    title={lang === 'sv' ? "Återställ" : "Reset"}
                >
                    <RotateCcw size={15} />
                </button>

                <div className="w-px h-6 bg-slate-200 mx-0.5" />

                {/* 3. Time Steppers (Only visible for Timer countdown) */}
                {!isStopwatch && (
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        <button
                            type="button"
                            onClick={() => adjustTime(-60)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                            title={lang === 'sv' ? "Minska 1 minut" : "Minus 1 minute"}
                        >
                            -1m
                        </button>
                        <button
                            type="button"
                            onClick={() => adjustTime(60)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                            title={lang === 'sv' ? "Öka 1 minut" : "Plus 1 minute"}
                        >
                            +1m
                        </button>
                        <button
                            type="button"
                            onClick={() => adjustTime(300)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                            title={lang === 'sv' ? "Öka 5 minuter" : "Plus 5 minutes"}
                        >
                            +5m
                        </button>
                    </div>
                )}

                {/* 4. Timer vs Stopwatch Switcher */}
                <button
                    type="button"
                    onClick={toggleMode}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        isStopwatch 
                            ? 'bg-purple-600 text-white border-purple-700 shadow-sm' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={lang === 'sv' ? "Växla mellan timer och stoppur" : "Toggle timer / stopwatch"}
                >
                    {isStopwatch ? <Clock size={14} /> : <Timer size={14} />}
                    <span>{isStopwatch ? (lang === 'sv' ? "Stoppur" : "Stopwatch") : (lang === 'sv' ? "Timer" : "Timer")}</span>
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

        const isStopwatch = el.timerMode === 'stopwatch';
        const timeLeft = Math.max(0, Number(el.timeLeft) || 0);
        const duration = Math.max(1, Number(el.duration) || 300);
        const isDone = !isStopwatch && timeLeft === 0;

        // Digital display string
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Circular track calculation
        const trackRadius = r * 0.82;
        const strokeW = Math.max(8, Math.round(r * 0.08));

        // Progress fraction (0 to 1)
        const progress = isStopwatch 
            ? ((timeLeft % 60) / 60) // Rotates every minute in stopwatch mode
            : (timeLeft / duration);

        const progDeg = Math.max(0, Math.min(360, progress * 360));
        const progRad = (progDeg * Math.PI) / 180;
        const endX = cx + trackRadius * Math.sin(progRad);
        const endY = cy - trackRadius * Math.cos(progRad);

        const isFull = progDeg >= 359.9;
        const arcPath = progDeg <= 0 
            ? "" 
            : isFull 
            ? `M ${cx} ${cy - trackRadius} A ${trackRadius} ${trackRadius} 0 1 1 ${cx - 0.01} ${cy - trackRadius}` 
            : `M ${cx} ${cy - trackRadius} A ${trackRadius} ${trackRadius} 0 ${progDeg > 180 ? 1 : 0} 1 ${endX} ${endY}`;

        // Active theme palette
        const trackColor = isDone 
            ? '#ef4444' 
            : el.isRunning 
            ? (isStopwatch ? '#8b5cf6' : '#10b981') 
            : '#f59e0b';

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}, ${r}, ${r})`} 
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
                        x={cx - 50} 
                        y={-28} 
                        width={100} 
                        height={24} 
                        rx={10} 
                        fill="#f8fafc" 
                        stroke="#cbd5e1" 
                        strokeWidth={1.5}
                        className="group-hover:stroke-indigo-400 group-hover:fill-indigo-50/50 transition-colors shadow-xs" 
                    />
                    <GripHorizontal size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" x={cx - 7} y={-23} />
                </g>

                {/* 2. Extrusion Drop Shadow Base */}
                <circle 
                    cx={cx} 
                    cy={cy + 8} 
                    r={r} 
                    fill="#0f172a" 
                    fillOpacity="0.18" 
                    className="pointer-events-none" 
                />

                {/* 3. Physical White Acrylic Dial Body */}
                <circle 
                    cx={cx} 
                    cy={cy} 
                    r={r} 
                    fill={isDone ? "#fef2f2" : "#ffffff"} 
                    stroke={isDone ? "#ef4444" : "#0f172a"} 
                    strokeWidth={Math.max(3, r * 0.045)} 
                    filter="drop-shadow(0 10px 25px rgba(15, 23, 42, 0.12))"
                    className={`pointer-events-none ${isDone ? "animate-pulse" : ""}`}
                />

                {/* 4. Background Inset Track Ring */}
                <circle 
                    cx={cx} 
                    cy={cy} 
                    r={trackRadius} 
                    fill="none" 
                    stroke="#f1f5f9" 
                    strokeWidth={strokeW} 
                    className="pointer-events-none"
                />

                {/* 5. Active Progress Ring Arc */}
                {arcPath && (
                    <path 
                        d={arcPath} 
                        fill="none" 
                        stroke={trackColor} 
                        strokeWidth={strokeW} 
                        strokeLinecap="round" 
                        className="pointer-events-none transition-all duration-300"
                    />
                )}

                {/* 6. Mode & Status Indicator Pill */}
                <g transform={`translate(${cx}, ${cy - r * 0.42})`} className="pointer-events-none">
                    <rect 
                        x={-45} 
                        y={-12} 
                        width={90} 
                        height={24} 
                        rx={12} 
                        fill={isDone ? "#fee2e2" : "#f8fafc"} 
                        stroke={isDone ? "#fca5a5" : "#e2e8f0"} 
                        strokeWidth={1.5}
                    />
                    <text 
                        x={0} 
                        y={1} 
                        textAnchor="middle" 
                        dominantBaseline="central" 
                        fontSize={Math.max(9, r * 0.075)} 
                        fontWeight="900" 
                        fill={isDone ? "#dc2626" : "#64748b"} 
                        className="uppercase tracking-widest font-sans"
                    >
                        {isDone 
                            ? (lang === 'sv' ? "KLAR!" : "DONE!") 
                            : isStopwatch 
                            ? (lang === 'sv' ? "STOPPUR" : "STOPWATCH") 
                            : (lang === 'sv' ? "TIMER" : "TIMER")}
                    </text>
                </g>

                {/* 7. Scaled Primary Digital Counter */}
                <text 
                    x={cx} 
                    y={cy + 4} 
                    textAnchor="middle" 
                    dominantBaseline="central" 
                    fontSize={Math.max(34, r * 0.38)} 
                    fontWeight="900" 
                    fill={isDone ? "#ef4444" : "#0f172a"}
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                    className="pointer-events-none"
                >
                    {timeStr}
                </text>

                {/* 8. Subtitle / Running State Text */}
                <text 
                    x={cx} 
                    y={cy + r * 0.42} 
                    textAnchor="middle" 
                    dominantBaseline="central" 
                    fontSize={Math.max(10, r * 0.085)} 
                    fontWeight="900" 
                    fill={el.isRunning ? trackColor : "#94a3b8"}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    className="pointer-events-none uppercase tracking-wider"
                >
                    {el.isRunning 
                        ? (lang === 'sv' ? "RÄKNAR..." : "RUNNING...") 
                        : (lang === 'sv' ? "PAUSAD" : "PAUSED")}
                </text>

                {/* 9. Standard Whiteboard Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, r)}
                    </g>
                )}
            </g>
        );
    }
};

export default TimerTool;