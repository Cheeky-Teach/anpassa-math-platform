import React from 'react';

/**
 * PatternVisual handles rendering of algebraic patterns.
 * Refactored to be container-responsive for high-density print and studio layouts.
 */
const PatternVisual = ({ data, width = "100%", height = "auto" }) => {
    if (!data) return null;

    const { subtype, sequence, figures = [] } = data;

    // --- MODE: SEQUENCE (Levels 1-2) ---
    if (subtype === 'sequence') {
        return (
            <div className="flex flex-wrap justify-center gap-4 py-4 w-full">
                {sequence.map((num, i) => (
                    <div key={i} className="flex items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border-2 border-indigo-100 rounded-lg shadow-sm text-lg sm:text-xl font-bold text-indigo-600 font-mono">
                            {num === '?' ? <span className="animate-pulse text-gray-400">?</span> : num}
                        </div>
                        {i < sequence.length - 1 && <span className="ml-4 text-gray-300">,</span>}
                    </div>
                ))}
            </div>
        );
    }

    // --- MODE: MATCHSTICKS (Levels 3-5) ---
    if (subtype === 'matchsticks') {
        return (
            <div className="w-full flex flex-col items-center gap-4 py-2">
                <div className="flex justify-center items-end gap-6 sm:gap-12 w-full px-2">
                    {figures.map((fig, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-3 flex-1 min-w-0 max-w-[200px]">
                            {/* Refactored SVG: 
                                - Uses responsive width/height props.
                                - Uses viewBox to keep coordinate math intact.
                                - preserveAspectRatio prevents distortion in tight grids.
                            */}
                            <svg 
                                width={width} 
                                height={height} 
                                viewBox={`0 0 ${fig.width || 100} ${fig.height || 100}`}
                                preserveAspectRatio="xMidYMid meet"
                                className="block overflow-visible drop-shadow-sm"
                            >
                                {fig.sticks.map((s, i) => (
                                    <line 
                                        key={i}
                                        x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                                        stroke="#f59e0b"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />
                                ))}
                                {fig.sticks.map((s, i) => (
                                    <circle key={`head-${i}`} cx={s.x1} cy={s.y1} r="3" fill="#ef4444" />
                                ))}
                            </svg>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
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