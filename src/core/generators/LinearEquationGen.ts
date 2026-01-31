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
        let latex = '', answer = '';
        // FIX: Explicitly type the array to avoid 'never[]' inference
        let clues: any[] = [];
        
        if (type === 1) { // x / k = res
            const k = MathUtils.randomInt(2, 9);
            const res = MathUtils.randomInt(2, 9);
            const x = k * res;
            latex = `\\frac{x}{${k}} = ${res}`;
            answer = x.toString();
            clues = [
                { 
                    text: lang === 'sv' ? `Multiplicera med ${k} på båda sidor.` : `Multiply by ${k} on both sides.`, 
                    latex: `x = ${res} \\cdot ${k}` 
                }
            ];
        } 
        else if (type === 2) { // k * x = res
            const k = MathUtils.randomInt(2, 9);
            const x = MathUtils.randomInt(2, 9);
            const res = k * x;
            latex = `${k}x = ${res}`;
            answer = x.toString();
            clues = [
                { 
                    text: lang === 'sv' ? `Dela med ${k} på båda sidor.` : `Divide by ${k} on both sides.`, 
                    latex: `x = \\frac{${res}}{${k}}` 
                }
            ];
        }
        else if (type === 3) { // x + k = res
            const k = MathUtils.randomInt(1, 15);
            const x = MathUtils.randomInt(1, 15);
            const res = x + k;
            latex = `x + ${k} = ${res}`;
            answer = x.toString();
            clues = [
                { 
                    text: lang === 'sv' ? `Subtrahera ${k} från båda sidor.` : `Subtract ${k} from both sides.`, 
                    latex: `x = ${res} - ${k}` 
                }
            ];
        }
        else { // x - k = res
            const k = MathUtils.randomInt(1, 15);
            const x = MathUtils.randomInt(2, 15);
            const res = x - k;
            latex = `x - ${k} = ${res}`;
            answer = x.toString();
            clues = [
                { 
                    text: lang === 'sv' ? `Addera ${k} till båda sidor.` : `Add ${k} to both sides.`, 
                    latex: `x = ${res} + ${k}` 
                }
            ];
        }

        return {
            renderData: {
                latex: latex,
                description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.",
                answerType: 'numeric',
                prefix: 'x ='
            },
            token: Buffer.from(answer).toString('base64'),
            serverData: { answer, solutionSteps: clues }
        };
    }

    // --- LEVEL 2: Two-Step Equations ---
    private level2_TwoStep(lang: string): any {
        const a = MathUtils.randomInt(2, 9);
        const x = MathUtils.randomInt(1, 10);
        const b = MathUtils.randomInt(1, 15);
        
        const type = MathUtils.randomInt(0, 1);
        let latex = '', clues: any[] = [];

        if (type === 0) { // ax + b = c
            const c = a * x + b;
            latex = `${a}x + ${b} = ${c}`;
            clues = [
                { 
                    text: lang === 'sv' ? `Börja med att subtrahera ${b}.` : `Start by subtracting ${b}.`, 
                    latex: `${a}x = ${c} - ${b} \\implies ${a}x = ${c - b}` 
                },
                { 
                    text: lang === 'sv' ? `Dela nu med ${a}.` : `Now divide by ${a}.`, 
                    latex: `x = \\frac{${c - b}}{${a}} = ${x}` 
                }
            ];
        } else { // ax - b = c
            const c = a * x - b;
            latex = `${a}x - ${b} = ${c}`;
            clues = [
                { 
                    text: lang === 'sv' ? `Börja med att addera ${b} till båda sidor.` : `Start by adding ${b} to both sides.`, 
                    latex: `${a}x = ${c} + ${b} \\implies ${a}x = ${c + b}` 
                },
                { 
                    text: lang === 'sv' ? `Dela nu med ${a}.` : `Now divide by ${a}.`, 
                    latex: `x = \\frac{${c + b}}{${a}} = ${x}` 
                }
            ];
        }

        return {
            renderData: {
                latex: latex,
                description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.",
                answerType: 'numeric',
                prefix: 'x ='
            },
            token: Buffer.from(x.toString()).toString('base64'),
            serverData: { answer: x.toString(), solutionSteps: clues }
        };
    }

    // --- LEVEL 3: With Parentheses ---
    private level3_Parentheses(lang: string): any {
        const a = MathUtils.randomInt(2, 6);
        const x = MathUtils.randomInt(1, 8);
        const b = MathUtils.randomInt(1, 5);
        
        const type = MathUtils.randomInt(0, 1);
        let latex = '', clues: any[] = [];

        if (type === 0) { // a(x + b) = c
            const inside = x + b;
            const c = a * inside;
            latex = `${a}(x + ${b}) = ${c}`;
            clues = [
                { 
                    text: lang === 'sv' ? `Dividera med ${a} (eller multiplicera in).` : `Divide by ${a} (or expand).`, 
                    latex: `x + ${b} = \\frac{${c}}{${a}} \\implies x + ${b} = ${inside}` 
                },
                { 
                    text: lang === 'sv' ? `Subtrahera ${b}.` : `Subtract ${b}.`, 
                    latex: `x = ${inside} - ${b} = ${x}` 
                }
            ];
        } else { // a(x - b) = c
            const inside = x - b;
            const c = a * inside; // Note: c might be negative if inside < 0, but inputs usually keep it simple
            latex = `${a}(x - ${b}) = ${c}`;
            clues = [
                 { 
                    text: lang === 'sv' ? `Dividera med ${a}.` : `Divide by ${a}.`, 
                    latex: `x - ${b} = \\frac{${c}}{${a}} \\implies x - ${b} = ${inside}` 
                },
                { 
                    text: lang === 'sv' ? `Addera ${b}.` : `Add ${b}.`, 
                    latex: `x = ${inside} + ${b} = ${x}` 
                }
            ];
        }

        return {
            renderData: {
                latex: latex,
                description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.",
                answerType: 'numeric',
                prefix: 'x ='
            },
            token: Buffer.from(x.toString()).toString('base64'),
            serverData: { answer: x.toString(), solutionSteps: clues }
        };
    }

    // --- LEVEL 4: Variables on Both Sides ---
    private level4_BothSides(lang: string): any {
        const x = MathUtils.randomInt(2, 9);
        let a = MathUtils.randomInt(3, 8); // Coeff left
        let c = MathUtils.randomInt(2, a - 1); // Coeff right (ensure smaller than a)
        // Swap occasionally to ensure we don't always have larger coeff on left
        if (Math.random() < 0.5 && c > 1) { 
            // If we swap, we must ensure result is handled, but here we enforce a>c logic 
            // inside the generation to avoid negative coefficient on X step
        }
        
        const type = MathUtils.randomInt(0, 3);
        let latex = '', clues: any[] = []; 

        // Shared Logic: We construct so that a > c, meaning (a-c)x is positive.
        if (a < c) { const t = a; a = c; c = t; }

        if (type === 0) { // ax + b = cx + d
            const b = MathUtils.randomInt(2, 15);
            const d = (a * x + b) - (c * x);
            // If d is invalid/negative, it turns into Type 2 logic, but let's just retry or clamp
            if (d <= 0) return this.level2_TwoStep(lang); 

            latex = `${a}x + ${b} = ${c}x + ${d}`;
            clues = [
                { 
                    text: lang === 'sv' ? `Subtrahera ${c}x från båda sidor.` : `Subtract ${c}x from both sides.`, 
                    latex: `${a-c}x + ${b} = ${d}` 
                },
                { 
                    text: lang === 'sv' ? `Subtrahera ${b} från båda sidor.` : `Subtract ${b} from both sides.`, 
                    latex: `${a-c}x = ${d-b} \\implies x = ${x}` 
                }
            ];
        }
        else if (type === 1) { // ax - b = cx - d
            const b = MathUtils.randomInt(5, 20);
            const d = b - (a*x - c*x);
            if (d <= 0) return this.level2_TwoStep(lang);

            latex = `${a}x - ${b} = ${c}x - ${d}`;
            clues = [
                { 
                    text: lang === 'sv' ? `Subtrahera ${c}x från båda sidor.` : `Subtract ${c}x from both sides.`, 
                    latex: `${a-c}x - ${b} = -${d}` 
                },
                { 
                    text: lang === 'sv' ? `Addera ${b} till båda sidor.` : `Add ${b} to both sides.`, 
                    latex: `${a-c}x = ${b-d} \\implies x = ${x}` 
                }
            ];
        }
        else if (type === 2) { // ax + b = cx - d
             const b = MathUtils.randomInt(2, 10);
             const d = (a*x + b) - (c*x); // Wait, this makes RHS (cx-d). 
             // ax+b = cx - d  => ax-cx = -d - b => (a-c)x = -(d+b). 
             // Since a>c, (a-c) is pos. RHS is neg. X would be neg. We want positive integer X.
             // So this case (PlusLeft, MinusRight) is impossible for positive integer X if a>c.
             // We fallback to Type 0.
             return this.level4_BothSides(lang);
        }
        else { // ax - b = cx + d
            // ax - cx = d + b => (a-c)x = d+b
            const d = MathUtils.randomInt(2, 15);
            const val = (a - c) * x; // This is d + b
            const b = val - d;
            
            if (b <= 0) return this.level2_TwoStep(lang);

            latex = `${a}x - ${b} = ${c}x + ${d}`;
            clues = [
                 { 
                    text: lang === 'sv' ? `Subtrahera ${c}x från båda sidor.` : `Subtract ${c}x from both sides.`, 
                    latex: `${a-c}x - ${b} = ${d}` 
                },
                 { 
                    text: lang === 'sv' ? `Addera ${b} till båda sidor.` : `Add ${b} to both sides.`, 
                    latex: `${a-c}x = ${d+b} \\implies x = ${x}` 
                }
            ];
        }

        return {
            renderData: {
                latex: latex,
                description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.",
                answerType: 'numeric',
                prefix: 'x ='
            },
            token: Buffer.from(x.toString()).toString('base64'),
            serverData: { answer: x.toString(), solutionSteps: clues }
        };
    }

    private level7_Mixed(lang: string): any {
        const subLevel = MathUtils.randomInt(1, 6);
        return this.generate(subLevel, lang);
    }
}