import React from 'react';

// =====================================================================
// ANGLE VISUALIZATION COMPONENT
// Handles drawing rays, arcs, and labels for angle geometry problems.
// =====================================================================

const AngleVisual = ({ data }) => {
    // Data expected structure:
    // {
    //   type: 'angle',
    //   subtype: 'simple' | 'complementary' | 'supplementary' | 'vertical' | 'triangle' | 'parallel' | 'polygon',
    //   points: [{x,y}, ...], // Or specific structure per subtype
    //   lines: [[p1, p2], ...],
    //   arcs: [{center, startAngle, endAngle, radius, label, color}],
    //   labels: [{x, y, text}]
    // }

    if (!data) return null;

    const { subtype, lines = [], arcs = [], labels = [], polygons = [] } = data;
    const width = 300;
    const height = 250;
    
    // Helper to draw an arc
    const drawArc = (arc, i) => {
        const { x, y } = arc.center;
        const r = arc.radius || 30;
        const start = arc.startAngle * (Math.PI / 180);
        const end = arc.endAngle * (Math.PI / 180);
        
        // SVG Arc logic
        // M center_x center_y L start_x start_y A r r 0 large_arc sweep_flag end_x end_y Z
        // Actually simpler: just the arc curve usually, unless we want a wedge.
        // Let's draw just the curve for angle markers.
        
        const x1 = x + r * Math.cos(start);
        const y1 = y + r * Math.sin(start);
        const x2 = x + r * Math.cos(end);
        const y2 = y + r * Math.sin(end);
        
        // Large arc flag (if angle > 180)
        const diff = arc.endAngle - arc.startAngle;
        const largeArc = diff > 180 ? 1 : 0;
        
        const d = `M ${x} ${y} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        
        // Label position (midpoint of arc, pushed out slightly)
        const midAngle = (arc.startAngle + arc.endAngle) / 2 * (Math.PI / 180);
        const lx = x + (r + 20) * Math.cos(midAngle);
        const ly = y + (r + 20) * Math.sin(midAngle);

        return (
            <g key={i}>
                <path d={d} fill={arc.color || "rgba(255, 165, 0, 0.2)"} stroke={arc.stroke || "orange"} strokeWidth="2" />
                {arc.label && (
                    <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="bold" fill="#374151">
                        {arc.label}
                    </text>
                )}
            </g>
        );
    };

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto bg-white rounded-lg shadow-sm border border-slate-100">
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
                    fontSize={lbl.size || "18"} 
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