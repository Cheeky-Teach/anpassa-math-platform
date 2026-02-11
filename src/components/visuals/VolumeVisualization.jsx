import React, { useRef, useEffect } from 'react';

/**
 * VolumeVisualization - Refined for better fit in Grids
 * Compresses canvas size and scales shapes to fit boundaries.
 */
export const VolumeVisualization = ({ data, width = 180, height = 140 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        
        // Use provided dimensions
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#374151'; 
        ctx.fillStyle = '#f3f4f6';
        ctx.lineWidth = 2; 
        ctx.lineJoin = 'round'; 
        ctx.font = "bold 13px Inter, sans-serif"; 
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle";

        const drawLabel = (text, x, y, color='#dc2626') => { 
            if (!text) return;
            ctx.save(); 
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; 
            const m = ctx.measureText(text);
            ctx.fillRect(x - m.width/2 - 2, y - 9, m.width + 4, 18);
            ctx.fillStyle = color; 
            ctx.fillText(text, x, y); 
            ctx.restore(); 
        };

        const drawDashed = (x1, y1, x2, y2) => { 
            ctx.save(); 
            ctx.setLineDash([4, 4]); 
            ctx.beginPath(); 
            ctx.moveTo(x1, y1); 
            ctx.lineTo(x2, y2); 
            ctx.stroke(); 
            ctx.restore(); 
        };

        // --- DYNAMIC SCALING LOGIC ---
        // Target shape size is relative to canvas height to ensure it fits with labels
        const TARGET_SIZE = h * 0.55; 
        let dims = [];
        if (data.labels) {
            dims = Object.values(data.labels)
                .map(v => parseInt(String(v)))
                .filter(v => !isNaN(v));
        }
        const maxVal = Math.max(...dims, 10);
        const scale = TARGET_SIZE / maxVal;

        if (data.type === 'cuboid') {
            const dw = (parseInt(data.labels.w) || 10) * scale;
            const dh = (parseInt(data.labels.h) || 10) * scale;
            const dd = (parseInt(data.labels.d) || 10) * scale * 0.5;
            
            // Re-center based on specific shape bounds
            const x0 = cx - dw/2 - dd/2;
            const y0 = cy + dh/2 + dd/2 - 10; // Slight upward bias for labels

            ctx.strokeRect(x0, y0 - dh, dw, dh);
            ctx.beginPath(); 
            ctx.moveTo(x0, y0 - dh); 
            ctx.lineTo(x0 + dd, y0 - dh - dd); 
            ctx.lineTo(x0 + dw + dd, y0 - dh - dd); 
            ctx.lineTo(x0 + dw, y0 - dh); 
            ctx.stroke();
            ctx.beginPath(); 
            ctx.moveTo(x0 + dw + dd, y0 - dh - dd); 
            ctx.lineTo(x0 + dw + dd, y0 - dd); 
            ctx.lineTo(x0 + dw, y0); 
            ctx.stroke();
            
            drawLabel(data.labels.w, x0 + dw/2, y0 + 12);
            drawLabel(data.labels.h, x0 - 22, y0 - dh/2);
            drawLabel(data.labels.d, x0 + dw + dd/2 + 8, y0 - dd/2);
        } 
        else if (data.type === 'triangular_prism') {
            const b = (parseInt(data.labels.b) || 10) * scale;
            const hTri = (parseInt(data.labels.h) || 10) * scale;
            const len = (parseInt(data.labels.l) || 20) * scale * 0.6;
            const startX = cx - b/2 - len/2;
            const startY = cy + hTri/2;

            ctx.beginPath();
            ctx.moveTo(startX, startY); ctx.lineTo(startX + b, startY); ctx.lineTo(startX + b/2, startY - hTri); ctx.closePath(); ctx.stroke();
            const offX = len; const offY = -len * 0.3;
            ctx.beginPath(); ctx.moveTo(startX + b/2, startY - hTri); ctx.lineTo(startX + b/2 + offX, startY - hTri + offY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(startX + b, startY); ctx.lineTo(startX + b + offX, startY + offY); ctx.lineTo(startX + b/2 + offX, startY - hTri + offY); ctx.stroke();
            drawDashed(startX + b/2, startY, startX + b/2, startY - hTri);
            drawLabel(data.labels.h, startX + b/2 + 12, startY - hTri/2);
            drawLabel(data.labels.b, startX + b/2, startY + 12);
            drawLabel(data.labels.l, startX + b + offX/2 + 12, startY + offY/2);
        }
        else if (data.type === 'pyramid') {
            const w = (parseInt(data.labels.w || data.labels.s || 10) * scale);
            const d = (parseInt(data.labels.d || data.labels.s || 10) * scale * 0.5); 
            const hPyr = (parseInt(data.labels.h) || 10) * scale;
            const x0 = cx - w/2 - d/2;
            const y0 = cy + hPyr/3; 
            const FL = {x: x0, y: y0}; const FR = {x: x0+w, y: y0};
            const BR = {x: x0+w+d, y: y0-d}; const BL = {x: x0+d, y: y0-d};
            const Apex = {x: x0 + w/2 + d/2, y: y0 - d/2 - hPyr};
            ctx.beginPath(); ctx.moveTo(FL.x, FL.y); ctx.lineTo(FR.x, FR.y); ctx.lineTo(BR.x, BR.y); ctx.stroke();
            ctx.save(); ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(BR.x, BR.y); ctx.lineTo(BL.x, BL.y); ctx.lineTo(FL.x, FL.y); ctx.stroke(); ctx.restore();
            ctx.beginPath(); ctx.moveTo(FL.x, FL.y); ctx.lineTo(Apex.x, Apex.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(FR.x, FR.y); ctx.lineTo(Apex.x, Apex.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(BR.x, BR.y); ctx.lineTo(Apex.x, Apex.y); ctx.stroke();
            ctx.save(); ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(BL.x, BL.y); ctx.lineTo(Apex.x, Apex.y); ctx.stroke(); ctx.restore();
            const centerBase = {x: x0 + w/2 + d/2, y: y0 - d/2};
            drawDashed(centerBase.x, centerBase.y, Apex.x, Apex.y);
            drawLabel("h=" + data.labels.h, Apex.x + 24, centerBase.y - hPyr/2);
            drawLabel(data.labels.w || data.labels.s, x0 + w/2, y0 + 12);
        }
        else {
            // Rounded shapes: cylinder, silo, sphere, etc.
            let r = (parseInt(data.labels.r || (data.labels.d ? data.labels.d/2 : 0)) || 5) * scale * 1.2;
            r = Math.max(25, Math.min(r, w/3));
            
            const drawCircleData = (centerY, showLabel=true) => {
                 const val = data.labels.val || (data.labels.r ? `r=${data.labels.r}` : `d=${data.labels.d}`);
                 if (data.show === 'diameter') {
                     drawDashed(cx - r, centerY, cx + r, centerY);
                     if(showLabel) drawLabel(val, cx, centerY - 12);
                 } else {
                     ctx.beginPath(); ctx.arc(cx, centerY, 2, 0, 2*Math.PI); ctx.fill();
                     drawDashed(cx, centerY, cx + r, centerY);
                     if(showLabel) drawLabel(val, cx + r/2, centerY - 12);
                 }
            };

            if (data.type === 'sphere') {
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI); ctx.stroke();
                ctx.beginPath(); ctx.ellipse(cx, cy, r, r/4, 0, 0, 2*Math.PI); ctx.stroke();
                drawCircleData(cy);
            }
            else if (data.type === 'hemisphere') {
                const yBase = cy + 15;
                ctx.beginPath(); ctx.arc(cx, yBase, r, Math.PI, 0); ctx.stroke();
                ctx.beginPath(); ctx.ellipse(cx, yBase, r, r/4, 0, 0, 2*Math.PI); ctx.stroke();
                drawCircleData(yBase);
            }
            else if (data.type === 'cylinder' || data.type === 'silo') {
                const hCyl = (parseInt(data.labels.h) || 10) * scale;
                const topY = cy - hCyl/2;
                const botY = cy + hCyl/2;
                ctx.beginPath(); ctx.ellipse(cx, topY, r, r/4, 0, 0, 2*Math.PI); ctx.stroke();
                ctx.beginPath(); ctx.ellipse(cx, botY, r, r/4, 0, 0, Math.PI); ctx.stroke();
                ctx.save(); ctx.setLineDash([4,4]); ctx.beginPath(); ctx.ellipse(cx, botY, r, r/4, 0, Math.PI, 2*Math.PI); ctx.stroke(); ctx.restore();
                ctx.beginPath(); ctx.moveTo(cx-r, topY); ctx.lineTo(cx-r, botY); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx+r, topY); ctx.lineTo(cx+r, botY); ctx.stroke();
                drawLabel(data.labels.h, cx + r + 20, cy);
                if (data.type === 'silo') { ctx.beginPath(); ctx.arc(cx, topY, r, Math.PI, 0); ctx.stroke(); }
                drawCircleData(topY, true);
            }
            else if (data.type === 'cone' || data.type === 'ice_cream') {
                 const hCone = (parseInt(data.labels.h) || 10) * scale;
                 if (data.type === 'cone') {
                     const botY = cy + hCone/2; const topY = cy - hCone/2;
                     ctx.beginPath(); ctx.ellipse(cx, botY, r, r/4, 0, 0, Math.PI); ctx.stroke();
                     ctx.save(); ctx.setLineDash([4,4]); ctx.beginPath(); ctx.ellipse(cx, botY, r, r/4, 0, Math.PI, 2*Math.PI); ctx.stroke(); ctx.restore();
                     ctx.beginPath(); ctx.moveTo(cx-r, botY); ctx.lineTo(cx, topY); ctx.lineTo(cx+r, botY); ctx.stroke();
                     drawDashed(cx, botY, cx, topY);
                     drawLabel("h=" + data.labels.h, cx + 10, cy);
                     drawCircleData(botY, true);
                     if (data.labels.s) {
                         drawLabel("s=" + data.labels.s, cx + r/2 + 20, cy);
                     }
                 } else {
                     const seamY = cy - 20; const tipY = seamY + hCone;
                     ctx.beginPath(); ctx.moveTo(cx-r, seamY); ctx.lineTo(cx, tipY); ctx.lineTo(cx+r, seamY); ctx.stroke();
                     ctx.beginPath(); ctx.arc(cx, seamY, r, Math.PI, 0); ctx.stroke();
                     ctx.beginPath(); ctx.ellipse(cx, seamY, r, r/4, 0, 0, 2*Math.PI); ctx.stroke();
                     drawLabel(data.labels.h, cx + r + 15, seamY + hCone/2);
                     drawCircleData(seamY, true);
                 }
            }
        }
    }, [data, width, height]);

    return (
        <div className="flex justify-center items-center p-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <canvas 
                ref={canvasRef} 
                width={width} 
                height={height} 
                className="max-w-full h-auto"
            />
        </div>
    );
};