import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Printer, ChevronLeft, X, ChevronRight, Maximize2, Loader2 } from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets.js';
import VisualRenderer from '../visuals/VisualRenderer';

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

// Word problem / Story saver
const compileAnchoredStory = (item, lang = 'sv') => {
    const rd = item.resolvedData?.renderData;
    
    // Fallback: If no story index is selected, or if it isn't an intercepted problem, use server description
    if (item.selectedStoryIndex === undefined || item.selectedStoryIndex === null || !rd?.availableStories) {
        return rd?.description || item.name;
    }

    // 1. Safe boundary lookup for the locked template
    const storyPackage = rd.availableStories[item.selectedStoryIndex];
    if (!storyPackage) return rd?.description || item.name;
    
    let template = storyPackage[lang === 'en' ? 'en' : 'sv'];

    // 2. Prioritize pre-extracted parameters passed down from the interceptor data payload
    let params = rd.extractedParams;

    // 3. Backward compatibility fallback: run regex if extractedParams is missing from history streams
    if (!params) {
        const category = Object.values(SKILL_BUCKETS).find(cat => cat.topics[item.topicId]);
        const variation = category?.topics[item.topicId]?.variations?.find(v => v.key === item.variationKey);
        
        const sourceToken = rd.latex || rd.interceptorToken;
        if (variation?.extractorPattern && sourceToken) {
            const match = sourceToken.match(variation.extractorPattern);
            if (match && match.groups) {
                params = match.groups;
            }
        }
    }

    // 4. Perform placeholder variable substitution
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            const cleanValue = String(value).replace(/[()]/g, '');
            // 🟢 FIXED: Safely escape the curly braces in the RegExp
            template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), cleanValue);
        });
    }

    // 5. Append the exact uniform instructional directive suffix corresponding to the current variation key context
    if (item.variationKey === 'apply_factor_inc' || item.variationKey === 'apply_factor_dec') {
        template += lang === 'en' ? " Calculate the new value." : " Beräkna det nya värdet.";
    } else if (item.variationKey === 'find_original_inc' || item.variationKey === 'find_original_dec') {
        template += lang === 'en' ? " Calculate the original value." : " Beräkna det ursprungliga värdet.";
    } else if (item.variationKey === 'sequential_factors') {
        template += lang === 'en' ? " Calculate the total combined change factor." : " Beräkna den totala förändringsfaktorn.";
    } else if (item.topicId === 'equations' || item.topicId === 'equations_word') {
        if (item.resolvedData?.metadata?.difficulty === 5) {
            template += lang === 'en' ? " Write the equation that describes this situation." : " Teckna ekvationen som beskriver situationen.";
        } else {
            template += lang === 'en' ? " Calculate the value of x." : " Beräkna värdet på x.";
        }
    } else if (item.topicId === 'expressions') {
        template += lang === 'en' ? " Write and simplify the algebraic expression." : " Skriv och förenkla uttrycket.";
    }

    return template;
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

    const hasVisual = (rd) => {
        return !!(rd?.graph || rd?.geometry || rd?.pattern || rd?.marbles || rd?.spinner || 
                 rd?.freqTable || rd?.percentGrid || rd?.scale || rd?.similarity || 
                 rd?.compareArea || rd?.tree);
    };


    // 🟢 STRATEGY 3 STATE MANAGEMENT: Tracks calculated groupings via asynchronous DOM passes
    const [measuredPages, setMeasuredPages] = useState([]);
    const [isMeasuring, setIsMeasuring] = useState(true);

    useEffect(() => {
        setIsMeasuring(true);
        
        const timer = setTimeout(() => {
            const sandboxCards = document.querySelectorAll('.sandbox-card');
            if (!sandboxCards.length) return;

            // 🎯 Hardened Target Page Metric Area: 1123px total height - padding bounds
            const MAX_HEIGHT_PER_PAGE = 1033; 
            
            const pages = [];
            let currentPage = [];
            let currentHeight = 0;
            let currentRowWidth = 0;
            let maxHeightInCurrentRow = 0;

            packet.forEach((item, idx) => {
                const colSpan = item.columnSpan || 6;
                const displayStory = item.showText !== false;
                const isHeaderMode = displayStory && (item.instructionMode === 'header' || !item.instructionMode);

                // ⚡ READ ABSOLUTE REAL FOOTPRINT FROM BROWSER PAINT MATRIX
                const targetCard = sandboxCards[idx];
                const itemHeight = targetCard && targetCard.getBoundingClientRect().height > 0 
                    ? targetCard.getBoundingClientRect().height 
                    : 140;

                if (isHeaderMode || (currentRowWidth + colSpan > 6)) {
                    currentHeight += maxHeightInCurrentRow; 
                    currentRowWidth = 0;
                    maxHeightInCurrentRow = 0;
                }

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

            setMeasuredPages(pages);
            setIsMeasuring(false);
        }, 400); // 400ms ensures text symbols, options lists and charts complete rendering layout fully

        return () => clearTimeout(timer);
    }, [packet, showWorkArea, density, lang]);

    const getFinalAnswer = (data) => {
        if (data?.answer && data.answer !== "Se lösning") return data.answer;
        if (data?.token) {
            try { return atob(data.token); } catch (e) { return "---"; }
        }
        if (data?.clues && data.clues.length > 0) {
            const lastClue = data.clues[data.clues.length - 1];
            return lastClue.latex ? `$${lastClue.latex}$` : lastClue.text;
        }
        return "---";
    };

    return (
        <div className="print-view-root min-h-screen bg-slate-100 pb-20 print:bg-white print:pb-0 print:min-h-0 print:h-auto font-sans relative">
            
            {/* 🟢 FLOATING INTERACTIVE MASK COVER: Locks UI transitions cleanly during DOM layout checks */}
            {isMeasuring && (
                <div className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center justify-center gap-4 font-sans select-none z-[9999] animate-in fade-in duration-200 print:hidden">
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

            {/* TOOLBAR */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 print:hidden">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold uppercase hover:text-indigo-400 transition-colors">
                    <ChevronLeft size={18}/> Question Studio
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-500 italic px-3 py-1 bg-white/5 rounded-lg border border-white/10">Förhandsgranskning</span>
                    <button onClick={() => window.print()} className="bg-indigo-600 px-6 py-2 rounded-xl text-sm font-black uppercase flex items-center gap-2 hover:bg-indigo-500 shadow-lg transition-all active:scale-95">
                        <Printer size={18}/> Skriv ut
                    </button>
                </div>
            </div>

            {/* WORKSHEET PAGES — Maps across evaluated measured states */}
            {!isMeasuring && measuredPages.map((pageItems, pageIdx) => (
                <div key={pageIdx} className="max-w-[210mm] mx-auto bg-white shadow-2xl my-8 p-[8mm] flex flex-col min-h-[240mm] print:min-h-auto print:shadow-none print:my-0 print:p-[12mm] relative break-after-page">
                    <header className="border-b-1 border-black pb-2 mb-4 relative">
                        <div className="mb-6">
                            <div className="text-[6px] font-black uppercase text-slate-600 italic tracking-widest">{t.watermark}</div>
                            <h1 className="text-[12px] font-black uppercase tracking-tight leading-none">{title || "Matematik"}</h1>
                        </div>
                        <div className="flex gap-8 text-[10px] font-bold uppercase">
                            <div className="flex-1 flex gap-2 items-baseline border-b border-black/10"><span>{t.name}</span><div className="flex-1" /></div>
                            <div className="w-32 flex gap-2 items-baseline border-b border-black/10"><span>{t.class}</span><div className="flex-1" /></div>
                            <div className="w-32 flex gap-2 items-baseline border-b border-black/10"><span>{t.date}</span><div className="flex-1" /></div>
                        </div>
                    </header>

                    {/* GRID-AWARE CONTENT CONTAINER */}
                    <div className="grid grid-cols-6 gap-x-10 gap-y-10 items-start flex-1">
                        {pageItems.map((item) => {
                            const displayStory = item.showText !== false;
                            const displayLatex = item.showLatex !== false;
                            const displayVisual = item.showVisual !== false;

                            const isHeaderMode = displayStory && (item.instructionMode === 'header' || !item.instructionMode);
                            const isInlineMode = displayStory && item.instructionMode === 'inline';
                            
                            return (
                                <React.Fragment key={item.id}>
                                    {/* Header Description Text Section */}
                                    {isHeaderMode && (
                                        <div className="col-span-6 border-l-4 border-slate-900 pl-4 py-1 mb-2 bg-slate-50/50">
                                            <div className="text-xs font-bold italic text-slate-700">
                                                <MathDisplay content={compileAnchoredStory(item, lang)} />
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className={`break-inside-avoid ${
                                        item.columnSpan === 2 ? 'col-span-2' : 
                                        item.columnSpan === 3 ? 'col-span-3' : 'col-span-6'
                                    }`}>
                                        <div className="relative pl-8" onClick={() => setZoomedIdx(item.originalIdx)}>
                                            <div className="absolute left-0 top-0 font-black text-slate-900 text-xs">
                                                {(item.originalIdx + 1).toString().padStart(2, '')}
                                            </div>
                                            <div className="space-y-4">
                                                {/* Inline Description Text Section */}
                                                {isInlineMode && (
                                                    <div className="text-[12px] font-bold text-slate-800 leading-tight border-b border-slate-100 pb-2">
                                                        <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                    </div>
                                                )}
                                                
                                                {/* LaTeX Equation Block */}
                                                {displayLatex && item.resolvedData?.renderData.latex && (
                                                    <div className="py-2">
                                                        <MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} className="text-xl text-slate-900" />
                                                    </div>
                                                )}
                                                
                                                {/* VISUAL CONTAINER */}
                                                {displayVisual && (
                                                    <div className="flex justify-center scale-90 origin-top mt-2">
                                                        {/* 🟢 FIXED: Called VisualRenderer with the word problem state! */}
                                                        <VisualRenderer 
                                                            data={item.resolvedData?.renderData} 
                                                            isWordProblem={item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined} 
                                                        />
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
                </div>
            ))}

            {/* --- 3-COLUMN SPILLING ANSWER KEY --- */}
            {!isMeasuring && includeAnswerKey && (
                 <div className="print-answer-key-page print:my-0">
                     <div className="max-w-[210mm] mx-auto bg-white shadow-2xl my-8 p-[15mm] flex flex-col min-h-[297mm] print:min-h-0 print:shadow-none print:my-0 print:p-[12mm] relative border-t-[12px] border-emerald-600">
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
                 </div>
            )}

            {/* 🟢 HIDDEN SANDBOX INTERACTION CANVAS: Kept constantly rendered in background to give true measurements */}
            <div className="absolute top-0 left-0 opacity-0 pointer-events-none print:hidden z-[-100] w-[210mm] px-[12mm] box-border">
                <div id="print-sandbox" className="grid grid-cols-6 gap-x-10 gap-y-10 items-start">
                    {packet.map((item, idx) => {
                        const displayStory = item.showText !== false;
                        const displayLatex = item.showLatex !== false;
                        const displayVisual = item.showVisual !== false;
                        
                        const isHeaderMode = displayStory && (item.instructionMode === 'header' || !item.instructionMode);
                        const isInlineMode = displayStory && item.instructionMode === 'inline';

                        return (
                            <React.Fragment key={`sb-card-${item.id}`}>
                                {isHeaderMode && (
                                    <div className="col-span-6 border-l-4 border-slate-900 pl-4 py-1 bg-slate-50/50">
                                        <div className="text-xs font-bold italic"><MathDisplay content={compileAnchoredStory(item, lang)} /></div>
                                    </div>
                                )}
                                <div className={`sandbox-card ${item.columnSpan === 2 ? 'col-span-2' : item.columnSpan === 3 ? 'col-span-3' : 'col-span-6'}`}>
                                    <div className="pl-8 space-y-4">
                                        {isInlineMode && (
                                            <div className="text-[12px] font-bold"><MathDisplay content={compileAnchoredStory(item, lang)} /></div>
                                        )}
                                        {displayLatex && item.resolvedData?.renderData.latex && (
                                            <div className="py-2"><MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} /></div>
                                        )}
                                        {/* VISUAL CONTAINER */}
                                            {displayVisual && (
                                                <div className="flex justify-center scale-90 origin-top mt-2">
                                                    {/* 🟢 FIXED: Called VisualRenderer with the word problem state! */}
                                                    <VisualRenderer 
                                                        data={item.resolvedData?.renderData} 
                                                        isWordProblem={item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined} 
                                                    />
                                                </div>
                                            )}
                                        {showWorkArea && (
                                            <div className="w-full border rounded-xl" style={{ height: density === 'compact' ? '80px' : density === 'normal' ? '160px' : '320px' }} />
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* DYNAMIC MEDIA PRINT STYLE HANDLERS */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    /* 1. Neutralize high-level layout layers */
                    html, body, #root, main { 
                        height: auto !important; 
                        min-height: 0 !important; 
                        overflow: visible !important;
                        display: block !important;
                        position: static !important;
                    }

                    /* 2. Find any structural parent wrappers holding this view and flatten them entirely */
                    *:has(> .print-view-root),
                    *:has(> .break-after-page),
                    *:has(> .print-answer-key-page) {
                        display: block !important;
                        overflow: visible !important;
                        height: auto !important;
                        min-height: 0 !important;
                        position: static !important;
                        grid-template-columns: none !important;
                        grid-template-rows: none !important;
                        flex-direction: column !important;
                    }

                    /* 3. Strip layout constraints on your component root */
                    .print-view-root {
                        display: block !important;
                        position: static !important;
                        overflow: visible !important;
                        height: auto !important;
                        min-height: 0 !important;
                    }

                    @page { size: A4; margin: 0; }
                    .print\\:hidden { display: none !important; }
                    
                    /* 4. Enforce strict fragmentation boundaries on individual cards */
                    .break-inside-avoid { 
                        break-inside: avoid !important; 
                        page-break-inside: avoid !important;
                        /* 🎯 SAFETY BUFFER: If an ultra-tall element is forced to split, 
                           this padding keeps it inside the printable area of the sheet */
                        padding-top: 4mm !important;
                    }
                    
                    /* 🎯 THE GRID-TO-FLEX OVERRIDE: 
                       Flattens the grid container into an adjustable flex row so the browser 
                       can calculate item page breaks properly */
                    .grid-cols-6 {
                        display: flex !important;
                        flex-wrap: wrap !important;
                        gap: 2.5rem 1.5rem !important; /* Replicates grid column gaps */
                    }
                    
                    /* Map col-span configurations into explicit print-safe percentage widths */
                    .col-span-2 { width: calc(33.333% - 1rem) !important; flex-shrink: 0 !important; }
                    .col-span-3 { width: calc(50% - 1rem) !important; flex-shrink: 0 !important; }
                    .col-span-6 { width: 100% !important; flex-shrink: 0 !important; }
                    
                    .break-after-page { 
                        display: block !important;
                        break-after: page !important; 
                        page-break-after: always !important; 
                    }
                    
                    .print-answer-key-page {
                        display: block !important;
                        clear: both !important;
                        break-before: page !important;
                        page-break-before: always !important;
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }
                    
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