import React, { useRef, useEffect } from 'react';

// ----------------------------------------------------------------------
// 2D GEOMETRY VISUAL (Triangles, Circles, Polygons)
// ----------------------------------------------------------------------
export const GeometryVisual = ({ data }) => {
    if (!data) return null;
    const SvgContainer = ({ children, w = 300, h = 200, viewBox = "0 0 300 200" }) => <svg width={w} height={h} viewBox={viewBox} className="my-2 w-full max-w-[300px] mx-auto">{children}</svg>;
    
    const mkTxt = (x, y, txt, anchor="middle", baseline="middle", color="#374151") => 
        <text x={x} y={y} textAnchor={anchor} dominantBaseline={baseline} fontWeight="bold" fill={color} fontSize="20">{txt}</text>;

    // Helper to render individual shapes (used for single questions AND comparisons)
    const RenderShape = ({ type, dims, labels, areaText, offsetX = 0, offsetY = 0, scale = 1 }) => {
        // Local scale for the specific shape instance
        const cx = 150 + offsetX;
        const cy = 100 + offsetY;
        
        // Base size 120 ensures it fits in a half-view
        const baseScale = (120 / (Math.max(dims.width || 0, dims.height || 0, (dims.radius || 0)*2) || 1)) * scale;

        const sw = (dims.width || 0) * baseScale;
        const sh = (dims.height || 0) * baseScale;
        const sr = (dims.radius || 0) * baseScale;

        // --- RECTANGLE / SQUARE ---
        if (type === 'rectangle' || type === 'square' || type === 'parallelogram') {
            return (
                <g>
                    <rect x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                    {labels && labels.b && mkTxt(cx, cy + sh / 2 + 20, labels.b)}
                    {labels && labels.h && mkTxt(cx + sw / 2 + 15, cy, labels.h, "start")}
                    {areaText && mkTxt(cx, cy, `${areaText} cm²`, "middle", "middle", "#064e3b")}
                </g>
            );
        }
        
        // --- TRIANGLE ---
        if (type === 'triangle') {
            const L = cx - sw/2, R = cx + sw/2, T = cy - sh/2, B = cy + sh/2;
            
            // Right Triangle
            if (dims.subtype === 'right') {
                const orient = dims.orientation || 'up';
                let p1, p2, p3; 
                let lPos = {};

                // Basic logic for orientation (simplified for stability)
                if (orient === 'up') {
                    p1 = {x: L, y: T}; p2 = {x: L, y: B}; p3 = {x: R, y: B};
                    lPos = { h: {x: L-15, y: cy}, b: {x: cx, y: B+25}, hyp: {x: cx+10, y: cy-10} };
                } else if (orient === 'down') {
                    p1 = {x: R, y: B}; p2 = {x: R, y: T}; p3 = {x: L, y: T};
                    lPos = { h: {x: R+15, y: cy}, b: {x: cx, y: T-25}, hyp: {x: cx-10, y: cy+10} };
                } else if (orient === 'left') {
                    p1 = {x: L, y: B}; p2 = {x: R, y: B}; p3 = {x: R, y: T};
                    lPos = { h: {x: R+15, y: cy}, b: {x: cx, y: B+25}, hyp: {x: cx-10, y: cy-10} };
                } else {
                    p1 = {x: R, y: T}; p2 = {x: L, y: T}; p3 = {x: L, y: B};
                    lPos = { h: {x: L-15, y: cy}, b: {x: cx, y: T-25}, hyp: {x: cx+10, y: cy+10} };
                }

                const path = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
                return (
                    <g>
                        <polygon points={path} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" fillOpacity="0.5" />
                        {labels.height && mkTxt(lPos.h.x, lPos.h.y, labels.height)}
                        {labels.base && mkTxt(lPos.b.x, lPos.b.y, labels.base)}
                        {labels.hypotenuse && mkTxt(lPos.hyp.x, lPos.hyp.y, labels.hypotenuse)}
                    </g>
                );
            } 
            // Standard Triangle (Isosceles-ish)
            else {
                const points = `${L},${B} ${R},${B} ${cx},${T}`;
                const hLine = <line x1={cx} y1={T} x2={cx} y2={B} stroke="#6b7280" strokeWidth="2" strokeDasharray="4" />;
                
                return (
                    <g>
                        {!dims.angles && hLine}
                        <polygon points={points} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" fillOpacity="0.5" />
                        
                        {/* Angles */}
                        {dims.angles && (
                            <>
                                {dims.angles[0] && ( // Left
                                    <>
                                        <path d={`M ${L} ${B} L ${L+25} ${B} A 25 25 0 0 0 ${L+15} ${B-20}`} fill="none" stroke="#ef4444" strokeWidth="2" />
                                        <text x={L+10} y={B-8} fontSize="14" fill="#dc2626" fontWeight="bold">{labels.a1}</text>
                                    </>
                                )}
                                {dims.angles[1] && ( // Right
                                    <>
                                        <path d={`M ${R} ${B} L ${R-25} ${B} A 25 25 0 0 1 ${R-15} ${B-20}`} fill="none" stroke="#ef4444" strokeWidth="2" />
                                        <text x={R-10} y={B-8} fontSize="14" fill="#dc2626" fontWeight="bold">{labels.a2}</text>
                                    </>
                                )}
                            </>
                        )}
                        
                        {/* Sides Labels */}
                        {labels.s1 && mkTxt(cx - sw/4 - 10, cy, labels.s1)}
                        {labels.s2 && mkTxt(cx + sw/4 + 10, cy, labels.s2)}
                        
                        {/* Base/Height Labels (if not side comparison) */}
                        {labels.base && mkTxt(cx, B + 25, labels.base)}
                        {labels.height && !dims.angles && mkTxt(cx + 5, cy, labels.height, "start")}
                    </g>
                );
            }
        }

        // --- CIRCLE ---
        if (type === 'circle') {
            const isDiameter = dims.show === 'diameter';
            return (
                <g>
                    <circle cx={cx} cy={cy} r={sr} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                    {labels && (
                        isDiameter ? (
                            <>
                                <line x1={cx - sr} y1={cy} x2={cx + sr} y2={cy} stroke="#374151" strokeWidth="2" strokeDasharray="4" />
                                <text x={cx} y={cy - 15} textAnchor="middle" fontWeight="bold" fill="#374151" fontSize="22">{labels.val || `d=${dims.diameter}`}</text>
                            </>
                        ) : (
                            <>
                                <circle cx={cx} cy={cy} r={3} fill="#374151" />
                                <line x1={cx} y1={cy} x2={cx + sr} y2={cy} stroke="#374151" strokeWidth="2" />
                                <text x={cx + sr / 2} y={cy - 10} textAnchor="middle" fontWeight="bold" fill="#374151" fontSize="22">{labels.val || `r=${dims.radius}`}</text>
                            </>
                        )
                    )}
                </g>
            );
        }
        return null;
    };

    // --- CASE 1: SCALE ICONS ---
    if (data.type === 'scale_single' || data.type === 'scale_compare') { 
        const shapeEmojis = { 
            square: '⬛', rectangle: '▭', circle: '⚫', triangle: '🔺', cube: '🧊', cylinder: '🛢️', 
            pyramid: '⛰️', cone: '🍦', sphere: '🔮', arrow: '➡', star: '⭐', lightning: '⚡', 
            key: '🔑', heart: '❤️', cloud: '☁️', moon: '🌙', sun: '☀️', magnifying_glass: '🔍', map: '🗺️',
            car: '🚗', ladybug: '🐞', house: '🏠'
        }; 
        const emoji = shapeEmojis[data.shape] || '📦'; 
        const ShapeIcon = ({ size }) => <div className="flex items-center justify-center text-6xl select-none" style={{ fontSize: size }}>{emoji}</div>; 
        
        if (data.type === 'scale_single') 
            return <div className="flex flex-col items-center gap-2 my-4"><ShapeIcon size="80px" /><span className="bg-white px-4 py-2 rounded shadow text-3xl font-bold font-mono border border-gray-200">{data.label}</span></div>; 
        
        return (
            <div className="flex items-center justify-center gap-4 sm:gap-8 my-6">
                <div className="flex flex-col items-center gap-2"><span className="text-base font-bold uppercase text-gray-400 mb-1">{data.leftLabel}</span><ShapeIcon size="60px" /><span className="text-2xl font-bold font-mono bg-white px-3 rounded border mt-2">{data.leftValue}</span></div>
                <div className="text-gray-300 text-3xl">→</div>
                <div className="flex flex-col items-center gap-2"><span className="text-base font-bold uppercase text-gray-400 mb-1">{data.rightLabel}</span><ShapeIcon size="100px" /><span className="text-2xl font-bold font-mono bg-white px-3 rounded border mt-2">{data.rightValue}</span></div>
            </div>
        ); 
    }

    // --- CASE 2: SIMILARITY COMPARISON (TWO SHAPES) ---
    if (data.type === 'similarity_compare') {
        const leftDims = { ...data.left, width: 40, height: 40, radius: 20, subtype: data.shapeType === 'triangle' ? 'isosceles' : undefined };
        const rightDims = { ...data.right, width: 60, height: 60, radius: 30, subtype: data.shapeType === 'triangle' ? 'isosceles' : undefined };

        return (
            <SvgContainer viewBox="0 0 300 200">
                <RenderShape type={data.shapeType} dims={leftDims} labels={data.left.labels} offsetX={-80} scale={0.8} />
                <text x="150" y="100" textAnchor="middle" fontSize="30" fill="#cbd5e1">→</text>
                <RenderShape type={data.shapeType} dims={rightDims} labels={data.right.labels} offsetX={80} scale={1.2} />
            </SvgContainer>
        );
    }

    // --- CASE 3: TRANSVERSAL (TOP TRIANGLE) ---
    if (data.type === 'transversal') {
        const labels = data.labels;
        return (
            <SvgContainer>
                {/* Big Triangle */}
                <polygon points="150,20 50,180 250,180" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" fillOpacity="0.3" />
                {/* Transversal Line */}
                <line x1="100" y1="100" x2="200" y2="100" stroke="#059669" strokeWidth="3" />
                
                {/* Labels */}
                {/* Top Side (Left) */}
                <text x="85" y="60" fontSize="18" fontWeight="bold" fill="#374151" textAnchor="end">{labels.left_top}</text>
                {/* Full Side (Left) */}
                <text x="40" y="100" fontSize="18" fontWeight="bold" fill="#374151" textAnchor="end">{labels.left_tot}</text>
                
                {/* Top Base */}
                <text x="150" y="90" fontSize="18" fontWeight="bold" fill="#374151" textAnchor="middle">{labels.base_top}</text>
                {/* Bottom Base */}
                <text x="150" y="200" fontSize="18" fontWeight="bold" fill="#374151" textAnchor="middle">{labels.base_bot}</text>
                
                {/* Arrows indicating parallel */}
                <path d="M 150 100 l -5 -5 m 5 5 l -5 5" stroke="#059669" strokeWidth="2" fill="none"/>
                <path d="M 150 180 l -5 -5 m 5 5 l -5 5" stroke="#10b981" strokeWidth="2" fill="none"/>
            </SvgContainer>
        );
    }

    // --- CASE 4: STANDARD SINGLE SHAPE ---
    if (['rectangle', 'square', 'parallelogram', 'triangle', 'circle'].includes(data.type)) {
        return (<div className="flex justify-center my-4"><RenderShape type={data.type} dims={data} labels={data.labels} /></div>);
    }
    
    // --- CASE 5: COMPOSITE SHAPES ---
    if (data.type === 'composite') {
        const w = data.labels.w || 50;
        const h = data.labels.h || 50;
        return (
            <div className="flex justify-center my-4">
                <svg width="200" height="200" viewBox="0 0 200 200" className="border border-gray-100 rounded-lg bg-white shadow-sm">
                    {data.subtype === 'house' ? (
                        <>
                            <rect x="50" y="80" width="100" height="80" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                            <polygon points="50,80 150,80 100,20" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                            <text x="160" y="120" fontWeight="bold" fill="#374151" fontSize="18">{data.labels.h}</text>
                            <text x="100" y="180" textAnchor="middle" fontWeight="bold" fill="#374151" fontSize="18">{data.labels.w}</text>
                            <text x="130" y="60" fontWeight="bold" fill="#374151" fontSize="18">{data.labels.h_roof}</text>
                        </>
                    ) : (
                        <>
                            <rect x="50" y="70" width="100" height="100" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                            <path d="M 50 70 A 50 50 0 0 1 150 70" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                            <text x="100" y="190" textAnchor="middle" fontWeight="bold" fill="#374151" fontSize="18">{data.labels.w}</text>
                            <text x="160" y="120" textAnchor="start" fontWeight="bold" fill="#374151" fontSize="18">{data.labels.h}</text>
                        </>
                    )}
                </svg>
            </div>
        );
    }

    return <div className="flex justify-center my-4"><div className="text-gray-400 text-sm">Visual</div></div>;
};

// ----------------------------------------------------------------------
// 3D VOLUME VISUALIZATION (Canvas)
// ----------------------------------------------------------------------
export const VolumeVisualization = ({ data }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#374151'; 
        ctx.fillStyle = '#f3f4f6';
        ctx.lineWidth = 2; 
        ctx.lineJoin = 'round'; 
        ctx.font = "bold 14px Inter, sans-serif"; 
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle";

        const drawLabel = (text, x, y, color='#dc2626') => { 
            if (!text) return;
            ctx.save(); 
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; 
            const m = ctx.measureText(text);
            ctx.fillRect(x - m.width/2 - 2, y - 10, m.width + 4, 20);
            ctx.fillStyle = color; 
            ctx.fillText(text, x, y); 
            ctx.restore(); 
        };
        const drawDashed = (x1, y1, x2, y2) => { 
            ctx.save(); 
            ctx.setLineDash([5, 5]); 
            ctx.beginPath(); 
            ctx.moveTo(x1, y1); 
            ctx.lineTo(x2, y2); 
            ctx.stroke(); 
            ctx.restore(); 
        };

        const TARGET_SIZE = 140; 
        let dims = [];
        if (data.labels) {
            dims = Object.values(data.labels).map(v => parseInt(String(v))).filter(v => !isNaN(v));
        }
        const maxVal = Math.max(...dims, 10);
        const scale = TARGET_SIZE / maxVal;

        if (data.type === 'cuboid') {
            const dw = (parseInt(data.labels.w) || 10) * scale;
            const dh = (parseInt(data.labels.h) || 10) * scale;
            const dd = (parseInt(data.labels.d) || 10) * scale * 0.5;
            const x0 = cx - dw/2 - dd/2;
            const y0 = cy + dh/2 + dd/2;
            ctx.strokeRect(x0, y0 - dh, dw, dh);
            ctx.beginPath(); ctx.moveTo(x0, y0 - dh); ctx.lineTo(x0 + dd, y0 - dh - dd); ctx.lineTo(x0 + dw + dd, y0 - dh - dd); ctx.lineTo(x0 + dw, y0 - dh); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x0 + dw + dd, y0 - dh - dd); ctx.lineTo(x0 + dw + dd, y0 - dd); ctx.lineTo(x0 + dw, y0); ctx.stroke();
            drawLabel(data.labels.w, x0 + dw/2, y0 + 15);
            drawLabel(data.labels.h, x0 - 20, y0 - dh/2);
            drawLabel(data.labels.d, x0 + dw + dd/2 + 5, y0 - dd/2);
        } 
        else if (data.type === 'triangular_prism') {
            const b = (parseInt(data.labels.b) || 10) * scale;
            const hTri = (parseInt(data.labels.h) || 10) * scale;
            const len = (parseInt(data.labels.l) || 20) * scale * 0.7;
            const startX = cx - b/2 - len/2;
            const startY = cy + hTri/2;
            ctx.beginPath();
            ctx.moveTo(startX, startY); ctx.lineTo(startX + b, startY); ctx.lineTo(startX + b/2, startY - hTri); ctx.closePath(); ctx.stroke();
            const offX = len; const offY = -len * 0.3;
            ctx.beginPath(); ctx.moveTo(startX + b/2, startY - hTri); ctx.lineTo(startX + b/2 + offX, startY - hTri + offY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(startX + b, startY); ctx.lineTo(startX + b + offX, startY + offY); ctx.lineTo(startX + b/2 + offX, startY - hTri + offY); ctx.stroke();
            drawDashed(startX + b/2, startY, startX + b/2, startY - hTri);
            drawLabel(data.labels.h, startX + b/2 + 10, startY - hTri/2);
            drawLabel(data.labels.b, startX + b/2, startY + 15);
            drawLabel(data.labels.l, startX + b + offX/2 + 10, startY + offY/2);
        }
        else if (data.type === 'pyramid') {
            const w = (parseInt(data.labels.w || data.labels.s || 10) * scale);
            const d = (parseInt(data.labels.d || data.labels.s || 10) * scale * 0.6); 
            const hPyr = (parseInt(data.labels.h) || 10) * scale;
            const x0 = cx - w/2 - d/2;
            const y0 = cy + hPyr/3; 
            const FL = {x: x0, y: y0}; const FR = {x: x0+w, y: y0};
            const BR = {x: x0+w+d, y: y0-d}; const BL = {x: x0+d, y: y0-d};
            const Apex = {x: x0 + w/2 + d/2, y: y0 - d/2 - hPyr};
            ctx.beginPath(); ctx.moveTo(FL.x, FL.y); ctx.lineTo(FR.x, FR.y); ctx.lineTo(BR.x, BR.y); ctx.stroke();
            ctx.save(); ctx.setLineDash([5,5]); ctx.beginPath(); ctx.moveTo(BR.x, BR.y); ctx.lineTo(BL.x, BL.y); ctx.lineTo(FL.x, FL.y); ctx.stroke(); ctx.restore();
            ctx.beginPath(); ctx.moveTo(FL.x, FL.y); ctx.lineTo(Apex.x, Apex.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(FR.x, FR.y); ctx.lineTo(Apex.x, Apex.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(BR.x, BR.y); ctx.lineTo(Apex.x, Apex.y); ctx.stroke();
            ctx.save(); ctx.setLineDash([5,5]); ctx.beginPath(); ctx.moveTo(BL.x, BL.y); ctx.lineTo(Apex.x, Apex.y); ctx.stroke(); ctx.restore();
            const centerBase = {x: x0 + w/2 + d/2, y: y0 - d/2};
            drawDashed(centerBase.x, centerBase.y, Apex.x, Apex.y);
            drawLabel("h=" + data.labels.h, Apex.x + 20, centerBase.y - hPyr/2);
            drawLabel(data.labels.w || data.labels.s, x0 + w/2, y0 + 15);
        }
        else {
            let r = 50; 
            if(data.labels.r) r = parseInt(data.labels.r) * scale;
            if(data.labels.d) r = (parseInt(data.labels.d)/2) * scale;
            r = Math.max(30, Math.min(r, 70));
            const drawCircleData = (centerY, showLabel=true) => {
                 const val = data.labels.val || (data.labels.r ? `r=${data.labels.r}` : `d=${data.labels.d}`);
                 if (data.show === 'diameter') {
                     drawDashed(cx - r, centerY, cx + r, centerY);
                     if(showLabel) drawLabel(val, cx, centerY - 10);
                 } else {
                     ctx.beginPath(); ctx.arc(cx, centerY, 2, 0, 2*Math.PI); ctx.fill();
                     drawDashed(cx, centerY, cx + r, centerY);
                     if(showLabel) drawLabel(val, cx + r/2, centerY - 10);
                 }
            };
            if (data.type === 'sphere') {
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI); ctx.stroke();
                ctx.beginPath(); ctx.ellipse(cx, cy, r, r/4, 0, 0, 2*Math.PI); ctx.stroke();
                drawCircleData(cy);
            }
            else if (data.type === 'hemisphere') {
                const yBase = cy + 10;
                ctx.beginPath(); ctx.arc(cx, yBase, r, Math.PI, 0); ctx.stroke();
                ctx.beginPath(); ctx.ellipse(cx, yBase, r, r/4, 0, 0, 2*Math.PI); ctx.stroke();
                drawCircleData(yBase);
            }
            else if (data.type === 'cylinder' || data.type === 'silo') {
                const hCyl = (parseInt(data.labels.h) || 10) * scale;
                const topY = cy - hCyl/2;
                const botY = cy + hCyl/2;
                if (data.type === 'cylinder' || data.type === 'silo') {
                     ctx.beginPath(); ctx.ellipse(cx, topY, r, r/4, 0, 0, 2*Math.PI); ctx.stroke();
                     ctx.beginPath(); ctx.ellipse(cx, botY, r, r/4, 0, 0, Math.PI); ctx.stroke();
                     ctx.save(); ctx.setLineDash([5,5]); ctx.beginPath(); ctx.ellipse(cx, botY, r, r/4, 0, Math.PI, 2*Math.PI); ctx.stroke(); ctx.restore();
                     ctx.beginPath(); ctx.moveTo(cx-r, topY); ctx.lineTo(cx-r, botY); ctx.stroke();
                     ctx.beginPath(); ctx.moveTo(cx+r, topY); ctx.lineTo(cx+r, botY); ctx.stroke();
                     drawLabel(data.labels.h, cx + r + 15, cy);
                }
                if (data.type === 'silo') { ctx.beginPath(); ctx.arc(cx, topY, r, Math.PI, 0); ctx.stroke(); }
                drawCircleData(topY, true);
            }
            else if (data.type === 'cone' || data.type === 'ice_cream') {
                 const hCone = (parseInt(data.labels.h) || 10) * scale;
                 if (data.type === 'cone') {
                     const topY = cy - hCone/2; const botY = cy + hCone/2;
                     ctx.beginPath(); ctx.ellipse(cx, botY, r, r/4, 0, 0, Math.PI); ctx.stroke();
                     ctx.save(); ctx.setLineDash([5,5]); ctx.beginPath(); ctx.ellipse(cx, botY, r, r/4, 0, Math.PI, 2*Math.PI); ctx.stroke(); ctx.restore();
                     ctx.beginPath(); ctx.moveTo(cx-r, botY); ctx.lineTo(cx, topY); ctx.lineTo(cx+r, botY); ctx.stroke();
                     drawDashed(cx, botY, cx, topY);
                     drawLabel("h=" + data.labels.h, cx + 5, cy);
                     drawCircleData(botY, true);
                 } else {
                     const seamY = cy - 20; const tipY = seamY + hCone;
                     ctx.beginPath(); ctx.moveTo(cx-r, seamY); ctx.lineTo(cx, tipY); ctx.lineTo(cx+r, seamY); ctx.stroke();
                     ctx.beginPath(); ctx.arc(cx, seamY, r, Math.PI, 0); ctx.stroke();
                     ctx.beginPath(); ctx.ellipse(cx, seamY, r, r/4, 0, 0, 2*Math.PI); ctx.stroke();
                     drawLabel(data.labels.h, cx + r + 10, seamY + hCone/2);
                     drawCircleData(seamY, true);
                 }
            }
        }
    }, [data]);
    return <div className="flex justify-center my-2 w-full"><canvas ref={canvasRef} width={320} height={240} className="w-full max-w-[320px] h-auto bg-white rounded-lg" /></div>;
};

// Graph Canvas Component
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

export const StaticGeometryVisual = ({ description }) => { 
    if (!description) return null; 
    const d = description.toLowerCase(); 
    if (d.includes("rect") || d.includes("rektangel")) return <div className="flex justify-center my-4 opacity-80"><div className="w-28 h-16 border-2 border-primary-500 bg-primary-50 rounded-sm"></div></div>; 
    return null; 
};