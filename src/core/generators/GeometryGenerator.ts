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
    // Changed description type to allow bilingual object
    let qData: { text_key: string, description: string | { sv: string, en: string }, latex: string, answer: number } = { text_key: "", description: "", latex: "", answer: 0 };
    let geometry: any = undefined;

    // --- LEVEL 1: Perimeter (Rectangles) ---
    if (mode === 1) {
        const w = rng.intBetween(s(3), s(12));
        const h = rng.intBetween(s(2), s(8));
        qData.answer = 2 * (w + h);
        qData.text_key = "calc_perim";
        
        qData.description = {
            sv: `Beräkna omkretsen av en rektangel med bredden ${w} och höjden ${h}.`,
            en: `Calculate the perimeter of a rectangle with width ${w} and height ${h}.`
        };
            
        qData.latex = `O = ?`;
        
        steps = [
            { text: t(lang, TERMS.geometry.formula_rect_perim), latex: TERMS.geometry.formula_rect_perim_latex },
            { text: t(lang, TERMS.geometry.step_sub), latex: `2(${w} + ${h})` },
            { text: t(lang, TERMS.geometry.step_calc), latex: `${color}{${qData.answer}}}` }
        ];

        geometry = { type: 'rectangle', width: w, height: h, labels: { bottom: w, right: h } };
    }
    
    // --- LEVEL 2: Area (Rectangles) ---
    else if (mode === 2) {
        const w = rng.intBetween(s(3), s(12));
        const h = rng.intBetween(s(2), s(8));
        qData.answer = w * h;
        qData.text_key = "calc_area";
        
        qData.description = {
            sv: `Beräkna arean av en rektangel med sidorna ${w} och ${h}.`,
            en: `Calculate the area of a rectangle with sides ${w} and ${h}.`
        };

        qData.latex = `A = ?`;
        
        steps = [
            { text: "Area formula", latex: "A = b \\cdot h" },
            { text: t(lang, TERMS.geometry.step_calc), latex: `${w} \\cdot ${h} = ${color}{${qData.answer}}}` }
        ];

        geometry = { type: 'rectangle', width: w, height: h, labels: { bottom: w, right: h } };
    }

    // --- LEVEL 3: Triangles ---
    else if (mode === 3) {
        const b = rng.intBetween(s(4), s(14));
        const h = rng.intBetween(s(2), s(10)) * 2; 
        const isRightTriangle = rng.intBetween(0, 1) === 1;
        const orientation = rng.pick(['up', 'down', 'left', 'right']);
        
        qData.answer = (b * h) / 2;
        qData.text_key = "calc_area";
        
        const svType = isRightTriangle ? "rätvinklig triangel" : "triangel";
        const enType = isRightTriangle ? "right triangle" : "triangle";

        qData.description = {
            sv: `Beräkna arean av en ${svType} med basen ${b} och höjden ${h}.`,
            en: `Calculate the area of a ${enType} with base ${b} and height ${h}.`
        };

        qData.latex = `A = ?`;
        
        steps = [
            { text: "Area formula", latex: "A = \\frac{b \\cdot h}{2}" },
            { text: t(lang, TERMS.geometry.step_calc), latex: `\\frac{${b} \\cdot ${h}}{2} = ${color}{${qData.answer}}}` }
        ];

        geometry = { type: 'triangle', subtype: isRightTriangle ? 'right' : 'isosceles', orientation: orientation, width: b, height: h, labels: { base: b, height: h } };
    }

    // --- LEVEL 4: Circles ---
    else if (mode === 4) {
        const isArea = rng.intBetween(0, 1) === 1;
        const giveDiameter = rng.intBetween(0, 1) === 1;
        const piApprox = 3.14;
        const val = rng.intBetween(s(4), s(16)); 
        const r = giveDiameter ? val / 2 : val;
        const d = giveDiameter ? val : val * 2;

        if (isArea) {
            qData.answer = Math.round(piApprox * r * r * 100) / 100;
            qData.text_key = "calc_area";
            qData.description = {
                sv: `Beräkna arean av en cirkel med ${giveDiameter ? 'diametern' : 'radien'} ${val}.`,
                en: `Calculate the area of a circle with ${giveDiameter ? 'diameter' : 'radius'} ${val}.`
            };
            steps = [
                giveDiameter ? { text: "Find radius", latex: `r = \\frac{d}{2} = ${r}` } : { text: "Radius", latex: `r = ${r}` },
                { text: "Area Formula", latex: "A = \\pi \\cdot r^2" },
                { text: t(lang, TERMS.geometry.step_calc), latex: `${piApprox} \\cdot ${r}^2 = ${color}{${qData.answer}}}` }
            ];
        } else {
            qData.answer = Math.round(piApprox * d * 100) / 100;
            qData.text_key = "calc_perim";
            qData.description = {
                sv: `Beräkna omkretsen av en cirkel med ${giveDiameter ? 'diametern' : 'radien'} ${val}.`,
                en: `Calculate the circumference of a circle with ${giveDiameter ? 'diameter' : 'radius'} ${val}.`
            };
            steps = [
                { text: "Formula", latex: "O = \\pi \\cdot d" },
                !giveDiameter ? { text: "Find diameter", latex: `d = 2 \\cdot r = ${d}` } : { text: "Diameter", latex: `d = ${val}` },
                { text: t(lang, TERMS.geometry.step_calc), latex: `${piApprox} \\cdot ${d} = ${color}{${qData.answer}}}` }
            ];
        }
        qData.latex = `\\pi \\approx 3.14`;
        geometry = { type: 'circle', show: giveDiameter ? 'diameter' : 'radius', value: val, labels: { radius: r } };
    }

    // --- LEVEL 5: Composite ---
    else {
        const type = rng.pick(['ice_cream', 'house', 'portal']);
        const isArea = rng.intBetween(0, 1) === 1;
        const piApprox = 3.14;
        const width = rng.intBetween(s(4), s(10)) * 2; 
        const radius = width / 2;
        const height = rng.intBetween(s(4), s(12));
        let shapeNameSv = "", shapeNameEn = "";
        
        if (type === 'ice_cream') {
            shapeNameSv = "glassen (triangel + halvcirkel)"; shapeNameEn = "ice cream (triangle + semicircle)";
            const slant = Math.round(Math.sqrt(radius*radius + height*height) * 10) / 10; 
            if (isArea) {
                const areaTri = (width * height) / 2;
                const areaSemi = (piApprox * radius * radius) / 2;
                qData.answer = Math.round((areaTri + areaSemi) * 100) / 100;
                steps = [
                    { text: "Triangle Area", latex: `\\frac{${width} \\cdot ${height}}{2} = ${areaTri}` },
                    { text: "Semicircle Area", latex: `\\frac{\\pi \\cdot ${radius}^2}{2} \\approx ${Math.round(areaSemi*10)/10}` },
                    { text: "Total", latex: `${areaTri} + ${Math.round(areaSemi*10)/10} = ${color}{${qData.answer}}}` }
                ];
            } else {
                const arc = (piApprox * width) / 2;
                const slantCalc = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height, 2));
                const sDisp = Math.round(slantCalc * 10) / 10;
                qData.answer = Math.round((2 * sDisp + arc) * 100) / 100;
                steps = [
                    { text: "Arc", latex: `\\frac{\\pi \\cdot d}{2} = ${Math.round(arc*10)/10}` },
                    { text: "Sides (approx)", latex: `2 \\cdot ${sDisp} = ${2*sDisp}` },
                    { text: "Total", latex: `${color}{${qData.answer}}}` }
                ];
            }
        } else if (type === 'house') {
            shapeNameSv = "huset (rektangel + triangel)"; shapeNameEn = "house (rectangle + triangle)";
            const roofH = rng.intBetween(3, 6); const wallH = height; 
            if (isArea) {
                const areaRect = width * wallH; const areaTri = (width * roofH) / 2;
                qData.answer = areaRect + areaTri;
                steps = [
                    { text: "Rectangle", latex: `${width} \\cdot ${wallH} = ${areaRect}` },
                    { text: "Roof", latex: `\\frac{${width} \\cdot ${roofH}}{2} = ${areaTri}` },
                    { text: "Total", latex: `${areaRect} + ${areaTri} = ${color}{${qData.answer}}}` }
                ];
            } else {
                const slant = Math.sqrt(Math.pow(width/2, 2) + Math.pow(roofH, 2));
                const sDisp = Math.round(slant * 10) / 10;
                qData.answer = Math.round((2 * wallH + width + 2 * sDisp) * 10) / 10;
                steps = [
                    { text: "Walls + Floor", latex: `${wallH} + ${wallH} + ${width} = ${2*wallH + width}` },
                    { text: "Roof Sides", latex: `2 \\cdot ${sDisp} = ${2*sDisp}` },
                    { text: "Total", latex: `${color}{${qData.answer}}}` }
                ];
            }
            geometry = { type: 'composite', subtype: 'house', w: width, h: wallH, h2: roofH, labels: { w: width, h: wallH, h_roof: roofH } };
        } else { 
            shapeNameSv = "portalen (kvadrat + halvcirkel)"; shapeNameEn = "portal (square + semicircle)";
            if (isArea) {
                const areaSq = width * width; const areaSemi = (piApprox * radius * radius) / 2;
                qData.answer = Math.round((areaSq + areaSemi) * 10) / 10;
                steps = [
                    { text: "Square", latex: `${width} \\cdot ${width} = ${areaSq}` },
                    { text: "Semicircle", latex: `\\frac{\\pi \\cdot ${radius}^2}{2} \\approx ${Math.round(areaSemi*10)/10}` },
                    { text: "Total", latex: `${color}{${qData.answer}}}` }
                ];
            } else {
                const arc = (piApprox * width) / 2;
                qData.answer = Math.round((3 * width + arc) * 10) / 10;
                steps = [
                    { text: "3 Sides", latex: `3 \\cdot ${width} = ${3*width}` },
                    { text: "Arc", latex: `\\frac{\\pi \\cdot ${width}}{2} \\approx ${Math.round(arc*10)/10}` },
                    { text: "Total", latex: `${color}{${qData.answer}}}` }
                ];
            }
            geometry = { type: 'composite', subtype: 'portal', w: width, labels: { w: width } };
        }
        
        qData.text_key = isArea ? "calc_area" : "calc_perim";
        qData.description = {
            sv: `Beräkna ${isArea ? 'arean' : 'omkretsen'} av ${shapeNameSv}.`,
            en: `Calculate the ${isArea ? 'area' : 'perimeter'} of the ${shapeNameEn}.`
        };
            
        if (!geometry) geometry = { type: 'composite', subtype: 'ice_cream', width: width, height: height, labels: { top: width, side: height } };
    }

    return {
        questionId: `geo-l${level}-${seed}`,
        renderData: {
            text_key: qData.text_key,
            description: qData.description,
            latex: qData.latex,
            answerType: 'numeric',
            geometry: geometry,
            variables: {} 
        },
        serverData: {
            answer: qData.answer,
            solutionSteps: steps
        }
    };
  }
}