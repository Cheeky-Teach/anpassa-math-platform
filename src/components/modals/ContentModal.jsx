import React from 'react';
import { CONTENT_MAP } from '../../constants/content_map';
import { X, BookOpen, Layers, ChevronRight } from 'lucide-react';

const ContentModal = ({ visible, onClose, lang = 'sv' }) => {
    if (!visible) return null;

    // --- INTERNAL UI TRANSLATIONS ---
    const TEXT = {
        sv: {
            title: "Innehållskarta",
            subtitle: "Progression och nivåer",
            example: "Ex",
            close: "Stäng"
        },
        en: {
            title: "Content Map",
            subtitle: "Progression and levels",
            example: "Ex",
            close: "Close"
        }
    };

    const t = TEXT[lang] || TEXT.sv;

    // Mapping colors to Tailwind classes for headings and level badges
    const themeClasses = {
        pink: {
            bg: "bg-pink-600",
            text: "text-pink-600",
            light: "bg-pink-50",
            border: "border-pink-100"
        },
        indigo: {
            bg: "bg-indigo-600",
            text: "text-indigo-600",
            light: "bg-indigo-50",
            border: "border-indigo-100"
        },
        amber: {
            bg: "bg-amber-500",
            text: "text-amber-600",
            light: "bg-amber-50",
            border: "border-amber-100"
        },
        rose: {
            bg: "bg-rose-500",
            text: "text-rose-600",
            light: "bg-rose-50",
            border: "border-rose-100"
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Compact Header */}
                <div className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic leading-none">{t.title}</h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{t.subtitle}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 transition-all active:scale-90"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {CONTENT_MAP.map((category) => {
                            const theme = themeClasses[category.color] || themeClasses.indigo;
                            return (
                                <div key={category.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                                    {/* Category Strip */}
                                    <div className={`${theme.bg} px-5 py-2 flex items-center gap-2`}>
                                        <Layers size={14} className="text-white/80" />
                                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">
                                            {category.title[lang]}
                                        </h3>
                                    </div>

                                    <div className="p-4 space-y-5">
                                        {category.topics.map((topic) => (
                                            <div key={topic.id} className="space-y-2">
                                                {/* Topic Small Header */}
                                                <div className="flex items-center gap-2 mb-1 px-1">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${theme.bg}`}></div>
                                                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight italic">
                                                        {topic.name[lang]}
                                                    </span>
                                                </div>

                                                {/* Levels List - Compressed */}
                                                <div className="divide-y divide-slate-50">
                                                    {topic.levels.map((lvl) => (
                                                        <div 
                                                            key={lvl.lvl} 
                                                            className="flex items-center gap-3 py-1.5 px-1 hover:bg-slate-50 transition-colors rounded-lg group"
                                                        >
                                                            <div className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[10px] font-black text-white ${theme.bg}`}>
                                                                {lvl.lvl}
                                                            </div>
                                                            <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2">
                                                                <span className="text-[13px] font-bold text-slate-600 truncate">
                                                                    {lvl.desc[lang]}
                                                                </span>
                                                                <span className="text-[14px] text-slate-800 font-mono italic shrink-0">
                                                                    {t.example}: {lvl.ex}
                                                                </span>
                                                            </div>
                                                            <ChevronRight size={12} className="text-slate-200 opacity-0 group-hover:opacity-100" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-slate-100 p-4 flex justify-end shrink-0">
                    <button 
                        onClick={onClose} 
                        className="px-8 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                    >
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContentModal;