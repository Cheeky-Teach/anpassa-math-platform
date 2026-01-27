export const CATEGORIES = {
    arithmetic: {
        label: { sv: "Taluppfattning", en: "Number Theory" },
        color: "pink",
        topics: [
            { id: 'arithmetic', label: { sv: "De Fyra Räknesätten", en: "Basic Counting" } },
            { id: 'negative', label: { sv: "Negativa Tal", en: "Negative Numbers" } },
            { id: 'ten_powers', label: { sv: "10, 100, 1000", en: "10, 100, 1000" } }
        ]
    },
    algebra: {
        label: { sv: "Algebra", en: "Algebra" },
        color: "indigo",
        topics: [
            { id: 'simplify', label: { sv: "Uttryck", en: "Expressions" } },
            { id: 'equation', label: { sv: "Ekvationer", en: "Equations" } }
        ]
    },
    geometry: {
        label: { sv: "Geometri", en: "Geometry" },
        color: "emerald",
        topics: [
            { id: 'geometry', label: { sv: "Area & Omkrets", en: "Area & Perimeter" } },
            { id: 'scale', label: { sv: "Skala", en: "Scale" } },
            { id: 'volume', label: { sv: "Volym", en: "Volume" } },
            { id: 'similarity', label: { sv: "Likformighet", en: "Similar Shapes" } }
        ]
    },
    functions: {
        label: { sv: "Samband", en: "Functions" },
        color: "purple",
        topics: [
            { id: 'graph', label: { sv: "Räta Linjen", en: "Linear Graphs" } }
        ]
    }
};

export const LEVEL_DESCRIPTIONS = {
    arithmetic: {
        1: { sv: "Addition (1-3 siffror)", en: "Addition (1-3 digits)" },
        2: { sv: "Subtraktion (1-3 siffror)", en: "Subtraction (1-3 digits)" },
        3: { sv: "Decimaltal (+/-)", en: "Decimals (+/-)" },
        4: { sv: "Multiplikation (Lätt)", en: "Multiplication (Easy)" },
        5: { sv: "Multiplikation (Medel)", en: "Multiplication (Medium)" },
        6: { sv: "Multiplikation (Svår)", en: "Multiplication (Hard)" },
        7: { sv: "Division (Lätt)", en: "Division (Easy)" },
        8: { sv: "Alla räknesätt (heltal)", en: "Mixed Integers" },
        9: { sv: "Alla räknesätt (med decimal)", en: "Mixed (incl. Decimals)" }
    },
    negative: {
        1: { sv: "Addition & Subtraktion", en: "Addition & Subtraction" },
        2: { sv: "Addition & Subtraktion (Svår)", en: "Addition & Subtraction (Hard)" },
        3: { sv: "Multiplikation", en: "Multiplication" },
        4: { sv: "Division", en: "Division" },
        5: { sv: "Blandat", en: "Mixed" }
    },
    ten_powers: {
        1: { sv: "Multiplikation & Division (10, 100...)", en: "Mult & Div (10, 100...)" },
        2: { sv: "Begreppsförståelse (MC)", en: "Conceptual (MC)" },
        3: { sv: "Decimala faktorer (0.1, 0.01...)", en: "Decimal factors (0.1, 0.01...)" }
    },
    equation: {
        1: { sv: "Enstegsekvationer", en: "One-step equations" },
        2: { sv: "Tvåstegsekvationer", en: "Two-step equations" },
        3: { sv: "Multiplikation med parentes", en: "Multiplication with parentheses" },
        4: { sv: "X på båda sidor", en: "X on both sides" },
        5: { sv: "Problemlösning (Skriv)", en: "Word Problems (Write)" },
        6: { sv: "Problemlösning (Lös)", en: "Word Problems (Solve)" },
        7: { sv: "Blandat", en: "Mixed" }
    },
    simplify: {
        1: { sv: "Förenkla uttryck", en: "Combine like terms" },
        2: { sv: "Parenteser", en: "Distribute into parentheses" },
        3: { sv: "Distribuera & förenkla", en: "Distribute and combine" },
        4: { sv: "Subtrahera parenteser", en: "Subtracting parentheses" },
        5: { sv: "Textuppgifter", en: "Word Problems" },
        6: { sv: "Blandat", en: "Mixed" }
    },
    geometry: {
        1: { sv: "Omkrets (Rektangel)", en: "Perimeter (Rectangle)" },
        2: { sv: "Area (Rektangel)", en: "Area (Rectangle)" },
        3: { sv: "Area (Triangel)", en: "Area (Triangle)" },
        4: { sv: "Cirklar (Omkrets & Area)", en: "Circles (Perimeter & Area)" },
        5: { sv: "Sammansatta figurer", en: "Composite shapes" }
    },
    scale: {
        1: { sv: "Begreppsförståelse", en: "Concepts" },
        2: { sv: "Beräkna längd (Enkel)", en: "Calc Length (Simple)" },
        3: { sv: "Beräkna längd (Svår)", en: "Calc Length (Hard)" },
        4: { sv: "Ange skala", en: "Determine Scale" },
        5: { sv: "Utan bilder", en: "No Pictures" },
        6: { sv: "Areaskala", en: "Area Scale" },
        7: { sv: "Blandat", en: "Mixed" }
    },
    volume: {
        1: { sv: "Rätblock & Kub", en: "Prisms & Cubes" },
        2: { sv: "Triangulärt Prisma", en: "Triangular Prism" },
        3: { sv: "Cylinder", en: "Cylinder" },
        4: { sv: "Pyramid & Kon", en: "Pyramid & Cone" },
        5: { sv: "Klot", en: "Sphere" },
        6: { sv: "Blandat", en: "Mixed" },
        7: { sv: "Blandat med olika enheter", en: "Mixed with units" }
    },
    similarity: {
        1: { sv: "Likformig eller inte?", en: "Similar or not?" },
        2: { sv: "Beräkna längden (x)", en: "Calculate length (x)" },
        3: { sv: "Topptriangelsatsen", en: "Top Triangle Theorem" },
        4: { sv: "Pythagoras sats", en: "Pythagorean Theorem" }
    },
    graph: {
        1: { sv: "Hitta m (skärning)", en: "Find y-intercept (m)" },
        2: { sv: "Hitta k (positiv)", en: "Find slope (Positive)" },
        3: { sv: "Hitta k (negativ)", en: "Find slope (Negative)" },
        4: { sv: "Hitta funktion (y=kx+m)", en: "Find equation (y=kx+m)" },
        5: { sv: "Blandat", en: "Mixed graphs" }
    }
};

export const UI_TEXT = {
    sv: {
        streak: "",
        loading: "Laddar fråga...", error: "Kunde inte ladda frågan.",
        btnHint: "Ledtråd", btnSolution: "Visa lösning", btnSkip: "Hoppa över",
        submit: "Svara", correct: "Rätt! Nästa...", incorrect: "Inte riktigt, försök igen", placeholder: "Skriv ditt svar...",
        level: "Nivå", history: "Historik", noHistory: "Inga svar än.", clueUsed: "Hjälp",
        dashboardTitle: "Välj område att öva på",
        progressionInfo: "Välj ett område. Systemet anpassar sig efter dig. Klarar du 8 frågor i rad på en nivå föreslår vi att du går vidare till nästa.",
        startBtn: "Börja öva", backBtn: "Meny", selectLevel: "Välj nivå:",
        hintsTitle: "Ledtrådar", prevLevel: "Föregående", nextLevel: "Nästa",
        levelUpTitle: "Bra jobbat! 🔥", levelUpDesc: "Du har klarat 8 frågor i rad! Vill du gå vidare till nästa nivå?", levelUpYes: "Nästa nivå", levelUpNo: "Stanna på samma nivå", levelUpHint: "Kom ihåg att du alltid kan byta nivå manuellt högst upp på sidan.",
        aboutBtn: "Om skaparen", aboutTitle: "Om skaparen", aboutText: "Charles är en speciallärare som arbetar i Sverige och brinner för att upptäcka nya sätt att undervisa i klassrummet.",
        contactLink: "Följ mig på LinkedIn",
        tagline: "Rätt stöd. Direkt.",
        tagCorrect: "Rätt", tagWrong: "Fel", tagSkipped: "Hoppad",
        streak_modal_title: "Fantastiskt! 🔥", streak_modal_msg: "Du har nått en streak på {streak}!",
        total_modal_title: "Snyggt jobbat! ✅", total_modal_msg: "Du svarade rätt på {total} frågor! Bra jobbat!",
        btn_close_streak: "Bra jobbat!", btn_close_total: "Fortsätt",
        timer_title: "Övningstimer", timer_off: "Av", timer_min: "min", timer_reset: "Återställ", timer_paused: "Pausad",
        stats_title: "Statistik", stats_times_up: "Tiden är ute!", stats_longest_streak: "Längsta streak", stats_attempted: "Försökta frågor", stats_correct_no_help: "Rätt (utan hjälp)", stats_correct_help: "Rätt (med hjälp)", stats_incorrect: "Fel", stats_skipped: "Hoppade över", stats_close: "Stäng",
        menu_btn: "Meny", level_breakdown: "Nivådetaljer",
        stat_skip: "Hoppad", stat_wrong: "Fel", stat_help: "Hjälp", stat_correct: "Rätt", stat_total: "Totalt",
        lgr_btn: "LGR22",
        donow_btn: "Do Now", donow_title: "Uppstart (Do Now)", donow_desc: "Välj upp till 3 nivåer. Systemet genererar 6 frågor totalt.", donow_gen: "Generera", donow_clear: "Rensa", donow_show_all: "Visa alla svar", donow_hide_all: "Dölj alla svar"
    },
    en: {
        streak: "",
        loading: "Loading question...", error: "Could not load question.",
        btnHint: "Hint", btnSolution: "Show Solution", btnSkip: "Skip",
        submit: "Submit", correct: "Correct! Next...", incorrect: "Not quite, try again", placeholder: "Enter your answer...",
        level: "Level", history: "History", noHistory: "No answers yet.", clueUsed: "Clue",
        dashboardTitle: "Choose a topic to practice",
        progressionInfo: "Choose a topic. The system adapts to you. Answer 8 questions correctly in a row to unlock the next level.",
        startBtn: "Start Practice", backBtn: "Menu", selectLevel: "Select Level:",
        hintsTitle: "Hints", prevLevel: "Previous", nextLevel: "Next",
        levelUpTitle: "Great Job! 🔥", levelUpDesc: "You've answered 8 in a row! Do you want to try the next level?", levelUpYes: "Next Level", levelUpNo: "Stay Here", levelUpHint: "Remember, you can always change difficulty manually at the top.",
        aboutBtn: "About the creator", aboutTitle: "About the creator", aboutText: "Charles is a special education teacher currently working in Sweden and is passionate about discovering new ways to teach in the classroom.",
        contactLink: "Follow me on LinkedIn",
        tagline: "Right support. Instantly.",
        tagCorrect: "Correct", tagWrong: "Wrong", tagSkipped: "Skipped",
        streak_modal_title: "Awesome! 🔥", streak_modal_msg: "You hit a streak of {streak}!",
        total_modal_title: "Great work! ✅", total_modal_msg: "You answered {total} questions correctly! Great job!",
        btn_close_streak: "Great job!", btn_close_total: "Continue",
        timer_title: "Practice Timer", timer_off: "Off", timer_min: "min", timer_reset: "Reset", timer_paused: "Paused",
        stats_title: "Statistics", stats_times_up: "Time's up!", stats_longest_streak: "Longest streak", stats_attempted: "Problems attempted", stats_correct_no_help: "Correct (no help)", stats_correct_help: "Correct (with help)", stats_incorrect: "Incorrect", stats_skipped: "Skipped", stats_close: "Close",
        menu_btn: "Menu", level_breakdown: "Level Breakdown",
        stat_skip: "Skip", stat_wrong: "Wrong", stat_help: "Help", stat_correct: "Correct", stat_total: "Total",
        lgr_btn: "LGR22",
        donow_btn: "Do Now", donow_title: "Do Now Activity", donow_desc: "Select up to 3 levels. System generates 6 questions total.", donow_gen: "Generate", donow_clear: "Clear", donow_show_all: "Show all answers", donow_hide_all: "Hide all answers"
    }
};