// src/components/modals/DashboardTutorialModal.jsx
import React, { useState } from 'react';
import { 
    X, ChevronRight, ChevronLeft, Book, Layers, Sparkles, Clock,
    Play, Beaker, PieChart, Grid3X3, Zap, Map as MapIcon, Users, CheckCircle2
} from 'lucide-react';

export default function DashboardTutorialModal({ isOpen, onClose, lang = 'sv', userRole = 'teacher' }) {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const isTeacher = ['teacher', 'super_admin'].includes(userRole);

    const contentData = {
        student: {
            sv: [
                {
                    title: "Välkommen till din matematikportal!",
                    subtitle: "Här tränar du på matematik i din egen takt med direkt feedback.",
                    icon: <Sparkles size={36} className="text-amber-500" />,
                    badge: "Steg 1 av 3: Välj & Träna",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                På startsidan väljer du vad du vill träna på. Varje område har flera nivåer som stegvis utmanar dig från grundläggande taluppfattning till mer avancerade uppgifter.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="p-6 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-xs">
                                        <Book size={24} />
                                    </div>
                                    <h4 className="text-lg font-black uppercase text-emerald-950 mb-2">
                                        1. Välj Område & Nivå
                                    </h4>
                                    <p className="text-sm sm:text-base text-emerald-900 font-medium leading-relaxed">
                                        Klicka på en kategori högst upp (t.ex. <em>Aritmetik</em>, <em>Bråk</em> eller <em>Algebra</em>). I rullistan väljer du den nivå du vill bemästra.
                                    </p>
                                </div>

                                <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-xs">
                                        <Play size={24} />
                                    </div>
                                    <h4 className="text-lg font-black uppercase text-indigo-950 mb-2">
                                        2. Klicka på Startknappen
                                    </h4>
                                    <p className="text-sm sm:text-base text-indigo-900 font-medium leading-relaxed">
                                        Så fort du valt en nivå tänds den stora gröna knappen <strong>"Börja öva"</strong> längst ner till höger. Klicka på den för att sätta igång!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Digitala verktyg & Laborationer",
                    subtitle: "Undersök matematiska begrepp med interaktiva modeller.",
                    icon: <PieChart size={36} className="text-indigo-600" />,
                    badge: "Steg 2 av 3: Laborera",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                I vänstermenyn hittar du särskilda verktyg designade för att visualisera matematik:
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex items-start gap-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                                        <PieChart size={24} />
                                    </div>
                                    <div>
                                        <strong className="text-slate-900 text-base block mb-1">Digitala laborationer:</strong>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Laborera med bråkcirklar, algebrabrickor och geometriska 2D/3D-figurer för att förstå hur talen hänger ihop.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex items-start gap-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                                        <Grid3X3 size={24} />
                                    </div>
                                    <div>
                                        <strong className="text-slate-900 text-base block mb-1">Tabellträning:</strong>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Mängdträna multiplikationstabellerna från 1 till 12 med direkt återkoppling.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex items-start gap-4">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                                        <Beaker size={24} />
                                    </div>
                                    <div>
                                        <strong className="text-slate-900 text-base block mb-1">Test Lab:</strong>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Träna inför prov med blandade uppgifter och steg-för-steg-ledtrådar om du kör fast.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex items-start gap-4">
                                    <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
                                        <Layers size={24} />
                                    </div>
                                    <div>
                                        <strong className="text-slate-900 text-base block mb-1">Kopplade Grupper:</strong>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Har din lärare gett dig ett specifikt arbetsområde? Då ser du bara de nivåer som valts ut till din klass.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Håll koll på dina framsteg",
                    subtitle: "Följ din utveckling och sätt egna mål.",
                    icon: <CheckCircle2 size={36} className="text-emerald-600" />,
                    badge: "Steg 3 av 3: Statistik",
                    body: (
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-3">
                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                                    Statistik & Tidsinställning
                                </h4>
                                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                                    Klicka på <strong>Statistik</strong> i menyn för att se vilka områden du klarat galant och vad du behöver repetera. Du kan också ställa in en <strong>Timer</strong> för att utmana dig själv att hålla fokus i 10, 15 eller 30 minuter.
                                </p>
                            </div>
                            <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl text-sm sm:text-base text-amber-950 font-semibold flex items-center gap-4">
                                <span className="text-3xl shrink-0">💡</span>
                                <span className="leading-relaxed">Vill du se hela kursplanens innehåll och exempel på alla nivåer? Klicka på <strong>Innehållskarta</strong> högst upp till höger!</span>
                            </div>
                        </div>
                    )
                }
            ],
            en: [
                {
                    title: "Welcome to your math platform!",
                    subtitle: "Practice math at your own pace with instant step-by-step feedback.",
                    icon: <Sparkles size={36} className="text-amber-500" />,
                    badge: "Step 1 of 3: Select & Practice",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                On your dashboard, select what you want to master. Each module has progressive levels designed to guide you from foundational concepts to advanced problem-solving.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="p-6 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-xs">
                                        <Book size={24} />
                                    </div>
                                    <h4 className="text-lg font-black uppercase text-emerald-950 mb-2">
                                        1. Pick Topic & Level
                                    </h4>
                                    <p className="text-sm sm:text-base text-emerald-900 font-medium leading-relaxed">
                                        Click a category across the top bar (e.g. <em>Arithmetic</em>, <em>Fractions</em>, or <em>Algebra</em>). Select the level you want to conquer in the dropdown.
                                    </p>
                                </div>

                                <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-xs">
                                        <Play size={24} />
                                    </div>
                                    <h4 className="text-lg font-black uppercase text-indigo-950 mb-2">
                                        2. Click Start Practicing
                                    </h4>
                                    <p className="text-sm sm:text-base text-indigo-900 font-medium leading-relaxed">
                                        Once a level is selected, the floating green <strong>"Start practicing"</strong> button appears in the bottom-right corner. Click it to begin!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Interactive Tools & Manipulatives",
                    subtitle: "Explore math concepts visually using hands-on digital tools.",
                    icon: <PieChart size={36} className="text-indigo-600" />,
                    badge: "Step 2 of 3: Manipulatives",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                In the left navigation menu, you have direct access to tools that bring math to life:
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex items-start gap-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                                        <PieChart size={24} />
                                    </div>
                                    <div>
                                        <strong className="text-slate-900 text-base block mb-1">Digital Manipulatives:</strong>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Interact with fraction bars, algebra tiles, and 2D/3D geometry solids to see how equations work visually.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex items-start gap-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                                        <Grid3X3 size={24} />
                                    </div>
                                    <div>
                                        <strong className="text-slate-900 text-base block mb-1">Times Tables:</strong>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Master multiplication tables from 1 to 12 with rapid interactive recall practice.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex items-start gap-4">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                                        <Beaker size={24} />
                                    </div>
                                    <div>
                                        <strong className="text-slate-900 text-base block mb-1">Test Lab:</strong>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Simulate exam conditions with mixed question sets and hint walkthroughs if you get stuck.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex items-start gap-4">
                                    <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
                                        <Layers size={24} />
                                    </div>
                                    <div>
                                        <strong className="text-slate-900 text-base block mb-1">Assigned Units:</strong>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            If your teacher assigned a custom unit to your class code, you will only see the exact topics curated for you.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Track Your Progress",
                    subtitle: "Monitor accuracy and set focused study sessions.",
                    icon: <CheckCircle2 size={36} className="text-emerald-600" />,
                    badge: "Step 3 of 3: Analytics",
                    body: (
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-3">
                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                                    Stats & Session Timer
                                </h4>
                                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                                    Click <strong>Statistics</strong> in the sidebar to review your history and see which skills need reinforcement. You can also turn on the <strong>Timer</strong> to challenge yourself to stay focused for 10, 15, or 30 minutes.
                                </p>
                            </div>
                            <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl text-sm sm:text-base text-amber-950 font-semibold flex items-center gap-4">
                                <span className="text-3xl shrink-0">💡</span>
                                <span className="leading-relaxed">Want an overview of all topics and example math equations across every level? Click <strong>Content Map</strong> in the top right corner!</span>
                            </div>
                        </div>
                    )
                }
            ]
        },
        teacher: {
            sv: [
                {
                    title: "Läraröversikt & Snabbstart",
                    subtitle: "Få full kontroll över klassens matematik, lektioner och differentiering.",
                    icon: <Sparkles size={36} className="text-amber-500" />,
                    badge: "Steg 1 av 4: Översikt",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                Välkommen till din lärarpanel. Här administrerar du elever, skapar skräddarsytt material och styr vad dina elever möter när de loggar in med din klasskod.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                                <div className="p-6 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-xs">
                                        <Zap size={24} />
                                    </div>
                                    <h4 className="text-base sm:text-lg font-black uppercase text-emerald-950 mb-2">
                                        Question Studio
                                    </h4>
                                    <p className="text-sm text-emerald-900 font-medium leading-relaxed">
                                        Skapa arbetsblad för utskrift, projektor-grids (Do Now) eller live-presentationer med interaktiva tavlor.
                                    </p>
                                </div>

                                <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-xs">
                                        <Layers size={24} />
                                    </div>
                                    <h4 className="text-base sm:text-lg font-black uppercase text-indigo-950 mb-2">
                                        Grupper & Områden
                                    </h4>
                                    <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                                        Styr vad eleverna ser. Begränsa utbudet till specifika nivåer under ett pågående arbetsområde.
                                    </p>
                                </div>

                                <div className="p-6 bg-amber-50/80 border-2 border-amber-200 rounded-3xl">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-4 shadow-xs">
                                        <MapIcon size={24} />
                                    </div>
                                    <h4 className="text-base sm:text-lg font-black uppercase text-amber-950 mb-2">
                                        Innehållskarta
                                    </h4>
                                    <p className="text-sm text-amber-900 font-medium leading-relaxed">
                                        Få en överskådlig karta över samtliga delmoment, formler och svårighetsnivåer i plattformen.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Skapa Anpassade Arbetsområden (Grupper)",
                    subtitle: "Förenkla elevens vy så att de bara ser det ni arbetar med just nu.",
                    icon: <Layers size={36} className="text-indigo-600" />,
                    badge: "Steg 2 av 4: Grupper",
                    body: (
                        <div className="space-y-5">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                När elever loggar in med din klasskod kan du styra deras gränssnitt genom att skapa en anpassad grupp i fliken <strong>"Grupper" (Teacher Hub)</strong>:
                            </p>

                            <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-4">
                                <ol className="space-y-4 text-sm sm:text-base text-slate-700 font-medium list-decimal pl-5">
                                    <li className="leading-relaxed">
                                        <strong>Välj eller skapa en mapp:</strong> Håll ordning på dina grupper genom att sortera dem per klass (t.ex. <em>Klass 7A</em> eller <em>Åk 8 Repetition</em>).
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong>Namnge gruppen & sätt slutdatum:</strong> Skriv t.ex. <em>Geometri: Area & Omkrets</em> och välj när arbetsområdet avslutas.
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong>Klicka på "Ändra Innehåll":</strong> Öppnar innehållsmodulen där du bockar för exakt vilka delmoment och nivåer som ska ingå i gruppen.
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong>Dagens Fokus & Synlighet:</strong> Klicka på stjärnikonen för att markera en grupp som <em>"Dagens Fokus"</em> så att den hamnar högst upp på elevernas skärmar.
                                    </li>
                                </ol>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Question Studio & Presentationer",
                    subtitle: "Bygg arbetsblad eller genomgångar på storbild.",
                    icon: <Zap size={36} className="text-emerald-600" />,
                    badge: "Steg 3 av 4: Skapa material",
                    body: (
                        <div className="space-y-6">
                            <div className="p-6 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl space-y-3">
                                <h4 className="text-lg sm:text-xl font-black text-emerald-950 uppercase tracking-tight">
                                    Question Studio (Grön knapp i vänstermenyn)
                                </h4>
                                <p className="text-sm sm:text-base text-emerald-900 leading-relaxed font-medium">
                                    Här bygger du egna blad med automatisk layout. Välj ämnen, förvandla tal till vardagsnära textuppgifter med ett klick och skriv ut med fullständigt facit.
                                </p>
                            </div>

                            <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl space-y-3">
                                <h4 className="text-lg sm:text-xl font-black text-indigo-950 uppercase tracking-tight">
                                    Presentationsläge & Laborativa tavlor
                                </h4>
                                <p className="text-sm sm:text-base text-indigo-900 leading-relaxed font-medium">
                                    Klicka på <strong>"Presentera"</strong> i Question Studio för att få en 16:9-whiteboard. Där kan du fördela uppgifter sida för sida, plocka fram algebrabrickor och bråkmodeller samt köra livelektioner där eleverna lämnar in sina digitala tavlor.
                                </p>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Innehållskarta & Lektionsarkiv",
                    subtitle: "Få överblick över progressionen och granska avslutade lektioner.",
                    icon: <MapIcon size={36} className="text-amber-500" />,
                    badge: "Steg 4 av 4: Överblick & Arkiv",
                    body: (
                        <div className="space-y-6">
                            {/* 🚨 CRITICAL DATA RETENTION WARNING CALLOUT */}
                            <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-3xl flex items-start gap-4 shadow-sm animate-in fade-in">
                                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                    <Clock size={26} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-base sm:text-lg font-black uppercase text-rose-950 tracking-tight flex items-center gap-2">
                                        <span>VIKTIGT: Elevdata sparas endast i 7 dagar!</span>
                                    </h4>
                                    <p className="text-sm sm:text-base text-rose-900 leading-relaxed font-semibold">
                                        Av sekretess- och integritetsskäl raderas alla elevresultat och live-svar automatiskt efter <strong>7 dagar</strong>. Om du behöver spara underlag för bedömning, se till att klicka på <strong>"Visa rapport"</strong> och skriva ut eller spara som PDF innan veckan är slut!
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-xs">
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <MapIcon size={22} className="text-amber-600" />
                                        <h4 className="text-base font-black text-slate-900 uppercase">Innehållskarta</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        Klicka på knappen längst upp till höger om ämnesflikarna för att se alla delmoment, formler och nivåer samlade i ett överskådligt schema.
                                    </p>
                                </div>

                                <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2.5">
                                            <div className="flex items-center gap-2">
                                                <Users size={22} className="text-indigo-600" />
                                                <h4 className="text-base font-black text-slate-900 uppercase">Lektionsarkiv</h4>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">
                                                7 Dagar
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Alla avslutade lektioner hamnar under fliken <strong>"Lektionsarkiv"</strong>. Där kan du granska klassens träffsäkerhet och öppna sammanställda rapporter innan sessionen gallras.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-emerald-50 border-2 border-emerald-200 rounded-3xl text-sm sm:text-base text-emerald-950 font-semibold flex items-center gap-4">
                                <span className="text-3xl shrink-0">✨</span>
                                <span className="leading-relaxed">Har du en aktiv lektion igång? Då visas en röd återupptagnings-banner överst på instrumentpanelen så att du snabbt kan hoppa tillbaka!</span>
                            </div>
                        </div>
                    )
                }
            ],
            en: [
                {
                    title: "Teacher Dashboard & Quickstart",
                    subtitle: "Full control over your curriculum, classroom lessons, and differentiation.",
                    icon: <Sparkles size={36} className="text-amber-500" />,
                    badge: "Step 1 of 4: Overview",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                Welcome to your teacher command center. Manage classroom workflows, generate custom assignments, and curate exactly what students see when logging in with your class code.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                                <div className="p-6 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-xs">
                                        <Zap size={24} />
                                    </div>
                                    <h4 className="text-base sm:text-lg font-black uppercase text-emerald-950 mb-2">
                                        Question Studio
                                    </h4>
                                    <p className="text-sm text-emerald-900 font-medium leading-relaxed">
                                        Generate printable worksheets, projector warm-up grids (Do Now), or live interactive presentations.
                                    </p>
                                </div>

                                <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-xs">
                                        <Layers size={24} />
                                    </div>
                                    <h4 className="text-base sm:text-lg font-black uppercase text-indigo-950 mb-2">
                                        Custom Units
                                    </h4>
                                    <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                                        Curate student dashboards. Restrict access to specific levels during an active topic unit.
                                    </p>
                                </div>

                                <div className="p-6 bg-amber-50/80 border-2 border-amber-200 rounded-3xl">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-4 shadow-xs">
                                        <MapIcon size={24} />
                                    </div>
                                    <h4 className="text-base sm:text-lg font-black uppercase text-amber-950 mb-2">
                                        Content Map
                                    </h4>
                                    <p className="text-sm text-amber-900 font-medium leading-relaxed">
                                        Inspect all curriculum topics, progression formulas, and example math problems across the platform.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Creating Custom Units (Groups)",
                    subtitle: "Simplify the student dashboard to only show current learning objectives.",
                    icon: <Layers size={36} className="text-indigo-600" />,
                    badge: "Step 2 of 4: Groups & Units",
                    body: (
                        <div className="space-y-5">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                When students log in with your class code, you can guide their work by building a custom unit in the <strong>"Custom Unit" (Teacher Hub)</strong> tab:
                            </p>

                            <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-4">
                                <ol className="space-y-4 text-sm sm:text-base text-slate-700 font-medium list-decimal pl-5">
                                    <li className="leading-relaxed">
                                        <strong>Select or create a folder:</strong> Organize units by class or grade (e.g. <em>Grade 7 Math</em> or <em>Review Units</em>).
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong>Name the unit & set expiry:</strong> Type a title like <em>Geometry: Area & Volume</em> and set an end date.
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong>Click "Edit Content":</strong> Opens the curriculum selector where you check off the exact levels and generators to include.
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong>Today's Focus & Visibility:</strong> Click the star icon to designate a unit as <em>"Today's Focus"</em>, pinning it directly to the top of student devices.
                                    </li>
                                </ol>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Question Studio & Slides",
                    subtitle: "Build tailored problem sheets or interactive slide decks.",
                    icon: <Zap size={36} className="text-emerald-600" />,
                    badge: "Step 3 of 4: Materials",
                    body: (
                        <div className="space-y-6">
                            <div className="p-6 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl space-y-3">
                                <h4 className="text-lg sm:text-xl font-black text-emerald-950 uppercase tracking-tight">
                                    Question Studio (Green button in sidebar)
                                </h4>
                                <p className="text-sm sm:text-base text-emerald-900 leading-relaxed font-medium">
                                    Assemble custom assignments with automatic formatting. Convert equations into contextual story problems in one click and print clean PDFs with solution keys.
                                </p>
                            </div>

                            <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl space-y-3">
                                <h4 className="text-lg sm:text-xl font-black text-indigo-950 uppercase tracking-tight">
                                    Presentation Slides & Manipulatives
                                </h4>
                                <p className="text-sm sm:text-base text-indigo-900 leading-relaxed font-medium">
                                    Click <strong>"Present"</strong> in Question Studio to open widescreen whiteboard slides. Distribute questions 1-per-slide, pull out algebra tiles or coordinate planes, and run live lessons where students submit digital boards.
                                </p>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Content Map & Session Archive",
                    subtitle: "Inspect curriculum depth and analyze past lesson metrics.",
                    icon: <MapIcon size={36} className="text-amber-500" />,
                    badge: "Step 4 of 4: Curriculum & History",
                    body: (
                        <div className="space-y-6">
                            {/* 🚨 CRITICAL DATA RETENTION WARNING CALLOUT */}
                            <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-3xl flex items-start gap-4 shadow-sm animate-in fade-in">
                                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                    <Clock size={26} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-base sm:text-lg font-black uppercase text-rose-950 tracking-tight flex items-center gap-2">
                                        <span>CRITICAL: Student Data is Purged After 7 Days!</span>
                                    </h4>
                                    <p className="text-sm sm:text-base text-rose-900 leading-relaxed font-semibold">
                                        For strict student privacy, all individual live responses and session records are permanently deleted after <strong>7 days</strong>. If you need session data for grading records, be sure to click <strong>"View Report"</strong> and print or save it to PDF before the 7-day period expires!
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-xs">
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <MapIcon size={22} className="text-amber-600" />
                                        <h4 className="text-base font-black text-slate-900 uppercase">Content Map</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        Click the button located to the right of the topic category tabs to view all skill buckets, math formulas, and level progressions.
                                    </p>
                                </div>

                                <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2.5">
                                            <div className="flex items-center gap-2">
                                                <Users size={22} className="text-indigo-600" />
                                                <h4 className="text-base font-black text-slate-900 uppercase">Session Archive</h4>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">
                                                7 Days
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Completed sessions are placed in the <strong>"Session Archive"</strong> tab. Review class accuracy metrics and export summary reports before the records are purged.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-emerald-50 border-2 border-emerald-200 rounded-3xl text-sm sm:text-base text-emerald-950 font-semibold flex items-center gap-4">
                                <span className="text-3xl shrink-0">✨</span>
                                <span className="leading-relaxed">Running an active classroom session? An instant resume banner will appear at the top of your dashboard so you can jump back into the room anytime!</span>
                            </div>
                        </div>
                    )
                }
            ]
        }
    };

    const roleKey = isTeacher ? 'teacher' : 'student';
    const currentLangSteps = contentData[roleKey][lang] || contentData[roleKey].sv;
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
                            <span className="text-sm sm:text-base font-black uppercase tracking-widest text-indigo-600 block mb-0.5">
                                {current.badge}
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
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
                <div className="px-8 sm:px-10 py-4 bg-indigo-50/60 border-b border-indigo-100/60">
                    <p className="text-base font-extrabold text-indigo-950 uppercase tracking-wide">
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
                        className="px-6 py-3 text-sm sm:text-base font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 disabled:opacity-0 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <ChevronLeft size={22} /> {lang === 'sv' ? "Föregående" : "Back"}
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
                            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm sm:text-base font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                            {lang === 'sv' ? "Nästa steg" : "Next step"} <ChevronRight size={22} />
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-9 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm sm:text-base font-black uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                            {lang === 'sv' ? "Kom igång nu!" : "Get started!"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}