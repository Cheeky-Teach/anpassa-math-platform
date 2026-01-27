export const CATEGORIES = {
    ARITHMETIC: {
        id: 'ARITHMETIC',
        label: { en: 'Number Theory', sv: 'Taluppfattning' },
        color: 'pink',
        generators: [
            { id: 'BasicArithmeticGen', api: 'arithmetic', label: { sv: "De Fyra Räknesätten", en: "Basic Counting" } },
            { id: 'NegativeNumbersGen', api: 'negative_numbers', label: { sv: "Negativa Tal", en: "Negative Numbers" } },
            { id: 'TenPowersGen', api: 'ten_powers', label: { sv: "10, 100, 1000", en: "10, 100, 1000" } }
        ]
    },
    ALGEBRA: {
        id: 'ALGEBRA',
        label: { en: 'Algebra', sv: 'Algebra' },
        color: 'indigo',
        generators: [
            { id: 'ExpressionSimplificationGen', api: 'simplification', label: { sv: "Uttryck", en: "Expressions" } },
            { id: 'EquationGenerator', api: 'equations', label: { sv: "Ekvationer", en: "Equations" } }
        ]
    },
    GEOMETRY: {
        id: 'GEOMETRY',
        label: { en: 'Geometry', sv: 'Geometri' },
        color: 'emerald',
        generators: [
            { id: 'GeometryGenerator', api: 'geometry_2d', label: { sv: "Area & Omkrets", en: "Area & Perimeter" } },
            { id: 'ScaleGenerator', api: 'scale', label: { sv: "Skala", en: "Scale" } },
            { id: 'VolumeGenerator', api: 'geometry_3d', label: { sv: "Volym", en: "Volume" } },
            { id: 'SimilarityGenerator', api: 'similarity', label: { sv: "Likformighet", en: "Similar Shapes" } }
        ]
    },
    FUNCTIONS: {
        id: 'FUNCTIONS',
        label: { en: 'Functions', sv: 'Samband' },
        color: 'purple',
        generators: [
            { id: 'LinearGraphGenerator', api: 'linear_graphs', label: { sv: "Räta Linjen", en: "Linear Graphs" } }
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
        4: { sv: "Cirklar (Omkrets & Area)", en: "Circles (Perimeter & Area)" },
        5: { sv: "Sammansatta figurer", en: "Composite shapes" }
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
        7: { sv: "Blandat med olika enheter", en: "Mixed with units" }
    },
    SimilarityGenerator: {
        1: { sv: "Likformig eller inte?", en: "Similar or not?" },
        2: { sv: "Beräkna längden (x)", en: "Calculate length (x)" },
        3: { sv: "Topptriangelsatsen", en: "Top Triangle Theorem" },
        4: { sv: "Pythagoras sats", en: "Pythagorean Theorem" }
    },
    LinearGraphGenerator: {
        1: { sv: "Hitta m (skärning)", en: "Find y-intercept (m)" },
        2: { sv: "Hitta k (positiv)", en: "Find slope (Positive)" },
        3: { sv: "Hitta k (negativ)", en: "Find slope (Negative)" },
        4: { sv: "Hitta funktion (y=kx+m)", en: "Find equation (y=kx+m)" },
        5: { sv: "Blandat", en: "Mixed graphs" }
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