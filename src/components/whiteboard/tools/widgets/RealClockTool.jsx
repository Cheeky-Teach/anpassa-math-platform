// src/components/whiteboard/tools/widgets/RealClockTool.jsx
import React from 'react';

export const RealClockTool = {
    type: 'realClock',
    hasOptions: false,

    createDefault: (id, color) => ({
        id,
        type: 'realClock',
        x: 600,
        y: 300,
        width: 280,
        height: 280,
        stroke: color,
        rotation: 0,
        opacity: 1,
        clockType: 'analog'
    }),

    render: ({ el, lang, currentTime, transform, showUI, renderHandles, setElements }) => {
        const r = el.width / 2;
        const cx = el.x + r;
        const cy = el.y + r;
        const isAnalog = el.clockType !== 'digital';

        const h = currentTime.getHours();
        const m = currentTime.getMinutes();
        const s = currentTime.getSeconds();

        const secRot = s * 6;
        const minRot = m * 6 + s * 0.1;
        const hrRot = (h % 12) * 30 + m * 0.5;

        const timeString = currentTime.toLocaleTimeString(lang === 'sv' ? 'sv-SE' : 'en-US', { 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });

        const faceColor = "#ffffff";
        const rimColor = "#0b0b0c";
        const hrHandColor = "#1e293b";
        const minHandColor = "#8b5cf6";
        const secHandColor = "#f43f5e";
        const tickColor = "#cbd5e1";
        const fontFam = "'Nunito', 'Quicksand', 'Varela Round', sans-serif";

        return (
            <React.Fragment key={el.id}>
                <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                    {isAnalog ? (
                        <>
                            <circle cx={cx} cy={cy} r={r} fill={faceColor} stroke={rimColor} strokeWidth={r * 0.08} />
                            
                            {Array.from({ length: 60 }).map((_, i) => {
                                const isHour = i % 5 === 0;
                                if (isHour) return null;
                                const angle = i * 6 * (Math.PI / 180);
                                const dist = r * 0.82;
                                const dotR = r * 0.015;
                                return <circle key={i} cx={cx + dist * Math.sin(angle)} cy={cy - dist * Math.cos(angle)} r={dotR} fill={tickColor} />;
                            })}

                            {Array.from({ length: 12 }).map((_, i) => {
                                const hr = i === 0 ? 12 : i;
                                const angle = i * 30 * (Math.PI / 180);
                                const dist = r * 0.78;
                                return (
                                    <text 
                                        key={`n-${i}`} 
                                        x={cx + dist * Math.sin(angle)} 
                                        y={cy - dist * Math.cos(angle)} 
                                        textAnchor="middle" 
                                        dominantBaseline="central" 
                                        dy="0.05em" 
                                        fontSize={r * 0.19} 
                                        fontWeight="900" 
                                        fill={hrHandColor} 
                                        fontFamily={fontFam}
                                    >
                                        {hr}
                                    </text>
                                );
                            })}

                            <g transform={`rotate(${hrRot}, ${cx}, ${cy})`}>
                                <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.45} stroke={hrHandColor} strokeWidth={r * 0.08} strokeLinecap="round" />
                            </g>
                            <g transform={`rotate(${minRot}, ${cx}, ${cy})`}>
                                <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.65} stroke={minHandColor} strokeWidth={r * 0.06} strokeLinecap="round" />
                            </g>
                            <g transform={`rotate(${secRot}, ${cx}, ${cy})`}>
                                <line x1={cx} y1={cy + r * 0.15} x2={cx} y2={cy - r * 0.75} stroke={secHandColor} strokeWidth={r * 0.02} strokeLinecap="round" />
                                <circle cx={cx} cy={cy} r={r * 0.05} fill={secHandColor} />
                            </g>
                        </>
                    ) : (
                        <>
                            <rect 
                                x={cx - r * 1.05} 
                                y={cy - r * 0.35} 
                                width={r * 2.1} 
                                height={r * 0.7} 
                                fill={faceColor} 
                                rx={r * 0.15} 
                                stroke={rimColor} 
                                strokeWidth={r * 0.06} 
                            />
                            <text 
                                x={cx} 
                                y={cy} 
                                textAnchor="middle" 
                                dominantBaseline="central" 
                                dy="0.05em"
                                fontSize={r * 0.35} 
                                fontWeight="900" 
                                fill={hrHandColor} 
                                fontFamily={fontFam} 
                                style={{ letterSpacing: '0.02em' }}
                            >
                                {timeString}
                            </text>
                        </>
                    )}
                </g>

                {showUI && (
                    <foreignObject x={cx - 60} y={el.y + el.height + 10} width={120} height={50} className="ui-ignore pointer-events-auto">
                        <div className="flex justify-center" onPointerDown={e => e.stopPropagation()}>
                            <button 
                                onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, clockType: isAnalog ? 'digital' : 'analog' } : o))}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-xl shadow-sm font-black text-[10px] uppercase tracking-wider hover:bg-indigo-600 transition-colors cursor-pointer"
                            >
                                {isAnalog ? "Digital" : "Analog"}
                            </button>
                        </div>
                    </foreignObject>
                )}

                {showUI && renderHandles(el, r)}
            </React.Fragment>
        );
    }
};