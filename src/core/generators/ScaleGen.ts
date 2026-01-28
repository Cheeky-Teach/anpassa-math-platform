import { MathUtils } from '../utils/MathUtils.js';

export class ScaleGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Concepts(lang);
            case 2: return this.level2_CalcLengthSimple(lang);
            case 3: return this.level3_CalcLengthHard(lang);
            case 4: return this.level4_DetermineScale(lang);
            case 5: return this.level5_NoPictures(lang);
            case 6: return this.level6_AreaScale(lang);
            case 7: return this.level7_Mixed(lang);
            default: return this.level1_Concepts(lang);
        }
    }

    // --- Level 1: Conceptual (Multiple Choice) ---
    private level1_Concepts(lang: string): any {
        const isReduction = MathUtils.randomInt(0, 1) === 1;
        const ratio = MathUtils.randomChoice([2, 5, 10, 20, 50, 100]);
        const scaleStr = isReduction ? `1:${ratio}` : `${ratio}:1`;
        
        // Two types of conceptual questions
        const qType = MathUtils.randomInt(1, 2);
        
        let description = "";
        let correct = "";
        let wrong = "";
        let clue = "";

        if (qType === 1) {
            // Type 1: Enlargement or Reduction?
            description = lang === 'sv' 
                ? `Visar skalan ${scaleStr} en förstoring eller en förminskning?` 
                : `Does the scale ${scaleStr} show an enlargement or a reduction?`;
            
            if (isReduction) {
                correct = lang === 'sv' ? "Förminskning" : "Reduction";
                wrong = lang === 'sv' ? "Förstoring" : "Enlargement";
                clue = lang === 'sv' ? "Det första talet är 1 (bilden), det andra är större (verkligheten)." : "The first number is 1 (image), the second is larger (reality).";
            } else {
                correct = lang === 'sv' ? "Förstoring" : "Enlargement";
                wrong = lang === 'sv' ? "Förminskning" : "Reduction";
                clue = lang === 'sv' ? "Det första talet är större än 1 (bilden är stor)." : "The first number is larger than 1 (image is large).";
            }
        } else {
            // Type 2: Which is larger?
            description = lang === 'sv' 
                ? `Skalan är ${scaleStr}. Vad är störst: bilden eller verkligheten?` 
                : `The scale is ${scaleStr}. Which is larger: the image or reality?`;
            
            if (isReduction) {
                correct = lang === 'sv' ? "Verkligheten" : "Reality";
                wrong = lang === 'sv' ? "Bilden" : "The image";
                clue = lang === 'sv' ? "1 cm på bilden motsvarar många cm i verkligheten." : "1 cm on the image equals many cm in reality.";
            } else {
                correct = lang === 'sv' ? "Bilden" : "The image";
                wrong = lang === 'sv' ? "Verkligheten" : "Reality";
                clue = lang === 'sv' ? "Många cm på bilden är bara 1 cm i verkligheten." : "Many cm on the image is just 1 cm in reality.";
            }
        }

        const choices = Math.random() > 0.5 ? [correct, wrong] : [wrong, correct];

        return {
            renderData: {
                text_key: "concept",
                description: description,
                latex: scaleStr,
                answerType: 'multiple_choice',
                choices: choices,
                // Use a generic visual if desired, or none
                geometry: { type: 'scale_single', shape: 'magnifying_glass', label: scaleStr }
            },
            token: Buffer.from(correct).toString('base64'),
            serverData: {
                answer: correct,
                solutionSteps: [
                    { text: clue, latex: "" }
                ]
            }
        };
    }

    // --- Level 2: Simple Length (Integer Multipliers) ---
    private level2_CalcLengthSimple(lang: string): any {
        const scale = MathUtils.randomChoice([2, 3, 4, 5, 10]);
        const imgVal = MathUtils.randomInt(2, 12);
        
        // Randomize 1:X vs X:1
        const isReduction = MathUtils.randomInt(0, 1) === 1;
        const scaleStr = isReduction ? `1:${scale}` : `${scale}:1`;
        
        const subType = MathUtils.randomInt(0, 1); // 0 = Find Real, 1 = Find Drawing
        
        let answer = 0;
        let desc = "";
        let geomLabel = "";
        let steps = [];

        const shape = MathUtils.randomChoice(['arrow', 'star', 'lightning', 'key']);
        const shapeName = lang === 'sv' ? "figuren" : "the shape";

        if (isReduction) {
            // Scale 1:X
            if (subType === 0) { // Find Real
                const realVal = imgVal * scale;
                answer = realVal;
                desc = lang === 'sv' 
                    ? `På ritningen är ${shapeName} ${imgVal} cm. Skalan är ${scaleStr}. Hur lång är den i verkligheten? (cm)`
                    : `On the drawing ${shapeName} is ${imgVal} cm. Scale is ${scaleStr}. How long in reality? (cm)`;
                geomLabel = `${imgVal} cm`;
                steps.push({ text: lang === 'sv' ? "Verkligheten = Bilden · Skalan" : "Reality = Image · Scale", latex: `${imgVal} \\cdot ${scale} = \\mathbf{${realVal}}` });
            } else { // Find Drawing
                const realVal = imgVal * scale; // imgVal is actually the answer we want
                answer = imgVal;
                desc = lang === 'sv'
                    ? `I verkligheten är ${shapeName} ${realVal} cm. Skalan är ${scaleStr}. Hur lång på ritningen? (cm)`
                    : `In reality ${shapeName} is ${realVal} cm. Scale is ${scaleStr}. How long on drawing? (cm)`;
                geomLabel = `${realVal} cm (Real)`; // Label visual as 'Real' implies we need 'Image'
                steps.push({ text: lang === 'sv' ? "Bilden = Verkligheten / Skalan" : "Image = Reality / Scale", latex: `\\frac{${realVal}}{${scale}} = \\mathbf{${imgVal}}` });
            }
        } else {
            // Scale X:1 (Enlargement)
            if (subType === 0) { // Find Drawing
                const realVal = imgVal;
                const drawVal = realVal * scale;
                answer = drawVal;
                desc = lang === 'sv'
                    ? `I verkligheten är ${shapeName} ${realVal} cm. Skalan är ${scaleStr}. Hur stor blir den på bild? (cm)`
                    : `In reality ${shapeName} is ${realVal} cm. Scale is ${scaleStr}. How big on image? (cm)`;
                geomLabel = `${realVal} cm (Real)`;
                steps.push({ text: lang === 'sv' ? "Bilden = Verkligheten · Skalan" : "Image = Reality · Scale", latex: `${realVal} \\cdot ${scale} = \\mathbf{${drawVal}}` });
            } else { // Find Reality
                const realVal = imgVal;
                const drawVal = realVal * scale;
                answer = realVal;
                desc = lang === 'sv'
                    ? `På bilden är ${shapeName} ${drawVal} cm. Skalan är ${scaleStr}. Hur stor är den i verkligheten? (cm)`
                    : `On image ${shapeName} is ${drawVal} cm. Scale is ${scaleStr}. How big in reality? (cm)`;
                geomLabel = `${drawVal} cm`;
                steps.push({ text: lang === 'sv' ? "Verkligheten = Bilden / Skalan" : "Reality = Image / Scale", latex: `\\frac{${drawVal}}{${scale}} = \\mathbf{${realVal}}` });
            }
        }

        return {
            renderData: {
                text_key: "calc_len",
                description: desc,
                latex: scaleStr,
                answerType: 'numeric',
                geometry: { type: 'scale_single', shape, label: geomLabel }
            },
            token: Buffer.from(answer.toString()).toString('base64'),
            serverData: { answer, solutionSteps: steps }
        };
    }

    // --- Level 3: Harder Length (Decimals/Map) ---
    private level3_CalcLengthHard(lang: string): any {
        const scale = MathUtils.randomChoice([1000, 5000, 10000, 20000, 50000]);
        const cm = MathUtils.randomInt(2, 15); 
        const realCm = cm * scale;
        
        // Convert to appropriate unit
        const realM = realCm / 100;
        const realKm = realM / 1000;
        const useKm = realKm >= 1;
        const answer = useKm ? realKm : realM;
        const unit = useKm ? "km" : "m";

        const desc = lang === 'sv'
            ? `På en karta är avståndet ${cm} cm. Skalan är 1:${scale}. Hur långt är det i verkligheten? (Svara i ${unit})`
            : `On a map distance is ${cm} cm. Scale is 1:${scale}. How far in reality? (Answer in ${unit})`;

        const steps = [
            { text: lang === 'sv' ? "1. Räkna ut cm i verkligheten." : "1. Calculate cm in reality.", latex: `${cm} \\cdot ${scale} = ${realCm} \\text{ cm}` },
            { 
                text: lang === 'sv' ? `2. Omvandla till ${unit}.` : `2. Convert to ${unit}.`, 
                latex: useKm ? `\\frac{${realCm}}{100000} = ${realKm}` : `\\frac{${realCm}}{100} = ${realM}` 
            }
        ];

        return {
            renderData: {
                latex: `1:${scale}`,
                description: desc,
                answerType: 'numeric',
                geometry: { type: 'scale_single', shape: 'map', label: `${cm} cm` }
            },
            token: Buffer.from(answer.toString()).toString('base64'),
            serverData: { answer, solutionSteps: steps }
        };
    }

    // --- Level 4: Determine Scale ---
    private level4_DetermineScale(lang: string): any {
        const factor = MathUtils.randomChoice([2, 3, 4, 5]);
        const base = MathUtils.randomInt(2, 8);
        const enlarged = base * factor;
        
        // Randomize 1:X vs X:1 context
        const isReduction = MathUtils.randomInt(0, 1) === 1;
        
        let leftLabel, rightLabel, leftVal, rightVal, ansLeft, ansRight;
        
        if (isReduction) {
            // Real is bigger
            leftLabel = lang === 'sv' ? "Bild" : "Image";
            rightLabel = lang === 'sv' ? "Verklighet" : "Reality";
            leftVal = `${base} cm`;
            rightVal = `${enlarged} cm`;
            ansLeft = 1; ansRight = factor;
        } else {
            // Image is bigger
            leftLabel = lang === 'sv' ? "Verklighet" : "Reality";
            rightLabel = lang === 'sv' ? "Bild" : "Image";
            leftVal = `${base} cm`;
            rightVal = `${enlarged} cm`;
            ansLeft = factor; ansRight = 1;
        }

        const steps = [
            { text: lang === 'sv' ? "Ställ upp förhållandet Bild : Verklighet." : "Set up ratio Image : Reality.", latex: isReduction ? `${base} : ${enlarged}` : `${enlarged} : ${base}` },
            { text: lang === 'sv' ? "Förenkla genom att dela med det minsta talet." : "Simplify by dividing by the smallest number.", latex: `\\frac{${enlarged}}{${base}} = ${factor}` }
        ];

        return {
            renderData: {
                description: lang === 'sv' ? "Bestäm skalan." : "Determine the scale.",
                answerType: 'scale',
                geometry: { type: 'scale_compare', shape: 'rectangle', leftLabel, rightLabel, leftValue: leftVal, rightValue: rightVal }
            },
            token: Buffer.from(`${ansLeft}:${ansRight}`).toString('base64'),
            serverData: { answer: { left: ansLeft, right: ansRight }, solutionSteps: steps }
        };
    }

    // --- Level 5: No Pictures (Word Problems) ---
    private level5_NoPictures(lang: string): any {
        // Tower example from legacy
        const hRealM = MathUtils.randomChoice([20, 50, 80, 100]);
        const ratio = MathUtils.randomChoice([100, 200, 400]);
        const hRealCm = hRealM * 100;
        const hModelCm = hRealCm / ratio; // Should be integer

        const desc = lang === 'sv'
            ? `Ett torn är ${hRealM} m högt. En modell är ${hModelCm} cm hög. Vilken är skalan?`
            : `A tower is ${hRealM} m high. A model is ${hModelCm} cm high. What is the scale?`;

        const steps = [
            { text: lang === 'sv' ? "Gör om till samma enhet (cm)." : "Convert to same unit (cm).", latex: `${hRealM} \\text{ m} = ${hRealCm} \\text{ cm}` },
            { text: lang === 'sv' ? "Ställ upp Bild : Verklighet." : "Set up Image : Reality.", latex: `${hModelCm} : ${hRealCm}` },
            { text: lang === 'sv' ? "Förenkla." : "Simplify.", latex: `1 : \\frac{${hRealCm}}{${hModelCm}} = 1:${ratio}` }
        ];

        return {
            renderData: { description: desc, answerType: 'scale' },
            token: Buffer.from(`1:${ratio}`).toString('base64'),
            serverData: { answer: { left: 1, right: ratio }, solutionSteps: steps }
        };
    }

    // --- Level 6: Area Scale ---
    private level6_AreaScale(lang: string): any {
        const L = MathUtils.randomInt(2, 5); 
        const A = L * L;
        const baseArea = MathUtils.randomInt(2, 10);
        const realArea = baseArea * A;

        const desc = lang === 'sv'
            ? `Längdskalan är 1:${L}. Den lilla figuren har arean ${baseArea} cm². Vad är den stora figurens area?`
            : `Length scale is 1:${L}. Small shape area is ${baseArea} cm². What is the large shape area?`;

        const steps = [
            { text: lang === 'sv' ? "Areaskalan = (Längdskalan)²" : "Area Scale = (Length Scale)²", latex: `${L}^2 = ${A}` },
            { text: lang === 'sv' ? "Arean blir alltså A gånger större." : "So the area becomes A times larger.", latex: `${baseArea} \\cdot ${A} = \\mathbf{${realArea}}` }
        ];

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: { type: 'compare_shapes_area', shapeType: 'square', left: { label: 'Bild', area: baseArea }, right: { label: 'Verklighet', area: '?' } }
            },
            token: Buffer.from(realArea.toString()).toString('base64'),
            serverData: { answer: realArea, solutionSteps: steps }
        };
    }

    private level7_Mixed(lang: string): any {
        return this.generate(MathUtils.randomInt(2, 6), lang);
    }
}