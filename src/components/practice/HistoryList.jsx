import React from 'react';
import MathText from '../ui/MathText';
import { UI_TEXT } from '../../constants/localization';

export const HistoryList = ({ history, lang = 'sv' }) => {
  const ui = UI_TEXT;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h2 className="font-bold text-gray-700">{ui.history[lang]}</h2>
        <span className="text-xs text-gray-400">{history.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {history.length === 0 ? (
          <p className="text-gray-400 text-center text-sm py-4">{ui.noHistory[lang]}</p>
        ) : (
          history.map((entry, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-lg border-l-4 text-sm ${
                entry.correct 
                  ? 'border-primary-500 bg-primary-50' 
                  : (entry.skipped ? 'border-gray-400 bg-gray-50' : 'border-red-500 bg-red-50')
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold capitalize text-gray-700">
                   {entry.topic} <span className="text-xs font-normal text-gray-500">(Lvl {entry.level})</span>
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="text-gray-600 mb-1 line-clamp-2">
                <MathText text={entry.text} />
              </div>
              
              {/* Show correct answer if wrong/skipped */}
              {!entry.correct && !entry.skipped && entry.correctAnswer && (
                <div className="text-xs text-red-600 mt-1 font-medium">
                   <MathText text={`Correct: ${entry.correctAnswer}`} />
                </div>
              )}
              
              <div className="mt-2 flex items-center gap-2">
                {entry.clueUsed && (
                  <span className="inline-block px-1.5 py-0.5 bg-accent-100 text-accent-700 text-[10px] rounded uppercase font-bold tracking-wider">
                    {ui.clueUsed[lang]}
                  </span>
                )}
                <span className={`inline-block px-1.5 py-0.5 rounded uppercase font-bold tracking-wider text-[10px] ${
                  entry.correct ? 'bg-green-100 text-green-700' : (entry.skipped ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-700')
                }`}>
                  {entry.correct ? ui.correct[lang].split('!')[0] : (entry.skipped ? ui.stat_skip[lang] : ui.incorrect[lang].split(',')[0])}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};