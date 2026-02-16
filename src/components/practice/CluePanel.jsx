import React from 'react';
import MathText from '../ui/MathText';

const CluePanel = ({ revealedClues, question, ui, isSolutionRevealed, lang }) => {
    if (!revealedClues || revealedClues.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-6 text-center px-4">
                <span className="text-xl mb-1 opacity-20">💡</span>
                <p className="text-[9px] uppercase tracking-widest text-slate-300 font-bold italic">
                    {ui.noCluesLabel || (lang === 'sv' ? "Inga ledtrådar än" : "No hints yet")}
                </p>
            </div>
        );
    }

    const totalCluesCount = question?.clues?.length || 0;

    return (
        <div className="animate-fade-in flex flex-col h-full">
            {/* COMPACT HEADER */}
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-orange-100">
                <span className="text-[9px] font-black text-orange-700 uppercase tracking-tighter italic">
                    {ui.hintsTitle || "Ledtrådar"}
                </span>
                <span className="bg-orange-100 text-orange-700 text-[8px] font-black px-1.5 py-0.5 rounded-full">
                    {revealedClues.length} / {totalCluesCount}
                </span>
            </div>

            {/* CLUE LIST */}
            <div className="space-y-5 overflow-y-auto pr-1 custom-scrollbar">
                {revealedClues.map((clue, i) => {
                    // 1. DEFENSIVE DATA EXTRACTION
                    // This handles { text: "" }, { sv: "" }, or just a string ""
                    let textContent = "";
                    if (typeof clue === 'object') {
                        textContent = clue.text || clue[lang] || clue.sv || clue.en || "";
                    } else {
                        textContent = clue;
                    }

                    const latexContent = typeof clue === 'object' ? clue.latex : null;
                    const isTheFinalClue = i === totalCluesCount - 1;
                    const showLatex = !isTheFinalClue || isSolutionRevealed;

                    return (
                        <div key={i} className="group animate-slide-down border-l-2 border-orange-200 pl-3">
                            {/* Step Indicator */}
                            <div className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-1">
                                {lang === 'sv' ? 'Steg' : 'Step'} {i + 1}
                            </div>

                            {/* 2. PEDAGOGICAL DESCRIPTION */}
                            {textContent && (
                                <div className="text-[11px] sm:text-xs text-slate-700 font-medium leading-relaxed mb-2 break-words">
                                    {/* If text contains math symbols, use MathText. Otherwise, use a standard span */}
                                    {textContent.includes('$') || textContent.includes('\\') ? (
                                        <MathText text={textContent} />
                                    ) : (
                                        <span>{textContent}</span>
                                    )}
                                </div>
                            )}
                            
                            {/* 3. MATHEMATICAL VISUAL (Mathbox) */}
                            {latexContent && (
                                <div className={`transition-all duration-500 ${showLatex ? 'opacity-100' : 'opacity-40 grayscale blur-[1px]'}`}>
                                    <div className="bg-orange-50/50 p-2 rounded-lg border border-orange-100 text-center shadow-sm overflow-x-auto min-h-[36px] flex items-center justify-center">
                                        {showLatex ? (
                                            <div className="scale-90 origin-center">
                                                {/* Ensure LaTeX is wrapped in $ delimiters */}
                                                <MathText text={latexContent.includes('$') ? latexContent : `$${latexContent}$`} />
                                            </div>
                                        ) : (
                                            <div className="text-[8px] text-orange-400 font-black italic uppercase tracking-tighter">
                                                {lang === 'sv' ? "Lös steget för att se svar" : "Solve step to see answer"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CluePanel;