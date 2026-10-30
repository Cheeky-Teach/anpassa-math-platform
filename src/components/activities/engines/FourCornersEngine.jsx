// src/components/activities/engines/FourCornersEngine.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Play, RefreshCcw, Sparkles, Edit3, Trash2, Plus, 
    ArrowLeft, ArrowRight, Eye, CheckCircle2, Users, Save,
    ChevronRight, X, Loader2, Type, Calculator, Lightbulb, ChevronDown, ChevronUp,
    Monitor, Lock, Building2, Timer, Flame, Trophy, Zap, Award
} from 'lucide-react';
import QuestionSummoner from '../../views/QuestionSummoner';
import VisualRenderer from '../../visuals/VisualRenderer';
import PreferencesToggle from '../../ui/PreferencesToggle';
import { generateDistractors } from '../../../lib/distractorGenerator';
import { extractDecodedAnswer } from '../../live/core/liveAnswerUtils.js';
import { universalRegenerateQuestion, universalRegenerateAll, saveActivityToLibrary } from '../../live/core/activityQuestionUtils.js';
import { useActivityEngineSession } from '../hooks/useActivityEngineSession.js';

const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    const str = String(content || '').trim();
    const hasMath = /\\cdot|\^|_|\\frac|\\times|·/.test(str);
    const formattedContent = hasMath && !str.includes('$') ? `$${str}$` : str;

    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.innerText = formattedContent;
        if (window.renderMathInElement) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false,
                trust: true
            });
        }
    }, [formattedContent]);

    return <span ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap ${className}`} />;
};

export default function FourCornersEngine({
    initialConfig,
    sourcePacket = null,
    session = null,      
    isLiveHost = false,
    profile = null,
    onClose,
    lang = 'sv'
}) {
    const t = {
        sv: {
            title: "4 Hörn",
            curate_title: "Förbered Frågelista",
            round: "Runda",
            of: "av",
            start_game: "Starta Spel",
            rounds_word: "omgångar",
            reroll_numbers: "Slumpa Tal",
            quick_edit: "Redigera",
            review_list: "Frågelista",
            playlist_structure: "Omgångens Uppgifter",
            playlist_sub: "Granska svarsalternativ och ordning inför helklassgenomgång.",
            summon_more: "Hämta Frågor",
            create_custom: "Skapa Egen Fråga",
            empty_playlist: "Inga frågor i spellistan",
            empty_sub: "Hämta frågor från läroplanen eller skapa en egen uppgift.",
            correct_badge: "Rätt",
            votes_submitted: "röster inlämnade",
            corner: "Hörn",
            show_distribution: "Visa Fördelning",
            show_correct: "Visa Rätt Hörn",
            next_round: "Nästa Runda",
            room_pin: "RUMSKOD",
            modal_edit_title: "Redigera Fråga & Hörn",
            modal_new_title: "Skapa Egen Fråga",
            prompt_label: "Uppgiftstext",
            latex_label: "Formel (LaTeX)",
            corners_label: "Svarsalternativ i de 4 Hörnen",
            reroll_distractors: "Slumpa om felaktiga svar",
            cancel: "Avbryt",
            save_update: "Spara & Uppdatera",
            clues: "Ledtrådar",
            clue: "Ledtråd",
            show_clues: "Visa Ledtrådar",
            hide_clues: "Dölj Ledtrådar",
            no_clues: "Inga ledtrådar för denna uppgift.",
            name_placeholder: "Namnge aktiviteten...",
            save_btn: "Spara",
            saving_btn: "Sparar...",
            save_success: "Sparades i biblioteket!",
            save_tooltip: "Spara till biblioteket",
            private_tooltip: "Bara jag (Privat)",
            school_tooltip: "Min Skola",
            start_live: "Starta Live",
            start_live_tooltip: "Starta live-rum för nuvarande uppgifter",
            formula_on: "Formel På",
            formula_off: "Formel Av",
            reroll_all_confirm: "Slumpa nya tal för alla frågor?",
            reroll_all_btn: "Slumpa alla",
            delete_tooltip: "Ta bort",
            timer_off: "Timer Av",
            add_10s: "+10s",
            results_btn: "Resultat",
            results_heading: "Topplista & Prestationer",
            podium_heading: "Ledningen",
            streak_heading: "Streak-mästare",
            class_energy_heading: "Klassens Kraft",
            points_word: "p",
            in_a_row: "i rad!"
        },
        en: {
            title: "4 Corners",
            curate_title: "Prepare Playlist",
            round: "Round",
            of: "of",
            start_game: "Start Game",
            rounds_word: "rounds",
            reroll_numbers: "Re-roll Numbers",
            quick_edit: "Edit",
            review_list: "Playlist",
            playlist_structure: "Round Questions",
            playlist_sub: "Review distractors and order before whole-class presentation.",
            summon_more: "Summon Questions",
            create_custom: "Create Question",
            empty_playlist: "Playlist is empty",
            empty_sub: "Summon from generators or write your own problem.",
            correct_badge: "Correct",
            votes_submitted: "votes submitted",
            corner: "Corner",
            show_distribution: "Show Distribution",
            show_correct: "Reveal Winner",
            next_round: "Next Round",
            room_pin: "ROOM PIN",
            modal_edit_title: "Edit Question & Corners",
            modal_new_title: "Create Question",
            prompt_label: "Prompt Text",
            latex_label: "Formula (LaTeX)",
            corners_label: "Options for the 4 Corners",
            reroll_distractors: "Re-roll Distractors",
            cancel: "Cancel",
            save_update: "Save & Update",
            clues: "Clues",
            clue: "Clue",
            show_clues: "Show Clues",
            hide_clues: "Hide Clues",
            no_clues: "No clues available for this problem.",
            name_placeholder: "Name the activity...",
            save_btn: "Save",
            saving_btn: "Saving...",
            save_success: "Saved to library!",
            save_tooltip: "Save to library",
            private_tooltip: "Only me (Private)",
            school_tooltip: "My School",
            start_live: "Go Live",
            start_live_tooltip: "Host live room for current tasks",
            formula_on: "Formula On",
            formula_off: "Formula Off",
            reroll_all_confirm: "Re-roll numbers for all questions?",
            reroll_all_btn: "Randomize all",
            delete_tooltip: "Delete",
            timer_off: "Timer Off",
            add_10s: "+10s",
            results_btn: "Results",
            results_heading: "Leaderboard & Highlights",
            podium_heading: "Podium",
            streak_heading: "Streak Masters",
            class_energy_heading: "Class Energy",
            points_word: "pts",
            in_a_row: "in a row!"
        }
    }[lang] || {};

    // 1. Core State
    const [viewMode, setViewMode] = useState(session?.active_question_data?.activeQuestion ? 'play' : 'curate');
    const [rounds, setRounds] = useState([]);
    const [activeRoundIndex, setActiveRoundIndex] = useState(0);
    const [revealedPhase, setRevealedPhase] = useState('commit');

    // Title & Save State
    const defaultTitle = initialConfig?.title || 
                         sourcePacket?.title || 
                         (lang === 'sv' ? "4 Hörn Aktivitet" : "4 Corners Activity");
    const [activityTitle, setActivityTitle] = useState(defaultTitle);
    const [sheetId, setSheetId] = useState(initialConfig?.sheetId || sourcePacket?.id || null);
    const [visibility, setVisibility] = useState(sourcePacket?.visibility || initialConfig?.savedSheet?.visibility || 'private');

    // Timer Controls
    const defaultDuration = initialConfig?.settings?.timerSeconds !== undefined ? initialConfig.settings.timerSeconds : 30;
    const [timerDuration, setTimerDuration] = useState(defaultDuration);
    const [timeLeft, setTimeLeft] = useState(defaultDuration);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Clue Accordion
    const [showClues, setShowClues] = useState(false);
    const [revealedClueIndex, setRevealedClueIndex] = useState(0);

    // Modals & UI States
    const [isSummonerOpen, setIsSummonerOpen] = useState(false);
    const [editingRound, setEditingRound] = useState(null);
    const [isReRolling, setIsReRolling] = useState(false);
    const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isResultsDrawerOpen, setIsResultsDrawerOpen] = useState(false);

    // HUD cycling index (0: Streaks, 1: Podium, 2: Class Energy)
    const [hudIndex, setHudIndex] = useState(0);

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
        mode: 'activity_four_corners',
        gameKey: 'four_corners',
        title: activityTitle,
        lang,
        getPacket: () => rounds,
        getSettings: () => ({ questionCount: rounds.length, timerSeconds: timerDuration }),
        getInitialBroadcastData: () => ({
            activeTile: null,
            activeQuestion: null,
            revealedPhase: 'commit',
            roundIndex: 0
        })
    });

    const CORNER_STYLES = {
        A: {
            bg: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-900 dark:text-indigo-100',
            pill: 'bg-indigo-600 text-white',
            bar: 'bg-indigo-500'
        },
        B: {
            bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-100',
            pill: 'bg-emerald-600 text-white',
            bar: 'bg-emerald-500'
        },
        C: {
            bg: 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-100',
            pill: 'bg-amber-600 text-white',
            bar: 'bg-amber-500'
        },
        D: {
            bg: 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-100',
            pill: 'bg-rose-600 text-white',
            bar: 'bg-rose-500'
        }
    };

    const formatToCornerRound = (raw, roundNumber) => {
        const rd = raw.renderData || raw.resolvedData?.renderData || raw.data?.renderData || raw || {};
        const resolved = raw.resolvedData || raw;
        const isWp = Boolean(
            raw.wordProblem || 
            resolved.wordProblem || 
            rd.isWordProblemApplied || 
            resolved.metadata?.isWordProblemApplied
        );

        const correctAnswer = extractDecodedAnswer(resolved) || 
                              extractDecodedAnswer(rd) || 
                              extractDecodedAnswer(raw) || 
                              raw.answer || 
                              rd.answer || 
                              '';

        const options = (rd.options && rd.options.length >= 4)
            ? rd.options
            : generateDistractors({
                correctAnswer,
                topicId: raw.topicId || resolved.topicId || '',
                renderData: rd,
                resolvedData: resolved,
                raw
            });

        return {
            id: raw.id || crypto.randomUUID(),
            roundIndex: roundNumber,
            topicId: raw.topicId || resolved.topicId || raw.renderData?.topicId || (raw.topic_ids?.[0]) || 'custom',
            variationKey: raw.variationKey || resolved.variationKey || null,
            name: raw.name || `${t.round} ${roundNumber}`,
            source: raw.source || 'generator',
            wordProblem: isWp,
            showText: raw.showText !== false,
            showLatex: raw.showLatex !== undefined ? raw.showLatex : !isWp,
            showVisual: raw.showVisual !== false,
            renderData: { 
                ...rd, 
                options, 
                answer: correctAnswer,
                isWordProblemApplied: isWp 
            },
            responseSpec: { type: 'single_choice', answer: correctAnswer, options }
        };
    };

    const handleSavePlaylist = async () => {
        if (rounds.length === 0) return;
        setIsSaving(true);
        try {
            const saved = await saveActivityToLibrary({
                sheetId,
                title: activityTitle,
                type: 'activity_four_corners',
                visibility,
                packet: rounds,
                config: { questionCount: rounds.length }
            });
            setSheetId(saved.id);
            alert(t.save_success);
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const initialList = initialConfig?.initialQuestions || sourcePacket || [];
        if (initialList.length > 0) {
            setRounds(initialList.map((q, idx) => formatToCornerRound(q, idx + 1)));
        }
    }, []);

    const currentRound = rounds[activeRoundIndex] || null;

    useEffect(() => {
        setShowClues(false);
        setRevealedClueIndex(0);
        if (timerDuration > 0) {
            setTimeLeft(timerDuration);
            setIsTimerRunning(viewMode === 'play');
        } else {
            setIsTimerRunning(false);
        }
    }, [activeRoundIndex, currentRound?.id, viewMode]);

    // 🟢 Countdown Timer Effect (Locks answers at zero, does NOT auto-advance)
    useEffect(() => {
        if (!isTimerRunning || timerDuration === 0 || revealedPhase !== 'commit') return;

        if (timeLeft <= 0) {
            setIsTimerRunning(false);
            setPhaseAndBroadcast('distribution');
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft, timerDuration, revealedPhase]);

    // 🟢 Bottom HUD Rotate Timer (Cycles every 4.5 seconds)
    useEffect(() => {
        if (viewMode !== 'play') return;
        const interval = setInterval(() => {
            setHudIndex(prev => (prev + 1) % 3);
        }, 4500);
        return () => clearInterval(interval);
    }, [viewMode]);

    // 🟢 Live Votes derived directly from hook's liveResponses stream
    const liveVotes = useMemo(() => {
        const tallies = { A: 0, B: 0, C: 0, D: 0 };
        if (!currentRound) return tallies;

        liveResponses
            .filter(r => r.question_index === currentRound.roundIndex)
            .forEach(r => {
                const choice = r.answer?.toUpperCase();
                if (tallies[choice] !== undefined) tallies[choice]++;
            });

        return tallies;
    }, [liveResponses, currentRound]);

    const totalVotesSubmitted = useMemo(() => {
        return liveVotes.A + liveVotes.B + liveVotes.C + liveVotes.D;
    }, [liveVotes]);

    // 🟢 Pedagogical Scoring: Flat Base (100p) + Streak Bonuses
    const { leaderboard, streakList, totalClassScore } = useMemo(() => {
        const studentMap = {};
        const studentHistory = {};

        liveResponses.forEach(res => {
            const alias = res.student_alias || 'Elev';
            if (!studentMap[alias]) {
                studentMap[alias] = { alias, score: 0 };
                studentHistory[alias] = [];
            }
            studentHistory[alias].push(res);
        });

        // Compute scores with streak bonuses: 1->100p, 2->125p, 3->150p, 4+->200p
        Object.entries(studentHistory).forEach(([alias, history]) => {
            let runningStreak = 0;
            let total = 0;

            history.forEach(ans => {
                if (ans.is_correct) {
                    runningStreak += 1;
                    const bonus = runningStreak === 1 ? 0 : runningStreak === 2 ? 25 : runningStreak === 3 ? 50 : 100;
                    total += 100 + bonus;
                } else {
                    runningStreak = 0;
                }
            });

            studentMap[alias].score = total;
            studentMap[alias].currentStreak = runningStreak;
        });

        const sorted = Object.values(studentMap).sort((a, b) => b.score - a.score);
        const topPodium = sorted.slice(0, 5);

        // Streaks for students not in 1st place
        const activeStreaks = sorted
            .filter(s => s.currentStreak >= 2)
            .sort((a, b) => b.currentStreak - a.currentStreak)
            .slice(0, 4);

        const cumulativePoints = sorted.reduce((sum, s) => sum + s.score, 0);

        return {
            leaderboard: topPodium,
            streakList: activeStreaks,
            totalClassScore: cumulativePoints
        };
    }, [liveResponses]);

    const activeClues = useMemo(() => {
        const raw = currentRound?.renderData?.clues || 
                    currentRound?.renderData?.hints || 
                    currentRound?.resolvedData?.clues || 
                    currentRound?.renderData?.solutionSteps || [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') return [raw];
        return [];
    }, [currentRound]);

    const broadcastRoomState = async (updatedRound, phase = 'commit') => {
        if (!isLive) return;

        await broadcastState({
            mode: 'activity_four_corners',
            gameKey: 'four_corners',
            activity_mode: 'activity_four_corners',
            activeTile: updatedRound ? `round_${updatedRound.roundIndex}` : null,
            activeQuestion: updatedRound,
            revealedPhase: phase,
            roundIndex: updatedRound?.roundIndex || 1,
            timerSeconds: timerDuration,
            updated_at: new Date().toISOString()
        });
    };

    const commitAndBroadcastRound = async (updatedRound, phase = 'commit') => {
        setRounds(prev => prev.map(r => r.id === updatedRound.id ? updatedRound : r));
        setRevealedPhase(phase);
        await broadcastRoomState(updatedRound, phase);
    };

    const setPhaseAndBroadcast = async (phase) => {
        setRevealedPhase(phase);
        await broadcastRoomState(currentRound, phase);
    };

    const handleRerollDistractors = (roundId) => {
        setRounds(prev => prev.map(r => {
            if (r.id !== roundId) return r;
            
            const cleanRenderData = { ...r.renderData, options: null };
            const freshOptions = generateDistractors({
                correctAnswer: r.responseSpec.answer || cleanRenderData.answer,
                topicId: r.topicId,
                renderData: cleanRenderData,
                resolvedData: r.resolvedData || r,
                raw: r
            });

            const updated = {
                ...r,
                renderData: { ...r.renderData, options: freshOptions },
                responseSpec: { ...r.responseSpec, options: freshOptions }
            };

            if (viewMode === 'play' && currentRound?.id === roundId) {
                commitAndBroadcastRound(updated, 'commit');
            }
            return updated;
        }));
    };

    const handleRegenerateQuestion = async (round) => {
        if (!round) return;

        const effectiveTopicId = round.topicId !== 'imported' && round.topicId !== 'custom' 
            ? round.topicId 
            : (round.resolvedData?.topicId || round.renderData?.topicId || null);

        if (!effectiveTopicId || effectiveTopicId === 'custom') {
            handleRerollDistractors(round.id);
            return;
        }

        setIsReRolling(true);

        try {
            const freshRound = await universalRegenerateQuestion({
                roomId: roomId,
                questionIndex: round.roundIndex,
                topicId: effectiveTopicId,
                variationKey: round.variationKey || round.resolvedData?.variationKey || null,
                wordProblem: round.wordProblem,
                lang,
                formatFn: formatToCornerRound
            });

            if (freshRound) {
                const updated = {
                    ...freshRound,
                    id: round.id,
                    name: round.name,
                    topicId: effectiveTopicId
                };
                setRounds(prev => prev.map(r => r.id === round.id ? updated : r));
                if (viewMode === 'play' && currentRound?.id === round.id) {
                    await commitAndBroadcastRound(updated, 'commit');
                }
            }
        } catch (err) {
            console.error("[FourCornersEngine] Regenerate failed:", err);
        } finally {
            setIsReRolling(false);
        }
    };

    const handleRegenerateAll = async () => {
        if (!window.confirm(t.reroll_all_confirm)) return;
        setIsRegeneratingAll(true);
        try {
            const refreshed = await universalRegenerateAll({
                items: rounds,
                roomId: roomId,
                lang,
                formatFn: formatToCornerRound,
                onCustomFallback: handleRerollDistractors
            });
            setRounds(refreshed);
        } finally {
            setIsRegeneratingAll(false);
        }
    };

    const isCurrentWordProblem = Boolean(
        currentRound?.wordProblem || 
        currentRound?.renderData?.isWordProblemApplied || 
        currentRound?.resolvedData?.metadata?.isWordProblemApplied
    );

    const effectiveShowLatex = currentRound?.showLatex !== undefined 
        ? Boolean(currentRound?.showLatex) 
        : (!isCurrentWordProblem);

    const effectiveShowVisual = currentRound?.showVisual !== false;

    return (
        <div 
            className="fixed inset-0 z-[500] flex flex-col overflow-hidden select-none font-sans animate-in fade-in transition-colors duration-200"
            style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-main)' }}
        >
            {/* Top Bar Header */}
            <header 
                className="px-6 py-3 flex items-center justify-between shrink-0 z-20 shadow-xs border-b transition-colors"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
            >
                {/* LEFT: Room PIN / Go Live Button + Title + Save */}
                <div className="flex items-center gap-3">
                    <span className="badge-brand font-black text-xs px-2.5 py-1 shrink-0">
                        {t.title}
                    </span>

                    <div 
                        className="flex items-center rounded-xl border px-2.5 py-1 shadow-xs transition-all focus-within:ring-2 focus-within:ring-indigo-500/40"
                        style={{ 
                            backgroundColor: 'var(--bg-surface)', 
                            borderColor: 'var(--border-strong)' 
                        }}
                    >
                        <Edit3 size={13} className="mr-2 shrink-0 opacity-40" />
                        <input
                            type="text"
                            value={activityTitle}
                            onChange={(e) => setActivityTitle(e.target.value)}
                            placeholder={t.name_placeholder}
                            className="text-xs sm:text-sm font-bold tracking-tight outline-none bg-transparent w-40 sm:w-56"
                            style={{ color: 'var(--text-main)' }}
                        />
                        {rounds.length > 0 && !isLive && (
                            <button
                                type="button"
                                onClick={handleSavePlaylist}
                                disabled={isSaving}
                                className="ml-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                title={t.save_tooltip}
                            >
                                <Save size={12} className={isSaving ? "animate-spin" : ""} />
                                <span>{isSaving ? t.saving_btn : t.save_btn}</span>
                            </button>
                        )}
                    </div>

                    {!isLive && (
                        <div 
                            className="flex items-center gap-0.5 p-1 rounded-xl border shadow-xs"
                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                        >
                            <button
                                type="button"
                                onClick={() => setVisibility('private')}
                                className={`p-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                                    visibility === 'private' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-60 hover:opacity-100'
                                }`}
                                title={t.private_tooltip}
                            >
                                <Lock size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisibility('school')}
                                className={`p-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                                    visibility === 'school' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-60 hover:opacity-100'
                                }`}
                                title={t.school_tooltip}
                            >
                                <Building2 size={13} />
                            </button>
                        </div>
                    )}
                </div>

                {/* CENTER: Play Controls, Timer, Preferences */}
                <div className="flex items-center gap-3">
                    {viewMode === 'curate' ? (
                        <button
                            onClick={() => {
                                if (rounds.length === 0) return;
                                setViewMode('play');
                                setActiveRoundIndex(0);
                                commitAndBroadcastRound(rounds[0], 'commit');
                            }}
                            disabled={rounds.length === 0}
                            className="btn-brand text-xs font-black uppercase tracking-wider px-5 py-2.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
                        >
                            <Play size={16} /> {t.start_game} ({rounds.length} {t.rounds_word})
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            {/* Runtime Timer Pill */}
                            <div 
                                className="flex items-center rounded-xl border px-2 py-1 gap-1.5 shadow-xs"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                        isTimerRunning ? 'text-amber-500 animate-pulse' : 'opacity-40'
                                    }`}
                                    title={isTimerRunning ? "Pausa timer" : "Starta timer"}
                                >
                                    <Timer size={14} />
                                </button>

                                <span className="font-mono text-xs font-black w-8 text-center">
                                    {timerDuration === 0 ? "—" : `${timeLeft}s`}
                                </span>

                                {timerDuration > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setTimeLeft(prev => prev + 10)}
                                        className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                                        title="+10 sekunder"
                                    >
                                        {t.add_10s}
                                    </button>
                                )}

                                <select
                                    value={timerDuration}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        setTimerDuration(val);
                                        setTimeLeft(val);
                                        setIsTimerRunning(val > 0 && revealedPhase === 'commit');
                                    }}
                                    className="bg-transparent text-[10px] font-bold outline-none cursor-pointer border-l pl-1"
                                    style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                                >
                                    <option value={0} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>{t.timer_off}</option>
                                    <option value={15} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>15s</option>
                                    <option value={30} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>30s</option>
                                    <option value={45} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>45s</option>
                                    <option value={60} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>60s</option>
                                </select>
                            </div>

                            {currentRound?.renderData?.latex && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = !effectiveShowLatex;
                                        const updated = { ...currentRound, showLatex: next };
                                        commitAndBroadcastRound(updated, revealedPhase);
                                    }}
                                    className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                                        effectiveShowLatex 
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                                    }`}
                                    style={!effectiveShowLatex ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' } : {}}
                                >
                                    <Calculator size={14} />
                                    <span>{effectiveShowLatex ? t.formula_on : t.formula_off}</span>
                                </button>
                            )}

                            <button
                                onClick={() => handleRegenerateQuestion(currentRound)}
                                disabled={isReRolling}
                                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer hover:border-amber-400"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                            >
                                <RefreshCcw size={14} className={isReRolling ? "animate-spin text-amber-500" : ""} /> {t.reroll_numbers}
                            </button>

                            <button
                                onClick={() => setEditingRound(currentRound)}
                                className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer hover:border-indigo-400"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                            >
                                <Edit3 size={14} /> {t.quick_edit}
                            </button>

                            <button
                                onClick={() => setViewMode('curate')}
                                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                            >
                                {t.review_list}
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT: Live PIN / Go Live + Preferences + Close */}
                <div className="flex items-center gap-3">
                    <PreferencesToggle />

                    {isLive && classCode ? (
                        <div className="bg-rose-500/10 border-2 border-rose-500/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2.5 shadow-lg shadow-rose-950/20 shrink-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-rose-500 dark:text-rose-400 leading-none">
                                    {t.room_pin}
                                </span>
                                <span className="text-xl sm:text-2xl font-mono font-black tracking-widest leading-tight" style={{ color: 'var(--text-main)' }}>
                                    {classCode}
                                </span>
                            </div>
                        </div>
                    ) : canHostLiveRoom ? (
                        <button
                            type="button"
                            disabled={isGoingLive || rounds.length === 0}
                            onClick={handleGoLive}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-rose-950/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                            title={t.start_live_tooltip}
                        >
                            {isGoingLive ? <Loader2 size={13} className="animate-spin" /> : <Monitor size={13} />}
                            <span>{t.start_live}</span>
                        </button>
                    ) : null}

                    <button 
                        onClick={handleCloseEngine} 
                        className="p-2 rounded-xl transition-colors cursor-pointer hover:bg-rose-500 hover:text-white"
                        style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                        title={t.cancel}
                    >
                        <X size={18} />
                    </button>
                </div>
            </header>

            {/* Main Stage Viewport */}
            <main className="flex-1 overflow-hidden relative">
                {viewMode === 'curate' && (
                    <div className="h-full overflow-y-auto p-8 max-w-5xl mx-auto space-y-4 custom-scrollbar">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-black">{t.playlist_structure}</h2>
                                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{t.playlist_sub}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const newQ = {
                                            id: crypto.randomUUID(),
                                            roundIndex: rounds.length + 1,
                                            topicId: 'custom',
                                            name: `${t.round} ${rounds.length + 1}`,
                                            source: 'custom',
                                            wordProblem: false,
                                            showText: true,
                                            showLatex: true,
                                            showVisual: true,
                                            renderData: {
                                                description: lang === 'sv' ? "Vad är värdet av x?" : "What is the value of x?",
                                                latex: "2x + 4 = 10",
                                                answer: "3",
                                                clues: [
                                                    lang === 'sv' ? "Börja med att subtrahera 4 från båda sidor." : "Start by subtracting 4 from both sides.",
                                                    lang === 'sv' ? "Dela sedan resultatet med 2." : "Then divide the result by 2."
                                                ],
                                                options: [
                                                    { id: 'A', label: '3', isCorrect: true },
                                                    { id: 'B', label: '7', isCorrect: false },
                                                    { id: 'C', label: '6', isCorrect: false },
                                                    { id: 'D', label: '2', isCorrect: false }
                                                ]
                                            },
                                            responseSpec: {
                                                type: 'single_choice',
                                                answer: "3",
                                                options: [
                                                    { id: 'A', label: '3', isCorrect: true },
                                                    { id: 'B', label: '7', isCorrect: false },
                                                    { id: 'C', label: '6', isCorrect: false },
                                                    { id: 'D', label: '2', isCorrect: false }
                                                ]
                                            }
                                        };
                                        setEditingRound(newQ);
                                    }}
                                    className="px-4 py-2 border rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                >
                                    <Plus size={16} /> {t.create_custom}
                                </button>
                                {rounds.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleRegenerateAll}
                                        disabled={isRegeneratingAll}
                                        className="px-3.5 py-2 border rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:border-amber-400 hover:text-amber-500"
                                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                        title={t.reroll_all_confirm}
                                    >
                                        <RefreshCcw size={14} className={isRegeneratingAll ? "animate-spin text-amber-500" : ""} />
                                        <span>{t.reroll_all_btn}</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsSummonerOpen(true)}
                                    className="btn-brand px-4 py-2 text-xs font-black uppercase tracking-wider shadow-xs cursor-pointer"
                                >
                                    <Sparkles size={16} /> {t.summon_more}
                                </button>
                            </div>
                        </div>

                        {rounds.length === 0 ? (
                            <div 
                                className="border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center"
                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
                            >
                                <Sparkles size={36} className="text-indigo-400 mb-3" />
                                <h3 className="text-base font-black mb-1">{t.empty_playlist}</h3>
                                <p className="text-xs max-w-sm mb-4" style={{ color: 'var(--text-muted)' }}>{t.empty_sub}</p>
                            </div>
                        ) : (
                            rounds.map((round, idx) => {
                                const rd = round.renderData || {};
                                const hasVisual = Boolean(rd.geometry || rd.graph || rd.pattern || rd.marbles || rd.diagram);

                                return (
                                    <div 
                                        key={round.id} 
                                        className="card border rounded-3xl p-6 shadow-sm transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <span 
                                                    className="w-9 h-9 rounded-2xl font-black text-xs flex items-center justify-center border shrink-0"
                                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                                                >
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-500">
                                                            {round.name}
                                                        </h4>
                                                        {round.wordProblem && (
                                                            <span className="badge-brand theme-amber text-[10px]">
                                                                {lang === 'sv' ? "Textuppgift" : "Word Problem"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button 
                                                    onClick={() => handleRerollDistractors(round.id)} 
                                                    className="p-2 border rounded-xl cursor-pointer transition-colors hover:text-indigo-500"
                                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                                                    title={t.reroll_distractors}
                                                >
                                                    <Sparkles size={15} />
                                                </button>

                                                <button 
                                                    onClick={() => handleRegenerateQuestion(round)} 
                                                    className="p-2 border rounded-xl cursor-pointer transition-colors hover:text-amber-500"
                                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                                                    title={t.reroll_numbers}
                                                >
                                                    <RefreshCcw size={15} />
                                                </button>

                                                <button 
                                                    onClick={() => setEditingRound(round)} 
                                                    className="p-2 border rounded-xl cursor-pointer transition-colors hover:text-indigo-500"
                                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                                                    title={t.quick_edit}
                                                >
                                                    <Edit3 size={15} />
                                                </button>

                                                <button 
                                                    onClick={() => setRounds(prev => prev.filter(r => r.id !== round.id))} 
                                                    className="p-2 border rounded-xl cursor-pointer transition-colors hover:text-rose-500"
                                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                                                    title={t.delete_tooltip}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        {rd.description && (
                                            <div className="text-sm sm:text-base font-bold mb-3 leading-relaxed">
                                                <MathDisplay content={rd.description} />
                                            </div>
                                        )}

                                        {hasVisual && round.showVisual !== false && (
                                            <div 
                                                className="whiteboard-protect w-full flex justify-center py-4 border border-slate-200 rounded-2xl overflow-hidden mb-3 shadow-xs"
                                            >
                                                <VisualRenderer data={rd} isWordProblem={round.wordProblem} />
                                            </div>
                                        )}

                                        {rd.latex && round.showLatex !== false && (
                                            <div 
                                                className="w-full border rounded-2xl p-4 text-center text-2xl font-serif font-bold mb-4 shadow-inner"
                                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--brand-solid)' }}
                                            >
                                                <MathDisplay content={`$$${rd.latex}$$`} />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--border-main)' }}>
                                            {round.renderData.options?.map((opt) => (
                                                <div 
                                                    key={opt.id} 
                                                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                                                        opt.isCorrect 
                                                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 font-bold' 
                                                            : 'border-slate-200 dark:border-slate-800'
                                                    }`}
                                                    style={!opt.isCorrect ? { backgroundColor: 'var(--bg-surface)' } : {}}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] ${
                                                            opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                                                        }`}>
                                                            {opt.id}
                                                        </span>
                                                        <MathDisplay content={String(opt.label)} className="text-sm font-bold" />
                                                    </div>
                                                    {opt.isCorrect && (
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                                            {t.correct_badge}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* 2. PLAY MODE: Projector Stage */}
                {viewMode === 'play' && currentRound && (
                    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto gap-4">
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                            {/* Left Prompt & Visual Card */}
                            <div 
                                className="lg:col-span-7 border-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl overflow-y-auto custom-scrollbar"
                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="badge-brand font-black text-xs px-3 py-1">
                                            {t.round} {activeRoundIndex + 1}
                                        </span>

                                        <div className="flex items-center gap-2">
                                            {activeClues.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowClues(!showClues)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                                                        showClues 
                                                            ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-md' 
                                                            : 'hover:border-amber-400'
                                                    }`}
                                                    style={!showClues ? { backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-main)' } : {}}
                                                >
                                                    <Lightbulb size={14} className={showClues ? "text-slate-900" : "text-amber-500"} />
                                                    <span>{showClues ? t.hide_clues : `${t.clues} (${activeClues.length})`}</span>
                                                    {showClues ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                            )}

                                            <div 
                                                className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
                                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                                            >
                                                <Users size={14} className="text-indigo-500" />
                                                <span>{totalVotesSubmitted} {t.votes_submitted}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-xl sm:text-2xl font-bold leading-relaxed">
                                        <MathDisplay content={currentRound.renderData.description} />
                                    </div>

                                    {showClues && activeClues.length > 0 && (
                                        <div className="p-4 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 space-y-3 animate-in fade-in duration-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                                    <Lightbulb size={16} />
                                                    <span>{t.clues}</span>
                                                </div>
                                                {activeClues.length > 1 && (
                                                    <div className="flex gap-1">
                                                        {activeClues.map((_, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => setRevealedClueIndex(i)}
                                                                className={`w-6 h-6 rounded-lg text-xs font-black cursor-pointer transition-all ${
                                                                    revealedClueIndex === i 
                                                                        ? 'bg-amber-500 text-slate-900 font-black shadow-xs' 
                                                                        : 'bg-black/10 text-slate-600 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                {i + 1}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-sm font-semibold border border-amber-500/30">
                                                <MathDisplay content={activeClues[revealedClueIndex]} />
                                            </div>
                                        </div>
                                    )}

                                    {effectiveShowVisual && (currentRound.renderData?.geometry || currentRound.renderData?.graph || currentRound.renderData?.pattern || currentRound.renderData?.marbles || currentRound.renderData?.diagram) && (
                                        <div 
                                            className="whiteboard-protect w-full flex justify-center py-4 border border-slate-200 rounded-2xl overflow-hidden shadow-sm my-2"
                                        >
                                            <VisualRenderer 
                                                data={currentRound.renderData} 
                                                isWordProblem={isCurrentWordProblem}
                                            />
                                        </div>
                                    )}

                                    {effectiveShowLatex && currentRound.renderData.latex && (
                                        <div 
                                            className="text-3xl sm:text-4xl font-serif font-black p-6 rounded-2xl border text-center my-3 shadow-inner"
                                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--brand-solid)' }}
                                        >
                                            <MathDisplay content={`$$${currentRound.renderData.latex}$$`} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right 4-Corner Quadrants */}
                            <div className="lg:col-span-5 grid grid-cols-2 grid-rows-2 gap-4 h-full">
                                {['A', 'B', 'C', 'D'].map((quadId) => {
                                    const opt = currentRound.renderData.options?.find(o => o.id === quadId);
                                    const style = CORNER_STYLES[quadId];
                                    const votes = liveVotes[quadId] || 0;
                                    const pct = totalVotesSubmitted > 0 ? Math.round((votes / totalVotesSubmitted) * 100) : 0;
                                    const isWinner = revealedPhase === 'reveal' && opt?.isCorrect;
                                    const isDimmed = revealedPhase === 'reveal' && !opt?.isCorrect;

                                    return (
                                        <div 
                                            key={quadId}
                                            className={`rounded-3xl border-2 p-5 flex flex-col justify-between transition-all duration-300 ${
                                                isWinner 
                                                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-2xl scale-[1.02] ring-4 ring-emerald-400/40' 
                                                    : isDimmed 
                                                        ? 'opacity-30 grayscale border-slate-300 dark:border-slate-800' 
                                                        : style.bg
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs ${
                                                        isWinner ? 'bg-white text-emerald-600' : style.pill
                                                    }`}>
                                                        {quadId}
                                                    </span>
                                                    <span className="text-[11px] font-black uppercase tracking-wider opacity-70">
                                                        {t.corner} {quadId}
                                                    </span>
                                                </div>

                                                {revealedPhase !== 'commit' && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xl font-black">{pct}%</span>
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/10">
                                                            {votes}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="my-auto text-center py-4 text-2xl sm:text-3xl font-black">
                                                <MathDisplay content={String(opt?.label || '')} />
                                            </div>

                                            {revealedPhase !== 'commit' && (
                                                <div className="w-full bg-black/10 rounded-full h-2.5 overflow-hidden">
                                                    <div className={`h-full ${isWinner ? 'bg-white' : style.bar}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 🟢 Footer with Center Rotating HUD Ticker */}
                        <footer 
                            className="h-16 border rounded-2xl px-6 flex items-center justify-between shrink-0 shadow-xs z-30"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
                        >
                            {/* LEFT: Pager */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        if (activeRoundIndex > 0) {
                                            setActiveRoundIndex(prev => prev - 1);
                                            commitAndBroadcastRound(rounds[activeRoundIndex - 1], 'commit');
                                        }
                                    }}
                                    disabled={activeRoundIndex === 0}
                                    className="p-2 rounded-xl disabled:opacity-30 cursor-pointer"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <span className="text-xs font-black uppercase tracking-widest px-2">
                                    {t.round} {activeRoundIndex + 1} / {rounds.length}
                                </span>
                                <button
                                    onClick={() => {
                                        if (activeRoundIndex < rounds.length - 1) {
                                            setActiveRoundIndex(prev => prev + 1);
                                            commitAndBroadcastRound(rounds[activeRoundIndex + 1], 'commit');
                                        }
                                    }}
                                    disabled={activeRoundIndex === rounds.length - 1}
                                    className="p-2 rounded-xl disabled:opacity-30 cursor-pointer"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </div>

                            {/* CENTER: Subtle Rotating HUD Ticker */}
                            {isLive && (
                                <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4 overflow-hidden h-9">
                                    {/* Slide 0: STREAKS */}
                                    {hudIndex === 0 && (
                                        <div className="flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                            <Flame size={14} className="text-rose-500 animate-pulse shrink-0" />
                                            {streakList.length === 0 ? (
                                                <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                                                    {lang === 'sv' ? "Inga aktiva streaks än — svara rätt för att synas!" : "No active streaks yet — answer correctly to appear!"}
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-1.5 truncate">
                                                    {streakList.map(st => (
                                                        <span key={st.alias} className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[10px] font-black">
                                                            {st.alias} ({st.currentStreak} {t.in_a_row})
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Slide 1: TOP PODIUM */}
                                    {hudIndex === 1 && (
                                        <div className="flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                            <Trophy size={14} className="text-amber-500 shrink-0" />
                                            {leaderboard.length === 0 ? (
                                                <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                                                    {lang === 'sv' ? "Väntar på poäng..." : "Waiting for scores..."}
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-1.5 truncate text-[11px] font-bold">
                                                    {leaderboard.slice(0, 3).map((st, i) => (
                                                        <span key={st.alias} className="flex items-center gap-1">
                                                            <span className="text-amber-500 font-mono font-black">{i + 1}.</span>
                                                            <span className="truncate max-w-[80px]">{st.alias}</span>
                                                            <span className="opacity-60 font-mono">({st.score}p)</span>
                                                            {i < 2 && <span className="opacity-30">•</span>}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Slide 2: KLASSENS KRAFT */}
                                    {hudIndex === 2 && (
                                        <div className="flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                            <Zap size={14} className="text-amber-400 shrink-0" />
                                            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400">
                                                {t.class_energy_heading}:
                                            </span>
                                            <span className="text-xs font-mono font-black text-amber-400">
                                                {totalClassScore} {t.points_word} {lang === 'sv' ? "samlat" : "earned"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* RIGHT: Actions + Celebration Popover Button */}
                            <div className="flex items-center gap-3">
                                {isLive && (
                                    <button
                                        type="button"
                                        onClick={() => setIsResultsDrawerOpen(!isResultsDrawerOpen)}
                                        className="px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer hover:border-amber-400"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                    >
                                        <Award size={14} className="text-amber-500" />
                                        <span>{t.results_btn}</span>
                                    </button>
                                )}

                                {revealedPhase === 'commit' && (
                                    <button
                                        onClick={() => setPhaseAndBroadcast('distribution')}
                                        className="btn-brand px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                                    >
                                        <Eye size={16} /> {t.show_distribution}
                                    </button>
                                )}

                                {revealedPhase === 'distribution' && (
                                    <button
                                        onClick={() => setPhaseAndBroadcast('reveal')}
                                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
                                    >
                                        <CheckCircle2 size={16} /> {t.show_correct}
                                    </button>
                                )}

                                {revealedPhase === 'reveal' && (
                                    <button
                                        onClick={() => {
                                            if (activeRoundIndex < rounds.length - 1) {
                                                setActiveRoundIndex(prev => prev + 1);
                                                commitAndBroadcastRound(rounds[activeRoundIndex + 1], 'commit');
                                            }
                                        }}
                                        disabled={activeRoundIndex === rounds.length - 1}
                                        className="btn-brand px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50"
                                    >
                                        {t.next_round} <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </footer>
                    </div>
                )}
            </main>

            {/* 🟢 Post-Round / Mid-Game Celebration Drawer */}
            {isResultsDrawerOpen && (
                <div className="fixed inset-0 z-[600] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in">
                    <div 
                        className="w-full max-w-md rounded-3xl border shadow-2xl p-6 flex flex-col gap-4 overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                    >
                        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-main)' }}>
                            <div className="flex items-center gap-2">
                                <Trophy size={18} className="text-amber-500" />
                                <h3 className="text-sm font-black uppercase tracking-wider">{t.results_heading}</h3>
                            </div>
                            <button onClick={() => setIsResultsDrawerOpen(false)} className="p-1 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                            {/* Podium */}
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
                                    {t.podium_heading}
                                </span>
                                <div className="space-y-1.5">
                                    {leaderboard.length === 0 ? (
                                        <p className="text-xs italic py-2" style={{ color: 'var(--text-muted)' }}>Inga svar registrerade än.</p>
                                    ) : (
                                        leaderboard.map((st, i) => (
                                            <div 
                                                key={st.alias} 
                                                className="flex items-center justify-between p-2 rounded-xl border text-xs font-bold"
                                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[10px] ${
                                                        i === 0 ? 'bg-amber-500 text-slate-950' : i === 1 ? 'bg-slate-300 text-slate-950' : i === 2 ? 'bg-orange-600 text-white' : 'bg-black/10'
                                                    }`}>
                                                        {i + 1}
                                                    </span>
                                                    <span>{st.alias}</span>
                                                </div>
                                                <span className="font-mono text-amber-500">{st.score}p</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Streaks */}
                            {streakList.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
                                        {t.streak_heading}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {streakList.map(st => (
                                            <div 
                                                key={st.alias} 
                                                className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center gap-1.5 text-xs font-bold"
                                            >
                                                <Flame size={12} className="shrink-0" />
                                                <span>{st.alias}</span>
                                                <span className="font-mono font-black text-[10px]">({st.currentStreak} {t.in_a_row})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Class Energy */}
                            <div 
                                className="p-3 rounded-2xl border flex items-center justify-between"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                            >
                                <div className="flex items-center gap-2">
                                    <Zap size={16} className="text-amber-400" />
                                    <span className="text-xs font-black uppercase">{t.class_energy_heading}</span>
                                </div>
                                <span className="font-mono font-black text-amber-500">{totalClassScore} p</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AD-HOC / CUSTOM QUESTION MODAL */}
            {editingRound && (
                <div className="fixed inset-0 z-[600] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div 
                        className="w-full max-w-xl rounded-3xl shadow-2xl p-6 border flex flex-col gap-4"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                    >
                        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-main)' }}>
                            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                                <Edit3 size={16} className="text-indigo-500" /> 
                                {editingRound.source === 'custom' && !rounds.some(r => r.id === editingRound.id) 
                                    ? t.modal_new_title 
                                    : t.modal_edit_title}
                            </h3>
                            <button onClick={() => setEditingRound(null)} className="p-1 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-1">
                            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                {lang === 'sv' ? "Typ av fråga" : "Question Type"}
                            </span>
                            <button
                                type="button"
                                onClick={() => setEditingRound(prev => ({
                                    ...prev,
                                    wordProblem: !prev.wordProblem,
                                    showLatex: prev.wordProblem,
                                    renderData: {
                                        ...prev.renderData,
                                        isWordProblemApplied: !prev.wordProblem
                                    }
                                }))}
                                className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                                    editingRound.wordProblem 
                                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' 
                                        : 'border-slate-300 dark:border-slate-700'
                                }`}
                                style={!editingRound.wordProblem ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' } : {}}
                            >
                                {editingRound.wordProblem ? (lang === 'sv' ? "Textuppgift" : "Word Problem") : (lang === 'sv' ? "Formel / Tal" : "Formula / Math")}
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t.prompt_label}</label>
                            <textarea
                                value={editingRound.renderData.description || ''}
                                onChange={(e) => setEditingRound({
                                    ...editingRound,
                                    renderData: { ...editingRound.renderData, description: e.target.value }
                                })}
                                className="w-full mt-1 p-3 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                rows={2}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t.latex_label}</label>
                            <input
                                type="text"
                                value={editingRound.renderData.latex || ''}
                                onChange={(e) => setEditingRound({
                                    ...editingRound,
                                    renderData: { ...editingRound.renderData, latex: e.target.value }
                                })}
                                className="w-full mt-1 px-3 py-2 border rounded-xl text-xs font-mono font-bold text-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t.corners_label}</label>
                                <button
                                    onClick={() => {
                                        const fresh = generateDistractors({
                                            correctAnswer: editingRound.responseSpec.answer,
                                            topicId: editingRound.topicId,
                                            renderData: editingRound.renderData
                                        });
                                        setEditingRound({
                                            ...editingRound,
                                            renderData: { ...editingRound.renderData, options: fresh },
                                            responseSpec: { ...editingRound.responseSpec, options: fresh }
                                        });
                                    }}
                                    className="text-[10px] font-black text-indigo-500 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <Sparkles size={12} /> {t.reroll_distractors}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {editingRound.renderData.options?.map((opt, idx) => (
                                    <div 
                                        key={opt.id} 
                                        className="flex items-center gap-2 p-2 border rounded-xl"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = editingRound.renderData.options.map(o => ({
                                                    ...o,
                                                    isCorrect: o.id === opt.id
                                                }));
                                                setEditingRound({
                                                    ...editingRound,
                                                    renderData: { ...editingRound.renderData, options: updated, answer: opt.label },
                                                    responseSpec: { ...editingRound.responseSpec, options: updated, answer: opt.label }
                                                });
                                            }}
                                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center cursor-pointer ${
                                                opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}
                                            title="Mark as correct"
                                        >
                                            {opt.id}
                                        </button>
                                        <input
                                            type="text"
                                            value={opt.label}
                                            onChange={(e) => {
                                                const updated = [...editingRound.renderData.options];
                                                updated[idx] = { ...opt, label: e.target.value };
                                                setEditingRound({
                                                    ...editingRound,
                                                    renderData: { ...editingRound.renderData, options: updated },
                                                    responseSpec: {
                                                        ...editingRound.responseSpec,
                                                        options: updated,
                                                        answer: opt.isCorrect ? e.target.value : editingRound.responseSpec.answer
                                                    }
                                                });
                                            }}
                                            className="w-full bg-transparent text-xs font-bold outline-none"
                                            style={{ color: 'var(--text-main)' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-main)' }}>
                            <button
                                onClick={() => setEditingRound(null)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={() => {
                                    const exists = rounds.some(r => r.id === editingRound.id);
                                    if (exists) {
                                        commitAndBroadcastRound(editingRound, revealedPhase);
                                    } else {
                                        setRounds(prev => [...prev, editingRound]);
                                    }
                                    setEditingRound(null);
                                }}
                                className="btn-brand flex-1 py-2.5 text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                            >
                                {t.save_update}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isSummonerOpen && (
                <QuestionSummoner
                    lang={lang}
                    targetMode="activity_four_corners"
                    onClose={() => setIsSummonerOpen(false)}
                    onSummon={(summoned) => {
                        const newRounds = summoned.map((item, idx) => 
                            formatToCornerRound(item, rounds.length + idx + 1)
                        );
                        setRounds(prev => [...prev, ...newRounds]);
                        setIsSummonerOpen(false);
                    }}
                />
            )}
        </div>
    );
}