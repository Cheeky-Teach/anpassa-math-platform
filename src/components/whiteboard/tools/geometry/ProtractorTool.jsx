// src/components/whiteboard/tools/geometry/ProtractorTool.jsx
import React from 'react';

export const ProtractorTool = {
    type: 'protractor',
    hasOptions: false,

    createDefault: (id, color) => ({
        id,
        type: 'protractor',
        x: 600,
        y: 300,
        width: 400,
        height: 200,
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    render: ({ el, transform, showUI, renderHandles }) => {
        const r = el.width / 2;
        const cx = el.x + r;
        const cy = el.y + r;
        const ticks = [];

        for (let i = 0; i <= 180; i += 1) {
            const a = (i * Math.PI) / 180;
            const l = i % 10 === 0 ? 25 : 12;
            ticks.push(<line key={i} x1={cx + (r - l) * Math.cos(-a)} y1={cy + (r - l) * Math.sin(-a)} x2={cx + r * Math.cos(-a)} y2={cy + r * Math.sin(-a)} stroke="black" strokeWidth={i % 10 === 0 ? 3 : 1} />);
            if (i % 10 === 0) ticks.push(<text key={`t-${i}`} x={cx + (r - 45) * Math.cos(-a)} y={cy + (r - 45) * Math.sin(-a)} textAnchor="middle" fontSize="16" fontWeight="900" fill="black">{i}</text>);
        }

        return (
            <React.Fragment key={el.id}>
                <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                    <path d={`M ${el.x} ${cy} A ${r} ${r} 0 0 1 ${el.x + el.width} ${cy} Z`} fill="white" fillOpacity="0.5" stroke="black" strokeWidth="2" />
                    {ticks}<circle cx={cx} cy={cy} r="5" fill="black" />
                </g>
                {showUI && renderHandles(el, r)}
            </React.Fragment>
        );
    }
};