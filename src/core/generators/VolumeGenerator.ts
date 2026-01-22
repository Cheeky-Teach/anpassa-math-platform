import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class VolumeGenerator {
    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        const color = "\\mathbf{\\textcolor{#D35400}}";
        const s = (val: number) => Math.round(val * multiplier);
        const piApprox = 3.14;

        let mode = level;
        if (level === 6) mode = rng.intBetween(1, 5); 

        let steps: Clue[] = [];
        let qData = { 
            text_key: "", 
            description: "" as string | {sv:string, en:string}, 
            latex: "", 
            answer: 0 
        };
        let geometry: any = undefined;

        // --- LEVEL 1: Rätblock (Rectangular Prism) & Kub (Cube) ---
        if (mode === 1) {
            const isCube = rng.intBetween(0, 1) === 1;
            const w = rng.intBetween(s(2), s(10));
            const d = isCube ? w : rng.intBetween(s(2), s(10)); // Depth (Width in user terms)
            const h = isCube ? w : rng.intBetween(s(2), s(10)); // Height

            qData.answer = w * d * h;
            qData.text_key = "calc_vol_prism";
            const shapeNameSv = isCube ? "kuben" : "rätblocket";
            const shapeNameEn = isCube ? "the cube" : "the rectangular prism";

            qData.description = {
                sv: `Beräkna volymen av ${shapeNameSv}.`,
                en: `Calculate the volume of ${shapeNameEn}.`
            };

            steps = [
                { text: t(lang, TERMS.volume.formula_prism), latex: "V = B \\cdot h = l \\cdot b \\cdot h" },
                { text: "Calc", latex: `${w} \\cdot ${d} \\cdot ${h} = ${color}{${qData.answer}}` }
            ];

            // w = Length (bottom), d = Depth (diagonal/width), h = Height (vertical)
            geometry = { type: 'cuboid', w, h, d, labels: { w, h, d } };
        }

        // --- LEVEL 2: Prismor (Triangular Prism) ---
        else if (mode === 2) {
            // Base is a triangle. Volume = Area_base * Length
            const bBase = rng.intBetween(s(3), s(10)); // Base of the triangle
            const hTri = rng.intBetween(s(3), s(8));   // Height of the triangle
            const len = rng.intBetween(s(5), s(15));   // Length of the prism
            
            const areaBase = (bBase * hTri) / 2;
            qData.answer = areaBase * len;
            
            qData.text_key = "calc_vol_tri_prism";
            qData.description = {
                sv: "Beräkna volymen av prismat.",
                en: "Calculate the volume of the prism."
            };

            steps = [
                { text: "Base Area (Triangle)", latex: `B = \\frac{b \\cdot h}{2} = \\frac{${bBase} \\cdot ${hTri}}{2} = ${areaBase}` },
                { text: "Volume", latex: `V = B \\cdot l = ${areaBase} \\cdot ${len} = ${color}{${qData.answer}}` }
            ];

            geometry = { 
                type: 'triangular_prism', 
                b: bBase, 
                h_tri: hTri, 
                len: len, 
                labels: { b: bBase, h: hTri, l: len } 
            };
        }

        // --- LEVEL 3: Pyramid & Kon (Cone) ---
        else if (mode === 3) {
            const isCone = rng.intBetween(0, 1) === 1;

            if (isCone) {
                const r = rng.intBetween(s(2), s(6));
                const h = rng.intBetween(s(5), s(15));
                const baseArea = piApprox * r * r;
                qData.answer = Math.round((baseArea * h / 3) * 10) / 10;
                
                qData.description = {
                    sv: `En kon har radien ${r} cm och höjden ${h} cm. Beräkna volymen.`,
                    en: `A cone has radius ${r} cm and height ${h} cm. Calculate the volume.`
                };
                
                steps = [
                    { text: "Base Area", latex: `B = \\pi r^2 \\approx ${piApprox} \\cdot ${r}^2 = ${Math.round(baseArea*100)/100}` },
                    { text: "Volume", latex: `V = \\frac{B \\cdot h}{3} \\approx ${color}{${qData.answer}}` }
                ];
                geometry = { type: 'cone', r, h, labels: { r, h } };
            } else {
                // Square-based Pyramid
                const side = rng.intBetween(s(3), s(10));
                const h = rng.intBetween(s(5), s(15));
                const baseArea = side * side;
                qData.answer = Math.round((baseArea * h / 3) * 10) / 10;

                qData.description = {
                    sv: "Beräkna volymen av pyramiden med kvadratisk bas.",
                    en: "Calculate the volume of the square-based pyramid."
                };

                steps = [
                    { text: "Base Area", latex: `B = s \\cdot s = ${side} \\cdot ${side} = ${baseArea}` },
                    { text: "Volume", latex: `V = \\frac{B \\cdot h}{3} = \\frac{${baseArea} \\cdot ${h}}{3} \\approx ${color}{${qData.answer}}` }
                ];
                geometry = { type: 'pyramid', s: side, h, labels: { s: side, h } };
            }
        }

        // --- LEVEL 4: Cylinder ---
        else if (mode === 4) {
             const r = rng.intBetween(s(2), s(6));
             const h = rng.intBetween(s(5), s(15));
             const baseArea = piApprox * r * r;
             qData.answer = Math.round(baseArea * h * 10) / 10;

             qData.description = {
                 sv: `En cylinder har radien ${r} cm och höjden ${h} cm.`,
                 en: `A cylinder has radius ${r} cm and height ${h} cm.`
             };
             
             steps = [
                 { text: "Base Area", latex: `B = \\pi r^2 \\approx ${piApprox} \\cdot ${r}^2 = ${Math.round(baseArea*100)/100}` },
                 { text: "Volume", latex: `V = B \\cdot h = ${Math.round(baseArea*100)/100} \\cdot ${h} = ${color}{${qData.answer}}` }
             ];
             geometry = { type: 'cylinder', r, h, labels: { r, h } };
        }

        // --- LEVEL 5: Sphere (Klot), Hemisphere, Ice Cream ---
        else {
            const subType = rng.pick(['sphere', 'hemisphere', 'ice_cream']);
            // const subType = 'ice_cream'; // Debug force
            
            // Common radius logic
            const r = rng.intBetween(s(2), s(8));
            const d = r * 2;
            const giveDiameter = rng.intBetween(0, 1) === 1; // Variation: Give Diameter?
            
            // Sphere
            if (subType === 'sphere') {
                qData.answer = Math.round((4 * piApprox * Math.pow(r, 3) / 3) * 100) / 100;
                const label = giveDiameter ? { sv: 'diametern', en: 'diameter', val: d } : { sv: 'radien', en: 'radius', val: r };
                
                qData.description = {
                    sv: `Ett klot har ${label.sv} ${label.val} cm. Beräkna volymen.`,
                    en: `A sphere has ${label.en} ${label.val} cm. Calculate the volume.`
                };
                
                steps = [
                    ...(giveDiameter ? [{ text: "Find Radius", latex: `r = \\frac{d}{2} = ${r}` }] : []),
                    { text: "Volume", latex: `V = \\frac{4 \\cdot \\pi \\cdot r^3}{3} \\approx ${color}{${qData.answer}}` }
                ];
                geometry = { type: 'sphere', r, show: giveDiameter ? 'd' : 'r', labels: { val: giveDiameter ? d : r } };
            } 
            // Hemisphere (Halvklot)
            else if (subType === 'hemisphere') {
                const volSphere = (4 * piApprox * Math.pow(r, 3)) / 3;
                qData.answer = Math.round((volSphere / 2) * 100) / 100;
                const label = giveDiameter ? { sv: 'diametern', en: 'diameter', val: d } : { sv: 'radien', en: 'radius', val: r };

                qData.description = {
                    sv: `Ett halvklot har ${label.sv} ${label.val} cm. Beräkna volymen.`,
                    en: `A hemisphere has ${label.en} ${label.val} cm. Calculate the volume.`
                };

                steps = [
                     ...(giveDiameter ? [{ text: "Find Radius", latex: `r = \\frac{d}{2} = ${r}` }] : []),
                     { text: "Sphere Vol", latex: `V_{sphere} = \\frac{4\\pi r^3}{3} \\approx ${Math.round(volSphere*10)/10}` },
                     { text: "Half", latex: `V = \\frac{V_{sphere}}{2} \\approx ${color}{${qData.answer}}` }
                ];
                geometry = { type: 'hemisphere', r, show: giveDiameter ? 'd' : 'r', labels: { val: giveDiameter ? d : r } };
            }
            // Ice Cream (Cone + Hemisphere)
            else {
                const hCone = rng.intBetween(s(5), s(12));
                
                const volCone = (piApprox * r * r * hCone) / 3;
                const volHemi = (2 * piApprox * Math.pow(r, 3)) / 3;
                
                qData.answer = Math.round((volCone + volHemi) * 100) / 100;

                qData.description = {
                    sv: `Beräkna glassens volym (kon + halvklot). Konens höjd är ${hCone} cm och ${giveDiameter ? 'diametern' : 'radien'} är ${giveDiameter ? d : r} cm.`,
                    en: `Calculate the ice cream volume (cone + hemisphere). The cone height is ${hCone} cm and the ${giveDiameter ? 'diameter' : 'radius'} is ${giveDiameter ? d : r} cm.`
                };

                steps = [
                     ...(giveDiameter ? [{ text: "Find Radius", latex: `r = \\frac{d}{2} = ${r}` }] : []),
                     { text: "Cone Vol", latex: `V_{cone} = \\frac{\\pi r^2 h}{3} \\approx ${Math.round(volCone*10)/10}` },
                     { text: "Hemi Vol", latex: `V_{hemi} = \\frac{2\\pi r^3}{3} \\approx ${Math.round(volHemi*10)/10}` },
                     { text: "Total", latex: `V_{total} = ${Math.round(volCone*10)/10} + ${Math.round(volHemi*10)/10} = ${color}{${qData.answer}}` }
                ];
                
                geometry = { 
                    type: 'ice_cream', 
                    r, 
                    h: hCone, 
                    show: giveDiameter ? 'd' : 'r', 
                    labels: { val: giveDiameter ? d : r, h: hCone } 
                };
            }
        }

        return {
            questionId: `vol-l${level}-${seed}`,
            renderData: {
                text_key: qData.text_key || "vol_gen",
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