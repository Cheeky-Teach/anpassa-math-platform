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

    /**
     * Generate diverse scale factors
     */
    private static getScaleFactor(rng: Random): number {
        const type = rng.intBetween(1, 10);
        if (type <= 4) return rng.intBetween(2, 25);
        if (type <= 7) return rng.intBetween(6, 20) * 5;
        return rng.intBetween(10, 100) * 10;
    }

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

        // Shared Setup L2-6
        const shape = rng.pick(this.SHAPES);
        const svShape = TERMS.shapes[shape]?.sv || shape;
        const enShape = TERMS.shapes[shape]?.en || shape;
        const scaleFactor = ScaleGenerator.getScaleFactor(rng);

        // --- LEVEL 2: FIND LENGTH (EASY) ---
        if (mode === 2) {
            const isReduction = rng.intBetween(0, 1) === 1;
            const scaleStr = isReduction ? `1:${scaleFactor}` : `${scaleFactor}:1`;
            const subType = rng.intBetween(0, 1);
            const baseInt = rng.intBetween(2, 15);
            let drawVal, realVal, ans, desc;
            let geomLabel = "";

            if (isReduction) {
                 if (subType === 0) { // Find Real
                    drawVal = baseInt; realVal = drawVal * scaleFactor; ans = realVal;
                    desc = { sv: `En ${svShape} är ${drawVal} cm på ritningen. Skalan är ${scaleStr}. Hur lång är den i verkligheten? (Svara i cm)`, en: `A ${enShape} is ${drawVal} cm on the drawing. Scale is ${scaleStr}. Find reality (cm).` };
                    geomLabel = `${drawVal} cm`;
                 } else { // Find Draw
                    ans = baseInt; realVal = ans * scaleFactor;
                    desc = { sv: `I verkligheten är en ${svShape} ${realVal} cm. Skalan är ${scaleStr}. Hur lång på ritningen? (Svara i cm)`, en: `Reality: ${realVal} cm. Scale: ${scaleStr}. Find drawing (cm).` };
                    geomLabel = `${realVal} cm`;
                 }
            } else { // Enlargement
                 if (subType === 0) { // Find Draw
                    realVal = baseInt; drawVal = realVal * scaleFactor; ans = drawVal;
                    desc = { sv: `I verkligheten är en ${svShape} ${realVal} cm. Skalan är ${scaleStr} (förstoring). Hur lång på ritningen? (Svara i cm)`, en: `Reality: ${realVal} cm. Scale: ${scaleStr}. Find drawing (cm).` };
                    geomLabel = `${realVal} cm`;
                 } else { // Find Real
                    ans = baseInt; drawVal = ans * scaleFactor;
                    desc = { sv: `En ${svShape} är ${drawVal} cm på ritningen. Skalan är ${scaleStr}. Hur lång är den i verkligheten? (Svara i cm)`, en: `Drawing: ${drawVal} cm. Scale: ${scaleStr}. Find reality (cm).` };
                    geomLabel = `${drawVal} cm`;
                 }
            }
            const stepLatex = (isReduction && subType===1) || (!isReduction && subType===1) ? `\\frac{${isReduction?realVal:drawVal}}{${scaleFactor}} = ${color}{${ans}}}` : `${isReduction?drawVal:realVal} \\cdot ${scaleFactor} = ${color}{${ans}}}`;
            return {
                questionId: `scale-l2-${seed}`,
                renderData: { text_key: "calc_len_easy", description: desc, latex: scaleStr, answerType: 'numeric', geometry: { type: 'scale_single', shape, label: geomLabel }, variables: {} },
                serverData: { answer: ans, solutionSteps: [{ text: t(lang, TERMS.common.calculate), latex: stepLatex }] }
            };
        }

        // --- LEVEL 3: FIND LENGTH (HARD) ---
        if (mode === 3) {
            const subType = rng.intBetween(0, 1);
            const baseInt = rng.intBetween(2, 9);
            let ans, desc, geomLabel, steps;

            if (subType === 0) { // Find Real (m)
                const drawVal = baseInt; const realCm = drawVal * scaleFactor; const realM = realCm / 100; ans = realM;
                desc = { sv: `En ${svShape} är ${drawVal} cm på ritningen. Skalan är 1:${scaleFactor}. Hur lång är den i verkligheten? (Svara i m)`, en: `Drawing: ${drawVal} cm. Scale 1:${scaleFactor}. Find reality (m).` };
                geomLabel = `${drawVal} cm`;
                steps = [{ text: t(lang, TERMS.scale.calc_cm), latex: `${drawVal} \\cdot ${scaleFactor} = ${realCm} \\text{ cm}` }, { text: t(lang, TERMS.scale.conv_m), latex: `\\frac{${realCm}}{100} \\\\ \\\\ = ${color}{${realM}}}` }];
            } else { // Find Draw (cm)
                const realM = baseInt; const realCm = realM * 100; ans = realCm / scaleFactor;
                desc = { sv: `I verkligheten är en ${svShape} ${realM} m. Skalan är 1:${scaleFactor}. Hur lång på ritningen? (Svara i cm)`, en: `Reality: ${realM} m. Scale 1:${scaleFactor}. Find drawing (cm).` };
                geomLabel = `${realM} m`;
                steps = [{ text: t(lang, TERMS.scale.conv_same), latex: `${realM} \\text{ m} = ${realCm} \\text{ cm}` }, { text: t(lang, TERMS.scale.div_scale), latex: `\\frac{${realCm}}{${scaleFactor}} \\\\ \\\\ = ${color}{${ans}}}` }];
            }
            return {
                questionId: `scale-l3-${seed}`,
                renderData: { text_key: "calc_len_hard", description: desc, latex: `1:${scaleFactor}`, answerType: 'numeric', geometry: { type: 'scale_single', shape, label: geomLabel }, variables: {} },
                serverData: { answer: ans, solutionSteps: steps }
            };
        }

        // --- LEVEL 4: FIND SCALE ---
        if (mode === 4) {
            const base = rng.intBetween(2, 5); const factor = ScaleGenerator.getScaleFactor(rng);
            const isReduction = rng.intBetween(0,1)===1;
            let drawVal, realVal, ansLeft, ansRight, steps;

            if (isReduction) {
                drawVal=base; realVal=base*factor; ansLeft=1; ansRight=factor;
                const rUnit = factor>=100?'m':'cm'; const rDisp = rUnit==='m'?realVal/100:realVal;
                steps=[{text:t(lang,TERMS.scale.conv_same),latex:`${rDisp} ${rUnit} = ${realVal} \\text{ cm}`},{text:t(lang,TERMS.scale.step_plug_in),latex:`\\text{Bild}:${drawVal} \\text{ Real}:${realVal}`},{text:t(lang,TERMS.scale.step_simplify),latex:`1 : \\frac{${realVal}}{${drawVal}} \\\\ \\\\ \\implies ${color}{1:${factor}}}` }];
            } else {
                realVal=base; drawVal=base*factor; ansLeft=factor; ansRight=1;
                steps=[{text:t(lang,TERMS.scale.step_plug_in),latex:`\\text{Bild}:${drawVal} \\text{ Real}:${realVal}`},{text:t(lang,TERMS.scale.step_simplify),latex:`\\frac{${drawVal}}{${realVal}} : 1 \\\\ \\\\ \\implies ${color}{${factor}:1}}` }];
            }
            const desc = { sv: `Bestäm skalan.`, en: `Determine the scale.` };
            const leftIsDrawing = rng.intBetween(0,1)===1;
            const lLab = leftIsDrawing ? t(lang, this.LABELS.drawing) : t(lang, this.LABELS.reality);
            const rLab = leftIsDrawing ? t(lang, this.LABELS.reality) : t(lang, this.LABELS.drawing);
            const rUnit = (!isReduction && factor < 100) ? 'cm' : (factor >= 100 ? 'm' : 'cm');
            const rDisp = (rUnit === 'm' ? realVal / 100 : realVal);
            const lVal = leftIsDrawing ? `${drawVal} cm` : `${rDisp} ${rUnit}`;
            const rVal = leftIsDrawing ? `${rDisp} ${rUnit}` : `${drawVal} cm`;

            return {
                questionId: `scale-l4-${seed}`,
                renderData: { text_key: "find_scale", description: desc, latex: "", answerType: 'scale', geometry: { type: 'scale_compare', shape, leftLabel: lLab, rightLabel: rLab, leftValue: lVal, rightValue: rVal }, variables: {} },
                serverData: { answer: { left: ansLeft, right: ansRight }, solutionSteps: steps }
            };
        }

        // --- LEVEL 5: TEXT ONLY ---
        if (mode === 5) {
            const base = rng.intBetween(3, 8); const factor = ScaleGenerator.getScaleFactor(rng);
            const isReduction = rng.intBetween(0,1)===1;
            let drawVal, realVal, ansLeft, ansRight, desc, steps=[];

            if (isReduction) {
                drawVal=base; realVal=base*factor; ansLeft=1; ansRight=factor;
                const rM = realVal/100; const showM = factor>=100;
                desc={sv:`På en ritning är en ${svShape} ${drawVal} cm lång. I verkligheten är den ${showM?rM+' m':realVal+' cm'}. Vad är skalan (i cm)?`,en:`Drawing: ${drawVal} cm. Reality: ${showM?rM+' m':realVal+' cm'}. Scale (cm)?`};
                if(showM) steps.push({text:t(lang,TERMS.scale.conv_same),latex:`${rM} \\text{ m} = ${realVal} \\text{ cm}`});
                steps.push({text:t(lang,TERMS.scale.setup_ratio),latex:`${drawVal} : ${realVal}`});
                steps.push({text:t(lang,TERMS.scale.step_simplify),latex:`1 : \\frac{${realVal}}{${drawVal}} \\\\ \\\\ \\implies ${color}{1:${factor}}}`});
            } else {
                realVal=base; drawVal=base*factor; ansLeft=factor; ansRight=1;
                desc={sv:`I verkligheten är en ${svShape} ${realVal} cm lång. På en ritning är den ${drawVal} cm. Vad är skalan?`,en:`Reality: ${realVal} cm. Drawing: ${drawVal} cm. Scale?`};
                steps=[{text:t(lang,TERMS.scale.setup_ratio),latex:`${drawVal} : ${realVal}`},{text:t(lang,TERMS.scale.step_simplify),latex:`\\frac{${drawVal}}{${realVal}} : 1 \\\\ \\\\ \\implies ${color}{${factor}:1}}`}];
            }
            return {
                questionId: `scale-l5-${seed}`,
                renderData: { text_key: "find_scale_text", description: desc, latex: "", answerType: 'scale', variables: {} },
                serverData: { answer: { left: ansLeft, right: ansRight }, solutionSteps: steps }
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
                    { text: t(lang, TERMS.scale.step_simplify), latex: `${dispAreaDraw} : ${dispAreaReal} \\\\ \\\\ \\implies ${color}{1:${areaScale}}}` }
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
                    { text: t(lang, TERMS.scale.calc_new_area), latex: `${baseArea} \\cdot ${areaScale} \\\\ \\\\ = ${color}{${realArea}}}` }
                ];
                answer = realArea;
                answerType = 'numeric';
                geomData = { type: 'compare_shapes_area', shapeType: areaShape, left: { area: baseArea, label: t(lang, this.LABELS.drawing) }, right: { area: "?", label: t(lang, this.LABELS.reality) } };
            }
            else if (subType === 3) { // Length -> Area Scale
                const isReduction = rng.intBetween(0, 1) === 1;
                const factor = rng.pick([2, 3, 4, 5, 10]);
                const lScaleStr = isReduction ? `1:${factor}` : `${factor}:1`;
                const aFactor = factor * factor;
                const aScaleLeft = isReduction ? 1 : aFactor;
                const aScaleRight = isReduction ? aFactor : 1;
                qDesc = { sv: `Längdskalan är ${lScaleStr}. Vad är areaskalan?`, en: `The length scale is ${lScaleStr}. What is the area scale?` };
                const clueLatex = isReduction ? `(1^2 : ${factor}^2)` : `(${factor}^2 : 1^2)`;
                
                // FIXED: Wrapped object in t(lang, ...)
                steps = [{ text: t(lang, {sv: "Areaskala = (Längdskala)²", en: "Area Scale = (Length Scale)²"}), latex: `${clueLatex} \\\\ \\\\ = ${color}{${aScaleLeft}:${aScaleRight}}}` }];

                answer = { left: aScaleLeft, right: aScaleRight };
                answerType = 'scale';
            }
            else { // Area -> Length Scale
                const isReduction = rng.intBetween(0, 1) === 1;
                const factor = rng.pick([2, 3, 4, 5, 10]); 
                const aFactor = factor * factor; 
                const aScaleStr = isReduction ? `1:${aFactor}` : `${aFactor}:1`;
                const lScaleLeft = isReduction ? 1 : factor;
                const lScaleRight = isReduction ? factor : 1;
                qDesc = { sv: `Areaskalan är ${aScaleStr}. Vad är längdskalan?`, en: `The area scale is ${aScaleStr}. What is the length scale?` };
                const clueLatex = isReduction ? `(\\sqrt{1} : \\sqrt{${aFactor}})` : `(\\sqrt{${aFactor}} : \\sqrt{1})`;
                
                // FIXED: Wrapped object in t(lang, ...)
                steps = [{ text: t(lang, {sv: "Längdskala = √Areaskala", en: "Length Scale = √Area Scale"}), latex: `${clueLatex} \\\\ \\\\ = ${color}{${lScaleLeft}:${lScaleRight}}}` }];

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