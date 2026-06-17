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
            default: questionData = this.level1_SameDenom(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
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
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private simplify(n: number, d: number) {
        const common = MathUtils.gcd(n, d);
        return { n: n / common, d: d / common, gcd: common };
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
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: SAME DENOMINATORS ---
    private level1_SameDenom(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'add_calc', type: 'calculate' },
            { key: 'sub_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSub = v === 'sub_calc';

        const d = MathUtils.randomInt(4, 12);
        const n1 = MathUtils.randomInt(2, d - 1);
        const n2 = isSub ? MathUtils.randomInt(1, n1 - 1) : MathUtils.randomInt(1, Math.floor(d / 2));
        
        const rawRes = isSub ? n1 - n2 : n1 + n2;
        const simp = this.simplify(rawRes, d);
        const op = isSub ? '-' : '+';

        const clues = [
            {
                text: lang === 'sv' 
                    ? `När de nedre siffrorna (nämnarna) är likadana rör vi dem inte. Vi adderar eller subtraherar bara siffrorna där uppe.` 
                    : `When the bottom numbers (denominators) are identical, we leave them untouched. We only add or subtract the top numbers.`,
                latex: `\\frac{${n1}}{${d}} ${op} \\frac{${n2}}{${d}}`
            },
            {
                text: lang === 'sv'
                    ? `Ställ upp täljarna tillsammans på ett och samma bråkstreck:`
                    : `Put the top numbers together over a single fraction bar:`,
                latex: `= \\frac{\\mathbf{${n1} ${op} ${n2}}}{${d}}`
            },
            {
                text: lang === 'sv'
                    ? `Räkna ut svaret där uppe: ${n1} ${op} ${n2} blir ${rawRes}.`
                    : `Calculate the top numbers: ${n1} ${op} ${n2} equals ${rawRes}.`,
                latex: `= \\frac{\\mathbf{${rawRes}}}{${d}}`
            }
        ];

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv'
                    ? `Gör bråket enklare att läsa genom att dela (förkorta) både uppe och nere med talet ${simp.gcd}.`
                    : `Make the fraction simpler to read by dividing both the top and bottom by ${simp.gcd}.`,
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
            { key: 'sub_diff_denom', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSub = v === 'sub_diff_denom';

        let d1 = MathUtils.randomInt(2, 10);
        let d2 = MathUtils.randomInt(2, 10);
        while (d1 === d2) d2 = MathUtils.randomInt(2, 10);

        const lcd = this.lcm(d1, d2);
        let f1 = lcd / d1;
        let f2 = lcd / d2;
        
        let n1 = MathUtils.randomInt(1, 3);
        let n2 = MathUtils.randomInt(1, 3);
        
        // --- IMPROVED LOGIC: Ensure positive subtraction ---
        // We compare the value of the expanded numerators (n * f)
        if (isSub) {
            // If the second fraction is larger or equal, swap the components
            if (n1 * f1 <= n2 * f2) {
                // Swap numerators
                [n1, n2] = [n2, n1];
                // Swap denominators
                [d1, d2] = [d2, d1];
                // Swap expansion factors
                [f1, f2] = [f2, f1];
                
                // Final safety: if they are exactly equal (e.g. 1/2 - 1/2), 
                // increment the first numerator to ensure a positive (not zero) result.
                if (n1 * f1 === n2 * f2) n1++;
            }
        }
        
        const ext1 = n1 * f1;
        const ext2 = n2 * f2;
        const op = isSub ? '-' : '+';
        const rawRes = isSub ? ext1 - ext2 : ext1 + ext2;
        const simp = this.simplify(rawRes, lcd);

        const clues = [
            {
                text: lang === 'sv'
                    ? `Vi kan inte addera eller subtrahera bråk när nämnarna (talen under bråkstrecket) är olika. Vi måste ändra dem så att båda får nämnaren ${lcd}.`
                    : `We cannot add or subtract fractions when the bottom numbers are different. We must change them so both get the denominator ${lcd}.`,
                latex: `\\frac{${n1}}{${d1}} ${op} \\frac{${n2}}{${d2}}`
            },
            {
                text: lang === 'sv'
                    ? `Gör om det första bråket genom att multiplicera (förlänga) både uppe och nere med ${f1}.`
                    : `Change the first fraction by multiplying both top and bottom by ${f1}.`,
                latex: `= \\frac{${n1} \\mathbf{\\cdot ${f1}}}{${d1} \\mathbf{\\cdot ${f1}}} ${op} \\frac{${n2}}{${d2}}`
            },
            {
                text: lang === 'sv'
                    ? `Gör om det andra bråket genom att multiplicera (förlänga) både uppe och nere med ${f2}.`
                    : `Change the second fraction by multiplying both top and bottom by ${f2}.`,
                latex: `= \\frac{${ext1}}{${lcd}} ${op} \\frac{${n2} \\mathbf{\\cdot ${f2}}}{${d2} \\mathbf{\\cdot ${f2}}}`
            },
            {
                text: lang === 'sv'
                    ? `Nu när de nedre siffrorna matchar kan vi sätta ihop de övre siffrorna på ett gemensamt bråkstreck:`
                    : `Now that the bottom numbers match, we can combine the top numbers over a single fraction bar:`,
                latex: `= \\frac{\\mathbf{${ext1} ${op} ${ext2}}}{${lcd}}`
            },
            {
                text: lang === 'sv'
                    ? `Räkna ut svaret där uppe: ${ext1} ${op} ${ext2} blir ${rawRes}.`
                    : `Calculate the top numbers: ${ext1} ${op} ${ext2} equals ${rawRes}.`,
                latex: `= \\frac{\\mathbf{${rawRes}}}{${lcd}}`
            }
        ];

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv'
                    ? `Gör bråket enklare genom jag delar (förkortar) täljaren och nämnaren med ${simp.gcd}.`
                    : `Make the fraction simpler by dividing both the top and bottom by ${simp.gcd}.`,
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
                text: lang === 'sv'
                    ? `Att multiplicera bråk är jätte-enkelt! Vi behöver inte ändra några nämnare. Vi multiplicerar bara rakt över: uppe med uppe och nere med nere.`
                    : `Multiplying fractions is super simple! We don't need to change any denominators. We just multiply straight across: top times top, bottom times bottom.`,
                latex: `\\frac{${n1}}{${d1}} \\cdot \\frac{${n2}}{${d2}}`
            },
            {
                text: lang === 'sv'
                    ? `Skriv ut multiplikationerna på ett och samma bråkstreck:`
                    : `Write out the multiplication paths on a unified single fraction bar:`,
                latex: `= \\frac{\\mathbf{${n1} \\cdot ${n2}}}{\\mathbf{${d1} \\cdot ${d2}}}`
            },
            {
                text: lang === 'sv'
                    ? `Räkna ut täljaren (${n1} · ${n2} = ${resN}) och nämnaren (${d1} · ${d2} = ${resD}):`
                    : `Perform the arithmetic steps for the top (${n1} · ${n2} = ${resN}) and bottom (${d1} · ${d2} = ${resD}):`,
                latex: `= \\frac{\\mathbf{${resN}}}{\\mathbf{${resD}}}`
            }
        ];

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv'
                    ? `Gör bråket enklare genom att dela täljaren och nämnaren med ${simp.gcd}.`
                    : `Make the fraction simpler by dividing both the top and bottom by ${simp.gcd}.`,
                latex: `= \\frac{${resN} \\mathbf{\\div ${simp.gcd}}}{${resD} \\mathbf{\\div ${simp.gcd}}} = \\frac{\\mathbf{${simp.n}}}{\\mathbf{${simp.d}}}`
            });
        }

        clues.push({
            text: lang === 'sv' ? `Svar: ` : `Answer: `,
            latex: `\\frac{${simp.n}}{${simp.d}}`
        });

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
                text: lang === 'sv'
                    ? `När vi delar två bråk använder vi ett smart trick: Behåll det första bråket, ändra till gånger, och vänd det andra bråket upp-och-ner.`
                    : `When dividing two fractions, we use a neat trick: Keep the first fraction unchanged, switch the operator to multiplication, and flip the second fraction upside down.`,
                latex: `\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}}`
            },
            {
                text: lang === 'sv'
                    ? `Vänd på det andra bråket så att det blir \\frac{${d2}}{${n2}} och ändra divisionstecknet till ett gångertecken:`
                    : `Flip the second fraction to get \\frac{${d2}}{${n2}} and change the division symbol to multiplication:`,
                latex: `= \\frac{${n1}}{${d1}} \\mathbf{\\cdot \\frac{${d2}}{${n2}}}`
            },
            {
                text: lang === 'sv'
                    ? `multiplicera nu rakt över: täljare med täljare (${n1} · ${d2}) och nämnare med nämnare (${d1} · ${n2}).`
                    : `Now multiply straight across: top times top (${n1} · ${d2}) and bottom times bottom (${d1} · ${n2}).`,
                latex: `= \\frac{\\mathbf{${n1} \\cdot ${d2}}}{\\mathbf{${d1} \\cdot ${n2}}} = \\frac{\\mathbf{${resN}}}{\\mathbf{${resD}}}`
            }
        ];

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv'
                    ? `Gör svaret enklare genom att dela (förkorta) både täljaren och nämnaren med ${simp.gcd}.`
                    : `Make the answer simpler by dividing both the top and bottom by ${simp.gcd}.`,
                latex: `= \\frac{${resN} \\mathbf{\\div ${simp.gcd}}}{${resD} \\mathbf{\\div ${simp.gcd}}} = \\frac{\\mathbf{${simp.n}}}{\\mathbf{${simp.d}}}`
            });
        }

        clues.push({
            text: lang === 'sv' ? `Svar: ` : `Answer: `,
            latex: `\\frac{${simp.n}}{${simp.d}}`
        });
        
        return {
            renderData: { description: lang === 'sv' ? "Beräkna kvoten. Svara i bråkform." : "Calculate the quotient.", latex: `\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}}`, answerType: 'fraction' },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, clues
        };
    }
}