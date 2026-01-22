import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class VolumeGenerator {
    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        const color = "\\mathbf{\\textcolor{#D35400}}";
        const piApprox = 3.14;

        // --- UTILS ---
        const getConstrainedValues = (count: number): number[] => {
            const minAllowed = 2;
            const maxAllowed = 30;
            const span = 9;
            const windowStart = rng.intBetween(minAllowed, maxAllowed - span);
            const windowEnd = windowStart + span;
            const vals: number[] = [];
            for(let i = 0; i < count; i++) {
                vals.push(rng.intBetween(windowStart, windowEnd));
            }
            return vals;
        };

        // --- LEVEL LOGIC ---
        let mode = level;
        const isUnitConversion = level === 7;
        if (level >= 6) mode = rng.intBetween(1, 5); 

        // Unit Handling
        const UNITS = [
            { id: 'mm', factor: 0.001 },
            { id: 'cm', factor: 0.01 },
            { id: 'dm', factor: 0.1 },
            { id: 'm', factor: 1.0 }
        ];
        
        let unitIn = UNITS[1]; // Default cm
        let unitOut = UNITS[1]; // Default cm

        if (isUnitConversion) {
            unitIn = rng.pick(UNITS);
            do {
                unitOut = rng.pick(UNITS);
            } while (unitOut.id === unitIn.id);
        }

        let steps: Clue[] = [];
        let qData = { 
            text_key: "", 
            description: "" as string | {sv:string, en:string}, 
            latex: "", 
            answer: 0 
        };
        let geometry: any = undefined;

        const uVol = (u: string) => `${u}^3`;

        // --- LEVEL 1: Rätblock (Rectangular Prism) & Kub (Cube) ---
        if (mode === 1) {
            const isCube = rng.intBetween(0, 1) === 1;
            const vals = getConstrainedValues(3);
            const w = vals[0];
            const d = isCube ? w : vals[1]; 
            const h = isCube ? w : vals[2]; 

            const volRaw = w * d * h;
            qData.answer = volRaw; 
            
            const shapeNameSv = isCube ? "kuben" : "rätblocket";
            const shapeNameEn = isCube ? "the cube" : "the rectangular prism";

            qData.description = {
                sv: `Beräkna volymen av ${shapeNameSv}.${isUnitConversion ? ` Svara i ${uVol(unitOut.id)}.` : ''}`,
                en: `Calculate the volume of ${shapeNameEn}.${isUnitConversion ? ` Answer in ${uVol(unitOut.id)}.` : ''}`
            };

            steps = [
                { text: t(lang, TERMS.volume.formula_prism), latex: "V = l \\cdot b \\cdot h" },
                { text: t(lang, TERMS.common.calculate), latex: `${w} \\cdot ${d} \\cdot ${h} = ${volRaw} \\text{ ${uVol(unitIn.id)}}` }
            ];

            geometry = { type: 'cuboid', w, h, d, labels: { w: `${w}${unitIn.id}`, h: `${h}${unitIn.id}`, d: `${d}${unitIn.id}` } };
        }

        // --- LEVEL 2: Prismor (Triangular Prism) ---
        else if (mode === 2) {
            const vals = getConstrainedValues(3);
            const bBase = vals[0];
            const hTri = vals[1];
            const len = vals[2];
            
            const areaBase = (bBase * hTri) / 2;
            const volRaw = areaBase * len;
            qData.answer = volRaw;
            
            qData.description = {
                sv: `Beräkna volymen av prismat.${isUnitConversion ? ` Svara i ${uVol(unitOut.id)}.` : ''}`,
                en: `Calculate the volume of the prism.${isUnitConversion ? ` Answer in ${uVol(unitOut.id)}.` : ''}`
            };

            steps = [
                { text: t(lang, TERMS.volume.expl_prism_base), latex: `B = \\frac{${bBase} \\cdot ${hTri}}{2} = ${areaBase}` },
                { text: t(lang, TERMS.volume.formula_prism_base), latex: `V = B \\cdot h = ${areaBase} \\cdot ${len} = ${volRaw} \\text{ ${uVol(unitIn.id)}}` }
            ];

            geometry = { 
                type: 'triangular_prism', b: bBase, h_tri: hTri, len: len, 
                labels: { b: `${bBase}${unitIn.id}`, h: `${hTri}${unitIn.id}`, l: `${len}${unitIn.id}` } 
            };
        }

        // --- LEVEL 3: Pyramid & Kon (Cone) ---
        else if (mode === 3) {
            const isCone = rng.intBetween(0, 1) === 1;
            const vals = getConstrainedValues(2);

            if (isCone) {
                const r = vals[0];
                const h = vals[1];
                const baseArea = piApprox * r * r;
                const volRaw = Math.round((baseArea * h / 3) * 10) / 10;
                qData.answer = volRaw;
                
                qData.description = {
                    sv: `En kon har radien ${r} ${unitIn.id} och höjden ${h} ${unitIn.id}.${isUnitConversion ? ` Svara i ${uVol(unitOut.id)}.` : ' Beräkna volymen.'}`,
                    en: `A cone has radius ${r} ${unitIn.id} and height ${h} ${unitIn.id}.${isUnitConversion ? ` Answer in ${uVol(unitOut.id)}.` : ' Calculate the volume.'}`
                };
                
                steps = [
                    { text: t(lang, TERMS.volume.expl_cylinder_base), latex: `B = \\pi \\cdot ${r}^2 \\approx ${Math.round(baseArea*100)/100}` },
                    { text: t(lang, TERMS.volume.expl_cone_vol), latex: `V = \\frac{${Math.round(baseArea*100)/100} \\cdot ${h}}{3} \\approx ${volRaw} \\text{ ${uVol(unitIn.id)}}` }
                ];
                geometry = { type: 'cone', r, h, labels: { r: `${r}${unitIn.id}`, h: `${h}${unitIn.id}` } };
            } else {
                const side = vals[0];
                const h = vals[1];
                const baseArea = side * side;
                const volRaw = Math.round((baseArea * h / 3) * 10) / 10;
                qData.answer = volRaw;

                qData.description = {
                    sv: `Beräkna volymen av pyramiden.${isUnitConversion ? ` Svara i ${uVol(unitOut.id)}.` : ''}`,
                    en: `Calculate the volume of the pyramid.${isUnitConversion ? ` Answer in ${uVol(unitOut.id)}.` : ''}`
                };

                steps = [
                    { text: t(lang, TERMS.volume.step_calc_base), latex: `B = ${side} \\cdot ${side} = ${baseArea}` },
                    { text: t(lang, TERMS.volume.formula_pyramid), latex: `V = \\frac{${baseArea} \\cdot ${h}}{3} \\approx ${volRaw} \\text{ ${uVol(unitIn.id)}}` }
                ];
                geometry = { type: 'pyramid', s: side, h, labels: { s: `${side}${unitIn.id}`, h: `${h}${unitIn.id}` } };
            }
        }

        // --- LEVEL 4: Cylinder ---
        else if (mode === 4) {
             const vals = getConstrainedValues(2);
             const r = vals[0];
             const h = vals[1];
             const baseArea = piApprox * r * r;
             const volRaw = Math.round(baseArea * h * 10) / 10;
             qData.answer = volRaw;

             qData.description = {
                 sv: `En cylinder har radien ${r} ${unitIn.id} och höjden ${h} ${unitIn.id}.${isUnitConversion ? ` Svara i ${uVol(unitOut.id)}.` : ''}`,
                 en: `A cylinder has radius ${r} ${unitIn.id} and height ${h} ${unitIn.id}.${isUnitConversion ? ` Answer in ${uVol(unitOut.id)}.` : ''}`
             };
             
             steps = [
                 { text: t(lang, TERMS.volume.expl_cylinder_base), latex: `B = \\pi \\cdot ${r}^2 \\approx ${Math.round(baseArea*100)/100}` },
                 { text: t(lang, TERMS.volume.formula_cylinder), latex: `V = ${Math.round(baseArea*100)/100} \\cdot ${h} \\approx ${volRaw} \\text{ ${uVol(unitIn.id)}}` }
             ];
             geometry = { type: 'cylinder', r, h, labels: { r: `${r}${unitIn.id}`, h: `${h}${unitIn.id}` } };
        }

        // --- LEVEL 5: Sphere, Hemisphere, Ice Cream, Silo ---
        else {
            const subType = rng.pick(['sphere', 'hemisphere', 'ice_cream', 'silo']);
            const vals = getConstrainedValues(2);
            
            const r = vals[0];
            const hOther = vals[1]; 
            const d = r * 2;
            const giveDiameter = rng.intBetween(0, 1) === 1; 
            
            const labelVal = giveDiameter ? d : r;
            const labelKeySv = giveDiameter ? 'diametern' : 'radien';
            const labelKeyEn = giveDiameter ? 'diameter' : 'radius';
            const unitSuffix = unitIn.id;

            if (subType === 'sphere') {
                const volRaw = Math.round((4 * piApprox * Math.pow(r, 3) / 3) * 100) / 100;
                qData.answer = volRaw;
                
                qData.description = {
                    sv: `Ett klot har ${labelKeySv} ${labelVal} ${unitSuffix}.${isUnitConversion ? ` Svara i ${uVol(unitOut.id)}.` : ' Beräkna volymen.'}`,
                    en: `A sphere has ${labelKeyEn} ${labelVal} ${unitSuffix}.${isUnitConversion ? ` Answer in ${uVol(unitOut.id)}.` : ' Calculate the volume.'}`
                };
                
                steps = [
                    ...(giveDiameter ? [{ text: t(lang, TERMS.volume.find_radius), latex: `r = ${d}/2 = ${r}` }] : []),
                    { text: t(lang, TERMS.volume.expl_sphere_formula), latex: `V = \\frac{4 \\cdot \\pi \\cdot ${r}^3}{3} \\approx ${volRaw} \\text{ ${uVol(unitIn.id)}}` }
                ];
                geometry = { type: 'sphere', r, show: giveDiameter ? 'd' : 'r', labels: { val: `${labelVal}${unitSuffix}` } };
            } 
            else if (subType === 'hemisphere') {
                const volSphere = (4 * piApprox * Math.pow(r, 3)) / 3;
                const volRaw = Math.round((volSphere / 2) * 100) / 100;
                qData.answer = volRaw;

                qData.description = {
                    sv: `Ett halvklot har ${labelKeySv} ${labelVal} ${unitSuffix}.${isUnitConversion ? ` Svara i ${uVol(unitOut.id)}.` : ' Beräkna volymen.'}`,
                    en: `A hemisphere has ${labelKeyEn} ${labelVal} ${unitSuffix}.${isUnitConversion ? ` Answer in ${uVol(unitOut.id)}.` : ' Calculate the volume.'}`
                };

                steps = [
                     ...(giveDiameter ? [{ text: t(lang, TERMS.volume.find_radius), latex: `r = ${d}/2 = ${r}` }] : []),
                     { text: t(lang, TERMS.volume.sphere_vol), latex: `V_{sphere} = \\frac{4\\pi \\cdot ${r}^3}{3} \\approx ${Math.round(volSphere*10)/10}` },
                     { text: t(lang, TERMS.volume.half), latex: `V = \\frac{${Math.round(volSphere*10)/10}}{2} \\approx ${volRaw} \\text{ ${uVol(unitIn.id)}}` }
                ];
                geometry = { type: 'hemisphere', r, show: giveDiameter ? 'd' : 'r', labels: { val: `${labelVal}${unitSuffix}` } };
            }
            else if (subType === 'ice_cream') {
                const volCone = (piApprox * r * r * hOther) / 3;
                const volHemi = (2 * piApprox * Math.pow(r, 3)) / 3;
                const volRaw = Math.round((volCone + volHemi) * 100) / 100;
                qData.answer = volRaw;

                qData.description = {
                    sv: `Beräkna volymen. $h = ${hOther}$ ${unitSuffix} och ${labelKeySv} är ${labelVal} ${unitSuffix}.${isUnitConversion ? ` Svara i ${uVol(unitOut.id)}.` : ''}`,
                    en: `Calculate the volume. $h = ${hOther}$ ${unitSuffix} and the ${labelKeyEn} is ${labelVal} ${unitSuffix}.${isUnitConversion ? ` Answer in ${uVol(unitOut.id)}.` : ''}`
                };

                steps = [
                     ...(giveDiameter ? [{ text: t(lang, TERMS.volume.find_radius), latex: `r = ${d}/2 = ${r}` }] : []),
                     { text: t(lang, TERMS.volume.cone_vol), latex: `V_{cone} = \\frac{\\pi \\cdot ${r}^2 \\cdot ${hOther}}{3} \\approx ${Math.round(volCone*10)/10}` },
                     { text: t(lang, TERMS.volume.hemi_vol), latex: `V_{hemi} = \\frac{2\\pi \\cdot ${r}^3}{3} \\approx ${Math.round(volHemi*10)/10}` },
                     { text: t(lang, TERMS.volume.total), latex: `${Math.round(volCone*10)/10} + ${Math.round(volHemi*10)/10} = ${volRaw} \\text{ ${uVol(unitIn.id)}}` }
                ];
                geometry = { 
                    type: 'ice_cream', r, h: hOther, show: giveDiameter ? 'd' : 'r', 
                    labels: { val: `${labelVal}${unitSuffix}`, h: `${hOther}${unitSuffix}` } 
                };
            }
            else { // Silo
                const volCyl = piApprox * r * r * hOther;
                const volHemi = (2 * piApprox * Math.pow(r, 3)) / 3;
                const volRaw = Math.round((volCyl + volHemi) * 100) / 100;
                qData.answer = volRaw;

                qData.description = {
                    sv: `Beräkna volymen. $h = ${hOther}$ ${unitSuffix} och ${labelKeySv} är ${labelVal} ${unitSuffix}.${isUnitConversion ? ` Svara i ${uVol(unitOut.id)}.` : ''}`,
                    en: `Calculate the volume. $h = ${hOther}$ ${unitSuffix} and the ${labelKeyEn} is ${labelVal} ${unitSuffix}.${isUnitConversion ? ` Answer in ${uVol(unitOut.id)}.` : ''}`
                };

                steps = [
                     ...(giveDiameter ? [{ text: t(lang, TERMS.volume.find_radius), latex: `r = ${d}/2 = ${r}` }] : []),
                     { text: t(lang, TERMS.volume.cyl_vol), latex: `V_{cyl} = \\pi \\cdot ${r}^2 \\cdot ${hOther} \\approx ${Math.round(volCyl*10)/10}` },
                     { text: t(lang, TERMS.volume.hemi_vol), latex: `V_{hemi} = \\frac{2\\pi \\cdot ${r}^3}{3} \\approx ${Math.round(volHemi*10)/10}` },
                     { text: t(lang, TERMS.volume.total), latex: `${Math.round(volCyl*10)/10} + ${Math.round(volHemi*10)/10} = ${volRaw} \\text{ ${uVol(unitIn.id)}}` }
                ];
                geometry = { 
                    type: 'silo', r, h: hOther, show: giveDiameter ? 'd' : 'r', 
                    labels: { val: `${labelVal}${unitSuffix}`, h: `${hOther}${unitSuffix}` } 
                };
            }
        }

        // --- CONVERT IF LEVEL 7 ---
        if (isUnitConversion) {
            const ratio = unitIn.factor / unitOut.factor;
            const volRatio = Math.pow(ratio, 3);
            
            const originalAns = qData.answer;
            const convertedAns = Math.round(originalAns * volRatio * 1000) / 1000;
            
            qData.answer = convertedAns;
            
            steps.push({
                text: t(lang, TERMS.scale.conv_units), 
                latex: `${originalAns} \\text{ ${uVol(unitIn.id)}} \\cdot ${Math.round(volRatio*1000000)/1000000} = ${color}{${convertedAns}} \\text{ ${uVol(unitOut.id)}}`
            });
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