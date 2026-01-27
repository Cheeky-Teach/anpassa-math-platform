import React from 'react';
import { UI_TEXT } from '../../constants/localization';

/**
 * GeometryVisual
 * Handles SVG rendering for 2D Geometry and Similarity problems.
 * * MIGRATION NOTE:
 * - Preserved viewBox="-10 0 370 200" for similarity to prevent clipping.
 * - Preserved translation offsets (30, 50) and (220, 30).
 * - Implemented custom drawAngle for red arcs.
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

  // 1. Similarity Comparison Visuals (Specific Fix Applied)
  if (visual.type === 'similarity_compare') {
    const { shape1, shape2 } = visual;
    return (
      <div className="flex justify-center my-4 overflow-hidden">
        <svg width="100%" height="200" viewBox="-10 0 370 200" className="max-w-md">
          {/* Shape 1 - Offset (30, 50) */}
          <g transform="translate(30, 50)">
            <polygon 
              points={shape1.points.map(p => `${p.x},${p.y}`).join(' ')}
              className="fill-blue-100 stroke-blue-500 stroke-2"
            />
            {shape1.labels && shape1.labels.map((lbl, i) => (
              <text key={i} x={lbl.x} y={lbl.y} className="text-xs fill-gray-700 font-bold">
                {lbl.text}
              </text>
            ))}
            {/* Arcs for Shape 1 */}
            {shape1.angles && shape1.angles.map((ang, i) => (
              <g key={`arc1-${i}`}>
                 {drawAngle(ang.x, ang.y, ang.start, ang.end)}
              </g>
            ))}
          </g>

          {/* Shape 2 - Offset (220, 30) */}
          <g transform="translate(220, 30)">
            <polygon 
              points={shape2.points.map(p => `${p.x},${p.y}`).join(' ')}
              className="fill-green-100 stroke-green-500 stroke-2"
            />
             {shape2.labels && shape2.labels.map((lbl, i) => (
              <text key={i} x={lbl.x} y={lbl.y} className="text-xs fill-gray-700 font-bold">
                {lbl.text}
              </text>
            ))}
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

  return null;
};