// src/components/live/student/views/StudentActivityView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import MathDisplay from '../../../shared/MathDisplay';
import SmartMathInput from '../../../ui/SmartMathInput';
import MathScratchpad from '../../../ui/MathScratchpad';
import InteractiveCanvas from '../../../whiteboard/InteractiveCanvas';
import PreferencesToggle from '../../../ui/PreferencesToggle';
import VisualRenderer from '../../../visuals/VisualRenderer';
import { supabase } from '../../../../lib/supabaseClient';
import DynamicResponseInput from '../components/DynamicResponseInput';
import StudentQuickPracticeDrawer from '../../../activities/shared/StudentQuickPracticeDrawer';
import { 
    Send, CheckCircle2, Loader2, Trophy, 
    Calculator, PenTool, LogOut, Check, Zap
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

    // Extract board & question properties from live data
    const dimensions = liveActiveData?.board?.dimensions || liveActiveData?.settings?.dimensions || { columns: 4, rows: 4 };
    const activeTile = liveActiveData?.activeTile;

    // Correctly extract the question object from either activeQuestion or root payload
    const activeQuestion = liveActiveData?.activeQuestion || (isFourCorners && liveActiveData?.renderData ? liveActiveData : null);
    
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
        return syncedScore !== undefined ? syncedScore : localEarnedPoints;
    }, [liveActiveData?.studentScores, studentAlias, localEarnedPoints]);

    // Scratchpad & Canvas controls
    const settings = liveActiveData?.settings || {};
    const allowScratchpad = settings.allowScratchpad !== false;
    const allowCanvas = Boolean(settings.allowCanvas);
    const [activeWorkTab, setActiveWorkTab] = useState(allowCanvas && !allowScratchpad ? 'canvas' : 'scratchpad');

    // Local inputs for Category Clash active tile
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

    // Reset student answer input when teacher rolls new numbers or switches tile
    useEffect(() => {
        const targetKey = isFourCorners ? `round_${activeQuestion?.roundIndex || 0}` : activeTile;
        
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
        isFourCorners
    ]);

    const currentAnswer = localAnswers[activeTile] || '';
    const isCompleted = Boolean(localCompleted[activeTile]);

    const activeTargetKey = isFourCorners ? `round_${activeQuestion?.roundIndex || 0}` : activeTile;
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

    const isWaitingForQuestion = isFourCorners 
        ? (!activeQuestion || !activeQuestion.renderData) 
        : (!activeTile || !activeQuestion);

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
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                            <span>{isFourCorners ? '4 Hörn' : (myTeam?.name || (lang === 'sv' ? 'Individuellt' : 'Solo'))}</span>
                        </div>
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

                            {/* Opt-In Trigger Button */}
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

                            {teams.length > 0 && !isFourCorners && (
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

                        {/* Render Drawer directly below the waiting card when opted in */}
                        {autoPracticeEnabled && (
                            <StudentQuickPracticeDrawer
                                isOpen={isWaitingForQuestion}
                                sessionTopics={sessionTopics}
                                lang={lang}
                                onClose={() => setAutoPracticeEnabled(false)}
                            />
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
                            
                            {/* Question Text Prompt */}
                            {effectiveShowText && rd.description && (
                                <div className="text-lg sm:text-xl font-bold text-[var(--text-main)] leading-relaxed">
                                    <MathDisplay content={rd.description} />
                                </div>
                            )}

                            {/* Diagram / Visual Geometry */}
                            {showVisual && hasVisualElement && (
                                <div className="whiteboard-protect w-full flex justify-center py-2 border border-[var(--border-main)] rounded-xl overflow-hidden shadow-2xs bg-[var(--bg-surface)]">
                                    <VisualRenderer 
                                        data={rd} 
                                        isWordProblem={isWordProblem} 
                                    />
                                </div>
                            )}

                            {/* LaTeX Display */}
                            {(effectiveShowLatex || (!rd.description && !hasVisualElement)) && rd.latex && (
                                <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-5 text-center text-2xl sm:text-3xl text-[var(--text-main)] font-serif font-bold shadow-inner">
                                    <MathDisplay content={`$$${rd.latex}$$`} />
                                </div>
                            )}

                            {/* Multiple Choice Alternatives */}
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
                                    {/* Work Area Tabs */}
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

                                    {/* Workspaces */}
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

                                    {/* Free-Response Answer Input */}
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

                                    {/* Submit Button */}
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
                                /* Answer Submitted: Confirmation Banner + Snabbräknaren Drawer */
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