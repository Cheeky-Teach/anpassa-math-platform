export const CATEGORIES = {
    arithmetic: {
        id: 'arithmetic', 
        label: { sv: "Taluppfattning", en: "Number Theory" },
        color: "pink",
        levels: 9,
        topics: [
            { id: 'arithmetic', label: { sv: "De Fyra Räknesätten", en: "Basic Counting" } },
            { id: 'order_of_operations', label: { sv: "Prioriteringsregler", en: "Order of Operations" } }, // Ny generator tillagd här
            { id: 'fraction_basics', label: { sv: "Bråk: Grunder", en: "Fractions: Basics" } }, 
            { id: 'fraction_arith', label: { sv: "Bråk: Räkna", en: "Fractions: Arithmetic" } }, 
            { id: 'negative', label: { sv: "Negativa Tal", en: "Negative Numbers" } },
            { id: 'ten_powers', label: { sv: "10, 100, 1000", en: "10, 100, 1000" } },
            { id: 'exponents', label: { sv: "Potenser & Rötter", en: "Exponents & Roots" } },
            { id: 'percent', label: { sv: "Procent", en: "Percentage" } }
        ]
    },
    
    algebra: {
        id: 'algebra',
        label: { sv: "Algebra", en: "Algebra" },
        color: "indigo",
        levels: 6,
        topics: [
            { id: 'simplify', label: { sv: "Uttryck", en: "Expressions" } },
            { id: 'equation', label: { sv: "Ekvationer", en: "Equations" } },
            { id: 'patterns', label: { sv: "Algebraiska mönster", en: "Algebraic patterns" } }
        ]
    },
    geometry: {
        id: 'geometry',
        label: { sv: "Geometri", en: "Geometry" },
        color: "emerald",
        levels: 7,
        topics: [
            { id: 'geometry', label: { sv: "Area & Omkrets", en: "Area & Perimeter" } },
            { id: 'scale', label: { sv: "Skala", en: "Scale" } },
            { id: 'volume', label: { sv: "Volym", en: "Volume" } },
            { id: 'similarity', label: { sv: "Likformighet", en: "Similar Shapes" } },
            { id: 'pythagoras', label: { sv: "Pythagoras Sats", en: "Pythagoras" } },
            { id: 'angles', label: { sv: "Vinklar", en: "Angles" } }
        ]
    },

    statistics: { 
        id: 'statistics',
        label: { sv: "Sannolikhet & Statistik", en: "Prob & Stats" },
        color: "yellow", 
        levels: 6,
        topics: [
             { id: 'probability', label: { sv: "Sannolikhet", en: "Probability" } },
             { id: 'statistics', label: { sv: "Statistik", en: "Statistics" } },
             { id: 'linear_graph', label: { sv: "Räta Linjen", en: "Linear Graphs" } },
             { id: 'change_factor', label: { sv: "Förändringsfaktor", en: "Change Factor" } }
        ]
    }
};

export const CATEGORIES_ARRAY = Object.values(CATEGORIES);

export const UI_TEXT = {
    sv: {
        hero_title: "Mattestöd",
        hero_subtitle: "Anpassade uppgifter för högstadiet.",
        tagline: "Rätt stöd. Direkt.",
        startBtn: "Starta Övning",
        aboutBtn: "Om Skaparen",
        contactTitle: "Kontakta mig",
        aboutTitle: "Om Skaparen",
        aboutText: "Charles är en speciallärare som arbetar i Sverige och brinner för att hitta nya sätt att undervisa i klassrummet.",
        contactLink: "Följ mig på LinkedIn",
        tagCorrect: "Rätt", tagWrong: "Fel", tagSkipped: "Hoppade över",
        streak_modal_title: "Grymt jobbat! 🔥", streak_modal_msg: "Du har en streak på {streak}!",
        total_modal_title: "Bra jobbat! ✅", total_modal_msg: "Du har klarat {total} uppgifter! Fortsätt så!",
        btn_close_streak: "Kör vidare!", btn_close_total: "Fortsätt",
        timer_title: "Timer", timer_off: "Av", timer_min: "min", timer_reset: "Nollställ", timer_paused: "Pausad",
        stats_title: "Statistik", stats_times_up: "Tiden är ute!", stats_longest_streak: "Längsta streak", stats_attempted: "Försök", stats_correct_no_help: "Rätt (utan hjälp)", stats_correct_help: "Rätt (med hjälp)", stats_incorrect: "Fel", stats_skipped: "Hoppade över", stats_close: "Stäng",
        menu_btn: "Meny", level_breakdown: "Nivådetaljer",
        stat_skip: "Hopp", stat_wrong: "Fel", stat_help: "Hjälp", stat_correct: "Rätt", stat_total: "Totalt",
        lgr_btn: "LGR22",
        donow_btn: "Do Now", donow_title: "Do Now Aktivitet", donow_desc: "Välj upp till 3 nivåer för att generera ett startkort.",
        donow_generate: "Generera", backBtn: "Tillbaka",
        donow_show_all: "Visa Alla Svar", donow_hide_all: "Dölj Alla Svar",
        donow_regenerate: "Nytt Set", 
        levels: "Nivåer",
        clickToSelect: "Klicka för att välja nivå",
        selectLevel: "Välj Nivå",
        btnCheck: "Svara", btnHint: "Ledtråd", btnSolution: "Lösning", btnSkip: "Hoppa över",
        btnNext: "Nästa ➡",
        error: "Något gick fel. Försök igen.",
        levelUpTitle: "Nivå upp?", levelUpDesc: "Du verkar ha koll på detta! Vill du hoppa till nästa nivå?", levelUpYes: "Ja, kör!", levelUpNo: "Nej, stanna här"
    },
    en: {
        hero_title: "Math Support",
        hero_subtitle: "Adaptive exercises for middle school.",
        tagline: "Right support. Instantly.",
        startBtn: "Start Practice",
        aboutBtn: "About Creator",
        contactTitle: "Contact Me",
        aboutTitle: "About the Creator",
        aboutText: "Charles is a special education teacher currently working in Sweden and is passionate about discovering new ways to teach in the classroom.",
        contactLink: "Follow me on LinkedIn",
        tagCorrect: "Correct", tagWrong: "Wrong", tagSkipped: "Skipped",
        streak_modal_title: "Awesome! 🔥", streak_modal_msg: "You hit a streak of {streak}!",
        total_modal_title: "Great work! ✅", total_modal_msg: "You answered {total} questions correctly! Great job!",
        btn_close_streak: "Great job!", btn_close_total: "Continue",
        timer_title: "Practice Timer", timer_off: "Off", timer_min: "min", timer_reset: "Reset", timer_paused: "Paused",
        stats_title: "Statistics", stats_times_up: "Time's up!", stats_longest_streak: "Longest streak", stats_attempted: "Problems attempted", stats_correct_no_help: "Correct (no help)", stats_correct_help: "Correct (with help)", stats_incorrect: "Incorrect", stats_skipped: "Skipped", stats_close: "Close",
        menu_btn: "Menu", level_breakdown: "Level Breakdown",
        stat_skip: "Skip", stat_wrong: "Wrong", stat_help: "Help", stat_correct: "Correct", stat_total: "Total",
        lgr_btn: "LGR22",
        donow_btn: "Do Now", donow_title: "Do Now Activity", donow_desc: "Select up to 3 levels to generate a startup card.",
        donow_generate: "Generate", backBtn: "Back",
        donow_show_all: "Show All Answers", donow_hide_all: "Hide All Answers",
        donow_regenerate: "New Set", 
        levels: "Levels",
        clickToSelect: "Click to select level",
        selectLevel: "Select Level",
        btnCheck: "Submit", btnHint: "Hint", btnSolution: "Solution", btnSkip: "Skip",
        btnNext: "Next ➡",
        error: "Something went wrong. Please retry.",
        levelUpTitle: "Level Up?", levelUpDesc: "You seem to know this! Do you want to skip to the next level?", levelUpYes: "Yes, let's go!", levelUpNo: "No, stay here"
    }
};

export const LEVEL_DESCRIPTIONS = {
    order_of_operations: {
        1: { sv: "Prioritering: Grund", en: "Order: Basics" },
        2: { sv: "Prioritering: Parenteser", en: "Order: Parentheses" },
        3: { sv: "Prioritering: Bråkstreck", en: "Order: Fraction Bars" },
        4: { sv: "Prioritering: Potenser", en: "Order: Powers" }
    },
    angles: {
        1: { sv: "Vinkeltyper", en: "Types of Angles" },
        2: { sv: "Komplement & Supplement", en: "Complementary & Supplementary" },
        3: { sv: "Vertikal- & Sidovinklar", en: "Vertical & Adjacent Angles" },
        4: { sv: "Vinkelsumma (Triangel)", en: "Triangle Angle Sum" },
        5: { sv: "Likbelägna & Alternatvinklar", en: "Parallel Lines" },
        6: { sv: "Vinkelsumma (Polygoner)", en: "Polygon Angle Sum" }
    },
    change_factor: {
        1: { sv: "Begrepp & Definition", en: "Concepts & Definitions" },
        2: { sv: "Beräkna nya värdet", en: "Calculate New Value" },
        3: { sv: "Beräkna gamla värdet", en: "Find Original Value" },
        4: { sv: "Total förändring", en: "Total Change" },
        5: { sv: "Textuppgifter", en: "Word Problems" }
    },
    fraction_basics: {
        1: { sv: "Visuella Bråk", en: "Visual Fractions" },
        2: { sv: "Beräkna delen", en: "Parts of a Quantity" },
        3: { sv: "Blandad & Bråkform", en: "Mixed & Improper" },
        4: { sv: "Förlänga & Förkorta", en: "Simplify & Extend" },
        5: { sv: "Bråk & Decimaltal", en: "Fractions & Decimals" }
    },
    fraction_arith: {
        1: { sv: "Addition & Subtraktion (Lika)", en: "Add & Sub (Same Denom)" },
        2: { sv: "Addition & Subtraktion (Olika)", en: "Add & Sub (Diff Denom)" },
        3: { sv: "Blandad form (+ och -)", en: "Mixed Numbers (+ and -)" },
        4: { sv: "Multiplikation", en: "Multiplication" },
        5: { sv: "Division", en: "Division" }
    },
    exponents: { 
        1: { sv: "Grunder & x^0", en: "Foundations & x^0" },
        2: { sv: "Tiopotenser", en: "Powers of 10" },
        3: { sv: "Grundpotensform", en: "Scientific Notation" },
        4: { sv: "Kvadratrötter", en: "Square Roots" },
        5: { sv: "Potenslagar (Enkel)", en: "Exponent Laws (Basic)" },
        6: { sv: "Potenslagar (Avancerad)", en: "Exponent Laws (Adv)" }
    },
    arithmetic: {
        1: { sv: "Addition (Uppställning)", en: "Addition (Vertical)" },
        2: { sv: "Subtraktion (Uppställning)", en: "Subtraction (Vertical)" },
        3: { sv: "Decimaltal (+/-)", en: "Decimals (+/-)" },
        4: { sv: "Multiplikation (Enkel)", en: "Multiplication (Simple)" },
        5: { sv: "Multiplikation (Medel)", en: "Multiplication (Medium)" },
        6: { sv: "Multiplikation (Svår)", en: "Multiplication (Hard)" },
        7: { sv: "Kort Division", en: "Short Division" },
        8: { sv: "Blandade Heltal", en: "Mixed Integers" },
        9: { sv: "Blandade Decimaltal", en: "Mixed Decimals" }
    },
    negative: {
        1: { sv: "Enkel Addition/Subtraktion", en: "Simple Add/Sub" },
        2: { sv: "Svårare Addition/Subtraktion", en: "Harder Add/Sub" },
        3: { sv: "Multiplikation", en: "Multiplication" },
        4: { sv: "Division", en: "Division" },
        5: { sv: "Blandade Uppgifter", en: "Mixed Problems" }
    },
    ten_powers: {
        1: { sv: "Mult/Div med 10, 100, 1000", en: "Mult/Div by 10, 100, 1000" },
        2: { sv: "Begreppsförståelse", en: "Conceptual Understanding" },
        3: { sv: "Blandade Faktorer (0.1, 100...)", en: "Mixed Factors" }
    },
    percent: { 
        1: { sv: "Grundläggande (Rutnät)", en: "Basic Concepts (Grid)" },
        2: { sv: "Huvudräkning (10%, 50%)", en: "Mental Math" },
        3: { sv: "Multiplar av 10%", en: "Multiples of 10%" },
        4: { sv: "Beräkna andelen (Decimal)", en: "Calculate Part (Decimal)" },
        5: { sv: "Hitta helheten (100%)", en: "Find Whole" },
        6: { sv: "Verklig Förändring", en: "Real World Change" }
    },
    probability: { 
        1: { sv: "Visuell Sannolikhet", en: "Visual Probability" },
        2: { sv: "Tärning & Slump", en: "Dice & Chance" },
        3: { sv: "Sannolikhet som Procent", en: "Probability as Percent" },
        4: { sv: "Komplementhändelse (Inte)", en: "Complementary Events" },
        5: { sv: "Träddiagram", en: "Probability Trees" },
        6: { sv: "Oberoende Händelser", en: "Independent Events" },
        7: { sv: "Kombinatorik", en: "Combinatorics" },
        8: { sv: "Kombinatorik (Svår)", en: "Combinatorics (Hard)" }
    },
    statistics: { 
        1: { sv: "Typvärde & Variationsbredd", en: "Mode & Range" },
        2: { sv: "Medelvärde", en: "Mean" },
        3: { sv: "Median", en: "Median" },
        4: { sv: "Baklänges medelvärde", en: "Reverse Mean" },
        5: { sv: "Frekvenstabell", en: "Frequency Table" },
        6: { sv: "Blandade begrepp", en: "Mixed Concepts" }
    },
    simplify: {
        1: { sv: "Förenkla Uttryck (Enkel)", en: "Simplify Expressions (Easy)" },
        2: { sv: "Parenteser (Addition)", en: "Parentheses (Addition)" },
        3: { sv: "Parenteser (Multiplikation)", en: "Parentheses (Multiplication)" },
        4: { sv: "Parenteser (Subtraktion)", en: "Parentheses (Subtraction)" },
        5: { sv: "Problemlösning", en: "Problem Solving" },
        6: { sv: "Blandade Nivåer", en: "Mixed Levels" }
    },
    equation: {
        1: { sv: "Enkla steg (x+a=b)", en: "One Step" },
        2: { sv: "Två steg (ax+b=c)", en: "Two Steps" },
        3: { sv: "Med Parenteser", en: "With Parentheses" },
        4: { sv: "Variabel på båda sidor", en: "Variables on both sides" },
        5: { sv: "Skriv Ekvation (Problem)", en: "Write Equation (Word Problems)" },
        6: { sv: "Lös Problem (Ekvation)", en: "Solve Word Problems" },
        7: { sv: "Blandade Ekvationer", en: "Mixed Equations" }
    },
    linear_graph: {
        1: { sv: "Hitta m-värdet", en: "Find m-value" },
        2: { sv: "Hitta k-värdet (Positiv)", en: "Find k-value (Positive)" },
        3: { sv: "Hitta k-värdet (Negativ)", en: "Find k-value (Negative)" },
        4: { sv: "Bestäm funktionen (y=kx+m)", en: "Determine Function" },
        5: { sv: "Blandat", en: "Mixed" }
    },
    geometry: {
        1: { sv: "Omkrets (Rektangel)", en: "Perimeter (Rectangle)" },
        2: { sv: "Area (Rektangel)", en: "Area (Rectangle)" },
        3: { sv: "Area (Triangel)", en: "Area (Triangle)" },
        4: { sv: "Sammansatta (Rekt+Tri)", en: "Composite Shapes (Rect+Tri)" },
        5: { sv: "Cirkelns Area & Omkrets", en: "Circle Area & Perimeter" },
        6: { sv: "Sammansatta (Alla)", en: "Composite Shapes (All)" }
    },
    scale: {
        1: { sv: "Förstå Skala", en: "Understand Scale" },
        2: { sv: "Beräkna Längd (Enkel)", en: "Calculate Length (Simple)" },
        3: { sv: "Blandade Scenarier", en: "Mixed Scenarios" }, 
        4: { sv: "Bestäm Skalan", en: "Determine Scale" },
        5: { sv: "Problemlösning", en: "Word Problems" },
        6: { sv: "Areaskala", en: "Area Scale" },
        7: { sv: "Blandat", en: "Mixed" }
    },
    volume: {
        1: { sv: "Rätblock & Kub", en: "Cuboid & Cube" },
        2: { sv: "Prisma", en: "Prism" },
        3: { sv: "Cylinder", en: "Cylinder" },
        4: { sv: "Pyramid & Kon", en: "Pyramid & Cone" },
        5: { sv: "Klot & Sammansatta", en: "Sphere & Composite" },
        6: { sv: "Blandade Volymer", en: "Mixed Volumes" },
        7: { sv: "Enhetsomvandling", en: "Unit Conversion" },
        8: { sv: "Begränsningsyta", en: "Surface Area" } 
    },
    similarity: {
        1: { sv: "Är de likformiga?", en: "Are they similar?" },
        2: { sv: "Beräkna sida (Enkel)", en: "Calc Side (Simple)" },
        3: { sv: "Topptriangelsatsen", en: "Top Triangle Theorem" },
        4: { sv: "Blandad (1-3)", en: "Mixed (1-3)" }
    },
    pythagoras: {
        1: { sv: "Kvadrater & Rötter", en: "Squares & Roots" },
        2: { sv: "Hitta Hypotenusan", en: "Find Hypotenuse" },
        3: { sv: "Hitta Kateten", en: "Find Leg" },
        4: { sv: "Problemlösning", en: "Word Problems" },
        5: { sv: "Är den rätvinklig?", en: "Is it Right-Angled?" },
        6: { sv: "Avstånd (Koordinater)", en: "Distance (Coordinates)" }
    },
    patterns: { 
        1: { sv: "Hitta nästa tal & Skillnad", en: "Next Number & Difference" },
        2: { sv: "Beräkna höga figurer", en: "Calculate High Terms" },
        3: { sv: "Från bild till uttryck", en: "From Visual to Expression" },
        4: { sv: "Från tabell till formel", en: "Table to Formula" },
        5: { sv: "Lös ut n (baklänges)", en: "Solve for n" }
    }
};