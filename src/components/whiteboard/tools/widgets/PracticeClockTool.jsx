// src/components/whiteboard/tools/widgets/PracticeClockTool.jsx
import React from 'react';

export const PracticeClockTool = {
    type: 'clock',
    hasOptions: false,

    createDefault: (id, color) => ({
        id,
        type: 'clock',
        x: 600,
        y: 300,
        width: 280,
        height: 280,
        hourRotation: 300,
        minRotation: 0,
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    render: ({ el, transform, showUI, renderHandles, setInteractionMode, setIsDrawing }) => {
        const r = el.width / 2;
        const cx = el.x + r;
        const cy = el.y + r;
        const ticks = [];

        for (let i = 0; i < 60; i++) {
            const angle = i * 6 * (Math.PI / 180);
            const isHour = i % 5 === 0;
            const tickLen = isHour ? 15 : 7;
            ticks.push(<line key={`t-${i}`} x1={cx + (r - tickLen) * Math.sin(angle)} y1={cy - (r - tickLen) * Math.cos(angle)} x2={cx + r * Math.sin(angle)} y2={cy - r * Math.cos(angle)} stroke="black" strokeWidth={isHour ? 3 : 1} />);
            if (isHour) ticks.push(<text key={`n-${i}`} x={cx + (r - 40) * Math.sin(angle)} y={cy - (r - 40) * Math.cos(angle) + 8} textAnchor="middle" fontSize="22" fontWeight="bold" fill="black">{i === 0 ? 12 : i / 5}</text>);
        }

        return (
            <React.Fragment key={el.id}>
                <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                    <circle cx={cx} cy={cy} r={r} fill="white" stroke="black" strokeWidth="6" />
                    {ticks}
                    <g transform={`rotate(${el.hourRotation}, ${cx}, ${cy})`}>
                        <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.55} stroke="black" strokeWidth="10" strokeLinecap="round" />
                        <path d={`M ${cx - 10} ${cy - r * 0.55} L ${cx} ${cy - r * 0.65} L ${cx + 10} ${cy - r * 0.55} Z`} fill="black" className="cursor-pointer ui-ignore pointer-events-auto" onPointerDown={(e) => { e.stopPropagation(); setInteractionMode('rotating-hour'); setIsDrawing(true); }} />
                    </g>
                    <g transform={`rotate(${el.minRotation}, ${cx}, ${cy})`}>
                        <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.8} stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                        <path d={`M ${cx - 8} ${cy - r * 0.8} L ${cx} ${cy - r * 0.9} L ${cx + 8} ${cy - r * 0.8} Z`} fill="#475569" className="cursor-pointer ui-ignore pointer-events-auto" onPointerDown={(e) => { e.stopPropagation(); setInteractionMode('rotating-min'); setIsDrawing(true); }} />
                    </g>
                    <circle cx={cx} cy={cy} r="6" fill="black" />
                </g>
                {showUI && renderHandles(el, r)}
            </React.Fragment>
        );
    }
};