export type Language = 'sv' | 'en';

export function t(lang: Language, keyOrObj: string | { sv: string, en: string } | undefined): string {
    if (!keyOrObj) return "";
    if (typeof keyOrObj === 'string') return keyOrObj;
    return lang === 'sv' ? keyOrObj.sv : keyOrObj.en;
}

export const TERMS = {
    ui: {
        hints: { sv: "Ledtrådar", en: "Hints" }
    },
    common: {
        solve: { sv: "Lös ut", en: "Solve for" },
        calculate: { sv: "Beräkna", en: "Calculate" },
        find: { sv: "Hitta", en: "Find" },
        result: { sv: "Svar:", en: "Answer:" },
        drawing: { sv: "Avbildning", en: "Drawing" },
        reality: { sv: "Verklighet", en: "Reality" }
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
        
        // Area Scale Specific
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
        step_calc_base: { sv: "Beräkna basytan (B)", en: "Calculate Base Area (B)" }
    },
    shapes: {
        // 2D Shapes
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
        
        // Symbols
        star: { sv: "stjärna", en: "star" },
        arrow: { sv: "pil", en: "arrow" },
        heart: { sv: "hjärta", en: "heart" },
        cross: { sv: "kors", en: "cross" },
        lightning: { sv: "blixt", en: "lightning" },
        
        // 3D Shapes
        cube: { sv: "kub", en: "cube" },
        rect_prism: { sv: "rätblock", en: "rectangular prism" }, 
        tri_prism: { sv: "triangulärt prisma", en: "triangular prism" }, // Kept for compatibility
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
        // Descriptions
        desc_rect: { sv: "En rektangel", en: "A rectangle" },
        desc_para: { sv: "En parallellogram", en: "A parallelogram" },
        desc_tri: { sv: "En triangel", en: "A triangle" },
        desc_circle: { sv: "En cirkel", en: "A circle" },
        desc_composite: { sv: "En sammansatt figur", en: "A composite shape" },
        
        // Formulas & Calcs (Merged)
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
        
        // Compatibility keys for existing generators
        comp_rect_area: { sv: "Rektangelns area:", en: "Rectangle area:" },
        comp_tri_area: { sv: "Triangelns area:", en: "Triangle area:" },
        comp_total_area: { sv: "Total area:", en: "Total area:" }
    },
    simplification: {
        intro: (expr: string) => ({ sv: `Förenkla uttrycket: $${expr}$`, en: `Simplify the expression: $${expr}$` }),
        group_terms: { sv: "Gruppera termer (x med x, tal med tal)", en: "Group like terms" },
        calc_result: (ans: string) => ({ sv: `Resultat: $${ans}$`, en: `Result: $${ans}$` }),
        start_unknown: { sv: "Vi börjar med talet $x$.", en: "We start with the number $x$." },
        translate_math: { sv: "Översätt texten till matematik:", en: "Translate text to math:" },
        cost_unknown: (item: string) => ({ sv: `Priset per ${item} är okänt, så $x$.`, en: `Price per ${item} is unknown, so $x$.` }),
        final_expr: { sv: "Slutgiltigt uttryck:", en: "Final expression:" },
        simplify_const: { sv: "Förenkla konstanterna:", en: "Simplify constants:" }
    },
    algebra: {
        intro: (eq: string) => ({ sv: `Ekvation: $${eq}$`, en: `Equation: $${eq}$` }),
        subtract: (val: number) => ({ sv: `Subtrahera ${val} från båda sidor`, en: `Subtract ${val} from both sides` }),
        add: (val: number) => ({ sv: `Addera ${val} på båda sidor`, en: `Add ${val} to both sides` }),
        divide: (val: number) => ({ sv: `Dela med ${val}`, en: `Divide by ${val}` }),
        multiply: (val: number) => ({ sv: `Multiplicera med ${val}`, en: `Multiply by ${val}` }),
        distribute: (val: number) => ({ sv: `Multiplicera in ${val} i parentesen`, en: `Distribute ${val} into the parentheses` }),
        sub_var: (term: string) => ({ sv: `Subtrahera ${term} från båda sidor`, en: `Subtract ${term} from both sides` })
    },
    graph: {
        q_intercept: { sv: "Hitta m-värdet (skärning med y-axeln):", en: "Find the Y-Intercept (m):" },
        q_slope: { sv: "Beräkna lutningen (k):", en: "Calculate the slope (k):" },
        q_func: { sv: "Skriv funktionen på formen y = kx + m", en: "Write the function as y = kx + m" },
        step_intercept: (m: number) => ({ sv: `Avläs m-värdet där linjen skär y-axeln. m = ${m}`, en: `Read the y-intercept (m) where line crosses y-axis. m = ${m}` }),
        step_func: (k: number, m: number) => ({ sv: `Sätt in k och m i formeln: y = ${k}x + ${m}`, en: `Insert k and m into formula: y = ${k}x + ${m}` })
    },
};