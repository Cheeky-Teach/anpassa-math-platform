// src/components/activities/engines/CategoryClashEngine.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Play, Edit3, Save, RotateCcw, Award, Check, 
    RefreshCcw, Eye, Lock, Building2, HelpCircle,
    LayoutGrid, ListFilter, Type, Calculator, Image as ImageIcon,
    Plus, Minus, Users, CheckCircle2, XCircle, Clock, Sparkles
} from 'lucide-react';
import { useGameQuestionPool } from '../../../hooks/useGameQuestionPool.js';
import GameQuestionStageModal from '../../shared/GameQuestionStageModal.jsx';
import MathDisplay from '../../shared/MathDisplay.jsx';
import { supabase } from '../../../lib/supabaseClient.js';
import CategoryClashHelpModal from '../shared/CategoryClashHelpModal.jsx';

// 🟢 Helper to parse embedded team from alias: "[team_0] Elev 1" -> { teamId: "team_0", displayName: "Elev 1" }
const parseTeamId = (alias) => {
    const match = String(alias || '').match(/^\[(team_\d+)\]\s*(.*)$/);
    return {
        teamId: match ? match[1] : null,
        displayName: match ? match[2] : alias
    };
};

export default function CategoryClashEngine({
    initialConfig,
    sourcePacket = null,
    savedBoard = null,
    session = null,      
    isLiveHost = false,
    onClose,
    lang = 'sv'
}) {
    // 1. Core State - Allow previewing/curating before activating questions
    const [mode, setMode] = useState(savedBoard ? 'play' : 'curate'); // 'curate' | 'play'
    const [curateView, setCurateView] = useState('grid'); // 'grid' | 'audit'
    const [title, setTitle] = useState(savedBoard?.title || session?.title || (lang === 'sv' ? 'Poängjakten' : 'Category Clash'));
    const [visibility, setVisibility] = useState(savedBoard?.visibility || 'private');
    const [isSaving, setIsSaving] = useState(false);
    const [boardId, setBoardId] = useState(savedBoard?.id || null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Grid configuration
    const dimensions = initialConfig?.dimensions || savedBoard?.packet?.dimensions || session?.active_question_data?.settings?.dimensions || { columns: 4, rows: 4 };
    const pointScale = initialConfig?.pointScale || savedBoard?.packet?.pointScale || session?.active_question_data?.settings?.pointScale || [100, 200, 300, 400];
    const categories = initialConfig?.categories || savedBoard?.packet?.categories || session?.active_question_data?.settings?.categories || [];
    
    // Teams & Scores
    const [teams, setTeams] = useState(
        session?.active_question_data?.teams || 
        savedBoard?.config?.teams || 
        initialConfig?.teams || [
            { id: 'team_0', name: 'Lag Röd', color: '#ef4444', score: 0 },
            { id: 'team_1', name: 'Lag Blå', color: '#3b82f6', score: 0 }
        ]
    );

    // Tile cleared state (slotId -> boolean)
    const [clearedTiles, setClearedTiles] = useState(
        session?.active_question_data?.board?.clearedTiles || 
        savedBoard?.packet?.clearedTiles || 
        {}
    );

    // Stage Modal state
    const [activeSlotId, setActiveSlotId] = useState(session?.active_question_data?.activeTile || null);
    const [isStageModalOpen, setIsStageModalOpen] = useState(Boolean(session?.active_question_data?.activeTile));

    // Live Student Responses Stream
    const [liveResponses, setLiveResponses] = useState([]);
    const teamsRef = useRef(teams);
    useEffect(() => { teamsRef.current = teams; }, [teams]);

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
        if (session?.active_question_data?.board?.tiles) {
            ingestAsIs(Object.values(session.active_question_data.board.tiles));
        } else if (savedBoard?.packet?.tiles) {
            ingestAsIs(savedBoard.packet.tiles);
        } else if (initialConfig?.sourceMode === 'as_is' && sourcePacket) {
            ingestAsIs(sourcePacket);
        } else {
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

    // Convert slotId (e.g. "c1_r0") to integer
    const getNumericIndexForSlot = (slotId) => {
        if (!slotId) return null;
        const match = String(slotId).match(/^c(\d+)_r(\d+)$/);
        if (!match) return parseInt(slotId, 10) || 0;
        const col = parseInt(match[1], 10);
        const row = parseInt(match[2], 10);
        return row * (dimensions?.columns || 4) + col;
    };

    const targetNumericIndex = getNumericIndexForSlot(activeSlotId);
    const activeQuestion = activeSlotId ? pool[activeSlotId] : null;
    const activePoints = activeSlotId ? (
        pointScale[parseInt(activeSlotId.split('_r')[1], 10)] || 100
    ) : 100;

    // 🟢 Synchronize Live Room State to Supabase
    const broadcastRoomState = async (slotId, questionData, updatedTeams = teamsRef.current, updatedCleared = clearedTiles) => {
        if (!isLiveHost || !session?.id) return;

        try {
            await supabase
                .from('rooms')
                .update({
                    active_question_data: {
                        ...session.active_question_data,
                        mode: 'activity_category_clash',
                        gameKey: 'category_clash',
                        activeTile: slotId,
                        activeQuestion: questionData,
                        points: slotId ? (pointScale[parseInt(slotId.split('_r')[1], 10)] || 100) : 0,
                        teams: updatedTeams,
                        board: {
                            dimensions,
                            pointScale,
                            categories,
                            clearedTiles: updatedCleared,
                            tiles: pool
                        }
                    }
                })
                .eq('id', session.id);
        } catch (err) {
            console.error("[CategoryClashEngine] Sync error:", err);
        }
    };

    // 🟢 Realtime Listener + AUTOMATIC TEAM SCORING
    useEffect(() => {
        if (!isLiveHost || !session?.id) return;

        const fetchInitialResponses = async () => {
            const { data } = await supabase
                .from('responses')
                .select('*')
                .eq('room_id', session.id);
            if (data) setLiveResponses(data);
        };
        fetchInitialResponses();

        const channel = supabase.channel(`clash_live_${session.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'responses',
                filter: `room_id=eq.${session.id}`
            }, (payload) => {
                const newResp = payload.new;
                setLiveResponses(prev => [...prev, newResp]);

                // AUTOMATIC POINT ALLOCATION: Parse team from student_alias tag
                const { teamId } = parseTeamId(newResp.student_alias);
                if (newResp.is_correct && teamId) {
                    const pts = activePoints;

                    setTeams(currentTeams => {
                        const nextTeams = currentTeams.map(t => 
                            t.id === teamId ? { ...t, score: t.score + pts } : t
                        );
                        broadcastRoomState(activeSlotId, activeQuestion, nextTeams);
                        return nextTeams;
                    });
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'responses',
                filter: `room_id=eq.${session.id}`
            }, (payload) => {
                setLiveResponses(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLiveHost, session?.id, activePoints, activeSlotId, activeQuestion]);

    // 🟢 UN-CLEAR / REOPEN: Click a cleared tile to un-clear and play it again
    const handleTileClick = async (slotId) => {
        if (clearedTiles[slotId] && (mode === 'play' || isLiveHost)) {
            const confirmReopen = window.confirm(
                lang === 'sv' 
                    ? "Denna bricka är redan spelad. Vill du öppna den igen?" 
                    : "This tile is already cleared. Do you want to reopen it?"
            );
            if (!confirmReopen) return;

            const nextCleared = { ...clearedTiles };
            delete nextCleared[slotId];
            setClearedTiles(nextCleared);
        }

        setActiveSlotId(slotId);
        setIsStageModalOpen(true);

        // In Play mode, push the question directly to students
        if (isLiveHost && mode === 'play') {
            await broadcastRoomState(slotId, pool[slotId]);
        }
    };

    // 🟢 SOFT CLOSE: Teacher clicked X or background. Do NOT clear tile!
    const handleCloseStageModal = async () => {
        setIsStageModalOpen(false);
        setActiveSlotId(null);

        if (isLiveHost) {
            await broadcastRoomState(null, null, teams, clearedTiles);
        }
    };

    // 🟢 INTENTIONAL FINISH: Teacher clicks "Klar (Töm bricka)"
    const handleFinishAndClear = async () => {
        const nextCleared = activeSlotId ? { ...clearedTiles, [activeSlotId]: true } : clearedTiles;
        setClearedTiles(nextCleared);
        setIsStageModalOpen(false);
        setActiveSlotId(null);

        if (isLiveHost) {
            await broadcastRoomState(null, null, teams, nextCleared);
        }
    };

    const handleAwardPoints = async (teamId, pts) => {
        const nextTeams = teams.map(t => t.id === teamId ? { ...t, score: Math.max(0, t.score + pts) } : t);
        const nextCleared = activeSlotId ? { ...clearedTiles, [activeSlotId]: true } : clearedTiles;

        setTeams(nextTeams);
        if (activeSlotId) setClearedTiles(nextCleared);

        if (isLiveHost) {
            await broadcastRoomState(activeSlotId, activeQuestion, nextTeams, nextCleared);
        }
    };

    const handleManualScoreAdjust = async (teamId, delta) => {
        const nextTeams = teams.map(t => t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t);
        setTeams(nextTeams);

        if (isLiveHost) {
            await broadcastRoomState(activeSlotId, activeQuestion, nextTeams);
        }
    };

    const toggleSlotElement = async (slotId, key) => {
        const current = pool[slotId];
        if (!current) return;
        
        // Determine current value (defaults to false for latex if it's a word problem, true otherwise)
        const isWordProblem = Boolean(
            current.wordProblem || 
            current.renderData?.isWordProblemApplied || 
            current.resolvedData?.metadata?.isWordProblemApplied
        );

        const currentVal = current[key] !== undefined 
            ? current[key] 
            : (key === 'showLatex' ? !isWordProblem : true);

        const nextVal = !currentVal;
        const updatedQuestion = { ...current, [key]: nextVal };

        // 1. Update teacher's local pool state
        updateSlotManually(slotId, { [key]: nextVal });

        // 2. 🟢 Broadcast immediately so live students' screens reflect the change in real time
        if (isLiveHost && session?.id) {
            // Update active question if this slot is currently open on stage
            if (activeSlotId === slotId) {
                await broadcastRoomState(slotId, updatedQuestion);
            } else {
                // If toggled from the audit table while tile is not open, sync board pool state
                await broadcastRoomState(activeSlotId, activeQuestion, teamsRef.current, clearedTiles);
            }
        }
    };
    
    // 🟢 REGENERATE SINGLE SLOT + RACE-CONDITION-FREE BROADCAST
    const handleRegenerateSlot = async (slotId) => {
        if (!slotId) return;

        // 1. Wipe previous student responses from local state
        const targetNumeric = getNumericIndexForSlot(slotId);
        setLiveResponses(prev => prev.filter(r => r.question_index !== targetNumeric));

        // 2. Delete previous responses in Supabase
        if (isLiveHost && session?.id) {
            try {
                await supabase
                    .from('responses')
                    .delete()
                    .eq('room_id', session.id)
                    .eq('question_index', targetNumeric);
            } catch (err) {
                console.error("Failed to delete previous responses:", err);
            }
        }

        // 3. Await the actual newly generated question object
        const freshQuestion = await regenerateSlot(slotId);
        if (!freshQuestion) return;

        const newRegenVersion = Date.now();
        const itemToBroadcast = {
            ...freshQuestion,
            regenVersion: newRegenVersion
        };

        // 4. Update local pool tracking with the version tag
        updateSlotManually(slotId, { regenVersion: newRegenVersion });

        // 5. Broadcast the new question to all connected students immediately
        if (isLiveHost && session?.id) {
            await broadcastRoomState(slotId, itemToBroadcast);
        }
    };

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

    const handleResetScores = async () => {
        if (!window.confirm(lang === 'sv' ? "Nollställ alla poäng och rensa brickor?" : "Reset all scores and clear tiles?")) return;
        const resetTeams = teams.map(t => ({ ...t, score: 0 }));
        setTeams(resetTeams);
        setClearedTiles({});

        if (isLiveHost) {
            await broadcastRoomState(null, null, resetTeams, {});
        }
    };

    const currentSlotResponses = liveResponses.filter(r => r.question_index === targetNumericIndex);

    return (
        <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col font-sans select-none overflow-hidden animate-in fade-in">
            
            {/* 🟢 HONEYCOMB BACKDROP PATTERN */}
            <div 
                className="absolute inset-0 pointer-events-none z-0 opacity-[0.09]"
                style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 80%), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='96' viewBox='0 0 56 96'%3E%3Cpath d='M28 0l28 16v32L28 64 0 48V16L28 0zm0 96l28-16V48L28 32 0 48v32l28 16z' fill='%236366f1' fill-opacity='0.6' fill-rule='evenodd' stroke='%234338ca' stroke-width='1.2' stroke-opacity='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: 'auto, 56px 96px'
                }}
            />

            {/* Top Navigation & Status Bar */}
            <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between text-white shrink-0 gap-4">
                
                {/* Left: Title & Large Classroom-Legible Room PIN */}
                <div className="flex items-center gap-4">
                    {isLiveHost && session?.class_code ? (
                        <div className="bg-rose-500/10 border-2 border-rose-500/40 px-4 py-1.5 rounded-2xl flex items-center gap-3 shadow-lg shadow-rose-950/30">
                            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 leading-none">
                                    {lang === 'sv' ? "RUMSKOD" : "ROOM PIN"}
                                </span>
                                <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-widest leading-tight">
                                    {session.class_code}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLiveHost}
                            className="bg-white/10 hover:bg-white/20 focus:bg-white focus:text-slate-900 text-white px-3 py-1.5 rounded-xl font-black text-sm tracking-wide outline-none transition-all w-48 sm:w-60 disabled:opacity-80"
                            placeholder="Namn på spelet..."
                        />
                    )}

                    {!isLiveHost && (
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
                    )}
                </div>

                {/* Center: Curate vs Play Switcher (Accessible in Live Mode) */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button
                            type="button"
                            onClick={async () => {
                                setMode('curate');
                                if (isLiveHost) {
                                    await broadcastRoomState(null, null);
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                mode === 'curate' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Edit3 size={13} />
                            {lang === 'sv' ? "Förbered / Granska" : "Setup / Curate"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('play')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                mode === 'play' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Play size={13} />
                            {lang === 'sv' ? "Spela" : "Play"}
                        </button>
                    </div>

                    {mode === 'curate' && (
                        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
                            <button
                                type="button"
                                onClick={() => setCurateView('grid')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                                    curateView === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <LayoutGrid size={12} />
                                <span>{lang === 'sv' ? "Rutnät" : "Grid"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurateView('audit')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                                    curateView === 'audit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <ListFilter size={12} />
                                <span>{lang === 'sv' ? `Granska (${dimensions.columns * dimensions.rows})` : `Audit (${dimensions.columns * dimensions.rows})`}</span>
                            </button>
                        </div>
                    )}

                    {/* Team Standings Badges in Play Mode */}
                    {mode === 'play' && teams.length > 0 && (
                        <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                            {teams.map(team => (
                                <div key={team.id} className="flex items-center gap-2 bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700/80 shadow-xs">
                                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                                    <span className="text-xs font-black uppercase text-slate-200">{team.name}:</span>
                                    <span className="text-sm font-black text-amber-300 font-mono">{team.score}p</span>
                                    
                                    <div className="flex items-center gap-0.5 border-l border-slate-700 pl-1">
                                        <button
                                            onClick={() => handleManualScoreAdjust(team.id, -50)}
                                            className="p-0.5 rounded hover:bg-slate-700 text-slate-400 hover:text-rose-400 cursor-pointer"
                                            title="-50p"
                                        >
                                            <Minus size={11} />
                                        </button>
                                        <button
                                            onClick={() => handleManualScoreAdjust(team.id, 50)}
                                            className="p-0.5 rounded hover:bg-slate-700 text-slate-400 hover:text-emerald-400 cursor-pointer"
                                            title="+50p"
                                        >
                                            <Plus size={11} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {mode === 'curate' && (
                        <button
                            onClick={handleRegenerateAll}
                            disabled={isLoading}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
                            title="Slumpa om alla brickor"
                        >
                            <RefreshCcw size={13} className={isLoading ? "animate-spin" : ""} />
                            <span className="hidden md:inline">{lang === 'sv' ? "Slumpa alla" : "Randomize all"}</span>
                        </button>
                    )}

                    {!isLiveHost && (
                        <button
                            onClick={handleSaveBoard}
                            disabled={isSaving}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
                        >
                            <Save size={14} />
                            <span className="hidden sm:inline">{lang === 'sv' ? "Spara" : "Save"}</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsHelpOpen(true)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 transition-colors cursor-pointer"
                        title={lang === 'sv' ? "Instruktioner & Spelguide" : "Instructions & Game Guide"}
                    >
                        <HelpCircle size={16} />
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

            {/* 🟢 Live Curate Lobby Banner */}
            {isLiveHost && mode === 'curate' && (
                <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>
                            {lang === 'sv' 
                                ? "Förberedelseläge: Eleverna väntar i lobbyn. Granska frågorna och klicka 'Spela' när du är redo." 
                                : "Setup Mode: Students are waiting in the lobby. Review questions and click 'Play' when ready."}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMode('play')}
                        className="px-3.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                        {lang === 'sv' ? "Börja Spela →" : "Start Game →"}
                    </button>
                </div>
            )}

            {/* Main Stage */}
            <main className="flex-1 overflow-hidden p-4 sm:p-6 flex flex-col lg:flex-row items-stretch justify-center gap-6">
                
                {/* 1. AUDIT / TABLE REVIEW VIEW */}
                {mode === 'curate' && curateView === 'audit' ? (
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

                                                return (
                                                    <tr key={slotId} className="hover:bg-slate-800/40 transition-colors">
                                                        <td className="py-3 font-mono font-bold text-slate-500">{slotId}</td>
                                                        <td className="py-3 font-black text-indigo-300 truncate max-w-[120px]">{catObj?.name || `Kat ${colIdx + 1}`}</td>
                                                        <td className="py-3 text-center">
                                                            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px]">
                                                                N{tileQuestion?.level || (rowIdx + 1)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-center font-black font-mono text-amber-300">{points}p</td>
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
                                                        <td className="py-3 font-mono font-bold text-emerald-400 truncate max-w-[120px]">
                                                            {answer ? <MathDisplay content={`$${String(answer).replace(/\$/g, '')}$`} /> : '—'}
                                                        </td>
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
                                                        <td className="py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => handleRegenerateSlot(slotId)}
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

                    /* 2. THE 2D GAME BOARD */
                    <div className="flex-1 flex items-center justify-center overflow-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                <RefreshCcw size={28} className="animate-spin text-indigo-500" />
                                <span className="text-xs font-black uppercase tracking-widest">
                                    {lang === 'sv' ? "Bygger spelbräde..." : "Constructing board..."}
                                </span>
                            </div>
                        ) : (
                            <div 
                                className="grid gap-3 sm:gap-4 w-full max-w-5xl h-full max-h-[82vh]"
                                style={{
                                    gridTemplateColumns: `repeat(${dimensions.columns}, minmax(0, 1fr))`,
                                    gridTemplateRows: `auto repeat(${dimensions.rows}, minmax(0, 1fr))`
                                }}
                            >
                                {/* Column Categories */}
                                {categories.slice(0, dimensions.columns).map((cat, colIdx) => (
                                    <div 
                                        key={cat.id || colIdx}
                                        className="bg-indigo-950/80 border-2 border-indigo-700/60 rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center shadow-lg min-h-[50px]"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                            {lang === 'sv' ? `Kategori ${colIdx + 1}` : `Category ${colIdx + 1}`}
                                        </span>
                                        <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider line-clamp-1">
                                            {cat.name}
                                        </span>
                                    </div>
                                ))}

                                {/* Matrix Tiles */}
                                {Array.from({ length: dimensions.rows }).map((_, rowIdx) => (
                                    <React.Fragment key={rowIdx}>
                                        {Array.from({ length: dimensions.columns }).map((_, colIdx) => {
                                            const slotId = `c${colIdx}_r${rowIdx}`;
                                            const tileQuestion = pool[slotId];
                                            const points = pointScale[rowIdx] || 100;
                                            const isCleared = Boolean(clearedTiles[slotId]);
                                            const isActiveNow = activeSlotId === slotId;

                                            return (
                                                <div
                                                    key={slotId}
                                                    onClick={() => handleTileClick(slotId)}
                                                    className={`relative rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all cursor-pointer select-none group
                                                        ${isCleared && (mode === 'play' || isLiveHost)
                                                            ? 'bg-slate-900/40 border-slate-800/60 text-slate-700 opacity-30 cursor-not-allowed'
                                                            : isActiveNow
                                                            ? 'bg-indigo-950 border-amber-400 ring-4 ring-amber-400/40 text-amber-300 scale-105 shadow-2xl'
                                                            : 'bg-slate-900 border-indigo-500/40 hover:border-amber-400 hover:bg-slate-800/90 hover:scale-[1.02] shadow-xl text-amber-300'
                                                        }`}
                                                >
                                                    {/* Curate Mode Tile Quick Actions */}
                                                    {mode === 'curate' && tileQuestion && (
                                                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRegenerateSlot(slotId);
                                                                }}
                                                                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700 cursor-pointer"
                                                                title={lang === 'sv' ? "Slumpa nya siffror" : "Roll new numbers"}
                                                            >
                                                                <RefreshCcw size={11} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight drop-shadow-md">
                                                        {isCleared && (mode === 'play' || isLiveHost) ? '—' : points}
                                                    </span>

                                                    {/* Curate Mode Level Badge */}
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
                    </div>
                )}

                {/* 3. LIVE STUDENT RESPONSES FEED DOCK (In Play Mode) */}
                {isLiveHost && mode === 'play' && (
                    <div className="w-full lg:w-80 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col shadow-2xl shrink-0 max-h-[82vh]">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-indigo-400" />
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                                    {lang === 'sv' ? "Elevsvar i Realtid" : "Live Responses"}
                                </h3>
                            </div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                {currentSlotResponses.length} svar
                            </span>
                        </div>

                        <div className="mb-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {lang === 'sv' ? "Aktiv bricka:" : "Active tile:"}
                            </span>
                            <span className="text-xs font-bold text-amber-300">
                                {activeSlotId ? `${activePoints}p (${activeSlotId})` : (lang === 'sv' ? "Ingen vald" : "None")}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            {currentSlotResponses.length === 0 ? (
                                <div className="h-full py-16 flex flex-col items-center justify-center text-center text-slate-500 gap-2">
                                    <Clock size={24} className="opacity-40 animate-pulse" />
                                    <p className="text-xs font-bold uppercase tracking-wider">
                                        {lang === 'sv' ? "Väntar på elevsvar..." : "Waiting for answers..."}
                                    </p>
                                </div>
                            ) : (
                                currentSlotResponses.map((r, i) => {
                                    const { teamId, displayName } = parseTeamId(r.student_alias);
                                    const team = teams.find(t => t.id === teamId);
                                    return (
                                        <div 
                                            key={r.id || i} 
                                            className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                                                r.is_correct 
                                                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
                                                    : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                                            }`}
                                        >
                                            <div className="flex flex-col min-w-0 pr-2">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    {team && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: team.color }} />}
                                                    <span className="text-xs font-black text-white truncate max-w-[120px]">
                                                        {displayName}
                                                    </span>
                                                    {team && (
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                            ({team.name})
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-mono font-bold truncate">
                                                    {r.answer}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                {r.is_correct ? (
                                                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                                        <CheckCircle2 size={16} />
                                                        <span>+{activePoints}p</span>
                                                    </div>
                                                ) : (
                                                    <XCircle size={16} className="text-rose-400" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* 🟢 ANPASSA WATERMARK FOOTER */}
            <footer className="relative z-10 px-6 py-2.5 bg-slate-950/80 border-t border-slate-900 flex items-center justify-between text-[11px] font-medium text-slate-500 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                        <Sparkles size={10} className="text-indigo-400" />
                    </div>
                    <span className="font-bold tracking-wider uppercase text-slate-400">
                        Anpassa Math Platform
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500 font-mono">Poängjakten</span>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                    <span>Activity Mode</span>
                    <span>•</span>
                    <span className="text-indigo-400/80 font-black">Live Classroom Sync</span>
                </div>
            </footer>

            {/* Universal Stage Modal with Live Responses Stream */}
            <GameQuestionStageModal
                isOpen={isStageModalOpen}
                onClose={handleCloseStageModal}        
                onFinishAndClear={handleFinishAndClear}
                question={activeQuestion}
                points={activePoints}
                teams={teams}
                onAwardPoints={handleAwardPoints}
                onRegenerate={() => handleRegenerateSlot(activeSlotId)}
                lang={lang}
                showPointsAwarding={Boolean(mode === 'play' || isLiveHost) && teams.length > 0}
                isLive={isLiveHost && mode === 'play'}
                liveResponses={currentSlotResponses}
            />
            <CategoryClashHelpModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
                lang={lang}
            />
        </div>
    );
}