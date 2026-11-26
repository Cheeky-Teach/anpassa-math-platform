import React, { useEffect, useRef, useState } from 'react';
import { Printer, ChevronLeft, Loader2 } from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets.js';
import VisualRenderer from '../visuals/VisualRenderer';
import WorkedExampleCard from '../shared/WorkedExampleCard';
import '../../styles/theme.css';

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
                    throwOnError: false, trust: false
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

    if (item.selectedStoryIndex === undefined || item.selectedStoryIndex === null || !rd?.availableStories) {
        return rd?.description || item.name;
    }

    const storyPackage = rd.availableStories[item.selectedStoryIndex];
    if (!storyPackage) return rd?.description || item.name;

    let template = storyPackage[lang === 'en' ? 'en' : 'sv'];
    let params = rd.extractedParams;

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

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            const cleanValue = String(value).replace(/[()]/g, '');
            template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), cleanValue);
        });
    }

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
    const safePacket = Array.isArray(packet) ? packet : [];
    const globalLatexSize = propLatexSize ?? safePacket[0]?._globalLatexSize ?? 'md';
    const workspaceHeight = propWorkHeight ?? safePacket[0]?._workspaceHeight ?? 0;
    const workspaceStyle = propWorkStyle ?? safePacket[0]?._workspaceStyle ?? 'blank';
    const layoutStyle = propLayoutStyle ?? safePacket[0]?._layoutStyle ?? 'open';
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
        if (!safePacket.length) {
            setMeasuredPages([]);
            setIsMeasuring(false);
            return;
        }

        setIsMeasuring(true);

        const timer = setTimeout(() => {
            const sandboxCards = document.querySelectorAll('.sandbox-card');
            if (!sandboxCards.length) {
                setMeasuredPages([safePacket.map((item, idx) => ({ ...item, originalIdx: idx }))]);
                setIsMeasuring(false);
                return;
            }

            const ROW_GAP = 14;
            const PAGE_1_HEADER_OFFSET = 86;
            const SUBSEQUENT_PAGE_OFFSET = 28;
            const MAX_PAGE_HEIGHT = 1020;

            const pages = [];
            let currentPage = [];
            let currentHeight = PAGE_1_HEADER_OFFSET;
            let currentRowWidth = 0;
            let maxHeightInCurrentRow = 0;

            const flushCurrentRow = () => {
                if (currentRowWidth > 0) {
                    currentHeight += maxHeightInCurrentRow + ROW_GAP;
                    currentRowWidth = 0;
                    maxHeightInCurrentRow = 0;
                }
            };

            const startNewPage = () => {
                if (currentPage.length > 0) {
                    pages.push(currentPage);
                    currentPage = [];
                }
                currentHeight = SUBSEQUENT_PAGE_OFFSET;
                currentRowWidth = 0;
                maxHeightInCurrentRow = 0;
            };

            safePacket.forEach((item, idx) => {
                const colSpan = item.isWorkedExample ? 6 : (item.columnSpan || 6);
                const displayStory = item.showText !== false;
                const isHeaderMode = !item.isWorkedExample && displayStory && (item.instructionMode === 'header' || !item.instructionMode);

                const targetCard = sandboxCards[idx];
                const rawCardHeight = targetCard ? targetCard.getBoundingClientRect().height : 0;
                const baseItemHeight = rawCardHeight > 0 ? rawCardHeight : 88;

                const headerEl = document.getElementById(`sandbox-header-${idx}`);
                const rawHeaderHeight = isHeaderMode && headerEl ? headerEl.getBoundingClientRect().height : 0;
                const headerHeight = isHeaderMode ? (rawHeaderHeight > 0 ? rawHeaderHeight + ROW_GAP : 40) : 0;

                const wouldExceedRow = currentRowWidth > 0 && currentRowWidth + colSpan > 6;
                const rowDeltaIfWrapped = wouldExceedRow ? (maxHeightInCurrentRow + ROW_GAP) : 0;
                const neededHeight = currentHeight + rowDeltaIfWrapped + headerHeight + baseItemHeight;

                if (neededHeight > MAX_PAGE_HEIGHT && currentPage.length > 0) {
                    startNewPage();
                }

                if (isHeaderMode) {
                    flushCurrentRow();
                    currentHeight += headerHeight;
                } else if (currentRowWidth > 0 && currentRowWidth + colSpan > 6) {
                    flushCurrentRow();
                }

                currentPage.push({ ...item, originalIdx: idx });
                currentRowWidth += colSpan;
                maxHeightInCurrentRow = Math.max(maxHeightInCurrentRow, baseItemHeight);

                if (currentRowWidth >= 6) {
                    flushCurrentRow();
                }
            });

            if (currentPage.length > 0) {
                pages.push(currentPage);
            }

            setMeasuredPages(pages.length > 0 ? pages : [safePacket.map((item, idx) => ({ ...item, originalIdx: idx }))]);
            setIsMeasuring(false);
        }, 250);

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

    const answerKeyQuestions = safePacket.filter(p => !p.isWorkedExample);

    return (
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
                <div className="fixed inset-0 bg-stone-950 text-white flex flex-col items-center justify-center gap-4 font-sans select-none z-[9999] animate-in fade-in duration-150 print:hidden">
                    <Loader2 className="animate-spin text-emerald-500" size={38} />
                    <div className="text-center space-y-1">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-100">
                            {lang === 'sv' ? "Anpassar Utskriftslayout" : "Optimizing Print Layout"}
                        </h3>
                        <p className="text-xs font-medium text-stone-400">
                            {lang === 'sv' ? "Mäter element och beräknar sidbrytningar..." : "Measuring elements and calculating page breaks..."}
                        </p>
                    </div>
                </div>
            )}

            {/* TOOLBAR */}
            <div className="bg-stone-900 text-white px-6 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-stone-800 print:hidden">
                <button type="button" onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-emerald-400 transition-colors cursor-pointer">
                    <ChevronLeft size={16}/> Question Studio
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-stone-400 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                        {lang === 'sv' ? 'Förhandsgranskning' : 'Print Preview'}
                    </span>
                    <button type="button" onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer">
                        <Printer size={16}/> {lang === 'sv' ? 'Skriv ut / PDF' : 'Print / PDF'}
                    </button>
                </div>
            </div>

            {/* WORKSHEET PAGES */}
            {!isMeasuring && measuredPages.map((pageItems, pageIdx) => (
                <div
                    key={pageIdx}
                    className={`max-w-[210mm] mx-auto !bg-white !text-slate-900 shadow-2xl my-6 p-[10mm] flex flex-col print:shadow-none print:my-0 print:p-0 relative ${pageIdx < measuredPages.length - 1 ? 'break-after-page' : ''}`}
                >
                    {pageIdx === 0 ? (
                        <header className="border-b-2 border-stone-900 pb-2 mb-3.5 relative">
                            <div className="mb-2.5">
                                <div className="text-[9px] font-bold uppercase text-stone-500 tracking-widest mb-0.5">{t.watermark}</div>
                                <h1 className="text-lg font-extrabold tracking-tight leading-none text-stone-900">{title || (lang === 'sv' ? "Matematik" : "Mathematics")}</h1>
                            </div>
                            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-wider text-stone-800">
                                <div className="flex-1 flex gap-2 items-baseline border-b border-stone-300 pb-0.5"><span>{t.name}</span><div className="flex-1" /></div>
                                <div className="w-32 flex gap-2 items-baseline border-b border-stone-300 pb-0.5"><span>{t.class}</span><div className="flex-1" /></div>
                                <div className="w-32 flex gap-2 items-baseline border-b border-stone-300 pb-0.5"><span>{t.date}</span><div className="flex-1" /></div>
                            </div>
                        </header>
                    ) : (
                        <div className="border-b border-stone-200 pb-1 mb-2.5 flex justify-between items-center text-[10px] font-bold text-stone-400">
                            <span>{title || (lang === 'sv' ? "Matematik" : "Mathematics")}</span>
                            <span className="font-mono">{t.page} {pageIdx + 1}</span>
                        </div>
                    )}

                    {/* GRID-AWARE CONTENT CONTAINER */}
                    <div className="grid grid-cols-6 gap-x-5 gap-y-3.5 items-start">
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

                            const problemNumber = safePacket
                                .slice(0, item.originalIdx)
                                .filter(p => !p.isWorkedExample).length + 1;

                            return (
                                <React.Fragment key={item.id}>
                                    {item.isWorkedExample ? (
                                        <div className="col-span-6 break-inside-avoid w-full my-0">
                                            <WorkedExampleCard item={item} lang={lang} isPrintMode={true} />
                                        </div>
                                    ) : (
                                        <>
                                            {isHeaderMode && (
                                                <div className="col-span-6 border-l-4 border-slate-900 pl-3 py-1 mb-0.5 bg-slate-50 break-inside-avoid">
                                                    <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                                                        <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`break-inside-avoid ${layoutStyle === 'framed' ? 'border border-slate-300 rounded-xl p-2.5' : 'p-1'} ${
                                                item.columnSpan === 2 ? 'col-span-2' :
                                                item.columnSpan === 3 ? 'col-span-3' : 'col-span-6'
                                            }`}>
                                                <div className="flex items-start gap-2.5" onClick={() => setZoomedIdx(item.originalIdx)}>
                                                    <div className="shrink-0 w-6 h-6 rounded-full border-2 border-stone-900 flex items-center justify-center text-stone-900 font-bold font-mono text-xs mt-0.5">
                                                        {problemNumber}
                                                    </div>

                                                    <div className="flex-1 min-w-0 flex flex-col">
                                                        {isInlineMode && (
                                                            <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug border-b border-slate-100 pb-1 mb-1.5">
                                                                <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                            </div>
                                                        )}

                                                        {displayLatex && item.resolvedData?.renderData.latex && (
                                                            <div className="py-1">
                                                                <MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} className={`${latexSizeClass} text-slate-900 text-center font-sans`} />
                                                            </div>
                                                        )}

                                                        {displayVisual && (
                                                            <div className="flex justify-center scale-90 origin-top mt-1">
                                                                <VisualRenderer
                                                                    data={item.resolvedData?.renderData}
                                                                    isWordProblem={item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined}
                                                                />
                                                            </div>
                                                        )}

                                                        {item.resolvedData?.renderData?.options && (
                                                            <div className="grid grid-cols-1 gap-1 border-l-2 border-slate-200 pl-2.5 mt-1">
                                                                {item.resolvedData.renderData.options.map((opt, i) => {
                                                                    const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                                                                    return (
                                                                        <div key={i} className="flex gap-1.5 items-baseline text-[11px] text-slate-800">
                                                                            <span className="font-black text-slate-600">{String.fromCharCode(65 + i)})</span>
                                                                            <MathDisplay content={choiceLabel} />
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {effectiveWorkArea > 0 && (
                                                            <div
                                                                className={`w-full mt-1.5 overflow-hidden ${effectiveWorkspaceStyle === 'grid' ? 'border border-slate-200 rounded-lg' : ''}`}
                                                                style={{
                                                                    height: `${effectiveWorkArea * 28}px`,
                                                                    ...(effectiveWorkspaceStyle === 'grid' ? {
                                                                        backgroundImage: 'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                                                                        backgroundSize: '28px 28px'
                                                                    } : { backgroundColor: 'transparent' })
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* --- COMPACT MULTI-COLUMN ANSWER KEY --- */}
            {!isMeasuring && includeAnswerKey && answerKeyQuestions.length > 0 && (
                <div className="print-answer-key-page print:my-0">
                    <div className="max-w-[210mm] mx-auto !bg-white !text-slate-900 shadow-2xl my-6 p-[10mm] flex flex-col print:shadow-none print:my-0 print:p-0 print:pt-2 relative border-t-[8px] border-emerald-600">
                        <header className="border-b-2 border-stone-900 pb-2 mb-3">
                            <div className="text-[9px] font-bold uppercase text-stone-400 tracking-widest leading-none mb-0.5">{t.watermark}</div>
                            <h2 className="text-base font-extrabold tracking-tight text-stone-900">{t.key_title}: {title}</h2>
                        </header>

                        <div className="print-columns-3 text-slate-900">
                            {answerKeyQuestions.map((item, qIdx) => (
                                <div
                                    key={`ans-${item.id}`}
                                    className={
                                        answerKeyStyle === 'compact'
                                            ? 'break-inside-avoid mb-1 flex gap-1.5 items-baseline'
                                            : 'mb-2 pb-1.5 border-b border-stone-200'
                                    }
                                >
                                    <div className="font-bold font-mono text-stone-500 shrink-0 text-[10px]">{qIdx + 1}.</div>
                                    {answerKeyStyle === 'compact' ? (
                                        <div className="font-bold text-slate-900 text-[10px]">
                                            <MathDisplay content={getFinalAnswer(item.resolvedData)} />
                                        </div>
                                    ) : (
                                        <div className="space-y-0.5 mt-0.5">
                                            {item.resolvedData?.clues?.map((clue, cIdx) => {
                                                const isFinal = cIdx === item.resolvedData.clues.length - 1;
                                                return (
                                                    <div
                                                        key={cIdx}
                                                        className={
                                                            isFinal
                                                                ? 'break-inside-avoid font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[8px] leading-tight'
                                                                : 'break-inside-avoid text-slate-700 pl-1 text-[8px] leading-tight'
                                                        }
                                                    >
                                                        <div className="italic opacity-90">{clue.text}</div>
                                                        {clue.latex && <MathDisplay content={`$${clue.latex}$`} />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* HIDDEN SANDBOX MEASUREMENT CONTAINER */}
            <div className="absolute top-0 left-0 opacity-0 pointer-events-none print:hidden z-[-100] w-[190mm] box-border text-slate-900 bg-white">
                <div id="print-sandbox" className="grid grid-cols-6 gap-x-5 gap-y-3.5 items-start">
                    {safePacket.map((item, idx) => {
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
                                {!item.isWorkedExample && isHeaderMode && (
                                    <div id={`sandbox-header-${idx}`} className="col-span-6 border-l-4 border-slate-900 pl-3 py-1 bg-slate-50">
                                        <div className="text-xs sm:text-sm font-semibold text-slate-900">
                                            <MathDisplay content={compileAnchoredStory(item, lang)} />
                                        </div>
                                    </div>
                                )}
                                <div className={`sandbox-card ${item.isWorkedExample ? 'col-span-6' : (layoutStyle === 'framed' ? 'border rounded-xl p-2.5' : 'p-1')} ${
                                    item.isWorkedExample ? 'col-span-6' :
                                    item.columnSpan === 2 ? 'col-span-2' :
                                    item.columnSpan === 3 ? 'col-span-3' : 'col-span-6'
                                }`}>
                                    {item.isWorkedExample ? (
                                        <WorkedExampleCard item={item} lang={lang} isPrintMode={true} />
                                    ) : (
                                        <div className="flex items-start gap-2.5">
                                            <div className="shrink-0 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-xs mt-0.5">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col space-y-1.5">
                                                {isInlineMode && (
                                                    <div className="text-xs sm:text-sm font-semibold text-slate-900">
                                                        <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                    </div>
                                                )}
                                                {displayLatex && item.resolvedData?.renderData.latex && (
                                                    <div className="py-1">
                                                        <MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} className={`${latexSizeClass} text-center font-sans text-slate-900`} />
                                                    </div>
                                                )}
                                                {displayVisual && (
                                                    <div className="flex justify-center scale-90 origin-top mt-1">
                                                        <VisualRenderer
                                                            data={item.resolvedData?.renderData}
                                                            isWordProblem={item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined}
                                                        />
                                                    </div>
                                                )}
                                                {effectiveWorkArea > 0 && (
                                                    <div className="w-full mt-1.5" style={{ height: `${effectiveWorkArea * 28}px` }} />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* DYNAMIC MEDIA PRINT STYLE HANDLERS (STRICT LIGHT-MODE ENFORCEMENT) */}
            <style dangerouslySetInnerHTML={{ __html: `
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

                    html, body, #root, main {
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                        display: block !important;
                        position: static !important;
                        background: #ffffff !important;
                        color: #0f172a !important;
                    }

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

                    .print-view-root {
                        display: block !important;
                        position: static !important;
                        overflow: visible !important;
                        height: auto !important;
                        min-height: 0 !important;
                        background: #ffffff !important;
                        color: #0f172a !important;
                    }

                    @page { size: A4; margin: 10mm; }
                    .print\\:hidden { display: none !important; }

                    .break-inside-avoid {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }

                    .grid-cols-6 {
                        display: flex !important;
                        flex-wrap: wrap !important;
                        gap: 0.75rem 1rem !important;
                    }

                    .col-span-2 { width: calc(33.333% - 0.7rem) !important; flex-shrink: 0 !important; }
                    .col-span-3 { width: calc(50% - 0.55rem) !important; flex-shrink: 0 !important; }
                    .col-span-6 { width: 100% !important; flex-shrink: 0 !important; }

                    .worked-example-container {
                        display: block !important;
                        width: 100% !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    .worked-example-grid {
                        display: flex !important;
                        flex-direction: row !important;
                        flex-wrap: nowrap !important;
                        width: 100% !important;
                    }

                    .worked-example-grid > div:first-child {
                        width: 38% !important;
                        flex-shrink: 0 !important;
                    }

                    .worked-example-grid > div:last-child {
                        width: 62% !important;
                        flex: 1 1 auto !important;
                    }

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

                    .print-columns-3 { column-count: 3; column-gap: 0.6cm; }
                    body { background: white !important; -webkit-print-color-adjust: exact; }
                }

                @media screen {
                    .print-columns-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
                }
            `}} />
        </div>
    );
}