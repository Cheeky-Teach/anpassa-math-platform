// src/components/modals/ContentModal.jsx
import React, { useState, useMemo } from 'react';
import { CONTENT_MAP } from '../../constants/content_map.generated';
import { X, BookOpen, Layers, Search, Check, Plus } from 'lucide-react';
import MathDisplay from '../shared/MathDisplay';
import VisualRenderer from '../visuals/VisualRenderer';

const ContentModal = ({ 
    visible, 
    onClose, 
    lang = 'sv',
    selectionMode = false,
    selectedItems = [],
    onToggleItem = () => {} 
}) => {
    const [searchTerm, setSearchTerm] = useState('');

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
        pink: { bg: "bg-pink-600 text-white", text: "text-pink-950 font-extrabold", border: "border-pink-200" },
        indigo: { bg: "bg-indigo-600 text-white", text: "text-indigo-950 font-extrabold", border: "border-indigo-200" },
        emerald: { bg: "bg-emerald-600 text-white", text: "text-emerald-950 font-extrabold", border: "border-emerald-200" },
        cyan: { bg: "bg-cyan-600 text-white", text: "text-cyan-950 font-extrabold", border: "border-cyan-200" },
        amber: { bg: "bg-amber-600 text-white", text: "text-amber-950 font-extrabold", border: "border-amber-200" },
        rose: { bg: "bg-rose-600 text-white", text: "text-rose-950 font-extrabold", border: "border-rose-200" }
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
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans">
            <div className="content-modal-protect bg-white text-slate-900 w-full max-w-[1400px] h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shrink-0 shadow-2xs z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs shrink-0 ${selectionMode ? 'bg-emerald-600' : 'bg-slate-900'}`}>
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">{t.title}</h2>
                            <p className={`text-[11px] font-semibold mt-1 ${selectionMode ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {t.subtitle}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1 sm:max-w-md ml-auto">
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input 
                                type="text"
                                placeholder={t.searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-600 transition-colors shadow-inner"
                            />
                            {searchTerm && (
                                <button 
                                    type="button"
                                    onClick={() => setSearchTerm('')} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 cursor-pointer"
                                >
                                    <X size={14} strokeWidth={3} />
                                </button>
                            )}
                        </div>
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="p-1.5 shrink-0 flex items-center justify-center rounded-xl bg-white text-slate-500 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            <X size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-100/70">
                    {filteredContent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                            <Search size={40} className="opacity-30" />
                            <p className="text-xs font-bold uppercase tracking-wider">{t.noResults} "{searchTerm}"</p>
                        </div>
                    ) : (
                        <div className="columns-1 lg:columns-2 2xl:columns-3 gap-5 space-y-5">
                            {filteredContent.map((category) => {
                                const theme = themeClasses[category.color] || themeClasses.indigo;
                                return (
                                    <div key={category.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden break-inside-avoid">
                                        <div className={`${theme.bg} px-4 py-2.5 flex items-center justify-between`}>
                                            <div className="flex items-center gap-2.5">
                                                <Layers size={15} className="text-white/90" />
                                                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                                                    {category.title[lang] || category.title}
                                                </h3>
                                            </div>
                                            <span className="text-white/90 text-[10px] font-bold font-mono uppercase bg-black/15 px-2 py-0.5 rounded">
                                                {category.topics.length} {lang === 'sv' ? 'områden' : 'topics'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col divide-y divide-slate-100 bg-white">
                                            {category.topics.map((topic) => (
                                                <div key={topic.id} className="p-3.5 bg-white">
                                                    <h4 className={`font-bold text-xs uppercase tracking-tight mb-2 text-slate-900`}>
                                                        {topic.name[lang] || topic.name}
                                                    </h4>

                                                    <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
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
                                                                    className={`group flex items-stretch text-xs leading-snug transition-colors select-none ${
                                                                        index !== topic.levels.length - 1 ? 'border-b border-slate-200' : ''
                                                                    } ${selectionMode ? 'cursor-pointer active:scale-[0.995]' : ''} ${
                                                                        currentlySelected 
                                                                            ? 'bg-emerald-50 text-slate-900 shadow-inner z-10' 
                                                                            : (isHighlighted ? 'bg-sky-50 text-slate-900' : 'hover:bg-slate-100/80 text-slate-900')
                                                                    }`}
                                                                >
                                                                    {/* Level Number */}
                                                                    <div className={`w-8 shrink-0 flex items-center justify-center font-bold font-mono pointer-events-none transition-colors ${
                                                                        currentlySelected 
                                                                            ? 'bg-emerald-600 text-white' 
                                                                            : 'bg-white border-r border-slate-200 text-slate-700'
                                                                    }`}>
                                                                        {lvl.lvl}
                                                                    </div>
                                                                    
                                                                    {/* Description */}
                                                                    <div className="w-1/2 sm:w-2/5 shrink-0 p-2.5 font-semibold border-r border-slate-200 flex items-center pointer-events-none text-slate-800">
                                                                        {descStr}
                                                                    </div>
                                                                    
                                                                    {/* Math Example or Visual Preview */}
                                                                    <div className="flex-1 p-2.5 font-serif font-semibold text-slate-700 italic flex items-center justify-center min-w-0 overflow-hidden pointer-events-none">
                                                                        {lvl.renderData && (lvl.renderData.graph || lvl.renderData.geometry || lvl.renderData.pattern || lvl.renderData.marbles) ? (
                                                                            <div className="max-h-[70px] max-w-[140px] scale-75 origin-center flex items-center justify-center">
                                                                                <VisualRenderer data={lvl.renderData} isWordProblem={false} />
                                                                            </div>
                                                                        ) : lvl.ex ? (
                                                                            lvl.ex.includes('$') || lvl.ex.includes('\\') ? (
                                                                                <MathDisplay content={lvl.ex} className="inline-block pointer-events-none text-slate-950 truncate max-w-full text-xs" />
                                                                            ) : (
                                                                                <span className="not-italic font-sans text-slate-800 font-medium text-xs truncate max-w-full">
                                                                                    {lvl.ex}
                                                                                </span>
                                                                            )
                                                                        ) : null}
                                                                    </div>

                                                                    {/* Action Indicator */}
                                                                    {selectionMode && (
                                                                        <div className={`w-9 shrink-0 flex items-center justify-center border-l pointer-events-none transition-colors ${
                                                                            currentlySelected 
                                                                                ? 'bg-emerald-600 text-white border-emerald-700' 
                                                                                : 'border-slate-200 text-slate-400 group-hover:bg-slate-100 group-hover:text-emerald-600 bg-white'
                                                                        }`}>
                                                                            {currentlySelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={2.5} />}
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
                <div className={`border-t border-slate-200 px-6 py-3.5 flex justify-between items-center shrink-0 ${selectionMode ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                    <div className="w-1/2">
                        {selectionMode && (
                            <div className="flex items-center gap-2">
                                <span className="bg-emerald-600 text-white font-bold font-mono text-xs px-2.5 py-1 rounded-lg">
                                    {selectedItems.length}
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 hidden sm:block">
                                    {t.selectedCount}
                                </span>
                            </div>
                        )}
                    </div>

                    <button 
                        type="button"
                        onClick={onClose} 
                        className={`px-8 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-2xs ${
                            selectionMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-900 hover:bg-emerald-600 text-white'
                        }`}
                    >
                        {selectionMode ? t.done : t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContentModal;