// src/components/whiteboard/tools/manipulatives/BaseTenBlocksTool.jsx
import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

const BASE_SIZE = 40;

export const BaseTenBlocksTool = {
    type: 'base_ten_block',
    hasOptions: true,

    createDefault: (id, color = '#0284c7', payload = {}) => {
        const dimensions = {
            ones: { w: BASE_SIZE, h: BASE_SIZE },
            tens: { w: BASE_SIZE, h: BASE_SIZE * 10 },
            hundreds: { w: BASE_SIZE * 10, h: BASE_SIZE * 10 }
        };

        const blockType = payload.blockType || 'ones';
        const dim = dimensions[blockType] || dimensions.ones;
        const isPos = blockType === 'ones' || blockType === 'tens' || blockType === 'hundreds';
        
        // Base origin based on type to keep them somewhat clustered
        const baseOrigin = { 
            x: blockType === 'ones' ? 520 : (blockType === 'tens' ? 640 : 760),
            y: 300 
        };

        let index = 0;
        if (Array.isArray(payload.existingElements)) {
            index = payload.existingElements.filter(el => el.type === 'base_ten_block').length;
        }

        const maxPerRow = 5;
        const col = index % maxPerRow;
        const row = Math.floor(index / maxPerRow);

        const gapX = 12;
        const gapY = 12;

        const computedX = baseOrigin.x + col * (dim.w + gapX);
        const computedY = baseOrigin.y + row * (dim.h + gapY);

        return {
            id,
            type: 'base_ten_block',
            blockType: blockType,
            x: Math.round(Number(payload.x ?? computedX)),
            y: Math.round(Number(payload.y ?? computedY)),
            width: dim.w,
            height: dim.h,
            pairedWithId: null,
            rotation: 0,
            opacity: 1
        };
    },

    // Snap to neighboring blocks of the same type!
    snapAlgorithm: (target, allElements, threshold = 100) => {
        let bestX = target.x;
        let bestY = target.y;
        let matchedPartnerId = null;
        let minDistance = threshold;

        const eligible = allElements.filter(el => 
            el.id !== target.id && 
            el.type === 'base_ten_block' && 
            el.blockType === target.blockType &&
            (!el.pairedWithId || el.pairedWithId === target.id)
        );

        for (const other of eligible) {
            const dist = Math.hypot(other.x - target.x, other.y - target.y);
            if (dist < minDistance) {
                minDistance = dist;
                // Snap to the side of the other block
                bestX = other.x + (target.blockType === 'tens' ? other.width : other.width);
                bestY = other.y + (target.blockType === 'hundreds' ? other.height : other.height);
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
        const toggleType = () => {
            const types = ['ones', 'tens', 'hundreds'];
            const nextIndex = (types.indexOf(el.blockType) + 1) % types.length;
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, blockType: types[nextIndex] } : o));
        };

        const annihilateZeroPair = () => {
            setElements(prev => prev.filter(o => o.id !== el.id && o.id !== el.pairedWithId));
        };

        return (
            <div className="flex items-center gap-2 font-sans select-none !text-slate-900" data-whiteboard-interactive="true">
                <button
                    type="button"
                    onClick={toggleType}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
                    title={lang === 'sv' ? "Byt blocktyp" : "Change Block Type"}
                >
                    <RefreshCw size={13} className="text-slate-600" />
                    <span>{el.blockType.toUpperCase()}</span>
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

        const r = BASE_SIZE;
        const cx = r;
        const cy = r;

        const dims = el.blockType === 'tens' ? { w: r, h: r * 10 } : 
                      el.blockType === 'hundreds' ? { w: r * 10, h: r * 10 } : 
                      { w: r, h: r };

        const fillColor = el.blockType === 'ones' ? '#0284c7' : 
                          el.blockType === 'tens' ? '#0284c7' : '#0284c7'; 
        // Actually, for base 10, colors are usually distinct, but let's keep it simple for now
        // or maybe use a color scale.
        
        const isCurrentSelected = isSelected || (options.selectedIds && options.selectedIds.includes(el.id));

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}, ${cx}, ${cy})`}
                className="select-none cursor-move pointer-events-auto"
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (setElements) {
                        setElements(prev => prev.map(item => item.id === el.id ? { ...item, blockType: (item.blockType === 'ones' ? 'tens' : item.blockType === 'tens' ? 'hundreds' : 'ones') } : item));
                    }
                }}
            >
                {/* 1. Tactile 3D Extrusion Drop Shadow */}
                <rect x={0} y={0} width={dims.w} height={dims.h} fill="#0f172a" fillOpacity="0.22" className="pointer-events-none" />

                {/* 2. Physical Acrylic Puck Body */}
                <rect 
                    x={0} 
                    y={0} 
                    width={dims.w} 
                    height={dims.h} 
                    fill={fillColor} 
                    stroke="#0369a1" 
                    strokeWidth="3.5" 
                    filter="drop-shadow(0 6px 14px rgba(0,0,0,0.18))"
                    className="transition-colors duration-200 pointer-events-auto"
                />

                {/* 3. Gloss Reflection Arc */}
                <path 
                    d={`M ${cx - dims.w * 0.65} ${cy - dims.h * 0.25} A ${dims.w * 0.72} ${dims.h * 0.68} 0 0 1 ${cx + dims.w * 0.65} ${cy - dims.h * 0.25}`} 
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
                    y={cy} 
                    textAnchor="middle" 
                    dominantBaseline="central" 
                    fontSize={dims.w > 100 ? "24" : "36"} 
                    fontWeight="900" 
                    fill="#ffffff" 
                    fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
                    className="pointer-events-none select-none drop-shadow-xs"
                >
                    {el.blockType === 'ones' ? '1' : el.blockType === 'tens' ? '10' : '100'}
                </text>

                {/* 5. Magnetic Zero-Pair Indicator Badge */}
                {el.pairedWithId && (
                    <g transform={`translate(${dims.w + 4}, ${-dims.h / 2})`} className="pointer-events-none select-none">
                        <rect x={0} y={0} width={42} height={24} rx={12} fill="#0f172a" stroke="#cbd5e1" strokeWidth={1.5} />
                        <text x={21} y={13} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="900" fill="#fbbf24">
                            = 0
                        </text>
                    </g>
                )}

                {/* 6. Standard Whiteboard Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, dims.w, { canRotate: false })}
                    </g>
                )}
            </g>
        );
    }
};

export default BaseTenBlocksTool;