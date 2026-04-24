import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
    Users, Eye, EyeOff, Shield, BarChart3, Loader2, 
    RefreshCw, Download, Printer, Copy, Save, X, UserX,
    ChevronLeft, ChevronRight, CheckCircle2, XCircle, Type
} from 'lucide-react';
import { UI_TEXT } from '../../constants/localization';

// --- VISUAL & INPUT IMPORTS ---
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents';
import { TransversalVisual, CompositeVisual } from '../visuals/ComplexGeometry';
import PatternVisual from '../visuals/PatternComponents';
import ProbabilityTree from '../visuals/ProbabilityTree';
import { ProbabilityMarbles, ProbabilitySpinner } from '../visuals/ProbabilityVisuals';
import { ScaleVisual, SimilarityCompare, CompareShapesArea } from '../visuals/ScaleVisuals';
import { FrequencyTable, PercentGrid } from '../visuals/StatisticsVisuals';
import AngleVisual from '../visuals/AngleComponents';

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

// --- REFACTORED LANDSCAPE PRINT STYLES ---
const printStyles = `
    @media screen {
        .landscape-report-preview {
            width: 297mm;
            min-height: 210mm;
            padding: 15mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.15);
            transform-origin: top center;
        }
    }

    @media print {
        @page { 
            size: landscape; 
            margin: 8mm; 
        }
        
        /* 1. RESET BODY AND HTML FOR PRINT FLOW */
        html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
        }

        /* 2. FORCE MODAL TO NATURAL FLOW */
        .print-modal-container {
            position: relative !important;
            height: auto !important;
            width: 100% !important;
            overflow: visible !important;
            display: block !important;
            background: white !important;
            z-index: auto !important;
        }

        /* 3. RESET FLEX PARENTS THAT CLIP CONTENT */
        .min-h-screen {
            height: auto !important;
            display: block !important;
        }

        .no-print { display: none !important; }

        .landscape-report-preview {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            transform: none !important;
        }

        /* 4. ROBUST PAGE BREAK HANDLING */
        .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block;
            position: relative;
        }

        table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            page-break-inside: auto;
        }

        tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        th, td {
            border: 1px solid #cbd5e1 !important;
            word-wrap: break-word !important;
        }
    }
`;

export default function TeacherLiveView({ session, packet, lang, onEnd, onKick, onCreateReport }) {
    const [responses, setResponses] = useState([]);
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [hideCorrectness, setHideCorrectness] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [connStatus, setConnStatus] = useState('CONNECTING');
    const [isSyncing, setIsSyncing] = useState(false);
    const [showWrapUp, setShowWrapUp] = useState(false); 
    const [showPrintPreview, setShowPrintPreview] = useState(false); // Added for landscape preview
    const [zoomIndex, setZoomIndex] = useState(null);

    const ui = UI_TEXT[lang];
    const isMounted = useRef(true);
    const channelRef = useRef(null);
    
    const [showActualAnswers, setShowActualAnswers] = useState(false); // Toggle between answer icons and text


    // --- RENDER VISUAL HELPER ---
    const renderVisual = (item) => {
        const data = item.resolvedData?.renderData;
        if (!data) return null;
        if (data.graph) return <GraphCanvas data={data.graph} />;
        if (data.pattern || data.geometry?.subtype === 'matchsticks' || data.geometry?.subtype === 'sequence') return <PatternVisual data={data.pattern || data.geometry} />;
        if (data.marbles || data.geometry?.type === 'marbles' || data.geometry?.items) return <ProbabilityMarbles data={data.marbles || data.geometry} />;
        if (data.spinner || data.geometry?.type === 'spinner') return <ProbabilitySpinner data={data.spinner || data.geometry} />;
        if (data.freqTable || data.geometry?.type === 'frequency_table' || data.geometry?.headers) return <FrequencyTable data={data.freqTable || data.geometry} />;
        if (data.percentGrid || data.geometry?.type === 'percent_grid') return <PercentGrid data={data.percentGrid || data.geometry} />;
        if (data.geometry && ['cylinder', 'cuboid', 'sphere', 'cone', 'pyramid', 'triangular_prism'].includes(data.geometry.type)) return <VolumeVisualization data={data.geometry} width={400} height={300} />;
        if (data.geometry?.type === 'transversal') return <TransversalVisual data={data.geometry} />;
        if (data.geometry?.type === 'composite') return <CompositeVisual data={data.geometry} />;
        if (data.geometry?.type === 'angle') return <AngleVisual data={data.geometry} />;
        if (data.scale || data.geometry?.type === 'scale') return <ScaleVisual data={data.scale || data.geometry} />;
        if (data.similarity || data.geometry?.type === 'similarity') return <SimilarityCompare data={data.similarity || data.geometry} />;
        if (data.compareArea || data.geometry?.type === 'compare_area') return <CompareShapesArea data={data.compareArea || data.geometry} />;
        if (data.tree || data.geometry?.type === 'pathway') return <ProbabilityTree data={data.tree || data.geometry} />;
        if (data.geometry) return <GeometryVisual data={data.geometry} />;
        return null;
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
        try { await onEnd(); } catch (err) {
            alert(lang === 'sv' ? "Kunde inte avsluta sessionen." : "Could not end session.");
            setIsClosing(false);
        }
    };

    const students = [...new Set(responses.map(r => r.student_alias))].sort();
    
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

    const getStatusColor = (isCorrect, answered) => {
        if (!answered) return 'bg-slate-100 opacity-30';
        if (hideCorrectness) return 'bg-indigo-300';
        return isCorrect ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)]';
    };

    const handleManualGrade = async (response) => {
        if (!response || !response.id) return;

        // 1. Optimistic local update for instant feedback
        setResponses(prev => prev.map(r => 
            r.id === response.id ? { ...r, is_correct: !r.is_correct } : r
        ));

        // 2. Persist to database
        try {
            const { error } = await supabase
                .from('responses')
                .update({ is_correct: !response.is_correct })
                .eq('id', response.id);
                
            if (error) throw error;
        } catch (err) {
            console.error("Error updating grade:", err);
            // Revert on error if necessary
            syncData();
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
            <style>{printStyles}</style>
            
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

            {/* --- 2. LANDSCAPE REPORT PREVIEW (FIXED FLOW) --- */}
            {showPrintPreview && (
                <div className="fixed inset-0 z-[150] bg-slate-100 overflow-y-auto no-scrollbar print-modal-container">
                    <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center z-50 no-print">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShowPrintPreview(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><ChevronLeft size={24}/></button>
                            <h3 className="font-black uppercase italic tracking-tighter">{lang === 'sv' ? "Förhandsgranskning" : "Print Preview"}</h3>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => window.print()} className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 flex items-center gap-2">
                                <Printer size={16}/> {lang === 'sv' ? "Skriv ut" : "Print"}
                            </button>
                            <button onClick={() => setShowPrintPreview(false)} className="bg-slate-900 text-white px-8 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                                {lang === 'sv' ? "Stäng" : "Close"}
                            </button>
                        </div>
                    </div>

                    <div className="landscape-report-preview">
                        <header className="flex justify-between items-end mb-6 border-b-2 border-slate-900 pb-4">
                            <div>
                                <h1 className="text-2xl font-black uppercase italic tracking-tight leading-none mb-1">{session.title}</h1>
                                <p className="text-[9px] font-black uppercase text-indigo-600 tracking-[0.2em]">Resultatrapport • Live Lektion</p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black italic">KOD: {session.class_code}</div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date().toLocaleDateString()}</p>
                            </div>
                        </header>

                        {/* SECTION 1: OVERVIEW */}
                        <div className="mb-10 avoid-break">
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-slate-400 italic">1. Översikt (Klassnivå)</h3>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="p-2 text-left text-[9px] font-black uppercase w-40 border-r border-slate-300">Elev</th>
                                        <th className="p-2 text-center text-[9px] font-black uppercase w-14 border-r border-slate-300">Res.</th>
                                        {packet.map((_, i) => (
                                            <th key={i} className="w-[26px] p-1 text-center text-[8px] font-black bg-slate-50 border-r border-slate-200">{i + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => {
                                        const studentResps = packet.map((_, qIdx) => responses.find(r => r.student_alias === student && r.question_index === qIdx));
                                        const score = studentResps.filter(r => r?.is_correct).length;
                                        return (
                                            <tr key={student} className="border-b border-slate-100">
                                                <td className="p-1.5 font-bold text-[10px] truncate border-r border-slate-100">{student}</td>
                                                <td className="p-1.5 text-center text-[9px] font-black border-r border-slate-100 bg-slate-50/50">{score}/{packet.length}</td>
                                                {studentResps.map((r, idx) => (
                                                    <td key={idx} className="p-0 text-center border-r border-slate-50">
                                                        <div className={`w-full h-7 flex items-center justify-center font-bold text-xs ${r ? (r.is_correct ? 'text-emerald-600 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50') : 'text-slate-200'}`}>
                                                            {r ? (r.is_correct ? '✓' : '✕') : '-'}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* SECTION 2: DETAILED ANSWERS */}
                        <div className="mt-12">
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-slate-400 italic">2. Individuella Svar (Detaljerat)</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                                {students.map(student => {
                                    const studentResps = packet.map((q, qIdx) => ({
                                        question: q.resolvedData?.renderData?.description || `Uppgift ${qIdx + 1}`,
                                        resp: responses.find(r => r.student_alias === student && r.question_index === qIdx)
                                    }));
                                    return (
                                        <div key={student} className="avoid-break bg-slate-50/30 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                                                <span className="font-black text-xs uppercase italic text-slate-800">{student}</span>
                                                <span className="text-[9px] font-bold text-slate-400">{studentResps.filter(s => s.resp?.is_correct).length}/{packet.length} Rätt</span>
                                            </div>
                                            <div className="space-y-2">
                                                {studentResps.map((item, idx) => (
                                                    <div key={idx} className="flex gap-2 text-[9px] leading-tight">
                                                        <span className="font-black text-slate-300 shrink-0">{idx + 1}.</span>
                                                        <div className="flex-1">
                                                            <div className="text-slate-500 italic mb-0.5 truncate opacity-60">
                                                                <MathDisplay content={typeof item.question === 'string' ? item.question : 'Uppgift'} />
                                                            </div>
                                                            <div className={`font-bold ${item.resp ? (item.resp.is_correct ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-300'}`}>
                                                                Svar: {item.resp?.answer || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <footer className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                            <div>Anpassa Math Platform • Systemgenererad Rapport</div>
                        </footer>
                    </div>
                </div>
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
                                    {packet.map((_, i) => (
                                        <th key={i} className="p-0 border-r border-white/10">
                                            <button onClick={() => setZoomIndex(i)}
                                                className="w-full h-full p-3 text-[9px] font-black uppercase tracking-widest text-center hover:bg-white/10 transition-colors"
                                            >
                                                {i + 1}
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
                                                        onClick={() => resp && handleManualGrade(resp)} // Trigger manual override
                                                    >
                                                        <div 
                                                            title={resp ? `Svar: ${resp.answer} (Klicka för att ändra rättning)` : 'Inget svar'}
                                                            className={`w-full h-8 rounded-md transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer ${getStatusColor(resp?.is_correct, !!resp)}`}
                                                        >
                                                            {/* Show actual answer text if toggle is active */}
                                                            {showActualAnswers && resp && (
                                                                <span className="text-[9px] font-black text-white px-1 truncate">
                                                                    {resp.answer}
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
                            </div>
                            
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
                                <button onClick={() => setZoomIndex(null)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-full transition-all"><X size={24}/></button>
                            </div>
                        </div>

                        {/* 2. COMPACT QUESTION ZONE */}
                        <div className="px-8 py-4 bg-indigo-50/20 border-b border-indigo-50 shrink-0">
                            <div className="text-lg font-bold text-slate-800 leading-snug text-center max-w-3xl mx-auto">
                                <MathDisplay content={packet[zoomIndex].resolvedData?.renderData?.description} />
                                
                                {packet[zoomIndex].resolvedData?.renderData?.latex && (
                                    <div className="mt-2 text-2xl text-indigo-600 font-serif border-t border-indigo-100/50 pt-2">
                                        <MathDisplay content={`$$${packet[zoomIndex].resolvedData.renderData.latex}$$`} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. MAIN CONTENT SPLIT (Optimized for window height) */}
                        <div className="flex-1 flex overflow-hidden w-full">
                            
                            {/* LEFT COLUMN: Visual (Scaled to contain) */}
                            <div className="flex-1 p-6 flex items-center justify-center bg-white overflow-hidden border-r border-slate-50">
                                <div className="w-full h-full flex items-center justify-center transform scale-110 drop-shadow-xl">
                                    {renderVisual(packet[zoomIndex])}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Compact Power Cards */}
                            <div className="w-64 sm:w-72 bg-slate-50/50 p-4 flex flex-col gap-3 overflow-y-auto shrink-0">
                                
                                {/* GREEN CARD */}
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

                                {/* RED CARD */}
                                <div className="bg-rose-500 rounded-[1.5rem] p-4 text-white shadow-md">
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

                                {/* SLATE CARD */}
                                <div className="bg-slate-800 rounded-[1.5rem] p-4 text-white shadow-md">
                                    <div className="flex items-center gap-2 mb-1 opacity-80">
                                        <Users size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{lang === 'sv' ? "Ej klara" : "Remaining"}</span>
                                    </div>
                                    <div className="text-xl font-black">
                                        {students.length - responses.filter(r => r.question_index === zoomIndex).length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}