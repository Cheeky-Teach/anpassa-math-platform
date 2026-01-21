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

    private static readonly AREA_SHAPES = ['rectangle', 'triangle', 'circle', 'semicircle', 'parallelogram'];

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
        
        // --- LEVEL 7: MIXED ---
        if (level === 7) {
            mode = rng.intBetween(1, 6); 
        }

        // --- LEVEL 1: CONCEPTUAL ---
        if (mode === 1) {
            const isReduction = rng.intBetween(0, 1) === 1; 
            const ratio = rng.pick([2, 5, 10, 20, 50, 100]);
            const scaleStr = isReduction ? `1:${ratio}` : `${ratio}:1`;
            const qType = rng.intBetween(1, 2);
            let descObj = { sv: "", en: "" }, correct = "", choices: string[] = [], expl = "";

            if (qType === 1) {
                descObj = { sv: `Visar skalan ${scaleStr} en förstoring eller en förminskning?`, en: `Does the scale ${scaleStr} show an enlargement or a reduction?` };
                correct = isReduction ? t(lang, TERMS.scale.reduction) : t(lang, TERMS.scale.enlargement);
                const wrong = isReduction ? t(lang, TERMS.scale.enlargement) : t(lang, TERMS.scale.reduction);
                choices = rng.intBetween(0,1) ? [wrong, correct] : [correct, wrong];
                expl = isReduction ? t(lang, TERMS.scale.rule_reduction) : t(lang, TERMS.scale.rule_enlargement);
            } else {
                descObj = { sv: `Skalan är ${scaleStr}. Vad är störst: bilden eller verkligheten?`, en: `The scale is ${scaleStr}. Which is larger: the image or reality?` };
                correct = isReduction ? t(lang, this.LABELS.reality_larger) : t(lang, this.LABELS.image_larger);
                const wrong = isReduction ? t(lang, this.LABELS.image_larger) : t(lang, this.LABELS.reality_larger);
                choices = rng.intBetween(0,1) ? [wrong, correct] : [correct, wrong];
                expl = lang === 'sv' ? (isReduction ? "1:X = Förminskning -> Verklighet störst" : "X:1 = Förstoring -> Bild störst") : (isReduction ? "1:X = Reduction -> Reality larger" : "X:1 = Enlargement -> Image larger");
            }
            return {
                questionId: `scale-l1-${seed}`,
                renderData: { 
                    text_key: "concept", 
                    description: descObj, 
                    latex: scaleStr, 
                    answerType: 'multiple_choice', 
                    choices: choices,
                    variables: {} 
                },
                serverData: { answer: correct, solutionSteps: [{ text: expl, latex: scaleStr }] }
            };
        }

        // Shared Setup L2-5
        const shape = rng.pick(this.SHAPES);
        const svShape = TERMS.shapes[shape]?.sv || shape;
        const enShape = TERMS.shapes[shape]?.en || shape;
        const scaleFactor = rng.pick([10, 20, 50, 100, 200, 500]);

        // --- LEVEL 2: FIND LENGTH (EASY - SAME UNITS) ---
        if (mode === 2) {
            // Updated to support X:1 (Enlargement)
            const isReduction = rng.intBetween(0, 1) === 1; // 1:X vs X:1
            const scaleStr = isReduction ? `1:${scaleFactor}` : `${scaleFactor}:1`;

            const subType = rng.intBetween(0, 1);
            let drawingVal = 0; 
            let realVal = 0;
            let answer = 0;
            let steps: Clue[] = [];
            let geomLabel = "";
            let descriptionObj = { sv: "", en: "" };

            // We generate the BASE integer first to ensure clean math
            const baseInt = rng.intBetween(2, 15);

            if (isReduction) {
                // 1:X (Reduction) -> Reality = Drawing * Scale
                if (subType === 0) { // Find Real
                    drawingVal = baseInt;
                    realVal = drawingVal * scaleFactor;
                    answer = realVal;
                    
                    descriptionObj = {
                        sv: `En ${svShape} är ${drawingVal} cm på ritningen. Skalan är ${scaleStr}. Hur lång är den i verkligheten? (Svara i cm)`,
                        en: `A ${enShape} is ${drawingVal} cm on the drawing. Scale is ${scaleStr}. How long is it in reality? (Answer in cm)`
                    };
                    geomLabel = `${drawingVal} cm`;
                    steps = [{ text: t(lang, TERMS.common.calculate), latex: `${drawingVal} \\cdot ${scaleFactor} = ${color}{${realVal}}}` }];
                } else { // Find Drawing
                    answer = baseInt;
                    realVal = answer * scaleFactor; 
                    descriptionObj = {
                        sv: `I verkligheten är en ${svShape} ${realVal} cm lång. Hur lång blir den på en ritning i skala ${scaleStr}? (Svara i cm)`,
                        en: `In reality, a ${enShape} is ${realVal} cm long. How long will it be on a drawing with scale ${scaleStr}? (Answer in cm)`
                    };
                    geomLabel = `${realVal} cm`;
                    steps = [{ text: t(lang, TERMS.scale.div_scale), latex: `\\frac{${realVal}}{${scaleFactor}} = ${color}{${answer}}}` }];
                }
            } else {
                // X:1 (Enlargement) -> Drawing = Reality * Scale
                if (subType === 0) { // Find Drawing
                    realVal = baseInt;
                    drawingVal = realVal * scaleFactor;
                    answer = drawingVal;

                    descriptionObj = {
                        sv: `I verkligheten är en ${svShape} ${realVal} cm lång. Skalan är ${scaleStr} (förstoring). Hur lång blir den på en ritning? (Svara i cm)`,
                        en: `In reality, a ${enShape} is ${realVal} cm long. Scale is ${scaleStr} (enlargement). How long on the drawing? (Answer in cm)`
                    };
                    geomLabel = `${realVal} cm`;
                    steps = [{ text: t(lang, TERMS.common.calculate), latex: `${realVal} \\cdot ${scaleFactor} = ${color}{${drawingVal}}}` }];
                } else { // Find Reality
                    answer = baseInt;
                    drawingVal = answer * scaleFactor;
                    descriptionObj = {
                        sv: `En ${svShape} är ${drawingVal} cm på ritningen. Skalan är ${scaleStr} (förstoring). Hur lång är den i verkligheten? (Svara i cm)`,
                        en: `A ${enShape} is ${drawingVal} cm on the drawing. Scale is ${scaleStr} (enlargement). Find reality (cm).`
                    };
                    geomLabel = `${drawingVal} cm`;
                    steps = [{ text: t(lang, TERMS.scale.div_scale), latex: `\\frac{${drawingVal}}{${scaleFactor}} = ${color}{${answer}}}` }];
                }
            }

            return {
                questionId: `scale-l2-${seed}`,
                renderData: {
                    text_key: "calc_len_easy",
                    description: descriptionObj,
                    latex: scaleStr,
                    answerType: 'numeric',
                    geometry: { type: 'scale_single', shape: shape, label: geomLabel },
                    variables: {} 
                },
                serverData: { answer, solutionSteps: steps }
            };
        }

        // --- LEVEL 3: FIND LENGTH (HARD - MIXED UNITS) ---
        // (Keeping mostly same, but updated clue formatting)
        if (mode === 3) {
            const subType = rng.intBetween(0, 1);
            let answer = 0;
            let steps: Clue[] = [];
            let geomLabel = "";
            let descriptionObj = { sv: "", en: "" };
            const baseInt = rng.intBetween(2, 9);

            if (subType === 0) { // Find Real (Answer in m)
                const drawingVal = baseInt; 
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
            } else { // Find Drawing
                const drawingVal = baseInt;
                const realValCm = drawingVal * scaleFactor;
                const realValM = realValCm / 100;
                answer = drawingVal;

                descriptionObj = {
                    sv: `I verkligheten är en ${svShape} ${realValM} m lång. Skalan är 1:${scaleFactor}. Hur lång på ritningen? (Svara i cm)`,
                    en: `In reality a ${enShape} is ${realValM} m long. Scale 1:${scaleFactor}. Find drawing (cm).`
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
                    geometry: { type: 'scale_single', shape: shape, label: geomLabel },
                    variables: {} 
                },
                serverData: { answer, solutionSteps: steps }
            };
        }

        // --- LEVEL 4: FIND SCALE (RANDOM POSITIONING) ---
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
                    geometry: { type: 'scale_compare', shape, leftLabel, rightLabel, leftValue, rightValue },
                    variables: {} 
                },
                serverData: { answer: { left: 1, right: factor }, solutionSteps: steps }
            };
        }

        // --- LEVEL 5: TEXT ONLY (FIND SCALE) ---
        if (mode === 5) {
            const base = rng.intBetween(3, 8);
            const factor = rng.pick([50, 100, 200, 500]);
            const drawVal = base;
            const realValCm = base * factor;
            const realValM = realValCm / 100;
            const shapeName = t(lang, TERMS.shapes[shape] || shape);

            const descriptionObj = {
                sv: `På en ritning är en ${shapeName} ${drawVal} cm lång. I verkligheten är den ${realValM} m. Vad är skalan (i cm)?`,
                en: `On a drawing, a ${shapeName} is ${drawVal} cm long. In reality it is ${realValM} m. What is the scale (in cm)?`
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
                    variables: {} 
                },
                serverData: { answer: { left: 1, right: factor }, solutionSteps: steps }
            };
        }

        // --- LEVEL 6: AREA SCALE ---
        if (mode === 6) {
            const areaShape = rng.pick(this.AREA_SHAPES);
            const subType = rng.intBetween(1, 4);
            const lengthScale = rng.pick([2, 3, 4, 5, 10]); 
            const areaScale = lengthScale * lengthScale;

            let steps: Clue[] = [];
            let qDesc: { sv: string, en: string } = { sv: "", en: "" };
            let geomData: any = {};
            let answer: any = 0;
            let answerType: any = 'numeric';

            const shapePluralSv = TERMS.shapes_plural?.[areaShape]?.sv || `${areaShape}er`;
            const shapePluralEn = TERMS.shapes_plural?.[areaShape]?.en || `${areaShape}s`;

            if (subType === 1) { // Find Scale
                const w = rng.intBetween(2, 6);
                const h = (areaShape === 'rectangle' || areaShape === 'parallelogram' || areaShape === 'triangle') ? rng.intBetween(2, 6) : 0;
                const wReal = w * lengthScale;
                const hReal = h * lengthScale;
                let areaDraw = 0, areaReal = 0;

                if (areaShape === 'rectangle' || areaShape === 'parallelogram') { areaDraw = w * h; areaReal = wReal * hReal; }
                else if (areaShape === 'triangle') { areaDraw = (w * h) / 2; areaReal = (wReal * hReal) / 2; }
                else if (areaShape === 'circle') { areaDraw = Math.PI * w * w; areaReal = Math.PI * wReal * wReal; } 
                else if (areaShape === 'semicircle') { areaDraw = (Math.PI * w * w) / 2; areaReal = (Math.PI * wReal * wReal) / 2; }

                const dispAreaDraw = Math.round(areaDraw * 10) / 10;
                const dispAreaReal = Math.round(areaReal * 10) / 10;

                qDesc = {
                    sv: `Här är två ${shapePluralSv}. Den första är en avbildning och den andra är verkligheten. Vad är areaskalan? (Svara som X:X)`,
                    en: `Here are two ${shapePluralEn}. The first is a drawing, the second is reality. What is the area scale? (Answer as X:X)`
                };

                steps = [
                    { text: t(lang, TERMS.scale.calc_area_img), latex: `A_{bild} = ${dispAreaDraw} \\text{ cm}^2` },
                    { text: t(lang, TERMS.scale.calc_area_real), latex: `A_{verklighet} = ${dispAreaReal} \\text{ cm}^2` },
                    { text: t(lang, TERMS.scale.step_simplify), latex: `${dispAreaDraw} : ${dispAreaReal} \\implies ${color}{1:${areaScale}}}` }
                ];
                answer = { left: 1, right: areaScale };
                answerType = 'scale';
                geomData = { type: 'compare_shapes', shapeType: areaShape, left: { width: w, height: h, radius: w, label: t(lang, this.LABELS.drawing) }, right: { width: wReal, height: hReal, radius: wReal, label: t(lang, this.LABELS.reality) } };
            } 
            else if (subType === 2) { // Find Real Area
                const baseArea = rng.pick([2, 3, 4, 5, 10]);
                const realArea = baseArea * areaScale;
                qDesc = {
                    sv: `Den lilla figuren har arean ${baseArea} cm$^2$. Hur stor är arean i den stora figuren om längdskalan är 1:${lengthScale}?`,
                    en: `The small shape has an area of ${baseArea} cm$^2$. How big is the area of the large shape if the length scale is 1:${lengthScale}?`
                };
                steps = [
                    { text: t(lang, TERMS.scale.calc_area_scale), latex: `\\text{Areaskala} = (1:${lengthScale})^2 = 1:${areaScale}` },
                    { text: t(lang, TERMS.scale.calc_new_area), latex: `${baseArea} \\cdot ${areaScale} = ${color}{${realArea}}}` }
                ];
                answer = realArea;
                answerType = 'numeric';
                geomData = { type: 'compare_shapes_area', shapeType: areaShape, left: { area: baseArea, label: t(lang, this.LABELS.drawing) }, right: { area: "?", label: t(lang, this.LABELS.reality) } };
            }
            else if (subType === 3) { // Length -> Area
                const isReduction = rng.intBetween(0, 1) === 1;
                const factor = rng.pick([2, 3, 4, 5, 10]);
                const lScaleStr = isReduction ? `1:${factor}` : `${factor}:1`;
                const aFactor = factor * factor;
                const aScaleLeft = isReduction ? 1 : aFactor;
                const aScaleRight = isReduction ? aFactor : 1;
                
                qDesc = { sv: `Längdskalan är ${lScaleStr}. Vad är areaskalan? (Svara som X:X)`, en: `The length scale is ${lScaleStr}. What is the area scale? (Answer as X:X)` };
                const clueLatex = isReduction ? `(1^2 : ${factor}^2)` : `(${factor}^2 : 1^2)`;
                steps = [{ text: {sv: "Areaskala = (Längdskala)²", en: "Area Scale = (Length Scale)²"}, latex: `${clueLatex} = ${color}{${aScaleLeft}:${aScaleRight}}}` }];

                answer = { left: aScaleLeft, right: aScaleRight };
                answerType = 'scale';
            }
            else { // Area -> Length
                const isReduction = rng.intBetween(0, 1) === 1;
                const factor = rng.pick([2, 3, 4, 5, 10]); 
                const aFactor = factor * factor; 
                const aScaleStr = isReduction ? `1:${aFactor}` : `${aFactor}:1`;
                const lScaleLeft = isReduction ? 1 : factor;
                const lScaleRight = isReduction ? factor : 1;

                qDesc = { sv: `Areaskalan är ${aScaleStr}. Vad är längdskalan? (Svara som X:X)`, en: `The area scale is ${aScaleStr}. What is the length scale? (Answer as X:X)` };
                const clueLatex = isReduction ? `(\\sqrt{1} : \\sqrt{${aFactor}})` : `(\\sqrt{${aFactor}} : \\sqrt{1})`;
                steps = [{ text: {sv: "Längdskala = √Areaskala", en: "Length Scale = √Area Scale"}, latex: `${clueLatex} = ${color}{${lScaleLeft}:${lScaleRight}}}` }];

                answer = { left: lScaleLeft, right: lScaleRight };
                answerType = 'scale';
            }

            return {
                questionId: `scale-l6-${seed}`,
                renderData: { text_key: "area_scale", description: qDesc, latex: "", answerType: answerType, geometry: geomData, variables: {} },
                serverData: { answer: answer, solutionSteps: steps }
            };
        }

        return this.generate(1, seed, lang, multiplier); 
    }
}