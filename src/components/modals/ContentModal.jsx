import React from 'react';
import { CONTENT_MAP } from '../../constants/content_map';
import { X, BookOpen, Layers, Target, ChevronRight } from 'lucide-react';

const ContentModal = ({ visible, onClose, lang = 'sv' }) => {
    if (!visible) return null;

    // --- INTERNAL UI TRANSLATIONS ---
    const TEXT = {
        sv: {
            title: "Innehållskarta",
            subtitle: "Översikt över alla områden, nivåer och progression",
            level: "Nivå",
            example: "Exempel",
            close: "Stäng"
        },
        en: {
            title: "Content Map",
            subtitle: "Overview of all topics, levels, and progression",
            level: "Level",
            example: "Example",
            close: "Close"
        }
    };

    const t = TEXT[lang] || TEXT.sv;

    const colorClasses = {
        pink: "bg-pink-50 text-pink-600 border-pink-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                
                {/* Header */}
                <div className="bg-white border-b border-slate-100 p-8 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">{t.title}</h2>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">{t.subtitle}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {CONTENT_MAP.map((category) => (
                            <div key={category.id} className="space-y-6">
                                {/* Category Header */}
                                <div className="flex items-center gap-3 px-2">
                                    <Layers size={18} className="text-slate-400" />
                                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">
                                        {category.title[lang]}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {category.topics.map((topic) => (
                                        <div key={topic.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                                            {/* Topic Name */}
                                            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                                <span className="font-black text-slate-700 uppercase tracking-tight italic">
                                                    {topic.name[lang]}
                                                </span>
                                                <Target size={16} className="text-slate-300" />
                                            </div>

                                            {/* Levels List */}
                                            <div className="p-4 space-y-2">
                                                {topic.levels.map((lvl) => (
                                                    <div 
                                                        key={lvl.lvl} 
                                                        className="group flex items-start gap-4 p-3 rounded-2xl hover:bg-indigo-50/30 transition-colors border border-transparent hover:border-indigo-100"
                                                    >
                                                        <div className={`w-8 h-8 shrink-0 rounded-xl border flex items-center justify-center text-xs font-black shadow-sm ${colorClasses[category.color] || colorClasses.emerald}`}>
                                                            {lvl.lvl}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                                {lvl.desc[lang]}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[12px] font-black text-slate-300 uppercase tracking-widest">{t.example}:</span>
                                                                <code className="text-[14px] font-mono font-bold text-indigo-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                                                    {lvl.ex}
                                                                </code>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={14} className="mt-1 text-slate-200 group-hover:text-indigo-200 transition-colors" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-slate-100 p-6 flex justify-end shrink-0">
                    <button 
                        onClick={onClose} 
                        className="px-10 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
                    >
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContentModal;