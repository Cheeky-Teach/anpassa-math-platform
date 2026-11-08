// src/components/whiteboard/tools/geometry/AngleArcTool.jsx
import React from 'react';

export const AngleArcTool = {
    type: 'angle_arc',
    hasOptions: false,

    createDefault: (id, color = '#3b82f6', payload = {}) => {
        const rayLen = payload.rayLength || 160;
        const angleVal = payload.angle ?? 45;
        const initialDim = rayLen + 32;

        return {
            id,
            type: 'angle_arc',
            x: payload.x ?? 600,
            y: payload.y ?? 250,
            width: initialDim,
            height: initialDim,
            rayLength: rayLen,
            angle: angleVal,
            label: payload.label ?? `${angleVal}°`,
            stroke: payload.stroke || '#0f172a',
            strokeWidth: 3,
            rotation: payload.rotation || 0,
            opacity: 1
        };
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { showUI = false, renderHandles = null } = options;

        if (!el) return null;

        // 🟢 Dynamically derive ray length from current resized dimensions
        const baseDim = Math.max(80, Math.min(Number(el.width) || 200, Number(el.height) || 200));
        const rayLen = Math.max(60, baseDim - 32);

        const aDeg = Math.max(0, Math.min(360, Number(el.angle) || 45));
        const aRad = (aDeg * Math.PI) / 180;
        const arcR = Math.max(26, Math.round(rayLen * 0.32));
        const strokeColor = el.stroke || '#0f172a';
        const strokeW = Math.max(2, Math.min(6, Math.round(rayLen * 0.02)));

        // Origin vertex shifted to the bottom-left of the bounding box
        const vx = 16;
        const vy = rayLen + 16;

        // Baseline Ray (0° along the horizontal bottom line)
        const x1 = vx + rayLen;
        const y1 = vy;

        // Angled Ray (counter-clockwise upward)
        const x2 = vx + Math.round(rayLen * Math.cos(-aRad));
        const y2 = vy + Math.round(rayLen * Math.sin(-aRad));

        // Arc endpoints
        const arcStartX = vx + arcR;
        const arcStartY = vy;
        const arcEndX = vx + Math.round(arcR * Math.cos(-aRad));
        const arcEndY = vy + Math.round(arcR * Math.sin(-aRad));
        const largeArcFlag = aDeg > 180 ? 1 : 0;
        const arcD = `M ${arcStartX} ${arcStartY} A ${arcR} ${arcR} 0 ${largeArcFlag} 0 ${arcEndX} ${arcEndY}`;

        // Badge position along angle bisector
        const bisectorAngle = -aRad / 2;
        const badgeDist = arcR + Math.max(18, Math.round(rayLen * 0.16));
        const badgeX = vx + Math.round(badgeDist * Math.cos(bisectorAngle));
        const badgeY = vy + Math.round(badgeDist * Math.sin(bisectorAngle));

        const isRightAngle = Math.abs(aDeg - 90) <= 1;

        // Responsive font & badge scaling
        const badgeFontSize = Math.max(12, Math.min(24, Math.round(rayLen * 0.09)));
        const badgeW = Math.max(44, Math.round(badgeFontSize * 3.6));
        const badgeH = Math.max(24, Math.round(badgeFontSize * 1.9));

        return (
            <g
                key={el.id}
                data-id={el.id}
                transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}, ${vx}, ${vy})`}
                className="select-none cursor-move pointer-events-auto"
            >
                {/* 1. Transparent Hit Area encompassing the entire angle */}
                <path
                    d={`M ${vx} ${vy} L ${x1} ${y1} A ${rayLen} ${rayLen} 0 ${largeArcFlag} 0 ${x2} ${y2} Z`}
                    fill="transparent"
                />

                {/* 2. Vertex Dot */}
                <circle cx={vx} cy={vy} r={Math.max(3.5, strokeW * 1.4)} fill={strokeColor} />

                {/* 3. Base Ray (0°) */}
                <line
                    x1={vx}
                    y1={vy}
                    x2={x1}
                    y2={y1}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                />

                {/* 4. Angled Ray */}
                <line
                    x1={vx}
                    y1={vy}
                    x2={x2}
                    y2={y2}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                />

                {/* 5. Arc Wedge / Right Angle Square */}
                {isRightAngle ? (
                    <path
                        d={`M ${vx + arcR} ${vy} L ${vx + arcR} ${vy - arcR} L ${vx} ${vy - arcR}`}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={Math.max(2, strokeW * 0.85)}
                    />
                ) : (
                    <path
                        d={`M ${vx} ${vy} L ${arcStartX} ${arcStartY} A ${arcR} ${arcR} 0 ${largeArcFlag} 0 ${arcEndX} ${arcEndY} Z`}
                        fill="#3b82f6"
                        fillOpacity="0.14"
                        stroke="#3b82f6"
                        strokeWidth={Math.max(2, strokeW * 0.85)}
                    />
                )}

                {/* 6. Angle Label Badge */}
                <g transform={`translate(${badgeX}, ${badgeY})`} className="pointer-events-none">
                    <rect
                        x={-badgeW / 2}
                        y={-badgeH / 2}
                        width={badgeW}
                        height={badgeH}
                        rx={badgeH / 2}
                        fill="#ffffff"
                        stroke="#cbd5e1"
                        strokeWidth={1.5}
                        filter="drop-shadow(0 2px 8px rgba(0,0,0,0.1))"
                    />
                    <text
                        x="0"
                        y="1"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={badgeFontSize}
                        fontWeight="900"
                        fill={el.label === 'x' || el.label === '?' ? '#6366f1' : '#0f172a'}
                        fontStyle={el.label === 'x' ? 'italic' : 'normal'}
                        fontFamily="system-ui, -apple-system, sans-serif"
                    >
                        {el.label || `${aDeg}°`}
                    </text>
                </g>

                {/* 7. Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, baseDim / 2)}
                    </g>
                )}
            </g>
        );
    }
};

export default AngleArcTool;