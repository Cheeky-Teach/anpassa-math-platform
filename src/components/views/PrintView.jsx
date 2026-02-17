import React, { useEffect, useRef } from 'react';
import { Printer, ChevronLeft } from 'lucide-react';
import { GeometryVisual, GraphCanvas } from '../visuals/GeometryComponents.jsx';

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
        renderMath();
    }, [content]);
    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap ${className}`} />;
};

export default function PrintView({ packet, title, onBack, lang = 'sv', includeAnswerKey, answerKeyStyle }) {
    useEffect(() => {
        const timer = setTimeout(() => { window.print(); }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const t = {
        sv: { name: "Namn:", date: "Datum:", section: "Instruktion:", key_title: "Facit", question: "Uppg" },
        en: { name: "Name:", date: "Date:", section: "Instruction:", key_title: "Answer Key", question: "No" }
    }[lang];

    const getFinalAnswer = (data) => {
        if (data?.answer && data.answer !== "Se lösning") return data.answer;
        if (data?.clues && data.clues.length > 0) {
            const lastClue = data.clues[data.clues.length - 1];
            return lastClue.latex ? `$${lastClue.latex}$` : lastClue.text;
        }
        return "---";
    };

    // Helper to render A, B, C, D options
    const renderOptions = (options) => {
        if (!options || options.length === 0) return null;
        return (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-[11px] font-medium border-l border-slate-100 pl-3">
                {options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                        <span className="font-black">{String.fromCharCode(65 + i)})</span>
                        <MathDisplay content={opt} />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-100 pb-20 print:bg-white print:pb-0">
            {/* Toolbar */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 print:hidden">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold uppercase hover:text-indigo-400 transition-colors"><ChevronLeft size={18}/> Studio</button>
                <button onClick={() => window.print()} className="bg-indigo-600 px-6 py-2 rounded-xl text-sm font-black uppercase flex items-center gap-2 hover:bg-indigo-500 shadow-lg"><Printer size={18}/> Skriv ut</button>
            </div>

            {/* PAGE 1: WORKSHEET */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl my-8 p-[20mm] print:shadow-none print:my-0 print:p-0">
                <header className="border-b-4 border-black pb-6 mb-8">
                    <h1 className="text-3xl font-black uppercase italic mb-8 tracking-tighter">{title || "Matematik"}</h1>
                    <div className="grid grid-cols-2 gap-8 text-sm font-bold">
                        <div className="border-b border-black pb-1 flex gap-2"><span>{t.name}</span><div className="flex-1" /></div>
                        <div className="border-b border-black pb-1 flex gap-2"><span>{t.date}</span><div className="flex-1" /></div>
                    </div>
                </header>

                <div className="grid grid-cols-6 gap-x-10 gap-y-2 items-start">
                    {packet.map((item, idx) => (
                        <React.Fragment key={item.id}>
                            {!item.hideInstruction && (
                                <div className="col-span-6 border-l-4 border-black pl-4 py-1 mt-4 mb-2 break-after-avoid font-bold italic bg-slate-50/30">
                                    <MathDisplay content={item.resolvedData?.renderData.description || item.name} />
                                </div>
                            )}
                            <div className={`${item.columnSpan === 2 ? 'col-span-2' : item.columnSpan === 3 ? 'col-span-3' : 'col-span-6'} py-2 break-inside-avoid`}>
                                <div className="text-[11px] font-bold mb-1 underline decoration-slate-300">Uppgift {idx + 1}</div>
                                {item.resolvedData?.renderData.latex && <div className="py-2 text-center"><MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} className="text-lg" /></div>}
                                
                                {/* RENDERING OPTIONS FOR MCQ */}
                                {renderOptions(item.resolvedData?.renderData?.options)}
                                
                                <div className="min-h-[60px] border border-slate-100 mt-2 bg-slate-50/10 rounded" />
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* PAGE 2: TRIPLE-COLUMN ANSWER KEY */}
            {includeAnswerKey && (
                <div className="max-w-[210mm] mx-auto bg-white shadow-2xl my-8 p-[20mm] print:shadow-none print:my-0 print:p-0 break-before-page">
                    <h2 className="text-xl font-black uppercase italic border-b-2 border-black pb-2 mb-4 tracking-tight">{t.key_title}: {title}</h2>
                    
                    <div className={`print-columns-3 ${answerKeyStyle === 'compact' ? 'text-[9px]' : 'text-[10px]'} leading-tight`}>
                        {packet.map((item, idx) => (
                            <div key={`ans-${item.id}`} className={`break-inside-avoid border-slate-100 ${answerKeyStyle === 'compact' ? 'mb-1 pb-1 border-b-0 flex gap-2' : 'mb-4 pb-2 border-b'}`}>
                                <div className="font-black uppercase text-slate-400 shrink-0">
                                    {t.question} {idx + 1}:
                                </div>
                                
                                {answerKeyStyle === 'compact' ? (
                                    <div className="font-bold text-slate-900">
                                        <MathDisplay content={getFinalAnswer(item.resolvedData)} />
                                    </div>
                                ) : (
                                    <div className="space-y-1 mt-0.5">
                                        {item.resolvedData?.clues?.map((clue, cIdx) => (
                                            <div key={cIdx} className={`${cIdx === item.resolvedData.clues.length - 1 ? 'font-bold text-indigo-700' : 'text-slate-500'}`}>
                                                <MathDisplay content={clue.latex ? `$${clue.latex}$` : clue.text} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4; margin: 12mm; }
                    .break-before-page { break-before: page; }
                    .print\\:hidden { display: none !important; }
                    .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                    .print-columns-3 {
                        column-count: 3;
                        column-gap: 1cm;
                    }
                    body { background: white !important; }
                    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
                @media screen {
                    .print-columns-3 { display: grid; grid-template-cols: repeat(3, 1fr); gap: 1rem; }
                }
            `}} />
        </div>
    );
}