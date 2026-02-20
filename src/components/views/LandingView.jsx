import React, { useState, useEffect, useRef } from 'react';
import { 
    Zap, FileText, Grid3X3, Users, Globe, ArrowRight, CheckCircle2,
    Sparkles, Layers, MousePointer2, HelpCircle, ShieldCheck, Smartphone,
    ChevronRight, BookOpen, Target, GraduationCap, PlayCircle, Pencil
} from 'lucide-react';
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents.jsx';

// Math Rendering Component
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
    return <div ref={containerRef} className={`math-content leading-relaxed text-inherit ${className}`} />;
};

export default function LandingView({ onTeacherLogin, onStudentJoin, lang: initialLang = 'sv' }) {
    const [lang, setLang] = useState(initialLang);
    const [activeTab, setActiveTab] = useState(0);
    const [revealedClueIdx, setRevealedClueIdx] = useState(-1);

    // SEPARATED CODE STATES
    const [liveCode, setLiveCode] = useState('');
    const [classCode, setClassCode] = useState('');

    useEffect(() => { setRevealedClueIdx(-1); }, [activeTab]);

    const SHOWCASE_ITEMS = [
        {
            title: { sv: "Funktioner & Grafer", en: "Functions & Graphs" },
            icon: <MousePointer2 size={20}/>,
            data: {
                description: lang === 'sv' ? "Bestäm linjens ekvation med trappstegsmetoden." : "Determine the line's equation using the staircase method.",
                latex: "y = kx + m",
                graph: { range: 6, gridStep: 1, labelStep: 2, lines: [{ slope: 2, intercept: 1, color: '#059669' }] },
                clues: [
                    { sv: "Identifiera linjens skärningspunkt med y-axeln. Den korsar vid 1, så m = 1.", en: "Identify y-intercept. m = 1.", latex: "m = 1" },
                    { sv: "Utgå från y-axeln och gå ett steg till höger.", en: "Move one step right.", latex: "Höger = 1" },
                    { sv: "Räkna uppåt för att träffa linjen igen. Här går vi upp 2 steg.", en: "Move 2 steps up.", latex: "k = 2" }
                ]
            }
        },
        {
            title: { sv: "Geometri & Volym", en: "Geometry & Volume" },
            icon: <Layers size={20}/>,
            data: {
                description: lang === 'sv' ? "Beräkna volymen av cylindern." : "Calculate the volume of the cylinder.",
                latex: "V = \\pi \\cdot r^2 \\cdot h",
                geometry: { type: "cylinder", labels: { r: "4", h: "10" } },
                clues: [
                    { sv: "Identifiera radien (r=4) och höjden (h=10).", en: "r=4, h=10", latex: "r=4, h=10" },
                    { sv: "Sätt in värdena i formeln.", en: "Insert into formula.", latex: "V = \\pi \\cdot 4^2 \\cdot 10" }
                ]
            }
        }
    ];

    const t = {
        sv: {
            hero_badge: "Matematik på dina villkor",
            hero_title: "Rätt stöd. Direkt.",
            hero_subtitle: "Anpassa är länken mellan genomgång och framgång. Välj din väg in i systemet nedan.",
            path_live_h: "Live-lektion",
            path_live_p: "Gå med i lärarens rum nu",
            path_practice_h: "Egen träning",
            path_practice_p: "Öva själv med en klasskod",
            btn_live: "Gå med",
            btn_practice: "Börja öva",
            btn_teacher: "Lärare & Föräldrar",
            phi_title: "Överbrygga gapet",
            phi_text: "Läroböcker går ofta för snabbt fram. Vi ger dig de saknade övningsstegen så att du kan nöta de svåra momenten tills de sitter.",
            bridge_step_1: "Teori & Genomgång",
            bridge_step_2: "Anpassa Träning",
            bridge_step_3: "Prov & Mål",
            demo_h: "Interaktiv Demo",
            hint_btn: "Visa nästa steg",
            hint_reset: "Återställ",
            feat_worksheet_h: "Spara planeringstid",
            feat_donow_h: "Aktivera klassen",
            feat_live_h: "Instant Feedback",
            footer_motto: "Anpassa Math Platform — Designad för mastery."
        },
        en: {
            hero_badge: "Math on your terms",
            hero_title: "Right support. Instantly.",
            hero_subtitle: "Anpassa is the bridge between lecture and success. Choose your entry path below.",
            path_live_h: "Live Session",
            path_live_p: "Join your teacher's room",
            path_practice_h: "Self Practice",
            path_practice_p: "Log in with your class code",
            btn_live: "Join Room",
            btn_practice: "Start Practice",
            btn_teacher: "Teachers & Parents",
            phi_title: "Bridge the Gap",
            phi_text: "Textbooks move too fast. We provide the missing steps so you can master difficult topics at your own pace.",
            bridge_step_1: "Theory & Lecture",
            bridge_step_2: "Anpassa Practice",
            bridge_step_3: "Exams & Goals",
            demo_h: "Interactive Demo",
            hint_btn: "Next Step",
            hint_reset: "Reset",
            feat_worksheet_h: "Save Prep Time",
            feat_donow_h: "Activate the Class",
            feat_live_h: "Instant Feedback",
            footer_motto: "Anpassa Math Platform — Built for mastery."
        }
    }[lang];

    const renderVisual = (itemData) => {
        if (itemData.graph) return <GraphCanvas data={itemData.graph} />;
        if (itemData.geometry) return <VolumeVisualization data={itemData.geometry} width={260} height={220} />;
        return null;
    };

    return (
        <div className="min-h-screen bg-[#f9fbf7] font-sans text-slate-800 selection:bg-emerald-100 overflow-x-hidden transition-colors duration-500">
            
            {/* --- NAVIGATION --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-emerald-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg"><Sparkles size={18} className="text-white" /></div>
                        <span className="text-xl font-black tracking-tighter italic text-emerald-800 uppercase">ANPASSA</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-2">
                            <Globe size={12} /> {lang === 'sv' ? 'English' : 'Svenska'}
                        </button>
                        <button onClick={onTeacherLogin} className="bg-emerald-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md">
                            {t.btn_teacher}
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO: EXPLICIT ENTRY CARDS --- */}
            <header className="pt-40 pb-24 px-6 text-center max-w-6xl mx-auto relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 border border-emerald-100">
                    <Zap size={14} className="fill-emerald-500" /> {t.hero_badge}
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6 text-slate-900 italic uppercase">
                    {t.hero_title}
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
                    {t.hero_subtitle}
                </p>
                
                {/* SPLIT ENTRANCE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Path 1: Live Room ID Entry */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-emerald-100 flex flex-col items-center text-center group hover:border-emerald-500 transition-all">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm"><Users size={28} /></div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">{t.path_live_h}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 leading-relaxed">{t.path_live_p}</p>
                        
                        <div className="w-full space-y-3">
                            <input 
                                type="text"
                                maxLength={6}
                                value={liveCode}
                                onChange={(e) => setLiveCode(e.target.value.toUpperCase())}
                                placeholder="ROOM-ID"
                                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-black text-2xl tracking-[0.3em] outline-none focus:border-emerald-500 focus:bg-white transition-all"
                            />
                            <button 
                                onClick={() => onStudentJoin('live', liveCode)} 
                                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-500 shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                            >
                                {t.btn_live}
                            </button>
                        </div>
                    </div>

                    {/* Path 2: Class Code Entry */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-amber-100 flex flex-col items-center text-center group hover:border-amber-500 transition-all">
                        <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm"><GraduationCap size={28} /></div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">{t.path_practice_h}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 leading-relaxed">{t.path_practice_p}</p>
                        
                        <div className="w-full space-y-3">
                            <input 
                                type="text"
                                maxLength={12}
                                value={classCode}
                                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                                placeholder="CLASS-CODE"
                                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-black text-2xl tracking-[0.1em] outline-none focus:border-amber-500 focus:bg-white transition-all"
                            />
                            <button 
                                onClick={() => onStudentJoin('practice', classCode)} 
                                className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-600 shadow-lg shadow-amber-200 active:scale-95 transition-all"
                            >
                                {t.btn_practice}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- BRIDGE SECTION: REFACTORED FOR READABILITY --- */}
            <section className="py-32 bg-emerald-50 border-y border-emerald-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-emerald-950 leading-tight">
                            {t.phi_title}
                        </h2>
                        <p className="text-lg text-emerald-800/60 leading-relaxed font-medium">
                            {t.phi_text}
                        </p>
                        <div className="bg-white/60 border border-emerald-200 px-4 py-2 rounded-xl inline-flex items-center gap-2 shadow-sm">
                            <CheckCircle2 className="text-emerald-600" size={16}/> 
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Mastery-driven inlärning</span>
                        </div>
                    </div>
                    
                    {/* Linear Progression Visual: Textbook -> Adapt -> Exam */}
                    <div className="flex flex-col gap-6 relative">
                        {/* Step 1: Textbook (Slate/Muted) */}
                        <div className="bg-white/70 p-6 rounded-[2rem] border border-emerald-100 shadow-sm flex items-center gap-5 opacity-40 grayscale scale-95">
                            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"><BookOpen size={24}/></div>
                            <span className="font-bold text-slate-500 uppercase tracking-widest text-sm">{t.bridge_step_1}</span>
                        </div>
                        
                        {/* Step 2: Anpassa (Active/Primary) */}
                        <div className="bg-white p-8 rounded-[3rem] border-4 border-emerald-500 shadow-2xl relative z-10 transform -rotate-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                        <Zap size={28} fill="currentColor"/>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Steget som saknas</div>
                                        <h4 className="text-2xl font-black uppercase text-slate-800 italic leading-none">{t.bridge_step_2}</h4>
                                    </div>
                                </div>
                                <CheckCircle2 size={36} className="text-emerald-500" />
                            </div>
                        </div>

                        {/* Step 3: Success (Slate/Muted) */}
                        <div className="bg-white/70 p-6 rounded-[2rem] border border-emerald-100 shadow-sm flex items-center gap-5 opacity-40 grayscale scale-95">
                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center"><Target size={24}/></div>
                            <span className="font-bold text-slate-500 uppercase tracking-widest text-sm">{t.bridge_step_3}</span>
                        </div>
                    </div>
                </div>
                
                {/* Decorative Background Circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/40 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
            </section>

            {/* --- INTERACTIVE DEMO --- */}
            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase italic text-slate-900">{t.demo_h}</h2>
                    <p className="text-slate-500 font-medium mb-16 max-w-2xl mx-auto">{t.demo_p}</p>
                    
                    <div className="flex flex-col lg:flex-row gap-10 items-stretch">
                        {/* Demo Tabs */}
                        <div className="w-full lg:w-[320px] space-y-3">
                            {SHOWCASE_ITEMS.map((item, idx) => (
                                <button key={idx} onClick={() => setActiveTab(idx)} className={`w-full p-6 rounded-[2.5rem] border-2 transition-all text-left flex items-center gap-5 ${activeTab === idx ? 'bg-emerald-900 border-emerald-900 text-white shadow-2xl scale-[1.02]' : 'bg-white border-emerald-50 hover:border-emerald-200 text-slate-600'}`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTab === idx ? 'bg-emerald-700 shadow-inner' : 'bg-emerald-50 text-emerald-600'}`}>{item.icon}</div>
                                    <h4 className="font-black uppercase tracking-tight text-xs leading-none">{item.title[lang]}</h4>
                                </button>
                            ))}
                        </div>

                        {/* Demo Workbench */}
                        <div className="flex-1 bg-white rounded-[4rem] border border-emerald-100 p-12 flex flex-col items-center shadow-xl relative">
                            <div className="w-full flex justify-center mb-12 min-h-[280px] items-center">
                                {renderVisual(SHOWCASE_ITEMS[activeTab].data)}
                            </div>
                            <div className="text-center mb-10 space-y-4">
                                <MathDisplay content={SHOWCASE_ITEMS[activeTab].data.description} className="text-2xl font-bold text-slate-800 leading-relaxed px-6" />
                                {SHOWCASE_ITEMS[activeTab].data.latex && <div className="text-4xl text-emerald-600 font-serif leading-none"><MathDisplay content={`$$${SHOWCASE_ITEMS[activeTab].data.latex}$$`} /></div>}
                            </div>
                            
                            {/* Animated Clue Container */}
                            <div className="w-full max-w-lg space-y-4 mb-12">
                                {SHOWCASE_ITEMS[activeTab].data.clues.map((clue, cIdx) => (
                                    cIdx <= revealedClueIdx && (
                                        <div key={cIdx} className="bg-[#f9fbf7] p-5 rounded-3xl border border-emerald-100 shadow-sm animate-in slide-in-from-left-6 duration-500 flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-black text-xs shadow-md">{cIdx + 1}</div>
                                            <div className="text-left">
                                                <div className="text-sm font-bold text-slate-600 mb-2 leading-relaxed">{clue[lang]}</div>
                                                {clue.latex && <div className="text-lg text-emerald-700 font-black"><MathDisplay content={`$${clue.latex}$`} /></div>}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                            
                            <button onClick={() => revealedClueIdx < SHOWCASE_ITEMS[activeTab].data.clues.length - 1 ? setRevealedClueIdx(v => v + 1) : setRevealedClueIdx(-1)} className="px-12 py-6 bg-orange-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-orange-600 shadow-xl shadow-orange-900/20 active:scale-95 transition-all">
                                {revealedClueIdx < SHOWCASE_ITEMS[activeTab].data.clues.length - 1 ? t.hint_btn : t.hint_reset}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURE HIGHLIGHTS --- */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-emerald-100 shadow-sm hover:shadow-2xl transition-all group">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><FileText size={28} /></div>
                        <h3 className="text-2xl font-black tracking-tighter mb-4 uppercase italic text-emerald-900 leading-tight">{t.feat_worksheet_h}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">Designa professionella arbetsblad på sekunder. Ingen mer manuell formatering.</p>
                    </div>
                    <div className="bg-emerald-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform"><Grid3X3 size={28} /></div>
                        <h3 className="text-2xl font-black tracking-tighter mb-4 uppercase italic text-white leading-tight">{t.feat_donow_h}</h3>
                        <p className="text-emerald-100/60 font-medium leading-relaxed">Dynamiska grids som aktiverar klassen direkt med relevanta uppgifter.</p>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] border border-emerald-100 shadow-sm hover:shadow-2xl transition-all group">
                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><Users size={28} /></div>
                        <h3 className="text-2xl font-black tracking-tighter mb-4 uppercase italic text-orange-900 leading-tight">{t.feat_live_h}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">Puffa ut uppgifter digitalt. Se klassens framsteg i realtid helt anonymt.</p>
                    </div>
                </div>
            </section>

            {/* --- FOOTER & VISUAL ANCHOR --- */}
            <footer className="pt-32 pb-24 text-center px-6 relative">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-10 relative z-10">
                    <div className="flex items-center gap-3 opacity-20">
                        <Sparkles size={24} className="text-emerald-600" />
                        <span className="font-black tracking-tighter italic uppercase text-xl text-slate-400">Anpassa</span>
                    </div>
                    <button onClick={onTeacherLogin} className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-700 transition-all shadow-xl">
                        {t.btn_teacher}
                    </button>
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.4em]">{t.footer_motto}</p>
                </div>

                {/* VISUAL ANCHOR: THE SVG WAVE */}
                <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none z-0">
                    <svg className="relative block w-full h-[300px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,1.13V120H0Z" className="fill-emerald-100/40"></path>
                    </svg>
                </div>
            </footer>
        </div>
    );
}