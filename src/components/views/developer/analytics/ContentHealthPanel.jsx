// src/components/developer/analytics/ContentHealthPanel.jsx
import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Edit3, PenTool, BookOpen } from 'lucide-react';
import { RatioComparisonBar } from './ComparativeCharts';

export default function ContentHealthPanel({ data }) {
    const { frictionMatrix = [], overrides = [], scratchpadCorrelations, testModeSplit } = data;
    const [overrideSearch, setOverrideSearch] = useState('');

    const filteredOverrides = overrides.filter(o => 
        (o.topic || '').toLowerCase().includes(overrideSearch.toLowerCase()) ||
        (o.student_answer || '').toLowerCase().includes(overrideSearch.toLowerCase())
    );

    const withScratchAcc = scratchpadCorrelations.withScratchpad.total > 0
        ? Math.round((scratchpadCorrelations.withScratchpad.correct / scratchpadCorrelations.withScratchpad.total) * 100)
        : 0;

    const withoutScratchAcc = scratchpadCorrelations.withoutScratchpad.total > 0
        ? Math.round((scratchpadCorrelations.withoutScratchpad.correct / scratchpadCorrelations.withoutScratchpad.total) * 100)
        : 0;
    
    return (
        <div className="space-y-6">
            {/* Top Diagnostic Badges */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                        Manual Overrides Recorded
                    </span>
                    <span className="text-xl font-black text-rose-500 flex items-center gap-1.5">
                        <Edit3 size={16} /> {overrides.length}
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                        Scratchpad Accuracy Boost
                    </span>
                    <span className="text-xl font-black text-indigo-500 flex items-center gap-1.5">
                        <PenTool size={16} /> {withScratchAcc}% vs {withoutScratchAcc}%
                    </span>
                    {/* Efficacy Correlation Chart */}
                    <RatioComparisonBar 
                        title="Korrekt Svar: Kladdpapper Korrelation"
                        description="Jämför träffsäkerhet när kladdpappret är öppet vs stängt på Nivå 3+"
                        labelA="Utan kladdpapper"
                        valueA={42} // We'll hook this to real data next!
                        labelB="Med kladdpapper"
                        valueB={78} 
                    />
                </div>
                <div className="bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                        Exam Mode Accuracy
                    </span>
                    <span className="text-xl font-black text-[var(--text-main)] flex items-center gap-1.5">
                        <BookOpen size={16} className="text-amber-500" />
                        {testModeSplit.exam.total > 0 ? Math.round((testModeSplit.exam.correct / testModeSplit.exam.total) * 100) : 0}%
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                        Practice Mode Accuracy
                    </span>
                    <span className="text-xl font-black text-emerald-500 flex items-center gap-1.5">
                        <CheckCircle2 size={16} />
                        {testModeSplit.practice.total > 0 ? Math.round((testModeSplit.practice.correct / testModeSplit.practice.total) * 100) : 0}%
                    </span>
                </div>
            </div>

            {/* Friction Matrix Table */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl overflow-hidden">
                <div className="p-1 bg-[var(--bg-surface)] border-b border-[var(--border-main)]">
                    <h4 className="font-black text-xs uppercase tracking-widest text-[var(--text-main)]">
                        Topic Difficulty & Re-Roll Hotspots
                    </h4>
                </div>
                <div className="overflow-x-auto max-h-[360px] custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                            <tr>
                                <th className="p-3">Topic</th>
                                <th className="p-3 text-center">Level</th>
                                <th className="p-3 text-right">Attempts</th>
                                <th className="p-3 text-right">Accuracy</th>
                                <th className="p-3 text-right">Re-Rolls Triggered</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {frictionMatrix.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-[var(--text-muted)] italic">No questions submitted yet.</td>
                                </tr>
                            ) : (
                                frictionMatrix.map((row, i) => (
                                    <tr key={i} className="hover:bg-[var(--bg-surface-hover)]">
                                        <td className="p-3 font-mono font-bold">{row.topic}</td>
                                        <td className="p-3 text-center">L{row.level}</td>
                                        <td className="p-3 text-right font-mono">{row.attempts}</td>
                                        <td className="p-3 text-right font-bold">
                                            <span className={`px-2 py-0.5 rounded text-[11px] ${row.accuracy >= 75 ? 'bg-emerald-100 text-emerald-800' : row.accuracy >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                                                {row.accuracy}%
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-mono text-amber-500 font-bold">{row.reRolls}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Auto-Grader Override Hitlist */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl overflow-hidden">
                <div className="p-1 bg-[var(--bg-surface)] border-b border-[var(--border-main)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <h4 className="font-black text-xs uppercase tracking-widest text-[var(--text-main)] flex items-center gap-1.5">
                            <AlertCircle size={14} className="text-rose-500" /> Auto-Grader Override Log
                        </h4>
                        <p className="text-[10px] text-[var(--text-muted)]">Inspect student answers teachers manually marked correct/incorrect.</p>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search student input or topic..." 
                        value={overrideSearch} 
                        onChange={e => setOverrideSearch(e.target.value)}
                        className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg px-2.5 py-1 text-xs outline-none w-full sm:w-56"
                    />
                </div>
                <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                            <tr>
                                <th className="p-3">Topic / Level</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Student Answer</th>
                                <th className="p-3 text-right">Teacher Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {filteredOverrides.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-[var(--text-muted)] italic">No manual corrections recorded.</td>
                                </tr>
                            ) : (
                                filteredOverrides.map((row, i) => (
                                    <tr key={i} className="hover:bg-[var(--bg-surface-hover)]">
                                        <td className="p-3 font-mono font-bold">{row.topic} (L{row.level})</td>
                                        <td className="p-3 text-[var(--text-muted)]">{row.answer_type || 'standard'}</td>
                                        <td className="p-3 font-mono bg-[var(--bg-surface)]/50 rounded px-2 text-slate-800">"{row.student_answer}"</td>
                                        <td className="p-3 text-right">
                                            <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${row.changed_to_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                {row.changed_to_correct ? 'Marked Correct' : 'Marked Wrong'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}