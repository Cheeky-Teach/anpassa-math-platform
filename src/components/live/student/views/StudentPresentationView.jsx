// src/components/live/student/views/StudentPresentationView.jsx
import React, { useState, useEffect } from 'react';
import { 
    ZoomIn, ZoomOut, RotateCcw, PanelRightOpen, PanelRightClose, 
    ListChecks, CheckCircle2, ChevronDown, Send, Loader2 
} from 'lucide-react';
import SlideViewerCore from '../../../shared/SlideViewerCore';
import SmartMathInput from '../../../ui/SmartMathInput';
import MathScratchpad from '../../../ui/MathScratchpad';
import MathDisplay from '../../../shared/MathDisplay';
import { syncProgress } from '../../../../lib/progressSync';
import { supabase } from '../../../../lib/supabaseClient';
import { CATEGORY_DEFINITIONS } from '../../../whiteboard/tools/registry';
import QuestionResponseBox from '../../../shared/QuestionResponseBox';

export default function StudentPresentationView({
    engine,
    session,
    studentAlias,
    lang = 'sv',
    onBack
}) {
    const {
        settings,
        allowScratchpad,
        responseStyle,
        localPacket,
        activeSlideIndex,
        answers, setAnswers,
        completed, setCompleted,
        completedSlide, setCompletedSlide,
        scratchpad, setScratchpad,
        canvasElements, setCanvasElements,
        slideExplanations, setSlideExplanations,
        isSubmitting,
        submitAnswer
    } = engine;

    const slides = session?.active_question_data?.slides || [];
    const currentSlide = slides[activeSlideIndex];
    const globalZoom = session?.active_question_data?.settings?.globalZoom || 1.0;
    const slideDrawer = currentSlide?.activeDrawer || (currentSlide?.labType ? currentSlide.labType : null);

    const [slideZoom, setSlideZoom] = useState(1);
    const [isDockCollapsed, setIsDockCollapsed] = useState(false);
    const [activeTaskId, setActiveTaskId] = useState(null);

    // Auto-select first active question accordion when slide changes
    useEffect(() => {
        if (slides[activeSlideIndex]?.activeIds?.length > 0) {
            setActiveTaskId(slides[activeSlideIndex].activeIds[0]);
        }
    }, [activeSlideIndex, slides]);

    // Unified presentation submission (slide canvas + all active questions or pure slide)
    const handleSlideSubmit = async () => {
        if (isSubmitting || completedSlide[activeSlideIndex]) return;

        const currentSlideIds = currentSlide?.activeIds || [];
        const canvasData = canvasElements[activeSlideIndex] || currentSlide?.elements || [];
        const explanation = slideExplanations[activeSlideIndex] || "";

        syncProgress('student_slide_submitted', {
            app_mode: 'student_live',
            slide_index: activeSlideIndex,
            task_count: currentSlideIds.length,
            has_canvas: canvasData.length > 0,
            has_explanation: explanation.trim().length > 0
        });

        if (currentSlideIds.length > 0) {
            for (const qId of currentSlideIds) {
                const localIdx = localPacket.findIndex(p => p.id === qId);
                if (localIdx !== -1 && !completed[localIdx]) {
                    await submitAnswer(localIdx, canvasData);
                }
            }
        } else {
            // Pure manipulative slide without question cards
            const alias = (studentAlias || "Anonym").replace(/<[^>]*>?/gm, '').substring(0, 25);
            const { error } = await supabase.from('responses').insert([{
                room_id: session.id,
                student_alias: alias,
                question_index: activeSlideIndex,
                answer: explanation.trim() ? explanation.trim() : "[SLIDE_CANVAS_SUBMISSION]",
                canvas_state: canvasData,
                is_correct: true,
                is_slide_submission: true
            }]);
            if (error && error.code !== '23505') {
                console.error("Failed to submit slide canvas:", error);
            }
        }

        setCompletedSlide(prev => ({ ...prev, [activeSlideIndex]: true }));
    };

    return (
        <main className="flex-1 w-full h-[calc(100vh-64px)] flex flex-col lg:flex-row relative bg-[var(--bg-canvas)] text-[var(--text-main)] overflow-hidden font-sans select-none">
            
            {/* Main Stage: Canvas Zoom and Tool Controller */}
            <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden">
                
                {/* Floating Top Controls */}
                <div className="absolute top-4 left-4 z-40 flex items-center gap-1.5 bg-[var(--bg-card)] backdrop-blur-xs p-1.5 rounded-xl border border-[var(--border-strong)] shadow-lg">
                    <button 
                        type="button"
                        onClick={() => setSlideZoom(z => Math.max(0.7, z - 0.15))} 
                        className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] flex items-center justify-center cursor-pointer transition-all active:scale-[0.98] border border-[var(--border-main)]"
                        title="Zooma ut"
                    >
                        <ZoomOut size={15} />
                    </button>
                    <span className="text-xs font-bold font-mono w-10 text-center text-[var(--text-main)]">
                        {Math.round(slideZoom * 100)}%
                    </span>
                    <button 
                        type="button"
                        onClick={() => setSlideZoom(z => Math.min(1.8, z + 0.15))} 
                        className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] flex items-center justify-center cursor-pointer transition-all active:scale-[0.98] border border-[var(--border-main)]"
                        title="Zooma in"
                    >
                        <ZoomIn size={15} />
                    </button>
                    <button 
                        type="button"
                        onClick={() => setSlideZoom(1)} 
                        className="px-2.5 h-8 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[10px] font-bold uppercase text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center cursor-pointer border border-[var(--border-main)]"
                        title="Återställ zoom"
                    >
                        <RotateCcw size={13} />
                    </button>

                    <div className="w-px h-5 bg-[var(--border-main)] mx-0.5" />
                    <button 
                        type="button"
                        onClick={() => setIsDockCollapsed(c => !c)} 
                        className="px-3 h-8 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-[var(--border-main)]"
                    >
                        {isDockCollapsed ? <PanelRightOpen size={15} /> : <PanelRightClose size={15} />}
                        <span className="text-[10px] font-bold uppercase hidden sm:inline">
                            {isDockCollapsed ? "Svara" : "Fokus"}
                        </span>
                    </button>
                </div>

                <div 
                    className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
                    style={{ transform: `scale(${slideZoom})`, transformOrigin: 'center center' }}
                >
                    <SlideViewerCore
                        slide={{
                            ...currentSlide,
                            elements: canvasElements[activeSlideIndex] || currentSlide?.elements || []
                        }}
                        livePacket={localPacket}
                        lang={lang}
                        globalZoom={globalZoom}
                        authorMode={false}
                        interactiveCanvasProps={{
                            key: `student_slide_canvas_${activeSlideIndex}`,
                            setElements: (newEls) => setCanvasElements(prev => ({
                                ...prev,
                                [activeSlideIndex]: typeof newEls === 'function' 
                                    ? newEls(prev[activeSlideIndex] || currentSlide?.elements || []) 
                                    : newEls
                            })),
                            toolbarMode: "student",
                            allowedTools: [
                                'select', 'pen', 'highlighter', 'eraser', 'line', 'color_picker', 'clear_all',
                                ...(slideDrawer 
                                    ? [`drawer_${slideDrawer}`] 
                                    : Object.keys(CATEGORY_DEFINITIONS).map(id => `drawer_${id}`))
                            ],
                            readOnly: !!completedSlide[activeSlideIndex]
                        }}
                    />
                </div>
            </div>

            {/* Right Task Dock (Accordion-driven) */}
            <div 
                className={`transition-all duration-300 ease-in-out bg-[var(--bg-card)] text-[var(--text-main)] border-l border-[var(--border-strong)] shadow-2xl flex flex-col z-20 shrink-0 ${
                    isDockCollapsed ? 'w-0 overflow-hidden border-none opacity-0' : 'w-full lg:w-[420px] h-auto lg:h-full opacity-100'
                }`}
            >
                <div className="px-5 py-3.5 border-b border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <ListChecks size={16} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                            {lang === 'sv' ? "Dina Svar" : "Your Answers"}
                        </span>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setIsDockCollapsed(true)} 
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                    >
                        <PanelRightClose size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3 bg-[var(--bg-card)]">
                    {/* Accordion behavior */}
                    {(currentSlide?.activeIds || []).map((qId, displayIndex) => {
                        const localIdx = localPacket.findIndex(p => p.id === qId);
                        if (localIdx === -1) return null;
                        
                        const isDone = !!completed[localIdx];
                        const isFreeText = localPacket[localIdx].answerType === 'free_text';
                        const isActive = activeTaskId === qId;

                        // Collapsed Accordion Row
                        if (!isActive) {
                            return (
                                <div 
                                    key={qId} 
                                    onClick={() => setActiveTaskId(qId)}
                                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center group shadow-2xs ${
                                        isDone 
                                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-[var(--text-main)]' 
                                            : 'border-[var(--border-strong)] bg-[var(--bg-surface)] hover:border-emerald-600 text-[var(--text-main)]'
                                    }`}
                                >
                                    <span className={`text-xs font-bold uppercase tracking-wider ${isDone ? 'text-emerald-700 dark:text-emerald-300' : 'text-[var(--text-main)]'}`}>
                                        {isFreeText ? "Diskussion" : `Svar ${displayIndex + 1}`}
                                    </span>
                                    {isDone ? <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" /> : <ChevronDown size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />}
                                </div>
                            );
                        }

                        // Expanded Task Card
                        return (
                            <div key={qId} className={`p-4 rounded-xl border transition-all bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xs ${
                                isDone 
                                    ? 'border-emerald-500 opacity-70' 
                                    : 'border-emerald-600 ring-2 ring-emerald-600/30'
                            }`}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider font-mono">
                                        {isFreeText ? "Diskussion" : `Svar ${displayIndex + 1}`}
                                    </span>
                                    {isDone && <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />}
                                </div>

                                {/* Math Scratchpad if allowed */}
                                {allowScratchpad && !isFreeText && responseStyle !== 'canvas_only' && !isDone && (
                                    <div className="mb-3">
                                        <MathScratchpad
                                            steps={scratchpad[localIdx] || ['']}
                                            onChange={(steps) => setScratchpad(prev => ({ ...prev, [localIdx]: steps }))}
                                            disabled={isSubmitting || isDone}
                                            lang={lang}
                                        />
                                    </div>
                                )}

                                <div className="mb-1">
                                    <QuestionResponseBox
                                        question={localPacket[localIdx]}
                                        value={answers[localIdx] || ''}
                                        onChange={(val) => setAnswers(prev => ({ ...prev, [localIdx]: val }))}
                                        onSubmit={() => submitAnswer(localIdx)}
                                        disabled={isDone || isSubmitting}
                                        isSubmitting={isSubmitting}
                                        lang={lang}
                                        autoFocus={false}
                                        submitOnChoice={false}
                                        hideSubmitButton={true}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    {/* Pure Manipulative Slide Canvas State */}
                    {(currentSlide?.activeIds || []).length === 0 && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] text-[var(--text-main)] shadow-2xs">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                    {lang === 'sv' ? "Taveluppgift" : "Canvas Task"}
                                </h4>
                                <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                    {lang === 'sv' 
                                        ? "Rita och använd verktygen på tavlan till vänster. Skriv gärna en förklaring nedan innan du lämnar in." 
                                        : "Draw and manipulate tools on the canvas to the left. Add an optional explanation below before submitting."}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-muted)] block">
                                    {lang === 'sv' ? "Din förklaring / resonemang (valfritt):" : "Your explanation / reasoning (optional):"}
                                </label>
                                <textarea
                                    value={slideExplanations[activeSlideIndex] || ""}
                                    onChange={(e) => setSlideExplanations(prev => ({
                                        ...prev,
                                        [activeSlideIndex]: e.target.value
                                    }))}
                                    disabled={isSubmitting || !!completedSlide[activeSlideIndex]}
                                    rows={4}
                                    maxLength={1000}
                                    placeholder={lang === 'sv' ? "Beskriv hur du tänkte..." : "Explain how you solved it..."}
                                    className="w-full p-3 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl text-xs font-medium text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none focus:border-emerald-600 resize-none transition-colors shadow-inner"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Submit Button */}
                <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-surface)] shrink-0">
                    <button
                        type="button"
                        onClick={handleSlideSubmit}
                        disabled={isSubmitting || completedSlide[activeSlideIndex]}
                        className={`w-full py-3 rounded-xl font-bold uppercase text-xs tracking-wider shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            completedSlide[activeSlideIndex]
                                ? 'bg-emerald-600 text-white cursor-default shadow-2xs'
                                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-2xs'
                        }`}
                    >
                        {completedSlide[activeSlideIndex] ? (
                            <>
                                <CheckCircle2 size={16} />
                                <span>{lang === 'sv' ? "Inskickat" : "Submitted"}</span>
                            </>
                        ) : (
                            <>
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                                <span>{lang === 'sv' ? "Skicka in svar & tavla" : "Submit answers & board"}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </main>
    );
}