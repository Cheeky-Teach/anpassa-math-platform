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
    let geometry: any = undefined;

    // --- LEVEL 1: Perimeter (Rectangles) ---
    if (mode === 1) {
        const w = rng.intBetween(s(3), s(12));
        const h = rng.intBetween(s(2), s(8));
        qData.answer = 2 * (w + h);
        qData.text_key = "calc_perim";
        
        qData.description = lang === 'sv' 
            ? `Beräkna omkretsen av en rektangel med bredden ${w} och höjden ${h}.`
            : `Calculate the perimeter of a rectangle with width ${w} and height ${h}.`;
            
        qData.latex = `O = ?`;
        
        steps = [
            { text: t(lang, TERMS.geometry.formula_rect_perim), latex: TERMS.geometry.formula_rect_perim_latex },
            { text: t(lang, TERMS.geometry.step_sub), latex: `2(${w} + ${h})` },
            { text: t(lang, TERMS.geometry.step_calc), latex: `${color}{${qData.answer}}}` }
        ];

        geometry = { 
            type: 'rectangle', 
            width: w, 
            height: h, 
            labels: { bottom: w, right: h } 
        };
    }
    
    // --- LEVEL 2: Area (Rectangles) ---
    else if (mode === 2) {
        const w = rng.intBetween(s(3), s(12));
        const h = rng.intBetween(s(2), s(8));
        qData.answer = w * h;
        qData.text_key = "calc_area";
        
        qData.description = lang === 'sv'
            ? `Beräkna arean av en rektangel med sidorna ${w} och ${h}.`
            : `Calculate the area of a rectangle with sides ${w} and ${h}.`;

        qData.latex = `A = ?`;
        
        steps = [
            { text: "Area formula", latex: "A = b \\cdot h" },
            { text: t(lang, TERMS.geometry.step_calc), latex: `${w} \\cdot ${h} = ${color}{${qData.answer}}}` }
        ];

        geometry = { 
            type: 'rectangle', 
            width: w, 
            height: h, 
            labels: { bottom: w, right: h } 
        };
    }

    // --- LEVEL 3: Triangles (Area) ---
    else if (mode === 3) {
        const b = rng.intBetween(s(4), s(14));
        const h = rng.intBetween(s(2), s(10)) * 2; 
        qData.answer = (b * h) / 2;
        qData.text_key = "calc_area";
        
        qData.description = lang === 'sv'
            ? `Beräkna arean av en triangel med basen ${b} och höjden ${h}.`
            : `Calculate the area of a triangle with base ${b} and height ${h}.`;

        qData.latex = `A = ?`;
        
        steps = [
            { text: "Area formula", latex: "A = \\frac{b \\cdot h}{2}" },
            { text: t(lang, TERMS.geometry.step_calc), latex: `\\frac{${b} \\cdot ${h}}{2} = ${color}{${qData.answer}}}` }
        ];

        geometry = {
            type: 'triangle',
            width: b,
            height: h,
            labels: { bottom: b, height: h }
        };
    }

    // --- LEVEL 4: Circles (Circumference) ---
    else if (mode === 4) {
        const r = rng.intBetween(2, 9);
        const piApprox = 3.14;
        const circ = 2 * piApprox * r;
        qData.answer = Math.round(circ * 100) / 100;
        qData.text_key = "calc_perim";
        
        qData.description = lang === 'sv'
            ? `Beräkna omkretsen av en cirkel med radien ${r}.`
            : `Calculate the circumference of a circle with radius ${r}.`;

        qData.latex = `r = ${r} \\quad (\\pi \\approx 3.14)`;
        
        steps = [
            { text: "Circumference formula", latex: "O = 2 \\cdot \\pi \\cdot r" },
            { text: t(lang, TERMS.geometry.step_calc), latex: `2 \\cdot 3.14 \\cdot ${r} = ${color}{${qData.answer}}}` }
        ];

        geometry = {
            type: 'circle',
            radius: r,
            labels: { radius: r }
        };
    }

    // --- LEVEL 5: Composite (Ice Cream Cone) ---
    else {
        const diameter = rng.intBetween(4, 10) * 2;
        const r = diameter / 2;
        const side = rng.intBetween(diameter + 2, diameter + 10);
        const arc = (3.14 * diameter) / 2;
        qData.answer = Math.round((2 * side + arc) * 100) / 100;
        
        qData.text_key = "calc_perim";
        qData.description = lang === 'sv'
            ? `Beräkna omkretsen av figuren. Triangeln är likbent med sidan ${side} och halvcirkeln har diametern ${diameter}.`
            : `Calculate the perimeter. The triangle is isosceles with side ${side} and the semicircle has diameter ${diameter}.`;
            
        qData.latex = `\\pi \\approx 3.14`;
        
        steps = [
            { text: t(lang, TERMS.geometry.step_comp_tri_sides), latex: `${side} + ${side} = ${2*side}` },
            { text: t(lang, TERMS.geometry.step_comp_arc_verbose), latex: `\\frac{3.14 \\cdot ${diameter}}{2} = ${arc}` },
            { text: t(lang, TERMS.geometry.step_comp_total_perim), latex: `${2*side} + ${arc} = ${color}{${qData.answer}}}` }
        ];

        geometry = {
            type: 'composite',
            width: diameter,
            height: side, 
            labels: { top: diameter, side: side }
        };
    }

    return {
        questionId: `geo-l${level}-${seed}`,
        renderData: {
            text_key: qData.text_key,
            description: qData.description,
            latex: qData.latex,
            answerType: 'numeric',
            geometry: geometry,
            variables: {} // FIX: Added missing property
        },
        serverData: {
            answer: qData.answer,
            solutionSteps: steps
        }
    };
  }
}