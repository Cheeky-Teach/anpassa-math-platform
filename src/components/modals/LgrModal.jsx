// src/components/modals/LgrModal.jsx
import React, { useState, useEffect } from 'react';
import { X, BookOpen, ExternalLink, Loader2, Layers } from 'lucide-react';

const LgrModal = ({ visible, onClose, ui }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && !data) {
            setLoading(true);
            fetch('/api/curriculum')
                .then(res => res.json())
                .then(d => { setData(d); setLoading(false); })
                .catch(err => { console.error(err); setLoading(false); });
        }
    }, [visible, data]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] text-[var(--text-main)] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-[var(--border-strong)] p-6 relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-[var(--border-main)] mb-5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center shadow-2xs shrink-0">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 block mb-0.5">
                                Skolverket • Lgr22
                            </span>
                            <h3 className="text-base font-extrabold tracking-tight text-[var(--text-main)]">
                                {data ? data.title : "Lgr22"}
                            </h3>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer border border-[var(--border-main)] shadow-2xs"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 bg-[var(--bg-canvas)] p-1">
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader2 size={32} className="animate-spin text-sky-600 dark:text-sky-400" />
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            <p className="text-xs sm:text-sm font-medium text-[var(--text-muted)] border-l-2 border-sky-600 pl-3.5 py-1 leading-relaxed italic bg-[var(--bg-surface)] rounded-r-xl">
                                {data.description}
                            </p>
                            
                            {/* Syfte */}
                            <div className="bg-[var(--bg-card)] p-4 sm:p-5 rounded-xl border border-[var(--border-strong)] shadow-2xs space-y-3">
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400 border-b border-[var(--border-main)] pb-2 flex items-center gap-2">
                                    <Layers size={14} /> Syfte
                                </h4>
                                <ul className="space-y-2">
                                    {data.syfte.map((item, i) => (
                                        <li key={i} className="flex gap-2.5 text-xs text-[var(--text-main)] leading-relaxed font-medium">
                                            <span className="text-sky-600 dark:text-sky-400 font-bold">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Centralt Innehåll */}
                            <div className="bg-[var(--bg-card)] p-4 sm:p-5 rounded-xl border border-[var(--border-strong)] shadow-2xs space-y-3">
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400 border-b border-[var(--border-main)] pb-2 flex items-center gap-2">
                                    <BookOpen size={14} /> Centralt Innehåll (åk 7–9)
                                </h4>
                                <div className="grid gap-4 pt-1">
                                    {data.centralt_innehall && Object.entries(data.centralt_innehall).map(([key, section]) => (
                                        <div key={key} className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)] space-y-1.5 shadow-2xs">
                                            <h5 className="font-bold text-xs uppercase tracking-tight text-[var(--text-main)]">{section.category}</h5>
                                            <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--text-muted)] font-medium">
                                                {section.content.map((c, i) => <li key={i}>{c}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                            Kunde inte ladda informationen.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-5 pt-3.5 border-t border-[var(--border-main)] flex justify-between items-center text-xs shrink-0 bg-[var(--bg-surface)] px-4 rounded-xl">
                    <a 
                        href="https://www.skolverket.se" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1.5"
                    >
                        <span>Källa: Skolverket (Lgr22)</span>
                        <ExternalLink size={13} />
                    </a>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-main)] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                    >
                        Stäng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LgrModal;