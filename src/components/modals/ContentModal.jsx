import React, { useState } from 'react';
import { CONTENT_MAP } from '../../constants/content_map.generated';
import { X, BookOpen, Layers, Search, Check, Plus } from 'lucide-react';
import MathDisplay from '../shared/MathDisplay';
import MathText from '../ui/MathText';

const ContentModal = ({ 
    visible, 
    onClose, 
    lang = 'sv',
    // --- NEW SELECTION MODE PROPS ---
    selectionMode = false,
    selectedItems = [], // Array of { topic: '...', level: 1 }
    onToggleItem = () => {} 
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!visible) return null;

    const TEXT = {
        sv: {
            title: selectionMode ? "Välj Innehåll" : "Innehållskarta",
            subtitle: selectionMode ? "Klicka på rader för att lägga till i uppdraget" : "Heltäckande ämnesöversikt",
            close: "Stäng",
            done: "Klar",
            searchPlaceholder: "Sök ämne, beskrivning eller exempel...",
            noResults: "Inga träffar hittades för",
            selectedCount: "valda nivåer"
        },
        en: {
            title: selectionMode ? "Select Content" : "Content Map",
            subtitle: selectionMode ? "Click rows to add them to your mission" : "Comprehensive curriculum overview",
            close: "Close",
            done: "Done",
            searchPlaceholder: "Search topic, description or example...",
            noResults: "No results found for",
            selectedCount: "levels selected"
        }
    };

    const t = TEXT[lang] || TEXT.sv;

    const themeClasses = {
        pink: { bg: "bg-pink-600", text: "text-pink-700", border: "border-pink-200" },
        indigo: { bg: "bg-indigo-600", text: "text-indigo-700", border: "border-indigo-200" },
        amber: { bg: "bg-amber-500", text: "text-amber-700", border: "border-amber-200" },
        rose: { bg: "bg-rose-500", text: "text-rose-700", border: "border-rose-200" }
    };

    // Helper to check if a specific level is currently selected
    const isSelected = (topicId, level) => {
        return selectedItems.some(item => item.topic === topicId && item.level === level);
    };

    // --- SMART FILTER LOGIC ---
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    const filteredContent = CONTENT_MAP.map(category => {
        const catTitle = (category.title[lang] || category.title || "").toLowerCase();
        const catMatches = catTitle.includes(normalizedSearch);

        const filteredTopics = category.topics.filter(topic => {
            if (catMatches) return true;

            const topicName = (topic.name[lang] || topic.name || "").toLowerCase();
            if (topicName.includes(normalizedSearch)) return true;

            return topic.levels.some(lvl => {
                const desc = (lvl.desc[lang] || lvl.desc || "").toLowerCase();
                const ex = (lvl.ex || "").toLowerCase();
                return desc.includes(normalizedSearch) || ex.includes(normalizedSearch);
            });
        });

        return {
            ...category,
            topics: filteredTopics
        };
    }).filter(category => category.topics.length > 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-50 w-full max-w-[1600px] h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header with Search */}
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 ${selectionMode ? 'bg-indigo-600' : 'bg-slate-900'}`}>
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic leading-none">{t.title}</h2>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${selectionMode ? 'text-indigo-500' : 'text-slate-500'}`}>
                                {t.subtitle}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1 sm:max-w-md ml-auto">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text"
                                placeholder={t.searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={14} strokeWidth={3} />
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-white hover:bg-rose-500 transition-all active:scale-90"
                        >
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area - High Density Masonry Grid */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    {filteredContent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                            <Search size={48} className="opacity-20" />
                            {/* VARIATIONS LIST */}
                {lvl.variations && lvl.variations.length > 0 ? (
                    <div className="flex flex-col gap-2 mt-3">
                        {lvl.variations.map((v, idx) => (
                            <div key={idx} className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-subtle)]">
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">
                                    {v.name.sv || v.name}
                                </span>
                                <div className="text-sm font-sans text-[var(--brand-text)] flex justify-center text-center">
                                    {/* If v.ex is just text (like word problems), MathText handles it gracefully too */}
                                    <MathText text={v.ex.includes('\\') && !v.ex.includes('$$') ? `$$${v.ex}$$` : v.ex} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-3 text-center text-sm font-sans text-[var(--brand-text)]">
                        <MathText text={lvl.ex.includes('\\') && !lvl.ex.includes('$$') ? `$$${lvl.ex}$$` : lvl.ex} />
                    </div>
                )}
                        </div>
                    ) : (
                        <div className="columns-1 lg:columns-2 2xl:columns-3 gap-6 space-y-6">
                            {filteredContent.map((category) => {
                                const theme = themeClasses[category.color] || themeClasses.indigo;
                                return (
                                    <div key={category.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden break-inside-avoid">
                                        
                                        {/* Category Strip */}
                                        <div className={`${theme.bg} px-5 py-2.5 flex items-center justify-between`}>
                                            <div className="flex items-center gap-3">
                                                <Layers size={16} className="text-white/80" />
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                                    {category.title[lang] || category.title}
                                                </h3>
                                            </div>
                                            <span className="text-white/70 text-[9px] font-black tracking-widest uppercase bg-black/10 px-2 py-0.5 rounded-md">
                                                {category.topics.length} {lang === 'sv' ? 'Områden' : 'Topics'}
                                            </span>
                                        </div>

                                        {/* Flat Topics List */}
                                        <div className="flex flex-col divide-y divide-slate-100">
                                            {category.topics.map((topic) => (
                                                <div key={topic.id} className="p-4 bg-white">
                                                    {/* Topic Header */}
                                                    <h4 className={`font-black text-xs uppercase tracking-tight mb-2 ${theme.text}`}>
                                                        {topic.name[lang] || topic.name}
                                                    </h4>

                                                    {/* Dense Level Rows */}
                                                    <div className="flex flex-col border border-slate-100 rounded-lg overflow-hidden">
                                                        {topic.levels.map((lvl, index) => {
                                                            const rowText = `${lvl.desc[lang] || lvl.desc} ${lvl.ex}`.toLowerCase();
                                                            const isHighlighted = searchTerm && rowText.includes(normalizedSearch);
                                                            
                                                            // Logic for Selection Mode
                                                            const currentlySelected = selectionMode && isSelected(topic.id, lvl.lvl);

                                                            return (
                                                                <div 
                                                                    key={lvl.lvl}
                                                                    onClick={() => selectionMode && onToggleItem(topic.id, lvl.lvl)}
                                                                    className={`group flex items-stretch text-[10px] sm:text-[11px] leading-tight transition-all
                                                                        ${index !== topic.levels.length - 1 ? 'border-b border-slate-100' : ''}
                                                                        ${selectionMode ? 'cursor-pointer' : ''}
                                                                        ${currentlySelected 
                                                                            ? 'bg-emerald-50 shadow-inner z-10' 
                                                                            : (isHighlighted ? 'bg-indigo-50/50' : 'hover:bg-slate-50')
                                                                        }
                                                                    `}
                                                                >
                                                                    {/* Level Number */}
                                                                    <div className={`w-8 shrink-0 flex items-center justify-center font-black transition-colors ${currentlySelected ? 'bg-emerald-500 text-white' : `bg-slate-50 border-r border-slate-100 ${theme.text}`}`}>
                                                                        {lvl.lvl}
                                                                    </div>
                                                                    
                                                                    {/* Description */}
                                                                    <div className={`w-1/2 sm:w-2/5 shrink-0 p-2 font-bold border-r border-slate-100 flex items-center transition-colors ${currentlySelected ? 'text-emerald-900 border-emerald-100' : 'text-slate-700'}`}>
                                                                        {lvl.desc[lang] || lvl.desc}
                                                                    </div>
                                                                    
                                                                    {/* Math Example */}
                                                                    <div className="flex-1 p-2 font-serif font-bold text-slate-500 italic flex items-center overflow-x-auto no-scrollbar">
                                                                        {lvl.ex && (
                                                                            lvl.ex.includes('\\') || lvl.ex.includes('$') || lvl.ex.includes('=') ? (
                                                                                <MathDisplay content={lvl.ex.includes('$') ? lvl.ex : `$$${lvl.ex}$$`} className="inline-block" />
                                                                            ) : (
                                                                                <span className="font-sans not-italic text-[10px] text-slate-600">{lvl.ex}</span>
                                                                            )
                                                                        )}
                                                                    </div>

                                                                    {/* Selection Mode Interactive Indicator */}
                                                                    {selectionMode && (
                                                                        <div className={`w-10 shrink-0 flex items-center justify-center border-l transition-colors ${currentlySelected ? 'bg-emerald-500 text-white border-emerald-600' : 'border-slate-100 text-slate-300 group-hover:bg-slate-200 group-hover:text-indigo-500 bg-slate-50'}`}>
                                                                            {currentlySelected ? <Check size={16} strokeWidth={4} /> : <Plus size={16} strokeWidth={3} />}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`border-t border-slate-200 p-4 flex justify-between items-center shrink-0 ${selectionMode ? 'bg-indigo-50' : 'bg-white'}`}>
                    {/* Left side: Selection counter (only visible in selection mode) */}
                    <div className="w-1/2">
                        {selectionMode && (
                            <div className="flex items-center gap-2">
                                <span className="bg-indigo-600 text-white font-black text-xs px-2.5 py-1 rounded-lg">
                                    {selectedItems.length}
                                </span>
                                <span className="text-[10px] font-black uppercase text-indigo-800 tracking-widest hidden sm:block">
                                    {t.selectedCount}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right side: Close / Done Button */}
                    <button 
                        onClick={onClose} 
                        className={`px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 w-full sm:w-auto shadow-md
                            ${selectionMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 hover:bg-indigo-600 text-white'}
                        `}
                    >
                        {selectionMode ? t.done : t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContentModal;