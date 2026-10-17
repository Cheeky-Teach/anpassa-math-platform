// src/components/whiteboard/tools/geometry/Shapes3DTool.jsx
import React from 'react';
import { Hash } from 'lucide-react';

export const Shapes3DTool = {
    type: 'shapes_3d',
    hasOptions: true,

    renderContextMenu: ({ el, setElements }) => (
        <>
            <span className="text-emerald-600 font-black">{el.shape3D}</span>
            <button onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, showInternal: !o.showInternal } : o))} className={`p-1.5 rounded-md border transition-colors ${el.showInternal ? 'bg-emerald-500 text-white' : 'bg-slate-50 hover:bg-slate-100'}`}><Hash size={14} /></button>
        </>
    ),

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { transform = '', showUI = false, renderHandles = null } = options;

        if (!el) return null;

        const w = Number(el.width) || 200;
        const h = Number(el.height) || 200;
        const d = w * 0.35;
        const r = w / 2;
        
        // 🟢 Robust default color fallback
        const strokeColor = el.stroke || '#0284c7';
        const common = { 
            fill: strokeColor, 
            fillOpacity: 0.15, 
            stroke: strokeColor, 
            strokeWidth: Number(el.strokeWidth) || 3 
        };
        const dotted = { 
            stroke: strokeColor, 
            strokeWidth: 2, 
            strokeDasharray: "6 4", 
            fill: "none" 
        };

        let faces = [];
        let lines = [];

        if (el.shape3D === 'cube' || el.shape3D === 'prism') {
            faces.push(<path key="f1" d={`M ${el.x} ${el.y + d} L ${el.x + w} ${el.y + d} L ${el.x + w} ${el.y + d + h} L ${el.x} ${el.y + d + h} Z`} {...common} />);
            faces.push(<path key="f2" d={`M ${el.x} ${el.y + d} L ${el.x + d} ${el.y} L ${el.x + w + d} ${el.y} L ${el.x + w} ${el.y + d} Z`} {...common} />);
            faces.push(<path key="f3" d={`M ${el.x + w} ${el.y + d} L ${el.x + w + d} ${el.y} L ${el.x + w + d} ${el.y + h} L ${el.x + w} ${el.y + d + h} Z`} {...common} />);
            if (el.showInternal) lines.push(<path key="h1" d={`M ${el.x} ${el.y + d + h} L ${el.x + d} ${el.y + h} L ${el.x + d} ${el.y} M ${el.x + d} ${el.y + h} L ${el.x + w + d} ${el.y + h}`} {...dotted} />);
        } else if (el.shape3D === 'triprism') {
            const bX = el.x + d;
            const bY = el.y;
            if (el.showInternal) faces.push(<path key="back" d={`M ${bX} ${bY + h} L ${bX + w - d} ${bY + h} L ${bX + (w - d) / 2} ${bY + d} Z`} {...common} strokeDasharray="4" />);
            faces.push(<path key="front" d={`M ${el.x} ${el.y + h} L ${el.x + w - d} ${el.y + h} L ${el.x + (w - d) / 2} ${el.y + d} Z`} {...common} />);
            lines.push(<line key="c1" x1={el.x} y1={el.y + h} x2={bX} y2={bY + h} {...common} />, <line key="c2" x1={el.x + w - d} y1={el.y + h} x2={bX + w - d} y2={bY + h} {...common} />, <line key="c3" x1={el.x + (w - d) / 2} y1={el.y + d} x2={bX + (w - d) / 2} y2={bY + d} {...common} />);
            if (el.showInternal) lines.push(<line key="h" x1={el.x + (w - d) / 2} y1={el.y + d} x2={el.x + (w - d) / 2} y2={el.y + h} {...dotted} />);
        } else if (el.shape3D === 'pyramid') {
            faces.push(<path key="b" d={`M ${el.x} ${el.y + h} L ${el.x + w - d} ${el.y + h} L ${el.x + w} ${el.y + h - d} L ${el.x + d} ${el.y + h - d} Z`} {...common} />, <path key="s1" d={`M ${el.x} ${el.y + h} L ${el.x + w / 2} ${el.y} L ${el.x + w - d} ${el.y + h} Z`} {...common} />, <path key="s2" d={`M ${el.x + w - d} ${el.y + h} L ${el.x + w / 2} ${el.y} L ${el.x + w} ${el.y + h - d} Z`} {...common} />);
            if (el.showInternal) lines.push(<line key="h" x1={el.x + w / 2} y1={el.y} x2={el.x + w / 2} y2={el.y + h - d / 2} {...dotted} />);
        } else if (el.shape3D === 'house') {
            const baseH = h * 0.6;
            faces.push(<path key="h1" d={`M ${el.x} ${el.y + h} L ${el.x + w} ${el.y + h} L ${el.x + w} ${el.y + h - baseH} L ${el.x} ${el.y + h - baseH} Z`} {...common} />);
            faces.push(<path key="h2" d={`M ${el.x + w} ${el.y + h} L ${el.x + w + d} ${el.y + h - d} L ${el.x + w + d} ${el.y + h - baseH - d} L ${el.x + w} ${el.y + h - baseH} Z`} {...common} />);
            faces.push(<path key="hr" d={`M ${el.x} ${el.y + h - baseH} L ${el.x + w / 2} ${el.y} L ${el.x + w} ${el.y + h - baseH} Z`} {...common} fillOpacity={0.4} />);
            faces.push(<path key="hr2" d={`M ${el.x + w / 2} ${el.y} L ${el.x + w / 2 + d} ${el.y - d} L ${el.x + w + d} ${el.y + h - baseH - d} L ${el.x + w} ${el.y + h - baseH} Z`} {...common} fillOpacity={0.4} />);
            if (el.showInternal) lines.push(<line key="h" x1={el.x + w / 2} y1={el.y} x2={el.x + w / 2} y2={el.y + h} {...dotted} />);
        } else if (el.shape3D === 'cylinder' || el.shape3D === 'silo' || el.shape3D === 'tube') {
            faces.push(<ellipse key="e1" cx={el.x + w / 2} cy={el.y + h} rx={w / 2} ry={d / 2} {...common} />);
            faces.push(<rect key="r1" x={el.x} y={el.y + d / 2} width={w} height={h - d / 2} {...common} stroke="none" />);
            faces.push(<ellipse key="e2" cx={el.x + w / 2} cy={el.y + d / 2} rx={w / 2} ry={d / 2} {...common} fillOpacity={0.3} />);
            lines.push(<line key="l1" x1={el.x} y1={el.y + d / 2} x2={el.x} y2={el.y + h} stroke={el.stroke} strokeWidth="2" />, <line key="l2" x1={el.x + w} y1={el.y + d / 2} x2={el.x + w} y2={el.y + h} stroke={el.stroke} strokeWidth="2" />);
            if (el.shape3D === 'silo') faces.push(<path key="dome" d={`M ${el.x} ${el.y + d / 2} A ${w / 2} ${w / 2} 0 0 1 ${el.x + w} ${el.y + d / 2}`} {...common} fillOpacity={0.4} />);
            if (el.shape3D === 'tube') faces.push(<ellipse key="inner1" cx={el.x + w / 2} cy={el.y + d / 2} rx={w / 4} ry={d / 4} {...common} fill="white" fillOpacity="1" />, <ellipse key="inner2" cx={el.x + w / 2} cy={el.y + h} rx={w / 4} ry={d / 4} {...common} fill="none" strokeDasharray="3" />);
            if (el.showInternal && el.shape3D !== 'tube') lines.push(<line key="h" x1={el.x + w / 2} y1={el.y + d / 2} x2={el.x + w / 2} y2={el.y + h} {...dotted} />);
        } else if (el.shape3D === 'cone' || el.shape3D === 'icecream') {
            const isIce = el.shape3D === 'icecream';
            const apexY = isIce ? el.y + h : el.y;
            const baseY = isIce ? el.y + d / 2 : el.y + h;
            faces.push(<ellipse key="base" cx={el.x + w / 2} cy={baseY} rx={w / 2} ry={d / 2} {...common} />, <path key="side" d={`M ${el.x} ${baseY} L ${el.x + w / 2} ${apexY} L ${el.x + w} ${baseY} Z`} {...common} />);
            if (isIce) faces.push(<path key="scoop" d={`M ${el.x} ${baseY} A ${w / 2} ${w / 2} 0 0 1 ${el.x + w} ${baseY}`} {...common} fillOpacity={0.4} />);
            if (el.showInternal) lines.push(<line key="h" x1={el.x + w / 2} y1={apexY} x2={el.x + w / 2} y2={baseY} {...dotted} />);
        } else if (el.shape3D === 'sphere' || el.shape3D === 'hemi') {
            if (el.shape3D === 'hemi') faces.push(<ellipse key="b" cx={el.x + w / 2} cy={el.y + w / 2} rx={w / 2} ry={w / 6} {...common} />, <path key="d" d={`M ${el.x} ${el.y + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${el.x + w} ${el.y + w / 2}`} {...common} fillOpacity={0.3} transform={`rotate(180, ${el.x + w / 2}, ${el.y + w / 2})`} />);
            else faces.push(<circle key="s1" cx={el.x + w / 2} cy={el.y + w / 2} r={w / 2} {...common} fillOpacity={0.2} />, <ellipse key="eq" cx={el.x + w / 2} cy={el.y + w / 2} rx={w / 2} ry={w / 6} {...common} fill="none" strokeDasharray="4" />);
            if (el.showInternal) lines.push(<line key="r" x1={el.x + w / 2} y1={el.y + w / 2} x2={el.x + w} y2={el.y + w / 2} {...dotted} />);
        }
        
        return (
            <React.Fragment key={el.id}>
                <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                    {faces}{lines}
                </g>
                {showUI && renderHandles(el, r)}
            </React.Fragment>
        );
    }
};