import React from 'react';

/**
 * Renders SVG geometry. Handles 'similarity' by rendering multiple shapes.
 * Updated to use named export to match PracticeView imports.
 */
export const GeometryVisual = ({ data }) => {
  if (!data) return null;

  // --- Helper: Render a Single Polygon ---
  const renderShape = (points, offsetX = 0, offsetY = 0, color = 'black', key) => {
    if (!points || points.length < 2) return null;
    
    // SVG Coordinate System: Y increases downwards.
    // Math Coordinate System: Y increases upwards.
    // We flip Y (-p.y) so math coordinates (0,10) render above (0,0).
    const pathData = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x + offsetX} ${-p.y + offsetY}`
    ).join(' ') + ' Z';

    return (
      <path 
        key={key}
        d={pathData} 
        fill={color} 
        fillOpacity="0.2" 
        stroke={color} 
        strokeWidth="2"
        vectorEffect="non-scaling-stroke" // Keeps stroke width constant on zoom
        strokeLinejoin="round"
      />
    );
  };

  // --- Helper: Render Labels ---
  const renderLabels = (labels, shapes) => {
    if (!labels) return null;
    
    return labels.map((lbl, i) => {
      let x = lbl.x;
      let y = -lbl.y; // Flip Y to match shape coordinate system
      
      // Determine offset based on shapeIndex
      // If shapeIndex is 1 (the second shape), we shift it right
      if (lbl.shapeIndex === 1 && shapes && shapes.length > 0) {
        // Find max width of shape 0 to calculate the gap offset
        const shape0Width = shapes[0].points.reduce((max, p) => Math.max(max, p.x), 0);
        const gap = 4; // Must match the gap used in ViewBox calculation
        x += (shape0Width + gap); 
      }

      return (
        <text 
          key={`lbl-${i}`} 
          x={x} 
          y={y} 
          className="text-[0.6px] fill-gray-800 font-medium font-sans select-none"
          textAnchor="middle" 
          dominantBaseline="middle"
        >
          {lbl.text}
        </text>
      );
    });
  };

  // --- ViewBox Calculation ---
  // We need to determine the bounding box of ALL shapes to zoom the SVG correctly.
  let allPoints = [];
  const gap = 4; // Space between similarity shapes

  if (data.type === 'similarity' && data.shapes) {
    // Shape 1 points (no offset)
    const s0Points = data.shapes[0].points;
    
    // Shape 2 points (offset by Shape 1 width + gap)
    const s0Width = s0Points.reduce((max, p) => Math.max(max, p.x), 0);
    const s1Points = data.shapes[1].points.map(p => ({
        x: p.x + s0Width + gap,
        y: p.y
    }));

    allPoints = [...s0Points, ...s1Points];
  } else if (data.points) {
    // Standard single shape
    allPoints = data.points;
  }

  // Safety check
  if (allPoints.length === 0) {
      return <div className="p-4 text-gray-400 italic text-sm text-center">Visual unavailable</div>;
  }

  const minX = Math.min(...allPoints.map(p => p.x));
  const maxX = Math.max(...allPoints.map(p => p.x));
  const minY = Math.min(...allPoints.map(p => -p.y)); // SVG Y
  const maxY = Math.max(...allPoints.map(p => -p.y));

  const padding = 2; // Breathing room around shapes
  const width = maxX - minX + (padding * 2);
  const height = maxY - minY + (padding * 2);
  
  // Construct ViewBox
  const viewBox = `${minX - padding} ${minY - padding} ${width} ${height}`;

  return (
    <div className="w-full flex justify-center items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 my-4">
      <svg 
        viewBox={viewBox} 
        className="w-full max-w-[500px] h-auto overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Debug Grid/Axes if requested */}
        {data.showAxes && (
           <g stroke="#e5e7eb" strokeWidth="0.1">
             <line x1="-100" y1="0" x2="100" y2="0" stroke="#9ca3af" />
             <line x1="0" y1="-100" x2="0" y2="100" stroke="#9ca3af" />
           </g>
        )}

        {/* --- Render Logic for Similarity --- */}
        {data.type === 'similarity' && data.shapes && (
          <>
            {/* Shape 1 */}
            {renderShape(data.shapes[0].points, 0, 0, data.shapes[0].color, 's1')}
            
            {/* Shape 2 (Offset) */}
            {(() => {
              const s1Offset = data.shapes[0].points.reduce((max, p) => Math.max(max, p.x), 0) + gap;
              return renderShape(data.shapes[1].points, s1Offset, 0, data.shapes[1].color, 's2');
            })()}
            
            {/* Labels */}
            {renderLabels(data.labels, data.shapes)}
          </>
        )}

        {/* --- Render Logic for Standard Single Shape --- */}
        {(!data.type || data.type !== 'similarity') && (
           <g>
             {renderShape(data.points, 0, 0, '#3B82F6', 'single')}
             {/* If standard shapes have labels, render them here. Currently assumes custom labels array is for similarity */}
           </g>
        )}
      </svg>
    </div>
  );
};

GeometryVisual.requiresCanvas = true;