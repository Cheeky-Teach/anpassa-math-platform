// src/components/whiteboard/tools/geometry/Shapes3DTool.jsx
import React from 'react';
import { GripHorizontal, Eye, EyeOff, Ruler } from 'lucide-react';

const SHAPE_NAMES = {
    cube: { sv: 'Kub', en: 'Cube' },
    prism: { sv: 'Rätblock', en: 'Rectangular Prism' },
    triprism: { sv: 'Triangulärt Prisma', en: 'Triangular Prism' },
    pyramid: { sv: 'Pyramid', en: 'Pyramid' },
    house: { sv: 'Sammansatt (Hus)', en: 'Composite (House)' },
    cylinder: { sv: 'Cylinder', en: 'Cylinder' },
    silo: { sv: 'Silo', en: 'Silo' },
    tube: { sv: 'Rör (Hålcylinder)', en: 'Hollow Tube' },
    cone: { sv: 'Kon', en: 'Cone' },
    icecream: { sv: 'Glasskon', en: 'Cone Scoop' },
    sphere: { sv: 'Klot (Sfär)', en: 'Sphere' },
    hemi: { sv: 'Halvklot', en: 'Hemisphere' }
};

export const Shapes3DTool = {
    type: 'shapes_3d',
    hasOptions: true,

    createDefault: (id, color = '#0284c7', shape3D = 'cube') => ({
        id,
        type: 'shapes_3d',
        shape3D,
        x: 550,
        y: 220,
        width: 280,
        height: 260,
        stroke: color,
        strokeWidth: 3,
        showInternal: true,
        showDimensions: true,
        dimLabels: {},
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv', t }) => {
        const shapeKey = el.shape3D || 'cube';
        const shapeName = SHAPE_NAMES[shapeKey]?.[lang === 'sv' ? 'sv' : 'en'] || shapeKey;

        const toggleInternal = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, showInternal: !o.showInternal } : o));
        };

        const toggleDimensions = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, showDimensions: !o.showDimensions } : o));
        };

        return (
            <div 
                className="flex items-center gap-2.5 font-sans font-bold text-sm select-none !text-slate-900" 
                style={{ color: '#0f172a' }}
            >
                {/* 1. Shape Title Pill */}
                <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
                    {shapeName}
                </span>

                {/* 2. Dotted / Hidden Lines Toggle */}
                <button
                    type="button"
                    onClick={toggleInternal}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        el.showInternal
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {el.showInternal ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span>{lang === 'sv' ? "Dolda linjer" : "Hidden lines"}</span>
                </button>

                {/* 3. Dimension Labels Toggle */}
                <button
                    type="button"
                    onClick={toggleDimensions}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        el.showDimensions
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <Ruler size={14} />
                    <span>{lang === 'sv' ? "Mått" : "Dimensions"}</span>
                </button>
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

        const w = Number(el.width) || 280;
        const h = Number(el.height) || 260;
        const d = w * 0.32;
        const strokeColor = el.stroke || '#0284c7';

        const common = { 
            fill: strokeColor, 
            fillOpacity: 0.12, 
            stroke: strokeColor, 
            strokeWidth: Number(el.strokeWidth) || 3,
            strokeLinejoin: 'round',
            strokeLinecap: 'round'
        };

        const dotted = { 
            stroke: strokeColor, 
            strokeWidth: 2, 
            strokeDasharray: "6 4", 
            fill: "none" 
        };

        let faces = [];
        let lines = [];
        let labelPoints = [];

        // 1. Cube & Rectangular Prism
        if (el.shape3D === 'cube' || el.shape3D === 'prism') {
            const prismH = h * 0.72;
            faces.push(
                <path key="f1" d={`M 0 ${d} L ${w - d} ${d} L ${w - d} ${d + prismH} L 0 ${d + prismH} Z`} {...common} />,
                <path key="f2" d={`M 0 ${d} L ${d} 0 L ${w} 0 L ${w - d} ${d} Z`} {...common} />,
                <path key="f3" d={`M ${w - d} ${d} L ${w} 0 L ${w} ${prismH} L ${w - d} ${d + prismH} Z`} {...common} />
            );
            if (el.showInternal) {
                lines.push(
                    <path key="h1" d={`M 0 ${d + prismH} L ${d} ${prismH} L ${d} 0 M ${d} ${prismH} L ${w} ${prismH}`} {...dotted} />
                );
            }
            labelPoints = [
                { key: 'l', x: (w - d) / 2, y: d + prismH + 28, def: Math.max(2, Math.round((w - d) / 30)) },
                { key: 'h', x: -38, y: d + prismH / 2, def: Math.max(2, Math.round(prismH / 30)) },
                { key: 'w', x: (w - d) + d / 2 + 28, y: d / 2 - 8, def: Math.max(2, Math.round(d / 25)) }
            ];
        } 
        // 2. Triangular Prism
        else if (el.shape3D === 'triprism') {
            const bX = d;
            const bY = 0;
            const frontH = h * 0.75;
            if (el.showInternal) {
                faces.push(
                    <path key="back" d={`M ${bX} ${bY + frontH} L ${bX + w - d} ${bY + frontH} L ${bX + (w - d) / 2} ${bY + d} Z`} {...common} strokeDasharray="4" />
                );
            }
            faces.push(
                <path key="front" d={`M 0 ${frontH} L ${w - d} ${frontH} L ${(w - d) / 2} ${d} Z`} {...common} />
            );
            lines.push(
                <line key="c1" x1={0} y1={frontH} x2={bX} y2={bY + frontH} {...common} />,
                <line key="c2" x1={w - d} y1={frontH} x2={bX + w - d} y2={bY + frontH} {...common} />,
                <line key="c3" x1={(w - d) / 2} y1={d} x2={bX + (w - d) / 2} y2={bY + d} {...common} />
            );
            if (el.showInternal) {
                lines.push(
                    <line key="h" x1={(w - d) / 2} y1={d} x2={(w - d) / 2} y2={frontH} {...dotted} />
                );
            }
            labelPoints = [
                { key: 'b', x: (w - d) / 2, y: frontH + 28, def: Math.max(2, Math.round((w - d) / 30)) },
                { key: 'h_tri', x: (w - d) / 2 - 36, y: (d + frontH) / 2, def: Math.max(2, Math.round((frontH - d) / 30)) },
                { key: 'l', x: (w - d) + d / 2 + 28, y: frontH - 12, def: Math.max(2, Math.round(d / 25)) }
            ];
        } 
        // 3. Pyramid
        else if (el.shape3D === 'pyramid') {
            const apexX = w / 2;
            const apexY = 12;
            const baseY = h - 24;
            faces.push(
                <path key="b" d={`M 0 ${baseY} L ${w - d} ${baseY} L ${w} ${baseY - d} L ${d} ${baseY - d} Z`} {...common} />,
                <path key="s1" d={`M 0 ${baseY} L ${apexX} ${apexY} L ${w - d} ${baseY} Z`} {...common} />,
                <path key="s2" d={`M ${w - d} ${baseY} L ${apexX} ${apexY} L ${w} ${baseY - d} Z`} {...common} />
            );
            if (el.showInternal) {
                lines.push(
                    <line key="h" x1={apexX} y1={apexY} x2={apexX} y2={baseY - d / 2} {...dotted} />
                );
            }
            labelPoints = [
                { key: 's', x: (w - d) / 2, y: baseY + 28, def: Math.max(2, Math.round((w - d) / 30)) },
                { key: 'h', x: apexX - 38, y: (apexY + baseY) / 2, def: Math.max(2, Math.round(h / 30)) }
            ];
        } 
        // 4. House (Composite Rectangular + Gable Roof Prism)
        else if (el.shape3D === 'house') {
            const baseW = w - d;
            const wallH = h * 0.48;
            const roofApexY = 12;
            const eaveY = h - wallH - 16;
            const groundY = h - 16;

            // Front wall
            faces.push(
                <path key="fw" d={`M 0 ${eaveY} L ${baseW} ${eaveY} L ${baseW} ${groundY} L 0 ${groundY} Z`} {...common} />
            );
            // Front gable triangle
            faces.push(
                <path key="fg" d={`M 0 ${eaveY} L ${baseW / 2} ${roofApexY} L ${baseW} ${eaveY} Z`} {...common} fillOpacity={0.2} />
            );
            // Side wall
            faces.push(
                <path key="sw" d={`M ${baseW} ${eaveY} L ${w} ${eaveY - d} L ${w} ${groundY - d} L ${baseW} ${groundY} Z`} {...common} />
            );
            // Side roof slope
            faces.push(
                <path key="sr" d={`M ${baseW / 2} ${roofApexY} L ${baseW / 2 + d} ${roofApexY - d} L ${w} ${eaveY - d} L ${baseW} ${eaveY} Z`} {...common} fillOpacity={0.25} />
            );

            if (el.showInternal) {
                lines.push(
                    // Roof apex height
                    <line key="rh" x1={baseW / 2} y1={roofApexY} x2={baseW / 2} y2={eaveY} {...dotted} />,
                    // Ground hidden edges
                    <path key="gh" d={`M 0 ${groundY} L ${d} ${groundY - d} L ${w} ${groundY - d}`} {...dotted} />
                );
            }

            labelPoints = [
                { key: 'b', x: baseW / 2, y: groundY + 28, def: Math.max(2, Math.round(baseW / 30)) },
                { key: 'd', x: baseW + d / 2 + 28, y: groundY - d / 2, def: Math.max(2, Math.round(d / 25)) },
                { key: 'h_wall', x: -38, y: eaveY + wallH / 2, def: Math.max(2, Math.round(wallH / 30)) },
                { key: 'h_roof', x: baseW / 2 - 38, y: (roofApexY + eaveY) / 2, def: Math.max(1, Math.round((eaveY - roofApexY) / 30)) }
            ];
        } 
        // 5. Hollow Tube (Cylinder with Central Through-Hole)
        else if (el.shape3D === 'tube') {
            const topY = d / 2 + 8;
            const botY = h - d / 2 - 8;
            const outerRx = (w - 16) / 2;
            const innerRx = outerRx * 0.52;
            const outerRy = d / 2 - 2;
            const innerRy = outerRy * 0.52;
            const cx = w / 2;

            // Outer bottom ellipse
            faces.push(
                <ellipse key="bot_out" cx={cx} cy={botY} rx={outerRx} ry={outerRy} {...common} />
            );
            // Outer wall body
            faces.push(
                <rect key="body" x={cx - outerRx} y={topY} width={outerRx * 2} height={botY - topY} {...common} stroke="none" />
            );
            // Outer top face
            faces.push(
                <ellipse key="top_out" cx={cx} cy={topY} rx={outerRx} ry={outerRy} {...common} fillOpacity={0.22} />
            );
            // Inner hollow hole at top (clears out the center)
            faces.push(
                <ellipse key="top_hole" cx={cx} cy={topY} rx={innerRx} ry={innerRy} fill="#ffffff" stroke={strokeColor} strokeWidth={common.strokeWidth} />
            );

            // Outer side vertical profiles
            lines.push(
                <line key="l_out" x1={cx - outerRx} y1={topY} x2={cx - outerRx} y2={botY} stroke={strokeColor} strokeWidth={common.strokeWidth} />,
                <line key="r_out" x1={cx + outerRx} y1={topY} x2={cx + outerRx} y2={botY} stroke={strokeColor} strokeWidth={common.strokeWidth} />
            );

            // Internal bore lines showing the through-hole depth
            if (el.showInternal) {
                lines.push(
                    <line key="bore_l" x1={cx - innerRx} y1={topY} x2={cx - innerRx} y2={botY} {...dotted} />,
                    <line key="bore_r" x1={cx + innerRx} y1={topY} x2={cx + innerRx} y2={botY} {...dotted} />,
                    <ellipse key="bore_bot" cx={cx} cy={botY} rx={innerRx} ry={innerRy} {...dotted} />
                );
            }

            // Radial arrows & measurement sight lines
            lines.push(
                <line key="r_inner_line" x1={cx} y1={topY} x2={cx + innerRx} y2={topY} stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" />,
                <line key="r_outer_line" x1={cx} y1={topY} x2={cx - outerRx} y2={topY} stroke="#0f172a" strokeWidth={2.5} strokeLinecap="round" />,
                <circle key="center_pt" cx={cx} cy={topY} r={3.5} fill="#0f172a" />
            );

            labelPoints = [
                { key: 'r_in', x: cx + innerRx / 2 + 10, y: topY - 26, def: Math.max(1, Math.round(innerRx / 30)), prefix: 'r₁=' },
                { key: 'r_out', x: cx - outerRx / 2 - 10, y: topY - 26, def: Math.max(2, Math.round(outerRx / 30)), prefix: 'r₂=' },
                { key: 'h', x: cx + outerRx + 36, y: (topY + botY) / 2, def: Math.max(2, Math.round((botY - topY) / 30)) }
            ];
        } 
        // 6. Cylinder & Silo
        else if (el.shape3D === 'cylinder' || el.shape3D === 'silo') {
            const topY = d / 2 + 6;
            const botY = h - d / 2 - 6;
            const rx = w / 2 - 8;
            const ry = d / 2;

            faces.push(
                <ellipse key="e1" cx={w / 2} cy={botY} rx={rx} ry={ry} {...common} />,
                <rect key="r1" x={w / 2 - rx} y={topY} width={rx * 2} height={botY - topY} {...common} stroke="none" />,
                <ellipse key="e2" cx={w / 2} cy={topY} rx={rx} ry={ry} {...common} fillOpacity={0.25} />
            );
            lines.push(
                <line key="l1" x1={w / 2 - rx} y1={topY} x2={w / 2 - rx} y2={botY} stroke={strokeColor} strokeWidth={common.strokeWidth} />,
                <line key="l2" x1={w / 2 + rx} y1={topY} x2={w / 2 + rx} y2={botY} stroke={strokeColor} strokeWidth={common.strokeWidth} />
            );
            if (el.shape3D === 'silo') {
                faces.push(
                    <path key="dome" d={`M ${w / 2 - rx} ${topY} A ${rx} ${rx} 0 0 1 ${w / 2 + rx} ${topY}`} {...common} fillOpacity={0.35} />
                );
            }
            if (el.showInternal) {
                lines.push(
                    <line key="r_line" x1={w / 2} y1={topY} x2={w / 2 + rx} y2={topY} {...dotted} strokeWidth={2.5} />,
                    <circle key="center_dot" cx={w / 2} cy={topY} r={3.5} fill={strokeColor} />
                );
            }
            labelPoints = [
                { key: 'r', x: w / 2 + rx / 2, y: topY - 26, def: Math.max(1, Math.round(rx / 30)), prefix: 'r=' },
                { key: 'h', x: w / 2 + rx + 36, y: (topY + botY) / 2, def: Math.max(2, Math.round((botY - topY) / 30)) }
            ];
        } 
        // 7. Cone & Icecream Scoop
        else if (el.shape3D === 'cone' || el.shape3D === 'icecream') {
            const isIce = el.shape3D === 'icecream';
            const apexY = isIce ? h - 14 : 14;
            const baseY = isIce ? d / 2 + 10 : h - d / 2 - 10;
            const rx = w / 2 - 8;
            const ry = d / 2;

            faces.push(
                <ellipse key="base" cx={w / 2} cy={baseY} rx={rx} ry={ry} {...common} />,
                <path key="side" d={`M ${w / 2 - rx} ${baseY} L ${w / 2} ${apexY} L ${w / 2 + rx} ${baseY} Z`} {...common} />
            );
            if (isIce) {
                faces.push(
                    <path key="scoop" d={`M ${w / 2 - rx} ${baseY} A ${rx} ${rx} 0 0 1 ${w / 2 + rx} ${baseY}`} {...common} fillOpacity={0.35} />
                );
            }
            if (el.showInternal) {
                lines.push(
                    <line key="h_line" x1={w / 2} y1={apexY} x2={w / 2} y2={baseY} {...dotted} />,
                    <line key="r_line" x1={w / 2} y1={baseY} x2={w / 2 + rx} y2={baseY} {...dotted} strokeWidth={2.5} />,
                    <circle key="center_dot" cx={w / 2} cy={baseY} r={3.5} fill={strokeColor} />
                );
            }
            labelPoints = [
                { key: 'r', x: w / 2 + rx / 2, y: baseY + 26, def: Math.max(1, Math.round(rx / 30)), prefix: 'r=' },
                { key: 'h', x: w / 2 - 38, y: (apexY + baseY) / 2, def: Math.max(2, Math.round(Math.abs(baseY - apexY) / 30)) }
            ];
        } 
        // 8. Sphere & Hemisphere
        else if (el.shape3D === 'sphere' || el.shape3D === 'hemi') {
            const radius = Math.min(w, h) / 2 - 12;
            const midX = w / 2;
            const midY = h / 2;
            if (el.shape3D === 'hemi') {
                faces.push(
                    <ellipse key="b" cx={midX} cy={midY} rx={radius} ry={radius * 0.32} {...common} />,
                    <path key="d" d={`M ${midX - radius} ${midY} A ${radius} ${radius} 0 0 0 ${midX + radius} ${midY}`} {...common} fillOpacity={0.25} />
                );
            } else {
                faces.push(
                    <circle key="s1" cx={midX} cy={midY} r={radius} {...common} fillOpacity={0.15} />,
                    <ellipse key="eq" cx={midX} cy={midY} rx={radius} ry={radius * 0.32} {...common} fill="none" strokeDasharray="5 4" />
                );
            }
            if (el.showInternal) {
                lines.push(
                    <line key="r" x1={midX} y1={midY} x2={midX + radius} y2={midY} {...dotted} strokeWidth={2.5} />,
                    <circle key="center_dot" cx={midX} cy={midY} r={3.5} fill={strokeColor} />
                );
            }
            labelPoints = [
                { key: 'r', x: midX + radius / 2, y: midY - 26, def: Math.max(1, Math.round(radius / 30)), prefix: 'r=' }
            ];
        }

        const handleDimChange = (dimKey, val) => {
            if (!setElements) return;
            setElements(prev => prev.map(o => {
                if (o.id !== el.id) return o;
                return {
                    ...o,
                    dimLabels: { ...(o.dimLabels || {}), [dimKey]: val }
                };
            }));
        };

        const capturePointer = (e) => e.stopPropagation();

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}, ${w / 2}, ${h / 2})`}
                className="select-none"
            >
                {/* 1. Tactile Tray Drag Handle Bar */}
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
                        x={w / 2 - 38} 
                        y={-28} 
                        width={76} 
                        height={24} 
                        rx={10} 
                        fill="#f8fafc" 
                        stroke="#cbd5e1" 
                        strokeWidth={1.5}
                        className="group-hover:stroke-indigo-400 group-hover:fill-indigo-50/50 transition-colors shadow-xs" 
                    />
                    <GripHorizontal size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" x={w / 2 - 7} y={-23} />
                </g>

                {/* 2. 3D Wireframe and Shaded Faces (No Outer Card Box) */}
                <g filter="drop-shadow(0 6px 16px rgba(15, 23, 42, 0.08))">
                    {faces}
                    {lines}
                </g>

                {/* 3. Essential Surface Area / Volume Dimension Labels with REM Scaling */}
                {el.showDimensions && labelPoints.map((pt) => {
                    const prefix = pt.prefix || '';
                    const labelVal = el.dimLabels?.[pt.key] ?? `${prefix}${pt.def} cm`;
                    const badgeWidth = 104;
                    const badgeHeight = 36;

                    return (
                        <foreignObject
                            key={`dim-${pt.key}`}
                            x={pt.x - badgeWidth / 2}
                            y={pt.y - badgeHeight / 2}
                            width={badgeWidth}
                            height={badgeHeight}
                            className="pointer-events-auto overflow-visible select-none"
                        >
                            <div className="w-full h-full flex items-center justify-center">
                                <input
                                    type="text"
                                    value={labelVal}
                                    style={{ 
                                        fontSize: 'clamp(0.95rem, 0.85rem + 0.35vw, 1.25rem)' 
                                    }}
                                    onPointerDown={capturePointer}
                                    onChange={(e) => handleDimChange(pt.key, e.target.value)}
                                    className="w-full h-full text-center bg-white/95 backdrop-blur-xs border-2 border-slate-300 hover:border-emerald-500 focus:border-emerald-600 rounded-2xl font-black text-slate-900 shadow-md outline-none cursor-text px-2 tracking-wide leading-none"
                                />
                            </div>
                        </foreignObject>
                    );
                })}

                {/* 4. Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, w / 2)}
                    </g>
                )}
            </g>
        );
    }
};

export default Shapes3DTool;