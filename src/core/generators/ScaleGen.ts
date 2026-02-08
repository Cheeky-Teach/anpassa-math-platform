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

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
     */
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

    // --- HELPERS ---
    
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
             const correctStatement = lang === 'sv' 
                ? `Verkligheten är ${scale} gånger större än vad bilden visar.` 
                : `Reality is ${scale} times larger than what the image shows.`;
             const falseStatement = lang === 'sv'
                ? `Bilden är ritad i naturlig storlek (skala 1:1).`
                : `The image is drawn in natural size (scale 1:1).`;
             const trivialStatement = lang === 'sv'
                ? `Skalan 1:${scale} innebär en förminskning av verkligheten.`
                : `The scale 1:${scale} represents a reduction of reality.`;

             const options = MathUtils.shuffle([correctStatement, falseStatement, trivialStatement]);
             
             return {
                renderData: {
                    description: lang === 'sv' ? `Studera skalan 1:${scale}. Vilket av följande påståenden är FALSKT?` : `Study the scale 1:${scale}. Which of the following statements is FALSE?`,
                    answerType: 'multiple_choice',
                    options: options,
                    geometry: { type: 'scale_single', label: `1:${scale}`, shape: 'map' }
                },
                token: this.toBase64(falseStatement),
                clues: [{ text: lang === 'sv' ? `En skala på 1:${scale} betyder att 1 cm på bilden motsvarar ${scale} cm i verkligheten.` : `A scale of 1:${scale} means that 1 cm in the image corresponds to ${scale} cm in reality.` }],
                metadata: { variation_key: 'concept_lie', difficulty: 1 }
             };
        }

        const isReduction = Math.random() > 0.5;
        const ratio = MathUtils.randomChoice([5, 10, 20, 50]);
        const scaleStr = isReduction ? `1:${ratio}` : `${ratio}:1`;
        
        const correct = isReduction 
            ? (lang === 'sv' ? `Verkligheten är ${ratio} gånger större än bilden.` : `Reality is ${ratio} times larger than the image.`)
            : (lang === 'sv' ? `Bilden är ${ratio} gånger större än verkligheten.` : `The image is ${ratio} times larger than reality.`);
        
        const wrong = isReduction
            ? (lang === 'sv' ? `Bilden är ${ratio} gånger större än verkligheten.` : `The image is ${ratio} times larger than reality.`)
            : (lang === 'sv' ? `Verkligheten är ${ratio} gånger större än bilden.` : `Reality is ${ratio} times larger than the image.`);

        return {
            renderData: {
                description: lang === 'sv' ? `Vad innebär det att en bild är ritad i skalan ${scaleStr}?` : `What does it mean if an image is drawn in the scale ${scaleStr}?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([correct, wrong, lang === 'sv' ? "Bilden och verkligheten är exakt lika stora." : "The image and reality are exactly the same size."]),
                geometry: { 
                    type: 'scale_compare', 
                    leftLabel: lang === 'sv' ? 'Bild' : 'Image', 
                    rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                    leftValue: isReduction ? 1 : ratio,
                    rightValue: isReduction ? ratio : 1,
                    shape: 'arrow'
                }
            },
            token: this.toBase64(correct),
            clues: [{ text: lang === 'sv' ? "Siffran 1 representerar alltid bilden/ritningen. Det andra talet visar förhållandet till verkligheten." : "The number 1 always represents the image/drawing. The other number shows the relationship to reality." }],
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
                    description: lang === 'sv' 
                        ? `En modell är byggd i skala 1:${scale}. På modellen mäts en längd till ${imgCm} cm. Hur lång är motsvarande del i verkligheten?`
                        : `A model is built in scale 1:${scale}. On the model, a length measures ${imgCm} cm. How long is the corresponding part in reality?`,
                    answerType: 'numeric', suffix: 'cm',
                    geometry: { type: 'scale_compare', leftLabel: 'Modell', rightLabel: 'Verklighet', leftValue: 1, rightValue: scale, shape }
                },
                token: this.toBase64(ans.toString()),
                clues: [{ text: lang === 'sv' ? `Eftersom skalan är en förminskning (1:${scale}), är verkligheten ${scale} gånger större än modellen.` : `Since the scale is a reduction (1:${scale}), reality is ${scale} times larger than the model.`, latex: `${imgCm} \\cdot ${scale} = ${ans}` }],
                metadata: { variation_key: 'calc_real', difficulty: 2 }
            };
        }

        if (v === 'calc_image') {
            const scale = MathUtils.randomChoice([10, 20, 50, 100]);
            const imgCm = MathUtils.randomInt(3, 10);
            const realCm = imgCm * scale;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Ett föremål är ${realCm} cm långt i verkligheten. Hur långt blir föremålet på en ritning som är gjord i skala 1:${scale}?`
                        : `An object is ${realCm} cm long in reality. How long will the object be on a drawing made in scale 1:${scale}?`,
                    answerType: 'numeric', suffix: 'cm',
                    geometry: { type: 'scale_compare', leftLabel: 'Ritning', rightLabel: 'Verklighet', leftValue: 1, rightValue: scale, shape: 'house' }
                },
                token: this.toBase64(imgCm.toString()),
                clues: [{ text: lang === 'sv' ? `På ritningen blir föremålet ${scale} gånger mindre än i verkligheten. Dela verklighetens längd med skalan.` : `On the drawing, the object becomes ${scale} times smaller than in reality. Divide the real length by the scale.`, latex: `\\frac{${realCm}}{${scale}} = ${imgCm}` }],
                metadata: { variation_key: 'calc_image', difficulty: 2 }
            };
        }

        if (v === 'find_scale') {
            const scale = MathUtils.randomChoice([2, 5, 10, 20, 50]);
            const imgCm = MathUtils.randomInt(2, 10);
            const realCm = imgCm * scale;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `En detalj på en bild är ${imgCm} cm. Samma detalj är ${realCm} cm i verkligheten. Vilken skala är bilden ritad i?`
                        : `A detail in an image is ${imgCm} cm. The same detail is ${realCm} cm in reality. In what scale is the image drawn?`,
                    answerType: 'text', placeholder: '1:X',
                    geometry: { type: 'scale_single', label: '?', shape: 'magnifying_glass' }
                },
                token: this.toBase64(`1:${scale}`),
                clues: [{ text: lang === 'sv' ? "Ta reda på hur många gånger större verkligheten är genom att dividera dess längd med bildens längd." : "Find out how many times larger reality is by dividing its length by the image length.", latex: `\\frac{${realCm}}{${imgCm}} = ${scale}` }],
                metadata: { variation_key: 'find_scale', difficulty: 2 }
            };
        }

        // Magnification (X:1)
        const scale = MathUtils.randomChoice([5, 10, 20]);
        const realMm = MathUtils.randomInt(2, 8);
        const imgMm = realMm * scale;
        
        return {
            renderData: {
                description: lang === 'sv'
                    ? `En liten insekt har förstorats i skala ${scale}:1. På bilden är insekten ${imgMm} mm lång. Hur lång är den i verkligheten?`
                    : `A small insect has been magnified in scale ${scale}:1. In the picture, the insect is ${imgMm} mm long. How long is it in reality?`,
                answerType: 'numeric', suffix: 'mm',
                geometry: { type: 'scale_compare', leftLabel: 'Bild', rightLabel: 'Verklighet', leftValue: scale, rightValue: 1, shape: 'ladybug' }
            },
            token: this.toBase64(realMm.toString()),
            clues: [{ text: lang === 'sv' ? `Skalan ${scale}:1 innebär att bilden är ${scale} gånger större än verkligheten. Dela bildens längd med skalan.` : `The scale ${scale}:1 means the image is ${scale} times larger than reality. Divide the image length by the scale.`, latex: `\\frac{${imgMm}}{${scale}} = ${realMm}` }],
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
            const unit = useKm ? (lang === 'sv' ? 'km' : 'km') : (lang === 'sv' ? 'm' : 'm');

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `På ${scenario.sv} i skala 1:${this.formatNum(scale)} mäts ${scenario.contextSv} till ${mapCm} cm. Hur långt är detta i verkligheten?`
                        : `On ${scenario.en} in scale 1:${this.formatNum(scale)}, ${scenario.contextEn} measures ${mapCm} cm. How long is this in reality?`,
                    answerType: 'numeric', suffix: unit
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Räkna först ut avståndet i centimeter.` : `First calculate the distance in centimeters.`, latex: `${mapCm} \\cdot ${scale} = ${this.formatNum(realCm)} \\text{ cm}` },
                    { text: lang === 'sv' ? `Omvandla sedan från cm till ${unit}.` : `Then convert from cm to ${unit}.`, latex: useKm ? `\\frac{${realCm}}{100\\,000} = ${ans}` : `\\frac{${realCm}}{100} = ${ans}` }
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
                    description: lang === 'sv'
                        ? `${scenario.sv.charAt(0).toUpperCase() + scenario.sv.slice(1)} är ritad i skala 1:${scale}. I verkligheten är ${scenario.contextSv} ${realM} m. Hur lång blir den på ritningen?`
                        : `${scenario.en.charAt(0).toUpperCase() + scenario.en.slice(1)} is drawn in scale 1:${scale}. In reality, ${scenario.contextEn} is ${realM} m. How long will it be on the drawing?`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Gör först om verklighetens meter till centimeter." : "First convert the real meters to centimeters.", latex: `${realM} \\cdot 100 = ${realM * 100} \\text{ cm}` },
                    { text: lang === 'sv' ? `Dela sedan med skalan ${scale} för att få ritningens mått.` : `Then divide by the scale ${scale} to get the drawing's dimension.`, latex: `\\frac{${realM * 100}}{${scale}} = ${ans}` }
                ],
                metadata: { variation_key: 'blueprint_draw', difficulty: 3 }
            };
        }

        if (v === 'microscope_calc') {
            const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.microscope);
            const scale = MathUtils.randomChoice([10, 50, 100]);
            const realMm = MathUtils.randomChoice([0.1, 0.2, 0.5, 2]);
            const ansMm = realMm * scale;
            const ans = ansMm >= 10 ? ansMm / 10 : ansMm;
            const unit = ansMm >= 10 ? 'cm' : 'mm';

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `I ${scenario.sv} som har skalan ${scale}:1 är ${scenario.contextSv} ${realMm.toString().replace('.', ',')} mm lång i verkligheten. Hur lång är den på bilden?`
                        : `In ${scenario.en} which has the scale ${scale}:1, ${scenario.contextEn} is ${realMm} mm long in reality. How long is it in the image?`,
                    answerType: 'numeric', suffix: unit
                },
                token: this.toBase64(ans.toString()),
                clues: [{ text: lang === 'sv' ? `Multiplicera verklighetens längd med förstoringsfaktorn ${scale}.` : `Multiply the real length by the magnification factor ${scale}.`, latex: `${realMm} \\cdot ${scale} = ${ansMm} \\text{ mm}` }],
                metadata: { variation_key: 'microscope_calc', difficulty: 3 }
            };
        }

        // Default to model_real
        const scenario = MathUtils.randomChoice(ScaleGen.SCENARIOS.model);
        const scale = MathUtils.randomChoice([18, 24, 43]);
        const imgCm = MathUtils.randomInt(5, 25);
        const realCm = imgCm * scale;
        const ans = Math.round((realCm / 100) * 10) / 10;

        return {
            renderData: {
                description: lang === 'sv'
                    ? `${scenario.sv.charAt(0).toUpperCase() + scenario.sv.slice(1)} är byggd i skala 1:${scale}. På modellen är ${scenario.contextSv} ${imgCm} cm. Hur långt är det i verkligheten? Svara i meter.`
                    : `${scenario.en.charAt(0).toUpperCase() + scenario.en.slice(1)} is built in scale 1:${scale}. On the model, ${scenario.contextEn} is ${imgCm} cm. How long is it in reality? Answer in meters.`,
                answerType: 'numeric', suffix: 'm'
            },
            token: this.toBase64(ans.toString().replace('.', ',')),
            clues: [{ text: lang === 'sv' ? `Multiplicera modellens längd med ${scale} och dela sedan med 100 för att få meter.` : `Multiply the model's length by ${scale} and then divide by 100 to get meters.`, latex: `\\frac{${imgCm} \\cdot ${scale}}{100} = ${ans}` }],
            metadata: { variation_key: 'model_real', difficulty: 3 }
        };
    }

    // --- LEVEL 4: DETERMINE SCALE ---
    private level4_DetermineScale(lang: string, variationKey?: string): any {
        const v = variationKey || (Math.random() < 0.7 ? 'determine_reduction' : 'determine_magnification');
        
        if (v === 'determine_reduction') {
            const scale = MathUtils.randomChoice([20, 40, 50, 100, 200]);
            const imgCm = MathUtils.randomInt(2, 10);
            const realM = (imgCm * scale) / 100;
            const realMStr = realM.toString().replace('.', ',');

            const desc = lang === 'sv'
                ? `En vägg är ${realMStr} m lång i verkligheten. På en ritning har väggen längden ${imgCm} cm. Vilken skala är ritningen gjord i?`
                : `A wall is ${realMStr} m long in reality. On a drawing, the wall has a length of ${imgCm} cm. What scale is the drawing made in?`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'text', placeholder: '1:X',
                    geometry: { type: 'scale_single', label: '?', shape: 'blueprint' }
                },
                token: this.toBase64(`1:${scale}`),
                clues: [
                    { text: lang === 'sv' ? `Gör först om meter till centimeter: ${realMStr} m = ${realM * 100} cm.` : `First convert meters to centimeters: ${realMStr} m = ${realM * 100} cm.` },
                    { text: lang === 'sv' ? "Dela sedan det verkliga måttet med ritningens mått för att få skalfaktorn." : "Then divide the real dimension by the drawing's dimension to get the scale factor.", latex: `\\frac{${realM * 100}}{${imgCm}} = ${scale}` }
                ],
                metadata: { variation_key: 'determine_reduction', difficulty: 3 }
            };
        }

        // determine_magnification
        const scale = MathUtils.randomChoice([5, 10, 20]);
        const realMm = MathUtils.randomInt(2, 5);
        const imgCm = (realMm * scale) / 10;
        const imgCmStr = imgCm.toString().replace('.', ',');

        const desc = lang === 'sv'
            ? `Ett litet frö är ${realMm} mm långt. På en bild är fröet ${imgCmStr} cm långt. Vilken skala har bilden?`
            : `A small seed is ${realMm} mm long. In a picture, the seed is ${imgCmStr} cm long. What scale does the picture have?`;

        return {
            renderData: {
                description: desc,
                answerType: 'text', placeholder: 'X:1',
                geometry: { type: 'scale_single', label: '?', shape: 'magnifying_glass' }
            },
            token: this.toBase64(`${scale}:1`),
            clues: [
                { text: lang === 'sv' ? `Gör om centimeter till millimeter: ${imgCmStr} cm = ${imgCm * 10} mm.` : `Convert centimeters to millimeters: ${imgCmStr} cm = ${imgCm * 10} mm.` },
                { text: lang === 'sv' ? "Dela bildens mått med verklighetens mått för att få förstoringen." : "Divide the image dimension by the real dimension to get the magnification.", latex: `\\frac{${imgCm * 10}}{${realMm}} = ${scale}` }
            ],
            metadata: { variation_key: 'determine_magnification', difficulty: 3 }
        };
    }

    // --- LEVEL 5: NO PICTURES ---
    private level5_NoPictures(lang: string): any {
        const data = this.level3_MixedScenarios(lang);
        data.renderData.geometry = null; // Enforce mental model
        data.metadata.variation_key = 'word_problem';
        return data;
    }

    // --- LEVEL 6: AREA SCALE DEEP ---
    private level6_AreaScaleDeep(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['area_concept', 'area_reverse', 'area_calc_small', 'area_calc_large']);

        if (v === 'area_concept') {
            const L = MathUtils.randomChoice([2, 3, 5, 10]);
            const sq = L * L;
            const correct = lang === 'sv' ? `${sq} gånger större` : `${sq} times larger`;
            
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Om alla längder i en figur förstoras enligt längdskalan 1:${L}, hur många gånger större blir då figurens area?`
                        : `If all lengths in a figure are magnified according to the length scale 1:${L}, how many times larger does the figure's area become?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, lang === 'sv' ? `${L} gånger större` : `${L} times larger`, lang === 'sv' ? `${L * 2} gånger större` : `${L * 2} times larger`]),
                    geometry: { type: 'scale_single', label: `1:${L}`, shape: 'square' }
                },
                token: this.toBase64(correct),
                clues: [{ text: lang === 'sv' ? "Viktig regel: Areaskalan är alltid längdskalan i kvadrat." : "Important rule: The area scale is always the length scale squared.", latex: `\\text{Areaskala} = ${L}^2 = ${sq}` }],
                metadata: { variation_key: 'area_concept', difficulty: 4 }
            };
        }

        if (v === 'area_reverse') {
            const L = MathUtils.randomChoice([2, 3, 4, 5]);
            const smallA = MathUtils.randomChoice([5, 10, 20]);
            const largeA = smallA * (L * L);

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Arean av en liten figur är ${smallA} cm² och arean av en likformig stor figur är ${largeA} cm². Vilken längdskala råder mellan figurerna?`
                        : `The area of a small figure is ${smallA} cm² and the area of a similar large figure is ${largeA} cm². What length scale exists between the figures?`,
                    answerType: 'text', placeholder: '1:X'
                },
                token: this.toBase64(`1:${L}`),
                clues: [
                    { text: lang === 'sv' ? `Räkna först ut areaskalan: ${largeA} / ${smallA} = ${L*L}.` : `First calculate the area scale: ${largeA} / ${smallA} = ${L*L}.`, latex: "" },
                    { text: lang === 'sv' ? "Dra sedan kvadratroten ur areaskalan för att hitta längdskalan." : "Then take the square root of the area scale to find the length scale.", latex: `\\sqrt{${L*L}} = ${L}` }
                ],
                metadata: { variation_key: 'area_reverse', difficulty: 4 }
            };
        }

        const L = MathUtils.randomChoice([2, 3, 4]);
        const smallA = MathUtils.randomInt(5, 15);
        const largeA = smallA * (L * L);
        const findLarge = v === 'area_calc_large';

        return {
            renderData: {
                description: lang === 'sv'
                    ? (findLarge 
                        ? `Längdskalan mellan två figurer är 1:${L}. Den lilla figuren har arean ${smallA} cm². Beräkna den stora figurens area.` 
                        : `Längdskalan mellan två figurer är 1:${L}. Den stora figuren har arean ${largeA} cm². Beräkna den lilla figurens area.`)
                    : (findLarge 
                        ? `The length scale between two figures is 1:${L}. The small figure has an area of ${smallA} cm². Calculate the large figure's area.` 
                        : `The length scale between two figures is 1:${L}. The large figure has an area of ${largeA} cm². Calculate the small figure's area.`),
                answerType: 'numeric', suffix: 'cm²'
            },
            token: this.toBase64(findLarge ? largeA.toString() : smallA.toString()),
            clues: [
                { text: lang === 'sv' ? `Areaskalan är längdskalan i kvadrat: $${L}^2 = ${L*L}$.` : `The area scale is the length scale squared: $${L}^2 = ${L*L}$.` },
                { text: lang === 'sv' ? (findLarge ? `Multiplicera lilla arean med ${L*L}.` : `Dividera stora arean med ${L*L}.`) : (findLarge ? `Multiply the small area by ${L*L}.` : `Divide the large area by ${L*L}.`) }
            ],
            metadata: { variation_key: v, difficulty: 4 }
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