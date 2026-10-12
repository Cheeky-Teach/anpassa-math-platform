import React from 'react';
import { Map, Lightbulb, ArrowRight } from 'lucide-react';

export default function DetourModal({ isOpen, onAcceptDetour, onAskCoach, lang = 'sv' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-card)] rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-[var(--border-main)] animate-in zoom-in-95 duration-200 text-[var(--text-main)]">
                
                <div className="w-16 h-16 bg-[var(--brand-bg)] text-[var(--brand-text)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-[var(--brand-border)]">
                    <Map size={32} />
                </div>
                
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-center text-[var(--text-main)] mb-3">
                    {lang === 'sv' ? "Dags för en paus?" : "Time for a pause?"}
                </h2>
                
                <p className="text-center text-[var(--text-muted)] font-medium mb-8 leading-relaxed">
                    {lang === 'sv' 
                        ? "Det verkar lite klurigt! Vill du ha hjälp av Coach för att lösa nästa uppgift, eller ska vi ta en snabb sidoväg och repetera grunderna?" 
                        : "Seems a bit tricky! Do you want Coach to help you solve the next one, or should we take a quick detour to review the basics?"}
                </p>
                
                <div className="flex flex-col gap-3">
                    {/* OPTION 1: High-Contrast Inverted Button (Theme Safe) */}
                    <button 
                        onClick={onAskCoach}
                        className="w-full h-[52px] bg-[var(--text-main)] text-[var(--bg-card)] rounded-xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Lightbulb size={18} />
                        {lang === 'sv' ? "Hjälp mig med denna" : "Help me with this"}
                    </button>

                    {/* OPTION 2: Standard Surface Button */}
                    <button 
                        onClick={onAcceptDetour}
                        className="w-full h-[52px] bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-main)] rounded-xl font-black uppercase tracking-widest text-sm hover:bg-[var(--bg-surface-hover)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {lang === 'sv' ? "Ta en sidoväg (Lättare)" : "Take a detour (Easier)"}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}