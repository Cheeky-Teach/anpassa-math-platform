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

    // 🟢 Parity: Auto-select first active question accordion when slide changes
    useEffect(() => {
        if (slides[activeSlideIndex]?.activeIds?.length > 0) {
            setActiveTaskId(slides[activeSlideIndex].activeIds[0]);
        }
    }, [activeSlideIndex, slides]);

    // 🟢 Parity: Unified presentation submission (slide canvas + all active questions or pure slide)
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

    const renderTaskInput = (localIdx) => {
        const item = localPacket[localIdx];
        if (!item) return null;

        const isDone = !!completed[localIdx];
        const isFreeText = item.answerType === 'free_text';
        const rd = item.resolvedData?.renderData;

        // 1. Multiple Choice Options
        if (rd?.answerType === 'multiple_choice' || (rd?.options && Array.isArray(rd.options))) {
            const currentSelected = answers[localIdx];
            return (
                <div className="grid grid-cols-1 gap-2 w-full">
                    {(rd.options || []).map((opt, i) => {
                        const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                        const choiceValue = typeof opt === 'object' ? opt.value : opt;
                        const isSelected = currentSelected === choiceValue;

                        return (
                            <button
                                key={i}
                                type="button"
                                disabled={isDone || isSubmitting}
                                onClick={() => {
                                    if (isDone) return;
                                    setAnswers(prev => ({ ...prev, [localIdx]: choiceValue }));
                                }}
                                className={`w-full p-3 border-2 rounded-xl text-sm font-bold transition-all text-center cursor-pointer ${
                                    isSelected 
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-400' 
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                                } ${isDone ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <MathDisplay content={String(choiceLabel)} />
                            </button>
                        );
                    })}
                </div>
            );
        }

        // 2. Free Text Question
        if (isFreeText) {
            return (
                <textarea
                    value={answers[localIdx] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [localIdx]: e.target.value }))}
                    disabled={isDone || isSubmitting}
                    rows={3}
                    placeholder={lang === 'sv' ? "Skriv ditt svar / reflektion här..." : "Write your thoughts here..."}
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 resize-none transition-colors"
                />
            );
        }

        // 3. Standard Smart Math Input
        return (
            <SmartMathInput
                value={answers[localIdx] || ''}
                onChange={(val) => setAnswers(prev => ({ ...prev, [localIdx]: val }))}
                onSubmit={() => submitAnswer(localIdx)}
                disabled={isDone || isSubmitting}
            />
        );
    };

    return (
        <main className="flex-1 w-full h-[calc(100vh-64px)] flex flex-col lg:flex-row relative bg-slate-900 overflow-hidden">
            
            {/* Main Stage: Canvas Zoom and Tool Controller */}
            <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
                
                {/* Floating Top Controls */}
                <div className="absolute top-4 left-4 z-40 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-lg">
                    <button 
                        type="button"
                        onClick={() => setSlideZoom(z => Math.max(0.7, z - 0.15))} 
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                        title="Zooma ut"
                    >
                        <ZoomOut size={15} />
                    </button>
                    <span className="text-[11px] font-black w-10 text-center text-slate-700">
                        {Math.round(slideZoom * 100)}%
                    </span>
                    <button 
                        type="button"
                        onClick={() => setSlideZoom(z => Math.min(1.8, z + 0.15))} 
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                        title="Zooma in"
                    >
                        <ZoomIn size={15} />
                    </button>
                    <button 
                        type="button"
                        onClick={() => setSlideZoom(1)} 
                        className="px-2 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] font-black uppercase text-slate-600 flex items-center justify-center cursor-pointer"
                        title="Återställ zoom"
                    >
                        <RotateCcw size={13} />
                    </button>

                    <div className="w-px h-5 bg-slate-200 mx-0.5" />
                    <button 
                        type="button"
                        onClick={() => setIsDockCollapsed(c => !c)} 
                        className="px-2.5 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        {isDockCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
                        <span className="text-[10px] font-black uppercase hidden sm:inline">
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
                            // 🟢 Parity: Restored dynamic mathematical tool drawer allowlist
                            allowedTools: [
                                'select', 'pen', 'highlighter', 'eraser', 'line', 'color_picker', 'clear_all',
                                ...(slideDrawer ? [`drawer_${slideDrawer}`] : ['drawer_algebra', 'drawer_shapes', 'drawer_fractions', 'drawer_data'])
                            ],
                            readOnly: !!completedSlide[activeSlideIndex]
                        }}
                    />
                </div>
            </div>

            {/* Right Task Dock (Accordion-driven) */}
            <div 
                className={`transition-all duration-300 ease-in-out !bg-white !text-slate-800 border-l border-slate-200 shadow-2xl flex flex-col z-20 shrink-0 ${
                    isDockCollapsed ? 'w-0 overflow-hidden border-none opacity-0' : 'w-full lg:w-[420px] h-auto lg:h-full opacity-100'
                }`}
                style={{ backgroundColor: '#ffffff', color: '#1e293b' }}
            >
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ListChecks size={16} className="text-indigo-600" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-800">
                            {lang === 'sv' ? "Dina Svar" : "Your Answers"}
                        </span>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setIsDockCollapsed(true)} 
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                        <PanelRightClose size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 !bg-white">
                    {/* 🟢 Parity: Restored Accordion behavior */}
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
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center group ${
                                        isDone 
                                            ? 'border-emerald-200 bg-emerald-50/60' 
                                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                                    }`}
                                >
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${isDone ? 'text-emerald-700' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                        {isFreeText ? "Diskussion" : `Svar ${displayIndex + 1}`}
                                    </span>
                                    {isDone ? <CheckCircle2 size={18} className="text-emerald-600" /> : <ChevronDown size={18} className="text-slate-400 group-hover:text-slate-600" />}
                                </div>
                            );
                        }

                        // Expanded Task Card
                        return (
                            <div key={qId} className={`p-5 rounded-2xl border-2 transition-all !bg-white text-slate-800 ${
                                isDone 
                                    ? 'border-emerald-200 bg-emerald-50/30 opacity-70' 
                                    : 'border-indigo-400 shadow-md ring-4 ring-indigo-50'
                            }`}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                                        {isFreeText ? "Diskussion" : `Svar ${displayIndex + 1}`}
                                    </span>
                                    {isDone && <CheckCircle2 size={16} className="text-emerald-600" />}
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
                                    {renderTaskInput(localIdx)}
                                </div>
                            </div>
                        );
                    })}

                    {/* Pure Manipulative Slide Canvas State */}
                    {(currentSlide?.activeIds || []).length === 0 && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                                    {lang === 'sv' ? "Taveluppgift" : "Canvas Task"}
                                </h4>
                                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                                    {lang === 'sv' 
                                        ? "Rita och använd verktygen på tavlan till vänster. Skriv gärna en förklaring nedan innan du lämnar in." 
                                        : "Draw and manipulate tools on the canvas to the left. Add an optional explanation below before submitting."}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 block">
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
                                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 resize-none transition-colors"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Submit Button */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
                    <button
                        type="button"
                        onClick={handleSlideSubmit}
                        disabled={isSubmitting || completedSlide[activeSlideIndex]}
                        className={`w-full py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            completedSlide[activeSlideIndex]
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white'
                        }`}
                    >
                        {completedSlide[activeSlideIndex] ? (
                            <>
                                <CheckCircle2 size={16} />
                                <span>{lang === 'sv' ? "Inskickat" : "Submitted"}</span>
                            </>
                        ) : (
                            <>
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                <span>{lang === 'sv' ? "Skicka in svar & tavla" : "Submit answers & board"}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </main>
    );
}