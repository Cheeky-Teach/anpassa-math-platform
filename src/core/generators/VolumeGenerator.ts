import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class VolumeGenerator {
    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        
        // FIX: Use textcolor which takes 2 arguments: {color}{text}. 
        // This variable provides the command and the first argument (color).
        // Usage: `${color}{text}` -> \mathbf{\textcolor{#D35400}{text}}
        const color = "\\mathbf{\\textcolor{#D35400}}";
        
        const s = (val: number) => Math.round(val * multiplier);
        const piApprox = 3.14;

        let mode = level;
        if (level === 6) mode = rng.intBetween(1, 5); // Mixed Level

        let steps: Clue[] = [];
        let qData = { text_key: "", description: "" as string | {sv:string, en:string}, latex: "", answer: 0 };
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
                qData.description = {
                    sv: `Beräkna volymen av en ${shapeName} med sidan ${side} cm.`,
                    en: `Calculate the volume of a ${shapeName} with side ${side} cm.`
                };
                qData.latex = `V = s^3`;
                steps = [
                    { text: t(lang, TERMS.volume.formula_cube), latex: "V = s^3" },
                    { text: "Substitution", latex: `V = ${side}^3` },
                    { text: t(lang, TERMS.common.result), latex: `V = ${color}{${qData.answer}}` }
                ];
                geometry = { type: 'cube', labels: { s: side } };
            } else {
                const w = rng.intBetween(s(2), s(8));
                const h = rng.intBetween(s(2), s(8));
                const l = rng.intBetween(s(2), s(10));
                qData.answer = w * h * l;
                shapeName = t(lang, TERMS.shapes.rect_prism);

                if (useBaseArea) {
                    const baseArea = w * l;
                    qData.description = {
                        sv: `Ett rätblock har basarean ${baseArea} cm² och höjden ${h} cm.`,
                        en: `A rectangular prism has a base area of ${baseArea} cm² and height ${h} cm.`
                    };
                    steps = [
                        { text: t(lang, TERMS.volume.formula_prism_base), latex: "V = B \\cdot h" },
                        { text: "Substitution", latex: `V = ${baseArea} \\cdot ${h}` },
                        { text: t(lang, TERMS.common.result), latex: `V = ${color}{${qData.answer}}` }
                    ];
                    geometry = { type: 'rectangular_prism', labels: { h: h, s: `B=${baseArea}` } }; // Special label for Base
                } else {
                    qData.description = {
                        sv: `Beräkna volymen (l=${l}, b=${w}, h=${h}).`,
                        en: `Calculate volume (l=${l}, w=${w}, h=${h}).`
                    };
                    steps = [
                        { text: t(lang, TERMS.volume.formula_rect_prism), latex: "V = l \\cdot b \\cdot h" },
                        { text: "Substitution", latex: `V = ${l} \\cdot ${w} \\cdot ${h}` },
                        { text: t(lang, TERMS.common.result), latex: `V = ${color}{${qData.answer}}` }
                    ];
                    geometry = { type: 'rectangular_prism', labels: { w: w, h: h, l: l } };
                }
            }
        }

        // --- LEVEL 2: Triangular Prism ---
        else if (mode === 2) {
            const b = rng.intBetween(s(3), s(8));
            const h_tri = rng.intBetween(s(2), s(6));
            const len = rng.intBetween(s(5), s(12));
            const baseArea = (b * h_tri) / 2;
            
            // Tolerance fix: Round intermediate step to avoid compounding float errors? 
            // Better to keep precision but display rounded.
            qData.answer = baseArea * len;
            
            shapeName = t(lang, TERMS.shapes.tri_prism);
            qData.description = {
                sv: `Ett triangulärt prisma har en bas med b=${b} cm, h=${h_tri} cm och längden ${len} cm.`,
                en: `A triangular prism has a base with b=${b} cm, h=${h_tri} cm and length ${len} cm.`
            };

            steps = [
                { text: t(lang, TERMS.geometry.calc_area_tri), latex: `B = \\frac{${b} \\cdot ${h_tri}}{2} = ${baseArea}` },
                { text: t(lang, TERMS.volume.formula_prism_base), latex: "V = B \\cdot l" },
                { text: "Substitution", latex: `V = ${baseArea} \\cdot ${len}` },
                { text: t(lang, TERMS.common.result), latex: `V = ${color}{${qData.answer}}` }
            ];

            // Reuse 'triangle' visual but maybe we need a prism visual later. 
            // For now, showing the Base Triangle is often enough with text context.
            // Or use the 'rectangular_prism' generic shape with special labels?
            // Let's use the new 3D logic if we had a tri-prism renderer, but index.html only has cube/cyl/sphere.
            // Fallback: Show the Triangle Base and ask for Prism volume.
            geometry = { type: 'triangle', width: b, height: h_tri, labels: { base: b, height: h_tri }, note: `Length = ${len}` }; 
        }

        // --- LEVEL 3: Cylinder ---
        else if (mode === 3) {
            const r = rng.intBetween(s(2), s(6));
            const h = rng.intBetween(s(5), s(15));
            const baseArea = Math.round(piApprox * r * r * 10) / 10;
            
            qData.answer = Math.round(baseArea * h * 10) / 10; // Round to 1 decimal
            shapeName = t(lang, TERMS.shapes.cylinder);

            qData.description = {
                sv: `En cylinder har radien ${r} cm och höjden ${h} cm. Beräkna volymen.`,
                en: `A cylinder has radius ${r} cm and height ${h} cm. Calculate the volume.`
            };

            steps = [
                { text: t(lang, TERMS.volume.formula_cylinder), latex: "V = \\pi \\cdot r^2 \\cdot h" },
                { text: "Base Area", latex: `B \\approx ${piApprox} \\cdot ${r}^2 \\approx ${baseArea}` },
                { text: "Calc", latex: `V = ${baseArea} \\cdot ${h}` },
                { text: t(lang, TERMS.common.result), latex: `V \\approx ${color}{${qData.answer}}` }
            ];
            
            geometry = { type: 'cylinder', labels: { r: r, h: h } };
        }

        // --- LEVEL 4: Pyramid & Cone ---
        else if (mode === 4) {
            const isCone = rng.intBetween(0, 1) === 1;
            const h = rng.intBetween(s(6), s(12));

            if (isCone) {
                const r = rng.intBetween(s(2), s(5));
                const baseArea = piApprox * r * r;
                qData.answer = Math.round((baseArea * h / 3) * 10) / 10;
                shapeName = t(lang, TERMS.shapes.cone);

                qData.description = {
                    sv: `En kon har radien ${r} cm och höjden ${h} cm.`,
                    en: `A cone has radius ${r} cm and height ${h} cm.`
                };

                steps = [
                    { text: t(lang, TERMS.volume.formula_cone), latex: "V = \\frac{\\pi \\cdot r^2 \\cdot h}{3}" },
                    { text: "Substitution", latex: `V \\approx \\frac{${piApprox} \\cdot ${r}^2 \\cdot ${h}}{3}` },
                    { text: t(lang, TERMS.common.result), latex: `V \\approx ${color}{${qData.answer}}` }
                ];
                geometry = { type: 'cone', labels: { r: r, h: h } };
            } else {
                // Square Pyramid
                const side = rng.intBetween(s(4), s(8));
                const baseArea = side * side;
                qData.answer = Math.round((baseArea * h / 3) * 10) / 10;
                shapeName = t(lang, TERMS.shapes.pyramid);

                qData.description = {
                    sv: `En pyramid har en kvadratisk bas med sidan ${side} cm och höjden ${h} cm.`,
                    en: `A pyramid has a square base with side ${side} cm and height ${h} cm.`
                };
                
                steps = [
                    { text: t(lang, TERMS.volume.formula_pyramid), latex: "V = \\frac{B \\cdot h}{3}" },
                    { text: "Base Area", latex: `B = ${side} \\cdot ${side} = ${baseArea}` },
                    { text: t(lang, TERMS.common.result), latex: `V = \\frac{${baseArea} \\cdot ${h}}{3} = ${color}{${qData.answer}}` }
                ];
                // Use pyramid visual if available, otherwise fallback or generic 3d
                geometry = { type: 'rectangular_prism', labels: { s: side, h: h }, subtype: 'pyramid' }; // Note: Renderer needs to handle subtype or we add pyramid renderer
            }
        }

        // --- LEVEL 5: Sphere (Klot) ---
        else if (mode === 5) {
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
                text_key: "calc_volume",
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