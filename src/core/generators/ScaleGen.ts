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

    // --- Level 1: Concepts (What does 1:100 mean?) ---
    private level1_Concepts(lang: string): any {
        const scale = MathUtils.randomChoice([10, 50, 100, 1000]);
        const isReduction = Math.random() > 0.5;
        
        let latex = isReduction ? `1:${scale}` : `${scale}:1`;
        let question = "";
        let correct = "";
        let dist = ["", "", ""];

        if (isReduction) {
            question = lang === 'sv' ? "Vad betyder skalan?" : "What does the scale mean?";
            correct = lang === 'sv' 
                ? `Verkligheten är ${scale} gånger större än bilden.` 
                : `Reality is ${scale} times larger than the image.`;
            dist = [
                lang === 'sv' ? `Bilden är ${scale} gånger större än verkligheten.` : `The image is ${scale} times larger than reality.`,
                lang === 'sv' ? `Bilden och verkligheten är lika stora.` : `The image and reality are the same size.`,
                lang === 'sv' ? `1 cm i verkligheten är ${scale} cm på bilden.` : `1 cm in reality is ${scale} cm on the image.`
            ];
        } else {
            question = lang === 'sv' ? "Vad betyder skalan (förstoring)?" : "What does the scale mean (enlargement)?";
            correct = lang === 'sv' 
                ? `Bilden är ${scale} gånger större än verkligheten.` 
                : `The image is ${scale} times larger than reality.`;
            dist = [
                lang === 'sv' ? `Verkligheten är ${scale} gånger större än bilden.` : `Reality is ${scale} times larger than the image.`,
                lang === 'sv' ? `1 cm på bilden är 1 cm i verkligheten.` : `1 cm on the image is 1 cm in reality.`,
                lang === 'sv' ? `Det går inte att avgöra.` : `It is impossible to tell.`
            ];
        }

        const choices = [correct, ...dist].sort(() => Math.random() - 0.5);

        return {
            renderData: {
                latex,
                description: question,
                answerType: 'multiple_choice',
                choices: choices
            },
            token: Buffer.from(correct).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Bild : Verklighet" : "Image : Reality" },
                { text: lang === 'sv' ? "Är det en förminskning eller förstoring?" : "Is it a reduction or enlargement?" }
            ]
        };
    }

    // --- Level 2: Simple Length Calc (Integer Multipliers) ---
    private level2_CalcLengthSimple(lang: string): any {
        const scale = MathUtils.randomChoice([2, 3, 4, 5, 10]);
        const imgVal = MathUtils.randomInt(2, 12);
        const realVal = imgVal * scale;
        
        // Visual: Single shape with label
        const shape = MathUtils.randomChoice(['arrow', 'star', 'lightning', 'key']);
        
        return {
            renderData: {
                // Use 'scale_single' type for icon visual
                geometry: { 
                    type: 'scale_single', 
                    shape: shape, 
                    label: `${imgVal} cm` 
                },
                description: lang === 'sv' 
                    ? `Skala 1:${scale}. Hur lång är den i verkligheten?` 
                    : `Scale 1:${scale}. How long is it in reality?`,
                answerType: 'text'
            },
            token: Buffer.from(realVal.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Verkligheten = Bilden · Skalan" : "Reality = Image · Scale", latex: `x = ${imgVal} \\cdot ${scale}` }
            ]
        };
    }

    // --- Level 3: Harder Length (Decimals/Map) ---
    private level3_CalcLengthHard(lang: string): any {
        const scale = MathUtils.randomChoice([1000, 5000, 10000, 50000]);
        const cm = MathUtils.randomInt(2, 15); // Map distance in cm
        const realCm = cm * scale;
        const realM = realCm / 100;
        const realKm = realM / 1000;

        // Decide unit: m or km based on size
        const useKm = realKm >= 1;
        const ans = useKm ? realKm : realM;
        const unit = useKm ? "km" : "m";

        return {
            renderData: {
                latex: `1:${scale}`,
                description: lang === 'sv' 
                    ? `På en karta är avståndet ${cm} cm. Hur långt är det i verkligheten (svara i ${unit})?` 
                    : `On a map the distance is ${cm} cm. How far is it in reality (answer in ${unit})?`,
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Räkna först om till cm i verkligheten." : "First calculate cm in reality.", latex: `${cm} \\cdot ${scale} = ${realCm} \\text{ cm}` },
                { text: lang === 'sv' ? `Omvandla till ${unit}. (100 cm = 1 m, 1000 m = 1 km)` : `Convert to ${unit}. (100 cm = 1 m, 1000 m = 1 km)` }
            ]
        };
    }

    // --- Level 4: Determine Scale (Visual Comparison) ---
    private level4_DetermineScale(lang: string): any {
        const factor = MathUtils.randomChoice([2, 3, 4, 5]);
        const base = MathUtils.randomInt(2, 8);
        const enlarged = base * factor;
        
        // Format 1:X
        const ans = `1:${factor}`;

        return {
            renderData: {
                // Use 'scale_compare' visual type
                geometry: {
                    type: 'scale_compare',
                    shape: 'rectangle', // Standard easy shape
                    leftLabel: lang === 'sv' ? 'Bild' : 'Image',
                    leftValue: `${base} cm`,
                    rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                    rightValue: `${enlarged} cm`
                },
                description: lang === 'sv' ? "Vilken är skalan?" : "What is the scale?",
                answerType: 'scale' // Special input type handled by Frontend
            },
            token: Buffer.from(ans).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Skala = Bild : Verklighet" : "Scale = Image : Reality" },
                { text: lang === 'sv' ? "Förenkla kvoten." : "Simplify the ratio.", latex: `\\frac{${base}}{${enlarged}} = \\frac{1}{${factor}}` }
            ]
        };
    }

    // --- Level 5: No Pictures (Word Problems) ---
    private level5_NoPictures(lang: string): any {
        // "A tower is 50m high. A model is 25cm high. What is the scale?"
        const hRealM = MathUtils.randomChoice([20, 50, 100]);
        const ratio = MathUtils.randomChoice([100, 200]); // Scale 1:100 or 1:200
        const hRealCm = hRealM * 100;
        const hModelCm = hRealCm / ratio;

        const ans = `1:${ratio}`;

        return {
            renderData: {
                latex: "",
                description: lang === 'sv' 
                    ? `Ett torn är ${hRealM} m högt. En modell av tornet är ${hModelCm} cm hög. Vilken är skalan?` 
                    : `A tower is ${hRealM} m high. A model is ${hModelCm} cm high. What is the scale?`,
                answerType: 'scale'
            },
            token: Buffer.from(ans).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Gör om till samma enhet (cm)." : "Convert to the same unit (cm).", latex: `${hRealM} \\text{ m} = ${hRealCm} \\text{ cm}` },
                { latex: `\\text{Skala} = \\frac{\\text{Bild}}{\\text{Verklighet}} = \\frac{${hModelCm}}{${hRealCm}}` }
            ]
        };
    }

    // --- Level 6: Area Scale (Squared Relationship) ---
    private level6_AreaScale(lang: string): any {
        // Length scale L: 1:3 -> Area Scale A: 1:9
        const L = MathUtils.randomInt(2, 5); 
        const A = L * L;
        
        // Base area
        const baseArea = MathUtils.randomInt(2, 10);
        const realArea = baseArea * A;

        return {
            renderData: {
                // Use 'compare_shapes_area' visual type from GeometryComponents
                geometry: {
                    type: 'compare_shapes_area',
                    shapeType: 'square',
                    left: { label: 'Bild', width: 10, area: baseArea }, // Width is arbitrary for visual relative size
                    right: { label: 'Verklighet', width: 10 * 1.5, area: "?" } // Visual size slightly larger
                },
                description: lang === 'sv' 
                    ? `Längdskalan är 1:${L}. Vad är arean i verkligheten?` 
                    : `Length scale is 1:${L}. What is the area in reality?`,
                answerType: 'text'
            },
            token: Buffer.from(realArea.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Areaskalan = (Längdskalan)²" : "Area Scale = (Length Scale)²", latex: `${L}^2 = ${A}` },
                { text: lang === 'sv' ? `Arean blir ${A} gånger större.` : `The area becomes ${A} times larger.`, latex: `${baseArea} \\cdot ${A} = ${realArea}` }
            ]
        };
    }

    // --- Level 7: Mixed ---
    private level7_Mixed(lang: string): any {
        const lvl = MathUtils.randomInt(2, 6);
        return this.generate(lvl, lang);
    }
}