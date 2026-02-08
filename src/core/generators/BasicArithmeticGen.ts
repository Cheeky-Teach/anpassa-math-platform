import { MathUtils } from '../utils/MathUtils.js';

export class BasicArithmeticGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_AddSimple(lang);
            case 2: return this.level2_SubSimple(lang);
            case 3: return this.level3_Decimals(lang);
            case 4: return this.level4_MultEasy(lang);
            case 5: return this.level5_MultMedium(lang);
            case 6: return this.level6_MultHard(lang);
            case 7: return this.level7_DivEasy(lang);
            case 8: return this.level8_MixedIntegers(lang);
            case 9: return this.level9_MixedDecimals(lang);
            default: return this.level1_AddSimple(lang);
        }
    }

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
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

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private makeVertical(top: number | string, bottom: number | string, op: string): string {
        return `\\begin{array}{r} ${top} \\\\ ${op} \\; ${bottom} \\\\ \\hline \\end{array}`;
    }

    // --- LEVEL 1: ADDITION ---
    private level1_AddSimple(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['add_std_vertical', 'add_std_horizontal', 'add_missing_variable', 'add_spot_the_lie']);

        if (v === 'add_std_vertical' || v === 'add_std_horizontal') {
            const a = MathUtils.randomInt(10, 999);
            const b = MathUtils.randomInt(10, 999);
            const isVertical = v === 'add_std_vertical';
            const res = this.createProblem(a, b, '+', lang, isVertical);
            res.metadata = { variation_key: v, difficulty: 1 };
            return res;
        }

        if (v === 'add_missing_variable') {
            const a = MathUtils.randomInt(5, 100);
            const x = MathUtils.randomInt(5, 100);
            const c = a + x;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket tal saknas för att summan ska stämma?" : "What number is missing to make the sum correct?",
                    latex: `${a} + ? = ${c}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(x.toString()),
                clues: [
                    { text: lang === 'sv' ? "Tänk på addition som en balansvåg. För att hitta den saknade delen tar vi hela summan minus den kända delen." : "Think of addition as a balance scale. To find the missing part, take the whole sum minus the known part.", latex: `${c} - ${a} = x` }
                ],
                metadata: { variation_key: 'add_missing_variable', difficulty: 2 }
            };
        }

        const generateEquation = (isCorrect: boolean) => {
            const n1 = MathUtils.randomInt(10, 50);
            const n2 = MathUtils.randomInt(10, 50);
            const result = isCorrect ? (n1 + n2) : (n1 + n2 + MathUtils.randomChoice([-2, -1, 1, 2]));
            return `${n1} + ${n2} = ${result}`;
        };

        const sTrue1 = generateEquation(true);
        const sTrue2 = generateEquation(true);
        const sFalse = generateEquation(false);

        return {
            renderData: {
                description: lang === 'sv' ? "Vilken av följande uträkningar är FELAKTIG?" : "Which of the following calculations is INCORRECT?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue1, sTrue2, sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [{ text: lang === 'sv' ? "Kontrollera entalen först, sedan tiotalen. En av dessa summor stämmer inte." : "Check the ones first, then the tens. One of these sums is incorrect." }],
            metadata: { variation_key: 'add_spot_the_lie', difficulty: 2 }
        };
    }

    // --- LEVEL 2: SUBTRACTION ---
    private level2_SubSimple(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['sub_std_vertical', 'sub_std_horizontal', 'sub_missing_variable']);

        if (v === 'sub_std_vertical' || v === 'sub_std_horizontal') {
            const a = MathUtils.randomInt(50, 999);
            const b = MathUtils.randomInt(10, a - 1);
            const isVertical = v === 'sub_std_vertical';
            const res = this.createProblem(a, b, '-', lang, isVertical);
            res.metadata = { variation_key: v, difficulty: 2 };
            return res;
        }

        const a = MathUtils.randomInt(100, 250);
        const x = MathUtils.randomInt(20, 80);
        const c = a - x;
        return {
            renderData: {
                description: lang === 'sv' ? "Hitta det saknade talet i subtraktionen." : "Find the missing number in the subtraction.",
                latex: `${a} - ? = ${c}`,
                answerType: 'numeric'
            },
            token: this.toBase64(x.toString()),
            clues: [{ text: lang === 'sv' ? `Vi börjar med ${a} och tar bort något (x) för att få ${c}. Skillnaden mellan dem är x.` : `We start with ${a} and remove something (x) to get ${c}. The difference between them is x.`, latex: `${a} - ${c} = x` }],
            metadata: { variation_key: 'sub_missing_variable', difficulty: 2 }
        };
    }

    // --- LEVEL 3: DECIMALS ---
    private level3_Decimals(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['dec_add_vertical', 'dec_sub_vertical']);
        const op = v === 'dec_add_vertical' ? '+' : '-';
        const a = MathUtils.randomInt(100, 4500) / 100;
        const b = MathUtils.randomInt(100, 4500) / 100;
        
        const res = this.createProblem(
            op === '+' ? a : Math.max(a, b), 
            op === '+' ? b : Math.min(a, b), 
            op, lang, true
        );

        res.clues.push({ 
            text: lang === 'sv' ? "Viktigaste regeln: Decimaltecknen måste stå rakt under varandra. Fyll i med nollor om talen har olika många decimaler." : "Most important rule: The decimal points must be aligned vertically. Fill with zeros if the numbers have different numbers of decimal places." 
        });
        res.metadata = { variation_key: v, difficulty: 3 };
        return res;
    }

    // --- LEVEL 4: MULT EASY ---
    private level4_MultEasy(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['mult_table_std', 'mult_commutative']);
        const a = MathUtils.randomInt(2, 10);
        const b = MathUtils.randomInt(2, 10);

        if (v === 'mult_table_std') {
            const res = this.createProblem(a, b, '*', lang, false);
            res.metadata = { variation_key: 'mult_table_std', difficulty: 2 };
            return res;
        }

        const correct = `${b} × ${a}`;
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket uttryck ger samma produkt som ${a} × ${b}?` : `Which expression gives the same product as ${a} × ${b}?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([correct, `${a} + ${b}`, `${a} - ${b}`])
            },
            token: this.toBase64(correct),
            clues: [{ text: lang === 'sv' ? "Den kommutativa lagen säger att ordningen på talen inte spelar någon roll vid multiplikation." : "The commutative law states that the order of numbers does not matter in multiplication.", latex: "a \\cdot b = b \\cdot a" }],
            metadata: { variation_key: 'mult_commutative', difficulty: 2 }
        };
    }

    // --- LEVEL 5: MULT MEDIUM ---
    private level5_MultMedium(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['mult_2x1_vertical', 'mult_distributive']);
        const a = MathUtils.randomInt(11, 35);
        const b = MathUtils.randomInt(3, 9);

        if (v === 'mult_2x1_vertical') {
            const res = this.createProblem(a, b, '*', lang, true);
            res.metadata = { variation_key: 'mult_2x1_vertical', difficulty: 3 };
            return res;
        }

        const part1 = Math.floor(a / 10) * 10;
        const part2 = a % 10;
        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna genom att dela upp talet i talsorter: (${part1} × ${b}) + (${part2} × ${b})` : `Calculate by splitting the number into place values: (${part1} × ${b}) + (${part2} × ${b})`,
                answerType: 'numeric'
            },
            token: this.toBase64((a * b).toString()),
            clues: [{ text: lang === 'sv' ? "Detta kallas den distributiva lagen. Det är oftast enklare att räkna tiotalen för sig och entalen för sig." : "This is called the distributive law. It is often easier to calculate the tens and ones separately.", latex: `${part1*b} + ${part2*b}` }],
            metadata: { variation_key: 'mult_distributive', difficulty: 3 }
        };
    }

    // --- LEVEL 6: MULT HARD ---
    private level6_MultHard(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['mult_decimal_std', 'mult_decimal_placement']);
        const a = MathUtils.randomInt(1, 9) / 10;
        const b = MathUtils.randomInt(2, 15);
        const ans = Math.round(a * b * 100) / 100;

        if (v === 'mult_decimal_std') {
            const res = this.createProblem(a, b, '*', lang, false);
            res.clues.push({ text: lang === 'sv' ? "Tips: Multiplicera som om det vore heltal först (9 x 12). Räkna sedan hur många decimaler som fanns totalt och flytta kommat lika många steg." : "Hint: Multiply as if they were integers first (9 x 12). Then count the total number of decimals in the original numbers and move the decimal point the same number of steps." });
            res.metadata = { variation_key: 'mult_decimal_std', difficulty: 4 };
            return res;
        }

        const options = [
            `${a} × ${b} = ${ans}`,
            `${a} × ${b} = ${Math.round(ans * 10 * 10) / 10}`,
            `${a} × ${b} = ${Math.round(ans * 100 * 10) / 1000}`
        ];
        return {
            renderData: {
                description: lang === 'sv' ? "Vilken av uträkningarna har placerat decimalkommat rätt?" : "Which calculation has placed the decimal point correctly?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle(options)
            },
            token: this.toBase64(`${a} × ${b} = ${ans}`),
            clues: [{ text: lang === 'sv' ? `Räkna antalet decimaler i faktorerna. Här har ${a} en decimal och ${b} har noll. Produkten måste därför ha exakt en decimal.` : `Count the decimals in the factors. Here ${a} has one decimal and ${b} has zero. The product must therefore have exactly one decimal.` }],
            metadata: { variation_key: 'mult_decimal_placement', difficulty: 4 }
        };
    }

    // --- LEVEL 7: DIVISION ---
    private level7_DivEasy(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['div_basic_std', 'div_inverse_logic']);
        const f1 = MathUtils.randomInt(2, 12);
        const f2 = MathUtils.randomInt(2, 12);
        const prod = f1 * f2;

        if (v === 'div_basic_std') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna kvoten." : "Calculate the quotient.",
                    latex: `\\frac{${prod}}{${f1}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(f2.toString()),
                clues: [{ text: lang === 'sv' ? `Division är motsatsen till multiplikation. Fråga dig själv: Vad multiplicerat med ${f1} blir ${prod}?` : `Division is the opposite of multiplication. Ask yourself: What multiplied by ${f1} equals ${prod}?`, latex: `${f1} \\cdot ? = ${prod}` }],
                metadata: { variation_key: 'div_basic_std', difficulty: 2 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? `Om vi vet att ${f1} × ${f2} = ${prod}, vad blir då resultatet av ${prod} / ${f1}?` : `If we know that ${f1} × ${f2} = ${prod}, what is the result of ${prod} / ${f1}?`,
                answerType: 'numeric'
            },
            token: this.toBase64(f2.toString()),
            clues: [{ text: lang === 'sv' ? "Eftersom division och multiplikation hör ihop i samma sifferfamilj kan du se svaret direkt i multiplikationen." : "Since division and multiplication belong to the same fact family, you can see the answer directly in the multiplication." }],
            metadata: { variation_key: 'div_inverse_logic', difficulty: 2 }
        };
    }

    // --- LEVEL 8 & 9: MIXED ---
    private level8_MixedIntegers(lang: string): any {
        const key = MathUtils.randomChoice(['add_std_horizontal', 'sub_std_horizontal', 'mult_table_std', 'div_basic_std']);
        const res = this.generateByVariation(key, lang);
        res.metadata.mixed = true;
        return res;
    }

    private level9_MixedDecimals(lang: string): any {
        const key = MathUtils.randomChoice(['dec_add_vertical', 'dec_sub_vertical', 'mult_decimal_std']);
        const res = this.generateByVariation(key, lang);
        res.metadata.mixed = true;
        return res;
    }

    private createProblem(a: number, b: number, op: string, lang: string, vertical: boolean = false, extraClues: any[] = []) {
        let ans = 0;
        let latex = "";
        if (op === '+') ans = a + b;
        if (op === '-') ans = a - b;
        if (op === '*') ans = a * b;
        ans = Math.round(ans * 1000) / 1000;

        if (vertical) {
            const opSymbol = op === '*' ? '\\times' : op;
            latex = (op === '-') ? this.makeVertical(a, b, opSymbol) : this.makeVertical(Math.max(a, b), Math.min(a, b), opSymbol);
        } else {
            const opSymbol = op === '*' ? '\\cdot' : op;
            latex = `${a} ${opSymbol} ${b}`;
        }

        const description = vertical 
            ? (lang === 'sv' ? "Ställ upp och beräkna. Tänk på talsorterna." : "Set up and calculate. Pay attention to place values.")
            : (lang === 'sv' ? "Beräkna." : "Calculate.");

        const defaultClues = vertical 
            ? [{ text: lang === 'sv' ? "Börja alltid från höger (entalen). Om summan blir 10 eller mer, flytta tiotalet som en minnessiffra till nästa kolumn." : "Always start from the right (ones). If the sum is 10 or more, carry the ten over as a small digit to the next column." }]
            : [];

        return {
            renderData: { latex, description, answerType: 'numeric' },
            token: this.toBase64(ans.toString()),
            clues: extraClues.length > 0 ? [...defaultClues, ...extraClues] : defaultClues,
            metadata: { variation_key: 'generic_arithmetic', difficulty: 1 }
        };
    }
}