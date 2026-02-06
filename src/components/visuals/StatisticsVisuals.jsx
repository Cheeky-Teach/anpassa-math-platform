import React from 'react';

export const FrequencyTable = ({ data }) => {
    const { headers, rows } = data;
    return (
        <div className="flex justify-center my-4 w-full">
            <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm bg-white min-w-[200px]">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs">
                        <tr>{headers.map((h, i) => <th key={i} className="px-4 py-2 border-b text-center">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, rI) => (
                            <tr key={rI} className="hover:bg-slate-50">
                                {row.map((cell, cI) => <td key={cI} className="px-4 py-2 text-center font-mono text-slate-600">{cell}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const PercentGrid = ({ data }) => {
    const { total = 100, colored = 0 } = data;
    const size = 300;
    const cellSize = size / 10;
    const cells = [];
    for (let i = 0; i < 100; i++) {
        const x = (i % 10) * cellSize;
        const y = Math.floor(i / 10) * cellSize;
        const isColored = i < colored;
        cells.push(<rect key={i} x={x} y={y} width={cellSize - 2} height={cellSize - 2} fill={isColored ? "#3b82f6" : "#f1f5f9"} stroke={isColored ? "#2563eb" : "#e2e8f0"} rx="4" />);
    }
    return <div className="flex justify-center my-4"><svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{cells}</svg></div>;
};