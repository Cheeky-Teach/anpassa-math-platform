// src/components/whiteboard/tools/widgets/TimerTool.jsx
import React from 'react';
import { Play, RefreshCw } from 'lucide-react';

export const TimerTool = {
    type: 'timer',
    hasOptions: false,

    createDefault: (id, color) => ({
        id,
        type: 'timer',
        x: 600,
        y: 300,
        width: 360,
        height: 360,
        duration: 60,
        timeLeft: 60,
        isRunning: false,
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    render: ({ el, transform, showUI, renderHandles, setElements }) => {
        const r = el.width / 2;
        const cx = el.x + r;
        const cy = el.y + r;
        const isDone = el.timeLeft === 0;
        const timeStr = `${Math.floor(el.timeLeft / 60)}:${(el.timeLeft % 60).toString().padStart(2, '0')}`;
        const prog = el.duration > 0 ? (el.timeLeft / el.duration) * 360 : 0;
        
        const isFull = prog >= 360;
        const endAngle = (prog * Math.PI) / 180;
        const endX = cx + r * Math.sin(endAngle);
        const endY = cy - r * Math.cos(endAngle);
        
        const pathData = prog <= 0 
            ? "" 
            : isFull 
                ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}` 
                : `M ${cx} ${cy - r} A ${r} ${r} 0 ${prog > 180 ? 1 : 0} 1 ${endX} ${endY}`;

        return (
            <React.Fragment key={el.id}>
                <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                    <circle cx={cx} cy={cy} r={r} fill={isDone ? "#fee2e2" : "#e0f2fe"} stroke={isDone ? "#ef4444" : "#3b82f6"} strokeWidth="4" />
                    <path 
                        d={pathData} 
                        fill="none" 
                        stroke={isDone ? "#ef4444" : "#10b981"} 
                        strokeWidth={Math.max(4, r * 0.08)} 
                        strokeLinecap="round" 
                    />
                    <text 
                        x={cx} 
                        y={cy} 
                        textAnchor="middle" 
                        dominantBaseline="central" 
                        dy="0.05em"
                        fontSize={r / 2} 
                        fontWeight="900" 
                        fill={isDone ? "#ef4444" : "#1e293b"}
                    >
                        {timeStr}
                    </text>

                    {showUI && (
                        <foreignObject 
                            x={cx - 150} 
                            y={el.y + el.height + 10} 
                            width={300} 
                            height={60} 
                            transform={el.rotation ? `rotate(${-el.rotation}, ${cx}, ${el.y + el.height + 10})` : ''} 
                            className="ui-ignore pointer-events-auto overflow-visible"
                        >
                            <div className="flex items-center justify-center gap-2 w-full h-full" onPointerDown={e => e.stopPropagation()}>
                                <button 
                                    onPointerDown={(e) => { 
                                        e.stopPropagation(); 
                                        setElements(p => p.map(o => o.id === el.id ? { ...o, isRunning: !o.isRunning } : o)); 
                                    }} 
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm text-white transition-all active:scale-95 cursor-pointer ${el.isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                    title={el.isRunning ? "Pausa" : "Starta"}
                                >
                                    {!el.isRunning ? (
                                        <Play size={18} fill="currentColor" />
                                    ) : (
                                        <div className="flex gap-1">
                                            <div className="w-1 h-3.5 bg-white rounded-sm" />
                                            <div className="w-1 h-3.5 bg-white rounded-sm" />
                                        </div>
                                    )}
                                </button>
                                
                                <button 
                                    onPointerDown={(e) => { 
                                        e.stopPropagation(); 
                                        setElements(p => p.map(o => o.id === el.id ? { ...o, timeLeft: el.duration, isRunning: false } : o)); 
                                    }} 
                                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                                    title="Återställ"
                                >
                                    <RefreshCw size={18} />
                                </button>

                                <div className="w-px h-6 bg-slate-300 mx-1" />
                                
                                <button 
                                    onPointerDown={(e) => { 
                                        e.stopPropagation(); 
                                        setElements(p => p.map(o => o.id === el.id ? { ...o, duration: Math.max(0, o.duration - 60), timeLeft: Math.max(0, o.timeLeft - 60) } : o)); 
                                    }} 
                                    className="px-3 h-10 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                                >
                                    -1m
                                </button>
                                
                                <button 
                                    onPointerDown={(e) => { 
                                        e.stopPropagation(); 
                                        setElements(p => p.map(o => o.id === el.id ? { ...o, duration: o.duration + 60, timeLeft: o.timeLeft + 60 } : o)); 
                                    }} 
                                    className="px-3 h-10 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                                >
                                    +1m
                                </button>
                            </div>
                        </foreignObject>
                    )}
                </g>
                {showUI && renderHandles(el, r)}
            </React.Fragment>
        );
    }
};