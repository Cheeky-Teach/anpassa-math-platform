import { MathUtils } from '../utils/MathUtils.js';

export class ScaleGen {
    // Standard shapes for visuals
    private static readonly SHAPES = ['arrow', 'star', 'lightning', 'key', 'heart', 'cloud', 'moon', 'sun'];

    // --- CONTEXT LIBRARY ---
    private static readonly SCENARIOS = {
        map: [
            { sv: "en karta", en: "a map", contextSv: "avståndet", contextEn: "the distance", unit: "km" },
            { sv: "en vandringskarta", en: "a hiking map", contextSv: "stigen", contextEn: "the trail", unit: "m" },
            { sv: "ett sjökort", en: "a nautical chart", contextSv: "rutten", contextEn: "the route", unit: "km" }
        ],
        blueprint: [
            { sv: "en ritning", en: "a blueprint", contextSv: "väggen", contextEn: "the wall", unit: "m" },
            { sv: "en planlösning", en: "a floor plan", contextSv: "rummet", contextEn: "the room", unit: "m" },
            { sv: "en konstruktionsritning", en: "a construction drawing", contextSv: "balken", contextEn: "the beam", unit: "m" }
        ],
        model: [
            { sv: "en modell", en: "a model", contextSv: "bilen", contextEn: "the car", unit: "m" },
            { sv: "en leksaksbil", en: "a toy car", contextSv: "bilen", contextEn: "the car", unit: "m" },
            { sv: "ett modellflygplan", en: "a model airplane", contextSv: "vingbredden", contextEn: "the wingspan", unit: "m" }
        ],
        microscope: [
            { sv: "en bild i ett mikroskop", en: "a microscope image", contextSv: "cellen", contextEn: "the cell", unit: "mm" },
            { sv: "en förstoring", en: "a magnification", contextSv: "insekten", contextEn: "the insect", unit: "mm" },
            { sv: "en detaljbild", en: "a detailed image", contextSv: "chipet", contextEn: "the chip", unit: "mm" }
        ]
    };

    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Concepts(lang);
            case 2: return this.level2_LinearFluency(lang);
            case 3: return this.level3_MixedScenarios(lang);
            case 4: return this.level4_DetermineScale(lang);
            case 5: return this.level5_NoPictures(lang);
            case 6: return this.level6_AreaScaleDeep(lang);
            case 7: return this.level7_Mixed(lang);
            default: return this.level1_Concepts(lang);
        }
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'concept_lie':
            case 'concept_match':
                return this.level1_Concepts(lang, key);
            case 'calc_real':
            case 'calc_image':
            case 'find_scale':
            case 'calc_magnification':
                return this.level2_LinearFluency(lang, key);
            case 'map_real':
            case 'blueprint_draw':
            case 'microscope_calc':
            case 'model_real':
                return this.level3_MixedScenarios(lang, key);
            case 'determine_reduction':
            case 'determine_magnification':
                return this.level4_DetermineScale(lang, key);
            case 'word_problem':
                return this.level5_NoPictures(lang);
            case 'area_concept':
            case 'area_reverse':
            case 'area_calc_small':
            case 'area_calc_large':
                return this.level6_AreaScaleDeep(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private formatNum(n: number): string {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: CONCEPTS ---
    private level1_Concepts(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['concept_lie', 'concept_match']);

        if (v === 'concept_lie') {
             const scale = MathUtils.randomChoice([2, 5, 10, 100]);
             const falseStatement = lang === 'sv' ? `Bilden är ritad i naturlig storlek (skala 1:1).` : `The image is drawn in natural size (scale 1:1).`;
             const correctStatement = lang === 'sv' ? `Verkligheten är ${scale} gånger större än vad bilden visar.` : `Reality is ${scale} times larger than what the image shows.`;

             return {
                renderData: {
                    description: lang === 'sv' ? `Studera skalan 1:${scale}. Vilket påstående är FALSKT?` : `Study the scale 1:${scale}. Which statement is FALSE?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correctStatement, falseStatement, lang === 'sv' ? `Skalan 1:${scale} är en förminskning.` : `The scale 1:${scale} is a reduction.`]),
                    geometry: { type: 'scale_single', label: `1:${scale}`, shape: 'map' }
                },
                token: this.toBase64(falseStatement),
                clues: [
                    { text: lang === 'sv' ? `En skala på 1:${scale} betyder att 1 cm på bilden motsvarar ${scale} cm i verkligheten.` : `A scale of 1:${scale} means 1 cm in the image corresponds to ${scale} cm in reality.`, latex: `1 \\text{ cm (bild)} = ${scale} \\text{ cm (verklighet)}` },
                    { text: lang === 'sv' ? "Detta påstående stämmer inte:" : "This statement is not correct:", latex: `\\text{${falseStatement}}` }
                ],
                metadata: { variation_key: 'concept_lie', difficulty: 1 }
             };
        }

        const isReduction = Math.random() > 0.5;
        const ratio = MathUtils.randomChoice([5, 10, 20, 50]);
        const scaleStr = isReduction ? `1:${ratio}` : `${ratio}:1`;
        const correct = isReduction 
            ? (lang === 'sv' ? `Verkligheten är ${ratio} gånger större än bilden.` : `Reality is ${ratio} times larger than the image.`)
            : (lang === 'sv' ? `Bilden är ${ratio} gånger större än verkligheten.` : `The image is ${ratio} times larger than reality.`);

        return {
            renderData: {
                description: lang === 'sv' ? `Vad innebär skalan ${scaleStr}?` : `What does the scale ${scaleStr} mean?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([correct, lang === 'sv' ? "Bilden och verkligheten är lika stora." : "The image and reality are the same size."]),
                geometry: { type: 'scale_compare', leftLabel: 'Bild', rightLabel: 'Verklighet', leftValue: isReduction ? 1 : ratio, rightValue: isReduction ? ratio : 1, shape: 'arrow' }
            },
            token: this.toBase64(correct),
            clues: [
                { text: lang === 'sv' ? "Siffran 1 i skalan representerar alltid bilden eller ritningen." : "The number 1 in the scale always represents the image or drawing." },
                { text: lang === 'sv' ? "Därför betyder skalan:" : "Therefore, the scale means:", latex: `\\text{${correct}}` }
            ],
            metadata: { variation_key: 'concept_match', difficulty: 1 }
        };
    }

    // --- LEVEL 2: LINEAR FLUENCY ---
    private level2_LinearFluency(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['calc_real', 'calc_image', 'find_scale', 'calc_magnification']);
        const shape = MathUtils.randomChoice(ScaleGen.SHAPES);

        if (v === 'calc_real') {
            const scale = MathUtils.randomChoice([5, 10, 20, 50]);
            const imgCm = MathUtils.randomInt(2, 12);
            const ans = imgCm * scale;
            
            return {
                renderData: {
                    description: lang === 'sv' ? `Skala 1:${scale}. Bilden är ${imgCm} cm. Beräkna verkligheten.` : `Scale 1:${scale}. The image is ${imgCm} cm. Calculate reality.`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Eftersom det är en förminskning är verkligheten ${scale} gånger större än bilden.` : `Since it's a reduction, reality is ${scale} times larger than the image.`, latex: `${imgCm} \\cdot ${scale} = ${ans} \\rightarrow \\text{Verklighet} = ${ans}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'calc_real', difficulty: 2 }
            };
        }

        if (v === 'calc_image') {
            const scale = MathUtils.randomChoice([10, 20, 50, 100]);
            const imgCm = MathUtils.randomInt(3, 10);
            const realCm = imgCm * scale;

            return {
                renderData: {
                    description: lang === 'sv' ? `Ett föremål är ${realCm} cm i verkligheten. Hur lång blir den på en ritning i skala 1:${scale}?` : `An object is ${realCm} cm in reality. How long will it be on a drawing in scale 1:${scale}?`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(imgCm.toString()),
                clues: [
                    { text: lang === 'sv' ? `På ritningen blir föremålet ${scale} gånger mindre än i verkligheten.` : `On the drawing, the object becomes ${scale} times smaller than in reality.`, latex: `\\frac{${realCm}}{${scale}} = ${imgCm} \\rightarrow \\text{Ritning} = ${imgCm}` },
                    { text: lang === 'sv' ? "Längden på ritningen blir:" : "The length on the drawing will be:", latex: `${imgCm}` }
                ],
                metadata: { variation_key: 'calc_image', difficulty: 2 }
            };
        }

        if (v === 'find_scale') {
            const scale = MathUtils.randomChoice([2, 5, 10, 20, 50]);
            const imgCm = MathUtils.randomInt(2, 10);
            const realCm = imgCm * scale;

            return {
                renderData: {
                    description: lang === 'sv' ? `Bilden är ${imgCm} cm. Verkligheten är ${realCm} cm. Ange skalan.` : `The image is ${imgCm} cm. Reality is ${realCm} cm. State the scale.`,
                    answerType: 'text', placeholder: '1:X'
                },
                token: this.toBase64(`1:${scale}`),
                clues: [
                    { text: lang === 'sv' ? "Dividera verklighetens längd med bildens längd för att få reda på förminskningen." : "Divide the real length by the image length to find the reduction.", latex: `\\frac{${realCm}}{${imgCm}} = ${scale} \\rightarrow 1:${scale}` },
                    { text: lang === 'sv' ? "Skalan är:" : "The scale is:", latex: `1:${scale}` }
                ],
                metadata: { variation_key: 'find_scale', difficulty: 2 }
            };
        }

        const scale = MathUtils.randomChoice([5, 10, 20]);
        const realMm = MathUtils.randomInt(2, 8);
        const imgMm = realMm * scale;
        
        return {
            renderData: {
                description: lang === 'sv' ? `Förstoring ${scale}:1. Bilden är ${imgMm} mm. Hur lång är den i verkligheten?` : `Magnification ${scale}:1. The image is ${imgMm} mm. How long is it in reality?`,
                answerType: 'numeric', suffix: 'mm'
            },
            token: this.toBase64(realMm.toString()),
            clues: [
                { text: lang === 'sv' ? `Skalan ${scale}:1 betyder att bilden är ${scale} gånger större än verkligheten.` : `The scale ${scale}:1 means the image is ${scale} times larger than reality.`, latex: `\\frac{${imgMm}}{${scale}} = ${realMm} \\rightarrow \\text{Verklighet} = ${realMm}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${realMm}` }
            ],
            metadata: { variation_key: 'calc_magnification', difficulty: 2 }
        };
    }

    // --- LEVEL 3: MIXED SCENARIOS ---
    private level3_MixedScenarios(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['map_real', 'blueprint_draw', 'microscope_calc', 'model_real']);
        
        if (v === 'map_real') {
            const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.map);
            const scale = MathUtils.randomChoice([10000, 50000, 100000]);
            const mapCm = MathUtils.randomInt(2, 10);
            const realCm = mapCm * scale;
            const useKm = realCm >= 100000;
            const ans = useKm ? realCm / 100000 : realCm / 100;
            const unit = useKm ? 'km' : 'm';

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `På ${scenario.sv} i skala 1:${this.formatNum(scale)} mäts ${scenario.contextSv} till ${mapCm} cm. Hur långt är detta i verkligheten?`
                        : `On ${scenario.en} in scale 1:${this.formatNum(scale)}, ${scenario.contextEn} measures ${mapCm} cm. How long is this in reality?`,
                    answerType: 'numeric', suffix: unit
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Räkna först ut avståndet i cm.` : `First calculate the distance in cm.`, latex: `${mapCm} \\cdot ${scale} = ${this.formatNum(realCm)} \\text{ cm}` },
                    { text: lang === 'sv' ? `Omvandla sedan från cm till ${unit}.` : `Then convert from cm to ${unit}.`, latex: useKm ? `\\frac{${realCm}}{100\\,000} = ${ans} \\text{ km}` : `\\frac{${realCm}}{100} = ${ans} \\text{ m}` },
                    { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'map_real', difficulty: 3 }
            };
        }

        if (v === 'blueprint_draw') {
            const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.blueprint);
            const scale = 50;
            const realM = MathUtils.randomInt(2, 8);
            const ans = (realM * 100) / scale;

            return {
                renderData: {
                    description: lang === 'sv' ? `${scenario.sv} är i skala 1:${scale}. Verkligheten är ${realM} m. Hur långt blir det på ritningen?` : `${scenario.en} is in scale 1:${scale}. Reality is ${realM} m. How long will it be on the drawing?`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Gör om meter till centimeter först." : "Convert meters to centimeters first.", latex: `${realM} \\cdot 100 = ${realM * 100} \\text{ cm}` },
                    { text: lang === 'sv' ? `Dividera med skalan ${scale} för att få ritningens mått.` : `Divide by the scale ${scale} to get the drawing measure.`, latex: `\\frac{${realM * 100}}{${scale}} = ${ans} \\text{ cm}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'blueprint_draw', difficulty: 3 }
            };
        }

        if (v === 'microscope_calc') {
            const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.microscope);
            const scale = MathUtils.randomChoice([10, 50, 100]);
            const realMm = MathUtils.randomChoice([0.1, 0.2, 0.5]);
            const ansMm = realMm * scale;
            const ans = ansMm >= 10 ? ansMm / 10 : ansMm;
            const unit = ansMm >= 10 ? 'cm' : 'mm';

            return {
                renderData: {
                    description: lang === 'sv' ? `I ${scenario.sv} (skala ${scale}:1) är verkligheten ${realMm.toString().replace('.', ',')} mm. Hur lång är den på bilden?` : `In ${scenario.en} (scale ${scale}:1), reality is ${realMm} mm. How long is it in the image?`,
                    answerType: 'numeric', suffix: unit
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Multiplicera verklighetens längd med ${scale}.` : `Multiply the real length by ${scale}.`, latex: `${realMm} \\cdot ${scale} = ${ansMm} \\text{ mm}` },
                    { text: lang === 'sv' ? (ansMm >= 10 ? "Omvandla till cm." : "Svaret i mm:") : (ansMm >= 10 ? "Convert to cm." : "The answer in mm:"), latex: `${ans}` }
                ],
                metadata: { variation_key: 'microscope_calc', difficulty: 3 }
            };
        }

        const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.model);
        const scale = MathUtils.randomChoice([10, 20, 50]);
        const imgCm = MathUtils.randomInt(5, 20);
        const ans = (imgCm * scale) / 100;

        return {
            renderData: {
                description: lang === 'sv' ? `${scenario.sv} i skala 1:${scale}. Modellen är ${imgCm} cm. Beräkna verkligheten i meter.` : `${scenario.en} in scale 1:${scale}. The model is ${imgCm} cm. Calculate reality in meters.`,
                answerType: 'numeric', suffix: 'm'
            },
            token: this.toBase64(ans.toString().replace('.', ',')),
            clues: [
                { text: lang === 'sv' ? `Multiplicera modellens längd med ${scale}.` : `Multiply the model length by ${scale}.`, latex: `${imgCm} \\cdot ${scale} = ${imgCm * scale} \\text{ cm}` },
                { text: lang === 'sv' ? "Dela med 100 för att få meter." : "Divide by 100 to get meters.", latex: `\\frac{${imgCm * scale}}{100} = ${ans} \\text{ m}` },
                { text: lang === 'sv' ? "Slutresultat:" : "Final result:", latex: `${ans}` }
            ],
            metadata: { variation_key: 'model_real', difficulty: 3 }
        };
    }

    // --- LEVEL 4: DETERMINE SCALE ---
    private level4_DetermineScale(lang: string, variationKey?: string): any {
        const v = variationKey || (Math.random() < 0.5 ? 'determine_reduction' : 'determine_magnification');
        
        if (v === 'determine_reduction') {
            const scale = MathUtils.randomChoice([20, 50, 100, 200]);
            const imgCm = MathUtils.randomInt(2, 5);
            const realM = (imgCm * scale) / 100;

            return {
                renderData: {
                    description: lang === 'sv' ? `Verkligheten är ${realM.toString().replace('.', ',')} m. På en ritning är den ${imgCm} cm. Ange skalan.` : `Reality is ${realM} m. On a drawing it is ${imgCm} cm. State the scale.`,
                    answerType: 'text', placeholder: '1:X'
                },
                token: this.toBase64(`1:${scale}`),
                clues: [
                    { text: lang === 'sv' ? `Gör först om meter till cm: ${realM} m = ${realM * 100} cm.` : `Convert meters to cm first: ${realM} m = ${realM * 100} cm.` },
                    { text: lang === 'sv' ? "Dela det verkliga måttet med ritningens mått." : "Divide the real measure by the drawing measure.", latex: `\\frac{${realM * 100}}{${imgCm}} = ${scale} \\rightarrow 1:${scale}` },
                    { text: lang === 'sv' ? "Skalan är:" : "The scale is:", latex: `1:${scale}` }
                ],
                metadata: { variation_key: 'determine_reduction', difficulty: 3 }
            };
        }

        const scale = MathUtils.randomChoice([5, 10, 50]);
        const realMm = MathUtils.randomInt(2, 5);
        const imgCm = (realMm * scale) / 10;

        return {
            renderData: {
                description: lang === 'sv' ? `Ett frö är ${realMm} mm. På en bild är det ${imgCm.toString().replace('.', ',')} cm. Ange skalan.` : `A seed is ${realMm} mm. In an image it is ${imgCm} cm. State the scale.`,
                answerType: 'text', placeholder: 'X:1'
            },
            token: this.toBase64(`${scale}:1`),
            clues: [
                { text: lang === 'sv' ? `Gör först om cm till mm: ${imgCm} cm = ${imgCm * 10} mm.` : `Convert cm to mm first: ${imgCm} cm = ${imgCm * 10} mm.` },
                { text: lang === 'sv' ? "Dela bildens mått med verklighetens mått." : "Divide the image measure by the real measure.", latex: `\\frac{${imgCm * 10}}{${realMm}} = ${scale} \\rightarrow ${scale}:1` },
                { text: lang === 'sv' ? "Skalan är:" : "The scale is:", latex: `${scale}:1` }
            ],
            metadata: { variation_key: 'determine_magnification', difficulty: 3 }
        };
    }

    // --- LEVEL 5: NO PICTURES ---
    private level5_NoPictures(lang: string): any {
        const data = this.level3_MixedScenarios(lang);
        data.renderData.geometry = null;
        data.metadata.variation_key = 'word_problem';
        return data;
    }

    // --- LEVEL 6: AREA SCALE DEEP ---
    private level6_AreaScaleDeep(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['area_concept', 'area_reverse', 'area_calc_large']);

        if (v === 'area_concept') {
            const L = MathUtils.randomChoice([2, 5, 10]);
            const sq = L * L;
            const correct = lang === 'sv' ? `${sq} gånger större` : `${sq} times larger`;
            
            return {
                renderData: {
                    description: lang === 'sv' ? `Längdskalan är 1:${L}. Hur många gånger större blir arean?` : `The length scale is 1:${L}. How many times larger does the area become?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, lang === 'sv' ? `${L} gånger större` : `${L} times larger`])
                },
                token: this.toBase64(correct),
                clues: [
                    { text: lang === 'sv' ? "Regel: Areaskalan är längdskalan i kvadrat." : "Rule: Area scale is the length scale squared.", latex: `\\text{Areaskala} = ${L}^2 = ${sq}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${sq}` }
                ],
                metadata: { variation_key: 'area_concept', difficulty: 4 }
            };
        }

        const L = MathUtils.randomChoice([2, 3, 4]);
        const smallA = MathUtils.randomInt(5, 10);
        const largeA = smallA * (L * L);

        if (v === 'area_reverse') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Liten area: ${smallA} cm². Stor area: ${largeA} cm². Ange längdskalan.` : `Small area: ${smallA} cm². Large area: ${largeA} cm². State the length scale.`,
                    answerType: 'text', placeholder: '1:X'
                },
                token: this.toBase64(`1:${L}`),
                clues: [
                    { text: lang === 'sv' ? `Beräkna areaskalan först: ${largeA} / ${smallA} = ${L*L}.` : `Calculate area scale first: ${largeA} / ${smallA} = ${L*L}.`, latex: `\\text{Areaskala} = ${L*L}` },
                    { text: lang === 'sv' ? "Längdskalan är roten ur areaskalan." : "Length scale is the root of area scale.", latex: `\\sqrt{${L*L}} = ${L} \\rightarrow 1:${L}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `1:${L}` }
                ],
                metadata: { variation_key: 'area_reverse', difficulty: 4 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? `Längdskala 1:${L}. Liten area är ${smallA} cm². Beräkna stora arean.` : `Length scale 1:${L}. Small area is ${smallA} cm². Calculate large area.`,
                answerType: 'numeric', suffix: 'cm²'
            },
            token: this.toBase64(largeA.toString()),
            clues: [
                { text: lang === 'sv' ? `Areaskalan är ${L} i kvadrat: ${L*L}.` : `The area scale is ${L} squared: ${L*L}.`, latex: `${L}^2 = ${L*L}` },
                { text: lang === 'sv' ? `Multiplicera lilla arean med ${L*L}.` : `Multiply the small area by ${L*L}.`, latex: `${smallA} \\cdot ${L*L} = ${largeA}` },
                { text: lang === 'sv' ? "Stora arean är:" : "The large area is:", latex: `${largeA}` }
            ],
            metadata: { variation_key: 'area_calc_large', difficulty: 4 }
        };
    }

    // --- LEVEL 7: MIXED ---
    private level7_Mixed(lang: string): any {
        const subLevel = MathUtils.randomInt(2, 6);
        const res = this.generate(subLevel, lang);
        res.metadata.mixed = true;
        return res;
    }
}