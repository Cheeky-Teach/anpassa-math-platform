export type Language = 'sv' | 'en';

export function t(lang: Language, keyOrObj: string | { sv: string, en: string } | undefined): string {
    if (!keyOrObj) return "";
    if (typeof keyOrObj === 'string') return keyOrObj;
    return lang === 'sv' ? keyOrObj.sv : keyOrObj.en;
}

export const TERMS = {
    common: {
        solve: { sv: "Lös ut", en: "Solve for" },
        calculate: { sv: "Beräkna", en: "Calculate" },
        find: { sv: "Hitta", en: "Find" },
        result: { sv: "Svar:", en: "Answer:" },
        drawing: { sv: "Avbildning", en: "Drawing" },
        reality: { sv: "Verklighet", en: "Reality" }
    },
    shapes: {
        square: { sv: "kvadrat", en: "square" },
        rectangle: { sv: "rektangel", en: "rectangle" },
        circle: { sv: "cirkel", en: "circle" },
        triangle: { sv: "triangel", en: "triangle" },
        star: { sv: "stjärna", en: "star" },
        arrow: { sv: "pil", en: "arrow" },
        cube: { sv: "kub", en: "cube" },
        cylinder: { sv: "cylinder", en: "cylinder" }
        // Fallback for others handled by returning key if missing
    } as Record<string, {sv:string, en:string}>,
    scale: {
        step_plug_in: { sv: "Ställ upp förhållandet:", en: "Set up the ratio:" },
        step_simplify: { sv: "Förenkla:", en: "Simplify:" }
    },
    algebra: {
        intro: (eq: string) => ({ sv: `Börja med ekvationen: $${eq}$`, en: `Start with the equation: $${eq}$` }),
        sub_var: (term: string) => ({ sv: `Subtrahera ${term} från båda sidor`, en: `Subtract ${term} from both sides` }),
        subtract: (n: number) => ({ sv: `Subtrahera ${n} från båda sidor`, en: `Subtract ${n} from both sides` }),
        add: (n: number) => ({ sv: `Addera ${n} till båda sidor`, en: `Add ${n} to both sides` }),
        divide: (n: number) => ({ sv: `Dela båda sidor med ${n}`, en: `Divide both sides by ${n}` }),
        multiply: (n: number) => ({ sv: `Multiplicera båda sidor med ${n}`, en: `Multiply both sides by ${n}` }),
        distribute: (n: number) => ({ sv: `Multiplicera in ${n} i parentesen`, en: `Distribute ${n} into the parentheses` })
    },
    geometry: {
        desc_rect: { sv: "En rektangel", en: "A rectangle" },
        desc_para: { sv: "En parallellogram", en: "A parallelogram" },
        desc_tri: { sv: "En triangel", en: "A triangle" },
        desc_circle: { sv: "En cirkel", en: "A circle" },
        desc_composite: { sv: "En sammansatt figur", en: "A composite shape" },
        
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
        step_comp_total_area: { sv: "Total area:", en: "Total area:" }
    },
    simplification: {
        intro: (expr: string) => ({ sv: `Förenkla uttrycket: $${expr}$`, en: `Simplify the expression: $${expr}$` }),
        group_terms: { sv: "Gruppera termer (x med x, tal med tal)", en: "Group like terms" },
        calc_result: (ans: string) => ({ sv: `Resultat: $${ans}$`, en: `Result: $${ans}$` })
    },
    graph: {
        q_intercept: { sv: "Hitta m-värdet (skärning med y-axeln):", en: "Find the Y-Intercept (m):" },
        q_slope: { sv: "Beräkna lutningen (k):", en: "Calculate the slope (k):" },
        q_func: { sv: "Skriv funktionen på formen y = kx + m", en: "Write the function as y = kx + m" },
        step_intercept: (m: number) => ({ sv: `Linjen skär y-axeln vid ${m}.`, en: `The line intersects the y-axis at ${m}.` }),
        step_func: (k: number, m: number) => ({ sv: `Sätt in k=${k} och m=${m} i formeln.`, en: `Substitute k=${k} and m=${m} into the formula.` })
    }
};