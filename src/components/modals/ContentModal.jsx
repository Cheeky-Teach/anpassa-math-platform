import React, { useState, useMemo } from 'react';
import { CONTENT_MAP } from '../../constants/content_map.generated';
import { X, BookOpen, Layers, Search, Check, Plus } from 'lucide-react';
import MathDisplay from '../shared/MathDisplay';

const ContentModal = ({ 
    visible, 
    onClose, 
    lang = 'sv',
    selectionMode = false,
    selectedItems = [],
    onToggleItem = () => {} 
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Instant O(1) set lookup
    const selectedKeySet = useMemo(() => {
        const set = new Set();
        if (Array.isArray(selectedItems)) {
            selectedItems.forEach(item => {
                const t = item.topic || item.topicId;
                if (t && item.level !== undefined) {
                    set.add(`${t}_${Number(item.level)}`);
                }
            });
        }
        return set;
    }, [selectedItems]);

    if (!visible) return null;

    const TEXT = {
        sv: {
            title: selectionMode ? "Välj Innehåll" : "Innehållskarta",
            subtitle: selectionMode ? "Klicka på rader för att lägga till eller ta bort" : "Heltäckande ämnesöversikt",
            close: "Stäng",
            done: "Klar",
            searchPlaceholder: "Sök ämne, beskrivning eller exempel...",
            noResults: "Inga träffar hittades för",
            selectedCount: "valda nivåer"
        },
        en: {
            title: selectionMode ? "Select Content" : "Content Map",
            subtitle: selectionMode ? "Click rows to add or remove" : "Comprehensive curriculum overview",
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

    const isSelected = (topicId, level) => {
        return selectedKeySet.has(`${topicId}_${Number(level)}`);
    };

    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    const filteredContent = CONTENT_MAP.map(category => {
        const catTitle = (category.title[lang] || category.title || "").toLowerCase();
        const catMatches = catTitle.includes(normalizedSearch);

        const filteredTopics = category.topics.filter(topic => {
            if (catMatches) return true;

            const topicName = (topic.name[lang] || topic.name || "").toLowerCase();
            if (topicName.includes(normalizedSearch)) return true;

            return topic.levels.some(lvl => {
                const desc = (lvl.desc?.[lang] || lvl.desc || "").toLowerCase();
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
                
                {/* Header */}
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

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    {filteredContent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                            <Search size={48} className="opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-wider">{t.noResults} "{searchTerm}"</p>
                        </div>
                    ) : (
                        <div className="columns-1 lg:columns-2 2xl:columns-3 gap-6 space-y-6">
                            {filteredContent.map((category) => {
                                const theme = themeClasses[category.color] || themeClasses.indigo;
                                return (
                                    <div key={category.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden break-inside-avoid">
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

                                        <div className="flex flex-col divide-y divide-slate-100">
                                            {category.topics.map((topic) => (
                                                <div key={topic.id} className="p-4 bg-white">
                                                    <h4 className={`font-black text-xs uppercase tracking-tight mb-2 ${theme.text}`}>
                                                        {topic.name[lang] || topic.name}
                                                    </h4>

                                                    <div className="flex flex-col border border-slate-100 rounded-lg overflow-hidden">
                                                        {topic.levels.map((lvl, index) => {
                                                            const descStr = lvl.desc?.[lang] || lvl.desc || '';
                                                            const rowText = `${descStr} ${lvl.ex}`.toLowerCase();
                                                            const isHighlighted = searchTerm && rowText.includes(normalizedSearch);
                                                            const currentlySelected = selectionMode && isSelected(topic.id, lvl.lvl);

                                                            return (
                                                                <div 
                                                                    key={lvl.lvl}
                                                                    role={selectionMode ? "button" : undefined}
                                                                    tabIndex={selectionMode ? 0 : undefined}
                                                                    onClick={(e) => {
                                                                        if (!selectionMode) return;
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        onToggleItem(topic.id, lvl.lvl);
                                                                    }}
                                                                    className={`group flex items-stretch text-[10px] sm:text-[11px] leading-tight transition-all select-none
                                                                        ${index !== topic.levels.length - 1 ? 'border-b border-slate-100' : ''}
                                                                        ${selectionMode ? 'cursor-pointer active:scale-[0.995]' : ''}
                                                                        ${currentlySelected 
                                                                            ? 'bg-emerald-50 shadow-inner z-10' 
                                                                            : (isHighlighted ? 'bg-indigo-50/50' : 'hover:bg-slate-50')
                                                                        }
                                                                    `}
                                                                >
                                                                    {/* Level Number */}
                                                                    <div className={`w-8 shrink-0 flex items-center justify-center font-black pointer-events-none transition-colors ${currentlySelected ? 'bg-emerald-500 text-white' : `bg-slate-50 border-r border-slate-100 ${theme.text}`}`}>
                                                                        {lvl.lvl}
                                                                    </div>
                                                                    
                                                                    {/* Description */}
                                                                    <div className={`w-1/2 sm:w-2/5 shrink-0 p-2 font-bold border-r border-slate-100 flex items-center pointer-events-none transition-colors ${currentlySelected ? 'text-emerald-900 border-emerald-100' : 'text-slate-700'}`}>
                                                                        {descStr}
                                                                    </div>
                                                                    
                                                                    {/* Math Example */}
                                                                    <div className="flex-1 p-2 font-serif font-bold text-slate-500 italic flex items-center overflow-x-auto no-scrollbar pointer-events-none">
                                                                        {lvl.ex && (
                                                                            lvl.ex.includes('\\') || lvl.ex.includes('$') || lvl.ex.includes('=') ? (
                                                                                <MathDisplay content={lvl.ex.includes('$') ? lvl.ex : `$$${lvl.ex}$$`} className="inline-block pointer-events-none" />
                                                                            ) : (
                                                                                <span className="font-sans not-italic text-[10px] text-slate-600 pointer-events-none">{lvl.ex}</span>
                                                                            )
                                                                        )}
                                                                    </div>

                                                                    {/* Action Indicator */}
                                                                    {selectionMode && (
                                                                        <div className={`w-10 shrink-0 flex items-center justify-center border-l pointer-events-none transition-colors ${currentlySelected ? 'bg-emerald-500 text-white border-emerald-600' : 'border-slate-100 text-slate-300 group-hover:bg-slate-200 group-hover:text-indigo-500 bg-slate-50'}`}>
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