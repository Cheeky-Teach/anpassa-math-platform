import React, { useMemo } from 'react';

// =====================================================================
// ANGLE VISUALIZATION COMPONENT
// Handles drawing rays, arcs, and labels for angle geometry problems.
// Auto-crops viewBox to actual geometry bounds to eliminate dead space.
// =====================================================================

const AngleVisual = ({ data, width = "100%", height = "auto", className = "" }) => {
    if (!data) return null;

    const { lines = [], arcs = [], labels = [], polygons = [] } = data;

    // 1. Auto-compute tight bounding box around all drawn geometry + padding
    const viewBox = useMemo(() => {
        const xs = [];
        const ys = [];

        lines.forEach(l => {
            if (l.x1 !== undefined) xs.push(Number(l.x1));
            if (l.x2 !== undefined) xs.push(Number(l.x2));
            if (l.y1 !== undefined) ys.push(Number(l.y1));
            if (l.y2 !== undefined) ys.push(Number(l.y2));
        });

        arcs.forEach(a => {
            if (a.center) {
                const r = (Number(a.radius) || 30) + 32; // Include arc + label offset
                xs.push(Number(a.center.x) - r, Number(a.center.x) + r);
                ys.push(Number(a.center.y) - r, Number(a.center.y) + r);
            }
        });

        labels.forEach(lbl => {
            if (lbl.x !== undefined) xs.push(Number(lbl.x) - 20, Number(lbl.x) + 20);
            if (lbl.y !== undefined) ys.push(Number(lbl.y) - 16, Number(lbl.y) + 16);
        });

        polygons.forEach(poly => {
            if (typeof poly.points === 'string') {
                poly.points.trim().split(/\s+/).forEach(pair => {
                    const [px, py] = pair.split(',').map(Number);
                    if (!isNaN(px)) xs.push(px);
                    if (!isNaN(py)) ys.push(py);
                });
            }
        });

        if (xs.length === 0 || ys.length === 0) {
            return "0 0 300 250";
        }

        const pad = 24;
        const minX = Math.floor(Math.min(...xs) - pad);
        const minY = Math.floor(Math.min(...ys) - pad);
        const maxX = Math.ceil(Math.max(...xs) + pad);
        const maxY = Math.ceil(Math.max(...ys) + pad);

        const boxW = Math.max(80, maxX - minX);
        const boxH = Math.max(80, maxY - minY);

        return `${minX} ${minY} ${boxW} ${boxH}`;
    }, [lines, arcs, labels, polygons]);

    // Helper to draw an arc
    const drawArc = (arc, i) => {
        const { x, y } = arc.center;
        const r = arc.radius || 30;
        
        const start = -arc.startAngle * (Math.PI / 180);
        const end = -arc.endAngle * (Math.PI / 180);
        
        const x1 = x + r * Math.cos(start);
        const y1 = y + r * Math.sin(start);
        const x2 = x + r * Math.cos(end);
        const y2 = y + r * Math.sin(end);
        
        let diff = arc.endAngle - arc.startAngle;
        while (diff < 0) diff += 360;
        
        const largeArc = diff > 180 ? 1 : 0;
        const sweep = 0;
        
        const d = `M ${x} ${y} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2} Z`;
        
        const midAngle = -(arc.startAngle + arc.endAngle) / 2 * (Math.PI / 180);
        const lx = x + (r + 22) * Math.cos(midAngle);
        const ly = y + (r + 22) * Math.sin(midAngle);

        return (
            <g key={`arc-${i}`}>
                <path d={d} fill={arc.color || "rgba(255, 165, 0, 0.2)"} stroke={arc.stroke || "orange"} strokeWidth="2" />
                {arc.label && (
                    <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="bold" fill="#374151">
                        {arc.label}
                    </text>
                )}
            </g>
        );
    };

    return (
        <svg 
            width={width} 
            height={height} 
            viewBox={viewBox} 
            preserveAspectRatio="xMidYMid meet"
            className={`mx-auto block overflow-visible drop-shadow-sm max-w-[260px] max-h-[200px] ${className}`}
        >
            {/* Draw Polygons (if any) */}
            {polygons.map((poly, i) => (
                <polygon 
                    key={`poly-${i}`} 
                    points={poly.points} 
                    fill="rgba(59, 130, 246, 0.1)" 
                    stroke="#3b82f6" 
                    strokeWidth="2" 
                />
            ))}

            {/* Draw Lines */}
            {lines.map((line, i) => (
                <line 
                    key={`line-${i}`} 
                    x1={line.x1} y1={line.y1} 
                    x2={line.x2} y2={line.y2} 
                    stroke="#1e293b" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                />
            ))}

            {/* Draw Arcs/Angles */}
            {arcs.map((arc, i) => drawArc(arc, i))}

            {/* Draw Independent Labels */}
            {labels.map((lbl, i) => (
                <text 
                    key={`lbl-${i}`} 
                    x={lbl.x} y={lbl.y} 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    fontSize={lbl.size || "16"} 
                    fontWeight="bold" 
                    fill={lbl.color || "#1f2937"}
                >
                    {lbl.text}
                </text>
            ))}
        </svg>
    );
};

export default AngleVisual;