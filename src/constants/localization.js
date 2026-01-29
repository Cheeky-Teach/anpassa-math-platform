export const CATEGORIES = {
    arithmetic: {
        id: 'arithmetic', // Ensure ID matches key for robust iteration
        label: { sv: "Taluppfattning", en: "Number Theory" },
        color: "pink",
        levels: 9,
        topics: [
            { id: 'arithmetic', label: { sv: "De Fyra Räknesätten", en: "Basic Counting" } },
            { id: 'negative', label: { sv: "Negativa Tal", en: "Negative Numbers" } },
            { id: 'ten_powers', label: { sv: "10, 100, 1000", en: "10, 100, 1000" } }
        ]
    },
    algebra: {
        id: 'algebra',
        label: { sv: "Algebra", en: "Algebra" },
        color: "indigo",
        levels: 6, // Approximate max
        topics: [
            { id: 'simplify', label: { sv: "Uttryck", en: "Expressions" } },
            { id: 'equation', label: { sv: "Ekvationer", en: "Equations" } },
            { id: 'linear_graph', label: { sv: "Räta Linjen", en: "Linear Graphs" } }
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
            { id: 'similarity', label: { sv: "Likformighet", en: "Similar Shapes" } }
        ]
    },
    samband: { // New/Legacy Category
        id: 'samband',
        label: { sv: "Samband", en: "Relationships" },
        color: "purple",
        levels: 5,
        topics: [
             { id: 'linear_graph', label: { sv: "Räta Linjen", en: "Linear Graphs" } }
        ]
    }
};

// Re-map for flat iteration if needed, but the structure above handles it well.
// We preserve the array structure used in the dashboard.
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
        donow_regenerate: "Nytt Set", // New Key
        levels: "Nivåer",
        clickToSelect: "Klicka för att välja nivå",
        selectLevel: "Välj Nivå",
        btnCheck: "Svara", btnHint: "Ledtråd", btnSolution: "Lösning", btnSkip: "Hoppa över",
        error: "Något gick fel. Försök igen."
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
        donow_regenerate: "New Set", // New Key
        levels: "Levels",
        clickToSelect: "Click to select level",
        selectLevel: "Select Level",
        btnCheck: "Submit", btnHint: "Hint", btnSolution: "Solution", btnSkip: "Skip",
        error: "Something went wrong. Please retry."
    }
};

export const LEVEL_DESCRIPTIONS = {
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
    simplify: {
        1: { sv: "Förenkla Uttryck (Enkel)", en: "Simplify Expressions (Easy)" },
        2: { sv: "Parenteser (Addition)", en: "Parentheses (Addition)" },
        3: { sv: "Parenteser (Multiplikation)", en: "Parentheses (Multiplication)" },
        4: { sv: "Parenteser (Subtraktion)", en: "Parentheses (Subtraction)" },
        5: { sv: "Problemlösning", en: "Problem Solving" },
        6: { sv: "Blandade Nivåer", en: "Mixed Levels" }
    },
    equation: {
        1: { sv: "Enkels steg (x+a=b)", en: "One Step" },
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
        4: { sv: "Cirkelns Area & Omkrets", en: "Circle Area & Perimeter" },
        5: { sv: "Sammansatta Figurer", en: "Composite Shapes" }
    },
    scale: {
        1: { sv: "Förstå Skala", en: "Understand Scale" },
        2: { sv: "Beräkna Längd (Enkel)", en: "Calculate Length (Simple)" },
        3: { sv: "Blandade Scenarier", en: "Mixed Scenarios" }, // Updated Name
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
        7: { sv: "Enhetsomvandling", en: "Unit Conversion" } // Updated Name
    },
    similarity: {
        1: { sv: "Är de likformiga?", en: "Are they similar?" },
        2: { sv: "Beräkna sida (Enkel)", en: "Calc Side (Simple)" },
        3: { sv: "Topptriangelsatsen", en: "Top Triangle Theorem" },
        4: { sv: "Pythagoras & Likformighet", en: "Pythagoras & Similarity" }
    }
};