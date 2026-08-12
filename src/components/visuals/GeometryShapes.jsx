import React from 'react';

/**
 * mkTxt - Responsive Label Helper
 * Font size 14-16 is optimized for a 300x250 coordinate system.
 */
export const mkTxt = (x, y, txt, anchor = "middle", baseline = "middle", color = "#374151") =>
    <text 
        key={`${x}-${y}-${txt}`} 
        x={x} 
        y={y} 
        textAnchor={anchor} 
        dominantBaseline={baseline} 
        fontWeight="bold" 
        fill={color} 
        fontSize="24"
        className="font-sans drop-shadow-sm select-none"
    >
        {txt}
    </text>;


export const GeometryVisual = ({ data }) => {
    if (!data) return null;

    const baseWidth = 300;
    const baseHeight = 250;

    return (
        <div className="w-full h-full flex items-center justify-center p-2">
            <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                <svg 
                    viewBox={`0 0 ${baseWidth} ${baseHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-full block overflow-visible drop-shadow-md"
                >
                    <RenderShape 
                        type={data.type} 
                        subtype={data.subtype || (data.dims && data.dims.subtype)} // 🟢 ADDED: Pass subtype down
                        dims={data.dims || data}
                        labels={data.labels} 
                        areaText={data.areaText} 
                    />
                </svg>
            </div>
        </div>
    );
};

export const RenderShape = ({ type, subtype, dims, labels, areaText, offsetX = 0, offsetY = 0, scale = 1 }) => {
    const cx = 125 + offsetX;
    const cy = 125 + offsetY;
    const safeDims = dims || {};
    const lab = labels || {};

    const activeSubtype = subtype || safeDims.subtype || (safeDims.dims && safeDims.dims.subtype) || type;
    
    // Determine the true total dimensions for scaling
    let rawW = safeDims.width || safeDims.w || 10;
    let rawH = safeDims.height || safeDims.h || 10;
    const rawR = safeDims.radius || safeDims.r || 5;

    // Surgical Fix: Ensure maxDim accounts for the total footprint of composite shapes
    if (type === 'composite') {
        if (safeDims.subtype === 'rect_right_tri') rawW = (lab.w || 10) + (lab.tri_b || 5);
        if (safeDims.subtype === 'l_shape') {
            rawW = (lab.vW || 3) + (lab.hW || 6);
            rawH = rawH * 1.35; 
        }
        // ADDED: Portal logic. Total height = height + radius (which is width/2)
        if (safeDims.subtype === 'house' || safeDims.subtype === 'house_area') {
                rawH = (lab.h || lab.s || 10) + (lab.h_roof || lab.h_tri || 5);
            }
        if (safeDims.subtype === 'portal') rawH = (lab.h || 10) + ((lab.w || 10) / 2);
    }

    const maxDim = Math.max(rawW, rawH, rawR * 2) || 10;
    // Reduced factor from 180 to 160 to provide safer margins for labels
    const baseScale = (170 / maxDim) * scale;
    
    const sw = rawW * baseScale;
    const sh = rawH * baseScale;
    const sr = rawR * baseScale;

    const safeLabels = labels || {};
    const l_b = safeLabels.b || safeLabels.base || safeLabels.width || safeLabels.w;
    const l_h = safeLabels.h || safeLabels.height;
    const l_hyp = safeLabels.hyp || safeLabels.hypotenuse || safeLabels.c || safeLabels.diagonal;
    const l_slant = safeLabels.slant || safeLabels.s; 
    
    const l_s1 = safeLabels.s1;
    const l_s2 = safeLabels.s2;

    // --- RECTANGLE / SQUARE ---
    if (type === 'rectangle' || type === 'square') {
        return (
            <g>
                <rect x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                {l_b && mkTxt(cx, cy + sh / 2 + 25, l_b)}
                {l_h && mkTxt(cx + sw / 2 + 15, cy, l_h, "start")}
                {areaText && mkTxt(cx, cy, `${areaText} cm²`, "middle", "middle", "#064e3b")}
            </g>
        );
    }

    // --- PARALLELOGRAM ---
    if (type === 'parallelogram') {
        const skew = sw * 0.25;
        const xBL = cx - sw / 2 - skew / 2;
        const xBR = cx + sw / 2 - skew / 2;
        const xTR = cx + sw / 2 + skew / 2;
        const xTL = cx - sw / 2 + skew / 2;
        const yTop = cy - sh / 2;
        const yBot = cy + sh / 2;
        const path = `${xBL},${yBot} ${xBR},${yBot} ${xTR},${yTop} ${xTL},${yTop}`;

        return (
            <g>
                {/* Dotted height line */}
                <line x1={xTL} y1={yTop} x2={xTL} y2={yBot} stroke="#6b7280" strokeWidth="1" strokeDasharray="2" />
                <polygon points={path} fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" fillOpacity="0.5" />
                {l_b && mkTxt((xBL + xBR) / 2, yBot + 10, l_b)}
                {l_h && mkTxt(xTL + 4, (yTop + yBot) / 2, l_h, "start")}
                {/* Slant side label for perimeter questions */}
                {l_slant && mkTxt((xBR + xTR) / 2 + 6, (yBot + yTop) / 2, l_slant, "start")}
            </g>
        );
    }

    // --- TRIANGLE ---
    if (type === 'triangle') {
        const L = cx - sw / 2; const R = cx + sw / 2;
        const T = cy - sh / 2; const B = cy + sh / 2;
        
        if (safeDims.subtype === 'right') {
            const p1 = { x: L, y: T }; const p2 = { x: L, y: B }; const p3 = { x: R, y: B };
            const path = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
            return (
                <g>
                    <polygon points={path} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" fillOpacity="0.5" />
                    {l_h && mkTxt(L - 15, cy, l_h)}
                    {l_b && mkTxt(cx, B + 25, l_b)}
                    {l_hyp && mkTxt(cx + 10, cy - 10, l_hyp, "start")}
                </g>
            );
        } else {
            const points = `${L},${B} ${R},${B} ${cx},${T}`;
            return (
                <g>
                    {/* 🟢 LAYER 1: Base vector background fill always outputs FIRST */}
                    <polygon points={points} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" fillOpacity="0.5" />
                    
                    {/* Dotted reference guidelines */}
                    <line x1={cx} y1={T} x2={cx} y2={B} stroke="#6b7280" strokeWidth="2" strokeDasharray="4" />
                    
                    {/* 🟢 LAYER 2: Structural Exterior Layout Values */}
                    {l_b && mkTxt(cx, B + 25, l_b)}
                    {l_h && mkTxt(cx -20, cy + 20, l_h, "start")}
                    {l_s1 && mkTxt(L + 20, cy, l_s1, "end")}
                    {l_s2 && mkTxt(R + 10, cy, l_s2, "start")}

                    {/* 🟢 LAYER 3: Internal Vertex Degree Labels always output LAST (On Top) */}
                    {safeLabels.angle1 && mkTxt(L - 25, B - 15, safeLabels.angle1, "start")}
                    {safeLabels.angle2 && mkTxt(R + 25, B - 15, safeLabels.angle2, "end")}
                    {safeLabels.angle3 && mkTxt(cx, T + 30, safeLabels.angle3, "middle")}
                </g>
            );
        }
    }

    // --- CIRCLE ---
    if (type === 'circle') {
        const isDiameter = safeDims.show === 'diameter';
        const labelTxt = safeLabels.val || (safeLabels.r ? `r=${safeLabels.r}` : (safeLabels.diameter ? `d=${safeLabels.diameter}` : null));
        return (
            <g>
                <circle cx={cx} cy={cy} r={sr} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                {isDiameter ? (
                    <>
                        <line x1={cx - sr} y1={cy} x2={cx + sr} y2={cy} stroke="#374151" strokeWidth="2" strokeDasharray="4" />
                        {labelTxt && <text x={cx} y={cy - 15} textAnchor="middle" fontWeight="bold" fill="#374151" fontSize="22">{labelTxt}</text>}
                    </>
                ) : (
                    <>
                        <circle cx={cx} cy={cy} r={3} fill="#374151" />
                        <line x1={cx} y1={cy} x2={cx + sr} y2={cy} stroke="#374151" strokeWidth="2" />
                        {labelTxt && <text x={cx + sr / 2} y={cy - 10} textAnchor="middle" fontWeight="bold" fill="#374151" fontSize="22">{labelTxt}</text>}
                    </>
                )}
            </g>
        );
    }

    // --- SEMICIRCLE ---
    if (type === 'semicircle') {
        const isDiameter = safeDims.show === 'diameter';
        const rVal = safeLabels.r;
        const dVal = safeLabels.diameter;
        const dPath = `M ${cx - sr} ${cy} A ${sr} ${sr} 0 0 1 ${cx + sr} ${cy} Z`; 
        
        return (
            <g>
                <path d={dPath} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                {isDiameter ? (
                    <>
                        <line x1={cx - sr} y1={cy + 15} x2={cx + sr} y2={cy + 15} stroke="#374151" strokeWidth="2" />
                        <text x={cx} y={cy + 35} textAnchor="middle" fontWeight="bold" fill="#374151" fontSize="20">{dVal ? `d=${dVal}` : ''}</text>
                    </>
                ) : (
                    <>
                        <line x1={cx} y1={cy} x2={cx + sr*0.7} y2={cy - sr*0.7} stroke="#374151" strokeWidth="2" />
                        <text x={cx + 15} y={cy - 25} textAnchor="middle" fontWeight="bold" fill="#374151" fontSize="20">{rVal ? `r=${rVal}` : ''}</text>
                        <circle cx={cx} cy={cy} r={3} fill="#374151" />
                    </>
                )}
            </g>
        );
    }

    // --- QUARTER CIRCLE ---
    if (type === 'quarter_circle') {
        const rVal = safeLabels.r;
        const originX = cx - sr/2;
        const originY = cy + sr/2;
        const dPath = `M ${originX} ${originY} L ${originX + sr} ${originY} A ${sr} ${sr} 0 0 0 ${originX} ${originY - sr} Z`;

        return (
            <g>
                <path d={dPath} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                <text x={originX + sr/2} y={originY + 20} textAnchor="middle" fontWeight="bold" fill="#374151" fontSize="20">{rVal ? `r=${rVal}` : ''}</text>
                <text x={originX - 15} y={originY - sr/2} textAnchor="middle" fontWeight="bold" fill="#374151" fontSize="20">{rVal ? `r=${rVal}` : ''}</text>
            </g>
        );
    }
    
    // Composite
    if (type === 'composite') {
        const lab = labels || {};
        
        // 1. Fully trace safe fields to look inside nested structures fallback layers seamlessly
        const activeSubtype = safeDims.subtype || (safeDims.dims && safeDims.dims.subtype) || type;

        if (activeSubtype === 'rect_right_tri') {
            const wRect = (lab.w || 10) * baseScale;
            const hRect = (lab.h || 10) * baseScale;
            const wTri = (lab.tri_b || 5) * baseScale;
            const totalW = wRect + wTri;
            const startX = cx - totalW / 2;
            const startY = cy + hRect / 2;

            return (
                <g>
                    <rect x={startX} y={startY - hRect} width={wRect} height={hRect} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                    <polygon points={`${startX + wRect},${startY} ${startX + wRect + wTri},${startY} ${startX + wRect},${startY - hRect}`} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                    {mkTxt(startX + wRect/2, startY + 25, lab.w)} 
                    {mkTxt(startX - 20, startY - hRect/2, lab.h, "end")} 
                    {mkTxt(startX + wRect + wTri/2, startY + 25, lab.tri_b)} 
                </g>
            );
        }

        if (activeSubtype === 'l_shape') {
            const vW = (lab.vW || 3) * baseScale;
            const vH = (lab.vH || 8) * baseScale;
            const hW = (lab.hW || 6) * baseScale;
            const hH = (lab.hH || 3) * baseScale;
            const totW = vW + hW; 
            const totH = Math.max(vH, hH);
            const startX = cx - totW / 2;
            const startY = cy + totH / 2; 
            const p = `${startX},${startY} ${startX + totW},${startY} ${startX + totW},${startY - hH} ${startX + vW},${startY - hH} ${startX + vW},${startY - vH} ${startX},${startY - vH}`;
            return (
                <g>
                    <polygon points={p} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                    {mkTxt(startX + vW/2, startY - vH - 15, lab.vW)}
                    {mkTxt(startX - 15, startY - vH/2, lab.vH)}
                    {mkTxt(startX + vW + hW + 15, startY - hH/2, lab.hH)}
                    {!!lab.totalW && (
                        <>
                            <line x1={startX} y1={startY + 25} x2={startX + totW} y2={startY + 25} stroke="#374151" strokeWidth="1" />
                            {mkTxt(startX + totW/2, startY + 45, lab.totalW)}
                        </>
                    )}
                </g>
            );
        }

        if (activeSubtype === 'house_area') {
            const s = (lab.s || 10) * baseScale;
            const hTri = (lab.h_tri || 5) * baseScale;
            const startX = cx - s/2;
            const startY = cy + s/2; 

            return (
                <g>
                    <rect x={startX} y={startY - s} width={s} height={s} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                    <polygon points={`${startX},${startY - s} ${startX + s},${startY - s} ${cx},${startY - s - hTri}`} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                    <line x1={cx} y1={startY - s} x2={cx} y2={startY - s - hTri} stroke="#6b7280" strokeWidth="2" strokeDasharray="4" />
                    {mkTxt(cx, startY + 20, lab.s)} 
                    {mkTxt(startX - 15, startY - s/2, lab.s)} 
                    {mkTxt(cx + 15, startY - s - hTri/2, lab.h_tri, "start")} 
                </g>
            );
        }
        
        if (activeSubtype === 'house' || activeSubtype === 'house_perimeter' || activeSubtype === 'portal' || activeSubtype === 'portal_perimeter') {
             const isHouseStyle = activeSubtype === 'house' || activeSubtype === 'house_perimeter';
             const isPerimeterMode = activeSubtype === 'house_perimeter' || activeSubtype === 'portal_perimeter';
             
             const hBase = (lab.h || 10) * baseScale;
             const wBase = (lab.w || 10) * baseScale;
             
             const hTop = isHouseStyle 
                ? (lab.h_roof ? lab.h_roof * baseScale : (wBase * 0.4)) 
                : (wBase / 2);
                
             const totalH = hBase + hTop;
             const startX = cx - wBase / 2;
             const startY = cy + totalH / 2;

             return (
                <g>
                    {isHouseStyle ? (
                        <>
                            <rect x={startX} y={startY - hBase} width={wBase} height={hBase} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                            <polygon points={`${startX},${startY - hBase} ${startX + wBase},${startY - hBase} ${cx},${startY - totalH}`} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" fillOpacity="0.5" />
                            
                            {!isPerimeterMode ? (
                                <>
                                    <line x1={cx} y1={startY - hBase} x2={cx} y2={startY - totalH} stroke="#4b5563" strokeWidth="2" strokeDasharray="4" />
                                    {mkTxt(startX + wBase + 15, startY - hBase/2, lab.h, "start")}
                                    {mkTxt(cx, startY + 25, lab.w)}
                                    {mkTxt(cx + 10, startY - hBase - hTop/2, lab.h_roof, "start")}
                                </>
                            ) : (
                                <>
                                    {mkTxt(startX - 15, startY - hBase/2, lab.h, "end")}
                                    {mkTxt(startX + wBase + 15, startY - hBase/2, lab.h, "start")}
                                    {mkTxt(cx, startY + 25, lab.w)}
                                    {mkTxt((startX + cx) / 2 - 15, (startY - hBase + (startY - totalH)) / 2 - 10, lab.s, "end")}
                                    {mkTxt((startX + wBase + cx) / 2 + 15, (startY - hBase + (startY - totalH)) / 2 - 10, lab.s, "start")}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <rect x={startX} y={startY - hBase} width={wBase} height={hBase} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                            <path d={`M ${startX} ${startY - hBase} A ${wBase/2} ${wBase/2} 0 0 1 ${startX + wBase} ${startY - hBase}`} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                            {mkTxt(cx, startY + 25, lab.w)}
                            {mkTxt(startX - 15, startY - hBase/2, lab.h, "end")}
                            {mkTxt(startX + wBase + 15, startY - hBase/2, lab.h, "start")}
                            {isPerimeterMode && lab.arc && (
                                mkTxt(cx, startY - totalH - 15, lab.arc)
                            )}
                        </>
                    )}
                </g>
            );
        }
    }

    return null;
};