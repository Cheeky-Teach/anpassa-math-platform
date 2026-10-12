import React, { useState, useEffect } from 'react';
import { Target, Activity, Users, Loader2, RefreshCw, AlertTriangle, Filter } from 'lucide-react';
import { useProgressData } from '../../../core/utils/devTools/useProgressData';
import ContentHealthPanel from './analytics/ContentHealthPanel';
import TeacherWorkflowPanel from './analytics/TeacherWorkflowPanel';
import ClassroomDynamicsPanel from './analytics/ClassroomDynamicsPanel';

export default function AnalyticsTab() {
    // 1. PERSIST SUB-TAB
    const [subTab, setSubTab] = useState(() => {
        return sessionStorage.getItem('analytics_subTab') || 'health';
    });

    // 2. PERSIST FILTERS
    const [filters, setFilters] = useState(() => {
        const savedFilters = sessionStorage.getItem('analytics_filters');
        return savedFilters ? JSON.parse(savedFilters) : {
            dateRange: 'all',
            device: 'all',
            appMode: 'all',
            topicSearch: ''
        };
    });

    // 3. SYNC TO SESSION STORAGE ON CHANGE
    useEffect(() => {
        sessionStorage.setItem('analytics_subTab', subTab);
    }, [subTab]);

    useEffect(() => {
        sessionStorage.setItem('analytics_filters', JSON.stringify(filters));
    }, [filters]);

    const { aggregated, loading, error, refetch } = useProgressData(filters);
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-[var(--brand-solid)]">
                <Loader2 size={40} className="animate-spin mb-3" />
                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Aggregating platform metrics...
                </p>
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
                    onClick={refetch}
                    className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Toolbar */}
            <div className="border-b border-[var(--border-main)] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-[var(--text-main)] mb-1">
                        Developer KPI & Platform Analytics
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                        Analyzing {aggregated.totalEventCount.toLocaleString()} real-time progress logs across learning modules.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={refetch}
                        className="px-3 py-1.5 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-main)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-[var(--brand-solid)] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                        <RefreshCw size={12} /> Refresh
                    </button>
                </div>
            </div>

            {/* Global Filters Bar */}
            <div className="bg-[var(--bg-surface)]/70 p-3 rounded-xl border border-[var(--border-main)] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter size={14} className="text-[var(--text-muted)]" />
                    
                    {/* Date Range Filter */}
                    <select 
                        value={filters.dateRange} 
                        onChange={e => setFilters(p => ({ ...p, dateRange: e.target.value }))}
                        className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg px-2.5 py-1 text-[11px] font-bold text-[var(--text-main)] outline-none"
                    >
                        <option value="all">All Time</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>

                    {/* App Mode Filter */}
                    <select 
                        value={filters.appMode} 
                        onChange={e => setFilters(p => ({ ...p, appMode: e.target.value }))}
                        className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg px-2.5 py-1 text-[11px] font-bold text-[var(--text-main)] outline-none"
                    >
                        <option value="all">All Modes</option>
                        <option value="question_studio">Question Studio</option>
                        <option value="presentation_builder">Presentation Builder</option>
                        <option value="test_lab">Test Lab</option>
                        <option value="teacher_live">Teacher Live</option>
                        <option value="student_live">Student Live</option>
                    </select>

                    {/* Device Filter */}
                    <select 
                        value={filters.device} 
                        onChange={e => setFilters(p => ({ ...p, device: e.target.value }))}
                        className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg px-2.5 py-1 text-[11px] font-bold text-[var(--text-main)] outline-none"
                    >
                        <option value="all">All Devices</option>
                        <option value="desktop">Desktop</option>
                        <option value="mobile">Mobile</option>
                    </select>
                </div>

                {/* Topic search */}
                <input 
                    type="text" 
                    placeholder="Filter by topic ID..." 
                    value={filters.topicSearch}
                    onChange={e => setFilters(p => ({ ...p, topicSearch: e.target.value }))}
                    className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg px-2.5 py-1 text-[11px] font-bold text-[var(--text-main)] outline-none w-48"
                />
            </div>

            {/* Dashboard Sub-Tabs */}
            <div className="flex gap-2 border-b border-[var(--border-main)] pb-2 overflow-x-auto">
                <button 
                    onClick={() => setSubTab('health')}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${subTab === 'health' ? 'bg-[var(--text-main)] text-[var(--bg-canvas)] shadow' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                    <Target size={14} /> Content Health & Grader
                </button>
                <button 
                    onClick={() => setSubTab('workflow')}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${subTab === 'workflow' ? 'bg-[var(--text-main)] text-[var(--bg-canvas)] shadow' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                    <Activity size={14} /> Teacher Workflows
                </button>
                <button 
                    onClick={() => setSubTab('dynamics')}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${subTab === 'dynamics' ? 'bg-[var(--text-main)] text-[var(--bg-canvas)] shadow' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                    <Users size={14} /> Classroom Dynamics
                </button>
            </div>

            {/* Panel Rendering */}
            {subTab === 'health' && <ContentHealthPanel data={aggregated.contentHealth} />}
            {subTab === 'workflow' && <TeacherWorkflowPanel data={aggregated.teacherWorkflow} />}
            {subTab === 'dynamics' && <ClassroomDynamicsPanel data={aggregated.classroomDynamics} />}
        </div>
    );
}