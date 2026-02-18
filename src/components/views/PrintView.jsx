import React, { useEffect, useRef, useState } from 'react';
import { Printer, ChevronLeft, X, ChevronRight, Maximize2 } from 'lucide-react';
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

export default function PrintView({ packet, title, onBack, lang = 'sv', includeAnswerKey, answerKeyStyle, showWorkArea }) {
    // --- STATE ---
    const [zoomedIdx, setZoomedIdx] = useState(null);

    const t = {
        sv: { 
            name: "Namn:", date: "Datum:", section: "Instruktion:", 
            key_title: "Facit", question: "Uppg", watermark: "Anpassa Math Platform",
            close: "Stäng", prev: "Föregående", next: "Nästa"
        },
        en: { 
            name: "Name:", date: "Date:", section: "Instruction:", 
            key_title: "Answer Key", question: "No", watermark: "Anpassa Math Platform",
            close: "Close", prev: "Previous", next: "Next"
        }
    }[lang];

    const getFinalAnswer = (data) => {
        if (data?.answer && data.answer !== "Se lösning") return data.answer;
        if (data?.clues && data.clues.length > 0) {
            const lastClue = data.clues[data.clues.length - 1];
            return lastClue.latex ? `$${lastClue.latex}$` : lastClue.text;
        }
        return "---";
    };

    const renderOptions = (options, isZoomed = false) => {
        if (!options || options.length === 0) return null;
        const gridClass = isZoomed ? "grid-cols-1 gap-4 mt-8" : "grid-cols-2 gap-x-4 mt-1";
        const textClass = isZoomed ? "text-2xl" : "text-[10px]";
        
        return (
            <div className={`grid ${gridClass} ${!isZoomed && (showWorkArea ? 'gap-y-1 mt-2' : 'gap-y-0 mt-1')} ${textClass} border-l border-slate-100 pl-2`}>
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
        <div className="min-h-screen bg-slate-100 pb-20 print:bg-white print:pb-0 font-sans">
            {/* TOOLBAR */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 print:hidden">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold uppercase hover:text-indigo-400 transition-colors">
                    <ChevronLeft size={18}/> Studio
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-500 italic px-3 py-1 bg-white/5 rounded-lg border border-white/10">Förhandsgranskning & Presentation</span>
                    <button onClick={() => window.print()} className="bg-indigo-600 px-6 py-2 rounded-xl text-sm font-black uppercase flex items-center gap-2 hover:bg-indigo-500 shadow-lg transition-all active:scale-95">
                        <Printer size={18}/> Skriv ut
                    </button>
                </div>
            </div>

            {/* PAGE 1: WORKSHEET */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl my-8 p-[15mm] flex flex-col min-h-[297mm] print:shadow-none print:my-0 print:p-0 relative">
                <header className="border-b-2 border-black pb-1 mb-3 flex items-end justify-between relative">
                    <div className="absolute -top-5 left-0 text-[7px] font-black uppercase text-slate-300 italic tracking-widest">{t.watermark}</div>
                    <h1 className="text-[14px] font-bold uppercase tracking-tight w-1/3 truncate">{title || "Matematik"}</h1>
                    <div className="flex gap-4 w-2/3 justify-end text-[12px] font-medium">
                        <div className="border-b border-black pb-0 flex gap-2 flex-1 max-w-[180px]"><span>{t.name}</span><div className="flex-1" /></div>
                        <div className="border-b border-black pb-0 flex gap-2 w-[100px]"><span>{t.date}</span><div className="flex-1" /></div>
                    </div>
                </header>

                <div className={`grid grid-cols-6 gap-x-8 ${showWorkArea ? 'gap-y-4' : 'gap-y-1'} items-start flex-1`}>
                    {packet.map((item, idx) => (
                        <React.Fragment key={item.id}>
                            {!item.hideInstruction && (
                                <div className={`col-span-6 border-l-4 border-black pl-3 ${showWorkArea ? 'py-1 mt-3 mb-1' : 'py-0.5 mt-1 mb-0'} break-after-avoid font-bold italic bg-slate-50/20 text-[11px]`}>
                                    <MathDisplay content={item.resolvedData?.renderData.description || item.name} />
                                </div>
                            )}
                            <div 
                                onClick={() => setZoomedIdx(idx)}
                                className={`relative group cursor-zoom-in hover:bg-indigo-50/30 transition-colors rounded-lg ${item.columnSpan === 2 ? 'col-span-2' : item.columnSpan === 3 ? 'col-span-3' : 'col-span-6'} ${showWorkArea ? 'py-2' : 'py-0.5'} break-inside-avoid`}
                            >
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 print:hidden text-indigo-400">
                                    <Maximize2 size={12} />
                                </div>
                                <div className="text-[10px] font-bold mb-0.5 text-slate-500">{idx + 1}.</div>
                                {item.resolvedData?.renderData.latex && (
                                    <div className={`${showWorkArea ? 'py-2' : 'py-0.5'} text-center`}>
                                        <MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} className="text-lg" />
                                    </div>
                                )}
                                {renderOptions(item.resolvedData?.renderData?.options)}
                                {showWorkArea && <div className="min-h-[60px] border border-slate-100 mt-2 bg-slate-50/10 rounded" />}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
                <footer className="mt-auto pt-2 flex justify-between items-center border-t border-slate-100 font-sans"><span className="text-[8px] font-black uppercase text-slate-300 tracking-widest">{t.watermark}</span></footer>
            </div>

            {/* PAGE 2: ANSWER KEY */}
            {includeAnswerKey && (
                 <div className="max-w-[210mm] mx-auto bg-white shadow-2xl my-8 p-[15mm] flex flex-col min-h-[297mm] print:shadow-none print:my-0 print:p-0 break-before-page relative">
                    <header className="border-b-2 border-black pb-1 mb-4 flex items-end justify-between relative font-sans">
                        <div className="absolute -top-5 left-0 text-[7px] font-black uppercase text-slate-300 italic tracking-widest">{t.watermark}</div>
                        <h2 className="text-[14px] font-bold uppercase tracking-tight">{t.key_title}: {title}</h2>
                    </header>
                    <div className="print-columns-3 flex-1">
                        {packet.map((item, idx) => (
                            <div key={`ans-${item.id}`} className={`break-inside-avoid border-slate-100 ${answerKeyStyle === 'compact' ? 'mb-1 flex gap-2' : 'mb-3 pb-2 border-b'}`}>
                                <div className="font-black uppercase text-slate-400 shrink-0 text-[9px]">{t.question} {idx + 1}:</div>
                                {answerKeyStyle === 'compact' ? (
                                    <div className="font-bold text-slate-900 text-[9px]"><MathDisplay content={getFinalAnswer(item.resolvedData)} /></div>
                                ) : (
                                    <div className="space-y-1 mt-0.5">
                                        {item.resolvedData?.clues?.map((clue, cIdx) => (
                                            <div key={cIdx} className={`${cIdx === item.resolvedData.clues.length - 1 ? 'font-bold text-indigo-700 pt-1 mt-1 border-t border-slate-50' : 'text-slate-500'} text-[8.5px] leading-tight`}>
                                                <div className="italic opacity-80">{clue.text}</div>
                                                {clue.latex && <div className="mt-0.5"><MathDisplay content={`$${clue.latex}$`} /></div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <footer className="mt-auto pt-2 flex justify-between items-center border-t border-slate-100 font-sans"><span className="text-[8px] font-black uppercase text-slate-300 tracking-widest">{t.watermark}</span></footer>
                </div>
            )}

            {/* --- ZOOM OVERLAY (FIXED: NOW WHITE) --- */}
            {zoomedIdx !== null && (
                <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 sm:p-20 print:hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-white/80 border-b border-slate-100 backdrop-blur-xl">
                        <div className="flex items-center gap-6">
                            <button onClick={() => setZoomedIdx(null)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-all">
                                <X size={24} />
                            </button>
                            <h2 className="text-slate-900 font-black uppercase tracking-tighter text-xl italic">{title}</h2>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                disabled={zoomedIdx === 0} 
                                onClick={() => setZoomedIdx(zoomedIdx - 1)} 
                                className="px-6 py-3 bg-slate-900 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <ChevronLeft size={20}/> {t.prev}
                            </button>
                            <button 
                                disabled={zoomedIdx === packet.length - 1} 
                                onClick={() => setZoomedIdx(zoomedIdx + 1)} 
                                className="px-6 py-3 bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                {t.next} <ChevronRight size={20}/>
                            </button>
                        </div>
                    </div>

                    <div className="w-full max-w-5xl flex flex-col overflow-y-auto custom-scrollbar pt-12">
                        <div className="mb-10 inline-flex items-center px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-black uppercase italic tracking-widest self-start">
                            {t.question} {zoomedIdx + 1}
                        </div>
                        <div className="space-y-12">
                            <MathDisplay 
                                content={packet[zoomedIdx].resolvedData?.renderData.description || packet[zoomedIdx].name} 
                                className="text-3xl sm:text-5xl font-bold text-slate-800 leading-tight border-l-8 border-indigo-500 pl-8" 
                            />
                            {packet[zoomedIdx].resolvedData?.renderData.latex && (
                                <div className="py-12 bg-slate-50 rounded-[3rem] border border-slate-100 flex justify-center items-center shadow-inner">
                                    <MathDisplay 
                                        content={`$$${packet[zoomedIdx].resolvedData.renderData.latex}$$`} 
                                        className="text-5xl sm:text-8xl text-indigo-700 font-serif" 
                                    />
                                </div>
                            )}
                            {renderOptions(packet[zoomedIdx].resolvedData?.renderData?.options, true)}
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4; margin: 12mm; }
                    .break-before-page { break-before: page; }
                    .print\\:hidden { display: none !important; }
                    .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                    .print-columns-3 { column-count: 3; column-gap: 0.8cm; }
                    body { background: white !important; }
                }
                @media screen {
                    .print-columns-3 { display: grid; grid-template-cols: repeat(3, 1fr); gap: 1rem; }
                    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
                }
            `}} />
        </div>
    );
}