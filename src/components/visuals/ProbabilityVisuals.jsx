import React from 'react';

/**
 * ProbabilityMarbles - Refactored to be container-responsive.
 * Visualizes a "jar" of marbles for probability problems.
 */
export const ProbabilityMarbles = ({ data, width = "100%", height = "auto" }) => {
    if (!data?.items) return null;
    const { red, blue, green } = data.items;
    const colors = [];
    for(let i=0; i<red; i++) colors.push('#ef4444');
    for(let i=0; i<blue; i++) colors.push('#3b82f6');
    for(let i=0; i<green; i++) colors.push('#22c55e');
    
    const mixed = [];
    while(colors.length) {
        if (colors.length % 3 === 0) mixed.push(colors.pop()); 
        else mixed.unshift(colors.pop());
    }

    return (
        <div className="flex justify-center w-full p-2">
            <svg 
                width={width} 
                height={height} 
                viewBox="0 0 200 200" 
                preserveAspectRatio="xMidYMid meet"
                className="bg-slate-100 rounded-full border-4 border-slate-300 shadow-inner block overflow-visible"
            >
                {mixed.map((c, i) => {
                    const angle = i * 2.4; 
                    const dist = 15 + i * 4; 
                    const x = 100 + dist * Math.cos(angle);
                    const y = 100 + dist * Math.sin(angle);
                    return <circle key={i} cx={x} cy={y} r={12} fill={c} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />;
                })}
            </svg>
        </div>
    );
};

/**
 * ProbabilitySpinner - Refactored to be container-responsive.
 * Visualizes a randomized spinner with a pointer.
 */
export const ProbabilitySpinner = ({ data, width = "100%", height = "auto" }) => {
    if (!data?.sections) return null;
    const { sections } = data; 
    const radius = 80; const cx = 100; const cy = 100;
    const step = (2 * Math.PI) / sections;
    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899']; 
    const slices = [];

    for (let i = 0; i < sections; i++) {
        const startAngle = i * step - Math.PI/2; 
        const endAngle = (i + 1) * step - Math.PI/2;
        const x1 = cx + radius * Math.cos(startAngle); const y1 = cy + radius * Math.sin(startAngle);
        const x2 = cx + radius * Math.cos(endAngle); const y2 = cy + radius * Math.sin(endAngle);
        const largeArc = step > Math.PI ? 1 : 0;
        const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        slices.push(<path key={i} d={pathData} fill={colors[i % colors.length]} stroke="white" strokeWidth="2" />);
    }

    return (
        <div className="flex justify-center w-full p-2">
            <svg 
                width={width} 
                height={height} 
                viewBox="0 0 200 200"
                preserveAspectRatio="xMidYMid meet"
                className="block overflow-visible drop-shadow-md"
            >
                {slices}
                {/* Spinner Pointer */}
                <polygon points="100,20 90,40 110,40" fill="#1e293b" />
                <circle cx="100" cy="100" r="5" fill="#1e293b" />
            </svg>
        </div>
    );
};