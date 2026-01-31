import React, { useEffect, useRef } from 'react';

/**
 * GraphCanvas
 * Renders a coordinate system and linear functions (y = kx + m).
 * Supports drawing two lines for system of equations if needed.
 */
export const GraphCanvas = ({ visual }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visual) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    // Config
    const scale = 20; // pixels per unit
    const centerX = w / 2;
    const centerY = h / 2;

    // Reset
    ctx.clearRect(0, 0, w, h);
    
    // Draw Grid
    ctx.strokeStyle = '#e5e7eb'; // light gray
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let x = 0; x <= w; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    // Horizontal grid lines
    for (let y = 0; y <= h; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // Draw Axes
    ctx.strokeStyle = '#374151'; // dark gray
    ctx.lineWidth = 2;
    
    // X-Axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, h);
    ctx.stroke();

    // Helper: Plot a line given slope (k) and intercept (m)
    const drawLine = (k, m, color = '#2563eb') => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        // Calculate start and end points
        // x = -10 (far left in units), x = 10 (far right)
        // Canvas coords: cx = centerX + x*scale, cy = centerY - y*scale
        
        const x1 = -15;
        const y1 = k * x1 + m;
        
        const x2 = 15;
        const y2 = k * x2 + m;

        ctx.moveTo(centerX + x1 * scale, centerY - y1 * scale);
        ctx.lineTo(centerX + x2 * scale, centerY - y2 * scale);
        ctx.stroke();
    };

    // Draw Lines from visual data
    if (visual.lines) {
        visual.lines.forEach((line, index) => {
            // Alternate colors for systems
            const color = index === 0 ? '#3b82f6' : '#ef4444'; 
            drawLine(line.k, line.m, color);
        });
    }

  }, [visual]);

  return (
    <div className="flex justify-center my-4 overflow-hidden rounded-lg border border-gray-200">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={300} 
        className="bg-white"
      />
    </div>
  );
};

GraphCanvas.requiresCanvas = true;