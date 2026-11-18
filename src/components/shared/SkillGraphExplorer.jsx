// src/components/shared/SkillGraphExplorer.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Search, Compass, Play, RefreshCw, X, CornerDownLeft,
    ArrowRight, RotateCcw, ChevronLeft, HelpCircle, Plus, Check
} from 'lucide-react';
import { SKILL_GRAPH, CONCEPT_SEARCH_INDEX } from '../../constants/skillGraph';
import { SKILL_BUCKETS } from '../../constants/skillBuckets';
import { CATEGORIES } from '../../constants/localization';
import MathDisplay from './MathDisplay';
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

const RECOMMENDED_SEARCHES = [
    { sv: 'Bråk', en: 'Fractions', querySv: 'bråk', queryEn: 'fractions' },
    { sv: 'Procent', en: 'Percent', querySv: 'procent', queryEn: 'percent' },
    { sv: 'Negativa tal', en: 'Negative numbers', querySv: 'negativa', queryEn: 'negative' },
    { sv: 'Potenser', en: 'Exponents', querySv: 'potenser', queryEn: 'exponents' },
    { sv: 'Prioriteringsregler', en: 'Order of operations', querySv: 'prioritering', queryEn: 'order' },
    { sv: 'Ekvationer', en: 'Equations', querySv: 'ekvationer', queryEn: 'equations' },
    { sv: 'Parenteser', en: 'Parentheses', querySv: 'parenteser', queryEn: 'parentheses' },
    { sv: 'Förenkla uttryck', en: 'Simplify expressions', querySv: 'förenkla', queryEn: 'simplify' },
    { sv: 'Pythagoras', en: 'Pythagoras', querySv: 'pythagoras', queryEn: 'pythagoras' },
    { sv: 'Area & Omkrets', en: 'Area & Perimeter', querySv: 'area', queryEn: 'area' },
    { sv: 'Vinklar', en: 'Angles', querySv: 'vinklar', queryEn: 'angles' },
    { sv: 'Grafer & Räta linjen', en: 'Graphs & Linear functions', querySv: 'graf', queryEn: 'graph' },
    { sv: 'Sannolikhet', en: 'Probability', querySv: 'sannolikhet', queryEn: 'probability' },
    { sv: 'Medelvärde & Median', en: 'Mean & Median', querySv: 'medelvärde', queryEn: 'mean' }
];

export default function SkillGraphExplorer({
    mode = 'student', // 'student' | 'teacher_picker'
    lang = 'sv',
    focusedTarget = null,
    onFocusChange,
    onStartPractice,
    onAddNode,
    selectedNodeIds = new Set(),
    headerRightSlot = null,
    showCategoryBrowser = false,
    compactHorizontal = false // 2-column internal split for wide single-screen modals
}) {
    const isTeacherMode = mode === 'teacher_picker';

    const [originalGoal, setOriginalGoal] = useState(null);
    const [branchPrompt, setBranchPrompt] = useState(null);

    const [recentNodes, setRecentNodes] = useState(() => {
        try {
            const saved = localStorage.getItem(RECENT_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const categoriesList = useMemo(() => Object.values(SKILL_BUCKETS || {}), []);
    const [browseCatId, setBrowseCatId] = useState(categoriesList[0]?.id || 'algebra');

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

    useEffect(() => {
        if (!focusedTarget) {
            setOriginalGoal(null);
            setBranchPrompt(null);
            return;
        }
        if (focusedTarget.isNewGoal) {
            setOriginalGoal({ topicId: focusedTarget.topicId, level: Number(focusedTarget.level) });
            saveNodeToRecent(focusedTarget.topicId, focusedTarget.level);
        } else if (!originalGoal) {
            setOriginalGoal({ topicId: focusedTarget.topicId, level: Number(focusedTarget.level) });
        }
    }, [focusedTarget]);

    const focusedNode = useMemo(() => {
        if (!focusedTarget?.topicId) return null;
        const exactId = `${focusedTarget.topicId}:${focusedTarget.level || 1}`;
        return SKILL_GRAPH[exactId]
            || Object.values(SKILL_GRAPH).find(n => n.topicId === focusedTarget.topicId)
            || null;
    }, [focusedTarget]);

    useEffect(() => {
        if (focusedNode?.category && SKILL_BUCKETS[focusedNode.category]) {
            setBrowseCatId(focusedNode.category);
        }
    }, [focusedNode?.category]);

    const topicLevelSiblings = useMemo(() => {
        if (!focusedNode) return [];
        return Object.values(SKILL_GRAPH)
            .filter(n => n.topicId === focusedNode.topicId)
            .sort((a, b) => Number(a.level) - Number(b.level));
    }, [focusedNode]);

    const topicsInBrowseCategory = useMemo(() => {
        if (!showCategoryBrowser) return [];
        const cat = SKILL_BUCKETS[browseCatId];
        if (!cat?.topics) return [];
        return Object.entries(cat.topics).map(([topicId, data]) => {
            const firstNode = Object.values(SKILL_GRAPH)
                .filter(n => n.topicId === topicId)
                .sort((a, b) => Number(a.level) - Number(b.level))[0];
            return {
                id: topicId,
                name: data.name?.[lang] || data.name?.sv || topicId,
                defaultLevel: firstNode ? Number(firstNode.level) : 1
            };
        });
    }, [showCategoryBrowser, browseCatId, lang]);

    const goalNode = useMemo(() => {
        if (!originalGoal) return null;
        return SKILL_GRAPH[`${originalGoal.topicId}:${originalGoal.level}`] || null;
    }, [originalGoal]);

    const isDetouredFromGoal = Boolean(
        !isTeacherMode &&
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

    const directPrereqs = useMemo(() => {
        if (!focusedNode) return [];
        return (focusedNode.prerequisites || [])
            .map(id => SKILL_GRAPH[id])
            .filter(Boolean)
            .sort((a, b) => (a.tier ?? 0) - (b.tier ?? 0) || a.level - b.level);
    }, [focusedNode]);

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

    const searchResults = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];
        return CONCEPT_SEARCH_INDEX.filter(item => item.keywords.includes(q)).slice(0, 12);
    }, [searchQuery]);

    const handleSelectNewGoal = (topicId, level) => {
        const numLevel = Number(level);
        setOriginalGoal({ topicId, level: numLevel });
        saveNodeToRecent(topicId, numLevel);
        if (onFocusChange) {
            onFocusChange({ topicId, level: numLevel, isNewGoal: true });
        }
    };

    const handleStepToNode = (topicId, level) => {
        const numLevel = Number(level);
        setBranchPrompt(null);
        if (onFocusChange) {
            onFocusChange({ topicId, level: numLevel, isNewGoal: false });
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
        if (onFocusChange) {
            onFocusChange(null);
        }
    };

    const handleTooHard = () => {
        if (directPrereqs.length === 0) return;
        if (directPrereqs.length === 1) {
            handleStepToNode(directPrereqs[0].topicId, directPrereqs[0].level);
        } else {
            setBranchPrompt(prev => (prev === 'prereqs' ? null : 'prereqs'));
        }
    };

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

    const isFocusedAlreadyAdded = focusedNode
        ? selectedNodeIds.has(`${focusedNode.topicId}:${focusedNode.level}`)
        : false;

    return (
        <div className={compactHorizontal ? 'h-full flex flex-col min-h-0 gap-3' : 'w-full space-y-4'}>
            {/* 1. COMPACT SEARCH & CATEGORY/TOPIC SELECTOR BAR */}
            <div className="relative z-30 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    {focusedNode && !isTeacherMode && (
                        <button
                            type="button"
                            onClick={handleCloseDiagnostic}
                            className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:border-emerald-600 text-xs font-bold text-[var(--text-main)] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                        >
                            <ChevronLeft size={15} />
                            <span>{lang === 'sv' ? 'Visa alla ämnen' : 'All Topics'}</span>
                        </button>
                    )}

                    {/* Search Input + Spotlight Popover */}
                    <div className="relative flex-1">
                        <div className="relative flex items-center z-20 group/search">
                            <Search size={15} className="absolute left-3.5 text-emerald-600 dark:text-emerald-400 pointer-events-none" />
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
                                    isTeacherMode
                                        ? (lang === 'sv'
                                            ? 'Sök begrepp eller nivåbeskrivning (t.ex. "bråk", "parenteser")...'
                                            : 'Search concept or level description (e.g. "fractions")...')
                                        : (lang === 'sv'
                                            ? 'Osäker på var du ska börja? Sök t.ex. "bråk", "procent", "ekvationer"...'
                                            : 'Not sure where to start? Search e.g. "fractions", "percent", "equations"...')
                                }
                                className={`w-full pl-9 pr-12 py-2 bg-[var(--bg-card)] border border-emerald-500/45 hover:border-emerald-600 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15 rounded-xl text-xs font-semibold text-[var(--text-main)] outline-none transition-all duration-200 ${
                                    !searchQuery && !isSearchOpen && !isTeacherMode ? 'animate-search-glow' : ''
                                }`}
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        searchInputRef.current?.focus();
                                    }}
                                    className="absolute right-2.5 p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            ) : (
                                <kbd className="hidden md:inline-flex items-center absolute right-2.5 px-1.5 py-0.5 text-[10px] font-bold font-mono text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-md">
                                    ⌘K
                                </kbd>
                            )}
                        </div>

                        {isSearchOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsSearchOpen(false)}
                                />
                                <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-[var(--bg-card)] border border-emerald-600 rounded-2xl shadow-xl max-h-72 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-150">
                                    {searchQuery.trim().length === 0 ? (
                                        <div className="p-3.5 space-y-3">
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                                                    {lang === 'sv' ? 'Populära sökningar' : 'Suggested searches'}
                                                </span>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {RECOMMENDED_SEARCHES.map((chip) => {
                                                        const queryVal = lang === 'sv' ? chip.querySv : chip.queryEn;
                                                        return (
                                                            <button
                                                                key={chip.queryEn}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSearchQuery(queryVal);
                                                                    searchInputRef.current?.focus();
                                                                }}
                                                                className="px-2 py-1 rounded-lg text-xs font-semibold bg-[var(--bg-surface)] hover:bg-emerald-600 text-[var(--text-main)] hover:text-white border border-[var(--border-main)] hover:border-emerald-600 transition-colors cursor-pointer"
                                                            >
                                                                # {lang === 'sv' ? chip.sv : chip.en}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {recentNodes.length > 0 && (
                                                <div className="pt-2.5 border-t border-[var(--border-main)] space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                                            {lang === 'sv' ? 'Senast utforskade' : 'Recently explored'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={clearRecentHistory}
                                                            className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-rose-600 cursor-pointer"
                                                        >
                                                            {lang === 'sv' ? 'Rensa' : 'Clear'}
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {recentNodes
                                                            .map(item => SKILL_GRAPH[`${item.topicId}:${item.level}`])
                                                            .filter(Boolean)
                                                            .map(node => (
                                                                <button
                                                                    key={node.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleSelectNewGoal(node.topicId, node.level);
                                                                        setIsSearchOpen(false);
                                                                        setSearchQuery('');
                                                                    }}
                                                                    className="px-2 py-1 rounded-lg text-xs font-semibold border bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-main)] hover:border-emerald-600 flex items-center gap-1.5 cursor-pointer"
                                                                >
                                                                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                                                                        N{node.level}
                                                                    </span>
                                                                    <span>{node.topicLabel?.[lang] || node.topicLabel?.sv}</span>
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : searchResults.length === 0 ? (
                                        <div className="p-4 text-center text-xs font-semibold text-[var(--text-muted)]">
                                            {lang === 'sv' ? 'Inga matchande begrepp hittades.' : 'No matching concepts found.'}
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-[var(--border-main)]">
                                            {searchResults.map(item => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => {
                                                        handleSelectNewGoal(item.topicId, item.level);
                                                        setIsSearchOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full text-left p-2.5 hover:bg-[var(--bg-surface)] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                                                >
                                                    <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                                                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-600 text-white shrink-0">
                                                            N{item.level}
                                                        </span>
                                                        <span className="text-xs font-bold text-[var(--text-main)]">
                                                            {item.topicLabel?.[lang] || item.topicLabel?.sv}
                                                        </span>
                                                        <span className="text-xs font-medium text-[var(--text-muted)] truncate">
                                                            — {item.levelDesc?.[lang] || item.levelDesc?.sv}
                                                        </span>
                                                    </div>
                                                    <CornerDownLeft size={13} className="text-[var(--text-muted)] shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Inline Category & Topic Dropdowns when in compactHorizontal mode */}
                    {showCategoryBrowser && compactHorizontal && (
                        <div className="flex items-center gap-1.5 shrink-0">
                            <select
                                value={browseCatId}
                                onChange={(e) => {
                                    const nextCat = e.target.value;
                                    setBrowseCatId(nextCat);
                                    const firstTp = Object.keys(SKILL_BUCKETS[nextCat]?.topics || {})[0];
                                    if (firstTp) {
                                        const firstNode = Object.values(SKILL_GRAPH)
                                            .filter(n => n.topicId === firstTp)
                                            .sort((a, b) => Number(a.level) - Number(b.level))[0];
                                        handleSelectNewGoal(firstTp, firstNode ? Number(firstNode.level) : 1);
                                    }
                                }}
                                className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] text-xs font-bold outline-none cursor-pointer"
                            >
                                {categoriesList.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name?.[lang] || cat.name?.sv || cat.id}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={focusedNode?.topicId || ''}
                                onChange={(e) => {
                                    const tpId = e.target.value;
                                    const firstNode = Object.values(SKILL_GRAPH)
                                        .filter(n => n.topicId === tpId)
                                        .sort((a, b) => Number(a.level) - Number(b.level))[0];
                                    handleSelectNewGoal(tpId, firstNode ? Number(firstNode.level) : 1);
                                }}
                                className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] text-xs font-bold outline-none cursor-pointer max-w-[180px]"
                            >
                                {topicsInBrowseCategory.map(tp => (
                                    <option key={tp.id} value={tp.id}>
                                        {tp.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Optional Flanking Tools Slot (Used in Student Concept Map) */}
                    {!focusedNode && headerRightSlot}
                </div>

                {/* Full Pill Strip when not compactHorizontal */}
                {showCategoryBrowser && !compactHorizontal && (
                    <div className="mt-3 space-y-2">
                        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                            {categoriesList.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        setBrowseCatId(cat.id);
                                        const firstTp = Object.keys(SKILL_BUCKETS[cat.id]?.topics || {})[0];
                                        if (firstTp) {
                                            const firstNode = Object.values(SKILL_GRAPH)
                                                .filter(n => n.topicId === firstTp)
                                                .sort((a, b) => Number(a.level) - Number(b.level))[0];
                                            handleSelectNewGoal(firstTp, firstNode ? Number(firstNode.level) : 1);
                                        }
                                    }}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                                        browseCatId === cat.id
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                            : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                                >
                                    {cat.name?.[lang] || cat.name?.sv || cat.id}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {topicsInBrowseCategory.map(tp => {
                                const isActiveTopic = focusedNode?.topicId === tp.id;
                                return (
                                    <button
                                        key={tp.id}
                                        type="button"
                                        onClick={() => handleSelectNewGoal(tp.id, tp.defaultLevel)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                            isActiveTopic
                                                ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300'
                                                : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-main)] hover:border-emerald-500'
                                        }`}
                                    >
                                        {tp.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* 2. GOLDILOCKS DIAGNOSTIC & TIMELINE WORKSPACE */}
            {focusedNode && (
                <div className={compactHorizontal ? 'flex-1 min-h-0 flex flex-col' : 'space-y-4 animate-in fade-in duration-200'}>
                    {/* Anchored Original Goal Breadcrumb (Student Mode) */}
                    {isDetouredFromGoal && goalNode && (
                        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-500 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-amber-950 dark:text-amber-100 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-600 text-white">
                                    {lang === 'sv' ? 'Ditt mål' : 'Your Goal'}
                                </span>
                                <span className="font-bold">
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
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                            >
                                <RotateCcw size={12} />
                                <span>{lang === 'sv' ? 'Tillbaka till ditt mål' : 'Return to Goal'}</span>
                            </button>
                        </div>
                    )}

                    {/* Two-Column Split Workspace */}
                    <div className={
                        compactHorizontal
                            ? 'flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch'
                            : 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'
                    }>
                        {/* PANE A: Goldilocks Diagnostic Stage */}
                        <div className={`${compactHorizontal ? 'lg:col-span-6 overflow-y-auto custom-scrollbar flex flex-col justify-between p-4' : 'lg:col-span-7 p-5 sm:p-6'} bg-[var(--bg-card)] border-2 border-emerald-600 rounded-2xl space-y-3`}>
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2.5">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                            {CATEGORIES[focusedNode.category]?.label?.[lang] || focusedNode.category}
                                        </span>
                                        <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-main)] tracking-tight leading-snug">
                                            {focusedNode.topicLabel?.[lang] || focusedNode.topicLabel?.sv}
                                        </h3>
                                        <p className="text-sm font-bold text-[var(--text-main)] mt-1 leading-snug">
                                            {focusedNode.levelDesc?.[lang] || focusedNode.levelDesc?.sv}
                                        </p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono shrink-0">
                                        {lang === 'sv' ? `Nivå ${focusedNode.level}` : `Level ${focusedNode.level}`}
                                    </span>
                                </div>

                                {/* Sibling Level Switcher Pills with Descriptions */}
                                {topicLevelSiblings.length > 1 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                        {topicLevelSiblings.map(sib => {
                                            const isCurrent = Number(sib.level) === Number(focusedNode.level);
                                            return (
                                                <button
                                                    key={sib.id}
                                                    type="button"
                                                    onClick={() => handleStepToNode(sib.topicId, sib.level)}
                                                    className={`px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                                                        isCurrent
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-[var(--text-main)] font-bold'
                                                            : 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-strong)]'
                                                    }`}
                                                >
                                                    <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                                                        isCurrent ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-card)] border border-[var(--border-main)]'
                                                    }`}>
                                                        N{sib.level}
                                                    </span>
                                                    <span className="text-xs font-bold leading-snug line-clamp-1">
                                                        {sib.levelDesc?.[lang] || sib.levelDesc?.sv}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Sample Problem Box */}
                                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] space-y-2">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                            {lang === 'sv' ? 'Exempeluppgift:' : 'Sample Problem:'}
                                        </span>

                                        {focusedNode.sampleVariationKey && (
                                            <button
                                                type="button"
                                                onClick={() => fetchLiveQuestion(focusedNode)}
                                                disabled={isFetchingExample}
                                                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)] hover:border-emerald-600 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                            >
                                                <RefreshCw size={10} className={isFetchingExample ? 'animate-spin' : ''} />
                                                <span>{lang === 'sv' ? 'Nytt exempel' : 'New Example'}</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className={`${compactHorizontal ? 'min-h-[84px] p-3' : 'min-h-[110px] p-4'} rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] flex flex-col justify-center items-center text-center overflow-visible`}>
                                        {isFetchingExample ? (
                                            <span className="text-xs font-semibold text-[var(--text-muted)] animate-pulse">
                                                {lang === 'sv' ? 'Tar fram ett nytt exempel...' : 'Generating a fresh example...'}
                                            </span>
                                        ) : liveQuestion?.renderData ? (
                                            <div className="space-y-2 w-full flex flex-col items-center">
                                                <div className="w-full max-w-[260px] flex justify-center items-center mx-auto overflow-visible empty:hidden whiteboard-protect rounded-xl">
                                                    <VisualRenderer
                                                        data={liveQuestion.renderData}
                                                        isWordProblem={false}
                                                    />
                                                </div>

                                                {liveQuestion.renderData.latex && (
                                                    <div className="text-lg sm:text-xl font-bold text-[var(--text-main)]">
                                                        <MathDisplay content={`$$${liveQuestion.renderData.latex}$$`} />
                                                    </div>
                                                )}

                                                {liveDescriptionText && (
                                                    <div className="text-xs font-medium text-[var(--text-main)] leading-relaxed max-w-xl text-center">
                                                        <MathDisplay content={liveDescriptionText} />
                                                    </div>
                                                )}
                                            </div>
                                        ) : focusedNode.example ? (
                                            <div className="text-base sm:text-lg font-bold text-[var(--text-main)] w-full">
                                                <MathDisplay content={focusedNode.example} />
                                            </div>
                                        ) : (
                                            <span className="text-xs font-medium text-[var(--text-muted)]">
                                                {focusedNode.levelDesc?.[lang] || focusedNode.levelDesc?.sv}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            {isTeacherMode ? (
                                <button
                                    type="button"
                                    onClick={() => onAddNode && onAddNode(focusedNode)}
                                    className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
                                        isFocusedAlreadyAdded
                                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                                >
                                    {isFocusedAlreadyAdded ? <Check size={14} /> : <Plus size={14} />}
                                    <span>
                                        {isFocusedAlreadyAdded
                                            ? (lang === 'sv'
                                                ? `Tillagd som mål (Nivå ${focusedNode.level})`
                                                : `Added to Targets (Level ${focusedNode.level})`)
                                            : (lang === 'sv'
                                                ? `Lägg till som mål (Nivå ${focusedNode.level})`
                                                : `Add as Target (Level ${focusedNode.level})`)}
                                    </span>
                                </button>
                            ) : (
                                <div className="space-y-2.5 pt-1">
                                    <p className="text-center text-xs font-bold text-[var(--text-muted)]">
                                        {lang === 'sv' ? 'Hur känns den här uppgiften?' : 'How does this problem feel?'}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        <button
                                            type="button"
                                            disabled={directPrereqs.length === 0}
                                            onClick={handleTooHard}
                                            className="py-3 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/35 disabled:cursor-not-allowed text-white font-bold text-xs transition-all active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center"
                                        >
                                            <span>{lang === 'sv' ? 'För svårt' : 'Too Hard'}</span>
                                            <span className="text-[11px] font-medium text-amber-100">
                                                {directPrereqs.length === 0
                                                    ? (lang === 'sv' ? 'Redan på startnivå' : 'Already at start')
                                                    : directPrereqs.length === 1
                                                        ? (lang === 'sv' ? '← Gå till grunden' : '← Go to basics')
                                                        : (lang === 'sv' ? 'Välj grund att öva ↓' : 'Pick a foundation ↓')}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                saveNodeToRecent(focusedNode.topicId, focusedNode.level);
                                                if (onStartPractice) onStartPractice(focusedNode.topicId, focusedNode.level);
                                            }}
                                            className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center"
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <Play size={13} fill="currentColor" />
                                                {lang === 'sv' ? 'Lagom — Börja öva' : 'Just Right — Practice'}
                                            </span>
                                            <span className="text-[11px] font-medium text-emerald-100">
                                                {lang === 'sv' ? `Starta Nivå ${focusedNode.level}` : `Start Level ${focusedNode.level}`}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            disabled={directUnlocks.length === 0}
                                            onClick={handleTooEasy}
                                            className="py-3 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-sky-600/35 disabled:cursor-not-allowed text-white font-bold text-xs transition-all active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center"
                                        >
                                            <span>{lang === 'sv' ? 'För lätt' : 'Too Easy'}</span>
                                            <span className="text-[11px] font-medium text-sky-100">
                                                {directUnlocks.length === 0
                                                    ? (lang === 'sv' ? 'Högsta nivån nådd' : 'Top level reached')
                                                    : directUnlocks.length === 1
                                                        ? (lang === 'sv' ? 'Gå till nästa steg →' : 'Go to next step →')
                                                        : (lang === 'sv' ? 'Välj nästa steg ↓' : 'Pick next step ↓')}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Multi-Branch Disambiguation Prompts (Student Mode) */}
                            {!isTeacherMode && branchPrompt === 'prereqs' && directPrereqs.length > 1 && (
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500 space-y-3 animate-in fade-in duration-150">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {directPrereqs.map(prereq => (
                                            <button
                                                key={prereq.id}
                                                type="button"
                                                onClick={() => handleStepToNode(prereq.topicId, prereq.level)}
                                                className="p-3 rounded-xl bg-[var(--bg-card)] hover:border-amber-600 border border-amber-400/70 text-left transition-colors cursor-pointer flex flex-col justify-between gap-1.5"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-600 text-white">
                                                            {lang === 'sv' ? `Nivå ${prereq.level}` : `Lvl ${prereq.level}`}
                                                        </span>
                                                        <span className="text-xs font-bold text-[var(--text-main)] truncate">
                                                            {prereq.topicLabel?.[lang] || prereq.topicLabel?.sv}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-bold text-[var(--text-main)] mt-1 line-clamp-1">
                                                        {prereq.levelDesc?.[lang] || prereq.levelDesc?.sv}
                                                    </p>
                                                </div>
                                                {prereq.example && (
                                                    <div className="text-xs font-medium text-[var(--text-muted)] truncate pt-1 border-t border-[var(--border-main)]">
                                                        <MathDisplay content={prereq.example} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!isTeacherMode && branchPrompt === 'unlocks' && directUnlocks.length > 1 && (
                                <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-500 space-y-3 animate-in fade-in duration-150">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-sky-950 dark:text-sky-100 flex items-center gap-1.5">
                                            <Compass size={15} className="text-sky-600 shrink-0" />
                                            {lang === 'sv'
                                                ? 'Härifrån kan du gå vidare på flera sätt. Välj nästa utmaning:'
                                                : 'From here you can branch in multiple ways. Choose your next challenge:'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setBranchPrompt(null)}
                                            className="p-1 text-sky-800 dark:text-sky-200 hover:opacity-70 cursor-pointer"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {directUnlocks.map(nextNode => (
                                            <button
                                                key={nextNode.id}
                                                type="button"
                                                onClick={() => handleStepToNode(nextNode.topicId, nextNode.level)}
                                                className="p-3 rounded-xl bg-[var(--bg-card)] hover:border-sky-600 border border-sky-400/70 text-left transition-colors cursor-pointer flex flex-col justify-between gap-1.5"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-sky-600 text-white">
                                                            {lang === 'sv' ? `Nivå ${nextNode.level}` : `Lvl ${nextNode.level}`}
                                                        </span>
                                                        <span className="text-xs font-bold text-[var(--text-main)] truncate">
                                                            {nextNode.topicLabel?.[lang] || nextNode.topicLabel?.sv}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-bold text-[var(--text-main)] mt-1 line-clamp-1">
                                                        {nextNode.levelDesc?.[lang] || nextNode.levelDesc?.sv}
                                                    </p>
                                                </div>
                                                {nextNode.example && (
                                                    <div className="text-xs font-medium text-[var(--text-muted)] truncate pt-1 border-t border-[var(--border-main)]">
                                                        <MathDisplay content={nextNode.example} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PANE B: Connected Vertical Timeline (Prerequisites & Next Steps) */}
                        <div className={`${compactHorizontal ? 'lg:col-span-6 overflow-y-auto custom-scrollbar p-4 space-y-3.5' : 'lg:col-span-5 p-5 space-y-5'} bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl`}>
                            <div className="border-b border-[var(--border-main)] pb-2.5">
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)]">
                                    {isTeacherMode
                                        ? (lang === 'sv' ? 'Förkunskaper & Nästa steg' : 'Prerequisites & Next Steps')
                                        : (lang === 'sv' ? 'Din väg hit & vidare' : 'Your Path Here & Forward')}
                                </h4>
                                <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
                                    {isTeacherMode
                                        ? (lang === 'sv'
                                            ? 'Klicka på ett kort för att granska eller lägg till direkt i testet.'
                                            : 'Click a card to inspect or add directly to your test.')
                                        : (lang === 'sv'
                                            ? 'Klicka på ett steg i tidslinjen för att granska dess uppgift.'
                                            : 'Click any step on the timeline to inspect its sample problem.')}
                                </p>
                            </div>

                            <div className="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-[8px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-strong)]">
                                {/* 1. Upstream Prerequisites */}
                                <div className="relative">
                                    <span className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-amber-600 ring-4 ring-[var(--bg-card)]" />
                                    <div className="mb-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                                            {isTeacherMode
                                                ? (lang === 'sv' ? 'Förkunskaper (Uppvärmning)' : 'Prerequisites (Warm-up)')
                                                : (lang === 'sv' ? 'Behöver du repetera först?' : 'Need to review first?')}
                                        </span>
                                    </div>

                                    {directPrereqs.length === 0 ? (
                                        <p className="text-xs font-medium text-[var(--text-muted)]">
                                            {lang === 'sv'
                                                ? 'Detta är redan den allra första grundnivån.'
                                                : 'This is already the initial foundation level.'}
                                        </p>
                                    ) : (
                                        <div className="divide-y divide-[var(--border-main)] border border-[var(--border-main)] rounded-xl bg-[var(--bg-surface)] overflow-hidden">
                                            {directPrereqs.map(prereq => {
                                                const isPrereqAdded = selectedNodeIds.has(`${prereq.topicId}:${prereq.level}`);
                                                return (
                                                    <div
                                                        key={prereq.id}
                                                        className="p-3 hover:bg-[var(--bg-card)] transition-colors flex items-center justify-between gap-2.5 group"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStepToNode(prereq.topicId, prereq.level)}
                                                            className="min-w-0 flex-1 text-left space-y-0.5 cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-600 text-white shrink-0">
                                                                    N{prereq.level}
                                                                </span>
                                                                <span className="text-xs font-extrabold text-[var(--text-main)] group-hover:text-amber-800 dark:group-hover:text-amber-200 truncate">
                                                                    {prereq.topicLabel?.[lang] || prereq.topicLabel?.sv}
                                                                </span>
                                                            </div>
                                                            <p className="text-[13px] font-bold text-[var(--text-main)] line-clamp-2 leading-snug pt-0.5">
                                                                {prereq.levelDesc?.[lang] || prereq.levelDesc?.sv}
                                                            </p>
                                                            {prereq.example && (
                                                                <div className="text-xs font-medium text-[var(--text-muted)] truncate pt-0.5">
                                                                    <MathDisplay content={prereq.example} />
                                                                </div>
                                                            )}
                                                        </button>

                                                        {isTeacherMode && onAddNode ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => onAddNode(prereq)}
                                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 shrink-0 cursor-pointer transition-colors ${
                                                                    isPrereqAdded
                                                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                                                        : 'bg-[var(--bg-card)] hover:bg-amber-600 text-[var(--text-main)] hover:text-white border-[var(--border-strong)] hover:border-amber-600'
                                                                }`}
                                                            >
                                                                {isPrereqAdded ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={2.5} />}
                                                                <span>
                                                                    {isPrereqAdded
                                                                        ? (lang === 'sv' ? 'Tillagd' : 'Added')
                                                                        : (lang === 'sv' ? 'Lägg till' : 'Add')}
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <ArrowRight size={14} className="text-[var(--text-muted)] shrink-0" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* 2. Current Anchor Node */}
                                <div className="relative">
                                    <span className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-emerald-600/20" />
                                    <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                                            {lang === 'sv' ? 'Granskar just nu' : 'Inspecting'}
                                        </span>
                                        <div className="text-xs font-extrabold text-emerald-950 dark:text-emerald-100 mt-0.5">
                                            {focusedNode.topicLabel?.[lang] || focusedNode.topicLabel?.sv} — {lang === 'sv' ? `Nivå ${focusedNode.level}` : `Level ${focusedNode.level}`}
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Downstream Unlocks */}
                                <div className="relative">
                                    <span className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-sky-600 ring-4 ring-[var(--bg-card)]" />
                                    <div className="mb-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                                            {isTeacherMode
                                                ? (lang === 'sv' ? 'Nästa steg (Utmaning)' : 'Next Steps (Challenge)')
                                                : (lang === 'sv' ? 'När du klarar detta är du redo för:' : 'Once mastered, you are ready for:')}
                                        </span>
                                    </div>

                                    {directUnlocks.length === 0 ? (
                                        <p className="text-xs font-medium text-[var(--text-muted)]">
                                            {lang === 'sv'
                                                ? 'Du har nått den högsta nivån inom detta område!'
                                                : 'You have reached the highest level in this topic!'}
                                        </p>
                                    ) : (
                                        <div className="divide-y divide-[var(--border-main)] border border-[var(--border-main)] rounded-xl bg-[var(--bg-surface)] overflow-hidden">
                                            {directUnlocks.map(nextNode => {
                                                const isNextAdded = selectedNodeIds.has(`${nextNode.topicId}:${nextNode.level}`);
                                                return (
                                                    <div
                                                        key={nextNode.id}
                                                        className="p-3 hover:bg-[var(--bg-card)] transition-colors flex items-center justify-between gap-2.5 group"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStepToNode(nextNode.topicId, nextNode.level)}
                                                            className="min-w-0 flex-1 text-left space-y-0.5 cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-sky-600 text-white shrink-0">
                                                                    N{nextNode.level}
                                                                </span>
                                                                <span className="text-xs font-extrabold text-[var(--text-main)] group-hover:text-sky-800 dark:group-hover:text-sky-200 truncate">
                                                                    {nextNode.topicLabel?.[lang] || nextNode.topicLabel?.sv}
                                                                </span>
                                                            </div>
                                                            <p className="text-[13px] font-bold text-[var(--text-main)] line-clamp-2 leading-snug pt-0.5">
                                                                {nextNode.levelDesc?.[lang] || nextNode.levelDesc?.sv}
                                                            </p>
                                                            {nextNode.example && (
                                                                <div className="text-xs font-medium text-[var(--text-muted)] truncate pt-0.5">
                                                                    <MathDisplay content={nextNode.example} />
                                                                </div>
                                                            )}
                                                        </button>

                                                        {isTeacherMode && onAddNode ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => onAddNode(nextNode)}
                                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 shrink-0 cursor-pointer transition-colors ${
                                                                    isNextAdded
                                                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                                                        : 'bg-[var(--bg-card)] hover:bg-sky-600 text-[var(--text-main)] hover:text-white border-[var(--border-strong)] hover:border-sky-600'
                                                                }`}
                                                            >
                                                                {isNextAdded ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={2.5} />}
                                                                <span>
                                                                    {isNextAdded
                                                                        ? (lang === 'sv' ? 'Tillagd' : 'Added')
                                                                        : (lang === 'sv' ? 'Lägg till' : 'Add')}
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <ArrowRight size={14} className="text-[var(--text-muted)] shrink-0" />
                                                        )}
                                                    </div>
                                                );
                                            })}
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