import { MathUtils } from '../utils/MathUtils';

export class ExpressionSimplificationGen {
    public generate(level: number, lang: string = 'sv') {
        switch (level) {
            case 1: return this.level1_CombineTerms(lang);
            case 2: return this.level2_Parentheses(lang);
            case 3: return this.level3_DistributeAndSimplify(lang);
            case 4: return this.level4_SubtractParentheses(lang);
            case 5: return this.level5_WordProblems(lang);
            case 6: return this.level6_Mixed(lang);
            default: return this.level1_CombineTerms(lang);
        }
    }

    // --- LEVEL 1: Combine Like Terms ---
    // Ex: 3x + 5 + 2x - 3 -> 5x + 2
    private level1_CombineTerms(lang: string) {
        const x1 = MathUtils.randomInt(2, 9);
        const x2 = MathUtils.randomInt(1, 9) * (Math.random() > 0.5 ? 1 : -1);
        const c1 = MathUtils.randomInt(1, 10);
        const c2 = MathUtils.randomInt(1, 10) * (Math.random() > 0.5 ? 1 : -1);

        // Ensure non-zero x result for clear questions
        if (x1 + x2 === 0) return this.level1_CombineTerms(lang);

        // Shuffle terms visually: 3x + 5 - 2x - 3
        const parts = [
            this.fmt(x1, 'x'),
            this.fmt(c1, ''),
            this.fmt(x2, 'x', true),
            this.fmt(c2, '', true)
        ];
        
        // Randomize order slightly? For level 1, keep variables and constants grouped or interleaved.
        // Let's stick to interleaved for challenge: 3x + 5 - 2x - 3
        const latex = parts.join(' ');

        // Calculate Answer
        const ansX = x1 + x2;
        const ansC = c1 + c2;
        const answer = this.buildExpr(ansX, ansC);

        return {
            renderData: { 
                latex, 
                description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", 
                answerType: 'text' 
            },
            token: Buffer.from(answer).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Addera x-termer för sig och tal för sig." : "Add x-terms together and numbers together." },
                { text: lang === 'sv' ? `x-termer: ${x1}x ${x2 > 0 ? '+ ' + x2 : x2}x` : `x-terms: ${x1}x ${x2 > 0 ? '+ ' + x2 : x2}x` }
            ]
        };
    }

    // --- LEVEL 2: Parentheses (Distribution) ---
    // Ex: 3(x + 2) -> 3x + 6
    private level2_Parentheses(lang: string) {
        const a = MathUtils.randomInt(2, 9);
        const b = MathUtils.randomInt(1, 9);
        const op = Math.random() > 0.5 ? '+' : '-';
        
        const latex = `${a}(x ${op} ${b})`;
        
        const ansX = a;
        const ansC = op === '+' ? (a * b) : (a * -b);
        const answer = this.buildExpr(ansX, ansC);

        return {
            renderData: { 
                latex, 
                description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", 
                answerType: 'text' 
            },
            token: Buffer.from(answer).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Multiplicera in talet framför parentesen med båda termerna inuti." : "Multiply the number outside the parentheses with both terms inside." },
                { latex: `${a} \\cdot x \\text{ och } ${a} \\cdot ${op === '+' ? b : -b}` }
            ]
        };
    }

    // --- LEVEL 3: Distribute & Simplify ---
    // Ex: 2(x + 3) + 4x -> 6x + 6
    private level3_DistributeAndSimplify(lang: string) {
        const a = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(1, 5);
        const extraX = MathUtils.randomInt(2, 6);
        const op = Math.random() > 0.5 ? '+' : '-'; // Sign inside parentheses

        // 2(x + 3) + 4x
        const latex = `${a}(x ${op} ${b}) + ${extraX}x`;

        const distC = op === '+' ? (a * b) : (a * -b);
        const totalX = a + extraX;
        const answer = this.buildExpr(totalX, distC);

        return {
            renderData: { 
                latex, 
                description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", 
                answerType: 'text' 
            },
            token: Buffer.from(answer).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Börja med att ta bort parentesen." : "Start by removing the parentheses." },
                { latex: `${a}x ${distC > 0 ? '+' + distC : distC} + ${extraX}x` }
            ]
        };
    }

    // --- LEVEL 4: Subtracting Parentheses ---
    // Ex: 5x - (2x + 3) -> 3x - 3
    private level4_SubtractParentheses(lang: string) {
        const startX = MathUtils.randomInt(5, 12);
        const subX = MathUtils.randomInt(1, startX - 1); // Ensure positive x result
        const b = MathUtils.randomInt(1, 9);
        const op = Math.random() > 0.5 ? '+' : '-';

        // 5x - (2x + 3)
        const latex = `${startX}x - (${subX}x ${op} ${b})`;

        // Logic: minus sign flips signs inside
        // const inside = subX*x + (op==+ ? b : -b)
        // result = startX*x - subX*x - (op==+ ? b : -b)
        
        const ansX = startX - subX;
        const ansC = op === '+' ? -b : b; // Flip sign
        const answer = this.buildExpr(ansX, ansC);

        return {
            renderData: { 
                latex, 
                description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", 
                answerType: 'text' 
            },
            token: Buffer.from(answer).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Ett minus framför parentesen ändrar tecknen inuti." : "A minus sign in front of parentheses changes the signs inside." },
                { latex: `${startX}x - ${subX}x ${op === '+' ? '-' : '+'} ${b}` }
            ]
        };
    }

    // --- LEVEL 5: Word Problems ---
    private level5_WordProblems(lang: string) {
        const types = ['geometry', 'apples', 'age'];
        const type = MathUtils.randomChoice(types);

        let desc = "";
        let ans = "";
        let clues = [];

        if (type === 'geometry') {
            const side = MathUtils.randomInt(2, 9);
            desc = lang === 'sv' 
                ? `Skriv ett uttryck för omkretsen av en rektangel med basen x och höjden ${side}.`
                : `Write an expression for the perimeter of a rectangle with base x and height ${side}.`;
            // P = x + x + side + side = 2x + 2*side
            ans = this.buildExpr(2, side * 2);
            clues = [{ text: lang === 'sv' ? "Omkrets = sida + sida + sida + sida" : "Perimeter = side + side + side + side" }];
        } else if (type === 'apples') {
            const extra = MathUtils.randomInt(2, 5);
            desc = lang === 'sv' 
                ? `Du har x äpplen. Din kompis har dubbelt så många som du, plus ${extra}. Skriv ett uttryck för hur många din kompis har.`
                : `You have x apples. Your friend has twice as many as you, plus ${extra}. Write an expression for how many your friend has.`;
            ans = this.buildExpr(2, extra);
            clues = [{ text: lang === 'sv' ? "Dubbelt så många = 2x" : "Twice as many = 2x" }];
        } else {
            const diff = MathUtils.randomInt(2, 5);
            desc = lang === 'sv' 
                ? `Elias är x år gammal. Hans syster är ${diff} år yngre. Skriv ett uttryck för systerns ålder.`
                : `Elias is x years old. His sister is ${diff} years younger. Write an expression for the sister's age.`;
            ans = this.buildExpr(1, -diff);
            clues = [{ text: lang === 'sv' ? "Yngre betyder minus." : "Younger means minus." }];
        }

        return {
            renderData: { 
                latex: "", 
                description: desc, 
                answerType: 'text' 
            },
            token: Buffer.from(ans).toString('base64'),
            clues
        };
    }

    // --- LEVEL 6: Mixed ---
    private level6_Mixed(lang: string) {
        const lvl = MathUtils.randomInt(1, 4);
        return this.generate(lvl, lang);
    }

    // --- HELPERS ---

    // Format single term: 1x -> x, -1x -> -x, 0x -> '', 5 -> 5
    private fmt(coeff: number, variable: string, explicitSign: boolean = false): string {
        if (coeff === 0) return '';
        
        let sign = '';
        if (explicitSign && coeff > 0) sign = '+ ';
        if (coeff < 0) sign = '- '; // Space after minus for readability in non-latex parts if needed

        const abs = Math.abs(coeff);
        let valStr = abs.toString();
        
        // Don't show '1' if there is a variable, e.g. 1x -> x
        if (variable && abs === 1) valStr = '';

        return `${sign}${valStr}${variable}`;
    }

    // Build final expression string: 3x - 5
    private buildExpr(xCoeff: number, constant: number): string {
        if (xCoeff === 0 && constant === 0) return "0";
        
        let s = "";
        
        // X Term
        if (xCoeff !== 0) {
            if (xCoeff === 1) s += "x";
            else if (xCoeff === -1) s += "-x";
            else s += `${xCoeff}x`;
        }

        // Constant Term
        if (constant !== 0) {
            if (constant > 0) {
                // Add plus only if we already have an x term
                s += (s.length > 0 ? "+" : "") + constant;
            } else {
                s += constant; // Minus sign is built-in to negative number
            }
        }
        
        return s;
    }
}