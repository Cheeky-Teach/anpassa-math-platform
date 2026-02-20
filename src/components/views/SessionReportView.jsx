import React, { useEffect, useRef } from 'react';
import { ChevronLeft, Printer, LayoutGrid, CheckCircle2, XCircle, List, GraduationCap, BarChart3 } from 'lucide-react';

const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!content || !containerRef.current) return;
        containerRef.current.innerText = content;
        if (window.renderMathInElement) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false, trust: true
            });
        }
    }, [content]);
    return <div ref={containerRef} className={`math-content leading-relaxed inline ${className}`} />;
};

export default function SessionReportView({ session, packet, responses, onBack, lang = 'sv' }) {
    const students = [...new Set(responses.map(r => r.student_alias))].sort();
    const dateStr = new Date().toLocaleDateString();

    const getFinalAnswer = (resolvedData) => {
        if (resolvedData?.answer && resolvedData.answer !== "Se lösning") return resolvedData.answer;
        if (resolvedData?.token) {
            try { return atob(resolvedData.token); } catch (e) { return "---"; }
        }
        if (resolvedData?.clues && resolvedData.clues.length > 0) {
            const lastClue = resolvedData.clues[resolvedData.clues.length - 1];
            return lastClue.latex ? `$${lastClue.latex}$` : lastClue.text;
        }
        return "---";
    };

    return (
        <div className="min-h-screen bg-slate-100 pb-12 print:bg-white print:pb-0 font-sans">
            {/* --- TOOLBAR --- */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 print:hidden shadow-xl">
                <button onClick={onBack} className="flex items-center gap-2 text-xs font-black uppercase hover:text-indigo-400 transition-colors">
                    <ChevronLeft size={16}/> Tillbaka
                </button>
                <button onClick={() => window.print()} className="bg-indigo-600 px-8 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-indigo-500 shadow-lg active:scale-95">
                    <Printer size={16}/> Skriv ut / Spara PDF
                </button>
            </div>

            {/* --- REPORT BODY --- */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl my-8 p-[15mm] flex flex-col min-h-[297mm] print:shadow-none print:my-0 print:p-0 relative">
                <header className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
                    <div>
                        <div className="text-[8px] font-black uppercase text-slate-400 italic tracking-[0.2em] mb-1">Anpassa Math Platform • Live Rapport</div>
                        <h1 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">{session.title}</h1>
                        <p className="text-[10px] font-bold text-slate-500 mt-2">Klasskod: <span className="text-indigo-600">{session.class_code}</span> • Datum: {dateStr}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-slate-900 leading-none">{students.length}</div>
                        <div className="text-[8px] font-black uppercase text-slate-400">Deltagande Elever</div>
                    </div>
                </header>

                {/* 1. DENSE HEATMAP GRID (Now First) */}
                <section className="mb-10">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                        <LayoutGrid size={12}/> Klassöversikt & Analys
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse text-[8px]">
                            <thead className="bg-slate-900 text-white">
                                <tr>
                                    <th className="p-2 border-r border-white/10 font-black w-32">Elev / Statistik</th>
                                    {packet.map((_, i) => <th key={i} className="p-2 text-center border-r border-white/10 font-black">U{i+1}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Summary Row: Counts */}
                                <tr className="bg-slate-50 border-b border-slate-200 font-black text-indigo-600">
                                    <td className="p-2 border-r bg-slate-100/50">Antal rätt svar</td>
                                    {packet.map((_, qIdx) => {
                                        const correctCount = responses.filter(r => r.question_index === qIdx && r.is_correct).length;
                                        return <td key={qIdx} className="p-2 text-center border-r">{correctCount}/{students.length}</td>;
                                    })}
                                </tr>

                                {/* Student Data Rows */}
                                {students.map((student) => (
                                    <tr key={student} className="border-b border-slate-100">
                                        <td className="p-2 border-r font-bold truncate bg-slate-50/20">{student}</td>
                                        {packet.map((_, qIdx) => {
                                            const r = responses.find(res => res.student_alias === student && res.question_index === qIdx);
                                            return (
                                                <td key={qIdx} className={`p-2 text-center border-r font-black ${!r ? 'text-slate-200' : r.is_correct ? 'text-emerald-600 bg-emerald-50/20' : 'text-rose-500 bg-rose-50/20'}`}>
                                                    {r ? (r.is_correct ? '✓' : '×') : '-'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}

                                {/* Summary Row: Percentages */}
                                <tr className="bg-slate-900 text-white font-black">
                                    <td className="p-2 border-r border-white/10">Genomsnitt (%)</td>
                                    {packet.map((_, qIdx) => {
                                        const correctCount = responses.filter(r => r.question_index === qIdx && r.is_correct).length;
                                        const percentage = students.length > 0 ? Math.round((correctCount / students.length) * 100) : 0;
                                        return <td key={qIdx} className="p-2 text-center border-r border-white/10">{percentage}%</td>;
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 2. INDIVIDUAL ANSWER SLIPS (Second) */}
                <section className="mb-10">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-900 mb-4">Elevsvar (Detaljerad lista)</h3>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-4 items-start">
                        {students.map((student) => {
                            const studentResps = packet.map((_, qIdx) => responses.find(r => r.student_alias === student && r.question_index === qIdx));
                            const score = studentResps.filter(r => r?.is_correct).length;
                            return (
                                <div key={student} className="break-inside-avoid border border-slate-100 p-3 rounded-xl bg-slate-50/30">
                                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
                                        <span className="text-[9px] font-black uppercase truncate pr-2">{student}</span>
                                        <span className="text-[9px] font-black text-indigo-600 bg-white px-2 py-0.5 rounded-lg border border-indigo-100 shadow-sm">{score}/{packet.length}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        {studentResps.map((r, i) => (
                                            <div key={i} className="flex justify-between items-center text-[8px] leading-none">
                                                <div className="flex gap-1.5 overflow-hidden">
                                                    <span className="font-black text-slate-300">U{i+1}:</span>
                                                    <span className={`truncate font-medium ${r ? 'text-slate-600' : 'text-slate-300 italic'}`}>{r?.answer || '-'}</span>
                                                </div>
                                                {r && (r.is_correct ? <CheckCircle2 size={8} className="text-emerald-500 shrink-0" /> : <XCircle size={8} className="text-rose-400 shrink-0" />)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 3. TEACHER REFERENCE LIST (Now Last) */}
                <section className="p-4 bg-slate-50 rounded-2xl border border-slate-200 break-inside-avoid">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-900 mb-3 flex items-center gap-2">
                        <GraduationCap size={12}/> Facit & Uppgiftsreferens
                    </h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {packet.map((item, i) => {
                            const answer = getFinalAnswer(item.resolvedData);
                            return (
                                <div key={i} className="text-[9px] border-b border-slate-100 pb-1 flex flex-col gap-0.5">
                                    <div className="flex gap-1.5 leading-tight">
                                        <span className="font-black text-indigo-600 shrink-0">U{i+1}:</span>
                                        <div className="text-slate-700 italic">
                                            <MathDisplay content={item.resolvedData?.renderData?.description} />
                                            {item.resolvedData?.renderData?.latex && <span> (<MathDisplay content={`$${item.resolvedData.renderData.latex}$`} />)</span>}
                                        </div>
                                    </div>
                                    <div className="pl-6 font-black text-emerald-600 uppercase tracking-tighter">
                                        Rätt svar: <MathDisplay content={answer} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <footer className="mt-auto pt-4 border-t border-slate-100 text-center">
                    <span className="text-[7px] font-black uppercase text-slate-300 tracking-[0.3em]">Genererad via Anpassa.app • Din digitala matematikassistent</span>
                </footer>
            </div>
        </div>
    );
}