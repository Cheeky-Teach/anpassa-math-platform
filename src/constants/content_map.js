/**
 * CONTENT_MAP
 * En omfattande guide över alla ämnesområden och progressioner i Anpassa.
 * Färgkodad per kategori för att matcha gränssnittet.
 */

export const CONTENT_MAP = [
    // ==========================================
    // 1. TALUPPFATTNING & ARITMETIK (Pink)
    // ==========================================
    {
        id: 'arithmetic',
        title: { sv: "Taluppfattning & Aritmetik", en: "Number Theory & Arithmetic" },
        color: "pink",
        topics: [
            {
                id: "arithmetic",
                name: { sv: "De Fyra Räknesätten", en: "The 4 Operations" },
                levels: [
                    { lvl: 1, desc: { sv: "Addition: Uppställning", en: "Addition: Column Method" }, ex: "345 + 129" },
                    { lvl: 2, desc: { sv: "Subtraktion: Växling", en: "Subtraction: Borrowing" }, ex: "502 - 148" },
                    { lvl: 3, desc: { sv: "Decimaltal: Vertikal räkning", en: "Decimals: Vertical" }, ex: "12,45 + 8,7" },
                    { lvl: 4, desc: { sv: "Multiplikation: Tabellträning", en: "Multiplication: Tables" }, ex: "7 × 8" },
                    { lvl: 5, desc: { sv: "Multiplikation: Uppställning", en: "Mult: Column Method" }, ex: "23 × 4" },
                    { lvl: 6, desc: { sv: "Multiplikation: Decimaler", en: "Mult: Decimals" }, ex: "0,5 × 12" },
                    { lvl: 7, desc: { sv: "Kort Division: Grunder", en: "Short Division: Basics" }, ex: "84 / 4" },
                    { lvl: 8, desc: { sv: "Heltal: Blandat", en: "Mixed Integers" }, ex: "45 + 12, 7 × 9" },
                    { lvl: 9, desc: { sv: "Decimaler: Blandat", en: "Mixed Decimals" }, ex: "1,2 + 0,8, 0,5 × 4" }
                ]
            },
            {
                id: "fraction_basics",
                name: { sv: "Bråk: Grunder", en: "Fractions: Basics" },
                levels: [
                    { lvl: 1, desc: { sv: "Visuella Bråk", en: "Visual Fractions" }, ex: "1/4 färgad" },
                    { lvl: 2, desc: { sv: "Andel av antal", en: "Fraction of a quantity" }, ex: "1/4 av 20" },
                    { lvl: 3, desc: { sv: "Blandad form & Bråkform", en: "Mixed & Improper" }, ex: "1 1/2 <-> 3/2" },
                    { lvl: 4, desc: { sv: "Förkortning & Förlängning", en: "Simplifying & Extending" }, ex: "2/4 = 1/2" },
                    { lvl: 5, desc: { sv: "Decimaltal <-> Bråk", en: "Decimals <-> Fractions" }, ex: "1/5 = 0,2" }
                ]
            },
            {
                id: "fraction_arith",
                name: { sv: "Bråkräkning", en: "Fraction Arithmetic" },
                levels: [
                    { lvl: 1, desc: { sv: "Add/Sub: Lika nämnare", en: "Add/Sub: Same denom" }, ex: "1/5 + 2/5" },
                    { lvl: 2, desc: { sv: "Add/Sub: Olika nämnare", en: "Add/Sub: Diff denom" }, ex: "1/2 + 1/4" },
                    { lvl: 3, desc: { sv: "Blandade tal", en: "Mixed Numbers" }, ex: "1 1/2 + 3/4" },
                    { lvl: 4, desc: { sv: "Multiplikation", en: "Multiplication" }, ex: "2/3 × 4/5" },
                    { lvl: 5, desc: { sv: "Division", en: "Division" }, ex: "1/2 / 1/4" }
                ]
            },
            {
                id: "negative",
                name: { sv: "Negativa Tal", en: "Negative Numbers" },
                levels: [
                    { lvl: 1, desc: { sv: "Grunder & Tallinjen", en: "Basics & Number line" }, ex: "-5 < -2" },
                    { lvl: 2, desc: { sv: "Add/Sub: Fluency", en: "Add/Sub: Fluency" }, ex: "5 + (-8)" },
                    { lvl: 3, desc: { sv: "Multiplikation", en: "Multiplication" }, ex: "(-3) × (-4)" },
                    { lvl: 4, desc: { sv: "Division", en: "Division" }, ex: "(-12) / 3" },
                    { lvl: 5, desc: { sv: "Blandade räknesätt", en: "Mixed operations" }, ex: "(-2) + 3 × (-4)" }
                ]
            },
            {
                id: "ten_powers",
                name: { sv: "10, 100, 1000", en: "Powers of Ten" },
                levels: [
                    { lvl: 1, desc: { sv: "Multiplikation & Division", en: "Mult & Div" }, ex: "3,5 × 100" },
                    { lvl: 2, desc: { sv: "Begrepp & Potensform", en: "Concepts & Power form" }, ex: "1000 = 10³" },
                    { lvl: 3, desc: { sv: "Division med 0,1 & 0,01", en: "Div by 0.1 & 0.01" }, ex: "5 / 0,1" }
                ]
            },
            {
                id: "exponents",
                name: { sv: "Potenser & Rötter", en: "Exponents & Roots" },
                levels: [
                    { lvl: 1, desc: { sv: "Grunder & Definitioner", en: "Foundations" }, ex: "3² = 9, x⁰ = 1" },
                    { lvl: 2, desc: { sv: "Tiopotenser", en: "Powers of Ten" }, ex: "10⁴, 10⁻²" },
                    { lvl: 3, desc: { sv: "Grundpotensform", en: "Scientific Notation" }, ex: "4,5 × 10³" },
                    { lvl: 4, desc: { sv: "Kvadratrötter", en: "Square Roots" }, ex: "√25 = 5" },
                    { lvl: 5, desc: { sv: "Potenslagar: Bas", en: "Basic Laws" }, ex: "x² × x³ = x⁵" },
                    { lvl: 6, desc: { sv: "Potenslagar: Avancerat", en: "Advanced Laws" }, ex: "(x²)³ = x⁶" }
                ]
            },
            {
                id: "percent",
                name: { sv: "Procent", en: "Percent" },
                levels: [
                    { lvl: 1, desc: { sv: "Begrepp & Bilder", en: "Concepts & Visuals" }, ex: "10% = 1/10" },
                    { lvl: 2, desc: { sv: "Huvudräkning (Bas)", en: "Mental Math" }, ex: "25% av 400" },
                    { lvl: 3, desc: { sv: "Sammansatta procent", en: "Composition" }, ex: "35% av 200" },
                    { lvl: 4, desc: { sv: "Andelen i procent", en: "Finding the Percent" }, ex: "8 av 40" },
                    { lvl: 5, desc: { sv: "Hitta det hela (100%)", en: "Find the Whole" }, ex: "10% är 5, vad är 100%?" },
                    { lvl: 6, desc: { sv: "Procentuell förändring", en: "Percentage Change" }, ex: "Från 200 till 250" }
                ]
            }
        ]
    },

    // ==========================================
    // 2. ALGEBRA (Indigo)
    // ==========================================
    {
        id: 'algebra',
        title: { sv: "Algebra & Mönster", en: "Algebra & Patterns" },
        color: "indigo",
        topics: [
            {
                id: "simplify",
                name: { sv: "Uttryck & Förenkling", en: "Expressions" },
                levels: [
                    { lvl: 1, desc: { sv: "Samla likadana termer", en: "Combine like terms" }, ex: "2x + 3x - x" },
                    { lvl: 2, desc: { sv: "Parenteser (Distributivitet)", en: "Parentheses" }, ex: "3(x + 2)" },
                    { lvl: 3, desc: { sv: "Expandera & Förenkla", en: "Expand & Simplify" }, ex: "2(x+3) + 4x" },
                    { lvl: 4, desc: { sv: "Minusparenteser", en: "Negative Parentheses" }, ex: "5 - (x - 2)" },
                    { lvl: 5, desc: { sv: "Vardagsproblem", en: "Word Problems" }, ex: "Teckna uttryck för lön" },
                    { lvl: 6, desc: { sv: "Blandad förenkling", en: "Mixed Simplification" }, ex: "Sammansatta uttryck" }
                ]
            },
            {
                id: "equations",
                name: { sv: "Ekvationer", en: "Equations" },
                levels: [
                    { lvl: 1, desc: { sv: "Enstegsekvationer", en: "One-step" }, ex: "x + 5 = 12" },
                    { lvl: 2, desc: { sv: "Tvåstegsekvationer", en: "Two-step" }, ex: "2x + 3 = 11" },
                    { lvl: 3, desc: { sv: "Ekvationer med parentes", en: "Parentheses" }, ex: "2(x + 1) = 10" },
                    { lvl: 4, desc: { sv: "Variabel på båda sidor", en: "Variables both sides" }, ex: "3x + 2 = x + 8" },
                    { lvl: 5, desc: { sv: "Teckna ekvationer", en: "Formulate Equations" }, ex: "Från text till ax+b=c" },
                    { lvl: 6, desc: { sv: "Problemlösning", en: "Problem Solving" }, ex: "Lös textuppgifter med ekvationer" }
                ]
            },
            {
                id: "patterns",
                name: { sv: "Mönster & Formler", en: "Patterns & Formulas" },
                levels: [
                    { lvl: 1, desc: { sv: "Talföljder & Differens", en: "Sequences" }, ex: "2, 5, 8, ..." },
                    { lvl: 2, desc: { sv: "Hitta höga figurnummer", en: "High Term Index" }, ex: "Figur nummer 100" },
                    { lvl: 3, desc: { sv: "Visuella Formler", en: "Visual Formulas" }, ex: "Tändsticksmönster" },
                    { lvl: 4, desc: { sv: "Tabell till Formel", en: "Table to Formula" }, ex: "y = an + b" },
                    { lvl: 5, desc: { sv: "Baklängesräkning", en: "Reverse Engineering" }, ex: "Vilken figur har 100 delar?" }
                ]
            },
            {
                id: "linear_graph",
                name: { sv: "Räta Linjens Ekvation", en: "Linear Graphs" },
                levels: [
                    { lvl: 1, desc: { sv: "Identifiera m-värde", en: "Find m-value" }, ex: "Skärning y-axeln" },
                    { lvl: 2, desc: { sv: "Positiv lutning (k)", en: "Positive Slope" }, ex: "Trappsteg upp" },
                    { lvl: 3, desc: { sv: "Negativ lutning (k)", en: "Negative Slope" }, ex: "Trappsteg ner" },
                    { lvl: 4, desc: { sv: "Bestäm formeln", en: "Determine Formula" }, ex: "y = kx + m" },
                    { lvl: 5, desc: { sv: "Blandade grafer", en: "Mixed Graphs" }, ex: "Analysera linjer" }
                ]
            },
            {
                id: "change_factor",
                name: { sv: "Förändringsfaktor", en: "Change Factors" },
                levels: [
                    { lvl: 1, desc: { sv: "Begrepp & Omvandling", en: "Concepts" }, ex: "+20% -> 1,20" },
                    { lvl: 2, desc: { sv: "Beräkna nytt värde", en: "Calculate New Value" }, ex: "Gammalt × Faktor" },
                    { lvl: 3, desc: { sv: "Hitta ursprungsvärdet", en: "Find Original" }, ex: "Nytt / Faktor" },
                    { lvl: 4, desc: { sv: "Upprepad förändring", en: "Total Change" }, ex: "Faktor × Faktor" },
                    { lvl: 5, desc: { sv: "Vardagsproblem", en: "Word Problems" }, ex: "Ränta & Värdeminskning" }
                ]
            }
        ]
    },

    // ==========================================
    // 3. GEOMETRI (Amber)
    // ==========================================
    {
        id: 'geometry',
        title: { sv: "Geometri & Mätning", en: "Geometry & Measurement" },
        color: "amber",
        topics: [
            {
                id: "geometry",
                name: { sv: "Area & Omkrets", en: "Area & Perimeter" },
                levels: [
                    { lvl: 1, desc: { sv: "Omkrets: Rektanglar", en: "Perimeter: Rects" }, ex: "Vägen runt om" },
                    { lvl: 2, desc: { sv: "Area: Rektangel/Parall.", en: "Area: Rects/Parall." }, ex: "Bas × Höjd" },
                    { lvl: 3, desc: { sv: "Trianglar", en: "Triangles" }, ex: "(B × H) / 2" },
                    { lvl: 4, desc: { sv: "Sammansatta (L-form)", en: "Composite (L-shape)" }, ex: "Dela upp ytor" },
                    { lvl: 5, desc: { sv: "Cirkeln", en: "The Circle" }, ex: "Area & Omkrets med Pi" },
                    { lvl: 6, desc: { sv: "Sammansatta (Hus/Portal)", en: "Composite (House)" }, ex: "Avancerad geometri" }
                ]
            },
            {
                id: "angles",
                name: { sv: "Vinklar", en: "Angles" },
                levels: [
                    { lvl: 1, desc: { sv: "Klassificering", en: "Classification" }, ex: "Spetsig, rät, trubbig" },
                    { lvl: 2, desc: { sv: "Grannvinklar (180/90)", en: "Comp/Supp" }, ex: "180 - känd vinkel" },
                    { lvl: 3, desc: { sv: "Vertikalvinklar", en: "Vertical Angles" }, ex: "Mitt emot varandra" },
                    { lvl: 4, desc: { sv: "Triangelns vinkelsumma", en: "Triangle Sum" }, ex: "Svar: 180°" },
                    { lvl: 5, desc: { sv: "Månghörningar", en: "Polygons" }, ex: "Beräkna vinkelsumma: (n-2) × 180" },
                    { lvl: 6, desc: { sv: "Parallella linjer", en: "Parallel Lines" }, ex: "Z, F och U-vinklar" }
                ]
            },
            {
                id: "volume",
                name: { sv: "Volym & Yta", en: "Volume & Area" },
                levels: [
                    { lvl: 1, desc: { sv: "Rätblock & Kub", en: "Cuboids" }, ex: "B × D × H" },
                    { lvl: 2, desc: { sv: "Prisma", en: "Prism" }, ex: "Basarea × Höjd" },
                    { lvl: 3, desc: { sv: "Cylinder", en: "Cylinder" }, ex: "Pi × r² × H" },
                    { lvl: 4, desc: { sv: "Pyramid & Kon", en: "Pyramid & Cone" }, ex: "(Basarea × H) / 3" },
                    { lvl: 5, desc: { sv: "Klot & Sammansatta", en: "Sphere & Composite" }, ex: "4 × Pi × r³ / 3" },
                    { lvl: 6, desc: { sv: "Blandade Volymer", en: "Mixed Volumes" }, ex: "Öva på allt från Nivå 1-5" },
                    { lvl: 7, desc: { sv: "Enhetsomvandling", en: "Unit Conversion" }, ex: "dm³ <-> Liter" },
                    { lvl: 8, desc: { sv: "Begränsningsyta", en: "Surface Area" }, ex: "Arean på utsidan" }
                ]
            },
            {
                id: "similarity",
                name: { sv: "Likformighet", en: "Similarity" },
                levels: [
                    { lvl: 1, desc: { sv: "Är de likformiga?", en: "Are they similar?" }, ex: "Jämför sidförhållanden" },
                    { lvl: 2, desc: { sv: "Beräkna sida (Enkel)", en: "Calc Side (Simple)" }, ex: "Använd längdskala" },
                    { lvl: 3, desc: { sv: "Topptriangelsatsen", en: "Top Triangle Theorem" }, ex: "Liten vs Stor triangel" },
                    { lvl: 4, desc: { sv: "Pythagoras & Likform.", en: "Pythagoras & Sim." }, ex: "Kombinerade problem" }
                ]
            },
            {
                id: "pythagoras",
                name: { sv: "Pythagoras Sats", en: "Pythagorean Theorem" },
                levels: [
                    { lvl: 1, desc: { sv: "Kvadrater & Rötter", en: "Squares & Roots" }, ex: "3² = 9, √16 = 4" },
                    { lvl: 2, desc: { sv: "Hitta Hypotenusan (c)", en: "Find Hypotenuse" }, ex: "a² + b² = c²" },
                    { lvl: 3, desc: { sv: "Hitta Kateten (a/b)", en: "Find Leg" }, ex: "c² - a² = b²" },
                    { lvl: 4, desc: { sv: "Vardagsproblem", en: "Word Problems" }, ex: "Stegen mot väggen" },
                    { lvl: 5, desc: { sv: "Är den rätvinklig?", en: "Is it Right-angled?" }, ex: "Kontrollera satsen" },
                    { lvl: 6, desc: { sv: "Koordinatsystem", en: "Coordinate Systems" }, ex: "Avstånd mellan punkter" }
                ]
            }
        ]
    },

    // ==========================================
    // 4. DATA & SANNOLIKHET (Rose)
    // ==========================================
    {
        id: 'data',
        title: { sv: "Data & Sannolikhet", en: "Data & Probability" },
        color: "rose",
        topics: [
            {
                id: "statistics",
                name: { sv: "Statistik", en: "Statistics" },
                levels: [
                    { lvl: 1, desc: { sv: "Typvärde & Bredd", en: "Mode & Range" }, ex: "Vanligaste värdet" },
                    { lvl: 2, desc: { sv: "Medelvärde", en: "The Mean" }, ex: "Summa / Antal" },
                    { lvl: 3, desc: { sv: "Medianen", en: "The Median" }, ex: "Mittersta talet" },
                    { lvl: 4, desc: { sv: "Baklänges: Medelvärde", en: "Reverse Mean" }, ex: "Hitta saknat tal" },
                    { lvl: 5, desc: { sv: "Frekvenstabell", en: "Frequency Table" }, ex: "Medel från tabell" },
                    { lvl: 6, desc: { sv: "Analys & Outliers", en: "Analysis & Outliers" }, ex: "Viktat medelvärde" }
                ]
            },
            {
                id: "probability",
                name: { sv: "Sannolikhet", en: "Probability" },
                levels: [
                    { lvl: 1, desc: { sv: "Enkel sannolikhet", en: "Basic Probability" }, ex: "Gynsamma / Möjliga" },
                    { lvl: 2, desc: { sv: "Förhållanden & Grupper", en: "Ratios & Groups" }, ex: "Röda vs Blå kulor" },
                    { lvl: 3, desc: { sv: "Begrepp & Chans", en: "Concepts & Chance" }, ex: "Säkert, Omöjligt" },
                    { lvl: 4, desc: { sv: "Komplementhändelse", en: "Complementary" }, ex: "Sannolikhet för 'Inte'" },
                    { lvl: 5, desc: { sv: "Sannolikhetsträd", en: "Probability Trees" }, ex: "Dragning utan återläggning" },
                    { lvl: 6, desc: { sv: "Beroende händelser", en: "Event Chains" }, ex: "Fler omgångar" },
                    { lvl: 7, desc: { sv: "Kombinatorik", en: "Combinatorics" }, ex: "Handskakningar" },
                    { lvl: 8, desc: { sv: "Avancerade vägar", en: "Complex Pathways" }, ex: "A till B genom olika spår" }
                ]
            }
        ]
    }
];