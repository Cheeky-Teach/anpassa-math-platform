import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react'; // Changed to a supportive 'Brain' icon to signal problem-solving

export default function WordProblemVisualGuard({ 
    isActive, 
    children, 
    lang = 'sv', 
    questionKey,
    allowReveal = true,
    alwaysShow = false // 🟢 Accepted failsafe structural prop
}) {
    const [reveal, setReveal] = useState(false);

    useEffect(() => {
        setReveal(false);
    }, [questionKey]);

    // 🟢 UI-LEVEL NEVER-HIDE REGISTRY RULE
    const ALWAYS_SHOW_VISUAL_KEYS = [
        'intercept_id',
        'slope_pos_int',
        'slope_pos_frac',
        'slope_neg_int',
        'slope_neg_frac',
        'eq_standard',
        'eq_no_m',
        'eq_horizontal',
        'freq_count',
        'freq_mode'
    ];

    const shouldBypassGuard = alwaysShow || ALWAYS_SHOW_VISUAL_KEYS.includes(questionKey);

    // If the tool is completely turned off, return the default flex container
    if (!isActive) {
        return <div className="w-full h-full flex items-center justify-center">{children}</div>;
    }

    // 🟢 FIXED: If this question is a structural dependency, return the EXACT same absolute container layout 
    // structure as the revealed view state. This prevents canvas grids from collapsing to 0px height!
    if (shouldBypassGuard) {
        return (
            <div className="w-full h-full absolute inset-0 select-none overflow-hidden rounded-[2rem]">
                <div className="w-full h-full flex items-center justify-center p-4 transition-all duration-700 blur-none scale-100 opacity-100">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full absolute inset-0 select-none overflow-hidden rounded-[2rem]">
            {/* 1. THE RENDERING CANVAS LAYER */}
            <div className={`w-full h-full flex items-center justify-center p-4 transition-all duration-700 ${
                !reveal 
                    ? 'blur-3xl scale-75 opacity-0 pointer-events-none' 
                    : 'blur-none scale-100 opacity-100'
            }`}>
                {children}
            </div>

            {/* 2. THE LOCK COVER LAYER */}
            {!reveal && (
                /* 🟢 Master Change: Switched bg-slate-100 to bg-white so it merges perfectly with the parent cell card background */
                <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="max-w-xs text-center space-y-4">
                        
                        {/* Supportive, calm indigo theme icon */}
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto shadow-sm">
                            <Brain size={20} className="animate-pulse" />
                        </div>
                        
                        <div className="space-y-2 px-2">
                            <h4 className="text-m font-black uppercase tracking-wider text-slate-800">
                                {lang === 'sv' ? "Dags att tolka texten!" : "Time to decode the text!"}
                            </h4>
                            
                            {/* 🟢 Encouraging Tip framing instead of rigid assessment enforcement warnings */}
                            <p className="text-[12px] text-slate-600 font-medium leading-relaxed normal-case tracking-normal">
                                {lang === 'sv' 
                                    ? "Läs texten noga. Ett tips är att skissa figuren eller skriva ner talen på ett papper bredvid dig för att se sambandet lättare!" 
                                    : "Read carefully. Try sketching out the diagram or jotting down the numbers on a piece of paper next to you to help unlock the solution!"}
                            </p>
                        </div>
                        
                        {/* Conditional Reveal Toggle option (PracticeView bypass controls) */}
                        {allowReveal ? (
                            <button
                                type="button"
                                onClick={() => setReveal(true)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-[12px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 cursor-pointer shadow-indigo-900/5"
                            >
                                {lang === 'sv' ? "Avslöja figur" : "Reveal Diagram"}
                            </button>
                        ) : (
                            /* 🟢 Softened badge: Replaced "Avstängt" with an inviting, low-stress coaching tag */
                            <span className="inline-block px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-full text-[12px] font-bold tracking-wide select-none">
                                {lang === 'sv' ? "Du kan det här 🎯" : "You've got this 🎯"}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}