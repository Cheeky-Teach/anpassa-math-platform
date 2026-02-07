import { MathUtils } from '../utils/MathUtils.js';

export class ScaleGen {
    // Standard shapes for visuals
    private static readonly SHAPES = ['arrow', 'star', 'lightning', 'key', 'heart', 'cloud', 'moon', 'sun'];

    // --- CONTEXT LIBRARY ---
    private static readonly SCENARIOS = {
        map: [
            { sv: "En karta", en: "a map", context: "distance" },
            { sv: "En vandringskarta", en: "a hiking map", context: "trail" },
            { sv: "En sjökort", en: "a nautical chart", context: "distance" }
        ],
        blueprint: [
            { sv: "En ritning", en: "a blueprint", context: "wall" },
            { sv: "En planlösning", en: "a floor plan", context: "room" },
            { sv: "En konstruktionsritning", en: "a construction drawing", context: "beam" }
        ],
        model: [
            { sv: "En modell", en: "a model", context: "car" },
            { sv: "En leksaksbil", en: "a toy car", context: "length" },
            { sv: "Ett modellflygplan", en: "a model airplane", context: "wingspan" }
        ],
        microscope: [
            { sv: "En bild i mikroskop", en: "a microscope image", context: "cell" },
            { sv: "En förstoring", en: "a magnification", context: "insect" },
            { sv: "En detaljbild", en: "a detailed image", context: "chip" }
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

    // --- HELPERS ---
    
    private formatNum(n: number): string {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: CONCEPTS ---
    private level1_Concepts(lang: string): any {
        const variation = Math.random();

        // Variation A: Spot the Lie
        if (variation < 0.4) {
             const scale = MathUtils.randomChoice([2, 4, 5, 10]);
             const correctStatement = lang === 'sv' 
                ? `Verkligheten är ${scale} gånger större än bilden.` 
                : `Reality is ${scale} times larger than the image.`;
             const falseStatement = lang === 'sv'
                ? `Bilden är större än verkligheten.`
                : `The image is larger than reality.`;
             const trivialStatement = lang === 'sv'
                ? `Skalan är en förminskning.`
                : `The scale is a reduction.`;

             const options = MathUtils.shuffle([correctStatement, falseStatement, trivialStatement]);
             
             return {
                renderData: {
                    description: lang === 'sv' ? `Betrakta skalan 1:${scale}. Vilket påstående är FALSKT?` : `Consider scale 1:${scale}. Which statement is FALSE?`,
                    answerType: 'multiple_choice',
                    options: options,
                    geometry: { 
                        type: 'scale_single', 
                        label: `1:${scale}`, 
                        shape: 'map' 
                    }
                },
                token: this.toBase64(falseStatement),
                clues: [],
                metadata: { variation: 'concept_lie', difficulty: 1 }
             };
        }

        // Variation B: Standard Matching
        const isReduction = MathUtils.randomInt(0, 1) === 1;
        const ratio = MathUtils.randomChoice([2, 5, 10, 50, 100]);
        const scaleStr = isReduction ? `1:${ratio}` : `${ratio}:1`;
        
        let correct = "", wrong = "";
        const same = lang === 'sv' ? "De är lika stora." : "They are the same size.";
        
        if (isReduction) {
            correct = lang === 'sv' ? `Verkligheten är ${ratio} ggr större.` : `Reality is ${ratio}x larger.`;
            wrong = lang === 'sv' ? `Bilden är ${ratio} ggr större.` : `Image is ${ratio}x larger.`;
        } else {
            correct = lang === 'sv' ? `Bilden är ${ratio} ggr större.` : `Image is ${ratio}x larger.`;
            wrong = lang === 'sv' ? `Verkligheten är ${ratio} ggr större.` : `Reality is ${ratio}x larger.`;
        }

        return {
            renderData: {
                description: lang === 'sv' ? `Vad betyder skalan ${scaleStr}?` : `What does the scale ${scaleStr} mean?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([correct, wrong, same]),
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
            clues: [],
            metadata: { variation: 'concept_match', difficulty: 1 }
        };
    }

    // --- LEVEL 2: LINEAR FLUENCY ---
    private level2_LinearFluency(lang: string): any {
        const variation = Math.random();
        const shape = MathUtils.randomChoice(ScaleGen.SHAPES);

        // VARIATION A: Calculate Reality (1:X)
        if (variation < 0.35) {
            const scale = MathUtils.randomChoice([2, 5, 10, 20, 50, 100]);
            const imgCm = MathUtils.randomInt(2, 15);
            const ans = imgCm * scale;
            
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `En bild är ritad i skala 1:${scale}. Bilden är ${imgCm} cm bred. Hur bred är den i verkligheten?`
                        : `A picture is drawn in scale 1:${scale}. The picture is ${imgCm} cm wide. How wide is it in reality?`,
                    answerType: 'numeric',
                    suffix: 'cm',
                    geometry: {
                        type: 'scale_compare',
                        leftLabel: lang === 'sv' ? 'Bild' : 'Image',
                        rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                        leftValue: 1, rightValue: scale, shape
                    }
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang==='sv' ? "Verkligheten = Bilden · Skalan" : "Reality = Image · Scale", latex: `${imgCm} \\cdot ${scale}` }
                ],
                metadata: { variation: 'calc_real', difficulty: 2 }
            };
        }

        // VARIATION B: Calculate Image (1:X)
        if (variation < 0.6) {
            const scale = MathUtils.randomChoice([10, 20, 50, 100]);
            const imgCm = MathUtils.randomInt(2, 10);
            const realCm = imgCm * scale;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Ett föremål är ${realCm} cm i verkligheten. Hur stor blir den på en ritning i skala 1:${scale}?`
                        : `An object is ${realCm} cm in reality. How big will it be on a drawing with scale 1:${scale}?`,
                    answerType: 'numeric',
                    suffix: 'cm',
                    geometry: {
                        type: 'scale_compare',
                        leftLabel: lang === 'sv' ? 'Ritning' : 'Drawing',
                        rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                        leftValue: 1, rightValue: scale, shape: 'house'
                    }
                },
                token: this.toBase64(imgCm.toString()),
                clues: [
                    { text: lang==='sv' ? "Bilden är mindre än verkligheten." : "The image is smaller than reality.", latex: `\\text{Image} < \\text{Reality}` },
                    { text: lang==='sv' ? "Bilden = Verkligheten / Skalan" : "Image = Reality / Scale", latex: `${realCm} / ${scale}` }
                ],
                metadata: { variation: 'calc_image', difficulty: 2 }
            };
        }

        // VARIATION C: Find the Scale
        if (variation < 0.8) {
            const scale = MathUtils.randomChoice([2, 4, 5, 10, 20, 50]);
            const imgCm = MathUtils.randomInt(2, 10);
            const realCm = imgCm * scale;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Bilden är ${imgCm} cm. Verkligheten är ${realCm} cm. Vilken är skalan? (Svara som 1:X)`
                        : `The image is ${imgCm} cm. Reality is ${realCm} cm. What is the scale? (Answer as 1:X)`,
                    answerType: 'text',
                    placeholder: '1:X',
                    geometry: { type: 'scale_single', label: '?', shape: 'magnifying_glass' }
                },
                token: this.toBase64(`1:${scale}`),
                clues: [
                    { text: lang==='sv' ? "Hur många gånger större är verkligheten?" : "How many times larger is reality?", latex: `${realCm} / ${imgCm}` }
                ],
                metadata: { variation: 'find_scale', difficulty: 2 }
            };
        }

        // VARIATION D: Magnification (X:1)
        const scale = MathUtils.randomChoice([5, 10, 20]);
        const realMm = MathUtils.randomInt(2, 9);
        const imgMm = realMm * scale;
        
        return {
            renderData: {
                description: lang === 'sv'
                    ? `En insekt förstoras i skala ${scale}:1. På bilden är den ${imgMm} mm. Hur stor är den i verkligheten?`
                    : `An insect is magnified in scale ${scale}:1. In the picture it is ${imgMm} mm. How big is it in reality?`,
                answerType: 'numeric',
                suffix: 'mm',
                geometry: {
                    type: 'scale_compare',
                    leftLabel: lang === 'sv' ? 'Bild' : 'Image',
                    rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                    leftValue: scale, rightValue: 1, shape: 'ladybug'
                }
            },
            token: this.toBase64(realMm.toString()),
            clues: [
                { text: lang==='sv' ? "Skala X:1 betyder att bilden är störst." : "Scale X:1 means image is largest.", latex: `\\text{Image} > \\text{Reality}` },
                { text: lang==='sv' ? "Verkligheten = Bilden / Skalan" : "Reality = Image / Scale", latex: `${imgMm} / ${scale}` }
            ],
            metadata: { variation: 'calc_magnification', difficulty: 2 }
        };
    }

    // --- LEVEL 3: MIXED SCENARIOS ---
    private level3_MixedScenarios(lang: string): any {
        const scenarioType = MathUtils.randomChoice([0, 1, 2, 3]);
        let desc="", answer=0, suffix="", visualData:any={}, clues:any[]=[];
        let metaVar = "";

        if (scenarioType === 0) { // Map
            const scale = MathUtils.randomChoice([10000, 20000, 50000]); 
            const mapCm = MathUtils.randomInt(3, 9); 
            const realCm = mapCm * scale;
            const useKm = realCm >= 100000;
            answer = useKm ? realCm / 100000 : realCm / 100;
            suffix = useKm ? 'km' : 'm';
            desc = lang === 'sv' ? `Karta 1:${this.formatNum(scale)}. Avstånd ${mapCm} cm. Verkligheten?` : `Map 1:${this.formatNum(scale)}. Dist ${mapCm} cm. Reality?`;
            visualData = { type: 'scale_compare', leftLabel: 'Map', rightLabel: 'Real', leftValue: 1, rightValue: scale, shape: 'map' };
            clues = [{ text: "Calc cm", latex: `${mapCm}\\cdot${scale}`}, { text: `Convert to ${suffix}`, latex: `/${useKm?100000:100}` }];
            metaVar = 'map_real';
        } else if (scenarioType === 1) { // Blueprint
            const scale = 50, realM = 4;
            answer = (realM * 100) / scale; suffix='cm';
            desc = lang==='sv' ? `Vägg ${realM}m. Ritning 1:${scale}. Hur många cm på ritning?` : `Wall ${realM}m. Blueprint 1:${scale}. Size in cm?`;
            visualData = { type: 'scale_compare', leftLabel: 'Blueprint', rightLabel: 'Real', leftValue: 1, rightValue: scale, shape: 'house' };
            clues = [{text: "m to cm", latex: `${realM}\\cdot100`}, {text:"Divide by scale", latex: `/${scale}`}];
            metaVar = 'blueprint_draw';
        } else {
             const base = this.level2_LinearFluency(lang);
             return { ...base, metadata: { variation: 'mixed_fallback', difficulty: 3 } };
        }

        return {
            renderData: { description: desc, answerType: 'numeric', geometry: visualData, suffix },
            token: this.toBase64(answer.toString()),
            clues,
            metadata: { variation: metaVar, difficulty: 3 }
        };
    }

    // --- LEVEL 4: DETERMINE SCALE (Updated with Context) ---
    private level4_DetermineScale(lang: string): any {
        const isReduction = Math.random() < 0.7;
        let scale = 0, desc = "", clue1 = "", clue2 = "", clue3 = "", answerStr = "";
        
        if (isReduction) {
            // REDUCTION LOGIC
            const scaleBases = [10, 20, 25, 30, 40, 50, 60, 75, 100, 150, 200, 250, 300, 400, 500];
            scale = MathUtils.randomChoice(scaleBases);
            const imgCm = MathUtils.randomInt(2, 12);
            
            const realCm = imgCm * scale;
            const realM = realCm / 100;
            
            // Context from library
            // Default scenarios if library not used here, but let's use the SCENARIOS concept from ProbGen
            const scenarios = [
                { sv: "Ett rum", en: "A room", attrSv: "långt", attrEn: "long" },
                { sv: "En buss", en: "A bus", attrSv: "lång", attrEn: "long" }
            ];
            
            const s = MathUtils.randomChoice(scenarios);
            const objName = lang === 'sv' ? s.sv : s.en;
            const attr = lang === 'sv' ? s.attrSv : s.attrEn;
            const realMStr = realM.toString().replace('.', ','); 

            desc = lang === 'sv'
                ? `${objName} är ${realMStr} m ${attr} i verkligheten. På ritningen är det ${imgCm} cm. Vilken skala är ritningen?`
                : `${objName} is ${realMStr} m ${attr} in reality. On the drawing it is ${imgCm} cm. What is the scale?`;
            
            answerStr = `1:${scale}`;
            clue1 = lang === 'sv' ? `Omvandla ${realMStr} m till cm: ${realM} · 100 = ${realCm} cm.` : `Convert ${realMStr} m to cm: ${realM} · 100 = ${realCm} cm.`;
            clue2 = lang === 'sv' ? `Jämför: Bild : Verklighet -> ${imgCm} : ${realCm}` : `Compare: Image : Reality -> ${imgCm} : ${realCm}`;
            clue3 = lang === 'sv' ? `Förenkla genom att dela båda med ${imgCm}.` : `Simplify by dividing both sides by ${imgCm}.`;

        } else {
            // MAGNIFICATION LOGIC
            const scaleBases = [2, 4, 5, 8, 10, 20, 50];
            scale = MathUtils.randomChoice(scaleBases);
            const realMm = MathUtils.randomInt(2, 9);
            const imgMm = realMm * scale;
            const imgCm = imgMm / 10; 
            
            const s = MathUtils.randomChoice(ScaleGen.SCENARIOS.microscope);
            const objName = lang === 'sv' ? s.sv : s.en;
            const imgCmDisplay = imgCm.toString().replace('.', ',');

            desc = lang === 'sv'
                ? `${objName} är ${realMm} mm i verkligheten. På bilden är den ${imgCmDisplay} cm. Vilken skala är bilden? (Svara som X:1)`
                : `${objName} is ${realMm} mm in reality. In the picture it is ${imgCmDisplay} cm. What is the scale? (Answer as X:1)`;
            
            answerStr = `${scale}:1`;
            clue1 = lang === 'sv' ? `Omvandla ${imgCmDisplay} cm till mm: ${imgCm} · 10 = ${imgMm} mm.` : `Convert ${imgCmDisplay} cm to mm: ${imgCm} · 10 = ${imgMm} mm.`;
            clue2 = lang === 'sv' ? `Jämför: Bild : Verklighet -> ${imgMm} : ${realMm}` : `Compare: Image : Reality -> ${imgMm} : ${realMm}`;
            clue3 = lang === 'sv' ? `Eftersom bilden är större är det en förstoring (X:1).` : `Since the image is larger, it's a magnification (X:1).`;
        }

        return {
            renderData: {
                description: desc,
                answerType: 'text',
                placeholder: isReduction ? '1:...' : '...:1',
                geometry: { 
                    type: 'scale_single', 
                    label: '?', 
                    shape: isReduction ? 'magnifying_glass' : 'ladybug'
                }
            },
            token: this.toBase64(answerStr),
            clues: [
                { text: clue1, latex: '' },
                { text: clue2, latex: '' },
                { text: clue3, latex: isReduction ? `1 : ${scale}` : `${scale} : 1` }
            ],
            metadata: { variation: isReduction ? 'determine_reduction' : 'determine_magnification', difficulty: 3 }
        };
    }

    // --- LEVEL 5: NO PICTURES ---
    private level5_NoPictures(lang: string): any {
        const data = this.level3_MixedScenarios(lang);
        data.renderData.geometry = null;
        data.metadata = { variation: 'word_problem', difficulty: 3 };
        return data;
    }

    // --- LEVEL 6: AREA SCALE DEEP ---
    private level6_AreaScaleDeep(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Conceptual Squared
        if (variation < 0.25) {
            const L = MathUtils.randomChoice([2, 3, 4, 5, 10]);
            const sq = L * L;
            
            const correct = lang==='sv' ? `${sq} gånger större` : `${sq} times larger`;
            const trap1 = lang==='sv' ? `${L} gånger större` : `${L} times larger`;
            const trap2 = lang==='sv' ? `${L*2} gånger större` : `${L*2} times larger`;

            return {
                renderData: {
                    description: lang==='sv' 
                        ? `Längdskalan är 1:${L}. Hur mycket större blir arean?`
                        : `Length scale is 1:${L}. How much larger does the area become?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, trap1, trap2]),
                    geometry: { type: 'scale_single', label: `1:${L}`, shape: 'square' }
                },
                token: this.toBase64(correct),
                clues: [{ text: "Area Scale = (Length Scale)²", latex: `${L}^2` }],
                metadata: { variation: 'area_concept', difficulty: 4 }
            };
        }

        // VARIATION B: Reverse Area
        if (variation < 0.5) {
            const L = MathUtils.randomChoice([2, 3, 4, 5]);
            const smallA = MathUtils.randomChoice([1, 4, 9, 10]);
            const largeA = smallA * (L * L);

            return {
                renderData: {
                    description: lang==='sv'
                        ? `Lilla arean är ${smallA} cm². Stora arean är ${largeA} cm². Vad är längdskalan? (Svara som 1:X)`
                        : `Small area is ${smallA} cm². Large area is ${largeA} cm². What is the length scale? (Answer as 1:X)`,
                    answerType: 'text',
                    placeholder: '1:X',
                    geometry: {
                        type: 'compare_shapes_area',
                        shapeType: 'square',
                        left: { area: smallA, width: 20, height: 20 }, 
                        right: { area: largeA, width: 40, height: 40 }
                    }
                },
                token: this.toBase64(`1:${L}`),
                clues: [
                    { text: lang==='sv' ? "Hitta areaskalan först." : "Find area scale first.", latex: `${largeA} / ${smallA} = ${L*L}` },
                    { text: lang==='sv' ? "Ta roten ur areaskalan." : "Take square root of area scale.", latex: `\\sqrt{${L*L}} = ${L}` }
                ],
                metadata: { variation: 'area_reverse', difficulty: 4 }
            };
        }

        // VARIATION C: Backward Calculation
        if (variation < 0.75) {
            const L = MathUtils.randomChoice([2, 3, 4, 5]);
            const smallA = MathUtils.randomInt(2, 10);
            const largeA = smallA * (L * L);

            return {
                renderData: {
                    description: lang==='sv'
                        ? `Längdskalan är 1:${L}. Den stora figuren har arean ${largeA} cm². Vad är den lilla figurens area?`
                        : `Length scale is 1:${L}. The large shape has area ${largeA} cm². What is the area of the small shape?`,
                    answerType: 'numeric',
                    suffix: 'cm²',
                    geometry: {
                        type: 'compare_shapes_area',
                        shapeType: 'triangle',
                        left: { area: '?', width: 20, height: 20 },
                        right: { area: largeA, width: 40, height: 40 }
                    }
                },
                token: this.toBase64(smallA.toString()),
                clues: [
                    { text: lang==='sv' ? "Areaskalan är kvadraten av längdskalan." : "Area scale is square of length scale.", latex: `${L}^2 = ${L*L}` },
                    { text: lang==='sv' ? "Dela stora arean med areaskalan." : "Divide large area by area scale.", latex: `${largeA} / ${L*L}` }
                ],
                metadata: { variation: 'area_calc_small', difficulty: 4 }
            };
        }

        // VARIATION D: Classic Forward
        const shape = MathUtils.randomChoice(['rectangle', 'triangle']);
        const L = MathUtils.randomChoice([2, 3, 4]);
        const w = MathUtils.randomInt(2, 4);
        const h = MathUtils.randomInt(2, 4);
        const baseArea = shape === 'rectangle' ? w * h : (w * h * 0.5) % 1 === 0 ? w * h * 0.5 : w * h;
        const bigArea = baseArea * (L * L);

        return {
            renderData: {
                description: lang==='sv' ? `Längdskala 1:${L}. Lilla arean ${baseArea} cm². Stora arean?` : `Length scale 1:${L}. Small area ${baseArea} cm². Large area?`,
                answerType: 'numeric',
                suffix: 'cm²',
                geometry: {
                    type: 'compare_shapes_area',
                    shapeType: shape,
                    left: { area: baseArea, width: 20, height: 20 },
                    right: { area: '?', width: 40, height: 40 }
                }
            },
            token: this.toBase64(bigArea.toString()),
            clues: [{ text: "Scale Area", latex: `${baseArea} \\cdot ${L}^2` }],
            metadata: { variation: 'area_calc_large', difficulty: 4 }
        };
    }

    // --- LEVEL 7: MIXED ---
    private level7_Mixed(lang: string): any {
        const subLevel = MathUtils.randomInt(2, 6);
        return this.generate(subLevel, lang);
    }
}