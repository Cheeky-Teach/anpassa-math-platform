import React from 'react';

/**
 * ProbabilityMarbles - Container-Responsive Refactor
 * Visualizes a "jar" of marbles that scales to its container.
 */
export const ProbabilityMarbles = ({ data }) => {
    if (!data?.items) return null;
    const { red = 0, blue = 0, green = 0 } = data.items;
    
    // Flatten marble counts into a single color array
    const colors = [];
    for(let i=0; i<red; i++) colors.push('#ef4444');
    for(let i=0; i<blue; i++) colors.push('#3b82f6');
    for(let i=0; i<green; i++) colors.push('#22c55e');
    
    // Stable "mixed" array to prevent jitter during re-renders
    const mixed = [...colors];

    return (
        <div className="w-full h-full flex items-center justify-center p-2 min-h-[140px]">
            {/* The wrapper ensures the jar remains a square and doesn't exceed a reasonable size */}
            <div className="relative w-full h-full max-w-[180px] max-h-[180px] sm:max-w-[200px] sm:max-h-[200px] aspect-square flex items-center justify-center">
                <svg 
                    viewBox="0 0 200 200" 
                    preserveAspectRatio="xMidYMid meet"
                    className="bg-slate-100 rounded-full border-4 border-slate-300 shadow-inner block overflow-visible w-full h-full"
                >
                    {mixed.map((c, i) => {
                        // Spiral distribution constrained to stay inside the jar (viewBox 200x200)
                        const angle = i * 2.3; 
                        const maxRadius = 75; // Keeps marbles away from the border
                        const dist = 12 + (i / mixed.length) * maxRadius; 
                        const x = 100 + dist * Math.cos(angle);
                        const y = 100 + dist * Math.sin(angle);
                        
                        return (
                            <circle 
                                key={i} 
                                cx={x} 
                                cy={y} 
                                r={11} 
                                fill={c} 
                                stroke="rgba(0,0,0,0.15)" 
                                strokeWidth="1.5" 
                                className="drop-shadow-sm transition-all"
                            />
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

/**
 * ProbabilitySpinner - Container-Responsive Refactor
 * Randomized spinner with numbers for clarity.
 */
export const ProbabilitySpinner = ({ data }) => {
    if (!data?.sections) return null;
    const sections = Math.max(1, Number(data.sections)); 
    const radius = 88; 
    const cx = 100; 
    const cy = 100;
    const step = (2 * Math.PI) / sections;
    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#06b6d4', '#f97316']; 
    const slices = [];

    for (let i = 0; i < sections; i++) {
        const startAngle = i * step - Math.PI/2; 
        const endAngle = (i + 1) * step - Math.PI/2;
        const x1 = cx + radius * Math.cos(startAngle); 
        const y1 = cy + radius * Math.sin(startAngle);
        const x2 = cx + radius * Math.cos(endAngle); 
        const y2 = cy + radius * Math.sin(endAngle);
        const largeArc = step > Math.PI ? 1 : 0;
        const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        
        slices.push(
            <path 
                key={i} 
                d={pathData} 
                fill={colors[i % colors.length]} 
                stroke="white" 
                strokeWidth="2.5" 
            />
        );

        // Add number labels to slices if the count is manageable
        if (sections <= 12) {
            const labelAngle = startAngle + step / 2;
            const lx = cx + (radius * 0.6) * Math.cos(labelAngle);
            const ly = cy + (radius * 0.6) * Math.sin(labelAngle);
            slices.push(
                <text 
                    key={`label-${i}`} 
                    x={lx} 
                    y={ly} 
                    fill="white" 
                    fontSize="18" 
                    fontWeight="900" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className="select-none pointer-events-none drop-shadow-md font-sans"
                >
                    {i + 1}
                </text>
            );
        }
    }

    return (
        <div className="w-full h-full flex items-center justify-center p-2 min-h-[140px]">
            <div className="relative w-full h-full max-w-[180px] max-h-[180px] sm:max-w-[210px] sm:max-h-[210px] aspect-square flex items-center justify-center">
                <svg 
                    viewBox="0 0 200 200"
                    preserveAspectRatio="xMidYMid meet"
                    className="block overflow-visible drop-shadow-xl w-full h-full"
                >
                    {/* Outer border rim */}
                    <circle cx="100" cy="100" r={radius + 3} fill="#cbd5e1" />
                    {slices}
                    {/* Pointer Needle */}
                    <path d="M 100 12 L 91 42 L 109 42 Z" fill="#0f172a" stroke="white" strokeWidth="1.5" />
                    <circle cx="100" cy="100" r="7" fill="#0f172a" stroke="white" strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
};