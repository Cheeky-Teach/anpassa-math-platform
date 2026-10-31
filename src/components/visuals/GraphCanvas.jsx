import React, { useRef, useEffect } from 'react';

export const GraphCanvas = ({ data, width: customWidth, height: customHeight }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // 1. Boundary & Step Normalization (Supports legacy isotropic or new asymmetric)
        const range = data.range || 10;
        const xMin = data.xMin !== undefined ? data.xMin : -range;
        const xMax = data.xMax !== undefined ? data.xMax : range;
        const yMin = data.yMin !== undefined ? data.yMin : -range;
        const yMax = data.yMax !== undefined ? data.yMax : range;

        const xSpan = xMax - xMin || 1;
        const ySpan = yMax - yMin || 1;

        const xGridStep = data.xGridStep || data.gridStep || (xSpan <= 20 ? 1 : Math.round(xSpan / 10));
        const yGridStep = data.yGridStep || data.gridStep || (ySpan <= 20 ? 1 : Math.round(ySpan / 10));

        const xLabelStep = data.xLabelStep || data.labelStep || xGridStep * 2;
        const yLabelStep = data.yLabelStep || data.labelStep || yGridStep * 2;

        // Margins for axis labels / titles
        const padLeft = data.yLabel ? 42 : 32;
        const padBottom = data.xLabel ? 32 : 24;
        const padRight = 16;
        const padTop = 16;

        const plotW = width - padLeft - padRight;
        const plotH = height - padTop - padBottom;

        // Coordinate transformation helpers
        const toX = (val) => padLeft + ((val - xMin) / xSpan) * plotW;
        const toY = (val) => padTop + plotH - ((val - yMin) / ySpan) * plotH;

        ctx.clearRect(0, 0, width, height);
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textBaseline = 'middle';

        // 2. Draw Grid Lines
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;

        // Vertical grid lines
        for (let x = Math.ceil(xMin / xGridStep) * xGridStep; x <= xMax; x += xGridStep) {
            const px = toX(x);
            ctx.beginPath();
            ctx.moveTo(px, padTop);
            ctx.lineTo(px, padTop + plotH);
            ctx.stroke();
        }

        // Horizontal grid lines
        for (let y = Math.ceil(yMin / yGridStep) * yGridStep; y <= yMax; y += yGridStep) {
            const py = toY(y);
            ctx.beginPath();
            ctx.moveTo(padLeft, py);
            ctx.lineTo(padLeft + plotW, py);
            ctx.stroke();
        }

        // 3. Draw Main Axes (Clamped or crossing at 0)
        const originX = Math.max(padLeft, Math.min(padLeft + plotW, toX(0)));
        const originY = Math.max(padTop, Math.min(padTop + plotH, toY(0)));

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(originX, padTop);
        ctx.lineTo(originX, padTop + plotH);
        ctx.stroke();

        // X-axis
        ctx.beginPath();
        ctx.moveTo(padLeft, originY);
        ctx.lineTo(padLeft + plotW, originY);
        ctx.stroke();

        // 4. Draw Numeric Ticks & Text Labels
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';

        // X numbers
        for (let x = Math.ceil(xMin / xLabelStep) * xLabelStep; x <= xMax; x += xLabelStep) {
            if (x === 0 && xMin < 0 && xMax > 0) continue;
            const px = toX(x);
            ctx.beginPath();
            ctx.moveTo(px, originY - 3);
            ctx.lineTo(px, originY + 3);
            ctx.stroke();

            const textY = originY >= padTop + plotH - 12 ? originY - 10 : originY + 12;
            ctx.fillText(x.toString(), px, textY);
        }

        // Y numbers
        ctx.textAlign = 'right';
        for (let y = Math.ceil(yMin / yLabelStep) * yLabelStep; y <= yMax; y += yLabelStep) {
            if (y === 0 && yMin < 0 && yMax > 0) continue;
            const py = toY(y);
            ctx.beginPath();
            ctx.moveTo(originX - 3, py);
            ctx.lineTo(originX + 3, py);
            ctx.stroke();

            const textX = originX <= padLeft + 16 ? originX + 16 : originX - 6;
            ctx.fillText(y.toString(), textX, py);
        }

        // 5. Draw Optional Axis Titles (e.g. "Timmar", "kr")
        if (data.xLabel) {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#334155';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.fillText(data.xLabel, padLeft + plotW / 2, height - 6);
        }
        if (data.yLabel) {
            ctx.save();
            ctx.translate(10, padTop + plotH / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#334155';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.fillText(data.yLabel, 0, 0);
            ctx.restore();
        }

        // 6. Draw Line Plots (Clipped within plot area)
        ctx.save();
        ctx.beginPath();
        ctx.rect(padLeft, padTop, plotW, plotH);
        ctx.clip();

        (data.lines || []).forEach(line => {
            ctx.strokeStyle = line.color || '#2563eb';
            ctx.lineWidth = line.width || 2.5;
            ctx.beginPath();

            const yAtMin = line.slope * xMin + line.intercept;
            const yAtMax = line.slope * xMax + line.intercept;

            ctx.moveTo(toX(xMin), toY(yAtMin));
            ctx.lineTo(toX(xMax), toY(yAtMax));
            ctx.stroke();
        });

        ctx.restore();
    }, [data]);

    return (
        <div className="flex justify-center my-2 max-w-full">
            <canvas 
                ref={canvasRef} 
                width={customWidth || 300} 
                height={customHeight || 240} 
                className="bg-white rounded-2xl border border-slate-200 shadow-xs max-w-full aspect-[5/4]" 
            />
        </div>
    );
};