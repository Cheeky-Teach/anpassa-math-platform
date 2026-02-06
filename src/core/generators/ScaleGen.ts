import { MathUtils } from '../utils/MathUtils.js';

export class ScaleGen {
    // Standard shapes for visuals
    private static readonly SHAPES = ['arrow', 'star', 'lightning', 'key', 'heart', 'cloud', 'moon', 'sun'];

    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Concepts(lang);
            case 2: return this.level2_LinearFluency(lang);
            case 3: return this.level3_MixedScenarios(lang);
            case 4: return this.level4_DetermineScale(lang); // HUGE update here
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

    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private randomChoice<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    private shuffle<T>(array: T[]): T[] {
        return array.sort(() => Math.random() - 0.5);
    }

    // --- LEVEL 1: CONCEPTS ---
    private level1_Concepts(lang: string): any {
        const variation = Math.random();

        // Variation A: Spot the Lie
        if (variation < 0.4) {
             const scale = this.randomChoice([2, 4, 5, 10]);
             const correctStatement = lang === 'sv' 
                ? `Verkligheten är ${scale} gånger större än bilden.` 
                : `Reality is ${scale} times larger than the image.`;
             const falseStatement = lang === 'sv'
                ? `Bilden är större än verkligheten.`
                : `The image is larger than reality.`;
             const trivialStatement = lang === 'sv'
                ? `Skalan är en förminskning.`
                : `The scale is a reduction.`;

             const options = this.shuffle([correctStatement, falseStatement, trivialStatement]);
             
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
                clues: []
             };
        }

        // Variation B: Standard Matching
        const isReduction = this.getRandomInt(0, 1) === 1;
        const ratio = this.randomChoice([2, 5, 10, 50, 100]);
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
                options: this.shuffle([correct, wrong, same]),
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
            clues: []
        };
    }

    // --- LEVEL 2: LINEAR FLUENCY ---
    private level2_LinearFluency(lang: string): any {
        const variation = Math.random();
        const shape = this.randomChoice(ScaleGen.SHAPES);

        // VARIATION A: Calculate Reality (1:X)
        if (variation < 0.35) {
            const scale = this.randomChoice([2, 5, 10, 20, 50, 100]);
            const imgCm = this.getRandomInt(2, 15);
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
                ]
            };
        }

        // VARIATION B: Calculate Image (1:X)
        if (variation < 0.6) {
            const scale = this.randomChoice([10, 20, 50, 100]);
            const imgCm = this.getRandomInt(2, 10);
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
                ]
            };
        }

        // VARIATION C: Find the Scale
        if (variation < 0.8) {
            const scale = this.randomChoice([2, 4, 5, 10, 20, 50]);
            const imgCm = this.getRandomInt(2, 10);
            const realCm = imgCm * scale;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Bilden är ${imgCm} cm. Verkligheten är ${realCm} cm. Vilken är skalan?`
                        : `The image is ${imgCm} cm. Reality is ${realCm} cm. What is the scale?`,
                    answerType: 'text',
                    placeholder: '1:X',
                    geometry: { type: 'scale_single', label: '?', shape: 'magnifying_glass' }
                },
                token: this.toBase64(`1:${scale}`),
                clues: [
                    { text: lang==='sv' ? "Hur många gånger större är verkligheten?" : "How many times larger is reality?", latex: `${realCm} / ${imgCm}` }
                ]
            };
        }

        // VARIATION D: Magnification (X:1)
        const scale = this.randomChoice([5, 10, 20]);
        const realMm = this.getRandomInt(2, 9);
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
            ]
        };
    }

    // --- LEVEL 3: MIXED SCENARIOS ---
    private level3_MixedScenarios(lang: string): any {
        const scenarioType = this.randomChoice([0, 1, 2, 3]);
        let desc="", answer=0, suffix="", visualData:any={}, clues:any[]=[];

        if (scenarioType === 0) { // Map
            const scale = this.randomChoice([10000, 20000, 50000]); 
            const mapCm = this.getRandomInt(3, 9); 
            const realCm = mapCm * scale;
            const useKm = realCm >= 100000;
            answer = useKm ? realCm / 100000 : realCm / 100;
            suffix = useKm ? 'km' : 'm';
            desc = lang === 'sv' ? `Karta 1:${this.formatNum(scale)}. Avstånd ${mapCm} cm. Verkligheten?` : `Map 1:${this.formatNum(scale)}. Dist ${mapCm} cm. Reality?`;
            visualData = { type: 'scale_compare', leftLabel: 'Map', rightLabel: 'Real', leftValue: 1, rightValue: scale, shape: 'map' };
            clues = [{ text: "Calc cm", latex: `${mapCm}\\cdot${scale}`}, { text: `Convert to ${suffix}`, latex: `/${useKm?100000:100}` }];
        } else if (scenarioType === 1) { // Blueprint
            const scale = 50, realM = 4;
            answer = (realM * 100) / scale; suffix='cm';
            desc = lang==='sv' ? `Vägg ${realM}m. Ritning 1:${scale}. Hur många cm på ritning?` : `Wall ${realM}m. Blueprint 1:${scale}. Size in cm?`;
            visualData = { type: 'scale_compare', leftLabel: 'Blueprint', rightLabel: 'Real', leftValue: 1, rightValue: scale, shape: 'house' };
            clues = [{text: "m to cm", latex: `${realM}\\cdot100`}, {text:"Divide by scale", latex: `/${scale}`}];
        } else {
             return this.level2_LinearFluency(lang);
        }

        return {
            renderData: { description: desc, answerType: 'numeric', geometry: visualData, suffix },
            token: this.toBase64(answer.toString()),
            clues
        };
    }

    // --- LEVEL 4: DETERMINE SCALE (Updated with Variations) ---
    private level4_DetermineScale(lang: string): any {
        // 70% Chance for Reduction (1:X), 30% for Magnification (X:1)
        const isReduction = Math.random() < 0.7;
        let scale = 0, desc = "", clue1 = "", clue2 = "", clue3 = "", answerStr = "";
        
        if (isReduction) {
            // REDUCTION LOGIC (Real M -> Image CM)
            // Broader range of random scales
            const scaleBases = [10, 20, 25, 30, 40, 50, 60, 75, 100, 150, 200, 250, 300, 400, 500];
            scale = this.randomChoice(scaleBases);
            const imgCm = this.getRandomInt(2, 12);
            
            // Calculate Real (m)
            const realCm = imgCm * scale;
            const realM = realCm / 100;
            
            // 10 Reduction Scenarios
            const scenarios = [
                { sv: "Ett rum", en: "A room", attrSv: "långt", attrEn: "long" },
                { sv: "En buss", en: "A bus", attrSv: "lång", attrEn: "long" },
                { sv: "En flaggstång", en: "A flagpole", attrSv: "hög", attrEn: "high" },
                { sv: "En pool", en: "A pool", attrSv: "lång", attrEn: "long" },
                { sv: "En trädgård", en: "A garden", attrSv: "bred", attrEn: "wide" },
                { sv: "Ett tåg", en: "A train", attrSv: "långt", attrEn: "long" },
                { sv: "En båt", en: "A boat", attrSv: "lång", attrEn: "long" },
                { sv: "En byggnad", en: "A building", attrSv: "hög", attrEn: "high" },
                { sv: "En lastbil", en: "A truck", attrSv: "lång", attrEn: "long" },
                { sv: "Ett matbord", en: "A dining table", attrSv: "långt", attrEn: "long" }
            ];
            
            const s = this.randomChoice(scenarios);
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
            // MAGNIFICATION LOGIC (Real MM -> Image CM)
            const scaleBases = [2, 4, 5, 8, 10, 20, 50];
            scale = this.randomChoice(scaleBases);
            const realMm = this.getRandomInt(2, 9);
            const imgMm = realMm * scale;
            const imgCm = imgMm / 10; 
            
            // 10 Magnification Scenarios
            const scenarios = [
                { sv: "En myra", en: "An ant" },
                { sv: "Ett frö", en: "A seed" },
                { sv: "En datorkomponent", en: "A computer chip" },
                { sv: "En snöflinga", en: "A snowflake" },
                { sv: "En vattendroppe", en: "A water drop" },
                { sv: "En nyckelpiga", en: "A ladybug" },
                { sv: "Ett knappnålshuvud", en: "A pinhead" },
                { sv: "En insekt", en: "An insect" },
                { sv: "Ett sandkorn", en: "A grain of sand" },
                { sv: "En liten skruv", en: "A small screw" }
            ];
            
            const s = this.randomChoice(scenarios);
            const objName = lang === 'sv' ? s.sv : s.en;
            const imgCmDisplay = imgCm.toString().replace('.', ',');

            desc = lang === 'sv'
                ? `${objName} är ${realMm} mm i verkligheten. På bilden är den ${imgCmDisplay} cm. Vilken skala är bilden?`
                : `${objName} is ${realMm} mm in reality. In the picture it is ${imgCmDisplay} cm. What is the scale?`;
            
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
            ]
        };
    }

    // --- LEVEL 5: NO PICTURES ---
    private level5_NoPictures(lang: string): any {
        const data = this.level3_MixedScenarios(lang);
        data.renderData.geometry = null;
        return data;
    }

    // --- LEVEL 6: AREA SCALE DEEP ---
    private level6_AreaScaleDeep(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Conceptual Squared
        if (variation < 0.25) {
            const L = this.randomChoice([2, 3, 4, 5, 10]);
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
                    options: this.shuffle([correct, trap1, trap2]),
                    geometry: { type: 'scale_single', label: `1:${L}`, shape: 'square' }
                },
                token: this.toBase64(correct),
                clues: [{ text: "Area Scale = (Length Scale)²", latex: `${L}^2` }]
            };
        }

        // VARIATION B: Reverse Area
        if (variation < 0.5) {
            const L = this.randomChoice([2, 3, 4, 5]);
            const smallA = this.randomChoice([1, 4, 9, 10]);
            const largeA = smallA * (L * L);

            return {
                renderData: {
                    description: lang==='sv'
                        ? `Lilla arean är ${smallA} cm². Stora arean är ${largeA} cm². Vad är längdskalan? (Svara som X:X)`
                        : `Small area is ${smallA} cm². Large area is ${largeA} cm². What is the length scale? (Answer as X:X)`,
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
                ]
            };
        }

        // VARIATION C: Backward Calculation
        if (variation < 0.75) {
            const L = this.randomChoice([2, 3, 4, 5]);
            const smallA = this.getRandomInt(2, 10);
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
                ]
            };
        }

        // VARIATION D: Classic Forward
        const shape = this.randomChoice(['rectangle', 'triangle']);
        const L = this.randomChoice([2, 3, 4]);
        const w = this.getRandomInt(2, 4);
        const h = this.getRandomInt(2, 4);
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
            clues: [{ text: "Scale Area", latex: `${baseArea} \\cdot ${L}^2` }]
        };
    }

    // --- LEVEL 7: MIXED ---
    private level7_Mixed(lang: string): any {
        const subLevel = this.getRandomInt(2, 6);
        return this.generate(subLevel, lang);
    }
}