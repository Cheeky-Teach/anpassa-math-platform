import React, { useMemo } from 'react';

/**
 * ProbabilityMarbles - Container-Responsive Refactor
 */
export const ProbabilityMarbles = ({ data }) => {
    if (!data?.items) return null;
    const { red = 0, blue = 0, green = 0, yellow = 0 } = data.items;
    
    const colors = [];
    for(let i=0; i<red; i++) colors.push('#ef4444');
    for(let i=0; i<blue; i++) colors.push('#3b82f6');
    for(let i=0; i<green; i++) colors.push('#22c55e');
    for(let i=0; i<yellow; i++) colors.push('#eab308');
    
    const mixed = [...colors];

    return (
        <div className="w-full h-full flex items-center justify-center p-2 min-h-[140px]">
            <div className="relative w-full h-full max-w-[180px] max-h-[180px] sm:max-w-[200px] sm:max-h-[200px] aspect-square flex items-center justify-center">
                <svg 
                    viewBox="0 0 200 200" 
                    preserveAspectRatio="xMidYMid meet"
                    className="bg-slate-50 rounded-full border-4 border-slate-300 shadow-inner block overflow-visible w-full h-full"
                >
                    {mixed.map((c, i) => {
                        const angle = i * 2.3; 
                        const maxRadius = 75; 
                        const dist = 12 + (i / Math.max(1, mixed.length)) * maxRadius; 
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
 * ProbabilitySpinner - Carnival Style Refactor
 * Fills rest of sections with random colors and shuffles them to spread target colors.
 */
export const ProbabilitySpinner = ({ data }) => {
    if (!data?.sections) return null;
    
    const sections = Math.max(1, Number(data.sections)); 
    const radius = 88; 
    const cx = 100; 
    const cy = 100;
    const step = (2 * Math.PI) / sections;

    // We use useMemo to ensure the shuffle remains stable and doesn't "jitter" on every re-render
    const colorSequence = useMemo(() => {
        const sequence = [];
        const targetColors = [
            { key: 'red', hex: '#ef4444' },
            { key: 'blue', hex: '#3b82f6' },
            { key: 'green', hex: '#22c55e' },
            { key: 'yellow', hex: '#eab308' }
        ];

        // 1. Add target colors from the generator
        targetColors.forEach(conf => {
            const count = data.counts?.[conf.key] || 0;
            for(let i = 0; i < count; i++) {
                if (sequence.length < sections) sequence.push(conf.hex);
            }
        });

        // 2. Fill remaining sections with vibrant random colors from a pool
        const fillerPool = [
            '#a855f7', '#ec4899', '#06b6d4', '#f97316', 
            '#8b5cf6', '#d946ef', '#10b981', '#f59e0b',
            '#6366f1', '#f43f5e', '#14b8a6', '#fbbf24'
        ];
        
        let fillerIdx = 0;
        while (sequence.length < sections) {
            sequence.push(fillerPool[fillerIdx % fillerPool.length]);
            fillerIdx++;
        }

        // 3. Shuffle the array to spread colors out (Fisher-Yates Shuffle)
        for (let i = sequence.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
        }
        
        return sequence;
    }, [data.counts, sections]); // Only re-calculate if counts or section number changes

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
                fill={colorSequence[i]} 
                stroke="white" 
                strokeWidth="1.5" 
            />
        );

        if (sections <= 16) {
            const labelAngle = startAngle + step / 2;
            const lx = cx + (radius * 0.7) * Math.cos(labelAngle);
            const ly = cy + (radius * 0.7) * Math.sin(labelAngle);
            slices.push(
                <text 
                    key={`label-${i}`} 
                    x={lx} 
                    y={ly} 
                    fill="white" 
                    fontSize="14" 
                    fontWeight="900" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className="select-none pointer-events-none drop-shadow-sm font-sans"
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
                    
                    <circle cx="100" cy="100" r={radius + 3} fill="#94a3b8" />
                    {slices}
                    <path d="M 100 12 L 91 42 L 109 42 Z" fill="#1e293b" stroke="white" strokeWidth="1.5" />
                    <circle cx="100" cy="100" r="7" fill="#1e293b" stroke="white" strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
};