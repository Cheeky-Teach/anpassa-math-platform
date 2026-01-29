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
                text: lang === 'sv' 
                    ? `Vi vill ha x ensamt. Eftersom x är delat med ${k}, gör vi det motsatta: vi multiplicerar med ${k}.` 
                    : `We want x alone. Since x is divided by ${k}, we do the opposite: multiply by ${k}.`, 
                latex: `x = ${res} \\cdot ${k} \\\\ x = ${val}` 
            }];
        } 
        else if (type === 2) { // k * x = res
            const k = MathUtils.randomInt(2, 9);
            const val = MathUtils.randomInt(2, 10);
            const res = k * val;
            latex = `${k}x = ${res}`;
            answer = val.toString();
            clues = [{ 
                text: lang === 'sv' 
                    ? `Vi vill ha x ensamt. Eftersom x är multiplicerat med ${k}, gör vi det motsatta: vi dividerar med ${k}.` 
                    : `We want x alone. Since x is multiplied by ${k}, we do the opposite: divide by ${k}.`, 
                latex: `x = \\frac{${res}}{${k}} \\\\ x = ${val}` 
            }];
        } 
        else if (type === 3) { // x + k = res
            const k = MathUtils.randomInt(1, 20);
            const val = MathUtils.randomInt(1, 20);
            const res = val + k;
            latex = `x + ${k} = ${res}`;
            answer = val.toString();
            clues = [{ 
                text: lang === 'sv' 
                    ? `Vi vill ha x ensamt. Här står plus ${k}, så vi gör det motsatta: vi subtraherar ${k}.` 
                    : `We want x alone. It says plus ${k}, so we do the opposite: subtract ${k}.`, 
                latex: `x = ${res} - ${k} \\\\ x = ${val}` 
            }];
        } 
        else { // x - k = res
            const k = MathUtils.randomInt(1, 20);
            const val = MathUtils.randomInt(1, 20);
            const res = val - k;
            latex = `x - ${k} = ${res}`;
            answer = val.toString();
            clues = [{ 
                text: lang === 'sv' 
                    ? `Vi vill ha x ensamt. Här står minus ${k}, så vi gör det motsatta: vi adderar ${k}.` 
                    : `We want x alone. It says minus ${k}, so we do the opposite: add ${k}.`, 
                latex: `x = ${res} + ${k} \\\\ x = ${val}` 
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
                { 
                    text: lang === 'sv' 
                        ? `Först måste vi få termen med x ensam. Vi tar bort ${b} genom att subtrahera det.` 
                        : `First isolate the x-term. Remove ${b} by subtracting it.`, 
                    latex: `${a}x = ${c} - ${b} \\\\ ${a}x = ${c-b}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Nu sitter ${a} ihop med x (gånger). Vi dividerar med ${a} för att få svaret.` 
                        : `Now ${a} is multiplied by x. Divide by ${a} to get the answer.`, 
                    latex: `x = \\frac{${c-b}}{${a}} \\\\ x = ${x}` 
                }
            ];
        }
        else if (type === 2) { // ax - b = c
            const a = MathUtils.randomInt(2, 9);
            const b = MathUtils.randomInt(1, 15);
            const c = a * x - b;
            latex = `${a}x - ${b} = ${c}`;
            clues = [
                { 
                    text: lang === 'sv' 
                        ? `Först måste vi få termen med x ensam. Vi tar bort minus ${b} genom att addera ${b}.` 
                        : `First isolate the x-term. Remove minus ${b} by adding ${b}.`, 
                    latex: `${a}x = ${c} + ${b} \\\\ ${a}x = ${c+b}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Nu dividerar vi med ${a} för att få fram x.` 
                        : `Now divide by ${a} to find x.`, 
                    latex: `x = \\frac{${c+b}}{${a}} \\\\ x = ${x}` 
                }
            ];
        }
        else if (type === 3) { // x/a + b = c
            const a = MathUtils.randomInt(2, 8);
            const b = MathUtils.randomInt(1, 10);
            const realX = x * a; 
            const c = x + b; 
            latex = `\\frac{x}{${a}} + ${b} = ${c}`;
            answer = realX.toString();
            clues = [
                { 
                    text: lang === 'sv' 
                        ? `Vi börjar med att isolera x-termen. Subtrahera ${b} från båda sidor.` 
                        : `Start by isolating the x-term. Subtract ${b} from both sides.`, 
                    latex: `\\frac{x}{${a}} = ${c} - ${b} \\\\ \\frac{x}{${a}} = ${c-b}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `För att bli av med divisionen multiplicerar vi med ${a}.` 
                        : `To remove the division, multiply by ${a}.`, 
                    latex: `x = ${c-b} \\cdot ${a} \\\\ x = ${realX}` 
                }
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
                { 
                    text: lang === 'sv' 
                        ? `Isolera x-termen genom att addera ${b} på båda sidor.` 
                        : `Isolate the x-term by adding ${b} to both sides.`, 
                    latex: `\\frac{x}{${a}} = ${c} + ${b} \\\\ \\frac{x}{${a}} = ${c+b}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Multiplicera med ${a} för att få x ensamt.` 
                        : `Multiply by ${a} to get x alone.`, 
                    latex: `x = ${c+b} \\cdot ${a} \\\\ x = ${realX}` 
                }
            ];
        }

        return {
            renderData: { latex, description: lang === 'sv' ? "Lös ekvationen" : "Solve the equation", answerType: 'text' },
            token: Buffer.from(answer).toString('base64'),
            clues
        };
    }

    // --- LEVEL 3: Parentheses ---
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
                { 
                    text: lang === 'sv' 
                        ? `Vi börjar med att multiplicera in ${a} i parentesen (distribuera).` 
                        : `Start by multiplying ${a} into the parentheses (distribute).`, 
                    latex: `${a} \\cdot x + ${a} \\cdot ${b} = ${c} \\\\ ${a}x + ${a*b} = ${c}` 
                },
                { 
                    text: lang === 'sv' 
                        ? "Nu löser vi ekvationen som vanligt. Subtrahera konstanten och dela sedan." 
                        : "Now solve as usual. Subtract the constant then divide.", 
                    latex: `${a}x = ${c - a*b} \\\\ x = ${x}` 
                }
            ];
        }
        else if (type === 2) { // a(x - b) = c
            const x = MathUtils.randomInt(5, 15);
            const b = MathUtils.randomInt(1, x - 1);
            const c = a * (x - b);
            answer = x.toString();
            latex = `${a}(x - ${b}) = ${c}`;
            clues = [
                { 
                    text: lang === 'sv' 
                        ? `Multiplicera in ${a} i parentesen. Kom ihåg minustecknet.` 
                        : `Multiply ${a} into the parentheses. Remember the minus sign.`, 
                    latex: `${a} \\cdot x - ${a} \\cdot ${b} = ${c} \\\\ ${a}x - ${a*b} = ${c}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Addera ${a*b} till båda sidor och dela sedan.` 
                        : `Add ${a*b} to both sides and then divide.`, 
                    latex: `${a}x = ${c + a*b} \\\\ x = ${x}` 
                }
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
                { 
                    text: lang === 'sv' 
                        ? `Multiplicera in ${a} med båda termerna i parentesen.` 
                        : `Multiply ${a} with both terms in the parentheses.`, 
                    latex: `${a} \\cdot ${bVar}x - ${a} \\cdot ${cVar} = ${d} \\\\ ${a*bVar}x - ${a*cVar} = ${d}` 
                },
                { 
                    text: lang === 'sv' 
                        ? "Addera konstanten och dela med koefficienten." 
                        : "Add the constant and divide by the coefficient.", 
                    latex: `${a*bVar}x = ${d + a*cVar} \\\\ x = ${x}` 
                }
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
                { 
                    text: lang === 'sv' 
                        ? `Multiplicera in ${a} i parentesen.` 
                        : `Distribute ${a} into the parentheses.`, 
                    latex: `${a} \\cdot ${bVar}x + ${a} \\cdot ${cVar} = ${d} \\\\ ${a*bVar}x + ${a*cVar} = ${d}` 
                },
                { 
                    text: lang === 'sv' 
                        ? "Subtrahera konstanten och dela med koefficienten." 
                        : "Subtract the constant and divide by the coefficient.", 
                    latex: `${a*bVar}x = ${d - a*cVar} \\\\ x = ${x}` 
                }
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
        let c = MathUtils.randomInt(2, a - 1); 
        if (a === c) a++;

        let latex = '', answer = x.toString(), clues = [];

        if (type === 1) { // ax + b = cx + d
            const b = MathUtils.randomInt(1, 15);
            const d = a*x + b - c*x;
            if (d <= 0) return this.level4_BothSides(lang); 

            latex = `${a}x + ${b} = ${c}x + ${d}`;
            clues = [
                { 
                    text: lang === 'sv' 
                        ? `Vi vill samla alla x på ena sidan. Vi subtraherar ${c}x från båda sidor.` 
                        : `Gather all x on one side. Subtract ${c}x from both sides.`, 
                    latex: `${a}x - ${c}x + ${b} = ${d} \\\\ ${a-c}x + ${b} = ${d}` 
                },
                { 
                    text: lang === 'sv' 
                        ? "Nu är det en vanlig ekvation. Flytta över konstanten och lös ut x." 
                        : "Now solve as usual. Move the constant and solve for x.", 
                    latex: `${a-c}x = ${d} - ${b} \\\\ x = ${x}` 
                }
            ];
        }
        else if (type === 2) { // ax - b = cx + d
            const b = MathUtils.randomInt(1, 15);
            const d = a*x - b - c*x;
            if (d <= 0) return this.level4_BothSides(lang);

            latex = `${a}x - ${b} = ${c}x + ${d}`;
            clues = [
                { 
                    text: lang === 'sv' 
                        ? `Subtrahera ${c}x från båda sidor för att samla x.` 
                        : `Subtract ${c}x from both sides to gather x.`, 
                    latex: `${a}x - ${c}x - ${b} = ${d} \\\\ ${a-c}x - ${b} = ${d}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Addera ${b} till båda sidor och lös ut x.` 
                        : `Add ${b} to both sides and solve for x.`, 
                    latex: `${a-c}x = ${d} + ${b} \\\\ x = ${x}` 
                }
            ];
        }
        else if (type === 3) { // ax + b = cx - d
            const temp = a; a = c; c = temp; 
            const b = MathUtils.randomInt(1, 15);
            const d = c*x - a*x - b; 
            if (d <= 0) return this.level4_BothSides(lang); 

            latex = `${a}x + ${b} = ${c}x - ${d}`;
            clues = [
                { 
                    text: lang === 'sv' 
                        ? `Subtrahera ${a}x från båda sidor (för att hålla x positivt).` 
                        : `Subtract ${a}x from both sides (to keep x positive).`, 
                    latex: `${b} = ${c}x - ${a}x - ${d} \\\\ ${b} = ${c-a}x - ${d}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Addera ${d} till båda sidor.` 
                        : `Add ${d} to both sides.`, 
                    latex: `${b} + ${d} = ${c-a}x \\\\ x = ${x}` 
                }
            ];
        }
        else { // ax - b = cx - d
            if (a < c) { const t = a; a = c; c = t; }
            const b = MathUtils.randomInt(5, 20);
            const d = b - (a*x - c*x);
            if (d <= 0) return this.level4_BothSides(lang);

            latex = `${a}x - ${b} = ${c}x - ${d}`;
            clues = [
                { 
                    text: lang === 'sv' 
                        ? `Subtrahera ${c}x från båda sidor.` 
                        : `Subtract ${c}x from both sides.`, 
                    latex: `${a}x - ${c}x - ${b} = -${d} \\\\ ${a-c}x - ${b} = -${d}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Addera ${b} till båda sidor.` 
                        : `Add ${b} to both sides.`, 
                    latex: `${a-c}x = -${d} + ${b} \\\\ x = ${x}` 
                }
            ];
        }

        return {
            renderData: { latex, description: lang === 'sv' ? "Lös ekvationen" : "Solve the equation", answerType: 'text' },
            token: Buffer.from(answer).toString('base64'),
            clues
        };
    }

    private level7_Mixed(lang: string): any {
        return this.generate(MathUtils.randomInt(1, 4), lang);
    }
}