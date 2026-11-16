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
                    icon: <Sparkles size={28} className="text-amber-500" />,
                    badge: "Steg 1 av 3: Välj & Träna",
                    body: (
                        <div className="space-y-5">
                            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-medium">
                                På startsidan väljer du vad du vill träna på. Varje område har flera nivåer som stegvis utmanar dig från grundläggande taluppfattning till mer avancerade uppgifter.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                                        <Book size={20} />
                                    </div>
                                    <h4 className="text-sm font-bold uppercase tracking-tight text-[var(--text-main)]">
                                        1. Välj område & nivå
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Klicka på en kategori högst upp (t.ex. <em>Aritmetik</em>, <em>Bråk</em> eller <em>Algebra</em>). I rullistan väljer du den nivå du vill bemästra.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                                        <Play size={20} />
                                    </div>
                                    <h4 className="text-sm font-bold uppercase tracking-tight text-[var(--text-main)]">
                                        2. Klicka på startknappen
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Så fort du valt en nivå tänds den gröna knappen <strong>"Börja öva"</strong> längst ner till höger. Klicka på den för att sätta igång!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Digitala verktyg & laborationer",
                    subtitle: "Undersök matematiska begrepp med interaktiva modeller.",
                    icon: <PieChart size={28} className="text-sky-600 dark:text-sky-400" />,
                    badge: "Steg 2 av 3: Laborera",
                    body: (
                        <div className="space-y-5">
                            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-medium">
                                I vänstermenyn hittar du särskilda verktyg designade för att visualisera matematik:
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] flex items-start gap-3">
                                    <div className="p-2.5 bg-[var(--bg-card)] text-sky-600 dark:text-sky-400 border border-[var(--border-strong)] rounded-xl shrink-0">
                                        <PieChart size={20} />
                                    </div>
                                    <div>
                                        <strong className="text-xs font-bold text-[var(--text-main)] block mb-0.5">Digitala laborationer:</strong>
                                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                            Laborera med bråkcirklar, algebrabrickor och geometriska figurer.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] flex items-start gap-3">
                                    <div className="p-2.5 bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 border border-[var(--border-strong)] rounded-xl shrink-0">
                                        <Grid3X3 size={20} />
                                    </div>
                                    <div>
                                        <strong className="text-xs font-bold text-[var(--text-main)] block mb-0.5">Tabellträning:</strong>
                                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                            Mängdträna multiplikationstabellerna från 1 till 12 med direkt återkoppling.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] flex items-start gap-3">
                                    <div className="p-2.5 bg-[var(--bg-card)] text-amber-600 dark:text-amber-400 border border-[var(--border-strong)] rounded-xl shrink-0">
                                        <Beaker size={20} />
                                    </div>
                                    <div>
                                        <strong className="text-xs font-bold text-[var(--text-main)] block mb-0.5">Test Lab:</strong>
                                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                            Träna inför prov med blandade uppgifter och steg-för-steg-ledtrådar.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] flex items-start gap-3">
                                    <div className="p-2.5 bg-[var(--bg-card)] text-rose-600 dark:text-rose-400 border border-[var(--border-strong)] rounded-xl shrink-0">
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <strong className="text-xs font-bold text-[var(--text-main)] block mb-0.5">Kopplade grupper:</strong>
                                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                            Ser du bara vissa nivåer? Då har din lärare valt ut ett specifikt fokus för klassen.
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
                    icon: <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400" />,
                    badge: "Steg 3 av 3: Statistik",
                    body: (
                        <div className="space-y-4">
                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-2">
                                <h4 className="text-xs font-extrabold text-[var(--text-main)] uppercase tracking-wide">
                                    Statistik & tidsinställning
                                </h4>
                                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                                    Klicka på <strong>Statistik</strong> i menyn för att se vilka områden du klarat galant. Du kan också ställa in en <strong>Timer</strong> för att hålla fokus i 10, 15 eller 30 minuter.
                                </p>
                            </div>
                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] border-l-4 border-l-amber-500 rounded-xl text-xs sm:text-sm text-[var(--text-main)] font-medium flex items-center gap-3">
                                <span className="text-xl shrink-0">💡</span>
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
                    icon: <Sparkles size={28} className="text-amber-500" />,
                    badge: "Step 1 of 3: Select & Practice",
                    body: (
                        <div className="space-y-5">
                            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-medium">
                                On your dashboard, select what you want to master. Each module has progressive levels designed to guide you from foundational concepts to advanced problem-solving.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                                        <Book size={20} />
                                    </div>
                                    <h4 className="text-sm font-bold uppercase tracking-tight text-[var(--text-main)]">
                                        1. Pick Topic & Level
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Click a category across the top bar (e.g. <em>Arithmetic</em>, <em>Fractions</em>, or <em>Algebra</em>). Select the level you want to conquer in the dropdown.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                                        <Play size={20} />
                                    </div>
                                    <h4 className="text-sm font-bold uppercase tracking-tight text-[var(--text-main)]">
                                        2. Click Start Practicing
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Once a level is selected, the green <strong>"Start practicing"</strong> button appears in the bottom-right corner. Click it to begin!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Interactive Tools & Manipulatives",
                    subtitle: "Explore math concepts visually using hands-on digital tools.",
                    icon: <PieChart size={28} className="text-sky-600 dark:text-sky-400" />,
                    badge: "Step 2 of 3: Manipulatives",
                    body: (
                        <div className="space-y-5">
                            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-medium">
                                In the left navigation menu, you have direct access to tools that bring math to life:
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] flex items-start gap-3">
                                    <div className="p-2.5 bg-[var(--bg-card)] text-sky-600 dark:text-sky-400 border border-[var(--border-strong)] rounded-xl shrink-0">
                                        <PieChart size={20} />
                                    </div>
                                    <div>
                                        <strong className="text-xs font-bold text-[var(--text-main)] block mb-0.5">Digital Manipulatives:</strong>
                                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                            Interact with fraction bars, algebra tiles, and 2D/3D geometry solids.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] flex items-start gap-3">
                                    <div className="p-2.5 bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 border border-[var(--border-strong)] rounded-xl shrink-0">
                                        <Grid3X3 size={20} />
                                    </div>
                                    <div>
                                        <strong className="text-xs font-bold text-[var(--text-main)] block mb-0.5">Times Tables:</strong>
                                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                            Master multiplication tables from 1 to 12 with rapid interactive practice.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] flex items-start gap-3">
                                    <div className="p-2.5 bg-[var(--bg-card)] text-amber-600 dark:text-amber-400 border border-[var(--border-strong)] rounded-xl shrink-0">
                                        <Beaker size={20} />
                                    </div>
                                    <div>
                                        <strong className="text-xs font-bold text-[var(--text-main)] block mb-0.5">Test Lab:</strong>
                                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                            Simulate exam conditions with mixed question sets and hint walkthroughs.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] flex items-start gap-3">
                                    <div className="p-2.5 bg-[var(--bg-card)] text-rose-600 dark:text-rose-400 border border-[var(--border-strong)] rounded-xl shrink-0">
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <strong className="text-xs font-bold text-[var(--text-main)] block mb-0.5">Assigned Units:</strong>
                                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                            See only the exact topics curated specifically for your class code.
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
                    icon: <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400" />,
                    badge: "Step 3 of 3: Analytics",
                    body: (
                        <div className="space-y-4">
                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-2">
                                <h4 className="text-xs font-extrabold text-[var(--text-main)] uppercase tracking-wide">
                                    Stats & Session Timer
                                </h4>
                                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                                    Click <strong>Statistics</strong> in the sidebar to review your history. You can also turn on the <strong>Timer</strong> to challenge yourself to stay focused.
                                </p>
                            </div>
                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] border-l-4 border-l-amber-500 rounded-xl text-xs sm:text-sm text-[var(--text-main)] font-medium flex items-center gap-3">
                                <span className="text-xl shrink-0">💡</span>
                                <span className="leading-relaxed">Want an overview of all topics and formulas? Click <strong>Content Map</strong> in the top right corner!</span>
                            </div>
                        </div>
                    )
                }
            ]
        },
        teacher: {
            sv: [
                {
                    title: "Läraröversikt & snabbstart",
                    subtitle: "Få full kontroll över klassens matematik, lektioner och differentiering.",
                    icon: <Sparkles size={28} className="text-amber-500" />,
                    badge: "Steg 1 av 4: Översikt",
                    body: (
                        <div className="space-y-5">
                            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-medium">
                                Välkommen till din lärarpanel. Här administrerar du elever, skapar skräddarsytt material och styr vad dina elever möter när de loggar in med din klasskod.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                                        <Zap size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-tight text-[var(--text-main)]">
                                        Question Studio
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Skapa arbetsblad för utskrift, projektor-grids (Do Now) eller live-presentationer.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-2xs">
                                        <Layers size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-tight text-[var(--text-main)]">
                                        Grupper & områden
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Styr vad eleverna ser. Begränsa utbudet till specifika nivåer under ett pågående arbetsområde.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-2xs">
                                        <MapIcon size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-tight text-[var(--text-main)]">
                                        Innehållskarta
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Få en överskådlig karta över samtliga delmoment, formler och svårighetsnivåer.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Skapa anpassade arbetsområden (Grupper)",
                    subtitle: "Förenkla elevens vy så att de bara ser det ni arbetar med just nu.",
                    icon: <Layers size={28} className="text-sky-600 dark:text-sky-400" />,
                    badge: "Steg 2 av 4: Grupper",
                    body: (
                        <div className="space-y-4">
                            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-medium">
                                När elever loggar in med din klasskod kan du styra deras gränssnitt genom att skapa en anpassad grupp i fliken <strong>"Grupper" (Teacher Hub)</strong>:
                            </p>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-3">
                                <ol className="space-y-2.5 text-xs sm:text-sm text-[var(--text-main)] font-medium list-decimal pl-4">
                                    <li className="leading-relaxed">
                                        <strong>Välj eller skapa en mapp:</strong> Håll ordning på dina grupper genom att sortera dem per klass (t.ex. <em>Klass 7A</em>).
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong>Namnge gruppen & sätt slutdatum:</strong> Skriv t.ex. <em>Geometri: Area & Omkrets</em> och välj när arbetsområdet avslutas.
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong>Klicka på "Ändra Innehåll":</strong> Öppnar innehållsmodulen där du bockar för exakt vilka delmoment som ska ingå.
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong>Dagens Fokus:</strong> Markera en grupp som <em>"Dagens Fokus"</em> så att den hamnar högst upp på elevernas skärmar.
                                    </li>
                                </ol>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Question Studio & presentationer",
                    subtitle: "Bygg arbetsblad eller genomgångar på storbild.",
                    icon: <Zap size={28} className="text-emerald-600 dark:text-emerald-400" />,
                    badge: "Steg 3 av 4: Skapa material",
                    body: (
                        <div className="space-y-4">
                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-1.5">
                                <h4 className="text-sm font-extrabold text-[var(--text-main)] uppercase tracking-tight">
                                    Question Studio (Grön knapp i vänstermenyn)
                                </h4>
                                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                                    Här bygger du egna blad med automatisk layout. Välj ämnen, förvandla tal till vardagsnära textuppgifter med ett klick och skriv ut med fullständigt facit.
                                </p>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-1.5">
                                <h4 className="text-sm font-extrabold text-[var(--text-main)] uppercase tracking-tight">
                                    Presentationsläge & laborativa tavlor
                                </h4>
                                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                                    Klicka på <strong>"Presentera"</strong> i Question Studio för att få en 16:9-whiteboard. Där kan du fördela uppgifter sida för sida och köra livelektioner.
                                </p>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Innehållskarta & lektionsarkiv",
                    subtitle: "Få överblick över progressionen och granska avslutade lektioner.",
                    icon: <MapIcon size={28} className="text-amber-500" />,
                    badge: "Steg 4 av 4: Överblick & Arkiv",
                    body: (
                        <div className="space-y-4">
                            {/* Critical Data Retention Callout */}
                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] border-l-4 border-l-rose-600 rounded-xl flex items-start gap-3">
                                <div className="p-2.5 bg-rose-600 text-white rounded-xl shrink-0 mt-0.5">
                                    <Clock size={20} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs sm:text-sm font-extrabold uppercase text-rose-700 dark:text-rose-400 tracking-tight">
                                        {lang === 'sv' ? "VIKTIGT: Elevdata sparas endast i 7 dagar!" : "CRITICAL: Student Data is Purged After 7 Days!"}
                                    </h4>
                                    <p className="text-xs text-[var(--text-main)] leading-relaxed font-medium">
                                        {lang === 'sv' 
                                            ? "Av sekretesskäl raderas alla elevresultat och live-svar automatiskt efter 7 dagar. Klicka på \"Visa rapport\" och spara som PDF innan veckan är slut om du behöver underlag!"
                                            : "For student privacy, all individual live responses and session records are permanently deleted after 7 days. Be sure to export reports for grading records before expiry!"}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-1.5">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)]">Innehållskarta</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        {lang === 'sv' ? "Klicka på knappen längst upp till höger för att se alla delmoment och formler." : "Click the button in the top right to view all curriculum skill buckets and formulas."}
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-1.5">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)]">Lektionsarkiv</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        {lang === 'sv' ? "Granska klassens träffsäkerhet och öppna sammanställda rapporter." : "Review class accuracy metrics and open summary reports before archiving."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }
            ],
            en: [
                {
                    title: "Teacher Dashboard & Quickstart",
                    subtitle: "Full control over your curriculum, classroom lessons, and differentiation.",
                    icon: <Sparkles size={28} className="text-amber-500" />,
                    badge: "Step 1 of 4: Overview",
                    body: (
                        <div className="space-y-5">
                            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-medium">
                                Welcome to your teacher command center. Manage classroom workflows, generate custom assignments, and curate exactly what students see.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                                        <Zap size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-tight text-[var(--text-main)]">
                                        Question Studio
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Generate printable worksheets, projector warm-up grids, or live presentations.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-2xs">
                                        <Layers size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-tight text-[var(--text-main)]">
                                        Custom Units
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Curate student dashboards and restrict access to specific skill levels.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-2xs">
                                        <MapIcon size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-tight text-[var(--text-main)]">
                                        Content Map
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Inspect all curriculum topics, formulas, and level progressions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Creating Custom Units (Groups)",
                    subtitle: "Simplify the student dashboard to only show current learning objectives.",
                    icon: <Layers size={28} className="text-sky-600 dark:text-sky-400" />,
                    badge: "Step 2 of 4: Groups & Units",
                    body: (
                        <div className="space-y-4">
                            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-medium">
                                When students log in with your class code, you can guide their work by building a custom unit in the <strong>"Custom Unit" (Teacher Hub)</strong> tab:
                            </p>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-3">
                                <ol className="space-y-2.5 text-xs sm:text-sm text-[var(--text-main)] font-medium list-decimal pl-4">
                                    <li className="leading-relaxed">
                                        <strong>Select or create a folder:</strong> Organize units by class or grade (e.g. <em>Grade 7 Math</em>).
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong>Name the unit & set expiry:</strong> Type a title like <em>Geometry: Area & Volume</em> and set an end date.
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong>Click "Edit Content":</strong> Opens the curriculum selector where you check off the exact levels.
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong>Today's Focus:</strong> Designate a unit as <em>"Today's Focus"</em>, pinning it to the top of student devices.
                                    </li>
                                </ol>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Question Studio & Slides",
                    subtitle: "Build tailored problem sheets or interactive slide decks.",
                    icon: <Zap size={28} className="text-emerald-600 dark:text-emerald-400" />,
                    badge: "Step 3 of 4: Materials",
                    body: (
                        <div className="space-y-4">
                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-1.5">
                                <h4 className="text-sm font-extrabold text-[var(--text-main)] uppercase tracking-tight">
                                    Question Studio
                                </h4>
                                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                                    Assemble custom assignments with automatic formatting. Convert equations into story problems and print clean PDFs with solution keys.
                                </p>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-1.5">
                                <h4 className="text-sm font-extrabold text-[var(--text-main)] uppercase tracking-tight">
                                    Presentation Slides
                                </h4>
                                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                                    Click <strong>"Present"</strong> in Question Studio to open widescreen whiteboard slides and run live lessons.
                                </p>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Content Map & Session Archive",
                    subtitle: "Inspect curriculum depth and analyze past lesson metrics.",
                    icon: <MapIcon size={28} className="text-amber-500" />,
                    badge: "Step 4 of 4: Curriculum & History",
                    body: (
                        <div className="space-y-4">
                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] border-l-4 border-l-rose-600 rounded-xl flex items-start gap-3">
                                <div className="p-2.5 bg-rose-600 text-white rounded-xl shrink-0 mt-0.5">
                                    <Clock size={20} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs sm:text-sm font-extrabold uppercase text-rose-700 dark:text-rose-400 tracking-tight">
                                        CRITICAL: Student Data is Purged After 7 Days!
                                    </h4>
                                    <p className="text-xs text-[var(--text-main)] leading-relaxed font-medium">
                                        For student privacy, all individual live responses and session records are permanently deleted after 7 days. Be sure to export reports before expiry!
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-1.5">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)]">Content Map</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        View all curriculum skill buckets and formulas.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-1.5">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)]">Lektionsarkiv</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        Review class accuracy metrics and open summary reports before archiving.
                                    </p>
                                </div>
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
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-[var(--text-main)]">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] shadow-2xl border border-[var(--border-main)] flex items-center justify-center shrink-0">
                            {current.icon}
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                                {current.badge}
                            </span>
                            <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-main)] tracking-tight leading-snug">
                                {current.title}
                            </h3>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                        title={lang === 'sv' ? "Stäng" : "Close"}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Subtitle Bar */}
                <div className="px-6 py-2.5 bg-[var(--bg-surface)] border-b border-[var(--border-main)]">
                    <p className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wide">
                        {current.subtitle}
                    </p>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto max-h-[55vh] custom-scrollbar bg-[var(--bg-card)]">
                    {current.body}
                </div>

                {/* Footer Navigation */}
                <div className="px-6 py-3.5 border-t border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={() => setStep(s => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-0 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <ChevronLeft size={16} /> {lang === 'sv' ? "Föregående" : "Back"}
                    </button>

                    {/* Step Dots */}
                    <div className="flex gap-2 items-center">
                        {currentLangSteps.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setStep(i)}
                                className={`h-2 rounded-full transition-all cursor-pointer ${
                                    step === i 
                                        ? 'bg-emerald-600 w-8' 
                                        : 'bg-[var(--border-strong)] hover:opacity-80 w-2'
                                }`}
                                title={`Steg ${i + 1}`}
                            />
                        ))}
                    </div>

                    {step < currentLangSteps.length - 1 ? (
                        <button
                            type="button"
                            onClick={() => setStep(s => Math.min(currentLangSteps.length - 1, s + 1))}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                        >
                            <span>{lang === 'sv' ? "Nästa" : "Next"}</span> <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                        >
                            {lang === 'sv' ? "Kom igång!" : "Get started!"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}