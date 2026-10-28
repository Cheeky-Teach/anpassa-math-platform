// src/components/live/student/views/StudentActivityView.jsx
import React, { useState } from 'react';
import MathDisplay from '../../../shared/MathDisplay';
import SmartMathInput from '../../../ui/SmartMathInput';
import MathScratchpad from '../../../ui/MathScratchpad';
import InteractiveCanvas from '../../../whiteboard/InteractiveCanvas';
import PreferencesToggle from '../../../ui/PreferencesToggle';
import { 
    Send, CheckCircle2, Loader2, Trophy, 
    Calculator, PenTool, Maximize2, Minimize2, LogOut, Sparkles 
} from 'lucide-react';

export default function StudentActivityView({
    engine,
    session,
    studentAlias,
    lang = 'sv',
    onBack
}) {
    const {
        answers, setAnswers,
        completed,
        scratchpad, setScratchpad,
        canvasElements, setCanvasElements,
        isSubmitting,
        submitAnswer
    } = engine;

    const activeQuestionData = session?.active_question_data || {};
    const activeTile = activeQuestionData?.activeTile;
    const activeQuestion = activeQuestionData?.activeQuestion;
    const points = activeQuestionData?.points || 100;
    const teams = activeQuestionData?.teams || [];
    const teamAssignments = activeQuestionData?.studentTeamAssignments || {};
    const myTeamId = teamAssignments[studentAlias] || teams[0]?.id;
    const myTeam = teams.find(t => t.id === myTeamId);

    // Scratchpad & Canvas controls from session settings
    const settings = activeQuestionData?.settings || {};
    const allowScratchpad = settings.allowScratchpad !== false;
    const allowCanvas = Boolean(settings.allowCanvas);
    const [activeWorkTab, setActiveWorkTab] = useState(allowCanvas && !allowScratchpad ? 'canvas' : 'scratchpad');
    const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);

    // Current answer for active tile
    const currentAnswer = answers[activeTile] || '';
    const isCompleted = Boolean(completed[activeTile]);

    // Render Data extraction
    const rd = activeQuestion?.resolvedData?.renderData || activeQuestion?.renderData || {};
    const isMultipleChoice = rd?.answerType === 'multiple_choice' || (rd?.options && Array.isArray(rd.options));

    return (
        <div className="min-h-screen bg-[var(--bg-canvas,#020617)] text-[var(--text-main,#f8fafc)] flex flex-col font-sans select-none">
            
            {/* Top Bar: Team Badge, Code & Exit */}
            <header className="bg-[var(--bg-card,#0f172a)] border-b border-[var(--border-main,#1e293b)] px-4 py-2.5 sticky top-0 z-50 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    {myTeam ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 shadow-xs">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: myTeam.color }} />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                                {myTeam.name}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
                            {session?.title || "Poängjakten"}
                        </span>
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
                
                {/* 🟢 STATE 1: WAITING FOR TEACHER TO PICK A TILE */}
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

                        {/* Live Scoreboard Preview */}
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

                    /* 🟢 STATE 2: ACTIVE QUESTION SOLVING STAGE */
                    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        
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

                            {/* Question Prompt */}
                            <div className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed">
                                <MathDisplay content={rd.description || activeQuestion.text || activeQuestion.prompt || "Lös uppgiften:"} />
                            </div>

                            {/* LaTeX Display */}
                            {rd.latex && activeQuestion.showLatex !== false && (
                                <div className="w-full bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-6 text-center text-2xl sm:text-3xl text-indigo-700 font-serif">
                                    <MathDisplay content={`$$${rd.latex}$$`} />
                                </div>
                            )}
                        </div>

                        {/* Solution & Input Pane (Right 5 Cols) */}
                        <div className="lg:col-span-5 bg-white text-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-200 flex flex-col space-y-4">
                            
                            {/* Work Area Tabs (Canvas vs Scratchpad) */}
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
                                        elements={canvasElements[activeTile] || []}
                                        setElements={(newEls) => setCanvasElements(prev => ({
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
                                    steps={scratchpad[activeTile] || ['']}
                                    onChange={(newSteps) => setScratchpad(prev => ({ ...prev, [activeTile]: newSteps }))}
                                    disabled={isSubmitting || isCompleted}
                                    lang={lang}
                                />
                            )}

                            {/* Smart Answer Input */}
                            <div className="space-y-1.5 pt-2">
                                <label className="text-xs font-bold text-slate-500">
                                    {lang === 'sv' ? "Ditt svar:" : "Your answer:"}
                                </label>
                                <SmartMathInput
                                    value={currentAnswer}
                                    onChange={(val) => setAnswers(prev => ({ ...prev, [activeTile]: val }))}
                                    onSubmit={() => submitAnswer(activeTile)}
                                    disabled={isSubmitting || isCompleted}
                                    inputType={activeQuestion?.inputType || activeQuestion?.answerType || rd?.answerType}
                                    renderData={rd}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="button"
                                onClick={() => submitAnswer(activeTile)}
                                disabled={isSubmitting || !currentAnswer || isCompleted}
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
                                        <span>{lang === 'sv' ? "Skicka in till laget" : "Submit for team"}</span>
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