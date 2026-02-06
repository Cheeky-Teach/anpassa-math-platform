import React, { useRef, useEffect } from 'react';

export const GraphCanvas = ({ data }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const range = data.range || 10;
        ctx.clearRect(0, 0, width, height);
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const toX = (val) => (val + range) * (width / (range * 2));
        const toY = (val) => height - (val + range) * (height / (range * 2));
        
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = -range; i <= range; i += data.gridStep || 1) {
            ctx.beginPath(); ctx.moveTo(toX(i), 0); ctx.lineTo(toX(i), height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, toY(i)); ctx.lineTo(width, toY(i)); ctx.stroke();
        }
        ctx.strokeStyle = '#374151'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(toX(0), 0); ctx.lineTo(toX(0), height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, toY(0)); ctx.lineTo(width, toY(0)); ctx.stroke();
        ctx.fillStyle = '#6b7280';
        const step = data.labelStep || 2;
        for (let i = -range; i <= range; i += step) {
            if (i === 0) continue;
            const xPos = toX(i); const yOrigin = toY(0);
            ctx.beginPath(); ctx.moveTo(xPos, yOrigin - 3); ctx.lineTo(xPos, yOrigin + 3); ctx.stroke();
            ctx.fillText(i.toString(), xPos, yOrigin + 12);
            const yPos = toY(i); const xOrigin = toX(0);
            ctx.beginPath(); ctx.moveTo(xOrigin - 3, yPos); ctx.lineTo(xOrigin + 3, yPos); ctx.stroke();
            ctx.fillText(i.toString(), xOrigin - 12, yPos);
        }
        data.lines.forEach(line => {
            ctx.strokeStyle = line.color || '#dc2626'; ctx.lineWidth = 3;
            ctx.beginPath();
            const x1 = -range; const y1 = line.slope * x1 + line.intercept;
            const x2 = range; const y2 = line.slope * x2 + line.intercept;
            ctx.moveTo(toX(x1), toY(y1)); ctx.lineTo(toX(x2), toY(y2)); ctx.stroke();
        });
    }, [data]);
    return <div className="flex justify-center my-4"><canvas ref={canvasRef} width={240} height={240} className="bg-white rounded border border-gray-300 shadow-sm" /></div>;
};