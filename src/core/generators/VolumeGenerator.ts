import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class VolumeGenerator {
    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        const color = "\\mathbf{\\color{#D35400}";
        const s = (val: number) => Math.round(val * multiplier);
        const piApprox = 3.14;

        let mode = level;
        if (level === 6) mode = rng.intBetween(1, 5); // Mixed Level

        let steps: Clue[] = [];
        let qData = { text_key: "", description: "", latex: "", answer: 0 };
        let geometry: any = undefined;
        let shapeName = "";

        // --- LEVEL 1: Rätblock (Rectangular Prism) & Kub (Cube) ---
        if (mode === 1) {
            const isCube = rng.intBetween(0, 1) === 1;
            const useBaseArea = rng.intBetween(0, 1) === 1 && !isCube;

            if (isCube) {
                const side = rng.intBetween(s(2), s(10));
                qData.answer = Math.pow(side, 3);
                shapeName = t(lang, TERMS.shapes.cube);
                qData.description = lang === 'sv' 
                    ? `En ${shapeName} har sidan ${side} cm. Beräkna volymen.` 
                    : `A ${shapeName} has side length ${side} cm. Calculate the volume.`;
                
                steps = [
                    { text: t(lang, TERMS.volume.formula_cube), latex: "V = s^3" },
                    { text: t(lang, TERMS.common.calculate), latex: `${side}^3 = ${side} \\cdot ${side} \\cdot ${side} = ${color}{${qData.answer}}` }
                ];
                geometry = { type: 'cube', side: side, labels: { side: side } };

            } else {
                // Rectangular Prism
                const l = rng.intBetween(s(2), s(10));
                const w = rng.intBetween(s(2), s(8));
                const h = rng.intBetween(s(2), s(10));
                shapeName = t(lang, TERMS.shapes.rectangular_prism);

                if (useBaseArea) {
                    const baseArea = l * w;
                    qData.answer = baseArea * h;
                    qData.description = lang === 'sv'
                        ? `Ett ${shapeName} har basytan ${baseArea} cm² och höjden ${h} cm. Beräkna volymen.`
                        : `A ${shapeName} has a base area of ${baseArea} cm² and height ${h} cm. Calculate the volume.`;
                    
                    steps = [
                        { text: t(lang, TERMS.volume.formula_prism_base), latex: "V = B \\cdot h" },
                        { text: t(lang, TERMS.common.calculate), latex: `${baseArea} \\cdot ${h} = ${color}{${qData.answer}}` }
                    ];
                    geometry = { type: 'rectangular_prism', l, w, h, labels: { baseArea: baseArea, h } };

                } else {
                    qData.answer = l * w * h;
                    qData.description = lang === 'sv'
                        ? `Ett ${shapeName} har längden ${l} cm, bredden ${w} cm och höjden ${h} cm. Beräkna volymen.`
                        : `A ${shapeName} has length ${l} cm, width ${w} cm, and height ${h} cm. Calculate the volume.`;

                    steps = [
                        { text: t(lang, TERMS.volume.formula_rect_prism), latex: "V = l \\cdot b \\cdot h" },
                        { text: t(lang, TERMS.common.calculate), latex: `${l} \\cdot ${w} \\cdot ${h} = ${color}{${qData.answer}}` }
                    ];
                    geometry = { type: 'rectangular_prism', l, w, h, labels: { l, w, h } };
                }
            }
        }

        // --- LEVEL 2: Prisma (Triangular Prism) ---
        else if (mode === 2) {
            const b = rng.intBetween(s(3), s(10)); // Triangle base
            const th = rng.intBetween(s(2), s(8)); // Triangle height
            const len = rng.intBetween(s(5), s(15)); // Prism length/height
            
            const baseArea = (b * th) / 2;
            qData.answer = baseArea * len;
            shapeName = t(lang, TERMS.shapes.triangular_prism);

            const useBaseArea = rng.intBetween(0, 1) === 1;

            if (useBaseArea) {
                qData.answer = baseArea * len;
                qData.description = lang === 'sv'
                    ? `Ett ${shapeName} har basytan ${baseArea} cm² och höjden ${len} cm. Beräkna volymen.`
                    : `A ${shapeName} has base area ${baseArea} cm² and height ${len} cm. Calculate the volume.`;

                steps = [
                    { text: t(lang, TERMS.volume.formula_prism_base), latex: "V = B \\cdot h" },
                    { text: t(lang, TERMS.common.calculate), latex: `${baseArea} \\cdot ${len} = ${color}{${qData.answer}}` }
                ];
                geometry = { type: 'triangular_prism', b, th, len, labels: { baseArea: baseArea, h: len } };
            } else {
                qData.description = lang === 'sv'
                    ? `Beräkna volymen av prismat. Bastriangeln har basen ${b} cm och höjden ${th} cm. Prismats längd är ${len} cm.`
                    : `Calculate the volume. The base triangle has base ${b} cm and height ${th} cm. The prism length is ${len} cm.`;

                steps = [
                    { text: t(lang, TERMS.volume.step_calc_base), latex: `B = \\frac{${b} \\cdot ${th}}{2} = ${baseArea}` },
                    { text: t(lang, TERMS.volume.formula_prism_base), latex: "V = B \\cdot h" },
                    { text: t(lang, TERMS.common.calculate), latex: `${baseArea} \\cdot ${len} = ${color}{${qData.answer}}` }
                ];
                geometry = { type: 'triangular_prism', b, th, len, labels: { b, th, len } };
            }
        }

        // --- LEVEL 3: Cylinder ---
        else if (mode === 3) {
            const r = rng.intBetween(s(2), s(8));
            const h = rng.intBetween(s(5), s(15));
            const baseArea = Math.round(piApprox * r * r * 100) / 100;
            qData.answer = Math.round(baseArea * h * 100) / 100;
            shapeName = t(lang, TERMS.shapes.cylinder);

            const giveDiameter = rng.intBetween(0, 1) === 1;
            const d = r * 2;

            qData.description = lang === 'sv'
                ? `En ${shapeName} har ${giveDiameter ? 'diametern' : 'radien'} ${giveDiameter ? d : r} cm och höjden ${h} cm. Beräkna volymen.`
                : `A ${shapeName} has ${giveDiameter ? 'diameter' : 'radius'} ${giveDiameter ? d : r} cm and height ${h} cm. Calculate the volume.`;
            
            steps = [];
            if (giveDiameter) steps.push({ text: "Find radius", latex: `r = \\frac{d}{2} = ${r}` });
            
            steps.push({ text: t(lang, TERMS.volume.step_calc_base), latex: `B = \\pi r^2 \\approx ${piApprox} \\cdot ${r}^2 = ${baseArea}` });
            steps.push({ text: t(lang, TERMS.volume.formula_cylinder), latex: "V = B \\cdot h" });
            steps.push({ text: "Result", latex: `${baseArea} \\cdot ${h} = ${color}{${qData.answer}}` });

            geometry = { type: 'cylinder', r, h, show: giveDiameter ? 'd' : 'r', labels: { r: giveDiameter ? d : r, h } };
        }

        // --- LEVEL 4: Cone & Pyramid ---
        else if (mode === 4) {
            const isCone = rng.intBetween(0, 1) === 1;
            
            if (isCone) {
                const r = rng.intBetween(s(3), s(9));
                const h = rng.intBetween(s(5), s(15));
                const baseArea = Math.round(piApprox * r * r * 100) / 100;
                qData.answer = Math.round((baseArea * h / 3) * 100) / 100;
                shapeName = t(lang, TERMS.shapes.cone);

                qData.description = lang === 'sv'
                    ? `En ${shapeName} har radien ${r} cm och höjden ${h} cm. Beräkna volymen.`
                    : `A ${shapeName} has radius ${r} cm and height ${h} cm. Calculate the volume.`;
                
                steps = [
                    { text: t(lang, TERMS.volume.formula_cone), latex: "V = \\frac{\\pi r^2 \\cdot h}{3}" },
                    { text: "Base Area", latex: `\\pi \\cdot ${r}^2 \\approx ${baseArea}` },
                    { text: "Total", latex: `\\frac{${baseArea} \\cdot ${h}}{3} = ${color}{${qData.answer}}` }
                ];
                geometry = { type: 'cone', r, h, labels: { r, h } };

            } else { // Pyramid (Square Base)
                const side = rng.intBetween(s(3), s(10));
                const h = rng.intBetween(s(5), s(15));
                const baseArea = side * side;
                qData.answer = Math.round((baseArea * h / 3) * 100) / 100;
                shapeName = t(lang, TERMS.shapes.pyramid);

                qData.description = lang === 'sv'
                    ? `En ${shapeName} med kvadratisk bas (sida ${side} cm) har höjden ${h} cm. Beräkna volymen.`
                    : `A ${shapeName} with a square base (side ${side} cm) has height ${h} cm. Calculate the volume.`;

                steps = [
                    { text: t(lang, TERMS.volume.formula_pyramid), latex: "V = \\frac{B \\cdot h}{3}" },
                    { text: "Base Area", latex: `B = ${side} \\cdot ${side} = ${baseArea}` },
                    { text: "Total", latex: `\\frac{${baseArea} \\cdot ${h}}{3} = ${color}{${qData.answer}}` }
                ];
                geometry = { type: 'pyramid', w: side, h, labels: { w: side, h } };
            }
        }

        // --- LEVEL 5: Sphere (Klot) ---
        else {
            const giveDiameter = rng.intBetween(0, 1) === 1;
            const r = rng.intBetween(2, 9); 
            const d = r * 2;
            qData.answer = Math.round((4 * piApprox * Math.pow(r, 3) / 3) * 100) / 100;
            shapeName = t(lang, TERMS.shapes.sphere);

            qData.description = lang === 'sv'
                ? `Ett ${shapeName} har ${giveDiameter ? 'diametern' : 'radien'} ${giveDiameter ? d : r} cm. Beräkna volymen.`
                : `A ${shapeName} has ${giveDiameter ? 'diameter' : 'radius'} ${giveDiameter ? d : r} cm. Calculate the volume.`;

            steps = [
                giveDiameter ? { text: "Find radius", latex: `r = \\frac{d}{2} = ${r}` } : { text: "Radius", latex: `r = ${r}` },
                { text: t(lang, TERMS.volume.formula_sphere), latex: "V = \\frac{4 \\cdot \\pi \\cdot r^3}{3}" },
                { text: "Calc", latex: `\\frac{4 \\cdot ${piApprox} \\cdot ${r}^3}{3} = ${color}{${qData.answer}}` }
            ];

            geometry = { type: 'sphere', r, show: giveDiameter ? 'd' : 'r', labels: { r: giveDiameter ? d : r } };
        }

        return {
            questionId: `vol-l${level}-${seed}`,
            renderData: {
                text_key: "calc_vol",
                description: qData.description,
                latex: "",
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