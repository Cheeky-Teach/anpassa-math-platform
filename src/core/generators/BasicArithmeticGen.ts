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

    // Helper for vertical layout
    private makeVertical(top: number | string, bottom: number | string, op: string): string {
        return `\\begin{array}{r} ${top} \\\\ ${op} \\; ${bottom} \\\\ \\hline \\end{array}`;
    }

    // Level 1: Addition (1-3 digits)
    private level1_AddSimple(lang: string): any {
        const a = MathUtils.randomInt(1, 999);
        const b = MathUtils.randomInt(1, 999);
        const isVertical = MathUtils.randomInt(0, 1) === 1;
        
        return this.createProblem(a, b, '+', lang, isVertical);
    }

    // Level 2: Subtraction
    private level2_SubSimple(lang: string): any {
        const a = MathUtils.randomInt(2, 999);
        const b = MathUtils.randomInt(1, a - 1);
        const isVertical = MathUtils.randomInt(0, 1) === 1;

        return this.createProblem(a, b, '-', lang, isVertical);
    }

    // Level 3: Decimals (+/-)
    private level3_Decimals(lang: string): any {
        const op = MathUtils.randomChoice(['+', '-']);
        
        // Legacy Logic: Ensure reasonable numbers
        const getDec = () => MathUtils.randomInt(1, 4900) / 100;
        let a = getDec();
        let b = getDec();

        if (op === '+') {
            while (Math.floor(a + b) > 50) { a = getDec(); b = getDec(); }
        } else {
            if (b > a) [a, b] = [b, a]; // Ensure positive result
            while (Math.floor(a - b) > 50) { a = getDec(); b = getDec(); if (b > a) [a, b] = [b, a]; }
        }
        
        // Always vertical for decimals to encourage alignment practice
        return this.createProblem(a, b, op, lang, true, [
            { text: lang === 'sv' ? "Ställ upp talen ovanpå varandra." : "Line up the numbers vertically." },
            { text: lang === 'sv' ? "Viktigt: Decimaltecknen måste vara rakt under varandra." : "Important: The decimal points must line up vertically." }
        ]);
    }

    // Level 4: Mult Easy (Tables 2-9)
    private level4_MultEasy(lang: string): any {
        const a = MathUtils.randomInt(1, 10);
        const b = MathUtils.randomInt(1, 10);
        const isVertical = MathUtils.randomInt(0, 1) === 1;
        return this.createProblem(a, b, '*', lang, isVertical);
    }

    // Level 5: Mult Medium (2 digit x 1 digit)
    private level5_MultMedium(lang: string): any {
        const a = MathUtils.randomInt(2, 20);
        const b = MathUtils.randomInt(2, 20);
        const isVertical = MathUtils.randomInt(0, 1) === 1;
        return this.createProblem(a, b, '*', lang, isVertical);
    }

    // Level 6: Mult Hard (Decimals) - Restored Legacy Subtypes
    private level6_MultHard(lang: string): any {
        const type = MathUtils.randomInt(1, 4);
        let a = 0, b = 0;

        if (type === 1) { // 0.x * 0.y
            a = MathUtils.randomInt(1, 9) / 10;
            b = MathUtils.randomInt(1, 9) / 10;
        } else if (type === 2) { // Int * 0.x
            a = MathUtils.randomInt(2, 20);
            b = MathUtils.randomInt(1, 9) / 10;
        } else if (type === 3) { // 0.x * 0.yz
            a = MathUtils.randomInt(1, 9) / 10;
            b = MathUtils.randomInt(1, 99) / 100;
        } else { // Int * 0.yz
            a = MathUtils.randomInt(2, 20);
            b = MathUtils.randomInt(1, 99) / 100;
        }

        return this.createProblem(a, b, '*', lang, false, [
            { text: lang === 'sv' ? "Ignorera decimalen först. Räkna som heltal." : "Ignore the decimal first. Calculate as integers." },
            { text: lang === 'sv' ? "Räkna sedan hur många decimaler talen har totalt och sätt in i svaret." : "Count total decimal places and apply to the answer." }
        ]);
    }

    // Level 7: Division Easy (Integer results)
    private level7_DivEasy(lang: string): any {
        const f1 = MathUtils.randomInt(1, 10);
        const f2 = MathUtils.randomInt(1, 10);
        const product = f1 * f2;
        const divisor = MathUtils.randomInt(0, 1) === 1 ? f1 : f2;
        const answer = product / divisor;
        
        const latex = `\\frac{${product}}{${divisor}}`;
        const desc = lang === 'sv' ? "Dividera." : "Divide.";

        return {
            renderData: { latex, description: desc, answerType: 'text' },
            token: Buffer.from(answer.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? `Tänk multiplikation: Vad gånger ${divisor} blir ${product}?` : `Think multiplication: What times ${divisor} makes ${product}?`, latex: `${divisor} \\cdot ? = ${product}` }
            ]
        };
    }

    // Level 8: Mixed Integers
    private level8_MixedIntegers(lang: string): any {
        const mode = MathUtils.randomChoice([1, 2, 4, 7]);
        if (mode === 1) return this.level1_AddSimple(lang);
        if (mode === 2) return this.level2_SubSimple(lang);
        if (mode === 4) return this.level4_MultEasy(lang);
        return this.level7_DivEasy(lang);
    }

    // Level 9: Mixed Decimals
    private level9_MixedDecimals(lang: string): any {
        const type = MathUtils.randomInt(1, 7);
        // Map 1-7 range roughly to the decimal/harder types
        if (type <= 3) return this.level3_Decimals(lang); // Add/Sub
        if (type <= 6) return this.level6_MultHard(lang); // Mult
        return this.level7_DivEasy(lang); // Keep division integer based for now as per legacy
    }

    // Helper
    private createProblem(a: number, b: number, op: string, lang: string, vertical: boolean = false, extraClues: any[] = []) {
        let ans = 0;
        let latex = "";
        
        if (op === '+') ans = a + b;
        if (op === '-') ans = a - b;
        if (op === '*') ans = a * b;
        
        // JS Floating point fix
        ans = Math.round(ans * 1000) / 1000;

        if (vertical) {
            const opSymbol = op === '*' ? '\\times' : op;
            const top = Math.max(a, b); // Standard convention puts larger on top usually
            const bot = Math.min(a, b);
            // Exception: Subtraction must respect order a - b
            if (op === '-') {
                latex = this.makeVertical(a, b, opSymbol);
            } else {
                latex = this.makeVertical(top, bot, opSymbol);
            }
        } else {
            const opSymbol = op === '*' ? '\\cdot' : op;
            latex = `${a} ${opSymbol} ${b}`;
        }

        const description = vertical 
            ? (lang === 'sv' ? "Ställ upp och beräkna." : "Set up and calculate.")
            : (lang === 'sv' ? "Beräkna." : "Calculate.");

        // Default clues if none provided
        const defaultClues = [];
        if (vertical) {
            defaultClues.push({ text: lang === 'sv' ? "Börja räkna från höger (entalen)." : "Start calculating from the right (ones)." });
        }

        return {
            renderData: { latex, description, answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: extraClues.length > 0 ? extraClues : defaultClues
        };
    }
}