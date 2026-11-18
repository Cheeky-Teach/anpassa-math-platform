// src/components/live/student/views/StudentWorksheetView.jsx
import React, { useState, useEffect } from 'react';
import PreferencesToggle from '../../../ui/PreferencesToggle';
import MathScratchpad from '../../../ui/MathScratchpad';
import InteractiveCanvas from '../../../whiteboard/InteractiveCanvas';
import QuestionPromptCard from '../../../shared/QuestionPromptCard';
import QuestionResponseBox from '../../../shared/QuestionResponseBox';
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
            <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6 text-[var(--text-main)]">
                <Loader2 size={32} className="animate-spin text-emerald-600 dark:text-emerald-400" />
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

    const showScratchpad = Boolean(allowScratchpad && !isFreeText && responseStyle !== 'answer_only' && responseStyle !== 'canvas_only');
    const showCanvas = Boolean(allowCanvas && responseStyle !== 'answer_only' && responseStyle !== 'scratchpad_only');

    const isWordProblem = Boolean(
        (currentItem?.selectedStoryIndex !== null && currentItem?.selectedStoryIndex !== undefined) ||
        rd?.isWordProblemApplied ||
        currentItem?.isWordProblem ||
        currentItem?.resolvedData?.isWordProblem ||
        currentItem?.type === 'word_problem'
    );

    return (
        <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col font-sans select-none">
            {/* Header: Progress, Pill & Options */}
            <header className="bg-[var(--bg-card)] border-b border-[var(--border-main)] px-4 py-2.5 sticky top-0 z-50 shadow-2xs shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col min-w-0 flex-1">
                        <h1 className="text-xs font-bold uppercase tracking-wider leading-none truncate mb-1">
                            {session?.title || "Live Lektion"}
                        </h1>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1.5 font-mono">
                            <span className="truncate max-w-[140px] text-[var(--text-main)]">{studentAlias}</span>
                            <span className="opacity-40">•</span>
                            <span className="uppercase tracking-wider">{session?.class_code}</span>
                        </p>
                    </div>

                    {/* Question Pill */}
                    <div className="shrink-0 flex items-center">
                        {pacingMode === 'open' ? (
                            <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-strong)] shadow-2xs gap-1">
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentIndex === 0}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] disabled:opacity-20 cursor-pointer transition-all border border-[var(--border-main)]"
                                >
                                    <ChevronLeft size={16} strokeWidth={2.5} />
                                </button>
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] px-3 min-w-[75px] text-center font-mono">
                                    {currentIndex + 1} / {localPacket.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex(prev => Math.min(localPacket.length - 1, prev + 1))}
                                    disabled={currentIndex === localPacket.length - 1}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] disabled:opacity-20 cursor-pointer transition-all border border-[var(--border-main)]"
                                >
                                    <ChevronRight size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center px-3.5 py-1.5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] shadow-2xs">
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] font-mono">
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
                            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex max-w-xs mx-auto h-1 bg-[var(--bg-surface)] rounded-full gap-1 p-0 mt-2">
                    {localPacket.map((_, i) => (
                        <div 
                            key={i} 
                            className={`flex-1 rounded-full transition-all duration-300 ${
                                i === currentIndex ? 'bg-emerald-600 ring-2 ring-emerald-600/30' : Boolean(completed[i]) ? 'bg-emerald-600/60' : 'bg-transparent'
                            }`} 
                        />
                    ))}
                </div>
            </header>

            {/* Stage */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 overflow-hidden flex flex-col">
                <div className={`flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden transition-all duration-300 ${isCompleted ? 'opacity-50 scale-[0.99] pointer-events-none' : ''}`}>
                    
                    {/* Left Card — Shared QuestionPromptCard */}
                    <div className="flex-[3] whiteboard-protect rounded-2xl shadow-xl flex flex-col overflow-hidden relative min-h-[300px] bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-strong)]">
                        <div className="px-6 py-3.5 lg:px-8 lg:py-4 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-surface)] shrink-0">
                            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono">
                                {lang === 'sv' ? "Uppgift" : "Question"} {currentIndex + 1} av {localPacket.length}
                            </span>
                            {isCompleted && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                        {lang === 'sv' ? "Svar mottaget" : "Answer received"}
                                    </span>
                                    <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={18} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col justify-center overflow-y-auto custom-scrollbar p-4 lg:p-6">
                            <QuestionPromptCard
                                question={currentItem}
                                lang={lang}
                                isWordProblem={isWordProblem}
                                allowVisualReveal={false}
                            />
                        </div>
                    </div>

                    {/* Right Card — Work Area + Shared QuestionResponseBox */}
                    <div className="flex-[2] lg:max-w-[480px] whiteboard-protect rounded-2xl shadow-xl flex flex-col overflow-hidden shrink-0 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-strong)]">
                        <div className="px-5 py-3 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0">
                            {showScratchpad && showCanvas ? (
                                <div className="flex bg-[var(--bg-card)] p-0.5 rounded-xl border border-[var(--border-main)] shadow-2xs">
                                    <button type="button" onClick={() => setActiveWorkTab('scratchpad')} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${activeWorkTab === 'scratchpad' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                        <Calculator size={13} />
                                        <span>{lang === 'sv' ? "Kladdpapper" : "Scratchpad"}</span>
                                    </button>
                                    <button type="button" onClick={() => setActiveWorkTab('canvas')} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${activeWorkTab === 'canvas' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                        <PenTool size={13} />
                                        <span>{lang === 'sv' ? "Rityta" : "Canvas"}</span>
                                    </button>
                                </div>
                            ) : (
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                    {showCanvas && !showScratchpad ? (lang === 'sv' ? "Rityta" : "Drawing Canvas") : (lang === 'sv' ? "Din lösning" : "Your solution")}
                                </span>
                            )}

                            {showCanvas && activeWorkTab === 'canvas' && (
                                <button type="button" onClick={() => setIsCanvasExpanded(true)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-xl transition-colors cursor-pointer border border-[var(--border-main)]">
                                    <Maximize2 size={15} />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 p-4 lg:p-5 flex flex-col justify-between bg-[var(--bg-card)] text-[var(--text-main)] space-y-4">
                            {!isCompleted ? (
                                <div className="w-full space-y-4">
                                    {showCanvas && (activeWorkTab === 'canvas' || !showScratchpad) && (
                                        <div className="w-full h-56 relative border border-[var(--border-strong)] rounded-xl overflow-hidden bg-[var(--bg-surface)] shadow-inner">
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

                                    <QuestionResponseBox
                                        question={currentItem}
                                        value={answers[currentIndex] || ''}
                                        onChange={(val) => setAnswers(prev => ({ ...prev, [currentIndex]: val }))}
                                        onSubmit={() => submitAnswer()}
                                        disabled={isSubmitting}
                                        isSubmitting={isSubmitting}
                                        isMobile={isMobile}
                                        lang={lang}
                                        submitOnChoice={false}
                                        hideSubmitButton={true}
                                    />

                                    <button 
                                        type="button"
                                        onClick={() => submitAnswer()} 
                                        disabled={isSubmitting || !answers[currentIndex]} 
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <><Send size={15} /> <span>{lang === 'sv' ? 'Skicka in svar & arbete' : 'Submit answer & work'}</span></>}
                                    </button>
                                </div>
                            ) : (
                                <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
                                    <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-2xl flex items-center justify-center border border-[var(--border-main)] shadow-inner">
                                        <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={28} />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] italic">
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
                <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150 font-sans">
                    <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-strong)] w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden text-[var(--text-main)]">
                        <div className="px-6 py-3.5 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-surface)] shrink-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                                {lang === 'sv' ? `Rityta — Uppgift ${currentIndex + 1}` : `Drawing Canvas — Question ${currentIndex + 1}`}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsCanvasExpanded(false)}
                                className="px-3.5 py-1.5 bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-main)] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                                <Minimize2 size={14} />
                                <span>{lang === 'sv' ? "Klar" : "Done"}</span>
                            </button>
                        </div>
                        <div className="flex-1 bg-[var(--bg-surface)] relative">
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