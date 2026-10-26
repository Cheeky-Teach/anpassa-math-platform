// src/components/activities/engines/CategoryClashEngine.jsx
import React, { useState, useEffect } from 'react';
import { 
    X, Play, Edit3, Save, RotateCcw, Award, Check, 
    RefreshCcw, Eye, Lock, Building2, HelpCircle,
    LayoutGrid, ListFilter, Type, Calculator, Image as ImageIcon
} from 'lucide-react';
import { useGameQuestionPool } from '../../../hooks/useGameQuestionPool.js';
import GameQuestionStageModal from '../../shared/GameQuestionStageModal.jsx';
import MathDisplay from '../../shared/MathDisplay.jsx';
import { supabase } from '../../../lib/supabaseClient.js';

export default function CategoryClashEngine({
    initialConfig,       // { dimensions, pointScale, categories, teams, wordProblems, sourceMode, startLevel }
    sourcePacket = null,
    savedBoard = null,   // Optional: if opening a previously saved board from saved_sheets
    onClose,
    lang = 'sv'
}) {
    // 1. Core State
    const [mode, setMode] = useState('curate'); // 'curate' | 'play'
    const [curateView, setCurateView] = useState('grid'); // 'grid' | 'audit'
    const [title, setTitle] = useState(savedBoard?.title || (lang === 'sv' ? 'Poängjakten' : 'Category Clash'));
    const [visibility, setVisibility] = useState(savedBoard?.visibility || 'private');
    const [isSaving, setIsSaving] = useState(false);
    const [boardId, setBoardId] = useState(savedBoard?.id || null);

    // Grid configuration
    const dimensions = initialConfig?.dimensions || savedBoard?.packet?.dimensions || { columns: 4, rows: 4 };
    const pointScale = initialConfig?.pointScale || savedBoard?.packet?.pointScale || [100, 200, 300, 400];
    const categories = initialConfig?.categories || savedBoard?.packet?.categories || [];
    
    // Teams & Scores
    const [teams, setTeams] = useState(savedBoard?.config?.teams || initialConfig?.teams || [
        { id: 'team_0', name: 'Lag Röd', color: '#ef4444', score: 0 },
        { id: 'team_1', name: 'Lag Blå', color: '#3b82f6', score: 0 }
    ]);

    // Tile cleared state (slotId -> boolean)
    const [clearedTiles, setClearedTiles] = useState(savedBoard?.packet?.clearedTiles || {});

    // Stage Modal state
    const [activeSlotId, setActiveSlotId] = useState(null);
    const [isStageModalOpen, setIsStageModalOpen] = useState(false);

    // Question Pool Hook
    const { 
        pool, 
        isLoading, 
        loadBatchSpecs, 
        ingestAsIs, 
        generateGridFromSeeds,
        regenerateSlot,
        updateSlotManually
    } = useGameQuestionPool({ lang });

    // Initial Hydration
    useEffect(() => {
        if (savedBoard?.packet?.tiles) {
            ingestAsIs(savedBoard.packet.tiles);
        } else if (initialConfig?.sourceMode === 'as_is' && sourcePacket) {
            ingestAsIs(sourcePacket);
        } else {
            // Forward categories (with their per-column startLevels)
            generateGridFromSeeds({
                topics: categories.map(c => c.topic),
                categories: categories,
                columns: dimensions.columns,
                rows: dimensions.rows,
                startLevel: initialConfig?.startLevel || 1,
                wordProblems: initialConfig?.wordProblems || false
            });
        }
    }, []);

    // Active question for stage modal
    const activeQuestion = activeSlotId ? pool[activeSlotId] : null;
    const activePoints = activeSlotId ? (
        pointScale[parseInt(activeSlotId.split('_r')[1], 10)] || 100
    ) : 100;

    // Tile Click Handler
    const handleTileClick = (slotId) => {
        if (clearedTiles[slotId] && mode === 'play') return;
        setActiveSlotId(slotId);
        setIsStageModalOpen(true);
    };

    // Award Points to Team
    const handleAwardPoints = (teamId, pts) => {
        setTeams(prev => prev.map(t => t.id === teamId ? { ...t, score: t.score + pts } : t));
        if (activeSlotId) {
            setClearedTiles(prev => ({ ...prev, [activeSlotId]: true }));
        }
        setIsStageModalOpen(false);
    };

    // Toggle element visibility directly on a slot
    const toggleSlotElement = (slotId, key) => {
        const current = pool[slotId];
        if (!current) return;
        const currentVal = current[key] !== false;
        updateSlotManually(slotId, { [key]: !currentVal });
    };

    // Regenerate entire board
    const handleRegenerateAll = async () => {
        if (!window.confirm(lang === 'sv' ? "Slumpa nya tal för alla frågor på brädet?" : "Re-roll numbers for all questions?")) return;
        generateGridFromSeeds({
            topics: categories.map(c => c.topic),
            categories: categories,
            columns: dimensions.columns,
            rows: dimensions.rows,
            startLevel: initialConfig?.startLevel || 1,
            wordProblems: initialConfig?.wordProblems || false
        });
    };

    // Save Board to Supabase `saved_sheets`
    const handleSaveBoard = async () => {
        setIsSaving(true);
        try {
            const { data: authData } = await supabase.auth.getUser();
            const teacherId = authData?.user?.id;
            if (!teacherId) throw new Error("Not authenticated");

            const tilesArray = Object.values(pool);

            const payload = {
                title: title.trim() || (lang === 'sv' ? 'Poängjakten' : 'Category Clash'),
                type: 'activity_category_clash',
                user_id: teacherId,
                visibility,
                auto_topics: categories.map(c => c.topic),
                packet: {
                    gameKey: 'category_clash',
                    dimensions,
                    pointScale,
                    categories,
                    clearedTiles,
                    tiles: tilesArray
                },
                config: {
                    teams,
                    wordProblems: initialConfig?.wordProblems || false,
                    startLevel: initialConfig?.startLevel || 1
                }
            };

            let res;
            if (boardId) {
                res = await supabase.from('saved_sheets').update(payload).eq('id', boardId).select().single();
            } else {
                res = await supabase.from('saved_sheets').insert([payload]).select().single();
            }

            if (res.error) throw res.error;
            setBoardId(res.data.id);
            alert(lang === 'sv' ? "Spelet har sparats i ditt bibliotek!" : "Game saved to your library!");
        } catch (err) {
            console.error("Save Game Error:", err);
            alert(lang === 'sv' ? "Kunde inte spara spelet." : "Failed to save game.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetScores = () => {
        if (!window.confirm(lang === 'sv' ? "Nollställ alla poäng och rensa brickor?" : "Reset all scores and clear tiles?")) return;
        setTeams(prev => prev.map(t => ({ ...t, score: 0 })));
        setClearedTiles({});
    };

    return (
        <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col font-sans select-none overflow-hidden animate-in fade-in">
            
            {/* Top Navigation & Status Bar */}
            <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between text-white shrink-0 gap-4">
                
                {/* Left: Title & Visibility */}
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-white/10 hover:bg-white/20 focus:bg-white focus:text-slate-900 text-white px-3 py-1.5 rounded-xl font-black text-sm tracking-wide outline-none transition-all w-48 sm:w-60"
                        placeholder="Namn på spelet..."
                    />

                    <div className="flex items-center gap-0.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button
                            onClick={() => setVisibility('private')}
                            className={`p-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${visibility === 'private' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            title="Bara jag (Privat)"
                        >
                            <Lock size={14} />
                        </button>
                        <button
                            onClick={() => setVisibility('school')}
                            className={`p-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${visibility === 'school' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            title="Min Skola"
                        >
                            <Building2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Center: Curate vs Play Switcher + Grid/Audit sub-tabs */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button
                            onClick={() => setMode('curate')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                mode === 'curate' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Edit3 size={13} />
                            {lang === 'sv' ? "Redigera" : "Curate"}
                        </button>
                        <button
                            onClick={() => setMode('play')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                mode === 'play' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Play size={13} />
                            {lang === 'sv' ? "Spela" : "Play"}
                        </button>
                    </div>

                    {/* Curate View Switcher: Grid vs Audit List */}
                    {mode === 'curate' && (
                        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
                            <button
                                onClick={() => setCurateView('grid')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                                    curateView === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                                }`}
                                title="Rutnätsvy"
                            >
                                <LayoutGrid size={12} />
                                <span className="hidden sm:inline">Rutnät</span>
                            </button>
                            <button
                                onClick={() => setCurateView('audit')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                                    curateView === 'audit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                                }`}
                                title="Snabbgranska alla frågor som lista"
                            >
                                <ListFilter size={12} />
                                <span className="hidden sm:inline">Granska ({dimensions.columns * dimensions.rows})</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Actions (Regenerate All, Save, Reset, Close) */}
                <div className="flex items-center gap-2">
                    {mode === 'curate' && (
                        <button
                            onClick={handleRegenerateAll}
                            disabled={isLoading}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
                            title="Slumpa om alla brickor"
                        >
                            <RefreshCcw size={13} className={isLoading ? "animate-spin" : ""} />
                            <span className="hidden md:inline">Slumpa alla</span>
                        </button>
                    )}

                    <button
                        onClick={handleSaveBoard}
                        disabled={isSaving}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
                    >
                        <Save size={14} />
                        <span className="hidden sm:inline">{lang === 'sv' ? "Spara" : "Save"}</span>
                    </button>

                    <button
                        onClick={handleResetScores}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 cursor-pointer"
                        title={lang === 'sv' ? "Nollställ poäng och brickor" : "Reset tiles and scores"}
                    >
                        <RotateCcw size={15} />
                    </button>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 border border-slate-700 transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>
            </header>

            {/* Scoreboard Bar (Play Mode with Teams) */}
            {mode === 'play' && teams.length > 0 && (
                <div className="bg-slate-900/60 border-b border-slate-800/80 px-8 py-2.5 flex items-center justify-center gap-6">
                    {teams.map(team => (
                        <div key={team.id} className="flex items-center gap-2.5 bg-slate-800/80 px-4 py-1.5 rounded-2xl border border-slate-700/60">
                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: team.color }} />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-200">{team.name}:</span>
                            <span className="text-sm font-black text-amber-300 font-mono">{team.score} p</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Viewport */}
            <main className="flex-1 overflow-auto custom-scrollbar p-6 sm:p-10 flex items-center justify-center">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                        <RefreshCcw size={28} className="animate-spin text-indigo-500" />
                        <span className="text-xs font-black uppercase tracking-widest">
                            {lang === 'sv' ? "Bygger spelbräde..." : "Constructing board..."}
                        </span>
                    </div>
                ) : mode === 'curate' && curateView === 'audit' ? (
                    
                    /* 🟢 1. AUDIT / TABLE REVIEW VIEW */
                    <div className="w-full max-w-6xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-full max-h-[82vh] overflow-hidden">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                                    Översikt & Granskning av Frågor
                                </h3>
                                <p className="text-xs font-medium text-slate-400">
                                    Kontrollera frågor, dölj formler vid behov, eller slumpa om enskilda rutor.
                                </p>
                            </div>
                            <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {dimensions.columns * dimensions.rows} brickor totalt
                            </span>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar pt-4">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="pb-3 w-16">Plats</th>
                                        <th className="pb-3 w-28">Kategori</th>
                                        <th className="pb-3 w-16 text-center">Nivå</th>
                                        <th className="pb-3 w-16 text-center">Poäng</th>
                                        <th className="pb-3">Frågetext / Uppgift</th>
                                        <th className="pb-3 w-32">Facit</th>
                                        <th className="pb-3 w-32 text-center">Synlighet</th>
                                        <th className="pb-3 w-24 text-right">Åtgärd</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {Array.from({ length: dimensions.rows }).map((_, rowIdx) => (
                                        <React.Fragment key={rowIdx}>
                                            {Array.from({ length: dimensions.columns }).map((_, colIdx) => {
                                                const slotId = `c${colIdx}_r${rowIdx}`;
                                                const tileQuestion = pool[slotId];
                                                const points = pointScale[rowIdx] || 100;
                                                const catObj = categories[colIdx];
                                                const renderData = tileQuestion?.renderData || tileQuestion?.resolvedData?.renderData || {};
                                                const answer = tileQuestion?.answer || renderData.answer || null;
                                                const isWordProblem = Boolean(tileQuestion?.wordProblem || renderData.isWordProblemApplied);

                                                return (
                                                    <tr key={slotId} className="hover:bg-slate-800/40 transition-colors">
                                                        {/* Slot */}
                                                        <td className="py-3 font-mono font-bold text-slate-500">
                                                            {slotId}
                                                        </td>

                                                        {/* Category */}
                                                        <td className="py-3 font-black text-indigo-300 truncate max-w-[120px]">
                                                            {catObj?.name || `Kat ${colIdx + 1}`}
                                                        </td>

                                                        {/* Level */}
                                                        <td className="py-3 text-center">
                                                            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px]">
                                                                N{tileQuestion?.level || (rowIdx + 1)}
                                                            </span>
                                                        </td>

                                                        {/* Points */}
                                                        <td className="py-3 text-center font-black font-mono text-amber-300">
                                                            {points}p
                                                        </td>

                                                        {/* Question Preview */}
                                                        <td className="py-3 pr-4 max-w-md">
                                                            {tileQuestion ? (
                                                                <div>
                                                                    {renderData.description && (
                                                                        <div className="font-medium text-slate-200 line-clamp-2 leading-relaxed">
                                                                            <MathDisplay content={renderData.description} />
                                                                        </div>
                                                                    )}
                                                                    {renderData.latex && (
                                                                        <div className={`font-serif text-[11px] mt-0.5 ${tileQuestion.showLatex === false ? 'line-through text-slate-500' : 'text-emerald-400'}`}>
                                                                            <MathDisplay content={`$$${renderData.latex}$$`} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-600 italic">Laddar fråga...</span>
                                                            )}
                                                        </td>

                                                        {/* Answer */}
                                                        <td className="py-3 font-mono font-bold text-emerald-400 truncate max-w-[120px]">
                                                            {answer ? <MathDisplay content={`$${String(answer).replace(/\$/g, '')}$`} /> : '—'}
                                                        </td>

                                                        {/* Visibility Masking Toggles */}
                                                        <td className="py-3 text-center">
                                                            <div className="flex items-center justify-center gap-1">
                                                                {renderData.description && (
                                                                    <button
                                                                        onClick={() => toggleSlotElement(slotId, 'showText')}
                                                                        className={`p-1.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                                                                            tileQuestion.showText !== false 
                                                                                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300' 
                                                                                : 'bg-slate-800 border-slate-700 text-slate-600 line-through'
                                                                        }`}
                                                                        title="Dölj/visa text"
                                                                    >
                                                                        <Type size={12} />
                                                                    </button>
                                                                )}

                                                                {renderData.latex && (
                                                                    <button
                                                                        onClick={() => toggleSlotElement(slotId, 'showLatex')}
                                                                        className={`p-1.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                                                                            tileQuestion.showLatex !== false 
                                                                                ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300' 
                                                                                : 'bg-slate-800 border-slate-700 text-slate-600 line-through'
                                                                        }`}
                                                                        title="Dölj/visa formel"
                                                                    >
                                                                        <Calculator size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Action Buttons */}
                                                        <td className="py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => regenerateSlot(slotId)}
                                                                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors cursor-pointer"
                                                                    title="Slumpa nya siffror"
                                                                >
                                                                    <RefreshCcw size={12} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleTileClick(slotId)}
                                                                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-[10px] font-black uppercase transition-all cursor-pointer"
                                                                >
                                                                    Visa
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                ) : (

                    /* 2. CLASSIC 2D GAME BOARD (Play Mode or Grid Curate Mode) */
                    <div 
                        className="grid gap-3 sm:gap-4 w-full max-w-6xl h-full max-h-[82vh]"
                        style={{
                            gridTemplateColumns: `repeat(${dimensions.columns}, minmax(0, 1fr))`,
                            gridTemplateRows: `auto repeat(${dimensions.rows}, minmax(0, 1fr))`
                        }}
                    >
                        {/* 1. Header Row: Category Names */}
                        {categories.slice(0, dimensions.columns).map((cat, colIdx) => (
                            <div 
                                key={cat.id || colIdx}
                                className="bg-indigo-950/80 border-2 border-indigo-700/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-lg min-h-[50px]"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                    {lang === 'sv' ? `Kategori ${colIdx + 1}` : `Category ${colIdx + 1}`}
                                </span>
                                <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider line-clamp-1">
                                    {cat.name}
                                </span>
                            </div>
                        ))}

                        {/* 2. Grid Tiles */}
                        {Array.from({ length: dimensions.rows }).map((_, rowIdx) => (
                            <React.Fragment key={rowIdx}>
                                {Array.from({ length: dimensions.columns }).map((_, colIdx) => {
                                    const slotId = `c${colIdx}_r${rowIdx}`;
                                    const tileQuestion = pool[slotId];
                                    const points = pointScale[rowIdx] || 100;
                                    const isCleared = Boolean(clearedTiles[slotId]);

                                    return (
                                        <div
                                            key={slotId}
                                            onClick={() => handleTileClick(slotId)}
                                            className={`relative rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all cursor-pointer select-none group
                                                ${isCleared && mode === 'play'
                                                    ? 'bg-slate-900/40 border-slate-800/60 text-slate-700 opacity-30 cursor-not-allowed'
                                                    : 'bg-slate-900 border-indigo-500/40 hover:border-amber-400 hover:bg-slate-800/90 hover:scale-[1.02] shadow-xl text-amber-300'
                                                }`}
                                        >
                                            {/* Curate Mode Tile Quick Actions */}
                                            {mode === 'curate' && tileQuestion && (
                                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            regenerateSlot(slotId);
                                                        }}
                                                        className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700 cursor-pointer"
                                                        title={lang === 'sv' ? "Slumpa nya siffror" : "Roll new numbers"}
                                                    >
                                                        <RefreshCcw size={11} />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Points Value Stamp */}
                                            <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight drop-shadow-md">
                                                {isCleared && mode === 'play' ? '—' : points}
                                            </span>

                                            {/* Curate Mode Level & Type Label */}
                                            {mode === 'curate' && tileQuestion && (
                                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider mt-1">
                                                    Nivå {tileQuestion.level || (rowIdx + 1)}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </main>

            {/* Universal Stage Modal */}
            <GameQuestionStageModal
                isOpen={isStageModalOpen}
                onClose={() => setIsStageModalOpen(false)}
                question={activeQuestion}
                points={activePoints}
                teams={teams}
                onAwardPoints={handleAwardPoints}
                onRegenerate={() => regenerateSlot(activeSlotId)}
                lang={lang}
                showPointsAwarding={mode === 'play' && teams.length > 0}
            />
        </div>
    );
}