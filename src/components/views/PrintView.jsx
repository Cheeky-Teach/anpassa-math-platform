import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Printer, ChevronLeft, X, ChevronRight, Maximize2 } from 'lucide-react';
import { GeometryVisual, GraphCanvas } from '../visuals/GeometryComponents.jsx';

// --- MATH RENDERING ENGINE ---
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

export default function PrintView({ 
    packet, 
    title, 
    onBack, 
    lang = 'sv', 
    includeAnswerKey, 
    answerKeyStyle, 
    showWorkArea,
    density = 'normal' 
}) {
    const [zoomedIdx, setZoomedIdx] = useState(null);

    const t = {
        sv: { 
            name: "Namn:", date: "Datum:", class: "Klass:", key_title: "Facit", question: "Uppg", watermark: "Anpassa Math Platform",
            close: "Stäng", prev: "Föregående", next: "Nästa", page: "Sida"
        },
        en: { 
            name: "Name:", date: "Date:", class: "Class:", key_title: "Answer Key", watermark: "Anpassa Math Platform",
            close: "Close", prev: "Previous", next: "Next", page: "Page"
        }
    }[lang];

    // --- PHASE 6: GRID-AWARE PAGINATION ENGINE ---
    // Tracks current row width and instruction modes to accurately predict page breaks
    const paginatedPages = useMemo(() => {
        const MAX_HEIGHT_PER_PAGE = 960; 
        const pages = [];
        let currentPage = [];
        let currentHeight = 0;
        let currentRowWidth = 0;
        let maxHeightInCurrentRow = 0;

        packet.forEach((item, idx) => {
            const colSpan = item.columnSpan || 6;
            const isHeaderMode = item.instructionMode === 'header' || !item.instructionMode;
            
            // 1. Estimate vertical height of item components
            let itemHeight = 40; 
            if (isHeaderMode) itemHeight += 40;
            if (item.instructionMode === 'inline') itemHeight += 30;
            if (item.resolvedData?.renderData?.latex) itemHeight += 100;
            if (item.resolvedData?.renderData?.graph || item.resolvedData?.renderData?.geometry) itemHeight += 180;
            if (item.resolvedData?.renderData?.options) itemHeight += (item.resolvedData.renderData.options.length * 15);
            if (showWorkArea) {
                const workAreaHeights = { compact: 70, normal: 130, spacious: 260 };
                itemHeight += workAreaHeights[density];
            }

            // 2. Commit previous row if this item is a Header or exceeds 6 columns
            if (isHeaderMode || (currentRowWidth + colSpan > 6)) {
                currentHeight += maxHeightInCurrentRow; 
                currentRowWidth = 0;
                maxHeightInCurrentRow = 0;
            }

            // 3. Page Break Decision
            if (currentHeight + itemHeight > MAX_HEIGHT_PER_PAGE && currentPage.length > 0) {
                pages.push(currentPage);
                currentPage = [];
                currentHeight = 0;
                currentRowWidth = 0;
                maxHeightInCurrentRow = 0;
            }

            currentPage.push({ ...item, originalIdx: idx });
            currentRowWidth += isHeaderMode ? 6 : colSpan;
            maxHeightInCurrentRow = Math.max(maxHeightInCurrentRow, itemHeight);
        });

        if (currentPage.length > 0) pages.push(currentPage);
        return pages;
    }, [packet, showWorkArea, density]);

    // SECURITY: REFACTORED TO HANDLE SCRUBBED PAYLOAD
    const getFinalAnswer = (data) => {
        // 1. Check for legacy answer property (un-scrubbed fallback)
        if (data?.answer && data.answer !== "Se lösning") return data.answer;
        
        // 2. Decode the Base64 token to retrieve the answer for the teacher's key
        if (data?.token) {
            try {
                return atob(data.token);
            } catch (e) {
                console.warn("PrintView: Could not decode answer token.");
                return "---";
            }
        }

        // 3. Fallback to the last clue if available
        if (data?.clues && data.clues.length > 0) {
            const lastClue = data.clues[data.clues.length - 1];
            return lastClue.latex ? `$${lastClue.latex}$` : lastClue.text;
        }
        return "---";
    };

    return (
        <div className="min-h-screen bg-slate-100 pb-20 print:bg-white print:pb-0 font-sans">
            {/* TOOLBAR */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 print:hidden">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold uppercase hover:text-indigo-400 transition-colors">
                    <ChevronLeft size={18}/> Studio
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-500 italic px-3 py-1 bg-white/5 rounded-lg border border-white/10">Grid Layout Engine v6.1</span>
                    <button onClick={() => window.print()} className="bg-indigo-600 px-6 py-2 rounded-xl text-sm font-black uppercase flex items-center gap-2 hover:bg-indigo-500 shadow-lg transition-all active:scale-95">
                        <Printer size={18}/> Skriv ut
                    </button>
                </div>
            </div>

            {/* WORKSHEET PAGES */}
            {paginatedPages.map((pageItems, pageIdx) => (
                <div key={pageIdx} className="max-w-[210mm] mx-auto bg-white shadow-2xl my-8 p-[15mm] flex flex-col min-h-[297mm] print:shadow-none print:my-0 print:p-[12mm] relative break-after-page">
                    <header className="border-b-2 border-black pb-4 mb-8 relative">
                        <div className="mb-6">
                            <div className="text-[8px] font-black uppercase text-slate-300 italic tracking-widest">{t.watermark}</div>
                            <h1 className="text-2xl font-black uppercase tracking-tight leading-none">{title || "Matematik"}</h1>
                        </div>
                        <div className="flex gap-8 text-[11px] font-bold uppercase">
                            <div className="flex-1 flex gap-2 items-baseline border-b border-black/10"><span>{t.name}</span><div className="flex-1" /></div>
                            <div className="w-32 flex gap-2 items-baseline border-b border-black/10"><span>{t.class}</span><div className="flex-1" /></div>
                            <div className="w-32 flex gap-2 items-baseline border-b border-black/10"><span>{t.date}</span><div className="flex-1" /></div>
                        </div>
                    </header>

                    {/* GRID-AWARE CONTENT CONTAINER */}
                    <div className="grid grid-cols-6 gap-x-10 gap-y-10 items-start flex-1">
                        {pageItems.map((item) => {
                            const isHeaderMode = item.instructionMode === 'header' || !item.instructionMode;
                            const isInlineMode = item.instructionMode === 'inline';
                            
                            return (
                                <React.Fragment key={item.id}>
                                    {isHeaderMode && (
                                        <div className="col-span-6 border-l-4 border-slate-900 pl-4 py-1 mb-2 bg-slate-50/50">
                                            <MathDisplay content={item.resolvedData?.renderData.description || item.name} className="text-xs font-bold italic text-slate-700" />
                                        </div>
                                    )}
                                    
                                    <div className={`break-inside-avoid ${
                                        item.columnSpan === 2 ? 'col-span-2' : 
                                        item.columnSpan === 3 ? 'col-span-3' : 'col-span-6'
                                    }`}>
                                        <div className="relative pl-8" onClick={() => setZoomedIdx(item.originalIdx)}>
                                            <div className="absolute left-0 top-0 font-black text-slate-300 text-lg italic">
                                                {(item.originalIdx + 1).toString().padStart(2, '0')}
                                            </div>
                                            <div className="space-y-4">
                                                {isInlineMode && (
                                                    <div className="text-[11px] font-bold text-slate-800 leading-tight border-b border-slate-100 pb-2">
                                                        <MathDisplay content={item.resolvedData?.renderData.description || item.name} />
                                                    </div>
                                                )}
                                                {item.resolvedData?.renderData.latex && (
                                                    <div className="py-2"><MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} className="text-xl text-slate-900" /></div>
                                                )}
                                                {(item.resolvedData?.renderData.graph || item.resolvedData?.renderData.geometry) && (
                                                    <div className="flex justify-center p-4 bg-slate-50/30 rounded-2xl border border-slate-50">
                                                        {item.resolvedData.renderData.graph ? <GraphCanvas data={item.resolvedData.renderData.graph} /> : <GeometryVisual type={item.resolvedData.renderData.geometry.type} labels={item.resolvedData.renderData.geometry.labels} width={220} height={180} />}
                                                    </div>
                                                )}
                                                {item.resolvedData?.renderData?.options && (
                                                    <div className="grid grid-cols-1 gap-2 border-l-2 border-slate-100 pl-4 mb-2">
                                                        {item.resolvedData.renderData.options.map((opt, i) => (
                                                            <div key={i} className="flex gap-2 items-baseline text-[11px]">
                                                                <span className="font-black text-slate-400">{String.fromCharCode(65 + i)})</span>
                                                                <MathDisplay content={opt} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {showWorkArea && (
                                                    <div className="w-full border border-slate-200 rounded-xl relative overflow-hidden mt-4" style={{ height: density === 'compact' ? '80px' : density === 'normal' ? '160px' : '320px' }}>
                                                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <footer className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-[8px] font-black text-slate-300 uppercase tracking-widest">
                        <span>{t.watermark}</span>
                        <span>{t.page} {pageIdx + 1} / {paginatedPages.length}</span>
                    </footer>
                </div>
            ))}

            {/* --- 3-COLUMN SPILLING ANSWER KEY --- */}
            {includeAnswerKey && (
                 <div className="max-w-[210mm] mx-auto bg-white shadow-2xl my-8 p-[15mm] flex flex-col min-h-[297mm] print:shadow-none print:my-0 print:p-[12mm] break-before-page relative border-t-[12px] border-emerald-600">
                    <header className="border-b-2 border-black pb-4 mb-6">
                        <div className="text-[8px] font-black uppercase text-slate-300 italic tracking-widest leading-none mb-1">{t.watermark}</div>
                        <h2 className="text-xl font-black uppercase tracking-tight">{t.key_title}: {title}</h2>
                    </header>
                    
                    <div className="print-columns-3 flex-1">
                        {packet.map((item, idx) => (
                            <div key={`ans-${item.id}`} className={`break-inside-avoid border-slate-100 ${answerKeyStyle === 'compact' ? 'mb-2 flex gap-2 items-baseline' : 'mb-6 pb-4 border-b'}`}>
                                <div className="font-black uppercase text-slate-400 shrink-0 text-[10px] italic">{idx + 1}</div>
                                {answerKeyStyle === 'compact' ? (
                                    <div className="font-bold text-slate-900 text-[11px]"><MathDisplay content={getFinalAnswer(item.resolvedData)} /></div>
                                ) : (
                                    <div className="space-y-2 mt-0.5">
                                        {item.resolvedData?.clues?.map((clue, cIdx) => (
                                            <div key={cIdx} className={`${cIdx === item.resolvedData.clues.length - 1 ? 'font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg' : 'text-slate-500 pl-2'} text-[9px] leading-tight`}>
                                                <div className="italic opacity-80 mb-1">{clue.text}</div>
                                                {clue.latex && <MathDisplay content={`$${clue.latex}$`} />}
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
                    @page { size: A4; margin: 0; }
                    .print\\:hidden { display: none !important; }
                    .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                    .break-after-page { break-before: page; page-break-before: always; }
                    .print-columns-3 { column-count: 3; column-gap: 1cm; }
                    body { background: white !important; -webkit-print-color-adjust: exact; }
                }
                @media screen {
                    .print-columns-3 { display: grid; grid-template-cols: repeat(3, 1fr); gap: 1.5rem; }
                }
            `}} />
        </div>
    );
}