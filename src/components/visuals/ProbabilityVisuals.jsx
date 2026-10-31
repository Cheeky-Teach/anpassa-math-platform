// src/components/views/visuals/ProbabilityVisuals.jsx
import React, { useMemo } from 'react';

/**
 * ProbabilityMarbles
 * Renders an educational transparent glass urn with countable, gradient-styled marbles.
 */
export const ProbabilityMarbles = ({ data }) => {
    if (!data?.items) return null;
    const { red = 0, blue = 0, green = 0, yellow = 0 } = data.items;

    // Build the collection array using standard brand palette colors
    const marbles = useMemo(() => {
        const list = [];
        for (let i = 0; i < red; i++)    list.push({ color: '#f43f5e', name: 'red' });
        for (let i = 0; i < blue; i++)   list.push({ color: '#0ea5e9', name: 'blue' });
        for (let i = 0; i < green; i++)  list.push({ color: '#10b981', name: 'green' });
        for (let i = 0; i < yellow; i++) list.push({ color: '#f59e0b', name: 'yellow' });
        return list;
    }, [red, blue, green, yellow]);

    const total = marbles.length;

    // Organic layout: Distribute marbles across natural resting tiers inside the urn
    const positions = useMemo(() => {
        const coords = [];
        const urnBottomY = 162;
        const urnCenterX = 110;
        
        let row = 0;
        let placed = 0;

        while (placed < total) {
            const countInRow = Math.min(total - placed, 3 + row);
            const rowY = urnBottomY - row * 22;
            const rowWidth = (countInRow - 1) * 23;
            const startX = urnCenterX - rowWidth / 2;

            for (let c = 0; c < countInRow; c++) {
                // Slight natural jitter
                const jitterX = ((c + row) % 2 === 0 ? 1 : -1) * 1.5;
                coords.push({
                    x: startX + c * 23 + jitterX,
                    y: rowY
                });
                placed++;
            }
            row++;
        }
        return coords;
    }, [total]);

    return (
        <div className="w-full flex items-center justify-center p-2">
            <div className="relative w-full max-w-[210px] aspect-square flex items-center justify-center">
                <svg 
                    viewBox="0 0 220 200" 
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-full block overflow-visible drop-shadow-sm"
                >
                    <defs>
                        {/* 3D Marble Lighting */}
                        <radialGradient id="marbleShine" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
                            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
                            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
                        </radialGradient>

                        {/* Glass Urn Gradient */}
                        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.4" />
                        </linearGradient>
                    </defs>

                    {/* Glass Urn Body (Backdrop) */}
                    <path 
                        d="M 60 40 L 70 85 C 50 110 50 165 75 180 C 95 190 125 190 145 180 C 170 165 170 110 150 85 L 160 40 Z" 
                        fill="url(#glassGradient)" 
                        stroke="#94a3b8" 
                        strokeWidth="3" 
                        strokeLinejoin="round"
                    />

                    {/* Urn Neck Lip */}
                    <ellipse cx="110" cy="40" rx="50" ry="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2.5" />

                    {/* Marbles */}
                    {marbles.map((m, idx) => {
                        const pos = positions[idx] || { x: 110, y: 150 };
                        return (
                            <g key={idx}>
                                {/* Base Colored Circle */}
                                <circle 
                                    cx={pos.x} 
                                    cy={pos.y} 
                                    r={10.5} 
                                    fill={m.color} 
                                    stroke="rgba(0,0,0,0.18)" 
                                    strokeWidth="1" 
                                />
                                {/* Specular Highlight Layer */}
                                <circle 
                                    cx={pos.x} 
                                    cy={pos.y} 
                                    r={10.5} 
                                    fill="url(#marbleShine)" 
                                />
                                {/* Crisp Gloss Dot */}
                                <circle 
                                    cx={pos.x - 3} 
                                    cy={pos.y - 3} 
                                    r={2} 
                                    fill="#ffffff" 
                                    opacity="0.75" 
                                />
                            </g>
                        );
                    })}

                    {/* Glass Specular Reflection Highlight (Forefront) */}
                    <path 
                        d="M 66 110 C 60 130 65 160 85 174" 
                        fill="none" 
                        stroke="#ffffff" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        opacity="0.6" 
                    />
                </svg>
            </div>
        </div>
    );
};

/**
 * ProbabilitySpinner
 * Renders a clean, high-contrast spinner with labeled sectors and a distinct pointer.
 */
export const ProbabilitySpinner = ({ data }) => {
    if (!data?.sections) return null;
    
    const sections = Math.max(1, Number(data.sections)); 
    const radius = 86; 
    const cx = 100; 
    const cy = 100;
    const step = (2 * Math.PI) / sections;

    // Structured Palette: Target colors matched to standard palette, neutral fillers in soft slate
    const colorSequence = useMemo(() => {
        const sequence = [];
        const targets = [
            { key: 'red', hex: '#f43f5e' },
            { key: 'blue', hex: '#0ea5e9' },
            { key: 'green', hex: '#10b981' },
            { key: 'yellow', hex: '#f59e0b' }
        ];

        // 1. Add configured target slices
        targets.forEach(item => {
            const count = data.counts?.[item.key] || 0;
            for (let i = 0; i < count; i++) {
                if (sequence.length < sections) sequence.push({ hex: item.hex, isTarget: true });
            }
        });

        // 2. Fill remainder with clean alternating neutral tints
        let neutralToggle = false;
        while (sequence.length < sections) {
            sequence.push({
                hex: neutralToggle ? '#f1f5f9' : '#e2e8f0',
                isTarget: false
            });
            neutralToggle = !neutralToggle;
        }

        // 3. Stable Fisher-Yates distribution
        for (let i = sequence.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
        }
        
        return sequence;
    }, [data.counts, sections]);

    const slices = [];
    for (let i = 0; i < sections; i++) {
        const startAngle = i * step - Math.PI / 2; 
        const endAngle = (i + 1) * step - Math.PI / 2;
        const x1 = cx + radius * Math.cos(startAngle); 
        const y1 = cy + radius * Math.sin(startAngle);
        const x2 = cx + radius * Math.cos(endAngle); 
        const y2 = cy + radius * Math.sin(endAngle);
        const largeArc = step > Math.PI ? 1 : 0;
        const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        
        const isTargetSlice = colorSequence[i].isTarget;

        slices.push(
            <path 
                key={`slice-${i}`} 
                d={pathData} 
                fill={colorSequence[i].hex} 
                stroke="#ffffff" 
                strokeWidth="1.75" 
            />
        );

        // Numeric Sector Labels (Rendered on slices up to 16 sectors)
        if (sections <= 16) {
            const labelAngle = startAngle + step / 2;
            const lx = cx + (radius * 0.68) * Math.cos(labelAngle);
            const ly = cy + (radius * 0.68) * Math.sin(labelAngle);
            slices.push(
                <text 
                    key={`label-${i}`} 
                    x={lx} 
                    y={ly} 
                    fill={isTargetSlice ? "#ffffff" : "#475569"} 
                    fontSize="13" 
                    fontWeight="900" 
                    textAnchor="middle" 
                    dominantBaseline="central"
                    className="select-none pointer-events-none font-sans drop-shadow-xs"
                >
                    {i + 1}
                </text>
            );
        }
    }

    return (
        <div className="w-full flex items-center justify-center p-2">
            <div className="relative w-full max-w-[210px] aspect-square flex items-center justify-center">
                <svg 
                    viewBox="0 0 200 200"
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-full block overflow-visible drop-shadow-md"
                >
                    {/* Outer Wheel Rim */}
                    <circle cx="100" cy="100" r={radius + 3} fill="#64748b" />
                    
                    {/* Pie Slices */}
                    {slices}

                    {/* Top Pointer Indicator */}
                    <path 
                        d="M 100 10 L 92 34 L 108 34 Z" 
                        fill="#0f172a" 
                        stroke="#ffffff" 
                        strokeWidth="1.5" 
                        strokeLinejoin="round" 
                    />

                    {/* Center Pivot Hub */}
                    <circle cx="100" cy="100" r="9" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx="100" cy="100" r="3" fill="#cbd5e1" />
                </svg>
            </div>
        </div>
    );
};