export type Language = 'sv' | 'en';

export const UI_STRINGS = {
    sv: {
        // --- General UI ---
        submit: "Svara",
        next: "Nästa fråga",
        correct: "Rätt!",
        incorrect: "Inte riktigt, försök igen",
        try_again: "Försök igen",
        score: "Poäng",
        streak: "Svit",
        level: "Nivå",
        loading: "Laddar...",
        error: "Fel vid laddning",
        dashboard_title: "Välj område att öva på",
        backBtn: "Meny",
        history: "Historik",
        noHistory: "Inga svar än.",
        btnHint: "Ledtråd",
        btnSolution: "Visa lösning",
        btnSkip: "Hoppa över",
        placeholder: "Skriv ditt svar...",
        hintsTitle: "Ledtrådar",
        clueUsed: "Hjälp",
        donow: "Startuppgift",
        donow_title: "Uppstart (Do Now)",
        donow_desc: "Välj upp till 3 nivåer. Systemet genererar 6 frågor totalt.",
        donow_gen: "Generera",
        donow_show_all: "Visa alla",
        donow_hide_all: "Dölj alla",
        aboutBtn: "Om skaparen",

        // --- Math Vocabulary (CRITICAL FOR GENERATORS) ---
        common: {
            calculate: "Beräkna",
            equation: "Ekvation",
            simplify: "Förenkla"
        },
        algebra: {
            intro: (eq: string) => `Vi har ekvationen: $${eq}$`,
            multiply: (k: any) => `Multiplicera båda sidor med $${k}$ för att bli av med divisionen.`,
            divide: (k: any) => `Dividera båda sidor med $${k}$ för att få $x$ ensamt.`,
            add: (k: any) => `Addera $${k}$ på båda sidor.`,
            subtract: (k: any) => `Subtrahera $${k}$ på båda sidor.`,
            distribute: (k: any) => `Multiplicera in $${k}$ i parentesen.`,
            sub_var: (term: string) => `Subtrahera $${term}$ från båda sidor för att samla $x$ på en sida.`
        },
        neg_signs: {
            add_neg: "Att addera ett negativt tal är samma som subtraktion.",
            sub_neg: "Två minus blir plus (– – blir +).",
            mul_neg_neg: "Minus gånger minus blir plus.",
            mul_pos_neg: "Plus gånger minus blir minus.",
            div_sign_same: "Lika tecken ger positivt svar.",
            div_sign_diff: "Olika tecken ger negativt svar.",
            simple_calc: "Beräkna:", 
            step_calc: "Beräkna:"
        },
        graph: {
            q_intercept: { sv: "Bestäm m-värdet (där linjen skär y-axeln).", en: "Find the intercept (m)." },
            q_slope: { sv: "Bestäm k-värdet (lutningen).", en: "Find the slope (k)." },
            q_func: { sv: "Bestäm linjens ekvation ($y = kx + m$).", en: "Find the line equation ($y = kx + m$)." },
            look_x0: "Titta på grafen: Var skär linjen y-axeln (där $x=0$)?",
            step_intercept: (m:any) => `Linjen skär y-axeln vid $y = ${m}$.`,
            step_delta: "Lutningen $k$ är skillnaden i $y$ delat med skillnaden i $x$.",
            step_slope_calc: "Räkna rutor: Hur mycket ändras $y$ när vi går 1 steg åt höger?",
            find_m: "Hitta m-värdet (skärning med y-axeln).",
            find_k: "Hitta k-värdet (lutningen)."
        },
        scale: {
            reduction: "Förminskning",
            enlargement: "Förstoring",
            reality: "Verkligheten",
            drawing: "Bilden",
            rule_reduction: "När skalan är 1:X är bilden mindre än verkligheten.",
            rule_enlargement: "När skalan är X:1 är bilden större än verkligheten.",
            step_plug_in: "Sätt in värdena i formeln: $\\frac{\\text{Bild}}{\\text{Verklighet}}$",
            calc_cm: "Räkna först ut det i cm.",
            conv_m: "Omvandla till meter (1 m = 100 cm).",
            conv_same: "Se till att båda måtten har samma enhet.",
            setup_ratio: "Ställ upp förhållandet Bild : Verklighet.",
            step_simplify: "Förenkla bråket.",
            calc_area_img: "Beräkna bildens area.",
            calc_area_real: "Beräkna verklighetens area.",
            calc_area_scale: "Areaskalan är längdskalan i kvadrat."
        },
        problem_solving: {
            task_solve: "Lös ekvationen och beräkna $x$.",
            task_write: "Skriv en ekvation som beskriver situationen (du behöver inte lösa den).",
            clue_var: "Låt $x$ vara det vi söker.",
            clue_total: "Sätt uttrycket lika med totalen.",
            expl_rate_val: "Pris per styck gånger antal.",
            expl_fixed_val: "Lägg till den fasta avgiften.",
            expl_item_cost: "Kostnaden för varorna innan rabatt.",
            expl_discount_sub: "Subtrahera rabatten.",
            expl_person1: "Person 1 har $x$.",
            expl_person2_more: "Person 2 har mer.",
            expl_person2_less: "Person 2 har mindre.",
            expl_compare_sum: "Summan av båda är totalen.",
            // Templates
            a_buy: { sv: "Du köper $a$ st {item} för $x$ kr/st och en påse för $b$ kr. Totalt betalar du $c$ kr.", en: "You buy $a$ {item} for $x$ kr each and a bag for $b$ kr. Total cost is $c$ kr." },
            a_taxi: { sv: "En taxiresa kostar $b$ kr i startavgift och $a$ kr per km. Resan kostar totalt $c$ kr. Hur många km ($x$) åkte du?", en: "A taxi ride has a start fee of $b$ kr and costs $a$ kr per km. Total cost is $c$ kr. How many km ($x$) did you travel?" },
            b_discount: { sv: "Du köper $a$ st {item} som kostar $x$ kr/st. Du har en rabattkupong på $b$ kr. Du betalar totalt $c$ kr.", en: "You buy $a$ {item} costing $x$ kr each. You have a discount coupon of $b$ kr. You pay $c$ kr in total." },
            c_compare: { sv: "{name1} och {name2} samlar på {item}. {name2} har $a$ fler än {name1}. Tillsammans har de $c$ st. Hur många har {name1} ($x$)?", en: "{name1} and {name2} collect {item}. {name2} has $a$ more than {name1}. Together they have $c$. How many does {name1} have ($x$)?" },
            d_compare: { sv: "{name1} och {name2} har $c$ {item} tillsammans. {name2} har $b$ färre än {name1}. Hur många har {name1} ($x$)?", en: "{name1} and {name2} have $c$ {item} together. {name2} has $b$ fewer than {name1}. How many does {name1} have ($x$)?" }
        },
        shapes: {
            square: "kvadrat",
            rectangle: "rektangel",
            circle: "cirkel",
            triangle: "triangel",
            rhombus: "romb",
            parallelogram: "parallellogram",
            pentagon: "femhörning",
            hexagon: "sexhörning",
            octagon: "åttahörning",
            star: "stjärna",
            arrow: "pil",
            heart: "hjärta",
            cross: "kors",
            lightning: "blixt",
            kite: "drake",
            cube: "kub",
            cylinder: "cylinder",
            pyramid: "pyramid",
            cone: "kon",
            sphere: "klot"
        },
        shapes_plural: {
            rectangle: "rektanglar",
            triangle: "trianglar",
            circle: "cirklar",
            semicircle: "halvcirklar",
            parallelogram: "parallellogram"
        }
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
        error: "Error loading question",
        dashboard_title: "Choose a topic to practice",
        backBtn: "Menu",
        history: "History",
        noHistory: "No answers yet.",
        btnHint: "Hint",
        btnSolution: "Show Solution",
        btnSkip: "Skip",
        placeholder: "Enter your answer...",
        hintsTitle: "Hints",
        clueUsed: "Clue",
        donow: "Do Now",
        donow_title: "Do Now Activity",
        donow_desc: "Select up to 3 levels. System generates 6 questions total.",
        donow_gen: "Generate",
        donow_show_all: "Show All",
        donow_hide_all: "Hide All",
        aboutBtn: "About",

        // --- Math Vocabulary ---
        common: {
            calculate: "Calculate",
            equation: "Equation",
            simplify: "Simplify"
        },
        algebra: {
            intro: (eq: string) => `Equation: $${eq}$`,
            multiply: (k: any) => `Multiply both sides by $${k}$ to remove the division.`,
            divide: (k: any) => `Divide both sides by $${k}$ to isolate $x$.`,
            add: (k: any) => `Add $${k}$ to both sides.`,
            subtract: (k: any) => `Subtract $${k}$ from both sides.`,
            distribute: (k: any) => `Distribute $${k}$ into the parentheses.`,
            sub_var: (term: string) => `Subtract $${term}$ from both sides to collect $x$ on one side.`
        },
        neg_signs: {
            add_neg: "Adding a negative number is the same as subtraction.",
            sub_neg: "Subtracting a negative number is the same as addition (– – becomes +).",
            mul_neg_neg: "Negative times negative becomes positive.",
            mul_pos_neg: "Positive times negative becomes negative.",
            div_sign_same: "Same signs give a positive result.",
            div_sign_diff: "Different signs give a negative result.",
            simple_calc: "Calculate:",
            step_calc: "Calculate:"
        },
        graph: {
            q_intercept: { sv: "", en: "Find the intercept (m)." },
            q_slope: { sv: "", en: "Find the slope (k)." },
            q_func: { sv: "", en: "Find the line equation ($y = kx + m$)." },
            look_x0: "Look at the graph: Where does the line cross the y-axis (where $x=0$)?",
            step_intercept: (m:any) => `The line crosses the y-axis at $y = ${m}$.`,
            step_delta: "The slope $k$ is the change in $y$ divided by the change in $x$.",
            step_slope_calc: "Count squares: How much does $y$ change when we go 1 step to the right?",
            find_m: "Find the m-value (y-intercept).",
            find_k: "Find the k-value (slope)."
        },
        scale: {
            reduction: "Reduction",
            enlargement: "Enlargement",
            reality: "Reality",
            drawing: "Drawing",
            rule_reduction: "When the scale is 1:X, the image is smaller than reality.",
            rule_enlargement: "When the scale is X:1, the image is larger than reality.",
            step_plug_in: "Insert the values into the formula: $\\frac{\\text{Image}}{\\text{Reality}}$",
            calc_cm: "Calculate it in cm first.",
            conv_m: "Convert to meters (1 m = 100 cm).",
            conv_same: "Ensure both measurements have the same unit.",
            setup_ratio: "Set up the ratio Image : Reality.",
            step_simplify: "Simplify the fraction.",
            calc_area_img: "Calculate the area of the image.",
            calc_area_real: "Calculate the area of reality.",
            calc_area_scale: "The area scale is the length scale squared."
        },
        problem_solving: {
            task_solve: "Solve the equation and calculate $x$.",
            task_write: "Write an equation that describes the situation (you don't need to solve it).",
            clue_var: "Let $x$ be what we are looking for.",
            clue_total: "Set the expression equal to the total.",
            expl_rate_val: "Price per item times quantity.",
            expl_fixed_val: "Add the fixed fee.",
            expl_item_cost: "The cost of items before discount.",
            expl_discount_sub: "Subtract the discount.",
            expl_person1: "Person 1 has $x$.",
            expl_person2_more: "Person 2 has more.",
            expl_person2_less: "Person 2 has less.",
            expl_compare_sum: "The sum of both is the total.",
            a_buy: { sv: "", en: "You buy $a$ {item} for $x$ kr each and a bag for $b$ kr. Total cost is $c$ kr." },
            a_taxi: { sv: "", en: "A taxi ride has a start fee of $b$ kr and costs $a$ kr per km. Total cost is $c$ kr. How many km ($x$) did you travel?" },
            b_discount: { sv: "", en: "You buy $a$ {item} costing $x$ kr each. You have a discount coupon of $b$ kr. You pay $c$ kr in total." },
            c_compare: { sv: "", en: "{name1} and {name2} collect {item}. {name2} has $a$ more than {name1}. Together they have $c$. How many does {name1} have ($x$)?" },
            d_compare: { sv: "", en: "{name1} and {name2} have $c$ {item} together. {name2} has $b$ fewer than {name1}. How many does {name1} have ($x$)?" }
        },
        shapes: {
            square: "square",
            rectangle: "rectangle",
            circle: "circle",
            triangle: "triangle",
            rhombus: "rhombus",
            parallelogram: "parallellogram",
            pentagon: "pentagon",
            hexagon: "hexagon",
            octagon: "octagon",
            star: "star",
            arrow: "arrow",
            heart: "heart",
            cross: "cross",
            lightning: "lightning",
            kite: "kite",
            cube: "cube",
            cylinder: "cylinder",
            pyramid: "pyramid",
            cone: "cone",
            sphere: "sphere"
        },
        shapes_plural: {
            rectangle: "rectangles",
            triangle: "triangles",
            circle: "circles",
            semicircle: "semicircles",
            parallelogram: "parallelograms"
        }
    }
};

export const TERMS = UI_STRINGS;

// Helper to handle both string and object keys safely
export function t(lang: Language, keyOrObj: string | { sv: string, en: string }): string {
    const l = (lang === 'en') ? 'en' : 'sv';
    
    if (typeof keyOrObj === 'object' && keyOrObj !== null) {
        return keyOrObj[l] || keyOrObj['sv'] || "";
    }
    
    if (typeof keyOrObj === 'string') {
        // @ts-ignore
        return UI_STRINGS[l][keyOrObj] || keyOrObj;
    }
    
    return String(keyOrObj);
}