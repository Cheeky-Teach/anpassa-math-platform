import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class ScaleGenerator {
    // Safer static method access or internal definition to prevent load issues
    private static getShape(rng: Random) {
        const SHAPES = [
            'square', 'rectangle', 'circle', 'triangle', 
            'rhombus', 'parallelogram', 'pentagon', 'hexagon', 'octagon',
            'star', 'arrow', 'heart', 'cross', 'lightning', 'kite',
            'cube', 'cylinder', 'pyramid', 'cone', 'sphere'
        ];
        return rng.pick(SHAPES);
    }

    private static getScaleFactor(rng: Random, difficult: boolean = false): number {
        if (!difficult) return rng.pick([2, 3, 4, 5, 10]);
        return rng.pick([20, 25, 50, 100, 200, 500, 1000]);
    }

    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        // FIX: Use formatColor for valid LaTeX
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;
        
        let mode = level;
        if (level === 7) mode = rng.intBetween(1, 6);

        let qDesc = { sv: "", en: "" };
        let answerStr = ""; 
        let answerType: any = 'numeric';
        let steps: Clue[] = [];
        let renderData: any = {};
        const shape = ScaleGenerator.getShape(rng);

        // --- LEVEL 1: Concepts ---
        if (mode === 1) {
            const scale = rng.pick([2, 5, 10]);
            const drawing = rng.intBetween(1, 5);
            const reality = drawing * scale;
            const findReality = rng.bool(); 

            if (findReality) {
                answerStr = reality.toString();
                qDesc = { 
                    sv: `Skala 1:${scale}. Bilden är ${drawing} cm. Hur lång är verkligheten?`, 
                    en: `Scale 1:${scale}. The drawing is ${drawing} cm. How long is reality?` 
                };
                steps = [
                    { text: t(lang, {sv: "Verklighet = Bild · Skala", en: "Reality = Image · Scale"}), latex: `V = ${drawing} \\cdot ${scale}` },
                    { text: t(lang, TERMS.common.result), latex: `V = ${formatColor(answerStr)}` }
                ];
            } else {
                answerStr = drawing.toString();
                qDesc = { 
                    sv: `Skala 1:${scale}. Verkligheten är ${reality} cm. Hur lång är bilden?`, 
                    en: `Scale 1:${scale}. Reality is ${reality} cm. How long is the drawing?` 
                };
                steps = [
                    { text: t(lang, {sv: "Bild = Verklighet / Skala", en: "Image = Reality / Scale"}), latex: `B = \\frac{${reality}}{${scale}}` },
                    { text: t(lang, TERMS.common.result), latex: `B = ${formatColor(answerStr)}` }
                ];
            }

            renderData = { type: 'scale_single', label: `1:${scale}`, shape: shape };
        }

        // --- LEVEL 2 & 3: Calculate Length ---
        else if (mode === 2 || mode === 3) {
            const isHard = mode === 3;
            const isReduction = rng.bool(); 
            const scale = ScaleGenerator.getScaleFactor(rng, isHard);
            const base = rng.intBetween(2, 9);
            const large = base * scale;
            const findLarge = rng.bool(); 
            
            let scaleLabel = isReduction ? `1:${scale}` : `${scale}:1`;
            let knownVal = 0;
            let knownType = "";
            
            if (isReduction) { // 1:S
                if (findLarge) { // Find Reality
                    knownVal = base; knownType = 'drawing'; answerStr = large.toString();
                    steps = [{ text: t(lang, TERMS.common.calculate), latex: `${base} \\cdot ${scale} = ${formatColor(answerStr)}` }];
                } else { // Find Drawing
                    knownVal = large; knownType = 'reality'; answerStr = base.toString();
                    steps = [{ text: t(lang, TERMS.common.calculate), latex: `\\frac{${large}}{${scale}} = ${formatColor(answerStr)}` }];
                }
            } else { // S:1
                if (findLarge) { // Find Image
                    knownVal = base; knownType = 'reality'; answerStr = large.toString();
                    steps = [{ text: t(lang, TERMS.common.calculate), latex: `${base} \\cdot ${scale} = ${formatColor(answerStr)}` }];
                } else { // Find Reality
                    knownVal = large; knownType = 'drawing'; answerStr = base.toString();
                    steps = [{ text: t(lang, TERMS.common.calculate), latex: `\\frac{${large}}{${scale}} = ${formatColor(answerStr)}` }];
                }
            }

            const kLabel = knownType === 'drawing' ? {sv: "Bild", en: "Drawing"} : {sv: "Verklighet", en: "Reality"};
            const uLabel = knownType === 'drawing' ? {sv: "Verklighet", en: "Reality"} : {sv: "Bild", en: "Drawing"};

            qDesc = {
                sv: `Skala ${scaleLabel}. ${kLabel.sv} är ${knownVal} cm. Vad är ${uLabel.sv.toLowerCase()}?`,
                en: `Scale ${scaleLabel}. ${kLabel.en} is ${knownVal} cm. What is ${uLabel.en.toLowerCase()}?`
            };

            renderData = {
                type: 'scale_compare',
                leftLabel: kLabel.sv, leftValue: `${knownVal} cm`,
                rightLabel: uLabel.sv, rightValue: "?",
                shape: shape
            };
        }

        // --- LEVEL 4: Find Scale ---
        else if (mode === 4) {
            const isReduction = rng.bool();
            const scale = ScaleGenerator.getScaleFactor(rng, false);
            const base = rng.intBetween(2, 8);
            const large = base * scale;

            let drawing = 0, reality = 0;
            if (isReduction) { drawing = base; reality = large; answerStr = `1:${scale}`; }
            else { drawing = large; reality = base; answerStr = `${scale}:1`; }

            qDesc = {
                sv: `Bilden är ${drawing} cm och verkligheten är ${reality} cm. Vad är skalan?`,
                en: `The image is ${drawing} cm and reality is ${reality} cm. What is the scale?`
            };

            steps = [
                { text: t(lang, TERMS.scale.step_plug_in), latex: `${drawing} : ${reality}` },
                { text: t(lang, TERMS.scale.step_simplify), latex: formatColor(answerStr) }
            ];

            renderData = {
                type: 'scale_compare',
                leftLabel: {sv: "Bild", en: "Image"}, leftValue: `${drawing} cm`,
                rightLabel: {sv: "Verklighet", en: "Reality"}, rightValue: `${reality} cm`,
                shape: shape
            };
            answerType = 'scale';
        }

        // --- LEVEL 5: Map Problems ---
        else if (mode === 5) {
            const scale = rng.pick([50, 100, 500, 1000, 10000]);
            const drawingCm = rng.intBetween(2, 9);
            const realityCm = drawingCm * scale;
            const realityM = realityCm / 100;
            answerStr = realityM.toString(); 

            qDesc = {
                sv: `En karta har skalan 1:${scale}. Avståndet på kartan är ${drawingCm} cm. Hur långt är det i verkligheten (i meter)?`,
                en: `A map has scale 1:${scale}. The distance on the map is ${drawingCm} cm. How far is it in reality (in meters)?`
            };

            steps = [
                { text: t(lang, TERMS.scale.calc_cm), latex: `${drawingCm} \\cdot ${scale} = ${realityCm} \\text{ cm}` },
                { text: t(lang, TERMS.scale.conv_m), latex: `\\frac{${realityCm}}{100} = ${formatColor(answerStr)} \\text{ m}` }
            ];

            renderData = { type: 'scale_single', label: `1:${scale}`, shape: 'square' }; 
        }

        // --- LEVEL 6: Area Scale ---
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
             
             steps = [{ text: t(lang, {sv: "Längdskala = √Areaskala", en: "Length Scale = √Area Scale"}), latex: `${clueLatex} \\\\implies ${formatColor(answerStr)}` }];
             
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