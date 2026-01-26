export type Language = 'sv' | 'en';

export function t(lang: Language, keyOrObj: string | { sv: string, en: string } | undefined): string {
    if (!keyOrObj) return "";
    if (typeof keyOrObj === 'string') return keyOrObj;
    return lang === 'sv' ? keyOrObj.sv : keyOrObj.en;
}

export const TERMS = {
    ui: {
        hints: { sv: "Ledtrådar", en: "Hints" },
        streak_modal_title: { sv: "Fantastiskt! 🔥", en: "Awesome! 🔥" },
        streak_modal_msg: { sv: "Du har nått en streak på {streak}!", en: "You hit a streak of {streak}!" },
        total_modal_title: { sv: "Snyggt jobbat! ✅", en: "Great work! ✅" },
        total_modal_msg: { sv: "Du svarade rätt på {total} frågor! Bra jobbat!", en: "You answered {total} questions correctly! Great job!" },
        btn_close_streak: { sv: "Bra jobbat!", en: "Great job!" },
        btn_close_total: { sv: "Fortsätt", en: "Continue" }
    },
    common: {
        solve: { sv: "Lös ut", en: "Solve for" },
        calculate: { sv: "Beräkna", en: "Calculate" },
        find: { sv: "Hitta", en: "Find" },
        result: { sv: "Svar:", en: "Answer:" },
        drawing: { sv: "Avbildning", en: "Drawing" },
        reality: { sv: "Verklighet", en: "Reality" },
        distribute: { sv: "Distribuera", en: "Distribute" },
        equation: { sv: "Ekvation", en: "Equation" },
        simplify: { sv: "Förenkla", en: "Simplify" },
        identify_var: { sv: "Identifiera variabeln", en: "Identify the variable" },
        identify_const: { sv: "Identifiera konstanterna", en: "Identify constants" },
        combine_like: { sv: "Kombinera termer", en: "Combine like terms" }
    },
    // NEW: Detailed explanations for negative number logic
    neg_signs: {
        sub_neg: { sv: "Minus ett negativt tal blir plus. Vi adderar istället.", en: "Minus a negative number becomes plus. We add instead." },
        add_neg: { sv: "Plus ett negativt tal blir minus. Vi subtraherar istället.", en: "Plus a negative number becomes minus. We subtract instead." },
        simple_calc: { sv: "Beräkna.", en: "Calculate." },
        
        mul_pos_neg: { sv: "Olika tecken ger ett negativt svar.", en: "Different signs give a negative answer." },
        mul_neg_neg: { sv: "Lika tecken (två minus) ger ett positivt svar.", en: "Same signs (two minuses) give a positive answer." },
        
        div_sign_same: { sv: "Lika tecken ger alltid ett positivt svar.", en: "Same signs always give a positive answer." },
        div_sign_diff: { sv: "Olika tecken ger alltid ett negativt svar.", en: "Different signs always give a negative answer." },
        
        step_calc: { sv: "Beräkna nästa steg.", en: "Calculate the next step." }
    },
    // ADDED FOR SIMILARITY MODULE
    similarity: {
        ratio: { sv: "Förhållande", en: "Ratio" },
        scale: { sv: "Skala", en: "Scale" },
        
        // Basic Rules
        rule_sides: { sv: "För att vara likformiga måste kvoten av motsvarande sidor vara densamma.", en: "To be similar, the ratio of corresponding sides must be constant." },
        rule_angles: { sv: "För att vara likformiga måste motsvarande vinklar vara lika stora.", en: "To be similar, corresponding angles must be equal." },
        step_k: { sv: "Hitta skalan (k) genom att jämföra motsvarande sidor.", en: "Find the scale factor (k) by comparing corresponding sides." },
        step_calc: { sv: "Använd skalan för att beräkna den okända sidan.", en: "Use the scale factor to calculate the unknown side." },
        rule_top: { sv: "Topptriangeln och hela triangeln delar en vinkel och har parallella baser, alltså är de likformiga.", en: "The top triangle and the whole triangle share an angle and have parallel bases, so they are similar." },
        rule_hourglass: { sv: "Vertikalvinklar är lika och alternatvinklar är lika (parallella linjer), så trianglarna är likformiga.", en: "Vertical angles are equal and alternate interior angles are equal (parallel lines), so the triangles are similar." },
        
        // Pythagoras sats
        pythagoras_rule: { sv: "Pythagoras sats: $a^2 + b^2 = c^2$ (c är hypotenusan).", en: "Pythagorean theorem: $a^2 + b^2 = c^2$ (c is the hypotenuse)." },
        calc_hyp: { sv: "Vi söker hypotenusan (lång sida) -> Addera kvadraterna.", en: "Finding hypotenuse (long side) -> Add the squares." },
        calc_leg: { sv: "Vi söker en katet (kort sida) -> Subtrahera kvadraterna.", en: "Finding a leg (short side) -> Subtract the squares." },
        step_root: { sv: "Dra roten ur:", en: "Take the square root:" }

        // Detailed pedagogical explanations (The "Why")
        expl_sides_rule: { 
            sv: "För likformighet krävs att kvoten mellan alla motsvarande sidor är densamma.", 
            en: "For similarity, the ratio between all corresponding sides must be equal." 
        },
        expl_sides_check: {
            sv: "Vi kontrollerar skalfaktorn för varje par av sidor:",
            en: "We check the scale factor for each pair of sides:"
        },
        expl_conclusion: { sv: "Slutsats:", en: "Conclusion:" },
        
        expl_angles_rule: {
            sv: "Likformiga figurer måste ha exakt samma vinklar.",
            en: "Similar shapes must have exactly the same angles."
        },
        expl_angles_calc: {
            sv: "Vi vet att triangelns vinkelsumma är 180°. Vi beräknar den saknade vinkeln:",
            en: "We know the sum of angles in a triangle is 180°. We calculate the missing angle:"
        },
        
        expl_scale_k: { 
            sv: "Hur många gånger större är den stora figuren? Vi räknar ut skalan (k):", 
            en: "How many times bigger is the large shape? We calculate the scale (k):" 
        },
        
        expl_calc_mult: { sv: "Multiplicera den lilla sidan med skalan:", en: "Multiply the small side by the scale:" },
        expl_calc_div: { sv: "Dividera den stora sidan med skalan:", en: "Divide the large side by the scale:" },
        
        expl_top_tri_rule: {
            sv: "Eftersom baserna är parallella har trianglarna samma vinklar och är därför likformiga.",
            en: "Since the bases are parallel, the triangles share the same angles and are therefore similar."
        },
        expl_hourglass_rule: {
            sv: "Vertikalvinklar är lika stora. Parallella linjer ger lika alternatvinklar. Trianglarna är likformiga.",
            en: "Vertical angles are equal. Parallel lines give equal alternate angles. The triangles are similar."
        }
    },
    scale: {
        scale: { sv: "Skala", en: "Scale" },
        drawing: { sv: "Bild", en: "Image" },
        reality: { sv: "Verklighet", en: "Reality" },
        step_plug_in: { sv: "Ställ upp förhållandet:", en: "Set up the ratio:" },
        step_simplify: { sv: "Förenkla:", en: "Simplify:" },
        enlargement: { sv: "Förstoring", en: "Enlargement" },
        reduction: { sv: "Förminskning", en: "Reduction" },
        rule_reduction: { sv: "Eftersom det första talet är 1, är det en förminskning.", en: "Since the first number is 1, it is a reduction." },
        rule_enlargement: { sv: "Eftersom det första talet är större än 1, är det en förstoring.", en: "Since the first number is greater than 1, it is an enlargement." },
        
        calc_cm: { sv: "Beräkna cm", en: "Calculate cm" },
        conv_m: { sv: "Omvandla till meter", en: "Convert to m" },
        conv_units: { sv: "Omvandla enheter", en: "Convert units" },
        div_scale: { sv: "Dividera med skalan", en: "Divide by scale" },
        conv_same: { sv: "Omvandla till samma enhet (cm)", en: "Convert to same unit (cm)" },
        setup_ratio: { sv: "Ställ upp förhållandet", en: "Set up ratio" },
        
        calc_area_img: { sv: "Beräkna bildens area", en: "Calculate image area" },
        calc_area_real: { sv: "Beräkna verklighetens area", en: "Calculate reality area" },
        calc_area_scale: { sv: "Beräkna areaskala (längdskala²)", en: "Calculate area scale (length scale²)" },
        calc_new_area: { sv: "Beräkna ny area", en: "Calculate new area" }
    },
    volume: {
        formula_cube: { sv: "Volym = sida³", en: "Volume = side³" },
        formula_rect_prism: { sv: "Volym = längd · bredd · höjd", en: "Volume = length · width · height" },
        formula_prism_base: { sv: "Volym = Basytan · höjden", en: "Volume = Base Area · height" },
        formula_cylinder: { sv: "Volym = π · r² · h", en: "Volume = π · r² · h" },
        formula_cone: { sv: "Volym = (π · r² · h) / 3", en: "Volume = (π · r² · h) / 3" },
        formula_pyramid: { sv: "Volym = (Basytan · h) / 3", en: "Volume = (Base Area · h) / 3" },
        formula_sphere: { sv: "Volym = (4 · π · r³) / 3", en: "Volume = (4 · π · r³) / 3" },
        step_calc_base: { sv: "Beräkna basytan (B)", en: "Calculate Base Area (B)" },
        
        expl_prism_vol: { sv: "Multiplicera basytan med höjden.", en: "Multiply the base area by the height." },
        expl_cone_fraction: { sv: "En kon är en tredjedel av en cylinder.", en: "A cone is one third of a cylinder." },
        expl_sphere_formula: { sv: "Använd formeln för klot.", en: "Use the formula for a sphere." },
        expl_hemi_split: { sv: "Dela klotets volym med två.", en: "Divide the sphere's volume by two." },
        expl_total_add: { sv: "Addera delarna för att få totalen.", en: "Add the parts to get the total." },
        
        expl_prism_base: { sv: "Basytan är en triangel (b*h)/2.", en: "The base is a triangle (b*h)/2." },
        expl_cylinder_base: { sv: "Basytan är en cirkel (pi*r^2).", en: "The base is a circle (pi*r^2)." },
        expl_cone_vol: { sv: "Konens volym", en: "Cone Vol" },
        
        radius: { sv: "Radie", en: "Radius" },
        find_radius: { sv: "Hitta radien (r = d/2)", en: "Find radius (r = d/2)" },
        volume: { sv: "Volym", en: "Volume" },
        sphere_vol: { sv: "Klotets volym", en: "Sphere Vol" },
        hemi_vol: { sv: "Halvklotets volym", en: "Hemisphere Vol" },
        cone_vol: { sv: "Konens volym", en: "Cone Vol" },
        cyl_vol: { sv: "Cylinderns volym", en: "Cylinder Vol" },
        total: { sv: "Totalt", en: "Total" },
        half: { sv: "Hälften", en: "Half" }
    },
    shapes: {
        square: { sv: "kvadrat", en: "square" },
        rectangle: { sv: "rektangel", en: "rectangle" },
        circle: { sv: "cirkel", en: "circle" },
        semicircle: { sv: "halvcirkel", en: "semicircle" }, 
        triangle: { sv: "triangel", en: "triangle" },
        rhombus: { sv: "romb", en: "rhombus" },
        parallelogram: { sv: "parallellogram", en: "parallelogram" },
        pentagon: { sv: "femhörning", en: "pentagon" },
        hexagon: { sv: "sexhörning", en: "hexagon" },
        octagon: { sv: "åttahörning", en: "octagon" },
        kite: { sv: "drake", en: "kite" },
        star: { sv: "stjärna", en: "star" },
        arrow: { sv: "pil", en: "arrow" },
        heart: { sv: "hjärta", en: "heart" },
        cross: { sv: "kors", en: "cross" },
        lightning: { sv: "blixt", en: "lightning" },
        cube: { sv: "kub", en: "cube" },
        rect_prism: { sv: "rätblock", en: "rectangular prism" }, 
        tri_prism: { sv: "triangulärt prisma", en: "triangular prism" },
        triangular_prism: { sv: "triangulärt prisma", en: "triangular prism" },
        cylinder: { sv: "cylinder", en: "cylinder" },
        pyramid: { sv: "pyramid", en: "pyramid" },
        cone: { sv: "kon", en: "cone" },
        sphere: { sv: "klot", en: "sphere" } 
    } as Record<string, {sv:string, en:string}>,
    shapes_plural: {
        square: { sv: "kvadrater", en: "squares" },
        rectangle: { sv: "rektanglar", en: "rectangles" },
        circle: { sv: "cirklar", en: "circles" },
        semicircle: { sv: "halvcirklar", en: "semicircles" },
        triangle: { sv: "trianglar", en: "triangles" },
        parallelogram: { sv: "parallellogrammer", en: "parallelograms" },
        rhombus: { sv: "romber", en: "rhombuses" }
    } as Record<string, {sv:string, en:string}>,
    geometry: {
        desc_rect: { sv: "En rektangel", en: "A rectangle" },
        desc_para: { sv: "En parallellogram", en: "A parallelogram" },
        desc_tri: { sv: "En triangel", en: "A triangle" },
        desc_circle: { sv: "En cirkel", en: "A circle" },
        desc_composite: { sv: "En sammansatt figur", en: "A composite shape" },
        
        calc_area_tri: { sv: "Area = (basen · höjden) / 2", en: "Area = (base · height) / 2" },
        formula_rect_perim: { sv: "Omkrets = 2 · (bredd + höjd)", en: "Perimeter = 2 · (width + height)" },
        formula_para_perim: { sv: "Omkrets = 2 · (sida A + sida B)", en: "Perimeter = 2 · (side A + side B)" },
        formula_rect_perim_latex: "O = 2(b + h)",
        formula_para_perim_latex: "O = 2(a + b)",
        
        step_sub: { sv: "Sätt in värdena i formeln:", en: "Substitute values into the formula:" },
        step_calc: { sv: "Beräkna resultatet:", en: "Calculate the result:" },
        calc_perim: { sv: "Beräkna omkretsen", en: "Calculate perimeter" },
        calc_area: { sv: "Beräkna arean", en: "Calculate area" },
        
        step_comp_tri_sides: { sv: "Addera sidorna:", en: "Add the sides:" },
        step_comp_arc_verbose: { sv: "Beräkna bågen:", en: "Calculate the arc:" },
        step_comp_total_perim: { sv: "Total omkrets:", en: "Total perimeter:" },
        step_comp_semi_area: { sv: "Halvcirkelns area:", en: "Semicircle area:" },
        step_comp_total_area: { sv: "Total area:", en: "Total area:" },
        
        comp_rect_area: { sv: "Rektangelns area:", en: "Rectangle area:" },
        comp_tri_area: { sv: "Triangelns area:", en: "Triangle area:" },
        comp_total_area: { sv: "Total area:", en: "Total area:" },

        sides_3: { sv: "3 Sidor", en: "3 Sides" },
        arc: { sv: "Båge", en: "Arc" }
    },
    simplification: {
        intro: (expr: string) => ({ sv: `Förenkla uttrycket: $${expr}$`, en: `Simplify the expression: $${expr}$` }),
        group_terms: { sv: "Gruppera termer (x med x, tal med tal)", en: "Group like terms" },
        calc_result: (ans: string) => ({ sv: `Resultat: $${ans}$`, en: `Result: $${ans}$` }),
        start_unknown: { sv: "Vi börjar med talet $x$.", en: "We start with the number $x$." },
        translate_math: { sv: "Översätt texten till matematik:", en: "Translate text to math:" },
        cost_unknown: (item: string) => ({ sv: `Priset per ${item} är okänt, så $x$.`, en: `Price per ${item} is unknown, so $x$.` }),
        final_expr: { sv: "Slutgiltigt uttryck:", en: "Final expression:" },
        simplify_const: { sv: "Förenkla konstanterna:", en: "Simplify constants:" },
        
        expl_var_basic: { sv: "Variabeln (x) representerar det okända antalet.", en: "The variable (x) represents the unknown number." },
        expl_fixed_cost: { sv: "Detta är den fasta avgiften/kostnaden.", en: "This is the fixed fee/cost." },
        expl_rate_val: { sv: "Detta är priset per styck (multipliceras med x).", en: "This is the price per item (multiplied by x)." },
        expl_total: { sv: "Detta är summan av alla delar.", en: "This is the sum of all parts." },
        expl_discount: { sv: "Rabatten dras bort från totalen.", en: "The discount is subtracted from the total." },
        expl_compare: { sv: "Vi jämför två mängder.", en: "We are comparing two quantities." },
        
        expl_distribute: (val: number) => ({ sv: `Multiplicera in ${val} i parentesen.`, en: `Multiply ${val} into the parentheses.` }),
        expl_group: { sv: "Samla alla x-termer och alla vanliga tal.", en: "Collect all x-terms and all number terms." }
    },
    algebra: {
        intro: (eq: string) => ({ sv: `Ekvation: $${eq}$`, en: `Equation: $${eq}$` }),
        subtract: (val: number) => ({ sv: `Subtrahera ${val} från båda sidor`, en: `Subtract ${val} from both sides` }),
        add: (val: number) => ({ sv: `Addera ${val} till båda sidor`, en: `Add ${val} to both sides` }),
        divide: (val: number) => ({ sv: `Dela båda sidor med ${val}`, en: `Divide both sides by ${val}` }),
        multiply: (val: number) => ({ sv: `Multiplicera båda sidor med ${val}`, en: `Multiply both sides by ${val}` }),
        distribute: (val: number) => ({ sv: `Multiplicera in ${val} i parentesen`, en: `Distribute ${val} into the parentheses` }),
        sub_var: (term: string) => ({ sv: `Subtrahera ${term} från båda sidor`, en: `Subtract ${term} from both sides` })
    },
    graph: {
        q_intercept: { sv: "Hitta m-värdet (skärning med y-axeln):", en: "Find the Y-Intercept (m):" },
        q_slope: { sv: "Beräkna lutningen (k):", en: "Calculate the slope (k):" },
        q_func: { sv: "Skriv funktionen på formen y = kx + m", en: "Write the function as y = kx + m" },
        step_intercept: (m: number) => ({ sv: `Avläs m-värdet där linjen skär y-axeln. m = ${m}`, en: `Read the y-intercept (m) where line crosses y-axis. m = ${m}` }),
        step_func: (k: number, m: number) => ({ sv: `Sätt in k och m i formeln: y = ${k}x + ${m}`, en: `Insert k and m into formula: y = ${k}x + ${m}` }),
        step_delta: { sv: "Skillnad i y / Skillnad i x", en: "Change in y / Change in x" },
        step_slope_calc: { sv: "Beräkna k", en: "Calculate k" },
        look_x0: { sv: "Titta på x = 0", en: "Look at x = 0" },
        find_m: { sv: "Hitta m", en: "Find m" },
        find_k: { sv: "Hitta k", en: "Find k" }
    },
    problem_solving: {
        task_solve: { sv: "Vad är x?", en: "What is x?" },
        task_write: { sv: "Teckna en ekvation för att beräkna x.", en: "Write an equation to calculate x." },
        task_write_expr: { sv: "Teckna ett förenklat uttryck.", en: "Write a simplified expression." },

        a_buy: { sv: "Du köper $x$ st {item} för $a$ kr styck och en kasse för $b$ kr. Totalt betalar du $c$ kr.", en: "You buy $x$ {item} for $a$ kr each and a bag for $b$ kr. In total, you pay $c$ kr." },
        a_taxi: { sv: "En taxi kostar $b$ kr i startavgift och sedan $a$ kr per km. Du åker $x$ km och betalar totalt $c$ kr.", en: "A taxi charges a start fee of $b$ kr and then $a$ kr per km. You travel $x$ km and pay a total of $c$ kr." },
        b_discount: { sv: "Du köper $x$ st {item} som kostar $a$ kr styck. Du får $b$ kr i rabatt på totalen. Du betalar $c$ kr.", en: "You buy $x$ {item} costing $a$ kr each. You get a discount of $b$ kr on the total. You pay $c$ kr." },
        b_points: { sv: "Du samlar $a$ poäng per nivå i ett spel. Du klarar $x$ nivåer men förlorar $b$ poäng i straff. Du har totalt $c$ poäng.", en: "You earn $a$ points per level in a game. You clear $x$ levels but lose $b$ points as a penalty. You have $c$ points in total." },
        c_compare: { sv: "{name1} har $x$ st {item}. {name2} har $a$ fler {item} än {name1}. Tillsammans har de $c$ st.", en: "{name1} has $x$ {item}. {name2} has $a$ more {item} than {name1}. Together they have $c$." },
        d_compare: { sv: "{name1} har $x$ st {item}. {name2} har $b$ färre {item} än {name1}. Tillsammans har de $c$ st.", en: "{name1} has $x$ {item}. {name2} has $b$ fewer {item} than {name1}. Together they have $c$." },

        clue_var: { sv: "Låt x vara antalet.", en: "Let x be the number." },
        clue_setup: { sv: "Ställ upp ekvationen.", en: "Set up the equation." },
        clue_total: { sv: "Totalt är det", en: "The total is" },
        
        expl_fixed_val: { sv: "Detta är det fasta värdet (t.ex. startavgift eller påse).", en: "This is the fixed value (e.g. start fee or bag)." },
        expl_rate_val: { sv: "Detta är det rörliga värdet (pris per styck · antal).", en: "This is the variable value (price per item · quantity)." },
        expl_person1: { sv: "Den första personen har x.", en: "The first person has x." },
        expl_person2_more: { sv: "Den andra personen har mer än den första.", en: "The second person has more than the first." },
        expl_person2_less: { sv: "Den andra personen har mindre än den första.", en: "The second person has less than the first." },
        expl_item_cost: { sv: "Priset för varorna är:", en: "The price for the items is:" },
        expl_discount_sub: { sv: "Rabatten dras bort:", en: "The discount is subtracted:" },
        expl_compare_sum: { sv: "Vi adderar båda personernas antal:", en: "We add both amounts:" },
        expl_compare_diff: { sv: "Summan av båda personerna är:", en: "The sum of both people is:" }
    }
};