// src/components/developer/analytics/TeacherWorkflowPanel.jsx
import React from 'react';
import { FileText, LayoutGrid, Monitor, PenTool, MessageSquare, Printer } from 'lucide-react';

export default function TeacherWorkflowPanel({ data }) {
    const { counts, printHabits, whiteboardTools, customPrompts, packetComposition, presetsUsed } = data;

    return (
        <div className="space-y-6">
            {/* Top Activity Counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Worksheets Printed</span>
                    <span className="text-xl font-black text-emerald-500 flex items-center gap-1.5">
                        <FileText size={16} /> {counts.worksheetsPrinted}
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Do Nows Generated</span>
                    <span className="text-xl font-black text-indigo-500 flex items-center gap-1.5">
                        <LayoutGrid size={16} /> {counts.donowGenerated}
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Boards Saved</span>
                    <span className="text-xl font-black text-amber-500 flex items-center gap-1.5">
                        <Monitor size={16} /> {counts.presentationsSaved}
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Word Problem Demand</span>
                    <span className="text-xl font-black text-rose-500 flex items-center gap-1.5">
                        {packetComposition.avgWordProblemRatio}% of questions
                    </span>
                </div>
            </div>

            {/* Two-Column Deep Dives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Print & Layout Customization */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 space-y-4">
                    <h4 className="font-black text-xs uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
                        <Printer size={14} className="text-emerald-500" /> Print Configuration Habits
                    </h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                            <span className="text-[var(--text-muted)]">Includes Answer Key</span>
                            <span className="font-bold">{printHabits.includeAnswerKey} worksheets</span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                            <span className="text-[var(--text-muted)]">Detailed Step Solutions</span>
                            <span className="font-bold">{printHabits.detailedSteps} worksheets</span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                            <span className="text-[var(--text-muted)]">Compact Answer List</span>
                            <span className="font-bold">{printHabits.compactAnswers} worksheets</span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                            <span className="text-[var(--text-muted)]">Framed Card Design</span>
                            <span className="font-bold">{printHabits.framedLayout} worksheets</span>
                        </div>
                        <div className="flex justify-between pb-1">
                            <span className="text-[var(--text-muted)]">Average Blank Workspace Height</span>
                            <span className="font-bold">{printHabits.avgWorkspaceHeight} grid rows</span>
                        </div>
                    </div>
                </div>

                {/* Whiteboard Clues & Custom Prompts */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 space-y-4">
                    <h4 className="font-black text-xs uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
                        <PenTool size={14} className="text-indigo-500" /> Interactive Canvas Tool Usage
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-subtle)]">
                            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block">Text Clues</span>
                            <span className="font-black text-base">{whiteboardTools.text}</span>
                        </div>
                        <div className="bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-subtle)]">
                            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block">Math Clues</span>
                            <span className="font-black text-base">{whiteboardTools.math}</span>
                        </div>
                        <div className="bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-subtle)]">
                            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block">Both</span>
                            <span className="font-black text-base">{whiteboardTools.both}</span>
                        </div>
                    </div>

                    <div className="border-t border-[var(--border-subtle)] pt-3">
                        <h5 className="font-black text-[11px] uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5 mb-2">
                            <MessageSquare size={13} className="text-amber-500" /> Custom Teacher Prompts
                        </h5>
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-muted)]">Total Prompts Written:</span>
                            <span className="font-bold">{customPrompts.count}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-[var(--text-muted)]">Average Character Length:</span>
                            <span className="font-bold">{customPrompts.avgLength} chars</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Presets Adoption */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-[var(--text-main)] mb-3">
                    Test Lab Preset Bundle Adoptions
                </h4>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(presetsUsed).length === 0 ? (
                        <span className="text-xs text-[var(--text-muted)] italic">No preset data collected yet.</span>
                    ) : (
                        Object.entries(presetsUsed).map(([preset, count]) => (
                            <span key={preset} className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg text-xs font-bold flex items-center gap-2">
                                <span className="font-mono text-indigo-500">{preset}</span>
                                <span className="text-[10px] bg-[var(--bg-card)] px-1.5 py-0.5 rounded font-black">{count}</span>
                            </span>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}