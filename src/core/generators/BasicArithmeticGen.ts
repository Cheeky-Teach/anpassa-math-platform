import { MathUtils } from '../utils/MathUtils.js';

export class BasicArithmeticGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Level Jump: If Concepts are mastered, skip Concept-only early levels if applicable
        // Arithmetic levels are usually progressive, so we filter variations internally.
        switch (level) {
            case 1: return this.level1_AddSimple(lang, undefined, options);
            case 2: return this.level2_SubSimple(lang, undefined, options);
            case 3: return this.level3_Decimals(lang, undefined, options);
            case 4: return this.level4_MultEasy(lang, undefined, options);
            case 5: return this.level5_MultMedium(lang, undefined, options);
            case 6: return this.level6_MultHard(lang, undefined, options);
            case 7: return this.level7_DivEasy(lang, undefined, options);
            case 8: return this.level8_MixedIntegers(lang, options);
            case 9: return this.level9_MixedDecimals(lang, options);
            default: return this.level1_AddSimple(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Must match skillBuckets.js keys exactly.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'add_std_vertical':
            case 'add_std_horizontal':
            case 'add_missing_variable':
            case 'add_spot_the_lie':
                return this.level1_AddSimple(lang, key);
            case 'sub_std_vertical':
            case 'sub_std_horizontal':
            case 'sub_missing_variable':
                return this.level2_SubSimple(lang, key);
            case 'dec_add_vertical': 
            case 'dec_sub_vertical':
                return this.level3_Decimals(lang, key);
            case 'mult_table_std':
            case 'mult_commutative':
                return this.level4_MultEasy(lang, key);
            case 'mult_2x1_vertical':
            case 'mult_distributive':
                return this.level5_MultMedium(lang, key);
            case 'mult_decimal_std':
            case 'mult_decimal_placement':
                return this.level6_MultHard(lang, key);
            case 'div_basic_std':
            case 'div_inverse_logic':
                return this.level7_DivEasy(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    // --- PRIVATE UTILITIES ---
    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private makeVertical(top: number | string, bottom: number | string, op: string): string {
        return `\\begin{array}{r} ${top} \\\\ ${op} \\; ${bottom} \\\\ \\hline \\end{array}`;
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

    // --- LEVEL 1: ADDITION ---
    private level1_AddSimple(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'add_std_vertical', type: 'calculate' },
            { key: 'add_std_horizontal', type: 'calculate' },
            { key: 'add_missing_variable', type: 'calculate' },
            { key: 'add_spot_the_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'add_std_vertical' || v === 'add_std_horizontal') {
            const a = MathUtils.randomInt(10, 999);
            const b = MathUtils.randomInt(10, 999);
            const isVertical = v === 'add_std_vertical';
            const ans = a + b;
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna summan." : "Calculate the sum.",
                    latex: isVertical ? this.makeVertical(a, b, '+') : `${a} + ${b}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Addition innebär att vi lägger samman delar för att hitta en total summa." : "Step 1: Addition involves combining parts to find a total sum." },
                    { text: lang === 'sv' ? "Addera talen genom att lägga ihop de olika talsorterna." : "Add the numbers by combining the different place values.", latex: `${a} + ${b} \\\\ ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        if (v === 'add_missing_variable') {
            const a = MathUtils.randomInt(5, 100);
            const x = MathUtils.randomInt(5, 100);
            const sum = a + x;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket tal saknas för att summan ska stämma?" : "What number is missing to make the sum correct?",
                    latex: `${a} + ? = ${sum}`, answerType: 'numeric'
                },
                token: this.toBase64(x.toString()),
                variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: För att hitta en saknad term använder vi subtraktion: Summan - Känd term." : "Step 1: To find a missing term, use subtraction: Sum - Known term." },
                    { text: lang === 'sv' ? "Räkna ut skillnaden." : "Calculate the difference.", latex: `${sum} - ${a} \\\\ ${x}` },
                    { text: lang === 'sv' ? `Svar: ${x}` : `Answer: ${x}` }
                ]
            };
        }

        // add_spot_the_lie
        const n1 = MathUtils.randomInt(10, 50), n2 = MathUtils.randomInt(10, 50);
        const sTrue = `${n1} + ${n2} = ${n1 + n2}`;
        const sFalse = `${n1} + ${n2} = ${n1 + n2 + MathUtils.randomChoice([-2, 1, 2])}`;
        return {
            renderData: {
                description: lang === 'sv' ? "Vilken uträkning är FELAKTIG?" : "Which calculation is INCORRECT?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue, `${MathUtils.randomInt(10,30)} + 10 = ${MathUtils.randomInt(45,60)}`, sFalse])
            },
            token: this.toBase64(sFalse),
            variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Kontrollera varje uträkning genom att addera entalen och tiotalen var för sig." : "Step 1: Check each calculation by adding the ones and tens separately." },
                { text: lang === 'sv' ? "Denna uträkning stämmer inte:" : "This calculation is incorrect:", latex: sFalse },
                { text: lang === 'sv' ? `Svar: ${sFalse}` : `Answer: ${sFalse}` }
            ]
        };
    }

    // --- LEVEL 2: SUBTRACTION ---
    private level2_SubSimple(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'sub_std_vertical', type: 'calculate' },
            { key: 'sub_std_horizontal', type: 'calculate' },
            { key: 'sub_missing_variable', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(50, 999), b = MathUtils.randomInt(10, a - 1), ans = a - b;

        if (v === 'sub_std_vertical' || v === 'sub_std_horizontal') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna differensen." : "Calculate the difference.",
                    latex: v === 'sub_std_vertical' ? this.makeVertical(a, b, '-') : `${a} - ${b}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Subtraktion innebär att vi tar bort ett värde för att hitta skillnaden (differensen)." : "Step 1: Subtraction means removing a value to find the difference." },
                    { text: lang === 'sv' ? "Räkna ut skillnaden." : "Calculate the difference.", latex: `${a} - ${b} \\\\ ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const x = MathUtils.randomInt(20, 80), start = x + MathUtils.randomInt(20, 100);
        return {
            renderData: { description: lang === 'sv' ? "Hitta det saknade talet." : "Find the missing number.", latex: `${start} - ? = ${start - x}`, answerType: 'numeric' },
            token: this.toBase64(x.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Talet som saknas är skillnaden mellan starttalet och resultatet." : "Step 1: The missing number is the difference between the starting value and the result." },
                { text: lang === 'sv' ? "Beräkna x genom subtraktion." : "Calculate x using subtraction.", latex: `${start} - ${start-x} \\\\ ${x}` },
                { text: lang === 'sv' ? `Svar: ${x}` : `Answer: ${x}` }
            ]
        };
    }

    // --- LEVEL 3: DECIMALS (EXCLUSIVELY HORIZONTAL) ---
    private level3_Decimals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'dec_add_vertical', type: 'calculate' },
            { key: 'dec_sub_vertical', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const op = v === 'dec_add_vertical' ? '+' : '-';
        const a = MathUtils.randomInt(10, 500) / 10;
        const b = MathUtils.randomInt(10, 500) / 100;
        const val1 = op === '+' ? a : Math.max(a, b);
        const val2 = op === '+' ? b : Math.min(a, b);
        const ans = Math.round((op === '+' ? val1 + val2 : val1 - val2) * 100) / 100;

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna (ställ upp på papper vid behov)." : "Calculate (set up on paper if needed).",
                latex: `${val1} ${op} ${val2}`, answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Vid decimalräkning är det viktigaste att decimaltecknen hamnar rakt under varandra." : "Step 1: In decimal calculation, the most important thing is that the decimal points align vertically." },
                { text: lang === 'sv' ? "Räkna nu talsort för talsort." : "Now calculate place value by place value.", latex: `${val1} ${op} ${val2} \\\\ ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 4: MULT EASY ---
    private level4_MultEasy(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mult_table_std', type: 'calculate' },
            { key: 'mult_commutative', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(2, 10), b = MathUtils.randomInt(2, 10);

        if (v === 'mult_table_std') {
            return {
                renderData: { description: lang === 'sv' ? "Beräkna produkten." : "Calculate the product.", latex: `${a} · ${b}`, answerType: 'numeric' },
                token: this.toBase64((a * b).toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Multiplikation är upprepad addition." : "Step 1: Multiplication is repeated addition." },
                    { text: lang === 'sv' ? "Beräkna produkten." : "Calculate the product.", latex: `${a} · ${b} \\\\ ${a*b}` },
                    { text: lang === 'sv' ? `Svar: ${a*b}` : `Answer: ${a*b}` }
                ]
            };
        }

        const correct = `${b} · ${a}`;
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket uttryck ger samma svar som ${a} · ${b}?` : `Which expression gives the same answer as ${a} · ${b}?`,
                answerType: 'multiple_choice', options: MathUtils.shuffle([correct, `${a}+${b}`, `${a}-${b}`])
            },
            token: this.toBase64(correct), variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Den kommutativa lagen innebär att talens ordning inte spelar någon roll vid multiplikation." : "Step 1: The commutative law means that the order of factors does not matter in multiplication." },
                { text: lang === 'sv' ? "Växla plats på faktorerna." : "Swap the places of the factors.", latex: `${a} · ${b} \\\\ ${b} · ${a}` },
                { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}` }
            ]
        };
    }

    // --- LEVEL 5: MULT MEDIUM ---
    private level5_MultMedium(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mult_2x1_vertical', type: 'calculate' },
            { key: 'mult_distributive', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(12, 45), b = MathUtils.randomInt(3, 9);

        if (v === 'mult_2x1_vertical') {
            return {
                renderData: { description: lang === 'sv' ? "Beräkna." : "Calculate.", latex: this.makeVertical(a, b, '\\times'), answerType: 'numeric' },
                token: this.toBase64((a * b).toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Multiplicera entalet först, sedan tiotalet." : "Step 1: Multiply the ones digit first, then the tens digit." },
                    { text: lang === 'sv' ? "Räkna ut produkten." : "Calculate the product.", latex: `${a} · ${b} \\\\ ${a*b}` },
                    { text: lang === 'sv' ? `Svar: ${a*b}` : `Answer: ${a*b}` }
                ]
            };
        }

        const p1 = Math.floor(a / 10) * 10, p2 = a % 10;
        return {
            renderData: { description: lang === 'sv' ? `Beräkna ${p1+p2}·${b} genom att göra så här: (${p1}·${b})+(${p2}·${b})` : `Calculate ${p1+p2}·${b} by splitting the factors like this: (${p1}·${b})+(${p2}·${b})`, answerType: 'numeric' },
            token: this.toBase64((a * b).toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Detta kallas den distributiva lagen. Räkna ut parenteserna först." : "Step 1: This is the distributive law. Solve the parentheses first." },
                { text: lang === 'sv' ? "Addera resultaten." : "Add the results.", latex: `${p1*b} + ${p2*b} \\\\ ${a*b}` },
                { text: lang === 'sv' ? `Svar: ${a*b}` : `Answer: ${a*b}` }
            ]
        };
    }

    // --- LEVEL 6: MULT HARD ---
    private level6_MultHard(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mult_decimal_std', type: 'calculate' },
            { key: 'mult_decimal_placement', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(1, 9) / 10, b = MathUtils.randomInt(3, 15), ans = Math.round(a * b * 100) / 100;

        if (v === 'mult_decimal_std') {
            return {
                renderData: { description: lang === 'sv' ? "Beräkna produkten." : "Calculate the product.", latex: `${a} · ${b}`, answerType: 'numeric' },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Multiplicera som heltal först, räkna sedan decimalerna i faktorerna." : "Step 1: Multiply as integers first, then count the decimals in the factors." },
                    { text: lang === 'sv' ? "Placera kommatecknet i svaret." : "Place the decimal point in the result.", latex: `${a*10} · ${b} = ${a*10*b} \\\\ ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const correctStr = `${a} · ${b} = ${ans}`;
        return {
            renderData: { description: lang === 'sv' ? "Vilken uträkning har placerat kommatecknet rätt?" : "Which calculation placed the decimal point correctly?", answerType: 'multiple_choice', options: MathUtils.shuffle([correctStr, `${a} · ${b} = ${ans*10}`, `${a} · ${b} = ${ans/10}`]) },
            token: this.toBase64(correctStr), variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Produktsvaret ska ha lika många decimaler som faktorerna har tillsammans (här 1 st).` : `Step 1: The product should have as many decimals as the factors have combined (here, 1 total).` },
                { text: lang === 'sv' ? `Svar: ${correctStr}` : `Answer: ${correctStr}` }
            ]
        };
    }

    // --- LEVEL 7: DIVISION ---
    private level7_DivEasy(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'div_basic_std', type: 'calculate' },
            { key: 'div_inverse_logic', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const f1 = MathUtils.randomInt(3, 10), f2 = MathUtils.randomInt(3, 10), prod = f1 * f2;

        if (v === 'div_basic_std') {
            return {
                renderData: { description: lang === 'sv' ? "Beräkna kvoten." : "Calculate the quotient.", latex: `\\frac{${prod}}{${f1}}`, answerType: 'numeric' },
                token: this.toBase64(f2.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Division är multiplikation baklänges." : "Step 1: Division is multiplication in reverse." },
                    { text: lang === 'sv' ? `Tänk: Vilket tal · ${f1} blir ${prod}?` : `Think: What number · ${f1} is ${prod}?`, latex: `${f1} · ? = ${prod}` },
                    { text: lang === 'sv' ? `Svar: ${f2}` : `Answer: ${f2}` }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? `Om vi vet att ${f1} · ${f2} = ${prod}, vad är då ${prod} / ${f1}?` : `If we know ${f1} · ${f2} = ${prod}, what is ${prod} / ${f1}?`, answerType: 'numeric' },
            token: this.toBase64(f2.toString()), variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Eftersom multiplikation och division hör ihop finns svaret redan i den givna uträkningen." : "Step 1: Since multiplication and division are related, the answer is already provided in the context." },
                { text: lang === 'sv' ? "Den andra faktorn är svaret." : "The other factor is the result.", latex: `${f2}` },
                { text: lang === 'sv' ? `Svar: ${f2}` : `Answer: ${f2}` }
            ]
        };
    }

    // --- MIXED LEVELS ---
    private level8_MixedIntegers(lang: string, options: any): any {
        const key = MathUtils.randomChoice(['add_std_horizontal', 'sub_std_horizontal', 'mult_table_std', 'div_basic_std']);
        const res = this.generateByVariation(key, lang);
        res.metadata = { ...res.metadata, mixed: true };
        return res;
    }

    private level9_MixedDecimals(lang: string, options: any): any {
        const key = MathUtils.randomChoice(['dec_add_vertical', 'dec_sub_vertical', 'mult_decimal_std']);
        const res = this.generateByVariation(key, lang);
        res.metadata = { ...res.metadata, mixed: true };
        return res;
    }
}