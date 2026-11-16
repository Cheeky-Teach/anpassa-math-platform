// src/components/live/teacher/views/SessionReportView.jsx
import React, { useEffect, useRef } from 'react';
import { ChevronLeft, Printer, LayoutGrid, CheckCircle2, XCircle, GraduationCap } from 'lucide-react';

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
        <div className="min-h-screen bg-[var(--bg-canvas,#f9fbf7)] pb-12 print:bg-white print:pb-0 font-sans text-[var(--text-main)] select-none">
            {/* --- TOOLBAR --- */}
            <div className="bg-[var(--bg-card,#0f172a)] text-[var(--text-main,#f8fafc)] border-b border-[var(--border-strong,#1e293b)] px-6 py-3.5 flex justify-between items-center sticky top-0 z-50 print:hidden shadow-md">
                <button 
                    type="button"
                    onClick={onBack} 
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                >
                    <ChevronLeft size={16}/> {lang === 'sv' ? "Tillbaka" : "Back"}
                </button>
                <button 
                    type="button"
                    onClick={() => window.print()} 
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
                >
                    <Printer size={15}/> {lang === 'sv' ? "Skriv ut / Spara PDF" : "Print / Save PDF"}
                </button>
            </div>

            {/* --- REPORT BODY --- */}
            <div className="max-w-[210mm] mx-auto bg-white text-slate-900 shadow-xl my-6 p-[15mm] flex flex-col min-h-[297mm] print:shadow-none print:my-0 print:p-0 relative rounded-2xl border border-slate-200 print:border-0">
                <header className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
                    <div>
                        <div className="text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider mb-1">
                            {lang === 'sv' ? "Anpassa Math Platform • Live-rapport" : "Anpassa Math Platform • Live Report"}
                        </div>
                        <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900 leading-none">{session.title}</h1>
                        <p className="text-[10px] font-bold text-slate-600 mt-2 font-mono">
                            {lang === 'sv' ? "Klasskod: " : "Class Code: "} <span className="text-emerald-700">{session.class_code}</span> • {lang === 'sv' ? "Datum: " : "Date: "}{dateStr}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-black text-slate-900 leading-none">{students.length}</div>
                        <div className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mt-0.5">{lang === 'sv' ? "Deltagande elever" : "Participating Students"}</div>
                    </div>
                </header>

                {/* 1. DENSE HEATMAP GRID */}
                <section className="mb-8">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                        <LayoutGrid size={14} className="text-emerald-600"/> {lang === 'sv' ? "Klassöversikt & Analys" : "Class Overview & Analysis"}
                    </h3>
                    <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                        <table className="w-full text-left border-collapse text-[9px]">
                            <thead className="bg-slate-900 text-white font-mono">
                                <tr>
                                    <th className="p-2 border-r border-slate-700 font-bold w-36">{lang === 'sv' ? "Elev / Statistik" : "Student / Stats"}</th>
                                    {packet.map((_, i) => <th key={i} className="p-2 text-center border-r border-slate-700 font-bold">U{i+1}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Summary Row: Counts */}
                                <tr className="bg-slate-50 border-b border-slate-300 font-bold font-mono text-emerald-800">
                                    <td className="p-2 border-r border-slate-300 bg-slate-100">{lang === 'sv' ? "Antal rätt svar" : "Correct answers"}</td>
                                    {packet.map((_, qIdx) => {
                                        const correctCount = responses.filter(r => r.question_index === qIdx && r.is_correct).length;
                                        return <td key={qIdx} className="p-2 text-center border-r border-slate-300">{correctCount}/{students.length}</td>;
                                    })}
                                </tr>

                                {/* Student Data Rows */}
                                {students.map((student) => (
                                    <tr key={student} className="border-b border-slate-200">
                                        <td className="p-2 border-r border-slate-200 font-semibold truncate bg-slate-50/40 text-slate-800">{student}</td>
                                        {packet.map((_, qIdx) => {
                                            const r = responses.find(res => res.student_alias === student && res.question_index === qIdx);
                                            return (
                                                <td key={qIdx} className={`p-2 text-center border-r border-slate-200 font-bold font-mono ${!r ? 'text-slate-300' : r.is_correct ? 'text-emerald-700 bg-emerald-50/40' : 'text-rose-600 bg-rose-50/40'}`}>
                                                    {r ? (r.is_correct ? '✓' : '×') : '-'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}

                                {/* Summary Row: Percentages */}
                                <tr className="bg-slate-900 text-white font-mono font-bold">
                                    <td className="p-2 border-r border-slate-700">{lang === 'sv' ? "Genomsnitt (%)" : "Average (%)"}</td>
                                    {packet.map((_, qIdx) => {
                                        const correctCount = responses.filter(r => r.question_index === qIdx && r.is_correct).length;
                                        const percentage = students.length > 0 ? Math.round((correctCount / students.length) * 100) : 0;
                                        return <td key={qIdx} className="p-2 text-center border-r border-slate-700">{percentage}%</td>;
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 2. INDIVIDUAL ANSWER SLIPS */}
                <section className="mb-8">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3">
                        {lang === 'sv' ? "Elevsvar (Detaljerad lista)" : "Student Answers (Detailed List)"}
                    </h3>
                    <div className="grid grid-cols-3 gap-3 items-start">
                        {students.map((student) => {
                            const studentResps = packet.map((_, qIdx) => responses.find(r => r.student_alias === student && r.question_index === qIdx));
                            const score = studentResps.filter(r => r?.is_correct).length;
                            return (
                                <div key={student} className="break-inside-avoid border border-slate-200 p-2.5 rounded-xl bg-slate-50/50 shadow-2xs">
                                    <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-slate-200">
                                        <span className="text-[10px] font-bold uppercase truncate pr-2 text-slate-900">{student}</span>
                                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">{score}/{packet.length}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {studentResps.map((r, i) => (
                                            <div key={i} className="flex justify-between items-center text-[9px] leading-tight font-mono">
                                                <div className="flex gap-1.5 overflow-hidden">
                                                    <span className="font-bold text-slate-400">U{i+1}:</span>
                                                    <span className={`truncate font-medium ${r ? 'text-slate-800' : 'text-slate-400 italic'}`}>{r?.answer || '-'}</span>
                                                </div>
                                                {r && (r.is_correct ? <CheckCircle2 size={10} className="text-emerald-600 shrink-0" /> : <XCircle size={10} className="text-rose-500 shrink-0" />)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 3. TEACHER REFERENCE LIST */}
                <section className="p-4 bg-slate-50 rounded-xl border border-slate-200 break-inside-avoid">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                        <GraduationCap size={14} className="text-emerald-600"/> {lang === 'sv' ? "Facit & Uppgiftsreferens" : "Answer Key & References"}
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                        {packet.map((item, i) => {
                            const answer = getFinalAnswer(item.resolvedData);
                            return (
                                <div key={i} className="text-[10px] border-b border-slate-200/60 pb-1.5 flex flex-col gap-0.5">
                                    <div className="flex gap-1.5 leading-tight">
                                        <span className="font-mono font-bold text-slate-900 shrink-0">U{i+1}:</span>
                                        <div className="text-slate-700 italic">
                                            <MathDisplay content={item.resolvedData?.renderData?.description} />
                                            {item.resolvedData?.renderData?.latex && <span> (<MathDisplay content={`$${item.resolvedData.renderData.latex}$`} />)</span>}
                                        </div>
                                    </div>
                                    <div className="pl-5 font-mono font-bold text-emerald-700 uppercase tracking-tight">
                                        {lang === 'sv' ? "Rätt svar: " : "Answer: "}<MathDisplay content={answer} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <footer className="mt-auto pt-4 border-t border-slate-200 text-center">
                    <span className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-[0.2em]">
                        {lang === 'sv' ? "Genererad via Anpassa.app • Din digitala matematikassistent" : "Generated via Anpassa.app • Digital Mathematics Assistant"}
                    </span>
                </footer>
            </div>
        </div>
    );
}