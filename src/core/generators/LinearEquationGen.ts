import { MathUtils } from '../utils/MathUtils.js';
import { LinearEquationProblemGen } from './LinearEquationProblemGen.js';

export class LinearEquationGen {
    private problemGen: LinearEquationProblemGen;

    constructor() {
        this.problemGen = new LinearEquationProblemGen();
    }

    public generate(level: number, lang: string = 'sv'): any {
        // Delegate Word Problems to the Specialist
        if (level === 5 || level === 6) {
            return this.problemGen.generate(level, lang);
        }
        
        // Mixed Level Drill
        if (level === 7) {
            return this.level7_Mixed(lang);
        }

        switch (level) {
            case 1: return this.level1_OneStep(lang);
            case 2: return this.level2_TwoStep(lang);
            case 3: return this.level3_Parentheses(lang);
            case 4: return this.level4_BothSides(lang);
            default: return this.level1_OneStep(lang);
        }
    }

    // --- LEVEL 1: One-Step Equations ---
    private level1_OneStep(lang: string): any {
        const type = MathUtils.randomInt(1, 4);
        let latex = '', answer = '', clues = [];
        
        if (type === 1) { // x / k = res
            const k = MathUtils.randomInt(2, 9);
            const res = MathUtils.randomInt(2, 10);
            const val = res * k;
            latex = `\\frac{x}{${k}} = ${res}`;
            answer = val.toString();
            clues = [{ 
                text: lang === 'sv' ? `För att få x ensamt, multiplicera båda sidor med ${k}.` : `To isolate x, multiply both sides by ${k}.`, 
                latex: `x = ${res} \\cdot ${k}` 
            }];
        } 
        else if (type === 2) { // k * x = res
            const k = MathUtils.randomInt(2, 9);
            const val = MathUtils.randomInt(2, 10);
            const res = k * val;
            latex = `${k}x = ${res}`;
            answer = val.toString();
            clues = [{ 
                text: lang === 'sv' ? `För att få x ensamt, dela båda sidor med ${k}.` : `To isolate x, divide both sides by ${k}.`, 
                latex: `x = \\frac{${res}}{${k}}` 
            }];
        } 
        else if (type === 3) { // x + k = res
            const k = MathUtils.randomInt(1, 20);
            const val = MathUtils.randomInt(1, 20);
            const res = val + k;
            latex = `x + ${k} = ${res}`;
            answer = val.toString();
            clues = [{ 
                text: lang === 'sv' ? `Subtrahera ${k} från båda sidor för att få x ensamt.` : `Subtract ${k} from both sides to isolate x.`, 
                latex: `x = ${res} - ${k}` 
            }];
        } 
        else { // x - k = res
            const k = MathUtils.randomInt(1, 20);
            const val = MathUtils.randomInt(1, 20);
            const res = val - k;
            latex = `x - ${k} = ${res}`;
            answer = val.toString();
            clues = [{ 
                text: lang === 'sv' ? `Addera ${k} till båda sidor för att få x ensamt.` : `Add ${k} to both sides to isolate x.`, 
                latex: `x = ${res} + ${k}` 
            }];
        }

        return {
            renderData: { 
                latex, 
                description: lang === 'sv' ? "Lös ekvationen" : "Solve the equation", 
                answerType: 'text' 
            },
            token: Buffer.from(answer).toString('base64'),
            clues
        };
    }

    // --- LEVEL 2: Two-Step Equations ---
    // Varieties: ax+b=c, ax-b=c, x/a+b=c, x/a-b=c
    private level2_TwoStep(lang: string): any {
        const type = MathUtils.randomInt(1, 4);
        const x = MathUtils.randomInt(2, 12);
        let latex = '', answer = x.toString(), clues = [];

        if (type === 1) { // ax + b = c
            const a = MathUtils.randomInt(2, 9);
            const b = MathUtils.randomInt(1, 15);
            const c = a * x + b;
            latex = `${a}x + ${b} = ${c}`;
            clues = [
                { text: lang === 'sv' ? `Börja med att ta bort konstanten ${b} (subtrahera).` : `Start by removing the constant ${b} (subtract).`, latex: `${a}x = ${c} - ${b}` },
                { text: lang === 'sv' ? `Dela nu med ${a} för att hitta x.` : `Now divide by ${a} to find x.`, latex: `x = \\frac{${c-b}}{${a}}` }
            ];
        }
        else if (type === 2) { // ax - b = c
            const a = MathUtils.randomInt(2, 9);
            const b = MathUtils.randomInt(1, 15);
            const c = a * x - b;
            latex = `${a}x - ${b} = ${c}`;
            clues = [
                { text: lang === 'sv' ? `Börja med att ta bort ${b} genom att addera det.` : `Start by removing ${b} by adding it.`, latex: `${a}x = ${c} + ${b}` },
                { text: lang === 'sv' ? `Dela med ${a}.` : `Divide by ${a}.`, latex: `x = \\frac{${c+b}}{${a}}` }
            ];
        }
        else if (type === 3) { // x/a + b = c
            const a = MathUtils.randomInt(2, 8);
            const b = MathUtils.randomInt(1, 10);
            const realX = x * a; 
            const c = x + b; // Here x represents (x/a) value temporarily in logic
            latex = `\\frac{x}{${a}} + ${b} = ${c}`;
            answer = realX.toString();
            clues = [
                { text: lang === 'sv' ? `Ta bort ${b} först (subtrahera).` : `Remove ${b} first (subtract).`, latex: `\\frac{x}{${a}} = ${c} - ${b} = ${c-b}` },
                { text: lang === 'sv' ? `Multiplicera med ${a} för att få x ensamt.` : `Multiply by ${a} to isolate x.`, latex: `x = ${c-b} \\cdot ${a}` }
            ];
        }
        else { // x/a - b = c
            const a = MathUtils.randomInt(2, 8);
            const b = MathUtils.randomInt(1, 10);
            const realX = x * a;
            const c = x - b; 
            latex = `\\frac{x}{${a}} - ${b} = ${c}`;
            answer = realX.toString();
            clues = [
                { text: lang === 'sv' ? `Ta bort ${b} först (addera).` : `Remove ${b} first (add).`, latex: `\\frac{x}{${a}} = ${c} + ${b} = ${c+b}` },
                { text: lang === 'sv' ? `Multiplicera med ${a} för att få x ensamt.` : `Multiply by ${a} to isolate x.`, latex: `x = ${c+b} \\cdot ${a}` }
            ];
        }

        return {
            renderData: { latex, description: lang === 'sv' ? "Lös ekvationen" : "Solve the equation", answerType: 'text' },
            token: Buffer.from(answer).toString('base64'),
            clues
        };
    }

    // --- LEVEL 3: Parentheses ---
    // Varieties: a(x+b)=c, a(x-b)=c, a(bx-c)=d, a(bx+c)=d
    private level3_Parentheses(lang: string): any {
        const type = MathUtils.randomInt(1, 4);
        const a = MathUtils.randomInt(2, 6);
        let latex = '', answer = '', clues = [];

        if (type === 1) { // a(x + b) = c
            const x = MathUtils.randomInt(1, 10);
            const b = MathUtils.randomInt(1, 9);
            const c = a * (x + b);
            answer = x.toString();
            latex = `${a}(x + ${b}) = ${c}`;
            clues = [
                { text: lang === 'sv' ? "Multiplicera in i parentesen." : "Distribute into the parentheses.", latex: `${a}x + ${a*b} = ${c}` },
                { text: lang === 'sv' ? "Lös sedan ekvationen som vanligt." : "Then solve the equation as usual.", latex: `${a}x = ${c - a*b}` }
            ];
        }
        else if (type === 2) { // a(x - b) = c
            const x = MathUtils.randomInt(5, 15);
            const b = MathUtils.randomInt(1, x - 1);
            const c = a * (x - b);
            answer = x.toString();
            latex = `${a}(x - ${b}) = ${c}`;
            clues = [
                { text: lang === 'sv' ? "Multiplicera in (kom ihåg minustecknet)." : "Distribute (remember the minus sign).", latex: `${a}x - ${a*b} = ${c}` },
                { text: lang === 'sv' ? `Addera ${a*b} till båda sidor.` : `Add ${a*b} to both sides.`, latex: `${a}x = ${c + a*b}` }
            ];
        }
        else if (type === 3) { // a(bx - c) = d (Inner coefficient)
            const bVar = MathUtils.randomInt(2, 5);
            const x = MathUtils.randomInt(2, 8);
            const cVar = MathUtils.randomInt(1, bVar * x - 1);
            const d = a * (bVar * x - cVar);
            answer = x.toString();
            latex = `${a}(${bVar}x - ${cVar}) = ${d}`;
            clues = [
                { text: lang === 'sv' ? `Multiplicera in ${a} i parentesen.` : `Distribute ${a} into the parentheses.`, latex: `${a*bVar}x - ${a*cVar} = ${d}` },
                { text: lang === 'sv' ? "Addera konstanten och dela med koefficienten." : "Add the constant and divide by the coefficient." }
            ];
        }
        else { // a(bx + c) = d
            const bVar = MathUtils.randomInt(2, 5);
            const x = MathUtils.randomInt(1, 8);
            const cVar = MathUtils.randomInt(1, 9);
            const d = a * (bVar * x + cVar);
            answer = x.toString();
            latex = `${a}(${bVar}x + ${cVar}) = ${d}`;
            clues = [
                { text: lang === 'sv' ? "Multiplicera in i parentesen." : "Distribute into the parentheses.", latex: `${a*bVar}x + ${a*cVar} = ${d}` },
                { text: lang === 'sv' ? "Subtrahera konstanten och dela med koefficienten." : "Subtract the constant and divide by the coefficient." }
            ];
        }

        return {
            renderData: { latex, description: lang === 'sv' ? "Lös ekvationen" : "Solve the equation", answerType: 'text' },
            token: Buffer.from(answer).toString('base64'),
            clues
        };
    }

    // --- LEVEL 4: Variables on Both Sides ---
    private level4_BothSides(lang: string): any {
        const type = MathUtils.randomInt(1, 4);
        const x = MathUtils.randomInt(1, 10);
        let a = MathUtils.randomInt(3, 9);
        let c = MathUtils.randomInt(2, a - 1); // a > c to keep x positive usually
        if (a === c) a++;

        let latex = '', answer = x.toString(), clues = [];

        if (type === 1) { // ax + b = cx + d
            const b = MathUtils.randomInt(1, 15);
            const d = a*x + b - c*x;
            if (d <= 0) return this.level4_BothSides(lang); // Retry for clean numbers

            latex = `${a}x + ${b} = ${c}x + ${d}`;
            clues = [
                { text: lang === 'sv' ? `Samla x på ena sidan. Subtrahera ${c}x.` : `Gather x on one side. Subtract ${c}x.`, latex: `${a-c}x + ${b} = ${d}` },
                { text: lang === 'sv' ? "Flytta över konstanten och lös ut x." : "Move the constant and solve for x." }
            ];
        }
        else if (type === 2) { // ax - b = cx + d
            const b = MathUtils.randomInt(1, 15);
            const d = a*x - b - c*x;
            if (d <= 0) return this.level4_BothSides(lang);

            latex = `${a}x - ${b} = ${c}x + ${d}`;
            clues = [
                { text: lang === 'sv' ? `Subtrahera ${c}x från båda sidor.` : `Subtract ${c}x from both sides.`, latex: `${a-c}x - ${b} = ${d}` },
                { text: lang === 'sv' ? `Addera ${b} till båda sidor.` : `Add ${b} to both sides.` }
            ];
        }
        else if (type === 3) { // ax + b = cx - d (Requires swapping to keep x positive visual simple)
            // Ensure c > a for this form typically, or handle negative
            const temp = a; a = c; c = temp; 
            const b = MathUtils.randomInt(1, 15);
            const d = c*x - a*x - b; // derived d
            if (d <= 0) return this.level4_BothSides(lang); // Retry

            // equation: ax + b = cx - d
            latex = `${a}x + ${b} = ${c}x - ${d}`;
            clues = [
                { text: lang === 'sv' ? `Subtrahera ${a}x från båda sidor (för att hålla x positivt).` : `Subtract ${a}x from both sides (to keep x positive).`, latex: `${b} = ${c-a}x - ${d}` },
                { text: lang === 'sv' ? `Addera ${d} till båda sidor.` : `Add ${d} to both sides.`, latex: `${b+d} = ${c-a}x` }
            ];
        }
        else { // ax - b = cx - d
            if (a < c) { const t = a; a = c; c = t; }
            const b = MathUtils.randomInt(5, 20);
            const d = b - (a*x - c*x);
            if (d <= 0) return this.level4_BothSides(lang);

            latex = `${a}x - ${b} = ${c}x - ${d}`;
            clues = [
                { text: lang === 'sv' ? `Subtrahera ${c}x från båda sidor.` : `Subtract ${c}x from both sides.`, latex: `${a-c}x - ${b} = -${d}` },
                { text: lang === 'sv' ? `Addera ${b} till båda sidor.` : `Add ${b} to both sides.` }
            ];
        }

        return {
            renderData: { latex, description: lang === 'sv' ? "Lös ekvationen" : "Solve the equation", answerType: 'text' },
            token: Buffer.from(answer).toString('base64'),
            clues
        };
    }

    private level7_Mixed(lang: string): any {
        // Random procedural level 1-4
        return this.generate(MathUtils.randomInt(1, 4), lang);
    }
}