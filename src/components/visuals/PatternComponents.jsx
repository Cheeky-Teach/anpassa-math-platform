import React from 'react';

/**
 * PatternVisual handles rendering of algebraic patterns.
 * Scales matchstick figures proportionally to maintain uniform stick size
 * while guaranteeing the full set fits within the parent card container.
 */
const PatternVisual = ({ data }) => {
    if (!data) return null;

    const { subtype, sequence, figures = [] } = data;

    // --- MODE: SEQUENCE (Levels 1-2) ---
    if (subtype === 'sequence') {
        return (
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 py-3 w-full">
                {sequence.map((num, i) => (
                    <div key={i} className="flex items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border-2 border-indigo-100 rounded-lg shadow-xs text-base sm:text-xl font-bold text-indigo-600 font-mono">
                            {num === '?' ? <span className="animate-pulse text-gray-400">?</span> : num}
                        </div>
                        {i < sequence.length - 1 && <span className="ml-2 sm:ml-4 text-gray-300 font-bold">,</span>}
                    </div>
                ))}
            </div>
        );
    }

    // --- MODE: MATCHSTICKS (Levels 3-5) ---
    if (subtype === 'matchsticks' && figures.length > 0) {
        // Calculate the total combined coordinate width across all figures
        const totalCoordinateWidth = figures.reduce((acc, f) => acc + (f.width || 100), 0);

        return (
            <div className="w-full max-w-xl mx-auto flex flex-col items-center py-2 px-1">
                {/* Responsive row with tight auto-scaling gaps */}
                <div className="flex justify-center items-end gap-3 sm:gap-6 w-full">
                    {figures.map((fig, idx) => {
                        const figW = fig.width || 100;
                        const figH = fig.height || 100;

                        // Percentage of total available width that this figure deserves
                        const flexShare = ((figW / totalCoordinateWidth) * 100).toFixed(2);

                        return (
                            <div 
                                key={idx} 
                                style={{ 
                                    // Bounded share: distributes width proportionally so total = 100%
                                    flex: `${figW} 1 0%`,
                                    maxWidth: `${figW}px`
                                }}
                                className="min-w-0 flex flex-col items-center gap-2"
                            >
                                <div className="w-full flex items-center justify-center max-h-[140px] sm:max-h-[170px]">
                                    <svg 
                                        viewBox={`0 0 ${figW} ${figH}`}
                                        preserveAspectRatio="xMidYMid meet"
                                        className="w-full h-auto max-h-[140px] sm:max-h-[170px] block overflow-visible drop-shadow-xs"
                                    >
                                        {/* Sticks */}
                                        {fig.sticks.map((s, i) => (
                                            <line 
                                                key={i}
                                                x1={s.x1} 
                                                y1={s.y1} 
                                                x2={s.x2} 
                                                y2={s.y2}
                                                stroke="#f59e0b"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                            />
                                        ))}
                                        {/* Match heads */}
                                        {fig.sticks.map((s, i) => (
                                            <circle 
                                                key={`head-${i}`} 
                                                cx={s.x1} 
                                                cy={s.y1} 
                                                r="3.5" 
                                                fill="#ef4444" 
                                            />
                                        ))}
                                    </svg>
                                </div>

                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                    Figur {idx + 1}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return null;
};

export default PatternVisual;