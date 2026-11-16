// src/components/modals/StatsModal.jsx
import React from 'react';
import { CATEGORIES } from '../../constants/localization';
import { X, BarChart3 } from 'lucide-react';

const LevelBreakdown = ({ granularStats, ui, lang }) => {
    const topics = Object.keys(granularStats || {});
    if (topics.length === 0) return null;

    return (
        <div className="mt-5 border-t border-[var(--border-main)] pt-5 w-full">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                {ui?.level_breakdown || "Level Breakdown"}
            </h4>
            <div className="space-y-3">
                {topics.map(topicKey => {
                    const topicLevels = granularStats[topicKey];
                    const levels = Object.keys(topicLevels).sort((a, b) => Number(a) - Number(b));

                    let topicLabel = topicKey;
                    for (const catKey in CATEGORIES) {
                        const found = CATEGORIES[catKey]?.topics?.find(t => t.id === topicKey);
                        if (found) {
                            topicLabel = found.label?.[lang] || found.label?.sv;
                            break;
                        }
                    }

                    return (
                        <div key={topicKey} className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-strong)] shadow-2xs">
                            <h5 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-tight mb-2">{topicLabel}</h5>
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
                                        <div key={lvl} className="flex flex-col gap-1 mb-2.5 last:mb-0">
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                                                <span>{lang === 'sv' ? 'Nivå' : 'Level'} {lvl}</span>
                                                <span className="font-mono text-[var(--text-main)]">{total} {lang === 'sv' ? 'st' : 'total'} ({unassistedPct}%)</span>
                                            </div>
                                            <div className="flex w-full h-2 rounded-lg overflow-hidden bg-[var(--bg-card)] border border-[var(--border-main)]">
                                                {pSkip > 0 && <div style={{ width: `${pSkip}%` }} className="bg-slate-400" />}
                                                {pWrong > 0 && <div style={{ width: `${pWrong}%` }} className="bg-rose-500" />}
                                                {pHelp > 0 && <div style={{ width: `${pHelp}%` }} className="bg-amber-500" />}
                                                {pCorrect > 0 && <div style={{ width: `${pCorrect}%` }} className="bg-emerald-600" />}
                                            </div>
                                            <div className="flex flex-wrap gap-x-3 text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                                                <span>{ui?.stat_skip || "Skipped"}: {stats.skipped}</span>
                                                <span className="text-rose-600 font-bold">{ui?.stat_wrong || "Wrong"}: {stats.incorrect}</span>
                                                <span className="text-amber-600 font-bold">{ui?.stat_help || "Help"}: {stats.correctHelp}</span>
                                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{ui?.stat_correct || "Correct"}: {stats.correctNoHelp}</span>
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
    const attemptCount = stats?.attempted || 0;
    const getPct = (val) => attemptCount > 0 ? Math.round((val / attemptCount) * 100) : 0;

    return (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] text-[var(--text-main)] w-full max-w-md h-auto max-h-[90vh] rounded-2xl shadow-2xl border border-[var(--border-strong)] p-6 relative flex flex-col overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center pb-4 border-b border-[var(--border-main)] mb-5 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
                            <BarChart3 size={18} />
                        </div>
                        <h3 className="text-base font-extrabold tracking-tight text-[var(--text-main)]">{title || ui?.stats_title || "Statistics"}</h3>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="shrink-0 grid grid-cols-2 gap-y-3 gap-x-4 text-xs mb-5 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-strong)] shadow-2xs">
                    <div className="text-[var(--text-muted)] font-bold">{ui?.stats_longest_streak || "Longest Streak"}</div>
                    <div className="font-mono font-bold text-right text-[var(--text-main)]">{stats?.maxStreak || 0} 🔥</div>
                    
                    <div className="text-[var(--text-muted)] font-bold">{ui?.stats_attempted || "Attempted"}</div>
                    <div className="font-mono font-bold text-right text-[var(--text-main)]">{stats?.attempted || 0}</div>
                    
                    <div className="text-[var(--text-muted)] font-bold">{ui?.stats_correct_no_help || "Correct (No Help)"}</div>
                    <div className="font-mono font-bold text-right text-emerald-700 dark:text-emerald-400">{stats?.correctNoHelp || 0} ({getPct(stats?.correctNoHelp || 0)}%)</div>
                    
                    <div className="text-[var(--text-muted)] font-bold">{ui?.stats_correct_help || "Correct (With Help)"}</div>
                    <div className="font-mono font-bold text-right text-amber-600">{stats?.correctHelp || 0} ({getPct(stats?.correctHelp || 0)}%)</div>
                    
                    <div className="text-[var(--text-muted)] font-bold">{ui?.stats_incorrect || "Incorrect"}</div>
                    <div className="font-mono font-bold text-right text-rose-600">{stats?.incorrect || 0} ({getPct(stats?.incorrect || 0)}%)</div>
                    
                    <div className="text-[var(--text-muted)] font-bold">{ui?.stats_skipped || "Skipped"}</div>
                    <div className="font-mono font-bold text-right text-[var(--text-muted)]">{stats?.skipped || 0}</div>
                </div>

                <LevelBreakdown granularStats={granularStats} ui={ui} lang={lang} />

                <button 
                    type="button"
                    onClick={onClose} 
                    className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-2xs transition-all active:scale-[0.98] cursor-pointer shrink-0"
                >
                    {ui?.stats_close || "Close"}
                </button>
            </div>
        </div>
    );
};

export default StatsModal;