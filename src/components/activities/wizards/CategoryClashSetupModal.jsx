// src/components/activities/wizards/CategoryClashSetupModal.jsx
import React, { useState, useMemo } from 'react';
import { 
    X, Grid, Sparkles, Trophy, Shuffle, Gauge, 
    Play, Info, ChevronRight, HelpCircle, ArrowRight, Monitor
} from 'lucide-react';
import { SKILL_BUCKETS } from '../../../constants/skillBuckets.js';
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
    // 🟢 Strict teacher / super_admin role checking
    const userRole = String(profile?.role || '').toLowerCase();
    const isTeacher = userRole === 'teacher' || userRole === 'super_admin';
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Check if sourcePacket is actually a board structure or a questions array
    const savedDimensions = sourcePacket?.dimensions || (Array.isArray(sourcePacket) ? null : null);
    const savedCategories = sourcePacket?.categories || [];

    // 🟢 1. Detect if loading a pre-saved board or template
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

    // 3. Per-Column Custom Ranges: initialize from saved categories if available
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

    // 4. Intentional Level Inspector Modal state
    const [inspectedTopic, setInspectedTopic] = useState(null);

    // 5. Teams & Points
    const [pointScalePreset, setPointScalePreset] = useState('100_500');
    const [teamCount, setTeamCount] = useState(existingTeams?.length || 2);
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

    // 6. Source packet integration: Handle both Array and Object tile structures
    const rawTiles = useMemo(() => {
        const candidate = sourcePacket?.tiles || activeBoardData?.tiles || sourcePacket;
        if (Array.isArray(candidate)) return candidate;
        if (candidate && typeof candidate === 'object') return Object.values(candidate);
        return [];
    }, [sourcePacket, activeBoardData]);

    const seedInfo = useMemo(() => extractSeedsFromPacket(rawTiles || []), [rawTiles]);
    const hasSourcePacket = Boolean(rawTiles && rawTiles.length > 0);
    const [sourceMode, setSourceMode] = useState(hasSourcePacket ? 'as_is' : 'procedural');
    const [wordProblems, setWordProblems] = useState(savedBoard?.config?.wordProblems || false);
    // Index all topics and their variation milestones
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

    // Initial selected topics per column: prioritize saved board categories
    const [selectedTopics, setSelectedTopics] = useState(() => {
        if (existingCategories.length > 0) {
            return existingCategories.map(c => c.topic);
        }
        if (hasSourcePacket && seedInfo.topics.length > 0) {
            return Array.from({ length: 6 }, (_, idx) => seedInfo.topics[idx % seedInfo.topics.length]);
        }
        return ['equations', 'fraction_arith', 'percent', 'geometry', 'statistics', 'pythagoras'];
    });

    if (!isOpen) return null;

    const t = {
        sv: {
            title: "Konfigurera Poängjakten",
            game_desc_title: "Frågesportbräde med Automatisk Nivåtrappa",
            game_desc: "Välj ett nivåspann för varje ämne. Spelet fördelar automatiskt svårighetsgraden så att frågorna blir stegvis svårare för högre poäng.",
            grid_size: "Brädstorlek (Kolumner x Rader)",
            cols_label: "Kolumner (Områden)",
            rows_label: "Rader (Poängnivåer)",
            categories_title: "Områden & Svårighetsspann per kolumn",
            from_level: "Från:",
            to_level: "Till:",
            inspect_btn: "Visa nivåer",
            point_scale: "Poängskala",
            teams_title: "Lagindelning",
            word_problems: "Aktivera textuppgifter / problemlösning",
            cancel: "Avbryt"
        },
        en: {
            title: "Configure Category Clash",
            game_desc_title: "Trivia Board with Automatic Progression",
            game_desc: "Choose a level range for each category. The game automatically distributes tiers so higher points correspond to harder questions.",
            grid_size: "Grid Size (Columns x Rows)",
            cols_label: "Columns (Topics)",
            rows_label: "Rows (Point Tiers)",
            categories_title: "Topics & Difficulty Range per Column",
            from_level: "From:",
            to_level: "To:",
            inspect_btn: "View levels",
            point_scale: "Point Scale",
            teams_title: "Teams",
            word_problems: "Enable story problems & context",
            cancel: "Cancel"
        }
    }[lang];

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

    const handleDoLaunch = (target) => {
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
                maxLevel: safeMax
            };
        });

        const activeTeams = Array.from({ length: teamCount }, (_, idx) => ({
            id: `team_${idx}`,
            name: teamNames[idx] || `Team ${idx + 1}`,
            color: teamColors[idx],
            score: 0
        }));

        // 🟢 Pass tiles and saved board structure directly into onLaunch
        onLaunch({
            launchTarget: target, // 'local' | 'live'
            dimensions: { columns, rows },
            pointScale: calculatePointScale(),
            categories: activeCategories,
            teams: activeTeams,
            wordProblems,
            sourceMode: hasSourcePacket ? 'as_is' : 'procedural',
            tiles: rawTiles,
            savedBoard: savedBoard || null
        });
    };

    return (
        <div className="fixed inset-0 z-[500] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in select-none">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 relative">
                
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <Grid size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">{t.title}</h2>
                            <p className="text-xs font-bold text-slate-400">Poängjakten • Category Clash</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsHelpOpen(true)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 transition-colors cursor-pointer"
                        title={lang === 'sv' ? "Instruktioner & Spelguide" : "Instructions & Game Guide"}
                    >
                        <HelpCircle size={16} />
                    </button>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={(e) => { e.preventDefault(); handleDoLaunch('local'); }} className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6">
                    
                    {/* Visual Concept Banner */}
                    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-5 border border-indigo-800/60 shadow-md flex items-center gap-5">
                        <div className="shrink-0 grid grid-cols-3 gap-1 bg-slate-950/60 p-2 rounded-xl border border-indigo-500/30 w-28 text-center font-mono">
                            <div className="bg-indigo-600/40 text-indigo-300 text-[9px] py-1 rounded">Nivå 1</div>
                            <div className="bg-indigo-600/60 text-indigo-200 text-[9px] py-1 rounded">Nivå 2</div>
                            <div className="bg-indigo-600/90 text-amber-300 text-[9px] py-1 rounded font-black">Nivå 4</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Trophy size={16} className="text-amber-400" />
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                                    {t.game_desc_title}
                                </h3>
                            </div>
                            <p className="text-xs text-indigo-200/90 leading-relaxed font-medium">
                                {t.game_desc}
                            </p>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-400 block mb-2">{t.cols_label}</span>
                            <div className="flex gap-1.5">
                                {[3, 4, 5, 6].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setColumns(num)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                            columns === num ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-400 block mb-2">{t.rows_label}</span>
                            <div className="flex gap-1.5">
                                {[3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setRows(num)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                            rows === num ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Categories with Clean From/To Selectors & Info Button */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                                {t.categories_title}
                            </label>
                            <button
                                type="button"
                                onClick={handleRandomizeTopics}
                                className="text-[11px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                            >
                                <Shuffle size={12} />
                                Slumpa
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
                                    <div key={colIdx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        
                                        {/* Column Number & Topic Dropdown */}
                                        <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:w-auto">
                                            <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                                                {colIdx + 1}
                                            </span>
                                            <select
                                                value={currentTopicId}
                                                onChange={(e) => handleTopicChange(colIdx, e.target.value)}
                                                className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer truncate shadow-2xs"
                                            >
                                                {allTopics.map(topic => (
                                                    <option key={topic.id} value={topic.id}>
                                                        {topic.categoryName} • {topic.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Clean Predictable Min / Max Dropdowns + Dedicated Inspect Button */}
                                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                                                {/* Min Level Select */}
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-black uppercase text-slate-400">{t.from_level}</span>
                                                    <select
                                                        value={currentRange.min}
                                                        onChange={(e) => updateColumnMin(colIdx, e.target.value, availableLevels[availableLevels.length - 1])}
                                                        className="bg-slate-50 font-black text-indigo-700 text-xs px-1.5 py-1 rounded-lg border border-slate-200 outline-none cursor-pointer"
                                                    >
                                                        {availableLevels.map(lvl => (
                                                            <option key={lvl} value={lvl}>Nivå {lvl}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <ArrowRight size={12} className="text-slate-300" />

                                                {/* Max Level Select */}
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-black uppercase text-slate-400">{t.to_level}</span>
                                                    <select
                                                        value={currentRange.max}
                                                        onChange={(e) => updateColumnMax(colIdx, e.target.value, availableLevels[0])}
                                                        className="bg-slate-50 font-black text-indigo-700 text-xs px-1.5 py-1 rounded-lg border border-slate-200 outline-none cursor-pointer"
                                                    >
                                                        {availableLevels.map(lvl => (
                                                            <option key={lvl} value={lvl} disabled={lvl < currentRange.min}>
                                                                Nivå {lvl}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Intentional Info Button */}
                                            <button
                                                type="button"
                                                onClick={() => setInspectedTopic(topicMeta)}
                                                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-2xs cursor-pointer"
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

                    {/* Teams & Point Tier Presets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
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
                                            pointScalePreset === p.key ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-200'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                                {t.teams_title}
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setTeamCount(num)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                            teamCount === num ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
                                        }`}
                                    >
                                        {num} {num === 1 ? 'Solo' : 'Lag'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Word Problems Checkbox */}
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={wordProblems}
                            onChange={(e) => setWordProblems(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-bold text-slate-700">{t.word_problems}</span>
                    </label>

                    {/* Action Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                        >
                            {t.cancel}
                        </button>

                        <div className="flex items-center gap-2">
                            {/* Standard Projector/Solo Launch */}
                            <button
                                type="button"
                                onClick={() => handleDoLaunch('local')}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                            >
                                <Play size={14} />
                                <span>{isTeacher ? (lang === 'sv' ? "Projektorläge" : "Projector Mode") : (lang === 'sv' ? "Spela" : "Play")}</span>
                            </button>

                            {/* 🟢 Live Room Launch (Strictly for teacher & super_admin) */}
                            {isTeacher && (
                                <button
                                    type="button"
                                    onClick={() => handleDoLaunch('live')}
                                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
                                >
                                    <Monitor size={14} />
                                    <span>{lang === 'sv' ? "Starta Live-rum" : "Host Live Room"}</span>
                                </button>
                            )}
                        </div>
                    </div>

                </form>

                {/* Level Inspector Modal */}
                {inspectedTopic && (
                    <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in">
                        <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] overflow-hidden text-slate-800">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                        {inspectedTopic.name}
                                    </h4>
                                    <span className="text-[11px] font-bold text-indigo-600">
                                        Nivåöversikt & Delmoment
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setInspectedTopic(null)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                                {inspectedTopic.availableLevels.map(lvl => {
                                    const variations = inspectedTopic.levelMap?.[lvl] || [];
                                    return (
                                        <div key={lvl} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[10px]">
                                                    Nivå {lvl}
                                                </span>
                                            </div>
                                            {variations.map(v => (
                                                <div key={v.key} className="pl-1">
                                                    <div className="text-xs font-bold text-slate-800">
                                                        {v.name?.[lang] || v.name?.sv || v.key}
                                                    </div>
                                                    {v.desc && (
                                                        <p className="text-[11px] text-slate-500 italic">
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