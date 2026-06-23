import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

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
        // Adaptive Jump: Skip concepts if master option is requested
        if (level === 1 && options.hideConcept) {
            return this.level2_LinearFluency(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_Concepts(lang, undefined, options); break;
            case 2: questionData = this.level2_LinearFluency(lang, undefined, options); break;
            case 3: questionData = this.level3_MixedScenarios(lang, undefined, options); break;
            case 4: questionData = this.level4_DetermineScale(lang, undefined, options); break;
            case 5: questionData = this.level5_NoPictures(lang, options); break;
            case 6: questionData = this.level6_AreaScaleDeep(lang, undefined, options); break;
            default: questionData = this.level1_Concepts(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [2, 3, 4, 5, 6];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
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
            const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.microscope);
            // expansion of scale ratios
            const ratio = MathUtils.randomChoice([2, 4, 5, 8, 10, 15, 20, 25, 40, 50, 100]);
            const scaleStr = `${ratio}:1`;
            
            // 🟢 Add Text Variety to the Lies so they aren't always the same sentence!
            const lies = lang === 'sv' ? [
                `Bilden visar föremålet i dess verkliga storlek.`,
                `Verkligheten är ${ratio} gånger mindre än bilden.`,
                `Detta är en förstoring.`
            ] : [
                `The image shows the object in its real size.`,
                `Reality is ${ratio} times smaller than the image.`,
                `This is an enlargement.`
            ];
            const sLie = MathUtils.randomChoice(lies);
            
            const sTrue1 = lang === 'sv' ? `Verkligheten är ${ratio} gånger större än bilden.` : `Reality is ${ratio} times larger than the image.`;
            const sTrue2 = lang === 'sv' ? `Detta är en förminskning.` : `This is a reduction.`;

            return {
                renderData: {
                    description: lang === 'sv' ? `På ${scenario.sv} är skalan 1:${ratio}. Vilket påstående stämmer INTE?` : `On ${scenario.en}, the scale is 1:${ratio}. Which statement is FALSE?`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle([sLie, sTrue1, sTrue2]),
                    geometry: { type: 'scale_single', label: `1:${ratio}`, shape: 'house' }
                },
                token: this.toBase64(sLie), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? `Skalan 1:${ratio} betyder att 1 cm på ritningen motsvarar hela ${ratio} cm ute i verkligheten.` : `The scale 1:${ratio} means that 1 cm on the drawing corresponds to a full ${ratio} cm out in reality.`, 
                        latex: `1 \\text{ cm på bilden} = ${ratio} \\text{ cm i verkligheten}` 
                    },
                    { 
                        text: lang === 'sv' ? `Det betyder att verkligheten är mycket större, närmare bestämt exakt ${ratio} gånger större än ritningen.` : `This means reality is much larger, more specifically exactly ${ratio} times larger than the drawing.`, 
                        latex: `\\text{Verklighet} = \\text{Bild} \\cdot \\mathbf{${ratio}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom ritningen är en krympt version, blir påståendet att "bilden visar föremålet i dess verkliga storlek" helt felaktigt.` : `Since the drawing is a shrunken version, stating that "the image shows the object in its real size" is completely false.`, 
                        latex: `\\mathbf{\\text{Felaktigt: } ${sLie}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${sLie}` : `Answer: ${sLie}`, latex: `\\text{${sLie}}` }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        // Fallback for concept_match
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
                { 
                    text: lang === 'sv' ? `När den stora siffran står FÖRST i skalan (${scaleStr}) betyder det att vi tittar på en förstoring.` : `When the large number stands FIRST in the scale (${scaleStr}), it means we are looking at an enlargement.`, 
                    latex: `\\mathbf{${ratio}} : 1` 
                },
                { 
                    text: lang === 'sv' ? `Skalan berättar att ${ratio} cm på bilden i själva verket bara är en enda liten ensam centimeter (1 cm) ute i verkligheten.` : `The scale tells us that ${ratio} cm in the picture is actually just one single tiny centimeter (1 cm) out in reality.`, 
                    latex: `${ratio} \\text{ cm på bilden} = 1 \\text{ cm i verkligheten}` 
                },
                { 
                    text: lang === 'sv' ? `Det betyder att linsen har blåst upp bilden så att den har blivit exakt ${ratio} gånger större än vad föremålet är på riktigt.` : `This means the lens has blown up the image so that it has become exactly ${ratio} times larger than what the object really is.`, 
                    latex: `\\text{Bild} = \\text{Verklighet} \\cdot \\mathbf{${ratio}}` 
                },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, latex: `\\text{${ans}}` }
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
            const scale = MathUtils.randomChoice([10, 15, 20, 25, 40, 50, 100, 150, 200]);
            const imgCm = MathUtils.randomInt(2, 25);
            const ans = imgCm * scale;
            return {
                renderData: {
                    description: lang === 'sv' ? `På ${scenario.sv} i skala 1:${scale} är en sträcka ${imgCm} cm. Hur lång är den i verkligheten?` : `On ${scenario.en} in scale 1:${scale}, a segment is ${imgCm} cm. How long is it in reality?`,
                    interceptorToken: `${scale} ; ${imgCm} ; ${ans}`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Skalan 1:${scale} betyder att allting är förminskat på papperet. Verkligheten är i själva verket ${scale} gånger större.` : `The scale 1:${scale} means everything is shrunk on the paper. Reality is actually ${scale} times larger.`, 
                        latex: `1 : ${scale}` 
                    },
                    { 
                        text: lang === 'sv' ? `För att förstora upp kartans mått till verklig storlek tar vi bildens centimeter (${imgCm}) och gångrar med ${scale}.` : `To enlarge the map's measurement to real size, take the image centimeters (${imgCm}) and multiply by ${scale}.`, 
                        latex: `\\text{Verklig längd} = ${imgCm} \\cdot \\mathbf{${scale}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut multiplikationen för att bestämma det verkliga måttet." : "Calculate the multiplication to determine the real measurement.", 
                        latex: `\\text{Verklig längd} = \\mathbf{${ans}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${ans} cm` : `Answer: ${ans} cm`, latex: `${ans}` }
                ],
                metadata: { variation_key: v, difficulty: 2 }
            };
        }

        if (v === 'calc_image') {
            const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.blueprint);
            const scale = MathUtils.randomChoice([10, 20, 25, 40, 50, 100, 200, 250, 400, 500]);
            const imgCm = MathUtils.randomInt(2, 25);
            const realCm = imgCm * scale;
            return {
                renderData: {
                    description: lang === 'sv' ? `En vägg är ${realCm} cm i verkligheten. Hur lång blir den på ${scenario.sv} i skala 1:${scale}?` : `A wall is ${realCm} cm in reality. How long will it be on ${scenario.en} in scale 1:${scale}?`,
                    interceptorToken: `${scale} ; ${realCm} ; ${imgCm}`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(imgCm.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Skalan 1:${scale} betyder att ritningen ska krympas. Den ska göras exakt ${scale} gånger mindre än verkligheten.` : `The scale 1:${scale} means the drawing should be shrunk. It must be made exactly ${scale} times smaller than reality.`, 
                        latex: `1 : ${scale}` 
                    },
                    { 
                        text: lang === 'sv' ? `För att krympa ner det verkliga måttet (${realCm} cm) till ritningen delar (dividerar) vi med ${scale}.` : `To shrink the real measurement (${realCm} cm) down for the drawing, divide by ${scale}.`, 
                        latex: `\\text{Längd på ritning} = \\frac{${realCm}}{\\mathbf{${scale}}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut divisionen för att få fram hur lång sträckan blir på papperet." : "Calculate the division to find how long the segment will be on the paper.", 
                        latex: `\\text{Längd på ritning} = \\mathbf{${imgCm}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${imgCm} cm` : `Answer: ${imgCm} cm`, latex: `${imgCm}` }
                ],
                metadata: { variation_key: v, difficulty: 2 }
            };
        }

        const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.microscope);
        const scale = MathUtils.randomChoice([2, 4, 5, 10, 15, 20, 25, 40, 50, 100]);
        const img = MathUtils.randomInt(2, 20);
        const real = img * scale;
        return {
            renderData: {
                description: lang === 'sv' ? `I ${scenario.sv} är ett föremål ${real} mm, men på bilden är det ${img} mm. Vilken skala har bilden?` : `In ${scenario.en} an object is ${real} mm, but in the image it is ${img} mm. What scale does the image have?`,
                interceptorToken: `${real} ; ${img} ; ${scale}`,
                answerType: 'text', placeholder: '1:X'
            },
            token: this.toBase64(`1:${scale}`), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "För att hitta hur mycket bilden har krympts kollar vi hur många gånger större verkligheten är jämfört med bilden. Vi delar det verkliga måttet med bildens mått." : "To find out how much the image was shrunk, we check how many times larger reality is compared to the image. Divide the real measurement by the image measurement.", 
                    latex: `\\text{Hur mycket större} = \\frac{\\text{Verklighet}}{\\text{Bild}}` 
                },
                { 
                    text: lang === 'sv' ? `Sätt in måtten: ta verkliga ${real} mm delat med bildens ${img} mm.` : `Insert the measurements: take real ${real} mm divided by the image's ${img} mm.`, 
                    latex: `\\text{Hur mycket större} = \\frac{${real}}{\\mathbf{${img}}} = \\mathbf{${scale}}` 
                },
                { 
                    text: lang === 'sv' ? `Eftersom verkligheten är exakt ${scale} gånger större än bilden, skriver vi skalan som 1:${scale}.` : `Since reality is exactly ${scale} times larger than the image, we write the scale as 1:${scale}.`, 
                    latex: `\\text{Skala} = \\mathbf{1 : ${scale}}` 
                },
                { text: lang === 'sv' ? `Svar: 1:${scale}` : `Answer: 1:${scale}`, latex: `1:${scale}` }
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
            const scale = MathUtils.randomChoice([5000, 10000, 20000, 25000, 40000, 50000, 100000, 200000, 250000, 500000]);
            const mapCm = MathUtils.randomInt(2, 30);
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
                    interceptorToken: `${scale} ; ${mapCm} ; ${ans}`,
                    answerType: 'numeric', suffix: unit
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Skala 1:${this.formatNum(scale)} betyder att verkligheten är ${this.formatNum(scale)} gånger större än på kartan. Vi börjar med att räkna ut måttet i centimeter.` : `Scale 1:${this.formatNum(scale)} means reality is ${this.formatNum(scale)} times larger than on the map. Let's start by calculating the measurement in centimeters.`, 
                        latex: `\\text{Verkliga cm} = ${mapCm} \\cdot \\mathbf{${scale}} = \\mathbf{${this.formatNum(realCm)}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom ${this.formatNum(realCm)} cm är ett jättestort tal, gör vi om det till meter genom att dela med 100 (det går 100 cm på en meter).` : `Since ${this.formatNum(realCm)} cm is a huge number, let's convert it to meters by dividing by 100 (there are 100 cm in a meter).`, 
                        latex: `\\text{Verkliga meter} = \\frac{${this.formatNum(realCm)}}{\\mathbf{100}} = \\mathbf{${this.formatNum(realM)}} \\text{ m}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom uppgiften ber om kilometer, gör vi om mätartalet till km genom att dela med 1 000 (det går 1 000 meter på en kilometer).` : `Since the problem asks for kilometers, convert the meters to km by dividing by 1,000 (there are 1,000 meters in a kilometer).`, 
                        latex: `\\text{Verkliga km} = \\frac{${this.formatNum(realM)}}{\\mathbf{1000}} = \\mathbf{${ans}} \\text{ km}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans} ${unit}` : `Answer: ${ans} ${unit}`, 
                        latex: `${ans}` 
                    }
                ],
                metadata: { variation_key: v, difficulty: 3 }
            };
        }

        if (v === 'blueprint_draw') {
            const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.blueprint);
            const scale = MathUtils.randomChoice([20, 25, 40, 50, 100, 200]);
            const ans = MathUtils.randomInt(4, 30); // the image cm
            const realCm = ans * scale;
            const realM = realCm / 100;

            return {
                renderData: {
                    description: lang === 'sv' ? `${scenario.sv.charAt(0).toUpperCase() + scenario.sv.slice(1)} är ritad i skala 1:${scale}. I verkligheten är ${scenario.contextSv} ${realM} meter. Hur lång blir den på ritningen? Svara i cm.` : `${scenario.en.charAt(0).toUpperCase() + scenario.en.slice(1)} is drawn in scale 1:${scale}. In reality, ${scenario.contextEn} is ${realM} meters. How long will it be on the drawing? Answer in cm.`,
                    interceptorToken: `${scale} ; ${realM} ; ${ans}`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Eftersom skalan mäts i centimeter och vi har ${realM} meter, börjar vi med att göra om metrarna till centimeter (gånger 100).` : `Since the scale is used with centimeters and we have ${realM} meters, let's start by converting meters into centimeters (multiply by 100).`, 
                        latex: `\\text{Verkliga cm} = ${realM} \\cdot \\mathbf{100} = \\mathbf{${realCm}}` 
                    },
                    { 
                        text: lang === 'sv' ? `För att krympa ner de ${realCm} centimetrarna till ritningen delar vi med skalan ${scale}.` : `To shrink the ${realCm} centimeters down for the drawing, divide by the scale factor ${scale}.`, 
                        latex: `\\text{Längd på ritning} = \\frac{${realCm}}{\\mathbf{${scale}}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Utför divisionen för att få fram det slutgiltiga svaret." : "Perform the division to reach your final answer.", 
                        latex: `\\text{Längd på ritning} = \\mathbf{${ans}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${ans} cm` : `Answer: ${ans} cm`, latex: `${ans}` }
                ],
                metadata: { variation_key: v, difficulty: 3 }
            };
        }

        const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.microscope);
        const scaleOptions = [10, 20, 25, 40, 50, 100, 200, 250, 400, 500];
        const scale = MathUtils.randomChoice(scaleOptions);
        
        const realMmOptions = [0.1, 0.2, 0.3, 0.4, 0.5, 0.8, 1.2, 1.5, 2.5];
        const validMm = realMmOptions.filter(m => (m * scale) % 1 === 0);
        const realMm = MathUtils.randomChoice(validMm.length > 0 ? validMm : [0.5]);
        const ansMm = realMm * scale;

        return {
            renderData: {
                description: lang === 'sv' ? `I ${scenario.sv} (skala ${scale}:1) är ${scenario.contextSv} ${realMm.toString().replace('.', ',')} mm. Hur lång är den på bilden?` : `In ${scenario.en} (scale ${scale}:1), the ${scenario.contextEn} is ${realMm} mm. How long is it in the image?`,
                interceptorToken: `${scale} ; ${realMm} ; ${ansMm}`,
                answerType: 'numeric', suffix: 'mm'
            },
            token: this.toBase64(ansMm.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Skalan ${scale}:1 med det stora talet först betyder att det här är en jättestor förstoring. Bilden ska göras ${scale} gånger STÖRRE än verkligheten.` : `The scale ${scale}:1 with the large number first means this is a huge enlargement. The image must be made ${scale} times LARGER than reality.`, 
                    latex: `${scale} : 1` 
                },
                { 
                    text: lang === 'sv' ? `Gångra (multiplicera) det pyttelilla verkliga måttet (${realMm.toString().replace('.', ',')} mm) med förstoringsfaktorn ${scale}.` : `Multiply the tiny real measurement (${realMm} mm) by the enlargement factor ${scale}.`, 
                    latex: `\\text{Längd på bild} = ${realMm} \\cdot \\mathbf{${scale}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut gångertalet för att bestämma bildens mått." : "Calculate the multiplication to determine the image measurement.", 
                    latex: `\\text{Längd på bild} = \\mathbf{${ansMm}}` 
                },
                { text: lang === 'sv' ? `Svar: ${ansMm} mm` : `Answer: ${ansMm} mm`, latex: `${ansMm}` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    private level4_DetermineScale(lang: string, variationKey?: string, options: any = {}): any {
        const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.blueprint);
        const ratio = MathUtils.randomChoice([10, 20, 25, 40, 50, 100, 200, 250, 400, 500]);
        const imgCm = MathUtils.randomInt(2, 25);
        const realM = (imgCm * ratio) / 100;
        const v = variationKey || 'determine_reduction';

        return {
            renderData: {
                description: lang === 'sv' ? `${scenario.contextSv.charAt(0).toUpperCase() + scenario.contextSv.slice(1)} är ${realM.toString().replace('.', ',')} m. På ${scenario.sv} är den ${imgCm} cm. Vilken skala har använts?` : `${scenario.contextEn.charAt(0).toUpperCase() + scenario.contextEn.slice(1)} is ${realM} m. On ${scenario.en} it is ${imgCm} cm. What scale was used?`,
                answerType: 'text', placeholder: '1:X'
            },
            token: this.toBase64(`1:${ratio}`), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Vi måste ha samma enhet på båda måtten för att kunna jämföra dem. Gör först om de verkliga metrarna (${realM.toString().replace('.', ',')} m) till centimeter (gånger 100).` : `We must have the same unit on both measurements to compare them. First, convert the real meters (${realM} m) into centimeters (multiply by 100).`, 
                    latex: `\\text{Verkliga cm} = ${realM} \\cdot \\mathbf{100} = \\mathbf{${realM * 100}}` 
                },
                { 
                    text: lang === 'sv' ? `Kolla nu hur många gånger större verkligheten är jämfört med papperet genom att dela de verkliga centimetrarna (${realM * 100}) med bildens centimeter (${imgCm}).` : `Now see how many times larger reality is compared to the paper by dividing the real centimeters (${realM * 100}) by the image centimeters (${imgCm}).`, 
                    latex: `\\text{Hur mycket större} = \\frac{${realM * 100}}{\\mathbf{${imgCm}}} = \\mathbf{${ratio}}` 
                },
                { 
                    text: lang === 'sv' ? `Eftersom verkligheten är exakt ${ratio} gånger större, blir skalan 1:${ratio}.` : `Since reality is exactly ${ratio} times larger, the scale is 1:${ratio}.`, 
                    latex: `\\text{Skala} = \\mathbf{1 : ${ratio}}` 
                },
                { text: lang === 'sv' ? `Svar: 1:${ratio}` : `Answer: 1:${ratio}`, latex: `1:${ratio}` }
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

        const L = MathUtils.randomChoice([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]);
        const sq = L * L;
        const smallA = MathUtils.randomInt(2, 50);
        const largeA = smallA * sq;

        if (v === 'area_reverse') {
            return {
                renderData: {
                    description: lang === 'sv' ? `En liten figur har arean ${smallA} cm². En förstoring av samma figur har arean ${largeA} cm². Vilken är längdskalan?` : `A small figure has an area of ${smallA} cm². An enlargement of the same figure has an area of ${largeA} cm². What is the length scale?`,
                    interceptorToken: `${smallA} ; ${largeA} ; ${L}`,
                    answerType: 'text', placeholder: '1:X'
                },
                token: this.toBase64(`1:${L}`), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Börja med att ta reda på hur många gånger större YTRAN (arean) har blivit. Dela den stora arean (${largeA}) med den lilla arean (${smallA}).` : `Start by finding out how many times larger the SURFACE (area) has become. Divide the large area (${largeA}) by the small area (${smallA}).`, 
                        latex: `\\text{Yt-förstoring} = \\frac{${largeA}}{\\mathbf{${smallA}}} = \\mathbf{${sq}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom ytan växer i två riktningar (både på bredden och höjden), är längdskalan kvadratroten (√) ur yt-förstoringen.` : `Since the surface grows in two directions (both width and height), the length scale is the square root (√) of the surface enlargement rate.`, 
                        latex: `\\text{Längdskala} = \\sqrt{${sq}} = \\mathbf{${L}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom längden på sidorna är ${L} gånger större, skriver vi skalan som 1:${L}.` : `Since the length of the sides is ${L} times larger, we write the scale as 1:${L}.`, 
                        latex: `\\text{Skala} = \\mathbf{1 : ${L}}` 
                    },
                    { text: lang === 'sv' ? `Svar: 1:${L}` : `Answer: 1:${L}`, latex: `1:${L}` }
                ],
                metadata: { variation_key: v, difficulty: 6 }
            };
        }

        if (v === 'area_calc_large') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Längdskalan är 1:${L}. En rektangel har arean ${smallA} cm² på bilden. Hur stor är dess verkliga area?` : `The length scale is 1:${L}. A rectangle has an area of ${smallA} cm² in the image. How large is its real area?`,
                    interceptorToken: `${L} ; ${smallA} ; ${largeA}`,
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(largeA.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Se upp! Skalan 1:${L} gäller bara för raka sträckor (längder). Eftersom vi räknar på yta (area) måste skalan gångras med sig själv.` : `Watch out! The scale 1:${L} only applies to straight segments (lengths). Since we are calculating surface space (area), the scale must be multiplied by itself.`, 
                        latex: `\\text{Yt-skala} = ${L}^2 = ${L} \\cdot ${L} = \\mathbf{${sq}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Det betyder att den verkliga ytan är hela ${sq} gånger större än ytan på bilden. Gångra bildens area (${smallA}) med ${sq}.` : `This means that the real surface is a full ${sq} times larger than the surface in the image. Multiply the image area (${smallA}) by ${sq}.`, 
                        latex: `\\text{Verklig area} = ${smallA} \\cdot \\mathbf{${sq}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut multiplikationen för att bestämma den verkliga arean." : "Calculate the multiplication to determine the final real area.", 
                        latex: `\\text{Verklig area} = \\mathbf{${largeA}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${largeA} cm²` : `Answer: ${largeA} cm²`, latex: `${largeA}` }
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
                { 
                    text: lang === 'sv' ? `När sidorna blir ${L} gånger längre, växer ytan (arean) åt två håll samtidigt: både på bredden och på höjden.` : `When the sides become ${L} times longer, the surface space (area) grows in two directions simultaneously: both in width and in height.`, 
                    latex: `\\text{Ytan växer} = \\text{längd} \\cdot \\text{bredd}` 
                },
                { 
                    text: lang === 'sv' ? `Därför blir ytan alltid längdskalan upphöjt till 2. Vi tar ${L} gånger sig självt.` : `Therefore, the surface always equals the length scale raised to the power of 2. We multiply ${L} by itself.`, 
                    latex: `\\text{Ytan blir} = ${L}^2 = ${L} \\cdot ${L} = \\mathbf{${sq} \\text{ gånger större}}` 
                },
                { text: lang === 'sv' ? `Svar: ${ansMC}` : `Answer: ${ansMC}`, latex: `\\text{${ansMC}}` }
            ],
            metadata: { variation_key: v, difficulty: 6 }
        };
    }

    private level7_Mixed(lang: string, options: any): any {
        const subLevel = MathUtils.randomInt(1, 6);
        return this.generate(subLevel, lang, options);
    }
}