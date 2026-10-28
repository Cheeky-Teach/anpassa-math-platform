// src/components/live/student/components/StudentSummaryGrid.jsx
import React from 'react';
import { LayoutGrid, CheckCircle2, XCircle } from 'lucide-react';
import MathDisplay from '../../../shared/MathDisplay';
import VisualRenderer from '../../../visuals/VisualRenderer';

export default function StudentSummaryGrid({ engine, lang = 'sv', onBack }) {
    const { localPacket, completed, answers } = engine;

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6 select-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-sm">
                        <LayoutGrid size={20} />
                    </div>
                    <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">
                        {lang === 'sv' ? "Resultatsöversikt" : "Result Overview"}
                    </h2>
                </div>
                <button 
                    type="button"
                    onClick={onBack} 
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                    {lang === 'sv' ? "Stäng" : "Close"}
                </button>
            </header>

            {/* Results Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localPacket.map((item, idx) => {
                    const isCorrect = completed[idx] === 'correct';
                    const isFreeText = item.answerType === 'free_text';
                    const rd = item.resolvedData?.renderData;
                    const hasVisual = rd && (rd.graph || rd.geometry || rd.pattern);

                    // 🟢 Word problem guard (matches StudentLiveView)
                    const isWordProblem = Boolean(
                        (item?.selectedStoryIndex !== null && item?.selectedStoryIndex !== undefined) ||
                        rd?.isWordProblemApplied ||
                        item?.isWordProblem ||
                        item?.resolvedData?.isWordProblem ||
                        item?.type === 'word_problem'
                    );

                    const shouldShowLatex = Boolean(
                        rd?.latex &&
                        !isWordProblem &&
                        !rd?.hideLatex &&
                        !item?.hideLatex &&
                        !rd?.geometry
                    );

                    return (
                        <div 
                            key={item.id || idx} 
                            className={`whiteboard-protect bg-white p-6 rounded-[2.5rem] border-4 shadow-xl flex flex-col justify-between ${
                                isCorrect 
                                    ? (isFreeText ? 'border-blue-500 shadow-blue-50/50' : 'border-emerald-500 shadow-emerald-50/50') 
                                    : 'border-rose-400 shadow-rose-50/50'
                            }`}
                        >
                            <div>
                                {/* Card Status Header */}
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        {lang === 'sv' ? "Uppgift" : "Question"} {idx + 1}
                                    </span>
                                    {isCorrect ? (
                                        <CheckCircle2 className={isFreeText ? "text-blue-500" : "text-emerald-500"} size={24} />
                                    ) : (
                                        <XCircle className="text-rose-400" size={24} />
                                    )}
                                </div>

                                {/* Scaled Visual Preview */}
                                {hasVisual && (
                                    <div className="w-full flex justify-center bg-slate-50/50 p-4 rounded-2xl mb-4 border border-slate-100 overflow-hidden">
                                        <div className="scale-75 origin-center max-h-[160px] flex items-center justify-center">
                                            <VisualRenderer 
                                                data={rd} 
                                                isWordProblem={Boolean(rd?.isWordProblemApplied)} 
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Question Description & Protected LaTeX Box */}
                                <div className="space-y-3 text-slate-700">
                                    <div className="text-sm font-bold leading-relaxed">
                                        <MathDisplay content={rd?.description || item.text} />
                                    </div>
                                    {shouldShowLatex && (
                                        <div className="py-2 bg-indigo-50/50 rounded-xl text-center font-serif text-base border border-indigo-100/50 text-indigo-600">
                                            <MathDisplay content={`$$${rd.latex}$$`} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Answer Pill */}
                            <div className="mt-6">
                                <div className={`w-full py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest truncate ${
                                    isCorrect 
                                        ? (isFreeText ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600 text-center') 
                                        : 'bg-rose-50 text-rose-500 text-center'
                                }`}>
                                    {isFreeText ? (
                                        <span className="text-[10px] opacity-80 block text-left normal-case tracking-normal truncate">
                                            {answers[idx] || '-'}
                                        </span>
                                    ) : (
                                        <>
                                            {lang === 'sv' ? "Ditt Svar:" : "Your Answer:"} {answers[idx] || '-'}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}