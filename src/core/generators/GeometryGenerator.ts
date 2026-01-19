import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class GeometryGenerator {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const color = "\\mathbf{\\color{#D35400}";
    const s = (val: number) => Math.round(val * multiplier);

    let mode = level;
    if (level >= 6) mode = rng.intBetween(3, 5);

    let steps: Clue[] = [];
    let qData = { text_key: "", description: "", latex: "", answer: 0 };

    // --- LEVEL 1: Perimeter (Rectangles) ---
    if (mode === 1) {
        const w = rng.intBetween(s(3), s(12));
        const h = rng.intBetween(s(2), s(8));
        qData.answer = 2 * (w + h);
        qData.text_key = "calc_perim";
        qData.description = t(lang, TERMS.geometry.desc_rect);
        qData.latex = `b = ${w}, h = ${h}`;
        
        steps = [
            { text: t(lang, TERMS.geometry.formula_rect_perim), latex: TERMS.geometry.formula_rect_perim_latex },
            { text: t(lang, TERMS.geometry.step_sub), latex: `2(${w} + ${h})` },
            { text: t(lang, TERMS.geometry.step_calc), latex: `${color}{${qData.answer}}` }
        ];
    }
    
    // --- LEVEL 2: Area (Rectangles) ---
    else if (mode === 2) {
        const w = rng.intBetween(s(3), s(12));
        const h = rng.intBetween(s(2), s(8));
        qData.answer = w * h;
        qData.text_key = "calc_area";
        qData.description = t(lang, TERMS.geometry.desc_rect);
        qData.latex = `b = ${w}, h = ${h}`;
        
        steps = [
            { text: "Area formula", latex: "A = b \\cdot h" },
            { text: t(lang, TERMS.geometry.step_calc), latex: `${w} \\cdot ${h} = ${color}{${qData.answer}}` }
        ];
    }

    // --- LEVEL 3: Triangles (Area) ---
    else if (mode === 3) {
        const b = rng.intBetween(s(4), s(14));
        // Ensure height is even so area is integer
        const h = rng.intBetween(s(2), s(10)) * 2; 
        qData.answer = (b * h) / 2;
        qData.text_key = "calc_area";
        qData.description = t(lang, TERMS.geometry.desc_tri);
        qData.latex = `b = ${b}, h = ${h}`;
        
        steps = [
            { text: "Area formula", latex: "A = \\frac{b \\cdot h}{2}" },
            { text: t(lang, TERMS.geometry.step_calc), latex: `\\frac{${b} \\cdot ${h}}{2} = ${color}{${qData.answer}}` }
        ];
    }

    // --- LEVEL 4: Circles (Circumference) ---
    else if (mode === 4) {
        const r = rng.intBetween(2, 9);
        const piApprox = 3.14;
        const circ = 2 * piApprox * r;
        qData.answer = Math.round(circ * 100) / 100; // Round 2 decimals
        qData.text_key = "calc_perim";
        qData.description = t(lang, TERMS.geometry.desc_circle);
        qData.latex = `r = ${r} \\quad (\\pi \\approx 3.14)`;
        
        steps = [
            { text: "Circumference formula", latex: "O = 2 \\cdot \\pi \\cdot r" },
            { text: t(lang, TERMS.geometry.step_calc), latex: `2 \\cdot 3.14 \\cdot ${r} = ${color}{${qData.answer}}` }
        ];
    }

    // --- LEVEL 5: Composite (Ice Cream Cone: Triangle + Semicircle) ---
    else {
        const diameter = rng.intBetween(4, 10) * 2; // Even diameter
        const r = diameter / 2;
        const side = rng.intBetween(diameter + 2, diameter + 10);
        
        // Perimeter of shape = 2*side + (pi*d)/2
        const arc = (3.14 * diameter) / 2;
        qData.answer = Math.round((2 * side + arc) * 100) / 100;
        
        qData.text_key = "calc_perim";
        qData.description = t(lang, TERMS.geometry.desc_composite);
        // Isosceles triangle on bottom, semicircle on top
        qData.latex = `\\text{Triangle sides} = ${side}, \\text{Top width} = ${diameter}`;
        
        steps = [
            { text: t(lang, TERMS.geometry.step_comp_tri_sides), latex: `${side} + ${side} = ${2*side}` },
            { text: t(lang, TERMS.geometry.step_comp_arc_verbose), latex: `\\frac{3.14 \\cdot ${diameter}}{2} = ${arc}` },
            { text: t(lang, TERMS.geometry.step_comp_total_perim), latex: `${2*side} + ${arc} = ${color}{${qData.answer}}` }
        ];
    }

    return {
        questionId: `geo-l${level}-${seed}`,
        renderData: {
            text_key: qData.text_key,
            description: qData.description,
            latex: qData.latex,
            answerType: 'numeric'
        },
        serverData: {
            answer: qData.answer,
            solutionSteps: steps
        }
    };
  }
}