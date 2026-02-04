import React from 'react';

/**
 * PatternVisual hanterar rendering av algebraiska mönster.
 * Den stöder tändstickor (stick-figures), prickar och sifferföljder.
 */
const PatternVisual = ({ data }) => {
    if (!data) return null;

    const { subtype, sequence, figures = [] } = data;

    // --- Rendera en enkel sifferföljd (Nivå 1-2) ---
    if (subtype === 'sequence') {
        return (
            <div className="flex flex-wrap justify-center gap-4 py-8">
                {sequence.map((num, i) => (
                    <div key={i} className="flex items-center">
                        <div className="w-12 h-12 flex items-center justify-center bg-white border-2 border-indigo-100 rounded-lg shadow-sm text-xl font-bold text-indigo-600 font-mono">
                            {num === '?' ? <span className="animate-pulse text-gray-400">?</span> : num}
                        </div>
                        {i < sequence.length - 1 && <span className="ml-4 text-gray-300">,</span>}
                    </div>
                ))}
            </div>
        );
    }

    // --- Rendera tändsticksmönster (Nivå 3-5) ---
    if (subtype === 'matchsticks') {
        return (
            <div className="flex flex-col items-center gap-6 w-full overflow-x-auto py-4">
                <div className="flex justify-center items-end gap-12 min-w-max px-4">
                    {figures.map((fig, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-4">
                            <svg 
                                width={fig.width || 100} 
                                height={fig.height || 100} 
                                viewBox={`0 0 ${fig.width || 100} ${fig.height || 100}`}
                            >
                                {fig.sticks.map((s, i) => (
                                    <line 
                                        key={i}
                                        x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                                        stroke="#f59e0b"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        className="drop-shadow-sm"
                                    />
                                ))}
                                {fig.sticks.map((s, i) => (
                                    <circle key={`head-${i}`} cx={s.x1} cy={s.y1} r="3" fill="#ef4444" />
                                ))}
                            </svg>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Figur {idx + 1}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
};

export default PatternVisual;