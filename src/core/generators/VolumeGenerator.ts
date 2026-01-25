import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class VolumeGenerator {
    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;
        const piApprox = 3.14;

        // Helper to constrain values preventing extreme aspect ratios
        const getConstrainedValues = (count: number, min: number, max: number): number[] => {
            const vals: number[] = [];
            for(let i = 0; i < count; i++) vals.push(rng.intBetween(min, max));
            return vals;
        };

        let mode = level;
        const isUnitConversion = level === 7;
        if (level >= 6) mode = rng.intBetween(1, 5); 

        const UNITS = [
            { id: 'mm', factor: 0.001 },
            { id: 'cm', factor: 0.01 },
            { id: 'dm', factor: 0.1 },
            { id: 'm', factor: 1.0 }
        ];

        let qData: any = { answer: 0, description: "", latex: "" };
        let geometry: any = {};
        let steps: Clue[] = [];
        
        const unitIn = isUnitConversion ? rng.pick(UNITS) : { id: 'cm', factor: 0.01 };
        const unitOut = isUnitConversion ? rng.pick(UNITS.filter(u => u.id !== unitIn.id)) : unitIn;
        const unitSuffix = isUnitConversion ? ` ${unitIn.id}` : "";
        const uVol = (u: string) => `${u}^3`;

        // --- LEVEL 1: Rectangular Prism (Block) & Cube ---
        if (mode === 1) {
            const isCube = rng.intBetween(0, 3) === 0;
            const w = rng.intBetween(2, 10);
            const h = isCube ? w : rng.intBetween(2, 8);
            const d = isCube ? w : rng.intBetween(2, 8);
            
            qData.answer = w * h * d;
            
            steps = [
                { 
                    text: t(lang, { sv: "Volym = Basytan · Höjden", en: "Volume = Base Area · Height" }), 
                    latex: "V = B \\cdot h" 
                },
                { 
                    text: t(lang, { sv: "Basytan är en rektangel (bredd · djup).", en: "The base is a rectangle (width · depth)." }), 
                    latex: `B = ${w} \\cdot ${d} = ${w*d}` 
                },
                { 
                    text: t(lang, { sv: "Multiplicera med höjden.", en: "Multiply by the height." }), 
                    latex: `V = ${w*d} \\cdot ${h} = ${formatColor(qData.answer)}` 
                }
            ];
            
            qData.description = { sv: "Beräkna volymen.", en: "Calculate the volume." };
            geometry = { type: 'cuboid', labels: { w: `${w}${unitSuffix}`, h: `${h}${unitSuffix}`, d: `${d}${unitSuffix}` } };
        }

        // --- LEVEL 2: Triangular Prism ---
        else if (mode === 2) {
            // Constrain dimensions to avoid super long/thin shapes that break rendering
            const b = rng.intBetween(3, 8);
            const h_tri = rng.intBetween(3, 8);
            const len = rng.intBetween(5, 15); // Length
            
            const areaBase = (b * h_tri) / 2;
            qData.answer = areaBase * len;

            steps = [
                { 
                    text: t(lang, { sv: "Volym = Basytan · Längden", en: "Volume = Base Area · Length" }), 
                    latex: "V = B \\cdot l" 
                },
                { 
                    text: t(lang, { sv: "Basytan är en triangel. Beräkna arean.", en: "The base is a triangle. Calculate the area." }), 
                    latex: `B = \\frac{${b} \\cdot ${h_tri}}{2} = ${areaBase}` 
                },
                { 
                    text: t(lang, { sv: "Multiplicera basytan med längden (djupet).", en: "Multiply the base area by the length (depth)." }), 
                    latex: `V = ${areaBase} \\cdot ${len} = ${formatColor(qData.answer)}` 
                }
            ];

            qData.description = { sv: "Beräkna prismats volym.", en: "Calculate the volume of the prism." };
            geometry = { type: 'triangular_prism', b, h_tri, len, labels: { b: `${b}${unitSuffix}`, h: `${h_tri}${unitSuffix}`, l: `${len}${unitSuffix}` } };
        }

        // --- LEVEL 3: Cylinder ---
        else if (mode === 3) {
            const r = rng.intBetween(2, 6);
            const h = rng.intBetween(3, 12);
            const areaBase = Math.PI * r * r;
            const vol = areaBase * h;
            qData.answer = Math.round(vol * 10) / 10;

            steps = [
                { 
                    text: t(lang, { sv: "Volym = Basytan (Cirkel) · Höjden", en: "Volume = Base Area (Circle) · Height" }), 
                    latex: "V = \\pi \\cdot r^2 \\cdot h" 
                },
                { 
                    text: t(lang, { sv: "Beräkna cirkelns area (pi ≈ 3.14).", en: "Calculate the circle area (pi ≈ 3.14)." }), 
                    latex: `B \\approx 3.14 \\cdot ${r}^2 = ${Math.round(3.14*r*r*10)/10}` 
                },
                { 
                    text: t(lang, { sv: "Multiplicera med höjden.", en: "Multiply by the height." }), 
                    latex: `V \\approx ${Math.round(3.14*r*r*10)/10} \\cdot ${h} \\approx ${formatColor(qData.answer)}` 
                }
            ];

            qData.description = { sv: "Beräkna volymen (avrunda till 1 decimal).", en: "Calculate the volume (round to 1 decimal)." };
            geometry = { type: 'cylinder', labels: { r: `${r}${unitSuffix}`, h: `${h}${unitSuffix}` } };
        }

        // --- LEVEL 4: Pyramid & Cone ---
        else if (mode === 4) {
            const isCone = rng.intBetween(0, 1) === 1;
            const h = rng.intBetween(3, 12);
            let areaBase = 0;
            let geoData: any = {};

            if (isCone) {
                const r = rng.intBetween(2, 6);
                areaBase = Math.PI * r * r;
                geoData = { type: 'cone', labels: { r: `${r}${unitSuffix}`, h: `${h}${unitSuffix}` } };
                steps.push({ 
                    text: t(lang, { sv: "Basytan är en cirkel.", en: "The base is a circle." }), 
                    latex: `B = \\pi \\cdot ${r}^2 \\approx ${Math.round(areaBase*10)/10}` 
                });
            } else {
                const s = rng.intBetween(3, 8); // Square side
                areaBase = s * s;
                geoData = { type: 'pyramid', labels: { s: `${s}${unitSuffix}`, h: `${h}${unitSuffix}` } };
                steps.push({ 
                    text: t(lang, { sv: "Basytan är en kvadrat.", en: "The base is a square." }), 
                    latex: `B = ${s} \\cdot ${s} = ${areaBase}` 
                });
            }

            const vol = (areaBase * h) / 3;
            qData.answer = Math.round(vol * 10) / 10;

            // Prepend the formula step
            steps.unshift({ 
                text: t(lang, { sv: "För spetsiga kroppar (pyramid/kon), dela basytan · höjden med 3.", en: "For pointed shapes (pyramid/cone), divide Base · Height by 3." }), 
                latex: "V = \\frac{B \\cdot h}{3}" 
            });
            steps.push({ 
                text: t(lang, { sv: "Slutligen, dela med 3.", en: "Finally, divide by 3." }), 
                latex: `V = \\frac{${Math.round(areaBase*10)/10} \\cdot ${h}}{3} \\approx ${formatColor(qData.answer)}` 
            });

            qData.description = { sv: "Beräkna volymen (avrunda till 1 decimal).", en: "Calculate the volume (round to 1 decimal)." };
            geometry = geoData;
        }

        // --- LEVEL 5: Sphere (Klot) ---
        else if (mode === 5) {
            const r = rng.intBetween(2, 9);
            const vol = (4 * Math.PI * Math.pow(r, 3)) / 3;
            qData.answer = Math.round(vol * 10) / 10;
            
            steps = [
                { 
                    text: t(lang, { sv: "Använd formeln för klotets volym.", en: "Use the formula for sphere volume." }), 
                    latex: "V = \\frac{4 \\cdot \\pi \\cdot r^3}{3}" 
                },
                { 
                    text: t(lang, { sv: "Radien upphöjt till 3 betyder r · r · r.", en: "Radius cubed means r · r · r." }), 
                    latex: `${r}^3 = ${r} \\cdot ${r} \\cdot ${r} = ${r*r*r}` 
                },
                { 
                    text: t(lang, { sv: "Sätt in i formeln och beräkna.", en: "Insert into formula and calculate." }), 
                    latex: `V \\approx \\frac{4 \\cdot 3.14 \\cdot ${r*r*r}}{3} \\approx ${formatColor(qData.answer)}` 
                }
            ];

            qData.description = { sv: "Beräkna volymen (avrunda till 1 decimal).", en: "Calculate the volume (round to 1 decimal)." };
            geometry = { type: 'sphere', labels: { val: `${r}${unitSuffix}` }, show: 'r' };
        }

        // --- LEVEL 7: Unit Conversion Logic ---
        if (isUnitConversion) {
            const ratio = unitIn.factor / unitOut.factor; // e.g. m -> dm (1 / 0.1 = 10)
            const volRatio = Math.pow(ratio, 3); // 10^3 = 1000
            
            const originalAns = qData.answer;
            const convertedAns = Math.round(originalAns * volRatio * 1000) / 1000;
            
            qData.answer = convertedAns;
            qData.description = { 
                sv: `Svara i enheten ${uVol(unitOut.id)}. (Nuvarande mått i ${unitIn.id})`, 
                en: `Answer in ${uVol(unitOut.id)}. (Current dims in ${unitIn.id})` 
            };

            steps.push({
                text: t(lang, { sv: "Omvandla enheterna. Volymskalan är längdskalan upphöjt till 3.", en: "Convert units. Volume scale is length scale cubed." }), 
                latex: `1 \\text{ ${uVol(unitIn.id)}} = ${volRatio} \\text{ ${uVol(unitOut.id)}}`
            });
            steps.push({
                text: t(lang, { sv: "Multiplicera resultatet med omvandlingsfaktorn.", en: "Multiply result by conversion factor." }),
                latex: `${originalAns} \\cdot ${volRatio} = ${formatColor(convertedAns)}`
            });
        }

        return {
            questionId: `vol-l${level}-${seed}`,
            renderData: {
                text_key: "vol_calc",
                description: qData.description,
                latex: "",
                answerType: "numeric",
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