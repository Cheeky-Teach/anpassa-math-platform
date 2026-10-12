// src/components/developer/analytics/ClassroomDynamicsPanel.jsx
import React from 'react';
import { Users, Clock, Shuffle, UserMinus, RotateCcw, Eye } from 'lucide-react';
import { FunnelDistribution } from './ComparativeCharts';

export default function ClassroomDynamicsPanel({ data }) {
    const { pacingCohorts, orderSplit, timerAverageSeconds, retention, rehydration, dropoffFunnels } = data;

    const formatTimer = (sec) => `${Math.floor(sec / 60)}m ${sec % 60}s`;

    return (
        <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Avg Do Now Timer</span>
                    <span className="text-xl font-black text-indigo-500 flex items-center gap-1.5">
                        <Clock size={16} /> {formatTimer(timerAverageSeconds)}
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Randomized Order Rate</span>
                    <span className="text-xl font-black text-amber-500 flex items-center gap-1.5">
                        <Shuffle size={16} />
                        {orderSplit.original + orderSplit.randomized > 0
                            ? Math.round((orderSplit.randomized / (orderSplit.original + orderSplit.randomized)) * 100)
                            : 0}%
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Kicks & Early Quits</span>
                    <span className="text-xl font-black text-rose-500 flex items-center gap-1.5">
                        <UserMinus size={16} /> {retention.totalKicked + retention.totalAbandoned}
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Results Review Rate</span>
                    <span className="text-xl font-black text-emerald-500 flex items-center gap-1.5">
                        <Eye size={16} /> {retention.totalReviewedResults}
                    </span>
                </div>
            </div>

            {/* Pacing Breakdown & Session Recovery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 space-y-3">
                    <h4 className="font-black text-xs uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
                        <Users size={14} className="text-indigo-500" /> Pacing Cohort Comparison
                    </h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                            <div>
                                <span className="font-black uppercase tracking-wide block">Open (Self-Paced)</span>
                                <span className="text-[10px] text-[var(--text-muted)]">Students browse freely back & forth</span>
                            </div>
                            <span className="font-black text-base font-mono">{pacingCohorts.open.sessions} sessions</span>
                        </div>
                        <div className="flex justify-between items-center bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                            <div>
                                <span className="font-black uppercase tracking-wide block">Progressive Lock</span>
                                <span className="text-[10px] text-[var(--text-muted)]">One question at a time</span>
                            </div>
                            <span className="font-black text-base font-mono">{pacingCohorts.progressive.sessions} sessions</span>
                        </div>
                        <div className="flex justify-between items-center bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                            <div>
                                <span className="font-black uppercase tracking-wide block">Teacher-Led</span>
                                <span className="text-[10px] text-[var(--text-muted)]">Synchronous whole-class pacing</span>
                            </div>
                            <span className="font-black text-base font-mono">{pacingCohorts.teacher.sessions} sessions</span>
                        </div>
                    </div>
                    
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 space-y-3">
                    <h4 className="font-black text-xs uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
                        <RotateCcw size={14} className="text-emerald-500" /> Session Resilience & Rehydration
                    </h4>
                    <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-muted)]">Students Reconnected & Rehydrated:</span>
                            <span className="font-black text-emerald-600">{rehydration.rehydratedCount} events</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-muted)]">Average Answers Successfully Restored:</span>
                            <span className="font-black">{rehydration.avgRestoredAnswers} questions / rejoin</span>
                        </div>
                    </div>

                    <div className="border-t border-[var(--border-subtle)] pt-3">
                        <h5 className="font-black text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
                            Test Lab Early Quit Drop-Off Funnel
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(dropoffFunnels).length === 0 ? (
                                <span className="text-xs text-[var(--text-muted)] italic">No student drop-offs recorded.</span>
                            ) : (
                                Object.entries(dropoffFunnels).map(([qNum, count]) => (
                                    <div key={qNum} className="px-2.5 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs">
                                        <span className="text-[var(--text-muted)]">Q{qNum}: </span>
                                        <span className="font-black text-rose-500">{count} quit</span>
                                    </div>
                                ))
                            )}
                        </div>
                        
                    </div>
                    {/* Test Abandonment Funnel */}
                        <FunnelDistribution 
                            title="Test Lab: Avbrotts-Funnel"
                            description="Vid vilken fråga ger eleverna upp under ett genererat prov?"
                            data={{
                                "1": 0, "5": 2, "10": 4, "15": 18, "16": 24, "20": 3 
                            }} 
                            emptyMessage="Inga avbrott registrerade"
                        />
                </div>
            </div>
        </div>
    );
}