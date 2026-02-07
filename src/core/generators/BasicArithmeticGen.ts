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

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // Helper for vertical layout
    private makeVertical(top: number | string, bottom: number | string, op: string): string {
        return `\\begin{array}{r} ${top} \\\\ ${op} \\; ${bottom} \\\\ \\hline \\end{array}`;
    }

    // --- LEVEL 1: ADDITION ---
    private level1_AddSimple(lang: string): any {
        const variation = Math.random();

        // Variation A: Standard Sum
        if (variation < 0.6) {
            const a = MathUtils.randomInt(10, 999);
            const b = MathUtils.randomInt(10, 999);
            const isVertical = Math.random() > 0.5;
            const res = this.createProblem(a, b, '+', lang, isVertical);
            res.metadata = { variation: isVertical ? 'add_std_vertical' : 'add_std_horizontal', difficulty: 1 };
            return res;
        }

        // Variation B: Missing Variable (Algebraic)
        if (variation < 0.8) {
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
                    { text: lang === 'sv' ? "Tänk på addition som en balansvåg. För att hitta den saknade delen tar vi hela summan minus den kända delen." : "Think of addition as a balance scale. To find the missing part, take the whole sum minus the known part.", latex: `${c} - ${a} = ?` }
                ],
                metadata: { variation: 'add_missing_variable', difficulty: 2 }
            };
        }

        // Variation C: Spot the Lie (Fully Randomized)
        const generateEquation = (isCorrect: boolean) => {
            const n1 = MathUtils.randomInt(10, 50);
            const n2 = MathUtils.randomInt(10, 50);
            const result = isCorrect ? (n1 + n2) : (n1 + n2 + MathUtils.randomChoice([-2, -1, 1, 2]));
            return `${n1} + ${n2} = ${result}`;
        };

        const sTrue1 = generateEquation(true);
        const sTrue2 = generateEquation(true);
        const sFalse = generateEquation(false);
        const options = [sTrue1, sTrue2, sFalse];

        return {
            renderData: {
                description: lang === 'sv' ? "Vilken av följande uträkningar är FELAKTIG?" : "Which of the following calculations is INCORRECT?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle(options)
            },
            token: this.toBase64(sFalse),
            clues: [{ text: lang === 'sv' ? "Kontrollera entalen och tiotalen för varje alternativ noga." : "Check the ones and tens for each option carefully." }],
            metadata: { variation: 'add_spot_the_lie', difficulty: 2 }
        };
    }

    // --- LEVEL 2: SUBTRACTION ---
    private level2_SubSimple(lang: string): any {
        const variation = Math.random();

        // Variation A: Standard
        if (variation < 0.7) {
            const a = MathUtils.randomInt(50, 999);
            const b = MathUtils.randomInt(10, a - 1);
            const isVertical = Math.random() > 0.5;
            const res = this.createProblem(a, b, '-', lang, isVertical);
            res.metadata = { variation: isVertical ? 'sub_std_vertical' : 'sub_std_horizontal', difficulty: 2 };
            return res;
        }

        // Variation B: Missing Variable
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
            clues: [{ text: lang === 'sv' ? `Om vi tar bort x från ${a} får vi ${c}. Beräkna skillnaden.` : `If we remove x from ${a} we get ${c}. Calculate the difference.`, latex: `${a} - ${c} = x` }],
            metadata: { variation: 'sub_missing_variable', difficulty: 2 }
        };
    }

    // --- LEVEL 3: DECIMALS ---
    private level3_Decimals(lang: string): any {
        // Removed Variation B (Digit Alignment Check) as requested.
        // Level 3 now focuses exclusively on decimal vertical arithmetic variety.
        const op = MathUtils.randomChoice(['+', '-']);
        const a = MathUtils.randomInt(100, 4500) / 100;
        const b = MathUtils.randomInt(100, 4500) / 100;
        
        const res = this.createProblem(
            op === '+' ? a : Math.max(a, b), 
            op === '+' ? b : Math.min(a, b), 
            op, lang, true
        );

        res.clues.push({ 
            text: lang === 'sv' ? "Kom ihåg: Decimaltecknen måste stå på en rak vertikal linje för att du ska plussa/minska rätt talsorter." : "Remember: The decimal points must be aligned in a straight vertical line to add/subtract correct place values." 
        });
        res.metadata = { variation: op === '+' ? 'dec_add_vertical' : 'dec_sub_vertical', difficulty: 3 };
        return res;
    }

    // --- LEVEL 4: MULT EASY (Tables 2-9) ---
    private level4_MultEasy(lang: string): any {
        const variation = Math.random();
        const a = MathUtils.randomInt(2, 10);
        const b = MathUtils.randomInt(2, 10);

        if (variation < 0.7) {
            const res = this.createProblem(a, b, '*', lang, false);
            res.metadata = { variation: 'mult_table_std', difficulty: 2 };
            return res;
        }

        // Variation B: Commutative Check
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket uttryck ger samma resultat som ${a} × ${b}?` : `Which expression gives the same result as ${a} × ${b}?`,
                answerType: 'multiple_choice',
                options: [`${b} × ${a}`, `${a} + ${b}`, `${a} - ${b}`]
            },
            token: this.toBase64(`${b} × ${a}`),
            clues: [{ text: lang === 'sv' ? "Ordningen på faktorerna spelar ingen roll för produkten." : "The order of the factors does not matter for the product." }],
            metadata: { variation: 'mult_commutative', difficulty: 2 }
        };
    }

    // --- LEVEL 5: MULT MEDIUM (2x1) ---
    private level5_MultMedium(lang: string): any {
        const variation = Math.random();
        const a = MathUtils.randomInt(11, 35);
        const b = MathUtils.randomInt(3, 9);

        if (variation < 0.7) {
            const res = this.createProblem(a, b, '*', lang, true);
            res.metadata = { variation: 'mult_2x1_vertical', difficulty: 3 };
            return res;
        }

        // Variation B: Distributive Logic
        const part1 = Math.floor(a / 10) * 10;
        const part2 = a % 10;
        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna genom att dela upp talet: (${part1} × ${b}) + (${part2} × ${b})` : `Calculate by splitting the number: (${part1} × ${b}) + (${part2} × ${b})`,
                answerType: 'numeric'
            },
            token: this.toBase64((a * b).toString()),
            clues: [{ text: lang === 'sv' ? "Räkna ut talsorterna var för sig och addera sedan ihop dem." : "Calculate the place values separately and then add them together." }],
            metadata: { variation: 'mult_distributive', difficulty: 3 }
        };
    }

    // --- LEVEL 6: MULT HARD (Decimals) ---
    private level6_MultHard(lang: string): any {
        const variation = Math.random();
        const a = MathUtils.randomInt(1, 9) / 10;
        const b = MathUtils.randomInt(2, 15);
        const ans = Math.round(a * b * 100) / 100;

        if (variation < 0.7) {
            const res = this.createProblem(a, b, '*', lang, false);
            res.clues.push({ text: lang === 'sv' ? "Räkna som om det vore heltal först. Flytta sedan kommat baserat på totalt antal decimaler i uppgiften." : "Calculate as integers first. Then move the decimal point based on the total number of decimals in the problem." });
            res.metadata = { variation: 'mult_decimal_std', difficulty: 4 };
            return res;
        }

        // Variation B: Decimal Placement Spot the Lie
        const options = [
            `${a} × ${b} = ${ans}`,
            `${a} × ${b} = ${Math.round(ans * 10 * 10) / 10}`,
            `${a} × ${b} = ${Math.round(ans * 100 * 10) / 1000}`
        ];
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående stämmer?" : "Which statement is correct?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle(options)
            },
            token: this.toBase64(`${a} × ${b} = ${ans}`),
            clues: [{ text: lang === 'sv' ? `Faktorn ${a} har en decimal, så produkten måste också ha en decimal flyttad.` : `The factor ${a} has one decimal place, so the product must also have the decimal moved.` }],
            metadata: { variation: 'mult_decimal_placement', difficulty: 4 }
        };
    }

    // --- LEVEL 7: DIVISION ---
    private level7_DivEasy(lang: string): any {
        const variation = Math.random();
        const f1 = MathUtils.randomInt(2, 12);
        const f2 = MathUtils.randomInt(2, 12);
        const prod = f1 * f2;

        if (variation < 0.7) {
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna kvoten." : "Calculate the quotient.",
                    latex: `\\frac{${prod}}{${f1}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(f2.toString()),
                clues: [{ text: lang === 'sv' ? `Tänk multiplikation: Vad gånger ${f1} blir ${prod}?` : `Think multiplication: What times ${f1} equals ${prod}?`, latex: `${f1} \\cdot ? = ${prod}` }],
                metadata: { variation: 'div_basic_std', difficulty: 2 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? `Om ${f1} × ${f2} = ${prod}, vad är då ${prod} / ${f1}?` : `If ${f1} × ${f2} = ${prod}, what is ${prod} / ${f1}?`,
                answerType: 'numeric'
            },
            token: this.toBase64(f2.toString()),
            clues: [{ text: lang === 'sv' ? "Division och multiplikation är varandras motsatser." : "Division and multiplication are opposites of each other." }],
            metadata: { variation: 'div_inverse_logic', difficulty: 2 }
        };
    }

    // --- LEVEL 8: MIXED INTEGERS ---
    private level8_MixedIntegers(lang: string): any {
        const mode = MathUtils.randomInt(1, 4);
        let res: any;
        if (mode === 1) res = this.level1_AddSimple(lang);
        else if (mode === 2) res = this.level2_SubSimple(lang);
        else if (mode === 3) res = this.level4_MultEasy(lang);
        else res = this.level7_DivEasy(lang);
        res.metadata.mixed = true;
        return res;
    }

    // --- LEVEL 9: MIXED DECIMALS ---
    private level9_MixedDecimals(lang: string): any {
        const variation = Math.random();
        let res: any;
        if (variation < 0.5) res = this.level3_Decimals(lang);
        else res = this.level6_MultHard(lang);
        res.metadata.mixed = true;
        return res;
    }

    // --- GENERIC HELPER ---
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
            ? (lang === 'sv' ? "Ställ upp och beräkna." : "Set up and calculate.")
            : (lang === 'sv' ? "Beräkna." : "Calculate.");

        const defaultClues = vertical 
            ? [{ text: lang === 'sv' ? "Börja från höger och flytta minnessiffror till vänster om summan når 10 eller mer." : "Start from the right and carry over digits to the left if the sum reaches 10 or more." }]
            : [];

        return {
            renderData: { latex, description, answerType: 'numeric' },
            token: this.toBase64(ans.toString()),
            clues: extraClues.length > 0 ? [...defaultClues, ...extraClues] : defaultClues,
            metadata: { variation: 'generic_arithmetic', difficulty: 1 }
        };
    }
}