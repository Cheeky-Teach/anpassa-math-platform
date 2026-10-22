// src/components/whiteboard/tools/geometry/BasicShapesTool.jsx
import React from 'react';
import { 
    GripHorizontal, 
    Hash, 
    Ruler, 
    Plus, 
    Minus 
} from 'lucide-react';

const POLYGON_NAMES = {
    3: { sv: 'Triangel', en: 'Triangle' },
    4: { sv: 'Fyrhörning', en: 'Quadrilateral' },
    5: { sv: 'Pentagon (5)', en: 'Pentagon (5)' },
    6: { sv: 'Hexagon (6)', en: 'Hexagon (6)' },
    7: { sv: 'Heptagon (7)', en: 'Heptagon (7)' },
    8: { sv: 'Oktagon (8)', en: 'Octagon (8)' },
    9: { sv: 'Nonagon (9)', en: 'Nonagon (9)' },
    10: { sv: 'Dekagon (10)', en: 'Decagon (10)' }
};

const getRegularPolygonPoints = (sides, w, h) => {
    const rx = w / 2;
    const ry = h / 2;
    const cx = rx;
    const cy = ry;
    const points = [];
    const angleStep = (2 * Math.PI) / sides;
    const startAngle = -Math.PI / 2;

    for (let i = 0; i < sides; i++) {
        const a = startAngle + i * angleStep;
        points.push({
            x: cx + (rx - 12) * Math.cos(a),
            y: cy + (ry - 12) * Math.sin(a)
        });
    }
    return points;
};

const getInteriorAngleDeg = (A, B, C) => {
    const v1 = { x: A.x - B.x, y: A.y - B.y };
    const v2 = { x: C.x - B.x, y: C.y - B.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const cross = v1.x * v2.y - v1.y * v2.x;
    const mag1 = Math.hypot(v1.x, v1.y);
    const mag2 = Math.hypot(v2.x, v2.y);
    if (mag1 === 0 || mag2 === 0) return 0;
    
    let rad = Math.atan2(Math.abs(cross), dot);
    return Math.round((rad * 180) / Math.PI);
};

export const BasicShapesTool = {
    type: 'basic_shapes',
    hasOptions: true,

    createDefault: (id, color = '#0f172a', shapeType = 'polygon') => ({
        id,
        type: shapeType,
        x: 550,
        y: 240,
        width: 340,
        height: 300,
        polygonSides: 5,
        triangleType: 'right',
        showAngles: false,
        angleMode: 'degrees',
        showSideLengths: false,
        sideLabels: {},
        stroke: color,
        strokeWidth: 3.5,
        fill: '#ffffff',
        fillOpacity: 0.1,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv', t }) => {
        const isPoly = el.type === 'polygon';
        const isTri = el.type === 'triangle';
        const sides = Number(el.polygonSides) || 5;

        const updateSides = (delta) => {
            const next = Math.max(3, Math.min(10, sides + delta));
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, polygonSides: next, sideLabels: {} } : o));
        };

        const toggleAngles = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, showAngles: !o.showAngles } : o));
        };

        const toggleAngleMode = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { 
                ...o, 
                angleMode: o.angleMode === 'degrees' ? 'unknown' : 'degrees' 
            } : o));
        };

        const toggleSideLengths = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, showSideLengths: !o.showSideLengths } : o));
        };

        return (
            <div 
                className="flex items-center gap-2.5 font-sans font-bold text-sm select-none !text-slate-900" 
                style={{ color: '#0f172a' }}
            >
                {/* 1. Polygon Sides Stepper */}
                {isPoly && (
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        <button
                            type="button"
                            onClick={() => updateSides(-1)}
                            disabled={sides <= 3}
                            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                            title={lang === 'sv' ? "Färre sidor" : "Fewer sides"}
                        >
                            <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="text-xs font-black px-2 min-w-[95px] text-center text-slate-800">
                            {POLYGON_NAMES[sides]?.[lang === 'sv' ? 'sv' : 'en'] || `${sides} sidor`}
                        </span>
                        <button
                            type="button"
                            onClick={() => updateSides(1)}
                            disabled={sides >= 10}
                            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95"
                            title={lang === 'sv' ? "Fler sidor" : "More sides"}
                        >
                            <Plus size={14} strokeWidth={3} />
                        </button>
                    </div>
                )}

                {/* 2. Triangle Presets */}
                {isTri && (
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        {[
                            { id: 'right', label: lang === 'sv' ? 'Rätvinklig' : 'Right' },
                            { id: 'isosceles', label: lang === 'sv' ? 'Likbent' : 'Isosceles' },
                            { id: 'equilateral', label: lang === 'sv' ? 'Liksidig' : 'Equilateral' },
                            { id: 'scalene', label: lang === 'sv' ? 'Oliksidig' : 'Scalene' }
                        ].map(m => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, triangleType: m.id, sideLabels: {} } : o))}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                    el.triangleType === m.id
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-white hover:bg-slate-200 text-slate-700'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="w-px h-6 bg-slate-200 mx-0.5" />

                {/* 3. Toggle Angle Arcs */}
                {el.type !== 'circle' && (
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={toggleAngles}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                                el.showAngles
                                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <Hash size={15} />
                            <span>{lang === 'sv' ? "Vinklar" : "Angles"}</span>
                        </button>

                        {el.showAngles && (
                            <button
                                type="button"
                                onClick={toggleAngleMode}
                                className={`px-3 py-2 rounded-2xl border text-xs font-black uppercase transition-all cursor-pointer shadow-xs active:scale-95 ${
                                    el.angleMode === 'unknown'
                                        ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                }`}
                                title={lang === 'sv' ? "Växla grader / variabel 'x'" : "Toggle degrees / variable 'x'"}
                            >
                                <span>{el.angleMode === 'unknown' ? 'x' : 'θ°'}</span>
                            </button>
                        )}
                    </div>
                )}

                {/* 4. Toggle Side Length Labels */}
                {el.type !== 'circle' && (
                    <button
                        type="button"
                        onClick={toggleSideLengths}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                            el.showSideLengths
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                        title={lang === 'sv' ? "Visa mått och längder på sidorna" : "Show side lengths"}
                    >
                        <Ruler size={15} />
                        <span>{lang === 'sv' ? "Sidmått" : "Sides"}</span>
                    </button>
                )}
            </div>
        );
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { 
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

        const w = Number(el.width) || 340;
        const h = Number(el.height) || 300;
        const strokeW = el.strokeWidth || 3.5;
        const strokeColor = el.stroke || '#0f172a';

        let vertices = [];

        if (el.type === 'triangle') {
            if (el.triangleType === 'right') {
                vertices = [
                    { x: 16, y: 16 },
                    { x: 16, y: h - 16 },
                    { x: w - 16, y: h - 16 }
                ];
            } else if (el.triangleType === 'isosceles') {
                vertices = [
                    { x: w / 2, y: 16 },
                    { x: 16, y: h - 16 },
                    { x: w - 16, y: h - 16 }
                ];
            } else if (el.triangleType === 'equilateral') {
                const side = Math.min(w - 32, (h - 32) / (Math.sqrt(3) / 2));
                const triH = side * (Math.sqrt(3) / 2);
                const startY = (h - triH) / 2;
                vertices = [
                    { x: w / 2, y: startY },
                    { x: (w - side) / 2, y: startY + triH },
                    { x: (w + side) / 2, y: startY + triH }
                ];
            } else {
                vertices = [
                    { x: w * 0.35, y: 16 },
                    { x: 16, y: h - 16 },
                    { x: w - 16, y: h * 0.82 }
                ];
            }
        } else if (el.type === 'rect') {
            vertices = [
                { x: 16, y: 16 },
                { x: w - 16, y: 16 },
                { x: w - 16, y: h - 16 },
                { x: 16, y: h - 16 }
            ];
        } else if (el.type === 'polygon') {
            vertices = getRegularPolygonPoints(Number(el.polygonSides) || 5, w, h);
        }

        const handleSideLabelChange = (sideIndex, val) => {
            if (!setElements) return;
            setElements(prev => prev.map(o => {
                if (o.id !== el.id) return o;
                return {
                    ...o,
                    sideLabels: { ...(o.sideLabels || {}), [sideIndex]: val }
                };
            }));
        };

        const capturePointer = (e) => e.stopPropagation();

        // 🟢 Scaled typography calculations
        const baseDimension = Math.min(w, h);
        const angleFontSize = Math.max(13, Math.min(22, Math.round(baseDimension * 0.052)));
        const anglePillWidth = Math.max(42, Math.round(angleFontSize * 3.2));
        const anglePillHeight = Math.max(26, Math.round(angleFontSize * 1.8));

        const sideFontSize = Math.max(14, Math.min(24, Math.round(baseDimension * 0.056)));
        const sideInputWidth = Math.max(90, Math.round(sideFontSize * 6.2));
        const sideInputHeight = Math.max(34, Math.round(sideFontSize * 2.2));

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}, ${w / 2}, ${h / 2})`}
                className="select-none"
            >
                {/* 1. Tactile Tray Drag Handle */}
                <g 
                    className="cursor-move group"
                    style={{ pointerEvents: 'auto' }}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        if (setSelectedId) setSelectedId(el.id);
                        if (setInteractionMode) setInteractionMode('moving');
                        if (setIsDrawing) setIsDrawing(true);
                        if (getCoordinates && setDragOffset) {
                            setDragOffset(getCoordinates(e, false));
                        }
                    }}
                >
                    <rect 
                        x={w / 2 - 40} 
                        y={-28} 
                        width={80} 
                        height={24} 
                        rx={10} 
                        fill="#f8fafc" 
                        stroke="#cbd5e1" 
                        strokeWidth={1.5}
                        className="group-hover:stroke-indigo-400 group-hover:fill-indigo-50/50 transition-colors shadow-xs" 
                    />
                    <GripHorizontal size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" x={w / 2 - 7} y={-23} />
                </g>

                {/* 2. Shape Geometry Rendering */}
                {el.type === 'circle' ? (
                    <circle 
                        cx={w / 2} 
                        cy={h / 2} 
                        r={Math.min(w, h) / 2 - 12} 
                        fill={el.fill || '#ffffff'} 
                        fillOpacity={el.fillOpacity ?? 0.08} 
                        stroke={strokeColor} 
                        strokeWidth={strokeW} 
                        filter="drop-shadow(0 6px 16px rgba(15, 23, 42, 0.08))"
                    />
                ) : (
                    <polygon 
                        points={vertices.map(p => `${p.x},${p.y}`).join(' ')} 
                        fill={el.fill || '#ffffff'} 
                        fillOpacity={el.fillOpacity ?? 0.08} 
                        stroke={strokeColor} 
                        strokeWidth={strokeW} 
                        strokeLinejoin="round" 
                        strokeLinecap="round" 
                        filter="drop-shadow(0 6px 16px rgba(15, 23, 42, 0.08))"
                    />
                )}

                {/* 3. Scaled Angle Arcs & Vertex Badges */}
                {el.showAngles && vertices.length >= 3 && vertices.map((curr, idx) => {
                    const prev = vertices[(idx - 1 + vertices.length) % vertices.length];
                    const next = vertices[(idx + 1) % vertices.length];
                    const angleDeg = getInteriorAngleDeg(prev, curr, next);
                    const isRight = Math.abs(angleDeg - 90) <= 2;

                    const v1 = { x: prev.x - curr.x, y: prev.y - curr.y };
                    const v2 = { x: next.x - curr.x, y: next.y - curr.y };
                    const len1 = Math.hypot(v1.x, v1.y) || 1;
                    const len2 = Math.hypot(v2.x, v2.y) || 1;
                    const u1 = { x: v1.x / len1, y: v1.y / len1 };
                    const u2 = { x: v2.x / len2, y: v2.y / len2 };
                    const bisector = { x: u1.x + u2.x, y: u1.y + u2.y };
                    const bLen = Math.hypot(bisector.x, bisector.y) || 1;
                    const bisNorm = { x: bisector.x / bLen, y: bisector.y / bLen };

                    const arcRadius = Math.max(22, Math.min(42, baseDimension * 0.11));
                    const badgeDist = arcRadius + 20;
                    const bx = curr.x + bisNorm.x * badgeDist;
                    const by = curr.y + bisNorm.y * badgeDist;

                    return (
                        <g key={`angle-${idx}`} className="pointer-events-none">
                            {isRight ? (
                                <path 
                                    d={`M ${curr.x + u1.x * arcRadius} ${curr.y + u1.y * arcRadius} 
                                        L ${curr.x + u1.x * arcRadius + u2.x * arcRadius} ${curr.y + u1.y * arcRadius + u2.x * arcRadius} 
                                        L ${curr.x + u2.x * arcRadius} ${curr.y + u2.y * arcRadius}`} 
                                    fill="none" 
                                    stroke="#3b82f6" 
                                    strokeWidth={2.5} 
                                />
                            ) : (
                                <path 
                                    d={`M ${curr.x + u1.x * arcRadius} ${curr.y + u1.y * arcRadius} 
                                        Q ${curr.x + bisNorm.x * (arcRadius * 1.15)} ${curr.y + bisNorm.y * (arcRadius * 1.15)} 
                                        ${curr.x + u2.x * arcRadius} ${curr.y + u2.y * arcRadius}`} 
                                    fill="none" 
                                    stroke="#3b82f6" 
                                    strokeWidth={2.5} 
                                />
                            )}

                            {/* Prominent Angle Text Pill */}
                            <g transform={`translate(${bx}, ${by})`}>
                                <rect 
                                    x={-anglePillWidth / 2} 
                                    y={-anglePillHeight / 2} 
                                    width={anglePillWidth} 
                                    height={anglePillHeight} 
                                    rx={10} 
                                    fill="#ffffff" 
                                    stroke="#cbd5e1" 
                                    strokeWidth={2} 
                                    filter="drop-shadow(0 4px 8px rgba(0,0,0,0.1))" 
                                />
                                <text 
                                    x={0} 
                                    y={1} 
                                    textAnchor="middle" 
                                    dominantBaseline="central" 
                                    fontSize={angleFontSize} 
                                    fontWeight="900" 
                                    fill={el.angleMode === 'unknown' ? '#6366f1' : '#0f172a'} 
                                    fontStyle={el.angleMode === 'unknown' ? 'italic' : 'normal'}
                                    fontFamily="system-ui, -apple-system, sans-serif"
                                >
                                    {el.angleMode === 'unknown' ? 'x' : `${angleDeg}°`}
                                </text>
                            </g>
                        </g>
                    );
                })}

                {/* 4. Enlarged & Scalable Side Length Input Pills */}
                {el.showSideLengths && vertices.length >= 3 && vertices.map((p1, idx) => {
                    const p2 = vertices[(idx + 1) % vertices.length];
                    const midX = (p1.x + p2.x) / 2;
                    const midY = (p1.y + p2.y) / 2;

                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const len = Math.hypot(dx, dy) || 1;
                    const norm = { x: -dy / len, y: dx / len };
                    const defaultDist = Math.round(len);

                    // 🟢 Realistic classroom cm default (e.g. 5 cm, 8 cm, 12 cm)
                    const defaultCm = Math.max(1, Math.round(len / 35));
                    const labelVal = el.sideLabels?.[idx] ?? `${defaultCm} cm`;

                    const pillX = midX + norm.x * 24;
                    const pillY = midY + norm.y * 24;

                    return (
                        <foreignObject 
                            key={`side-${idx}`} 
                            x={pillX - sideInputWidth / 2} 
                            y={pillY - sideInputHeight / 2} 
                            width={sideInputWidth} 
                            height={sideInputHeight} 
                            className="pointer-events-auto overflow-visible select-none"
                        >
                            <div className="w-full h-full flex items-center justify-center">
                                <input
                                    type="text"
                                    value={labelVal}
                                    style={{ fontSize: `${sideFontSize}px` }}
                                    onPointerDown={capturePointer}
                                    onChange={(e) => handleSideLabelChange(idx, e.target.value)}
                                    className="w-full h-full text-center bg-white border-2 border-slate-300 hover:border-emerald-500 focus:border-emerald-600 rounded-2xl font-black text-slate-900 shadow-lg outline-none cursor-text px-2 tracking-wide leading-none"
                                />
                            </div>
                        </foreignObject>
                    );
                })}

                {/* 5. Standard Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, w / 2)}
                    </g>
                )}
            </g>
        );
    }
};

export default BasicShapesTool;