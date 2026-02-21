import React from 'react';

/**
 * FrequencyTable - High Density Refactor
 * Optimized for grid-based projections where vertical space is scarce.
 */
export const FrequencyTable = ({ data }) => {
    const { headers, rows } = data;
    
    // Calculate size based on number of rows to remain legible but compact
    const isLargeTable = rows.length > 5;
    
    return (
        <div className="flex justify-center items-center w-full h-full max-h-full overflow-hidden p-1">
            <div className="border border-slate-200 rounded-md bg-white w-full overflow-hidden shadow-sm">
                <table className="w-full table-auto border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className="px-2 py-1 text-[10px] sm:text-xs font-black uppercase text-slate-500 text-center tracking-tighter">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {rows.map((row, rI) => (
                            <tr key={rI} className="bg-white">
                                {row.map((cell, cI) => (
                                    <td key={cI} className={`px-2 ${isLargeTable ? 'py-0.5' : 'py-1'} text-center font-mono font-bold text-slate-700 text-[11px] sm:text-sm`}>
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

export const PercentGrid = ({ data }) => {
    const { colored = 0 } = data;
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
        <div className="flex justify-center items-center w-full h-full p-1 overflow-hidden">
            <svg 
                viewBox={`0 0 ${internalSize} ${internalSize}`} 
                className="max-w-full max-h-full aspect-square drop-shadow-sm"
                preserveAspectRatio="xMidYMid meet"
            >
                {cells}
            </svg>
        </div>
    );
};