export const CATEGORIES = {
    ARITHMETIC: {
        id: 'ARITHMETIC',
        label: { en: 'Number Theory', sv: 'Taluppfattning' },
        color: 'pink',
        generators: [
            { id: 'BasicArithmeticGen', api: 'arithmetic', label: { sv: "De Fyra Räknesätten", en: "Basic Counting" } },
            { id: 'FractionBasicsGen', api: 'fraction_basics', label: { sv: "Bråk: Grunder", en: "Fractions: Basics" } }, // Added
            { id: 'FractionArithGen', api: 'fraction_arith', label: { sv: "Bråk: Räkna", en: "Fractions: Arithmetic" } }, // Added
            { id: 'NegativeNumbersGen', api: 'negative', label: { sv: "Negativa Tal", en: "Negative Numbers" } },
            { id: 'TenPowersGen', api: 'ten_powers', label: { sv: "10, 100, 1000", en: "10, 100, 1000" } },
            { id: 'PercentGen', api: 'percent', label: { sv: "Procent", en: "Percentage" } }
        ]
    },
    ALGEBRA: {
        id: 'ALGEBRA',
        label: { en: 'Algebra', sv: 'Algebra' },
        color: 'indigo',
        generators: [
            { id: 'ExpressionSimplificationGen', api: 'simplify', label: { sv: "Uttryck", en: "Expressions" } },
            { id: 'PatternsGen', api: 'patterns', label: { sv: "Algebraiska mönster", en: "Algebraic Patterns" } },
            { id: 'EquationGenerator', api: 'equation', label: { sv: "Ekvationer", en: "Equations" } },
            { id: 'LinearGraphGenerator', api: 'graph', label: { sv: "Räta Linjen", en: "Linear Graphs" } }
        ]
    },
    GEOMETRY: {
        id: 'GEOMETRY',
        label: { en: 'Geometry', sv: 'Geometri' },
        color: 'emerald',
        generators: [
            { id: 'GeometryGenerator', api: 'geometry', label: { sv: "Area & Omkrets", en: "Area & Perimeter" } },
            { id: 'ScaleGenerator', api: 'scale', label: { sv: "Skala", en: "Scale" } },
            { id: 'VolumeGenerator', api: 'volume', label: { sv: "Volym", en: "Volume" } },
            { id: 'SimilarityGenerator', api: 'similarity', label: { sv: "Likformighet", en: "Similar Shapes" } },
            { id: 'PythagorasGen', api: 'pythagoras', label: { sv: "Pythagoras Sats", en: "Pythagoras" } },
            { id: 'AnglesGen', api: 'angles', label: { sv: "Vinklar", en: "Angles" } }
        ]
    },
    STATISTICS: {
        id: 'STATISTICS',
        label: { en: 'Statistics', sv: 'Sannolikhet & Statistik' },
        color: 'yellow',
        generators: [
            { id: 'ProbabilityGen', api: 'probability', label: { sv: "Sannolikhet", en: "Probability" } },
            { id: 'StatisticsGen', api: 'statistics', label: { sv: "Statistik", en: "Statistics" } }
        ]
    }
};

export const LEVEL_DESCRIPTIONS = {
    BasicArithmeticGen: {
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
    FractionBasicsGen: { // New
        1: { sv: "Visuella Bråk", en: "Visual Fractions" },
        2: { sv: "Del av antal", en: "Parts of a Quantity" },
        3: { sv: "Blandad & Bråkform", en: "Mixed & Improper" },
        4: { sv: "Förlänga & Förkorta", en: "Simplify & Extend" },
        5: { sv: "Bråk & Decimaltal", en: "Fractions & Decimals" }
    },
    FractionArithGen: { // New
        1: { sv: "Addition & Subtraktion (Lika)", en: "Add & Sub (Same Denom)" },
        2: { sv: "Addition & Subtraktion (Olika)", en: "Add & Sub (Diff Denom)" },
        3: { sv: "Blandad form (+ och -)", en: "Mixed Numbers (+ and -)" },
        4: { sv: "Multiplikation", en: "Multiplication" },
        5: { sv: "Division", en: "Division" }
    },
    NegativeNumbersGen: {
        1: { sv: "Addition & Subtraktion", en: "Addition & Subtraction" },
        2: { sv: "Addition & Subtraktion (Svår)", en: "Addition & Subtraction (Hard)" },
        3: { sv: "Multiplikation", en: "Multiplication" },
        4: { sv: "Division", en: "Division" },
        5: { sv: "Blandat", en: "Mixed" }
    },
    TenPowersGen: {
        1: { sv: "Multiplikation & Division (10, 100...)", en: "Mult & Div (10, 100...)" },
        2: { sv: "Begreppsförståelse (MC)", en: "Conceptual (MC)" },
        3: { sv: "Decimala faktorer (0.1, 0.01...)", en: "Decimal factors (0.1, 0.01...)" }
    },
    PatternsGen: { 
        1: { sv: "Hitta nästa tal & Skillnad", en: "Next Number & Difference" },
        2: { sv: "Beräkna höga figurer", en: "Calculate High Terms" },
        3: { sv: "Från bild till uttryck", en: "From Visual to Expression" },
        4: { sv: "Från tabell till formel", en: "Table to Formula" },
        5: { sv: "Lös ut n (baklänges)", en: "Solve for n" }
    },
    PercentGen: {
        1: { sv: "Grundläggande (Rutnät)", en: "Basic Concepts (Grid)" },
        2: { sv: "Huvudräkning (10%, 50%)", en: "Mental Math" },
        3: { sv: "Multiplar av 10%", en: "Multiples of 10%" },
        4: { sv: "Beräkna andelen (Decimal)", en: "Calculate Part (Decimal)" },
        5: { sv: "Beräkna det hela", en: "Find Whole" },
        6: { sv: "Verklig Förändring", en: "Real World Change" }
    },
    EquationGenerator: {
        1: { sv: "Enstegsekvationer", en: "One-step equations" },
        2: { sv: "Tvåstegsekvationer", en: "Two-step equations" },
        3: { sv: "Multiplikation med parentes", en: "Multiplication with parentheses" },
        4: { sv: "X på båda sidor", en: "X on both sides" },
        5: { sv: "Problemlösning (Skriv)", en: "Word Problems (Write)" },
        6: { sv: "Problemlösning (Lös)", en: "Word Problems (Solve)" },
        7: { sv: "Blandat", en: "Mixed" }
    },
    ExpressionSimplificationGen: {
        1: { sv: "Förenkla uttryck", en: "Combine like terms" },
        2: { sv: "Parenteser", en: "Distribute into parentheses" },
        3: { sv: "Distribuera & förenkla", en: "Distribute and combine" },
        4: { sv: "Subtrahera parenteser", en: "Subtracting parentheses" },
        5: { sv: "Textuppgifter", en: "Word Problems" },
        6: { sv: "Blandat", en: "Mixed" }
    },
    GeometryGenerator: {
        1: { sv: "Omkrets (Rektangel)", en: "Perimeter (Rectangle)" },
        2: { sv: "Area (Rektangel)", en: "Area (Rectangle)" },
        3: { sv: "Area (Triangel)", en: "Area (Triangle)" },
        4: { sv: "Sammansatta (Rekt+Tri)", en: "Combined (Rect+Tri)" },
        5: { sv: "Cirklar (Omkrets & Area)", en: "Circles (Perimeter & Area)" },
        6: { sv: "Sammansatta figurer", en: "Composite shapes" }
    },
    ScaleGenerator: {
        1: { sv: "Begreppsförståelse", en: "Concepts" },
        2: { sv: "Beräkna längd (Enkel)", en: "Calc Length (Simple)" },
        3: { sv: "Beräkna längd (Svår)", en: "Calc Length (Hard)" },
        4: { sv: "Ange skala", en: "Determine Scale" },
        5: { sv: "Utan bilder", en: "No Pictures" },
        6: { sv: "Areaskala", en: "Area Scale" },
        7: { sv: "Blandat", en: "Mixed" }
    },
    VolumeGenerator: {
        1: { sv: "Rätblock & Kub", en: "Prisms & Cubes" },
        2: { sv: "Triangulärt Prisma", en: "Triangular Prism" },
        3: { sv: "Cylinder", en: "Cylinder" },
        4: { sv: "Pyramid & Kon", en: "Pyramid & Cone" },
        5: { sv: "Klot", en: "Sphere" },
        6: { sv: "Blandat", en: "Mixed" },
        7: { sv: "Blandat med olika enheter", en: "Mixed with units" },
        7: { sv: "Begränsningsyta", en: "Surface Area" } 
    },
    SimilarityGenerator: {
        1: { sv: "Likformig eller inte?", en: "Similar or not?" },
        2: { sv: "Beräkna längden (x)", en: "Calculate length (x)" },
        3: { sv: "Topptriangelsatsen", en: "Top Triangle Theorem" },
        4: { sv: "Blandad", en: "Mixed" }
    },
    PythagorasGen: { 
        1: { sv: "Kvadrater & Rötter", en: "Squares & Roots" },
        2: { sv: "Hitta Hypotenusan", en: "Find Hypotenuse" },
        3: { sv: "Hitta Kateten", en: "Find Leg" },
        4: { sv: "Problemlösning", en: "Word Problems" },
        5: { sv: "Avstånd (Koordinater)", en: "Distance (Coordinates)" },
        6: { sv: "Är den rätvinklig?", en: "Is it Right-Angled?" }
    },
    LinearGraphGenerator: {
        1: { sv: "Hitta m (skärning)", en: "Find y-intercept (m)" },
        2: { sv: "Hitta k (positiv)", en: "Find slope (Positive)" },
        3: { sv: "Hitta k (negativ)", en: "Find slope (Negative)" },
        4: { sv: "Hitta funktion (y=kx+m)", en: "Find equation (y=kx+m)" },
        5: { sv: "Blandat", en: "Mixed graphs" }
    },
    ProbabilityGen: { 
        1: { sv: "Visuell Sannolikhet", en: "Visual Probability" },
        2: { sv: "Tärning & Slump", en: "Dice & Chance" },
        3: { sv: "Sannolikhet som Procent", en: "Probability as Percent" },
        4: { sv: "Komplementhändelse", en: "Complementary Events" },
        5: { sv: "Träddiagram", en: "Probability tree" },
        6: { sv: "Oberoende Händelser", en: "Independent Events" },
        7: { sv: "Kombinatorik", en: "Combinatorics" },
        8: { sv: "Kombinatorik (Svår)", en: "Combinatorics (Hard)" }
    },
    StatisticsGen: { 
        1: { sv: "Typvärde & Variationsbredd", en: "Mode & Range" },
        2: { sv: "Medelvärde", en: "Mean" },
        3: { sv: "Median", en: "Median" },
        4: { sv: "Baklänges medelvärde", en: "Reverse Mean" },
        5: { sv: "Frekvenstabell", en: "Frequency Table" },
        6: { sv: "Blandade begrepp", en: "Mixed Concepts" }
    },
    AnglesGen: { 
        1: { sv: "Begrepp", en: "Concepts" },
        2: { sv: "Komplement/Supplementvinklar ", en: "Complementary/Supplementary angles" },
        3: { sv: "Vertikala vinklar", en: "Vertical Angles" },
        4: { sv: "Vinkelsumma (triangel)", en: "Angle sums (Triangle)" },
        5: { sv: "Vinkelsumma (månghörning)", en: "Angle sums (Polygons)" },
        6: { sv: "Parallella linjer", en: "Parallel lines" }
    }
    
};

export const getColorClasses = (color, type) => {
    const c = color || 'emerald';
    switch (type) {
        case 'bg-light': return `bg-${c}-50`;
        case 'bg-dark': return `bg-${c}-500`;
        case 'border': return `border-${c}-100`;
        case 'text': return `text-${c}-700`;
        case 'ring': return `ring-${c}-500`;
        case 'border-solid': return `border-${c}-500`;
        default: return '';
    }
};