// src/components/whiteboard/tools/geometry/ProtractorTool.jsx
import React from 'react';
import { GripHorizontal, Stamp, Eye, EyeOff, HelpCircle } from 'lucide-react';

const PRESET_ANGLES = [30, 45, 60, 90, 120, 180];

export const ProtractorTool = {
    type: 'protractor',
    hasOptions: true,

    createDefault: (id, color = '#3b82f6') => ({
        id,
        type: 'protractor',
        x: 550,
        y: 280,
        width: 440,
        height: 220,
        angle: 45,
        stroke: color,
        strokeWidth: 2,
        fontSize: 15,
        showLabels: true,       // Toggle to hide numbers for estimation exercises
        stampMode: 'actual',    // 'actual' (shows 45°) | 'unknown' (shows 'x')
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv', t }) => {
        const currentAngle = Math.max(0, Math.min(180, Number(el.angle) || 0));
        const currentFontSize = Number(el.fontSize) || 15;
        const showLabels = el.showLabels !== false;
        const stampMode = el.stampMode || 'actual';

        const setAngle = (newAngle) => {
            const clamped = Math.max(0, Math.min(180, Math.round(Number(newAngle) || 0)));
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, angle: clamped } : o));
        };

        const updateFontSize = (delta) => {
            setElements(prev => prev.map(o => {
                if (o.id !== el.id) return o;
                const nextSize = Math.max(11, Math.min(24, (Number(o.fontSize) || 15) + delta));
                return { ...o, fontSize: nextSize };
            }));
        };

        const toggleLabels = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, showLabels: !showLabels } : o));
        };

        const toggleStampMode = () => {
            setElements(prev => prev.map(o => o.id === el.id ? { 
                ...o, 
                stampMode: stampMode === 'actual' ? 'unknown' : 'actual' 
            } : o));
        };

        // Stamps an interactive angle element with rays, arc, and label badge
        const stampAngleToCanvas = () => {
            const rad = el.width / 2;
            const cx = el.x + rad;
            const cy = el.y + rad;
            const timestamp = Date.now();
            const angleVal = currentAngle;
            const rayLen = rad * 0.95;

            const newAngleElement = {
                id: `angle_${timestamp}`,
                type: 'angle_arc',
                x: cx,
                y: cy,
                width: rayLen,
                height: rayLen,
                rayLength: rayLen,
                radius: Math.max(40, rad * 0.28),
                angle: angleVal,
                label: stampMode === 'unknown' ? 'x' : `${angleVal}°`,
                stroke: '#0f172a',
                arcColor: el.stroke || '#3b82f6',
                rotation: el.rotation || 0,
                opacity: 1
            };

            setElements(prev => [...prev, newAngleElement]);
        };

        const capturePointer = (e) => e.stopPropagation();

        return (
            <div 
                className="flex items-center gap-2.5 font-sans font-bold text-sm select-none !text-slate-900" 
                style={{ color: '#0f172a' }}
            >
                {/* 1. Angle Numeric Input */}
                <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider">θ:</span>
                    <input 
                        type="number"
                        min="0"
                        max="180"
                        value={currentAngle}
                        onPointerDown={capturePointer}
                        onChange={(e) => setAngle(e.target.value)}
                        className="w-12 py-0.5 bg-white border border-slate-300 rounded-lg text-center font-black text-indigo-600 outline-none text-xs shadow-inner"
                    />
                    <span className="text-xs font-black text-slate-600">°</span>
                </div>

                {/* 2. Quick Benchmark Chips */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    {PRESET_ANGLES.map(a => (
                        <button
                            key={a}
                            type="button"
                            onClick={() => setAngle(a)}
                            className={`px-2 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                currentAngle === a 
                                    ? 'bg-indigo-600 text-white shadow-xs' 
                                    : 'bg-white hover:bg-slate-200 text-slate-700'
                            }`}
                        >
                            {a}°
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-slate-200 mx-0.5" />

                {/* 3. Toggle Degree Labels (Blind Guessing Mode) */}
                <button
                    type="button"
                    onClick={toggleLabels}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        showLabels 
                            ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' 
                            : 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    }`}
                    title={lang === 'sv' ? "Visa/Dölj siffror för uppskattning" : "Show/Hide degree numbers"}
                >
                    {showLabels ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span>{showLabels ? (lang === 'sv' ? "Siffror" : "Labels") : (lang === 'sv' ? "Dolda" : "Hidden")}</span>
                </button>

                {/* 4. Font Size Adjuster */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                        type="button"
                        onClick={() => updateFontSize(-2)}
                        disabled={currentFontSize <= 11}
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95 text-xs font-black"
                    >
                        A-
                    </button>
                    <span className="text-xs font-black px-1 min-w-[28px] text-center text-slate-800">
                        {currentFontSize}
                    </span>
                    <button
                        type="button"
                        onClick={() => updateFontSize(2)}
                        disabled={currentFontSize >= 24}
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs active:scale-95 text-xs font-black"
                    >
                        A+
                    </button>
                </div>

                <div className="w-px h-6 bg-slate-200 mx-0.5" />

                {/* 5. Stamped Angle Label Mode (Exact Value vs 'x') */}
                <button
                    type="button"
                    onClick={toggleStampMode}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        stampMode === 'unknown'
                            ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                    title={lang === 'sv' ? "Växla ritat värde mellan vinkel och 'x'" : "Toggle stamped angle between degrees and 'x'"}
                >
                    <HelpCircle size={14} />
                    <span>{stampMode === 'unknown' ? "Etikett: x" : "Etikett: θ°"}</span>
                </button>

                {/* 6. Draw / Stamp Angle Action */}
                <button
                    type="button"
                    onClick={stampAngleToCanvas}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl border border-emerald-700 font-black text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer ml-1"
                >
                    <Stamp size={14} />
                    <span>{lang === 'sv' ? "Rita vinkel" : "Draw Angle"}</span>
                </button>
            </div>
        );
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { 
            lang = 'sv', 
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

        const w = Number(el.width) || 440;
        const r = w / 2;
        const currentAngle = Math.max(0, Math.min(180, Number(el.angle) || 45));
        const fontSize = Math.max(11, Math.min(24, Number(el.fontSize) || 15));
        const activeColor = el.stroke || '#3b82f6';
        const showLabels = el.showLabels !== false;

        // Local origin coordinates inside the translated `<g>`
        const cx = r;
        const cy = r;

        // Ticks generation
        const ticks = [];
        const outerLabels = [];
        const innerLabels = [];

        for (let i = 0; i <= 180; i += 1) {
            const a = (i * Math.PI) / 180;
            const is10 = i % 10 === 0;
            const is5 = i % 5 === 0;
            const tickLen = is10 ? 22 : is5 ? 14 : 8;

            const cosA = Math.cos(-a);
            const sinA = Math.sin(-a);

            ticks.push(
                <line 
                    key={`tick-${i}`} 
                    x1={cx + (r - tickLen) * cosA} 
                    y1={cy + (r - tickLen) * sinA} 
                    x2={cx + r * cosA} 
                    y2={cy + r * sinA} 
                    stroke="#0f172a" 
                    strokeWidth={is10 ? 2.5 : is5 ? 1.5 : 0.8} 
                />
            );

            if (is10 && showLabels) {
                const labelR = r - 34;
                outerLabels.push(
                    <text 
                        key={`outer-${i}`} 
                        x={cx + labelR * cosA} 
                        y={cy + labelR * sinA} 
                        textAnchor="middle" 
                        dominantBaseline="central"
                        fontSize={fontSize} 
                        fontWeight="900" 
                        fill="#0f172a"
                        fontFamily="system-ui, sans-serif"
                    >
                        {i}
                    </text>
                );

                const innerLabelR = r - 50;
                innerLabels.push(
                    <text 
                        key={`inner-${i}`} 
                        x={cx + innerLabelR * cosA} 
                        y={cy + innerLabelR * sinA} 
                        textAnchor="middle" 
                        dominantBaseline="central"
                        fontSize={Math.max(9, fontSize - 3)} 
                        fontWeight="800" 
                        fill="#64748b"
                        fontFamily="system-ui, sans-serif"
                    >
                        {180 - i}
                    </text>
                );
            }
        }

        // Scalable badge sizing
        const badgeWidth = Math.max(140, Math.round(w * 0.42));
        const badgeHeight = Math.max(48, Math.round(badgeWidth * 0.38));
        const badgeDegreeFontSize = Math.max(24, Math.round(fontSize * 1.25));
        const badgeTypeFontSize = Math.max(18, Math.round(fontSize * 0.8));

        const angleClassification = currentAngle < 90 
            ? (lang === 'sv' ? 'Spetsig vinkel' : 'Acute Angle')
            : currentAngle === 90 
            ? (lang === 'sv' ? 'Rät vinkel' : 'Right Angle')
            : currentAngle < 180 
            ? (lang === 'sv' ? 'Trubbig vinkel' : 'Obtuse Angle')
            : (lang === 'sv' ? 'Rak vinkel' : 'Straight Angle');

        // Measurement Shaded Wedge Path
        const aRad = (currentAngle * Math.PI) / 180;
        const wedgeX = cx + (r - 2) * Math.cos(-aRad);
        const wedgeY = cy + (r - 2) * Math.sin(-aRad);
        const wedgePath = `M ${cx} ${cy} L ${cx + (r - 2)} ${cy} A ${r - 2} ${r - 2} 0 0 0 ${wedgeX} ${wedgeY} Z`;

        // Needle tip dragging handler
        const handleNeedleTipPointerDown = (e) => {
            e.stopPropagation();
            if (setSelectedId) setSelectedId(el.id);

            const onPointerMove = (ev) => {
                if (!getCoordinates || !setElements) return;
                const coords = getCoordinates(ev, false);
                
                // Center of protractor in canvas space
                const originX = el.x + r;
                const originY = el.y + r;
                const dx = coords.x - originX;
                const dy = coords.y - originY;
                
                // Account for protractor's rotation angle
                const canvasAngleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
                let deg = Math.round(-canvasAngleDeg + (el.rotation || 0));

                // Normalize between 0 and 180 degrees
                while (deg < 0) deg += 360;
                while (deg > 360) deg -= 360;
                if (deg > 180 && deg < 270) deg = 180;
                else if (deg >= 270) deg = 0;

                const snapped = Math.round(deg / 5) * 5;
                const finalAngle = Math.abs(deg - snapped) <= 2 ? snapped : deg;

                setElements(prev => prev.map(o => o.id === el.id ? { ...o, angle: finalAngle } : o));
            };

            const onPointerUp = () => {
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
            };

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        };

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}, ${r}, ${r})`}
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
                        x={cx - 55} 
                        y={cy + 14} 
                        width={110} 
                        height={26} 
                        rx={12} 
                        fill="#f8fafc" 
                        stroke="#cbd5e1" 
                        strokeWidth={1.5}
                        className="group-hover:stroke-indigo-400 group-hover:fill-indigo-50/50 transition-colors shadow-xs" 
                    />
                    <GripHorizontal size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" x={cx - 7} y={cy + 20} />
                </g>

                {/* 2. Frosted Acrylic Semi-Circle Body */}
                <path 
                    d={`M 0 ${cy} A ${r} ${r} 0 0 1 ${w} ${cy} Z`} 
                    fill="#ffffff" 
                    fillOpacity="0.85" 
                    stroke="#0f172a" 
                    strokeWidth={el.strokeWidth || 2.5} 
                    filter="drop-shadow(0 8px 24px rgba(15, 23, 42, 0.12))"
                    className="pointer-events-none" 
                />

                {/* 3. Measurement Shaded Wedge */}
                {currentAngle > 0 && (
                    <path 
                        d={wedgePath} 
                        fill={activeColor} 
                        fillOpacity="0.18" 
                        className="pointer-events-none"
                    />
                )}

                {/* 4. Graduations & Dual Scale Labels */}
                <g className="pointer-events-none">
                    {ticks}
                    {outerLabels}
                    {innerLabels}
                </g>

                {/* 5. Inner Guide Ring Arc */}
                <path 
                    d={`M ${cx - (r - 62)} ${cy} A ${r - 62} ${r - 62} 0 0 1 ${cx + (r - 62)} ${cy}`} 
                    fill="none" 
                    stroke="#cbd5e1" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4"
                    className="pointer-events-none"
                />

                {/* 6. Baseline & Perpendicular Crosshair */}
                <line x1={8} y1={cy} x2={w - 8} y2={cy} stroke="#0f172a" strokeWidth={2.5} className="pointer-events-none" />
                <line x1={cx} y1={cy} x2={cx} y2={cy - (r - 62)} stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" className="pointer-events-none" />

                {/* 7. Interactive Angle Guide Needle & Tip Handle */}
                <g className="pointer-events-auto">
                    <line 
                        x1={cx} 
                        y1={cy} 
                        x2={wedgeX} 
                        y2={wedgeY} 
                        stroke={activeColor} 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                        className="pointer-events-none"
                    />

                    <g 
                        transform={`translate(${wedgeX}, ${wedgeY})`} 
                        className="cursor-grab active:cursor-grabbing group"
                        onPointerDown={handleNeedleTipPointerDown}
                    >
                        <circle cx={0} cy={0} r={14} fill={activeColor} fillOpacity="0.25" className="group-hover:scale-125 transition-transform" />
                        <circle cx={0} cy={0} r={7} fill="#ffffff" stroke={activeColor} strokeWidth={3} className="shadow-md" />
                    </g>
                </g>

                {/* 8. Center Vertex Sight Hole */}
                <circle cx={cx} cy={cy} r="14" fill="#ffffff" stroke="#0f172a" strokeWidth={2.5} className="pointer-events-none shadow-inner" />
                <circle cx={cx} cy={cy} r="4" fill="#0f172a" className="pointer-events-none" />
                <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke="#0f172a" strokeWidth={1.5} className="pointer-events-none" />
                <line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} stroke="#0f172a" strokeWidth={1.5} className="pointer-events-none" />

                {/* 9. Scaled Floating Classification & Angle Badge */}
                <g transform={`translate(${cx}, ${cy - Math.max(80, r * 0.42)})`} className="pointer-events-none select-none">
                    <rect 
                        x={-badgeWidth / 2} 
                        y={-badgeHeight / 2} 
                        width={badgeWidth} 
                        height={badgeHeight} 
                        rx={badgeHeight / 2} 
                        fill="#ffffff" 
                        stroke="#0f172a" 
                        strokeWidth={2} 
                        filter="drop-shadow(0 4px 12px rgba(15, 23, 42, 0.12))"
                    />
                    <text 
                        x={0} 
                        y={showLabels ? -badgeHeight * 0.15 : 0} 
                        textAnchor="middle" 
                        dominantBaseline="central" 
                        fontSize={badgeDegreeFontSize} 
                        fontWeight="900" 
                        fill={activeColor} 
                        fontFamily="system-ui, sans-serif"
                    >
                        {showLabels ? `${currentAngle}°` : '?°'}
                    </text>
                    {showLabels && (
                        <text 
                            x={0} 
                            y={badgeHeight * 0.25} 
                            textAnchor="middle" 
                            dominantBaseline="central" 
                            fontSize={badgeTypeFontSize} 
                            fontWeight="900" 
                            fill="#64748b" 
                            fontFamily="system-ui, sans-serif"
                            className="uppercase tracking-wider"
                        >
                            {angleClassification}
                        </text>
                    )}
                </g>

                {/* 10. Selection Handles aligned to local bounds & rotation */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, r)}
                    </g>
                )}
            </g>
        );
    }
};

export default ProtractorTool;