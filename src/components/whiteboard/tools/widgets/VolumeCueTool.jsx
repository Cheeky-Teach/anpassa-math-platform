// src/components/whiteboard/tools/widgets/VolumeCueTool.jsx
import React from 'react';

const LEVELS = {
    quiet: { 
        emoji: '🤫', 
        sv: 'Tyst Arbete', 
        en: 'Quiet Work', 
        textColor: 'text-rose-700',
        pillBg: 'bg-white text-rose-700 border-rose-200'
    },
    whisper: { 
        emoji: '💬', 
        sv: 'Viskröst (Par)', 
        en: 'Whisper (Pair)', 
        textColor: 'text-amber-700',
        pillBg: 'bg-white text-amber-700 border-amber-200'
    },
    discuss: { 
        emoji: '🗣️', 
        sv: 'Diskutera (Grupp)', 
        en: 'Discuss (Group)', 
        textColor: 'text-emerald-700',
        pillBg: 'bg-white text-emerald-700 border-emerald-200'
    }
};

export const VolumeCueTool = {
    type: 'volume_cue',
    hasOptions: true,

    createDefault: (id, color) => ({
        id,
        type: 'volume_cue',
        x: 600,
        y: 300,
        width: 150,
        height: 120,
        stroke: color,
        rotation: 0,
        opacity: 1,
        volumeLevel: 'quiet'
    }),

    renderContextMenu: ({ el, setElements, lang }) => (
        <div className="flex gap-2">
            <button 
                onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, volumeLevel: 'quiet' } : o))} 
                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-colors ${el.volumeLevel === 'quiet' ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
            >
                🤫 {lang === 'sv' ? 'Tyst' : 'Quiet'}
            </button>
            <button 
                onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, volumeLevel: 'whisper' } : o))} 
                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-colors ${el.volumeLevel === 'whisper' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
            >
                💬 {lang === 'sv' ? 'Viska' : 'Whisper'}
            </button>
            <button 
                onClick={() => setElements(p => p.map(o => o.id === el.id ? { ...o, volumeLevel: 'discuss' } : o))} 
                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-colors ${el.volumeLevel === 'discuss' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
            >
                🗣️ {lang === 'sv' ? 'Grupp' : 'Group'}
            </button>
        </div>
    ),

    render: ({ el, lang, transform, showUI, renderHandles }) => {
        const config = LEVELS[el.volumeLevel || 'quiet'];
        const scaleFactor = el.width / 150;

        return (
            <React.Fragment key={el.id}>
                <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                    <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="transparent" />
                    <foreignObject x={el.x} y={el.y} width={el.width} height={el.height} className="pointer-events-none overflow-visible">
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 select-none">
                            <div style={{ fontSize: `${Math.max(32, 52 * scaleFactor)}px` }} className="drop-shadow-sm leading-none inline-block mb-2">
                                {config.emoji}
                            </div>
                            <div className={`px-3 py-1 rounded-full shadow-sm border ${config.pillBg} whitespace-nowrap`}>
                                <div style={{ fontSize: `${Math.max(9, 12 * scaleFactor)}px` }} className="font-black uppercase tracking-widest text-center leading-tight">
                                    {lang === 'sv' ? config.sv : config.en}
                                </div>
                            </div>
                        </div>
                    </foreignObject>
                </g>
                {showUI && renderHandles(el)}
            </React.Fragment>
        );
    }
};