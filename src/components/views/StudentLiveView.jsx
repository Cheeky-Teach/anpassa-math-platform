import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, ChevronLeft, ChevronRight, Loader2, LogOut, ListChecks, LayoutGrid, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import MathScratchpad from '../ui/MathScratchpad';

// --- VISUAL & INPUT IMPORTS ---
import VisualRenderer from '../visuals/VisualRenderer';
import { FractionInput, ExponentInput, ScientificInput } from '../ui/InputComponents';
import WordProblemVisualGuard from '../ui/WordProblemVisualGuard';
import PreferencesToggle from '../ui/PreferencesToggle';

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
        const timer = setTimeout(renderMath, 30);
        return () => clearTimeout(timer);
    }, [content]);
    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap ${className}`} />;
};

export default function StudentLiveView({ session, packet, lang = 'sv', studentAlias, onBack }) {
    //  1. EXTRACT SETTINGS FROM SUPABASE
    const settings = session?.active_question_data?.settings || { pacing: 'open', order: 'original', summary: true };

    // Extract scratchpad setting
    const hasScratchpad = session?.active_question_data?.settings?.scratchpad !== false;

    // Logic & Navigation State
    const [localPacket, setLocalPacket] = useState([]); //  Holds our localized/shuffled array
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [completed, setCompleted] = useState({}); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roomActive, setRoomActive] = useState(true);
    const [showFinalReview, setShowFinalReview] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const [scratchpad, setScratchpad] = useState({}); // { [questionIdx]: ["step 1", "step 2"] }

    // ---  2. INITIALIZATION & REHYDRATION (Accidental Refresh Fix & Anti-Cheat) ---
    useEffect(() => {
        const initializeSession = async () => {
            // A. Map the original index so the teacher's grid stays perfectly synced
            let mappedPacket = packet.map((item, index) => ({ ...item, originalIndex: index }));
            
            // B. Anti-Cheat Shuffle (Only if randomized AND not in teacher-led mode)
            if (settings.order === 'randomized' && settings.pacing !== 'teacher') {
                for (let i = mappedPacket.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [mappedPacket[i], mappedPacket[j]] = [mappedPacket[j], mappedPacket[i]];
                }
            }
            setLocalPacket(mappedPacket);

            

            // C. Fetch past answers in case of an accidental page refresh!
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
                        pastResponses.forEach(res => {
                            const localIdx = mappedPacket.findIndex(p => p.originalIndex === res.question_index);
                            if (localIdx !== -1) {
                                restoredAnswers[localIdx] = res.answer;
                                restoredCompleted[localIdx] = res.is_correct ? 'correct' : 'wrong';
                                restoredScratchpad[localIdx] = res.work_steps || [''];
                            }
                        });
                        setScratchpad(restoredScratchpad);

                    setAnswers(restoredAnswers);
                    setCompleted(restoredCompleted);

                    

                    // Auto-jump to the first unanswered question
                    const answeredCount = Object.keys(restoredCompleted).length;
                    if (answeredCount < mappedPacket.length) {
                        const firstUnanswered = mappedPacket.findIndex((_, idx) => !restoredCompleted[idx]);
                        setCurrentIndex(firstUnanswered !== -1 ? firstUnanswered : answeredCount);
                    } else {
                        // If they finished everything, push them straight to the end
                        setShowFinalReview(settings.summary);
                    }
                }
            } catch (err) {
                console.error("Rehydration failed:", err);
            }
        };
        
        initializeSession();
    }, [packet, session.id, studentAlias]);

    useEffect(() => {
        const checkMobile = () => {
            // Disable autofocus on screens smaller than 768px (iPads/Phones)
            setIsMobile(window.innerWidth < 768); 
        };
        checkMobile(); // Check on mount
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // STATE TRACKERS FOR THE WEBSOCKET ---
    // These allow the real-time channel to access the latest data without restarting!
    const completedRef = useRef(completed);
    const localPacketRef = useRef(localPacket);

    useEffect(() => {
        completedRef.current = completed;
        localPacketRef.current = localPacket;
    }, [completed, localPacket]);

    // --- 1. MASTER REAL-TIME SYNC (Kill Switch, Blacklist, Teacher Pacing) ---
    useEffect(() => {
        if (!session?.id) return;
        
        const masterChannel = supabase.channel(`student_sync_${session.id}`)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'rooms', 
                filter: `id=eq.${session.id}` 
            }, (payload) => {
                const newData = payload.new;

                // A. Kill Switch Check
                if (newData.status === 'closed') {
                    setRoomActive(false);
                    setTimeout(onBack, 4000);
                    return;
                }

                // B. Blacklist Check
                const kickedList = newData.kicked_students || [];
                if (kickedList.includes(studentAlias)) {
                    alert(lang === 'sv' ? "Du har blivit borttagen från sessionen." : "You have been removed from the session.");
                    onBack();
                    return;
                }

                // C. Teacher Pacing Sync
                // 🟢 FIXED: The student now listens to the exact column the teacher is updating!
                if (settings.pacing === 'teacher' && newData.current_question_index !== null && newData.current_question_index !== undefined) {
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
    }, [session?.id, onBack, studentAlias, lang]);

    // --- 2. RELAXED INPUT SHIELDING ---
    const sanitizeInput = (val, type) => {
        let str = String(val).replace(/<[^>]*>?/gm, ''); 
        
        // Include 'mixed_fraction' so spaces aren't stripped
        if (type === 'fraction' || type === 'mixed_fraction') {
            return str.replace(/[^0-9\s/]/g, '');
        }
        
        // Include all structured types so carets ^ and semicolons ; are protected
        if (type === 'scientific' || type === 'exponent' || type === 'structured_power' || type === 'structured_scientific') {
            return str.replace(/[^a-zA-Z0-9+\-*/:.,><=^()\s;]/g, '');
        }
        
        return str.replace(/[^0-9.,*+\-xy=/: ]/gi, '');
    };

    // --- CONSISTENT & UTF-8 SAFE SUBMISSION ---
    const handleSolve = async (manualValue = null) => {
        // 1. Correctly handle numeric 0 (prevents 0 from being ignored)
        const val = (manualValue !== null && manualValue !== undefined) ? manualValue : answers[currentIndex];
        
        if (val === undefined || val === "" || isSubmitting || !roomActive) return;

        // 2. Enhanced Normalization (Matches answer.ts logic + Algebraic Support)
        const normalize = (str) => {
            return String(str)
                .toLowerCase()
                .replace(/\s+/g, '')       // Remove spaces
                .replace(',', '.')         // Swedish comma to dot
                .replace(/^[a-z]=/, '')    // Strip "x=" (e.g., student writes x=7)
                .replace(/^svar:/, '')     // Strip "svar:"
                .replace(/·/g, '*');       // Normalize dot to asterisk for safer comparison
        };
        
        let currentItem = localPacket[currentIndex]; //  Use localPacket
        let correctAnswer = currentItem.resolvedData?.answer;
        
        if (!correctAnswer && currentItem.resolvedData?.token) {
            try { 
                const binaryString = atob(currentItem.resolvedData.token);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                correctAnswer = new TextDecoder().decode(bytes); 
            } catch (e) {
                correctAnswer = atob(currentItem.resolvedData.token);
            }
        }
        
        const isCorrect = normalize(val) === normalize(correctAnswer);
        setIsSubmitting(true);

        try {
            //  NEW: JUST-IN-TIME KILL SWITCH VERIFICATION
            // Mathematically guarantees no answers can be submitted to a closed room
            const { data: roomCheck } = await supabase
                .from('rooms')
                .select('status')
                .eq('id', session.id)
                .single();
                
            if (roomCheck?.status !== 'active') {
                setRoomActive(false); // Instantly overlays the red "Session Ended" screen
                setTimeout(onBack, 3000);
                return; //  Halts submission completely
            }
            
            const currentSteps = (scratchpad[currentIndex] || []).filter(s => s.trim().length > 0);

            const { error } = await supabase.from('responses').insert([{
                room_id: session.id,
                student_alias: (studentAlias || "Anonym").replace(/<[^>]*>?/gm, '').substring(0, 25), 
                question_index: currentItem.originalIndex, 
                answer: String(val).substring(0, 20), 
                work_steps: currentSteps,
                is_correct: isCorrect
            }]);
            
            //  The missing state updates, catch, and finally blocks!
            if (error) throw error;
            
            setCompleted(prev => ({ ...prev, [currentIndex]: isCorrect ? 'correct' : 'wrong' }));
            
            // 🟢 FIXED: Only auto-advance if the session is NOT Teacher-Led
            if (settings.pacing !== 'teacher') {
                if (currentIndex < localPacket.length - 1) {
                    setTimeout(() => setCurrentIndex(prev => prev + 1), 600);
                } else if (currentIndex === localPacket.length - 1) {
                    setTimeout(() => setCompleted(prev => ({ ...prev })), 600);
                }
            }
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 3. HARDENED VISUAL RENDERING ---
    

    const renderInput = (idx = currentIndex) => {
        const item = localPacket[idx];
        const rd = item.resolvedData?.renderData;

        // Ported Multiple Choice logic from TestLabView
        if (rd?.answerType === 'multiple_choice' || (rd?.options && Array.isArray(rd.options))) {
            return (
                <div className="grid grid-cols-1 gap-3 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {(rd.options || []).map((opt, i) => {
                        // Extract label for visual display and value for backend submission
                        const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                        const choiceValue = typeof opt === 'object' ? opt.value : opt;
                        return (
                            <button
                                key={i}
                                onClick={() => handleSolve(choiceValue)}
                                className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl text-lg font-bold text-slate-700 hover:border-indigo-600 hover:bg-indigo-50 transition-all shadow-sm text-center active:scale-95"
                            >
                                <MathDisplay content={String(choiceLabel)} />
                            </button>
                        );
                    })}
                </div>
            );
        }

        const inputType = rd?.answerType || rd?.inputType || item.resolvedData?.inputType || 'text';
        const value = answers[idx] || '';

        const handleWrappedChange = (val) => {
            const clean = sanitizeInput(val, inputType);
            setAnswers({ ...answers, [idx]: clean });
        };

        switch (inputType) {
            case 'mixed_fraction': 
                return (
                    <div className="flex justify-center py-6 bg-slate-100 rounded-2xl shadow-inner w-full">
                        <div className="scale-110 transform origin-center">
                            <FractionInput value={value} onChange={handleWrappedChange} allowMixed={true} autoFocus={!isMobile} />
                        </div>
                    </div>
                );

            case 'fraction': 
                return (
                    <div className="flex justify-center py-6 bg-slate-100 rounded-2xl shadow-inner w-full">
                        <div className="scale-110 transform origin-center">
                            <FractionInput value={value} onChange={handleWrappedChange} allowMixed={false} autoFocus={!isMobile} />
                        </div>
                    </div>
                );
            
            case 'exponent': 
            case 'structured_power': 
                return (
                    <div className="flex justify-center py-6 bg-slate-100 rounded-2xl shadow-inner w-full">
                        <div className="scale-110 transform origin-center">
                            <ExponentInput value={value} onChange={handleWrappedChange} autoFocus={!isMobile} />
                        </div>
                    </div>
                );
            
            case 'scientific': 
            case 'structured_scientific': 
                return (
                    <div className="flex justify-center py-6 bg-slate-100 rounded-2xl shadow-inner w-full">
                        <div className="scale-110 transform origin-center">
                            <ScientificInput value={value} onChange={handleWrappedChange} autoFocus={!isMobile} />
                        </div>
                    </div>
                );

            default:
                return (
                    <input 
                        type="text" 
                        autoFocus={!isMobile} 
                        className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-center font-bold text-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300 shadow-inner"
                        placeholder="Ditt svar..."
                        value={value}
                        maxLength={20}
                        onChange={(e) => handleWrappedChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
                    />
                );
        }
    };

    if (localPacket.length === 0) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32}/></div>;

    // --- 4. RENDER: FINAL REVIEW GRID ---
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

                        return (
                            <div key={item.id} className={`whiteboard-protect p-6 rounded-[2.5rem] border-4 shadow-xl flex flex-col justify-between ${completed[idx] === 'correct' ? 'border-emerald-500 shadow-emerald-50/50' : 'border-rose-400 shadow-rose-50/50'}`}>
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{lang === 'sv' ? "Uppgift" : "Question"} {idx + 1}</span>
                                        {completed[idx] === 'correct' ? <CheckCircle2 className="text-emerald-500" size={24} /> : <XCircle className="text-rose-400" size={24} />}
                                    </div>
                                    
                                    {/* 🎨 Renders the visual diagram if it exists for this task */}
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
                                        {/* Main Question Text Description */}
                                        <div className="text-sm font-bold leading-relaxed">
                                            <MathDisplay content={item.resolvedData?.renderData?.description} />
                                        </div>

                                        {/* 🔢 Renders the formal LaTeX equation block if available */}
                                        {item.resolvedData?.renderData?.latex && (
                                            <div className="py-2 bg-indigo-50/30 rounded-xl text-center font-serif text-base border border-indigo-100/40">
                                                <MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className={`w-full py-3 rounded-2xl text-center font-black text-sm uppercase tracking-widest ${completed[idx] === 'correct' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                        {lang === 'sv' ? "Ditt Svar:" : "Your Answer:"} {answers[idx] || '-'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- 5. RENDER: SESSION COMPLETE SPLASH ---
    const allDone = Object.keys(completed).length === packet.length;
    if (allDone) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-white rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in duration-500 border-b-8 border-indigo-100">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <ListChecks size={40} className="text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2 italic">{lang === 'sv' ? "Aktivitet klar" : "Activity done"}</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-10">{lang === 'sv' ? "Alla svar skickades in." : "All answers have been submitted."}</p>
                    
                    <button onClick={() => setShowFinalReview(true)} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.15em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl">
                        <LayoutGrid size={20} /> {lang === 'sv' ? "Granska resultat" : "Preview results"}
                    </button>
                </div>
            </div>
        );
    }

    // --- 6. RENDER: KILL SWITCH ---
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

    // --- EXIT CONFIRMATION HANDLER ---
    const handleExitRequest = () => {
        const msg = lang === 'sv' 
            ? "Är du säker på att du vill lämna sessionen? Du kan inte fortsätta där du var sist om du lämnar nu." 
            : "Are you sure you want to leave the session? You cannot continue where you left off if you leave before finishing.";
        
        if (window.confirm(msg)) {
            onBack();
        }
    };

    return (
        // 1. THE DYNAMIC CANVAS
        <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] font-sans flex flex-col overflow-hidden transition-colors duration-500">
            <style>{`
                @media (max-width: 450px) {
                    .xs-hide { display: none !important; }
                }
            `}</style>

            {/* 2. DYNAMIC HEADER */}
            <header className="bg-[var(--bg-card)] border-b border-[var(--border-main)] px-4 py-3 sticky top-0 z-20 transition-colors duration-500">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
                    <button 
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0 || settings.pacing === 'progressive' || settings.pacing === 'teacher'}
                        className="p-2 hover:bg-[var(--bg-surface)] rounded-xl text-[var(--text-muted)] disabled:opacity-20 transition-all shrink-0"
                    >
                        <ChevronLeft size={28} />
                    </button>

                    <div className="flex flex-col items-center overflow-hidden flex-1">
                        <h1 className="text-sm font-bold text-[var(--text-main)] leading-none truncate mb-1.5 xs-hide">
                            {session.title}
                        </h1>
                        <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-main)] px-3 py-1 rounded-md text-xs font-bold shrink-0">
                            {lang === 'sv' ? "Kod:" : "Code:"} {session.class_code}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {/* 🟢 PREFERENCES TOGGLE ADDED HERE */}
                        <PreferencesToggle />
                        
                        <button 
                            onClick={() => setCurrentIndex(prev => Math.min(localPacket.length - 1, prev + 1))}
                            disabled={
                                currentIndex === localPacket.length - 1 || 
                                (settings.pacing === 'progressive' && !completed[currentIndex]) ||
                                settings.pacing === 'teacher'
                            }
                            className="p-2 hover:bg-[var(--bg-surface)] rounded-xl text-[var(--text-muted)] disabled:opacity-20 transition-all"
                        >
                            <ChevronRight size={28} />
                        </button>
                        
                        <button 
                            onClick={handleExitRequest} 
                            className="ml-1 p-2 hover:bg-[var(--theme-rose-bg)] rounded-xl text-[var(--text-muted)] hover:text-[var(--theme-rose-text)] transition-colors"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="hidden sm:flex max-w-xs mx-auto h-1 bg-[var(--bg-surface)] rounded-full gap-1 p-0 mt-3">
                    {localPacket.map((_, i) => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-700 ${i === currentIndex ? 'bg-[var(--brand-solid)] ring-2 ring-[var(--brand-solid)]/20' : !!completed[i] ? 'bg-[var(--border-strong)]' : 'bg-transparent'}`} />
                    ))}
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 overflow-hidden flex flex-col">
                <div className={`flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden transition-all duration-300 ${!!completed[currentIndex] ? 'opacity-40 scale-[0.98] pointer-events-none' : ''}`}>
                    
                    {/* LEFT CARD: Question & Visual */}
                    <div className="flex-[3] whiteboard-protect rounded-[2rem] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative min-h-[300px]">                        
                        <div className="sm:hidden h-1 bg-slate-100 flex shrink-0">
                            {localPacket.map((_, i) => (
                                <div key={i} className={`flex-1 ${i === currentIndex ? 'bg-indigo-500' : !!completed[i] ? 'bg-indigo-200' : 'bg-transparent'}`} />
                            ))}
                        </div>

                        {/* Softened Section Label */}
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
                                    <MathDisplay content={localPacket[currentIndex].resolvedData?.renderData?.description} />
                                </div>
                                
                                {localPacket[currentIndex].resolvedData?.renderData?.latex && 
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

                            {localPacket[currentIndex].resolvedData?.renderData && 
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

                    {/* RIGHT CARD: Input Area */}
                    <div className="flex-[2] lg:max-w-[450px] whiteboard-protect rounded-[2rem] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden shrink-0">
                        {/* Softened Section Label */}
                        <div className="px-6 py-4 lg:px-10 lg:py-5 border-b border-slate-100 flex items-center bg-slate-50 shrink-0">
                            <span className="text-sm font-bold text-slate-500">{lang === 'sv' ? "Din lösning" : "Your solution"}</span>
                        </div>
                        
                        {/* 🟢 CHANGED: Reduced padding from p-6 lg:p-10 to p-3 sm:p-4 lg:p-6 */}
                        <div className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col justify-between bg-white space-y-4">
                            {!completed[currentIndex] ? (
                                <div className="w-full space-y-4">
                                    {/* 🟢 CHANGED: Wrapped in hasScratchpad condition */}
                                    {hasScratchpad && (
                                        <MathScratchpad
                                            steps={scratchpad[currentIndex] || ['']}
                                            onChange={(steps) => setScratchpad(prev => ({ ...prev, [currentIndex]: steps }))}
                                            disabled={isSubmitting || !!completed[currentIndex]}
                                            lang={lang}
                                        />
                                    )}

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-1">
                                            {lang === 'sv' ? 'Slutsvar:' : 'Final Answer:'}
                                        </label>
                                        {renderInput()}
                                    </div>

                                    <button 
                                        onClick={() => handleSolve()} 
                                        disabled={isSubmitting || !answers[currentIndex]} 
                                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-sm font-bold active:scale-95 disabled:opacity-30 hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all shadow-sm"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> {lang === 'sv' ? 'Skicka svar' : 'Submit answer'}</>}
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
                                            : (lang === 'sv' ? "Fortsätt med pilen i menyn" : "Continue using navigation arrows")
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}