// src/components/live/student/views/StudentActivityView.jsx
import React, { useState, useEffect } from 'react';
import MathDisplay from '../../../shared/MathDisplay';
import SmartMathInput from '../../../ui/SmartMathInput';
import MathScratchpad from '../../../ui/MathScratchpad';
import InteractiveCanvas from '../../../whiteboard/InteractiveCanvas';
import PreferencesToggle from '../../../ui/PreferencesToggle';
import VisualRenderer from '../../../visuals/VisualRenderer';
import { supabase } from '../../../../lib/supabaseClient';
import { 
    Send, CheckCircle2, Loader2, Trophy, 
    Calculator, PenTool, LogOut, Check
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

        // Fetch latest state immediately on mount
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

    // Extract board properties from live data
    const dimensions = liveActiveData?.board?.dimensions || liveActiveData?.settings?.dimensions || { columns: 4, rows: 4 };
    const activeTile = liveActiveData?.activeTile;
    const activeQuestion = liveActiveData?.activeQuestion;
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

    // Local inputs for the active tile
    const [localAnswers, setLocalAnswers] = useState({});
    const [localCompleted, setLocalCompleted] = useState({});
    const [localScratchpad, setLocalScratchpad] = useState({});
    const [localCanvas, setLocalCanvas] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🟢 3. Reset student answer input when teacher rolls new numbers or switches tile
    useEffect(() => {
        if (activeTile) {
            setLocalAnswers(prev => ({ ...prev, [activeTile]: '' }));
            setLocalCompleted(prev => {
                const next = { ...prev };
                delete next[activeTile];
                return next;
            });
            setIsSubmitting(false);
        }
    }, [activeTile, activeQuestion?.regenVersion]);

    const currentAnswer = localAnswers[activeTile] || '';
    const isCompleted = Boolean(localCompleted[activeTile]);

    // Render Data extraction
    const rd = activeQuestion?.resolvedData?.renderData || activeQuestion?.renderData || {};
    const options = rd?.options && Array.isArray(rd.options) ? rd.options : null;
    const isMultipleChoice = Boolean(options && options.length > 0);

    const isWordProblem = Boolean(
        activeQuestion?.wordProblem || 
        rd?.isWordProblemApplied || 
        activeQuestion?.resolvedData?.metadata?.isWordProblemApplied
    );

    const hasVisualElement = Boolean(
        rd?.geometry || rd?.graph || rd?.pattern || rd?.marbles || rd?.visualType || rd?.diagram
    );
    const showVisual = activeQuestion?.showVisual !== false;

    // Tile Answer Submit Handler
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
            const teamPrefix = myTeam?.id ? `[${myTeam.id}] ` : '';
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

    return (
        <div className="min-h-screen bg-[var(--bg-canvas,#020617)] text-[var(--text-main,#f8fafc)] flex flex-col font-sans select-none">
            
            {/* Top Bar */}
            <header className="bg-[var(--bg-card,#0f172a)] border-b border-[var(--border-main,#1e293b)] px-4 py-2.5 sticky top-0 z-50 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    {teams.length > 0 && (
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
                
                {/* STATE 1: WAITING FOR TEACHER TO OPEN A TILE */}
                {!activeTile || !activeQuestion ? (
                    <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center text-amber-400 mb-6 shadow-inner">
                            <Trophy size={40} />
                        </div>
                        
                        <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white mb-2">
                            {lang === 'sv' ? "Väntar på nästa bricka..." : "Waiting for next question..."}
                        </h2>
                        
                        <p className="text-sm font-medium text-slate-400 mb-8 max-w-md">
                            {lang === 'sv' 
                                ? "Läraren väljer kategori och poängnivå på storskärmen. Håll dig redo!" 
                                : "The teacher is picking a topic and tier on the board. Get ready!"}
                        </p>

                        {teams.length > 0 && (
                            <div className="w-full bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-2.5">
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
                ) : (

                    /* STATE 2: ACTIVE QUESTION SOLVING STAGE */
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
                                <div className="w-full flex justify-center py-2 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden drop-shadow-xs">
                                    <VisualRenderer 
                                        data={rd} 
                                        isWordProblem={isWordProblem} 
                                    />
                                </div>
                            )}

                            {/* Question Text Prompt */}
                            {rd.description && (
                                <div className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed">
                                    <MathDisplay content={rd.description} />
                                </div>
                            )}

                            {/* LaTeX Display */}
                            {rd.latex && activeQuestion?.showLatex !== false && (
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
                        <div className="lg:col-span-5 bg-white text-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-200 flex flex-col space-y-4">
                            
                            {/* Work Area Tabs */}
                            {allowCanvas && allowScratchpad && (
                                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveWorkTab('scratchpad')}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                            activeWorkTab === 'scratchpad' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                                        }`}
                                    >
                                        <Calculator size={13} />
                                        <span>{lang === 'sv' ? "Kladd" : "Scratchpad"}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveWorkTab('canvas')}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                            activeWorkTab === 'canvas' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                                        }`}
                                    >
                                        <PenTool size={13} />
                                        <span>{lang === 'sv' ? "Rita" : "Canvas"}</span>
                                    </button>
                                </div>
                            )}

                            {/* Workspaces */}
                            {allowCanvas && (activeWorkTab === 'canvas' || !allowScratchpad) && (
                                <div className="w-full h-48 relative border-2 border-slate-200 rounded-2xl overflow-hidden bg-[#f9fbf7]">
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
                                    <label className="text-xs font-bold text-slate-500">
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
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}