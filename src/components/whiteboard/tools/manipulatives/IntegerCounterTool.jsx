// src/components/whiteboard/tools/manipulatives/IntegerCounterTool.jsx
import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

const COUNTER_RADIUS = 32;
const ZERO_PAIR_PROXIMITY = 72;

export const IntegerCounterTool = {
    type: 'integer_counter',
    hasOptions: true,

    createDefault: (id, color = '#0284c7', payload = {}) => {
        const val = typeof payload === 'number' 
            ? payload 
            : (payload.value !== undefined ? Number(payload.value) : 1);
        const x = payload.x !== undefined ? Number(payload.x) : (680 + Math.random() * 60);
        const y = payload.y !== undefined ? Number(payload.y) : (340 + Math.random() * 60);

        return {
            id,
            type: 'integer_counter',
            value: val >= 0 ? 1 : -1,
            x: Math.round(x),
            y: Math.round(y),
            width: COUNTER_RADIUS * 2,
            height: COUNTER_RADIUS * 2,
            pairedWithId: null,
            rotation: 0,
            opacity: 1
        };
    },

    // Magnetic Zero-Pairing: Only snap to an UNPAIRED counter of the opposite sign!
    snapAlgorithm: (target, allElements, threshold = ZERO_PAIR_PROXIMITY) => {
        let bestX = target.x;
        let bestY = target.y;
        let matchedPartnerId = null;
        let minDistance = threshold;

        // Only pair with an opposite-value counter that is NOT already paired with someone else
        const eligibleOpposites = allElements.filter(el => 
            el.id !== target.id && 
            el.type === 'integer_counter' && 
            el.value !== target.value &&
            (!el.pairedWithId || el.pairedWithId === target.id)
        );

        for (const other of eligibleOpposites) {
            const dist = Math.hypot(other.x - target.x, other.y - target.y);
            if (dist < minDistance) {
                minDistance = dist;
                bestX = other.x;
                bestY = other.y + (target.value > 0 ? -COUNTER_RADIUS * 2 - 10 : COUNTER_RADIUS * 2 + 10);
                matchedPartnerId = other.id;
            }
        }

        return {
            x: bestX,
            y: bestY,
            pairedWithId: matchedPartnerId
        };
    },

    renderContextMenu: ({ el, setElements, lang = 'sv' }) => {
        const isPos = el.value > 0;

        const toggleSign = () => {
            setElements(prev => prev.map(o => {
                if (o.id !== el.id) return o;
                return { ...o, value: o.value * -1, pairedWithId: null };
            }));
        };

        const annihilateZeroPair = () => {
            setElements(prev => prev.filter(o => o.id !== el.id && o.id !== el.pairedWithId));
        };

        return (
            <div 
                className="flex items-center gap-2 font-sans select-none !text-slate-900" 
                data-whiteboard-interactive="true"
            >
                <button
                    type="button"
                    onClick={toggleSign}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
                    title={lang === 'sv' ? "Vänd bricka" : "Flip Counter"}
                >
                    <RefreshCw size={13} className="text-slate-600" />
                    <span>{isPos ? (lang === 'sv' ? "Vänd till (−1)" : "Flip to (−1)") : (lang === 'sv' ? "Vänd till (+1)" : "Flip to (+1)")}</span>
                </button>

                {el.pairedWithId && (
                    <button
                        type="button"
                        onClick={annihilateZeroPair}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                        title={lang === 'sv' ? "Nollpar tar ut varandra (0)" : "Neutralize Zero Pair (0)"}
                    >
                        <Sparkles size={13} />
                        <span>{lang === 'sv' ? "Ta bort nollpar (= 0)" : "Cancel pair (= 0)"}</span>
                    </button>
                )}
            </div>
        );
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { 
            isSelected = false,
            showUI = false, 
            renderHandles = null, 
            setElements = null,
            setSelectedId = null,
            setInteractionMode = null,
            setIsDrawing = null,
            setDragOffset = null,
            getCoordinates = null
        } = options;

        if (!el) return null;

        const isPos = (Number(el.value) || 1) > 0;
        const r = COUNTER_RADIUS;
        const cx = r;
        const cy = r;

        const fillColor = isPos ? '#0284c7' : '#ef4444';
        const borderColor = isPos ? '#0369a1' : '#b91c1c';
        const glyph = isPos ? '+' : '−';
        const isCurrentSelected = isSelected || (options.selectedIds && options.selectedIds.includes(el.id));

        const handleDoubleClick = (e) => {
            e.stopPropagation();
            if (setElements) {
                setElements(prev => prev.map(item => item.id === el.id ? { ...item, value: item.value * -1, pairedWithId: null } : item));
            }
        };

        

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}, ${r}, ${r})`}
                className="select-none cursor-move pointer-events-auto"
                onDoubleClick={handleDoubleClick}
            >
                {/* 1. Tactile 3D Extrusion Drop Shadow */}
                <circle cx={cx} cy={cy + 5} r={r} fill="#0f172a" fillOpacity="0.22" className="pointer-events-none" />

                {/* 2. Physical Acrylic Puck Body */}
                <circle 
                    cx={cx} 
                    cy={cy} 
                    r={r} 
                    fill={fillColor} 
                    stroke={borderColor} 
                    strokeWidth="3.5" 
                    filter="drop-shadow(0 6px 14px rgba(0,0,0,0.18))"
                    className="transition-colors duration-200 pointer-events-auto"
                />

                {/* 3. Gloss Reflection Arc */}
                <path 
                    d={`M ${cx - r * 0.65} ${cy - r * 0.25} A ${r * 0.72} ${r * 0.68} 0 0 1 ${cx + r * 0.65} ${cy - r * 0.25}`} 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    opacity="0.45" 
                    className="pointer-events-none"
                />

                {/* 4. Large Centered Sign Glyph */}
                <text 
                    x={cx} 
                    y={isPos ? cy + 1 : cy - 2} 
                    textAnchor="middle" 
                    dominantBaseline="central" 
                    fontSize={isPos ? "36" : "44"} 
                    fontWeight="900" 
                    fill="#ffffff" 
                    fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
                    className="pointer-events-none select-none drop-shadow-xs"
                >
                    {glyph}
                </text>

                {/* 5. Magnetic Zero-Pair Indicator Badge */}
                {el.pairedWithId && (
                    <g transform={`translate(${cx + r + 4}, ${cy - 12})`} className="pointer-events-none select-none">
                        <rect x={0} y={0} width={42} height={24} rx={12} fill="#0f172a" stroke="#cbd5e1" strokeWidth={1.5} />
                        <text x={21} y={13} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="900" fill="#fbbf24">
                            = 0
                        </text>
                    </g>
                )}

                {/* 6. Standard Whiteboard Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, r, { canRotate: false })}
                    </g>
                )}
            </g>
        );
    }
};

export default IntegerCounterTool;