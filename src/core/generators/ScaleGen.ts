import { MathUtils } from '../utils/MathUtils.js';

export class ScaleGen {
    // Standard shapes for visuals (must match ScaleVisuals.jsx emoji mapping)
    private static readonly SHAPES = ['map', 'car', 'ladybug', 'house', 'square', 'triangle', 'circle', 'magnifying_glass'];

    // --- CONTEXT LIBRARY ---
    private static readonly SCENARIOS = {
        map: [
            { sv: "en karta", en: "a map", contextSv: "avståndet mellan två städer", contextEn: "the distance between two cities", unit: "km" },
            { sv: "en vandringskarta", en: "a hiking map", contextSv: "stigen genom skogen", contextEn: "the trail through the woods", unit: "m" },
            { sv: "ett sjökort", en: "a nautical chart", contextSv: "rutten mellan två öar", contextEn: "the route between two islands", unit: "km" }
        ],
        blueprint: [
            { sv: "en ritning", en: "a blueprint", contextSv: "väggen i vardagsrummet", contextEn: "the living room wall", unit: "m" },
            { sv: "en planlösning", en: "a floor plan", contextSv: "sovrummets längd", contextEn: "the bedroom length", unit: "m" },
            { sv: "en konstruktionsritning", en: "a construction drawing", contextSv: "stålbalken", contextEn: "the steel beam", unit: "m" }
        ],
        microscope: [
            { sv: "ett mikroskop", en: "a microscope", contextSv: "cellen", contextEn: "the cell", unit: "mm" },
            { sv: "en förstoring", en: "an enlargement", contextSv: "lilla insekten", contextEn: "the tiny insect", unit: "mm" },
            { sv: "en detaljbild", en: "a detailed image", contextSv: "microchipet", contextEn: "the microchip", unit: "mm" }
        ]
    };

    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to calculation fluency
        if (level === 1 && options.hideConcept && options.exclude?.includes('concept_match')) {
            return this.level2_LinearFluency(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_Concepts(lang, undefined, options);
            case 2: return this.level2_LinearFluency(lang, undefined, options);
            case 3: return this.level3_MixedScenarios(lang, undefined, options);
            case 4: return this.level4_DetermineScale(lang, undefined, options);
            case 5: return this.level5_NoPictures(lang, options);
            case 6: return this.level6_AreaScaleDeep(lang, undefined, options);
            case 7: return this.level7_Mixed(lang, options);
            default: return this.level1_Concepts(lang, undefined, options);
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

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: CONCEPTS ---
    private level1_Concepts(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'concept_lie', type: 'concept' },
            { key: 'concept_match', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'concept_lie') {
            const ratio = MathUtils.randomChoice([20, 50, 100, 500]);
            const sLie = lang === 'sv' ? `Bilden visar föremålet i dess verkliga storlek.` : `The image shows the object in its real size.`;
            const sTrue1 = lang === 'sv' ? `Verkligheten är ${ratio} gånger större än bilden.` : `Reality is ${ratio} times larger than the image.`;
            const sTrue2 = lang === 'sv' ? `Detta är en förminskning.` : `This is a reduction.`;

            return {
                renderData: {
                    description: lang === 'sv' ? `En ritning har skalan 1:${ratio}. Vilket påstående är FALSKT?` : `A drawing has the scale 1:${ratio}. Which statement is FALSE?`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle([sLie, sTrue1, sTrue2]),
                    geometry: { type: 'scale_single', label: `1:${ratio}`, shape: 'house' }
                },
                token: this.toBase64(sLie), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Siffran 1 i skalan representerar måttet på bilden eller ritningen." : "Step 1: The number 1 in the scale represents the measure on the image or drawing." },
                    { text: lang === 'sv' ? `Steg 2: Siffran ${ratio} representerar motsvarande mått i verkligheten.` : `Step 2: The number ${ratio} represents the corresponding measure in reality.` },
                    { text: lang === 'sv' ? `Detta betyder att 1 cm på bilden motsvarar ${ratio} cm i den verkliga världen.` : `This means 1 cm in the image corresponds to ${ratio} cm in the real world.` },
                    { text: lang === 'sv' ? "Eftersom verkligheten är större än bilden, är påståendet att det är 'verklig storlek' (skala 1:1) felaktigt." : "Since reality is larger than the image, the statement that it is 'real size' (scale 1:1) is incorrect." },
                    { text: lang === 'sv' ? `Svar: ${sLie}` : `Answer: ${sLie}` }
                ]
            };
        }

        const ratio = MathUtils.randomChoice([5, 10, 20]);
        const scaleStr = `${ratio}:1`;
        const ans = lang === 'sv' ? `Bilden är ${ratio} gånger större än verkligheten.` : `The image is ${ratio} times larger than reality.`;
        return {
            renderData: {
                description: lang === 'sv' ? `Vad innebär det när en bild har skalan ${scaleStr}?` : `What does it mean when an image has the scale ${scaleStr}?`,
                answerType: 'multiple_choice', options: MathUtils.shuffle([ans, lang === 'sv' ? "Verkligheten är större än bilden." : "Reality is larger than the image."]),
                geometry: { type: 'scale_compare', leftLabel: 'Bild', rightLabel: 'Verklighet', leftValue: ratio, rightValue: 1, shape: 'ladybug' }
            },
            token: this.toBase64(ans), variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Steg 1: När den första siffran i skalan är störst, handlar det om en förstoring." : "Step 1: When the first number in the scale is the largest, it is an enlargement (magnification)." },
                { text: lang === 'sv' ? `Steg 2: Skalan ${ratio}:1 betyder att ${ratio} enheter på bilden bara motsvarar 1 enhet i verkligheten.` : `Step 2: The scale ${ratio}:1 means that ${ratio} units in the image only correspond to 1 unit in reality.` },
                { text: lang === 'sv' ? `Bilden har alltså 'förstorat' verkligheten med en faktor på ${ratio}.` : `The image has thus 'enlarged' reality by a factor of ${ratio}.` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 2: LINEAR FLUENCY ---
    private level2_LinearFluency(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'calc_real', type: 'calculate' },
            { key: 'calc_image', type: 'calculate' },
            { key: 'find_scale', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'calc_real') {
            const scale = MathUtils.randomChoice([10, 20, 50]);
            const imgCm = MathUtils.randomInt(3, 12);
            const ans = imgCm * scale;
            return {
                renderData: {
                    description: lang === 'sv' ? `En ritning är gjord i skala 1:${scale}. På ritningen är en sträcka ${imgCm} cm lång. Hur lång är den i verkligheten?` : `A drawing is made in scale 1:${scale}. On the drawing, a segment is ${imgCm} cm long. How long is it in reality?`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Identifiera skalan. 1:${scale} betyder att verkligheten är ${scale} gånger större.` : `Step 1: Identify the scale. 1:${scale} means reality is ${scale} times larger.` },
                    { text: lang === 'sv' ? `Steg 2: Hitta måttet på ritningen, vilket är ${imgCm} cm.` : `Step 2: Find the measure on the drawing, which is ${imgCm} cm.` },
                    { text: lang === 'sv' ? `Steg 3: Multiplicera ritningens mått med skalfaktorn för att få det verkliga måttet.` : `Step 3: Multiply the drawing measure by the scale factor to get the real measure.` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${imgCm} · ${scale} = ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        if (v === 'calc_image') {
            const scale = MathUtils.randomChoice([20, 50, 100]);
            const imgCm = MathUtils.randomInt(2, 10);
            const realCm = imgCm * scale;
            return {
                renderData: {
                    description: lang === 'sv' ? `Ett föremål har den verkliga längden ${realCm} cm. Hur lång blir den på en ritning i skala 1:${scale}?` : `An object has a real length of ${realCm} cm. How long will it be on a drawing in scale 1:${scale}?`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(imgCm.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Skalan 1:${scale} innebär att ritningen är ${scale} gånger mindre än verkligheten.` : `Step 1: The scale 1:${scale} means the drawing is ${scale} times smaller than reality.` },
                    { text: lang === 'sv' ? `Steg 2: För att få ritningens mått måste vi dividera det verkliga måttet med skalfaktorn.` : `Step 2: To get the drawing measure, we must divide the real measure by the scale factor.` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{${realCm}}{${scale}} = ${imgCm}` },
                    { text: lang === 'sv' ? `Svar: ${imgCm}` : `Answer: ${imgCm}` }
                ]
            };
        }

        const scale = MathUtils.randomChoice([5, 10, 50]);
        const img = MathUtils.randomInt(2, 10);
        const real = img * scale;
        return {
            renderData: {
                description: lang === 'sv' ? `Ett föremål är ${img} cm på en bild. I verkligheten är samma föremål ${real} cm. Vilken skala är bilden ritad i?` : `An object is ${img} cm in an image. In reality, the same object is ${real} cm. In what scale is the image drawn?`,
                answerType: 'text', placeholder: '1:X'
            },
            token: this.toBase64(`1:${scale}`), variationKey: 'find_scale', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Skalan bestäms genom att jämföra bildens mått med verklighetens mått." : "Step 1: The scale is determined by comparing the image measure with the real measure." },
                { text: lang === 'sv' ? "Steg 2: Beräkna hur många gånger större verkligheten är genom att dividera det verkliga måttet med bildmåttet." : "Step 2: Calculate how many times larger reality is by dividing the real measure by the image measure." },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{${real}}{${img}} = ${scale}` },
                { text: lang === 'sv' ? `Steg 3: Eftersom verkligheten är ${scale} gånger större, skrivs skalan som 1:${scale}.` : `Step 3: Since reality is ${scale} times larger, the scale is written as 1:${scale}.` },
                { text: lang === 'sv' ? `Svar: 1:${scale}` : `Answer: 1:${scale}` }
            ]
        };
    }

    // --- LEVEL 3: MIXED SCENARIOS ---
    private level3_MixedScenarios(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'map_real', type: 'calculate' },
            { key: 'blueprint_draw', type: 'calculate' },
            { key: 'microscope_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'map_real') {
            const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.map);
            const scale = MathUtils.randomChoice([10000, 20000, 50000]);
            const mapCm = MathUtils.randomInt(4, 15);
            const realCm = mapCm * scale;
            const realM = realCm / 100;
            const useKm = realM >= 1000;
            const ans = useKm ? realM / 1000 : realM;
            const unit = useKm ? 'km' : 'm';

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `På ${scenario.sv} i skala 1:${this.formatNum(scale)} är ${scenario.contextSv} ${mapCm} cm. Hur långt är detta i verkligheten? Svara i ${useKm ? 'kilometer' : 'meter'}.`
                        : `On ${scenario.en} in scale 1:${this.formatNum(scale)}, ${scenario.contextEn} is ${mapCm} cm. How long is this in reality? Answer in ${useKm ? 'kilometers' : 'meters'}.`,
                    answerType: 'numeric', suffix: unit
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Beräkna först avståndet i centimeter genom att multiplicera kartmåttet med skalan.` : `Step 1: First calculate the distance in centimeters by multiplying the map measure by the scale.`, latex: `${mapCm} · ${scale} = ${this.formatNum(realCm)} \\text{ cm}` },
                    { text: lang === 'sv' ? "Steg 2: Omvandla måttet till meter genom att dividera med 100." : "Step 2: Convert the measure to meters by dividing by 100.", latex: `\\frac{${this.formatNum(realCm)}}{100} = ${this.formatNum(realM)} \\text{ m}` },
                    ...(useKm ? [{ text: lang === 'sv' ? "Steg 3: Omvandla slutligen meter till kilometer genom att dividera med 1 000." : "Step 3: Finally convert meters to kilometers by dividing by 1 000.", latex: `\\frac{${this.formatNum(realM)}}{1000} = ${ans} \\text{ km}` }] : []),
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        if (v === 'blueprint_draw') {
            const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.blueprint);
            const scale = 50;
            const realM = MathUtils.randomInt(4, 12);
            const realCm = realM * 100;
            const ans = realCm / scale;

            return {
                renderData: {
                    description: lang === 'sv' ? `${scenario.sv} är ritad i skala 1:${scale}. I verkligheten är ${scenario.contextSv} ${realM} meter. Hur lång blir den på ritningen? Svara i cm.` : `${scenario.en} is drawn in scale 1:${scale}. In reality, ${scenario.contextEn} is ${realM} meters. How long will it be on the drawing? Answer in cm.`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Omvandla verklighetens mått (${realM} m) till centimeter för att kunna räkna lättare.` : `Step 1: Convert the real measure (${realM} m) to centimeters to make calculation easier.`, latex: `${realM} · 100 = ${realCm} \\text{ cm}` },
                    { text: lang === 'sv' ? `Steg 2: På ritningen blir måttet ${scale} gånger mindre. Dividera med skalfaktorn.` : `Step 2: On the drawing, the measure becomes ${scale} times smaller. Divide by the scale factor.` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{${realCm}}{${scale}} = ${ans} \\text{ cm}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        // microscope_calc (Magnification)
        const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.microscope);
        const scale = MathUtils.randomChoice([20, 50, 100]);
        const realMm = MathUtils.randomChoice([0.1, 0.2, 0.5]);
        const ansMm = realMm * scale;

        return {
            renderData: {
                description: lang === 'sv' ? `I ${scenario.sv} (skala ${scale}:1) är verklighetens ${scenario.contextSv} ${realMm.toString().replace('.', ',')} mm. Hur lång är den på bilden?` : `In ${scenario.en} (scale ${scale}:1), the real ${scenario.contextEn} is ${realMm} mm. How long is it in the image?`,
                answerType: 'numeric', suffix: 'mm'
            },
            token: this.toBase64(ansMm.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Skalan ${scale}:1 innebär att bilden är ${scale} gånger STÖRRE än verkligheten.` : `Step 1: The scale ${scale}:1 means the image is ${scale} times LARGER than reality.` },
                { text: lang === 'sv' ? `Steg 2: Multiplicera verklighetens längd med skalfaktorn.` : `Step 2: Multiply the real length by the scale factor.` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${realMm} · ${scale} = ${ansMm} \\text{ mm}` },
                { text: lang === 'sv' ? `Svar: ${ansMm}` : `Answer: ${ansMm}` }
            ]
        };
    }

    // --- LEVEL 4: DETERMINE SCALE (Grammar Overhaul) ---
    private level4_DetermineScale(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || 'determine_reduction';
        const ratio = MathUtils.randomChoice([20, 50, 100, 200]);
        const imgCm = MathUtils.randomInt(2, 8);
        const realM = (imgCm * ratio) / 100;

        return {
            renderData: {
                description: lang === 'sv' ? `Ett föremål har längden ${realM.toString().replace('.', ',')} m i verkligheten. På en ritning avbildas det som ${imgCm} cm. Vilken skala har använts?` : `An object has a real length of ${realM} m. On a drawing, it is depicted as ${imgCm} cm. What scale was used?`,
                answerType: 'text', placeholder: '1:X'
            },
            token: this.toBase64(`1:${ratio}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: För att bestämma skalan måste vi jämföra måtten i samma enhet. Gör om meter till centimeter." : "Step 1: To determine the scale, we must compare the measures in the same unit. Convert meters to centimeters.", latex: `${realM} \\text{ m} = ${realM * 100} \\text{ cm}` },
                { text: lang === 'sv' ? `Steg 2: Beräkna hur många gånger större verkligheten (${realM * 100} cm) är jämfört med ritningen (${imgCm} cm).` : `Step 2: Calculate how many times larger reality (${realM * 100} cm) is compared to the drawing (${imgCm} cm).` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{${realM * 100}}{${imgCm}} = ${ratio}` },
                { text: lang === 'sv' ? `Steg 3: Eftersom verkligheten är ${ratio} gånger större än ritningen, blir skalan 1:${ratio}.` : `Step 3: Since reality is ${ratio} times larger than the drawing, the scale becomes 1:${ratio}.` },
                { text: lang === 'sv' ? `Svar: 1:${ratio}` : `Answer: 1:${ratio}` }
            ]
        };
    }

    // --- LEVEL 6: AREA SCALE (Atomic Breakdown) ---
    private level6_AreaScaleDeep(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || this.getVariation([
            { key: 'area_concept', type: 'concept' },
            { key: 'area_calc_large', type: 'calculate' },
            { key: 'area_reverse', type: 'calculate' }
        ], options);

        const L = MathUtils.randomChoice([2, 3, 5, 10]);
        const sq = L * L;
        const smallA = MathUtils.randomInt(4, 10);
        const largeA = smallA * sq;

        if (v === 'area_reverse') {
            return {
                renderData: {
                    description: lang === 'sv' ? `En liten figur har arean ${smallA} cm². En förstoring av samma figur har arean ${largeA} cm². Vilken är längdskalan?` : `A small figure has an area of ${smallA} cm². An enlargement of the same figure has an area of ${largeA} cm². What is the length scale?`,
                    answerType: 'text', placeholder: '1:X'
                },
                token: this.toBase64(`1:${L}`), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Beräkna areaskalan först genom att se hur många gånger större den stora ytan är." : "Step 1: Calculate the area scale first by seeing how many times larger the large surface is.", latex: `\\text{Areaskala} = \\frac{${largeA}}{${smallA}} = ${sq}` },
                    { text: lang === 'sv' ? "Steg 2: Sannolikheten är att areaskalan är längdskalan i kvadrat. Vi måste därför ta kvadratroten ur areaskalan." : "Step 2: The area scale is the length scale squared. We must therefore take the square root of the area scale.", latex: `\\text{Längdskala} = \\sqrt{${sq}} = ${L}` },
                    { text: lang === 'sv' ? `Steg 3: Längdskalan är alltså 1:${L}.` : `Step 3: The length scale is thus 1:${L}.` },
                    { text: lang === 'sv' ? `Svar: 1:${L}` : `Answer: 1:${L}` }
                ]
            };
        }

        if (v === 'area_calc_large') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Längdskalan är 1:${L}. En rektangel har arean ${smallA} cm² på bilden. Hur stor är dess verkliga area?` : `The length scale is 1:${L}. A rectangle has an area of ${smallA} cm² in the image. How large is its real area?`,
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(largeA.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Först måste vi hitta areaskalan. Den är längdskalan i kvadrat.` : `Step 1: First we must find the area scale. It is the length scale squared.`, latex: `\\text{Areaskala} = ${L}^2 = ${sq}` },
                    { text: lang === 'sv' ? `Steg 2: Detta betyder att arean i verkligheten är ${sq} gånger större än på bilden.` : `Step 2: This means the area in reality is ${sq} times larger than in the image.` },
                    { text: lang === 'sv' ? "Steg 3: Multiplicera bildens area med areaskalan." : "Step 3: Multiply the image area by the area scale.", latex: `${smallA} · ${sq} = ${largeA}` },
                    { text: lang === 'sv' ? `Svar: ${largeA}` : `Answer: ${largeA}` }
                ]
            };
        }

        const ansMC = lang === 'sv' ? `${sq} gånger större` : `${sq} times larger`;
        return {
            renderData: {
                description: lang === 'sv' ? `Om längden på alla sidor i en figur dubbleras (längdskala 1:${L}), vad händer då med arean?` : `If the length of all sides in a figure is doubled (length scale 1:${L}), what happens to the area?`,
                answerType: 'multiple_choice', options: MathUtils.shuffle([ansMC, lang === 'sv' ? `${L} gånger större` : `${L} times larger`, lang === 'sv' ? `${L*2} gånger större` : `${L*2} times larger`]),
                geometry: { type: 'compare_shapes_area', shapeType: 'square', left: { area: 1 }, right: { area: sq } }
            },
            token: this.toBase64(ansMC), variationKey: 'area_concept', type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Arean beror på både längden och bredden. Om båda blir dubbelt så långa ökar ytan i två riktningar." : "Step 1: Area depends on both length and width. If both become twice as long, the surface increases in two directions." },
                { text: lang === 'sv' ? `Steg 2: Areaskalan är alltid längdskalan i kvadrat.` : `Step 2: The area scale is always the length scale squared.`, latex: `\\text{Areaskala} = ${L}^2 = ${sq}` },
                { text: lang === 'sv' ? `Svar: ${ansMC}` : `Answer: ${ansMC}` }
            ]
        };
    }

    private level5_NoPictures(lang: string, options: any): any {
        const res = this.level3_MixedScenarios(lang, undefined, options);
        res.renderData.geometry = null; // Enforce pure word problem
        res.metadata.variation_key = 'word_problem';
        return res;
    }

    private level7_Mixed(lang: string, options: any): any {
        const subLevel = MathUtils.randomInt(1, 6);
        return this.generate(subLevel, lang, options);
    }
}