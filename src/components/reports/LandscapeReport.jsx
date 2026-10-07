import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Printer, ChevronLeft, Loader2 } from 'lucide-react';
import VisualRenderer from '../visuals/VisualRenderer';

// 🟢 NEW: Highly stable inline MathDisplay (Replaces the bugged MathText component)
const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!content || !containerRef.current) return;
        const renderMath = () => {
            containerRef.current.innerText = content;
            if (window.renderMathInElement) {
                window.renderMathInElement(containerRef.current, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
                    throwOnError: false, trust: true
                });
            }
        };
        const timer = setTimeout(renderMath, 30);
        return () => clearTimeout(timer);
    }, [content]);
    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap ${className}`} />;
};


// --- LANDSCAPE PRINT STYLES ---
const printStyles = `
    @media screen {
        .landscape-report-preview {
            width: 297mm;
            min-height: 210mm;
            padding: 15mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.15);
            transform-origin: top center;
        }
    }

    @media print {
        @page { size: A4 landscape; margin: 8mm; }
        html, body { height: auto !important; overflow: visible !important; background: white !important; color: black !important; }
        
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

        .print-modal-container { position: relative !important; height: auto !important; width: 100% !important; overflow: visible !important; display: block !important; background: white !important; z-index: auto !important; }
        .no-print { display: none !important; }
        .landscape-report-preview { width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; transform: none !important; }
        
        .break-inside-avoid { page-break-inside: avoid !important; break-inside: avoid !important; display: block; position: relative; }
        .break-after-page { display: block !important; break-after: page !important; page-break-after: always !important; }

        table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; page-break-inside: auto; }
        tr { page-break-inside: avoid !important; break-inside: avoid !important; }
        th, td { border: 1px solid #94a3b8 !important; word-wrap: break-word !important; }

        /* Stops grid from slicing items across pages */
        .print-grid-2 { display: flex !important; flex-wrap: wrap !important; gap: 2.5rem 2rem !important; }
        .print-col-2 { width: calc(50% - 1rem) !important; flex-shrink: 0 !important; }
        
        .print-grid-3 { display: flex !important; flex-wrap: wrap !important; gap: 0.75rem 0.75rem !important; }
        .print-col-3 { width: calc(33.333% - 0.5rem) !important; flex-shrink: 0 !important; }
    }
`;

export default function LandscapeReport({ session, packet, responses, lang = 'sv', onClose }) {
    const [printSteps, setPrintSteps] = useState(false);
    
    const students = useMemo(() => {
        return [...new Set(responses.map(r => r.student_alias))].sort();
    }, [responses]);

    const [measuredKeyPages, setMeasuredKeyPages] = useState([]);
    const [measuredStudentPages, setMeasuredStudentPages] = useState([]);
    const [isMeasuring, setIsMeasuring] = useState(true);

    const getCorrectAnswer = (questionItem) => {
        if (!questionItem?.resolvedData) return '-';
        let ans = questionItem.resolvedData.answer; 
        if (!ans && questionItem.resolvedData.token) {
            try {
                const binaryString = atob(questionItem.resolvedData.token);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                ans = new TextDecoder().decode(bytes); 
            } catch (e) {
                ans = atob(questionItem.resolvedData.token);
            }
        }
        return ans || '-';
    };

    useEffect(() => {
        setIsMeasuring(true);
        
        const timer = setTimeout(() => {
            const MAX_LANDSCAPE_HEIGHT = 650; 
            const ROW_GAP = 40; 
            
            // --- 1. MEASURE ANSWER KEY ---
            const keyCards = document.querySelectorAll('.sandbox-key-card');
            const keyPages = [];
            let currKeyPage = [];
            let currKeyHeight = 100; 
            let currKeyRowWidth = 0;
            let maxKeyHeightInRow = 0;

            packet.forEach((item, idx) => {
                const card = keyCards[idx];
                const height = card && card.getBoundingClientRect().height > 0 ? card.getBoundingClientRect().height : 80;
                
                if (currKeyRowWidth === 3) {
                    currKeyHeight += maxKeyHeightInRow + ROW_GAP;
                    currKeyRowWidth = 0;
                    maxKeyHeightInRow = 0;
                }
                
                if (currKeyHeight + height > MAX_LANDSCAPE_HEIGHT && currKeyPage.length > 0) {
                    keyPages.push(currKeyPage);
                    currKeyPage = [];
                    currKeyHeight = 50; 
                    currKeyRowWidth = 0;
                    maxKeyHeightInRow = 0;
                }
                
                currKeyPage.push(item);
                currKeyRowWidth++;
                maxKeyHeightInRow = Math.max(maxKeyHeightInRow, height);
            });
            if (currKeyPage.length > 0) keyPages.push(currKeyPage);
            setMeasuredKeyPages(keyPages);

            // --- 2. MEASURE DETAILED ANSWERS ---
            const studentCards = document.querySelectorAll('.sandbox-student-card');
            const studentPages = [];
            let currStudentPage = [];
            let currStudentHeight = 100; 
            let currStudentRowWidth = 0;
            let maxStudentHeightInRow = 0;

            students.forEach((student, idx) => {
                const card = studentCards[idx];
                const height = card && card.getBoundingClientRect().height > 0 ? card.getBoundingClientRect().height : 150;
                
                if (currStudentRowWidth === 2) {
                    currStudentHeight += maxStudentHeightInRow + ROW_GAP;
                    currStudentRowWidth = 0;
                    maxStudentHeightInRow = 0;
                }
                
                if (currStudentHeight + height > MAX_LANDSCAPE_HEIGHT && currStudentPage.length > 0) {
                    studentPages.push(currStudentPage);
                    currStudentPage = [];
                    currStudentHeight = 50;
                    currStudentRowWidth = 0;
                    maxStudentHeightInRow = 0;
                }
                
                currStudentPage.push(student);
                currStudentRowWidth++;
                maxStudentHeightInRow = Math.max(maxStudentHeightInRow, height);
            });
            if (currStudentPage.length > 0) studentPages.push(currStudentPage);
            setMeasuredStudentPages(studentPages);

            setIsMeasuring(false);
        }, 400); 

        return () => clearTimeout(timer);
    }, [packet, students, responses, printSteps]);

    return (
        <div className="fixed inset-0 z-[150] bg-slate-100 overflow-y-auto no-scrollbar print-modal-container font-sans">
            <style>{printStyles}</style>
            
            {isMeasuring && (
                <div className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center justify-center gap-4 z-[9999] animate-in fade-in duration-200 print:hidden">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <div className="text-center space-y-1">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                            {lang === 'sv' ? "Anpassar Utskriftslayout" : "Optimizing Print Layout"}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {lang === 'sv' ? "Mäter element och beräknar perfekta sidbrytningar..." : "Measuring elements and calibrating smart page breaks..."}
                        </p>
                    </div>
                </div>
            )}

            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center z-50 no-print shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><ChevronLeft size={24}/></button>
                    <h3 className="font-black uppercase italic tracking-tighter">{lang === 'sv' ? "Förhandsgranskning" : "Print Preview"}</h3>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 mr-2 no-print border-r border-slate-200 pr-4">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{lang === 'sv' ? 'Uträkningar' : 'Work Steps'}</span>
                        <button onClick={() => setPrintSteps(!printSteps)} className={`w-8 h-4 rounded-full transition-all relative p-0.5 ${printSteps ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-all ${printSteps ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <button onClick={() => window.print()} disabled={isMeasuring} className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
                        <Printer size={16}/> {lang === 'sv' ? "Skriv ut" : "Print"}
                    </button>
                    <button onClick={onClose} className="bg-slate-900 text-white px-8 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                        {lang === 'sv' ? "Stäng" : "Close"}
                    </button>
                </div>
            </div>

            {!isMeasuring && (
                <div className="landscape-report-preview">
                    
                    {/* PAGE 1: HEADER & CLASS MATRIX */}
                    <div className="break-after-page">
                        <header className="flex justify-between items-end mb-6 border-b-2 border-slate-900 pb-4">
                            <div>
                                <h1 className="text-2xl font-black uppercase italic tracking-tight leading-none mb-1">{session.title}</h1>
                                <p className="text-[9px] font-black uppercase text-indigo-600 tracking-[0.2em]">Resultatrapport • Live Lektion</p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black italic">KOD: {session.class_code || session.id?.slice(0,6)}</div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date().toLocaleDateString()}</p>
                            </div>
                        </header>

                        <div className="mb-10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-slate-500 italic">1. Översikt (Klassnivå)</h3>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="p-2 text-left text-[9px] font-black uppercase w-40 border-r border-slate-300">Elev</th>
                                        <th className="p-2 text-center text-[9px] font-black uppercase w-14 border-r border-slate-300">Res.</th>
                                        {packet.map((_, i) => (
                                            <th key={i} className="w-[26px] p-1 text-center text-[8px] font-black bg-slate-50 border-r border-slate-300">{i + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => {
                                        const studentResps = packet.map((_, qIdx) => responses.find(r => r.student_alias === student && r.question_index === qIdx));
                                        const score = studentResps.filter(r => r?.is_correct).length;
                                        return (
                                            <tr key={student} className="border-b border-slate-300">
                                                <td className="p-1.5 font-bold text-[10px] truncate border-r border-slate-300 text-slate-800">{student}</td>
                                                <td className="p-1.5 text-center text-[9px] font-black border-r border-slate-300 bg-slate-50">{score}/{packet.length}</td>
                                                {studentResps.map((r, idx) => (
                                                    <td key={idx} className="p-0 text-center border-r border-slate-300">
                                                        <div className={`w-full h-7 flex items-center justify-center text-xs font-black ${r ? (r.is_correct ? 'text-slate-800' : 'text-slate-900') : 'text-slate-300'}`}>
                                                            {r ? (r.is_correct ? '✓' : '✕') : '-'}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 2: CHUNKED ANSWER KEY */}
                    {measuredKeyPages.map((pageChunk, pageIdx) => (
                        <div key={`key-page-${pageIdx}`} className="break-after-page pt-4">
                            {pageIdx === 0 && <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-slate-500 italic">2. Uppgiftsöversikt & Facit</h3>}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-[9px] print-grid-3">
                                {pageChunk.map((q) => {
                                    const originalIndex = packet.findIndex(p => p.id === q.id);
                                    const rd = q.resolvedData?.renderData;
                                    const hasVisual = rd && (rd.graph || rd.geometry || rd.pattern);

                                    return (
                                        <div key={q.id} className="print-col-3 break-inside-avoid border border-slate-300 rounded-lg p-3 bg-slate-50/50 flex flex-col justify-between shadow-sm">
                                            <div className="flex items-start gap-2 mb-3">
                                                <span className="font-black text-slate-800">{originalIndex + 1}.</span>
                                                <div className="font-bold text-slate-700 leading-tight w-full">
                                                    
                                                    {/* 🟢 FIXED: Rendering Math and Text Correctly */}
                                                    <MathDisplay content={rd?.description} />
                                                    
                                                    {/* 🟢 FIXED: Constrained Visual Container to prevent overlapping */}
                                                    {hasVisual && (
                                                        <div className="my-3 w-full h-[90px] relative flex justify-center items-center overflow-hidden rounded-md border border-slate-200/60 bg-white">
                                                            <div className="absolute inset-0 flex items-center justify-center transform scale-[0.45] origin-center pointer-events-none">
                                                                <VisualRenderer data={rd} isWordProblem={false} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {rd?.latex && (
                                                        <div className="mt-2 font-serif text-slate-900 font-bold">
                                                            <MathDisplay content={`$$${rd.latex}$$`} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right border-t border-slate-200 pt-2 mt-auto flex justify-between items-center">
                                                <span className="font-black uppercase tracking-widest text-slate-500 text-[8px]">{lang === 'sv' ? 'Facit:' : 'Key:'}</span>
                                                <span className="font-black text-slate-900 text-[10px]"><MathDisplay content={getCorrectAnswer(q)} /></span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* SECTION 3: CHUNKED DETAILED ANSWERS */}
                    {measuredStudentPages.map((pageChunk, pageIdx) => (
                        <div key={`student-page-${pageIdx}`} className="break-after-page pt-4">
                            {pageIdx === 0 && <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-slate-500 italic">3. Individuella Svar (Detaljerat)</h3>}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-10 print-grid-2">
                                {pageChunk.map((student) => {
                                    const studentResps = packet.map((q, qIdx) => ({
                                        question: q.resolvedData?.renderData?.description || `Uppgift ${qIdx + 1}`,
                                        resp: responses.find(r => r.student_alias === student && r.question_index === qIdx)
                                    }));
                                    return (
                                        <div key={student} className="print-col-2 break-inside-avoid bg-slate-50/50 p-4 rounded-2xl border border-slate-300">
                                            <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3">
                                                <span className="font-black text-xs uppercase italic text-slate-900">{student}</span>
                                                <span className="text-[9px] font-bold text-slate-600">{studentResps.filter(s => s.resp?.is_correct).length}/{packet.length} Rätt</span>
                                            </div>
                                            <div className="space-y-3">
                                                {studentResps.map((item, idx) => (
                                                    <div key={idx} className="flex gap-2 text-[9px] leading-tight mb-2">
                                                        <span className="font-black text-slate-500 shrink-0">{idx + 1}.</span>
                                                        <div className="flex-1">
                                                            
                                                            {/* 🟢 FIXED */}
                                                            <div className="text-slate-600 italic mb-0.5 truncate opacity-80 font-medium">
                                                                <MathDisplay content={typeof item.question === 'string' ? item.question : 'Uppgift'} />
                                                            </div>
                                                            
                                                            <div className={`font-black text-[10px] ${item.resp ? (item.resp.is_correct ? 'text-emerald-700' : 'text-slate-900') : 'text-slate-400'}`}>
                                                                Svar: {item.resp?.answer || '-'} 
                                                                {item.resp && (item.resp.is_correct ? ' ✓' : ' ✕')}
                                                            </div>
                                                            {printSteps && item.resp?.work_steps && item.resp.work_steps.length > 0 && (
                                                                <div className="mt-1.5 p-2 bg-white rounded-lg text-[9px] font-mono text-slate-800 border border-slate-300 shadow-sm">
                                                                    <span className="text-[8px] font-sans font-black text-slate-500 uppercase block mb-1">
                                                                        {lang === 'sv' ? 'Uträkning:' : 'Steps:'}
                                                                    </span>
                                                                    {item.resp.work_steps.map((line, lineIdx) => (
                                                                        <div key={lineIdx} className="leading-tight font-serif mb-1 last:mb-0">
                                                                            {/* 🟢 FIXED */}
                                                                            <MathDisplay content={`$$${line}$$`} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                </div>
            )}

            {/* 🟢 HIDDEN SANDBOX (For Measurement Only) */}
            <div className="absolute top-0 left-0 opacity-0 pointer-events-none print:hidden z-[-100] w-[297mm] px-[15mm] box-border">
                {/* Sandbox Answer Key */}
                <div className="grid grid-cols-3 gap-3 text-[9px]">
                    {packet.map((q, i) => {
                        const rd = q.resolvedData?.renderData;
                        const hasVisual = rd && (rd.graph || rd.geometry || rd.pattern);

                        return (
                            <div key={`sb-key-${i}`} className="sandbox-key-card border border-slate-300 rounded-lg p-3 flex flex-col justify-between">
                                <div className="flex items-start gap-2 mb-3">
                                    <span className="font-black text-slate-800">{i + 1}.</span>
                                    <div className="font-bold text-slate-700 leading-tight w-full">
                                        <MathDisplay content={rd?.description} />
                                        
                                        {/* 🟢 FIXED: Sandbox perfectly matches visible constraints */}
                                        {hasVisual && (
                                            <div className="my-3 w-full h-[90px] relative flex justify-center items-center overflow-hidden rounded-md border border-slate-200/60 bg-white">
                                                <div className="absolute inset-0 flex items-center justify-center transform scale-[0.45] origin-center pointer-events-none">
                                                    <VisualRenderer data={rd} isWordProblem={false} />
                                                </div>
                                            </div>
                                        )}

                                        {rd?.latex && (
                                            <div className="mt-2 font-serif text-slate-900 font-bold">
                                                <MathDisplay content={`$$${rd.latex}$$`} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right border-t border-slate-200 pt-2 mt-auto flex justify-between items-center">
                                    <span className="font-black uppercase tracking-widest text-slate-500 text-[8px]">{lang === 'sv' ? 'Facit:' : 'Key:'}</span>
                                    <span className="font-black text-slate-900 text-[10px]"><MathDisplay content={getCorrectAnswer(q)} /></span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Sandbox Detailed Answers */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-10 mt-10">
                    {students.map((student, sIdx) => {
                        const studentResps = packet.map((q, qIdx) => ({
                            question: q.resolvedData?.renderData?.description || `Uppgift ${qIdx + 1}`,
                            resp: responses.find(r => r.student_alias === student && r.question_index === qIdx)
                        }));
                        return (
                            <div key={`sb-student-${sIdx}`} className="sandbox-student-card p-4 rounded-2xl border border-slate-300">
                                <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3">
                                    <span className="font-black text-xs uppercase italic text-slate-900">{student}</span>
                                </div>
                                <div className="space-y-3">
                                    {studentResps.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 text-[9px] leading-tight mb-2">
                                            <div className="flex-1">
                                                <div className="text-slate-600 italic mb-0.5"><MathDisplay content={typeof item.question === 'string' ? item.question : 'Uppgift'} /></div>
                                                <div className="font-black text-[10px]">Svar: {item.resp?.answer || '-'}</div>
                                                {printSteps && item.resp?.work_steps && item.resp.work_steps.length > 0 && (
                                                    <div className="mt-1.5 p-2 border border-slate-300 rounded-lg text-[10px] text-slate-800">
                                                        <span className="block mb-1 text-[8px] font-sans font-black text-slate-500 uppercase">
                                                            {lang === 'sv' ? 'Uträkning:' : 'Steps:'}
                                                        </span>
                                                        {item.resp.work_steps.map((line, lineIdx) => (
                                                            <div key={lineIdx} className="leading-tight font-serif mb-1 last:mb-0">
                                                                <MathDisplay content={`$$${line}$$`} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}