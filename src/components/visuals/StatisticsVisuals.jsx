import React from 'react';

export const FrequencyTable = ({ data }) => {
    const { headers, rows } = data;
    return (
        <div className="flex justify-center my-4 w-full px-2">
            {/* Added max-h and overflow-auto to prevent the table from pushing out the container height */}
            <div className="border border-slate-300 rounded-lg overflow-auto shadow-sm bg-white w-full max-w-md max-h-[300px]">
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

export const PercentGrid = ({ data }) => {
    const { colored = 0 } = data;
    
    // We use a constant coordinate system (100x100) inside the viewBox
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
        <div className="flex justify-center items-center p-4 w-full h-full min-h-[200px]">
            {/* Removing fixed width/height attributes from <svg>.
                Using 'aspect-square' and 'max-h-full' to ensure it stays 
                within the practiceView container boundaries.
            */}
            <svg 
                viewBox={`0 0 ${internalSize} ${internalSize}`} 
                className="w-full h-full max-w-[280px] max-h-full drop-shadow-sm"
                preserveAspectRatio="xMidYMid meet"
            >
                {cells}
            </svg>
        </div>
    );
};