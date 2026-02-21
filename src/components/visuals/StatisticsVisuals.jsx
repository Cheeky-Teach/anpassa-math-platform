import React from 'react';

/**
 * FrequencyTable refactored to remove fixed height/width.
 * It will now expand to fill its container's width and height.
 */
export const FrequencyTable = ({ data }) => {
    const { headers, rows } = data;
    return (
        <div className="flex justify-center w-full h-full p-2">
            {/* Removed 'max-w-md' and 'max-h-[300px]'. 
                'w-full' and 'h-full' now allow the table to scale to the parent.
            */}
            <div className="border border-slate-300 rounded-lg overflow-auto shadow-sm bg-white w-full h-full">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs sticky top-0">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className="px-4 py-3 border-b text-center">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, rI) => (
                            <tr key={rI} className="hover:bg-slate-50 transition-colors">
                                {row.map((cell, cI) => (
                                    <td key={cI} className="px-4 py-2 text-center font-mono text-slate-600">
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
 * PercentGrid refactored to be truly fluid.
 * The SVG uses viewBox to maintain internal proportions while scaling.
 */
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
                x={x + 0.5} 
                y={y + 0.5} 
                width={cellSize - 1} 
                height={cellSize - 1} 
                fill={isColored ? "#3b82f6" : "#f1f5f9"} 
                stroke={isColored ? "#2563eb" : "#e2e8f0"} 
                strokeWidth="0.5"
                rx="1.5" 
            />
        );
    }

    return (
        <div className="flex justify-center items-center w-full h-full p-2">
            {/* Removed 'min-h-[200px]' and 'max-w-[280px]'.
                Added 'max-h-full' to ensure it doesn't overflow vertically.
                'preserveAspectRatio' ensures the 10x10 grid stays square.
            */}
            <svg 
                viewBox={`0 0 ${internalSize} ${internalSize}`} 
                className="w-full h-full max-h-full aspect-square drop-shadow-sm"
                preserveAspectRatio="xMidYMid meet"
            >
                {cells}
            </svg>
        </div>
    );
};