import React from 'react';
import MathText from '../ui/MathText';

const CluePanel = ({ revealedClues, question, ui, isSolutionRevealed }) => {
    if (!revealedClues || revealedClues.length === 0) return null;

    // We need the total count to identify which clue is the "final" one
    const totalCluesCount = question.clues ? question.clues.length : 0;

    return (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm mb-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-4 text-orange-800 font-bold border-b border-orange-200 pb-2">
                <span>💡 {ui.hintsTitle} ({revealedClues.length}/{totalCluesCount})</span>
            </div>
            <div className="space-y-6">
                {revealedClues.map((clue, i) => {
                    // Identify if this is the absolute last clue in the sequence
                    const isTheFinalClue = i === totalCluesCount - 1;
                    
                    // RESTORED LOGIC: 
                    // Hide the latex box for the final clue unless the solution is unlocked.
                    // This forces the student to perform the final step themselves.
                    const showLatex = !isTheFinalClue || isSolutionRevealed;

                    return (
                        <div key={i} className="group animate-slide-down">
                            {/* 1. Text Description (Always shown) */}
                            <div className="text-sm text-orange-900 mb-2 font-medium leading-relaxed">
                                <MathText text={clue.text} />
                            </div>
                            
                            {/* 2. Math Box (Conditional) */}
                            {clue.latex && showLatex && (
                                <div className="bg-white p-3 rounded-lg border border-orange-200 text-center shadow-sm overflow-x-auto mt-2">
                                    <MathText text={`$${clue.latex}$`} large={true} />
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