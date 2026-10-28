// src/components/live/student/views/StudentWorksheetView.jsx
import React, { useState, useEffect } from 'react';
import PreferencesToggle from '../../../ui/PreferencesToggle';
import SmartMathInput from '../../../ui/SmartMathInput';
import MathScratchpad from '../../../ui/MathScratchpad';
import VisualRenderer from '../../../visuals/VisualRenderer';
import WordProblemVisualGuard from '../../../ui/WordProblemVisualGuard';
import MathDisplay from '../../../shared/MathDisplay';
import InteractiveCanvas from '../../../whiteboard/InteractiveCanvas';
import { 
    Send, CheckCircle2, ChevronLeft, ChevronRight, LogOut, 
    Loader2, PenTool, Calculator, Maximize2, Minimize2 
} from 'lucide-react';
import { syncProgress } from '../../../../lib/progressSync';

export default function StudentWorksheetView({
    engine,
    session,
    studentAlias,
    lang = 'sv',
    onBack
}) {
    const {
        settings,
        allowScratchpad: rawAllowScratchpad,
        allowCanvas: rawAllowCanvas,
        responseStyle: rawResponseStyle,
        localPacket,
        currentIndex, setCurrentIndex,
        answers, setAnswers,
        completed,
        scratchpad, setScratchpad,
        canvasElements, setCanvasElements,
        isSubmitting,
        submitAnswer
    } = engine;

    const sessionSettings = session?.settings || session?.active_question_data?.settings || settings || {};
    const allowScratchpad = sessionSettings.allowScratchpad ?? sessionSettings.scratchpad ?? rawAllowScratchpad ?? true;
    const allowCanvas = Boolean(sessionSettings.allowCanvas || rawAllowCanvas);
    const responseStyle = sessionSettings.responseStyle || rawResponseStyle || 'flexible';

    const [activeWorkTab, setActiveWorkTab] = useState(allowCanvas && !allowScratchpad ? 'canvas' : 'scratchpad');
    const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const currentItem = localPacket[currentIndex];
    const isCompleted = Boolean(completed[currentIndex]);

    if (!currentItem) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    const currentScratchpadSteps = (scratchpad?.[currentIndex]?.length > 0)
        ? scratchpad[currentIndex]
        : [''];

    const handleExitRequest = () => {
        const msg = lang === 'sv' 
            ? "Är du säker på att du vill lämna sessionen? Du kan inte fortsätta där du var sist om du lämnar nu." 
            : "Are you sure you want to leave the session? You cannot continue where you left off if you leave before finishing.";
        if (window.confirm(msg)) {
            syncProgress('student_abandoned_session', { app_mode: 'student_live' });
            onBack();
        }
    };

    const pacingMode = sessionSettings?.pacing || 'open';
    const isFreeText = currentItem?.answerType === 'free_text';
    const rd = currentItem?.resolvedData?.renderData || currentItem?.resolvedData;
    const answerType = currentItem?.answerType || rd?.answerType || 'standard';
    
    // Detect custom input modes
    const isFractionInput = answerType === 'fraction' || rd?.inputMode === 'fraction' || currentItem?.topicId?.includes('brak');
    const isScientificInput = answerType === 'scientific' || rd?.inputMode === 'scientific' || currentItem?.topicId?.includes('grundpotensform') || currentItem?.topicId?.includes('potens');
    const isMultipleChoice = rd?.answerType === 'multiple_choice' || (rd?.options && Array.isArray(rd.options));

    const showScratchpad = Boolean(allowScratchpad && !isFreeText && responseStyle !== 'answer_only' && responseStyle !== 'canvas_only');
    const showCanvas = Boolean(allowCanvas && responseStyle !== 'answer_only' && responseStyle !== 'scratchpad_only');

    const isWordProblem = Boolean(
        (currentItem?.selectedStoryIndex !== null && currentItem?.selectedStoryIndex !== undefined) ||
        rd?.isWordProblemApplied ||
        currentItem?.isWordProblem ||
        currentItem?.resolvedData?.isWordProblem ||
        currentItem?.type === 'word_problem'
    );

    const shouldShowLatexBox = Boolean(
        rd?.latex &&
        !isWordProblem &&
        !rd?.hideLatex &&
        !currentItem?.hideLatex &&
        !rd?.geometry
    );

    return (
        <div className="min-h-screen bg-[var(--bg-canvas,#020617)] text-[var(--text-main,#f8fafc)] flex flex-col font-sans select-none">
            {/* Header: Progress, Pill & Options */}
            <header className="bg-[var(--bg-card,#0f172a)] border-b border-[var(--border-main,#1e293b)] px-4 py-2.5 sticky top-0 z-50 shadow-xs shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col min-w-0 flex-1">
                        <h1 className="text-sm font-black uppercase tracking-widest leading-none truncate mb-1">
                            {session?.title || "Live Lektion"}
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                            <span className="truncate max-w-[140px] text-slate-200">{studentAlias}</span>
                            <span className="opacity-40">•</span>
                            <span className="uppercase font-mono tracking-wider">{session?.class_code}</span>
                        </p>
                    </div>

                    {/* Question Pill */}
                    <div className="shrink-0 flex items-center">
                        {pacingMode === 'open' ? (
                            <div className="flex items-center bg-slate-800/90 p-1 rounded-2xl border border-slate-700 shadow-xs gap-1">
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentIndex === 0}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-20 cursor-pointer transition-all"
                                >
                                    <ChevronLeft size={18} strokeWidth={2.5} />
                                </button>
                                <span className="text-xs font-black uppercase tracking-wider text-white px-3 min-w-[75px] text-center font-mono">
                                    {currentIndex + 1} / {localPacket.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex(prev => Math.min(localPacket.length - 1, prev + 1))}
                                    disabled={currentIndex === localPacket.length - 1}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-20 cursor-pointer transition-all"
                                >
                                    <ChevronRight size={18} strokeWidth={2.5} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center px-4 py-1.5 bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xs">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-200 font-mono">
                                    {lang === 'sv' ? "Uppgift" : "Question"} {currentIndex + 1} / {localPacket.length}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-1 justify-end">
                        <PreferencesToggle />
                        <button 
                            type="button"
                            onClick={handleExitRequest} 
                            className="p-2 hover:bg-rose-500/20 rounded-xl text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex max-w-xs mx-auto h-1 bg-slate-800 rounded-full gap-1 p-0 mt-2">
                    {localPacket.map((_, i) => (
                        <div 
                            key={i} 
                            className={`flex-1 rounded-full transition-all duration-300 ${
                                i === currentIndex ? 'bg-indigo-500 ring-2 ring-indigo-500/30' : Boolean(completed[i]) ? 'bg-emerald-500' : 'bg-transparent'
                            }`} 
                        />
                    ))}
                </div>
            </header>

            {/* Stage */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 overflow-hidden flex flex-col">
                <div className={`flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden transition-all duration-300 ${isCompleted ? 'opacity-50 scale-[0.99] pointer-events-none' : ''}`}>
                    
                    {/* Left Card */}
                    <div className="flex-[3] whiteboard-protect rounded-[2rem] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative min-h-[300px] bg-white text-slate-900 border border-slate-200">
                        <div className="px-6 py-4 lg:px-10 lg:py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                            <span className="text-sm font-bold text-slate-500">
                                {lang === 'sv' ? "Uppgift" : "Question"} {currentIndex + 1} av {localPacket.length}
                            </span>
                            {isCompleted && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-emerald-600">
                                        {lang === 'sv' ? "Svar mottaget" : "Answer received"}
                                    </span>
                                    <CheckCircle2 className="text-emerald-500" size={18} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
                            <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center space-y-6 order-2 lg:order-1">
                                <div className="text-xl lg:text-2xl font-bold text-slate-800 leading-relaxed">
                                    <MathDisplay content={rd?.description || currentItem?.text || currentItem?.prompt || (lang === 'sv' ? "Diskussionsuppgift" : "Discussion Question")} />
                                </div>
                                {shouldShowLatexBox && (
                                    <div className="w-full bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 lg:p-8 overflow-x-auto custom-scrollbar">
                                        <div className="min-w-max flex justify-center text-2xl lg:text-4xl text-indigo-600 font-serif">
                                            <MathDisplay content={`$$${rd.latex}$$`} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {rd && (rd.graph || rd.geometry || rd.pattern) && (
                                <div className="flex-1 p-6 lg:p-10 flex items-center justify-center bg-slate-50/50 border-b lg:border-b-0 lg:border-l border-slate-100 order-1 lg:order-2 shrink-0 min-h-[250px]">
                                    <WordProblemVisualGuard isActive={Boolean(rd?.isWordProblemApplied)} lang={lang} questionKey={currentItem?.id || currentIndex} allowReveal={false}>
                                        <div className="w-full h-full flex items-center justify-center drop-shadow-xs transform scale-90 lg:scale-100">
                                            <VisualRenderer data={rd} isWordProblem={Boolean(rd?.isWordProblemApplied)} />
                                        </div>
                                    </WordProblemVisualGuard>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Card */}
                    <div className="flex-[2] lg:max-w-[480px] whiteboard-protect rounded-[2rem] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden shrink-0 bg-white text-slate-900 border border-slate-200">
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                            {showScratchpad && showCanvas ? (
                                <div className="flex bg-slate-200/80 p-0.5 rounded-xl border border-slate-300">
                                    <button type="button" onClick={() => setActiveWorkTab('scratchpad')} className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeWorkTab === 'scratchpad' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
                                        <Calculator size={13} />
                                        <span>{lang === 'sv' ? "Kladdpapper" : "Scratchpad"}</span>
                                    </button>
                                    <button type="button" onClick={() => setActiveWorkTab('canvas')} className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeWorkTab === 'canvas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
                                        <PenTool size={13} />
                                        <span>{lang === 'sv' ? "Rityta" : "Canvas"}</span>
                                    </button>
                                </div>
                            ) : (
                                <span className="text-sm font-bold text-slate-500">
                                    {showCanvas && !showScratchpad ? (lang === 'sv' ? "Rityta" : "Drawing Canvas") : (lang === 'sv' ? "Din lösning" : "Your solution")}
                                </span>
                            )}

                            {showCanvas && activeWorkTab === 'canvas' && (
                                <button type="button" onClick={() => setIsCanvasExpanded(true)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                                    <Maximize2 size={15} />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 p-4 lg:p-6 flex flex-col justify-between bg-white text-slate-900 space-y-4">
                            {!isCompleted ? (
                                <div className="w-full space-y-4">
                                    {showCanvas && (activeWorkTab === 'canvas' || !showScratchpad) && (
                                        <div className="w-full h-64 relative border-2 border-slate-200 rounded-2xl overflow-hidden bg-[#f9fbf7] shadow-inner">
                                            <InteractiveCanvas
                                                lang={lang}
                                                elements={canvasElements[currentIndex] || currentItem?.canvas_state || []}
                                                setElements={(newEls) => setCanvasElements(prev => ({
                                                    ...prev,
                                                    [currentIndex]: typeof newEls === 'function' ? newEls(prev[currentIndex] || []) : newEls
                                                }))}
                                                resolution={{ w: 1920, h: 1080 }}
                                                toolbarMode="student"
                                            />
                                        </div>
                                    )}

                                    {showScratchpad && (activeWorkTab === 'scratchpad' || !showCanvas) && (
                                        <MathScratchpad
                                            key={`scratchpad_q_${currentIndex}`}
                                            steps={currentScratchpadSteps}
                                            onChange={(newSteps) => setScratchpad(prev => ({ ...prev, [currentIndex]: newSteps }))}
                                            disabled={isSubmitting}
                                            lang={lang}
                                        />
                                    )}

                                    {isMultipleChoice ? (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 block mb-1">
                                                {lang === 'sv' ? 'Välj ett alternativ:' : 'Select an option:'}
                                            </label>
                                            <div className="grid grid-cols-1 gap-2.5 w-full">
                                                {(rd.options || []).map((opt, i) => {
                                                    const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                                                    const choiceValue = typeof opt === 'object' ? opt.value : opt;
                                                    const isSelected = answers[currentIndex] === choiceValue;
                                                    return (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            disabled={isSubmitting}
                                                            onClick={() => setAnswers(prev => ({ ...prev, [currentIndex]: choiceValue }))}
                                                            className={`w-full p-3.5 border-2 rounded-2xl text-base font-bold transition-all text-center cursor-pointer active:scale-95 ${
                                                                isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-400' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                                                            }`}
                                                        >
                                                            <MathDisplay content={String(choiceLabel)} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : isFreeText ? (
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 block mb-1">
                                                {lang === 'sv' ? 'Ditt svar / motivering:' : 'Your answer / explanation:'}
                                            </label>
                                            <textarea
                                                value={answers[currentIndex] || ''}
                                                onChange={(e) => setAnswers(prev => ({ ...prev, [currentIndex]: e.target.value }))}
                                                placeholder={lang === 'sv' ? "Skriv ditt svar här..." : "Write your answer here..."}
                                                rows={5}
                                                disabled={isSubmitting}
                                                className="w-full p-3 text-base border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-slate-900 bg-white resize-none"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 block mb-1">
                                                {lang === 'sv' ? 'Slutsvar:' : 'Final Answer:'}
                                            </label>
                                            <SmartMathInput 
                                                value={answers[currentIndex] || ''}
                                                onChange={(val) => setAnswers(prev => ({ ...prev, [currentIndex]: val }))}
                                                onSubmit={() => submitAnswer()}
                                                disabled={isSubmitting}
                                                isMobile={isMobile}
                                                inputType={
                                                    currentItem?.inputType || 
                                                    currentItem?.answerType || 
                                                    rd?.inputType || 
                                                    rd?.answerType || 
                                                    rd?.inputMode
                                                }
                                                renderData={rd}
                                                autoFocus={true}
                                            />
                                        </div>
                                    )}

                                    <button 
                                        type="button"
                                        onClick={() => submitAnswer()} 
                                        disabled={isSubmitting || !answers[currentIndex]} 
                                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-sm font-bold active:scale-95 disabled:opacity-30 hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> <span>{lang === 'sv' ? 'Skicka in svar & arbete' : 'Submit answer & work'}</span></>}
                                    </button>
                                </div>
                            ) : (
                                <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                                        <Loader2 className="animate-spin text-indigo-500" size={28} />
                                    </div>
                                    <p className="text-sm text-slate-500 font-bold italic">
                                        {pacingMode === 'teacher' ? (lang === 'sv' ? "Väntar på läraren..." : "Waiting for teacher...") : (lang === 'sv' ? "Laddar nästa fråga..." : "Loading next question...")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Fullscreen Canvas Modal */}
            {isCanvasExpanded && (
                <div className="fixed inset-0 z-[600] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                                {lang === 'sv' ? `Rityta — Uppgift ${currentIndex + 1}` : `Drawing Canvas — Question ${currentIndex + 1}`}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsCanvasExpanded(false)}
                                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer"
                            >
                                <Minimize2 size={14} />
                                <span>{lang === 'sv' ? "Klar" : "Done"}</span>
                            </button>
                        </div>
                        <div className="flex-1 bg-[#f9fbf7] relative">
                            <InteractiveCanvas
                                lang={lang}
                                elements={canvasElements[currentIndex] || currentItem?.canvas_state || []}
                                setElements={(newEls) => setCanvasElements(prev => ({
                                    ...prev,
                                    [currentIndex]: typeof newEls === 'function' ? newEls(prev[currentIndex] || []) : newEls
                                }))}
                                resolution={{ w: 1920, h: 1080 }}
                                toolbarMode="student"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}