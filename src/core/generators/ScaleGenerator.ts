import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class ScaleGenerator {
    
    // --- CONSTANTS & DATA ---

    private static readonly SHAPES = [
        'square', 'rectangle', 'circle', 'triangle', 
        'rhombus', 'parallelogram', 'pentagon', 'hexagon', 'octagon',
        'star', 'arrow', 'heart', 'cross', 'lightning', 'kite',
        'cube', 'cylinder', 'pyramid', 'cone', 'sphere'
    ];

    private static readonly AREA_SHAPES = ['rectangle', 'triangle', 'circle', 'semicircle', 'parallelogram'];

    /**
     * Generate diverse scale factors:
     * - Small integers (2-25)
     * - Medium multiples of 5 (30-100)
     * - Large multiples of 10 (100-1000)
     */
    private static getScaleFactor(rng: Random): number {
        const type = rng.intBetween(1, 10);
        if (type <= 4) return rng.intBetween(2, 25);
        if (type <= 7) return rng.intBetween(6, 20) * 5;
        return rng.intBetween(10, 100) * 10;
    }

    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        
        // Correct LaTeX color formatting
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;
        
        let mode = level;
        
        // --- LEVEL 7: MIXED ---
        if (level === 7) {
            mode = rng.intBetween(1, 6); 
        }

        // --- LEVEL 1: CONCEPTUAL (Multiple Choice) ---
        if (mode === 1) {
            const isReduction = rng.intBetween(0, 1) === 1; 
            const ratio = rng.pick([2, 5, 10, 20, 50, 100]); // Keep Level 1 simple
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
                correct = isReduction ? t(lang, TERMS.scale.reality) : t(lang, TERMS.scale.drawing);
                const wrong = isReduction ? t(lang, TERMS.scale.drawing) : t(lang, TERMS.scale.reality);
                choices = rng.intBetween(0,1) ? [wrong, correct] : [correct, wrong];
                expl = isReduction ? t(lang, TERMS.scale.rule_reduction) : t(lang, TERMS.scale.rule_enlargement);
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

        // Shared Setup for L2-6
        const shape = rng.pick(this.SHAPES);
        const svShape = t('sv', TERMS.shapes[shape]) || shape;
        const enShape = t('en', TERMS.shapes[shape]) || shape;
        
        const scaleFactor = ScaleGenerator.getScaleFactor(rng);

        // --- LEVEL 2: FIND LENGTH (EASY - SAME UNITS) ---
        if (mode === 2) {
            // Support X:1
            const isReduction = rng.intBetween(0, 1) === 1;
            const scaleStr = isReduction ? `1:${scaleFactor}` : `${scaleFactor}:1`;
            
            const subType = rng.intBetween(0, 1);
            let drawingVal = 0, realVal = 0, answer = 0;
            let steps: Clue[] = [];
            let geomLabel = "";
            let descriptionObj = { sv: "", en: "" };

            // Base integer to ensure clean numbers
            const baseInt = rng.intBetween(2, 15);

            if (isReduction) {
                // 1:X
                if (subType === 0) { // Find Real
                    drawingVal = baseInt; 
                    realVal = drawingVal * scaleFactor; 
                    answer = realVal;
                    descriptionObj = { sv: `En ${svShape} är ${drawingVal} cm på ritningen. Skalan är ${scaleStr}. Hur lång är den i verkligheten? (Svara i cm)`, en: `A ${enShape} is ${drawingVal} cm on the drawing. Scale is ${scaleStr}. How long is it in reality? (Answer in cm)` };
                    geomLabel = `${drawingVal} cm`;
                    steps = [{ text: t(lang, TERMS.common.calculate), latex: `${drawingVal} \\cdot ${scaleFactor} = ${formatColor(realVal)}` }];
                } else { // Find Drawing
                    answer = baseInt; // Drawing is the small base int
                    realVal = answer * scaleFactor;
                    descriptionObj = { sv: `I verkligheten är en ${svShape} ${realVal} cm lång. Hur lång blir den på en ritning i skala ${scaleStr}? (Svara i cm)`, en: `In reality, a ${enShape} is ${realVal} cm long. How long will it be on a drawing with scale ${scaleStr}? (Answer in cm)` };
                    geomLabel = `${realVal} cm`;
                    steps = [{ text: t(lang, TERMS.scale.step_plug_in), latex: `\\frac{${realVal}}{${scaleFactor}} = ${formatColor(answer)}` }];
                }
            } else {
                // X:1 (Enlargement)
                if (subType === 0) { // Find Drawing
                    realVal = baseInt; 
                    drawingVal = realVal * scaleFactor; 
                    answer = drawingVal;
                    descriptionObj = { sv: `I verkligheten är en ${svShape} ${realVal} cm lång. Skalan är ${scaleStr}. Hur lång blir den på en ritning? (Svara i cm)`, en: `In reality, a ${enShape} is ${realVal} cm long. Scale is ${scaleStr}. How long on the drawing? (Answer in cm)` };
                    geomLabel = `${realVal} cm`;
                    steps = [{ text: t(lang, TERMS.common.calculate), latex: `${realVal} \\cdot ${scaleFactor} = ${formatColor(drawingVal)}` }];
                } else { // Find Reality
                    answer = baseInt;
                    drawingVal = answer * scaleFactor; 
                    descriptionObj = { sv: `En ${svShape} är ${drawingVal} cm på ritningen. Skalan är ${scaleStr}. Hur lång är den i verkligheten? (Svara i cm)`, en: `A ${enShape} is ${drawingVal} cm on the drawing. Scale is ${scaleStr}. Find reality (cm).` };
                    geomLabel = `${drawingVal} cm`;
                    steps = [{ text: t(lang, TERMS.scale.step_plug_in), latex: `\\frac{${drawingVal}}{${scaleFactor}} = ${formatColor(answer)}` }];
                }
            }

            return {
                questionId: `scale-l2-${seed}`,
                renderData: { 
                    text_key: "calc_len_easy", 
                    description: descriptionObj, 
                    latex: scaleStr, 
                    answerType: 'numeric', 
                    geometry: { type: 'scale_single', shape, label: geomLabel }
                },
                serverData: { answer, solutionSteps: steps }
            };
        }

        // --- LEVEL 3: FIND LENGTH (HARD - MIXED UNITS) ---
        if (mode === 3) {
            // Usually map scales (1:X)
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

                descriptionObj = { sv: `En ${svShape} är ${drawingVal} cm på ritningen. Skalan är 1:${scaleFactor}. Hur lång är den i verkligheten? (Svara i m)`, en: `A ${enShape} is ${drawingVal} cm on the drawing. Scale is 1:${scaleFactor}. How long is it in reality? (Answer in m)` };
                geomLabel = `${drawingVal} cm`;
                steps = [
                    { text: t(lang, TERMS.scale.calc_cm), latex: `${drawingVal} \\cdot ${scaleFactor} = ${realValCm} \\text{ cm}` },
                    { text: t(lang, TERMS.scale.conv_m), latex: `\\frac{${realValCm}}{100} = ${formatColor(realValM)}` }
                ];
            } else { // Find Drawing
                const drawingVal = baseInt; 
                const realValCm = drawingVal * scaleFactor;
                const realValM = realValCm / 100;
                answer = drawingVal;

                descriptionObj = { sv: `I verkligheten är en ${svShape} ${realValM} m lång. Skalan är 1:${scaleFactor}. Hur lång på ritningen? (Svara i cm)`, en: `In reality a ${enShape} is ${realValM} m long. Scale 1:${scaleFactor}. Find drawing (cm).` };
                geomLabel = `${realValM} m`;
                steps = [
                    { text: t(lang, TERMS.scale.conv_same), latex: `${realValM} \\text{ m} = ${realValCm} \\text{ cm}` },
                    { text: t(lang, TERMS.scale.step_plug_in), latex: `\\frac{${realValCm}}{${scaleFactor}} = ${formatColor(answer)}` }
                ];
            }

            return {
                questionId: `scale-l3-${seed}`,
                renderData: { 
                    text_key: "calc_len_hard", 
                    description: descriptionObj, 
                    latex: `1:${scaleFactor}`, 
                    answerType: 'numeric', 
                    geometry: { type: 'scale_single', shape, label: geomLabel }
                },
                serverData: { answer, solutionSteps: steps }
            };
        }

        // --- LEVEL 4: FIND SCALE (RANDOM POSITIONING & TYPE) ---
        if (mode === 4) {
            const base = rng.intBetween(2, 5); 
            const factor = ScaleGenerator.getScaleFactor(rng);
            
            // Randomize Reduction (1:X) vs Enlargement (X:1)
            const isReduction = rng.intBetween(0, 1) === 1;
            
            let drawVal, realVal;
            let ansLeft, ansRight;
            let steps: Clue[] = [];

            if (isReduction) {
                drawVal = base;
                realVal = base * factor; 
                ansLeft = 1;
                ansRight = factor;
                
                const realUnit = factor >= 100 ? 'm' : 'cm';
                const realDisplay = realUnit === 'm' ? realVal / 100 : realVal;

                steps = [
                    { text: t(lang, TERMS.scale.conv_same), latex: `${realDisplay} ${realUnit} = ${realVal} \\text{ cm}` },
                    { text: t(lang, TERMS.scale.setup_ratio), latex: `\\text{Bild} : \\text{Verklighet} = ${drawVal} : ${realVal}` },
                    { text: t(lang, TERMS.scale.step_simplify), latex: `1 : \\frac{${realVal}}{${drawVal}} \\implies ${formatColor('1:' + factor)}` }
                ];
            } else {
                // Enlargement
                realVal = base;
                drawVal = base * factor; 
                ansLeft = factor;
                ansRight = 1;

                steps = [
                    { text: t(lang, TERMS.scale.setup_ratio), latex: `\\text{Bild} : \\text{Verklighet} = ${drawVal} : ${realVal}` },
                    { text: t(lang, TERMS.scale.step_simplify), latex: `\\frac{${drawVal}}{${realVal}} : 1 \\implies ${formatColor(factor + ':1')}` }
                ];
            }

            const descriptionObj = { sv: `Bestäm skalan.`, en: `Determine the scale.` };
            
            // Visual Randomization
            const leftIsDrawing = rng.intBetween(0, 1) === 1;
            const leftLabel = leftIsDrawing ? t(lang, TERMS.scale.drawing) : t(lang, TERMS.scale.reality);
            const rightLabel = leftIsDrawing ? t(lang, TERMS.scale.reality) : t(lang, TERMS.scale.drawing);
            
            // Value Formatting
            const realUnit = (!isReduction && factor < 100) ? 'cm' : (factor >= 100 ? 'm' : 'cm');
            const realDisplay = (realUnit === 'm' ? realVal / 100 : realVal);

            const leftValue = leftIsDrawing ? `${drawVal} cm` : `${realDisplay} ${realUnit}`;
            const rightValue = leftIsDrawing ? `${realDisplay} ${realUnit}` : `${drawVal} cm`;

            return {
                questionId: `scale-l4-${seed}`,
                renderData: {
                    text_key: "find_scale",
                    description: descriptionObj,
                    latex: "",
                    answerType: 'scale',
                    geometry: { type: 'scale_compare', shape, leftLabel, rightLabel, leftValue, rightValue }
                },
                serverData: { answer: { left: ansLeft, right: ansRight }, solutionSteps: steps }
            };
        }

        // --- LEVEL 5: TEXT ONLY (FIND SCALE) ---
        if (mode === 5) {
            const base = rng.intBetween(3, 8); 
            const factor = ScaleGenerator.getScaleFactor(rng); 
            
            const isReduction = rng.intBetween(0, 1) === 1;

            let drawVal, realVal, ansLeft, ansRight;
            let descriptionObj = { sv: "", en: "" };
            let steps: Clue[] = [];

            if (isReduction) {
                drawVal = base;
                realVal = base * factor; // cm
                const realM = realVal / 100;
                const showM = factor >= 100;
                
                ansLeft = 1; ansRight = factor;

                descriptionObj = {
                    sv: `På en ritning är en ${svShape} ${drawVal} cm lång. I verkligheten är den ${showM ? realM + ' m' : realVal + ' cm'}. Vad är skalan?`,
                    en: `On a drawing, a ${enShape} is ${drawVal} cm long. In reality it is ${showM ? realM + ' m' : realVal + ' cm'}. What is the scale?`
                };
                
                if (showM) {
                    steps.push({ text: t(lang, TERMS.scale.conv_same), latex: `${realM} \\text{ m} = ${realVal} \\text{ cm}` });
                }
                steps.push({ text: t(lang, TERMS.scale.setup_ratio), latex: `${drawVal} : ${realVal}` });
                steps.push({ text: t(lang, TERMS.scale.step_simplify), latex: `1 : \\frac{${realVal}}{${drawVal}} \\implies ${formatColor('1:' + factor)}` });

            } else {
                // Enlargement
                realVal = base;
                drawVal = base * factor; 
                ansLeft = factor; ansRight = 1;

                descriptionObj = {
                    sv: `I verkligheten är en ${svShape} ${realVal} cm lång. På en ritning är den ${drawVal} cm. Vad är skalan?`,
                    en: `In reality a ${enShape} is ${realVal} cm long. On a drawing it is ${drawVal} cm. What is the scale?`
                };

                steps = [
                    { text: t(lang, TERMS.scale.setup_ratio), latex: `${drawVal} : ${realVal}` },
                    { text: t(lang, TERMS.scale.step_simplify), latex: `\\frac{${drawVal}}{${realVal}} : 1 \\implies ${formatColor(factor + ':1')}` }
                ];
            }

            return {
                questionId: `scale-l5-${seed}`,
                renderData: { text_key: "find_scale_text", description: descriptionObj, latex: "", answerType: 'scale', variables: {} },
                serverData: { answer: { left: ansLeft, right: ansRight }, solutionSteps: steps }
            };
        }

        // --- LEVEL 6: AREA SCALE ---
        if (mode === 6) {
            const areaShape = rng.pick(ScaleGenerator.AREA_SHAPES);
            const subType = rng.intBetween(1, 4);
            const lengthScale = rng.pick([2, 3, 4, 5, 10]); // Keep square roots clean
            const areaScale = lengthScale * lengthScale;

            const isReduction = rng.intBetween(0, 1) === 1;

            let steps: Clue[] = [];
            let qDesc: { sv: string, en: string } = { sv: "", en: "" };
            let geomData: any = {};
            let answer: any = 0;
            let answerType: any = 'numeric';

            const shapePluralSv = (t('sv', TERMS.shapes_plural[areaShape]) || areaShape);
            const shapePluralEn = (t('en', TERMS.shapes_plural[areaShape]) || areaShape);

            if (subType === 1) { // Find Scale (Visual)
                const w = rng.intBetween(2, 6);
                const h = (areaShape === 'rectangle' || areaShape === 'parallelogram' || areaShape === 'triangle') ? rng.intBetween(2, 6) : 0;
                const wReal = w * lengthScale; const hReal = h * lengthScale;
                let areaDraw = 0, areaReal = 0;

                if (areaShape === 'rectangle' || areaShape === 'parallelogram') { areaDraw = w * h; areaReal = wReal * hReal; }
                else if (areaShape === 'triangle') { areaDraw = (w * h) / 2; areaReal = (wReal * hReal) / 2; }
                else if (areaShape === 'circle') { areaDraw = Math.PI * w * w; areaReal = Math.PI * wReal * wReal; } 
                else if (areaShape === 'semicircle') { areaDraw = (Math.PI * w * w) / 2; areaReal = (Math.PI * wReal * wReal) / 2; }

                const dispAreaDraw = Math.round(areaDraw * 10) / 10;
                const dispAreaReal = Math.round(areaReal * 10) / 10;

                qDesc = {
                    sv: `Här är två ${shapePluralSv}. Den första är en avbildning och den andra är verkligheten. Vad är areaskalan?`,
                    en: `Here are two ${shapePluralEn}. The first is a drawing, the second is reality. What is the area scale?`
                };

                steps = [
                    { text: t(lang, TERMS.scale.calc_area_img), latex: `A_{bild} = ${dispAreaDraw} \\text{ cm}^2` },
                    { text: t(lang, TERMS.scale.calc_area_real), latex: `A_{verklighet} = ${dispAreaReal} \\text{ cm}^2` },
                    { text: t(lang, TERMS.scale.step_simplify), latex: `${dispAreaDraw} : ${dispAreaReal} \\implies ${formatColor('1:' + areaScale)}` }
                ];
                answer = { left: 1, right: areaScale };
                answerType = 'scale';
                geomData = { type: 'compare_shapes', shapeType: areaShape, left: { width: w, height: h, radius: w, label: t(lang, TERMS.scale.drawing) }, right: { width: wReal, height: hReal, radius: wReal, label: t(lang, TERMS.scale.reality) } };
            } 
            else if (subType === 2) { // Find Real Area
                const baseArea = rng.pick([2, 3, 4, 5, 10]);
                const realArea = baseArea * areaScale;
                qDesc = {
                    sv: `Den lilla figuren har arean ${baseArea} cm$^2$. Hur stor är arean i den stora figuren om längdskalan är 1:${lengthScale}?`,
                    en: `The small shape has an area of ${baseArea} cm$^2$. How big is the area of the large shape if the length scale is 1:${lengthScale}?`
                };
                steps = [
                    { text: t(lang, TERMS.scale.calc_area_scale), latex: `(1:${lengthScale})^2 = 1:${areaScale}` },
                    { text: t(lang, TERMS.common.calculate), latex: `${baseArea} \\cdot ${areaScale} = ${formatColor(realArea)}` }
                ];
                answer = realArea;
                answerType = 'numeric';
                geomData = { type: 'compare_shapes_area', shapeType: areaShape, left: { area: baseArea, label: t(lang, TERMS.scale.drawing) }, right: { area: "?", label: t(lang, TERMS.scale.reality) } };
            }
            else if (subType === 3) { // Length -> Area Scale
                const lScaleStr = isReduction ? `1:${lengthScale}` : `${lengthScale}:1`;
                const aScaleLeft = isReduction ? 1 : areaScale;
                const aScaleRight = isReduction ? areaScale : 1;
                
                qDesc = { sv: `Längdskalan är ${lScaleStr}. Vad är areaskalan?`, en: `The length scale is ${lScaleStr}. What is the area scale?` };
                const clueLatex = isReduction ? `(1^2 : ${lengthScale}^2)` : `(${lengthScale}^2 : 1^2)`;
                steps = [{ text: {sv: "Areaskala = (Längdskala)²", en: "Area Scale = (Length Scale)²"}, latex: `${clueLatex} = ${formatColor(aScaleLeft + ':' + aScaleRight)}` }];

                answer = { left: aScaleLeft, right: aScaleRight };
                answerType = 'scale';
            }
            else { // Area -> Length Scale
                const aScaleStr = isReduction ? `1:${areaScale}` : `${areaScale}:1`;
                const lScaleLeft = isReduction ? 1 : lengthScale;
                const lScaleRight = isReduction ? lengthScale : 1;

                qDesc = { sv: `Areaskalan är ${aScaleStr}. Vad är längdskalan?`, en: `The area scale is ${aScaleStr}. What is the length scale?` };
                const clueLatex = isReduction ? `(\\sqrt{1} : \\sqrt{${areaScale}})` : `(\\sqrt{${areaScale}} : \\sqrt{1})`;
                steps = [{ text: {sv: "Längdskala = √Areaskala", en: "Length Scale = √Area Scale"}, latex: `${clueLatex} = ${formatColor(lScaleLeft + ':' + lScaleRight)}` }];

                answer = { left: lScaleLeft, right: lScaleRight };
                answerType = 'scale';
            }

            return {
                questionId: `scale-l6-${seed}`,
                renderData: { text_key: "area_scale", description: qDesc, latex: "", answerType: answerType, geometry: geomData, variables: {} },
                serverData: { answer: answer, solutionSteps: steps }
            };
        }

        // Fallback or restart if mode is out of bounds
        return ScaleGenerator.generate(1, seed, lang, multiplier); 
    }
}