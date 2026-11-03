// src/constants/presentationThemes.js

export const PRESENTATION_THEMES = {
    clean: {
        id: 'clean',
        name: { sv: 'Klassisk Ljus', en: 'Classic Light' },
        wrapperClass: 'whiteboard-protect bg-[#fcfdfa] !text-slate-900 border-slate-300',
        cardBg: 'bg-white border-slate-200/90 !text-slate-900 shadow-sm relative z-10',
        cardSurface: 'bg-slate-50 border-slate-200 !text-slate-800',
        textMain: '!text-slate-900',
        textMuted: '!text-slate-600',
        mathText: '!text-slate-950 [&_.katex]:!text-slate-950 [&_.katex-html]:!text-slate-950',
        accentText: 'text-indigo-600',
        accentBg: 'bg-indigo-50 border-indigo-200',
        
        activeCardBg: 'bg-indigo-50/90 border-2 border-indigo-500 border-l-[6px] border-l-indigo-600 !text-indigo-950',
        activeMathText: '!text-indigo-950 font-bold [&_.katex]:!text-indigo-950',
        activeText: '!text-indigo-950 font-bold',
        
        insightBox: 'bg-amber-50 border-amber-300 !text-amber-950 relative z-10',
        insightTitle: '!text-amber-900 font-black',
        watermarkColor: 'text-slate-400/40',
        gridColor: '#e2e8f0',
        boardBorder: 'border-slate-300',

        // Local CSS variables for any child component expecting CSS vars
        cssVars: {
            colorScheme: 'light',
            '--text-main': '#0f172a',
            '--text-muted': '#475569',
            '--bg-card': '#ffffff',
            '--bg-surface': '#f8fafc',
            '--border-main': '#e2e8f0'
        }
    },
    dark: {
        id: 'dark',
        name: { sv: 'Fokus Mörk', en: 'Deep Dark' },
        wrapperClass: 'bg-slate-950 text-slate-100 border-slate-800',
        cardBg: 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-inner relative z-10',
        cardSurface: 'bg-slate-900 border-slate-800 text-slate-200',
        textMain: 'text-slate-100',
        textMuted: 'text-slate-400',
        mathText: 'text-slate-200 [&_.katex]:!text-slate-200 [&_.katex-html]:!text-slate-200',
        accentText: 'text-emerald-400',
        accentBg: 'bg-emerald-950/60 border-emerald-800/60',
        
        activeCardBg: 'bg-slate-800 border-2 border-emerald-400 border-l-[6px] border-l-emerald-500 text-white',
        activeMathText: 'text-emerald-300 font-bold [&_.katex]:!text-emerald-300',
        activeText: 'text-white font-bold',
        
        insightBox: 'bg-slate-900 border-amber-500/60 text-amber-100 relative z-10',
        insightTitle: 'text-amber-400 font-black',
        watermarkColor: 'text-slate-600/40',
        gridColor: '#1e293b',
        boardBorder: 'border-slate-800',

        cssVars: {
            colorScheme: 'dark',
            '--text-main': '#f8fafc',
            '--text-muted': '#94a3b8',
            '--bg-card': '#0f172a',
            '--bg-surface': '#1e293b',
            '--border-main': '#334155'
        }
    },
    blueprint: {
        id: 'blueprint',
        name: { sv: 'Blåkopia', en: 'Blueprint' },
        wrapperClass: 'bg-[#0b172e] text-sky-100 border-sky-950',
        cardBg: 'bg-[#132342]/95 border-sky-800/80 text-sky-100 shadow-md relative z-10',
        cardSurface: 'bg-[#0f1d38] border-sky-900/70 text-sky-200',
        textMain: 'text-sky-50',
        textMuted: 'text-sky-300/70',
        mathText: 'text-sky-100 [&_.katex]:!text-sky-100 [&_.katex-html]:!text-sky-100',
        accentText: 'text-amber-400',
        accentBg: 'bg-sky-900/40 border-sky-700/60',
        
        activeCardBg: 'bg-[#1b325f] border-2 border-amber-400 border-l-[6px] border-l-amber-500 text-white',
        activeMathText: 'text-amber-300 font-bold [&_.katex]:!text-amber-300',
        activeText: 'text-white font-bold',
        
        insightBox: 'bg-[#152747] border-amber-400/70 text-amber-200 relative z-10',
        insightTitle: 'text-amber-300 font-black',
        watermarkColor: 'text-sky-500/30',
        gridColor: 'rgba(56, 189, 248, 0.15)',
        boardBorder: 'border-sky-900',

        cssVars: {
            colorScheme: 'dark',
            '--text-main': '#f0f9ff',
            '--text-muted': '#7dd3fc',
            '--bg-card': '#132342',
            '--bg-surface': '#0f1d38',
            '--border-main': '#075985'
        }
    },
    warm: {
        id: 'warm',
        name: { sv: 'Varmt Papper', en: 'Warm Paper' },
        wrapperClass: 'whiteboard-protect bg-[#f7f4ed] !text-stone-900 border-stone-300',
        cardBg: 'bg-[#fdfcf9] border-stone-200 !text-stone-900 shadow-sm relative z-10',
        cardSurface: 'bg-[#f0ece1] border-stone-300 !text-stone-800',
        textMain: '!text-stone-900',
        textMuted: '!text-stone-600',
        mathText: '!text-stone-950 [&_.katex]:!text-stone-950 [&_.katex-html]:!text-stone-950',
        accentText: 'text-amber-800',
        accentBg: 'bg-amber-100/60 border-amber-300',
        
        activeCardBg: 'bg-[#fffdfa] border-2 border-amber-600 border-l-[6px] border-l-amber-700 !text-stone-950',
        activeMathText: '!text-amber-950 font-bold [&_.katex]:!text-amber-950',
        activeText: '!text-stone-950 font-bold',
        
        insightBox: 'bg-[#fef9ee] border-amber-400 !text-amber-950 relative z-10',
        insightTitle: '!text-amber-900 font-black',
        watermarkColor: 'text-stone-400/40',
        gridColor: '#e7e3d9',
        boardBorder: 'border-stone-300',

        cssVars: {
            colorScheme: 'light',
            '--text-main': '#1c1917',
            '--text-muted': '#57534e',
            '--bg-card': '#fdfcf9',
            '--bg-surface': '#f0ece1',
            '--border-main': '#d6d3d1'
        }
    }
};

export const DEFAULT_THEME = 'clean';