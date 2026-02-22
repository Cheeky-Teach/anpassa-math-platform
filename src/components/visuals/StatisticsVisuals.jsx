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