import { GeneratedQuestion, Clue, AnswerType } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class ScaleGenerator {
    private static readonly SHAPES = [
        'square', 'rectangle', 'circle', 'triangle', 
        'rhombus', 'parallelogram', 'pentagon', 'hexagon', 'octagon',
        'star', 'arrow', 'heart', 'cross', 'lightning', 'kite',
        'cube', 'cylinder', 'pyramid', 'cone', 'sphere'
    ];

    private static readonly LABELS = {
        drawing: { sv: "Avbildning", en: "Drawing" },
        reality: { sv: "Verklighet", en: "Reality" },
        image_larger: { sv: "Bilden är störst", en: "The image is larger" },
        reality_larger: { sv: "Verkligheten är störst", en: "Reality is larger" }
    };

    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        const color = "\\mathbf{\\color{#D35400}";
        
        let mode = level;
        
        if (level === 6) {
            mode = rng.intBetween(1, 5); 
        }

        // --- LEVEL 1: CONCEPTUAL ---
        if (mode === 1) {
            const isReduction = rng.intBetween(0, 1) === 1; 
            const ratio = rng.pick([2, 5, 10, 20, 50, 100]);
            const scaleStr = isReduction ? `1:${ratio}` : `${ratio}:1`;
            
            const qType = rng.intBetween(1, 2);
            let descriptionObj = { sv: "", en: "" };
            let correctOption = "";
            let wrongOption = "";
            let explanation = "";

            if (qType === 1) {
                descriptionObj = {
                    sv: `Visar skalan ${scaleStr} en förstoring eller en förminskning?`,
                    en: `Does the scale ${scaleStr} show an enlargement or a reduction?`
                };
                correctOption = isReduction ? t(lang, TERMS.scale.reduction) : t(lang, TERMS.scale.enlargement);
                wrongOption = isReduction ? t(lang, TERMS.scale.enlargement) : t(lang, TERMS.scale.reduction);
                explanation = isReduction ? t(lang, TERMS.scale.rule_reduction) : t(lang, TERMS.scale.rule_enlargement);
            } else {
                descriptionObj = {
                    sv: `Skalan är ${scaleStr}. Vad är störst: bilden eller verkligheten?`,
                    en: `The scale is ${scaleStr}. Which is larger: the image or reality?`
                };
                correctOption = isReduction ? t(lang, this.LABELS.reality_larger) : t(lang, this.LABELS.image_larger);
                wrongOption = isReduction ? t(lang, this.LABELS.image_larger) : t(lang, this.LABELS.reality_larger);
                explanation = lang === 'sv'
                    ? (isReduction ? "Eftersom det är en förminskning (1:X) är verkligheten störst." : "Eftersom det är en förstoring (X:1) är bilden störst.")
                    : (isReduction ? "Since it is a reduction (1:X), reality is larger." : "Since it is an enlargement (X:1), the image is larger.");
            }

            const swap = rng.intBetween(0, 1) === 1;
            const choices = swap ? [wrongOption, correctOption] : [correctOption, wrongOption];

            return {
                questionId: `scale-l1-${seed}`,
                renderData: {
                    text_key: "concept",
                    description: descriptionObj,
                    latex: scaleStr,
                    answerType: 'multiple_choice',
                    choices: choices
                },
                serverData: {
                    answer: correctOption,
                    solutionSteps: [{ text: explanation, latex: scaleStr }]
                }
            };
        }

        // --- SHARED SETUP ---
        const shape = rng.pick(this.SHAPES);
        const svShape = TERMS.shapes[shape]?.sv || shape;
        const enShape = TERMS.shapes[shape]?.en || shape;
        const scaleFactor = rng.pick([10, 20, 50, 100, 200, 500]);

        // --- LEVEL 2: FIND LENGTH (EASY) ---
        if (mode === 2) {
            const subType = rng.intBetween(0, 1);
            let drawingVal = 0; 
            let realVal = 0;
            let answer = 0;
            let steps: Clue[] = [];
            let geomLabel = "";
            let descriptionObj = { sv: "", en: "" };

            if (subType === 0) { 
                drawingVal = rng.intBetween(2, 15);
                realVal = drawingVal * scaleFactor;
                answer = realVal;
                
                descriptionObj = {
                    sv: `En ${svShape} är ${drawingVal} cm på ritningen. Skalan är 1:${scaleFactor}. Hur lång är den i verkligheten? (Svara i cm)`,
                    en: `A ${enShape} is ${drawingVal} cm on the drawing. Scale is 1:${scaleFactor}. How long is it in reality? (Answer in cm)`
                };
                
                geomLabel = `${drawingVal} cm`;
                steps = [{ text: t(lang, TERMS.common.calculate), latex: `${drawingVal} \\cdot ${scaleFactor} = ${color}{${realVal}}}` }];
            } else { 
                const targetDrawing = rng.intBetween(2, 15);
                realVal = targetDrawing * scaleFactor;
                answer = targetDrawing;

                descriptionObj = {
                    sv: `I verkligheten är en ${svShape} ${realVal} cm lång. Hur lång blir den på en ritning i skala 1:${scaleFactor}? (Svara i cm)`,
                    en: `In reality, a ${enShape} is ${realVal} cm long. How long will it be on a drawing with scale 1:${scaleFactor}? (Answer in cm)`
                };
                
                geomLabel = `${realVal} cm`;
                steps = [{ text: t(lang, TERMS.scale.div_scale), latex: `\\frac{${realVal}}{${scaleFactor}} = ${color}{${answer}}}` }];
            }

            return {
                questionId: `scale-l2-${seed}`,
                renderData: {
                    text_key: "calc_len_easy",
                    description: descriptionObj,
                    latex: `1:${scaleFactor}`,
                    answerType: 'numeric',
                    geometry: { type: 'scale_single', shape: shape, label: geomLabel }
                },
                serverData: { answer, solutionSteps: steps }
            };
        }

        // --- LEVEL 3: FIND LENGTH (HARD) ---
        if (mode === 3) {
            const subType = rng.intBetween(0, 1);
            let answer = 0;
            let steps: Clue[] = [];
            let geomLabel = "";
            let descriptionObj = { sv: "", en: "" };

            if (subType === 0) { 
                const drawingVal = rng.intBetween(2, 9); 
                const realValCm = drawingVal * scaleFactor;
                const realValM = realValCm / 100;
                answer = realValM;

                descriptionObj = {
                    sv: `En ${svShape} är ${drawingVal} cm på ritningen. Skalan är 1:${scaleFactor}. Hur lång är den i verkligheten? (Svara i m)`,
                    en: `A ${enShape} is ${drawingVal} cm on the drawing. Scale is 1:${scaleFactor}. How long is it in reality? (Answer in m)`
                };
                
                geomLabel = `${drawingVal} cm`;
                steps = [
                    { text: t(lang, TERMS.scale.calc_cm), latex: `${drawingVal} \\cdot ${scaleFactor} = ${realValCm} \\text{ cm}` },
                    { text: t(lang, TERMS.scale.conv_m), latex: `\\frac{${realValCm}}{100} = ${color}{${realValM}}}` }
                ];
            } else { 
                const targetDrawing = rng.intBetween(2, 10); 
                const realValCm = targetDrawing * scaleFactor;
                const realValM = realValCm / 100;
                answer = targetDrawing;

                descriptionObj = {
                    sv: `I verkligheten är en ${svShape} ${realValM} m lång. Hur lång blir den på en ritning i skala 1:${scaleFactor}? (Svara i cm)`,
                    en: `In reality, a ${enShape} is ${realValM} m long. How long will it be on a drawing with scale 1:${scaleFactor}? (Answer in cm)`
                };
                
                geomLabel = `${realValM} m`;
                steps = [
                    { text: t(lang, TERMS.scale.conv_same), latex: `${realValM} \\text{ m} = ${realValCm} \\text{ cm}` },
                    { text: t(lang, TERMS.scale.div_scale), latex: `\\frac{${realValCm}}{${scaleFactor}} = ${color}{${answer}}}` }
                ];
            }

            return {
                questionId: `scale-l3-${seed}`,
                renderData: {
                    text_key: "calc_len_hard",
                    description: descriptionObj,
                    latex: `1:${scaleFactor}`,
                    answerType: 'numeric',
                    geometry: { type: 'scale_single', shape: shape, label: geomLabel }
                },
                serverData: { answer, solutionSteps: steps }
            };
        }

        // --- LEVEL 4: FIND SCALE (RANDOM) ---
        if (mode === 4) {
            const base = rng.intBetween(2, 5);
            const factor = rng.pick([10, 20, 50, 100]);
            
            const drawVal = base; 
            const realVal = base * factor; 
            
            const realUnit = factor >= 100 ? 'm' : 'cm';
            const realDisplay = realUnit === 'm' ? realVal / 100 : realVal;

            const descriptionObj = {
                sv: `Bestäm skalan (Svara som X:X).`,
                en: `Determine the scale (Answer as X:X).`
            };
            
            const leftIsDrawing = rng.intBetween(0, 1) === 1;

            const leftLabel = leftIsDrawing ? t(lang, this.LABELS.drawing) : t(lang, this.LABELS.reality);
            const rightLabel = leftIsDrawing ? t(lang, this.LABELS.reality) : t(lang, this.LABELS.drawing);
            
            const leftValue = leftIsDrawing ? `${drawVal} cm` : `${realDisplay} ${realUnit}`;
            const rightValue = leftIsDrawing ? `${realDisplay} ${realUnit}` : `${drawVal} cm`;

            const steps: Clue[] = [
                { text: t(lang, TERMS.scale.conv_same), latex: `${realDisplay} ${realUnit} = ${realVal} \\text{ cm}` },
                { text: t(lang, TERMS.scale.step_plug_in), latex: `\\text{Bild} : \\text{Verklighet} = ${drawVal} : ${realVal}` },
                { text: t(lang, TERMS.scale.step_simplify), latex: `1 : \\frac{${realVal}}{${drawVal}} \\implies ${color}{1:${factor}}}` }
            ];

            return {
                questionId: `scale-l4-${seed}`,
                renderData: {
                    text_key: "find_scale",
                    description: descriptionObj,
                    latex: "",
                    answerType: 'scale',
                    geometry: { 
                        type: 'scale_compare', 
                        shape: shape, 
                        leftLabel, 
                        rightLabel,
                        leftValue,
                        rightValue
                    }
                },
                serverData: {
                    answer: { left: 1, right: factor },
                    solutionSteps: steps
                }
            };
        }

        // --- LEVEL 5: TEXT ONLY (FIND SCALE) ---
        if (mode === 5) {
            const base = rng.intBetween(3, 8);
            const factor = rng.pick([50, 100, 200, 500]);
            const drawVal = base;
            const realValCm = base * factor;
            const realValM = realValCm / 100;

            // Updated question format as requested (Unit specific, no X:X instruction)
            const descriptionObj = {
                sv: `På en ritning är en ${svShape} ${drawVal} cm lång. I verkligheten är den ${realValM} m. Vad är skalan (i cm)?`,
                en: `On a drawing, a ${enShape} is ${drawVal} cm long. In reality it is ${realValM} m. What is the scale (in cm)?`
            };

            const steps: Clue[] = [
                { text: t(lang, TERMS.scale.conv_same), latex: `${realValM} \\text{ m} = ${realValCm} \\text{ cm}` },
                { text: t(lang, TERMS.scale.setup_ratio), latex: `${drawVal} : ${realValCm}` },
                { text: t(lang, TERMS.scale.step_simplify), latex: `1 : \\frac{${realValCm}}{${drawVal}} \\implies ${color}{1:${factor}}}` }
            ];

            return {
                questionId: `scale-l5-${seed}`,
                renderData: {
                    text_key: "find_scale_text",
                    description: descriptionObj,
                    latex: "",
                    answerType: 'scale',
                },
                serverData: {
                    answer: { left: 1, right: factor },
                    solutionSteps: steps
                }
            };
        }

        return this.generate(1, seed, lang, multiplier); 
    }
}