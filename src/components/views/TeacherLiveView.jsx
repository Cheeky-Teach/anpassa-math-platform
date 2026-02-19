import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, Eye, EyeOff, Shield, BarChart3, Loader2, Signal, SignalLow, RefreshCw } from 'lucide-react';
import { UI_TEXT } from '../../constants/localization';

export default function TeacherLiveView({ session, packet, lang, onEnd }) {
    const [responses, setResponses] = useState([]);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [hideCorrectness, setHideCorrectness] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [connStatus, setConnStatus] = useState('CONNECTING');
    const [isSyncing, setIsSyncing] = useState(false);
    const ui = UI_TEXT[lang];

    const isMounted = useRef(true);
    const channelRef = useRef(null);

    // Initial Fetch & Sync
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

    const handleEndSession = async () => {
        if (!window.confirm("Avsluta sessionen?")) return;
        setIsClosing(true);
        try { await onEnd(); } 
        finally { if (isMounted.current) setIsClosing(false); }
    };

    const students = [...new Set(responses.map(r => r.student_alias))];
    
    const getStatusColor = (isCorrect, answered) => {
        if (!answered) return 'bg-slate-100';
        if (hideCorrectness) return 'bg-indigo-400';
        return isCorrect ? 'bg-emerald-500' : 'bg-rose-500';
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className={`fixed bottom-6 right-6 px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-2xl z-50 border transition-all ${
                connStatus === 'SUBSCRIBED' ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-rose-600 text-white animate-pulse'
            }`}>
                {connStatus === 'SUBSCRIBED' ? <Signal size={14}/> : <SignalLow size={14}/>}
                {connStatus === 'SUBSCRIBED' ? 'ANSLUTEN' : connStatus}
            </div>

            <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-xl leading-none">
                        <span className="text-[10px] font-black uppercase block opacity-50 mb-1">Gå med på</span>
                        <span className="text-3xl font-black italic tracking-tighter uppercase">ANPASSA.APP</span>
                    </div>
                    <div className="text-7xl font-black text-indigo-600 tracking-widest bg-white px-8 py-2 rounded-3xl border-4 border-indigo-600 shadow-2xl">
                        {session.class_code}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={syncData} disabled={isSyncing} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
                        <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setIsAnonymous(!isAnonymous)} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isAnonymous ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        {isAnonymous ? <Shield size={16} /> : <Users size={16} />} {isAnonymous ? "Dolda" : "Visa Namn"}
                    </button>
                    <button onClick={() => setHideCorrectness(!hideCorrectness)} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${hideCorrectness ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        {hideCorrectness ? <EyeOff size={16} /> : <Eye size={16} />} {hideCorrectness ? "Dölj" : "Visa"}
                    </button>
                    <button onClick={handleEndSession} disabled={isClosing} className="bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-rose-600 hover:text-white transition-all">
                        {isClosing ? <Loader2 className="animate-spin" size={16} /> : "Avsluta"}
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="text-indigo-600" />
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">{session.title}</h2>
                    </div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{students.length} Elever</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-6 w-64">Elev</th>
                                {packet.map((_, i) => <th key={i} className="p-6 text-center border-l border-slate-100">U {i+1}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, sIdx) => (
                                <tr key={student} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 font-bold text-slate-700">{isAnonymous ? `Elev ${sIdx + 1}` : student}</td>
                                    {packet.map((_, qIdx) => {
                                        const resp = responses.find(r => r.student_alias === student && r.question_index === qIdx);
                                        return (
                                            <td key={qIdx} className="p-2 border-l border-slate-50">
                                                <div className={`w-10 h-10 mx-auto rounded-xl shadow-inner transition-all duration-500 ${getStatusColor(resp?.is_correct, !!resp)}`} />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}