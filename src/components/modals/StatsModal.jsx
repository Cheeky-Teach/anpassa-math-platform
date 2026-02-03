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
                                    const stats = topicLevels[lvl];
                                    const total = stats.skipped + stats.incorrect + stats.correctHelp + stats.correctNoHelp;
                                    if (total === 0) return null;

                                    const pSkip = (stats.skipped / total) * 100;
                                    const pWrong = (stats.incorrect / total) * 100;
                                    const pHelp = (stats.correctHelp / total) * 100;
                                    const pCorrect = (stats.correctNoHelp / total) * 100;
                                    const unassistedPct = Math.round(pCorrect);

                                    return (
                                        <div key={lvl} className="flex flex-col gap-1 mb-3 last:mb-0">
                                            <div className="flex justify-between items-center text-xs font-medium text-gray-500 mb-1">
                                                <span>{lang === 'sv' ? 'Nivå' : 'Level'} {lvl}</span>
                                            </div>
                                            <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-200">
                                                {pSkip > 0 && <div style={{ width: `${pSkip}%` }} className="bg-gray-400" />}
                                                {pWrong > 0 && <div style={{ width: `${pWrong}%` }} className="bg-red-500" />}
                                                {pHelp > 0 && <div style={{ width: `${pHelp}%` }} className="bg-yellow-400" />}
                                                {pCorrect > 0 && <div style={{ width: `${pCorrect}%` }} className="bg-green-500" />}
                                            </div>
                                            <div className="flex flex-wrap gap-x-3 text-[10px] text-gray-500 mt-1">
                                                <span className="text-gray-500 font-semibold">{ui.stat_skip}: {stats.skipped}</span>
                                                <span className="text-red-600 font-semibold">{ui.stat_wrong}: {stats.incorrect}</span>
                                                <span className="text-yellow-600 font-semibold">{ui.stat_help}: {stats.correctHelp}</span>
                                                <span className="text-green-600 font-semibold">{ui.stat_correct}: {stats.correctNoHelp}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 italic">
                                                {ui.stat_total}: {total} ({unassistedPct}% unassisted)
                                            </div>
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

const StatsModal = ({ visible, stats, granularStats, ui, onClose, title, lang }) => {
    if (!visible) return null;
    const attemptCount = stats.attempted || 0;
    const getPct = (val) => attemptCount > 0 ? Math.round((val / attemptCount) * 100) : 0;

    return (
        <div className="fixed inset-0 z-[100] flex sm:items-center justify-center sm:p-4 bg-white sm:bg-black/50 sm:backdrop-blur-sm fade-in">
            <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:shadow-2xl sm:max-w-md p-6 relative flex flex-col sm:border-4 sm:border-blue-500 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-2xl font-bold text-gray-900">{title || ui.stats_title}</h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 sm:hidden">✕</button>
                </div>

                <div className="shrink-0 grid grid-cols-2 gap-4 text-left text-sm mb-6">
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

                <button onClick={onClose} className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-lg shrink-0 hidden sm:block">
                    {ui.stats_close}
                </button>
            </div>
        </div>
    );
};

export default StatsModal;