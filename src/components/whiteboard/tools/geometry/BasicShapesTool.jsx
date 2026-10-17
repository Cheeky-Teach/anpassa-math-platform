// src/components/whiteboard/tools/geometry/BasicShapesTool.jsx
import React from 'react';

export const BasicShapesTool = {
    type: 'basic_shapes',
    hasOptions: true,

    renderContextMenu: ({ el, setElements, t }) => {
        if (el.type !== 'triangle') return null;
        return (
            <>
                <button onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, triangleType: 'right' } : o))} className={`px-2.5 py-1.5 rounded-md text-[10px] transition-colors ${el.triangleType === 'right' ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>{t.right}</button>
                <button onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, triangleType: 'isosceles' } : o))} className={`px-2.5 py-1.5 rounded-md text-[10px] transition-colors ${el.triangleType === 'isosceles' ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>{t.isosceles}</button>
                <button onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, triangleType: 'scalene' } : o))} className={`px-2.5 py-1.5 rounded-md text-[10px] transition-colors ${el.triangleType === 'scalene' ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>{t.scalene}</button>
            </>
        );
    },

    render: ({ el, transform, showUI, renderHandles }) => {
        const r = el.width / 2;
        const cx = el.x + r;
        const cy = el.y + r;
        const strokeW = el.strokeWidth || 4;

        let shapeNode = null;
        if (el.type === 'triangle') {
            const pts = el.triangleType === 'right' 
                ? `${el.x},${el.y} ${el.x},${el.y + el.height} ${el.x + el.width},${el.y + el.height}` 
                : el.triangleType === 'isosceles' 
                    ? `${el.x + el.width / 2},${el.y} ${el.x},${el.y + el.height} ${el.x + el.width},${el.y + el.height}` 
                    : `${el.x + el.width / 4},${el.y} ${el.x},${el.y + el.height} ${el.x + el.width},${el.y + el.height}`;
            shapeNode = <polygon points={pts} fill="transparent" stroke="black" strokeWidth={strokeW} />;
        } else if (el.type === 'rect') {
            shapeNode = <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="transparent" stroke="black" strokeWidth={strokeW} />;
        } else if (el.type === 'circle') {
            shapeNode = <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="black" strokeWidth={strokeW} />;
        }

        return (
            <g key={el.id} data-id={el.id} transform={transform} className="pointer-events-auto cursor-move">
                {shapeNode}
                {showUI && renderHandles(el, r)}
            </g>
        );
    }
};