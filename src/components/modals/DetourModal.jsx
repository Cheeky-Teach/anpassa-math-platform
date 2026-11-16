import React from 'react';
import { Map, Lightbulb, ArrowRight } from 'lucide-react';

export default function DetourModal({ isOpen, onAcceptDetour, onAskCoach, lang = 'sv' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-[var(--border-strong)] animate-in zoom-in-95 duration-150 text-[var(--text-main)]">
                
                <div className="w-12 h-12 bg-[var(--bg-surface)] text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[var(--border-main)]">
                </div>
                
                <h2 className="text-lg font-extrabold tracking-tight text-center text-[var(--text-main)] mb-2">
                    {lang === 'sv' ? "Dags för en paus?" : "Time for a pause?"}
                </h2>
                
                <p className="text-center text-xs sm:text-sm text-[var(--text-muted)] font-medium mb-6 leading-relaxed">
                    {lang === 'sv' 
                        ? "Det verkar lite klurigt! Vill du ha hjälp av Coach för att lösa nästa uppgift, eller ska vi ta en snabb sidoväg och repetera grunderna?" 
                        : "Seems a bit tricky! Do you want Coach to help you solve the next one, or should we take a quick detour to review the basics?"}
                </p>
                
                <div className="flex flex-col gap-2.5">
                    {/* OPTION 1: Primary Forward Action (Coach Help) */}
                    <button 
                        type="button"
                        onClick={onAskCoach}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                        <Lightbulb size={16} />
                        <span>{lang === 'sv' ? "Hjälp mig med denna" : "Help me with this"}</span>
                    </button>

                    {/* OPTION 2: Detour Action */}
                    <button 
                        type="button"
                        onClick={onAcceptDetour}
                        className="w-full py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>{lang === 'sv' ? "Ta en sidoväg (Lättare)" : "Take a detour (Easier)"}</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}