// src/components/views/visuals/ProbabilityTree.jsx
import React from 'react';

/**
 * ProbabilityTree
 * Handles:
 * 1. Combinatorial Pathways (A -> B with optional blocked segments)
 * 2. Standard 2-Stage Probability Trees with stacked fraction badges
 */
const ProbabilityTree = ({ data }) => {
    if (!data) return null;

    const { subtype, layers, groups, initialCounts, targetBranch, obstacles = [] } = data;

    // Helper: Stacked fraction label with high-contrast backdrop pill
    const renderStackedFractionBadge = (x1, y1, x2, y2, num, den, bId) => {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const isTarget = targetBranch === bId;
        const pillWidth = 38;
        const pillHeight = 36;

        return (
            <g key={bId} className="select-none">
                {/* Backdrop pill */}
                <rect 
                    x={mx - pillWidth / 2} 
                    y={my - pillHeight / 2} 
                    width={pillWidth} 
                    height={pillHeight} 
                    fill="#ffffff" 
                    stroke={isTarget ? "#6366f1" : "#cbd5e1"} 
                    strokeWidth={isTarget ? "2.5" : "1.5"} 
                    rx="8" 
                    filter="url(#treePillShadow)"
                />

                {isTarget ? (
                    <text 
                        x={mx} 
                        y={my + 5} 
                        textAnchor="middle" 
                        fontSize="16" 
                        fontWeight="900"
                        className="fill-indigo-600 animate-pulse font-mono"
                    >
                        x
                    </text>
                ) : (
                    <g className="font-mono">
                        {/* Numerator */}
                        <text 
                            x={mx} 
                            y={my - 4} 
                            textAnchor="middle" 
                            fontSize="11" 
                            fontWeight="800"
                            fill="#1e293b"
                        >
                            {num}
                        </text>
                        {/* Fraction Divider Bar */}
                        <line 
                            x1={mx - 10} 
                            y1={my} 
                            x2={mx + 10} 
                            y2={my} 
                            stroke="#64748b" 
                            strokeWidth="1.5" 
                            strokeLinecap="round"
                        />
                        {/* Denominator */}
                        <text 
                            x={mx} 
                            y={my + 12} 
                            textAnchor="middle" 
                            fontSize="11" 
                            fontWeight="800"
                            fill="#1e293b"
                        >
                            {den}
                        </text>
                    </g>
                )}
            </g>
        );
    };

    // =========================================================================
    // 1. PATHWAYS MODE (Combinatorics A -> B)
    // =========================================================================
    if (subtype === 'pathway') {
        const baseWidth = 520;
        const baseHeight = 220;
        const paddingX = 60;
        const paddingY = 40;
        
        const layerCounts = layers || [1, 2, 3, 1];
        const stepX = (baseWidth - paddingX * 2) / (layerCounts.length - 1);

        const getPos = (lIdx, nIdx, count) => {
            const x = paddingX + lIdx * stepX;
            const availableHeight = baseHeight - paddingY * 2;
            const spacing = availableHeight / (count > 1 ? count - 1 : 1);
            const y = count === 1 ? baseHeight / 2 : paddingY + nIdx * spacing;
            return { x, y };
        };

        return (
            <div className="w-full flex items-center justify-center p-2">
                <div className="relative w-full max-w-xl aspect-[16/7] flex items-center justify-center">
                    <svg 
                        viewBox={`0 0 ${baseWidth} ${baseHeight}`}
                        preserveAspectRatio="xMidYMid meet"
                        className="w-full h-full block overflow-visible"
                    >
                        <defs>
                            <filter id="pathNodeShadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.12"/>
                            </filter>
                        </defs>

                        {/* Connection Lines */}
                        {layerCounts.map((count, lIdx) => {
                            if (lIdx === layerCounts.length - 1) return null;
                            const nextCount = layerCounts[lIdx + 1];

                            return Array.from({ length: count }).map((_, nIdx) => {
                                const start = getPos(lIdx, nIdx, count);

                                return Array.from({ length: nextCount }).map((__, nextNIdx) => {
                                    const end = getPos(lIdx + 1, nextNIdx, nextCount);
                                    const isBlocked = obstacles.some(o => 
                                        o.layer === lIdx && o.from === nIdx && o.to === nextNIdx
                                    );

                                    return (
                                        <g key={`path-${lIdx}-${nIdx}-${nextNIdx}`}>
                                            <line 
                                                x1={start.x} y1={start.y} 
                                                x2={end.x} y2={end.y}
                                                stroke={isBlocked ? "#fecdd3" : "#cbd5e1"} 
                                                strokeWidth={isBlocked ? "2" : "2.5"}
                                                strokeDasharray={isBlocked ? "5 3" : "0"}
                                                strokeLinecap="round"
                                            />
                                            {/* Blocked Barrier Icon */}
                                            {isBlocked && (
                                                <g transform={`translate(${(start.x + end.x) / 2}, ${(start.y + end.y) / 2})`}>
                                                    <circle r="11" fill="#ffffff" stroke="#f43f5e" strokeWidth="1.5" />
                                                    <circle r="8.5" fill="#f43f5e" />
                                                    <line x1="-4" y1="0" x2="4" y2="0" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                                                </g>
                                            )}
                                        </g>
                                    );
                                });
                            });
                        })}

                        {/* Node Dots & Start/End Badges */}
                        {layerCounts.map((count, lIdx) => (
                            Array.from({ length: count }).map((_, nIdx) => {
                                const { x, y } = getPos(lIdx, nIdx, count);
                                const isStart = lIdx === 0;
                                const isEnd = lIdx === layerCounts.length - 1;
                                
                                return (
                                    <g key={`node-${lIdx}-${nIdx}`}>
                                        <circle 
                                            cx={x} cy={y} 
                                            r={isStart || isEnd ? 12 : 6} 
                                            fill={isStart ? "#10b981" : isEnd ? "#6366f1" : "#ffffff"} 
                                            stroke={isStart || isEnd ? "#ffffff" : "#64748b"}
                                            strokeWidth={isStart || isEnd ? "2.5" : "2"}
                                            filter="url(#pathNodeShadow)"
                                        />
                                        {(isStart || isEnd) && (
                                            <text 
                                                x={x} 
                                                y={y - 18} 
                                                textAnchor="middle" 
                                                fontSize="12" 
                                                fontWeight="900" 
                                                className={`uppercase tracking-wider font-sans ${isStart ? 'fill-emerald-600' : 'fill-indigo-600'}`}
                                            >
                                                {isStart ? 'Start (A)' : 'Mål (B)'}
                                            </text>
                                        )}
                                    </g>
                                );
                            })
                        ))}
                    </svg>
                </div>
            </div>
        );
    }

    // =========================================================================
    // 2. STANDARD PROBABILITY TREE (2-Stage Sequential)
    // =========================================================================
    const baseWidth = 480;
    const baseHeight = 300;
    const nodeRadius = 5;
    const totalCount = (initialCounts?.[0] || 0) + (initialCounts?.[1] || 0);
    const centerX = baseWidth / 2;

    const root = { x: centerX, y: 30 };
    const s1 = [
        { x: centerX - 120, y: 130, label: groups?.[0] || 'A', count: initialCounts?.[0] || 0, total: totalCount },
        { x: centerX + 120, y: 130, label: groups?.[1] || 'B', count: initialCounts?.[1] || 0, total: totalCount }
    ];
    const s2 = [
        { x: centerX - 180, y: 250, parent: 0, label: groups?.[0] || 'A', c: (initialCounts?.[0] || 1) - 1, t: Math.max(1, totalCount - 1) },
        { x: centerX - 60,  y: 250, parent: 0, label: groups?.[1] || 'B', c: initialCounts?.[1] || 0,        t: Math.max(1, totalCount - 1) },
        { x: centerX + 60,  y: 250, parent: 1, label: groups?.[0] || 'A', c: initialCounts?.[0] || 0,        t: Math.max(1, totalCount - 1) },
        { x: centerX + 180, y: 250, parent: 1, label: groups?.[1] || 'B', c: (initialCounts?.[1] || 1) - 1, t: Math.max(1, totalCount - 1) }
    ];

    return (
        <div className="w-full flex items-center justify-center p-2">
            <div className="relative w-full max-w-lg aspect-[16/10] flex items-center justify-center">
                <svg 
                    viewBox={`0 0 ${baseWidth} ${baseHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-full block overflow-visible"
                >
                    <defs>
                        <filter id="treePillShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.08"/>
                        </filter>
                    </defs>

                    {/* Stage 1 Connections (Root -> Tier 1) */}
                    {s1.map((n, i) => (
                        <g key={`tree-l1-${i}`}>
                            <line 
                                x1={root.x} y1={root.y} 
                                x2={n.x} y2={n.y} 
                                stroke="#94a3b8" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                            />
                            {/* Branch Fraction Badge */}
                            {renderStackedFractionBadge(root.x, root.y, n.x, n.y, n.count, n.total, `s1_${i}`)}
                            {/* Tier 1 Label */}
                            <text 
                                x={n.x} 
                                y={n.y - 14} 
                                textAnchor="middle" 
                                fontSize="11" 
                                fontWeight="800" 
                                className="fill-slate-700 uppercase tracking-wider font-sans"
                            >
                                {n.label}
                            </text>
                        </g>
                    ))}

                    {/* Stage 2 Connections (Tier 1 -> Tier 2) */}
                    {s2.map((n, i) => {
                        const parentNode = s1[n.parent];
                        return (
                            <g key={`tree-l2-${i}`}>
                                <line 
                                    x1={parentNode.x} y1={parentNode.y} 
                                    x2={n.x} y2={n.y} 
                                    stroke="#cbd5e1" 
                                    strokeWidth="1.75" 
                                    strokeLinecap="round" 
                                />
                                {/* Branch Fraction Badge */}
                                {renderStackedFractionBadge(parentNode.x, parentNode.y, n.x, n.y, n.c, n.t, `s2_${i}`)}
                                {/* Tier 2 Leaf Label */}
                                <text 
                                    x={n.x} 
                                    y={n.y + 20} 
                                    textAnchor="middle" 
                                    fontSize="11" 
                                    fontWeight="700" 
                                    className="fill-slate-600 uppercase tracking-wide font-sans"
                                >
                                    {n.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* Nodes (Circles) */}
                    <circle cx={root.x} cy={root.y} r={nodeRadius + 1} fill="#475569" />
                    {s1.map((n, i) => (
                        <circle key={`node-l1-${i}`} cx={n.x} cy={n.y} r={nodeRadius} fill="#64748b" />
                    ))}
                    {s2.map((n, i) => (
                        <circle key={`node-l2-${i}`} cx={n.x} cy={n.y} r={nodeRadius - 1} fill="#94a3b8" />
                    ))}
                </svg>
            </div>
        </div>
    );
};

export default ProbabilityTree;