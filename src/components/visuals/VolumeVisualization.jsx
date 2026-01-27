import React, { useEffect, useRef } from 'react';

/**
 * VolumeVisualization
 * Renders 3D shapes (Cubes, Rectangular Prisms, Cylinders) on HTML5 Canvas.
 * * MIGRATION NOTE:
 * - Uses TARGET_SIZE = 160.
 * - Implements dynamic scaling: scale = TARGET_SIZE / Math.max(w, h, d).
 */
export const VolumeVisualization = ({ visual }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visual) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#374151'; // gray-700
    ctx.fillStyle = '#E5E7EB';   // gray-200

    const centerX = width / 2;
    const centerY = height / 2;

    // SCALING LOGIC
    const TARGET_SIZE = 160;
    // Determine max dimension to scale appropriately
    const maxDim = Math.max(
      visual.width || 0,
      visual.height || 0,
      visual.depth || 0,
      (visual.radius || 0) * 2
    );
    
    // Avoid division by zero
    const scale = maxDim > 0 ? TARGET_SIZE / maxDim : 1;

    // Drawing functions
    const drawCubeOrPrism = () => {
        const w = (visual.width || 0) * scale;
        const h = (visual.height || 0) * scale;
        const d = (visual.depth || 0) * scale * 0.5; // Foreshortening depth
        
        const x = centerX - w / 2;
        const y = centerY - h / 2;

        // Front Face
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.stroke();
        ctx.fill();

        // Top Face
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + d, y - d);
        ctx.lineTo(x + w + d, y - d);
        ctx.lineTo(x + w, y);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = '#D1D5DB'; // slightly darker
        ctx.fill();

        // Side Face
        ctx.beginPath();
        ctx.moveTo(x + w, y);
        ctx.lineTo(x + w + d, y - d);
        ctx.lineTo(x + w + d, y + h - d);
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = '#9CA3AF'; // darkest
        ctx.fill();
        
        // Labels
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        if (visual.labels) {
            // Simple label placement approximation
            if (visual.labels.w) ctx.fillText(visual.labels.w, x + w/2, y + h + 15);
            if (visual.labels.h) ctx.fillText(visual.labels.h, x - 20, y + h/2);
            if (visual.labels.d) ctx.fillText(visual.labels.d, x + w + d/2, y - d/2);
        }
    };

    const drawCylinder = () => {
        const r = (visual.radius || 0) * scale;
        const h = (visual.height || 0) * scale;
        
        // Ellipse squash factor
        const squash = 0.3; 
        const ry = r * squash;

        const x = centerX;
        const yTop = centerY - h/2;
        const yBottom = centerY + h/2;

        // Top Ellipse
        ctx.beginPath();
        ctx.ellipse(x, yTop, r, ry, 0, 0, 2 * Math.PI);
        ctx.fillStyle = '#D1D5DB';
        ctx.fill();
        ctx.stroke();

        // Body
        ctx.beginPath();
        ctx.moveTo(x - r, yTop);
        ctx.lineTo(x - r, yBottom);
        // Bottom curve (half ellipse)
        ctx.ellipse(x, yBottom, r, ry, 0, 0, Math.PI, false);
        ctx.lineTo(x + r, yTop);
        ctx.fillStyle = '#E5E7EB';
        ctx.fill();
        
        // Re-stroke sides to cover fill overlap
        ctx.beginPath();
        ctx.moveTo(x - r, yTop);
        ctx.lineTo(x - r, yBottom);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + r, yTop);
        ctx.lineTo(x + r, yBottom);
        ctx.stroke();

        // Bottom full ellipse stroke (optional, but helps depth)
        ctx.beginPath();
        ctx.ellipse(x, yBottom, r, ry, 0, 0, Math.PI, false);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        if (visual.labels) {
            if (visual.labels.r) ctx.fillText(visual.labels.r, x + r/2, yTop - 5);
            if (visual.labels.h) ctx.fillText(visual.labels.h, x + r + 10, centerY);
        }
    };

    // Render based on type
    if (visual.type === 'cube' || visual.type === 'cuboid') {
        drawCubeOrPrism();
    } else if (visual.type === 'cylinder') {
        drawCylinder();
    }

  }, [visual]);

  return (
    <div className="flex justify-center my-4">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={250} 
        className="bg-white rounded-lg"
      />
    </div>
  );
};