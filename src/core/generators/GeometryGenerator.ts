import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class GeometryGenerator {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const color = "\\mathbf{\\textcolor{#D35400}}";
    const s = (val: number) => Math.round(val * multiplier);
    const piApprox = 3.14;

    const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;

    let mode = level;
    if (level >= 6) mode = rng.intBetween(3, 5);

    let steps: Clue[] = [];
    let qData: { text_key: string, description: string | { sv: string, en: string }, latex: string, answer: number } = { text_key: "", description: "", latex: "", answer: 0 };
    let geometry: any = undefined;

    // --- LEVEL 1: Perimeter (Rectangles) ---
    if (mode === 1) {
        const w = rng.intBetween(s(3), s(12));
        const h = rng.intBetween(s(2), s(8));
        qData.answer = 2 * (w + h);
        qData.text_key = "calc_perim";
        
        qData.description = {
            sv: `Beräkna omkretsen av en rektangel med sidorna ${w} cm och ${h} cm.`,
            en: `Calculate the perimeter of a rectangle with sides ${w} cm and ${h} cm.`
        };
        
        steps = [
            { text: t(lang, TERMS.geometry.formula_rect_perim_latex), latex: `2(${w} + ${h})` },
            { text: t(lang, TERMS.common.result), latex: `${formatColor(qData.answer)}` }
        ];
        geometry = { type: 'rectangle', width: w, height: h, labels: { width: w, height: h } };
    }

    // --- LEVEL 2: Area (Rectangles) ---
    else if (mode === 2) {
        const w = rng.intBetween(s(3), s(12));
        const h = rng.intBetween(s(2), s(8));
        qData.answer = w * h;
        qData.text_key = "calc_area";
        
        qData.description = {
            sv: `Beräkna arean av en rektangel med sidorna ${w} cm och ${h} cm.`,
            en: `Calculate the area of a rectangle with sides ${w} cm and ${h} cm.`
        };
        
        steps = [
            { text: t(lang, TERMS.common.calculate), latex: `A = ${w} \\cdot ${h}` },
            { text: t(lang, TERMS.common.result), latex: `${formatColor(qData.answer)}` }
        ];
        geometry = { type: 'rectangle', width: w, height: h, labels: { width: w, height: h } };
    }

    // --- LEVEL 3: Area (Triangles) ---
    else if (mode === 3) {
        const b = rng.intBetween(s(3), s(12));
        const h = rng.intBetween(s(2), s(8));
        qData.answer = (b * h) / 2;
        qData.text_key = "calc_area_tri";
        
        qData.description = {
            sv: `Beräkna arean av triangeln.`,
            en: `Calculate the area of the triangle.`
        };
        
        steps = [
            { text: t(lang, TERMS.geometry.calc_area_tri), latex: `A = \\frac{b \\cdot h}{2}` },
            { text: t(lang, TERMS.common.calculate), latex: `\\frac{${b} \\cdot ${h}}{2} = ${formatColor(qData.answer)}` }
        ];
        geometry = { type: 'triangle', width: b, height: h, labels: { base: b, height: h } };
    }

    // --- LEVEL 4: Circles (Area/Perim) ---
    else if (mode === 4) {
        const isArea = rng.intBetween(0, 1) === 1;
        const r = rng.intBetween(s(2), s(8));
        
        if (isArea) {
            qData.answer = Math.round(piApprox * r * r * 10) / 10;
            qData.description = { sv: "Beräkna cirkelns area.", en: "Calculate the area of the circle." };
            steps = [{ text: "Area", latex: `A = \\pi r^2 \\approx ${piApprox} \\cdot ${r}^2 = ${formatColor(qData.answer)}` }];
        } else {
            qData.answer = Math.round(2 * piApprox * r * 10) / 10;
            qData.description = { sv: "Beräkna cirkelns omkrets.", en: "Calculate the circumference of the circle." };
            steps = [{ text: "Circumference", latex: `O = 2\\pi r \\approx 2 \\cdot ${piApprox} \\cdot ${r} = ${formatColor(qData.answer)}` }];
        }
        geometry = { type: 'circle', radius: r, value: r, show: 'radius' };
    }

    // --- LEVEL 5: Composite Shapes ---
    else {
        const subType = rng.pick(['house', 'portal', 'ice_cream']);
        const width = rng.intBetween(s(4), s(10));
        const height = rng.intBetween(s(4), s(10));
        const isArea = rng.intBetween(0, 1) === 1;
        
        let shapeNameSv = "figuren";
        let shapeNameEn = "the shape";
        
        if (subType === 'portal') {
            if (isArea) {
                const areaRect = width * height;
                const areaSemi = (piApprox * (width/2) * (width/2)) / 2;
                qData.answer = Math.round((areaRect + areaSemi) * 10) / 10;
                steps = [
                    { text: t(lang, TERMS.geometry.comp_rect_area), latex: `${width} \\cdot ${height} = ${areaRect}` },
                    { text: t(lang, TERMS.geometry.step_comp_semi_area), latex: `\\frac{\\pi \\cdot (${width}/2)^2}{2} \\approx ${Math.round(areaSemi*10)/10}` },
                    { text: t(lang, TERMS.geometry.comp_total_area), latex: `${formatColor(qData.answer)}` }
                ];
            } else {
                const arc = (piApprox * width) / 2;
                qData.answer = Math.round((2 * height + width + arc) * 10) / 10;
                steps = [
                    { text: t(lang, TERMS.geometry.sides_3), latex: `${height} + ${height} + ${width} = ${2*height+width}` },
                    { text: t(lang, TERMS.geometry.arc), latex: `\\frac{\\pi \\cdot ${width}}{2} \\approx ${Math.round(arc*10)/10}` },
                    { text: t(lang, TERMS.geometry.step_comp_total_perim), latex: `${formatColor(qData.answer)}` }
                ];
            }
            geometry = { type: 'composite', subtype: 'portal', w: width, labels: { w: width } };
        }
        
        qData.text_key = isArea ? "calc_area" : "calc_perim";
        qData.description = {
            sv: `Beräkna ${isArea ? 'arean' : 'omkretsen'} av ${shapeNameSv}.`,
            en: `Calculate the ${isArea ? 'area' : 'perimeter'} of ${shapeNameEn}.`
        };
            
        if (!geometry) geometry = { type: 'composite', subtype: 'ice_cream', width: width, height: height, labels: { top: width, side: height } };
    }

    return {
        questionId: `geo-l${level}-${seed}`,
        renderData: {
            text_key: qData.text_key,
            description: qData.description,
            latex: qData.latex,
            answerType: "numeric",
            geometry: geometry
        },
        serverData: {
            answer: qData.answer,
            solutionSteps: steps
        }
    };
  }
}