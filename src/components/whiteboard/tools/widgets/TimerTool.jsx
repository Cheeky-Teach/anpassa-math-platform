// src/components/whiteboard/tools/widgets/TimerTool.jsx
import React from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, GripHorizontal, Timer, Clock } from 'lucide-react';

export const TimerTool = {
    type: 'timer',
    hasOptions: true,

    createDefault: (id, color = '#6366f1') => ({
        id,
        type: 'timer',
        x: 600,
        y: 280,
        width: 300,
        height: 300,
        duration: 300,
        timeLeft: 300,
        isRunning: false,
        timerMode: 'timer',
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv' }) => {
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
            <div className="flex items-center gap-2 font-sans text-xs select-none text-slate-800">
                {/* Play / Pause */}
                <button
                    type="button"
                    onClick={togglePlay}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black uppercase tracking-wider text-white transition-all cursor-pointer shadow-xs active:scale-95 ${
                        isRunning 
                            ? 'bg-amber-500 hover:bg-amber-600' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {isRunning ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                    <span>{isRunning ? (lang === 'sv' ? "Pausa" : "Pause") : (lang === 'sv' ? "Starta" : "Start")}</span>
                </button>

                {/* Reset */}
                <button
                    type="button"
                    onClick={resetTimer}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                    title={lang === 'sv' ? "Återställ" : "Reset"}
                >
                    <RotateCcw size={14} />
                </button>

                <div className="w-px h-5 bg-slate-200 mx-0.5" />

                {/* Time Steppers */}
                {!isStopwatch && (
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                            type="button"
                            onClick={() => adjustTime(-60)}
                            className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-black transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                        >
                            -1m
                        </button>
                        <button
                            type="button"
                            onClick={() => adjustTime(60)}
                            className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-black transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                        >
                            +1m
                        </button>
                        <button
                            type="button"
                            onClick={() => adjustTime(300)}
                            className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-black transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                        >
                            +5m
                        </button>
                    </div>
                )}

                {/* Mode Switcher */}
                <button
                    type="button"
                    onClick={toggleMode}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-2xs ${
                        isStopwatch 
                            ? 'bg-purple-600 text-white border-purple-700' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {isStopwatch ? <Clock size={13} /> : <Timer size={13} />}
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

        const w = Number(el.width) || 300;
        const r = w / 2;
        const cx = r;
        const cy = r;

        const isStopwatch = el.timerMode === 'stopwatch';
        const timeLeft = Math.max(0, Number(el.timeLeft) || 0);
        const duration = Math.max(1, Number(el.duration) || 300);
        const isDone = !isStopwatch && timeLeft === 0;

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const trackRadius = r * 0.82;
        const strokeW = Math.max(8, Math.round(r * 0.075));

        const progress = isStopwatch 
            ? ((timeLeft % 60) / 60) 
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

        // 🟢 Refined brand palette (Indigo active, Emerald ready, Rose done)
        const trackColor = isDone 
            ? '#ef4444' 
            : el.isRunning 
            ? (isStopwatch ? '#8b5cf6' : '#6366f1') 
            : '#10b981';

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}, ${r}, ${r})`} 
                className="select-none"
            >
                {/* Drag Handle */}
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
                        x={cx - 44} 
                        y={-26} 
                        width={88} 
                        height={22} 
                        rx={8} 
                        fill="#ffffff" 
                        stroke="#cbd5e1" 
                        strokeWidth={1.25}
                        className="group-hover:stroke-indigo-500 group-hover:fill-indigo-50/40 transition-colors shadow-2xs" 
                    />
                    <GripHorizontal size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" x={cx - 6} y={-21} />
                </g>

                {/* Drop shadow */}
                <circle cx={cx} cy={cy + 6} r={r} fill="#0f172a" fillOpacity="0.08" className="pointer-events-none" />

                {/* White Dial Body */}
                <circle 
                    cx={cx} 
                    cy={cy} 
                    r={r} 
                    fill={isDone ? "#fef2f2" : "#ffffff"} 
                    stroke={isDone ? "#ef4444" : "#cbd5e1"} 
                    strokeWidth={Math.max(2.5, r * 0.035)} 
                    filter="drop-shadow(0 8px 20px rgba(15, 23, 42, 0.08))"
                    className={`pointer-events-none ${isDone ? "animate-pulse" : ""}`}
                />

                {/* Track Ring */}
                <circle cx={cx} cy={cy} r={trackRadius} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} className="pointer-events-none" />

                {/* Progress Arc */}
                {arcPath && (
                    <path d={arcPath} fill="none" stroke={trackColor} strokeWidth={strokeW} strokeLinecap="round" className="pointer-events-none transition-all duration-300" />
                )}

                {/* Mode Pill */}
                <g transform={`translate(${cx}, ${cy - r * 0.42})`} className="pointer-events-none">
                    <rect 
                        x={-40} y={-10} width={80} height={20} rx={10} 
                        fill={isDone ? "#fee2e2" : "#f8fafc"} 
                        stroke={isDone ? "#fca5a5" : "#e2e8f0"} 
                        strokeWidth={1.2}
                    />
                    <text 
                        x={0} y={1} textAnchor="middle" dominantBaseline="central" 
                        fontSize={Math.max(9, r * 0.07)} fontWeight="900" 
                        fill={isDone ? "#dc2626" : "#64748b"} 
                        className="uppercase tracking-wider font-sans"
                    >
                        {isDone ? (lang === 'sv' ? "KLAR!" : "DONE!") : isStopwatch ? (lang === 'sv' ? "STOPPUR" : "STOPWATCH") : (lang === 'sv' ? "TIMER" : "TIMER")}
                    </text>
                </g>

                {/* Digital Counter */}
                <text 
                    x={cx} y={cy + 4} textAnchor="middle" dominantBaseline="central" 
                    fontSize={Math.max(32, r * 0.36)} fontWeight="900" 
                    fill={isDone ? "#ef4444" : "#0f172a"}
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                    className="pointer-events-none"
                >
                    {timeStr}
                </text>

                {/* Running state text */}
                <text 
                    x={cx} y={cy + r * 0.42} textAnchor="middle" dominantBaseline="central" 
                    fontSize={Math.max(10, r * 0.08)} fontWeight="900" 
                    fill={el.isRunning ? trackColor : "#94a3b8"}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    className="pointer-events-none uppercase tracking-wider"
                >
                    {el.isRunning ? (lang === 'sv' ? "RÄKNAR..." : "RUNNING...") : (lang === 'sv' ? "PAUSAD" : "PAUSED")}
                </text>

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