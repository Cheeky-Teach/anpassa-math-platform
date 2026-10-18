// src/components/modals/StudioTutorialModal.jsx
import React, { useState } from 'react';
import { 
    X, ChevronRight, ChevronLeft, BookOpen, Layers, 
    Radio, Sparkles, Send, Grid3X3, FileText,
    Calculator, Type, Map as MapIcon, Clock
} from 'lucide-react';

export default function StudioTutorialModal({ isOpen, onClose, lang = 'sv' }) {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const contentData = {
        sv: [
            {
                title: "Välkommen till Question Studio",
                subtitle: "Din kreativa verktygslåda för arbetsblad, Do Now och live-lektioner.",
                icon: <Sparkles size={32} className="text-amber-500" />,
                badge: "Steg 1 av 4: Översikt",
                body: (
                    <div className="space-y-6">
                        <p className="text-lg text-slate-700 leading-relaxed font-medium">
                            I Question Studio skapar du individanpassat och variationsrikt matematikmaterial på några sekunder. 
                            Välj om du vill skriva ut till papper, visa snabba startuppgifter på projektorn eller köra en interaktiv lektion i realtid.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                            <div className="p-6 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm">
                                        <FileText size={26} />
                                    </div>
                                    <h4 className="text-base font-black uppercase tracking-wider text-emerald-950 mb-2">
                                        Arbetsblad
                                    </h4>
                                    <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                                        Klassisk A4-layout med anpassningsbar skrivyta, svarsrader och fullständigt facit för utskrift.
                                    </p>
                                </div>
                                <span className="mt-5 text-xs font-black uppercase text-emerald-700 tracking-wider">
                                    PDF & Utskrift →
                                </span>
                            </div>

                            <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm">
                                        <Grid3X3 size={26} />
                                    </div>
                                    <h4 className="text-base font-black uppercase tracking-wider text-indigo-950 mb-2">
                                        Do Now Grid
                                    </h4>
                                    <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                                        4–6 startuppgifter med stor text, perfekt anpassade för klassrummets projektor eller storskärm.
                                    </p>
                                </div>
                                <span className="mt-5 text-xs font-black uppercase text-indigo-700 tracking-wider">
                                    Projektorvy →
                                </span>
                            </div>

                            <div className="p-6 bg-rose-50/80 border-2 border-rose-200 rounded-3xl flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-4 shadow-sm">
                                        <Radio size={26} />
                                    </div>
                                    <h4 className="text-base font-black uppercase tracking-wider text-rose-950 mb-2">
                                        Live-Lektion
                                    </h4>
                                    <p className="text-sm text-rose-800 font-medium leading-relaxed">
                                        Eleverna ansluter med en enkel 6-ställig kod och svarar direkt från sina egna skärmar.
                                    </p>
                                </div>
                                <span className="mt-5 text-xs font-black uppercase text-rose-700 tracking-wider">
                                    Realtidsmatris →
                                </span>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Arbeta i de 4 panelerna",
                subtitle: "Arbetsflödet rör sig logiskt från vänster till höger över skärmen.",
                icon: <Layers size={32} className="text-indigo-600" />,
                badge: "Steg 2 av 4: Navigering",
                body: (
                    <div className="space-y-4">
                        <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                1
                            </span>
                            <div>
                                <h4 className="text-base font-black text-slate-900 mb-1">
                                    Pane 1: Välj Ämnesområde
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    I vänstermenyn hittar du hela kursplanen indelad i moduler – som t.ex. Bråk, Procent, Algebra eller Geometri. Klicka på ett ämne för att öppna dess tillgängliga nivåer.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                2
                            </span>
                            <div>
                                <h4 className="text-base font-black text-slate-900 mb-1">
                                    Pane 2: Välj Svårighetsnivå & Typ
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Här listas nivåerna 1–10. Färgade brickor visar om uppgiften tränar <strong>Räkna</strong>, <strong>Begrepp</strong> eller <strong>Visuell förståelse</strong>. Justera antal med <strong>+ / -</strong> och klicka <em>Lägg till</em>.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                3
                            </span>
                            <div>
                                <h4 className="text-base font-black text-slate-900 mb-1">
                                    Pane 3: Arbetsytan (Canvas / Sidan)
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Här ser du materialet växa fram. Växla till <strong>Layout</strong> för att se det verkliga A4-formatet, anpassa rutad skrivyta eller dra i korten för att byta ordning.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                4
                            </span>
                            <div>
                                <h4 className="text-base font-black text-slate-900 mb-1">
                                    Pane 4: Valda Frågor & Facit
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Din sammanställning. Här kan du snabbt ta bort enstaka frågor eller aktivera om facit ska genereras automatiskt längst bak.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Textuppgifter & Snabbkontroller",
                subtitle: "Gör uppgifterna mer verklighetsförankrade med ett enda klick.",
                icon: <BookOpen size={32} className="text-emerald-600" />,
                badge: "Steg 3 av 4: Anpassning",
                body: (
                    <div className="space-y-5">
                        <div className="p-5 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl">
                            <div className="flex items-center gap-2.5 mb-2">
                                <Sparkles size={22} className="text-emerald-700" />
                                <h4 className="text-base font-black text-emerald-950 uppercase tracking-wider">
                                    Problemlösning / Textuppgifter
                                </h4>
                            </div>
                            <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                                Slå på switchen <strong>"Problemlösning"</strong> högst upp i Pane 2. Systemet behåller de matematiska talen men bäddar in dem i engagerande berättelser anpassade för åldersgruppen.
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">
                                Knappar på varje uppgiftskort (Pane 3)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700 font-medium">
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <span className="px-2.5 py-1 bg-indigo-600 text-white font-black rounded-lg text-xs">W</span>
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Bredd:</strong>
                                        Växla mellan helsida <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-xs">W6</span>, halv bredd <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-xs">W3</span> eller tredjedel <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-xs">W2</span>.
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <span className="px-2 py-1 bg-slate-200 text-slate-800 font-black rounded-lg text-xs">+ / -</span>
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Arbetsyta:</strong>
                                        Lägg till 8 mm rutad skrivyta direkt under beräkningen.
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <Calculator size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Slumpa tal:</strong>
                                        Byt ut siffrorna i talet utan att ändra frågetypen.
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <Type size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Slumpa text:</strong>
                                        Få en ny berättelse med samma matematiska struktur.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Starta en Live-lektion",
                subtitle: "Koppla upp hela klassen och följ deras resonemang i realtid.",
                icon: <Send size={32} className="text-rose-500" />,
                badge: "Steg 4 av 4: Live i klassrummet",
                body: (
                    <div className="space-y-5">
                        <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-xs">
                            <ol className="space-y-4 text-sm text-slate-700 font-medium">
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">1</span>
                                    <span className="leading-relaxed">Klicka på den röda <strong>"Live"</strong>-knappen i toppmenyn när du har valt dina frågor.</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">2</span>
                                    <span className="leading-relaxed">Välj lektionstyp: <strong>Öppet tempo</strong> (eleverna räknar själva) eller <strong>Lärarlett</strong> (du byter fråga för alla).</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">3</span>
                                    <span className="leading-relaxed">Klicka <strong>Starta</strong>. Projektorn visar en sexsiffrig klasskod (t.ex. <em>XK92FA</em>).</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">4</span>
                                    <span className="leading-relaxed">Eleverna går in på sidan på sina datorer/iPad, klickar <strong>Elev</strong> och skriver in koden.</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">5</span>
                                    <span className="leading-relaxed">Svaren rullar in i din <strong>Realtidsmatris</strong>. Klicka på valfri elev för att se deras uträkningar eller tavelritningar direkt!</span>
                                </li>
                            </ol>
                        </div>

                        {/* 🚨 CRITICAL DATA RETENTION WARNING */}
                        <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-3xl flex items-start gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                <Clock size={24} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-base font-black uppercase text-rose-950 tracking-tight">
                                    VIKTIGT: Elevdata sparas endast i 7 dagar!
                                </h4>
                                <p className="text-sm text-rose-900 leading-relaxed font-semibold">
                                    Av sekretess- och integritetsskäl raderas alla elevresultat, tavelritningar och svar automatiskt efter <strong>7 dagar</strong>. Skriv ut eller spara rapporter som PDF från Lektionsarkivet i Dashboarden innan veckan är slut!
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-3xl text-sm text-amber-950 font-semibold flex items-center gap-3.5">
                            <span className="text-2xl shrink-0">💡</span>
                            <span className="leading-relaxed">Vill du visa uppgifterna på tavlan utan elevsvar? Klicka på den gula knappen <strong>"Presentera"</strong> istället!</span>
                        </div>
                    </div>
                )
            }
        ],
        en: [
            {
                title: "Welcome to Question Studio",
                subtitle: "Your creative toolkit for worksheets, Do Now grids, and live lessons.",
                icon: <Sparkles size={32} className="text-amber-500" />,
                badge: "Step 1 of 4: Overview",
                body: (
                    <div className="space-y-6">
                        <p className="text-lg text-slate-700 leading-relaxed font-medium">
                            In Question Studio, you can generate customized, varied math assignments in seconds. 
                            Choose whether to print paper copies, project quick warm-ups on your smartboard, or run interactive live sessions.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                            <div className="p-6 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm">
                                        <FileText size={26} />
                                    </div>
                                    <h4 className="text-base font-black uppercase tracking-wider text-emerald-950 mb-2">
                                        Worksheet
                                    </h4>
                                    <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                                        Printable A4 layout with configurable work areas, solution grids, and full answer keys.
                                    </p>
                                </div>
                                <span className="mt-5 text-xs font-black uppercase text-emerald-700 tracking-wider">
                                    PDF & Print →
                                </span>
                            </div>

                            <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm">
                                        <Grid3X3 size={26} />
                                    </div>
                                    <h4 className="text-base font-black uppercase tracking-wider text-indigo-950 mb-2">
                                        Do Now Grid
                                    </h4>
                                    <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                                        4–6 quick warm-up questions optimized with large font sizes for classroom projectors.
                                    </p>
                                </div>
                                <span className="mt-5 text-xs font-black uppercase text-indigo-700 tracking-wider">
                                    Projector Mode →
                                </span>
                            </div>

                            <div className="p-6 bg-rose-50/80 border-2 border-rose-200 rounded-3xl flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-4 shadow-sm">
                                        <Radio size={26} />
                                    </div>
                                    <h4 className="text-base font-black uppercase tracking-wider text-rose-950 mb-2">
                                        Live Lesson
                                    </h4>
                                    <p className="text-sm text-rose-800 font-medium leading-relaxed">
                                        Students connect with a simple 6-letter room code and submit answers from their own devices.
                                    </p>
                                </div>
                                <span className="mt-5 text-xs font-black uppercase text-rose-700 tracking-wider">
                                    Live Matrix →
                                </span>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Working Across the 4 Panes",
                subtitle: "The workflow moves logically from left to right across your screen.",
                icon: <Layers size={32} className="text-indigo-600" />,
                badge: "Step 2 of 4: Navigation",
                body: (
                    <div className="space-y-4">
                        <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                1
                            </span>
                            <div>
                                <h4 className="text-base font-black text-slate-900 mb-1">
                                    Pane 1: Topic Catalog
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Browse the full math curriculum on the left – Fractions, Percentages, Algebra, or Geometry. Click any topic to load its difficulty levels.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                2
                            </span>
                            <div>
                                <h4 className="text-base font-black text-slate-900 mb-1">
                                    Pane 2: Levels & Question Types
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Select difficulty (Levels 1–10). Colored badges indicate whether questions practice <strong>Calculations</strong>, <strong>Concepts</strong>, or <strong>Visual Models</strong>. Set the quantity and click <em>Add</em>.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                3
                            </span>
                            <div>
                                <h4 className="text-base font-black text-slate-900 mb-1">
                                    Pane 3: Workspace (The Canvas)
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Preview your assignment. Switch to <strong>Layout</strong> to see the real A4 sheet preview, add squared work areas, or drag cards to reorder them.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                4
                            </span>
                            <div>
                                <h4 className="text-base font-black text-slate-900 mb-1">
                                    Pane 4: Selected Queue & Answer Key
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Your table of contents. Delete individual questions, inspect expressions, or toggle whether to automatically append a full answer key.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Word Problems & Quick Controls",
                subtitle: "Make math contextual and interactive with one click.",
                icon: <BookOpen size={32} className="text-emerald-600" />,
                badge: "Step 3 of 4: Customization",
                body: (
                    <div className="space-y-5">
                        <div className="p-5 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl">
                            <div className="flex items-center gap-2.5 mb-2">
                                <Sparkles size={22} className="text-emerald-700" />
                                <h4 className="text-base font-black text-emerald-950 uppercase tracking-wider">
                                    Contextual Word Problems
                                </h4>
                            </div>
                            <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                                Turn on the <strong>"Word Problems"</strong> toggle at the top of Pane 2. The engine keeps the exact numbers and calculations while embedding them into relatable, age-appropriate narratives.
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">
                                Controls on each question card (Pane 3)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700 font-medium">
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <span className="px-2.5 py-1 bg-indigo-600 text-white font-black rounded-lg text-xs">W</span>
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Width:</strong>
                                        Toggle between full width <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-xs">W6</span>, half width <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-xs">W3</span>, or one-third width <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-xs">W2</span>.
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <span className="px-2 py-1 bg-slate-200 text-slate-800 font-black rounded-lg text-xs">+ / -</span>
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Work Area:</strong>
                                        Add 8mm squared grid space under questions for student calculations.
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <Calculator size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Shuffle Numbers:</strong>
                                        Randomize the values in a problem while preserving its exact question format.
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <Type size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Shuffle Story:</strong>
                                        Generate a fresh narrative scenario for the same mathematical equation.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Hosting a Live Lesson",
                subtitle: "Connect the entire classroom and follow student work in real time.",
                icon: <Send size={32} className="text-rose-500" />,
                badge: "Step 4 of 4: Live Classrooms",
                body: (
                    <div className="space-y-5">
                        <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-xs">
                            <ol className="space-y-4 text-sm text-slate-700 font-medium">
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">1</span>
                                    <span className="leading-relaxed">Click the red <strong>"Live"</strong> button in the top menu bar once you have queued your questions.</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">2</span>
                                    <span className="leading-relaxed">Choose session pacing: <strong>Open Pace</strong> (students work freely) or <strong>Teacher-Led</strong> (you control the active problem).</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">3</span>
                                    <span className="leading-relaxed">Click <strong>Start</strong>. The board will display a 6-letter class code (e.g. <em>XK92FA</em>).</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">4</span>
                                    <span className="leading-relaxed">Students navigate to the app, select <strong>Student</strong>, and enter the code with their name.</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">5</span>
                                    <span className="leading-relaxed">Answers stream into your <strong>Live Matrix</strong> in real time. Click on any student cell to inspect their scratchpad calculations or drawings!</span>
                                </li>
                            </ol>
                        </div>

                        {/* 🚨 CRITICAL DATA RETENTION WARNING */}
                        <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-3xl flex items-start gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                <Clock size={24} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-base font-black uppercase text-rose-950 tracking-tight">
                                    CRITICAL: Student Data is Purged After 7 Days!
                                </h4>
                                <p className="text-sm text-rose-900 leading-relaxed font-semibold">
                                    For strict student privacy, all student submissions, whiteboard drawings, and response records are permanently deleted after <strong>7 days</strong>. Be sure to export or print PDF summary reports from the Session Archive before the 7-day period expires!
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-3xl text-sm text-amber-950 font-semibold flex items-center gap-3.5">
                            <span className="text-2xl shrink-0">💡</span>
                            <span className="leading-relaxed">Want to present the problems slide-by-slide without collecting answers? Click the yellow <strong>"Present"</strong> button instead!</span>
                        </div>
                    </div>
                )
            }
        ]
    };

    const currentLangSteps = contentData[lang] || contentData.sv;
    const current = currentLangSteps[step];

    return (
        <div className="fixed inset-0 z-[500] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 sm:px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                            {current.icon}
                        </div>
                        <div>
                            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 block mb-0.5">
                                {current.badge}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                {current.title}
                            </h3>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2.5 text-slate-400 hover:text-slate-800 rounded-2xl hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title={lang === 'sv' ? "Stäng" : "Close"}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Subtitle Bar */}
                <div className="px-8 sm:px-10 py-3.5 bg-indigo-50/60 border-b border-indigo-100/60">
                    <p className="text-sm font-bold text-indigo-950 uppercase tracking-wide">
                        {current.subtitle}
                    </p>
                </div>

                {/* Body Content */}
                <div className="p-8 sm:p-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {current.body}
                </div>

                {/* Footer Navigation */}
                <div className="px-8 sm:px-10 py-6 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between">
                    <button
                        onClick={() => setStep(s => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 disabled:opacity-0 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <ChevronLeft size={20} /> {lang === 'sv' ? "Föregående" : "Back"}
                    </button>

                    {/* Step Dots */}
                    <div className="flex gap-2.5 items-center">
                        {currentLangSteps.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setStep(i)}
                                className={`h-3 rounded-full transition-all cursor-pointer ${
                                    step === i 
                                        ? 'bg-indigo-600 w-10' 
                                        : 'bg-slate-300 hover:bg-slate-400 w-3'
                                }`}
                                title={`Steg ${i + 1}`}
                            />
                        ))}
                    </div>

                    {step < currentLangSteps.length - 1 ? (
                        <button
                            onClick={() => setStep(s => Math.min(currentLangSteps.length - 1, s + 1))}
                            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                            {lang === 'sv' ? "Nästa steg" : "Next step"} <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-9 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                            {lang === 'sv' ? "Kom igång nu!" : "Get started!"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}