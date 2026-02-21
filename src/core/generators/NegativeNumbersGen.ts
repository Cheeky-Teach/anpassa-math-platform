import { MathUtils } from '../utils/MathUtils.js';

export class NegativeNumbersGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to calculation fluency
        if (level === 1 && options.hideConcept && options.exclude?.includes('theory_number_line')) {
            return this.level2_AddSubFluency(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_Foundations(lang, undefined, options);
            case 2: return this.level2_AddSubFluency(lang, undefined, options);
            case 3: return this.level3_Multiplication(lang, undefined, options);
            case 4: return this.level4_Division(lang, undefined, options);
            case 5: return this.level5_Mixed(lang, options);
            default: return this.level1_Foundations(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Must match skillBuckets.js exactly to prevent breakage.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'theory_number_line':
            case 'theory_sign_dominance':
            case 'theory_spot_lie':
                return this.level1_Foundations(lang, key);
            case 'fluency_chain_4':
            case 'fluency_chain_5':
            case 'fluency_double_neg':
            case 'fluency_plus_neg':
            case 'fluency_transform_match':
                return this.level2_AddSubFluency(lang, key);
            case 'mult_same_sign':
            case 'mult_diff_sign':
            case 'mult_inverse_missing':
            case 'mult_chain':
                return this.level3_Multiplication(lang, key);
            case 'div_same_sign':
            case 'div_diff_sign':
            case 'div_check_logic':
                return this.level4_Division(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    /**
     * Formats negative numbers with parentheses for LaTeX consistency
     */
    private p(n: number): string {
        return n < 0 ? `(${n})` : `${n}`;
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

    // --- LEVEL 1: FOUNDATIONS ---
    private level1_Foundations(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'theory_number_line', type: 'calculate' },
            { key: 'theory_sign_dominance', type: 'concept' },
            { key: 'theory_spot_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'theory_number_line') {
            const start = MathUtils.randomInt(-8, 5);
            const steps = MathUtils.randomInt(3, 7);
            const isRight = Math.random() > 0.5;
            const ans = isRight ? start + steps : start - steps;
            const dirSv = isRight ? "HÖGER (större)" : "VÄNSTER (mindre)";
            const dirEn = isRight ? "RIGHT (larger)" : "LEFT (smaller)";

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Du står på talet ${start} på tallinjen. Om du går ${steps} steg åt ${dirSv}, på vilket tal hamnar du?` 
                        : `You are at ${start} on the number line. If you move ${steps} steps to the ${dirEn}, what number do you land on?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Lokalisera startpunkten ${start} på tallinjen.` : `Step 1: Locate the starting point ${start} on the number line.` },
                    { text: lang === 'sv' ? `Steg 2: Bestäm riktningen. Att gå åt höger är addition (+), att gå åt vänster är subtraktion (-).` : `Step 2: Determine the direction. Moving right is addition (+), moving left is subtraction (-).` },
                    { text: lang === 'sv' ? `Steg 3: Eftersom vi går åt ${isRight ? 'höger' : 'vänster'} ställer vi upp uträkningen.` : `Step 3: Since we are moving ${isRight ? 'right' : 'left'}, we set up the calculation.`, latex: `${start} ${isRight ? '+' : '-'} ${steps}` },
                    { text: lang === 'sv' ? `Steg 4: Räkna ut slutpositionen.` : `Step 4: Calculate the final position.`, latex: `${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        if (v === 'theory_sign_dominance') {
            const pos = MathUtils.randomInt(10, 25);
            const neg = MathUtils.randomInt(-30, -11);
            const isNegStronger = Math.abs(neg) > pos;
            const ans = isNegStronger ? (lang === 'sv' ? "Negativt" : "Negative") : (lang === 'sv' ? "Positivt" : "Positive");

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Utan att räkna ut svaret, avgör om $${pos} + (${neg})$ blir positivt eller negativt.` 
                        : `Without calculating the answer, determine if $${pos} + (${neg})$ will be positive or negative.`,
                    answerType: 'multiple_choice', options: lang === 'sv' ? ["Positivt", "Negativt"] : ["Positive", "Negative"]
                },
                token: this.toBase64(ans), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Jämför talens avstånd från noll (deras absoluta värden)." : "Step 1: Compare the numbers' distance from zero (their absolute values)." },
                    { text: lang === 'sv' ? `Det positiva talet är ${pos} steg från noll. Det negativa talet är ${Math.abs(neg)} steg från noll.` : `The positive number is ${pos} steps from zero. The negative number is ${Math.abs(neg)} steps from zero.` },
                    { text: lang === 'sv' ? "Steg 2: Det tal som är längst ifrån noll 'bestämmer' tecknet på svaret." : "Step 2: The number furthest from zero 'determines' the sign of the answer." },
                    { text: lang === 'sv' ? `Eftersom ${Math.abs(neg)} > ${pos} är det negativa talet starkast.` : `Since ${Math.abs(neg)} > ${pos}, the negative number is stronger.` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const n1 = MathUtils.randomInt(-20, -10), n2 = MathUtils.randomInt(-9, -2);
        const lie = `${n1} > ${n2}`;
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                answerType: 'multiple_choice', options: MathUtils.shuffle([`${n2} > ${n1}`, lie, "-1 < 0", "0 > -5"])
            },
            token: this.toBase64(lie), variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Steg 1: På tallinjen är talen mindre ju längre till vänster de står." : "Step 1: On the number line, numbers are smaller the further left they are." },
                { text: lang === 'sv' ? `Steg 2: Ett tal som -20 står längre till vänster än -9.` : `Step 2: A number like -20 is further left than -9.` },
                { text: lang === 'sv' ? `Därför är -20 MINDRE än -9.` : `Therefore, -20 is SMALLER than -9.`, latex: "-20 < -9" },
                { text: lang === 'sv' ? `Svar: ${lie}` : `Answer: ${lie}` }
            ]
        };
    }

    // --- LEVEL 2: ADD/SUB FLUENCY ---
    private level2_AddSubFluency(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'fluency_chain_4', type: 'calculate' },
            { key: 'fluency_double_neg', type: 'calculate' },
            { key: 'fluency_transform_match', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'fluency_chain_4') {
            const a = MathUtils.randomInt(-5, 5), b = MathUtils.randomInt(-5, 5);
            const c = MathUtils.randomInt(-5, 5), d = MathUtils.randomInt(-5, 5);
            const res1 = a + b, res2 = res1 - c, res3 = res2 + d;
            
            return {
                renderData: {
                    latex: `${this.p(a)} + ${this.p(b)} - ${this.p(c)} + ${this.p(d)}`,
                    description: lang === 'sv' ? "Beräkna uttryckets värde steg för steg." : "Calculate the value step by step.",
                    answerType: 'numeric'
                },
                token: this.toBase64(res3.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Vi räknar från vänster till höger. Börja med de två första talen." : "Step 1: We calculate from left to right. Start with the first two numbers.", latex: `${this.p(a)} + ${this.p(b)} = ${res1}` },
                    { text: lang === 'sv' ? "Steg 2: Ta resultatet och utför nästa operation." : "Step 2: Take the result and perform the next operation.", latex: `${res1} - ${this.p(c)} = ${res2}` },
                    { text: lang === 'sv' ? "Steg 3: Utför den sista operationen." : "Step 3: Perform the final operation.", latex: `${res2} + ${this.p(d)} = ${res3}` },
                    { text: lang === 'sv' ? `Svar: ${res3}` : `Answer: ${res3}` }
                ]
            };
        }

        if (v === 'fluency_transform_match') {
            const a = MathUtils.randomInt(-10, 10), b = MathUtils.randomInt(2, 12);
            const correct = `${a} + ${b}`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilket uttryck betyder samma sak som $${a} - (-${b})$?` : `Which expression means the same as $${a} - (-${b})$?`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, `${a} - ${b}`, `-${a} + ${b}`])
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: När två minustecken står direkt intill varandra (med eller utan parentes) förvandlas de till ett plus." : "Step 1: When two minus signs are directly next to each other, they turn into a plus." },
                    { text: lang === 'sv' ? "Regel: minus minus blir plus." : "Rule: minus minus becomes plus.", latex: "-(-) \\rightarrow +" },
                    { text: lang === 'sv' ? `Därför blir ${a} - (-${b}) till ${a} + ${b}.` : `Therefore, ${a} - (-${b}) becomes ${a} + ${b}.` },
                    { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}` }
                ]
            };
        }

        const a = MathUtils.randomInt(-10, 10), b = MathUtils.randomInt(5, 15);
        const ans = a + b;
        return {
            renderData: { latex: `${a} - (-${b})`, description: lang === 'sv' ? "Förenkla tecknen och räkna ut svaret." : "Simplify the signs and calculate the answer.", answerType: 'numeric' },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Förenkla de dubbla minustecknen i mitten till ett plustecken." : "Step 1: Simplify the double minus signs in the middle to a plus sign." },
                { text: lang === 'sv' ? "Skriv om uttrycket:" : "Rewrite the expression:", latex: `${a} + ${b}` },
                { text: lang === 'sv' ? "Steg 2: Utför additionen." : "Step 2: Perform the addition.", latex: `${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 3: MULTIPLICATION ---
    private level3_Multiplication(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mult_same_sign', type: 'calculate' },
            { key: 'mult_diff_sign', type: 'calculate' },
            { key: 'mult_chain', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'mult_chain') {
            const f1 = MathUtils.randomInt(-3, 3) || 1;
            const f2 = MathUtils.randomInt(-3, 3) || 1;
            const f3 = MathUtils.randomInt(-3, 3) || 1;
            const res1 = f1 * f2, res2 = res1 * f3;
            
            return {
                renderData: {
                    latex: `${this.p(f1)} · ${this.p(f2)} · ${this.p(f3)}`,
                    description: lang === 'sv' ? "Beräkna produkten." : "Calculate the product.",
                    answerType: 'numeric'
                },
                token: this.toBase64(res2.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Multiplicera de två första faktorerna." : "Step 1: Multiply the first two factors." },
                    { text: lang === 'sv' ? "Tänk på teckenregeln (lika tecken = plus, olika = minus)." : "Remember the sign rule (same sign = plus, different = minus).", latex: `${this.p(f1)} · ${this.p(f2)} = ${res1}` },
                    { text: lang === 'sv' ? "Steg 2: Multiplicera resultatet med den sista faktorn." : "Step 2: Multiply the result by the last factor.", latex: `${res1} · ${this.p(f3)} = ${res2}` },
                    { text: lang === 'sv' ? `Svar: ${res2}` : `Answer: ${res2}` }
                ]
            };
        }

        const aVal = MathUtils.randomInt(2, 9), bVal = MathUtils.randomInt(2, 9);
        const isSame = v === 'mult_same_sign';
        const a = aVal * -1;
        const b = isSame ? bVal * -1 : bVal;
        const ans = a * b;

        return {
            renderData: { latex: `${this.p(a)} · ${this.p(b)}`, description: lang === 'sv' ? "Multiplicera talen." : "Multiply the numbers.", answerType: 'numeric' },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Multiplicera siffervärdena först, utan att tänka på tecknen." : "Step 1: Multiply the numerical values first, ignoring the signs.", latex: `${Math.abs(a)} · ${Math.abs(b)} = ${Math.abs(ans)}` },
                { text: lang === 'sv' ? "Steg 2: Bestäm tecknet. Om båda talen har samma tecken blir svaret positivt. Om de har olika tecken blir det negativt." : "Step 2: Determine the sign. If both numbers have the same sign, the answer is positive. If they have different signs, it is negative." },
                { text: lang === 'sv' ? (isSame ? "Här är båda negativa, så svaret blir positivt (+)." : "Här är ett negativt och ett positivt, så svaret blir negativt (-).") : (isSame ? "Both are negative, so the answer is positive (+)." : "One is negative and one is positive, so the answer is negative (-).") },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 4: DIVISION ---
    private level4_Division(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'div_diff_sign', type: 'calculate' },
            { key: 'div_check_logic', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const bVal = MathUtils.randomInt(2, 8), qVal = MathUtils.randomInt(2, 8);
        const a = bVal * qVal * -1; // Force negative numerator
        const b = bVal; 
        const ans = a / b;

        if (v === 'div_check_logic') {
            const correct = `${this.p(ans)} · ${this.p(b)} = ${a}`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilket multiplikationssamband bevisar att $${a} / ${b} = ${ans}$?` : `Which multiplication proves that $${a} / ${b} = ${ans}$?`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, `${ans} + ${b} = ${a}`, `${a} · ${b} = ${ans}`])
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: En division kan alltid kontrolleras genom att multiplicera svaret (kvoten) med nämnaren." : "Step 1: A division can always be checked by multiplying the answer (quotient) by the denominator." },
                    { text: lang === 'sv' ? "Steg 2: Om $a / b = c$, så måste $c · b = a$." : "Step 2: If $a / b = c$, then $c · b = a$." },
                    { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}` }
                ]
            };
        }

        return {
            renderData: { latex: `\\frac{${a}}{${b}}`, description: lang === 'sv' ? "Beräkna kvoten." : "Calculate the quotient.", answerType: 'numeric' },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Dividera siffervärdena." : "Step 1: Divide the numerical values.", latex: `${Math.abs(a)} / ${Math.abs(b)} = ${Math.abs(ans)}` },
                { text: lang === 'sv' ? "Steg 2: Använd teckenregeln (samma som för multiplikation)." : "Step 2: Use the sign rule (same as for multiplication)." },
                { text: lang === 'sv' ? "Ett negativt tal delat med ett positivt tal blir negativt." : "A negative number divided by a positive number is negative.", latex: "(-) / (+) = -" },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    private level5_Mixed(lang: string, options: any): any {
        const lvl = MathUtils.randomInt(1, 4);
        return this.generate(lvl, lang, options);
    }
}