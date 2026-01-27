import React from 'react';
import { UI_TEXT } from '../../constants/localization';

export const StatsModal = ({ visible, stats, onClose, lang = 'sv', title }) => {
  if (!visible) return null;

  const ui = UI_TEXT;
  const attemptCount = stats.attempted || 0;
  
  // Helper to calculate percentage safely
  const getPct = (val) => attemptCount > 0 ? Math.round((val / attemptCount) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-bounce-in border-4 border-blue-500 text-center">
        
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {title || ui.stats_title[lang]}
        </h3>

        <div className="grid grid-cols-2 gap-4 text-left text-sm mb-8">
            {/* Streak */}
            <div className="text-gray-500 font-medium">{ui.stats_longest_streak[lang]}</div>
            <div className="font-bold text-right text-lg">{stats.maxStreak} 🔥</div>

            {/* Attempted */}
            <div className="text-gray-500 font-medium">{ui.stats_attempted[lang]}</div>
            <div className="font-bold text-right text-lg">{stats.attempted}</div>

            <div className="col-span-2 h-px bg-gray-100 my-1"></div>

            {/* Correct (No Help) */}
            <div className="text-gray-500">{ui.stats_correct_no_help[lang]}</div>
            <div className="font-bold text-right text-green-600">
                {stats.correctNoHelp} ({getPct(stats.correctNoHelp)}%)
            </div>

            {/* Correct (With Help) */}
            <div className="text-gray-500">{ui.stats_correct_help[lang]}</div>
            <div className="font-bold text-right text-yellow-600">
                {stats.correctHelp} ({getPct(stats.correctHelp)}%)
            </div>

            {/* Incorrect */}
            <div className="text-gray-500">{ui.stats_incorrect[lang]}</div>
            <div className="font-bold text-right text-red-600">
                {stats.incorrect} ({getPct(stats.incorrect)}%)
            </div>

            {/* Skipped */}
            <div className="text-gray-500">{ui.stats_skipped[lang]}</div>
            <div className="font-bold text-right text-gray-400">
                {stats.skipped}
            </div>
        </div>

        <button 
            onClick={onClose} 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-lg"
        >
            {ui.stats_close[lang]}
        </button>
      </div>
    </div>
  );
};