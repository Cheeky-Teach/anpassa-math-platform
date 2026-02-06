import React from 'react';

// Helper for text generation
export const mkTxt = (x, y, txt, anchor = "middle", baseline = "middle", color = "#374151") =>
    <text key={`${x}-${y}-${txt}`} x={x} y={y} textAnchor={anchor} dominantBaseline={baseline} fontWeight="bold" fill={color} fontSize="20">{txt}</text>;

export const RenderShape = ({ type, dims, labels, areaText, offsetX = 0, offsetY = 0, scale = 1 }) => {
    const cx = 150 + offsetX;
    const cy = 125 + offsetY;
    const safeDims = dims || {};
    const maxDim = Math.max(safeDims.width || 0, safeDims.height || 0, (safeDims.radius || 0) * 2) || 10;
    const baseScale = (120 / maxDim) * scale;
    const sw = (safeDims.width || 0) * baseScale;
    const sh = (safeDims.height || 0) * baseScale;
    const sr = (safeDims.radius || 0) * baseScale;

    const l_b = labels?.b || labels?.base || labels?.width || labels?.w || (type === 'rectangle' ? safeDims.width : null);
    const l_h = labels?.h || labels?.height || (type === 'rectangle' ? safeDims.height : null);
    const l_hyp = labels?.hyp || labels?.hypotenuse || labels?.c || labels?.diagonal;
    
    // Angle Labels
    const l_a1 = labels?.a1;
    const l_a2 = labels?.a2;

    // Side Labels for Similarity (s1, s2)
    const l_s1 = labels?.s1;
    const l_s2 = labels?.s2;

    if (type === 'rectangle' || type === 'square' || type === 'parallelogram') {
        return (
            <g>
                <rect x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                {l_b && mkTxt(cx, cy + sh / 2 + 25, l_b)}
                {l_h && mkTxt(cx + sw / 2 + 15, cy, l_h, "start")}
                {areaText && mkTxt(cx, cy, `${areaText} cm²`, "middle", "middle", "#064e3b")}
            </g>
        );
    }
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
            // Isosceles / Generic Triangle
            const points = `${L},${B} ${R},${B} ${cx},${T}`;
            return (
                <g>
                    <line x1={cx} y1={T} x2={cx} y2={B} stroke="#6b7280" strokeWidth="2" strokeDasharray="4" />
                    <polygon points={points} fill="#ecfdf5" stroke="#10b981" strokeWidth="3" fillOpacity="0.5" />
                    {l_b && mkTxt(cx, B + 25, l_b)}
                    {l_h && mkTxt(cx + 5, cy, l_h, "start")}
                    
                    {/* Similarity Side Labels */}
                    {l_s1 && mkTxt(L - 10, cy, l_s1, "end")}
                    {l_s2 && mkTxt(R + 10, cy, l_s2, "start")}

                    {/* Angle 1: Bottom Left */}
                    {l_a1 && (
                        <>
                            <path d={`M ${L + 15} ${B} A 15 15 0 0 0 ${L + 8} ${B - 13}`} fill="none" stroke="#374151" strokeWidth="2" />
                            <text x={L - 10} y={B - 5} fontSize="16" fontWeight="bold" fill="#374151">{l_a1}</text>
                        </>
                    )}
                    
                    {/* Angle 2: Bottom Right */}
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
        const labelTxt = labels?.val || (labels?.r ? `r=${labels.r}` : (labels?.diameter ? `d=${labels.diameter}` : null));
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
    return null;
};