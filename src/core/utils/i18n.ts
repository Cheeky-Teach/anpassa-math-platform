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

        // --- Dashboard Topics ---
        topics: {
            arithmetic: "Aritmetik",
            negative: "Negativa Tal",
            simplification: "Förenkling",
            linear_eq: "Ekvationer",
            linear_eq_prob: "Problemlösning",
            geometry: "Geometri",
            volume: "Volym & Area",
            similarity: "Likformighet",
            scale: "Skala",
            linear_graph: "Räta Linjen",
            ten_powers: "Tiopotenser"
        },

        // --- Math Vocabulary (Common) ---
        common: {
            calculate: "Beräkna",
            equation: "Ekvation",
            simplify: "Förenkla",
            solve: "Lös ut x",
            evaluate: "Beräkna",
            find_k: "Bestäm k-värdet",
            find_m: "Bestäm m-värdet",
            find_equation: "Bestäm linjens ekvation",
            match_graph: "Vilken ekvation hör till grafen?",
            determine_equation: "Bestäm ekvationen för linjen som går genom:"
        },

        // --- Arithmetic ---
        arithmetic: {
            add: "Beräkna summan",
            sub: "Beräkna differensen",
            mul: "Beräkna produkten",
            div: "Beräkna kvoten",
            mixed: "Beräkna",
            missing_term: "Hitta det saknade talet"
        },

        // --- Algebra ---
        algebra: {
            intro: (eq: string) => `Vi har ekvationen: $${eq}$`,
            multiply: (k: any) => `Multiplicera båda sidor med $${k}$ för att bli av med divisionen.`,
            divide: (k: any) => `Dividera båda sidor med $${k}$ för att få $x$ ensamt.`,
            add: (k: any) => `Addera $${k}$ på båda sidor.`,
            subtract: (k: any) => `Subtrahera $${k}$ på båda sidor.`,
            distribute: (k: any) => `Multiplicera in $${k}$ i parentesen.`,
            sub_var: (term: string) => `Subtrahera $${term}$ från båda sidor för att samla $x$ på en sida.`,
            collect: "Samla lika termer",
            expand: "Utveckla parentesen",
            factorise: "Faktorisera uttrycket",
            substitute: "Ersätt och beräkna"
        },

        // --- Negative Numbers ---
        neg_signs: {
            add_neg: "Att addera ett negativt tal är samma som subtraktion.",
            sub_neg: "Två minus blir plus (– – blir +).",
            mul_neg_neg: "Minus gånger minus blir plus.",
            mul_pos_neg: "Plus gånger minus blir minus.",
            div_sign_same: "Lika tecken ger positivt svar.",
            div_sign_diff: "Olika tecken ger negativt svar.",
            simple_calc: "Beräkna:", 
            step_calc: "Beräkna:",
            plus_plus: "Positivt + Positivt",
            plus_minus: "Positivt + Negativt",
            minus_plus: "Negativt + Positivt",
            minus_minus: "Negativt - Negativt",
            mixed: "Blandat",
            multiplication: "Multiplikation",
            division: "Division"
        },

        // --- Linear Graphs ---
        graph: {
            q_intercept: { sv: "Bestäm m-värdet (där linjen skär y-axeln).", en: "Find the intercept (m)." },
            q_slope: { sv: "Bestäm k-värdet (lutningen).", en: "Find the slope (k)." },
            q_func: { sv: "Bestäm linjens ekvation ($y = kx + m$).", en: "Find the line equation ($y = kx + m$)." },
            look_x0: "Titta på grafen: Var skär linjen y-axeln (där $x=0$)?",
            step_intercept: (m:any) => `Linjen skär y-axeln vid $y = ${m}$.`,
            step_delta: "Lutningen $k$ är skillnaden i $y$ delat med skillnaden i $x$.",
            step_slope_calc: "Räkna rutor: Hur mycket ändras $y$ när vi går 1 steg åt höger?",
            find_m: "Hitta m-värdet (skärning med y-axeln).",
            find_k: "Hitta k-värdet (lutningen).",
            parallel: "Bestäm lutningen för en linje som är parallell med:",
            perpendicular: "Bestäm lutningen för en linje som är vinkelrät mot:",
            find_gradient: "Beräkna lutningen (k)",
            find_intercept: "Hitta y-axelskärningen (m)"
        },

        // --- Scale & Maps ---
        scale: {
            map: "Skala",
            real: "Verklig sträcka",
            map_dist: "Avstånd på kartan",
            ratio: "Skala",
            problem_map_to_real: "Beräkna det verkliga avståndet.",
            problem_real_to_map: "Beräkna avståndet på kartan.",
            problem_find_scale: "Bestäm kartans skala.",
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

        // --- Problem Solving ---
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

        // --- Geometry & Volume ---
        geometry: {
            area: "Beräkna arean",
            perimeter: "Beräkna omkretsen",
            circumference: "Beräkna omkretsen",
            volume: "Beräkna volymen",
            surface_area: "Beräkna begränsningsarean",
            similarity: "Likformighet",
            scale_factor: "Hitta skalfaktorn (k)",
            missing_side: "Beräkna den saknade sidan",
            shape: "Figur",
            cube: "Kub",
            cuboid: "Rätblock",
            cylinder: "Cylinder",
            sphere: "Klot",
            cone: "Kon",
            triangle: "Triangel",
            rectangle: "Rektangel",
            circle: "Cirkel",
            parallelogram: "Parallellogram",
            trapezium: "Trapets"
        },

        // --- Ten Powers ---
        ten_powers: {
            mult: "Multiplikation med tiopotenser",
            div: "Division med tiopotenser",
            standard_form: "Grundpotensform",
            prefix: "Prefix"
        },

        // --- Shapes ---
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
        },

        // --- Units ---
        units: {
            cm: "cm",
            m: "m",
            km: "km",
            mm: "mm",
            cm2: "cm²",
            m2: "m²",
            km2: "km²",
            cm3: "cm³",
            m3: "m³",
            liter: "L",
            degrees: "°"
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

        // --- Dashboard Topics ---
        topics: {
            arithmetic: "Arithmetic",
            negative: "Negative Numbers",
            simplification: "Simplification",
            linear_eq: "Linear Equations",
            linear_eq_prob: "Equation Problems",
            geometry: "Geometry",
            volume: "Volume & Surface Area",
            similarity: "Similarity",
            scale: "Scale & Maps",
            linear_graph: "Linear Graphs",
            ten_powers: "Powers of 10"
        },

        // --- Math Vocabulary ---
        common: {
            calculate: "Calculate",
            equation: "Equation",
            simplify: "Simplify",
            solve: "Solve for x",
            evaluate: "Evaluate",
            find_k: "Find the gradient (k)",
            find_m: "Find the y-intercept (m)",
            find_equation: "Find the equation of the line",
            match_graph: "Which equation matches the graph?",
            determine_equation: "Determine the equation of the line passing through:"
        },

        // --- Arithmetic ---
        arithmetic: {
            add: "Calculate the sum",
            sub: "Calculate the difference",
            mul: "Calculate the product",
            div: "Calculate the quotient",
            mixed: "Evaluate the expression",
            missing_term: "Find the missing number"
        },

        // --- Algebra ---
        algebra: {
            intro: (eq: string) => `Equation: $${eq}$`,
            multiply: (k: any) => `Multiply both sides by $${k}$ to remove the division.`,
            divide: (k: any) => `Divide both sides by $${k}$ to isolate $x$.`,
            add: (k: any) => `Add $${k}$ to both sides.`,
            subtract: (k: any) => `Subtract $${k}$ from both sides.`,
            distribute: (k: any) => `Distribute $${k}$ into the parentheses.`,
            sub_var: (term: string) => `Subtract $${term}$ from both sides to collect $x$ on one side.`,
            collect: "Collect like terms",
            expand: "Expand the brackets",
            factorise: "Factorise the expression",
            substitute: "Substitute and evaluate"
        },

        // --- Negative Numbers ---
        neg_signs: {
            add_neg: "Adding a negative number is the same as subtraction.",
            sub_neg: "Subtracting a negative number is the same as addition (– – becomes +).",
            mul_neg_neg: "Negative times negative becomes positive.",
            mul_pos_neg: "Positive times negative becomes negative.",
            div_sign_same: "Same signs give a positive result.",
            div_sign_diff: "Different signs give a negative result.",
            simple_calc: "Calculate:",
            step_calc: "Calculate:",
            plus_plus: "Positive + Positive",
            plus_minus: "Positive + Negative",
            minus_plus: "Negative + Positive",
            minus_minus: "Negative - Negative",
            mixed: "Mixed",
            multiplication: "Multiplication",
            division: "Division"
        },

        // --- Linear Graphs ---
        graph: {
            q_intercept: { sv: "", en: "Find the intercept (m)." },
            q_slope: { sv: "", en: "Find the slope (k)." },
            q_func: { sv: "", en: "Find the line equation ($y = kx + m$)."},
            look_x0: "Look at the graph: Where does the line cross the y-axis (where $x=0$)?",
            step_intercept: (m:any) => `The line crosses the y-axis at $y = ${m}$.`,
            step_delta: "The slope $k$ is the change in $y$ divided by the change in $x$.",
            step_slope_calc: "Count squares: How much does $y$ change when we go 1 step to the right?",
            find_m: "Find the m-value (y-intercept).",
            find_k: "Find the k-value (slope).",
            parallel: "Find the slope of a line parallel to:",
            perpendicular: "Find the slope of a line perpendicular to:",
            find_gradient: "Calculate the gradient",
            find_intercept: "Find the intercept"
        },

        // --- Scale & Maps ---
        scale: {
            map: "Map Scale",
            real: "Real Distance",
            map_dist: "Map Distance",
            ratio: "Ratio",
            problem_map_to_real: "Calculate the real world distance.",
            problem_real_to_map: "Calculate the distance on the map.",
            problem_find_scale: "Determine the scale of the map.",
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

        // --- Problem Solving ---
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
            a_buy: { sv: "", en: "You buy $a$ {item} for $x$ kr/st and a bag for $b$ kr. Total cost is $c$ kr." },
            a_taxi: { sv: "", en: "A taxi ride has a start fee of $b$ kr and costs $a$ kr per km. Total cost is $c$ kr. How many km ($x$) did you travel?" },
            b_discount: { sv: "", en: "You buy $a$ {item} costing $x$ kr each. You have a discount coupon of $b$ kr. You pay $c$ kr in total." },
            c_compare: { sv: "", en: "{name1} and {name2} collect {item}. {name2} has $a$ more than {name1}. Together they have $c$. How many does {name1} have ($x$)?" },
            d_compare: { sv: "", en: "{name1} and {name2} have $c$ {item} together. {name2} has $b$ fewer than {name1}. How many does {name1} have ($x$)?" }
        },

        // --- Geometry & Volume ---
        geometry: {
            area: "Calculate the Area",
            perimeter: "Calculate the Perimeter",
            circumference: "Calculate the Circumference",
            volume: "Calculate the Volume",
            surface_area: "Calculate the Surface Area",
            similarity: "Similarity",
            scale_factor: "Find the Scale Factor",
            missing_side: "Find the missing side length",
            shape: "Shape",
            cube: "Cube",
            cuboid: "Rectangular Prism",
            cylinder: "Cylinder",
            sphere: "Sphere",
            cone: "Cone",
            triangle: "Triangle",
            rectangle: "Rectangle",
            circle: "Circle",
            parallelogram: "Parallelogram",
            trapezium: "Trapezium"
        },

        // --- Ten Powers ---
        ten_powers: {
            mult: "Multiplication by powers of 10",
            div: "Division by powers of 10",
            standard_form: "Standard Form (Scientific Notation)",
            prefix: "Unit Prefixes"
        },

        // --- Shapes ---
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
        },

        // --- Units ---
        units: {
            cm: "cm",
            m: "m",
            km: "km",
            mm: "mm",
            cm2: "cm²",
            m2: "m²",
            km2: "km²",
            cm3: "cm³",
            m3: "m³",
            liter: "L",
            degrees: "°"
        }
    }
};

export const TERMS = UI_STRINGS;

// Helper to handle both string and object keys safely
export function t(lang: Language, keyOrObj: string | { sv: string, en: string }): string {
    const l = (lang === 'en') ? 'en' : 'sv';
    
    // Check if input is a localized object {sv:..., en:...}
    if (typeof keyOrObj === 'object' && keyOrObj !== null) {
        // @ts-ignore
        return keyOrObj[l] || keyOrObj['sv'] || "";
    }
    
    // Check if input is a dot-notation string "geometry.area"
    if (typeof keyOrObj === 'string') {
        if (keyOrObj.includes('.')) {
            const keys = keyOrObj.split('.');
            let value: any = UI_STRINGS[l];
            for (const k of keys) {
                if (value && value[k]) {
                    value = value[k];
                } else {
                    return keyOrObj; // Return key if missing
                }
            }
            return typeof value === 'string' ? value : keyOrObj;
        }
        
        // Direct key lookup in UI root
        // @ts-ignore
        return UI_STRINGS[l][keyOrObj] || keyOrObj;
    }
    
    return String(keyOrObj);
}