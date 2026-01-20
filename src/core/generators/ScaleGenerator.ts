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
                renderData: { text_key: "concept", description: descObj, latex: scaleStr, answerType: 'multiple_choice', choices },
                serverData: { answer: correct, solutionSteps: [{ text: expl, latex: scaleStr }] }
            };
        }

        // Shared Setup L2-5
        const shape = rng.pick(this.SHAPES);
        const svShape = TERMS.shapes[shape]?.sv || shape;
        const enShape = TERMS.shapes[shape]?.en || shape;
        const scaleFactor = rng.pick([10, 20, 50, 100, 200, 500]);

        if (mode === 2) { /* Level 2 Logic */ 
             const subType = rng.intBetween(0, 1);
             const drawingVal = subType === 0 ? rng.intBetween(2, 15) : 0;
             const realVal = subType === 0 ? drawingVal * scaleFactor : rng.intBetween(2, 15) * scaleFactor;
             const target = subType === 0 ? realVal : rng.intBetween(2, 15);
             const desc = subType === 0 
                ? { sv: `En ${svShape} är ${drawingVal} cm på ritningen. Skalan är 1:${scaleFactor}. Hur lång är den i verkligheten? (Svara i cm)`, en: `A ${enShape} is ${drawingVal} cm on the drawing. Scale is 1:${scaleFactor}. Find reality (cm).` }
                : { sv: `I verkligheten är en ${svShape} ${realVal} cm. Skalan är 1:${scaleFactor}. Hur lång på ritningen? (Svara i cm)`, en: `In reality, a ${enShape} is ${realVal} cm. Scale 1:${scaleFactor}. Find drawing length (cm).` };
             return {
                 questionId: `scale-l2-${seed}`,
                 renderData: { text_key: "calc_len_easy", description: desc, latex: `1:${scaleFactor}`, answerType: 'numeric', geometry: { type: 'scale_single', shape, label: subType===0?`${drawingVal} cm`:`${realVal} cm` } },
                 serverData: { answer: target, solutionSteps: [{ text: t(lang, TERMS.common.calculate), latex: subType===0 ? `${drawingVal} \\cdot ${scaleFactor} = ${color}{${realVal}}}` : `\\frac{${realVal}}{${scaleFactor}} = ${color}{${target}}}` }] }
             };
        }

        if (mode === 3) { /* Level 3 Logic */ 
             const subType = rng.intBetween(0, 1);
             const drawingVal = rng.intBetween(2, 9);
             const realValCm = drawingVal * scaleFactor;
             const realValM = realValCm / 100;
             const desc = subType === 0
                ? { sv: `En ${svShape} är ${drawingVal} cm på ritningen. Skalan är 1:${scaleFactor}. Hur lång är den i verkligheten? (Svara i m)`, en: `A ${enShape} is ${drawingVal} cm on drawing. Scale 1:${scaleFactor}. Find reality (m).` }
                : { sv: `I verkligheten är en ${svShape} ${realValM} m. Skalan är 1:${scaleFactor}. Hur lång på ritningen? (Svara i cm)`, en: `In reality a ${enShape} is ${realValM} m. Scale 1:${scaleFactor}. Find drawing (cm).` };
             return {
                 questionId: `scale-l3-${seed}`,
                 renderData: { text_key: "calc_len_hard", description: desc, latex: `1:${scaleFactor}`, answerType: 'numeric', geometry: { type: 'scale_single', shape, label: subType===0?`${drawingVal} cm`:`${realValM} m` } },
                 serverData: { answer: subType===0?realValM:drawingVal, solutionSteps: [{text: "Convert/Calc", latex: subType===0?`${drawingVal} \\cdot ${scaleFactor} = ${realValCm} \\to ${color}{${realValM}}}` : `${realValM}m = ${realValCm}cm \\to \\frac{${realValCm}}{${scaleFactor}} = ${color}{${drawingVal}}}`}] }
             };
        }

        if (mode === 4) { /* Level 4 Logic */ 
             const base = rng.intBetween(2, 5); const factor = rng.pick([10, 20, 50, 100]);
             const leftIsDrawing = rng.intBetween(0,1)===1;
             const lLab = leftIsDrawing ? t(lang, this.LABELS.drawing) : t(lang, this.LABELS.reality);
             const rLab = leftIsDrawing ? t(lang, this.LABELS.reality) : t(lang, this.LABELS.drawing);
             const lVal = leftIsDrawing ? `${base} cm` : `${(base*factor)/100} m`;
             const rVal = leftIsDrawing ? `${(base*factor)/100} m` : `${base} cm`;
             const desc = { sv: `Bestäm skalan (Svara som X:X). Svara i cm.`, en: `Determine the scale (Answer as X:X). Use cm.` };
             return {
                 questionId: `scale-l4-${seed}`,
                 renderData: { text_key: "find_scale", description: desc, latex: "", answerType: 'scale', geometry: { type: 'scale_compare', shape, leftLabel: lLab, rightLabel: rLab, leftValue: lVal, rightValue: rVal } },
                 serverData: { answer: {left:1, right:factor}, solutionSteps: [{text: t(lang, TERMS.scale.step_simplify), latex: `1:${factor}`}] }
             };
        }

        if (mode === 5) { /* Level 5 Logic */ 
             const base = rng.intBetween(3, 8); const factor = rng.pick([50, 100, 200, 500]);
             const realM = (base * factor) / 100;
             const desc = { sv: `På en ritning är en ${svShape} ${base} cm lång. I verkligheten är den ${realM} m. Vad är skalan (i cm)?`, en: `Drawing: ${base} cm. Reality: ${realM} m. What is the scale (in cm)?` };
             return {
                 questionId: `scale-l5-${seed}`,
                 renderData: { text_key: "find_scale_text", description: desc, latex: "", answerType: 'scale' },
                 serverData: { answer: {left:1, right:factor}, solutionSteps: [{text: t(lang, TERMS.scale.step_simplify), latex: `1:${factor}`}] }
             };
        }

        // --- LEVEL 6: AREA SCALE ---
        if (mode === 6) {
            const areaShape = rng.pick(this.AREA_SHAPES);
            const subType = rng.intBetween(1, 2);
            const lengthScale = rng.pick([2, 3, 4, 5, 10]); 
            const areaScale = lengthScale * lengthScale;

            let steps: Clue[] = [];
            let qDesc: { sv: string, en: string } = { sv: "", en: "" };
            let geomData: any = {};
            let answer: any = 0;
            let answerType: any = 'numeric';

            // Get correct plural forms for the description
            const shapePluralSv = TERMS.shapes_plural[areaShape]?.sv || `${areaShape}er`;
            const shapePluralEn = TERMS.shapes_plural[areaShape]?.en || `${areaShape}s`;

            if (subType === 1) { // Find Scale
                const w = rng.intBetween(2, 6);
                const h = (areaShape === 'rectangle' || areaShape === 'parallelogram' || areaShape === 'triangle') ? rng.intBetween(2, 6) : 0;
                
                const wReal = w * lengthScale;
                const hReal = h * lengthScale;

                let areaDraw = 0, areaReal = 0;
                if (areaShape === 'rectangle' || areaShape === 'parallelogram') {
                    areaDraw = w * h; areaReal = wReal * hReal;
                } else if (areaShape === 'triangle') {
                    areaDraw = (w * h) / 2; areaReal = (wReal * hReal) / 2;
                } else if (areaShape === 'circle') {
                    areaDraw = Math.PI * w * w; areaReal = Math.PI * wReal * wReal;
                } else if (areaShape === 'semicircle') {
                    areaDraw = (Math.PI * w * w) / 2; areaReal = (Math.PI * wReal * wReal) / 2;
                }

                const dispAreaDraw = Math.round(areaDraw * 10) / 10;
                const dispAreaReal = Math.round(areaReal * 10) / 10;

                qDesc = {
                    sv: `Här är två ${shapePluralSv}. Den första är en avbildning och den andra är verkligheten. Vad är areaskalan?`,
                    en: `Here are two ${shapePluralEn}. The first is a drawing, the second is reality. What is the area scale?`
                };

                steps = [
                    { text: t(lang, TERMS.scale.calc_area_img), latex: `A_{bild} = ${dispAreaDraw} \\text{ cm}^2` },
                    { text: t(lang, TERMS.scale.calc_area_real), latex: `A_{verklighet} = ${dispAreaReal} \\text{ cm}^2` },
                    { text: t(lang, TERMS.scale.step_simplify), latex: `${dispAreaDraw} : ${dispAreaReal} \\implies ${color}{1:${areaScale}}}` }
                ];

                answer = { left: 1, right: areaScale };
                answerType = 'scale';
                geomData = {
                    type: 'compare_shapes',
                    shapeType: areaShape,
                    left: { width: w, height: h, radius: w, label: t(lang, this.LABELS.drawing) },
                    right: { width: wReal, height: hReal, radius: wReal, label: t(lang, this.LABELS.reality) }
                };
            } else { // Find Area
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
                geomData = {
                    type: 'compare_shapes_area',
                    shapeType: areaShape,
                    left: { area: baseArea, label: t(lang, this.LABELS.drawing) },
                    right: { area: "?", label: t(lang, this.LABELS.reality) }
                };
            }

            return {
                questionId: `scale-l6-${seed}`,
                renderData: {
                    text_key: "area_scale",
                    description: qDesc,
                    latex: "",
                    answerType: answerType,
                    geometry: geomData
                },
                serverData: { answer: answer, solutionSteps: steps }
            };
        }

        return this.generate(1, seed, lang, multiplier); 
    }
}