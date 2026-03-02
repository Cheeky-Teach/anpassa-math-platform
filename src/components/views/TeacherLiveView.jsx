import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
    Users, Eye, EyeOff, Shield, BarChart3, Loader2, 
    RefreshCw, Download, Printer, Copy, Save, X, UserX,
    ChevronLeft, ChevronRight, CheckCircle2, XCircle 
} from 'lucide-react';
import { UI_TEXT } from '../../constants/localization';

// --- VISUAL & INPUT IMPORTS (Ported from Student View) ---
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

export default function TeacherLiveView({ session, packet, lang, onEnd, onKick, onCreateReport }) {
    const [responses, setResponses] = useState([]);
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [hideCorrectness, setHideCorrectness] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [connStatus, setConnStatus] = useState('CONNECTING');
    const [isSyncing, setIsSyncing] = useState(false);
    const [showWrapUp, setShowWrapUp] = useState(false); 
    
    const [zoomIndex, setZoomIndex] = useState(null); // Track which question is zoomed in

    // --- RENDER VISUAL HELPER (Ported from StudentLiveView) ---
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
        return null;
    };

    const ui = UI_TEXT[lang];
    const isMounted = useRef(true);
    const channelRef = useRef(null);

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

    /**
     * REFINED KICK HANDLER:
     * Simply confirms the action and passes the alias up to App.jsx
     */
    const handleKickStudent = (alias) => {
        const confirmMsg = lang === 'sv' 
            ? `Vill du verkligen ta bort ${alias} från sessionen? All data raderas.` 
            : `Are you sure you want to kick ${alias}? All data for this student will be deleted.`;
        
        if (window.confirm(confirmMsg)) {
            onKick(alias);
            // Local optimistic update so the teacher sees the change instantly
            setResponses(prev => prev.filter(r => r.student_alias !== alias));
        }
    };

    useEffect(() => {
        isMounted.current = true;
        if (!session?.id) return;

        syncData();

        const setupRealtime = () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }

            const channel = supabase.channel(`room_${session.id.slice(0,8)}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'responses', 
                    filter: `room_id=eq.${session.id}` 
                }, (payload) => {
                    if (isMounted.current) {
                        setResponses(prev => {
                            if (prev.some(r => r.id === payload.new.id)) return prev;
                            return [...prev, payload.new];
                        });
                    }
                })
                .on('postgres_changes', {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'responses'
                }, () => {
                    // Sync data if a deletion happens (e.g. from handleKick)
                    syncData();
                })
                .subscribe(async (status) => {
                    if (!isMounted.current) return;
                    setConnStatus(status);
                    
                    if (status === 'SUBSCRIBED') {
                        syncData();
                    }

                    if (status === 'TIMED_OUT' || status === 'CLOSED') {
                        setTimeout(() => {
                            if (isMounted.current) setupRealtime();
                        }, 5000);
                    }
                });

            channelRef.current = channel;
        };

        setupRealtime();

        return () => {
            isMounted.current = false;
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [session?.id]);

    const copyToClipboard = async () => {
        const studentList = [...new Set(responses.map(r => r.student_alias))].sort();
        let tableHTML = `<table border="1" style="border-collapse: collapse; font-family: sans-serif;">
            <thead style="background: #f1f5f9;">
                <tr><th style="padding: 8px;">Elev</th><th style="padding: 8px;">Resultat</th>`;
        packet.forEach((_, i) => tableHTML += `<th style="padding: 8px;">U${i+1}</th>`);
        tableHTML += `</tr></thead><tbody>`;

        studentList.forEach(student => {
            const studentResps = packet.map((_, qIdx) => responses.find(r => r.student_alias === student && r.question_index === qIdx));
            const score = studentResps.filter(r => r?.is_correct).length;
            tableHTML += `<tr><td style="padding: 8px; font-weight: bold;">${student}</td><td style="padding: 8px;">${score}/${packet.length}</td>`;
            studentResps.forEach(r => {
                const text = r ? (r.is_correct ? 'Rätt' : 'Fel') : '-';
                const color = r ? (r.is_correct ? '#10b981' : '#f43f5e') : '#94a3b8';
                tableHTML += `<td style="padding: 8px; color: ${color}; text-align: center;">${text}</td>`;
            });
            tableHTML += `</tr>`;
        });
        tableHTML += `</tbody></table>`;

        try {
            const blob = new Blob([tableHTML], { type: 'text/html' });
            const item = new ClipboardItem({ 'text/html': blob });
            await navigator.clipboard.write([item]);
            alert(lang === 'sv' ? "Tabellen har kopierats!" : "Table copied!");
        } catch (err) {
            alert("Kunde inte kopiera.");
        }
    };

    const handleEndSession = async () => {
        if (isClosing) return;
        setIsClosing(true);
        try {
            await onEnd(); 
        } catch (err) {
            console.error("Error ending session:", err);
            alert("Kunde inte avsluta sessionen. Försök igen.");
            setIsClosing(false);
        }
    };

    const students = [...new Set(responses.map(r => r.student_alias))].sort();
    
    // --- NEW: SUCCESS RATE CALCULATION ---
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

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
            
            {showWrapUp && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-b-8 border-indigo-100">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">Avsluta Session</h2>
                            <button onClick={() => setShowWrapUp(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
                        </div>
                        
                        <div className="p-8 space-y-4">
                            <button onClick={() => onCreateReport(responses)} className="w-full group p-6 bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-600 rounded-3xl text-left transition-all">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Printer size={20}/></div>
                                    <span className="font-black uppercase tracking-tight text-indigo-900 text-lg">Utskriftsvänlig Rapport</span>
                                </div>
                                <p className="text-indigo-600/60 text-xs font-bold leading-relaxed ml-14">Genererar en kompakt A4-översikt för din betygsmapp.</p>
                            </button>

                            <button onClick={copyToClipboard} className="w-full group p-6 bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-600 rounded-3xl text-left transition-all">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg"><Copy size={20}/></div>
                                    <span className="font-black uppercase tracking-tight text-emerald-900 text-lg">Kopiera Tabell</span>
                                </div>
                                <p className="text-emerald-600/60 text-xs font-bold leading-relaxed ml-14">Klistra in resultatet direkt i Word eller Excel.</p>
                            </button>

                            <button onClick={handleEndSession} disabled={isClosing} className="w-full group p-6 bg-slate-50 border-2 border-slate-100 hover:border-slate-900 rounded-3xl text-left transition-all disabled:opacity-50">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                                        {isClosing ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                                    </div>
                                    <span className="font-black uppercase tracking-tight text-slate-900 text-lg">Stäng & Arkivera (48h)</span>
                                </div>
                                <p className="text-slate-400 text-xs font-bold leading-relaxed ml-14">Rensas automatiskt efter 48 timmar (GDPR).</p>
                            </button>
                        </div>

                        <div className="p-6 bg-slate-50 flex justify-end items-center border-t border-slate-100">
                             <button onClick={() => setShowWrapUp(false)} className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-300 transition-colors">Avbryt</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="bg-white border-b border-slate-200 px-4 py-2 sticky top-0 z-40 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl flex flex-col items-center shadow-md">
                        <span className="text-[7px] font-black uppercase opacity-50 leading-none">KOD</span>
                        <span className="text-xl font-black italic leading-none">{session.class_code}</span>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-xs font-black uppercase tracking-tight text-slate-900 leading-none truncate max-w-[150px]">{session.title}</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Live Klassrum</p>
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

            <main className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="max-w-[1600px] mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full min-h-[600px]">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="text-indigo-600" size={18} />
                            <h2 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 leading-none">{session.title}</h2>
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{students.length} Elever anslutna</div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                            <thead className="sticky top-0 z-10 shadow-sm">
                                {/* ROW 1: Diagnostic Success Bars */}
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-3 w-48 bg-slate-100 border-r border-slate-200">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klassens Resultat</span>
                                    </th>
                                    <th className="p-3 w-20 border-r border-slate-200 bg-slate-100"></th>
                                    {questionStats.map((stats, i) => (
                                        <th key={`stat-${i}`} className="p-1.5 border-r border-slate-200 align-bottom">
                                            <div className="w-full h-12 bg-slate-200 rounded-lg overflow-hidden flex flex-col-reverse relative group cursor-help">
                                                {/* Correct Bar (Green) */}
                                                <div style={{ height: `${stats.correctPct}%` }} className="bg-emerald-500 transition-all duration-500" />
                                                {/* Wrong Bar (Red) */}
                                                <div style={{ height: `${stats.wrongPct}%` }} className="bg-rose-500 transition-all duration-500" />
                                                
                                                {/* Tooltip on Hover */}
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-900/90 flex items-center justify-center transition-opacity">
                                                    <span className="text-[9px] text-white font-black">{Math.round(stats.correctPct)}%</span>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                                {/* ROW 2: Your Original Labels */}
                                <tr className="bg-slate-900 text-white">
                                    <th className="p-3 w-48 text-[9px] font-black uppercase tracking-widest border-r border-white/10">Elev</th>
                                    <th className="p-3 w-20 text-[9px] font-black uppercase tracking-widest text-center border-r border-white/10">Klar</th>
                                    {packet.map((_, i) => (
                                        <th key={i} className="p-0 border-r border-white/10">
                                            <button onClick={() => setZoomIndex(i)}
                                                className="w-full h-full p-3 text-[9px] font-black uppercase tracking-widest text-center hover:bg-white/10 transition-colors"
                                            >
                                                U {i + 1}
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
                                                <button 
                                                    onClick={() => handleKickStudent(student)}
                                                    className="opacity-0 group-hover/row:opacity-100 p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                                    title="Kick"
                                                >
                                                    <UserX size={14} />
                                                </button>
                                            </td>
                                            <td className="p-2 border-r border-slate-100 text-center">
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${progress === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                                    {progress}%
                                                </span>
                                            </td>
                                            {packet.map((_, qIdx) => {
                                                const resp = responses.find(r => r.student_alias === student && r.question_index === qIdx);
                                                return (
                                                    <td key={qIdx} className="p-1.5 border-r border-slate-50">
                                                        <div 
                                                            title={resp ? `Svar: ${resp.answer}` : 'Inget svar'}
                                                            className={`w-full h-8 rounded-md transition-all duration-500 cursor-help ${getStatusColor(resp?.is_correct, !!resp)}`} 
                                                        />
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
            {/* --- ZOOM-IN QUESTION OVERLAY --- */}
            {zoomIndex !== null && (
                <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-7xl h-full max-h-[90vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        
                        {/* 1. Header Row */}
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-6">
                                <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl font-black italic tracking-tighter uppercase">Uppgift {zoomIndex + 1}</div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                    {responses.filter(r => r.question_index === zoomIndex).length} av {students.length} Svar Inkomna
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setZoomIndex(prev => Math.max(0, prev - 1))}
                                    disabled={zoomIndex === 0}
                                    className="p-3 hover:bg-slate-200 rounded-full disabled:opacity-20 transition-all"
                                ><ChevronLeft size={32}/></button>
                                <button 
                                    onClick={() => setZoomIndex(prev => Math.min(packet.length - 1, prev + 1))}
                                    disabled={zoomIndex === packet.length - 1}
                                    className="p-3 hover:bg-slate-200 rounded-full disabled:opacity-20 transition-all"
                                ><ChevronRight size={32}/></button>
                                <div className="w-px h-8 bg-slate-200 mx-2" />
                                <button onClick={() => setZoomIndex(null)} className="p-4 hover:bg-rose-50 text-rose-500 rounded-full transition-all"><X size={32}/></button>
                            </div>
                        </div>

                        {/* 2. Question Text Zone (Full Width) */}
                        <div className="px-12 py-8 bg-indigo-50/30 border-b border-indigo-50 flex flex-col items-center">
                            <div className="text-2xl font-bold text-slate-800 leading-relaxed text-center max-w-3xl">
                                {/* Render the main description */}
                                <MathDisplay content={packet[zoomIndex].resolvedData?.renderData?.description} />
                                
                                {/* ADDED: Render the separate large LaTeX block if it exists */}
                                {packet[zoomIndex].resolvedData?.renderData?.latex && (
                                    <div className="mt-6 text-4xl text-indigo-600 font-serif border-t border-indigo-100/50 pt-6">
                                        <MathDisplay content={`$$${packet[zoomIndex].resolvedData.renderData.latex}$$`} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Main Content Split (3/4 Visual | 1/4 Cards) */}
                        <div className="flex-1 flex overflow-hidden">
                            
                            {/* LEFT COLUMN: The Visual (3/4) */}
                            <div className="w-3/4 p-12 flex items-center justify-center bg-white overflow-hidden border-r border-slate-50">
                                <div className="w-full h-full flex items-center justify-center transform scale-110 drop-shadow-2xl">
                                    {renderVisual(packet[zoomIndex])}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Power Cards (1/4) */}
                            <div className="w-1/4 bg-slate-50/50 p-6 flex flex-col gap-4 overflow-y-auto">
                                
                                {/* GREEN CARD: Correct Answers */}
                                <div className="bg-emerald-500 rounded-[2.5rem] p-6 text-white shadow-lg shadow-emerald-500/20">
                                    <div className="flex items-center gap-2 mb-4 opacity-80">
                                        <CheckCircle2 size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Rätta Svar</span>
                                    </div>
                                    <div className="text-4xl font-black mb-4">
                                        {responses.filter(r => r.question_index === zoomIndex && r.is_correct).length}
                                    </div>
                                    <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                                        {responses.filter(r => r.question_index === zoomIndex && r.is_correct).map((r, idx) => (
                                            <div key={idx} className="text-[11px] font-bold py-1 border-b border-white/10">
                                                {isAnonymous ? `Elev ${idx + 1}` : r.student_alias}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* RED CARD: Common Wrong Answers */}
                                <div className="bg-rose-500 rounded-[2.5rem] p-6 text-white shadow-lg shadow-rose-500/20">
                                    <div className="flex items-center gap-2 mb-4 opacity-80">
                                        <XCircle size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Vanliga Fel</span>
                                    </div>
                                    <div className="space-y-3">
                                        {(() => {
                                            const wrongAnswers = responses.filter(r => r.question_index === zoomIndex && !r.is_correct).map(r => r.answer);
                                            const freq = wrongAnswers.reduce((acc, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {});
                                            const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 3);
                                            
                                            return sorted.length > 0 ? sorted.map(([ans, count]) => (
                                                <div key={ans} className="flex justify-between items-center bg-white/10 p-2 px-4 rounded-xl">
                                                    <span className="font-black italic">"{ans}"</span>
                                                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">{count} st</span>
                                                </div>
                                            )) : <span className="text-xs opacity-60">Inga felaktiga svar än.</span>;
                                        })()}
                                    </div>
                                </div>

                                {/* SLATE CARD: Remaining */}
                                <div className="bg-slate-800 rounded-[2.5rem] p-6 text-white shadow-lg shadow-slate-800/20">
                                    <div className="flex items-center gap-2 mb-4 opacity-80">
                                        <Users size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Ej besvarade</span>
                                    </div>
                                    <div className="text-2xl font-black opacity-80">
                                        {students.length - responses.filter(r => r.question_index === zoomIndex).length} kvar
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