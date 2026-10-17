// src/components/whiteboard/tools/manipulatives/AlgebraTileTool.jsx
import React from 'react';
import { RotateCw, Trash2 } from 'lucide-react';

export const TILE_CONFIGS = {
  '1': {
    width: 60,
    height: 60,
    labelPos: '+1',
    labelNeg: '−1',
    posBorder: '#047857',
    posFill: '#10b981',
    negBorder: '#b91c1c',
    negFill: '#ef4444'
  },
  'x': {
    width: 60,
    height: 180,
    labelPos: '+x',
    labelNeg: '−x',
    posBorder: '#1d4ed8',
    posFill: '#3b82f6',
    negBorder: '#b91c1c',
    negFill: '#ef4444'
  },
  'x2': {
    width: 180,
    height: 180,
    labelPos: '+x²',
    labelNeg: '−x²',
    posBorder: '#1e40af',
    posFill: '#2563eb',
    negBorder: '#b91c1c',
    negFill: '#ef4444'
  }
};

export const AlgebraTileTool = {
  type: 'algebra_tile',

  create(x = 500, y = 300, kind = 'x', sign = 1) {
    const safeKind = TILE_CONFIGS[kind] ? kind : 'x';
    const cfg = TILE_CONFIGS[safeKind];
    return {
      id: `tile_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'algebra_tile',
      tileKind: safeKind,
      sign: sign >= 0 ? 1 : -1,
      x: Math.round(Number(x) || 500),
      y: Math.round(Number(y) || 300),
      width: cfg.width,
      height: cfg.height,
      isRotated: false
    };
  },

  // Magnetic proximity snapping algorithm
  snapToNearest(target, allElements, threshold = 35) {
    let bestX = target.x;
    let bestY = target.y;
    let minDistance = threshold;

    const targetW = target.isRotated ? target.height : target.width;
    const targetH = target.isRotated ? target.width : target.height;

    const otherTiles = allElements.filter(el => el.id !== target.id && el.type === 'algebra_tile');

    for (const other of otherTiles) {
      const otherW = other.isRotated ? other.height : other.width;
      const otherH = other.isRotated ? other.width : other.height;

      // Snap right
      const distRight = Math.hypot((other.x + otherW) - target.x, other.y - target.y);
      if (distRight < minDistance) {
        minDistance = distRight;
        bestX = other.x + otherW + 4;
        bestY = other.y;
      }

      // Snap left
      const distLeft = Math.hypot((other.x - targetW - 4) - target.x, other.y - target.y);
      if (distLeft < minDistance) {
        minDistance = distLeft;
        bestX = other.x - targetW - 4;
        bestY = other.y;
      }

      // Snap bottom
      const distBottom = Math.hypot(other.x - target.x, (other.y + otherH) - target.y);
      if (distBottom < minDistance) {
        minDistance = distBottom;
        bestX = other.x;
        bestY = other.y + otherH + 4;
      }

      // Snap top
      const distTop = Math.hypot(other.x - target.x, (other.y - targetH - 4) - target.y);
      if (distTop < minDistance) {
        minDistance = distTop;
        bestX = other.x;
        bestY = other.y - targetH - 4;
      }

      // Zero-pair snap
      if (other.tileKind === target.tileKind && other.sign !== target.sign) {
        const centerDist = Math.hypot(other.x - target.x, other.y - target.y);
        if (centerDist < threshold * 1.2) {
          minDistance = centerDist;
          bestX = other.x + 8;
          bestY = other.y + 8;
        }
      }
    }

    if (minDistance === threshold) {
      bestX = Math.round(target.x / 30) * 30;
      bestY = Math.round(target.y / 30) * 30;
    }

    return { x: bestX, y: bestY };
  },

  render(elOrOptions, maybeOptions) {
    const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
    const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
    const { isSelected = false, onUpdate = null, setElements = null, setSelectedId = null } = options;

    if (!el) return null;

    const kind = TILE_CONFIGS[el.tileKind] ? el.tileKind : 'x';
    const cfg = TILE_CONFIGS[kind];
    const isPositive = (Number(el.sign) || 1) > 0;

    const rawW = Number(el.width) || cfg.width;
    const rawH = Number(el.height) || cfg.height;
    const w = el.isRotated ? rawH : rawW;
    const h = el.isRotated ? rawW : rawH;
    const posX = Number(el.x) || 0;
    const posY = Number(el.y) || 0;

    const borderColor = isPositive ? cfg.posBorder : cfg.negBorder;
    const fillColor = isPositive ? cfg.posFill : cfg.negFill;
    const label = isPositive ? cfg.labelPos : cfg.labelNeg;

    const toggleSign = (e) => {
      e.stopPropagation();
      onUpdate?.({ ...el, sign: isPositive ? -1 : 1 });
    };

    const toggleRotation = (e) => {
      e.stopPropagation();
      if (el.tileKind === 'x') {
        onUpdate?.({ ...el, isRotated: !el.isRotated });
      }
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      if (setElements) {
        setElements(prev => prev.filter(item => item.id !== el.id));
      }
      if (setSelectedId) {
        setSelectedId(null);
      }
    };

    return (
      <g className="pointer-events-auto cursor-move select-none">
        {/* Main Solid Tile */}
        <rect
          x={posX}
          y={posY}
          width={w}
          height={h}
          rx={8}
          ry={8}
          fill={fillColor}
          stroke={borderColor}
          strokeWidth={isSelected ? 4 : 2}
          strokeDasharray={isSelected ? '6 3' : 'none'}
          opacity={1}
        />

        {/* Math Tile Label */}
        <text
          x={posX + w / 2}
          y={posY + h / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize={kind === '1' ? 18 : 24}
          fill="#ffffff"
          pointerEvents="none"
        >
          {label}
        </text>

        {/* Action Controls Toolbar (Visible on selection) */}
        {isSelected && (
          <foreignObject
            x={posX}
            y={posY - 52}
            width={Math.max(w, 160)}
            height={50}
            className="overflow-visible pointer-events-auto"
          >
            <div className="flex items-center gap-1.5 bg-slate-900/95 text-white px-2 py-1.5 rounded-2xl shadow-2xl border border-slate-700 w-max pointer-events-auto backdrop-blur-xs">
              
              {/* 🟢 Standout +/- Text Button (No duplicate icon) */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={toggleSign}
                className="px-2.5 py-1 hover:bg-slate-800 rounded-xl font-black text-sm tracking-widest flex items-center justify-center cursor-pointer transition-colors text-white active:scale-95"
                title="Växla tecken (+ / −)"
              >
                + / −
              </button>

              {/* Rotate Button (Only for rectangular x-tiles) */}
              {kind === 'x' && (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={toggleRotation}
                  className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-200 hover:text-white cursor-pointer transition-colors flex items-center justify-center active:scale-95"
                  title="Rotera 90°"
                >
                  <RotateCw size={16} strokeWidth={2.5} />
                </button>
              )}

              {/* Separator */}
              <div className="w-px h-5 bg-slate-700 mx-0.5" />

              {/* 🟢 Direct Delete Trash Handle */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleDelete}
                className="p-1.5 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 rounded-xl cursor-pointer transition-colors flex items-center justify-center active:scale-95"
                title="Ta bort bricka"
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            </div>
          </foreignObject>
        )}
      </g>
    );
  }
};

export default AlgebraTileTool;