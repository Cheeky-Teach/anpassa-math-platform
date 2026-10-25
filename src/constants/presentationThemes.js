// src/constants/presentationThemes.js
export const PRESENTATION_THEMES = {
    clean: {
        id: 'clean',
        name: { sv: 'Klassisk Ljus', en: 'Classic Light' },
        wrapperClass: 'bg-[#fcfdfa] text-slate-800 border-slate-300',
        cardBg: 'bg-white border-slate-200/90 shadow-sm',
        cardSurface: 'bg-slate-50 border-slate-200',
        textMain: 'text-slate-900',
        textMuted: 'text-slate-500',
        mathText: 'text-slate-950',
        accentText: 'text-indigo-600',
        accentBg: 'bg-indigo-50 border-indigo-200',
        
        // 🟢 High-contrast tokens for active steps
        activeCardBg: 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-200',
        activeMathText: 'text-indigo-950 font-bold',
        activeText: 'text-indigo-950',
        
        insightBox: 'bg-amber-50 border-amber-300 text-amber-950',
        insightTitle: 'text-amber-900 font-black',
        watermarkColor: 'text-slate-400/40',
        gridColor: '#e2e8f0',
        boardBorder: 'border-slate-300'
    },
    dark: {
        id: 'dark',
        name: { sv: 'Fokus Mörk', en: 'Deep Dark' },
        wrapperClass: 'bg-slate-950 text-slate-100 border-slate-800',
        cardBg: 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-inner',
        cardSurface: 'bg-slate-900 border-slate-800',
        textMain: 'text-slate-100',
        textMuted: 'text-slate-400',
        mathText: 'text-slate-200',
        accentText: 'text-emerald-400',
        accentBg: 'bg-emerald-950/60 border-emerald-800/60',
        
        // 🟢 High-contrast tokens for active steps (Pure luminous emerald on dark slate)
        activeCardBg: 'bg-slate-800 border-emerald-400 shadow-lg ring-2 ring-emerald-500/40',
        activeMathText: 'text-emerald-300 font-bold',
        activeText: 'text-white font-bold',
        
        insightBox: 'bg-slate-900 border-amber-500/60 text-amber-100',
        insightTitle: 'text-amber-400 font-black',
        watermarkColor: 'text-slate-600/40',
        gridColor: '#1e293b',
        boardBorder: 'border-slate-800'
    },
    blueprint: {
        id: 'blueprint',
        name: { sv: 'Blåkopia', en: 'Blueprint' },
        wrapperClass: 'bg-[#0b172e] text-sky-100 border-sky-950',
        cardBg: 'bg-[#132342]/95 border-sky-800/80 text-sky-100 shadow-md',
        cardSurface: 'bg-[#0f1d38] border-sky-900/70',
        textMain: 'text-sky-50',
        textMuted: 'text-sky-300/70',
        mathText: 'text-sky-100',
        accentText: 'text-amber-400',
        accentBg: 'bg-sky-900/40 border-sky-700/60',
        
        // 🟢 High-contrast tokens for active steps (Glowing gold / sky white)
        activeCardBg: 'bg-[#1b325f] border-amber-400 shadow-lg ring-2 ring-amber-400/40',
        activeMathText: 'text-amber-300 font-bold',
        activeText: 'text-white font-bold',
        
        insightBox: 'bg-[#152747] border-amber-400/70 text-amber-200',
        insightTitle: 'text-amber-300 font-black',
        watermarkColor: 'text-sky-500/30',
        gridColor: 'rgba(56, 189, 248, 0.15)',
        boardBorder: 'border-sky-900'
    },
    warm: {
        id: 'warm',
        name: { sv: 'Varmt Papper', en: 'Warm Paper' },
        wrapperClass: 'bg-[#f7f4ed] text-stone-800 border-stone-300',
        cardBg: 'bg-[#fdfcf9] border-stone-200 text-stone-900 shadow-sm',
        cardSurface: 'bg-[#f0ece1] border-stone-300',
        textMain: 'text-stone-900',
        textMuted: 'text-stone-600',
        mathText: 'text-stone-950',
        accentText: 'text-amber-800',
        accentBg: 'bg-amber-100/60 border-amber-300',
        
        // 🟢 High-contrast tokens for active steps
        activeCardBg: 'bg-[#fffdfa] border-amber-600 shadow-md ring-2 ring-amber-500/30',
        activeMathText: 'text-amber-950 font-bold',
        activeText: 'text-stone-950 font-bold',
        
        insightBox: 'bg-[#fef9ee] border-amber-400 text-amber-950',
        insightTitle: 'text-amber-900 font-black',
        watermarkColor: 'text-stone-400/40',
        gridColor: '#e7e3d9',
        boardBorder: 'border-stone-300'
    }
};

export const DEFAULT_THEME = 'clean';