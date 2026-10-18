// src/components/modals/PresentationTutorialModal.jsx
import React, { useState } from 'react';
import { 
    X, ChevronRight, ChevronLeft, Monitor, Layers, 
    Sparkles, Presentation, FileQuestion, Plus,
    RefreshCw, Users, Palette, Radio, Clock
} from 'lucide-react';

export default function PresentationTutorialModal({ isOpen, onClose, lang = 'sv' }) {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const contentData = {
        sv: [
            {
                title: "Välkommen till Presentationsläge",
                subtitle: "Gör om dina arbetsblad och matteuppgifter till en interaktiv genomgång.",
                icon: <Presentation size={32} className="text-amber-500" />,
                badge: "Steg 1 av 4: Översikt",
                body: (
                    <div className="space-y-6">
                        <p className="text-lg text-slate-700 leading-relaxed font-medium">
                            I Presentationsläget förvandlas dina sparade uppgifter till en professionell bildvisning i 16:9-format. 
                            Du får en digital whiteboard, färdiga laborativa verktyg och möjligheten att låta eleverna bygga och rita sina egna svar i realtid.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                            <div className="p-6 bg-amber-50/80 border-2 border-amber-200 rounded-3xl flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-4 shadow-sm">
                                        <Monitor size={26} />
                                    </div>
                                    <h4 className="text-base font-black uppercase tracking-wider text-amber-950 mb-2">
                                        16:9 Storbild
                                    </h4>
                                    <p className="text-sm text-amber-900 font-medium leading-relaxed">
                                        Kristallklar visning anpassad för projektorer, smartboards och elevernas egna skärmar.
                                    </p>
                                </div>
                                <span className="mt-5 text-xs font-black uppercase text-amber-800 tracking-wider">
                                    Biograf-format →
                                </span>
                            </div>

                            <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm">
                                        <Palette size={26} />
                                    </div>
                                    <h4 className="text-base font-black uppercase tracking-wider text-indigo-950 mb-2">
                                        Laborativ Tavla
                                    </h4>
                                    <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                                        Dra ut färdiga algebrabrickor, 2D/3D-figurer, bråkdelar och koordinatsystem direkt på tavlan.
                                    </p>
                                </div>
                                <span className="mt-5 text-xs font-black uppercase text-indigo-700 tracking-wider">
                                    Verktygslådor →
                                </span>
                            </div>

                            <div className="p-6 bg-rose-50/80 border-2 border-rose-200 rounded-3xl flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-4 shadow-sm">
                                        <Users size={26} />
                                    </div>
                                    <h4 className="text-base font-black uppercase tracking-wider text-rose-950 mb-2">
                                        Elevsvar Live
                                    </h4>
                                    <p className="text-sm text-rose-800 font-medium leading-relaxed">
                                        Låt eleverna laborera på sina egna enheter och skicka in sina tavlor så att du kan lyfta dem framför klassen.
                                    </p>
                                </div>
                                <span className="mt-5 text-xs font-black uppercase text-rose-700 tracking-wider">
                                    Klassrums-interaktion →
                                </span>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Från Arbetsblad till Slides på 1 Klick",
                subtitle: "Ladda in sparade uppgifter och fördela dem automatiskt på egna sidor.",
                icon: <Layers size={32} className="text-indigo-600" />,
                badge: "Steg 2 av 4: Skapa bildspel",
                body: (
                    <div className="space-y-4">
                        <div className="p-5 bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                1
                            </span>
                            <div>
                                <h4 className="text-base font-black text-slate-900 mb-1">
                                    Hämta uppgifter från ditt bibliotek
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Öppna ett sparat blad direkt via Question Studio genom att klicka på <strong>"Presentera"</strong>, eller klicka på <strong>"Uppgift"</strong> i vänstermenyn för att plocka in nya tal från generatorerna.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                2
                            </span>
                            <div>
                                <h4 className="text-base font-black text-emerald-950 mb-1">
                                    Blixtsnabb uppdelning: 1 uppgift per slide
                                </h4>
                                <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                                    Gå till fliken <strong>"Uppgifter"</strong> i vänstermenyn och klicka på knappen <strong>"Fördela 1 uppgift per slide"</strong>. Systemet skapar ögonblickligen en dedikerad presentationssida för varje fråga.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-slate-800 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                3
                            </span>
                            <div>
                                <h4 className="text-base font-black text-slate-900 mb-1">
                                    Ordna och fäst uppgifter
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    I fliken <strong>"Slides"</strong> kan du dubbelklicka på sidans namn för att byta titel, dra i handtaget för att flytta ordningen, eller klicka på skärmikonen på valfri uppgift för att fästa den på aktuell sida.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Interaktiva Whiteboard-verktyg",
                subtitle: "Rita, skriv och dra ut laborativa hjälpmedel med verktygslådan.",
                icon: <Palette size={32} className="text-emerald-600" />,
                badge: "Steg 3 av 4: Laborativ Canvas",
                body: (
                    <div className="space-y-5">
                        <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">
                                De inbyggda verktygslådorna (Bottom Toolbar)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700 font-medium">
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-xs">x</span>
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Algebrabrickor:</strong>
                                        Skapa $x$-, $x^2$- och enhetsbrickor. Flytta dem mellan vänster- och högerled med automatisk teckenväxling.
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <span className="px-2.5 py-1 bg-cyan-600 text-white font-black rounded-lg text-xs">½</span>
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Bråkmodeller:</strong>
                                        Bråkcirklar och bråkrektanglar med justerbara nämnare och täljare för att visualisera andelar.
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <span className="px-2.5 py-1 bg-blue-600 text-white font-black rounded-lg text-xs">3D</span>
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">2D & 3D-Geometri:</strong>
                                        Cylindrar, koner, prismor och rätblock med synliga måttlinjer och höjdangivelser.
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <span className="px-2.5 py-1 bg-indigo-600 text-white font-black rounded-lg text-xs">(x,y)</span>
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Koordinatsystem:</strong>
                                        Rutnät med skalbara axlar där du kan pricka in punkter och rita linjära funktioner.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-indigo-50 border-2 border-indigo-200 rounded-3xl text-sm text-indigo-950 font-semibold flex items-center gap-3.5">
                            <span className="text-2xl shrink-0">💡</span>
                            <span className="leading-relaxed">
                                Alla ritningar, linjer och objekt sparas automatiskt på den specifika sliden när du klickar på <strong>"Spara"</strong> i toppmenyn.
                            </span>
                        </div>
                    </div>
                )
            },
            {
                title: "Live-Lektioner & Ny Omgång",
                subtitle: "Kör interaktivt med klassen och starta nya utmaningar på samma slide.",
                icon: <Radio size={32} className="text-rose-500" />,
                badge: "Steg 4 av 4: Interaktiv Lektion",
                body: (
                    <div className="space-y-5">
                        <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-xs">
                            <ol className="space-y-4 text-sm text-slate-700 font-medium">
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">1</span>
                                    <span className="leading-relaxed">Klicka på <strong>"Gå Live"</strong>. Eleverna ansluter på sina egna enheter och ser exakt samma 16:9-bild.</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">2</span>
                                    <span className="leading-relaxed">Eleverna har tillgång till pennor och laborativa verktygslådor och skickar in sin tavla via panelen <strong>"Dina Svar"</strong>.</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">3</span>
                                    <span className="leading-relaxed">I lärarvyn ser du allas inskickade lösningar. Klicka på valfri elev för att förstora och lyfta fram intressanta resonemang.</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">4</span>
                                    <span className="leading-relaxed">Klicka på <strong>"Ny Omgång"</strong> när som helst. Alla elevsvar nollställs direkt så klassen kan lösa en ny uppgift på samma slide!</span>
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

                        <div className="p-5 bg-emerald-50 border-2 border-emerald-200 rounded-3xl text-sm text-emerald-950 font-semibold flex items-center gap-3.5">
                            <span className="text-2xl shrink-0">✨</span>
                            <span className="leading-relaxed">
                                För sidor med slumpade matteuppgifter visas knappen <strong>"Slumpa Ny"</strong> istället, vilket direkt ger klassen nya tal i samma uppgiftsformat.
                            </span>
                        </div>
                    </div>
                )
            }
        ],
        en: [
            {
                title: "Welcome to Presentation Mode",
                subtitle: "Turn worksheets and math problems into interactive presentations.",
                icon: <Presentation size={32} className="text-amber-500" />,
                badge: "Step 1 of 4: Overview",
                body: (
                    <div className="space-y-6">
                        <p className="text-lg text-slate-700 leading-relaxed font-medium">
                            Presentation Mode turns your saved math content into a 16:9 widescreen slide deck. 
                            You get an interactive digital whiteboard, built-in manipulatives, and real-time student participation on classroom devices.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                            <div className="p-6 bg-amber-50/80 border-2 border-amber-200 rounded-3xl flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-4 shadow-sm">
                                        <Monitor size={26} />
                                    </div>
                                    <h4 className="text-base font-black uppercase tracking-wider text-amber-950 mb-2">
                                        16:9 Widescreen
                                    </h4>
                                    <p className="text-sm text-amber-900 font-medium leading-relaxed">
                                        Optimized aspect ratio designed for smartboards, classroom projectors, and student screens.
                                    </p>
                                </div>
                                <span className="mt-5 text-xs font-black uppercase text-amber-800 tracking-wider">
                                    Stage View →
                                </span>
                            </div>

                            <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm">
                                        <Palette size={26} />
                                    </div>
                                    <h4 className="text-base font-black uppercase tracking-wider text-indigo-950 mb-2">
                                        Manipulative Bins
                                    </h4>
                                    <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                                        Spawn algebra tiles, 2D/3D geometry models, fraction shapes, and coordinate planes on demand.
                                    </p>
                                </div>
                                <span className="mt-5 text-xs font-black uppercase text-indigo-700 tracking-wider">
                                    Tool Drawers →
                                </span>
                            </div>

                            <div className="p-6 bg-rose-50/80 border-2 border-rose-200 rounded-3xl flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-4 shadow-sm">
                                        <Users size={26} />
                                    </div>
                                    <h4 className="text-base font-black uppercase tracking-wider text-rose-950 mb-2">
                                        Live Student Work
                                    </h4>
                                    <p className="text-sm text-rose-800 font-medium leading-relaxed">
                                        Students manipulate tools on their own devices and submit their boards for live class discussion.
                                    </p>
                                </div>
                                <span className="mt-5 text-xs font-black uppercase text-rose-700 tracking-wider">
                                    Classroom Interaction →
                                </span>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "From Worksheet to Slides in 1 Click",
                subtitle: "Import saved questions and distribute them automatically onto separate slides.",
                icon: <Layers size={32} className="text-indigo-600" />,
                badge: "Step 2 of 4: Slide Generation",
                body: (
                    <div className="space-y-4">
                        <div className="p-5 bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                1
                            </span>
                            <div>
                                <h4 className="text-base font-black text-slate-900 mb-1">
                                    Load questions from your library
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Open any saved worksheet by clicking <strong>"Present"</strong> in Question Studio, or click <strong>"Math"</strong> in the left sidebar to summon fresh generator templates.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                2
                            </span>
                            <div>
                                <h4 className="text-base font-black text-emerald-950 mb-1">
                                    Instant deck creation: 1 question per slide
                                </h4>
                                <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                                    Go to the <strong>"Questions"</strong> tab in the sidebar and click <strong>"1 question per slide"</strong>. The system instantly generates a dedicated presentation slide for every single question.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-start gap-4">
                            <span className="w-9 h-9 rounded-xl bg-slate-800 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                                3
                            </span>
                            <div>
                                <h4 className="text-base font-black text-slate-900 mb-1">
                                    Organize and pin problems
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Under the <strong>"Slides"</strong> tab, double-click a slide name to rename it, drag handles to reorder, or click the screen icon next to any problem to pin it to your active slide.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Interactive Canvas & Manipulatives",
                subtitle: "Draw, annotate, and spawn visual math tools with the bottom toolbar.",
                icon: <Palette size={32} className="text-emerald-600" />,
                badge: "Step 3 of 4: Digital Tools",
                body: (
                    <div className="space-y-5">
                        <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">
                                Tool Drawers (Bottom Toolbar)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700 font-medium">
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-xs">x</span>
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Algebra Tiles:</strong>
                                        Spawn $x$, $x^2$, and unit tiles. Drag them across the equal sign to automatically switch positive/negative signs.
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <span className="px-2.5 py-1 bg-cyan-600 text-white font-black rounded-lg text-xs">½</span>
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Fraction Shapes:</strong>
                                        Circles and fraction bars with adjustable numerators and denominators to visualize equivalent parts.
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <span className="px-2.5 py-1 bg-blue-600 text-white font-black rounded-lg text-xs">3D</span>
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">2D & 3D Geometry:</strong>
                                        Cylinders, cones, prisms, and cubes with transparent fills and explicit height dimension markers.
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                                    <span className="px-2.5 py-1 bg-indigo-600 text-white font-black rounded-lg text-xs">(x,y)</span>
                                    <div>
                                        <strong className="block text-slate-900 text-sm mb-0.5">Coordinate Axes:</strong>
                                        Scaled coordinate planes where you can plot points and sketch linear equations.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-indigo-50 border-2 border-indigo-200 rounded-3xl text-sm text-indigo-950 font-semibold flex items-center gap-3.5">
                            <span className="text-2xl shrink-0">💡</span>
                            <span className="leading-relaxed">
                                All annotations, shapes, and moved objects are saved directly to that slide when you click <strong>"Save"</strong> in the top bar.
                            </span>
                        </div>
                    </div>
                )
            },
            {
                title: "Live Lessons & New Rounds",
                subtitle: "Run interactive sessions and pose multiple challenges on the same slide.",
                icon: <Radio size={32} className="text-rose-500" />,
                badge: "Step 4 of 4: Classroom Practice",
                body: (
                    <div className="space-y-5">
                        <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-xs">
                            <ol className="space-y-4 text-sm text-slate-700 font-medium">
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">1</span>
                                    <span className="leading-relaxed">Click <strong>"Go Live"</strong>. Students join on their Chromebooks/tablets and see your active 16:9 slide.</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">2</span>
                                    <span className="leading-relaxed">Students have access to pens and manipulatives, submitting their board via the <strong>"Your Answers"</strong> panel.</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">3</span>
                                    <span className="leading-relaxed">In the teacher live view, student boards populate in real time. Click any submission to spotlight and discuss it with the class.</span>
                                </li>
                                <li className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">4</span>
                                    <span className="leading-relaxed">Click <strong>"New Round"</strong> anytime. All student boards reset instantly so they can solve your next verbal prompt on the same slide!</span>
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

                        <div className="p-5 bg-emerald-50 border-2 border-emerald-200 rounded-3xl text-sm text-emerald-950 font-semibold flex items-center gap-3.5">
                            <span className="text-2xl shrink-0">✨</span>
                            <span className="leading-relaxed">
                                For slides with randomized math problems, the button shows <strong>"Regen"</strong> instead, instantly giving the class new numbers in the same format.
                            </span>
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