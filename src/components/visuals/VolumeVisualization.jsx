import React, { useRef, useEffect, useState } from 'react';

/**
 * VolumeVisualization - Responsive 3D Geometry Renderer
 * Auto-scales all shapes and external brackets safely within the canvas bounds.
 */
export const VolumeVisualization = ({ data }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setDimensions({ width, height });
                }
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data || dimensions.width === 0 || dimensions.height === 0) return;
        const ctx = canvas.getContext('2d');

        const dpr = window.devicePixelRatio || 2;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;

        ctx.resetTransform?.();
        ctx.scale(dpr, dpr);

        const w = dimensions.width;
        const h = dimensions.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        const STROKE_COLOR = '#1e293b';
        const STROKE_WIDTH = 2.5;
        const FILL_TINT = 'rgba(99, 102, 241, 0.08)';
        const GUIDE_COLOR = '#94a3b8';

        ctx.strokeStyle = STROKE_COLOR;
        ctx.fillStyle = FILL_TINT;
        ctx.lineWidth = STROKE_WIDTH;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        const fontSize = 14;
        ctx.font = `800 ${fontSize}px Nunito, system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const drawLabel = (text, x, y, color = '#0f172a', haloColor = '#ffffff', align = 'center') => {
            if (text === undefined || text === null) return;
            const labelStr = String(text);
            ctx.save();
            ctx.textAlign = align;
            ctx.textBaseline = 'middle';
            ctx.lineWidth = 5;
            ctx.strokeStyle = haloColor;
            ctx.strokeText(labelStr, x, y);
            ctx.fillStyle = color;
            ctx.fillText(labelStr, x, y);
            ctx.restore();
        };

        const drawDashed = (x1, y1, x2, y2, color = GUIDE_COLOR) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.75;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
        };

        const labels = data.labels || {};
        const type = (data.type || '').toLowerCase();
        const subtype = (data.subtype || (data.dims && data.dims.subtype) || '').toLowerCase();

        // Explicit check for 3D diagonal intent
        const isDiagonalMode = 
            subtype === 'box_diagonal' || 
            subtype === 'space_diagonal' || 
            Boolean(data.showDiagonal) ||
            Boolean(labels.space_diag);

        const diagLabel = isDiagonalMode 
            ? (labels.space_diag || labels.diagonal || (labels.d && labels.depth ? labels.d : '?'))
            : null;

        // Front horizontal base: width / base / length
        const labelW = labels.w || labels.width || labels.b || labels.base || labels.s || (!labels.w && labels.l ? labels.l : null);

        // Vertical height
        const labelH = labels.h || labels.height;

        // Slanted depth edge
        const labelD = labels.depth || labels.djup || labels.bredd || 
            (!isDiagonalMode ? (labels.d || labels.l) : (labels.space_diag ? (labels.d || labels.l) : null));
            
        const valW = parseFloat(labelW) || 10;
        const valH = parseFloat(labelH) || 10;
        const valD = parseFloat(labelD) || valW;
        const rawD = parseFloat(labels.d);
        const valR = parseFloat(labels.r) || (rawD ? rawD / 2 : 5);

        const hasRightHeightIndicator = ['cylinder', 'silo', 'cone', 'ice_cream', 'pyramid'].includes(type) && labelH;

        // 1. Calculate true total unit footprint
        let totalUnitW = 10;
        let totalUnitH = 10;

        if (type === 'cuboid') {
            totalUnitW = valW + (valD * 0.55);
            totalUnitH = (valH * 0.85) + (valD * 0.55);
        } else if (type === 'triangular_prism') {
            totalUnitW = valW + (valD * 0.7);
            totalUnitH = valH;
        } else if (type === 'pyramid') {
            totalUnitW = valW + (valD * 0.5);
            totalUnitH = valH + (valD * 0.3);
        } else if (type === 'sphere') {
            totalUnitW = valR * 2;
            totalUnitH = valR * 2;
        } else if (type === 'ice_cream') {
            totalUnitW = valR * 2;
            totalUnitH = valH + valR + (valR * 0.35);
        } else if (type === 'silo') {
            totalUnitW = valR * 2;
            totalUnitH = valH + valR + (valR * 0.65);
        } else {
            totalUnitW = valR * 2;
            totalUnitH = valH + (valR * 0.65);
        }

        // 2. Safe Margins
        const padTop = (type === 'cuboid' || type === 'ice_cream' || type === 'silo') ? 34 : 24;
        const padBottom = 28;
        const padLeft = type === 'triangular_prism' ? 44 : 20;
        const padRight = hasRightHeightIndicator ? 58 : (type === 'cuboid' ? 36 : 20);

        const maxAvailableW = Math.max(50, w - (padLeft + padRight));
        const maxAvailableH = Math.max(50, h - (padTop + padBottom));

        const scale = Math.min(
            maxAvailableW / Math.max(totalUnitW, 1),
            maxAvailableH / Math.max(totalUnitH, 1)
        );

        const effectiveCx = (padLeft + (w - padRight)) / 2;
        const effectiveCy = (padTop + (h - padBottom)) / 2;
        const labelGap = 15;

        // --- CUBOID ---
        if (type === 'cuboid') {
            const dw = valW * scale;
            const dh = valH * scale * 0.85;
            const dd = valD * scale * 0.45;

            const x0 = effectiveCx - (dw + dd) / 2;
            const y0 = effectiveCy + (dh + dd) / 2;

            // Rear dashed edges
            drawDashed(x0 + dd, y0 - dd, x0 + dd, y0 - dh - dd);
            drawDashed(x0, y0, x0 + dd, y0 - dd);
            drawDashed(x0 + dd, y0 - dd, x0 + dw + dd, y0 - dd);

            // Front face
            ctx.fillRect(x0, y0 - dh, dw, dh);
            ctx.strokeRect(x0, y0 - dh, dw, dh);

            // Top face
            ctx.beginPath();
            ctx.moveTo(x0, y0 - dh);
            ctx.lineTo(x0 + dd, y0 - dh - dd);
            ctx.lineTo(x0 + dw + dd, y0 - dh - dd);
            ctx.lineTo(x0 + dw, y0 - dh);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Right face
            ctx.beginPath();
            ctx.moveTo(x0 + dw, y0 - dh);
            ctx.lineTo(x0 + dw + dd, y0 - dh - dd);
            ctx.lineTo(x0 + dw + dd, y0 - dd);
            ctx.lineTo(x0 + dw, y0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Dimension labels
            if (labelW) drawLabel(labelW, x0 + dw / 2, y0 + labelGap);
            if (labelH) drawLabel(labelH, x0 - labelGap, y0 - dh / 2);
            if (labelD) drawLabel(labelD, x0 + dw + dd / 2 + 12, y0 - dd / 2 + 6);

            // 3D Space Diagonal (ONLY when in diagonal mode)
            if (isDiagonalMode && diagLabel) {
                const pStartX = x0 + dd;
                const pStartY = y0 - dd;
                const pEndX = x0 + dw;
                const pEndY = y0 - dh;

                // Base floor diagonal guideline
                drawDashed(x0, y0, x0 + dw + dd, y0 - dd, '#94a3b8');

                // Main 3D Space Diagonal line
                ctx.save();
                ctx.strokeStyle = '#4f46e5';
                ctx.lineWidth = 2.4;
                ctx.setLineDash([5, 4]);
                ctx.beginPath();
                ctx.moveTo(pStartX, pStartY);
                ctx.lineTo(pEndX, pEndY);
                ctx.stroke();
                ctx.restore();

                // Vertex markers
                ctx.beginPath();
                ctx.arc(pStartX, pStartY, 3.5, 0, 2 * Math.PI);
                ctx.arc(pEndX, pEndY, 3.5, 0, 2 * Math.PI);
                ctx.fillStyle = '#4f46e5';
                ctx.fill();

                // Diagonal label centered along the line
                drawLabel(diagLabel, (pStartX + pEndX) / 2 - 12, (pStartY + pEndY) / 2 - 10, '#4f46e5', '#ffffff');
            }
        }
        // --- TRIANGULAR PRISM ---
        else if (type === 'triangular_prism') {
            const b = valW * scale;
            const hTri = valH * scale;
            const l = valD * scale * 0.7;
            const x0 = effectiveCx - (b + l) / 2;
            const y0 = effectiveCy + (hTri / 2);
            const apexY = y0 - hTri;

            ctx.beginPath();
            ctx.moveTo(x0 + b / 2, apexY);
            ctx.lineTo(x0 + b / 2 + l, apexY - l * 0.2);
            ctx.lineTo(x0 + b + l, y0 - l * 0.2);
            ctx.lineTo(x0 + b, y0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + b, y0);
            ctx.lineTo(x0 + b / 2, apexY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            drawDashed(x0 + b / 2, y0, x0 + b / 2, apexY);

            const hIndX = x0 - labelGap;
            drawDashed(x0, y0, hIndX, y0);
            drawDashed(x0 + b / 2, apexY, hIndX, apexY);
            ctx.beginPath();
            ctx.moveTo(hIndX, y0);
            ctx.lineTo(hIndX, apexY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(hIndX - 4, y0); ctx.lineTo(hIndX + 4, y0);
            ctx.moveTo(hIndX - 4, apexY); ctx.lineTo(hIndX + 4, apexY);
            ctx.stroke();

            const hLabel = labelH ? `h = ${labelH}` : `h`;
            drawLabel(hLabel, hIndX - 6, (y0 + apexY) / 2, '#0f172a', '#ffffff', 'right');
            if (labelW) drawLabel(labelW, x0 + b / 2, y0 + labelGap);
            if (labelD) drawLabel(labelD, x0 + b + l / 2 + 14, y0 - l * 0.1);
        }
        // --- PYRAMID ---
        else if (type === 'pyramid') {
            const pw = valW * scale;
            const ph = valH * scale;
            const pd = valD * scale * 0.5;
            const x0 = effectiveCx - (pw + pd) / 2;
            const y0 = effectiveCy + (ph / 2);
            const apex = { x: x0 + pw / 2 + pd / 2, y: y0 - pd / 2 - ph };
            const baseY = y0 - pd / 2;

            drawDashed(x0, y0, x0 + pd, y0 - pd);
            drawDashed(x0 + pd, y0 - pd, x0 + pw + pd, y0 - pd);
            drawDashed(x0 + pd, y0 - pd, apex.x, apex.y);
            drawDashed(apex.x, baseY, apex.x, apex.y);

            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + pw, y0);
            ctx.lineTo(x0 + pw + pd, y0 - pd);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(apex.x, apex.y);
            ctx.lineTo(x0 + pw, y0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x0 + pw, y0);
            ctx.lineTo(apex.x, apex.y);
            ctx.lineTo(x0 + pw + pd, y0 - pd);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            if (labelH) {
                const hIndX = apex.x + pw / 2 + 14;
                drawDashed(apex.x, apex.y, hIndX, apex.y);
                drawDashed(apex.x, baseY, hIndX, baseY);
                ctx.beginPath();
                ctx.moveTo(hIndX, apex.y);
                ctx.lineTo(hIndX, baseY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(hIndX - 4, apex.y); ctx.lineTo(hIndX + 4, apex.y);
                ctx.moveTo(hIndX - 4, baseY); ctx.lineTo(hIndX + 4, baseY);
                ctx.stroke();

                drawLabel(`h = ${labelH}`, hIndX + 6, (apex.y + baseY) / 2, '#0f172a', '#ffffff', 'left');
            }

            if (labelW) drawLabel(labelW, x0 + pw / 2, y0 + labelGap);
            if (valW !== valD && labelD) drawLabel(labelD, x0 + pw + pd / 2 + 12, y0 - pd / 2 + 4);
        }
        // --- CYLINDER, SILO, CONE, ICE CREAM, SPHERE ---
        else {
            const r = valR * scale;
            const vh = valH * scale;

            const drawCircleBase = (x, y, rad, isDashed = false) => {
                ctx.beginPath();
                ctx.ellipse(x, y, rad, rad / 3.2, 0, 0, Math.PI, false);
                ctx.stroke();
                if (isDashed) {
                    ctx.save();
                    ctx.strokeStyle = GUIDE_COLOR;
                    ctx.lineWidth = 1.75;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.ellipse(x, y, rad, rad / 3.2, 0, Math.PI, 2 * Math.PI, false);
                    ctx.stroke();
                    ctx.restore();
                } else {
                    ctx.beginPath();
                    ctx.ellipse(x, y, rad, rad / 3.2, 0, Math.PI, 2 * Math.PI, false);
                    ctx.stroke();
                }
            };

            const drawRadiusOrDiameter = (x, y, rad, isCone = false) => {
                const isDiam = data.show === 'diameter';
                const labelText = isDiam
                    ? (labels.d ? `d = ${labels.d}` : `d = ${valR * 2}`)
                    : (labels.r ? `r = ${labels.r}` : `r = ${valR}`);
                const labelYOffset = isCone ? (rad / 3.2 + labelGap + 2) : -(rad / 3.2 + labelGap);

                if (isDiam) {
                    drawDashed(x - rad, y, x + rad, y);
                    drawLabel(labelText, x, y + labelYOffset);
                } else {
                    ctx.beginPath();
                    ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
                    ctx.fillStyle = STROKE_COLOR;
                    ctx.fill();
                    drawDashed(x, y, x + rad, y);
                    drawLabel(labelText, x + rad / 2, y + labelYOffset);
                }
            };

            if (type === 'cylinder' || type === 'silo') {
                const yTop = effectiveCy - vh / 2;
                const yBot = effectiveCy + vh / 2;

                ctx.beginPath();
                ctx.ellipse(effectiveCx, yTop, r, r / 3.2, 0, 0, Math.PI * 2);
                ctx.rect(effectiveCx - r, yTop, r * 2, yBot - yTop);
                ctx.fill();

                drawCircleBase(effectiveCx, yTop, r, false);
                drawCircleBase(effectiveCx, yBot, r, true);
                ctx.beginPath();
                ctx.moveTo(effectiveCx - r, yTop);
                ctx.lineTo(effectiveCx - r, yBot);
                ctx.moveTo(effectiveCx + r, yTop);
                ctx.lineTo(effectiveCx + r, yBot);
                ctx.stroke();

                if (type === 'silo') {
                    ctx.beginPath();
                    ctx.arc(effectiveCx, yTop, r, Math.PI, 0);
                    ctx.stroke();
                }
                drawRadiusOrDiameter(effectiveCx, yTop, r);

                if (labelH) {
                    const hIndX = effectiveCx + r + 14;
                    drawDashed(effectiveCx, yTop, hIndX, yTop);
                    drawDashed(effectiveCx, yBot, hIndX, yBot);
                    ctx.beginPath();
                    ctx.moveTo(hIndX, yTop);
                    ctx.lineTo(hIndX, yBot);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(hIndX - 4, yTop); ctx.lineTo(hIndX + 4, yTop);
                    ctx.moveTo(hIndX - 4, yBot); ctx.lineTo(hIndX + 4, yBot);
                    ctx.stroke();

                    drawLabel(`h = ${labelH}`, hIndX + 6, effectiveCy, '#0f172a', '#ffffff', 'left');
                }
            }
            else if (type === 'cone' || type === 'ice_cream') {
                const isIceCream = type === 'ice_cream';
                const totalH = isIceCream ? (vh + r) : vh;
                
                const yBase = isIceCream 
                    ? effectiveCy - (totalH / 2) + r 
                    : effectiveCy + (vh / 2);
                    
                const apexY = isIceCream 
                    ? yBase + vh 
                    : yBase - vh;

                ctx.beginPath();
                ctx.moveTo(effectiveCx - r, yBase);
                ctx.lineTo(effectiveCx, apexY);
                ctx.lineTo(effectiveCx + r, yBase);
                ctx.closePath();
                ctx.fill();

                drawCircleBase(effectiveCx, yBase, r, !isIceCream);
                
                ctx.beginPath();
                ctx.moveTo(effectiveCx - r, yBase);
                ctx.lineTo(effectiveCx, apexY);
                ctx.lineTo(effectiveCx + r, yBase);
                ctx.stroke();

                if (isIceCream) {
                    ctx.beginPath();
                    ctx.arc(effectiveCx, yBase, r, Math.PI, 0, false);
                    ctx.fill();
                    ctx.stroke();
                }

                drawRadiusOrDiameter(effectiveCx, yBase, r, !isIceCream);

                if (labelH) {
                    const hIndicatorX = effectiveCx + r + 14;
                    drawDashed(effectiveCx, apexY, hIndicatorX, apexY);
                    drawDashed(effectiveCx, yBase, hIndicatorX, yBase);
                    ctx.beginPath();
                    ctx.moveTo(hIndicatorX, apexY);
                    ctx.lineTo(hIndicatorX, yBase);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(hIndicatorX - 4, apexY); ctx.lineTo(hIndicatorX + 4, apexY);
                    ctx.moveTo(hIndicatorX - 4, yBase); ctx.lineTo(hIndicatorX + 4, yBase);
                    ctx.stroke();

                    drawLabel(`h = ${labelH}`, hIndicatorX + 6, (yBase + apexY) / 2, '#0f172a', '#ffffff', 'left');
                }
            }
            else if (type === 'sphere') {
                ctx.beginPath();
                ctx.arc(effectiveCx, effectiveCy, r, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();

                ctx.save();
                ctx.strokeStyle = GUIDE_COLOR;
                ctx.lineWidth = 1.75;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.ellipse(effectiveCx, effectiveCy, r, r / 3.2, 0, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.restore();

                drawRadiusOrDiameter(effectiveCx, effectiveCy, r);
            }
        }
    }, [data, dimensions]);

    return (
        <div 
            ref={containerRef} 
            className="flex justify-center items-center w-full h-full p-0 bg-transparent overflow-hidden"
        >
            <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
                className="object-contain"
            />
        </div>
    );
};