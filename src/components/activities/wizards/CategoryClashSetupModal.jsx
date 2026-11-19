// src/components/activities/wizards/CategoryClashSetupModal.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { 
    X, Grid, Trophy, Shuffle, Calculator, Type,
    Play, Info, HelpCircle, ArrowRight, Layers, Sliders
} from 'lucide-react';
import { SKILL_BUCKETS, isTopicWordProblemReady } from '../../../constants/skillBuckets.js';
import { extractSeedsFromPacket } from '../../../hooks/useGameQuestionPool.js';
import SpotlightTour from '../../shared/SpotlightTour';

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

    // Interactive Spotlight Tour State
    const storageKey = 'has_seen_category_clash_setup_guide';
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    useEffect(() => {
        if (isOpen && !localStorage.getItem(storageKey)) {
            const timer = setTimeout(() => setIsHelpOpen(true), 350);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleCloseTour = () => {
        localStorage.setItem(storageKey, 'true');
        setIsHelpOpen(false);
    };

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
    const teamColors = ['#059669', '#0284c7', '#d97706', '#e11d48'];

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

    // Spotlight Tour Steps
    const clashTourSteps = useMemo(() => [
        {
            selector: '[data-tour="clash-dimensions"]',
            title: {
                sv: '1. Välj storlek på spelplanen',
                en: '1. Choose Board Dimensions'
            },
            description: {
                sv: 'Ställ in 3–6 kolumner (ämnen) och 3–5 rader (poängnivåer). Ju fler rader, desto fler steg i svårighetstrappan.',
                en: 'Set 3–6 columns (topics) and 3–5 rows (point tiers). More rows create a finer difficulty progression.'
            }
        },
        {
            selector: '[data-tour="clash-categories"]',
            title: {
                sv: '2. Ämnen, nivåspann & Tal/Text',
                en: '2. Topics, Level Ranges & Math/Story'
            },
            description: {
                sv: 'Välj ämne och nivåspann (Från–Till) per kolumn så fördelas svårigheten automatiskt. Växla mellan "Tal" (formel) och "Text" (vardagsproblem), eller klicka på (i) för att se vad varje nivå innehåller.',
                en: 'Pick a topic and level range (From–To) per column for automatic difficulty scaling. Toggle "Math" vs "Story" per column, or click (i) to inspect level details.'
            }
        },
        {
            selector: '[data-tour="clash-settings"]',
            title: {
                sv: '3. Poängskala & Solo eller Lagspel',
                en: '3. Point Scale & Solo or Team Play'
            },
            description: {
                sv: 'Välj poängvalörer (t.ex. 100–500 p) och om eleverna ska tävla individuellt (Solo) eller samla poäng tillsammans i 2–4 lag.',
                en: 'Choose point values (e.g., 100–500 pts) and whether students compete individually (Solo) or together in 2–4 teams.'
            }
        },
        {
            selector: '[data-tour="clash-launch"]',
            title: {
                sv: '4. Öppna spelplanen & granska',
                en: '4. Open Game Board & Curate'
            },
            description: {
                sv: 'Klicka på "Öppna Spelplan" för att bygga brädet. Där kan du granska enskilda brickor, slumpa nya siffror och starta live med en 6-siffrig PIN!',
                en: 'Click "Open Game Board" to generate the board. You can inspect individual tiles, re-roll numbers, and launch live with a 6-digit PIN!'
            }
        }
    ], []);

    const t = {
        sv: {
            title: "Konfigurera Poängjakten",
            subtitle: "Poängjakten • Category Clash",
            game_desc_title: "Frågesportbräde med Automatisk Nivåtrappa",
            game_desc: "Välj ett nivåspann för varje ämne. Spelet fördelar automatiskt svårighetsgraden så att frågorna blir stegvis svårare för högre poäng.",
            grid_size_title: "1. Brädlayout & Storlek",
            cols_label: "Kolumner (Områden)",
            rows_label: "Rader (Poängnivåer)",
            categories_title: "2. Områden & Svårighetsspann per kolumn",
            from_level: "Från:",
            to_level: "Till:",
            inspect_btn: "Visa nivåer",
            level_word: "Nivå",
            point_scale: "Poängskala",
            teams_title: "Spelläge & Gruppindelning",
            game_settings_title: "3. Poäng & Spelläge",
            solo: "Solo",
            teams: "Lag",
            randomize: "Slumpa",
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
            grid_size_title: "1. Board Layout & Size",
            cols_label: "Columns (Topics)",
            rows_label: "Rows (Point Tiers)",
            categories_title: "2. Topics & Difficulty Range per Column",
            from_level: "From:",
            to_level: "To:",
            inspect_btn: "View levels",
            level_word: "Level",
            point_scale: "Point Scale",
            teams_title: "Game Mode & Teams",
            game_settings_title: "3. Points & Game Mode",
            solo: "Solo",
            teams: "Teams",
            randomize: "Randomize",
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
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans">
            <div 
                className="rounded-2xl shadow-2xl border w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-150"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-main)'
                }}
            >
                {/* Header */}
                <div 
                    className="px-6 py-4 border-b flex items-center justify-between shrink-0"
                    style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-main)'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shadow-2xs">
                            <Grid size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold uppercase tracking-tight text-inherit">{t.title}</h2>
                            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsHelpOpen(true)}
                            className="p-1.5 rounded-xl border transition-colors cursor-pointer hover:border-emerald-600 shadow-2xs"
                            style={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border-strong)',
                                color: 'var(--text-muted)'
                            }}
                            title={t.guide_tooltip}
                        >
                            <HelpCircle size={16} />
                        </button>
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="p-1.5 rounded-xl transition-colors cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Form Body */}
                <form onSubmit={(e) => { e.preventDefault(); handleDoLaunch(); }} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    
                    {/* Visual Concept Banner */}
                    <div className="bg-[var(--bg-surface)] text-[var(--text-main)] rounded-xl p-4 border border-[var(--border-main)] shadow-2xs flex items-center gap-4">
                        <div className="shrink-0 grid grid-cols-3 gap-1 bg-[var(--bg-card)] p-2 rounded-lg border border-[var(--border-strong)] w-24 text-center font-mono">
                            <div className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] py-1 rounded font-bold">L1</div>
                            <div className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] py-1 rounded font-bold">L2</div>
                            <div className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[9px] py-1 rounded font-black">L4</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Trophy size={15} className="text-amber-600 dark:text-amber-400" />
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)]">
                                    {t.game_desc_title}
                                </h3>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                {t.game_desc}
                            </p>
                        </div>
                    </div>

                    {/* SECTION 1: Grid Dimensions */}
                    <div data-tour="clash-dimensions" className="space-y-2.5">
                        <div className="flex items-center gap-2">
                            <Sliders size={15} className="text-sky-600 dark:text-sky-400" />
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                                {t.grid_size_title}
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                            <div 
                                className="p-3.5 rounded-xl border shadow-2xs"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>{t.cols_label}</span>
                                <div className="flex gap-1.5">
                                    {[3, 4, 5, 6].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setColumns(num)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                columns === num 
                                                    ? 'bg-sky-600 text-white shadow-2xs' 
                                                    : 'border hover:border-sky-500'
                                            }`}
                                            style={columns !== num ? { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' } : {}}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div 
                                className="p-3.5 rounded-xl border shadow-2xs"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>{t.rows_label}</span>
                                <div className="flex gap-1.5">
                                    {[3, 4, 5].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setRows(num)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                rows === num 
                                                    ? 'bg-sky-600 text-white shadow-2xs' 
                                                    : 'border hover:border-sky-500'
                                            }`}
                                            style={rows !== num ? { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' } : {}}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Categories & Difficulty Selector */}
                    <div data-tour="clash-categories" className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers size={15} className="text-emerald-600 dark:text-emerald-400" />
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                    {t.categories_title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleRandomizeTopics}
                                className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
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
                                        className="p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                                    >
                                        {/* Column Number & Topic Dropdown */}
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0 w-full sm:w-auto">
                                            <span 
                                                className="w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border"
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
                                                className="w-full border px-3 py-2 rounded-xl text-xs font-semibold outline-none cursor-pointer truncate shadow-inner focus:border-emerald-600 transition-colors"
                                                style={{ 
                                                    backgroundColor: 'var(--bg-card)', 
                                                    borderColor: 'var(--border-strong)', 
                                                    color: 'var(--text-main)' 
                                                }}
                                            >
                                                {allTopics.map(topic => (
                                                    <option 
                                                        key={topic.id} 
                                                        value={topic.id} 
                                                        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                                                    >
                                                        {topic.categoryName} — {topic.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Min / Max Range Pickers */}
                                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                            <div 
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-2xs"
                                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)' }}
                                            >
                                                {/* FROM LEVEL */}
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                                                        {t.from_level}
                                                    </span>
                                                    <select
                                                        value={currentRange.min}
                                                        onChange={(e) => updateColumnMin(colIdx, e.target.value, availableLevels[availableLevels.length - 1])}
                                                        className="font-bold font-mono text-xs px-2 py-1 rounded-lg border outline-none cursor-pointer"
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
                                                    <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                                                        {t.to_level}
                                                    </span>
                                                    <select
                                                        value={currentRange.max}
                                                        onChange={(e) => updateColumnMax(colIdx, e.target.value, availableLevels[0])}
                                                        className="font-bold font-mono text-xs px-2 py-1 rounded-lg border outline-none cursor-pointer"
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
                                                className="flex items-center p-0.5 rounded-xl border shadow-2xs"
                                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)' }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setColumnModes(prev => ({ ...prev, [colIdx]: 'math' }))}
                                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                                                        (columnModes[colIdx] || 'math') === 'math'
                                                            ? 'bg-emerald-600 text-white shadow-2xs'
                                                            : 'opacity-60 hover:opacity-100'
                                                    }`}
                                                    style={(columnModes[colIdx] || 'math') !== 'math' ? { color: 'var(--text-main)' } : {}}
                                                    title="Standard math"
                                                >
                                                    <Calculator size={11} />
                                                    <span>Tal</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={!isTopicWordProblemReady(currentTopicId)}
                                                    onClick={() => setColumnModes(prev => ({ ...prev, [colIdx]: 'story' }))}
                                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                                                        columnModes[colIdx] === 'story'
                                                            ? 'bg-amber-500 text-white shadow-2xs cursor-pointer'
                                                            : isTopicWordProblemReady(currentTopicId)
                                                                ? 'opacity-60 hover:opacity-100 cursor-pointer'
                                                                : 'opacity-25 cursor-not-allowed'
                                                    }`}
                                                    style={columnModes[colIdx] !== 'story' ? { color: 'var(--text-main)' } : {}}
                                                    title={!isTopicWordProblemReady(currentTopicId) ? "No word problems available" : "Word problem"}
                                                >
                                                    <Type size={11} />
                                                    <span>Text</span>
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setInspectedTopic(topicMeta)}
                                                className="p-2 rounded-xl border transition-colors shadow-2xs cursor-pointer hover:border-emerald-600"
                                                style={{ 
                                                    backgroundColor: 'var(--bg-card)', 
                                                    borderColor: 'var(--border-strong)', 
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

                    {/* SECTION 3: Point Scale & Teams */}
                    <div data-tour="clash-settings" className="space-y-2.5">
                        <div className="flex items-center gap-2">
                            <Trophy size={15} className="text-amber-600 dark:text-amber-400" />
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                {t.game_settings_title}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
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
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-2xs ${
                                                pointScalePreset === p.key 
                                                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs' 
                                                    : 'hover:border-amber-600'
                                            }`}
                                            style={pointScalePreset !== p.key ? { 
                                                backgroundColor: 'var(--bg-surface)', 
                                                borderColor: 'var(--border-strong)', 
                                                color: 'var(--text-main)' 
                                            } : {}}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                                    {t.teams_title}
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setTeamCount(num)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-2xs ${
                                                teamCount === num 
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                                                    : 'hover:border-emerald-600'
                                            }`}
                                            style={teamCount !== num ? { 
                                                backgroundColor: 'var(--bg-surface)', 
                                                borderColor: 'var(--border-strong)', 
                                                color: 'var(--text-main)' 
                                            } : {}}
                                        >
                                            {num} {num === 1 ? t.solo : t.teams}
                                        </button>
                                    ))}
                                </div>
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
                            className="px-4 py-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer shadow-2xs"
                        >
                            {t.cancel}
                        </button>

                        <button
                            data-tour="clash-launch"
                            type="button"
                            onClick={handleDoLaunch}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <Play size={14} fill="currentColor" />
                            <span>{t.open_board}</span>
                        </button>
                    </div>

                </form>

                {/* Level Inspector Modal */}
                {inspectedTopic && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-150">
                        <div 
                            className="rounded-2xl border w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
                            style={{ 
                                backgroundColor: 'var(--bg-card)', 
                                borderColor: 'var(--border-strong)', 
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
                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-inherit">
                                        {inspectedTopic.name}
                                    </h4>
                                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                        {t.level_overview_sub}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setInspectedTopic(null)}
                                    className="p-1.5 rounded-xl transition-colors cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-3">
                                {inspectedTopic.availableLevels.map(lvl => {
                                    const variations = inspectedTopic.levelMap?.[lvl] || [];
                                    return (
                                        <div 
                                            key={lvl} 
                                            className="p-3.5 rounded-xl border space-y-1.5 shadow-2xs"
                                            style={{ 
                                                backgroundColor: 'var(--bg-surface)', 
                                                borderColor: 'var(--border-main)' 
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold font-mono text-[10px]">
                                                    {t.level_word} {lvl}
                                                </span>
                                            </div>
                                            {variations.map(v => (
                                                <div key={v.key} className="pl-1">
                                                    <div className="text-xs font-semibold text-inherit">
                                                        {v.name?.[lang] || v.name?.sv || v.key}
                                                    </div>
                                                    {v.desc && (
                                                        <p className="text-[11px] italic font-medium" style={{ color: 'var(--text-muted)' }}>
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

            {/* INTERACTIVE SPOTLIGHT WALKTHROUGH TOUR */}
            <SpotlightTour
                steps={clashTourSteps}
                isOpen={isHelpOpen}
                onClose={handleCloseTour}
                lang={lang}
            />
        </div>
    );
}