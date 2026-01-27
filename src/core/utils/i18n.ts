// 1. Define the Dictionary (The data we restored)
export const UI_STRINGS = {
    sv: {
        // --- General UI ---
        submit: "Skicka svar",
        next: "Nästa fråga",
        correct: "Rätt!",
        incorrect: "Tyvärr, det var fel.",
        try_again: "Försök igen",
        score: "Poäng",
        streak: "Svit",
        level: "Nivå",
        loading: "Laddar...",
        
        // --- Command Verbs ---
        calculate: "Beräkna",
        solve: "Lös",
        simplify: "Förenkla",
        find: "Hitta",
        determine: "Bestäm",

        // --- Math Vocabulary ---
        sum: "summan",
        difference: "skillnaden",
        product: "produkten",
        quotient: "kvoten",
        remainder: "resten",
        factor: "faktor",
        multiple: "multipel",
        equation: "ekvationen",
        expression: "uttrycket",
        variable: "variabeln",
        slope: "lutningen",
        intercept: "skärningspunkten",
        function: "funktionen",
        area: "area",
        perimeter: "omkrets",
        volume: "volym",
        circumference: "omkrets (cirkel)",
        radius: "radie",
        diameter: "diameter",
        base: "bas",
        height: "höjd",
        width: "bredd",
        depth: "djup",
        length: "längd",
        hypotenuse: "hypotenusa",
        leg: "katet",
        
        // --- Shapes ---
        triangle: "triangel",
        rectangle: "rektangel",
        square: "kvadrat",
        circle: "cirkel",
        cube: "kub",
        cuboid: "rätblock",
        cylinder: "cylinder",
        sphere: "klot",
        cone: "kon",
        pyramid: "pyramid",
        polygon: "månghörning",

        // --- Concepts ---
        similar: "likformiga",
        congruent: "kongruenta",
        scale: "skala",
        ratio: "förhållande",
        probability: "sannolikhet",
        mean: "medelvärde",
        median: "median",

        // --- Explanations ---
        expl_prefix: "Förklaring:",
        expl_sides_rule: "Likformiga figurer har proportionella sidor.",
        expl_angles_rule: "Likformiga figurer har exakt samma vinklar.",
        expl_scale_calc: "Skalan beräknas genom att dividera bildens mått med verklighetens mått.",
        expl_linear_k: "k-värdet (lutningen) beskriver hur mycket y ändras för varje steg i x-led.",
        expl_linear_m: "m-värdet är y-värdet där linjen skär y-axeln.",
        expl_pythagoras: "Pythagoras sats gäller för rätvinkliga trianglar: a² + b² = c².",
        expl_circle_area: "Arean av en cirkel beräknas med formeln A = π · r².",
        expl_cylinder_vol: "Volymen av en cylinder är basytan (cirkel) gånger höjden: V = π · r² · h."
    },
    en: {
        // --- General UI ---
        submit: "Submit Answer",
        next: "Next Question",
        correct: "Correct!",
        incorrect: "Incorrect.",
        try_again: "Try Again",
        score: "Score",
        streak: "Streak",
        level: "Level",
        loading: "Loading...",

        // --- Command Verbs ---
        calculate: "Calculate",
        solve: "Solve",
        simplify: "Simplify",
        find: "Find",
        determine: "Determine",

        // --- Math Vocabulary ---
        sum: "sum",
        difference: "difference",
        product: "product",
        quotient: "quotient",
        remainder: "remainder",
        factor: "factor",
        multiple: "multiple",
        equation: "equation",
        expression: "expression",
        variable: "variable",
        slope: "slope",
        intercept: "intercept",
        function: "function",
        area: "area",
        perimeter: "perimeter",
        volume: "volume",
        circumference: "circumference",
        radius: "radius",
        diameter: "diameter",
        base: "base",
        height: "height",
        width: "width",
        depth: "depth",
        length: "length",
        hypotenuse: "hypotenuse",
        leg: "leg",
        
        // --- Shapes ---
        triangle: "triangle",
        rectangle: "rectangle",
        square: "square",
        circle: "circle",
        cube: "cube",
        cuboid: "cuboid",
        cylinder: "cylinder",
        sphere: "sphere",
        cone: "cone",
        pyramid: "pyramid",
        polygon: "polygon",

        // --- Concepts ---
        similar: "similar",
        congruent: "congruent",
        scale: "scale",
        ratio: "ratio",
        probability: "probability",
        mean: "mean",
        median: "median",

        // --- Explanations ---
        expl_prefix: "Explanation:",
        expl_sides_rule: "Similar shapes have proportional sides.",
        expl_angles_rule: "Similar shapes have identical angles.",
        expl_scale_calc: "Scale is calculated by dividing the image dimension by the real dimension.",
        expl_linear_k: "The slope (k) describes the change in y for each step in x.",
        expl_linear_m: "The y-intercept (m) is the y-value where the line crosses the y-axis.",
        expl_pythagoras: "The Pythagorean theorem applies to right-angled triangles: a² + b² = c².",
        expl_circle_area: "The area of a circle is calculated using the formula A = π · r².",
        expl_cylinder_vol: "The volume of a cylinder is the base area (circle) times the height: V = π · r² · h."
    }
};

// 2. Export the Legacy Type
export type Language = 'sv' | 'en';

// 3. Export TERMS (Mapped to UI_STRINGS for compatibility)
// The generators likely access TERMS.sv.some_key or just import it.
export const TERMS = UI_STRINGS;

// 4. Export the Legacy Helper Function 't'
// This adapter ensures existing calls like t('submit', 'sv') work correctly.
export function t(key: string, lang: Language = 'sv'): string {
    // @ts-ignore - Allow dynamic access for legacy compatibility
    const val = UI_STRINGS[lang][key];
    return val || `[${key}]`;
}

// 5. Keep new exports (optional, but good for new code)
export type Lang = Language;
export const getTrans = t;