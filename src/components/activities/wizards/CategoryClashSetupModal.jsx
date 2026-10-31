// src/components/activities/wizards/CategoryClashSetupModal.jsx
import React, { useState, useMemo } from 'react';
import { 
    X, Grid, Trophy, Shuffle, Calculator, Type,
    Play, Info, HelpCircle, ArrowRight
} from 'lucide-react';
import { SKILL_BUCKETS, isTopicWordProblemReady } from '../../../constants/skillBuckets.js';
import { extractSeedsFromPacket } from '../../../hooks/useGameQuestionPool.js';
import CategoryClashHelpModal from '../shared/CategoryClashHelpModal.jsx';

export default function CategoryClashSetupModal({
    isOpen,
    onClose,
    onLaunch,
    sourcePacket = null,
    savedBoard = null,
    profile = null,
    lang = 'sv'
}) {
    const userRole = String(profile?.role || '').toLowerCase();
    const isTeacher = userRole === 'teacher' || userRole === 'super_admin';
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const activeBoardData = savedBoard?.packet || (sourcePacket?.dimensions ? sourcePacket : null);
    const existingDimensions = activeBoardData?.dimensions || { columns: 4, rows: 4 };
    const existingCategories = activeBoardData?.categories || [];
    const existingTeams = savedBoard?.config?.teams || activeBoardData?.teams;

    // 1. Grid Dimensions
    const [columns, setColumns] = useState(existingDimensions.columns || 4);
    const [rows, setRows] = useState(existingDimensions.rows || 4);

    // 2. Global Defaults
    const [globalMinLevel, setGlobalMinLevel] = useState(1);
    const [globalMaxLevel, setGlobalMaxLevel] = useState(4);

    // 3. Per-Column Custom Ranges
    const [columnRanges, setColumnRanges] = useState(() => {
        const ranges = {};
        if (existingCategories.length > 0) {
            existingCategories.forEach((cat, idx) => {
                if (cat.minLevel !== undefined && cat.maxLevel !== undefined) {
                    ranges[idx] = { min: cat.minLevel, max: cat.maxLevel };
                }
            });
        }
        return ranges;
    });

    // 3b. Per-Column Question Mode (Math vs Story)
    const [columnModes, setColumnModes] = useState(() => {
        const modes = {};
        if (existingCategories.length > 0) {
            existingCategories.forEach((cat, idx) => {
                modes[idx] = cat.wordProblems ? 'story' : 'math';
            });
        }
        return modes;
    });

    // 4. Intentional Level Inspector Modal state
    const [inspectedTopic, setInspectedTopic] = useState(null);

    // 5. Teams & Points (Defaulted to Solo: 1)
    const [pointScalePreset, setPointScalePreset] = useState('100_500');
    const [teamCount, setTeamCount] = useState(existingTeams?.length || 1);
    const [teamNames, setTeamNames] = useState(() => {
        if (existingTeams?.length > 0) {
            const names = {};
            existingTeams.forEach((tm, idx) => { names[idx] = tm.name; });
            return names;
        }
        return {
            0: lang === 'sv' ? 'Lag Röd' : 'Team Red',
            1: lang === 'sv' ? 'Lag Blå' : 'Team Blue',
            2: lang === 'sv' ? 'Lag Grön' : 'Team Green',
            3: lang === 'sv' ? 'Lag Gul' : 'Team Yellow'
        };
    });
    const teamColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

    // 6. Source packet integration
    const rawTiles = useMemo(() => {
        const candidate = sourcePacket?.tiles || activeBoardData?.tiles || sourcePacket;
        if (Array.isArray(candidate)) return candidate;
        if (candidate && typeof candidate === 'object') return Object.values(candidate);
        return [];
    }, [sourcePacket, activeBoardData]);

    const seedInfo = useMemo(() => extractSeedsFromPacket(rawTiles || []), [rawTiles]);
    const hasSourcePacket = Boolean(rawTiles && rawTiles.length > 0);

    const allTopics = useMemo(() => {
        const list = [];
        for (const catKey in SKILL_BUCKETS) {
            const cat = SKILL_BUCKETS[catKey];
            if (cat?.topics) {
                for (const topKey in cat.topics) {
                    const topObj = cat.topics[topKey];
                    const variations = topObj.variations || [];
                    
                    const levelMap = {};
                    variations.forEach(v => {
                        const lvl = Number(v.level) || 1;
                        if (!levelMap[lvl]) levelMap[lvl] = [];
                        levelMap[lvl].push(v);
                    });

                    const availableLevels = Object.keys(levelMap).map(Number).sort((a, b) => a - b);

                    list.push({
                        id: topKey,
                        name: topObj.name?.[lang] || topObj.name?.sv || topKey.replace(/_/g, ' '),
                        categoryName: cat.name?.[lang] || cat.name?.sv || catKey,
                        availableLevels: availableLevels.length > 0 ? availableLevels : [1, 2, 3, 4],
                        levelMap
                    });
                }
            }
        }
        return list;
    }, [lang]);

    const [selectedTopics, setSelectedTopics] = useState(() => {
        if (existingCategories.length > 0) {
            return existingCategories.map(c => c.topic);
        }
        if (hasSourcePacket && seedInfo.topics.length > 0) {
            return Array.from({ length: 6 }, (_, idx) => seedInfo.topics[idx % seedInfo.topics.length]);
        }
        return ['equations', 'fraction_arith', 'percent', 'geometry', 'statistics', 'pythagoras'];
    });

    const t = {
        sv: {
            title: "Konfigurera Poängjakten",
            subtitle: "Poängjakten • Category Clash",
            game_desc_title: "Frågesportbräde med Automatisk Nivåtrappa",
            game_desc: "Välj ett nivåspann för varje ämne. Spelet fördelar automatiskt svårighetsgraden så att frågorna blir stegvis svårare för högre poäng.",
            grid_size: "Brädstorlek (Kolumner x Rader)",
            cols_label: "Kolumner (Områden)",
            rows_label: "Rader (Poängnivåer)",
            categories_title: "Områden & Svårighetsspann per kolumn",
            from_level: "Från:",
            to_level: "Till:",
            inspect_btn: "Visa nivåer",
            level_word: "Nivå",
            point_scale: "Poängskala",
            teams_title: "Spelläge & Gruppindelning",
            solo: "Solo",
            teams: "Lag",
            randomize: "Slumpa",
            word_problems: "Aktivera textuppgifter / problemlösning",
            cancel: "Avbryt",
            open_board: "Öppna Spelplan",
            level_overview_sub: "Nivåöversikt & Delmoment",
            guide_tooltip: "Instruktioner & Spelguide"
        },
        en: {
            title: "Configure Category Clash",
            subtitle: "Category Clash • Trivia Board",
            game_desc_title: "Trivia Board with Automatic Progression",
            game_desc: "Choose a level range for each category. The game automatically distributes tiers so higher points correspond to harder questions.",
            grid_size: "Grid Size (Columns x Rows)",
            cols_label: "Columns (Topics)",
            rows_label: "Rows (Point Tiers)",
            categories_title: "Topics & Difficulty Range per Column",
            from_level: "From:",
            to_level: "To:",
            inspect_btn: "View levels",
            level_word: "Level",
            point_scale: "Point Scale",
            teams_title: "Game Mode & Teams",
            solo: "Solo",
            teams: "Teams",
            randomize: "Randomize",
            word_problems: "Enable story problems & context",
            cancel: "Cancel",
            open_board: "Open Game Board",
            level_overview_sub: "Level Overview & Subtopics",
            guide_tooltip: "Instructions & Game Guide"
        }
    }[lang] || {};

    if (!isOpen) return null;

    const calculatePointScale = () => {
        const base = pointScalePreset === '100_500' ? 100 : pointScalePreset === '10_50' ? 10 : 1;
        return Array.from({ length: rows }, (_, idx) => (idx + 1) * base);
    };

    const handleTopicChange = (colIdx, topicId) => {
        setSelectedTopics(prev => {
            const next = [...prev];
            next[colIdx] = topicId;
            return next;
        });
        setColumnRanges(prev => {
            const next = { ...prev };
            delete next[colIdx];
            return next;
        });
    };

    const updateColumnMin = (colIdx, newMin, maxLevel) => {
        setColumnRanges(prev => {
            const current = prev[colIdx] || { min: globalMinLevel, max: maxLevel };
            const validMin = Number(newMin);
            return {
                ...prev,
                [colIdx]: {
                    min: validMin,
                    max: Math.max(validMin, current.max)
                }
            };
        });
    };

    const updateColumnMax = (colIdx, newMax, minLevel) => {
        setColumnRanges(prev => {
            const current = prev[colIdx] || { min: minLevel, max: globalMaxLevel };
            const validMax = Number(newMax);
            return {
                ...prev,
                [colIdx]: {
                    min: Math.min(validMax, current.min),
                    max: validMax
                }
            };
        });
    };

    const handleRandomizeTopics = () => {
        const shuffled = [...allTopics].sort(() => Math.random() - 0.5);
        setSelectedTopics(shuffled.slice(0, 6).map(t => t.id));
        setColumnRanges({});
    };

    const handleDoLaunch = () => {
        const activeCategories = Array.from({ length: columns }, (_, colIdx) => {
            const topicId = selectedTopics[colIdx] || allTopics[0]?.id || 'equations';
            const topicMeta = allTopics.find(t => t.id === topicId);
            const range = columnRanges[colIdx] || { min: globalMinLevel, max: globalMaxLevel };

            const minSupported = topicMeta?.availableLevels[0] || 1;
            const maxSupported = topicMeta?.availableLevels[topicMeta.availableLevels.length - 1] || 4;

            const safeMin = Math.max(minSupported, Math.min(range.min, maxSupported));
            const safeMax = Math.max(safeMin, Math.min(range.max, maxSupported));

            return {
                id: `col_${colIdx}`,
                topic: topicId,
                name: topicMeta ? topicMeta.name : topicId.replace(/_/g, ' '),
                minLevel: safeMin,
                maxLevel: safeMax,
                wordProblems: (columnModes[colIdx] || 'math') === 'story'
            };
        });

        const activeTeams = teamCount <= 1 
            ? [] 
            : Array.from({ length: teamCount }, (_, idx) => ({
                id: `team_${idx}`,
                name: teamNames[idx] || `Team ${idx + 1}`,
                color: teamColors[idx],
                score: 0
            }));

        onLaunch({
            dimensions: { columns, rows },
            pointScale: calculatePointScale(),
            categories: activeCategories,
            teams: activeTeams,
            sourceMode: hasSourcePacket ? 'as_is' : 'procedural',
            tiles: rawTiles,
            savedBoard: savedBoard || null
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[500] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in select-none">
            <div 
                className="rounded-[2.5rem] shadow-2xl border w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden relative"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-main)',
                    color: 'var(--text-main)'
                }}
            >
                {/* Header */}
                <div 
                    className="px-8 py-5 border-b flex items-center justify-between shrink-0"
                    style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-main)'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/30">
                            <Grid size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-wider text-inherit">{t.title}</h2>
                            <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{t.subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsHelpOpen(true)}
                            className="p-2 rounded-xl border transition-colors cursor-pointer hover:border-amber-400"
                            style={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border-main)',
                                color: 'var(--text-muted)'
                            }}
                            title={t.guide_tooltip}
                        >
                            <HelpCircle size={16} />
                        </button>
                        <button 
                            onClick={onClose} 
                            className="p-2 rounded-xl transition-colors cursor-pointer hover:bg-rose-500 hover:text-white"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Form Body */}
                <form onSubmit={(e) => { e.preventDefault(); handleDoLaunch(); }} className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6">
                    
                    {/* Visual Concept Banner */}
                    <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md flex items-center gap-5">
                        <div className="shrink-0 grid grid-cols-3 gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800 w-28 text-center font-mono">
                            <div className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] py-1 rounded font-bold">{t.level_word} 1</div>
                            <div className="bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-[9px] py-1 rounded font-bold">{t.level_word} 2</div>
                            <div className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] py-1 rounded font-black">{t.level_word} 4</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Trophy size={16} className="text-amber-400" />
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                                    {t.game_desc_title}
                                </h3>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                {t.game_desc}
                            </p>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                            className="p-3.5 rounded-2xl border"
                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                        >
                            <span className="text-[11px] font-bold block mb-2" style={{ color: 'var(--text-muted)' }}>{t.cols_label}</span>
                            <div className="flex gap-1.5">
                                {[3, 4, 5, 6].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setColumns(num)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                            columns === num 
                                                ? 'bg-indigo-600 text-white shadow-sm' 
                                                : 'border hover:border-indigo-400'
                                        }`}
                                        style={columns !== num ? { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' } : {}}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div 
                            className="p-3.5 rounded-2xl border"
                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                        >
                            <span className="text-[11px] font-bold block mb-2" style={{ color: 'var(--text-muted)' }}>{t.rows_label}</span>
                            <div className="flex gap-1.5">
                                {[3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setRows(num)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                            rows === num 
                                                ? 'bg-indigo-600 text-white shadow-sm' 
                                                : 'border hover:border-indigo-400'
                                        }`}
                                        style={rows !== num ? { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' } : {}}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Categories & Difficulty Selector */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase tracking-wider block" style={{ color: 'var(--text-main)' }}>
                                {t.categories_title}
                            </label>
                            <button
                                type="button"
                                onClick={handleRandomizeTopics}
                                className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <Shuffle size={12} />
                                {t.randomize}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                            {Array.from({ length: columns }).map((_, colIdx) => {
                                const currentTopicId = selectedTopics[colIdx] || allTopics[0]?.id;
                                const topicMeta = allTopics.find(t => t.id === currentTopicId);
                                const availableLevels = topicMeta?.availableLevels || [1, 2, 3, 4];
                                const currentRange = columnRanges[colIdx] || { 
                                    min: availableLevels[0] || 1, 
                                    max: availableLevels[availableLevels.length - 1] || 4 
                                };

                                return (
                                    <div 
                                        key={colIdx} 
                                        className="p-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                                    >
                                        {/* Column Number & Topic Dropdown */}
                                        <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:w-auto">
                                            {/* Column Number badge: high-contrast border and text */}
                                            <span 
                                                className="w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 border"
                                                style={{
                                                    backgroundColor: 'var(--bg-card)',
                                                    borderColor: 'var(--border-strong)',
                                                    color: 'var(--text-main)'
                                                }}
                                            >
                                                {colIdx + 1}
                                            </span>
                                            <select
                                                value={currentTopicId}
                                                onChange={(e) => handleTopicChange(colIdx, e.target.value)}
                                                className="w-full border px-3 py-1.5 rounded-xl text-xs font-bold outline-none cursor-pointer truncate shadow-xs focus:ring-2 focus:ring-indigo-500/40"
                                                style={{ 
                                                    backgroundColor: 'var(--bg-card)', 
                                                    borderColor: 'var(--border-main)', 
                                                    color: 'var(--text-main)' 
                                                }}
                                            >
                                                {allTopics.map(topic => (
                                                    <option 
                                                        key={topic.id} 
                                                        value={topic.id} 
                                                        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                                                    >
                                                        {topic.categoryName} • {topic.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Min / Max Range Pickers */}
                                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                            <div 
                                                className="flex items-center gap-2 px-3 py-1 rounded-xl border shadow-xs"
                                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
                                            >
                                                {/* FROM LEVEL */}
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-black uppercase" style={{ color: 'var(--text-muted)' }}>
                                                        {t.from_level}
                                                    </span>
                                                    <select
                                                        value={currentRange.min}
                                                        onChange={(e) => updateColumnMin(colIdx, e.target.value, availableLevels[availableLevels.length - 1])}
                                                        className="font-black text-xs px-2 py-1 rounded-lg border outline-none cursor-pointer"
                                                        style={{ 
                                                            backgroundColor: 'var(--bg-surface)', 
                                                            borderColor: 'var(--border-strong)',
                                                            color: 'var(--text-main)'
                                                        }}
                                                    >
                                                        {availableLevels.map(lvl => (
                                                            <option 
                                                                key={lvl} 
                                                                value={lvl} 
                                                                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                                                            >
                                                                {t.level_word} {lvl}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />

                                                {/* TO LEVEL */}
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-black uppercase" style={{ color: 'var(--text-muted)' }}>
                                                        {t.to_level}
                                                    </span>
                                                    <select
                                                        value={currentRange.max}
                                                        onChange={(e) => updateColumnMax(colIdx, e.target.value, availableLevels[0])}
                                                        className="font-black text-xs px-2 py-1 rounded-lg border outline-none cursor-pointer"
                                                        style={{ 
                                                            backgroundColor: 'var(--bg-surface)', 
                                                            borderColor: 'var(--border-strong)',
                                                            color: 'var(--text-main)'
                                                        }}
                                                    >
                                                        {availableLevels.map(lvl => (
                                                            <option 
                                                                key={lvl} 
                                                                value={lvl} 
                                                                disabled={lvl < currentRange.min} 
                                                                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                                                            >
                                                                {t.level_word} {lvl}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Math vs Story Mode Toggle per Column */}
                                            <div 
                                                className="flex items-center p-0.5 rounded-xl border shadow-xs"
                                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setColumnModes(prev => ({ ...prev, [colIdx]: 'math' }))}
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                                                        (columnModes[colIdx] || 'math') === 'math'
                                                            ? 'bg-indigo-600 text-white shadow-xs'
                                                            : 'opacity-60 hover:opacity-100'
                                                    }`}
                                                    style={(columnModes[colIdx] || 'math') !== 'math' ? { color: 'var(--text-main)' } : {}}
                                                    title="Vanligt tal / formel"
                                                >
                                                    <Calculator size={11} />
                                                    <span>Tal</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={!isTopicWordProblemReady(currentTopicId)}
                                                    onClick={() => setColumnModes(prev => ({ ...prev, [colIdx]: 'story' }))}
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                                                        columnModes[colIdx] === 'story'
                                                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs cursor-pointer'
                                                            : isTopicWordProblemReady(currentTopicId)
                                                                ? 'opacity-60 hover:opacity-100 cursor-pointer'
                                                                : 'opacity-25 cursor-not-allowed'
                                                    }`}
                                                    style={columnModes[colIdx] !== 'story' ? { color: 'var(--text-main)' } : {}}
                                                    title={!isTopicWordProblemReady(currentTopicId) ? "Inga textuppgifter tillgängliga för detta område" : "Textuppgift / vardagsproblem"}
                                                >
                                                    <Type size={11} />
                                                    <span>Text</span>
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setInspectedTopic(topicMeta)}
                                                className="p-2 rounded-xl border transition-colors shadow-xs cursor-pointer hover:border-indigo-400"
                                                style={{ 
                                                    backgroundColor: 'var(--bg-card)', 
                                                    borderColor: 'var(--border-main)', 
                                                    color: 'var(--text-main)' 
                                                }}
                                                title={t.inspect_btn}
                                            >
                                                <Info size={15} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Point Presets & Teams */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                                {t.point_scale}
                            </label>
                            <div className="flex gap-2">
                                {[
                                    { key: '100_500', label: '100 – 500 p' },
                                    { key: '10_50', label: '10 – 50 p' },
                                    { key: '1_5', label: '1 – 5 p' }
                                ].map(p => (
                                    <button
                                        key={p.key}
                                        type="button"
                                        onClick={() => setPointScalePreset(p.key)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                                            pointScalePreset === p.key 
                                                ? 'bg-amber-500 text-slate-950 font-black border-amber-500 shadow-sm' 
                                                : 'hover:border-amber-400'
                                        }`}
                                        style={pointScalePreset !== p.key ? { 
                                            backgroundColor: 'var(--bg-surface)', 
                                            borderColor: 'var(--border-main)', 
                                            color: 'var(--text-main)' 
                                        } : {}}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                                {t.teams_title}
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setTeamCount(num)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                            teamCount === num 
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                                : 'hover:border-indigo-400'
                                        }`}
                                        style={teamCount !== num ? { 
                                            backgroundColor: 'var(--bg-surface)', 
                                            borderColor: 'var(--border-main)', 
                                            color: 'var(--text-main)' 
                                        } : {}}
                                    >
                                        {num} {num === 1 ? t.solo : t.teams}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div 
                        className="pt-4 border-t flex items-center justify-between gap-3 shrink-0"
                        style={{ borderColor: 'var(--border-main)' }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {t.cancel}
                        </button>

                        <button
                            type="button"
                            onClick={handleDoLaunch}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
                        >
                            <Play size={14} />
                            <span>{t.open_board}</span>
                        </button>
                    </div>

                </form>

                {/* Level Inspector Modal */}
                {inspectedTopic && (
                    <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in">
                        <div 
                            className="rounded-3xl border w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
                            style={{ 
                                backgroundColor: 'var(--bg-card)', 
                                borderColor: 'var(--border-main)', 
                                color: 'var(--text-main)' 
                            }}
                        >
                            <div 
                                className="px-6 py-4 border-b flex items-center justify-between"
                                style={{ 
                                    backgroundColor: 'var(--bg-surface)', 
                                    borderColor: 'var(--border-main)' 
                                }}
                            >
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-wider text-inherit">
                                        {inspectedTopic.name}
                                    </h4>
                                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300">
                                        {t.level_overview_sub}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setInspectedTopic(null)}
                                    className="p-1.5 rounded-xl transition-colors cursor-pointer hover:bg-rose-500 hover:text-white"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                                {inspectedTopic.availableLevels.map(lvl => {
                                    const variations = inspectedTopic.levelMap?.[lvl] || [];
                                    return (
                                        <div 
                                            key={lvl} 
                                            className="p-3.5 rounded-2xl border space-y-1.5"
                                            style={{ 
                                                backgroundColor: 'var(--bg-surface)', 
                                                borderColor: 'var(--border-main)' 
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[10px]">
                                                    {t.level_word} {lvl}
                                                </span>
                                            </div>
                                            {variations.map(v => (
                                                <div key={v.key} className="pl-1">
                                                    <div className="text-xs font-bold text-inherit">
                                                        {v.name?.[lang] || v.name?.sv || v.key}
                                                    </div>
                                                    {v.desc && (
                                                        <p className="text-[11px] italic" style={{ color: 'var(--text-muted)' }}>
                                                            {v.desc?.[lang] || v.desc?.sv}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <CategoryClashHelpModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
                lang={lang}
            />
        </div>
    );
}