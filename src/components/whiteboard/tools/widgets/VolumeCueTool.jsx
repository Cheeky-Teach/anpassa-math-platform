// src/components/whiteboard/tools/widgets/VolumeCueTool.jsx
import React from 'react';
import { GripHorizontal } from 'lucide-react';

const LEVELS = {
    quiet: {
        id: 'quiet',
        emoji: '🤫',
        sv: 'Tyst Arbete',
        en: 'Quiet Work',
        subSv: 'Individuellt fokus',
        subEn: 'Individual focus',
        badgeBg: 'bg-rose-500 text-white'
    },
    whisper: {
        id: 'whisper',
        emoji: '💬',
        sv: 'Viskröst',
        en: 'Whisper Voice',
        subSv: 'Prata med bordsgrannen',
        subEn: 'Pair / shoulder partner',
        badgeBg: 'bg-amber-500 text-white'
    },
    discuss: {
        id: 'discuss',
        emoji: '🗣️',
        sv: 'Diskutera',
        en: 'Group Discussion',
        subSv: 'Bordsgruppsamtal',
        subEn: 'Small group talk',
        badgeBg: 'bg-emerald-600 text-white'
    },
    presentation: {
        id: 'presentation',
        emoji: '📢',
        sv: 'Presentation',
        en: 'Presentation',
        subSv: 'Hela klassen lyssnar',
        subEn: 'Whole class speaking',
        badgeBg: 'bg-indigo-600 text-white'
    }
};

const DEFAULT_W = 180;
const DEFAULT_H = 130;

export const VolumeCueTool = {
    type: 'volume_cue',
    hasOptions: true,

    createDefault: (id, color = '#f43f5e') => ({
        id,
        type: 'volume_cue',
        x: 600,
        y: 280,
        width: DEFAULT_W,
        height: DEFAULT_H,
        stroke: color,
        rotation: 0,
        opacity: 1,
        volumeLevel: 'quiet'
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv', t }) => {
        const setLevel = (lvl) => {
            setElements(prev => prev.map(o => o.id === el.id ? { ...o, volumeLevel: lvl } : o));
        };

        const currentLvl = el.volumeLevel || 'quiet';

        return (
            <div 
                className="flex items-center gap-2 font-sans font-bold text-sm select-none !text-slate-900" 
                style={{ color: '#0f172a' }}
            >
                {Object.values(LEVELS).map((lvl) => {
                    const isSelected = currentLvl === lvl.id;
                    return (
                        <button
                            key={lvl.id}
                            type="button"
                            onClick={() => setLevel(lvl.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                                isSelected
                                    ? `${lvl.badgeBg} shadow-sm border-transparent`
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <span>{lvl.emoji}</span>
                            <span>{lang === 'sv' ? lvl.sv : lvl.en}</span>
                        </button>
                    );
                })}
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
            setSelectedId = null,
            setInteractionMode = null,
            setIsDrawing = null,
            setDragOffset = null,
            getCoordinates = null
        } = options;

        if (!el) return null;

        const w = Number(el.width) || DEFAULT_W;
        const h = Number(el.height) || DEFAULT_H;
        const config = LEVELS[el.volumeLevel || 'quiet'] || LEVELS.quiet;

        const scale = w / DEFAULT_W;
        const emojiSize = Math.max(36, Math.round(54 * scale));
        const titleFontSize = Math.max(12, Math.round(14 * scale));
        const subFontSize = Math.max(9, Math.round(11 * scale));

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y})`} 
                className="select-none"
            >
                {/* 1. Standardized Tactile Tray Drag Handle */}
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
                        x={w / 2 - 35} 
                        y={-24} 
                        width={70} 
                        height={22} 
                        rx={10} 
                        fill="#f8fafc" 
                        stroke="#cbd5e1" 
                        strokeWidth={1.5}
                        className="group-hover:stroke-indigo-400 group-hover:fill-indigo-50/50 transition-colors shadow-xs" 
                    />
                    <GripHorizontal size={13} className="text-slate-400 group-hover:text-indigo-500 transition-colors" x={w / 2 - 6.5} y={-19.5} />
                </g>

                {/* 2. Floating Content (No Card Rect, No Background Fill) */}
                <foreignObject x={0} y={0} width={w} height={h} className="pointer-events-none overflow-visible">
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 select-none text-center">
                        {/* Big Centered Emoji */}
                        <div 
                            style={{ fontSize: `${emojiSize}px` }} 
                            className="leading-none drop-shadow-md mb-2 filter transition-transform hover:scale-105"
                        >
                            {config.emoji}
                        </div>

                        {/* Status Pill Badge */}
                        <div 
                            className={`px-3.5 py-1 rounded-full shadow-md border ${config.badgeBg} border-white/20 whitespace-nowrap`}
                        >
                            <span 
                                style={{ fontSize: `${titleFontSize}px` }} 
                                className="font-black uppercase tracking-wider block leading-tight font-sans"
                            >
                                {lang === 'sv' ? config.sv : config.en}
                            </span>
                        </div>

                        {/* Subtitle Cue */}
                        {h >= 115 && (
                            <span 
                                style={{ fontSize: `${subFontSize}px` }} 
                                className="text-slate-600 font-black tracking-tight mt-1.5 block font-sans bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs"
                            >
                                {lang === 'sv' ? config.subSv : config.subEn}
                            </span>
                        )}
                    </div>
                </foreignObject>

                {/* 3. Selection Handles (Copy, Move, Delete, and Resize active; Rotation disabled) */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, 0, { canRotate: false })}
                    </g>
                )}
            </g>
        );
    }
};

export default VolumeCueTool;