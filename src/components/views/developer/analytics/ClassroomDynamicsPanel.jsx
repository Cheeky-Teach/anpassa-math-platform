// src/components/views/developer/analytics/ClassroomDynamicsPanel.jsx
import React from 'react';
import { Users, Clock, Shuffle, UserMinus, RotateCcw, Eye, ShieldCheck } from 'lucide-react';
import { FunnelDistribution } from './ComparativeCharts';

export default function ClassroomDynamicsPanel({ data }) {
    const { pacingCohorts, orderSplit, timerAverageSeconds, retention, rehydration, dropoffFunnels } = data;

    const formatTimer = (sec) => `${Math.floor(sec / 60)}m ${sec % 60}s`;

    return (
        <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)] shadow-sm">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Avg Do Now Timer</span>
                    <span className="text-xl font-black text-indigo-500 flex items-center gap-1.5">
                        <Clock size={16} /> {formatTimer(timerAverageSeconds)}
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)] shadow-sm">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Randomized Order Rate</span>
                    <span className="text-xl font-black text-amber-500 flex items-center gap-1.5">
                        <Shuffle size={16} />
                        {orderSplit.original + orderSplit.randomized > 0
                            ? Math.round((orderSplit.randomized / (orderSplit.original + orderSplit.randomized)) * 100)
                            : 0}%
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)] shadow-sm">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Kicks & Early Quits</span>
                    <span className="text-xl font-black text-rose-500 flex items-center gap-1.5">
                        <UserMinus size={16} /> {retention.totalKicked + retention.totalAbandoned}
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)] shadow-sm">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Results Review Rate</span>
                    <span className="text-xl font-black text-emerald-500 flex items-center gap-1.5">
                        <Eye size={16} /> {retention.totalReviewedResults}
                    </span>
                </div>
            </div>

            {/* Three-Column Deep Dives */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Session Pacing & Security */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 space-y-4 shadow-sm">
                    <h4 className="font-black text-xs uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
                        <Users size={14} className="text-indigo-500" /> Pacing Cohorts
                    </h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                            <div>
                                <span className="font-black uppercase tracking-wide block">Open (Self-Paced)</span>
                                <span className="text-[10px] text-[var(--text-muted)]">Students browse freely</span>
                            </div>
                            <span className="font-black text-base font-mono">{pacingCohorts.open.sessions}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                            <div>
                                <span className="font-black uppercase tracking-wide block">Progressive Lock</span>
                                <span className="text-[10px] text-[var(--text-muted)]">One question at a time</span>
                            </div>
                            <span className="font-black text-base font-mono">{pacingCohorts.progressive.sessions}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                            <div>
                                <span className="font-black uppercase tracking-wide block">Teacher-Led</span>
                                <span className="text-[10px] text-[var(--text-muted)]">Synchronous whole-class</span>
                            </div>
                            <span className="font-black text-base font-mono">{pacingCohorts.teacher.sessions}</span>
                        </div>
                    </div>

                    <div className="border-t border-[var(--border-subtle)] pt-3 mt-2">
                        <h5 className="font-black text-[11px] uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5 mb-2">
                            <ShieldCheck size={13} className="text-amber-500" /> Anti-Cheat Order Split
                        </h5>
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-muted)]">Original Order Sessions:</span>
                            <span className="font-bold">{orderSplit.original || 0}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-[var(--text-muted)]">Randomized Sessions:</span>
                            <span className="font-bold text-amber-600">{orderSplit.randomized || 0}</span>
                        </div>
                    </div>
                </div>

                {/* 2. System Resilience */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 space-y-4 shadow-sm">
                    <h4 className="font-black text-xs uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
                        <RotateCcw size={14} className="text-emerald-500" /> Connection Resilience
                    </h4>
                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                        Tracks how often students disconnect during live sessions and successfully restore their progress upon rejoining.
                    </p>
                    <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-muted)]">Successful Rehydrations:</span>
                            <span className="font-black text-emerald-600 text-sm">{rehydration.rehydratedCount}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-muted)]">Avg Answers Restored:</span>
                            <span className="font-black text-sm">{rehydration.avgRestoredAnswers} <span className="text-[10px] text-[var(--text-muted)] font-normal">/ rejoin</span></span>
                        </div>
                    </div>
                </div>

                {/* 3. Abandonment Funnel Chart */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 shadow-sm flex flex-col justify-center">
                    <FunnelDistribution 
                        title="Test Lab: Avbrotts-Funnel"
                        description="Vid vilken fråga ger eleverna upp under ett genererat prov?"
                        data={dropoffFunnels} 
                        emptyMessage="Inga avbrott registrerade ännu"
                    />
                </div>

            </div>
        </div>
    );
}