import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Target, Activity, HelpCircle, Clock, FileText, LayoutGrid, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AnalyticsTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterTopic, setFilterTopic] = useState('');

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: res, error: rpcError } = await supabase.rpc('get_telemetry_analytics');
            if (rpcError) throw rpcError;
            setData(res);
        } catch (err) {
            console.error('Telemetry fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-[var(--brand-solid)]">
                <Loader2 size={40} className="animate-spin mb-3" />
                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Aggregating telemetry payloads...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-rose-500 bg-rose-50/10 rounded-xl border border-rose-200 p-6 text-center">
                <AlertTriangle size={40} className="mb-3 opacity-70" />
                <p className="text-sm font-black uppercase tracking-widest">Failed to load analytics</p>
                <p className="text-xs mt-2 opacity-80 max-w-md">{error}</p>
                <button 
                    onClick={fetchAnalytics}
                    className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const { overview, friction_matrix = [], features } = data || {};
    const filteredMatrix = filterTopic 
        ? friction_matrix.filter(row => row.topic_id.toLowerCase().includes(filterTopic.toLowerCase()))
        : friction_matrix;

    const formatMinutes = (sec) => `${Math.floor((sec || 0) / 60)}m`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-[var(--border-main)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-[var(--text-main)] mb-1">Platform Telemetry & Friction Matrix</h3>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Anonymous aggregated usage patterns, difficulty hotspots, and tool adoption.</p>
                </div>
                <button 
                    onClick={fetchAnalytics}
                    className="px-3 py-1.5 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-main)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-[var(--brand-solid)] transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                    <RefreshCw size={12} /> Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Global Accuracy</span>
                    <span className="text-xl font-black text-[var(--text-main)] flex items-center gap-1.5">
                        <Target size={16} className="text-emerald-500" /> {overview?.overall_accuracy ?? 0}%
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Attempts</span>
                    <span className="text-xl font-black text-[var(--text-main)] flex items-center gap-1.5">
                        <Activity size={16} className="text-indigo-500" /> {overview?.total_attempts?.toLocaleString() ?? 0}
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Clues Used</span>
                    <span className="text-xl font-black text-[var(--text-main)] flex items-center gap-1.5">
                        <HelpCircle size={16} className="text-amber-500" /> {overview?.total_clues?.toLocaleString() ?? 0}
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Active Practice</span>
                    <span className="text-xl font-black text-[var(--text-main)] flex items-center gap-1.5">
                        <Clock size={16} className="text-sky-500" /> {formatMinutes(overview?.total_time_seconds)}
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Worksheets</span>
                    <span className="text-xl font-black text-[var(--text-main)] flex items-center gap-1.5">
                        <FileText size={16} className="text-teal-500" /> {features?.total_worksheets ?? 0}
                    </span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-main)]">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Do Now Grids</span>
                    <span className="text-xl font-black text-[var(--text-main)] flex items-center gap-1.5">
                        <LayoutGrid size={16} className="text-violet-500" /> {features?.total_donows ?? 0}
                    </span>
                </div>
            </div>

            {/* Friction Matrix Table */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl overflow-hidden">
                <div className="p-3.5 bg-[var(--bg-surface)] border-b border-[var(--border-main)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h4 className="font-black text-xs uppercase tracking-widest text-[var(--text-main)]">
                        Friction Matrix (Ranked by Difficulty)
                    </h4>
                    <input 
                        type="text" 
                        placeholder="Filter topic..." 
                        value={filterTopic} 
                        onChange={(e) => setFilterTopic(e.target.value)} 
                        className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg px-2.5 py-1 text-xs font-bold text-[var(--text-main)] outline-none w-full sm:w-48"
                    />
                </div>

                <div className="overflow-x-auto max-h-[480px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--border-main)] z-10">
                            <tr>
                                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Topic</th>
                                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">Level</th>
                                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">Attempts</th>
                                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">Accuracy</th>
                                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">Clues / Q</th>
                                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">Avg Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
                            {filteredMatrix.length > 0 ? (
                                filteredMatrix.map((row, idx) => {
                                    const isHighFriction = row.accuracy_rate < 50;
                                    const avgTimePerQ = row.total_attempts > 0 ? Math.round(row.total_time_spent / row.total_attempts) : 0;
                                    return (
                                        <tr key={idx} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                                            <td className="p-3 font-bold text-[var(--text-main)]">
                                                <div className="flex items-center gap-2">
                                                    {isHighFriction && (
                                                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Low accuracy hotspot" />
                                                    )}
                                                    <span className="font-mono text-[11px]">{row.topic_id}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 font-bold text-center">
                                                <span className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px]">
                                                    L{row.level_num}
                                                </span>
                                            </td>
                                            <td className="p-3 font-bold text-right text-[var(--text-main)]">
                                                {row.total_attempts}
                                            </td>
                                            <td className="p-3 text-right">
                                                <span className={`font-black text-[11px] px-2 py-0.5 rounded ${
                                                    row.accuracy_rate >= 75 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : row.accuracy_rate >= 50 
                                                        ? 'bg-amber-100 text-amber-800' 
                                                        : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {row.accuracy_rate}%
                                                </span>
                                            </td>
                                            <td className="p-3 font-medium text-right text-[var(--text-muted)] font-mono">
                                                {row.clues_per_attempt}
                                            </td>
                                            <td className="p-3 font-medium text-right text-[var(--text-muted)] font-mono">
                                                {avgTimePerQ}s
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs">
                                        No practice sessions recorded yet. Complete a few practice questions to populate data.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}