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

        let qData: any = { answer: 0, description: "", latex: "", answerType: "numeric" };
        let geometry: any = undefined;
        let steps: Clue[] = [];

        // --- LEVEL 1: Prisms & Cubes ---
        if (mode === 1) {
            const isCube = rng.intBetween(0, 1) === 1;
            const s = (val: number) => Math.round(val * multiplier);
            
            if (isCube) {
                const side = rng.intBetween(s(2), s(10));
                qData.answer = Math.pow(side, 3);
                qData.description = { sv: "Beräkna volymen (Kub).", en: "Calculate the volume (Cube)." };
                geometry = { type: 'cuboid', labels: { w: side, h: side, d: side } };
                
                steps.push({ text: t(lang, { sv: "Volym = sida · sida · sida", en: "Volume = side · side · side" }), latex: "V = s^3" });
                steps.push({ text: t(lang, TERMS.common.calculate), latex: `${side}^3 = ${formatColor(qData.answer)}` });
            } else {
                const [w, h, d] = getConstrainedValues(3, s(3), s(10));
                qData.answer = w * h * d;
                qData.description = { sv: "Beräkna volymen (Rätblock).", en: "Calculate the volume (Rectangular Prism)." };
                geometry = { type: 'cuboid', labels: { w: w, h: h, d: d } };

                steps.push({ text: t(lang, { sv: "Volym = Bredd · Höjd · Djup", en: "Volume = Width · Height · Depth" }), latex: "V = b \\cdot h \\cdot d" });
                steps.push({ text: t(lang, TERMS.common.calculate), latex: `${w} \\cdot ${h} \\cdot ${d} = ${formatColor(qData.answer)}` });
            }
        }

        // --- LEVEL 2: Triangular Prism ---
        else if (mode === 2) {
            const b = rng.intBetween(3, 10);
            const hTri = rng.intBetween(3, 8);
            const len = rng.intBetween(5, 15);
            
            const areaBase = (b * hTri) / 2;
            qData.answer = areaBase * len;
            qData.description = { sv: "Beräkna volymen.", en: "Calculate the volume." };
            geometry = { type: 'triangular_prism', b: b, h_tri: hTri, len: len, labels: { b: b, h: hTri, l: len } };

            steps.push({ text: t(lang, { sv: "1. Räkna ut basytan (triangeln).", en: "1. Calculate base area (triangle)." }), latex: `A = \\frac{${b} \\cdot ${hTri}}{2} = ${areaBase}` });
            steps.push({ text: t(lang, { sv: "2. Multiplicera med längden.", en: "2. Multiply by the length." }), latex: `${areaBase} \\cdot ${len} = ${formatColor(qData.answer)}` });
        }

        // --- LEVEL 3: Cylinder ---
        else if (mode === 3) {
            const r = rng.intBetween(2, 6);
            const h = rng.intBetween(5, 15);
            const areaBase = piApprox * r * r;
            qData.answer = Math.round(areaBase * h * 10) / 10;
            
            // Randomly show radius or diameter
            const showDiameter = rng.intBetween(0, 1) === 1;
            const d = r * 2;
            
            qData.description = { sv: "Beräkna volymen (avrunda till 1 decimal).", en: "Calculate the volume (round to 1 decimal)." };
            geometry = { 
                type: 'cylinder', 
                labels: { r: r, h: h, val: showDiameter ? `d=${d}` : `r=${r}` }, 
                show: showDiameter ? 'diameter' : 'radius' 
            };

            if (showDiameter) {
                steps.push({ text: t(lang, { sv: "Radien är hälften av diametern.", en: "Radius is half the diameter." }), latex: `r = ${d}/2 = ${r}` });
            }
            steps.push({ text: t(lang, { sv: "Volym = Basytan · Höjden", en: "Volume = Base Area · Height" }), latex: "V = \\pi r^2 \\cdot h" });
            steps.push({ text: t(lang, TERMS.common.calculate), latex: `3.14 \\cdot ${r}^2 \\cdot ${h} \\approx ${formatColor(qData.answer)}` });
        }

        // --- LEVEL 4: Pyramid & Cone ---
        else if (mode === 4) {
            const isCone = rng.intBetween(0, 1) === 1;
            const h = rng.intBetween(5, 15);
            
            if (isCone) {
                const r = rng.intBetween(3, 8);
                const baseArea = piApprox * r * r;
                qData.answer = Math.round((baseArea * h / 3) * 10) / 10;
                qData.description = { sv: "Beräkna volymen (Kon).", en: "Calculate the volume (Cone)." };
                geometry = { type: 'cone', labels: { r: r, h: h, val: `r=${r}` }, show: 'radius' }; // Explicitly set show radius

                steps.push({ text: t(lang, { sv: "Volym = (Basytan · Höjden) / 3", en: "Volume = (Base Area · Height) / 3" }), latex: "V = \\frac{\\pi r^2 h}{3}" });
                steps.push({ text: t(lang, TERMS.common.calculate), latex: `\\frac{3.14 \\cdot ${r}^2 \\cdot ${h}}{3} \\approx ${formatColor(qData.answer)}` });
            } else {
                const side = rng.intBetween(4, 10);
                const baseArea = side * side;
                qData.answer = Math.round((baseArea * h / 3) * 10) / 10;
                qData.description = { sv: "Beräkna volymen (Pyramid med kvadratisk bas).", en: "Calculate volume (Square-based Pyramid)." };
                geometry = { type: 'pyramid', labels: { s: side, h: h } };

                steps.push({ text: t(lang, { sv: "Volym = (Basytan · Höjden) / 3", en: "Volume = (Base Area · Height) / 3" }), latex: "V = \\frac{s^2 \\cdot h}{3}" });
                steps.push({ text: t(lang, TERMS.common.calculate), latex: `\\frac{${side}^2 \\cdot ${h}}{3} \\approx ${formatColor(qData.answer)}` });
            }
        }

        // --- LEVEL 5: Sphere & Composite ---
        else if (mode === 5) {
            // Restore variety: Sphere, Hemisphere, Ice Cream, Silo
            const type = rng.pick(['sphere', 'hemisphere', 'ice_cream', 'silo']);
            const r = rng.intBetween(3, 8);
            const d = r * 2;
            const showDiameter = rng.intBetween(0, 1) === 1; // Randomize presentation
            
            const labelVal = showDiameter ? `d=${d}` : `r=${r}`;

            if (type === 'sphere') {
                qData.answer = Math.round((4 * piApprox * Math.pow(r, 3) / 3) * 10) / 10;
                qData.description = { sv: "Beräkna volymen (Klot).", en: "Calculate volume (Sphere)." };
                geometry = { type: 'sphere', labels: { val: labelVal }, show: showDiameter ? 'd' : 'r' };
                
                if (showDiameter) steps.push({ text: t(lang, { sv: "Radien är hälften av diametern.", en: "Radius is half the diameter." }), latex: `r = ${r}` });
                steps.push({ text: "Formel", latex: "V = \\frac{4 \\pi r^3}{3}" });
                steps.push({ text: t(lang, TERMS.common.calculate), latex: `\\frac{4 \\cdot 3.14 \\cdot ${r}^3}{3} \\approx ${formatColor(qData.answer)}` });
            }
            else if (type === 'hemisphere') {
                const sphereVol = (4 * piApprox * Math.pow(r, 3) / 3);
                qData.answer = Math.round((sphereVol / 2) * 10) / 10;
                qData.description = { sv: "Beräkna volymen (Halvklot).", en: "Calculate volume (Hemisphere)." };
                geometry = { type: 'hemisphere', labels: { val: labelVal }, show: showDiameter ? 'd' : 'r' };
                
                steps.push({ text: t(lang, { sv: "Räkna ut volymen för ett helt klot och dela med 2.", en: "Calc volume for full sphere and divide by 2." }), latex: "V = \\frac{4 \\pi r^3}{3} \\cdot \\frac{1}{2}" });
                steps.push({ text: t(lang, TERMS.common.calculate), latex: `\\approx ${formatColor(qData.answer)}` });
            }
            else if (type === 'ice_cream') {
                // Cone + Hemisphere
                const hCone = rng.intBetween(r + 2, r * 3);
                const volCone = (piApprox * r * r * hCone) / 3;
                const volHemi = (4 * piApprox * Math.pow(r, 3) / 3) / 2;
                qData.answer = Math.round((volCone + volHemi) * 10) / 10;
                qData.description = { sv: "Beräkna totala volymen.", en: "Calculate total volume." };
                geometry = { type: 'ice_cream', labels: { h: hCone, val: labelVal }, show: showDiameter ? 'd' : 'r' };
                
                steps.push({ text: t(lang, { sv: "Total = Kon + Halvklot", en: "Total = Cone + Hemisphere" }), latex: "" });
                steps.push({ text: "Kon", latex: `V_{kon} = \\frac{\\pi \\cdot ${r}^2 \\cdot ${hCone}}{3} \\approx ${Math.round(volCone)}` });
                steps.push({ text: "Halvklot", latex: `V_{halv} \\approx ${Math.round(volHemi)}` });
                steps.push({ text: "Summa", latex: `${Math.round(volCone)} + ${Math.round(volHemi)} \\approx ${formatColor(qData.answer)}` });
            }
            else { // Silo
                // Cylinder + Hemisphere
                const hCyl = rng.intBetween(r + 2, r * 3);
                const volCyl = piApprox * r * r * hCyl;
                const volHemi = (4 * piApprox * Math.pow(r, 3) / 3) / 2;
                qData.answer = Math.round((volCyl + volHemi) * 10) / 10;
                qData.description = { sv: "Beräkna volymen (Silo).", en: "Calculate volume (Silo)." };
                geometry = { type: 'silo', labels: { h: hCyl, val: labelVal }, show: showDiameter ? 'd' : 'r' };
                
                steps.push({ text: t(lang, { sv: "Total = Cylinder + Halvklot", en: "Total = Cylinder + Hemisphere" }), latex: "" });
                steps.push({ text: "Cylinder", latex: `V_{cyl} = \\pi \\cdot ${r}^2 \\cdot ${hCyl} \\approx ${Math.round(volCyl)}` });
                steps.push({ text: "Halvklot", latex: `V_{halv} \\approx ${Math.round(volHemi)}` });
                steps.push({ text: "Summa", latex: `${formatColor(qData.answer)}` });
            }
        }

        // --- LEVEL 7: Unit Conversion (Volume) ---
        else if (isUnitConversion) {
            // e.g. Convert 2 m^3 to dm^3
            // Scale factor k=10 -> Volume factor k^3 = 1000
            
            const unitInIdx = rng.intBetween(1, 3); // cm, dm, m
            const unitOutIdx = unitInIdx - 1; // Step down (larger number)
            
            const unitIn = UNITS[unitInIdx];
            const unitOut = UNITS[unitOutIdx];
            const k = 10;
            const volRatio = 1000;

            const val = rng.intBetween(1, 10);
            qData.answer = val * volRatio;
            
            const uVol = (u: string) => `${u}^3`;
            
            qData.description = { 
                sv: `Omvandla ${val} ${uVol(unitIn.id)} till ${uVol(unitOut.id)}.`, 
                en: `Convert ${val} ${uVol(unitIn.id)} to ${uVol(unitOut.id)}.` 
            };
            
            // To make the visual interesting, show a cube with side 1 unit vs 10 smaller units
            geometry = { 
                type: 'cuboid', 
                labels: { w: `1${unitIn.id}`, h: `1${unitIn.id}`, d: `1${unitIn.id}` } 
            };
            
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