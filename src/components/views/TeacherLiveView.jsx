import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
    Users, Eye, EyeOff, Shield, BarChart3, Loader2, 
    RefreshCw, Download, Printer, Copy, Save, X, UserX,
    ChevronLeft, ChevronRight, CheckCircle2, XCircle, Type,
    LayoutGrid, ArrowDownAZ, ListOrdered, Shuffle, ChevronDown
} from 'lucide-react';
import { UI_TEXT } from '../../constants/localization';
import VisualRenderer from '../visuals/VisualRenderer';
import LandscapeReport from '../reports/LandscapeReport'

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
    const [responses, setResponses] = useState([]);
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [hideCorrectness, setHideCorrectness] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [connStatus, setConnStatus] = useState('CONNECTING');
    const [isSyncing, setIsSyncing] = useState(false);
    const [showWrapUp, setShowWrapUp] = useState(false); 
    const [showPrintPreview, setShowPrintPreview] = useState(false); // Added for landscape preview
    const [printSteps, setPrintSteps] = useState(false);
    const [zoomIndex, setZoomIndex] = useState(null);

    const [showWorkGrid, setShowWorkGrid] = useState(false);

    const [isPushing, setIsPushing] = useState(false);
    
    // 🟢 ADDED: State variables for sorting
    const [sortMode, setSortMode] = useState('az'); // 'az', 'progress', 'random'
    const [randomizedStudents, setRandomizedStudents] = useState([]);
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

    const isTeacherLed = session.active_question_data?.settings?.pacing === 'teacher';
    const hasScratchpad = session.active_question_data?.settings?.scratchpad !== false;

    const ui = UI_TEXT[lang];
    const isMounted = useRef(true);
    const channelRef = useRef(null);
    
    const [showActualAnswers, setShowActualAnswers] = useState(false); // Toggle between answer icons and text

    // Helper function to decode the answer key from the packet token
    const getCorrectAnswer = (questionItem) => {
        if (!questionItem?.resolvedData) return '-';
        let ans = questionItem.resolvedData.answer; // If it's stored in plain text
        
        // If it's secured in a token, decode it
        if (!ans && questionItem.resolvedData.token) {
            try {
                const binaryString = atob(questionItem.resolvedData.token);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                ans = new TextDecoder().decode(bytes); // UTF-8 Safe Decoding
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
            const { data, error } = await supabase
                .from('responses')
                .select('*')
                .eq('room_id', session.id);
            if (!error && data && isMounted.current) {
                setResponses(data);
            }
        } catch (err) {
            console.error("Sync failed:", err);
        } finally {
            if (isMounted.current) setIsSyncing(false);
        }
    };

    const handleKickStudent = (alias) => {
        const confirmMsg = lang === 'sv' 
            ? `Vill du verkligen ta bort ${alias} från sessionen? All data raderas.` 
            : `Are you sure you want to kick ${alias}? All data for this student will be deleted.`;
        if (window.confirm(confirmMsg)) {
            onKick(alias);
            setResponses(prev => prev.filter(r => r.student_alias !== alias));
        }
    };

    const handleManualOverride = async (responseId, currentIsCorrect) => {
        const newStatus = !currentIsCorrect;
        
        // 1. Snapshot for rollback
        const previousResponses = [...responses];

        // 2. OPTIMISTIC UI UPDATE: Instant visual feedback
        setResponses(prevResponses => 
            prevResponses.map(res => 
                res.id === responseId 
                    ? { ...res, is_correct: newStatus, is_manually_corrected: true } 
                    : res
            )
        );

        // 3. BACKGROUND SYNC: Update Supabase silently
        try {
            const { data, error } = await supabase
                .from('responses')
                .update({ is_correct: newStatus })
                .eq('id', responseId)
                .select(); // 🟢 ADD THIS: Forces Supabase to return the updated row

            if (error) throw error;

            // 🟢 NEW SAFETY CHECK: If RLS blocks the update, data will be empty!
            if (!data || data.length === 0) {
                throw new Error("Update blocked by Supabase RLS. 0 rows updated.");
            }
            
        } catch (error) {
            console.error("Database sync failed for manual override:", error);
            
            // 4. ROLLBACK ON ERROR
            setResponses(previousResponses);
            alert(lang === 'sv' 
                ? "Databasfel: Din ändring sparades inte. Kontrollera Supabase RLS-rättigheter." 
                : "Database Error: Your change was not saved. Check Supabase RLS policies."
            );
        }
    };

    useEffect(() => {
        isMounted.current = true;
        if (!session?.id) return;
        syncData();
        const setupRealtime = () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            const channel = supabase.channel(`room_${session.id.slice(0,8)}`)
                .on('postgres_changes', { 
                    event: 'INSERT', schema: 'public', table: 'responses', filter: `room_id=eq.${session.id}` 
                }, (payload) => {
                    if (isMounted.current) {
                        setResponses(prev => {
                            if (prev.some(r => r.id === payload.new.id)) return prev;
                            return [...prev, payload.new];
                        });
                    }
                })
                .on('postgres_changes', {
                    event: 'DELETE', schema: 'public', table: 'responses'
                }, () => { syncData(); })
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
        packet.forEach((_, i) => tableHTML += `<th style="padding: 4px; width: 25px; text-align: center;">${i+1}</th>`);
        tableHTML += `</tr></thead><tbody>`;

        studentList.forEach(student => {
            const studentResps = packet.map((_, qIdx) => responses.find(r => r.student_alias === student && r.question_index === qIdx));
            const score = studentResps.filter(r => r?.is_correct).length;
            tableHTML += `<tr><td style="padding: 6px; font-weight: bold;">${student}</td><td style="padding: 6px; text-align: center;">${score}/${packet.length}</td>`;
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
        } catch (err) {
            alert("Kunde inte kopiera.");
        }
    };

    const handleEndSession = async () => {
        if (isClosing) return;
        setIsClosing(true);
        try { 
            // Explicitly update the database so the students' iPads get the signal!
            const { error } = await supabase
                .from('rooms')
                .update({ status: 'closed' })
                .eq('id', session.id);
                
            if (error) throw error;

            // Now officially close the teacher's frontend view
            await onEnd(); 
        } catch (err) {
            alert(lang === 'sv' ? "Kunde inte avsluta sessionen." : "Could not end session.");
            setIsClosing(false);
        }
    };

    // 🟢 CHANGED: Explicit menu selection (forces a re-shuffle every time 'random' is clicked)
    const applySort = (mode) => {
        if (mode === 'random') {
            const uniqueStudents = [...new Set(responses.map(r => r.student_alias))];
            setRandomizedStudents(uniqueStudents.sort(() => Math.random() - 0.5));
        }
        setSortMode(mode);
        setIsSortMenuOpen(false);
    };

    // 🟢 ADDED: Smart sorting logic
    const students = React.useMemo(() => {
        const base = [...new Set(responses.map(r => r.student_alias))];
        
        if (sortMode === 'az') {
            return base.sort((a, b) => a.localeCompare(b));
        }
        if (sortMode === 'progress') {
            return base.sort((a, b) => {
                const countA = responses.filter(r => r.student_alias === a).length;
                const countB = responses.filter(r => r.student_alias === b).length;
                return countB - countA || a.localeCompare(b); // Sorts highest first
            });
        }
        if (sortMode === 'random') {
            // Maintains the random order, but securely appends any newly joined students to the bottom
            const currentRandom = randomizedStudents.filter(s => base.includes(s));
            const missing = base.filter(s => !currentRandom.includes(s));
            return [...currentRandom, ...missing];
        }
        return base;
    }, [responses, sortMode, randomizedStudents]);
    
    const questionStats = packet.map((_, qIdx) => {
        const questionResponses = responses.filter(r => r.question_index === qIdx);
        const total = students.length || 0;
        const correct = questionResponses.filter(r => r.is_correct).length;
        const wrong = questionResponses.filter(r => !r.is_correct).length;
        return {
            correctPct: total > 0 ? (correct / total) * 100 : 0,
            wrongPct: total > 0 ? (wrong / total) * 100 : 0,
            remaining: total - questionResponses.length
        };
    });

    const getStatusColor = (isCorrect, answered, answerText) => {
        if (!answered) return 'bg-slate-100 opacity-30';
        if (hideCorrectness) return 'bg-indigo-300';
        
        //  pedagogical timeout indicator
        if (answerText === '[TIMEOUT]') return 'bg-slate-800 shadow-[0_0_8px_rgba(30,41,59,0.3)]'; 
        
        return isCorrect ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)]';
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
            
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

            {/* --- LANDSCAPE REPORT PREVIEW --- */}
            {showPrintPreview && (
                <LandscapeReport 
                    session={session} 
                    packet={packet} 
                    responses={responses} 
                    lang={lang} 
                    onClose={() => setShowPrintPreview(false)} 
                />
            )}

            {/* 3. MAIN DASHBOARD UI (Live Stream) */}
            <header className="bg-white border-b border-slate-200 px-4 py-2 sticky top-0 z-40 shadow-sm flex items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl flex flex-col items-center shadow-md">
                        <span className="text-[7px] font-black uppercase opacity-50 leading-none">{lang === 'sv' ? "KOD" : "CODE"}</span>
                        <span className="text-xl font-black italic leading-none">{session.class_code}</span>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-xs font-black uppercase tracking-tight text-slate-900 leading-none truncate max-w-[150px]">{session.title}</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{lang === 'sv' ? "Live Lektion" : "Live Lesson"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 border transition-all ${
                        connStatus === 'SUBSCRIBED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                    }`}>
                        {connStatus === 'SUBSCRIBED' ? 'Live' : connStatus}
                    </div>
                    <button onClick={syncData} disabled={isSyncing} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                        <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                    </button>
                    {/* 🟢 ADDED: Sort Dropdown Menu */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} 
                            title={lang === 'sv' ? "Sortera elever" : "Sort students"} 
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-1"
                        >
                            {sortMode === 'az' ? <ArrowDownAZ size={14} /> : sortMode === 'progress' ? <ListOrdered size={14} /> : <Shuffle size={14} />}
                            <ChevronDown size={12} className="opacity-50" />
                        </button>

                        {isSortMenuOpen && (
                            <>
                                {/* Invisible backdrop to close the menu when clicking away */}
                                <div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)}></div>
                                
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-1">
                                    <button 
                                        onClick={() => applySort('az')} 
                                        className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-all flex items-center gap-3 text-xs font-black uppercase tracking-wider ${sortMode === 'az' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                                    >
                                        <ArrowDownAZ size={14} /> {lang === 'sv' ? "Namn (A-Ö)" : "Name (A-Z)"}
                                    </button>
                                    <button 
                                        onClick={() => applySort('progress')} 
                                        className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-all flex items-center gap-3 text-xs font-black uppercase tracking-wider ${sortMode === 'progress' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                                    >
                                        <ListOrdered size={14} /> {lang === 'sv' ? "Mest aktiva" : "Most Active"}
                                    </button>
                                    <button 
                                        onClick={() => applySort('random')} 
                                        className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-all flex items-center gap-3 text-xs font-black uppercase tracking-wider ${sortMode === 'random' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                                    >
                                        <Shuffle size={14} /> {lang === 'sv' ? "Slumpa" : "Shuffle"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <button 
                        onClick={() => setShowActualAnswers(!showActualAnswers)} 
                        title={showActualAnswers ? "Visa status" : "Visa svar"} 
                        className={`p-2 rounded-lg border transition-all shadow-sm ${showActualAnswers ? 'bg-orange-500 text-white text-[10px] font-black uppercase border-orange-600' : 'bg-white text-[10px] font-black uppercase text-slate-800 border-slate-500'}`}
                    >
                        Visa Svar
                    </button>
                    <button onClick={() => setIsAnonymous(!isAnonymous)} title="Namn" className={`p-2 rounded-lg border transition-all shadow-sm ${isAnonymous ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}>
                        {isAnonymous ? <Shield size={14} /> : <Users size={14} />}
                    </button>
                    <button onClick={() => setHideCorrectness(!hideCorrectness)} title="Resultat" className={`p-2 rounded-lg border transition-all shadow-sm ${hideCorrectness ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}>
                        {hideCorrectness ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => setShowWrapUp(true)} className="bg-rose-500 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md">
                         Avsluta
                    </button>
                    
                                        
                    
                </div>
            </header>

            <main className="flex-1 overflow-auto p-4 lg:p-6 no-print">
                <div className="max-w-[1600px] mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full min-h-[600px]">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="text-indigo-600" size={18} />
                            <h2 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 leading-none">{session.title}</h2>
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{students.length} {lang === 'sv' ? "Elever anslutna" : "Students connected"}</div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                            <thead className="sticky top-0 z-10 shadow-sm">
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-3 w-48 bg-slate-100 border-r border-slate-200">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'sv' ? "Klassens resultat" : "Class results"}</span>
                                    </th>
                                    <th className="p-3 w-20 border-r border-slate-200 bg-slate-100"></th>
                                    {questionStats.map((stats, i) => (
                                        <th key={`stat-${i}`} className="p-1.5 border-r border-slate-200 align-bottom">
                                            <div className="w-full h-12 bg-slate-200 rounded-lg overflow-hidden flex flex-col-reverse relative group cursor-help">
                                                <div style={{ height: `${stats.correctPct}%` }} className="bg-emerald-500 transition-all duration-500" />
                                                <div style={{ height: `${stats.wrongPct}%` }} className="bg-rose-500 transition-all duration-500" />
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-900/90 flex items-center justify-center transition-opacity">
                                                    <span className="text-[9px] text-white font-black">{Math.round(stats.correctPct)}%</span>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                                <tr className="bg-slate-900 text-white">
                                    <th className="p-3 w-48 text-[9px] font-black uppercase tracking-widest border-r border-white/10">{lang === 'sv' ? "Elev" : "Student"}</th>
                                    <th className="p-3 w-20 text-[9px] font-black uppercase tracking-widest text-center border-r border-white/10">{lang === 'sv' ? "Klar" : "Done"}</th>
                                    {packet.map((q, i) => (
                                        <th key={i} className="p-0 border-r border-white/10">
                                            <button onClick={() => setZoomIndex(i)}
                                                className="w-full h-full py-1.5 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors"
                                            >
                                                <span className="text-[9px] font-black uppercase tracking-widest text-center">{i + 1}</span>
                                                {/*  INJECT ANSWER KEY INTO HEADER */}
                                                {showActualAnswers && (
                                                    <span className="text-[8px] text-orange-300 font-bold bg-orange-400/10 px-1.5 py-0.5 rounded truncate max-w-[50px] tracking-normal" title={getCorrectAnswer(q)}>
                                                        {getCorrectAnswer(q)}
                                                    </span>
                                                )}
                                            </button>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((student, sIdx) => {
                                    const studentResps = responses.filter(r => r.student_alias === student);
                                    const progress = Math.round((studentResps.length / packet.length) * 100);
                                    return (
                                        <tr key={student} className="hover:bg-slate-50 transition-colors group/row">
                                            <td className="p-2 border-r border-slate-100 font-bold text-slate-700 text-xs truncate flex items-center justify-between">
                                                <span>{isAnonymous ? `Elev ${sIdx + 1}` : student}</span>
                                                <button onClick={() => handleKickStudent(student)} className="opacity-0 group-hover/row:opacity-100 p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"><UserX size={14} /></button>
                                            </td>
                                            <td className="p-2 border-r border-slate-100 text-center">
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${progress === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                                    {progress}%
                                                </span>
                                            </td>
                                            {packet.map((_, qIdx) => {
                                                const resp = responses.find(r => r.student_alias === student && r.question_index === qIdx);
                                                return (
                                                    <td 
                                                        key={qIdx} 
                                                        className="p-1 border-r border-slate-50"
                                                        onClick={() => resp && handleManualOverride(resp.id, resp.is_correct)} 
                                                    >
                                                        <div 
                                                            title={resp ? `Svar: ${resp.answer} (Klicka för att ändra rättning)` : 'Inget svar'}
                                                            className={`w-full h-8 rounded-md transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-95 active:scale-90 ${getStatusColor(resp?.is_correct, !!resp, resp?.answer)}`}
                                                        >
                                                            {/* Show actual answer text if toggle is active */}
                                                            {showActualAnswers && resp && (
                                                                <span className="text-[9px] font-black text-white px-1 truncate">
                                                                    {resp.answer === '[TIMEOUT]' ? 'TID' : resp.answer}
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
                    </div>
                </div>
            </main>

            {/* --- COMPACT ZOOM-IN QUESTION OVERLAY --- */}
            {zoomIndex !== null && (
                <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 no-print">
                    <div className="bg-white w-full h-full max-w-7xl rounded-[2rem] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 shadow-2xl">
                        
                        {/* 1. COMPACT HEADER */}
                        <div className="px-6 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-900 text-white px-3 py-1 rounded-lg flex flex-col items-center shadow-sm">
                                    <span className="text-[6px] font-black uppercase opacity-50 leading-none">KOD</span>
                                    <span className="text-sm font-black italic leading-none">{session.class_code}</span>
                                </div>
                                
                                <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl font-black italic text-xs tracking-tighter uppercase">
                                    {lang === 'sv' ? "Uppgift" : "Question"} {zoomIndex + 1}
                                </div>

                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    {responses.filter(r => r.question_index === zoomIndex).length}/{students.length} {lang === 'sv' ? "Svar" : "Answers"}
                                </div>

                                {/*  TEACHER-LED BROADCAST BUTTON */}
                                {isTeacherLed && (
                                    <button 
                                        disabled={isPushing}
                                        onClick={async () => {
                                            setIsPushing(true);
                                            
                                            // 🟢 FIX 1: Safely parse the current database payload
                                            let activeData = session.active_question_data;
                                            if (typeof activeData === 'string') {
                                                try { activeData = JSON.parse(activeData); } catch(e) {}
                                            }
                                            
                                            // 🟢 FIX 2: FORCE the pacing flag to stay intact while updating index
                                            const updatedSettings = { 
                                                ...(activeData?.settings || {}), 
                                                pacing: 'teacher', // 👈 Crucial safety lock!
                                                current_index: zoomIndex 
                                            };
                                            
                                            const payload = { 
                                                ...activeData, 
                                                settings: updatedSettings 
                                            };
                                            
                                            await supabase.from('rooms')
                                                .update({ active_question_data: payload })
                                                .eq('id', session.id);
                                                
                                            setIsPushing(false);
                                        }}
                                        className="ml-4 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-95"
                                    >
                                        {isPushing ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
                                        {lang === 'sv' ? "Tvinga hit klassen" : "Sync Class Here"}
                                    </button>
                                )}
                            </div>

                            {/* 🟢 RESTORED: NAVIGATION BUTTONS & HEADER CLOSING DIV */}
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setZoomIndex(prev => Math.max(0, prev - 1))}
                                    disabled={zoomIndex === 0}
                                    className="p-2 hover:bg-slate-200 rounded-full disabled:opacity-10 transition-all text-slate-600"
                                ><ChevronLeft size={24}/></button>
                                <button 
                                    onClick={() => setZoomIndex(prev => Math.min(packet.length - 1, prev + 1))}
                                    disabled={zoomIndex === packet.length - 1}
                                    className="p-2 hover:bg-slate-200 rounded-full disabled:opacity-10 transition-all text-slate-600"
                                ><ChevronRight size={24}/></button>
                                <div className="w-px h-6 bg-slate-200 mx-1" />
                                <button onClick={() => { setZoomIndex(null); setShowWorkGrid(false); }} className="p-2 hover:bg-rose-50 text-rose-500 rounded-full transition-all"><X size={24}/></button>
                            </div>
                        </div>

                        {/* 2. COMPACT QUESTION ZONE */}
                        <div className="px-8 py-4 bg-indigo-50/20 border-b border-indigo-50 shrink-0 relative">
                            
                            {/* NEW: PROMINENT ANSWER KEY BADGE */}
                            {showActualAnswers && (
                                <div className="absolute top-1/2 -translate-y-1/2 right-6 bg-orange-100 border border-orange-200 text-orange-800 px-4 py-2 rounded-xl text-lg font-black shadow-sm flex items-center gap-2">
                                    <span className="opacity-60 uppercase text-[12px] tracking-widest">{lang === 'sv' ? "Facit" : "Key"}</span>
                                    <span>{getCorrectAnswer(packet[zoomIndex])}</span>
                                </div>
                            )}

                            <div className="text-lg font-bold text-slate-800 leading-snug text-center max-w-3xl mx-auto">
                                <MathDisplay content={packet[zoomIndex].resolvedData?.renderData?.description} />
                                
                                {packet[zoomIndex].resolvedData?.renderData?.latex && (
                                    <div className="mt-2 text-2xl text-indigo-600 font-serif border-t border-indigo-100/50 pt-2">
                                        <MathDisplay content={`$$${packet[zoomIndex].resolvedData.renderData.latex}$$`} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. MAIN CONTENT SPLIT */}
                        <div className="flex-1 flex overflow-hidden w-full">
                            
                            {!showWorkGrid ? (
                                /* --- STANDARD LAYOUT --- */
                                <>
                                    <div className="flex-1 p-6 flex items-center justify-center bg-white overflow-hidden border-r border-slate-50">
                                        <div className="flex-1 flex flex-col justify-center items-center py-6 min-h-[150px]">
                                            <div className="flex justify-center scale-90 origin-top mt-2">
                                                <VisualRenderer 
                                                    data={packet[zoomIndex]?.resolvedData?.renderData} 
                                                    isWordProblem={packet[zoomIndex]?.selectedStoryIndex !== null && packet[zoomIndex]?.selectedStoryIndex !== undefined} 
                                                />
                                            </div>
                                            {packet[zoomIndex]?.resolvedData?.renderData?.latex && (
                                                <div className="mt-4 text-3xl font-serif text-indigo-600 bg-indigo-50 px-6 py-4 rounded-2xl">
                                                    <MathDisplay content={`$$${packet[zoomIndex].resolvedData.renderData.latex}$$`} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-64 sm:w-72 bg-slate-50/50 p-4 flex flex-col gap-3 overflow-y-auto shrink-0">
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

                                        {hasScratchpad && (
                                            <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                                                        {lang === 'sv' ? 'Anteckningar' : 'Scratchpads'}
                                                    </h4>
                                                    <button onClick={() => setShowWorkGrid(true)} className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-md transition-all" title="Visa i stort rutnät">
                                                        <LayoutGrid size={14} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                                                    {responses.filter(r => r.question_index === zoomIndex && r.work_steps?.length > 0).map((r, i) => (
                                                        <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                                                            <div className="flex justify-between items-center mb-1 text-slate-400 text-[10px] font-sans font-bold">
                                                                <span>{isAnonymous ? `Elev ${i + 1}` : r.student_alias}</span>
                                                                <span className={r.is_correct ? 'text-emerald-600' : 'text-rose-600'}>{r.answer}</span>
                                                            </div>
                                                            <div className="space-y-1 text-slate-800">
                                                                {/* 🟢 FIXED: Wrapped steps in LaTeX display */}
                                                                {r.work_steps.map((line, lineIdx) => (
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
                                /* --- 🟢 NEW: MASSIVE SCRATCHPAD GRID VIEW --- */
                                <>
                                    {/* Shrunk Left Column: Keeps visual/math context alive */}
                                    <div className="w-64 sm:w-80 p-6 flex flex-col bg-white border-r border-slate-100 overflow-y-auto shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                                        <button onClick={() => setShowWorkGrid(false)} className="w-full mb-6 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                                            <ChevronLeft size={14}/> {lang === 'sv' ? "Tillbaka till Översikt" : "Back to Summary"}
                                        </button>
                                        
                                        <div className="flex justify-center scale-75 origin-top mt-2">
                                            <VisualRenderer 
                                                data={packet[zoomIndex]?.resolvedData?.renderData} 
                                                isWordProblem={packet[zoomIndex]?.selectedStoryIndex !== null && packet[zoomIndex]?.selectedStoryIndex !== undefined} 
                                            />
                                        </div>
                                        {packet[zoomIndex]?.resolvedData?.renderData?.latex && (
                                            <div className="mt-4 text-xl font-serif text-indigo-600 bg-indigo-50 px-4 py-3 rounded-xl text-center">
                                                <MathDisplay content={`$$${packet[zoomIndex].resolvedData.renderData.latex}$$`} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Massive Right Column: 4-Column Work Grid */}
                                    <div className="flex-1 p-6 bg-slate-50 overflow-y-auto custom-scrollbar">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start content-start">
                                            {responses.filter(r => r.question_index === zoomIndex && r.work_steps?.length > 0).map((r, i) => (
                                                <div key={i} className="bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col">
                                                    <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-3">
                                                        <span className="font-black text-sm text-slate-800">{isAnonymous ? `Elev ${i + 1}` : r.student_alias}</span>
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${r.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                            {r.answer}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 space-y-2 text-slate-700">
                                                        {r.work_steps.map((line, lineIdx) => (
                                                            <div key={lineIdx} className="overflow-x-auto custom-scrollbar pb-1 text-sm bg-slate-50/50 px-2 rounded">
                                                                <MathDisplay content={`$\\displaystyle ${line}$`} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {responses.filter(r => r.question_index === zoomIndex && r.work_steps?.length > 0).length === 0 && (
                                                <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                    {lang === 'sv' ? "Inga anteckningar inskickade än." : "No scratchpads submitted yet."}
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