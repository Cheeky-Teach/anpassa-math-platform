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

// Import the shared renderer
import SlideRenderer from '../shared/SlideRenderer';
import InteractiveCanvas from '../whiteboard/InteractiveCanvas';

// --- MATH DISPLAY COMPONENT ---
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

    // Sync slide changes to the database
    const handleSlideChange = async (newIdx) => {
        setActiveSlideIndex(newIdx);
        try {
            await supabase.from('rooms').update({ current_slide_index: newIdx }).eq('id', session.id);
        } catch (err) {
            console.error("Failed to sync slide index:", err);
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
            onKick(alias);
            setResponses(prev => prev.filter(r => r.student_alias !== alias));
        }
    };

    const handleManualOverride = async (responseId, currentIsCorrect) => {
        const newStatus = !currentIsCorrect;
        const previousResponses = [...responses];
        
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
    
    const questionStats = livePacket.map((_, qIdx) => {
        const questionResponses = responses.filter(r => r.question_index === qIdx);
        const total = students.length || 0;
        const correct = questionResponses.filter(r => r.is_correct).length;
        const wrong = questionResponses.filter(r => !r.is_correct).length;
        return { correctPct: total > 0 ? (correct / total) * 100 : 0, wrongPct: total > 0 ? (wrong / total) * 100 : 0, remaining: total - questionResponses.length };
    });

    const getStatusColor = (isCorrect, answered, answerText, answerType) => {
        if (!answered) return 'bg-slate-100 opacity-30';
        if (answerType === 'free_text') return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]'; 
        if (hideCorrectness) return 'bg-indigo-300';
        if (answerText === '[TIMEOUT]') return 'bg-slate-800 shadow-[0_0_8px_rgba(30,41,59,0.3)]'; 
        return isCorrect ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)]';
    };

    const activePacketIndices = isPresentationMode && slides[activeSlideIndex]
        ? livePacket.reduce((acc, q, idx) => {
            if (slides[activeSlideIndex].activeIds.includes(q.id)) acc.push(idx);
            return acc;
        }, [])
        : livePacket.map((_, idx) => idx);

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
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{lang === 'sv' ? "Klassens resultat" : "Class results"}</span>
                    </th>
                    <th className="p-3 w-20 border-r border-[var(--border-main)] bg-[var(--bg-surface-hover)]"></th>
                    {activePacketIndices.map((qIdx) => {
                        const stats = questionStats[qIdx];
                        const isFreeText = livePacket[qIdx].answerType === 'free_text';
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
                                        <div style={{ height: `${(responses.filter(r => r.question_index === qIdx).length / Math.max(1, students.length)) * 100}%` }} className="bg-blue-500 transition-all duration-500 opacity-50" />
                                    )}
                                </div>
                            </th>
                        );
                    })}
                </tr>
                <tr className="bg-[var(--bg-surface-hover)] border-b border-[var(--border-main)] text-[var(--text-main)]">
                    <th className="p-3 w-48 text-[9px] font-black uppercase tracking-widest border-r border-[var(--border-main)]">{lang === 'sv' ? "Elev" : "Student"}</th>
                    <th className="p-3 w-20 text-[9px] font-black uppercase tracking-widest text-center border-r border-[var(--border-main)]">{lang === 'sv' ? "Klar" : "Done"}</th>
                    {activePacketIndices.map((qIdx) => (
                        <th key={`head-${qIdx}`} className="p-0 border-r border-[var(--border-main)] transition-colors hover:bg-[var(--theme-indigo-bg)] group/col">
                            <button 
                                onClick={() => setZoomIndex(qIdx)} 
                                title={lang === 'sv' ? "Granska uppgift" : "Inspect question"}
                                className="w-full h-full py-2 flex flex-col items-center justify-center gap-1 cursor-zoom-in"
                            >
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-center text-[var(--text-muted)] group-hover/col:text-[var(--theme-indigo-text)] transition-colors">
                                        Q{qIdx + 1}
                                    </span>
                                    <Maximize2 size={10} className="text-[var(--theme-indigo-text)] opacity-0 group-hover/col:opacity-100 transition-opacity" />
                                </div>
                                {showActualAnswers && (
                                    <span className="theme-orange text-[8px] text-[var(--brand-solid)] font-black bg-[var(--brand-bg)] border border-[var(--brand-border)] px-1.5 py-0.5 rounded truncate max-w-[50px] tracking-normal shadow-sm group-hover/col:border-[var(--brand-solid)]" title={getCorrectAnswer(livePacket[qIdx])}>
                                        {getCorrectAnswer(livePacket[qIdx])}
                                    </span>
                                )}
                            </button>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
                {students.map((student, sIdx) => {
                    const studentResps = responses.filter(r => r.student_alias === student);
                    const progress = Math.round((studentResps.length / livePacket.length) * 100);
                    return (
                        <tr key={student} className="hover:bg-[var(--bg-surface)] transition-colors group/row">
                            <td className="p-2 border-r border-[var(--border-subtle)] font-bold text-[var(--text-main)] text-xs truncate flex items-center justify-between">
                                <span>{isAnonymous ? `Elev ${sIdx + 1}` : student}</span>
                                <button onClick={() => handleKickStudent(student)} className="opacity-0 group-hover/row:opacity-100 p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"><UserX size={14} /></button>
                            </td>
                            <td className="p-2 border-r border-[var(--border-subtle)] text-center">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${progress === 100 ? 'bg-[var(--theme-emerald-bg)] text-[var(--theme-emerald-text)]' : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)]'}`}>
                                    {progress}%
                                </span>
                            </td>
                            {activePacketIndices.map((qIdx) => {
                                const resp = responses.find(r => r.student_alias === student && r.question_index === qIdx);
                                const isFreeText = livePacket[qIdx].answerType === 'free_text';
                                return (
                                    <td 
                                        key={`cell-${sIdx}-${qIdx}`} 
                                        className="p-1 border-r border-[var(--border-subtle)]"
                                        onClick={() => {
                                            if (!resp) return;
                                            if (isFreeText) setFreeTextReviewResp(resp);
                                            else handleManualOverride(resp.id, resp.is_correct);
                                        }} 
                                    >
                                        <div 
                                            title={resp ? (isFreeText ? "Klicka för att läsa svar" : `Svar: ${resp.answer} (Klicka för att ändra rättning)`) : 'Inget svar'}
                                            className={`w-full h-8 rounded-md transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-95 active:scale-90 ${getStatusColor(resp?.is_correct, !!resp, resp?.answer, livePacket[qIdx].answerType)}`}
                                        >
                                            {showActualAnswers && resp && (
                                                <span className="text-[9px] font-black text-white px-1 truncate flex items-center justify-center">
                                                    {isFreeText ? <MessageSquare size={10} /> : (resp.answer === '[TIMEOUT]' ? 'TID' : resp.answer)}
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
                                    
                                    {/* 🟢 REGENERATE BUTTON */}
                                    {(liveSlides[activeSlideIndex]?.activeIds || []).length > 0 && (
                                        <button
                                            onClick={handleRegenerateSlide}
                                            disabled={isRegenerating}
                                            className="px-2.5 py-1 bg-[var(--theme-indigo-bg)] text-[var(--theme-indigo-text)] hover:border-[var(--theme-indigo-text)] border border-transparent rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 active:scale-95 cursor-pointer"
                                            title={lang === 'sv' ? "Slumpa nya värden" : "Generate new values"}
                                        >
                                            <RefreshCw size={12} className={isRegenerating ? "animate-spin" : ""} />
                                            <span className="hidden sm:inline">{lang === 'sv' ? "Slumpa Ny" : "Regen"}</span>
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

                        {/* 🟢 THE FOCUSED MATRIX (Right Side - Collapsible) */}
                        <div className={`bg-[var(--bg-card)] rounded-3xl shadow-xl border border-[var(--border-main)] overflow-hidden flex flex-col h-full transition-all duration-500 ease-in-out shrink-0
                            ${isMatrixCollapsed ? 'w-full lg:w-[64px] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] cursor-pointer' : 'w-full lg:w-7/12 xl:w-1/2'}
                        `}>
                            {isMatrixCollapsed ? (
                                // Collapsed State UI
                                <div 
                                    className="w-full h-full flex flex-col items-center justify-start py-6 text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors cursor-pointer"
                                    onClick={() => setIsMatrixCollapsed(false)}
                                    title={lang === 'sv' ? "Visa Elevsvar" : "Show Student Answers"}
                                >
                                    <PanelRightOpen size={20} className="shrink-0 mb-8" />
                                    
                                    {/* 🟢 FIXED: Replaced CSS -rotate-90 with native writingMode so bounds don't overlap */}
                                    <div 
                                        className="flex items-center gap-3 opacity-60"
                                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                                            {lang === 'sv' ? "Elever" : "Students"} ({students.length})
                                        </span>
                                        <Users size={14} className="rotate-90" />
                                    </div>
                                </div>
                            ) : (
                                // Expanded State UI
                                <>
                                    <div className="p-3 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-surface)] shrink-0">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setIsMatrixCollapsed(true)}
                                                className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--primary-color)] rounded-md transition-colors"
                                                title={lang === 'sv' ? "Dölj" : "Hide"}
                                            >
                                                <PanelRightClose size={16} />
                                            </button>
                                            <BarChart3 className="text-[var(--primary-color)]" size={16} />
                                            <h2 className="text-xs font-black uppercase italic tracking-tighter text-[var(--text-main)] leading-none">
                                                {lang === 'sv' ? "Aktiva Elever" : "Active Students"}
                                            </h2>
                                        </div>
                                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-card)] px-2 py-1 rounded-md">
                                            {students.length} {lang === 'sv' ? "Anslutna" : "Connected"}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
                                        {renderMatrixTable()}
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
                                        onClick={() => setIsComparing(!isComparing)}
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
                                    onClick={() => { setZoomIndex(prev => Math.max(0, prev - 1)); setStarredStudents([]); setIsComparing(false); }}
                                    disabled={zoomIndex === 0}
                                    className="p-2 hover:bg-[var(--bg-surface)] rounded-full disabled:opacity-10 transition-all text-[var(--text-muted)]"
                                ><ChevronLeft size={24}/></button>
                                <button 
                                    onClick={() => { setZoomIndex(prev => Math.min(livePacket.length - 1, prev + 1)); setStarredStudents([]); setIsComparing(false); }}
                                    disabled={zoomIndex === livePacket.length - 1}
                                    className="p-2 hover:bg-[var(--bg-surface)] rounded-full disabled:opacity-10 transition-all text-[var(--text-muted)]"
                                ><ChevronRight size={24}/></button>
                                <div className="w-px h-6 bg-[var(--border-strong)] mx-1" />
                                <button onClick={() => { setZoomIndex(null); setShowWorkGrid(false); setStarredStudents([]); setIsComparing(false); }} className="p-2 hover:bg-[var(--theme-rose-bg)] text-[var(--theme-rose-text)] rounded-full transition-all"><X size={24}/></button>
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