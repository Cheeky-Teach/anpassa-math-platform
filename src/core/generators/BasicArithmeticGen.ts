import { MathUtils } from '../utils/MathUtils';

export class BasicArithmeticGen {
    generate(level: number, lang: string = 'sv') {
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

    // Level 1: Addition (1-3 digits)
    private level1_AddSimple(lang: string) {
        const a = MathUtils.randomInt(5, 500);
        const b = MathUtils.randomInt(5, 500);
        return this.createProblem(a, b, '+', lang);
    }

    // Level 2: Subtraction
    private level2_SubSimple(lang: string) {
        const a = MathUtils.randomInt(20, 900);
        const b = MathUtils.randomInt(5, a); // Ensure positive result for basic level
        return this.createProblem(a, b, '-', lang);
    }

    // Level 3: Decimals (+/-)
    private level3_Decimals(lang: string) {
        const op = MathUtils.randomChoice(['+', '-']);
        const a = MathUtils.randomFloat(1, 50, 1);
        const b = MathUtils.randomFloat(1, 20, 1);
        // Ensure clean subtraction
        const val1 = op === '-' ? Math.max(a, b) : a;
        const val2 = op === '-' ? Math.min(a, b) : b;
        
        return this.createProblem(val1, val2, op, lang, "text", [
            { text: lang === 'sv' ? "Ställ upp talen ovanpå varandra." : "Line up the numbers vertically." },
            { text: lang === 'sv' ? "Se till att decimaltecknen hamnar rakt under varandra." : "Make sure the decimal points line up." }
        ]);
    }

    // Level 4: Mult Easy (Tables 2-9)
    private level4_MultEasy(lang: string) {
        const a = MathUtils.randomInt(2, 9);
        const b = MathUtils.randomInt(2, 12);
        return this.createProblem(a, b, '*', lang);
    }

    // Level 5: Mult Medium (2 digit x 1 digit)
    private level5_MultMedium(lang: string) {
        const a = MathUtils.randomInt(11, 50);
        const b = MathUtils.randomInt(2, 9);
        return this.createProblem(a, b, '*', lang);
    }

    // Level 6: Mult Hard (2 digit x 2 digit)
    private level6_MultHard(lang: string) {
        const a = MathUtils.randomInt(11, 30);
        const b = MathUtils.randomInt(11, 30);
        return this.createProblem(a, b, '*', lang, "text", [
            { text: lang === 'sv' ? "Dela upp multiplikationen: räkna ental först, sen tiotal." : "Split the multiplication: calculate ones first, then tens." }
        ]);
    }

    // Level 7: Division Easy (Integer results)
    private level7_DivEasy(lang: string) {
        const divisor = MathUtils.randomInt(2, 9);
        const quotient = MathUtils.randomInt(4, 20);
        const dividend = divisor * quotient;
        
        const latex = `\\frac{${dividend}}{${divisor}}`;
        const desc = lang === 'sv' ? "Beräkna" : "Calculate";

        return {
            renderData: { latex, description: desc, answerType: 'text' },
            token: Buffer.from(quotient.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? `Hur många gånger får ${divisor} plats i ${dividend}?` : `How many times does ${divisor} fit into ${dividend}?` }
            ]
        };
    }

    // Level 8: Mixed Integers
    private level8_MixedIntegers(lang: string) {
        const type = MathUtils.randomInt(1, 4);
        switch(type) {
            case 1: return this.level1_AddSimple(lang);
            case 2: return this.level2_SubSimple(lang);
            case 3: return this.level5_MultMedium(lang);
            case 4: return this.level7_DivEasy(lang);
            default: return this.level1_AddSimple(lang);
        }
    }

    // Level 9: Mixed Decimals
    private level9_MixedDecimals(lang: string) {
        // Includes decimal multiplication/division
        const type = MathUtils.randomInt(1, 4);
        if (type <= 2) return this.level3_Decimals(lang);
        
        // Decimal Mult
        const a = MathUtils.randomFloat(2, 9, 1);
        const b = MathUtils.randomInt(2, 9);
        // JS float precision fix
        const ans = Math.round(a * b * 10) / 10;
        
        return {
            renderData: { latex: `${a} \\cdot ${b}`, description: lang === 'sv' ? "Beräkna" : "Calculate", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [{ text: lang === 'sv' ? "Ignorera decimalen först, räkna, och sätt tillbaka den." : "Ignore the decimal first, calculate, then put it back." }]
        };
    }

    // Helper
    private createProblem(a: number, b: number, op: string, lang: string, type: 'text' = 'text', extraClues: any[] = []) {
        let ans = 0;
        let latexOp = op;
        if (op === '+') ans = a + b;
        if (op === '-') ans = a - b;
        if (op === '*') { ans = a * b; latexOp = '\\cdot'; }
        
        // JS Floating point fix
        ans = Math.round(ans * 100) / 100;

        return {
            renderData: { latex: `${a} ${latexOp} ${b}`, description: lang === 'sv' ? "Beräkna" : "Calculate", answerType: type },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: extraClues.length > 0 ? extraClues : [
                { text: lang === 'sv' ? "Använd papper och penna om det behövs." : "Use paper and pencil if needed." }
            ]
        };
    }
}