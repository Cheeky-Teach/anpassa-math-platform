import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  Zap,
  Play, 
  Clock, 
  Book, 
  Map, 
  Info, 
  Award, 
  BarChart3, 
  PenTool, 
  Calendar,
  Sparkles
} from 'lucide-react';

// Using the import path from your source code
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '@/constants/localization';

const COLOR_VARIANTS = {
    pink: {
        bgLight: 'bg-pink-50', bgDark: 'bg-pink-500', border: 'border-pink-100', text: 'text-pink-700', ring: 'ring-pink-500', borderSolid: 'border-pink-500', icon: 'text-pink-500'
    },
    indigo: {
        bgLight: 'bg-indigo-50', bgDark: 'bg-indigo-500', border: 'border-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-500', borderSolid: 'border-indigo-500', icon: 'text-indigo-500'
    },
    emerald: {
        bgLight: 'bg-emerald-50', bgDark: 'bg-emerald-500', border: 'border-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-500', borderSolid: 'border-emerald-500', icon: 'text-emerald-500'
    },
    purple: {
        bgLight: 'bg-purple-50', bgDark: 'bg-purple-500', border: 'border-purple-100', text: 'text-purple-700', ring: 'ring-purple-500', borderSolid: 'border-purple-500', icon: 'text-purple-500'
    },
    yellow: {
        bgLight: 'bg-yellow-50', bgDark: 'bg-yellow-500', border: 'border-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-500', borderSolid: 'border-yellow-500', icon: 'text-yellow-500'
    }
};

const Dashboard = ({ 
    lang = 'sv', 
    selectedTopic, 
    selectedLevel, 
    onSelect, 
    onStart, 
    timerSettings, 
    toggleTimer, 
    resetTimer, 
    ui, 
    onLgrOpen, 
    onContentOpen,
    onAboutOpen,
    onStatsOpen,
    onStudioOpen,
    userRole = 'student',
    assignments = [],
    recommended = []
}) => {
    // Defaulting to algebra being expanded for a smooth landing
    const [expandedCategory, setExpandedCategory] = useState('algebra');

    // --- INTERNAL TRANSLATIONS ---
    const TEXT = {
        sv: {
            welcome_badge: "Välkommen till Anpassa",
            welcome_title: "Dags att bemästra matematiken.",
            current_assignments: "Aktuella Uppgifter",
            assignment_status: (count) => `Du har ${count} aktiva uppdrag från din lärare.`,
            daily_tip: "Dagens Tips",
            tip_body: "Slå på timern för att hjälpa dig skapa en bra rutin att öva 15 minuter och sen ta en kort paus!",
            timer_title: "Timer",
            timer_off: "Timer av",
            timer_reset: "Nollställ",
            studio_section: "Anpassa Studion",
            studio_title: "Question Studio",
            studio_desc: "Skapa Do Now & Arbetsblad",
            stats_title: "Dagens statistik",
            stats_desc: "Kolla hur det gick idag",
            curriculum_title: "Kursmaterial",
            topics_count: (count) => `${count} delmoment tillgängliga`,
            select_level: "Välj nivå",
            level_label: "Nivå",
            start_btn: "Börja öva",
            resources: "Resurser",
            content_map: "Innehållskarta",
            lgr_link: "LGR 22 Koppling",
            about_link: "Om skaparen",
            brand_motto: "Rätt stöd. Direkt."
        },
        en: {
            welcome_badge: "Welcome to Adapt",
            welcome_title: "Time to master mathematics.",
            current_assignments: "Current Assignments",
            assignment_status: (count) => `You have ${count} active assignments from your teacher.`,
            daily_tip: "Daily Tip",
            tip_body: "Turn on the timer to help you create a routine of practicing for 15 minutes and then taking a short break!",
            timer_title: "Timer",
            timer_off: "Timer off",
            timer_reset: "Reset",
            studio_section: "Adapt Studio",
            studio_title: "Question Studio",
            studio_desc: "Create Do Now & Worksheets",
            stats_title: "Your stats today",
            stats_desc: "See your progress",
            curriculum_title: "Course Material",
            topics_count: (count) => `${count} topics available`,
            select_level: "Select Level",
            level_label: "Level",
            start_btn: "Start practicing",
            resources: "Resources",
            content_map: "Content Map",
            lgr_link: "Curriculum Links",
            about_link: "About Creator",
            brand_motto: "Right support. Instantly."
        }
    };

    const t = TEXT[lang] || TEXT.sv;

    const getStyles = (category) => {
        const color = category.color || 'emerald';
        return COLOR_VARIANTS[color] || COLOR_VARIANTS.emerald;
    };

    return (
        <div className="max-w-5xl mx-auto w-full p-4 fade-in flex flex-col min-h-screen pb-32">
            
            {/* --- LANDING PANE / HERO SECTION --- */}
            <header className="mb-12">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                                {t.welcome_badge}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">
                            {t.welcome_title}
                        </h1>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            {assignments.length > 0 ? (
                                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:bg-white/15 transition-all cursor-pointer group">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold flex items-center gap-2"><Calendar size={18}/> {t.current_assignments}</h3>
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                                    </div>
                                    <p className="text-sm text-indigo-100">{t.assignment_status(assignments.length)}</p>
                                </div>
                            ) : (
                                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                                    <h3 className="font-bold flex items-center gap-2 mb-2"><Sparkles size={18}/> {t.daily_tip}</h3>
                                    <p className="text-sm text-indigo-100">{t.tip_body}</p>
                                </div>
                            )}

                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold flex items-center gap-2 mb-1"><Clock size={18}/> {t.timer_title}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <select
                                            value={timerSettings.duration / 60}
                                            onChange={(e) => toggleTimer(Number(e.target.value))}
                                            className="bg-slate-900/50 border-none text-white py-1 px-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-white/50"
                                        >
                                            <option value="0">{t.timer_off}</option>
                                            {[5, 10, 15, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                                        </select>
                                        {timerSettings.duration > 0 && (
                                            <button onClick={resetTimer} className="text-[10px] uppercase font-black text-red-300 hover:text-white transition-colors">{t.timer_reset}</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            </header>

            {/* --- TEACHER COMMAND CENTER --- */}
            {userRole === 'teacher' && (
                <section className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-4 px-4">
                        <PenTool size={18} className="text-slate-400" />
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">{t.studio_section}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-4">
                        <button 
                            onClick={onStudioOpen}
                            className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-[2rem] hover:bg-indigo-600 transition-all shadow-xl group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <Zap size={24} fill="currentColor" />
                                </div>
                                <div className="text-left">
                                    <span className="block font-black text-lg">{t.studio_title}</span>
                                    <span className="text-xs text-slate-400 group-hover:text-indigo-100">{t.studio_desc}</span>
                                </div>
                            </div>
                            <ChevronRight size={20} />
                        </button>

                        <button 
                            onClick={onStatsOpen}
                            className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-indigo-500 transition-all shadow-sm group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <BarChart3 size={24} />
                                </div>
                                <div className="text-left">
                                    <span className="block font-black text-lg text-slate-800">{t.stats_title}</span>
                                    <span className="text-xs text-slate-500">{t.stats_desc}</span>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-300" />
                        </button>
                    </div>
                </section>
            )}

            {/* --- CURRICULUM GRID --- */}
            <div className="flex flex-col gap-6 mx-4">
                <div className="flex items-center gap-3 mb-2">
                    <Book size={18} className="text-slate-400" />
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">{t.curriculum_title}</h2>
                </div>

                {Object.entries(CATEGORIES).map(([catKey, category]) => {
                    const styles = getStyles(category);
                    const isExpanded = expandedCategory === catKey;
                    
                    return (
                        <div key={catKey} className={`bg-white rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${isExpanded ? `shadow-2xl ${styles.borderSolid}` : 'border-transparent shadow-sm hover:border-slate-200'}`}>
                            <button 
                                onClick={() => setExpandedCategory(isExpanded ? null : catKey)}
                                className={`w-full p-6 flex items-center justify-between text-left ${isExpanded ? styles.bgLight : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles.bgDark} text-white shadow-lg`}>
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-black text-slate-800 uppercase tracking-tight`}>{category.label[lang]}</h3>
                                        <p className="text-xs text-slate-500 font-medium">{t.topics_count(category.topics.length)}</p>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp size={24} className="text-slate-400" /> : <ChevronDown size={24} className="text-slate-400" />}
                            </button>
                            
                            <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100 p-6' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {category.topics.map(topic => (
                                        <div key={topic.id} className="bg-slate-50 rounded-3xl p-5 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all group">
                                            <div className="font-bold text-slate-800 mb-4 ml-1 flex items-center justify-between">
                                                {topic.label[lang]}
                                                <div className={`w-2 h-2 rounded-full ${styles.bgDark} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                            </div>
                                            <div className="relative">
                                                <select 
                                                    value={selectedTopic === topic.id ? selectedLevel : 0} 
                                                    onChange={(e) => onSelect(topic.id, Number(e.target.value))} 
                                                    className={`w-full p-3 pl-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none appearance-none cursor-pointer transition-all ${selectedTopic === topic.id ? `ring-4 ${styles.ring} border-transparent` : ''}`}
                                                >
                                                    <option value={0} disabled>{t.select_level}</option>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => {
                                                        if (!LEVEL_DESCRIPTIONS[topic.id]?.[lvl]) return null;
                                                        return (
                                                            <option key={lvl} value={lvl}>
                                                                {lang === 'sv' ? `Nivå ${lvl}` : `Level ${lvl}`} - {LEVEL_DESCRIPTIONS[topic.id]?.[lvl]?.[lang] || ""}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                                                    <ChevronDown size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- FIXED START ACTION BAR --- */}
            <div className={`fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-30 transition-all duration-500 ${selectedTopic ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <button 
                    onClick={onStart} 
                    className="px-12 py-5 rounded-full font-black text-xl shadow-[0_20px_50px_rgba(249,115,22,0.4)] bg-orange-500 text-white pointer-events-auto flex items-center gap-4 hover:scale-110 hover:bg-orange-600 active:scale-95 transition-all uppercase tracking-tighter"
                >
                    {t.start_btn} <Play fill="currentColor" size={20} />
                </button>
            </div>

            {/* --- RESOURCE FOOTER HUB --- */}
            <footer className="mt-20 py-12 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8 px-4 text-center md:text-left">
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.resources}</h4>
                    <div className="flex flex-col gap-2">
                        <button onClick={onContentOpen} className="flex items-center justify-center md:justify-start gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors">
                            <Map size={16} /> {t.content_map}
                        </button>
                        <button onClick={onLgrOpen} className="flex items-center justify-center md:justify-start gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors">
                            <Book size={16} /> {t.lgr_link}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Support</h4>
                    <div className="flex flex-col gap-2">
                        <button onClick={onAboutOpen} className="flex items-center justify-center md:justify-start gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors">
                            <Info size={16} /> {t.about_link}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end justify-center">
                    <h2 className="text-3xl font-black text-slate-200 tracking-tighter italic">
                        {lang === 'sv' ? 'ANPASSA' : 'ADAPT'}
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{t.brand_motto}</p>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;