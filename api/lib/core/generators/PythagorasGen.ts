// src/lib/generators/PythagorasGen.ts
import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class PythagorasGen {
    private PYTH_TRIPLES = [
        [3, 4, 5],
        [6, 8, 10],
        [5, 12, 13],
        [9, 12, 15],
        [8, 15, 17],
        [7, 24, 25],
        [10, 24, 26],
        [12, 16, 20]
    ];

    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        switch (level) {
            case 1:
                questionData = this.level1_Concepts(lang, undefined, options);
                break;
            case 2:
                questionData = this.level2_Hypotenuse(lang, undefined, options);
                break;
            case 3:
                questionData = this.level3_Leg(lang, undefined, options);
                break;
            case 4:
                questionData = this.level4_Converse(lang, undefined, options);
                break;
            case 5:
                questionData = this.level5_Coordinates(lang, undefined, options);
                break;
            case 6:
                questionData = this.level6_Composite3D(lang, undefined, options);
                break;
            default:
                questionData = this.level2_Hypotenuse(lang, undefined, options);
                break;
        }

        // Decorator pipeline for interceptor and hints
        enrichQuestionMetadata(questionData);

        // Word problem eligibility flag for PracticeView
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [2, 3, 5, 6];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js exactly.
     */
    public generateByVariation(key: string, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        switch (key) {
            case 'pyth_identify_hypotenuse':
            case 'pyth_area_proof':
            case 'pyth_correct_setup':
            case 'pyth_spot_error':
                questionData = this.level1_Concepts(lang, key, options);
                break;

            case 'pyth_hyp_calc':
            case 'pyth_hyp_decimal':
            case 'pyth_hyp_equation_solve':
                questionData = this.level2_Hypotenuse(lang, key, options);
                break;

            case 'pyth_leg_calc':
            case 'pyth_leg_decimal':
            case 'pyth_leg_trap':
                questionData = this.level3_Leg(lang, key, options);
                break;

            case 'pyth_converse_check':
            case 'pyth_carpenter_rule':
            case 'pyth_converse_which_is_right':
                questionData = this.level4_Converse(lang, key, options);
                break;

            case 'pyth_coord_dist_int':
            case 'pyth_coord_dist_dec':
            case 'pyth_coord_find_delta':
                questionData = this.level5_Coordinates(lang, key, options);
                break;

            case 'pyth_isosceles_height':
            case 'pyth_rect_diagonal':
            case 'pyth_3d_box_diagonal':
                questionData = this.level6_Composite3D(lang, key, options);
                break;

            default:
                questionData = this.generate(2, lang, options);
                break;
        }

        return enrichQuestionMetadata(questionData);
    }

    // --- PRIVATE UTILITIES ---
    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private getVariation(pool: { key: string; type: 'concept' | 'calculate' }[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }

        const isWP = options?.wordProblem === 'true' || options?.wordProblem === true;
        if (isWP) {
            const unsafeKeys = [
                'pyth_identify_hypotenuse',
                'pyth_area_proof',
                'pyth_correct_setup',
                'pyth_spot_error',
                'pyth_hyp_equation_solve',
                'pyth_leg_trap',
                'pyth_converse_check',
                'pyth_carpenter_rule',
                'pyth_converse_which_is_right',
                'pyth_coord_find_delta',
                'pyth_3d_box_diagonal'
            ];
            filtered = filtered.filter(v => !unsafeKeys.includes(v.key));
        }

        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    private formatNum(num: number, lang: string): string {
        const cleanNum = parseFloat(num.toFixed(2));
        return lang === 'sv' ? cleanNum.toString().replace('.', ',') : cleanNum.toString();
    }

    // =========================================================================
    // LEVEL 1: BEGREPP & UPPSTÄLLNING (Concepts & Proofs)
    // =========================================================================
    private level1_Concepts(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'pyth_identify_hypotenuse', type: 'concept' },
            { key: 'pyth_area_proof', type: 'calculate' },
            { key: 'pyth_correct_setup', type: 'concept' },
            { key: 'pyth_spot_error', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'pyth_identify_hypotenuse') {
            const letters = ['A', 'B', 'C'];
            const hypLetter = 'C'; // The hypotenuse is always C

            // Randomize whether leg A is height and B is base, or vice versa
            const swapLegs = Math.random() > 0.5;
            const legVertical = swapLegs ? 'B' : 'A';
            const legHorizontal = swapLegs ? 'A' : 'B';

            const desc = lang === 'sv' 
                ? "Vilken sida är hypotenusan i triangeln?" 
                : "Which side is the hypotenuse in the triangle?";

            return {
                renderData: {
                    description: desc,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(letters.map(l => `Sida ${l}`)),
                    geometry: {
                        type: 'triangle',
                        subtype: 'right',
                        dims: { w: 120, h: 80 },
                        labels: {
                            h: legVertical,      // Vertical leg (A or B)
                            b: legHorizontal,    // Horizontal leg (B or A)
                            hyp: 'C'             // Always strictly on the hypotenuse
                        }
                    }
                },
                token: this.toBase64(`Sida ${hypLetter}`),
                variationKey: v,
                type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "Hypotenusan är alltid den längsta sidan i en rätvinklig triangel." 
                            : "The hypotenuse is always the longest side in a right triangle." 
                    },
                    { 
                        text: lang === 'sv' 
                            ? "Hypotenusan ligger alltid mittemot den räta vinkeln (90°)." 
                            : "The hypotenuse is always opposite the right angle (90°)." 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `I figuren står sidan C mittemot den räta vinkeln.` 
                            : `In the diagram, side C is opposite the right angle.` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: Sida ${hypLetter}` : `Answer: Side ${hypLetter}` 
                    }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        if (v === 'pyth_area_proof') {
            const triple = MathUtils.randomChoice([[3, 4, 5], [6, 8, 10], [5, 12, 13]]);
            const areaA = triple[0] ** 2; // e.g., 9
            const areaB = triple[1] ** 2; // e.g., 16
            const areaC = triple[2] ** 2; // e.g., 25

            // 70% chance to ask for Hypotenuse Square C, 30% for Leg Square A/B
            const askHypotenuse = Math.random() < 0.7;

            const targetAns = askHypotenuse ? areaC : areaA;
            const labelA = askHypotenuse ? `${areaA}` : `?`;
            const labelB = `${areaB}`;
            const labelC = askHypotenuse ? `?` : `${areaC}`;

            const desc = lang === 'sv'
                ? "Vad är arean på den markerade kvadraten (?)"
                : "What is the area of the marked square (?)";

            return {
                renderData: {
                    description: desc,
                    answerType: 'numeric',
                    geometry: {
                        type: 'pythagoras_proof',
                        labels: {
                            areaA: labelA,
                            areaB: labelB,
                            areaC: labelC
                        }
                    }
                },
                token: this.toBase64(targetAns.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "Pythagoras sats visar att de två små kvadraternas ytor tillsammans är lika med den stora kvadratens yta." 
                            : "Pythagoras theorem shows that the two smaller square areas together equal the largest square's area.", 
                        latex: `\\text{Kvadrat}_A + \\text{Kvadrat}_B = \\text{Kvadrat}_C` 
                    },
                    askHypotenuse ? {
                        text: lang === 'sv'
                            ? `Addera kateternas kvadrater: ${areaA} + ${areaB}`
                            : `Add the two leg squares: ${areaA} + ${areaB}`,
                        latex: `${areaA} + ${areaB} = \\mathbf{${targetAns}}`
                    } : {
                        text: lang === 'sv'
                            ? `Subtrahera den lilla kvadraten från den stora: ${areaC} - ${areaB}`
                            : `Subtract the smaller square from the large square: ${areaC} - ${areaB}`,
                        latex: `${areaC} - ${areaB} = \\mathbf{${targetAns}}`
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${targetAns}` : `Answer: ${targetAns}`, 
                        latex: `${targetAns}` 
                    }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        // pyth_correct_setup / pyth_spot_error
        const [a, b, c] = MathUtils.randomChoice(this.PYTH_TRIPLES);
        const correct = `${a}^2 + ${b}^2 = c^2`;
        const lie1 = `${a}^2 + c^2 = ${b}^2`;
        const lie2 = `${a} + ${b} = c`;
        const lie3 = `c^2 + ${b}^2 = ${a}^2`;

        return {
            renderData: {
                description: lang === 'sv' ? `Vilken uppställning visar Pythagoras sats för kateterna ${a} och ${b} samt hypotenusan c?` : `Which equation shows Pythagoras theorem for legs ${a} and ${b} and hypotenuse c?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([`$${correct}$`, `$${lie1}$`, `$${lie2}$`, `$${lie3}$`])
            },
            token: this.toBase64(`$${correct}$`),
            variationKey: v,
            type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Regeln är katet² + katet² = hypotenusa²." : "The formula is leg² + leg² = hypotenuse².", latex: `a^2 + b^2 = c^2` },
                { text: lang === 'sv' ? "Hypotenusan c måste alltid stå ensam i ena ledet." : "The hypotenuse c must always stand isolated on one side." },
                { text: lang === 'sv' ? `Svar: $${correct}$` : `Answer: $${correct}$`, latex: correct }
            ],
            metadata: { variation_key: v, difficulty: 1 }
        };
    }

    // =========================================================================
    // LEVEL 2: BERÄKNA HYPOTENUSAN (c = √(a² + b²))
    // =========================================================================
    private level2_Hypotenuse(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'pyth_hyp_calc', type: 'calculate' },
            { key: 'pyth_hyp_decimal', type: 'calculate' },
            { key: 'pyth_hyp_equation_solve', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'pyth_hyp_calc') {
            const [a, b, c] = MathUtils.randomChoice(this.PYTH_TRIPLES);
            const token = `${a};${b};${c}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna hypotenusans längd c." : "Calculate the hypotenuse length c.",
                    interceptorToken: token,
                    answerType: 'numeric',
                    geometry: {
                        type: 'triangle',
                        subtype: 'right',
                        dims: { w: b * 10, h: a * 10 },
                        labels: { b: `${b}`, h: `${a}`, hyp: 'c' }
                    }
                },
                token: this.toBase64(c.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Ställ upp formeln: c² = a² + b²` : `Set up the formula: c² = a² + b²`, latex: `c^2 = ${a}^2 + ${b}^2` },
                    { text: lang === 'sv' ? `Kvadrera och addera kateterna: ${a ** 2} + ${b ** 2} = ${c ** 2}` : `Square and sum the legs: ${a ** 2} + ${b ** 2} = ${c ** 2}`, latex: `c^2 = \\mathbf{${c ** 2}}` },
                    { text: lang === 'sv' ? `Dra kvadratroten ur ${c ** 2} för att bestämma c:` : `Take the square root of ${c ** 2} to find c:`, latex: `c = \\sqrt{${c ** 2}} = \\mathbf{${c}}` },
                    { text: lang === 'sv' ? `Svar: ${c}` : `Answer: ${c}`, latex: `${c}` }
                ],
                metadata: { variation_key: v, difficulty: 2 }
            };
        }

        if (v === 'pyth_hyp_decimal') {
            let a = MathUtils.randomInt(3, 9);
            let b = MathUtils.randomInt(4, 11);
            while (Number.isInteger(Math.sqrt(a ** 2 + b ** 2))) {
                b = MathUtils.randomInt(4, 11);
            }
            const cVal = Math.sqrt(a ** 2 + b ** 2);
            const cRounded = parseFloat(cVal.toFixed(1));
            const cStr = this.formatNum(cRounded, lang);
            const token = `${a};${b};${cRounded}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna hypotenusan och avrunda till en decimal." : "Calculate the hypotenuse and round to 1 decimal place.",
                    interceptorToken: token,
                    answerType: 'numeric',
                    geometry: {
                        type: 'triangle',
                        subtype: 'right',
                        dims: { w: b * 10, h: a * 10 },
                        labels: { b: `${b}`, h: `${a}`, hyp: 'c' }
                    }
                },
                token: this.toBase64(cStr),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `c² = ${a}² + ${b}² = ${a ** 2} + ${b ** 2}` : `c² = ${a}² + ${b}² = ${a ** 2} + ${b ** 2}`, latex: `c^2 = ${a ** 2 + b ** 2}` },
                    { text: lang === 'sv' ? `Dra kvadratroten ur ${a ** 2 + b ** 2} och avrunda till 1 decimal:` : `Take square root of ${a ** 2 + b ** 2} and round to 1 decimal:`, latex: `c = \\sqrt{${a ** 2 + b ** 2}} \\approx \\mathbf{${cStr}}` },
                    { text: lang === 'sv' ? `Svar: ${cStr}` : `Answer: ${cStr}`, latex: `${cStr}` }
                ],
                metadata: { variation_key: v, difficulty: 2 }
            };
        }

        // pyth_hyp_equation_solve
        const [a, b, c] = MathUtils.randomChoice(this.PYTH_TRIPLES);
        const ans = c ** 2;

        return {
            renderData: {
                description: lang === 'sv' ? `En rätvinklig triangel har kateterna ${a} och ${b}. Vad är värdet på c²?` : `A right triangle has legs ${a} and ${b}. What is the value of c²?`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Kvadrera kateterna: ${a}² = ${a ** 2} och ${b}² = ${b ** 2}` : `Square the legs: ${a}² = ${a ** 2} and ${b}² = ${b ** 2}`, latex: `c^2 = ${a ** 2} + ${b ** 2}` },
                { text: lang === 'sv' ? `Addera värdena:` : `Sum the values:`, latex: `c^2 = \\mathbf{${ans}}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, latex: `${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // =========================================================================
    // LEVEL 3: BERÄKNA KATETEN (a = √(c² - b²))
    // =========================================================================
    private level3_Leg(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'pyth_leg_calc', type: 'calculate' },
            { key: 'pyth_leg_decimal', type: 'calculate' },
            { key: 'pyth_leg_trap', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'pyth_leg_calc') {
            const [a, b, c] = MathUtils.randomChoice(this.PYTH_TRIPLES);
            const token = `${a};${b};${c}`;

            return {
                renderData: {
                    description: lang === 'sv' ? `Hypotenusan är ${c} och den ena kateten är ${b}. Beräkna kateten a.` : `The hypotenuse is ${c} and one leg is ${b}. Calculate leg a.`,
                    interceptorToken: token,
                    answerType: 'numeric',
                    geometry: {
                        type: 'triangle',
                        subtype: 'right',
                        dims: { w: b * 10, h: a * 10 },
                        labels: { b: `${b}`, h: 'a', hyp: `${c}` }
                    }
                },
                token: this.toBase64(a.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Eftersom hypotenusan är känd subtraherar vi: a² = c² - b²" : "Since the hypotenuse is known, subtract: a² = c² - b²", latex: `a^2 = ${c}^2 - ${b}^2` },
                    { text: lang === 'sv' ? `Räkna ut differensen: ${c ** 2} - ${b ** 2} = ${a ** 2}` : `Calculate the difference: ${c ** 2} - ${b ** 2} = ${a ** 2}`, latex: `a^2 = \\mathbf{${a ** 2}}` },
                    { text: lang === 'sv' ? `Dra roten ur:` : `Take the square root:`, latex: `a = \\sqrt{${a ** 2}} = \\mathbf{${a}}` },
                    { text: lang === 'sv' ? `Svar: ${a}` : `Answer: ${a}`, latex: `${a}` }
                ],
                metadata: { variation_key: v, difficulty: 3 }
            };
        }

        if (v === 'pyth_leg_decimal') {
            const c = MathUtils.randomInt(8, 15);
            let b = MathUtils.randomInt(4, c - 2);
            while (Number.isInteger(Math.sqrt(c ** 2 - b ** 2))) {
                b = MathUtils.randomInt(4, c - 2);
            }
            const aVal = Math.sqrt(c ** 2 - b ** 2);
            const aRounded = parseFloat(aVal.toFixed(1));
            const aStr = this.formatNum(aRounded, lang);
            const token = `${aRounded};${b};${c}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna den saknade kateten och avrunda till en decimal." : "Calculate the missing leg and round to 1 decimal place.",
                    interceptorToken: token,
                    answerType: 'numeric',
                    geometry: {
                        type: 'triangle',
                        subtype: 'right',
                        dims: { w: b * 10, h: aRounded * 10 },
                        labels: { b: `${b}`, h: 'a', hyp: `${c}` }
                    }
                },
                token: this.toBase64(aStr),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `a² = ${c}² - ${b}² = ${c ** 2} - ${b ** 2}` : `a² = ${c}² - ${b}² = ${c ** 2} - ${b ** 2}`, latex: `a^2 = ${c ** 2 - b ** 2}` },
                    { text: lang === 'sv' ? `Dra roten ur och avrunda:` : `Take the square root and round:`, latex: `a = \\sqrt{${c ** 2 - b ** 2}} \\approx \\mathbf{${aStr}}` },
                    { text: lang === 'sv' ? `Svar: ${aStr}` : `Answer: ${aStr}`, latex: `${aStr}` }
                ],
                metadata: { variation_key: v, difficulty: 3 }
            };
        }

        // pyth_leg_trap
        const [a, b, c] = MathUtils.randomChoice(this.PYTH_TRIPLES);
        const correct = `a^2 = ${c}^2 - ${b}^2`;
        const lie1 = `a^2 = ${c}^2 + ${b}^2`;
        const lie2 = `a = ${c} - ${b}`;

        return {
            renderData: {
                description: lang === 'sv' ? `Du vet hypotenusan (${c}) och kateten (${b}). Vilket samband löser ut kateten a?` : `You know hypotenuse (${c}) and leg (${b}). Which equation solves for leg a?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([`$${correct}$`, `$${lie1}$`, `$${lie2}$`])
            },
            token: this.toBase64(`$${correct}$`),
            variationKey: v,
            type: 'concept',
            clues: [
                { text: lang === 'sv' ? "För att hitta en katet måste vi subtrahera den kända katetens kvadrat från hypotenusans kvadrat." : "To find a leg, subtract the known leg square from the hypotenuse square." },
                { text: lang === 'sv' ? `Samband: $a^2 = c^2 - b^2$` : `Formula: $a^2 = c^2 - b^2$`, latex: correct },
                { text: lang === 'sv' ? `Svar: $${correct}$` : `Answer: $${correct}$`, latex: correct }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // =========================================================================
    // LEVEL 4: OMVÄNDA SATSEN (The Converse)
    // =========================================================================
    private level4_Converse(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'pyth_converse_check', type: 'concept' },
            { key: 'pyth_carpenter_rule', type: 'calculate' },
            { key: 'pyth_converse_which_is_right', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'pyth_converse_check') {
            const isRight = Math.random() > 0.5;
            let a: number, b: number, c: number;
            if (isRight) {
                [a, b, c] = MathUtils.randomChoice(this.PYTH_TRIPLES);
            } else {
                const triple = MathUtils.randomChoice(this.PYTH_TRIPLES);
                a = triple[0];
                b = triple[1];
                c = triple[2] + (Math.random() > 0.5 ? 1 : -1);
            }
            const ansText = isRight ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");

            return {
                renderData: {
                    description: lang === 'sv' ? `En triangel har sidorna ${a} cm, ${b} cm och ${c} cm. Är den rätvinklig?` : `A triangle has sides ${a} cm, ${b} cm, and ${c} cm. Is it right-angled?`,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"],
                    geometry: {
                        type: 'triangle',
                        subtype: isRight ? 'right' : 'scalene',
                        dims: { w: b * 10, h: a * 10 },
                        labels: { s1: `${a}`, s2: `${c}`, b: `${b}` }
                    }
                },
                token: this.toBase64(ansText),
                variationKey: v,
                type: 'concept',
                clues: [
                    { text: lang === 'sv' ? `Kontrollera om a² + b² är lika med c²:` : `Check if a² + b² equals c²:`, latex: `${a}^2 + ${b}^2 = ${a ** 2 + b ** 2}` },
                    { text: lang === 'sv' ? `Kolla hypotenusans kvadrat: ${c}² = ${c ** 2}` : `Check hypotenuse square: ${c}² = ${c ** 2}`, latex: `c^2 = ${c ** 2}` },
                    { text: isRight ? (lang === 'sv' ? "Eftersom likheten stämmer är triangeln rätvinklig." : "Since the equality holds, the triangle is right-angled.") : (lang === 'sv' ? "Eftersom likheten INTE stämmer är triangeln inte rätvinklig." : "Since the equality does NOT hold, the triangle is not right-angled.") },
                    { text: lang === 'sv' ? `Svar: ${ansText}` : `Answer: ${ansText}` }
                ],
                metadata: { variation_key: v, difficulty: 3 }
            };
        }

        if (v === 'pyth_carpenter_rule') {
            const mult = MathUtils.randomInt(2, 6);
            const a = 3 * mult;
            const b = 4 * mult;
            const c = 5 * mult;

            return {
                renderData: {
                    description: lang === 'sv' ? `En snickare mäter upp kateterna ${a} cm och ${b} cm i ett hörn. Hur lång måste diagonalen vara för att vinkeln ska vara exakt 90°?` : `A carpenter measures legs of ${a} cm and ${b} cm in a corner. How long must the diagonal be to make the angle exactly 90°?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(c.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Detta är snickarens 3-4-5-metod för att säkerställa 90°." : "This is the carpenter's 3-4-5 rule to ensure a 90° angle." },
                    { text: lang === 'sv' ? `c = √(${a}² + ${b}²) = √${c ** 2} = ${c}` : `c = √(${a}² + ${b}²) = √${c ** 2} = ${c}`, latex: `c = \\mathbf{${c}}` },
                    { text: lang === 'sv' ? `Svar: ${c}` : `Answer: ${c}`, latex: `${c}` }
                ],
                metadata: { variation_key: v, difficulty: 3 }
            };
        }

        // pyth_converse_which_is_right
        const [a, b, c] = MathUtils.randomChoice(this.PYTH_TRIPLES);
        return {
            renderData: {
                description: lang === 'sv' ? `Triangeln ABC har sidorna AB = ${a}, BC = ${b} och AC = ${c}. Vilket hörn är den räta vinkeln?` : `Triangle ABC has sides AB = ${a}, BC = ${b}, and AC = ${c}. Which corner has the right angle?`,
                answerType: 'multiple_choice',
                options: ['A', 'B', 'C']
            },
            token: this.toBase64('B'),
            variationKey: v,
            type: 'concept',
            clues: [
                { text: lang === 'sv' ? `Hypotenusan är den längsta sidan, alltså AC (${c}).` : `The hypotenuse is the longest side, which is AC (${c}).` },
                { text: lang === 'sv' ? `Den räta vinkeln står alltid mittemot hypotenusan AC, vilket är hörn B.` : `The right angle is always opposite hypotenuse AC, which is corner B.` },
                { text: lang === 'sv' ? `Svar: B` : `Answer: B` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // =========================================================================
    // LEVEL 5: KOORDINATSYSTEM OCH AVSTÅND (Distance Formula)
    // =========================================================================
    private level5_Coordinates(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'pyth_coord_dist_int', type: 'calculate' },
            { key: 'pyth_coord_dist_dec', type: 'calculate' },
            { key: 'pyth_coord_find_delta', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'pyth_coord_dist_int') {
            const [dx, dy, d] = MathUtils.randomChoice([[3, 4, 5], [6, 8, 10], [5, 12, 13]]);
            // Keep points within visible grid range
            const x1 = MathUtils.randomInt(-2, 2);
            const y1 = MathUtils.randomInt(-2, 2);
            const x2 = x1 + dx;
            const y2 = y1 + dy;
            const token = `(${x1},${y1});(${x2},${y2});${d}`;

            // Calculate auto-fitting grid boundaries
            const minBound = Math.min(x1, y1, -1);
            const maxBound = Math.max(x2, y2, 6);
            const range = Math.max(Math.abs(minBound), Math.abs(maxBound)) + 2;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Bestäm avståndet d mellan punkterna A(${x1}, ${y1}) och B(${x2}, ${y2}).` 
                        : `Determine the distance d between points A(${x1}, ${y1}) and B(${x2}, ${y2}).`,
                    interceptorToken: token,
                    answerType: 'numeric',
                    graph: {
                        xMin: -2,
                        xMax: range,
                        yMin: -2,
                        yMax: range,
                        gridStep: 1,
                        labelStep: 2,
                        segments: [
                            // Main distance segment (hypotenuse)
                            { x1, y1, x2, y2, color: '#4f46e5', width: 2.5 },
                            // Dashed orthogonal legs forming right triangle
                            { x1, y1, x2: x2, y2: y1, color: '#94a3b8', width: 1.5, dashed: true },
                            { x1: x2, y1, x2, y2, color: '#94a3b8', width: 1.5, dashed: true }
                        ],
                        points: [
                            { x: x1, y: y1, label: `A(${x1}, ${y1})`, color: '#0f172a', yOffset: -12 },
                            { x: x2, y: y2, label: `B(${x2}, ${y2})`, color: '#0f172a', yOffset: -12 }
                        ]
                    }
                },
                token: this.toBase64(d.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Räkna rutorna i x-led (basen): Δx = ${x2} - (${x1}) = ${dx}` : `Count grid units in x-axis: Δx = ${x2} - (${x1}) = ${dx}`, latex: `\\Delta x = ${dx}` },
                    { text: lang === 'sv' ? `Räkna rutorna i y-led (höjden): Δy = ${y2} - (${y1}) = ${dy}` : `Count grid units in y-axis: Δy = ${y2} - (${y1}) = ${dy}`, latex: `\\Delta y = ${dy}` },
                    { text: lang === 'sv' ? `Använd Pythagoras sats: d = √(${dx}² + ${dy}²) = √${d ** 2} = ${d}` : `Use Pythagoras: d = √(${dx}² + ${dy}²) = √${d ** 2} = ${d}`, latex: `d = \\mathbf{${d}}` },
                    { text: lang === 'sv' ? `Svar: ${d}` : `Answer: ${d}`, latex: `${d}` }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        if (v === 'pyth_coord_dist_dec') {
            const x1 = MathUtils.randomInt(-2, 1);
            const y1 = MathUtils.randomInt(-2, 1);
            let dx = MathUtils.randomInt(2, 5);
            let dy = MathUtils.randomInt(2, 5);
            while (Number.isInteger(Math.sqrt(dx ** 2 + dy ** 2))) {
                dy = MathUtils.randomInt(2, 5);
            }
            const x2 = x1 + dx;
            const y2 = y1 + dy;
            const dVal = Math.sqrt(dx ** 2 + dy ** 2);
            const dRounded = parseFloat(dVal.toFixed(1));
            const dStr = this.formatNum(dRounded, lang);
            const token = `(${x1},${y1});(${x2},${y2});${dRounded}`;

            const range = Math.max(x2, y2) + 2;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Beräkna avståndet d mellan punkterna och avrunda till en decimal.` 
                        : `Calculate distance d between the points and round to 1 decimal place.`,
                    interceptorToken: token,
                    answerType: 'numeric',
                    graph: {
                        xMin: -2,
                        xMax: range,
                        yMin: -2,
                        yMax: range,
                        gridStep: 1,
                        labelStep: 2,
                        segments: [
                            { x1, y1, x2, y2, color: '#4f46e5', width: 2.5 },
                            { x1, y1, x2: x2, y2: y1, color: '#94a3b8', width: 1.5, dashed: true },
                            { x1: x2, y1, x2, y2, color: '#94a3b8', width: 1.5, dashed: true }
                        ],
                        points: [
                            { x: x1, y: y1, label: `(${x1}, ${y1})`, color: '#0f172a', yOffset: -12 },
                            { x: x2, y: y2, label: `(${x2}, ${y2})`, color: '#0f172a', yOffset: -12 }
                        ]
                    }
                },
                token: this.toBase64(dStr),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Kateterna i rutnätet är Δx = ${dx} och Δy = ${dy}` : `Legs on the grid are Δx = ${dx} and Δy = ${dy}`, latex: `d = \\sqrt{${dx}^2 + ${dy}^2}` },
                    { text: lang === 'sv' ? `d = √(${dx ** 2 + dy ** 2}) ≈ ${dStr}` : `d = √(${dx ** 2 + dy ** 2}) ≈ ${dStr}`, latex: `d \\approx \\mathbf{${dStr}}` },
                    { text: lang === 'sv' ? `Svar: ${dStr}` : `Answer: ${dStr}`, latex: `${dStr}` }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        // pyth_coord_find_delta
        const x1 = MathUtils.randomInt(1, 3);
        const y1 = MathUtils.randomInt(1, 3);
        const dx = MathUtils.randomInt(3, 6);
        const dy = MathUtils.randomInt(3, 6);
        const x2 = x1 + dx;
        const y2 = y1 + dy;
        const ans = `${dx} och ${dy}`;
        const range = Math.max(x2, y2) + 2;

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Hur långa är kateterna Δx och Δy mellan punkterna på rutnätet?` 
                    : `What are the leg lengths Δx and Δy between the points on the grid?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([`${dx} och ${dy}`, `${dx + 1} och ${dy}`, `${dx} och ${dy - 1}`, `${x2} och ${y2}`]),
                graph: {
                    xMin: 0,
                    xMax: range,
                    yMin: 0,
                    yMax: range,
                    gridStep: 1,
                    labelStep: 2,
                    segments: [
                        { x1, y1, x2, y2, color: '#4f46e5', width: 2.5 },
                        { x1, y1, x2: x2, y2: y1, color: '#e11d48', width: 2, dashed: true },
                        { x1: x2, y1, x2, y2, color: '#2563eb', width: 2, dashed: true }
                    ],
                    points: [
                        { x: x1, y: y1, label: `(${x1}, ${y1})`, color: '#0f172a', yOffset: -12 },
                        { x: x2, y: y2, label: `(${x2}, ${y2})`, color: '#0f172a', yOffset: -12 }
                    ]
                }
            },
            token: this.toBase64(ans),
            variationKey: v,
            type: 'concept',
            clues: [
                { text: lang === 'sv' ? `Räkna steg i x-led (röd streckad linje): ${x2} - ${x1} = ${dx}` : `Horizontal steps (red dashed line): ${x2} - ${x1} = ${dx}`, latex: `\\Delta x = ${dx}` },
                { text: lang === 'sv' ? `Räkna steg i y-led (blå streckad linje): ${y2} - ${y1} = ${dy}` : `Vertical steps (blue dashed line): ${y2} - ${y1} = ${dy}`, latex: `\\Delta y = ${dy}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    // =========================================================================
    // LEVEL 6: SAMMANSATTA FIGURER & RYMDDIAGONAL
    // =========================================================================
    private level6_Composite3D(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'pyth_isosceles_height', type: 'calculate' },
            { key: 'pyth_rect_diagonal', type: 'calculate' },
            { key: 'pyth_3d_box_diagonal', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'pyth_isosceles_height') {
            const [halfB, h, slant] = MathUtils.randomChoice([[3, 4, 5], [6, 8, 10], [5, 12, 13]]);
            const b = halfB * 2;
            const area = (b * h) / 2;
            const token = `${b};${slant};${h};${area}`;

            return {
                renderData: {
                    description: lang === 'sv' ? `En likbent triangel har basen ${b} cm och två sidor på ${slant} cm vardera. Beräkna triangelns area.` : `An isosceles triangle has base ${b} cm and two sides of ${slant} cm each. Calculate its area.`,
                    interceptorToken: token,
                    answerType: 'numeric',
                    geometry: {
                        type: 'triangle',
                        subtype: 'isosceles',
                        dims: { w: b * 8, h: h * 8 },
                        labels: { b: `${b}`, s1: `${slant}`, s2: `${slant}`, h: 'h' }
                    }
                },
                token: this.toBase64(area.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Dela basen mitt itu för att få en rätvinklig triangelhalva med basen ${halfB} cm.` : `Split the base in half to get a right triangle with base ${halfB} cm.` },
                    { text: lang === 'sv' ? `Beräkna höjden: h = √(${slant}² - ${halfB}²) = √${h ** 2} = ${h} cm` : `Calculate height: h = √(${slant}² - ${halfB}²) = √${h ** 2} = ${h} cm`, latex: `h = \\mathbf{${h}}` },
                    { text: lang === 'sv' ? `Beräkna arean: (${b} · ${h}) / 2 = ${area} cm²` : `Calculate area: (${b} · ${h}) / 2 = ${area} cm²`, latex: `\\text{Area} = \\mathbf{${area}}` },
                    { text: lang === 'sv' ? `Svar: ${area}` : `Answer: ${area}`, latex: `${area}` }
                ],
                metadata: { variation_key: v, difficulty: 5 }
            };
        }

        if (v === 'pyth_rect_diagonal') {
            const [a, b, d] = MathUtils.randomChoice(this.PYTH_TRIPLES);
            const token = `${a};${b};${d}`;

            return {
                renderData: {
                    description: lang === 'sv' ? `En rektangel har sidorna ${b} cm och ${a} cm. Beräkna diagonalens längd d.` : `A rectangle has sides of ${b} cm and ${a} cm. Calculate the length of diagonal d.`,
                    interceptorToken: token,
                    answerType: 'numeric',
                    geometry: {
                        type: 'rectangle',
                        dims: { w: b * 10, h: a * 10 },
                        labels: { w: `${b}`, h: `${a}`, d: 'd' }
                    }
                },
                token: this.toBase64(d.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Diagonalen delar rektangeln i två rätvinkliga trianglar." : "The diagonal splits the rectangle into two right triangles." },
                    { text: lang === 'sv' ? `d = √(${b}² + ${a}²) = √${d ** 2} = ${d}` : `d = √(${b}² + ${a}²) = √${d ** 2} = ${d}`, latex: `d = \\mathbf{${d}}` },
                    { text: lang === 'sv' ? `Svar: ${d}` : `Answer: ${d}`, latex: `${d}` }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        // pyth_3d_box_diagonal
        const l = 3;
        const w = 4;
        const h = 12;
        const d3D = 13;

        return {
            renderData: {
                description: lang === 'sv' ? `Ett rätblock har måtten l = ${l} cm, b = ${w} cm och h = ${h} cm. Beräkna rymddiagonalen d.` : `A cuboid has dimensions l = ${l} cm, w = ${w} cm, and h = ${h} cm. Calculate the 3D space diagonal d.`,
                answerType: 'numeric',
                geometry: {
                    type: 'cuboid',
                    labels: { l: `${l}`, w: `${w}`, h: `${h}`, d: 'd' }
                }
            },
            token: this.toBase64(d3D.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Rymddiagonalen beräknas med 3D-Pythagoras: d = √(l² + b² + h²)` : `The space diagonal uses 3D Pythagoras: d = √(l² + w² + h²)` },
                { text: lang === 'sv' ? `d = √(${l ** 2} + ${w ** 2} + ${h ** 2}) = √${d3D ** 2} = ${d3D}` : `d = √(${l ** 2} + ${w ** 2} + ${h ** 2}) = √${d3D ** 2} = ${d3D}`, latex: `d = \\mathbf{${d3D}}` },
                { text: lang === 'sv' ? `Svar: ${d3D}` : `Answer: ${d3D}`, latex: `${d3D}` }
            ],
            metadata: { variation_key: v, difficulty: 5 }
        };
    }
}