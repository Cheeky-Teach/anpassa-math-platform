import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
    Users, Eye, EyeOff, Shield, BarChart3, Loader2, 
    RefreshCw, Download, Printer, Copy, Save, X, UserX,
    ChevronLeft, ChevronRight, CheckCircle2, XCircle, Type,
    LayoutGrid, ArrowDownAZ, ListOrdered, Shuffle, ChevronDown,
    MessageSquare, Monitor, PanelRightClose, PanelRightOpen, Star,
    Maximize2
} from 'lucide-react';
import { UI_TEXT } from '../../constants/localization';
import VisualRenderer from '../visuals/VisualRenderer';
import LandscapeReport from '../reports/LandscapeReport';
import PreferencesToggle from '../ui/PreferencesToggle';
import { syncProgress, syncBatchProgress } from '../../lib/progressSync';


// Import the shared renderer
import SlideRenderer from '../shared/SlideRenderer';
import InteractiveCanvas from '../whiteboard/InteractiveCanvas';
import MathDisplay from '../shared/MathDisplay';

export default function TeacherLiveView({ session, packet, lang, onEnd, onKick, onCreateReport }) {
    // 🟢 NEW: Mutable Live Packet State
    const [livePacket, setLivePacket] = useState(packet);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const [responses, setResponses] = useState([]);
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [hideCorrectness, setHideCorrectness] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [connStatus, setConnStatus] = useState('CONNECTING');
    const [isSyncing, setIsSyncing] = useState(false);
    const [showWrapUp, setShowWrapUp] = useState(false); 
    const [showPrintPreview, setShowPrintPreview] = useState(false); 
    const [zoomIndex, setZoomIndex] = useState(null);
    const [showWorkGrid, setShowWorkGrid] = useState(false);
    const [isPushing, setIsPushing] = useState(false);
    
    // Sorting
    const [sortMode, setSortMode] = useState('az'); 
    const [randomizedStudents, setRandomizedStudents] = useState([]);
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

    // Presentation Mode States
    const isPresentationMode = session?.active_question_data?.mode === 'presentation';
    const slides = session?.active_question_data?.slides || [];
    const globalZoom = session?.active_question_data?.settings?.globalZoom || 1.0;
    const [activeSlideIndex, setActiveSlideIndex] = useState(session?.current_slide_index || 0);
    const [freeTextReviewResp, setFreeTextReviewResp] = useState(null);
    const [canvasSpotlight, setCanvasSpotlight] = useState(null);

    // Presentation Drawer Tab: 'matrix' vs 'work'
    const [drawerTab, setDrawerTab] = useState('work');

    //  Local state holding slide elements so drawings persist between slide turns
    const [liveSlides, setLiveSlides] = useState(
        slides.length > 0
            ? slides
            : [{ id: `slide_${Date.now()}`, elements: [], scrollX: 0, scrollY: 0, title: 'Slide 1', activeIds: [] }]
    );
    const [bgType, setBgType] = useState(session?.active_question_data?.settings?.bgType || 'blank');
    
    //  Collapse Matrix State
    const [isMatrixCollapsed, setIsMatrixCollapsed] = useState(true);

    //  Star & Compare States
    const [starredStudents, setStarredStudents] = useState([]);
    const [isComparing, setIsComparing] = useState(false);

    const isTeacherLed = session.active_question_data?.settings?.pacing === 'teacher';
    const hasScratchpad = session.active_question_data?.settings?.scratchpad !== false;

    const ui = UI_TEXT[lang];
    const isMounted = useRef(true);
    const channelRef = useRef(null);
    
    const [showActualAnswers, setShowActualAnswers] = useState(false);

    const openQuestionZoom = (qIdx) => {
        const target = livePacket[qIdx];
        syncProgress('live_question_zoomed', {
            app_mode: 'teacher_live',
            question_index: qIdx,
            topic: target?.topicId || 'unknown',
            level: target?.resolvedData?.level || target?.metadata?.difficulty || 1,
            answer_type: target?.answerType || 'unknown'
        });
        setZoomIndex(qIdx);
    };

    // Sync slide changes to the database
    const handleSlideChange = async (newIdx) => {
        setActiveSlideIndex(newIdx);
        
        syncProgress('live_slide_changed', {
            app_mode: 'teacher_live',
            target_slide_index: newIdx
        });

        try {
            await supabase.from('rooms').update({ current_slide_index: newIdx }).eq('id', session.id);
        } catch (err) {
            console.error("Failed to sync slide index:", err);
        }
    };


    // 🟢 NEW: Handles resetting slides with ONLY manipulatives (no questions)
    const handleNewSlideRound = async () => {
        const confirmMsg = lang === 'sv'
            ? "Detta startar en ny runda och rensar alla elevers inskickade tavlor för denna slide. Fortsätt?"
            : "This starts a new round and resets all student canvas submissions for this slide. Continue?";

        if (!window.confirm(confirmMsg)) return;

        setIsRegenerating(true);
        try {
            syncProgress('live_new_slide_round', {
                app_mode: 'teacher_live',
                slide_index: activeSlideIndex
            });
            const nextTimestamp = Date.now();

            // 1. Stamp promptVersion on the current slide in liveSlides
            const updatedSlides = liveSlides.map((s, idx) => 
                idx === activeSlideIndex 
                    ? { ...s, promptVersion: nextTimestamp } 
                    : s
            );

            // 2. Broadcast updated slides to the room so students unlock immediately
            const { error: roomError } = await supabase
                .from('rooms')
                .update({
                    active_question_data: {
                        ...session.active_question_data,
                        slides: updatedSlides
                    }
                })
                .eq('id', session.id);

            if (roomError) throw roomError;

            // 3. Delete previous submissions for this slide index
            const { error: deleteError } = await supabase
                .from('responses')
                .delete()
                .eq('room_id', session.id)
                .eq('question_index', activeSlideIndex);

            if (deleteError) throw deleteError;

            // 4. Update local state
            setLiveSlides(updatedSlides);
            setResponses(prev => prev.filter(r => r.question_index !== activeSlideIndex));
            setStarredStudents([]);
        } catch (err) {
            console.error("Failed to start new slide round:", err);
            alert(lang === 'sv' ? "Kunde inte starta ny runda." : "Failed to reset round.");
        } finally {
            setIsRegenerating(false);
        }
    };

    // 🟢 NEW: The Regeneration Engine
    const handleRegenerateSlide = async () => {
        const activeIds = liveSlides[activeSlideIndex]?.activeIds || [];
        if (activeIds.length === 0) return;

        // 1. Identify which questions to update
        const activeItems = activeIds.map(id => {
            const index = livePacket.findIndex(p => p.id === id);
            return { item: livePacket[index], index };
        }).filter(obj => obj.item);

        // 2. Smart Confirmation Check
        const activeIndices = activeItems.map(obj => obj.index);
        const hasExistingResponses = responses.some(r => activeIndices.includes(r.question_index));

        if (hasExistingResponses) {
            const msg = lang === 'sv' 
                ? "Det finns redan inskickade svar för denna slide. Om du slumpar nya frågor kommer dessa att raderas. Fortsätt?" 
                : "There are already submitted answers for this slide. Generating new questions will delete them. Continue?";
            if (!window.confirm(msg)) return;
        }

        setIsRegenerating(true);
        try {

            syncBatchProgress('live_question_regenerated', activeItems.map(obj => obj.item), {
                app_mode: 'teacher_live'
            });
            // 3. Fetch new variations concurrently
            const updatedItems = await Promise.all(activeItems.map(async ({ item }) => {
                if (item.answerType === 'free_text' || (!item.topicId && !item.variationKey)) {
                    // Bypass fetch for text/static blocks, but stamp version to clear student responses
                    return { ...item, regenVersion: Date.now() };
                }
                
                const isItemWP = item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined;
                const res = await fetch(`/api/question?topic=${item.topicId}&variation=${item.variationKey}&lang=${lang}&wordProblem=${isItemWP}`);
                
                if (!res.ok) throw new Error("API request failed");
                const data = await res.json();
                
                return { 
                    ...item, 
                    resolvedData: data, 
                    regenVersion: Date.now(),
                    selectedStoryIndex: item.selectedStoryIndex !== undefined && item.selectedStoryIndex !== null ? item.selectedStoryIndex : null
                };
            }));

            // 4. Update the local packet
            const newPacket = [...livePacket];
            activeItems.forEach((obj, i) => {
                newPacket[obj.index] = updatedItems[i];
            });

            // 5. Update Database Room Payload
            const { error: roomError } = await supabase
                .from('rooms')
                .update({ 
                    active_question_data: { 
                        ...session.active_question_data,
                        packet: newPacket 
                    } 
                })
                .eq('id', session.id);
            
            if (roomError) throw roomError;

            // 6. Wipe existing responses in Supabase for these indices
            if (hasExistingResponses) {
                const { error: deleteError } = await supabase
                    .from('responses')
                    .delete()
                    .eq('room_id', session.id)
                    .in('question_index', activeIndices);
                
                if (deleteError) throw deleteError;
            }

            // 7. Apply to local UI state
            setLivePacket(newPacket);
            setResponses(prev => prev.filter(r => !activeIndices.includes(r.question_index)));

        } catch (err) {
            console.error("Failed to regenerate slide:", err);
            alert(lang === 'sv' ? "Kunde inte slumpa nya frågor. Försök igen." : "Failed to regenerate questions. Please try again.");
        } finally {
            setIsRegenerating(false);
        }
    };

    const getCorrectAnswer = (questionItem) => {
        if (!questionItem?.resolvedData) return '-';
        if (questionItem.answerType === 'free_text') return lang === 'sv' ? 'Text' : 'Text'; 
        
        let ans = questionItem.resolvedData.answer; 
        if (!ans && questionItem.resolvedData.token) {
            try {
                const binaryString = atob(questionItem.resolvedData.token);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                ans = new TextDecoder().decode(bytes);
            } catch (e) {
                ans = atob(questionItem.resolvedData.token);
            }
        }
        return ans || '-';
    };

    const syncData = async () => {
        if (!session?.id || !isMounted.current) return;
        setIsSyncing(true);
        try {
            const { data, error } = await supabase.from('responses').select('*').eq('room_id', session.id);
            if (!error && data && isMounted.current) setResponses(data);
        } catch (err) { console.error("Sync failed:", err); } finally {
            if (isMounted.current) setIsSyncing(false);
        }
    };

    const handleKickStudent = (alias) => {
        const confirmMsg = lang === 'sv' ? `Vill du verkligen ta bort ${alias} från sessionen? All data raderas.` : `Are you sure you want to kick ${alias}? All data for this student will be deleted.`;
        if (window.confirm(confirmMsg)) {
            syncProgress('live_student_kicked', { 
                app_mode: 'teacher_live',
                remaining_students: students.length - 1
            });
            
            onKick(alias);
            setResponses(prev => prev.filter(r => r.student_alias !== alias));
        }
    };

    const handleManualOverride = async (responseId, currentIsCorrect) => {
        const newStatus = !currentIsCorrect;
        const previousResponses = [...responses];
        
        // Find the specific response and its corresponding question data
        const targetResponse = responses.find(r => r.id === responseId);
        const targetQuestion = targetResponse ? livePacket[targetResponse.question_index] : null;
        
        syncProgress('live_manual_correction', {
            app_mode: 'teacher_live',
            changed_to_correct: newStatus,
            topic: targetQuestion?.topicId || 'unknown',
            level: targetQuestion?.resolvedData?.level || targetQuestion?.metadata?.difficulty || 1,
            answer_type: targetQuestion?.answerType || 'unknown',
            student_answer: targetResponse?.answer || ''
        });
        
        setResponses(prevResponses => prevResponses.map(res => res.id === responseId ? { ...res, is_correct: newStatus, is_manually_corrected: true } : res));

        try {
            const { data, error } = await supabase.from('responses').update({ is_correct: newStatus }).eq('id', responseId).select();
            if (error) throw error;
            if (!data || data.length === 0) throw new Error("Update blocked by Supabase RLS. 0 rows updated.");
        } catch (error) {
            setResponses(previousResponses);
            alert(lang === 'sv' ? "Databasfel: Din ändring sparades inte. Kontrollera Supabase RLS-rättigheter." : "Database Error: Your change was not saved. Check Supabase RLS policies.");
        }
    };

    useEffect(() => {
        isMounted.current = true;
        if (!session?.id) return;
        syncData();
        const setupRealtime = () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            const channel = supabase.channel(`room_${session.id.slice(0,8)}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'responses', filter: `room_id=eq.${session.id}` }, (payload) => {
                    if (isMounted.current) {
                        setResponses(prev => {
                            if (prev.some(r => r.id === payload.new.id)) return prev;
                            return [...prev, payload.new];
                        });
                    }
                })
                .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'responses' }, () => { syncData(); })
                .subscribe(async (status) => {
                    if (!isMounted.current) return;
                    setConnStatus(status);
                    if (status === 'SUBSCRIBED') syncData();
                    if (status === 'TIMED_OUT' || status === 'CLOSED') {
                        setTimeout(() => { if (isMounted.current) setupRealtime(); }, 5000);
                    }
                });
            channelRef.current = channel;
        };
        setupRealtime();
        return () => {
            isMounted.current = false;
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, [session?.id]);

    const copyToClipboard = async () => {
        const studentList = [...new Set(responses.map(r => r.student_alias))].sort();
        let tableHTML = `<table border="1" style="border-collapse: collapse; font-family: sans-serif; font-size: 11px;">
            <thead style="background: #f1f5f9;">
                <tr><th style="padding: 6px; text-align: left;">Elev</th><th style="padding: 6px;">Resultat</th>`;
        livePacket.forEach((_, i) => tableHTML += `<th style="padding: 4px; width: 25px; text-align: center;">${i+1}</th>`);
        tableHTML += `</tr></thead><tbody>`;

        studentList.forEach(student => {
            const studentResps = livePacket.map((_, qIdx) => responses.find(r => r.student_alias === student && r.question_index === qIdx));
            const score = studentResps.filter(r => r?.is_correct).length;
            tableHTML += `<tr><td style="padding: 6px; font-weight: bold;">${student}</td><td style="padding: 6px; text-align: center;">${score}/${livePacket.length}</td>`;
            studentResps.forEach(r => {
                const symbol = r ? (r.is_correct ? '✓' : '✕') : '-';
                const color = r ? (r.is_correct ? '#10b981' : '#f43f5e') : '#94a3b8';
                tableHTML += `<td style="padding: 4px; color: ${color}; text-align: center; font-weight: bold;">${symbol}</td>`;
            });
            tableHTML += `</tr>`;
        });
        tableHTML += `</tbody></table>`;

        try {
            const blob = new Blob([tableHTML], { type: 'text/html' });
            const item = new ClipboardItem({ 'text/html': blob });
            await navigator.clipboard.write([item]);
            alert(lang === 'sv' ? "Kompakt tabell har kopierats!" : "Compact table copied!");
        } catch (err) { alert(lang === 'sv' ? "Kunde inte kopiera." : "Could not copy."); }
    };

    const handleEndSession = async () => {
        if (isClosing) return;
        setIsClosing(true);
        
        const totalStudents = [...new Set(responses.map(r => r.student_alias))].length;
        const totalAnswers = responses.length;
        const totalCorrect = responses.filter(r => r.is_correct).length;
        
        syncBatchProgress('live_session_ended', livePacket, {
            app_mode: 'teacher_live',
            total_students_joined: totalStudents,
            final_class_accuracy: totalAnswers > 0 ? parseFloat((totalCorrect / totalAnswers).toFixed(2)) : 0
        });

        try { 
            const { error } = await supabase.from('rooms').update({ status: 'closed' }).eq('id', session.id);
            if (error) throw error;
            await onEnd(); 
        } catch (err) {
            alert(lang === 'sv' ? "Kunde inte avsluta sessionen." : "Could not end session.");
            setIsClosing(false);
        }
    };

    const handlePushToClass = async () => {
        if (!session?.id || isPushing) return;
        setIsPushing(true);
        try {
            const { error } = await supabase.from('rooms').update({ current_question_index: zoomIndex }).eq('id', session.id);
            if (error) throw error;
        } catch (err) {
            console.error("Failed to push question:", err);
            alert(lang === 'sv' ? "Kunde inte byta fråga för klassen." : "Could not push question to class.");
        } finally { setIsPushing(false); }
    };

    const applySort = (mode) => {
        if (mode === 'random') {
            const uniqueStudents = [...new Set(responses.map(r => r.student_alias))];
            setRandomizedStudents(uniqueStudents.sort(() => Math.random() - 0.5));
        }
        setSortMode(mode);
        setIsSortMenuOpen(false);
    };

    const students = React.useMemo(() => {
        const base = [...new Set(responses.map(r => r.student_alias))];
        if (sortMode === 'az') return base.sort((a, b) => a.localeCompare(b));
        if (sortMode === 'progress') {
            return base.sort((a, b) => {
                const countA = responses.filter(r => r.student_alias === a).length;
                const countB = responses.filter(r => r.student_alias === b).length;
                return countB - countA || a.localeCompare(b);
            });
        }
        if (sortMode === 'random') {
            const currentRandom = randomizedStudents.filter(s => base.includes(s));
            const missing = base.filter(s => !currentRandom.includes(s));
            return [...currentRandom, ...missing];
        }
        return base;
    }, [responses, sortMode, randomizedStudents]);
    
    const questionStats = (livePacket || []).map((q, qIdx) => {
        const questionResponses = responses.filter(r => r.question_index === qIdx);
        const total = students.length || 0;
        const correct = questionResponses.filter(r => r.is_correct).length;
        const wrong = questionResponses.filter(r => !r.is_correct).length;
        return { 
            correctPct: total > 0 ? (correct / total) * 100 : 0, 
            wrongPct: total > 0 ? (wrong / total) * 100 : 0, 
            remaining: Math.max(0, total - questionResponses.length) 
        };
    });

    const getStatusColor = (isCorrect, answered, answerText, answerType) => {
        if (!answered) return 'bg-slate-100 opacity-30';
        if (answerType === 'free_text') return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]'; 
        if (hideCorrectness) return 'bg-indigo-300';
        if (answerText === '[TIMEOUT]') return 'bg-slate-800 shadow-[0_0_8px_rgba(30,41,59,0.3)]'; 
        return isCorrect ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)]';
    };

    // 🟢 Support slides with or without questions:
    const activePacketIndices = React.useMemo(() => {
        if (!isPresentationMode || !slides[activeSlideIndex]) {
            return livePacket.map((_, idx) => idx);
        }
        
        const pinnedIds = slides[activeSlideIndex].activeIds || [];
        const matched = livePacket.reduce((acc, q, idx) => {
            if (pinnedIds.includes(q.id)) acc.push(idx);
            return acc;
        }, []);

        // If the slide has no question cards, treat the active slide itself as the single column index
        if (matched.length === 0) {
            return [activeSlideIndex];
        }

        return matched;
    }, [isPresentationMode, slides, activeSlideIndex, livePacket]);

    const updateCurrentSlideElements = (action) => {
        setLiveSlides(prevSlides => {
            const nextSlides = [...prevSlides];
            const currentElements = nextSlides[activeSlideIndex]?.elements || [];
            const nextElements = typeof action === 'function' ? action(currentElements) : action;
            nextSlides[activeSlideIndex] = {
                ...nextSlides[activeSlideIndex],
                elements: nextElements
            };
            return nextSlides;
        });
    };

    const renderMatrixTable = () => (
        <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
            <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="bg-[var(--bg-surface)] border-b border-[var(--border-main)]">
                    <th className="p-3 w-48 bg-[var(--bg-surface-hover)] border-r border-[var(--border-main)]">
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            {lang === 'sv' ? "Klassens resultat" : "Class results"}
                        </span>
                    </th>
                    <th className="p-3 w-20 border-r border-[var(--border-main)] bg-[var(--bg-surface-hover)]"></th>
                    {activePacketIndices.map((qIdx) => {
                        const targetItem = livePacket[qIdx];
                        const isFreeText = targetItem?.answerType === 'free_text' || (!targetItem && isPresentationMode);
                        const stats = questionStats[qIdx] || { correctPct: 0, wrongPct: 0, remaining: 0 };
                        const qResponses = responses.filter(r => 
                            r.question_index === qIdx || 
                            (r.is_slide_submission && r.question_index === activeSlideIndex)
                        );

                        return (
                            <th key={`stat-${qIdx}`} className="p-1.5 border-r border-[var(--border-main)] align-bottom">
                                <div className="w-full h-12 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden flex flex-col-reverse relative group cursor-help">
                                    {!isFreeText ? (
                                        <>
                                            <div style={{ height: `${stats.correctPct}%` }} className="bg-emerald-500 transition-all duration-500" />
                                            <div style={{ height: `${stats.wrongPct}%` }} className="bg-rose-500 transition-all duration-500" />
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-900/90 flex items-center justify-center transition-opacity">
                                                <span className="text-[9px] text-white font-black">{Math.round(stats.correctPct)}%</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div 
                                            style={{ 
                                                height: `${students.length > 0 
                                                    ? Math.min(100, (qResponses.length / students.length) * 100) 
                                                    : 0}%` 
                                            }} 
                                            className="bg-indigo-500 transition-all duration-500 opacity-60" 
                                        />
                                    )}
                                </div>
                            </th>
                        );
                    })}
                </tr>
                <tr className="bg-[var(--bg-surface-hover)] border-b border-[var(--border-main)] text-[var(--text-main)]">
                    <th className="p-3 w-48 text-[9px] font-black uppercase tracking-widest border-r border-[var(--border-main)]">
                        {lang === 'sv' ? "Elev" : "Student"}
                    </th>
                    <th className="p-3 w-20 text-[9px] font-black uppercase tracking-widest text-center border-r border-[var(--border-main)]">
                        {lang === 'sv' ? "Klar" : "Done"}
                    </th>
                    {activePacketIndices.map((qIdx) => {
                        const targetItem = livePacket[qIdx];
                        const isCanvasSlideOnly = !targetItem && isPresentationMode;

                        return (
                            <th key={`head-${qIdx}`} className="p-0 border-r border-[var(--border-main)] transition-colors hover:bg-[var(--theme-indigo-bg)] group/col">
                                <button 
                                    onClick={() => {
                                        if (targetItem) openQuestionZoom(qIdx);
                                    }} 
                                    title={isCanvasSlideOnly ? (lang === 'sv' ? "Taveluppgift" : "Canvas Task") : (lang === 'sv' ? "Granska uppgift" : "Inspect question")}
                                    className={`w-full h-full py-2 flex flex-col items-center justify-center gap-1 ${targetItem ? 'cursor-zoom-in' : 'cursor-default'}`}
                                >
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-center text-[var(--text-muted)] group-hover/col:text-[var(--theme-indigo-text)] transition-colors">
                                            {isCanvasSlideOnly ? (lang === 'sv' ? `Slide ${activeSlideIndex + 1}` : `Slide ${activeSlideIndex + 1}`) : `Q${qIdx + 1}`}
                                        </span>
                                        {targetItem && <Maximize2 size={10} className="text-[var(--theme-indigo-text)] opacity-0 group-hover/col:opacity-100 transition-opacity" />}
                                    </div>
                                    {showActualAnswers && targetItem && (
                                        <span className="theme-orange text-[8px] text-[var(--brand-solid)] font-black bg-[var(--brand-bg)] border border-[var(--brand-border)] px-1.5 py-0.5 rounded truncate max-w-[50px] tracking-normal shadow-sm group-hover/col:border-[var(--brand-solid)]" title={getCorrectAnswer(targetItem)}>
                                            {getCorrectAnswer(targetItem)}
                                        </span>
                                    )}
                                </button>
                            </th>
                        );
                    })}
                </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
                {students.map((student, sIdx) => {
                    const studentResps = responses.filter(r => r.student_alias === student);
                    const totalTasks = Math.max(1, livePacket.length || 1);
                    const progress = Math.round((studentResps.length / totalTasks) * 100);

                    return (
                        <tr key={student} className="hover:bg-[var(--bg-surface)] transition-colors group/row">
                            <td className="p-2 border-r border-[var(--border-subtle)] font-bold text-[var(--text-main)] text-xs truncate flex items-center justify-between">
                                <span>{isAnonymous ? `Elev ${sIdx + 1}` : student}</span>
                                <button onClick={() => handleKickStudent(student)} className="opacity-0 group-hover/row:opacity-100 p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all">
                                    <UserX size={14} />
                                </button>
                            </td>
                            <td className="p-2 border-r border-[var(--border-subtle)] text-center">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${progress >= 100 ? 'bg-[var(--theme-emerald-bg)] text-[var(--theme-emerald-text)]' : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)]'}`}>
                                    {Math.min(100, progress)}%
                                </span>
                            </td>
                            {activePacketIndices.map((qIdx) => {
                                const targetItem = livePacket[qIdx];
                                
                                // Safe lookup checking both standard question index and slide submissions
                                const resp = responses.find(r => 
                                    r.student_alias === student && 
                                    (r.question_index === qIdx || (r.is_slide_submission && r.question_index === activeSlideIndex))
                                );

                                const isFreeText = targetItem?.answerType === 'free_text';
                                const hasCanvasData = resp?.canvas_state && Array.isArray(resp.canvas_state) && resp.canvas_state.length > 0;
                                const isSlideCanvasOnly = resp?.answer === '[CANVAS_SUBMISSION]' || resp?.is_slide_submission || hasCanvasData;

                                return (
                                    <td 
                                        key={`cell-${sIdx}-${qIdx}`} 
                                        className="p-1 border-r border-[var(--border-subtle)]"
                                        onClick={() => {
                                            if (!resp) return;
                                            if (hasCanvasData) {
                                                setCanvasSpotlight(resp);
                                            } else if (isFreeText) {
                                                setFreeTextReviewResp(resp);
                                            } else {
                                                handleManualOverride(resp.id, resp.is_correct);
                                            }
                                        }} 
                                    >
                                        <div 
                                            title={resp ? (hasCanvasData ? "Klicka för att se tavla" : isFreeText ? "Klicka för att läsa svar" : `Svar: ${resp.answer}`) : 'Inget svar'}
                                            className={`w-full h-8 rounded-md transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-95 active:scale-90 ${
                                                getStatusColor(
                                                    resp?.is_correct, 
                                                    !!resp, 
                                                    resp?.answer, 
                                                    isSlideCanvasOnly ? 'free_text' : (targetItem?.answerType || 'standard')
                                                )
                                            }`}
                                        >
                                            {showActualAnswers && resp && (
                                                <span className="text-[9px] font-black text-white px-1 truncate flex items-center justify-center">
                                                    {isSlideCanvasOnly ? 'TAVLA' : isFreeText ? <MessageSquare size={10} /> : (resp.answer === '[TIMEOUT]' ? 'TID' : resp.answer)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );

    //  Toggle Student Star Status
    const toggleStar = (studentAlias) => {
        setStarredStudents(prev => {
            if (prev.includes(studentAlias)) {
                return prev.filter(s => s !== studentAlias);
            }
            if (prev.length >= 5) {
                alert(lang === 'sv' ? "Du kan bara jämföra upp till 5 elever." : "You can only compare up to 5 students.");
                return prev;
            }
            return [...prev, studentAlias];
        });
    };

    const renderStudentWorkCard = (r, i, isCompact = false) => {
        const hasCanvas = r.canvas_state && Array.isArray(r.canvas_state) && r.canvas_state.length > 0;
        const hasScratchpad = r.work_steps && r.work_steps.length > 0;
        
        // 🟢 Guard with optional chaining: livePacket[r.question_index]?.answerType
        const isFreeText = livePacket[r.question_index]?.answerType === 'free_text';
        const isSlideCanvasOnly = r.answer === '[CANVAS_SUBMISSION]' || r.is_slide_submission || hasCanvas;

    return (
        <div key={r.id || i} className={`bg-[var(--bg-card)] p-3.5 rounded-2xl border shadow-sm flex flex-col relative group/card transition-all ${
            starredStudents.includes(r.student_alias) 
                ? 'border-amber-400 ring-2 ring-amber-100/50' 
                : 'border-[var(--border-main)]'
        }`}>
            {/* Star Toggle */}
            <button 
                onClick={(e) => { e.stopPropagation(); toggleStar(r.student_alias); }}
                className={`absolute -top-2.5 -right-2.5 p-1.5 bg-white dark:bg-slate-800 rounded-full border shadow-sm hover:scale-110 transition-all z-20 ${
                    starredStudents.includes(r.student_alias) 
                        ? 'border-amber-300 opacity-100' 
                        : 'border-slate-200 dark:border-slate-700 opacity-0 group-hover/card:opacity-100'
                }`}
            >
                <Star size={14} className={starredStudents.includes(r.student_alias) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'} />
            </button>

            {/* Header: Student Alias & Status */}
            <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-[var(--border-main)]">
                <span className="font-bold text-xs text-[var(--text-main)] truncate max-w-[140px]">
                    {isAnonymous ? `Elev ${i + 1}` : r.student_alias}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    isSlideCanvasOnly
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : isFreeText 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' 
                            : r.is_correct 
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                }`}>
                    {isSlideCanvasOnly 
                        ? (lang === 'sv' ? "Tavla" : "Canvas") 
                        : (isFreeText ? (lang === 'sv' ? "Text" : "Text") : r.answer)
                    }
                </span>
            </div>

            {/* In TeacherLiveView.jsx -> renderStudentWorkCard */}
            {hasCanvas && (
                <div 
                    onClick={() => setCanvasSpotlight(r)} 
                    className="w-full aspect-video relative bg-[#f9fbf7] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-2 cursor-zoom-in group/canvas shadow-inner"
                >
                    {/* Layer 1: Original Slide Backdrop (LaTeX, Prompt, Diagram) */}
                    <div className="absolute inset-0 pointer-events-none opacity-80">
                        <SlideRenderer
                            activeIds={liveSlides[activeSlideIndex]?.activeIds || []}
                            livePacket={livePacket}
                            lang={lang}
                            authorMode={false}
                            globalZoom={globalZoom}
                            sizeClasses={{ 
                                desc: 'text-[11px]', 
                                latex: 'text-xs', 
                                clue: 'text-[10px]', 
                                headerText: 'text-xs', 
                                visualClass: 'scale-75 max-h-[90px]' 
                            }}
                        />
                    </div>

                    {/* Layer 2: Student Vector Canvas (Strokes, Labels, Moved Objects) */}
                    <div className="absolute inset-0 pointer-events-none">
                        <InteractiveCanvas
                            elements={r.canvas_state}
                            readOnly={true}
                            toolbarMode="none"
                            resolution={{ w: 1920, h: 1080 }}
                        />
                    </div>

                    {/* Hover zoom indicator */}
                    <div className="absolute inset-0 bg-slate-900/10 group-hover/canvas:bg-transparent transition-colors flex items-end justify-end p-2 pointer-events-none">
                        <span className="p-1.5 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm">
                            <Maximize2 size={12} />
                        </span>
                    </div>
                </div>
            )}

            {/* 🟢 FULLSCREEN CANVAS INSPECTION SPOTLIGHT */}
            {canvasSpotlight && (
                <div 
                    onClick={() => setCanvasSpotlight(null)} 
                    className="fixed inset-0 z-[500] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-200"
                >
                    <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Modal Bar */}
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-black uppercase text-slate-800 dark:text-white">
                                    {isAnonymous ? "Elevlösning" : canvasSpotlight.student_alias}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                    canvasSpotlight.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                    {canvasSpotlight.answer}
                                </span>
                            </div>
                            <button 
                                onClick={() => setCanvasSpotlight(null)} 
                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        {/* Modal Body Container */}
                        <div className="p-6 flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-950/40 min-h-0">
                            
                            {/* 🟢 PASTE YOUR CODE BLOCK HERE (Replaces the old canvas div) */}
                            <div className="w-full aspect-video max-h-[70vh] bg-[#f9fbf7] rounded-2xl shadow-lg border border-slate-300 dark:border-slate-700 overflow-hidden relative">
                                {/* Base Slide Content */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <SlideRenderer
                                        activeIds={liveSlides[activeSlideIndex]?.activeIds || []}
                                        livePacket={livePacket}
                                        lang={lang}
                                        authorMode={false}
                                        globalZoom={globalZoom}
                                        sizeClasses={{ 
                                            desc: 'text-m', 
                                            latex: 'text-xl', 
                                            clue: 'text-m', 
                                            headerText: 'text-l', 
                                            visualClass: 'scale-100 max-h-[180px] mb-2' 
                                        }}
                                    />
                                </div>

                                {/* Student Canvas Overlay */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <InteractiveCanvas
                                        elements={canvasSpotlight.canvas_state}
                                        readOnly={true}
                                        toolbarMode="none"
                                        resolution={{ w: 1920, h: 1080 }}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Free text answer body */}
            {isFreeText && (
                <div className="p-2.5 bg-[var(--bg-surface)] rounded-xl text-xs font-medium text-[var(--text-main)] max-h-36 overflow-y-auto custom-scrollbar mb-2 leading-relaxed">
                    {r.answer}
                </div>
            )}

            {/* Math scratchpad steps */}
            {hasScratchpad && (
                <div className="space-y-1 overflow-x-auto custom-scrollbar py-1 text-xs">
                    {r.work_steps.map((line, lineIdx) => (
                        <div key={lineIdx} className="bg-[var(--bg-surface)] px-2 py-1 rounded text-[var(--text-main)] font-serif">
                            <MathDisplay content={`$\\displaystyle ${line}$`} />
                        </div>
                    ))}
                </div>
            )}

            {!hasCanvas && !hasScratchpad && !isFreeText && (
                <div className="text-[10px] text-[var(--text-muted)] italic py-2 text-center">
                    {lang === 'sv' ? "Bara slutsvar inskickat" : "Only final answer submitted"}
                </div>
            )}
        </div>
    );
};

    return (
        <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-500">
            
            {/* 1. WRAP-UP SELECTION MODAL */}
            {showWrapUp && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300 no-print">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-b-8 border-indigo-100">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">{lang === 'sv' ? "Avsluta Session" : "End Session"}</h2>
                            <button onClick={() => setShowWrapUp(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
                        </div>
                        <div className="p-8 space-y-4">
                            <button onClick={() => { setShowPrintPreview(true); setShowWrapUp(false); }} className="w-full group p-6 bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-600 rounded-3xl text-left transition-all">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Printer size={20}/></div>
                                    <span className="font-black uppercase tracking-tight text-indigo-900 text-lg">{lang === 'sv' ? "Utskriftsvänlig Rapport" : "Printable Report"}</span>
                                </div>
                                <p className="text-indigo-600/60 text-xs font-bold leading-relaxed ml-14">{lang === 'sv' ? "Genererar en kompakt A4-översikt i liggande format." : "Generates a compact A4 overview in landscape format."}</p>
                            </button>
                            <button onClick={copyToClipboard} className="w-full group p-6 bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-600 rounded-3xl text-left transition-all">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg"><Copy size={20}/></div>
                                    <span className="font-black uppercase tracking-tight text-emerald-900 text-lg">{lang === 'sv' ? "Kopiera Tabell" : "Copy Table"}</span>
                                </div>
                                <p className="text-emerald-600/60 text-xs font-bold leading-relaxed ml-14">{lang === 'sv' ? "Klistra in resultatet direkt i Word eller Excel." : "Paste the result directly into Word or Excel."}</p>
                            </button>
                            <button onClick={handleEndSession} disabled={isClosing} className="w-full group p-6 bg-slate-50 border-2 border-slate-100 hover:border-slate-900 rounded-3xl text-left transition-all disabled:opacity-50">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                                        {isClosing ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                                    </div>
                                    <span className="font-black uppercase tracking-tight text-slate-900 text-lg">{lang === 'sv' ? "Stäng & Arkivera (7 dagar)" : "Close & Archive (7 days)"}</span>
                                </div>
                                <p className="text-slate-400 text-xs font-bold leading-relaxed ml-14">{lang === 'sv' ? "Rensas automatiskt efter 7 dagar." : "Automatically cleared after 7 days."}</p>
                            </button>
                        </div>
                        <div className="p-6 bg-slate-50 flex justify-end items-center border-t border-slate-100">
                             <button onClick={() => setShowWrapUp(false)} className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-300 transition-colors">{lang === 'sv' ? "Avbryt" : "Cancel"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SECURE FREE-TEXT REVIEW DRAWER --- */}
            {freeTextReviewResp && (
                <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-lg border-2 border-blue-200 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><MessageSquare size={20} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                                        {isAnonymous ? "Elevsvar" : freeTextReviewResp.student_alias}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fråga {freeTextReviewResp.question_index + 1}</p>
                                </div>
                            </div>
                            <button onClick={() => setFreeTextReviewResp(null)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-slate-700 text-base leading-relaxed font-medium min-h-[120px] max-h-[40vh] overflow-y-auto custom-scrollbar">
                            {freeTextReviewResp.answer}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setFreeTextReviewResp(null)} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] rounded-xl transition-all">Stäng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- LANDSCAPE REPORT PREVIEW --- */}
            {showPrintPreview && (
                <LandscapeReport 
                    session={session} 
                    packet={livePacket} 
                    responses={responses} 
                    lang={lang} 
                    onClose={() => setShowPrintPreview(false)} 
                />
            )}

            {/* 🟢 Slimmed-down Header for max screen space */}
            <header className="bg-[var(--bg-card)] border-b border-[var(--border-main)] px-4 py-1 sticky top-0 z-40 shadow-sm flex items-center justify-between gap-4 no-print transition-colors duration-500">
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-main)] px-2 py-1 rounded-lg flex flex-col items-center shadow-sm">
                        <span className="text-[6px] font-black uppercase opacity-50 leading-none">{lang === 'sv' ? "KOD" : "CODE"}</span>
                        <span className="text-sm font-black italic leading-none">{session.class_code}</span>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-[10px] font-black uppercase tracking-tight text-[var(--text-main)] leading-none truncate max-w-[150px]">{session.title}</h1>
                        <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase mt-0.5">{lang === 'sv' ? "Live Lektion" : "Live Lesson"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border transition-all ${
                        connStatus === 'SUBSCRIBED' ? 'bg-[var(--theme-emerald-bg)] text-[var(--theme-emerald-text)] border-[var(--theme-emerald-border)]' : 'bg-[var(--theme-rose-bg)] text-[var(--theme-rose-text)] border-[var(--theme-rose-border)] animate-pulse'
                    }`}>
                        {connStatus === 'SUBSCRIBED' ? 'Live' : connStatus}
                    </div>
                    
                    <PreferencesToggle />

                    <button onClick={syncData} disabled={isSyncing} className="p-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-md text-[var(--text-muted)] hover:text-indigo-600 transition-all shadow-sm">
                        <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                    </button>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} 
                            title={lang === 'sv' ? "Sortera elever" : "Sort students"} 
                            className="p-1.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-md text-[var(--text-main)] hover:bg-[var(--theme-indigo-bg)] hover:text-[var(--theme-indigo-text)] hover:border-[var(--theme-indigo-border)] transition-all shadow-sm flex items-center gap-1"
                        >
                            {sortMode === 'az' ? <ArrowDownAZ size={12} /> : sortMode === 'progress' ? <ListOrdered size={12} /> : <Shuffle size={12} />}
                            <ChevronDown size={10} className="opacity-50" />
                        </button>

                        {isSortMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)}></div>
                                
                                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-1">
                                    <button 
                                        onClick={() => applySort('az')} 
                                        className={`w-full text-left px-4 py-2 hover:bg-[var(--bg-surface)] transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-wider ${sortMode === 'az' ? 'text-[var(--theme-indigo-text)] bg-[var(--theme-indigo-bg)]' : 'text-[var(--text-main)]'}`}
                                    >
                                        <ArrowDownAZ size={12} /> {lang === 'sv' ? "Namn (A-Ö)" : "Name (A-Z)"}
                                    </button>
                                    <button 
                                        onClick={() => applySort('progress')} 
                                        className={`w-full text-left px-4 py-2 hover:bg-[var(--bg-surface)] transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-wider ${sortMode === 'progress' ? 'text-[var(--theme-indigo-text)] bg-[var(--theme-indigo-bg)]' : 'text-[var(--text-main)]'}`}
                                    >
                                        <ListOrdered size={12} /> {lang === 'sv' ? "Mest aktiva" : "Most Active"}
                                    </button>
                                    <button 
                                        onClick={() => applySort('random')} 
                                        className={`w-full text-left px-4 py-2 hover:bg-[var(--bg-surface)] transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-wider ${sortMode === 'random' ? 'text-[var(--theme-indigo-text)] bg-[var(--theme-indigo-bg)]' : 'text-[var(--text-main)]'}`}
                                    >
                                        <Shuffle size={12} /> {lang === 'sv' ? "Slumpa" : "Shuffle"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setShowActualAnswers(!showActualAnswers)} 
                        title={showActualAnswers ? (lang === 'sv' ? "Visa status" : "Show status") : (lang === 'sv' ? "Visa svar" : "Show answers")} 
                        className={`theme-orange p-1.5 rounded-md border transition-all shadow-sm flex items-center gap-1 ${showActualAnswers ? 'bg-[var(--brand-solid)] text-white border-[var(--brand-solid)]' : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-main)] hover:border-[var(--brand-solid)] hover:text-[var(--brand-solid)]'}`}
                    >
                        <Eye size={12} />
                        <span className="text-[9px] font-black uppercase hidden md:inline">{lang === 'sv' ? "Visa Svar" : "Show Answers"}</span>
                    </button>
                    
                    <button onClick={() => setIsAnonymous(!isAnonymous)} title={lang === 'sv' ? "Namn" : "Names"} className={`theme-indigo p-1.5 rounded-md border transition-all shadow-sm ${isAnonymous ? 'bg-[var(--brand-solid)] text-white border-[var(--brand-solid)]' : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-main)] hover:border-[var(--brand-solid)] hover:text-[var(--brand-solid)]'}`}>
                        {isAnonymous ? <Shield size={12} /> : <Users size={12} />}
                    </button>
                    
                    <button onClick={() => setHideCorrectness(!hideCorrectness)} title={lang === 'sv' ? "Resultat" : "Results"} className={`theme-purple p-1.5 rounded-md border transition-all shadow-sm ${hideCorrectness ? 'bg-[var(--brand-solid)] text-white border-[var(--brand-solid)]' : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-main)] hover:border-[var(--brand-solid)] hover:text-[var(--brand-solid)]'}`}>
                        {hideCorrectness ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    
                    <button onClick={() => setShowWrapUp(true)} className="bg-[var(--theme-rose-bg)] text-[var(--theme-rose-text)] border border-[var(--theme-rose-border)] hover:bg-[var(--brand-solid)] hover:text-white theme-rose px-3 py-1.5 rounded-md font-black text-[9px] uppercase tracking-widest transition-all shadow-sm">
                         {lang === 'sv' ? "Avsluta" : "End Session"}
                    </button>
                </div>
            </header>

            {/* 4. DYNAMIC VIEW: Split Presentation OR Standard Grid */}
            <main className="flex-1 overflow-auto p-4 lg:p-6 no-print flex flex-col">
                {isPresentationMode ? (
                    <div className="flex flex-col lg:flex-row gap-6 h-full max-w-[2000px] w-full mx-auto">
                        
                        {/* THE TELEPROMPTER (Left Side - Maximized when Matrix is Collapsed) */}
                        <div className={`flex flex-col gap-4 transition-all duration-500 ease-in-out ${isMatrixCollapsed ? 'w-full lg:w-[calc(100%-80px)]' : 'w-full lg:w-5/12 xl:w-1/2'}`}>
                            
                            {/* 🟢 Ultra-Slim Teleprompter Nav */}
                            <div className="flex justify-between items-center bg-[var(--bg-card)] px-3 py-2 rounded-xl shadow-sm border border-[var(--border-main)] shrink-0">
                                <button 
                                    onClick={() => handleSlideChange(activeSlideIndex - 1)} 
                                    disabled={activeSlideIndex === 0} 
                                    className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--theme-indigo-bg)] text-[var(--text-muted)] hover:text-[var(--theme-indigo-text)] rounded-lg disabled:opacity-30 transition-all cursor-pointer"
                                ><ChevronLeft size={16}/></button>
                                
                                <div className="flex items-center gap-3">
                                    <div className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] flex items-center gap-1.5">
                                        <Monitor size={14} className="text-[var(--primary-color)]" />
                                        {liveSlides[activeSlideIndex]?.title || `Slide ${activeSlideIndex + 1}`} <span className="opacity-50">({activeSlideIndex + 1} / {liveSlides.length})</span>
                                    </div>
                                    
                                    {/* 🟢 CONDITIONAL REGEN / NEW ROUND BUTTON */}
                                    {(liveSlides[activeSlideIndex]?.activeIds || []).length > 0 ? (
                                        <button
                                            onClick={handleRegenerateSlide}
                                            disabled={isRegenerating}
                                            className="px-2.5 py-1 bg-[var(--theme-indigo-bg)] text-[var(--theme-indigo-text)] hover:border-[var(--theme-indigo-text)] border border-transparent rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 active:scale-95 cursor-pointer"
                                            title={lang === 'sv' ? "Slumpa nya värden" : "Generate new values"}
                                        >
                                            <RefreshCw size={12} className={isRegenerating ? "animate-spin" : ""} />
                                            <span className="hidden sm:inline">{lang === 'sv' ? "Slumpa Ny" : "Regen"}</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNewSlideRound}
                                            disabled={isRegenerating}
                                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 active:scale-95 cursor-pointer"
                                            title={lang === 'sv' ? "Starta ny runda och låt elever svara igen" : "Start new round / reset student answers"}
                                        >
                                            <RefreshCw size={12} className={isRegenerating ? "animate-spin" : ""} />
                                            <span className="hidden sm:inline">{lang === 'sv' ? "Ny Omgång" : "New Round"}</span>
                                        </button>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={() => handleSlideChange(activeSlideIndex + 1)} 
                                    disabled={activeSlideIndex === liveSlides.length - 1} 
                                    className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--theme-indigo-bg)] text-[var(--text-muted)] hover:text-[var(--theme-indigo-text)] rounded-lg disabled:opacity-30 transition-all cursor-pointer"
                                ><ChevronRight size={16}/></button>
                            </div>

                            <div className={`relative w-full aspect-video rounded-3xl shadow-xl overflow-hidden border-4 border-slate-200/50 flex-1 min-h-0 ${bgType === 'grid' ? 'bg-white' : 'bg-[#f9fbf7]'}`}>
                                {/* Slide Content Layer */}
                                <SlideRenderer
                                    activeIds={liveSlides[activeSlideIndex]?.activeIds || []}
                                    livePacket={livePacket}
                                    lang={lang}
                                    sizeClasses={{ desc: 'text-m', latex: 'text-xl', clue: 'text-m', headerText: 'text-l', visualClass: 'scale-100 max-h-[180px] mb-2' }}
                                    clueViewMode="answers" 
                                    authorMode={false} 
                                    globalZoom={globalZoom}
                                />

                                {/* Active Whiteboard Layer with Pen/Eraser/Shape Tools */}
                                <InteractiveCanvas
                                    key={liveSlides[activeSlideIndex]?.id || activeSlideIndex}
                                    elements={liveSlides[activeSlideIndex]?.elements || []}
                                    setElements={updateCurrentSlideElements}
                                    lang={lang}
                                    bgType={bgType}
                                    onToggleBg={() => setBgType(prev => prev === 'blank' ? 'grid' : 'blank')}
                                    livePacket={livePacket}
                                    resolution={{ w: 1920, h: 1080 }}
                                />
                            </div>
                        </div>

                        {/* 🟢 THE DUAL DRAWER: Matrix or Direct Student Work */}
                        <div className={`bg-[var(--bg-card)] rounded-3xl shadow-xl border border-[var(--border-main)] overflow-hidden flex flex-col h-full transition-all duration-500 ease-in-out shrink-0 ${
                            isMatrixCollapsed ? 'w-full lg:w-[64px] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] cursor-pointer' : 'w-full lg:w-7/12 xl:w-1/2'
                        }`}>
                            {isMatrixCollapsed ? (
                                <div 
                                    className="w-full h-full flex flex-col items-center justify-start py-6 text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors cursor-pointer"
                                    onClick={() => setIsMatrixCollapsed(false)}
                                    title={lang === 'sv' ? "Visa Elevsvar" : "Show Student Answers"}
                                >
                                    <PanelRightOpen size={20} className="shrink-0 mb-8" />
                                    <div 
                                        className="flex items-center gap-3 opacity-60"
                                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                                            {lang === 'sv' ? "Elevsvar" : "Student Work"} ({students.length})
                                        </span>
                                        <Users size={14} className="rotate-90" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Drawer Header & Mode Tabs */}
                                    <div className="p-3 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-surface)] shrink-0 gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <button 
                                                onClick={() => setIsMatrixCollapsed(true)}
                                                className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--primary-color)] rounded-md transition-colors cursor-pointer"
                                                title={lang === 'sv' ? "Dölj" : "Hide"}
                                            >
                                                <PanelRightClose size={16} />
                                            </button>
                                            
                                            {/* Tab Buttons */}
                                            <div className="flex bg-[var(--bg-card)] p-0.5 rounded-lg border border-[var(--border-main)] shadow-inner">
                                                <button
                                                    onClick={() => setDrawerTab('work')}
                                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                        drawerTab === 'work' 
                                                            ? 'bg-indigo-600 text-white shadow-sm' 
                                                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                                    }`}
                                                >
                                                    {lang === 'sv' ? "Elevlösningar" : "Student Work"}
                                                </button>
                                                <button
                                                    onClick={() => setDrawerTab('matrix')}
                                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                        drawerTab === 'matrix' 
                                                            ? 'bg-indigo-600 text-white shadow-sm' 
                                                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                                    }`}
                                                >
                                                    {lang === 'sv' ? "Klassmatris" : "Matrix"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* 🟢 RIGHT ACTIONS: Compare Button & Connected Student Pill */}
                                        <div className="flex items-center gap-2">
                                            {/* Compare Pill: Only shows when 1 or more students are starred */}
                                            {starredStudents.length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        const activeSlideIds = liveSlides[activeSlideIndex]?.activeIds || [];
                                                        const targetQId = activeSlideIds[0];
                                                        const packetIdx = livePacket.findIndex(p => p.id === targetQId);
                                                        if (packetIdx !== -1) {
                                                            openQuestionZoom(packetIdx);
                                                        }
                                                        syncProgress('live_comparison_opened', {
                                                            app_mode: 'teacher_live',
                                                            compared_count: starredStudents.length
                                                        });
                                                        setShowWorkGrid(true);
                                                        setIsComparing(true);
                                                    }}
                                                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer animate-in fade-in"
                                                    title={lang === 'sv' ? "Öppna jämförelsevy" : "Open comparison view"}
                                                >
                                                    <Star size={12} className="fill-amber-950" />
                                                    <span>{lang === 'sv' ? `Jämför (${starredStudents.length})` : `Compare (${starredStudents.length})`}</span>
                                                </button>
                                            )}

                                            <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-card)] px-2.5 py-1 rounded-md border border-[var(--border-main)]">
                                                {students.length} {lang === 'sv' ? "Elever" : "Students"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Drawer Body */}
                                    <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 p-3">
                                        {drawerTab === 'matrix' ? (
                                            renderMatrixTable()
                                        ) : (
                                            /* Direct Student Work Cards for Active Slide Questions */
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                                {(() => {
                                                    const currentSlideQIndices = activePacketIndices;
                                                    const slideResponses = responses.filter(r => 
                                                        currentSlideQIndices.includes(r.question_index) || 
                                                        (r.is_slide_submission && r.question_index === activeSlideIndex)
                                                    );
                                                    
                                                    if (slideResponses.length === 0) {
                                                        return (
                                                            <div className="col-span-full py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">
                                                                {lang === 'sv' ? "Inga elevsvar inskickade på denna slide än." : "No student work submitted for this slide yet."}
                                                            </div>
                                                        );
                                                    }
                                                    return slideResponses.map((r, i) => renderStudentWorkCard(r, i));
                                                })()}
                                            </div>
                                        )}
                                        {/* Floating Drawer Action Dock */}
                                        {starredStudents.length > 0 && drawerTab === 'work' && (
                                            <div className="sticky bottom-2 left-0 right-0 mt-3 p-2 bg-slate-900/90 text-white backdrop-blur-md rounded-2xl flex items-center justify-between shadow-xl border border-white/10 z-30 animate-in slide-in-from-bottom-2">
                                                <div className="flex items-center gap-2 pl-2">
                                                    <Star size={14} className="fill-amber-400 text-amber-400" />
                                                    <span className="text-[11px] font-bold">
                                                        {starredStudents.length} {lang === 'sv' ? "valda svar" : "selected"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => setStarredStudents([])}
                                                        className="px-2.5 py-1 text-[10px] text-slate-300 hover:text-white transition-colors uppercase font-bold"
                                                    >
                                                        {lang === 'sv' ? "Rensa" : "Clear"}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const activeSlideIds = liveSlides[activeSlideIndex]?.activeIds || [];
                                                            const targetQId = activeSlideIds[0];
                                                            const packetIdx = livePacket.findIndex(p => p.id === targetQId);
                                                            if (packetIdx !== -1) setZoomIndex(packetIdx);
                                                            setShowWorkGrid(true);
                                                            setIsComparing(true);
                                                        }}
                                                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md transition-transform active:scale-95"
                                                    >
                                                        {lang === 'sv' ? "Jämför nu" : "Compare now"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    // STANDARD WORKSHEET LAYOUT
                    <div className="max-w-[1600px] mx-auto bg-[var(--bg-card)] rounded-2xl shadow-xl border border-[var(--border-main)] overflow-hidden flex flex-col h-full min-h-[600px]">
                        <div className="p-4 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-surface)]">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="text-[var(--primary-color, #4f46e5)]" size={18} />
                                <h2 className="text-sm font-black uppercase italic tracking-tighter text-[var(--text-main)] leading-none">{session.title}</h2>
                            </div>
                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{students.length} {lang === 'sv' ? "Elever anslutna" : "Students connected"}</div>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar flex-1">
                            {renderMatrixTable()}
                        </div>
                    </div>
                )}
            </main>

            {/* --- COMPACT ZOOM-IN QUESTION OVERLAY (With Star & Compare) --- */}
            {zoomIndex !== null && (
                <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center no-print animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-canvas)] text-[var(--text-main)] w-full h-full flex flex-col overflow-hidden shadow-2xl">
                        
                        <div className="px-6 py-3 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-card)] shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-main)] px-3 py-1 rounded-lg flex flex-col items-center shadow-sm">
                                    <span className="text-[6px] font-black uppercase opacity-50 leading-none">KOD</span>
                                    <span className="text-sm font-black italic leading-none">{session.class_code}</span>
                                </div>
                                
                                <div className="bg-[var(--theme-indigo-bg)] text-[var(--theme-indigo-text)] border border-[var(--theme-indigo-border)] px-4 py-1.5 rounded-xl font-black italic text-xs tracking-tighter uppercase">
                                    {lang === 'sv' ? "Uppgift" : "Question"} {zoomIndex + 1}
                                </div>

                                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">
                                    {responses.filter(r => r.question_index === zoomIndex).length}/{students.length} {lang === 'sv' ? "Svar" : "Answers"}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* 🟢 STARRED COMPARE BUTTON */}
                                {starredStudents.length > 0 && (
                                    <button
                                        onClick={() => {
                                            const nextState = !isComparing;
                                            if (nextState) {
                                                syncProgress('live_comparison_opened', {
                                                    app_mode: 'teacher_live',
                                                    compared_count: starredStudents.length
                                                });
                                            }
                                            setIsComparing(nextState);
                                        }}
                                        className={`px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2 mr-2 hover:scale-105 active:scale-95 ${
                                            isComparing 
                                                ? 'bg-amber-500 text-amber-950 border border-amber-600' 
                                                : 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200'
                                        }`}
                                    >
                                        <Star size={14} className={isComparing ? 'fill-amber-950' : 'fill-amber-500'} />
                                        {lang === 'sv' ? `Jämför (${starredStudents.length})` : `Compare (${starredStudents.length})`}
                                    </button>
                                )}

                                {isTeacherLed && !isComparing && !isPresentationMode && (
                                    <button
                                        onClick={handlePushToClass}
                                        disabled={isPushing}
                                        className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border border-amber-500 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2 mr-2 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {isPushing ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
                                        {lang === 'sv' ? "Tvinga hit klassen" : "Push to Class"}
                                    </button>
                                )}

                                <button 
                                    onClick={() => setShowActualAnswers(!showActualAnswers)} 
                                    title={showActualAnswers ? (lang === 'sv' ? "Visa status" : "Show status") : (lang === 'sv' ? "Visa svar" : "Show answers")} 
                                    className={`theme-orange p-1 rounded-lg border transition-all shadow-sm ${showActualAnswers ? 'bg-[var(--brand-solid)] text-white border-[var(--brand-solid)]' : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-main)] hover:border-[var(--brand-solid)] hover:text-[var(--brand-solid)]'}`}
                                >
                                    <span className="text-[10px] font-black uppercase">{lang === 'sv' ? "Visa Svar" : "Show Answers"}</span>
                                </button>

                                <button onClick={() => setIsAnonymous(!isAnonymous)} title={lang === 'sv' ? "Namn" : "Names"} className={`theme-indigo p-2 rounded-lg border transition-all shadow-sm ${isAnonymous ? 'bg-[var(--brand-solid)] text-white border-[var(--brand-solid)]' : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-main)] hover:border-[var(--brand-solid)] hover:text-[var(--brand-solid)]'}`}>
                                    {isAnonymous ? <Shield size={14} /> : <Users size={14} />}
                                </button>
                                
                                <button onClick={() => setHideCorrectness(!hideCorrectness)} title={lang === 'sv' ? "Resultat" : "Results"} className={`theme-purple p-2 rounded-lg border transition-all shadow-sm ${hideCorrectness ? 'bg-[var(--brand-solid)] text-white border-[var(--brand-solid)]' : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-main)] hover:border-[var(--brand-solid)] hover:text-[var(--brand-solid)]'}`}>
                                    {hideCorrectness ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>

                                <div className="w-px h-6 bg-[var(--border-strong)] mx-1 hidden sm:block" />

                                <button 
                                    onClick={() => { 
                                        if (isPresentationMode) {
                                            handleSlideChange(Math.max(0, activeSlideIndex - 1));
                                        } else {
                                            const nextIdx = Math.max(0, (zoomIndex ?? 0) - 1);
                                            openQuestionZoom(nextIdx);
                                        }
                                        setStarredStudents([]); 
                                        setIsComparing(false); 
                                    }}
                                    disabled={isPresentationMode ? activeSlideIndex === 0 : zoomIndex === 0}
                                    className="p-2 hover:bg-[var(--bg-surface)] rounded-full disabled:opacity-10 transition-all text-[var(--text-muted)]"
                                >
                                    <ChevronLeft size={24}/>
                                </button>
                                <button 
                                    onClick={() => { 
                                        if (isPresentationMode) {
                                            handleSlideChange(Math.min(liveSlides.length - 1, activeSlideIndex + 1));
                                        } else {
                                            const nextIdx = Math.min(livePacket.length - 1, (zoomIndex ?? 0) + 1);
                                            openQuestionZoom(nextIdx);
                                        }
                                        setStarredStudents([]); 
                                        setIsComparing(false); 
                                    }}
                                    disabled={isPresentationMode ? activeSlideIndex === liveSlides.length - 1 : zoomIndex === livePacket.length - 1}
                                    className="p-2 hover:bg-[var(--bg-surface)] rounded-full disabled:opacity-10 transition-all text-[var(--text-muted)]"
                                >
                                    <ChevronRight size={24}/>
                                </button>

                                <div className="w-px h-6 bg-[var(--border-strong)] mx-1" />
                                <button onClick={() => { setZoomIndex(null); setShowWorkGrid(false); setStarredStudents([]); 
                                    setIsComparing(false); 
                                    }} 
                                    className="p-2 hover:bg-[var(--theme-rose-bg)] text-[var(--theme-rose-text)] rounded-full transition-all">
                                        <X size={24}/>
                                </button>
                            </div>
                        </div>

                        <div className="px-8 py-4 bg-[var(--bg-surface)] border-b border-[var(--border-main)] shrink-0 relative">
                            {showActualAnswers && (
                                <div className="theme-orange absolute top-1/2 -translate-y-1/2 right-6 bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-solid)] px-4 py-2 rounded-xl text-lg font-black shadow-sm flex items-center gap-2">
                                    <span className="opacity-60 uppercase text-[12px] tracking-widest">{lang === 'sv' ? "Facit" : "Key"}</span>
                                    <span>{getCorrectAnswer(livePacket[zoomIndex])}</span>
                                </div>
                            )}

                            <div className="text-lg font-bold text-[var(--text-main)] leading-snug text-center max-w-3xl mx-auto">
                                <MathDisplay content={livePacket[zoomIndex].resolvedData?.renderData?.description} />
                                
                                {livePacket[zoomIndex].resolvedData?.renderData?.latex && (
                                    <div className="mt-2 text-2xl text-[var(--theme-indigo-text)] font-serif border-t border-[var(--border-main)] pt-2">
                                        <MathDisplay content={`$$${livePacket[zoomIndex].resolvedData.renderData.latex}$$`} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden w-full">
                            
                            {!showWorkGrid && !isComparing ? (
                                <>
                                    <div className="whiteboard-protect flex-1 p-6 flex items-center justify-center overflow-hidden border-r border-[var(--border-main)]">
                                        <div className="flex-1 flex flex-col justify-center items-center py-6 min-h-[150px]">
                                            <div className="flex justify-center scale-90 origin-top mt-2">
                                                <VisualRenderer 
                                                    data={livePacket[zoomIndex]?.resolvedData?.renderData} 
                                                    isWordProblem={livePacket[zoomIndex]?.selectedStoryIndex !== null && livePacket[zoomIndex]?.selectedStoryIndex !== undefined} 
                                                />
                                            </div>
                                            {livePacket[zoomIndex]?.resolvedData?.renderData?.latex && (
                                                <div className="mt-4 text-3xl font-serif text-indigo-600 bg-indigo-50 px-6 py-4 rounded-2xl">
                                                    <MathDisplay content={`$$${livePacket[zoomIndex].resolvedData.renderData.latex}$$`} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-64 sm:w-72 bg-[var(--bg-surface)] p-4 flex flex-col gap-3 overflow-y-auto shrink-0">
                                        <div className="bg-emerald-500 rounded-[1.5rem] p-4 text-white shadow-md">
                                            <div className="flex items-center gap-2 mb-2 opacity-90">
                                                <CheckCircle2 size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{lang === 'sv' ? "Antal Rätt" : "Correct"}</span>
                                            </div>
                                            <div className="text-2xl font-black mb-2">
                                                {responses.filter(r => r.question_index === zoomIndex && r.is_correct).length}
                                            </div>
                                            <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar text-[10px]">
                                                {responses.filter(r => r.question_index === zoomIndex && r.is_correct).map((r, idx) => (
                                                    <div key={idx} className="py-1 border-b border-white/10 truncate font-bold">
                                                        {isAnonymous ? `Elev ${idx + 1}` : r.student_alias}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {(hasScratchpad || livePacket[zoomIndex].answerType === 'free_text') && (
                                            <div className="mt-4 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 shadow-sm flex flex-col">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
                                                        {livePacket[zoomIndex].answerType === 'free_text' ? (lang === 'sv' ? 'Svar' : 'Answers') : (lang === 'sv' ? 'Respons' : 'Scratchpads')}
                                                    </h4>
                                                    <button onClick={() => setShowWorkGrid(true)} className="p-1.5 bg-[var(--theme-indigo-bg)] hover:bg-[var(--theme-indigo-border)] text-[var(--theme-indigo-text)] rounded-md transition-all" title="Visa i stort rutnät">
                                                        <LayoutGrid size={14} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                                    {responses.filter(r => r.question_index === zoomIndex && (r.work_steps?.length > 0 || livePacket[zoomIndex].answerType === 'free_text')).map((r, i) => (
                                                        <div key={i} className="bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-main)] text-xs relative group/card">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); toggleStar(r.student_alias); }}
                                                                className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full border border-slate-200 shadow-sm opacity-0 group-hover/card:opacity-100 hover:scale-110 transition-all"
                                                            >
                                                                <Star size={14} className={starredStudents.includes(r.student_alias) ? 'fill-amber-400 text-amber-500 opacity-100' : 'text-slate-300'} />
                                                            </button>

                                                            <div className="flex justify-between items-center mb-1 text-[var(--text-muted)] text-[10px] font-sans font-bold">
                                                                <span>{isAnonymous ? `Elev ${i + 1}` : r.student_alias}</span>
                                                                <span className={r.is_correct ? 'text-[var(--theme-emerald-text)]' : 'text-[var(--theme-rose-text)]'}>{r.answer}</span>
                                                            </div>
                                                            <div className="space-y-1 text-[var(--text-main)]">
                                                                {r.work_steps && r.work_steps.map((line, lineIdx) => (
                                                                    <div key={lineIdx} className="overflow-x-auto custom-scrollbar pb-1">
                                                                        <MathDisplay content={`$\\displaystyle ${line}$`} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-rose-500 rounded-[1.5rem] p-4 text-white shadow-md mt-auto">
                                            <div className="flex items-center gap-2 mb-2 opacity-90">
                                                <XCircle size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{lang === 'sv' ? "Fel Svar" : "Errors"}</span>
                                            </div>
                                            <div className="space-y-2">
                                                {(() => {
                                                    const wrongAnswers = responses.filter(r => r.question_index === zoomIndex && !r.is_correct).map(r => r.answer);
                                                    const freq = wrongAnswers.reduce((acc, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {});
                                                    const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 2);
                                                    return sorted.length > 0 ? sorted.map(([ans, count]) => (
                                                        <div key={ans} className="flex justify-between items-center bg-white/10 p-1.5 px-3 rounded-lg text-[10px]">
                                                            <span className="font-black italic truncate mr-2">"{ans}"</span>
                                                            <span className="font-bold opacity-80 shrink-0">{count} st</span>
                                                        </div>
                                                    )) : <span className="text-[10px] opacity-60 italic">{lang === 'sv' ? "Inga fel än" : "No errors"}</span>;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {!isComparing && (
                                        <div className="whiteboard-protect w-64 sm:w-80 p-6 flex flex-col border-r border-[var(--border-main)] overflow-y-auto shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                                            <button onClick={() => setShowWorkGrid(false)} className="w-full mb-6 py-2 bg-[var(--theme-indigo-bg)] hover:bg-[var(--theme-indigo-border)] text-[var(--theme-indigo-text)] font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                                                <ChevronLeft size={14}/> {lang === 'sv' ? "Tillbaka" : "Back"}
                                            </button>
                                            
                                            <div className="flex justify-center scale-75 origin-top mt-2">
                                                <VisualRenderer 
                                                    data={livePacket[zoomIndex]?.resolvedData?.renderData} 
                                                    isWordProblem={livePacket[zoomIndex]?.selectedStoryIndex !== null && livePacket[zoomIndex]?.selectedStoryIndex !== undefined} 
                                                />
                                            </div>
                                            {livePacket[zoomIndex]?.resolvedData?.renderData?.latex && (
                                                <div className="mt-4 text-xl font-serif text-indigo-600 bg-indigo-50 px-4 py-3 rounded-xl text-center">
                                                    <MathDisplay content={`$$${livePacket[zoomIndex].resolvedData.renderData.latex}$$`} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 🟢 COMPARISON GRID */}
                                    <div className="flex-1 p-6 bg-[var(--bg-canvas)] overflow-y-auto custom-scrollbar">
                                        <div className={`grid gap-4 items-start content-start h-full
                                            ${isComparing 
                                                ? (starredStudents.length <= 2 ? 'grid-cols-2' : starredStudents.length === 3 ? 'grid-cols-3' : 'grid-cols-4') 
                                                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                            }
                                        `}>
                                            {responses
                                                .filter(r => r.question_index === zoomIndex && (r.work_steps?.length > 0 || livePacket[zoomIndex].answerType === 'free_text'))
                                                .filter(r => !isComparing || starredStudents.includes(r.student_alias))
                                                .map((r, i) => (
                                                    <div key={i} className={`bg-[var(--bg-card)] p-4 rounded-[1.5rem] border shadow-sm flex flex-col relative group/card transition-all
                                                        ${starredStudents.includes(r.student_alias) ? 'border-amber-400 ring-2 ring-amber-100/50' : 'border-[var(--border-main)]'}
                                                        ${isComparing ? 'h-full' : ''}
                                                    `}>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); toggleStar(r.student_alias); }}
                                                            className={`absolute -top-3 -right-3 p-2 bg-white rounded-full border shadow-sm hover:scale-110 transition-all ${
                                                                starredStudents.includes(r.student_alias) 
                                                                ? 'border-amber-200 opacity-100' 
                                                                : 'border-slate-200 opacity-0 group-hover/card:opacity-100'
                                                            }`}
                                                        >
                                                            <Star size={16} className={starredStudents.includes(r.student_alias) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'} />
                                                        </button>

                                                        <div className="flex justify-between items-center mb-3 border-b border-[var(--border-main)] pb-3">
                                                            <span className="font-black text-sm text-[var(--text-main)]">{isAnonymous ? `Elev ${i + 1}` : r.student_alias}</span>
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${r.is_correct ? 'bg-[var(--theme-emerald-bg)] text-[var(--theme-emerald-text)]' : 'bg-[var(--theme-rose-bg)] text-[var(--theme-rose-text)]'}`}>
                                                                {r.answer}
                                                            </span>
                                                        </div>
                                                        <div className={`flex-1 space-y-2 text-[var(--text-main)] ${isComparing ? 'text-lg leading-relaxed' : 'text-sm'}`}>
                                                            {r.work_steps && r.work_steps.map((line, lineIdx) => (
                                                                <div key={lineIdx} className="overflow-x-auto custom-scrollbar pb-1 bg-[var(--bg-surface)] px-2 rounded">
                                                                    <MathDisplay content={`$\\displaystyle ${line}$`} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                            ))}
                                            
                                            {responses.filter(r => r.question_index === zoomIndex && (r.work_steps?.length > 0 || livePacket[zoomIndex].answerType === 'free_text')).length === 0 && (
                                                <div className="col-span-full py-12 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs">
                                                    {lang === 'sv' ? "Inga lösningar inskickade än." : "No scratchpads submitted yet."}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}