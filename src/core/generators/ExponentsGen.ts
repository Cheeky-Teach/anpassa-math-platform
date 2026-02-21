import { MathUtils } from '../utils/MathUtils.js';

export class ExponentsGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to Level 2
        if (level === 1 && options.hideConcept && options.exclude?.includes('foundations_calc')) {
            return this.level2_PowersOfTen(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_Foundations(lang, undefined, options);
            case 2: return this.level2_PowersOfTen(lang, undefined, options);
            case 3: return this.level3_ScientificNotation(lang, undefined, options);
            case 4: return this.level4_SquareRoots(lang, undefined, options);
            case 5: return this.level5_LawsBasic(lang, undefined, options);
            case 6: return this.level6_LawsAdvanced(lang, undefined, options);
            default: return this.level1_Foundations(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to preserve Studio compatibility.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'zero_rule':
            case 'power_of_one':
            case 'foundations_calc':
            case 'foundations_spot_the_lie':
                return this.level1_Foundations(lang, key);
            case 'ten_positive_exponent':
            case 'ten_negative_exponent':
            case 'ten_inverse_counting':
                return this.level2_PowersOfTen(lang, key);
            case 'scientific_to_form':
            case 'scientific_missing_mantissa':
            case 'scientific_missing_exponent':
                return this.level3_ScientificNotation(lang, key);
            case 'root_calc':
            case 'root_inverse_algebra':
                return this.level4_SquareRoots(lang, key);
            case 'law_multiplication':
            case 'law_division':
            case 'law_addition_trap':
            case 'law_mult_div_combined':
                return this.level5_LawsBasic(lang, key);
            case 'law_power_of_power':
            case 'law_inverse_algebra':
            case 'law_all_combined':
                return this.level6_LawsAdvanced(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    // --- PRIVATE UTILITIES ---
    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private toSup(text: string | number): string {
        const str = String(text);
        const map: any = { 
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', 
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' 
        };
        return str.split('').map(c => map[c] || c).join('');
    }

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[0].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: FOUNDATIONS ---
    private level1_Foundations(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'zero_rule', type: 'concept' },
            { key: 'power_of_one', type: 'concept' },
            { key: 'foundations_calc', type: 'calculate' },
            { key: 'foundations_spot_the_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'zero_rule' || v === 'power_of_one') {
            const isZero = v === 'zero_rule';
            const base = MathUtils.randomInt(5, 500);
            const ansValue = isZero ? "1" : base.toString();
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna värdet av uttrycket." : "Calculate the value of the expression.",
                    latex: isZero ? `${base}^{0}` : `${base}^{1}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ansValue), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? (isZero ? "Steg 1: Det finns en matematisk regel som säger att alla tal (utom noll) upphöjda till 0 blir 1." : "Step 1: There is a mathematical rule stating that any number (except zero) raised to 0 becomes 1.") : (isZero ? "Step 1: There is a rule that any number raised to 0 is 1." : "Step 1: Any number raised to 1 is just the number itself."), latex: isZero ? "x^0 = 1" : "x^1 = x" },
                    { text: lang === 'sv' ? "Detta beror på hur mönstret i potenser fungerar när vi dividerar bort basen steg för steg." : "This is due to the pattern of powers when we divide away the base step-by-step." },
                    { text: lang === 'sv' ? `Resultatet blir därför ${ansValue}.` : `The result is therefore ${ansValue}.` },
                    { text: lang === 'sv' ? `Svar: ${ansValue}` : `Answer: ${ansValue}` }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        if (v === 'foundations_spot_the_lie') {
            const b = MathUtils.randomInt(2, 5), e = MathUtils.randomInt(2, 3);
            const val = Math.pow(b, e);
            const t1 = `${b}${this.toSup(e)} = ${val}`, t2 = `${MathUtils.randomInt(10, 99)}${this.toSup(0)} = 1`, lie = `${b}${this.toSup(e)} = ${b * e}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([t1, t2, lie])
                },
                token: this.toBase64(lie), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: En potens betyder upprepad multiplikation av basen." : "Step 1: A power means repeated multiplication of the base." },
                    { text: lang === 'sv' ? `Steg 2: Exponenten ${e} talar om att vi ska multiplicera basen ${b} med sig själv ${e} gånger.` : `Step 2: The exponent ${e} tells us to multiply the base ${b} by itself ${e} times.` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${b}^{${e}} = ` + Array(e).fill(b).join(' · ') + ` = ${val}` },
                    { text: lang === 'sv' ? "Ett vanligt fel är att multiplicera basen med exponenten, vilket ger ett felaktigt svar." : "A common error is multiplying the base by the exponent, which gives an incorrect answer." },
                    { text: lang === 'sv' ? `Svar: ${lie}` : `Answer: ${lie}` }
                ]
            };
        }

        const base = MathUtils.randomInt(2, 10), exp = MathUtils.randomInt(2, 4);
        const ans = Math.pow(base, exp);
        return {
            renderData: { description: lang === 'sv' ? "Beräkna potensen." : "Calculate the power.", latex: `${base}^{${exp}}`, answerType: 'numeric' },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Identifiera basen (${base}) och exponenten (${exp}).` : `Step 1: Identify the base (${base}) and the exponent (${exp}).` },
                { text: lang === 'sv' ? `Steg 2: Multiplicera basen med sig själv ${exp} gånger.` : `Step 2: Multiply the base by itself ${exp} times.` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: Array(exp).fill(base).join(' · ') + ` = ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 2: POWERS OF 10 ---
    private level2_PowersOfTen(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'ten_positive_exponent', type: 'calculate' },
            { key: 'ten_negative_exponent', type: 'calculate' },
            { key: 'ten_inverse_counting', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const p = MathUtils.randomInt(1, 6);

        if (v === 'ten_negative_exponent') {
            const ansStr = (1 / Math.pow(10, p)).toString();
            return {
                renderData: { description: lang === 'sv' ? "Skriv som ett decimaltal." : "Write as a decimal number.", latex: `10^{-${p}}`, answerType: 'numeric' },
                token: this.toBase64(ansStr), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: En negativ exponent betyder att vi dividerar 1 med basen upphöjt till samma tal fast positivt." : "Step 1: A negative exponent means we divide 1 by the base raised to the same positive power.", latex: "10^{-n} = \\frac{1}{10^n}" },
                    { text: lang === 'sv' ? `Steg 2: Skriv om uttrycket som ett bråk.` : `Step 2: Rewrite the expression as a fraction.`, latex: `\\frac{1}{10^{${p}}}` },
                    { text: lang === 'sv' ? `Steg 3: Beräkna nämnaren. 10 upphöjt till ${p} är 1 följt av ${p} nollor.` : `Step 3: Calculate the denominator. 10 to the power of ${p} is 1 followed by ${p} zeros.`, latex: `\\frac{1}{${Math.pow(10, p)}}` },
                    { text: lang === 'sv' ? `Steg 4: Omvandla bråket till decimaltal. Det ger en etta på den ${p}:e decimalplatsen.` : `Step 4: Convert the fraction to a decimal. This gives a one at the ${p}:th decimal place.` },
                    { text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}` }
                ]
            };
        }

        if (v === 'ten_inverse_counting') {
            const zeros = MathUtils.randomInt(2, 7);
            const num = "1" + "0".repeat(zeros);
            return {
                renderData: { description: lang === 'sv' ? `Skriv ${num} som en tiopotens.` : `Write ${num} as a power of ten.`, latex: `10^{?} = ${num}`, answerType: 'structured_power' },
                token: this.toBase64(`10^${zeros}`), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: En tiopotens med en etta följt av nollor har alltid basen 10." : "Step 1: A power of ten with a one followed by zeros always has a base of 10." },
                    { text: lang === 'sv' ? "Steg 2: Räkna hur många nollor som står efter ettan." : "Step 2: Count how many zeros follow the one." },
                    { text: lang === 'sv' ? `Det är ${zeros} nollor, vilket betyder att exponenten är ${zeros}.` : `There are ${zeros} zeros, which means the exponent is ${zeros}.` },
                    { text: lang === 'sv' ? `Svar: 10${this.toSup(zeros)}` : `Answer: 10${this.toSup(zeros)}` }
                ]
            };
        }

        const ans = Math.pow(10, p);
        return {
            renderData: { description: lang === 'sv' ? "Skriv tiopotensen som ett heltal." : "Write the power of ten as an integer.", latex: `10^{${p}}`, answerType: 'numeric' },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Exponenten ${p} talar om hur många gånger vi ska multiplicera 10 med sig självt.` : `Step 1: The exponent ${p} tells us how many times to multiply 10 by itself.` },
                { text: lang === 'sv' ? "Steg 2: För tiopotenser innebär detta helt enkelt en etta följt av lika många nollor som exponenten anger." : "Step 2: For powers of ten, this simply means a one followed by as many zeros as the exponent indicates." },
                { text: lang === 'sv' ? `Uträkning: En etta följt av ${p} nollor.` : `Calculation: A one followed by ${p} zeros.`, latex: `10^{${p}} \\rightarrow ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 3: SCIENTIFIC NOTATION ---
    private level3_ScientificNotation(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'scientific_to_form', type: 'calculate' },
            { key: 'scientific_missing_mantissa', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const mantissa = (MathUtils.randomInt(11, 99) / 10), exponent = MathUtils.randomInt(3, 7);
        const number = mantissa * Math.pow(10, exponent);

        if (v === 'scientific_to_form') {
            return {
                renderData: { description: lang === 'sv' ? `Skriv ${number.toLocaleString(lang)} i grundpotensform.` : `Write ${number.toLocaleString(lang)} in scientific notation.`, answerType: 'structured_scientific' },
                token: this.toBase64(`${mantissa}*10^${exponent}`), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Grundpotensform skrivs alltid som ett tal mellan 1 och 10 multiplicerat med en tiopotens." : "Step 1: Scientific notation is always written as a number between 1 and 10 multiplied by a power of ten.", latex: "a · 10^n" },
                    { text: lang === 'sv' ? "Steg 2: Flytta decimaltecknet tills bara en siffra (förutom noll) står till vänster." : "Step 2: Move the decimal point until only one non-zero digit is to the left.", latex: `${mantissa}` },
                    { text: lang === 'sv' ? `Steg 3: Räkna hur många steg du flyttade kommat. Det var ${exponent} steg.` : `Step 3: Count how many steps you moved the point. It was ${exponent} steps.` },
                    { text: lang === 'sv' ? `Svar: ${mantissa} · 10${this.toSup(exponent)}` : `Answer: ${mantissa} · 10${this.toSup(exponent)}` }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? "Vilket värde på 'a' saknas?" : "Which value of 'a' is missing?", latex: `${number.toLocaleString(lang)} = a · 10^{${exponent}}`, answerType: 'numeric' },
            token: this.toBase64(mantissa.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: I uttrycket a · 10ⁿ är 'a' mantissan, vilket måste vara ett tal från 1 till (men mindre än) 10." : "Step 1: In the expression a · 10ⁿ, 'a' is the mantissa, which must be a number from 1 to (but less than) 10." },
                { text: lang === 'sv' ? `Steg 2: Dividera det stora talet med tiopotensen 10 upphöjt till ${exponent}.` : `Step 2: Divide the large number by the power of ten, 10 to the power of ${exponent}.` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${number} / ${Math.pow(10, exponent)} = ${mantissa}` },
                { text: lang === 'sv' ? `Svar: ${mantissa}` : `Answer: ${mantissa}` }
            ]
        };
    }

    // --- LEVEL 4: SQUARE ROOTS ---
    private level4_SquareRoots(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [{ key: 'root_calc', type: 'calculate' }, { key: 'root_inverse_algebra', type: 'calculate' }];
        const v = variationKey || this.getVariation(pool, options);
        const base = MathUtils.randomInt(2, 12), square = base * base;

        if (v === 'root_inverse_algebra') {
            return {
                renderData: { description: lang === 'sv' ? "Lös ekvationen (hitta x)." : "Solve the equation (find x).", latex: `x^2 = ${square}`, answerType: 'numeric' },
                token: this.toBase64(base.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Motsatsen till att upphöja något till 2 är att ta kvadratroten." : "Step 1: The opposite of squaring something is taking the square root." },
                    { text: lang === 'sv' ? `Steg 2: Vi letar efter ett tal som multiplicerat med sig självt blir ${square}.` : `Step 2: We are looking for a number that, when multiplied by itself, equals ${square}.` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\sqrt{${square}} = ${base}` },
                    { text: lang === 'sv' ? `Svar: ${base}` : `Answer: ${base}` }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? "Beräkna kvadratroten." : "Calculate the square root.", latex: `\\sqrt{${square}}`, answerType: 'numeric' },
            token: this.toBase64(base.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Kvadratroten ur ${square} är det positiva tal som multiplicerat med sig självt blir ${square}.` : `Step 1: The square root of ${square} is the positive number that, when multiplied by itself, equals ${square}.` },
                { text: lang === 'sv' ? "Tänk: Vad · Vad = " + square + "?" : "Think: What · What = " + square + "?" },
                { text: lang === 'sv' ? `Eftersom ${base} · ${base} = ${square}, är roten ${base}.` : `Since ${base} · ${base} = ${square}, the root is ${base}.` },
                { text: lang === 'sv' ? `Svar: ${base}` : `Answer: ${base}` }
            ]
        };
    }

    // --- LEVEL 5: LAWS BASIC ---
    private level5_LawsBasic(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'law_multiplication', type: 'calculate' },
            { key: 'law_division', type: 'calculate' },
            { key: 'law_mult_div_combined', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(2, 10), b = MathUtils.randomInt(2, 10);

        if (v === 'law_multiplication') {
            return {
                renderData: { description: lang === 'sv' ? "Förenkla till en enda potens." : "Simplify to a single power.", latex: `x^{${a}} · x^{${b}}`, answerType: 'structured_power' },
                token: this.toBase64(`x^${a + b}`), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Vid multiplikation av potenser med samma bas ska exponenterna adderas." : "Step 1: When multiplying powers with the same base, the exponents should be added.", latex: "x^a · x^b = x^{a+b}" },
                    { text: lang === 'sv' ? `Steg 2: Addera ${a} och ${b}.` : `Step 2: Add ${a} and ${b}.`, latex: `${a} + ${b} = ${a+b}` },
                    { text: lang === 'sv' ? `Svar: x${this.toSup(a+b)}` : `Answer: x${this.toSup(a+b)}` }
                ]
            };
        }

        if (v === 'law_division') {
            const big = a + b;
            return {
                renderData: { description: lang === 'sv' ? "Förenkla till en enda potens." : "Simplify to a single power.", latex: `\\frac{x^{${big}}}{x^{${a}}}`, answerType: 'structured_power' },
                token: this.toBase64(`x^${b}`), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Vid division av potenser med samma bas ska nämnarens exponent subtraheras från täljarens." : "Step 1: In division of powers with the same base, the denominator's exponent is subtracted from the numerator's.", latex: "\\frac{x^a}{x^b} = x^{a-b}" },
                    { text: lang === 'sv' ? `Steg 2: Subtrahera: ${big} - ${a}.` : `Step 2: Subtract: ${big} - ${a}.`, latex: `${big} - ${a} = ${b}` },
                    { text: lang === 'sv' ? `Svar: x${this.toSup(b)}` : `Answer: x${this.toSup(b)}` }
                ]
            };
        }

        const n1 = MathUtils.randomInt(2, 5), n2 = MathUtils.randomInt(2, 5), d1 = MathUtils.randomInt(2, 4);
        const resExp = n1 + n2 - d1;
        return {
            renderData: { description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", latex: `\\frac{x^{${n1}} · x^{${n2}}}{x^{${d1}}}`, answerType: 'structured_power' },
            token: this.toBase64(`x^${resExp}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Förenkla täljaren först genom att addera exponenterna." : "Step 1: Simplify the numerator first by adding the exponents.", latex: `x^{${n1} + ${n2}} = x^{${n1+n2}}` },
                { text: lang === 'sv' ? "Steg 2: Subtrahera nu nämnarens exponent från den nya täljaren." : "Step 2: Now subtract the denominator's exponent from the new numerator.", latex: `${n1+n2} - ${d1} = ${resExp}` },
                { text: lang === 'sv' ? `Svar: x${this.toSup(resExp)}` : `Answer: x${this.toSup(resExp)}` }
            ]
        };
    }

    // --- LEVEL 6: LAWS ADVANCED ---
    private level6_LawsAdvanced(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [{ key: 'law_power_of_power', type: 'calculate' }, { key: 'law_all_combined', type: 'calculate' }];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 5);

        if (v === 'law_power_of_power') {
            return {
                renderData: { description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", latex: `(x^{${a}})^{${b}}`, answerType: 'structured_power' },
                token: this.toBase64(`x^${a * b}`), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Vid en potens av en potens ska exponenterna multipliceras." : "Step 1: For a power of a power, the exponents must be multiplied.", latex: "(x^a)^b = x^{a · b}" },
                    { text: lang === 'sv' ? `Steg 2: Multiplicera ${a} med ${b}.` : `Step 2: Multiply ${a} by ${b}.`, latex: `${a} · ${b} = ${a*b}` },
                    { text: lang === 'sv' ? `Svar: x${this.toSup(a*b)}` : `Answer: x${this.toSup(a*b)}` }
                ]
            };
        }

        const e1 = MathUtils.randomInt(2, 3), p1 = MathUtils.randomInt(2, 3), e2 = MathUtils.randomInt(2, 4);
        const resExp = (e1 * p1) + e2;
        return {
            renderData: { description: lang === 'sv' ? "Förenkla till en enda potens." : "Simplify to a single power.", latex: `(x^{${e1}})^{${p1}} · x^{${e2}}`, answerType: 'structured_power' },
            token: this.toBase64(`x^${resExp}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Börja med att förenkla parentesen (potens av en potens) genom multiplikation." : "Step 1: Start by simplifying the parentheses (power of a power) using multiplication.", latex: `x^{${e1} · ${p1}} = x^{${e1*p1}}` },
                { text: lang === 'sv' ? "Steg 2: Addera nu den andra exponenten pga multiplikationen mellan baserna." : "Step 2: Now add the other exponent due to the multiplication between the bases.", latex: `${e1*p1} + ${e2} = ${resExp}` },
                { text: lang === 'sv' ? `Svar: x${this.toSup(resExp)}` : `Answer: x${this.toSup(resExp)}` }
            ]
        };
    }
}