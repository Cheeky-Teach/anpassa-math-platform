import { MathUtils } from '../utils/MathUtils.js';
import { LinearEquationProblemGen } from './LinearEquationProblemGen.js';

export class LinearEquationGen {
    private problemGen: LinearEquationProblemGen;

    constructor() {
        this.problemGen = new LinearEquationProblemGen();
    }

    public generate(level: number, lang: string = 'sv'): any {
        // DELEGATION LOGIC
        if (level === 5 || level === 6) {
            return this.problemGen.generate(level, lang);
        }
        
        if (level === 7) {
            return this.level7_Mixed(lang);
        }

        // INTERNAL LOGIC (Levels 1-4)
        switch (level) {
            case 1: return this.level1_OneStep(lang);
            case 2: return this.level2_TwoStep(lang);
            case 3: return this.level3_Parentheses(lang);
            case 4: return this.level4_BothSides(lang);
            default: return this.level1_OneStep(lang);
        }
    }

    // --- PROCEDURAL LEVELS (1-4) ---

    // Level 1: One-step equations (x + a = b, x - a = b, ax = b, x/a = b)
    private level1_OneStep(lang: string): any {
        const type = MathUtils.randomInt(0, 3);
        const x = MathUtils.randomInt(2, 15);
        let latex = '', answer = x.toString();
        let clues = [];

        if (type === 0) { // x + a = b
            const a = MathUtils.randomInt(1, 10);
            latex = `x + ${a} = ${x + a}`;
            clues = [{ text: lang === 'sv' ? `Subtrahera ${a} från båda sidor.` : `Subtract ${a} from both sides.`, latex: `x = ${x + a} - ${a}` }];
        } else if (type === 1) { // x - a = b
            const a = MathUtils.randomInt(1, 10);
            latex = `x - ${a} = ${x - a}`;
            clues = [{ text: lang === 'sv' ? `Addera ${a} till båda sidor.` : `Add ${a} to both sides.`, latex: `x = ${x - a} + ${a}` }];
        } else if (type === 2) { // ax = b
            const a = MathUtils.randomInt(2, 9);
            latex = `${a}x = ${a * x}`;
            clues = [{ text: lang === 'sv' ? `Dela båda sidor med ${a}.` : `Divide both sides by ${a}.`, latex: `x = \\frac{${a * x}}{${a}}` }];
        } else { // x/a = b
            const a = MathUtils.randomInt(2, 9);
            latex = `\\frac{x}{${a}} = ${x / a}`;
            // Ensure x is divisible by a for cleaner integer math in generation, though logic holds
            const b = MathUtils.randomInt(2, 9);
            const num = b * a; 
            latex = `\\frac{x}{${a}} = ${b}`;
            answer = num.toString();
            clues = [{ text: lang === 'sv' ? `Multiplicera båda sidor med ${a}.` : `Multiply both sides by ${a}.`, latex: `x = ${b} \\cdot ${a}` }];
        }

        return {
            renderData: { latex, description: lang === 'sv' ? "Lös ekvationen" : "Solve the equation", answerType: 'text' },
            token: Buffer.from(answer).toString('base64'),
            clues
        };
    }

    // Level 2: Two-step equations (ax + b = c)
    private level2_TwoStep(lang: string): any {
        const x = MathUtils.randomInt(2, 10);
        const a = MathUtils.randomInt(2, 6);
        const b = MathUtils.randomInt(1, 15) * (Math.random() > 0.5 ? 1 : -1);
        const c = a * x + b;
        const op = b < 0 ? '-' : '+';
        const bAbs = Math.abs(b);

        return {
            renderData: { latex: `${a}x ${op} ${bAbs} = ${c}`, description: lang === 'sv' ? "Lös ekvationen" : "Solve the equation", answerType: 'text' },
            token: Buffer.from(x.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? `Få bort konstanten (${b}) först.` : `Get rid of the constant (${b}) first.`, latex: `${a}x = ${c} ${b < 0 ? '+' : '-'} ${bAbs}` },
                { text: lang === 'sv' ? `Dela nu med koefficienten framför x (${a}).` : `Now divide by the coefficient of x (${a}).`, latex: `x = \\frac{${c - b}}{${a}}` }
            ]
        };
    }

    // Level 3: Parentheses a(x + b) = c
    private level3_Parentheses(lang: string): any {
        const x = MathUtils.randomInt(2, 8);
        const a = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
        const rhs = a * (x + b);
        const op = b < 0 ? '-' : '+';

        return {
            renderData: { latex: `${a}(x ${op} ${Math.abs(b)}) = ${rhs}`, description: lang === 'sv' ? "Lös ekvationen" : "Solve the equation", answerType: 'text' },
            token: Buffer.from(x.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Multiplicera in i parentesen." : "Multiply into the parentheses (distribute).", latex: `${a}x ${a * b < 0 ? '-' : '+'} ${Math.abs(a * b)} = ${rhs}` },
                { text: lang === 'sv' ? "Nu har du en vanlig ekvation. Lös ut x." : "Now you have a standard equation. Solve for x." }
            ]
        };
    }

    // Level 4: Variables on both sides (ax + b = cx + d)
    private level4_BothSides(lang: string): any {
        const x = MathUtils.randomInt(2, 8);
        const c = MathUtils.randomInt(2, 5); // Smaller x coefficient
        const a = c + MathUtils.randomInt(1, 4); // Larger x coefficient
        const b = MathUtils.randomInt(1, 10);
        const d = (a * x + b) - (c * x);

        return {
            renderData: { latex: `${a}x + ${b} = ${c}x + ${d}`, description: lang === 'sv' ? "Lös ekvationen" : "Solve the equation", answerType: 'text' },
            token: Buffer.from(x.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? `Samla alla x på ena sidan (subtrahera ${c}x).` : `Gather all x's on one side (subtract ${c}x).`, latex: `${a - c}x + ${b} = ${d}` },
                { text: lang === 'sv' ? "Flytta över konstanterna och lös ut x." : "Move constants to the other side and solve." }
            ]
        };
    }

    // Level 7: Mixed (Procedural + Word Problems)
    private level7_Mixed(lang: string): any {
        // 80% chance of procedural, 20% chance of word problem
        if (Math.random() > 0.8) {
            const lvl = MathUtils.randomInt(5, 6);
            return this.problemGen.generate(lvl, lang);
        } else {
            const lvl = MathUtils.randomInt(1, 4);
            return this.generate(lvl, lang);
        }
    }
}