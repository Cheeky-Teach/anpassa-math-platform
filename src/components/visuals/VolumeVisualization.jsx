import React, { useRef, useEffect, useState } from 'react';

/**
 * VolumeVisualization - Refactored to be fully responsive to its parent container.
 */
export const VolumeVisualization = ({ data }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Handle container resizing
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data || dimensions.width === 0) return;
        const ctx = canvas.getContext('2d');
        
        // Internal resolution (doubled for sharpness)
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#1f2937'; 
        ctx.fillStyle = '#f3f4f6';
        ctx.lineWidth = 3; 
        ctx.lineJoin = 'round'; 

        // High visibility font settings
        const fontSize = 28; 
        ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`; 
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle";

        const drawLabel = (text, x, y, color='#be123c') => { 
            if (text === undefined || text === null) return;
            const labelStr = String(text);
            ctx.save(); 
            
            const m = ctx.measureText(labelStr);
            const pW = 10;
            const pH = 6;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'; 
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x - m.width/2 - pW, y - fontSize/2 - pH, m.width + (pW * 2), fontSize + (pH * 2), 8);
                ctx.fill();
            } else {
                ctx.fillRect(x - m.width/2 - pW, y - fontSize/2 - pH, m.width + (pW * 2), fontSize + (pH * 2));
            }
            
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = color; 
            ctx.fillText(labelStr, x, y); 
            ctx.restore(); 
        };

        const drawDashed = (x1, y1, x2, y2) => { 
            ctx.save(); 
            ctx.setLineDash([10, 10]); 
            ctx.beginPath(); 
            ctx.moveTo(x1, y1); 
            ctx.lineTo(x2, y2); 
            ctx.stroke(); 
            ctx.restore(); 
        };

        // --- SAFE SCALING LOGIC ---
        const labels = data.labels || {};
        const type = (data.type || '').toLowerCase();

        const valW = parseInt(labels.w || labels.s || labels.b) || 10;
        const valH = parseInt(labels.h) || 10;
        const valD = parseInt(labels.d || labels.l) || 10;
        const rawD = parseInt(labels.d);
        const valR = parseInt(labels.r) || (rawD ? rawD / 2 : 5);

        let logicalW = 10, logicalH = 10;

        if (type === 'cuboid') {
            logicalW = valW + (valD * 0.6);
            logicalH = valH + (valD * 0.6);
        } else if (type === 'triangular_prism') {
            logicalW = valW + (valD * 0.8);
            logicalH = valH + (valD * 0.4);
        } else if (type === 'pyramid') {
            logicalW = valW + (valD * 0.6);
            logicalH = valH + (valD * 0.6);
        } else if (type === 'sphere') {
            logicalW = valR * 2.6;
            logicalH = valR * 2.6;
        } else {
            logicalW = valR * 3; 
            logicalH = valH + (valR * 0.8);
        }

        // Scaling remains identical, now using dynamic dimensions
        const scale = (Math.min(w, h) * 0.52) / Math.max(logicalW, logicalH);
        const labelGap = 42; 

        // --- DRAWING FUNCTIONS ---
        if (type === 'cuboid') {
            const dw = valW * scale;
            const dh = valH * scale;
            const dd = valD * scale * 0.5;
            const x0 = cx - (dw + dd) / 2;
            const y0 = cy + (dh - dd) / 2;

            drawDashed(x0 + dd, y0 - dd, x0 + dd, y0 - dh - dd);
            drawDashed(x0, y0, x0 + dd, y0 - dd);
            drawDashed(x0 + dd, y0 - dd, x0 + dw + dd, y0 - dd);

            ctx.strokeRect(x0, y0 - dh, dw, dh);
            ctx.beginPath();
            ctx.moveTo(x0, y0 - dh); ctx.lineTo(x0 + dd, y0 - dh - dd);
            ctx.lineTo(x0 + dw + dd, y0 - dh - dd); ctx.lineTo(x0 + dw, y0 - dh);
            ctx.moveTo(x0 + dw + dd, y0 - dh - dd); ctx.lineTo(x0 + dw + dd, y0 - dd);
            ctx.lineTo(x0 + dw, y0);
            ctx.stroke();

            drawLabel(labels.w, x0 + dw/2, y0 + labelGap);
            drawLabel(labels.h, x0 - labelGap - 10, y0 - dh/2);
            drawLabel(labels.d, x0 + dw + dd + 25, y0 - dh/2 - dd/2);
        } 
        else if (type === 'triangular_prism') {
            const b = valW * scale;
            const hTri = valH * scale;
            const l = valD * scale * 0.7;
            const x0 = cx - (b + l) / 2;
            const y0 = cy + (hTri / 2);

            ctx.beginPath();
            ctx.moveTo(x0, y0); ctx.lineTo(x0 + b, y0); ctx.lineTo(x0 + b/2, y0 - hTri); ctx.closePath(); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x0 + b/2, y0 - hTri); ctx.lineTo(x0 + b/2 + l, y0 - hTri - l*0.2);
            ctx.lineTo(x0 + b + l, y0 - l*0.2); ctx.lineTo(x0 + b, y0);
            ctx.moveTo(x0 + b/2 + l, y0 - hTri - l*0.2); ctx.lineTo(x0 + b + l, y0 - l*0.2);
            ctx.stroke();

            drawDashed(x0 + b/2, y0, x0 + b/2, y0 - hTri);
            drawLabel(labels.h, x0 + b/2 - 25, y0 - hTri/2);
            drawLabel(labels.b, x0 + b/2, y0 + labelGap);
            drawLabel(labels.l, x0 + b + l/2 + 25, y0 - l*0.1);
        }
        else if (type === 'pyramid') {
            const pw = valW * scale;
            const ph = valH * scale;
            const pd = valD * scale * 0.5;
            const x0 = cx - (pw + pd)/2;
            const y0 = cy + (ph/2);
            const apex = { x: x0 + pw/2 + pd/2, y: y0 - pd/2 - ph };

            ctx.beginPath();
            ctx.moveTo(x0, y0); ctx.lineTo(x0 + pw, y0); ctx.lineTo(x0 + pw + pd, y0 - pd);
            ctx.stroke();
            drawDashed(x0, y0, x0 + pd, y0 - pd);
            drawDashed(x0 + pd, y0 - pd, x0 + pw + pd, y0 - pd);

            ctx.beginPath();
            ctx.moveTo(x0, y0); ctx.lineTo(apex.x, apex.y);
            ctx.lineTo(x0 + pw, y0); ctx.lineTo(apex.x, apex.y);
            ctx.lineTo(x0 + pw + pd, y0 - pd);
            ctx.stroke();
            drawDashed(x0 + pd, y0 - pd, apex.x, apex.y);
            drawDashed(apex.x, y0 - pd/2, apex.x, apex.y);

            drawLabel(labels.h, apex.x + labelGap + 15, (y0 - pd/2 + apex.y)/2);
            drawLabel(labels.w || labels.s, x0 + pw/2, y0 + labelGap);
        }
        else {
            const r = valR * scale;
            const vh = valH * scale;

            const drawCircleBase = (x, y, rad, isDashed = false) => {
                ctx.beginPath();
                ctx.ellipse(x, y, rad, rad/3, 0, 0, Math.PI, false);
                ctx.stroke();
                if (isDashed) {
                    ctx.save(); ctx.setLineDash([8,8]);
                    ctx.beginPath(); ctx.ellipse(x, y, rad, rad/3, 0, Math.PI, 2*Math.PI, false);
                    ctx.stroke(); ctx.restore();
                } else {
                    ctx.beginPath(); ctx.ellipse(x, y, rad, rad/3, 0, Math.PI, 2*Math.PI, false);
                    ctx.stroke();
                }
            };

            const drawRadiusOrDiameter = (x, y, rad) => {
                const isDiam = data.show === 'diameter';
                const labelText = isDiam ? (labels.d ? `d = ${labels.d}` : `d = ${valR * 2}`) : (labels.r ? `r = ${labels.r}` : `r = ${valR}`);
                if (isDiam) {
                    drawDashed(x - rad, y, x + rad, y);
                    drawLabel(labelText, x, y - labelGap);
                } else {
                    ctx.beginPath(); ctx.arc(x, y, 6, 0, 2*Math.PI); ctx.fill();
                    drawDashed(x, y, x + rad, y);
                    drawLabel(labelText, x + rad/2, y - labelGap);
                }
            };

            if (type === 'cylinder' || type === 'silo') {
                const yTop = cy - vh/2; const yBot = cy + vh/2;
                drawCircleBase(cx, yTop, r, false);
                drawCircleBase(cx, yBot, r, true);
                ctx.beginPath();
                ctx.moveTo(cx - r, yTop); ctx.lineTo(cx - r, yBot);
                ctx.moveTo(cx + r, yTop); ctx.lineTo(cx + r, yBot);
                ctx.stroke();
                if (type === 'silo') { ctx.beginPath(); ctx.arc(cx, yTop, r, Math.PI, 0); ctx.stroke(); }
                drawRadiusOrDiameter(cx, yTop, r);
                drawLabel(labels.h, cx + r + labelGap, cy);
            }
            else if (type === 'cone' || type === 'ice_cream') {
                const yBase = type === 'cone' ? cy + vh/2 : cy - 20;
                const apexY = type === 'cone' ? yBase - vh : yBase + vh;
                drawCircleBase(cx, yBase, r, type === 'cone');
                ctx.beginPath();
                ctx.moveTo(cx - r, yBase); ctx.lineTo(cx, apexY); ctx.lineTo(cx + r, yBase);
                ctx.stroke();
                if (type === 'ice_cream') { ctx.beginPath(); ctx.arc(cx, yBase, r, Math.PI, 0); ctx.stroke(); }
                drawRadiusOrDiameter(cx, yBase, r);
                drawLabel(labels.h, cx + r + labelGap, (yBase + apexY)/2);
            }
            else if (type === 'sphere') {
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI); ctx.stroke();
                ctx.beginPath(); ctx.ellipse(cx, cy, r, r/3, 0, 0, 2*Math.PI); ctx.stroke();
                drawRadiusOrDiameter(cx, cy, r);
            }
        }
    }, [data, dimensions]);

    return (
        <div 
            ref={containerRef} 
            className="flex justify-center items-center w-full h-full p-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
            <canvas 
                ref={canvasRef} 
                width={dimensions.width * 2} 
                height={dimensions.height * 2} 
                style={{ width: '100%', height: '100%', display: 'block' }}
                className="object-contain"
            />
        </div>
    );
};