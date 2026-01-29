import { MathUtils } from '../utils/MathUtils.js';

export class ScaleGen {
    // Standard shapes for legacy/lower levels
    private static readonly SHAPES = ['arrow', 'star', 'lightning', 'key', 'heart', 'cloud', 'moon', 'sun'];

    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Concepts(lang);
            case 2: return this.level2_CalcLengthSimple(lang);
            case 3: return this.level3_MixedScenarios(lang);
            case 4: return this.level4_DetermineScale(lang);
            case 5: return this.level5_NoPictures(lang);
            case 6: return this.level6_AreaScale(lang);
            case 7: return this.level7_Mixed(lang);
            default: return this.level1_Concepts(lang);
        }
    }

    // Level 1: Basic Concepts (Understanding 1:X vs X:1)
    private level1_Concepts(lang: string): any {
        const isReduction = MathUtils.randomInt(0, 1) === 1;
        const ratio = MathUtils.randomChoice([2, 5, 10, 50, 100]);
        const scaleStr = isReduction ? `1:${ratio}` : `${ratio}:1`;
        
        // Q1: What does this mean?
        const desc = lang === 'sv' 
            ? `Vad betyder skalan ${scaleStr}?`
            : `What does the scale ${scaleStr} mean?`;
            
        let correct = "";
        let wrong = "";
        
        if (isReduction) {
            correct = lang === 'sv' ? `Verkligheten är ${ratio} gånger större än bilden.` : `Reality is ${ratio} times larger than the image.`;
            wrong = lang === 'sv' ? `Bilden är ${ratio} gånger större än verkligheten.` : `The image is ${ratio} times larger than reality.`;
        } else {
            correct = lang === 'sv' ? `Bilden är ${ratio} gånger större än verkligheten.` : `The image is ${ratio} times larger than reality.`;
            wrong = lang === 'sv' ? `Verkligheten är ${ratio} gånger större än bilden.` : `Reality is ${ratio} times larger than the image.`;
        }

        return {
            renderData: {
                description: desc,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([correct, wrong, lang === 'sv' ? "De är lika stora." : "They are the same size."]),
                geometry: { 
                    type: 'scale_compare', 
                    leftLabel: lang === 'sv' ? 'Bild' : 'Image', 
                    rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                    leftValue: isReduction ? 1 : ratio,
                    rightValue: isReduction ? ratio : 1,
                    shape: 'arrow' // Using generic arrow for concept
                }
            },
            token: Buffer.from(correct).toString('base64'),
            clues: []
        };
    }

    // Level 2: Simple Calculation (Integers, no unit conversion traps)
    private level2_CalcLengthSimple(lang: string): any {
        const scale = MathUtils.randomChoice([2, 3, 4, 5, 10]);
        const imageSize = MathUtils.randomInt(2, 12);
        const realSize = imageSize * scale;

        const desc = lang === 'sv'
            ? `En bild är ritad i skala 1:${scale}. Bilden är ${imageSize} cm bred. Hur bred är den i verkligheten?`
            : `A picture is drawn in scale 1:${scale}. The picture is ${imageSize} cm wide. How wide is it in reality?`;

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: { 
                    type: 'scale_compare', 
                    leftLabel: lang === 'sv' ? 'Bild' : 'Image', 
                    rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                    leftValue: 1,
                    rightValue: scale,
                    shape: MathUtils.randomChoice(ScaleGen.SHAPES)
                },
                suffix: 'cm'
            },
            token: Buffer.from(realSize.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Multiplicera med skalan." : "Multiply by the scale.", latex: `${imageSize} \\\\cdot ${scale}` }
            ]
        };
    }

    // ========================================================================
    // LEVEL 3: REAL WORLD SCENARIOS
    // ========================================================================
    private level3_MixedScenarios(lang: string): any {
        // 0: Map (cm -> km), 1: Blueprint (m -> cm), 2: Model (m -> cm), 3: Microscope (mm -> cm, X:1)
        const scenarioType = MathUtils.randomChoice([0, 1, 2, 3]);

        let desc = "";
        let answer = 0;
        let suffix = "";
        let visualData: any = {};
        let clues: any[] = [];

        // --- Scenario 0: The Geographer (Map) ---
        if (scenarioType === 0) {
            const scaleBase = MathUtils.randomChoice([10000, 20000, 50000]); // 1:10000 etc
            const mapCm = MathUtils.randomInt(2, 8); // e.g., 5 cm
            const realCm = mapCm * scaleBase;
            const realKm = realCm / 100000; // 100,000 cm in a km
            
            const useMeters = realKm < 1;
            answer = useMeters ? realCm / 100 : realKm;
            suffix = useMeters ? 'm' : 'km';

            desc = lang === 'sv'
                ? `På en karta i skala 1:${scaleBase} är avståndet mellan två stugor ${mapCm} cm. Hur långt är det i verkligheten? Svara i ${suffix}.`
                : `On a map with scale 1:${scaleBase}, the distance between two cabins is ${mapCm} cm. How far is it in reality? Answer in ${suffix}.`;

            visualData = {
                type: 'scale_compare',
                leftLabel: lang === 'sv' ? 'Karta' : 'Map',
                rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                leftValue: 1,
                rightValue: scaleBase,
                shape: 'map'
            };

            clues = [
                {
                    text: lang === 'sv' ? "Räkna först ut hur många cm det är i verkligheten." : "First calculate how many cm it is in reality.",
                    latex: `${mapCm} \\\\cdot ${scaleBase} = ${MathUtils.formatNumber(realCm)} \\\\text{ cm}`
                },
                {
                    text: lang === 'sv' ? `Omvandla cm till ${suffix}.` : `Convert cm to ${suffix}.`,
                    latex: useMeters ? `${realCm} / 100 = ${answer}` : `${realCm} / 100000 = ${answer}`
                }
            ];
        }

        // --- Scenario 1: The Architect (Blueprint) ---
        else if (scenarioType === 1) {
            const scale = MathUtils.randomChoice([20, 40, 50, 100]);
            const realM = MathUtils.randomInt(30, 80) / 10; 
            const realCm = realM * 100;
            const drawingCm = realCm / scale;

            answer = drawingCm;
            suffix = 'cm';

            desc = lang === 'sv'
                ? `En vägg är ${realM} meter lång i verkligheten. Hur lång blir linjen på en ritning i skala 1:${scale}? Svara i cm.`
                : `A wall is ${realM} meters long in reality. How long is the line on a blueprint with scale 1:${scale}? Answer in cm.`;

            visualData = {
                type: 'scale_compare',
                leftLabel: lang === 'sv' ? 'Ritning' : 'Blueprint',
                rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                leftValue: 1,
                rightValue: scale,
                shape: 'house'
            };

            clues = [
                {
                    text: lang === 'sv' ? "Gör om verkliga längden till cm först." : "Convert the real length to cm first.",
                    latex: `${realM} \\\\text{ m} = ${realCm} \\\\text{ cm}`
                },
                {
                    text: lang === 'sv' ? "Dela sedan med skalan." : "Then divide by the scale.",
                    latex: `${realCm} / ${scale} = ${answer}`
                }
            ];
        }

        // --- Scenario 2: The Model Maker (Hobby) ---
        else if (scenarioType === 2) {
            const scale = MathUtils.randomChoice([18, 24, 87]); // Standard car/train scales
            
            let realM = 0;
            if (scale === 18) realM = MathUtils.randomChoice([3.6, 4.5, 5.4]);
            if (scale === 24) realM = MathUtils.randomChoice([4.8, 7.2, 9.6]);
            if (scale === 87) realM = MathUtils.randomChoice([17.4, 26.1]);

            const realCm = Math.round(realM * 100);
            answer = realCm / scale; 
            suffix = 'cm';

            desc = lang === 'sv'
                ? `Ett tåg är ${realM} meter långt. Hur lång blir en modell i skala 1:${scale}? Svara i cm.`
                : `A train is ${realM} meters long. How long is the model in scale 1:${scale}? Answer in cm.`;

            visualData = {
                type: 'scale_compare',
                leftLabel: lang === 'sv' ? 'Modell' : 'Model',
                rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                leftValue: 1,
                rightValue: scale,
                shape: 'car'
            };

            clues = [
                {
                    text: lang === 'sv' ? "Gör om meter till cm." : "Convert meters to cm.",
                    latex: `${realM} \\\\text{ m} = ${realCm} \\\\text{ cm}`
                },
                {
                    text: lang === 'sv' ? "Dela med skalans tal." : "Divide by the scale factor.",
                    latex: `${realCm} / ${scale} = ${answer}`
                }
            ];
        }

        // --- Scenario 3: The Microscopist (Magnification X:1) ---
        else {
            const scale = MathUtils.randomChoice([10, 20, 50, 100]);
            const realMm = MathUtils.randomChoice([0.5, 1, 2, 4, 5]); 
            const imageMm = realMm * scale;
            answer = imageMm / 10; // Convert to cm
            suffix = 'cm';

            desc = lang === 'sv'
                ? `En insekt är ${realMm} mm lång. Den fotograferas i skala ${scale}:1. Hur lång blir insekten på bilden? Svara i cm.`
                : `An insect is ${realMm} mm long. It is photographed in scale ${scale}:1. How long is the insect in the picture? Answer in cm.`;

            visualData = {
                type: 'scale_compare',
                leftLabel: lang === 'sv' ? 'Bild' : 'Image',
                rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                leftValue: scale,
                rightValue: 1,
                shape: 'ladybug' 
            };

            clues = [
                {
                    text: lang === 'sv' ? "Skalan X:1 betyder att bilden är större." : "Scale X:1 means the image is larger.",
                    latex: `${realMm} \\\\text{ mm} \\\\cdot ${scale} = ${imageMm} \\\\text{ mm}`
                },
                {
                    text: lang === 'sv' ? "Svaret ska vara i cm." : "The answer must be in cm.",
                    latex: `${imageMm} / 10 = ${answer}`
                }
            ];
        }

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: visualData,
                suffix: suffix
            },
            token: Buffer.from(answer.toString()).toString('base64'),
            clues: clues
        };
    }

    // Level 4: Determine Scale (Given two values, find Ratio)
    private level4_DetermineScale(lang: string): any {
        const scale = MathUtils.randomChoice([10, 20, 50, 100]);
        const drawCm = MathUtils.randomInt(2, 8);
        const realM = (drawCm * scale) / 100;

        const desc = lang === 'sv'
            ? `Ett rum är ${realM} m långt. På ritningen är det ${drawCm} cm. Vilken skala är ritningen? Svara som 1:X.`
            : `A room is ${realM} m long. On the drawing it is ${drawCm} cm. What is the scale? Answer as 1:X.`;

        return {
            renderData: {
                description: desc,
                answerType: 'text',
                placeholder: '1:...'
            },
            token: Buffer.from(`1:${scale}`).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Gör om till samma enhet (cm)." : "Convert to same unit (cm).", latex: `${realM} \\\\text{ m} = ${realM*100} \\\\text{ cm}` },
                { text: lang === 'sv' ? "Jämför bild och verklighet." : "Compare image and reality.", latex: `${drawCm} : ${realM*100}` },
                { text: lang === 'sv' ? "Förkorta med bildens mått." : "Simplify by dividing by drawing size.", latex: `1 : ${(realM*100)/drawCm}` }
            ]
        };
    }

    // ========================================================================
    // LEVEL 5: WORD PROBLEMS (Updated Scenarios)
    // Pure text problems testing multiple aspects of scale without visuals
    // ========================================================================
    private level5_NoPictures(lang: string): any {
        const scenario = MathUtils.randomChoice([0, 1, 2, 3]);
        let desc = "";
        let answer: number | string = 0;
        let suffix = "";
        let clueList: any[] = [];
        let placeholder = "";
        let answerType = 'numeric';

        // Scenario 0: The Road Trip (Map Reading -> Km)
        if (scenario === 0) {
            const scale = MathUtils.randomChoice([50000, 100000, 200000, 500000]);
            const distCm = MathUtils.randomInt(5, 25);
            const realCm = distCm * scale;
            const realKm = realCm / 100000;
            
            answer = realKm;
            suffix = 'km';
            
            desc = lang === 'sv'
                ? `Du planerar en bilresa. På kartan (skala 1:${MathUtils.formatNumber(scale)}) är vägen ${distCm} cm lång. Hur lång är resan i verkligheten? Svara i km.`
                : `You are planning a road trip. On the map (scale 1:${MathUtils.formatNumber(scale)}), the road is ${distCm} cm long. How long is the trip in reality? Answer in km.`;

            clueList = [
                { text: lang === 'sv' ? "Räkna ut cm i verkligheten." : "Calculate real cm.", latex: `${distCm} \\\\cdot ${scale} = ${MathUtils.formatNumber(realCm)}` },
                { text: lang === 'sv' ? "Omvandla till km (100 000 cm = 1 km)." : "Convert to km (100,000 cm = 1 km).", latex: `${realCm} / 100000` }
            ];
        }

        // Scenario 1: The Skyscraper Model (Real -> Model)
        else if (scenario === 1) {
            const realHeightM = MathUtils.randomChoice([100, 200, 300, 400, 500]);
            const scale = MathUtils.randomChoice([100, 200, 500, 1000]);
            const realCm = realHeightM * 100;
            let safeScale = scale;
            if (realCm % scale !== 0) safeScale = 100;

            answer = realCm / safeScale;
            suffix = 'cm';

            desc = lang === 'sv'
                ? `En skyskrapa är ${realHeightM} meter hög. En arkitekt bygger en modell i skala 1:${safeScale}. Hur hög blir modellen? Svara i cm.`
                : `A skyscraper is ${realHeightM} meters high. An architect builds a model in scale 1:${safeScale}. How high is the model? Answer in cm.`;
            
            clueList = [
                { text: lang === 'sv' ? "Gör om höjden till cm." : "Convert height to cm.", latex: `${realHeightM} \\\\cdot 100` },
                { text: lang === 'sv' ? "Dela med skalan." : "Divide by the scale.", latex: `${realCm} / ${safeScale}` }
            ];
        }

        // Scenario 2: Finding the Scale (Souvenir)
        else if (scenario === 2) {
            const realM = MathUtils.randomInt(50, 300); 
            const modelCm = MathUtils.randomChoice([10, 20, 25, 50]);
            const targetScale = MathUtils.randomChoice([100, 200, 500, 1000]);
            const fixedRealM = (modelCm * targetScale) / 100;

            answer = `1:${targetScale}`;
            answerType = 'text';
            placeholder = '1:...';

            desc = lang === 'sv'
                ? `Ett torn är ${fixedRealM} meter högt. En souvenir-modell är ${modelCm} cm hög. I vilken skala är modellen byggd? (Svara 1:X)`
                : `A tower is ${fixedRealM} meters high. A souvenir model is ${modelCm} cm high. What is the scale of the model? (Answer 1:X)`;

            clueList = [
                { text: lang === 'sv' ? "Jämför verklighet (cm) med modell (cm)." : "Compare reality (cm) with model (cm).", latex: `${fixedRealM * 100} : ${modelCm}` },
                { text: lang === 'sv' ? "Dividera verkligheten med modellens höjd." : "Divide reality by model height.", latex: `${fixedRealM * 100} / ${modelCm} = ${targetScale}` }
            ];
        }

        // Scenario 3: Digital Zoom (Magnification)
        else {
            const widthMm = MathUtils.randomChoice([2, 5, 8, 10]);
            const zoom = MathUtils.randomChoice([5, 10, 20]);
            const imageMm = widthMm * zoom;
            
            answer = imageMm;
            suffix = 'mm';

            desc = lang === 'sv'
                ? `En datorkrets är ${widthMm} mm bred. Du tittar på den i ett mikroskop som förstorar ${zoom} gånger (Skala ${zoom}:1). Hur bred ser den ut att vara? Svara i mm.`
                : `A computer chip is ${widthMm} mm wide. You view it in a microscope with ${zoom}x magnification (Scale ${zoom}:1). How wide does it appear? Answer in mm.`;

            clueList = [
                { text: lang === 'sv' ? "Skalan X:1 betyder att bilden är större." : "Scale X:1 means image is larger.", latex: `${widthMm} \\\\cdot ${zoom}` }
            ];
        }

        return {
            renderData: {
                description: desc,
                answerType: answerType,
                placeholder: placeholder,
                geometry: null, 
                suffix: suffix
            },
            token: Buffer.from(answer.toString()).toString('base64'),
            clues: clueList
        };
    }

    // ========================================================================
    // LEVEL 6: AREA SCALE (FIXED)
    // Ensures valid dimensions (width/height) are sent to visual, not just area
    // ========================================================================
    private level6_AreaScale(lang: string): any {
        // Restrict to shapes that render nicely for comparisons
        const shape = MathUtils.randomChoice(['rectangle', 'triangle']);
        
        let dims: any = {};
        let baseArea = 0;

        // 1. Generate VALID dimensions for the renderer first
        if (shape === 'rectangle') {
            const w = MathUtils.randomInt(2, 6);
            const h = MathUtils.randomInt(2, 6);
            dims = { width: w, height: h };
            baseArea = w * h;
        } else if (shape === 'triangle') {
            // Ensure area is integer: Area = (b*h)/2
            let b = MathUtils.randomInt(2, 6);
            let h = MathUtils.randomInt(2, 6);
            if ((b * h) % 2 !== 0) b += 1; // Make product even
            dims = { width: b, height: h, subtype: 'isosceles' }; // Renderer uses 'width' as base
            baseArea = (b * h) / 2;
        }

        const L = MathUtils.randomInt(2, 5); // Length Scale 1:L
        const A = L * L; // Area Scale
        const bigArea = baseArea * A;

        const desc = lang === 'sv' 
            ? `Längdskalan är 1:${L}. Lilla arean är ${baseArea} cm². Hur stor är den stora arean?`
            : `Length scale 1:${L}. Small area ${baseArea} cm². How big is the large area?`;

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: { 
                    type: 'compare_shapes_area', 
                    shapeType: shape, 
                    // PASS THE DIMENSIONS! The renderer needs 'width' and 'height' keys to draw.
                    left: { ...dims, label: lang === 'sv'?'Bild':'Image', area: baseArea }, 
                    right: { ...dims, label: lang === 'sv'?'Verklighet':'Reality', area: '?' } 
                },
                suffix: 'cm²'
            },
            token: Buffer.from(bigArea.toString()).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' ? "Kom ihåg: Areaskalan är längdskalan upphöjt till 2." : "Remember: Area scale is length scale squared.", 
                    latex: `A_{skala} = L_{skala}^2 = ${L}^2 = ${A}` 
                },
                { 
                    text: lang === 'sv' ? `Arean blir ${A} gånger större.` : `Area becomes ${A} times larger.`, 
                    latex: `${baseArea} \\\\cdot ${A} = ${bigArea}` 
                }
            ]
        };
    }

    // Level 7: Mixed Bag
    private level7_Mixed(lang: string): any {
        const subLevel = MathUtils.randomInt(2, 6);
        return this.generate(subLevel, lang);
    }
} 