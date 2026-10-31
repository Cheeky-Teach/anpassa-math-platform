// src/components/activities/engines/CategoryClashEngine.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    X, Play, Edit3, Save, RotateCcw,
    RefreshCcw, Lock, Building2, HelpCircle,
    LayoutGrid, ListFilter, Type, Calculator,
    Plus, Minus, Users, CheckCircle2, Sparkles,
    Monitor, Loader2, Flame, Zap, Trophy, Clock
} from 'lucide-react';
import { useGameQuestionPool } from '../../../hooks/useGameQuestionPool.js';
import GameQuestionStageModal from '../../shared/GameQuestionStageModal.jsx';
import MathDisplay from '../../shared/MathDisplay.jsx';
import CategoryClashHelpModal from '../shared/CategoryClashHelpModal.jsx';
import { saveActivityToLibrary } from '../../live/core/activityQuestionUtils.js';
import { useActivityEngineSession } from '../hooks/useActivityEngineSession.js';

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
    profile = null,
    onClose,
    lang = 'sv'
}) {
    const t = {
        sv: {
            game_title: "Poängjakten",
            pin_label: "RUMSKOD",
            go_live: "Starta Live",
            go_live_tooltip: "Starta live-rum för nuvarande spelplan",
            title_placeholder: "Namn på spelet...",
            save: "Spara",
            saving: "Sparar...",
            save_tooltip: "Spara till biblioteket",
            private_tooltip: "Bara jag (Privat)",
            school_tooltip: "Min Skola",
            setup_curate: "Förbered / Granska",
            play: "Spela",
            grid_view: "Rutnät",
            audit_view: "Granska",
            reroll_all: "Slumpa alla",
            reroll_all_tooltip: "Slumpa om alla brickor",
            guide_tooltip: "Instruktioner & Spelguide",
            reset_tooltip: "Nollställ poäng och brickor",
            lobby_banner: "Förberedelseläge: Eleverna väntar i lobbyn. Granska frågorna och klicka 'Spela' när du är redo.",
            start_playing_btn: "Börja Spela →",
            audit_heading: "Översikt & Granskning av Frågor",
            audit_sub: "Kontrollera frågor, dölj formler vid behov, eller slumpa om enskilda rutor.",
            total_tiles: "brickor totalt",
            th_slot: "Plats",
            th_category: "Kategori",
            th_level: "Nivå",
            th_points: "Poäng",
            th_prompt: "Frågetext / Uppgift",
            th_answer: "Facit",
            th_visibility: "Synlighet",
            th_action: "Åtgärd",
            loading_question: "Laddar fråga...",
            hide_show_text: "Dölj/visa text",
            hide_show_formula: "Dölj/visa formel",
            reroll_numbers: "Slumpa nya siffror",
            show_btn: "Visa",
            constructing_board: "Bygger spelbräde...",
            category_prefix: "Kategori",
            level_prefix: "Nivå",
            top7_heading: "Topp 7",
            active_students: "aktiva",
            waiting_first_answer: "Väntar på första svaret...",
            streak_heading: "Streak",
            streak_empty: "Svara rätt på 2 i rad för att synas här!",
            in_a_row: "i rad!",
            class_energy_heading: "Klassens Kraft",
            collected_points: "p samlat",
            reroll_all_confirm: "Slumpa nya tal för alla frågor på brädet?",
            save_success: "Spelet har sparats i ditt bibliotek!",
            save_failed: "Kunde inte spara spelet.",
            reset_confirm: "Nollställ alla poäng och rensa brickor?"
        },
        en: {
            game_title: "Category Clash",
            pin_label: "ROOM PIN",
            go_live: "Go Live",
            go_live_tooltip: "Host live room for current board",
            title_placeholder: "Game title...",
            save: "Save",
            saving: "Saving...",
            save_tooltip: "Save to library",
            private_tooltip: "Only me (Private)",
            school_tooltip: "My School",
            setup_curate: "Setup / Curate",
            play: "Play",
            grid_view: "Grid",
            audit_view: "Audit",
            reroll_all: "Randomize all",
            reroll_all_tooltip: "Re-roll all tiles",
            guide_tooltip: "Instructions & Game Guide",
            reset_tooltip: "Reset tiles and scores",
            lobby_banner: "Setup Mode: Students are waiting in the lobby. Review questions and click 'Play' when ready.",
            start_playing_btn: "Start Game →",
            audit_heading: "Questions Overview & Audit",
            audit_sub: "Review questions, toggle formulas if needed, or re-roll individual tiles.",
            total_tiles: "tiles total",
            th_slot: "Slot",
            th_category: "Category",
            th_level: "Level",
            th_points: "Points",
            th_prompt: "Prompt / Question",
            th_answer: "Answer Key",
            th_visibility: "Visibility",
            th_action: "Action",
            loading_question: "Loading question...",
            hide_show_text: "Toggle text",
            hide_show_formula: "Toggle formula",
            reroll_numbers: "Re-roll numbers",
            show_btn: "Show",
            constructing_board: "Constructing board...",
            category_prefix: "Category",
            level_prefix: "Level",
            top7_heading: "Top 7",
            active_students: "active",
            waiting_first_answer: "Waiting for first response...",
            streak_heading: "Streak",
            streak_empty: "Get 2 correct in a row to appear here!",
            in_a_row: "in a row!",
            class_energy_heading: "Class Energy",
            collected_points: "pts earned",
            reroll_all_confirm: "Re-roll numbers for all questions?",
            save_success: "Game saved to your library!",
            save_failed: "Failed to save game.",
            reset_confirm: "Reset all scores and clear tiles?"
        }
    }[lang] || {};

    // 1. Core State
    const [title, setTitle] = useState(
        savedBoard?.title || 
        session?.title || 
        initialConfig?.session?.title || 
        t.game_title
    );
    const [visibility, setVisibility] = useState(savedBoard?.visibility || 'private');
    const [isSaving, setIsSaving] = useState(false);
    const [boardId, setBoardId] = useState(savedBoard?.id || null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [mode, setMode] = useState(savedBoard ? 'play' : 'curate');
    const [curateView, setCurateView] = useState('grid');

    const [studentScoreAdjustments, setStudentScoreAdjustments] = useState({});

    // Grid configuration
    const dimensions = initialConfig?.dimensions || savedBoard?.packet?.dimensions || session?.active_question_data?.settings?.dimensions || { columns: 4, rows: 4 };
    const pointScale = initialConfig?.pointScale || savedBoard?.packet?.pointScale || session?.active_question_data?.settings?.pointScale || [100, 200, 300, 400];
    const categories = initialConfig?.categories || savedBoard?.packet?.categories || session?.active_question_data?.settings?.categories || [];
    
    const [teams, setTeams] = useState(
        session?.active_question_data?.teams || 
        savedBoard?.config?.teams || 
        initialConfig?.teams || []
    );
    const teamsRef = useRef(teams);
    useEffect(() => { teamsRef.current = teams; }, [teams]);

    const [clearedTiles, setClearedTiles] = useState(
        session?.active_question_data?.board?.clearedTiles || 
        savedBoard?.packet?.clearedTiles || 
        {}
    );

    const [activeSlotId, setActiveSlotId] = useState(session?.active_question_data?.activeTile || null);
    const [isStageModalOpen, setIsStageModalOpen] = useState(Boolean(session?.active_question_data?.activeTile));

    const { 
        pool, 
        isLoading, 
        ingestAsIs, 
        generateGridFromSeeds,
        regenerateSlot,
        updateSlotManually
    } = useGameQuestionPool({ lang });

    // 🟢 2. Unified Session Hook
    const {
        roomId,
        classCode,
        isLive,
        canHostLiveRoom,
        isGoingLive,
        liveResponses,
        handleGoLive,
        handleCloseEngine,
        broadcastState
    } = useActivityEngineSession({
        session,
        initialConfig,
        isLiveHost,
        profile,
        onClose,
        mode: 'activity_category_clash',
        gameKey: 'category_clash',
        title,
        lang,
        getPacket: () => Object.values(pool),
        getSettings: () => ({ dimensions, pointScale, categories, teams: teamsRef.current }),
        getInitialBroadcastData: () => ({
            activeTile: null,
            activeQuestion: null,
            points: 0,
            teams: teamsRef.current,
            board: {
                dimensions,
                pointScale,
                categories,
                clearedTiles,
                tiles: pool
            }
        })
    });

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

    const broadcastRoomState = async (slotId, questionData, updatedTeams = teamsRef.current, updatedCleared = clearedTiles) => {
        if (!isLive) return;

        await broadcastState({
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
        });
    };

    useEffect(() => {
        if (!isLive || liveResponses.length === 0 || teams.length === 0) return;
        const latest = liveResponses[liveResponses.length - 1];
        if (!latest?.is_correct) return;

        const { teamId } = parseTeamId(latest.student_alias);
        if (teamId) {
            setTeams(currentTeams => {
                const nextTeams = currentTeams.map(t => 
                    t.id === teamId ? { ...t, score: t.score + activePoints } : t
                );
                broadcastRoomState(activeSlotId, activeQuestion, nextTeams);
                return nextTeams;
            });
        }
    }, [liveResponses]);

    // 🟢 3. Live Analytics Derivations
    const { leaderboard, streakList, totalClassScore, activeStudentCount } = useMemo(() => {
        const studentMap = {};
        const studentAnswersHistory = {};

        liveResponses.forEach(res => {
            const rawAlias = res.student_alias || (lang === 'sv' ? 'Elev' : 'Student');
            const { displayName } = parseTeamId(rawAlias);

            if (!studentMap[displayName]) {
                studentMap[displayName] = {
                    displayName,
                    rawAlias,
                    score: 0,
                    correctCount: 0
                };
                studentAnswersHistory[displayName] = [];
            }

            studentAnswersHistory[displayName].push(res);

            if (res.is_correct) {
                const qRow = Math.floor(res.question_index / (dimensions.columns || 4));
                const tileScore = pointScale[qRow] || 100;
                studentMap[displayName].score += tileScore;
                studentMap[displayName].correctCount += 1;
            }
        });

        Object.entries(studentScoreAdjustments).forEach(([alias, adj]) => {
            if (studentMap[alias]) {
                studentMap[alias].score = Math.max(0, studentMap[alias].score + adj);
            }
        });

        const sortedStudents = Object.values(studentMap).sort((a, b) => b.score - a.score);
        const top7 = sortedStudents.slice(0, 7);
        const top7Names = new Set(top7.map(s => s.displayName));

        const streaks = [];
        Object.entries(studentAnswersHistory).forEach(([name, history]) => {
            if (top7Names.has(name)) return;

            let streak = 0;
            for (let i = history.length - 1; i >= 0; i--) {
                if (history[i].is_correct) {
                    streak++;
                } else {
                    break;
                }
            }

            if (streak >= 2) {
                streaks.push({ displayName: name, streak });
            }
        });
        streaks.sort((a, b) => b.streak - a.streak);

        const totalPoints = Object.values(studentMap).reduce((sum, s) => sum + s.score, 0);

        return {
            leaderboard: top7,
            streakList: streaks.slice(0, 4),
            totalClassScore: totalPoints,
            activeStudentCount: Object.keys(studentMap).length
        };
    }, [liveResponses, studentScoreAdjustments, dimensions.columns, pointScale, lang]);

    const handleAdjustSoloStudent = (displayName, delta) => {
        setStudentScoreAdjustments(prev => ({
            ...prev,
            [displayName]: (prev[displayName] || 0) + delta
        }));
    };

    const handleTileClick = async (slotId) => {
        if (clearedTiles[slotId] && (mode === 'play' || isLive)) {
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

        if (isLive && mode === 'play') {
            await broadcastRoomState(slotId, pool[slotId]);
        }
    };

    const handleCloseStageModal = async () => {
        setIsStageModalOpen(false);
        setActiveSlotId(null);

        if (isLive) {
            await broadcastRoomState(null, null, teams, clearedTiles);
        }
    };

    const handleFinishAndClear = async () => {
        const nextCleared = activeSlotId ? { ...clearedTiles, [activeSlotId]: true } : clearedTiles;
        setClearedTiles(nextCleared);
        setIsStageModalOpen(false);
        setActiveSlotId(null);

        if (isLive) {
            await broadcastRoomState(null, null, teams, nextCleared);
        }
    };

    const handleAwardPoints = async (teamId, pts) => {
        const nextTeams = teams.map(t => t.id === teamId ? { ...t, score: Math.max(0, t.score + pts) } : t);
        const nextCleared = activeSlotId ? { ...clearedTiles, [activeSlotId]: true } : clearedTiles;

        setTeams(nextTeams);
        if (activeSlotId) setClearedTiles(nextCleared);

        if (isLive) {
            await broadcastRoomState(activeSlotId, activeQuestion, nextTeams, nextCleared);
        }
    };

    const handleManualScoreAdjust = async (teamId, delta) => {
        const nextTeams = teams.map(t => t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t);
        setTeams(nextTeams);

        if (isLive) {
            await broadcastRoomState(activeSlotId, activeQuestion, nextTeams);
        }
    };

    const toggleSlotElement = async (slotId, key) => {
        const current = pool[slotId];
        if (!current) return;
        
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

        updateSlotManually(slotId, { [key]: nextVal });

        if (isLive && roomId) {
            if (activeSlotId === slotId) {
                await broadcastRoomState(slotId, updatedQuestion);
            } else {
                await broadcastRoomState(activeSlotId, activeQuestion, teamsRef.current, clearedTiles);
            }
        }
    };
    
    const handleRegenerateSlot = async (slotId, overrideWordProblem = undefined) => {
        if (!slotId) return;

        const freshQuestion = await regenerateSlot(slotId, overrideWordProblem);
        if (!freshQuestion) return;

        const newRegenVersion = Date.now();
        const itemToBroadcast = {
            ...freshQuestion,
            regenVersion: newRegenVersion
        };

        updateSlotManually(slotId, { regenVersion: newRegenVersion });

        if (isLive && roomId) {
            await broadcastRoomState(slotId, itemToBroadcast);
        }
    };

    const handleToggleSlotWordProblem = async (slotId) => {
        const targetId = slotId || activeSlotId;
        if (!targetId) return;

        const current = pool[targetId];
        if (!current) return;

        const isCurrentlyWp = Boolean(
            current.wordProblem || 
            current.renderData?.isWordProblemApplied ||
            current.resolvedData?.metadata?.isWordProblemApplied
        );

        const nextWpState = !isCurrentlyWp;

        // Regenerate slot with the inverted wordProblem flag
        const freshQuestion = await regenerateSlot(targetId, nextWpState);
        if (!freshQuestion) return;

        const newRegenVersion = Date.now();
        const itemToBroadcast = {
            ...freshQuestion,
            wordProblem: nextWpState,
            renderData: {
                ...freshQuestion.renderData,
                isWordProblemApplied: nextWpState
            },
            regenVersion: newRegenVersion
        };

        updateSlotManually(targetId, itemToBroadcast);

        if (isLive && roomId) {
            await broadcastRoomState(targetId, itemToBroadcast);
        }
    };

    const handleRegenerateAll = async () => {
        if (!window.confirm(t.reroll_all_confirm)) return;
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
            const tilesArray = Object.values(pool);

            const saved = await saveActivityToLibrary({
                sheetId: boardId,
                title,
                type: 'activity_category_clash',
                visibility,
                autoTopics: categories.map(c => c.topic),
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
            });

            setBoardId(saved.id);
            alert(t.save_success);
        } catch (err) {
            console.error("Save Game Error:", err);
            alert(t.save_failed);
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetScores = async () => {
        if (!window.confirm(t.reset_confirm)) return;
        const resetTeams = teams.map(t => ({ ...t, score: 0 }));
        setTeams(resetTeams);
        setClearedTiles({});
        setStudentScoreAdjustments({});

        if (isLive) {
            await broadcastRoomState(null, null, resetTeams, {});
        }
    };

    const currentSlotResponses = useMemo(() => {
        return liveResponses.filter(r => r.question_index === targetNumericIndex);
    }, [liveResponses, targetNumericIndex]);

    const levelTarget = 2500;
    const currentLevel = Math.floor(totalClassScore / levelTarget) + 1;
    const progressInLevel = totalClassScore % levelTarget;
    const progressPercent = Math.min(100, Math.round((progressInLevel / levelTarget) * 100));

    return (
        <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col font-sans select-none overflow-hidden animate-in fade-in">

            {/* Top Navigation & Status Bar */}
            <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between text-white shrink-0 gap-4">
                
                {/* LEFT: Room PIN / Go Live Button + Title Input with embedded Save + Visibility Toggle */}
                <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs shrink-0">
                        {t.game_title}
                    </span>

                    {/* Unified Title Box with embedded Save button */}
                    <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1 shadow-xs transition-all focus-within:ring-2 focus-within:ring-indigo-500/40">
                        <Edit3 size={13} className="mr-2 shrink-0 text-slate-400" />
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t.title_placeholder}
                            className="text-xs sm:text-sm font-bold tracking-tight outline-none bg-transparent w-40 sm:w-56 text-white placeholder-slate-500"
                        />
                        {Object.keys(pool).length > 0 && !isLive && (
                            <button
                                type="button"
                                onClick={handleSaveBoard}
                                disabled={isSaving}
                                className="ml-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                title={t.save_tooltip}
                            >
                                <Save size={12} className={isSaving ? "animate-spin" : ""} />
                                <span>{isSaving ? t.saving : t.save}</span>
                            </button>
                        )}
                    </div>

                    {/* Visibility Toggle */}
                    {!isLive && (
                        <div className="flex items-center gap-0.5 bg-slate-800 p-1 rounded-xl border border-slate-700 shadow-xs">
                            <button
                                type="button"
                                onClick={() => setVisibility('private')}
                                className={`p-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${visibility === 'private' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                                title={t.private_tooltip}
                            >
                                <Lock size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisibility('school')}
                                className={`p-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${visibility === 'school' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                                title={t.school_tooltip}
                            >
                                <Building2 size={13} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Center: Curate vs Play Switcher */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button
                            type="button"
                            onClick={async () => {
                                setMode('curate');
                                if (isLive) {
                                    await broadcastRoomState(null, null);
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                mode === 'curate' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Edit3 size={13} />
                            {t.setup_curate}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('play')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                mode === 'play' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Play size={13} />
                            {t.play}
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
                                <span>{t.grid_view}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurateView('audit')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                                    curateView === 'audit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <ListFilter size={12} />
                                <span>{t.audit_view} ({dimensions.columns * dimensions.rows})</span>
                            </button>
                        </div>
                    )}

                    {/* Team Standings (rendered only if actual teams > 1) */}
                    {mode === 'play' && teams.length > 1 && (
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
                            title={t.reroll_all_tooltip}
                        >
                            <RefreshCcw size={13} className={isLoading ? "animate-spin" : ""} />
                            <span className="hidden md:inline">{t.reroll_all}</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsHelpOpen(true)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 transition-colors cursor-pointer"
                        title={t.guide_tooltip}
                    >
                        <HelpCircle size={16} />
                    </button>

                    <button
                        onClick={handleResetScores}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 cursor-pointer"
                        title={t.reset_tooltip}
                    >
                        <RotateCcw size={15} />
                    </button>

                    {isLive && classCode ? (
                        <div className="bg-rose-500/10 border-2 border-rose-500/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2.5 shadow-lg shadow-rose-950/20 shrink-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-rose-400 leading-none">
                                    {t.pin_label}
                                </span>
                                <span className="text-xl sm:text-2xl font-mono font-black text-white tracking-widest leading-tight">
                                    {classCode}
                                </span>
                            </div>
                        </div>
                    ) : canHostLiveRoom ? (
                        <button
                            type="button"
                            disabled={isGoingLive || Object.keys(pool).length === 0}
                            onClick={handleGoLive}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-rose-950/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                            title={t.go_live_tooltip}
                        >
                            {isGoingLive ? <Loader2 size={13} className="animate-spin" /> : <Monitor size={13} />}
                            <span>{t.go_live}</span>
                        </button>
                    ) : null}

                    <button
                        onClick={handleCloseEngine}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 border border-slate-700 transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>
            </header>

            {/* Live Curate Lobby Banner */}
            {isLive && mode === 'curate' && (
                <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>{t.lobby_banner}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMode('play')}
                        className="px-3.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                        {t.start_playing_btn}
                    </button>
                </div>
            )}

            {/* Main Stage */}
            <main className="flex-1 overflow-hidden p-4 sm:p-6 flex flex-col lg:flex-row items-stretch justify-center gap-6">
                
                {/* 1. AUDIT VIEW */}
                {mode === 'curate' && curateView === 'audit' ? (
                    <div className="w-full max-w-6xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-full max-h-[82vh] overflow-hidden">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                                    {t.audit_heading}
                                </h3>
                                <p className="text-xs font-medium text-slate-400">
                                    {t.audit_sub}
                                </p>
                            </div>
                            <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {dimensions.columns * dimensions.rows} {t.total_tiles}
                            </span>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar pt-4">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="pb-3 w-16">{t.th_slot}</th>
                                        <th className="pb-3 w-28">{t.th_category}</th>
                                        <th className="pb-3 w-16 text-center">{t.th_level}</th>
                                        <th className="pb-3 w-16 text-center">{t.th_points}</th>
                                        <th className="pb-3">{t.th_prompt}</th>
                                        <th className="pb-3 w-32">{t.th_answer}</th>
                                        <th className="pb-3 w-32 text-center">{t.th_visibility}</th>
                                        <th className="pb-3 w-24 text-right">{t.th_action}</th>
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
                                                        <td className="py-3 font-black text-indigo-300 truncate max-w-[120px]">{catObj?.name || `${t.category_prefix} ${colIdx + 1}`}</td>
                                                        <td className="py-3 text-center">
                                                            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px]">
                                                                {t.level_prefix.charAt(0)}{tileQuestion?.level || (rowIdx + 1)}
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
                                                                <span className="text-slate-600 italic">{t.loading_question}</span>
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
                                                                        title={t.hide_show_text}
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
                                                                        title={t.hide_show_formula}
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
                                                                    title={t.reroll_numbers}
                                                                >
                                                                    <RefreshCcw size={12} />
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        const isCurrentlyWp = Boolean(
                                                                            tileQuestion.wordProblem || 
                                                                            tileQuestion.renderData?.isWordProblemApplied
                                                                        );
                                                                        await handleRegenerateSlot(slotId, !isCurrentlyWp);
                                                                    }}
                                                                    className={`p-1.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                                                                        tileQuestion?.wordProblem 
                                                                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                                                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                                                    }`}
                                                                    title={tileQuestion?.wordProblem ? "Gör om till vanligt tal" : "Gör om till textuppgift"}
                                                                >
                                                                    <Type size={12} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleTileClick(slotId)}
                                                                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-[10px] font-black uppercase transition-all cursor-pointer"
                                                                >
                                                                    {t.show_btn}
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
                    <div className="flex-1 min-w-0 flex items-center justify-center overflow-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                <RefreshCcw size={28} className="animate-spin text-indigo-500" />
                                <span className="text-xs font-black uppercase tracking-widest">
                                    {t.constructing_board}
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
                                {categories.slice(0, dimensions.columns).map((cat, colIdx) => {
                                    // Check if all tiles in this column share the same mode
                                    const colTiles = Array.from({ length: dimensions.rows }).map((_, r) => pool[`c${colIdx}_r${r}`]);
                                    const allWordProblems = colTiles.length > 0 && colTiles.every(t => t?.wordProblem || t?.renderData?.isWordProblemApplied);
                                    const allMathProblems = colTiles.length > 0 && colTiles.every(t => !t?.wordProblem && !t?.renderData?.isWordProblemApplied);

                                    return (
                                        <div 
                                            key={cat.id || colIdx}
                                            className="bg-indigo-950/80 border-2 border-indigo-700/60 rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center shadow-lg min-h-[50px] relative"
                                        >
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                                    {t.category_prefix} {colIdx + 1}
                                                </span>
                                                {/* Category Mode Pill */}
                                                {allWordProblems ? (
                                                    <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 border border-amber-500/40 text-[9px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-0.5">
                                                        <Type size={9} /> {lang === 'sv' ? "Text" : "Story"}
                                                    </span>
                                                ) : allMathProblems ? (
                                                    <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-[9px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-0.5">
                                                        <Calculator size={9} /> {lang === 'sv' ? "Tal" : "Math"}
                                                    </span>
                                                ) : (
                                                    <span className="px-1.5 py-0.2 rounded-md bg-slate-800 border border-slate-700 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                        {lang === 'sv' ? "Blandat" : "Mixed"}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider line-clamp-1">
                                                {cat.name}
                                            </span>
                                        </div>
                                    );
                                })}

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
                                                        ${isCleared && (mode === 'play' || isLive)
                                                            ? 'bg-slate-900/40 border-slate-800/60 text-slate-700 opacity-30 cursor-not-allowed'
                                                            : isActiveNow
                                                            ? 'bg-indigo-950 border-amber-400 ring-4 ring-amber-400/40 text-amber-300 scale-105 shadow-2xl'
                                                            : 'bg-slate-900 border-indigo-500/40 hover:border-amber-400 hover:bg-slate-800/90 hover:scale-[1.02] shadow-xl text-amber-300'
                                                        }`}
                                                >
                                                    {mode === 'curate' && tileQuestion && (
                                                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {/* Toggle Math <-> Story for this exact tile */}
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    const isCurrentlyWp = Boolean(
                                                                        tileQuestion.wordProblem || 
                                                                        tileQuestion.renderData?.isWordProblemApplied
                                                                    );
                                                                    await handleRegenerateSlot(slotId, !isCurrentlyWp);
                                                                }}
                                                                className={`p-1 rounded-lg border cursor-pointer transition-colors ${
                                                                    tileQuestion.wordProblem || tileQuestion.renderData?.isWordProblemApplied
                                                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/40' 
                                                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                                                }`}
                                                                title={tileQuestion.wordProblem ? "Gör om till vanligt tal" : "Gör om till textuppgift"}
                                                            >
                                                                <Type size={11} />
                                                            </button>

                                                            {/* Existing Re-roll numbers button */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRegenerateSlot(slotId);
                                                                }}
                                                                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700 cursor-pointer"
                                                                title={t.reroll_numbers}
                                                            >
                                                                <RefreshCcw size={11} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight drop-shadow-md">
                                                        {isCleared && (mode === 'play' || isLive) ? '—' : points}
                                                    </span>

                                                    {mode === 'curate' && tileQuestion && (
                                                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider mt-1">
                                                            <span className="text-slate-500">
                                                                {t.level_prefix} {tileQuestion.level || (rowIdx + 1)}
                                                            </span>
                                                            {(tileQuestion.wordProblem || tileQuestion.renderData?.isWordProblemApplied) && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Textuppgift" />
                                                            )}
                                                        </div>
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

                {/* 🟢 3. CLASSROOM HUB SIDEBAR */}
                {isLive && mode === 'play' && (
                    <div className="w-full lg:w-80 bg-slate-900/95 border border-slate-800 rounded-3xl p-4 flex flex-col shadow-2xl shrink-0 max-h-[82vh] gap-3">
                        
                        {/* Section A: TOP 7 LEADERBOARD */}
                        <div className="flex flex-col flex-1 min-h-0 bg-slate-950/70 rounded-2xl border border-slate-800/80 p-3 overflow-hidden">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2 shrink-0">
                                <div className="flex items-center gap-2">
                                    <Trophy size={15} className="text-amber-400" />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                                        {t.top7_heading}
                                    </h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 font-mono">
                                    {activeStudentCount} {t.active_students}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-0.5">
                                {leaderboard.length === 0 ? (
                                    <div className="h-full py-8 flex flex-col items-center justify-center text-center text-slate-500 gap-1.5">
                                        <Clock size={20} className="opacity-40 animate-pulse" />
                                        <p className="text-[11px] font-bold uppercase tracking-wider">
                                            {t.waiting_first_answer}
                                        </p>
                                    </div>
                                ) : (
                                    leaderboard.map((student, rankIdx) => {
                                        const isGold = rankIdx === 0;
                                        const isSilver = rankIdx === 1;
                                        const isBronze = rankIdx === 2;

                                        return (
                                            <div 
                                                key={student.displayName}
                                                className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between transition-all group ${
                                                    isGold 
                                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' 
                                                        : isSilver
                                                        ? 'bg-slate-300/10 border-slate-300/30 text-slate-200'
                                                        : isBronze
                                                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-200'
                                                        : 'bg-slate-900 border-slate-800 text-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0 pr-1">
                                                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono font-black text-[10px] shrink-0 ${
                                                        isGold ? 'bg-amber-500 text-slate-950' :
                                                        isSilver ? 'bg-slate-300 text-slate-950' :
                                                        isBronze ? 'bg-orange-600 text-white' :
                                                        'bg-slate-800 text-slate-400'
                                                    }`}>
                                                        {rankIdx + 1}
                                                    </span>
                                                    <span className="text-xs font-bold truncate max-w-[110px]">
                                                        {student.displayName}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <span className="text-xs font-mono font-black text-amber-300">
                                                        {student.score}p
                                                    </span>

                                                    {/* Quick Teacher Score Adjustment (+/- 50p) */}
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center ml-1 border-l border-slate-700/60 pl-1 gap-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAdjustSoloStudent(student.displayName, -50)}
                                                            className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                                                            title="-50p"
                                                        >
                                                            <Minus size={10} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAdjustSoloStudent(student.displayName, 50)}
                                                            className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 cursor-pointer"
                                                            title="+50p"
                                                        >
                                                            <Plus size={10} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Section B: STREAK */}
                        <div className="bg-slate-950/70 rounded-2xl border border-slate-800/80 p-3 shrink-0">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Flame size={14} className="text-rose-500 animate-pulse" />
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-rose-400">
                                    {t.streak_heading}
                                </h4>
                            </div>

                            {streakList.length === 0 ? (
                                <p className="text-[10px] text-slate-500 italic py-1">
                                    {t.streak_empty}
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {streakList.map(st => (
                                        <div 
                                            key={st.displayName}
                                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1.5 text-[11px] font-bold"
                                        >
                                            <Flame size={12} className="text-rose-500 shrink-0" />
                                            <span className="truncate max-w-[100px]">{st.displayName}</span>
                                            <span className="font-mono font-black text-rose-400 text-[10px]">
                                                {st.streak} {t.in_a_row}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section C: CLASS ENERGY */}
                        <div className="bg-indigo-950/40 rounded-2xl border border-indigo-900/60 p-3 shrink-0 space-y-1.5">
                            <div className="flex items-center justify-between text-indigo-300">
                                <div className="flex items-center gap-1.5">
                                    <Zap size={14} className="text-amber-400" />
                                    <span className="text-[11px] font-black uppercase tracking-wider">
                                        {t.class_energy_heading}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-amber-300">
                                    {t.level_prefix} {currentLevel}
                                </span>
                            </div>

                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-indigo-900/40">
                                <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                                <span>{totalClassScore} {t.collected_points}</span>
                                <span>{progressInLevel} / {levelTarget} p</span>
                            </div>
                        </div>

                    </div>
                )}
            </main>

            {/* ANPASSA WATERMARK FOOTER */}
            <footer className="relative z-10 px-6 py-2.5 bg-slate-950/80 border-t border-slate-900 flex items-center justify-between text-[11px] font-medium text-slate-500 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                        <Sparkles size={10} className="text-indigo-400" />
                    </div>
                    <span className="font-bold tracking-wider uppercase text-slate-400">
                        Anpassa Math Platform
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500 font-mono">{t.game_title}</span>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                    <span>Activity Mode</span>
                    <span>•</span>
                    <span className="text-indigo-400/80 font-black">Live Classroom Sync</span>
                </div>
            </footer>

            {/* Stage Modal with Active Question Live Responses */}
            <GameQuestionStageModal
                isOpen={isStageModalOpen}
                onClose={handleCloseStageModal}        
                onFinishAndClear={handleFinishAndClear}
                question={activeQuestion}
                points={activePoints}
                teams={teams}
                onAwardPoints={handleAwardPoints}
                onRegenerate={() => handleRegenerateSlot(activeSlotId)}
                onToggleWordProblem={() => handleToggleSlotWordProblem(activeSlotId)}
                lang={lang}
                showPointsAwarding={Boolean(mode === 'play' || isLive) && teams.length > 0}
                isLive={isLive && mode === 'play'}
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