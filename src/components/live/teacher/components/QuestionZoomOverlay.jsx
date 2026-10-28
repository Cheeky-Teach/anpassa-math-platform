// src/components/live/teacher/components/QuestionZoomOverlay.jsx
import React, { useState } from 'react';
import { 
    X, ChevronLeft, ChevronRight, Users, Star, 
    Loader2, Sparkles, CheckCircle2, XCircle
} from 'lucide-react';
import VisualRenderer from '../../../visuals/VisualRenderer';
import MathDisplay from '../../../shared/MathDisplay';
import { extractDecodedAnswer } from '../../core/liveAnswerUtils';
import { supabase } from '../../../../lib/supabaseClient';
import { syncProgress } from '../../../../lib/progressSync';

export default function QuestionZoomOverlay({
    engine,
    zoomIndex,
    session,
    lang = 'sv',
    onClose,
    onNavigateZoom
}) {
    const {
        livePacket,
        responses,
        students,
        starredStudents,
        toggleStar,
        isComparing,
        setIsComparing,
        isAnonymous,
        showActualAnswers,
        setShowActualAnswers,
        handleRegenerateQuestion
    } = engine;

    const [isPushing, setIsPushing] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const question = livePacket[zoomIndex];
    if (!question) return null;

    const questionResponses = responses.filter(r => r.question_index === zoomIndex);
    const isPresentationMode = session?.active_question_data?.mode === 'presentation';
    const pacingMode = session?.active_question_data?.settings?.pacing || session?.settings?.pacing || 'open';
    const isTeacherLed = pacingMode === 'teacher';

    const handlePushToClass = async () => {
        if (!session?.id || isPushing) return;
        setIsPushing(true);
        try {
            syncProgress('live_teacher_pushed_question', { app_mode: 'teacher_live', target_question_index: zoomIndex });
            const payload = { current_question_index: zoomIndex };
            if (isPresentationMode || session?.current_slide_index !== undefined) payload.current_slide_index = zoomIndex;
            const { error } = await supabase.from('rooms').update(payload).eq('id', session.id);
            if (error) throw error;
        } catch (err) {
            console.error(err);
        } finally {
            setIsPushing(false);
        }
    };

    const hasDiagram = question.resolvedData?.renderData && (question.resolvedData.renderData.graph || question.resolvedData.renderData.geometry || question.resolvedData.renderData.pattern);

    return (
        <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center no-print animate-in fade-in duration-200">
            <div className="bg-[var(--bg-canvas,#020617)] text-[var(--text-main,#f8fafc)] w-full h-full flex flex-col overflow-hidden shadow-2xl">
                
                {/* Top Header Bar */}
                <div className="px-6 py-3 border-b border-[var(--border-main,#1e293b)] flex justify-between items-center bg-[var(--bg-card,#0f172a)] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-4 py-1.5 rounded-xl font-black italic text-xs tracking-tighter uppercase">
                            {lang === 'sv' ? "Uppgift" : "Question"} {zoomIndex + 1}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            {questionResponses.length}/{students.length} {lang === 'sv' ? "Svar" : "Answers"}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {starredStudents.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setIsComparing(!isComparing)}
                                className={`px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2 mr-2 cursor-pointer ${
                                    isComparing ? 'bg-amber-500 text-amber-950 border border-amber-600' : 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200'
                                }`}
                            >
                                <Star size={14} className={isComparing ? 'fill-amber-950' : 'fill-amber-500'} />
                                {lang === 'sv' ? `Jämför (${starredStudents.length})` : `Compare (${starredStudents.length})`}
                            </button>
                        )}

                        <button
                            type="button"
                            disabled={isRegenerating}
                            onClick={async () => {
                                if (window.confirm(lang === 'sv' ? "Generera ny variant och nollställ elevsvar?" : "Regenerate and clear answers?")) {
                                    setIsRegenerating(true);
                                    await handleRegenerateQuestion(zoomIndex);
                                    setIsRegenerating(false);
                                }
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {isRegenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                            <span className="hidden sm:inline">{lang === 'sv' ? "Generera om" : "Regenerate"}</span>
                        </button>

                        {isTeacherLed && !isComparing && (
                            <button
                                type="button"
                                onClick={handlePushToClass}
                                disabled={isPushing}
                                className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border border-amber-500 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2 mr-2 hover:scale-105 disabled:opacity-50 cursor-pointer"
                            >
                                {isPushing ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
                                {lang === 'sv' ? "Tvinga hit klassen" : "Push to Class"}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowActualAnswers(!showActualAnswers)}
                            className={`p-1.5 rounded-lg border transition-all shadow-sm cursor-pointer ${showActualAnswers ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                        >
                            <span className="text-[10px] font-black uppercase px-1">{lang === 'sv' ? "Facit" : "Key"}</span>
                        </button>

                        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 mx-2">
                            <button
                                type="button"
                                onClick={() => onNavigateZoom(Math.max(0, zoomIndex - 1))}
                                disabled={zoomIndex === 0}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                            ><ChevronLeft size={18} /></button>
                            <button
                                type="button"
                                onClick={() => onNavigateZoom(Math.min(livePacket.length - 1, zoomIndex + 1))}
                                disabled={zoomIndex === livePacket.length - 1}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                            ><ChevronRight size={18} /></button>
                        </div>

                        <button onClick={onClose} className="p-1.5 hover:bg-rose-500 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer">
                            <X size={24}/>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 shrink-0 relative text-slate-900">
                    {showActualAnswers && (
                        <div className="absolute top-1/2 -translate-y-1/2 right-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-lg font-black shadow-sm flex items-center gap-2">
                            <span className="opacity-60 uppercase text-[12px] tracking-widest">{lang === 'sv' ? "Facit" : "Key"}</span>
                            <span>{extractDecodedAnswer(question.resolvedData) || '-'}</span>
                        </div>
                    )}
                    <div className="text-lg font-bold leading-snug text-center max-w-4xl mx-auto">
                        <MathDisplay content={question.resolvedData?.renderData?.description || question.text} />
                        {question.resolvedData?.renderData?.latex && (
                            <div className="mt-2 text-2xl text-indigo-700 font-serif pt-2">
                                <MathDisplay content={`$$${question.resolvedData.renderData.latex}$$`} />
                            </div>
                        )}
                    </div>
                </div>

                {/* 🟢 RESTORED: Dual-Pane Layout */}
                <div className="flex-1 flex overflow-hidden w-full">
                    
                    {/* Left Pane: Diagram & Stats */}
                    {!isComparing && (
                        <div className="w-64 sm:w-80 p-6 flex flex-col border-r border-[var(--border-main)] overflow-y-auto shrink-0 bg-[var(--bg-card)] shadow-inner z-10">
                            
                            {hasDiagram && (
                                <div className="flex justify-center scale-90 origin-top mt-2 mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                                    <VisualRenderer 
                                        data={question.resolvedData.renderData} 
                                        isWordProblem={!!question.selectedStoryIndex} 
                                    />
                                </div>
                            )}

                            {/* Correct Students Box */}
                            <div className="bg-emerald-500 rounded-[1.5rem] p-4 text-white shadow-md flex flex-col mb-4 max-h-[40%]">
                                <div className="flex items-center gap-2 mb-2 opacity-90 shrink-0">
                                    <CheckCircle2 size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{lang === 'sv' ? "Antal Rätt" : "Correct"}</span>
                                </div>
                                <div className="text-2xl font-black mb-2 shrink-0">
                                    {questionResponses.filter(r => r.is_correct).length}
                                </div>
                                <div className="overflow-y-auto pr-1 custom-scrollbar text-[10px]">
                                    {questionResponses.filter(r => r.is_correct).map((r, idx) => (
                                        <div key={idx} className="py-1 border-b border-white/10 truncate font-bold">
                                            {isAnonymous ? `Elev ${idx + 1}` : r.student_alias}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Wrong Answers Frequency Box */}
                            <div className="bg-rose-500 rounded-[1.5rem] p-4 text-white shadow-md flex flex-col min-h-0">
                                <div className="flex items-center gap-2 mb-2 opacity-90 shrink-0">
                                    <XCircle size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{lang === 'sv' ? "Fel Svar" : "Errors"}</span>
                                </div>
                                <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                                    {(() => {
                                        const wrongAnswers = questionResponses.filter(r => !r.is_correct).map(r => r.answer);
                                        const freq = wrongAnswers.reduce((acc, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {});
                                        const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]);
                                        return sorted.length > 0 ? sorted.map(([ans, count]) => (
                                            <div key={ans} className="flex justify-between items-center bg-white/10 p-1.5 px-3 rounded-lg text-[10px]">
                                                <span className="font-black italic truncate mr-2">"{ans}"</span>
                                                <span className="font-bold opacity-80 shrink-0">{count} st</span>
                                            </div>
                                        )) : <span className="text-[10px] opacity-60 italic">{lang === 'sv' ? "Inga fel än" : "No errors"}</span>;
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right Pane: Student Work Grid */}
                    <div className="flex-1 p-6 bg-[var(--bg-canvas)] overflow-y-auto custom-scrollbar">
                        <div className={`grid gap-4 items-start content-start h-full ${
                            isComparing 
                                ? (starredStudents.length <= 2 ? 'grid-cols-2' : 'grid-cols-3') 
                                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        }`}>
                            {questionResponses
                                .filter(r => !isComparing || starredStudents.includes(r.student_alias))
                                .map((r, i) => (
                                    <div key={i} className={`bg-[var(--bg-card)] p-4 rounded-2xl border shadow-sm flex flex-col relative group/card transition-all ${
                                        starredStudents.includes(r.student_alias) ? 'border-amber-400 ring-2 ring-amber-100/50' : 'border-[var(--border-main)]'
                                    }`}>
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); toggleStar(r.student_alias); }}
                                            className={`absolute -top-3 -right-3 p-2 bg-white rounded-full border shadow-sm hover:scale-110 transition-all cursor-pointer ${
                                                starredStudents.includes(r.student_alias) ? 'border-amber-200 opacity-100' : 'border-slate-200 opacity-0 group-hover/card:opacity-100'
                                            }`}
                                        >
                                            <Star size={16} className={starredStudents.includes(r.student_alias) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'} />
                                        </button>

                                        <div className="flex justify-between items-center mb-3 border-b border-[var(--border-main)] pb-3">
                                            <span className="font-black text-sm text-[var(--text-main)]">{isAnonymous ? `Elev ${i + 1}` : r.student_alias}</span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                r.answerType === 'free_text' ? 'bg-blue-100 text-blue-700' : r.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {r.answerType === 'free_text' ? 'Text' : r.answer}
                                            </span>
                                        </div>
                                        
                                        <div className={`flex-1 space-y-2 text-[var(--text-main)] ${isComparing ? 'text-lg leading-relaxed' : 'text-sm'}`}>
                                            {r.work_steps && r.work_steps.map((line, lineIdx) => (
                                                <div key={lineIdx} className="overflow-x-auto custom-scrollbar pb-1 bg-[var(--bg-surface)] px-2 rounded">
                                                    <MathDisplay content={`$\\displaystyle ${line}$`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            
                            {questionResponses.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    {lang === 'sv' ? "Inga lösningar inskickade än." : "No answers submitted yet."}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}