import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  ChevronLeft, ChevronDown, ChevronUp, ChevronRight, Zap, Play, Clock, Book, Map, Info, 
  Award, BarChart3, PenTool, Calendar, Sparkles, Users, Settings, User, 
  History, Target, LayoutGrid, RotateCcw, FileSpreadsheet, MoreHorizontal,
  PlayCircle, CheckCircle2, AlertCircle, Grid3X3, Monitor, Beaker, Newspaper, X, 
  ArrowUpRight, Layers, PieChart, HelpCircle, Check
} from 'lucide-react';

import { CATEGORIES, LEVEL_DESCRIPTIONS } from '@/constants/localization';
import { APP_UPDATES } from '@/constants/updates';
import TeacherHubManager from './TeacherHubManager';
import { CONTENT_MAP } from '../../constants/content_map.generated';
import MathDisplay from '../shared/MathDisplay';
import DashboardTutorialModal from '../modals/DashboardTutorialModal';
import CapacityModal from '../modals/CapacityModal';
import { BookOpen } from 'lucide-react';

// Helper to look up topic name safely
const getTopicName = (topicId, lang = 'sv') => {
    if (!topicId) return "";
    for (const catKey in CATEGORIES) {
        const found = CATEGORIES[catKey]?.topics?.find(t => t.id === topicId);
        if (found) return found.label[lang] || found.label.sv || topicId;
    }
    return topicId.replace(/_/g, ' ');
};

// Helper for dynamic localized "Del / Part" title
const getPartDisplayTitle = (part, partIndex, lang = 'sv') => {
    if (part.customTitle && part.customTitle.trim()) {
        return part.customTitle;
    }
    const prefix = lang === 'sv' ? 'Del' : 'Part';
    const topicLabel = getTopicName(part.topicId, lang);
    return topicLabel ? `${prefix} ${partIndex + 1}: ${topicLabel}` : `${prefix} ${partIndex + 1}`;
};

// Helper to retrieve level description and math example
const getLevelMetadata = (topicId, level, lang = 'sv') => {
    if (!topicId || level === undefined || level === null) {
        return { description: "", mathExample: "" };
    }
    const descriptionsObj = typeof LEVEL_DESCRIPTIONS !== 'undefined' ? LEVEL_DESCRIPTIONS : {};
    const topicDesc = descriptionsObj[topicId]?.[level];
    const description = typeof topicDesc === 'object' 
        ? (topicDesc[lang] || topicDesc.sv || "") 
        : (topicDesc || "");

    let mathExample = "";
    if (typeof CONTENT_MAP !== 'undefined' && Array.isArray(CONTENT_MAP)) {
        for (const cat of CONTENT_MAP) {
            const foundTopic = cat.topics?.find(t => t.id === topicId);
            if (foundTopic) {
                const foundLevel = foundTopic.levels?.find(l => l.lvl === level);
                if (foundLevel?.ex) {
                    mathExample = foundLevel.ex;
                    break;
                }
            }
        }
    }
    return { description, mathExample };
};

// Normalizer: Handles both legacy flat arrays and structured parts
const normalizePartsPayload = (rawPayload = [], lang = 'sv') => {
    if (!Array.isArray(rawPayload) || rawPayload.length === 0) return [];

    if (rawPayload[0]?.type === 'part' || rawPayload[0]?.type === 'section') {
        return rawPayload.map((part, pIdx) => ({
            ...part,
            type: 'part',
            id: part.id || `part_${pIdx}_${Date.now()}`,
            steps: Array.isArray(part.steps) ? part.steps : []
        }));
    }

    // Auto-group legacy flat payloads
    const grouped = {};
    const parts = [];

    rawPayload.forEach((item, idx) => {
        const topic = item.topic || item.topicId || 'generic';
        if (!grouped[topic]) {
            const newPart = {
                id: `part_${topic}_${Date.now()}_${idx}`,
                type: 'part',
                topicId: topic,
                customTitle: null,
                steps: []
            };
            grouped[topic] = newPart;
            parts.push(newPart);
        }
        grouped[topic].steps.push({
            id: item.id || `step_${idx}_${Date.now()}`,
            type: item.type || (item.sheetId ? 'instruction' : 'practice'),
            ...item
        });
    });

    return parts;
};

const Dashboard = ({ 
    profile, lang = 'sv', selectedTopic, selectedLevel, onSelect, onStart, 
    timerSettings, toggleTimer, resetTimer, ui, onLgrOpen, onContentOpen, 
    onAboutOpen, onStatsOpen, onStudioOpen, onProfileOpen, onLabOpen, onFractionLabOpen,
    onTimesTableOpen, onRelaunch, onViewReport, onEdit, activeBucket, onBackToGateway,
    userRole = 'teacher'
}) => {
    const [expandedCategory, setExpandedCategory] = useState('arithmetic');
    const [activeTab, setActiveTab] = useState('curriculum'); 
    const [archivedSessions, setArchivedSessions] = useState([]);
    const [isLoadingArchive, setIsLoadingArchive] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [showUpdateLog, setShowUpdateLog] = useState(false);
    const [showCapacityModal, setShowCapacityModal] = useState(false);
    const [activeInstructionModal, setActiveInstructionModal] = useState(null);

    const TEXT = {
        sv: {
            tools_section: "Verktyg", class_code_label: "Din klasskod", connected_code_label: "Ansluten till kod",
            timer_title: "Timer", timer_off: "Timer av", timer_reset: "Nollställ",
            studio_title: "Question Studio / Presentera", studio_desc: "Skapa material",
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
            studio_title: "Question Studio / Slides", studio_desc: "Create material",
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

    const storageKey = `has_seen_dashboard_guide_${userRole}`;
    const [showDashboardTutorial, setShowDashboardTutorial] = useState(() => {
        return !localStorage.getItem(storageKey);
    });

    const handleCloseDashboardTutorial = () => {
        localStorage.setItem(storageKey, 'true');
        setShowDashboardTutorial(false);
    };
    
    const curatedParts = useMemo(() => {
        if (!activeBucket || activeBucket === 'FREE_PLAY') return [];
        return normalizePartsPayload(activeBucket.payload, lang);
    }, [activeBucket, lang]);

    useEffect(() => {
        fetchActiveSession();
        if (activeTab === 'archive' && ['teacher', 'super_admin'].includes(userRole)) {
            fetchArchive();
        }
    }, [activeTab]);

    // 🟢 Secure fetch handler for student presentations via RPC
    const handleOpenInstruction = async (step) => {
        if (step.slideData && (step.slideData.latex || step.slideData.title)) {
            setActiveInstructionModal(step);
            return;
        }

        if (step.sheetId) {
            try {
                const teacherCode = profile?.class_code || profile?.connected_code;
                const { data: packet, error } = await supabase.rpc('get_student_presentation', {
                    p_sheet_id: step.sheetId,
                    p_teacher_code: teacherCode
                });

                if (error) throw error;

                if (packet && packet.slides) {
                    const slides = packet.slides;
                    const slideIdx = step.slideIndex || 0;
                    const targetSlide = slides[slideIdx] || slides[0] || {};

                    setActiveInstructionModal({
                        ...step,
                        slideData: targetSlide,
                        allSlides: slides
                    });
                    return;
                }
            } catch (err) {
                console.error("Failed to load presentation via RPC:", err.message);
            }
        }

        setActiveInstructionModal(step);
    };
    
    const fetchActiveSession = async () => {
        if (!['teacher', 'super_admin'].includes(userRole) || !profile?.id) return;
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
    const themeColorString = activeCategoryData?.color || 'emerald';

    // --- GROUP CURATED PAYLOAD ---
    let groupedCuratedPayload = {};
    if (activeBucket && activeBucket !== 'FREE_PLAY') {
        groupedCuratedPayload = activeBucket.payload.reduce((acc, item) => {
            if (!acc[item.topic]) acc[item.topic] = [];
            acc[item.topic].push(item.level);
            return acc;
        }, {});
        
        // Sort the levels numerically inside each topic
        Object.keys(groupedCuratedPayload).forEach(topic => {
            groupedCuratedPayload[topic].sort((a, b) => a - b);
        });
    }

    return (
        <div className="layout-wrapper relative z-10 animate-in fade-in pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-6 lg:gap-8 pt-6 w-full max-w-[1600px] mx-auto px-4 sm:px-6">           
                {/* ========================================================= */}
                {/* LEFT COLUMN: COMMAND CENTER (PROFILE & TOOLS)        */}
                {/* ========================================================= */}
                <aside className="w-full flex flex-col gap-4">
                    
                    {/* --- HEADER STATUS CARD --- */}
                    <div className="card theme-emerald flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[var(--brand-solid)] rounded-[var(--radius-btn)] flex items-center justify-center text-white shadow-md shrink-0">
                                {['teacher', 'super_admin'].includes(userRole) ? <Users size="{24}"/> : <User size="{24}"/>}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg font-bold text-[var(--text-main)] leading-none mb-1 truncate">
                                    {['teacher', 'super_admin'].includes(userRole) ? (profile?.full_name || "Lärare") : (profile?.full_name || "Elev")}
                                </h1>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5 truncate">
                                    <Target size={10}/> {profile?.school_name || "Anpassa Math Platform"}
                                </p>
                            </div>
                        </div>
                    {/* ONLY SHOW TO TEACHERS & SUPER ADMINS */}
                    {['teacher', 'super_admin'].includes(userRole) && (
                        <>
                            {/* Subscription Date */}
                            {(() => {
                                const sub = formatSubscriptionDate(profile?.subscription_end_date || profile?.subscription_ends_at, lang);
                                if (!sub) return null;
                                return (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-surface)] p-2 rounded-[var(--radius-btn)] border border-[var(--border-main)]">
                                        <span className={`w-2 h-2 rounded-full ${sub.isExpired ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                        <span className={sub.isExpired ? 'text-[var(--theme-rose-text)] font-black' : 'text-[var(--text-muted)]'}>
                                            {sub.text}
                                        </span>
                                    </div>
                                );
                            })()}

                            {/* Class Code */}
                            <div className="flex flex-col items-center bg-[var(--brand-bg)] px-4 py-3 rounded-[var(--radius-btn)] border border-[var(--brand-border)] relative overflow-hidden">
                                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--brand-text)] opacity-80 mb-0.5">
                                    {['teacher', 'super_admin'].includes(userRole) ? t.class_code_label : t.connected_code_label}
                                </span>
                                <span className="text-xl font-black tracking-[0.2em] text-[var(--brand-text)] uppercase">
                                    {profile?.class_code || "---"}
                                </span>
                                
                                {/* 🟢 NEW: Capacity Management Button */}
                                {['teacher', 'super_admin'].includes(userRole) && profile?.class_code && (
                                    <button 
                                        onClick={() => setShowCapacityModal(true)}
                                        className="theme-amber mt-3 flex items-center gap-1.5 px-4 py-1.5 bg-[var(--theme-amber-bg)] border border-[var(--theme-amber-border)] rounded-md text-[9px] font-black uppercase tracking-widest text-[var(--theme-amber-text)] hover:bg-amber-500 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                                    >
                                        <Users size={12} /> {lang === 'sv' ? "Hantera Platser" : "Manage Slots"}
                                    </button>
                                )}
                            </div>

                            {/* Profile/Settings Button */}
                            <button 
                                onClick={onProfileOpen} 
                                className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-widest hover:border-[var(--brand-solid)] hover:text-[var(--brand-text)] transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                                <Settings size={14} /> {t.profile_btn}
                            </button>
                        </>
                    )}
                    </div>


                    {/* --- TOOLS SECTION --- */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 ml-2">
                            <Zap size={14} className="text-orange-400" />
                            <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t.tools_section}</h2>
                        </div>

                        {/* Question Studio */}
                        {['teacher', 'super_admin'].includes(userRole) && (
                            <div className="theme-emerald">
                                <button onClick={onStudioOpen} className="group flex items-center gap-4 p-4 bg-[var(--brand-solid)] text-white rounded-[var(--radius-card)] hover:opacity-90 transition-all shadow-md text-left w-full">
                                    <div className="w-10 h-10 bg-white/20 rounded-[var(--radius-btn)] flex items-center justify-center shrink-0">
                                        <Zap size={18} fill="currentColor" />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-sm uppercase tracking-tight leading-tight">{t.studio_title}</span>
                                        <span className="text-[9px] font-medium text-white/70 uppercase tracking-widest">{t.studio_desc}</span>
                                    </div>
                                </button>
                            </div>
                        )}

                        <div className="theme-indigo mt-2">
                            <button 
                                onClick={onFractionLabOpen} 
                                className="group flex items-center gap-3 p-3.5 bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-[var(--radius-card)] hover:border-[var(--brand-solid)] hover:bg-[var(--brand-solid)] transition-all text-left w-full cursor-pointer"
                            >
                                
                                <div className="w-8 h-8 bg-[var(--bg-card)] rounded-[var(--radius-btn)] flex items-center justify-center text-[var(--brand-text)] shrink-0 shadow-sm">
                                    <PieChart size={18} />
                                </div>
                                <div>
                            <span className="block font-bold text-xs uppercase text-[var(--text-main)] group-hover:text-white leading-tight">
                                {lang === 'sv' ? "Digitala laborationer" : "Digitala Manipulatives"}
                            </span>
                            <span className="text-[9px] font-bold text-[var(--brand-text)] group-hover:text-white/80 uppercase tracking-widest">
                                {lang === 'sv' ? "Bråk, Algebra, Geometri" : "Fraction, Algebra, Geometry"}
                            </span>
                        </div>
                
                            </button>
                        </div>

                        {/* Test Lab */}
                        <div className="theme-indigo">
                            <button onClick={onLabOpen} className="group flex items-center gap-4 p-4 bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-[var(--radius-card)] hover:border-[var(--brand-solid)] hover:bg-[var(--brand-solid)] transition-all text-left w-full">
                                <div className="w-10 h-10 bg-[var(--bg-card)] rounded-[var(--radius-btn)] flex items-center justify-center text-[var(--brand-text)] shrink-0 group-hover:text-[var(--brand-text)] shadow-sm">
                                    <Beaker size={18} />
                                </div>
                                <div>
                                    <span className="block font-bold text-sm uppercase text-[var(--text-main)] group-hover:text-white leading-tight">Test Lab</span>
                                    <span className="text-[9px] font-bold text-[var(--brand-text)] group-hover:text-white/80 uppercase tracking-widest">
                                        {lang === 'sv' ? 'Övningsprov' : 'Practice tests'}
                                    </span>
                                </div>
                            </button>
                        </div>
                        

                        {/* Timer Inline Tool */}
                        <div className="theme-emerald">
                            <div className="flex items-center gap-3 p-4 bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-[var(--radius-card)] w-full">
                                <div className="w-10 h-10 bg-[var(--brand-solid)] rounded-[var(--radius-btn)] flex items-center justify-center text-white shrink-0 shadow-sm">
                                    <Clock size={18} />
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                    <select value={timerSettings.duration / 60} onChange={(e) => toggleTimer(Number(e.target.value))} className="flex-1 bg-[var(--bg-card)] border-2 border-[var(--border-strong)] text-[var(--text-main)] py-2 px-2 rounded-[var(--radius-btn)] text-xs font-bold outline-none cursor-pointer focus:border-[var(--brand-solid)] appearance-none">
                                        <option value="0">{t.timer_off}</option>
                                        {[5, 10, 15, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                                    </select>
                                    {timerSettings.duration > 0 && (
                                        <button onClick={resetTimer} className="p-2 text-[var(--theme-rose-text)] bg-[var(--bg-card)] rounded-[var(--radius-btn)] shadow-sm border border-[var(--border-strong)] hover:border-[var(--theme-rose-border)] hover:bg-[var(--theme-rose-bg)] transition-colors">
                                            <RotateCcw size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row Tools */}
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <div className="theme-emerald">
                                <button onClick={onTimesTableOpen} className="group flex flex-col items-center justify-center gap-2 p-4 bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-[var(--radius-card)] hover:border-[var(--brand-solid)] transition-all text-center">
                                    <Grid3X3 size={20} className="text-[var(--brand-text)]" />
                                    <span className="font-bold text-[10px] uppercase text-[var(--text-main)]">{t.times_table_title}</span>
                                </button>
                            </div>
                            <div className="theme-amber">
                                <button onClick={onStatsOpen} className="group flex flex-col items-center justify-center gap-2 p-4 bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-[var(--radius-card)] hover:border-[var(--brand-solid)] transition-all text-center">
                                    <BarChart3 size={20} className="text-[var(--brand-text)]" />
                                    <span className="font-bold text-[10px] uppercase text-[var(--text-main)]">{t.stats_title}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Left Footer Links */}
                    <footer className="mt-auto pt-8 pb-4 flex flex-col gap-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        <button onClick={onLgrOpen} className="flex items-center gap-2 hover:text-[var(--brand-solid)] transition-colors"><Book size={14} /> {t.lgr_link}</button>
                        <button onClick={onAboutOpen} className="flex items-center gap-2 hover:text-[var(--brand-solid)] transition-colors"><Info size={14} /> {t.about_link}</button>
                    </footer>
                </aside>


                {/* ========================================================= */}
                {/* ➡️ RIGHT COLUMN: MAIN CONTENT (CURRICULUM & ARCHIVE)    */}
                {/* ========================================================= */}
                <main className="w-full min-w-0 flex flex-col">
                    
                    {/* --- ACTIVE SESSION RESUME BANNER --- */}
                    {activeSession && ['teacher', 'super_admin'].includes(userRole) && (
                        <div className="theme-rose mb-6 p-5 bg-[var(--brand-solid)] rounded-[var(--radius-card)] shadow-2xl shadow-[var(--brand-solid)]/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-[var(--radius-btn)] flex items-center justify-center shadow-sm">
                                    <PlayCircle size={24} className="text-[var(--brand-solid)]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-white leading-none mb-1">{t.resume_h}</h3>
                                    <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest leading-none">
                                        {activeSession.title} — Kod: <span className="font-black text-white">{activeSession.class_code}</span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => onRelaunch(activeSession)} className="w-full sm:w-auto px-6 py-3 bg-white text-[var(--brand-solid)] hover:bg-slate-50 rounded-[var(--radius-btn)] font-black uppercase tracking-widest shadow-md active:scale-95 text-[10px] transition-all">
                                {t.resume_btn}
                            </button>
                        </div>
                    )}

                    {/* --- CONTENT TABS & MAP NAV --- */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex gap-2 w-fit">
                                              
                            {/* Existing Tabs */}
                            <button 
                                onClick={() => setActiveTab('curriculum')} 
                                className={`px-6 py-2.5 rounded-[var(--radius-btn)] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${activeTab === 'curriculum' ? 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] shadow-sm' : 'bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                            >
                                <Book size={14}/> {t.curriculum_title}
                            </button>

                            {/* NEW: Hub Manager Tab (Teachers Only) */}
                            {['teacher', 'super_admin'].includes(userRole) && (
                                <button 
                                    onClick={() => setActiveTab('hub')} 
                                    className={`px-6 py-2.5 rounded-[var(--radius-btn)] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${activeTab === 'hub' ? 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] shadow-sm' : 'bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                >
                                    <Layers size={14}/> {lang === 'sv' ? "Grupper" : "Custom Unit"}
                                </button>
                            )}

                            {['teacher', 'super_admin'].includes(userRole) && (
                                <button 
                                    onClick={() => setActiveTab('archive')} 
                                    className={`px-6 py-2.5 rounded-[var(--radius-btn)] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${activeTab === 'archive' ? 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] shadow-sm' : 'bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                >
                                    <History size={14}/> {t.archive_title}
                                </button>
                            )}
                        </div>
                        {['teacher', 'super_admin'].includes(userRole) && (
                                <div className="theme-orange">
                                    <button 
                                        onClick={() => setShowUpdateLog(true)} 
                                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-[var(--radius-btn)] bg-[var(--brand-bg)] border border-[var(--brand-border)] hover:border-[var(--brand-solid)] text-[var(--brand-text)] transition-all shadow-xs group cursor-pointer"
                                        title={t.view_all}
                                    >
                                        <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider">
                                            <Sparkles size={13} className="text-amber-500 fill-amber-500 group-hover:rotate-12 transition-transform" />
                                            <span className="hidden md:inline text-[var(--text-muted)] font-bold">{t.news_title}:</span>
                                            <span className="truncate max-w-[150px] lg:max-w-[200px] text-[var(--text-main)] font-black">
                                                {latestUpdate.title[lang]}
                                            </span>
                                        </div>
                                        <span className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--brand-border)] text-[9px] font-black tracking-normal">
                                            v{latestUpdate.version}
                                        </span>
                                    </button>
                                </div>
                            )}   
                    </div>

                    {/* --- TAB CONTENT --- */}
                    {activeTab === 'hub' ? (
                        <div className="animate-in slide-in-from-right-4 duration-500 pb-20">
                            <TeacherHubManager lang={lang} teacherId={profile?.id} />
                        </div>
                    ) : activeTab === 'curriculum' ? (
                        <div className="flex flex-col animate-in slide-in-from-right-4 duration-500">
                            
                            {/* --- CURATED BUCKET ROADMAP: DEL 1, DEL 2, ETC. --- */}
                            {userRole === 'student' && activeBucket && activeBucket !== 'FREE_PLAY' ? (
                                <div className="space-y-6">
                                    {/* Unit Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-[var(--radius-card)] border border-[var(--border-main)] shadow-sm">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-text)]">
                                                {lang === 'sv' ? "Aktiv Enhet" : "Active Unit"}
                                            </span>
                                            <h2 className="text-2xl font-black uppercase italic text-[var(--text-main)] tracking-tight">
                                                {activeBucket.name}
                                            </h2>
                                            <p className="text-xs text-[var(--text-muted)] font-bold mt-1">
                                                {curatedParts.length} {lang === 'sv' ? "delar i planeringen" : "parts in sequence"}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={onBackToGateway}
                                            className="w-full sm:w-auto px-4 py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-[var(--border-strong)] cursor-pointer"
                                        >
                                            <ChevronLeft size={16}/> {lang === 'sv' ? "Byt Enhet" : "Change Unit"}
                                        </button>
                                    </div>

                                    {/* Parts Sequence */}
                                    <div className="space-y-6">
                                        {curatedParts.map((part, pIdx) => (
                                            <div 
                                                key={part.id || pIdx} 
                                                className="bg-[var(--bg-card)] rounded-[var(--radius-card)] border border-[var(--border-main)] overflow-hidden shadow-sm"
                                            >
                                                {/* Part Header Strip */}
                                                <div className="bg-[var(--bg-surface)] px-5 py-3.5 border-b border-[var(--border-main)] flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="w-6 h-6 rounded-lg bg-[var(--brand-solid)] text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-xs">
                                                            {pIdx + 1}
                                                        </span>
                                                        <h3 className="font-black text-sm uppercase tracking-wider text-[var(--text-main)]">
                                                            {getPartDisplayTitle(part, pIdx, lang)}
                                                        </h3>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                                        {part.steps?.length || 0} {lang === 'sv' ? "steg" : "steps"}
                                                    </span>
                                                </div>

                                                {/* Step Cards List */}
                                                <div className="p-4 space-y-2.5">
                                                    {(part.steps || []).map((step, sIdx) => {
                                                        const isInstruction = step.type === 'instruction' || !!step.sheetId;

                                                        if (isInstruction) {
                                                            return (
                                                                <div 
                                                                    key={step.id || sIdx}
                                                                    onClick={() => setActiveInstructionModal(step)}
                                                                    className="group p-3.5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-r from-indigo-50/80 via-[var(--bg-card)] to-indigo-50/40 hover:to-indigo-100/60 transition-all flex items-center justify-between gap-3 cursor-pointer shadow-xs active:scale-[0.99]"
                                                                >
                                                                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                                                                            <BookOpen size={16} />
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0">
                                                                                    {lang === 'sv' ? "Genomgång" : "Walkthrough"}
                                                                                </span>
                                                                                <span className="font-black text-xs text-[var(--text-main)] truncate">
                                                                                    {step.sheetTitle}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <button 
                                                                        type="button"
                                                                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm shrink-0"
                                                                    >
                                                                        <Play size={11} fill="currentColor" />
                                                                        <span>{lang === 'sv' ? "Titta" : "Watch"}</span>
                                                                    </button>
                                                                </div>
                                                            );
                                                        }

                                                        // Practice Level Step
                                                        const isSelected = selectedTopic === step.topic && selectedLevel === step.level;
                                                        const { description, mathExample } = getLevelMetadata(step.topic, step.level, lang);

                                                        return (
                                                            <div 
                                                                key={step.id || sIdx}
                                                                onClick={() => onSelect(step.topic, step.level)}
                                                                className={`group p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] ${
                                                                    isSelected 
                                                                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20' 
                                                                        : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--brand-solid)]'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                                                                        isSelected 
                                                                            ? 'bg-emerald-600 text-white shadow-sm' 
                                                                            : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                                                                    }`}>
                                                                        {step.level}
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0">
                                                                                {lang === 'sv' ? `Nivå ${step.level}` : `Level ${step.level}`}
                                                                            </span>
                                                                            <span className="font-bold text-xs text-[var(--text-main)] truncate">
                                                                                {description || getTopicName(step.topic, lang)}
                                                                            </span>
                                                                        </div>

                                                                        {mathExample && (
                                                                            <div className="mt-1 text-xs text-[var(--brand-solid)] font-serif italic truncate flex items-center gap-1.5 opacity-90 overflow-x-auto no-scrollbar">
                                                                                <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-[var(--text-muted)] not-italic">
                                                                                    Ex:
                                                                                </span>
                                                                                <MathDisplay content={mathExample} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="shrink-0 flex items-center">
                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                                        isSelected 
                                                                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs' 
                                                                            : 'border-[var(--border-strong)] group-hover:border-[var(--brand-solid)]'
                                                                    }`}>
                                                                        {isSelected && <Check size={11} strokeWidth={3} />}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* --- EXISTING FULL CURRICULUM VIEW (Free Play / Teacher) --- */
                                <>
                                    {/* HORIZONTAL CATEGORY TABS */}
                                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                                        {Object.entries(CATEGORIES).map(([catKey, category]) => {
                                            const isActive = expandedCategory === catKey;
                                            const themeColorStr = category.color || 'emerald';
                                            
                                            return (
                                                <div key={catKey} className={`theme-${themeColorStr}`}>
                                                    <button 
                                                        onClick={() => setExpandedCategory(catKey)}
                                                        className={`flex items-center gap-2 px-5 py-3 rounded-[var(--radius-btn)] font-bold uppercase text-[11px] tracking-widest whitespace-nowrap transition-all shadow-sm border-2 cursor-pointer ${
                                                            isActive 
                                                                ? `bg-[var(--brand-solid)] text-white border-[var(--brand-solid)]` 
                                                                : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] hover:border-[var(--brand-solid)] hover:text-[var(--brand-text)]'
                                                        }`}
                                                    >
                                                        {isActive && <Award size={14} />}
                                                        {category.label[lang]}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {/* 🟢 GUIDE / HELP BUTTON */}
                                        <button
                                            type="button"
                                            onClick={() => setShowDashboardTutorial(true)}
                                            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[var(--radius-btn)] bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-main)] hover:border-[var(--brand-solid)] hover:text-[var(--brand-solid)] font-bold text-[10px] uppercase tracking-widest transition-all shadow-xs cursor-pointer shrink-0"
                                            title={lang === 'sv' ? "Snabbguide & Hjälp" : "Quick Guide & Help"}
                                        >
                                            <HelpCircle size={14} className="text-amber-500" />
                                            <span className="hidden sm:inline">{lang === 'sv' ? "Guide" : "Help"}</span>
                                        </button>
                                        <button 
                                            onClick={onContentOpen} 
                                            className="ml-auto shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-btn)] bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-main)] hover:border-[var(--brand-solid)] hover:text-[var(--brand-solid)] font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm group cursor-pointer"
                                        >
                                            <Map size={14} className="group-hover:scale-110 transition-transform" /> 
                                            {t.content_map}
                                            <ChevronRight size={14} className="opacity-40" />
                                        </button>
                                    </div>

                                    

                                    {/* ACTIVE CATEGORY TOPICS GRID */}
                                    <div className={`theme-${themeColorString} card p-6 sm:p-8 border-2 border-[var(--brand-border)]`}>
                                        <div className="mb-6 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[var(--radius-btn)] flex items-center justify-center bg-[var(--brand-solid)] text-white shadow-md">
                                                <Award size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight leading-none mb-1">
                                                    {activeCategoryData.label[lang]}
                                                </h3>
                                                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest leading-none">
                                                    {t.topics_count(activeCategoryData.topics.length)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3.5">
                                            {activeCategoryData.topics.map(topic => (
                                                <div key={topic.id} className="bg-[var(--bg-card)] rounded-[var(--radius-card)] p-5 border-2 border-[var(--border-main)] hover:border-[var(--brand-solid)] shadow-sm hover:shadow-lg transition-all group">
                                                    <div className="font-bold text-[var(--text-main)] mb-4 flex items-center justify-between text-sm leading-tight">
                                                        {topic.label[lang]}
                                                        <div className="w-2 h-2 rounded-full bg-[var(--brand-solid)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    </div>
                                                    <div className="relative">
                                                        <select 
                                                            value={selectedTopic === topic.id ? selectedLevel : 0} 
                                                            onChange={(e) => onSelect(topic.id, Number(e.target.value))} 
                                                            className={`w-full p-3 pl-4 bg-[var(--bg-surface)] border-2 rounded-[var(--radius-btn)] text-xs font-bold text-[var(--text-main)] appearance-none transition-all cursor-pointer outline-none ${
                                                                selectedTopic === topic.id ? `border-[var(--brand-solid)] shadow-md` : 'border-[var(--border-strong)] focus:border-[var(--brand-solid)]'
                                                            }`}
                                                        >
                                                            <option value={0} disabled>{t.select_level}</option>
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(lvl => LEVEL_DESCRIPTIONS[topic.id]?.[lvl] && (
                                                                <option key={lvl} value={lvl}>
                                                                    {lang === 'sv' ? `Nivå ${lvl}` : `Level ${lvl}`} — {LEVEL_DESCRIPTIONS[topic.id]?.[lvl]?.[lang] || ""}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-right-4 duration-500 space-y-4 pb-20">
                            {isLoadingArchive ? (
                                <div className="flex items-center justify-center p-20"><div className="animate-spin h-10 w-10 border-4 border-[var(--brand-solid)] border-t-transparent rounded-full" /></div>
                            ) : archivedSessions.length === 0 ? (
                                <div className="card p-20 text-center border-2 border-dashed border-[var(--border-strong)]">
                                    <History size={48} className="mx-auto text-[var(--text-muted)] mb-4 opacity-50" />
                                    <p className="font-bold text-[var(--text-muted)] uppercase tracking-widest">{t.archive_empty}</p>
                                </div>
                            ) : (
                                archivedSessions.map(session => {
                                    const isDoNow = session.active_question_data?.mode === 'donow';
                                    const themeCls = isDoNow ? 'theme-indigo' : 'theme-emerald';

                                    return (
                                        <div key={session.id} className={`${themeCls} card p-5 flex flex-col lg:flex-row items-center justify-between gap-5 group hover:border-[var(--brand-solid)] hover:shadow-lg transition-all`}>
                                            <div className="flex items-center gap-5 flex-1 min-w-0 w-full">
                                                <div className="w-12 h-12 rounded-[var(--radius-btn)] flex items-center justify-center shadow-inner shrink-0 bg-[var(--brand-bg)] text-[var(--brand-text)] border border-[var(--brand-border)] group-hover:bg-[var(--brand-solid)] group-hover:text-white transition-all">
                                                    {isDoNow ? <LayoutGrid size={24} /> : <FileSpreadsheet size={24} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-[var(--text-main)] text-base truncate leading-none mb-2">{session.title || (isDoNow ? "Do Now Grid" : "Live Lektion")}</h4>
                                                    <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                                        <span className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-main)] px-2 py-1 rounded-md"><Calendar size={10}/> {new Date(session.created_at).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-main)] px-2 py-1 rounded-md"><Users size={10}/> {session.studentCount} Elever</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 px-4 lg:border-l border-[var(--border-main)] w-full lg:w-auto">
                                                <div className="text-center">
                                                    <span className="block text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">{t.accuracy_label}</span>
                                                    <div className={`text-xl font-black italic ${session.accuracy > 70 ? 'text-[var(--theme-emerald-text)]' : session.accuracy > 40 ? 'text-[var(--theme-amber-text)]' : 'text-[var(--theme-rose-text)]'}`}>{session.accuracy}%</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                                                <button onClick={() => onViewReport(session)} className="flex-1 lg:flex-none px-4 py-3 bg-[var(--bg-surface)] text-[var(--text-main)] rounded-[var(--radius-btn)] text-[9px] font-black uppercase tracking-widest hover:border-[var(--brand-solid)] transition-all border border-[var(--border-strong)]">{t.view_report}</button>
                                                <button onClick={() => onEdit(session)} className="p-3 bg-[var(--brand-bg)] text-[var(--brand-text)] border border-[var(--brand-border)] rounded-[var(--radius-btn)] transition-all hover:bg-[var(--brand-solid)] hover:text-white" title={t.edit_btn}>
                                                    <PenTool size={16} />
                                                </button>
                                                <button onClick={() => onRelaunch(session)} className="btn-brand flex-1 lg:flex-none px-4 py-3 text-[9px] flex items-center justify-center gap-2 active:scale-95">
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
                {activeTab === 'curriculum' && (
                    <div className={`fixed bottom-8 right-8 flex justify-end pointer-events-none z-30 transition-all duration-500 ${selectedTopic ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                        <div className="theme-emerald">
                            <button onClick={onStart} className="btn-brand px-10 py-5 rounded-[2rem] font-bold text-xl pointer-events-auto flex items-center gap-4 hover:scale-105 active:scale-95 transition-all tracking-tight border-b-[6px] border-[var(--brand-border)] shadow-2xl">
                                {t.start_btn} <Play fill="currentColor" size={24} />
                            </button>
                        </div>
                    </div>
                )}

                {showUpdateLog && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 modal-overlay">
                        <div className="card-flat w-full max-w-2xl max-h-[80vh] animate-in zoom-in-95 p-0 border-[var(--border-main)] flex flex-col overflow-hidden">
                            <div className="card-header-flat bg-[var(--bg-surface)] p-8 shrink-0 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[var(--brand-bg)] text-[var(--brand-text)] border border-[var(--brand-border)] rounded-2xl shadow-sm"><Newspaper size={24}/></div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight italic text-[var(--text-main)]">Ändringslogg</h2>
                                </div>
                                <button onClick={() => setShowUpdateLog(false)} className="btn-ghost"><X className="text-[var(--text-main)]" /></button>
                            </div>
                            
                            <div className="card-body-flat overflow-y-auto p-8 space-y-10 custom-scrollbar bg-[var(--bg-card)]">
                                {APP_UPDATES.map((update) => (
                                    <div key={update.id} className="relative pl-8 border-l-2 border-[var(--border-strong)] pb-2">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[var(--bg-card)] border-2 border-[var(--brand-text)] rounded-full" />
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[10px] font-black text-[var(--brand-text)] bg-[var(--brand-bg)] border border-[var(--brand-border)] px-2 py-1 rounded-md">{update.date}</span>
                                            <span className="text-[10px] font-black text-[var(--text-muted)]">VERSION {update.version}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight mb-4">{update.title[lang]}</h3>
                                        <ul className="space-y-3">
                                            {update.changes[lang].map((change, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-[var(--text-main)] opacity-90 leading-relaxed">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-text)] mt-2 shrink-0" />
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
            <DashboardTutorialModal
                isOpen={showDashboardTutorial}
                onClose={handleCloseDashboardTutorial}
                lang={lang}
                userRole={userRole}
            />
            {/* NEW: Capacity Modal */}
            <CapacityModal 
                visible={showCapacityModal}
                onClose={() => setShowCapacityModal(false)}
                classCode={profile?.class_code}
                lang={lang}
            />
            {/* --- INSTRUCTION SLIDE VIEWER MODAL --- */}
            {activeInstructionModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                    <BookOpen size={18} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 block">
                                        {lang === 'sv' ? "Genomgång" : "Instruction Walkthrough"}
                                    </span>
                                    <h3 className="text-base font-black text-[var(--text-main)] truncate">
                                        {activeInstructionModal.sheetTitle}
                                    </h3>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setActiveInstructionModal(null)}
                                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-xl transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Slide Body */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col items-center justify-center bg-[var(--bg-card)]">
                            {activeInstructionModal.slideData ? (
                                <div className="w-full max-w-2xl space-y-6">
                                    {activeInstructionModal.slideData.title && (
                                        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] text-center">
                                            <MathDisplay content={activeInstructionModal.slideData.title} />
                                        </h2>
                                    )}

                                    {activeInstructionModal.slideData.latex && (
                                        <div className="w-full bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl p-6 flex justify-center text-2xl sm:text-3xl font-serif text-indigo-600">
                                            <MathDisplay content={`$$${activeInstructionModal.slideData.latex}$$`} />
                                        </div>
                                    )}

                                    {activeInstructionModal.slideData.notes && (
                                        <p className="text-sm font-medium text-[var(--text-muted)] text-center leading-relaxed">
                                            {activeInstructionModal.slideData.notes}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400 font-bold text-sm">
                                    {lang === 'sv' ? "Ingen förhandsvisning tillgänglig." : "No slide preview available."}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer Action */}
                        <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-surface)] flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={() => setActiveInstructionModal(null)}
                                className="px-6 py-3 bg-[var(--brand-solid)] text-white rounded-xl font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-md cursor-pointer"
                            >
                                {lang === 'sv' ? "Klar! Gå till övning ➡" : "Done! Go to practice ➡"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;