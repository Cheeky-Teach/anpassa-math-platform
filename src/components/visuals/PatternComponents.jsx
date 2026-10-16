import React from 'react';

/**
 * PatternVisual handles rendering of algebraic patterns.
 * Refactored to scale matchstick figures proportionally so individual
 * matchsticks maintain a consistent visual size as patterns grow.
 */
const PatternVisual = ({ data }) => {
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
        // Find the widest figure's coordinate width to calculate relative proportions
        const maxFigWidth = Math.max(...figures.map(f => f.width || 100), 100);

        return (
            <div className="w-full flex flex-col items-center gap-4 py-2">
                <div className="flex justify-center items-end gap-6 sm:gap-10 w-full px-2 max-w-4xl mx-auto">
                    {figures.map((fig, idx) => {
                        const figW = fig.width || 100;
                        const figH = fig.height || 100;

                        // Percentage of space this figure occupies relative to the largest one
                        const widthRatio = (figW / maxFigWidth) * 100;

                        return (
                            <div 
                                key={idx} 
                                style={{ 
                                    // Sized proportionally to width, with minimum floor so Figur 1 doesn't vanish
                                    width: `${Math.max(widthRatio, 20)}%`,
                                    maxWidth: `${figW * 1.5}px` 
                                }}
                                className="flex flex-col items-center gap-3 shrink-0"
                            >
                                <svg 
                                    viewBox={`0 0 ${figW} ${figH}`}
                                    preserveAspectRatio="xMidYMid meet"
                                    className="w-full h-auto block overflow-visible drop-shadow-sm"
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