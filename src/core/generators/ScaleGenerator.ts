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
        reality: { sv: "Verklighet", en: "Reality" }
    };

    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        const color = "\\mathbf{\\color{#D35400}";
        
        let mode = level;
        let hideImage = false;

        // Level logic adjustments
        if (level >= 5) {
            mode = rng.intBetween(2, 4); // Randomize calculation types
            hideImage = rng.intBetween(0, 1) === 1;
        }

        // --- LEVEL 1: CONCEPTUAL (Enlargement vs Reduction) ---
        if (mode === 1) {
            // Logic: 1:X is reduction, X:1 is enlargement
            const isReduction = rng.intBetween(0, 1) === 1;
            const ratio = rng.pick([2, 5, 10, 20, 50, 100]);
            const scaleStr = isReduction ? `1:${ratio}` : `${ratio}:1`;
            
            // Randomize button order
            const correctKey = isReduction ? 'reduction' : 'enlargement';
            const wrongKey = isReduction ? 'enlargement' : 'reduction';
            
            // Randomly swap choices
            const swap = rng.intBetween(0, 1) === 1;
            const choices = swap 
                ? [t(lang, TERMS.scale[wrongKey]), t(lang, TERMS.scale[correctKey])] 
                : [t(lang, TERMS.scale[correctKey]), t(lang, TERMS.scale[wrongKey])];

            const qText = lang === 'sv' 
                ? `Visar skalan ${scaleStr} en förstoring eller förminskning?`
                : `Does the scale ${scaleStr} show an enlargement or a reduction?`;

            return {
                questionId: `scale-l1-${seed}`,
                renderData: {
                    text_key: "concept_check",
                    description: qText,
                    latex: scaleStr,
                    answerType: 'multiple_choice',
                    choices: choices
                },
                serverData: {
                    answer: t(lang, TERMS.scale[correctKey]),
                    solutionSteps: [
                        { 
                            text: isReduction 
                                ? t(lang, TERMS.scale.rule_reduction) 
                                : t(lang, TERMS.scale.rule_enlargement), 
                            latex: scaleStr 
                        }
                    ]
                }
            };
        }

        // --- LEVEL 2: CALCULATE LENGTH (Merged Old L1 & L2) ---
        else if (mode === 2) {
            const shape = rng.pick(this.SHAPES);
            const shapeName = t(lang, TERMS.shapes[shape] || shape);
            
            // Decide sub-mode: Find Real (0) or Find Drawing (1)
            const subType = rng.intBetween(0, 1); 
            const scaleFactor = rng.pick([10, 20, 50, 100]); // Keep simple for now
            
            let qText = "";
            let answer: number = 0;
            let steps: Clue[] = [];
            let geomLabel = "";

            if (subType === 0) { // Find Real
                const drawingVal = rng.intBetween(2, 9);
                const realValCm = drawingVal * scaleFactor;
                const realUnit = scaleFactor >= 100 ? 'm' : 'cm';
                const realValDisplay = realUnit === 'm' ? realValCm / 100 : realValCm;
                
                answer = realValDisplay;
                geomLabel = `${drawingVal} cm`;

                qText = lang === 'sv' 
                    ? `En ${shapeName} är ${drawingVal} cm på ritningen. Skalan är 1:${scaleFactor}. Hur lång är den i verkligheten? (Svara i ${realUnit})`
                    : `A ${shapeName} is ${drawingVal} cm on the drawing. Scale is 1:${scaleFactor}. How long is it in reality? (Answer in ${realUnit})`;

                steps = [
                    { text: t(lang, TERMS.common.calculate), latex: `${drawingVal} \\cdot ${scaleFactor} = ${realValCm} \\text{ cm}` },
                    realUnit === 'm' ? { text: "Convert units", latex: `${realValCm} / 100 = ${color}{${realValDisplay}}} \\text{ m}` } : { text: "Done", latex: "" }
                ];
            } else { // Find Drawing
                const targetDrawing = rng.intBetween(2, 10);
                const realValCm = targetDrawing * scaleFactor;
                const realUnit = scaleFactor >= 100 ? 'm' : 'cm';
                const realValDisplay = realUnit === 'm' ? realValCm / 100 : realValCm;
                
                answer = targetDrawing;
                geomLabel = `${realValDisplay} ${realUnit}`;

                qText = lang === 'sv'
                    ? `I verkligheten är en ${shapeName} ${realValDisplay} ${realUnit} lång. Hur lång blir den på en ritning i skala 1:${scaleFactor}? (Svara i cm)`
                    : `In reality, a ${shapeName} is ${realValDisplay} ${realUnit} long. How long will it be on a drawing with scale 1:${scaleFactor}? (Answer in cm)`;

                steps = [
                    { text: "Convert to cm", latex: `${realValDisplay} ${realUnit} = ${realValCm} \\text{ cm}` },
                    { text: "Divide by scale", latex: `\\frac{${realValCm}}{${scaleFactor}} = ${color}{${targetDrawing}}}` }
                ];
            }

            return {
                questionId: `scale-l2-${seed}`,
                renderData: {
                    text_key: "calc_len",
                    description: qText,
                    latex: `1:${scaleFactor}`,
                    answerType: 'numeric',
                    geometry: hideImage ? undefined : { type: 'scale_single', shape: shape, label: geomLabel }
                },
                serverData: {
                    answer: answer,
                    solutionSteps: steps
                }
            };
        }

        // --- LEVEL 3: FIND SCALE (Side by Side) ---
        else {
            const shape = rng.pick(this.SHAPES);
            const base = rng.intBetween(2, 5);
            const factor = rng.pick([10, 20, 50, 100]);
            
            const drawVal = base; 
            const realVal = base * factor; 
            const realUnit = factor >= 100 ? 'm' : 'cm';
            const realDisplay = realUnit === 'm' ? realVal / 100 : realVal;

            const ansLeft = 1;
            const ansRight = factor;
            
            const qText = lang === 'sv' ? `Bestäm skalan.` : `Determine the scale.`;
            
            const steps: Clue[] = [
                { text: "Convert to same unit (cm)", latex: `${realDisplay} ${realUnit} = ${realVal} \\text{ cm}` },
                { text: t(lang, TERMS.scale.step_plug_in), latex: `${drawVal} : ${realVal}` },
                { text: t(lang, TERMS.scale.step_simplify), latex: `1 : ${realVal/drawVal} \\implies ${color}{1:${factor}}}` }
            ];

            return {
                questionId: `scale-l3-${seed}`,
                renderData: {
                    text_key: "find_scale",
                    description: qText,
                    latex: "",
                    answerType: 'scale', // Frontend renders 1 : [ ] box
                    geometry: hideImage ? undefined : { 
                        type: 'scale_compare', 
                        shape: shape, 
                        leftLabel: t(lang, this.LABELS.drawing),
                        leftValue: `${drawVal} cm`,
                        rightLabel: t(lang, this.LABELS.reality),
                        rightValue: `${realDisplay} ${realUnit}`
                    }
                },
                serverData: {
                    answer: { left: ansLeft, right: ansRight },
                    solutionSteps: steps
                }
            };
        }
    }
}