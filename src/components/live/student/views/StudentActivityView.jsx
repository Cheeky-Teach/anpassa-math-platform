// src/components/live/student/views/StudentActivityView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MathDisplay from '../../../shared/MathDisplay';
import SmartMathInput from '../../../ui/SmartMathInput';
import MathScratchpad from '../../../ui/MathScratchpad';
import InteractiveCanvas from '../../../whiteboard/InteractiveCanvas';
import PreferencesToggle from '../../../ui/PreferencesToggle';
import VisualRenderer from '../../../visuals/VisualRenderer';
import { supabase } from '../../../../lib/supabaseClient';
import { evaluateAnswer } from '../../core/liveAnswerUtils';
import DynamicResponseInput from '../components/DynamicResponseInput';
import StudentQuickPracticeDrawer from '../../../activities/shared/StudentQuickPracticeDrawer';
import { 
    Send, CheckCircle2, Loader2, Trophy, 
    Calculator, PenTool, LogOut, Check, Zap, Users, ShieldAlert
} from 'lucide-react';

export default function StudentActivityView({
    engine,
    session: initialSession,
    studentAlias,
    lang = 'sv',
    onBack
}) {
    // 1. Dedicated live state for room data so teacher clicks force instant re-render
    const roomId = engine?.session?.id || initialSession?.id;
    const initialActiveData = engine?.session?.active_question_data || initialSession?.active_question_data || {};
    
    const [liveActiveData, setLiveActiveData] = useState(initialActiveData);

    // 2. Direct real-time room listener (Bypasses any parent memoization/prop lag)
    useEffect(() => {
        if (!roomId) return;

        const fetchCurrent = async () => {
            const { data } = await supabase
                .from('rooms')
                .select('active_question_data')
                .eq('id', roomId)
                .maybeSingle();
            if (data?.active_question_data) {
                setLiveActiveData(data.active_question_data);
            }
        };
        fetchCurrent();

        const channel = supabase
            .channel(`student_view_room_${roomId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'rooms',
                filter: `id=eq.${roomId}`
            }, (payload) => {
                const incomingData = payload.new?.active_question_data || {};
                setLiveActiveData(incomingData);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    // Sync if parent engine session does update
    useEffect(() => {
        if (engine?.session?.active_question_data) {
            setLiveActiveData(engine.session.active_question_data);
        }
    }, [engine?.session?.active_question_data]);

    // Mode determination
    const isFourCorners = 
        liveActiveData?.activity_mode === 'activity_four_corners' || 
        liveActiveData?.mode === 'activity_four_corners' ||
        liveActiveData?.gameKey === 'four_corners';

    const isYouVsClass =
        liveActiveData?.activity_mode === 'activity_you_vs_class' ||
        liveActiveData?.mode === 'activity_you_vs_class' ||
        liveActiveData?.gameKey === 'you_vs_class';

    // Auto-register student presence in You vs Class so teacher can pick a Challenger immediately
    useEffect(() => {
        if (!roomId || !studentAlias || !isYouVsClass) return;
        const cleanAlias = (studentAlias || "Elev").replace(/<[^>]*>?/gm, '').substring(0, 20).trim();
        supabase.from('responses').insert([{
            room_id: roomId,
            student_alias: cleanAlias,
            question_index: -1,
            answer: '[JOINED]',
            is_correct: false
        }]).then(() => {});
    }, [roomId, studentAlias, isYouVsClass]);
    
    // YouVsClass variables
    const myMultiplier = useMemo(() => {
        const cleanName = (studentAlias || '').replace(/<[^>]*>?/gm, '').substring(0, 20).trim();
        return liveActiveData?.studentScores?.[cleanName]?.multiplier || 1.0;
    }, [liveActiveData?.studentScores, studentAlias]);
    
    const challengerState = liveActiveData?.challengerState || {};
    const isMeChallenger = Boolean(
        challengerState.alias &&
        challengerState.alias.trim().toLowerCase() === (studentAlias || '').trim().toLowerCase()
    );
    
    const formatInlineMathDescription = (rawText) => {
        const str = String(rawText || '').trim();
        if (!str || str.includes('$')) return str;
        const hasProseWords = /\b[a-zA-ZåäöÅÄÖ]{3,}\b/.test(str.replace(/\\[a-zA-Z]+/g, ''));
        const hasLatexTokens = /\\(frac|sqrt|cdot|times|pi|div|pm|leq|geq|neq)|[\^_]{1}[{0-9a-zA-Z]/.test(str);
        if (!hasProseWords && hasLatexTokens) return `$${str}$`;
        return str.replace(
            /(\\(?:frac|sqrt)\{[^{}]*\}(?:\{[^{}]*\})?|\\(?:cdot|times|pi|div|pm)|[0-9a-zA-Z]+\^\{?[0-9a-zA-Z+-]+\}?)/g,
            (match) => `$${match}$`
        );
    };
    // Extract board & question properties from live data
    const dimensions = liveActiveData?.board?.dimensions || liveActiveData?.settings?.dimensions || { columns: 4, rows: 4 };
    const activeTile = liveActiveData?.activeTile;

    // Correctly extract the question object from either activeQuestion or root payload
    const activeQuestion = liveActiveData?.activeQuestion || ((isFourCorners || isYouVsClass) && liveActiveData?.renderData ? liveActiveData : null);

    const points = liveActiveData?.points || 100;
    const teams = liveActiveData?.teams || [];

    // Student's Chosen Team State
    const [selectedTeamId, setSelectedTeamId] = useState(() => {
        return teams[0]?.id || 'team_0';
    });

    useEffect(() => {
        if (teams.length > 0 && !teams.some(t => t.id === selectedTeamId)) {
            setSelectedTeamId(teams[0].id);
        }
    }, [teams, selectedTeamId]);

    const myTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

    const [localEarnedPoints, setLocalEarnedPoints] = useState(0);

    const myPersonalScore = useMemo(() => {
        const cleanName = (studentAlias || '').replace(/<[^>]*>?/gm, '').substring(0, 20).trim();
        const syncedScore = liveActiveData?.studentScores?.[cleanName]?.score;
        if (syncedScore !== undefined) return syncedScore;
        if (isYouVsClass) return liveActiveData?.baselinePoints || liveActiveData?.settings?.baselinePoints || 500;
        return localEarnedPoints;
    }, [liveActiveData, studentAlias, localEarnedPoints, isYouVsClass]);

    // Scratchpad & Canvas controls
    const settings = liveActiveData?.settings || {};
    const allowScratchpad = settings.allowScratchpad !== false;
    const allowCanvas = Boolean(settings.allowCanvas);
    const [activeWorkTab, setActiveWorkTab] = useState(allowCanvas && !allowScratchpad ? 'canvas' : 'scratchpad');

    // Local inputs
    const [localAnswers, setLocalAnswers] = useState({});
    const [localCompleted, setLocalCompleted] = useState({});
    const [localScratchpad, setLocalScratchpad] = useState({});
    const [localCanvas, setLocalCanvas] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Snabbräknaren: Sticky opt-in state across rounds
    const [autoPracticeEnabled, setAutoPracticeEnabled] = useState(false);

    // Extract active topics from room packet/categories for Snabbräknaren
    const sessionTopics = useMemo(() => {
        if (Array.isArray(liveActiveData?.packet)) {
            return [...new Set(liveActiveData.packet.map(q => q.topicId).filter(Boolean))];
        }
        if (liveActiveData?.board?.categories || liveActiveData?.settings?.categories) {
            const cats = liveActiveData?.board?.categories || liveActiveData?.settings?.categories || [];
            return [...new Set(cats.map(c => c.topic).filter(Boolean))];
        }
        if (activeQuestion?.topicId) {
            return [activeQuestion.topicId];
        }
        return ['basic_arithmetic'];
    }, [liveActiveData, activeQuestion]);

    // Single unified reset effect when round, tile, or regenerated question changes
    useEffect(() => {
        const targetKey = (isFourCorners || isYouVsClass) ? `round_${activeQuestion?.roundIndex ?? 0}` : activeTile;
        
        if (targetKey) {
            setLocalAnswers(prev => ({ ...prev, [targetKey]: '' }));
            setLocalCompleted(prev => {
                const next = { ...prev };
                delete next[targetKey];
                return next;
            });
            setIsSubmitting(false);
        }
    }, [
        activeTile, 
        activeQuestion?.id, 
        activeQuestion?.roundIndex, 
        activeQuestion?.regenVersion,
        isFourCorners,
        isYouVsClass
    ]);

    const currentAnswer = localAnswers[activeTile] || '';
    const isCompleted = Boolean(localCompleted[activeTile]);

    const activeTargetKey = (isFourCorners || isYouVsClass) ? `round_${activeQuestion?.roundIndex ?? 0}` : activeTile;
    const hasAnsweredCurrent = Boolean(localCompleted[activeTargetKey]);

    // Render Data extraction
    const rd = activeQuestion?.resolvedData?.renderData || activeQuestion?.renderData || {};
    const options = rd?.options && Array.isArray(rd.options) ? rd.options : null;
    const isMultipleChoice = Boolean(options && options.length > 0);

    const isWordProblem = Boolean(
        activeQuestion?.wordProblem || 
        rd?.isWordProblemApplied || 
        activeQuestion?.resolvedData?.metadata?.isWordProblemApplied
    );

    const effectiveShowText = activeQuestion?.showText !== false;
    const effectiveShowLatex = activeQuestion?.showLatex !== undefined 
        ? Boolean(activeQuestion?.showLatex) 
        : (!isWordProblem);

    const hasVisualElement = Boolean(
        rd?.geometry || rd?.graph || rd?.pattern || rd?.marbles || rd?.visualType || rd?.diagram
    );
    const showVisual = activeQuestion?.showVisual !== false;

    // HANDLER 1: For Four Corners & DynamicResponseInput
    const handleSendAnswer = async (answerVal) => {
        if (isSubmitting || !roomId) return;
        setIsSubmitting(true);
        try {
            const cleanAlias = (studentAlias || "Elev").replace(/<[^>]*>?/gm, '').substring(0, 20);
            const teamPrefix = myTeam?.id && teams.length > 1 ? `[${myTeam.id}] ` : '';
            const taggedAlias = `${teamPrefix}${cleanAlias}`;

            const payload = {
                room_id: roomId,
                student_alias: taggedAlias,
                question_index: activeQuestion?.roundIndex || 0,
                answer: String(answerVal).trim(),
                created_at: new Date().toISOString()
            };

            const { error } = await supabase.from('responses').insert([payload]);
            if (error && error.code !== '23505') throw error;

            const targetKey = `round_${activeQuestion?.roundIndex || 0}`;
            setLocalCompleted(prev => ({ ...prev, [targetKey]: true }));
            
            const expectedCorner = activeQuestion?.responseSpec?.answer || activeQuestion?.renderData?.answer;
            if (expectedCorner && String(answerVal).trim().toUpperCase() === String(expectedCorner).trim().toUpperCase()) {
                setLocalEarnedPoints(prev => prev + 100);
            }
        } catch (err) {
            console.error("[StudentActivityView] Four Corners submit error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Strict 50% Wager Cap & Action Handler for YouVsClass
    const maxWager = Math.max(0, Math.floor(myPersonalScore * 0.5));
    const [wagerAmount, setWagerAmount] = useState(0);

    // Clamp wagerAmount immediately whenever maxWager or round changes
    useEffect(() => {
        setWagerAmount(prev => {
            const defaultStart = Math.min(100, maxWager);
            if (prev === 0) return defaultStart;
            return Math.min(prev, maxWager);
        });
    }, [challengerState.alias, activeQuestion?.roundIndex, maxWager]);

    const handleYouVsClassAction = async (rawPayloadAnswer, markRoundComplete = false) => {
        if (isSubmitting || !roomId) return;
        setIsSubmitting(true);
        try {
            const cleanAlias = (studentAlias || "Elev").replace(/<[^>]*>?/gm, '').substring(0, 20).trim();
            let sanitizedPayload = String(rawPayloadAnswer).trim();

            // Clamp wager tag strictly at 50% before inserting
            if (sanitizedPayload.startsWith('[WAGER:')) {
                const requested = parseInt(sanitizedPayload.replace('[WAGER:', '').replace(']', ''), 10) || 0;
                const safeClamped = Math.max(0, Math.min(requested, maxWager));
                sanitizedPayload = `[WAGER:${safeClamped}]`;
            }

            const roundIdx = activeQuestion?.roundIndex ?? 0;
            const isWagerTag = sanitizedPayload.startsWith('[WAGER:');
            const isAskMobTag = sanitizedPayload === '[ASK_MOB]';
            const isActionTag = isWagerTag || isAskMobTag;

            // Use negative question_index for action tags so they never collide
            // with the unique (room_id, student_alias, question_index) constraint!
            const targetQuestionIndex = isWagerTag
                ? -(roundIdx + 100)
                : isAskMobTag
                    ? -(roundIdx + 200)
                    : roundIdx;

            let isCorrect = false;
            if (!isActionTag) {
                const candidates = [
                    activeQuestion?.responseSpec?.answer,
                    rd?.answer,
                    rd?.rawAnswerValue
                ].filter(v => v !== undefined && v !== null && typeof v !== 'object');

                isCorrect = candidates.some(c =>
                    sanitizedPayload.toLowerCase().replace(/\s+/g, '').replace(',', '.') ===
                    String(c).trim().toLowerCase().replace(/\s+/g, '').replace(',', '.') ||
                    evaluateAnswer(sanitizedPayload, String(c))
                );
            }

            const payload = {
                room_id: roomId,
                student_alias: cleanAlias,
                question_index: targetQuestionIndex,
                answer: sanitizedPayload,
                is_correct: isCorrect,
                created_at: new Date().toISOString()
            };

            const { error } = await supabase.from('responses').insert([payload]);
            if (error && error.code !== '23505') throw error;

            if (markRoundComplete) {
                const targetKey = `round_${roundIdx}`;
                setLocalCompleted(prev => ({ ...prev, [targetKey]: true }));
            }
        } catch (err) {
            console.error("[StudentActivityView] YouVsClass action error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // HANDLER 2: For Category Clash Matrix Tiles
    const handleTileSubmit = async (overrideAnswer = null) => {
        const finalAnswer = overrideAnswer !== null ? overrideAnswer : currentAnswer;
        if (!finalAnswer.trim() || isSubmitting || isCompleted || !activeTile) return;

        setIsSubmitting(true);
        try {
            const correctAnswer = activeQuestion?.answer || rd?.answer;
            let isCorrect = true;

            if (correctAnswer !== undefined && correctAnswer !== null) {
                const normalize = (str) => String(str).toLowerCase().replace(/\s+/g, '').replace(',', '.');
                isCorrect = normalize(finalAnswer) === normalize(correctAnswer);
            }

            let numericQuestionIndex = 0;
            const match = String(activeTile).match(/^c(\d+)_r(\d+)$/);
            if (match) {
                const col = parseInt(match[1], 10);
                const row = parseInt(match[2], 10);
                const colCount = dimensions?.columns || 4;
                numericQuestionIndex = row * colCount + col;
            } else {
                numericQuestionIndex = parseInt(activeTile, 10) || 0;
            }

            const cleanAlias = (studentAlias || "Elev").replace(/<[^>]*>?/gm, '').substring(0, 20);
            const teamPrefix = myTeam?.id && teams.length > 1 ? `[${myTeam.id}] ` : '';
            const taggedAlias = `${teamPrefix}${cleanAlias}`;

            const payload = {
                room_id: roomId,
                student_alias: taggedAlias,
                question_index: numericQuestionIndex,
                answer: finalAnswer.trim(),
                work_steps: (localScratchpad[activeTile] || []).filter(s => s && s.trim().length > 0),
                canvas_state: localCanvas[activeTile] || [],
                is_correct: isCorrect
            };

            const { error } = await supabase.from('responses').insert([payload]);
            if (error && error.code !== '23505') throw error;

            setLocalCompleted(prev => ({ ...prev, [activeTile]: true }));
            if (isCorrect) {
                setLocalEarnedPoints(prev => prev + (Number(points) || 100));
            }
        } catch (err) {
            console.error("[StudentActivityView] Submit error:", err);
            alert(lang === 'sv' ? "Kunde inte skicka svar." : "Failed to submit answer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isWaitingForQuestion = (isFourCorners || isYouVsClass)
        ? (!activeQuestion || !activeQuestion.renderData) 
        : (!activeTile || !activeQuestion);

    const wagerPct = maxWager > 0 ? Math.round((wagerAmount / myPersonalScore) * 100) : 0;
    const mobProgressCount = liveActiveData?.mobCount || 0;
    const mobProgressTotal = liveActiveData?.totalMobSize || 1;

    return (
        <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col font-sans select-none">
            
            {/* Top Bar */}
            <header className="bg-[var(--bg-card)] border-b border-[var(--border-main)] px-4 py-2.5 sticky top-0 z-50 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
                <div className="flex items-center gap-3">
                    {teams.length > 1 ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] shadow-2xs">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: myTeam?.color }} />
                            <select
                                value={selectedTeamId}
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                                className="bg-transparent text-xs font-bold uppercase text-[var(--text-main)] outline-none cursor-pointer"
                            >
                                {teams.map(t => (
                                    <option key={t.id} value={t.id} className="bg-[var(--bg-card)] text-[var(--text-main)]">
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                                <span>{isYouVsClass ? '1 vs 100' : isFourCorners ? '4 Hörn' : (myTeam?.name || (lang === 'sv' ? 'Individuellt' : 'Solo'))}</span>
                            </div>

                            {isYouVsClass && myMultiplier > 1 && (
                                <motion.span
                                    key={myMultiplier}
                                    initial={{ scale: 1.35 }}
                                    animate={{ scale: 1 }}
                                    className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-mono text-xs font-extrabold shadow-2xs"
                                >
                                    {myMultiplier.toFixed(1)}x
                                </motion.span>
                            )}
                        </>
                    )}

                    <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                        {studentAlias}
                    </span>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-mono font-black shadow-2xs">
                        <Trophy size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>{myPersonalScore}p</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <PreferencesToggle />
                    <button
                        type="button"
                        onClick={onBack}
                        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                        title={lang === 'sv' ? "Lämna" : "Leave"}
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center items-center">
                
                {/* STATE 1: WAITING FOR TEACHER */}
                {isWaitingForQuestion ? (
                    <div className="w-full max-w-xl flex flex-col items-center gap-4">
                        <div className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-8 sm:p-10 text-center shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-150">
                            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5 shadow-inner">
                                <Trophy size={32} />
                            </div>
                            
                            <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)] mb-1.5">
                                {lang === 'sv' ? "Väntar på nästa uppgift..." : "Waiting for next question..."}
                            </h2>
                            
                            <p className="text-xs font-medium text-[var(--text-muted)] mb-6 max-w-md leading-relaxed">
                                {lang === 'sv' 
                                    ? "Läraren förbereder nästa runda på storskärmen. Håll dig redo!" 
                                    : "The teacher is setting up the next round on the board. Get ready!"}
                            </p>

                            {!autoPracticeEnabled ? (
                                <button
                                    type="button"
                                    onClick={() => setAutoPracticeEnabled(true)}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
                                >
                                    <Zap size={15} className="fill-current" />
                                    <span>{lang === 'sv' ? "Starta Snabbräknare (Medan du väntar)" : "Start Quick Practice (While waiting)"}</span>
                                </button>
                            ) : null}

                            <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs">
                                <Trophy size={14} className="text-amber-600 dark:text-amber-400" />
                                <span>{lang === 'sv' ? "Dina poäng:" : "Your score:"} {myPersonalScore}p</span>
                            </div>

                            {teams.length > 0 && !isFourCorners && !isYouVsClass && (
                                <div className="w-full bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-main)] space-y-2 mt-5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                                        {lang === 'sv' ? "Aktuell Ställning" : "Current Standings"}
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {teams.map(t => (
                                            <div key={t.id} className="flex items-center justify-between p-2.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-strong)]">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                                                    <span className="text-xs font-bold text-[var(--text-main)] truncate">{t.name}</span>
                                                </div>
                                                <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-400 shrink-0">{t.score}p</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {autoPracticeEnabled && (
                            <StudentQuickPracticeDrawer
                                isOpen={isWaitingForQuestion}
                                sessionTopics={sessionTopics}
                                lang={lang}
                                onClose={() => setAutoPracticeEnabled(false)}
                            />
                        )}
                    </div>
                ) : isYouVsClass ? (

                    /* STATE 2C: YOU VS. CLASS (1 VS 100) VIEW */
                    <div className="w-full max-w-6xl flex flex-col gap-5">
                        
                        {/* Role Banner */}
                        <motion.div
                            key={`${isMeChallenger}-${challengerState.alias}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                                isMeChallenger
                                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100'
                                    : 'bg-[var(--bg-card)] border-[var(--border-strong)]'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-extrabold uppercase ${
                                    isMeChallenger ? 'bg-amber-500 text-white' : 'bg-sky-600 text-white'
                                }`}>
                                    {isMeChallenger ? (lang === 'sv' ? 'Heta Stolen' : 'Hot Seat') : (lang === 'sv' ? 'Klassen (Mobben)' : 'The Mob')}
                                </span>
                                <span className="text-xs sm:text-sm font-bold">
                                    {isMeChallenger
                                        ? (lang === 'sv' ? 'Du möter hela klassen!' : 'You are taking on the whole class!')
                                        : challengerState.alias
                                            ? `${lang === 'sv' ? 'Utmanare:' : 'Challenger:'} ${challengerState.alias}`
                                            : (lang === 'sv' ? 'Gör dig redo!' : 'Get ready!')}
                                </span>
                            </div>

                            {challengerState.wager > 0 && (
                                <span className="font-mono text-xs font-extrabold text-amber-700 dark:text-amber-300">
                                    {lang === 'sv' ? 'Satsning:' : 'Wager:'} {challengerState.wager}p
                                </span>
                            )}
                        </motion.div>

                        {/* PHASE: GAME OVER FINALE PODIUM */}
                        {challengerState.phase === 'game_over' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.94 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[var(--bg-card)] border-2 border-amber-500 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto w-full text-center space-y-5 shadow-2xl"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                                    <Trophy size={32} />
                                </div>

                                <div>
                                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                        {lang === 'sv' ? 'SPELET ÄR SLUT' : 'GAME OVER'}
                                    </span>
                                    <h3 className="text-xl font-black uppercase tracking-tight mt-0.5">
                                        {lang === 'sv' ? 'Slutresultat' : 'Final Standings'}
                                    </h3>
                                </div>

                                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-around">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                                            {lang === 'sv' ? 'Dina Poäng' : 'Your Score'}
                                        </span>
                                        <span className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400">
                                            {myPersonalScore}p
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                                            {lang === 'sv' ? 'Multiplikator' : 'Multiplier'}
                                        </span>
                                        <span className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                                            {myMultiplier.toFixed(1)}x
                                        </span>
                                    </div>
                                </div>

                                {Array.isArray(liveActiveData?.finalLeaderboard) && liveActiveData.finalLeaderboard.length > 0 && (
                                    <div className="space-y-1.5 text-left">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block">
                                            {lang === 'sv' ? 'Topp 3 i klassen' : 'Top 3 in Class'}
                                        </span>
                                        {liveActiveData.finalLeaderboard.slice(0, 3).map((p, idx) => (
                                            <div key={p.alias} className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-between text-xs font-bold">
                                                <span>#{idx + 1} {p.alias}</span>
                                                <span className="font-mono text-amber-700 dark:text-amber-400">{p.score}p</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (!challengerState.phase || challengerState.phase === 'idle' || !challengerState.alias) ? (
                            /* PHASE 0: IDLE */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-8 text-center space-y-3 max-w-md mx-auto shadow-sm"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
                                    <Users size={28} />
                                </div>
                                <h3 className="text-base font-extrabold uppercase tracking-tight">
                                    {lang === 'sv' ? 'Du är inne i rummet!' : "You're in the room!"}
                                </h3>
                                <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                    {lang === 'sv'
                                        ? 'Gör dig redo! Läraren slumpar snart fram den första utmanaren till heta stolen...'
                                        : 'Get ready! The teacher is picking the first Challenger for the Hot Seat...'}
                                </p>
                            </motion.div>
                        ) : challengerState.phase === 'wagering' ? (
                            /* PHASE 1: WAGERING (STRICT 50% CAP) */
                            isMeChallenger ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className="bg-[var(--bg-card)] border-2 border-amber-500 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto w-full text-center space-y-5 shadow-xl"
                                >
                                    <div>
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                            {lang === 'sv' ? 'MAXINSATS: 50% AV DINA POÄNG' : 'MAX WAGER: 50% OF YOUR SCORE'}
                                        </span>
                                        <h3 className="text-lg font-extrabold uppercase tracking-tight mt-0.5">
                                            {lang === 'sv' ? 'Välj din satsning' : 'Place your wager'}
                                        </h3>
                                    </div>

                                    <motion.div
                                        key={wagerAmount}
                                        initial={{ scale: 1.08 }}
                                        animate={{ scale: 1 }}
                                        className="space-y-0.5"
                                    >
                                        <div className="text-4xl font-mono font-extrabold text-amber-600 dark:text-amber-400">
                                            {wagerAmount} p
                                        </div>
                                        <div className="text-[11px] font-mono font-bold text-[var(--text-muted)]">
                                            ({wagerPct}% {lang === 'sv' ? 'av' : 'of'} {myPersonalScore}p)
                                        </div>
                                    </motion.div>

                                    <input
                                        type="range"
                                        min={0}
                                        max={maxWager}
                                        step={maxWager >= 50 ? 5 : 1}
                                        value={Math.min(wagerAmount, maxWager)}
                                        onChange={(e) => setWagerAmount(Math.min(maxWager, Number(e.target.value)))}
                                        className="w-full accent-amber-500 cursor-pointer"
                                    />

                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setWagerAmount(0)}
                                            className="py-1.5 rounded-lg bg-[var(--bg-surface)] hover:border-amber-500 border border-[var(--border-main)] text-[11px] font-mono font-bold cursor-pointer"
                                        >
                                            0p (0%)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWagerAmount(Math.floor(myPersonalScore * 0.25))}
                                            className="py-1.5 rounded-lg bg-[var(--bg-surface)] hover:border-amber-500 border border-[var(--border-main)] text-[11px] font-mono font-bold cursor-pointer"
                                        >
                                            {Math.floor(myPersonalScore * 0.25)}p (25%)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWagerAmount(maxWager)}
                                            className="py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-[11px] font-mono font-bold cursor-pointer"
                                        >
                                            {maxWager}p (Max 50%)
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => handleYouVsClassAction(`[WAGER:${Math.min(wagerAmount, maxWager)}]`, false)}
                                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-sm"
                                    >
                                        {lang === 'sv'
                                            ? `Lås satsning (${Math.min(wagerAmount, maxWager)}p)`
                                            : `Lock Wager (${Math.min(wagerAmount, maxWager)}p)`}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-8 text-center space-y-2 max-w-md mx-auto"
                                >
                                    <Loader2 className="animate-spin text-amber-500 mx-auto" size={28} />
                                    <p className="text-sm font-bold">
                                        {lang === 'sv'
                                            ? `Väntar på att ${challengerState.alias} ska satsa poäng...`
                                            : `Waiting for ${challengerState.alias} to place a wager...`}
                                    </p>
                                </motion.div>
                            )
                        ) : (
                            /* PHASES 2–4: QUESTION + ROLE-LOCKED INPUT */
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                                {/* Left Question Card */}
                                <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-6 space-y-4 shadow-sm">
                                    {rd.description && (
                                        <div className="text-lg sm:text-xl font-bold leading-relaxed">
                                            <MathDisplay content={formatInlineMathDescription(rd.description)} />
                                        </div>
                                    )}
                                    {hasVisualElement && (
                                        <div className="whiteboard-protect w-full flex justify-center py-3 bg-white border border-slate-200 rounded-xl overflow-hidden">
                                            <VisualRenderer data={rd} isWordProblem={false} />
                                        </div>
                                    )}
                                    {rd.latex && (
                                        <div className="whiteboard-protect w-full bg-white border border-slate-200 rounded-xl p-5 text-center text-2xl sm:text-3xl font-serif font-bold text-black [&_.katex]:text-black">
                                            <MathDisplay content={`$$${rd.latex}$$`} className="text-black [&_.katex]:text-black" />
                                        </div>
                                    )}
                                </div>

                                {/* Right Input / Lifeline / Reveal Card */}
                                <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-6 space-y-4 shadow-sm">
                                    {/* Reveal Banner on Student Device */}
                                    <AnimatePresence>
                                        {challengerState.phase === 'reveal' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.94 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`p-4 rounded-xl border-2 space-y-1.5 font-extrabold text-xs uppercase tracking-wider ${
                                                    challengerState.lastRoundWon
                                                        ? 'bg-emerald-600 border-emerald-400 text-white'
                                                        : 'bg-rose-600 border-rose-400 text-white'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    {challengerState.lastRoundWon ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                                                    <span>
                                                        {challengerState.lastRoundWon
                                                            ? (lang === 'sv' ? 'Utmanaren klarade rundan!' : 'Challenger survived the round!')
                                                            : (lang === 'sv' ? 'Klassen (Mobben) vann rundan!' : 'The Mob won the round!')}
                                                    </span>
                                                </div>

                                                {!challengerState.lastRoundWon && challengerState.bountyPerMobWinner > 0 && !isMeChallenger && (
                                                    <div className="font-mono text-[11px] px-2.5 py-1 rounded bg-black/25 inline-block">
                                                        {lang === 'sv'
                                                            ? `Mob-bounty: +${challengerState.bountyPerMobWinner}p till alla rätta svar!`
                                                            : `Mob Bounty: +${challengerState.bountyPerMobWinner}p to every correct Mob answer!`}
                                                    </div>
                                                )}

                                                {challengerState.lastRoundWon && challengerState.earnedSweepBonus && isMeChallenger && (
                                                    <div className="font-mono text-[11px] px-2.5 py-1 rounded bg-black/25 inline-block">
                                                        {lang === 'sv' ? '3-runds Sweep Bonus: +250p!' : '3-Round Sweep Bonus: +250p!'}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Challenger waiting during Mob phase -> Can use "Ask the Mob" token */}
                                    {isMeChallenger && challengerState.phase === 'mob_answering' && (
                                        <div className="space-y-4 text-center">
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-[var(--text-muted)]">
                                                    {lang === 'sv'
                                                        ? 'Klassen svarar just nu! Räkna ut uppgiften under tiden.'
                                                        : 'The Mob is answering now! Solve the problem while you wait.'}
                                                </p>
                                                <div className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400">
                                                    {mobProgressCount} / {mobProgressTotal} {lang === 'sv' ? 'elever klara' : 'students locked in'}
                                                </div>
                                            </div>

                                            {challengerState.lifelineAvailable && !challengerState.askMobUsed && (
                                                <button
                                                    type="button"
                                                    disabled={isSubmitting}
                                                    onClick={() => handleYouVsClassAction('[ASK_MOB]', false)}
                                                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm"
                                                >
                                                    {lang === 'sv' ? 'Fråga Klassen (-50% av satsning)' : 'Ask the Mob (-50% Wager)'}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Ask the Mob Spread (Visible to Challenger in both mob_answering & challenger_answering once used) */}
                                    {isMeChallenger && challengerState.askMobUsed && (
                                        isMultipleChoice && liveActiveData?.mobDistribution ? (
                                            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 space-y-1.5 text-left">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 block">
                                                    {lang === 'sv' ? 'Klassens fördelning:' : 'Mob Vote Spread:'}
                                                </span>
                                                <div className="grid grid-cols-4 gap-1.5 font-mono text-xs font-bold text-center">
                                                    {Object.entries(liveActiveData.mobDistribution).map(([k, v]) => (
                                                        <div key={k} className="p-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-main)]">
                                                            {k}: {v}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : !isMultipleChoice && Array.isArray(liveActiveData?.topMobAnswers) && liveActiveData.topMobAnswers.length > 0 ? (
                                            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 space-y-1.5 text-left">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 block">
                                                    {lang === 'sv' ? 'Klassens vanligaste svar (Topp 4):' : 'Top Anonymous Mob Answers:'}
                                                </span>
                                                <div className="space-y-1.5">
                                                    {liveActiveData.topMobAnswers.map((item, idx) => (
                                                        <div key={idx} className="px-2.5 py-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-main)] flex items-center justify-between text-xs font-bold">
                                                            <MathDisplay content={item.answer} />
                                                            <span className="font-mono text-sky-600 dark:text-sky-400">
                                                                {item.pct}% ({item.count})
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null
                                    )}

                                    {/* Mob waiting during Challenger phase */}
                                    {!isMeChallenger && challengerState.phase === 'challenger_answering' && (
                                        <div className="p-6 text-center space-y-2">
                                            <Loader2 className="animate-spin text-amber-500 mx-auto" size={24} />
                                            <p className="text-xs font-bold">
                                                {lang === 'sv'
                                                    ? `Väntar på att ${challengerState.alias} ska låsa in sitt svar...`
                                                    : `Waiting for ${challengerState.alias} to lock in their answer...`}
                                            </p>
                                        </div>
                                    )}

                                    {/* Active Input when it's this student's turn */}
                                    {!hasAnsweredCurrent && (
                                        (!isMeChallenger && challengerState.phase === 'mob_answering') ||
                                        (isMeChallenger && challengerState.phase === 'challenger_answering')
                                    ) && (
                                        isMultipleChoice ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {options.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        disabled={isSubmitting}
                                                        onClick={() => handleYouVsClassAction(opt.id, true)}
                                                        className="p-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:border-emerald-600 font-bold text-xs flex items-center gap-2.5 cursor-pointer transition-all active:scale-[0.98]"
                                                    >
                                                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-mono text-xs flex items-center justify-center shrink-0">
                                                            {opt.id}
                                                        </span>
                                                        <MathDisplay content={String(opt.label)} />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <SmartMathInput
                                                    value={localAnswers[activeTargetKey] || ''}
                                                    onChange={(val) => setLocalAnswers(prev => ({ ...prev, [activeTargetKey]: val }))}
                                                    onSubmit={() => handleYouVsClassAction(localAnswers[activeTargetKey] || '', true)}
                                                    disabled={isSubmitting}
                                                    renderData={rd}
                                                />
                                                <button
                                                    type="button"
                                                    disabled={isSubmitting || !(localAnswers[activeTargetKey] || '').trim()}
                                                    onClick={() => handleYouVsClassAction(localAnswers[activeTargetKey] || '', true)}
                                                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-40"
                                                >
                                                    {lang === 'sv' ? 'Skicka Svar' : 'Submit Answer'}
                                                </button>
                                            </div>
                                        )
                                    )}

                                    {/* Confirmation once submitted */}
                                    {hasAnsweredCurrent && challengerState.phase !== 'reveal' && (
                                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200">
                                            <CheckCircle2 size={18} className="shrink-0" />
                                            <span className="text-xs font-bold">
                                                {lang === 'sv' ? 'Svar inskickat! Väntar på facit...' : 'Answer submitted! Waiting for reveal...'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : isFourCorners ? (

                    /* STATE 2A: FOUR CORNERS MATCHED SPLIT-STAGE VIEW */
                    <div className="w-full max-w-7xl h-full flex flex-col min-h-0 animate-in fade-in duration-150">
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 items-stretch">
                            
                            {/* LEFT STAGE: Prompt, Diagram Visual, Protected LaTeX */}
                            <div className="lg:col-span-7 bg-[var(--bg-card)] border-[var(--border-strong)] text-[var(--text-main)] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xl border overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs px-3 py-1 rounded-xl">
                                            {lang === 'sv' ? `Runda ${activeQuestion?.roundIndex || 1}` : `Round ${activeQuestion?.roundIndex || 1}`}
                                        </span>

                                        {isWordProblem && (
                                            <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-xl">
                                                {lang === 'sv' ? "Textuppgift" : "Word Problem"}
                                            </span>
                                        )}
                                    </div>

                                    {effectiveShowText && rd.description && (
                                        <div className="text-lg sm:text-xl font-bold text-[var(--text-main)] leading-relaxed">
                                            <MathDisplay content={rd.description} />
                                        </div>
                                    )}

                                    {showVisual && hasVisualElement && (
                                        <div className="whiteboard-protect w-full flex justify-center py-3 border border-[var(--border-main)] rounded-xl overflow-hidden shadow-2xs my-2 bg-[var(--bg-surface)]">
                                            <VisualRenderer 
                                                data={rd} 
                                                isWordProblem={isWordProblem} 
                                            />
                                        </div>
                                    )}

                                    {effectiveShowLatex && rd.latex && (
                                        <div className="bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] text-2xl sm:text-3xl font-serif font-bold p-5 rounded-xl border text-center my-3 shadow-inner">
                                            <MathDisplay content={`$$${rd.latex}$$`} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT STAGE: Either 4 Corners Input OR Snabbräknaren Drawer */}
                            <div className="lg:col-span-5 h-full flex flex-col min-h-[350px]">
                                {!hasAnsweredCurrent ? (
                                    <DynamicResponseInput
                                        question={activeQuestion}
                                        activityMode="activity_four_corners"
                                        revealedPhase={liveActiveData?.revealedPhase || 'commit'}
                                        onSubmit={handleSendAnswer}
                                        disabled={isSubmitting}
                                        lang={lang}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-150">
                                        <div className="p-4 rounded-xl border bg-[var(--bg-card)] border-[var(--border-strong)] text-[var(--text-main)] flex items-center justify-between shadow-2xs">
                                            <div className="flex items-center gap-2.5">
                                                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <div>
                                                    <p className="text-xs font-bold leading-tight">
                                                        {lang === 'sv' ? "Ditt svar är sparat!" : "Your answer is saved!"}
                                                    </p>
                                                    <p className="text-[10px] text-[var(--text-muted)]">
                                                        {lang === 'sv' ? "Väntar på att alla ska svara..." : "Waiting for classmates..."}
                                                    </p>
                                                </div>
                                            </div>

                                            {!autoPracticeEnabled && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAutoPracticeEnabled(true)}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs cursor-pointer"
                                                >
                                                    <Zap size={12} className="fill-current" />
                                                    <span>{lang === 'sv' ? "Räkna snabbt" : "Practice"}</span>
                                                </button>
                                            )}
                                        </div>

                                        {autoPracticeEnabled && (
                                            <div className="flex-1 min-h-0">
                                                <StudentQuickPracticeDrawer
                                                    isOpen={hasAnsweredCurrent}
                                                    sessionTopics={sessionTopics}
                                                    lang={lang}
                                                    onClose={() => setAutoPracticeEnabled(false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                        </div>
                    </div>

                ) : (

                    /* STATE 2B: CATEGORY CLASH MATRIX TILE VIEW */
                    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-in fade-in duration-150">
                        
                        {/* Question Card (Left 7 Cols) */}
                        <div className="lg:col-span-7 bg-[var(--bg-card)] text-[var(--text-main)] rounded-2xl p-6 sm:p-7 shadow-xl border border-[var(--border-strong)] flex flex-col space-y-5">
                            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-main)]">
                                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    {points} {lang === 'sv' ? "Poäng" : "Points"}
                                </span>
                                {isCompleted && (
                                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                                        <CheckCircle2 size={16} />
                                        <span>{lang === 'sv' ? "Svar inskickat" : "Answer submitted"}</span>
                                    </div>
                                )}
                            </div>
                            
                            {effectiveShowText && rd.description && (
                                <div className="text-lg sm:text-xl font-bold text-[var(--text-main)] leading-relaxed">
                                    <MathDisplay content={rd.description} />
                                </div>
                            )}

                            {showVisual && hasVisualElement && (
                                <div className="whiteboard-protect w-full flex justify-center py-2 border border-[var(--border-main)] rounded-xl overflow-hidden shadow-2xs bg-[var(--bg-surface)]">
                                    <VisualRenderer 
                                        data={rd} 
                                        isWordProblem={isWordProblem} 
                                    />
                                </div>
                            )}

                            {(effectiveShowLatex || (!rd.description && !hasVisualElement)) && rd.latex && (
                                <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-5 text-center text-2xl sm:text-3xl text-[var(--text-main)] font-serif font-bold shadow-inner">
                                    <MathDisplay content={`$$${rd.latex}$$`} />
                                </div>
                            )}

                            {isMultipleChoice && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                    {options.map((opt, i) => {
                                        const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                                        const choiceVal = String(typeof opt === 'object' ? opt.value : opt);
                                        const isSelected = currentAnswer === choiceVal;

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                disabled={isSubmitting || isCompleted}
                                                onClick={() => {
                                                    setLocalAnswers(prev => ({ ...prev, [activeTile]: choiceVal }));
                                                }}
                                                className={`p-3.5 rounded-xl border text-left font-bold text-xs transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                                                    isSelected 
                                                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-[var(--text-main)] shadow-2xs' 
                                                        : 'border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)]'
                                                } ${isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <MathDisplay content={String(choiceLabel)} />
                                                {isSelected && <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Solution & Input Pane (Right 5 Cols) */}
                        <div className="lg:col-span-5 bg-[var(--bg-card)] border-[var(--border-strong)] text-[var(--text-main)] rounded-2xl p-6 shadow-xl border flex flex-col space-y-4">
                            {!hasAnsweredCurrent ? (
                                <>
                                    {allowCanvas && allowScratchpad && (
                                        <div className="flex p-1 rounded-xl border bg-[var(--bg-surface)] border-[var(--border-strong)] mb-1">
                                            <button
                                                type="button"
                                                onClick={() => setActiveWorkTab('scratchpad')}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                    activeWorkTab === 'scratchpad' 
                                                        ? 'bg-[var(--bg-card)] shadow-2xs text-[var(--text-main)] font-extrabold' 
                                                        : 'text-[var(--text-muted)]'
                                                }`}
                                            >
                                                <Calculator size={13} />
                                                <span>{lang === 'sv' ? "Kladd" : "Scratchpad"}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveWorkTab('canvas')}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                    activeWorkTab === 'canvas' 
                                                        ? 'bg-[var(--bg-card)] shadow-2xs text-[var(--text-main)] font-extrabold' 
                                                        : 'text-[var(--text-muted)]'
                                                }`}
                                            >
                                                <PenTool size={13} />
                                                <span>{lang === 'sv' ? "Rita" : "Canvas"}</span>
                                            </button>
                                        </div>
                                    )}

                                    {allowCanvas && (activeWorkTab === 'canvas' || !allowScratchpad) && (
                                        <div className="w-full h-44 relative border border-[var(--border-strong)] rounded-xl overflow-hidden bg-[var(--bg-card)] shadow-inner">
                                            <InteractiveCanvas
                                                lang={lang}
                                                elements={localCanvas[activeTile] || []}
                                                setElements={(newEls) => setLocalCanvas(prev => ({
                                                    ...prev,
                                                    [activeTile]: typeof newEls === 'function' ? newEls(prev[activeTile] || []) : newEls
                                                }))}
                                                resolution={{ w: 1920, h: 1080 }}
                                                toolbarMode="student"
                                            />
                                        </div>
                                    )}

                                    {allowScratchpad && (activeWorkTab === 'scratchpad' || !allowCanvas) && (
                                        <MathScratchpad
                                            steps={localScratchpad[activeTile] || ['']}
                                            onChange={(newSteps) => setLocalScratchpad(prev => ({ ...prev, [activeTile]: newSteps }))}
                                            disabled={isSubmitting || isCompleted}
                                            lang={lang}
                                        />
                                    )}

                                    {!isMultipleChoice && (
                                        <div className="space-y-1.5 pt-1">
                                            <label className="text-xs font-bold text-[var(--text-muted)]">
                                                {lang === 'sv' ? "Ditt svar:" : "Your answer:"}
                                            </label>
                                            <SmartMathInput
                                                value={currentAnswer}
                                                onChange={(val) => setLocalAnswers(prev => ({ ...prev, [activeTile]: val }))}
                                                onSubmit={() => handleTileSubmit()}
                                                disabled={isSubmitting || isCompleted}
                                                inputType={activeQuestion?.inputType || activeQuestion?.answerType || rd?.answerType}
                                                renderData={rd}
                                            />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleTileSubmit()}
                                        disabled={isSubmitting || !currentAnswer.trim() || isCompleted}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs disabled:opacity-30 active:scale-[0.98] transition-all cursor-pointer"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : isCompleted ? (
                                            <>
                                                <CheckCircle2 size={16} />
                                                <span>{lang === 'sv' ? "Svar Inlämnat" : "Submitted"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={15} />
                                                <span>
                                                    {lang === 'sv' 
                                                        ? `Skicka in för ${myTeam?.name || 'laget'}` 
                                                        : `Submit for ${myTeam?.name || 'team'}`}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="w-full flex flex-col gap-3 animate-in fade-in duration-150">
                                    <div className="p-4 rounded-xl border bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] flex items-center justify-between shadow-2xs">
                                        <div className="flex items-center gap-2.5">
                                            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold leading-tight">
                                                    {lang === 'sv' ? "Svar inskickat för brickan!" : "Answer submitted for this tile!"}
                                                </p>
                                                <p className="text-[10px] text-[var(--text-muted)]">
                                                    {lang === 'sv' ? "Väntar på att läraren stänger brickan..." : "Waiting for teacher to close tile..."}
                                                </p>
                                            </div>
                                        </div>

                                        {!autoPracticeEnabled && (
                                            <button
                                                type="button"
                                                onClick={() => setAutoPracticeEnabled(true)}
                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs cursor-pointer"
                                            >
                                                <Zap size={13} className="fill-current" />
                                                <span>{lang === 'sv' ? "Räkna snabbt" : "Practice"}</span>
                                            </button>
                                        )}
                                    </div>

                                    {autoPracticeEnabled && (
                                        <div className="flex-1 min-h-0">
                                            <StudentQuickPracticeDrawer
                                                isOpen={hasAnsweredCurrent}
                                                sessionTopics={sessionTopics}
                                                lang={lang}
                                                onClose={() => setAutoPracticeEnabled(false)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                    </div>
                )}
            </main>
        </div>
    );
}