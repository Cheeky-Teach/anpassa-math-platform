// src/components/visuals/GeometryShapes.jsx
import React from 'react';

/**
 * mkTxt - Standardized Geometric Label Helper
 * Matches AngleComponents typography and branding.
 */
export const mkTxt = (
    x, 
    y, 
    txt, 
    anchor = "middle", 
    baseline = "middle", 
    color = "#0f172a",
    haloColor = "#ffffff"
) => (
    <text 
        key={`${x}-${y}-${txt}`} 
        x={x} 
        y={y} 
        textAnchor={anchor} 
        dominantBaseline={baseline} 
        fontWeight="800" 
        fill={color} 
        stroke={haloColor}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ paintOrder: "stroke fill" }}
        fontSize="17"
        className="font-sans select-none pointer-events-none drop-shadow-xs"
    >
        {txt}
    </text>
);

/**
 * mkRightAngleMark - Draws a 90 degree symbol at a vertex
 */
const mkRightAngleMark = (x, y, size = 12, orientation = "bottom-left") => {
    let d = "";
    if (orientation === "bottom-left") {
        d = `M ${x} ${y - size} L ${x + size} ${y - size} L ${x + size} ${y}`;
    } else if (orientation === "bottom-right") {
        d = `M ${x} ${y - size} L ${x - size} ${y - size} L ${x - size} ${y}`;
    } else if (orientation === "top-left") {
        d = `M ${x} ${y + size} L ${x + size} ${y + size} L ${x + size} ${y}`;
    }
    return <path d={d} fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinejoin="miter" />;
};

export const GeometryVisual = ({ data }) => {
    if (!data) return null;

    const baseWidth = 300;
    const baseHeight = 250;

    return (
        <div className="w-full flex items-center justify-center p-1">
            <div className="relative w-full max-w-[260px] aspect-[4/3] flex items-center justify-center">
                <svg 
                    viewBox={`0 0 ${baseWidth} ${baseHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-full block overflow-visible drop-shadow-sm"
                >
                    <RenderShape 
                        type={data.type} 
                        subtype={data.subtype || (data.dims && data.dims.subtype)}
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
    const cx = 150 + offsetX;
    const cy = 125 + offsetY;
    const safeDims = dims || {};
    const lab = labels || {};

    const activeSubtype = subtype || safeDims.subtype || (safeDims.dims && safeDims.dims.subtype) || type;
    
    // Determine the true total dimensions for scaling
    let rawW = safeDims.width || safeDims.w || 10;
    let rawH = safeDims.height || safeDims.h || 10;
    const rawR = safeDims.radius || safeDims.r || 5;

    if (type === 'composite') {
        if (activeSubtype === 'rect_right_tri') rawW = (lab.w || 10) + (lab.tri_b || 5);
        if (activeSubtype === 'l_shape') {
            rawW = (lab.vW || 3) + (lab.hW || 6);
            rawH = rawH * 1.35; 
        }
        if (activeSubtype === 'house' || activeSubtype === 'house_area') {
            rawH = (lab.h || lab.s || 10) + (lab.h_roof || lab.h_tri || 5);
        }
        if (activeSubtype === 'portal') rawH = (lab.h || 10) + ((lab.w || 10) / 2);
    }

    const maxDim = Math.max(rawW, rawH, rawR * 2) || 10;
    const baseScale = (165 / maxDim) * scale;
    
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

    // BRAND PALETTE CONSTANTS
    const STROKE_COLOR = "#1e293b";
    const STROKE_WIDTH = 2.5;
    const FILL_COLOR = "rgba(99, 102, 241, 0.08)"; // Modern light indigo tint
    const GUIDE_COLOR = "#94a3b8";

    // --- RECTANGLE / SQUARE ---
    if (type === 'rectangle') {
        const w = Math.min(220, (dims.w || 14) * scale);
        const h = Math.min(150, (dims.h || 10) * scale);
        const x0 = cx - w / 2;
        const y0 = cy - h / 2;

        const diagLabel = lab.hyp || lab.d;

        return (
            <g className="select-none">
                {/* Base Rectangle */}
                <rect 
                    x={x0} 
                    y={y0} 
                    width={w} 
                    height={h} 
                    fill="rgba(99, 102, 241, 0.08)" 
                    stroke="#1e293b" 
                    strokeWidth="2.5" 
                    rx="2"
                />

                {/* Optional Diagonal Line Indicator (for Pythagoras / Level 6) */}
                {diagLabel && (
                    <>
                        {/* Shaded lower right-angled triangle */}
                        <polygon 
                            points={`${x0},${y0 + h} ${x0 + w},${y0 + h} ${x0 + w},${y0}`} 
                            fill="rgba(99, 102, 241, 0.12)" 
                        />
                        
                        {/* 90° Right Angle Marker in the bottom-right corner */}
                        <path 
                            d={`M ${x0 + w - 12} ${y0 + h} L ${x0 + w - 12} ${y0 + h - 12} L ${x0 + w} ${y0 + h - 12}`} 
                            fill="none" 
                            stroke="#64748b" 
                            strokeWidth="1.5" 
                        />

                        {/* Bold / Dashed Diagonal Line from top-left (or bottom-left) to opposite corner */}
                        <line 
                            x1={x0} 
                            y1={y0 + h} 
                            x2={x0 + w} 
                            y2={y0} 
                            stroke="#4f46e5" 
                            strokeWidth="2" 
                            strokeDasharray="5,4" 
                        />

                        {/* Protected Text Halo for the Diagonal 'd' */}
                        {mkTxt(cx - 8, cy - 8, diagLabel, "middle", "middle", "#4f46e5", "#ffffff")}
                    </>
                )}

                {/* Dimension Labels for Width and Height */}
                {lab.w && mkTxt(cx, y0 + h + 16, lab.w, "middle", "middle")}
                {lab.h && mkTxt(x0 + w + 16, cy, lab.h, "start", "middle")}
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
                {/* Dotted height line & 90 deg marker */}
                <line x1={xTL} y1={yTop} x2={xTL} y2={yBot} stroke={GUIDE_COLOR} strokeWidth="1.5" strokeDasharray="3 3" />
                {mkRightAngleMark(xTL, yBot, 10, "bottom-left")}
                
                <polygon 
                    points={path} 
                    fill={FILL_COLOR} 
                    stroke={STROKE_COLOR} 
                    strokeWidth={STROKE_WIDTH} 
                    strokeLinejoin="round" 
                />
                
                {l_b && mkTxt((xBL + xBR) / 2, yBot + 20, l_b)}
                {l_h && mkTxt(xTL - 12, (yTop + yBot) / 2, l_h, "end")}
                {l_slant && mkTxt((xBR + xTR) / 2 + 16, (yBot + yTop) / 2, l_slant, "start")}
            </g>
        );
    }

    // --- TRIANGLE ---
    if (type === 'triangle') {
        const L = cx - sw / 2; 
        const R = cx + sw / 2;
        const T = cy - sh / 2; 
        const B = cy + sh / 2;
        
        if (activeSubtype === 'right') {
            const p1 = { x: L, y: T }; 
            const p2 = { x: L, y: B }; 
            const p3 = { x: R, y: B };
            const path = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
            return (
                <g>
                    <polygon 
                        points={path} 
                        fill={FILL_COLOR} 
                        stroke={STROKE_COLOR} 
                        strokeWidth={STROKE_WIDTH} 
                        strokeLinejoin="round" 
                    />
                    {mkRightAngleMark(L, B, 14, "bottom-left")}
                    {l_h && mkTxt(L - 16, cy, l_h, "end")}
                    {l_b && mkTxt((L + R) / 2, B + 22, l_b)}
                    {l_hyp && mkTxt((L + R) / 2 + 14, cy - 10, l_hyp, "start")}
                </g>
            );
        } else {
            const points = `${L},${B} ${R},${B} ${cx},${T}`;
            return (
                <g>
                    <polygon 
                        points={points} 
                        fill={FILL_COLOR} 
                        stroke={STROKE_COLOR} 
                        strokeWidth={STROKE_WIDTH} 
                        strokeLinejoin="round" 
                    />
                    
                    {/* Dotted reference height line */}
                    <line x1={cx} y1={T} x2={cx} y2={B} stroke={GUIDE_COLOR} strokeWidth="1.5" strokeDasharray="3 3" />
                    {mkRightAngleMark(cx, B, 10, "bottom-left")}
                    
                    {l_b && mkTxt(cx, B + 22, l_b)}
                    {l_h && mkTxt(cx + 12, cy + 10, l_h, "start")}
                    {l_s1 && mkTxt(L + (cx - L) / 2 - 14, (B + T) / 2, l_s1, "end")}
                    {l_s2 && mkTxt(cx + (R - cx) / 2 + 14, (B + T) / 2, l_s2, "start")}

                    {/* Angle labels */}
                    {safeLabels.angle1 && mkTxt(L + 18, B - 10, safeLabels.angle1, "start", "middle", "#4338ca")}
                    {safeLabels.angle2 && mkTxt(R - 18, B - 10, safeLabels.angle2, "end", "middle", "#4338ca")}
                    {safeLabels.angle3 && mkTxt(cx, T + 25, safeLabels.angle3, "middle", "middle", "#4338ca")}
                </g>
            );
        }
    }

    if (type === 'pythagoras_proof') {
        // 3-4-5 right triangle scale calibrated to fit a 300x250 viewBox
        const scale = 1.15;
        const a = 36 * scale;  // Vertical leg (e.g. ~41.4px)
        const b = 48 * scale;  // Horizontal leg (e.g. ~55.2px)
        
        // Position origin (the 90° right angle corner) slightly down and left
        const ox = cx - 35;
        const oy = cy + 30;

        const areaA = lab.areaA; // Leg A square (left)
        const areaB = lab.areaB; // Leg B square (bottom)
        const areaC = lab.areaC; // Hypotenuse C square (top-right)

        // Two corners touching the hypotenuse
        const p1x = ox;         // Top vertex
        const p1y = oy - a;
        const p2x = ox + b;     // Right vertex
        const p2y = oy;

        // Perpendicular vector (a, -b) gives a 100% true, rigid Euclidean square:
        // Length is exactly sqrt(a^2 + b^2) and orthogonal to the hypotenuse
        const p3x = p2x + a;
        const p3y = p2y - b;
        const p4x = p1x + a;
        const p4y = p1y - b;

        // Center of Square C for text label placement
        const centerCx = (p1x + p2x + p3x + p4x) / 4;
        const centerCy = (p1y + p2y + p3y + p4y) / 4;

        return (
            <g className="select-none">
                {/* Square A (Left of vertical leg) */}
                <rect 
                    x={ox - a} 
                    y={oy - a} 
                    width={a} 
                    height={a} 
                    fill={areaA === '?' ? "rgba(239, 68, 68, 0.08)" : "rgba(99, 102, 241, 0.08)"} 
                    stroke={areaA === '?' ? "#ef4444" : "#1e293b"} 
                    strokeWidth="2" 
                />
                {mkTxt(ox - a / 2, oy - a / 2, areaA, "middle", "middle", areaA === '?' ? "#dc2626" : "#0f172a", "#f8fafc")}

                {/* Square B (Below horizontal leg) */}
                <rect 
                    x={ox} 
                    y={oy} 
                    width={b} 
                    height={b} 
                    fill={areaB === '?' ? "rgba(239, 68, 68, 0.08)" : "rgba(99, 102, 241, 0.08)"} 
                    stroke={areaB === '?' ? "#ef4444" : "#1e293b"} 
                    strokeWidth="2" 
                />
                {mkTxt(ox + b / 2, oy + b / 2, areaB, "middle", "middle", areaB === '?' ? "#dc2626" : "#0f172a", "#f8fafc")}

                {/* Square C (True orthogonal square on hypotenuse) */}
                <polygon 
                    points={`${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}`} 
                    fill={areaC === '?' ? "rgba(239, 68, 68, 0.08)" : "rgba(99, 102, 241, 0.08)"} 
                    stroke={areaC === '?' ? "#ef4444" : "#1e293b"} 
                    strokeWidth="2" 
                    strokeLinejoin="round"
                />
                {mkTxt(centerCx, centerCy, areaC, "middle", "middle", areaC === '?' ? "#dc2626" : "#0f172a", "#ffffff")}

                {/* Central Right Triangle */}
                <polygon 
                    points={`${ox},${oy} ${p1x},${p1y} ${p2x},${p2y}`} 
                    fill="#f8fafc" 
                    stroke="#0f172a" 
                    strokeWidth="2.5" 
                    strokeLinejoin="round"
                />

                {/* 90° Corner Marker */}
                <path 
                    d={`M ${ox} ${oy - 10} L ${ox + 10} ${oy - 10} L ${ox + 10} ${oy}`} 
                    fill="none" 
                    stroke="#64748b" 
                    strokeWidth="1.5" 
                />
            </g>
        );
    }

    // --- CIRCLE ---
    if (type === 'circle') {
        const isDiameter = safeDims.show === 'diameter';
        const labelTxt = safeLabels.val || (safeLabels.r ? `r = ${safeLabels.r}` : (safeLabels.diameter ? `d = ${safeLabels.diameter}` : null));
        return (
            <g>
                <circle 
                    cx={cx} 
                    cy={cy} 
                    r={sr} 
                    fill={FILL_COLOR} 
                    stroke={STROKE_COLOR} 
                    strokeWidth={STROKE_WIDTH} 
                />
                {isDiameter ? (
                    <>
                        <line x1={cx - sr} y1={cy} x2={cx + sr} y2={cy} stroke={STROKE_COLOR} strokeWidth="2" strokeDasharray="4 3" />
                        <circle cx={cx} cy={cy} r={3.5} fill={STROKE_COLOR} />
                        {labelTxt && mkTxt(cx, cy - 14, labelTxt)}
                    </>
                ) : (
                    <>
                        <circle cx={cx} cy={cy} r={3.5} fill={STROKE_COLOR} />
                        <line x1={cx} y1={cy} x2={cx + sr} y2={cy} stroke={STROKE_COLOR} strokeWidth="2" />
                        {labelTxt && mkTxt(cx + sr / 2, cy - 14, labelTxt)}
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
                <path d={dPath} fill={FILL_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                {isDiameter ? (
                    <>
                        <line x1={cx - sr} y1={cy + 16} x2={cx + sr} y2={cy + 16} stroke={GUIDE_COLOR} strokeWidth="1.5" />
                        {mkTxt(cx, cy + 32, dVal ? `d = ${dVal}` : '')}
                    </>
                ) : (
                    <>
                        <circle cx={cx} cy={cy} r={3.5} fill={STROKE_COLOR} />
                        <line x1={cx} y1={cy} x2={cx + sr * 0.7} y2={cy - sr * 0.7} stroke={STROKE_COLOR} strokeWidth="2" />
                        {mkTxt(cx + sr * 0.35 + 10, cy - sr * 0.35 - 10, rVal ? `r = ${rVal}` : '')}
                    </>
                )}
            </g>
        );
    }

    // --- QUARTER CIRCLE ---
    if (type === 'quarter_circle') {
        const rVal = safeLabels.r;
        const originX = cx - sr / 2;
        const originY = cy + sr / 2;
        const dPath = `M ${originX} ${originY} L ${originX + sr} ${originY} A ${sr} ${sr} 0 0 0 ${originX} ${originY - sr} Z`;

        return (
            <g>
                <path d={dPath} fill={FILL_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                {mkRightAngleMark(originX, originY, 12, "bottom-left")}
                {mkTxt(originX + sr / 2, originY + 20, rVal ? `r = ${rVal}` : '')}
                {mkTxt(originX - 18, originY - sr / 2, rVal ? `r = ${rVal}` : '', "end")}
            </g>
        );
    }
    
    // --- COMPOSITE SHAPES ---
    if (type === 'composite') {
        if (activeSubtype === 'rect_right_tri') {
            const wRect = (lab.w || 10) * baseScale;
            const hRect = (lab.h || 10) * baseScale;
            const wTri = (lab.tri_b || 5) * baseScale;
            const totalW = wRect + wTri;
            const startX = cx - totalW / 2;
            const startY = cy + hRect / 2;

            return (
                <g>
                    <rect x={startX} y={startY - hRect} width={wRect} height={hRect} fill={FILL_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                    <polygon points={`${startX + wRect},${startY} ${startX + wRect + wTri},${startY} ${startX + wRect},${startY - hRect}`} fill={FILL_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                    {mkRightAngleMark(startX, startY, 12, "bottom-left")}
                    {mkRightAngleMark(startX + wRect, startY, 12, "bottom-left")}
                    
                    {mkTxt(startX + wRect / 2, startY + 22, lab.w)} 
                    {mkTxt(startX - 18, startY - hRect / 2, lab.h, "end")} 
                    {mkTxt(startX + wRect + wTri / 2, startY + 22, lab.tri_b)} 
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
                    <polygon points={p} fill={FILL_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                    {mkRightAngleMark(startX, startY, 12, "bottom-left")}
                    {mkTxt(startX + vW / 2, startY - vH - 16, lab.vW)}
                    {mkTxt(startX - 18, startY - vH / 2, lab.vH, "end")}
                    {mkTxt(startX + totW + 18, startY - hH / 2, lab.hH, "start")}
                    {!!lab.totalW && (
                        <>
                            <line x1={startX} y1={startY + 24} x2={startX + totW} y2={startY + 24} stroke={GUIDE_COLOR} strokeWidth="1.5" />
                            {mkTxt(startX + totW / 2, startY + 42, lab.totalW)}
                        </>
                    )}
                </g>
            );
        }

        if (activeSubtype === 'house_area') {
            const s = (lab.s || 10) * baseScale;
            const hTri = (lab.h_tri || 5) * baseScale;
            const startX = cx - s / 2;
            const startY = cy + s / 2; 

            return (
                <g>
                    <rect x={startX} y={startY - s} width={s} height={s} fill={FILL_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                    <polygon points={`${startX},${startY - s} ${startX + s},${startY - s} ${cx},${startY - s - hTri}`} fill={FILL_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                    <line x1={cx} y1={startY - s} x2={cx} y2={startY - s - hTri} stroke={GUIDE_COLOR} strokeWidth="1.5" strokeDasharray="3 3" />
                    {mkRightAngleMark(startX, startY, 12, "bottom-left")}
                    {mkTxt(cx, startY + 22, lab.s)} 
                    {mkTxt(startX - 18, startY - s / 2, lab.s, "end")} 
                    {mkTxt(cx + 14, startY - s - hTri / 2, lab.h_tri, "start")} 
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
                            <rect x={startX} y={startY - hBase} width={wBase} height={hBase} fill={FILL_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                            <polygon points={`${startX},${startY - hBase} ${startX + wBase},${startY - hBase} ${cx},${startY - totalH}`} fill={FILL_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                            {mkRightAngleMark(startX, startY, 12, "bottom-left")}
                            
                            {!isPerimeterMode ? (
                                <>
                                    <line x1={cx} y1={startY - hBase} x2={cx} y2={startY - totalH} stroke={GUIDE_COLOR} strokeWidth="1.5" strokeDasharray="3 3" />
                                    {mkTxt(startX + wBase + 16, startY - hBase / 2, lab.h, "start")}
                                    {mkTxt(cx, startY + 22, lab.w)}
                                    {mkTxt(cx + 14, startY - hBase - hTop / 2, lab.h_roof, "start")}
                                </>
                            ) : (
                                <>
                                    {mkTxt(startX - 18, startY - hBase / 2, lab.h, "end")}
                                    {mkTxt(startX + wBase + 18, startY - hBase / 2, lab.h, "start")}
                                    {mkTxt(cx, startY + 22, lab.w)}
                                    {mkTxt((startX + cx) / 2 - 16, (startY - hBase + (startY - totalH)) / 2 - 8, lab.s, "end")}
                                    {mkTxt((startX + wBase + cx) / 2 + 16, (startY - hBase + (startY - totalH)) / 2 - 8, lab.s, "start")}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <rect x={startX} y={startY - hBase} width={wBase} height={hBase} fill={FILL_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                            <path d={`M ${startX} ${startY - hBase} A ${wBase / 2} ${wBase / 2} 0 0 1 ${startX + wBase} ${startY - hBase}`} fill={FILL_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                            {mkRightAngleMark(startX, startY, 12, "bottom-left")}
                            {mkTxt(cx, startY + 22, lab.w)}
                            {mkTxt(startX - 18, startY - hBase / 2, lab.h, "end")}
                            {mkTxt(startX + wBase + 18, startY - hBase / 2, lab.h, "start")}
                            {isPerimeterMode && lab.arc && (
                                mkTxt(cx, startY - totalH - 14, lab.arc)
                            )}
                        </>
                    )}
                </g>
            );
        }
    }

    return null;
};