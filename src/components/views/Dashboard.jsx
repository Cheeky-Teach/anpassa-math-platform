import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  ChevronDown, ChevronUp, ChevronRight, Zap, Play, Clock, Book, Map, Info, 
  Award, BarChart3, PenTool, Calendar, Sparkles, Users, Settings, User, 
  History, Target, LayoutGrid, RotateCcw, FileSpreadsheet, MoreHorizontal,
  PlayCircle, CheckCircle2, AlertCircle, Grid3X3, Monitor, Beaker, Newspaper, X, 
  ArrowUpRight
} from 'lucide-react';

import { CATEGORIES, LEVEL_DESCRIPTIONS } from '@/constants/localization';
import { APP_UPDATES } from '@/constants/updates';

const COLOR_VARIANTS = {
    pink: { bgLight: 'bg-pink-50', bgDark: 'bg-pink-500', border: 'border-pink-100', text: 'text-pink-700', ring: 'ring-pink-500', borderSolid: 'border-pink-500', icon: 'text-pink-500' },
    indigo: { bgLight: 'bg-indigo-50', bgDark: 'bg-indigo-500', border: 'border-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-500', borderSolid: 'border-indigo-500', icon: 'text-indigo-500' },
    emerald: { bgLight: 'bg-emerald-50', bgDark: 'bg-emerald-600', border: 'border-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-500', borderSolid: 'border-emerald-600', icon: 'text-emerald-600' },
    purple: { bgLight: 'bg-purple-50', bgDark: 'bg-purple-500', border: 'border-purple-100', text: 'text-purple-700', ring: 'ring-purple-500', borderSolid: 'border-purple-500', icon: 'text-purple-500' },
    yellow: { bgLight: 'bg-amber-50', bgDark: 'bg-amber-500', border: 'border-amber-100', text: 'text-amber-700', ring: 'ring-amber-500', borderSolid: 'border-amber-500', icon: 'text-amber-500' }
};

const Dashboard = ({ 
    profile, lang = 'sv', selectedTopic, selectedLevel, onSelect, onStart, 
    timerSettings, toggleTimer, resetTimer, ui, onLgrOpen, onContentOpen,
    onAboutOpen, onStatsOpen, onStudioOpen, onProfileOpen, onLabOpen,
    onTimesTableOpen, onWhiteboardOpen,
    onRelaunch, onViewReport, onEdit, 
    userRole = 'teacher'
}) => {
    // 🟢 expandedCategory now functions as our active tab state for the curriculum
    const [expandedCategory, setExpandedCategory] = useState('arithmetic');
    const [activeTab, setActiveTab] = useState('curriculum'); 
    const [archivedSessions, setArchivedSessions] = useState([]);
    const [isLoadingArchive, setIsLoadingArchive] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [showUpdateLog, setShowUpdateLog] = useState(false);

    const TEXT = {
        sv: {
            tools_section: "Verktyg", class_code_label: "Din klasskod", connected_code_label: "Ansluten till kod",
            timer_title: "Timer", timer_off: "Timer av", timer_reset: "Nollställ",
            studio_title: "Question Studio", studio_desc: "Skapa material",
            stats_title: "Statistik", stats_desc: "Dina framsteg",
            curriculum_title: "Kursmaterial", archive_title: "Lektionsarkiv",
            topics_count: (count) => `${count} delmoment`, select_level: "Välj nivå",
            start_btn: "Börja öva", resources: "Resurser", content_map: "Innehållskarta",
            lgr_link: "LGR 22 Koppling", about_link: "Om skaparen", brand_motto: "Rätt stöd. Direkt.",
            profile_btn: "Inställningar", profile_desc: "Konto & Skola",
            archive_empty: "Inga avslutade lektioner de senaste 7 dagar.", relaunch_btn: "Kör igen",
            view_report: "Visa rapport", resume_h: "Lektion pågår", resume_btn: "Återuppta",
            accuracy_label: "Träffsäkerhet", edit_btn: "Öppna i Studio",
            type_donow: "Do Now Grid", type_worksheet: "Arbetsblad",
            times_table_title: "Tabeller", times_table_desc: "Multiplikation",
            news_title: "Senaste uppdatering", view_all: "Visa logg"
        },
        en: {
            tools_section: "Tools", class_code_label: "Your Class Code", connected_code_label: "Connected to code",
            timer_title: "Timer", timer_off: "Timer Off", timer_reset: "Reset",
            studio_title: "Question Studio", studio_desc: "Create material",
            stats_title: "Statistics", stats_desc: "Your progress",
            curriculum_title: "Course Material", archive_title: "Session Archive",
            topics_count: (count) => `${count} topics`, select_level: "Select Level",
            start_btn: "Start practicing", resources: "Resources", content_map: "Content Map",
            lgr_link: "Curriculum Links", about_link: "About Creator", brand_motto: "Right support. Instantly.",
            profile_btn: "Settings", profile_desc: "Account & School",
            archive_empty: "No finished sessions in the last 7 days.", relaunch_btn: "Relaunch",
            view_report: "View Report", resume_h: "Session in Progress", resume_btn: "Resume",
            accuracy_label: "Accuracy", edit_btn: "Open in Studio",
            type_donow: "Do Now Grid", type_worksheet: "Worksheet",
            times_table_title: "Tables", times_table_desc: "Multiplication",
            news_title: "Latest Update", view_all: "View log"
        }
    };

    const t = TEXT[lang] || TEXT.sv;
    const latestUpdate = APP_UPDATES[0];

    useEffect(() => {
        fetchActiveSession();
        if (activeTab === 'archive' && userRole === 'teacher') {
            fetchArchive();
        }
    }, [activeTab]);

    const fetchActiveSession = async () => {
        if (userRole !== 'teacher' || !profile?.id) return;
        try {
            const { data } = await supabase
                .from('rooms')
                .select('*')
                .eq('teacher_id', profile.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1);
            if (data && data.length > 0) setActiveSession(data[0]);
            else setActiveSession(null);
        } catch (err) { console.error("Session Check Failed:", err); }
    };

    const formatSubscriptionDate = (dateString, lang = 'sv') => {
        if (!dateString) return null;
        const endDate = new Date(dateString);
        const now = new Date();
        const isExpired = endDate < now;
        const formattedDate = endDate.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        return {
            text: isExpired 
                ? (lang === 'sv' ? `Inaktiv den ${formattedDate}` : `Expired on ${formattedDate}`)
                : (lang === 'sv' ? `Aktiv till ${formattedDate}` : `Active until ${formattedDate}`),
            isExpired
        };
    };
    
    const fetchArchive = async () => {
        setIsLoadingArchive(true);
        try {
            const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
            const { data, error } = await supabase
                .from('rooms')
                .select('*, responses(is_correct, student_alias)')
                .eq('teacher_id', profile.id)
                .eq('status', 'closed')
                .gt('created_at', cutoff) 
                .order('created_at', { ascending: false });
            
            if (error) throw error;

            const processed = (data || []).map(room => {
                const total = room.responses?.length || 0;
                const correct = room.responses?.filter(r => r.is_correct).length || 0;
                const uniqueStudents = new Set(room.responses?.map(r => r.student_alias)).size;
                const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
                return { ...room, accuracy, studentCount: uniqueStudents };
            });

            setArchivedSessions(processed);
        } catch (err) { console.error("Archive Fetch Error:", err); }
        finally { setIsLoadingArchive(false); }
    };

    const activeCategoryData = CATEGORIES[expandedCategory];
    const categoryStyles = COLOR_VARIANTS[activeCategoryData?.color || 'emerald'] || COLOR_VARIANTS.emerald;

    return (
        <div className="relative w-full overflow-hidden bg-[#f9fbf7] min-h-screen">
            {/* 🟢 FIXED: Adjusted to xl:flex-row for laptop protection */}
            <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 py-8 animate-in fade-in duration-700 flex flex-col xl:flex-row gap-8 relative z-10 font-sans">
                
                {/* ========================================================= */}
                {/* LEFT COLUMN: COMMAND CENTER (PROFILE & TOOLS)        */}
                {/* ========================================================= */}
                <aside className="w-full xl:w-[320px] flex-shrink-0 flex flex-col gap-6">
                    
                    {/* --- HEADER STATUS CARD (COMPRESSED) --- */}
                    <div className="bg-white border border-emerald-100 p-6 rounded-[2rem] shadow-xl shadow-emerald-900/5 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
                                {userRole === 'teacher' ? <Users size={24} /> : <User size={24} />}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg font-bold text-slate-800 leading-none mb-1 truncate">
                                    {userRole === 'teacher' ? (profile?.full_name || "Lärare") : (profile?.full_name || "Elev")}
                                </h1>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60 flex items-center gap-1.5 truncate">
                                    <Target size={10}/> {profile?.school_name || "Anpassa Math Platform"}
                                </p>
                            </div>
                        </div>

                        {/* Subscription Date */}
                        {(() => {
                            const sub = formatSubscriptionDate(profile?.subscription_end_date || profile?.subscription_ends_at, lang);
                            if (!sub) return null;
                            return (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-slate-50 p-2 rounded-xl border border-slate-100">
                                    <span className={`w-2 h-2 rounded-full ${sub.isExpired ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                    <span className={sub.isExpired ? 'text-rose-600 font-black' : 'text-slate-500'}>
                                        {sub.text}
                                    </span>
                                </div>
                            );
                        })()}

                        {/* Class Code */}
                        <div className="flex flex-col items-center bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100">
                            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-800/40 mb-0.5">
                                {userRole === 'teacher' ? t.class_code_label : t.connected_code_label}
                            </span>
                            <span className="text-xl font-black tracking-[0.2em] text-emerald-700 uppercase">
                                {profile?.class_code || "---"}
                            </span>
                        </div>

                        {/* 🟢 NEW: Prominent Settings Button */}
                        <button 
                            onClick={onProfileOpen} 
                            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            <Settings size={14} /> {t.profile_btn}
                        </button>
                    </div>

                    {/* --- NEWS / UPDATES MICRO-CARD --- */}
                    {userRole === 'teacher' && (
                        <button 
                            onClick={() => setShowUpdateLog(true)}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-emerald-100 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <Sparkles size={16} fill="currentColor" />
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black uppercase text-emerald-800/40 tracking-widest">{t.news_title}</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{latestUpdate.title[lang]}</h4>
                                </div>
                            </div>
                            <ArrowUpRight size={14} className="text-emerald-600" />
                        </button>
                    )}

                    {/* --- TOOLS SECTION (COMPRESSED LIST) --- */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 ml-2">
                            <Zap size={14} className="text-orange-400" />
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.tools_section}</h2>
                        </div>

                        {/* Question Studio */}
                        {userRole === 'teacher' && (
                            <button onClick={onStudioOpen} className="group flex items-center gap-4 p-3.5 bg-emerald-900 text-white rounded-2xl hover:bg-emerald-800 transition-all shadow-md text-left w-full">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Zap size={18} fill="currentColor" />
                                </div>
                                <div>
                                    <span className="block font-bold text-sm uppercase tracking-tight leading-tight">{t.studio_title}</span>
                                    <span className="text-[9px] font-medium text-emerald-300 uppercase tracking-widest">{t.studio_desc}</span>
                                </div>
                            </button>
                        )}

                        {/* Test Lab */}
                        <button onClick={onLabOpen} className="group flex items-center gap-4 p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all text-left w-full">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shrink-0 group-hover:text-indigo-600">
                                <Beaker size={18} />
                            </div>
                            <div>
                                <span className="block font-bold text-sm uppercase text-indigo-900 group-hover:text-white leading-tight">Test Lab</span>
                                <span className="text-[9px] font-medium text-indigo-400 group-hover:text-indigo-200 uppercase tracking-widest">
                                    {lang === 'sv' ? 'Övningsprov' : 'Practice tests'}
                                </span>
                            </div>
                        </button>

                        {/* Presentation Canvas */}
                        {userRole === 'teacher' && (
                            <button onClick={onWhiteboardOpen} className="group flex items-center gap-4 p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-purple-600 hover:bg-purple-50 transition-all text-left w-full">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0 group-hover:bg-white">
                                    <Monitor size={18} />
                                </div>
                                <div>
                                    <span className="block font-bold text-sm uppercase text-slate-700 group-hover:text-purple-900 leading-tight">
                                        {lang === 'sv' ? 'Presentation' : 'Board'}
                                    </span>
                                    <span className="text-[9px] font-medium text-slate-400 group-hover:text-purple-500 uppercase tracking-widest">
                                        {lang === 'sv' ? 'Lektionsyta' : 'Blank canvas'}
                                    </span>
                                </div>
                            </button>
                        )}

                        {/* Timer Inline Tool */}
                        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl w-full">
                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                                <Clock size={18} />
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                                <select value={timerSettings.duration / 60} onChange={(e) => toggleTimer(Number(e.target.value))} className="flex-1 bg-white border border-emerald-200 text-emerald-700 py-1.5 px-2 rounded-lg text-xs font-bold outline-none cursor-pointer">
                                    <option value="0">{t.timer_off}</option>
                                    {[5, 10, 15, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                                </select>
                                {timerSettings.duration > 0 && (
                                    <button onClick={resetTimer} className="p-1.5 text-rose-500 bg-white rounded-lg shadow-sm border border-rose-100 hover:bg-rose-50 transition-colors">
                                        <RotateCcw size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Bottom Row Tools (Grid 2 cols) */}
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <button onClick={onTimesTableOpen} className="group flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-600 transition-all text-center">
                                <Grid3X3 size={20} className="text-emerald-500" />
                                <span className="font-bold text-[10px] uppercase text-slate-600">{t.times_table_title}</span>
                            </button>
                            <button onClick={onStatsOpen} className="group flex flex-col items-center justify-center gap-2 p-4 bg-amber-50 border border-amber-100 rounded-2xl hover:bg-amber-100 transition-all text-center">
                                <BarChart3 size={20} className="text-amber-500" />
                                <span className="font-bold text-[10px] uppercase text-amber-900">{t.stats_title}</span>
                            </button>
                        </div>
                    </div>

                    {/* Left Footer Links */}
                    <footer className="mt-auto pt-8 pb-4 flex flex-col gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <button onClick={onLgrOpen} className="flex items-center gap-2 hover:text-emerald-600 transition-colors"><Book size={14} /> {t.lgr_link}</button>
                        <button onClick={onAboutOpen} className="flex items-center gap-2 hover:text-emerald-600 transition-colors"><Info size={14} /> {t.about_link}</button>
                    </footer>
                </aside>


                {/* ========================================================= */}
                {/* ➡️ RIGHT COLUMN: MAIN CONTENT (CURRICULUM & ARCHIVE)    */}
                {/* ========================================================= */}
                <main className="flex-1 flex flex-col min-w-0">
                    
                    {/* --- ACTIVE SESSION RESUME BANNER --- */}
                    {activeSession && userRole === 'teacher' && (
                        <div className="mb-6 p-5 bg-emerald-900 rounded-[2rem] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                    <PlayCircle size={24} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold uppercase italic tracking-tighter leading-none mb-1">{t.resume_h}</h3>
                                    <p className="text-[10px] font-medium text-emerald-300 uppercase tracking-widest leading-none">
                                        {activeSession.title} — Kod: <span className="font-black text-white">{activeSession.class_code}</span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => onRelaunch(activeSession)} className="w-full sm:w-auto px-8 py-3 bg-white text-emerald-900 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-50 transition-all shadow-md active:scale-95">
                                {t.resume_btn}
                            </button>
                        </div>
                    )}

                    {/* --- CONTENT TABS & MAP NAV --- */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex gap-1 p-1 bg-emerald-950/5 rounded-2xl w-fit">
                            <button 
                                onClick={() => setActiveTab('curriculum')} 
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'curriculum' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-emerald-600'}`}
                            >
                                <Book size={14}/> {t.curriculum_title}
                            </button>
                            {userRole === 'teacher' && (
                                <button 
                                    onClick={() => setActiveTab('archive')} 
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'archive' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-emerald-600'}`}
                                >
                                    <History size={14}/> {t.archive_title}
                                </button>
                            )}
                        </div>

                        <button 
                            onClick={onContentOpen} 
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-100 text-emerald-600 hover:text-white hover:bg-emerald-600 hover:border-emerald-600 font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm group"
                        >
                            <Map size={14} className="group-hover:scale-110 transition-transform" /> 
                            {t.content_map}
                            <ChevronRight size={14} className="opacity-40" />
                        </button>
                    </div>

                    {/* --- TAB CONTENT --- */}
                    {activeTab === 'curriculum' ? (
                        <div className="flex flex-col animate-in slide-in-from-right-4 duration-500">
                            
                            {/* 🟢 NEW: HORIZONTAL CATEGORY TABS */}
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                                {Object.entries(CATEGORIES).map(([catKey, category]) => {
                                    const isActive = expandedCategory === catKey;
                                    const styles = COLOR_VARIANTS[category.color || 'emerald'] || COLOR_VARIANTS.emerald;
                                    
                                    return (
                                        <button 
                                            key={catKey}
                                            onClick={() => setExpandedCategory(catKey)}
                                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-widest whitespace-nowrap transition-all shadow-sm border ${
                                                isActive 
                                                    ? `${styles.bgDark} text-white border-transparent` 
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600'
                                            }`}
                                        >
                                            {isActive && <Award size={14} />}
                                            {category.label[lang]}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 🟢 NEW: ACTIVE CATEGORY TOPICS GRID */}
                            <div className={`bg-white rounded-[2.5rem] border ${categoryStyles.border} p-6 sm:p-8 shadow-xl shadow-emerald-900/5`}>
                                <div className="mb-6 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${categoryStyles.bgDark} text-white shadow-md`}>
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">
                                            {activeCategoryData.label[lang]}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                            {t.topics_count(activeCategoryData.topics.length)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {activeCategoryData.topics.map(topic => (
                                        <div key={topic.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-amber-200 hover:bg-white hover:shadow-lg transition-all group">
                                            <div className="font-bold text-slate-800 mb-4 flex items-center justify-between text-sm leading-tight">
                                                {topic.label[lang]}
                                                <div className={`w-2 h-2 rounded-full ${categoryStyles.bgDark} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                            </div>
                                            <div className="relative">
                                                <select 
                                                    value={selectedTopic === topic.id ? selectedLevel : 0} 
                                                    onChange={(e) => onSelect(topic.id, Number(e.target.value))} 
                                                    className={`w-full p-3 pl-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none transition-all cursor-pointer ${
                                                        selectedTopic === topic.id ? `ring-2 ${categoryStyles.ring} border-transparent shadow-md` : ''
                                                    }`}
                                                >
                                                    <option value={0} disabled>{t.select_level}</option>
                                                    {/* 🟢 Expanded the array to include up to 12 */}
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(lvl => LEVEL_DESCRIPTIONS[topic.id]?.[lvl] && (
                                                        <option key={lvl} value={lvl}>
                                                            {lang === 'sv' ? `Nivå ${lvl}` : `Level ${lvl}`} — {LEVEL_DESCRIPTIONS[topic.id]?.[lvl]?.[lang] || ""}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-300">
                                                    <ChevronDown size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-right-4 duration-500 space-y-4 pb-20">
                            {isLoadingArchive ? (
                                <div className="flex items-center justify-center p-20"><div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full" /></div>
                            ) : archivedSessions.length === 0 ? (
                                <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-emerald-100">
                                    <History size={48} className="mx-auto text-emerald-100 mb-4" />
                                    <p className="font-bold text-slate-400 uppercase tracking-widest">{t.archive_empty}</p>
                                </div>
                            ) : (
                                archivedSessions.map(session => {
                                    const isDoNow = session.active_question_data?.mode === 'donow';

                                    return (
                                        <div key={session.id} className="bg-white p-5 rounded-[2rem] border border-emerald-50 shadow-sm hover:shadow-xl transition-all flex flex-col lg:flex-row items-center justify-between gap-5 group">
                                            <div className="flex items-center gap-5 flex-1 min-w-0 w-full">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner shrink-0 group-hover:text-white transition-all ${
                                                    isDoNow 
                                                    ? 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-600' 
                                                    : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600'
                                                }`}>
                                                    {isDoNow ? <LayoutGrid size={24} /> : <FileSpreadsheet size={24} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-slate-800 text-base truncate leading-none mb-2">{session.title || (isDoNow ? "Do Now Grid" : "Live Lektion")}</h4>
                                                    <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md"><Calendar size={10}/> {new Date(session.created_at).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md"><Users size={10}/> {session.studentCount} Elever</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 px-4 lg:border-l border-slate-100 w-full lg:w-auto">
                                                <div className="text-center">
                                                    <span className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{t.accuracy_label}</span>
                                                    <div className={`text-xl font-black italic ${session.accuracy > 70 ? 'text-emerald-500' : session.accuracy > 40 ? 'text-amber-500' : 'text-rose-500'}`}>{session.accuracy}%</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                                                <button onClick={() => onViewReport(session)} className="flex-1 lg:flex-none px-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">{t.view_report}</button>
                                                <button onClick={() => onEdit(session)} className={`p-3 rounded-xl transition-all border ${
                                                    isDoNow ? 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-600 hover:text-white' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white'
                                                }`} title={t.edit_btn}>
                                                    <PenTool size={16} />
                                                </button>
                                                <button onClick={() => onRelaunch(session)} className="flex-1 lg:flex-none px-4 py-3 bg-emerald-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95">
                                                    <RotateCcw size={14}/> {t.relaunch_btn}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                </main>

                {/* --- START PRACTICE FLOATING ACTION BUTTON --- */}
                {/* Repositioned to sit within the right column's bounds on large screens */}
                {activeTab === 'curriculum' && (
                    <div className={`fixed bottom-8 right-8 flex justify-end pointer-events-none z-30 transition-all duration-500 ${selectedTopic ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                        <button onClick={onStart} className="px-10 py-5 rounded-[2rem] font-bold text-xl shadow-[0_20px_50px_rgba(249,115,22,0.3)] bg-orange-500 text-white pointer-events-auto flex items-center gap-4 hover:scale-105 hover:bg-orange-600 active:scale-95 transition-all tracking-tight border-b-[6px] border-orange-700">
                            {t.start_btn} <Play fill="currentColor" size={24} />
                        </button>
                    </div>
                )}

                {/* --- UPDATE LOG MODAL OVERLAY --- */}
                {showUpdateLog && (
                    <div className="fixed inset-0 z-[100] bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-900 text-white rounded-2xl shadow-lg"><Newspaper size={24}/></div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight italic">Ändringslogg</h2>
                                </div>
                                <button onClick={() => setShowUpdateLog(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"><X /></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                                {APP_UPDATES.map((update) => (
                                    <div key={update.id} className="relative pl-8 border-l-2 border-emerald-100 pb-2">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full" />
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{update.date}</span>
                                            <span className="text-[10px] font-black text-slate-400">VERSION {update.version}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">{update.title[lang]}</h3>
                                        <ul className="space-y-3">
                                            {update.changes[lang].map((change, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                                    {change}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BACKGROUND DECORATION */}
            <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none z-0 overflow-hidden">
                <svg className="relative block w-full h-[300px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,1.13V120H0Z" className="fill-emerald-100/40"></path>
                </svg>
            </div>
        </div>
    );
};

export default Dashboard;