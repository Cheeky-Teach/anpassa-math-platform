// src/components/views/StudentLiveView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    Send, CheckCircle2, ChevronLeft, ChevronRight, Loader2, LogOut, 
    ListChecks, LayoutGrid, XCircle, ChevronDown, PanelRightClose, PanelRightOpen, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import MathScratchpad from '../ui/MathScratchpad';

// --- VISUAL & INPUT IMPORTS ---
import VisualRenderer from '../visuals/VisualRenderer';
import WordProblemVisualGuard from '../ui/WordProblemVisualGuard';
import PreferencesToggle from '../ui/PreferencesToggle';
import { syncProgress } from '../../lib/progressSync';
import SmartMathInput from '../ui/SmartMathInput.jsx';
import InteractiveCanvas from '../whiteboard/InteractiveCanvas';

// --- SHARED PRESENTATION RENDERERS ---
import SlideRenderer from '../shared/SlideRenderer';
import MathDisplay from '../shared/MathDisplay';

export default function StudentLiveView({ session, packet, lang = 'sv', studentAlias, onBack }) {
    // 1. SETTINGS & FEATURE FLAGS
    const settings = session?.active_question_data?.settings || { pacing: 'open', order: 'original', summary: true };
    const allowScratchpad = settings.allowScratchpad ?? (settings.scratchpad !== false);
    const allowCanvas = settings.allowCanvas === true;
    const responseStyle = settings.responseStyle || 'flexible';

    // Presentation Mode Flags & Data
    const isPresentationMode = session?.active_question_data?.mode === 'presentation';
    const slides = session?.active_question_data?.slides || [];
    const globalZoom = session?.active_question_data?.settings?.globalZoom || 1.0;
    
    // Navigation & Slide State
    const [localPacket, setLocalPacket] = useState([]); 
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [activeSlideIndex, setActiveSlideIndex] = useState(session?.current_slide_index || 0); 
    const [activeTaskId, setActiveTaskId] = useState(null);

    // Current Slide Metadata
    const currentSlide = slides[activeSlideIndex];
    const slideDrawer = currentSlide?.activeDrawer || (currentSlide?.labType ? currentSlide.labType : null);
    

    // Responsive & Viewport Layout State
    const [slideZoom, setSlideZoom] = useState(1);
    const [isDockCollapsed, setIsDockCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Student Answers & Canvas Elements
    const [answers, setAnswers] = useState({});
    const [completed, setCompleted] = useState({}); 
    const [completedSlide, setCompletedSlide] = useState({});
    const [selectedChoices, setSelectedChoices] = useState({});
    const [scratchpad, setScratchpad] = useState({}); 
    const [canvasElements, setCanvasElements] = useState({});
    const [slideExplanations, setSlideExplanations] = useState({});

    // Network & Session Status
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roomActive, setRoomActive] = useState(true);
    const [showFinalReview, setShowFinalReview] = useState(false);

    // Sync accordion task selection on slide changes
    useEffect(() => {
        if (isPresentationMode && slides[activeSlideIndex]?.activeIds?.length > 0) {
            setActiveTaskId(slides[activeSlideIndex].activeIds[0]);
        }
    }, [activeSlideIndex, isPresentationMode, slides]);

    // Track mobile breakpoints
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setIsDockCollapsed(true);
        };
        checkMobile(); 
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 2. INITIALIZATION & REHYDRATION
    useEffect(() => {
        const initializeSession = async () => {
            const safePacket = Array.isArray(packet) ? packet : [];
            let mappedPacket = safePacket.map((item, index) => ({ ...item, originalIndex: index }));
            
            if (settings.order === 'randomized' && settings.pacing !== 'teacher' && !isPresentationMode) {
                for (let i = mappedPacket.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [mappedPacket[i], mappedPacket[j]] = [mappedPacket[j], mappedPacket[i]];
                }
            }
            setLocalPacket(mappedPacket);

            try {
                const { data: pastResponses, error } = await supabase
                    .from('responses')
                    .select('*')
                    .eq('room_id', session.id)
                    .eq('student_alias', studentAlias);

                if (!error && pastResponses && pastResponses.length > 0) {
                    const restoredAnswers = {};
                    const restoredCompleted = {};
                    const restoredScratchpad = {};
                    const restoredCanvas = {};
                    const restoredCompletedSlides = {};

                    pastResponses.forEach(res => {
                        if (res.is_slide_submission) {
                            restoredCompletedSlides[res.question_index] = true;
                            if (res.canvas_state) {
                                restoredCanvas[res.question_index] = res.canvas_state;
                            }
                            return;
                        }

                        const localIdx = mappedPacket.findIndex(p => p.originalIndex === res.question_index);
                        if (localIdx !== -1) {
                            restoredAnswers[localIdx] = res.answer;
                            restoredCompleted[localIdx] = (mappedPacket[localIdx].answerType === 'free_text' || res.is_correct) ? 'correct' : 'wrong';
                            restoredScratchpad[localIdx] = res.work_steps || [''];
                            if (allowCanvas && res.canvas_state) {
                                restoredCanvas[localIdx] = res.canvas_state;
                            }
                        }
                    });

                    setCanvasElements(restoredCanvas);
                    setScratchpad(restoredScratchpad);
                    setAnswers(restoredAnswers);
                    setCompleted(restoredCompleted);
                    setCompletedSlide(restoredCompletedSlides);

                    if (Object.keys(restoredCompleted).length > 0) {
                        syncProgress('student_session_rehydrated', {
                            app_mode: 'student_live',
                            restored_answer_count: Object.keys(restoredCompleted).length
                        });
                    }

                    if (!isPresentationMode) {
                        const answeredCount = Object.keys(restoredCompleted).length;
                        if (answeredCount < mappedPacket.length) {
                            const firstUnanswered = mappedPacket.findIndex((_, idx) => !restoredCompleted[idx]);
                            setCurrentIndex(firstUnanswered !== -1 ? firstUnanswered : answeredCount);
                        } else {
                            setShowFinalReview(settings.summary);
                        }
                    }
                }
            } catch (err) {
                console.error("Rehydration failed:", err);
            }
        };
        
        initializeSession();
    }, [packet, session.id, studentAlias, isPresentationMode]);

    // WebSocket state trackers
    const completedRef = useRef(completed);
    const localPacketRef = useRef(localPacket);

    useEffect(() => {
        completedRef.current = completed;
        localPacketRef.current = localPacket;
    }, [completed, localPacket]);

    // 3. MASTER REAL-TIME SYNC
    useEffect(() => {
        if (!session?.id) return;
        
        const masterChannel = supabase.channel(`student_sync_${session.id}`)
            .on('postgres_changes', { 
                event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${session.id}` 
            }, (payload) => {
                const newData = payload.new;

                if (newData.status === 'closed') {
                    setRoomActive(false);
                    setTimeout(onBack, 4000);
                    return;
                }

                const kickedList = newData.kicked_students || [];
                if (kickedList.includes(studentAlias)) {
                    alert(lang === 'sv' ? "Du har blivit borttagen från sessionen." : "You have been removed from the session.");
                    onBack();
                    return;
                }

                if (isPresentationMode) {
                    if (newData.current_slide_index !== null && newData.current_slide_index !== undefined) {
                        setActiveSlideIndex(parseInt(newData.current_slide_index, 10));
                    }

                    if (newData.active_question_data?.packet) {
                        const incomingPacket = newData.active_question_data.packet;
                        let hasChanges = false;
                        const changedIndices = [];
                        const newLocalPacket = [...localPacketRef.current];

                        incomingPacket.forEach((newItem, idx) => {
                            const oldItem = newLocalPacket[idx];
                            if (oldItem && newItem.regenVersion && newItem.regenVersion !== oldItem.regenVersion) {
                                hasChanges = true;
                                changedIndices.push(idx);
                                newLocalPacket[idx] = { ...newItem, originalIndex: idx };
                            }
                        });

                        if (hasChanges) {
                            setLocalPacket(newLocalPacket);
                            setAnswers(prev => { const next = { ...prev }; changedIndices.forEach(i => delete next[i]); return next; });
                            setScratchpad(prev => { const next = { ...prev }; changedIndices.forEach(i => delete next[i]); return next; });
                            setCanvasElements(prev => { const next = { ...prev }; changedIndices.forEach(i => delete next[i]); return next; });
                            setCompleted(prev => { const next = { ...prev }; changedIndices.forEach(i => delete next[i]); return next; });

                            const currentSlideIds = newData.active_question_data.slides?.[newData.current_slide_index ?? activeSlideIndex]?.activeIds || [];
                            if (currentSlideIds.length > 0) {
                                setActiveTaskId(currentSlideIds[0]);
                            }
                        }
                    }
                    return;
                }

                if (!isPresentationMode && settings.pacing === 'teacher' && newData.current_question_index !== null && newData.current_question_index !== undefined) {
                    const newTeacherIndex = parseInt(newData.current_question_index, 10);
                    
                    setCurrentIndex((prevIndex) => {
                        const currentCompleted = completedRef.current;
                        const currentPacket = localPacketRef.current;
                        
                        if (newTeacherIndex > prevIndex && !currentCompleted[prevIndex]) {
                            const timeoutAnswer = "[TIMEOUT]";
                            supabase.from('responses').insert([{
                                room_id: session.id,
                                student_alias: (studentAlias || "Anonym").replace(/<[^>]*>?/gm, '').substring(0, 25), 
                                question_index: currentPacket[prevIndex].originalIndex, 
                                answer: timeoutAnswer, 
                                is_correct: false,
                                is_manually_corrected: false 
                            }]).then(() => {
                                setAnswers(prev => ({ ...prev, [prevIndex]: timeoutAnswer }));
                                setCompleted(prev => ({ ...prev, [prevIndex]: 'wrong' }));
                            });
                        }
                        return newTeacherIndex;
                    });
                }
            })
            .subscribe();
            
        return () => { supabase.removeChannel(masterChannel); };
    }, [session?.id, onBack, studentAlias, lang, isPresentationMode, activeSlideIndex]);

    const handleUnifiedPresentationSubmit = async () => {
        if (isSubmitting || completedSlide[activeSlideIndex]) return;
        setIsSubmitting(true);

        try {
            const explanationText = slideExplanations[activeSlideIndex] || "";
            const currentSlideIds = slides[activeSlideIndex]?.activeIds || [];
            
            // If the slide has attached questions, let's submit them along with the canvas state
            if (currentSlideIds.length > 0) {
                for (const qId of currentSlideIds) {
                    const localIdx = localPacket.findIndex(p => p.id === qId);
                    if (localIdx !== -1 && !completed[localIdx]) {
                        await handleUnifiedSubmit(localIdx);
                    }
                }
            }

            // Also submit the overall slide/canvas response
            const payload = {
                room_id: session.id,
                student_alias: (studentAlias || "Anonym").replace(/<[^>]*>?/gm, '').substring(0, 25),
                question_index: activeSlideIndex,
                answer: explanationText.trim() ? explanationText.trim() : "[SLIDE_CANVAS_SUBMISSION]",
                canvas_state: canvasElements[activeSlideIndex] || slides[activeSlideIndex]?.elements || [],
                is_correct: true
            };

            const { error } = await supabase.from('responses').insert([payload]);
            if (error) throw error;

            setCompletedSlide(prev => ({ ...prev, [activeSlideIndex]: true }));
        } catch (err) {
            console.error("Unified presentation submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnifiedSubmit = async (forcedLocalIdx = null) => {
        const targetIdx = forcedLocalIdx !== null ? forcedLocalIdx : currentIndex;
        const currentItem = localPacket[targetIdx];
        if (!currentItem || isSubmitting || !roomActive || completed[targetIdx]) return;

        const isFreeText = currentItem.answerType === 'free_text';
        const rawAnswer = answers[targetIdx];
        const canvasData = canvasElements[targetIdx] || currentItem?.canvas_state || [];
        const scratchpadSteps = allowScratchpad ? (scratchpad[targetIdx] || []).filter(s => s.trim().length > 0) : [];

        // 1. Determine if the student has provided *anything* substantial to submit
        const hasAnswer = rawAnswer !== undefined && String(rawAnswer).trim() !== "";
        const hasCanvas = allowCanvas && canvasData.length > 0;
        const hasScratchpad = scratchpadSteps.length > 0;

        // If nothing at all has been filled out, do nothing
        if (!hasAnswer && !hasCanvas && !hasScratchpad) {
            alert(lang === 'sv' ? "Vänligen fyll i ett svar eller rita på tavlan innan du skickar in." : "Please provide an answer or draw on the canvas before submitting.");
            return;
        }

        // 2. Evaluate correctness (if it's a scored question and an answer was given)
        let isCorrect = true; 
        let finalAnswerToSave = rawAnswer;

        if (isFreeText) {
            // Free text / discussions are marked correct by default once submitted
            finalAnswerToSave = rawAnswer || "[DISKUSSIONSUPPGIFT]";
            isCorrect = true;
        } else if (hasAnswer) {
            const normalize = (str) => String(str).toLowerCase().replace(/\s+/g, '').replace(',', '.').replace(/^[a-z]=/, '').replace(/^svar:/, '').replace(/·/g, '*');
            let correctAnswer = currentItem.resolvedData?.answer;
            if (!correctAnswer && currentItem.resolvedData?.token) {
                try { 
                    const binaryString = atob(currentItem.resolvedData.token);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
                    correctAnswer = new TextDecoder().decode(bytes); 
                } catch (e) {
                    correctAnswer = atob(currentItem.resolvedData.token);
                }
            }
            isCorrect = normalize(rawAnswer) === normalize(correctAnswer);
        } else {
            // Canvas-only or scratchpad-only submission with no final numeric answer box filled out
            finalAnswerToSave = "[ENDAST_ARBETE / CANVAS]";
            isCorrect = true; // Teacher will manually review canvas work
        }

        setIsSubmitting(true);

        try {
            const { data: roomCheck } = await supabase.from('rooms').select('status').eq('id', session.id).single();
            if (roomCheck?.status !== 'active') {
                setRoomActive(false); 
                setTimeout(onBack, 3000);
                return; 
            }

            syncProgress('student_answer_submitted', {
                app_mode: 'student_live',
                topic: currentItem.topicId || 'unknown',
                level: currentItem.resolvedData?.level || currentItem.metadata?.difficulty || 1,
                answer_type: currentItem.answerType || 'unknown',
                is_correct: isCorrect,
                used_scratchpad: hasScratchpad,
                used_canvas: hasCanvas,
                student_answer: String(finalAnswerToSave).substring(0, 100)
            });

            // 3. Build the comprehensive payload respecting all available edge cases
            const payload = {
                room_id: session.id,
                student_alias: (studentAlias || "Anonym").replace(/<[^>]*>?/gm, '').substring(0, 25), 
                question_index: currentItem.originalIndex, 
                answer: String(finalAnswerToSave).substring(0, 1500),
                work_steps: scratchpadSteps,
                is_correct: isCorrect,
            };

            if (allowCanvas) {
                payload.canvas_state = canvasData;
            }

            const { error } = await supabase.from('responses').insert([payload]);
            if (error) throw error;
            
            setCompleted(prev => ({ ...prev, [targetIdx]: isCorrect ? 'correct' : 'wrong' }));
            
            // Advance pacing state
            if (isPresentationMode) {
                const currentSlideIds = slides[activeSlideIndex]?.activeIds || [];
                const currentTaskPos = currentSlideIds.indexOf(currentItem.id);
                
                if (currentTaskPos !== -1 && currentTaskPos < currentSlideIds.length - 1) {
                    const nextId = currentSlideIds.slice(currentTaskPos + 1).find(id => {
                        const localIndex = localPacket.findIndex(p => p.id === id);
                        return !completedRef.current[localIndex];
                    });
                    
                    if (nextId) setActiveTaskId(nextId);
                    else setActiveTaskId(currentSlideIds[currentTaskPos + 1]);
                }
            } else if (settings.pacing !== 'teacher') {
                if (targetIdx < localPacket.length - 1) {
                    setTimeout(() => setCurrentIndex(prev => prev + 1), 600);
                } else if (targetIdx === localPacket.length - 1) {
                    setTimeout(() => setCompleted(prev => ({ ...prev })), 600);
                }
            }
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. COMPONENT WORK & INPUT RENDERERS
    const renderWorkArea = (idx) => {
        const isFreeText = localPacket[idx]?.answerType === 'free_text';
        const isCompleted = !!completed[idx];
        if (isCompleted) return null;

        const showCanvas = !isPresentationMode && allowCanvas && responseStyle !== 'scratchpad_only';
        const showScratchpad = allowScratchpad && !isFreeText && responseStyle !== 'canvas_only';

        if (!showCanvas && !showScratchpad) return null;

        const initialCanvasElements = localPacket[idx]?.canvas_state || [];

        return (
            <div className="space-y-4 mb-4">
                {showCanvas && (
                    <div className="w-full h-72 relative border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white shadow-inner">
                        <InteractiveCanvas
                            lang={lang}
                            elements={canvasElements[idx] || initialCanvasElements}
                            setElements={(newEls) => setCanvasElements(prev => ({
                                ...prev,
                                [idx]: typeof newEls === 'function' ? newEls(prev[idx] || initialCanvasElements) : newEls
                            }))}
                            resolution={{ w: 1920, h: 1080 }}
                            toolbarMode="student"
                        />
                    </div>
                )}

                {showScratchpad && (
                    <MathScratchpad
                        steps={scratchpad[idx] || ['']}
                        onChange={(steps) => setScratchpad(prev => ({ ...prev, [idx]: steps }))}
                        disabled={isSubmitting || isCompleted}
                        lang={lang}
                    />
                )}
            </div>
        );
    };

    const renderInput = (idx = currentIndex) => {
        const item = localPacket[idx];
        if (!item) return null;

        const rd = item.resolvedData?.renderData;

        if (rd?.answerType === 'multiple_choice' || (rd?.options && Array.isArray(rd.options))) {
            const currentSelected = selectedChoices[idx];
            const isCompleted = !!completed[idx];

            return (
                <div className="flex flex-col gap-3 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto">
                    <div className="grid grid-cols-1 gap-3 w-full">
                        {(rd.options || []).map((opt, i) => {
                            const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                            const choiceValue = typeof opt === 'object' ? opt.value : opt;
                            const isSelected = currentSelected === choiceValue;

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    disabled={isCompleted || isSubmitting}
                                    onClick={() => {
                                        if (isCompleted) return;
                                        setSelectedChoices(prev => ({ ...prev, [idx]: choiceValue }));
                                        setAnswers(prev => ({ ...prev, [idx]: choiceValue }));
                                        // No auto-submit here; student clicks the single unified button below
                                    }}
                                    className={`w-full p-4 border-2 rounded-2xl text-base font-bold transition-all shadow-sm text-center cursor-pointer active:scale-95 ${
                                        isSelected 
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-400' 
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-slate-50'
                                    } ${isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <MathDisplay content={String(choiceLabel)} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        const inputType = item.answerType || rd?.answerType || rd?.inputType || item.resolvedData?.inputType || 'text';
        const value = answers[idx] || '';

        return (
            <SmartMathInput 
                value={value}
                onChange={(val) => setAnswers({ ...answers, [idx]: val })}
                onSubmit={() => handleUnifiedSubmit(null, idx)} // 👈 Pressing Enter now triggers the unified submit!
                inputType={inputType}
                disabled={isSubmitting || !!completed[idx]}
                isMobile={isMobile}
            />
        );
    };

    // 6. INITIAL SCREEN GUARDS
    const isReady = isPresentationMode 
        ? (slides && slides.length > 0) 
        : (localPacket && localPacket.length > 0);

    if (!isReady) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-indigo-600" size={36} />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {lang === 'sv' ? "Laddar presentation..." : "Loading presentation..."}
                </span>
            </div>
        );
    }

    // 7. REVIEW GRID RENDER
    if (showFinalReview) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white"><LayoutGrid size={20} /></div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">{lang === 'sv' ? "Resultatsöversikt" : "Result overview"}</h2>
                    </div>
                    <button onClick={onBack} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-indigo-600 transition-all cursor-pointer">Stäng</button>
                </header>
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {localPacket.map((item, idx) => {
                        const hasVisual = item.resolvedData?.renderData && 
                            (item.resolvedData.renderData.graph || 
                             item.resolvedData.renderData.geometry || 
                             item.resolvedData.renderData.pattern);
                        const isFreeText = item.answerType === 'free_text';

                        return (
                            <div key={item.id} className={`whiteboard-protect p-6 rounded-[2.5rem] border-4 shadow-xl flex flex-col justify-between ${completed[idx] === 'correct' ? (isFreeText ? 'border-blue-500 shadow-blue-50/50' : 'border-emerald-500 shadow-emerald-50/50') : 'border-rose-400 shadow-rose-50/50'}`}>
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{lang === 'sv' ? "Uppgift" : "Question"} {idx + 1}</span>
                                        {completed[idx] === 'correct' ? <CheckCircle2 className={isFreeText ? "text-blue-500" : "text-emerald-500"} size={24} /> : <XCircle className="text-rose-400" size={24} />}
                                    </div>
                                    
                                    {hasVisual && (
                                        <div className="w-full flex justify-center bg-slate-50/50 p-4 rounded-2xl mb-4 border border-slate-100 overflow-hidden">
                                            <div className="scale-75 origin-center max-h-[160px] flex items-center justify-center">
                                                <VisualRenderer 
                                                    data={item.resolvedData?.renderData} 
                                                    isWordProblem={!!item.resolvedData?.renderData?.isWordProblemApplied} 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3 text-slate-700">
                                        <div className="text-sm font-bold leading-relaxed">
                                            <MathDisplay content={item.resolvedData?.renderData?.description || item.text} />
                                        </div>
                                        {item.resolvedData?.renderData?.latex && (
                                            <div className="py-2 bg-indigo-50/30 rounded-xl text-center font-serif text-base border border-indigo-100/40">
                                                <MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className={`w-full py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest truncate ${completed[idx] === 'correct' ? (isFreeText ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600 text-center') : 'bg-rose-50 text-rose-500 text-center'}`}>
                                        {isFreeText ? (
                                            <span className="text-[10px] opacity-80 mr-2 block text-left normal-case tracking-normal truncate">{answers[idx] || '-'}</span>
                                        ) : (
                                            <>{lang === 'sv' ? "Ditt Svar:" : "Your Answer:"} {answers[idx] || '-'}</>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // 8. WORKSHEET COMPLETED SCREEN
    const allDone = Object.keys(completed).length === packet.length;
    if (allDone && !isPresentationMode) { 
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-white rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in duration-500 border-b-8 border-indigo-100">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <ListChecks size={40} className="text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2 italic">{lang === 'sv' ? "Aktivitet klar" : "Activity done"}</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-10">{lang === 'sv' ? "Alla svar skickades in." : "All answers have been submitted."}</p>
                    
                    <button 
                        onClick={() => {
                            syncProgress('student_reviewed_results', { app_mode: 'student_live' });
                            setShowFinalReview(true);
                        }} 
                        className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.15em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                        <LayoutGrid size={20} /> {lang === 'sv' ? "Granska resultat" : "Preview results"}
                    </button>
                </div>
            </div>
        );
    }

    // 9. ROOM TERMINATION SCREEN
    if (!roomActive) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-rose-500">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={40} className="text-rose-600 ml-1" /></div>
                    <h2 className="text-2xl font-black uppercase text-slate-900 mb-2 tracking-tighter">{lang === 'sv' ? "Session avslutad." : "Session ended."}</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">{lang === 'sv' ? "Läraren har stängt rummet. Du skickas strax vidare." : "The teacher has closed the room. You will be redirected shortly."}</p>
                </div>
            </div>
        );
    }

    const handleExitRequest = () => {
        const msg = lang === 'sv' 
            ? "Är du säker på att du vill lämna sessionen? Du kan inte fortsätta där du var sist om du lämnar nu." 
            : "Are you sure you want to leave the session? You cannot continue where you left off if you leave before finishing.";
        if (window.confirm(msg)) {
            syncProgress('student_abandoned_session', { app_mode: 'student_live' });
            onBack();
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] font-sans flex flex-col overflow-hidden transition-colors duration-500">
            <header className="bg-[var(--bg-card)] border-b border-[var(--border-main)] px-4 py-3 sticky top-0 z-50 transition-colors duration-500 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
                    <div className="flex flex-col flex-1">
                        <h1 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest leading-none truncate mb-1">
                            {session.title}
                        </h1>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1">
                            <span>{studentAlias}</span>
                            <span className="opacity-50">•</span>
                            <span className="uppercase">{session.class_code}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <PreferencesToggle />
                        <button onClick={handleExitRequest} className="p-2 hover:bg-[var(--theme-rose-bg)] rounded-xl text-[var(--text-muted)] hover:text-[var(--theme-rose-text)] transition-colors"><LogOut size={18} /></button>
                    </div>
                </div>

                {!isPresentationMode && (
                    <div className="hidden sm:flex max-w-xs mx-auto h-1 bg-[var(--bg-surface)] rounded-full gap-1 p-0 mt-3">
                        {localPacket.map((_, i) => (
                            <div key={i} className={`flex-1 rounded-full transition-all duration-700 ${i === currentIndex ? 'bg-[var(--brand-solid)] ring-2 ring-[var(--brand-solid)]/20' : !!completed[i] ? 'bg-[var(--border-strong)]' : 'bg-transparent'}`} />
                        ))}
                    </div>
                )}
            </header>

            {/* PRESENTATION MODE VIEWPORT */}
            {isPresentationMode ? (
                <main className="flex-1 w-full h-[calc(100vh-64px)] flex flex-col lg:flex-row relative bg-slate-900 overflow-hidden">
                    
                    {/* LEFT / MAIN STAGE: The Scalable 16:9 Slide Canvas */}
                    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
                        
                        {/* Floating Top Controls: Zoom & Sidebar Toggle */}
                        <div className="absolute top-4 left-4 z-40 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-lg">
                            <button 
                                type="button"
                                onClick={() => setSlideZoom(z => Math.max(0.7, z - 0.15))} 
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
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
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
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

                            {/* Collapse/Expand Accordion Toggle */}
                            <div className="w-px h-5 bg-slate-200 mx-0.5" />
                            <button
                                type="button"
                                onClick={() => setIsDockCollapsed(c => !c)}
                                className="px-2.5 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                                title={isDockCollapsed ? "Visa uppgifter" : "Dölj uppgifter"}
                            >
                                {isDockCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
                                <span className="text-[10px] font-black uppercase hidden sm:inline">
                                    {isDockCollapsed ? "Svara" : "Fokus"}
                                </span>
                            </button>
                        </div>

                        {/* Scalable Slide Container with High-Contrast Stage Boundary */}
                        <div 
                            className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
                            style={{ transform: `scale(${slideZoom})`, transformOrigin: 'center center' }}
                        >
                            <div className="relative w-full aspect-video max-w-[1600px] max-h-[900px] bg-[#f9fbf7] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-slate-700">
                                {/* Base Slide Content */}
                                <SlideRenderer
                                    activeIds={slides[activeSlideIndex]?.activeIds || []}
                                    livePacket={localPacket}
                                    lang={lang}
                                    sizeClasses={{
                                        desc: 'text-m',
                                        latex: 'text-xl',
                                        clue: 'text-m',
                                        headerText: 'text-l',
                                        visualClass: 'scale-100 max-h-[180px] mb-2'
                                    }}
                                    authorMode={false}
                                    globalZoom={globalZoom}
                                />

                                {/* Interactive Canvas with Slide-Specific Bins */}
                                <InteractiveCanvas
                                    key={`student_slide_canvas_${activeSlideIndex}`}
                                    elements={canvasElements[activeSlideIndex] || currentSlide?.elements || []}
                                    setElements={(newEls) => setCanvasElements(prev => ({
                                        ...prev,
                                        [activeSlideIndex]: typeof newEls === 'function' 
                                            ? newEls(prev[activeSlideIndex] || currentSlide?.elements || []) 
                                            : newEls
                                    }))}
                                    resolution={{ w: 1920, h: 1080 }}
                                    toolbarMode="student"
                                    allowedTools={[
                                        'select', 'pen', 'highlighter', 'eraser', 'line', 'color_picker', 'clear_all',
                                        ...(slideDrawer ? [`drawer_${slideDrawer}`] : ['drawer_algebra', 'drawer_shapes', 'drawer_fractions', 'drawer_data'])
                                    ]}
                                    readOnly={!!completedSlide[activeSlideIndex]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT DOCK: Locked Light-Mode "Dina Svar" Container */}
                    <div 
                        className={`transition-all duration-300 ease-in-out !bg-white !text-slate-800 border-l border-slate-200 shadow-2xl flex flex-col z-20 shrink-0 ${
                            isDockCollapsed ? 'w-0 overflow-hidden border-none opacity-0' : 'w-full lg:w-[420px] h-auto lg:h-full opacity-100'
                        }`}
                        style={{ backgroundColor: '#ffffff', color: '#1e293b' }}
                    >
                        {/* Dock Header */}
                        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ListChecks size={16} className="text-indigo-600" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-800">
                                    {lang === 'sv' ? "Dina Svar" : "Your Answers"}
                                </span>
                            </div>
                            <button 
                                onClick={() => setIsDockCollapsed(true)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                                title="Dölj panel"
                            >
                                <PanelRightClose size={16} />
                            </button>
                        </div>
                        
                        {/* Scrollable Questions / Task List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 !bg-white">
                            {(slides[activeSlideIndex]?.activeIds || []).map((qId, displayIndex) => {
                                const localIdx = localPacket.findIndex(p => p.id === qId);
                                if (localIdx === -1) return null;
                                
                                const isCompleted = !!completed[localIdx];
                                const isFreeText = localPacket[localIdx].answerType === 'free_text';
                                const isActive = activeTaskId === qId;

                                if (!isActive) {
                                    return (
                                        <div 
                                            key={qId} 
                                            onClick={() => setActiveTaskId(qId)}
                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center group ${
                                                isCompleted 
                                                    ? 'border-emerald-200 bg-emerald-50/60' 
                                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-700' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                                {isFreeText ? "Diskussion" : `Svar ${displayIndex + 1}`}
                                            </span>
                                            {isCompleted ? <CheckCircle2 size={18} className="text-emerald-600" /> : <ChevronDown size={18} className="text-slate-400 group-hover:text-slate-600" />}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={qId} className={`p-5 rounded-2xl border-2 transition-all !bg-white text-slate-800 ${
                                        isCompleted 
                                            ? 'border-emerald-200 bg-emerald-50/30 opacity-70' 
                                            : 'border-indigo-400 shadow-md ring-4 ring-indigo-50'
                                    }`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                                                {isFreeText ? "Diskussion" : `Svar ${displayIndex + 1}`}
                                            </span>
                                            {isCompleted && <CheckCircle2 size={16} className="text-emerald-600" />}
                                        </div>
                                        
                                        {renderWorkArea(localIdx)}

                                        <div className="mb-3">
                                            {renderInput(localIdx)}
                                        </div>

                                        {/* Note: The card-level submit button for individual questions inside the accordion list was removed here so there is only one global submit button at the bottom of the dock */}
                                    </div>
                                );
                            })}

                            {/* Canvas-Only State: Light-Themed Prompt and Explanation Textarea */}
                            {(slides[activeSlideIndex]?.activeIds || []).length === 0 && (
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

                        {/* Dock Footer: Unified Submit Area */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={handleUnifiedPresentationSubmit}
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

                              {completedSlide[activeSlideIndex] && (
                                  <button
                                    type="button"
                                    onClick={() => setCompletedSlide(prev => ({ ...prev, [activeSlideIndex]: false }))}
                                    className="w-full py-1.5 text-center text-slate-500 hover:text-slate-800 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    {lang === 'sv' ? "Ändra och skicka igen" : "Edit and resubmit"}
                                </button>
                          )}
                        </div>
                    </div>
              </main>
            ) : (
                /* WORKSHEET MODE LAYOUT */
                <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 overflow-hidden flex flex-col">
                    <div className={`flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden transition-all duration-300 ${!!completed[currentIndex] ? 'opacity-40 scale-[0.98] pointer-events-none' : ''}`}>
                        
                        {/* LEFT: Question and Visual */}
                        <div className="flex-[3] whiteboard-protect rounded-[2rem] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative min-h-[300px]">
                            {settings.pacing === 'open' && (
                                <div className="absolute top-4 left-4 right-4 flex justify-between z-50 pointer-events-none">
                                    <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className="w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center pointer-events-auto hover:bg-indigo-50 transition-all disabled:opacity-0 text-slate-600"><ChevronLeft/></button>
                                    <button onClick={() => setCurrentIndex(prev => Math.min(localPacket.length - 1, prev + 1))} disabled={currentIndex === localPacket.length - 1} className="w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center pointer-events-auto hover:bg-indigo-50 transition-all disabled:opacity-0 text-slate-600"><ChevronRight/></button>
                                </div>
                            )}

                            <div className="px-6 py-4 lg:px-10 lg:py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                                <span className="text-sm font-bold text-slate-500">
                                    {lang === 'sv' ? "Uppgift" : "Question"} {currentIndex + 1} av {packet.length}
                                </span>
                                {!!completed[currentIndex] && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-emerald-600">{lang === 'sv' ? "Svar mottaget" : "Answer received"}</span>
                                        <CheckCircle2 className="text-emerald-500" size={18} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
                                <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center space-y-6 order-2 lg:order-1">
                                    <div className="text-xl lg:text-2xl font-bold text-slate-800 leading-relaxed">
                                        <MathDisplay content={localPacket[currentIndex]?.resolvedData?.renderData?.description || localPacket[currentIndex]?.text} />
                                    </div>
                                    
                                    {localPacket[currentIndex]?.resolvedData?.renderData?.latex && 
                                     !localPacket[currentIndex].resolvedData?.renderData?.isWordProblemApplied && 
                                     !localPacket[currentIndex].resolvedData?.renderData?.geometry && (
                                        <div className="w-full bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 lg:p-8 overflow-x-auto custom-scrollbar">
                                            <div className="min-w-max flex justify-center">
                                                <div className="text-2xl lg:text-4xl text-indigo-600 font-serif">
                                                    <MathDisplay content={`$$${localPacket[currentIndex].resolvedData.renderData.latex}$$`} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {localPacket[currentIndex]?.resolvedData?.renderData && 
                                (localPacket[currentIndex].resolvedData.renderData.graph || 
                                 localPacket[currentIndex].resolvedData.renderData.geometry || 
                                 localPacket[currentIndex].resolvedData.renderData.pattern) && (
                                    <div className="flex-1 p-6 lg:p-10 flex items-center justify-center bg-slate-50/50 border-b lg:border-b-0 lg:border-l border-slate-100 order-1 lg:order-2 shrink-0 min-h-[250px]">
                                        <WordProblemVisualGuard
                                            isActive={!!localPacket[currentIndex]?.resolvedData?.renderData?.isWordProblemApplied}
                                            lang={lang}
                                            questionKey={localPacket[currentIndex]?.id || currentIndex}
                                            allowReveal={false}
                                        >
                                            <div className="w-full h-full flex items-center justify-center drop-shadow-sm transform scale-90 lg:scale-100">
                                                <VisualRenderer 
                                                    data={localPacket[currentIndex]?.resolvedData?.renderData} 
                                                    isWordProblem={!!localPacket[currentIndex]?.resolvedData?.renderData?.isWordProblemApplied} 
                                                />
                                            </div>
                                        </WordProblemVisualGuard>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Input Area */}
                        <div className="flex-[2] lg:max-w-[450px] whiteboard-protect rounded-[2rem] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden shrink-0">
                            <div className="px-6 py-4 lg:px-10 lg:py-5 border-b border-slate-100 flex items-center bg-slate-50 shrink-0">
                                <span className="text-sm font-bold text-slate-500">{lang === 'sv' ? "Din lösning" : "Your solution"}</span>
                            </div>
                            
                            <div className="flex-1 p-4 lg:p-6 flex flex-col justify-between bg-white space-y-4">
                                {!completed[currentIndex] ? (
                                    <div className="w-full space-y-4">
                                        {renderWorkArea(currentIndex)}
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 block mb-1">
                                                {lang === 'sv' ? 'Slutsvar:' : 'Final Answer:'}
                                            </label>
                                            {renderInput()}
                                        </div>

                                        {/* 🟢 UNIFIED SUBMIT BUTTON: Sends Answer, Scratchpad, & Canvas Data Simultaneously */}
                                        <button 
                                            onClick={() => handleUnifiedSubmit()} 
                                            disabled={isSubmitting || !answers[currentIndex]} 
                                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-sm font-bold active:scale-95 disabled:opacity-30 hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> {lang === 'sv' ? 'Skicka in svar & arbete' : 'Submit answer & work'}</>}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                            <Loader2 className="animate-spin text-slate-300" size={24} />
                                        </div>
                                        <p className="text-sm text-slate-400 font-bold italic">
                                            {settings.pacing === 'teacher'
                                                ? (lang === 'sv' ? "Väntar på läraren..." : "Waiting for teacher...")
                                                : (lang === 'sv' ? "Laddar nästa..." : "Loading next...")
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
}