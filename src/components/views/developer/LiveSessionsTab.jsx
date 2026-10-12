import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { MonitorPlay, Clock, Users, XCircle, Loader2, AlertCircle, Trash2 } from 'lucide-react';

export default function LiveSessionsTab() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchActiveSessions = async () => {
        setLoading(true);
        try {
            // Fetch all active rooms, joining the teacher's profile and grabbing response data for a headcount
            const { data, error } = await supabase
                .from('rooms')
                .select(`
                    *,
                    profiles:teacher_id (full_name, school_name),
                    responses (student_alias)
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Process the raw data
            const processed = (data || []).map(room => {
                // Calculate unique students
                const uniqueStudents = new Set((room.responses || []).map(r => r.student_alias)).size;
                
                // Calculate age of session
                const createdTime = new Date(room.created_at).getTime();
                const now = new Date().getTime();
                const hoursOld = (now - createdTime) / (1000 * 60 * 60);
                
                return {
                    ...room,
                    studentCount: uniqueStudents,
                    hoursOld: hoursOld,
                    isStale: hoursOld > 4 // Flag as stale if older than 4 hours
                };
            });

            setSessions(processed);
        } catch (err) {
            console.error("Error fetching live sessions:", err);
            alert("Failed to fetch live sessions. Check console.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveSessions();
    }, []);

    const handleForceClose = async (roomId) => {
        if (!window.confirm("Are you sure you want to force close this session? It will kick all connected students.")) return;
        
        setActionLoading(roomId);
        try {
            const { error } = await supabase
                .from('rooms')
                .update({ status: 'closed', updated_at: new Date().toISOString() })
                .eq('id', roomId);

            if (error) throw error;
            
            // Remove it from the local UI state
            setSessions(prev => prev.filter(s => s.id !== roomId));
        } catch (err) {
            console.error("Error closing room:", err);
            alert("Failed to force close session.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-[var(--brand-solid)]">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Scanning Database...</p>
            </div>
        );
    }

    const staleCount = sessions.filter(s => s.isStale).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-[var(--border-main)] pb-4 flex justify-between items-end">
                <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-[var(--text-main)] mb-1">Live Session Monitor</h3>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Real-time oversight of all active classrooms and zombie session cleanup.</p>
                </div>
                <button 
                    onClick={fetchActiveSessions}
                    className="px-4 py-2 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-[var(--brand-solid)] transition-all active:scale-95 flex items-center gap-2"
                >
                    <MonitorPlay size={14} /> Refresh
                </button>
            </div>

            {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-[var(--border-main)] rounded-xl">
                    <MonitorPlay size={48} className="text-[var(--text-muted)] opacity-30 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">No Active Sessions Right Now</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Status Banner */}
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-[var(--brand-bg)] text-[var(--brand-text)] border border-[var(--brand-border)]">
                            {sessions.length} Active {sessions.length === 1 ? 'Room' : 'Rooms'}
                        </div>
                        {staleCount > 0 && (
                            <div className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 bg-amber-100 text-amber-700">
                                <AlertCircle size={12}/> {staleCount} Stale (4hr+)
                            </div>
                        )}
                    </div>

                    {/* Sessions Grid */}
                    <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 pb-10">
                        {sessions.map((session) => (
                            <div key={session.id} className={`p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${session.isStale ? 'border-amber-300 bg-amber-50/30' : 'border-[var(--border-main)] bg-[var(--bg-surface)]'}`}>
                                
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`w-12 h-12 rounded-[var(--radius-btn)] flex items-center justify-center shadow-inner shrink-0 text-white ${session.isStale ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                        <MonitorPlay size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-[var(--text-main)] text-sm truncate">{session.title || "Live Lektion"}</h4>
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                                                Code: {session.class_code}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-[var(--text-muted)] truncate">
                                            Teacher: {session.profiles?.full_name || 'Unknown'} 
                                            {session.profiles?.school_name && ` (${session.profiles.school_name})`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 sm:border-l border-[var(--border-subtle)] sm:pl-6 shrink-0">
                                    <div className="text-center hidden sm:block">
                                        <span className="block text-[8px] font-black uppercase text-[var(--text-muted)] mb-1 tracking-widest">Connected</span>
                                        <span className="text-sm font-black flex items-center justify-center gap-1 text-[var(--text-main)]"><Users size={14}/> {session.studentCount}</span>
                                    </div>
                                    <div className="text-center hidden sm:block">
                                        <span className="block text-[8px] font-black uppercase text-[var(--text-muted)] mb-1 tracking-widest">Uptime</span>
                                        <span className={`text-sm font-black flex items-center justify-center gap-1 ${session.isStale ? 'text-amber-600' : 'text-[var(--text-main)]'}`}>
                                            <Clock size={14}/> {Math.floor(session.hoursOld)}h {Math.floor((session.hoursOld % 1) * 60)}m
                                        </span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleForceClose(session.id)}
                                        disabled={actionLoading === session.id}
                                        className="w-full sm:w-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                    >
                                        {actionLoading === session.id ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                                        Force Close
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}