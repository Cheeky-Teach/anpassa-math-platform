// src/components/shared/visuals/ScaleVisuals.jsx
import React from 'react';
import { VolumeVisualization } from './VolumeVisualization';

/**
 * Standardized Label with Contrast Halo (Matches GeometryShapes)
 */
const SvgLabel = ({ x, y, text, color = "#0f172a", fontSize = 15, anchor = "middle", weight = "800" }) => {
    if (text === undefined || text === null) return null;
    return (
        <text
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="central"
            fontWeight={weight}
            fontSize={fontSize}
            fill={color}
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinejoin="round"
            style={{ paintOrder: "stroke fill" }}
            className="font-mono select-none pointer-events-none"
        >
            {text}
        </text>
    );
};

/**
 * 1. Blueprint / Map Scale Bar Visual (Levels 1 - 4)
 * Figure A (Left) = Picture / Drawing
 * Figure B (Right) = Reality / Actual Object
 */
export const ScaleVisual = ({ data }) => {
    if (!data) return null;

    const {
        ratio = "1:50",
        pictureLength = "4 cm",
        realLength = "x",
        mode = "reduction", // 'reduction' | 'enlargement'
        shape = "rectangle"
    } = data;

    const isEnlargement = mode === 'enlargement';

    // Figure A (Left / Picture) dimensions
    // Enlargement: Picture is BIG. Reduction: Picture is SMALL.
    const picW = isEnlargement ? 140 : 80;
    const picH = isEnlargement ? 95 : 55;
    const picR = isEnlargement ? 48 : 28;

    // Figure B (Right / Reality) dimensions
    // Enlargement: Reality is SMALL. Reduction: Reality is BIG.
    const realW = isEnlargement ? 75 : 150;
    const realH = isEnlargement ? 50 : 105;
    const realR = isEnlargement ? 25 : 52;

    return (
        <div className="w-full flex justify-center py-3 select-none bg-transparent">
            <svg 
                viewBox="0 0 580 190" 
                className="w-full max-w-[560px] h-auto overflow-visible font-sans"
            >
                {/* Scale Ratio Badge */}
                <g transform="translate(290, 24)">
                    <rect 
                        x="-60" y="-14" width="120" height="28" rx="14" 
                        fill="#f8fafc"
                        stroke="#4f46e5" 
                        strokeWidth="2" 
                    />
                    <SvgLabel x={0} y={0} text={ratio} color="#4338ca" fontSize={14} />
                </g>

                {/* Left: Figure A (Picture / Drawing) */}
                <g transform="translate(125, 110)">
                    {shape === 'circle' ? (
                        <circle cx="0" cy="0" r={picR} fill="rgba(99, 102, 241, 0.08)" stroke="#1e293b" strokeWidth="2.5" />
                    ) : (
                        <rect 
                            x={-picW / 2} 
                            y={-picH / 2} 
                            width={picW} 
                            height={picH} 
                            rx="5" 
                            fill="rgba(99, 102, 241, 0.08)" 
                            stroke="#1e293b" 
                            strokeWidth="2.5" 
                        />
                    )}

                    {/* Dimension Bar */}
                    <line 
                        x1={-picW / 2} 
                        y1={-picH / 2 - 10} 
                        x2={picW / 2} 
                        y2={-picH / 2 - 10} 
                        stroke="#64748b" 
                        strokeWidth="1.75" 
                    />
                    <line x1={-picW / 2} y1={-picH / 2 - 15} x2={-picW / 2} y2={-picH / 2 - 5} stroke="#64748b" strokeWidth="1.75" />
                    <line x1={picW / 2} y1={-picH / 2 - 15} x2={picW / 2} y2={-picH / 2 - 5} stroke="#64748b" strokeWidth="1.75" />

                    <SvgLabel x={0} y={-picH / 2 - 24} text={pictureLength} color="#1e293b" fontSize={14} />
                    <SvgLabel x={0} y={picH / 2 + 18} text="A" color="#64748b" fontSize={13} weight="900" />
                </g>

                {/* Transition Indicator */}
                <g transform="translate(290, 110)">
                    <line x1="-30" y1="0" x2="30" y2="0" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="5 4" />
                    <polygon points="30,0 20,-6 20,6" fill="#94a3b8" />
                </g>

                {/* Right: Figure B (Reality / Actual Object) */}
                <g transform="translate(455, 110)">
                    {shape === 'circle' ? (
                        <circle cx="0" cy="0" r={realR} fill="rgba(16, 185, 129, 0.08)" stroke="#059669" strokeWidth="2.5" />
                    ) : (
                        <rect 
                            x={-realW / 2} 
                            y={-realH / 2} 
                            width={realW} 
                            height={realH} 
                            rx="5" 
                            fill="rgba(16, 185, 129, 0.08)" 
                            stroke="#059669" 
                            strokeWidth="2.5" 
                        />
                    )}

                    {/* Dimension Bar */}
                    <line 
                        x1={-realW / 2} 
                        y1={-realH / 2 - 10} 
                        x2={realW / 2} 
                        y2={-realH / 2 - 10} 
                        stroke="#059669" 
                        strokeWidth="1.75" 
                    />
                    <line x1={-realW / 2} y1={-realH / 2 - 15} x2={-realW / 2} y2={-realH / 2 - 5} stroke="#059669" strokeWidth="1.75" />
                    <line x1={realW / 2} y1={-realH / 2 - 15} x2={realW / 2} y2={-realH / 2 - 5} stroke="#059669" strokeWidth="1.75" />

                    <SvgLabel x={0} y={-realH / 2 - 24} text={realLength} color="#047857" fontSize={14} />
                    <SvgLabel x={0} y={realH / 2 + 18} text="B" color="#059669" fontSize={13} weight="900" />
                </g>
            </svg>
        </div>
    );
};

/**
 * 2. Similar Figures (Levels 5 & 6)
 * Anchored to an absolute baseline with dynamic spacing
 */
export const SimilarityCompare = ({ data }) => {
    if (!data) return null;

    // LEVEL 6: Nested Triangles (Topptriangelsatsen)
    if (data.variant === "nested") {
        const { topBase = "a", fullBase = "b", topSide = "c", fullSide = "d" } = data.nested || {};
        return (
            <div className="w-full flex justify-center py-3 select-none bg-transparent">
                <svg viewBox="0 0 380 240" className="w-full max-w-[360px] h-auto overflow-visible font-sans">
                    {/* Big Triangle */}
                    <polygon 
                        points="190,20 40,210 340,210" 
                        fill="rgba(99, 102, 241, 0.06)" 
                        stroke="#1e293b" 
                        strokeWidth="2.8" 
                        strokeLinejoin="round" 
                    />
                    {/* Parallel Transversal */}
                    <line x1="100" y1="133" x2="280" y2="133" stroke="#059669" strokeWidth="2.8" />
                    
                    {/* Parallel Arrows */}
                    <path d="M183 129 L193 133 L183 137" fill="none" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" />
                    <path d="M183 206 L193 210 L183 214" fill="none" stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" />

                    {/* Proportional dimension labels */}
                    <SvgLabel x={190} y={122} text={topBase} color="#047857" fontSize={15} />
                    <SvgLabel x={190} y={226} text={fullBase} color="#1e293b" fontSize={15} />
                    <SvgLabel x={65} y={80} text={topSide} color="#4338ca" fontSize={14} />
                    <SvgLabel x={25} y={168} text={fullSide} color="#1e293b" fontSize={14} />
                </svg>
            </div>
        );
    }

    const shape = data.shapeType || 'triangle';
    const sub = data.subtype || 'right';
    const baseY = 205;

    // --- CASE A: Right-angled Triangle ---
    if (shape === 'triangle' && sub === 'right') {
        const leftW = 105;
        const leftH = 80;
        const rightW = 195;
        const rightH = 150;

        return (
            <div className="w-full flex justify-center py-3 select-none bg-transparent">
                <svg viewBox="0 0 540 240" className="w-full max-w-[520px] h-auto overflow-visible font-sans">
                    {/* Left Small Triangle */}
                    <g transform="translate(60, 0)">
                        <polygon 
                            points={`0,${baseY} ${leftW},${baseY} 0,${baseY - leftH}`} 
                            fill="rgba(99, 102, 241, 0.08)" 
                            stroke="#1e293b" 
                            strokeWidth="2.5" 
                            strokeLinejoin="round" 
                        />
                        <path d={`M 0,${baseY - 14} L 14,${baseY - 14} L 14,${baseY}`} fill="none" stroke="#64748b" strokeWidth="1.75" />
                        <SvgLabel x={leftW / 2} y={baseY + 18} text={data.leftLabels?.b} fontSize={14} />
                        <SvgLabel x={-20} y={baseY - leftH / 2} text={data.leftLabels?.h} fontSize={14} />
                        {data.leftLabels?.hyp && <SvgLabel x={leftW / 2 + 12} y={baseY - leftH / 2 - 10} text={data.leftLabels.hyp} fontSize={14} />}
                    </g>

                    {/* Similarity Indicator */}
                    <text x="235" y={baseY - 55} textAnchor="middle" className="fill-slate-400 font-serif font-black text-4xl select-none">
                        ∼
                    </text>

                    {/* Right Large Scaled Triangle */}
                    <g transform="translate(300, 0)">
                        <polygon 
                            points={`0,${baseY} ${rightW},${baseY} 0,${baseY - rightH}`} 
                            fill="rgba(16, 185, 129, 0.08)" 
                            stroke="#059669" 
                            strokeWidth="2.8" 
                            strokeLinejoin="round" 
                        />
                        <path d={`M 0,${baseY - 16} L 16,${baseY - 16} L 16,${baseY}`} fill="none" stroke="#059669" strokeWidth="1.75" />
                        <SvgLabel x={rightW / 2} y={baseY + 18} text={data.rightLabels?.b} color="#047857" fontSize={15} />
                        <SvgLabel x={-20} y={baseY - rightH / 2} text={data.rightLabels?.h} color="#047857" fontSize={15} />
                        {data.rightLabels?.hyp && <SvgLabel x={rightW / 2 + 15} y={baseY - rightH / 2 - 12} text={data.rightLabels.hyp} color="#047857" fontSize={15} />}
                    </g>
                </svg>
            </div>
        );
    }

    // --- CASE B: Isosceles Triangle ---
    if (shape === 'triangle' && sub === 'isosceles') {
        const leftB = 110;
        const leftH = 85;
        const rightB = 200;
        const rightH = 155;

        return (
            <div className="w-full flex justify-center py-3 select-none bg-transparent">
                <svg viewBox="0 0 540 240" className="w-full max-w-[520px] h-auto overflow-visible font-sans">
                    <g transform="translate(60, 0)">
                        <polygon 
                            points={`0,${baseY} ${leftB},${baseY} ${leftB / 2},${baseY - leftH}`} 
                            fill="rgba(99, 102, 241, 0.08)" 
                            stroke="#1e293b" 
                            strokeWidth="2.5" 
                            strokeLinejoin="round" 
                        />
                        <line x1={leftB / 2} y1={baseY} x2={leftB / 2} y2={baseY - leftH} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
                        <SvgLabel x={leftB / 2} y={baseY + 18} text={data.leftLabels?.b} fontSize={14} />
                        <SvgLabel x={leftB / 2 + 16} y={baseY - leftH / 2} text={data.leftLabels?.h} fontSize={14} />
                    </g>

                    <text x="235" y={baseY - 55} textAnchor="middle" className="fill-slate-400 font-serif font-black text-4xl select-none">
                        ∼
                    </text>

                    <g transform="translate(300, 0)">
                        <polygon 
                            points={`0,${baseY} ${rightB},${baseY} ${rightB / 2},${baseY - rightH}`} 
                            fill="rgba(16, 185, 129, 0.08)" 
                            stroke="#059669" 
                            strokeWidth="2.8" 
                            strokeLinejoin="round" 
                        />
                        <line x1={rightB / 2} y1={baseY} x2={rightB / 2} y2={baseY - rightH} stroke="#059669" strokeWidth="1.5" strokeDasharray="4 3" />
                        <SvgLabel x={rightB / 2} y={baseY + 18} text={data.rightLabels?.b} color="#047857" fontSize={15} />
                        <SvgLabel x={rightB / 2 + 18} y={baseY - rightH / 2} text={data.rightLabels?.h} color="#047857" fontSize={15} />
                    </g>
                </svg>
            </div>
        );
    }

    // --- CASE C: Parallelogram ---
    const leftW = 110;
    const leftH = 65;
    const rightW = 180;
    const rightH = 110;
    const skewL = 24;
    const skewR = 40;

    return (
        <div className="w-full flex justify-center py-3 select-none bg-transparent">
            <svg viewBox="0 0 540 240" className="w-full max-w-[520px] h-auto overflow-visible font-sans">
                <g transform="translate(50, 0)">
                    <polygon 
                        points={`0,${baseY} ${leftW},${baseY} ${leftW + skewL},${baseY - leftH} ${skewL},${baseY - leftH}`} 
                        fill="rgba(99, 102, 241, 0.08)" 
                        stroke="#1e293b" 
                        strokeWidth="2.5" 
                        strokeLinejoin="round" 
                    />
                    <SvgLabel x={leftW / 2} y={baseY + 18} text={data.leftLabels?.b} fontSize={14} />
                    <SvgLabel x={skewL / 2 - 14} y={baseY - leftH / 2} text={data.leftLabels?.s || data.leftLabels?.h} fontSize={14} />
                </g>

                <text x="235" y={baseY - 45} textAnchor="middle" className="fill-slate-400 font-serif font-black text-4xl select-none">
                    ∼
                </text>

                <g transform="translate(300, 0)">
                    <polygon 
                        points={`0,${baseY} ${rightW},${baseY} ${rightW + skewR},${baseY - rightH} ${skewR},${baseY - rightH}`} 
                        fill="rgba(16, 185, 129, 0.08)" 
                        stroke="#059669" 
                        strokeWidth="2.8" 
                        strokeLinejoin="round" 
                    />
                    <SvgLabel x={rightW / 2} y={baseY + 18} text={data.rightLabels?.b} color="#047857" fontSize={15} />
                    <SvgLabel x={skewR / 2 - 16} y={baseY - rightH / 2} text={data.rightLabels?.s || data.rightLabels?.h} color="#047857" fontSize={15} />
                </g>
            </svg>
        </div>
    );
};

/**
 * 3. Area Scaling Visual (Level 7)
 * Language-neutral factor labels: k and k²
 */
export const CompareShapesArea = ({ data }) => {
    if (!data) return null;
    const { shapeType = 'rectangle', k = 2, leftArea = "A", rightArea = "kA" } = data;
    const baseY = 185;

    if (shapeType === 'circle') {
        const r1 = 38;
        const r2 = Math.min(80, 38 * (k >= 3 ? 2 : 1.6));

        return (
            <div className="w-full flex justify-center py-3 select-none bg-transparent">
                <svg viewBox="0 0 540 230" className="w-full max-w-[500px] h-auto overflow-visible font-sans">
                    <g transform={`translate(120, ${baseY - r1})`}>
                        <circle cx="0" cy="0" r={r1} fill="rgba(99, 102, 241, 0.08)" stroke="#1e293b" strokeWidth="2.5" />
                        <line x1="0" y1="0" x2={r1} y2="0" stroke="#64748b" strokeWidth="1.75" strokeDasharray="3 3" />
                        <SvgLabel x={r1 / 2} y={-10} text={data.leftLabels?.r || "r"} fontSize={13} />
                        <SvgLabel x={0} y={r1 + 22} text={leftArea} color="#1e293b" fontSize={14} />
                    </g>

                    <g transform={`translate(270, ${baseY - 50})`}>
                        <SvgLabel x={0} y={-16} text={`×${k}`} color="#64748b" fontSize={13} />
                        <path d="M-22 0 L22 0 M12 -6 L22 0 L12 6" fill="none" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
                        <SvgLabel x={0} y={18} text={`×${k * k}`} color="#059669" fontSize={14} weight="900" />
                    </g>

                    <g transform={`translate(420, ${baseY - r2})`}>
                        <circle cx="0" cy="0" r={r2} fill="rgba(16, 185, 129, 0.08)" stroke="#059669" strokeWidth="2.8" />
                        <line x1="0" y1="0" x2={r2} y2="0" stroke="#059669" strokeWidth="1.75" strokeDasharray="3 3" />
                        <SvgLabel x={r2 / 2} y={-10} text={data.rightLabels?.r || `${k}r`} color="#047857" fontSize={13} />
                        <SvgLabel x={0} y={r2 + 22} text={rightArea} color="#047857" fontSize={14} />
                    </g>
                </svg>
            </div>
        );
    }

    const w1 = 75;
    const h1 = 55;
    const w2 = Math.min(210, w1 * (k > 2 ? 2.3 : 1.8));
    const h2 = Math.min(150, h1 * (k > 2 ? 2.3 : 1.8));

    return (
        <div className="w-full flex justify-center py-3 select-none bg-transparent">
            <svg viewBox="0 0 540 230" className="w-full max-w-[500px] h-auto overflow-visible font-sans">
                <g transform="translate(60, 0)">
                    <rect 
                        x="0" y={baseY - h1} width={w1} height={h1} rx="4"
                        fill="rgba(99, 102, 241, 0.08)" stroke="#1e293b" strokeWidth="2.5" 
                    />
                    <SvgLabel x={w1 / 2} y={baseY - h1 / 2} text={data.leftLabels?.w} fontSize={14} />
                    <SvgLabel x={w1 / 2} y={baseY + 20} text={leftArea} color="#1e293b" fontSize={14} />
                </g>

                <g transform={`translate(210, ${baseY - 45})`}>
                    <SvgLabel x={0} y={-16} text={`×${k}`} color="#64748b" fontSize={13} />
                    <path d="M-18 0 L18 0 M8 -5 L18 0 L8 5" fill="none" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
                    <SvgLabel x={0} y={18} text={`×${k * k}`} color="#059669" fontSize={14} weight="900" />
                </g>

                <g transform="translate(290, 0)">
                    <rect 
                        x="0" y={baseY - h2} width={w2} height={h2} rx="5"
                        fill="rgba(16, 185, 129, 0.08)" stroke="#059669" strokeWidth="2.8" 
                    />
                    <SvgLabel x={w2 / 2} y={baseY - h2 / 2} text={data.rightLabels?.w} color="#047857" fontSize={14} />
                    <SvgLabel x={w2 / 2} y={baseY + 20} text={rightArea} color="#047857" fontSize={14} />
                </g>
            </svg>
        </div>
    );
};

/**
 * 4. Volume Scaling (Level 8)
 * Enlarged canvases (160px – 200px) with clean multiplier badges
 */
export const CompareShapesVolume = ({ data }) => {
    if (!data) return null;

    const { 
        shapeType = 'cuboid', 
        leftLabels = {}, 
        rightLabels = {}, 
        k = 2, 
        leftVol = "V", 
        rightVol = "kV" 
    } = data;

    return (
        <div className="w-full flex items-center justify-center gap-4 sm:gap-8 py-3 select-none bg-transparent">
            {/* Small 3D Body */}
            <div className="flex flex-col items-center">
                <div className="w-[140px] h-[140px] sm:w-[170px] sm:h-[170px]">
                    <VolumeVisualization data={{ type: shapeType, labels: leftLabels }} />
                </div>
                <span className="mt-2 font-mono font-black text-sm text-slate-800">
                    {leftVol}
                </span>
            </div>

            {/* Transition Multiplier */}
            <div className="flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-bold text-slate-500 font-mono mb-1">
                    ×{k}
                </span>
                <div className="w-12 h-[2.5px] bg-slate-300 relative flex items-center justify-end">
                    <div className="w-2.5 h-2.5 border-t-2 border-r-2 border-slate-400 rotate-45 -mr-1" />
                </div>
                <span className="text-xs font-black text-emerald-600 font-mono mt-1">
                    ×{k * k * k}
                </span>
            </div>

            {/* Large 3D Body */}
            <div className="flex flex-col items-center">
                <div className="w-[170px] h-[170px] sm:w-[210px] sm:h-[210px]">
                    <VolumeVisualization data={{ type: shapeType, labels: rightLabels }} />
                </div>
                <span className="mt-2 font-mono font-black text-sm text-emerald-700">
                    {rightVol}
                </span>
            </div>
        </div>
    );
};