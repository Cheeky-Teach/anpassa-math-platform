import { MathUtils } from '../utils/MathUtils.js';

export class ScaleGen {
    // Standard shapes for visuals (must match ScaleVisuals.jsx emoji mapping)
    private static readonly SHAPES = ['map', 'car', 'ladybug', 'house', 'square', 'triangle', 'circle', 'magnifying_glass'];

    // --- EXPANDED CONTEXT LIBRARY ---
    private static readonly SCENARIOS = {
        map: [
            { sv: "en karta", en: "a map", contextSv: "avståndet mellan två städer", contextEn: "the distance between two cities", unit: "km" },
            { sv: "en vandringskarta", en: "a hiking map", contextSv: "stigen genom skogen", contextEn: "the trail through the woods", unit: "m" },
            { sv: "ett sjökort", en: "a nautical chart", contextSv: "rutten mellan två öar", contextEn: "the route between two islands", unit: "km" },
            { sv: "en världskarta", en: "a world map", contextSv: "avståndet mellan två länder", contextEn: "the distance between two countries", unit: "km" },
            { sv: "en orienteringskarta", en: "an orienteering map", contextSv: "sträckan till nästa kontroll", contextEn: "the distance to the next control", unit: "m" },
            { sv: "en skattkarta", en: "a treasure map", contextSv: "vägen till den begravda kistan", contextEn: "the path to the buried chest", unit: "m" }
        ],
        blueprint: [
            { sv: "en ritning", en: "a blueprint", contextSv: "väggen i vardagsrummet", contextEn: "the living room wall", unit: "m" },
            { sv: "en planlösning", en: "a floor plan", contextSv: "sovrummets längd", contextEn: "the bedroom length", unit: "m" },
            { sv: "en konstruktionsritning", en: "a construction drawing", contextSv: "stålbalken", contextEn: "the steel beam", unit: "m" },
            { sv: "en trädgårdsskiss", en: "a garden sketch", contextSv: "den nya uteplatsen", contextEn: "the new patio", unit: "m" },
            { sv: "en arkitektskiss", en: "an architect's sketch", contextSv: "köksbänkens längd", contextEn: "the kitchen counter length", unit: "m" },
            { sv: "en ritning för ett dockskåp", en: "a dollhouse blueprint", contextSv: "den lilla sängen", contextEn: "the miniature bed", unit: "cm" }
        ],
        microscope: [
            { sv: "ett mikroskop", en: "a microscope", contextSv: "cellen", contextEn: "the cell", unit: "mm" },
            { sv: "en förstoring", en: "an enlargement", contextSv: "lilla insekten", contextEn: "the tiny insect", unit: "mm" },
            { sv: "en detaljbild", en: "a detailed image", contextSv: "microchipet", contextEn: "the microchip", unit: "mm" },
            { sv: "ett laboratorieglas", en: "a laboratory slide", contextSv: "bakterien", contextEn: "the bacteria", unit: "mm" },
            { sv: "ett makrofoto", en: "a macro photo", contextSv: "ögat på en fluga", contextEn: "the eye of a fly", unit: "mm" },
            { sv: "ett biologiskt diagram", en: "a biological diagram", contextSv: "växtfibern", contextEn: "the plant fiber", unit: "mm" }
        ]
    };

    public generate(level: number, lang: string = 'sv', options: any = {}): any {
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
                return this.level5_NoPictures(lang, {});
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

    private level1_Concepts(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'concept_lie', type: 'concept' },
            { key: 'concept_match', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'concept_lie') {
            const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.blueprint);
            const ratio = MathUtils.randomChoice([20, 50, 100, 500]);
            const sLie = lang === 'sv' ? `Bilden visar föremålet i dess verkliga storlek.` : `The image shows the object in its real size.`;
            const sTrue1 = lang === 'sv' ? `Verkligheten är ${ratio} gånger större än bilden.` : `Reality is ${ratio} times larger than the image.`;
            const sTrue2 = lang === 'sv' ? `Detta är en förminskning.` : `This is a reduction.`;

            return {
                renderData: {
                    description: lang === 'sv' ? `På ${scenario.sv} är skalan 1:${ratio}. Vilket påstående är FALSKT?` : `On ${scenario.en}, the scale is 1:${ratio}. Which statement is FALSE?`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle([sLie, sTrue1, sTrue2]),
                    geometry: { type: 'scale_single', label: `1:${ratio}`, shape: 'house' }
                },
                token: this.toBase64(sLie), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Siffran 1 i skalan representerar måttet på ritningen." : "The number 1 in the scale represents the measure on the drawing." },
                    { text: lang === 'sv' ? `Siffran ${ratio} representerar motsvarande mått i verkligheten.` : `The number ${ratio} represents the corresponding measure in reality.` },
                    { text: lang === 'sv' ? `Verkligheten är ${ratio} gånger större än ritningen.` : `Reality is ${ratio} times larger than the drawing.` },
                    { text: lang === 'sv' ? `Svar: ${sLie}` : `Answer: ${sLie}` }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.microscope);
        const ratio = MathUtils.randomChoice([5, 10, 20]);
        const scaleStr = `${ratio}:1`;
        const ans = lang === 'sv' ? `Bilden är ${ratio} gånger större än verkligheten.` : `The image is ${ratio} times larger than reality.`;
        return {
            renderData: {
                description: lang === 'sv' ? `Vad innebär det när ${scenario.sv} har skalan ${scaleStr}?` : `What does it mean when ${scenario.en} has the scale ${scaleStr}?`,
                answerType: 'multiple_choice', options: MathUtils.shuffle([ans, lang === 'sv' ? "Verkligheten är större än bilden." : "Reality is larger than the image."]),
                geometry: { type: 'scale_compare', leftLabel: 'Bild', rightLabel: 'Verklighet', leftValue: ratio, rightValue: 1, shape: 'ladybug' }
            },
            token: this.toBase64(ans), variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "När den första siffran i skalan är störst, handlar det om en förstoring." : "When the first number in the scale is the largest, it is an enlargement." },
                { text: lang === 'sv' ? `Skalan ${ratio}:1 betyder att bilden har förstorat verkligheten ${ratio} gånger.` : `The scale ${ratio}:1 means the image has enlarged reality ${ratio} times.` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 1 }
        };
    }

    private level2_LinearFluency(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'calc_real', type: 'calculate' },
            { key: 'calc_image', type: 'calculate' },
            { key: 'find_scale', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'calc_real') {
            const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.blueprint);
            const scale = MathUtils.randomChoice([10, 20, 50]);
            const imgCm = MathUtils.randomInt(3, 12);
            const ans = imgCm * scale;
            return {
                renderData: {
                    description: lang === 'sv' ? `På ${scenario.sv} i skala 1:${scale} är en sträcka ${imgCm} cm. Hur lång är den i verkligheten?` : `On ${scenario.en} in scale 1:${scale}, a segment is ${imgCm} cm. How long is it in reality?`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Skalan 1:${scale} betyder att verkligheten är ${scale} gånger större.` : `The scale 1:${scale} means reality is ${scale} times larger.` },
                    { text: lang === 'sv' ? "Multiplicera ritningens mått med skalfaktorn." : "Multiply the drawing measure by the scale factor.", latex: `${imgCm} · ${scale} = ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans} cm` : `Answer: ${ans} cm` }
                ],
                metadata: { variation_key: v, difficulty: 2 }
            };
        }

        if (v === 'calc_image') {
            const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.blueprint);
            const scale = MathUtils.randomChoice([20, 50, 100]);
            const imgCm = MathUtils.randomInt(2, 10);
            const realCm = imgCm * scale;
            return {
                renderData: {
                    description: lang === 'sv' ? `En vägg är ${realCm} cm i verkligheten. Hur lång blir den på ${scenario.sv} i skala 1:${scale}?` : `A wall is ${realCm} cm in reality. How long will it be on ${scenario.en} in scale 1:${scale}?`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(imgCm.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Ritningen är ${scale} gånger mindre än verkligheten.` : `The drawing is ${scale} times smaller than reality.` },
                    { text: lang === 'sv' ? "Dividera det verkliga måttet med skalfaktorn." : "Divide the real measure by the scale factor.", latex: `\\frac{${realCm}}{${scale}} = ${imgCm}` },
                    { text: lang === 'sv' ? `Svar: ${imgCm} cm` : `Answer: ${imgCm} cm` }
                ],
                metadata: { variation_key: v, difficulty: 2 }
            };
        }

        const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.microscope);
        const scale = MathUtils.randomChoice([5, 10, 50]);
        const img = MathUtils.randomInt(2, 10);
        const real = img * scale;
        return {
            renderData: {
                description: lang === 'sv' ? `I ${scenario.sv} är ett föremål ${real} mm, men på bilden är det ${img} mm. Vilken skala har bilden?` : `In ${scenario.en} an object is ${real} mm, but in the image it is ${img} mm. What scale does the image have?`,
                answerType: 'text', placeholder: '1:X'
            },
            token: this.toBase64(`1:${scale}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Dividera det verkliga måttet med bildens mått för att få skalfaktorn." : "Divide the real measure by the image measure to find the scale factor.", latex: `\\frac{${real}}{${img}} = ${scale}` },
                { text: lang === 'sv' ? `Eftersom verkligheten är ${scale} gånger större är skalan 1:${scale}.` : `Since reality is ${scale} times larger, the scale is 1:${scale}.` },
                { text: lang === 'sv' ? `Svar: 1:${scale}` : `Answer: 1:${scale}` }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

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
                    { text: lang === 'sv' ? `Beräkna centimeter: ${mapCm} · ${scale} = ${this.formatNum(realCm)} cm.` : `Calculate centimeters: ${mapCm} · ${scale} = ${this.formatNum(realCm)} cm.` },
                    { text: lang === 'sv' ? `Omvandla till meter: ${this.formatNum(realCm)} / 100 = ${this.formatNum(realM)} m.` : `Convert to meters: ${this.formatNum(realCm)} / 100 = ${this.formatNum(realM)} m.` },
                    ...(useKm ? [{ text: lang === 'sv' ? `Omvandla till km: ${this.formatNum(realM)} / 1000 = ${ans} km.` : `Convert to km: ${this.formatNum(realM)} / 1000 = ${ans} km.` }] : []),
                    { text: lang === 'sv' ? `Svar: ${ans} ${unit}` : `Answer: ${ans} ${unit}` }
                ],
                metadata: { variation_key: v, difficulty: 3 }
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
                    description: lang === 'sv' ? `${scenario.sv.charAt(0).toUpperCase() + scenario.sv.slice(1)} är ritad i skala 1:${scale}. I verkligheten är ${scenario.contextSv} ${realM} meter. Hur lång blir den på ritningen? Svara i cm.` : `${scenario.en.charAt(0).toUpperCase() + scenario.en.slice(1)} is drawn in scale 1:${scale}. In reality, ${scenario.contextEn} is ${realM} meters. How long will it be on the drawing? Answer in cm.`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Omvandla verkligheten till cm: ${realM} · 100 = ${realCm} cm.` : `Convert reality to cm: ${realM} · 100 = ${realCm} cm.` },
                    { text: lang === 'sv' ? `Dividera med skalfaktorn: ${realCm} / ${scale} = ${ans} cm.` : `Divide by the scale factor: ${realCm} / ${scale} = ${ans} cm.` },
                    { text: lang === 'sv' ? `Svar: ${ans} cm` : `Answer: ${ans} cm` }
                ],
                metadata: { variation_key: v, difficulty: 3 }
            };
        }

        const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.microscope);
        const scale = MathUtils.randomChoice([20, 50, 100]);
        const realMm = MathUtils.randomChoice([0.1, 0.2, 0.5]);
        const ansMm = realMm * scale;

        return {
            renderData: {
                description: lang === 'sv' ? `I ${scenario.sv} (skala ${scale}:1) är ${scenario.contextSv} ${realMm.toString().replace('.', ',')} mm. Hur lång är den på bilden?` : `In ${scenario.en} (scale ${scale}:1), the ${scenario.contextEn} is ${realMm} mm. How long is it in the image?`,
                answerType: 'numeric', suffix: 'mm'
            },
            token: this.toBase64(ansMm.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Bilden är ${scale} gånger större än verkligheten.` : `The image is ${scale} times larger than reality.` },
                { text: lang === 'sv' ? `Multiplicera: ${realMm} · ${scale} = ${ansMm} mm.` : `Multiply: ${realMm} · ${scale} = ${ansMm} mm.` },
                { text: lang === 'sv' ? `Svar: ${ansMm} mm` : `Answer: ${ansMm} mm` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    private level4_DetermineScale(lang: string, variationKey?: string, options: any = {}): any {
        const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.blueprint);
        const ratio = MathUtils.randomChoice([20, 50, 100, 200]);
        const imgCm = MathUtils.randomInt(2, 8);
        const realM = (imgCm * ratio) / 100;
        const v = variationKey || 'determine_reduction';

        return {
            renderData: {
                description: lang === 'sv' ? `${scenario.contextSv.charAt(0).toUpperCase() + scenario.contextSv.slice(1)} är ${realM.toString().replace('.', ',')} m. På ${scenario.sv} är den ${imgCm} cm. Vilken skala har använts?` : `${scenario.contextEn.charAt(0).toUpperCase() + scenario.contextEn.slice(1)} is ${realM} m. On ${scenario.en} it is ${imgCm} cm. What scale was used?`,
                answerType: 'text', placeholder: '1:X'
            },
            token: this.toBase64(`1:${ratio}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Gör om till samma enhet: ${realM} m = ${realM * 100} cm.` : `Convert to the same unit: ${realM} m = ${realM * 100} cm.` },
                { text: lang === 'sv' ? `Beräkna skalfaktorn: ${realM * 100} / ${imgCm} = ${ratio}.` : `Calculate scale factor: ${realM * 100} / ${imgCm} = ${ratio}.` },
                { text: lang === 'sv' ? `Svar: 1:${ratio}` : `Answer: 1:${ratio}` }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    private level5_NoPictures(lang: string, options: any): any {
        const res = this.level3_MixedScenarios(lang, undefined, options);
        res.renderData.geometry = null; 
        
        if (!res.metadata) res.metadata = {};
        res.metadata.variation_key = 'word_problem';
        res.metadata.difficulty = 5;
        
        return res;
    }

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
                    { text: lang === 'sv' ? `Areaskalan är ${largeA} / ${smallA} = ${sq}.` : `The area scale is ${largeA} / ${smallA} = ${sq}.` },
                    { text: lang === 'sv' ? `Längdskalan är kvadratroten ur areaskalan: √${sq} = ${L}.` : `The length scale is the square root of the area scale: √${sq} = ${L}.` },
                    { text: lang === 'sv' ? `Svar: 1:${L}` : `Answer: 1:${L}` }
                ],
                metadata: { variation_key: v, difficulty: 6 }
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
                    { text: lang === 'sv' ? `Areaskalan är längdskalan i kvadrat: ${L}² = ${sq}.` : `The area scale is the length scale squared: ${L}² = ${sq}.` },
                    { text: lang === 'sv' ? `Verkligheten är ${sq} gånger större: ${smallA} · ${sq} = ${largeA}.` : `Reality is ${sq} times larger: ${smallA} · ${sq} = ${largeA}.` },
                    { text: lang === 'sv' ? `Svar: ${largeA} cm²` : `Answer: ${largeA} cm²` }
                ],
                metadata: { variation_key: v, difficulty: 6 }
            };
        }

        const ansMC = lang === 'sv' ? `${sq} gånger större` : `${sq} times larger`;
        return {
            renderData: {
                description: lang === 'sv' ? `Om längden på alla sidor i en figur dubbleras (längdskala 1:${L}), vad händer då med arean?` : `If the length of all sides in a figure is doubled (length scale 1:${L}), what happens to the area?`,
                answerType: 'multiple_choice', options: MathUtils.shuffle([ansMC, lang === 'sv' ? `${L} gånger större` : `${L} times larger`, lang === 'sv' ? `${L*2} gånger större` : `${L*2} times larger`]),
                geometry: { type: 'compare_shapes_area', shapeType: 'square', left: { area: 1 }, right: { area: sq } }
            },
            token: this.toBase64(ansMC), variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Areaskalan är alltid längdskalan i kvadrat." : "The area scale is always the length scale squared." },
                { text: lang === 'sv' ? `Areaskalan = ${L}² = ${sq}.` : `Area scale = ${L}² = ${sq}.` },
                { text: lang === 'sv' ? `Svar: ${ansMC}` : `Answer: ${ansMC}` }
            ],
            metadata: { variation_key: v, difficulty: 6 }
        };
    }

    private level7_Mixed(lang: string, options: any): any {
        const subLevel = MathUtils.randomInt(1, 6);
        return this.generate(subLevel, lang, options);
    }
}