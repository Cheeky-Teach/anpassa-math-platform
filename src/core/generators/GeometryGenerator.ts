import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class GeometryGenerator {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Level Jump: If Level 1 concepts are mastered, push to Level 2
        if (level === 1 && options.hideConcept) {
            return this.level2_AreaBasic(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_PerimeterBasic(lang, undefined, options); break;
            case 2: questionData = this.level2_AreaBasic(lang, undefined, options); break;
            case 3: questionData = this.level3_Triangles(lang, undefined, options); break;
            case 4: questionData = this.level4_CombinedFigures(lang, undefined, options); break;
            case 5: questionData = this.level5_Circles(lang, undefined, options); break;
            case 6: questionData = questionData = this.level6_CompositeAdvanced(lang, undefined, options); break;
            default: questionData = this.level1_PerimeterBasic(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 3, 4, 5, 6];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    /**
     * Targeted Generation for Question Studio
     * Must match skillBuckets.js exactly to maintain studio/visual communication.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'perimeter_square':
            case 'perimeter_rect':
            case 'perimeter_parallel':
            case 'perimeter_inverse':
            case 'perimeter_lie':
                return this.level1_PerimeterBasic(lang, key);
            case 'area_square':
            case 'area_rect':
            case 'area_parallel':
            case 'area_inverse':
            case 'area_trap':
                return this.level2_AreaBasic(lang, key);
            case 'area_triangle':
            case 'inverse_triangle':
            case 'perimeter_triangle_right':
            case 'perimeter_triangle_iso':
            case 'perimeter_triangle_scalene':
                return this.level3_Triangles(lang, key);
            case 'combined_rect_tri':
            case 'combined_l_shape':
            case 'combined_house':
                return this.level4_CombinedFigures(lang, key);
            case 'circle_area':
            case 'circle_perimeter':
            case 'semicircle_area':
            case 'semicircle_perimeter':
            case 'area_quarter':
            case 'perimeter_quarter':
                return this.level5_Circles(lang, key);
            case 'perimeter_house':
            case 'perimeter_portal':
            case 'area_house':
            case 'area_portal':
                return this.level6_CompositeAdvanced(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
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

    // --- LEVEL 1: PERIMETER BASIC ---
    private level1_PerimeterBasic(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'perimeter_square', type: 'calculate' },
            { key: 'perimeter_rect', type: 'calculate' },
            { key: 'perimeter_parallel', type: 'calculate' },
            { key: 'perimeter_inverse', type: 'calculate' },
            { key: 'perimeter_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'perimeter_square') {
            const s = MathUtils.randomInt(4, 15);
            const ans = 4 * s;
            return {
                renderData: {
                    geometry: { type: 'square', width: s, height: s, labels: { b: s, h: s } },
                    description: lang === 'sv' ? "Beräkna kvadratens omkrets." : "Calculate the perimeter of the square.",
                    latex: `4 \\cdot ${s}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' ? "Omkretsen betyder hela varvet runt figurens ytterkanter." : "The perimeter means the entire path around the figure's outer edges.",
                        latex: `\\text{Omkrets} = \\text{sida}_1 + \\text{sida}_2 + \\text{sida}_3 + \\text{sida}_4`
                    },
                    {
                        text: lang === 'sv' ? `En kvadrat har 4 lika långa sidor. Varje sida är ${s} cm.` : `A square has 4 sides of equal length. Each side is ${s} cm.`,
                        latex: `\\text{Omkrets} = ${s} + ${s} + ${s} + ${s}`
                    },
                    {
                        text: lang === 'sv' ? `Vi kan skriva om pluskedjan till ett snabbare gångertal: 4 gånger ${s}.` : `We can rewrite the addition chain into a faster multiplication layout: 4 times ${s}.`,
                        latex: `\\text{Omkrets} = \\mathbf{4 \\cdot ${s}}`
                    },
                    {
                        text: lang === 'sv' ? "Räkna ut multiplikationen för att bestämma totalsvaret." : "Calculate the multiplication to determine the total answer.",
                        latex: `\\text{Omkrets} = \\mathbf{${ans}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                        latex: `${ans}`
                    }
                ]
            };
        }

        if (v === 'perimeter_inverse') {
            const b = MathUtils.randomInt(6, 15), h = MathUtils.randomInt(3, 8);
            const p = 2 * (b + h);
            return {
                renderData: {
                    geometry: { type: 'rectangle', width: b, height: h, labels: { b, h: '?' } },
                    description: lang === 'sv' ? `En rektangel har omkretsen ${p} cm. Basen är ${b} cm. Hur lång är höjden?` : `A rectangle has a perimeter of ${p} cm. The base is ${b} cm. What is the height?`,
                    latex: `P = ${p}, b = ${b}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(h.toString()), variationKey: v, type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' ? `Hela varvet runt rektangeln är ${p} cm. Den består av två likadana bottensidor och två stående höjder.` : `The whole loop around the rectangle is ${p} cm. It consists of two matching base lines and two vertical heights.`,
                        latex: `2 \\cdot \\text{botten} + 2 \\cdot \\text{höjd} = ${p}`
                    },
                    {
                        text: lang === 'sv' ? `Räkna ut vad de två kända bottensidorna blir tillsammans: 2 gånger ${b} cm.` : `Calculate what the two known base lines equal together: 2 times ${b} cm.`,
                        latex: `\\mathbf{2 \\cdot ${b}} + 2 \\cdot \\text{höjd} = ${p} \\rightarrow \\mathbf{${2 * b}} + 2 \\cdot \\text{höjd} = ${p}`
                    },
                    {
                        text: lang === 'sv' ? `Dra bort bottensidorna (${2 * b}) från hela omkretsen ${p} för att se vad som blir kvar till höjderna.` : `Subtract the base lines (${2 * b}) from the total perimeter ${p} to see what is left over for the heights.`,
                        latex: `2 \\cdot \\text{höjd} = ${p} \\mathbf{- ${2 * b}}`
                    },
                    {
                        text: lang === 'sv' ? "Förenkla subtraktionen:" : "Simplify the subtraction:",
                        latex: `2 \\cdot \\text{höjd} = \\mathbf{${p - 2 * b}}`
                    },
                    {
                        text: lang === 'sv' ? `Dela svaret (${p - 2 * b}) på 2, eftersom de två stående höjderna delar på resten av sträckan.` : `Divide the value (${p - 2 * b}) by 2, since the two vertical heights share the rest of the distance equally.`,
                        latex: `\\text{höjd} = \\frac{${p - 2 * b}}{\\mathbf{2}}`
                    },
                    {
                        text: lang === 'sv' ? "Slutför divisionen för att hitta den saknade höjdsidan." : "Complete the final division to find the missing height parameter.",
                        latex: `\\text{höjd} = \\mathbf{${h}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${h}` : `Answer: ${h}`,
                        latex: `${h}`
                    }
                ]
            };
        }

        // Default: Rectangle/Parallelogram Perimeter
        const b = MathUtils.randomInt(6, 12), h = MathUtils.randomInt(3, 8);
        const isParallel = v === 'perimeter_parallel';
        const ans = 2 * (b + h);

        return {
            renderData: {
                geometry: { 
                    type: isParallel ? 'parallelogram' : 'rectangle', 
                    width: b, 
                    height: h, 
                    labels: isParallel ? { b, s: h } : { b, h } 
                },
                description: lang === 'sv' ? "Beräkna omkretsen." : "Calculate the perimeter.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                {
                    text: lang === 'sv' ? "Omkretsen betyder hela sträckan runt figurens alla ytterkanter." : "The perimeter means the total distance around all the outer edges of the figure.",
                    latex: `\\text{Omkrets} = \\text{sida}_1 + \\text{sida}_2 + \\text{sida}_3 + \\text{sida}_4`
                },
                {
                    text: lang === 'sv' ? `Figuren har två likadana vågräta sidor (${b} cm) och två likadana sneda/stående sidor (${h} cm).` : `The figure has two identical horizontal lines (${b} cm) and two identical vertical/slant lines (${h} cm).`,
                    latex: `\\text{Omkrets} = ${b} + ${h} + ${b} + ${h}`
                },
                {
                    text: lang === 'sv' ? "Sortera raden genom att lägga ihop de matchande sidparen var för sig." : "Group the expression by adding the matching side pairs separately.",
                    latex: `\\text{Omkrets} = \\mathbf{(${b} + ${b})} + \\mathbf{(${h} + ${h})} \\rightarrow \\mathbf{${2*b}} + \\mathbf{${2*h}}`
                },
                {
                    text: lang === 'sv' ? "Addera de två delsummorna för att få fram det slutgiltiga svaret." : "Add the two partial sums together to reach the final answer value.",
                    latex: `\\text{Omkrets} = \\mathbf{${ans}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                    latex: `${ans}`
                }
            ]
        };
    }

    // --- LEVEL 2: AREA BASIC ---
    private level2_AreaBasic(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'area_square', type: 'calculate' },
            { key: 'area_rect', type: 'calculate' },
            { key: 'area_parallel', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const b = MathUtils.randomInt(5, 12), h = MathUtils.randomInt(3, 8);

        return {
            renderData: {
                geometry: { type: v === 'area_parallel' ? 'parallelogram' : 'rectangle', width: b, height: h, labels: { b, h } },
                description: lang === 'sv' ? "Beräkna figurens area." : "Calculate the area of the figure.",
                latex: `${b} \\cdot ${h}`,
                answerType: 'numeric'
            },
            token: this.toBase64((b * h).toString()), variationKey: v, type: 'calculate',
            clues: [
                {
                    text: lang === 'sv' ? "Area betyder storleken på själva golvytan inuti figuren." : "Area means the size of the internal surface or floor space inside the figure.",
                    latex: `\\text{Area} = \\text{bredd} \\cdot \\text{höjd}`
                },
                {
                    text: lang === 'sv' ? `Gångra (multiplicera) den platta bottensidan (${b} cm) med den raka höjden uppåt (${h} cm).` : `Multiply the flat baseline dimension (${b} cm) by the straight upward height value (${h} cm).`,
                    latex: `\\text{Area} = \\mathbf{${b} \\cdot ${h}}`
                },
                {
                    text: lang === 'sv' ? "Utför multiplikationen för att räkna ut ytan." : "Execute the multiplication to compute the internal surface score.",
                    latex: `\\text{Area} = \\mathbf{${b * h}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${b * h}` : `Answer: ${b * h}`,
                    latex: `${b * h}`
                }
            ]
        };
    }

    // --- LEVEL 3: TRIANGLES ---
    private level3_Triangles(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'area_triangle', type: 'calculate' },
            { key: 'perimeter_triangle_right', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'perimeter_triangle_right') {
            const m = MathUtils.randomInt(2, 5), n = 1;
            const a = m*m - n*n, b = 2*m*n, c = m*m + n*n;
            const ans = a + b + c;
            return {
                renderData: {
                    geometry: { type: 'triangle', subtype: 'right', width: a, height: b, labels: { b: a, h: b, hyp: c } },
                    description: lang === 'sv' ? "Beräkna triangelns omkrets." : "Calculate the perimeter of the triangle.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' ? "Omkretsen får vi genom att plussa ihop triangelns tre yttre kanter." : "We find the perimeter by adding together the three outer edges of the triangle.",
                        latex: `\\text{Omkrets} = \\text{sida}_1 + \\text{sida}_2 + \\text{sida}_3`
                    },
                    {
                        text: lang === 'sv' ? `Lägg ihop de tre kända sidlängderna från figuren: ${a} cm, ${b} cm och den långa sneda linjen på ${c} cm.` : `Add the three known side lengths from the figure: ${a} cm, ${b} cm, and the long diagonal line of ${c} cm.`,
                        latex: `\\text{Omkrets} = \\mathbf{${a} + ${b} + ${c}}`
                    },
                    {
                        text: lang === 'sv' ? "Förenkla additionen för att räkna ut den totala sträckan runt om." : "Simplify the addition step to calculate the complete loop distance score total.",
                        latex: `\\text{Omkrets} = \\mathbf{${ans}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                        latex: `${ans}`
                    }
                ]
            };
        }

        const base = MathUtils.randomInt(6, 12), height = MathUtils.randomInt(4, 10);
        const area = (base * height) / 2;
        return {
            renderData: {
                geometry: { type: 'triangle', width: base, height: height, labels: { b: base, h: height } },
                description: lang === 'sv' ? "Beräkna triangelns area." : "Calculate the area of the triangle.",
                answerType: 'numeric'
            },
            token: this.toBase64(area.toString()), variationKey: v, type: 'calculate',
            clues: [
                {
                    text: lang === 'sv' ? "En triangel rymmer alltid exakt hälften så mycket yta som en vanlig fyrkant med samma mått." : "A triangle always holds exactly half the space surface of a standard rectangle with the same measurements.",
                    latex: `\\text{Area} = \\frac{\\text{basen} \\cdot \\text{höjden}}{2}`
                },
                {
                    text: lang === 'sv' ? `Gör uppställningen genom att sätta in basen (${base} cm) och den raka höjden (${height} cm) i täljaren:` : `Set up the structure by inserting the base (${base} cm) and the vertical height (${height} cm) inside the numerator position:`,
                    latex: `\\text{Area} = \\frac{\\mathbf{${base} \\cdot ${height}}}{2}`
                },
                {
                    text: lang === 'sv' ? `Räkna ut gångertalet däruppe i täljaren först: ${base} gånger ${height} blir ${base * height}.` : `Calculate the multiplication on top inside the numerator track first: ${base} times ${height} equals ${base * height}.`,
                    latex: `\\text{Area} = \\frac{\\mathbf{${base * height}}}{2}`
                },
                {
                    text: lang === 'sv' ? `Dela nu resultatet med 2 för att halvera ytan och hitta slutsvaret.` : `Now divide that result score by 2 to split the surface layer and find your solution answer.`,
                    latex: `\\text{Area} = \\mathbf{${area}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${area}` : `Answer: ${area}`,
                    latex: `${area}`
                }
            ]
        };
    }

    // --- LEVEL 5: CIRCLES (REFACTORED & FIXED) ---
    private level5_Circles(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'circle_area', type: 'calculate' },
            { key: 'circle_perimeter', type: 'calculate' },
            { key: 'semicircle_area', type: 'calculate' },
            { key: 'semicircle_perimeter', type: 'calculate' },
            { key: 'area_quarter', type: 'calculate' },
            { key: 'perimeter_quarter', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const r = MathUtils.randomInt(4, 12);
        const d = 2 * r;
        const pi = 3.14;

        // --- FULL CIRCLE AREA ---
        if (v === 'circle_area') {
            const isDiameter = Math.random() < 0.5;
            const ans = Math.round((pi * r * r) * 100) / 100;
            
            const sharedClues = [
                {
                    text: lang === 'sv' ? "Arean för en cirkel räknar vi ut genom att ta: radien gånger radien gånger 3,14 (pi)." : "We find the area of a circle by taking: radius times radius times 3.14 (pi).",
                    latex: `\\text{Area} = \\text{radie} \\cdot \\text{radie} \\cdot 3{,}14`
                }
            ];

            if (isDiameter) {
                sharedClues.push({
                    text: lang === 'sv' ? `Figuren visar hela diametern (${d} cm). Vi måste halvera den först för att hitta radien från mitten ut till kanten.` : `The figure shows the full diameter (${d} cm). We must cut it in half first to establish the radius from the center to the edge.`,
                    latex: `\\text{radie} = \\frac{${d}}{2} = \\mathbf{${r}}`
                });
            }

            sharedClues.push(
                {
                    text: lang === 'sv' ? `Sätt in radien (${r} cm) i uppställningen: Ta ${r} · ${r} · 3,14.` : `Insert the radius value (${r} cm) into our framework layout: Take ${r} · ${r} · 3.14.`,
                    latex: `\\text{Area} = \\mathbf{${r} \\cdot ${r} \\cdot 3{,}14}`
                },
                {
                    text: lang === 'sv' ? `Räkna ut radie-multiplikationen först: ${r} gånger ${r} blir ${r * r}.` : `Calculate the radius multiplication frame first: ${r} times ${r} equals ${r * r}.`,
                    latex: `\\text{Area} = \\mathbf{${r * r}} \\cdot 3{,}14`
                },
                {
                    text: lang === 'sv' ? `Gångra till sist med 3,14 för att beräkna den färdiga ytan.` : `Finally, multiply by 3.14 to calculate the completed inner surface space total.`,
                    latex: `\\text{Area} = \\mathbf{${ans}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                    latex: `${ans}`
                }
            );

            return {
                renderData: {
                    geometry: { type: 'circle', radius: r, labels: isDiameter ? { diameter: d } : { r }, show: isDiameter ? 'diameter' : 'radius' },
                    description: lang === 'sv' ? "Beräkna cirkelns area (använd pi = 3,14). Avrunda svaret till två decimaler." : "Calculate the area of the circle (use pi = 3.14).",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: sharedClues
            };
        }

        // --- FULL CIRCLE PERIMETER (CIRCUMFERENCE) ---
        if (v === 'circle_perimeter') {
            const isDiameter = Math.random() < 0.5;
            const ans = Math.round((pi * d) * 100) / 100;
            
            const sharedClues = [
                {
                    text: lang === 'sv' ? "Omkretsen runt en cirkel kallas för omkretslinjen. Den beräknas som hela diametern tvärsöver gånger 3,14 (pi)." : "The distance around a circle is called the circumference. It is calculated as the full diameter across times 3.14 (pi).",
                    latex: `\\text{Omkrets} = \\text{diameter} \\cdot 3{,}14`
                }
            ];

            if (!isDiameter) {
                sharedClues.push({
                    text: lang === 'sv' ? `Figuren ger oss bara radien (${r} cm). Vi fördubblar den för att hitta hela diametern tvärsöver cirkeln.` : `The figure only provides the single radius line (${r} cm). We double it to find the full diameter across the circle.`,
                    latex: `\\text{diameter} = ${r} \\cdot 2 = \\mathbf{${d}}`
                });
            }

            sharedClues.push(
                {
                    text: lang === 'sv' ? `Gångra nu diametern (${d} cm) med 3,14 för att mäta längden runt om.` : `Now multiply the diameter value (${d} cm) by 3.14 to calculate the outer length around the loop.`,
                    latex: `\\text{Omkrets} = \\mathbf{${d} \\cdot 3{,}14}`
                },
                {
                    text: lang === 'sv' ? "Utför multiplikationen för att fastställa omkretsen." : "Complete the final decimal multiplication to determine the circumference score.",
                    latex: `\\text{Omkrets} = \\mathbf{${ans}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                    latex: `${ans}`
                }
            );

            return {
                renderData: {
                    geometry: { type: 'circle', radius: r, labels: isDiameter ? { diameter: d } : { r }, show: isDiameter ? 'diameter' : 'radius' },
                    description: lang === 'sv' ? "Beräkna cirkelns omkrets (använd pi = 3,14). Avrunda svaret till två decimaler." : "Calculate the circumference of the circle (use pi = 3.14). Round answer to two decimals.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: sharedClues
            };
        }

        if (v === 'semicircle_area') {
            const fullArea = pi * r * r;
            const ans = Math.round((fullArea / 2) * 100) / 100;
            return {
                renderData: {
                    geometry: { type: 'semicircle', radius: r, labels: { r }, show: 'radius' },
                    description: lang === 'sv' ? "Beräkna halvcirkelns area. Avrunda svaret till två decimaler." : "Calculate the area of the semicircle. Round answer to two decimals.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' ? "En halvcirkel är exakt hälften så stor som en hel vanlig cirkel." : "A semicircle is exactly half the size of a standard full circle.",
                        latex: `\\text{Area} = \\frac{\\text{Hela cirkelns area}}{2}`
                    },
                    {
                        text: lang === 'sv' ? `Räkna först ut arean för en hel cirkel med radien ${r} cm: ${r} · ${r} · 3,14.` : `First, calculate the area for a full circle with radius ${r} cm: ${r} · ${r} · 3.14.`,
                        latex: `\\text{Hela cirkelns area} = ${r} \\cdot ${r} \\cdot 3{,}14 = \\mathbf{${fullArea}}`
                    },
                    {
                        text: lang === 'sv' ? `Dela nu hela cirkelns yta (${fullArea}) med 2 eftersom figuren bara är en halva.` : `Now divide the full circle's area (${fullArea}) by 2 since the figure is only one half.`,
                        latex: `\\text{Area} = \\frac{\\mathbf{${fullArea}}}{\\mathbf{2}}`
                    },
                    {
                        text: lang === 'sv' ? "Förenkla divisionen för att få fram golvytan i halvcirkeln." : "Simplify the division to calculate the floor area inside the semicircle.",
                        latex: `\\text{Area} = \\mathbf{${ans}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                        latex: `${ans}`
                    }
                ]
            };
        }

        if (v === 'semicircle_perimeter') {
            const arc = (pi * d) / 2;
            const ans = Math.round((arc + d) * 100) / 100;
            return {
                renderData: {
                    geometry: { type: 'semicircle', radius: r, labels: { diameter: d }, show: 'diameter' },
                    description: lang === 'sv' ? "Beräkna halvcirkelns omkrets. Avrunda svaret till två decimaler." : "Calculate the perimeter of the semicircle. Round answer to two decimals.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' ? "Hela varvet runt en halvcirkel består av två delar: den runda svängda kanten och den platta bottenlinjen." : "The whole path around a semicircle consists of two sections: the round curved edge and the flat baseline.",
                        latex: `\\text{Omkrets} = \\text{runda kanten} + \\text{platta botten}`
                    },
                    {
                        text: lang === 'sv' ? `Räkna först ut den runda kanten (hälften av en hel cirkelomkrets): diametern ${d} gånger 3,14 delat på 2.` : `First, calculate the curved edge (half of a full circle loop): diameter ${d} times 3.14 divided by 2.`,
                        latex: `\\text{runda kanten} = \\frac{${d} \\cdot 3{,}14}{2} = \\mathbf{${arc}}`
                    },
                    {
                        text: lang === 'sv' ? `Plussa nu ihop den runda kanten (${arc} cm) med den platta bottenlinjen (${d} cm) som stänger figuren.` : `Now add the round edge (${arc} cm) and the flat baseline (${d} cm) together to close the shape loop.`,
                        latex: `\\text{Omkrets} = \\mathbf{${arc} + ${d}}`
                    },
                    {
                        text: lang === 'sv' ? "Slutför additionen för att bestämma den totala sträckan runt om." : "Complete the final addition to determine the total outer boundary distance.",
                        latex: `\\text{Omkrets} = \\mathbf{${ans}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                        latex: `${ans}`
                    }
                ]
            };
        }

        if (v === 'area_quarter') {
            const fullArea = pi * r * r;
            const ans = Math.round((fullArea / 4) * 100) / 100;
            return {
                renderData: {
                    geometry: { type: 'quarter_circle', radius: r, labels: { r } },
                    description: lang === 'sv' ? "Beräkna kvartscirkelns area. Avrunda svaret till två decimaler." : "Calculate the area of the quarter circle. Round answer to two decimals.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' ? "En kvartscirkel är exakt en fjärdedel (en tårtbit) av en hel vanlig cirkel." : "A quarter circle is exactly one-fourth (a single slice) of a standard full circle.",
                        latex: `\\text{Area} = \\frac{\\text{Hela cirkelns area}}{4}`
                    },
                    {
                        text: lang === 'sv' ? `Räkna ut ytan för hela cirkeln först med radien ${r} cm: ${r} · ${r} · 3,14.` : `Calculate the surface area for the full circle first using radius ${r} cm: ${r} · ${r} · 3.14.`,
                        latex: `\\text{Hela cirkelns area} = ${r} \\cdot ${r} \\cdot 3{,}14 = \\mathbf{${fullArea}}`
                    },
                    {
                        text: lang === 'sv' ? `Dela hela cirkelytan (${fullArea}) med 4 eftersom figuren bara är en fjärdedels tårtbit.` : `Divide the full circle area (${fullArea}) by 4 since the figure is only a one-fourth cake slice.`,
                        latex: `\\text{Area} = \\frac{\\mathbf{${fullArea}}}{\\mathbf{4}}`
                    },
                    {
                        text: lang === 'sv' ? "Utför divisionen för att bestämma kvartscirkelns färdiga yta." : "Execute the division step to determine the quarter circle's completed area.",
                        latex: `\\text{Area} = \\mathbf{${ans}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                        latex: `${ans}`
                    }
                ]
            };
        }

        if (v === 'perimeter_quarter') {
            const arc = (pi * d) / 4;
            const ans = Math.round((arc + r + r) * 100) / 100;
            return {
                renderData: {
                    geometry: { type: 'quarter_circle', radius: r, labels: { r } },
                    description: lang === 'sv' ? "Beräkna kvartscirkelns omkrets. Avrunda svaret till två decimaler." : "Calculate the perimeter of the quarter circle. Round answer to two decimals.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' ? "Kvartscirkelns omkrets består av tre delar: den runda svängda tårtkanten och de två raka sidoväggarna (radierna) som möts i mitten." : "The perimeter of a quarter circle consists of three parts: the round curved crust edge and the two straight side walls (radii) meeting in the corner.",
                        latex: `\\text{Omkrets} = \\text{runda kanten} + \\text{rak vägg}_1 + \\text{rak vägg}_2`
                    },
                    {
                        text: lang === 'sv' ? `Räkna först ut den runda kanten (en fjärdedel av ett helt cirkelvarv): diametern ${d} gånger 3,14 delat på 4.` : `First, calculate the curved crust edge (one-fourth of a full circle loop): diameter ${d} times 3.14 divided by 4.`,
                        latex: `\\text{runda kanten} = \\frac{${d} \\cdot 3{,}14}{4} = \\mathbf{${arc}}`
                    },
                    {
                        text: lang === 'sv' ? `Plussa ihop den runda kanten (${arc} cm) med de två raka väggarna som båda är lika långa som radien (${r} cm).` : `Add the round edge (${arc} cm) and the two straight inner walls that are both equal to the radius length (${r} cm).`,
                        latex: `\\text{Omkrets} = \\mathbf{${arc} + ${r} + ${r}}`
                    },
                    {
                        text: lang === 'sv' ? "Räkna ut hela summan för att hitta den totala sträckan runt om tårtbiten." : "Calculate the final sum to find the complete boundary path loop around the wedge slice.",
                        latex: `\\text{Omkrets} = \\mathbf{${ans}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                        latex: `${ans}`
                    }
                ]
            };
        }

        return this.level1_PerimeterBasic(lang); // fallback
    }

    // Composite shapes (has the geometry wrapper needed to render visuals in frontend)
    private generateCompositeShape(lang: string, isAdvancedLevel: boolean, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = isAdvancedLevel 
            ? [
                { key: 'area_house', type: 'calculate' },
                { key: 'area_portal', type: 'calculate' }
              ]
            : [
                { key: 'combined_l_shape', type: 'calculate' },
                { key: 'combined_rect_tri', type: 'calculate' }
              ];
              
        const v = variationKey || this.getVariation(pool, options);

        let description = "";
        let ans = 0;
        let subtype = "";
        let labelsObj: Record<string, number> = {};
        let clues: any[] = [];
        let rawW = 10;
        let rawH = 10;

        // A. Handle L-Shape Configuration
        if (v === 'combined_l_shape') {
            const vW = MathUtils.randomInt(3, 5), vH = MathUtils.randomInt(8, 12);
            const hW = MathUtils.randomInt(4, 7), hH = MathUtils.randomInt(3, 5);
            rawW = vW + hW;
            rawH = Math.max(vH, hH);
            ans = (vW * vH) + (hW * hH);
            subtype = "l_shape";
            labelsObj = { vW, vH, hW, hH, totalW: rawW };
            description = lang === 'sv' 
                ? "Beräkna arean av den sammansatta figuren." 
                : "Calculate the area of the composite figure.";
                
            clues = [
                {
                    text: lang === 'sv' ? "Vi beräknar ytan lättast genom att dela upp hela figuren i två vanliga rektanglar." : "We calculate the surface easiest by breaking the entire figure into two standard rectangles.",
                    latex: `\\text{Total Area} = \\text{Area}_{\\text{figur 1}} + \\text{Area}_{\\text{figur 2}}`
                },
                {
                    text: lang === 'sv' ? `Räkna ut ytan för den stående rektangeln till vänster: ${vW} gånger ${vH} blir ${vW * vH}.` : `Calculate the surface space of the vertical rectangle on the left: ${vW} times ${vH} equals ${vW * vH}.`,
                    latex: `\\text{Total Area} = \\mathbf{(${vW} \\cdot ${vH})} + \\text{Area}_{\\text{figur 2}} \\rightarrow \\mathbf{${vW * vH}} + \\text{Area}_{\\text{figur 2}}`
                },
                {
                    text: lang === 'sv' ? `Räkna ut ytan för den liggande rektangeln till höger: ${hW} gånger ${hH} blir ${hW * hH}.` : `Calculate the surface space of the horizontal rectangle on the right: ${hW} times ${hH} equals ${hW * hH}.`,
                    latex: `\\text{Total Area} = ${vW * vH} + \\mathbf{(${hW} \\cdot ${hH})} \\rightarrow ${vW * vH} + \\mathbf{${hW * hH}}`
                },
                {
                    text: lang === 'sv' ? `Plussa ihop de två uträknade delarna för att bestämma den totala sammanlagda ytan.` : `Add the two calculated parts together to determine the total combined internal surface area.`,
                    latex: `\\text{Total Area} = \\mathbf{${vW * vH} + ${hW * hH}} = \\mathbf{${ans}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                    latex: `${ans}`
                }
            ];
        } 
        // B. Handle Rectangle + Right-Angled Triangle Configuration
        else if (v === 'combined_rect_tri') {
            const rw = MathUtils.randomInt(6, 12), rh = MathUtils.randomInt(4, 8), tb = MathUtils.randomInt(3, 6);
            rawW = rw;
            rawH = rh;
            ans = (rw * rh) + ((tb * rh) / 2);
            subtype = "rect_right_tri";
            labelsObj = { w: rw, h: rh, tri_b: tb };
            description = lang === 'sv' 
                ? "Figuren består av en rektangel och en triangel. Vad är totalarean?" 
                : "The figure consists of a rectangle and a triangle. What is the total area?";
                
            clues = [
                {
                    text: lang === 'sv' ? "Dela upp uppgiften genom att räkna ut rektangelns yta och triangelns yta var för sig." : "Split the task by calculating the area of the rectangle and the area of the triangle separately.",
                    latex: `\\text{Total Area} = \\text{Area}_{\\text{rektangel}} + \\text{Area}_{\\text{triangel}}`
                },
                {
                    text: lang === 'sv' ? `Steg 1: Beräkna den fyrkantiga rektangelns yta: basen ${rw} gånger höjden ${rh}.` : `Step 1: Calculate the square rectangle's surface: base ${rw} times height ${rh}.`,
                    latex: `\\text{Total Area} = \\mathbf{(${rw} \\cdot ${rh})} + \\text{Area}_{\\text{triangel}} \\rightarrow \\mathbf{${rw * rh}} + \\text{Area}_{\\text{triangel}}`
                },
                {
                    text: lang === 'sv' ? `Steg 2: Beräkna triangelns yta bredvid: basen ${tb} gånger höjden ${rh}, och dela sedan med 2.` : `Step 2: Calculate the triangle's surface next to it: base ${tb} times height ${rh}, then divide by 2.`,
                    latex: `\\text{Total Area} = ${rw * rh} + \\mathbf{\\frac{${tb} \\cdot ${rh}}{2}} \\rightarrow ${rw * rh} + \\mathbf{${(tb * rh) / 2}}`
                },
                {
                    text: lang === 'sv' ? "Plussa samman de två uträknade bitarna för att hitta det slutgiltiga svaret." : "Add those two calculated surface components together to find the final unified answer.",
                    latex: `\\text{Total Area} = \\mathbf{${rw * rh} + ${(tb * rh) / 2}} = \\mathbf{${ans}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                    latex: `${ans}`
                }
            ];
        } 
        // C. Handle House Configuration
        else if (v === 'area_house') {
            const rw = MathUtils.randomInt(40, 60), rh = MathUtils.randomInt(30, 45), hr = MathUtils.randomInt(20, 30);
            rawW = rw;
            rawH = rh;
            ans = (rw * rh) + ((rw * hr) / 2);
            subtype = "house";
            labelsObj = { w: rw, h: rh, h_roof: hr };
            description = lang === 'sv' ? "Beräkna husets totala area." : "Calculate the total area of the house.";
            
            clues = [
                {
                    text: lang === 'sv' ? "Dela upp huset i två välkända bitar: en rektangel (väggarna nertill) och en triangel (taket upptill)." : "Divide the house into two well-known sections: a rectangle (the walls below) and a triangle (the roof on top).",
                    latex: `\\text{Total Area} = \\text{Area}_{\\text{väggar}} + \\text{Area}_{\\text{tak}}`
                },
                {
                    text: lang === 'sv' ? `Räkna ut väggytan nertill: bredden ${rw} gånger höjden ${rh}.` : `Compute the wall surface below: width ${rw} times height ${rh}.`,
                    latex: `\\text{Total Area} = \\mathbf{(${rw} \\cdot ${rh})} + \\text{Area}_{\\text{tak}} \\rightarrow \\mathbf{${rw * rh}} + \\text{Area}_{\\text{tak}}`
                },
                {
                    text: lang === 'sv' ? `Räkna ut takytan upptill: basen ${rw} gånger takhöjden ${hr}, delat med 2.` : `Compute the roof surface on top: base width ${rw} times roof height ${hr}, divided by 2.`,
                    latex: `\\text{Total Area} = ${rw * rh} + \\mathbf{\\frac{${rw} \\cdot ${hr}}{2}} \\rightarrow ${rw * rh} + \\mathbf{${(rw * hr) / 2}}`
                },
                {
                    text: lang === 'sv' ? "Lägg ihop de två uträknade delområdena för att få husets totala area." : "Combine those two calculated component spaces to establish the house's total area profile.",
                    latex: `\\text{Total Area} = \\mathbf{${rw * rh} + ${(rw * hr) / 2}} = \\mathbf{${ans}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                    latex: `${ans}`
                }
            ];
        } else if (v === 'perimeter_house') {
            const rw = MathUtils.randomInt(6, 12);
            const rh = MathUtils.randomInt(5, 10);
            const roof_slant = MathUtils.randomInt(4, 8);
            
            if (roof_slant * 2 <= rw) {
                return this.generateCompositeShape(lang, isAdvancedLevel, v, options);
            }

            ans = rw + (2 * rh) + (2 * roof_slant);
            subtype = "house_perimeter";
            labelsObj = { w: rw, h: rh, s: roof_slant };
            
            description = lang === 'sv'
                ? "Beräkna husets omkrets."
                : "Calculate the perimeter of the house.";
                
            clues = [
                {
                    text: lang === 'sv' ? "Omkretsen betyder hela varvet runt husets yttre kanter. Vi räknar inte med några streck på insidan!" : "The perimeter means the entire path around the house's outer edges. We do not count any lines on the inside!",
                    latex: `\\text{Omkrets} = \\text{bas} + 2 \\cdot \\text{vägg} + 2 \\cdot \\text{taksida}`
                },
                {
                    text: lang === 'sv' ? `Plussa ihop alla de yttre begränsningslinjerna: marken (${rw} cm), två väggar (${rh} cm var) och två snett lutande taksidor (${roof_slant} cm var).` : `Add up all the outer boundary lines: the ground (${rw} cm), two walls (${rh} cm each), and two slanted roof lines (${roof_slant} cm each).`,
                    latex: `\\text{Omkrets} = \\mathbf{${rw} + ${rh} + ${rh} + ${roof_slant} + ${roof_slant}}`
                },
                {
                    text: lang === 'sv' ? "Förenkla hela additionskedjan för att räkna fram totalsumman." : "Simplify the whole addition chain layout row to evaluate the total perimeter score.",
                    latex: `\\text{Omkrets} = \\mathbf{${ans}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ans} cm` : `Answer: ${ans} cm`,
                    latex: `${ans}`
                }
            ];
        } else if (v === 'perimeter_portal') {
            const rw = MathUtils.randomInt(6, 14) * 2;
            const rh = MathUtils.randomInt(5, 12);
            const r = rw / 2;
            const arcLength = Math.round(3.14 * r);
            
            ans = arcLength + rw + (2 * rh);
            subtype = "portal_perimeter";
            labelsObj = { w: rw, h: rh, arc: arcLength };
            
            description = lang === 'sv'
                ? "Beräkna portalens totala omkrets (runt ytterkanterna)."
                : "Calculate the total perimeter of the portal (around the outer edges).";
                
            clues = [
                {
                    text: lang === 'sv' ? "Omkretsen runt portalen består av den platta basen nertill, två stående sidoväggar och den svängda runda bågen överst." : "The perimeter around the portal consists of the flat baseline below, two vertical side walls, and the curved round arc on top.",
                    latex: `\\text{Omkrets} = \\text{bas} + 2 \\cdot \\text{sidovägg} + \\text{båglängd}`
                },
                {
                    text: lang === 'sv' ? `Räkna ut bågsträckan överst (en halv cirkelomkrets): 3,14 gånger radien ${r} cm ger ungefär ${arcLength} cm.` : `Compute the top arc track (half a circle loop): 3.14 times the radius ${r} cm yields approximately ${arcLength} cm.`,
                    latex: `\\text{båglängd} = 3{,}14 \\cdot ${r} = \\mathbf{${arcLength}}`
                },
                {
                    text: lang === 'sv' ? `Addera nu alla portalens ytterkanter tillsammans på raden: ${rw} + ${rh} + ${rh} + ${arcLength}.` : `Now add all the portal's outer edges together on the line: ${rw} + ${rh} + ${rh} + ${arcLength}.`,
                    latex: `\\text{Omkrets} = \\mathbf{${rw} + ${rh} + ${rh} + ${arcLength}}`
                },
                {
                    text: lang === 'sv' ? "Förenkla additionsraden för att beräkna slutgiltig omkrets." : "Simplify the addition row to calculate the final total loop distance.",
                    latex: `\\text{Omkrets} = \\mathbf{${ans}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ans} cm` : `Answer: ${ans} cm`,
                    latex: `${ans}`
                }
            ];
        } else {
            const rw = MathUtils.randomInt(20, 30) * 2; 
            const rh = MathUtils.randomInt(30, 45);
            const r = rw / 2;
            const rectA = rw * rh;
            const semiA = (3.14 * r * r) / 2;
            rawW = rw;
            rawH = rh;
            ans = Math.round((rectA + semiA) * 10) / 10;
            subtype = "portal";
            labelsObj = { w: rw, h: rh };
            description = lang === 'sv' ? "Beräkna figurens totala area." : "Calculate the total area of the figure.";
            
            clues = [
                {
                    text: lang === 'sv' ? "Figuren är sammansatt av en vanlig rektangel nertill och en rund halvcirkel på toppen." : "The figure is composed of a standard rectangle at the bottom and a round semicircle on top.",
                    latex: `\\text{Total Area} = \\text{Area}_{\\text{rektangel}} + \\text{Area}_{\\text{halvcirkel}}`
                },
                {
                    text: lang === 'sv' ? `Steg 1: Beräkna rektangelns yta nertill genom att ta bredden ${rw} gånger höjden ${rh}.` : `Step 1: Calculate the rectangle surface below by taking width ${rw} times height ${rh}.`,
                    latex: `\\text{Total Area} = \\mathbf{(${rw} \\cdot ${rh})} + \\text{Area}_{\\text{halvcirkel}} \\rightarrow \\mathbf{${rectA}} + \\text{Area}_{\\text{halvcirkel}}`
                },
                {
                    text: lang === 'sv' ? `Steg 2: Beräkna halvcirkelytan på toppen: radien gånger radien gånger 3,14, och dela sedan med 2.` : `Step 2: Calculate the semicircle surface on top: radius times radius times 3.14, then divide by 2.`,
                    latex: `\\text{Total Area} = ${rectA} + \\mathbf{\\frac{3{,}14 \\cdot ${r} \\cdot ${r}}{2}} \\rightarrow ${rectA} + \\mathbf{${semiA}}`
                },
                {
                    text: lang === 'sv' ? "Summera de två uträknade områdesytorna för att bestämma det totala slutresultatet." : "Sum those two calculated space regions together to determine the total final result score balance.",
                    latex: `\\text{Total Area} = \\mathbf{${rectA} + ${semiA}} = \\mathbf{${ans}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                    latex: `${ans}`
                }
            ];
        }

        return {
            renderData: {
                geometry: {
                    type: "composite",
                    subtype: subtype,       
                    width: rawW,
                    height: rawH,
                    dims: { subtype: subtype, width: rawW, height: rawH },
                    labels: labelsObj
                },
                type: "composite",
                subtype: subtype,
                width: rawW,
                height: rawH,
                dims: { subtype: subtype, width: rawW, height: rawH },
                labels: labelsObj,
                description: description,
                answerType: "numeric",
                suffix: "cm²"
            },
            token: this.toBase64(ans.toString()),
            variationKey: v,
            type: "calculate",
            clues: clues
        };
    }

    // REDIRECTIVE INTERFACES KEEP LEGACY ROUTERS WORKING OUT OF THE BOX ---
    private level4_CombinedFigures(lang: string, variationKey?: string, options: any = {}): any {
        return this.generateCompositeShape(lang, false, variationKey, options);
    }

    private level6_CompositeAdvanced(lang: string, variationKey?: string, options: any = {}): any {
        return this.generateCompositeShape(lang, true, variationKey, options);
    }

}