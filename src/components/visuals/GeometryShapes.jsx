import React from 'react';

// Helper for text generation
export const mkTxt = (x, y, txt, anchor = "middle", baseline = "middle", color = "#374151") =>
    <text key={`${x}-${y}-${txt}`} x={x} y={y} textAnchor={anchor} dominantBaseline={baseline} fontWeight="bold" fill={color} fontSize="20">{txt}</text>;

export const RenderShape = ({ type, dims, labels, areaText, offsetX = 0, offsetY = 0, scale = 1 }) => {
    const cx = 150 + offsetX;
    const cy = 125 + offsetY;
    const safeDims = dims || {};
    // Ensure width and height have fallbacks to prevent NaN
    const rawW = safeDims.width || safeDims.w || 10;
    const rawH = safeDims.height || safeDims.h || 10;
    const rawR = safeDims.radius || safeDims.r || 5;

    const maxDim = Math.max(rawW, rawH, rawR * 2) || 10;
    const baseScale = (120 / maxDim) * scale;
    
    const sw = rawW * baseScale;
    const sh = rawH * baseScale;
    const sr = rawR * baseScale;

    // Use passed labels or fallback to dimension values if no label object exists
    const safeLabels = labels || {};
    const l_b = safeLabels.b || safeLabels.base || safeLabels.width || safeLabels.w;
    const l_h = safeLabels.h || safeLabels.height;
    const l_hyp = safeLabels.hyp || safeLabels.hypotenuse || safeLabels.c || safeLabels.diagonal;
    const l_slant = safeLabels.slant || safeLabels.s; // For parallelogram slant side
    
    // Angle Labels
    const l_a1 = safeLabels.a1;
    const l_a2 = safeLabels.a2;

    // Side Labels for Similarity (s1, s2)
    const l_s1 = safeLabels.s1;
    const l_s2 = safeLabels.s2;

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

    if (type === 'parallelogram') {
        const skew = sw * 0.25; // fixed skew amount for visual
        // Points: BottomLeft, BottomRight, TopRight, TopLeft
        const xBL = cx - sw / 2 - skew/2;
        const xBR = cx + sw / 2 - skew/2;
        const xTR = cx + sw / 2 + skew/2;
        const xTL = cx - sw / 2 + skew/2;
        
        const yTop = cy - sh / 2;
        const yBot = cy + sh / 2;

        const path = `${xBL},${yBot} ${xBR},${yBot} ${xTR},${yTop} ${xTL},${yTop}`;

        return (
            <g>
                {/* Dotted Height Line */}
                <line x1={xTL} y1={yTop} x2={xTL} y2={yBot} stroke="#6b7280" strokeWidth="2" strokeDasharray="4" />
                {/* Main Shape */}
                <polygon points={path} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" fillOpacity="0.5" />
                
                {/* Base Label */}
                {l_b && mkTxt((xBL + xBR)/2, yBot + 25, l_b)}
                
                {/* Height Label (Internal) */}
                {l_h && mkTxt(xTL + 10, (yTop+yBot)/2, l_h, "start")}
                
                {/* Slant Side Label (Right Side) for Perimeter */}
                {l_slant && mkTxt((xBR+xTR)/2 + 10, (yBot+yTop)/2, l_slant, "start")}

                {areaText && mkTxt(cx, cy, `${areaText} cm²`, "middle", "middle", "#064e3b")}
            </g>
        );
    }

    if (type === 'triangle') {
        const L = cx - sw / 2; 
        const R = cx + sw / 2;
        const T = cy - sh / 2; 
        const B = cy + sh / 2;
        
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
            // Isosceles / Generic Triangle
            const points = `${L},${B} ${R},${B} ${cx},${T}`;
            return (
                <g>
                    <line x1={cx} y1={T} x2={cx} y2={B} stroke="#6b7280" strokeWidth="2" strokeDasharray="4" />
                    <polygon points={points} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" fillOpacity="0.5" />
                    {l_b && mkTxt(cx, B + 25, l_b)}
                    {l_h && mkTxt(cx + 5, cy, l_h, "start")}
                    
                    {l_s1 && mkTxt(L - 10, cy, l_s1, "end")}
                    {l_s2 && mkTxt(R + 10, cy, l_s2, "start")}

                    {l_a1 && (
                        <>
                            <path d={`M ${L + 15} ${B} A 15 15 0 0 0 ${L + 8} ${B - 13}`} fill="none" stroke="#374151" strokeWidth="2" />
                            <text x={L - 10} y={B - 5} fontSize="16" fontWeight="bold" fill="#374151">{l_a1}</text>
                        </>
                    )}
                    
                    {l_a2 && (
                        <>
                            <path d={`M ${R - 15} ${B} A 15 15 0 0 1 ${R - 8} ${B - 13}`} fill="none" stroke="#374151" strokeWidth="2" />
                            <text x={R + 10} y={B - 5} fontSize="16" fontWeight="bold" fill="#374151">{l_a2}</text>
                        </>
                    )}
                </g>
            );
        }
    }
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

    // --- NEW: Semicircle ---
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
                        <line x1={cx - sr} y1={cy + 15} x2={cx + sr} y2={cy + 15} stroke="#374151" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
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

    // --- NEW: Quarter Circle ---
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
    
    // --- COMBINED SHAPES (Level 4) ---
    if (type === 'composite') {
        const lab = labels || {};
        
        if (dims.subtype === 'rect_right_tri') {
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
                    {mkTxt(startX + wRect/2, startY + 20, lab.w)} 
                    {mkTxt(startX - 15, startY - hRect/2, lab.h)} 
                    {mkTxt(startX + wRect + wTri/2, startY + 20, lab.tri_b)} 
                </g>
            );
        }

        if (dims.subtype === 'l_shape') {
            const vW = (lab.vW || 3) * baseScale;
            const vH = (lab.vH || 8) * baseScale;
            const hW = (lab.hW || 6) * baseScale; // This is the extension width
            const hH = (lab.hH || 3) * baseScale;
            
            const showTotal = !!lab.totalW;
            
            const totW = vW + hW; 
            const totH = Math.max(vH, hH);
            const startX = cx - totW / 2;
            const startY = cy + totH / 2; 
            const p = `${startX},${startY} ${startX + vW + hW},${startY} ${startX + vW + hW},${startY - hH} ${startX + vW},${startY - hH} ${startX + vW},${startY - vH} ${startX},${startY - vH}`;
            return (
                <g>
                    <polygon points={p} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                    {mkTxt(startX + vW/2, startY - vH - 15, lab.vW)}
                    {mkTxt(startX - 15, startY - vH/2, lab.vH)}
                    
                    {/* Right Side Label */}
                    {mkTxt(startX + vW + hW + 15, startY - hH/2, lab.hH)}

                    {/* Bottom Label logic */}
                    {showTotal ? (
                        <>
                            {/* Draw a dimension line for total width */}
                            <line x1={startX} y1={startY + 25} x2={startX + totW} y2={startY + 25} stroke="#374151" strokeWidth="1" />
                            <line x1={startX} y1={startY + 20} x2={startX} y2={startY + 30} stroke="#374151" strokeWidth="1" />
                            <line x1={startX + totW} y1={startY + 20} x2={startX + totW} y2={startY + 30} stroke="#374151" strokeWidth="1" />
                            {mkTxt(startX + totW/2, startY + 45, lab.totalW)}
                        </>
                    ) : (
                        mkTxt(startX + vW + hW/2, startY + 20, lab.hW) // Fallback to extension label
                    )}
                </g>
            );
        }

        if (dims.subtype === 'house_area') {
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
        
        if (dims.subtype === 'house' || dims.subtype === 'portal') {
             return (
                <g>
                    {dims.subtype === 'house' ? (
                        <>
                            <rect x={cx - 50} y={cy - 20} width={100} height={80} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                            <polygon points={`${cx - 50},${cy - 20} ${cx + 50},${cy - 20} ${cx},${cy - 80}`} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                            {mkTxt(cx + 60, cy + 20, lab.h)}
                            {mkTxt(cx, cy + 80, lab.w)}
                            {mkTxt(cx + 30, cy - 40, lab.h_roof)}
                        </>
                    ) : (
                        <>
                            <rect x={cx - 50} y={cy - 50} width={100} height={100} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                            <path d={`M ${cx - 50} ${cy - 50} A 50 50 0 0 1 ${cx + 50} ${cy - 50}`} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                            {mkTxt(cx, cy + 70, lab.w)}
                            {mkTxt(cx + 60, cy, lab.h, "start")}
                        </>
                    )}
                </g>
            );
        }
    }

    return null;
};