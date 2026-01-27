import React from 'react';
import MathText from '../ui/MathText';
import { UI_TEXT } from '../../constants/localization';

export const CluePanel = ({ revealedClues, totalClues, ui, lang = 'sv', isSolutionRevealed }) => {
  if (!revealedClues || revealedClues.length === 0) return null;

  return (
    <div className="bg-accent-50 border border-accent-200 rounded-xl p-5 shadow-sm mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-4 text-accent-800 font-bold border-b border-accent-200 pb-2">
        <span>💡 {ui.hintsTitle[lang]} ({revealedClues.length}/{totalClues})</span>
      </div>
      
      <div className="space-y-6">
        {revealedClues.map((clue, i) => {
          // Logic: Only show the big LaTeX box for the *current* clue, unless solution is fully revealed
          const isLast = i === totalClues - 1; 
          // const showLatex = !isLast || isSolutionRevealed; // Legacy logic variation
          
          return (
            <div key={i} className="group animate-slide-down">
              <div className="text-sm text-accent-900 mb-2 font-medium leading-relaxed">
                <MathText text={clue.text} />
              </div>
              {clue.latex && (
                <div className="bg-white p-3 rounded-lg border border-accent-200 text-center shadow-sm overflow-x-auto">
                  <MathText text={`$${clue.latex}$`} className="text-lg" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};