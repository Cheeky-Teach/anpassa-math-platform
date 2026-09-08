// src/core/utils/generators/FractionArithGen.ts
import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class FractionArithGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        if (level === 1 && options.hideConcept) {
            return this.level2_DiffDenom(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_SameDenom(lang, undefined, options); break;
            case 2: questionData = this.level2_DiffDenom(lang, undefined, options); break;
            case 3: questionData = this.level3_MixedNumbers(lang, undefined, options); break;
            case 4: questionData = this.level4_Multiplication(lang, undefined, options); break;
            case 5: questionData = this.level5_Division(lang, undefined, options); break;
            case 6: questionData = this.level6_NegativeFractions(lang, undefined, options); break;
            case 7: questionData = this.level7_OrderOfOps(lang, undefined, options); break;
            case 8: questionData = this.level8_UltimateBoss(lang, undefined, options); break;
            default: questionData = this.level1_SameDenom(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override (Excluding 6, 7, 8 from word problems due to complexity)
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 3, 4, 5];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'add_concept':
            case 'add_missing':
            case 'add_calc':
            case 'sub_calc': 
                return this.level1_SameDenom(lang, key);
            case 'lcd_find':
            case 'add_error_spot':
            case 'add_diff_denom':
            case 'sub_diff_denom':
                return this.level2_DiffDenom(lang, key);
            case 'mixed_est':
            case 'mixed_add_same':
            case 'mixed_add_diff':
            case 'mixed_sub_same':
            case 'mixed_sub_diff':
                return this.level3_MixedNumbers(lang, key);
            case 'mult_scaling':
            case 'mult_area':
            case 'mult_calc':
                return this.level4_Multiplication(lang, key);
            case 'div_operator':
            case 'div_reciprocal':
            case 'div_calc':
                return this.level5_Division(lang, key);
            case 'neg_frac_add_sub':
            case 'neg_frac_mult_div':
                return this.level6_NegativeFractions(lang, key);
            case 'frac_order_mult':
            case 'frac_order_paren':
                return this.level7_OrderOfOps(lang, key);
            case 'frac_exp_sign':
            case 'frac_square_result':
            case 'frac_complex_fraction':
                return this.level8_UltimateBoss(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private simplify(n: number, d: number) {
        const sign = (n < 0 && d > 0) || (n > 0 && d < 0) ? -1 : 1;
        const absN = Math.abs(n);
        const absD = Math.abs(d);
        const common = MathUtils.gcd(absN, absD);
        return { n: (absN / common) * sign, d: absD / common, gcd: common };
    }

    private lcm(a: number, b: number): number {
        if (a === 0 || b === 0) return 0;
        return Math.abs(a * b) / MathUtils.gcd(a, b);
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

    /**
     * Helper to safely format negative fractions.
     * isFirst = true means it doesn't need parentheses even if negative.
     */
    private formatFrac(n: number, d: number, isFirst: boolean = false): string {
        const simp = this.simplify(n, d);
        if (simp.n < 0) {
            return isFirst ? `-\\frac{${Math.abs(simp.n)}}{${simp.d}}` : `\\left(-\\frac{${Math.abs(simp.n)}}{${simp.d}}\\right)`;
        }
        return `\\frac{${simp.n}}{${simp.d}}`;
    }

    // --- LEVEL 1: SAME DENOMINATORS ---
    private level1_SameDenom(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'add_calc', type: 'calculate' },
            { key: 'sub_calc', type: 'calculate' },
            { key: 'add_concept', type: 'concept'}
        ];
        const v = variationKey || this.getVariation(pool, options);
        // ==========================================
        // VARIATION A: Concept Check (True/False)
        // ==========================================
        if (v === 'add_concept') {
            const d = MathUtils.randomInt(4, 9);
            const n1 = 1;
            const n2 = MathUtils.randomInt(1, d - 2);
            const sum = n1 + n2;
            
            const correctEq = { label: `$\\frac{${n1}}{${d}}$ + $\\frac{${n2}}{${d}}$ = $\\frac{${sum}}{${d}}$`, value: "correct" };
            const wrongEq1 = { label: `$\\frac{${n1}}{${d}}$ + $\\frac{${n2}}{${d}}$ = $\\frac{${sum}}{${d + d}}$`, value: "trap_add_denom" };
            const wrongEq2 = { label: `$\\frac{${n1}}{${d}}$ + $\\frac{${n2}}{${d}}$ = $\\frac{${n1 * n2}}{${d}}$`, value: "trap_mult_num" };
            const wrongEq3 = { label: `$\\frac{${n1}}{${d}}$ + $\\frac{${n2}}{${d}}$ = $\\frac{${sum}}{${d * d}}$`, value: "trap_mult_denom" };
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående är matematiskt korrekt?" : "Which statement is mathematically correct?",
                    latex: "",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correctEq, wrongEq1, wrongEq2, wrongEq3]) 
                },
                token: this.toBase64("correct"),
                variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "När man adderar bråk med samma nämnare, ändras INTE nämnaren. Man plussar bara ihop siffrorna där uppe (täljarna)." : "When adding fractions with the same denominator, the denominator does NOT change. You only add the top numbers (numerators).", 
                        latex: `\\frac{a}{c} + \\frac{b}{c} = \\frac{a+b}{c}` 
                    },
                    {
                        text: lang === 'sv' ? `Därför måste svaret ha kvar nämnaren ${d} och en täljare som är ${n1} + ${n2} = ${sum}.` : `Therefore, the answer must keep the denominator ${d} and have a numerator of ${n1} + ${n2} = ${sum}.`,
                        latex: `\\mathbf{${correctEq.label}}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        // ==========================================
        // VARIATION B: Missing Term (Algebraic)
        // ==========================================
        if (v === 'add_missing') {
            const d = MathUtils.randomInt(5, 12);
            const n1 = MathUtils.randomInt(1, d - 2);
            const nMissing = MathUtils.randomInt(1, d - n1 - 1);
            const nTotal = n1 + nMissing;

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket tal är x?" : "Which number is x?",
                    latex: `\\frac{${n1}}{${d}} + \\frac{x}{${d}} = \\frac{${nTotal}}{${d}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(nMissing.toString()),
                variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Täljarna måste bli summan. Vad plus ${n1} blir ${nTotal}?` : `Numerators must sum up. What plus ${n1} equals ${nTotal}?`, 
                        latex: `${n1} + x = ${nTotal}` 
                    },
                    {
                        text: lang === 'sv' ? `Subtrahera ${n1} från ${nTotal} för att få reda på x.` : `Subtract ${n1} from ${nTotal} to find x.`,
                        latex: `x = ${nTotal} - ${n1} = ${nMissing}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${nMissing}` : `Answer: ${nMissing}`,
                        latex: `${nMissing}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 2 }
            };
        }

        const isSub = v === 'sub_calc';
        const d = MathUtils.randomInt(4, 12);
        const n1 = MathUtils.randomInt(2, d - 1);
        const n2 = isSub ? MathUtils.randomInt(1, n1 - 1) : MathUtils.randomInt(1, Math.floor(d / 2));
        
        const rawRes = isSub ? n1 - n2 : n1 + n2;
        const simp = this.simplify(rawRes, d);
        const op = isSub ? '-' : '+';

        const clues = [
            {
                text: lang === 'sv' ? `När de nedre siffrorna (nämnarna) är likadana rör vi dem inte. Vi adderar eller subtraherar bara siffrorna där uppe.` : `When the bottom numbers (denominators) are identical, we leave them untouched. We only add or subtract the top numbers.`,
                latex: `\\frac{${n1}}{${d}} ${op} \\frac{${n2}}{${d}}`
            },
            {
                text: lang === 'sv' ? `Ställ upp täljarna tillsammans på ett och samma bråkstreck:` : `Put the top numbers together over a single fraction bar:`,
                latex: `= \\frac{\\mathbf{${n1} ${op} ${n2}}}{${d}}`
            },
            {
                text: lang === 'sv' ? `Räkna ut svaret där uppe: ${n1} ${op} ${n2} blir ${rawRes}.` : `Calculate the top numbers: ${n1} ${op} ${n2} equals ${rawRes}.`,
                latex: `= \\frac{\\mathbf{${rawRes}}}{${d}}`
            }
        ];

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv' ? `Gör bråket enklare att läsa genom att dela (förkorta) både uppe och nere med talet ${simp.gcd}.` : `Make the fraction simpler to read by dividing both the top and bottom by ${simp.gcd}.`,
                latex: `= \\frac{${rawRes} \\mathbf{\\div ${simp.gcd}}}{${d} \\mathbf{\\div ${simp.gcd}}} = \\frac{\\mathbf{${simp.n}}}{\\mathbf{${simp.d}}}`
            });
        }

        clues.push({
            text: lang === 'sv' ? `Svar: ` : `Answer: `,
            latex: `\\frac{${simp.n}}{${simp.d}}`
        });

        return {
            renderData: { 
                description: lang === 'sv' ? `Beräkna ${isSub ? 'differensen' : 'summan'} och svara i enklaste form.` : `Calculate the ${isSub ? 'difference' : 'sum'} and answer in simplest form.`, 
                latex: `\\frac{${n1}}{${d}} ${op} \\frac{${n2}}{${d}}`, 
                answerType: 'fraction' 
            },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, clues
        };
    }

    // --- LEVEL 2: DIFFERENT DENOMINATORS ---
    private level2_DiffDenom(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'add_diff_denom', type: 'calculate' },
            { key: 'sub_diff_denom', type: 'calculate' },
            { key: 'lcd_find', type: 'concept'}
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        if (v === 'lcd_find') {
            const d1 = MathUtils.randomInt(2, 8), d2 = MathUtils.randomInt(4, 15);
            const res = this.lcm(d1, d2);
            
            return {
                renderData: { 
                    description: lang === 'sv' ? `Hitta den minsta gemensamma nämnaren (MGN) för ${d1} och ${d2}.` : `Find the lowest common denominator (LCD) for ${d1} and ${d2}.`, 
                    answerType: 'numeric' 
                },
                token: this.toBase64(res.toString()), 
                variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Vi letar efter det minsta talet som finns i båda talens multiplikationstabeller." : "Step 1: We are looking for the smallest number that appears in the multiplication tables of both numbers." },
                    { text: lang === 'sv' ? `Tabell ${d1}: ${d1}, ${d1*2}, ${d1*3}...` : `Table ${d1}: ${d1}, ${d1*2}, ${d1*3}...` },
                    { text: lang === 'sv' ? `Tabell ${d2}: ${d2}, ${d2*2}, ${d2*3}...` : `Table ${d2}: ${d2}, ${d2*2}, ${d2*3}...` },
                    { text: lang === 'sv' ? `Det första gemensamma talet är ${res}.` : `The first common number is ${res}.` },
                    { text: lang === 'sv' ? `Svar: ${res}` : `Answer: ${res}`, latex: `${res}` }
                ],
                metadata: { variation_key: v, difficulty: 2 } 
            };
        }

        const isSub = v === 'sub_diff_denom';
        let d1 = MathUtils.randomInt(2, 10);
        let d2 = MathUtils.randomInt(2, 10);
        while (d1 === d2) d2 = MathUtils.randomInt(2, 10);

        const lcd = this.lcm(d1, d2);
        let f1 = lcd / d1;
        let f2 = lcd / d2;
        let n1 = MathUtils.randomInt(1, 3);
        let n2 = MathUtils.randomInt(1, 3);
        
        if (isSub && (n1 * f1 <= n2 * f2)) {
            [n1, n2] = [n2, n1];
            [d1, d2] = [d2, d1];
            [f1, f2] = [f2, f1];
            if (n1 * f1 === n2 * f2) n1++;
        }
        
        const ext1 = n1 * f1;
        const ext2 = n2 * f2;
        const op = isSub ? '-' : '+';
        const rawRes = isSub ? ext1 - ext2 : ext1 + ext2;
        const simp = this.simplify(rawRes, lcd);

        const clues = [
            {
                text: lang === 'sv' ? `Vi kan inte addera eller subtrahera bråk när nämnarna (talen under bråkstrecket) är olika. Vi måste ändra dem så att båda får nämnaren ${lcd}.` : `We cannot add or subtract fractions when the bottom numbers are different. We must change them so both get the denominator ${lcd}.`,
                latex: `\\frac{${n1}}{${d1}} ${op} \\frac{${n2}}{${d2}}`
            },
            {
                text: lang === 'sv' ? `Gör om det första bråket genom att multiplicera (förlänga) både uppe och nere med ${f1}.` : `Change the first fraction by multiplying both top and bottom by ${f1}.`,
                latex: `= \\frac{${n1} \\mathbf{\\cdot ${f1}}}{${d1} \\mathbf{\\cdot ${f1}}} ${op} \\frac{${n2}}{${d2}}`
            },
            {
                text: lang === 'sv' ? `Gör om det andra bråket genom att multiplicera (förlänga) både uppe och nere med ${f2}.` : `Change the second fraction by multiplying both top and bottom by ${f2}.`,
                latex: `= \\frac{${ext1}}{${lcd}} ${op} \\frac{${n2} \\mathbf{\\cdot ${f2}}}{${d2} \\mathbf{\\cdot ${f2}}}`
            },
            {
                text: lang === 'sv' ? `Nu när de nedre siffrorna matchar kan vi sätta ihop de övre siffrorna på ett gemensamt bråkstreck:` : `Now that the bottom numbers match, we can combine the top numbers over a single fraction bar:`,
                latex: `= \\frac{\\mathbf{${ext1} ${op} ${ext2}}}{${lcd}}`
            },
            {
                text: lang === 'sv' ? `Räkna ut svaret där uppe: ${ext1} ${op} ${ext2} blir ${rawRes}.` : `Calculate the top numbers: ${ext1} ${op} ${ext2} equals ${rawRes}.`,
                latex: `= \\frac{\\mathbf{${rawRes}}}{${lcd}}`
            }
        ];

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv' ? `Gör bråket enklare genom att dela (förkorta) täljaren och nämnaren med ${simp.gcd}.` : `Make the fraction simpler by dividing both the top and bottom by ${simp.gcd}.`,
                latex: `= \\frac{${rawRes} \\mathbf{\\div ${simp.gcd}}}{${lcd} \\mathbf{\\div ${simp.gcd}}} = \\frac{\\mathbf{${simp.n}}}{\\mathbf{${simp.d}}}`
            });
        }

        clues.push({
            text: lang === 'sv' ? `Svar: ` : `Answer: `,
            latex: `\\frac{${simp.n}}{${simp.d}}`
        });

        return {
            renderData: { 
                description: lang === 'sv' ? `Beräkna ${isSub ? 'differensen' : 'summan'}. Svara i bråkform och i enklaste form.` : `Calculate the ${isSub ? 'difference' : 'sum'}. Answer as an improper fraction and in simplest form.`, 
                latex: `\\frac{${n1}}{${d1}} ${op} \\frac{${n2}}{${d2}}`, 
                answerType: 'fraction' 
            },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, clues
        };
    }

    // --- LEVEL 3: MIXED NUMBERS ---
    private level3_MixedNumbers(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mixed_add_diff', type: 'calculate' },
            { key: 'mixed_sub_diff', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSub = v.includes('sub');

        const w1 = MathUtils.randomInt(3, 5), w2 = MathUtils.randomInt(1, 2);
        const d1 = MathUtils.randomInt(2, 4), d2 = MathUtils.randomInt(3, 5);
        const n1 = 1, n2 = 1;

        const imp1N = w1 * d1 + n1, imp2N = w2 * d2 + n2;
        const lcd = this.lcm(d1, d2);
        const ext1N = imp1N * (lcd / d1), ext2N = imp2N * (lcd / d2);
        const resN = isSub ? ext1N - ext2N : ext1N + ext2N;
        
        const finalW = Math.floor(resN / lcd);
        const finalRemN = resN % lcd;
        const simp = this.simplify(finalRemN, lcd);
        const finalAnsStr = simp.n === 0 ? `${finalW}` : `${finalW}\\ ${simp.n}/${simp.d}`;
        const cleanTokenStr = simp.n === 0 ? `${finalW}` : `${finalW} ${simp.n}/${simp.d}`;
        const op = isSub ? '-' : '+';

        const clues = [
            {
                text: lang === 'sv' ? `Steg 1: Gör om det första talet till bråkform.` : `Step 1: Convert the first number to an improper fraction.`,
                latex: `${w1}\\frac{${n1}}{${d1}} = \\frac{${w1} \\cdot ${d1} + ${n1}}{${d1}} = \\frac{${imp1N}}{${d1}}`
            },
            {
                text: lang === 'sv' ? `Steg 2: Gör om det andra talet till bråkform. Just nu har vi:` : `Step 2: Convert the second number to an improper fraction. Right now we have:`,
                latex: `${w2}\\frac{${n2}}{${d2}} = \\frac{${w2} \\cdot ${d2} + ${n2}}{${d2}} = \\frac{${imp2N}}{${d2}}`
            },
            {
                text: lang === 'sv' ? `Steg 3: Hitta MGN för ${d1} och ${d2}.` : `Step 3: Find the LCD for ${d1} and ${d2}.`,
                latex: `MGN = ${lcd}`
            },
            {
                text: lang === 'sv' ? `Steg 4: Förläng båda bråken till nämnaren ${lcd}. Just nu har vi:` : `Step 4: Extend both fractions to the denominator ${lcd}. Right now we have:`,
                latex: `\\frac{${ext1N}}{${lcd}} ${op} \\frac{${ext2N}}{${lcd}}`
            },
            {
                text: lang === 'sv' ? `Steg 5: Räkna ut ${isSub ? 'skillnaden' : 'summan'} i bråkform.` : `Step 5: Calculate the ${isSub ? 'difference' : 'sum'} in fraction form.`,
                latex: `\\frac{${resN}}{${lcd}}`
            }
        ];

        if (finalW > 0) {
            clues.push({
                text: lang === 'sv' ? `Steg 6: Omvandla tillbaka till blandad form genom att se hur många hela (${lcd}/${lcd}) som får plats i täljaren.` : `Step 6: Convert back to mixed form by seeing how many wholes (${lcd}/${lcd}) fit in the numerator.`,
                latex: `\\frac{${resN}}{${lcd}} = ${finalW}\\frac{${finalRemN}}{${lcd}}`
            });
        }

        clues.push({
            text: lang === 'sv' ? `Svaret är: ` : `The answer is: `,
            latex: finalAnsStr
        });

        return {
            renderData: { 
                description: lang === 'sv' ? `Beräkna och svara i blandad form och enklaste form.` : `Calculate and answer as a mixed fraction in simplest form.`, 
                latex: `${w1}\\frac{${n1}}{${d1}} ${op} ${w2}\\frac{${n2}}{${d2}}`, 
                answerType: 'mixed_fraction' 
            },
            token: this.toBase64(cleanTokenStr), variationKey: v, clues
        };
    }

    // --- LEVEL 4: MULTIPLICATION ---
    private level4_Multiplication(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [{ key: 'mult_calc', type: 'calculate' }];
        const v = variationKey || this.getVariation(pool, options);

        const n1 = MathUtils.randomInt(1, 8), d1 = MathUtils.randomInt(2, 10);
        const n2 = MathUtils.randomInt(1, 8), d2 = MathUtils.randomInt(2, 10);
        const resN = n1 * n2, resD = d1 * d2;
        const simp = this.simplify(resN, resD);

        const clues = [
            {
                text: lang === 'sv' ? `Att multiplicera bråk är jätte-enkelt! Vi behöver inte ändra några nämnare. Vi multiplicerar bara rakt över: uppe med uppe och nere med nere.` : `Multiplying fractions is super simple! We don't need to change any denominators. We just multiply straight across: top times top, bottom times bottom.`,
                latex: `\\frac{${n1}}{${d1}} \\cdot \\frac{${n2}}{${d2}}`
            },
            {
                text: lang === 'sv' ? `Skriv ut multiplikationerna på ett och samma bråkstreck:` : `Write out the multiplication paths on a unified single fraction bar:`,
                latex: `= \\frac{\\mathbf{${n1} \\cdot ${n2}}}{\\mathbf{${d1} \\cdot ${d2}}}`
            },
            {
                text: lang === 'sv' ? `Räkna ut täljaren (${n1} · ${n2} = ${resN}) och nämnaren (${d1} · ${d2} = ${resD}):` : `Perform the arithmetic steps for the top (${n1} · ${n2} = ${resN}) and bottom (${d1} · ${d2} = ${resD}):`,
                latex: `= \\frac{\\mathbf{${resN}}}{\\mathbf{${resD}}}`
            }
        ];

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv' ? `Gör bråket enklare genom att dela täljaren och nämnaren med ${simp.gcd}.` : `Make the fraction simpler by dividing both the top and bottom by ${simp.gcd}.`,
                latex: `= \\frac{${resN} \\mathbf{\\div ${simp.gcd}}}{${resD} \\mathbf{\\div ${simp.gcd}}} = \\frac{\\mathbf{${simp.n}}}{\\mathbf{${simp.d}}}`
            });
        }

        clues.push({ text: lang === 'sv' ? `Svar: ` : `Answer: `, latex: `\\frac{${simp.n}}{${simp.d}}` });

        return {
            renderData: { description: lang === 'sv' ? "Multiplicera bråken. Svara i bråkform OCH i enklaste form." : "Multiply the fractions. Answer as an improper fraction and in simplest form.", latex: `\\frac{${n1}}{${d1}} \\cdot \\frac{${n2}}{${d2}}`, answerType: 'fraction' },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, clues
        };
    }

    // --- LEVEL 5: DIVISION ---
    private level5_Division(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [{ key: 'div_calc', type: 'calculate' }];
        const v = variationKey || this.getVariation(pool, options);

        const n1 = MathUtils.randomInt(1, 5), d1 = MathUtils.randomInt(5, 12);
        const n2 = MathUtils.randomInt(1, 5), d2 = MathUtils.randomInt(5, 12);

        const resN = n1 * d2;
        const resD = d1 * n2;
        const simp = this.simplify(resN, resD);

        const clues = [
            {
                text: lang === 'sv' ? `När vi delar två bråk använder vi ett smart trick: Behåll det första bråket, ändra till gånger, och vänd det andra bråket upp-och-ner.` : `When dividing two fractions, we use a neat trick: Keep the first fraction unchanged, switch the operator to multiplication, and flip the second fraction upside down.`,
                latex: `\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}}`
            },
            {
                text: lang === 'sv' ? `Vänd på det andra bråket så att det blir \\frac{${d2}}{${n2}} och ändra divisionstecknet till ett gångertecken:` : `Flip the second fraction to get \\frac{${d2}}{${n2}} and change the division symbol to multiplication:`,
                latex: `= \\frac{${n1}}{${d1}} \\mathbf{\\cdot \\frac{${d2}}{${n2}}}`
            },
            {
                text: lang === 'sv' ? `multiplicera nu rakt över: täljare med täljare (${n1} · ${d2}) och nämnare med nämnare (${d1} · ${n2}).` : `Now multiply straight across: top times top (${n1} · ${d2}) and bottom times bottom (${d1} · ${n2}).`,
                latex: `= \\frac{\\mathbf{${n1} \\cdot ${d2}}}{\\mathbf{${d1} \\cdot ${n2}}} = \\frac{\\mathbf{${resN}}}{\\mathbf{${resD}}}`
            }
        ];

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv' ? `Gör svaret enklare genom att dela (förkorta) både täljaren och nämnaren med ${simp.gcd}.` : `Make the answer simpler by dividing both the top and bottom by ${simp.gcd}.`,
                latex: `= \\frac{${resN} \\mathbf{\\div ${simp.gcd}}}{${resD} \\mathbf{\\div ${simp.gcd}}} = \\frac{\\mathbf{${simp.n}}}{\\mathbf{${simp.d}}}`
            });
        }

        clues.push({ text: lang === 'sv' ? `Svar: ` : `Answer: `, latex: `\\frac{${simp.n}}{${simp.d}}` });
        
        return {
            renderData: { description: lang === 'sv' ? "Beräkna kvoten. Svara i bråkform." : "Calculate the quotient.", latex: `\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}}`, answerType: 'fraction' },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, clues
        };
    }

    // --- LEVEL 6: NEGATIVE FRACTION ARITHMETIC ---
    private level6_NegativeFractions(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [
            { key: 'neg_frac_add_sub', type: 'calculate' },
            { key: 'neg_frac_mult_div', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'neg_frac_add_sub') {
            const d1 = MathUtils.randomChoice([2, 3, 4, 5, 6]);
            const d2 = MathUtils.randomChoice([2, 3, 4, 5, 6].filter(x => x !== d1));
            
            // Randomize signs to ensure at least one negative is involved
            let sign1 = Math.random() > 0.5 ? 1 : -1;
            let sign2 = Math.random() > 0.5 ? 1 : -1;
            if (sign1 === 1 && sign2 === 1) sign1 = -1; 
            
            const n1 = MathUtils.randomInt(1, d1 - 1) * sign1;
            const n2 = MathUtils.randomInt(1, d2 - 1) * sign2;
            const isSub = Math.random() > 0.5;
            const op = isSub ? '-' : '+';
            
            const exprLatex = `${this.formatFrac(n1, d1, true)} ${op} ${this.formatFrac(n2, d2, false)}`;
            
            // Clean up the signs for processing
            let cleanedOp = op;
            let effN2 = n2;
            if (isSub && n2 < 0) { cleanedOp = '+'; effN2 = Math.abs(n2); }
            else if (!isSub && n2 < 0) { cleanedOp = '-'; effN2 = Math.abs(n2); }
            else if (isSub && n2 > 0) { cleanedOp = '-'; effN2 = Math.abs(n2); }

            const lcd = this.lcm(d1, d2);
            const ext1 = n1 * (lcd / d1);
            const ext2 = effN2 * (lcd / d2);
            const rawRes = cleanedOp === '+' ? ext1 + ext2 : ext1 - ext2;
            const simp = this.simplify(rawRes, lcd);

            const clues = [
                {
                    text: lang === 'sv' ? "Här har vi både bråk och negativa tal. Uttrycket är:" : "Here we have both fractions and negative numbers. The expression is:",
                    latex: exprLatex
                }
            ];

            if (op !== cleanedOp || n2 < 0) {
                clues.push({
                    text: lang === 'sv' ? "Steg 1: Städa upp teckenkrocken. Ett plus och ett minus intill varandra blir minus. Två minus intill varandra blir plus." : "Step 1: Clean up the sign clash. A plus and a minus next to each other become a minus. Two minuses become a plus.",
                    latex: `${this.formatFrac(n1, d1, true)} \\mathbf{${cleanedOp}} \\frac{${Math.abs(n2)}}{${d2}}`
                });
            }

            clues.push({
                text: lang === 'sv' ? `Steg 2: Vi behöver en gemensam nämnare (MGN) för ${d1} och ${d2}. Det blir ${lcd}.` : `Step 2: We need a least common denominator (LCD) for ${d1} and ${d2}. That will be ${lcd}.`,
                latex: `\\frac{${ext1}}{${lcd}} ${cleanedOp} \\frac{${ext2}}{${lcd}}`
            });

            clues.push({
                text: lang === 'sv' ? `Steg 3: Sätt dem på ett gemensamt bråkstreck och räkna ut täljaren: ${ext1} ${cleanedOp} ${ext2} = ${rawRes}.` : `Step 3: Put them on a single fraction bar and calculate the numerator: ${ext1} ${cleanedOp} ${ext2} = ${rawRes}.`,
                latex: `\\frac{\\mathbf{${ext1} ${cleanedOp} ${ext2}}}{${lcd}} = \\frac{\\mathbf{${rawRes}}}{${lcd}}`
            });

            if (simp.gcd > 1) {
                clues.push({
                    text: lang === 'sv' ? `Förkorta genom att dela uppe och nere med ${simp.gcd}.` : `Simplify by dividing top and bottom by ${simp.gcd}.`,
                    latex: `\\frac{${simp.n}}{${simp.d}}`
                });
            }

            clues.push({ text: lang === 'sv' ? "Svar:" : "Answer:", latex: `\\frac{${simp.n}}{${simp.d}}` });

            return {
                renderData: { latex: exprLatex, description: lang === 'sv' ? "Beräkna och svara i enklaste form." : "Calculate and answer in simplest form.", answerType: 'fraction' },
                token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, clues
            };
        }

        // neg_frac_mult_div
        const d1 = MathUtils.randomInt(2, 6);
        const d2 = MathUtils.randomInt(2, 6);
        const n1 = MathUtils.randomInt(1, d1 - 1) * -1; // Force first to be negative
        const n2 = MathUtils.randomInt(1, d2 - 1) * (Math.random() > 0.5 ? 1 : -1);
        const isMult = Math.random() > 0.5;
        const op = isMult ? '\\cdot' : '\\div';
        const exprLatex = `${this.formatFrac(n1, d1, true)} ${op} ${this.formatFrac(n2, d2, false)}`;

        let resN, resD;
        if (isMult) {
            resN = n1 * n2;
            resD = d1 * d2;
        } else {
            resN = n1 * d2;
            resD = d1 * n2;
        }
        const simp = this.simplify(resN, resD);
        const isAnsPositive = simp.n > 0;

        const clues = [
            {
                text: lang === 'sv' ? "Uttrycket innehåller multiplikation/division med negativa bråk:" : "The expression contains multiplication/division with negative fractions:",
                latex: exprLatex
            },
            {
                text: lang === 'sv' ? `Steg 1: Bestäm tecknet på svaret först! Lika tecken ger plus, olika tecken ger minus. Svaret kommer att bli ${isAnsPositive ? 'positivt' : 'negativt'}.` : `Step 1: Determine the sign of the answer first! Same signs give a plus, different signs give a minus. The answer will be ${isAnsPositive ? 'positive' : 'negative'}.`,
                latex: isAnsPositive ? `(-)${op}(-) \\rightarrow (+)` : `(-)${op}(+) \\rightarrow (-)`
            }
        ];

        if (isMult) {
            clues.push({
                text: lang === 'sv' ? "Steg 2: Multiplicera bråken som vanligt (täljare med täljare, nämnare med nämnare)." : "Step 2: Multiply the fractions normally (top with top, bottom with bottom).",
                latex: `${isAnsPositive ? '' : '-'}\\frac{${Math.abs(n1)} \\cdot ${Math.abs(n2)}}{${d1} \\cdot ${d2}} = \\frac{${isAnsPositive ? '' : '-'}${Math.abs(resN)}}{${resD}}`
            });
        } else {
            clues.push({
                text: lang === 'sv' ? `Steg 2: Vid division byter vi till multiplikation och vänder upp-och-ner på det andra bråket (till ${d2}/${Math.abs(n2)}).` : `Step 2: For division, we switch to multiplication and flip the second fraction upside down (to ${d2}/${Math.abs(n2)}).`,
                latex: `${isAnsPositive ? '' : '-'}\\frac{${Math.abs(n1)}}{${d1}} \\cdot \\frac{${d2}}{${Math.abs(n2)}} = \\frac{${isAnsPositive ? '' : '-'}${Math.abs(resN)}}{${Math.abs(resD)}}`
            });
        }

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv' ? `Förkorta svaret genom att dela med ${simp.gcd}.` : `Simplify the answer by dividing by ${simp.gcd}.`,
                latex: `\\frac{${simp.n}}{${simp.d}}`
            });
        }

        clues.push({ text: lang === 'sv' ? "Svar:" : "Answer:", latex: `\\frac{${simp.n}}{${simp.d}}` });

        return {
            renderData: { latex: exprLatex, description: lang === 'sv' ? "Beräkna och svara i enklaste form." : "Calculate and answer in simplest form.", answerType: 'fraction' },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, clues
        };
    }

    // --- LEVEL 7: ORDER OF OPERATIONS WITH FRACTIONS ---
    private level7_OrderOfOps(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [
            { key: 'frac_order_mult', type: 'calculate' },
            { key: 'frac_order_paren', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'frac_order_mult') {
            // Controlled sets of [d1, d2, d3] ensuring manageable LCDs and utilizing 8ths & 10ths
            const sets = [
                [2, 2, 3], [3, 2, 3], [6, 2, 3], // d2*d3 = 6
                [2, 2, 4], [4, 2, 4], [8, 2, 4], // d2*d3 = 8 (includes eighths)
                [2, 2, 5], [5, 2, 5], [10, 2, 5] // d2*d3 = 10 (includes tenths)
            ];
            const [d1, d2, d3] = MathUtils.randomChoice(sets);
            const n1 = MathUtils.randomInt(1, d1 - 1) || 1;
            const n2 = MathUtils.randomInt(1, d2 - 1) || 1;
            const n3 = MathUtils.randomInt(1, d3 - 1) || 1;

            const isMultFirst = Math.random() > 0.5;
            const exprLatex = isMultFirst ? `\\frac{${n2}}{${d2}} \\cdot \\frac{${n3}}{${d3}} + \\frac{${n1}}{${d1}}` : `\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}} \\cdot \\frac{${n3}}{${d3}}`;
            
            const multN = n2 * n3;
            const multD = d2 * d3;
            const multSimp = this.simplify(multN, multD);

            const lcd = this.lcm(d1, multSimp.d);
            const ext1 = n1 * (lcd / d1);
            const ext2 = multSimp.n * (lcd / multSimp.d);
            const finalRes = ext1 + ext2;
            const finalSimp = this.simplify(finalRes, lcd);

            return {
                renderData: { latex: exprLatex, description: lang === 'sv' ? "Beräkna med rätt prioriteringsordning." : "Calculate using correct order of operations.", answerType: 'fraction' },
                token: this.toBase64(`${finalSimp.n}/${finalSimp.d}`), variationKey: v, type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' ? "Räknestegen gäller även för bråk! Uttrycket är:" : "The order of operations applies to fractions too! The expression is:",
                        latex: exprLatex
                    },
                    {
                        text: lang === 'sv' ? `Steg 1: Multiplikation går före addition. Räkna ut gångertalet först: $\\frac{${n2}}{${d2}} \\cdot \\frac{${n3}}{${d3}} = \\frac{${multN}}{${multD}}$.` : `Step 1: Multiplication comes before addition. Calculate the multiplication first: $\\frac{${n2}}{${d2}} \\cdot \\frac{${n3}}{${d3}} = \\frac{${multN}}{${multD}}$.`,
                        latex: isMultFirst ? `\\mathbf{\\frac{${multSimp.n}}{${multSimp.d}}} + \\frac{${n1}}{${d1}}` : `\\frac{${n1}}{${d1}} + \\mathbf{\\frac{${multSimp.n}}{${multSimp.d}}}`
                    },
                    {
                        text: lang === 'sv' ? `Steg 2: Hitta gemensam nämnare (MGN) för ${d1} och ${multSimp.d}, vilket är ${lcd}. Addera bråken.` : `Step 2: Find the common denominator (LCD) for ${d1} and ${multSimp.d}, which is ${lcd}. Add the fractions.`,
                        latex: `\\frac{${ext1}}{${lcd}} + \\frac{${ext2}}{${lcd}} = \\mathbf{\\frac{${finalRes}}{${lcd}}}`
                    },
                    { text: lang === 'sv' ? "Svar i enklaste form:" : "Answer in simplest form:", latex: `\\frac{${finalSimp.n}}{${finalSimp.d}}` }
                ]
            };
        }

        // frac_order_paren (A +/- B) * C
        // Adding 8ths and 10ths combinations naturally here
        const pairs = [
            [2, 4], [2, 8], [4, 8], // LCDs = 4 or 8
            [2, 10], [5, 10],       // LCD = 10
            [2, 6], [3, 6]          // LCD = 6
        ];
        let [dA, dB] = MathUtils.randomChoice(pairs);
        if (Math.random() > 0.5) [dA, dB] = [dB, dA];
        
        let nA = MathUtils.randomInt(1, dA - 1) || 1;
        let nB = MathUtils.randomInt(1, dB - 1) || 1;
        
        const dC = MathUtils.randomChoice([2, 3, 4, 5]);
        const nC = MathUtils.randomInt(1, dC - 1) || 1;
        
        const lcdAB = this.lcm(dA, dB);
        let extA = nA * (lcdAB / dA);
        let extB = nB * (lcdAB / dB);
        
        let opParen = Math.random() > 0.5 ? '+' : '-';
        let sumAB = opParen === '+' ? extA + extB : extA - extB;
        
        // Ensure the operation stays positive and non-zero
        if (sumAB <= 0) {
            sumAB = Math.abs(sumAB);
            [nA, nB] = [nB, nA];
            [dA, dB] = [dB, dA];
            [extA, extB] = [extB, extA];
            if (sumAB === 0) {
                sumAB = extA + extB;
                opParen = '+';
            }
        }
        
        const simpAB = this.simplify(sumAB, lcdAB);
        const exprLatex = `\\left(\\frac{${nA}}{${dA}} ${opParen} \\frac{${nB}}{${dB}}\\right) \\cdot \\frac{${nC}}{${dC}}`;
        const finalN = simpAB.n * nC;
        const finalD = simpAB.d * dC;
        const finalSimp = this.simplify(finalN, finalD);

        return {
            renderData: { latex: exprLatex, description: lang === 'sv' ? "Beräkna uttrycket." : "Evaluate the expression.", answerType: 'fraction' },
            token: this.toBase64(`${finalSimp.n}/${finalSimp.d}`), variationKey: v, type: 'calculate',
            clues: [
                {
                    text: lang === 'sv' ? "Enligt räknestegen måste parenteser alltid räknas ut först:" : "According to the order of operations, parentheses must always be calculated first:",
                    latex: exprLatex
                },
                {
                    text: lang === 'sv' ? `Steg 1: Räkna ut parentesen. MGN för ${dA} och ${dB} är ${lcdAB}. Förenkling ger $\\frac{${sumAB}}{${lcdAB}}$ som förkortas till $\\frac{${simpAB.n}}{${simpAB.d}}$.` : `Step 1: Calculate the parenthesis. LCD for ${dA} and ${dB} is ${lcdAB}. Simplification gives $\\frac{${sumAB}}{${lcdAB}}$, which reduces to $\\frac{${simpAB.n}}{${simpAB.d}}$.`,
                    latex: `\\mathbf{\\frac{${simpAB.n}}{${simpAB.d}}} \\cdot \\frac{${nC}}{${dC}}`
                },
                {
                    text: lang === 'sv' ? "Steg 2: Nu kan vi multiplicera bråken." : "Step 2: Now we can multiply the fractions.",
                    latex: `\\frac{${simpAB.n} \\cdot ${nC}}{${simpAB.d} \\cdot ${dC}} = \\mathbf{\\frac{${finalN}}{${finalD}}}`
                },
                { text: lang === 'sv' ? "Svar i enklaste form:" : "Answer in simplest form:", latex: `\\frac{${finalSimp.n}}{${finalSimp.d}}` }
            ]
        };
    }

    // --- LEVEL 8: THE ULTIMATE BOSS (Negative Bases, Exponents, Fractions) ---
    private level8_UltimateBoss(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [
            { key: 'frac_exp_sign', type: 'calculate' },
            { key: 'frac_square_result', type: 'calculate' },
            { key: 'frac_complex_fraction', type: 'calculate' } // Added new boss variation
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'frac_complex_fraction') {
            // Top Fraction Structure: +/- A/B - C/D (Designed to often be negative)
            const pairs = [[2, 4], [2, 8], [3, 6], [2, 6], [4, 8]];
            let [dA, dB] = MathUtils.randomChoice(pairs);
            if (Math.random() > 0.5) [dA, dB] = [dB, dA];
            
            let nA = MathUtils.randomInt(1, dA - 1) || 1;
            let nB = MathUtils.randomInt(1, dB - 1) || 1;
            
            const lcdAB = this.lcm(dA, dB);
            let extA = nA * (lcdAB / dA);
            let extB = nB * (lcdAB / dB);
            
            // Randomly make the first term negative to force negative fraction arithmetic
            const isFirstNeg = Math.random() > 0.5;
            const signA = isFirstNeg ? -1 : 1;
            
            let numAB = (signA * extA) - extB; 
            if (numAB === 0) numAB = -1; // Prevent 0 to keep the division meaningful
            const simpAB = this.simplify(numAB, lcdAB);

            // Formatting helpers for the top
            const term1Latex = isFirstNeg ? `-\\frac{${nA}}{${dA}}` : `\\frac{${nA}}{${dA}}`;
            const topLatex = `${term1Latex} - \\frac{${nB}}{${dB}}`;
            const simpABLatex = this.formatFrac(simpAB.n, simpAB.d, true); // e.g., -\frac{3}{4}

            // Bottom Fraction Structure: (-1/C)^exp
            const isCube = Math.random() > 0.5;
            const exp = isCube ? 3 : 2;
            const dC = isCube ? 2 : MathUtils.randomChoice([2, 3]);
            
            const expResN = isCube ? -1 : 1;
            const expResD = Math.pow(dC, exp);
            
            const bottomLatex = `\\left(-\\frac{1}{${dC}}\\right)^{${exp}}`;
            const bottomEvalLatex = expResN === -1 ? `-\\frac{1}{${expResD}}` : `\\frac{1}{${expResD}}`;

            // Combine into the ultimate complex fraction
            const exprLatex = `\\frac{${topLatex}}{${bottomLatex}}`;
            
            // Division logic: Top * reciprocal of Bottom
            const finalN = simpAB.n * expResD;
            const finalD = simpAB.d * expResN; // expResN is 1 or -1, managing the sign natively
            const finalSimp = this.simplify(finalN, finalD);
            
            return {
                renderData: { latex: exprLatex, description: lang === 'sv' ? "Förenkla det komplexa bråket." : "Simplify the complex fraction.", answerType: 'fraction' },
                token: this.toBase64(`${finalSimp.n}/${finalSimp.d}`), variationKey: v, type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' ? "Ett komplext bråk har bråk inuti sig. Nu kombinerar vi det även med potenser och negativa tal. Vi löser över- och underdelen var för sig." : "A complex fraction has fractions inside it. Now we also combine it with powers and negative numbers. We solve the top and bottom separately.",
                        latex: exprLatex
                    },
                    {
                        text: lang === 'sv' ? `Steg 1: Förenkla täljaren (där uppe). MGN är ${lcdAB}.` : `Step 1: Simplify the numerator (top). LCD is ${lcdAB}.`,
                        latex: `${topLatex} = \\frac{${signA * extA}}{${lcdAB}} - \\frac{${extB}}{${lcdAB}} = \\mathbf{${simpABLatex}}`
                    },
                    {
                        text: lang === 'sv' ? `Steg 2: Förenkla nämnaren (där nere). Potensen har exponenten ${exp}, vilket gör att minuset ${isCube ? 'stannar kvar' : 'försvinner'}.` : `Step 2: Simplify the denominator (bottom). The power has the exponent ${exp}, which means the minus sign ${isCube ? 'stays' : 'disappears'}.`,
                        latex: `${bottomLatex} = \\mathbf{${bottomEvalLatex}}`
                    },
                    {
                        text: lang === 'sv' ? `Steg 3: Nu kan vi skriva ut hela problemet som en vanlig bråkdivision sida vid sida.` : `Step 3: Now we can write out the entire problem as a standard side-by-side fraction division.`,
                        latex: `${simpABLatex} \\div ${expResN === -1 ? `\\left(${bottomEvalLatex}\\right)` : bottomEvalLatex}`
                    },
                    {
                        text: lang === 'sv' ? `Steg 4: För division, byt till multiplikation och vänd på det andra bråket. Tänk på teckenreglerna!` : `Step 4: For division, change to multiplication and flip the second fraction. Remember the sign rules!`,
                        latex: `${simpABLatex} \\cdot ${expResN === -1 ? `\\left(-\\frac{${expResD}}{1}\\right)` : `\\frac{${expResD}}{1}`} = \\mathbf{\\frac{${finalSimp.n}}{${finalSimp.d}}}`
                    },
                    { text: lang === 'sv' ? "Svar i enklaste form:" : "Answer in simplest form:", latex: `\\frac{${finalSimp.n}}{${finalSimp.d}}` }
                ]
            };
        }

        if (v === 'frac_exp_sign') {
            // Carefully controlled d2Pools guarantee valid LCDs when adding/subtracting 
            const combos = [
                { exp: 3, baseD: 2, d2Pool: [2, 4, 8] },       // expResD = 8
                { exp: 2, baseD: 2, d2Pool: [2, 4, 8, 10] },   // expResD = 4
                { exp: 2, baseD: 3, d2Pool: [3, 6, 9] },       // expResD = 9
                { exp: 2, baseD: 4, d2Pool: [2, 4, 8, 16] }    // expResD = 16
            ];
            const combo = MathUtils.randomChoice(combos);
            const { exp, baseD, d2Pool } = combo;
            const isCube = exp === 3;
            const baseN = -1;
            
            const expResN = Math.pow(baseN, exp);
            const expResD = Math.pow(baseD, exp);
            
            const d2 = MathUtils.randomChoice(d2Pool); 
            const n2 = MathUtils.randomInt(1, d2 - 1) || 1;
            const isSub = Math.random() > 0.5;
            const op = isSub ? '-' : '+';

            const exprLatex = `\\left(-\\frac{1}{${baseD}}\\right)^{${exp}} ${op} \\frac{${n2}}{${d2}}`;
            
            const lcd = this.lcm(expResD, d2);
            const ext1 = expResN * (lcd / expResD);
            const ext2 = n2 * (lcd / d2);
            const finalRes = isSub ? ext1 - ext2 : ext1 + ext2;
            const simp = this.simplify(finalRes, lcd);

            return {
                renderData: { latex: exprLatex, description: lang === 'sv' ? "Förenkla och beräkna." : "Simplify and evaluate.", answerType: 'fraction' },
                token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' ? "Nu kombinerar vi potenser, bråk och negativa tal. Uttrycket är:" : "Now we combine powers, fractions, and negative numbers. The expression is:",
                        latex: exprLatex
                    },
                    {
                        text: lang === 'sv' ? `Steg 1: Potensen räknas först. Eftersom exponenten är ${exp} (ett ${isCube ? 'udda' : 'jämnt'} tal), kommer minuset att ${isCube ? 'finnas kvar' : 'försvinna'}.` : `Step 1: Calculate the power first. Since the exponent is ${exp} (an ${isCube ? 'odd' : 'even'} number), the minus sign will ${isCube ? 'remain' : 'disappear'}.`,
                        latex: `\\mathbf{\\frac{${expResN}}{${expResD}}} ${op} \\frac{${n2}}{${d2}}`
                    },
                    {
                        text: lang === 'sv' ? `Steg 2: Hitta minsta gemensamma nämnare (MGN) för ${expResD} och ${d2}, vilket är ${lcd}. Förläng bråken.` : `Step 2: Find the least common denominator (LCD) for ${expResD} and ${d2}, which is ${lcd}. Extend the fractions.`,
                        latex: `\\frac{${ext1}}{${lcd}} ${op} \\frac{${ext2}}{${lcd}}`
                    },
                    {
                        text: lang === 'sv' ? `Steg 3: Räkna ut täljaren: ${ext1} ${op} ${ext2} = ${finalRes}.` : `Step 3: Calculate the numerator: ${ext1} ${op} ${ext2} = ${finalRes}.`,
                        latex: `\\frac{\\mathbf{${finalRes}}}{${lcd}}`
                    },
                    { text: lang === 'sv' ? "Svar (förkortat):" : "Answer (simplified):", latex: `\\frac{${simp.n}}{${simp.d}}` }
                ]
            };
        }

        // frac_square_result: (A +/- B)^2
        const pairs = [
            [2, 4], [2, 8], [4, 8], 
            [2, 10], [5, 10], 
            [2, 6], [3, 6],
            [2, 5], [2, 3]
        ];
        let [dA, dB] = MathUtils.randomChoice(pairs);
        if (Math.random() > 0.5) [dA, dB] = [dB, dA];

        const lcdAB = this.lcm(dA, dB);
        let nA = MathUtils.randomInt(1, dA - 1) || 1;
        let nB = MathUtils.randomInt(1, dB - 1) || 1;
        
        let extA = nA * (lcdAB / dA);
        let extB = nB * (lcdAB / dB);
        
        let opParen = Math.random() > 0.5 ? '+' : '-';
        let sumAB = opParen === '+' ? extA + extB : extA - extB;
        if (sumAB <= 0) {
            sumAB = Math.abs(sumAB);
            [nA, nB] = [nB, nA];
            [dA, dB] = [dB, dA];
            [extA, extB] = [extB, extA];
            if (sumAB === 0) {
                sumAB = extA + extB;
                opParen = '+';
            }
        }
        
        const exprLatex = `\\left(\\frac{${nA}}{${dA}} ${opParen} \\frac{${nB}}{${dB}}\\right)^2`;
        const simpAB = this.simplify(sumAB, lcdAB);
        const finalN = Math.pow(simpAB.n, 2);
        const finalD = Math.pow(simpAB.d, 2);
        const finalSimp = this.simplify(finalN, finalD);

        return {
            renderData: { latex: exprLatex, description: lang === 'sv' ? "Beräkna." : "Evaluate.", answerType: 'fraction' },
            token: this.toBase64(`${finalSimp.n}/${finalSimp.d}`), variationKey: v, type: 'calculate',
            clues: [
                {
                    text: lang === 'sv' ? "Här har vi en potens utanför en parentes. Parentesen går alltid först." : "Here we have a power outside a parenthesis. The parenthesis always goes first.",
                    latex: exprLatex
                },
                {
                    text: lang === 'sv' ? `Steg 1: Hitta MGN (${lcdAB}) och beräkna bråken inuti parentesen.` : `Step 1: Find the LCD (${lcdAB}) and calculate the fractions inside the parenthesis.`,
                    latex: `\\left(\\mathbf{\\frac{${simpAB.n}}{${simpAB.d}}}\\right)^2`
                },
                {
                    text: lang === 'sv' ? `Steg 2: Upphöj nu det nya bråket till 2. Täljare: ${simpAB.n}² = ${finalN}. Nämnare: ${simpAB.d}² = ${finalD}.` : `Step 2: Now raise the new fraction to the power of 2. Numerator: ${simpAB.n}² = ${finalN}. Denominator: ${simpAB.d}² = ${finalD}.`,
                    latex: `\\frac{\\mathbf{${finalN}}}{\\mathbf{${finalD}}}`
                },
                { text: lang === 'sv' ? "Svar i enklaste form:" : "Answer in simplest form:", latex: `\\frac{${finalSimp.n}}{${finalSimp.d}}` }
            ]
        };
    }
}