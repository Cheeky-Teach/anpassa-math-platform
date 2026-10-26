import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Printer, ChevronLeft, X, ChevronRight, Maximize2, Loader2 } from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets.js';
import VisualRenderer from '../visuals/VisualRenderer';

// --- MATH RENDERING ENGINE (PROTECTED FOR PRINT & PREVIEW) ---
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
    return (
        <div 
            ref={containerRef} 
            className={`math-content leading-relaxed whitespace-pre-wrap text-slate-900 [&_.katex]:!text-slate-900 [&_.katex-html]:!text-slate-900 ${className}`} 
        />
    );
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
            template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), cleanValue);
        });
    }

    // 5. Append instructional suffix
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
    globalLatexSize: propLatexSize,
    workspaceHeight: propWorkHeight,
    workspaceStyle: propWorkStyle,
    layoutStyle: propLayoutStyle
}) {
    const globalLatexSize = propLatexSize ?? packet[0]?._globalLatexSize ?? 'md';
    const workspaceHeight = propWorkHeight ?? packet[0]?._workspaceHeight ?? 3;
    const workspaceStyle = propWorkStyle ?? packet[0]?._workspaceStyle ?? 'blank';
    const layoutStyle = propLayoutStyle ?? packet[0]?._layoutStyle ?? 'open';
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

    const [measuredPages, setMeasuredPages] = useState([]);
    const [isMeasuring, setIsMeasuring] = useState(true);

    useEffect(() => {
        setIsMeasuring(true);
        
        const timer = setTimeout(() => {
            const sandboxCards = document.querySelectorAll('.sandbox-card');
            if (!sandboxCards.length) return;

            const ROW_GAP = 40;
            const HEADER_OFFSET = 160;
            const MAX_PAGE_HEIGHT = 950;
            
            const pages = [];
            let currentPage = [];
            let currentHeight = HEADER_OFFSET;
            let currentRowWidth = 0;
            let maxHeightInCurrentRow = 0;

            packet.forEach((item, idx) => {
                const colSpan = item.columnSpan || 6;
                const displayStory = item.showText !== false;
                const isHeaderMode = displayStory && (item.instructionMode === 'header' || !item.instructionMode);

                const targetCard = sandboxCards[idx];
                const baseItemHeight = targetCard && targetCard.getBoundingClientRect().height > 0 
                    ? targetCard.getBoundingClientRect().height 
                    : 140;

                const headerEl = document.getElementById(`sandbox-header-${idx}`);
                const headerHeight = headerEl && headerEl.getBoundingClientRect().height > 0
                    ? headerEl.getBoundingClientRect().height
                    : 0;

                let forcesWrap = isHeaderMode || (currentRowWidth > 0 && currentRowWidth + colSpan > 6);
                let projectedHeight = currentHeight;
                if (forcesWrap) projectedHeight += maxHeightInCurrentRow + (currentRowWidth > 0 ? ROW_GAP : 0);

                let addedItemHeight = 0;
                if (isHeaderMode) {
                    addedItemHeight += headerHeight + ROW_GAP + baseItemHeight;
                } else {
                    addedItemHeight = Math.max(forcesWrap ? 0 : maxHeightInCurrentRow, baseItemHeight);
                }

                if (projectedHeight + addedItemHeight > MAX_PAGE_HEIGHT && currentPage.length > 0) {
                    pages.push(currentPage);
                    currentPage = [];
                    currentHeight = HEADER_OFFSET;
                    currentRowWidth = 0;
                    maxHeightInCurrentRow = 0;
                    forcesWrap = false;
                }

                if (forcesWrap && currentRowWidth > 0) {
                    currentHeight += maxHeightInCurrentRow + ROW_GAP;
                    currentRowWidth = 0;
                    maxHeightInCurrentRow = 0;
                }

                currentPage.push({ ...item, originalIdx: idx });

                if (isHeaderMode) {
                    currentHeight += headerHeight + ROW_GAP;
                    currentRowWidth = colSpan;
                    maxHeightInCurrentRow = baseItemHeight;
                } else {
                    currentRowWidth += colSpan;
                    maxHeightInCurrentRow = Math.max(maxHeightInCurrentRow, baseItemHeight);
                }
            });

            if (currentPage.length > 0) pages.push(currentPage);

            setMeasuredPages(pages);
            setIsMeasuring(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [packet, workspaceHeight, workspaceStyle, layoutStyle, globalLatexSize, lang]);

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
        /* 🟢 THEME SHIELD: Explicit light color-scheme and CSS variables to neutralize any parent dark-mode classes */
        <div 
            className="print-view-root min-h-screen bg-slate-100 pb-20 print:bg-white print:pb-0 print:min-h-0 print:h-auto font-sans relative text-slate-900"
            style={{
                colorScheme: 'light',
                '--text-main': '#0f172a',
                '--text-muted': '#475569',
                '--bg-card': '#ffffff',
                '--bg-surface': '#f8fafc',
                '--border-main': '#e2e8f0',
                '--border-strong': '#cbd5e1'
            }}
        >
            {/* FLOATING INTERACTIVE MASK COVER */}
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
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold uppercase hover:text-indigo-400 transition-colors cursor-pointer">
                    <ChevronLeft size={18}/> Question Studio
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-500 italic px-3 py-1 bg-white/5 rounded-lg border border-white/10">Förhandsgranskning</span>
                    <button onClick={() => window.print()} className="bg-indigo-600 px-6 py-2 rounded-xl text-sm font-black uppercase flex items-center gap-2 hover:bg-indigo-500 shadow-lg transition-all active:scale-95 cursor-pointer">
                        <Printer size={18}/> Skriv ut
                    </button>
                </div>
            </div>

            {/* WORKSHEET PAGES */}
            {!isMeasuring && measuredPages.map((pageItems, pageIdx) => (
                <div 
                    key={pageIdx} 
                    className={`max-w-[210mm] mx-auto !bg-white !text-slate-900 shadow-2xl my-8 p-[8mm] flex flex-col min-h-[240mm] print:min-h-auto print:shadow-none print:my-0 print:p-[12mm] relative ${pageIdx < measuredPages.length - 1 ? 'break-after-page' : ''}`}
                >
                    <header className="border-b border-black pb-2 mb-4 relative">
                        <div className="mb-6">
                            <div className="text-[6px] font-black uppercase text-slate-600 italic tracking-widest">{t.watermark}</div>
                            <h1 className="text-[12px] font-black uppercase tracking-tight leading-none text-slate-900">{title || "Matematik"}</h1>
                        </div>
                        <div className="flex gap-8 text-[10px] font-bold uppercase text-slate-800">
                            <div className="flex-1 flex gap-2 items-baseline border-b border-black/20"><span>{t.name}</span><div className="flex-1" /></div>
                            <div className="w-32 flex gap-2 items-baseline border-b border-black/20"><span>{t.class}</span><div className="flex-1" /></div>
                            <div className="w-32 flex gap-2 items-baseline border-b border-black/20"><span>{t.date}</span><div className="flex-1" /></div>
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
                            
                            const effectiveLatexSize = item.localLatexSize || globalLatexSize;
                            const latexSizeClass = { sm: 'text-base', md: 'text-lg', lg: 'text-xl', xl: 'text-2xl' }[effectiveLatexSize] || 'text-lg';
                            const effectiveWorkArea = item.localWorkspaceHeight !== undefined ? item.localWorkspaceHeight : workspaceHeight;
                            const effectiveWorkspaceStyle = item.localWorkspaceStyle !== undefined ? item.localWorkspaceStyle : workspaceStyle;

                            return (
                                <React.Fragment key={item.id}>
                                    {/* Header Description Text Section */}
                                    {isHeaderMode && (
                                        <div className="col-span-6 border-l-4 border-slate-900 pl-4 py-2 mb-2 bg-slate-50 break-inside-avoid">
                                            <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                                                <MathDisplay content={compileAnchoredStory(item, lang)} />
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className={`break-inside-avoid ${layoutStyle === 'framed' ? 'border-2 border-slate-200 rounded-xl p-4' : 'p-2'} ${
                                        item.columnSpan === 2 ? 'col-span-2' : 
                                        item.columnSpan === 3 ? 'col-span-3' : 'col-span-6'
                                    }`}>
                                        <div className="flex items-start gap-4" onClick={() => setZoomedIdx(item.originalIdx)}>
                                            {/* Visual Anchor Circle */}
                                            <div className="shrink-0 w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-slate-900 font-black text-xs mt-1">
                                                {(item.originalIdx + 1).toString()}
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col h-full">
                                                {/* Inline Description Text Section */}
                                                {isInlineMode && (
                                                    <div className="text-sm font-semibold text-slate-900 leading-relaxed border-b border-slate-100 pb-2 mb-3">
                                                        <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                    </div>
                                                )}
                                                
                                                {/* LaTeX Equation Block */}
                                                {displayLatex && item.resolvedData?.renderData.latex && (
                                                    <div className="py-2">
                                                        <MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} className={`${latexSizeClass} text-slate-900 text-center font-serif`} />
                                                    </div>
                                                )}
                                                
                                                {/* VISUAL CONTAINER */}
                                                {displayVisual && (
                                                    <div className="flex justify-center scale-90 origin-top mt-2">
                                                        <VisualRenderer 
                                                            data={item.resolvedData?.renderData} 
                                                            isWordProblem={item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined} 
                                                        />
                                                    </div>
                                                )}

                                                {item.resolvedData?.renderData?.options && (
                                                    <div className="grid grid-cols-1 gap-2 border-l-2 border-slate-200 pl-4 mb-2">
                                                        {item.resolvedData.renderData.options.map((opt, i) => {
                                                            const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                                                            return (
                                                                <div key={i} className="flex gap-2 items-baseline text-[11px] text-slate-800">
                                                                    <span className="font-black text-slate-600">{String.fromCharCode(65 + i)})</span>
                                                                    <MathDisplay content={choiceLabel} />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                
                                                {/* Dynamic Lined/Grid Paper Work Area */}
                                                <div className="mt-auto pt-2">
                                                    {effectiveWorkArea > 0 && (
                                                        <div 
                                                            className={`w-full mt-2 overflow-hidden ${effectiveWorkspaceStyle === 'grid' ? 'border border-slate-200 rounded-lg' : ''}`}
                                                            style={{ 
                                                                height: `${effectiveWorkArea * 30}px`, 
                                                                ...(effectiveWorkspaceStyle === 'grid' ? {
                                                                    backgroundImage: 'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                                                                    backgroundSize: '30px 30px'
                                                                } : { backgroundColor: 'transparent' })
                                                            }} 
                                                        />
                                                    )}
                                                </div>
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
                     <div className="max-w-[210mm] mx-auto !bg-white !text-slate-900 shadow-2xl my-8 p-[15mm] flex flex-col min-h-[297mm] print:min-h-0 print:shadow-none print:my-0 print:p-[12mm] relative border-t-[12px] border-emerald-600">
                        <header className="border-b-2 border-slate-900 pb-4 mb-6">
                            <div className="text-[8px] font-black uppercase text-slate-400 italic tracking-widest leading-none mb-1">{t.watermark}</div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">{t.key_title}: {title}</h2>
                        </header>
                        
                        <div className="print-columns-3 flex-1 text-slate-900">
                            {packet.map((item, idx) => (
                                <div key={`ans-${item.id}`} className={`break-inside-avoid border-slate-200 ${answerKeyStyle === 'compact' ? 'mb-2 flex gap-2 items-baseline' : 'mb-6 pb-4 border-b'}`}>
                                    <div className="font-black uppercase text-slate-500 shrink-0 text-[10px] italic">{idx + 1}</div>
                                    {answerKeyStyle === 'compact' ? (
                                        <div className="font-bold text-slate-900 text-[11px]"><MathDisplay content={getFinalAnswer(item.resolvedData)} /></div>
                                    ) : (
                                        <div className="space-y-2 mt-0.5">
                                            {item.resolvedData?.clues?.map((clue, cIdx) => (
                                                <div key={cIdx} className={`${cIdx === item.resolvedData.clues.length - 1 ? 'font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200' : 'text-slate-700 pl-2'} text-[9px] leading-tight`}>
                                                    <div className="italic opacity-90 mb-1">{clue.text}</div>
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

            {/* HIDDEN SANDBOX INTERACTION CANVAS */}
            <div className="absolute top-0 left-0 opacity-0 pointer-events-none print:hidden z-[-100] w-[210mm] px-[12mm] box-border text-slate-900 bg-white">
                <div id="print-sandbox" className="grid grid-cols-6 gap-x-10 gap-y-10 items-start">
                    {packet.map((item, idx) => {
                        const displayStory = item.showText !== false;
                        const displayLatex = item.showLatex !== false;
                        const displayVisual = item.showVisual !== false;
                        
                        const isHeaderMode = displayStory && (item.instructionMode === 'header' || !item.instructionMode);
                        const isInlineMode = displayStory && item.instructionMode === 'inline';

                        const effectiveLatexSize = item.localLatexSize || globalLatexSize;
                        const latexSizeClass = { sm: 'text-base', md: 'text-lg', lg: 'text-xl', xl: 'text-2xl' }[effectiveLatexSize] || 'text-lg';
                        const effectiveWorkArea = item.localWorkspaceHeight !== undefined ? item.localWorkspaceHeight : workspaceHeight;

                        return (
                            <React.Fragment key={`sb-card-${item.id}`}>
                                {isHeaderMode && (
                                    <div id={`sandbox-header-${idx}`} className="col-span-6 border-l-4 border-slate-900 pl-4 py-2 bg-slate-50">
                                        <div className="text-sm font-semibold text-slate-900"><MathDisplay content={compileAnchoredStory(item, lang)} /></div>
                                    </div>
                                )}
                                <div className={`sandbox-card ${layoutStyle === 'framed' ? 'border-2 p-4' : 'p-2'} ${item.columnSpan === 2 ? 'col-span-2' : item.columnSpan === 3 ? 'col-span-3' : 'col-span-6'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="shrink-0 w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-xs mt-1">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col h-full space-y-4">
                                            {isInlineMode && (
                                                <div className="text-sm font-semibold text-slate-900"><MathDisplay content={compileAnchoredStory(item, lang)} /></div>
                                            )}
                                            {displayLatex && item.resolvedData?.renderData.latex && (
                                                <div className="py-2"><MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} className={`${latexSizeClass} text-center font-serif text-slate-900`} /></div>
                                            )}
                                            {displayVisual && (
                                                <div className="flex justify-center scale-90 origin-top mt-2">
                                                    <VisualRenderer data={item.resolvedData?.renderData} isWordProblem={item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined} />
                                                </div>
                                            )}
                                            {effectiveWorkArea > 0 && (
                                                <div className="w-full mt-2" style={{ height: `${effectiveWorkArea * 30}px` }} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* DYNAMIC MEDIA PRINT STYLE HANDLERS (STRICT LIGHT-MODE ENFORCEMENT) */}
            <style dangerouslySetInnerHTML={{ __html: `
                /* 🟢 SCREEN OVERRIDE: Neutralize dark-mode styles leaking from theme.css */
                .print-view-root, 
                .print-view-root *:not(.print\\:hidden) {
                    color-scheme: light !important;
                }
                
                .print-view-root [class*="text-white"],
                .print-view-root .katex,
                .print-view-root .katex-html,
                .print-view-root svg text {
                    fill: #0f172a !important;
                }

                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-scheme: light !important;
                    }
                
                    /* 1. Neutralize high-level layout layers */
                    html, body, #root, main { 
                        height: auto !important; 
                        min-height: 0 !important; 
                        overflow: visible !important;
                        display: block !important;
                        position: static !important;
                        background: #ffffff !important;
                        color: #0f172a !important;
                    }

                    /* 2. Flatten parent structural wrappers */
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

                    /* 3. Strip layout constraints on component root */
                    .print-view-root {
                        display: block !important;
                        position: static !important;
                        overflow: visible !important;
                        height: auto !important;
                        min-height: 0 !important;
                        background: #ffffff !important;
                        color: #0f172a !important;
                    }

                    @page { size: A4; margin: 0; }
                    .print\\:hidden { display: none !important; }
                    
                    /* 4. Enforce strict fragmentation boundaries on cards */
                    .break-inside-avoid { 
                        break-inside: avoid !important; 
                        page-break-inside: avoid !important;
                    }
                    
                    /* 5. Grid-to-flex print flattening */
                    .grid-cols-6 {
                        display: flex !important;
                        flex-wrap: wrap !important;
                        gap: 2.5rem 1.5rem !important;
                    }
                    
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
                    .print-columns-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
                }
            `}} />
        </div>
    );
}