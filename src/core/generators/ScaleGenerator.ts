import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class ScaleGenerator {
    
    private static getShape(rng: Random) {
        const SHAPES = [
            'square', 'rectangle', 'triangle', 'circle'
        ];
        return rng.pick(SHAPES);
    }

    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        // Helper for LaTeX colors
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;
        
        // Adjust mode for mixed levels (Level 5 mixes 1-4)
        let mode = level;
        if (level === 5) mode = rng.intBetween(1, 4);

        let steps: Clue[] = [];
        let qData = { 
            text_key: "", 
            description: "" as string | { sv: string, en: string }, 
            latex: "", 
            answer: 0 as number | string | { left: number, right: number },
            answerType: "numeric" 
        };
        let renderData: any = {};

        // --- LEVEL 1: Calculate Reality (Scale 1:X) ---
        // Image is given, Scale is 1:X (Reduction). Find Reality in Meters.
        if (mode === 1) {
            const scale = rng.pick([10, 20, 50, 100]);
            const imageCm = rng.intBetween(2, 15);
            const realityCm = imageCm * scale;
            const realityM = realityCm / 100; 
            
            qData.answer = realityM;
            qData.answerType = "numeric";
            
            qData.description = {
                sv: `På en ritning i skala 1:${scale} är en vägg ${imageCm} cm lång. Hur lång är väggen i verkligheten (svara i meter)?`,
                en: `On a drawing with scale 1:${scale}, a wall is ${imageCm} cm long. How long is the wall in reality (answer in meters)?`
            };
            
            steps = [
                { text: t(lang, TERMS.scale.step_plug_in), latex: `\\text{Real} = \\text{Image} \\cdot \\text{Scale}` },
                { text: "Calc cm", latex: `${imageCm} \\cdot ${scale} = ${realityCm} \\text{ cm}` },
                { text: "Convert to m", latex: `${realityCm} / 100 = ${formatColor(realityM)} \\text{ m}` }
            ];
            
            renderData = { text_key: "scale_calc_real" };
        }

        // --- LEVEL 2: Calculate Image (Scale 1:X) ---
        // Reality is given, Scale 1:X. Find Image in cm.
        else if (mode === 2) {
            const scale = rng.pick([20, 50, 100, 200]);
            const realityM = rng.intBetween(2, 20); // e.g., 5 meters
            const realityCm = realityM * 100;
            const imageCm = realityCm / scale; // Ensure divisible?
            
            // Recalculate reality to ensure clean integer division if desired, 
            // but decimals are fine for measurement. Let's force clean-ish numbers.
            // Actually, let's pick image and scale, then calc reality, to ensure clean logic? 
            // No, user practice usually handles decimals. 
            // Let's stick to easy numbers:
            // If Scale 50, Reality 2m (200cm) -> 4cm. Good.
            
            qData.answer = imageCm;
            qData.answerType = "numeric";
            
            qData.description = {
                sv: `Ett rum är ${realityM} m långt i verkligheten. Hur långt blir det på en ritning i skala 1:${scale} (svara i cm)?`,
                en: `A room is ${realityM} m long in reality. How long will it be on a drawing with scale 1:${scale} (answer in cm)?`
            };
            
            steps = [
                { text: "Convert to cm", latex: `${realityM} \\text{ m} = ${realityCm} \\text{ cm}` },
                { text: t(lang, TERMS.scale.step_plug_in), latex: `\\text{Image} = \\frac{\\text{Real}}{\\text{Scale}}` },
                { text: "Calc", latex: `\\frac{${realityCm}}{${scale}} = ${formatColor(imageCm)}` }
            ];
             renderData = { text_key: "scale_calc_img" };
        }

        // --- LEVEL 3: Calculate Reality (Scale X:1 - Enlargement) ---
        // Image is given (larger), Scale X:1. Find Reality (smaller).
        else if (mode === 3) {
            const scale = rng.pick([2, 5, 10]);
            const realityCm = rng.intBetween(2, 10);
            const imageCm = realityCm * scale;
            
            qData.answer = realityCm;
            qData.answerType = "numeric";
            
            qData.description = {
                sv: `En insekt avbildas i skala ${scale}:1. På bilden är den ${imageCm} cm lång. Hur lång är den i verkligheten (i cm)?`,
                en: `An insect is depicted in scale ${scale}:1. In the picture it is ${imageCm} cm long. How long is it in reality (in cm)?`
            };
            
            steps = [
                { text: t(lang, TERMS.scale.step_plug_in), latex: `\\text{Real} = \\frac{\\text{Image}}{\\text{Scale}}` },
                { text: "Calc", latex: `\\frac{${imageCm}}{${scale}} = ${formatColor(realityCm)}` }
            ];
             renderData = { text_key: "scale_calc_real_enlarge" };
        }

        // --- LEVEL 4: Find the Scale (1:X) ---
        // Given Real and Image. Return ratio object.
        else if (mode === 4) {
             const scale = rng.pick([10, 20, 50, 100, 200]);
             const imageCm = rng.intBetween(2, 10);
             const realityCm = imageCm * scale;
             const realityM = realityCm / 100;
             
             // The API expects {left, right} to format it as "1:X" for the token
             qData.answer = { left: 1, right: scale };
             qData.answerType = "scale"; 
             
             qData.description = {
                 sv: `En bil är ${realityM} m lång i verkligheten och ${imageCm} cm på en modell. Vilken skala är modellen?`,
                 en: `A car is ${realityM} m long in reality and ${imageCm} cm on a model. What is the scale of the model?`
             };
             
             steps = [
                 { text: "Convert units", latex: `${realityM} \\text{ m} = ${realityCm} \\text{ cm}` },
                 { text: "Ratio", latex: `\\frac{\\text{Image}}{\\text{Real}} = \\frac{${imageCm}}{${realityCm}}` },
                 { text: "Simplify", latex: `\\frac{${imageCm}/${imageCm}}{${realityCm}/${imageCm}} = 1:${formatColor(scale)}` }
             ];
             renderData = { text_key: "scale_find" };
        }
        
        // --- LEVEL 6: Area Scale (Advanced) ---
        else if (mode === 6) {
             const isReduction = rng.intBetween(0, 1) === 1;
             const factor = rng.pick([2, 3, 4, 5, 10]); 
             const aFactor = factor * factor; 
             const aScaleStr = isReduction ? `1:${aFactor}` : `${aFactor}:1`;
             const lScaleLeft = isReduction ? 1 : factor;
             const lScaleRight = isReduction ? factor : 1;
             
             qData.answer = { left: lScaleLeft, right: lScaleRight };
             qData.answerType = 'scale';

             qData.description = { 
                 sv: `Areaskalan är ${aScaleStr}. Vad är längdskalan?`, 
                 en: `The area scale is ${aScaleStr}. What is the length scale?` 
             };
             const clueLatex = isReduction ? `(\\sqrt{1} : \\sqrt{${aFactor}})` : `(\\sqrt{${aFactor}} : \\sqrt{1})`;
             const ansStr = `${lScaleLeft}:${lScaleRight}`;
             
             steps = [{ text: t(lang, {sv: "Längdskala = √Areaskala", en: "Length Scale = √Area Scale"}), latex: `${clueLatex} \\implies ${formatColor(ansStr)}` }];
             renderData = { type: 'scale_single', label: aScaleStr, shape: 'square' };
        }
        
        // Fallback for safety
        else {
             const scale = 10;
             const image = 5;
             qData.answer = 50; 
             qData.description = { sv: "Beräkna verklighet (1:10, 5cm)", en: "Calc reality (1:10, 5cm)" };
             qData.answerType = "numeric";
             renderData = { text_key: "default" };
        }

        return {
            questionId: `scale-l${level}-${seed}`,
            renderData: {
                text_key: qData.text_key || "scale_gen",
                description: qData.description,
                latex: qData.latex,
                answerType: qData.answerType,
                ...renderData
            },
            serverData: {
                answer: qData.answer,
                solutionSteps: steps
            }
        };
    }
}