import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  ChevronDown, ChevronUp, ChevronRight, Zap, Play, Clock, Book, Map, Info, 
  Award, BarChart3, PenTool, Calendar, Sparkles, Users, Settings, User, 
  History, Target, LayoutGrid, RotateCcw, FileSpreadsheet, MoreHorizontal,
  PlayCircle, CheckCircle2, AlertCircle // Icons for metrics
} from 'lucide-react';

import { CATEGORIES, LEVEL_DESCRIPTIONS } from '@/constants/localization';

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
    onAboutOpen, onStatsOpen, onStudioOpen, onProfileOpen, 
    onRelaunch, onViewReport, onEdit, 
    userRole = 'teacher'
}) => {
    const [expandedCategory, setExpandedCategory] = useState('algebra');
    const [activeTab, setActiveTab] = useState('curriculum'); // curriculum | archive
    const [archivedSessions, setArchivedSessions] = useState([]);
    const [isLoadingArchive, setIsLoadingArchive] = useState(false);
    const [activeSession, setActiveSession] = useState(null); // Recovery State

    // --- TRANSLATIONS ---
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
            archive_empty: "Inga avslutade lektioner de senaste 48 timmarna.", relaunch_btn: "Kör igen",
            view_report: "Visa rapport", resume_h: "Lektion pågår", resume_btn: "Återuppta",
            accuracy_label: "Träffsäkerhet", edit_btn: "Öppna i Studio"
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
            archive_empty: "No finished sessions in the last 48 hours.", relaunch_btn: "Relaunch",
            view_report: "View Report", resume_h: "Session in Progress", resume_btn: "Resume",
            accuracy_label: "Accuracy", edit_btn: "Open in Studio"
        }
    };

    const t = TEXT[lang] || TEXT.sv;

    // --- FETCH LOGIC ---
    useEffect(() => {
        fetchActiveSession();
        if (activeTab === 'archive' && userRole === 'teacher') {
            fetchArchive();
        }
    }, [activeTab]);

    const fetchActiveSession = async () => {
        if (userRole !== 'teacher' || !profile?.id) return;
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('teacher_id', profile.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1);
            
            if (data && data.length > 0) {
                setActiveSession(data[0]);
            } else {
                setActiveSession(null);
            }
        } catch (err) { console.error("Session Check Failed:", err); }
    };

    const fetchArchive = async () => {
        setIsLoadingArchive(true);
        try {
            const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
            const { data, error } = await supabase
                .from('rooms')
                .select(`
                    *,
                    responses(is_correct, student_alias)
                `)
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

    const getStyles = (category) => COLOR_VARIANTS[category.color || 'emerald'] || COLOR_VARIANTS.emerald;

    return (
        <div className="relative w-full overflow-hidden bg-[#f9fbf7]">
            <div className="max-w-5xl mx-auto w-full p-6 animate-in fade-in duration-700 flex flex-col min-h-screen relative z-10 font-sans">
                
                {/* --- ACTIVE SESSION RESUME BANNER --- */}
                {activeSession && userRole === 'teacher' && (
                    <div className="mb-8 p-6 bg-emerald-900 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-900/20 flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white/10 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md">
                                <PlayCircle size={32} className="text-emerald-400" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold uppercase italic tracking-tighter leading-none mb-1">{t.resume_h}</h3>
                                <p className="text-xs font-medium text-emerald-300 uppercase tracking-widest leading-none">
                                    {activeSession.title} — Kod: <span className="font-black text-white">{activeSession.class_code}</span>
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => onRelaunch(activeSession)} 
                            className="w-full sm:w-auto px-10 py-4 bg-white text-emerald-900 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-50 transition-all shadow-xl active:scale-95"
                        >
                            {t.resume_btn}
                        </button>
                    </div>
                )}

                {/* --- HEADER STATUS CARD --- */}
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border border-emerald-100 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-900/5">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            {userRole === 'teacher' ? <Users size={30} /> : <User size={30} />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 leading-none mb-1">
                                {userRole === 'teacher' ? (profile?.full_name || "Lärare") : "Elev"}
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60 flex items-center gap-2">
                                <Target size={12}/> {profile?.school_name || "Anpassa Math Platform"}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end bg-emerald-50 px-8 py-5 rounded-[2rem] border border-emerald-100 min-w-[220px]">
                        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-800/40 mb-1">
                            {userRole === 'teacher' ? t.class_code_label : t.connected_code_label}
                        </span>
                        <span className="text-3xl font-black tracking-[0.2em] text-emerald-700 uppercase">
                            {profile?.class_code || "---"}
                        </span>
                    </div>
                </header>

                {/* --- VERKTYG (TOOLS) GRID --- */}
                <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6 px-4">
                        <Zap size={18} className="text-orange-400" />
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.tools_section}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {userRole === 'teacher' && (
                            <button onClick={onStudioOpen} className="group p-6 bg-emerald-900 text-white rounded-[2.5rem] hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/10 text-left relative overflow-hidden">
                                <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform"><PenTool size={80} /></div>
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4"><Zap size={20} fill="currentColor" /></div>
                                <span className="block font-bold text-sm uppercase tracking-tight mb-1">{t.studio_title}</span>
                                <span className="text-[9px] font-medium text-emerald-300 uppercase tracking-widest">{t.studio_desc}</span>
                            </button>
                        )}
                        <button onClick={onStatsOpen} className="group p-6 bg-amber-50 border border-amber-100 rounded-[2.5rem] hover:bg-amber-100 transition-all text-left">
                            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-200"><BarChart3 size={20} /></div>
                            <span className="block font-bold text-sm uppercase text-amber-900 mb-1">{t.stats_title}</span>
                            <span className="text-[9px] font-medium text-amber-600 uppercase tracking-widest">{t.stats_desc}</span>
                        </button>
                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md"><Clock size={16} /></div>
                                <span className="font-bold text-[10px] uppercase tracking-widest text-emerald-800">{t.timer_title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <select value={timerSettings.duration / 60} onChange={(e) => toggleTimer(Number(e.target.value))} className="flex-1 bg-white border border-emerald-200 text-emerald-700 py-2 px-3 rounded-xl text-xs font-bold outline-none cursor-pointer">
                                    <option value="0">{t.timer_off}</option>
                                    {[5, 10, 15, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                                </select>
                                {timerSettings.duration > 0 && <button onClick={resetTimer} className="p-2 text-rose-500 bg-white rounded-xl shadow-sm border border-rose-100 hover:bg-rose-50"><History size={16} /></button>}
                            </div>
                        </div>
                        {/* Tool: Profile/Settings (Teacher Only) */}
                        {userRole === 'teacher' && (
                            <button onClick={onProfileOpen} className="group p-6 bg-white border border-slate-200 rounded-[2.5rem] hover:border-emerald-600 transition-all text-left shadow-sm">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm"><Settings size={20} /></div>
                                <span className="block font-bold text-sm uppercase text-slate-700 mb-1">{t.profile_btn}</span>
                                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{t.profile_desc}</span>
                            </button>
                        )}
                    </div>
                </section>

                {/* --- TAB NAVIGATION --- */}
                <div className="flex gap-1 p-1 bg-emerald-950/5 rounded-2xl w-fit mb-8 mx-2">
                    <button 
                        onClick={() => setActiveTab('curriculum')}
                        className={`px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === 'curriculum' ? 'bg-white text-emerald-700 shadow-md' : 'text-slate-400 hover:text-emerald-600'}`}
                    >
                        <div className="flex items-center gap-2"><Book size={14}/> {t.curriculum_title}</div>
                    </button>
                    {userRole === 'teacher' && (
                        <button 
                            onClick={() => setActiveTab('archive')}
                            className={`px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === 'archive' ? 'bg-white text-emerald-700 shadow-md' : 'text-slate-400 hover:text-emerald-600'}`}
                        >
                            <div className="flex items-center gap-2"><History size={14}/> {t.archive_title}</div>
                        </button>
                    )}
                </div>

                {/* --- CONTENT AREA --- */}
                {activeTab === 'curriculum' ? (
                    <section className="flex flex-col gap-6 animate-in slide-in-from-left-4 duration-500">
                        {Object.entries(CATEGORIES).map(([catKey, category]) => {
                            const styles = getStyles(category);
                            const isExpanded = expandedCategory === catKey;
                            return (
                                <div key={catKey} className={`bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isExpanded ? `shadow-2xl shadow-emerald-900/10 border-emerald-200` : 'border-slate-100 shadow-sm hover:border-emerald-200'}`}>
                                    <button onClick={() => setExpandedCategory(isExpanded ? null : catKey)} className={`w-full p-8 flex items-center justify-between text-left ${isExpanded ? 'bg-emerald-50/30' : ''}`}>
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center ${styles.bgDark} text-white shadow-lg`}><Award size={28} /></div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">{category.label[lang]}</h3>
                                                <p className="text-[10px] text-emerald-600/60 font-bold uppercase tracking-widest">{t.topics_count(category.topics.length)}</p>
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp size={24} className="text-slate-300" /> : <ChevronDown size={24} className="text-slate-300" />}
                                    </button>
                                    <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100 p-8 pt-0' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {category.topics.map(topic => (
                                                <div key={topic.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 hover:border-amber-200 hover:shadow-xl transition-all group">
                                                    <div className="font-bold text-slate-800 mb-5 flex items-center justify-between text-sm">
                                                        {topic.label[lang]}
                                                        <div className={`w-2 h-2 rounded-full ${styles.bgDark} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                                    </div>
                                                    <div className="relative">
                                                        <select value={selectedTopic === topic.id ? selectedLevel : 0} onChange={(e) => onSelect(topic.id, Number(e.target.value))} className={`w-full p-4 pl-5 bg-[#f9fbf7] border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 appearance-none transition-all ${selectedTopic === topic.id ? `ring-2 ring-emerald-500 border-transparent shadow-lg bg-white` : ''}`}>
                                                            <option value={0} disabled>{t.select_level}</option>
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => LEVEL_DESCRIPTIONS[topic.id]?.[lvl] && (<option key={lvl} value={lvl} className="text-base">{lang === 'sv' ? `Nivå ${lvl}` : `Level ${lvl}`} — {LEVEL_DESCRIPTIONS[topic.id]?.[lvl]?.[lang] || ""}</option>))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-300"><ChevronDown size={18} /></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                ) : (
                    /* --- ARCHIVE VIEW --- */
                    <section className="animate-in slide-in-from-right-4 duration-500 space-y-4">
                        {isLoadingArchive ? (
                            <div className="flex items-center justify-center p-20"><div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full" /></div>
                        ) : archivedSessions.length === 0 ? (
                            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-emerald-100">
                                <History size={48} className="mx-auto text-emerald-100 mb-4" />
                                <p className="font-bold text-slate-400 uppercase tracking-widest">{t.archive_empty}</p>
                            </div>
                        ) : (
                            archivedSessions.map(session => (
                                <div key={session.id} className="bg-white p-6 rounded-[2.5rem] border border-emerald-50 shadow-sm hover:shadow-xl transition-all flex flex-col lg:flex-row items-center justify-between gap-6 group">
                                    <div className="flex items-center gap-6 flex-1 min-w-0">
                                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                            <FileSpreadsheet size={28} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-800 text-lg truncate leading-none mb-2">{session.title || "Live Lektion"}</h4>
                                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md"><Calendar size={12}/> {new Date(session.created_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md"><Users size={12}/> {session.studentCount} Elever</span>
                                                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100 font-black">{session.class_code}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACCURACY METRIC BADGE */}
                                    <div className="flex items-center gap-8 px-6 border-l border-slate-100">
                                        <div className="text-center">
                                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{t.accuracy_label}</span>
                                            <div className={`text-2xl font-black italic ${session.accuracy > 70 ? 'text-emerald-500' : session.accuracy > 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                {session.accuracy}%
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 rounded-full border-4 border-slate-50 flex items-center justify-center">
                                            {session.accuracy > 70 ? (
                                                <CheckCircle2 size={20} className="text-emerald-500" />
                                            ) : (
                                                <AlertCircle size={20} className={session.accuracy > 40 ? "text-amber-500" : "text-rose-500"} />
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                        <button onClick={() => onViewReport(session)} className="flex-1 lg:flex-none px-5 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
                                            {t.view_report}
                                        </button>
                                        <button onClick={() => onEdit(session)} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 group/edit" title={t.edit_btn}>
                                            <PenTool size={18} />
                                        </button>
                                        <button onClick={() => onRelaunch(session)} className="flex-1 lg:flex-none px-6 py-4 bg-emerald-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95">
                                            <RotateCcw size={14}/> {t.relaunch_btn}
                                        </button>
                                        <button className="p-3 text-slate-200 hover:text-slate-900 transition-colors"><MoreHorizontal size={20}/></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                )}

                {/* --- FIXED START ACTION BAR --- */}
                {activeTab === 'curriculum' && (
                    <div className={`fixed bottom-12 left-0 right-0 flex justify-center pointer-events-none z-30 transition-all duration-500 ${selectedTopic ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                        <button onClick={onStart} className="px-14 py-6 rounded-[2.5rem] font-bold text-2xl shadow-[0_20px_50px_rgba(249,115,22,0.3)] bg-orange-500 text-white pointer-events-auto flex items-center gap-6 hover:scale-105 hover:bg-orange-600 active:scale-95 transition-all tracking-tight border-b-8 border-orange-700">
                            {t.start_btn} <Play fill="currentColor" size={28} />
                        </button>
                    </div>
                )}

                {/* --- RESOURCE FOOTER --- */}
                <footer className="mt-24 py-16 grid grid-cols-1 md:grid-cols-3 gap-12 px-4 relative z-10 border-t border-emerald-900/5">
                    <div className="space-y-6 text-center md:text-left">
                        <h4 className="text-[10px] font-bold text-emerald-800/30 uppercase tracking-[0.3em]">{t.resources}</h4>
                        <div className="flex flex-col gap-4">
                            <button onClick={onContentOpen} className="flex items-center justify-center md:justify-start gap-3 text-slate-500 hover:text-emerald-700 font-bold text-sm transition-colors"><Map size={18} /> {t.content_map}</button>
                            <button onClick={onLgrOpen} className="flex items-center justify-center md:justify-start gap-3 text-slate-500 hover:text-emerald-700 font-bold text-sm transition-colors"><Book size={18} /> {t.lgr_link}</button>
                        </div>
                    </div>
                    <div className="space-y-6 text-center md:text-left">
                        <h4 className="text-[10px] font-bold text-emerald-800/30 uppercase tracking-[0.3em]">Support</h4>
                        <div className="flex flex-col gap-4">
                            <button onClick={onAboutOpen} className="flex items-center justify-center md:justify-start gap-3 text-slate-500 hover:text-emerald-700 font-bold text-sm transition-colors"><Info size={18} /> {t.about_link}</button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end justify-center gap-1 opacity-20">
                        <h2 className="text-3xl font-black text-emerald-900 tracking-tighter italic leading-none">{lang === 'sv' ? 'ANPASSA' : 'ADAPT'}</h2>
                        <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest">{t.brand_motto}</p>
                    </div>
                </footer>
            </div>

            <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none z-0 overflow-hidden">
                <svg className="relative block w-full h-[400px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,1.13V120H0Z" className="fill-emerald-100/40"></path>
                </svg>
            </div>
        </div>
    );
};

export default Dashboard;