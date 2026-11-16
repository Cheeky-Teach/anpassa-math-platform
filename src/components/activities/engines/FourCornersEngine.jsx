// src/components/activities/engines/FourCornersEngine.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, RefreshCcw, Sparkles, Edit3, Trash2, Plus, Pause,
    ArrowLeft, ArrowRight, Eye, CheckCircle2, Users, Save,
    ChevronRight, X, Loader2, Type, Calculator, Lightbulb, ChevronDown, ChevronUp,
    Monitor, Lock, Building2, Timer, Flame, Trophy, Zap, Award
} from 'lucide-react';
import QuestionSummoner from '../../views/QuestionSummoner';
import VisualRenderer from '../../visuals/VisualRenderer';
import PreferencesToggle from '../../ui/PreferencesToggle';
import MathDisplay from '../../shared/MathDisplay';
import { generateDistractors, normalizeQuestionOptions } from '../../../lib/distractorGenerator';
import { extractDecodedAnswer } from '../../live/core/liveAnswerUtils.js';
import { universalRegenerateQuestion, universalRegenerateAll, saveActivityToLibrary } from '../../live/core/activityQuestionUtils.js';
import { useActivityEngineSession } from '../hooks/useActivityEngineSession.js';

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
            review_list: "Avbryt",
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
            start_timer: "Starta",
            pause_timer: "Pausa",
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
            review_list: "End activity",
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
            start_timer: "Start",
            pause_timer: "Pause",
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

        const rawOptions = rd.options || raw.options || resolved.options;

        let options = [];
        if (Array.isArray(rawOptions) && rawOptions.length === 4) {
            options = normalizeQuestionOptions(rawOptions, correctAnswer);
        } else {
            options = generateDistractors({
                correctAnswer,
                topicId: raw.topicId || resolved.topicId || rd.topicId || '',
                renderData: { ...rd, options: null },
                resolvedData: resolved,
                raw
            });
        }
        const correctOpt = options.find(o => o.isCorrect || String(o.label) === String(correctAnswer));
        const correctCornerId = correctOpt ? correctOpt.id : 'A';

        return {
            id: raw.id || crypto.randomUUID(),
            roundIndex: roundNumber - 1,
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
                answer: correctCornerId,
                rawAnswerValue: correctAnswer,
                isWordProblemApplied: isWp 
            },
            responseSpec: { 
                type: 'single_choice', 
                answer: correctCornerId,
                options 
            }
        };
    };

    const initialExtractedQuestions = useMemo(() => {
        let aqd = session?.active_question_data;
        if (typeof aqd === 'string') {
            try { aqd = JSON.parse(aqd); } catch (e) { aqd = {}; }
        }

        const raw = 
            aqd?.packet ||
            aqd?.livePacket ||
            aqd?.board?.tiles ||
            sourcePacket ||
            initialConfig?.initialQuestions ||
            initialConfig?.sourcePacket ||
            session?.packet ||
            [];

        return Array.isArray(raw) ? raw : (typeof raw === 'object' && raw !== null ? Object.values(raw) : []);
    }, [session, sourcePacket, initialConfig]);

    const initialFormattedRounds = useMemo(() => {
        if (!initialExtractedQuestions.length) return [];
        return initialExtractedQuestions.map((q, idx) => formatToCornerRound(q, idx + 1));
    }, [initialExtractedQuestions]);

    const [viewMode, setViewMode] = useState(() => {
        if (session?.active_question_data?.activeTile || session?.active_question_data?.roundIndex !== undefined) {
            return 'play';
        }
        return 'curate';
    });

    const [rounds, setRounds] = useState(initialFormattedRounds);

    // Unified single mount/sync effect
    useEffect(() => {
        if (initialFormattedRounds.length > 0 && rounds.length === 0) {
            setRounds(initialFormattedRounds);
            if (session?.active_question_data?.activeTile) {
                setViewMode('play');
            }
        }
    }, [initialFormattedRounds, session]);

    const [activeRoundIndex, setActiveRoundIndex] = useState(() => {
        const saved = session?.active_question_data?.roundIndex;
        return (saved !== undefined && !isNaN(Number(saved))) ? Number(saved) : 0;
    });

    const [revealedPhase, setRevealedPhase] = useState(() => {
        return session?.active_question_data?.revealedPhase || 'commit';
    });

    const defaultTitle = initialConfig?.title || sourcePacket?.title || (lang === 'sv' ? "4 Hörn Aktivitet" : "4 Corners Activity");
    const [activityTitle, setActivityTitle] = useState(defaultTitle);
    const [sheetId, setSheetId] = useState(initialConfig?.sheetId || sourcePacket?.id || null);
    const [visibility, setVisibility] = useState(sourcePacket?.visibility || initialConfig?.savedSheet?.visibility || 'private');

    const defaultDuration = initialConfig?.settings?.timerSeconds !== undefined ? initialConfig.settings.timerSeconds : 0;
    const [timerDuration, setTimerDuration] = useState(defaultDuration);
    const [timeLeft, setTimeLeft] = useState(defaultDuration);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const [showClues, setShowClues] = useState(false);
    const [revealedClueIndex, setRevealedClueIndex] = useState(0);

    const [isSummonerOpen, setIsSummonerOpen] = useState(false);
    const [editingRound, setEditingRound] = useState(null);
    const [isReRolling, setIsReRolling] = useState(false);
    const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isResultsDrawerOpen, setIsResultsDrawerOpen] = useState(false);
    const [hudIndex, setHudIndex] = useState(0);

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
        getPacket: () => (rounds.length > 0 ? rounds : initialFormattedRounds),
        getSettings: () => ({ questionCount: (rounds.length || initialFormattedRounds.length), timerSeconds: timerDuration }),
        getInitialBroadcastData: () => ({
            activeTile: null,
            activeQuestion: (rounds[0] || initialFormattedRounds[0] || null),
            revealedPhase: 'commit',
            roundIndex: 0
        })
    });

    const CORNER_STYLES = {
        A: { bg: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-900 dark:text-indigo-100', pill: 'bg-indigo-600 text-white', bar: 'bg-indigo-500' },
        B: { bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-100', pill: 'bg-emerald-600 text-white', bar: 'bg-emerald-500' },
        C: { bg: 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-100', pill: 'bg-amber-600 text-white', bar: 'bg-amber-500' },
        D: { bg: 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-100', pill: 'bg-rose-600 text-white', bar: 'bg-rose-500' }
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

    const currentRound = rounds[activeRoundIndex] || null;

    useEffect(() => {
        setShowClues(false);
        setRevealedClueIndex(0);
        setTimeLeft(timerDuration);
        setIsTimerRunning(false);
    }, [activeRoundIndex, currentRound?.id]);

    useEffect(() => {
        if (!isTimerRunning || timerDuration === 0 || revealedPhase !== 'commit') return;
        if (timeLeft <= 0) {
            setIsTimerRunning(false);
            setPhaseAndBroadcast('distribution');
            return;
        }
        const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft, timerDuration, revealedPhase]);

    useEffect(() => {
        if (viewMode !== 'play') return;
        const interval = setInterval(() => setHudIndex(prev => (prev + 1) % 3), 4500);
        return () => clearInterval(interval);
    }, [viewMode]);

    const liveVotes = useMemo(() => {
        const tallies = { A: 0, B: 0, C: 0, D: 0 };
        if (!currentRound) return tallies;

        const currentOptions = currentRound.renderData?.options || [];
        liveResponses
            .filter(r => r.question_index === currentRound.roundIndex || r.question_index === activeRoundIndex)
            .forEach(r => {
                let choice = String(r.answer || '').trim().toUpperCase();
                if (!tallies[choice]) {
                    const matchedOpt = currentOptions.find(o => String(o.label).trim() === String(r.answer).trim());
                    if (matchedOpt) choice = matchedOpt.id;
                }
                if (tallies[choice] !== undefined) tallies[choice]++;
            });
        return tallies;
    }, [liveResponses, currentRound, activeRoundIndex]);

    const totalVotesSubmitted = useMemo(() => liveVotes.A + liveVotes.B + liveVotes.C + liveVotes.D, [liveVotes]);

    const studentScoresRef = useRef({});
    const { leaderboard, studentScoresMap, streakList, totalClassScore } = useMemo(() => {
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

        Object.entries(studentHistory).forEach(([alias, history]) => {
            let runningStreak = 0;
            let total = 0;

            history.forEach(ans => {
                const roundTarget = rounds.find(r => r.roundIndex === ans.question_index) || rounds[ans.question_index];
                const expectedAnswer = roundTarget?.responseSpec?.answer || roundTarget?.renderData?.answer;
                const isCorrect = ans.is_correct || (expectedAnswer && String(ans.answer).trim().toUpperCase() === String(expectedAnswer).trim().toUpperCase());

                if (isCorrect) {
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
        const studentScoresMap = {};
        sorted.forEach((s, idx) => {
            studentScoresMap[s.alias] = { score: s.score, streak: s.currentStreak, rank: idx + 1 };
        });

        const activeStreaks = sorted.filter(s => s.currentStreak >= 2).sort((a, b) => b.currentStreak - a.currentStreak).slice(0, 4);
        const cumulativePoints = sorted.reduce((sum, s) => sum + s.score, 0);

        return { leaderboard: topPodium, studentScoresMap, streakList: activeStreaks, totalClassScore: cumulativePoints };
    }, [liveResponses, rounds]);

    const activeClues = useMemo(() => {
        const raw = currentRound?.renderData?.clues || currentRound?.renderData?.hints || currentRound?.resolvedData?.clues || currentRound?.renderData?.solutionSteps || [];
        return Array.isArray(raw) ? raw : (typeof raw === 'string' ? [raw] : []);
    }, [currentRound]);

    const broadcastRoomState = async (updatedRound, phase = 'commit', updatedScores = studentScoresRef.current) => {
        if (!isLive) return;
        await broadcastState({
            mode: 'activity_four_corners',
            gameKey: 'four_corners',
            activity_mode: 'activity_four_corners',
            activeTile: updatedRound ? `round_${activeRoundIndex}` : null,
            activeQuestion: updatedRound,
            revealedPhase: phase,
            roundIndex: activeRoundIndex,
            timerSeconds: timerDuration,
            studentScores: updatedScores,
            packet: rounds,
            livePacket: rounds,
            updated_at: new Date().toISOString()
        });
    };

    useEffect(() => {
        studentScoresRef.current = studentScoresMap;
        if (!isLive || viewMode !== 'play') return;
        broadcastRoomState(currentRound, revealedPhase, studentScoresMap);
    }, [studentScoresMap]);

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
        const effectiveTopicId = round.topicId !== 'imported' && round.topicId !== 'custom' ? round.topicId : (round.resolvedData?.topicId || round.renderData?.topicId || null);
        if (!effectiveTopicId || effectiveTopicId === 'custom') {
            handleRerollDistractors(round.id);
            return;
        }
        setIsReRolling(true);
        try {
            const freshRound = await universalRegenerateQuestion({
                roomId,
                questionIndex: round.roundIndex,
                topicId: effectiveTopicId,
                variationKey: round.variationKey || round.resolvedData?.variationKey || null,
                wordProblem: round.wordProblem,
                lang,
                formatFn: formatToCornerRound
            });
            if (freshRound) {
                const updated = { ...freshRound, id: round.id, name: round.name, topicId: effectiveTopicId };
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
                roomId,
                lang,
                formatFn: formatToCornerRound,
                onCustomFallback: handleRerollDistractors
            });
            setRounds(refreshed);
        } finally {
            setIsRegeneratingAll(false);
        }
    };

    const isCurrentWordProblem = Boolean(currentRound?.wordProblem || currentRound?.renderData?.isWordProblemApplied || currentRound?.resolvedData?.metadata?.isWordProblemApplied);
    const effectiveShowLatex = currentRound?.showLatex !== undefined ? Boolean(currentRound?.showLatex) : (!isCurrentWordProblem);
    const effectiveShowVisual = currentRound?.showVisual !== false;

    const timerProgress = timerDuration > 0 ? Math.min(100, Math.max(0, (timeLeft / timerDuration) * 100)) : 0;
    const isUrgent = isTimerRunning && timeLeft <= 10 && timeLeft > 0;
    const isCritical = isTimerRunning && timeLeft <= 5 && timeLeft > 0;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex flex-col overflow-hidden select-none font-sans transition-colors duration-200"
            style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-main)' }}
        >
            {/* Top Bar Header */}
            <header className="px-6 py-3 flex items-center justify-between shrink-0 z-20 shadow-xs border-b transition-colors bg-[var(--bg-card)] border-[var(--border-main)]">
                {/* LEFT: Title & Save */}
                <div className="flex items-center gap-3">
                    <span className="badge-brand font-black text-xs px-2.5 py-1 shrink-0">
                        {t.title}
                    </span>

                    <div className="flex items-center rounded-xl border px-2.5 py-1 shadow-xs transition-all focus-within:ring-2 focus-within:ring-indigo-500/40 bg-[var(--bg-surface)] border-[var(--border-strong)]">
                        <Edit3 size={13} className="mr-2 shrink-0 opacity-40" />
                        <input
                            type="text"
                            value={activityTitle}
                            onChange={(e) => setActivityTitle(e.target.value)}
                            placeholder={t.name_placeholder}
                            className="text-xs sm:text-sm font-bold tracking-tight outline-none bg-transparent w-40 sm:w-56 text-[var(--text-main)]"
                        />
                        {rounds.length > 0 && (
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
                        <div className="flex items-center gap-0.5 p-1 rounded-xl border shadow-xs bg-[var(--bg-surface)] border-[var(--border-main)]">
                            <button
                                type="button"
                                onClick={() => setVisibility('private')}
                                className={`p-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${visibility === 'private' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-60 hover:opacity-100'}`}
                                title={t.private_tooltip}
                            >
                                <Lock size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisibility('school')}
                                className={`p-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${visibility === 'school' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-60 hover:opacity-100'}`}
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
                            <div className="flex items-center rounded-xl border px-2.5 py-1.5 gap-2 shadow-xs transition-colors bg-[var(--bg-surface)] border-[var(--border-main)]">
                                <Timer size={15} className={isTimerRunning ? "text-amber-500 animate-spin" : "opacity-40"} />
                                <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                                    Timer:
                                </span>
                                <select
                                    value={timerDuration}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        setTimerDuration(val);
                                        setTimeLeft(val);
                                        setIsTimerRunning(false);
                                    }}
                                    className="bg-transparent text-xs font-black outline-none cursor-pointer text-[var(--text-main)]"
                                >
                                    <option value={0} className="bg-[var(--bg-card)] text-[var(--text-main)]">{t.timer_off}</option>
                                    <option value={15} className="bg-[var(--bg-card)] text-[var(--text-main)]">15s</option>
                                    <option value={30} className="bg-[var(--bg-card)] text-[var(--text-main)]">30s</option>
                                    <option value={45} className="bg-[var(--bg-card)] text-[var(--text-main)]">45s</option>
                                    <option value={60} className="bg-[var(--bg-card)] text-[var(--text-main)]">60s</option>
                                    <option value={90} className="bg-[var(--bg-card)] text-[var(--text-main)]">90s</option>
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
                                        effectiveShowLatex ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'border-[var(--border-main)]'
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
                                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer hover:border-amber-400 bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-main)]"
                            >
                                <RefreshCcw size={14} className={isReRolling ? "animate-spin text-amber-500" : ""} /> {t.reroll_numbers}
                            </button>

                            <button
                                onClick={() => setEditingRound(currentRound)}
                                className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer hover:border-indigo-400 bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-main)]"
                            >
                                <Edit3 size={14} /> {t.quick_edit}
                            </button>

                            <button
                                onClick={() => setViewMode('curate')}
                                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-muted)]"
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
                                <span className="text-xl sm:text-2xl font-mono font-black tracking-widest leading-tight text-[var(--text-main)]">
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
                        className="p-2 rounded-xl transition-colors cursor-pointer hover:bg-rose-500 hover:text-white bg-[var(--bg-surface)] text-[var(--text-muted)]"
                        title={t.cancel}
                    >
                        <X size={18} />
                    </button>
                </div>
            </header>

            {/* Main Stage Viewport */}
            <main className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {viewMode === 'curate' ? (
                        <motion.div 
                            key="curate"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="h-full overflow-y-auto p-8 max-w-5xl mx-auto space-y-4 custom-scrollbar"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-black">{t.playlist_structure}</h2>
                                    <p className="text-xs font-medium text-[var(--text-muted)]">{t.playlist_sub}</p>
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
                                        className="px-4 py-2 border rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-main)]"
                                    >
                                        <Plus size={16} /> {t.create_custom}
                                    </button>
                                    {rounds.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleRegenerateAll}
                                            disabled={isRegeneratingAll}
                                            className="px-3.5 py-2 border rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:border-amber-400 hover:text-amber-500 bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-main)]"
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
                                <div className="border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center bg-[var(--bg-card)] border-[var(--border-main)]">
                                    <Sparkles size={36} className="text-indigo-400 mb-3" />
                                    <h3 className="text-base font-black mb-1">{t.empty_playlist}</h3>
                                    <p className="text-xs max-w-sm mb-4 text-[var(--text-muted)]">{t.empty_sub}</p>
                                </div>
                            ) : (
                                rounds.map((round, idx) => {
                                    const rd = round.renderData || {};
                                    const hasVisual = Boolean(rd.geometry || rd.graph || rd.pattern || rd.marbles || rd.diagram);

                                    return (
                                        <div key={round.id} className="card border rounded-3xl p-6 shadow-sm transition-all bg-[var(--bg-card)] border-[var(--border-main)]">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-9 h-9 rounded-2xl font-black text-xs flex items-center justify-center border shrink-0 bg-[var(--bg-surface)] border-[var(--border-main)]">
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
                                                        className="p-2 border rounded-xl cursor-pointer transition-colors hover:text-indigo-500 bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-muted)]"
                                                        title={t.reroll_distractors}
                                                    >
                                                        <Sparkles size={15} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRegenerateQuestion(round)} 
                                                        className="p-2 border rounded-xl cursor-pointer transition-colors hover:text-amber-500 bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-muted)]"
                                                        title={t.reroll_numbers}
                                                    >
                                                        <RefreshCcw size={15} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingRound(round)} 
                                                        className="p-2 border rounded-xl cursor-pointer transition-colors hover:text-indigo-500 bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-muted)]"
                                                        title={t.quick_edit}
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setRounds(prev => prev.filter(r => r.id !== round.id))} 
                                                        className="p-2 border rounded-xl cursor-pointer transition-colors hover:text-rose-500 bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-muted)]"
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
                                                <div className="whiteboard-protect w-full flex justify-center py-4 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-3 shadow-xs bg-[var(--bg-surface)]">
                                                    <VisualRenderer data={rd} isWordProblem={round.wordProblem} />
                                                </div>
                                            )}

                                            {rd.latex && round.showLatex !== false && (
                                                <div className="w-full border rounded-2xl p-4 text-center text-2xl font-serif font-bold mb-4 shadow-inner bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--brand-solid)]">
                                                    <MathDisplay content={`$$${rd.latex}$$`} />
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[var(--border-main)]">
                                                {round.renderData.options?.map((opt) => (
                                                    <div 
                                                        key={opt.id} 
                                                        className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                                                            opt.isCorrect ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 font-bold' : 'border-[var(--border-main)] bg-[var(--bg-surface)]'
                                                        }`}
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
                        </motion.div>
                    ) : (
                        /* PLAY MODE: Projector Stage */
                        <motion.div 
                            key="play"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="h-full flex flex-col p-6 max-w-7xl mx-auto gap-4"
                        >
                            {currentRound && (
                                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                                    {/* Left Prompt & Visual Card */}
                                    <div className="lg:col-span-7 border-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl overflow-y-auto custom-scrollbar relative bg-[var(--bg-card)] border-[var(--border-main)]">
                                        {timerDuration > 0 && (
                                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-200 dark:bg-slate-800 border-t border-slate-300/80 dark:border-slate-700/80 overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ease-linear ${
                                                        isCritical ? 'bg-rose-500 shadow-sm shadow-rose-500' : isUrgent ? 'bg-amber-500 shadow-sm shadow-amber-500' : 'bg-indigo-600 dark:bg-indigo-400'
                                                    }`}
                                                    style={{ width: `${timerProgress}%` }}
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="badge-brand font-black text-xs px-3 py-1">
                                                    {t.round} {activeRoundIndex + 1}
                                                </span>

                                                <div className="flex items-center gap-2">
                                                    {timerDuration > 0 && (
                                                        <div className={`flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                                                            isCritical ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/50 dark:border-rose-400 dark:text-rose-300 animate-pulse ring-2 ring-rose-500/40' : 
                                                            isUrgent ? 'bg-amber-50 border-amber-500 text-amber-800 dark:bg-amber-950/50 dark:border-amber-400 dark:text-amber-300 ring-2 ring-amber-500/30' : 
                                                            isTimerRunning ? 'bg-indigo-50 border-indigo-600 text-indigo-900 dark:bg-indigo-950/60 dark:border-indigo-400 dark:text-indigo-200' : 
                                                            'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-main)]'
                                                        }`}>
                                                            <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                                                                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                                                                    <path className="text-slate-300 dark:text-slate-700" stroke="currentColor" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                                    <path className={isCritical ? 'text-rose-600' : isUrgent ? 'text-amber-500' : 'text-indigo-600'} stroke="currentColor" strokeWidth="3.5" strokeDasharray={`${timerProgress}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                                </svg>
                                                                <Timer size={14} className={`absolute ${isTimerRunning ? 'text-indigo-600 dark:text-indigo-300 animate-pulse' : 'text-slate-500'}`} />
                                                            </div>
                                                            <div className="flex items-baseline font-mono font-black tracking-tight leading-none min-w-[2.5rem]">
                                                                <span className="text-lg sm:text-xl">{timeLeft}</span>
                                                                <span className="text-xs ml-0.5 opacity-75 font-sans font-bold">s</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 border-l border-slate-300 dark:border-slate-700 pl-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                                                                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 ${
                                                                        isTimerRunning ? 'bg-amber-500 text-slate-950 font-black' : 'bg-indigo-600 text-white'
                                                                    }`}
                                                                >
                                                                    {isTimerRunning ? <Pause size={13} className="fill-current" /> : <Play size={13} className="fill-current translate-x-0.5" />}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setTimeLeft(prev => prev + 10)}
                                                                    className="h-8 px-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center border transition-all cursor-pointer active:scale-95 bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-main)] shadow-xs"
                                                                >
                                                                    {t.add_10s}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {activeClues.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowClues(!showClues)}
                                                            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                                                                showClues ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-md' : 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-main)]'
                                                            }`}
                                                        >
                                                            <Lightbulb size={14} className={showClues ? "text-slate-900" : "text-amber-500"} />
                                                            <span>{showClues ? t.hide_clues : `${t.clues} (${activeClues.length})`}</span>
                                                            {showClues ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        </button>
                                                    )}

                                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border bg-[var(--bg-surface)] border-[var(--border-main)]">
                                                        <Users size={14} className="text-indigo-500" />
                                                        <span>{totalVotesSubmitted} {t.votes_submitted}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-xl sm:text-2xl font-bold leading-relaxed">
                                                <MathDisplay content={currentRound.renderData.description} />
                                            </div>

                                            {showClues && activeClues.length > 0 && (
                                                <div className="p-4 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 space-y-3">
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
                                                                            revealedClueIndex === i ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-black/10 text-slate-600 dark:text-slate-300'
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
                                                <div className="whiteboard-protect w-full flex justify-center py-4 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm my-2 bg-[var(--bg-surface)]">
                                                    <VisualRenderer data={currentRound.renderData} isWordProblem={isCurrentWordProblem} />
                                                </div>
                                            )}

                                            {effectiveShowLatex && currentRound.renderData.latex && (
                                                <div className="text-3xl sm:text-4xl font-serif font-black p-6 rounded-2xl border text-center my-3 shadow-inner bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--brand-solid)]">
                                                    <MathDisplay content={`$$${currentRound.renderData.latex}$$`} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right 4-Corner Quadrants */}
                                    <div className="lg:col-span-5 grid grid-cols-2 grid-rows-2 gap-4 h-full">
                                        {(currentRound.renderData.options || []).map((opt) => {
                                            const quadId = opt.id;
                                            const style = CORNER_STYLES[quadId];
                                            const votes = liveVotes[quadId] || 0;
                                            const pct = totalVotesSubmitted > 0 ? Math.round((votes / totalVotesSubmitted) * 100) : 0;
                                            const isWinner = revealedPhase === 'reveal' && opt?.isCorrect;
                                            const isDimmed = revealedPhase === 'reveal' && !opt?.isCorrect;

                                            return (
                                                <div 
                                                    key={quadId}
                                                    className={`rounded-3xl border-2 p-5 flex flex-col justify-between transition-all duration-300 ${
                                                        isWinner ? 'bg-emerald-600 border-emerald-400 text-white shadow-2xl scale-[1.02] ring-4 ring-emerald-400/40' : 
                                                        isDimmed ? 'opacity-30 grayscale border-slate-300 dark:border-slate-800' : 
                                                        style.bg
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
                            )}

                            {/* Footer Footer Controls */}
                            <footer className="h-16 border rounded-2xl px-6 flex items-center justify-between shrink-0 shadow-xs z-30 bg-[var(--bg-card)] border-[var(--border-main)]">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            if (activeRoundIndex > 0) {
                                                setActiveRoundIndex(prev => prev - 1);
                                                commitAndBroadcastRound(rounds[activeRoundIndex - 1], 'commit');
                                            }
                                        }}
                                        disabled={activeRoundIndex === 0}
                                        className="p-2 rounded-xl disabled:opacity-30 cursor-pointer text-[var(--text-muted)]"
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
                                        className="p-2 rounded-xl disabled:opacity-30 cursor-pointer text-[var(--text-muted)]"
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                </div>

                                {isLive && (
                                    <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4 overflow-hidden h-9">
                                        {hudIndex === 0 && (
                                            <div className="flex items-center gap-2">
                                                <Flame size={14} className="text-rose-500 animate-pulse shrink-0" />
                                                {streakList.length === 0 ? (
                                                    <span className="text-[11px] font-bold text-[var(--text-muted)]">
                                                        {lang === 'sv' ? "Inga aktiva streaks än — svara rätt för att synas!" : "No active streaks yet!"}
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
                                        {hudIndex === 1 && (
                                            <div className="flex items-center gap-2">
                                                <Trophy size={14} className="text-amber-500 shrink-0" />
                                                {leaderboard.length === 0 ? (
                                                    <span className="text-[11px] font-bold text-[var(--text-muted)]">{lang === 'sv' ? "Väntar på poäng..." : "Waiting for scores..."}</span>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 truncate text-[11px] font-bold">
                                                        {leaderboard.slice(0, 3).map((st, i) => (
                                                            <span key={st.alias} className="flex items-center gap-1">
                                                                <span className="text-amber-500 font-mono font-black">{i + 1}.</span>
                                                                <span className="truncate max-w-[80px]">{st.alias}</span>
                                                                <span className="opacity-60 font-mono">({st.score}p)</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {hudIndex === 2 && (
                                            <div className="flex items-center gap-2">
                                                <Zap size={14} className="text-amber-400 shrink-0" />
                                                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400">{t.class_energy_heading}:</span>
                                                <span className="text-xs font-mono font-black text-amber-400">{totalClassScore} {t.points_word}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    {isLive && (
                                        <button
                                            type="button"
                                            onClick={() => setIsResultsDrawerOpen(!isResultsDrawerOpen)}
                                            className="px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer hover:border-amber-400 bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-main)]"
                                        >
                                            <Award size={14} className="text-amber-500" />
                                            <span>{t.results_btn}</span>
                                        </button>
                                    )}

                                    {revealedPhase === 'commit' && (
                                        <button onClick={() => setPhaseAndBroadcast('distribution')} className="btn-brand px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-md cursor-pointer">
                                            <Eye size={16} /> {t.show_distribution}
                                        </button>
                                    )}
                                    {revealedPhase === 'distribution' && (
                                        <button onClick={() => setPhaseAndBroadcast('reveal')} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all">
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Results Drawer Modal */}
            <AnimatePresence>
                {isResultsDrawerOpen && (
                    <div className="fixed inset-0 z-[600] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md rounded-3xl border shadow-2xl p-6 flex flex-col gap-4 overflow-hidden bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-main)]"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
                                <div className="flex items-center gap-2">
                                    <Trophy size={18} className="text-amber-500" />
                                    <h3 className="text-sm font-black uppercase tracking-wider">{t.results_heading}</h3>
                                </div>
                                <button onClick={() => setIsResultsDrawerOpen(false)} className="p-1 cursor-pointer text-[var(--text-muted)]">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider block mb-2 text-[var(--text-muted)]">{t.podium_heading}</span>
                                    <div className="space-y-1.5">
                                        {leaderboard.length === 0 ? (
                                            <p className="text-xs italic py-2 text-[var(--text-muted)]">Inga svar registrerade än.</p>
                                        ) : (
                                            leaderboard.map((st, i) => (
                                                <div key={st.alias} className="flex items-center justify-between p-2 rounded-xl border text-xs font-bold bg-[var(--bg-surface)] border-[var(--border-main)]">
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
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit / Custom Question Modal */}
            <AnimatePresence>
                {editingRound && (
                    <div className="fixed inset-0 z-[600] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-xl rounded-3xl shadow-2xl p-6 border flex flex-col gap-4 bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-main)]"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
                                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                                    <Edit3 size={16} className="text-indigo-500" /> 
                                    {editingRound.source === 'custom' && !rounds.some(r => r.id === editingRound.id) ? t.modal_new_title : t.modal_edit_title}
                                </h3>
                                <button onClick={() => setEditingRound(null)} className="p-1 cursor-pointer text-[var(--text-muted)]">
                                    <X size={20} />
                                </button>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">{t.prompt_label}</label>
                                <textarea
                                    value={editingRound.renderData.description || ''}
                                    onChange={(e) => setEditingRound({
                                        ...editingRound,
                                        renderData: { ...editingRound.renderData, description: e.target.value }
                                    })}
                                    className="w-full mt-1 p-3 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-main)]"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">{t.latex_label}</label>
                                <input
                                    type="text"
                                    value={editingRound.renderData.latex || ''}
                                    onChange={(e) => setEditingRound({
                                        ...editingRound,
                                        renderData: { ...editingRound.renderData, latex: e.target.value }
                                    })}
                                    className="w-full mt-1 px-3 py-2 border rounded-xl text-xs font-mono font-bold text-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--bg-surface)] border-[var(--border-main)]"
                                />
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-[var(--border-main)]">
                                <button
                                    onClick={() => setEditingRound(null)}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-[var(--bg-surface)] text-[var(--text-muted)]"
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
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
        </motion.div>
    );
}