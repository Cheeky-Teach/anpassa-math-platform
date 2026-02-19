import React, { useState, useEffect, useRef } from 'react';
import { 
    Zap, FileText, Grid3X3, Users, Globe, ArrowRight, CheckCircle2,
    Sparkles, Layers, MousePointer2, HelpCircle, ShieldCheck, Smartphone
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

    useEffect(() => { setRevealedClueIdx(-1); }, [activeTab]);

    const SHOWCASE_ITEMS = [
        {
            title: { sv: "Funktioner & Grafer", en: "Functions & Graphs" },
            icon: <MousePointer2 size={20}/>,
            data: {
                description: lang === 'sv' ? "Bestäm linjens ekvation med trappstegsmetoden." : "Determine the line's equation using the staircase method.",
                latex: "y = kx + m",
                graph: { 
                    range: 6,
                    gridStep: 1,
                    labelStep: 2,
                    lines: [{ slope: 2, intercept: 1, color: '#4f46e5' }]
                },
                clues: [
                    { sv: "Identifiera linjens skärningspunkt med y-axeln. Den korsar vid 1, så m = 1.", en: "Identify where the line crosses the y-axis. It crosses at 1, so m = 1.", latex: "m = 1" },
                    { sv: "Använd trappstegsmetoden: Utgå från y-axeln och gå ett steg (en ruta) till höger.", en: "Use the staircase method: Start from the y-axis and move one step (one grid unit) to the right.", latex: "Höger/Right = 1" },
                    { sv: "Räkna hur många rutor uppåt du behöver gå för att träffa linjen igen vid ett hörn i rutnätet. Här går vi upp 2 steg.", en: "Count how many squares up you need to go to intersect the line at a grid corner. Here, we go up 2 steps.", latex: "Upp = 2" },
                    { sv: "Nu delar du för att räkna ut k-värdet. Antal rutor uppåt delat på antal rutor åt högern.", en: "Now you divide to calculate the slope. Number of squares up divided by number of squares to the right", latex: "k = 2 upp / 1 höger = 2" },
                    { sv: "Sätt ihop värdena till linjens ekvation.", en: "Combine the values into the equation of the line.", latex: "y = 2x + 1" }
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
                    { sv: "Identifiera radien (r=4) och höjden (h=10) från bilden.", en: "Identify radius (r=4) and height (h=10) from the image.", latex: "r=4, h=10" },
                    { sv: "Sätt in värdena i formeln.", en: "Insert the values into the formula.", latex: "V = \\pi \\cdot 4^2 \\cdot 10" }
                ]
            }
        }
    ];

    const t = {
        sv: {
            hero_badge: "Matematik på dina villkor",
            hero_title: "Rätt stöd. Direkt.",
            hero_subtitle: "Anpassa är länken mellan genomgång och framgång. Vi ersätter inte din mattebok – vi ser till att du lyckas i den.",
            btn_live: "Gå med i Live Room",
            btn_practice: "Gå med i klass",
            btn_teacher: "Lärare & Föräldrar",
            phi_title: "Överbrygga gapet",
            phi_text: "Läroböcker går ofta för snabbt fram. Vi ger dig de saknade övningsstegen så att du kan nöta just det där svåra momentet tills det sitter.",
            demo_h: "Interaktiv Demo",
            demo_p: "Varje uppgift har pedagogiska ledtrådar som guidar dig steg-för-steg. Testa själv!",
            hint_btn: "Visa nästa steg",
            hint_reset: "Återställ",
            feat_worksheet_h: "Spara timmar på planering",
            feat_worksheet_p: "Designa professionella arbetsblad på sekunder. Ingen mer manuell formatering – välj område och skriv ut.",
            feat_donow_h: "Maximera lektionstiden",
            feat_donow_p: "Starta varje lektion med en dynamisk Do Now-grid som aktiverar klassen direkt.",
            feat_live_h: "Instant Feedback i Live Room",
            feat_live_p: "Puffa ut arbetsblad digitalt. Se klassens framsteg i realtid helt anonymt.",
            prop_limitless_h: "Gränslös mängdträning",
            prop_limitless_p: "Tusentals smarta problem skapade för att träna specifika delmoment.",
            prop_free_h: "Alltid gratis för elever",
            prop_free_p: "Kunskap ska inte kosta extra. Elever övar gratis med en klasskod.",
            prop_universal_h: "För alla som coachar",
            prop_universal_p: "Föräldrar och handledare kan skapa skräddarsydd digital träning hemma.",
            footer_motto: "Anpassa Math Platform — Designad för mastery."
        },
        en: {
            hero_badge: "Math on your terms",
            hero_title: "Right support. Instantly.",
            hero_subtitle: "Anpassa is the bridge between instruction and mastery. We don’t replace your current curriculum; we ensure you succeed in it.",
            btn_live: "Join Live Session",
            btn_practice: "Join a Class",
            btn_teacher: "Teachers & Parents",
            phi_title: "Bridge the Gap",
            phi_text: "Textbooks often move too fast. We provide the missing practice steps so you can master the difficult part before moving on.",
            demo_h: "Interactive Demo",
            demo_p: "Every task features pedagogical clues to guide you step-by-step. Try it yourself!",
            hint_btn: "Next Step",
            hint_reset: "Reset",
            feat_worksheet_h: "Save Hours of Prep",
            feat_worksheet_p: "Design professional worksheets in seconds. No more manual formatting – just select and print.",
            feat_donow_h: "Own the First 10 Minutes",
            feat_donow_p: "Start every lesson with a dynamic Do Now grid that activates the class instantly.",
            feat_live_h: "Instant Feedback: Live Room",
            feat_live_p: "Push worksheets to student devices. Watch progress in real-time anonymously.",
            prop_limitless_h: "Limitless Focused Practice",
            prop_limitless_p: "Thousands of smart problems designed to target specific steps.",
            prop_free_h: "Always Free for Students",
            prop_free_p: "Knowledge shouldn't cost extra. Students practice free with a code.",
            prop_universal_h: "For Every Coach",
            prop_universal_p: "Parents and tutors can create custom digital practice or homework at home.",
            footer_motto: "Anpassa Math Platform — Built for mastery."
        }
    }[lang];

    const renderVisual = (itemData) => {
        if (itemData.graph) return <GraphCanvas data={itemData.graph} />;
        if (itemData.geometry) {
            return <VolumeVisualization data={itemData.geometry} width={260} height={220} />;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 overflow-x-hidden">
            
            {/* --- NAV --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-3">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md"><Sparkles size={16} className="text-white" /></div>
                        <span className="text-lg font-black tracking-tighter italic">ANPASSA</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2"><Globe size={12} /> {lang === 'sv' ? 'English' : 'Svenska'}</button>
                        <button onClick={onTeacherLogin} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">{t.btn_teacher}</button>
                    </div>
                </div>
            </nav>

            {/* --- HERO --- */}
            <header className="pt-32 pb-16 px-6 text-center max-w-4xl mx-auto relative">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 border border-indigo-100">{t.hero_badge}</span>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">{t.hero_title}</h1>
                <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto mb-10 font-medium leading-relaxed">{t.hero_subtitle}</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {/* PRIMARY ACTION: LIVE ROOM JOIN (The Handshake Fix) */}
                    <button 
                        onClick={() => onStudentJoin('live')} 
                        className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-tight shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                        {t.btn_live} <Users size={18} />
                    </button>
                    
                    {/* SECONDARY ACTION: CLASS JOIN */}
                    <button 
                        onClick={() => onStudentJoin('practice')} 
                        className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-sm uppercase tracking-tight hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        {t.btn_practice} <ArrowRight size={18} />
                    </button>
                </div>
            </header>

            {/* --- BRIDGE SECTION --- */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 uppercase italic leading-tight">{t.phi_title}</h2>
                        <p className="text-lg text-slate-400 leading-relaxed font-medium mb-8">{t.phi_text}</p>
                        <div className="flex flex-wrap gap-3">
                            <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={14}/> <span className="text-[9px] font-bold uppercase tracking-widest">LGR22 FOKUS</span></div>
                        </div>
                    </div>
                    
                    <div className="relative bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-4">
                        <div className="bg-white rounded-xl p-6 text-slate-900 font-bold border-l-8 border-emerald-400 shadow-xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><Sparkles size={20}/></div>
                                <div>
                                    <div className="text-[9px] uppercase text-indigo-600 font-black tracking-widest">DET SAKNADE STEGET</div>
                                    <div className="text-base italic font-black">Målinriktad mängdträning</div>
                                </div>
                            </div>
                            <CheckCircle2 className="text-emerald-500" size={24}/>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- DEMO --- */}
            <section className="py-24 px-6 bg-white border-b border-slate-100">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 uppercase italic">{t.demo_h}</h2>
                    <div className="mt-12 flex flex-col lg:flex-row gap-8 items-stretch">
                        <div className="w-full lg:w-[260px] space-y-2">
                            {SHOWCASE_ITEMS.map((item, idx) => (
                                <button key={idx} onClick={() => setActiveTab(idx)} className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${activeTab === idx ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === idx ? 'bg-white/20' : 'bg-slate-50 text-indigo-600'}`}>{item.icon}</div>
                                    <h4 className="font-black uppercase tracking-tight text-[11px]">{item.title[lang]}</h4>
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-[3rem] border border-slate-200 p-10 flex flex-col items-center">
                            <div className="w-full flex justify-center mb-6 min-h-[260px] items-center">
                                {renderVisual(SHOWCASE_ITEMS[activeTab].data)}
                            </div>
                            <div className="text-center mb-8">
                                <MathDisplay content={SHOWCASE_ITEMS[activeTab].data.description} className="text-xl font-bold text-slate-800 mb-2" />
                                {SHOWCASE_ITEMS[activeTab].data.latex && <div className="text-3xl text-indigo-600 font-serif"><MathDisplay content={`$$${SHOWCASE_ITEMS[activeTab].data.latex}$$`} /></div>}
                            </div>
                            <div className="w-full max-w-md space-y-3 mb-8 text-left">
                                {SHOWCASE_ITEMS[activeTab].data.clues.map((clue, cIdx) => (
                                    cIdx <= revealedClueIdx && (
                                        <div key={cIdx} className="bg-white p-4 rounded-xl border-l-4 border-emerald-500 shadow-md animate-in slide-in-from-left-4 flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-black text-[10px]">{cIdx + 1}</div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-700 mb-1 italic opacity-80">{clue[lang]}</div>
                                                {clue.latex && <div className="text-base text-indigo-600 font-bold"><MathDisplay content={`$${clue.latex}$`} /></div>}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                            <button onClick={() => revealedClueIdx < SHOWCASE_ITEMS[activeTab].data.clues.length - 1 ? setRevealedClueIdx(v => v + 1) : setRevealedClueIdx(-1)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 shadow-md">
                                {revealedClueIdx < SHOWCASE_ITEMS[activeTab].data.clues.length - 1 ? t.hint_btn : t.hint_reset}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES --- */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6"><FileText size={24} /></div>
                        <h3 className="text-xl font-black tracking-tight mb-3 uppercase">{t.feat_worksheet_h}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{t.feat_worksheet_p}</p>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all">
                        <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6"><Grid3X3 size={24} /></div>
                        <h3 className="text-xl font-black tracking-tight mb-3 uppercase text-white">{t.feat_donow_h}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">{t.feat_donow_p}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6"><Users size={24} /></div>
                        <h3 className="text-xl font-black tracking-tight mb-3 uppercase">{t.feat_live_h}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{t.feat_live_p}</p>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-16 bg-white border-t border-slate-200 text-center px-6">
                <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">
                    <div className="flex items-center gap-2 grayscale opacity-40"><Sparkles size={16} /><span className="font-black tracking-tighter italic uppercase text-sm">Anpassa</span></div>
                    <button onClick={onTeacherLogin} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all">{t.btn_teacher}</button>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">{t.footer_motto}</p>
                </div>
            </footer>
        </div>
    );
}