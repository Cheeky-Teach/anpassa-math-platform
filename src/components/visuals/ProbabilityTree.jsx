import React from 'react';

/**
 * ProbabilityTree handles the rendering of:
 * 1. Standard Probability Trees (Top-down)
 * 2. Combinatorial Pathways (A -> B)
 * Refactored to be container-responsive.
 */
const ProbabilityTree = ({ data }) => {
    if (!data) return null;

    const { subtype, layers, groups, initialCounts, targetBranch, obstacles = [] } = data;

    // Helper for probability labels (Fractions/x)
    const renderProbLabel = (x1, y1, x2, y2, num, den, bId) => {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const isT = targetBranch === bId;
        return (
            <g key={bId}>
                <rect 
                    x={mx - 20} 
                    y={my - 14} 
                    width="40" 
                    height="28" 
                    fill="white" 
                    stroke={isT ? "#6366f1" : "#e2e8f0"} 
                    strokeWidth={isT ? "2" : "1"} 
                    rx="4" 
                />
                <text 
                    x={mx} 
                    y={my + 5} 
                    textAnchor="middle" 
                    fontSize="12" 
                    fontWeight="800"
                    className={`${isT ? 'fill-indigo-600 animate-pulse' : 'fill-slate-600'}`}
                >
                    {isT ? 'x' : `${num}/${den}`}
                </text>
            </g>
        );
    };

    // --- MODE: PATHWAYS (Combinatorics A -> B) ---
    if (subtype === 'pathway') {
        const baseWidth = 400;
        const baseHeight = 220;
        const padding = 50;
        
        const layerCounts = layers || [1, 2, 3, 1];
        const stepX = (baseWidth - padding * 2) / (layerCounts.length - 1);

        const getPos = (lIdx, nIdx, count) => {
            const x = padding + lIdx * stepX;
            const layerHeight = 140;
            const startY = (baseHeight - layerHeight) / 2;
            const spacing = layerHeight / (count > 1 ? count - 1 : 1);
            const y = count === 1 ? baseHeight / 2 : startY + nIdx * spacing;
            return { x, y };
        };

        return (
            <div className="w-full h-full flex items-center justify-center p-2 min-h-[140px]">
                <div className="relative w-full h-full max-w-[320px] max-h-[180px] flex items-center justify-center">
                    <svg 
                        viewBox={`0 0 ${baseWidth} ${baseHeight}`}
                        preserveAspectRatio="xMidYMid meet"
                        className="block overflow-visible drop-shadow-sm w-full h-full"
                    >
                        <defs>
                            <filter id="nodeShadow">
                                <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1"/>
                            </filter>
                        </defs>

                        {/* Paths */}
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
                                                x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                                                stroke={isBlocked ? "#fee2e2" : "#cbd5e1"} 
                                                strokeWidth={isBlocked ? "1.5" : "2.5"}
                                                strokeDasharray={isBlocked ? "4 2" : "0"}
                                                strokeLinecap="round"
                                            />
                                            {isBlocked && (
                                                <g transform={`translate(${(start.x + end.x)/2}, ${(start.y + end.y)/2})`}>
                                                    <circle r="9" fill="white" stroke="#ef4444" strokeWidth="1" />
                                                    <circle r="7" fill="#ef4444" />
                                                    <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                                </g>
                                            )}
                                        </g>
                                    );
                                });
                            });
                        })}

                        {/* Nodes */}
                        {layerCounts.map((count, lIdx) => (
                            Array.from({ length: count }).map((_, nIdx) => {
                                const { x, y } = getPos(lIdx, nIdx, count);
                                const isStart = lIdx === 0;
                                const isEnd = lIdx === layerCounts.length - 1;
                                
                                return (
                                    <g key={`n-${lIdx}-${nIdx}`}>
                                        <circle 
                                            cx={x} cy={y} r={isStart || isEnd ? 9 : 5} 
                                            fill={isStart || isEnd ? "#6366f1" : "white"} 
                                            stroke={isStart || isEnd ? "none" : "#94a3b8"}
                                            strokeWidth="2"
                                            filter="url(#nodeShadow)"
                                        />
                                        {(isStart || isEnd) && (
                                            <text x={x} y={y - 18} textAnchor="middle" fontSize="12" fontWeight="900" className="fill-indigo-600 uppercase tracking-tighter">
                                                {isStart ? 'A' : 'B'}
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

    // --- MODE: STANDARD TREE (Probability) ---
    const baseWidth = 400;
    const baseHeight = 320;
    const nodeRadius = 6;
    const total = initialCounts[0] + initialCounts[1];
    const centerX = baseWidth / 2;

    const root = { x: centerX, y: 40 };
    const s1 = [
        { x: centerX - 100, y: 140, label: groups[0], count: initialCounts[0], total: total },
        { x: centerX + 100, y: 140, label: groups[1], count: initialCounts[1], total: total }
    ];
    const s2 = [
        { x: centerX - 145, y: 270, parent: 0, label: groups[0], c: initialCounts[0] - 1, t: total - 1 },
        { x: centerX - 55, y: 270, parent: 0, label: groups[1], c: initialCounts[1], t: total - 1 },
        { x: centerX + 55, y: 270, parent: 1, label: groups[0], c: initialCounts[0], t: total - 1 },
        { x: centerX + 145, y: 270, parent: 1, label: groups[1], c: initialCounts[1] - 1, t: total - 1 }
    ];

    return (
        <div className="w-full h-full flex items-center justify-center p-2 min-h-[140px]">
            <div className="relative w-full h-full max-w-[300px] max-h-[220px] flex items-center justify-center">
                <svg 
                    viewBox={`0 0 ${baseWidth} ${baseHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="block overflow-visible drop-shadow-sm w-full h-full"
                >
                    {/* Level 1 Connections */}
                    {s1.map((n, i) => (
                        <g key={`l1-${i}`}>
                            <line x1={root.x} y1={root.y} x2={n.x} y2={n.y} stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                            <text x={n.x} y={n.y - 18} textAnchor="middle" fontSize="10" fontWeight="900" className="fill-slate-400 uppercase tracking-widest">{n.label}</text>
                            {renderProbLabel(root.x, root.y, n.x, n.y, n.count, n.total, `s1_${i}`)}
                        </g>
                    ))}
                    {/* Level 2 Connections */}
                    {s2.map((n, i) => {
                        const p = s1[n.parent];
                        return (
                            <g key={`l2-${i}`}>
                                <line x1={p.x} y1={p.y} x2={n.x} y2={n.y} stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                                <text x={n.x} y={n.y + 22} textAnchor="middle" fontSize="10" fontWeight="700" className="fill-slate-400 uppercase tracking-wide">{n.label}</text>
                                {renderProbLabel(p.x, p.y, n.x, n.y, n.c, n.t, `s2_${i}`)}
                            </g>
                        );
                    })}
                    {/* Nodes */}
                    <circle cx={root.x} cy={root.y} r={nodeRadius} fill="#cbd5e1" />
                    {s1.map((n, i) => <circle key={`cn1-${i}`} cx={n.x} cy={n.y} r={nodeRadius} fill="#94a3b8" />)}
                    {s2.map((n, i) => <circle key={`cn2-${i}`} cx={n.x} cy={n.y} r={nodeRadius} fill="#94a3b8" />)}
                </svg>
            </div>
        </div>
    );
};

export default ProbabilityTree;