// src/components/views/StudentGateway.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Layers, Star, ChevronRight, LayoutGrid, LogOut,
    Compass, Play, FolderOpen, BookOpen, Check
} from 'lucide-react';
import {
    getPartDisplayTitle,
    normalizePartsPayload,
    checkIsStepCompleted,
    getUnitProgressStorageKey,
    readCompletedStepIds
} from '../../core/utils/unitProgressUtils';

export default function StudentGateway({
    buckets = [],
    folderOrder = [],
    profile = null,
    onSelectBucket,
    onResumeUnitStep,
    onSelectFreePlay,
    onLeave,
    classCode,
    lang = 'sv',
    embedded = false
}) {
    const activeVisibleBuckets = useMemo(() => {
        const now = new Date();
        return (buckets || []).filter(
            b => b.is_visible && (!b.expires_at || new Date(b.expires_at) > now)
        );
    }, [buckets]);

    const enrichedBuckets = useMemo(() => {
        return activeVisibleBuckets.map(bucket => {
            const parts = normalizePartsPayload(bucket.payload);
            const steps = parts.flatMap(p => p.steps || []);
            const storageKey = getUnitProgressStorageKey(profile, bucket);
            const completedIds = readCompletedStepIds(storageKey);
            const completedCount = steps.filter(s => checkIsStepCompleted(s, completedIds)).length;
            const progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
            const nextStep = steps.find(s => !checkIsStepCompleted(s, completedIds)) || steps[0] || null;

            return {
                ...bucket,
                folderName: bucket.folder || (lang === 'sv' ? 'Tilldelade enheter' : 'Assigned Units'),
                partsCount: parts.length,
                stepsCount: steps.length,
                completedCount,
                progressPct,
                nextStep,
                partTitles: parts.map((p, idx) => getPartDisplayTitle(p, idx, lang))
            };
        });
    }, [activeVisibleBuckets, profile, lang]);

    const groupedFolders = useMemo(() => {
        const map = enrichedBuckets.reduce((acc, bucket) => {
            if (!acc[bucket.folderName]) acc[bucket.folderName] = [];
            acc[bucket.folderName].push(bucket);
            return acc;
        }, {});

        // Sort units within each group so that group's focused unit(s) appear first
        Object.keys(map).forEach(fName => {
            map[fName].sort((a, b) => Number(Boolean(b.is_focused)) - Number(Boolean(a.is_focused)));
        });

        return map;
    }, [enrichedBuckets]);

    const sortedFolderNames = useMemo(() => {
        const names = Object.keys(groupedFolders);
        return names.sort((a, b) => {
            const idxA = folderOrder.indexOf(a);
            const idxB = folderOrder.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b, lang === 'sv' ? 'sv' : 'en');
        });
    }, [groupedFolders, folderOrder, lang]);

    const [selectedFolder, setSelectedFolder] = useState(null);

    // Auto-select group: prefer a group where local browser progress already exists, else first group
    useEffect(() => {
        if (sortedFolderNames.length === 0) {
            setSelectedFolder(null);
            return;
        }
        if (selectedFolder && sortedFolderNames.includes(selectedFolder)) return;

        const folderWithProgress = sortedFolderNames.find(fName =>
            (groupedFolders[fName] || []).some(b => b.completedCount > 0)
        );
        setSelectedFolder(folderWithProgress || sortedFolderNames[0]);
    }, [sortedFolderNames, groupedFolders, selectedFolder]);

    const activeFolderName = selectedFolder && groupedFolders[selectedFolder]
        ? selectedFolder
        : sortedFolderNames[0] || null;

    const currentGroupBuckets = activeFolderName ? (groupedFolders[activeFolderName] || []) : [];
    const hasMultipleGroups = sortedFolderNames.length > 1;

    const renderUnitCard = (bucket) => {
        const isFocused = Boolean(bucket.is_focused);
        const hasStarted = bucket.completedCount > 0 && bucket.progressPct < 100;
        const isDone = bucket.stepsCount > 0 && bucket.progressPct === 100;

        return (
            <div
                key={bucket.id}
                onClick={() => onSelectBucket(bucket)}
                className={`card-tactile group p-4 sm:p-5 flex flex-col justify-between gap-4 cursor-pointer transition-all ${
                    isFocused
                        ? 'border-2 border-amber-500/80 bg-amber-50/25 dark:bg-amber-950/20'
                        : ''
                }`}
            >
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                    isFocused
                                        ? 'bg-amber-500 text-white border-amber-500'
                                        : isDone
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-strong)]'
                                }`}
                            >
                                {isDone ? <Check size={16} strokeWidth={2.5} /> : <Layers size={16} />}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-sm text-[var(--text-main)] group-hover:text-emerald-700 dark:group-hover:text-emerald-300 leading-snug line-clamp-2 transition-colors">
                                    {bucket.name}
                                </h4>
                                <span className="text-[11px] font-semibold font-mono text-[var(--text-muted)] block mt-0.5">
                                    {bucket.partsCount} {lang === 'sv' ? (bucket.partsCount === 1 ? 'del' : 'delar') : (bucket.partsCount === 1 ? 'part' : 'parts')}
                                    {' • '}
                                    {bucket.stepsCount} {lang === 'sv' ? 'steg' : 'steps'}
                                </span>
                            </div>
                        </div>

                        {isFocused && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider shrink-0">
                                <Star size={10} fill="currentColor" />
                                {lang === 'sv' ? 'Dagens Fokus' : "Today's Focus"}
                            </span>
                        )}
                    </div>

                    {bucket.partTitles?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {bucket.partTitles.slice(0, 3).map((title, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-main)] text-[10px] font-semibold text-[var(--text-muted)] truncate max-w-[180px]"
                                >
                                    {title}
                                </span>
                            ))}
                            {bucket.partTitles.length > 3 && (
                                <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-main)] text-[10px] font-mono font-bold text-[var(--text-muted)]">
                                    +{bucket.partTitles.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Ephemeral localStorage progress bar */}
                    {bucket.stepsCount > 0 && (
                        <div className="space-y-1 pt-0.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)]">
                                <span>
                                    {bucket.completedCount}/{bucket.stepsCount} {lang === 'sv' ? 'klara' : 'done'}
                                </span>
                                <span className="font-mono font-bold text-[var(--text-main)]">
                                    {bucket.progressPct}%
                                </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-main)] overflow-hidden">
                                <div
                                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                                    style={{ width: `${bucket.progressPct}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2.5 border-t border-[var(--border-main)] flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)] flex items-center gap-1 transition-colors">
                        <BookOpen size={13} />
                        <span>{lang === 'sv' ? 'Visa översikt' : 'View outline'}</span>
                    </span>

                    {onResumeUnitStep && bucket.nextStep ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onResumeUnitStep(bucket, bucket.nextStep);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 active:scale-[0.98]"
                        >
                            <Play size={11} fill="currentColor" />
                            <span>
                                {hasStarted
                                    ? (lang === 'sv' ? 'Fortsätt' : 'Continue')
                                    : isDone
                                        ? (lang === 'sv' ? 'Repetera' : 'Review')
                                        : (lang === 'sv' ? 'Starta' : 'Start')}
                            </span>
                        </button>
                    ) : (
                        <ChevronRight size={15} className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] group-hover:translate-x-0.5 transition-all" />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={embedded ? "animate-in fade-in" : "layout-wrapper relative z-10 animate-in fade-in pb-12"}>
            <div className={embedded ? "flex flex-col gap-5" : "pt-3 w-full max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col gap-5"}>

                {/* 1. TOP CONTEXT & QUICK-ESCAPE BAR (Standalone only) */}
                {!embedded && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                                {lang === 'sv' ? 'Ansluten till klassrum' : 'Connected to classroom'}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-base sm:text-lg font-extrabold text-[var(--text-main)] tracking-tight">
                                    {hasMultipleGroups
                                        ? (lang === 'sv' ? 'Välj din grupp & arbetsområde' : 'Choose Your Group & Unit')
                                        : (lang === 'sv' ? 'Välj arbetsområde' : 'Choose Study Unit')}
                                </h1>
                                {classCode && (
                                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs font-mono font-bold tracking-widest text-[var(--text-main)] uppercase">
                                        {classCode}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                            type="button"
                            onClick={onSelectFreePlay}
                            className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] hover:border-emerald-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Compass size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <span>{lang === 'sv' ? 'Hela matematikbiblioteket' : 'Full Math Library'}</span>
                            <ChevronRight size={14} className="text-[var(--text-muted)]" />
                        </button>

                        <button
                            type="button"
                            onClick={onLeave}
                            className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 border border-[var(--border-main)] hover:border-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <LogOut size={14} />
                            <span>{lang === 'sv' ? 'Byt klass' : 'Switch Class'}</span>
                        </button>
                    </div>
                </div>
                )}

                {/* 2. EQUAL-WEIGHT GROUP SELECTOR GRID (WHEN 2+ GROUPS EXIST) */}
                {hasMultipleGroups && (
                    <section className="space-y-2.5">
                        <div className="flex items-center gap-2 px-0.5">
                            <FolderOpen size={14} className="text-[var(--text-muted)]" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                {lang === 'sv' ? '1. Välj din grupp / klass' : '1. Select your group / class'}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                            {sortedFolderNames.map(fName => {
                                const groupItems = groupedFolders[fName] || [];
                                const isSelected = activeFolderName === fName;
                                const focusedUnit = groupItems.find(b => b.is_focused);

                                return (
                                    <button
                                        key={fName}
                                        type="button"
                                        onClick={() => setSelectedFolder(fName)}
                                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                                            isSelected
                                                ? 'bg-[var(--bg-card)] border-2 border-emerald-600 shadow-xs'
                                                : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface)]/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 w-full">
                                            <span className="font-extrabold text-sm sm:text-base text-[var(--text-main)] truncate">
                                                {fName}
                                            </span>
                                            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                                                isSelected
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-main)]'
                                            }`}>
                                                {groupItems.length}
                                            </span>
                                        </div>

                                        {focusedUnit ? (
                                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 truncate w-full">
                                                <Star size={11} className="text-amber-500 fill-amber-500 shrink-0" />
                                                <span className="truncate">{focusedUnit.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] font-medium text-[var(--text-muted)]">
                                                {groupItems.length} {lang === 'sv' ? (groupItems.length === 1 ? 'arbetsområde' : 'arbetsområden') : (groupItems.length === 1 ? 'unit' : 'units')}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 3. SCOPED UNITS FOR THE SELECTED GROUP */}
                {sortedFolderNames.length === 0 ? (
                    <div className="bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border-strong)] p-10 text-center space-y-2">
                        <LayoutGrid size={28} className="mx-auto text-[var(--text-muted)] opacity-40" />
                        <p className="text-xs font-semibold text-[var(--text-muted)]">
                            {lang === 'sv'
                                ? 'Inga aktiva arbetsområden utdelade just nu. Klicka på "Hela matematikbiblioteket" ovan för att träna fritt.'
                                : 'No active study units assigned right now. Click "Full Math Library" above to practice freely.'}
                        </p>
                    </div>
                ) : (
                    <section className="space-y-3">
                        <div className="flex items-center gap-2.5 px-0.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                                {hasMultipleGroups
                                    ? (lang === 'sv' ? `2. Arbetsområden för ${activeFolderName}` : `2. Study units for ${activeFolderName}`)
                                    : activeFolderName}
                            </span>
                            <div className="h-px bg-[var(--border-main)] flex-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {currentGroupBuckets.map(bucket => renderUnitCard(bucket))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}