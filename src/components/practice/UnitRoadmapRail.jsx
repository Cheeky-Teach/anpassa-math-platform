// src/components/practice/UnitRoadmapRail.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    BookOpen, Beaker, Check, ChevronDown, ChevronUp,
    PanelLeftClose, PanelLeftOpen, Award, ArrowLeft
} from 'lucide-react';
import { LEVEL_DESCRIPTIONS } from '../../constants/localization';
import {
    getTopicDisplayName,
    getPartDisplayTitle,
    checkIsStepCompleted
} from '../../core/utils/unitProgressUtils';

export default function UnitRoadmapRail({
    activeBucket,
    parts = [],
    completedStepIds = [],
    activeStepId = null,
    onSelectStep,
    onBackToDashboard,
    lang = 'sv'
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedParts, setExpandedParts] = useState({});

    const allSteps = useMemo(() => parts.flatMap(p => p.steps || []), [parts]);
    const completedCount = useMemo(
        () => allSteps.filter(s => checkIsStepCompleted(s, completedStepIds)).length,
        [allSteps, completedStepIds]
    );
    const progressPct = allSteps.length > 0 ? Math.round((completedCount / allSteps.length) * 100) : 0;

    // Auto-expand whichever Part contains the currently active step
    useEffect(() => {
        if (!activeStepId) return;
        const ownerPart = parts.find(p => (p.steps || []).some(s => s.id === activeStepId));
        if (ownerPart) {
            setExpandedParts(prev => ({ ...prev, [ownerPart.id]: true }));
        }
    }, [activeStepId, parts]);

    const togglePart = (partId) => {
        setExpandedParts(prev => ({ ...prev, [partId]: !prev[partId] }));
    };

    if (!activeBucket || activeBucket === 'FREE_PLAY') return null;

    // Collapsed slim rail
    if (isCollapsed) {
        return (
            <aside className="w-full lg:w-[60px] shrink-0 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[var(--radius-card)] p-2 flex lg:flex-col items-center justify-between lg:justify-start gap-2.5 shadow-sm select-none">
                <button
                    type="button"
                    onClick={() => setIsCollapsed(false)}
                    className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-main)] flex items-center justify-center cursor-pointer transition-colors"
                    title={lang === 'sv' ? 'Visa planering' : 'Expand Roadmap'}
                >
                    <PanelLeftOpen size={17} />
                </button>

                <div className="flex lg:flex-col items-center gap-1.5 flex-1 justify-center">
                    <span className="text-[11px] font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {progressPct}%
                    </span>
                    <div className="w-16 lg:w-2 h-2 lg:h-24 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border-main)] flex flex-col justify-end">
                        <div
                            className="bg-emerald-600 transition-all duration-300 h-full lg:w-full"
                            style={{
                                width: typeof window !== 'undefined' && window.innerWidth < 1024 ? `${progressPct}%` : '100%',
                                height: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${progressPct}%` : '100%'
                            }}
                        />
                    </div>
                </div>

                {onBackToDashboard && (
                    <button
                        type="button"
                        onClick={onBackToDashboard}
                        className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center cursor-pointer transition-colors"
                        title={lang === 'sv' ? 'Byt område' : 'Change Unit'}
                    >
                        <ArrowLeft size={16} />
                    </button>
                )}
            </aside>
        );
    }

    return (
        <aside className="w-full lg:w-[288px] shrink-0 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[var(--radius-card)] flex flex-col overflow-hidden shadow-sm select-none lg:sticky lg:top-4 max-h-[calc(100vh-110px)]">
            {/* Unit Header & Overall Progress */}
            <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-main)] space-y-2.5 shrink-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                            {lang === 'sv' ? 'Planering' : 'Curated Unit'}
                        </span>
                        <h3 className="text-sm font-extrabold text-[var(--text-main)] truncate leading-tight mt-0.5">
                            {activeBucket.name}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors shrink-0"
                        title={lang === 'sv' ? 'Minimera planering' : 'Collapse Roadmap'}
                    >
                        <PanelLeftClose size={15} />
                    </button>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)]">
                        <span>
                            {completedCount}/{allSteps.length} {lang === 'sv' ? 'klara' : 'done'}
                        </span>
                        <span className="font-mono text-[var(--text-main)]">{progressPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-main)] overflow-hidden">
                        <div
                            className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>

                {progressPct === 100 && (
                    <div className="p-2.5 rounded-xl bg-emerald-600 text-white flex items-center gap-2 text-xs font-bold">
                        <Award size={16} className="text-amber-300 shrink-0" />
                        <span>{lang === 'sv' ? 'Hela enheten är klar!' : 'Unit complete!'}</span>
                    </div>
                )}
            </div>

            {/* Scrollable Parts & Steps Tree */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
                {parts.map((part, pIdx) => {
                    const partSteps = part.steps || [];
                    const partDoneCount = partSteps.filter(s => checkIsStepCompleted(s, completedStepIds)).length;
                    const isPartDone = partSteps.length > 0 && partDoneCount === partSteps.length;
                    const isOpen = Boolean(expandedParts[part.id]);

                    return (
                        <div
                            key={part.id || pIdx}
                            className="rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)]/50 overflow-hidden"
                        >
                            <button
                                type="button"
                                onClick={() => togglePart(part.id)}
                                className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span
                                        className={`w-5 h-5 rounded-md text-[10px] font-extrabold font-mono text-white flex items-center justify-center shrink-0 ${
                                            isPartDone ? 'bg-emerald-600' : 'bg-stone-700'
                                        }`}
                                    >
                                        {isPartDone ? <Check size={11} strokeWidth={3} /> : pIdx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-[var(--text-main)] truncate">
                                        {getPartDisplayTitle(part, pIdx, lang)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 text-[var(--text-muted)]">
                                    <span className="text-[10px] font-mono font-bold">
                                        {partDoneCount}/{partSteps.length}
                                    </span>
                                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                            </button>

                            {isOpen && (
                                <div className="p-2 pt-0 space-y-1 border-t border-[var(--border-main)] bg-[var(--bg-card)]">
                                    {partSteps.map((step, sIdx) => {
                                        const isCompleted = checkIsStepCompleted(step, completedStepIds);
                                        const isInstruction = step.type === 'instruction' || Boolean(step.sheetId);
                                        const isTest = step.type === 'test';
                                        const isSelected = step.id === activeStepId;

                                        const safeTopic = step.topic || step.topicId || part.topicId;
                                        const levelDescObj = LEVEL_DESCRIPTIONS[safeTopic]?.[step.level];
                                        const levelDesc =
                                            typeof levelDescObj === 'object'
                                                ? levelDescObj[lang] || levelDescObj.sv
                                                : levelDescObj || '';

                                        return (
                                            <button
                                                key={step.id || sIdx}
                                                type="button"
                                                onClick={() => onSelectStep?.(step, part)}
                                                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 cursor-pointer ${
                                                    isSelected
                                                        ? isInstruction
                                                            ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-600'
                                                            : isTest
                                                                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500'
                                                                : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-600'
                                                        : 'bg-[var(--bg-surface)]/40 hover:bg-[var(--bg-surface)] border-transparent'
                                                }`}
                                            >
                                                <span
                                                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono shrink-0 mt-0.5 ${
                                                        isInstruction
                                                            ? 'bg-sky-600 text-white'
                                                            : isTest
                                                                ? isCompleted
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : 'bg-amber-600 text-white'
                                                                : isCompleted
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-strong)]'
                                                    }`}
                                                >
                                                    {isInstruction ? (
                                                        <BookOpen size={11} />
                                                    ) : isTest ? (
                                                        <Beaker size={11} />
                                                    ) : isCompleted ? (
                                                        <Check size={11} strokeWidth={3} />
                                                    ) : (
                                                        sIdx + 1
                                                    )}
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="text-xs font-bold text-[var(--text-main)] truncate">
                                                            {isInstruction
                                                                ? step.sheetTitle
                                                                : isTest
                                                                    ? step.title || (lang === 'sv' ? 'Delprov' : 'Checkpoint')
                                                                    : `${getTopicDisplayName(safeTopic, lang)}`}
                                                        </span>
                                                        {!isInstruction && !isTest && (
                                                            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                                                                N{step.level}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                                                        {isInstruction
                                                            ? lang === 'sv'
                                                                ? 'Genomgång'
                                                                : 'Walkthrough'
                                                            : isTest
                                                                ? `${step.questionCount || 10} ${lang === 'sv' ? 'frågor' : 'questions'}`
                                                                : levelDesc}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer Return Link */}
            {onBackToDashboard && (
                <div className="p-3 border-t border-[var(--border-main)] bg-[var(--bg-surface)] shrink-0">
                    <button
                        type="button"
                        onClick={onBackToDashboard}
                        className="w-full py-2 px-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-xs font-bold text-[var(--text-main)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                        <ArrowLeft size={14} />
                        <span>{lang === 'sv' ? 'Översikt' : 'Unit Overview'}</span>
                    </button>
                </div>
            )}
        </aside>
    );
}