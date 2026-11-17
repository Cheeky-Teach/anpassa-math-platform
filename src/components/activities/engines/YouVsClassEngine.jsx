// src/components/activities/engines/YouVsClassEngine.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, RefreshCcw, Edit3, Users, Save, ListFilter,
    ChevronRight, X, Loader2, Monitor, Plus, HelpCircle,
    Timer, Trophy, Crown, Eye, Repeat, Shuffle, Lock, Zap,
    CheckCircle2, ShieldAlert, Award, FastForward, EyeOff
} from 'lucide-react';
import VisualRenderer from '../../visuals/VisualRenderer';
import PreferencesToggle from '../../ui/PreferencesToggle';
import { SKILL_BUCKETS } from '../../../constants/skillBuckets';
import { generateDistractors } from '../../../lib/distractorGenerator';
import { extractDecodedAnswer, evaluateAnswer } from '../../live/core/liveAnswerUtils.js';
import { universalRegenerateQuestion, saveActivityToLibrary } from '../../live/core/activityQuestionUtils.js';
import { useActivityEngineSession } from '../hooks/useActivityEngineSession.js';
import YouVsClassHelpModal from '../shared/YouVsClassHelpModal';

// Sanitizes mixed Swedish/English prose containing un-delimited LaTeX commands
const formatMixedMathText = (rawText) => {
    const str = String(rawText || '').trim();
    if (!str) return '';
    if (str.includes('$')) return str;

    const hasProseWords = /\b[a-zA-ZåäöÅÄÖ]{3,}\b/.test(str.replace(/\\[a-zA-Z]+/g, ''));
    const hasLatexTokens = /\\(frac|sqrt|cdot|times|pi|div|pm|leq|geq|neq)|[\^_]{1}[{0-9a-zA-Z]/.test(str);

    if (!hasProseWords && hasLatexTokens) {
        return `$${str}$`;
    }

    return str.replace(
        /(\\(?:frac|sqrt)\{[^{}]*\}(?:\{[^{}]*\})?|\\(?:cdot|times|pi|div|pm)|[0-9a-zA-Z]+\^\{?[0-9a-zA-Z+-]+\}?)/g,
        (match) => `$${match}$`
    );
};

const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    const formattedContent = formatMixedMathText(content);

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

// Bulletproof multi-format answer evaluator for Multiple Choice & Keypad rounds
const checkRoundAnswer = (submittedAnswer, roundObj) => {
    if (submittedAnswer === undefined || submittedAnswer === null || !roundObj) return false;
    const rawSub = String(submittedAnswer).trim();
    if (!rawSub || rawSub.startsWith('[')) return false;

    const rd = roundObj.renderData || {};
    const specAns = roundObj.responseSpec?.answer;
    const rdAns = rd.answer;
    const rawVal = rd.rawAnswerValue;

    if (Array.isArray(rd.options) && rd.options.length > 0) {
        const correctOpt = rd.options.find(
            o => o.isCorrect ||
                 (specAns && String(o.id).toUpperCase() === String(specAns).trim().toUpperCase()) ||
                 (rdAns && String(o.id).toUpperCase() === String(rdAns).trim().toUpperCase())
        );
        if (correctOpt) {
            if (rawSub.toUpperCase() === String(correctOpt.id).trim().toUpperCase()) return true;
            if (evaluateAnswer(rawSub, String(correctOpt.label))) return true;
        }
    }

    const candidates = [specAns, rdAns, rawVal]
        .filter(v => v !== undefined && v !== null && typeof v !== 'object')
        .map(v => String(v).trim());

    for (const candidate of candidates) {
        if (!candidate) continue;
        if (rawSub.toLowerCase().replace(/\s+/g, '').replace(',', '.') ===
            candidate.toLowerCase().replace(/\s+/g, '').replace(',', '.')) {
            return true;
        }
        if (evaluateAnswer(rawSub, candidate)) return true;
    }

    return false;
};

// Studio confetti & spotlight burst when Challenger wins or Game Over Podium launches
const StudioCelebrationOverlay = ({ active }) => {
    const particles = useMemo(() => {
        const colors = ['#10b981', '#f59e0b', '#38bdf8', '#f43f5e', '#a855f7'];
        return Array.from({ length: 34 }, (_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 900,
            y: -120 - Math.random() * 260,
            fallY: 500 + Math.random() * 350,
            rotate: Math.random() * 720 - 360,
            scale: 0.6 + Math.random() * 0.7,
            color: colors[i % colors.length],
            delay: Math.random() * 0.25,
            isCircle: i % 3 === 0
        }));
    }, []);

    return (
        <AnimatePresence>
            {active && (
                <div className="fixed inset-0 pointer-events-none z-[540] overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, rotate: -25 }}
                        animate={{ opacity: [0, 0.35, 0.2, 0], rotate: [-25, 15, -10] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.6, ease: 'easeInOut' }}
                        className="absolute -top-32 left-1/4 w-72 h-[140vh] bg-gradient-to-b from-amber-300/40 via-emerald-400/10 to-transparent blur-2xl origin-top"
                    />
                    <motion.div
                        initial={{ opacity: 0, rotate: 25 }}
                        animate={{ opacity: [0, 0.35, 0.2, 0], rotate: [25, -15, 10] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.6, ease: 'easeInOut' }}
                        className="absolute -top-32 right-1/4 w-72 h-[140vh] bg-gradient-to-b from-emerald-300/40 via-amber-400/10 to-transparent blur-2xl origin-top"
                    />

                    <div className="absolute top-24 left-1/2 -translate-x-1/2">
                        {particles.map(p => (
                            <motion.div
                                key={p.id}
                                initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
                                animate={{
                                    x: p.x,
                                    y: [0, p.y, p.fallY],
                                    opacity: [1, 1, 0],
                                    scale: p.scale,
                                    rotate: p.rotate
                                }}
                                transition={{
                                    duration: 2.4,
                                    delay: p.delay,
                                    ease: [0.16, 1, 0.3, 1]
                                }}
                                style={{ backgroundColor: p.color }}
                                className={`absolute w-3 h-3 shadow-sm ${p.isCircle ? 'rounded-full' : 'rounded-xs'}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default function YouVsClassEngine({
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
            title: "Du mot Klassen",
            pin_label: "RUMSKOD",
            go_live: "Starta Live",
            save_btn: "Spara",
            saving_btn: "Sparar...",
            save_success: "Aktiviteten sparades!",
            curate_tab: "Granska Stege",
            play_tab: "Spela",
            round: "Steg",
            hot_seat: "Heta Stolen",
            pick_challenger: "Slumpa Utmanare",
            rotate_challenger: "Byt Utmanare",
            picking_roulette: "Slumpar...",
            step_1_label: "1. Utmanare",
            step_2_label: "2. Satsning",
            step_3_label: "3. Klassen",
            step_4_label: "4. Heta Stolen",
            step_5_label: "5. Facit",
            phase_idle_title: "Välj vem som tar plats i Heta Stolen",
            phase_idle_sub: "Slumpa en utmanare bland de anslutna eleverna för att starta rundan.",
            phase_wagering_title: "Utmanaren väljer sin insats",
            phase_wagering_sub: "Uppgiften hålls dold tills satsningen är låst.",
            force_advance_wager: "Tvinga vidare (0p satsning)",
            phase_mob_title: "Klassen (Mobben) svarar nu!",
            phase_mob_sub: "Invänta klassens svar eller starta nedräkningen.",
            phase_challenger_title: "Utmanarens tur att svara!",
            phase_challenger_locked_title: "Utmanaren har låst in sitt svar!",
            phase_reveal_title: "Resultat & Poängutdelning",
            lock_mob_now: "Lås Klassens Svar Nu",
            start_15s: "Starta 15s Nedräkning",
            reveal_result: "Visa Facit & Dela ut Poäng",
            reveal_anyway: "Visa Facit Ändå",
            next_round: "Nästa Steg",
            finish_game: "Avsluta & Visa Vinnare",
            flash_round: "Flash-runda (Repetera nivå)",
            reroll_numbers: "Slumpa Nya Tal",
            edit_question: "Redigera",
            add_round_btn: "Lägg till steg",
            leaderboard: "Topplista & Multiplikatorer",
            mob_answers: "svar från klassen",
            wager_label: "Satsning",
            streak_in_seat: "I heta stolen",
            ask_mob_used: "Frågade klassen (-50% satsning)",
            beat_the_mob: "BEAT THE MOB! (+0.5x Bonus)",
            sweep_bonus_banner: "3-RUNDS SWEEP! (+250p Bonus)",
            waiting_students: "Väntar på att elever ska gå med i rummet...",
            connected_lobby: "Anslutna i lobbyn",
            locked_in_badge: "SVAR LÅST",
            waiting_challenger_input: "Tänker...",
            challenger_wins_banner: "UTMANAREN KLARADE RUNDAN!",
            mob_wins_banner: "MOBBEN VANN RUNDAN!",
            bounty_split_label: "Mob-bounty utdelad:",
            flash_banner_title: "FLASH-RUNDA!",
            flash_banner_sub: "Samma nivå — nya tal!",
            ladder_overview: "Översikt av Frågestegen",
            ladder_sub: "Granska, byt område/nivå eller lägg till fler steg innan eller under spelet.",
            start_playing: "Börja Spela",
            top_mob_answers_title: "Klassens vanligaste svar (Topp 4)",
            finale_title: "SLUTRESULTAT — DU MOT KLASSEN",
            finale_sub: "Grattis till kvällens mästare i 1 vs 100!",
            add_bonus_round: "Lägg till Bonusrunda (+1)",
            close_session: "Avsluta Aktivitet",
            question_masked_badge: "Uppgift dold under satsning"
        },
        en: {
            title: "You vs. Class",
            pin_label: "ROOM PIN",
            go_live: "Go Live",
            save_btn: "Save",
            saving_btn: "Saving...",
            save_success: "Activity saved!",
            curate_tab: "Review Ladder",
            play_tab: "Play",
            round: "Step",
            hot_seat: "Hot Seat",
            pick_challenger: "Pick Challenger",
            rotate_challenger: "Rotate Challenger",
            picking_roulette: "Selecting...",
            step_1_label: "1. Challenger",
            step_2_label: "2. Wager",
            step_3_label: "3. The Mob",
            step_4_label: "4. Hot Seat",
            step_5_label: "5. Reveal",
            phase_idle_title: "Pick who takes the Hot Seat",
            phase_idle_sub: "Randomly select a challenger from connected students to begin.",
            phase_wagering_title: "Challenger is placing a wager",
            phase_wagering_sub: "The question stays hidden until the wager is locked in.",
            force_advance_wager: "Force Advance (0p Wager)",
            phase_mob_title: "The Mob is answering now!",
            phase_mob_sub: "Wait for class responses or trigger a 15-second countdown.",
            phase_challenger_title: "Challenger's turn to answer!",
            phase_challenger_locked_title: "Challenger has locked in their answer!",
            phase_reveal_title: "Results & Points Awarded",
            lock_mob_now: "Lock Mob Answers Now",
            start_15s: "Start 15s Countdown",
            reveal_result: "Reveal Answer & Award Points",
            reveal_anyway: "Reveal Answer Anyway",
            next_round: "Next Step",
            finish_game: "Finish & Show Podium",
            flash_round: "Flash Round (Repeat Level)",
            reroll_numbers: "Re-roll Numbers",
            edit_question: "Edit",
            add_round_btn: "Add Step",
            leaderboard: "Leaderboard & Multipliers",
            mob_answers: "Mob answers locked",
            wager_label: "Wager",
            streak_in_seat: "In Hot Seat",
            ask_mob_used: "Asked the Mob (-50% wager)",
            beat_the_mob: "BEAT THE MOB! (+0.5x Bonus)",
            sweep_bonus_banner: "3-ROUND SWEEP! (+250p Bonus)",
            waiting_students: "Waiting for students to join the room...",
            connected_lobby: "Connected in Lobby",
            locked_in_badge: "LOCKED IN",
            waiting_challenger_input: "Thinking...",
            challenger_wins_banner: "CHALLENGER SURVIVES THE ROUND!",
            mob_wins_banner: "THE MOB WINS THE ROUND!",
            bounty_split_label: "Mob bounty split:",
            flash_banner_title: "FLASH ROUND!",
            flash_banner_sub: "Same level — fresh numbers!",
            ladder_overview: "Question Ladder Overview",
            ladder_sub: "Inspect, swap topics/levels, or add extra steps before or during the game.",
            start_playing: "Start Playing",
            top_mob_answers_title: "Top Anonymous Mob Answers (Top 4)",
            finale_title: "FINAL STANDINGS — YOU VS. CLASS",
            finale_sub: "Congratulations to tonight's 1 vs 100 champions!",
            add_bonus_round: "Add Bonus Round (+1)",
            close_session: "End Activity",
            question_masked_badge: "Question hidden during wager"
        }
    }[lang] || {};

    const [showHelpModal, setShowHelpModal] = useState(false);

    const baselinePoints = initialConfig?.settings?.baselinePoints || session?.active_question_data?.settings?.baselinePoints || 500;
    const inputMode = initialConfig?.settings?.inputMode || session?.active_question_data?.settings?.inputMode || 'multiple_choice';

    // All topics catalog for dynamic topic/level swapping inside the Engine Editor
    const allTopicsCatalog = useMemo(() => {
        const list = [];
        Object.entries(SKILL_BUCKETS).forEach(([catId, cat]) => {
            Object.entries(cat.topics || {}).forEach(([topicId, data]) => {
                const lvls = [...new Set((data.variations || []).map(v => Number(v.level || 1)))].sort((a, b) => a - b);
                list.push({
                    id: topicId,
                    name: `${cat.name?.[lang] || cat.name?.sv || catId}: ${data.name?.[lang] || data.name?.sv || topicId}`,
                    shortName: data.name?.[lang] || data.name?.sv || topicId,
                    levels: lvls.length > 0 ? lvls : [1]
                });
            });
        });
        return list;
    }, [lang]);

    const initialRounds = useMemo(() => {
        const raw = session?.active_question_data?.packet ||
            sourcePacket ||
            initialConfig?.initialQuestions ||
            [];
        return Array.isArray(raw) ? raw : Object.values(raw);
    }, [session, sourcePacket, initialConfig]);

    const [viewMode, setViewMode] = useState('curate'); // 'curate' | 'play'
    const [rounds, setRounds] = useState(initialRounds);
    const [activeRoundIndex, setActiveRoundIndex] = useState(0);
    const [activityTitle, setActivityTitle] = useState(initialConfig?.title || t.title);
    const [visibility, setVisibility] = useState('private');
    const [sheetId, setSheetId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [reRollingIdx, setReRollingIdx] = useState(null);
    const [editingRound, setEditingRound] = useState(null);
    const [isGeneratingSwap, setIsGeneratingSwap] = useState(false);

    // Game-Show Hot Seat State
    const [challengerState, setChallengerState] = useState({
        alias: null,
        streakInSeat: 0,
        wager: 0,
        askMobUsed: false,
        lifelineAvailable: true,
        challengerLockedIn: false,
        phase: 'idle' // 'idle' | 'wagering' | 'mob_answering' | 'challenger_answering' | 'reveal' | 'game_over'
    });

    // Animation States
    const [rouletteDisplayAlias, setRouletteDisplayAlias] = useState(null);
    const [isRouletteSpinning, setIsRouletteSpinning] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [shakeTrigger, setShakeTrigger] = useState(0);
    const [roundBanner, setRoundBanner] = useState(null);

    const triggerBanner = (title, subtitle, isFlash = false) => {
        setRoundBanner({ id: Date.now(), title, subtitle, isFlash });
        setTimeout(() => {
            setRoundBanner(prev => (prev && Date.now() - prev.id >= 2000 ? null : prev));
        }, 2200);
    };

    // Manual Countdown Timer
    const [countdownLeft, setCountdownLeft] = useState(0);
    const [isCountdownActive, setIsCountdownActive] = useState(false);

    // Ledger for permanent multipliers, wagers, Mob bounties, and sweep bonuses
    const [playerLedger, setPlayerLedger] = useState({});

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
        mode: 'activity_you_vs_class',
        gameKey: 'you_vs_class',
        title: activityTitle,
        lang,
        getPacket: () => rounds,
        getSettings: () => ({ inputMode, baselinePoints }),
        getInitialBroadcastData: () => ({
            mode: 'activity_you_vs_class',
            gameKey: 'you_vs_class',
            activeTile: 'round_0',
            activeQuestion: rounds[0] || null,
            packet: rounds,
            livePacket: rounds,
            roundIndex: 0,
            challengerState,
            baselinePoints
        })
    });

    const currentRound = rounds[activeRoundIndex] || null;

    // Extract unique active participants in the room
    const activeRoster = useMemo(() => {
        const names = new Set();
        liveResponses.forEach(r => {
            if (r.student_alias) names.add(r.student_alias.trim());
        });
        (session?.joined_students || []).forEach(name => {
            if (name) names.add(String(name).trim());
        });
        Object.keys(playerLedger).forEach(name => names.add(name));
        return Array.from(names);
    }, [liveResponses, session?.joined_students, playerLedger]);

    const computeScoresFromLedger = (ledgerState) => {
        const map = {};
        const historyByStudent = {};

        activeRoster.forEach(alias => {
            const ledger = ledgerState[alias] || { multiplier: 1.0, wagerDelta: 0, bountyEarned: 0, sweepBonus: 0, beatMobCount: 0 };
            map[alias] = {
                alias,
                score: baselinePoints + (ledger.wagerDelta || 0) + (ledger.bountyEarned || 0) + (ledger.sweepBonus || 0),
                multiplier: ledger.multiplier || 1.0,
                beatMobCount: ledger.beatMobCount || 0,
                streak: 0
            };
            historyByStudent[alias] = [];
        });

        liveResponses.forEach(res => {
            const alias = (res.student_alias || '').trim();
            if (!alias) return;
            if (!map[alias]) {
                const ledger = ledgerState[alias] || { multiplier: 1.0, wagerDelta: 0, bountyEarned: 0, sweepBonus: 0, beatMobCount: 0 };
                map[alias] = {
                    alias,
                    score: baselinePoints + (ledger.wagerDelta || 0) + (ledger.bountyEarned || 0) + (ledger.sweepBonus || 0),
                    multiplier: ledger.multiplier || 1.0,
                    beatMobCount: ledger.beatMobCount || 0,
                    streak: 0
                };
                historyByStudent[alias] = [];
            }
            historyByStudent[alias].push(res);
        });

        Object.entries(historyByStudent).forEach(([alias, history]) => {
            let streak = 0;
            let earned = 0;
            const mult = map[alias].multiplier || 1.0;

            history.forEach(ans => {
                const strAns = String(ans.answer || '');
                if (strAns.startsWith('[WAGER:') || strAns === '[ASK_MOB]' || strAns === '[JOINED]') return;

                const roundObj = rounds[ans.question_index] || currentRound;
                const isRight = ans.is_correct || checkRoundAnswer(ans.answer, roundObj);

                if (isRight) {
                    streak += 1;
                    const streakBonus = streak >= 5 ? 100 : streak >= 3 ? 50 : streak === 2 ? 25 : 0;
                    earned += Math.round(100 * mult) + streakBonus;
                } else {
                    streak = 0;
                }
            });

            map[alias].score = Math.max(0, map[alias].score + earned);
            map[alias].streak = streak;
        });

        const sorted = Object.values(map).sort((a, b) => b.score - a.score);
        const scoresMap = {};
        sorted.forEach((s, idx) => {
            scoresMap[s.alias] = { ...s, rank: idx + 1 };
        });

        return { leaderboard: sorted, studentScoresMap: scoresMap };
    };

    const { leaderboard, studentScoresMap } = useMemo(
        () => computeScoresFromLedger(playerLedger),
        [activeRoster, liveResponses, playerLedger, baselinePoints, rounds, currentRound]
    );

    const roundResponses = useMemo(() => {
        return liveResponses.filter(r => r.question_index === activeRoundIndex);
    }, [liveResponses, activeRoundIndex]);

    const challengerKey = (challengerState.alias || '').trim().toLowerCase();

    const mobResponses = useMemo(() => {
        const byStudent = new Map();
        roundResponses.forEach(r => {
            const aliasKey = (r.student_alias || '').trim().toLowerCase();
            if (!aliasKey || aliasKey === challengerKey) return;
            if (String(r.answer || '').startsWith('[')) return;
            byStudent.set(aliasKey, r);
        });
        return Array.from(byStudent.values());
    }, [roundResponses, challengerKey]);

    const totalMobSize = useMemo(() => {
        if (!challengerKey) return activeRoster.length;
        return activeRoster.filter(n => n.trim().toLowerCase() !== challengerKey).length;
    }, [activeRoster, challengerKey]);

    // Multiple Choice A-D spread
    const mobDistribution = useMemo(() => {
        const counts = { A: 0, B: 0, C: 0, D: 0 };
        mobResponses.forEach(r => {
            const key = String(r.answer || '').trim().toUpperCase();
            if (counts[key] !== undefined) counts[key]++;
        });
        return counts;
    }, [mobResponses]);

    // Keypad / Free-Response Top 4 Anonymous Mob Answers
    const topMobAnswers = useMemo(() => {
        const freq = new Map();
        mobResponses.forEach(r => {
            const raw = String(r.answer || '').trim();
            if (!raw || raw.startsWith('[')) return;
            const normKey = raw.toLowerCase().replace(/\s+/g, '').replace(',', '.');
            const existing = freq.get(normKey);
            if (existing) {
                existing.count += 1;
            } else {
                freq.set(normKey, { answer: raw, count: 1 });
            }
        });
        return Array.from(freq.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 4)
            .map(item => ({
                ...item,
                pct: mobResponses.length > 0 ? Math.round((item.count / mobResponses.length) * 100) : 0
            }));
    }, [mobResponses]);

    // Broadcast helper
    const syncRoom = async (
        nextRoundIdx = activeRoundIndex,
        nextQuestion = currentRound,
        nextChallenger = challengerState,
        updatedPacket = rounds,
        overrideScoresMap = null,
        overrideLeaderboard = null
    ) => {
        if (!isLive) return;
        const showSpread = nextChallenger.askMobUsed || nextChallenger.phase === 'reveal';
        await broadcastState({
            mode: 'activity_you_vs_class',
            gameKey: 'you_vs_class',
            activeTile: nextQuestion ? `round_${nextRoundIdx}` : null,
            activeQuestion: nextQuestion,
            packet: updatedPacket,
            livePacket: updatedPacket,
            roundIndex: nextRoundIdx,
            challengerState: nextChallenger,
            studentScores: overrideScoresMap || studentScoresMap,
            finalLeaderboard: overrideLeaderboard || leaderboard,
            mobDistribution: showSpread ? mobDistribution : null,
            topMobAnswers: showSpread ? topMobAnswers : null,
            mobCount: mobResponses.length,
            totalMobSize: Math.max(1, totalMobSize),
            baselinePoints
        });
    };

    useEffect(() => {
        if (isLive && rounds.length > 0) {
            syncRoom(activeRoundIndex, rounds[activeRoundIndex], challengerState, rounds);
        }
    }, [isLive]);

    // Auto-advance from 'mob_answering' -> 'challenger_answering' once ALL Mob students have submitted
    useEffect(() => {
        if (challengerState.phase !== 'mob_answering') return;
        if (totalMobSize > 0 && mobResponses.length >= totalMobSize) {
            setIsCountdownActive(false);
            const nextState = { ...challengerState, phase: 'challenger_answering' };
            setChallengerState(nextState);
            syncRoom(activeRoundIndex, currentRound, nextState);
        }
    }, [challengerState.phase, mobResponses.length, totalMobSize]);

    // Listen for Challenger wager lock-in, "Ask the Mob", and answer lock-in (Manual reveal)
    useEffect(() => {
        if (!challengerKey) return;

        const wagerIndex = -(activeRoundIndex + 100);
        const askMobIndex = -(activeRoundIndex + 200);

        const wagerMsg = liveResponses.find(
            r => r.question_index === wagerIndex &&
                 (r.student_alias || '').trim().toLowerCase() === challengerKey &&
                 String(r.answer).startsWith('[WAGER:')
        );
        if (wagerMsg && challengerState.phase === 'wagering') {
            const rawWager = parseInt(String(wagerMsg.answer).replace('[WAGER:', '').replace(']', ''), 10) || 0;
            const challengerScore = studentScoresMap[challengerState.alias]?.score ?? baselinePoints;
            const maxAllowed = Math.max(0, Math.floor(challengerScore * 0.5));
            const clampedWager = Math.max(0, Math.min(rawWager, maxAllowed));

            const nextState = {
                ...challengerState,
                wager: clampedWager,
                challengerLockedIn: false,
                phase: 'mob_answering'
            };
            setChallengerState(nextState);
            syncRoom(activeRoundIndex, currentRound, nextState);
        }

        const askMobMsg = liveResponses.find(
            r => r.question_index === askMobIndex &&
                 (r.student_alias || '').trim().toLowerCase() === challengerKey &&
                 String(r.answer) === '[ASK_MOB]'
        );
        if (askMobMsg && !challengerState.askMobUsed && challengerState.lifelineAvailable) {
            const nextState = {
                ...challengerState,
                askMobUsed: true,
                lifelineAvailable: false,
                wager: Math.floor(challengerState.wager * 0.5)
            };
            setChallengerState(nextState);
            syncRoom(activeRoundIndex, currentRound, nextState);
        }

        const realChallengerAns = roundResponses.find(
            r => (r.student_alias || '').trim().toLowerCase() === challengerKey &&
                 !String(r.answer).startsWith('[')
        );
        if (
            realChallengerAns &&
            (challengerState.phase === 'challenger_answering' || challengerState.phase === 'mob_answering') &&
            !challengerState.challengerLockedIn
        ) {
            const nextState = { ...challengerState, challengerLockedIn: true };
            setChallengerState(nextState);
            syncRoom(activeRoundIndex, currentRound, nextState);
        }
    }, [liveResponses, roundResponses, activeRoundIndex, challengerState, challengerKey, studentScoresMap, baselinePoints]);

    // Manual Countdown Timer Effect
    useEffect(() => {
        if (!isCountdownActive) return;
        if (countdownLeft <= 0) {
            setIsCountdownActive(false);
            if (challengerState.phase === 'mob_answering') {
                const nextState = { ...challengerState, phase: 'challenger_answering' };
                setChallengerState(nextState);
                syncRoom(activeRoundIndex, currentRound, nextState);
            }
            return;
        }
        const timer = setInterval(() => setCountdownLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [isCountdownActive, countdownLeft, challengerState]);

    // Roulette Challenger Picker
    const runChallengerRoulette = (pool, onComplete) => {
        if (pool.length === 1) {
            onComplete(pool[0]);
            return;
        }
        setIsRouletteSpinning(true);
        let step = 0;
        const totalSteps = 14;
        const spin = () => {
            const randomName = pool[step % pool.length];
            setRouletteDisplayAlias(randomName);
            step += 1;
            if (step < totalSteps) {
                const delay = 55 + Math.pow(step, 1.55) * 6;
                setTimeout(spin, delay);
            } else {
                const finalChosen = pool[Math.floor(Math.random() * pool.length)];
                setRouletteDisplayAlias(null);
                setIsRouletteSpinning(false);
                onComplete(finalChosen);
            }
        };
        spin();
    };

    const handleSelectChallenger = async (keepStreak = false) => {
        if (isRouletteSpinning) return;
        const candidates = activeRoster.filter(name => name !== challengerState.alias);
        const poolToPick = candidates.length > 0 ? candidates : activeRoster;

        if (poolToPick.length === 0) {
            alert(t.waiting_students);
            return;
        }

        runChallengerRoulette(poolToPick, async (chosen) => {
            setShowCelebration(false);
            const nextState = {
                alias: chosen,
                streakInSeat: keepStreak ? challengerState.streakInSeat : 0,
                wager: 0,
                askMobUsed: false,
                lifelineAvailable: true,
                challengerLockedIn: false,
                phase: 'wagering'
            };
            setChallengerState(nextState);
            await syncRoom(activeRoundIndex, currentRound, nextState);
        });
    };

    // Teacher Override: Force-advance past wagering with a 0p wager
    const handleForceAdvanceWager = async () => {
        if (challengerState.phase !== 'wagering') return;
        const nextState = {
            ...challengerState,
            wager: 0,
            challengerLockedIn: false,
            phase: 'mob_answering'
        };
        setChallengerState(nextState);
        await syncRoom(activeRoundIndex, currentRound, nextState);
    };

    const handleLockMobAnswers = async () => {
        setIsCountdownActive(false);
        const nextState = { ...challengerState, phase: 'challenger_answering' };
        setChallengerState(nextState);
        await syncRoom(activeRoundIndex, currentRound, nextState);
    };

    // Manual Teacher Reveal
    const handleRevealRound = async () => {
        setIsCountdownActive(false);
        const cAns = roundResponses.find(
            r => (r.student_alias || '').trim().toLowerCase() === challengerKey &&
                 !String(r.answer).startsWith('[')
        );

        const isChallengerRight = cAns ? checkRoundAnswer(cAns.answer, currentRound) : false;

        const correctMobStudents = mobResponses
            .filter(r => checkRoundAnswer(r.answer, currentRound))
            .map(r => (r.student_alias || '').trim());

        const mobAccuracyPct = mobResponses.length > 0
            ? Math.round((correctMobStudents.length / mobResponses.length) * 100)
            : 100;

        const beatTheMob = isChallengerRight && mobResponses.length > 0 && mobAccuracyPct < 50;
        const nextStreakInSeat = isChallengerRight ? challengerState.streakInSeat + 1 : 0;
        const earnedSweepBonus = isChallengerRight && nextStreakInSeat >= 3;

        const bountyPerMobWinner = (!isChallengerRight && challengerState.wager > 0 && correctMobStudents.length > 0)
            ? Math.round(challengerState.wager / correctMobStudents.length)
            : 0;

        const nextLedger = { ...playerLedger };

        if (challengerState.alias) {
            const current = nextLedger[challengerState.alias] || {
                multiplier: 1.0,
                wagerDelta: 0,
                bountyEarned: 0,
                sweepBonus: 0,
                beatMobCount: 0
            };
            const multGain = isChallengerRight ? (beatTheMob ? 1.0 : 0.5) : 0;
            nextLedger[challengerState.alias] = {
                ...current,
                multiplier: Number((current.multiplier + multGain).toFixed(1)),
                wagerDelta: (current.wagerDelta || 0) + (isChallengerRight ? challengerState.wager : -challengerState.wager),
                sweepBonus: (current.sweepBonus || 0) + (earnedSweepBonus ? 250 : 0),
                beatMobCount: (current.beatMobCount || 0) + (beatTheMob ? 1 : 0)
            };
        }

        if (bountyPerMobWinner > 0) {
            correctMobStudents.forEach(mobAlias => {
                const canonicalAlias = activeRoster.find(n => n.trim().toLowerCase() === mobAlias.toLowerCase()) || mobAlias;
                const current = nextLedger[canonicalAlias] || {
                    multiplier: 1.0,
                    wagerDelta: 0,
                    bountyEarned: 0,
                    sweepBonus: 0,
                    beatMobCount: 0
                };
                nextLedger[canonicalAlias] = {
                    ...current,
                    bountyEarned: (current.bountyEarned || 0) + bountyPerMobWinner
                };
            });
        }

        setPlayerLedger(nextLedger);
        const { leaderboard: freshLeaderboard, studentScoresMap: freshScoresMap } = computeScoresFromLedger(nextLedger);

        if (isChallengerRight) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3200);
        } else {
            setShowCelebration(false);
            setShakeTrigger(prev => prev + 1);
        }

        const nextState = {
            ...challengerState,
            streakInSeat: nextStreakInSeat,
            lastRoundWon: isChallengerRight,
            beatTheMob,
            earnedSweepBonus,
            bountyPerMobWinner,
            mobAccuracyPct,
            phase: 'reveal'
        };
        setChallengerState(nextState);
        await syncRoom(activeRoundIndex, currentRound, nextState, rounds, freshScoresMap, freshLeaderboard);
    };

    // Finish Game & Launch Studio Podium Finale
    const handleFinishGame = async () => {
        setShowCelebration(true);
        const nextState = {
            ...challengerState,
            phase: 'game_over'
        };
        setChallengerState(nextState);
        await syncRoom(activeRoundIndex, currentRound, nextState, rounds, studentScoresMap, leaderboard);
    };

    const handleNextRound = async () => {
        if (activeRoundIndex >= rounds.length - 1) {
            await handleFinishGame();
            return;
        }
        setShowCelebration(false);
        const nextIdx = activeRoundIndex + 1;
        const nextQ = rounds[nextIdx];
        setActiveRoundIndex(nextIdx);

        triggerBanner(
            `${t.round.toUpperCase()} ${nextIdx + 1} / ${rounds.length}`,
            nextQ?.name || '',
            Boolean(nextQ?.isFlashRound)
        );

        const mustRotate = !challengerState.lastRoundWon || challengerState.streakInSeat >= 3;

        if (mustRotate) {
            const candidates = activeRoster.filter(n => n !== challengerState.alias);
            const poolToPick = candidates.length > 0 ? candidates : activeRoster;

            if (poolToPick.length > 0) {
                runChallengerRoulette(poolToPick, async (nextChosen) => {
                    const nextState = {
                        alias: nextChosen,
                        streakInSeat: 0,
                        wager: 0,
                        askMobUsed: false,
                        lifelineAvailable: true,
                        challengerLockedIn: false,
                        phase: 'wagering'
                    };
                    setChallengerState(nextState);
                    await syncRoom(nextIdx, nextQ, nextState);
                });
            } else {
                const nextState = {
                    alias: null,
                    streakInSeat: 0,
                    wager: 0,
                    askMobUsed: false,
                    lifelineAvailable: true,
                    challengerLockedIn: false,
                    phase: 'idle'
                };
                setChallengerState(nextState);
                await syncRoom(nextIdx, nextQ, nextState);
            }
        } else {
            const nextState = {
                ...challengerState,
                wager: 0,
                askMobUsed: false,
                challengerLockedIn: false,
                phase: 'wagering'
            };
            setChallengerState(nextState);
            await syncRoom(nextIdx, nextQ, nextState);
        }
    };

    // Fetch a fresh question for a specific topicId & level
    const fetchQuestionForSlot = async (topicId, level, roundIndex) => {
        const url = `/api/question?topic=${topicId}&level=${level}&lang=${lang}&wordProblem=false`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const rd = data.renderData || {};
        const rawAnswer = extractDecodedAnswer(data) || extractDecodedAnswer(rd) || data.answer || rd.answer || '';

        let options = [];
        let expectedAnswer = rawAnswer;
        if (inputMode === 'multiple_choice') {
            options = generateDistractors({
                correctAnswer: rawAnswer,
                topicId,
                renderData: { ...rd, options: null },
                raw: data
            });
            const correctOpt = options.find(o => o.isCorrect || String(o.label) === String(rawAnswer));
            expectedAnswer = correctOpt ? correctOpt.id : 'A';
        }

        const topicMeta = allTopicsCatalog.find(tp => tp.id === topicId);
        const topicTitle = topicMeta?.shortName || topicId;

        return {
            id: crypto.randomUUID(),
            roundIndex,
            topicId,
            level: Number(level),
            variationKey: data.variationKey || null,
            name: `${topicTitle} (${lang === 'sv' ? 'Nivå' : 'Lvl'} ${level})`,
            inputMode,
            showText: true,
            showLatex: true,
            showVisual: true,
            renderData: {
                ...rd,
                options: inputMode === 'multiple_choice' ? options : null,
                answer: expectedAnswer,
                rawAnswerValue: rawAnswer
            },
            responseSpec: {
                type: inputMode === 'multiple_choice' ? 'single_choice' : 'standard',
                answer: expectedAnswer,
                options: inputMode === 'multiple_choice' ? options : null
            },
            regenVersion: Date.now()
        };
    };

    const handleAppendExtraRound = async (advanceImmediately = false) => {
        if (reRollingIdx !== null) return;
        setReRollingIdx(rounds.length);
        try {
            const refRound = rounds[rounds.length - 1] || { topicId: 'equations', level: 2 };
            const newQ = await fetchQuestionForSlot(refRound.topicId, refRound.level, rounds.length);
            if (!newQ) return;

            const updatedRounds = [...rounds, newQ];
            setRounds(updatedRounds);

            if (advanceImmediately) {
                setShowCelebration(false);
                const nextIdx = updatedRounds.length - 1;
                setActiveRoundIndex(nextIdx);
                const nextState = {
                    ...challengerState,
                    wager: 0,
                    askMobUsed: false,
                    challengerLockedIn: false,
                    phase: challengerState.alias ? 'wagering' : 'idle'
                };
                setChallengerState(nextState);
                await syncRoom(nextIdx, newQ, nextState, updatedRounds);
            }
        } finally {
            setReRollingIdx(null);
        }
    };

    const handleRerollIndex = async (targetIdx) => {
        const targetItem = rounds[targetIdx];
        if (!targetItem || reRollingIdx !== null) return;
        setReRollingIdx(targetIdx);

        try {
            const fresh = await universalRegenerateQuestion({
                roomId: isLive ? roomId : null,
                questionIndex: targetIdx,
                topicId: targetItem.topicId,
                variationKey: targetItem.variationKey,
                lang
            });

            if (fresh) {
                const rd = fresh.renderData || {};
                const rawAnswer = extractDecodedAnswer(fresh) || extractDecodedAnswer(rd) || fresh.answer || '';
                let options = [];
                let expectedAnswer = rawAnswer;

                if (inputMode === 'multiple_choice') {
                    options = generateDistractors({
                        correctAnswer: rawAnswer,
                        topicId: targetItem.topicId,
                        renderData: { ...rd, options: null },
                        raw: fresh
                    });
                    const correctOpt = options.find(o => o.isCorrect || String(o.label) === String(rawAnswer));
                    expectedAnswer = correctOpt ? correctOpt.id : 'A';
                }

                const updatedQ = {
                    ...targetItem,
                    renderData: {
                        ...rd,
                        options: inputMode === 'multiple_choice' ? options : null,
                        answer: expectedAnswer,
                        rawAnswerValue: rawAnswer
                    },
                    responseSpec: {
                        type: inputMode === 'multiple_choice' ? 'single_choice' : 'standard',
                        answer: expectedAnswer,
                        options: inputMode === 'multiple_choice' ? options : null
                    },
                    regenVersion: Date.now()
                };

                const nextRounds = rounds.map((r, i) => (i === targetIdx ? updatedQ : r));
                setRounds(nextRounds);

                if (isLive && targetIdx === activeRoundIndex) {
                    await syncRoom(activeRoundIndex, updatedQ, challengerState, nextRounds);
                }
            }
        } finally {
            setReRollingIdx(null);
        }
    };

    const handleInsertFlashRound = async () => {
        if (!currentRound || reRollingIdx !== null) return;
        setReRollingIdx(activeRoundIndex);
        setShowCelebration(false);

        try {
            const freshSlot = await fetchQuestionForSlot(currentRound.topicId, currentRound.level, activeRoundIndex + 1);
            if (!freshSlot) return;

            const cleanBaseName = String(currentRound.name || '').replace(/^Flash:\s*/i, '');
            const flashRound = {
                ...freshSlot,
                name: `Flash: ${cleanBaseName}`,
                isFlashRound: true
            };

            const updatedRounds = [
                ...rounds.slice(0, activeRoundIndex + 1),
                flashRound,
                ...rounds.slice(activeRoundIndex + 1).map(r => ({ ...r, roundIndex: r.roundIndex + 1 }))
            ];
            setRounds(updatedRounds);
            setActiveRoundIndex(activeRoundIndex + 1);

            triggerBanner(t.flash_banner_title, `${cleanBaseName} — ${t.flash_banner_sub}`, true);

            const nextState = {
                ...challengerState,
                wager: 0,
                askMobUsed: false,
                challengerLockedIn: false,
                phase: challengerState.alias ? 'wagering' : 'idle'
            };
            setChallengerState(nextState);
            await syncRoom(activeRoundIndex + 1, flashRound, nextState, updatedRounds);
        } finally {
            setReRollingIdx(null);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const saved = await saveActivityToLibrary({
                sheetId,
                title: activityTitle,
                type: 'activity_you_vs_class',
                visibility,
                packet: rounds,
                config: { inputMode, baselinePoints }
            });
            setSheetId(saved.id);
            alert(t.save_success);
        } finally {
            setIsSaving(false);
        }
    };

    const rd = currentRound?.renderData || {};
    const hasVisual = Boolean(rd.geometry || rd.graph || rd.pattern || rd.marbles || rd.diagram);
    const activeHotSeatName = isRouletteSpinning ? rouletteDisplayAlias : challengerState.alias;
    const isReadyForManualReveal = challengerState.phase === 'challenger_answering' && challengerState.challengerLockedIn;
    const isFinalRound = activeRoundIndex >= rounds.length - 1;
    const isQuestionHiddenPhase = challengerState.phase === 'idle' || challengerState.phase === 'wagering';

    // 5-Step Round Timeline Configuration
    const timelineSteps = [
        { key: 'idle', label: t.step_1_label },
        { key: 'wagering', label: t.step_2_label },
        { key: 'mob_answering', label: t.step_3_label },
        { key: 'challenger_answering', label: t.step_4_label },
        { key: 'reveal', label: t.step_5_label }
    ];
    const currentStepIndex = Math.max(0, timelineSteps.findIndex(s => s.key === challengerState.phase));

    return (
        <div className="fixed inset-0 z-[500] bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col overflow-hidden select-none font-sans">
            <StudioCelebrationOverlay active={showCelebration} />

            {/* Round & Flash Round Announcement Banner */}
            <AnimatePresence>
                {roundBanner && (
                    <motion.div
                        initial={{ opacity: 0, y: -40, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[545] pointer-events-none"
                    >
                        <div className={`px-7 py-3.5 rounded-2xl border-2 shadow-2xl flex items-center gap-3.5 backdrop-blur-md ${
                            roundBanner.isFlash
                                ? 'bg-amber-500/95 border-amber-200 text-slate-950'
                                : 'bg-[var(--bg-card)]/95 border-emerald-500 text-[var(--text-main)]'
                        }`}>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                roundBanner.isFlash ? 'bg-slate-950 text-amber-400' : 'bg-emerald-600 text-white'
                            }`}>
                                <Zap size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-black uppercase tracking-widest leading-tight">
                                    {roundBanner.title}
                                </div>
                                {roundBanner.subtitle && (
                                    <div className={`text-xs font-bold ${roundBanner.isFlash ? 'text-slate-900' : 'text-[var(--text-muted)]'}`}>
                                        {roundBanner.subtitle}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="px-6 py-3 bg-[var(--bg-card)] border-b border-[var(--border-strong)] flex items-center justify-between gap-4 shrink-0 shadow-2xs">
                <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-mono font-extrabold text-xs">
                        1 vs 100
                    </span>
                    <div className="flex items-center rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] px-2.5 py-1">
                        <Edit3 size={13} className="mr-2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            value={activityTitle}
                            onChange={(e) => setActivityTitle(e.target.value)}
                            className="text-xs sm:text-sm font-bold bg-transparent outline-none w-40 sm:w-52"
                        />
                        {!isLive && (
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="ml-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            >
                                <Save size={12} />
                                <span>{isSaving ? t.saving_btn : t.save_btn}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Center Mode Tabs */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-strong)]">
                        <button
                            type="button"
                            onClick={() => setViewMode('curate')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                viewMode === 'curate'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                        >
                            <ListFilter size={13} />
                            <span>{t.curate_tab} ({rounds.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setViewMode('play');
                                syncRoom(activeRoundIndex, rounds[activeRoundIndex], challengerState, rounds);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                viewMode === 'play'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                        >
                            <Play size={13} />
                            <span>{t.play_tab}</span>
                        </button>
                    </div>

                    {viewMode === 'play' && challengerState.phase !== 'game_over' && !isQuestionHiddenPhase && (
                        <button
                            type="button"
                            onClick={() => handleRerollIndex(activeRoundIndex)}
                            disabled={reRollingIdx !== null}
                            className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:border-emerald-600 border border-[var(--border-strong)] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCcw size={13} className={reRollingIdx === activeRoundIndex ? 'animate-spin' : ''} />
                            <span className="hidden md:inline">{t.reroll_numbers}</span>
                        </button>
                    )}
                </div>

                {/* Right Room PIN & Exit */}
                <div className="flex items-center gap-3">
                    <PreferencesToggle />
                    <button
                        type="button"
                        onClick={() => setShowHelpModal(true)}
                        className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                        title={lang === 'sv' ? "Hjälp & Spelregler" : "Help & Rules"}
                    >
                        <HelpCircle size={16} />
                    </button>

                    {isLive && classCode ? (
                        <div className="bg-rose-500/10 border border-rose-500/40 px-3.5 py-1 rounded-xl flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <div>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 block leading-none">
                                    {t.pin_label}
                                </span>
                                <span className="text-lg font-mono font-extrabold tracking-widest leading-tight">
                                    {classCode}
                                </span>
                            </div>
                        </div>
                    ) : canHostLiveRoom ? (
                        <button
                            type="button"
                            disabled={isGoingLive}
                            onClick={handleGoLive}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                            {isGoingLive ? <Loader2 size={13} className="animate-spin" /> : <Monitor size={13} />}
                            <span>{t.go_live}</span>
                        </button>
                    ) : null}

                    <button
                        type="button"
                        onClick={handleCloseEngine}
                        className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-rose-500 hover:text-white border border-[var(--border-main)] cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>
            </header>

            {/* VIEW 1: CURATE & PREVIEW LADDER */}
            {viewMode === 'curate' ? (
                <main className="flex-1 overflow-y-auto p-6 max-w-5xl w-full mx-auto space-y-4 custom-scrollbar">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-extrabold">{t.ladder_overview}</h2>
                            <p className="text-xs text-[var(--text-muted)]">{t.ladder_sub}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={reRollingIdx !== null}
                                onClick={() => handleAppendExtraRound(false)}
                                className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] hover:border-emerald-600 border border-[var(--border-strong)] text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                            >
                                <Plus size={14} />
                                <span>{t.add_round_btn}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setViewMode('play');
                                    syncRoom(activeRoundIndex, rounds[activeRoundIndex], challengerState, rounds);
                                }}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                                <span>{t.start_playing}</span>
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {rounds.map((item, idx) => {
                            const itemRd = item.renderData || {};
                            const itemHasVisual = Boolean(itemRd.geometry || itemRd.graph || itemRd.pattern || itemRd.marbles || itemRd.diagram);
                            const ansText = itemRd.rawAnswerValue || itemRd.answer || '—';

                            return (
                                <div
                                    key={item.id || idx}
                                    className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-5 flex flex-col gap-3 shadow-2xs"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                                {item.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                disabled={reRollingIdx !== null}
                                                onClick={() => handleRerollIndex(idx)}
                                                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:border-amber-500 border border-[var(--border-main)] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <RefreshCcw size={13} className={reRollingIdx === idx ? 'animate-spin text-amber-500' : ''} />
                                                <span>{t.reroll_numbers}</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setEditingRound({ idx, data: JSON.parse(JSON.stringify(item)) })}
                                                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:border-emerald-600 border border-[var(--border-main)] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Edit3 size={13} />
                                                <span>{t.edit_question}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {itemRd.description && (
                                        <div className="text-sm font-bold leading-relaxed">
                                            <MathDisplay content={itemRd.description} />
                                        </div>
                                    )}

                                    {itemHasVisual && (
                                        <div className="whiteboard-protect w-full flex justify-center py-3 bg-white border border-slate-200 rounded-xl overflow-hidden">
                                            <VisualRenderer data={itemRd} isWordProblem={false} />
                                        </div>
                                    )}

                                    {itemRd.latex && (
                                        <div className="whiteboard-protect bg-white border border-slate-200 rounded-xl p-3 text-center text-xl font-serif font-bold text-black [&_.katex]:text-black">
                                            <MathDisplay content={`$$${itemRd.latex}$$`} className="text-black [&_.katex]:text-black" />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-main)] text-xs">
                                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                            Facit: {ansText}
                                        </span>
                                        {Array.isArray(itemRd.options) && (
                                            <div className="flex gap-2">
                                                {itemRd.options.map(o => (
                                                    <span
                                                        key={o.id}
                                                        className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold border ${
                                                            o.isCorrect
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                                                                : 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-muted)]'
                                                        }`}
                                                    >
                                                        {o.id}: {o.label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            ) : challengerState.phase === 'game_over' ? (
                /* VIEW 3: STUDIO PODIUM FINALE */
                <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center max-w-5xl w-full mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-1.5"
                    >
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-mono text-xs font-extrabold uppercase tracking-widest">
                            <Award size={14} />
                            <span>1 vs 100 FINALE</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black tracking-tight uppercase">
                            {t.finale_title}
                        </h2>
                        <p className="text-xs sm:text-sm font-medium text-[var(--text-muted)]">
                            {t.finale_sub}
                        </p>
                    </motion.div>

                    {/* Top 3 Podium */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-2xl items-end pt-4">
                        {[1, 0, 2].map((podiumRankIdx) => {
                            const player = leaderboard[podiumRankIdx];
                            if (!player) return <div key={podiumRankIdx} />;
                            const isFirst = podiumRankIdx === 0;
                            const isSecond = podiumRankIdx === 1;
                            const heightClass = isFirst ? 'h-52' : isSecond ? 'h-40' : 'h-32';
                            const badgeColor = isFirst
                                ? 'bg-amber-500 text-white border-amber-300'
                                : isSecond
                                    ? 'bg-slate-400 text-slate-950 border-slate-200'
                                    : 'bg-amber-700 text-white border-amber-500';

                            return (
                                <motion.div
                                    key={player.alias}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: isFirst ? 0.35 : isSecond ? 0.15 : 0.25, type: 'spring', stiffness: 350, damping: 24 }}
                                    className="flex flex-col items-center gap-2.5"
                                >
                                    <div className="text-center space-y-1">
                                        {isFirst && <Crown size={26} className="text-amber-500 mx-auto" />}
                                        <div className="text-sm sm:text-base font-black truncate max-w-[140px]">
                                            {player.alias}
                                        </div>
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400">
                                                {player.score}p
                                            </span>
                                            {player.multiplier > 1 && (
                                                <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
                                                    {player.multiplier.toFixed(1)}x
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`w-full ${heightClass} rounded-t-2xl border-t-4 flex flex-col items-center justify-start pt-4 shadow-xl ${badgeColor}`}>
                                        <span className="text-3xl font-mono font-black">
                                            #{podiumRankIdx + 1}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {leaderboard.length > 3 && (
                        <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {leaderboard.slice(3).map((p, idx) => (
                                <div key={p.alias} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs font-bold">
                                    <span className="truncate">#{idx + 4} {p.alias}</span>
                                    <span className="font-mono text-amber-700 dark:text-amber-400 shrink-0">{p.score}p</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            disabled={reRollingIdx !== null}
                            onClick={() => handleAppendExtraRound(true)}
                            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                            <Plus size={15} />
                            <span>{t.add_bonus_round}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCloseEngine}
                            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-sm"
                        >
                            {t.close_session}
                        </button>
                    </div>
                </main>
            ) : (
                /* VIEW 2: LIVE GAME SHOW STAGE */
                <motion.main
                    key={shakeTrigger}
                    animate={shakeTrigger > 0 ? { x: [-12, 12, -9, 9, -5, 5, 0] } : { x: 0 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                    className="flex-1 overflow-hidden p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1800px] w-full mx-auto"
                >
                    {/* LEFT COLUMN (3 Cols): CONTESTANT SPOTLIGHT (PURE TELEMETRY) */}
                    <div className={`lg:col-span-3 bg-[var(--bg-card)] border-2 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-colors duration-300 ${
                        challengerState.phase === 'reveal'
                            ? challengerState.lastRoundWon
                                ? 'border-emerald-500'
                                : 'border-rose-500'
                            : challengerState.challengerLockedIn
                                ? 'border-sky-500'
                                : 'border-amber-500'
                    }`}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                    <Crown size={14} /> {t.hot_seat}
                                </span>
                                {activeRoster.length > 0 && (
                                    <button
                                        type="button"
                                        disabled={isRouletteSpinning}
                                        onClick={() => handleSelectChallenger(false)}
                                        className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] hover:border-amber-500 border border-[var(--border-main)] text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                        title={t.rotate_challenger}
                                    >
                                        <Shuffle size={11} className={isRouletteSpinning ? 'animate-spin' : ''} />
                                        <span>{challengerState.alias ? t.rotate_challenger : t.pick_challenger}</span>
                                    </button>
                                )}
                            </div>

                            {activeHotSeatName ? (
                                <motion.div
                                    key={activeHotSeatName}
                                    initial={{ scale: 0.92, opacity: 0.7 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 450, damping: 24 }}
                                    className={`p-5 rounded-2xl border text-center space-y-3 relative overflow-hidden ${
                                        isRouletteSpinning
                                            ? 'bg-amber-500/20 border-amber-400'
                                            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
                                    }`}
                                >
                                    <motion.div
                                        animate={isRouletteSpinning ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                                        transition={{ repeat: isRouletteSpinning ? Infinity : 0, duration: 0.25 }}
                                        className="w-16 h-16 rounded-2xl bg-amber-500 text-white font-mono font-extrabold text-2xl flex items-center justify-center mx-auto shadow-sm"
                                    >
                                        {activeHotSeatName.slice(0, 2).toUpperCase()}
                                    </motion.div>

                                    <div className="text-xl font-extrabold truncate">{activeHotSeatName}</div>

                                    {!isRouletteSpinning && (
                                        <>
                                            <AnimatePresence mode="wait">
                                                {challengerState.challengerLockedIn ? (
                                                    <motion.div
                                                        key="locked"
                                                        initial={{ scale: 1.45, opacity: 0, rotate: -6 }}
                                                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                                        transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-600 text-white font-mono text-[11px] font-black uppercase tracking-wider shadow-sm"
                                                    >
                                                        <Lock size={12} />
                                                        <span>{t.locked_in_badge}</span>
                                                    </motion.div>
                                                ) : (challengerState.phase === 'mob_answering' || challengerState.phase === 'challenger_answering') ? (
                                                    <motion.div
                                                        key="waiting"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-muted)] font-mono text-[10px] font-bold uppercase"
                                                    >
                                                        <Loader2 size={11} className="animate-spin" />
                                                        <span>{t.waiting_challenger_input}</span>
                                                    </motion.div>
                                                ) : null}
                                            </AnimatePresence>

                                            <div className="flex items-center justify-center gap-2 pt-1">
                                                <span className="px-3 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] font-mono text-xs font-bold">
                                                    {studentScoresMap[challengerState.alias]?.score ?? baselinePoints}p
                                                </span>
                                                <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold">
                                                    {(studentScoresMap[challengerState.alias]?.multiplier || 1.0).toFixed(1)}x
                                                </span>
                                            </div>

                                            <div className="pt-3 border-t border-amber-300/50 dark:border-amber-700/50 space-y-1.5 text-xs font-bold">
                                                <div className="flex justify-between">
                                                    <span className="text-[var(--text-muted)]">{t.wager_label}:</span>
                                                    <motion.span
                                                        key={challengerState.wager}
                                                        initial={{ scale: 1.3 }}
                                                        animate={{ scale: 1 }}
                                                        className="font-mono text-amber-700 dark:text-amber-300"
                                                    >
                                                        {challengerState.wager}p
                                                    </motion.span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-[var(--text-muted)]">{t.streak_in_seat}:</span>
                                                    <span className="font-mono">{challengerState.streakInSeat} / 3</span>
                                                </div>
                                            </div>

                                            {challengerState.askMobUsed && (
                                                <div className="mt-2 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/40 text-sky-700 dark:text-sky-300 text-[10px] font-bold">
                                                    {t.ask_mob_used}
                                                </div>
                                            )}

                                            {challengerState.phase === 'reveal' && challengerState.beatTheMob && (
                                                <motion.div
                                                    initial={{ scale: 0.7, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="mt-2 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider"
                                                >
                                                    {t.beat_the_mob}
                                                </motion.div>
                                            )}

                                            {challengerState.phase === 'reveal' && challengerState.earnedSweepBonus && (
                                                <motion.div
                                                    initial={{ scale: 0.7, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="mt-2 px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider"
                                                >
                                                    {t.sweep_bonus_banner}
                                                </motion.div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-strong)] text-center space-y-2.5">
                                    <div className="flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                        <Users size={15} />
                                        <span>{t.connected_lobby} ({activeRoster.length})</span>
                                    </div>
                                    {activeRoster.length > 0 ? (
                                        <div className="flex flex-wrap justify-center gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                            <AnimatePresence>
                                                {activeRoster.map((name) => (
                                                    <motion.span
                                                        key={name}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-emerald-500/40 text-xs font-bold shadow-2xs"
                                                    >
                                                        {name}
                                                    </motion.span>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <p className="text-xs font-semibold text-[var(--text-muted)] py-2">
                                            {t.waiting_students}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Connected Roster Pill Summary */}
                        <div className="pt-3 border-t border-[var(--border-main)] flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
                            <span className="flex items-center gap-1.5">
                                <Users size={13} className="text-emerald-600" />
                                {t.connected_lobby}
                            </span>
                            <span className="font-mono font-extrabold text-[var(--text-main)]">{activeRoster.length}</span>
                        </div>
                    </div>

                    {/* CENTER COLUMN (6 Cols): 5-STEP DIRECTOR CONSOLE + STAGE */}
                    <div className="lg:col-span-6 flex flex-col gap-4 min-h-0 overflow-hidden">
                        
                        {/* 5-STEP ROUND TIMELINE BAR */}
                        <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-3.5 shadow-2xs shrink-0">
                            <div className="grid grid-cols-5 gap-1.5">
                                {timelineSteps.map((step, idx) => {
                                    const isDone = idx < currentStepIndex;
                                    const isActive = idx === currentStepIndex;
                                    return (
                                        <div
                                            key={step.key}
                                            className={`px-2 py-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                                                isActive
                                                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm scale-[1.02]'
                                                    : isDone
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                                        : 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-muted)] opacity-60'
                                            }`}
                                        >
                                            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider truncate w-full">
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* MAIN STAGE CARD (MASKED DURING IDLE & WAGERING) */}
                        <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar shadow-sm">
                            {currentRound && (
                                <>
                                    {/* Top Metadata Header */}
                                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
                                        <span className={`px-3 py-1 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 ${
                                            currentRound.isFlashRound
                                                ? 'bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-300'
                                                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                        }`}>
                                            {currentRound.isFlashRound && <Zap size={12} />}
                                            <span>{t.round} {activeRoundIndex + 1} / {rounds.length} • {currentRound.name}</span>
                                        </span>

                                        <div className="px-3 py-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] font-mono text-xs font-bold flex items-center gap-1.5">
                                            <Users size={13} className="text-sky-600" />
                                            <span>
                                                {mobResponses.length} / {Math.max(1, totalMobSize)} {t.mob_answers}
                                            </span>
                                        </div>
                                    </div>

                                    {/* STAGE CONTENT: HIDDEN PREVIEW VS ACTIVE QUESTION */}
                                    {isQuestionHiddenPhase ? (
                                        <div className="my-auto py-8 flex flex-col items-center text-center space-y-4">
                                            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-strong)] flex items-center justify-center text-amber-500 shadow-inner">
                                                <EyeOff size={30} />
                                            </div>
                                            <div className="space-y-1 max-w-md">
                                                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                                                    {t.question_masked_badge}
                                                </span>
                                                <h3 className="text-2xl sm:text-3xl font-black tracking-tight pt-2">
                                                    {currentRound.name}
                                                </h3>
                                                <p className="text-xs sm:text-sm font-medium text-[var(--text-muted)]">
                                                    {challengerState.phase === 'idle' ? t.phase_idle_sub : t.phase_wagering_sub}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 my-auto py-2">
                                            {/* Outcome Banner on Reveal */}
                                            <AnimatePresence>
                                                {challengerState.phase === 'reveal' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9, y: -8 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ type: 'spring', stiffness: 450, damping: 24 }}
                                                        className={`p-3.5 rounded-xl border-2 flex items-center justify-between gap-2.5 font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm ${
                                                            challengerState.lastRoundWon
                                                                ? 'bg-emerald-600 border-emerald-400 text-white'
                                                                : 'bg-rose-600 border-rose-400 text-white'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {challengerState.lastRoundWon ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                                                            <span>
                                                                {challengerState.lastRoundWon ? t.challenger_wins_banner : t.mob_wins_banner}
                                                            </span>
                                                        </div>
                                                        {!challengerState.lastRoundWon && challengerState.bountyPerMobWinner > 0 && (
                                                            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-black/25">
                                                                {t.bounty_split_label} +{challengerState.bountyPerMobWinner}p
                                                            </span>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {rd.description && (
                                                <div className="text-lg sm:text-xl font-bold leading-relaxed">
                                                    <MathDisplay content={rd.description} />
                                                </div>
                                            )}

                                            {hasVisual && (
                                                <div className="whiteboard-protect w-full flex justify-center py-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
                                                    <VisualRenderer data={rd} isWordProblem={false} />
                                                </div>
                                            )}

                                            {rd.latex && (
                                                <div className="whiteboard-protect w-full bg-white border border-slate-200 rounded-xl p-5 text-center text-3xl font-serif font-bold text-black [&_.katex]:text-black">
                                                    <MathDisplay content={`$$${rd.latex}$$`} className="text-black [&_.katex]:text-black" />
                                                </div>
                                            )}

                                            {inputMode === 'multiple_choice' && Array.isArray(rd.options) ? (
                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                    {rd.options.map((opt, idx) => {
                                                        const showSpread = challengerState.askMobUsed || challengerState.phase === 'reveal';
                                                        const count = mobDistribution[opt.id] || 0;
                                                        const pct = mobResponses.length > 0 ? Math.round((count / mobResponses.length) * 100) : 0;
                                                        const isWinner = challengerState.phase === 'reveal' && (opt.isCorrect || checkRoundAnswer(opt.id, currentRound));

                                                        return (
                                                            <motion.div
                                                                key={opt.id}
                                                                initial={{ opacity: 0, y: 8 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                className={`relative overflow-hidden p-4 rounded-xl border-2 flex flex-col justify-between transition-colors ${
                                                                    isWinner
                                                                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                                                                        : 'bg-[var(--bg-surface)] border-[var(--border-main)]'
                                                                }`}
                                                            >
                                                                {showSpread && (
                                                                    <motion.div
                                                                        initial={{ width: '0%' }}
                                                                        animate={{ width: `${pct}%` }}
                                                                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                                                                        className={`absolute inset-y-0 left-0 pointer-events-none ${
                                                                            isWinner ? 'bg-white/15' : 'bg-sky-500/15'
                                                                        }`}
                                                                    />
                                                                )}

                                                                <div className="relative z-10 flex items-center justify-between mb-2">
                                                                    <span className={`w-7 h-7 rounded-lg font-mono font-extrabold text-xs flex items-center justify-center ${
                                                                        isWinner ? 'bg-white text-emerald-700' : 'bg-[var(--bg-card)] border border-[var(--border-main)]'
                                                                    }`}>
                                                                        {opt.id}
                                                                    </span>
                                                                    {showSpread && (
                                                                        <span className="font-mono text-xs font-extrabold">
                                                                            {pct}% ({count})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="relative z-10 text-lg font-bold text-center py-1">
                                                                    <MathDisplay content={String(opt.label)} />
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="space-y-3 pt-1">
                                                    {(challengerState.askMobUsed || challengerState.phase === 'reveal') && topMobAnswers.length > 0 && (
                                                        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 space-y-2">
                                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300 block">
                                                                {t.top_mob_answers_title}
                                                            </span>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {topMobAnswers.map((item, i) => (
                                                                    <div key={i} className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] flex items-center justify-between text-xs font-bold">
                                                                        <MathDisplay content={item.answer} />
                                                                        <span className="font-mono text-sky-600 dark:text-sky-400">
                                                                            {item.pct}% ({item.count})
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {challengerState.phase === 'reveal' && (
                                                        <motion.div
                                                            initial={{ scale: 0.92, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            className="p-5 rounded-2xl bg-emerald-600 text-white text-center shadow-sm"
                                                        >
                                                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-80 block">
                                                                FACIT
                                                            </span>
                                                            <div className="text-3xl font-extrabold font-serif mt-1">
                                                                <MathDisplay content={String(rd.rawAnswerValue || rd.answer)} />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* HERO CENTER DIRECTOR ACTION DOCK */}
                                    <div className="pt-4 border-t border-[var(--border-main)] space-y-3">
                                        {challengerState.phase === 'idle' && (
                                            <div className="flex flex-col items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={activeRoster.length === 0 || isRouletteSpinning}
                                                    onClick={() => handleSelectChallenger(false)}
                                                    className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg cursor-pointer transition-all active:scale-[0.98]"
                                                >
                                                    <Shuffle size={20} className={isRouletteSpinning ? 'animate-spin' : ''} />
                                                    <span>{isRouletteSpinning ? t.picking_roulette : t.pick_challenger}</span>
                                                </button>
                                            </div>
                                        )}

                                        {challengerState.phase === 'wagering' && (
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40">
                                                <div className="flex items-center gap-3">
                                                    <Loader2 size={20} className="animate-spin text-amber-500 shrink-0" />
                                                    <div>
                                                        <div className="text-sm font-extrabold text-[var(--text-main)]">
                                                            {t.phase_wagering_title} ({challengerState.alias})
                                                        </div>
                                                        <div className="text-xs text-[var(--text-muted)]">
                                                            {t.phase_wagering_sub}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleForceAdvanceWager}
                                                    className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] hover:border-amber-500 border border-[var(--border-strong)] text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                                                >
                                                    <FastForward size={14} className="text-amber-500" />
                                                    <span>{t.force_advance_wager}</span>
                                                </button>
                                            </div>
                                        )}

                                        {challengerState.phase === 'mob_answering' && (
                                            <div className="space-y-3">
                                                {/* Mob Progress Bar */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs font-bold">
                                                        <span className="text-sky-600 dark:text-sky-400 uppercase tracking-wider">{t.phase_mob_title}</span>
                                                        <span className="font-mono">{mobResponses.length} / {Math.max(1, totalMobSize)}</span>
                                                    </div>
                                                    <div className="w-full h-2.5 rounded-full bg-[var(--bg-surface)] overflow-hidden border border-[var(--border-main)]">
                                                        <motion.div
                                                            className="h-full bg-sky-600"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, Math.round((mobResponses.length / Math.max(1, totalMobSize)) * 100))}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCountdownLeft(15);
                                                            setIsCountdownActive(true);
                                                        }}
                                                        className="py-3.5 px-4 rounded-2xl bg-[var(--bg-surface)] hover:border-amber-500 border-2 border-[var(--border-strong)] text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                                                    >
                                                        <Timer size={18} className="text-amber-500" />
                                                        <span>{isCountdownActive ? `${countdownLeft}s...` : t.start_15s}</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={handleLockMobAnswers}
                                                        className="py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-[0.98]"
                                                    >
                                                        <Lock size={18} />
                                                        <span>{t.lock_mob_now}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {challengerState.phase === 'challenger_answering' && (
                                            <div className="space-y-2.5">
                                                <div className="text-center text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                                                    {challengerState.challengerLockedIn
                                                        ? t.phase_challenger_locked_title
                                                        : `${t.phase_challenger_title} (${challengerState.alias})`}
                                                </div>

                                                <motion.button
                                                    type="button"
                                                    onClick={handleRevealRound}
                                                    animate={isReadyForManualReveal ? {
                                                        scale: [1, 1.02, 1],
                                                        boxShadow: [
                                                            '0 0 0 0px rgba(16,185,129,0.6)',
                                                            '0 0 0 12px rgba(16,185,129,0)'
                                                        ]
                                                    } : { scale: 1 }}
                                                    transition={{
                                                        repeat: isReadyForManualReveal ? Infinity : 0,
                                                        duration: 1.25,
                                                        ease: 'easeInOut'
                                                    }}
                                                    className={`w-full py-4 px-6 rounded-2xl text-white text-sm sm:text-base font-black uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-lg transition-colors ${
                                                        isReadyForManualReveal
                                                            ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-300'
                                                            : 'bg-emerald-700/80 hover:bg-emerald-700'
                                                    }`}
                                                >
                                                    <Eye size={20} />
                                                    <span>{isReadyForManualReveal ? t.reveal_result : t.reveal_anyway}</span>
                                                </motion.button>
                                            </div>
                                        )}

                                        {challengerState.phase === 'reveal' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleInsertFlashRound}
                                                    disabled={reRollingIdx !== null}
                                                    className="sm:col-span-5 py-3.5 px-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border-2 border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <Repeat size={16} />
                                                    <span>{t.flash_round}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleNextRound}
                                                    className={`sm:col-span-7 py-3.5 px-6 rounded-2xl text-white text-sm sm:text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-[0.98] ${
                                                        isFinalRound
                                                            ? 'bg-amber-500 hover:bg-amber-600'
                                                            : 'bg-emerald-600 hover:bg-emerald-700'
                                                    }`}
                                                >
                                                    {isFinalRound ? <Trophy size={18} /> : null}
                                                    <span>{isFinalRound ? t.finish_game : t.next_round}</span>
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (3 Cols): LIVE LEADERBOARD & MULTIPLIERS */}
                    <div className="lg:col-span-3 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-5 flex flex-col overflow-hidden shadow-sm">
                        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-main)] mb-3 shrink-0">
                            <Trophy size={16} className="text-amber-500" />
                            <h3 className="text-xs font-extrabold uppercase tracking-wider">{t.leaderboard}</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                            <AnimatePresence>
                                {leaderboard.map((player, idx) => (
                                    <motion.div
                                        key={player.alias}
                                        layout
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                                        className={`p-3 rounded-xl border flex items-center justify-between ${
                                            player.alias === challengerState.alias
                                                ? 'bg-amber-500/15 border-amber-500'
                                                : 'bg-[var(--bg-surface)] border-[var(--border-main)]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-5 h-5 rounded-md bg-[var(--bg-card)] border border-[var(--border-main)] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <span className="text-xs font-bold truncate">{player.alias}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {player.multiplier > 1 && (
                                                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
                                                    {player.multiplier.toFixed(1)}x
                                                </span>
                                            )}
                                            <span className="font-mono text-xs font-extrabold text-amber-700 dark:text-amber-400">
                                                {player.score}p
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.main>
            )}

            {/* EDIT QUESTION MODAL (WITH DYNAMIC TOPIC & LEVEL SWAPPER) */}
            {editingRound && (
                <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
                            <h3 className="text-sm font-extrabold uppercase">{t.edit_question} — {editingRound.data.name}</h3>
                            <button type="button" onClick={() => setEditingRound(null)} className="p-1 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                                {lang === 'sv' ? 'Byt område eller nivå för detta steg' : 'Swap Topic or Level for this step'}
                            </span>
                            <div className="flex gap-2">
                                <select
                                    value={editingRound.data.topicId || 'equations'}
                                    onChange={(e) => {
                                        const newTopicId = e.target.value;
                                        const meta = allTopicsCatalog.find(tp => tp.id === newTopicId);
                                        const nextLvl = meta?.levels.includes(editingRound.data.level)
                                            ? editingRound.data.level
                                            : (meta?.levels[0] || 1);
                                        setEditingRound(prev => ({
                                            ...prev,
                                            data: { ...prev.data, topicId: newTopicId, level: nextLvl }
                                        }));
                                    }}
                                    className="flex-1 p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-strong)] text-xs font-bold outline-none cursor-pointer"
                                >
                                    {allTopicsCatalog.map(tp => (
                                        <option key={tp.id} value={tp.id}>{tp.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={editingRound.data.level || 1}
                                    onChange={(e) => setEditingRound(prev => ({
                                        ...prev,
                                        data: { ...prev.data, level: Number(e.target.value) }
                                    }))}
                                    className="w-20 p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-strong)] text-xs font-mono font-bold outline-none cursor-pointer"
                                >
                                    {(allTopicsCatalog.find(tp => tp.id === editingRound.data.topicId)?.levels || [1, 2, 3, 4]).map(lvl => (
                                        <option key={lvl} value={lvl}>N{lvl}</option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    disabled={isGeneratingSwap}
                                    onClick={async () => {
                                        setIsGeneratingSwap(true);
                                        try {
                                            const fresh = await fetchQuestionForSlot(
                                                editingRound.data.topicId,
                                                editingRound.data.level,
                                                editingRound.idx
                                            );
                                            if (fresh) {
                                                setEditingRound(prev => ({ ...prev, data: fresh }));
                                            }
                                        } finally {
                                            setIsGeneratingSwap(false);
                                        }
                                    }}
                                    className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0"
                                >
                                    <RefreshCcw size={12} className={isGeneratingSwap ? 'animate-spin' : ''} />
                                    <span>{lang === 'sv' ? 'Generera' : 'Generate'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Frågetext</label>
                                <textarea
                                    rows={2}
                                    value={editingRound.data.renderData?.description || ''}
                                    onChange={(e) => setEditingRound(prev => ({
                                        ...prev,
                                        data: {
                                            ...prev.data,
                                            renderData: { ...prev.data.renderData, description: e.target.value }
                                        }
                                    }))}
                                    className="w-full mt-1 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs font-bold outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Formel (LaTeX)</label>
                                <input
                                    type="text"
                                    value={editingRound.data.renderData?.latex || ''}
                                    onChange={(e) => setEditingRound(prev => ({
                                        ...prev,
                                        data: {
                                            ...prev.data,
                                            renderData: { ...prev.data.renderData, latex: e.target.value }
                                        }
                                    }))}
                                    className="w-full mt-1 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs font-mono font-bold outline-none"
                                />
                            </div>

                            {Array.isArray(editingRound.data.renderData?.options) ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {editingRound.data.renderData.options.map((opt, oIdx) => (
                                        <div key={opt.id} className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedOpts = editingRound.data.renderData.options.map(o => ({
                                                        ...o,
                                                        isCorrect: o.id === opt.id
                                                    }));
                                                    setEditingRound(prev => ({
                                                        ...prev,
                                                        data: {
                                                            ...prev.data,
                                                            renderData: { ...prev.data.renderData, options: updatedOpts, answer: opt.id },
                                                            responseSpec: { ...prev.data.responseSpec, options: updatedOpts, answer: opt.id }
                                                        }
                                                    }));
                                                }}
                                                className={`w-6 h-6 rounded-lg font-mono text-xs font-bold cursor-pointer ${
                                                    opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-card)]'
                                                }`}
                                            >
                                                {opt.id}
                                            </button>
                                            <input
                                                type="text"
                                                value={opt.label}
                                                onChange={(e) => {
                                                    const updatedOpts = [...editingRound.data.renderData.options];
                                                    updatedOpts[oIdx] = { ...opt, label: e.target.value };
                                                    setEditingRound(prev => ({
                                                        ...prev,
                                                        data: {
                                                            ...prev.data,
                                                            renderData: { ...prev.data.renderData, options: updatedOpts },
                                                            responseSpec: { ...prev.data.responseSpec, options: updatedOpts }
                                                        }
                                                    }));
                                                }}
                                                className="w-full bg-transparent text-xs font-bold outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Facit</label>
                                    <input
                                        type="text"
                                        value={editingRound.data.renderData?.rawAnswerValue || editingRound.data.renderData?.answer || ''}
                                        onChange={(e) => setEditingRound(prev => ({
                                            ...prev,
                                            data: {
                                                ...prev.data,
                                                renderData: { ...prev.data.renderData, answer: e.target.value, rawAnswerValue: e.target.value },
                                                responseSpec: { ...prev.data.responseSpec, answer: e.target.value }
                                            }
                                        }))}
                                        className="w-full mt-1 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs font-mono font-bold outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-main)]">
                            <button
                                type="button"
                                onClick={() => setEditingRound(null)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-muted)] cursor-pointer"
                            >
                                Avbryt
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    const updatedRounds = rounds.map((r, i) => i === editingRound.idx ? editingRound.data : r);
                                    setRounds(updatedRounds);
                                    if (isLive && editingRound.idx === activeRoundIndex) {
                                        await syncRoom(activeRoundIndex, editingRound.data, challengerState, updatedRounds);
                                    }
                                    setEditingRound(null);
                                }}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                                Spara
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <YouVsClassHelpModal
                isOpen={showHelpModal}
                onClose={() => setShowHelpModal(false)}
                lang={lang}
            />
        </div>
    );
}