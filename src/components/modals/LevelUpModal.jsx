// src/components/modals/LevelUpModal.jsx
import React from 'react';
import { Brain, ArrowUpCircle, RotateCcw } from 'lucide-react';

const LevelUpModal = ({ visible, onNext, onStay, onWordProblems, supportsWordProblems, lang }) => {
    if (!visible) return null;

    const isSv = lang === 'sv';
    
    const title = isSv ? "Nivå avklarad!" : "Level Mastered!";
    const desc = supportsWordProblems 
        ? (isSv ? "Du har bemästrat grunderna! Nu är det dags att testa dina kunskaper i verkliga situationer. Vad vill du göra näst?" : "You've mastered the basics! Now it's time to apply your skills in real-world scenarios. What do you want to do next?")
        : (isSv ? "Snyggt jobbat! Du verkar ha stenkoll på detta. Vad vill du göra näst?" : "Great job! You seem to have this down. What's next?");

    return (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] text-[var(--text-main)] rounded-2xl shadow-2xl border border-[var(--border-strong)] max-w-md w-full p-6 sm:p-8 relative animate-in zoom-in-95 duration-150 flex flex-col gap-5">
                
                {/* Header Section */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
                        🎓
                    </div>
                    <h3 className="text-xl font-extrabold tracking-tight text-[var(--text-main)] mb-1.5">{title}</h3>
                    <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed px-2">{desc}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5">
                    
                    {/* HERO BUTTON: Word Problems */}
                    {supportsWordProblems && (
                        <button 
                            type="button"
                            onClick={onWordProblems} 
                            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-2xs transition-all active:scale-[0.98] flex items-center gap-3.5 cursor-pointer group"
                        >
                            <div className="bg-white/20 p-2 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                                <Brain size={20} />
                            </div>
                            <div className="flex flex-col items-start text-left min-w-0 flex-1">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-100">
                                    {isSv ? "Rekommenderas" : "Recommended"}
                                </span>
                                <span className="text-xs sm:text-sm font-bold leading-tight mt-0.5 truncate">
                                    {isSv ? "Testa problemlösning" : "Try word problems"}
                                </span>
                            </div>
                        </button>
                    )}

                    {/* Standard Next Level Button */}
                    <button 
                        type="button"
                        onClick={onNext} 
                        className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                            supportsWordProblems 
                                ? 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)]' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                    >
                        <ArrowUpCircle size={16} />
                        <span>{isSv ? "Gå till nästa nivå" : "Move to next level"}</span>
                    </button>

                    {/* Stay on current level */}
                    <button 
                        type="button"
                        onClick={onStay} 
                        className="w-full py-2.5 px-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-[var(--border-main)]"
                    >
                        <RotateCcw size={14} />
                        <span>{isSv ? "Stanna på denna nivå" : "Stay on this level"}</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LevelUpModal;