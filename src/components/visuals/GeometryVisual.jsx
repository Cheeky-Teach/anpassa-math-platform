import React from 'react';

/**
 * GeometryVisual
 * Handles SVG rendering for 2D Geometry and Similarity problems.
 */
export const GeometryVisual = ({ visual }) => {
  if (!visual) return null;

  // Helper to draw angle arcs
  const drawAngle = (cx, cy, startAngle, endAngle, radius = 20, color = "red") => {
    // Convert degrees to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    // Large arc flag (always 0 for acute angles in our generation logic)
    const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

    return (
      <path
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    );
  };

  // 1. Similarity Comparison Visuals
  // FIXED: Handle both legacy shape1/shape2 and new left/right properties from generator
  if (visual.type === 'similarity_compare') {
    const shape1 = visual.left || visual.shape1;
    const shape2 = visual.right || visual.shape2;

    if (!shape1 || !shape2) return null;

    return (
      <div className="flex justify-center my-4 overflow-hidden">
        <svg width="100%" height="200" viewBox="-10 0 370 200" className="max-w-md">
          {/* Shape 1 - Offset (30, 50) */}
          <g transform="translate(30, 50)">
            {shape1.points && (
              <polygon 
                points={shape1.points.map(p => `${p.x},${p.y}`).join(' ')}
                className="fill-blue-100 stroke-blue-500 stroke-2"
              />
            )}
            {/* Fallback for simple rect/triangle without explicit points */}
            {!shape1.points && visual.shapeType === 'rectangle' && (
                <rect x="0" y="0" width={shape1.labels.b} height={shape1.labels.h} className="fill-blue-100 stroke-blue-500 stroke-2" />
            )}
            
            {shape1.labels && Object.entries(shape1.labels).map(([key, val], i) => {
               // Simple label positioning logic if explicit coords missing
               const x = key === 'b' ? (val/2 || 20) : (key === 'h' ? -10 : 10);
               const y = key === 'b' ? (shape1.labels.h || 50) + 15 : (shape1.labels.h/2 || 20);
               return (
                  <text key={i} x={x} y={y} className="text-xs fill-gray-700 font-bold">
                    {val}
                  </text>
               );
            })}
            
            {/* Arcs for Shape 1 */}
            {shape1.angles && shape1.angles.map((ang, i) => (
              <g key={`arc1-${i}`}>
                 {drawAngle(ang.x, ang.y, ang.start, ang.end)}
              </g>
            ))}
          </g>

          {/* Shape 2 - Offset (220, 30) */}
          <g transform="translate(220, 30)">
            {shape2.points && (
              <polygon 
                points={shape2.points.map(p => `${p.x},${p.y}`).join(' ')}
                className="fill-green-100 stroke-green-500 stroke-2"
              />
            )}
             {!shape2.points && visual.shapeType === 'rectangle' && (
                <rect x="0" y="0" width={shape2.labels.b} height={shape2.labels.h} className="fill-green-100 stroke-green-500 stroke-2" />
            )}

             {shape2.labels && Object.entries(shape2.labels).map(([key, val], i) => {
               const x = key === 'b' ? (shape2.labels.b/2 || 20) : (key === 'h' ? -10 : 10);
               const y = key === 'b' ? (shape2.labels.h || 50) + 15 : (shape2.labels.h/2 || 20);
               return (
                  <text key={i} x={x} y={y} className="text-xs fill-gray-700 font-bold">
                    {val}
                  </text>
               );
            })}
             {/* Arcs for Shape 2 */}
            {shape2.angles && shape2.angles.map((ang, i) => (
              <g key={`arc2-${i}`}>
                 {drawAngle(ang.x, ang.y, ang.start, ang.end)}
              </g>
            ))}
          </g>
        </svg>
      </div>
    );
  }

  // 2. Standard Polygon Visuals
  if (visual.points) {
    return (
      <div className="flex justify-center my-4">
        <svg width="300" height="200" viewBox="0 0 300 200">
          <polygon
            points={visual.points.map(p => `${p.x},${p.y}`).join(' ')}
            className="fill-gray-50 stroke-gray-800 stroke-2"
          />
          {visual.labels && visual.labels.map((label, idx) => (
            <text 
              key={idx} 
              x={label.x} 
              y={label.y}
              className="text-sm font-sans fill-gray-700"
              textAnchor="middle"
            >
              {label.text}
            </text>
          ))}
        </svg>
      </div>
    );
  }
  
  // 3. Fallback for basic shape types (rectangle/triangle) defined by props but not points
  if (visual.type === 'rectangle' || visual.type === 'triangle' || visual.type === 'circle') {
      // Basic SVG construction based on width/height props
      const w = visual.width || 100;
      const h = visual.height || 100;
      return (
        <div className="flex justify-center my-4">
            <svg width={w + 40} height={h + 40} viewBox={`0 0 ${w+40} ${h+40}`}>
                <g transform="translate(20, 20)">
                    {visual.type === 'rectangle' && <rect width={w} height={h} className="fill-green-50 stroke-green-600 stroke-2" />}
                    {visual.type === 'triangle' && <polygon points={`0,${h} ${w},${h} ${visual.subtype==='right'?0:w/2},0`} className="fill-green-50 stroke-green-600 stroke-2" />}
                    {visual.type === 'circle' && <circle cx={w/2} cy={w/2} r={w/2} className="fill-green-50 stroke-green-600 stroke-2" />}
                    
                    {/* Simple Labels */}
                    {visual.labels && Object.values(visual.labels).map((l, i) => (
                        <text key={i} x={w/2} y={h+20} textAnchor="middle" className="text-xs font-bold">{l}</text>
                    ))}
                </g>
            </svg>
        </div>
      );
  }

  return null;
};