// src/core/utils/generators/ScaleGen.ts
import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class ScaleGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_ScaleConcept(lang, undefined, options); break;
            case 2: questionData = this.level2_Reduction(lang, undefined, options); break;
            case 3: questionData = this.level3_Enlargement(lang, undefined, options); break;
            case 4: questionData = this.level4_DetermineScale(lang, undefined, options); break;
            case 5: questionData = this.level5_Similarity(lang, undefined, options); break;
            case 6: questionData = this.level6_NestedTransversal(lang, undefined, options); break;
            case 7: questionData = this.level7_AreaScale(lang, undefined, options); break;
            case 8: questionData = this.level8_VolumeScale(lang, undefined, options); break;
            default: questionData = this.level1_ScaleConcept(lang, undefined, options); break;
        }

        enrichQuestionMetadata(questionData);

        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 3, 4];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'scale_direction_type':
            case 'scale_reading_val':
                return this.level1_ScaleConcept(lang, key);
            case 'reduction_cm_to_m':
            case 'reduction_calc_direct':
                return this.level2_Reduction(lang, key);
            case 'enlargement_calc_direct':
            case 'enlargement_mm_to_cm':
                return this.level3_Enlargement(lang, key);
            case 'determine_scale_blueprint':
            case 'determine_scale_map':
                return this.level4_DetermineScale(lang, key);
            case 'similarity_tri_side':
            case 'similarity_tri_height':
                return this.level5_Similarity(lang, key);
            case 'nested_topptriangel_base':
            case 'nested_topptriangel_side':
                return this.level6_NestedTransversal(lang, key);
            case 'area_scale_direct':
            case 'area_scale_inverse':
                return this.level7_AreaScale(lang, key);
            case 'volume_scale_direct':
            case 'volume_scale_inverse':
                return this.level8_VolumeScale(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private formatNum(num: number, lang: string): string {
        const clean = Math.round(num * 10000) / 10000;
        return lang === 'sv' ? clean.toString().replace('.', ',') : clean.toString();
    }

    private getVariation(pool: { key: string; type: 'concept' | 'calculate' }[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // =========================================================================
    // LEVEL 1: Begrepp & Skalriktning
    // =========================================================================
    private level1_ScaleConcept(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'scale_direction_type', type: 'concept' },
            { key: 'scale_reading_val', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSv = lang === 'sv';

        if (v === 'scale_direction_type') {
            const isEnlargement = Math.random() > 0.5;
            const k = MathUtils.randomChoice([2, 3, 4, 5, 8, 10, 15, 20, 25, 50, 75, 100, 200, 500]);
            const ratioStr = isEnlargement ? `${k}:1` : `1:${k}`;
            const randomShape = MathUtils.randomChoice(['rectangle', 'circle']);

            const correctLabel = isEnlargement ? (isSv ? "Förstoring" : "Enlargement") : (isSv ? "Förminskning" : "Reduction");
            const wrongLabel1 = isEnlargement ? (isSv ? "Förminskning" : "Reduction") : (isSv ? "Förstoring" : "Enlargement");
            const wrongLabel2 = isSv ? "Naturlig storlek (1:1)" : "Natural size (1:1)";

            const optionsList = MathUtils.shuffle([
                { label: correctLabel, value: "correct" },
                { label: wrongLabel1, value: "wrong_opposite" },
                { label: wrongLabel2, value: "wrong_neutral" }
            ]);

            return {
                renderData: {
                    description: isSv 
                        ? `Anger skalan ${ratioStr} en förstoring eller en förminskning?` 
                        : `Does the scale ${ratioStr} represent an enlargement or a reduction?`,
                    latex: "",
                    answerType: 'multiple_choice',
                    options: optionsList,
                    scale: {
                        type: 'scale_single',
                        ratio: ratioStr,
                        pictureLength: "1 cm",
                        realLength: `${k} cm`,
                        mode: isEnlargement ? 'enlargement' : 'reduction',
                        shape: randomShape
                    }
                },
                token: this.toBase64("correct"),
                variationKey: v,
                type: 'concept',
                clues: [
                    {
                        text: isSv ? "I en skala skrivs förhållandet alltid som (bild) : (verklighet)." : "A scale ratio is always written as (picture) : (reality).",
                        latex: `\\text{Skala} = \\frac{\\text{bild}}{\\text{verklighet}}`
                    },
                    {
                        text: isSv 
                            ? (isEnlargement 
                                ? `Eftersom det första talet (${k}) är större än 1 är bilden större än verkligheten. Det är en förstoring.` 
                                : `Eftersom det första talet är 1 och det andra talet är större (${k}) är bilden mindre än verkligheten. Det är en förminskning.`)
                            : (isEnlargement 
                                ? `Since the first number (${k}) is larger than 1, the picture is larger than reality. It is an enlargement.` 
                                : `Since the first number is 1 and the second is larger (${k}), the picture is smaller than reality. It is a reduction.`),
                        latex: `\\mathbf{\\text{${correctLabel}}}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        const k = MathUtils.randomChoice([5, 10, 15, 20, 25, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 1000]);
        const randomShape = MathUtils.randomChoice(['rectangle', 'circle']);
        return {
            renderData: {
                description: isSv 
                    ? `En karta är ritad i skala 1:${k}. Hur många centimeter i verkligheten motsvarar 1 cm på kartan?` 
                    : `A map is drawn at scale 1:${k}. How many centimeters in reality does 1 cm on the map represent?`,
                latex: "",
                answerType: 'numeric',
                scale: {
                    type: 'scale_single',
                    ratio: `1:${k}`,
                    pictureLength: "1 cm",
                    realLength: "x",
                    mode: 'reduction',
                    shape: randomShape
                }
            },
            token: this.toBase64(`${k}`),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: isSv 
                        ? `Skalan 1:${k} betyder att 1 cm på kartan motsvarar ${k} cm i verkligheten.` 
                        : `The scale 1:${k} means that 1 cm on the map corresponds to ${k} cm in reality.`,
                    latex: `1\\text{ cm på ritning} = ${k}\\text{ cm i verkligheten}`
                },
                {
                    text: isSv ? `Svar: ${k}` : `Answer: ${k}`,
                    latex: `\\mathbf{${k}}`
                }
            ],
            metadata: { 
                variation_key: v, 
                difficulty: 1,
                contextType: 'scale_reading_val',
                rawExpression: `${k}`
            }
        };
    }

    // =========================================================================
    // LEVEL 2: Förminskning (1:k Beräkna verklig längd)
    // =========================================================================
    private level2_Reduction(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'reduction_calc_direct', type: 'calculate' },
            { key: 'reduction_cm_to_m', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSv = lang === 'sv';
        const isToMeters = v === 'reduction_cm_to_m';

        const k = isToMeters 
            ? MathUtils.randomChoice([50, 100, 150, 200, 250, 300, 400, 500]) 
            : MathUtils.randomChoice([5, 10, 12, 15, 20, 25, 30, 40, 50]);

        const picCm = isToMeters && k >= 200 
            ? MathUtils.randomChoice([2, 3, 4, 5, 6, 7, 8, 10, 12, 15])
            : MathUtils.randomChoice([2, 2.5, 3, 4, 4.5, 5, 6, 7, 8, 9, 10, 12]);

        const realCmTotal = Math.round(picCm * k * 10) / 10;
        const finalNum = isToMeters ? Math.round((realCmTotal / 100) * 100) / 100 : realCmTotal;
        const unit = isToMeters ? "m" : "cm";

        const picStr = this.formatNum(picCm, lang);
        const realCmStr = this.formatNum(realCmTotal, lang);
        const finalStr = this.formatNum(finalNum, lang);

        const clues = [
            {
                text: isSv 
                    ? `Skalan 1:${k} innebär att verkligheten är ${k} gånger längre än ritningen.` 
                    : `The scale 1:${k} means that reality is ${k} times longer than the drawing.`,
                latex: `\\text{Verklig längd} = ${picStr} \\cdot ${k}`
            },
            {
                text: isSv 
                    ? `Beräkna den verkliga längden i centimeter:` 
                    : `Calculate the real length in centimeters:`,
                latex: `${picStr} \\cdot ${k} = \\mathbf{${realCmStr}}\\text{ cm}`
            }
        ];

        if (isToMeters) {
            clues.push({
                text: isSv 
                    ? `Omvandla till meter genom att dela med 100:` 
                    : `Convert to meters by dividing by 100:`,
                latex: `\\frac{${realCmStr}}{100} = \\mathbf{${finalStr}}\\text{ m}`
            });
        }

        clues.push({
            text: isSv ? `Svar: ${finalStr}` : `Answer: ${finalStr}`,
            latex: `\\mathbf{${finalStr}}`
        });

        const rawExpr = `${k} ; ${picCm} ; ${finalNum}`;
        const randomShape = MathUtils.randomChoice(['rectangle', 'circle']);

        return {
            renderData: {
                description: isSv 
                    ? `En ritning har skalan 1:${k}. En sträcka på ritningen är ${picStr} cm. Hur lång är sträckan i verkligheten? Svara i ${unit === 'm' ? 'meter' : 'centimeter'}.` 
                    : `A drawing has a scale of 1:${k}. A line on the drawing is ${picStr} cm. How long is the line in reality? Answer in ${unit === 'm' ? 'meters' : 'centimeters'}.`,
                latex: "",
                answerType: 'numeric',
                scale: {
                    type: 'scale_compare',
                    ratio: `1:${k}`,
                    pictureLength: `${picStr} cm`,
                    realLength: "x",
                    mode: 'reduction',
                    shape: randomShape
                }
            },
            token: this.toBase64(finalNum.toString()),
            variationKey: v,
            type: 'calculate',
            clues,
            metadata: { 
                variation_key: v, 
                difficulty: 2,
                contextType: isToMeters ? 'scale_calc_real_m' : 'scale_calc_real',
                rawExpression: rawExpr
            }
        };
    }

    // =========================================================================
    // LEVEL 3: Förstoring (k:1 Beräkna bildens mått)
    // =========================================================================
    private level3_Enlargement(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'enlargement_calc_direct', type: 'calculate' },
            { key: 'enlargement_mm_to_cm', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSv = lang === 'sv';
        const isToCm = v === 'enlargement_mm_to_cm';

        const k = isToCm 
            ? MathUtils.randomChoice([5, 10, 15, 20, 25, 40, 50]) 
            : MathUtils.randomChoice([2, 3, 4, 5, 6, 8, 10, 12, 15]);

        const realMm = isToCm 
            ? MathUtils.randomChoice([2, 3, 4, 5, 6, 7, 8, 12, 15, 20])
            : MathUtils.randomChoice([1.5, 2, 2.5, 3, 4, 4.5, 5, 6, 7, 8, 9, 11, 14]);

        const picMmTotal = Math.round(realMm * k * 10) / 10;
        const finalNum = isToCm ? Math.round((picMmTotal / 10) * 10) / 10 : picMmTotal;
        const unit = isToCm ? "cm" : "mm";

        const realStr = this.formatNum(realMm, lang);
        const picMmStr = this.formatNum(picMmTotal, lang);
        const finalStr = this.formatNum(finalNum, lang);

        const clues = [
            {
                text: isSv 
                    ? `Skalan ${k}:1 är en förstoring där bilden är ${k} gånger större än verkligheten.` 
                    : `The scale ${k}:1 is an enlargement where the image is ${k} times larger than reality.`,
                latex: `\\text{Bildens längd} = ${realStr} \\cdot ${k}`
            },
            {
                text: isSv 
                    ? `Multiplicera med skalfaktorn:` 
                    : `Multiply by the scale factor:`,
                latex: `${realStr} \\cdot ${k} = \\mathbf{${picMmStr}}\\text{ mm}`
            }
        ];

        if (isToCm) {
            clues.push({
                text: isSv 
                    ? `Omvandla millimeter till centimeter genom att dela med 10:` 
                    : `Convert millimeters to centimeters by dividing by 10:`,
                latex: `\\frac{${picMmStr}}{10} = \\mathbf{${finalStr}}\\text{ cm}`
            });
        }

        clues.push({
            text: isSv ? `Svar: ${finalStr}` : `Answer: ${finalStr}`,
            latex: `\\mathbf{${finalStr}}`
        });

        const rawExpr = `${k} ; ${realMm} ; ${finalNum}`;

        return {
            renderData: {
                description: isSv 
                    ? `Ett litet föremål är ${realStr} mm i verkligheten. Hur långt blir föremålet på en bild i skala ${k}:1? Svara i ${unit === 'cm' ? 'centimeter' : 'millimeter'}.` 
                    : `A small object is ${realStr} mm in reality. How long will the object be in an image with scale ${k}:1? Answer in ${unit === 'cm' ? 'centimeters' : 'millimeters'}.`,
                latex: "",
                answerType: 'numeric',
                scale: {
                    type: 'scale_compare',
                    ratio: `${k}:1`,
                    pictureLength: "x",
                    realLength: `${realStr} mm`,
                    mode: 'enlargement'
                }
            },
            token: this.toBase64(finalNum.toString()),
            variationKey: v,
            type: 'calculate',
            clues,
            metadata: { 
                variation_key: v, 
                difficulty: 2,
                contextType: isToCm ? 'scale_calc_enlarge_cm' : 'scale_calc_enlarge',
                rawExpression: rawExpr
            }
        };
    }

    // =========================================================================
    // LEVEL 4: Bestämma skala (Omvandla enheter & bestäm förhållandet)
    // =========================================================================
    private level4_DetermineScale(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'determine_scale_blueprint', type: 'calculate' },
            { key: 'determine_scale_map', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSv = lang === 'sv';
        const isMap = v === 'determine_scale_map';

        const k = isMap 
            ? MathUtils.randomChoice([2000, 4000, 5000, 10000, 15000, 20000, 25000, 50000, 100000]) 
            : MathUtils.randomChoice([15, 20, 25, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500]);
        
        const picCm = MathUtils.randomChoice([2, 3, 4, 5, 6, 8, 10]);
        const realCmTotal = picCm * k;
        const realM = realCmTotal / 100;
        const realKm = Math.round((realM / 1000) * 100) / 100;

        const realValStr = isMap ? `${this.formatNum(realKm, lang)} km` : `${this.formatNum(realM, lang)} m`;
        const rawExpr = isMap ? `${picCm} ; ${realKm} ; ${k}` : `${picCm} ; ${realM} ; ${k}`;

        const conversionSteps = isMap
            ? `${this.formatNum(realKm, lang)}\\text{ km} \\cdot 1000 = ${this.formatNum(realM, lang)}\\text{ m} \\cdot 100 = \\mathbf{${realCmTotal}}\\text{ cm}`
            : `${this.formatNum(realM, lang)}\\text{ m} \\cdot 100 = \\mathbf{${realCmTotal}}\\text{ cm}`;

        return {
            renderData: {
                description: isSv 
                    ? `En sträcka är ${realValStr} i verkligheten och ${picCm} cm på en ritning. Vilken skala är ritningen ritad i? (Svara som 1:...)` 
                    : `A distance is ${realValStr} in reality and ${picCm} cm on a map. What is the scale of the map? (Answer as 1:...)`,
                latex: "",
                answerType: 'scale',
                scale: {
                    type: 'scale_compare',
                    ratio: "?",
                    pictureLength: `${picCm} cm`,
                    realLength: realValStr,
                    mode: 'reduction'
                }
            },
            token: this.toBase64(`1:${k}`),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: isSv 
                        ? "Skala är förhållandet mellan bild och verklighet. Omvandla först verklighetens längd till centimeter:" 
                        : "Scale is the ratio between picture and reality. Convert the real distance to centimeters first:",
                    latex: conversionSteps
                },
                {
                    text: isSv 
                        ? `Skriv förhållandet som ett bråk och förkorta med ${picCm}:` 
                        : `Write the ratio as a fraction and reduce by ${picCm}:`,
                    latex: `\\frac{${picCm}}{${realCmTotal}} = \\frac{1}{\\mathbf{${k}}}`
                },
                {
                    text: isSv ? `Svar: 1:${k}` : `Answer: 1:${k}`,
                    latex: `\\mathbf{1:${k}}`
                }
            ],
            metadata: { 
                variation_key: v, 
                difficulty: 3,
                contextType: isMap ? 'scale_determine_map_ratio' : 'scale_determine_ratio',
                rawExpression: rawExpr
            }
        };
    }

    // =========================================================================
    // LEVEL 5: Likformiga trianglar & månghörningar (Motsvarande sidor)
    // =========================================================================
    private level5_Similarity(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'similarity_tri_side', type: 'calculate' },
            { key: 'similarity_tri_height', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSv = lang === 'sv';

        const shapeConfig = MathUtils.randomChoice([
            { shapeType: 'triangle', subtype: 'right', nameSv: 'rätvinkliga trianglarna', nameEn: 'right triangles' },
            { shapeType: 'triangle', subtype: 'isosceles', nameSv: 'likbenta trianglarna', nameEn: 'isosceles triangles' },
            { shapeType: 'parallelogram', subtype: 'standard', nameSv: 'parallellogrammerna', nameEn: 'parallelograms' }
        ]);

        const k = MathUtils.randomChoice([1.5, 2, 2.5, 3, 4, 5]);
        const base1 = MathUtils.randomChoice([4, 6, 8, 10, 12, 14, 16]);
        const height1 = MathUtils.randomChoice([3, 5, 6, 7, 8, 9, 10, 12]);

        const base2 = Math.round(base1 * k * 10) / 10;
        const height2 = Math.round(height1 * k * 10) / 10;
        const isHeightTarget = v === 'similarity_tri_height';
        const finalVal = isHeightTarget ? height2 : base2;

        const kStr = this.formatNum(k, lang);
        const finalStr = this.formatNum(finalVal, lang);
        const knownLarge = isHeightTarget ? base2 : height2;
        const knownSmall = isHeightTarget ? base1 : height1;
        const targetSmall = isHeightTarget ? height1 : base1;

        return {
            renderData: {
                description: isSv 
                    ? `De två ${shapeConfig.nameSv} nedan är likformiga. Beräkna längden på sidan som är markerad med x.` 
                    : `The two ${shapeConfig.nameEn} below are similar. Calculate the length of the side marked with x.`,
                latex: "",
                answerType: 'numeric',
                similarity: {
                    type: 'similarity_compare',
                    shapeType: shapeConfig.shapeType,
                    subtype: shapeConfig.subtype,
                    leftDims: { w: base1, h: height1 },
                    leftLabels: { b: `${base1}`, h: `${height1}` },
                    rightDims: { w: base2, h: height2 },
                    rightLabels: { 
                        b: isHeightTarget ? `${base2}` : "x", 
                        h: isHeightTarget ? "x" : `${height2}` 
                    }
                }
            },
            token: this.toBase64(finalVal.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: isSv 
                        ? "Bestäm skalfaktorn k genom att dividera de motsvarande kända sidorna:" 
                        : "Determine the scale factor k by dividing the corresponding known sides:",
                    latex: `k = \\frac{${knownLarge}}{${knownSmall}} = \\mathbf{${kStr}}`
                },
                {
                    text: isSv 
                        ? "Multiplicera den lilla figurens motsvarande sida med skalfaktorn:" 
                        : "Multiply the corresponding side of the small figure by the scale factor:",
                    latex: `x = ${targetSmall} \\cdot ${kStr} = \\mathbf{${finalStr}}`
                },
                {
                    text: isSv ? `Svar: ${finalStr}` : `Answer: ${finalStr}`,
                    latex: `\\mathbf{${finalStr}}`
                }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // =========================================================================
    // LEVEL 6: Topptriangelsatsen & Parallelltransversal (Nested Triangles)
    // =========================================================================
    private level6_NestedTransversal(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'nested_topptriangel_base', type: 'calculate' },
            { key: 'nested_topptriangel_side', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSv = lang === 'sv';
        const isSideTarget = v === 'nested_topptriangel_side';

        const candidates = [
            { top: 2, bot: 2, k: 2 },
            { top: 2, bot: 4, k: 3 },
            { top: 3, bot: 3, k: 2 },
            { top: 3, bot: 6, k: 3 },
            { top: 4, bot: 2, k: 1.5 },
            { top: 4, bot: 4, k: 2 },
            { top: 4, bot: 8, k: 3 },
            { top: 5, bot: 5, k: 2 },
            { top: 6, bot: 3, k: 1.5 },
            { top: 6, bot: 6, k: 2 }
        ];
        const chosen = MathUtils.randomChoice(candidates);
        const topSide = chosen.top;
        const bottomSeg = chosen.bot;
        const fullSide = topSide + bottomSeg;
        const k = chosen.k;

        const topBase = MathUtils.randomChoice([2, 3, 4, 5, 6, 8, 10]);
        const fullBase = Math.round(topBase * k * 10) / 10;

        const targetVal = isSideTarget ? fullSide : fullBase;
        const targetStr = this.formatNum(targetVal, lang);
        const kStr = this.formatNum(k, lang);

        return {
            renderData: {
                description: isSv 
                    ? (isSideTarget 
                        ? "Den horisontella transversalen är parallell med basen. Enligt topptriangelsatsen är topptriangeln likformig med hela triangeln. Beräkna hela sidans längd x."
                        : "Den horisontella transversalen är parallell med basen. Enligt topptriangelsatsen är den lilla topptriangeln likformig med hela triangeln. Beräkna basen x.")
                    : "The horizontal transversal is parallel to the base. By the triangle proportionality theorem, the top triangle is similar to the entire triangle. Calculate x.",
                latex: "",
                answerType: 'numeric',
                similarity: {
                    type: 'similarity_compare',
                    variant: 'nested',
                    nested: {
                        topBase: `${topBase}`,
                        fullBase: isSideTarget ? `${fullBase}` : "x",
                        topSide: `${topSide}`,
                        fullSide: isSideTarget ? "x" : `${fullSide}`
                    }
                }
            },
            token: this.toBase64(targetVal.toString()),
            variationKey: v,
            type: 'calculate',
            clues: isSideTarget ? [
                {
                    text: isSv 
                        ? "Bestäm skalfaktorn k från de två parallella baserna:" 
                        : "Determine the scale factor k from the two parallel bases:",
                    latex: `k = \\frac{${fullBase}}{${topBase}} = \\mathbf{${kStr}}`
                },
                {
                    text: isSv 
                        ? "Multiplicera topptriangelns sida med skalfaktorn k:" 
                        : "Multiply the top triangle's side by the scale factor k:",
                    latex: `x = ${topSide} \\cdot ${kStr} = \\mathbf{${targetStr}}`
                },
                {
                    text: isSv ? `Svar: ${targetStr}` : `Answer: ${targetStr}`,
                    latex: `\\mathbf{${targetStr}}`
                }
            ] : [
                {
                    text: isSv 
                        ? `Bestäm skalfaktorn k från topptriangelns sida (${topSide}) till hela sidans längd (${fullSide}):` 
                        : `Determine the scale factor k from the top side (${topSide}) to the full side (${fullSide}):`,
                    latex: `k = \\frac{${fullSide}}{${topSide}} = \\mathbf{${kStr}}`
                },
                {
                    text: isSv 
                        ? "Multiplicera topptriangelns bas med skalfaktorn k:" 
                        : "Multiply the top triangle's base by the scale factor k:",
                    latex: `x = ${topBase} \\cdot ${kStr} = \\mathbf{${targetStr}}`
                },
                {
                    text: isSv ? `Svar: ${targetStr}` : `Answer: ${targetStr}`,
                    latex: `\\mathbf{${targetStr}}`
                }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    // =========================================================================
    // LEVEL 7: Areaskala & Omvänd Areaskala (k^2 <-> k)
    // =========================================================================
    private level7_AreaScale(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'area_scale_direct', type: 'calculate' },
            { key: 'area_scale_inverse', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSv = lang === 'sv';
        const isInverse = v === 'area_scale_inverse';

        const shapeType = MathUtils.randomChoice(['rectangle', 'circle']);
        const shapeNameSv = shapeType === 'circle' ? 'cirklar' : 'rektanglar';
        const shapeNameEn = shapeType === 'circle' ? 'circles' : 'rectangles';

        const k = MathUtils.randomChoice([2, 3, 4, 5, 6, 10]);
        const areaFactor = k * k;

        if (!isInverse) {
            const smallArea = MathUtils.randomChoice([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25]);
            const largeArea = smallArea * areaFactor;

            return {
                renderData: {
                    description: isSv 
                        ? `Två likformiga ${shapeNameSv} har längdskalan 1:${k}. Den mindre figuren har arean ${smallArea} cm². Beräkna arean av den större figuren.` 
                        : `Two similar ${shapeNameEn} have a scale factor of 1:${k}. The smaller figure has an area of ${smallArea} cm². Calculate the area of the larger figure.`,
                    latex: "",
                    answerType: 'numeric',
                    compareArea: {
                        type: 'compare_shapes_area',
                        shapeType: shapeType,
                        k,
                        leftArea: `${smallArea} cm²`,
                        rightArea: "x",
                        leftDims: { w: 8, h: 5 },
                        leftLabels: { w: "b", h: "h" },
                        rightDims: { w: 8 * 1.5, h: 5 * 1.5 },
                        rightLabels: { w: `${k}b`, h: `${k}h` }
                    }
                },
                token: this.toBase64(largeArea.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: isSv 
                            ? "När längden förstoras med skalfaktorn k förstoras arean med k² (areaskalan):" 
                            : "When linear dimensions are scaled by factor k, area scales by k²:",
                        latex: `\\text{Areaskala} = k^2 = ${k}^2 = \\mathbf{${areaFactor}}`
                    },
                    {
                        text: isSv 
                            ? "Multiplicera den mindre figurens area med areaskalan:" 
                            : "Multiply the small area by the area scale factor:",
                        latex: `\\text{Area} = ${smallArea} \\cdot ${areaFactor} = \\mathbf{${largeArea}}\\text{ cm}^2`
                    },
                    {
                        text: isSv ? `Svar: ${largeArea}` : `Answer: ${largeArea}`,
                        latex: `\\mathbf{${largeArea}}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        const smallArea = MathUtils.randomChoice([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]);
        const smallSide = MathUtils.randomChoice([2, 3, 4, 5, 6, 7, 8]);
        const largeSide = smallSide * k;
        const largeArea = smallArea * areaFactor;

        return {
            renderData: {
                description: isSv 
                    ? `Två likformiga figurer har areorna ${smallArea} dm² och ${largeArea} dm². En sida i den mindre figuren är ${smallSide} dm. Hur lång är motsvarande sida i den större figuren?` 
                    : `Two similar shapes have areas of ${smallArea} dm² and ${largeArea} dm². A side of the smaller shape is ${smallSide} dm. What is the length of the corresponding side in the larger shape?`,
                latex: "",
                answerType: 'numeric',
                compareArea: {
                    type: 'compare_shapes_area',
                    shapeType: 'rectangle',
                    k,
                    leftArea: `${smallArea} dm²`,
                    rightArea: `${largeArea} dm²`,
                    leftDims: { w: 8, h: 6 },
                    leftLabels: { w: `${smallSide} dm` },
                    rightDims: { w: 14, h: 10 },
                    rightLabels: { w: "x" }
                }
            },
            token: this.toBase64(largeSide.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: isSv 
                        ? "Beräkna areaskalan genom att dividera de två areorna:" 
                        : "Calculate the area scale factor by dividing the areas:",
                    latex: `\\text{Areaskala} = \\frac{${largeArea}}{${smallArea}} = \\mathbf{${areaFactor}}`
                },
                {
                    text: isSv 
                        ? "Längdskalan k är kvadratroten ur areaskalan:" 
                        : "The linear scale factor k is the square root of the area scale:",
                    latex: `k = \\sqrt{${areaFactor}} = \\mathbf{${k}}`
                },
                {
                    text: isSv 
                        ? "Multiplicera den lilla figurens sida med längdskalan k:" 
                        : "Multiply the small side by the linear scale factor:",
                    latex: `x = ${smallSide} \\cdot ${k} = \\mathbf{${largeSide}}\\text{ dm}`
                },
                {
                    text: isSv ? `Svar: ${largeSide}` : `Answer: ${largeSide}`,
                    latex: `\\mathbf{${largeSide}}`
                }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    // =========================================================================
    // LEVEL 8: Volymskala & Omvänd Volymskala (k^3 <-> k)
    // =========================================================================
    private level8_VolumeScale(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'volume_scale_direct', type: 'calculate' },
            { key: 'volume_scale_inverse', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSv = lang === 'sv';
        const isInverse = v === 'volume_scale_inverse';

        const shapeType = MathUtils.randomChoice(['cuboid', 'cylinder']);
        const shapeNameSv = shapeType === 'cylinder' ? 'cylindrar' : 'rätblock';
        const shapeNameEn = shapeType === 'cylinder' ? 'cylinders' : 'cuboids';

        const k = MathUtils.randomChoice([2, 3, 4, 5, 10]);
        const volFactor = k * k * k;

        if (!isInverse) {
            const smallVol = MathUtils.randomChoice([1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15, 20]);
            const largeVol = Math.round(smallVol * volFactor * 10) / 10;
            const smallVolStr = this.formatNum(smallVol, lang);
            const largeVolStr = this.formatNum(largeVol, lang);

            return {
                renderData: {
                    description: isSv 
                        ? `Två likformiga ${shapeNameSv} har längdskalan 1:${k}. Den mindre rymmer ${smallVolStr} liter. Hur många liter rymmer den större?` 
                        : `Two similar ${shapeNameEn} have a linear scale of 1:${k}. The smaller holds ${smallVolStr} liters. How many liters does the larger hold?`,
                    latex: "",
                    answerType: 'numeric',
                    compareVolume: {
                        type: 'compare_volume',
                        shapeType: shapeType,
                        k,
                        leftVol: `${smallVolStr} l`,
                        rightVol: "x",
                        leftLabels: { r: "r", h: "h" },
                        rightLabels: { r: `${k}r`, h: `${k}h` }
                    }
                },
                token: this.toBase64(largeVol.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: isSv 
                            ? "När en kropps längdmått förstoras med k förstoras volymen med k³ (volymskalan):" 
                            : "When linear dimensions are scaled by factor k, volume scales by k³:",
                        latex: `\\text{Volymskala} = k^3 = ${k}^3 = \\mathbf{${volFactor}}`
                    },
                    {
                        text: isSv 
                            ? "Multiplicera den mindre volymen med volymskalan:" 
                            : "Multiply the small volume by the volume scale:",
                        latex: `V = ${smallVolStr} \\cdot ${volFactor} = \\mathbf{${largeVolStr}}\\text{ liter}`
                    },
                    {
                        text: isSv ? `Svar: ${largeVolStr}` : `Answer: ${largeVolStr}`,
                        latex: `\\mathbf{${largeVolStr}}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 5 }
            };
        }

        const smallVol = MathUtils.randomChoice([2, 3, 4, 5, 6, 8, 10, 15]);
        const smallHeight = MathUtils.randomChoice([2, 3, 4, 5, 6, 7, 8, 10, 12]);
        const largeHeight = smallHeight * k;
        const largeVol = smallVol * volFactor;

        return {
            renderData: {
                description: isSv 
                    ? `Två likformiga ${shapeNameSv} har volymerna ${smallVol} dm³ och ${largeVol} dm³. Den mindre har höjden ${smallHeight} cm. Vad är höjden på den större?` 
                    : `Two similar ${shapeNameEn} have volumes of ${smallVol} dm³ and ${largeVol} dm³. The smaller has a height of ${smallHeight} cm. What is the height of the larger?`,
                latex: "",
                answerType: 'numeric',
                compareVolume: {
                    type: 'compare_volume',
                    shapeType: shapeType,
                    k,
                    leftVol: `${smallVol} dm³`,
                    rightVol: `${largeVol} dm³`,
                    leftLabels: { h: `${smallHeight}`, w: `${smallHeight}`, d: `${smallHeight}` },
                    rightLabels: { h: "x", w: "x", d: "x" }
                }
            },
            token: this.toBase64(largeHeight.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: isSv 
                        ? "Beräkna volymskalan genom att dividera de två volymerna:" 
                        : "Calculate the volume scale factor by dividing the volumes:",
                    latex: `\\text{Volymskala} = \\frac{${largeVol}}{${smallVol}} = \\mathbf{${volFactor}}`
                },
                {
                    text: isSv 
                        ? "Längdskalan k är kubikroten (tredjeroten) ur volymskalan:" 
                        : "The linear scale factor k is the cube root of the volume scale:",
                    latex: `k = \\sqrt[3]{${volFactor}} = \\mathbf{${k}}`
                },
                {
                    text: isSv 
                        ? "Multiplicera den lilla höjden med längdskalan k:" 
                        : "Multiply the small height by the linear scale factor:",
                    latex: `h = ${smallHeight} \\cdot ${k} = \\mathbf{${largeHeight}}\\text{ cm}`
                },
                {
                    text: isSv ? `Svar: ${largeHeight}` : `Answer: ${largeHeight}`,
                    latex: `\\mathbf{${largeHeight}}`
                }
            ],
            metadata: { variation_key: v, difficulty: 5 }
        };
    }
}