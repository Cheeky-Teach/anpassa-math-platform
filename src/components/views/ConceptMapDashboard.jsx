import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Search, Compass, Play, RefreshCw, X, CornerDownLeft,
    ArrowRight, RotateCcw, ChevronLeft, HelpCircle
} from 'lucide-react';
import { SKILL_GRAPH, CONCEPT_SEARCH_INDEX } from '../../constants/skillGraph';
import { CATEGORIES } from '../../constants/localization';
import MathDisplay from '../shared/MathDisplay';
import VisualRenderer from '../visuals/VisualRenderer';

const VISUAL_TOPICS = new Set([
    'geometry',
    'pythagoras',
    'trig',
    'angles',
    'volume',
    'area_perimeter',
    'scale',
    'graphs',
    'functions',
    'statistics',
    'probability',
    'fraction_vis',
    'algebraic_geometry',
    'similar_triangles'
]);

const RECENT_STORAGE_KEY = 'concept_map_recent_nodes_v1';

export default function ConceptMapDashboard({
    lang = 'sv',
    diagnosticTarget = null,
    onSetDiagnosticTarget,
    onSelect,
    onStart
}) {
    // Anchored Original Goal so stepping through prerequisites never loses track of what the user came for
    const [originalGoal, setOriginalGoal] = useState(null); // { topicId, level }

    // Inline disambiguation prompt when "För svårt" or "För lätt" has multiple branches
    const [branchPrompt, setBranchPrompt] = useState(null); // 'prereqs' | 'unlocks' | null

    // GDPR-friendly localStorage history (UI state only, no PII)
    const [recentNodes, setRecentNodes] = useState(() => {
        try {
            const saved = localStorage.getItem(RECENT_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Spotlight search state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Live "Show Me a Problem" preview state
    const [liveQuestion, setLiveQuestion] = useState(null);
    const [isFetchingExample, setIsFetchingExample] = useState(false);

    const searchInputRef = useRef(null);

    const saveNodeToRecent = (topicId, level) => {
        const nodeId = `${topicId}:${level}`;
        if (!SKILL_GRAPH[nodeId]) return;

        setRecentNodes(prev => {
            const filtered = prev.filter(item => !(item.topicId === topicId && Number(item.level) === Number(level)));
            const updated = [{ topicId, level: Number(level), savedAt: Date.now() }, ...filtered].slice(0, 5);
            try {
                localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
            } catch (err) {
                console.warn('Could not persist recent concept map nodes:', err);
            }
            return updated;
        });
    };

    const clearRecentHistory = () => {
        setRecentNodes([]);
        try {
            localStorage.removeItem(RECENT_STORAGE_KEY);
        } catch {}
    };

    // Cmd+K / Ctrl+K shortcut to focus search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
                setIsSearchOpen(true);
            } else if (e.key === 'Escape') {
                setIsSearchOpen(false);
                setBranchPrompt(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Sync originalGoal when an external trigger (like "Testa nivå" on a topic card) opens diagnosticTarget
    useEffect(() => {
        if (!diagnosticTarget) {
            setOriginalGoal(null);
            setBranchPrompt(null);
            return;
        }
        if (diagnosticTarget.isNewGoal) {
            setOriginalGoal({ topicId: diagnosticTarget.topicId, level: Number(diagnosticTarget.level) });
            saveNodeToRecent(diagnosticTarget.topicId, diagnosticTarget.level);
        } else if (!originalGoal) {
            setOriginalGoal({ topicId: diagnosticTarget.topicId, level: Number(diagnosticTarget.level) });
        }
    }, [diagnosticTarget]);

    const focusedNode = useMemo(() => {
        if (!diagnosticTarget?.topicId) return null;
        const exactId = `${diagnosticTarget.topicId}:${diagnosticTarget.level || 1}`;
        return SKILL_GRAPH[exactId]
            || Object.values(SKILL_GRAPH).find(n => n.topicId === diagnosticTarget.topicId)
            || null;
    }, [diagnosticTarget]);

    const goalNode = useMemo(() => {
        if (!originalGoal) return null;
        return SKILL_GRAPH[`${originalGoal.topicId}:${originalGoal.level}`] || null;
    }, [originalGoal]);

    const isDetouredFromGoal = Boolean(
        focusedNode &&
        goalNode &&
        (focusedNode.topicId !== goalNode.topicId || Number(focusedNode.level) !== Number(goalNode.level))
    );

    const fetchLiveQuestion = async (node, signal = null) => {
        if (!node?.sampleVariationKey) {
            setLiveQuestion(null);
            return;
        }
        setIsFetchingExample(true);
        try {
            const url = `/api/question?topic=${node.topicId}&variation=${node.sampleVariationKey}&lang=${lang}&wordProblem=false`;
            const res = await fetch(url, signal ? { signal } : undefined);
            if (res.ok) {
                const data = await res.json();
                setLiveQuestion(data);
            }
        } catch (err) {
            if (err?.name !== 'AbortError') {
                console.warn('Could not fetch live preview question:', err);
            }
        } finally {
            setIsFetchingExample(false);
        }
    };

    // Reset & auto-fetch live question for visual/geometry topics so figures render immediately
    useEffect(() => {
        setLiveQuestion(null);
        setBranchPrompt(null);

        if (!focusedNode) return;

        const isVisualCandidate =
            VISUAL_TOPICS.has(focusedNode.topicId) ||
            focusedNode.category === 'geometry' ||
            focusedNode.category === 'statistics' ||
            !focusedNode.example;

        if (isVisualCandidate && focusedNode.sampleVariationKey) {
            const controller = new AbortController();
            fetchLiveQuestion(focusedNode, controller.signal);
            return () => controller.abort();
        }
    }, [focusedNode, lang]);

    // Direct upstream prerequisites (sorted foundational -> immediate)
    const directPrereqs = useMemo(() => {
        if (!focusedNode) return [];
        return (focusedNode.prerequisites || [])
            .map(id => SKILL_GRAPH[id])
            .filter(Boolean)
            .sort((a, b) => (a.tier ?? 0) - (b.tier ?? 0) || a.level - b.level);
    }, [focusedNode]);

    // Direct downstream unlocked next steps (same-topic next level first, then cross-topic bridges)
    const directUnlocks = useMemo(() => {
        if (!focusedNode) return [];
        return (focusedNode.unlocks || [])
            .map(id => SKILL_GRAPH[id])
            .filter(Boolean)
            .sort((a, b) => {
                const aSame = a.topicId === focusedNode.topicId ? 0 : 1;
                const bSame = b.topicId === focusedNode.topicId ? 0 : 1;
                if (aSame !== bSame) return aSame - bSame;
                return (a.tier ?? 0) - (b.tier ?? 0) || a.level - b.level;
            });
    }, [focusedNode]);

    // Spotlight search results
    const searchResults = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];
        return CONCEPT_SEARCH_INDEX.filter(item => item.keywords.includes(q)).slice(0, 10);
    }, [searchQuery]);

    // Selecting from Search or Recent History establishes a new Original Goal
    const handleSelectNewGoal = (topicId, level) => {
        const numLevel = Number(level);
        setOriginalGoal({ topicId, level: numLevel });
        saveNodeToRecent(topicId, numLevel);
        if (onSetDiagnosticTarget) {
            onSetDiagnosticTarget({ topicId, level: numLevel, isNewGoal: true });
        }
        if (onSelect) {
            onSelect(topicId, numLevel);
        }
    };

    // Stepping along the Timeline or Branch Choice shifts current diagnostic focus while keeping Original Goal anchored
    const handleStepToNode = (topicId, level) => {
        const numLevel = Number(level);
        setBranchPrompt(null);
        if (onSetDiagnosticTarget) {
            onSetDiagnosticTarget({ topicId, level: numLevel, isNewGoal: false });
        }
        if (onSelect) {
            onSelect(topicId, numLevel);
        }
    };

    const handleReturnToGoal = () => {
        if (!goalNode) return;
        handleStepToNode(goalNode.topicId, goalNode.level);
    };

    const handleCloseDiagnostic = () => {
        setOriginalGoal(null);
        setBranchPrompt(null);
        setSearchQuery('');
        if (onSetDiagnosticTarget) {
            onSetDiagnosticTarget(null);
        }
    };

    // Goldilocks Action 1: "För svårt" -> Auto-step if 1 prerequisite; inline choice if multiple
    const handleTooHard = () => {
        if (directPrereqs.length === 0) return;
        if (directPrereqs.length === 1) {
            handleStepToNode(directPrereqs[0].topicId, directPrereqs[0].level);
        } else {
            setBranchPrompt(prev => (prev === 'prereqs' ? null : 'prereqs'));
        }
    };

    // Goldilocks Action 3: "För lätt" -> Auto-step if 1 next step (or single same-topic next level); inline choice if multiple branches
    const handleTooEasy = () => {
        if (directUnlocks.length === 0) return;
        if (directUnlocks.length === 1) {
            handleStepToNode(directUnlocks[0].topicId, directUnlocks[0].level);
        } else {
            setBranchPrompt(prev => (prev === 'unlocks' ? null : 'unlocks'));
        }
    };

    const liveDescriptionText = useMemo(() => {
        if (!liveQuestion?.renderData?.description) return '';
        return typeof liveQuestion.renderData.description === 'object'
            ? (liveQuestion.renderData.description[lang] || liveQuestion.renderData.description.sv || '')
            : liveQuestion.renderData.description;
    }, [liveQuestion, lang]);

    return (
        <div className="w-full space-y-5">
            {/* ===================================================================== */}
            {/* 1. UNIFIED SPOTLIGHT SEARCH BAR (ALWAYS VISIBLE AT TOP OF CURRICULUM) */}
            {/* ===================================================================== */}
            <div className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-3xl p-4 sm:p-5 shadow-xs relative z-30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Back to Topic Grid button when Diagnostic Mode is open */}
                    {focusedNode && (
                        <button
                            type="button"
                            onClick={handleCloseDiagnostic}
                            className="px-4 py-3 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] border-2 border-[var(--border-strong)] hover:border-indigo-500 text-xs font-black uppercase tracking-wider text-[var(--text-main)] transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                        >
                            <ChevronLeft size={15} />
                            <span>{lang === 'sv' ? 'Visa alla ämnen' : 'All Topics'}</span>
                        </button>
                    )}

                    {/* Search Input */}
                    <div className="relative flex-1">
                        <div className="relative flex items-center">
                            <Search size={18} className="absolute left-4 text-indigo-600 dark:text-indigo-400 pointer-events-none" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onFocus={() => setIsSearchOpen(true)}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchOpen(true);
                                }}
                                placeholder={
                                    lang === 'sv'
                                        ? 'Vad behöver du hjälp med? Sök t.ex. "parenteser", "bråk", "procent", "pythagoras"...'
                                        : 'What do you need help with? Search e.g. "parentheses", "fractions", "percent"...'
                                }
                                className="w-full pl-11 pr-16 py-3.5 bg-[var(--bg-surface)] border-2 border-[var(--border-strong)] focus:border-indigo-600 rounded-2xl text-xs sm:text-sm font-bold text-[var(--text-main)] outline-none transition-all shadow-inner"
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setIsSearchOpen(false);
                                    }}
                                    className="absolute right-3.5 p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            ) : (
                                <kbd className="hidden sm:inline-flex items-center absolute right-3.5 px-2 py-0.5 text-[10px] font-black text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg">
                                    ⌘K
                                </kbd>
                            )}
                        </div>
                        

                        {/* Spotlight Dropdown Results */}
                        {isSearchOpen && searchQuery.trim().length > 0 && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsSearchOpen(false)}
                                />
                                <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-[var(--bg-card)] border-2 border-indigo-600 rounded-2xl shadow-2xl max-h-80 overflow-y-auto custom-scrollbar divide-y divide-[var(--border-main)]">
                                    {searchResults.length === 0 ? (
                                        <div className="p-4 text-center text-xs font-bold text-[var(--text-muted)]">
                                            {lang === 'sv' ? 'Inga matchande begrepp hittades.' : 'No matching concepts found.'}
                                        </div>
                                    ) : (
                                        searchResults.map(item => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    handleSelectNewGoal(item.topicId, item.level);
                                                    setIsSearchOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className="w-full text-left p-3.5 hover:bg-[var(--bg-surface)] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white shrink-0">
                                                            {lang === 'sv' ? `Nivå ${item.level}` : `Lvl ${item.level}`}
                                                        </span>
                                                        <span className="text-xs font-black text-[var(--text-main)]">
                                                            {item.topicLabel?.[lang] || item.topicLabel?.sv}
                                                        </span>
                                                        <span className="text-xs font-semibold text-[var(--text-muted)] truncate">
                                                            — {item.levelDesc?.[lang] || item.levelDesc?.sv}
                                                        </span>
                                                    </div>
                                                </div>
                                                <CornerDownLeft size={14} className="text-[var(--text-muted)] shrink-0" />
                                            </button>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Saved Recent Levels from localStorage (Shown on initial screen when user has history) */}
                {!focusedNode && recentNodes.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mr-1">
                                {lang === 'sv' ? 'Senast utforskade:' : 'Recently explored:'}
                            </span>
                            {recentNodes
                                .map(item => SKILL_GRAPH[`${item.topicId}:${item.level}`])
                                .filter(Boolean)
                                .map(node => (
                                    <button
                                        key={node.id}
                                        type="button"
                                        onClick={() => {
                                            handleSelectNewGoal(node.topicId, node.level);
                                            setSearchQuery('');
                                        }}
                                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-main)] hover:border-indigo-500 flex items-center gap-1.5"
                                    >
                                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-indigo-600 text-white">
                                            {lang === 'sv' ? `N${node.level}` : `L${node.level}`}
                                        </span>
                                        <span>{node.topicLabel?.[lang] || node.topicLabel?.sv}</span>
                                    </button>
                                ))}
                        </div>
                        <button
                            type="button"
                            onClick={clearRecentHistory}
                            className="text-[10px] font-bold text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        >
                            {lang === 'sv' ? 'Rensa historik' : 'Clear history'}
                        </button>
                    </div>
                )}
            </div>

            {/* ===================================================================== */}
            {/* 2. DIAGNOSTIC WORKSPACE (ONLY SHOWN WHEN A SEARCH/TOPIC IS ACTIVE)    */}
            {/* ===================================================================== */}
            {focusedNode && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    {/* ANCHORED ORIGINAL GOAL BREADCRUMB */}
                    {isDetouredFromGoal && goalNode && (
                        <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-100 flex-wrap">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-600 text-white">
                                    {lang === 'sv' ? 'Ditt mål' : 'Your Goal'}
                                </span>
                                <span className="font-black">
                                    {goalNode.topicLabel?.[lang] || goalNode.topicLabel?.sv} ({lang === 'sv' ? `Nivå ${goalNode.level}` : `Lvl ${goalNode.level}`})
                                </span>
                                <span className="opacity-60">→</span>
                                <span>
                                    {lang === 'sv' ? 'Granskar nu:' : 'Inspecting:'}{' '}
                                    <strong>
                                        {focusedNode.topicLabel?.[lang] || focusedNode.topicLabel?.sv} ({lang === 'sv' ? `Nivå ${focusedNode.level}` : `Lvl ${focusedNode.level}`})
                                    </strong>
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleReturnToGoal}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
                            >
                                <RotateCcw size={12} />
                                <span>{lang === 'sv' ? 'Tillbaka till ditt mål' : 'Return to Goal'}</span>
                            </button>
                        </div>
                    )}

                    {/* TWO-COLUMN SPLIT WORKSPACE: LEFT (7/12) GOLDILOCKS DIAGNOSTIC | RIGHT (5/12) VERTICAL TIMELINE */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* LEFT COLUMN: GOLDILOCKS DIAGNOSTIC STAGE */}
                        <div className="lg:col-span-7 bg-[var(--bg-card)] border-2 border-indigo-600 rounded-3xl p-5 sm:p-7 shadow-lg ring-4 ring-indigo-600/10 space-y-5">
                            {/* Active Topic & Level Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                                        {CATEGORIES[focusedNode.category]?.label?.[lang] || focusedNode.category}
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight mt-0.5">
                                        {focusedNode.topicLabel?.[lang] || focusedNode.topicLabel?.sv}
                                    </h3>
                                    <p className="text-sm font-bold text-[var(--text-muted)] mt-1">
                                        {focusedNode.levelDesc?.[lang] || focusedNode.levelDesc?.sv}
                                    </p>
                                </div>
                                <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-wider shrink-0 shadow-sm">
                                    {lang === 'sv' ? `Nivå ${focusedNode.level}` : `Level ${focusedNode.level}`}
                                </span>
                            </div>

                            {/* Sample Problem Box ("Så här ser en uppgift ut:") */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-strong)] space-y-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                                        {lang === 'sv' ? 'Så här ser en uppgift ut:' : 'Here is what a problem looks like:'}
                                    </span>

                                    {focusedNode.sampleVariationKey && (
                                        <button
                                            type="button"
                                            onClick={() => fetchLiveQuestion(focusedNode)}
                                            disabled={isFetchingExample}
                                            className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)] hover:border-indigo-500 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                        >
                                            <RefreshCw size={11} className={isFetchingExample ? 'animate-spin' : ''} />
                                            <span>{lang === 'sv' ? 'Visa nytt exempel' : 'New Example'}</span>
                                        </button>
                                    )}
                                </div>

                                <div className="min-h-[120px] p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] flex flex-col justify-center items-center text-center overflow-visible">
                                    {isFetchingExample ? (
                                        <span className="text-xs font-bold text-[var(--text-muted)] animate-pulse">
                                            {lang === 'sv' ? 'Tar fram ett nytt exempel...' : 'Generating a fresh example...'}
                                        </span>
                                    ) : liveQuestion?.renderData ? (
                                        <div className="space-y-4 w-full flex flex-col items-center">
                                            <div className="w-full max-w-[380px] flex justify-center items-center mx-auto overflow-visible empty:hidden whiteboard-protect rounded-xl">
                                                <VisualRenderer
                                                    data={liveQuestion.renderData}
                                                    isWordProblem={false}
                                                />
                                            </div>

                                            {liveQuestion.renderData.latex && (
                                                <div className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
                                                    <MathDisplay content={`$$${liveQuestion.renderData.latex}$$`} />
                                                </div>
                                            )}

                                            {liveDescriptionText && (
                                                <div className="text-sm font-semibold text-[var(--text-main)] leading-relaxed max-w-xl text-center">
                                                    <MathDisplay content={liveDescriptionText} />
                                                </div>
                                            )}
                                        </div>
                                    ) : focusedNode.example ? (
                                        <div className="text-lg sm:text-xl font-bold text-[var(--text-main)] w-full">
                                            <MathDisplay content={focusedNode.example} />
                                        </div>
                                    ) : (
                                        <span className="text-xs font-semibold text-[var(--text-muted)] italic">
                                            {focusedNode.levelDesc?.[lang] || focusedNode.levelDesc?.sv}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* GOLDILOCKS DECISION BAR: SOLID HIGH-CONTRAST BUTTONS */}
                            <div className="space-y-2.5 pt-1">
                                <p className="text-center text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                                    {lang === 'sv' ? 'Hur känns den här uppgiften?' : 'How does this problem feel?'}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {/* 1. TOO HARD -> Solid Amber with White Text */}
                                    <button
                                        type="button"
                                        disabled={directPrereqs.length === 0}
                                        onClick={handleTooHard}
                                        className="py-3.5 px-3 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/35 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider shadow-md shadow-amber-600/20 transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 text-center"
                                    >
                                        <span>{lang === 'sv' ? 'För svårt' : 'Too Hard'}</span>
                                        <span className="text-[10px] font-bold text-amber-50 normal-case tracking-normal">
                                            {directPrereqs.length === 0
                                                ? (lang === 'sv' ? 'Redan på startnivå' : 'Already at start')
                                                : directPrereqs.length === 1
                                                    ? (lang === 'sv' ? '← Gå till grunden' : '← Go to basics')
                                                    : (lang === 'sv' ? 'Välj grund att öva ↓' : 'Pick a foundation ↓')}
                                        </span>
                                    </button>

                                    {/* 2. JUST RIGHT -> Solid Emerald with White Text */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            saveNodeToRecent(focusedNode.topicId, focusedNode.level);
                                            if (onSelect) onSelect(focusedNode.topicId, focusedNode.level);
                                            if (onStart) onStart();
                                        }}
                                        className="py-3.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 text-center"
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <Play size={14} fill="currentColor" />
                                            {lang === 'sv' ? 'Lagom — Börja öva' : 'Just Right — Practice'}
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-50 normal-case tracking-normal">
                                            {lang === 'sv' ? `Starta Nivå ${focusedNode.level}` : `Start Level ${focusedNode.level}`}
                                        </span>
                                    </button>

                                    {/* 3. TOO EASY -> Solid Indigo with White Text */}
                                    <button
                                        type="button"
                                        disabled={directUnlocks.length === 0}
                                        onClick={handleTooEasy}
                                        className="py-3.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/35 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 text-center"
                                    >
                                        <span>{lang === 'sv' ? 'För lätt' : 'Too Easy'}</span>
                                        <span className="text-[10px] font-bold text-indigo-50 normal-case tracking-normal">
                                            {directUnlocks.length === 0
                                                ? (lang === 'sv' ? 'Högsta nivån nådd' : 'Top level reached')
                                                : directUnlocks.length === 1
                                                    ? (lang === 'sv' ? 'Gå till nästa steg →' : 'Go to next step →')
                                                    : (lang === 'sv' ? 'Välj nästa steg ↓' : 'Pick next step ↓')}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* INLINE MULTI-BRANCH DISAMBIGUATION PROMPT (Avoids bad auto-guesses when >1 prerequisite or unlock exists) */}
                            {branchPrompt === 'prereqs' && directPrereqs.length > 1 && (
                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-black text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                                            <HelpCircle size={15} className="text-amber-600 shrink-0" />
                                            {lang === 'sv'
                                                ? 'Det här momentet bygger på flera grunder. Vilken del känns klurigast?'
                                                : 'This skill builds on multiple foundations. Which part feels trickiest?'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setBranchPrompt(null)}
                                            className="p-1 text-amber-800 dark:text-amber-200 hover:opacity-70 cursor-pointer"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {directPrereqs.map(prereq => (
                                            <button
                                                key={prereq.id}
                                                type="button"
                                                onClick={() => handleStepToNode(prereq.topicId, prereq.level)}
                                                className="p-3 rounded-xl bg-[var(--bg-card)] hover:border-amber-600 border-2 border-amber-400/70 text-left transition-all cursor-pointer group flex flex-col justify-between gap-1.5"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-600 text-white">
                                                            {lang === 'sv' ? `Nivå ${prereq.level}` : `Lvl ${prereq.level}`}
                                                        </span>
                                                        <span className="text-xs font-black text-[var(--text-main)] truncate">
                                                            {prereq.topicLabel?.[lang] || prereq.topicLabel?.sv}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-0.5 line-clamp-1">
                                                        {prereq.levelDesc?.[lang] || prereq.levelDesc?.sv}
                                                    </p>
                                                </div>
                                                {prereq.example && (
                                                    <div className="text-xs font-bold text-[var(--text-main)] truncate pt-1 border-t border-[var(--border-main)]">
                                                        <MathDisplay content={prereq.example} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {branchPrompt === 'unlocks' && directUnlocks.length > 1 && (
                                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-500 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-black text-indigo-950 dark:text-indigo-100 flex items-center gap-1.5">
                                            <Compass size={15} className="text-indigo-600 shrink-0" />
                                            {lang === 'sv'
                                                ? 'Härifrån kan du gå vidare på flera sätt. Välj nästa utmaning:'
                                                : 'From here you can branch in multiple ways. Choose your next challenge:'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setBranchPrompt(null)}
                                            className="p-1 text-indigo-800 dark:text-indigo-200 hover:opacity-70 cursor-pointer"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {directUnlocks.map(nextNode => (
                                            <button
                                                key={nextNode.id}
                                                type="button"
                                                onClick={() => handleStepToNode(nextNode.topicId, nextNode.level)}
                                                className="p-3 rounded-xl bg-[var(--bg-card)] hover:border-indigo-600 border-2 border-indigo-400/70 text-left transition-all cursor-pointer group flex flex-col justify-between gap-1.5"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                                                            {lang === 'sv' ? `Nivå ${nextNode.level}` : `Lvl ${nextNode.level}`}
                                                        </span>
                                                        <span className="text-xs font-black text-[var(--text-main)] truncate">
                                                            {nextNode.topicLabel?.[lang] || nextNode.topicLabel?.sv}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-0.5 line-clamp-1">
                                                        {nextNode.levelDesc?.[lang] || nextNode.levelDesc?.sv}
                                                    </p>
                                                </div>
                                                {nextNode.example && (
                                                    <div className="text-xs font-bold text-[var(--text-main)] truncate pt-1 border-t border-[var(--border-main)]">
                                                        <MathDisplay content={nextNode.example} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: CONNECTED VERTICAL TIMELINE / STEPPER */}
                        <div className="lg:col-span-5 bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
                            <div className="border-b border-[var(--border-main)] pb-3">
                                <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">
                                    {lang === 'sv' ? 'Din väg hit & vidare' : 'Your Path Here & Forward'}
                                </h4>
                                <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-0.5">
                                    {lang === 'sv'
                                        ? 'Klicka på ett steg i tidslinjen för att granska dess uppgift.'
                                        : 'Click any step on the timeline to inspect its sample problem.'}
                                </p>
                            </div>

                            {/* TIMELINE TRACK */}
                            <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-strong)]">
                                {/* 1. UPSTREAM PREREQUISITES */}
                                <div className="relative">
                                    <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-amber-600 ring-4 ring-[var(--bg-card)]" />
                                    <div className="mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-300">
                                            {lang === 'sv' ? 'Behöver du repetera först?' : 'Need to review first?'}
                                        </span>
                                    </div>

                                    {directPrereqs.length === 0 ? (
                                        <p className="text-xs font-semibold text-[var(--text-muted)] italic">
                                            {lang === 'sv'
                                                ? 'Detta är redan den allra första grundnivån.'
                                                : 'This is already the initial foundation level.'}
                                        </p>
                                    ) : (
                                        <div className="divide-y divide-[var(--border-main)] border border-[var(--border-main)] rounded-2xl bg-[var(--bg-surface)] overflow-hidden">
                                            {directPrereqs.map(prereq => (
                                                <button
                                                    key={prereq.id}
                                                    type="button"
                                                    onClick={() => handleStepToNode(prereq.topicId, prereq.level)}
                                                    className="w-full p-3 text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer group flex items-center justify-between gap-3"
                                                >
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-600 text-white shrink-0">
                                                                {lang === 'sv' ? `Nivå ${prereq.level}` : `Lvl ${prereq.level}`}
                                                            </span>
                                                            <span className="text-xs font-black text-[var(--text-main)] group-hover:text-amber-900 dark:group-hover:text-amber-200 truncate">
                                                                {prereq.topicLabel?.[lang] || prereq.topicLabel?.sv}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] font-semibold text-[var(--text-muted)] truncate">
                                                            {prereq.levelDesc?.[lang] || prereq.levelDesc?.sv}
                                                        </p>
                                                        {prereq.example && (
                                                            <div className="text-[11px] font-bold text-[var(--text-main)] truncate pt-0.5">
                                                                <MathDisplay content={prereq.example} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-amber-700 dark:group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 2. CURRENT ANCHOR NODE ON TIMELINE */}
                                <div className="relative">
                                    <span className="absolute -left-[24px] top-1.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-600/20" />
                                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-300 dark:border-indigo-500/40">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-800 dark:text-indigo-300 block">
                                            {lang === 'sv' ? 'Du granskar just nu' : 'Currently inspecting'}
                                        </span>
                                        <div className="text-xs font-black text-indigo-950 dark:text-indigo-100 mt-0.5">
                                            {focusedNode.topicLabel?.[lang] || focusedNode.topicLabel?.sv} — {lang === 'sv' ? `Nivå ${focusedNode.level}` : `Level ${focusedNode.level}`}
                                        </div>
                                    </div>
                                </div>

                                {/* 3. DOWNSTREAM UNLOCKS / NEXT STEPS */}
                                <div className="relative">
                                    <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-[var(--bg-card)]" />
                                    <div className="mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300">
                                            {lang === 'sv' ? 'När du klarar detta är du redo för:' : 'Once mastered, you are ready for:'}
                                        </span>
                                    </div>

                                    {directUnlocks.length === 0 ? (
                                        <p className="text-xs font-semibold text-[var(--text-muted)] italic">
                                            {lang === 'sv'
                                                ? 'Du har nått den högsta nivån inom detta område!'
                                                : 'You have reached the highest level in this topic!'}
                                        </p>
                                    ) : (
                                        <div className="divide-y divide-[var(--border-main)] border border-[var(--border-main)] rounded-2xl bg-[var(--bg-surface)] overflow-hidden">
                                            {directUnlocks.map(nextNode => (
                                                <button
                                                    key={nextNode.id}
                                                    type="button"
                                                    onClick={() => handleStepToNode(nextNode.topicId, nextNode.level)}
                                                    className="w-full p-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer group flex items-center justify-between gap-3"
                                                >
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white shrink-0">
                                                                {lang === 'sv' ? `Nivå ${nextNode.level}` : `Lvl ${nextNode.level}`}
                                                            </span>
                                                            <span className="text-xs font-black text-[var(--text-main)] group-hover:text-emerald-900 dark:group-hover:text-emerald-200 truncate">
                                                                {nextNode.topicLabel?.[lang] || nextNode.topicLabel?.sv}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] font-semibold text-[var(--text-muted)] truncate">
                                                            {nextNode.levelDesc?.[lang] || nextNode.levelDesc?.sv}
                                                        </p>
                                                        {nextNode.example && (
                                                            <div className="text-[11px] font-bold text-[var(--text-main)] truncate pt-0.5">
                                                                <MathDisplay content={nextNode.example} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-emerald-700 dark:group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}