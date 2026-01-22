import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class ScaleGenerator {
    private static readonly SHAPES = [
        'square', 'rectangle', 'circle', 'triangle', 
        'rhombus', 'parallelogram', 'pentagon', 'hexagon', 'octagon',
        'star', 'arrow', 'heart', 'cross', 'lightning', 'kite',
        'cube', 'cylinder', 'pyramid', 'cone', 'sphere'
    ];

    /**
     * Helper to get appropriate scale factors based on difficulty
     */
    private static getScaleFactor(rng: Random, difficult: boolean = false): number {
        if (!difficult) return rng.pick([2, 3, 4, 5, 10]);
        return rng.pick([20, 25, 50, 100, 200, 500, 1000]);
    }

    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        const color = "\\mathbf{\\textcolor{#D35400}}";
        
        let mode = level;
        if (level === 7) mode = rng.intBetween(1, 6);

        let qDesc = { sv: "", en: "" };
        let answerStr = ""; 
        let answerType: any = 'numeric'; // Default to numeric, switch to 'scale' for L4/L6
        let steps: Clue[] = [];
        let renderData: any = {};
        const shape = rng.pick(ScaleGenerator.SHAPES);

        // --- LEVEL 1: Concepts (Simple 1:X Calculation) ---
        if (mode === 1) {
            const scale = rng.pick([2, 5, 10]);
            const drawing = rng.intBetween(1, 5);
            const reality = drawing * scale;
            const findReality = rng.bool(); // True = Find Reality, False = Find Drawing

            if (findReality) {
                answerStr = reality.toString();
                qDesc = { 
                    sv: `Skala 1:${scale}. Bilden är ${drawing} cm. Hur lång är verkligheten?`, 
                    en: `Scale 1:${scale}. The drawing is ${drawing} cm. How long is reality?` 
                };
                steps = [
                    { text: t(lang, {sv: "Verklighet = Bild · Skala", en: "Reality = Image · Scale"}), latex: `V = ${drawing} \\cdot ${scale}` },
                    { text: t(lang, TERMS.common.result), latex: `V = ${color}{${answerStr}}` }
                ];
            } else {
                answerStr = drawing.toString();
                qDesc = { 
                    sv: `Skala 1:${scale}. Verkligheten är ${reality} cm. Hur lång är bilden?`, 
                    en: `Scale 1:${scale}. Reality is ${reality} cm. How long is the drawing?` 
                };
                steps = [
                    { text: t(lang, {sv: "Bild = Verklighet / Skala", en: "Image = Reality / Scale"}), latex: `B = \\frac{${reality}}{${scale}}` },
                    { text: t(lang, TERMS.common.result), latex: `B = ${color}{${answerStr}}` }
                ];
            }

            renderData = { 
                type: 'scale_single', 
                label: `1:${scale}`, 
                shape: shape 
            };
        }

        // --- LEVEL 2 (Simple) & 3 (Hard): Calculate Length ---
        else if (mode === 2 || mode === 3) {
            const isHard = mode === 3;
            const isReduction = rng.bool(); // 1:X (Reduction) vs X:1 (Enlargement)
            const scale = ScaleGenerator.getScaleFactor(rng, isHard);
            
            // Generate nice numbers
            const base = rng.intBetween(2, 9);
            const large = base * scale;
            
            const findLarge = rng.bool(); // Find the larger value (Reality in reduction, Image in enlargement)
            
            // Set values based on Reduction vs Enlargement
            // Reduction 1:S -> Image is small, Reality is large
            // Enlargement S:1 -> Image is large, Reality is small
            
            let scaleLabel = isReduction ? `1:${scale}` : `${scale}:1`;
            let knownVal = 0;
            let knownType = ""; // 'drawing' or 'reality'
            
            if (isReduction) {
                // 1:S
                if (findLarge) { // Find Reality
                    knownVal = base; knownType = 'drawing'; answerStr = large.toString();
                    steps = [{ text: "Calc", latex: `${base} \\cdot ${scale} = ${color}{${answerStr}}` }];
                } else { // Find Drawing
                    knownVal = large; knownType = 'reality'; answerStr = base.toString();
                    steps = [{ text: "Calc", latex: `\\frac{${large}}{${scale}} = ${color}{${answerStr}}` }];
                }
            } else {
                // S:1
                if (findLarge) { // Find Image
                    knownVal = base; knownType = 'reality'; answerStr = large.toString();
                    steps = [{ text: "Calc", latex: `${base} \\cdot ${scale} = ${color}{${answerStr}}` }];
                } else { // Find Reality
                    knownVal = large; knownType = 'drawing'; answerStr = base.toString();
                    steps = [{ text: "Calc", latex: `\\frac{${large}}{${scale}} = ${color}{${answerStr}}` }];
                }
            }

            const kLabel = knownType === 'drawing' ? {sv: "Bild", en: "Drawing"} : {sv: "Verklighet", en: "Reality"};
            const uLabel = knownType === 'drawing' ? {sv: "Verklighet", en: "Reality"} : {sv: "Bild", en: "Drawing"};

            qDesc = {
                sv: `Skala ${scaleLabel}. ${kLabel.sv} är ${knownVal} cm. Vad är ${uLabel.sv.toLowerCase()}?`,
                en: `Scale ${scaleLabel}. ${kLabel.en} is ${knownVal} cm. What is ${uLabel.en.toLowerCase()}?`
            };

            // Visualize comparison
            renderData = {
                type: 'scale_compare',
                leftLabel: kLabel.sv, leftValue: `${knownVal} cm`,
                rightLabel: uLabel.sv, rightValue: "?",
                shape: shape
            };
        }

        // --- LEVEL 4: Find the Scale (X:Y) ---
        else if (mode === 4) {
            const isReduction = rng.bool();
            const scale = ScaleGenerator.getScaleFactor(rng, false);
            const base = rng.intBetween(2, 8);
            const large = base * scale;

            let drawing = 0, reality = 0;
            if (isReduction) { // 1:S
                drawing = base; reality = large;
                answerStr = `1:${scale}`;
            } else { // S:1
                drawing = large; reality = base;
                answerStr = `${scale}:1`;
            }

            qDesc = {
                sv: `Bilden är ${drawing} cm och verkligheten är ${reality} cm. Vad är skalan?`,
                en: `The image is ${drawing} cm and reality is ${reality} cm. What is the scale?`
            };

            steps = [
                { text: t(lang, {sv: "Skala = Bild : Verklighet", en: "Scale = Image : Reality"}), latex: `${drawing} : ${reality}` },
                { text: t(lang, {sv: "Förenkla", en: "Simplify"}), latex: `${color}{${answerStr}}` }
            ];

            renderData = {
                type: 'scale_compare',
                leftLabel: {sv: "Bild", en: "Image"}, leftValue: `${drawing} cm`,
                rightLabel: {sv: "Verklighet", en: "Reality"}, rightValue: `${reality} cm`,
                shape: shape
            };
            answerType = 'scale';
        }

        // --- LEVEL 5: Word Problems (No Pictures) ---
        else if (mode === 5) {
            const scale = rng.pick([50, 100, 500, 1000, 10000]);
            const drawingCm = rng.intBetween(2, 9);
            const realityCm = drawingCm * scale;
            const realityM = realityCm / 100;
            
            // Always "Find Reality in Meters" for variety
            answerStr = realityM.toString(); 

            qDesc = {
                sv: `En karta har skalan 1:${scale}. Avståndet på kartan är ${drawingCm} cm. Hur långt är det i verkligheten (i meter)?`,
                en: `A map has scale 1:${scale}. The distance on the map is ${drawingCm} cm. How far is it in reality (in meters)?`
            };

            steps = [
                { text: "Cm", latex: `${drawingCm} \\cdot ${scale} = ${realityCm} \\text{ cm}` },
                { text: "To Meters", latex: `\\frac{${realityCm}}{100} = ${color}{${answerStr}} \\text{ m}` }
            ];

            renderData = { type: 'scale_single', label: `1:${scale}`, shape: 'map_icon' }; // map_icon not implemented, will fallback
        }

        // --- LEVEL 6: Area Scale (Already implemented correctly) ---
        else if (mode === 6) {
             const isReduction = rng.intBetween(0, 1) === 1;
             const factor = rng.pick([2, 3, 4, 5, 10]); 
             const aFactor = factor * factor; 
             const aScaleStr = isReduction ? `1:${aFactor}` : `${aFactor}:1`;
             
             const lScaleLeft = isReduction ? 1 : factor;
             const lScaleRight = isReduction ? factor : 1;
             
             answerStr = `${lScaleLeft}:${lScaleRight}`;

             qDesc = { sv: `Areaskalan är ${aScaleStr}. Vad är längdskalan?`, en: `The area scale is ${aScaleStr}. What is the length scale?` };
             const clueLatex = isReduction ? `(\\sqrt{1} : \\sqrt{${aFactor}})` : `(\\sqrt{${aFactor}} : \\sqrt{1})`;
             
             steps = [{ text: t(lang, {sv: "Längdskala = √Areaskala", en: "Length Scale = √Area Scale"}), latex: `${clueLatex} \\\\implies ${color}{${answerStr}}}` }];
             
             renderData = { type: 'scale_single', label: aScaleStr, shape: 'square' };
             answerType = 'scale';
        } 

        return {
            questionId: `scale-l${level}-${seed}`,
            renderData: {
                text_key: "scale_calc",
                description: qDesc,
                latex: "",
                answerType: answerType,
                ...renderData
            },
            serverData: {
                answer: answerStr,
                solutionSteps: steps
            }
        };
    }
}