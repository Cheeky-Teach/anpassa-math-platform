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
            a_buy: { sv: "Du köper $a$ st {item} för $x$ kr/st och en påse för $b$ kr. Totalt betalar du $c$ kr.", en: "You buy $a$ {item} for $x$ kr each and a bag for $b$ kr. Total cost is $c$ kr." },
            a_taxi: { sv: "En taxiresa kostar $b$ kr i startavgift och $a$ kr per km. Resan kostar totalt $c$ kr. Hur många km ($x$) åkte du?", en: "A taxi ride has a start fee of $b$ kr and costs $a$ kr per km. Total cost is $c$ kr. How many km ($x$) did you travel?" },
            b_discount: { sv: "Du köper $a$ st {item} som kostar $x$ kr/st. Du har en rabattkupong på $b$ kr. Du betalar totalt $c$ kr.", en: "You buy $a$ {item} costing $x$ kr each. You have a discount coupon of $b$ kr. You pay $c$ kr in total." },
            c_compare: { sv: "{name1} och {name2} samlar på {item}. {name2} har $a$ fler än {name1}. Tillsammans har de $c$ st. Hur många har {name1} ($x$)?", en: "{name1} and {name2} collect {item}. {name2} has $a$ more than {name1}. Together they have $c$. How many does {name1} have ($x$)?" },
            d_compare: { sv: "{name1} och {name2} har $c$ {item} tillsammans. {name2} har $b$ färre än {name1}. Hur många har {name1} ($x$)?", en: "{name1} and {name2} have $c$ {item} together. {name2} has $b$ fewer than {name1}. How many does {name1} have ($x$)?" }
        },
        // --- Full Shape List (Fixes ScaleGenerator) ---
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
        submit: "Submit Answer",
        next: "Next Question",
        correct: "Correct!",
        incorrect: "Incorrect.",
        try_again: "Try Again",
        level: "Level",
        loading: "Loading...",
        error: "Error",
        
        // English mappings
        common: { calculate: "Calculate", equation: "Equation", simplify: "Simplify" },
        algebra: {
            intro: (eq: string) => `Equation: $${eq}$`,
            multiply: (k: any) => `Multiply by $${k}$`,
            divide: (k: any) => `Divide by $${k}$`,
            add: (k: any) => `Add $${k}$`,
            subtract: (k: any) => `Subtract $${k}$`,
            distribute: (k: any) => `Distribute $${k}$`,
            sub_var: (term: string) => `Subtract $${term}$`
        },
        neg_signs: {
            add_neg: "Adding negative is subtraction.",
            sub_neg: "Subtracting negative is addition.",
            mul_neg_neg: "Neg * Neg = Pos",
            mul_pos_neg: "Pos * Neg = Neg",
            div_sign_same: "Same sign = Positive",
            div_sign_diff: "Diff sign = Negative",
            simple_calc: "Calculate:",
            step_calc: "Calculate:"
        },
        graph: {
            q_intercept: { sv: "", en: "Find intercept (m)" },
            q_slope: { sv: "", en: "Find slope (k)" },
            q_func: { sv: "", en: "Find equation" },
            look_x0: "Look at x=0",
            step_intercept: (m:any) => `Intercept at $y=${m}$`,
            step_delta: "k = change in y / change in x",
            step_slope_calc: "Calculate slope",
            find_m: "Find m",
            find_k: "Find k"
        },
        scale: {
            reduction: "Reduction",
            enlargement: "Enlargement",
            reality: "Reality",
            drawing: "Drawing",
            rule_reduction: "1:X reduces",
            rule_enlargement: "X:1 enlarges",
            step_plug_in: "Use formula",
            calc_cm: "Calc in cm",
            conv_m: "Convert to m",
            conv_same: "Use same units",
            setup_ratio: "Setup ratio",
            step_simplify: "Simplify",
            calc_area_img: "Calc area img",
            calc_area_real: "Calc area real",
            calc_area_scale: "Area scale is length scale sq"
        },
        problem_solving: {
            task_solve: "Solve for x",
            task_write: "Write equation",
            clue_var: "Let x be...",
            clue_total: "Equals total",
            expl_rate_val: "Rate * Amount",
            expl_fixed_val: "Add fixed",
            expl_item_cost: "Item cost",
            expl_discount_sub: "Subtract discount",
            expl_person1: "Person 1",
            expl_person2_more: "Person 2 more",
            expl_person2_less: "Person 2 less",
            expl_compare_sum: "Sum is total",
            a_buy: { sv: "", en: "Buy $a$ items..." },
            a_taxi: { sv: "", en: "Taxi cost..." },
            b_discount: { sv: "", en: "Discount..." },
            c_compare: { sv: "", en: "Compare..." },
            d_compare: { sv: "", en: "Compare..." }
        },
        shapes: {
            square: "square", rectangle: "rectangle", circle: "circle", triangle: "triangle",
            rhombus: "rhombus", parallelogram: "parallelogram", pentagon: "pentagon", hexagon: "hexagon",
            octagon: "octagon", star: "star", arrow: "arrow", heart: "heart", cross: "cross", lightning: "lightning", kite: "kite",
            cube: "cube", cylinder: "cylinder", pyramid: "pyramid", cone: "cone", sphere: "sphere"
        },
        shapes_plural: {
            rectangle: "rectangles", triangle: "triangles", circle: "circles", semicircle: "semicircles", parallelogram: "parallelograms"
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