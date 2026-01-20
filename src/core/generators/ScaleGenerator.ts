import { GeneratedQuestion, Clue, AnswerType } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class ScaleGenerator {
    // Extensive list of shapes supported by the frontend visualizer
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

        if (level === 4) {
            hideImage = true;
            mode = rng.intBetween(1, 3);
        } else if (level >= 5) {
            mode = rng.intBetween(1, 3);
            hideImage = rng.intBetween(0, 1) === 1;
        }

        // 1. Pick a Shape
        const shape = rng.pick(this.SHAPES);
        
        // 2. Pick Scale Factor
        const scaleFactor = rng.pick([10, 20, 50, 100, 200, 500, 1000]);
        
        let steps: Clue[] = [];
        let renderData: any = {};
        let answer: any = 0;
        let qText = "";

        // Helper for localized shape name
        const shapeName = t(lang, TERMS.shapes[shape] || shape);

        // --- MODE 1: FIND REALITY ---
        if (mode === 1) {
            const drawingVal = rng.intBetween(2, 9);
            const realValCm = drawingVal * scaleFactor;
            const realUnit = scaleFactor >= 100 ? 'm' : 'cm';
            const realValDisplay = realUnit === 'm' ? realValCm / 100 : realValCm;
            
            answer = realValDisplay;

            qText = lang === 'sv' 
                ? `En ${shapeName} är ${drawingVal} cm på ritningen. Skalan är 1:${scaleFactor}. Hur lång är den i verkligheten? (Svara i ${realUnit})`
                : `A ${shapeName} is ${drawingVal} cm on the drawing. Scale is 1:${scaleFactor}. How long is it in reality? (Answer in ${realUnit})`;

            steps = [
                { text: t(lang, TERMS.common.calculate), latex: `${drawingVal} \\cdot ${scaleFactor} = ${realValCm} \\text{ cm}` },
                realUnit === 'm' ? { text: "Convert units", latex: `${realValCm} / 100 = ${color}{${realValDisplay}}} \\text{ m}` } : { text: "Done", latex: "" }
            ];

            renderData = {
                text_key: "find_real",
                description: qText,
                latex: `1:${scaleFactor}`,
                answerType: 'numeric',
                // Pass the specific shape type to the frontend
                geometry: hideImage ? undefined : { type: 'scale_single', shape: shape, label: `${drawingVal} cm` }
            };
        }

        // --- MODE 2: FIND DRAWING ---
        else if (mode === 2) {
            const targetDrawing = rng.intBetween(2, 10);
            const realValCm = targetDrawing * scaleFactor;
            const realUnit = scaleFactor >= 100 ? 'm' : 'cm';
            const realValDisplay = realUnit === 'm' ? realValCm / 100 : realValCm;
            
            answer = targetDrawing;

            qText = lang === 'sv'
                ? `I verkligheten är en ${shapeName} ${realValDisplay} ${realUnit} lång. Hur lång blir den på en ritning i skala 1:${scaleFactor}? (Svara i cm)`
                : `In reality, a ${shapeName} is ${realValDisplay} ${realUnit} long. How long will it be on a drawing with scale 1:${scaleFactor}? (Answer in cm)`;

            steps = [
                { text: "Convert to cm", latex: `${realValDisplay} ${realUnit} = ${realValCm} \\text{ cm}` },
                { text: "Divide by scale", latex: `\\frac{${realValCm}}{${scaleFactor}} = ${color}{${targetDrawing}}}` }
            ];

            renderData = {
                text_key: "find_drawing",
                description: qText,
                latex: `1:${scaleFactor}`,
                answerType: 'numeric',
                geometry: hideImage ? undefined : { type: 'scale_single', shape: shape, label: `${realValDisplay} ${realUnit}` }
            };
        }

        // --- MODE 3: FIND SCALE ---
        else {
            const base = rng.intBetween(2, 5);
            const factor = rng.pick([10, 20, 50, 100]);
            
            const drawVal = base; 
            const realVal = base * factor; 
            
            const realUnit = factor >= 100 ? 'm' : 'cm';
            const realDisplay = realUnit === 'm' ? realVal / 100 : realVal;

            const ansLeft = 1;
            const ansRight = factor;
            
            qText = lang === 'sv' ? `Bestäm skalan.` : `Determine the scale.`;
            
            steps = [
                { text: "Convert to same unit (cm)", latex: `${realDisplay} ${realUnit} = ${realVal} \\text{ cm}` },
                { text: t(lang, TERMS.scale.step_plug_in), latex: `${drawVal} : ${realVal}` },
                { text: t(lang, TERMS.scale.step_simplify), latex: `1 : ${realVal/drawVal} \\implies ${color}{1:${factor}}}` }
            ];

            renderData = {
                text_key: "find_scale",
                description: qText,
                latex: "",
                answerType: 'scale',
                geometry: hideImage ? undefined : { 
                    type: 'scale_compare', 
                    shape: shape, 
                    leftLabel: t(lang, this.LABELS.drawing),
                    leftValue: `${drawVal} cm`,
                    rightLabel: t(lang, this.LABELS.reality),
                    rightValue: `${realDisplay} ${realUnit}`
                }
            };

            answer = { left: ansLeft, right: ansRight };
        }

        return {
            questionId: `scale-l${level}-${seed}`,
            renderData: renderData,
            serverData: {
                answer: answer,
                solutionSteps: steps.filter(s => s.latex !== "")
            }
        };
    }
}