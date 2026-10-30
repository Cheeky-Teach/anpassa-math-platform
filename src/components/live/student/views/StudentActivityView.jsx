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
    // 🟢 1. Dedicated live state for room data so teacher clicks force instant re-render
    const roomId = engine?.session?.id || initialSession?.id;
    const initialActiveData = engine?.session?.active_question_data || initialSession?.active_question_data || {};
    
    const [liveActiveData, setLiveActiveData] = useState(initialActiveData);

    // 🟢 2. Direct real-time room listener (Bypasses any parent memoization/prop lag)
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

    // 🟢 Correctly extract the question object from either activeQuestion or root payload
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

    // 🟢 Snabbräknaren: Sticky opt-in state across rounds
    const [autoPracticeEnabled, setAutoPracticeEnabled] = useState(false);

    // 🟢 Extract active topics from room packet/categories for Snabbräknaren
    const sessionTopics = useMemo(() => {
        // 1. Four Corners / Playlist packets
        if (Array.isArray(liveActiveData?.packet)) {
            return [...new Set(liveActiveData.packet.map(q => q.topicId).filter(Boolean))];
        }
        // 2. Category Clash / Board packets
        if (liveActiveData?.board?.categories || liveActiveData?.settings?.categories) {
            const cats = liveActiveData?.board?.categories || liveActiveData?.settings?.categories || [];
            return [...new Set(cats.map(c => c.topic).filter(Boolean))];
        }
        // 3. Fallback to current question's topic
        if (activeQuestion?.topicId) {
            return [activeQuestion.topicId];
        }
        return ['basic_arithmetic'];
    }, [liveActiveData, activeQuestion]);

    // 🟢 3. Reset student answer input when teacher rolls new numbers or switches tile
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

    // 🟢 Target key for the currently active prompt
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

    // 🟢 HANDLER 1: For Four Corners & DynamicResponseInput
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

            // 🟢 Record that current round is completed locally to trigger the drawer
            const targetKey = `round_${activeQuestion?.roundIndex || 0}`;
            setLocalCompleted(prev => ({ ...prev, [targetKey]: true }));
        } catch (err) {
            console.error("[StudentActivityView] Four Corners submit error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🟢 HANDLER 2: For Category Clash Matrix Tiles
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
        } catch (err) {
            console.error("[StudentActivityView] Submit error:", err);
            alert(lang === 'sv' ? "Kunde inte skicka svar." : "Failed to submit answer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if waiting state should be displayed
    const isWaitingForQuestion = isFourCorners 
        ? (!activeQuestion || !activeQuestion.renderData) 
        : (!activeTile || !activeQuestion);

    return (
        <div className="min-h-screen bg-[var(--bg-canvas,#020617)] text-[var(--text-main,#f8fafc)] flex flex-col font-sans select-none">
            
            {/* Top Bar */}
            <header className="bg-[var(--bg-card,#0f172a)] border-b border-[var(--border-main,#1e293b)] px-4 py-2.5 sticky top-0 z-50 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    {teams.length > 1 ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 shadow-xs">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: myTeam?.color }} />
                            <select
                                value={selectedTeamId}
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                                className="bg-transparent text-xs font-black uppercase text-slate-200 outline-none cursor-pointer"
                            >
                                {teams.map(t => (
                                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
                            <span>{isFourCorners ? '4 Hörn' : (myTeam?.name || (lang === 'sv' ? 'Individuellt' : 'Solo'))}</span>
                        </div>
                    )}

                    <span className="text-xs font-mono font-bold text-slate-400">
                        {studentAlias}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <PreferencesToggle />
                    <button
                        type="button"
                        onClick={onBack}
                        className="p-2 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
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
                        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center text-amber-400 mb-6 shadow-inner">
                                <Trophy size={40} />
                            </div>
                            
                            <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white mb-2">
                                {lang === 'sv' ? "Väntar på nästa uppgift..." : "Waiting for next question..."}
                            </h2>
                            
                            <p className="text-sm font-medium text-slate-400 mb-6 max-w-md">
                                {lang === 'sv' 
                                    ? "Läraren förbereder nästa runda på storskärmen. Håll dig redo!" 
                                    : "The teacher is setting up the next round on the board. Get ready!"}
                            </p>

                            {/* 🟢 Opt-In Trigger Button */}
                            {!autoPracticeEnabled ? (
                                <button
                                    type="button"
                                    onClick={() => setAutoPracticeEnabled(true)}
                                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-950/40 active:scale-95 transition-all cursor-pointer"
                                >
                                    <Zap size={16} className="fill-current" />
                                    <span>{lang === 'sv' ? "Starta Snabbräknare (Medan du väntar)" : "Start Quick Practice (While waiting)"}</span>
                                </button>
                            ) : null}

                            {teams.length > 0 && !isFourCorners && (
                                <div className="w-full bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-2.5 mt-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                                        {lang === 'sv' ? "Aktuell Ställning" : "Current Standings"}
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {teams.map(t => (
                                            <div key={t.id} className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                                                    <span className="text-xs font-bold text-slate-300">{t.name}</span>
                                                </div>
                                                <span className="text-xs font-black text-amber-300 font-mono">{t.score}p</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 🟢 Render Drawer directly below the waiting card when opted in */}
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

                    /* 🟢 STATE 2A: FOUR CORNERS MATCHED SPLIT-STAGE VIEW */
                    <div className="w-full max-w-7xl h-full flex flex-col min-h-0 animate-in fade-in duration-300">
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 items-stretch">
                            
                            {/* LEFT STAGE (7 Cols / ~58%): Prompt, Diagram Visual, Protected LaTeX */}
                            <div 
                                className="lg:col-span-7 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl border overflow-y-auto custom-scrollbar"
                                style={{ 
                                    backgroundColor: 'var(--bg-card, #ffffff)', 
                                    borderColor: 'var(--border-main, #e2e8f0)',
                                    color: 'var(--text-main, #0f172a)'
                                }}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="badge-brand font-black text-xs px-3 py-1">
                                            {lang === 'sv' ? `Runda ${activeQuestion?.roundIndex || 1}` : `Round ${activeQuestion?.roundIndex || 1}`}
                                        </span>

                                        {isWordProblem && (
                                            <span className="badge-brand theme-amber text-[10px]">
                                                {lang === 'sv' ? "Textuppgift" : "Word Problem"}
                                            </span>
                                        )}
                                    </div>

                                    {effectiveShowText && rd.description && (
                                        <div className="text-xl sm:text-2xl font-bold leading-relaxed">
                                            <MathDisplay content={rd.description} />
                                        </div>
                                    )}

                                    {showVisual && hasVisualElement && (
                                        <div className="whiteboard-protect w-full flex justify-center py-3 border border-slate-200 rounded-2xl overflow-hidden shadow-xs my-2">
                                            <VisualRenderer 
                                                data={rd} 
                                                isWordProblem={isWordProblem} 
                                            />
                                        </div>
                                    )}

                                    {effectiveShowLatex && rd.latex && (
                                        <div 
                                            className="text-3xl sm:text-4xl font-serif font-black p-6 rounded-2xl border text-center my-3 shadow-inner"
                                            style={{ 
                                                backgroundColor: 'var(--bg-surface, #f8fafc)', 
                                                borderColor: 'var(--border-main, #e2e8f0)', 
                                                color: 'var(--brand-solid, #4f46e5)' 
                                            }}
                                        >
                                            <MathDisplay content={`$$${rd.latex}$$`} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT STAGE (5 Cols / ~42%): Either 4 Corners Input OR Snabbräknaren Drawer */}
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
                                    <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300">
                                        <div 
                                            className="p-4 rounded-2xl border flex items-center justify-between shadow-sm"
                                            style={{
                                                backgroundColor: 'var(--bg-card, #ffffff)',
                                                borderColor: 'var(--border-main, #e2e8f0)',
                                                color: 'var(--text-main, #0f172a)'
                                            }}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                                <div>
                                                    <p className="text-xs font-bold leading-tight">
                                                        {lang === 'sv' ? "Ditt svar är sparat!" : "Your answer is saved!"}
                                                    </p>
                                                    <p className="text-[10px]" style={{ color: 'var(--text-muted, #64748b)' }}>
                                                        {lang === 'sv' ? "Väntar på att alla ska svara..." : "Waiting for classmates..."}
                                                    </p>
                                                </div>
                                            </div>

                                            {!autoPracticeEnabled && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAutoPracticeEnabled(true)}
                                                    className="btn-brand px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer"
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
                    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-in fade-in duration-300">
                        
                        {/* Question Card (Left 7 Cols) */}
                        <div className="lg:col-span-7 bg-white text-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-200 flex flex-col space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-amber-500/10 text-amber-600 rounded-lg">
                                    {points} {lang === 'sv' ? "Poäng" : "Points"}
                                </span>
                                {isCompleted && (
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                        <CheckCircle2 size={16} />
                                        <span>{lang === 'sv' ? "Svar inskickat" : "Answer submitted"}</span>
                                    </div>
                                )}
                            </div>

                            {/* Diagram / Visual Geometry */}
                            {showVisual && hasVisualElement && (
                                <div className="whiteboard-protect w-full flex justify-center py-2 border border-slate-100 rounded-2xl overflow-hidden drop-shadow-xs">
                                    <VisualRenderer 
                                        data={rd} 
                                        isWordProblem={isWordProblem} 
                                    />
                                </div>
                            )}

                            {/* Question Text Prompt */}
                            {effectiveShowText && rd.description && (
                                <div className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed">
                                    <MathDisplay content={rd.description} />
                                </div>
                            )}

                            {/* LaTeX Display */}
                            {(effectiveShowLatex || (!rd.description && !hasVisualElement)) && rd.latex && (
                                <div className="w-full bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-6 text-center text-2xl sm:text-3xl text-indigo-700 font-serif">
                                    <MathDisplay content={`$$${rd.latex}$$`} />
                                </div>
                            )}

                            {/* Multiple Choice Alternatives */}
                            {isMultipleChoice && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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
                                                className={`p-4 rounded-2xl border-2 text-left font-bold text-base transition-all flex items-center justify-between cursor-pointer active:scale-95 ${
                                                    isSelected 
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-400' 
                                                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                                                } ${isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <MathDisplay content={String(choiceLabel)} />
                                                {isSelected && <Check size={18} className="text-indigo-600 shrink-0 ml-2" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Solution & Input Pane (Right 5 Cols) */}
                        <div 
                            className="lg:col-span-5 rounded-[2rem] p-6 shadow-xl border flex flex-col space-y-4"
                            style={{
                                backgroundColor: 'var(--bg-card, #ffffff)',
                                borderColor: 'var(--border-main, #e2e8f0)',
                                color: 'var(--text-main, #0f172a)'
                            }}
                        >
                            {!hasAnsweredCurrent ? (
                                <>
                                    {/* Work Area Tabs */}
                                    {allowCanvas && allowScratchpad && (
                                        <div 
                                            className="flex p-1 rounded-xl border mb-2"
                                            style={{
                                                backgroundColor: 'var(--bg-surface, #f8fafc)',
                                                borderColor: 'var(--border-main, #e2e8f0)'
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setActiveWorkTab('scratchpad')}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                    activeWorkTab === 'scratchpad' 
                                                        ? 'bg-[var(--bg-card,#ffffff)] shadow-xs text-[var(--text-main,#0f172a)]' 
                                                        : 'text-[var(--text-muted,#64748b)]'
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
                                                        ? 'bg-[var(--bg-card,#ffffff)] shadow-xs text-[var(--text-main,#0f172a)]' 
                                                        : 'text-[var(--text-muted,#64748b)]'
                                                }`}
                                            >
                                                <PenTool size={13} />
                                                <span>{lang === 'sv' ? "Rita" : "Canvas"}</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Workspaces */}
                                    {allowCanvas && (activeWorkTab === 'canvas' || !allowScratchpad) && (
                                        <div className="w-full h-48 relative border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-[#f9fbf7]">
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
                                        <div className="space-y-1.5 pt-2">
                                            <label className="text-xs font-bold" style={{ color: 'var(--text-muted, #64748b)' }}>
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
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-30 active:scale-95 transition-all cursor-pointer"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : isCompleted ? (
                                            <>
                                                <CheckCircle2 size={18} />
                                                <span>{lang === 'sv' ? "Svar Inlämnat" : "Submitted"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} />
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
                                <div className="w-full flex flex-col gap-3 animate-in fade-in duration-300">
                                    <div 
                                        className="p-4 rounded-2xl border flex items-center justify-between shadow-xs"
                                        style={{
                                            backgroundColor: 'var(--bg-surface, #f8fafc)',
                                            borderColor: 'var(--border-main, #e2e8f0)'
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-inherit">
                                                    {lang === 'sv' ? "Svar inskickat för brickan!" : "Answer submitted for this tile!"}
                                                </p>
                                                <p className="text-[10px]" style={{ color: 'var(--text-muted, #64748b)' }}>
                                                    {lang === 'sv' ? "Väntar på att läraren stänger brickan..." : "Waiting for teacher to close tile..."}
                                                </p>
                                            </div>
                                        </div>

                                        {!autoPracticeEnabled && (
                                            <button
                                                type="button"
                                                onClick={() => setAutoPracticeEnabled(true)}
                                                className="btn-brand px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer"
                                            >
                                                <Zap size={12} className="fill-current" />
                                                <span>{lang === 'sv' ? "Räkna snabbt" : "Practice"}</span>
                                            </button>
                                        )}
                                    </div>

                                    {autoPracticeEnabled && (
                                        <StudentQuickPracticeDrawer
                                            isOpen={hasAnsweredCurrent}
                                            sessionTopics={sessionTopics}
                                            lang={lang}
                                            onClose={() => setAutoPracticeEnabled(false)}
                                        />
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