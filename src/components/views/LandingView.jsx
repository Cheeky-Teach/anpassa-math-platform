import React, { useState } from 'react';
import { 
  ChevronRight, Play, Zap, FileText, Grid3X3, Users, 
  ShieldCheck, Smartphone, Globe, ArrowRight, CheckCircle2,
  Sparkles, Layers, Clock
} from 'lucide-react';

export default function LandingView({ onTeacherLogin, onStudentJoin, lang: initialLang = 'sv' }) {
    const [lang, setLang] = useState(initialLang);

    // --- LOCALIZATION DICTIONARY ---
    const TEXT = {
        sv: {
            // Hero
            hero_badge: "Matematik på dina villkor",
            hero_title: "Rätt stöd. Direkt.",
            hero_subtitle: "Anpassa är länken mellan genomgång och framgång. Vi ersätter inte din mattebok – vi ser till att du lyckas i den.",
            btn_student: "Elev: Gå med nu",
            btn_teacher: "Lärare & Föräldrar",
            
            // Philosophy Section
            phi_title: "Överbrygga gapet",
            phi_text: "Läroböcker går ofta för snabbt från exempel till svåra uppgifter. Anpassa erbjuder obegränsat med övningsuppgifter på exakt rätt nivå, så att du kan nöta just det där svåra steget tills det sitter innan svårighetsgraden trappas upp.",
            
            // Feature Cards
            feat_worksheet_h: "Spara timmar på planering",
            feat_worksheet_p: "Designa professionella arbetsblad på sekunder. Ingen mer manuell formatering – välj område, svårighetsgrad och skriv ut. Det är flexibilitet som märks.",
            
            feat_donow_h: "Maximera lektionstiden",
            feat_donow_p: "Starta varje lektion med en dynamisk Do Now-grid. Projicera anpassade uppgifter som aktiverar klassen direkt och ger dig utrymme att stötta där det behövs mest.",
            
            feat_live_h: "Instant Feedback i Live Room",
            feat_live_p: "Puffa ut dina curerade arbetsblad digitalt. Se klassens framsteg i realtid genom en heatmap som visar exakt vilka steg som orsakar problem – helt anonymt för eleverna.",
            
            // Value Props
            prop_limitless_h: "Gränslös mängdträning",
            prop_limitless_p: "Få tillgång till tusentals smarta problem skapade för att träna specifika delmoment. Öva på enstegsekvationer eller procentregler tills osäkerhet blir självförtroende.",
            
            prop_free_h: "Alltid gratis för elever",
            prop_free_p: "Kunskap ska inte kosta extra. Elever använder Anpassa helt gratis med en klasskod från sin lärare eller förälder – oavsett hur stor klassen är.",
            
            prop_universal_h: "För alla som coachar",
            prop_universal_p: "Anpassa är inte bara för skolan. Föräldrar och handledare kan låsa upp Question Studio för att skapa skräddarsydd digital träning eller hemläxor hemma.",
            
            footer_motto: "Anpassa Math Platform — Designad för mastery."
        },
        en: {
            // Hero
            hero_badge: "Math on your terms",
            hero_title: "Right support. Instantly.",
            hero_subtitle: "Anpassa is the bridge between instruction and mastery. We don’t replace your current curriculum; we ensure you succeed in it.",
            btn_student: "Student: Join Now",
            btn_teacher: "Teachers & Parents",

            // Philosophy Section
            phi_title: "Bridge the Gap",
            phi_text: "Textbooks often jump too quickly from instruction to complex problems. Anpassa provides limitless practice for specific skills, allowing students to master the one step causing difficulty before moving on.",

            // Feature Cards
            feat_worksheet_h: "Save Hours of Prep",
            feat_worksheet_p: "Design professional worksheets in seconds. No more manual formatting – just select your topics and levels and print. True classroom efficiency.",

            feat_donow_h: "Own the First 10 Minutes",
            feat_donow_p: "Start every lesson with a dynamic Do Now grid. Project targeted tasks that activate the class instantly, giving you time to support where it's needed.",

            feat_live_h: "Instant Feedback: Live Room",
            feat_live_p: "Push your curated worksheets to student devices digitally. Watch class progress in real-time via a heatmap that shows exactly which steps cause struggle.",

            // Value Props
            prop_limitless_h: "Limitless Focused Practice",
            prop_limitless_p: "Access thousands of smart problems designed to target specific steps. Practice until confusion turns into confidence.",

            prop_free_h: "Always Free for Students",
            prop_free_p: "Knowledge shouldn't have a per-student cost. Students use Anpassa for free with a code from their teacher or parent.",

            prop_universal_h: "For Every Coach",
            prop_universal_p: "Anpassa isn't just for schools. Parents and tutors can unlock the Question Studio to create custom digital practice or homework sessions at home.",

            footer_motto: "Anpassa Math Platform — Built for mastery."
        }
    };

    const t = TEXT[lang];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            
            {/* --- NAVIGATION BAR --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter italic text-slate-900">ANPASSA</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')}
                            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2"
                        >
                            <Globe size={14} /> {lang === 'sv' ? 'English' : 'Svenska'}
                        </button>
                        <button 
                            onClick={onTeacherLogin}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                        >
                            {t.btn_teacher}
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="pt-40 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-indigo-100 animate-in fade-in slide-in-from-bottom-2">
                        <Zap size={12} fill="currentColor" /> {t.hero_badge}
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {t.hero_title}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                        {t.hero_subtitle}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <button 
                            onClick={() => onStudentJoin('practice')}
                            className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-lg uppercase tracking-tight shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:scale-105 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            {t.btn_student} <ArrowRight />
                        </button>
                        <button 
                            onClick={() => onStudentJoin('live')}
                            className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border-2 border-slate-200 rounded-full font-black text-lg uppercase tracking-tight hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                        >
                            Digital Live <Users size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* --- PHILOSOPHY: THE BRIDGE --- */}
            <section className="py-24 bg-indigo-600 text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 uppercase italic">
                            {t.phi_title}
                        </h2>
                        <p className="text-xl text-indigo-100 leading-relaxed font-medium">
                            {t.phi_text}
                        </p>
                    </div>
                    {/* Visual Mockup: The Bridge Concept */}
                    <div className="relative bg-white/10 backdrop-blur-md p-8 rounded-[3rem] border border-white/10 shadow-2xl">
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl p-4 text-slate-900 font-bold flex items-center gap-4 opacity-40 grayscale">
                                <div className="w-8 h-8 rounded-lg bg-slate-100" /> Matteboken: Sida 42 (Exempel)
                            </div>
                            <div className="bg-white rounded-2xl p-6 text-slate-900 font-bold flex items-center justify-between border-l-8 border-emerald-400 shadow-xl scale-105 translate-x-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><Sparkles size={20}/></div>
                                    <div>
                                        <div className="text-[10px] uppercase text-indigo-600 tracking-widest">Anpassa: Det saknade steget</div>
                                        <div>Limitless Focused Practice</div>
                                    </div>
                                </div>
                                <CheckCircle2 className="text-emerald-500" />
                            </div>
                            <div className="bg-white rounded-2xl p-4 text-slate-900 font-bold flex items-center gap-4 opacity-40 grayscale">
                                <div className="w-8 h-8 rounded-lg bg-slate-100" /> Matteboken: Sida 43 (Provuppgifter)
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-24" />
            </section>

            {/* --- CORE FEATURES --- */}
            <section className="py-32 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Worksheet Creator */}
                    <div className="group bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-4 uppercase">{t.feat_worksheet_h}</h3>
                        <p className="text-slate-500 leading-relaxed font-medium">{t.feat_worksheet_p}</p>
                    </div>

                    {/* Do Now Grid */}
                    <div className="group bg-slate-900 p-10 rounded-[3rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all">
                        <div className="w-16 h-16 bg-white/10 text-white rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <Grid3X3 size={32} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-4 uppercase text-white">{t.feat_donow_h}</h3>
                        <p className="text-slate-400 leading-relaxed font-medium">{t.feat_donow_p}</p>
                    </div>

                    {/* Live Room */}
                    <div className="group bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <Users size={32} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-4 uppercase">{t.feat_live_h}</h3>
                        <p className="text-slate-500 leading-relaxed font-medium">{t.feat_live_p}</p>
                    </div>
                </div>
            </section>

            {/* --- ADDITIONAL VALUE PROPS --- */}
            <section className="py-24 bg-slate-100 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        <div className="flex gap-6">
                            <div className="shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600"><Layers size={24}/></div>
                            <div>
                                <h4 className="font-black uppercase tracking-tight mb-2">{t.prop_limitless_h}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">{t.prop_limitless_p}</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-500"><ShieldCheck size={24}/></div>
                            <div>
                                <h4 className="font-black uppercase tracking-tight mb-2">{t.prop_free_h}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">{t.prop_free_p}</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-purple-600"><Smartphone size={24}/></div>
                            <div>
                                <h4 className="font-black uppercase tracking-tight mb-2">{t.prop_universal_h}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">{t.prop_universal_p}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-20 bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 grayscale opacity-50">
                        <Sparkles size={20} className="text-slate-900" />
                        <span className="font-black tracking-tighter italic text-slate-900 uppercase">Anpassa</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {t.footer_motto}
                    </p>
                    <div className="flex gap-6">
                        <button onClick={onTeacherLogin} className="text-xs font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">Logga in</button>
                        <button className="text-xs font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">Integritetspolicy</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}