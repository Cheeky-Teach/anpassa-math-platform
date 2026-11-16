// src/components/dashboard/ConceptMapDashboard.jsx
import React from 'react';
import { RotateCcw, PieChart, Grid3X3, Clock } from 'lucide-react';
import SkillGraphExplorer from '../shared/SkillGraphExplorer';

export default function ConceptMapDashboard({
    lang = 'sv',
    diagnosticTarget = null,
    onSetDiagnosticTarget,
    onSelect,
    onStart,
    studentTools = null
}) {
    const handleFocusChange = (nextTarget) => {
        if (onSetDiagnosticTarget) {
            onSetDiagnosticTarget(nextTarget);
        }
        if (nextTarget && onSelect) {
            onSelect(nextTarget.topicId, nextTarget.level);
        }
    };

    const handleStartPractice = (topicId, level) => {
        if (onSelect) onSelect(topicId, level);
        if (onStart) onStart();
    };

    const studentToolsDeck = studentTools ? (
        <div className="flex items-center gap-2 shrink-0 justify-end">
            <button
                type="button"
                onClick={studentTools.onTimesTableOpen}
                className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)] hover:border-emerald-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
                <Grid3X3 size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>{lang === 'sv' ? 'Tabeller' : 'Tables'}</span>
            </button>

            <button
                type="button"
                onClick={studentTools.onFractionLabOpen}
                className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)] hover:border-sky-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
                <PieChart size={15} className="text-sky-600 dark:text-sky-400" />
                <span>{lang === 'sv' ? 'Laborationer' : 'Manipulatives'}</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)]">
                <Clock size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <select
                    value={studentTools.timerSettings.duration / 60}
                    onChange={(e) => studentTools.toggleTimer(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold font-mono text-[var(--text-main)] outline-none cursor-pointer"
                    aria-label="Timer"
                >
                    <option value="0">{lang === 'sv' ? 'Timer av' : 'Timer Off'}</option>
                    {[5, 10, 15, 30, 45, 60].map(m => <option key={m} value={m}>{m}m</option>)}
                </select>
                {studentTools.timerSettings.duration > 0 && (
                    <button
                        type="button"
                        onClick={studentTools.resetTimer}
                        className="p-0.5 text-rose-600 dark:text-rose-400 hover:opacity-75 cursor-pointer"
                        title={lang === 'sv' ? 'Nollställ' : 'Reset'}
                    >
                        <RotateCcw size={12} />
                    </button>
                )}
            </div>
        </div>
    ) : null;

    return (
        <SkillGraphExplorer
            mode="student"
            lang={lang}
            focusedTarget={diagnosticTarget}
            onFocusChange={handleFocusChange}
            onStartPractice={handleStartPractice}
            headerRightSlot={studentToolsDeck}
            showCategoryBrowser={false}
        />
    );
}