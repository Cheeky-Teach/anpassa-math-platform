// src/components/whiteboard/tools/manipulatives/BaseTenBlocksTool.jsx
import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

const BASE_SIZE = 40;

const BLOCK_DIMS = {
    ones: { w: BASE_SIZE, h: BASE_SIZE },
    tens: { w: BASE_SIZE, h: BASE_SIZE * 10 },
    hundreds: { w: BASE_SIZE * 10, h: BASE_SIZE * 10 }
};

const BLOCK_COLORS = {
    ones: { fill: '#0284c7', stroke: '#0369a1' },      // Blue
    tens: { fill: '#ea580c', stroke: '#c2410c' },      // Orange
    hundreds: { fill: '#16a34a', stroke: '#15803d' }   // Green
};

export const BaseTenBlocksTool = {
    type: 'base_ten_block',
    hasOptions: true,

    createDefault: (id, color = '#0284c7', payload = {}) => {
        const blockType = payload.blockType || 'ones';
        const dim = BLOCK_DIMS[blockType] || BLOCK_DIMS.ones;
        
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

    // 1. Geometric Center of selected elements
    getGeometricCenter(selectedIds = [], elements = []) {
        const selected = elements.filter(el => selectedIds.includes(el.id));
        if (selected.length === 0) return null;

        const minX = Math.min(...selected.map(el => el.x));
        const maxX = Math.max(...selected.map(el => el.x + (Number(el.width) || BASE_SIZE)));
        const minY = Math.min(...selected.map(el => el.y));
        const maxY = Math.max(...selected.map(el => el.y + (Number(el.height) || BASE_SIZE)));

        return {
            x: Math.round((minX + maxX) / 2),
            y: Math.round((minY + maxY) / 2)
        };
    },

    // 2. Valid Merge Calculation
    getValidMerge(selectedIds = [], elements = []) {
        if (!Array.isArray(selectedIds) || selectedIds.length !== 10) return null;

        const selected = elements.filter(el => selectedIds.includes(el.id) && el.type === 'base_ten_block');
        if (selected.length !== 10) return null;

        const allOnes = selected.every(el => el.blockType === 'ones');
        const allTens = selected.every(el => el.blockType === 'tens');

        if (!allOnes && !allTens) return null;

        const targetType = allOnes ? 'tens' : 'hundreds';
        const targetDim = BLOCK_DIMS[targetType];
        const center = this.getGeometricCenter(selectedIds, elements);
        if (!center) return null;

        return {
            action: 'merge',
            targetType,
            removeIds: selected.map(el => el.id),
            newBlock: {
                id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                type: 'base_ten_block',
                blockType: targetType,
                x: Math.round(center.x - targetDim.w / 2),
                y: Math.round(center.y - targetDim.h / 2),
                width: targetDim.w,
                height: targetDim.h,
                pairedWithId: null,
                rotation: 0,
                opacity: 1
            }
        };
    },

    // 3. Valid Split Calculation (Grid/column layout centered on original block)
    getValidSplit(blockId, elements = []) {
        const block = elements.find(el => el.id === blockId && el.type === 'base_ten_block');
        if (!block || (block.blockType !== 'tens' && block.blockType !== 'hundreds')) {
            return null;
        }

        const targetType = block.blockType === 'hundreds' ? 'tens' : 'ones';
        const targetDim = BLOCK_DIMS[targetType];
        const newBlocks = [];
        const timestamp = Date.now();

        if (block.blockType === 'tens') {
            // Split 1 Ten into 10 Ones vertically aligned at original location
            for (let i = 0; i < 10; i++) {
                newBlocks.push({
                    id: `split_${timestamp}_${i}`,
                    type: 'base_ten_block',
                    blockType: 'ones',
                    x: Math.round(block.x),
                    y: Math.round(block.y + i * BASE_SIZE),
                    width: targetDim.w,
                    height: targetDim.h,
                    pairedWithId: null,
                    rotation: 0,
                    opacity: 1
                });
            }
        } else if (block.blockType === 'hundreds') {
            // Split 1 Hundred into 10 Tens arranged side-by-side
            for (let i = 0; i < 10; i++) {
                newBlocks.push({
                    id: `split_${timestamp}_${i}`,
                    type: 'base_ten_block',
                    blockType: 'tens',
                    x: Math.round(block.x + i * BASE_SIZE),
                    y: Math.round(block.y),
                    width: targetDim.w,
                    height: targetDim.h,
                    pairedWithId: null,
                    rotation: 0,
                    opacity: 1
                });
            }
        }

        return {
            action: 'split',
            targetType,
            removeIds: [block.id],
            newBlocks
        };
    },

    // Snap to neighboring blocks of the same type
    snapAlgorithm: (target, allElements, threshold = 60) => {
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
                bestX = other.x + other.width;
                bestY = other.y;
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
            const nextType = types[nextIndex];
            const nextDim = BLOCK_DIMS[nextType];
            setElements(prev => prev.map(o => o.id === el.id ? { 
                ...o, 
                blockType: nextType,
                width: nextDim.w,
                height: nextDim.h 
            } : o));
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
            selectedIds = [],
            elements = []
        } = options;

        if (!el) return null;

        const dims = BLOCK_DIMS[el.blockType] || BLOCK_DIMS.ones;
        const colors = BLOCK_COLORS[el.blockType] || BLOCK_COLORS.ones;
        const isCurrentSelected = isSelected || selectedIds.includes(el.id);

        // Compute merge validity for ghost preview
        const mergePlan = isCurrentSelected ? BaseTenBlocksTool.getValidMerge(selectedIds, elements) : null;
        const isPrimarySelected = isCurrentSelected && selectedIds[0] === el.id;

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}, ${dims.w / 2}, ${dims.h / 2})`}
                className="select-none cursor-move pointer-events-auto"
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (!setElements) return;
                    const types = ['ones', 'tens', 'hundreds'];
                    const nextType = types[(types.indexOf(el.blockType) + 1) % types.length];
                    const nextDim = BLOCK_DIMS[nextType];
                    setElements(prev => prev.map(item => item.id === el.id ? { 
                        ...item, 
                        blockType: nextType,
                        width: nextDim.w,
                        height: nextDim.h 
                    } : item));
                }}
            >
                {/* 1. 3D Extrusion Drop Shadow */}
                <rect 
                    x={0} 
                    y={4} 
                    width={dims.w} 
                    height={dims.h} 
                    fill="#0f172a" 
                    fillOpacity="0.2" 
                    rx={4}
                    className="pointer-events-none" 
                />

                {/* 2. Physical Puck Body */}
                <rect 
                    x={0} 
                    y={0} 
                    width={dims.w} 
                    height={dims.h} 
                    fill={colors.fill} 
                    stroke={colors.stroke} 
                    strokeWidth="3" 
                    rx={4}
                    filter="drop-shadow(0 4px 10px rgba(0,0,0,0.14))"
                    className="transition-colors duration-200 pointer-events-auto"
                />

                {/* 3. Gloss Reflection Strip */}
                <rect 
                    x={2} 
                    y={2} 
                    width={Math.max(4, dims.w - 4)} 
                    height={Math.max(4, Math.min(12, dims.h * 0.15))} 
                    fill="#ffffff" 
                    fillOpacity="0.35" 
                    rx={2}
                    className="pointer-events-none" 
                />

                {/* 4. Internal Segments (Tens: 10 vertical segments) */}
                {el.blockType === 'tens' && (
                    <g className="pointer-events-none">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <line 
                                key={i}
                                x1={0} 
                                y1={(i + 1) * BASE_SIZE} 
                                x2={dims.w} 
                                y2={(i + 1) * BASE_SIZE} 
                                stroke={colors.stroke} 
                                strokeWidth={2} 
                                opacity={0.8}
                            />
                        ))}
                    </g>
                )}

                {/* 4. Internal Segments (Hundreds: 10x10 Grid Array) */}
                {el.blockType === 'hundreds' && (
                    <g className="pointer-events-none">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <React.Fragment key={i}>
                                {/* Horizontal dividers */}
                                <line 
                                    x1={0} 
                                    y1={(i + 1) * BASE_SIZE} 
                                    x2={dims.w} 
                                    y2={(i + 1) * BASE_SIZE} 
                                    stroke={colors.stroke} 
                                    strokeWidth={2} 
                                    opacity={0.8}
                                />
                                {/* Vertical dividers */}
                                <line 
                                    x1={(i + 1) * BASE_SIZE} 
                                    y1={0} 
                                    x2={(i + 1) * BASE_SIZE} 
                                    y2={dims.h} 
                                    stroke={colors.stroke} 
                                    strokeWidth={2} 
                                    opacity={0.8}
                                />
                            </React.Fragment>
                        ))}
                    </g>
                )}

                {/* 5. Ghost Preview (Rendered once by the primary selection item) */}
                {isPrimarySelected && mergePlan && (() => {
                    const targetDims = BLOCK_DIMS[mergePlan.targetType];
                    const targetColors = BLOCK_COLORS[mergePlan.targetType];
                    const ghostRelX = mergePlan.newBlock.x - el.x;
                    const ghostRelY = mergePlan.newBlock.y - el.y;

                    return (
                        <g 
                            transform={`translate(${ghostRelX}, ${ghostRelY})`} 
                            className="pointer-events-none animate-pulse"
                        >
                            <rect 
                                x={0} 
                                y={0} 
                                width={targetDims.w} 
                                height={targetDims.h} 
                                fill={targetColors.fill} 
                                fillOpacity={0.22} 
                                stroke={targetColors.stroke} 
                                strokeWidth={2.5} 
                                strokeDasharray="6 4"
                                rx={6}
                            />
                        </g>
                    );
                })()}

                {/* 6. Magnetic Zero-Pair Indicator Badge */}
                {el.pairedWithId && (
                    <g transform={`translate(${dims.w + 4}, 0)`} className="pointer-events-none select-none">
                        <rect x={0} y={0} width={42} height={24} rx={12} fill="#0f172a" stroke="#cbd5e1" strokeWidth={1.5} />
                        <text x={21} y={13} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="900" fill="#fbbf24">
                            = 0
                        </text>
                    </g>
                )}

                {/* 7. Standard Whiteboard Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, dims.w / 2, { canRotate: false })}
                    </g>
                )}
            </g>
        );
    }
};

export default BaseTenBlocksTool;