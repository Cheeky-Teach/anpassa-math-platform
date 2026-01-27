import React from 'react';
import MathText from '../ui/MathText';

const CluePanel = ({ revealedClues, question, ui, isSolutionRevealed }) => {
    if (!revealedClues || revealedClues.length === 0) return null;

    return (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm mb-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-4 text-orange-800 font-bold border-b border-orange-200 pb-2">
                <span>💡 {ui.hintsTitle} ({revealedClues.length}/{question.clues.length})</span>
            </div>
            <div className="space-y-6">
                {revealedClues.map((clue, i) => {
                    const isLast = i === question.clues.length - 1;
                    // Show LaTeX block only for the latest clue, or all if solution is revealed
                    const showLatex = !isLast || isSolutionRevealed;
                    
                    return (
                        <div key={i} className="group animate-slide-down">
                            <div className="text-sm text-orange-900 mb-2 font-medium leading-relaxed">
                                <MathText text={clue.text} />
                            </div>
                            {clue.latex && showLatex && (
                                <div className="bg-white p-3 rounded-lg border border-orange-200 text-center shadow-sm overflow-x-auto">
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