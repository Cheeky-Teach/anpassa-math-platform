// src/components/live/teacher/components/ClassMatrixTable.jsx
import React from 'react';
import { UserX, MessageSquare, Maximize2 } from 'lucide-react';

export default function ClassMatrixTable({
    engine,
    session,
    activeIndices,
    onOpenZoom,
    onOpenSpotlight,
    onOpenFreeText,
    onKick,
    lang = 'sv',
}) {
    const {
        students,
        livePacket,
        responses,
        questionStats,
        isAnonymous,
        hideCorrectness,
        showActualAnswers,
        handleManualOverride
    } = engine;

    const isPresentationMode = session?.active_question_data?.mode === 'presentation';
    const activeSlideIndex = session?.current_slide_index || 0;

    // 🟢 Exact status color mapper with high-contrast borders & shadows
    const getStatusColor = (isCorrect, answered, answerText, answerType) => {
        if (!answered) return 'bg-slate-200 dark:bg-slate-800 opacity-30';
        if (answerType === 'free_text') return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)] text-white';
        if (hideCorrectness) return 'bg-indigo-500 text-white';
        if (answerText === '[TIMEOUT]') return 'bg-slate-800 text-slate-100 shadow-[0_0_8px_rgba(30,41,59,0.3)]';
        return isCorrect 
            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)] text-white' 
            : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)] text-white';
    };

    return (
        <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
            <thead className="sticky top-0 z-10 shadow-sm">
                {/* Accuracy Percentage Bars */}
                <tr className="bg-[var(--bg-surface)] border-b border-[var(--border-main)]">
                    <th className="p-3 w-48 bg-[var(--bg-surface-hover)] border-r border-[var(--border-main)]">
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            {lang === 'sv' ? "Klassens resultat" : "Class results"}
                        </span>
                    </th>
                    <th className="p-3 w-20 border-r border-[var(--border-main)] bg-[var(--bg-surface-hover)]"></th>
                    {activeIndices.map((qIdx) => {
                        const targetItem = livePacket[qIdx];
                        const isFreeText = targetItem?.answerType === 'free_text' || (!targetItem && isPresentationMode);
                        const stats = questionStats[qIdx] || { correctPct: 0, wrongPct: 0, remaining: 0 };
                        const qResponses = responses.filter(r => 
                            r.question_index === qIdx || 
                            (r.is_slide_submission && r.question_index === activeSlideIndex)
                        );

                        return (
                            <th key={`stat-${qIdx}`} className="p-1.5 border-r border-[var(--border-main)] align-bottom">
                                <div className="w-full h-12 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden flex flex-col-reverse relative group cursor-help">
                                    {!isFreeText ? (
                                        <>
                                            <div style={{ height: `${stats.correctPct}%` }} className="bg-emerald-500 transition-all duration-500" />
                                            <div style={{ height: `${stats.wrongPct}%` }} className="bg-rose-500 transition-all duration-500" />
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-900/90 flex items-center justify-center transition-opacity">
                                                <span className="text-[9px] text-white font-black">{Math.round(stats.correctPct)}%</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div 
                                            style={{ height: `${students.length > 0 ? Math.min(100, (qResponses.length / students.length) * 100) : 0}%` }} 
                                            className="bg-indigo-500 transition-all duration-500 opacity-60" 
                                        />
                                    )}
                                </div>
                            </th>
                        );
                    })}
                </tr>

                {/* Column Headers */}
                <tr className="bg-[var(--bg-surface-hover)] border-b border-[var(--border-main)] text-[var(--text-main)]">
                    <th className="p-3 w-48 text-[9px] font-black uppercase tracking-widest border-r border-[var(--border-main)] text-[var(--text-main)]">
                        {lang === 'sv' ? "Elev" : "Student"}
                    </th>
                    <th className="p-3 w-20 text-[9px] font-black uppercase tracking-widest text-center border-r border-[var(--border-main)] text-[var(--text-main)]">
                        {lang === 'sv' ? "Klar" : "Done"}
                    </th>
                    {activeIndices.map((qIdx) => {
                        const targetItem = livePacket[qIdx];
                        const isCanvasSlideOnly = !targetItem && isPresentationMode;

                        return (
                            <th key={`head-${qIdx}`} className="p-0 border-r border-[var(--border-main)] transition-colors hover:bg-[var(--theme-indigo-bg,rgba(99,102,241,0.1))] group/col">
                                <button 
                                    type="button"
                                    onClick={() => { if (targetItem) onOpenZoom(qIdx); }} 
                                    className={`w-full h-full py-2 flex flex-col items-center justify-center gap-1 cursor-pointer ${targetItem ? 'cursor-zoom-in' : 'cursor-default'}`}
                                >
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover/col:text-indigo-500 transition-colors">
                                            {isCanvasSlideOnly ? `Slide ${activeSlideIndex + 1}` : `Q${qIdx + 1}`}
                                        </span>
                                        {targetItem && <Maximize2 size={10} className="text-indigo-500 opacity-0 group-hover/col:opacity-100 transition-opacity" />}
                                    </div>
                                </button>
                            </th>
                        );
                    })}
                </tr>
            </thead>

            {/* Student Rows */}
            <tbody className="divide-y divide-[var(--border-subtle)]">
                {students.map((student, sIdx) => {
                    const studentResps = responses.filter(r => r.student_alias === student);
                    const progress = Math.round((studentResps.length / Math.max(1, livePacket.length)) * 100);

                    return (
                        <tr key={student} className="hover:bg-[var(--bg-surface)] transition-colors group/row">
                            <td className="p-2 border-r border-[var(--border-subtle)] font-bold text-xs truncate flex items-center justify-between text-[var(--text-main)]">
                                <span>{isAnonymous ? `Elev ${sIdx + 1}` : student}</span>
                                <button 
                                    type="button"
                                    onClick={() => onKick(student)} 
                                    className="opacity-0 group-hover/row:opacity-100 p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                                >
                                    <UserX size={14} />
                                </button>
                            </td>

                            <td className="p-2 border-r border-[var(--border-subtle)] text-center">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${progress >= 100 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)]'}`}>
                                    {Math.min(100, progress)}%
                                </span>
                            </td>

                            {activeIndices.map((qIdx) => {
                                const targetItem = livePacket[qIdx];
                                const resp = responses.find(r => 
                                    r.student_alias === student && 
                                    (r.question_index === qIdx || (r.is_slide_submission && r.question_index === activeSlideIndex))
                                );

                                const isFreeText = targetItem?.answerType === 'free_text';
                                const hasCanvasData = resp?.canvas_state && Array.isArray(resp.canvas_state) && resp.canvas_state.length > 0;
                                const isSlideCanvasOnly = resp?.answer === '[CANVAS_SUBMISSION]' || resp?.is_slide_submission || hasCanvasData;

                                return (
                                    <td 
                                        key={`cell-${sIdx}-${qIdx}`} 
                                        className="p-1 border-r border-[var(--border-subtle)]"
                                        onClick={() => {
                                            if (!resp) return;
                                            if (hasCanvasData) {
                                                onOpenSpotlight(resp);
                                            } else if (isFreeText) {
                                                onOpenFreeText(qIdx, student);
                                            } else {
                                                handleManualOverride(resp.id, resp.is_correct);
                                            }
                                        }}
                                    >
                                        <div 
                                            title={resp ? (hasCanvasData ? "Klicka för att se tavla" : isFreeText ? "Klicka för att läsa svar" : `Svar: ${resp.answer}`) : 'Inget svar'}
                                            className={`w-full h-8 rounded-md transition-all duration-200 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-95 active:scale-90 ${
                                                getStatusColor(
                                                    resp?.is_correct, 
                                                    Boolean(resp), 
                                                    resp?.answer, 
                                                    isSlideCanvasOnly ? 'free_text' : (targetItem?.answerType || 'standard')
                                                )
                                            }`}
                                        >
                                            {showActualAnswers && resp && (
                                                <span className="text-[9px] font-black text-white px-1 truncate flex items-center justify-center drop-shadow-sm">
                                                    {isSlideCanvasOnly ? 'TAVLA' : isFreeText ? <MessageSquare size={10} /> : (resp.answer === '[TIMEOUT]' ? 'TID' : resp.answer)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}