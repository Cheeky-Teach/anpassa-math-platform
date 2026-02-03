import React from 'react';
import { CATEGORIES } from '../../constants/localization';

const LevelBreakdown = ({ granularStats, ui, lang }) => {
    const topics = Object.keys(granularStats);
    if (topics.length === 0) return null;

    return (
        <div className="mt-6 border-t border-gray-100 pt-4 w-full">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                {ui.level_breakdown}
            </h4>
            <div className="space-y-4">
                {topics.map(topicKey => {
                    const topicLevels = granularStats[topicKey];
                    const levels = Object.keys(topicLevels).sort((a, b) => Number(a) - Number(b));

                    let topicLabel = topicKey;
                    for (const catKey in CATEGORIES) {
                        const found = CATEGORIES[catKey].topics.find(t => t.id === topicKey);
                        if (found) {
                            topicLabel = found.label[lang];
                            break;
                        }
                    }

                    return (
                        <div key={topicKey} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <h5 className="font-bold text-gray-700 text-sm mb-2 capitalize">{topicLabel}</h5>
                            <div className="space-y-2">
                                {levels.map(lvl => {
                                    const s = topicLevels[lvl];
                                    const total = s.correct + s.incorrect;
                                    const pct = total > 0 ? Math.round((s.correct / total) * 100) : 0;
                                    const barColor = pct >= 80 ? 'bg-green-500' : (pct >= 50 ? 'bg-yellow-500' : 'bg-red-500');
                                    
                                    return (
                                        <div key={lvl} className="flex items-center text-xs">
                                            <span className="w-6 font-mono text-gray-500">L{lvl}</span>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2 overflow-hidden">
                                                <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }}></div>
                                            </div>
                                            <span className="text-gray-600 w-8 text-right">{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const StatsModal = ({ visible, onClose, stats, granularStats, ui, lang }) => {
    if (!visible) return null;

    const getPct = (val) => stats.attempted > 0 ? Math.round((val / stats.attempted) * 100) : 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
            <div className="bg-white w-full max-w-sm max-h-[90vh] rounded-2xl shadow-2xl relative flex flex-col animate-bounce-in border-t-8 border-blue-500 overflow-hidden">
                
                {/* Header with Close Button */}
                <div className="flex justify-between items-center p-6 pb-2 shrink-0">
                    <h3 className="text-2xl font-bold text-gray-800">{ui.stats_title}</h3>
                    {/* FIX: Added top close button */}
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold">
                        ✕
                    </button>
                </div>

                <div className="p-6 pt-2 overflow-y-auto custom-scrollbar flex-1">
                    <div className="text-center mb-6">
                        <div className="text-4xl mb-2">⏱️</div>
                        <p className="text-gray-500 font-medium">{ui.stats_times_up}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 text-sm border-b border-gray-100 pb-6">
                        <div className="text-gray-500">{ui.stats_longest_streak}</div>
                        <div className="font-bold text-right">{stats.maxStreak} 🔥</div>
                        <div className="text-gray-500">{ui.stats_attempted}</div>
                        <div className="font-bold text-right">{stats.attempted}</div>
                        <div className="text-gray-500">{ui.stats_correct_no_help}</div>
                        <div className="font-bold text-right text-green-600">{stats.correctNoHelp} ({getPct(stats.correctNoHelp)}%)</div>
                        <div className="text-gray-500">{ui.stats_correct_help}</div>
                        <div className="font-bold text-right text-yellow-600">{stats.correctHelp} ({getPct(stats.correctHelp)}%)</div>
                        <div className="text-gray-500">{ui.stats_incorrect}</div>
                        <div className="font-bold text-right text-red-600">{stats.incorrect} ({getPct(stats.incorrect)}%)</div>
                        <div className="text-gray-500">{ui.stats_skipped}</div>
                        <div className="font-bold text-right text-gray-400">{stats.skipped}</div>
                    </div>

                    <LevelBreakdown granularStats={granularStats} ui={ui} lang={lang} />

                    <button onClick={onClose} className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-lg">
                        {ui.stats_close || "Stäng"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsModal;