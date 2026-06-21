import React from 'react';

/**
 * FrequencyTable - Refactored for fluid containers.
 * Optimized for high-density grids in both Digital Studio and Print formats.
 */
export const FrequencyTable = ({ data, width = "100%", height = "auto" }) => {
    if (!data?.headers || !data?.rows) return null;
    const { headers, rows } = data;
    
    // Adjust row padding based on data density to maintain professional look
    const isLargeTable = rows.length > 5;
    
    return (
        <div 
            className="flex justify-center items-center overflow-hidden p-1"
            style={{ width, height }}
        >
            <div className="border border-slate-200 rounded-md bg-white w-full overflow-hidden shadow-sm">
                <table className="w-full table-auto border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className="px-2 py-1.5 text-[9px] sm:text-xs font-black uppercase text-slate-500 text-center tracking-tighter">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {rows.map((row, rI) => (
                            <tr key={rI} className="bg-white">
                                {row.map((cell, cI) => (
                                    <td key={cI} className={`px-2 ${isLargeTable ? 'py-0.5' : 'py-1.5'} text-center font-mono font-bold text-slate-700 text-[10px] sm:text-sm whitespace-nowrap`}>
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Renders standard frequency data as a single-quadrant Bar Graph
export const BarGraph = ({ data, width = "100%", height = "auto" }) => {
    if (!data?.rows || !data?.headers) return null;
    const { headers, rows } = data; 

    // Internal SVG Canvas Dimensions
    const svgWidth = 400;
    const svgHeight = 280;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    // Determine scale dynamically
    const maxFreq = Math.max(...rows.map(r => r[1]), 5); 
    const barWidth = chartWidth / rows.length;

    return (
        <div className="flex justify-center items-center p-2 overflow-hidden w-full max-w-[400px] mx-auto bg-white rounded-xl border border-slate-200 shadow-sm">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width={width} height={height} className="overflow-visible">
                
                {/* 1. Y-Axis Grid Lines & Numbers */}
                {Array.from({length: maxFreq + 1}).map((_, i) => {
                    const y = margin.top + chartHeight - (i / maxFreq) * chartHeight;
                    return (
                        <g key={`grid-${i}`}>
                            <line x1={margin.left} y1={y} x2={margin.left + chartWidth} y2={y} stroke="#f1f5f9" strokeWidth="2" />
                            <text x={margin.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#64748b" className="font-sans font-bold">{i}</text>
                        </g>
                    );
                })}

                {/* 2. Main X/Y Axes */}
                <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + chartHeight} stroke="#94a3b8" strokeWidth="2" />
                <line x1={margin.left} y1={margin.top + chartHeight} x2={margin.left + chartWidth} y2={margin.top + chartHeight} stroke="#94a3b8" strokeWidth="2" />

                {/* 3. The Bars and X-Axis Labels */}
                {rows.map((row, i) => {
                    const [val, freq] = row;
                    const bHeight = (freq / maxFreq) * chartHeight;
                    const bW = barWidth * 0.6; // Bar thickness
                    const x = margin.left + (i * barWidth) + (barWidth / 2) - (bW / 2); 
                    const y = margin.top + chartHeight - bHeight;
                    
                    return (
                        <g key={`bar-${i}`}>
                            <rect x={x} y={y} width={bW} height={bHeight} fill="#3b82f6" rx="4" className="drop-shadow-sm" />
                            <text x={x + bW/2} y={margin.top + chartHeight + 20} textAnchor="middle" fontSize="14" fill="#475569" className="font-sans font-black">{val}</text>
                        </g>
                    );
                })}

                {/* 4. Axis Headers */}
                <text x={margin.left + chartWidth/2} y={svgHeight - 5} textAnchor="middle" fontSize="12" fill="#64748b" className="font-sans font-black uppercase tracking-widest">{headers[0]}</text>
                <text x={12} y={margin.top + chartHeight/2} transform={`rotate(-90, 12, ${margin.top + chartHeight/2})`} textAnchor="middle" fontSize="12" fill="#64748b" className="font-sans font-black uppercase tracking-widest">{headers[1]}</text>
            </svg>
        </div>
    );
};

/**
 * PercentGrid - Refactored for fluid containers.
 * Visualizes percentages on a 10x10 grid using internal coordinate math.
 */
export const PercentGrid = ({ data, width = "100%", height = "auto" }) => {
    if (!data) return null;
    const { colored = 0 } = data;
    
    // Internal coordinate system (Logic Layer)
    const internalSize = 100;
    const cellSize = internalSize / 10;
    const cells = [];

    for (let i = 0; i < 100; i++) {
        const x = (i % 10) * cellSize;
        const y = Math.floor(i / 10) * cellSize;
        const isColored = i < colored;

        cells.push(
            <rect 
                key={i} 
                x={x + 0.5} y={y + 0.5} 
                width={cellSize - 1} height={cellSize - 1} 
                fill={isColored ? "#3b82f6" : "#f1f5f9"} 
                stroke={isColored ? "#2563eb" : "#e2e8f0"} 
                strokeWidth="0.5"
                rx="1" 
            />
        );
    }

    return (
        <div className="flex justify-center items-center p-1 overflow-hidden" style={{ width, height }}>
            {/* viewBox preserves the 10x10 grid logic while 
                preserveAspectRatio ensures squares stay square on printouts.
            */}
            <svg 
                width="100%"
                height="100%"
                viewBox={`0 0 ${internalSize} ${internalSize}`} 
                className="aspect-square drop-shadow-sm block overflow-visible"
                preserveAspectRatio="xMidYMid meet"
            >
                {cells}
            </svg>
        </div>
    );
};