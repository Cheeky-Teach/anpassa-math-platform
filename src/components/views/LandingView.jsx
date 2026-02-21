import React, { useState, useEffect, useRef } from 'react';
import { 
    Zap, FileText, Grid3X3, Users, Globe, ArrowRight, CheckCircle2,
    Sparkles, Layers, MousePointer2, HelpCircle, ShieldCheck, Smartphone,
    ChevronRight, BookOpen, Target, GraduationCap, PlayCircle, Pencil,
    Monitor, Signal, Check, X
} from 'lucide-react';
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents.jsx';

// --- MATH RENDERING ENGINE ---
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

// --- MOCK COMPONENTS FOR LIVE SECTION ---

const TeacherLiveMock = () => (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden transform hover:-rotate-1 transition-transform">
        <div className="bg-slate-900 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Live Monitor</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">32 Elever Anslutna</span>
        </div>
        <div className="p-4 grid grid-cols-4 sm:grid-cols-8 gap-2">
            {[...Array(24)].map((_, i) => (
                <div key={i} className={`h-8 rounded-lg flex items-center justify-center ${
                    i % 5 === 0 ? 'bg-rose-500 shadow-sm shadow-rose-200' : 
                    i % 3 === 0 ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 
                    'bg-slate-100'
                }`}>
                    {i % 5 === 0 && <X size={14} className="text-white" />}
                    {i % 3 === 0 && i % 5 !== 0 && <Check size={14} className="text-white" />}
                </div>
            ))}
        </div>
        <div className="bg-emerald-50 p-3 text-center border-t border-emerald-100 flex justify-center gap-6">
            <div className="text-[9px] font-black text-emerald-800 uppercase">Träffsäkerhet: 82%</div>
            <div className="text-[9px] font-black text-rose-800 uppercase">Hjälp behövs: 4 st</div>
        </div>
    </div>
);

const StudentLiveMock = () => (
    <div className="w-[260px] bg-white rounded-[3rem] border-[10px] border-slate-900 shadow-2xl overflow-hidden relative transform rotate-2">
        <div className="h-6 bg-slate-900 flex justify-center items-end pb-1">
            <div className="w-12 h-1 bg-slate-800 rounded-full" />
        </div>
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <Signal size={16} className="text-emerald-500" />
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest">Ansluten</div>
            </div>
            <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uppgift 4</p>
                <MathDisplay content="Bestäm basen $b$ om arean är $24 \text{ cm}^2$." className="text-sm font-bold text-slate-800" />
            </div>
            <div className="h-24 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center">
                <GeometryVisual type="triangle" labels={{ b: "b", h: "8" }} width={120} height={80} />
            </div>
            <div className="space-y-3">
                <div className="w-full h-10 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 flex items-center text-xs font-bold text-slate-400">Skriv svar...</div>
                <div className="w-full h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-200">Skicka</div>
            </div>
        </div>
    </div>
);

export default function LandingView({ onTeacherLogin, onStudentJoin, lang: initialLang = 'sv' }) {
    const [lang, setLang] = useState(initialLang);
    const [activeTab, setActiveTab] = useState(0);
    const [revealedClueIdx, setRevealedClueIdx] = useState(-1);
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
                    { sv: "Identifiera linjens skärningspunkt med y-axeln (m = 1).", en: "Identify y-intercept (m = 1).", latex: "m = 1" },
                    { sv: "Utgå från y-axeln och gå ett steg höger.", en: "Move one step right.", latex: "Höger = 1" },
                    { sv: "Räkna uppåt för att träffa linjen igen (k = 2).", en: "Move 2 steps up (k = 2).", latex: "k = 2" }
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
                    // UPDATED: Substitution clue
                    { sv: "Sätt in värdena i formeln för cylinderns volym.", en: "Insert values into formula.", latex: "V = \\pi \\cdot 4^2 \\cdot 10" },
                    // UPDATED: Final answer clue
                    { sv: "Beräkna resultatet. Avrunda till en decimal.", en: "Calculate result. Round to one decimal.", latex: "V \\approx 502,7 \\text{ cm}^3" }
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
            live_h: "Synkroniserat Lärande",
            live_p: "I ett Live-rum ser läraren klassens framsteg i realtid medan eleverna arbetar på egna enheter.",
            demo_h: "Interaktiv Demo",
            demo_p: "Se hur vi stegar fram lösningar för att bygga förståelse.",
            hint_btn: "Visa nästa steg",
            hint_reset: "Återställ",
            feat_worksheet_h: "Spara planeringstid",
            feat_donow_h: "Aktivera klassen",
            feat_live_h: "Live Lektion",
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
            live_h: "Synchronized Learning",
            live_p: "In a Live Room, teachers track class progress in real-time while students solve tasks on their devices.",
            demo_h: "Interactive Demo",
            demo_p: "See how we break down solutions step-by-step to build mastery.",
            hint_btn: "Next Step",
            hint_reset: "Reset",
            feat_worksheet_h: "Save Prep Time",
            feat_donow_h: "Activate the Class",
            feat_live_h: "Live Lesson",
            footer_motto: "Anpassa Math Platform — Built for mastery."
        }
    }[lang];

    const renderVisual = (itemData) => {
        if (itemData.graph) return <GraphCanvas data={itemData.graph} />;
        if (itemData.geometry) return <VolumeVisualization data={itemData.geometry} width={220} height={180} />;
        return null;
    };

    return (
        <div className="min-h-screen bg-[#f9fbf7] font-sans text-slate-800 selection:bg-emerald-100 overflow-x-hidden transition-colors duration-500">
            
            {/* --- 1. NAVIGATION --- */}
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

            {/* --- 2. HERO SECTION --- */}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-emerald-100 flex flex-col items-center text-center group hover:border-emerald-500 transition-all">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm"><Users size={28} /></div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">{t.path_live_h}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 leading-relaxed">{t.path_live_p}</p>
                        <div className="w-full space-y-3">
                            <input type="text" maxLength={6} value={liveCode} onChange={(e) => setLiveCode(e.target.value.toUpperCase())} placeholder="ROOM-ID" className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-black text-2xl tracking-[0.3em] outline-none focus:border-emerald-500 focus:bg-white transition-all" />
                            <button onClick={() => onStudentJoin('live', liveCode)} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-500 shadow-lg active:scale-95 transition-all">{t.btn_live}</button>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-amber-100 flex flex-col items-center text-center group hover:border-amber-500 transition-all">
                        <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm"><GraduationCap size={28} /></div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">{t.path_practice_h}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 leading-relaxed">{t.path_practice_p}</p>
                        <div className="w-full space-y-3">
                            <input type="text" maxLength={12} value={classCode} onChange={(e) => setClassCode(e.target.value.toUpperCase())} placeholder="CLASS-CODE" className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-black text-2xl tracking-[0.1em] outline-none focus:border-amber-500 focus:bg-white transition-all" />
                            <button onClick={() => onStudentJoin('practice', classCode)} className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-600 shadow-lg active:scale-95 transition-all">{t.btn_practice}</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- 3. BRIDGING THE GAP --- */}
            <section className="py-32 bg-emerald-50 border-y border-emerald-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-emerald-950 leading-tight">{t.phi_title}</h2>
                        <p className="text-lg text-emerald-800/60 leading-relaxed font-medium">{t.phi_text}</p>
                        <div className="bg-white/60 border border-emerald-200 px-4 py-2 rounded-xl inline-flex items-center gap-2 shadow-sm">
                            <CheckCircle2 className="text-emerald-600" size={16}/> 
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Mastery-driven inlärning</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 relative">
                        <div className="bg-white/70 p-6 rounded-[2rem] border border-emerald-100 shadow-sm flex items-center gap-5 opacity-40 grayscale scale-95">
                            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"><BookOpen size={24}/></div>
                            <span className="font-bold text-slate-500 uppercase tracking-widest text-sm">{t.bridge_step_1}</span>
                        </div>
                        <div className="bg-white p-8 rounded-[3rem] border-4 border-emerald-50 shadow-2xl relative z-10 transform -rotate-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200"><Zap size={28} fill="currentColor"/></div>
                                    <div>
                                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Steget som saknas</div>
                                        <h4 className="text-2xl font-black uppercase text-slate-800 italic leading-none">{t.bridge_step_2}</h4>
                                    </div>
                                </div>
                                <CheckCircle2 size={36} className="text-emerald-500" />
                            </div>
                        </div>
                        <div className="bg-white/70 p-6 rounded-[2rem] border border-emerald-100 shadow-sm flex items-center gap-5 opacity-40 grayscale scale-95">
                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center"><Target size={24}/></div>
                            <span className="font-bold text-slate-500 uppercase tracking-widest text-sm">{t.bridge_step_3}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 4. LIVE SESSION EXAMPLE --- */}
            <section className="py-32 px-6 bg-white border-b border-emerald-50">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="flex flex-col sm:flex-row items-center gap-8 justify-center lg:justify-start">
                        <StudentLiveMock />
                        <div className="hidden sm:block">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                                <ArrowRight size={24} />
                            </div>
                        </div>
                        <div className="w-full max-w-sm lg:hidden">
                            <TeacherLiveMock />
                        </div>
                    </div>
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-slate-900 leading-tight">{t.live_h}</h2>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">{t.live_p}</p>
                        <div className="hidden lg:block">
                            <TeacherLiveMock />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 5. INTERACTIVE DEMO (SCALED DOWN) --- */}
            <section className="py-32 px-6 bg-[#f9fbf7]">
                <div className="max-w-4xl mx-auto"> 
                    <div className="text-center mb-12 space-y-4">
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900">{t.demo_h}</h2>
                        <p className="text-slate-500 text-sm font-medium max-w-xl mx-auto">{t.demo_p}</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 items-stretch">
                        <div className="w-full md:w-[240px] space-y-2">
                            {SHOWCASE_ITEMS.map((item, idx) => (
                                <button key={idx} onClick={() => setActiveTab(idx)} className={`w-full p-4 rounded-[2rem] border-2 transition-all text-left flex items-center gap-4 ${activeTab === idx ? 'bg-emerald-900 border-emerald-900 text-white shadow-lg' : 'bg-white border-emerald-50 hover:border-emerald-200 text-slate-600'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === idx ? 'bg-emerald-700' : 'bg-emerald-50 text-emerald-600'}`}>{item.icon}</div>
                                    <h4 className="font-black uppercase tracking-tight text-[10px] leading-none">{item.title[lang]}</h4>
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 bg-white rounded-[3rem] border border-emerald-100 p-8 flex flex-col items-center shadow-md relative overflow-hidden">
                            <div className="w-full flex justify-center mb-8 min-h-[220px] items-center">
                                {renderVisual(SHOWCASE_ITEMS[activeTab].data)}
                            </div>
                            <div className="text-center mb-6 space-y-2">
                                <MathDisplay content={SHOWCASE_ITEMS[activeTab].data.description} className="text-lg font-bold text-slate-800 leading-tight" />
                                {SHOWCASE_ITEMS[activeTab].data.latex && <div className="text-2xl text-emerald-600 font-serif"><MathDisplay content={`$$${SHOWCASE_ITEMS[activeTab].data.latex}$$`} /></div>}
                            </div>
                            <div className="w-full max-w-md space-y-3 mb-8">
                                {SHOWCASE_ITEMS[activeTab].data.clues.map((clue, cIdx) => (
                                    cIdx <= revealedClueIdx && (
                                        <div key={cIdx} className="bg-[#f9fbf7] p-4 rounded-2xl border border-emerald-50 animate-in slide-in-from-left-4 flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-black text-[10px]">{cIdx + 1}</div>
                                            <div className="text-left flex-1">
                                                <div className="text-[11px] font-bold text-slate-600 leading-relaxed">{clue[lang]}</div>
                                                {clue.latex && <MathDisplay content={`$${clue.latex}$`} className="text-sm font-black text-emerald-700 mt-1" />}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                            <button onClick={() => revealedClueIdx < SHOWCASE_ITEMS[activeTab].data.clues.length - 1 ? setRevealedClueIdx(v => v + 1) : setRevealedClueIdx(-1)} className="px-8 py-4 bg-orange-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 active:scale-95 transition-all">
                                {revealedClueIdx < SHOWCASE_ITEMS[activeTab].data.clues.length - 1 ? t.hint_btn : t.hint_reset}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 6. FEATURE HIGHLIGHTS (THE 3 CARDS) --- */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-emerald-100 shadow-sm hover:shadow-2xl transition-all group">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm"><FileText size={28} /></div>
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
                        <p className="text-slate-500 font-medium leading-relaxed">Börja en live lektion, bjud in eleverna, och se exakt vad de kan eller det de behöver öva mer på.</p>
                    </div>
                </div>
            </section>

            {/* --- 7. FOOTER --- */}
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
                <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none z-0">
                    <svg className="relative block w-full h-[300px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,1.13V120H0Z" className="fill-emerald-100/40"></path>
                    </svg>
                </div>
            </footer>
        </div>
    );
}